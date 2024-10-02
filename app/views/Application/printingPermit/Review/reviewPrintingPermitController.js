/**=========================================================
 * Module: LoginController.js
 * Controller for the Chat APP 
 =========================================================*/

(function () {
    'use strict';

    angular
        .module('eServices')
        .controller('ReviewPrintingPermitController', ReviewPrintingPermitController);

    function ReviewPrintingPermitController($rootScope, $scope, $http, $stateParams, $state, $window, $uibModal, UserProfile, DTOptionsBuilder, DTColumnBuilder, $filter, $compile) {
        var vm = this;
        vm.translateFilter = $filter('translate');
        vm.dtPartnerInstance = {};
        vm.applicationOpen = true;
        vm.serviceFeesObj = { serviceId: 2, serviceFee: [] };

        vm.Init = function () {
            vm.user = UserProfile.getProfile();
        };

        vm.Buttonclick = function (data) {
            if (data != null) {
                if (data.regulateEntry != null) {
                    $state.go('app.MediaContentServices.ReviewRegulateEntryMediaMaterial', { id: data.regulateEntry.applicationDetailId });
                }
                else {
                    $state.go('app.MediaContentServices.ReviewPublicationsPrintingPermit', { id: data.applicationDetailId });
                }
            }
        };

        //Get the details of the submitted Form to edit
        $http.get($rootScope.app.httpSource + 'api/PrintingPermit/GetByPermitId?id=' + $state.params.id)
            .then(function (response) {
                vm.printingPermit = response.data;
                vm.userTypeCode = vm.printingPermit.applicationDetail.application.user.userProfiles[0].userType.code;
                vm.Init();

                if (vm.printingPermit.printingPermitId != null && vm.printingPermit.bookCollectTypeId == 1) {
                    $http.get($rootScope.app.httpSource + 'api/PrintingPermit/GetById?id=' + vm.printingPermit.printingPermitId)
                        .then(function (printPermitResponse) {
                            vm.printPermitId = printPermitResponse.data;
                            vm.applicationNumber = printPermitResponse.data.applicationDetail.application.applicationNumber;
                        })
                }
                else if (vm.printingPermit.regulateEntry != null && vm.printingPermit.bookCollectTypeId == 2) {
                    $http.get($rootScope.app.httpSource + 'api/RegulateEntry/GetById?id=' + vm.printingPermit.regulateEntry.applicationDetailId)
                        .then(function (regulatoryResponse) {
                            vm.applicationNumber = regulatoryResponse.data.applicationDetail.application.applicationNumber;
                        })
                }
            });
    }

    ReviewPrintingPermitController.$inject = ['$rootScope', '$scope', '$http', '$stateParams', '$state', '$window', '$uibModal', 'UserProfile', 'DTOptionsBuilder',
        'DTColumnBuilder', '$filter', '$compile'];

})();