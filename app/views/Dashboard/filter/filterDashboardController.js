/**=========================================================
 * Module: DashboardController.js
 =========================================================*/
(function () {
    'use strict';

    angular
        .module('eServices')
        .controller('FilterDashboardController', FilterDashboardController);

    FilterDashboardController.$inject = ['$rootScope', '$scope', 'UserProfile', '$filter', '$http'];
    
    function FilterDashboardController($rootScope, $scope, UserProfile, $filter, $http) {
        var vm = this;
        vm.user = UserProfile.getProfile();
        vm.filter = {};

        // Bind the filter to the parent scope so that the filter can be applied from the modal
        $scope.$parent.$parent.scheduledTables.filterParams = vm.filter;

        // Datepickers logic
        vm.openFromCreatedOn = function ($event) {
            vm.fromCreatedOnPopup.opened = true;
        };

        vm.openToCreatedOn = function ($event) {
            vm.toCreatedOnPopup.opened = true;
        };

        vm.openFromLicenseCreatedOn = function ($event) {
            vm.fromLicenseCreatedOnPopup.opened = true;
        };

        vm.openToLicenseCreatedOn = function ($event) {
            vm.toLicenseCreatedOnPopup.opened = true;
        };

        vm.openFromLicenseExpiredOn = function ($event) {
            vm.fromLicenseExpiredOnPopup.opened = true;
        };

        vm.openToLicenseExpiredOn = function ($event) {
            vm.toLicenseExpiredOnPopup.opened = true;
        };

        vm.format = 'dd-MMMM-yyyy';

        vm.fromCreatedOnPopup = {
            opened: false
        };

        vm.toCreatedOnPopup = {
            opened: false
        };

        vm.fromLicenseCreatedOnPopup = {
            opened: false
        };

        vm.toLicenseCreatedOnPopup = {
            opened: false
        };

        vm.fromLicenseExpiredOnPopup = {
            opened: false
        };

        vm.toLicenseExpiredOnPopup = {
            opened: false
        };

        // Fetch data for dropdowns
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

        $http.get($rootScope.app.httpSource + 'api/EconomicActivity')
        .then(function (response) {
            vm.economicActivities = response.data;
        });

        $http.get($rootScope.app.httpSource + 'api/Country')
        .then(function (response) {
            vm.nationalities = response.data;
        });
        
        $http.get($rootScope.app.httpSource + 'api/PublicationType')
        .then(function (response) {
            vm.publicationTypes = response.data;
        });

        $http.get($rootScope.app.httpSource + 'api/MediaMaterialType')
        .then(function (response) {
            vm.mediaMaterialTypes = response.data;
        });

        $http.get($rootScope.app.httpSource + 'api/ApplicationType')
        .then(function (response) {
            vm.applicationTypes = response.data;
        });
    }
})();

