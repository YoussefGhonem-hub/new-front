/**=========================================================
 * Module: LoginController.js
 * Controller for the Chat APP 
 =========================================================*/

(function () {
    'use strict';

    angular
        .module('eServices')
        .controller('MediaMaterialApprovalController', MediaMaterialApprovalController);

    function MediaMaterialApprovalController($rootScope, $scope, $http, $stateParams, $state, $window, $uibModal, UserProfile, browser, DTOptionsBuilder, DTColumnBuilder, $compile, $filter,
        SweetAlert) {
        var vm = this;

        vm.translateFilter = $filter('translate');
        vm.dtPartnerInstance = {};
        vm.obligationUrl = 'api/Upload/UploadFile?uploadFile=ObligationLetterPath';
        vm.reportOpen = true;

        vm.Init = function () {
            vm.isBusy = false;
            vm.terms = {};
            vm.user = UserProfile.getProfile();

            $http.get($rootScope.app.httpSource + 'api/MediaMaterialCategory?mediaMaterialTypeId=' + vm.mediaMaterialTypeId)
               .then(function (response) {
                   vm.mediaMaterialCategories = response.data;
               });

            $http.get($rootScope.app.httpSource + 'api/AgeClassification?mediaMaterialTypeId=' + vm.mediaMaterialTypeId)
               .then(function (response) {
                   vm.ageClassifications = response.data;
               });

            //Report Actions Datatable
            vm.reportActionsDt = {};
            vm.reportActionsDt.dtInstance = {};
            vm.reportActionsDt.serverData = function (sSource, aoData, fnCallback, oSettings) {
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
                    'recordsTotal': vm.reportModel.reportActions.length,
                    'recordsFiltered': vm.reportModel.reportActions.length,
                    'data': vm.reportModel.reportActions
                };

                fnCallback(records);
            };

            vm.reportActionsDt.actionsHtml = function (data, type, full, meta) {
                var htmlSection = '';

                htmlSection = '<div class="list-icon"><div class="inline" ng-click="mediaCtl.reportActionsDt.edit(\'lg\',' +
                    data.id + ')"><em class="fa fa-pencil" style="cursor:pointer" uib-tooltip="' +
                    vm.translateFilter('general.edit') + '"></em></div><div class="inline" ng-click="mediaCtl.reportActionsDt.delete(' +
                    data.id + ', $event)"><em class="fa fa-trash" style="cursor:pointer" uib-tooltip="' +
                    vm.translateFilter('general.delete') + '"></em></div></div>';

                return htmlSection;
            };

            vm.reportActionsDt.createdRow = function (row, data, dataIndex) {
                $compile(angular.element(row).contents())($scope);
            }

            vm.reportActionsDt.rowCallback = function () { };

            if ($rootScope.language.selected !== 'English') {
                vm.reportActionsDt.dtOptions = DTOptionsBuilder.newOptions()
                .withFnServerData(vm.reportActionsDt.serverData)
                .withOption('serverSide', true)
                .withDataProp('data')
                .withOption('processing', true)
                .withOption('responsive', true)
                .withLanguageSource('app/langs/ar.json')
                .withOption('bFilter', false)
                .withOption('paging', false)
                .withOption('info', false)
                .withOption('createdRow', vm.reportActionsDt.createdRow)
                .withOption('rowCallback', vm.reportActionsDt.rowCallback).withBootstrap();
            }
            else {
                vm.reportActionsDt.dtOptions = DTOptionsBuilder.newOptions()
                .withFnServerData(vm.reportActionsDt.serverData)
                .withOption('serverSide', true)
                .withDataProp('data')
                .withOption('processing', true)
                .withOption('responsive', true)
                .withOption('bFilter', false)
                .withOption('paging', false)
                .withOption('info', false)
                .withOption('createdRow', vm.reportActionsDt.createdRow)
                .withOption('rowCallback', vm.reportActionsDt.rowCallback).withBootstrap();
            }

            if (vm.mediaMaterialTypeId == 9) {
                vm.reportActionsDt.dtColumns = [
                    DTColumnBuilder.newColumn('notes').withTitle(vm.translateFilter('mediaMaterialApproval.note')).withOption('width', '70%'),
                    DTColumnBuilder.newColumn('pageNumber').withTitle(vm.translateFilter('mediaMaterialApproval.pageNumber')),
                    DTColumnBuilder.newColumn('mediaMaterialReportAction').withTitle(vm.translateFilter('mediaMaterialApproval.action')).renderWith(
                    function (data, type) {
                        return $filter('localizeString')(data);
                    }),
                    DTColumnBuilder.newColumn(null).withTitle(vm.translateFilter('general.actions')).notSortable()
                            .renderWith(vm.reportActionsDt.actionsHtml).withOption('width', '10%')];
            }
            else {
                vm.reportActionsDt.dtColumns = [
                    DTColumnBuilder.newColumn('notes').withTitle(vm.translateFilter('mediaMaterialApproval.note')),
                    DTColumnBuilder.newColumn('sceneTime').withTitle(vm.translateFilter('mediaMaterialApproval.sceneTime')).renderWith(
                    function (data, type) {
                        return moment(data).format('hh:mm:ss') == "12:00:00" ? "" : moment(data).format('hh:mm:ss');
                    }),
                    DTColumnBuilder.newColumn('mediaMaterialReportAction').withTitle(vm.translateFilter('mediaMaterialApproval.action')).renderWith(
                    function (data, type) {
                        return $filter('localizeString')(data);
                    }),
                    DTColumnBuilder.newColumn(null).withTitle(vm.translateFilter('general.actions')).notSortable()
                            .renderWith(vm.reportActionsDt.actionsHtml).withOption('width', '15%')];
            }

            vm.reportActionsDt.open = function (size) {

                var modalInstance = $uibModal.open({
                    templateUrl: 'app/views/Controller/actionList/actionList.html',
                    controller: 'ActionListController',
                    size: size,
                    resolve: {
                        reportAction: function () {
                            return null;
                        },
                        mediaMaterialTypeId: function () {
                            return vm.mediaMaterialTypeId;
                        }
                    }
                });

                modalInstance.result.then(function (reportAction) {

                    if (vm.reportModel.reportActions == undefined) {
                        vm.reportModel.reportActions = [];
                    }

                    reportAction.id = vm.reportModel.reportActions.length + 1;
                    vm.reportModel.reportActions.push(reportAction);
                    vm.reportActionsDt.dtInstance.rerender();
                }, function () { });
            };

            vm.reportActionsDt.edit = function (size, reportActionId) {
                var modalInstance = $uibModal.open({
                    templateUrl: 'app/views/Controller/actionList/actionList.html',
                    controller: 'ActionListController',
                    size: size,
                    resolve: {
                        reportAction: function () {
                            return $filter('filter')(vm.reportModel.reportActions, { id: reportActionId }, true)[0];
                        },
                        mediaMaterialTypeId: function () {
                            return vm.mediaMaterialTypeId;
                        }
                    }
                });

                modalInstance.result.then(function (reportAction) {
                    var newReportAction = $filter('filter')(vm.reportModel.reportActions, { id: reportAction.Id }, true)[0];
                    newReportAction = reportAction;
                    vm.reportActionsDt.dtInstance.rerender();
                }, function () {
                    //state.text('Modal dismissed with Cancel status');
                });
            };

            vm.reportActionsDt.delete = function (reportActionId, event) {
                var index;
                var tempStore;

                if (reportActionId == 0 || reportActionId == undefined) {
                    index = vm.locationDt.dtInstance.DataTable.rows({ order: 'applied' }).nodes().indexOf(event.currentTarget.parentNode.parentNode.parentNode);
                    tempStore = vm.reportModel.reportActions[index];
                    vm.reportModel.reportActions.splice(index, 1);
                }
                else {
                    index = vm.reportModel.reportActions.indexOf($filter('filter')(vm.reportModel.reportActions, { id: reportActionId }, true)[0]);
                    tempStore = $filter('filter')(vm.reportModel.reportActions, { id: reportActionId }, true)[0];
                    vm.reportModel.reportActions.splice(index, 1);
                }
                var translate = $filter('translate');
                vm.reportActionsDt.dtInstance.rerender();

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
                            vm.reportActionsDt.dtInstance.rerender();
                        } else {
                            vm.reportModel.reportActions.splice(index, 0, tempStore);
                            SweetAlert.swal(translate('general.restoreBtn'), translate('general.restoreMessage'), "success");
                            vm.reportActionsDt.dtInstance.rerender();
                        }
                    });
            };
        };

        //New Form Condition
        if ($state.params === undefined || $state.params.reportId === undefined || $state.params.reportId === "") {

            vm.editMode = false;
            vm.reportModel = {};
            vm.reportModel.reportActions = [];
            vm.reportModel.reportSubCategories = [];

            $http.get($rootScope.app.httpSource + 'api/ApplicationDetail/GetById?id=' + $state.params.applicationDetailId)
              .then(function (response) {
                  switch (response.data.application.serviceId) {
                      case 2:

                          $http.get($rootScope.app.httpSource + 'api/PrintingPermit/GetByPermitId?id=' + $state.params.applicationDetailId)
                              .then(function (response) {
                                  vm.printingPermit = response.data;
                                  vm.userTypeCode = vm.printingPermit.applicationDetail.application.user.userProfiles[0].userType.code;

                                  if (response.data.publicationType.code == "01" || response.data.publicationType.code == "02") {
                                      vm.mediaMaterialTypeId = 9;
                                  }
                                  else {
                                      vm.mediaMaterialTypeId = 0;
                                  }

                                  vm.Init();
                              });

                          break;

                      case 3:

                          $http.get($rootScope.app.httpSource + 'api/RegulateEntry/GetById?id=' + $state.params.applicationDetailId)
                              .then(function (response) {
                                  vm.mediaMaterialTypeId = 10;
                                  response.data.policyDate = new Date(response.data.policyDate);
                                  vm.mediaMaterial = response.data;
                                  vm.editMode = true;
                                  vm.reportModel.approvedRegulateEntriesItems = vm.mediaMaterial.regulateEntriesItems;
                                  vm.reportModel.rejectedRegulateEntriesItems = $filter('filter')(vm.mediaMaterial.regulateEntriesItems, { isApproved: false }, true);
                                  vm.allowedTypes = ['materials'];

                                  if ((vm.mediaMaterial.applicationDetail.applicationStatusId == 1 || vm.mediaMaterial.applicationDetail.applicationStatusId == 9) && vm.user.userTypeCode != "06" &&
                                      vm.mediaMaterial.applicationDetail.actionsTakens.length > 1) {
                                      if (vm.mediaMaterial.applicationDetail.actionsTakens[vm.mediaMaterial.applicationDetail.actionsTakens.length - 1].transition.actionId == 18 &&
                                          vm.mediaMaterial.applicationDetail.actionsTakens[vm.mediaMaterial.applicationDetail.actionsTakens.length - 1].note != "") {
                                          vm.employeeNote = vm.mediaMaterial.applicationDetail.actionsTakens[vm.mediaMaterial.applicationDetail.actionsTakens.length - 1].note;
                                          vm.employeeNoteDate = moment(vm.mediaMaterial.applicationDetail.actionsTakens[vm.mediaMaterial.applicationDetail.actionsTakens.length - 1].actionDate).format("dddd, MMMM Do YYYY, h:mm:ss a");
                                      }
                                  }
                                  vm.Init();
                              });

                          break;

                      case 10:

                          $http.get($rootScope.app.httpSource + 'api/CirculationMediaMaterial/GetById?id=' + $state.params.applicationDetailId)
                              .then(function (response) {
                                  vm.mediaMaterialTypeId = response.data.artistWorkType.mediaMaterialTypeId;
                                  response.data.copyrightsStartDate = new Date(response.data.copyrightsStartDate);
                                  response.data.copyrightsEndDate = new Date(response.data.copyrightsEndDate);
                                  vm.CirculationMediaMaterial = response.data;
                                  vm.editMode = true;
                                  vm.Init();
                              });

                          break;

                      case 11:

                          $http.get($rootScope.app.httpSource + 'api/CirculationMediaMaterial/GetById?id=' + $state.params.applicationDetailId)
                              .then(function (response) {
                                  vm.CirculationNewspaper = response.data;
                                  vm.mediaMaterialTypeId = response.data.newspaper.isMagazine ? 8 : 7;
                                  response.data.copyrightsStartDate = new Date(response.data.copyrightsStartDate);
                                  response.data.copyrightsEndDate = new Date(response.data.copyrightsEndDate);
                                  vm.editMode = true;
                                  vm.Init();
                              });

                          break;
                  }
              });
        }
        else {
            //Get the details of the submitted Form to edit
            $http.get($rootScope.app.httpSource + 'api/MediaLicense/GetById?id=' + $state.params.applicationDetailId)
              .then(function (response) {
                  vm.editMode = true;
                  vm.mediaLicenses = response.data;
                  vm.Init();
              });
        }

        //Save the details to the server
        vm.save = function (applicationStatusId) {
            vm.isBusy = true;
        }

        vm.workflowClick = function (actionId) {
            vm.isBusy = true;

        }
    }

    MediaMaterialApprovalController.$inject = ['$rootScope', '$scope', '$http', '$stateParams', '$state', '$window', '$uibModal', 'UserProfile', 'browser', 'DTOptionsBuilder', 'DTColumnBuilder',
        '$compile', '$filter', 'SweetAlert'];
})();