/**=========================================================
 * Module: LoginController.js
 * Controller for the Chat APP 
 =========================================================*/

(function () {
    'use strict';

    angular
        .module('eServices')
        .controller('MediaLicenseRenewController', MediaLicenseRenewController);

    function MediaLicenseRenewController($rootScope, $scope, $http, $stateParams, $state, $window, $uibModal, UserProfile, browser, DTOptionsBuilder, DTColumnBuilder, $compile, $filter) {
        var vm = this;

        vm.goToSecondStep = function () {
            vm.activeStep = 2;
        }

        vm.goToThirdStep = function () {
            vm.activeStep = 3;
        }

        vm.previousToSecondStep = function () {
            vm.activeStep = 2;
            vm.returnBack = true;
            vm.loop2 = false;
        }

        vm.previousToFirstStep = function () {
            vm.activeStep = 1;
            vm.returnBack = true;
            vm.loop2 = false;
        }

        vm.translateFilter = $filter('translate');

        vm.Init = function () {
            vm.isBusy = false;
            vm.isExternalMediaAccount = false;
            vm.activeStep = 1;
            vm.serviceFeesObj = { serviceId: 9, serviceFee: [], isRenew: true };
            vm.terms = {};
            vm.user = UserProfile.getProfile();
            vm.mediaLicenses.selectActivities = [];
            vm.serviceFeesObj.economicActivityIds = [];
            vm.establishmentId = (vm.user.userTypeCode == '01' ? "" : vm.mediaLicenses.applicationDetail.application.establishment.id);
            vm.happinessMeterObj = {};
            vm.happinessMeterObj.serviceId = 9;
            vm.happinessMeterObj.applicationType = {};
            vm.happinessMeterObj.applicationType.pmoCode = "001";

            if (vm.editMode) {
                $http.get($rootScope.app.httpSource + 'api/EconomicActivity/GetAllowedEconomicActivity?applicationId=' + vm.mediaLicenses.applicationDetail.application.id)
                    .then(function (response) {
                        vm.mediaLicenses.economicActivities = response.data;
                    });

                if (vm.mediaLicenses.applicationDetail.applicationStatusId == 1 && vm.user.userTypeCode != "06" && vm.mediaLicenses.applicationDetail.actionsTakens.length > 1) {
                    if (vm.mediaLicenses.applicationDetail.actionsTakens[vm.mediaLicenses.applicationDetail.actionsTakens.length - 1].transition.actionId == 6 &&
                        vm.mediaLicenses.applicationDetail.actionsTakens[vm.mediaLicenses.applicationDetail.actionsTakens.length - 1].note != "") {
                        vm.employeeNote = vm.mediaLicenses.applicationDetail.actionsTakens[vm.mediaLicenses.applicationDetail.actionsTakens.length - 1].note;
                        vm.employeeNoteDate = moment(vm.mediaLicenses.applicationDetail.actionsTakens[vm.mediaLicenses.applicationDetail.actionsTakens.length - 1].actionDate).format("dddd, MMMM Do YYYY, h:mm:ss a");
                    }
                }
            }
            else {
                $http.get($rootScope.app.httpSource + 'api/EconomicActivity')
                    .then(function (response) {
                        vm.mediaLicenses.economicActivities = response.data;
                    });
            }

            if (vm.mediaLicenses.applicationDetail.payments[0].paymentDetails.length > 0) {
                for (var id in vm.mediaLicenses.applicationDetail.payments[0].paymentDetails) {
                    if (vm.mediaLicenses.applicationDetail.payments[0].paymentDetails[id].economicActivity) {
                        vm.mediaLicenses.selectActivities.push(vm.mediaLicenses.applicationDetail.payments[0].paymentDetails[id].economicActivity);
                        vm.serviceFeesObj.economicActivityIds.push(vm.mediaLicenses.applicationDetail.payments[0].paymentDetails[id].economicActivity.id);
                    }
                }
            }
            else {
                for (var i = 0; i < vm.mediaLicenses.mediaLicenseEconomicActivities.length; i++) {
                    if (vm.mediaLicenses.mediaLicenseEconomicActivities[i].economicActivity) {
                        vm.mediaLicenses.selectActivities.push(vm.mediaLicenses.mediaLicenseEconomicActivities[i].economicActivity);
                        vm.serviceFeesObj.economicActivityIds.push(vm.mediaLicenses.mediaLicenseEconomicActivities[i].economicActivity.id);
                    }
                }
            }

            vm.requireAquitanceForm = false;

            for (var i = 0; i < vm.mediaLicenses.selectActivities.length; i++) {
                if (vm.mediaLicenses.selectActivities[i].isRequireThirdPartyApproval) {
                    vm.requireAquitanceForm = true;
                    break;
                }
            }

            if (!vm.externalMediaAccountActivities) {
                vm.externalMediaAccountActivities = [];
            }

            for (var i = 0; i < vm.mediaLicenses.selectActivities.length; i++) {
                if (vm.mediaLicenses.selectActivities[i].code == "59" || vm.mediaLicenses.selectActivities[i].code == "60" || vm.mediaLicenses.selectActivities[i].code == "61" || vm.mediaLicenses.selectActivities[i].code == "62" ||
                    vm.mediaLicenses.selectActivities[i].code == "63" || vm.mediaLicenses.selectActivities[i].code == "66") {
                    var economicActivity = $filter('filter')(vm.externalMediaAccountActivities, { economicActivity: { id: vm.mediaLicenses.selectActivities[i].id } }, true)[0];
                    if (!economicActivity && !vm.editMode) {
                        var externalMediaAccountActivity = {};
                        externalMediaAccountActivity.economicActivity = vm.mediaLicenses.selectActivities[i];
                        vm.externalMediaAccountActivities.push(externalMediaAccountActivity);
                    }
                    vm.isExternalMediaAccount = true;
                    break;
                }
            }

            if (vm.user && vm.user.userTypeCode == "03") {
                vm.activeStep = 2;
            }
        };

        vm.user = UserProfile.getProfile();

        if (vm.user.userTypeCode == '01') {
            vm.isIndividual = true;
            vm.isExternalMediaAccount = true;
            vm.isAllowedForIndividual = true;

            $http.get($rootScope.app.httpSource + 'api/UserProfile')
                .then(function (resp) {
                    if (resp.data != null) {
                        vm.mediaLicenses.applicationDetail.application.user = {};
                        vm.mediaLicenses.applicationDetail.application.user.userProfiles = [];
                        resp.data.person.dateOfBirth = new Date(resp.data.person.dateOfBirth);
                        resp.data.user.lastLoginDate = new Date(resp.data.user.lastLoginDate);
                        vm.mediaLicenses.applicationDetail.application.user.userProfiles.push(resp.data);

                        $http.get($rootScope.app.httpSource + 'api/Community/GetByCommunityId?Id=' + resp.data.address.communityId)
                            .then(function (resp) {
                                vm.mediaLicenses.applicationDetail.application.user.userProfiles[0].address.emirate = resp.data;
                            },
                                function (response) { });
                    }
                },
                    function (response) { });
        }
        else if (vm.user.userTypeCode == '11') {
            vm.isIndividual = false;
            vm.isForSPC = true;
        }
        else {
            vm.isIndividual = false;
        }

        //New Form Condition
        if ($state.params === undefined || $state.params.edit === undefined || $state.params.edit === "") {
            vm.editMode = false;

            vm.mediaLicenses = {
                applicationDetail: {
                    payments: [{
                        paymentDetails: []
                    }],
                    browser: {
                        name: browser.name
                    },
                    platform: {
                        name: browser.platform
                    },
                    versionNumber: browser.versionNumber,
                    application: {
                        serviceId: 9,
                        id: $state.params.applicationId
                    }
                }
            };

            $http.get($rootScope.app.httpSource + 'api/MediaLicense/GetByApplicationId?id=' + $state.params.applicationId)
                .then(function (response) {
                    vm.mediaLicenses.applicationDetail.application.establishment = response.data.applicationDetail.application.establishment;
                    vm.mediaLicenses.mediaLicenseNumber = response.data.mediaLicenseNumber;
                    vm.mediaLicenses.mediaLicenseEconomicActivities = $filter('filter')(response.data.mediaLicenseEconomicActivities, { cancelledDate: null }, true);

                    if (response.data.applicationDetail.payments.length < 0) {
                        for (var i = 0; i < response.data.applicationDetail.payments[0].paymentDetails.length; i++) {
                            if (response.data.applicationDetail.payments[0].paymentDetails[i].economicActivity) {
                                vm.mediaLicenses.applicationDetail.payments[0].paymentDetails.push(response.data.applicationDetail.payments[0].paymentDetails[i]);
                            }
                        }
                    }

                    $http.get($rootScope.app.httpSource + 'api/ApplicationDetail/GetApplicationDetailsByApplicationId?id=' + $state.params.applicationId)
                        .then(function (resp) {
                            response.data.applicationDetail.application.applicationDetails = resp.data;
                            for (var i = 0; i < response.data.applicationDetail.application.applicationDetails.length; i++) {
                                if (response.data.applicationDetail.application.applicationDetails[i].certificates.length > 0) {
                                    for (var j = 0; j < response.data.mediaLicenseEconomicActivities.length; j++) {
                                        var mediaLicenseEconomicActivity = $filter('filter')(response.data.applicationDetail.application.applicationDetails[i].certificates[0].certificateDetails,
                                            { mediaLicenseEconomicActivityId: response.data.mediaLicenseEconomicActivities[j].id }, true)[0];

                                        if (mediaLicenseEconomicActivity) {
                                            vm.expiryDate = mediaLicenseEconomicActivity.expiryDate;
                                            vm.mediaLicenses.yearsOfLicense = 1;
                                            vm.renewDate = moment(mediaLicenseEconomicActivity.expiryDate).add(1, 'day').format("DD-MMMM-YYYY");
                                            vm.endDate = moment(moment(mediaLicenseEconomicActivity.expiryDate)).add(vm.mediaLicenses.yearsOfLicense, 'years').format("DD-MMMM-YYYY");
                                            break;
                                        }
                                    }
                                }
                            }

                            //for (var k = 0; k < response.data.mediaLicenseEconomicActivities.length; k++) {
                            //    vm.externalMediaAccountActivities = [];
                            //    if (response.data.mediaLicenseEconomicActivities[k].mediaLicenseEconomicActivityExternalMediaAccounts.length > 0) {
                            //        var externalMediaAccountActivity = {};
                            //        externalMediaAccountActivity.economicActivity = response.data.mediaLicenseEconomicActivities[k].economicActivity;
                            //        externalMediaAccountActivity.mediaLicenseEconomicActivityExternalMediaAccounts = response.data.mediaLicenseEconomicActivities[k].mediaLicenseEconomicActivityExternalMediaAccounts;
                            //        vm.externalMediaAccountActivities.push(externalMediaAccountActivity);
                            //    }
                            //}

                            vm.Init();
                        });
                });
        }
        else {
            //Get the details of the submitted Form to edit
            $http.get($rootScope.app.httpSource + 'api/MediaLicense/GetById?id=' + $state.params.applicationDetailId)
                .then(function (response) {
                    vm.editMode = true;
                    vm.mediaLicenses = response.data;
                    vm.mediaLicenses.applicationDetail.application.establishment = response.data.applicationDetail.application.establishment;
                    vm.mediaLicenses.mediaLicenseNumber = response.data.mediaLicenseNumber;
                    vm.mediaLicenses.mediaLicenseEconomicActivities = response.data.mediaLicenseEconomicActivities;

                    if (response.data.applicationDetail.payments.length < 0) {
                        for (var i = 0; i < response.data.applicationDetail.payments[0].paymentDetails.length; i++) {
                            if (response.data.applicationDetail.payments[0].paymentDetails[i].economicActivity) {
                                vm.mediaLicenses.applicationDetail.payments[0].paymentDetails.push(response.data.applicationDetail.payments[0].paymentDetails[i]);
                            }
                        }
                    }

                    //vm.externalMediaAccountActivities = [];
                    //for (var i = 0; i < vm.mediaLicenses.mediaLicenseEconomicActivities.length; i++) {
                    //    if (vm.mediaLicenses.mediaLicenseEconomicActivities[i].mediaLicenseEconomicActivityExternalMediaAccounts.length > 0) {
                    //        var externalMediaAccountActivity = {};
                    //        externalMediaAccountActivity.economicActivity = vm.mediaLicenses.mediaLicenseEconomicActivities[i].economicActivity;
                    //        externalMediaAccountActivity.mediaLicenseEconomicActivityExternalMediaAccounts = vm.mediaLicenses.mediaLicenseEconomicActivities[i].mediaLicenseEconomicActivityExternalMediaAccounts;
                    //        vm.externalMediaAccountActivities.push(externalMediaAccountActivity);
                    //    }
                    //}

                    $http.get($rootScope.app.httpSource + 'api/ApplicationDetail/GetApplicationDetailsByApplicationId?id=' + $state.params.applicationId)
                        .then(function (resp) {
                            response.data.applicationDetail.application.applicationDetails = resp.data;
                            for (var i = 0; i < response.data.applicationDetail.application.applicationDetails.length; i++) {
                                if (response.data.applicationDetail.application.applicationDetails[i].certificates.length > 0) {
                                    for (var j = 0; j < response.data.mediaLicenseEconomicActivities.length; j++) {

                                        var mediaLicenseEconomicActivity = $filter('filter')(response.data.applicationDetail.application.applicationDetails[i].certificates[0].certificateDetails,
                                            { mediaLicenseEconomicActivity: { economicActivityId: response.data.mediaLicenseEconomicActivities[j].economicActivityId } }, true)[0];

                                        if (mediaLicenseEconomicActivity) {
                                            vm.expiryDate = mediaLicenseEconomicActivity.expiryDate;
                                            vm.mediaLicenses.yearsOfLicense = 1;
                                            vm.renewDate = moment(mediaLicenseEconomicActivity.expiryDate).add(1, 'day').format("DD-MMMM-YYYY");
                                            vm.endDate = moment(moment(mediaLicenseEconomicActivity.expiryDate)).add(vm.mediaLicenses.yearsOfLicense, 'years').format("DD-MMMM-YYYY");
                                            break;
                                        }
                                    }
                                }
                            }

                            vm.Init();
                        });
                });
        }
        //Save the details to the server

        vm.save = function (applicationStatusId) {
            vm.isBusy = true;
            vm.mediaLicenses.applicationDetailId = 0;

            if (vm.serviceFeesObj.serviceFee[0] != null) {
                vm.mediaLicenses.applicationDetail.payments[0].paymentDetails = vm.serviceFeesObj.serviceFee;
            }
            else {
                vm.mediaLicenses.applicationDetail.payments = null;
            }

            if ($rootScope.app.isPMOHappiness) {
                switch (applicationStatusId) {
                    case 1:
                        $http.post($rootScope.app.httpSource + 'api/MediaLicense/SaveMediaLicense', vm.mediaLicenses)
                            .then(function (response) {
                                if (response.data == "false") {
                                    vm.EmritIdRepeated = true;
                                    vm.isBusy = false;
                                }
                                else {
                                    vm.EmritIdRepeated = false;
                                    vm.happinessMeterObj.transactionId = response.data;
                                    vm.showHappinessMeter = true;
                                }
                            },
                                function (response) { // optional
                                    vm.isBusy = false;
                                });

                        break;

                    case 2:
                        $http.post($rootScope.app.httpSource + 'api/MediaLicense/SubmitMediaLicense', vm.mediaLicenses)
                            .then(function (response) {
                                vm.happinessMeterObj.transactionId = response.data;
                                vm.showHappinessMeter = true;
                            },
                                function (response) { // optional
                                    vm.isBusy = false;
                                });

                        break;
                }
            }
            else {
                var modalInstance = $uibModal.open({
                    templateUrl: 'app/views/Controls/happinessRating/happinessRating.html',
                    controller: 'HappinessRatingController',
                    size: 'lg',
                    keyboard: false,
                    backdrop: 'static'
                });

                modalInstance.result.then(function (happinessRate) {
                    vm.mediaLicenses.applicationDetail.happinessRate = happinessRate;

                    //Post to save
                    switch (applicationStatusId) {
                        case 1:
                            $http.post($rootScope.app.httpSource + 'api/MediaLicense/SaveMediaLicense', vm.mediaLicenses)
                                .then(function (response) {
                                    if (response.data == "false") {
                                        vm.EmritIdRepeated = true;
                                        vm.isBusy = false;
                                    }
                                    else {
                                        vm.EmritIdRepeated = false;
                                        $state.go('app.dashboard');
                                    }
                                },
                                    function (response) { // optional
                                        vm.isBusy = false;
                                    });
                            break;

                        case 2:
                            $http.post($rootScope.app.httpSource + 'api/MediaLicense/SubmitMediaLicense', vm.mediaLicenses)
                                .then(function (response) {
                                    $state.go('app.dashboard');
                                },
                                    function (response) { // optional
                                        vm.isBusy = false;
                                    });
                            break;
                    }
                });
            }
        }

        vm.workflowClick = function (actionId) {
            vm.isBusy = true;
            //vm.mediaLicenses.applicationDetail.payments[0].paymentDetails = vm.serviceFeesObj.serviceFee;

            switch (actionId) {

                case 1:
                    $http.post($rootScope.app.httpSource + 'api/MediaLicense/UpdateMediaLicense', vm.mediaLicenses)
                        .then(function (response) {
                            $state.go('app.dashboard');
                        },
                            function (response) { // optional
                                vm.isBusy = false;
                            });
                    break;

                case 2:
                    $http.post($rootScope.app.httpSource + 'api/MediaLicense/SubmitUpdateMediaLicense', vm.mediaLicenses)
                        .then(function (response) {
                            $state.go('app.dashboard');
                        },
                            function (response) { // optional
                                vm.isBusy = false;
                            });
                    break;
            }
        }
    }

    MediaLicenseRenewController.$inject = ['$rootScope', '$scope', '$http', '$stateParams', '$state', '$window', '$uibModal', 'UserProfile', 'browser', 'DTOptionsBuilder', 'DTColumnBuilder',
        '$compile', '$filter'];
})();