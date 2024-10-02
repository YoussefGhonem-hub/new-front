/**=========================================================
 * Module: LoginController.js
 * Controller for the Chat APP 
 =========================================================*/

(function () {
    'use strict';

    angular
        .module('eServices')
        .controller('VerifyOTPController', VerifyOTPController);
    /* @ngInject */
    function VerifyOTPController($rootScope, $scope, $uibModalInstance, $http, $filter) {

        $scope.start = function () {
            $scope.isBusy = false;

            $('#countdown').countdown360({
                radius: 80,
                seconds: 120,
                strokeWidth: 10,
                fillStyle: '#f7f8f9',
                strokeStyle: '#337dc6',
                fontSize: 40,
                fontColor: '#696969',
                autostart: false,
                onComplete: function () {
                    $uibModalInstance.dismiss('cancel');
                }
            }).start();
        };


        $scope.ok = function () {
            $scope.isBusy = true;
            $http.get($rootScope.app.httpSource + 'api/Account/VerifyPhoneOTP?code=' + $scope.otpToken)
                .then(function (response) {
                    $uibModalInstance.close(true);
                    $scope.isBusy = false;
                },
                    function (response) { // optional
                        $scope.isBusy = false;
                        alert('error');
                    });
        };

        $scope.closeModal = function () {
            $uibModalInstance.dismiss('cancel');
        };
    }

    VerifyOTPController.$inject = ['$rootScope', '$scope', '$uibModalInstance', '$http', '$filter'];
})();