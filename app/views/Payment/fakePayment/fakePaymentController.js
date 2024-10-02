/**=========================================================
 * Module: LoginController.js
 * Controller for the Chat APP 
 =========================================================*/

(function () {
    'use strict';

    angular
        .module('eServices')
        .controller('fakePaymentController', fakePaymentController);
    /* @ngInject */
    function fakePaymentController($rootScope, $window, $scope, $uibModalInstance, $filter, applicationDetailId, $http, $sce, $state, browser, $uibModal) {
        $scope.serviceFees = { applicationDetailId: applicationDetailId, serviceFee: [] };
        $scope.redirectEDirham = false;
        $scope.cantRenew = false;
        $scope.yearsOfLicense = 1;
        $scope.TryTimes = 0;
        $scope.isBusy = false;
        

        $http.get($rootScope.app.httpSource + 'api/Application/GetCertificate?Id=' + applicationDetailId)
            .then(function (response)
            {
                //$scope.expiryDate = new Date(response.data.expiryDate);
                //var CurrentDate = new Date();
                //CurrentDate.setMonth(CurrentDate.getMonth() + 1);
                //if ($scope.expiryDate > CurrentDate) {
                //    //$scope.cantRenew = true;
                //    //$scope.renewDate.setMonth($scope.renewDate.getMonth() - 1);
                //}
            });




        $scope.clickToPay = function () {
            $scope.isBusy = true;
            $http.get($rootScope.app.httpSource + 'api/Payment/SetPaymentAsReceived?applicationDetailId=' + applicationDetailId)
                    .then(function (response) {

                        if (response.data == 'Fake_Payment_Created' && $scope.TryTimes < 2)
                        {
                            $scope.TryTimes = $scope.TryTimes + 1;
                            $scope.clickToPay();
                            
                        }else
                        {
                            $scope.close();
                        }
                       
                    });
        }

        $scope.closeModal = function () {
            $uibModalInstance.dismiss('cancel');
        };

        $scope.close = function () {
            $uibModalInstance.close('cancel');
        };
    }
    fakePaymentController.$inject = ['$rootScope', '$window', '$scope', '$uibModalInstance', '$filter', 'applicationDetailId', '$http', '$sce', '$state', 'browser', '$uibModal'];
})();