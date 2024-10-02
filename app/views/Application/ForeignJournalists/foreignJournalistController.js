/**=========================================================
 * Module: LoginController.js
 * Controller for the Chat APP 
 =========================================================*/

(function () {
    'use strict';

    angular
        .module('eServices')
        .controller('ForeignJournalistController', ForeignJournalistController);

    function ForeignJournalistController($rootScope, $scope, $http, $stateParams, $state, $window, $uibModal, SweetAlert, browser) {
        var vm = this;

        vm.Init = function () {
            vm.serviceFees = { serviceId: 6, serviceFee: [] };
            vm.terms = {};         
            
            vm.today = function () {
                vm.dateOfAssignmentEndDate = new Date();
            };
            vm.clear = function () {
                vm.dateOfAssignmentEndDate = null;
            };

            vm.dateOptions = {
                formatYear: 'yy',
                maxDate: new Date(2020, 5, 22),
                minDate: new Date(1920, 5, 22),
                startingDay: 1
            };

            vm.opendateOfAssignmentPopup = function () {
                vm.dateOfAssignmentPopup.opened = true;
            };

            vm.setDate = function (year, month, day) {
                vm.dateOfAssignmentEndDate = new Date(year, month, day);
            };

            vm.format = 'dd-MMMM-yyyy';

            vm.dateOfAssignmentPopup = {
                opened: false
            };

            // Disable select days < today
            $scope.disabled = function (date, mode) {
                var today = new Date();
                return date < today;
            };

            // Edit Mode Repopulate the service Fees according to Payment Details
            var loop1 = false;
            $scope.$watch('journalists.serviceFees.serviceFee', function (newVal, oldVal) {
                if (newVal.length != 0 && vm.editMode == true && loop1 == false) {
                    vm.serviceFees.serviceFee = vm.foreignJournalists.applicationDetail.payments[0].paymentDetails;
                    vm.serviceFees.reloadTable();
                    loop1 = true;
                }
            });
        };

        //New Form Condition
        if ($state.params === undefined || $state.params.id === undefined || $state.params.id === "") {
            vm.editMode = false;
            vm.foreignJournalists = {
            };
            vm.foreignJournalists.applicationDetail = {
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
                    application:{                        
                        ServiceId: 6,
                        establishment: {}
                    }
            };

            vm.Init();

        }
        else {
            //Get the details of the submitted Form to edit
            $http.get($rootScope.app.httpSource + 'api/Journalist/GetById?id=' + $state.params.id)
             .then(function (response) {
                 vm.editMode = true;
                 response.data.applicationDetail.application.establishment.tenancyContractEndDate = new Date(response.data.applicationDetail.application.establishment.tenancyContractEndDate);
                 response.data.dateOfAssignment = new Date(response.data.dateOfAssignment);
                 vm.foreignJournalists = response.data;
                 vm.Init();
             });
        }


        //Save the details to the server

        vm.save = function (applicationStatusId) {
            vm.isBusy = true;
            vm.foreignJournalists.applicationDetail.payments[0].paymentDetails = vm.serviceFees.serviceFee;
            vm.foreignJournalists.applicationDetail.application.establishment.nameAr = vm.foreignJournalists.applicationDetail.application.establishment.nameEn;
            var modalInstance = $uibModal.open({
                templateUrl: 'app/views/Controls/happinessRating/happinessRating.html',
                controller: 'HappinessRatingController',
                size: 'lg',
                keyboard: false,
                backdrop: 'static'
            });

            modalInstance.result.then(function (happinessRate) {
                vm.foreignJournalists.applicationDetail.happinessRate = happinessRate;
                //Post to save
                switch (applicationStatusId) {
                    case 1:
                        $http.post($rootScope.app.httpSource + 'api/Journalist/SaveJournalist', vm.foreignJournalists)
                             .then(function (response) {
                                 $state.go('app.dashboard');
                             },
                             function (response) { // optional
                                 vm.isBusy = false;
                             });
                        break;

                    case 2:
                        $http.post($rootScope.app.httpSource + 'api/Journalist/SubmitJournalist', vm.foreignJournalists)
                             .then(function (response) {
                                 vm.paymentPopup(response.data);
                             },
                             function (response) { // optional
                                 vm.isBusy = false;
                             });
                        break;
                }
            });
        }

        vm.workflowClick = function (actionId) {
            vm.isBusy = true;
            switch (actionId) {

                case 29:
                    $http.post($rootScope.app.httpSource + 'api/Journalist/UpdateJournalist', vm.foreignJournalists)
                  .then(function (response) {
                      $state.go('app.dashboard');
                  },
                     function (response) { // optional
                         vm.isBusy = false;
                     });
                    break;

                case 14:
                    $http.post($rootScope.app.httpSource + 'api/Journalist/SubmitUpdateJournalist', vm.foreignJournalists)
                          .then(function (response) {
                              vm.paymentPopup(vm.foreignJournalists.applicationDetail.id);
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

    ForeignJournalistController.$inject = ['$rootScope', '$scope', '$http', '$stateParams', '$state', '$window', '$uibModal', 'SweetAlert', 'browser'];

})();