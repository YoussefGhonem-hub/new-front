/**=========================================================
 * Module: LoginController.js
 * Controller for the Chat APP 
 =========================================================*/

(function () {
    'use strict';

    angular
        .module('eServices')
        .controller('ActionListController', ActionListController);
    /* @ngInject */
    function ActionListController($rootScope, $scope, $uibModalInstance, $filter, $http, reportAction, mediaMaterialTypeId) {
        $scope.reportAction = {};
        $scope.mediaMaterialTypeId = mediaMaterialTypeId;

        $http.get($rootScope.app.httpSource + 'api/MediaMaterialReportAction')
            .then(function (response) {
                $scope.mediaMaterialReportActions = response.data;
            },
            function (response) { // optional
                alert('failed');
            });

        if (mediaMaterialTypeId != 9) {
            $scope.reportAction.sceneTime = new Date();
            $scope.reportAction.sceneTime.setHours(0);
            $scope.reportAction.sceneTime.setMinutes(0);
            $scope.reportAction.sceneTime.setSeconds(0);
        }

        if (reportAction != undefined) {
            $scope.reportAction = reportAction;
        }
        $scope.ok = function () {
            $uibModalInstance.close($scope.reportAction);
        };

        $scope.closeModal = function () {
            $uibModalInstance.dismiss('cancel');
        };
    }

    ActionListController.$inject = ['$rootScope', '$scope', '$uibModalInstance', '$filter', '$http', 'reportAction', 'mediaMaterialTypeId'];
})();