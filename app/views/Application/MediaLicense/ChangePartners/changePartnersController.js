/**=========================================================
 * Module: LoginController.js
 * Controller for the Chat APP 
 =========================================================*/

(function () {
    'use strict';

    angular
        .module('eServices')
        .controller('ChangePartnersController', ChangePartnersController);

    function ChangePartnersController($rootScope, $scope, $http, $stateParams, $state, UserProfile, $uibModal, $filter, DTOptionsBuilder, DTColumnBuilder, $compile, SweetAlert, browser) {
        var vm = this;
        vm.user = UserProfile.getProfile();
        vm.uploadInitialApprovalUrl = 'api/Upload/UploadFile?uploadFile=InitialApprovalPath';

        vm.Init = function () {
            vm.serviceFeesObj = { serviceId: 9, serviceFee: [], isAddRemovePartner: true, economicActivityIds: [] };
            vm.terms = {};
            vm.happinessMeterObj = {};
            vm.happinessMeterObj.serviceId = 9;
            vm.happinessMeterObj.applicationType = {};
            vm.happinessMeterObj.applicationType.pmoCode = "004";

            $scope.$watch('ppCtl.mediaLicenses.establishmentPartners', function (newVal, oldVal) {
                if (newVal && (newVal.length == 0 || $filter('filter')(newVal, { changePartnerTypeId: 2 }, true).length == newVal.length)) {
                    vm.showOnePartner = true;
                }
                else {
                    vm.showOnePartner = false;
                }

                if (newVal) {
                    vm.serviceFeesObj.economicActivityIds = [];

                    var numberOfDeletedPartners = $filter('filter')(newVal, { changePartnerTypeId: 2 }, true).length;
                    var numberOfAddedPartners = $filter('filter')(newVal, { id: 0 }, true).length;
                    numberOfAddedPartners += $filter('filter')(newVal, { alreadyExistAdded: true }, true).length;

                    var totalAddedDeletedPartners = numberOfDeletedPartners + numberOfAddedPartners;

                    for (var i = 0; i < totalAddedDeletedPartners; i++) {
                        vm.serviceFeesObj.economicActivityIds.push(i);
                    }

                    if (totalAddedDeletedPartners > 0) {
                        vm.showRequiredError = false;
                    }

                    if (vm.serviceFeesObj.reloadTable)
                        vm.serviceFeesObj.reloadTable();
                }

            }, true);
        }

        //New Form Condition
        if ($state.params === undefined || $state.params.edit === undefined || $state.params.edit === "") {
            // New Application
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
                        id: $state.params.applicationId,
                        office: {}
                    },
                    applicationTypeId: 5
                },
                mediaLicensePartnerUpdates: []
            };

            if (vm.user.userTypeCode != '01') {
                $http.get($rootScope.app.httpSource + 'api/Establishment/GetByApplicationId?id=' + $state.params.applicationId)
                    .then(function (response) {
                        vm.mediaLicenses.applicationDetail.application.establishment = response.data;
                    });
            }

            $http.get($rootScope.app.httpSource + 'api/MediaLicense/GetById?id=' + $state.params.applicationDetailId)
                .then(function (response) {
                    vm.mediaLicenses.mediaLicenseEconomicActivities = response.data.mediaLicenseEconomicActivities
                    vm.mediaLicenses.applicationDetail.certificates = response.data.applicationDetail.certificates;
                    vm.mediaLicenses.applicationDetail.application.establishment = response.data.applicationDetail.application.establishment;
                    vm.mediaLicenses.tenancyContractCopyUrl = response.data.tenancyContractCopyUrl;
                    vm.mediaLicenses.tenancyContractCopyUrlFullPath = response.data.tenancyContractCopyUrlFullPath;
                    vm.mediaLicenses.mediaLicenseNumber = response.data.mediaLicenseNumber;
                    vm.mediaLicenses.applicationDetail.acquitanceFormUrl = response.data.applicationDetail.acquitanceFormUrl;
                    vm.mediaLicenses.applicationDetail.acquaintanceFormCopyUrlFullPath = response.data.applicationDetail.acquaintanceFormCopyUrlFullPath;
                    vm.mediaLicenses.yearsOfLicense = 1;

                    for (var i = 0; i < vm.mediaLicenses.mediaLicenseEconomicActivities.length; i++) {
                        if (vm.mediaLicenses.mediaLicenseEconomicActivities[i].economicActivity.isRequireThirdPartyApproval) {
                            vm.mediaLicenses.isRequireThirdPartyApproval = true;
                            break;
                        }
                    }

                    vm.Init();
                });
        }
        else {
            //Get the details of the submitted Form to edit
            $http.get($rootScope.app.httpSource + 'api/MediaLicense/GetById?id=' + $state.params.applicationDetailId)
                .then(function (response) {
                    vm.editMode = true;
                    vm.mediaLicenses = response.data;

                    if (vm.mediaLicenses.applicationDetail.applicationStatusId == 1 && vm.user.userTypeCode != "06" && vm.mediaLicenses.applicationDetail.actionsTakens.length > 1) {
                        if (vm.mediaLicenses.applicationDetail.actionsTakens[vm.mediaLicenses.applicationDetail.actionsTakens.length - 1].transition.actionId == 6 &&
                            vm.mediaLicenses.applicationDetail.actionsTakens[vm.mediaLicenses.applicationDetail.actionsTakens.length - 1].note != "") {
                            vm.employeeNote = vm.mediaLicenses.applicationDetail.actionsTakens[vm.mediaLicenses.applicationDetail.actionsTakens.length - 1].note;
                            vm.employeeNoteDate = moment(vm.mediaLicenses.applicationDetail.actionsTakens[vm.mediaLicenses.applicationDetail.actionsTakens.length - 1].actionDate).format("dddd, MMMM Do YYYY, h:mm:ss a");
                        }
                    }

                    for (var i = 0; i < vm.mediaLicenses.mediaLicenseEconomicActivities.length; i++) {
                        if (vm.mediaLicenses.mediaLicenseEconomicActivities[i].economicActivity.isRequireThirdPartyApproval) {
                            vm.mediaLicenses.isRequireThirdPartyApproval = true;
                            break;
                        }
                    }

                    vm.Init();

                    $scope.$watch('ppCtl.mediaLicenses.mediaLicensePartnerUpdates', function (newVal, oldVal) {
                        if (newVal && (newVal.length == 0 || $filter('filter')(newVal, { changePartnerTypeId: 2 }, true).length == newVal.length)) {
                            vm.showOnePartner = true;
                        }
                        else {
                            vm.showOnePartner = false;
                        }

                        if (newVal) {
                            vm.serviceFeesObj.economicActivityIds = [];

                            var numberOfDeletedPartners = $filter('filter')(newVal, { changePartnerTypeId: 2 }, true).length;
                            var numberOfAddedPartners = $filter('filter')(newVal, { id: 0 }, true).length;
                            var totalAddedDeletedPartners = numberOfDeletedPartners + numberOfAddedPartners;

                            for (var i = 0; i < totalAddedDeletedPartners; i++) {
                                vm.serviceFeesObj.economicActivityIds.push(i);
                            }

                            if (totalAddedDeletedPartners > 0) {
                                vm.showRequiredError = false;
                            }

                            if (vm.serviceFeesObj.reloadTable)
                                vm.serviceFeesObj.reloadTable();
                        }

                    }, true);
                });
        }

        vm.save = function (applicationStatusId) {

            for (var i = 0; i < vm.mediaLicenses.establishmentPartners.length; i++) {
                if (vm.mediaLicenses.establishmentPartners[i].changePartnerTypeId == 2) {
                    if (vm.mediaLicenses.establishmentPartners[i].person) {
                        var partnerUpdate = {};
                        partnerUpdate.person = vm.mediaLicenses.establishmentPartners[i].person;
                        partnerUpdate.personId = vm.mediaLicenses.establishmentPartners[i].personId;
                        partnerUpdate.changePartnerTypeId = 2;
                        vm.mediaLicenses.mediaLicensePartnerUpdates.push(partnerUpdate);
                    }
                    else if (vm.mediaLicenses.establishmentPartners[i].partnerEstablishment) {
                        var partnerUpdate = {};
                        partnerUpdate.establishment = vm.mediaLicenses.establishmentPartners[i].partnerEstablishment;
                        partnerUpdate.establishmentId = vm.mediaLicenses.establishmentPartners[i].partnerEstablishmentId;
                        partnerUpdate.changePartnerTypeId = 2;
                        vm.mediaLicenses.mediaLicensePartnerUpdates.push(partnerUpdate);
                    }
                }
                else if (vm.mediaLicenses.establishmentPartners[i].changePartnerTypeId != 2 && vm.mediaLicenses.establishmentPartners[i].id == 0) {
                    if (vm.mediaLicenses.establishmentPartners[i].person) {
                        var partnerUpdate = {};
                        partnerUpdate.person = vm.mediaLicenses.establishmentPartners[i].person;
                        partnerUpdate.changePartnerTypeId = 1;
                        vm.mediaLicenses.mediaLicensePartnerUpdates.push(partnerUpdate);
                    }
                    else if (vm.mediaLicenses.establishmentPartners[i].partnerEstablishment) {
                        var partnerUpdate = {};
                        partnerUpdate.establishment = vm.mediaLicenses.establishmentPartners[i].partnerEstablishment;
                        partnerUpdate.changePartnerTypeId = 1;
                        vm.mediaLicenses.mediaLicensePartnerUpdates.push(partnerUpdate);
                    }
                }
                else if (vm.mediaLicenses.establishmentPartners[i].changePartnerTypeId != 2 && vm.mediaLicenses.establishmentPartners[i].id != 0) {
                    if (vm.mediaLicenses.establishmentPartners[i].person) {
                        var partnerUpdate = {};
                        partnerUpdate.person = vm.mediaLicenses.establishmentPartners[i].person;
                        partnerUpdate.changePartnerTypeId = 3;
                        vm.mediaLicenses.mediaLicensePartnerUpdates.push(partnerUpdate);
                    }
                    else if (vm.mediaLicenses.establishmentPartners[i].partnerEstablishment) {
                        var partnerUpdate = {};
                        partnerUpdate.establishment = vm.mediaLicenses.establishmentPartners[i].partnerEstablishment;
                        partnerUpdate.changePartnerTypeId = 3;
                        vm.mediaLicenses.mediaLicensePartnerUpdates.push(partnerUpdate);
                    }
                }
            }

            if (vm.mediaLicenses.establishmentPartners.length == $filter('filter')(vm.mediaLicenses.mediaLicensePartnerUpdates, { changePartnerTypeId: 3 }).length) {
                vm.showRequiredError = true;
                return;
            }

            vm.isBusy = true;
            vm.showRequiredError = false;

            if (vm.serviceFeesObj.serviceFee[0] != null) {
                vm.mediaLicenses.applicationDetail.payments[0].paymentDetails = vm.serviceFeesObj.serviceFee;
            }
            else {
                vm.mediaLicenses.applicationDetail.payments = null;
            }

            vm.mediaLicenses.applicationDetailId = 0;
            vm.mediaLicenses.applicationDetail.certificates = null;

            if ($rootScope.app.isPMOHappiness) {
                $http.post($rootScope.app.httpSource + 'api/MediaLicense/SubmitMediaLicense', vm.mediaLicenses)
                    .then(function (response) {
                        vm.happinessMeterObj.transactionId = response.data;
                        vm.showHappinessMeter = true;
                    },
                        function (response) { // optional
                            vm.isBusy = false;
                        });
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

                    $http.post($rootScope.app.httpSource + 'api/MediaLicense/SubmitMediaLicense', vm.mediaLicenses)
                        .then(function (response) {
                            $state.go('app.dashboard');
                        },
                            function (response) { // optional
                                vm.isBusy = false;
                            });
                });
            }
        }

        vm.workflowClick = function (actionId) {
            vm.isBusy = true;

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
    ChangePartnersController.$inject = ['$rootScope', '$scope', '$http', '$stateParams', '$state', 'UserProfile', '$uibModal', '$filter', 'DTOptionsBuilder', 'DTColumnBuilder', '$compile', 'SweetAlert', 'browser'];

})();