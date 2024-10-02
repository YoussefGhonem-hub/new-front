
(function () {
    'use strict';

    angular
        .module('eServices')
        .controller('AddEstablishmentController', AddEstablishmentController);
    /* @ngInject */

    AddEstablishmentController.$inject = ['$rootScope', '$scope', '$http', '$uibModalInstance', '$uibModal', '$filter', 'emirates', 'establishment', 'userType','SweetAlert']; 

    function AddEstablishmentController($rootScope, $scope, $http, $uibModalInstance, $uibModal, $filter, emirates, establishment, userType, SweetAlert) { 

        $scope.emirates = emirates;
        $scope.userType = userType;
        $scope.isValidLicense = true;

        if (establishment == null) {
            $scope.establishment = {};
            $scope.establishment.id = 0;
            $scope.establishment.address = {};
        }
        else {
            $scope.establishment = establishment;
            $scope.establishment.establishmentEmirate = $filter('filter')($scope.emirates, { id: $scope.establishment.authority.emirateId }, true)[0];
        }

        $scope.licenseUrl = 'api/Upload/UploadFile?uploadFile=ProfileLicenseCopyPath';
        $scope.tenancyUrl = 'api/Upload/UploadFile?uploadFile=ProfileTenancyContractPath';

        $scope.ok = function () {
           $uibModalInstance.close($scope.establishment);
        };

        $scope.closeModal = function () {
            $uibModalInstance.dismiss('cancel');
        };

        ///Check License number exist
        $scope.CheckLicenseNumber = function () {
            $http.get($rootScope.app.httpSource + 'api/Establishment/CheckLicenseNumber',
                {
                    params: {
                        licenseNumber: $scope.establishment.licenseNumber,
                        authorityId: $scope.establishment.authority.id
                    }
                })
                .then(
                function (response) {
                    var translate = $filter('translate');
                    if (response.data != null) {
                        SweetAlert.swal(translate('establishment.error'), translate('establishment.alreadyExist'), "error");
                    }
                })
        };

        $scope.onLicenseChanged = function () {
            if ($scope.establishment.establishmentEmirate) {
                if ($scope.establishment.establishmentEmirate.code == 'AD') {

                    var licenseNo = $filter('uppercase')($scope.establishment.licenseNumber).split('-');

                    if ($scope.establishment.licenseNumber.length > 3) {
                        $scope.establishment.licenseNumber = licenseNo[0] + "-" + licenseNo[1].replace(/\D/g, '');
                    }

                    else if ($scope.establishment.licenseNumber.length < 3) {
                        $scope.establishment.licenseNumber = licenseNo[0].replace(/\d/g, '');
                    }

                    if (licenseNo[0] == "TN" || licenseNo[0] == "CN") {
                        $scope.isValidLicense = true;
                    }
                    else {
                        $scope.isValidLicense = false;
                    }
                }
            }
        }

        ///Get Location
        $scope.getLocation = function () {
            if (!$scope.timelineOpened) {
                var modalInstance = $uibModal.open({
                    templateUrl: 'app/views/Inspection/maps/maps.html',
                    controller: 'mapsController',
                    size: 'lg',
                    resolve: {
                        establishment: function () {
                            return $scope.establishment;
                        }
                    }
                });

                modalInstance.result.then(function (establishmentBranch) {
                    $scope.timelineOpened = false;
                }, function () {
                });

                // we want to update state whether the modal closed or was dismissed,
                // so use finally to handle both resolved and rejected promises.
                modalInstance.result.finally(function (selectedItem) {
                    $scope.timelineOpened = false;
                });
            }

            $scope.timelineOpened = true;
        }

        //Date Popup Options
        $scope.today = function () {
            $scope.establishment.tenancyContractEndDate = new Date();
        };
        $scope.clear = function () {
            $scope.establishment.tenancyContractEndDate = null;
        };

        $scope.dateOptions = {
            formatYear: 'yy',
            maxDate: new Date(2020, 5, 22),
            minDate: new Date(1920, 5, 22),
            startingDay: 1
        };

        $scope.openTenancyContractDatePopup = function () {
            $scope.tenancyContractDatePopup.opened = true;
        };

        $scope.setDate = function (year, month, day) {
            $scope.establishment.tenancyContractEndDate = new Date(year, month, day);
        };

        $scope.format = 'dd-MMMM-yyyy';

        $scope.tenancyContractDatePopup = {
            opened: false
        };
        //END    
    }
})();