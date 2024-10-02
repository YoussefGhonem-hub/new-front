(function () {
    'use strict';

    angular
        .module('eServices')
        .controller('BooksController', BooksController);

    BooksController.$inject = ['$rootScope', '$scope', '$http', '$filter', '$uibModal', '$state', '$compile'];

    function BooksController($rootScope, $scope, $http, $filter, $uibModal, $state, $compile) {
        var vm = this;

        // Initialize variables
        vm.books = [];
        vm.pageIndex = 0;
        vm.pageSize = 10;
        vm.totalPages = 0;
        vm.searchText = '';
        vm.sortBy = null; // No default sorting column initially
        vm.sortDirection = null; // No default sorting direction initially
        vm.entries = [5, 10, 20, 30, 50];
        vm.selectedEntries = vm.entries[1];
        vm.totalBooks = 0;
        vm.isLoading = false; // Loader flag

        // Helper function to format the languages
        vm.formatLanguages = function (languages) {
            return languages.map(function (langObj) {
                return $filter('localizeString')(langObj.language); // Assuming language field exists in the object
            }).join(', ');
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

        // Load books with sorting and pagination
        vm.loadBooks = function () {
            loader();  // Show loader while fetching data

            var params = {
                page: vm.pageIndex + 1,
                pageSize: vm.selectedEntries,
                searchText: vm.searchText || null,
                sortBy: vm.sortBy, // No sorting if null
                sortDirection: vm.sortDirection // No sorting if null
            };

            $http.post($rootScope.app.httpSource + 'api/Book/GetAllBooks', params)
                .then(function (response) {
                    vm.books = response.data.content;
                    vm.totalBooks = response.data.totalRecords || 0;
                    vm.totalPages = Math.ceil(vm.totalBooks / vm.selectedEntries);
                    removeLoader();  // Remove loader after fetching data
                }, function (error) {
                    console.error('Error loading books', error);
                    removeLoader();  // Remove loader in case of error
                });
        };

        // Open the modal for adding a new book
        vm.open = function (size) {
            var modalInstance = $uibModal.open({
                templateUrl: 'app/views/Employee/book/AddBook/addBook.html',
                controller: 'addBookController',
                size: size,
                resolve: {
                    book: function () {
                        return null;
                    }
                }
            });

            modalInstance.result.then(function (newBook) {
                vm.insertBook(newBook);
            }, function () {
                // Handle dismissal of the modal
            });
        };

        // Function to handle book insertion
        vm.insertBook = function (newBook) {
            var translate = $filter('translate');
            vm.inputParms = {
                title: newBook.title,
                authorName: newBook.authorName,
                isbn: newBook.isbn,
                subjectId: newBook.subjectCategory.id,
                subjectSubCategoryId: newBook.subjectSubCategory.id,
                printYear: newBook.printYear,
                versionNumber: newBook.versionNumber,
                isApproved: false,
                bookLanguages: []
            };

            for (var i = 0; i < newBook.selectedLangauges.length; i++) {
                var languageList = {};
                languageList.language = newBook.selectedLangauges[i];
                vm.inputParms.bookLanguages.push(languageList);
            }

            $http.post($rootScope.app.httpSource + 'api/Book/SaveBook', vm.inputParms)
                .then(function (response) {
                    if (response.data === true) {
                        SweetAlert.swal(translate('establishment.success'), translate('bookCard.dataAdded'), "success");
                        vm.loadBooks(); // Refresh books list
                    } else {
                        SweetAlert.swal(translate('establishment.error'), translate('establishment.error'), "error");
                    }
                }, function (error) {
                    if (error.data && error.data.exceptionMessage === "ISBNExist") {
                        SweetAlert.swal(translate('establishment.error'), translate('bookCard.alreadyExist'), "error");
                    } else {
                        SweetAlert.swal(translate('establishment.error'), translate('establishment.error'), "error");
                    }
                });
        };

        // Sorting logic
        vm.sortColumn = function (column) {
            if (vm.sortBy === column) {
                vm.sortDirection = (vm.sortDirection === 'asc') ? 'desc' : 'asc';
            } else {
                vm.sortBy = column;
                vm.sortDirection = 'asc'; // Default to ascending when a column is sorted
            }
            vm.loadBooks();
        };

        // Pagination controls
        vm.previousPage = function () {
            if (vm.pageIndex > 0) {
                vm.pageIndex--;
                vm.loadBooks();
            }
        };

        vm.nextPage = function () {
            if (vm.pageIndex < vm.totalPages - 1) {
                vm.pageIndex++;
                vm.loadBooks();
            }
        };

        vm.goToPage = function (pageIndex) {
            if (pageIndex >= 0 && pageIndex < vm.totalPages) {
                vm.pageIndex = pageIndex;
                vm.loadBooks();
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
            $http.post($rootScope.app.httpSource + 'api/Book/ExportExcel', vm.params, { responseType: 'arraybuffer' })
                .then(function (resp) {
                    var data = new Blob([resp.data], { type: 'application/vnd.ms-excel' });
                    saveAs(data, "BookList.xlsx");
                }, function (error) {
                    console.error('Error exporting Excel', error);
                });
        };

        vm.exportCSV = function () {
            $http.post($rootScope.app.httpSource + 'api/Book/ExportCSV', vm.params)
                .then(function (resp) {
                    var BOM = "\uFEFF"; // UTF-8 BOM for proper encoding
                    var csvContent = BOM + resp.data;
                    var myBlob = new Blob([csvContent], { type: 'text/csv' });
                    var url = window.URL.createObjectURL(myBlob);
                    var a = document.createElement("a");
                    document.body.appendChild(a);
                    a.href = url;
                    a.download = "BookList.csv";
                    a.click();
                    window.URL.revokeObjectURL(url);
                }, function (error) {
                    console.error('Error exporting CSV', error);
                });
        };

        vm.exportPDF = function () {
            $http.post($rootScope.app.httpSource + 'api/Book/ExportToPdf', vm.params, { responseType: 'arraybuffer' })
                .then(function (resp) {
                    var data = new Blob([resp.data], { type: 'application/pdf' });
                    saveAs(data, "BookList.pdf");
                }, function (error) {
                    console.error('Error exporting PDF', error);
                });
        };

        // Review function for action buttons
        vm.review = function (bookId) {
            $state.go('app.bookCard', { id: bookId });
        };

        // Initialize load
        vm.loadBooks();
    }
})();




// (function () {
//     'use strict';

//     angular
//         .module('eServices')
//         .controller('ScheduledTablesController', ScheduledTablesController);

//     ScheduledTablesController.$inject = ['$rootScope', '$scope', 'UserProfile', '$filter', 'DTOptionsBuilder', 'DTColumnBuilder', '$compile', '$http', '$uibModal', '$state', 'SweetAlert',
//         '$window'];
//     function ScheduledTablesController($rootScope, $scope, UserProfile, $filter, DTOptionsBuilder, DTColumnBuilder, $compile, $http, $uibModal, $state, SweetAlert, $window) {
//         var vm = this;
//         vm.isLoading = true;

//         var htmlSection = '';

//         vm.user = UserProfile.getProfile();
//         vm.dtApplicationInstance = {};
//         vm.translateFilter = $filter('translate');

//         vm.exportExcel = function () {
//             $http.post($rootScope.app.httpSource + 'api/Application/ExportExcel', vm.params, { responseType: 'arraybuffer' })
//                 .then(function (resp) {
//                     var data = new Blob([resp.data], { type: 'application/vnd.ms-excel' });
//                     saveAs(data, "Applications.xlsx");
//                 },
//                 function (response) {
//                 });
//         };
//         vm.exportPDF = function () {
//             $http.post($rootScope.app.httpSource + 'api/Application/ExportToPdf', vm.params, { responseType: 'arraybuffer' })
//                 .then(function (resp) {
//                     var data = new Blob([resp.data], { type: 'application/pdf' });
//                     saveAs(data, "Applications.pdf");
//                 },
//                 function (response) {
//                 });
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
//                 function (response) {
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

//         vm.dtApplicationColumns = [
//             DTColumnBuilder.newColumn('name').withTitle(vm.translateFilter('inspection.scheduleName')),
//             DTColumnBuilder.newColumn('id').notVisible(),
//             DTColumnBuilder.newColumn(null).withOption('defaultContent', ' ').withTitle(vm.translateFilter('address.Emirate')).renderWith(
//                 function (data, type) {
//                     return $filter('localizeString')(data.region.emirate) + (data.region.emirateId == 1 ? ' - ' + $filter('localizeString')(data.region) : '');
//                 }),
//             DTColumnBuilder.newColumn(null).withTitle(vm.translateFilter('inspection.inspectionReason')).renderWith(
//                 function (data, type) {
//                     return $filter('localizeString')(data.inspectionReason);
//                 }),
//             DTColumnBuilder.newColumn(null).withTitle(vm.translateFilter('inspection.ScheduleStartingDate')).renderWith(
//                 function (data, type) {
//                     return moment(data.startDate).format('DD-MMMM-YYYY');
//                 }),
//             DTColumnBuilder.newColumn(null).withTitle(vm.translateFilter('inspection.ScheduleEndingDate')).renderWith(
//                 function (data, type) {
//                     return moment(data.endDate).format('DD-MMMM-YYYY');
//                 }),
//             DTColumnBuilder.newColumn(null).withTitle(vm.translateFilter('address.establishmentCount')).renderWith(
//                 function (data, type) {
//                     var numberOfEstablishments = 0;
//                     for (var i = 0; i < data.taskGroupEmployees.length; i++) {
//                         numberOfEstablishments += data.taskGroupEmployees[i].taskLists.length;
//                     }
//                     return numberOfEstablishments;
//                 }),
//             DTColumnBuilder.newColumn(null).withTitle(vm.translateFilter('general.actions')).notSortable().renderWith(actionsHtml),
//             DTColumnBuilder.newColumn(null).withTitle('').notSortable().renderWith(moreDetailsHtml).withOption('width', '20px')];

//         $http.get($rootScope.app.httpSource + 'api/UserFilter?menuId=' + 35)
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

//             $http.get($rootScope.app.httpSource + 'api/UserFilter/GetDefaultUserFilter?menuId=' + 35)
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

//                     $http.post($rootScope.app.httpSource + 'api/TaskGroup/GetTaskGroups', vm.params)
//                         .then(function (resp) {
//                             vm.taskGroups = resp.data.content;
//                             var records = {
//                                 'draw': draw,
//                                 'recordsTotal': resp.data.totalRecords,
//                                 'recordsFiltered': resp.data.totalRecords,
//                                 'data': resp.data.content
//                             };
//                             fnCallback(records);
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
//             $('td', row).eq(7).addClass('wrapperStyle');
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
//                     var index = vm.taskGroups.indexOf(event.data);
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
//                     // call loader
//                     row.child(loader()).show();
//                     tr.addClass('shown');

//                     htmlSection = '';
//                     for (var i = 0; i < event.data.taskGroupEmployees.length; i++) {
//                         getCompletedTaskCount(i, event.data, row, tr);
//                     }
//                 }
//             });
//         };

//         //call api and bind row
//         function getCompletedTaskCount(Key, dRow, row, tr) {
//             $http.get($rootScope.app.httpSource + 'api/Visit/GetCompletedTaskCount?taskGroupId=' + dRow.id + '&userId=' + dRow.taskGroupEmployees[Key].userId)
//                 .then(function (response) {
//                     vm.CompletedTaskCount = response.data;
//                     row.child(inspectorsHtml(dRow, vm.CompletedTaskCount, dRow.taskGroupEmployees[Key].taskLists, Key)).show();
//                     tr.addClass('shown');
//                 });
//         }

//         function inspectorsHtml(dRow, completedTaskCount, totalTasks, key) {

//             var index = vm.taskGroups.indexOf(dRow);
//             htmlSection += '<tr role="row" class="bg-gray slider' + index + '"><td colspan="6">';

//             var Value = ((completedTaskCount / totalTasks.length) * 100);//real value
//             var roundedValue = Math.round(Value);//rounded value

//             htmlSection += '<div class="row"><div class="col-md-2">' + dRow.taskGroupEmployees[key].user.firstName + ' ' + dRow.taskGroupEmployees[key].user.lastName +
//                 '</div><div class="col-md-2"><span data-translate="address.establishmentCount"></span> ' + dRow.taskGroupEmployees[key].taskLists.length +
//                 '</div><div class="col-md-1"><div class="label label-success">' + vm.CompletedTaskCount +
//                 ' <span data-translate="inspection.completedEstablishments"></span></div></div><div class="col-md-7"><uib-progressbar type="' + vm.progressBarType(roundedValue) +
//                 '" animate="false" value="' + Value + '" >' +
//                 '<b> ' + roundedValue + ' %</b ></uib - progressbar ></div ></div > ';
//             htmlSection += '</td><td colspan="2"></td></tr>'
//             return $compile(htmlSection)($scope);
//         };

//         function workflowActionsHtml(data, type, full, meta) {
//             var htmlSection;
//             htmlSection = '<div style="display:inline-block" class=""><workflow-action ng-model="dashboard.applications[0].applicationDetails[0]" ' +
//                 'dtapplicationinstance="dashboard.dtApplicationInstance" application="dashboard.applications[0]"></workflow-action></div>';

//             return htmlSection;
//         };

//         function actionsHtml(data, type, full, meta) {
//             var htmlSection = '';

//             if (data.isApproved) {
//                 htmlSection += '<div style="display:inline-block" class="list-icon">' +
//                     '<div class="inline" ng-click="scheduledTables.delete(' + data.id + ', $event)"><em class="fa fa-trash" style="cursor:pointer" uib-tooltip="' + vm.translateFilter('general.delete') + '"></em></div>' +
//                     '<div class="inline" ng-click="scheduledTables.review(' + data.id + ')"><em class="fa fa-search" style="cursor:pointer" uib-tooltip="' + vm.translateFilter('general.review') + '"></em></div>' +
//                     '<div class="inline" ng-click="scheduledTables.PrintReport(' + data.id + ')"><em class="fa fa-print" style="cursor:pointer" uib-tooltip="' + vm.translateFilter('general.review') + '"></em></div>' +
//                     '</div>';

//             }
//             else {
//                 htmlSection += '<div style="display:inline-block" class="list-icon"><div class="inline" ng-click="scheduledTables.delete(' + data.id + ', $event)"><em class="fa fa-trash" ' +
//                     'style="cursor:pointer" uib-tooltip="' + vm.translateFilter('general.delete') + '"></em></div><div class="inline" ng-click="scheduledTables.edit(' + data.id +
//                     ',\'lg\')"><em class="fa fa-pencil" style="cursor:pointer" uib-tooltip="' + vm.translateFilter('general.edit') + '"></em></div><div class="inline" ' +
//                     'ng-click="scheduledTables.review(' + data.id + ')"><em class="fa fa-search" style="cursor:pointer" uib-tooltip="' + vm.translateFilter('general.review') +
//                     '"></em></div></div>';
//             }

//             return htmlSection;
//         };

//         //Loader
//         function loader() {
//             var htmlSectionLoader = '';
//             htmlSectionLoader += '<div class="sk-cube-grid" style="position:fixed; top: 25%; right:47%; z-index:9999">' +
//                 '<div class="sk-cube sk-cube1" ></div >' +
//                 '<div class="sk-cube sk-cube2"></div>' +
//                 '<div class="sk-cube sk-cube3"></div>' +
//                 '<div class="sk-cube sk-cube4"></div>' +
//                 '<div class="sk-cube sk-cube5"></div>' +
//                 '<div class="sk-cube sk-cube6"></div>' +
//                 '<div class="sk-cube sk-cube7"></div>' +
//                 '<div class="sk-cube sk-cube8"></div>' +
//                 '<div class="sk-cube sk-cube9"></div>' +
//                 '</div >';
//             return $compile(htmlSectionLoader)($scope);
//         };

//         function moreDetailsHtml(data, type, full, meta) {
//             var htmlSection = '<div style="display:inline-block" class="list-iconMore"><div class="inline" style="color:white;"><em class="fa fa-arrow-circle-down" style="cursor:pointer;" uib-tooltip="' +
//                 $filter('translate')("dashboard.moreDetails") + '"></em></div></div>';
//             return htmlSection;
//         };

//         vm.progressBarType = function (value) {
//             var type;

//             if (value < 25) {
//                 type = 'danger';
//             } else if (value < 50) {
//                 type = 'warning';
//             } else if (value < 75) {
//                 type = 'info';
//             } else {
//                 type = 'success';
//             }

//             vm.showWarning = (type === 'danger' || type === 'warning');

//             return type;
//         };

//         vm.edit = function (taskGroupId) {
//             $state.go('app.scheduleInspectors', { id: taskGroupId });
//         };

//         vm.review = function (Id) {
//             $state.go('app.scheduleInspectors', { id: Id });
//         };

//         var index;
//         var tempStore;

//         vm.PrintReport = function (taskGroupId, event) {
//             $http.get($rootScope.app.httpSource + 'api/TaskGroup/GenerateTaskGroupReport?TaskGroupId=' + taskGroupId, { responseType: 'arraybuffer' }).then(function (resp) {
//                 var data = new Blob([resp.data], { type: 'application/pdf' });
//                 saveAs(data, "Report.pdf");
//             }, function (response) { vm.isBusy = false; });
//         };

//         vm.delete = function (taskGroupId, event) {
//             if (taskGroupId == 0 || taskGroupId == undefined) {
//                 index = vm.dtApplicationInstance.DataTable.rows({ order: 'applied' }).nodes().indexOf(event.currentTarget.parentNode.parentNode.parentNode);
//                 tempStore = vm.taskGroups[index];
//                 vm.taskGroups.splice(index, 1);
//             }
//             else {
//                 var taskGroup = $filter('filter')(vm.taskGroups, { id: taskGroupId }, true)[0];
//                 if (taskGroup != undefined) {
//                     index = vm.taskGroups.indexOf(taskGroup);
//                     tempStore = $filter('filter')(vm.taskGroups, { id: taskGroupId }, true)[0];
//                     vm.taskGroups.splice(index, 1);
//                     vm.isTemporaryDelete = true;
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
//                         $http.post($rootScope.app.httpSource + 'api/TaskGroup/DeleteTaskGroup', tempStore)
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

//         vm.addScheduleTable = function () {
//             $state.go('app.scheduleInspectors');
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
