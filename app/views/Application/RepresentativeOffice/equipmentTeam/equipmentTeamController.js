/**=========================================================
 * Module: LoginController.js
 * Controller for the Chat APP 
 =========================================================*/

(function () {
    'use strict';

    angular
        .module('eServices')
        .controller('EquipmentTeamController', EquipmentTeamController);
    /* @ngInject */
    function EquipmentTeamController($rootScope, $scope, $uibModalInstance, $filter, teamMember) {
        $scope.teamMember = {};
        $scope.teamMember.person = {};
        if (teamMember != undefined && teamMember != null)
        {
            $scope.teamMember = teamMember;
        }
        $scope.ok = function () {
            $uibModalInstance.close($scope.teamMember);
        };

        $scope.closeModal = function () {
            $uibModalInstance.dismiss('cancel');
        };

    }

    EquipmentTeamController.$inject = ['$rootScope', '$scope', '$uibModalInstance', '$filter', 'teamMember'];
})();