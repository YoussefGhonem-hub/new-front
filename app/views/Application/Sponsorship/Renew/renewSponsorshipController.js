
(function () {
    'use strict';
    angular
        .module('eServices')
        .controller('RenewponsorshipController', RenewponsorshipController);

    function RenewponsorshipController($rootScope, $scope, $http, $stateParams, $state, $window, $uibModal, UserProfile, browser, DTOptionsBuilder, DTColumnBuilder, $compile, $filter, SweetAlert) {
        var vm = this;
        vm.translateFilter = $filter('translate');
        vm.applicationOpen = true;
        vm.serviceFeesObj = { serviceId: 19, serviceFee: [], isRenew: true };


        //Get the details of the submitted Form to review
        $http.get($rootScope.app.httpSource + 'api/ForeignPressCard/GetById?id=' + $state.params.applicationDetailId)
            .then(function (response) {
                vm.foreignPressCardObj = response.data;
                vm.PressCard = response.data.pressCard[0].pressCard2;                
                vm.Init();
            });

        //Get the details of the all applications
        $http.get($rootScope.app.httpSource + 'api/ForeignPressCard/GetAllAppliationByUser')
            .then(function (response) {
                vm.getAllPressCardApplications = response.data;
                vm.pressCardModel = {
                    pressCard1: {}
                }
                for (var i = 0; i < vm.getAllPressCardApplications.length; i++) {
                    vm.pressCardModel.pressCard1 = vm.getAllPressCardApplications[i];
                    vm.pressCardModel.certificateWithHeaderUrl = vm.pressCardModel.pressCard1.applicationDetail.certificates[0].certificateWithHeaderUrl;
                    vm.pressCardModel.certificateWithHeaderFullUrl = vm.pressCardModel.pressCard1.applicationDetail.certificates[0].certificateWithHeaderFullUrl;
                }
            });
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

                //Then just call your service to get the records from server side           

                var records = {
                    'draw': draw,
                    'recordsTotal': vm.pressCardModel.pressCard1.applicationDetail.certificates[0].certificateDetails.length,
                    'recordsFiltered': vm.pressCardModel.pressCard1.applicationDetail.certificates[0].certificateDetails.length,
                    'data': vm.pressCardModel.pressCard1.applicationDetail.certificates[0].certificateDetails
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
                DTColumnBuilder.newColumn('issueDate').withTitle(vm.translateFilter('mediaLicense.issueDate')).renderWith(
                    function (data, type) {
                        return moment(data).format('DD-MMMM-YYYY');
                    }),
                DTColumnBuilder.newColumn('expiryDate').withTitle(vm.translateFilter('mediaLicense.expiryDate')).renderWith(
                    function (data, type) {
                        return moment(data).format('DD-MMMM-YYYY');
                    })];
        }


        vm.Init = function () {
            vm.isBusy = false;
            vm.activeStep = 1;
            vm.format = 'dd-MMMM-yyyy';

            vm.terms = {};
            vm.uploadAssignmentLetterUrl = 'api/Upload/UploadFile?uploadFile=assignmentLetterPath';

            vm.happinessMeterObj = {};
            vm.happinessMeterObj.serviceId = 19;
            vm.happinessMeterObj.applicationType = {};
            vm.happinessMeterObj.applicationType.pmoCode = "001";
        };
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
                        serviceId: 19,
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
                        serviceId: 19,
                        id: $state.params.applicationId
                    }
                },
                mediaLicenseEconomicActivities: [{}],
                pressCard: [{                   
                }]
            };

            $http.get($rootScope.app.httpSource + 'api/ForeignPressCard/GetById?id=' + $state.params.applicationDetailId)
                .then(function (response) {
                                      
                    vm.pressCardModel = response.data.pressCard[0];                  
                    vm.pressCardData.mediaLicenseNumber = response.data.mediaLicenseNumber;
                    vm.pressCardData.applicationDetail.application = response.data.applicationDetail.application;

                    vm.pressCardData.pressCard[0].id = vm.pressCardModel.id;
                    vm.pressCardData.pressCard[0].personId = vm.pressCardModel.personId;
                    vm.pressCardData.pressCard[0].deliveryType = vm.pressCardModel.deliveryType;
                    vm.pressCardData.pressCard[0].foreignEntityId = vm.pressCardModel.foreignEntityId;
                    vm.pressCardData.pressCard[0].businessType = vm.pressCardModel.businessType;                   

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
                    vm.pressCardData = {
                        pressCard: [{}]
                        };
                    vm.pressCard.applicationDetail.application.establishment = response.data.applicationDetail.application.establishment;
                    vm.pressCard.mediaLicenseNumber = response.data.mediaLicenseNumber;
                    vm.pressCard.mediaLicenseEconomicActivities = response.data.mediaLicenseEconomicActivities;
                    vm.pressCardData.mediaLicenseNumber = response.data.mediaLicenseNumber;
                    vm.pressCardData.applicationDetail.application = response.data.applicationDetail.application;
                    
                    vm.pressCardData.pressCard[0].id = vm.pressCardModel.pressCard1.pressCard[0].id;
                    vm.pressCardData.pressCard[0].personId = vm.pressCardModel.pressCard1.pressCard[0].personId;
                    vm.pressCardData.pressCard[0].deliveryType = vm.pressCardModel.pressCard1.pressCard[0].deliveryType;
                    vm.pressCardData.pressCard[0].foreignEntityId = vm.pressCardModel.pressCard1.pressCard[0].foreignEntityId;
                    vm.pressCardData.pressCard[0].businessType = vm.pressCardModel.pressCard1.pressCard[0].businessType;
                    
                    gridTable();
                    vm.Init();
                });
        }
        vm.save = function (applicationStatusId) {
            vm.isBusy = true;
            vm.pressCardData.applicationDetail.payments[0].paymentDetails = vm.serviceFeesObj.serviceFee;
            vm.pressCardData.mediaLicenseEconomicActivities.push({ economicActivity: { id: 1042, isRequireThirdPartyApproval: false } });
            vm.pressCardData.mediaLicenseEconomicActivities.splice(0, 1);

            if ($rootScope.app.isPMOHappiness) {
                switch (applicationStatusId) {
                    case 1:
                        $http.post($rootScope.app.httpSource + 'api/ForeignPressCard/SaveForeignPressCard', vm.pressCardData)
                            .then(function (response) {
                                console.log(' saved dataaa==>', response.data);
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
                    vm.pressCardData.applicationDetail.happinessRate = happinessRate;                    
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

            for (var i = 0; i < vm.mediaLicenses1.pressCard1[0].foreignEntity1.foreignEntitySocialMedias1[0].mediaLicenseEconomicActivityExternalMediaAccounts.length; i++) {
                var foreignEntitySocialmedia = vm.mediaLicenses1.pressCard1[0].foreignEntity1.foreignEntitySocialMedias1[0].mediaLicenseEconomicActivityExternalMediaAccounts[i].externalMediaAccount;
                vm.mediaLicenses.pressCard[0].foreignEntity.foreignEntitySocialMedias.push(foreignEntitySocialmedia);
            }
            switch (actionId) {

                case 29:
                    $http.post($rootScope.app.httpSource + 'api/ForeignPressCard/UpdateForeignPressCard', vm.pressCardData)
                        .then(function (response) {
                            $state.go('app.dashboard');
                        },
                            function (response) { // optional
                                vm.isBusy = false;
                            });
                    break;

                case 14:
                    $http.post($rootScope.app.httpSource + 'api/ForeignPressCard/SubmitUpdateForeignPressCard', vm.pressCardData)
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
    RenewponsorshipController.$inject = ['$rootScope', '$scope', '$http', '$stateParams', '$state', '$window', '$uibModal', 'UserProfile', 'browser', 'DTOptionsBuilder', 'DTColumnBuilder', '$compile', '$filter', 'SweetAlert'];
})();