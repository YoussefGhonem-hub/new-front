/**=========================================================
 * Module: DashboardController.js
 =========================================================*/

(function () {
    'use strict';

    angular
        .module('eServices')
        .controller('FilterPaymentController', FilterPaymentController);

    FilterPaymentController.$inject = ['$rootScope', '$scope', 'UserProfile', '$filter', '$http'];
    function FilterPaymentController($rootScope, $scope, UserProfile, $filter, $http) {
        var vm = this;
        vm.user = UserProfile.getProfile();
        vm.dtApplicationInstance = {};
        vm.translateFilter = $filter('translate');

        vm.filter = {
        };

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

        $http.get($rootScope.app.httpSource + 'api/Emirate')
        .then(function (response) {
            vm.emirates = response.data;
        });

        $http.get($rootScope.app.httpSource + 'api/Region')
        .then(function (response) {
            vm.regions = response.data;
        });

        $http.get($rootScope.app.httpSource + 'api/PaymentStatus')
        .then(function (response) {
            vm.paymentStatuses = response.data;
        });

        $http.get($rootScope.app.httpSource + 'api/ServiceCategory')
        .then(function (response) {
            vm.serviceCategories = response.data;
        });

        $http.get($rootScope.app.httpSource + 'api/Service')
        .then(function (response) {
            vm.services = $filter('filter')(response.data, {nameAr : '!استفسار'}, true);
        });

        $http.get($rootScope.app.httpSource + 'api/EconomicActivity')
        .then(function (response) {
            vm.economicActivities = response.data;
        });

        $http.get($rootScope.app.httpSource + 'api/Country')
        .then(function (response) {
            vm.nationalities = response.data;
        });
    }
})();
