/**=========================================================
 * Module: LoginController.js
 * Controller for the Chat APP 
 =========================================================*/

(function () {
    'use strict';

    angular
        .module('eServices')
        .controller('CancelMediaActivityController', CancelMediaActivityController);

    function CancelMediaActivityController($rootScope, $scope, $http, $stateParams, $state, $window, $uibModal, UserProfile, browser, DTOptionsBuilder, DTColumnBuilder, $compile, $filter) {
        var vm = this;
        vm.activitiesDt = {};
        vm.activitiesDt.dtInstance = {};
        vm.uploadInitialApprovalUrl = 'api/Upload/UploadFile?uploadFile=InitialApprovalPath';

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
                applicationTypeId: 4
            }
        };

        vm.goToSecondStep = function () {
            vm.activeStep = 2;
        }

        vm.goToThirdStep = function () {
            if (vm.mediaLicenses.mediaLicenseEconomicActivities == undefined || vm.mediaLicenses.mediaLicenseEconomicActivities.length == 0) {
                vm.showChooseOneActivity = true;
            }
            else {
                vm.showChooseOneActivity = false;
                vm.activeStep = 3;
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
        vm.dtPartnerInstance = {};

        vm.partnerActionsHtml = function (data, type, full, meta) {
            var htmlSection = '';

            htmlSection = '<div class="list-icon"><div class="inline" ng-click="mediaCtl.editPartner(\'lg\',' +
                data.id + ', $event)"><em class="fa fa-pencil" style="cursor:pointer" uib-tooltip="' +
                vm.translateFilter('general.edit') + '"></em></div></div>';

            return htmlSection;
        };

        vm.partnerCountryHtml = function (data, type, full, meta) {
            var htmlSection = '';

            if (data.person) {
                htmlSection = '<div><span>' + $filter('localizeString')(data.person.country) + '</span></div>';
            }
            else {
                htmlSection = '<div><span>' + $filter('localizeString')(data.partnerEstablishment.country) + '</span></div>';
            }

            return htmlSection;
        };

        vm.partnerCountryFlagHtml = function (data, type, full, meta) {
            var htmlSection = '';

            if (data.person) {
                htmlSection = '<div><span><img class="img-responsive" style="display:inline-block; padding-left:10px; padding-right: 10px; max-width:60px" src="../src/imgs/Countries/' +
                    data.person.country.isoCode2 + '.png" /></span></div>';
            }
            else {
                htmlSection = '<div><span><img class="img-responsive" style="display:inline-block; padding-left:10px; padding-right: 10px; max-width:60px" src="../src/imgs/Countries/' +
                    data.partnerEstablishment.country.isoCode2 + '.png" /></span></div>';
            }

            return htmlSection;
        };

        vm.editPartner = function (size, personId, event) {
            var modalInstance = $uibModal.open({
                templateUrl: 'app/views/Account/completeProfile/establishmentPartner/establishmentPartner.html',
                controller: 'EstablishmentPartnerController',
                size: size,
                resolve: {
                    establishmentPartner: function () {
                        return $filter('filter')(vm.licenseOwners, { id: personId }, true)[0];
                    }
                }
            });

            modalInstance.result.then(function (establishmentPartner) {
                var partner = $filter('filter')(vm.licenseOwners, { id: establishmentPartner.id }, true)[0];
                partner = establishmentPartner;
                $http.post($rootScope.app.httpSource + 'api/EstablishmentPartner/UpdateEstablishmentPartner', partner)
                    .then(
                        function (response) {
                            vm.dtPartnerInstance.rerender();
                        },
                        function (response) {

                        });

            }, function () { });
        };

        vm.createdRow = function (row, data, dataIndex) {
            $compile(angular.element(row).contents())($scope);
        }

        vm.serverPartnerData = function (sSource, aoData, fnCallback, oSettings) {
            $http.get($rootScope.app.httpSource + 'api/Establishment/GetLicenseOwners?estId=' + vm.mediaLicenses.applicationDetail.application.establishment.id)
                .then(function (response) {
                    var draw = aoData[0].value;
                    var records;
                    vm.licenseOwners = response.data;

                    for (var i = 0; i < vm.licenseOwners.length; i++) {
                        vm.licenseOwners[i].requireAcquintanceForm = true;
                    }

                    if (vm.licenseOwners.length > 0) {
                        records = {
                            'draw': draw,
                            'recordsTotal': vm.licenseOwners.length,
                            'recordsFiltered': vm.licenseOwners.length,
                            'data': vm.licenseOwners
                        };
                    }
                    else {
                        records = {
                            'draw': draw,
                            'recordsTotal': 0,
                            'recordsFiltered': 0,
                            'data': vm.licenseOwners
                        };
                    }

                    fnCallback(records);
                });
        };

        vm.activitiesDt.actionsHtml = function (data, type, full, meta) {
            var htmlSection = '';

            if (data.mediaLicenseEconomicActivity.cancelledDate == null) {
                htmlSection = '<div class="list-icon"><div class="inline" ng-click="mediaCtl.activitiesDt.delete(' + data.id +
                    ', $event)"><em class="fa fa-trash" style="cursor:pointer"></em></div></div>';
            }
            else {
                htmlSection = '<div class="list-icon"><div class="inline" ng-click="mediaCtl.activitiesDt.undo(' + data.id +
                    ', $event)"><em class="fa fa-undo" style="cursor:pointer"></em></div></div>';
            }

            return htmlSection;
        };

        vm.activitiesDt.delete = function (certificateDetailId, event) {
            var index;

            if (certificateDetailId == 0 || certificateDetailId == undefined) {
                index = vm.activitiesDt.dtInstance.DataTable.rows({ order: 'applied' }).nodes().indexOf(event.currentTarget.parentNode.parentNode.parentNode);
                vm.mediaLicenses.applicationDetail.certificates[0].certificateDetails[index].mediaLicenseEconomicActivity.cancelledDate = new Date();
            }
            else {
                index = vm.mediaLicenses.applicationDetail.certificates[0].certificateDetails.indexOf(
                    $filter('filter')(vm.mediaLicenses.applicationDetail.certificates[0].certificateDetails, { id: certificateDetailId }, true)[0]);
                $filter('filter')(vm.mediaLicenses.applicationDetail.certificates[0].certificateDetails,
                    { id: certificateDetailId }, true)[0].mediaLicenseEconomicActivity.cancelledDate = new Date();
            }

            vm.serviceFeesObj.economicActivityIds = [];
            vm.mediaLicenses.mediaLicenseEconomicActivities = [];

            for (var i = 0; i < vm.mediaLicenses.applicationDetail.certificates[0].certificateDetails.length; i++) {
                if (vm.mediaLicenses.applicationDetail.certificates[0].certificateDetails[i].mediaLicenseEconomicActivity.cancelledDate != null) {

                    if (moment(vm.mediaLicenses.applicationDetail.certificates[0].certificateDetails[i].expiryDate).add(1, 'M') > new Date()) {
                        vm.serviceFeesObj.economicActivityIds.push(vm.mediaLicenses.applicationDetail.certificates[0].certificateDetails[i].id);
                    }

                    vm.mediaLicenses.mediaLicenseEconomicActivities.push(vm.mediaLicenses.applicationDetail.certificates[0].certificateDetails[i].mediaLicenseEconomicActivity);
                    vm.showChooseOneActivity = false;
                }
            }

            if (vm.mediaLicenses.applicationDetail.certificates[0].certificateDetails.length == vm.serviceFeesObj.economicActivityIds.length) {
                vm.showCancelLicenseAlert = true;
            }
            else {
                vm.showCancelLicenseAlert = false;
            }

            vm.serviceFeesObj.reloadTable();

            vm.activitiesDt.dtInstance.rerender();
        };

        vm.activitiesDt.undo = function (certificateDetailId, event) {
            var index;

            if (certificateDetailId == 0 || certificateDetailId == undefined) {
                index = vm.activitiesDt.dtInstance.DataTable.rows({ order: 'applied' }).nodes().indexOf(event.currentTarget.parentNode.parentNode.parentNode);
                vm.mediaLicenses.applicationDetail.certificates[0].certificateDetails[index].mediaLicenseEconomicActivity.cancelledDate = null;
            }
            else {
                index = vm.mediaLicenses.applicationDetail.certificates[0].certificateDetails.indexOf(
                    $filter('filter')(vm.mediaLicenses.applicationDetail.certificates[0].certificateDetails, { id: certificateDetailId }, true)[0]);
                $filter('filter')(vm.mediaLicenses.applicationDetail.certificates[0].certificateDetails,
                    { id: certificateDetailId }, true)[0].mediaLicenseEconomicActivity.cancelledDate = null;
            }

            vm.serviceFeesObj.economicActivityIds = [];
            vm.mediaLicenses.mediaLicenseEconomicActivities = [];

            for (var i = 0; i < vm.mediaLicenses.applicationDetail.certificates[0].certificateDetails.length; i++) {
                if (vm.mediaLicenses.applicationDetail.certificates[0].certificateDetails[i].mediaLicenseEconomicActivity.cancelledDate != null &&
                    moment(vm.mediaLicenses.applicationDetail.certificates[0].certificateDetails[i].expiryDate).add(1, 'M') > new Date()) {
                    vm.serviceFeesObj.economicActivityIds.push(vm.mediaLicenses.applicationDetail.certificates[0].certificateDetails[i].id);
                    vm.mediaLicenses.mediaLicenseEconomicActivities.push(vm.mediaLicenses.applicationDetail.certificates[0].certificateDetails[i].economicActivity);
                }
            }

            if (vm.mediaLicenses.applicationDetail.certificates[0].certificateDetails.length == vm.serviceFeesObj.economicActivityIds.length) {
                vm.showCancelLicenseAlert = true;
            }
            else {
                vm.showCancelLicenseAlert = false;
            }

            vm.serviceFeesObj.reloadTable();

            vm.activitiesDt.dtInstance.rerender();
        };

        vm.Init = function () {
            vm.isBusy = false;
            vm.activeStep = 1;
            vm.serviceFeesObj = { serviceId: 9, serviceFee: [], isCancel: true, economicActivityIds: [] };
            vm.terms = {};
            vm.user = UserProfile.getProfile();
            vm.happinessMeterObj = {};

            if (vm.mediaLicenses.newspapers != null && vm.mediaLicenses.newspapers.length >= 1) {
                vm.happinessMeterObj.serviceId = 12;
                vm.happinessMeterObj.applicationType = {};
                vm.happinessMeterObj.applicationType.pmoCode = "004";
            }
            else {
                vm.happinessMeterObj.serviceId = 9;
                vm.happinessMeterObj.applicationType = {};
                vm.happinessMeterObj.applicationType.pmoCode = "005";
            }

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
            else {
                vm.isIndividual = false;
            }

            gridTable();

            if ($rootScope.language.selected !== 'English') {
                vm.dtPartnerOptions = DTOptionsBuilder.newOptions()
                    .withFnServerData(vm.serverPartnerData)
                    .withOption('serverSide', true)
                    .withDataProp('data')
                    .withOption('processing', true)
                    .withOption('responsive', true)
                    .withOption('bFilter', false)
                    .withOption('paging', false)
                    .withOption('info', false)
                    .withLanguageSource('app/langs/ar.json')
                    .withOption('createdRow', vm.createdRow)
                    .withOption('rowCallback', vm.rowCallback).withBootstrap();
            }
            else {
                vm.dtPartnerOptions = DTOptionsBuilder.newOptions()
                    .withFnServerData(vm.serverPartnerData)
                    .withOption('serverSide', true)
                    .withDataProp('data')
                    .withOption('processing', true)
                    .withOption('responsive', true)
                    .withOption('bFilter', false)
                    .withOption('paging', false)
                    .withOption('info', false)
                    .withLanguageSource('app/langs/en.json')
                    .withOption('createdRow', vm.createdRow)
                    .withOption('rowCallback', vm.rowCallback).withBootstrap();
            }

            vm.dtPartnerColumns = [
                DTColumnBuilder.newColumn(null).withTitle(vm.translateFilter('completeProfile.name')).renderWith(function (data, type) {
                    if (data.person != null) {
                        return data.person.name;
                    }
                    else {
                        return data.partnerEstablishment.nameEn;
                    }
                }),
                DTColumnBuilder.newColumn('id').notVisible(),
                DTColumnBuilder.newColumn(null).withTitle(vm.translateFilter('profileNationalityDirective.Nationality')).renderWith(vm.partnerCountryHtml),
                DTColumnBuilder.newColumn(null).withTitle(' ').renderWith(vm.partnerCountryFlagHtml),
                DTColumnBuilder.newColumn(null).withTitle(vm.translateFilter('profileNationalityDirective.EmiratesId')).renderWith(function (data, type) {
                    if (data.person != null) {
                        return data.person.emiratesId;
                    }
                    else {
                        return '';
                    }
                }),
                DTColumnBuilder.newColumn(null).withTitle(vm.translateFilter('profileNationalityDirective.DateOfBirth')).renderWith(function (data, type) {
                    if (data.person != null) {
                        return $filter('date')(data.person.dateOfBirth, 'dd-MMMM-yyyy');
                    }
                    else {
                        return '';
                    }
                }),
                DTColumnBuilder.newColumn(null).withTitle(vm.translateFilter('general.actions')).notSortable()
                    .renderWith(vm.partnerActionsHtml).withOption('width', '15%')];
        };

        function gridTable() {
            //Members Datatable
            vm.activitiesDt.serverData = function (sSource, aoData, fnCallback, oSettings) {
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
                    'recordsTotal': vm.mediaLicenses.applicationDetail.certificates[0].certificateDetails.length,
                    'recordsFiltered': vm.mediaLicenses.applicationDetail.certificates[0].certificateDetails.length,
                    'data': vm.mediaLicenses.applicationDetail.certificates[0].certificateDetails
                };

                fnCallback(records);
            };

            vm.activitiesDt.createdRow = function (row, data, dataIndex) {
                // Recompiling so we can bind Angular directive to the DT
                if (data.mediaLicenseEconomicActivity.cancelledDate != null) {
                    $(row).addClass('strikeout');
                }
                $compile(angular.element(row).contents())($scope);
            };

            if ($rootScope.language.selected !== 'English') {
                vm.activitiesDt.dtOptions = DTOptionsBuilder.newOptions()
                    .withFnServerData(vm.activitiesDt.serverData)
                    .withOption('serverSide', true)
                    .withDataProp('data')
                    .withOption('processing', true)
                    .withOption('responsive', true)
                    .withLanguageSource('app/langs/ar.json')
                    .withOption('bFilter', false)
                    .withOption('paging', false)
                    .withOption('info', false)
                    .withOption('createdRow', vm.activitiesDt.createdRow).withBootstrap();
            }
            else {
                vm.activitiesDt.dtOptions = DTOptionsBuilder.newOptions()
                    .withFnServerData(vm.activitiesDt.serverData)
                    .withOption('serverSide', true)
                    .withDataProp('data')
                    .withOption('processing', true)
                    .withOption('responsive', true)
                    .withOption('bFilter', false)
                    .withOption('paging', false)
                    .withOption('info', false)
                    .withOption('createdRow', vm.activitiesDt.createdRow).withBootstrap();
            };

            vm.activitiesDt.dtColumns = [
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
                    }),
                DTColumnBuilder.newColumn(null).withTitle(vm.translateFilter('general.actions')).notSortable()
                    .renderWith(vm.activitiesDt.actionsHtml).withOption('width', '10%')];
        }

        $http.get($rootScope.app.httpSource + 'api/Establishment/GetByApplicationId?id=' + $state.params.applicationId)
            .then(function (response) {
                vm.mediaLicenses.applicationDetail.application.establishment = response.data;
            });

        $http.get($rootScope.app.httpSource + 'api/MediaLicense/GetById?id=' + $state.params.applicationDetailId)
            .then(function (response) {
                vm.mediaLicenses.applicationDetail.certificates = response.data.applicationDetail.certificates;
                vm.mediaLicenses.applicationDetail.application.establishment = response.data.applicationDetail.application.establishment;
                vm.mediaLicenses.tenancyContractCopyUrl = response.data.tenancyContractCopyUrl;
                vm.mediaLicenses.tenancyContractCopyUrlFullPath = response.data.tenancyContractCopyUrlFullPath;
                vm.mediaLicenses.mediaLicenseNumber = response.data.mediaLicenseNumber;
                vm.mediaLicenses.applicationDetail.acquitanceFormUrl = response.data.applicationDetail.acquitanceFormUrl;
                vm.mediaLicenses.applicationDetail.acquaintanceFormCopyUrlFullPath = response.data.applicationDetail.acquaintanceFormCopyUrlFullPath;
                vm.mediaLicenses.yearsOfLicense = 1;
                vm.mediaLicenses.newspapers = response.data.newspapers;
                vm.mediaLicenses.chiefEditors = response.data.chiefEditors;
                vm.Init();
            });

        //Save the details to the server

        vm.save = function () {
            vm.isBusy = true;
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
    }

    CancelMediaActivityController.$inject = ['$rootScope', '$scope', '$http', '$stateParams', '$state', '$window', '$uibModal', 'UserProfile', 'browser', 'DTOptionsBuilder', 'DTColumnBuilder',
        '$compile', '$filter'];
})();