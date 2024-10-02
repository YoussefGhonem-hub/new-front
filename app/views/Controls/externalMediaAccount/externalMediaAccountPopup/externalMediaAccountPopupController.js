/**=========================================================
 * Module: LoginController.js
 * Controller for the Chat APP 
 =========================================================*/

(function () {
    'use strict';

    angular
        .module('eServices')
        .controller('ExternalMediaAccountPopupController', ExternalMediaAccountPopupController);

    function ExternalMediaAccountPopupController($rootScope, $scope, $uibModalInstance, $filter, UserProfile, isForeignMedia, mediaLicenseEconomicActivityExternalMediaAccount, $http) {
        $scope.uploadProofUrl = 'api/Upload/UploadFile?uploadFile=ExternalMediaAccountPath';
        $http.get($rootScope.app.httpSource + 'api/SocialMedia')
            .then(function (response) {
                $scope.socialMedias = response.data;
            },
                function (response) { // optional
                    alert('failed');
                });

        $http.get($rootScope.app.httpSource + 'api/SocialMediaCategory')
            .then(function (response) {
                if (UserProfile.getProfile().userTypeCode == '01') {
                    $scope.isIndividual = true;

                    $scope.mediaLicenseEconomicActivityExternalMediaAccount.externalMediaAccount = {};
                    $scope.mediaLicenseEconomicActivityExternalMediaAccount.externalMediaAccount.socialMediaCategory = {};
                    var socialMediaCategoriesList = response.data;
                    $scope.mediaLicenseEconomicActivityExternalMediaAccount.externalMediaAccount.socialMediaCategory = $filter('filter')(socialMediaCategoriesList, { code: '02' }, true)[0];
                    $scope.socialMediaCategories = $scope.mediaLicenseEconomicActivityExternalMediaAccount.externalMediaAccount.socialMediaCategory;
                }
                else {
                    $scope.socialMediaCategories = response.data;
                }
            });

        $scope.verifiedAccountInfo = null;

        $scope.mediaLicenseEconomicActivityExternalMediaAccount = {};
        if (mediaLicenseEconomicActivityExternalMediaAccount != undefined && mediaLicenseEconomicActivityExternalMediaAccount != null) {
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

        $scope.removed = function (item) {
            for (var i = 0; i < $scope.mediaLicenseEconomicActivityExternalMediaAccount.selectedSubCategory.length; i++) {
                if ($scope.mediaLicenseEconomicActivityExternalMediaAccount.selectedSubCategory[i].id == item.id) {
                    $scope.mediaLicenseEconomicActivityExternalMediaAccount.selectedSubCategory(i, 1);
                }
            }
        };

        $scope.ok = function () {
            $uibModalInstance.close($scope.mediaLicenseEconomicActivityExternalMediaAccount);
        };

        $scope.closeModal = function () {
            $uibModalInstance.dismiss('cancel');
        };
    }

    ExternalMediaAccountPopupController.$inject = ['$rootScope', '$scope', '$uibModalInstance', '$filter', 'UserProfile', 'isForeignMedia', 'mediaLicenseEconomicActivityExternalMediaAccount', '$http'];
})();