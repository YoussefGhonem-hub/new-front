/**=========================================================
 * Module: LoginController.js
 * Controller for the Chat APP 
 =========================================================*/

(function () {
    'use strict';

    angular
        .module('eServices')
        .controller('TransactionRequestController', TransactionRequestController);


    function TransactionRequestController($rootScope, $window, $scope, $uibModalInstance, $filter, applicationDetailId, visitId, isRenew, onCloseGoto, $http, $sce, $state, browser, $uibModal) {


        $scope.ShowLoading = true;

        if (onCloseGoto == undefined || onCloseGoto == null) {
            onCloseGoto = 'app.dashboard';
        }

        $scope.purchaseCheckout = null;
        //$scope.paymentMethod = null;



        $scope.paymentMethod = '';

       // G3 un-coment
        if (visitId != null) {
            $http.get($rootScope.app.httpSource + 'api/Payment/GetByVisitId?id=' + visitId).then(function (res)
            {
                if (res.data.paymentChannelId == 5 || res.data.paymentChannelId == 7) {
                    $scope.GetPurchaseCheckout(res.data);
                } else {
                    $scope.paymentMethod = 'G2';
                    $scope.ShowLoading = false;

                }

            }, function (err) { });
        } else if (applicationDetailId != null) {
            $http.get($rootScope.app.httpSource + 'api/Payment/GetByApplicationDetailId?id=' + applicationDetailId).then(function (res) {
                if (res.data.paymentChannelId == 5 || res.data.paymentChannelId == 7) {
                    $scope.GetPurchaseCheckout(res.data);
                } else {
                    $scope.paymentMethod = 'G2';
                    $scope.ShowLoading = false;
                }
            }, function (err) { });
        }


        $scope.GetPurchaseCheckout = function (payment) {
            $http.get($rootScope.app.httpSource + 'api/Payment/GetPurchaseCheckout/' + payment.id).then(function (res) {
                $scope.purchaseCheckout = res.data;
                var lnag = 'en';// $rootScope.language.selected === 'English' ? 'en' : 'ar';
                var ge = 'media';
                if ($scope.purchaseCheckout.redirectUrl === '') {
                        $scope.purchaseCheckout.paymentUrl = $scope.purchaseCheckout.checkoutUrl + '?lang=' + lnag + '&ge=' + ge + '&checkoutId=' + $scope.purchaseCheckout.checkoutId;
                }
                $scope.paymentMethod = 'G3';
                $scope.ShowLoading = false;
            }, function (err) { });

        };

        if (visitId != null) {
            $scope.serviceFees = { applicationDetailId: null, visitId: visitId, serviceFee: [], isRenew: false };
        } else if (applicationDetailId != null) {
            $scope.serviceFees = { applicationDetailId: applicationDetailId, visitId: null, serviceFee: [], isRenew: false };
        }

      
        $scope.cantRenew = false;
        $scope.yearsOfLicense = 1;


        var MakePaymentURL = '';
        if (visitId != null) {
            MakePaymentURL = $rootScope.app.httpSource + 'api/Payment/MakePayment_Visit?visitId=' + visitId;
        } else if (applicationDetailId != null) {
            MakePaymentURL = $rootScope.app.httpSource + 'api/Payment/MakePayment?applicationDetailId=' + applicationDetailId;
        }

        $scope.clickToPay = function () {
            $scope.ShowLoading = true;
            $http.get(MakePaymentURL)
                .then(function (response) {
                    var form = document.createElement("form");
                    form.action = $rootScope.app.edirhamRoute;
                    form.method = "post";
                    form.innerHTML = response.data;
                    document.body.appendChild(form);
                    sessionStorage.setItem('paymentProgress', "true");
                    form.submit();
                    $uibModalInstance.close(true);
                },
                    function (response) {
                        $uibModalInstance.close(true);
                    });

        };


        $scope.closeModal = function () {
            if (onCloseGoto != '') {
                $state.go(onCloseGoto);
            }
            $uibModalInstance.dismiss('cancel');
        };

    }
    TransactionRequestController.$inject = ['$rootScope', '$window', '$scope', '$uibModalInstance', '$filter', 'applicationDetailId', 'visitId', 'isRenew', 'onCloseGoto', '$http', '$sce', '$state', 'browser', '$uibModal'];
})();