/**=========================================================
 * Module: DashboardController.js
 =========================================================*/

(function() {
    'use strict';

    angular
        .module('eServices')
        .controller('newReportController', newReportController);

    newReportController.$inject = ['$rootScope', '$scope', '$uibModalInstance', '$filter', 'report'];
    function newReportController($rootScope, $scope, $uibModalInstance, $filter, report) {
        $scope.report = report;
        $scope.params = $scope.$eval($scope.report.params);



        $scope.dateOptions = {
            formatYear: 'yy',
            maxDate: new Date(2020, 5, 22),
            minDate: new Date(1920, 5, 22),
            startingDay: 1
        };

        $scope.opendatepickerevent = function (p) {
            if (!p.dateExt)
                p.dateExt = {};

            p.dateExt.opend = true;
        };


        $scope.closeModal = function() {
            $uibModalInstance.dismiss();
        };
        $scope.Generate = function () {
            $scope.report.parameters = $scope.params;
            $uibModalInstance.close($scope.report);
        };
            
    }
})();
