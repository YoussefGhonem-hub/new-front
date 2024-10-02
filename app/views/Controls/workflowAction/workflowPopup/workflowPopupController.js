(function () {
    'use strict';

    angular
        .module('eServices')
        .controller('WorkflowPopupController', WorkflowPopupController);

    function WorkflowPopupController($rootScope, $http, $scope, $uibModalInstance, $filter, objOptions) {

        var vm = this;

        $scope.thirdPartyApprovalUrl = 'api/Upload/UploadFile?uploadFile=ThirdPartyApprovalPath';
        $scope.bankGuaranteeUrl = 'api/Upload/UploadFile?uploadFile=BankGuaranteePath';
        $scope.contentReportUrl = 'api/Upload/UploadFile?uploadFile=ContentReportPath';
        $scope.uploadAttachmentUrl = 'api/Upload/UploadFile?uploadFile=EnquiryAttachmentsPath';
        $scope.actionTakenDetail = {};
        $scope.objOptions = objOptions;

        $scope.format = 'dd-MMMM-yyyy';
        $scope.openFromCreatedOn = function ($event) {
            $scope.fromCreatedOnPopup.opened = true;
        };

        $scope.openToCreatedOn = function ($event) {
            $scope.toCreatedOnPopup.opened = true;
        };
        $scope.fromCreatedOnPopup = {
            opened: false
        };

        $scope.toCreatedOnPopup = {
            opened: false
        };

        if (objOptions.isAssigning) {
            $http.get($rootScope.app.httpSource + 'api/UserProfile/GetAllowedUsersToBeAssigned')
                .then(function (response) {
                    $scope.users = [];
                    for (var i = 0; i < response.data.length; i++) {
                        $scope.users.push(response.data[i].user);
                    }
                });
        }

        if (objOptions.isDepartmentAssigning || objOptions.isResolving) {
            $http.get($rootScope.app.httpSource + 'api/Department/')
                .then(function (response) {
                    $scope.departments = response.data;

                    if (objOptions.isResolving) {
                        $scope.problemCauses = $filter('filter')($scope.departments, { id: objOptions.departmentId })[0].problemCauses;
                    }
                });

            $http.get($rootScope.app.httpSource + 'api/Priority/')
                .then(function (response) {
                    $scope.priorities = response.data;
                });

            $http.get($rootScope.app.httpSource + 'api/EnquiryType/')
                .then(function (response) {
                    $scope.enquiryTypes = response.data;
                });
        }

        if (objOptions.isThirdParty && objOptions.isAssigning) {
            $scope.both = true;
            $scope.actionTakenDetail.externalParty = false;
        }

        $scope.closeModal = function () {
            $uibModalInstance.dismiss();
        };

        $scope.submit = function () {
            $uibModalInstance.close($scope.actionTakenDetail);
        };

        $http.get($rootScope.app.httpSource + 'api/ThirdPartyOrganization')
        .then(function (response) {
            $scope.thirdPartyOrganizations = response.data;
        });
    }

    WorkflowPopupController.$inject = ['$rootScope', '$http', '$scope', '$uibModalInstance', '$filter', 'objOptions'];
})();