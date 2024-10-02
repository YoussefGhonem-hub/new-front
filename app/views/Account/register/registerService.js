(function () {
    'use strict';

    angular
        .module('eServices')
        .factory('RegisterService', RegisterService);
    /* @ngInject */
    function RegisterService() {
        var registeredUser = {};

        var setRegisteredUser = function (userId, phoneNumber) {
            registeredUser.userId = userId;
            registeredUser.phoneNumber = phoneNumber;
        };

        var getRegisteredUser = function () {
            return registeredUser;
        }

        return {
            setRegisteredUser: setRegisteredUser,
            getRegisteredUser: getRegisteredUser
        }
    }
    RegisterService.$inject = [];

})();