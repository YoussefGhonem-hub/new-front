/**=========================================================
 * Module: profileAddress
 * Reuse cases of address in user profile page
 =========================================================*/

(function () {
    'use strict';

    angular
        .module('eServices')
        .directive('profileAddress', profileAddress)

    profileAddress.$inject = ['$rootScope', '$http', '$filter']
    function profileAddress($rootScope, $http, $filter) {
        return {
            restrict: 'E',
            scope: {
                addressControl: "=ngModel",
                isEstablishment: "=",
                establishmentEmirate: "=?",
                isPreview: '=?',
                isForeigner: '=?'
            },
            templateUrl: '/app/views/Controls/address/profileAddressDirectiveTemplate.html',
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

            var unwatchEmirate = scope.$watch('establishmentEmirate', function (newVal, oldVal) {
                if (newVal) {
                    init();
                }
            });

            var unwatchEmirate = scope.$watch('addressControl.communityId', function (newVal, oldVal) {
                if (newVal) {
                    $http.get($rootScope.app.httpSource + 'api/Community/GetByCommunityId?Id=' + newVal)
                        .then(function (resp) {
                            scope.addressControl.emirate = resp.data;
                            scope.addressControl.region = $filter('filter')(scope.addressControl.emirate.regions, { id: scope.addressControl.community.regionId }, true)[0];
                        },
                        function (response) { });
                }
            });

            function init() {
                if (!scope.isForeigner) {
                    $http.get($rootScope.app.httpSource + 'api/Emirate')
                        .then(function (response) {
                            scope.emirates = response.data;
                            if (scope.establishmentEmirate) {

                                if (scope.addressControl == undefined) {
                                    scope.addressControl = {};
                                }
                                scope.addressControl.emirate = scope.establishmentEmirate;
                                scope.addressControl.disabled = true;
                            }
                            else {
                                scope.disabled = false;
                            }
                        },
                        function (response) { });
                }
                else {
                    $http.get($rootScope.app.httpSource + 'api/Country')
                        .then(function (response) {
                            scope.countries = response.data;
                            if (scope.establishmentEmirate) {

                                if (scope.addressControl == undefined) {
                                    scope.addressControl = {};
                                }
                                scope.addressControl.emirate = scope.establishmentEmirate;
                                scope.addressControl.disabled = true;
                            }
                            else {
                                scope.disabled = false;
                            }
                        },
                        function (response) { });
                }

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
