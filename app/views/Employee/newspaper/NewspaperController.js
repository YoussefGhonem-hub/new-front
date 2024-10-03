
(function () {
    'use strict';

    angular
        .module('eServices')
        .controller('NewspaperController', NewspaperController);

    NewspaperController.$inject = ['$rootScope', '$scope', '$http', '$filter', '$uibModal', '$state', '$compile'];

    function NewspaperController($rootScope, $scope, $http, $filter, $uibModal, $state, $compile) {
        var vm = this;

        // Initialize variables
        vm.newspapers = [];
        vm.pageIndex = 0;
        vm.pageSize = 10;
        vm.totalPages = 0;
        vm.searchText = ''; // For filter
        vm.sortBy = null; // No default sorting column initially
        vm.sortDirection = null; // No default sorting direction initially
        vm.entries = [5, 10, 20, 30, 50];
        vm.selectedEntries = vm.entries[1]; // Default entry
        vm.totalNewspapers = 0;
        vm.isLoading = false; // Loader flag
        vm.filterParams = {}; // Filter parameters for advanced filtering

        // Helper function to format the languages
        vm.formatLanguages = function (languages) {
            if (!languages || languages.length === 0) return '';
            
            // Format languages by localizing and joining them with a comma or Arabic comma based on the language
            return languages.map(function (langObj) {
                return $filter('localizeString')(langObj.language) + ' - ' + langObj.name;
            }).join($rootScope.language.selected !== 'English' ? '، ' : ', ');
        };

        vm.getNewspaperType = function (item) {
            return item.isMagazine ? $filter('translate')('newspaperMagazineLicense.magazineOption') : $filter('translate')('newspaperMagazineLicense.newspaperOption');
        };

        vm.getIssuanceFormat = function (item) {
            return item.isElectronic ? $filter('translate')('newspaperMagazineLicense.electronicFormat') : $filter('translate')('newspaperMagazineLicense.printedFormat');
        };

        // Function to format subject categories (array of categories)
        vm.getSubjectCategories = function (subjectCategories) {
            if (!subjectCategories || subjectCategories.length === 0) return '';
            
            // Format subject categories by localizing them and joining with a comma or Arabic comma
            return subjectCategories.map(function (category) {
                return $filter('localizeString')(category.newspaperCategory);
            }).join($rootScope.language.selected !== 'English' ? '، ' : ', ');
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

        // Remove loader
        function removeLoader() {
            angular.element('.sk-cube-grid').remove();
            vm.isLoading = false;
        }

        // Load newspapers with sorting, pagination, and filtering
        vm.loadNewspapers = function () {
            loader(); // Show loader while fetching data

            var params = {
                page: vm.pageIndex + 1,
                pageSize: vm.selectedEntries,
                searchText: vm.searchText || null, // Filter text
                filterParams: vm.filterParams || {}, // Filter parameters
                sortBy: vm.sortBy, // Sorting column
                sortDirection: vm.sortDirection // Sorting direction
            };

            // Fetch newspaper data from the API
            $http.post($rootScope.app.httpSource + 'api/Newspaper/GetAllNewspaper', params)
                .then(function (response) {
                    vm.newspapers = response.data.content;
                    vm.totalNewspapers = response.data.totalRecords || 0;
                    vm.totalPages = Math.ceil(vm.totalNewspapers / vm.selectedEntries); // Calculate total pages
                    removeLoader(); // Remove loader after fetching data
                }, function (error) {
                    console.error('Error loading newspapers', error);
                    removeLoader(); // Remove loader in case of error
                });
        };

        // Apply filters
        vm.applyFilters = function () {
            console.log("Applying filters with params: ", vm.filterParams);
            vm.pageIndex = 0;  // Reset to the first page when filters are applied
            vm.loadNewspapers();  // Reload the newspapers with applied filters
        };

        // Remove filters
        vm.removeFilter = function () {
            vm.filterParams = {}; // Reset the filter params
            vm.pageIndex = 0;  // Reset pagination to the first page
            vm.loadNewspapers();  // Reload the newspapers without filters
        };

        // Function to handle sorting
        vm.sortColumn = function (column) {
            if (vm.sortBy === column) {
                vm.sortDirection = (vm.sortDirection === 'asc') ? 'desc' : 'asc';
            } else {
                vm.sortBy = column;
                vm.sortDirection = 'asc'; // Default to ascending when a column is sorted
            }
            vm.loadNewspapers(); // Reload newspapers with sorting
        };

        // Function for pagination: Previous page
        vm.previousPage = function () {
            if (vm.pageIndex > 0) {
                vm.pageIndex--;
                vm.loadNewspapers(); // Reload newspapers with new page index
            }
        };

        // Function for pagination: Next page
        vm.nextPage = function () {
            if (vm.pageIndex < vm.totalPages - 1) {
                vm.pageIndex++;
                vm.loadNewspapers(); // Reload newspapers with new page index
            }
        };

        // Function to go to a specific page
        vm.goToPage = function (pageIndex) {
            if (pageIndex >= 0 && pageIndex < vm.totalPages) {
                vm.pageIndex = pageIndex;
                vm.loadNewspapers(); // Reload newspapers with new page index
            }
        };

        // Generate page range for pagination display
        vm.getPageRange = function () {
            var start = Math.max(0, vm.pageIndex - Math.floor(5 / 2));
            var end = Math.min(vm.totalPages, start + 5);
            start = Math.max(0, end - 5);
            return Array.from({ length: end - start }, (_, i) => start + i);
        };

        // Export newspapers data to Excel
        vm.exportExcel = function () {
            $http.post($rootScope.app.httpSource + 'api/Newspaper/ExportExcel', vm.params, { responseType: 'arraybuffer' })
                .then(function (resp) {
                    var data = new Blob([resp.data], { type: 'application/vnd.ms-excel' });
                    saveAs(data, "NewspaperList.xlsx");
                }, function (error) {
                    console.error('Error exporting Excel', error);
                });
        };

        // Export newspapers data to CSV
        vm.exportCSV = function () {
            $http.post($rootScope.app.httpSource + 'api/Newspaper/ExportCSV', vm.params)
                .then(function (resp) {
                    var BOM = "\uFEFF"; // UTF-8 BOM for proper encoding
                    var csvContent = BOM + resp.data;
                    var myBlob = new Blob([csvContent], { type: 'text/csv' });
                    var url = window.URL.createObjectURL(myBlob);
                    var a = document.createElement("a");
                    document.body.appendChild(a);
                    a.href = url;
                    a.download = "NewspaperList.csv";
                    a.click();
                    window.URL.revokeObjectURL(url);
                }, function (error) {
                    console.error('Error exporting CSV', error);
                });
        };

        // Export newspapers data to PDF
        vm.exportPDF = function () {
            $http.post($rootScope.app.httpSource + 'api/Newspaper/ExportToPdf', vm.params, { responseType: 'arraybuffer' })
                .then(function (resp) {
                    var data = new Blob([resp.data], { type: 'application/pdf' });
                    saveAs(data, "NewspaperList.pdf");
                }, function (error) {
                    console.error('Error exporting PDF', error);
                });
        };

        // Review function for action buttons
        vm.review = function (newspaperId) {
            $state.go('app.newspaperCard', { id: newspaperId });
        };

        // Initialize and load newspapers data when the controller is instantiated
        vm.loadNewspapers();
    }
})();




// (function () {
//     'use strict';

//     angular
//         .module('eServices')
//         .controller('NewspaperController', NewspaperController);

//     NewspaperController.$inject = ['$rootScope', '$scope', 'UserProfile', '$filter', 'DTOptionsBuilder', 'DTColumnBuilder', '$compile', '$http', '$uibModal', '$state'];

//     function NewspaperController($rootScope, $scope, UserProfile, $filter, DTOptionsBuilder, DTColumnBuilder, $compile, $http, $uibModal, $state) {        
//         var vm = this;
//         vm.user = UserProfile.getProfile();
//         vm.dtNewspaperInstance = {};
//         vm.translateFilter = $filter('translate');

//         vm.exportExcel = function () {
//             $http.post($rootScope.app.httpSource + 'api/Newspaper/ExportExcel', vm.params, { responseType: 'arraybuffer' })
//                 .then(function (resp) {
//                     var data = new Blob([resp.data], { type: 'application/vnd.ms-excel' });
//                     saveAs(data, "Newspaper.xlsx");
//                 },
//                 function (response) {
//                 });
//         };
//         vm.exportPDF = function () {
//             $http.post($rootScope.app.httpSource + 'api/Newspaper/ExportToPdf', vm.params, { responseType: 'arraybuffer' })
//                 .then(function (resp) {
//                     var data = new Blob([resp.data], { type: 'application/pdf' });
//                     saveAs(data, "Newspaper.pdf");
//                 },
//                 function (response) {
//                 });
//         };
//         vm.exportCSV = function () {
//             $http.post($rootScope.app.httpSource + 'api/Newspaper/ExportCSV', vm.params)
//                 .then(function (resp) {
//                     var myBlob = new Blob([resp.data], { type: 'text/html' });
//                     var url = window.URL.createObjectURL(myBlob);
//                     var a = document.createElement("a");
//                     document.body.appendChild(a);
//                     a.href = url;
//                     a.download = "Newspaper.csv";
//                     a.click();
//                     window.URL.revokeObjectURL(url);
//                 },
//                 function (response) {
//                 });
//         };

//         if ($rootScope.language.selected !== 'English') {
//             vm.dtNewspaperOptions = DTOptionsBuilder.newOptions()
//                 .withFnServerData(serverData)
//                 .withOption('serverSide', true)
//                 .withDataProp('data')
//                 .withOption('processing', true)
//                 .withOption('aaSorting', [[0, 'desc']])
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
//             vm.dtNewspaperOptions = DTOptionsBuilder.newOptions()
//                 .withFnServerData(serverData)
//                 .withOption('serverSide', true)
//                 .withDataProp('data')
//                 .withOption('processing', true)
//                 .withOption('aaSorting', [[0, 'desc']])
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

//         vm.dtNewspaperColumns = [                                    
//             DTColumnBuilder.newColumn(null).withTitle(vm.translateFilter('newspaperMagazineLicense.type')).renderWith(
//                 function (data, type) {                    
//                     return data.isMagazine ? vm.translateFilter('newspaperMagazineLicense.   ') : vm.translateFilter('newspaperMagazineLicense.newspaperOption');
//                 }),
//             DTColumnBuilder.newColumn(null).withTitle(vm.translateFilter('newspaperMagazineLicense.reasonType')).renderWith(
//                 function (data, type) {
//                     if (data.releaseType != undefined) {
//                         return $filter('localizeString')(data.releaseType);
//                     }
//                     else {
//                         return "";
//                     }
//                 }),
//             DTColumnBuilder.newColumn(null).withTitle(vm.translateFilter('newspaperMagazineLicense.issuanceFormat')).renderWith(
//                 function (data, type) {
//                     return data.isElectronic ? vm.translateFilter('newspaperMagazineLicense.electronicFormat') : vm.translateFilter('newspaperMagazineLicense.printedFormat');
//                 }),
//             DTColumnBuilder.newColumn(null).withTitle(vm.translateFilter('newspaper.periodicalType')).renderWith(
//                 function (data, type) {
//                     if (data.periodicalType != undefined) {
//                         return $filter('localizeString')(data.periodicalType);
//                     }
//                     else {
//                         return "";
//                     }
//                 }),
//             DTColumnBuilder.newColumn('newspaperLanguages').withTitle(vm.translateFilter('newspaper.newspaperLanguage')).renderWith(
//                 function (data, type) {                    
//                     var newspaperLanguagess = '';
//                     for (var i = 0; i < data.length; i++) {
//                         newspaperLanguagess += '<div class="col-sm-4">' + $filter('localizeString')(data[i].language) +
//                                                 '</div><div class="col-sm-8">' + data[i].name + '</div>';
//                     }
//                     return newspaperLanguagess;
//                 }),
//             DTColumnBuilder.newColumn('newspaperSubjectCategories').withTitle(vm.translateFilter('printingPermit.subject')).renderWith(
//                 function (data, type) {                    
//                     var newspaperCategories = '';
//                     for (var i = 0; i < data.length; i++) {
//                         newspaperCategories += $filter('localizeString')(data[i].newspaperCategory);

//                         if (i != data.length - 1) {
//                             if ($rootScope.language.selected !== 'English') {
//                                 newspaperCategories += "، ";
//                             }
//                             else
//                             {
//                                 newspaperCategories += ", ";
//                             }
//                         }
//                     }
//                     return newspaperCategories;
//                 }),            
//             DTColumnBuilder.newColumn('createdOn').withTitle(vm.translateFilter('dashboard.createdOn')).renderWith(
//                 function (data, type) {
//                     return moment(data).format('DD-MMMM-YYYY');
//                 }),
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
//             $http.post($rootScope.app.httpSource + 'api/Newspaper/GetAllNewsPaper', vm.params)
//                 .then(function (resp) {                    
//                     vm.Newspaper = resp.data.content;                    
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
//         };

//         vm.filter = function ($scope) {
//             vm.filterParams = $scope.filterParams;
//             vm.dtNewspaperInstance.DataTable.draw();
//         }

//         vm.userFilterData = function (id) {
//             vm.filterParams = {};
//             vm.filterParams.userFilterId = id;
//             vm.dtNewspaperInstance.DataTable.draw();
//         }

//         vm.removeFilter = function ($scope) {
//             $scope.filterParams = {};
//             vm.filterParams = $scope.filterParams;
//             vm.dtNewspaperInstance.DataTable.draw();
//         }

//         function actionsHtml(data, type, full, meta) {            
//             var htmlSection = '';
//             htmlSection = '<div style="display:inline-block" class="list-icon"><div class="inline" ng-click="newspaper.review(' + data.id + ')"><em class="fa fa-search" ' +
//                 'style="cursor:pointer" uib-tooltip="' + vm.translateFilter('newspapercard.review') + '"></em></div></div>';
//             return htmlSection;
//         };

//         vm.review = function (Id) {
//             $state.go('app.NewspaperCard', { id: Id });
//         };

//     }
// })();