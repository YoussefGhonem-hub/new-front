/**=========================================================
 * Module: profileNationality
 * Reuse cases of nationality in user profile page
 =========================================================*/

(function () {
    'use strict';

    angular
        .module('eServices')
        .directive('applicantEstablishment', applicantEstablishment)

    applicantEstablishment.$inject = ['$rootScope', '$http', '$filter', '$window', 'browser', 'NgMap'];

    function applicantEstablishment($rootScope, $http, $filter, $window, browser, NgMap) {
        return {
            restrict: 'E',
            scope: {
                passModel: "=ngModel"
            },
            templateUrl: '/app/views/Controls/applicantEstablishment/applicantEstablishmentDirectiveTemplate.html',
            link: link
        };

        function link(scope, element, attrs) {
            // Static Values : Configuration
            scope.googleMapsUrl = $rootScope.app.googleMapsUrl;
        }
    }
})();
