(function () {
    'use strict';

    angular
        .module('eServices')
        .controller('EstablishmentsController', EstablishmentsController);

    EstablishmentsController.$inject = ['$rootScope', '$scope', '$http', '$timeout', '$uibModal', 'SweetAlert', 'UserProfile', '$filter', '$compile', '$window'];

    function EstablishmentsController($rootScope, $scope, $http, $timeout, $uibModal, SweetAlert, UserProfile, $filter, $compile, $window) {
        var vm = this;

        // Initialize variables
        vm.user = UserProfile.getProfile();
        vm.pageIndex = 0;
        vm.pageSize = 10;
        vm.totalPages = 0;
        vm.entries = [5, 10, 20, 30, 50];
        vm.selectedEntries = vm.entries[1];
        vm.searchText = '';
        vm.establishments = [];
        vm.emirates = [];
        vm.communities = [];
        var searchTimeout;
        vm.filterParams = {}; // Filter params to store filter conditions
        
        // Set up translation filter
        vm.translateFilter = $filter('translate');
        vm.language = $rootScope.language.selected; // Assuming this holds current language ('en' or 'ar')

        vm.isObjectEmpty = function (card) {
            return card ? Object.keys(card).length === 0 : true;
        };

        // Loader function
        function loader() {
            var htmlSectionLoader = '<div class="sk-cube-grid" style="position:fixed; top: 25%; right:47%; z-index:9999">' +
                '<div class="sk-cube sk-cube1"></div>' +
                '<div class="sk-cube sk-cube2"></div>' +
                '<div class="sk-cube sk-cube3"></div>' +
                '<div class="sk-cube sk-cube4"></div>' +
                '<div class="sk-cube sk-cube5"></div>' +
                '<div class="sk-cube sk-cube6"></div>' +
                '<div class="sk-cube sk-cube7"></div>' +
                '<div class="sk-cube sk-cube8"></div>' +
                '<div class="sk-cube sk-cube9"></div>' +
                '</div>';
            angular.element('body').append($compile(htmlSectionLoader)($scope));
        }

        function removeLoader() {
            angular.element('.sk-cube-grid').remove();
        }

        // Fetch emirates and communities for translation
        $http.get($rootScope.app.httpSource + 'api/Emirate')
            .then(function (response) {
                vm.emirates = response.data;
            }, function (error) {
                console.error('Error fetching emirates', error);
            });

        $http.get($rootScope.app.httpSource + 'api/Community/GetCommunities')
            .then(function (response) {
                vm.communities = response.data;
            }, function (error) {
                console.error('Error fetching communities', error);
            });

        // Function to get translated establishment name
        vm.getEstablishmentName = function (establishment) {
            return vm.language === 'ar' ? establishment.nameAr : establishment.nameEn;
        };

        // Function to get translated emirate name
        vm.getTranslatedEmirate = function (emirateId) {
            var emirate = $filter('filter')(vm.emirates, { id: emirateId }, true)[0];
            return emirate ? (vm.language === 'ar' ? emirate.nameAr : emirate.nameEn) : '';
        };

        // Function to get translated community name
        vm.getTranslatedCommunity = function (communityId) {
            var community = $filter('filter')(vm.communities, { id: communityId }, true)[0];
            return community ? (vm.language === 'ar' ? community.nameAr : community.nameEn) : '';
        };

        // Load establishments for the table with loader implementation
        vm.loadTaskGroups = function () {
            loader(); // Show loader

            var params = {
                page: vm.pageIndex + 1,
                pageSize: vm.selectedEntries,
                searchtext: vm.searchText || null,
                filterParams: vm.filterParams // Include filter parameters if applied
            };

            $http.post($rootScope.app.httpSource + 'api/Establishment/GetEstablishments', params)
                .then(function (response) {
                    vm.establishments = response.data.content;
                    var totalRecords = response.data.totalRecords || 0;
                    vm.totalPages = totalRecords > 0 ? Math.ceil(totalRecords / vm.selectedEntries) : 1;
                    removeLoader(); // Remove loader
                }, function (error) {
                    console.error('Error loading establishments', error);
                    removeLoader(); // Remove loader in case of error
                });
        };

        // Apply filters
        vm.applyFilters = function () {
            console.log("Applying filters: ", vm.filterParams);
            vm.pageIndex = 0;  // Reset to the first page when filters are applied
            vm.loadTaskGroups();  // Reload the establishments with applied filters
             angular.element('#filterModal').modal('hide');
        };

        vm.removeFilter = function () {
            vm.filterParams = {};
            vm.loadTaskGroups();  // Reload the establishments with applied filters
             angular.element('#filterModal').modal('hide');
        }
        vm.open = function (size) {
            var modalInstance = $uibModal.open({
                templateUrl: 'app/views/Inspection/establishments/AddEstablishment/addEstablishmnet.html',
                controller: 'AddEstablishmentController',
                size: size,
                resolve: {
                    emirates: function () {
                        return vm.emirates;
                    },
                    communities: function () {
                        return vm.communities;
                    },
                    establishment: function () {
                        return null;
                    },
                    userType: function () {
                        return vm.userProfile.userType;
                    }
                }
            });

            modalInstance.result.then(function (establishmentBranch) {
                vm.insertEstablishment(establishmentBranch);
            },
                function () {
                });
        };

        ///Insert Establishment
        vm.insertEstablishment = function (establishmentBranch) {
            $http.post($rootScope.app.httpSource + 'api/Establishment/SaveEstablishment', inputRequest(establishmentBranch))
                .then(function (response) {
                    var translate = $filter('translate');
                    if (response.data == true) {
                        SweetAlert.swal(translate('establishment.success'), translate('establishment.dataAdded'), "success");
                        vm.loadTaskGroups();
                    }
                    else {
                        SweetAlert.swal(translate('establishment.error'), translate('establishment.alreadyExist'), "error");
                    }
                },
                    function (error) {
                    });
        };

        function inputRequest(establishmentBranch) {
            return {
                "address": {
                    "communityId": establishmentBranch.address.community.id,
                    "phoneNumber": establishmentBranch.address.phoneNumber,
                    "street": establishmentBranch.address.street,
                    "longitude": establishmentBranch.address.longitude,
                    "latitude": establishmentBranch.address.latitude
                },
                "nameEn": establishmentBranch.nameEn,
                "licenseCopyUrl": establishmentBranch.licenseCopyUrl,
                "licenseNumber": establishmentBranch.licenseNumber,
                "AuthorityId": establishmentBranch.authority.id,
                "memorandumOfAssociationCopyUrl": establishmentBranch.memorandumOfAssociationCopyUrl,
                "powerOfAttorneyCopyUrl": establishmentBranch.powerOfAttorneyCopyUrl,
                "statementCopyUrl": establishmentBranch.statementCopyUrl,
                "tenancyContractCopyUrl": establishmentBranch.tenancyContractCopyUrl,
                "tenancyContractEndDate": moment(establishmentBranch.tenancyContractEndDate).format('YYYY-MM-DD')
            }
        }

        // Pagination control functions
        vm.previousPage = function () {
            if (vm.pageIndex > 0) {
                vm.pageIndex--;
                vm.loadTaskGroups();
            }
        };

        vm.nextPage = function () {
            if (vm.pageIndex < vm.totalPages - 1) {
                vm.pageIndex++;
                vm.loadTaskGroups();
            }
        };

        vm.goToPage = function (pageIndex) {
            if (pageIndex >= 0 && pageIndex < vm.totalPages) {
                vm.pageIndex = pageIndex;
                vm.loadTaskGroups();
            }
        };

        vm.getPageRange = function () {
            var start = Math.max(0, vm.pageIndex - Math.floor(5 / 2));
            var end = Math.min(vm.totalPages, start + 5);
            start = Math.max(0, end - 5);
            return Array.from({ length: end - start }, (_, i) => start + i);
        };

        // Search functionality with debounce
        vm.filterData = function () {
            if (searchTimeout) {
                $timeout.cancel(searchTimeout);
            }
            searchTimeout = $timeout(function () {
                vm.pageIndex = 0;
                vm.loadTaskGroups();
            }, 2000);  // 2 seconds debounce time
        };

        // Initial load
        vm.loadTaskGroups();
    }
})();




/**=========================================================
 * Module: DashboardController.js
 =========================================================*/

// (function () {
//     'use strict';

//     angular
//         .module('eServices')
//         .controller('EstablishmentsController', EstablishmentsController);

//     EstablishmentsController.$inject = ['$rootScope', '$scope', '$http', '$stateParams', '$state', 'UserProfile', 'DTOptionsBuilder', 'DTColumnBuilder', '$compile', '$filter', '$uibModal',
//         'SweetAlert', '$timeout', 'FileUploader', '$window'];

//     function EstablishmentsController($rootScope, $scope, $http, $stateParams, $state, UserProfile, DTOptionsBuilder, DTColumnBuilder, $compile, $filter, $uibModal,
//         SweetAlert, $timeout, FileUploader, $window) {
//         var vm = this;
//         vm.user = UserProfile.getProfile();
//         vm.userProfile = {};
//         vm.dtApplicationInstance = {};
//         vm.translateFilter = $filter('translate');

//         vm.exportExcel = function () {

//             $http.post($rootScope.app.httpSource + 'api/Establishment/ExportExcel', vm.params, { responseType: 'arraybuffer' })
//                 .then(function (resp) {
//                     var data = new Blob([resp.data], { type: 'application/vnd.ms-excel' });
//                     saveAs(data, "Establishments.xlsx");
//                 },
//                 function (response) {
//                 });
//         };
//         vm.exportPDF = function () {
//             $http.post($rootScope.app.httpSource + 'api/Establishment/ExportToPdf', vm.params, { responseType: 'arraybuffer' })
//                 .then(function (resp) {
//                     var data = new Blob([resp.data], { type: 'application/pdf' });
//                     saveAs(data, "Establishments.pdf");
//                 },
//                 function (response) {
//                 });
//         };
//         vm.exportCSV = function () {
//             $http.post($rootScope.app.httpSource + 'api/Establishment/ExportCSV', vm.params)
//                 .then(function (resp) {
//                     var myBlob = new Blob([resp.data], { type: 'text/html' });
//                     var url = window.URL.createObjectURL(myBlob);
//                     var a = document.createElement("a");
//                     document.body.appendChild(a);
//                     a.href = url;
//                     a.download = "Establishments.csv";
//                     a.click();
//                     window.URL.revokeObjectURL(url);
//                 },
//                 function (response) {
//                 });
//         };

//         ///To get Emirates
//         $http.get($rootScope.app.httpSource + 'api/Emirate')
//             .then(function (response) {
//                 vm.emirates = response.data;
//             }, function (response) { });

//         if ($rootScope.language.selected !== 'English') {
//             vm.dtApplicationOptions = DTOptionsBuilder.newOptions()
//                 .withFnServerData(serverData)
//                 .withOption('serverSide', true)
//                 .withDataProp('data')
//                 .withOption('processing', true)
//                 .withOption('searchDelay', 2000)
//                 .withOption('aaSorting', [[1, 'desc']])
//                 .withOption('stateSave', true)
//                 .withOption('stateSaveCallback', function (settings, data) {
//                     localStorage.setItem('DataTables_' + settings.sInstance, JSON.stringify(data));
//                 })
//                 .withOption('stateLoadCallback', function (settings) {
//                     return JSON.parse(localStorage.getItem('DataTables_' + settings.sInstance))
//                 })
//                 .withOption('responsive', {
//                     details: {
//                         renderer: renderer,
//                     }
//                 })
//                 .withPaginationType('full_numbers')
//                 .withDisplayLength(10)
//                 .withLanguageSource('app/langs/ar.json')
//                 .withOption('createdRow', createdRow)
//                 .withOption('initComplete', function (settings, data) {
//                     $compile(angular.element('#' + settings.sTableId).contents())($scope);
//                 })
//                 .withOption('fnDrawCallback', function (settings, data) {
//                     $compile(angular.element('#' + settings.sTableId).contents())($scope);
//                 })
//                 .withOption('rowCallback', rowCallback).withBootstrap().withBootstrapOptions({
//                     TableTools: {
//                         classes: {
//                             container: 'btn-group',
//                             buttons: {
//                                 normal: 'btn btn-danger'
//                             }
//                         }
//                     },
//                     pagination: {
//                         classes: {
//                             ul: 'pagination pagination-sm'
//                         }
//                     }
//                 });
//         }
//         else {
//             vm.dtApplicationOptions = DTOptionsBuilder.newOptions()
//                 .withFnServerData(serverData)
//                 .withOption('serverSide', true)
//                 .withDataProp('data')
//                 .withOption('searchDelay', 2000)
//                 .withOption('processing', true)
//                 .withOption('aaSorting', [[1, 'desc']])
//                 .withOption('stateSave', true)
//                 .withOption('stateSaveCallback', function (settings, data) {
//                     localStorage.setItem('DataTables_' + settings.sInstance, JSON.stringify(data));
//                 })
//                 .withOption('stateLoadCallback', function (settings) {
//                     return JSON.parse(localStorage.getItem('DataTables_' + settings.sInstance))
//                 })
//                 .withOption('responsive', {
//                     details: {
//                         renderer: renderer
//                     }
//                 })
//                 .withPaginationType('full_numbers')
//                 .withDisplayLength(10)
//                 .withLanguageSource('app/langs/en.json')
//                 .withOption('createdRow', createdRow)
//                 .withOption('initComplete', function (settings, data) {
//                     $compile(angular.element('#' + settings.sTableId).contents())($scope);
//                 })
//                 .withOption('fnDrawCallback', function (settings, data) {
//                     $compile(angular.element('#' + settings.sTableId).contents())($scope);
//                 })
//                 .withOption('rowCallback', rowCallback).withBootstrap().withBootstrapOptions({
//                     TableTools: {
//                         classes: {
//                             container: 'btn-group',
//                             buttons: {
//                                 normal: 'btn btn-danger'
//                             }
//                         }
//                     },
//                     pagination: {
//                         classes: {
//                             ul: 'pagination pagination-sm'
//                         }
//                     }
//                 });
//         }

//         ///Bind DataTable
//         vm.dtApplicationColumns = [
//             DTColumnBuilder.newColumn('mediaLicenseNumber').withTitle(vm.translateFilter('dashboard.mediaLicenseNumber')),
//             DTColumnBuilder.newColumn('licenseNumber').withTitle(vm.translateFilter('establishment.LicenseNumber')),
//             DTColumnBuilder.newColumn('id').notVisible(),
//             DTColumnBuilder.newColumn(null).withOption('defaultContent', ' ').withTitle(vm.translateFilter('address.Emirate')).renderWith(
//                 function (data, type) {
//                     var community = $filter('filter')(vm.communities, { id: data.address.communityId }, true)[0];
//                     return $filter('localizeString')(community.region.emirate);
//                 }),
//             DTColumnBuilder.newColumn(null).withOption('defaultContent', ' ').withTitle(vm.translateFilter('address.Community')).renderWith(
//                 function (data, type) {
//                     var community = $filter('filter')(vm.communities, { id: data.address.communityId }, true)[0];
//                     return $filter('localizeString')(community);
//                 }),
//             DTColumnBuilder.newColumn(null).withTitle(vm.translateFilter('completeProfile.establishmentName')).renderWith(
//                 function (data, type) {
//                     var community = $filter('filter')(vm.communities, { id: data.address.communityId }, true)[0];
//                     return data.nameEn;
//                 }),
//             DTColumnBuilder.newColumn(null).withTitle(vm.translateFilter('general.actions')).notSortable()
//                 .renderWith(actionsHtml),
//             DTColumnBuilder.newColumn(null).withTitle(vm.translateFilter('general.procedures')).notSortable()
//                 .renderWith(workflowActionsHtml)];

//         ///Get User filter
//         $http.get($rootScope.app.httpSource + 'api/UserFilter?menuId=' + 33)
//             .then(function (response) {
//                 vm.userFilters = response.data;
//             });

//         function serverData(sSource, aoData, fnCallback, oSettings) {
//             var draw = aoData[0].value;
//             var order = aoData[2].value[0];
//             var start = aoData[3].value;
//             var length = aoData[4].value;
//             var search = aoData[5].value;

//             vm.params = {
//                 searchtext: (search.value === '' ? null : search.value),
//                 page: (start / length) + 1,
//                 pageSize: length,
//                 sortBy: (order.column === 0 ? 'Id' : aoData[1].value[order.column].data),
//                 sortDirection: order.dir,
//                 filterParams: (vm.filterParams === undefined ? null : vm.filterParams)
//             };

//             $http.get($rootScope.app.httpSource + 'api/UserFilter/GetDefaultUserFilter?menuId=' + 33)
//                 .then(function (responseFilter) {
//                     vm.defaultUserFilter = responseFilter.data;

//                     if (vm.defaultUserFilter != null) {
//                         if (vm.params.filterParams == null) {
//                             vm.params.filterParams = {};
//                             vm.params.filterParams.userFilterId = vm.defaultUserFilter.id;

//                             if (vm.filterParams == null) {
//                                 vm.filterParams = {};
//                                 vm.filterParams.userFilterId = vm.defaultUserFilter.id;
//                             }
//                         }
//                     }
//                     $http.post($rootScope.app.httpSource + 'api/Establishment/GetEstablishments', vm.params)
//                         .then(function (resp) {
//                             if (vm.communities == undefined || vm.communities.length == 0) {
//                                 $http.get($rootScope.app.httpSource + 'api/Community/GetCommunities')
//                                     .then(function (response) {
//                                         vm.communities = response.data;
//                                         vm.establishments = resp.data.content;
//                                         var records = {
//                                             'draw': draw,
//                                             'recordsTotal': resp.data.totalRecords,
//                                             'recordsFiltered': resp.data.totalRecords,
//                                             'data': resp.data.content
//                                         };
//                                         fnCallback(records);
//                                     });
//                             }
//                             else {
//                                 vm.establishments = resp.data.content;
//                                 var records = {
//                                     'draw': draw,
//                                     'recordsTotal': resp.data.totalRecords,
//                                     'recordsFiltered': resp.data.totalRecords,
//                                     'data': resp.data.content
//                                 };
//                                 fnCallback(records);
//                             }
//                         },
//                         function (response) {
//                             var records = {
//                                 'draw': draw,
//                                 'recordsTotal': 0,
//                                 'recordsFiltered': 0,
//                                 'data': []
//                             };
//                             fnCallback(records);
//                         });
//                 });
//         };

//         vm.open = function (size) {
//             var modalInstance = $uibModal.open({
//                 templateUrl: 'app/views/Inspection/establishments/AddEstablishment/addEstablishmnet.html',
//                 controller: 'AddEstablishmentController',
//                 size: size,
//                 resolve: {
//                     emirates: function () {
//                         return vm.emirates;
//                     },
//                     communities: function () {
//                         return vm.communities;
//                     },
//                     establishment: function () {
//                         return null;
//                     },
//                     userType: function () {
//                         return vm.userProfile.userType;
//                     }
//                 }
//             });

//             modalInstance.result.then(function (establishmentBranch) {
//                 //vm.CheckLicenseNumber(establishmentBranch);
//                 vm.insertEstablishment(establishmentBranch);
//             },
//                 function () {
//                 });
//         };

//         ///Insert Establishment
//         vm.insertEstablishment = function (establishmentBranch) {
//             $http.post($rootScope.app.httpSource + 'api/Establishment/SaveEstablishment', inputRequest(establishmentBranch))
//                 .then(
//                 function (response) {
//                     var translate = $filter('translate');
//                     if(response.data == true){
//                         SweetAlert.swal(translate('establishment.success'), translate('establishment.dataAdded'), "success");
//                         vm.dtApplicationInstance.reloadData();
//                     }
//                     else{
//                         SweetAlert.swal(translate('establishment.error'), translate('establishment.alreadyExist'), "error");
//                     }
//                 },
//                 function (error) {
//                 });
//         }

//         function inputRequest(establishmentBranch) {
//             return {
//                 "address": {
//                     "communityId": establishmentBranch.address.community.id,
//                     "phoneNumber": establishmentBranch.address.phoneNumber,
//                     "street": establishmentBranch.address.street,
//                     "longitude": establishmentBranch.address.longitude,
//                     "latitude": establishmentBranch.address.latitude
//                 },
//                 "nameEn": establishmentBranch.nameEn,
//                 "licenseCopyUrl": establishmentBranch.licenseCopyUrl,
//                 "licenseNumber": establishmentBranch.licenseNumber,
//                 "AuthorityId": establishmentBranch.authority.id,
//                 "memorandumOfAssociationCopyUrl": establishmentBranch.memorandumOfAssociationCopyUrl,
//                 "powerOfAttorneyCopyUrl": establishmentBranch.powerOfAttorneyCopyUrl,
//                 "statementCopyUrl": establishmentBranch.statementCopyUrl,
//                 "tenancyContractCopyUrl": establishmentBranch.tenancyContractCopyUrl,
//                 "tenancyContractEndDate": moment(establishmentBranch.tenancyContractEndDate).format('YYYY-MM-DD')
//             }
//         }

//         function createdRow(row, data, dataIndex) {
//             $compile(angular.element(row).contents())($scope);
//         };

//         function rowCallback(tabRow, data, dataIndex) {
//         };

//         function workflowActionsHtml(data, type, full, meta) {
//             var htmlSection;

//             htmlSection = '<div style="display:inline-block" class=""><workflow-action ng-model="dashboard.applications[0].applicationDetails[0]" ' +
//                 'dtapplicationinstance="dashboard.dtApplicationInstance" application="dashboard.applications[0]"></workflow-action></div>';

//             return htmlSection;
//         };

//         function actionsHtml(data, type, full, meta) {
//             var htmlSection = '<div style="display:inline-block" class="list-icon"><div class="inline" ng-click="establishment.getLocation(' + data.id +
//                 ',\'lg\')"><em class="fa fa-location-arrow" style="cursor:pointer" uib-tooltip="' + vm.translateFilter('general.mapLocation') +
//                 '"></em></div><div class="inline" ng-click="establishment.review(' + data.id +
//                 ',\'lg\')"><em class="fa fa-search" style="cursor:pointer" uib-tooltip="' + vm.translateFilter('general.review') + '"></em></div></div>';

//             return htmlSection;
//         };

//         vm.bindButtons = function (data, service) {
//             var htmlSection = '';
//             if (data.applicationStatus.id == 1) {
//                 if (vm.user.userTypeCode != "06") {
//                     if (data.payments.length > 0 && data.payments[0].paymentStatusId == 3) {
//                         htmlSection = '<div style="display:inline-block" class="list-icon"><div class="inline" ng-click="dashboard.edit(' + data.applicationId + ',' + data.id + ',' +
//                             data.applicationTypeId + ',\'' + service.code + '\',\'' + service.serviceCategory.code + '\')"><em class="fa fa-pencil" style="cursor:pointer" uib-tooltip="' +
//                             vm.translateFilter('general.edit') + '"></em></div><div class="inline" ng-click="dashboard.printReceipt(' + data.id +
//                             ')"><em class="fa fa-print" style="cursor:pointer" uib-tooltip="' + vm.translateFilter('general.receipt') + '"></em></div></div>';
//                     }
//                     else {
//                         htmlSection = '<div style="display:inline-block" class="list-icon"><div class="inline" ng-click="dashboard.edit(' + data.applicationId + ',' + data.id + ',' +
//                             data.applicationTypeId + ',\'' + service.code + '\',\'' + service.serviceCategory.code + '\')"><em class="fa fa-pencil" style="cursor:pointer" uib-tooltip="' +
//                             vm.translateFilter('general.edit') + '"></em></div><div class="inline" ng-click="dashboard.delete(' + data.id +
//                             ', $event)"><em class="fa fa-trash" style="cursor:pointer" uib-tooltip="' + vm.translateFilter('general.delete') + '"></em></div></div>';
//                     }
//                 }
//                 else {
//                     htmlSection = '<div style="display:inline-block" class="list-icon"><div class="inline" ng-click="dashboard.actionList(' + data.id +
//                         ',\'lg\')"><em class="fa fa-sitemap" style="cursor:pointer" uib-tooltip="' + vm.translateFilter('general.procedureList') +
//                         '"></em></div><div class="inline" ng-click="dashboard.review(' + data.id + ',\'' + service.code + '\',\'' + service.serviceCategory.code +
//                         '\')"><em class="fa fa-search" style="cursor:pointer" uib-tooltip="' + vm.translateFilter('general.review') + '"></em></div></div>';
//                 }
//             }
//             else if (data.applicationStatus.id == 9) {
//                 if (vm.user.userTypeCode != "06") {
//                     if (data.payments.length > 0 && data.payments[0].paymentStatusId == 3) {
//                         htmlSection = '<div style="display:inline-block" class="list-icon"><div class="inline" ng-click="dashboard.edit(' + data.applicationId + ',' + data.id + ',' +
//                             data.applicationTypeId + ',\'' + service.code + '\',\'' + service.serviceCategory.code + '\')"><em class="fa fa-pencil" style="cursor:pointer" uib-tooltip="' +
//                             vm.translateFilter('general.edit') + '"></em></div><div class="inline" ng-click="dashboard.printReceipt(' + data.id +
//                             ')"><em class="fa fa-print" style="cursor:pointer" uib-tooltip="' + vm.translateFilter('general.receipt') + '"></em></div></div>';
//                     }
//                     else {
//                         htmlSection = '<div style="display:inline-block" class="list-icon"><div class="inline" ng-click="dashboard.edit(' + data.applicationId + ',' + data.id + ',' +
//                             data.applicationTypeId + ',\'' + service.code + '\',\'' + service.serviceCategory.code + '\')"><em class="fa fa-pencil" style="cursor:pointer" uib-tooltip="' +
//                             vm.translateFilter('general.edit') + '"></em></div><div class="inline" ng-click="dashboard.delete(' + data.id +
//                             ', $event)"><em class="fa fa-trash" style="cursor:pointer" uib-tooltip="' + vm.translateFilter('general.delete') + '"></em></div></div>';
//                     }
//                 }
//                 else {
//                     htmlSection = '<div style="display:inline-block" class="list-icon"><div class="inline" ng-click="dashboard.actionList(' +
//                         data.id + ',\'lg\')"><em class="fa fa-sitemap" style="cursor:pointer" uib-tooltip="' +
//                         vm.translateFilter('general.procedureList') + '"></em></div></div>';
//                 }
//             }
//             else if (data.applicationStatus.id == 3 && service.serviceCategory.code == 'MC') {
//                 if (vm.user.userTypeCode != "06") {
//                     htmlSection = '<div style="display:inline-block" class="list-icon"><div class="inline" ng-click="dashboard.review(' +
//                         data.id + ',\'' + service.code + '\',\'' + service.serviceCategory.code + '\')"><em class="fa fa-search" style="cursor:pointer" uib-tooltip="' +
//                         vm.translateFilter('general.review') + '"></em></div><div class="inline" ng-click="dashboard.delete(' +
//                         data.id + ', $event)"><em class="fa fa-trash" style="cursor:pointer" uib-tooltip="' +
//                         vm.translateFilter('general.delete') + '"></em></div></div>';
//                 }
//                 else {
//                     htmlSection = '<div style="display:inline-block" class="list-icon"><div class="inline" ng-click="dashboard.actionList(' +
//                         data.id + ',\'lg\')"><em class="fa fa-sitemap" style="cursor:pointer" uib-tooltip="' +
//                         vm.translateFilter('general.procedureList') + '"></em></div><div class="inline" ng-click="dashboard.review(' +
//                         data.id + ',\'' + service.code + '\',\'' + service.serviceCategory.code + '\')"><em class="fa fa-search" style="cursor:pointer" uib-tooltip="' +
//                         vm.translateFilter('general.review') + '"></em></div></div>';
//                 }
//             }
//             else if (data.payments.length > 0 && data.payments[0].paymentStatusId == 3) {
//                 if (vm.user.userTypeCode != "06") {
//                     htmlSection = '<div style="display:inline-block" class="list-icon"><div class="inline" ng-click="dashboard.review(' +
//                         data.id + ',\'' + service.code + '\',\'' + service.serviceCategory.code + '\')"><em class="fa fa-search" style="cursor:pointer" uib-tooltip="' +
//                         vm.translateFilter('general.review') + '"></em></div><div class="inline" ng-click="dashboard.printReceipt(' + data.id + ')"><em class="fa fa-print" style="cursor:pointer" uib-tooltip="' +
//                         vm.translateFilter('general.receipt') + '"></em></div></div>';
//                 }
//                 else {
//                     if (service.serviceCategory.code == "MC") {

//                         var report = null;

//                         for (var i = 0; i < data.actionsTakens.length; i++) {
//                             if (data.actionsTakens[i].report != null) {
//                                 report = data.actionsTakens[i].report;
//                             }
//                         }

//                         if (report) {
//                             htmlSection = '<div class="list-icon"><div class="inline" ng-click="dashboard.review(' +
//                                 data.id + ',\'' + service.code + '\',\'' + service.serviceCategory.code + '\')"><em class="fa fa-search" style="cursor:pointer" uib-tooltip="' +
//                                 vm.translateFilter('general.review') + '"></em></div><div class="inline" ng-click="dashboard.actionList(' +
//                                 data.id + ',\'lg\')"><em class="fa fa-sitemap" style="cursor:pointer" uib-tooltip="' +
//                                 vm.translateFilter('general.procedureList') + '"></em></div><div class="inline" ng-click="dashboard.printReceipt(' + data.id +
//                                 ')"><em class="fa fa-print" style="cursor:pointer" uib-tooltip="' + vm.translateFilter('general.receipt') + '"></em></div><div class="inline" ' +
//                                 'ng-click="dashboard.printControllerReport(' + data.id + ')"><em class="fa fa-flag" style="cursor:pointer" uib-tooltip="' +
//                                 vm.translateFilter('mediaMaterialApproval.controllerReport') + '"></em></div></div>';
//                         }
//                         else {
//                             htmlSection = '<div class="list-icon"><div class="inline" ng-click="dashboard.review(' +
//                                 data.id + ',\'' + service.code + '\',\'' + service.serviceCategory.code + '\')"><em class="fa fa-search" style="cursor:pointer" uib-tooltip="' +
//                                 vm.translateFilter('general.review') + '"></em></div><div class="inline" ng-click="dashboard.actionList(' +
//                                 data.id + ',\'lg\')"><em class="fa fa-sitemap" style="cursor:pointer" uib-tooltip="' +
//                                 vm.translateFilter('general.procedureList') + '"></em></div><div class="inline" ng-click="dashboard.printReceipt(' + data.id +
//                                 ')"><em class="fa fa-print" style="cursor:pointer" uib-tooltip="' + vm.translateFilter('general.receipt') + '"></em></div></div>';
//                         }
//                     }
//                     else {
//                         htmlSection = '<div class="list-icon"><div class="inline" ng-click="dashboard.review(' +
//                             data.id + ',\'' + service.code + '\',\'' + service.serviceCategory.code + '\')"><em class="fa fa-search" style="cursor:pointer" uib-tooltip="' +
//                             vm.translateFilter('general.review') + '"></em></div><div class="inline" ng-click="dashboard.actionList(' +
//                             data.id + ',\'lg\')"><em class="fa fa-sitemap" style="cursor:pointer" uib-tooltip="' +
//                             vm.translateFilter('general.procedureList') + '"></em></div><div class="inline" ng-click="dashboard.printReceipt(' + data.id +
//                             ')"><em class="fa fa-print" style="cursor:pointer" uib-tooltip="' + vm.translateFilter('general.receipt') + '"></em></div></div>';
//                     }
//                 }
//             }
//             else {
//                 if (vm.user.userTypeCode != "06") {
//                     htmlSection = '<div style="display:inline-block" class="list-icon"><div class="inline" ng-click="dashboard.review(' +
//                         data.id + ',\'' + service.code + '\',\'' + service.serviceCategory.code + '\')"><em class="fa fa-search" style="cursor:pointer" uib-tooltip="' +
//                         vm.translateFilter('general.review') + '"></em></div></div>';
//                 }
//                 else {
//                     htmlSection = '<div style="display:inline-block" class="list-icon"><div class="inline" ng-click="dashboard.actionList(' +
//                         data.id + ',\'lg\')"><em class="fa fa-sitemap" style="cursor:pointer" uib-tooltip="' +
//                         vm.translateFilter('general.procedureList') + '"></em></div><div class="inline" ng-click="dashboard.review(' +
//                         data.id + ',\'' + service.code + '\',\'' + service.serviceCategory.code + '\')"><em class="fa fa-search" style="cursor:pointer" uib-tooltip="' +
//                         vm.translateFilter('general.review') + '"></em></div></div>';
//                 }
//             }

//             return htmlSection;
//         };

//         vm.printControllerReport = function (applicationDetailId) {
//             var applicationDetail = null;
//             for (var i = 0; i < vm.applications.length; i++) {
//                 applicationDetail = $filter('filter')(vm.applications[i].applicationDetails, { id: applicationDetailId }, true)[0];
//                 if (applicationDetail != null) break;
//             }
//             SweetAlert.swal({
//                 title: vm.translateFilter('mediaMaterialApproval.pleaseSelectTheReceiptType'),
//                 text: "",
//                 type: "warning",
//                 showCancelButton: true,
//                 confirmButtonColor: "#DD6B55",
//                 confirmButtonText: vm.translateFilter('mediaMaterialApproval.receiptWithHeader'),
//                 cancelButtonText: vm.translateFilter('mediaMaterialApproval.receiptWithoutHeader'),
//                 closeOnConfirm: true,
//                 closeOnCancel: true
//             },
//                 function (isConfirm) {
//                     var report;

//                     for (var i = 0; i < applicationDetail.actionsTakens.length; i++) {
//                         if (applicationDetail.actionsTakens[i].report != null) {
//                             report = applicationDetail.actionsTakens[i].report;
//                         }
//                     }

//                     if (isConfirm) {
//                         $window.open(report.reportWithHeaderUrlFullPath, '_blank');
//                     } else {
//                         $window.open(report.reportUrlFullPath, '_blank');
//                     }
//                 });
//         }

//         vm.getLocation = function (establishmentId, size) {
//             if (!$scope.timelineOpened) {
//                 var modalInstance = $uibModal.open({
//                     templateUrl: 'app/views/Inspection/maps/maps.html',
//                     controller: 'mapsController',
//                     size: size,
//                     resolve: {
//                         establishment: function () {
//                             return $filter('filter')(vm.establishments, { id: establishmentId }, true)[0];
//                         }
//                     }
//                 });

//                 modalInstance.result.then(function (establishmentBranch) {
//                     $scope.timelineOpened = false;
//                 }, function () {
//                 });

//                 // we want to update state whether the modal closed or was dismissed,
//                 // so use finally to handle both resolved and rejected promises.
//                 modalInstance.result.finally(function (selectedItem) {
//                     $scope.timelineOpened = false;
//                 });
//             }

//             $scope.timelineOpened = true;
//         }

//         vm.review = function (establishmentId) {
//             $state.go('app.ReviewEstablishment', { id: establishmentId });
//         };

//         var index;
//         var tempStore;

//         vm.delete = function (applicationDetailId, event) {
//             if (applicationDetailId == 0 || applicationDetailId == undefined) {
//                 index = vm.dtApplicationInstance.DataTable.rows({ order: 'applied' }).nodes().indexOf(event.currentTarget.parentNode.parentNode.parentNode);
//                 tempStore = vm.applications[index];
//                 vm.applications.splice(index, 1);
//             }
//             else {
//                 for (var i = 0; i < vm.applications.length; i++) {
//                     if (vm.applications[i].applicationDetails.length == 1) {
//                         var applicationDetail = $filter('filter')(vm.applications[i].applicationDetails, { id: applicationDetailId }, true)[0];
//                         if (applicationDetail != undefined) {
//                             index = vm.applications.indexOf(vm.applications[i]);
//                             tempStore = $filter('filter')(vm.applications[i].applicationDetails, { id: applicationDetailId }, true)[0];
//                             vm.applications.splice(index, 1);
//                             vm.isTemporaryDelete = true;
//                             break;
//                         }
//                     }
//                     else {
//                         index = vm.applications[i].applicationDetails.indexOf($filter('filter')(vm.applications[i].applicationDetails, { id: applicationDetailId }, true)[0]);
//                         if (index != -1) {
//                             tempStore = $filter('filter')(vm.applications[i].applicationDetails, { id: applicationDetailId }, true)[0];
//                             vm.applications[i].applicationDetails.splice(index, 1);
//                             vm.isTemporaryDelete = true;
//                             break;
//                         }
//                     }
//                 }
//             }
//             var translate = $filter('translate');
//             vm.dtApplicationInstance.DataTable.draw();

//             SweetAlert.swal({
//                 title: translate('general.confirmDelete'),
//                 text: translate('general.confirmDeleteInfo'),
//                 type: "warning",
//                 showCancelButton: true,
//                 confirmButtonColor: "#DD6B55",
//                 confirmButtonText: translate('general.confirmDeleteBtn'),
//                 cancelButtonText: translate('general.restoreBtn'),
//                 closeOnConfirm: false,
//                 closeOnCancel: false
//             },
//                 function (isConfirm) {
//                     if (isConfirm) {
//                         //delete
//                         $http.post($rootScope.app.httpSource + 'api/ApplicationDetail/DeleteApplicationDetail', tempStore)
//                             .then(function (response) {
//                                 vm.isBusy = false;
//                                 SweetAlert.swal(translate('general.confirmDeleteBtn'), translate('general.deleteMessage'), "error");
//                                 vm.isTemporaryDelete = undefined;
//                                 vm.dtApplicationInstance.DataTable.draw();
//                             },
//                             function (response) { // optional
//                                 SweetAlert.swal(translate('general.confirmDeleteBtn'), translate('general.deleteMessage'), "error");
//                             });
//                     } else {
//                         SweetAlert.swal(translate('general.restoreBtn'), translate('general.restoreMessage'), "success");
//                         vm.isTemporaryDelete = undefined;
//                         vm.dtApplicationInstance.DataTable.draw();
//                     }
//                 });
//         };

//         function renderer(api, rowIdx, columns) {
//             var data = $.map(columns, function (col, i) {
//                 return col.hidden ?
//                     '<li data-dtr-index="' + col.columnIndex + '" data-dt-row="' + col.rowIndex + '" data-dt-column="' + col.columnIndex + '">' +
//                     '<span class="dtr-title">' +
//                     col.title +
//                     '</span> ' +
//                     '<span class="dtr-data">' +
//                     col.data +
//                     '</span>' +
//                     '</li>' :
//                     '';
//             }).join('');
//             return data ?
//                 $compile(angular.element($('<ul data-dtr-index="' + rowIdx + '"/>').append(data)))($scope) :
//                 false;
//         }

//         vm.filter = function ($scope) {
//             vm.filterParams = $scope.filterParams;
//             vm.dtApplicationInstance.DataTable.draw();
//         }

//         vm.isObjectEmpty = function (card) {
//             if (card) {
//                 return Object.keys(card).length === 0;
//             }
//             else {
//                 return true;
//             }
//         }

//         vm.userFilterData = function (userFilter) {
//             vm.filterParams = {};
//             vm.filterParams.userFilterId = userFilter.id;
//             vm.selectedUserFilter = userFilter;
//             vm.dtApplicationInstance.DataTable.draw();
//         }

//         vm.removeFilter = function ($scope) {
//             vm.filterParams = {};
//             vm.dtApplicationInstance.DataTable.draw();
//         }
//         vm.checkFine = function () {
//             $window.open('/#/page/payFines/', '_blank');
//         }
//     }

// })();
