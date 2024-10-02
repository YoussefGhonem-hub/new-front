/**=========================================================
 * Module: LoginController.js
 * Controller for the Chat APP 
 =========================================================*/

(function () {
    'use strict';

    angular
        .module('eServices')
        .controller('JournalistsAppointmentController', JournalistsAppointmentController);

    function JournalistsAppointmentController($rootScope, $scope, $http, $stateParams, $state, $window, $uibModal, UserProfile, SweetAlert, browser) {
        var vm = this;
        vm.user = UserProfile.getProfile();
        vm.serviceFeesObj = { serviceId: 4, serviceFee: [], isRenew: false };
        vm.uploadOfficialLetterUrl = 'api/Upload/UploadFile?uploadFile=OfficialLetterPath';

        vm.Init = function () {
            vm.terms = {};

            vm.happinessMeterObj = {};
            vm.happinessMeterObj.serviceId = 4;

            if (vm.editMode) {
                if (vm.journalistsAppointment.applicationDetail.applicationStatusId == 1 && vm.user.userTypeCode != "06" && vm.journalistsAppointment.applicationDetail.actionsTakens.length > 1) {
                    if (vm.journalistsAppointment.applicationDetail.actionsTakens[vm.journalistsAppointment.applicationDetail.actionsTakens.length - 1].transition.actionId == 6 &&
                        vm.journalistsAppointment.applicationDetail.actionsTakens[vm.journalistsAppointment.applicationDetail.actionsTakens.length - 1].note != "") {
                        vm.employeeNote = vm.journalistsAppointment.applicationDetail.actionsTakens[vm.journalistsAppointment.applicationDetail.actionsTakens.length - 1].note;
                        vm.employeeNoteDate = moment(vm.journalistsAppointment.applicationDetail.actionsTakens[vm.journalistsAppointment.applicationDetail.actionsTakens.length - 1].actionDate).format("dddd, MMMM Do YYYY, h:mm:ss a");
                    }
                }
            }
        };

        //New Form Condition
        if ($state.params === undefined || $state.params.id === undefined || $state.params.id === "") {
            // New Permit
            vm.editMode = false;
            vm.journalistsAppointment = {};
            vm.journalistsAppointment.applicationDetail = {
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
                    serviceId: 4
                }
            };
            vm.journalistsAppointment.person = {};

            if (vm.user.userTypeCode != '01') {
                $http.get($rootScope.app.httpSource + 'api/Establishment/GetById?id=' + $state.params.establishmentId)
                    .then(function (response) {
                        vm.journalistsAppointment.applicationDetail.application.establishment = response.data;
                    });
            }

            vm.Init();
        }
        else {
            //Get the details of the submitted Form to edit
            vm.editMode = true;
            $http.get($rootScope.app.httpSource + 'api/Journalist/GetById?id=' + $state.params.id)
                .then(function (response) {
                    vm.editMode = true;
                    vm.journalistsAppointment = response.data;
                    vm.Init();
                });
        }

        //Save the details to the server
        vm.save = function (applicationStatusId) {
            vm.isBusy = true;
            vm.journalistsAppointment.applicationDetail.payments[0].paymentDetails = vm.serviceFeesObj.serviceFee;

            if ($rootScope.app.isPMOHappiness) {
                switch (applicationStatusId) {
                    case 1:
                        $http.post($rootScope.app.httpSource + 'api/Journalist/SaveJournalist', vm.journalistsAppointment)
                            .then(function (response) {
                                if (response.data == "false") {
                                    vm.EmritIdRepeated = true;
                                }
                                else {
                                    vm.EmritIdRepeated = false;
                                    vm.happinessMeterObj.transactionId = response.data;
                                    vm.showHappinessMeter = true;
                                }
                            },
                                function (response) { // optional
                                    vm.isBusy = false;
                            });

                        break;

                    case 2:
                        $http.post($rootScope.app.httpSource + 'api/Journalist/SubmitJournalist', vm.journalistsAppointment)
                            .then(function (response) {
                                if (response.data == "false") {
                                    vm.EmritIdRepeated = true;
                                    vm.isBusy = false;
                                }
                                else {
                                    vm.happinessMeterObj.transactionId = response.data;
                                    vm.EmritIdRepeated = false;
                                    vm.showHappinessMeter = true;
                                }
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
                    vm.journalistsAppointment.applicationDetail.happinessRate = happinessRate;
                    //Post to save
                    switch (applicationStatusId) {
                        case 1:
                            $http.post($rootScope.app.httpSource + 'api/Journalist/SaveJournalist', vm.journalistsAppointment)
                                .then(function (response) {
                                    if (response.data == "false") {
                                        vm.EmritIdRepeated = true;
                                    }
                                    else {
                                        vm.EmritIdRepeated = false;
                                        $state.go('app.dashboard');
                                    }
                                },
                                    function (response) { // optional
                                        vm.isBusy = false;
                                    });
                            break;

                        case 2:
                            $http.post($rootScope.app.httpSource + 'api/Journalist/SubmitJournalist', vm.journalistsAppointment)
                                .then(function (response) {
                                    if (response.data == "false") {
                                        vm.EmritIdRepeated = true;
                                        vm.isBusy = false;
                                    }
                                    else {
                                        vm.EmritIdRepeated = false
                                        $state.go('app.dashboard')
                                    }
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

                case 1:
                    $http.post($rootScope.app.httpSource + 'api/Journalist/UpdateJournalist', vm.journalistsAppointment)
                        .then(function (response) {
                            $state.go('app.dashboard');
                        },
                            function (response) { // optional
                                vm.isBusy = false;
                            });
                    break;

                case 2:
                    $http.post($rootScope.app.httpSource + 'api/Journalist/SubmitUpdateJournalist', vm.journalistsAppointment)
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

    JournalistsAppointmentController.$inject = ['$rootScope', '$scope', '$http', '$stateParams', '$state', '$window', '$uibModal', 'UserProfile', 'SweetAlert', 'browser'];
})();