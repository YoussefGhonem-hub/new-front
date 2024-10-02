/**=========================================================
 * Module: LoginController.js
 * Controller for the Chat APP 
 =========================================================*/

(function () {
    'use strict';

    angular
        .module('eServices')
        .controller('AddMediaActivityController', AddMediaActivityController);

    function AddMediaActivityController($rootScope, $scope, $http, $stateParams, $state, $window, $uibModal, UserProfile, browser, DTOptionsBuilder, DTColumnBuilder, $compile, $filter,
        SweetAlert) {
        var vm = this;

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
            vm.returnBack = true;
        }

        vm.previousToFirstStep = function () {
            vm.activeStep = 1;
            vm.returnBack = true;
        }

        vm.translateFilter = $filter('translate');

        vm.Init = function () {
            vm.isBusy = false;
            vm.activeStep = 1;
            vm.serviceFeesObj = { serviceId: 9, serviceFee: [], isRenew: false };
            vm.terms = {};
            vm.user = UserProfile.getProfile();
            vm.establishmentId = vm.mediaLicenses.applicationDetail.application.establishment.id;
            vm.happinessMeterObj = {};
            vm.happinessMeterObj.serviceId = 9;
            vm.happinessMeterObj.applicationType = {};
            vm.happinessMeterObj.applicationType.pmoCode = "000";

            $scope.$watch('mediaCtl.mediaLicenses.selectActivities', function (newVal, oldVal) {
                if (newVal) {
                    vm.serviceFeesObj.economicActivityIds = [];

                    if (!vm.externalMediaAccountActivities) {
                        vm.externalMediaAccountActivities = [];
                    }

                    vm.isExternalMediaAccount = false;

                    for (var i = 0; i < newVal.length; i++) {
                        vm.serviceFeesObj.economicActivityIds.push(newVal[i].id);

                        if (newVal[i].code == "59" || newVal[i].code == "60" || newVal[i].code == "61" || newVal[i].code == "62" || newVal[i].code == "63") {
                            var economicActivity = $filter('filter')(vm.externalMediaAccountActivities, { economicActivity: { id: newVal[i].id } }, true)[0];
                            if (!economicActivity && !vm.editMode) {
                                var externalMediaAccountActivity = {};
                                externalMediaAccountActivity.economicActivity = newVal[i];
                                vm.externalMediaAccountActivities.push(externalMediaAccountActivity);
                            }
                            vm.isExternalMediaAccount = true;
                        }
                    }

                    vm.serviceFeesObj.reloadTable();

                    vm.requireAquitanceForm = false;
                    for (var i = 0; i < newVal.length; i++) {
                        if (newVal[i].isRequireThirdPartyApproval) {
                            vm.requireAquitanceForm = true;
                            break;
                        }
                    }
                }
            });
        };

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
                applicationTypeId: 3
            }
        };

        $http.get($rootScope.app.httpSource + 'api/EconomicActivity/GetAllowedEconomicActivity?applicationId=' + $state.params.applicationId)
            .then(function (response) {
                vm.mediaLicenses.economicActivities = response.data;
                vm.mediaLicenses.selectActivities = $filter('filter')(vm.mediaLicenses.economicActivities, { isMandatory: true }, true);
            });

        vm.removeActivity = function (item, model) {
            if (item.isMandatory) {
                if (vm.mediaLicenses.selectActivities == undefined) {
                    vm.mediaLicenses.selectActivities = [];
                }
                vm.mediaLicenses.selectActivities.push(item);
                SweetAlert.swal({
                    title: $filter('translate')('general.notApplicable'),
                    text: $filter('translate')('mediaLicense.preventRemoveActivity'),
                    confirmButtonText: $filter('translate')('general.ok')
                });
            }
        };

        $http.get($rootScope.app.httpSource + 'api/Establishment/GetByApplicationId?id=' + $state.params.applicationId)
            .then(function (response) {
                vm.mediaLicenses.applicationDetail.application.establishment = response.data;
            });

        $http.get($rootScope.app.httpSource + 'api/MediaLicense/GetById?id=' + $state.params.applicationDetailId)
            .then(function (response) {
                vm.mediaLicenses.applicationDetail.application.establishment = response.data.applicationDetail.application.establishment;
                vm.mediaLicenses.tenancyContractCopyUrl = response.data.tenancyContractCopyUrl;
                vm.mediaLicenses.tenancyContractCopyUrlFullPath = response.data.tenancyContractCopyUrlFullPath;
                vm.mediaLicenses.mediaLicenseNumber = response.data.mediaLicenseNumber;
                vm.mediaLicenses.applicationDetail.acquitanceFormUrl = response.data.applicationDetail.acquitanceFormUrl;
                vm.mediaLicenses.applicationDetail.acquaintanceFormCopyUrlFullPath = response.data.applicationDetail.acquaintanceFormCopyUrlFullPath;
                vm.mediaLicenses.yearsOfLicense = 1;
                vm.Init();
            });

        //Save the details to the server

        vm.save = function () {
            vm.isBusy = true;
            vm.mediaLicenses.applicationDetail.payments[0].paymentDetails = vm.serviceFeesObj.serviceFee;
            vm.mediaLicenses.applicationDetailId = 0;

            if (vm.requireAquitanceForm) {
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
    }

    AddMediaActivityController.$inject = ['$rootScope', '$scope', '$http', '$stateParams', '$state', '$window', '$uibModal', 'UserProfile', 'browser', 'DTOptionsBuilder', 'DTColumnBuilder',
        '$compile', '$filter', 'SweetAlert'];
})();