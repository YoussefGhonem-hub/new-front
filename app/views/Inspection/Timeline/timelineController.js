/**=========================================================
 * Module: DashboardController.js
 =========================================================*/

(function () {
    'use strict';

    angular
        .module('eServices')
        .controller('InspectionTimelineController', InspectionTimelineController);

    InspectionTimelineController.$inject = ['$rootScope', '$scope', '$uibModalInstance', '$filter', 'visit'];
    function InspectionTimelineController($rootScope, $scope, $uibModalInstance, $filter, visit) {
        $scope.visit = visit;
        $scope.thirdPartyApprovalUrl = 'api/Upload/UploadFile?uploadFile=ThirdPartyApprovalPath';

        $scope.closeModal = function () {
            $uibModalInstance.dismiss();
        };
    }
})();
