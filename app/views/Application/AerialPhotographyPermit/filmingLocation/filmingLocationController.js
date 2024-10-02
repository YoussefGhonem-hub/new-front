/**=========================================================
 * Module: LoginController.js
 * Controller for the Chat APP 
 =========================================================*/

(function () {
    'use strict';

    angular
        .module('eServices')
        .controller('AerialFilmingLocationController', FilmingLocationController);
    /* @ngInject */
    function FilmingLocationController($rootScope, $scope, $uibModalInstance, $filter, location) {
        $scope.location = {};
        $scope.location.address = {};
        if (location != undefined)
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

    FilmingLocationController.$inject = ['$rootScope', '$scope', '$uibModalInstance', '$filter', 'location'];
})();