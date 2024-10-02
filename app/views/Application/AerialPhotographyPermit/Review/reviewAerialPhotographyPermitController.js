/**=========================================================
 * Module: LoginController.js
 * Controller for the Chat APP 
 =========================================================*/

(function () {
    'use strict';

    angular
        .module('eServices')
        .controller('ReviewAerialPhotographyPermitController', ReviewAerialPhotographyPermitController);

    function ReviewAerialPhotographyPermitController($rootScope, $scope, $http, $stateParams, $state, $window, $uibModal, UserProfile, DTOptionsBuilder, DTColumnBuilder, $filter, $compile) {
        var vm = this;
        vm.translateFilter = $filter('translate');
        vm.dtPartnerInstance = {};
        vm.applicationOpen = true;
        vm.serviceFeesObj = { serviceId: 7, serviceFee: [], isExpo2020: true };

        vm.Init = function () {
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
                    'recordsTotal': vm.photographyPermitModel.photographyPermitMembers.length,
                    'recordsFiltered': vm.photographyPermitModel.photographyPermitMembers.length,
                    'data': vm.photographyPermitModel.photographyPermitMembers
                };

                fnCallback(records);
            };

            vm.teamMemberDt.actionsHtml = function (data, type, full, meta) {
                var htmlSection = '';

                htmlSection = '<div class="list-icon"><div class="inline" ng-click="ppCtl.reviewFilmingTeamMember(\'lg\',' +
                    data.id + ')"><em class="fa fa-search" style="cursor:pointer" uib-tooltip="' +
                    vm.translateFilter('general.review') + '"></em></div></div>';

                return htmlSection;
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
                DTColumnBuilder.newColumn('person.name').withTitle(vm.translateFilter('profileNationalityDirective.fullName')),
                DTColumnBuilder.newColumn('person.country').withTitle(vm.translateFilter('profileNationalityDirective.Nationality')).renderWith(
                    function (data, type) {
                        return $filter('localizeString')(data);
                    }),
                DTColumnBuilder.newColumn('person.emiratesId').withTitle(vm.translateFilter('profileNationalityDirective.EmiratesId')),
                DTColumnBuilder.newColumn('person.title').withTitle(vm.translateFilter('profileNationalityDirective.Occupation')),
                DTColumnBuilder.newColumn(null).withTitle(vm.translateFilter('general.actions')).notSortable()
                        .renderWith(vm.teamMemberDt.actionsHtml).withOption('width', '15%')];

            //Locations Datatable

            vm.locationDt = {};
            vm.locationDt.dtInstance = {};
            vm.locationDt.serverData = function (sSource, aoData, fnCallback, oSettings) {
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
                    'recordsTotal': vm.photographyPermitModel.photographyPermitLocations.length,
                    'recordsFiltered': vm.photographyPermitModel.photographyPermitLocations.length,
                    'data': vm.photographyPermitModel.photographyPermitLocations
                };

                fnCallback(records);
            };

            vm.locationDt.actionsHtml = function (data, type, full, meta) {
                var htmlSection = '';

                htmlSection = '<div class="list-icon"><div class="inline" ng-click="ppCtl.reviewLocation(\'lg\',' +
                    data.id + ')"><em class="fa fa-search" style="cursor:pointer" uib-tooltip="' +
                    vm.translateFilter('general.review') + '"></em></div></div>';

                return htmlSection;
            };
            vm.locationDt.createdRow = function (row, data, dataIndex) {
                // Recompiling so we can bind Angular directive to the DT
                $compile(angular.element(row).contents())($scope);
            }

            vm.translateFilter = $filter('translate');

            if ($rootScope.language.selected !== 'English') {
                vm.locationDt.dtOptions = DTOptionsBuilder.newOptions()
                .withFnServerData(vm.locationDt.serverData)
                .withOption('serverSide', true)
                .withDataProp('data')
                .withOption('processing', true)
                .withOption('responsive', true)
                .withLanguageSource('app/langs/ar.json')
                .withOption('bFilter', false)
                .withOption('paging', false)
                .withOption('info', false)
                .withOption('createdRow', vm.locationDt.createdRow).withBootstrap();
            }
            else {
                vm.locationDt.dtOptions = DTOptionsBuilder.newOptions()
                .withFnServerData(vm.locationDt.serverData)
                .withOption('serverSide', true)
                .withDataProp('data')
                .withOption('processing', true)
                .withOption('responsive', true)
                .withOption('bFilter', false)
                .withOption('paging', false)
                .withOption('info', false)
                .withOption('createdRow', vm.locationDt.createdRow).withBootstrap();
            }

            vm.locationDt.dtColumns = [
                DTColumnBuilder.newColumn('address.emirate').withTitle(vm.translateFilter('address.Emirate')).renderWith(
                    function (data, type) {
                        return $filter('localizeString')(data);
                    }), ,
                DTColumnBuilder.newColumn('address.community').withTitle(vm.translateFilter('address.Community')).renderWith(
                    function (data, type) {
                        return $filter('localizeString')(data);
                    }),
                DTColumnBuilder.newColumn('address.street').withTitle(vm.translateFilter('address.Street')),
                DTColumnBuilder.newColumn(null).withTitle(vm.translateFilter('general.actions')).notSortable()
                        .renderWith(vm.locationDt.actionsHtml).withOption('width', '15%')];
        }

        vm.reviewLocation = function (size, locationId, event) {
            var modalInstance = $uibModal.open({
                templateUrl: 'app/views/Application/AerialPhotographyPermit/filmingLocation/Review/reviewFilmingLocation.html',
                controller: 'reviewFilmingLocationController',
                size: size,
                resolve: {
                    location: function () {
                        if (locationId == 0) {
                            index = vm.locationDt.dtInstance.DataTable.rows({ order: 'applied' }).nodes().indexOf(event.currentTarget.parentNode.parentNode.parentNode);
                            return vm.photographyPermitModel.photographyPermitLocations[index];
                        }
                        else {
                            return $filter('filter')(vm.photographyPermitModel.photographyPermitLocations, { id: locationId }, true)[0];
                        }
                    }
                }
            });

            modalInstance.result.then(function (location) {
                var location = $filter('filter')(vm.photographyPermitModel.photographyPermitLocations, { id: location.id }, true)[0];
                location = location;
            }, function () {
                //state.text('Modal dismissed with Cancel status');
            });
        };

        vm.reviewFilmingTeamMember = function (size, teamMemberId, event) {
            var modalInstance = $uibModal.open({
                templateUrl: 'app/views/Application/AerialPhotographyPermit/filmingTeam/Review/reviewFilmingTeam.html',
                controller: 'reviewFilmingTeamController',
                size: size,
                resolve: {
                    teamMember: function () {
                        if (teamMemberId == 0) {
                            index = vm.teamMemberDt.dtInstance.DataTable.rows({ order: 'applied' }).nodes().indexOf(event.currentTarget.parentNode.parentNode.parentNode);
                            return vm.photographyPermitModel.photographyPermitMembers[index];
                        }
                        else {
                            return $filter('filter')(vm.photographyPermitModel.photographyPermitMembers, { id: teamMemberId }, true)[0];
                        }
                    }
                }
            });

            modalInstance.result.then(function (teamMember) {
                var teamMember = $filter('filter')(vm.photographyPermitModel.photographyPermitMembers, { id: teamMember.id }, true)[0];
                teamMember = teamMember;
            }, function () {
                //state.text('Modal dismissed with Cancel status');
            });
        };

        //Get the details of the submitted Form to edit
        $http.get($rootScope.app.httpSource + 'api/PhotographyPermit/GetById?id=' + $state.params.id)
          .then(function (response) {
              vm.photographyPermitModel = response.data;
              vm.userTypeCode = vm.photographyPermitModel.applicationDetail.application.user.userProfiles[0].userType.code;
              for (var id in vm.photographyPermitModel.photographyPermitLocations) {
                  vm.photographyPermitModel.photographyPermitLocations[id].address.emirate = vm.photographyPermitModel.photographyPermitLocations[id].address.community.region.emirate;
              }
              vm.Init();
          });
    }

    ReviewAerialPhotographyPermitController.$inject = ['$rootScope', '$scope', '$http', '$stateParams', '$state', '$window', '$uibModal', 'UserProfile', 'DTOptionsBuilder',
        'DTColumnBuilder', '$filter', '$compile'];

})();