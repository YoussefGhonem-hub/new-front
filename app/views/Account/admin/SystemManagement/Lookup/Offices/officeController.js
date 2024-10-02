
(function () {
    'use strict';

    angular
        .module('eServices')
        .controller('OfficeController', OfficeController);
    /* @ngInject */

    OfficeController.$inject = ['$rootScope', '$scope', '$http', '$uibModalInstance', '$uibModal', '$filter', 'office', 'SweetAlert'];

    function OfficeController($rootScope, $scope, $http, $uibModalInstance, $uibModal, $filter, office, SweetAlert) {

        $scope.ofiice = office;
        $scope.ok = function () {
            $uibModalInstance.close($scope.office);
        };

        $scope.closeModal = function () {
            $uibModalInstance.close();
        };  
    }
})();