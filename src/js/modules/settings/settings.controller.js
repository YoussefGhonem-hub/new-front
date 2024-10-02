/**=========================================================
 * Module: SettingsController.js
 * Handles app setting
 =========================================================*/

(function () {
    'use strict';

    angular
        .module('eServices')
        .controller('SettingsController', SettingsController);
    /* @ngInject */
    function SettingsController(settings, $uibModal, $rootScope) {
        var vm = this;
        // Restore/Save layout settings
        settings.loadAndWatch();

        // Set scope for panel settings
        vm.themes = settings.availableThemes();
        vm.setTheme = settings.setTheme;

        try {
            if ($rootScope.language.selected == 'العربية') {
                vm.faqUrl = "https://uaemc.gov.ae/en/faq/";
            }
            else {
                vm.faqUrl = "https://uaemc.gov.ae/en/faq/";
            }
        } catch (e) {
            vm.faqUrl = "https://uaemc.gov.ae/en/faq/";
        }

        vm.openTerms = function (size) {

            var modalInstance = $uibModal.open({
                templateUrl: '/terms1.html',
                controller: ModalInstanceCtrl,
                size: size,
                resolve: {
                    charterParameter: function () {
                    }
                }
            });

            var state = $('#modal-state');
            modalInstance.result.then(function () {
                state.text('Modal dismissed with OK status');
            }, function () {
                state.text('Modal dismissed with Cancel status');
            });
        };

        vm.openHappiness = function (size) {

            var modalInstance = $uibModal.open({
                templateUrl: '/happiness.html',
                controller: ModalInstanceCtrl,
                size: size,
                resolve: {
                    charterParameter: function () {
                        if ($rootScope.language.selected == 'العربية') {
                            vm.charterUrl = "";
                        }
                        else {
                            vm.charterUrl = "";
                        }
                        return vm.charterUrl;
                    }
                }
            });

            var state = $('#modal-state');
            modalInstance.result.then(function () {
                state.text('Modal dismissed with OK status');
            }, function () {
                state.text('Modal dismissed with Cancel status');
            });
        };

        vm.openPrivacy = function (size) {

            var modalInstance = $uibModal.open({
                templateUrl: '/privacy.html',
                controller: ModalInstanceCtrl,
                size: size,
                resolve: {
                    charterParameter: function () {
                    }
                }
            });

            var state = $('#modal-state');
            modalInstance.result.then(function () {
                state.text('Modal dismissed with OK status');
            }, function () {
                state.text('Modal dismissed with Cancel status');
            });
        };

        vm.openAccessibility = function (size) {

            var modalInstance = $uibModal.open({
                templateUrl: '/accessibility.html',
                controller: ModalInstanceCtrl,
                size: size,
                resolve: {
                    charterParameter: function () {
                    }
                }
            });

            var state = $('#modal-state');
            modalInstance.result.then(function () {
                state.text('Modal dismissed with OK status');
            }, function () {
                state.text('Modal dismissed with Cancel status');
            });
        };

        var ModalInstanceCtrl = function ($scope, $uibModalInstance, charterParameter) {

            $scope.ok = function () {
                $uibModalInstance.close('closed');
            };

            $scope.cancel = function () {
                $uibModalInstance.dismiss('cancel');
            };

            $scope.charterUrl = charterParameter;
        };
        ModalInstanceCtrl.$inject = ['$scope', '$uibModalInstance', 'charterParameter'];
    }
    SettingsController.$inject = ['settings', '$uibModal', '$rootScope'];
})();
