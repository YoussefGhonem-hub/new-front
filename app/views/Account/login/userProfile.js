(function () {
    'use strict';

    angular
        .module('eServices')
        .factory('UserProfile', ['$cookies', '$http', '$rootScope', function UserProfile(ngCookies, $http, $rootScope) {
            var UserProfileServices = this;
            UserProfileServices.Profile = null;

            var setProfile = function (userName, token, refreshToken, firstName, lastName, emailConfirmed, phoneNumber, phoneNumberConfirmed, userProfileCompleted, userPhotoUrl,
                lastLoginDate, userTypeCode, smartpassPersonId, lang, requireOTP) {
                UserProfileServices.Profile = null;
                ngCookies.put('userName', userName);
                ngCookies.put('accessToken', token);
                ngCookies.put('refreshToken', refreshToken);
                ngCookies.put('firstName', firstName);
                ngCookies.put('lastName', lastName);
                ngCookies.put('emailConfirmed', emailConfirmed);
                ngCookies.put('phoneNumber', phoneNumber);
                ngCookies.put('phoneNumberConfirmed', phoneNumberConfirmed);
                ngCookies.put('userProfileCompleted', userProfileCompleted);
                ngCookies.put('userPhotoUrl', userPhotoUrl);
                ngCookies.put('lastLoginDate', lastLoginDate);
                ngCookies.put('userTypeCode', userTypeCode);                
                ngCookies.put('smartpassPersonId', smartpassPersonId);
                ngCookies.put('lang', lang);
                ngCookies.put('requireOTP', requireOTP);
            };

            var setUserTypeCode = function (userTypeCode) {
                ngCookies.put('userTypeCode', userTypeCode);
            };

            var setRequireOTP = function (requireOTP) {
                ngCookies.put('requireOTP', requireOTP);
            };

            var getProfile = function () {
                if (UserProfileServices.Profile == null) {
                    UserProfileServices.Profile = {
                        isLoggedIn: ngCookies.get('accessToken') != null,
                        username: ngCookies.get('userName'),
                        token: ngCookies.get('accessToken'),
                        refreshToken: ngCookies.get('refreshToken'),
                        firstName: ngCookies.get('firstName'),
                        lastName: ngCookies.get('lastName'),
                        emailConfirmed: ngCookies.get('emailConfirmed'),
                        phoneNumber: ngCookies.get('phoneNumber'),
                        phoneNumberConfirmed: ngCookies.get('phoneNumberConfirmed'),
                        userProfileCompleted: ngCookies.get('userProfileCompleted'),
                        userPhotoUrl: ngCookies.get('userPhotoUrl'),
                        lastLoginDate: ngCookies.get('lastLoginDate'),
                        userTypeCode: ngCookies.get('userTypeCode'),
                        smartpassPersonId: ((ngCookies.get('smartpassPersonId') == "null" || ngCookies.get('smartpassPersonId') == "undefined") ? null : ngCookies.get('smartpassPersonId')),
                        lang: ((ngCookies.get('lang') == "null" || ngCookies.get('lang') == "undefined") ? null : ngCookies.get('lang')),
                        requireOTP: ((ngCookies.get('requireOTP') == "True" || ngCookies.get('requireOTP') == "true" || ngCookies.get('requireOTP') == true) ? true : false),
                        roles: []
                    };
                    if (UserProfileServices.Profile && UserProfileServices.Profile.isLoggedIn) {
                        $http.get($rootScope.app.httpSource + 'api/roles/GetCurrentUserGroupMasked')
                                                   .then(function (response) {
                                                       UserProfileServices.Profile.roles = response.data;
                                                   },
                                                   function (response) {

                                                   });
                    }

                }
                return UserProfileServices.Profile;
            };

            var removeallcookies = function () {
                UserProfileServices.Profile = null;
                ngCookies.remove('.AspNet.Cookies');
                ngCookies.remove('accessToken');
                ngCookies.remove('userName');
                ngCookies.remove('refreshToken');
                ngCookies.remove('firstName');
                ngCookies.remove('lastName');
                ngCookies.remove('emailConfirmed');
                ngCookies.remove('phoneNumber');
                ngCookies.remove('phoneNumberConfirmed');
                ngCookies.remove('userProfileCompleted');
                ngCookies.remove('userPhotoUrl');
                ngCookies.remove('lastLoginDate');
                ngCookies.remove('userTypeCode');
                ngCookies.remove('smartpassPersonId');
                ngCookies.remove('lang');
                ngCookies.remove('requireOTP');
                ngCookies.remove('xxx');
            };

            return {
                setProfile: setProfile,
                getProfile: getProfile,
                setUserTypeCode: setUserTypeCode,
                removeallcookies: removeallcookies,
                setRequireOTP: setRequireOTP
            }
        }])
})();