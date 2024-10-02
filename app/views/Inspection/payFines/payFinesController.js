/**=========================================================
 * Module: payFinesController.js
 =========================================================*/

(function () {
    'use strict';

    angular
        .module('eServices')
        .controller('payFinesController', payFinesController);

    function payFinesController($rootScope, $scope, $http, $stateParams, $state, UserProfile, DTOptionsBuilder, DTColumnBuilder, $compile, $filter, $uibModal,
        SweetAlert, $timeout, $window, vcRecaptchaService) {
        var vm = this;
        vm.translateFilter = $filter('translate');
        vm.establishmentsFines = [];
        vm.AllVisits = [];
        vm.GetIndividualFines = [];
        /*vm.isCommercial = false;*/
        vm.purchaseResponse = {};
        vm.HasNoFine = false;
        vm.NoMatchFound = false;
        vm.isResponse = false;
        vm.isInd = false;
        vm.isCom = false;
        vm.purchaseCheckout = null;
        vm.recaptchaLang = $rootScope.app.layout.isRTL ? "ar" : "en";

        if ($state.params === undefined || $state.params.uid === undefined || $state.params.uid === "") {
            vm.isCommercial = false;
            $state.go('page.payFines/');
        }
        else {
            $http.get($rootScope.app.httpSource + 'api/Payment/GetOpenPayPurchaseResponse/' + $state.params.uid)
                .then(function (response) {
                    vm.isResponse = true;
                    vm.purchaseResponse = response.data;
                    vcRecaptchaService.reload(vm.widgetId);

                    if (vm.purchaseResponse.isIndividual) {
                        vm.isInd = true;
                        vm.isCommercial = true;
                    }

                    else {
                        vm.isCom = true;
                        vm.isCommercial = false;
                    }

                    if (vm.purchaseResponse != null) {
                        if (vm.purchaseResponse.orderStatus == 2) {
                            var textToDisplay = $rootScope.language.selected !== 'English' ? vm.translateFilter('inspection.success') + "<br/>" : vm.translateFilter('inspection.success') + "<br/>";
                            textToDisplay += $rootScope.language.selected !== 'English' ? vm.translateFilter('inspection.msg1') + "<br/>" : vm.translateFilter('inspection.msg1') +"<br/>";
                            textToDisplay += $rootScope.language.selected !== 'English' ? vm.translateFilter('inspection.msg2') + '<p><a style="cursor: pointer;text-decoration: underline" href="' + 'https://apis.uaemc.gov.ae/Reports/PaymentReceipt/' + vm.purchaseResponse.receiptUrl + '" target="_blank">رابط</a></p>' : vm.translateFilter('inspection.msg2') + '<p><a style="cursor: pointer;text-decoration: underline" href="' + 'https://apis.uaemc.gov.ae/Reports/PaymentReceipt/' + vm.purchaseResponse.receiptUrl + '" target="_blank">link</a></p>';
                            SweetAlert.swal({
                                html: true,
                                title: vm.translateFilter('inspection.thankYou'),
                                text: textToDisplay,
                                confirmButtonText: $filter('translate')('general.ok')
                            });
                        }
                        else {
                            var textToDisplay = $rootScope.language.selected !== 'English' ? vm.translateFilter('inspection.failed') : vm.translateFilter('inspection.failed');
                            SweetAlert.swal({
                                html: true,
                                title: vm.translateFilter('inspection.sorry'),
                                text: textToDisplay,
                                confirmButtonText: $filter('translate')('general.ok')
                            });
                        }

                        if (vm.isCom) {
                            vm.establishmentEmirate = {};
                            vm.establishmentEmirate.id = vm.purchaseResponse.esatblishmentEmirateId;
                            $http.get($rootScope.app.httpSource + 'api/Emirate?id=' + vm.establishmentEmirate.id)
                                .then(function (response) {
                                    vm.establishmentEmirate = response.data[0];
                                });
                            vm.licenseNumber = vm.purchaseResponse.esatblishmentLicenseNo;
                            if (vm.response != undefined)
                                vm.checkFine(!vm.isCom);
                        }
                        else {
                            vm.email = vm.purchaseResponse.userEmail;
                            vm.emiratesId = vm.purchaseResponse.userEmiratesId;
                            if (vm.response != undefined)
                                vm.checkFine(vm.isInd);
                        }
                    }
                });
        }

        vm.emirates = null;
        $http.get($rootScope.app.httpSource + 'api/Emirate')
            .then(function (response) {
                vm.emirates = response.data;
            },
                function (response) { });

        vm.DoPaging = function (page, pageSize, total) {
            vm.loading = true;
            vm.params.page = page;
            vm.getEstablishmentData();
        };

        vm.DoSearch = function () {
            vm.loading = true;
            vm.getEstablishmentData();
        };
        vm.setWidgetId = function (widgetId) {
            vm.widgetId = widgetId;
        };
        vm.checkFineByFineNo = function () {
            vm.loading = true;
            vm.HasNoFine = false;
            vm.NoMatchFound = false;
            if (vm.response == "")
                return false;

            $http.get($rootScope.app.httpSource + 'api/Visit/GetFinesByFineNo',
                {
                    params: {
                        fineNo: vm.FineNo,
                        response: vm.response
                    }
                })
                .then(function (response) {
                    vm.AllVisits = [];
                    vm.GetIndividualFines = response.data;
                    vm.loading = false;
                    if (vm.GetIndividualFines == null || vm.GetIndividualFines.length == 0) {
                        vm.HasNoFine = true;
                        vm.NoMatchFound = false
                        vcRecaptchaService.reload(vm.widgetId);
                    }
                    if (vm.GetIndividualFines != null && vm.GetIndividualFines.length > 0 && vm.GetIndividualFines[0].note == "No Match") {
                        vm.NoMatchFound = true;
                        vm.HasNoFine = false;
                        vcRecaptchaService.reload(vm.widgetId);
                    }
                    if (vm.GetIndividualFines != null && vm.GetIndividualFines.length > 0 && vm.GetIndividualFines[0].note != "No Match") {
                        for (var i = 0; i <= vm.GetIndividualFines.length - 1; i++) {
                            var VisitObj = vm.GetIndividualFines[i];
                            vm.isCommercial = false;
                            VisitObj.createdOnTxt = moment(VisitObj.createdOn).format('YYYY-MM-DD');
                            VisitObj.payment = VisitObj.payments[0];
                            VisitObj.totalFee = vm.getFeesTotlatForVisit(VisitObj);
                            if (VisitObj.establishment.licenseNumber == '900098_9') {
                                vm.isCommercial = true;
                                VisitObj.establishment = {};
                                VisitObj.establishment.licenseNumber = vm.GetIndividualFines[i].userProfile.mediaFileNumber;
                                VisitObj.establishment.nameAr = vm.GetIndividualFines[i].userProfile.person.name;
                                VisitObj.establishment.nameEn = vm.GetIndividualFines[i].userProfile.person.name;
                            }
                            vm.AllVisits.push(VisitObj);
                            vcRecaptchaService.reload(vm.widgetId);
                        }
                    }
                },
                    function (response) { });

        }
        vm.checkFine = function (isCommercial) {
            vm.loading = true;
            vm.HasNoFine = false;
            vm.NoMatchFound = false;
            if (vm.response == "")
                return false;

            switch (isCommercial) {

                case false:
                    $http.get($rootScope.app.httpSource + 'api/Establishment/GetFinesByLicenseNumber',
                        {
                            params: {
                                licenseNumber: vm.licenseNumber,
                                emirateId: vm.establishmentEmirate.id,
                                response: vm.response
                            }
                        })
                        .then(function (response) {
                            vm.AllVisits = [];
                            vm.establishmentsFines = response.data;
                            vm.loading = false;
                            if (vm.establishmentsFines == null || vm.establishmentsFines.length == 0) {
                                vm.HasNoFine = true;
                                vm.NoMatchFound = false;
                                vcRecaptchaService.reload(vm.widgetId);
                            }
                            if (vm.establishmentsFines != null && vm.establishmentsFines[0].nameEn == "No Match") {
                                vm.NoMatchFound = true;
                                vm.HasNoFine = false;
                                vcRecaptchaService.reload(vm.widgetId);
                            }
                            if (vm.establishmentsFines != null && vm.establishmentsFines[0].nameEn != "No Match") {
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

                                        vcRecaptchaService.reload(vm.widgetId);
                                    }
                                }
                            }
                        },
                            function (response) { });
                    break;

                case true:
                    $http.get($rootScope.app.httpSource + 'api/Visit/GetFinesByEmail',
                        {
                            params: {
                                email: vm.email,
                                emiratesId: vm.emiratesId,
                                response: vm.response
                            }
                        })
                        .then(function (response) {
                            vm.AllVisits = [];
                            vm.GetIndividualFines = response.data;
                            vm.loading = false;
                            if (vm.GetIndividualFines == null || vm.GetIndividualFines.length == 0) {
                                vm.HasNoFine = true;
                                vm.NoMatchFound = false
                                vcRecaptchaService.reload(vm.widgetId);
                            }
                            if (vm.GetIndividualFines != null && vm.GetIndividualFines.length >0 && vm.GetIndividualFines[0].note == "No Match") {
                                vm.NoMatchFound = true;
                                vm.HasNoFine = false;
                                vcRecaptchaService.reload(vm.widgetId);
                            }
                            if (vm.GetIndividualFines != null && vm.GetIndividualFines.length > 0 && vm.GetIndividualFines[0].note != "No Match") {
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
                                    vcRecaptchaService.reload(vm.widgetId);
                                }
                            }
                        },
                            function (response) { });
                    break;
            }
        };

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

        vm.closeModal = function () {
            vm.email = '';
            vm.emiratesId = '';
            vm.licenseNumber = '';
            vm.establishmentEmirate = null;
            vm.AllVisits = [];
            vm.HasNoFine = false;
            vm.NoMatchFound = false;
            vm.FineNo = '';
            vcRecaptchaService.reload(vm.widgetId);
            $window.location.href = '#/page/payFines/';
        };

        vm.payFine = function (visitId) {
            vm.loading = true;
            $http.get($rootScope.app.httpSource + 'api/Payment/GetByVisitId?id=' + visitId).then(function (res) {
                if (res.data.paymentChannelId == 5 || res.data.paymentChannelId == 7) {
                    vm.getOpenPayPurchaseCheckout(res.data);
                    vm.loading = false;
                }
            }, function (err) { });
        };

        vm.getOpenPayPurchaseCheckout = function (payment) {
            vm.loading = true;
            $http.get($rootScope.app.httpSource + 'api/Payment/GetOpenPayPurchaseCheckout/' + payment.id).then(function (res) {
                vm.purchaseCheckout = res.data;
                var lnag = 'en';// $rootScope.language.selected === 'English' ? 'en' : 'ar';
                var ge = 'media';
                if (vm.purchaseCheckout.redirectUrl === '' && vm.purchaseCheckout.checkoutStatus != 'ERROR') {
                    $window.location.href = vm.purchaseCheckout.checkoutUrl + '?lang=' + lnag + '&ge=' + ge + '&checkoutId=' + vm.purchaseCheckout.checkoutId;
                }
                else if (vm.purchaseCheckout.redirectUrl != null && vm.purchaseCheckout.checkoutStatus == 'DECLINED') {
                    var mCheck = vm.purchaseCheckout.redirectUrl.split('=')[1];
                    $http.get($rootScope.app.httpSource + 'api/Payment/UpdateBrokenStatus?checkoutId=' + mCheck)
                        .then(function (response) {
                            var returnUrl = response.data;
                            $window.location.href = returnUrl;
                        })
                }
                else if (vm.purchaseCheckout.redirectUrl === '' && vm.purchaseCheckout.checkoutStatus == null) {
                    swal("Error!", "Sorry! Something wrong, please try again", "error");
                    vm.closeModal();
                }
                else if (vm.purchaseCheckout.checkoutStatus == 'ERROR') {
                    swal("Error!", "Sorry! Something wrong, please try again", "error");
                    vm.closeModal();
                }
                vm.paymentMethod = 'G3';
                vm.loading = false;
            }, function (err) { });

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

    payFinesController.$inject = ['$rootScope', '$scope', '$http', '$stateParams', '$state', 'UserProfile', 'DTOptionsBuilder', 'DTColumnBuilder', '$compile', '$filter', '$uibModal',
        'SweetAlert', '$timeout', '$window', 'vcRecaptchaService'];

})();
