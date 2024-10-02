/**=========================================================
 * Module: profileAddress
 * Reuse cases of address in user profile page
 =========================================================*/

(function () {
    'use strict';

    angular
        .module('eServices')
        .directive('urgentService', urgentService)

    urgentService.$inject = ['$rootScope', '$http', '$filter']
    function urgentService($rootScope, $http, $filter) {
        return {
            restrict: 'E',
            scope: {
                urgentServiceControl: "=ngModel"
            },
            templateUrl: '/app/views/Controls/urgentService/urgentServiceDirectiveTemplate.html',
            link: link
        };

        function link(scope, element, attrs) {
            scope.isUrgentAllowed = true;

            $http.get($rootScope.app.httpSource + 'api/Application/IsUrgentAllowed')
                .then(function (response) {
                    scope.isUrgentAllowed = response.data;
                });

            var unwatch = scope.$watch('urgentServiceControl', function (newVal, oldVal) {
                if (newVal) {
                    init();
                    unwatch();
                }
                else {
                    // gridTable();
                }
            });

            function init() {
                scope.urgentServiceControl.fee = "";
            }
        }
    }
})();
