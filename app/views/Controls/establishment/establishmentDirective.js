/**=========================================================
 * Module: profileAddress
 * Reuse cases of address in user profile page
 =========================================================*/

(function () {
    'use strict';

    angular
        .module('eServices')
        .directive('establishment', establishment)

    establishment.$inject = ['$rootScope', '$http', '$filter', 'FileUploader', 'SweetAlert']
    function establishment($rootScope, $http, $filter, FileUploader, SweetAlert) {
        return {
            restrict: 'E',
            scope: {
                establishmentControl: "=ngModel",
                isEstablishment: "=",
                isForeignjournalist: "=",
                isPreview: '=?',
                isForeigner: '=?',
                isMediaLicenseStep: '=?',
                isRenew: '=?',
                isPartner: '=?'
            },
            templateUrl: '/app/views/Controls/establishment/establishmentDirectiveTemplate.html',
            link: link
        };

        function link(scope, element, attrs) {
            var translate = $filter('translate');
            scope.translateFilter = $filter('translate');
            var unwatch = scope.$watch('establishmentControl', function (newVal, oldVal) {
                scope.isFreeZone = false;

                if (newVal && newVal.id) {
                    init();

                    if (scope.isPreview && scope.establishmentControl.authority == null && scope.establishmentControl.licenseNumber.split("-")[0] == "GOV") {
                        scope.isGovernment = true;
                    }

                    if (scope.isPreview && scope.establishmentControl.authority != null && scope.establishmentControl.authority.code == "FZE") {
                        scope.isFreeZone = true;
                    }

                    unwatch();
                }
                else {
                    init();
                }
            });
            function init() {
                scope.authorityId = scope.establishmentControl.authorityId;
                scope.oldLicenseNumber = scope.establishmentControl.licenseNumber;

                $http.get($rootScope.app.httpSource + 'api/Country')
                    .then(function (response) {
                        scope.countries = response.data;
                    },
                    function (response) { });

                $http.get($rootScope.app.httpSource + 'api/Emirate')
                    .then(function (response) {
                        scope.emirates = response.data;
                        if (scope.isPreview && scope.establishmentControl != null && scope.establishmentControl.authority != null) {
                            scope.establishmentEmirate = $filter('filter')(scope.emirates, { id: scope.establishmentControl.authority.emirateId }, true)[0];
                        }
                    }, function (response) { });

                $http.get($rootScope.app.httpSource + 'api/Authority')
                  .then(function (response) {
                      scope.authorities = response.data;
                  }, function (response) { });

                $http.get($rootScope.app.httpSource + 'api/EstablishmentType')
                  .then(function (response) {
                      scope.establishmentTypes = response.data;
                  }, function (response) { });

                scope.uploadlicenseCopytUrl = 'api/Upload/UploadFile?uploadFile=ProfileLicenseCopyPath';
                scope.uploadtenancyContractUrl = 'api/Upload/UploadFile?uploadFile=ProfileTenancyContractPath';

                if (scope.establishmentControl && scope.establishmentControl.tenancyContractEndDate) {
                    scope.establishmentControl.tenancyContractEndDate = new Date(scope.establishmentControl.tenancyContractEndDate);
                }

                if (scope.isForeigner && scope.establishmentControl) {
                    scope.establishmentControl.hasValidLicense = true;
                }

                //Date Popup Options
                scope.today = function () {
                    scope.establishmentControl.tenancyContractEndDate = new Date();
                };
                scope.clear = function () {
                    scope.establishmentControl.tenancyContractEndDate = null;
                };

                scope.dateOptions = {
                    formatYear: 'yy',
                    maxDate: new Date(2020, 5, 22),
                    minDate: new Date(1920, 5, 22),
                    startingDay: 1
                };

                scope.openTenancyContractDatePopup = function () {
                    scope.tenancyContractDatePopup.opened = true;
                };

                scope.setDate = function (year, month, day) {
                    scope.establishmentControl.tenancyContractEndDate = new Date(year, month, day);
                };

                scope.format = 'dd-MMMM-yyyy';

                scope.tenancyContractDatePopup = {
                    opened: false
                };

                scope.updateLicenseNo = function (licenseNumber) {
                    $http.get($rootScope.app.httpSource + 'api/Establishment/UpdateLicenseNumber', {
                        params: {
                            oldLicenseNumber: scope.oldLicenseNumber,
                            newLicenseNumber: licenseNumber,
                            authorityId: scope.authorityId
                        }
                    }).then(function (response) {
                        scope.result = response.data;
                        if (scope.result.key) {
                            SweetAlert.swal(translate('establishment.success'), translate('establishment.updatedLicenseNo'), "success");
                        }
                        else {
                            if (scope.result.value == 'already exists') {
                                SweetAlert.swal(translate('establishment.error'), translate('establishment.updatedLicenseNoError'), "error");
                                scope.resetEstablishment();
                            }     
                        }
                    }, function () {
                        SweetAlert.swal('خطاء', 'الحساب غير موجود', "error");
                    });
                };

                scope.resetEstablishment = function () {
                    scope.establishmentControl.licenseNumber = scope.oldLicenseNumber;
                };
            }
        };
    }
})();
