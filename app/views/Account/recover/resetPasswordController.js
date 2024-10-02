/**=========================================================
 * Module: LoginController.js
 * Controller for the Chat APP 
 =========================================================*/

(function () {
    'use strict';

    angular
        .module('eServices')
        .controller('ResetPasswordController', ResetPasswordController);
    /* @ngInject */
    function ResetPasswordController($rootScope, $scope, $http, $stateParams, $state) {
        var vm = this;
        vm.passwordObj = {};
        vm.passwordObj.userId = $stateParams.userId;
        vm.passwordObj.code = $stateParams.code;

        vm.resetPassword = function () {
            $http.post($rootScope.app.httpSource + 'api/Account/ResetPasswordWithToken', vm.passwordObj)
                .then(function (response) {
                    if (response.data == "PasswordReset")
                        $state.go('page.login');
                    else
                        alert('failed');
                },
                function (response) { // optional
                    alert('failed');
                });
        }
    }

    ResetPasswordController.$inject = ['$rootScope', '$scope', '$http', '$stateParams', '$state'];

})();