/**=========================================================
 * Module: LoginController.js
 * Controller for the Chat APP 
 =========================================================*/

(function () {
    'use strict';

    angular
        .module('eServices')
        .controller('reviewExternalMediaAccountPopupController', reviewExternalMediaAccountPopupController);
    /* @ngInject */
    function reviewExternalMediaAccountPopupController($rootScope, $scope, $uibModalInstance, $filter, $http, mediaLicenseEconomicActivityExternalMediaAccount) {
      
        $scope.verifiedAccountInfo = null;

        if(mediaLicenseEconomicActivityExternalMediaAccount == null) {
            $scope.mediaLicenseEconomicActivityExternalMediaAccount = {};
            $scope.mediaLicenseEconomicActivityExternalMediaAccount.person = {};
            $scope.mediaLicenseEconomicActivityExternalMediaAccount.id = 0;
        }
        else
        {
            $scope.mediaLicenseEconomicActivityExternalMediaAccount = mediaLicenseEconomicActivityExternalMediaAccount;

            if ($scope.mediaLicenseEconomicActivityExternalMediaAccount.externalMediaAccount.providerDetailId) {
                $http.get($rootScope.app.httpSource + 'api/OAuth2/AccountInfo?guid=' + $scope.mediaLicenseEconomicActivityExternalMediaAccount.externalMediaAccount.providerDetailId).then(function (response) {
                    $scope.verifiedAccountInfo = response.data;
                },
                  function (response) { // optional
                      //alert('failed');
                  });
            }
        }

        $scope.ok = function () {
            $uibModalInstance.close($scope.mediaLicenseEconomicActivityExternalMediaAccount);
        };

        $scope.closeModal = function () {
            $uibModalInstance.dismiss('cancel');
        };
    }

    reviewExternalMediaAccountPopupController.$inject = ['$rootScope', '$scope', '$uibModalInstance', '$filter', '$http', 'mediaLicenseEconomicActivityExternalMediaAccount'];
})();