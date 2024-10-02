/**=========================================================
 * Module: LoginController.js
 * Controller for the Chat APP 
 =========================================================*/

(function () {
    'use strict';

    angular
        .module('eServices')
        .controller('ReviewPhotoEquipmentPermitController', ReviewPhotoEquipmentPermitController);

    function ReviewPhotoEquipmentPermitController($rootScope, $scope, $http, $stateParams, $state, $window, $uibModal, UserProfile, DTOptionsBuilder, DTColumnBuilder, $filter, $compile) {
        var vm = this;
        vm.translateFilter = $filter('translate');
        vm.dtPartnerInstance = {};
        vm.applicationOpen = true;
        vm.serviceFeesObj = { serviceId: 13, serviceFee: [], isExpo2020: true };

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
                    'recordsTotal': vm.photoEquipmentPermitModel.photoEquipmentPermitMembers.length,
                    'recordsFiltered': vm.photoEquipmentPermitModel.photoEquipmentPermitMembers.length,
                    'data': vm.photoEquipmentPermitModel.photoEquipmentPermitMembers
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
                DTColumnBuilder.newColumn('person.country.nameEn').withTitle(vm.translateFilter('profileNationalityDirective.Nationality')),
                DTColumnBuilder.newColumn('person.emiratesId').withTitle(vm.translateFilter('profileNationalityDirective.EmiratesId')),
                DTColumnBuilder.newColumn('person.title').withTitle(vm.translateFilter('profileNationalityDirective.Occupation')),
                DTColumnBuilder.newColumn(null).withTitle(vm.translateFilter('general.actions')).notSortable()
                        .renderWith(vm.teamMemberDt.actionsHtml).withOption('width', '15%')];

            //Locations Datatable

            vm.equipmentDt = {};
            vm.equipmentDt.dtInstance = {};
            vm.equipmentDt.serverData = function (sSource, aoData, fnCallback, oSettings) {
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
                    'recordsTotal': vm.photoEquipmentPermitModel.photoEquipmentPermitEquipments.length,
                    'recordsFiltered': vm.photoEquipmentPermitModel.photoEquipmentPermitEquipments.length,
                    'data': vm.photoEquipmentPermitModel.photoEquipmentPermitEquipments
                };

                fnCallback(records);
            };

            vm.equipmentDt.actionsHtml = function (data, type, full, meta) {
                var htmlSection = '';

                htmlSection = '<div class="list-icon"><div class="inline" ng-click="ppCtl.reviewPhotoEquipment(\'lg\',' +
                    data.id + ')"><em class="fa fa-search" style="cursor:pointer" uib-tooltip="' +
                    vm.translateFilter('general.review') + '"></em></div></div>';

                return htmlSection;
            };
            vm.equipmentDt.createdRow = function (row, data, dataIndex) {
                // Recompiling so we can bind Angular directive to the DT
                $compile(angular.element(row).contents())($scope);
            }

            vm.translateFilter = $filter('translate');

            if ($rootScope.language.selected !== 'English') {
                vm.equipmentDt.dtOptions = DTOptionsBuilder.newOptions()
                .withFnServerData(vm.equipmentDt.serverData)
                .withOption('serverSide', true)
                .withDataProp('data')
                .withOption('processing', true)
                .withOption('responsive', true)
                .withLanguageSource('app/langs/ar.json')
                .withOption('bFilter', false)
                .withOption('paging', false)
                .withOption('info', false)
                .withOption('createdRow', vm.equipmentDt.createdRow).withBootstrap();
            }
            else {
                vm.equipmentDt.dtOptions = DTOptionsBuilder.newOptions()
                .withFnServerData(vm.equipmentDt.serverData)
                .withOption('serverSide', true)
                .withDataProp('data')
                .withOption('processing', true)
                .withOption('responsive', true)
                .withOption('bFilter', false)
                .withOption('paging', false)
                .withOption('info', false)
                .withOption('createdRow', vm.equipmentDt.createdRow).withBootstrap();
            }

            vm.equipmentDt.dtColumns = [
                DTColumnBuilder.newColumn('photoEquipment').withTitle(vm.translateFilter('photoEquipment.equipment')).renderWith(
                function (data, type) {
                    return $filter('localizeString')(data);
                }),
                DTColumnBuilder.newColumn('number').withTitle(vm.translateFilter('photoEquipment.number')),
                DTColumnBuilder.newColumn(null).withTitle(vm.translateFilter('general.actions')).notSortable()
                        .renderWith(vm.equipmentDt.actionsHtml).withOption('width', '15%')];
        }

        vm.reviewPhotoEquipment = function (size, photoEquipmentId, event) {
            var modalInstance = $uibModal.open({
                templateUrl: 'app/views/Application/PhotoEquipmentPermit/equipmentList/Review/reviewEquipmentList.html',
                controller: 'reviewEquipmentListController',
                size: size,
                resolve: {
                    equipment: function () {
                        if (photoEquipmentId == 0) {
                            index = vm.equipmentDt.dtInstance.DataTable.rows({ order: 'applied' }).nodes().indexOf(event.currentTarget.parentNode.parentNode.parentNode);
                            return vm.photoEquipmentPermitModel.photoEquipmentPermitEquipments[index];
                        }
                        else {
                            return $filter('filter')(vm.photoEquipmentPermitModel.photoEquipmentPermitEquipments, { id: photoEquipmentId }, true)[0];
                        }
                    }
                }
            });

            modalInstance.result.then(function (equipment) {
                var equipment = $filter('filter')(vm.photoEquipmentPermitModel.photoEquipmentPermitEquipments, { id: equipment.id }, true)[0];
                equipment = equipment;
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
                            return vm.photoEquipmentPermitModel.photoEquipmentPermitMembers[index];
                        }
                        else {
                            return $filter('filter')(vm.photoEquipmentPermitModel.photoEquipmentPermitMembers, { id: teamMemberId }, true)[0];
                        }
                    }
                }
            });

            modalInstance.result.then(function (teamMember) {
                var teamMember = $filter('filter')(vm.photoEquipmentPermitModel.photoEquipmentPermitMembers, { id: teamMember.id }, true)[0];
                teamMember = teamMember;
            }, function () {
                //state.text('Modal dismissed with Cancel status');
            });
        };

        //Get the details of the submitted Form to edit
        $http.get($rootScope.app.httpSource + 'api/PhotoEquipmentPermit/GetById?id=' + $state.params.id)
          .then(function (response) {
              vm.photoEquipmentPermitModel = response.data;
              vm.userTypeCode = vm.photoEquipmentPermitModel.applicationDetail.application.user.userProfiles[0].userType.code;
              vm.Init();
          });
    }

    ReviewPhotoEquipmentPermitController.$inject = ['$rootScope', '$scope', '$http', '$stateParams', '$state', '$window', '$uibModal', 'UserProfile', 'DTOptionsBuilder',
        'DTColumnBuilder', '$filter', '$compile'];

})();