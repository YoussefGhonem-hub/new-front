(function () {
    'use strict';

    angular
        .module('eServices')
        .controller('ScheduledTablesController', ScheduledTablesController);

    ScheduledTablesController.$inject = ['$rootScope', '$scope', '$http', '$uibModal', '$state', 'SweetAlert'];

    function ScheduledTablesController($rootScope, $scope, $http, $uibModal, $state, SweetAlert) {
        var vm = this;

        vm.isLoading = true;
        vm.taskGroups = [];
        vm.searchText = '';
        vm.selectedEntries = null;
        vm.entries = [10, 25, 50, 100];
        vm.pageIndex = 0;
        vm.totalPages = 0;
        vm.pageSize = 10; // Default page size

        // Fetch initial data
        vm.loadTaskGroups = function () {
            var params = {
                searchtext: vm.searchText,
                page: vm.pageIndex + 1,
                pageSize: vm.pageSize
            };

            $http.post($rootScope.app.httpSource + 'api/TaskGroup/GetTaskGroups', params)
                .then(function (response) {
                    vm.taskGroups = response.data.content;
                    vm.totalPages = Math.ceil(response.data.totalRecords / vm.pageSize);
                    vm.isLoading = false;
                }, function (error) {
                    console.error('Error loading task groups:', error);
                    vm.isLoading = false;
                });
        };

        // Initial load
        vm.loadTaskGroups();

        // Pagination controls
        vm.getPageRange = function () {
            var start = Math.max(vm.pageIndex - 2, 0);
            var end = Math.min(vm.pageIndex + 2, vm.totalPages - 1);
            var range = [];
            for (var i = start; i <= end; i++) {
                range.push(i);
            }
            return range;
        };

        vm.goToPage = function (page) {
            if (page >= 0 && page < vm.totalPages) {
                vm.pageIndex = page;
                vm.loadTaskGroups();
            }
        };

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

        // Actions
        vm.addScheduleTable = function () {
            $state.go('app.scheduleInspectors');
        };

        vm.review = function (taskGroupId) {
            $state.go('app.scheduleInspectors', { id: taskGroupId });
        };

        vm.edit = function (taskGroupId) {
            $state.go('app.scheduleInspectors', { id: taskGroupId });
        };

        vm.delete = function (taskGroupId) {
            SweetAlert.swal({
                title: "Confirm Delete",
                text: "Are you sure you want to delete this task?",
                type: "warning",
                showCancelButton: true,
                confirmButtonColor: "#DD6B55",
                confirmButtonText: "Yes, delete it!",
                cancelButtonText: "No, cancel!",
                closeOnConfirm: false,
                closeOnCancel: false
            }, function (isConfirm) {
                if (isConfirm) {
                    $http.post($rootScope.app.httpSource + 'api/TaskGroup/DeleteTaskGroup', { id: taskGroupId })
                        .then(function () {
                            SweetAlert.swal("Deleted!", "Task group has been deleted.", "success");
                            vm.loadTaskGroups();
                        }, function (error) {
                            SweetAlert.swal("Error", "Could not delete task group.", "error");
                            console.error('Error deleting task group:', error);
                        });
                } else {
                    SweetAlert.swal("Cancelled", "Task group is safe :)", "error");
                }
            });
        };

        // Filter functionality
        vm.filter = function () {
            vm.loadTaskGroups();
        };

        vm.removeFilter = function () {
            vm.searchText = '';
            vm.loadTaskGroups();
        };
    }
})();
