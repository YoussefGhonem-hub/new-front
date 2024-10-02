(function() {
    'use strict';

    angular
        .module('eServices')
        .controller('SendSMSController', SendSMSController);

    function SendSMSController($rootScope, $http, $scope, $uibModalInstance) {

        $scope.closeModal = function() {
            $uibModalInstance.dismiss();
        };

        $scope.send = function (sendSMS) {
            $uibModalInstance.close(sendSMS);
        };
    }

    SendSMSController.$inject = ['$rootScope', '$http', '$scope', '$uibModalInstance'];
})();