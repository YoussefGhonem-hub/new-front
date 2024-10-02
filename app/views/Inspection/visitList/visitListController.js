(function () {
    'use strict';
    angular
        .module('eServices')
        .controller('visitListController', visitListController);

    visitListController.$inject = ['$rootScope', '$scope', '$http', '$timeout', 'UserProfile', '$uibModal', '$state', 'SweetAlert', '$filter', '$compile'];

    function visitListController($rootScope, $scope, $http, $timeout, UserProfile, $uibModal, $state, SweetAlert, $filter, $compile) {
        var vm = this;

        // Initialize variables
        vm.user = UserProfile.getProfile();
        vm.pageIndex = 0;
        vm.pageSize = 10;
        vm.totalPages = 0;
        vm.entries = [5, 10, 20, 30, 50];
        vm.selectedEntries = vm.entries[1];
        vm.searchText = '';
        vm.visits = [];
        var searchTimeout;

        vm.language = $rootScope.language.selected; // Language for translation
        vm.employees = [];
        vm.filterParams = {};

        // Function to show loader
        function showLoader() {
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

        // Function to hide loader
        function hideLoader() {
            angular.element('.sk-cube-grid').remove();
        }

        // Function to get "Assigned To" based on createdBy field
        vm.getAssignedTo = function (createdBy) {
            if (vm.employees.length === 0) {
                return '';
            } else {
                var employee = $filter('filter')(vm.employees, { id: createdBy }, true)[0];
                if (employee) {
                    return employee.firstName + ' ' + employee.lastName;
                }
                return '';
            }
        };

        // Export functionalities (Excel, PDF, CSV)
        vm.exportExcel = function () {
            $http.post($rootScope.app.httpSource + 'api/Visit/ExportExcel', vm.params, { responseType: 'arraybuffer' })
                .then(function (resp) {
                    var data = new Blob([resp.data], { type: 'application/vnd.ms-excel' });
                    saveAs(data, "VisitList.xlsx");
                });
        };

        vm.exportPDF = function () {
            $http.post($rootScope.app.httpSource + 'api/Visit/ExportToPdf', vm.params, { responseType: 'arraybuffer' })
                .then(function (resp) {
                    var data = new Blob([resp.data], { type: 'application/pdf' });
                    saveAs(data, "VisitList.pdf");
                });
        };

        vm.exportCSV = function () {
            $http.post($rootScope.app.httpSource + 'api/Visit/ExportCSV', vm.params)
                .then(function (resp) {
                    var myBlob = new Blob([resp.data], { type: 'text/html' });
                    var url = window.URL.createObjectURL(myBlob);
                    var a = document.createElement("a");
                    document.body.appendChild(a);
                    a.href = url;
                    a.download = "VisitList.csv";
                    a.click();
                    window.URL.revokeObjectURL(url);
                });
        };

        // Function to load visits
        vm.loadVisits = function () {
            // Show loader before the API call
            showLoader();

            var params = {
                page: vm.pageIndex + 1,
                pageSize: vm.selectedEntries,
                searchtext: vm.searchText || null
            };

            $http.post($rootScope.app.httpSource + 'api/Visit/GetVisit', params)
                .then(function (response) {
                    vm.visits = response.data.content;
                    var totalRecords = response.data.totalRecords || 0;
                    vm.totalPages = totalRecords > 0 ? Math.ceil(totalRecords / vm.selectedEntries) : 1;

                    // Fetch the list of employees for the "Assigned To" field
                    if (vm.employees.length === 0) {
                        $http.get($rootScope.app.httpSource + 'api/UserProfile/GetInspectors')
                            .then(function (response) {
                                vm.employees = response.data.map(item => item.user);
                            });
                    }
                })
                .finally(function () {
                    // Hide loader after the API call completes
                    hideLoader();
                });
        };

        // Pagination control functions
        vm.previousPage = function () {
            if (vm.pageIndex > 0) {
                vm.pageIndex--;
                vm.loadVisits();
            }
        };

        vm.nextPage = function () {
            if (vm.pageIndex < vm.totalPages - 1) {
                vm.pageIndex++;
                vm.loadVisits();
            }
        };

        vm.goToPage = function (pageIndex) {
            if (pageIndex >= 0 && pageIndex < vm.totalPages) {
                vm.pageIndex = pageIndex;
                vm.loadVisits();
            }
        };

        vm.getPageRange = function () {
            var start = Math.max(0, vm.pageIndex - Math.floor(5 / 2));
            var end = Math.min(vm.totalPages, start + 5);
            start = Math.max(0, end - 5);
            return Array.from({ length: end - start }, (_, i) => start + i);
        };

        // Function to get translated establishment name
        vm.getEstablishmentName = function (establishment) {
            return vm.language === 'ar' ? establishment.nameAr : establishment.nameEn;
        };

        // Function to get "Application Status" (visitStatus) and translate it
        vm.getApplicationStatus = function (visitStatus) {
            return $filter('localizeString')(visitStatus);
        };

        // Search functionality with debounce
        vm.filterData = function () {
            if (searchTimeout) {
                $timeout.cancel(searchTimeout);
            }
            searchTimeout = $timeout(function () {
                vm.pageIndex = 0;
                vm.loadVisits();
            }, 1000);  // 1-second debounce time
        };

        // Review function (for viewing visit details)
        vm.review = function (visitId) {
            $state.go('app.ReviewVisitList', { id: visitId });
        };

        // Edit function (for editing visit details)
        vm.edit = function (visitId) {
            $state.go('app.visit', { visitId: visitId });
        };

        // Delete function
        vm.delete = function (visitId) {
            SweetAlert.swal({
                title: "Are you sure?",
                text: "You will not be able to recover this visit!",
                type: "warning",
                showCancelButton: true,
                confirmButtonColor: "#DD6B55",
                confirmButtonText: "Yes, delete it!",
                cancelButtonText: "No, cancel!",
                closeOnConfirm: false,
                closeOnCancel: true
            }, function (isConfirm) {
                if (isConfirm) {
                    $http.post($rootScope.app.httpSource + 'api/Visit/DeleteVisit', { id: visitId })
                        .then(function (response) {
                            SweetAlert.swal("Deleted!", "The visit has been deleted.", "success");
                            vm.loadVisits();
                        }, function (error) {
                            SweetAlert.swal("Error!", "Unable to delete the visit.", "error");
                        });
                }
            });
        };
        vm.unscheduledvisit = function () {
            $state.go('app.unscheduledvisit');

        }

        // Initial load of visits
        vm.loadVisits();
    }
})();



// (function () {
//     'use strict';
//     angular
//         .module('eServices')
//         .controller('visitListController', visitListController);


//     visitListController.$inject = ['$rootScope', '$scope', 'UserProfile', '$filter', 'DTOptionsBuilder', 'DTColumnBuilder', '$compile', '$http', '$uibModal', '$state', 'SweetAlert', '$window'];

//     function visitListController($rootScope, $scope, UserProfile, $filter, DTOptionsBuilder, DTColumnBuilder, $compile, $http, $uibModal, $state, SweetAlert, $window) {
//         var vm = this;

//         vm.user = UserProfile.getProfile();
//         vm.dtApplicationInstance = {};
//         vm.translateFilter = $filter('translate');
//         vm.unscheduledvisit = function () {
//             $state.go('app.unscheduledvisit');

//         }

//         vm.exportExcel = function () {
//             $http.post($rootScope.app.httpSource + 'api/Visit/ExportExcel', vm.params, { responseType: 'arraybuffer' })
//                 .then(function (resp) {
//                     var data = new Blob([resp.data], { type: 'application/vnd.ms-excel' });
//                     saveAs(data, "VisitList.xlsx");
//                 },
//                     function (response) {
//                     });
//         };
//         vm.exportPDF = function () {
//             $http.post($rootScope.app.httpSource + 'api/Visit/ExportToPdf', vm.params, { responseType: 'arraybuffer' })
//                 .then(function (resp) {
//                     var data = new Blob([resp.data], { type: 'application/pdf' });
//                     saveAs(data, "VisitList.pdf");
//                 },
//                     function (response) {
//                     });
//         };
//         vm.exportCSV = function () {
//             $http.post($rootScope.app.httpSource + 'api/Visit/ExportCSV', vm.params)
//                 .then(function (resp) {
//                     var myBlob = new Blob([resp.data], { type: 'text/html' });
//                     var url = window.URL.createObjectURL(myBlob);
//                     var a = document.createElement("a");
//                     document.body.appendChild(a);
//                     a.href = url;
//                     a.download = "VisitList.csv";
//                     a.click();
//                     window.URL.revokeObjectURL(url);
//                 },
//                     function (response) {
//                     });
//         };

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

//         vm.dtApplicationColumns = [
//             DTColumnBuilder.newColumn('id').notVisible(),
//             DTColumnBuilder.newColumn('visitNumber').withTitle(vm.translateFilter('inspection.visitNumber')).notSortable(),
//             DTColumnBuilder.newColumn(null).withTitle(vm.translateFilter('completeProfile.establishmentName')).renderWith(
//                 function (data, type) {
//                     if (data.establishment != null && data.establishment.licenseNumber != '900098_9') {
//                         if (data.establishment) {
//                             return $filter('localizeString')(data.establishment);
//                         }
//                         else {
//                             return $filter('localizeString')(data.taskList.establishment);
//                         }
//                     }
//                     else {
//                         return data.userProfile.person.name;
//                     }
//                 }),
//             DTColumnBuilder.newColumn('visitStatus').withTitle(vm.translateFilter('dashboard.applicationStatus')).renderWith(
//                 function (data, type) {
//                     return $filter('localizeString')(data);
//                 }),
//             DTColumnBuilder.newColumn('createdBy').withTitle(vm.translateFilter('inspection.assignedTo')).renderWith(
//                 function (data, type) {
//                     if (vm.employees == undefined || vm.employees.length == 0) {
//                         return '';
//                     }
//                     else {
//                         var employee = $filter('filter')(vm.employees, { id: data }, true)[0];
//                         if (employee)
//                             return employee.firstName + ' ' + employee.lastName;
//                         return '';
//                     }
//                 }),
//             DTColumnBuilder.newColumn(null).withTitle(vm.translateFilter('inspection.createdOn')).renderWith(
//                 function (data, type) {
//                     return moment(data.createdOn).format('DD-MMMM-YYYY');
//                 }),
//             DTColumnBuilder.newColumn(null).withTitle('').renderWith(
//                 function (data, type) {
//                     if (data.parentId != null) {
//                         return '<div><img src="../app/img/rescheduled.png" width="90" height="30"></div>';
//                     }
//                     else {
//                         return '<div></div>';
//                     }
//                 }).notSortable(),
//             DTColumnBuilder.newColumn(null).withTitle(vm.translateFilter('general.actions')).notSortable()
//                 .renderWith(actionsHtml),
//             DTColumnBuilder.newColumn(null).withTitle(vm.translateFilter('general.procedures')).notSortable()
//                 .renderWith(workflowActionsHtml)];

//         $http.get($rootScope.app.httpSource + 'api/UserFilter?menuId=' + 36)
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
//                 sortBy: (order.column === 1 ? 'createdOn' : aoData[1].value[order.column].data),//SortBy createdOn by default
//                 sortDirection: order.dir,
//                 filterParams: (vm.filterParams === undefined ? null : vm.filterParams)
//             };

//             $http.get($rootScope.app.httpSource + 'api/UserFilter/GetDefaultUserFilter?menuId=' + 36)
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

//                     $http.post($rootScope.app.httpSource + 'api/Visit/GetVisit', vm.params)
//                         .then(function (resp) {
//                             if (vm.employees == undefined || vm.employees.length == 0) {
//                                 $http.get($rootScope.app.httpSource + 'api/UserProfile/GetInspectors')
//                                     .then(function (response) {
//                                         vm.employees = [];
//                                         for (var i = 0; i < response.data.length; i++) {
//                                             vm.employees.push(response.data[i].user);
//                                         }

//                                         vm.visits = resp.data.content;
//                                         var records = {
//                                             'draw': draw,
//                                             'recordsTotal': resp.data.totalRecords,
//                                             'recordsFiltered': resp.data.totalRecords,
//                                             'data': resp.data.content
//                                         };
//                                         fnCallback(records);
//                                     },
//                                         function (response) {
//                                             vm.visits = resp.data.content;
//                                             var records = {
//                                                 'draw': draw,
//                                                 'recordsTotal': resp.data.totalRecords,
//                                                 'recordsFiltered': resp.data.totalRecords,
//                                                 'data': resp.data.content
//                                             };
//                                             fnCallback(records);
//                                         });
//                             }
//                             else {
//                                 vm.visits = resp.data.content;
//                                 vm.applicationDetails = [];
//                                 var records = {
//                                     'draw': draw,
//                                     'recordsTotal': resp.data.totalRecords,
//                                     'recordsFiltered': resp.data.totalRecords,
//                                     'data': resp.data.content
//                                 };
//                                 fnCallback(records);
//                             }
//                         },
//                             function (response) {
//                                 var records = {
//                                     'draw': draw,
//                                     'recordsTotal': 0,
//                                     'recordsFiltered': 0,
//                                     'data': []
//                                 };
//                                 fnCallback(records);
//                             });
//                 });
//         }

//         function bindImage(data, type) {
//             var htmlSection;
//             $scope.showImg = data.parentId == null ? 'true' : 'false';

//             htmlSection = '<div>{{showImg}}<img ng-show="showImg" ng-src="../app/img/rescheduled.png" width="90" height="30"></div>';
//             return htmlSection;
//         };

//         function createdRow(row, data, dataIndex) {
//             $compile(angular.element(row).contents())($scope);
//         };

//         function rowCallback(tabRow, data, dataIndex) {
//         };

//         function workflowActionsHtml(data, type, full, meta) {
//             var htmlSection;
//             var index = vm.visits.indexOf(data);

//             htmlSection = '<div style="display:inline-block" class=""><workflow-action ng-model="visit.visits[' + index + ']" ' +
//                 'dtapplicationinstance="visit.dtApplicationInstance" application="visit.visits[' + index + ']"></workflow-action></div>';

//             return htmlSection;
//         };

//         function actionsHtml(data, type, full, meta) {
//             var htmlSection = "";
//             if (data.visitStatusId == 3 || data.visitStatusId == 4) {
//                 htmlSection += '<div style="display:inline-block" class="list-icon"><div class="inline" ng-click="visit.getLocation(' + data.establishmentId +
//                     ',\'lg\')"><em class="fa fa-location-arrow" style="cursor:pointer" uib-tooltip="' + vm.translateFilter('general.mapLocation') +
//                     '"></em></div><div class="inline" ng-click="visit.review(' + data.id + ',\'' + "01" + '\',\'' + 'IN' + '\')"><em class="fa fa-search" style="cursor:pointer" uib-tooltip="' +
//                     vm.translateFilter('general.review') + '"></em></div></div>';
//             }
//             else {
//                 htmlSection += '<div style="display:inline-block" class="list-icon"><div class="inline" ng-click="visit.edit(' + data.id + ',' +
//                     (data.establishment != null ? (data.establishment == null ? data.taskList.establishmentId : data.establishmentId) : data.userProfile.id) +
//                     ',\'' + "01" + '\',\'IN\')"><em class="fa fa-pencil" style="cursor:pointer" uib-tooltip="' +
//                     vm.translateFilter('general.edit') + '"></em></div><div class="inline" ng-click="visit.getLocation(' + data.establishmentId +
//                     ',\'lg\')"><em class="fa fa-location-arrow" style="cursor:pointer" uib-tooltip="' + vm.translateFilter('general.mapLocation') +
//                     '"></em></div><div class="inline" ng-click="visit.review(' + data.id + ',\'' + "01" + '\',\'' + 'IN' + '\')"><em class="fa fa-search" style="cursor:pointer" uib-tooltip="' +
//                     vm.translateFilter('general.review') + '"></em></div></div>';
//             }

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

//         vm.getLocation = function (estId, size) {
//             if (!$scope.timelineOpened) {
//                 var modalInstance = $uibModal.open({
//                     templateUrl: 'app/views/Inspection/maps/maps.html',
//                     controller: 'mapsController',
//                     size: size,
//                     resolve: {
//                         establishment: function () {
//                             var obj = $filter('filter')(vm.visits, { establishmentId: estId }, true)[0];
//                             return obj.establishment;                        
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

//         vm.edit = function (visitid, establishmentId, serviceCode, serviceCategoryCode) {
//             if (serviceCategoryCode == 'IN') {
//                 switch (serviceCode) {
//                     case "01":
//                         $state.go('app.visit', { establishmentId: establishmentId, visitId: visitid });
//                         break;
//                 }
//             }
//         };

//         vm.review = function (Id, serviceCode, serviceCategoryCode) {
//             if (serviceCategoryCode == 'IN') {
//                 switch (serviceCode) {
//                     case "01":
//                         $state.go('app.ReviewVisitList', { id: Id });
//                         break;
//                 }
//             }
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
//                                 function (response) { // optional
//                                     SweetAlert.swal(translate('general.confirmDeleteBtn'), translate('general.deleteMessage'), "error");
//                                 });
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
//     }
// })();