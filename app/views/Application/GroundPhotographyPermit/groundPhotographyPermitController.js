/**=========================================================
 * Module: LoginController.js
 * Controller for the Chat APP 
 =========================================================*/

(function () {
    'use strict';

    angular
        .module('eServices')
        .controller('GroundPhotographyPermitController', GroundPhotographyPermitController);

    function GroundPhotographyPermitController($rootScope, $scope, $http, $stateParams, $state, UserProfile, $uibModal, $filter, DTOptionsBuilder, DTColumnBuilder, $compile, SweetAlert, browser) {
        var vm = this;
        vm.user = UserProfile.getProfile();
        vm.serviceFeesObj = { serviceId: 7, serviceFee: [], isExpo2020: false, establishmentId: 0 };
        vm.uploadRequestUrl = 'api/Upload/UploadFile?uploadFile=requestPath';
        vm.uploadExpoProofUrl = 'api/Upload/UploadFile?uploadFile=ExpoProofPath';

        vm.Init = function () {
            vm.terms = {};
            vm.happinessMeterObj = {};
            vm.happinessMeterObj.serviceId = 7;

            $http.get($rootScope.app.httpSource + 'api/PhotographyType')
                .then(function (response) {
                    vm.photographyTypes = response.data;
                    if ($state.params === undefined || $state.params.id === undefined || $state.params.id === "") {
                        var groundPhotographyType = {};
                        groundPhotographyType.photographyType = vm.photographyTypes[0];
                        vm.photographyPermitModel.photographyPermitTypes.push(groundPhotographyType);
                    }
                },
                    function (response) { // optional
                        alert('failed');
                    });

            $http.get($rootScope.app.httpSource + 'api/PhotographyPurpos')
                .then(function (response) {
                    vm.photographyPurposes = response.data;
                },
                    function (response) { // optional
                        alert('failed');
                    });

            if (vm.user.userTypeCode != '05') {
                $http.get($rootScope.app.httpSource + 'api/PrintingPermit/GetAllTextPermitsByUser')
                    .then(function (response) {
                        vm.printingPermits = response.data;
                    });
            }
            // -----------------------------------------------

            // -----------------------------------
            // Date Of Birth Datepicker
            // -----------------------------------
            // Disable select days < today
            $scope.disabled = function (date, mode) {
                var today = new Date();
                today.setTime(today.getTime() + 10 * 86400000);
                return date < today;
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
                startingDay: 1,

            };

            $scope.formats = ['dd-MMMM-yyyy', 'yyyy/MM/dd', 'dd.MM.yyyy', 'shortDate'];
            $scope.format = $scope.formats[0];
            // -----------------------------------
            // Date Of Birth Datepicker
            // -----------------------------------
            // Disable select days < start date
            $scope.enddisabled = function (date, mode) {
                var today = new Date();
                return date < vm.photographyPermitModel.startingDate;
            };

            $scope.endtoggleMin = function () {
                $scope.endminDate = $scope.endminDate ? null : new Date();
            };
            $scope.endtoggleMin();

            $scope.endopen = function ($event) {
                $event.preventDefault();
                $event.stopPropagation();

                $scope.endopened = true;
            };

            $scope.enddateOptions = {
                startingDay: 1
            };

            $scope.endformats = ['dd-MMMM-yyyy', 'yyyy/MM/dd', 'dd.MM.yyyy', 'shortDate'];
            $scope.endformat = $scope.endformats[0];
            //-------------------------------------------------

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

                htmlSection = '<div class="list-icon"><div class="inline" ng-click="ppCtl.locationDt.edit(\'lg\',' +
                    data.id + ')"><em class="fa fa-pencil" style="cursor:pointer" uib-tooltip="' +
                    vm.translateFilter('general.edit') + '"></em></div><div class="inline" ng-click="ppCtl.locationDt.delete(' +
                    data.id + ', $event)"><em class="fa fa-trash" style="cursor:pointer" uib-tooltip="' +
                    vm.translateFilter('general.delete') + '"></em></div></div>';

                return htmlSection;
            };

            vm.locationDt.createdRow = function (row, data, dataIndex) {
                $compile(angular.element(row).contents())($scope);
            }

            vm.locationDt.rowCallback = function () { };
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
                    .withOption('createdRow', vm.locationDt.createdRow)
                    .withOption('rowCallback', vm.locationDt.rowCallback).withBootstrap();
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
                    .withOption('createdRow', vm.locationDt.createdRow)
                    .withOption('rowCallback', vm.locationDt.rowCallback).withBootstrap();
            }

            vm.locationDt.dtColumns = [
                DTColumnBuilder.newColumn('address.emirate').withTitle(vm.translateFilter('address.Emirate')).renderWith(
                    function (data, type) {
                        return $filter('localizeString')(data);
                    }),
                DTColumnBuilder.newColumn('address.community').withTitle(vm.translateFilter('address.Community')).renderWith(
                    function (data, type) {
                        return $filter('localizeString')(data);
                    }),
                DTColumnBuilder.newColumn('address.street').withTitle(vm.translateFilter('address.Street')),
                DTColumnBuilder.newColumn(null).withTitle(vm.translateFilter('general.actions')).notSortable()
                    .renderWith(vm.locationDt.actionsHtml).withOption('width', '15%')];

            vm.locationDt.open = function (size) {
                var modalInstance = $uibModal.open({
                    templateUrl: 'app/views/Application/GroundPhotographyPermit/filmingLocation/filmingLocation.html',
                    controller: 'FilmingLocationController',
                    size: size,
                    resolve: {
                        location: function () {
                            let location = {};
                            location.address = { currentLocation: 'current-position' };
                            return location;
                        }
                    }
                });

                modalInstance.result.then(function (address) {

                    if (vm.photographyPermitModel.photographyPermitLocations == undefined) {
                        vm.photographyPermitModel.photographyPermitLocations = [];
                    }
                    address.id = vm.photographyPermitModel.photographyPermitLocations.length + 1;
                    vm.photographyPermitModel.photographyPermitLocations.push(address);
                    vm.locationDt.dtInstance.rerender();
                }, function () {
                    //state.text('Modal dismissed with Cancel status');
                });
            };

            vm.locationDt.edit = function (size, addressId) {
                var modalInstance = $uibModal.open({
                    templateUrl: 'app/views/Application/GroundPhotographyPermit/filmingLocation/filmingLocation.html',
                    controller: 'FilmingLocationController',
                    size: size,
                    resolve: {
                        location: function () {
                            let location = $filter('filter')(vm.photographyPermitModel.photographyPermitLocations, { id: addressId }, true)[0];
                            if (!location.address.location) {
                                location.address.currentLocation = 'current-position';
                            }
                            else {
                                let Cordinates = '';
                                if (location.address.location.includes('POINT')) {
                                    Cordinates = location.address.location.split('(')[1];
                                    Cordinates = Cordinates.split(')')[0];
                                    location.address.currentLocation = Cordinates.replace(' ', ',');
                                }
                                else {
                                    Cordinates = location.address.location.split('((')[1];
                                    Cordinates = Cordinates.split('))')[0];
                                    Cordinates = Cordinates.split(',');
                                    let pc = Cordinates[0].split(" ");
                                    location.address.currentLocation = parseFloat(pc[1]) + "," + parseFloat(pc[0]);
                                }
                            }
                            return location;
                        }
                    }
                });

                modalInstance.result.then(function (address) {
                    var newAddress = $filter('filter')(vm.photographyPermitModel.photographyPermitLocations, { id: address.Id }, true)[0];
                    newAddress = address;
                    vm.locationDt.dtInstance.rerender();
                }, function () {
                    //state.text('Modal dismissed with Cancel status');
                });
            };
            vm.updatePhotographyPermitLocation = function (PhotographyPermitLocation) {
                $http.post($rootScope.app.httpSource + 'api/PhotographyPermit/UpdatePhotographyPermitLocation', PhotographyPermitLocation)
                    .then(
                        function (response) {

                        },
                        function (response) {
                        });
            }
            vm.locationDt.delete = function (addressId, event) {
                var index;
                var tempStore;

                if (addressId == 0 || addressId == undefined) {
                    index = vm.locationDt.dtInstance.DataTable.rows({ order: 'applied' }).nodes().indexOf(event.currentTarget.parentNode.parentNode.parentNode);
                    tempStore = vm.photographyPermitModel.photographyPermitLocations[index];
                    vm.photographyPermitModel.photographyPermitLocations.splice(index, 1);
                }
                else {
                    index = vm.photographyPermitModel.photographyPermitLocations.indexOf($filter('filter')(vm.photographyPermitModel.photographyPermitLocations, { id: addressId }, true)[0]);
                    tempStore = $filter('filter')(vm.photographyPermitModel.photographyPermitLocations, { id: addressId }, true)[0];
                    vm.photographyPermitModel.photographyPermitLocations.splice(index, 1);
                }
                var translate = $filter('translate');
                vm.locationDt.dtInstance.rerender();

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
                            vm.updatePhotographyPermitLocation(tempStore);
                            SweetAlert.swal(translate('general.confirmDeleteBtn'), translate('general.deleteMessage'), "error");
                            vm.locationDt.dtInstance.rerender();
                        } else {
                            vm.photographyPermitModel.photographyPermitLocations.splice(index, 0, tempStore);
                            SweetAlert.swal(translate('general.restoreBtn'), translate('general.restoreMessage'), "success");
                            vm.locationDt.dtInstance.rerender();
                        }
                    });
            };

            vm.GetExistingMember = function () {
                $http.get($rootScope.app.httpSource + 'api/PhotographyPermit/GetExistingMember')
                    .then(function (response) {
                        for (var i = 0; i < response.data.length; i++) {
                            var photographyPermitMembersList = response.data[i].photographyPermitMembers;

                            vm.photographyPermitModel.photographyPermitMembers = photographyPermitMembersList;
                            vm.teamMemberDt.dtInstance.rerender();
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
                    'recordsTotal': vm.photographyPermitModel.photographyPermitMembers.length,
                    'recordsFiltered': vm.photographyPermitModel.photographyPermitMembers.length,
                    'data': vm.photographyPermitModel.photographyPermitMembers
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

            vm.teamMemberDt.rowCallback = function () {

            };
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
                DTColumnBuilder.newColumn('person').withTitle(vm.translateFilter('profileNationalityDirective.EmiratesId')).renderWith(
                    function (data, type) {
                        if (data.emiratesId != undefined) {
                            return data.emiratesId;
                        }
                        else {
                            return data.passportNumber;
                        }
                    }),
                DTColumnBuilder.newColumn('person.title').withTitle(vm.translateFilter('profileNationalityDirective.Occupation')),
                DTColumnBuilder.newColumn(null).withTitle(vm.translateFilter('general.actions')).notSortable()
                    .renderWith(vm.teamMemberDt.actionsHtml).withOption('width', '15%')];

            vm.teamMemberDt.existingMemberList = function (size) {
                var modalInstance = $uibModal.open({
                    templateUrl: 'app/views/Application/GroundPhotographyPermit/filmingTeam/ExistingMember/existingFilmingTeam.html',
                    controller: 'ExistingFilmingTeamController',
                    size: size,
                    backdrop: 'static',
                    resolve: {
                        teamMember: function () {
                            return null;
                        }
                    }
                });

                modalInstance.result.then(function (teamMember) {
                    if (vm.photographyPermitModel.photographyPermitMembers == undefined) {
                        vm.photographyPermitModel.photographyPermitMembers = [];
                    }

                    for (var i = 0; i < teamMember.length; i++) {
                        var photographyPermitMember = {};
                        photographyPermitMember.person = teamMember[i];
                        vm.photographyPermitModel.photographyPermitMembers.push(photographyPermitMember);
                    }
                    vm.teamMemberDt.dtInstance.rerender();

                }, function () {
                    //state.text('Modal dismissed with Cancel status');
                });
            };

            vm.teamMemberDt.open = function (size) {
                var modalInstance = $uibModal.open({
                    templateUrl: 'app/views/Application/GroundPhotographyPermit/filmingTeam/filmingTeam.html',
                    controller: 'FilmingTeamController',
                    size: size,
                    backdrop: 'static',
                    resolve: {
                        teamMember: function () {
                            return null;
                        }
                    }
                });

                modalInstance.result.then(function (teamMember) {
                    if (vm.photographyPermitModel.photographyPermitMembers == undefined) {
                        vm.photographyPermitModel.photographyPermitMembers = [];
                    }

                    teamMember.id = vm.photographyPermitModel.photographyPermitMembers.length + 1;
                    vm.photographyPermitModel.photographyPermitMembers.push(teamMember);
                    vm.teamMemberDt.dtInstance.rerender();

                }, function () {
                    //state.text('Modal dismissed with Cancel status');
                });
            };

            vm.teamMemberDt.edit = function (size, teamMemberId) {
                var modalInstance = $uibModal.open({
                    templateUrl: 'app/views/Application/GroundPhotographyPermit/filmingTeam/filmingTeam.html',
                    controller: 'FilmingTeamController',
                    size: size,
                    resolve: {
                        teamMember: function () {
                            return $filter('filter')(vm.photographyPermitModel.photographyPermitMembers, { id: teamMemberId }, true)[0];
                        }
                    }
                });

                modalInstance.result.then(function (teamMember) {
                    var newteamMember = $filter('filter')(vm.photographyPermitModel.photographyPermitMembers, { id: teamMember.Id }, true)[0];
                    newteamMember = teamMember;
                    vm.teamMemberDt.dtInstance.rerender();
                }, function () {
                    //state.text('Modal dismissed with Cancel status');
                });
            };
            vm.updatePhotographyPermitMember = function (PhotographyPermitMember) {
                $http.post($rootScope.app.httpSource + 'api/PhotographyPermit/UpdatePhotographyPermitPartner', PhotographyPermitMember)
                    .then(
                        function (response) {

                        },
                        function (response) {
                        });
            }
            vm.teamMemberDt.delete = function (teamMemberId, event) {
                var index;
                var tempStore;

                if (teamMemberId == 0 || teamMemberId == undefined) {
                    index = vm.teamMemberDt.dtInstance.DataTable.rows({ order: 'applied' }).nodes().indexOf(event.currentTarget.parentNode.parentNode.parentNode);
                    tempStore = vm.photographyPermitModel.photographyPermitMembers[index];
                    vm.photographyPermitModel.photographyPermitMembers.splice(index, 1);
                }
                else {
                    index = vm.photographyPermitModel.photographyPermitMembers.indexOf($filter('filter')(vm.photographyPermitModel.photographyPermitMembers, { id: teamMemberId }, true)[0]);
                    tempStore = $filter('filter')(vm.photographyPermitModel.photographyPermitMembers, { id: teamMemberId }, true)[0];
                    vm.photographyPermitModel.photographyPermitMembers.splice(index, 1);
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
                            vm.updatePhotographyPermitMember(tempStore);
                            SweetAlert.swal(translate('general.confirmDeleteBtn'), translate('general.deleteMessage'), "error");
                            vm.teamMemberDt.dtInstance.rerender();
                        } else {
                            vm.photographyPermitModel.photographyPermitMembers.splice(index, 0, tempStore);
                            SweetAlert.swal(translate('general.restoreBtn'), translate('general.restoreMessage'), "success");
                            vm.teamMemberDt.dtInstance.rerender();
                        }
                    });
            };

            // Edit Mode Repopulate the service Fees according to Payment Details
            $scope.$watch('ppCtl.photographyPermitModel.startingDate', function (newVal, oldVal) {
                if (newVal) {
                    vm.serviceFeesObj.startDate = newVal;
                    vm.serviceFeesObj.endDate = vm.photographyPermitModel.endingDate;
                    vm.serviceFeesObj.reloadTable();
                }
            }, true);

            // Edit Mode Repopulate the service Fees according to Payment Details
            $scope.$watch('ppCtl.photographyPermitModel.endingDate', function (newVal, oldVal) {
                if (newVal) {
                    vm.serviceFeesObj.startDate = vm.photographyPermitModel.startingDate;
                    vm.serviceFeesObj.endDate = newVal;
                    vm.serviceFeesObj.reloadTable();
                }
            }, true);

            if (vm.user.userTypeCode != '05') {
                $scope.$watch('ppCtl.photographyPermitModel.photographyPermitPurposes.length', function (newVal, oldVal) {
                    if (vm.photographyPermitModel.photographyPermitPurposes.length != 0) {
                        var permitRequired = vm.photographyPermitModel.photographyPermitPurposes.filter(function (el) {
                            return (el.photographyPurpos.code == '01' || el.photographyPurpos.code == '04' || el.photographyPurpos.code == '05');
                        });
                        if (permitRequired.length != 0) {
                            vm.ispermitrequired = true;
                        }
                        else {
                            vm.ispermitrequired = false;
                        }
                    }
                    else {
                        vm.ispermitrequired = false;
                    }
                });
            }
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
            vm.photographyPermitModel = {};
            vm.photographyPermitModel.photographyPermitLocations = [];
            vm.photographyPermitModel.photographyPermitMembers = [];
            vm.photographyPermitModel.photographyPermitTypes = [];
            vm.photographyPermitModel.photographyPermitPurposes = [];
            vm.showPrintingPermit = false;
            vm.photographyPermitModel.applicationDetail = {
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
            };

            if (vm.user.userTypeCode != '01') {
                $http.get($rootScope.app.httpSource + 'api/Establishment/GetById?id=' + $state.params.establishmentId)
                    .then(function (response) {
                        vm.photographyPermitModel.applicationDetail.application.establishment = response.data;
                        vm.serviceFeesObj.establishmentId = vm.photographyPermitModel.applicationDetail.application.establishment.id;
                    });
            }

            vm.Init();
        }
        else {
            //Get the details of the submitted Form to edit
            $http.get($rootScope.app.httpSource + 'api/PhotographyPermit/GetById?id=' + $state.params.id)
                .then(function (response) {
                    vm.editMode = true;
                    response.data.startingDate = new Date(response.data.startingDate);
                    response.data.endingDate = new Date(response.data.endingDate);
                    vm.photographyPermitModel = response.data;
                    vm.serviceFeesObj.isExpo2020 = vm.photographyPermitModel.isExpo;

                    if (vm.photographyPermitModel.applicationDetail.applicationStatusId == 1 && vm.user.userTypeCode != "06" && vm.photographyPermitModel.applicationDetail.actionsTakens.length > 1) {
                        if (vm.photographyPermitModel.applicationDetail.actionsTakens[vm.photographyPermitModel.applicationDetail.actionsTakens.length - 1].transition.actionId == 6 &&
                            vm.photographyPermitModel.applicationDetail.actionsTakens[vm.photographyPermitModel.applicationDetail.actionsTakens.length - 1].note != "") {
                            vm.employeeNote = vm.photographyPermitModel.applicationDetail.actionsTakens[vm.photographyPermitModel.applicationDetail.actionsTakens.length - 1].note;
                            vm.employeeNoteDate = moment(vm.photographyPermitModel.applicationDetail.actionsTakens[vm.photographyPermitModel.applicationDetail.actionsTakens.length - 1].actionDate).format("dddd, MMMM Do YYYY, h:mm:ss a");
                        }
                    }

                    for (var id in vm.photographyPermitModel.photographyPermitLocations) {
                        vm.photographyPermitModel.photographyPermitLocations[id].address.emirate = vm.photographyPermitModel.photographyPermitLocations[id].address.community.region.emirate;
                    }
                    vm.Init();
                });
        }

        vm.save = function (applicationStatusId) {
            if (!vm.photographyPermitModel.photographyPermitTypes.length || !vm.photographyPermitModel.photographyPermitPurposes.length ||
                !vm.photographyPermitModel.photographyPermitLocations.length) {
                vm.showRequiredError = true;
                return;
            }
            vm.isBusy = true;
            vm.showRequiredError = false;

            if (vm.serviceFeesObj.serviceFee[0] != null && vm.serviceFeesObj.total != 0) {
                vm.photographyPermitModel.applicationDetail.payments[0].paymentDetails = vm.serviceFeesObj.serviceFee;
            }
            else {
                vm.photographyPermitModel.applicationDetail.payments = null;
            }

            if ($rootScope.app.isPMOHappiness) {
                switch (applicationStatusId) {
                    case 1:
                        $http.post($rootScope.app.httpSource + 'api/PhotographyPermit/SavePhotographyPermit', vm.photographyPermitModel)
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
                        $http.post($rootScope.app.httpSource + 'api/PhotographyPermit/SubmitPhotographyPermit', vm.photographyPermitModel)
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
                    vm.photographyPermitModel.applicationDetail.happinessRate = happinessRate;
                    //Post to save
                    switch (applicationStatusId) {
                        case 1:
                            $http.post($rootScope.app.httpSource + 'api/PhotographyPermit/SavePhotographyPermit', vm.photographyPermitModel)
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
                            $http.post($rootScope.app.httpSource + 'api/PhotographyPermit/SubmitPhotographyPermit', vm.photographyPermitModel)
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
                    $http.post($rootScope.app.httpSource + 'api/PhotographyPermit/UpdatePhotographyPermit', vm.photographyPermitModel)
                        .then(function (response) {
                            $state.go('app.dashboard');
                        },
                            function (response) { // optional
                                vm.isBusy = false;
                            });
                    break;

                case 2:
                    $http.post($rootScope.app.httpSource + 'api/PhotographyPermit/SubmitUpdatePhotographyPermit', vm.photographyPermitModel)
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
    GroundPhotographyPermitController.$inject = ['$rootScope', '$scope', '$http', '$stateParams', '$state', 'UserProfile', '$uibModal', '$filter', 'DTOptionsBuilder', 'DTColumnBuilder', '$compile', 'SweetAlert', 'browser'];

})();