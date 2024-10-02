/**=========================================================
 * Module: DashboardController.js
 =========================================================*/
    (function () {
        'use strict';

        angular
            .module('eServices')
            .controller('DashboardController', DashboardController);

        DashboardController.$inject = ['$rootScope', '$scope', '$http', '$filter', '$uibModal', '$state', '$compile', 'SweetAlert', '$window'];

        function DashboardController($rootScope, $scope, $http, $filter, $uibModal, $state, $compile, SweetAlert, $window) {
            var vm = this;

            // Initialize variables
            vm.applications = [];
            vm.pageIndex = 0;
            vm.pageSize = 10;
            vm.totalPages = 0;
            vm.searchText = '';
            vm.sortBy = null; // No default sorting column initially
            vm.sortDirection = null; // No default sorting direction initially
            vm.entries = [5, 10, 20, 30, 50];
            vm.selectedEntries = vm.entries[1];
            vm.totalApplications = 0;
            vm.isLoading = false; // Loader flag

            // Initialization logic
            vm.init = function () {
                vm.loadApplications(); // Load the applications on initialization
            };

            // Loader function
            function loader() {
                vm.isLoading = true;
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
                vm.isLoading = false;
            }

            // Load applications with sorting and pagination
            vm.loadApplications = function () {
                loader();  // Show loader while fetching data

                var params = {
                    page: vm.pageIndex + 1,
                    pageSize: vm.selectedEntries,
                    searchText: vm.searchText || null,
                    sortBy: vm.sortBy, // No sorting if null
                    sortDirection: vm.sortDirection // No sorting if null
                };

                $http.post($rootScope.app.httpSource + 'api/Application/GetApplications', params)
                    .then(function (response) {
                        vm.applications = response.data.content;
                        vm.totalApplications = response.data.totalRecords || 0;
                        vm.totalPages = Math.ceil(vm.totalApplications / vm.selectedEntries);
                        removeLoader();  // Remove loader after fetching data
                    }, function (error) {
                        console.error('Error loading applications', error);
                        removeLoader();  // Remove loader in case of error
                    });
            };

      // Function to format consumedTime in whole minutes
        vm.formatConsumedTime = function (consumedTime) {
            if (consumedTime) {
                return Math.floor(consumedTime) + " min";  // Round down to nearest integer
            }
            return "0 min";  // Return a default value if consumedTime is not available
        };

            // Sorting logic
            vm.sortColumn = function (column) {
                if (vm.sortBy === column) {
                    vm.sortDirection = (vm.sortDirection === 'asc') ? 'desc' : 'asc';
                } else {
                    vm.sortBy = column;
                    vm.sortDirection = 'asc'; // Default to ascending when a column is sorted
                }
                vm.loadApplications();
            };

            // Pagination controls
            vm.previousPage = function () {
                if (vm.pageIndex > 0) {
                    vm.pageIndex--;
                    vm.loadApplications();
                }
            };

            vm.nextPage = function () {
                if (vm.pageIndex < vm.totalPages - 1) {
                    vm.pageIndex++;
                    vm.loadApplications();
                }
            };

            vm.goToPage = function (pageIndex) {
                if (pageIndex >= 0 && pageIndex < vm.totalPages) {
                    vm.pageIndex = pageIndex;
                    vm.loadApplications();
                }
            };

            vm.getPageRange = function () {
                var start = Math.max(0, vm.pageIndex - Math.floor(5 / 2));
                var end = Math.min(vm.totalPages, start + 5);
                start = Math.max(0, end - 5);
                return Array.from({ length: end - start }, (_, i) => start + i);
            };

            // Export functions (CSV, PDF, Excel)
            vm.exportExcel = function () {
                $http.post($rootScope.app.httpSource + 'api/Application/ExportExcel', vm.params, { responseType: 'arraybuffer' })
                    .then(function (resp) {
                        var data = new Blob([resp.data], { type: 'application/vnd.ms-excel' });
                        saveAs(data, "ApplicationList.xlsx");
                    }, function (error) {
                        console.error('Error exporting Excel', error);
                    });
            };

            vm.exportCSV = function () {
                $http.post($rootScope.app.httpSource + 'api/Application/ExportCSV', vm.params)
                    .then(function (resp) {
                        var BOM = "\uFEFF"; // UTF-8 BOM for proper encoding
                        var csvContent = BOM + resp.data;
                        var myBlob = new Blob([csvContent], { type: 'text/csv' });
                        var url = window.URL.createObjectURL(myBlob);
                        var a = document.createElement("a");
                        document.body.appendChild(a);
                        a.href = url;
                        a.download = "ApplicationList.csv";
                        a.click();
                        window.URL.revokeObjectURL(url);
                    }, function (error) {
                        console.error('Error exporting CSV', error);
                    });
            };

            vm.exportPDF = function () {
                $http.post($rootScope.app.httpSource + 'api/Application/ExportToPdf', vm.params, { responseType: 'arraybuffer' })
                    .then(function (resp) {
                        var data = new Blob([resp.data], { type: 'application/pdf' });
                        saveAs(data, "ApplicationList.pdf");
                    }, function (error) {
                        console.error('Error exporting PDF', error);
                    });
            };

            // Review function for action buttons
            vm.viewDetails = function (applicationId) {
                $state.go('app.applicationDetail', { id: applicationId });
            };

            // Delete an application
            vm.delete = function (applicationId, event) {
                var translate = $filter('translate');
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
                            // Perform delete action
                            $http.post($rootScope.app.httpSource + 'api/Application/DeleteApplication', { id: applicationId })
                                .then(function (response) {
                                    SweetAlert.swal(translate('general.deleted'), translate('application.deleted'), "success");
                                    vm.loadApplications(); // Refresh application list
                                }, function (error) {
                                    SweetAlert.swal(translate('general.error'), translate('application.error'), "error");
                                });
                        } else {
                            SweetAlert.swal(translate('general.cancelled'), translate('general.cancelledInfo'), "success");
                        }
                    });
            };

            // Initialize controller by calling the init method
            vm.init();
        }
    })();


 
// (function () {
//     'use strict';

//     angular
//         .module('eServices')
//         .controller('DashboardController', DashboardController);

//     DashboardController.$inject = ['$rootScope', '$scope', 'UserProfile', '$filter', 'DTOptionsBuilder', 'DTColumnBuilder', '$compile', '$http', '$uibModal', '$state', 'SweetAlert', '$window', '$cookies'];
//     function DashboardController($rootScope, $scope, UserProfile, $filter, DTOptionsBuilder, DTColumnBuilder, $compile, $http, $uibModal, $state, SweetAlert, $window, $cookies) {
//         var vm = this;
//         vm.user = UserProfile.getProfile();
//         vm.dtApplicationInstance = {};
//         vm.translateFilter = $filter('translate');


//         vm.init = function () {
//             //if ($cookies.get('eDirhamG3notify') == null) {
//             //    $cookies.put('eDirhamG3notify', 0); 
//             //}
//             //if (parseInt($cookies.get('eDirhamG3notify')) < 2) {
//             //    var eDirhamG3notifyURL = ($rootScope.language.selected !== 'English')  ? '"eDirham G3" src="app/img/edirham/notifyar.jpg"' :'"eDirham G3" src="app/img/edirham/notifyen.jpg"'
//             //    $uibModal.open({
//             //        template: '<img alt=' + eDirhamG3notifyURL +' class="img-responsive">',
//             //        size: 'lg',
//             //        keyboard: true, // ESC key close enable/disable
//             //        title: 'باستخدام الجيل الثالث من منظومة الدرهم الإلكتروني الجديد',
//             //    });
//             //    $cookies.put('eDirhamG3notify', parseInt($cookies.get('eDirhamG3notify')) + 1);
//             //}

//         };


//         vm.exportExcel = function () {
//             $http.post($rootScope.app.httpSource + 'api/Application/ExportExcel', vm.params, { responseType: 'arraybuffer' })
//                 .then(function (resp) {
//                     var data = new Blob([resp.data], { type: 'application/vnd.ms-excel' });
//                     saveAs(data, "Applications.xlsx");
//                 },
//                     function (response) {
//                     });
//         };
//         vm.exportPDF = function () {
//             $http.post($rootScope.app.httpSource + 'api/Application/ExportToPdf', vm.params, { responseType: 'arraybuffer' })
//                 .then(function (resp) {
//                     var data = new Blob([resp.data], { type: 'application/pdf' });
//                     saveAs(data, "Applications.pdf");
//                 },
//                     function (response) {
//                     });
//         };
//         vm.exportCSV = function () {
//             $http.post($rootScope.app.httpSource + 'api/Application/ExportCSV', vm.params)
//                 .then(function (resp) {
//                     var myBlob = new Blob([resp.data], { type: 'text/html' });
//                     var url = window.URL.createObjectURL(myBlob);
//                     var a = document.createElement("a");
//                     document.body.appendChild(a);
//                     a.href = url;
//                     a.download = "Applications.csv";
//                     a.click();
//                     window.URL.revokeObjectURL(url);
//                 },
//                     function (response) {
//                     });
//         };

//         vm.checkViolations = function () {
//             $http.get($rootScope.app.httpSource + 'api/Visit/GetViolations')
//                 .then(function (response) {
//                     vm.violationList = response.data;

//                     if (vm.violationList.length > 0) {
//                         if (vm.violationList[0].establishment != null && vm.violationList[0].establishment.licenseNumber != '900098_9') {
//                             var warningMessage = vm.translateFilter('inspection.warningMsgPartOne') + $filter('localizeString')(vm.violationList[0].establishment) +
//                                 vm.translateFilter('inspection.warningMsgPartTwo') + vm.violationList[0].establishment.licenseNumber + vm.translateFilter('inspection.warningMsgPartThree') +
//                                 moment(vm.violationList[0].createdOn).format('DD-MMMM-YYYY') + vm.translateFilter('inspection.warningMsgPartFour');
//                         }
//                         else {
//                             var warningMessage = vm.translateFilter('inspection.warningMsgPartFive') + (vm.violationList[0].userProfile.user.email) +
//                                 vm.translateFilter('inspection.warningMsgPartThree') +
//                                 moment(vm.violationList[0].createdOn).format('DD-MMMM-YYYY') + vm.translateFilter('inspection.warningMsgPartFour');
//                         }
                        
//                         SweetAlert.swal({
//                             title: vm.translateFilter('inspection.warning'),
//                             text: warningMessage,
//                             type: "warning",
//                             confirmButtonText: vm.translateFilter('general.ok')
//                         });
//                     }
//                 });
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

//         if (vm.user.userTypeCode == "06") {
//             vm.dtApplicationColumns = [
//                 DTColumnBuilder.newColumn('applicationNumber').withTitle(vm.translateFilter('dashboard.applicationNumber')),
//                 DTColumnBuilder.newColumn('id').notVisible(),
//                 DTColumnBuilder.newColumn('service').withTitle(vm.translateFilter('dashboard.service')).renderWith(
//                     function (data, type) {
//                         return $filter('localizeString')(data);
//                     }),
//                 DTColumnBuilder.newColumn(null).withOption('defaultContent', ' ').withTitle(vm.translateFilter('address.Emirate')).renderWith(
//                     function (data, type) {
//                         if (data.user.userProfiles.length > 0) {

//                             if (data.user.userProfiles[0].userTypeId == 26) {
//                                 var community = $filter('filter')(vm.communities, { id: data.user.userProfiles[0].address.communityId }, true)[0];
//                                 return $filter('localizeString')(community.region.emirate);
//                             }

//                             if (data.user.userProfiles[0].userTypeId != 1 && data.user.userProfiles[0].userTypeId != 20) {
//                                 if (data.establishment != null) {
//                                 var community = $filter('filter')(vm.communities, { id: data.establishment.address.communityId }, true)[0];
//                                     return $filter('localizeString')(community.region.emirate);
//                                 }
//                             }
//                             else {
//                                 var community = $filter('filter')(vm.communities, { id: data.user.userProfiles[0].address.communityId }, true)[0];
//                                 return $filter('localizeString')(community.region.emirate);
//                             }
//                         };
//                     }),
//                 DTColumnBuilder.newColumn(null).withOption('defaultContent', ' ').withTitle(vm.translateFilter('completeProfile.establishmentName')).renderWith(
//                     function (data, type) {
//                         if (data.establishment != null) {
//                             var community = $filter('filter')(vm.communities, { id: data.establishment.address.communityId }, true)[0];
//                             return $filter('localizeString')(data.establishment);
//                         }
//                         else {
//                             return data.user.userProfiles[0].person.name;
//                         }
//                     }),
//                 DTColumnBuilder.newColumn(null).withTitle(vm.translateFilter('dashboard.createdOn')).renderWith(
//                     function (data, type) {
//                         return moment(data.applicationDetails[data.applicationDetails.length - 1].createdOn).format('DD-MMMM-YYYY');
//                     }),
//                 DTColumnBuilder.newColumn('applicationDetails').withTitle(vm.translateFilter('dashboard.applicationStatus')).renderWith(
//                     function (data, type) {
//                         return $filter('localizeString')(data[data.length - 1].applicationStatus);
//                     }),
//                 DTColumnBuilder.newColumn(null).withTitle(vm.translateFilter('dashboard.consumedTimeLabel')).renderWith(
//                     function (data, type) {
//                         return moment.duration(data.applicationDetails[data.applicationDetails.length - 1].consumedTime, "minutes").format("d [" + vm.translateFilter('dashboard.days') +
//                             "], h [" + vm.translateFilter('dashboard.hours') + "], m [" + vm.translateFilter('dashboard.minutes') + "]");
//                     }).notSortable(),
//                 DTColumnBuilder.newColumn(null).withOption('defaultContent', ' ').withTitle(vm.translateFilter('dashboard.subService')).renderWith(
//                     function (data, type) {
//                         if (data.serviceId == 2) {
//                             return $filter('localizeString')(data.applicationDetails[0].printingPermits[0].publicationType);
//                         }
//                         else if (data.serviceId == 10) {
//                             return $filter('localizeString')(data.applicationDetails[0].circulationMediaMaterials[0].artistWorkType.mediaMaterialType);
//                         }
//                         else {
//                             return '';
//                         }
//                     }),
//                 DTColumnBuilder.newColumn(null).withTitle(vm.translateFilter('general.actions')).notSortable()
//                     .renderWith(actionsHtml),
//                 DTColumnBuilder.newColumn(null).withTitle(vm.translateFilter('general.procedures')).notSortable()
//                     .renderWith(workflowActionsHtml),
//                 DTColumnBuilder.newColumn(null).withTitle('').notSortable().renderWith(moreDetailsHtml).withOption('width', '20px')];

//             $http.get($rootScope.app.httpSource + 'api/UserFilter?menuId=' + 14)
//                 .then(function (response) {
//                     vm.userFilters = response.data;
//                 });
//         }
//         else {
//             vm.checkViolations();

//             vm.dtApplicationColumns = [
//                 DTColumnBuilder.newColumn('applicationNumber').withTitle(vm.translateFilter('dashboard.applicationNumber')),
//                 DTColumnBuilder.newColumn('id').notVisible(),
//                 DTColumnBuilder.newColumn('service').withTitle(vm.translateFilter('dashboard.service')).renderWith(
//                     function (data, type) {
//                         return $filter('localizeString')(data);
//                     }),
//                 DTColumnBuilder.newColumn(null).withOption('defaultContent', ' ').withTitle(vm.translateFilter('address.Emirate')).renderWith(
//                     function (data, type) {

//                         if (data.user.userProfiles[0].userTypeId == 26) {
//                             var community = $filter('filter')(vm.communities, { id: data.user.userProfiles[0].address.communityId }, true)[0];
//                             return $filter('localizeString')(community.region.emirate);
//                         }

//                         if (data.user.userProfiles[0].userTypeId != 1) {
//                             if (data.establishment != null) {
//                             var community = $filter('filter')(vm.communities, { id: data.establishment.address.communityId }, true)[0];
//                                 return $filter('localizeString')(community.region.emirate);
//                             }
//                         }
//                         else {
//                             var community = $filter('filter')(vm.communities, { id: data.user.userProfiles[0].address.communityId }, true)[0];
//                             return $filter('localizeString')(community.region.emirate);
//                         };
//                     }),
//                 DTColumnBuilder.newColumn(null).withOption('defaultContent', ' ').withTitle(vm.translateFilter('completeProfile.establishmentName')).renderWith(
//                     function (data, type) {
//                         if (data.establishment != null) {
//                             var community = $filter('filter')(vm.communities, { id: data.establishment.address.communityId }, true)[0];
//                             return $filter('localizeString')(data.establishment);
//                         }
//                         else {
//                             return data.user.userProfiles[0].person.name;
//                         }
//                     }),
//                 DTColumnBuilder.newColumn(null).withTitle(vm.translateFilter('dashboard.createdOn')).renderWith(
//                     function (data, type) {
//                         if ((data.applicationDetails[data.applicationDetails.length - 1].applicationStatusId != 4 &&
//                             data.applicationDetails[data.applicationDetails.length - 1].applicationStatusId != 10) || data.applicationDetails.length == 1) {
//                             return moment(data.applicationDetails[data.applicationDetails.length - 1].createdOn).format('DD-MMMM-YYYY');
//                         }
//                         else {
//                             for (var i = data.applicationDetails.length - 1; i >= 0; i--) {
//                                 if (data.applicationDetails[i].applicationTypeId != 3 && data.applicationDetails[i].applicationStatusId == 4) {
//                                     return moment(data.applicationDetails[i].createdOn).format('DD-MMMM-YYYY');
//                                 }
//                             }
//                         }
//                     }),
//                 DTColumnBuilder.newColumn('applicationDetails').withTitle(vm.translateFilter('dashboard.applicationStatus')).renderWith(
//                     function (data, type) {
//                         if ((data[data.length - 1].applicationStatusId != 4 && data[data.length - 1].applicationStatusId != 10 && data[data.length - 1].applicationStatusId != 11) || data.length == 1) {
//                             return $filter('localizeString')(data[data.length - 1].applicationStatus);
//                         }
//                         else {
//                             for (var i = data.length - 1; i >= 0; i--) {
//                                 if (data[i].applicationTypeId != 3 && data[i].applicationStatusId == 4) {
//                                     return $filter('localizeString')(data[i].applicationStatus);
//                                 }
//                             }
//                         }
//                     }),
//                 DTColumnBuilder.newColumn(null).withTitle(vm.translateFilter('general.actions')).notSortable()
//                     .renderWith(actionsHtml),
//                 DTColumnBuilder.newColumn(null).withTitle(vm.translateFilter('general.procedures')).notSortable().renderWith(workflowActionsHtml),
//                 DTColumnBuilder.newColumn(null).withTitle('').notSortable().renderWith(moreDetailsHtml).withOption('width', '20px')];
//         }

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

//             if (vm.isTemporaryDelete === undefined) {
//                 if (vm.user.userTypeCode == "06") {
//                     $http.get($rootScope.app.httpSource + 'api/UserFilter/GetDefaultUserFilter?menuId=' + 14)
//                         .then(function (responseFilter) {
//                             vm.defaultUserFilter = responseFilter.data;

//                             if (vm.defaultUserFilter != null) {
//                                 if (vm.params.filterParams == null) {
//                                     vm.params.filterParams = {};
//                                     vm.params.filterParams.userFilterId = vm.defaultUserFilter.id;

//                                     if (vm.filterParams == null) {
//                                         vm.filterParams = {};
//                                         vm.filterParams.userFilterId = vm.defaultUserFilter.id;
//                                     }
//                                 }
//                             }

//                             $http.post($rootScope.app.httpSource + 'api/Application/GetApplications', vm.params)
//                                 .then(function (resp) {
//                                     if (vm.communities == undefined || vm.communities.length == 0) {
//                                         $http.get($rootScope.app.httpSource + 'api/Community/GetCommunities')
//                                             .then(function (response) {
//                                                 vm.communities = response.data;

//                                                 vm.applications = resp.data.content;
//                                                 vm.applicationDetails = [];
//                                                 for (var i = 0; i < vm.applications.length; i++) {
//                                                     for (var j = 0; j < vm.applications[i].applicationDetails.length; j++) {
//                                                         vm.applicationDetails.push(vm.applications[i].applicationDetails[j]);
//                                                     }
//                                                 }
//                                                 var records = {
//                                                     'draw': draw,
//                                                     'recordsTotal': resp.data.totalRecords,
//                                                     'recordsFiltered': resp.data.totalRecords,
//                                                     'data': resp.data.content
//                                                 };
//                                                 fnCallback(records);
//                                             });
//                                     }
//                                     else {
//                                         vm.applications = resp.data.content;
//                                         vm.applicationDetails = [];
//                                         for (var i = 0; i < vm.applications.length; i++) {
//                                             for (var j = 0; j < vm.applications[i].applicationDetails.length; j++) {
//                                                 vm.applicationDetails.push(vm.applications[i].applicationDetails[j]);
//                                             }
//                                         }
//                                         var records = {
//                                             'draw': draw,
//                                             'recordsTotal': resp.data.totalRecords,
//                                             'recordsFiltered': resp.data.totalRecords,
//                                             'data': resp.data.content
//                                         };
//                                         fnCallback(records);
//                                     }
//                                 },
//                                     function (response) {
//                                         var records = {
//                                             'draw': draw,
//                                             'recordsTotal': 0,
//                                             'recordsFiltered': 0,
//                                             'data': []
//                                         };
//                                         fnCallback(records);
//                                     });
//                         });
//                 }
//                 else {
//                     $http.post($rootScope.app.httpSource + 'api/Application/GetApplications', vm.params)
//                         .then(function (resp) {
//                             if (vm.communities == undefined || vm.communities.length == 0) {
//                                 $http.get($rootScope.app.httpSource + 'api/Community/GetCommunities')
//                                     .then(function (response) {
//                                         vm.communities = response.data;

//                                         vm.applications = resp.data.content;
//                                         vm.applicationDetails = [];
//                                         for (var i = 0; i < vm.applications.length; i++) {
//                                             for (var j = 0; j < vm.applications[i].applicationDetails.length; j++) {
//                                                 vm.applicationDetails.push(vm.applications[i].applicationDetails[j]);
//                                             }
//                                         }
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
//                                 vm.applications = resp.data.content;
//                                 vm.applicationDetails = [];
//                                 for (var i = 0; i < vm.applications.length; i++) {
//                                     for (var j = 0; j < vm.applications[i].applicationDetails.length; j++) {
//                                         vm.applicationDetails.push(vm.applications[i].applicationDetails[j]);
//                                     }
//                                 }
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
//                 }
//             }
//             else if (vm.isTemporaryDelete === true) {
//                 var records = {
//                     'draw': draw,
//                     'recordsTotal': vm.applications.length,
//                     'recordsFiltered': vm.applications.length,
//                     'data': vm.applications
//                 };
//                 fnCallback(records);
//             }
//         }

//         function createdRow(row, data, dataIndex) {
//             if (data.applicationDetails[0].applicationStatus.id != 4 && data.applicationDetails[0].applicationStatus.id != 10 && data.applicationDetails[0].applicationStatus.id != 11 &&
//                 vm.user.userTypeCode == "06" && data.applicationDetails[0].payments.length > 0) {
//                 var urgentService = $filter('filter')(data.applicationDetails[0].payments[0].paymentDetails, { nameEn: 'Urgent Service Fee' }, true)[0];
//                 if (urgentService != null) {
//                     $(row).addClass('urgent');
//                 }
//             }

//             if (data.serviceId == 11 && data.applicationDetails[0].circulationMediaMaterials[0].parentId != null) {
//                 $(row).addClass('recurring');
//             }

//             if (data.applicationDetails.length > 1) {
//                 if (vm.user.userTypeCode == "06") {
//                     $('td', row).eq(10).addClass('wrapperStyle');
//                 }
//                 else {
//                     $('td', row).eq(8).addClass('wrapperStyle');
//                 }
//             }

//             if (data.applicationDetails[data.applicationDetails.length - 1].mediaLicenses[0]) {
//                 var applicationDetailIndex = data.applicationDetails.length - 1;

//                 if (data.applicationDetails[data.applicationDetails.length - 1].applicationStatusId == 4 && data.applicationDetails.length > 1) {
//                     for (var i = data.applicationDetails.length - 1; i >= 0; i--) {
//                         if (data.applicationDetails[i].applicationTypeId != 3 && data.applicationDetails[i].applicationTypeId != 4 && data.applicationDetails[i].applicationTypeId != 5) {
//                             applicationDetailIndex = i;
//                             break;
//                         }
//                     }
//                 }

//                 if (data.applicationDetails[applicationDetailIndex].certificates.length > 0) {
//                     var numberOfExpiredActivities = 0;
//                     var numberOfActivitiesExpireSoon = 0;
//                     var numberOfCancelledActivities = 0;

//                     for (var i = 0; i < data.applicationDetails[applicationDetailIndex].certificates[0].certificateDetails.length; i++) {
//                         var date = moment(data.applicationDetails[applicationDetailIndex].certificates[0].certificateDetails[i].expiryDate);
//                         var now = moment();
//                         var futureMonth = moment(now).add(1, 'M');

//                         if (date < now && data.applicationDetails[applicationDetailIndex].certificates[0].certificateDetails[i].mediaLicenseEconomicActivity.cancelledDate == null) {
//                             numberOfExpiredActivities++;
//                         }

//                         if (date < futureMonth && data.applicationDetails[applicationDetailIndex].certificates[0].certificateDetails[i].mediaLicenseEconomicActivity.cancelledDate == null) {
//                             numberOfActivitiesExpireSoon++;
//                         }

//                         if (data.applicationDetails[applicationDetailIndex].certificates[0].certificateDetails[i].mediaLicenseEconomicActivity.cancelledDate != null) {
//                             numberOfCancelledActivities++;
//                         }
//                     }

//                     if (data.applicationDetails[applicationDetailIndex].certificates[0].certificateDetails.length == numberOfExpiredActivities) {
//                         if (vm.user.userTypeCode == "06") {
//                             $('td', row).eq(7).addClass('expiredStyle');
//                         }
//                         else {
//                             $('td', row).eq(5).addClass('expiredStyle');
//                         }
//                     }
//                     else if (data.applicationDetails[applicationDetailIndex].certificates[0].certificateDetails.length > numberOfExpiredActivities && numberOfExpiredActivities > 0) {
//                         if (vm.user.userTypeCode == "06") {
//                             $('td', row).eq(7).addClass('partiallyExpiredStyle');
//                         }
//                         else {
//                             $('td', row).eq(5).addClass('partiallyExpiredStyle');
//                         }
//                     }
//                     else if (numberOfActivitiesExpireSoon > 0) {
//                         if (vm.user.userTypeCode == "06") {
//                             $('td', row).eq(7).addClass('expiresSoonStyle');
//                         }
//                         else {
//                             $('td', row).eq(5).addClass('expiresSoonStyle');
//                         }
//                     }
//                     else if (data.applicationDetails[applicationDetailIndex].certificates[0].certificateDetails.length == numberOfCancelledActivities) {
//                         if (vm.user.userTypeCode == "06") {
//                             $('td', row).eq(7).addClass('cancelledStyle');
//                         }
//                         else {
//                             $('td', row).eq(5).addClass('cancelledStyle');
//                         }
//                     }
//                 }
//             }

//             $compile(angular.element(row).contents())($scope);
//         };

//         function rowCallback(tabRow, data, dataIndex) {
//             if (data.applicationDetails.length > 1) {
//                 $(tabRow.lastChild.children[0]).unbind('click');
//                 $(tabRow.lastChild.children[0]).on('click', data, function (event) {
//                     var tr = $(tabRow);
//                     var table = vm.dtApplicationInstance.DataTable;
//                     var row = table.row(tr);

//                     if (event.data.applicationDetails.length > 1) {
//                         if (row.child.isShown()) {
//                             // This row is already open - close it
//                             var index = vm.applications.indexOf(event.data);
//                             var childs = row.child;
//                             tr.removeClass('shown');
//                             $('tr.slider' + index)
//                                 .children('td, th')
//                                 .animate({ padding: 0 })
//                                 .wrapInner('<div />')
//                                 .children()
//                                 .slideUp(function () { $(this).closest('tr').remove(); childs.hide() });
//                         }
//                         else {
//                             // Open this row
//                             row.child(format(event.data)).show();
//                             tr.addClass('shown');
//                         }
//                     }
//                 });
//             }
//         };

//         function format(dRow) {
//             //is there a better way?!
//             var html2 = '';
//             var index = vm.applications.indexOf(dRow);
//             var applicationDetailIndex;
//             if (vm.user.userTypeCode == "06") {
//                 for (var i = 0; i < dRow.applicationDetails.length; i++) {
//                     applicationDetailIndex = vm.applicationDetails.indexOf(dRow.applicationDetails[i]);
//                     html2 += '<tr role="row" class="bg-gray slider' + index + '"><td></td><td><b>' + vm.translateFilter('dashboard.mediaLicenseNumber') + ': ' +
//                         dRow.applicationDetails[i].mediaLicenses[0].mediaLicenseNumber + '</b></td><td colspan="2"><b>' + vm.translateFilter('dashboard.applicationType') + ': ' +
//                         $filter('localizeString')(dRow.applicationDetails[i].applicationType) + '</b></td><td>' + moment(dRow.applicationDetails[i].createdOn).format('DD-MMMM-YYYY') +
//                         '</td><td>' + $filter('localizeString')(dRow.applicationDetails[i].applicationStatus) + '</td><td>' + moment.duration(dRow.applicationDetails[i].consumedTime,
//                             "minutes").format("d [" + vm.translateFilter('dashboard.days') + "], h [" + vm.translateFilter('dashboard.hours') + "], m [" +
//                                 vm.translateFilter('dashboard.minutes') + "]") + '</td><td></td><td>' + vm.bindButtons(dRow.applicationDetails[i], dRow.service) +
//                         '</td><td colspan="2"></td></tr>';
//                 }
//             }
//             else {
//                 for (var i = 0; i < dRow.applicationDetails.length; i++) {
//                     applicationDetailIndex = vm.applicationDetails.indexOf(dRow.applicationDetails[i]);
//                     html2 += '<tr role="row" class="bg-gray slider' + index + '"><td></td><td><b>' + vm.translateFilter('dashboard.mediaLicenseNumber') + ': ' +
//                         dRow.applicationDetails[i].mediaLicenses[0].mediaLicenseNumber + '</b></td><td colspan="2"><b>' + vm.translateFilter('dashboard.applicationType') + ': ' +
//                         $filter('localizeString')(dRow.applicationDetails[i].applicationType) + '</b></td><td>' + moment(dRow.applicationDetails[i].createdOn).format('DD-MMMM-YYYY') +
//                         '</td><td>' + $filter('localizeString')(dRow.applicationDetails[i].applicationStatus) + '</td><td>' + vm.bindButtons(dRow.applicationDetails[i], dRow.service) +
//                         '</td><td colspan="2"></td></tr>';
//                 }
//             }
//             return $compile(html2)($scope);
//         }

//         function workflowActionsHtml(data, type, full, meta) {
//             var htmlSection;
//             var index = vm.applications.indexOf(data);

//             if ((data.applicationDetails[data.applicationDetails.length - 1].applicationStatusId != 4 &&
//                 data.applicationDetails[data.applicationDetails.length - 1].applicationStatusId != 10 &&
//                 data.applicationDetails[data.applicationDetails.length - 1].applicationStatusId != 11) ||
//                 data.applicationDetails.length == 1) {
//                 htmlSection = '<div style="display:inline-block" class=""><workflow-action ng-model="dashboard.applications[' + index + '].applicationDetails[' +
//                     (data.applicationDetails.length - 1) + ']" dtapplicationinstance="dashboard.dtApplicationInstance" application="dashboard.applications[' + index +
//                     ']"></workflow-action></div>';
//             }
//             else {
//                 for (var i = data.applicationDetails.length - 1; i >= 0; i--) {
//                     if (data.applicationDetails[i].applicationTypeId != 3 && data.applicationDetails[i].applicationTypeId != 4 && data.applicationDetails[i].applicationTypeId != 5 && data.applicationDetails[i].applicationStatusId == 4) {
//                         htmlSection = '<div style="display:inline-block" class=""><workflow-action ng-model="dashboard.applications[' + index + '].applicationDetails[' + i +
//                             ']" dtapplicationinstance="dashboard.dtApplicationInstance" application="dashboard.applications[' + index + ']"></workflow-action></div>';
//                         break;
//                     }
//                 }
//             }

//             return htmlSection;
//         };

//         function moreDetailsHtml(data, type, full, meta) {
//             var htmlSection = '';
//             var index = vm.applications.indexOf(data);
//             if (data.applicationDetails.length > 1) {
//                 htmlSection = '<div style="display:inline-block" class="list-iconMore"><div class="inline" style="color:white;"><em class="fa fa-arrow-circle-down" style="cursor:pointer;" uib-tooltip="' +
//                     $filter('translate')("dashboard.moreDetails") + '"></em></div></div>';
//             }
//             return htmlSection;
//         };

//         function actionsHtml(data, type, full, meta) {

//             if ((data.applicationDetails[data.applicationDetails.length - 1].applicationStatusId != 4 &&
//                 data.applicationDetails[data.applicationDetails.length - 1].applicationStatusId != 10 &&
//                 data.applicationDetails[data.applicationDetails.length - 1].applicationStatusId != 11) ||
//                 data.applicationDetails.length == 1) {
//                 return vm.bindButtons(data.applicationDetails[data.applicationDetails.length - 1], data.service);
//             }
//             else {
//                 for (var i = data.applicationDetails.length - 1; i >= 0; i--) {
//                     if (data.applicationDetails[i].applicationTypeId != 3 && data.applicationDetails[i].applicationTypeId != 4 && data.applicationDetails[i].applicationTypeId != 5 && data.applicationDetails[i].applicationStatusId == 4) {
//                         return vm.bindButtons(data.applicationDetails[i], data.service);
//                     }
//                 }
//             }

//         };

//         vm.bindButtons = function (data, service) {
//             var checkedOutApplicationNumber = '';
//             if ($filter('filter')(vm.applications, { id: data.applicationId }, true)[0]) {
//                 checkedOutApplicationNumber = $filter('filter')(vm.applications, { id: data.applicationId }, true)[0].applicationNumber;
//             }

//             var htmlSection = '';

//             var editButton = '<div class="inline" ng-click="dashboard.edit(' + data.applicationId + ',' + data.id + ',' + data.applicationTypeId + ',\'' + service.code + '\',\'' +
//                 service.serviceCategory.code + '\')"><em class="fa fa-pencil" style="cursor:pointer" uib-tooltip="' + vm.translateFilter('general.edit') + '"></em></div>';
//             var receiptButton = '<div class="inline" ng-click="dashboard.printReceipt(' + data.id + ')"><em class="fa fa-print" style="cursor:pointer" uib-tooltip="' +
//                 vm.translateFilter('general.receipt') + '"></em></div>';
//             var deleteButton = '<div class="inline" ng-click="dashboard.delete(' + data.id + ', $event)"><em class="fa fa-trash" style="cursor:pointer" uib-tooltip="' +
//                 vm.translateFilter('general.delete') + '"></em></div>';
//             var actionListButton = '<div class="inline" ng-click="dashboard.actionList(' + data.id + ',\'lg\')"><em class="fa fa-sitemap" style="cursor:pointer" ' +
//                 'uib-tooltip="' + vm.translateFilter('general.procedureList') + '"></em></div>';
//             var reviewButton = '<div class="inline" ng-click="dashboard.review(' + data.id + ',\'' + service.code + '\',\'' + service.serviceCategory.code +
//                 '\')"><em class="fa fa-search" style="cursor:pointer" uib-tooltip="' + vm.translateFilter('general.review') + '"></em></div>';
//             var reportButton = '<div class="inline" ng-click="dashboard.printControllerReport(' + data.id + ')"><em class="fa fa-flag" style="cursor:pointer" uib-tooltip="' +
//                 vm.translateFilter('mediaMaterialApproval.controllerReport') + '"></em></div>';
//             var checkOutButton = '<div class="inline" ng-click="dashboard.checkout(' + data.id + ',\'' + checkedOutApplicationNumber + '\',\'' + service.serviceCategory.code +
//                 '\')"><em class="fa fa-download" style="cursor:pointer; color:red" uib-tooltip="' + vm.translateFilter('general.checkout') + '"></em></div>';
//             var checkInButton = '<div class="inline" ng-click="dashboard.checkin(' + data.id + ',\'' + checkedOutApplicationNumber + '\',\'' + service.serviceCategory.code +
//                 '\')"><em class="fa fa-upload" style="cursor:pointer; color:lightgreen" uib-tooltip="' + vm.translateFilter('general.checkin') + '"></em></div>';
//             var forceCheckInButton = '';

//             if (data.checks && data.checks.length > 0 && (data.checks[data.checks.length - 1].actionId === 64 || data.checks[data.checks.length - 1].actionId === 67 || data.checks[data.checks.length - 1].actionId === 70)) {
//                 if (data.checks[data.checks.length - 1].user.email !== vm.user.username) {
//                     forceCheckInButton = '<div class="inline" ng-click="dashboard.forceCheckIn(' + data.id + ',\'' + checkedOutApplicationNumber + '\',\'' +
//                         service.serviceCategory.code + '\',\'' + data.checks[data.checks.length - 1].user.firstName + ' ' + data.checks[data.checks.length - 1].user.lastName.replace('\'', '') +
//                         '\')"><em class="fa fa-bolt" style="cursor: pointer; color: red" uib-tooltip="' + vm.translateFilter('general.forceCheckIn') + '"></em></div>';
//                 }
//             }

//             if (data.applicationStatus.id == 1) {
//                 if (vm.user.userTypeCode != "06") {
//                     if (data.payments.length > 0 && data.payments[0].paymentStatusId == 3) {
//                         htmlSection = editButton + receiptButton;
//                     }
//                     else {
//                         htmlSection = editButton + deleteButton;
//                     }
//                 }
//                 else {
//                     htmlSection = actionListButton + reviewButton;
//                 }
//             }
//             else if (data.applicationStatus.id == 9) {
//                 if (vm.user.userTypeCode != "06") {
//                     if (data.payments.length > 0 && data.payments[0].paymentStatusId == 3) {
//                         htmlSection = editButton + receiptButton;
//                     }
//                     else {
//                         htmlSection = editButton + deleteButton;
//                     }
//                 }
//                 else {
//                     htmlSection = actionListButton;
//                 }
//             }
//             else if (data.applicationStatus.id == 3 && service.serviceCategory.code == 'MC') {
//                 if (vm.user.userTypeCode != "06") {
//                     htmlSection = deleteButton + reviewButton;
//                 }
//                 else {
//                     htmlSection = actionListButton + reviewButton;
//                 }
//             }
//             else if (data.payments.length > 0 && data.payments[0].paymentStatusId == 3) {
//                 if (vm.user.userTypeCode != "06") {
//                     htmlSection = reviewButton + receiptButton;
//                 }
//                 else {
//                     htmlSection = reviewButton + actionListButton + receiptButton;
//                     if (service.serviceCategory.code == "MC") {

//                         var report = null;

//                         for (var i = 0; i < data.actionsTakens.length; i++) {
//                             if (data.actionsTakens[i].report != null) {
//                                 report = data.actionsTakens[i].report;
//                             }
//                         }

//                         if (report) {
//                             htmlSection += reportButton;
//                         }
//                     }

//                     if (data.applicationStatus.id === 2) {
//                         if (data.checks && data.checks.length > 0 && data.checks[data.checks.length - 1].actionId === 64) {
//                             if (data.checks[data.checks.length - 1].user.email === vm.user.username) {
//                                 htmlSection += checkInButton;
//                             }
//                             else {
//                                 htmlSection += forceCheckInButton;
//                             }
//                         }
//                         else {
//                             htmlSection += checkOutButton;
//                         }
//                     }
//                 }
//             }
//             else if (data.applicationStatus.id === 2 && vm.user.userTypeCode == "06") {
//                 htmlSection = reviewButton + actionListButton;
//                 if (data.checks && data.checks.length > 0 && (data.checks[data.checks.length - 1].actionId === 64 || data.checks[data.checks.length - 1].actionId === 67 || data.checks[data.checks.length - 1].actionId === 70)) {
//                     if (data.checks[data.checks.length - 1].user.email === vm.user.username) {
//                         htmlSection += checkInButton;
//                     }
//                     else {
//                         htmlSection += forceCheckInButton;
//                     }
//                 }
//                 else {
//                     htmlSection += checkOutButton;
//                 }
//             }
//             else {
//                 if (vm.user.userTypeCode != "06") {
//                     htmlSection = reviewButton;
//                 }
//                 else {
//                     htmlSection = reviewButton + actionListButton;
//                 }
//             }

//             htmlSection = htmlSection.replace(/^/, '<div style="display:inline-block" class="list-icon">');
//             htmlSection += '</div>';

//             return htmlSection;
//         };

//         vm.printReceipt = function (applicationDetailId) {
//             var applicationDetail = null;
//             for (var i = 0; i < vm.applications.length; i++) {
//                 applicationDetail = $filter('filter')(vm.applications[i].applicationDetails, { id: applicationDetailId }, true)[0];
//                 if (applicationDetail != null) break;
//             }

//             if (vm.user.userTypeCode == '06') {
//                 SweetAlert.swal({
//                     title: vm.translateFilter('dashboard.pleaseSelectTheReceiptType'),
//                     text: "",
//                     type: "warning",
//                     showCancelButton: true,
//                     confirmButtonColor: "#DD6B55",
//                     confirmButtonText: vm.translateFilter('dashboard.receiptWithHeader'),
//                     cancelButtonText: vm.translateFilter('dashboard.receiptWithoutHeader'),
//                     closeOnConfirm: true,
//                     closeOnCancel: true
//                 },
//                     function (isConfirm) {
//                         if (isConfirm) {
//                             $window.open(applicationDetail.payments[0].paymentReceiptWithHeaderFullUrl, '_blank');
//                         } else {
//                             $window.open(applicationDetail.payments[0].paymentReceiptFullUrl, '_blank');
//                         }
//                     });
//             }
//             else {
//                 $window.open(applicationDetail.payments[0].paymentReceiptWithHeaderFullUrl, '_blank');
//             }
//         }

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

//         vm.applicationDetail = function (applicationDetailId) {
//             var applicationDetail = null;
//             for (var i = 0; i < vm.applications.length; i++) {
//                 applicationDetail = $filter('filter')(vm.applications[i].applicationDetails, { id: applicationDetailId }, true)[0];
//                 if (applicationDetail != null) return applicationDetail;
//             }
//         }

//         vm.application = function (applicationDetailId) {
//             var applicationDetail = null;
//             for (var i = 0; i < vm.applications.length; i++) {
//                 applicationDetail = $filter('filter')(vm.applications[i].applicationDetails, { id: applicationDetailId }, true)[0];
//                 if (applicationDetail != null) return applicationDetail;
//             }
//         }

//         vm.edit = function (applicationId, Id, applicationTypeId, serviceCode, serviceCategoryCode) {
//             if (serviceCategoryCode == 'ML') {
//                 switch (serviceCode) {
//                     case "01":
//                         $state.go('app.MediaLicenseServices.JournalistsAppointmentIssuePressCard', { id: Id });
//                         break;

//                     case "02":
//                         $state.go('app.MediaLicenseServices.GroundPhotographyPermit', { id: Id });
//                         break;

//                     case "03":
//                         $state.go('app.MediaLicenseServices.RadioTVBroadcastingLicense', { id: Id });
//                         break;

//                     case "04":

//                         if (applicationTypeId == 2) {
//                             $state.go('app.MediaLicenseServices.RenewMediaLicense', { applicationId: applicationId, applicationDetailId: Id, edit: true });
//                         }
//                         else if (applicationTypeId == 4) {
//                             return; //$state.go('app.MediaLicenseServices.CancelMediaActivity', { applicationId: applicationId, applicationDetailId: Id, edit: true });
//                         }
//                         else if (applicationTypeId == 5) {
//                             $state.go('app.MediaLicenseServices.ChangePartners', { applicationId: applicationId, applicationDetailId: Id, edit: true });
//                         }
//                         else {
//                             $state.go('app.MediaLicenseServices.MediaLicense', { id: Id });
//                         }

//                         break;

//                     case "05":
//                         $state.go('app.MediaLicenseServices.NewspaperMagazineLicense', { id: Id });
//                         break;

//                     case "08":
//                         $state.go('app.MediaLicenseServices.EquipmentPermit', { id: Id });
//                         break;

//                     case "09":
//                         $state.go('app.MediaLicenseServices.AerialPhotographyPermit', { id: Id });
//                         break;
//                 }
//             }
//             if (serviceCategoryCode == 'MC') {
//                 switch (serviceCode) {
//                     case "01":
//                         $state.go('app.MediaContentServices.PublicationsPrintingPermit', { id: Id });
//                         break;

//                     case "02":
//                         $state.go('app.MediaContentServices.RegulateEntryMediaMaterial', { id: Id });
//                         break;

//                     case "03":
//                         $state.go('app.MediaContentServices.CirculationMediaMaterialPermit', { id: Id });
//                         break;

//                     case "04":
//                         $state.go('app.MediaContentServices.CirculationNewspaperMagazinePermit', { id: Id });
//                         break;
//                 }
//             }
//             if (serviceCategoryCode == 'FM') {
//                 switch (serviceCode) {
//                     case "01":
//                         $state.go('app.ForeignMediaServices.IssuePressCardForTheForeignReporter', { id: Id });
//                         break;
//                     case "02":
//                         $state.go('app.ForeignMediaServices.IssueSponsorship', { id: Id });
//                         break;
//                 }
//             }
//         };

//         $scope.timelineOpened = false;

//         vm.actionList = function (applicationDetailId, size) {
//             if (!$scope.timelineOpened) {
//                 var modalInstance = $uibModal.open({
//                     templateUrl: 'app/views/Employee/Timeline/timeline.html',
//                     controller: 'TimelineController',
//                     size: size,
//                     resolve: {
//                         applicationDetail: function () {
//                             return vm.applicationDetail(applicationDetailId);
//                         },
//                         application: function () {
//                             return $filter('filter')(vm.applications, { id: vm.applicationDetail(applicationDetailId).applicationId }, true)[0];;
//                         }
//                     }
//                 });

//                 modalInstance.result.then(function (establishmentBranch) {
//                     $scope.timelineOpened = false;
//                     if (vm.userProfile.establishment.establishments == undefined) {
//                         vm.userProfile.establishment.establishments = [];
//                     }
//                     vm.userProfile.establishment.establishments.push(establishmentBranch);
//                     vm.dtInstance.rerender();
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

//         vm.review = function (Id, serviceCode, serviceCategoryCode) {
//             if (serviceCategoryCode == 'ML') {
//                 switch (serviceCode) {
//                     case "01":
//                         $state.go('app.MediaLicenseServices.ReviewJournalistsAppointmentIssuePressCard', { id: Id });
//                         break;

//                     case "02":
//                         $state.go('app.MediaLicenseServices.ReviewGroundPhotographyPermit', { id: Id });
//                         break;

//                     case "03":
//                         $state.go('app.MediaLicenseServices.ReviewRadioTVBroadcastingLicense', { id: Id });
//                         break;

//                     case "04":
//                         $state.go('app.MediaLicenseServices.ReviewMediaLicense', { id: Id });
//                         break;

//                     case "05":
//                         $state.go('app.MediaLicenseServices.ReviewNewspaperMagazineLicense', { id: Id });
//                         break;

//                     case "06":
//                         $state.go('app.MediaLicenseServices.ReviewRepresentativeOffice', { id: Id });
//                         break;

//                     case "07":
//                         $state.go('app.MediaLicenseServices.ReviewBookNewspaper', { id: Id });
//                         break;

//                     case "08":
//                         $state.go('app.MediaLicenseServices.ReviewEquipmentPermit', { id: Id });
//                         break;

//                     case "09":
//                         $state.go('app.MediaLicenseServices.ReviewAerialPhotographyPermit', { id: Id });
//                         break;
//                 }
//             }
//             if (serviceCategoryCode == 'MC') {
//                 switch (serviceCode) {
//                     case "01":
//                         $state.go('app.MediaContentServices.ReviewPublicationsPrintingPermit', { id: Id });
//                         break;

//                     case "02":
//                         $state.go('app.MediaContentServices.ReviewRegulateEntryMediaMaterial', { id: Id });
//                         break;

//                     case "03":
//                         $state.go('app.MediaContentServices.ReviewCirculationMediaMaterialPermit', { id: Id });
//                         break;

//                     case "04":
//                         $state.go('app.MediaContentServices.ReviewCirculationNewspaperMagazinePermit', { id: Id });
//                         break;
//                 }
//             }
//             if (serviceCategoryCode == 'FM') {
//                 switch (serviceCode) {
//                     case "01":
//                         $state.go('app.ForeignMediaServices.ReviewIssuePressCardForTheForeignReporter', { id: Id });
//                         break;
//                     case "02":
//                         $state.go('app.ForeignMediaServices.ReviewSponsorship', { id: Id });
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
//         };

//         vm.checkout = function (id, applicationNumber, serviceCategoryCode) {
//             var translate = $filter('translate');
//             var checkUrl = '';
//             if (serviceCategoryCode === "MC") {
//                 checkUrl = $rootScope.app.httpSource + 'api/Check/CheckOutMCApplication?applicationDetailId=' + id;
//             }
//             else if (serviceCategoryCode === "ML") {
//                 checkUrl = $rootScope.app.httpSource + 'api/Check/CheckOutMLApplication?applicationDetailId=' + id;
//             }
//             else if (serviceCategoryCode === "FM") {
//                 checkUrl = $rootScope.app.httpSource + 'api/Check/CheckOutFMApplication?applicationDetailId=' + id;
//             }

//             SweetAlert.swal({
//                 title: translate('general.confirmCheckout'),
//                 text: translate('general.confirmCheckoutInfo') + ' (' + applicationNumber + ')',
//                 type: "warning",
//                 showCancelButton: true,
//                 confirmButtonColor: "#DD6B55",
//                 confirmButtonText: translate('visit.yes'),
//                 cancelButtonText: translate('visit.no'),
//                 closeOnConfirm: false,
//                 closeOnCancel: false
//             },
//                 function (isConfirm) {
//                     if (isConfirm) {
//                         //checkout

//                         $http.get(checkUrl)
//                             .then(function (response) {
//                                 vm.isBusy = false;
//                                 SweetAlert.swal(translate('general.checkout'), translate('general.successCheckout'), "success");
//                                 vm.dtApplicationInstance.DataTable.draw();
//                             },
//                                 function (response) { // optional
//                                     var errorMessage = '';
//                                     var errMsg = response.data.exceptionMessage.split(",");

//                                     if (response.status === 401 || response.data.exceptionMessage === "NotAuthorizedException") {
//                                         errorMessage = translate('general.notAuthorized');
//                                     }
//                                     else if (response.data.exceptionMessage === "ApplicationAlreadyCheckedInException") {
//                                         errorMessage = translate('general.alreadyCheckedIn');
//                                     }
//                                     else if (errMsg[0] === "ApplicationAlreadyCheckedOutException") {
//                                         errorMessage = translate('general.alreadyCheckedOut') + errMsg[1];
//                                     }
//                                     else {
//                                         errorMessage = translate('general.successCheckout');
//                                     }
//                                     SweetAlert.swal(translate('general.checkout'), errorMessage, "error");
//                                 });
//                     } else {
//                         SweetAlert.swal(translate('general.restoreBtn'), translate('general.restoreMessage'), "success");
//                     }
//                 });
//         };

//         vm.checkin = function (id, applicationNumber, serviceCategoryCode) {
//             var translate = $filter('translate');
//             var checkUrl = '';
//             if (serviceCategoryCode === "MC") {
//                 checkUrl = $rootScope.app.httpSource + 'api/Check/CheckInMCApplication?applicationDetailId=' + id;
//             }
//             else if (serviceCategoryCode === "ML") {
//                 checkUrl = $rootScope.app.httpSource + 'api/Check/CheckInMLApplication?applicationDetailId=' + id;
//             }
//             else if (serviceCategoryCode === "FM") {
//                 checkUrl = $rootScope.app.httpSource + 'api/Check/CheckInFMApplication?applicationDetailId=' + id;
//             }

//             SweetAlert.swal({
//                 title: translate('general.confirmCheckin'),
//                 text: translate('general.confirmCheckinInfo') + ' (' + applicationNumber + ')',
//                 type: "warning",
//                 showCancelButton: true,
//                 confirmButtonColor: "#DD6B55",
//                 confirmButtonText: translate('visit.yes'),
//                 cancelButtonText: translate('visit.no'),
//                 closeOnConfirm: false,
//                 closeOnCancel: false
//             },
//                 function (isConfirm) {
//                     if (isConfirm) {
//                         //checkout

//                         $http.get(checkUrl)
//                             .then(function (response) {
//                                 vm.isBusy = false;
//                                 SweetAlert.swal(translate('general.checkin'), translate('general.successCheckin'), "success");
//                                 vm.dtApplicationInstance.DataTable.draw();
//                             },
//                                 function (response) { // optional
//                                     SweetAlert.swal(translate('general.checkin'), translate('general.successCheckin'), "error");
//                                 });
//                     } else {
//                         SweetAlert.swal(translate('general.restoreBtn'), translate('general.restoreMessage'), "success");
//                     }
//                 });
//         };

//         vm.forceCheckIn = function (id, applicationNumber, serviceCategoryCode, checkedOutUser) {
//             var translate = $filter('translate');
//             var checkUrl = '';
//             if (serviceCategoryCode === "MC") {
//                 checkUrl = $rootScope.app.httpSource + 'api/Check/ForceCheckInMCApplication?applicationDetailId=' + id;
//             }
//             else if (serviceCategoryCode === "ML") {
//                 checkUrl = $rootScope.app.httpSource + 'api/Check/ForceCheckInMLApplication?applicationDetailId=' + id;
//             }
//             else if (serviceCategoryCode === "FM") {
//                 checkUrl = $rootScope.app.httpSource + 'api/Check/ForceCheckInFMApplication?applicationDetailId=' + id;
//             }

//             SweetAlert.swal({
//                 title: translate('general.confirmForceCheckOut') + checkedOutUser,
//                 text: translate('general.confirmForceCheckOutInfo') + ' (' + applicationNumber + ')',
//                 type: "warning",
//                 showCancelButton: true,
//                 confirmButtonColor: "#DD6B55",
//                 confirmButtonText: translate('general.forceCheckIn'),
//                 cancelButtonText: translate('visit.no'),
//                 closeOnConfirm: false,
//                 closeOnCancel: false
//             },
//                 function (isConfirm) {
//                     if (isConfirm) {
//                         //checkout

//                         $http.get(checkUrl)
//                             .then(function (response) {
//                                 vm.isBusy = false;
//                                 SweetAlert.swal(translate('general.forceCheckIn'), translate('general.successCheckout'), "success");
//                                 vm.dtApplicationInstance.DataTable.draw();
//                             },
//                                 function (response) { // optional
//                                     var errorMessage = '';
//                                     if (response.status === 401 || response.data.exceptionMessage === "NotAuthorizedException") {
//                                         errorMessage = translate('general.notAuthorized');
//                                     }
//                                     else if (response.data.exceptionMessage === "ApplicationAlreadyCheckedInException") {
//                                         errorMessage = translate('general.alreadyCheckedIn');
//                                     }
//                                     else {
//                                         errorMessage = translate('general.successCheckout');
//                                     }
//                                     SweetAlert.swal(translate('general.forceCheckIn'), errorMessage, "error");
//                                 });
//                     } else {
//                         SweetAlert.swal(translate('general.restoreBtn'), translate('general.restoreMessage'), "success");
//                     }
//                 });
//         };
//     }
// })();
