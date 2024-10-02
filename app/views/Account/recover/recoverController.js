/**=========================================================
 * Module: LoginController.js
 * Controller for the Chat APP 
 =========================================================*/

(function () {
    'use strict';

    angular
        .module('eServices')
        .controller('RecoverController', RecoverController);
    /* @ngInject */
    function RecoverController($rootScope, $scope, SweetAlert, $http, $filter, $state) {
        var vm = this;
        vm.account = {};

        vm.recoverPassword = function () {
            $http.post($rootScope.app.httpSource + 'api/Account/ResetPassword', vm.account)
                .then(function (response) {
                    SweetAlert.swal($filter('translate')('recover.reset'), $filter('translate')('recover.emailSent'), "success");
                    $state.go('page.login');
                },
                function (response) { // optional
                    alert('failed')
                });
        }
        
    }
    RecoverController.$inject = ['$rootScope', '$scope', 'SweetAlert', '$http', '$filter', '$state'];

})();