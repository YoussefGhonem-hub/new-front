/**=========================================================
 * Module: LoginController.js
 * Controller for the Chat APP 
 =========================================================*/

(function () {
    'use strict';

    angular
        .module('eServices')
        .controller('ReviewNewspaperMagazineLicenseController', ReviewNewspaperMagazineLicenseController);

    function ReviewNewspaperMagazineLicenseController($rootScope, $scope, $http, $stateParams, $state,  $window, $uibModal, UserProfile, DTOptionsBuilder, DTColumnBuilder, $filter, $compile) {
        var vm = this;
        vm.translateFilter = $filter('translate');
        vm.dtPartnerInstance = {};
        vm.applicationOpen = true;

        vm.Init = function () {
            vm.serviceFees = { serviceId: 12, serviceFee: [] };
            vm.user = UserProfile.getProfile();

            vm.createdRow = function (row, data, dataIndex) {
                // Recompiling so we can bind Angular directive to the DT
                $compile(angular.element(row).contents())($scope);
            }

            function renderer(api, rowIdx, columns) {
                var data = $.map(columns, function (col, i) {
                    return col.hidden ?
                        '<li data-dtr-index="' + col.columnIndex + '" data-dt-row="' + col.rowIndex + '" data-dt-column="' + col.columnIndex + '">' +
                             '<span class="dtr-title">' +
                                 col.title +
                           '</span> ' +
                           '<span class="dtr-data">' +
                               col.data +
                          '</span>' +
                      '</li>' :
                      '';
                }).join('');
                return data ?
                    $compile(angular.element($('<ul data-dtr-index="' + rowIdx + '"/>').append(data)))($scope) :
                 false;
            }

            //Items Datatable
            vm.languageItemsDt = {};
            vm.languageItemsDt.dtInstance = {};
            vm.languageItemsDt.serverData = function (sSource, aoData, fnCallback, oSettings) {
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
                    'recordsTotal': vm.license.newspapers[0].newspaperLanguages.length,
                    'recordsFiltered': vm.license.newspapers[0].newspaperLanguages.length,
                    'data': vm.license.newspapers[0].newspaperLanguages
                };

                fnCallback(records);
            };

            if ($rootScope.language.selected !== 'English') {
                vm.languageItemsDt.dtOptions = DTOptionsBuilder.newOptions()
                .withFnServerData(vm.languageItemsDt.serverData)
                .withOption('serverSide', true)
                .withDataProp('data')
                .withOption('processing', true)
                .withOption('responsive', true)
                .withLanguageSource('app/langs/ar.json')
                .withOption('bFilter', false)
                .withOption('paging', false)
                .withOption('info', false)
                .withOption('createdRow', vm.languageItemsDt.createdRow)
                .withOption('rowCallback', vm.languageItemsDt.rowCallback).withBootstrap();
            }
            else {
                vm.languageItemsDt.dtOptions = DTOptionsBuilder.newOptions()
                .withFnServerData(vm.languageItemsDt.serverData)
                .withOption('serverSide', true)
                .withDataProp('data')
                .withOption('processing', true)
                .withOption('responsive', true)
                .withOption('bFilter', false)
                .withOption('paging', false)
                .withOption('info', false)
                .withOption('createdRow', vm.languageItemsDt.createdRow)
                .withOption('rowCallback', vm.languageItemsDt.rowCallback).withBootstrap();
            }

            vm.languageItemsDt.dtColumns = [
                DTColumnBuilder.newColumn('language').withTitle(vm.translateFilter('mediaMaterial.language')).renderWith(
                function (data, type) {
                    return $filter('localizeString')(data);
                }), ,
                DTColumnBuilder.newColumn('name').withTitle(vm.translateFilter('newspaper.name'))];
        };

        //Get the details of the submitted Form to edit
        $http.get($rootScope.app.httpSource + 'api/MediaLicense/GetById?id=' + $state.params.id)
          .then(function (response) {
              vm.license = response.data;
              vm.Init();
          });
    }

    ReviewNewspaperMagazineLicenseController.$inject = ['$rootScope', '$scope', '$http', '$stateParams', '$state',   '$window', '$uibModal', 'UserProfile', 'DTOptionsBuilder',
        'DTColumnBuilder', '$filter', '$compile'];

})();