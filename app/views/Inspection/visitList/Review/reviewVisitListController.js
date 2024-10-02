
/**=========================================================
 * Module: ReviewVisitListController.js
 * Controller for Review Visit List
 =========================================================*/
(function () {
    'use strict';

    angular
        .module('eServices')
        .controller('ReviewVisitListController', ReviewVisitListController);

    function ReviewVisitListController($rootScope, $scope, $http, $stateParams, $state, $window, $uibModal, UserProfile, DTOptionsBuilder, DTColumnBuilder, $filter, $compile) {
        var vm = this;
        vm.translateFilter = $filter('translate');
        vm.isIndividual = false;
        vm.individualUser = { id: 0 };
        vm.visitdetail = true;

        function gridTable() {
            //Members Datatable

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
                    'recordsTotal': vm.applicationDetatils.certificates[0].certificateDetails.length,
                    'recordsFiltered': vm.applicationDetatils.certificates[0].certificateDetails.length,
                    'data': vm.applicationDetatils.certificates[0].certificateDetails
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

        $http.get($rootScope.app.httpSource + 'api/Visit/GetVisitById?visitId=' + $state.params.id)
            .then(function (response) {
                vm.visitListDetails = response.data;
                vm.visitStatusId = vm.visitListDetails.visitStatusId;
                vm.serviceFeesObj = { serviceId: 15, serviceFee: [], visitId: vm.visitListDetails.id };

                if (vm.visitListDetails.establishment != null && vm.visitListDetails.establishment.licenseNumber != '900098_9') {
                    // Get Application details
                    $http.get($rootScope.app.httpSource + 'api/InspectionTask/GetApplicationDetailsById?establishmentId=' + vm.visitListDetails.establishment.id)
                        .then(function (response) {
                            vm.applicationDetatils = response.data;
                            if (vm.applicationDetatils != null) {
                                vm.pdfUrl = vm.applicationDetatils.certificates[0].certificateWithHeaderFullUrl;

                                //get Medial license details
                                $http.get($rootScope.app.httpSource + 'api/MediaLicense/GetById?Id=' + vm.applicationDetatils.certificates[0].applicationDetailId) // pass applicationDetailId
                                    .then(function (response) {
                                        vm.mediaLicenses = response.data;
                                        gridTable();
                                    });
                            }
                        });
                }
                else {
                    vm.isIndividual = true;
                    vm.individualUser = vm.visitListDetails.userProfile;
                    // Get Application details
                    $http.get($rootScope.app.httpSource + 'api/InspectionTask/GetApplicationByUserId?userId=' + vm.visitListDetails.userProfile.userId)
                        .then(function (response) {
                            vm.applicationDetatils = response.data;
                            if (vm.applicationDetatils != null) {
                                vm.pdfUrl = vm.applicationDetatils.certificates[0].certificateWithHeaderFullUrl;

                                //get Medial license details
                                $http.get($rootScope.app.httpSource + 'api/MediaLicense/GetById?Id=' + vm.applicationDetatils.certificates[0].applicationDetailId)
                                    .then(function (response) {
                                        vm.mediaLicenses = response.data;
                                        gridTable();
                                    });
                            }
                        });
                }
            });

    }
    ReviewVisitListController.$inject = ['$rootScope', '$scope', '$http', '$stateParams', '$state', '$window', '$uibModal', 'UserProfile', 'DTOptionsBuilder',
        'DTColumnBuilder', '$filter', '$compile'];

})();