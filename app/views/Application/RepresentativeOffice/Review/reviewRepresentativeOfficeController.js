/**=========================================================
 * Module: LoginController.js
 * Controller for the Chat APP 
 =========================================================*/

(function () {
    'use strict';

    angular
        .module('eServices')
        .controller('ReviewRepresentativeOfficeController', ReviewRepresentativeOfficeController);

    function ReviewRepresentativeOfficeController($rootScope, $scope, $http, $stateParams, $state, $window, $uibModal, UserProfile, DTOptionsBuilder, DTColumnBuilder, $filter, $compile) {
        var vm = this;
        vm.translateFilter = $filter('translate');
        vm.dtPartnerInstance = {};
        vm.applicationOpen = true;
        vm.serviceFeesObj = { serviceId: 13, serviceFee: [] };

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

            vm.userCountryHtml = function (data, type, full, meta) {
                var htmlSection = '<div><span><img class="img-responsive" style="display:inline-block; ' +
                    'padding-left:10px; padding-right: 10px; max-width:60px" src="../src/imgs/Countries/' + data.person.country.isoCode2 + '.png" /></span></div>';

                return htmlSection;
            };

            vm.partnerActionsHtml = function (data, type, full, meta) {
                var htmlSection = '';

                htmlSection = '<div class="list-icon"><div class="inline" ng-click="ppCtl.reviewPartner(\'lg\',' +
                    data.id + ', $event)"><em class="fa fa-search" style="cursor:pointer" uib-tooltip="' +
                    vm.translateFilter('general.review') + '"></em></div></div>';
                return htmlSection;
            };

            vm.serverPartnerData = function (sSource, aoData, fnCallback, oSettings) {
                //All the parameters you need is in the aoData variable
                var draw = aoData[0].value;
                var order = aoData[2].value[0];
                var start = aoData[3].value;
                var length = aoData[4].value;
                var search = aoData[5].value;
                var records;

                var params = {
                    searchtext: search.value,
                    page: (start / length) + 1,
                    pageSize: length,
                    sortBy: (order.column === 0 ? 'ID' : aoData[1].value[order.column].data),
                    sortDirection: order.dir
                };

                //Then just call your service to get the records from server side
                $http.get($rootScope.app.httpSource + 'api/Establishment/GetPartners?estId=' + vm.representativeOfficeModel.applicationDetail.application.establishment.id)
                    .then(function (response) {
                        vm.establishmentPartners = response.data;
                        records = {
                            'draw': draw,
                            'recordsTotal': vm.establishmentPartners.length,
                            'recordsFiltered': vm.establishmentPartners.length,
                            'data': vm.establishmentPartners
                        };

                        fnCallback(records);
                    }, function (response) { });
            };

            vm.dtPartnerOptions = DTOptionsBuilder.newOptions()
                                .withFnServerData(vm.serverPartnerData)
                                .withOption('serverSide', true)
                                .withDataProp('data')
                                .withOption('processing', true)
                                .withOption('responsive', {
                                    details: {
                                        renderer: renderer
                                    }
                                })
                                .withLanguageSource('app/langs/en.json')
                                .withOption('createdRow', vm.createdRow)
                                .withOption('bFilter', false)
                                .withOption('paging', false)
                                .withOption('info', false).withBootstrap();

            vm.dtPartnerColumns = [
                DTColumnBuilder.newColumn('person.name').withTitle(vm.translateFilter('completeProfile.name')),
                DTColumnBuilder.newColumn('id').notVisible(),
                DTColumnBuilder.newColumn('person.country').withTitle(vm.translateFilter('profileNationalityDirective.Nationality')).renderWith(
                function (data, type) {
                    return $filter('localizeString')(data);
                }),
                DTColumnBuilder.newColumn(null).withTitle(' ').renderWith(vm.userCountryHtml).notSortable(),
                DTColumnBuilder.newColumn('person.emiratesId').withTitle(vm.translateFilter('profileNationalityDirective.EmiratesId')),
                DTColumnBuilder.newColumn('person.dateOfBirth').withTitle(vm.translateFilter('profileNationalityDirective.DateOfBirth')).renderWith(function (data, type) {
                    return $filter('date')(data, 'dd-MMMM-yyyy');
                }),
                DTColumnBuilder.newColumn(null).withTitle(vm.translateFilter('general.actions')).notSortable()
                    .renderWith(vm.partnerActionsHtml).withOption('width', '15%')];

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
                    'recordsTotal': vm.representativeOfficeModel.establishment.establishmentPartners.length,
                    'recordsFiltered': vm.representativeOfficeModel.establishment.establishmentPartners.length,
                    'data': vm.representativeOfficeModel.establishment.establishmentPartners
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
        }

        vm.reviewFilmingTeamMember = function (size, teamMemberId, event) {
            var modalInstance = $uibModal.open({
                templateUrl: 'app/views/Application/PhotographyPermit/filmingTeam/Review/reviewFilmingTeam.html',
                controller: 'reviewFilmingTeamController',
                size: size,
                resolve: {
                    teamMember: function () {
                        if (teamMemberId == 0) {
                            index = vm.teamMemberDt.dtInstance.DataTable.rows({ order: 'applied' }).nodes().indexOf(event.currentTarget.parentNode.parentNode.parentNode);
                            return vm.representativeOfficeModel.photoEquipmentPermitMembers[index];
                        }
                        else {
                            return $filter('filter')(vm.representativeOfficeModel.photoEquipmentPermitMembers, { id: teamMemberId }, true)[0];
                        }
                    }
                }
            });

            modalInstance.result.then(function (teamMember) {
                var teamMember = $filter('filter')(vm.representativeOfficeModel.photoEquipmentPermitMembers, { id: teamMember.id }, true)[0];
                teamMember = teamMember;
            }, function () {
                //state.text('Modal dismissed with Cancel status');
            });
        };

        vm.reviewPartner = function (size, establishmentPartnerId, event) {
            var modalInstance = $uibModal.open({
                templateUrl: 'app/views/Account/completeProfile/establishmentPartner/Review/reviewEstablishmentPartner.html',
                controller: 'ReviewEstablishmentPartnerController',
                size: size,
                resolve: {
                    establishmentPartner: function () {
                        if (establishmentPartnerId == 0) {
                            index = vm.dtPartnerInstance.DataTable.rows({ order: 'applied' }).nodes().indexOf(event.currentTarget.parentNode.parentNode.parentNode);
                            return vm.establishmentPartners[index];
                        }
                        else {
                            return $filter('filter')(vm.establishmentPartners, { id: establishmentPartnerId }, true)[0];
                        }
                    }
                }
            });

            modalInstance.result.then(function (establishmentPartner) {
                var partner = $filter('filter')(vm.establishmentPartners, { id: establishmentPartner.id }, true)[0];
                partner = establishmentPartner;
            }, function () {
                //state.text('Modal dismissed with Cancel status');
            });
        };

        //Get the details of the submitted Form to edit
        $http.get($rootScope.app.httpSource + 'api/RepresentativeOffice/GetById?id=' + $state.params.id)
          .then(function (response) {
              vm.representativeOfficeModel = response.data;
              vm.userTypeCode = vm.representativeOfficeModel.applicationDetail.application.user.userProfiles[0].userType.code;
              vm.Init();
          });
    }

    ReviewRepresentativeOfficeController.$inject = ['$rootScope', '$scope', '$http', '$stateParams', '$state', '$window', '$uibModal', 'UserProfile', 'DTOptionsBuilder',
        'DTColumnBuilder', '$filter', '$compile'];

})();