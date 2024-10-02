/**=========================================================
 * Module: LoginController.js
 * Controller for the Chat APP 
 =========================================================*/

(function () {
    'use strict';

    angular
        .module('eServices')
        .controller('EquipmentListController', EquipmentListController);
    /* @ngInject */
    function EquipmentListController($rootScope, $scope, $uibModalInstance, $filter, $http, equipment) {
        $scope.equipment = {};

        $http.get($rootScope.app.httpSource + 'api/PhotoEquipment')
            .then(function (response) {
                $scope.photoEquipments = response.data;
            },
            function (response) { // optional
                alert('failed');
            });

        if (equipment != undefined)
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

    EquipmentListController.$inject = ['$rootScope', '$scope', '$uibModalInstance', '$filter', '$http', 'equipment'];
})();