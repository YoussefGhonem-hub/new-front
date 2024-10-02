/**=========================================================
 * Module: LoginController.js
 * Controller for the Chat APP 
 =========================================================*/

(function () {
    'use strict';

    angular
        .module('eServices')
        .controller('CirculationMediaMaterialPermitController', CirculationMediaMaterialPermitController);

    function CirculationMediaMaterialPermitController($rootScope, $scope, $http, $stateParams, $state, $filter, $uibModal, UserProfile, SweetAlert, browser) {
        var vm = this;
        vm.serviceFeesObj = { serviceId: 10, serviceFee: [] };

        vm.Init = function () {
            vm.urgentServices = { serviceId: 10, confirmFlag: false, service: [] };
            vm.terms = {};
            vm.user = UserProfile.getProfile();
            vm.happinessMeterObj = {};
            vm.happinessMeterObj.serviceId = 10;

            // -----------------------------------
            // File Uploading Handlers
            // -----------------------------------
            vm.uploadCopyrightsCopyUrl = 'api/Upload/UploadFile?uploadFile=CopyrightsPath';

            $http.get($rootScope.app.httpSource + 'api/country')
                .then(function (response) {
                    vm.countries = response.data;
                });

            $http.get($rootScope.app.httpSource + 'api/MediaMaterialType')
                .then(function (response) {
                    vm.mediaMaterialTypes = response.data.filter(function (el) {
                        return (el.nameEn !== "Newspaper" && el.nameEn !== "Magazine");
                    });

                    $http.get($rootScope.app.httpSource + 'api/Establishment/GetEstablishmentApplications?estId=' + $state.params.establishmentId)
                        .then(function (response) {
                            $scope.establishmentApplications = response.data;
                            var establishment = $filter('filter')($scope.establishmentApplications, { establishmentId: parseInt($state.params.establishmentId) }, true)[0];

                            if (establishment.numberOfOpticalMediaApplications == 0) {
                                var opticalMediaMaterialType = $filter('filter')(vm.mediaMaterialTypes, { code: '02' }, true)[0];
                                var index = vm.mediaMaterialTypes.indexOf(opticalMediaMaterialType);
                                vm.mediaMaterialTypes.splice(index, 1);
                            }

                            if (establishment.numberOfAudioMediaApplications == 0) {
                                var audioMediaMaterialType = $filter('filter')(vm.mediaMaterialTypes, { code: '03' }, true)[0];
                                var index = vm.mediaMaterialTypes.indexOf(audioMediaMaterialType);
                                vm.mediaMaterialTypes.splice(index, 1);
                            }

                            if (establishment.numberOfComputerProgramsMediaApplications == 0) {
                                var computerProgramsMediaMaterialType = $filter('filter')(vm.mediaMaterialTypes, { code: '05' }, true)[0];
                                var index = vm.mediaMaterialTypes.indexOf(computerProgramsMediaMaterialType);
                                vm.mediaMaterialTypes.splice(index, 1);
                            }

                            if (establishment.numberOfVideoGamesMediaApplications == 0) {
                                var videoGamesMediaMaterialType = $filter('filter')(vm.mediaMaterialTypes, { code: '04' }, true)[0];
                                var index = vm.mediaMaterialTypes.indexOf(videoGamesMediaMaterialType);
                                vm.mediaMaterialTypes.splice(index, 1);
                            }

                            if (establishment.numberOfCinemaMediaApplications == 0) {
                                var cinemaMediaMaterialType = $filter('filter')(vm.mediaMaterialTypes, { code: '01' }, true)[0];
                                var index = vm.mediaMaterialTypes.indexOf(cinemaMediaMaterialType);
                                vm.mediaMaterialTypes.splice(index, 1);
                            }
                        },
                            function (response) { });

                });

            $http.get($rootScope.app.httpSource + 'api/Language')
                .then(function (response) {
                    vm.languages = response.data;
                });

            $http.get($rootScope.app.httpSource + 'api/CopyrightsType')
                .then(function (response) {
                    vm.copyrightsTypes = response.data;
                });

            // -----------------------------------
            // Date Of Birth Datepicker
            // -----------------------------------
            // Disable select days < today
            $scope.toggleMin = function () {
                $scope.minDate = $scope.minDate ? null : new Date();
            };
            $scope.toggleMin();

            $scope.startopen = function ($event) {
                $event.preventDefault();
                $event.stopPropagation();

                $scope.startopened = true;
            };

            $scope.startdateOptions = {
                startingDay: 1
            };

            $scope.startformats = ['dd-MMMM-yyyy', 'yyyy/MM/dd', 'dd.MM.yyyy', 'shortDate'];
            $scope.startformat = $scope.startformats[0];
            // -----------------------------------
            // Date Of Birth Datepicker
            // -----------------------------------
            // Disable select days < start date
            $scope.enddisabled = function (date, mode) {
                return date < vm.CirculationMediaMaterial.copyrightsStartDate;
            };

            $scope.endtoggleMin = function () {
                $scope.endminDate = $scope.endminDate ? null : new Date();
            };
            $scope.endtoggleMin();

            $scope.endopen = function ($event) {
                $event.preventDefault();
                $event.stopPropagation();

                $scope.endopened = true;
            };

            $scope.enddateOptions = {
                startingDay: 1
            };

            $scope.endformats = ['dd-MMMM-yyyy', 'yyyy/MM/dd', 'dd.MM.yyyy', 'shortDate'];
            $scope.endformat = $scope.endformats[0];

            $scope.$watch('circulationCtl.mediaMaterialType', function (newVal, oldVal) {
                if (newVal != undefined) {
                    vm.serviceFeesObj.mediaMaterialTypeId = newVal.id;
                    vm.serviceFeesObj.reloadTable();
                }
            });

            $scope.$watch('circulationCtl.urgentServices', function (newVal, oldVal) {
                if (newVal != undefined) {
                    vm.serviceFeesObj.isUrgent = newVal.confirmFlag;
                    if (vm.serviceFeesObj.reloadTable)
                        vm.serviceFeesObj.reloadTable();
                }
            }, true);
        };

        //New Form Condition
        if ($state.params === undefined || $state.params.id === undefined || $state.params.id === "") {
            // New Permit
            vm.editMode = false;
            vm.CirculationMediaMaterial = {
                title: "",
                writer: "",
                director: "",
                production: "",
                duration: "",
                localDistributor: "",
                distributionScope: "",
                copyrightsStartDate: "",
                copyrightsEndDate: "",
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
                        serviceId: 10
                    }
                }
            };

            $http.get($rootScope.app.httpSource + 'api/Establishment/GetById?id=' + $state.params.establishmentId)
                .then(function (response) {
                    vm.CirculationMediaMaterial.applicationDetail.application.establishment = response.data;
                });

            vm.Init();
        }
        else {
            //Get the details of the submitted Form to edit
            $http.get($rootScope.app.httpSource + 'api/CirculationMediaMaterial/GetById?id=' + $state.params.id)
                .then(function (response) {
                    response.data.copyrightsStartDate = new Date(response.data.copyrightsStartDate);
                    response.data.copyrightsEndDate = new Date(response.data.copyrightsEndDate);
                    vm.CirculationMediaMaterial = response.data;
                    vm.editMode = true;
                    vm.Init();
                });
        }

        //Save the details to the server
        vm.save = function (applicationStatusId) {
            vm.isBusy = true;
            vm.showRequiredError = false;
            vm.isBusy = true;
            vm.CirculationMediaMaterial.applicationDetail.payments[0].paymentDetails = vm.serviceFeesObj.serviceFee;

            if ($rootScope.app.isPMOHappiness) {
                switch (applicationStatusId) {
                    case 1:
                        $http.post($rootScope.app.httpSource + 'api/CirculationMediaMaterial/SaveCirculationMediaMaterial', vm.CirculationMediaMaterial)
                            .then(function (response) {
                                vm.isBusy = false;
                                vm.happinessMeterObj.transactionId = response.data;
                                vm.showHappinessMeter = true;
                            },
                                function (response) { // optional
                                    vm.isBusy = false;
                                });

                        break;

                    case 2:
                        $http.post($rootScope.app.httpSource + 'api/CirculationMediaMaterial/SubmitCirculationMediaMaterial', vm.CirculationMediaMaterial)
                            .then(function (response) {
                                vm.isBusy = false;
                                vm.happinessMeterObj.transactionId = response.data;
                                vm.showHappinessMeter = true;
                            },
                                function (response) { // optional
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
                    vm.CirculationMediaMaterial.applicationDetail.happinessRate = happinessRate;
                    //Post to save
                    switch (applicationStatusId) {
                        case 1:
                            $http.post($rootScope.app.httpSource + 'api/CirculationMediaMaterial/SaveCirculationMediaMaterial', vm.CirculationMediaMaterial)
                                .then(function (response) {
                                    vm.isBusy = false;
                                    $state.go('app.dashboard');
                                },
                                    function (response) { // optional
                                        vm.isBusy = false;
                                    });
                            break;

                        case 2:
                            $http.post($rootScope.app.httpSource + 'api/CirculationMediaMaterial/SubmitCirculationMediaMaterial', vm.CirculationMediaMaterial)
                                .then(function (response) {
                                    vm.isBusy = false;
                                    vm.paymentPopup(response.data);
                                },
                                    function (response) { // optional
                                        vm.isBusy = false;
                                    });
                            break;
                    }
                });
            }
        }

        vm.workflowClick = function (actionId) {
            vm.isBusy = true;
            switch (actionId) {
                case 12:
                    $http.post($rootScope.app.httpSource + 'api/CirculationMediaMaterial/UpdateCirculationMediaMaterial', vm.CirculationMediaMaterial)
                        .then(function (response) {
                            $state.go('app.dashboard');
                        },
                            function (response) { // optional
                                vm.isBusy = false;
                            });
                    break;

                case 13:
                    $http.post($rootScope.app.httpSource + 'api/CirculationMediaMaterial/SubmitUpdateCirculationMediaMaterial', vm.CirculationMediaMaterial)
                        .then(function (response) {
                            if (vm.serviceFeesObj.serviceFee.length == 0 || vm.CirculationMediaMaterial.applicationDetail.payments[0].paymentStatusId == 3) {
                                $state.go('app.dashboard');
                            }
                            else {
                                vm.paymentPopup(vm.CirculationMediaMaterial.applicationDetail.id);
                            }
                        },
                            function (response) { // optional
                                vm.isBusy = false;
                            });
                    break;
            }
        }

        vm.paymentPopup = function (applicationDetailId) {
            SweetAlert.swal({
                title: $filter('translate')('payment.applicationSubmittedSuccessfully'),
                text: $filter('translate')('payment.proceed'),
                type: "warning",
                showCancelButton: true,
                confirmButtonColor: "#DD6B55",
                confirmButtonText: $filter('translate')('payment.payNow'),
                cancelButtonText: $filter('translate')('payment.payLater'),
                closeOnConfirm: true,
                closeOnCancel: true
            }, function (isConfirm) {
                if (isConfirm) {
                    var modalInstance = $uibModal.open({
                        templateUrl: 'app/views/Payment/transactionRequest/transactionRequest.html',
                        controller: 'TransactionRequestController',
                        size: 'lg',
                        keyboard: false,
                        backdrop: 'static',
                        resolve: {
                            applicationDetailId: applicationDetailId,
                            isRenew: function () { return false; }
                        }
                    });
                    modalInstance.result.then(function (action) {
                    });
                } else {
                    $state.go('app.dashboard');
                }
            });
        }
    }
    CirculationMediaMaterialPermitController.$inject = ['$rootScope', '$scope', '$http', '$stateParams', '$state', '$filter', '$uibModal', 'UserProfile', 'SweetAlert', 'browser'];
})();