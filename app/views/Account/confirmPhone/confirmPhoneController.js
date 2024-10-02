/**=========================================================
 * Module: LoginController.js
 * Controller for the Chat APP 
 =========================================================*/

(function () {
    'use strict';

    angular
        .module('eServices')
        .controller('ConfirmPhoneController', ConfirmPhoneController);
    /* @ngInject */
    function ConfirmPhoneController($rootScope, UserProfile, $http, $stateParams, $state, RegisterService) {
        var vm = this;
        vm.user = UserProfile.getProfile();
        vm.registeredUser = {}
        vm.registeredUser.userId = RegisterService.getRegisteredUser().userId;
        vm.registeredUser.phoneNumber = RegisterService.getRegisteredUser().phoneNumber;

        vm.sendCode = function () {
            vm.isBusy = true;
            $http.post($rootScope.app.httpSource + 'api/Account/VerifyPhoneNumber', vm.registeredUser)
                .then(function (response) {
                    vm.isBusy = false;
                    if (response.data == "PhoneVerified" || "Phone Number is already verified")
                        if (vm.user.userProfileCompleted == 'True')
                        {
                            $state.go('app.dashboard', null, { reload: true });
                        }
                        else
                        {
                            $state.go('page.completeProfile', null, { reload: true });
                        }
                    else
                        vm.invalidCode = true;
                },
                function (response) {
                    vm.isBusy = false;
                });
        };

        vm.resendCode = function () {
            vm.isBusy = true;
            //$http.defaults.withCredentials = true;
            //$http.defaults.headers.common['Authorization'] = 'Bearer ' + sessionStorage.getItem('accessToken');

            $http.post($rootScope.app.httpSource + 'api/Account/ResendPhoneNumberCode', vm.registeredUser)
                .then(function (response) {
                    vm.isBusy = false;
                },
                function (response) {
                    vm.isBusy = false;
                });
        };

        vm.proceed = function () {
            vm.isBusy = true;
            if (vm.user.userProfileCompleted == 'True') {
                $state.go('app.dashboard', null, { reload: true });
            }
            else {
                $state.go('page.completeProfile', null, { reload: true });
            }
        };
    }

    ConfirmPhoneController.$inject = ['$rootScope', 'UserProfile', '$http', '$stateParams', '$state', 'RegisterService'];
})();