/**=========================================================
 * Module: LoginController.js
 * Controller for the Chat APP 
 =========================================================*/

(function () {
    'use strict';

    angular
        .module('eServices')
        .controller('PhotoEquipmentPermitController', PhotoEquipmentPermitController);

    function PhotoEquipmentPermitController($rootScope, $scope, $http, $stateParams, $state, UserProfile, $uibModal, $filter, DTOptionsBuilder, DTColumnBuilder, $compile, SweetAlert, browser) {
        var vm = this;
        vm.user = UserProfile.getProfile();
        vm.serviceFeesObj = { serviceId: 13, serviceFee: [], isExpo2020: false };
        vm.uploadExpoProofUrl = 'api/Upload/UploadFile?uploadFile=ExpoProofPath';

        vm.Init = function () {
            vm.terms = {};
            vm.uploadRequestUrl = 'api/Upload/UploadFile?uploadFile=requestPath';
            vm.uploadPurposeUrl = 'api/Upload/UploadFile?uploadFile=photoEquipmentRequestPath';
            vm.happinessMeterObj = {};
            vm.happinessMeterObj.serviceId = 13;

            $http.get($rootScope.app.httpSource + 'api/Emirate')
                .then(function (response) {
                    vm.emirates = response.data;
                },
                    function (response) { // optional
                        alert('failed');
                    });

            $scope.disabled = function (date, mode) {
                var today = new Date();
                today.setHours(date.getHours());
                today.setMinutes(date.getMinutes());
                today.setSeconds(date.getSeconds());
                today.setMilliseconds(date.getMilliseconds() - 1);
                return date <= today;
            };

            $scope.toggleMin = function () {
                $scope.minDate = $scope.minDate ? null : new Date();
            };
            $scope.toggleMin();

            $scope.open = function ($event) {
                $event.preventDefault();
                $event.stopPropagation();

                $scope.opened = true;
            };

            $scope.dateOptions = {
                startingDay: 1
            };

            $scope.formats = ['dd-MMMM-yyyy', 'yyyy/MM/dd', 'dd.MM.yyyy', 'shortDate'];
            $scope.format = $scope.formats[0];

            //Equipments Datatable
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

                htmlSection = '<div class="list-icon"><div class="inline" ng-click="ppCtl.equipmentDt.edit(\'lg\',' +
                    data.id + ')"><em class="fa fa-pencil" style="cursor:pointer" uib-tooltip="' +
                    vm.translateFilter('general.edit') + '"></em></div><div class="inline" ng-click="ppCtl.equipmentDt.delete(' +
                    data.id + ', $event)"><em class="fa fa-trash" style="cursor:pointer" uib-tooltip="' +
                    vm.translateFilter('general.delete') + '"></em></div></div>';

                return htmlSection;
            };

            vm.equipmentDt.createdRow = function (row, data, dataIndex) {
                $compile(angular.element(row).contents())($scope);
            }

            vm.equipmentDt.rowCallback = function () { };
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
                    .withOption('createdRow', vm.equipmentDt.createdRow)
                    .withOption('rowCallback', vm.equipmentDt.rowCallback).withBootstrap();
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
                    .withOption('createdRow', vm.equipmentDt.createdRow)
                    .withOption('rowCallback', vm.equipmentDt.rowCallback).withBootstrap();
            }

            vm.equipmentDt.dtColumns = [
                DTColumnBuilder.newColumn('photoEquipment').withTitle(vm.translateFilter('photoEquipment.equipment')).renderWith(
                    function (data, type) {
                        return $filter('localizeString')(data);
                    }),
                DTColumnBuilder.newColumn('number').withTitle(vm.translateFilter('photoEquipment.number')),
                DTColumnBuilder.newColumn(null).withTitle(vm.translateFilter('general.actions')).notSortable()
                    .renderWith(vm.equipmentDt.actionsHtml).withOption('width', '15%')];

            vm.equipmentDt.open = function (size) {

                var modalInstance = $uibModal.open({
                    templateUrl: 'app/views/Application/PhotoEquipmentPermit/equipmentList/equipmentList.html',
                    controller: 'EquipmentListController',
                    size: size,
                    resolve: {
                        equipment: function () {
                            return null;
                        }
                    }
                });

                modalInstance.result.then(function (equipment) {
                    if (vm.photoEquipmentPermitModel.photoEquipmentPermitEquipments == undefined) {
                        vm.photoEquipmentPermitModel.photoEquipmentPermitEquipments = [];
                    }
                    equipment.id = vm.photoEquipmentPermitModel.photoEquipmentPermitEquipments.length + 1;
                    vm.photoEquipmentPermitModel.photoEquipmentPermitEquipments.push(equipment);
                    vm.equipmentDt.dtInstance.rerender();
                }, function () { });
            };

            vm.equipmentDt.edit = function (size, photoEquipmentId) {
                var modalInstance = $uibModal.open({
                    templateUrl: 'app/views/Application/PhotoEquipmentPermit/equipmentList/equipmentList.html',
                    controller: 'EquipmentListController',
                    size: size,
                    resolve: {
                        equipment: function () {
                            return $filter('filter')(vm.photoEquipmentPermitModel.photoEquipmentPermitEquipments, { id: photoEquipmentId }, true)[0];
                        }
                    }
                });

                modalInstance.result.then(function (photoEquipment) {
                    var newPhotoEquipment = $filter('filter')(vm.photoEquipmentPermitModel.photoEquipmentPermitEquipments, { id: photoEquipment.Id }, true)[0];
                    newPhotoEquipment = photoEquipment;
                    vm.equipmentDt.dtInstance.rerender();
                }, function () {
                    //state.text('Modal dismissed with Cancel status');
                });
            };

            vm.equipmentDt.delete = function (addressId, event) {
                var index;
                var tempStore;

                if (addressId == 0 || addressId == undefined) {
                    index = vm.equipmentDt.dtInstance.DataTable.rows({ order: 'applied' }).nodes().indexOf(event.currentTarget.parentNode.parentNode.parentNode);
                    tempStore = vm.photoEquipmentPermitModel.photoEquipmentPermitEquipments[index];
                    vm.photoEquipmentPermitModel.photoEquipmentPermitEquipments.splice(index, 1);
                }
                else {
                    index = vm.photoEquipmentPermitModel.photoEquipmentPermitEquipments.indexOf($filter('filter')(vm.photoEquipmentPermitModel.photoEquipmentPermitEquipments, { id: addressId }, true)[0]);
                    tempStore = $filter('filter')(vm.photoEquipmentPermitModel.photoEquipmentPermitEquipments, { id: addressId }, true)[0];
                    vm.photoEquipmentPermitModel.photoEquipmentPermitEquipments.splice(index, 1);
                }
                var translate = $filter('translate');
                vm.equipmentDt.dtInstance.rerender();

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
                            vm.equipmentDt.dtInstance.rerender();
                        } else {
                            vm.photoEquipmentPermitModel.photoEquipmentPermitEquipments.splice(index, 0, tempStore);
                            SweetAlert.swal(translate('general.restoreBtn'), translate('general.restoreMessage'), "success");
                            vm.equipmentDt.dtInstance.rerender();
                        }
                    });
            };

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
                //DTColumnBuilder.newColumn('person.emiratesId').withTitle(vm.translateFilter('profileNationalityDirective.EmiratesId')),                
                DTColumnBuilder.newColumn(null).withTitle(vm.translateFilter('profileNationalityDirective.emiratedIdPassport')).renderWith(
                    function (data, type) {
                        if (data.person.emiratesId != null) {                            
                            return data.person.emiratesId;
                        }
                        else {
                            return data.person.passportNumber;
                        }
                    }),
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

                    if (vm.photoEquipmentPermitModel.photoEquipmentPermitMembers == undefined) {
                        vm.photoEquipmentPermitModel.photoEquipmentPermitMembers = [];
                    }
                    teamMember.id = vm.photoEquipmentPermitModel.photoEquipmentPermitMembers.length + 1;
                    vm.photoEquipmentPermitModel.photoEquipmentPermitMembers.push(teamMember);
                    vm.teamMemberDt.dtInstance.rerender();

                }, function () {
                    //state.text('Modal dismissed with Cancel status');
                });
            };

            vm.teamMemberDt.edit = function (size, teamMemberId) {
                var modalInstance = $uibModal.open({
                    templateUrl: 'app/views/Application/PhotoEquipmentPermit/equipmentTeam/equipmentTeam.html',
                    controller: 'EquipmentTeamController',
                    size: size,
                    resolve: {
                        teamMember: function () {
                            return $filter('filter')(vm.photoEquipmentPermitModel.photoEquipmentPermitMembers, { id: teamMemberId }, true)[0];
                        }
                    }
                });

                modalInstance.result.then(function (teamMember) {
                    var newteamMember = $filter('filter')(vm.photoEquipmentPermitModel.photoEquipmentPermitMembers, { id: teamMember.Id }, true)[0];
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
                    tempStore = vm.photoEquipmentPermitModel.photoEquipmentPermitMembers[index];
                    vm.photoEquipmentPermitModel.photoEquipmentPermitMembers.splice(index, 1);
                }
                else {
                    index = vm.photoEquipmentPermitModel.photoEquipmentPermitMembers.indexOf($filter('filter')(vm.photoEquipmentPermitModel.photoEquipmentPermitMembers, { id: teamMemberId }, true)[0]);
                    tempStore = $filter('filter')(vm.photoEquipmentPermitModel.photoEquipmentPermitMembers, { id: teamMemberId }, true)[0];
                    vm.photoEquipmentPermitModel.photoEquipmentPermitMembers.splice(index, 1);
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
                            vm.photoEquipmentPermitModel.photoEquipmentPermitMembers.splice(index, 0, tempStore);
                            SweetAlert.swal(translate('general.restoreBtn'), translate('general.restoreMessage'), "success");
                            vm.teamMemberDt.dtInstance.rerender();
                        }
                    });
            };
        }

        vm.changeFeeForExpo = function (obj) {
            if (obj == true) {
                vm.serviceFeesObj.isExpo2020 = true;
                vm.serviceFeesObj.reloadTable();
            }
            else {
                vm.serviceFeesObj.isExpo2020 = false;
                vm.serviceFeesObj.reloadTable();
            }
        };
        //New Form Condition
        if ($state.params === undefined || $state.params.id === undefined || $state.params.id === "") {
            // New Permit
            vm.editMode = false;
            vm.photoEquipmentPermitModel = {
                photoEquipmentPermitEquipments: [],
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
                }
            };

            if (vm.user.userTypeCode != '01') {
                $http.get($rootScope.app.httpSource + 'api/Establishment/GetById?id=' + $state.params.establishmentId)
                    .then(function (response) {
                        vm.photoEquipmentPermitModel.applicationDetail.application.establishment = response.data;
                    });
            }

            vm.Init();
        }
        else {
            //Get the details of the submitted Form to edit
            $http.get($rootScope.app.httpSource + 'api/PhotoEquipmentPermit/GetById?id=' + $state.params.id)
                .then(function (response) {
                    vm.editMode = true;
                    response.data.startingDate = new Date(response.data.startingDate);
                    response.data.endingDate = new Date(response.data.endingDate);
                    vm.photoEquipmentPermitModel = response.data;
                    for (var id in vm.photoEquipmentPermitModel.photographyPermitLocations) {
                        vm.photoEquipmentPermitModel.photographyPermitLocations[id].address.emirate = vm.photoEquipmentPermitModel.photographyPermitLocations[id].address.community.region.emirate;
                    }

                    if (vm.photoEquipmentPermitModel.applicationDetail.applicationStatusId == 1 && vm.user.userTypeCode != "06" && vm.photoEquipmentPermitModel.applicationDetail.actionsTakens.length > 1) {
                        if (vm.photoEquipmentPermitModel.applicationDetail.actionsTakens[vm.photoEquipmentPermitModel.applicationDetail.actionsTakens.length - 1].transition.actionId == 6 &&
                            vm.photoEquipmentPermitModel.applicationDetail.actionsTakens[vm.photoEquipmentPermitModel.applicationDetail.actionsTakens.length - 1].note != "") {
                            vm.employeeNote = vm.photoEquipmentPermitModel.applicationDetail.actionsTakens[vm.photoEquipmentPermitModel.applicationDetail.actionsTakens.length - 1].note;
                            vm.employeeNoteDate = moment(vm.photoEquipmentPermitModel.applicationDetail.actionsTakens[vm.photoEquipmentPermitModel.applicationDetail.actionsTakens.length - 1].actionDate).format("dddd, MMMM Do YYYY, h:mm:ss a");
                        }
                    }

                    vm.Init();
                });
        }

        vm.save = function (applicationStatusId) {
            vm.isBusy = true;
            if (vm.serviceFeesObj.serviceFee[0] != null) {
                vm.photoEquipmentPermitModel.applicationDetail.payments[0].paymentDetails = vm.serviceFeesObj.serviceFee;
            }
            else {
                vm.photoEquipmentPermitModel.applicationDetail.payments = null;
            }

            if ($rootScope.app.isPMOHappiness) {
                switch (applicationStatusId) {
                    case 1:
                        $http.post($rootScope.app.httpSource + 'api/PhotoEquipmentPermit/SavePhotoEquipmentPermit', vm.photoEquipmentPermitModel)
                            .then(function (response) {
                                if (response.data == "false") {
                                    vm.EmritIdRepeated = true;
                                    vm.isBusy = false;
                                }
                                else {
                                    vm.EmritIdRepeated = false;
                                    vm.happinessMeterObj.transactionId = response.data;
                                    vm.showHappinessMeter = true;
                                }
                            },
                                function (response) { // optional
                                    vm.isBusy = false;
                            });

                        break;

                    case 2:
                        $http.post($rootScope.app.httpSource + 'api/PhotoEquipmentPermit/SubmitPhotoEquipmentPermit', vm.photoEquipmentPermitModel)
                            .then(function (response) {
                                vm.happinessMeterObj.transactionId = response.data;
                                vm.showHappinessMeter = true;
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
                    vm.photoEquipmentPermitModel.applicationDetail.happinessRate = happinessRate;
                    //Post to save
                    switch (applicationStatusId) {
                        case 1:
                            $http.post($rootScope.app.httpSource + 'api/PhotoEquipmentPermit/SavePhotoEquipmentPermit', vm.photoEquipmentPermitModel)
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
                            $http.post($rootScope.app.httpSource + 'api/PhotoEquipmentPermit/SubmitPhotoEquipmentPermit', vm.photoEquipmentPermitModel)
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
                    $http.post($rootScope.app.httpSource + 'api/PhotoEquipmentPermit/UpdatePhotoEquipmentPermit', vm.photoEquipmentPermitModel)
                        .then(function (response) {
                            $state.go('app.dashboard');
                        },
                            function (response) { // optional
                                vm.isBusy = false;
                            });
                    break;

                case 2:
                    $http.post($rootScope.app.httpSource + 'api/PhotoEquipmentPermit/SubmitUpdatePhotoEquipmentPermit', vm.photoEquipmentPermitModel)
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
    PhotoEquipmentPermitController.$inject = ['$rootScope', '$scope', '$http', '$stateParams', '$state', 'UserProfile', '$uibModal', '$filter', 'DTOptionsBuilder', 'DTColumnBuilder', '$compile', 'SweetAlert', 'browser'];

})();