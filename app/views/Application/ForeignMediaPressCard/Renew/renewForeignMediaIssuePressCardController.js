/**=========================================================
 * Module: LoginController.js
 * Controller for the Chat APP 
 =========================================================*/

(function () {
    'use strict';
    angular
        .module('eServices')
        .controller('RenewFMIsuuePressCardController', RenewFMIsuuePressCardController);

    function RenewFMIsuuePressCardController($rootScope, $scope, $http, $stateParams, $state, $window, $uibModal, UserProfile, browser, DTOptionsBuilder, DTColumnBuilder, $compile, $filter) {
        var vm = this;
        vm.user = UserProfile.getProfile();

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
            vm.serviceFeesObj = { serviceId: 18, serviceFee: [], isRenew: true, isTemporaryPressCard: false};
            vm.format = 'dd-MMMM-yyyy';
            vm.terms = {};
            vm.user = UserProfile.getProfile();
            vm.pressCard.selectActivities = [];
            vm.serviceFeesObj.economicActivityIds = [];
            vm.happinessMeterObj = {};
            vm.happinessMeterObj.serviceId = 18;
            vm.happinessMeterObj.applicationType = {};
            vm.happinessMeterObj.applicationType.pmoCode = "001";

            vm.uploadAssignmentLetterUrl = 'api/Upload/UploadFile?uploadFile=AssignmentLetterPath';
            vm.uploadAcademicQualificationUrl = 'api/Upload/UploadFile?uploadFile=QualificationCopyPath';
            vm.passportCopyUrl = 'api/Upload/UploadFile?uploadFile=ProfilePassportPhotoPath';
            vm.photoUrl = 'api/Upload/UploadFile?uploadFile=ProfilePersonalPhotoPath';
            vm.acquitanceFormUrl = 'api/Upload/UploadFile?uploadFile=AcquaintanceFormPath';

            $http.get($rootScope.app.httpSource + 'api/BusinessType')
                .then(function (response) {
                    vm.businessTypes = response.data;
                    if (vm.pressCardData.businessType != null) {
                        vm.selectedBusinessType = $filter('filter')(vm.businessTypes, { id: vm.pressCardData.businessType.id }, true)[0];
                    }
                }, function (response) { });


            $http.get($rootScope.app.httpSource + 'api/Country')
                .then(function (response) {
                    vm.countries = response.data;
                    if (vm.pressCardData.foreignEntity.country != null) {
                        vm.selectedCountry = $filter('filter')(vm.countries, { id: vm.pressCardData.foreignEntity.country.id }, true)[0];
                    }
                });

            $http.get($rootScope.app.httpSource + 'api/UserProfile')
                .then(function (resp) {
                    if (resp.data != null) {
                        //if (vm.user.userTypeCode == 01) {
                        resp.data.person.dateOfBirth = new Date(resp.data.person.dateOfBirth);
                        if (vm.user.userTypeCode == '01') {
                        vm.pressCard.person = resp.data.person;
                        vm.pressCard.person.user = resp.data.user;
                        vm.genderValue = vm.pressCard.person.gender.id == 1 ? true : false;
                       }
                    }
                });

            //$http.get($rootScope.app.httpSource + 'api/Office')
            //    .then(function (response) {
            //        vm.offices = response.data;
            //    });

            if (vm.pressCard.applicationDetail.payments[0].paymentDetails.length > 0) {
                for (var id in vm.pressCard.applicationDetail.payments[0].paymentDetails) {
                    if (vm.pressCard.applicationDetail.payments[0].paymentDetails[id].economicActivity) {
                        vm.pressCard.selectActivities.push(vm.pressCard.applicationDetail.payments[0].paymentDetails[id].economicActivity);
                        vm.serviceFeesObj.isTemporaryPressCard = vm.pressCardData.pressCard[0].isTemporaryCard;
                        vm.serviceFeesObj.economicActivityIds.push(vm.pressCard.applicationDetail.payments[0].paymentDetails[id].economicActivity.id);
                    }
                }
            }
            else {
                for (var i = 0; i < vm.pressCard.mediaLicenseEconomicActivities.length; i++) {
                    if (vm.pressCard.mediaLicenseEconomicActivities[i].economicActivity) {
                        vm.pressCard.selectActivities.push(vm.pressCard.mediaLicenseEconomicActivities[i].economicActivity);
                        vm.serviceFeesObj.isTemporaryPressCard = vm.pressCardData.isTemporaryCard;
                        vm.serviceFeesObj.economicActivityIds.push(vm.pressCard.mediaLicenseEconomicActivities[i].economicActivity.id);
                    }
                }
            }

        };

        function gridTable() {
            //Press Card Datatable
            vm.teamMemberDt = {};
            vm.teamMemberDt.dtInstance = {};
            vm.teamMemberDt.serverData = function (sSource, aoData, fnCallback, oSettings) {
                var aoDataLength = aoData.length;
                //All the parameters you need is in the aoData variable
                var draw = aoData[0].value;
                var order = aoData[2].value[0];
                var start = aoData[3].value;
                var length = aoData[4].value;
                var search = aoData[5].value;

                var params = {
                    searchtext: search.value,
                    page: (start / length) + 1,
                    pageSize: length,
                    sortBy: (order.column === 0 ? 'id' : aoData[1].value[order.column].data),
                    sortDirection: order.dir
                };
                var records = {
                    'draw': draw,
                    'recordsTotal': vm.pressCard.applicationDetail.certificates[0].certificateDetails.length,
                    'recordsFiltered': vm.pressCard.applicationDetail.certificates[0].certificateDetails.length,
                    'data': vm.pressCard.applicationDetail.certificates[0].certificateDetails
                };
                fnCallback(records);
            };

            vm.teamMemberDt.createdRow = function (row, data, dataIndex) {
                // Recompiling so we can bind Angular directive to the DT
                $compile(angular.element(row).contents())($scope);
            };

            if ($rootScope.language.selected !== 'English') {
                vm.teamMemberDt.dtOptions = DTOptionsBuilder.newOptions()
                    .withFnServerData(vm.teamMemberDt.serverData)
                    .withOption('serverSide', true)
                    .withDataProp('data')
                    .withOption('processing', true)
                    .withOption('responsive', true)
                    .withLanguageSource('app/langs/ar.json')
                    .withOption('bFilter', false)
                    .withOption('paging', false)
                    .withOption('info', false)
                    .withOption('createdRow', vm.teamMemberDt.createdRow).withBootstrap();
            }
            else {
                vm.teamMemberDt.dtOptions = DTOptionsBuilder.newOptions()
                    .withFnServerData(vm.teamMemberDt.serverData)
                    .withOption('serverSide', true)
                    .withDataProp('data')
                    .withOption('processing', true)
                    .withOption('responsive', true)
                    .withOption('bFilter', false)
                    .withOption('paging', false)
                    .withOption('info', false)
                    .withOption('createdRow', vm.teamMemberDt.createdRow).withBootstrap();
            };

            vm.teamMemberDt.dtColumns = [
                DTColumnBuilder.newColumn('mediaLicenseEconomicActivity.economicActivity').withTitle(vm.translateFilter('mediaLicense.economicActivity')).renderWith(
                    function (data, type) {
                        return $filter('localizeString')(data);
                    }),
                DTColumnBuilder.newColumn('expiryDate').withTitle(vm.translateFilter('mediaLicense.startDate')).renderWith(
                    function (data, type) {
                        return moment(data).add(1, 'day').format('DD-MMMM-YYYY');
                    }),
                DTColumnBuilder.newColumn('expiryDate').withTitle(vm.translateFilter('mediaLicense.endDate')).renderWith(
                    function (data, type) {
                        return moment(data).add(vm.pressCard.yearsOfLicense, 'years').format('DD-MMMM-YYYY');
                    })];
        }

        //New Form Condition
        if ($state.params === undefined || $state.params.edit === undefined || $state.params.edit === "") {
            vm.editMode = false;

            vm.pressCard = {
                applicationDetail: {
                    id: $state.params.applicationDetailId,
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
                        serviceId: 18,
                        id: $state.params.applicationId
                    }
                }
            };
            vm.foreignPressCardModel = {
                pressCards: []
            };
            vm.foreignPressCardModel.pressCards = {
                foreignEntity: {
                    foreignEntitySocialMedias: [
                        {
                            isForeignMediaLicense: true,
                            mediaLicenseEconomicActivityExternalMediaAccounts: []
                        }
                    ]
                }
            }
            vm.pressCardData = {
                applicationDetail: {
                    id: $state.params.applicationDetailId,
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
                        serviceId: 18,
                        id: $state.params.applicationId
                    }                   
                },
                mediaLicenseEconomicActivities: [{}],
                pressCard: [{
                    foreignEntity: {
                        foreignEntitySocialMedias: [{}]
                    }
                }]
            };

            $http.get($rootScope.app.httpSource + 'api/ForeignPressCard/GetById?id=' + $state.params.applicationDetailId)
                .then(function (response) {
                    vm.pressCard = response.data;
                    vm.pressCardData.businessType = response.data.pressCard[0].businessType;
                    vm.pressCardData.deliveryType = response.data.pressCard[0].deliveryType;
                    vm.pressCardData.foreignEntity = response.data.pressCard[0].foreignEntity;
                    vm.pressCardData.address = response.data.pressCard[0].address;
                    vm.pressCardData.mediaLicenseEconomicActivities = response.data.mediaLicenseEconomicActivities;
                    vm.pressCardData.mediaLicenseNumber = response.data.mediaLicenseNumber;
                    vm.pressCardData.applicationDetail.application = response.data.applicationDetail.application;
                    vm.pressCardData.pressCard[0] = response.data.pressCard[0];                    
                    vm.pressCard.applicationDetail.application.establishment = response.data.applicationDetail.application.establishment;
                    vm.pressCard.mediaLicenseNumber = response.data.mediaLicenseNumber;
                    vm.pressCard.mediaLicenseEconomicActivities = $filter('filter')(response.data.mediaLicenseEconomicActivities, { cancelledDate: null }, true);
                    vm.pressCard.person = response.data.pressCard[0].person;
                    vm.genderValue = vm.pressCard.person.gender.id == 1 ? true : false;

                    for (var i = 0; i < vm.pressCardData.foreignEntity.foreignEntitySocialMedias.length; i++) {
                        var foreignEntitySocialmedia = vm.pressCardData.foreignEntity.foreignEntitySocialMedias[i];
                        vm.foreignPressCardModel.pressCards.foreignEntity.foreignEntitySocialMedias[0].mediaLicenseEconomicActivityExternalMediaAccounts.push({ externalMediaAccount: foreignEntitySocialmedia });
                    }

                    gridTable();
                    vm.Init();
                });
        }
        else {
            //Get the details of the submitted Form to edit
            $http.get($rootScope.app.httpSource + 'api/ForeignPressCard/GetById?id=' + $state.params.applicationDetailId)
                .then(function (response) {
                    vm.editMode = true;
                    vm.pressCard = response.data;
                    vm.pressCardData = response.data.pressCard[0];
                    vm.pressCard.applicationDetail.application.establishment = response.data.applicationDetail.application.establishment;
                    vm.pressCard.mediaLicenseNumber = response.data.mediaLicenseNumber;
                    vm.pressCard.mediaLicenseEconomicActivities = response.data.mediaLicenseEconomicActivities;
                    vm.pressCardData.mediaLicenseNumber = response.data.mediaLicenseNumber;
                    vm.pressCardData.applicationDetail.application = response.data.applicationDetail.application;
                    vm.pressCard.person = response.data.pressCard[0].person;
                    gridTable();
                    vm.Init();
                });
        }

        //Save the details to the server
        vm.save = function (applicationStatusId) {
            vm.isBusy = true;
            vm.pressCardData.applicationDetailId = 0;

            if (vm.serviceFeesObj.serviceFee[0] != null) {
                vm.pressCardData.applicationDetail.payments[0].paymentDetails = vm.serviceFeesObj.serviceFee;
            }
            else {
                vm.pressCardData.applicationDetail.payments = null;
            }
            vm.pressCardData.mediaLicenseEconomicActivities.splice(0, 1);
            vm.pressCardData.mediaLicenseEconomicActivities.push({ economicActivity: { id: 1041, isRequireThirdPartyApproval: true } });
            vm.pressCardData.pressCard[0].person = vm.pressCard.person;
            vm.pressCardData.pressCard[0].assignmentLetterUrl = vm.pressCardData.assignmentLetterUrl;
            vm.pressCardData.pressCard[0].pressCard1 = null;

            if ($rootScope.app.isPMOHappiness) {
                switch (applicationStatusId) {
                    case 1:
                        $http.post($rootScope.app.httpSource + 'api/ForeignPressCard/SaveForeignPressCard', vm.pressCardData)
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
                        $http.post($rootScope.app.httpSource + 'api/ForeignPressCard/SubmitForeignPressCard', vm.pressCardData)
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
                    vm.pressCard.applicationDetail.happinessRate = happinessRate;

                    //Post to save
                    switch (applicationStatusId) {
                        case 1:
                            $http.post($rootScope.app.httpSource + 'api/ForeignPressCard/SaveForeignPressCard', vm.pressCardData)
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
                            $http.post($rootScope.app.httpSource + 'api/ForeignPressCard/SubmitForeignPressCard', vm.pressCardData)
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
            vm.pressCard.applicationDetail.payments[0].paymentDetails = vm.serviceFeesObj.serviceFee;

            switch (actionId) {

                case 1:
                    $http.post($rootScope.app.httpSource + 'api/ForeignPressCard/UpdateForeignPressCard', vm.pressCard)
                        .then(function (response) {
                            $state.go('app.dashboard');
                        },
                            function (response) { // optional
                                vm.isBusy = false;
                            });
                    break;

                case 2:
                    $http.post($rootScope.app.httpSource + 'api/ForeignPressCard/SubmitUpdateForeignPressCard', vm.pressCard)
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

    RenewFMIsuuePressCardController.$inject = ['$rootScope', '$scope', '$http', '$stateParams', '$state', '$window', '$uibModal', 'UserProfile', 'browser', 'DTOptionsBuilder', 'DTColumnBuilder',
        '$compile', '$filter'];
})();