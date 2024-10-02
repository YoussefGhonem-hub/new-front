/**=========================================================
 * Module: DashboardController.js
 =========================================================*/

(function () {
    'use strict';

    angular
        .module('eServices')
        .controller('RolesController', RolesController);

    RolesController.$inject = ['$rootScope', '$scope', 'UserProfile', '$filter', 'DTOptionsBuilder', 'DTColumnBuilder', '$compile', '$http', '$uibModal', '$state'];
    function RolesController($rootScope, $scope, UserProfile, $filter, DTOptionsBuilder, DTColumnBuilder, $compile, $http, $uibModal, $state) {
        var vm = this;
        vm.user = UserProfile.getProfile();
        vm.dtRolesInstance = {};
        vm.translateFilter = $filter('translate');

        if ($rootScope.language.selected !== 'English') {
            vm.dtRolesOptions = DTOptionsBuilder.newOptions()
                .withFnServerData(serverData)
                .withOption('serverSide', true)
                .withDataProp('data')
                .withOption('processing', true)
                .withOption('responsive', true)
                .withPaginationType('full_numbers')
                .withDisplayLength(10)
                .withLanguageSource('app/langs/ar.json')
                .withOption('createdRow', createdRow)
                .withOption('rowCallback', rowCallback).withBootstrap();
        }
        else {
            vm.dtRolesOptions = DTOptionsBuilder.newOptions()
                .withFnServerData(serverData)
                .withOption('serverSide', true)
                .withDataProp('data')
                .withOption('processing', true)
                .withOption('responsive', true)
                .withPaginationType('full_numbers')
                .withDisplayLength(10)
                .withLanguageSource('app/langs/en.json')
                .withOption('createdRow', createdRow)
                .withOption('rowCallback', rowCallback).withBootstrap();
        }
        
        vm.dtRolesColumns = [
            DTColumnBuilder.newColumn('name').withTitle('Department').renderWith(function (data, type) {
                return data.split('$')[0];
            }),
            DTColumnBuilder.newColumn('name').withTitle('Role Name').renderWith(function (data, type) {
                return data.split('$')[1];
            }),
            DTColumnBuilder.newColumn('id').notVisible(),
            DTColumnBuilder.newColumn('description').withOption('defaultContent', ' ').withTitle('Description'),
            DTColumnBuilder.newColumn(null).withTitle(vm.translateFilter('general.actions')).notSortable()
                .renderWith(actionsHtml)];

        function serverData(sSource, aoData, fnCallback, oSettings) {
            var draw = aoData[0].value;
            var order = aoData[2].value[0];
            var start = aoData[3].value;
            var length = aoData[4].value;
            var search = aoData[5].value;

            var params = {
                searchtext: (search.value === '' ? null : search.value),
                page: (start / length) + 1,
                pageSize: length,
                sortBy: (order.column === 0 ? 'Id' : aoData[1].value[order.column].data),
                sortDirection: order.dir
            };

            $http.get($rootScope.app.httpSource + 'api/Roles', { params: params })
                .then(function (resp) {
                    vm.roles = resp.data.content;
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

        function rowCallback() {

        };

        function workflowActionsHtml(data, type, full, meta) {
            var htmlSection = '<div style="display:inline-block" class=""><div uib-dropdown="dropdown" class="btn-group mr"><button uib-dropdown-toggle="" class="btn btn-primary ' +
                'dropdown-toggle btn-sm">' + vm.translateFilter('dashboard.actions') + '<b class="caret"></b></button><ul role="menu" class="dropdown-menu animated zoomIn">';

            for (var i = 0; i < data.applicationStatus.transitions.length; i++) {
                htmlSection += '<li><a href="">' + $filter('localizeString')(data.applicationStatus.transitions[i].action) + '</a></li>';
            }

            htmlSection += '</ul></div></div>'

            return htmlSection;
        };

        function actionsHtml(data, type, full, meta) {
            var htmlSection = '';
            //htmlSection = '<div style="display:inline-block" class="list-icon"><div class="inline" ng-click="dashboard.actionList(' +
            //    data.id + ',\'lg\', $event)"><em class="fa fa-sitemap" style="cursor:pointer" uib-tooltip="' +
            //    vm.translateFilter('general.procedureList') + '"></em></div><div class="inline" ng-click="dashboard.edit(' +
            //    data.id + ',\'' + data.service.code + '\',\'' + data.service.serviceCategory.code + '\')"><em class="fa fa-pencil" style="cursor:pointer" uib-tooltip="' +
            //    vm.translateFilter('general.edit') + '"></em></div><div class="inline" ng-click="dashboard.delete(' +
            //    data.id + ', $event)"><em class="fa fa-trash" style="cursor:pointer" uib-tooltip="' +
            //    vm.translateFilter('general.delete') + '"></em></div></div>';

            return htmlSection;
        };

        vm.actionList = function (applicationId, size) {
            var modalInstance = $uibModal.open({
                templateUrl: 'app/views/Employee/Timeline/timeline.html',
                controller: 'TimelineController',
                size: size,
                resolve: {
                    application: function () {
                        return $filter('filter')(vm.applications, { id: applicationId }, true)[0];
                    }
                }
            });

            modalInstance.result.then(function (establishmentBranch) {

                if (vm.userProfile.establishment.establishments == undefined) {
                    vm.userProfile.establishment.establishments = [];
                }
                vm.userProfile.establishment.establishments.push(establishmentBranch);
                vm.dtInstance.rerender();
            }, function () {
            });
        }

        vm.edit = function (Id, serviceCode, serviceCategoryCode) {
            if (serviceCategoryCode == 'ML') {
                switch (serviceCode) {
                    case "01":
                        $state.go('app.MediaLicenseServices.JournalistsAppointmentIssuePressCard', { id: Id });
                        break;

                    case "02":
                        $state.go('app.MediaLicenseServices.FilmPhotographyPermit', { id: Id });
                        break;
                }
            }

        };
    }
})();