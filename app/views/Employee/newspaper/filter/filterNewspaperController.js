/**=========================================================
 * Module: DashboardController.js
 =========================================================*/

(function () {
    'use strict';

    angular
        .module('eServices')
        .controller('filterNewsPaperController', filterNewsPaperController);

    filterNewsPaperController.$inject = ['$rootScope', '$scope', 'UserProfile', '$filter', '$http'];
    function filterNewsPaperController($rootScope, $scope, UserProfile, $filter, $http) {
        var vm = this;
        vm.user = UserProfile.getProfile();
        vm.dtApplicationInstance = {};
        vm.translateFilter = $filter('translate');

        vm.filter = {
        };

        $scope.$parent.$parent.newspaper.filterParams = vm.filter;

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

        $http.get($rootScope.app.httpSource + 'api/UserType/GetAllUserTypes')
            .then(function (response) {
                vm.customerTypes = response.data;
            });

        $http.get($rootScope.app.httpSource + 'api/Language')
            .then(function (response) {
                vm.languages = response.data;                
            });

        $http.get($rootScope.app.httpSource + 'api/Country')
            .then(function (response) {                                
            });

        $http.get($rootScope.app.httpSource + 'api/NewspaperCategory')
            .then(function (response) {                              
            });

        $http.get($rootScope.app.httpSource + 'api/PeriodicalType')
            .then(function (response) {
                vm.periodicalTypes = response.data;
            });

        $http.get($rootScope.app.httpSource + 'api/ReleaseType')
            .then(function (response) {
                vm.releaseTypes = response.data;
            });

        vm.NewsPaperMagazines = [
            { id: 1, nameEn: 'Newspaer', nameAr: 'جريدة' },
            { id: 2, nameEn: 'Magazine', nameAr: 'مجلة' }];

        vm.PrintElectronics = [
            { id: 1, nameEn: 'Electric', nameAr: "إلكترونية" },
            { id: 2, nameEn: 'Printed', nameAr: "مطبوعة" }];
    }
})();
