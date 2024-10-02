/**=========================================================
 * Module: LoginController.js
 * Controller for the Chat APP 
 =========================================================*/

(function () {
    'use strict';

    angular
        .module('eServices')
        .controller('VisitRetainedMaterialController', VisitRetainedMaterialController);
    /* @ngInject */
    function VisitRetainedMaterialController($rootScope, $scope, $uibModalInstance, $filter, $http, retainedMaterial) {

        $scope.retainedMaterial = {};

        if (retainedMaterial != undefined) {
            $scope.retainedMaterial = retainedMaterial;
        }
        $scope.ok = function () {
            $uibModalInstance.close($scope.retainedMaterial);
        };

        $scope.closeModal = function () {
            $uibModalInstance.dismiss('cancel');
        };

        //Load Material type
        $http.get($rootScope.app.httpSource + 'api/MaterialType')
            .then(function (response) {
                $scope.materialtypes = response.data;
            });
    }

    VisitRetainedMaterialController.$inject = ['$rootScope', '$scope', '$uibModalInstance', '$filter', '$http', 'retainedMaterial'];
})();