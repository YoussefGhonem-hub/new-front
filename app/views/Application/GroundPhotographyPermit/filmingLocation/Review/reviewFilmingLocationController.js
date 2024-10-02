/**=========================================================
 * Module: LoginController.js
 * Controller for the Chat APP 
 =========================================================*/

(function () {
    'use strict';

    angular
        .module('eServices')
        .controller('reviewFilmingLocationController', reviewFilmingLocationController);
    /* @ngInject */
    function reviewFilmingLocationController($rootScope, $scope, $uibModalInstance, $filter, location,NgMap) {
        $scope.googleMapsUrl = $rootScope.app.googleMapsUrl+'&libraries=drawing';
        $scope.setByLocation = location.address.location == null ? 'byData' : 'byMap';
        var previousDrawer = null;
        $scope.polygonCoords = [];
        if (location == null) {
            $scope.location = {};
            $scope.location.address = {};
            $scope.location.id = 0;
        }
        else
        {
            $scope.location = location;
            if (location.address.location) {
                let polygonCordinates = '';
                if (location.address.location.geometry.wellKnownText.includes('POINT')) {
                    polygonCordinates = location.address.location.geometry.wellKnownText.split('(')[1];
                    polygonCordinates = polygonCordinates.split(')')[0];
                    polygonCordinates = polygonCordinates.split(',');
                    polygonCordinates.map(point => {                  
                          point = point.trim().split(" ");
                        $scope.circleCordinates = { lat: parseFloat(point[0]), lng: parseFloat(point[1]) };
                    });
                }
                else {
                    polygonCordinates = location.address.location.geometry.wellKnownText.split('((')[1];
                    polygonCordinates = polygonCordinates.split('))')[0];
                    polygonCordinates = polygonCordinates.split(',');
                    polygonCordinates.map(point => {
                        point = point.trim().split(" ");
                        $scope.polygonCoords.push({ lat: parseFloat(point[1]), lng: parseFloat(point[0])});                        
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
                editable: false,
                draggable: false,
                geodesic: true
            });
            previousDrawer = polygon; 
    }

  var circlePathDrawer = (map) => {
            var circle = new google.maps.Circle({
                strokeColor: '#00b3b3',
                strokeWeight: 1,
                fillColor: '#d3d3d3',
                fillOpacity: 0.5,
                map: map,
                editable: false,
                draggable: false,
                center: $scope.circleCordinates,
                radius: 200
            });
            previousDrawer = circle;   
    }

 var _clearMap = (drawer) => {
            if (previousDrawer !== null) {
                previousDrawer.setMap(null);
            }
            previousDrawer = drawer;
        }

        NgMap.getMap().then(function (map) {
            let centerLatLng=  $scope.location.address.currentLocation.split(',');
            let latlng = { lat: parseFloat(centerLatLng[0]), lng: parseFloat(centerLatLng[1]) };
            map.setCenter(latlng);
            map.setZoom(15);
            if (location.address.location) {
                if (location.address.location.geometry.wellKnownText.includes('POINT')) {
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
    }

    reviewFilmingLocationController.$inject = ['$rootScope', '$scope', '$uibModalInstance', '$filter', 'location','NgMap'];
})();