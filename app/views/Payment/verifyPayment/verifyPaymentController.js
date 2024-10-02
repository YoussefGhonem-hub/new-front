/**=========================================================
 * Module: LoginController.js
 * Controller for the Chat APP 
 =========================================================*/

(function () {
    'use strict';

    angular
        .module('eServices')
        .controller('VerifyPaymentController', VerifyPaymentController);
    /* @ngInject */
    function VerifyPaymentController($rootScope, $window, $scope, $uibModalInstance, $filter, applicationDetailId, visitId, $http, $state) {
        var VerifyPaymentURL = '';
        if(visitId == null && applicationDetailId != null)
        {
            VerifyPaymentURL = $rootScope.app.httpSource + '/api/Payment/VerifyPayment?applicationDetailId=' + applicationDetailId;
        } else if (visitId != null && applicationDetailId == null)
        {
            VerifyPaymentURL = $rootScope.app.httpSource + '/api/Payment/VerifyPayment_Visit?visitId=' + visitId;
        }

        $http.get(VerifyPaymentURL)
          .then(function (response) {
              $state.go('app.payment.transactionResponse', { pun: response.data });
              $uibModalInstance.close();
          }, function (response) {
              $scope.closeModal = function () {
                  $uibModalInstance.dismiss('cancel');
              };
          });
    }

    VerifyPaymentController.$inject = ['$rootScope', '$window', '$scope', '$uibModalInstance', '$filter', 'applicationDetailId','visitId', '$http', '$state'];
})();