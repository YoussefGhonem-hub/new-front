
(function () {
    'use strict';

    angular
        .module('eServices')
        .controller('VisitPhotoController', VisitPhotoController);
    /* @ngInject */
    function VisitPhotoController($rootScope, $scope, $uibModalInstance, $filter, violationphotos) {
        $scope.violationphotos = {};
        $scope.uploadViolationPhotoUrl = 'api/Upload/UploadFile?uploadFile=InspectionViolationPhoto';

        if (violationphotos != undefined) {
            $scope.violationphotos = violationphotos;
        }
        $scope.ok = function () {
            // Get the size of an object
            $scope.size = Object.size($scope.violationphotos);
            if (!$scope.size > 0) {
                $scope.showRequiredError = true;
                return;
            }
            $uibModalInstance.close($scope.violationphotos);
        };

        $scope.closeModal = function () {
            $uibModalInstance.dismiss('cancel');
        };
        Object.size = function (obj) {
            var size = 0, key;
            for (key in obj) {
                if (obj.hasOwnProperty(key)) size++;
            }
            return size;
        };
    }

    VisitPhotoController.$inject = ['$rootScope', '$scope', '$uibModalInstance', '$filter', 'violationphotos'];
})();