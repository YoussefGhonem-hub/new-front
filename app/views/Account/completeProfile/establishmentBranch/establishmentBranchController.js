/**=========================================================
 * Module: LoginController.js
 * Controller for the Chat APP 
 =========================================================*/

(function () {
    'use strict';

    angular
        .module('eServices')
        .controller('EstablishmentBranchController', EstablishmentBranchController);
    /* @ngInject */
    function EstablishmentBranchController($rootScope, $scope, $uibModalInstance, $filter, emirates, establishment, userType, freeZoneEstablishment, $compile) {
        $scope.emirates = emirates;
        $scope.userType = userType;  
        $scope.isValidLicense = true;

        if (establishment == null) {
            $scope.establishment = {};
            $scope.establishment.id = 0;
            $scope.establishment.address = {};
            $scope.establishment.hasValidLicense = false;
            $scope.establishment.isAllowPartnerChange = true;

            if ($scope.userType.id == 5) {
                $scope.establishment.hasValidLicense = true;
                if (freeZoneEstablishment.email == "shaikha.alyassi@dmc.ae" || freeZoneEstablishment.email == "ayesha.alshaibani@tecom.ae" || freeZoneEstablishment.email == "melanie.virgenesa@dmc.ae") {
                    $scope.establishment.establishmentEmirate = $filter('filter')($scope.emirates, { id: 6 }, true)[0];
                    $scope.establishment.authority = {};
                    $scope.establishment.authority.id = 151;
                    $scope.establishment.parentId = 6829;
                }
                else if (freeZoneEstablishment.email == "k.sanchu@rakez.com") {
                    $scope.establishment.establishmentEmirate = $filter('filter')($scope.emirates, { id: 10 }, true)[0];
                    $scope.establishment.authority = {};
                    $scope.establishment.authority.id = 111;
                    $scope.establishment.parentId = 1699;
                }
                else if (freeZoneEstablishment.email == "hassna.hraima@shams.ae") {
                    $scope.establishment.establishmentEmirate = $filter('filter')($scope.emirates, { id: 7 }, true)[0];
                    $scope.establishment.authority = {};
                    $scope.establishment.authority.id = 137;
                    $scope.establishment.parentId = 5719;
                }
                else if (freeZoneEstablishment.email == "doaa.zaki@ccfz.ae") {
                    $scope.establishment.establishmentEmirate = $filter('filter')($scope.emirates, { id: 12 }, true)[0];
                    $scope.establishment.authority = {};
                    $scope.establishment.authority.id = 102;
                    $scope.establishment.parentId = 1412;
                }
                else if (freeZoneEstablishment.email == "operations@twofour54.com") {
                    $scope.establishment.establishmentEmirate = $filter('filter')($scope.emirates, { id: 1 }, true)[0];
                    $scope.establishment.authority = {};
                    $scope.establishment.authority.id = 103;
                    $scope.establishment.parentId = 1419;
                }
                else if (freeZoneEstablishment.email == "tarakhees@amcfz.ae") {
                    $scope.establishment.establishmentEmirate = $filter('filter')($scope.emirates, { id: 8 }, true)[0];
                    $scope.establishment.authority = {};
                    $scope.establishment.authority.id = 1169;
                    $scope.establishment.parentId = 15435;
                }
            }

            if ($scope.userType.id == 24) {
                $scope.establishment.hasValidLicense = true;
                $scope.establishment.establishmentEmirate = $filter('filter')($scope.emirates, { id: 7 }, true)[0];
                $scope.establishment.authority = {};
                $scope.establishment.authority.id = 1173;
                $scope.establishment.parentId = 16030;
            }
        }
        else
        {
            $scope.establishment = establishment;
            $scope.establishment.establishmentEmirate = $filter('filter')($scope.emirates, { id: $scope.establishment.authority.emirateId }, true)[0];

            if ($scope.userType.id == 5 || $scope.userType.id == 24) {
                $scope.establishment.hasValidLicense = true;
            }
            if (establishment.tenancyContractEndDate) {
                $scope.establishment.tenancyContractEndDate = new Date(establishment.tenancyContractEndDate);
            }
        }

        $scope.licenseUrl = 'api/Upload/UploadFile?uploadFile=ProfileLicenseCopyPath';
        $scope.tenancyUrl = 'api/Upload/UploadFile?uploadFile=ProfileTenancyContractPath';
        
        $scope.ok = function () {
            $uibModalInstance.close($scope.establishment);
        };

        $scope.closeModal = function () {
            $uibModalInstance.dismiss('cancel');
        };

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

        $scope.onChangeLicenceType = function () {
            $scope.establishment.licenseNumber = "";
        }      

        $scope.onLicenseChanged = function () {
            if ($scope.establishment.establishmentEmirate) {
                if ($scope.establishment.establishmentEmirate.code == 'AD') {

                    var licenseNo = $filter('uppercase')($scope.establishment.licenseNumber).split('-');

                    if ($scope.establishment.licenseNumber.length > 3) {
                        $scope.establishment.licenseNumber = licenseNo[0] + "-" + licenseNo[1].replace(/\D/g, '');
                    }

                    else if ($scope.establishment.licenseNumber.length < 3)
                    {
                        $scope.establishment.licenseNumber = licenseNo[0].replace(/\d/g, '');
                    }

                    if ($scope.establishment.hasValidLicense == false) {
                        if (licenseNo[0] == "TN") {
                            $scope.isValidLicense = true;
                        }
                        else {
                            $scope.isValidLicense = false;
                        }
                    }
                    else {
                        if (licenseNo[0] == "CN") {
                            $scope.isValidLicense = true;
                        }
                        else {
                            $scope.isValidLicense = false;
                        }
                    }
                }
            }        
        }
               
        //END
    }

    EstablishmentBranchController.$inject = ['$rootScope', '$scope', '$uibModalInstance', '$filter', 'emirates', 'establishment', 'userType', 'freeZoneEstablishment','$compile'];
})();