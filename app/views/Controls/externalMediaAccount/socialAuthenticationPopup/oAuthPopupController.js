/**=========================================================
 * Module: profileNationality
 * Reuse cases of nationality in user profile page
 =========================================================*/

(function () {
    'use strict';

    angular.module('eServices')
        .controller('oAuthPopupController', oAuthPopupController);

    function oAuthPopupController($rootScope, $scope, $uibModalInstance, $http, $sce, dlgdata) {
        $scope.frameUrl = $sce.trustAsResourceUrl('//www.google.com');
        $scope.frameName = 'name';
        $scope.ok = function () {
            $uibModalInstance.close();
        };

        $scope.closeModal = function () {
            $uibModalInstance.dismiss('cancel');
        };
    }

    oAuthPopupController.$inject = ['$rootScope', '$scope', '$uibModalInstance', '$http', '$sce', 'dlgdata'];

})();
