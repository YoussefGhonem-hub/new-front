/**=========================================================
 * Module: DashboardController.js
 =========================================================*/

(function () {
    'use strict';

    angular
        .module('eServices')
        .controller('TimelineController', TimelineController);

    TimelineController.$inject = ['$rootScope', '$scope', '$uibModalInstance', '$filter', 'applicationDetail', 'application'];
    function TimelineController($rootScope, $scope, $uibModalInstance, $filter, applicationDetail, application) {
        $scope.applicationDetail = applicationDetail;
        $scope.application = application;

        $scope.closeModal = function () {
            $uibModalInstance.dismiss();
        };
    }
})();
