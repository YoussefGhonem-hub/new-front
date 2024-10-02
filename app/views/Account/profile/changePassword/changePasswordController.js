/**=========================================================
 * Module: LoginController.js
 * Controller for the Chat APP 
 =========================================================*/

(function () {
    'use strict';

    angular
        .module('eServices')
        .controller('ChangePasswordController', ChangePasswordController);
    /* @ngInject */
    function ChangePasswordController($rootScope, $scope, $uibModalInstance, $http, $filter) {
        $scope.ok = function () {
            var newPassword = {};
            newPassword.oldPassword = $scope.oldPassword;
            newPassword.newPassword = $scope.newPassword;
            newPassword.confirmPassword = $scope.confirmPassword;

            if (newPassword.newPassword !== newPassword.confirmPassword) {
                $scope.passwordCompare = true;
                return;
            }
            else {
                $scope.passwordCompare = false;

                $http.post($rootScope.app.httpSource + 'api/Account/ChangePassword', newPassword)
                    .then(function (response) {
                        $uibModalInstance.close($scope.establishmentPartner);
                        vm.isBusy = false;
                    },
                    function (response) { // optional
                        alert('error');
                    });
            }
        };

        $scope.closeModal = function () {
            $uibModalInstance.dismiss('cancel');
        };
    }

    ChangePasswordController.$inject = ['$rootScope', '$scope', '$uibModalInstance', '$http', '$filter'];
})();