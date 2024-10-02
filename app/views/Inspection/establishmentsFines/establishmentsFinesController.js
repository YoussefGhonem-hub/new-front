/**=========================================================
 * Module: DashboardController.js
 =========================================================*/

(function () {
    'use strict';

    angular
        .module('eServices')
        .controller('establishmentsFinesController', establishmentsFinesController);


    function establishmentsFinesController($rootScope, $scope, $http, $stateParams, $state, UserProfile, DTOptionsBuilder, DTColumnBuilder, $compile, $filter, $uibModal,
        SweetAlert, $timeout, $window, FileUploader) {
        var vm = this;
        vm.user = UserProfile.getProfile();
        vm.userProfile = {};
        // vm.dtApplicationInstance = {};
        vm.translateFilter = $filter('translate');
        vm.establishmentsFines = [];
        vm.AllVisits = [];
        vm.GetIndividualFines = [];

        if (vm.user.userTypeCode == '01') {
            vm.GetIndividualFines = function () {
                $http.get($rootScope.app.httpSource + 'api/Visit/GetViolationsAll')
                    .then(function (response) {
                        vm.AllVisits = [];
                        vm.GetIndividualFines = response.data;
                        for (var i = 0; i <= vm.GetIndividualFines.length - 1; i++) {
                            var VisitObj = vm.GetIndividualFines[i];
                            VisitObj.createdOnTxt = moment(VisitObj.createdOn).format('YYYY-MM-DD');
                            VisitObj.payment = VisitObj.payments[0];
                            VisitObj.totalFee = vm.getFeesTotlatForVisit(VisitObj);
                            if (VisitObj.establishment.licenseNumber == '900098_9') {
                                VisitObj.establishment = {};
                                VisitObj.establishment.licenseNumber = vm.GetIndividualFines[i].userProfile.mediaFileNumber;
                                VisitObj.establishment.nameAr = vm.GetIndividualFines[i].userProfile.person.name;
                                VisitObj.establishment.nameEn = vm.GetIndividualFines[i].userProfile.person.name;
                            }
                            vm.AllVisits.push(VisitObj);
                        }
                    },
                        function (response) { });
            }
            vm.GetIndividualFines();
        }
        else {
            vm.GetEstablishmentsFines = function () {
                $http.get($rootScope.app.httpSource + 'api/Establishment/GetEstablishmentsFines')
                    .then(function (response) {
                        vm.AllVisits = [];
                        vm.establishmentsFines = response.data;
                        for (var i = 0; i <= vm.establishmentsFines.length - 1; i++) {
                            for (var ii = 0; ii <= vm.establishmentsFines[i].visits.length - 1; ii++) {

                                var VisitObj = vm.establishmentsFines[i].visits[ii];
                                VisitObj.createdOnTxt = moment(VisitObj.createdOn).format('YYYY-MM-DD');
                                VisitObj.payment = VisitObj.payments[0];
                                VisitObj.totalFee = vm.getFeesTotlatForVisit(VisitObj);
                                if (VisitObj.establishment == null) {
                                    VisitObj.establishment = {};
                                    VisitObj.establishment.licenseNumber = vm.establishmentsFines[i].licenseNumber;
                                    VisitObj.establishment.nameAr = vm.establishmentsFines[i].nameAr;
                                    VisitObj.establishment.nameEn = vm.establishmentsFines[i].nameEn;
                                }
                                vm.AllVisits.push(VisitObj);
                            }
                        }
                    },
                        function (response) { });
            }
            vm.GetEstablishmentsFines();
        }

        vm.getFeesTotlatForVisit = function (VisitObj) {
            var FeeTotla = 0.0;
            if (VisitObj.payment) {
                for (var i = 0; i <= VisitObj.payment.paymentDetails.length - 1; i++) {
                    var pd = VisitObj.payment.paymentDetails[i];
                    FeeTotla = FeeTotla + pd.fee;
                }
            }
            return FeeTotla;
        }


        vm.payFine = function (visitId) {
            var modalInstance = $uibModal.open({
                templateUrl: 'app/views/Payment/transactionRequest/transactionRequest.html',
                controller: 'TransactionRequestController',
                size: 'lg',
                keyboard: false,
                backdrop: 'static',
                resolve: {
                    applicationDetailId: null,
                    visitId: visitId,
                    isRenew: false,
                    onCloseGoto: false
                }
            });


            modalInstance.result.then(function (actionTakenDetail) {
                vm.GetEstablishmentsFines();
            });
        };

        vm.verifyPayment = function (visitId) {
            var modalInstance = $uibModal.open({
                templateUrl: 'app/views/Payment/verifyPayment/verifyPayment.html',
                controller: 'VerifyPaymentController',
                size: 'lg',
                keyboard: false,
                backdrop: 'static',
                resolve: {
                    applicationDetailId: null,
                    visitId: visitId
                }
            });
        };

        vm.printReceipt = function (payment) {
            $window.open(payment.paymentReceiptFullUrl, '_blank');
        };



    }




    establishmentsFinesController.$inject = ['$rootScope', '$scope', '$http', '$stateParams', '$state', 'UserProfile', 'DTOptionsBuilder', 'DTColumnBuilder', '$compile', '$filter', '$uibModal',
        'SweetAlert', '$timeout', '$window', 'FileUploader'];


})();
