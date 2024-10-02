/**=========================================================
 * Module: DashboardController.js
 =========================================================*/

(function () {
    'use strict';

    angular
        .module('eServices')
        .controller('filterEnquiriesController', filterEnquiriesController);

    filterEnquiriesController.$inject = ['$rootScope', '$scope', 'UserProfile', '$filter', '$http'];
    function filterEnquiriesController($rootScope, $scope, UserProfile, $filter, $http) {
        var vm = this;
        vm.user = UserProfile.getProfile();
        vm.dtApplicationInstance = {};
        vm.translateFilter = $filter('translate');
        vm.filter = {};

        $scope.$parent.$parent.filterParams = vm.filter;

        // -----------------------------------------------

        // -----------------------------------
        // Filter Datepicker
        // -----------------------------------
        vm.openFromCreatedOn = function ($event) {
            vm.fromCreatedOnPopup.opened = true;
        };

        vm.openToCreatedOn = function ($event) {
            vm.toCreatedOnPopup.opened = true;
        };

        vm.format = 'dd-MMMM-yyyy';

        vm.fromCreatedOnPopup = {
            opened: false
        };

        vm.toCreatedOnPopup = {
            opened: false
        };

        $http.get($rootScope.app.httpSource + 'api/Emirate')
        .then(function (response) {
            vm.emirates = response.data;
        });

        $http.get($rootScope.app.httpSource + 'api/Region')
        .then(function (response) {
            vm.regions = response.data;
        });

        $http.get($rootScope.app.httpSource + 'api/ApplicationStatus')
        .then(function (response) {
            vm.applicationStatuses = response.data;
        });

        $http.get($rootScope.app.httpSource + 'api/ServiceCategory')
        .then(function (response) {
            vm.serviceCategories = response.data;
        });

        $http.get($rootScope.app.httpSource + 'api/Service')
        .then(function (response) {
            vm.services = response.data;
        });

        $http.get($rootScope.app.httpSource + 'api/EnquirySource')
        .then(function (response) {
            vm.enquirySources = response.data;
        });

        $http.get($rootScope.app.httpSource + 'api/EnquiryType')
        .then(function (response) {
            vm.enquiryTypes = response.data;
        });
        
        $http.get($rootScope.app.httpSource + 'api/Priority')
        .then(function (response) {
            vm.priorities = response.data;
        });

        $http.get($rootScope.app.httpSource + 'api/Department')
        .then(function (response) {
            vm.departments = response.data;
        });

        $http.get($rootScope.app.httpSource + 'api/ApplicationType')
        .then(function (response) {
            vm.applicationTypes = response.data;
        });
    }
})();
