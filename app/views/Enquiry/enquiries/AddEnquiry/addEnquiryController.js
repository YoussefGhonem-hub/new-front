
(function () {
    'use strict';

    angular
        .module('eServices')
        .controller('AddEnquiryController', AddEnquiryController);
    /* @ngInject */

    AddEnquiryController.$inject = ['$rootScope', '$scope', '$http', '$uibModalInstance', '$uibModal', '$filter', 'enquiry', 'userType','SweetAlert']; 

    function AddEnquiryController($rootScope, $scope, $http, $uibModalInstance, $uibModal, $filter, enquiry, userType, SweetAlert) { 
        $scope.userType = userType;
        $scope.uploadAttachmentUrl = 'api/Upload/UploadFile?uploadFile=EnquiryAttachmentsPath';
        if (enquiry == null) {
            $scope.enquiry = {};
            $scope.enquiry.id = 0;
        }
        else {
            $scope.enquiry = enquiry;
        }

        //To get Source Types
        $http.get($rootScope.app.httpSource + 'api/EnquiryType')
            .then(function (response) {
                $scope.enquiryTypes = response.data;
            }, function (response) { });

        $http.get($rootScope.app.httpSource + 'api/EnquirySource')
            .then(function (response) {
                $scope.enquirySources = response.data;

                if ($scope.userType != "06") {
                    var enquirySource = {};
                    enquirySource.id = 5;
                    $scope.enquiry.enquirySource = enquirySource;
                }
            }, function (response) { });

        $http.get($rootScope.app.httpSource + 'api/Service')
            .then(function (response) {
                $scope.services = response.data;
            }, function (response) { });

        $scope.enquiry.hasApplicationNumber = true;

        $scope.preventLeadingZero = function () {
            if (($scope.enquiry.phoneNumber == undefined || $scope.enquiry.phoneNumber.length == 0) && event.which == 48) {
                event.preventDefault();
            }
        }

        $scope.validMobileNumber = function () {
            $scope.validMobile = true;
        };

        $scope.invalidMobileNumber = function () {
            $scope.validMobile = false;
        };

        $scope.ok = function () {
            $uibModalInstance.close($scope.enquiry);
        };

        $scope.closeModal = function () {
            $uibModalInstance.dismiss('cancel');
        };  
    }
})();