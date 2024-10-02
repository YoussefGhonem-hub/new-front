/**=========================================================
 * Module: LoginController.js
 * Controller for the Chat APP 
 =========================================================*/

(function () {
    'use strict';
    angular
        .module('eServices')
        .controller('foreignPressCardQRCodeController', foreignPressCardQRCodeController);
    /* @ngInject */
    function foreignPressCardQRCodeController($rootScope, $filter, $http, $stateParams, $state, SweetAlert, $uibModal) {
        var vm = this;
        $http.get($rootScope.app.httpSource + 'api/ForeignPressCard/GetByIdQRCode?id=' + $stateParams.id)
            .then(function (response) {
                if (response.data != null) {
                    vm.foreignPressCard = response.data;
                    vm.expiryDate = moment(vm.foreignPressCard.applicationDetail.certificates[0].certificateDetails[0].expiryDate).format("DD MMMM YYYY");
                }
                else {
                    alert('Oops..No data has to display!');
                }
            },
            function (response) { });
    }

    foreignPressCardQRCodeController.$inject = ['$rootScope', '$filter', '$http', '$stateParams', '$state', 'SweetAlert', '$uibModal'];

})();