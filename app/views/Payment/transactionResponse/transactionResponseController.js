/**=========================================================
 * Module: LoginController.js
 * Controller for the Chat APP 
 =========================================================*/

(function () {
    'use strict';

    angular
        .module('eServices')
        .controller('TransactionResponseController', TransactionResponseController);
    /* @ngInject */
    TransactionResponseController.$inject = ['$rootScope', '$scope', '$http', '$stateParams', '$state', '$uibModal', 'UserProfile','SweetAlert','$window','$filter'];

    function TransactionResponseController($rootScope, $scope, $http, $stateParams, $state, $uibModal, UserProfile, SweetAlert, $window, $filter) {
        var vm = this;
        if ($state.params === undefined || $state.params.pun === undefined || $state.params.pun === "") {
            $state.go('app.dashboard');
        }
        else {
            $http.get($rootScope.app.httpSource + 'api/Payment/GetPaymentReceipt?PUN=' + $state.params.pun)
                .then(function (response) {
                    vm.paymentReceipt = response.data;
                });


            vm.printReceipt = function (paymentReceiptFullUrl) {
                var url = $state.href('paymentReceipt', {pun: $state.params.pun});
                $window.open(url,'_blank');
            }
        }

    }
})();