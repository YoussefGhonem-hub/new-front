/**=========================================================
 * Module: LoginController.js
 * Controller for the Chat APP 
 =========================================================*/

(function () {
    'use strict';

    angular
        .module('eServices')
        .controller('reviewEquipmentListController', reviewEquipmentListController);
    /* @ngInject */
    function reviewEquipmentListController($rootScope, $scope, $uibModalInstance, $filter, equipment) {
        if (equipment == null) {
            $scope.equipment = {};
            $scope.equipment.photoEquipment = {};
            $scope.equipment.id = 0;
        }
        else
        {
            $scope.equipment = equipment;
        }

        $scope.ok = function () {
            $uibModalInstance.close($scope.equipment);
        };

        $scope.closeModal = function () {
            $uibModalInstance.dismiss('cancel');
        };
    }

    reviewEquipmentListController.$inject = ['$rootScope', '$scope', '$uibModalInstance', '$filter', 'equipment'];
})();