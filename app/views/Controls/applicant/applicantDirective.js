/**=========================================================
 * Module: profileNationality
 * Reuse cases of nationality in user profile page
 =========================================================*/

(function () {
    'use strict';

    angular
        .module('eServices')
        .directive('applicant', applicant)

    applicant.$inject = ['$rootScope', '$http', '$filter', '$window', 'browser'];

    function applicant($rootScope, $http, $filter, $window, browser) {
        return {
            restrict: 'E',
            scope: {
                passModel: "=ngModel",
                applicantUser: "=",
                isForSocialMedia: "="
            },
            templateUrl: '/app/views/Controls/applicant/applicantDirectiveTemplate.html',
            link: link
        };

        function link(scope, element, attrs) {
            // Static Values : Configuration

        }
    }
})();
