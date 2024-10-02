/**=========================================================
 * Module: GoogleMapController.js
 * Google Map plugin controller
 =========================================================*/

(function () {
    'use strict';

    angular
        .module('eServices')
        .controller('mapsController', mapsController);

    mapsController.$inject = ['$scope', '$timeout', '$uibModalInstance', 'NgMap', 'establishment'];
    function mapsController($scope, $timeout, $uibModalInstance, NgMap, establishment) {
        $scope.establishment = establishment;
        $scope.googleMapsUrl = "https://maps.googleapis.com/maps/api/js?key=AIzaSyCTn2DYylyRb1QGSZMTqyHjkofTnDSPfbE";
        if ($scope.establishment.isDraggable) {
            $scope.isDraggable = $scope.establishment.isDraggable;
        }

        $scope.dragEnd = function (event) {
            $scope.establishment.address.latitude = event.latLng.lat();
            $scope.establishment.address.longitude = event.latLng.lng();
        };

        $scope.refreshMap = function () {
            $timeout(function () {
                google.maps.event.trigger($scope.myMap, 'resize');
            }, 100);
        };

        $scope.closeModal = function () {
            $uibModalInstance.close($scope.establishment);
        };

        $scope.mapsSelector = function () {
            if ((navigator.platform.indexOf("iPhone") != -1) ||
                (navigator.platform.indexOf("iPad") != -1) ||
                (navigator.platform.indexOf("iPod") != -1)) {
                let url = "https://maps.google.com/maps?daddr=" + $scope.establishment.address.latitude + "," + $scope.establishment.address.longitude + "&amp;l5=";
                var wnd = window.open(url);
                SweetAlert.swal({
                    title: "Hello",
                    text: "Did you reach to the exact location ?.",
                    type: "warning",
                    showCancelButton: true,
                    confirmButtonClass: "btn-danger",
                    confirmButtonText: "Yes",
                    cancelButtonText: "No",
                    closeOnConfirm: false,
                    closeOnCancel: false
                },
                    function (isConfirm) {
                        if (isConfirm) {
                            swal("", "Thank You. :)", "success");
                        } else {
                            swal("", "Please try again.", "error");
                        }
                    });
                wnd.close();
            }
            else {
                window.open("https://maps.google.com/maps?daddr=" + $scope.establishment.address.latitude + "," + $scope.establishment.address.longitude + "&amp;l5=");
            }
        };
    }
})();
