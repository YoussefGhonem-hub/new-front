
(function () {
    'use strict';
    angular
        .module('eServices')
        .controller('IssueSponsorshipController', IssueSponsorshipController);

    function IssueSponsorshipController($rootScope, $scope, $http, $stateParams, $state, $window, $uibModal, UserProfile, browser, DTOptionsBuilder, DTColumnBuilder, $compile, $filter, SweetAlert) {
        var vm = this;
        vm.translateFilter = $filter('translate');
        vm.localizeFilter = $filter('localizeString');
        vm.applicationOpen = true;
        vm.serviceFeesObj = { serviceId: 19, serviceFee: [], isRenew: false };
        vm.date = '20140313T00:00:00';

        //Get the details of the all applications
        $http.get($rootScope.app.httpSource + 'api/ForeignPressCard/GetAllAppliationByUser')
            .then(function (response) {
                vm.getAllPressCardApplications = response.data;
                vm.pressCardModel = {
                    pressCard1: {}
                }
                for (var i = 0; i < vm.getAllPressCardApplications.length; i++) {
                    vm.pressCardModel.pressCard1 = vm.getAllPressCardApplications[i];
                }
                gridTable2();
                if (vm.getAllPressCardApplications.length == 1) {
                    vm.selectPressCard();
                }
            });

        vm.selectPressCard = function () {
            vm.selectedPressCard = vm.pressCardModel.pressCard1;

            vm.pressCardModel.isTemporaryCard = vm.pressCardModel.pressCard1.pressCard[0].isTemporaryCard;
            vm.pressCardModel.businessType = vm.pressCardModel.pressCard1.pressCard[0].businessType;
            vm.pressCardModel.deliveryType = vm.pressCardModel.pressCard1.pressCard[0].deliveryType;
            vm.pressCardModel.address = vm.pressCardModel.pressCard1.pressCard[0].address;
            vm.pressCardModel.assignmentLetterUrl = vm.pressCardModel.pressCard1.pressCard[0].assignmentLetterUrl;
            vm.pressCardModel.assignmentLetterUrlFullPath = vm.pressCardModel.pressCard1.pressCard[0].assignmentLetterUrlFullPath;            

            vm.pressCardModel.foreignEntity = vm.pressCardModel.pressCard1.pressCard[0].foreignEntity;
            vm.pressCardModel.foreignEntity.nameEn = vm.pressCardModel.pressCard1.pressCard[0].foreignEntity.nameEn;
            vm.pressCardModel.foreignEntity.country = vm.pressCardModel.pressCard1.pressCard[0].foreignEntity.country;
            vm.pressCardModel.foreignEntity.email = vm.pressCardModel.pressCard1.pressCard[0].foreignEntity.email;
            vm.pressCardModel.foreignEntity.phoneNumber = vm.pressCardModel.pressCard1.pressCard[0].foreignEntity.phoneNumber;
            vm.pressCardModel.foreignEntity.website = vm.pressCardModel.pressCard1.pressCard[0].foreignEntity.website;

            vm.pressCardModel.person = vm.pressCardModel.pressCard1.pressCard[0].person;
            vm.pressCardModel.person.twitterAccount = vm.pressCardModel.pressCard1.pressCard[0].person.twitterAccount;
            vm.pressCardModel.person.academicQualificationUrl = vm.pressCardModel.pressCard1.pressCard[0].person.academicQualificationUrl;
            vm.pressCardModel.person.academicQualificationUrlFullPath = vm.pressCardModel.pressCard1.pressCard[0].person.academicQualificationUrlFullPath;
            vm.pressCardModel.pressCard1.applicationDetail.application.user.userProfiles[0].person.photoUrl = vm.pressCardModel.pressCard1.pressCard[0].person.photoUrl;
            vm.pressCardModel.pressCard1.applicationDetail.application.user.userProfiles[0].person.photoUrlFullPath = vm.pressCardModel.pressCard1.pressCard[0].person.photoUrlFullPath;
            vm.pressCardModel.pressCard1.applicationDetail.application.user.userProfiles[0].person.iqamaUrl = vm.pressCardModel.pressCard1.pressCard[0].person.iqamaUrl;
            vm.pressCardModel.pressCard1.applicationDetail.application.user.userProfiles[0].person.iqamaUrlFullPath = vm.pressCardModel.pressCard1.pressCard[0].person.iqamaUrlFullPath;
            vm.pressCardModel.pressCard1.applicationDetail.application.user.userProfiles[0].person.passportCopyUrl = vm.pressCardModel.pressCard1.pressCard[0].person.photoUrlFullPath;
            vm.pressCardModel.pressCard1.applicationDetail.application.user.userProfiles[0].person.passportCopyUrlFullPath = vm.pressCardModel.pressCard1.pressCard[0].person.passportCopyUrlFullPath;
            vm.pressCardModel.pressCard1.applicationDetail.application.user.userProfiles[0].person.emiratesIdCopyUrl = vm.pressCardModel.pressCard1.pressCard[0].person.emiratesIdCopyUrl;
            vm.pressCardModel.pressCard1.applicationDetail.application.user.userProfiles[0].person.emiratesIdCopyUrlFullPath = vm.pressCardModel.pressCard1.pressCard[0].person.emiratesIdCopyUrlFullPath;

            vm.mediaLicenses.pressCard[0].id = vm.pressCardModel.pressCard1.pressCard[0].id;
            vm.mediaLicenses.pressCard[0].personId = vm.pressCardModel.pressCard1.pressCard[0].personId;
            vm.mediaLicenses.pressCard[0].deliveryType = vm.pressCardModel.pressCard1.pressCard[0].deliveryType;
            vm.mediaLicenses.pressCard[0].foreignEntityId = vm.pressCardModel.pressCard1.pressCard[0].foreignEntityId;
            vm.mediaLicenses.pressCard[0].businessType = vm.pressCardModel.pressCard1.pressCard[0].businessType;

            gridTable(vm.selectedPressCard);
        };

        function gridTable(selectedPressCard) {
            vm.mydata = selectedPressCard;
            vm.teamMemberDt = {};
            vm.teamMemberDt.dtInstance = {};
            vm.teamMemberDt.serverData = function (sSource, aoData, fnCallback, oSettings) {
                var aoDataLength = aoData.length;

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
                    'recordsTotal': vm.mydata.applicationDetail.certificates[0].certificateDetails.length,
                    'recordsFiltered': vm.mydata.applicationDetail.certificates[0].certificateDetails.length,
                    'data': vm.mydata.applicationDetail.certificates[0].certificateDetails
                };
                fnCallback(records);
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
                    .withOption('createdRow', vm.teamMemberDt.createdRow)
                    .withOption('rowCallback', vm.teamMemberDt.rowCallback).withBootstrap();
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
                    .withOption('createdRow', vm.teamMemberDt.createdRow)
                    .withOption('rowCallback', vm.teamMemberDt.rowCallback).withBootstrap();
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

        vm.extraFees = [{
            "fee": 260.00,
            "nameAr": "رسوم إصدار تأشيرة عمل جديدة",
            "nameEn": "Issuing a new work visa fee"
        },
        {
            "fee": 560.00,
            "nameAr": "رسوم بدل مغادرة",
            "nameEn": "Departure allowance fee"
        }];

        function gridTable2() {
            vm.grid = {};
            vm.grid.dtInstance1 = {};
            vm.totalFees = 820.00;

            vm.grid.serverData = function (sSource, aoData, fnCallback, oSettings) {
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
                    'recordsTotal': vm.extraFees.length,
                    'recordsFiltered': vm.extraFees.length,
                    'data': vm.extraFees
                };
                fnCallback(records);
            };

            vm.grid.createdRow = function (row, data, dataIndex) {
                $compile(angular.element(row).contents())(vm);
            }

            vm.rowCallback = function () { };

            if ($rootScope.language.selected !== 'English') {
                vm.grid.dtOptions = DTOptionsBuilder.newOptions()
                    .withFnServerData(vm.grid.serverData)
                    .withOption('serverSide', true)
                    .withDataProp('data')
                    .withOption('processing', true)
                    .withLanguageSource('app/langs/ar.json')
                    .withOption('createdRow', vm.createdRow)
                    .withOption('bFilter', false)
                    .withOption('paging', false)
                    .withOption('info', false)
                    .withOption('rowCallback', vm.rowCallback).withBootstrap();
            }
            else {
                vm.grid.dtOptions = DTOptionsBuilder.newOptions()
                    .withFnServerData(vm.grid.serverData)
                    .withOption('serverSide', true)
                    .withDataProp('data')
                    .withOption('processing', true)
                    .withOption('createdRow', vm.createdRow)
                    .withOption('bFilter', false)
                    .withOption('paging', false)
                    .withOption('info', false)
                    .withOption('rowCallback', vm.rowCallback).withBootstrap();
            }

            vm.grid.dtColumns = [
                DTColumnBuilder.newColumn(null).withTitle(vm.translateFilter('serviceFee.number')).renderWith(function (data, type, full, meta) {
                    var htmlSection = '';
                    htmlSection = '<div>' + (meta.row + 1) + '</div>';
                    return htmlSection;
                }),
                DTColumnBuilder.newColumn(null).withTitle(vm.translateFilter('serviceFee.activity')).renderWith(function (data, type, full, meta) {
                    var htmlSection = '';
                    htmlSection = '<div>' + vm.localizeFilter(data) + '</div>';
                    return htmlSection;
                }),
                DTColumnBuilder.newColumn('fee').withTitle(vm.translateFilter('serviceFee.fee'))];
        }

        vm.Init = function () {
            vm.isBusy = false;
            vm.activeStep = 1;
            //vm.getAllPressCardApplications.deliveryType = true;
            vm.format = 'dd-MMMM-yyyy';
            vm.terms = {};
            vm.uploadAssignmentLetterUrl = 'api/Upload/UploadFile?uploadFile=assignmentLetterPath';
            vm.uploadAcademicQualificationUrl = 'api/Upload/UploadFile?uploadFile=QualificationCopyPath';
            vm.passportCopyUrl = 'api/Upload/UploadFile?uploadFile=ProfilePassportPhotoPath';
            vm.photoUrl = 'api/Upload/UploadFile?uploadFile=ProfilePersonalPhotoPath';
            vm.acquitanceFormUrl = 'api/Upload/UploadFile?uploadFile=AcquaintanceFormPath';

            vm.happinessMeterObj = {};
            vm.happinessMeterObj.serviceId = 19;
            vm.happinessMeterObj.applicationType = {};
            vm.happinessMeterObj.applicationType.pmoCode = "000";
        };
        //New Form Condition
        if ($state.params === undefined || $state.params.id === undefined || $state.params.id === "") {
            // New Permit
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
                        serviceId: 19
                    }
                },
                mediaLicenseEconomicActivities: [{}],
                pressCard: [{}]

            };
            vm.Init();
        }
        else {
        }
        vm.save = function (applicationStatusId) {
            vm.isBusy = true;
            vm.mediaLicenses.applicationDetail.payments[0].paymentDetails = vm.serviceFeesObj.serviceFee;
            vm.mediaLicenses.mediaLicenseEconomicActivities.splice(0, 1);
            vm.mediaLicenses.mediaLicenseEconomicActivities.push({ economicActivity: { id: 1042, isRequireThirdPartyApproval: false } });

            if ($rootScope.app.isPMOHappiness) {
                switch (applicationStatusId) {
                    case 1:
                        $http.post($rootScope.app.httpSource + 'api/ForeignPressCard/SaveForeignPressCard', vm.mediaLicenses)
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
                        $http.post($rootScope.app.httpSource + 'api/ForeignPressCard/SubmitForeignPressCard', vm.mediaLicenses)
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
                            $http.post($rootScope.app.httpSource + 'api/ForeignPressCard/SaveForeignPressCard', vm.mediaLicenses)
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
                            $http.post($rootScope.app.httpSource + 'api/ForeignPressCard/SubmitForeignPressCard', vm.mediaLicenses)
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
                    $http.post($rootScope.app.httpSource + 'api/ForeignPressCard/UpdateForeignPressCard', vm.mediaLicenses)
                        .then(function (response) {
                            $state.go('app.dashboard');
                        },
                            function (response) { // optional
                                vm.isBusy = false;
                            });
                    break;

                case 14:
                    $http.post($rootScope.app.httpSource + 'api/ForeignPressCard/SubmitUpdateForeignPressCard', vm.mediaLicenses)
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
    IssueSponsorshipController.$inject = ['$rootScope', '$scope', '$http', '$stateParams', '$state', '$window', '$uibModal', 'UserProfile', 'browser', 'DTOptionsBuilder', 'DTColumnBuilder', '$compile', '$filter', 'SweetAlert'];
})();