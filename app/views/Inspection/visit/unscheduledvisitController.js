(function () {
    'use strict';

    angular
        .module('eServices')
        .controller('unscheduledvisitController', unscheduledvisitController);

    function unscheduledvisitController($rootScope, $scope, $http, $stateParams, $state, $window, $uibModal, UserProfile, browser, $compile, $filter, DTOptionsBuilder, DTColumnBuilder, SweetAlert) {
        var vm = this;
        vm.translateFilter = $filter('translate');

        $scope.licenseUrl = 'api/Upload/UploadFile?uploadFile=ProfileLicenseCopyPath';
        $scope.tenancyUrl = 'api/Upload/UploadFile?uploadFile=ProfileTenancyContractPath';
        $scope.emirates = null;
        $http.get($rootScope.app.httpSource + 'api/Emirate')
            .then(function (response) {
                $scope.emirates = response.data;
            },
                function (response) { });


        $scope.foundEstablishments = [];

        ////////////////////////////////////
        $scope.establishment = {};
        $scope.establishment.establishmentEmirate = null;
        $scope.establishment.licenseNumber = '';
        $scope.establishment.authority = 0;
        $scope.establishment.id = 0;
        $scope.establishment.address = {};

        $scope.user = {};
        $scope.user.email = '';
        $scope.emiratesIdExist = false;

        //$scope.account = {};
        $scope.countries = $http.get($rootScope.app.httpSource + 'api/Country')
            .then(function (response) {
                var countryList = response.data;
                $scope.user.country = $filter('filter')(countryList, { isoCode3: 'ARE' }, true)[0];
                $scope.countries = countryList;
            },
                function (response) { });
        $scope.validMobileNumber = function () {
            $scope.validMobile = true;
        };

        $scope.invalidMobileNumber = function () {
            $scope.validMobile = false;
        };
        $scope.preventLeadingZero = function () {
            if (($scope.user.phoneNumber == undefined || $scope.user.phoneNumber.length == 0) && event.which == 48) {
                event.preventDefault();
            }
        }

        $scope.checkEmiratesIdExist = function () {
            $scope.foundEstablishments = [];
            $http.get($rootScope.app.httpSource + 'api/Account/IsPersonExist',
                {
                    params: {
                        emiratesId: $scope.user.emiratesId
                    }
                })
                .then(function (response) {
                    if (response.data == true) {
                        $scope.emiratesIdExist = true;
                        SweetAlert.swal({
                            title: vm.translateFilter('inspection.warning'),
                            text: vm.translateFilter('completeProfile.EmritIdIsRepeated'),
                            type: "warning",
                            confirmButtonText: vm.translateFilter('general.ok')
                        })
                    }
                    else {
                        $scope.emiratesIdExist = false;
                    }
                });
        };

        $scope.findByLicenseNumber = function () {
            $scope.foundEstablishments = [];
            $http.get($rootScope.app.httpSource + 'api/Establishment/FindByLicenseNumber',
                {
                    params: {
                        licenseNumber: $scope.establishment.licenseNumber,
                        emirateId: $scope.establishment.establishmentEmirate.id
                    }
                })
                .then(function (response) {
                    if (response.data != null) {
                        $scope.foundEstablishments = response.data;
                    }
                });
        };

        $scope.findByEmail = function () {
            $scope.foundUserProfile = [];
            $http.get($rootScope.app.httpSource + 'api/UserProfile/GetUserProfileByEmail',
                {
                    params: {
                        email: $scope.user.email
                    }
                })
                .then(function (response) {
                    if (response.data != null && response.data.userTypeId == 1) {
                        $scope.foundUserProfile.push(response.data);
                        $scope.photoUrl = 'https://apis.uaemc.gov.ae/UserUploads/ProfilePersonalPhoto/' + $scope.foundUserProfile[0].person.photoUrl;
                    }
                    if (response.data != null && response.data.userTypeId != 1) {
                        SweetAlert.swal({
                            title: vm.translateFilter('inspection.warning'),
                            text: "Given email is registred as commercial user",
                            type: "warning",
                            confirmButtonText: vm.translateFilter('general.ok')
                        })
                        setTimeout(function () {
                            window.location.reload();
                        }, 1500);
                    }
                });
        };

        $scope.inspectEstablishment = function (establishment) {
            $state.go('app.visit2', { establishmentId: establishment.id });
        }

        $scope.inspectUser = function (userProfile) {
            $state.go('app.visit2', { establishmentId: userProfile.userId });
        }

        $scope.insertEstablishment = function () {
            var establishmentObj = {
                licenseNumber: $scope.establishment.licenseNumber,
                nameEn: $scope.establishment.nameEn,
                nameAr: $scope.establishment.nameAr,
                licenseCopyUrl: $scope.establishment.licenseCopyUrl,
                authorityId: $scope.establishment.authority.id,
                tenancyContractCopyUrl: $scope.establishment.tenancyContractCopyUrl,
                tenancyContractEndDate: new Date(),
                address: {
                    communityId: $scope.establishment.address.community.id,
                    phoneNumber: $scope.establishment.address.phoneNumber,
                    street: $scope.establishment.address.street,
                    longitude: $scope.establishment.address.longitude,
                    latitude: $scope.establishment.address.latitude
                },
            }

            $http.post($rootScope.app.httpSource + 'api/Establishment/SaveEstablishment', establishmentObj)
                .then(function (response) {
                    $scope.findByLicenseNumber();
                },
                    function (error) {
                    });
        }

        $scope.insertUser = function () {
            var userObj = {
                firstName: $scope.user.firstName,
                lastName: $scope.user.lastName,
                email: $scope.user.email,
                phoneNumber: $scope.user.phoneNumber,
                password: $scope.user.password,
                confirmPassword: $scope.user.confirmPassword,
                country: {
                    "id": "212",
                    "nameAr": "الإمارات العربية المتحدة",
                    "nameEn": "UAE",
                    "phoneCode": "971"
                },
                userProfile: {
                    person: {
                        country: {
                            "id": "212"
                        },
                        genderId: "1",
                        dateOfBirth: "2009-10-31T20:00:00.000Z",
                        emiratesId: $scope.user.emiratesId
                    },
                    address: {
                        community: {
                            "id": 1866
                        },
                        street:"Street name"
                    },
                    "userTypeId": 1,
                    "userType": {
                        "id": 1,
                        "nameEn": "Individual",
                        "nameAr": "فرد",
                        "code": "01"
                    },
                    isCompleted: false
                }
            }
            $http.post($rootScope.app.httpSource + 'api/Account/CreateUser', userObj)
                .then(function (response) {
                    $scope.isBusy = false;
                    $scope.findByEmail();
                    },function (response) { // optional
                        if (response.data.modelState.invalidDataExceptionBase[0] != undefined) {
                            $scope.emailAlreadyTaken = true;
                        }
                    });
        }
    }
    unscheduledvisitController.$inject = ['$rootScope', '$scope', '$http', '$stateParams', '$state', '$window', '$uibModal', 'UserProfile', 'browser', '$compile', '$filter', 'DTOptionsBuilder',
        'DTColumnBuilder', 'SweetAlert'];
})();