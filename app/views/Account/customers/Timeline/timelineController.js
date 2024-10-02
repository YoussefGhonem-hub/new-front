/**=========================================================
 * Module: DashboardController.js
 =========================================================*/

(function () {
    'use strict';

    angular
        .module('eServices')
        .controller('CustomerTimelineController', CustomerTimelineController);

    CustomerTimelineController.$inject = ['$rootScope', '$scope', '$uibModalInstance', '$filter', 'userProfile'];
    function CustomerTimelineController($rootScope, $scope, $uibModalInstance, $filter, userProfile) {
        $scope.userProfile = userProfile;
        $scope.thirdPartyApprovalUrl = 'api/Upload/UploadFile?uploadFile=ThirdPartyApprovalPath';

        $scope.closeModal = function () {
            $uibModalInstance.dismiss();
        };
    }
})();
