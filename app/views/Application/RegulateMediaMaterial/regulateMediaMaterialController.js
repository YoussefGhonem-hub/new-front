/**=========================================================
 * Module: LoginController.js
 * Controller for the Chat APP 
 =========================================================*/

(function () {
    'use strict';

    angular
        .module('eServices')
        .controller('RegulateMediaMaterialController', RegulateMediaMaterialController);

    function RegulateMediaMaterialController($rootScope, $scope, $http, $state, $stateParams, $uibModal, UserProfile, SweetAlert, browser, $filter, DTOptionsBuilder, DTColumnBuilder, $compile) {
        var vm = this;
        vm.serviceFeesObj = { serviceId: 3, serviceFee: [], materialTypeIds: [], userTypeId: 0, isExpo2020: false };
        vm.user = UserProfile.getProfile();
        var translate = $filter('translate');

        vm.gridInit = function () {
            vm.gridOptions = {};
            vm.gridOptions.columnDefs = [
                { name: 'No', enableCellEdit: false, width: '5%' },
                {
                    name: 'ISBN', displayName: 'ISBN', width: '10%',
                    cellClass:
                        function (grid, row, col, rowRenderIndex, colRenderIndex) {

                            if (grid.getCellValue(row, col).length > 13 || grid.getCellValue(row, col).length < 10) {
                                return 'error-isbn';
                            }

                            var groupBy = function (xs, key) {
                                return xs.reduce(function (rv, x) {
                                    let v = key instanceof Function ? key(x) : x[key];
                                    let el = rv.find((r) => r && r.key === v);
                                    if (el) {
                                        el.values.push(x);
                                    } else {
                                        rv.push({ key: v, values: [x] });
                                    }
                                    return rv;
                                }, []);
                            };

                            var filteredData = groupBy(grid.options.data, 'ISBN');

                            for (var i = 0; i < filteredData.length; i++) {
                                if (filteredData[i].values.length > 1 && grid.getCellValue(row, col) === filteredData[i].key) {
                                    return 'error-isbn';
                                }
                            }
                        }
                },
                { name: 'Title', displayName: 'Title', width: '20%' },
                { name: 'Author', displayName: 'Author', width: '20%' },
                {
                    name: 'Category', displayName: 'Category', editableCellTemplate: 'ui-grid/dropdownEditor', width: '15%',
                    editDropdownValueLabel: 'nameEn', editDropdownRowEntityOptionsArrayPath: 'subjects', editDropdownIdLabel: 'nameEn',
                    cellClass:
                        function (grid, row, col, rowRenderIndex, colRenderIndex) {
                            if ($filter('filter')(grid.options.data[0].subjects, { nameEn: grid.getCellValue(row, col) }).length == 0) {
                                return 'error-isbn';
                            }
                        }
                },
                {
                    name: 'Language1', displayName: 'Language1', editableCellTemplate: 'ui-grid/dropdownEditor', width: '10%',
                    editDropdownValueLabel: 'nameEn', editDropdownRowEntityOptionsArrayPath: 'languages', editDropdownIdLabel: 'nameEn',
                    cellClass:
                        function (grid, row, col, rowRenderIndex, colRenderIndex) {
                            if ($filter('filter')(grid.options.data[0].languages, { nameEn: grid.getCellValue(row, col) }).length == 0) {
                                return 'error-isbn';
                            }
                        }
                },
                {
                    name: 'Language2', displayName: 'Language2', editableCellTemplate: 'ui-grid/dropdownEditor', width: '10%',
                    editDropdownValueLabel: 'nameEn', editDropdownRowEntityOptionsArrayPath: 'languages', editDropdownIdLabel: 'nameEn',
                    cellClass:
                        function (grid, row, col, rowRenderIndex, colRenderIndex) {
                            if (grid.getCellValue(row, col) != '' && $filter('filter')(grid.options.data[0].languages, { nameEn: grid.getCellValue(row, col) }).length == 0) {
                                return 'error-isbn';
                            }
                        }
                },
                {
                    name: 'Quantity', displayName: 'Quantity', width: '10%', type: 'number'
                }
            ];
        };

        vm.magazineGridInit = function () {
            vm.magazineOptions = {};
            vm.magazineOptions.columnDefs = [
                { name: 'Title', displayName: 'Title', width: '70%' },
                { name: 'Quantity', displayName: 'Quantity', width: '20%', type: 'number' }
            ];
        };

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

        vm.Init = function () {
            vm.translateFilter = $filter('translate');
            vm.terms = {};
            vm.isHideButton = false;

            vm.uploadPolicyUrl = 'api/Upload/UploadFile?uploadFile=PolicyPath';
            vm.uploadInvoicesUrl = 'api/Upload/UploadFile?uploadFile=InvoicePath';
            vm.uploadCustomDeclarationUrl = 'api/Upload/UploadFile?uploadFile=CustomDeclarationPath';
            vm.uploadExpoProofUrl = 'api/Upload/UploadFile?uploadFile=ExpoProofPath';

            vm.happinessMeterObj = {};
            vm.happinessMeterObj.serviceId = 3;

            // Datepicker
            // -----------------------------------
            // Disable select days > today
            vm.disabled = function (date, mode) {
                var today = new Date();
                return date > today;
            };
            vm.open = function ($event) {
                $event.preventDefault();
                $event.stopPropagation();
                vm.opened = true;
            };
            vm.format = 'dd-MMMM-yyyy';

            if (vm.user.userTypeCode == "07") {
                $http.get($rootScope.app.httpSource + 'api/BeneficiaryType')
                    .then(function (response) {
                        vm.beneficiaryTypes = response.data;
                    });
            }

            $http.get($rootScope.app.httpSource + 'api/Country')
                .then(function (response) {
                    vm.countries = response.data;
                });

            $http.get($rootScope.app.httpSource + 'api/Port')
                .then(function (response) {
                    vm.portOfArrivals = response.data;
                });

            //Items Datatable
            vm.regulateItemsDt = {};
            vm.regulateItemsDt.dtInstance = {};
            vm.regulateItemsDt.serverData = function (sSource, aoData, fnCallback, oSettings) {
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
                    'recordsTotal': vm.mediaMaterial.regulateEntriesItems.length,
                    'recordsFiltered': vm.mediaMaterial.regulateEntriesItems.length,
                    'data': vm.mediaMaterial.regulateEntriesItems
                };

                fnCallback(records);
            };

            vm.regulateItemsDt.actionsHtml = function (data, type, full, meta) {
                var htmlSection = '';

                htmlSection = '<div class="list-icon"><div class="inline" ng-click="mediaControl.regulateItemsDt.edit(\'lg\',' +
                    data.id + ')"><em class="fa fa-pencil" style="cursor:pointer" uib-tooltip="' +
                    vm.translateFilter('general.edit') + '"></em></div><div class="inline" ng-if="!mediaControl.isHideButton" ng-click="mediaControl.regulateItemsDt.delete(' +
                    data.id + ', $event)"><em class="fa fa-trash" style="cursor:pointer" uib-tooltip="' +
                    vm.translateFilter('general.delete') + '"></em></div></div>';

                return htmlSection;
            };

            vm.regulateItemsDt.createdRow = function (row, data, dataIndex) {
                // Recompiling so we can bind Angular directive to the DT
                $compile(angular.element(row).contents())($scope);
            };

            vm.regulateItemsDt.rowCallback = function () { };

            vm.translateFilter = $filter('translate');

            if ($rootScope.language.selected !== 'English') {
                vm.regulateItemsDt.dtOptions = DTOptionsBuilder.newOptions()
                    .withFnServerData(vm.regulateItemsDt.serverData)
                    .withOption('serverSide', true)
                    .withDataProp('data')
                    .withOption('processing', true)
                    .withOption('responsive', true)
                    .withLanguageSource('app/langs/ar.json')
                    .withOption('bFilter', false)
                    .withOption('paging', false)
                    .withOption('info', false)
                    .withOption('createdRow', vm.regulateItemsDt.createdRow)
                    .withOption('rowCallback', vm.regulateItemsDt.rowCallback).withBootstrap();
            }
            else {
                vm.regulateItemsDt.dtOptions = DTOptionsBuilder.newOptions()
                    .withFnServerData(vm.regulateItemsDt.serverData)
                    .withOption('serverSide', true)
                    .withDataProp('data')
                    .withOption('processing', true)
                    .withOption('responsive', true)
                    .withOption('bFilter', false)
                    .withOption('paging', false)
                    .withOption('info', false)
                    .withOption('createdRow', vm.regulateItemsDt.createdRow)
                    .withOption('rowCallback', vm.regulateItemsDt.rowCallback).withBootstrap();
            }

            vm.regulateItemsDt.dtColumns = [
                DTColumnBuilder.newColumn(null).withTitle(vm.translateFilter('mediaMaterial.materialType')).renderWith(
                    function (data, type) {
                        if (vm.user.userTypeCode == "07" && vm.mediaMaterial.beneficiaryTypeId == 2) {
                            return $filter('localizeString')(data.customMaterial.materialType);
                        }
                        else {
                            return $filter('localizeString')(data.materialType);
                        }
                    }),
                DTColumnBuilder.newColumn(null).withTitle(vm.translateFilter('mediaMaterial.hsCode')).renderWith(
                    function (data, type) {
                        if (vm.user.userTypeCode == "07" && vm.mediaMaterial.beneficiaryTypeId == 2)
                            return data.customMaterial.hsCode;
                        else
                            return '';
                    }),
                DTColumnBuilder.newColumn(null).withTitle(vm.translateFilter('mediaMaterial.titleName')).renderWith(
                    function (data, type) {
                        if (data.title != undefined)
                            return data.title;
                        else
                            return '';
                    }),
                DTColumnBuilder.newColumn('language').withTitle(vm.translateFilter('mediaMaterial.language')).renderWith(
                    function (data, type) {
                        if (data != null) {
                            return $filter('localizeString')(data);
                        }
                        else {
                            return null;
                        }
                    }),
                DTColumnBuilder.newColumn('numberOfItems').withTitle(vm.translateFilter('mediaMaterial.numberOfTitles')),
                DTColumnBuilder.newColumn(null)
                    .withTitle(vm.translateFilter('mediaMaterial.weight')).renderWith(
                        function (data, type) {
                            if (data.weight != undefined)
                                return data.weight;
                            else
                                return '';
                        }),
                DTColumnBuilder.newColumn(null).withTitle(vm.translateFilter('general.actions')).notSortable()
                    .renderWith(vm.regulateItemsDt.actionsHtml).withOption('width', '15%')];

            vm.regulateItemsDt.open = function (size) {
                var modalInstance = $uibModal.open({
                    templateUrl: 'app/views/Application/RegulateMediaMaterial/regulateItems/regulateItems.html',
                    controller: 'RegulateItemsController',
                    size: size,
                    resolve: {
                        mediaMaterial: function () {
                            return null;
                        },
                        mediaLicense: function () {
                            if (vm.user.userTypeCode == "07") {
                                return vm.mediaLicenseObj;
                            }
                            else {
                                return null;
                            }
                        },
                        beneficiaryTypeId: function () {
                            if (vm.user.userTypeCode == "07") {
                                return vm.mediaMaterial.beneficiaryTypeId;
                            }
                            else {
                                return null;
                            }
                        }
                    }
                });

                modalInstance.result.then(function (mediaMaterial) {
                    if (vm.mediaMaterial.regulateEntriesItems == undefined) {
                        vm.mediaMaterial.regulateEntriesItems = [];
                    }
                    mediaMaterial.id = vm.mediaMaterial.regulateEntriesItems.length + 1;

                    var materialList = [];
                    if (vm.user.userTypeCode == "07" && vm.mediaMaterial.beneficiaryTypeId == 2) {
                        materialList = vm.mediaMaterial.regulateEntriesItems.filter(customMaterial => customMaterial.materialTypeId == mediaMaterial.customMaterial.materialType.id);
                    }
                    else {
                        materialList = vm.mediaMaterial.regulateEntriesItems.filter(material => material.materialType.id == mediaMaterial.materialType.id);
                    }

                    //To reomve the duplicate entry of material
                    if (materialList.length > 0 && (mediaMaterial.materialType.id == 8 || mediaMaterial.materialType.id == 17 || mediaMaterial.materialType.id == 24)) {
                        SweetAlert.swal(translate('establishment.error'), translate('mediaMaterial.duplicateMaterialEntry'), "error");
                    } else {
                        vm.mediaMaterial.regulateEntriesItems.push(mediaMaterial);

                        if (vm.user.userTypeCode == "07" && vm.mediaMaterial.beneficiaryTypeId == 2) {
                            vm.serviceFeesObj.userTypeId = mediaMaterial.customMaterial.materialType.userTypeId;
                            vm.serviceFeesObj.materialTypeIds.push(mediaMaterial.customMaterial.materialTypeId);
                        }
                        else if (vm.user.userTypeCode == "07" && mediaMaterial.weight > 750 && (mediaMaterial.materialType.id == 8 || mediaMaterial.materialType.id == 17 || mediaMaterial.materialType.id == 24)) {
                            vm.serviceFeesObj.userTypeId = mediaMaterial.materialType.userTypeId;
                            vm.serviceFeesObj.materialTypeIds.push(mediaMaterial.materialType.id);
                        }
                        else if (mediaMaterial.weight > 750 && (mediaMaterial.materialType.id == 8 || mediaMaterial.materialType.id == 17 || mediaMaterial.materialType.id == 24)) {
                            vm.serviceFeesObj.materialTypeIds.push(mediaMaterial.materialType.id);
                        }
                        else {
                            //Generate Magazine Excel File
                            if (mediaMaterial.materialType.id == 14 || mediaMaterial.materialType.id == 21 || mediaMaterial.materialType.id == 28) {
                                vm.serviceFeesObj.materialTypeIds.push(mediaMaterial.materialType.id);
                                $http.get($rootScope.app.httpSource + 'api/RegulateEntry/ExportMagazineExcel', { responseType: 'arraybuffer' })
                                    .then(function (resp) {
                                        var data = new Blob([resp.data], { type: 'application/vnd.ms-excel' });
                                        saveAs(data, "MagazinesList.xlsx");
                                    });
                            }
                            else if (mediaMaterial.materialType.id == 8 || mediaMaterial.materialType.id == 17 || mediaMaterial.materialType.id == 24) {
                            }
                            else {
                                vm.serviceFeesObj.userTypeId = mediaMaterial.materialType.userTypeId;
                                vm.serviceFeesObj.materialTypeIds.push(mediaMaterial.materialType.id);
                            }
                        }
                        vm.serviceFeesObj.reloadTable();
                        vm.regulateItemsDt.dtInstance.rerender();
                        vm.noItems = false;
                    }
                }, function () { });

            };

            vm.regulateItemsDt.edit = function (size, mediaMaterialItemId) {
                var modalInstance = $uibModal.open({
                    templateUrl: 'app/views/Application/RegulateMediaMaterial/regulateItems/regulateItems.html',
                    controller: 'RegulateItemsController',
                    size: size,
                    resolve: {
                        mediaMaterial: function () {
                            return $filter('filter')(vm.mediaMaterial.regulateEntriesItems, { id: mediaMaterialItemId }, true)[0];
                        },
                        mediaLicense: function () {
                            if (vm.user.userTypeCode == "07") {
                                return vm.mediaLicenseObj;
                            }
                            else {
                                return null;
                            }
                        },
                        beneficiaryTypeId: function () {
                            if (vm.user.userTypeCode == "07") {
                                return vm.mediaMaterial.beneficiaryTypeId;
                            }
                            else {
                                return null;
                            }
                        }
                    }
                });

                modalInstance.result.then(function (mediaMaterialItem) {
                    var newMediaMaterialItem = $filter('filter')(vm.mediaMaterial.regulateEntriesItems, { id: mediaMaterialItem.Id }, true)[0];
                    newMediaMaterialItem = mediaMaterialItem;

                    if (vm.user.userTypeCode == "07" && vm.mediaMaterial.beneficiaryTypeId == 2) {
                        vm.serviceFeesObj.userTypeId = mediaMaterialItem.customMaterial.materialType.userTypeId;
                        vm.serviceFeesObj.materialTypeIds.push(mediaMaterialItem.customMaterial.materialTypeId);
                    }
                    else if (vm.user.userTypeCode == "07" && mediaMaterialItem.weight > 750 && (mediaMaterialItem.materialType.id == 8 || mediaMaterialItem.materialType.id == 17 || mediaMaterialItem.materialType.id == 24)) {
                        vm.serviceFeesObj.userTypeId = mediaMaterialItem.materialType.userTypeId;
                        vm.serviceFeesObj.materialTypeIds.push(mediaMaterialItem.materialType.id);
                    }
                    else if (mediaMaterialItem.weight > 750 && (mediaMaterialItem.materialType.id == 8 || mediaMaterialItem.materialType.id == 17 || mediaMaterialItem.materialType.id == 24)) {
                        vm.serviceFeesObj.materialTypeIds.push(mediaMaterialItem.materialType.id);
                    }
                    else {
                        if (mediaMaterialItem.materialType.id == 8 || mediaMaterialItem.materialType.id == 17 || mediaMaterialItem.materialType.id == 24) {
                            for (var i = 0; i < vm.serviceFeesObj.materialTypeIds.length; i++) {
                                if (vm.serviceFeesObj.materialTypeIds[i] == mediaMaterialItem.materialType.id) {
                                    vm.serviceFeesObj.materialTypeIds.splice(i, 1);
                                }
                            }
                        }
                        else {
                            vm.serviceFeesObj.userTypeId = mediaMaterialItem.materialType.userTypeId;
                            vm.serviceFeesObj.materialTypeIds.push(mediaMaterialItem.materialType.id);
                        }
                    }
                    vm.serviceFeesObj.reloadTable();
                    vm.regulateItemsDt.dtInstance.rerender();
                }, function () { });
            };

            vm.regulateItemsDt.delete = function (mediaMaterialItemId, event) {
                var index;
                var tempStore;

                if (mediaMaterialItemId == 0 || mediaMaterialItemId == undefined) {
                    index = vm.regulateItemsDt.dtInstance.DataTable.rows({ order: 'applied' }).nodes().indexOf(event.currentTarget.parentNode.parentNode.parentNode);
                    tempStore = vm.mediaMaterial.regulateEntriesItems[index];
                    vm.mediaMaterial.regulateEntriesItems.splice(index, 1);
                }
                else {
                    index = vm.mediaMaterial.regulateEntriesItems.indexOf($filter('filter')(vm.mediaMaterial.regulateEntriesItems, { id: mediaMaterialItemId }, true)[0]);
                    tempStore = $filter('filter')(vm.mediaMaterial.regulateEntriesItems, { id: mediaMaterialItemId }, true)[0];
                    vm.mediaMaterial.regulateEntriesItems.splice(index, 1);
                }
                var translate = $filter('translate');
                vm.regulateItemsDt.dtInstance.rerender();

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
                            vm.regulateItemsDt.dtInstance.rerender();
                            var getMaterialTypeId = $filter('filter')(vm.serviceFeesObj.materialTypeIds, tempStore.materialType.id, true)[0];
                            var feeIndex = vm.serviceFeesObj.materialTypeIds.indexOf(tempStore.materialType.id);
                            vm.serviceFeesObj.materialTypeIds.splice(feeIndex, 1);
                            vm.serviceFeesObj.reloadTable();
                        } else {
                            vm.mediaMaterial.regulateEntriesItems.splice(index, 0, tempStore);
                            SweetAlert.swal(translate('general.restoreBtn'), translate('general.restoreMessage'), "success");
                            vm.regulateItemsDt.dtInstance.rerender();
                        }
                    });
            };

            vm.gridInit();
            vm.magazineGridInit();
        };
        //New Form Condition
        if ($state.params === undefined || $state.params.id === undefined || $state.params.id === "") {
            vm.editMode = false;
            vm.mediaMaterial = {
                policyNumber: "",
                regulateEntriesItems: [],
                isExpo: false,
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

            if (vm.user.userTypeCode != "01") {
                $http.get($rootScope.app.httpSource + 'api/Establishment/GetById?id=' + $state.params.establishmentId)
                    .then(function (response) {
                        vm.mediaMaterial.applicationDetail.application.establishment = response.data;
                    });
            }
            vm.Init();
        }
        else {
            //Get the details of the submitted Form to edit

            $http.get($rootScope.app.httpSource + 'api/RegulateEntry/GetById?id=' + $state.params.id)
                .then(function (response) {
                    response.data.policyDate = new Date(response.data.policyDate);
                    vm.mediaMaterial = response.data;
                    $state.params.establishmentId = vm.mediaMaterial.applicationDetail.application.establishmentId;
                    vm.editMode = true;
                    vm.serviceFeesObj.isExpo2020 = vm.mediaMaterial.isExpo;

                    if (vm.mediaMaterial.applicationDetail.payments.length > 0) {
                        if (vm.mediaMaterial.regulateEntriesItems.length > 0) {
                            for (var i = 0; i < vm.mediaMaterial.regulateEntriesItems.length; i++) {
                                if (vm.mediaMaterial.regulateEntriesItems[i].weight > 750 && (vm.mediaMaterial.regulateEntriesItems[i].materialType.id == 8 || vm.mediaMaterial.regulateEntriesItems[i].materialType.id == 17 || vm.mediaMaterial.regulateEntriesItems[i].materialType.id == 24)) {
                                    vm.serviceFeesObj.materialTypeIds.push(vm.mediaMaterial.regulateEntriesItems[i].materialType.id);
                                    vm.serviceFeesObj.userTypeId = vm.mediaMaterial.regulateEntriesItems[i].materialType.userTypeId;
                                }
                                else if (vm.user.userTypeCode == "07" && vm.mediaMaterial.beneficiaryTypeId == 2) {
                                    vm.serviceFeesObj.userTypeId = vm.mediaMaterial.regulateEntriesItems[i].customMaterial.materialType.userTypeId;
                                    vm.serviceFeesObj.materialTypeIds.push(vm.mediaMaterial.regulateEntriesItems[i].customMaterial.materialTypeId);
                                }
                                else if (vm.mediaMaterial.regulateEntriesItems[i].materialType != null && (vm.mediaMaterial.regulateEntriesItems[i].materialType.id == 8 || vm.mediaMaterial.regulateEntriesItems[i].materialType.id == 17 || vm.mediaMaterial.regulateEntriesItems[i].materialType.id == 24)) {
                                    vm.serviceFeesObj.materialTypeIds.splice(vm.mediaMaterial.regulateEntriesItems[i].materialType.id, 1);
                                }
                                else {
                                    vm.serviceFeesObj.userTypeId = vm.mediaMaterial.regulateEntriesItems[i].materialType.userTypeId;
                                    vm.serviceFeesObj.materialTypeIds.push(vm.mediaMaterial.regulateEntriesItems[i].materialType.id);
                                }
                            }
                            vm.serviceFeesObj.reloadTable();
                        }
                    }

                    if ((vm.mediaMaterial.applicationDetail.applicationStatusId == 1 || vm.mediaMaterial.applicationDetail.applicationStatusId == 9) && vm.user.userTypeCode != "06" &&
                        vm.mediaMaterial.applicationDetail.actionsTakens.length > 1) {
                        if (vm.mediaMaterial.applicationDetail.actionsTakens[vm.mediaMaterial.applicationDetail.actionsTakens.length - 1].transition.actionId == 18 &&
                            vm.mediaMaterial.applicationDetail.actionsTakens[vm.mediaMaterial.applicationDetail.actionsTakens.length - 1].note != "") {
                            vm.employeeNote = vm.mediaMaterial.applicationDetail.actionsTakens[vm.mediaMaterial.applicationDetail.actionsTakens.length - 1].note;
                            vm.employeeNoteDate = moment(vm.mediaMaterial.applicationDetail.actionsTakens[vm.mediaMaterial.applicationDetail.actionsTakens.length - 1].actionDate).format("dddd, MMMM Do YYYY, h:mm:ss a");
                        }
                    }
                    vm.Init();
                    if (vm.mediaMaterial.applicationDetail.applicationStateId == 6) {
                        vm.isHideButton = true;
                    }
                });
        }

        vm.searchLicense = function () {
            $http.get($rootScope.app.httpSource + 'api/MediaLicense/GetByMediaLicenseNumber?mediaLicenseNumber=' + vm.mediaMaterial.mediaLicenseNumber)
                .then(function (response) {
                    vm.mediaLicenseObj = response.data;
                    if (vm.mediaLicenseObj && (vm.mediaLicenseObj.numberOfComputerProgramsRegulateEntriesApplications > 0 || vm.mediaLicenseObj.numberOfBooksRegulateEntriesApplications > 0 ||
                        vm.mediaLicenseObj.numberOfVideoGamesRegulateEntriesApplications > 0 || vm.mediaLicenseObj.numberOfCinemaRegulateEntriesApplications > 0)) {
                        vm.mediaMaterial.mediaLicenseId = vm.mediaLicenseObj.mediaLicenseId;
                        vm.establishmentLicense = vm.mediaLicenseObj.establishment;
                        vm.notSelected = false;
                    }
                    else {
                        vm.mediaMaterial.mediaLicenseId = null;
                        vm.establishmentLicense = null;
                        vm.notSelected = true;
                    }
                });
        }

        vm.clear = function () {
            vm.mediaMaterial.regulateEntriesItems = [];
            vm.regulateItemsDt.dtInstance.rerender();
            vm.serviceFeesObj.materialTypeIds = [];
            vm.serviceFeesObj.reloadTable();
        };

        vm.save = function (applicationStatusId) {
            if (vm.user.userTypeCode == "07" && vm.mediaMaterial.beneficiaryTypeId == 1 && vm.mediaMaterial.mediaLicenseId == null) {
                vm.notSelected = true;
                return false;
            }
            if (vm.mediaMaterial.regulateEntriesItems.length == 0) {
                vm.noItems = true;
                return false;
            }

            if (vm.gridOptions.data != null) {
                if ($filter('filter')(vm.mediaMaterial.regulateEntriesItems, { materialType: { id: 8 } }, { materialType: { id: 17 } }, { materialType: { id: 24 } }, true).length > 0 && vm.gridOptions.data.length == 0) {
                    vm.noItems = true;
                    return false;
                }
                else if ($filter('filter')(vm.mediaMaterial.regulateEntriesItems, { materialType: { id: 8 } }, { materialType: { id: 17 } }, { materialType: { id: 24 } }, true).length > 0 && vm.gridOptions.data.length > 0) {
                    vm.mediaMaterial.bookList = vm.gridOptions.data;
                }
            }

            if (vm.magazineOptions.data != null) {
                if ($filter('filter')(vm.mediaMaterial.regulateEntriesItems, { materialType: { id: 14 } }, { materialType: { id: 21 } }, { materialType: { id: 28 } }, true).length > 0 && vm.magazineOptions.data.length == 0) {
                    vm.noItems = true;
                    return false;
                }
                else if ($filter('filter')(vm.mediaMaterial.regulateEntriesItems, { materialType: { id: 14 } }, { materialType: { id: 21 } }, { materialType: { id: 28 } }, true).length > 0 && vm.magazineOptions.data.length > 0) {
                    vm.mediaMaterial.newspaperList = vm.magazineOptions.data;
                }
            }

            vm.isBusy = true;
            if (vm.serviceFeesObj.serviceFee.length != 0) {
                vm.mediaMaterial.applicationDetail.payments[0].paymentDetails = vm.serviceFeesObj.serviceFee;
            }
            else {
                vm.mediaMaterial.applicationDetail.payments = null;
            }

            if ($rootScope.app.isPMOHappiness) {
                switch (applicationStatusId) {
                    case 1:
                        $http.post($rootScope.app.httpSource + 'api/RegulateEntry/SaveRegulateEntry', vm.mediaMaterial)
                            .then(function (response) {
                                vm.happinessMeterObj.transactionId = response.data;
                                vm.showHappinessMeter = true;
                            },
                                function (response) { // optional
                                    vm.isBusy = false;
                                });
                        break;

                    case 2:
                        $http.post($rootScope.app.httpSource + 'api/RegulateEntry/SubmitRegulateEntry', vm.mediaMaterial)
                            .then(function (response) {
                                vm.happinessMeterObj.transactionId = response.data;
                                if (vm.serviceFeesObj.serviceFee.length != 0) {
                                    vm.paymentPopup(response.data);
                                }
                                else {
                                    SweetAlert.swal(
                                        {
                                            title: $filter('translate')('general.ok'),
                                            text: $filter('translate')('workflow.materialSubmittedSuccessfully'),
                                            type: "success"
                                        },
                                        function (e) {
                                            vm.showHappinessMeter = true;
                                        });
                                }
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
                    vm.mediaMaterial.applicationDetail.happinessRate = happinessRate;
                    //Post to save
                    switch (applicationStatusId) {
                        case 1:
                            $http.post($rootScope.app.httpSource + 'api/RegulateEntry/SaveRegulateEntry', vm.mediaMaterial)
                                .then(function (response) {
                                    $state.go('app.dashboard');
                                },
                                    function (response) { // optional
                                        vm.isBusy = false;
                                    });
                            break;

                        case 2:
                            $http.post($rootScope.app.httpSource + 'api/RegulateEntry/SubmitRegulateEntry', vm.mediaMaterial)
                                .then(function (response) {
                                    if (vm.serviceFeesObj.serviceFee.length != 0) {
                                        vm.paymentPopup(response.data);
                                    }
                                    else {
                                        SweetAlert.swal(
                                            {
                                                title: $filter('translate')('general.ok'),
                                                text: $filter('translate')('workflow.materialSubmittedSuccessfully'),
                                                type: "success"
                                            },
                                            function (e) {
                                                $state.go('app.dashboard');
                                            });
                                    }
                                },
                                    function (response) { // optional
                                        vm.isBusy = false;
                                        if (response != null) {
                                            if (response.data != null && response.data.exceptionMessage == 'Invalid ISBN') {
                                                SweetAlert.swal(
                                                    {
                                                        title: $filter('translate')('establishment.error'),
                                                        text: $filter('translate')('bookCard.invalidISBN'),
                                                        type: "error"
                                                    }
                                                );
                                            }
                                        }
                                    });
                            break;
                    }
                });
            }
        };

        vm.workflowClick = function (actionId) {
            vm.isBusy = true;
            if (vm.serviceFeesObj.serviceFee.length != 0 && vm.mediaMaterial.applicationDetail.payments.length != 0) {
                if (vm.mediaMaterial.applicationDetail.payments != []) {
                    if (vm.mediaMaterial.applicationDetail.payments[0] != undefined) {
                        //save and apply
                        if (vm.mediaMaterial.applicationDetail.applicationStateId == 1) {
                            if (vm.mediaMaterial.applicationDetail.payments[0].paymentDetails.length != vm.serviceFeesObj.serviceFee.length) {
                                vm.serviceFeesObj_temp = { serviceFee: [] };
                                vm.serviceFeesObj_temp = vm.serviceFeesObj.serviceFee.slice(vm.serviceFeesObj.serviceFee.length - 1);
                                for (var i = 0; i < vm.serviceFeesObj_temp.length; i++) {
                                    vm.mediaMaterial.applicationDetail.payments[0].paymentDetails.push(vm.serviceFeesObj_temp[i]);
                                }
                            }
                        }
                        //sendback to customer
                        if (vm.mediaMaterial.applicationDetail.applicationStateId == 6) {
                            if (vm.mediaMaterial.applicationDetail.payments[0].paymentDetails.length != vm.serviceFeesObj.serviceFee.length) {
                                vm.paymentDetails = {};
                                vm.mediaMaterial.applicationDetail.payments.push(vm.paymentDetails);
                                vm.mediaMaterial.applicationDetail.payments[0].paymentDetails = vm.serviceFeesObj.serviceFee;
                            }
                        }
                    }
                }
            }
            else if (vm.serviceFeesObj.serviceFee.length != 0 && vm.mediaMaterial.applicationDetail.payments.length == 0) {
                vm.paymentDetails = {};
                vm.mediaMaterial.applicationDetail.payments.push(vm.paymentDetails);
                vm.mediaMaterial.applicationDetail.payments[0].paymentDetails = vm.serviceFeesObj.serviceFee;
            }
            else {
                vm.mediaMaterial.applicationDetail.payments = null;
            }
            switch (actionId) {
                case 12:
                    $http.post($rootScope.app.httpSource + 'api/RegulateEntry/UpdateRegulateEntry', vm.mediaMaterial)
                        .then(function (response) {
                            $state.go('app.dashboard');
                        },
                            function (response) { // optional
                                vm.isBusy = false;
                            });
                    break;

                case 13:
                    $http.post($rootScope.app.httpSource + 'api/RegulateEntry/SubmitUpdateRegulateEntry', vm.mediaMaterial)
                        .then(function (response) {
                            if (vm.serviceFeesObj.serviceFee.length == 0 || vm.mediaMaterial.applicationDetail.payments[0].paymentStatusId == 3) {
                                $state.go('app.dashboard');
                            }
                            else {
                                vm.paymentPopup(vm.mediaMaterial.applicationDetail.id);
                            }
                        },
                            function (response) { // optional
                                vm.isBusy = false;
                            });
                    break;
            }
        };

        vm.paymentPopup = function (applicationDetailId) {
            SweetAlert.swal({
                title: $filter('translate')('payment.applicationSubmittedSuccessfully'),
                text: $filter('translate')('payment.proceed'),
                type: "warning",
                showCancelButton: true,
                confirmButtonColor: "#DD6B55",
                confirmButtonText: $filter('translate')('payment.payNow'),
                cancelButtonText: $filter('translate')('payment.payLater'),
                closeOnConfirm: true,
                closeOnCancel: true
            }, function (isConfirm) {
                if (isConfirm) {
                    var modalInstance = $uibModal.open({
                        templateUrl: 'app/views/Payment/transactionRequest/transactionRequest.html',
                        controller: 'TransactionRequestController',
                        size: 'lg',
                        keyboard: false,
                        backdrop: 'static',
                        resolve: {
                            applicationDetailId: applicationDetailId,
                            isRenew: function () { return false; }
                        }
                    });
                    modalInstance.result.then(function (action) {
                    });
                }
                else {
                    if ($rootScope.app.isPMOHappiness) {
                        vm.showHappinessMeter = true;
                    }
                    else {
                        $state.go('app.dashboard');
                    }
                }
            });
        };
    }

    RegulateMediaMaterialController.$inject = ['$rootScope', '$scope', '$http', '$state', '$stateParams', '$uibModal', 'UserProfile', 'SweetAlert', 'browser', '$filter', 'DTOptionsBuilder',
        'DTColumnBuilder', '$compile'];

})();