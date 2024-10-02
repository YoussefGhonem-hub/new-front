/**=========================================================
 * Module: inspectionReport
 =========================================================*/

(function () {
    'use strict';

    angular
        .module('eServices')
        .directive('inspectionTask', inspectionTask)

    inspectionTask.$inject = ['$rootScope', '$http', '$filter', '$window', 'browser'];

    function inspectionTask($rootScope, $http, $filter, $window, browser) {
        return {
            restrict: 'E',
            scope: {
                passModel: "=ngModel"
            },
            templateUrl: '/app/views/Controls/inspectionReport/inspectionTaskDirectiveTemplate.html',
            link: link
        };

        function link(scope, element, attrs) {
            scope.$watch('passModel', function (newValue, oldValue) {
                if (newValue != null) {
                    $http.get($rootScope.app.httpSource + 'api/InspectionTask/GetById?id=' + newValue)
                        .then(function (response) {
                            scope.inspectionTaskDetails = response.data;
                            scope.StartDate = moment(response.data.startsAt).format('DD-MMMM-YYYY, h:mm a');
                            scope.EndDate = moment(response.data.endsAt).format('DD-MMMM-YYYY, h:mm a');
                        });
                }
            });
        }
    }
})();
