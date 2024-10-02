/**=========================================================
 * Module: LoginController.js
 * Controller for the Chat APP 
 =========================================================*/

(function () {
    'use strict';

    angular
        .module('eServices')
        .controller('reviewAerialFilmingLocationController', reviewFilmingLocationController);
    /* @ngInject */
    function reviewFilmingLocationController($rootScope, $scope, $uibModalInstance, $filter, location) {
        if (location == null) {
            $scope.location = {};
            $scope.location.address = {};
            $scope.location.id = 0;
        }
        else
        {
            $scope.location = location;
        }

        $scope.ok = function () {
            $uibModalInstance.close($scope.location);
        };

        $scope.closeModal = function () {
            $uibModalInstance.dismiss('cancel');
        };
    }

    reviewFilmingLocationController.$inject = ['$rootScope', '$scope', '$uibModalInstance', '$filter', 'location'];
})();