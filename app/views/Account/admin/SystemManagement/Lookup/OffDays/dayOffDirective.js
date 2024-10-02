(function () {
    'use strict';

    angular
        .module('eServices')
        .directive('dayOff', dayOff)

    dayOff.$inject = ['$rootScope', '$http', '$filter', 'DTOptionsBuilder', 'DTColumnBuilder', '$interval', 'SweetAlert', '$uibModal', '$compile'];

    function dayOff($rootScope, $http, $filter, DTOptionsBuilder, DTColumnBuilder, $interval, SweetAlert, $uibModal, $compile) {
        return {
            restrict: 'E',
            scope: {
                vacationDay: '=ngModel'
            },
            templateUrl: '/app/views/Account/admin/SystemManagement/Lookup/OffDays/dayOffDirective.html',
            link: link
        };

        function link(scope, element, attrs) {
            var translate = $filter('translate');
            scope.translateFilter = $filter('translate');
            scope.dtApplicationInstance = {};

            var opened = false;
            scope.authorized = true;

            scope.serverData = function (sSource, aoData, fnCallback, oSettings) {
                var draw = aoData[0].value;
                var order = aoData[2].value[0];
                var start = aoData[3].value;
                var length = aoData[4].value;
                var search = aoData[5].value;

                scope.params = {
                    searchtext: (search.value === '' ? null : search.value),
                    page: (start / length) + 1,
                    pageSize: length,
                    sortBy: (order.column === 1 ? 'createdOn' : aoData[1].value[order.column].data),//SortBy createdOn by default
                    sortDirection: order.dir,
                    filterParams: (scope.filterParams === undefined ? null : scope.filterParams)
                };

                $http.post($rootScope.app.httpSource + 'api/Offday/Get', scope.params)
                    .then(function (resp) {
                        scope.offdays = resp.data.content;
                        var records = {
                            'draw': draw,
                            'recordsTotal': resp.data.totalRecords,
                            'recordsFiltered': resp.data.totalRecords,
                            'data': resp.data.content
                        };
                        fnCallback(records);
                    });
            }

            scope.dtApplicationInstance = (inst) => {
                scope.dtApplicationInstance = inst;
            }

            function renderer(api, rowIdx, columns) {
            }

            function createdRow(row, data, dataIndex) {
                $compile(angular.element(row).contents())(scope);
            }

            function rowCallback(tabRow, data, dataIndex) {
            }

            function actionsHtml(data, type, full, meta) {
                var htmlSection = "";
                htmlSection += '<div style="display:inline-block" class="list-icon"><div class="inline" ng-click="delet(' + data.id + ')"><em class="fa fa-trash" style="cursor:pointer" uib-tooltip="' +
                    scope.translateFilter('general.delete') + '"></em></div></div>';
                return htmlSection;
            }

            if ($rootScope.language.selected !== 'English') {
                scope.dtApplicationOptions = DTOptionsBuilder.newOptions()
                    .withFnServerData(scope.serverData)
                    .withOption('bFilter', false)
                    .withOption('serverSide', true)
                    .withDataProp('data')
                    .withOption('processing', true)
                    .withOption('searchDelay', 2000)
                    .withOption('aaSorting', [[1, 'desc']])
                    .withOption('stateSave', true)
                    .withOption('stateSaveCallback', function (settings, data) {
                        localStorage.setItem('DataTables_' + settings.sInstance, JSON.stringify(data));
                    })
                    //.withOption('stateLoadCallback', function (settings) {
                    //    return JSON.parse(localStorage.getItem('DataTables_' + settings.sInstance))
                    //})
                    .withOption('responsive', {
                        details: {
                            renderer: renderer,
                        }
                    })
                    .withPaginationType('full_numbers')
                    .withDisplayLength(5)
                    .withOption('lengthMenu', [[5, 10, 15, 20, 25, -1], [5, 10, 15, 20, 25]])
                    .withLanguageSource('app/langs/ar.json')
                    .withOption('createdRow', createdRow)
                    .withOption('initComplete', function (settings, data) {
                        $compile(angular.element('#' + settings.sTableId).contents())(scope);
                    })
                    .withOption('fnDrawCallback', function (settings, data) {
                        $compile(angular.element('#' + settings.sTableId).contents())(scope);
                    })
                    .withOption('rowCallback', rowCallback).withBootstrap().withBootstrapOptions({
                        pagination: {
                            classes: {
                                ul: 'pagination pagination-sm'
                            }
                        }
                    });
            }
            else {
                scope.dtApplicationOptions = DTOptionsBuilder.newOptions()
                    .withFnServerData(scope.serverData)
                    .withOption('serverSide', true)
                    .withOption('bFilter', false)
                    .withDataProp('data')
                    .withOption('searchDelay', 2000)
                    .withOption('processing', true)
                    .withOption('aaSorting', [[1, 'desc']])
                    .withOption('stateSave', true)
                    .withOption('stateSaveCallback', function (settings, data) {
                        localStorage.setItem('DataTables_' + settings.sInstance, JSON.stringify(data));
                    })
                    //.withOption('stateLoadCallback', function (settings) {
                    //    return JSON.parse(localStorage.getItem('DataTables_' + settings.sInstance))
                    //})
                    .withOption('responsive', {
                        details: {
                            renderer: renderer
                        }
                    })
                    .withPaginationType('full_numbers')
                    .withDisplayLength(5)
                    .withOption('lengthMenu', [[5, 10, 15, 20, 25, -1], [5, 10, 15, 20, 25]])
                    .withLanguageSource('app/langs/en.json')
                    .withOption('createdRow', createdRow)
                    .withOption('initComplete', function (settings, data) {
                        $compile(angular.element('#' + settings.sTableId).contents())(scope);
                    })
                    .withOption('fnDrawCallback', function (settings, data) {
                        $compile(angular.element('#' + settings.sTableId).contents())(scope);
                    })
                    .withOption('rowCallback', rowCallback).withBootstrap().withBootstrapOptions({
                        pagination: {
                            classes: {
                                ul: 'pagination pagination-sm'
                            }
                        }
                    });
            }

            scope.dtApplicationColumns = [
                DTColumnBuilder.newColumn('id').notVisible(),
                DTColumnBuilder.newColumn(null).withTitle(scope.translateFilter('systemManagement.vacationDay')).renderWith(
                    function (data, type) {
                        return moment(data.vacationDay).format('DD-MMMM-YYYY dddd');
                    }).notSortable(),
                DTColumnBuilder.newColumn(null).withTitle(scope.translateFilter('general.actions')).notSortable()
                    .renderWith(actionsHtml)
            ];

            scope.open = function (size) {
                if (opened) return;
                var modalInstance = $uibModal.open({
                    templateUrl: 'app/views/Account/admin/SystemManagement/Lookup/OffDays/dayOff.html',
                    controller: 'DayOffController',
                    size: size,
                    resolve: {
                        dayOff: function () {
                            return null;
                        }
                    }
                });
                opened = true;
                modalInstance.result.then(function (objOffdays) {
                    opened = false;
                    scope.insertVacation(objOffdays);
                })
            };

            ///Insert Vacation
            scope.insertVacation = function (objOffdays) {
                $http.post($rootScope.app.httpSource + 'api/Offday/SaveOffdays', inputRequest(objOffdays))
                    .then(
                        function (response) {
                            var translate = $filter('translate');
                            if (response.data == true) {
                                SweetAlert.swal(translate('establishment.success'), translate('systemManagement.dataAdded'), "success");
                                scope.dtApplicationInstance.rerender();
                            }
                            else {
                                SweetAlert.swal(translate('establishment.error'), translate('systemManagement.alreadyExist'), "error");
                            }
                        },
                        function (error) {
                            console.log('error in insert', error);
                        });
            };

            function inputRequest(objOffdays) {
                return {
                    "VacationDay": moment(objOffdays.vacationDay).format('YYYY-MM-DD')
                }
            };

            scope.edit = function (dayoffId) {
                if (opened) return;

                var modalInstance = $uibModal.open({
                    templateUrl: 'app/views/Account/admin/SystemManagement/Lookup/dayOff.html',
                    controller: 'DayOffController',
                    backdrop: false,
                    size: 'lg',
                    resolve: {
                        dayOff: function () {
                            var filterData = $filter('filter')(scope.offdays, { id: dayoffId }, true)[0];
                            return filterData;
                        }
                    }
                });
                opened = true;
                modalInstance.result.then(function (objOffdays) {
                    opened = false;
                    scope.updateVacation(objOffdays);
                })
            };

            scope.updateVacation = function (objOffdays) {
                $http.post($rootScope.app.httpSource + 'api/Offday/UpdateOffdays', objOffdays)
                    .then(
                        function (response) {
                            var translate = $filter('translate');
                            if (response.data == true) {
                                SweetAlert.swal(translate('establishment.success'), translate('systemManagement.dataUpdated'), "success");
                                scope.dtApplicationInstance.rerender();
                            }
                        },
                        function (error) {
                            console.log('error in update', error);
                        });
            };

            scope.delet = function (offdayid) {
                SweetAlert.swal({
                    title: translate('general.confirmDelete'),
                    text: translate('general.confirmDeleteInfo'),
                    type: "warning",
                    showCancelButton: true,
                    confirmButtonColor: "#DD6B55",
                    confirmButtonText: translate('general.confirmDeleteBtn'),
                    cancelButtonText: translate('general.restoreBtn'),
                    closeOnConfirm: false,
                    closeOnCancel: false
                },
                    function (isConfirm) {
                        if (isConfirm) {
                            SweetAlert.swal(translate('general.confirmDeleteBtn'), translate('general.deleteMessage'), "error");
                            $http.get($rootScope.app.httpSource + 'api/Offday/DeleteOffday?offdayId=' + offdayid)
                                .then(
                                    function (response) {
                                        if (response.data == true) {
                                            SweetAlert.swal(translate('establishment.success'), translate('systemManagement.dataDeleted'), "success");
                                            scope.dtApplicationInstance.rerender();
                                        }
                                    },
                                    function (error) {
                                        console.log('error in delete', error);
                                    });
                        } else {
                            SweetAlert.swal(translate('general.restoreBtn'), translate('general.restoreMessage'), "success");
                            scope.dtApplicationInstance.rerender();
                        }
                    });
            }

        }
    }
})();
