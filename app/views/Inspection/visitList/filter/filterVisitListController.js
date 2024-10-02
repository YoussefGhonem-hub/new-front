/**=========================================================
 * Module: DashboardController.js
 =========================================================*/

(function () {
    'use strict';

    angular
        .module('eServices')
        .controller('filterVisitListController', filterVisitListController);

    filterVisitListController.$inject = ['$rootScope', '$scope', 'UserProfile', '$filter', '$http'];
    function filterVisitListController($rootScope, $scope, UserProfile, $filter, $http) {
        var vm = this;
        vm.user = UserProfile.getProfile();
        vm.dtApplicationInstance = {};
        vm.translateFilter = $filter('translate');
        vm.filter = {};
        vm.employees = [];

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

        $http.get($rootScope.app.httpSource + 'api/EstablishmentVisitStatus')
            .then(function (response) {                
                vm.establishmentVisitStatuses = response.data;
            },
            function (response) { });        

        $http.get($rootScope.app.httpSource + 'api/EconomicActivity')
            .then(function (response) {
                vm.economicActivities = response.data;
            });

        $http.get($rootScope.app.httpSource + 'api/Country')
            .then(function (response) {
                vm.nationalities = response.data;
            });  
        $http.get($rootScope.app.httpSource + 'api/UserProfile/GetInspectors')
            .then(function (resp) {                              
                for (var i = 0; i < resp.data.length; i++) {
                    vm.employees.push(resp.data[i].user);                   
                }                
            },
            function (response) {
            });

    }
})();
