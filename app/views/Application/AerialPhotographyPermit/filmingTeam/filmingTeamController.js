/**=========================================================
 * Module: LoginController.js
 * Controller for the Chat APP 
 =========================================================*/

(function () {
    'use strict';

    angular
        .module('eServices')
        .controller('AerialFilmingTeamController', AerialFilmingTeamController);
    /* @ngInject */
    function AerialFilmingTeamController($rootScope, $scope, $uibModalInstance, $filter, teamMember) {
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

    AerialFilmingTeamController.$inject = ['$rootScope', '$scope', '$uibModalInstance', '$filter', 'teamMember'];
})();