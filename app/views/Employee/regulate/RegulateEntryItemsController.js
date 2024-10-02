/**=========================================================
 * Module: DashboardController.js
 =========================================================*/

(function () {
    'use strict';

    angular
        .module('eServices')
        .controller('RegulateEntryItemsController', RegulateEntryItemsController);

    RegulateEntryItemsController.$inject = ['$rootScope', '$scope', 'UserProfile', '$filter', 'DTOptionsBuilder', 'DTColumnBuilder', '$compile', '$http', '$uibModal', '$state'];
    function RegulateEntryItemsController($rootScope, $scope, UserProfile, $filter, DTOptionsBuilder, DTColumnBuilder, $compile, $http, $uibModal, $state) {
        var vm = this;
        vm.user = UserProfile.getProfile();
        vm.dtBookInstance = {};
        vm.translateFilter = $filter('translate');

        if ($rootScope.language.selected !== 'English') {
            vm.dtBooksOptions = DTOptionsBuilder.newOptions()
                .withFnServerData(serverData)
                .withOption('serverSide', true)
                .withDataProp('data')
                .withOption('processing', true)
                .withOption('aaSorting', [[1, 'desc']])
                .withOption('stateSave', true)
                .withOption('stateSaveCallback', function (settings, data) {
                    localStorage.setItem('DataTables_' + settings.sInstance, JSON.stringify(data));
                })
                .withOption('stateLoadCallback', function (settings) {
                    return JSON.parse(localStorage.getItem('DataTables_' + settings.sInstance))
                })
                .withOption('responsive', {
                    details: {
                        renderer: renderer,
                    }
                })
                .withPaginationType('full_numbers')
                .withDisplayLength(10)
                .withLanguageSource('app/langs/ar.json')
                .withOption('createdRow', createdRow)
                .withOption('initComplete', function (settings, data) {
                    $compile(angular.element('#' + settings.sTableId).contents())($scope);
                })
                .withOption('fnDrawCallback', function (settings, data) {
                    $compile(angular.element('#' + settings.sTableId).contents())($scope);
                })
                .withOption('rowCallback', rowCallback).withBootstrap().withBootstrapOptions({
                    TableTools: {
                        classes: {
                            container: 'btn-group',
                            buttons: {
                                normal: 'btn btn-danger'
                            }
                        }
                    },
                    pagination: {
                        classes: {
                            ul: 'pagination pagination-sm'
                        }
                    }
                });
        }
        else {
            vm.dtBooksOptions = DTOptionsBuilder.newOptions()
                .withFnServerData(serverData)
                .withOption('serverSide', true)
                .withDataProp('data')
                .withOption('processing', true)
                .withOption('aaSorting', [[1, 'desc']])
                .withOption('stateSave', true)
                .withOption('stateLoadCallback', function (settings) {
                    return JSON.parse(localStorage.getItem('DataTables_' + settings.sInstance))
                })
                .withOption('responsive', {
                    details: {
                        renderer: renderer
                    }
                })
                .withPaginationType('full_numbers')
                .withDisplayLength(10)
                .withLanguageSource('app/langs/en.json')
                .withOption('createdRow', createdRow)
                .withOption('initComplete', function (settings, data) {
                    $compile(angular.element('#' + settings.sTableId).contents())($scope);
                })
                .withOption('fnDrawCallback', function (settings, data) {
                    $compile(angular.element('#' + settings.sTableId).contents())($scope);
                })
                .withOption('rowCallback', rowCallback).withBootstrap().withBootstrapOptions({
                    TableTools: {
                        classes: {
                            container: 'btn-group',
                            buttons: {
                                normal: 'btn btn-danger'
                            }
                        }
                    },
                    pagination: {
                        classes: {
                            ul: 'pagination pagination-sm'
                        }
                    }
                });
        }

        vm.dtBooksColumns = [
            DTColumnBuilder.newColumn('title').withTitle(vm.translateFilter('mediaMaterial.titleName')),
            DTColumnBuilder.newColumn('id').notVisible(),
            DTColumnBuilder.newColumn(null).withTitle(vm.translateFilter('mediaMaterial.hsCode')).renderWith(
                    function (data, type) {
                        if (data.customMaterialId) {
                            return data.customMaterial.hsCode;
                        }
                        else {
                            return "";
                        }
                    }),
            DTColumnBuilder.newColumn(null).withTitle(vm.translateFilter('mediaMaterial.materialType')).renderWith(
                    function (data, type) {
                        if (data.materialTypeId) {
                            return $filter('localizeString')(data.materialType);
                        }
                        else {
                            return $filter('localizeString')(data.customMaterial.materialType);
                        }
                    }),
            DTColumnBuilder.newColumn(null).withTitle(vm.translateFilter('printingPermit.languages')).renderWith(
                    function (data, type) {
                        if (data.languageId) {
                            return $filter('localizeString')(data.language);
                        }
                        else if (data.book) {
                            return $filter('localizeString')(data.book.bookLanguages[0].language);
                        }
                        else {
                            return "";
                        }
                    }),
            DTColumnBuilder.newColumn('numberOfItems').withTitle(vm.translateFilter('mediaMaterial.numberOfTitles')),
            DTColumnBuilder.newColumn(null).withTitle(vm.translateFilter('mediaMaterial.materialStatus')).renderWith(
                    function (data, type) {
                        if (data.isApproved != null) {
                            if (data.isApproved) {
                                return vm.translateFilter('mediaMaterial.approved');
                            }
                            else {
                                return vm.translateFilter('mediaMaterial.rejetced');
                            }
                        }
                        else {
                            return "";
                        }
                    })];

        function serverData(sSource, aoData, fnCallback, oSettings) {
            var draw = aoData[0].value;
            var order = aoData[2].value[0];
            var start = aoData[3].value;
            var length = aoData[4].value;
            var search = aoData[5].value;

            vm.params = {
                searchtext: (search.value === '' ? null : search.value),
                page: (start / length) + 1,
                pageSize: length,
                sortBy: (order.column === 0 ? 'Id' : aoData[1].value[order.column].data),
                sortDirection: order.dir,
                filterParams: (vm.filterParams === undefined ? null : vm.filterParams)
            };

            $http.post($rootScope.app.httpSource + 'api/RegulateEntry/GetAllRegulateItems', vm.params)
                .then(function (resp) {
                    vm.books = resp.data.content;
                    var records = {
                        'draw': draw,
                        'recordsTotal': resp.data.totalRecords,
                        'recordsFiltered': resp.data.totalRecords,
                        'data': resp.data.content
                    };
                    fnCallback(records);
                },
                function (response) {
                    var records = {
                        'draw': draw,
                        'recordsTotal': 0,
                        'recordsFiltered': 0,
                        'data': []
                    };
                    fnCallback(records);
                });
        };

        function createdRow(row, data, dataIndex) {
            $compile(angular.element(row).contents())($scope);
        };

        function rowCallback(tabRow, data, dataIndex) { };

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
        };

        vm.filter = function ($scope) {
            vm.filterParams = $scope.filterParams;
            vm.dtBookInstance.DataTable.draw();
        }

        vm.userFilterData = function (id) {
            vm.filterParams = {};
            vm.filterParams.userFilterId = id;
            vm.dtBookInstance.DataTable.draw();
        }

        vm.removeFilter = function ($scope) {
            $scope.filterParams = {};
            vm.filterParams = $scope.filterParams;
            vm.dtBookInstance.DataTable.draw();
        }

        function actionsHtml(data, type, full, meta) {
            var htmlSection = '';
            htmlSection = '<div style="display:inline-block" class="list-icon"><div class="inline" ng-click="books.review(' + data.id + ')"><em class="fa fa-search" ' +
                'style="cursor:pointer" uib-tooltip="' + vm.translateFilter('bookCard.review') + '"></em></div></div>';
            return htmlSection;
        };

        vm.review = function (Id) {
            $state.go('app.bookCard', { id: Id });
        };
    }
})();