/**=========================================================
 * Module: LoginController.js
 * Controller for the Chat APP 
 =========================================================*/

(function () {
    'use strict';

    angular
        .module('eServices')
        .controller('ReviewMediaLicenseController', ReviewMediaLicenseController);

    function ReviewMediaLicenseController($rootScope, $scope, $http, $stateParams, $state, $window, $uibModal, UserProfile, DTOptionsBuilder, DTColumnBuilder, $filter, $compile) {
        var vm = this;
        vm.translateFilter = $filter('translate');
        vm.dtPartnerInstance = {};
        vm.applicationOpen = true;
        vm.isIndividualSocialMedia = false;

        vm.Init = function () {
            vm.serviceFees = { serviceId: 9, serviceFee: [] };
            vm.user = UserProfile.getProfile();
        };

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
                    'recordsTotal': vm.mediaLicenses.applicationDetail.certificates[0].certificateDetails.length,
                    'recordsFiltered': vm.mediaLicenses.applicationDetail.certificates[0].certificateDetails.length,
                    'data': vm.mediaLicenses.applicationDetail.certificates[0].certificateDetails
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

        //Get the details of the submitted Form to edit
        $http.get($rootScope.app.httpSource + 'api/MediaLicense/GetById?id=' + $state.params.id)
          .then(function (response) {
              vm.mediaLicenses = response.data;
              vm.userTypeCode = vm.mediaLicenses.applicationDetail.application.user.userProfiles[0].userType.code;
              if (vm.userTypeCode == '01') {
                  vm.isIndividualSocialMedia = true;
              }
              if (vm.mediaLicenses.applicationDetail.application.user.userProfiles[0].personId == vm.mediaLicenses.personInChargeId) {
                  vm.isBothPersonSame = true;
              }
              vm.Init();
              gridTable();
          });
    }

    ReviewMediaLicenseController.$inject = ['$rootScope', '$scope', '$http', '$stateParams', '$state', '$window', '$uibModal', 'UserProfile', 'DTOptionsBuilder',
        'DTColumnBuilder', '$filter', '$compile'];

})();