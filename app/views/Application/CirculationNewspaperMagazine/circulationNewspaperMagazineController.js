/**=========================================================
 * Module: LoginController.js
 * Controller for the Chat APP 
 =========================================================*/

(function () {
    'use strict';

    angular
        .module('eServices')
        .controller('CirculationNewspaperMagazineController', CirculationNewspaperMagazineController);

    function CirculationNewspaperMagazineController($rootScope, $scope, $http, $stateParams, $state, $uibModal, UserProfile, SweetAlert, browser, $filter, DTOptionsBuilder, DTColumnBuilder, $compile) {
        var vm = this;
        vm.serviceFeesObj = { serviceId: 11, serviceFee: [], isFreeCirculation: false };
        vm.onlyUAE = false;
        vm.categories = [];

        vm.Init = function () {
            vm.terms = {};
            vm.user = UserProfile.getProfile();
            vm.happinessMeterObj = {};
            vm.happinessMeterObj.serviceId = 11;

            // -----------------------------------
            // File Uploading Handlers
            // -----------------------------------
            vm.uploadCopyrightsCopyUrl = 'api/Upload/UploadFile?uploadFile=CopyrightsPath';

            $http.get($rootScope.app.httpSource + 'api/country')
                .then(function (response) {
                    vm.countries = response.data;
                });

            $http.get($rootScope.app.httpSource + 'api/PeriodicalType')
                .then(function (response) {
                    vm.filteredPeriodicalTypes = response.data;
                    vm.allPerodicalTypes = response.data;
                });

            $http.get($rootScope.app.httpSource + 'api/Language')
                .then(function (response) {
                    vm.languages = response.data;
                });

            $http.get($rootScope.app.httpSource + 'api/Emirate')
                .then(function (response) {
                    vm.emirates = response.data;
                });

            $http.get($rootScope.app.httpSource + 'api/NewspaperCategory')
                .then(function (response) {
                    vm.categories = response.data;
                });

            // -----------------------------------
            // Date Of Birth Datepicker
            // -----------------------------------
            // Disable select days < today
            $scope.toggleMin = function () {
                $scope.minDate = $scope.minDate ? null : new Date();
            };
            $scope.toggleMin();

            $scope.startopen = function ($event) {
                $event.preventDefault();
                $event.stopPropagation();

                $scope.startopened = true;
            };

            $scope.startdateOptions = {
                startingDay: 1
            };

            $scope.startformats = ['dd-MMMM-yyyy', 'yyyy/MM/dd', 'dd.MM.yyyy', 'shortDate'];
            $scope.startformat = $scope.startformats[0];
            // -----------------------------------
            // Date Of Birth Datepicker
            // -----------------------------------
            // Disable select days < start date
            $scope.enddisabled = function (date, mode) {
                return date < vm.CirculationNewspaper.copyrightsStartDate;
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

            //Items Datatable
            vm.languageItemsDt = {};
            vm.languageItemsDt.dtInstance = {};
            vm.languageItemsDt.serverData = function (sSource, aoData, fnCallback, oSettings) {
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
                    'recordsTotal': vm.CirculationNewspaper.newspaper.newspaperLanguages.length,
                    'recordsFiltered': vm.CirculationNewspaper.newspaper.newspaperLanguages.length,
                    'data': vm.CirculationNewspaper.newspaper.newspaperLanguages
                };

                fnCallback(records);
            };

            vm.languageItemsDt.actionsHtml = function (data, type, full, meta) {
                var htmlSection = '';

                htmlSection = '<div class="list-icon"><div class="inline" ng-click="circulationCtl.languageItemsDt.edit(\'lg\',' +
                    data.id + ')"><em class="fa fa-pencil" style="cursor:pointer" uib-tooltip="' +
                    vm.translateFilter('general.edit') + '"></em></div><div class="inline" ng-click="circulationCtl.languageItemsDt.delete(' +
                    data.id + ', $event)"><em class="fa fa-trash" style="cursor:pointer" uib-tooltip="' +
                    vm.translateFilter('general.delete') + '"></em></div></div>';

                return htmlSection;
            };

            vm.languageItemsDt.createdRow = function (row, data, dataIndex) {
                // Recompiling so we can bind Angular directive to the DT
                $compile(angular.element(row).contents())($scope);
            }

            vm.languageItemsDt.rowCallback = function () { };

            vm.translateFilter = $filter('translate');

            if ($rootScope.language.selected !== 'English') {
                vm.languageItemsDt.dtOptions = DTOptionsBuilder.newOptions()
                    .withFnServerData(vm.languageItemsDt.serverData)
                    .withOption('serverSide', true)
                    .withDataProp('data')
                    .withOption('processing', true)
                    .withOption('responsive', true)
                    .withLanguageSource('app/langs/ar.json')
                    .withOption('bFilter', false)
                    .withOption('paging', false)
                    .withOption('info', false)
                    .withOption('createdRow', vm.languageItemsDt.createdRow)
                    .withOption('rowCallback', vm.languageItemsDt.rowCallback).withBootstrap();
            }
            else {
                vm.languageItemsDt.dtOptions = DTOptionsBuilder.newOptions()
                    .withFnServerData(vm.languageItemsDt.serverData)
                    .withOption('serverSide', true)
                    .withDataProp('data')
                    .withOption('processing', true)
                    .withOption('responsive', true)
                    .withOption('bFilter', false)
                    .withOption('paging', false)
                    .withOption('info', false)
                    .withOption('createdRow', vm.languageItemsDt.createdRow)
                    .withOption('rowCallback', vm.languageItemsDt.rowCallback).withBootstrap();
            }

            vm.languageItemsDt.dtColumns = [
                DTColumnBuilder.newColumn('language').withTitle(vm.translateFilter('mediaMaterial.language')).renderWith(
                    function (data, type) {
                        return $filter('localizeString')(data);
                    }),
                DTColumnBuilder.newColumn('name').withTitle(vm.translateFilter('newspaper.suggestedName')),
                DTColumnBuilder.newColumn(null).withTitle(vm.translateFilter('general.actions')).notSortable()
                    .renderWith(vm.languageItemsDt.actionsHtml).withOption('width', '15%')];

            vm.languageItemsDt.open = function (size) {

                var modalInstance = $uibModal.open({
                    templateUrl: 'app/views/Application/newspaperMagazineLicense/languageItems/languageItems.html',
                    controller: 'LanguageItemsController',
                    size: size,
                    resolve: {
                        newspaperLanguage: function () {
                            return null;
                        }
                    }
                });

                modalInstance.result.then(function (newspaperLanguage) {
                    if (vm.CirculationNewspaper.newspaper.newspaperLanguages == undefined) {
                        vm.CirculationNewspaper.newspaper.newspaperLanguages = [];
                    }
                    newspaperLanguage.id = vm.CirculationNewspaper.newspaper.newspaperLanguages.length + 1;
                    vm.CirculationNewspaper.newspaper.newspaperLanguages.push(newspaperLanguage);
                    vm.serviceFeesObj.numberOfLanguages = vm.CirculationNewspaper.newspaper.newspaperLanguages.length;
                    vm.serviceFeesObj.reloadTable();

                    vm.languageItemsDt.dtInstance.rerender();

                }, function () { });
            };

            vm.languageItemsDt.edit = function (size, newspaperLanguageId) {
                var modalInstance = $uibModal.open({
                    templateUrl: 'app/views/Application/newspaperMagazineLicense/languageItems/languageItems.html',
                    controller: 'LanguageItemsController',
                    size: size,
                    resolve: {
                        newspaperLanguage: function () {
                            return $filter('filter')(vm.CirculationNewspaper.newspaper.newspaperLanguages, { id: newspaperLanguageId }, true)[0];
                        }
                    }
                });

                modalInstance.result.then(function (newspaperLanguage) {
                    var newMediaMaterialItem = $filter('filter')(vm.CirculationNewspaper.newspaper.newspaperLanguages, { id: newspaperLanguage.Id }, true)[0];
                    newMediaMaterialItem = newspaperLanguage;
                    vm.languageItemsDt.dtInstance.rerender();
                }, function () { });
            };

            vm.languageItemsDt.delete = function (newspaperLanguageId, event) {
                var index;
                var tempStore;

                if (newspaperLanguageId == 0 || newspaperLanguageId == undefined) {
                    index = vm.languageItemsDt.dtInstance.DataTable.rows({ order: 'applied' }).nodes().indexOf(event.currentTarget.parentNode.parentNode.parentNode);
                    tempStore = vm.CirculationNewspaper.newspaper.newspaperLanguages[index];
                    vm.CirculationNewspaper.newspaper.newspaperLanguages.splice(index, 1);
                }
                else {
                    index = vm.CirculationNewspaper.newspaper.newspaperLanguages.indexOf($filter('filter')(vm.CirculationNewspaper.newspaper.newspaperLanguages, { id: newspaperLanguageId }, true)[0]);
                    tempStore = $filter('filter')(vm.CirculationNewspaper.newspaper.newspaperLanguages, { id: newspaperLanguageId }, true)[0];
                    vm.CirculationNewspaper.newspaper.newspaperLanguages.splice(index, 1);
                }
                var translate = $filter('translate');
                vm.languageItemsDt.dtInstance.rerender();

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
                            vm.serviceFeesObj.numberOfLanguages = vm.CirculationNewspaper.newspaper.newspaperLanguages.length;
                            vm.serviceFeesObj.reloadTable();
                            SweetAlert.swal(translate('general.confirmDeleteBtn'), translate('general.deleteMessage'), "error");
                            vm.languageItemsDt.dtInstance.rerender();
                        } else {
                            vm.CirculationNewspaper.newspaper.newspaperLanguages.splice(index, 0, tempStore);
                            SweetAlert.swal(translate('general.restoreBtn'), translate('general.restoreMessage'), "success");
                            vm.languageItemsDt.dtInstance.rerender();
                        }
                    });
            };

            $scope.$watch('circulationCtl.CirculationNewspaper.newspaper.isMagazine', function (newVal, oldVal) {
                if (newVal != undefined) {
                    vm.serviceFeesObj.isMagazine = newVal;

                    if (newVal) {
                        vm.filteredPeriodicalTypes = [];
                        vm.filteredPeriodicalTypes.push(vm.allPerodicalTypes[1]);
                        vm.filteredPeriodicalTypes.push(vm.allPerodicalTypes[2]);
                        vm.filteredPeriodicalTypes.push(vm.allPerodicalTypes[3]);
                        vm.filteredPeriodicalTypes.push(vm.allPerodicalTypes[4]);
                        vm.filteredPeriodicalTypes.push(vm.allPerodicalTypes[5]);
                    }
                    else {
                        vm.filteredPeriodicalTypes = [];
                        vm.filteredPeriodicalTypes.push(vm.allPerodicalTypes[0]);
                        vm.filteredPeriodicalTypes.push(vm.allPerodicalTypes[1]);
                    }

                    if (newVal != oldVal && oldVal != undefined)
                        vm.CirculationNewspaper.newspaper.periodicalType = null;

                    vm.serviceFeesObj.reloadTable();
                }
            });

            $scope.$watch('circulationCtl.CirculationNewspaper.newspaper.newspaperSubjectCategories', function (newVal, oldVal) {
                if (newVal != undefined && newVal.length > 0) {
                    var freeApp = false;
                    for (var i = 0; i < newVal.length; i++) {
                        if (newVal[i].newspaperCategory.isFree) {
                            freeApp = true;
                            break;
                        }
                    }

                    if (freeApp)
                        vm.serviceFeesObj.isFreeCirculation = true;
                    else
                        vm.serviceFeesObj.isFreeCirculation = false;

                    if (vm.serviceFeesObj.reloadTable)
                        vm.serviceFeesObj.reloadTable();
                }
            });

            $scope.$watch('circulationCtl.CirculationNewspaper.numberOfCopies', function (newVal, oldVal) {
                if (newVal != undefined) {

                    var freeApp = false;
                    if (vm.CirculationNewspaper.newspaper.selectedCategories != null && vm.CirculationNewspaper.newspaper.selectedCategories.length > 0) {
                        for (var i = 0; i < vm.CirculationNewspaper.newspaper.selectedCategories.length; i++) {
                            if (vm.CirculationNewspaper.newspaper.selectedCategories[i].isFree) {
                                freeApp = true;
                                break;
                            }
                        }
                    }

                    if (newVal <= 300 || freeApp)
                        vm.serviceFeesObj.isFreeCirculation = true;
                    else
                        vm.serviceFeesObj.isFreeCirculation = false;

                    if (vm.serviceFeesObj.reloadTable)
                        vm.serviceFeesObj.reloadTable();
                }
            });

            $http.get($rootScope.app.httpSource + 'api/Newspaper/GetByUser')
                .then(function (response) {
                    vm.newspapers = response.data;

                    if (vm.newspapers) {
                        for (var i = 0; i < vm.newspapers.length; i++) {
                            vm.newspapers[i].name = vm.newspapers[i].newspaperLanguages[0].name;
                        }
                    }
                });

            $scope.$watch('circulationCtl.CirculationNewspaper.newspaper.periodicalType', function (newVal, oldVal) {
                if (newVal != undefined) {
                    vm.serviceFeesObj.periodicalTypeId = newVal.id;
                    vm.serviceFeesObj.mediaMaterialTypeId = (vm.CirculationNewspaper.newspaper.isMagazine ? 8 : 7);

                    if (vm.serviceFeesObj.reloadTable)
                        vm.serviceFeesObj.reloadTable();
                }
            });
        };

        //New Form Condition
        if ($state.params === undefined || $state.params.id === undefined || $state.params.id === "") {
            // New Permit
            vm.editMode = 0;
            vm.CirculationNewspaper = {
                title: "",
                localDistributor: "",
                distributionScope: "",
                newspaper: {
                    Name: "",
                    periodicalType: {},
                    newspaperLanguages: [],
                    numberOfCopies: "",
                    itemPrice: "",
                    subscriptionFees: "",
                    selectedCategories: null,
                    licenseCopyUrlId: vm.licenseCopyUrlId,
                    tenancyContractCopyId: vm.tenancyContractCopyId,
                    address: {}
                },
            };
            vm.CirculationNewspaper.applicationDetail = {
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
                application: { serviceId: 11 }
            };

            $http.get($rootScope.app.httpSource + 'api/Establishment/GetById?id=' + $state.params.establishmentId)
                .then(function (response) {
                    vm.CirculationNewspaper.applicationDetail.application.establishment = response.data;
                });

            vm.Init();
        }
        else {
            //Get the details of the submitted Form to edit
            $http.get($rootScope.app.httpSource + 'api/CirculationMediaMaterial/GetById?id=' + $state.params.id)
                .then(function (response) {
                    vm.CirculationNewspaper = response.data;

                    if (response.data.applicationDetail.payments && response.data.applicationDetail.payments[0].paymentStatusId == 3) {
                        vm.editMode = 2;
                    }
                    else {
                        vm.editMode = 1;
                    }

                    vm.Init();
                });
        }

        //Save the details to the server
        vm.save = function (applicationStatusId) {
            vm.isBusy = true;
            vm.CirculationNewspaper.applicationDetail.payments[0].paymentDetails = vm.serviceFeesObj.serviceFee;

            if ($rootScope.app.isPMOHappiness) {
                switch (applicationStatusId) {
                    case 1:
                        $http.post($rootScope.app.httpSource + 'api/CirculationMediaMaterial/SaveCirculationMediaMaterial', vm.CirculationNewspaper)
                            .then(function (response) {
                                vm.isBusy = false;
                                vm.happinessMeterObj.transactionId = response.data;
                                vm.showHappinessMeter = true;
                            },
                                function (response) { // optional
                                    vm.isBusy = false;
                                });
                        break;

                    case 2:
                        $http.post($rootScope.app.httpSource + 'api/CirculationMediaMaterial/SubmitCirculationMediaMaterial', vm.CirculationNewspaper)
                            .then(function (response) {
                                vm.isBusy = false;
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
                    vm.CirculationNewspaper.applicationDetail.happinessRate = happinessRate;
                    //Post to save
                    switch (applicationStatusId) {
                        case 1:
                            $http.post($rootScope.app.httpSource + 'api/CirculationMediaMaterial/SaveCirculationMediaMaterial', vm.CirculationNewspaper)
                                .then(function (response) {
                                    vm.isBusy = false;
                                    $state.go('app.dashboard');
                                },
                                    function (response) { // optional
                                        vm.isBusy = false;
                                    });
                            break;

                        case 2:
                            $http.post($rootScope.app.httpSource + 'api/CirculationMediaMaterial/SubmitCirculationMediaMaterial', vm.CirculationNewspaper)
                                .then(function (response) {
                                    vm.isBusy = false;
                                    //vm.paymentPopup(response.data);
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
                case 12:
                    $http.post($rootScope.app.httpSource + 'api/CirculationMediaMaterial/UpdateCirculationMediaMaterial', vm.CirculationNewspaper)
                        .then(function (response) {
                            $state.go('app.dashboard');
                        },
                            function (response) { // optional
                                vm.isBusy = false;
                            });
                    break;

                case 13:
                    $http.post($rootScope.app.httpSource + 'api/CirculationMediaMaterial/SubmitUpdateCirculationMediaMaterial', vm.CirculationNewspaper)
                        .then(function (response) {
                            vm.paymentPopup(vm.CirculationNewspaper.applicationDetail.id);
                        },
                            function (response) { // optional
                                vm.isBusy = false;
                            });
                    break;
            }

        }

        vm.searchLicense = function () {
            $http.get($rootScope.app.httpSource + 'api/Newspaper/GetByMediaLicenseNumber?mediaLicenseNumber=' + vm.CirculationNewspaper.mediaLicenseNumber)
                .then(function (response) {
                    vm.CirculationNewspaper.newspaper = response.data[0];
                    vm.CirculationNewspaper.newspaper.selectedCategories = [];
                    for (var i = 0; i < vm.CirculationNewspaper.newspaper.newspaperSubjectCategories.length; i++) {
                        vm.CirculationNewspaper.newspaper.selectedCategories.push(vm.CirculationNewspaper.newspaper.newspaperSubjectCategories[i].newspaperCategory);
                    }

                });
        }

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
                } else {
                    $state.go('app.dashboard');
                }
            });
        }
    }
    CirculationNewspaperMagazineController.$inject = ['$rootScope', '$scope', '$http', '$stateParams', '$state', '$uibModal', 'UserProfile', 'SweetAlert', 'browser', '$filter',
        'DTOptionsBuilder', 'DTColumnBuilder', '$compile'];

})();