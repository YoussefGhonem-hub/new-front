/**=========================================================
 * Module: inspectionHistory
 =========================================================*/

(function () {
    'use strict';


    inspectionHistory.$inject = ['$rootScope', '$http', '$filter', '$window', 'browser', 'DTOptionsBuilder', 'DTColumnBuilder'];

    function inspectionHistory($rootScope, $http, $filter, $window, browser, DTOptionsBuilder, DTColumnBuilder) {
        return {
            restrict: 'E',
            scope: {
                establishmentId: "=ngModel",
                hasVists: "=hasVists",
                fullDetails: "=fullDetails"
            },
            templateUrl: '/app/views/Controls/inspectionReport/inspectionHistoryDirectiveTemplate.html',
            link: link
        };
        function link(scope, element, attrs) {

            scope.visitsHistory = {};

            var init = function () {
                if (scope.establishmentId != 0) {
                    $http.get($rootScope.app.httpSource + 'api/Visit/GetVisitsHistory/' + scope.establishmentId).then(function (res) {
                        scope.visitsHistory = res.data;
                        if (scope.visitsHistory && scope.visitsHistory.length > 0) {
                            scope.hasVists = true;
                        } else {
                            scope.hasVists = false;
                        }
                    }, function (err) {

                    });
                } else {
                    scope.hasVists = true;
                }
            };

            scope.$watch('establishmentId', function (newVal, oldVal) {
                if (newVal) {
                    init();
                }
            });

            init();

        }
    }


    angular
        .module('eServices')
        .directive('inspectionHistory', inspectionHistory);

})();
