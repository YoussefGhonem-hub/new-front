(function () {
    'use strict';

    angular
        .module('eServices')
        .controller('SendEmailController', SendEmailController);

    function SendEmailController($rootScope, $http, $scope, $uibModalInstance) {

        $scope.closeModal = function () {
            $uibModalInstance.dismiss();
        };

        $scope.send = function (emailMessage) {
            $uibModalInstance.close(emailMessage);
        };
    }

    SendEmailController.$inject = ['$rootScope', '$http', '$scope', '$uibModalInstance'];
})();