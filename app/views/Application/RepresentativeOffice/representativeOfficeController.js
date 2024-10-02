/**=========================================================
 * Module: LoginController.js
 * Controller for the Chat APP 
 =========================================================*/

(function () {
    'use strict';

    angular
        .module('eServices')
        .controller('RepresentativeOfficeController', RepresentativeOfficeController);

    function RepresentativeOfficeController($rootScope, $scope, $http, $stateParams, $state, UserProfile, $uibModal, $filter, DTOptionsBuilder, DTColumnBuilder, $compile, SweetAlert, browser) {
        var vm = this;
        vm.user = UserProfile.getProfile();
        vm.serviceFeesObj = { serviceId: 1, serviceFee: [] };

        vm.Init = function () {
            vm.terms = {};
            vm.happinessMeterObj = {};
            vm.happinessMeterObj.serviceId = 1;

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

                htmlSection = '<div class="list-icon"><div class="inline" ng-click="ppCtl.teamMemberDt.edit(\'lg\',' +
                    data.id + ')"><em class="fa fa-pencil" style="cursor:pointer" uib-tooltip="' +
                    vm.translateFilter('general.edit') + '"></em></div><div class="inline" ng-click="ppCtl.teamMemberDt.delete(' +
                    data.id + ', $event)"><em class="fa fa-trash" style="cursor:pointer" uib-tooltip="' +
                    vm.translateFilter('general.delete') + '"></em></div></div>';

                return htmlSection;
            };

            vm.teamMemberDt.createdRow = function (row, data, dataIndex) {
                // Recompiling so we can bind Angular directive to the DT
                $compile(angular.element(row).contents())($scope);
            }

            vm.teamMemberDt.rowCallback = function () { };

            vm.translateFilter = $filter('translate');

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
                    .withOption('createdRow', vm.teamMemberDt.createdRow)
                    .withOption('rowCallback', vm.teamMemberDt.rowCallback).withBootstrap();
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
                    .withOption('createdRow', vm.teamMemberDt.createdRow)
                    .withOption('rowCallback', vm.teamMemberDt.rowCallback).withBootstrap();
            }

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

            vm.teamMemberDt.open = function (size) {

                var modalInstance = $uibModal.open({
                    templateUrl: 'app/views/Application/PhotoEquipmentPermit/equipmentTeam/equipmentTeam.html',
                    controller: 'EquipmentTeamController',
                    size: size,
                    resolve: {
                        teamMember: function () {
                            return null;
                        }
                    }
                });

                modalInstance.result.then(function (teamMember) {

                    if (vm.representativeOfficeModel.establishment.establishmentPartners == undefined) {
                        vm.representativeOfficeModel.establishment.establishmentPartners = [];
                    }
                    teamMember.id = vm.representativeOfficeModel.establishment.establishmentPartners.length + 1;
                    vm.representativeOfficeModel.establishment.establishmentPartners.push(teamMember);
                    vm.teamMemberDt.dtInstance.rerender();

                }, function () {
                    //state.text('Modal dismissed with Cancel status');
                });
            };

            vm.teamMemberDt.edit = function (size, teamMemberId) {
                var modalInstance = $uibModal.open({
                    templateUrl: 'app/views/Application/PhotographyPermit/filmingTeam/filmingTeam.html',
                    controller: 'FilmingTeamController',
                    size: size,
                    resolve: {
                        teamMember: function () {
                            return $filter('filter')(vm.representativeOfficeModel.establishment.establishmentPartners, { id: teamMemberId }, true)[0];
                        }
                    }
                });

                modalInstance.result.then(function (teamMember) {
                    var newteamMember = $filter('filter')(vm.representativeOfficeModel.establishment.establishmentPartners, { id: teamMember.Id }, true)[0];
                    newteamMember = teamMember;
                    vm.teamMemberDt.dtInstance.rerender();
                }, function () {
                    //state.text('Modal dismissed with Cancel status');
                });
            };

            vm.teamMemberDt.delete = function (teamMemberId, event) {
                var index;
                var tempStore;

                if (teamMemberId == 0 || teamMemberId == undefined) {
                    index = vm.teamMemberDt.dtInstance.DataTable.rows({ order: 'applied' }).nodes().indexOf(event.currentTarget.parentNode.parentNode.parentNode);
                    tempStore = vm.representativeOfficeModel.establishment.establishmentPartners[index];
                    vm.representativeOfficeModel.establishment.establishmentPartners.splice(index, 1);
                }
                else {
                    index = vm.representativeOfficeModel.establishment.establishmentPartners.indexOf($filter('filter')(vm.representativeOfficeModel.establishment.establishmentPartners, { id: teamMemberId }, true)[0]);
                    tempStore = $filter('filter')(vm.representativeOfficeModel.establishment.establishmentPartners, { id: teamMemberId }, true)[0];
                    vm.representativeOfficeModel.establishment.establishmentPartners.splice(index, 1);
                }
                var translate = $filter('translate');
                vm.teamMemberDt.dtInstance.rerender();

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
                            //delete
                            SweetAlert.swal(translate('general.confirmDeleteBtn'), translate('general.deleteMessage'), "error");
                            vm.teamMemberDt.dtInstance.rerender();
                        } else {
                            vm.representativeOfficeModel.photoEquipmentPermitMembers.splice(index, 0, tempStore);
                            SweetAlert.swal(translate('general.restoreBtn'), translate('general.restoreMessage'), "success");
                            vm.teamMemberDt.dtInstance.rerender();
                        }
                    });
            };
        }

        //New Form Condition
        if ($state.params === undefined || $state.params.id === undefined || $state.params.id === "") {
            // New Permit
            vm.editMode = false;
            vm.representativeOfficeModel = {
                photoEquipmentPermitMembers: [],
                applicationDetail: {
                    payments: [{
                        paymentDetails: []
                    }],
                    browser: {
                        name: browser.name
                    },
                    platform: {
                        name: browser.platform
                    },
                    versionNumber: browser.versionNumber,
                    application: {}
                },
                establishment: {
                    establishmentPartners: []
                }
            };

            if (vm.user.userTypeCode != '01') {
                $http.get($rootScope.app.httpSource + 'api/Establishment/GetById?id=' + $state.params.establishmentId)
                    .then(function (response) {
                        vm.representativeOfficeModel.applicationDetail.application.establishment = response.data;
                    });
            }

            vm.Init();
        }
        else {
            //Get the details of the submitted Form to edit
            $http.get($rootScope.app.httpSource + 'api/RepresentativeOffice/GetById?id=' + $state.params.id)
                .then(function (response) {
                    vm.editMode = true;
                    vm.representativeOfficeModel = response.data;
                    vm.Init();
                });
        }

        vm.save = function (applicationStatusId) {
            vm.isBusy = true;
            vm.representativeOfficeModel.applicationDetail.payments[0].paymentDetails = vm.serviceFeesObj.serviceFee;

            if ($rootScope.app.isPMOHappiness) {
                switch (applicationStatusId) {
                    case 1:
                        $http.post($rootScope.app.httpSource + 'api/RepresentativeOffice/SaveRepresentativeOffice', vm.representativeOfficeModel)
                            .then(function (response) {
                                if (response.data == "false") {
                                    vm.EmritIdRepeated = true;
                                    vm.isBusy = false;
                                }
                                else {
                                    vm.EmritIdRepeated = false;
                                    vm.happinessMeterObj.transactionId = response.data;
                                    vm.showHappinessMeter = true;
                                    $state.go('app.dashboard');
                                }
                            },
                                function (response) { // optional
                                    vm.isBusy = false;
                                });

                        break;

                    case 2:
                        $http.post($rootScope.app.httpSource + 'api/RepresentativeOffice/SubmitRepresentativeOffice', vm.representativeOfficeModel)
                            .then(function (response) {
                                vm.happinessMeterObj.transactionId = response.data;
                                vm.showHappinessMeter = true;
                                $state.go('app.dashboard');
                            },
                                function (response) { // optional
                                    vm.isBusy = false;
                                });

                        break;
                }
            }
            else {

                var modalInstance = $uibModal.open({
                    templateUrl: 'app/views/Controls/happinessRating/happinessRating.html',
                    controller: 'HappinessRatingController',
                    size: 'lg',
                    keyboard: false,
                    backdrop: 'static'
                });

                modalInstance.result.then(function (happinessRate) {
                    vm.representativeOfficeModel.applicationDetail.happinessRate = happinessRate;
                    //Post to save
                    switch (applicationStatusId) {
                        case 1:
                            $http.post($rootScope.app.httpSource + 'api/RepresentativeOffice/SaveRepresentativeOffice', vm.representativeOfficeModel)
                                .then(function (response) {
                                    if (response.data == "false") {
                                        vm.EmritIdRepeated = true;
                                        vm.isBusy = false;
                                    }
                                    else {
                                        vm.EmritIdRepeated = false;
                                        $state.go('app.dashboard');
                                    }
                                },
                                    function (response) { // optional
                                        vm.isBusy = false;
                                    });
                            break;

                        case 2:
                            $http.post($rootScope.app.httpSource + 'api/RepresentativeOffice/SubmitRepresentativeOffice', vm.representativeOfficeModel)
                                .then(function (response) {
                                    $state.go('app.dashboard');
                                },
                                    function (response) { // optional
                                        vm.isBusy = false;
                                    });
                            break;
                    }
                });
            }
        }

        vm.workflowClick = function (actionId) {
            vm.isBusy = true;
            switch (actionId) {

                case 1:
                    $http.post($rootScope.app.httpSource + 'api/RepresentativeOffice/UpdateRepresentativeOffice', vm.representativeOfficeModel)
                        .then(function (response) {
                            $state.go('app.dashboard');
                        },
                            function (response) { // optional
                                vm.isBusy = false;
                            });
                    break;

                case 2:
                    $http.post($rootScope.app.httpSource + 'api/RepresentativeOffice/SubmitUpdateRepresentativeOffice', vm.representativeOfficeModel)
                        .then(function (response) {
                            $state.go('app.dashboard');
                        },
                            function (response) { // optional
                                vm.isBusy = false;
                            });
                    break;
            }
        }
    }
    RepresentativeOfficeController.$inject = ['$rootScope', '$scope', '$http', '$stateParams', '$state', 'UserProfile', '$uibModal', '$filter', 'DTOptionsBuilder', 'DTColumnBuilder', '$compile', 'SweetAlert', 'browser'];
})();