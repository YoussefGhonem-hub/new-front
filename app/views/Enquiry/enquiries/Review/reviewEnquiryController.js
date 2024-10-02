/**=========================================================
 * Module: LoginController.js
 * Controller for the Chat APP 
 =========================================================*/

(function () {
    'use strict';

    angular
        .module('eServices')
        .controller('ReviewEnquiryController', ReviewEnquiryController);

    function ReviewEnquiryController($rootScope, $scope, $http, $stateParams, $state,  $window, $uibModal, UserProfile, DTOptionsBuilder, DTColumnBuilder, $filter, $compile) {
        var vm = this;
        vm.translateFilter = $filter('translate');
        vm.applicationOpen = true;

        vm.Init = function () {
            vm.user = UserProfile.getProfile();
        };

        //Get the details of the submitted Form to edit
        $http.get($rootScope.app.httpSource + 'api/Enquiry/GetById?id=' + $state.params.id)
            .then(function (response) {
                vm.enquiry = response.data;
                if (vm.enquiry.applicationDetailId == null && vm.enquiry.name == null) {
                    vm.enquiry.name = vm.enquiry.user.firstName + ' ' + vm.enquiry.user.lastName;
                    vm.enquiry.email = vm.enquiry.user.email;
                }
             vm.Init();
         });
    }

    ReviewEnquiryController.$inject = ['$rootScope', '$scope', '$http', '$stateParams', '$state',   '$window', '$uibModal', 'UserProfile', 'DTOptionsBuilder',
        'DTColumnBuilder', '$filter', '$compile'];

})();