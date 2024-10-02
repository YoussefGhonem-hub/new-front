(function () {
    'use strict';

    angular
        .module('eServices')
        .controller('EmployeesController', EmployeesController);

    EmployeesController.$inject = ['$rootScope', '$scope', '$http', '$filter', '$timeout'];

    function EmployeesController($rootScope, $scope, $http, $filter, $timeout) {
        var vm = this;

        // Initialize variables
        vm.users = [];
        vm.pageIndex = 0;
        vm.pageSize = 10;
        vm.totalPages = 0;
        vm.searchText = '';
        vm.sortBy = '';
        vm.sortDirection = 'asc';

        vm.entries = [5, 10, 20, 30, 50];
        vm.selectedEntries = vm.entries[1];
        vm.totalUsers = 0;

        // Load employees
        vm.loadEmployees = function () {
            var params = {
                page: vm.pageIndex + 1,  // API is 1-based, while pageIndex is 0-based
                pageSize: vm.selectedEntries,
                searchText: vm.searchText || null,
                sortBy: vm.sortBy || 'user.firstName',
                sortDirection: vm.sortDirection || 'asc'
            };

            $http.post($rootScope.app.httpSource + 'api/Roles/GetEmployees', params)
                .then(function (response) {
                    vm.users = response.data.content;
                    vm.totalUsers = response.data.totalRecords || 0;
                    vm.totalPages = Math.ceil(vm.totalUsers / vm.selectedEntries);
                }, function (error) {
                    console.error('Error loading employees', error);
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
            vm.loadEmployees();
        };

        // Pagination controls
        vm.previousPage = function () {
            if (vm.pageIndex > 0) {
                vm.pageIndex--;
                vm.loadEmployees();
            }
        };

        vm.nextPage = function () {
            if (vm.pageIndex < vm.totalPages - 1) {
                vm.pageIndex++;
                vm.loadEmployees();
            }
        };

        vm.goToPage = function (pageIndex) {
            if (pageIndex >= 0 && pageIndex < vm.totalPages) {
                vm.pageIndex = pageIndex;
                vm.loadEmployees();
            }
        };

        vm.getPageRange = function () {
            var start = Math.max(0, vm.pageIndex - Math.floor(5 / 2));
            var end = Math.min(vm.totalPages, start + 5);
            start = Math.max(0, end - 5);
            return Array.from({ length: end - start }, (_, i) => start + i);
        };

        // Initialize load
        vm.loadEmployees();
    }
})();





// (function () {
//     'use strict';

//     angular
//         .module('eServices')
//         .controller('EmployeesController', EmployeesController);

//     EmployeesController.$inject = ['$rootScope', '$scope', 'UserProfile', '$filter', 'DTOptionsBuilder', 'DTColumnBuilder', '$compile', '$http', '$uibModal', '$state', 'SweetAlert'];
//     function EmployeesController($rootScope, $scope, UserProfile, $filter, DTOptionsBuilder, DTColumnBuilder, $compile, $http, $uibModal, $state, SweetAlert) {

//         var vm = this;
//         vm.user = UserProfile.getProfile();
//         vm.dtUsersInstance = {};
//         vm.translateFilter = $filter('translate');

//         if ($rootScope.language.selected !== 'English') {
//             vm.dtUsersOptions = DTOptionsBuilder.newOptions()
//                 .withFnServerData(serverData)
//                 .withOption('serverSide', true)
//                 .withDataProp('data')
//                 .withOption('processing', true)
//                 .withOption('responsive', {
//                     details: {
//                         renderer: renderer
//                     }
//                 })
//                 .withPaginationType('full_numbers')
//                 .withDisplayLength(10)
//                 .withLanguageSource('app/langs/ar.json')
//                 .withOption('createdRow', createdRow)
//                 .withOption('rowCallback', rowCallback).withBootstrap();
//         }
//         else {
//             vm.dtUsersOptions = DTOptionsBuilder.newOptions()
//                 .withFnServerData(serverData)
//                 .withOption('serverSide', true)
//                 .withDataProp('data')
//                 .withOption('processing', true)
//                 .withOption('responsive', {
//                     details: {
//                         renderer: renderer
//                     }
//                 })
//                 .withPaginationType('full_numbers')
//                 .withDisplayLength(10)
//                 .withLanguageSource('app/langs/en.json')
//                 .withOption('createdRow', createdRow)
//                 .withOption('rowCallback', rowCallback).withBootstrap();
//         }

//         vm.dtUsersColumns = [
//             DTColumnBuilder.newColumn('user.firstName').withTitle(vm.translateFilter('register.firstName')),
//             DTColumnBuilder.newColumn('id').notVisible(),
//             DTColumnBuilder.newColumn('user.lastName').withTitle(vm.translateFilter('register.lastName')),
//             DTColumnBuilder.newColumn('user.isActive').withTitle(vm.translateFilter('users.isActive')).notSortable(),
//             DTColumnBuilder.newColumn('person.emiratesId').withTitle(vm.translateFilter('profileNationalityDirective.EmiratesId')),
//             DTColumnBuilder.newColumn('person.country').withTitle(vm.translateFilter('profileNationalityDirective.Nationality')).renderWith(
//                 function (data, type) {
//                     return $filter('localizeString')(data);
//                 }),
//             DTColumnBuilder.newColumn(null).withTitle(' ').renderWith(userCountryHtml).notSortable(),
//             DTColumnBuilder.newColumn('user.lastLoginDate').withTitle(vm.translateFilter('users.lastLoginDate')).renderWith(
//                 function (data, type) {
//                     return $filter('date')(data, 'dd-MMMM-yyyy');
//                 }).withOption('defaultContent', ' '),
//             DTColumnBuilder.newColumn('group').withTitle(vm.translateFilter('employees.employeeGroup')).renderWith(
//                 function (data, type) {
//                     return $filter('localizeString')(data);
//                 }).withOption('defaultContent', ' '),
//             DTColumnBuilder.newColumn('user.email').withTitle(vm.translateFilter('users.email')),
//             DTColumnBuilder.newColumn('user.phoneNumber').withTitle(vm.translateFilter('users.phoneNumber')),
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
//                 sortBy: aoData[1].value[order.column].data,
//                 sortDirection: order.dir,
//                 filterParams: (vm.filterParams === undefined ? null : vm.filterParams)
//             };

//             $http.post($rootScope.app.httpSource + 'api/Roles/GetEmployees', vm.params)
//                 .then(function (resp) {
//                     vm.roles = resp.data.content;
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
//             // Recompiling so we can bind Angular directive to the DT
//             if (data.user.isActive === false) {
//                 $('td', row).addClass('bg-gray-dark');
//             }
//             $compile(angular.element(row).contents())($scope);
//         };

//         function rowCallback(nRow, aData, iDisplayIndex, iDisplayIndexFull) {
//             //$('td', nRow).unbind('click');
//             //$('td', nRow).bind('click', function () {
//             //    $scope.$apply(function () {
//             //        alert("You've clicked row," + iDisplayIndex);
//             //    });
//             //});
//             //return nRow;
//         };

//         function actionsHtml(data, type, full, meta) {
//             var htmlSection = '';
//             var phoneConfirmed = data.user.phoneNumberConfirmed == false ? vm.translateFilter('SendSMS.phoneNumberNotConfirmed') : vm.translateFilter('users.sendSMS');
//             var sendSMSStyle = data.user.phoneNumberConfirmed == false ? "color:lightgray" : "";
//             htmlSection = '<div class="list-icon"><div class="inline" ng-click="users.edit(\'' + data.userId + '\')"><em class="fa fa-pencil" ' +
//                 'style="cursor:pointer" uib-tooltip="' + vm.translateFilter('general.edit') + '"></em></div><div class="inline" ng-click="users.sendEmail(\'' +
//                 data.userId + '\',\'' + data.user.email + '\')"><em class="fa fa-envelope-o" style="cursor:pointer" uib-tooltip="' +
//                 vm.translateFilter('users.sendEmail') + '"></em></div><div class="inline" ng-click="users.sendSMS(\'' + data.userId + '\',\'' + data.user.phoneNumber + '\',\'' + data.user.phoneNumberConfirmed + '\')" style="' + sendSMSStyle + '"><em class="fa fa-comments-o" style="cursor:pointer"' + '" uib-tooltip="' +
//                 phoneConfirmed + '"></em></div>';

//             if (data.user.isActive == true) {
//                 htmlSection += '<div class="inline"><em class="fa fa-lock text-danger" style="cursor:pointer;" uib-tooltip="' + vm.translateFilter('general.lock') + '"></em></div></div>';
//             }
//             else {
//                 htmlSection += '<div class="inline"><em class="fa fa-unlock" style="cursor:pointer;" uib-tooltip="' + vm.translateFilter('general.unlock') + '"></em></div></div>';
//             }

//             return htmlSection;
//         };

//         function userCountryHtml(data, type, full, meta) {
//             var htmlSection = '<div><span><img class="img-responsive" style="display:inline-block; ' +
//                 'padding-left:10px; padding-right: 10px; max-width:60px" src="../src/imgs/Countries/' + data.person.country.isoCode2 + '.png" /></span></div>';

//             return htmlSection;
//         };

//         vm.edit = function (Id) {
//             $state.go('app.profile', { id: Id });
//         };

//         vm.sendEmail = function (userId, emailId) {
//             var modalInstance = $uibModal.open({
//                 templateUrl: 'app/views/Account/admin/Send Email/sendEmail.html',
//                 controller: 'SendEmailController',
//                 size: 'md',
//                 keyboard: true,
//                 backdrop: 'static'
//             });
//             modalInstance.result.then(function (emailMessage) {
//                 var email = {
//                     userId: userId,
//                     emailId: emailId,
//                     subject: emailMessage.subject,
//                     body: emailMessage.body
//                 };
//                 vm.isBusy = true;
//                 $http.post($rootScope.app.httpSource + 'api/UserProfile/SendEmail', email)
//                     .then(function (response) {
//                         vm.isBusy = false;
//                         SweetAlert.swal($filter('translate')('general.ok'), $filter('translate')('SendEmail.successful'), "success");
//                         $state.go('app.users');
//                     },
//                     function (response) {
//                         vm.isBusy = false;
//                     });
//             });
//         };

//         vm.sendSMS = function (userId, phoneNumber, isPhoneNumberCofirmed) {
//             if (isPhoneNumberCofirmed == "false") {
//                 return "";
//             }
//             else {
//                 var modalInstance = $uibModal.open({
//                     templateUrl: 'app/views/Account/admin/Send SMS/sendSMS.html',
//                     controller: 'SendSMSController',
//                     size: 'md',
//                     keyboard: true,
//                     backdrop: 'static'
//                 });
//                 modalInstance.result.then(function (smsMessage) {
//                     var sms = {
//                         userId: userId,
//                         phoneNumber: phoneNumber,
//                         sms: smsMessage
//                     };
//                     vm.isBusy = true;
//                     $http.post($rootScope.app.httpSource + 'api/UserProfile/SendSMS', sms)
//                         .then(function (response) {
//                             vm.isBusy = false;
//                             SweetAlert.swal($filter('translate')('general.ok'), $filter('translate')('SendSMS.successful'), "success");
//                             $state.go('app.users');
//                         },
//                         function (response) {
//                             vm.isBusy = false;
//                         });
//                 });
//             }
//         };

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
//         }
//     }
// })();
