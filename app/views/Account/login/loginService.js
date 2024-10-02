(function () {
    'use strict';

    angular
        .module('eServices')
        .factory('LoginService', LoginService);
    /* @ngInject */
    function LoginService($http, $rootScope, $window, UserProfile) {

        this.login = function (userLogin) {
            var resp = $http({
                url: $rootScope.app.httpSource + 'TOKEN',
                method: 'POST',
                data: $.param({
                    grant_type: 'password',
                    username: userLogin.userName,
                    password: userLogin.password
                }),
                headers: { 'Content-Type': 'application/x-www-form-urlencoded' }
            });
            return resp;
        };

        this.logout = function () {
            $http.post($rootScope.app.httpSource + 'api/Account/Logout').then(function (res) {

                switch (res.data.userType) {
                    case 'SmartPass':
                        $http.get(res.data.data).then(function (res2) {
                            UserProfile.removeallcookies();
                            if (res2.data != '') {
                                var form = $(res2.data);
                                $(document.body).append(form);
                                form.submit();
                            }
                        }, function (err2) {
                            UserProfile.removeallcookies();
                        });

                        break;
                    case 'UaePass':
                        UserProfile.removeallcookies();
                        $window.location.href = res.data.data;
                        //$http.get(res.data.data).then(function (res2) {
                        //    UserProfile.removeallcookies();
                        //}, function (res2err) {
                        //    UserProfile.removeallcookies();
                        //});
                        break;
                    default:
                        UserProfile.removeallcookies();
                        break;

                }

            }, function (err) {
                UserProfile.removeallcookies();
            });
        };

        return {
            login: this.login,
            logout: this.logout
        };
    }
    LoginService.$inject = ['$http', '$rootScope', '$window', 'UserProfile'];

})();