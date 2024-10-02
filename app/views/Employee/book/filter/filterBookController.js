/**=========================================================
 * Module: DashboardController.js
 =========================================================*/

(function () {
    'use strict';

    angular
        .module('eServices')
        .controller('filterBookController', filterBookController);

    filterBookController.$inject = ['$rootScope', '$scope', 'UserProfile', '$filter', '$http'];
    function filterBookController($rootScope, $scope, UserProfile, $filter, $http) {
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

        $http.get($rootScope.app.httpSource + 'api/SubjectCategory')
        .then(function (response) {
            vm.subjectCategories = response.data;
        });

        $http.get($rootScope.app.httpSource + 'api/Language')
        .then(function (response) {
            vm.languages = response.data;
        });

        $http.get($rootScope.app.httpSource + 'api/Country')
        .then(function (response) {
            vm.nationalities = response.data;
        });

        vm.BookStatus = [
            { id: 0, nameEn: 'Rejected', nameAr: 'متحفظ عليه' },
            { id: 1, nameEn: 'Approved', nameAr: 'مسموح' },
            { id: 2, nameEn: 'N/A', nameAr: 'متحفظ عليه' } ];
    }
})();
