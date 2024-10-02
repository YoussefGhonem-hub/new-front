/**=========================================================
 * Module: LoginController.js
 * Controller for the Chat APP 
 =========================================================*/

(function () {
    'use strict';

    angular
        .module('eServices')
        .controller('purchaseResponseController', purchaseResponseController);
    /* @ngInject */
    purchaseResponseController.$inject = ['$rootScope', '$scope', '$http', '$stateParams', '$state', '$uibModal', 'UserProfile', 'SweetAlert', '$window', '$filter'];

    function purchaseResponseController($rootScope, $scope, $http, $stateParams, $state, $uibModal, UserProfile, SweetAlert, $window, $filter) {
        var vm = this;
        vm.purchaseResponse = {};

        if ($state.params === undefined || $state.params.uid === undefined || $state.params.uid === "") {
            $state.go('app.dashboard');
        }
        else {
            $http.get($rootScope.app.httpSource + 'api/Payment/GetpurchaseResponse/' + $state.params.uid)
                .then(function (response) {
                    vm.purchaseResponse = response.data;
                });
        }



        vm.orderStatusDesc = function (Status) {
            if ($rootScope.language.selected !== 'English') {
                if (Status === 0)
                    return 'تم تسجيل الطلب ، ولكن لم يتم دفعه';
                if (Status === 2)
                    return 'تمت عملية الدفع بنجاح';
                if (Status === 3)
                    return 'تم إلغاء التفويض';
                if (Status === 4)
                    return 'تم ارجاع المبلغ';
                if (Status === 6)
                    return 'عملية دغع غير ناجحة';
                if (Status === 7)
                    return 'بإنتظار الموافقة';
                if (Status === 1)
                    return 'تم حجز المبلغ ، يرجى الانتظار';
            } else {
                if (Status === 0)
                    return 'Order registered, but not paid';
                if (Status === 2)
                    return 'Amount was deposited successfully';
                if (Status === 3)
                    return 'Authorization has been reversed';
                if (Status === 4)
                    return 'Transaction has been refunded';
                if (Status === 6)
                    return 'Authorization is declined';
                if (Status === 7)
                    return 'Pending Authorization';
                if (Status === 1)
                    return 'Amount has been reserved, please wait';
            }
        };
        vm.getCheckoutStatus = function (Status) {
            if ($rootScope.language.selected !== 'English') {
                if (Status === 'DECLINED') {
                    return 'مرفوض';
                } else if (Status === 'IN_PROGRESS') {
                    return 'الطلب معلق بسبب عملية دفع جارية، يرجى الانتظار والمحاولة لاحقا';
                }

                return Status;
            } else {

                if (Status === 'DECLINED') {
                    return 'DECLINED';
                } else if (Status === 'IN_PROGRESS') {
                    return 'The order is pending due to an ongoing payment, please wait and try again later';
                }
                return Status;
            }
        };

    }
})();