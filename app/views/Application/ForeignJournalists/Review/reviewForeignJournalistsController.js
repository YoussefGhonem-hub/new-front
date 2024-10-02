/**=========================================================
 * Module: LoginController.js
 * Controller for the Chat APP 
 =========================================================*/

(function () {
    'use strict';

    angular
        .module('eServices')
        .controller('ReviewForeignJournalistsController', ReviewForeignJournalistsController);

    function ReviewForeignJournalistsController($rootScope, $scope, $http, $stateParams, $state,  $window, $uibModal, UserProfile, DTOptionsBuilder, DTColumnBuilder, $filter, $compile) {
        var vm = this;
        vm.translateFilter = $filter('translate');
        //vm.dtPartnerInstance = {};
        vm.applicationOpen = true;

        vm.Init = function () {
            vm.user = UserProfile.getProfile();
            vm.serviceFees = { serviceId: 6, serviceFee: [] };

            var loop1 = false;
            $scope.$watch('vm.serviceFees.serviceFee', function (newVal, oldVal) {
                if (newVal.length != 0 && vm.activityFees == undefined && loop1 == false) {
                    vm.activityFees = newVal;
                    vm.serviceFees.serviceFee = vm.foreignJournalists.applicationDetail.payments[0].paymentDetails;
                    vm.foreignJournalists.selectActivities = [];
                    for (var id in vm.serviceFees.serviceFee) {
                        vm.foreignJournalists.selectActivities.push(vm.serviceFees.serviceFee[id].economicActivity)
                    }
                    vm.serviceFees.reloadTable();
                    loop1 = true;
                }
            });
        };

        //Get the details of the submitted Form to edit
        $http.get($rootScope.app.httpSource + 'api/Journalist/GetById?id=' + $state.params.id)
         .then(function (response) {
             vm.foreignJournalists = response.data;
             vm.Init();
         });
    }

    ReviewForeignJournalistsController.$inject = ['$rootScope', '$scope', '$http', '$stateParams', '$state',   '$window', '$uibModal', 'UserProfile', 'DTOptionsBuilder',
        'DTColumnBuilder', '$filter', '$compile'];

})();