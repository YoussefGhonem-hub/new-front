/**=========================================================
 * Module: LoginController.js
 * Controller for the Chat APP 
 =========================================================*/

(function () {
    'use strict';

    angular
        .module('eServices')
        .controller('OtherChannelsController', OtherChannelsController);
    /* @ngInject */
    function OtherChannelsController($rootScope, $scope, $uibModalInstance, $filter, applicationDetailId, visitId, isRenew, onCloseGoto, $http, $state) {

        if (onCloseGoto == undefined || onCloseGoto == null) {
            onCloseGoto = 'app.dashboard';
        }

        if (visitId != null) {
            $scope.serviceFees = { applicationDetailId: null, visitId: visitId, serviceFee: [], isRenew: false };
        } else if (applicationDetailId != null) {
            $scope.serviceFees = { applicationDetailId: applicationDetailId, visitId: null, serviceFee: [], isRenew: false };
        }

        $scope.paymentChannelModel = {};
        $scope.uploadPaymentChannelUrl = 'api/Upload/UploadFile?uploadFile=PaymentChannelPath';

        $http.get($rootScope.app.httpSource + 'api/PaymentChannel')
            .then(function (response) {
                $scope.paymentChannels = response.data;
            });

        $scope.clickToPay = function () {
            $scope.isBusy = true;
            $scope.paymentChannelModel.paymentChannel = $filter('filter')($scope.paymentChannels, { id: $scope.paymentChannelModel.paymentChannelId }, true)[0];
            $scope.paymentChannelModel.applicationDetailId = applicationDetailId;

            $http.post($rootScope.app.httpSource + 'api/Payment/PayByOtherChannels', $scope.paymentChannelModel)
                .then(function (response) {
                    $scope.isBusy = false;
                    $scope.closeModal();
                });
        };

        $scope.closeModal = function () {
            if (onCloseGoto != '') {
                $state.go(onCloseGoto);
            }
            $uibModalInstance.dismiss('cancel');
        };

    }
    OtherChannelsController.$inject = ['$rootScope', '$scope', '$uibModalInstance', '$filter', 'applicationDetailId', 'visitId', 'isRenew', 'onCloseGoto', '$http', '$state'];
})();