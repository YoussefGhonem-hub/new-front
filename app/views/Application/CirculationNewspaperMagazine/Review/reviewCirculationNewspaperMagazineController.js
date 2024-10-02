/**=========================================================
 * Module: LoginController.js
 * Controller for the Chat APP 
 =========================================================*/

(function () {
    'use strict';

    angular
        .module('eServices')
        .controller('ReviewCirculationNewspaperController', ReviewCirculationNewspaperController);

    function ReviewCirculationNewspaperController($rootScope, $scope, $http, $stateParams, $state,  $window, $uibModal, UserProfile, DTOptionsBuilder, DTColumnBuilder, $filter, $compile) {
        var vm = this;
        vm.translateFilter = $filter('translate');
        vm.dtPartnerInstance = {};
        vm.applicationOpen = true;
        vm.serviceFeesObj = { serviceId: 11, serviceFee: [] };

        vm.Init = function () {
            vm.user = UserProfile.getProfile();
        };

        //Get the details of the submitted Form to edit
        $http.get($rootScope.app.httpSource + 'api/CirculationMediaMaterial/GetById?id=' + $state.params.id)
          .then(function (response) {
              vm.CirculationNewspaper = response.data;
              vm.Init();
          });
    }

    ReviewCirculationNewspaperController.$inject = ['$rootScope', '$scope', '$http', '$stateParams', '$state',   '$window', '$uibModal', 'UserProfile', 'DTOptionsBuilder',
        'DTColumnBuilder', '$filter', '$compile'];

})();