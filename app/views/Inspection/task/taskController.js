   (function () {
    'use strict';

    angular
        .module('eServices')
        .controller('taskController', taskController);

    taskController.$inject = ['$rootScope', '$scope', '$http', '$timeout', '$filter', '$compile', 'UserProfile'];

    function taskController($rootScope, $scope, $http, $timeout, $filter, $compile, UserProfile) {
        var vm = this;

        // Initialize variables
        vm.user = UserProfile.getProfile();
        vm.pageIndex = 0;
        vm.pageSize = 10;
        vm.totalPages = 0;
        vm.entries = [5, 10, 20, 30, 50];
        vm.selectedEntries = vm.entries[1];
        vm.searchText = '';
        vm.tasks = [];
        vm.emirates = [];
        vm.communities = [];
        var searchTimeout;

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

        // Function to get translated emirate name
        vm.getTranslatedEmirate = function (communityId) {
            var community = $filter('filter')(vm.communities, { id: communityId }, true)[0];
            return community ? (vm.language === 'ar' ? community.region.emirate.nameAr : community.region.emirate.nameEn) : '';
        };

        // Function to get translated community name
        vm.getTranslatedCommunity = function (communityId) {
            var community = $filter('filter')(vm.communities, { id: communityId }, true)[0];
            return community ? (vm.language === 'ar' ? community.nameAr : community.nameEn) : '';
        };

        // Loader function
        function loader() {
            var loaderHtml = '<div class="sk-cube-grid" style="position:fixed; top: 25%; right:47%; z-index:9999">' +
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
            angular.element('body').append($compile(loaderHtml)($scope));
        }

        // Function to remove loader
        function removeLoader() {
            angular.element('.sk-cube-grid').remove();
        }

        // Fetch tasks from the server
        vm.loadTasks = function () {
            loader(); // Show loader

            var params = {
                page: vm.pageIndex + 1,
                pageSize: vm.selectedEntries,
                searchtext: vm.searchText || null
            };

            $http.post($rootScope.app.httpSource + 'api/InspectionTask/GetInspectionTask', params)
                .then(function (response) {
                    vm.tasks = response.data.content;
                    vm.totalPages = Math.ceil(response.data.totalRecords / vm.selectedEntries);
                    removeLoader(); // Remove loader after loading tasks
                }, function (error) {
                    console.error('Error loading tasks', error);
                    removeLoader(); // Remove loader on error
                });
        };

        // Pagination control functions
        vm.previousPage = function () {
            if (vm.pageIndex > 0) {
                vm.pageIndex--;
                vm.loadTasks();
            }
        };

        vm.nextPage = function () {
            if (vm.pageIndex < vm.totalPages - 1) {
                vm.pageIndex++;
                vm.loadTasks();
            }
        };

        vm.goToPage = function (pageIndex) {
            if (pageIndex >= 0 && pageIndex < vm.totalPages) {
                vm.pageIndex = pageIndex;
                vm.loadTasks();
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
                vm.loadTasks();
            }, 2000);  // 2 seconds debounce time
        };

        // Initial load
        vm.loadTasks();
    }
})();




// (function () {
//     'use strict';

//     angular
//         .module('eServices')
//         .controller('taskController', taskController);

//     taskController.$inject = ['$rootScope', '$scope', 'UserProfile', '$filter', 'DTOptionsBuilder', 'DTColumnBuilder', '$compile', '$http', '$uibModal', '$state', 'SweetAlert', '$window'];

//     function taskController($rootScope, $scope, UserProfile, $filter, DTOptionsBuilder, DTColumnBuilder, $compile, $http, $uibModal, $state, SweetAlert, $window) {
//         var vm = this;

//         vm.user = UserProfile.getProfile();
//         vm.dtApplicationInstance = {};
//         vm.translateFilter = $filter('translate');

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
//             DTColumnBuilder.newColumn(null).withTitle(vm.translateFilter('completeProfile.establishmentName')).renderWith(
//                 function (data, type) {
//                     return $filter('localizeString')(data.visits[0].establishment);
//                 }),
//             DTColumnBuilder.newColumn(null).withOption('defaultContent', ' ').withTitle(vm.translateFilter('address.Emirate')).renderWith(
//                 function (data, type) {
//                     var community = $filter('filter')(vm.communities, { id: data.visits[0].establishment.address.communityId }, true)[0];
//                     return $filter('localizeString')(community.region.emirate);
//                 }),
//             DTColumnBuilder.newColumn(null).withOption('defaultContent', ' ').withTitle(vm.translateFilter('address.Community')).renderWith(
//                 function (data, type) {
//                     var community = $filter('filter')(vm.communities, { id: data.visits[0].establishment.address.communityId }, true)[0];
//                     return $filter('localizeString')(community);
//                 }),
//             DTColumnBuilder.newColumn(null).withTitle(vm.translateFilter('establishment.LicenseNumber')).renderWith(
//                 function (data, type) {
//                     return data.visits[0].establishment.licenseNumber;
//                 }),
//             DTColumnBuilder.newColumn(null).withOption('defaultContent', ' ').withTitle(vm.translateFilter('inspection.assignedTo')).renderWith(
//                 function (data, type) {
//                     return (data.taskGroupEmployee.user.firstName) + ' ' + (data.taskGroupEmployee.user.lastName);
//                 }).notSortable(),
//             DTColumnBuilder.newColumn(null).withTitle(vm.translateFilter('inspection.ScheduleStartingDate')).renderWith(
//                 function (data, type) {
//                     return moment(data.startsAt).format('DD-MMMM-YYYY, h:mm:ss a');
//                 }),
//             DTColumnBuilder.newColumn(null).withTitle(vm.translateFilter('inspection.ScheduleEndingDate')).renderWith(
//                 function (data, type) {
//                     return moment(data.endsAt).format('DD-MMMM-YYYY, h:mm:ss a');
//                 }),
//             DTColumnBuilder.newColumn(null).withTitle(vm.translateFilter('general.actions')).notSortable()
//                 .renderWith(actionsHtml),
//             DTColumnBuilder.newColumn(null).withTitle('').notSortable().renderWith(moreDetailsHtml).withOption('width', '20px')];


//         $http.get($rootScope.app.httpSource + 'api/UserFilter?menuId=' + 34)
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
//                 sortBy: (order.column === 0 ? 'inspection.createdOn' : aoData[1].value[order.column].data),//SortBy createdOn by default
//                 sortDirection: order.dir,
//                 filterParams: (vm.filterParams === undefined ? null : vm.filterParams)
//             };

//             $http.get($rootScope.app.httpSource + 'api/UserFilter/GetDefaultUserFilter?menuId=' + 34)
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

//                     $http.post($rootScope.app.httpSource + 'api/InspectionTask/GetInspectionTask', vm.params)
//                         .then(function (resp) {
//                             if (vm.communities == undefined || vm.communities.length == 0) {
//                                 $http.get($rootScope.app.httpSource + 'api/Community/GetCommunities')
//                                     .then(function (response) {
//                                         vm.communities = response.data;
//                                         vm.tasks = resp.data.content;
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
//                                 vm.tasks = resp.data.content;
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
//         }

//         function createdRow(row, data, dataIndex) {
//             if (data.visits.length > 0) {
//                 $('td', row).eq(8).addClass('wrapperStyle');
//             }
//             $compile(angular.element(row).contents())($scope);

//         };

//         function rowCallback(tabRow, data, dataIndex) {

//             $(tabRow.lastChild.children[0]).unbind('click');
//             $(tabRow.lastChild.children[0]).on('click', data, function (event) {
//                 var tr = $(tabRow);
//                 var table = vm.dtApplicationInstance.DataTable;
//                 var row = table.row(tr);

//                 if (row.child.isShown()) {
//                     // This row is already open - close it
//                     var index = vm.tasks.indexOf(event.data);
//                     var childs = row.child;
//                     tr.removeClass('shown');
//                     $('tr.slider' + index)
//                         .children('td, th')
//                         .animate({ padding: 0 })
//                         .wrapInner('<div />')
//                         .children()
//                         .slideUp(function () { $(this).closest('tr').remove(); childs.hide() });
//                 }
//                 else {
//                     row.child(inspectorsHtml(event.data)).show();
//                     tr.addClass('shown');
//                 }
//             });

//         };

//         function actionsHtml(data, type, full, meta) {            
//             var htmlSection = '<div style="display:inline-block" class="list-icon"><div class="inline" ng-click="task.getLocation(' + data.id +
//                 ',\'lg\')"><em class="fa fa-location-arrow" style="cursor:pointer" uib-tooltip="' + vm.translateFilter('general.mapLocation') + '"></em></div></div>';

//             return htmlSection;
//         };

//         vm.getLocation = function (taskId, size) {
//             if (!$scope.timelineOpened) {
//                 var modalInstance = $uibModal.open({
//                     templateUrl: 'app/views/Inspection/maps/maps.html',
//                     controller: 'mapsController',
//                     size: size,
//                     resolve: {
//                         establishment: function () {
//                             var taskList = $filter('filter')(vm.tasks, { id: taskId }, true)[0];
//                             var visitList = $filter('filter')(taskList.visits, { establishmentId: taskList.visits.establishmentId }, true)[0];
//                             return visitList.establishment;
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

//         vm.visit = function (establishmentId) {
//             $state.go('app.visit', { establishmentId: establishmentId });
//         }

//         function inspectorsHtml(dRow) {
//             var index = vm.tasks.indexOf(dRow);
//             var applicationDetailIndex;
//             var htmlSection = '';
//             for (var i = 0; i < dRow.visits.length; i++) {
//                 htmlSection += '<tr role="row" class="bg-gray slider' + index + '"><td colspan="1">' + vm.translateFilter('visit.visitNumber') + ': ' + '<b>' + dRow.visits[i].visitNumber +
//                     '</b>' + '</td><td colspan="2">' + vm.translateFilter('dashboard.applicationStatus') + ': ' + '<b>' + $filter('localizeString')(dRow.visits[i].visitStatus) + '</b>' +
//                     '</td><td colspan="2">' + (dRow.visits[i].establishmentVisitStatus == null ? '' : vm.translateFilter('visit.establishmentVisitStatus') + ': ' + '<b>' +
//                     $filter('localizeString')(dRow.visits[i].establishmentVisitStatus) + '</b>') + '</td><td colspan="1">' + vm.translateFilter('visit.visitedOn') + ': ' + '<b>' +
//                     moment(dRow.visits[i].createdOn).format('DD-MMMM-YYYY') + '</b>' + '</td><td colspan="1">' + vm.translateFilter('inspection.inspectedBy') + ': ' + '<b>' +
//                     dRow.visits[i].user.firstName + ' ' + dRow.visits[i].user.lastName + '</b></td><td colspan="2">' + vm.bindButtons(dRow) + '</td></tr>';
//             }

//             return $compile(htmlSection)($scope);
//         };

//         function moreDetailsHtml(data, type, full, meta) {
//             var htmlSection = '';
//             if (data.visits.length > 0) {
//                 htmlSection = '<div style="display:inline-block" class="list-iconMore"><div class="inline" style="color:white;"><em class="fa fa-arrow-circle-down" style="cursor:pointer;" uib-tooltip="' +
//                     $filter('translate')("dashboard.moreDetails") + '"></em></div></div>';
//             }
//             return htmlSection;
//         };

//         vm.bindButtons = function (data) {
//             var htmlSection = '';
//             htmlSection = '<div style="display:inline-block" class="list-icon"><div class="inline" ng-click="task.edit(' + data.visits[0].id + ',' + data.establishmentId + ',\'' + "01" +
//                 '\')"><em class="fa fa-pencil" style="cursor:pointer" uib-tooltip="' + vm.translateFilter('general.edit') + '"></em></div><div class="inline" ng-click="task.actionList(' +
//                 data.visits[0].id + ',\'lg\')"><em class="fa fa-sitemap" style="cursor:pointer" uib-tooltip="' + vm.translateFilter('general.procedureList') +
//                 '"></em></div><div class="inline" ng-click="task.review(' + data.id + ')"><em class="fa fa-search" style="cursor:pointer" uib-tooltip="' +
//                 vm.translateFilter('general.review') + '"></em></div></div>';

//             return htmlSection;
//         };

//         vm.review = function (Id) {
//             $state.go('app.reviewVisit', { visitId: Id });
//         };

//         vm.edit = function (visitid, establishmentid, serviceCode) {
//             switch (serviceCode) {
//                 case "01":
//                     $state.go('app.visit', { establishmentId: establishmentid, visitId: visitid });
//                     break;
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

//         vm.actionList = function (visitId, size) {
//             if (!$scope.timelineOpened) {
//                 var modalInstance = $uibModal.open({
//                     templateUrl: 'app/views/Inspection/Timeline/timeline.html',
//                     controller: 'InspectionTimelineController',
//                     size: size,
//                     resolve: {
//                         visit: function () {
//                             return vm.visit(visitId);
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

//         vm.visit = function (visitId) {
//             var visit = null;
//             for (var i = 0; i < vm.tasks.length; i++) {
//                 visit = $filter('filter')(vm.tasks[i].visits, { id: visitId }, true)[0];
//                 if (visit != null) return visit;
//             }
//         }
//     }

// })();