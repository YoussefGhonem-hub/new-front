/**=========================================================
 * Module: LoginController.js
 * Controller for the Chat APP 
 =========================================================*/

(function () {
    'use strict';

    angular
        .module('eServices')
        .controller('socialMediaLicenseController', socialMediaLicenseController);

    function socialMediaLicenseController($rootScope, $scope, $http, $stateParams, $state, $window, $uibModal, UserProfile, browser, DTOptionsBuilder, DTColumnBuilder, $compile, $filter) {
        var vm = this;
        vm.serviceFeesObj = { serviceId: 9, serviceFee: [], isRenew: false };


        vm.goToSecondStep = function () {
            vm.activeStep = 2;
        }

        vm.goToThirdStep = function () {
            if (vm.isExternalMediaAccount) {
                if (!vm.externalMediaAccountActivities || vm.externalMediaAccountActivities.length == 0) {
                    vm.noExternalMediaAccountActivities = true;
                }
                else if (vm.externalMediaAccountActivities.length > 0) {
                    for (var i = 0; i < vm.externalMediaAccountActivities.length; i++) {
                        if (vm.externalMediaAccountActivities[i].mediaLicenseEconomicActivityExternalMediaAccounts.length == 0) {
                            vm.noExternalMediaAccountActivities = true;
                            break;
                        }
                        else {
                            vm.noExternalMediaAccountActivities = false;
                        }
                    }

                    if (!vm.noExternalMediaAccountActivities) {
                        vm.activeStep = 3;
                    }
                }
                else {
                    vm.noExternalMediaAccountActivities = false;
                    vm.activeStep = 3;
                }
            }
            else {
                vm.activeStep = 4;
            }
        }

        vm.goToFourthStep = function () {
            vm.activeStep = 4;
        }

        vm.previousToThirdStep = function () {
            if (vm.isExternalMediaAccount) {
                vm.activeStep = 3;
            }
            else {
                vm.activeStep = 2;
            }
        }

        vm.previousToSecondStep = function () {
            vm.activeStep = 2;
        }

        vm.previousToFirstStep = function () {
            vm.activeStep = 1;
        }

        vm.translateFilter = $filter('translate');

        vm.Init = function () {
            vm.isBusy = false;
            vm.isExternalMediaAccount = false;
            vm.terms = {};
            vm.activeStep = 1;
            vm.editOnly = false;
            vm.forService = true;
            vm.happinessMeterObj = {};
            vm.happinessMeterObj.serviceId = 9;
            vm.happinessMeterObj.applicationType = {};
            vm.happinessMeterObj.applicationType.pmoCode = "000";
            vm.selected = false;
            vm.isSocialLicense = false;

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

                if (vm.mediaLicenses.applicationDetail.applicationTypeId == 3) {
                    vm.editOnly = true;
                    vm.forService = false;
                }

                vm.establishmentId = (vm.mediaLicenses.applicationDetail.application.establishment != null ? vm.mediaLicenses.applicationDetail.application.establishment.id : null);
            }
            else {
                $http.get($rootScope.app.httpSource + 'api/EconomicActivity')
                    .then(function (response) {
                        vm.mediaLicenses.economicActivities = response.data;
                        vm.mediaLicenses.selectedActivity = [];

                        //set different economic activity for individual and commercial
                        if (vm.user.userTypeCode == '01') {
                            var item = vm.mediaLicenses.economicActivities.filter(p => p.code == '63');
                            vm.mediaLicenses.selectedActivity.push(item[0]);
                        }
                        else {
                            var item = vm.mediaLicenses.economicActivities.filter(p => p.code == '66');
                            vm.mediaLicenses.selectedActivity.push(item[0]);
                        }

                        if (vm.mediaLicenses.selectedActivity != null) {
                            vm.selected = true;
                        }
                    });
                vm.establishmentId = $state.params.establishmentId;
            }

            $scope.$watch('mediaCtl.mediaLicenses.selectedActivity', function (newVal, oldVal) {
                if (newVal) {
                    vm.serviceFeesObj.economicActivityIds = [];

                    if (!vm.externalMediaAccountActivities) {
                        vm.externalMediaAccountActivities = [];
                    }

                    vm.isExternalMediaAccount = false;

                    for (var i = 0; i < newVal.length; i++) {
                        if (newVal[i].code == "63" || newVal[i].code == "66") {
                            vm.serviceFeesObj.economicActivityIds.push(newVal[i].id);
                            vm.isSocialLicense = true;
                        }

                        if (newVal[i].code == "59" || newVal[i].code == "60" || newVal[i].code == "61" || newVal[i].code == "62" || newVal[i].code == "63" || newVal[i].code == "66") {
                            var economicActivity = $filter('filter')(vm.externalMediaAccountActivities, { economicActivity: { id: newVal[i].id } }, true)[0];
                            if (!economicActivity && !vm.editMode) {
                                var externalMediaAccountActivity = {};
                                externalMediaAccountActivity.economicActivity = newVal[i];
                                vm.externalMediaAccountActivities.push(externalMediaAccountActivity);
                            }
                            vm.isExternalMediaAccount = true;
                        }
                    }
                    //vm.serviceFeesObj.reloadTable();

                    vm.requireAquitanceForm = false;
                    for (var i = 0; i < newVal.length; i++) {
                        if (newVal[i].isRequireThirdPartyApproval) {
                            vm.requireAquitanceForm = true;
                            break;
                        }
                    }
                }
            });

            if (vm.user && vm.user.userTypeCode == "03") {
                vm.activeStep = 2;
            }
        };

        //New Form Condition
        if ($state.params === undefined || $state.params.id === undefined || $state.params.id === "") {

            vm.editMode = false;
            // New Permit
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
                        serviceId: 9
                    }
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
                vm.mediaLicenses.applicationDetail.application.establishment = {};
                $http.get($rootScope.app.httpSource + 'api/Establishment/GetById?id=' + $state.params.establishmentId)
                    .then(function (response) {
                        vm.mediaLicenses.applicationDetail.application.establishment = response.data;
                    });
            }
            else {
                vm.isIndividual = false;
                vm.mediaLicenses.applicationDetail.application.establishment = {};
                $http.get($rootScope.app.httpSource + 'api/Establishment/GetById?id=' + $state.params.establishmentId)
                    .then(function (response) {
                        vm.mediaLicenses.applicationDetail.application.establishment = response.data;
                    });

                $http.get($rootScope.app.httpSource + 'api/UserProfile')
                    .then(function (resp) {
                        if (resp.data != null) {
                            vm.mediaLicenses.person = resp.data.person;
                        }
                    });
            }

            vm.Init();
        }
        else {
            //Get the details of the submitted Form to edit
            $http.get($rootScope.app.httpSource + 'api/MediaLicense/GetById?id=' + $state.params.id)
                .then(function (response) {
                    vm.editMode = true;
                    vm.mediaLicenses = response.data;
                    vm.mediaLicenses.applicationDetail.application.user.userProfiles[0].person.tradeLicenseEndDate = new Date(vm.mediaLicenses.applicationDetail.application.user.userProfiles[0].person.tradeLicenseEndDate);
                    vm.externalMediaAccountActivities = [];
                    for (var i = 0; i < vm.mediaLicenses.mediaLicenseEconomicActivities.length; i++) {
                        if (vm.mediaLicenses.mediaLicenseEconomicActivities[i].mediaLicenseEconomicActivityExternalMediaAccounts.length > 0) {
                            var externalMediaAccountActivity = {};
                            externalMediaAccountActivity.economicActivity = vm.mediaLicenses.mediaLicenseEconomicActivities[i].economicActivity;
                            externalMediaAccountActivity.mediaLicenseEconomicActivityExternalMediaAccounts = vm.mediaLicenses.mediaLicenseEconomicActivities[i].mediaLicenseEconomicActivityExternalMediaAccounts;
                            vm.externalMediaAccountActivities.push(externalMediaAccountActivity);
                        }
                    }

                    vm.user = UserProfile.getProfile();
                    if (vm.user.userTypeCode == '01') {
                        vm.isIndividual = true;
                        vm.isExternalMediaAccount = true;
                        vm.isAllowedForIndividual = true;
                    }
                    else {
                        vm.isIndividual = false;
                    }

                    vm.Init();
                });
        }

        vm.isChecked = function (isChecked) {
            if (!isChecked && !vm.isIndividual) {
                vm.mediaLicenses.person = {};
            }
            else if (isChecked && !vm.isIndividual){
                $http.get($rootScope.app.httpSource + 'api/UserProfile')
                    .then(function (resp) {
                        if (resp.data != null) {
                            vm.mediaLicenses.person.dateOfBirth = new Date(resp.data.person.dateOfBirth);
                            vm.mediaLicenses.person = resp.data.person;
                            //vm.mediaLicenses.person.dateOfBirth = null;
                        }
                    });
            }
        };

        //Save the details to the server
        vm.save = function (applicationStatusId) {
            vm.isBusy = true;

            if (vm.serviceFeesObj.serviceFee[0] != null) {
                vm.mediaLicenses.applicationDetail.payments[0].paymentDetails = vm.serviceFeesObj.serviceFee;
            }
            else {
                vm.mediaLicenses.applicationDetail.payments = null;
            }

            if (vm.isValidResidence && vm.isIndividual) {
                vm.mediaLicenses.person = vm.mediaLicenses.applicationDetail.application.user.userProfiles[0].person;
            }

            if (vm.requireAquitanceForm && !vm.isIndividual) {
                for (var i = 0; i < vm.mediaLicenses.applicationDetail.application.establishment.establishmentPartners.length; i++) {
                    if (vm.mediaLicenses.applicationDetail.application.establishment.establishmentPartners[i].person) {
                        if (vm.mediaLicenses.applicationDetail.application.establishment.establishmentPartners[i].person.acquitanceFormUrl == undefined ||
                            vm.mediaLicenses.applicationDetail.application.establishment.establishmentPartners[i].person.acquitanceFormUrl == null) {
                            vm.mediaLicenses.applicationDetail.application.establishment.establishmentPartners[i].error = true;
                        }
                        else {
                            vm.mediaLicenses.applicationDetail.application.establishment.establishmentPartners[i].error = false;
                        }
                    }
                }

                if ($filter('filter')(vm.mediaLicenses.applicationDetail.application.establishment.establishmentPartners, { error: true }, true).length > 0) {
                    vm.dtPartnerInstance.rerender();

                    if (vm.dtPartnerInstance.DataTable.rows(
                        function (idx, data, node) {
                            return data.error == undefined || data.error == false ? false : true;
                        }).nodes().length > 0) {
                        vm.isBusy = false;
                        return;
                    }
                }
            }

            if (vm.isExternalMediaAccount) {
                for (var i = 0; i < vm.externalMediaAccountActivities.length; i++) {
                    var economicActivity = $filter('filter')(vm.mediaLicenses.mediaLicenseEconomicActivities, { economicActivity: { id: vm.externalMediaAccountActivities[i].economicActivity.id } }, true)[0];
                    economicActivity.mediaLicenseEconomicActivityExternalMediaAccounts = vm.externalMediaAccountActivities[i].mediaLicenseEconomicActivityExternalMediaAccounts;
                }
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
            vm.mediaLicenses.applicationDetail.payments[0].paymentDetails = vm.serviceFeesObj.serviceFee;

            if (vm.requireAquitanceForm && !vm.isIndividual) {
                for (var i = 0; i < vm.mediaLicenses.applicationDetail.application.establishment.establishmentPartners.length; i++) {
                    if (vm.mediaLicenses.applicationDetail.application.establishment.establishmentPartners[i].person) {
                        if (vm.mediaLicenses.applicationDetail.application.establishment.establishmentPartners[i].person.acquitanceFormUrl == undefined ||
                            vm.mediaLicenses.applicationDetail.application.establishment.establishmentPartners[i].person.acquitanceFormUrl == null) {
                            vm.mediaLicenses.applicationDetail.application.establishment.establishmentPartners[i].error = true;
                        }
                        else {
                            vm.mediaLicenses.applicationDetail.application.establishment.establishmentPartners[i].error = false;
                        }
                    }
                    else {
                        vm.mediaLicenses.applicationDetail.application.establishment.establishmentPartners[i].error = false;
                    }
                }

                if ($filter('filter')(vm.mediaLicenses.applicationDetail.application.establishment.establishmentPartners, { error: true }, true).length > 0) {
                    vm.dtPartnerInstance.rerender();
                    if (vm.dtPartnerInstance.DataTable.rows(
                        function (idx, data, node) {
                            return data.error == undefined || data.error == false ? false : true;
                        }).nodes().length > 0) {
                        vm.isBusy = false;
                        return;
                    }
                }
            }

            if (vm.isExternalMediaAccount) {
                for (var i = 0; i < vm.externalMediaAccountActivities.length; i++) {
                    var economicActivity = $filter('filter')(vm.mediaLicenses.mediaLicenseEconomicActivities, { economicActivity: { id: vm.externalMediaAccountActivities[i].economicActivity.id } }, true)[0];
                    economicActivity.mediaLicenseEconomicActivityExternalMediaAccounts = vm.externalMediaAccountActivities[i].mediaLicenseEconomicActivityExternalMediaAccounts;
                }
            }

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

    socialMediaLicenseController.$inject = ['$rootScope', '$scope', '$http', '$stateParams', '$state', '$window', '$uibModal', 'UserProfile', 'browser', 'DTOptionsBuilder', 'DTColumnBuilder',
        '$compile', '$filter'];
})();