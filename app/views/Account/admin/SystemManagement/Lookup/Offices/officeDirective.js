(function () {
    'use strict';

    angular
        .module('eServices')
        .directive('office', office)

    office.$inject = ['$rootScope', '$http', '$filter', 'DTOptionsBuilder', 'DTColumnBuilder', '$interval', 'SweetAlert', '$uibModal', '$compile'];

    function office($rootScope, $http, $filter, DTOptionsBuilder, DTColumnBuilder, $interval, SweetAlert, $uibModal, $compile) {
        return {
            restrict: 'E',
            templateUrl: '/app/views/Account/admin/SystemManagement/Lookup/Offices/officeDirective.html',
            link: link
        };

        function link(scope, element, attrs) {
            
            var translate = $filter('translate');
            scope.translateFilter = $filter('translate');
            scope.dtOfficeInstance = {};

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

                $http.post($rootScope.app.httpSource + 'api/office/GetAllOffices', scope.params)
                    .then(function (resp) {
                        scope.offices = resp.data.content;
                        var records = {
                            'draw': draw,
                            'recordsTotal': resp.data.totalRecords,
                            'recordsFiltered': resp.data.totalRecords,
                            'data': resp.data.content
                        };
                        fnCallback(records);
                    });
            }

            scope.dtOfficeInstance = (inst) => {
                scope.dtOfficeInstance = inst;
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
                scope.dtOfficeOptions = DTOptionsBuilder.newOptions()
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
                    .withOption('stateLoadCallback', function (settings) {
                        return JSON.parse(localStorage.getItem('DataTables_' + settings.sInstance))
                    })
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
                scope.dtOfficeOptions = DTOptionsBuilder.newOptions()
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
                    .withOption('stateLoadCallback', function (settings) {
                        return JSON.parse(localStorage.getItem('DataTables_' + settings.sInstance))
                    })
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

            scope.dtOfficeColumns = [
                DTColumnBuilder.newColumn('id').notVisible(),
                DTColumnBuilder.newColumn('nameAr').withTitle(scope.translateFilter('systemManagement.officeNameAr')).notSortable(),
                DTColumnBuilder.newColumn('nameEn').withTitle(scope.translateFilter('systemManagement.officeNameEn')).notSortable(),
                DTColumnBuilder.newColumn('code').withTitle(scope.translateFilter('systemManagement.officeCode')).notSortable(),
                DTColumnBuilder.newColumn('address.community.nameEn').withTitle(scope.translateFilter('systemManagement.officeAddress')).notSortable(),
                DTColumnBuilder.newColumn(null).withTitle(scope.translateFilter('general.actions')).notSortable()
                    .renderWith(actionsHtml)
            ];

            scope.open = function (size) {
                if (opened) return;
                var modalInstance = $uibModal.open({
                    templateUrl: 'app/views/Account/admin/SystemManagement/Lookup/Offices/office.html',
                    controller: 'OfficeController',
                    size: size,
                    resolve: {
                        office: function () {
                            return null;
                        }
                    }
                });
                opened = true;
                modalInstance.result.then(function (objOffice) {
                    opened = false;
                    scope.insertOffice(objOffice);
                })
            };

            ///Insert office
            scope.insertOffice = function (objOffice) {
                $http.post($rootScope.app.httpSource + 'api/Office/SaveOffice', inputRequest(objOffice))
                    .then(
                        function (response) {
                            if (response.data == true) {
                                SweetAlert.swal(translate('establishment.success'), translate('systemManagement.dataAdded'), "success");
                                scope.dtOfficeInstance.rerender();
                            }
                            else {
                                SweetAlert.swal(translate('establishment.error'), translate('systemManagement.alreadyExist'), "error");
                            }
                        },
                        function (error) {
                        });
            };

            function inputRequest(objOffice) {
                if (objOffice != null) {
                    return {
                        "address": {
                            "communityId": objOffice.address.community.id,
                            "phoneNumber": objOffice.address.phoneNumber,
                            "street": objOffice.address.street,
                            "longitude": objOffice.address.longitude,
                            "latitude": objOffice.address.latitude
                        },
                        "nameEn": objOffice.nameEn,
                        "nameAr": objOffice.nameAr,
                        "code": objOffice.code
                    }
                }
            };

            scope.delet = function (officeid) {
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
                            $http.get($rootScope.app.httpSource + 'api/Office/DeleteOffice?officeId=' + officeid)
                                .then(
                                    function (response) {
                                        if (response.data == true) {
                                            SweetAlert.swal(translate('establishment.success'), translate('systemManagement.dataDeleted'), "success");
                                            scope.dtOfficeInstance.rerender();
                                        }
                                    },
                                    function (error) {
                                        console.log('error in delete', error);
                                    });
                        } else {
                            SweetAlert.swal(translate('general.restoreBtn'), translate('general.restoreMessage'), "success");
                            scope.dtOfficeInstance.rerender();
                        }
                    });
            }

        }
    }
})();
