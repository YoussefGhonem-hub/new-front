(function () {
    'use strict';

    angular
        .module('eServices')
        .controller('ExistingFilmingTeamController', ExistingFilmingTeamController);
    /* @ngInject */
    function ExistingFilmingTeamController($rootScope, $scope, $uibModalInstance, $window, $filter, $http, teamMember, $resource, DTOptionsBuilder, DTColumnBuilder, $compile) {

        $scope.teamMember = {};
        $scope.teamMember.person = {};

        if (teamMember != undefined && teamMember != null) {
            $scope.teamMember = teamMember;
        }

        $scope.ok = function () {
            $uibModalInstance.close($scope.myResult);
        };

        $scope.closeModal = function () {
            $uibModalInstance.dismiss('cancel');
        };

        $scope.selected = {};
        $scope.selectAll = false;
        $scope.toggleAll = toggleAll;
        $scope.toggleOne = toggleOne;

        $scope.teamMemberDt = {};
        $scope.teamMemberDt.dtInstance = {};
        $scope.translateFilter = $filter('translate');


        //var titleHtml = '<input type="checkbox" ng-model="selectAll" ng-click="toggleAll(selectAll, selected)">';
        var titleHtml = '';

        if ($rootScope.language.selected !== 'English') {
            $scope.teamMemberDt.dtOptions = DTOptionsBuilder.newOptions()
                .withFnServerData(serverData)
                .withOption('serverSide', true)
                .withDataProp('data')
                .withOption('processing', true)
                .withOption('searchDelay', 2000)
                .withOption('aaSorting', [[1, 'desc']])
                .withOption('responsive', true)
                .withOption('stateSave', false)
                .withOption('stateSaveCallback', function (settings, data) {
                    localStorage.setItem('DataTables_' + settings.sInstance, JSON.stringify(data));
                })
                .withOption('stateLoadCallback', function (settings) {
                    return JSON.parse(localStorage.getItem('DataTables_' + settings.sInstance))
                })
                .withOption('initComplete', function (settings, data) {
                    $compile(angular.element('#' + settings.sTableId).contents())($scope);
                })
                .withOption('fnDrawCallback', function (settings, data) {
                    $compile(angular.element('#' + settings.sTableId).contents())($scope);
                })
                .withLanguageSource('app/langs/ar.json')
                //.withOption('bFilter', false)
                .withOption('info', false)
                .withOption('responsive', {
                    details: {
                        renderer: renderer,
                    }
                })
                .withPaginationType('full_numbers')
                .withDisplayLength(10)
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
                })
                .withOption('createdRow', createdRow);
        }
        else {
            $scope.teamMemberDt.dtOptions = DTOptionsBuilder.newOptions()
                .withFnServerData(serverData)
                .withOption('serverSide', true)
                .withDataProp('data')
                .withOption('processing', true)
                .withOption('searchDelay', 2000)
                .withOption('aaSorting', [[1, 'desc']])
                .withOption('responsive', true)
                .withOption('stateSave', false)
                .withOption('stateSaveCallback', function (settings, data) {
                    localStorage.setItem('DataTables_' + settings.sInstance, JSON.stringify(data));
                })
                .withOption('stateLoadCallback', function (settings) {
                    return JSON.parse(localStorage.getItem('DataTables_' + settings.sInstance))
                })
                .withOption('initComplete', function (settings, data) {
                    $compile(angular.element('#' + settings.sTableId).contents())($scope);
                })
                .withOption('fnDrawCallback', function (settings, data) {
                    $compile(angular.element('#' + settings.sTableId).contents())($scope);
                })
                //.withOption('bFilter', false)
                .withOption('info', false)
                .withOption('responsive', {
                    details: {
                        renderer: renderer
                    }
                })
                .withPaginationType('full_numbers')
                .withDisplayLength(10)
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
                })
                .withOption('createdRow', createdRow);
        }

        $scope.teamMemberDt.dtColumns = [
            DTColumnBuilder.newColumn(null).withTitle(titleHtml).notSortable()
                .renderWith(function (data, type, full, meta) {
                    //$scope.selected[full.id] = false;
                    return '<input type="checkbox" ng-model="selected[' + data.id + ']" ng-click="toggleOne(selected)">';
                }),
            DTColumnBuilder.newColumn('name').withTitle($scope.translateFilter('profileNationalityDirective.fullName')).notSortable(),
            DTColumnBuilder.newColumn('country').withTitle($scope.translateFilter('profileNationalityDirective.Nationality')).renderWith(
                function (data, type) {
                    return $filter('localizeString')(data);
                }).notSortable(),
            DTColumnBuilder.newColumn(null).withTitle($scope.translateFilter('profileNationalityDirective.EmiratesId')).renderWith(
                function (data, type) {
                    if (data.emiratesId != null) {
                        return data.emiratesId;
                    }
                    else {
                        return data.passportNumber;
                    }
                }).notSortable(),
            DTColumnBuilder.newColumn('title').withTitle($scope.translateFilter('profileNationalityDirective.Occupation')).notSortable(),
        ];

        function serverData(sSource, aoData, fnCallback, oSettings) {
            var draw = aoData[0].value;
            var order = aoData[2].value[0];
            var start = aoData[3].value;
            var length = aoData[4].value;
            var search = aoData[5].value;

            $scope.params = {
                searchtext: (search.value === '' ? null : search.value),
                page: (start / length) + 1,
                pageSize: length,
                sortBy: (order.column === 1 ? 'createdOn' : aoData[1].value[order.column].data),//SortBy createdOn by default
                sortDirection: order.dir,
                filterParams: ($scope.filterParams === undefined ? null : $scope.filterParams)
            };

            $http.post($rootScope.app.httpSource + 'api/PhotographyPermit/GetExistingMember', $scope.params)
                .then(function (response) {
                    $scope.photographyPermitMembersList = response.data.content;
                    var records = {
                        'draw': draw,
                        'recordsTotal': response.data.totalRecords,
                        'recordsFiltered': response.data.totalRecords,
                        'data': response.data.content 
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
        }

        function createdRow(row, data, dataIndex) {
            $compile(angular.element(row).contents())($scope);
        }

        function rowCallback(tabRow, data, dataIndex) {

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

        function toggleAll(selectAll, selectedItems) {
            for (var id in selectedItems) {
                if (selectedItems.hasOwnProperty(id)) {
                    selectedItems[id] = selectAll;
                }
            }
        }


        function toggleOne(selectedItems) {
            $scope.myResult = [];
            for (var id in selectedItems) {
                $scope.selectAll = false;
                var item = $scope.photographyPermitMembersList.filter(person => (person.id == id));
                for (var i = 0; i < item.length; i++) {
                    $scope.myResult.push(item[i]);
                }
            }
            $scope.selectAll = true;
        }
    }

    ExistingFilmingTeamController.$inject = ['$rootScope', '$scope', '$uibModalInstance', '$window', '$filter', '$http', 'teamMember', '$resource', 'DTOptionsBuilder', 'DTColumnBuilder', '$compile'];
})();