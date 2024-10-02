/**=========================================================
 * Module: LoginController.js
 * Controller for the Chat APP 
 =========================================================*/

(function () {
    'use strict';

    angular
        .module('eServices')
        .controller('ReviewEstablishmentPartnerController', ReviewEstablishmentPartnerController);
    /* @ngInject */
    function ReviewEstablishmentPartnerController($rootScope, $scope, $uibModalInstance, $filter,  establishmentPartner) {
        if (establishmentPartner == null) {
            $scope.establishmentPartner = {};
            $scope.establishmentPartner.id = 0;
            $scope.establishmentPartner.person = {};
        }
        else
        {
            $scope.establishmentPartner = establishmentPartner;
        }

        $scope.ok = function () {
            $uibModalInstance.close($scope.establishmentPartner);
        };

        $scope.closeModal = function () {
            $uibModalInstance.dismiss('cancel');
        };
    }

    ReviewEstablishmentPartnerController.$inject = ['$rootScope', '$scope', '$uibModalInstance', '$filter',   'establishmentPartner'];
})();