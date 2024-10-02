/**=========================================================
 * Module: DashboardController.js
 =========================================================*/

(function () {
    'use strict';

    angular
        .module('eServices')
        .controller('CustomersController', CustomersController);

    CustomersController.$inject = ['$rootScope', '$scope', '$http', '$filter', '$timeout', '$compile'];

    function CustomersController($rootScope, $scope, $http, $filter, $timeout, $compile) {
        var vm = this;

        // Initialize variables
        vm.customers = [];
        vm.pageIndex = 0;
        vm.pageSize = 10;
        vm.totalPages = 0;
        vm.searchText = '';
        vm.sortBy = '';
        vm.sortDirection = 'asc';

        vm.entries = [5, 10, 20, 30, 50];
        vm.selectedEntries = vm.entries[1];
        vm.totalCustomers = 0;
        vm.isLoading = false; // Loader flag

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

        // Load customers
        vm.loadCustomers = function () {
            loader(); // Show loader while fetching data

            var params = {
                page: vm.pageIndex + 1,  // API is 1-based, while pageIndex is 0-based
                pageSize: vm.selectedEntries,
                searchText: vm.searchText || null,
                sortBy: vm.sortBy || 'user.firstName',
                sortDirection: vm.sortDirection || 'asc'
            };

            $http.post($rootScope.app.httpSource + 'api/Roles/GetCustomers', params)
                .then(function (response) {
                    vm.customers = response.data.content;
                    vm.totalCustomers = response.data.totalRecords || 0;
                    vm.totalPages = Math.ceil(vm.totalCustomers / vm.selectedEntries);
                    removeLoader(); // Remove loader after fetching data
                }, function (error) {
                    console.error('Error loading customers', error);
                    removeLoader(); // Remove loader in case of error
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
            vm.loadCustomers();
        };

        // Pagination controls
        vm.previousPage = function () {
            if (vm.pageIndex > 0) {
                vm.pageIndex--;
                vm.loadCustomers();
            }
        };

        vm.nextPage = function () {
            if (vm.pageIndex < vm.totalPages - 1) {
                vm.pageIndex++;
                vm.loadCustomers();
            }
        };

        vm.goToPage = function (pageIndex) {
            if (pageIndex >= 0 && pageIndex < vm.totalPages) {
                vm.pageIndex = pageIndex;
                vm.loadCustomers();
            }
        };

        vm.getPageRange = function () {
            var start = Math.max(0, vm.pageIndex - Math.floor(5 / 2));
            var end = Math.min(vm.totalPages, start + 5);
            start = Math.max(0, end - 5);
            return Array.from({ length: end - start }, (_, i) => start + i);
        };

        // Export functionality
        vm.exportExcel = function () {
            $http.post($rootScope.app.httpSource + 'api/Roles/ExportExcel', vm.params, { responseType: 'arraybuffer' })
                .then(function (resp) {
                    var data = new Blob([resp.data], { type: 'application/vnd.ms-excel' });
                    saveAs(data, "Customers.xlsx");
                },
                    function (response) {
                    });
        };

        vm.isObjectEmpty = function (card) {
            if (card) {
                return Object.keys(card).length === 0;
            }
            return true;
        };

        vm.removeFilter = function ($scope) {
            if ($scope.filterParams) {
                $scope.filterParams.minAge = 18;
                $scope.filterParams.maxAge = 70;
                $scope.filterParams.nationalities = null;
                $scope.filterParams.customerTypes = null;
                $scope.filterParams.userTypes = null;
                $scope.filterParams.fromCreatedOn = null;
                $scope.filterParams.toCreatedOn = null;
                $scope.filterParams.genders = null;
                $scope.filterParams.titles = null;
            }
        };

        vm.hasFilter = function ($scope) {
            if (this.filterParams) {
                if (this.filterParams.minAge != 18) return true;
                if (this.filterParams.maxAge != 70) return true;
                if (this.filterParams.nationalities != null) return true;
                if (this.filterParams.customerTypes != null) return true;
                if (this.filterParams.userTypes != null) return true;
                if (this.filterParams.fromCreatedOn != null) return true;
                if (this.filterParams.toCreatedOn != null) return true;
                if (this.filterParams.genders != null) return true;
                if (this.filterParams.titles != null) return true;
                if (this.filterParams.economicActivities != null) return true;
            }
            return false;
        };

        // Initialize load
        vm.loadCustomers();
    }
})();



// (function () {
//     'use strict';

//     angular
//         .module('eServices')
//         .controller('CustomersController', CustomersController);

//     CustomersController.$inject = ['$rootScope', '$scope', 'UserProfile', '$filter', 'DTOptionsBuilder', 'DTColumnBuilder', '$compile', '$http', '$uibModal', '$state', 'SweetAlert', '$window'];
//     function CustomersController($rootScope, $scope, UserProfile, $filter, DTOptionsBuilder, DTColumnBuilder, $compile, $http, $uibModal, $state, SweetAlert, $window) {

//         var vm = this;

//         vm.user = UserProfile.getProfile();
//         vm.dtUsersInstance = {};
//         vm.translateFilter = $filter('translate');

//         vm.click = function () {

//         };

//         vm.exportExcel = function () {
//             $http.post($rootScope.app.httpSource + 'api/Roles/ExportExcel', vm.params, { responseType: 'arraybuffer' })
//                 .then(function (resp) {
//                     var data = new Blob([resp.data], { type: 'application/vnd.ms-excel' });
//                     saveAs(data, "Customers.xlsx");
//                 },
//                     function (response) {
//                     });
//         };

//         vm.isObjectEmpty = function (card) {
//             if (card) {
//                 return Object.keys(card).length === 0;
//             }
//             else {
//                 return true;
//             }
//         };

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

//         vm.dtUsersColumns = [
//             DTColumnBuilder.newColumn('user.firstName').withTitle(vm.translateFilter('register.firstName')),
//             DTColumnBuilder.newColumn('id').notVisible(),
//             DTColumnBuilder.newColumn('user.lastName').withTitle(vm.translateFilter('register.lastName')),
//             DTColumnBuilder.newColumn('mediaFileNumber').withTitle(vm.translateFilter('profile.mediaFile')),
//             DTColumnBuilder.newColumn('userType').withTitle(vm.translateFilter('completeProfile.customerType')).renderWith(
//                 function (data, type) {
//                     return $filter('localizeString')(data);
//                 }),
//             DTColumnBuilder.newColumn('person.emiratesId').withTitle(vm.translateFilter('profileNationalityDirective.EmiratesId')),
//             DTColumnBuilder.newColumn('person.country').withTitle(vm.translateFilter('profileNationalityDirective.Nationality')).renderWith(
//                 function (data, type) {
//                     return $filter('localizeString')(data);
//                 }),
//             DTColumnBuilder.newColumn(null).withTitle(' ').renderWith(userCountryHtml).notSortable(),
//             DTColumnBuilder.newColumn('user.email').withTitle(vm.translateFilter('users.email')),
//             DTColumnBuilder.newColumn('user.phoneNumber').withTitle(vm.translateFilter('users.phoneNumber')).renderWith(
//                 function (data, type) {
//                     return '<span style="unicode-bidi:embed; direction: ltr">' + data + '</span>';
//                 }),
//             DTColumnBuilder.newColumn(null).withTitle('').notSortable()
//                 .renderWith(editableActionsHtml),
//             DTColumnBuilder.newColumn(null).withTitle(vm.translateFilter('general.procedures')).notSortable()
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

//             $http.post($rootScope.app.httpSource + 'api/Roles/GetCustomers', vm.params)
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
//                     function (response) {
//                         var records = {
//                             'draw': draw,
//                             'recordsTotal': 0,
//                             'recordsFiltered': 0,
//                             'data': []
//                         };
//                         fnCallback(records);
//                     });
//         };

//         function createdRow(row, data, dataIndex) {
//             // Recompiling so we can bind Angular directive to the DT
//             if (data.user.isActive === false) {
//                 $('td', row).addClass('bg-gray-dark');
//             }
//             $compile(angular.element(row).contents())($scope);
//         };

//         function rowCallback(nRow, aData, iDisplayIndex, iDisplayIndexFull) {

//         };

//         function editableActionsHtml(data, type, full, meta) {
//             var htmlSection = '<div class="list-icon"><div class="inline" ng-click="users.edit(\'' + data.userId + '\')"><em class="fa fa-pencil" style="cursor:pointer" uib-tooltip="' +
//                 vm.translateFilter('general.edit') + '"></em></div><div class="inline" ng-click="users.delete(\'' + data.userId + '\', $event)"><em class="fa fa-trash" ' +
//                 'style="cursor:pointer" uib-tooltip="' + vm.translateFilter('general.delete') + '"></em></div><div class="inline" ng-click="users.actionList(' + data.id +
//                 ',\'lg\', $event)"><em class="fa fa-sitemap" style="cursor:pointer" uib-tooltip="' + vm.translateFilter('general.procedureList') + '"></em></div></div>';

//             return htmlSection;
//         };

//         function actionsHtml(data, type, full, meta) {
//             var htmlSection = '<div uib-dropdown="dropdown" class="btn-group mr pull-right"><button uib-dropdown-toggle="" class="btn dropdown-toggle btn-sm ' +
//                 (data.user.isActive ? 'btn-primary' : 'btn-default') + '" ng-disabled="' + (data.userActions.length == 0 ? true : false) + '">' +
//                 vm.translateFilter('dashboard.actions') + '<b class="caret"></b></button><ul role="menu" class="dropdown-menu animated zoomIn">';

//             for (var i = 0; i < data.userActions.length; i++) {
//                 htmlSection += '<li><a href="" ng-click="users.actionClick(' + data.id + ', \'' + data.user.id + '\', ' + data.userActions[i].id + ', \'' + data.user.phoneNumber + '\')">' +
//                     $filter('localizeString')(data.userActions[i]) + '</a></li>';
//             }
//             htmlSection += '</ul></div>';

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

//         vm.delete = function (deleteUserId, event) {
//             var tempStore;
//             var index = vm.roles.indexOf($filter('filter')(vm.roles, { userId: deleteUserId }, true)[0]);
//             if (index != -1) {
//                 tempStore = $filter('filter')(vm.roles, { userId: deleteUserId }, true)[0];
//                 vm.roles.splice(index, 1);
//             }

//             var translate = $filter('translate');
//             //vm.dtUsersInstance.DataTable.draw();

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
//                         $http.post($rootScope.app.httpSource + 'api/UserProfile/DeleteUserProfile', tempStore)
//                             .then(function (response) {
//                                 SweetAlert.swal(translate('general.confirmDeleteBtn'), translate('general.deleteMessage'), "error");
//                                 vm.dtUsersInstance.DataTable.draw();
//                             },
//                                 function (response) { // optional
//                                     SweetAlert.swal(translate('general.confirmDeleteBtn'), translate('general.deleteMessage'), "error");
//                                 });
//                     } else {
//                         SweetAlert.swal(translate('general.restoreBtn'), translate('general.restoreMessage'), "success");
//                         vm.dtUsersInstance.DataTable.draw();
//                     }
//                 });
//         };

//         vm.actionList = function (userProfileId, size) {
//             var modalInstance = $uibModal.open({
//                 templateUrl: 'app/views/Account/customers/Timeline/timeline.html',
//                 controller: 'CustomerTimelineController',
//                 size: size,
//                 resolve: {
//                     userProfile: function () {
//                         return $filter('filter')(vm.roles, { id: userProfileId }, true)[0];;
//                     }
//                 }
//             });
//         };

//         vm.actionClick = function (userProfileId, userId, actionId, phoneNumber) {
//             switch (actionId) {
//                 case 1:
//                     vm.sendSMS(userProfileId, userId, phoneNumber);
//                     break;
//                 case 2:
//                     vm.sendEmail(userProfileId, userId);
//                     break;
//                 case 3:
//                     vm.lockUser(userProfileId);
//                     break;
//                 case 4:
//                     vm.unlockUser(userProfileId);
//                     break;
//                 case 7:
//                     vm.loginToAccount(userId);
//                     break;
//             }
//         };

//         vm.sendEmailBatch = function (userId) {

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
//                     subject: emailMessage.subject,
//                     body: emailMessage.body
//                 };
//                 var batchData = {};
//                 batchData.email = email;
//                 batchData.filterParams = vm.params.filterParams;
//                 batchData.searchtext = vm.params.searchtext;
//                 batchData.isEmployee = false;

//                 $http.post($rootScope.app.httpSource + 'api/UserProfile/SendEmailBatch', batchData)
//                     .then(function (response) {
//                         SweetAlert.swal($filter('translate')('general.ok'), $filter('translate')('SendEmail.successful'), "success");
//                         vm.dtUsersInstance.rerender();
//                     },
//                         function (response) {
//                         });
//             });
//         };

//         vm.sendEmail = function (userProfileId, userId) {
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
//                     subject: emailMessage.subject,
//                     body: emailMessage.body,
//                     userProfileId: userProfileId
//                 };
//                 $http.post($rootScope.app.httpSource + 'api/UserProfile/SendEmail', email)
//                     .then(function (response) {
//                         SweetAlert.swal($filter('translate')('general.ok'), $filter('translate')('SendEmail.successful'), "success");
//                         vm.dtUsersInstance.rerender();
//                     },
//                         function (response) {
//                         });
//             });
//         };

//         vm.sendSMSBatch = function (userId) {
//             var modalInstance = $uibModal.open({
//                 templateUrl: 'app/views/Account/admin/Send SMS/sendSMS.html',
//                 controller: 'SendSMSController',
//                 size: 'md',
//                 keyboard: true,
//                 backdrop: 'static'
//             });
//             modalInstance.result.then(function (smsMessage) {
//                 var sms = {
//                     userId: userId,
//                     sms: smsMessage
//                 };

//                 var batchData = {};
//                 batchData.sms = sms;
//                 batchData.filterParams = vm.params.filterParams;
//                 batchData.searchtext = vm.params.searchtext;
//                 batchData.isEmployee = false;

//                 $http.post($rootScope.app.httpSource + 'api/UserProfile/sendSMSBatch', batchData)
//                     .then(function (response) {
//                         SweetAlert.swal($filter('translate')('general.ok'), $filter('translate')('SendSMS.successful'), "success");
//                         vm.dtUsersInstance.rerender();
//                     },
//                         function (response) {
//                         });
//             });
//         };

//         vm.sendSMS = function (userProfileId, userId, phoneNumber) {
//             var modalInstance = $uibModal.open({
//                 templateUrl: 'app/views/Account/admin/Send SMS/sendSMS.html',
//                 controller: 'SendSMSController',
//                 size: 'md',
//                 keyboard: true,
//                 backdrop: 'static'
//             });
//             modalInstance.result.then(function (smsMessage) {
//                 var sms = {
//                     userId: userId,
//                     phoneNumber: phoneNumber,
//                     sms: smsMessage,
//                     userProfileId: userProfileId
//                 };
//                 $http.post($rootScope.app.httpSource + 'api/UserProfile/SendSMS', sms)
//                     .then(function (response) {
//                         SweetAlert.swal($filter('translate')('general.ok'), $filter('translate')('SendSMS.successful'), "success");
//                         vm.dtUsersInstance.rerender();
//                     },
//                         function (response) {
//                         });
//             });
//         };

//         vm.lockUser = function (userProfileId) {
//             var modalInstance = $uibModal.open({
//                 templateUrl: 'app/views/Account/admin/LockUser/lockUser.html',
//                 controller: 'LockUserController',
//                 size: 'md',
//                 keyboard: true,
//                 backdrop: 'static'
//             });
//             modalInstance.result.then(function (emailMessage) {
//                 var action = {
//                     userProfileId: userProfileId,
//                     note: emailMessage.body
//                 };
//                 $http.post($rootScope.app.httpSource + 'api/Account/LockUser', action)
//                     .then(function (response) {
//                         SweetAlert.swal($filter('translate')('general.ok'), $filter('translate')('login.userLockedSuccess'), "success");
//                         vm.dtUsersInstance.rerender();
//                     },
//                         function (response) {
//                         });
//             });
//         };

//         vm.unlockUser = function (userProfileId) {
//             var modalInstance = $uibModal.open({
//                 templateUrl: 'app/views/Account/admin/LockUser/lockUser.html',
//                 controller: 'LockUserController',
//                 size: 'md',
//                 keyboard: true,
//                 backdrop: 'static'
//             });
//             modalInstance.result.then(function (emailMessage) {
//                 var action = {
//                     userProfileId: userProfileId,
//                     note: emailMessage.body
//                 };
//                 $http.post($rootScope.app.httpSource + 'api/Account/UnlockUser', action)
//                     .then(function (response) {
//                         SweetAlert.swal($filter('translate')('general.ok'), $filter('translate')('login.userUnLockedSuccess'), "success");
//                         vm.dtUsersInstance.rerender();
//                     },
//                         function (response) {
//                         });
//             });
//         };

//         vm.loginToAccount = function (userId) {
//             $http.get($rootScope.app.httpSource + 'api/Account/Impersonate?uid=' + userId)
//                 .then(function (response) {
//                     $window.open('/#/page/login/' + response.data + "/", '_blank');
//                 },
//                     function (response) {
//                     });
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
//             vm.dtUsersInstance.DataTable.draw();
//         }

//         vm.removeFilter = function ($scope) {
//             if ($scope.filterParams) {
//                 $scope.filterParams.minAge = 18;
//                 $scope.filterParams.maxAge = 70;
//                 if ($scope.filterParams.nationalities) {
//                     $scope.filterParams.nationalities = null;
//                 }
//                 if ($scope.filterParams.customerTypes) {
//                     $scope.filterParams.customerTypes = null;
//                 }
//                 if ($scope.filterParams.userTypes) {
//                     $scope.filterParams.userTypes = null;
//                 }
//                 if ($scope.filterParams.fromCreatedOn) {
//                     $scope.filterParams.fromCreatedOn = null;
//                 }
//                 if ($scope.filterParams.toCreatedOn) {
//                     $scope.filterParams.toCreatedOn = null;
//                 }
//                 if ($scope.filterParams.genders) {
//                     $scope.filterParams.genders = null;
//                 }
//                 if ($scope.filterParams.titles) {
//                     $scope.filterParams.titles = null;
//                 }
//             }
//         }

//         vm.hasFilter = function ($scope) {
//             if (this.filterParams) {
//                 if (this.filterParams.minAge != 18)
//                     return true;
//                 if (this.filterParams.maxAge != 70)
//                     return true;
//                 if (this.filterParams.nationalities != null)
//                     return true;
//                 if (this.filterParams.customerTypes != null)
//                     return true;
//                 if (this.filterParams.userTypes != null)
//                     return true;
//                 if (this.filterParams.fromCreatedOn != null)
//                     return true;
//                 if (this.filterParams.toCreatedOn != null)
//                     return true;
//                 if (this.filterParams.genders != null)
//                     return true;
//                 if (this.filterParams.titles != null)
//                     return true;
//                 if (this.filterParams.economicActivities != null)
//                     return true;
//             }

//             return false;
//         }
//     }
// })();