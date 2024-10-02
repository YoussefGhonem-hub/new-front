/**=========================================================
 * Module: DashboardController.js
 =========================================================*/

(function () {
    'use strict';

    angular
        .module('eServices')
        .controller('BooksController', BooksController);

    BooksController.$inject = ['$rootScope', '$scope', '$http', '$filter', '$uibModal', '$state'];

    function BooksController($rootScope, $scope, $http, $filter, $uibModal, $state) {
        var vm = this;

        // Initialize variables
        vm.books = [];
        vm.pageIndex = 0;
        vm.pageSize = 10;
        vm.totalPages = 0;
        vm.searchText = '';
        vm.sortBy = 'title';
        vm.sortDirection = 'asc';

        vm.entries = [5, 10, 20, 30, 50];
        vm.selectedEntries = vm.entries[1];
        vm.totalBooks = 0;
      // Helper function to format the languages
        vm.formatLanguages = function (languages) {
            return languages.map(function(langObj) {
                return $filter('localizeString')(langObj.language); // Assuming language field exists in the object
            }).join(', ');
        };

        // Load books
        vm.loadBooks = function () {
            var params = {
                page: vm.pageIndex + 1,
                pageSize: vm.selectedEntries,
                searchText: vm.searchText || null,
                sortBy: vm.sortBy || 'title',
                sortDirection: vm.sortDirection || 'asc'
            };

            $http.post($rootScope.app.httpSource + 'api/Book/GetAllBooks', params)
                .then(function (response) {
                    vm.books = response.data.content;
                    vm.totalBooks = response.data.totalRecords || 0;
                    vm.totalPages = Math.ceil(vm.totalBooks / vm.selectedEntries);
                }, function (error) {
                    console.error('Error loading books', error);
                });
        };

        // Sorting logic
        vm.sortColumn = function (column) {
            if (vm.sortBy === column) {
                vm.sortDirection = (vm.sortDirection === 'asc') ? 'desc' : 'asc';
            } else {
                vm.sortBy = column;
                vm.sortDirection = 'asc';
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
            // Similar export logic
        };
        vm.exportCSV = function () {
            // Similar export logic
        };
        vm.exportPDF = function () {
            // Similar export logic
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
//         .controller('BooksController', BooksController);

//     BooksController.$inject = ['$rootScope', '$scope', 'UserProfile', '$filter', 'DTOptionsBuilder', 'DTColumnBuilder', '$compile', '$http', '$uibModal', '$state', 'SweetAlert'];
//     function BooksController($rootScope, $scope, UserProfile, $filter, DTOptionsBuilder, DTColumnBuilder, $compile, $http, $uibModal, $state, SweetAlert) {
//         var vm = this;
//         vm.user = UserProfile.getProfile();
//         vm.dtBookInstance = {};
//         vm.translateFilter = $filter('translate');
//         vm.isAllowedBookForm = false;
//         if (UserProfile.getProfile().roles.indexOf('B4B6749E83D4492DA247591E3A148E6A') != -1 || UserProfile.getProfile().roles.indexOf('vgeW7B4qbkdaJhByGHvASqLGv5BdWm') != -1)
//         {
//             vm.isAllowedBookForm = true;
//         }

//         $http.get($rootScope.app.httpSource + 'api/UserFilter?menuId=' + 29)
//             .then(function (response) {
//                 vm.userFilters = response.data;
//             });
//         vm.exportExcel = function () {
//             $http.post($rootScope.app.httpSource + 'api/Book/ExportExcel', vm.params, { responseType: 'arraybuffer' })
//                 .then(function (resp) {
//                     var data = new Blob([resp.data], { type: 'application/vnd.ms-excel' });
//                     saveAs(data, "BookList.xlsx");
//                 },
//                     function (response) {
//                     });
//         };
//         vm.exportPDF = function () {
//             $http.post($rootScope.app.httpSource + 'api/Book/ExportToPdf', vm.params, { responseType: 'arraybuffer' })
//                 .then(function (resp) {
//                     var data = new Blob([resp.data], { type: 'application/pdf' });
//                     saveAs(data, "BookList.pdf");
//                 },
//                     function (response) {
//                     });
//         };
//         vm.exportCSV = function () {
//             $http.post($rootScope.app.httpSource + 'api/Book/ExportCSV', vm.params)
//                 .then(function (resp) {                    
//                     var BOM = "\uFEFF";
//                     var csvContent = BOM + resp.data;                                        
//                     var myBlob = new Blob([csvContent], { type: 'text/html' });                    
//                     var url = window.URL.createObjectURL(myBlob);
//                     var a = document.createElement("a");
//                     document.body.appendChild(a);
//                     a.href = url;
//                     a.download = "BookList.csv";
//                     a.click();
//                     window.URL.revokeObjectURL(url);
//                 },
//                     function (response) {
//                     });
//         };
//         vm.open = function (size) {
//             var modalInstance = $uibModal.open({
//                 templateUrl: 'app/views/Employee/book/AddBook/addBook.html',
//                 controller: 'addBookController',
//                 size: size,
//                 resolve: {
//                     book: function () {
//                         return null;
//                     }
//                 }
//             });
//             modalInstance.result.then(function (newBook) {
//                 vm.insertBook(newBook);
//             },
//                 function () {
//                 });
//         };

//         vm.insertBook = function (newBook) {
//             var translate = $filter('translate');
//             vm.inputParms = {
//                 title: newBook.title,
//                 authorName: newBook.authorName,
//                 isbn: newBook.isbn,
//                 subjectId: newBook.subjectCategory.id,
//                 subjectSubCategoryId: newBook.subjectSubCategory.id,
//                 printYear: newBook.printYear,
//                 versionNumber: newBook.versionNumber,
//                 //nationalDepositoryNo: newBook.nationalDepositoryNo,
//                 isApproved: false,
//                 bookLanguages: []
//             }
//             for (var i = 0; i < newBook.selectedLangauges.length; i++) {
//                 var languageList = {};
//                 languageList.language = newBook.selectedLangauges[i];
//                 vm.inputParms.bookLanguages.push(languageList);
//             }

//             $http.post($rootScope.app.httpSource + 'api/Book/SaveBook', vm.inputParms)
//                 .then(
//                     function (response) {    
//                         if (response.data == true) {
//                             SweetAlert.swal(translate('establishment.success'), translate('bookCard.dataAdded'), "success");
//                             vm.dtBookInstance.reloadData();
//                         }
//                         else {
//                             SweetAlert.swal(translate('establishment.error'), translate('establishment.error'), "error");
//                         }
//                     },
//                     function (error) {
//                         if (error.data.exceptionMessage == "ISBNExist") {
//                             SweetAlert.swal(translate('establishment.error'), translate('bookCard.alreadyExist'), "error");
//                         }
//                         else {
//                             SweetAlert.swal(translate('establishment.error'), translate('establishment.error'), "error");
//                         }  
//                     });
//         }

//         if ($rootScope.language.selected !== 'English') {
//             vm.dtBooksOptions = DTOptionsBuilder.newOptions()
//                 .withFnServerData(serverData)
//                 .withOption('serverSide', true)
//                 .withDataProp('data')
//                 .withOption('processing', true)
//                 .withOption('aaSorting', [[6, 'desc']])
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
//             vm.dtBooksOptions = DTOptionsBuilder.newOptions()
//                 .withFnServerData(serverData)
//                 .withOption('serverSide', true)
//                 .withDataProp('data')
//                 .withOption('processing', true)
//                 .withOption('aaSorting', [[6, 'desc']])
//                 .withOption('stateSave', true)
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

//         vm.dtBooksColumns = [
//             DTColumnBuilder.newColumn('title').withTitle(vm.translateFilter('printingPermit.bookTitle')),
//             DTColumnBuilder.newColumn('id').notVisible(),
//             DTColumnBuilder.newColumn('authorName').withTitle(vm.translateFilter('printingPermit.authorName')),
//             DTColumnBuilder.newColumn('subjectCategory').withTitle(vm.translateFilter('printingPermit.subject')).renderWith(
//                 function (data, type) {
//                         return $filter('localizeString')(data);
//                     }),
//             DTColumnBuilder.newColumn('bookLanguages').withTitle(vm.translateFilter('printingPermit.languages')).renderWith(
//                     function (data, type) {
//                         var languages = '';
//                         for (var i = 0; i < data.length; i++) {
//                             languages += $filter('localizeString')(data[i].language);

//                             if (i != data.length - 1) {
//                                 languages += ", ";
//                             }
//                         }
//                         return languages;
//                 }),
//             DTColumnBuilder.newColumn('isbn').withTitle(vm.translateFilter('printingPermit.isbn')).renderWith(
//                 function (data) {
//                     if (data != null) {
//                         return '<isbn-validator ng-model-options="{ getterSetter: true }" ng-model="' + data +'"></isbn-validator>';
//                     }
//                     else {
//                         return '<div></div>';
//                     }
//                 }),
//             DTColumnBuilder.newColumn('nationalDepositoryNo').withTitle(vm.translateFilter('printingPermit.nationalDepositoryNo')).renderWith(
//                 function (data) {
//                 if(vm.isAllowedBookForm != null) {
//                         return '<div></div>';
//                     }
//                     else {
//                         return '<div></div>';
//                     }
//                 }),
//             //DTColumnBuilder.newColumn('nationalDepositoryNo').withTitle(vm.translateFilter('printingPermit.nationalDepositoryNo')),
//             DTColumnBuilder.newColumn('versionNumber').withTitle(vm.translateFilter('printingPermit.versionNumber')),
//             DTColumnBuilder.newColumn('printYear').withTitle(vm.translateFilter('printingPermit.printYear')),
//             DTColumnBuilder.newColumn('isApproved').withTitle(vm.translateFilter('printingPermit.bookStatus')).renderWith(
//                     function (data, type) {
//                         if (data) {
//                             return vm.translateFilter('printingPermit.approvedBook');
//                         }
//                         else {
//                             return vm.translateFilter('printingPermit.notApprovedBook');
//                         }
//                     }),
//             DTColumnBuilder.newColumn(null).withTitle(vm.translateFilter('general.actions')).notSortable()
//                 .renderWith(actionsHtml)];

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

//             $http.post($rootScope.app.httpSource + 'api/Book/GetAllBooks', vm.params)
//                 .then(function (resp) {
//                     vm.books = resp.data.content;                    
//                     var records = {
//                         'draw': draw,
//                         'recordsTotal': resp.data.totalRecords,
//                         'recordsFiltered': resp.data.totalRecords,
//                         'data': resp.data.content
//                     };
//                     fnCallback(records);
//                 },
//                 function (response) {
//                     var records = {
//                         'draw': draw,
//                         'recordsTotal': 0,
//                         'recordsFiltered': 0,
//                         'data': []
//                     };
//                     fnCallback(records);
//                 });
//         };

//         function createdRow(row, data, dataIndex) {
//             $compile(angular.element(row).contents())($scope);
//         };

//         function rowCallback(tabRow, data, dataIndex) { };

//         function renderer(api, rowIdx, columns) {
//             var data = $.map(columns, function (col, i) {
//                 return col.hidden ?
//                     '<li data-dtr-index="' + col.columnIndex + '" data-dt-row="' + col.rowIndex + '" data-dt-column="' + col.columnIndex + '">' +
//                          '<span class="dtr-title">' +
//                              col.title +
//                        '</span> ' +
//                        '<span class="dtr-data">' +
//                            col.data +
//                       '</span>' +
//                   '</li>' :
//                   '';
//             }).join('');
//             return data ?
//                 $compile(angular.element($('<ul data-dtr-index="' + rowIdx + '"/>').append(data)))($scope) :
//              false;
//         };

//         vm.filter = function ($scope) {
//             vm.filterParams = $scope.filterParams;
//             vm.dtBookInstance.DataTable.draw();
//         }

//         vm.userFilterData = function (userFilter) {
//             vm.filterParams = {};
//             vm.filterParams.userFilterId = userFilter.id;
//             vm.selectedUserFilter = userFilter;
//             vm.dtBookInstance.DataTable.draw();
//         }

//         vm.removeFilter = function ($scope) {
//             $scope.filterParams = {};
//             vm.filterParams = $scope.filterParams;
//             vm.dtBookInstance.DataTable.draw();
//         }

//         function actionsHtml(data, type, full, meta) {
//             var htmlSection = '';
//             htmlSection = '<div style="display:inline-block" class="list-icon"><div class="inline" ng-click="books.review(' + data.id + ')"><em class="fa fa-search" ' +
//                 'style="cursor:pointer" uib-tooltip="' + vm.translateFilter('bookCard.review') + '"></em></div></div>';
//             return htmlSection;
//         };

//         vm.review = function (Id) {
//             $state.go('app.bookCard', { id: Id });
//         };
//     }
// })();