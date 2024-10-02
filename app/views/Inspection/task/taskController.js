(function () {
    'use strict';

    angular
        .module('eServices')
        .controller('taskController', taskController);

    taskController.$inject = ['$rootScope', '$scope', '$http', '$uibModal', '$filter', '$timeout', 'UserProfile'];

    function taskController($rootScope, $scope, $http, $uibModal, $filter, $timeout, UserProfile) {
        var vm = this;

        // Initialize variables
        vm.user = UserProfile.getProfile();
        vm.pageIndex = 0;
        vm.pageSize = 10;
        vm.totalPages = 0;
        vm.tasks = [];
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

        // Get translated establishment name
        vm.getTranslatedEmirate = function (communityId) {
            var community = $filter('filter')(vm.communities, { id: communityId }, true)[0];
            return community ? (vm.language === 'ar' ? community.region.emirate.nameAr : community.region.emirate.nameEn) : '';
        };

        vm.getTranslatedCommunity = function (communityId) {
            var community = $filter('filter')(vm.communities, { id: communityId }, true)[0];
            return community ? (vm.language === 'ar' ? community.nameAr : community.nameEn) : '';
        };

        // Fetch tasks from the server
        vm.loadTasks = function () {
            var params = {
                page: vm.pageIndex + 1,
                pageSize: vm.pageSize
            };
            $http.post($rootScope.app.httpSource + 'api/InspectionTask/GetInspectionTask', params)
                .then(function (response) {
                    vm.tasks = response.data.content;
                    vm.totalPages = Math.ceil(response.data.totalRecords / vm.pageSize);
                }, function (error) {
                    console.error('Error loading tasks', error);
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
            var start = Math.max(0, vm.pageIndex - 2);
            var end = Math.min(vm.totalPages, start + 5);
            return Array.from({ length: end - start }, (_, i) => start + i);
        };

        // Initialize by loading tasks
        vm.loadTasks();
    }
})();
