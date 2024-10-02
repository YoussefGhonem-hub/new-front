(function () {
    'use strict';

    angular
        .module('eServices')
        .controller('LockUserController', LockUserController);

    function LockUserController($rootScope, $http, $scope, $uibModalInstance) {

        $scope.closeModal = function () {
            $uibModalInstance.dismiss();
        };

        $scope.send = function (emailMessage) {
            $uibModalInstance.close(emailMessage);
        };
    }

    LockUserController.$inject = ['$rootScope', '$http', '$scope', '$uibModalInstance'];
})();