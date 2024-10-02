/**=========================================================
 * Module: LoginController.js
 * Controller for the Chat APP 
 =========================================================*/

(function () {
    'use strict';

    angular
        .module('eServices')
        .controller('HappinessRatingController', HappinessRatingController);
    /* @ngInject */
    function HappinessRatingController($rootScope, $http, $scope, $uibModalInstance, $filter) {
        $http.get($rootScope.app.httpSource + 'api/HappinessRate')
            .then(function (response) {
                $scope.HappinesRates = response.data;
            });
        $scope.submit = function (happinessRate) {
            $uibModalInstance.close(happinessRate);
        };


    }

    HappinessRatingController.$inject = ['$rootScope', '$http', '$scope', '$uibModalInstance', '$filter'];
})();