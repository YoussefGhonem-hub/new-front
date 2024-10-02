/**=========================================================
 * Module: DashboardController.js
 =========================================================*/

(function () {
    'use strict';

    angular
        .module('eServices')
        .controller('FilterCustomersController', FilterCustomersController);

    FilterCustomersController.$inject = ['$rootScope', '$scope', 'UserProfile', '$filter', '$http'];
    function FilterCustomersController($rootScope, $scope, UserProfile, $filter, $http) {

        var vm = this;
        vm.user = UserProfile.getProfile();
        vm.dtApplicationInstance = {};
        vm.translateFilter = $filter('translate');

        vm.filter = {
            maxAge: 70,
            minAge: 18
        };

        $scope.$parent.$parent.filterParams = vm.filter;

        vm.click = function () {
        };

        $http.get($rootScope.app.httpSource + 'api/Country')
        .then(function (response) {
            vm.nationalities = response.data;
        });

        $http.get($rootScope.app.httpSource + 'api/UserType/GetAllUserTypes')
        .then(function (response) {
            vm.customerTypes = response.data;
        });

        $http.get($rootScope.app.httpSource + 'api/Gender')
        .then(function (response) {
            vm.genders = response.data;
        });

        $http.get($rootScope.app.httpSource + 'api/EconomicActivity')
        .then(function (response) {
            vm.economicActivities = response.data;
        });

        $http.get($rootScope.app.httpSource + 'api/Emirate')
        .then(function (response) {
            vm.emirates = response.data;
        });

        $http.get($rootScope.app.httpSource + 'api/Title')
        .then(function (response) {
            vm.titles = response.data;
        });

        // -----------------------------------
        // Filter Datepicker
        // -----------------------------------
        vm.openFromCreatedOn = function ($event) {
            vm.fromCreatedOnPopup.opened = true;
        };

        vm.openToCreatedOn = function ($event) {
            vm.toCreatedOnPopup.opened = true;
        };

        vm.format = 'dd-MM-yyyy';

        vm.fromCreatedOnPopup = {
            opened: false
        };

        vm.toCreatedOnPopup = {
            opened: false
        };

        var sliderDirRightToLeft = false;

        if ($rootScope.language.selected !== 'English')
            sliderDirRightToLeft = true;

        vm.minAge = 18;
        vm.maxAge = 70;
        vm.sliderOptions = {
            floor: 18,
            ceil: 70,
            step: 1,
            showTicksValues: 10,
            id: 'slider-id',
            rightToLeft: sliderDirRightToLeft
        };

    }
})();
