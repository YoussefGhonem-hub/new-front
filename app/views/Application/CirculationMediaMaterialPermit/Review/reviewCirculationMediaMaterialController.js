/**=========================================================
 * Module: LoginController.js
 * Controller for the Chat APP 
 =========================================================*/

(function () {
    'use strict';

    angular
        .module('eServices')
        .controller('ReviewCirculationMediaMaterialController', ReviewCirculationMediaMaterialController);

    function ReviewCirculationMediaMaterialController($rootScope, $scope, $http, $stateParams, $state, $window, $uibModal, UserProfile, DTOptionsBuilder, DTColumnBuilder, $filter, $compile) {
        var vm = this;
        vm.translateFilter = $filter('translate');
        vm.dtPartnerInstance = {};
        vm.applicationOpen = true;
        vm.serviceFeesObj = { serviceId: 10, serviceFee: [] };

        vm.Init = function () {
            //vm.CirculationMediaMaterial.applicationDetail.application.user.userProfiles[0]
            vm.user = UserProfile.getProfile();
        };

        //Get the details of the submitted Form to edit
        $http.get($rootScope.app.httpSource + 'api/CirculationMediaMaterial/GetById?id=' + $state.params.id)
          .then(function (response) {
              vm.CirculationMediaMaterial = response.data;
              vm.Init();
          });
    }

    ReviewCirculationMediaMaterialController.$inject = ['$rootScope', '$scope', '$http', '$stateParams', '$state', '$window', '$uibModal', 'UserProfile', 'DTOptionsBuilder',
        'DTColumnBuilder', '$filter', '$compile'];

})();