/**=========================================================
 * Module: LoginController.js
 * Controller for the Chat APP 
 =========================================================*/

(function () {
    'use strict';

    angular
        .module('eServices')
        .controller('FilmingLocationController', FilmingLocationController);
    /* @ngInject */
    function FilmingLocationController($rootScope, $scope, $uibModalInstance, $filter, location, NgMap, $http, $timeout) {
        $scope.googleMapsUrl = $rootScope.app.googleMapsUrl + '&libraries=drawing';
        var previousDrawer = null;
        $scope.drawerProperties = { fillColor: '#d3d3d3', fillOpacity: 0.5, strokeColor: '#00b3b3', strokeWeight: 1, editable: true };
        $scope.setByLocation = location.address.location == null ? 'byData' : 'byMap';
        $scope.polygonCoords = [];
        $scope.location = {};
        $scope.location.address = {};

        $http.get($rootScope.app.httpSource + 'api/Emirate')
            .then(function (response) {
                $scope.emirates = response.data;
            },
            function (response) { });

        if (location != undefined) {
            $scope.location = location;
            if (location.address.location) {

                let polygonCordinates = '';
                if (location.address.location.includes('POINT')) {
                    polygonCordinates = location.address.location.split('(')[1];
                    polygonCordinates = polygonCordinates.split(')')[0];
                    polygonCordinates = polygonCordinates.split(',');
                    polygonCordinates.map(point => {
                        point = point.split(" ");
                        $scope.circleCordinates = { lat: parseFloat(point[0]), lng: parseFloat(point[1]) };
                    });
                }
                else {
                    polygonCordinates = location.address.location.split('((')[1];
                    polygonCordinates = polygonCordinates.split('))')[0];
                    polygonCordinates = polygonCordinates.split(',');
                    polygonCordinates.map(point => {
                        point = point.split(" ");
                        $scope.polygonCoords.push({ lat: parseFloat(point[1]), lng: parseFloat(point[0]) });

                    });
                }
            }
        }

        var polygonPathDrawer = (map) => {
            let polygon = new google.maps.Polygon({
                map: map,
                paths: $scope.polygonCoords,
                strokeColor: '#00b3b3',
                strokeWeight: 1,
                fillColor: '#d3d3d3',
                fillOpacity: 0.5,
                editable: true,
                draggable: true,
                geodesic: true
            });
            previousDrawer = polygon;

            let pathGenerator = () => {
                var wicketReader = new Wkt.Wkt();
                var newPolygon = new google.maps.Polygon(
                    {
                        paths: polygon.getPath()
                    }
                );
                $scope.location.address.location = wicketReader.fromObject(newPolygon).toString();
                var bounds = new google.maps.LatLngBounds();
                polygon.getPath().getArray().map((position, key) => {
                    bounds.extend(position);
                });
                _getGeoPointAddress(bounds.getCenter().lat(), bounds.getCenter().lng());
            }

            polygon.getPaths().forEach(function (path, index) {
                google.maps.event.addListener(path, 'insert_at', function () {
                    pathGenerator();
                });

                google.maps.event.addListener(path, 'remove_at', function () {
                    pathGenerator();
                });

                google.maps.event.addListener(path, 'set_at', function () {
                    pathGenerator();
                });

            });
        }

        var circlePathDrawer = (map) => {
            var circle = new google.maps.Circle({
                strokeColor: '#00b3b3',
                strokeWeight: 1,
                fillColor: '#d3d3d3',
                fillOpacity: 0.5,
                map: map,
                editable: true,
                draggable: true,
                center: $scope.circleCordinates,
                radius: 200
            });
            previousDrawer = circle;
            circle.addListener('bounds_changed', function () {
                $scope.location.address.location = "POINT(" + circle.getCenter().lat() + " " + circle.getCenter().lng() + ")";
                _getGeoPointAddress(circle.getCenter().lat(), circle.getCenter().lng());
            });
        }

        NgMap.getMap().then(function (map) {
            map.setZoom(15);
            if (location.address.location) {
                if (location.address.location.includes('POINT')) {
                    circlePathDrawer(map);
                }
                else {
                    polygonPathDrawer(map);
                }
            }
        });


        $scope.ok = function () {
            _clearMap(null);
            $uibModalInstance.close($scope.location);
        };

        $scope.closeModal = function () {
            _clearMap(null);
            $uibModalInstance.dismiss('cancel');
        };

        var _clearMap = (drawer) => {
            if (previousDrawer !== null) {
                previousDrawer.setMap(null);
            }
            previousDrawer = drawer;
        }


        $scope.onPolygonComplete = function (e) {
            _clearMap(e);
            if (e.getPath) {
                var bounds = new google.maps.LatLngBounds();
                e.getPath().getArray().map((position, key) => {
                    bounds.extend(position);
                });

                var wicketReader = new Wkt.Wkt();
                var newPolygon = new google.maps.Polygon(
                    {
                        paths: e.getPath()
                    }
                );
                $scope.location.address.location = wicketReader.fromObject(newPolygon).toString();
                _getGeoPointAddress(bounds.getCenter().lat(), bounds.getCenter().lng());
            }
        };

        $scope.onRectangleComplete = (e) => {
            _clearMap(e);
            var wicketReader = new Wkt.Wkt();
            var newRectangle = new google.maps.Rectangle(
                {
                    bounds: e.getBounds()
                }
            );
            $scope.location.address.location = wicketReader.fromObject(newRectangle).toString();
            _getGeoPointAddress(e.getBounds().getNorthEast().lat(), e.getBounds().getSouthWest().lng());

        }

        $scope.onCircleComplete = (e) => {
            _clearMap(e);
            $scope.location.address.location = "POINT(" + e.getCenter().lat() + " " + e.getCenter().lng() + ")";
            _getGeoPointAddress(e.getCenter().lat(), e.getCenter().lng());
        }

        var _getGeoPointAddress = (latitude, longitude) => {
            let latlng = { lat: parseFloat(latitude), lng: parseFloat(longitude) };
            var geocoder = new google.maps.Geocoder;
            geocoder.geocode({ 'location': latlng }, function (results, status) {
                if (status === 'OK') {
                    if (results.length > 0) {
                        let streetAddress = '';
                        results.map((loc, key) => {
                            streetAddress += loc.formatted_address.split('-')[0] + ", ";
                            if (loc.types.includes('locality')) {
                                var locality = loc.address_components[0].long_name;
                                let emirate = loc.address_components[1].long_name;
                                //   let emirate = results[results.length - 2].address_components[0].long_name;
                                emirate = $scope.emirates.filter(emirateItem => {
                                    return angular.equals(emirateItem.nameEn, emirate) ? emirateItem : null;
                                });
                                let region = {};
                                if (emirate.length > 0) {
                                    $scope.location.address.emirate = emirate[0];
                                    emirate[0].regions.map(regionitm => {
                                        if (angular.equals(regionitm.nameEn, locality)) {
                                            region = regionitm;
                                        }
                                    });
                                    if (region.communities) {
                                        region.communities.map(community => {
                                            if (angular.equals(community.code, "Goo")) {
                                                $scope.location.address.community = community;
                                            }
                                        });
                                    }
                                }
                            }
                            if (loc.types.includes('political')) {
                                var locality = loc.address_components[0].short_name;
                                if (locality.trim() !== "AE") {
                                    locality = loc.address_components[0].long_name;
                                    let emirate = loc.address_components[1].long_name;
                                    if (angular.equals(loc.address_components[1].short_name, "AE")) {
                                        emirate = locality;
                                    }
                                    //   let emirate = results[results.length - 2].address_components[0].long_name;
                                    $scope.emirates.map(emirateItem => {
                                        if (angular.equals(emirateItem.nameEn, emirate)) {
                                            $scope.location.address.emirate = emirateItem;
                                            emirateItem.regions.map(region => {
                                                if (angular.equals(region.nameEn, locality)) {
                                                    if (region.communities) {
                                                        region.communities.map(community => {
                                                            if (angular.equals(community.code, "Goo")) {
                                                                $scope.location.address.community = community;
                                                            }
                                                        });
                                                    }
                                                }
                                            });
                                        }
                                    });
                                }
                            }
                        });

                        $scope.location.address.street = streetAddress;
                        $scope.$apply();
                    }
                    else {
                        alert("Location not found.");
                    }
                }
                else {

                }
            });
        }


        $scope.$watch('setByLocation', (newVal, oldVal) => {
            if (newVal == 'byData') {
                $scope.location.address.location = null;
                _clearMap(null);
            }
        });
    }

    FilmingLocationController.$inject = ['$rootScope', '$scope', '$uibModalInstance', '$filter', 'location', 'NgMap', '$http', '$timeout'];
})();