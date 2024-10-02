
(function () {
    'use strict';

    angular
        .module('eServices')
        .controller('DayOffController', DayOffController);
    /* @ngInject */

    DayOffController.$inject = ['$rootScope', '$scope', '$http', '$uibModalInstance', '$uibModal', '$filter', 'dayOff', 'SweetAlert'];

    function DayOffController($rootScope, $scope, $http, $uibModalInstance, $uibModal, $filter, dayOff, SweetAlert) {

        $scope.dayOff = dayOff;
        $scope.ok = function () {
            $uibModalInstance.close($scope.dayOff);
        };

        $scope.closeModal = function () {
            $uibModalInstance.close();
            //$uibModalInstance.dismiss('cancel');
        };

        //Date Popup Options
        $scope.dateOptions = {
            formatYear: 'yy',
            maxDate: new Date(2020, 5, 22),
            minDate: new Date(1920, 5, 22),
            startingDay: 1
        };

        $scope.format = 'dd-MMMM-yyyy';

        $scope.openvacationDatePopup = function () {
            $scope.vacationDatePopup.opened = true;
        };

        $scope.vacationDatePopup = {
            opened: false
        };

        $scope.setDate = function (year, month, day) {
            $scope.dayOff.vacationDay = new Date(year, month, day);
        };
       
        //END    
    }
})();