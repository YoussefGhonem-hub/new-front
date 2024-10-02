/**=========================================================
 * Module: LoginController.js
 * Controller for the Chat APP 
 =========================================================*/

(function () {
    'use strict';

    angular
        .module('eServices')
        .controller('reviewFilmingTeamController', reviewFilmingTeamController);
    /* @ngInject */
    function reviewFilmingTeamController($rootScope, $scope, $uibModalInstance, $filter, teamMember) {
        if (teamMember == null) {
            $scope.teamMember = {};
            $scope.teamMember.person = {};
            $scope.teamMember.id = 0;
        }
        else
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

    reviewFilmingTeamController.$inject = ['$rootScope', '$scope', '$uibModalInstance', '$filter', 'teamMember'];
})();