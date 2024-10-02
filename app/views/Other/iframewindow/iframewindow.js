/**=========================================================
 * Module: DashboardController.js
 =========================================================*/

(function() {
    'use strict';

    angular
        .module('eServices')
        .controller('iframewindowController', iframewindowController);

    iframewindowController.$inject = ['$rootScope', '$http', '$scope', '$uibModalInstance', '$filter', 'data'];
    function iframewindowController($rootScope, $http ,$scope, $uibModalInstance, $filter, data) {
        $scope.windowTitle = data.title;
        $scope.windowUrl = data.url;

        $scope.closeModal = function () {
            $uibModalInstance.dismiss('cancel');
        };

    }
})();
