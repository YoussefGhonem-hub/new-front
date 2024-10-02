/**=========================================================
 * Module: LoginController.js
 * Controller for the Chat APP 
 =========================================================*/

(function () {
    'use strict';

    angular
        .module('eServices')
        .controller('RegisterController', RegisterController);
    /* @ngInject */
    function RegisterController($rootScope, $scope, $http, $filter, $uibModal, $state, RegisterService, SweetAlert, vcRecaptchaService, $window) {
        var vm = this;

        vm.account = {};
        vm.account.isAgree = false;
        vm.validMobile = false;
        vm.isAgreed = true;
        vm.emailAlreadyTaken = false;
        vm.recaptchaLang = $rootScope.app.layout.isRTL ? "ar" : "en";

        vm.preventLeadingZero = function () {
            if ((vm.account.phoneNumber == undefined || vm.account.phoneNumber.length == 0) && event.which == 48) {
                event.preventDefault();
            }
        }

        $http.get($rootScope.app.httpSource + 'api/Country')
            .then(function (response) {
                var countryList = response.data;
                vm.account.country = $filter('filter')(countryList, { isoCode3: 'ARE' }, true)[0];
                vm.countries = countryList;
            },
            function (response) { });

        vm.openTerms = function (size) {

            var modalInstance = $uibModal.open({
                templateUrl: '/terms.html',
                controller: ModalInstanceCtrl,
                size: size
            });

            var state = $('#modal-state');
            modalInstance.result.then(function () {
                state.text('Modal dismissed with OK status');
            }, function () {
                state.text('Modal dismissed with Cancel status');
            });
        };

        vm.setWidgetId = function (widgetId) {
            vm.widgetId = widgetId;
        };
        vm.uaepassregister = function (lang) {
            vm.isBusy = true;
            $http.get($rootScope.app.httpSource + 'api' + '/OAuth2/Auth?provider=UAEPass', { headers: { 'lang': lang } })
                .then(function (res) {
                    $window.location.href = res.data;
                    //vm.isBusy = false;
                },
                    function (erroresp) {
                        vm.isBusy = false;
                    });
        };
        vm.submit = function () {

            if (vm.account.response == "")
                return false;

            if (!vm.account.isAgree) {
                vm.isAgreed = false;
                return false;
            }
            else {
                vm.isAgreed = true;
            }
            vm.isBusy = true;

            $http.post($rootScope.app.httpSource + 'api/Account/Register', vm.account)
                .then(function (response) {
                    RegisterService.setRegisteredUser(response.data.userId, response.data.phoneNumber);
                    SweetAlert.swal($filter('translate')('general.congrats'), $filter('translate')('register.successful'), "success");
                    vm.isBusy = false;
                    $state.go('page.login');
                },
                function (response) { // optional
                    vm.isBusy = false;
                    if (response.data.modelState.invalidDataExceptionBase[0] != undefined) {
                        vm.emailAlreadyTaken = true;
                    }
                    vcRecaptchaService.reload(vm.widgetId);
                });
        };

        vm.validMobileNumber = function () {
            vm.validMobile = true;
        };

        vm.invalidMobileNumber = function () {
            vm.validMobile = false;
        };

        // Please note that $uibModalInstance represents a modal window (instance) dependency.
        // It is not the same as the $uibModal service used above.

        var ModalInstanceCtrl = function ($scope, $uibModalInstance) {

            $scope.ok = function () {
                $uibModalInstance.close('closed');
            };

            $scope.cancel = function () {
                $uibModalInstance.dismiss('cancel');
            };
        };
        ModalInstanceCtrl.$inject = ['$scope', '$uibModalInstance'];

    }

    RegisterController.$inject = ['$rootScope', '$scope', '$http', '$filter', '$uibModal', '$state', 'RegisterService', 'SweetAlert', 'vcRecaptchaService', '$window'];

})();