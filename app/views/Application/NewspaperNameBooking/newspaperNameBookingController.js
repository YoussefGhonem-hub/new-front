/**=========================================================
 * Module: LoginController.js
 * Controller for the Chat APP 
 =========================================================*/

(function () {
    'use strict';

    angular
        .module('eServices')
        .controller('NewspaperNameBookingController', NewspaperNameBookingController);

    function NewspaperNameBookingController($rootScope, $scope, $http, $stateParams, $state, UserProfile, $uibModal, $filter, DTOptionsBuilder, DTColumnBuilder, $compile, SweetAlert, browser) {
        var vm = this;
        vm.user = UserProfile.getProfile();
        vm.serviceFeesObj = { serviceId: 5, serviceFee: [] };

        vm.Init = function () {
            vm.terms = {};
            vm.happinessMeterObj = {};
            vm.happinessMeterObj.serviceId = 5;
        };

        //New Form Condition
        if ($state.params === undefined || $state.params.id === undefined || $state.params.id === "") {
            // New Permit
            vm.editMode = false;
            vm.bookingNewspaperName = {
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
                    application: {}
                }
            };

            if (vm.user.userTypeCode != '01') {
                $http.get($rootScope.app.httpSource + 'api/Establishment/GetById?id=' + $state.params.establishmentId)
                    .then(function (response) {
                        vm.bookingNewspaperName.applicationDetail.application.establishment = response.data;
                    });
            }

            vm.Init();
        }
        else {
            //Get the details of the submitted Form to edit
            $http.get($rootScope.app.httpSource + 'api/BookingNewspaperName/GetById?id=' + $state.params.id)
                .then(function (response) {
                    vm.editMode = true;
                    response.data.startingDate = new Date(response.data.startingDate);
                    response.data.endingDate = new Date(response.data.endingDate);
                    vm.bookingNewspaperName = response.data;
                    vm.Init();
                });
        }

        vm.save = function (applicationStatusId) {
            vm.isBusy = true;
            vm.isExist = false;
            vm.bookingNewspaperName.applicationDetail.payments[0].paymentDetails = vm.serviceFeesObj.serviceFee;

            if ($rootScope.app.isPMOHappiness) {
                switch (applicationStatusId) {
                    case 1:
                        $http.post($rootScope.app.httpSource + 'api/BookingNewspaperName/SaveBookingNewspaperName', vm.bookingNewspaperName)
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
                                    vm.isBusy = false;
                            });

                        break;

                    case 2:
                        $http.post($rootScope.app.httpSource + 'api/BookingNewspaperName/SubmitBookingNewspaperName', vm.bookingNewspaperName)
                            .then(function (response) {
                                vm.happinessMeterObj.transactionId = response.data;
                                vm.showHappinessMeter = true;
                            },
                                function (response) { // optional
                                    vm.isBusy = false;
                                    vm.isExist = true;
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
                    vm.bookingNewspaperName.applicationDetail.happinessRate = happinessRate;
                    //Post to save
                    switch (applicationStatusId) {
                        case 1:
                            $http.post($rootScope.app.httpSource + 'api/BookingNewspaperName/SaveBookingNewspaperName', vm.bookingNewspaperName)
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
                                        vm.isBusy = false;
                                    });
                            break;

                        case 2:
                            $http.post($rootScope.app.httpSource + 'api/BookingNewspaperName/SubmitBookingNewspaperName', vm.bookingNewspaperName)
                                .then(function (response) {
                                    $state.go('app.dashboard');
                                },
                                    function (response) { // optional
                                        vm.isBusy = false;
                                        vm.isExist = true;
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
                    $http.post($rootScope.app.httpSource + 'api/BookingNewspaperName/UpdateBookingNewspaperName', vm.bookingNewspaperName)
                        .then(function (response) {
                            $state.go('app.dashboard');
                        },
                            function (response) { // optional
                                vm.isBusy = false;
                            });
                    break;

                case 2:
                    $http.post($rootScope.app.httpSource + 'api/BookingNewspaperName/SubmitUpdateBookingNewspaperName', vm.bookingNewspaperName)
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
    NewspaperNameBookingController.$inject = ['$rootScope', '$scope', '$http', '$stateParams', '$state', 'UserProfile', '$uibModal', '$filter', 'DTOptionsBuilder', 'DTColumnBuilder', '$compile', 'SweetAlert', 'browser'];

})();