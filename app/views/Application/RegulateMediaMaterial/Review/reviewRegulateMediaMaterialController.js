/**=========================================================
 * Module: LoginController.js
 * Controller for the Chat APP 
 =========================================================*/

(function () {
    'use strict';

    angular
        .module('eServices')
        .controller('ReviewRegulateMediaMaterialController', ReviewRegulateMediaMaterialController);

    function ReviewRegulateMediaMaterialController($rootScope, $scope, $http, $stateParams, $state, $window, $uibModal, UserProfile, DTOptionsBuilder, DTColumnBuilder, $filter, $compile) {
        var vm = this;
        vm.translateFilter = $filter('translate');
        vm.dtPartnerInstance = {};
        vm.applicationOpen = true;
        vm.serviceFeesObj = { serviceId: 3, serviceFee: [] };

        vm.Init = function () {
            vm.user = UserProfile.getProfile();

            vm.createdRow = function (row, data, dataIndex) {
                // Recompiling so we can bind Angular directive to the DT
                $compile(angular.element(row).contents())($scope);
            }

            //Items Datatable
            vm.regulateItemsDt = {};
            vm.regulateItemsDt.dtInstance = {};
            vm.regulateItemsDt.serverData = function (sSource, aoData, fnCallback, oSettings) {
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
                    'recordsTotal': vm.mediaMaterial.regulateEntriesItems.length,
                    'recordsFiltered': vm.mediaMaterial.regulateEntriesItems.length,
                    'data': vm.mediaMaterial.regulateEntriesItems
                };

                fnCallback(records);
            };

            vm.regulateItemsDt.createdRow = function (row, data, dataIndex) {

                if (vm.user.userTypeCode == "06" && data.book != null && data.book.isApproved != null) {
                    if (data.book.isApproved) {
                        $('td', row).eq(7).addClass('approvedBookStyle');
                    }
                    else {
                        $('td', row).eq(7).addClass('notApprovedBookStyle');
                    }
                }

                if (vm.user.userTypeCode == "06" && data.newspaperId != null && data.isValid != null) {
                    if (data.isValid) {
                        $('td', row).eq(7).addClass('approvedBookStyle');
                    }
                    else {
                        $('td', row).eq(7).addClass('notApprovedBookStyle');
                    }
                }

                if (vm.user.userTypeCode == "06" && data.newspaperId == null && data.title != "Book List" && (data.materialTypeId == 14 || data.materialTypeId == 21 || data.materialTypeId == 28)) {
                    $('td', row).eq(7).addClass('notApprovedBookStyle');
                }

                // Recompiling so we can bind Angular directive to the DT
                $compile(angular.element(row).contents())($scope);
            }

            vm.regulateItemsDt.rowCallback = function () { };

            vm.translateFilter = $filter('translate');
            if ($rootScope.language.selected !== 'English') {
                vm.regulateItemsDt.dtOptions = DTOptionsBuilder.newOptions()
                    .withFnServerData(vm.regulateItemsDt.serverData)
                    .withOption('serverSide', true)
                    .withDataProp('data')
                    .withOption('processing', true)
                    .withOption('responsive', true)
                    .withLanguageSource('app/langs/ar.json')
                    .withOption('bFilter', false)
                    .withOption('paging', false)
                    .withOption('info', false)
                    .withOption('createdRow', vm.regulateItemsDt.createdRow)
                    .withOption('rowCallback', vm.regulateItemsDt.rowCallback).withBootstrap();
            }
            else {
                vm.regulateItemsDt.dtOptions = DTOptionsBuilder.newOptions()
                    .withFnServerData(vm.regulateItemsDt.serverData)
                    .withOption('serverSide', true)
                    .withDataProp('data')
                    .withOption('processing', true)
                    .withOption('responsive', true)
                    .withOption('bFilter', false)
                    .withOption('paging', false)
                    .withOption('info', false)
                    .withOption('createdRow', vm.regulateItemsDt.createdRow)
                    .withOption('rowCallback', vm.regulateItemsDt.rowCallback).withBootstrap();
            }

            vm.regulateItemsDt.dtColumns = [

                DTColumnBuilder.newColumn(null).withTitle(vm.translateFilter('mediaMaterial.materialType')).renderWith(
                    function (data, type) {
                        if (data.materialType == undefined) {
                            return $filter('localizeString')(data.customMaterial.materialType);
                        }
                        else {
                            return $filter('localizeString')(data.materialType);
                        }
                    }),
                DTColumnBuilder.newColumn(null).withTitle(vm.translateFilter('mediaMaterial.hsCode')).renderWith(
                    function (data, type) {
                        if (data.materialType == undefined)
                            return data.customMaterial.hsCode;
                        else
                            return '';
                    }),
                DTColumnBuilder.newColumn(null).withTitle(vm.translateFilter('mediaMaterial.titleName')).renderWith(
                    function (data, type) {
                        if (data.title != undefined)
                            return data.title;
                        else
                            return '';
                    }),
                DTColumnBuilder.newColumn(null).withTitle(vm.translateFilter('printingPermit.authorName')).renderWith(
                    function (data, type) {
                        if (data.book != null)
                            return data.book.authorName;
                        else
                            return '';
                    }),
                DTColumnBuilder.newColumn(null).withTitle(vm.translateFilter('printingPermit.isbn')).renderWith(
                    function (data, type) {
                        if (data.book != null && data.book.isbn)
                            return data.book.isbn;
                        else
                            return '';
                    }),
                DTColumnBuilder.newColumn(null).withTitle(vm.translateFilter('mediaMaterial.language')).renderWith(
                    function (data, type) {
                        if (data.book == null) {
                            if (data.language != null)
                                return $filter('localizeString')(data.language);
                            else
                                return '';
                        }
                        else {
                            var languages = '';
                            for (var i = 0; i < data.book.bookLanguages.length; i++) {
                                if (i == data.book.bookLanguages.length - 1) {
                                    languages += $filter('localizeString')(data.book.bookLanguages[i].language);
                                }
                                else {
                                    languages += $filter('localizeString')(data.book.bookLanguages[i].language) + ", ";
                                }
                            }
                            return languages;
                        }
                    }),
                DTColumnBuilder.newColumn('numberOfItems').withTitle(vm.translateFilter('mediaMaterial.numberOfCopies')),
                DTColumnBuilder.newColumn(null).withTitle(vm.translateFilter('mediaMaterial.weight')).renderWith(
                    function (data, type) {
                        if (data.weight != undefined)
                            return data.weight;
                        else
                            return '';
                    })];

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
        };

        //Get the details of the submitted Form to edit
        $http.get($rootScope.app.httpSource + 'api/RegulateEntry/GetById?id=' + $state.params.id)
            .then(function (response) {
                vm.mediaMaterial = response.data;
                vm.userTypeCode = vm.mediaMaterial.applicationDetail.application.user.userProfiles[0].userType.code;
                vm.Init();
            });
    }

    ReviewRegulateMediaMaterialController.$inject = ['$rootScope', '$scope', '$http', '$stateParams', '$state', '$window', '$uibModal', 'UserProfile', 'DTOptionsBuilder',
        'DTColumnBuilder', '$filter', '$compile'];

})();