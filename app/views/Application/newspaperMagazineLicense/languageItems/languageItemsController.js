/**=========================================================
 * Module: RegulateItemsController.js
 * Controller for the Chat APP 
 =========================================================*/

(function () {
    'use strict';

    angular
        .module('eServices')
        .controller('LanguageItemsController', LanguageItemsController);
    /* @ngInject */
    function LanguageItemsController($rootScope, $scope, $uibModalInstance, $filter, $http, UserProfile, newspaperLanguage, $state) {
        $scope.newspaperLanguage = {};
        $scope.user = UserProfile.getProfile();
        if (newspaperLanguage != undefined) {
            $scope.newspaperLanguage = newspaperLanguage;
        }

        $http.get($rootScope.app.httpSource + 'api/Language')
          .then(function (response) {
              $scope.newspaperLanguage.languages = response.data;
          });

        $scope.ok = function () {
            $http.get($rootScope.app.httpSource + 'api/Newspaper/CheckNameAvailability?name=' + $scope.newspaperLanguage.name)
               .then(function (response) {
                   $scope.isExist = response.data;
                   if (!response.data) {
                       $uibModalInstance.close($scope.newspaperLanguage);
                   }
               });
        };

        $scope.closeModal = function () {
            $uibModalInstance.dismiss('cancel');
        };
    }

    LanguageItemsController.$inject = ['$rootScope', '$scope', '$uibModalInstance', '$filter', '$http', 'UserProfile', 'newspaperLanguage', '$state'];
})();