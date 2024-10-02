/**=========================================================
 * Module: LoginController.js
 * Controller for the Chat APP 
 =========================================================*/

(function () {
    'use strict';

    angular
        .module('eServices')
        .controller('LoginController', LoginController);
    /* @ngInject */
    function LoginController($rootScope, $scope, LoginService, UserProfile, $state, SweetAlert, $http, $filter, RegisterService, rememberMeService, $uibModal, $window) {
        var vm = this;

        vm.$rootScope = $rootScope;
        vm.responseData = "";
        vm.userName = "";
        vm.userEmail = "";
        vm.userPassword = "";
        vm.accessToken = "";
        vm.refreshToken = "";
        vm.invalidCredential = false;
        vm.emailConfirmed = true;
        vm.showSmartpasslogin = true;

        // Base64 encoding service used by AuthenticationService
        var Base64 = {

            keyStr: 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/=',

            encode: function (input) {
                var output = "";
                var chr1, chr2, chr3 = "";
                var enc1, enc2, enc3, enc4 = "";
                var i = 0;

                do {
                    chr1 = input.charCodeAt(i++);
                    chr2 = input.charCodeAt(i++);
                    chr3 = input.charCodeAt(i++);

                    enc1 = chr1 >> 2;
                    enc2 = ((chr1 & 3) << 4) | (chr2 >> 4);
                    enc3 = ((chr2 & 15) << 2) | (chr3 >> 6);
                    enc4 = chr3 & 63;

                    if (isNaN(chr2)) {
                        enc3 = enc4 = 64;
                    } else if (isNaN(chr3)) {
                        enc4 = 64;
                    }

                    output = output +
                        this.keyStr.charAt(enc1) +
                        this.keyStr.charAt(enc2) +
                        this.keyStr.charAt(enc3) +
                        this.keyStr.charAt(enc4);
                    chr1 = chr2 = chr3 = "";
                    enc1 = enc2 = enc3 = enc4 = "";
                } while (i < input.length);

                return output;
            },

            decode: function (input) {
                var output = "";
                var chr1, chr2, chr3 = "";
                var enc1, enc2, enc3, enc4 = "";
                var i = 0;

                // remove all characters that are not A-Z, a-z, 0-9, +, /, or =
                var base64test = /[^A-Za-z0-9\+\/\=]/g;
                if (base64test.exec(input)) {
                    window.alert("There were invalid base64 characters in the input text.\n" +
                        "Valid base64 characters are A-Z, a-z, 0-9, '+', '/',and '='\n" +
                        "Expect errors in decoding.");
                }
                input = input.replace(/[^A-Za-z0-9\+\/\=]/g, "");

                do {
                    enc1 = this.keyStr.indexOf(input.charAt(i++));
                    enc2 = this.keyStr.indexOf(input.charAt(i++));
                    enc3 = this.keyStr.indexOf(input.charAt(i++));
                    enc4 = this.keyStr.indexOf(input.charAt(i++));

                    chr1 = (enc1 << 2) | (enc2 >> 4);
                    chr2 = ((enc2 & 15) << 4) | (enc3 >> 2);
                    chr3 = ((enc3 & 3) << 6) | enc4;

                    output = output + String.fromCharCode(chr1);

                    if (enc3 != 64) {
                        output = output + String.fromCharCode(chr2);
                    }
                    if (enc4 != 64) {
                        output = output + String.fromCharCode(chr3);
                    }

                    chr1 = chr2 = chr3 = "";
                    enc1 = enc2 = enc3 = enc4 = "";

                } while (i < input.length);

                return output;
            }
        };

        if (rememberMeService('7ZXYZ@L') && rememberMeService('UU@#90')) {
            vm.userEmail = Base64.decode(rememberMeService('7ZXYZ@L'));
            vm.userPassword = Base64.decode(rememberMeService('UU@#90'));
            vm.remember = true;
        }

        vm.loginResponse_success = function (resp) {
            if (resp.status == 400) {
                vm.loginResponse_faild(resp);
            }
            else {
                vm.userName = resp.data.userName;
                vm.isBusy = false;
                if (resp.data.lang == "null") {
                    resp.data.lang = null;
                }
                if (resp.data.smartpassPersonId == "null") {
                    resp.data.smartpassPersonId = null;
                }

                if (resp.data.requireOTP == "True") {
                    var modalInstance = $uibModal.open({
                        templateUrl: 'app/views/Account/login/OTP/verifyOTP.html',
                        controller: 'VerifyOTPController',
                        size: 'sm',
                        backdrop: 'static'
                    });

                    modalInstance.result.then(function (isSuccess) {
                        if (isSuccess) {
                            vm.setLoginParams(resp.data);
                        }
                    }, function () { });
                }
                else {
                    vm.setLoginParams(resp.data);
                }
            }
        };

        vm.loginResponse_faild = function (response) {
            vm.isBusy = false;
            if (response.data.error == "invalid_grant") {
                vm.emailConfirmed = true;
                vm.invalidCredential = true;
                vm.userLocked = false;
            }
            if (response.data.error == "email_not_confirmed") {
                vm.emailConfirmed = false;
                vm.invalidCredential = false;
                vm.userLocked = false;
            }
            if (response.data.error == "user_locked") {
                vm.userLocked = true;
                vm.invalidCredential = false;
                vm.emailConfirmed = true;
            }
            vm.responseData = response.statusText + " : \r\n";
            if (response.data.error) {
                vm.responseData += response.data.error_description;
            }
        };

        vm.login = function () {
            var userLogin = {
                grant_type: 'password',
                userName: vm.userEmail,
                password: vm.userPassword
            };
            vm.responseData = '';
            var loginResult = LoginService.login(userLogin);

            vm.isBusy = true;
            loginResult.then(vm.loginResponse_success, vm.loginResponse_faild);
        };

        vm.rememberMe = function () {
            if (vm.remember) {
                rememberMeService('7ZXYZ@L', Base64.encode(vm.userEmail).trim());
                rememberMeService('UU@#90', Base64.encode(vm.userPassword).trim());
            } else {
                rememberMeService('7ZXYZ@L', '');
                rememberMeService('UU@#90', '');
            }
        };

        vm.resendConfirmEmail = function () {
            vm.account = {};
            vm.account.email = vm.userEmail;
            vm.isBusy = true;

            $http.post($rootScope.app.httpSource + 'api/Account/ResendConfirmEmail', vm.account)
                .then(function (response) {
                    SweetAlert.swal($filter('translate')('general.ok'), $filter('translate')('register.successful'), "success");
                    vm.emailConfirmed = true;
                    vm.invalidCredential = false;
                    vm.isBusy = false;
                },
                    function (response) { // optional
                        vm.isBusy = false;
                    });
        };

        vm.setLoginParams = function (profileData) {
            UserProfile.setProfile(profileData.userName, profileData.access_token, profileData.refreshToken, profileData.firstName, profileData.lastName, profileData.emailConfirmed,
                profileData.phoneNumber, profileData.phoneNumberConfirmed, profileData.userProfileCompleted, profileData.userPhotoUrl, profileData.lastLoginDate,
                profileData.userTypeCode, profileData.smartpassPersonId, profileData.lang, profileData.requireOTP);

            ga('set', 'userId', profileData.userName);

            if (profileData.phoneNumberConfirmed == "True") {
                if (profileData.userProfileCompleted == "True") {
                    //check empInspection matchs condition redirect to original URL
                    if (sessionStorage.getItem('empInspection') != null && sessionStorage.getItem('empInspection') != "" && sessionStorage.getItem('empInspection').startsWith("/app/Task/Review/")) {
                        var spliturl = sessionStorage.empInspection.split('/');
                        for (var i = 0; i < spliturl.length; i++) {
                            if (typeof parseInt(spliturl[i]) === 'number' && (parseInt(spliturl[i]) % 1) === 0) {
                                $state.go('app.ReviewTask', { id: parseInt(spliturl[i]) })
                            }
                        }
                    }

                }
            }

            if (profileData.lang)
                vm.$rootScope.language.set(profileData.lang);

            if (profileData.phoneNumberConfirmed == "True") {
                if (profileData.userProfileCompleted == "True") {
                    $state.go('app.dashboard', null, { reload: true });
                }
                else {
                    $state.go('page.completeProfile', null, { reload: true });
                }
            }
            else {
                RegisterService.setRegisteredUser("asd", profileData.phoneNumber);
                $state.go('page.confirmPhone', null, { reload: true });
            }
        };


        vm.uaepasslogin = function (lang) {
            vm.isBusy = true;
            $http.get($rootScope.app.httpSource + 'api' + '/OAuth2/Auth?provider=UAEPass', { headers: { 'lang': lang } })
                .then(function (res) {
                    $window.location.href = res.data;
                    //vm.isBusy = false;
                },
                    function (erroresp) {
                        vm.isBusy = false;
                    });
        };

        $scope.init = function () {

            if ($state.params.tkt) {
                if ($state.params.tkt == "er") {

                    if ($state.params.smpl == 0) {
                        $state.go('page.uaepasslogin', { st: 0, dt: 0 });
                    } else if ($state.params.smpl == 1) {
                        var __msg = $filter('translate')('UAEPass.loginerror');
                        SweetAlert.swal(__msg);
                    }
                } else {
                    var userLogin = {
                        grant_type: 'password',
                        userName: "",
                        password: $state.params.tkt
                    };
                    vm.responseData = '';
                    var loginResult = LoginService.login(userLogin);
                    vm.isBusy = true;
                    loginResult.then(vm.loginResponse_success, vm.loginResponse_faild);
                }

            }
        };
    }

    LoginController.$inject = ['$rootScope', '$scope', 'LoginService', 'UserProfile', '$state', 'SweetAlert', '$http', '$filter', 'RegisterService', 'rememberMeService', '$uibModal', '$window'];

})();