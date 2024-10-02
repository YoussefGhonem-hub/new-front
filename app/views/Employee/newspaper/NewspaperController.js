/**=========================================================
 * Module: NewspaperController.js
 =========================================================*/

(function () {
    'use strict';

    angular
        .module('eServices')
        .controller('NewspaperController', NewspaperController);

    NewspaperController.$inject = ['$rootScope', '$scope', 'UserProfile', '$filter', 'DTOptionsBuilder', 'DTColumnBuilder', '$compile', '$http', '$uibModal', '$state'];

    function NewspaperController($rootScope, $scope, UserProfile, $filter, DTOptionsBuilder, DTColumnBuilder, $compile, $http, $uibModal, $state) {        
        var vm = this;
        vm.user = UserProfile.getProfile();
        vm.dtNewspaperInstance = {};
        vm.translateFilter = $filter('translate');

        vm.exportExcel = function () {
            $http.post($rootScope.app.httpSource + 'api/Newspaper/ExportExcel', vm.params, { responseType: 'arraybuffer' })
                .then(function (resp) {
                    var data = new Blob([resp.data], { type: 'application/vnd.ms-excel' });
                    saveAs(data, "Newspaper.xlsx");
                },
                function (response) {
                });
        };
        vm.exportPDF = function () {
            $http.post($rootScope.app.httpSource + 'api/Newspaper/ExportToPdf', vm.params, { responseType: 'arraybuffer' })
                .then(function (resp) {
                    var data = new Blob([resp.data], { type: 'application/pdf' });
                    saveAs(data, "Newspaper.pdf");
                },
                function (response) {
                });
        };
        vm.exportCSV = function () {
            $http.post($rootScope.app.httpSource + 'api/Newspaper/ExportCSV', vm.params)
                .then(function (resp) {
                    var myBlob = new Blob([resp.data], { type: 'text/html' });
                    var url = window.URL.createObjectURL(myBlob);
                    var a = document.createElement("a");
                    document.body.appendChild(a);
                    a.href = url;
                    a.download = "Newspaper.csv";
                    a.click();
                    window.URL.revokeObjectURL(url);
                },
                function (response) {
                });
        };

        if ($rootScope.language.selected !== 'English') {
            vm.dtNewspaperOptions = DTOptionsBuilder.newOptions()
                .withFnServerData(serverData)
                .withOption('serverSide', true)
                .withDataProp('data')
                .withOption('processing', true)
                .withOption('aaSorting', [[0, 'desc']])
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
            vm.dtNewspaperOptions = DTOptionsBuilder.newOptions()
                .withFnServerData(serverData)
                .withOption('serverSide', true)
                .withDataProp('data')
                .withOption('processing', true)
                .withOption('aaSorting', [[0, 'desc']])
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

        vm.dtNewspaperColumns = [                                    
            DTColumnBuilder.newColumn(null).withTitle(vm.translateFilter('newspaperMagazineLicense.type')).renderWith(
                function (data, type) {                    
                    return data.isMagazine ? vm.translateFilter('newspaperMagazineLicense.magazineOption') : vm.translateFilter('newspaperMagazineLicense.newspaperOption');
                }),
            DTColumnBuilder.newColumn(null).withTitle(vm.translateFilter('newspaperMagazineLicense.reasonType')).renderWith(
                function (data, type) {
                    if (data.releaseType != undefined) {
                        return $filter('localizeString')(data.releaseType);
                    }
                    else {
                        return "";
                    }
                }),
            DTColumnBuilder.newColumn(null).withTitle(vm.translateFilter('newspaperMagazineLicense.issuanceFormat')).renderWith(
                function (data, type) {
                    return data.isElectronic ? vm.translateFilter('newspaperMagazineLicense.electronicFormat') : vm.translateFilter('newspaperMagazineLicense.printedFormat');
                }),
            DTColumnBuilder.newColumn(null).withTitle(vm.translateFilter('newspaper.periodicalType')).renderWith(
                function (data, type) {
                    if (data.periodicalType != undefined) {
                        return $filter('localizeString')(data.periodicalType);
                    }
                    else {
                        return "";
                    }
                }),
            DTColumnBuilder.newColumn('newspaperLanguages').withTitle(vm.translateFilter('newspaper.newspaperLanguage')).renderWith(
                function (data, type) {                    
                    var newspaperLanguagess = '';
                    for (var i = 0; i < data.length; i++) {
                        newspaperLanguagess += '<div class="col-sm-4">' + $filter('localizeString')(data[i].language) +
                                                '</div><div class="col-sm-8">' + data[i].name + '</div>';
                    }
                    return newspaperLanguagess;
                }),
            DTColumnBuilder.newColumn('newspaperSubjectCategories').withTitle(vm.translateFilter('printingPermit.subject')).renderWith(
                function (data, type) {                    
                    var newspaperCategories = '';
                    for (var i = 0; i < data.length; i++) {
                        newspaperCategories += $filter('localizeString')(data[i].newspaperCategory);

                        if (i != data.length - 1) {
                            if ($rootScope.language.selected !== 'English') {
                                newspaperCategories += "، ";
                            }
                            else
                            {
                                newspaperCategories += ", ";
                            }
                        }
                    }
                    return newspaperCategories;
                }),            
            DTColumnBuilder.newColumn('createdOn').withTitle(vm.translateFilter('dashboard.createdOn')).renderWith(
                function (data, type) {
                    return moment(data).format('DD-MMMM-YYYY');
                }),
            DTColumnBuilder.newColumn(null).withTitle(vm.translateFilter('general.actions')).notSortable()
                .renderWith(actionsHtml)];

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
            $http.post($rootScope.app.httpSource + 'api/Newspaper/GetAllNewsPaper', vm.params)
                .then(function (resp) {                    
                    vm.Newspaper = resp.data.content;                    
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
            vm.dtNewspaperInstance.DataTable.draw();
        }

        vm.userFilterData = function (id) {
            vm.filterParams = {};
            vm.filterParams.userFilterId = id;
            vm.dtNewspaperInstance.DataTable.draw();
        }

        vm.removeFilter = function ($scope) {
            $scope.filterParams = {};
            vm.filterParams = $scope.filterParams;
            vm.dtNewspaperInstance.DataTable.draw();
        }

        function actionsHtml(data, type, full, meta) {            
            var htmlSection = '';
            htmlSection = '<div style="display:inline-block" class="list-icon"><div class="inline" ng-click="newspaper.review(' + data.id + ')"><em class="fa fa-search" ' +
                'style="cursor:pointer" uib-tooltip="' + vm.translateFilter('newspapercard.review') + '"></em></div></div>';
            return htmlSection;
        };

        vm.review = function (Id) {
            $state.go('app.NewspaperCard', { id: Id });
        };

    }
})();