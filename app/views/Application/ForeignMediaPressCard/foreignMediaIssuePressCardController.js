
(function () {
    'use strict';
    angular
        .module('eServices')
        .controller('ForeignMediaIssuePressCardController', ForeignMediaIssuePressCardController);

    function ForeignMediaIssuePressCardController($rootScope, $scope, $http, $stateParams, $state, $window, $uibModal, UserProfile, browser,
        DTOptionsBuilder, DTColumnBuilder, $compile, $filter, SweetAlert, FileUploader) {
        var vm = this;
        vm.translateFilter = $filter('translate');
        vm.user = UserProfile.getProfile();
        vm.visitDetOpen = true;
        vm.serviceFeesObj = { serviceId: 18, serviceFee: [], isRenew: false, isTemporaryPressCard: false, isExpo2020: false };
        vm.userProfile = {};

        //------------------------------------------------
        $scope.openCrop = function () {

            var modalInstance = $uibModal.open({
                templateUrl: 'app/views/Controls/cropImg/cropController.html',
                controller: 'CropController',
                size: 'lg',
                keyboard: false,
                backdrop: 'static'
            });

            modalInstance.result.then(function (url) {
                if (vm.user.userTypeCode == '05') {                    
                    vm.loggedUserPersonData.photoUrl = url.photoUrl;
                    vm.loggedUserPersonData.photoUrlFullPath = url.photoUrlFullPath;
                }
                else {
                    vm.loggedUserPersonData.photoUrl = url.photoUrl;
                    vm.loggedUserPersonData.photoUrlFullPath = url.photoUrlFullPath;
                }
            });
        }
        //------------------------------------------------

        $http.get($rootScope.app.httpSource + 'api/BusinessType')
            .then(function (response) {
                vm.businessTypes = response.data;
            });

        $http.get($rootScope.app.httpSource + 'api/Country')
            .then(function (response) {
                vm.countries = response.data;
            });

        $http.get($rootScope.app.httpSource + 'api/EconomicActivity')
            .then(function (response) {
                vm.economicActivities = response.data;
            });
        //$http.get($rootScope.app.httpSource + 'api/Office')
        //    .then(function (response) {
        //        vm.offices = response.data;
        //    });

        $http.get($rootScope.app.httpSource + 'api/UserProfile')
            .then(function (resp) {
                if (resp.data != null) {
                    resp.data.person.dateOfBirth = new Date(resp.data.person.dateOfBirth);
                    if (vm.user.userTypeCode == '01' || vm.user.userTypeCode == '07') {
                        vm.loggedUserData = resp.data.user;
                        vm.loggedUserPersonData = resp.data.person;
                    }
                    else {
                        vm.loggedUserData = resp.data.user;
                    }
                }
            });

        vm.goToSecondStep = function () {
            vm.activeStep = 2;
        }

        vm.goToThirdStep = function () {
            vm.activeStep = 3;
        }

        vm.changeFee = function (obj) {
            if (obj == true) {
                vm.serviceFeesObj.isTemporaryPressCard = true;
                vm.serviceFeesObj.reloadTable();
            }
            else {
                vm.serviceFeesObj.isTemporaryPressCard = false;
                vm.serviceFeesObj.reloadTable();
            }
        };

        vm.changeFeeForExpo = function (obj) {
            if (obj == true) {
                vm.serviceFeesObj.isExpo2020 = true;
                vm.serviceFeesObj.reloadTable();
            }
            else {
                vm.serviceFeesObj.isExpo2020 = false;
                vm.serviceFeesObj.reloadTable();
            }
        };

        vm.Init = function () {
            vm.isBusy = false;
            vm.activeStep = 1;
            vm.mediaLicenses.pressCard[0].deliveryType = false;
            vm.format = 'dd-MMMM-yyyy';

            vm.terms = {};
            vm.uploadAssignmentLetterUrl = 'api/Upload/UploadFile?uploadFile=assignmentLetterPath';
            vm.uploadAcademicQualificationUrl = 'api/Upload/UploadFile?uploadFile=QualificationCopyPath';
            vm.passportCopyUrl = 'api/Upload/UploadFile?uploadFile=ProfilePassportPhotoPath';
            vm.photoUrl = 'api/Upload/UploadFile?uploadFile=ProfilePersonalPhotoPath';
            vm.acquitanceFormUrl = 'api/Upload/UploadFile?uploadFile=AcquaintanceFormPath';
            vm.uploadIqamaUrl = 'api/Upload/UploadFile?uploadFile=IqamaCopyPath';
            vm.uploadEmiratesIdUrl = 'api/Upload/UploadFile?uploadFile=ProfileEmaraitsIDPhotoPath';
            vm.uploadExpoProofUrl = 'api/Upload/UploadFile?uploadFile=ExpoProofPath';

            vm.happinessMeterObj = {};
            vm.happinessMeterObj.serviceId = 18;
            vm.happinessMeterObj.applicationType = {};
            vm.happinessMeterObj.applicationType.pmoCode = "000";

            //Date Popup Options
            $scope.clear = function () {
                $scope.dateOfBirth = null;
            };

            var start = new Date();
            start.setFullYear(start.getFullYear() - 97);
            var end = new Date();
            end.setFullYear(end.getFullYear() - 12);

            $scope.dateOptions = {
                minDate: start,
                maxDate: end,
                startingDay: 1,
                todayBtn: false
            };
            if ($scope.dateOfBirth) {
                $scope.dateOfBirth = new Date($scope.dateOfBirth);
            }
            $scope.opendateOfBirthDatePopup = function () {
                $scope.dateOfBirthPopup.opened = true;
            };
            $scope.setDate = function (year, month, day) {
                $scope.dateOfBirth = new Date(year, month, day);
            };
            $scope.format = 'dd-MMMM-yyyy';
            $scope.toggleMin = function () {
                $scope.minDate = start;
            };
            $scope.dateOfBirthPopup = {
                opened: false
            };
            //END
        };

        //New Form Condition
        if ($state.params === undefined || $state.params.id === undefined || $state.params.id === "") {
            // New Permit
            vm.editMode = false;
            vm.mediaLicenses = {
                applicationDetail: {
                    payments: [{
                        paymentDetails: []
                    }],
                    browser: {
                        name: browser.name
                    },
                    platform: {
                        name: browser.platform
                    },
                    versionNumber: browser.versionNumber,
                    application: {
                        serviceId: 18
                    }
                },
                mediaLicenseEconomicActivities: [{}],
                pressCard: [{
                    isTemporaryCard: false,
                    isExpo: false,
                    foreignEntity: {
                        foreignEntitySocialMedias: [{ isForeignMediaLicense: true }]
                    },
                    person: {}
                }]

            };
            vm.Init();
        }
        else {
            //Get the details of the submitted Form to edit
            $http.get($rootScope.app.httpSource + 'api/ForeignPressCard/GetById?id=' + $state.params.id)
                .then(function (response) {
                    vm.editMode = true;
                    vm.mediaLicenses = response.data;
                    vm.serviceFeesObj.isTemporaryPressCard = vm.mediaLicenses.pressCard[0].isTemporaryCard;
                    vm.serviceFeesObj.isExpo2020 = vm.mediaLicenses.pressCard[0].isExpo;

                    vm.mediaLicenses1 = {};
                    vm.mediaLicenses1.pressCard1 = [];
                    vm.mediaLicenses1.pressCard1.foreignEntity1 = {};
                    vm.mediaLicenses1.pressCard1.foreignEntity1.foreignEntitySocialMedias1 = [{ isForeignMediaLicense: true }];
                    vm.mediaLicenses1.pressCard1.foreignEntity1.foreignEntitySocialMedias1.mediaLicenseEconomicActivityExternalMediaAccounts = [];

                    if (vm.mediaLicenses.applicationDetail.applicationStatusId == 1 && vm.user.userTypeCode != "06" && vm.mediaLicenses.applicationDetail.actionsTakens.length > 1) {
                        if (vm.mediaLicenses.applicationDetail.actionsTakens[vm.mediaLicenses.applicationDetail.actionsTakens.length - 1].transition.actionId == 32 &&
                            vm.mediaLicenses.applicationDetail.actionsTakens[vm.mediaLicenses.applicationDetail.actionsTakens.length - 1].note != "") {
                            vm.employeeNote = vm.mediaLicenses.applicationDetail.actionsTakens[vm.mediaLicenses.applicationDetail.actionsTakens.length - 1].note;
                            vm.employeeNoteDate = moment(vm.mediaLicenses.applicationDetail.actionsTakens[vm.mediaLicenses.applicationDetail.actionsTakens.length - 1].actionDate).format("dddd, MMMM Do YYYY, h:mm:ss a");
                        }
                    }
                    for (var i = 0; i < vm.mediaLicenses.pressCard[0].foreignEntity.foreignEntitySocialMedias.length; i++) {
                        var foreignEntitySocialmedia = vm.mediaLicenses.pressCard[0].foreignEntity.foreignEntitySocialMedias[i];
                        vm.mediaLicenses1.pressCard1.foreignEntity1.foreignEntitySocialMedias1.mediaLicenseEconomicActivityExternalMediaAccounts.push({ externalMediaAccount: foreignEntitySocialmedia });
                    }
                    if (vm.user.userTypeCode == '05') {
                        vm.loggedUserPersonData = vm.mediaLicenses.pressCard[0].person;
                        vm.loggedUserPersonData.photoUrl = vm.mediaLicenses.pressCard[0].person.photoUrl;
                        vm.loggedUserPersonData.photoUrlFullPath = vm.mediaLicenses.pressCard[0].person.photoUrlFullPath;
                    }

                    vm.mediaLicenses2 = {};
                    vm.mediaLicenses2.foreignEntitySocialMedias1 = [];
                    vm.mediaLicenses2.foreignEntitySocialMedias1 = [];
                    vm.mediaLicenses2.foreignEntitySocialMedias1.push(vm.mediaLicenses1.pressCard1.foreignEntity1.foreignEntitySocialMedias1);
                    vm.Init();
                });
        }

        vm.save = function (applicationStatusId) {
            vm.isBusy = true;

            if (vm.serviceFeesObj.serviceFee[0] != null) {
                vm.mediaLicenses.applicationDetail.payments[0].paymentDetails = vm.serviceFeesObj.serviceFee;
            }
            else {
                vm.mediaLicenses.applicationDetail.payments = null;
            }

            //vm.mediaLicenses.applicationDetail.payments[0].paymentDetails = vm.serviceFeesObj.serviceFee;

            for (var i = 0; i < vm.mediaLicenses.pressCard[0].foreignEntity.foreignEntitySocialMedias[0].mediaLicenseEconomicActivityExternalMediaAccounts.length; i++) {
                var foreignEntitySocialmedia = vm.mediaLicenses.pressCard[0].foreignEntity.foreignEntitySocialMedias[0].mediaLicenseEconomicActivityExternalMediaAccounts[i].externalMediaAccount;
                vm.mediaLicenses.pressCard[0].foreignEntity.foreignEntitySocialMedias.push(foreignEntitySocialmedia);
            }
            vm.mediaLicenses.pressCard[0].foreignEntity.foreignEntitySocialMedias.splice(0, 1);
            vm.mediaLicenses.mediaLicenseEconomicActivities.splice(0, 1);
            vm.mediaLicenses.mediaLicenseEconomicActivities.push({ economicActivity: { id: 1041, isRequireThirdPartyApproval: true } });
            vm.mediaLicenses.pressCard[0].person = vm.loggedUserPersonData;

            if ($rootScope.app.isPMOHappiness) {
                switch (applicationStatusId) {
                    case 1:
                        $http.post($rootScope.app.httpSource + 'api/ForeignPressCard/SaveForeignPressCard', vm.mediaLicenses)
                            .then(function (response) {
                                if (response.data == "false") {
                                    vm.EmritIdRepeated = true;
                                    vm.isBusy = false;
                                }
                                else {
                                    vm.EmritIdRepeated = false;
                                    vm.happinessMeterObj.transactionId = response.data;
                                    vm.showHappinessMeter = true;
                                }
                            },
                                function (response) { // optional
                                    if (response.data.exceptionMessage == "Maxinum3TimesApplied") {
                                        SweetAlert.swal(vm.translateFilter('foreignMedia.Max3TimesApplied'), vm.translateFilter('foreignMedia.applicationNotSubmitted'), "error");
                                        $state.go('app.dashboard');
                                    }
                                    vm.isBusy = false;
                                });

                        break;

                    case 2:
                        $http.post($rootScope.app.httpSource + 'api/ForeignPressCard/SubmitForeignPressCard', vm.mediaLicenses)
                            .then(function (response) {
                                vm.happinessMeterObj.transactionId = response.data;
                                vm.showHappinessMeter = true;
                            },
                                function (response) { // optional
                                    if (response.data.exceptionMessage == "Maxinum3TimesApplied") {
                                        SweetAlert.swal(vm.translateFilter('foreignMedia.Max3TimesApplied'), vm.translateFilter('foreignMedia.applicationNotSubmitted'), "error");
                                        $state.go('app.dashboard');
                                    }
                                    vm.isBusy = false;
                                });

                        break;
                }
            }
            else {
                var modalInstance = $uibModal.open({
                    templateUrl: 'app/views/Controls/happinessRating/happinessRating.html',
                    controller: 'HappinessRatingController',
                    size: 'lg',
                    keyboard: false,
                    backdrop: 'static'
                });

                modalInstance.result.then(function (happinessRate) {
                    vm.mediaLicenses.applicationDetail.happinessRate = happinessRate;
                    //Post to save
                    switch (applicationStatusId) {
                        case 1:
                            $http.post($rootScope.app.httpSource + 'api/ForeignPressCard/SaveForeignPressCard', vm.mediaLicenses)
                                .then(function (response) {
                                    if (response.data == "false") {
                                        vm.EmritIdRepeated = true;
                                        vm.isBusy = false;
                                    }
                                    else {
                                        vm.EmritIdRepeated = false;
                                        $state.go('app.dashboard');
                                    }
                                },
                                    function (response) { // optional
                                        if (response.data.exceptionMessage == "Maxinum3TimesApplied") {
                                            SweetAlert.swal(vm.translateFilter('foreignMedia.Max3TimesApplied'), vm.translateFilter('foreignMedia.applicationNotSubmitted'), "error");
                                            $state.go('app.dashboard');
                                        }
                                        vm.isBusy = false;
                                    });
                            break;

                        case 2:
                            $http.post($rootScope.app.httpSource + 'api/ForeignPressCard/SubmitForeignPressCard', vm.mediaLicenses)
                                .then(function (response) {
                                    $state.go('app.dashboard');
                                },
                                    function (response) { // optional
                                        if (response.data.exceptionMessage == "Maxinum3TimesApplied") {
                                            SweetAlert.swal(vm.translateFilter('foreignMedia.Max3TimesApplied'), vm.translateFilter('foreignMedia.applicationNotSubmitted'), "error");
                                            $state.go('app.dashboard');
                                        }
                                        vm.isBusy = false;
                                    });
                            break;
                    }
                });
            }
        }

        vm.workflowClick = function (actionId) {
            vm.isBusy = true;

            //if (vm.serviceFeesObj.serviceFee.length != 0 && vm.serviceFeesObj.isExpo2020 && actionId == 32) {
            //    vm.paymentDetails = {};
            //    vm.mediaLicenses.applicationDetail.payments.push(vm.paymentDetails);
            //    vm.mediaLicenses.applicationDetail.payments[0].paymentDetails = vm.serviceFeesObj.serviceFee;
            //}
            //else if (vm.serviceFeesObj.serviceFee.length == 0 && vm.serviceFeesObj.isExpo2020) {
            //    vm.mediaMaterial.applicationDetail.payments = null;
            //}

            //vm.mediaLicenses.applicationDetail.payments[0].paymentDetails = vm.serviceFeesObj.serviceFee;

            if (!vm.editMode) {
                for (var i = 0; i < vm.mediaLicenses1.pressCard1[0].foreignEntity1.foreignEntitySocialMedias1[0].mediaLicenseEconomicActivityExternalMediaAccounts.length; i++) {
                    var foreignEntitySocialmedia = vm.mediaLicenses1.pressCard1[0].foreignEntity1.foreignEntitySocialMedias1[0].mediaLicenseEconomicActivityExternalMediaAccounts[i].externalMediaAccount;
                    vm.mediaLicenses.pressCard[0].foreignEntity.foreignEntitySocialMedias.push(foreignEntitySocialmedia);
                }
            }
            else {
                for (var i = 0; i < vm.mediaLicenses2.foreignEntitySocialMedias1[0].mediaLicenseEconomicActivityExternalMediaAccounts.length; i++) {
                    var foreignEntitySocialmedia = vm.mediaLicenses2.foreignEntitySocialMedias1[0].mediaLicenseEconomicActivityExternalMediaAccounts[i].externalMediaAccount;
                    vm.mediaLicenses.pressCard[0].foreignEntity.foreignEntitySocialMedias.push(foreignEntitySocialmedia);
                }
            }
            vm.mediaLicenses.pressCard[0].person = vm.loggedUserPersonData;

            switch (actionId) {

                case 29:
                    $http.post($rootScope.app.httpSource + 'api/ForeignPressCard/UpdateForeignPressCard', vm.mediaLicenses)
                        .then(function (response) {
                            $state.go('app.dashboard');
                        },
                            function (response) { // optional
                                vm.isBusy = false;
                            });
                    break;

                case 14:
                    $http.post($rootScope.app.httpSource + 'api/ForeignPressCard/SubmitUpdateForeignPressCard', vm.mediaLicenses)
                        .then(function (response) {
                            $state.go('app.dashboard');
                        },
                            function (response) { // optional
                                vm.isBusy = false;
                            });
                    break;
            }
        }
    }

    ForeignMediaIssuePressCardController.$inject = ['$rootScope', '$scope', '$http', '$stateParams', '$state', '$window', '$uibModal', 'UserProfile', 'browser',
        'DTOptionsBuilder', 'DTColumnBuilder', '$compile', '$filter', 'SweetAlert', 'FileUploader'];
})();