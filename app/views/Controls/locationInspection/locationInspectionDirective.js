/**=========================================================
 * Module: profileAddress
 * Reuse cases of address in user profile page
 =========================================================*/

(function () {
    'use strict';

    angular
        .module('eServices')
        .directive('locationInspection', locationInspection)

    locationInspection.$inject = ['$rootScope', '$http', '$filter']
    function locationInspection($rootScope, $http, $filter) {
        return {
            restrict: 'E',
            scope: {
                addressControl: "=ngModel",
                isPreview: '=?',
            },
            templateUrl: '/app/views/Controls/locationInspection/locationInspectionDirectiveTemplate.html',
            link: link
        };

        function link(scope, element, attrs) {
            scope.showRegion = true;
            // Get all the list of emirates with regions and communities

            var unwatch = scope.$watch('addressControl', function (newVal, oldVal) {
                if (newVal) {
                    init();
                    // remove the watcher
                    unwatch();
                }
                else {
                    $http.get($rootScope.app.httpSource + 'api/Emirate')
                       .then(function (response) {
                           scope.emirates = response.data;
                           if (scope.addressControl == undefined) {
                               scope.addressControl = {};
                           }
                       },
                       function (response) { });
                }
            });

            function init() {
                $http.get($rootScope.app.httpSource + 'api/Emirate/GetEmirateEstablishmentCount')
                    .then(function (response) {
                        scope.emirates = response.data;

                        for (var i = 0; i < scope.emirates.length; i++) {
                            scope.emirates[i].numberOfEstablishments = 0;
                            for (var j = 0; j < scope.emirates[i].regions.length; j++) {
                                scope.emirates[i].regions[j].numberOfEstablishments = 0;
                                for (var k = 0; k < scope.emirates[i].regions[j].communities.length; k++) {
                                    scope.emirates[i].numberOfEstablishments += scope.emirates[i].regions[j].communities[k].numberOfEstablishments;
                                    scope.emirates[i].regions[j].numberOfEstablishments += scope.emirates[i].regions[j].communities[k].numberOfEstablishments;
                                }
                            }
                        }
                        scope.disabled = false;
                    },
                    function (response) { });

                if (scope.addressControl.communityId != undefined) {
                    $http.get($rootScope.app.httpSource + 'api/Community/GetByCommunityId?Id=' + scope.addressControl.communityId)
                        .then(function (resp) {
                            scope.addressControl.emirate = resp.data;
                            scope.addressControl.region = $filter('filter')(scope.addressControl.emirate.regions, { id: scope.addressControl.community.regionId }, true)[0];
                        },
                        function (response) { });
                }
            }
        }
    }
})();
