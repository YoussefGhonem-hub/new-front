/**=========================================================
 * Module: workflowAction
 =========================================================*/

(function () {
    'use strict';

    angular
        .module('eServices')
        .directive('workflowAction', workflowAction)


    workflowAction.$inject = ['$rootScope', '$http', '$filter', '$window', '$stateParams', '$state', '$uibModal', '$compile', 'SweetAlert', 'UserProfile']
    function workflowAction($rootScope, $http, $filter, $window, $stateParams, $state, $uibModal, $compile, SweetAlert, UserProfile) {
        return {
            restrict: 'E',
            scope: {
                workFlowApplication: "=ngModel",
                dtapplicationinstance: '=',
                application: '=',
                isDefault: '=',
                report: '=?',
                isEnquiryReview: '=?'
            },
            templateUrl: '/app/views/Controls/workflowAction/workflowAction.html',
            link: link
        };

        function link(scope, element, attrs) {

            var unwatch = scope.$watch('workFlowApplication', function (newVal, oldVal) {
                if (newVal) {
                    init();
                    // remove the watcher
                    unwatch();
                }
            });

            function init() {
                scope.isBusy = false;
                scope.user = UserProfile.getProfile();
                scope.translateFilter = $filter('translate');
                scope.isVisit = false;
                scope.isEnquiry = false;

                if (scope.workFlowApplication.hasOwnProperty('visitStatusId')) {
                    scope.isVisit = true;
                }

                if (scope.workFlowApplication.hasOwnProperty('enquiryNumber')) {
                    scope.isEnquiry = true;
                }






                //Quiq temp fix -- Strat
                try {
                    var VerifyPaymentStatus = $filter('filter')(scope.workFlowApplication.applicationState.transitions,
                        function (obj) { return (obj.actionId === 27 || obj.actionId === 28 || obj.actionId === 42 || obj.actionId === 56); });

                    if (VerifyPaymentStatus.length > 0) {
                        var withoutPayaction = $filter('filter')(scope.workFlowApplication.applicationState.transitions,
                            function (obj) {
                                return (obj.actionId !== 15 && obj.actionId !== 31 && obj.actionId !== 38 && obj.actionId !== 54);
                            });
                        scope.workFlowApplication.applicationState.transitions = withoutPayaction;
                    }
                }
                catch (err) {
                }
                //Quiq temp fix -- End




                scope.workflowClick = function (applicationDetailId, actionId) {

                    switch (actionId) {
                        case 2: case 13: case 14:
                            SweetAlert.swal({
                                title: scope.translateFilter('workflow.areyousure'),
                                text: scope.translateFilter('workflow.yourapplicationwillbesubmittedforreview'),
                                type: "warning",
                                showCancelButton: true,
                                confirmButtonColor: "#DD6B55",
                                confirmButtonText: scope.translateFilter('workflow.yessubmitit'),
                                cancelButtonText: scope.translateFilter('workflow.nocancelpls'),
                                closeOnConfirm: false,
                                closeOnCancel: false
                            }, function (isConfirm) {
                                if (isConfirm) {
                                    $http.post($rootScope.app.httpSource + 'api/Application/SubmitApplication', scope.workFlowApplication)
                                        .then(function (response) {
                                            scope.isBusy = false;
                                            SweetAlert.swal(scope.translateFilter('workflow.submittted'), scope.translateFilter('workflow.submitmsg'), "success");
                                            scope.dtapplicationinstance.rerender();
                                        },
                                            function (response) { // optional
                                                scope.isBusy = false;
                                            });
                                } else {
                                    SweetAlert.swal(scope.translateFilter('workflow.cancelled'), scope.translateFilter('workflow.applicationNotSubmitted'), "error");
                                }
                            });
                            break;

                        // Media Content Services Actions
                        case 16:
                            var modalInstance = $uibModal.open({
                                templateUrl: 'app/views/Controls/workflowAction/workflowPopup/workflowPopup.html',
                                controller: 'WorkflowPopupController',
                                size: 'md',
                                keyboard: true,
                                backdrop: 'static',
                                resolve: {
                                    objOptions: function () {
                                        var options = {};
                                        options.modalTitle = scope.translateFilter('workflow.submitMaterial');
                                        options.isThirdParty = false;
                                        options.isAssigning = false;
                                        options.isConditionalApproval = false;
                                        options.isMagazine = false;
                                        options.isDepartmentAssigning = false;
                                        options.isResolving = false;
                                        return options;
                                    }
                                }
                            });
                            modalInstance.result.then(function (actionTakenDetail) {
                                var actionTaken = {
                                    applicationDetailId: applicationDetailId,
                                    note: actionTakenDetail.notes,
                                    attachmentUrl: actionTakenDetail.attachmentUrl,
                                    thirdPartyOrganization: actionTakenDetail.thirdPartyOrganization
                                };

                                $http.post($rootScope.app.httpSource + 'api/Application/SubmitMaterial', actionTaken)
                                    .then(function (response) {
                                        scope.isBusy = false;
                                        SweetAlert.swal(scope.translateFilter('general.ok'), scope.translateFilter('workflow.materialSubmittedSuccessfully'), "success");
                                        scope.dtapplicationinstance.rerender();
                                    },
                                        function (response) {
                                            if (response.data.exceptionMessage === "ApplicationCheckedOutException") {
                                                SweetAlert.swal(scope.translateFilter('general.ok'), scope.translateFilter('general.applicationCheckedOut'), "error");
                                            }
                                            scope.isBusy = false;
                                        });
                            });
                            break;

                        case 17:
                            var modalInstance = $uibModal.open({
                                templateUrl: 'app/views/Controls/workflowAction/workflowPopup/workflowPopup.html',
                                controller: 'WorkflowPopupController',
                                size: 'md',
                                keyboard: true,
                                backdrop: 'static',
                                resolve: {
                                    objOptions: function () {
                                        var options = {};
                                        options.modalTitle = scope.translateFilter('workflow.approveActionTitle');
                                        options.isThirdParty = false;
                                        options.isAssigning = false;
                                        options.isConditionalApproval = false;
                                        options.isMagazine = false;
                                        options.isDepartmentAssigning = false;
                                        options.isResolving = false;
                                        options.isCloudLinkAttached = (scope.application.serviceId == 2 && scope.application.applicationDetails[0].printingPermits[0].materialUrl != null ? (scope.application.applicationDetails[0].printingPermits[0].materialUrl.includes('http') || scope.application.applicationDetails[0].printingPermits[0].materialUrl.split('.')[0] == 'www') ? true : false : false);
                                        options.isPrintPermitService = (scope.application.serviceId == 2 ? true : false);
                                        return options;
                                    }
                                }
                            });
                            modalInstance.result.then(function (actionTakenDetail) {
                                var actionTaken = {
                                    applicationDetailId: applicationDetailId,
                                    note: actionTakenDetail.notes,
                                    attachmentUrl: actionTakenDetail.attachmentUrl,
                                    thirdPartyOrganization: actionTakenDetail.thirdPartyOrganization
                                };

                                $http.post($rootScope.app.httpSource + 'api/Application/ApproveMCApplicationData', actionTaken)
                                    .then(function (response) {
                                        scope.isBusy = false;
                                        SweetAlert.swal(scope.translateFilter('general.ok'), scope.translateFilter('workflow.applicationApprovedSuccessfully'), "success");
                                        scope.dtapplicationinstance.rerender();
                                    },
                                        function (response) {
                                            if (response.data.exceptionMessage === "ApplicationCheckedOutException") {
                                                SweetAlert.swal(scope.translateFilter('general.ok'), scope.translateFilter('general.applicationCheckedOut'), "error");
                                            }
                                            scope.isBusy = false;
                                        });
                            });
                            break;

                        case 30:
                            var modalInstance = $uibModal.open({
                                templateUrl: 'app/views/Controls/workflowAction/workflowPopup/workflowPopup.html',
                                controller: 'WorkflowPopupController',
                                size: 'md',
                                keyboard: true,
                                backdrop: 'static',
                                resolve: {
                                    objOptions: function () {
                                        var options = {};
                                        options.modalTitle = scope.translateFilter('workflow.approveActionTitle');
                                        options.isThirdParty = false;
                                        options.isAssigning = false;
                                        options.isConditionalApproval = false;
                                        options.isMagazine = false;
                                        options.isDepartmentAssigning = false;
                                        options.isResolving = false;
                                        return options;
                                    }
                                }
                            });
                            modalInstance.result.then(function (actionTakenDetail) {
                                var actionTaken = {
                                    applicationDetailId: applicationDetailId,
                                    note: actionTakenDetail.notes,
                                    attachmentUrl: actionTakenDetail.attachmentUrl,
                                    thirdPartyOrganization: actionTakenDetail.thirdPartyOrganization
                                };

                                $http.post($rootScope.app.httpSource + 'api/Application/ApproveFMApplicationData', actionTaken)
                                    .then(function (response) {
                                        scope.isBusy = false;
                                        SweetAlert.swal(scope.translateFilter('general.ok'), scope.translateFilter('workflow.applicationApprovedSuccessfully'), "success");
                                        scope.dtapplicationinstance.rerender();
                                    },
                                        function (response) {
                                            if (response.data.exceptionMessage === "ApplicationCheckedOutException") {
                                                SweetAlert.swal(scope.translateFilter('general.ok'), scope.translateFilter('general.applicationCheckedOut'), "error");
                                            }
                                            scope.isBusy = false;
                                        });
                            });
                            break;

                        case 32:
                            var modalInstance = $uibModal.open({
                                templateUrl: 'app/views/Controls/workflowAction/workflowPopup/workflowPopup.html',
                                controller: 'WorkflowPopupController',
                                size: 'md',
                                keyboard: true,
                                backdrop: 'static',
                                resolve: {
                                    objOptions: function () {
                                        var options = {};
                                        options.modalTitle = scope.translateFilter('workflow.sendBackToCustomerActionTitle');
                                        options.isThirdParty = false;
                                        options.isAssigning = false;
                                        options.isConditionalApproval = false;
                                        options.isMagazine = false;
                                        options.isDepartmentAssigning = false;
                                        options.isResolving = false;
                                        return options;
                                    }
                                }
                            });
                            modalInstance.result.then(function (actionTakenDetail) {
                                var actionTaken = {
                                    applicationDetailId: applicationDetailId,
                                    note: actionTakenDetail.notes,
                                    attachmentUrl: actionTakenDetail.attachmentUrl,
                                    thirdPartyOrganization: actionTakenDetail.thirdPartyOrganization
                                };

                                $http.post($rootScope.app.httpSource + 'api/Application/SendFMApplicationToCustomer', actionTaken)
                                    .then(function (response) {
                                        scope.isBusy = false;
                                        SweetAlert.swal(scope.translateFilter('general.ok'), scope.translateFilter('workflow.sentBackToCustomersuccesfully'), "success");
                                        scope.dtapplicationinstance.rerender();
                                    },
                                        function (response) {
                                            if (response.data.exceptionMessage === "ApplicationCheckedOutException") {
                                                SweetAlert.swal(scope.translateFilter('general.ok'), scope.translateFilter('general.applicationCheckedOut'), "error");
                                            }
                                            scope.isBusy = false;
                                        });
                            });
                            break;

                        case 18:
                            var modalInstance = $uibModal.open({
                                templateUrl: 'app/views/Controls/workflowAction/workflowPopup/workflowPopup.html',
                                controller: 'WorkflowPopupController',
                                size: 'md',
                                keyboard: true,
                                backdrop: 'static',
                                resolve: {
                                    objOptions: function () {
                                        var options = {};
                                        options.modalTitle = scope.translateFilter('workflow.sendBackToCustomerActionTitle');
                                        options.isThirdParty = false;
                                        options.isAssigning = false;
                                        options.isConditionalApproval = false;
                                        options.isMagazine = false;
                                        options.isDepartmentAssigning = false;
                                        options.isResolving = false;
                                        return options;
                                    }
                                }
                            });
                            modalInstance.result.then(function (actionTakenDetail) {
                                var actionTaken = {
                                    applicationDetailId: applicationDetailId,
                                    note: actionTakenDetail.notes,
                                    attachmentUrl: actionTakenDetail.attachmentUrl,
                                    thirdPartyOrganization: actionTakenDetail.thirdPartyOrganization
                                };

                                $http.post($rootScope.app.httpSource + 'api/Application/SendMCApplicationToCustomer', actionTaken)
                                    .then(function (response) {
                                        scope.isBusy = false;
                                        SweetAlert.swal(scope.translateFilter('general.ok'), scope.translateFilter('workflow.sentBackToCustomersuccesfully'), "success");
                                        scope.dtapplicationinstance.rerender();
                                    },
                                        function (response) {
                                            if (response.data.exceptionMessage === "ApplicationCheckedOutException") {
                                                SweetAlert.swal(scope.translateFilter('general.ok'), scope.translateFilter('general.applicationCheckedOut'), "error");
                                            }
                                            scope.isBusy = false;
                                        });
                            });
                            break;

                        case 19:
                            var modalInstance = $uibModal.open({
                                templateUrl: 'app/views/Controls/workflowAction/workflowPopup/workflowPopup.html',
                                controller: 'WorkflowPopupController',
                                size: 'md',
                                keyboard: true,
                                backdrop: 'static',
                                resolve: {
                                    objOptions: function () {
                                        var options = {};
                                        options.modalTitle = scope.translateFilter('workflow.thirdPartyApproveApplication');
                                        options.isThirdParty = true;
                                        options.isAssigning = false;
                                        options.isConditionalApproval = false;
                                        options.isMagazine = false;
                                        options.isDepartmentAssigning = false;
                                        options.isResolving = false;
                                        return options;
                                    }
                                }
                            });
                            modalInstance.result.then(function (actionTakenDetail) {
                                var actionTaken = {
                                    applicationDetailId: applicationDetailId,
                                    note: actionTakenDetail.notes,
                                    attachmentUrl: actionTakenDetail.attachmentUrl,
                                    thirdPartyOrganization: actionTakenDetail.thirdPartyOrganization
                                };

                                $http.post($rootScope.app.httpSource + 'api/Application/ThirdPartyApproveMCApplication', actionTaken)
                                    .then(function (response) {
                                        scope.isBusy = false;
                                        SweetAlert.swal(scope.translateFilter('general.ok'), scope.translateFilter('workflow.thirdPartyApprovedsuccesfully'), "success");
                                        scope.dtapplicationinstance.rerender();
                                    },
                                        function (response) {
                                            if (response.data.exceptionMessage === "ApplicationCheckedOutException") {
                                                SweetAlert.swal(scope.translateFilter('general.ok'), scope.translateFilter('general.applicationCheckedOut'), "error");
                                            }
                                            scope.isBusy = false;
                                        });
                            });
                            break;

                        case 20:
                            var modalInstance = $uibModal.open({
                                templateUrl: 'app/views/Controls/workflowAction/workflowPopup/workflowPopup.html',
                                controller: 'WorkflowPopupController',
                                size: 'md',
                                keyboard: true,
                                backdrop: 'static',
                                resolve: {
                                    objOptions: function () {
                                        var options = {};
                                        options.modalTitle = scope.translateFilter('workflow.thirdPartyRejectApplication');
                                        options.isThirdParty = true;
                                        options.isAssigning = false;
                                        options.isConditionalApproval = false;
                                        options.isMagazine = false;
                                        options.isDepartmentAssigning = false;
                                        options.isResolving = false;
                                        return options;
                                    }
                                }
                            });
                            modalInstance.result.then(function (actionTakenDetail) {
                                var actionTaken = {
                                    applicationDetailId: applicationDetailId,
                                    note: actionTakenDetail.notes,
                                    attachmentUrl: actionTakenDetail.attachmentUrl,
                                    thirdPartyOrganization: actionTakenDetail.thirdPartyOrganization
                                };

                                $http.post($rootScope.app.httpSource + 'api/Application/ThirdPartyRejectMCApplication', actionTaken)
                                    .then(function (response) {
                                        scope.isBusy = false;
                                        SweetAlert.swal(scope.translateFilter('general.ok'), scope.translateFilter('workflow.thirdPartyRejectedsuccesfully'), "success");
                                        scope.dtapplicationinstance.rerender();
                                    },
                                        function (response) {
                                            if (response.data.exceptionMessage === "ApplicationCheckedOutException") {
                                                SweetAlert.swal(scope.translateFilter('general.ok'), scope.translateFilter('general.applicationCheckedOut'), "error");
                                            }
                                            scope.isBusy = false;
                                        });
                            });
                            break;

                        case 21:
                            if (scope.report) {
                                if (scope.report.notes == undefined || scope.report.notes == '') {
                                    alert('Please fill required field');
                                    return;
                                }
                                var actionTaken = {
                                    applicationDetailId: applicationDetailId,
                                    report: scope.report
                                };
                                for (var i = 0; i < actionTaken.report.reportActions.length; i++) {
                                    if (actionTaken.report.reportActions[i].sceneTime)
                                        actionTaken.report.reportActions[i].sceneTime = actionTaken.report.reportActions[i].sceneTime.format("HH:mm:ss");
                                }

                                $http.post($rootScope.app.httpSource + 'api/Application/MediaMaterialApproveMCApplication', actionTaken)
                                    .then(function (respo) {

                                        $http.get($rootScope.app.httpSource + 'api/Application/ReCreateReport?id=' + respo.data.id)
                                            .then(function (response) {
                                                scope.isBusy = false;
                                                SweetAlert.swal(scope.translateFilter('general.ok'), scope.translateFilter('workflow.mediaMaterialApprovedSuccessfully'), "success");
                                                $state.go('app.dashboard');
                                            },
                                                function (response) {
                                                    scope.isBusy = false;
                                                });
                                    },
                                        function (response) {
                                            if (response.data.exceptionMessage === "ApplicationCheckedOutException") {
                                                SweetAlert.swal(scope.translateFilter('general.ok'), scope.translateFilter('general.applicationCheckedOut'), "error");
                                            }
                                            scope.isBusy = false;
                                        });
                            }
                            else {
                                $state.go('app.MediaContentServices.MediaMaterialApproval', { applicationDetailId: scope.workFlowApplication.id }, { reload: true });
                            }

                            break;
                        case 22:
                            if (scope.report) {
                                if (scope.report.notes == undefined || scope.report.notes == '') {
                                    alert('Please fill required field');
                                    return;
                                }
                                var actionTaken = {
                                    applicationDetailId: applicationDetailId,
                                    report: scope.report
                                };
                                for (var i = 0; i < actionTaken.report.reportActions.length; i++) {
                                    actionTaken.report.reportActions[i].sceneTime = actionTaken.report.reportActions[i].sceneTime.format("HH:mm:ss");
                                }

                                $http.post($rootScope.app.httpSource + 'api/Application/MediaMaterialRejectMCApplication', actionTaken)
                                    .then(function (respo) {
                                        $http.get($rootScope.app.httpSource + 'api/Application/ReCreateReport?id=' + respo.data.id)
                                            .then(function (response) {
                                                scope.isBusy = false;
                                                SweetAlert.swal(scope.translateFilter('general.ok'), scope.translateFilter('workflow.mediaMaterialRejectedSuccessfully'), "success");
                                                $state.go('app.dashboard');
                                            },
                                                function (response) {
                                                    scope.isBusy = false;
                                                });
                                    },
                                        function (response) {
                                            if (response.data.exceptionMessage === "ApplicationCheckedOutException") {
                                                SweetAlert.swal(scope.translateFilter('general.ok'), scope.translateFilter('general.applicationCheckedOut'), "error");
                                            }
                                            scope.isBusy = false;
                                        });
                            }
                            else {
                                $state.go('app.MediaContentServices.MediaMaterialApproval', { applicationDetailId: scope.workFlowApplication.id }, { reload: true });
                            }

                            break;

                        case 23:
                            var modalInstance = $uibModal.open({
                                templateUrl: 'app/views/Controls/workflowAction/workflowPopup/workflowPopup.html',
                                controller: 'WorkflowPopupController',
                                size: 'md',
                                keyboard: true,
                                backdrop: 'static',
                                resolve: {
                                    objOptions: function () {
                                        var options = {};
                                        options.modalTitle = scope.translateFilter('workflow.managerRejectApplication');
                                        options.isThirdParty = false;
                                        options.isAssigning = false;
                                        options.isConditionalApproval = false;
                                        options.isMagazine = false;
                                        options.isDepartmentAssigning = false;
                                        options.isResolving = false;
                                        return options;
                                    }
                                }
                            });
                            modalInstance.result.then(function (actionTakenDetail) {
                                var actionTaken = {
                                    applicationDetailId: applicationDetailId,
                                    note: actionTakenDetail.notes,
                                    attachmentUrl: actionTakenDetail.attachmentUrl,
                                    thirdPartyOrganization: actionTakenDetail.thirdPartyOrganization
                                };

                                $http.post($rootScope.app.httpSource + 'api/Application/ManagerRejectMCApplication', actionTaken)
                                    .then(function (response) {
                                        scope.isBusy = false;
                                        SweetAlert.swal(scope.translateFilter('general.ok'), scope.translateFilter('workflow.managerRejectedSuccessfully'), "success");
                                        scope.dtapplicationinstance.rerender();
                                    },
                                        function (response) {
                                            if (response.data.exceptionMessage === "ApplicationCheckedOutException") {
                                                SweetAlert.swal(scope.translateFilter('general.ok'), scope.translateFilter('general.applicationCheckedOut'), "error");
                                            }
                                            scope.isBusy = false;
                                        });
                            });
                            break;

                        case 24:
                            var modalInstance = $uibModal.open({
                                templateUrl: 'app/views/Controls/workflowAction/workflowPopup/workflowPopup.html',
                                controller: 'WorkflowPopupController',
                                size: 'md',
                                keyboard: true,
                                backdrop: 'static',
                                resolve: {
                                    objOptions: function () {
                                        var options = {};
                                        options.modalTitle = scope.translateFilter('workflow.approveActionTitle');
                                        options.isThirdParty = false;
                                        options.isAssigning = false;
                                        options.isConditionalApproval = false;
                                        options.isMagazine = false;
                                        options.isDepartmentAssigning = false;
                                        options.isResolving = false;
                                        return options;
                                    }
                                }
                            });
                            modalInstance.result.then(function (actionTakenDetail) {
                                var actionTaken = {
                                    applicationDetailId: applicationDetailId,
                                    note: actionTakenDetail.notes,
                                    attachmentUrl: actionTakenDetail.attachmentUrl,
                                    thirdPartyOrganization: actionTakenDetail.thirdPartyOrganization
                                };

                                $http.post($rootScope.app.httpSource + 'api/Application/ManagerApproveMCApplication', actionTaken)
                                    .then(function (response) {
                                        scope.isBusy = false;
                                        SweetAlert.swal(scope.translateFilter('general.ok'), scope.translateFilter('workflow.applicationApprovedSuccessfully'), "success");
                                        scope.dtapplicationinstance.rerender();
                                    },
                                        function (response) {
                                            if (response.data.exceptionMessage === "ApplicationCheckedOutException") {
                                                SweetAlert.swal(scope.translateFilter('general.ok'), scope.translateFilter('general.applicationCheckedOut'), "error");
                                            }
                                            scope.isBusy = false;
                                        });
                            });
                            break;

                        case 26:
                            var modalInstance = $uibModal.open({
                                templateUrl: 'app/views/Controls/workflowAction/workflowPopup/workflowPopup.html',
                                controller: 'WorkflowPopupController',
                                size: 'md',
                                keyboard: true,
                                backdrop: 'static',
                                resolve: {
                                    objOptions: function () {
                                        var options = {};
                                        options.modalTitle = scope.translateFilter('workflow.sendBackToEmployeeReviewTitle');
                                        options.isThirdParty = false;
                                        options.isAssigning = false;
                                        options.isConditionalApproval = false;
                                        options.isMagazine = false;
                                        options.isDepartmentAssigning = false;
                                        options.isResolving = false;
                                        return options;
                                    }
                                }
                            });
                            modalInstance.result.then(function (actionTakenDetail) {
                                var actionTaken = {
                                    applicationDetailId: applicationDetailId,
                                    note: actionTakenDetail.notes,
                                    attachmentUrl: actionTakenDetail.attachmentUrl,
                                    thirdPartyOrganization: actionTakenDetail.thirdPartyOrganization
                                };

                                $http.post($rootScope.app.httpSource + 'api/Application/SendBackToEmployeeReviewMC', actionTaken)
                                    .then(function (response) {
                                        scope.isBusy = false;
                                        SweetAlert.swal(scope.translateFilter('general.ok'), scope.translateFilter('workflow.sentBackToEmployeeReviewsuccesfully'), "success");
                                        scope.dtapplicationinstance.rerender();
                                    },
                                        function (response) {
                                            if (response.data.exceptionMessage === "ApplicationCheckedOutException") {
                                                SweetAlert.swal(scope.translateFilter('general.ok'), scope.translateFilter('general.applicationCheckedOut'), "error");
                                            }
                                            scope.isBusy = false;
                                        });
                            });
                            break;

                        case 47:
                            var modalInstance = $uibModal.open({
                                templateUrl: 'app/views/Controls/workflowAction/workflowPopup/workflowPopup.html',
                                controller: 'WorkflowPopupController',
                                size: 'md',
                                keyboard: true,
                                backdrop: 'static',
                                resolve: {
                                    objOptions: function () {
                                        var options = {};
                                        options.modalTitle = scope.translateFilter('workflow.sendBackToEmployeeReviewTitle');
                                        options.isThirdParty = false;
                                        options.isAssigning = false;
                                        options.isConditionalApproval = false;
                                        options.isMagazine = false;
                                        options.isDepartmentAssigning = false;
                                        options.isResolving = false;
                                        return options;
                                    }
                                }
                            });
                            modalInstance.result.then(function (actionTakenDetail) {
                                var actionTaken = {
                                    applicationDetailId: applicationDetailId,
                                    note: actionTakenDetail.notes,
                                    attachmentUrl: actionTakenDetail.attachmentUrl,
                                    thirdPartyOrganization: actionTakenDetail.thirdPartyOrganization
                                };

                                $http.post($rootScope.app.httpSource + 'api/Application/SendBackToSupervisorReviewMC', actionTaken)
                                    .then(function (response) {
                                        scope.isBusy = false;
                                        SweetAlert.swal(scope.translateFilter('general.ok'), scope.translateFilter('workflow.sentBackToEmployeeReviewsuccesfully'), "success");
                                        scope.dtapplicationinstance.rerender();
                                    },
                                        function (response) {
                                            if (response.data.exceptionMessage === "ApplicationCheckedOutException") {
                                                SweetAlert.swal(scope.translateFilter('general.ok'), scope.translateFilter('general.applicationCheckedOut'), "error");
                                            }
                                            scope.isBusy = false;
                                        });
                            });
                            break;

                        // Media License Services Actions 
                        case 5:
                            var modalInstance = $uibModal.open({
                                templateUrl: 'app/views/Controls/workflowAction/workflowPopup/workflowPopup.html',
                                controller: 'WorkflowPopupController',
                                size: 'md',
                                keyboard: true,
                                backdrop: 'static',
                                resolve: {
                                    objOptions: function () {
                                        var options = {};
                                        options.modalTitle = scope.translateFilter('workflow.approveActionTitle');
                                        options.isThirdParty = false;
                                        options.isAssigning = false;
                                        options.isConditionalApproval = (scope.workFlowApplication.applicationTypeId == 2 ? true : false);
                                        options.isMagazine = false;
                                        options.isDepartmentAssigning = false;
                                        options.isResolving = false;
                                        return options;
                                    }
                                }
                            });
                            modalInstance.result.then(function (actionTakenDetail) {
                                var actionTaken = {
                                    applicationDetailId: applicationDetailId,
                                    note: actionTakenDetail.notes,
                                    attachmentUrl: actionTakenDetail.attachmentUrl,
                                    thirdPartyOrganization: actionTakenDetail.thirdPartyOrganization,
                                    isConditionallyApproved: actionTakenDetail.isConditionallyApproved
                                };

                                $http.post($rootScope.app.httpSource + 'api/Application/ApproveMLApplicationData', actionTaken)
                                    .then(function (response) {
                                        scope.isBusy = false;
                                        SweetAlert.swal(scope.translateFilter('general.ok'), scope.translateFilter('workflow.applicationApprovedSuccessfully'), "success");
                                        scope.dtapplicationinstance.rerender();
                                    },
                                        function (response) {
                                            if (response.data.exceptionMessage === "ApplicationCheckedOutException") {
                                                SweetAlert.swal(scope.translateFilter('general.ok'), scope.translateFilter('general.applicationCheckedOut'), "error");
                                            }
                                            scope.isBusy = false;
                                        });
                            });
                            break;

                        case 6:
                            var modalInstance = $uibModal.open({
                                templateUrl: 'app/views/Controls/workflowAction/workflowPopup/workflowPopup.html',
                                controller: 'WorkflowPopupController',
                                size: 'md',
                                keyboard: true,
                                backdrop: 'static',
                                resolve: {
                                    objOptions: function () {
                                        var options = {};
                                        options.modalTitle = scope.translateFilter('workflow.sendBackToCustomerActionTitle');
                                        options.isThirdParty = false;
                                        options.isAssigning = false;
                                        options.isConditionalApproval = false;
                                        options.isMagazine = false;
                                        options.isDepartmentAssigning = false;
                                        options.isResolving = false;
                                        return options;
                                    }
                                }
                            });
                            modalInstance.result.then(function (actionTakenDetail) {
                                var actionTaken = {
                                    applicationDetailId: applicationDetailId,
                                    note: actionTakenDetail.notes,
                                    attachmentUrl: actionTakenDetail.attachmentUrl,
                                    thirdPartyOrganization: actionTakenDetail.thirdPartyOrganization
                                };

                                $http.post($rootScope.app.httpSource + 'api/Application/SendMLApplicationToCustomer', actionTaken)
                                    .then(function (response) {
                                        scope.isBusy = false;
                                        SweetAlert.swal(scope.translateFilter('general.ok'), scope.translateFilter('workflow.sentBackToCustomersuccesfully'), "success");
                                        scope.dtapplicationinstance.rerender();
                                    },
                                        function (response) {
                                            if (response.data.exceptionMessage === "ApplicationCheckedOutException") {
                                                SweetAlert.swal(scope.translateFilter('general.ok'), scope.translateFilter('general.applicationCheckedOut'), "error");
                                            }
                                            scope.isBusy = false;
                                        });
                            });
                            break;

                        case 7:
                            var modalInstance = $uibModal.open({
                                templateUrl: 'app/views/Controls/workflowAction/workflowPopup/workflowPopup.html',
                                controller: 'WorkflowPopupController',
                                size: 'md',
                                keyboard: true,
                                backdrop: 'static',
                                resolve: {
                                    objOptions: function () {
                                        var options = {};
                                        options.modalTitle = scope.translateFilter('workflow.thirdPartyApproveApplication');
                                        options.isThirdParty = true;
                                        options.isAssigning = false;
                                        options.isConditionalApproval = false;
                                        options.isMagazine = false;
                                        options.isDepartmentAssigning = false;
                                        options.isResolving = false;
                                        return options;
                                    }
                                }
                            });
                            modalInstance.result.then(function (actionTakenDetail) {
                                var actionTaken = {
                                    applicationDetailId: applicationDetailId,
                                    note: actionTakenDetail.notes,
                                    attachmentUrl: actionTakenDetail.attachmentUrl,
                                    thirdPartyOrganization: actionTakenDetail.thirdPartyOrganization
                                };

                                $http.post($rootScope.app.httpSource + 'api/Application/ThirdPartyApproveMLApplication', actionTaken)
                                    .then(function (response) {
                                        scope.isBusy = false;
                                        SweetAlert.swal(scope.translateFilter('general.ok'), scope.translateFilter('workflow.thirdPartyApprovedsuccesfully'), "success");
                                        scope.dtapplicationinstance.rerender();
                                    },
                                        function (response) {
                                            if (response.data.exceptionMessage === "ApplicationCheckedOutException") {
                                                SweetAlert.swal(scope.translateFilter('general.ok'), scope.translateFilter('general.applicationCheckedOut'), "error");
                                            }
                                            scope.isBusy = false;
                                        });
                            });
                            break;

                        case 8:
                            var modalInstance = $uibModal.open({
                                templateUrl: 'app/views/Controls/workflowAction/workflowPopup/workflowPopup.html',
                                controller: 'WorkflowPopupController',
                                size: 'md',
                                keyboard: true,
                                backdrop: 'static',
                                resolve: {
                                    objOptions: function () {
                                        var options = {};
                                        options.modalTitle = scope.translateFilter('workflow.thirdPartyRejectApplication');
                                        options.isThirdParty = true;
                                        options.isAssigning = false;
                                        options.isConditionalApproval = false;
                                        options.isMagazine = false;
                                        options.isDepartmentAssigning = false;
                                        options.isResolving = false;
                                        return options;
                                    }
                                }
                            });
                            modalInstance.result.then(function (actionTakenDetail) {
                                var actionTaken = {
                                    applicationDetailId: applicationDetailId,
                                    note: actionTakenDetail.notes,
                                    attachmentUrl: actionTakenDetail.attachmentUrl,
                                    thirdPartyOrganization: actionTakenDetail.thirdPartyOrganization
                                };

                                $http.post($rootScope.app.httpSource + 'api/Application/ThirdPartyRejectMLApplication', actionTaken)
                                    .then(function (response) {
                                        scope.isBusy = false;
                                        SweetAlert.swal(scope.translateFilter('general.ok'), scope.translateFilter('workflow.thirdPartyRejectedsuccesfully'), "success");
                                        scope.dtapplicationinstance.rerender();
                                    },
                                        function (response) {
                                            if (response.data.exceptionMessage === "ApplicationCheckedOutException") {
                                                SweetAlert.swal(scope.translateFilter('general.ok'), scope.translateFilter('general.applicationCheckedOut'), "error");
                                            }
                                            scope.isBusy = false;
                                        });
                            });
                            break;

                        case 9:
                            var modalInstance = $uibModal.open({
                                templateUrl: 'app/views/Controls/workflowAction/workflowPopup/workflowPopup.html',
                                controller: 'WorkflowPopupController',
                                size: 'md',
                                keyboard: true,
                                backdrop: 'static',
                                resolve: {
                                    objOptions: function () {
                                        var options = {};
                                        options.modalTitle = scope.translateFilter('workflow.managerRejectApplication');
                                        options.isThirdParty = false;
                                        options.isAssigning = false;
                                        options.isConditionalApproval = false;
                                        options.isMagazine = false;
                                        options.isDepartmentAssigning = false;
                                        options.isResolving = false;
                                        return options;
                                    }
                                }
                            });
                            modalInstance.result.then(function (actionTakenDetail) {
                                var actionTaken = {
                                    applicationDetailId: applicationDetailId,
                                    note: actionTakenDetail.notes,
                                    attachmentUrl: actionTakenDetail.attachmentUrl,
                                    thirdPartyOrganization: actionTakenDetail.thirdPartyOrganization
                                };

                                $http.post($rootScope.app.httpSource + 'api/Application/ManagerRejectMLApplication', actionTaken)
                                    .then(function (response) {
                                        scope.isBusy = false;
                                        SweetAlert.swal(scope.translateFilter('general.ok'), scope.translateFilter('workflow.managerRejectedSuccessfully'), "success");
                                        scope.dtapplicationinstance.rerender();
                                    },
                                        function (response) {
                                            if (response.data.exceptionMessage === "ApplicationCheckedOutException") {
                                                SweetAlert.swal(scope.translateFilter('general.ok'), scope.translateFilter('general.applicationCheckedOut'), "error");
                                            }
                                            scope.isBusy = false;
                                        });
                            });
                            break;

                        case 10:
                            var modalInstance = $uibModal.open({
                                templateUrl: 'app/views/Controls/workflowAction/workflowPopup/workflowPopup.html',
                                controller: 'WorkflowPopupController',
                                size: 'md',
                                keyboard: true,
                                backdrop: 'static',
                                resolve: {
                                    objOptions: function () {
                                        var options = {};
                                        options.modalTitle = scope.translateFilter('workflow.approveActionTitle');
                                        options.isThirdParty = false;
                                        options.isAssigning = false;
                                        options.isConditionalApproval = false;
                                        options.isMagazine = ((scope.workFlowApplication.applicationTypeId == 1 && scope.application.serviceId == 12) ? true : false);
                                        options.isDepartmentAssigning = false;
                                        options.isResolving = false;
                                        return options;
                                    }
                                }
                            });
                            modalInstance.result.then(function (actionTakenDetail) {
                                var actionTaken = {
                                    applicationDetailId: applicationDetailId,
                                    note: actionTakenDetail.notes,
                                    attachmentUrl: actionTakenDetail.attachmentUrl,
                                    thirdPartyOrganization: actionTakenDetail.thirdPartyOrganization,
                                    bankGuaranteeUrl: actionTakenDetail.bankGuaranteeUrl,
                                    contentReportUrl: actionTakenDetail.contentReportUrl
                                };

                                $http.post($rootScope.app.httpSource + 'api/Application/ManagerApproveMLApplication', actionTaken)
                                    .then(function (response) {
                                        scope.isBusy = false;
                                        SweetAlert.swal(scope.translateFilter('general.ok'), scope.translateFilter('workflow.applicationApprovedSuccessfully'), "success");
                                        scope.dtapplicationinstance.rerender();
                                    },
                                        function (response) {
                                            if (response.data.exceptionMessage === "ApplicationCheckedOutException") {
                                                SweetAlert.swal(scope.translateFilter('general.ok'), scope.translateFilter('general.applicationCheckedOut'), "error");
                                            }
                                            scope.isBusy = false;
                                        });
                            });
                            break;

                        //Common Actions for Media License And Media Content
                        //Initiate Payment
                        case 15: case 31: case 38:
                            var modalInstance = $uibModal.open({
                                templateUrl: 'app/views/Payment/transactionRequest/transactionRequest.html',
                                controller: 'TransactionRequestController',
                                size: 'lg',
                                keyboard: false,
                                backdrop: 'static',
                                resolve: {
                                    applicationDetailId: applicationDetailId,
                                    visitId: null,
                                    isRenew: false,
                                    onCloseGoto: null
                                }
                            });

                            modalInstance.result.then(function (actionTakenDetail) {
                                scope.dtapplicationinstance.rerender();
                            });

                            break;

                        //Initiate Payment By Other Channels
                        case 63: case 77:
                            var modalInstance = $uibModal.open({
                                templateUrl: 'app/views/Payment/otherChannels/otherChannels.html',
                                controller: 'OtherChannelsController',
                                size: 'lg',
                                keyboard: false,
                                backdrop: 'static',
                                resolve: {
                                    applicationDetailId: applicationDetailId,
                                    visitId: null,
                                    isRenew: false,
                                    onCloseGoto: null
                                }
                            });

                            modalInstance.result.then(function (actionTakenDetail) {
                                scope.dtapplicationinstance.rerender();
                            });

                            break;

                        //Renew Payment
                        case 39: case 40: case 41:

                            switch (scope.application.service.id) {
                                case 8:
                                    $state.go('app.MediaLicenseServices.RenewRadioTvBroadcasting', { applicationId: scope.application.id, applicationDetailId: scope.workFlowApplication.id }, { reload: true });
                                    break;

                                case 9:
                                    //Check if some of activities expired
                                    $http.get($rootScope.app.httpSource + 'api/MediaLicense/GetById?id=' + scope.workFlowApplication.id)
                                        .then(function (response) {
                                            var mediaLicense = response.data;
                                            var expiredEconomicActivities = [];

                                            if (mediaLicense.applicationDetail.certificates.length > 0) {
                                                for (var i = 0; i < mediaLicense.applicationDetail.certificates[0].certificateDetails.length; i++) {
                                                    if (mediaLicense.applicationDetail.certificates[0].certificateDetails[i].mediaLicenseEconomicActivity.cancelledDate == null &&
                                                        moment(mediaLicense.applicationDetail.certificates[0].certificateDetails[i].expiryDate).add(1, 'M') < new Date()) {
                                                        expiredEconomicActivities.push(mediaLicense.applicationDetail.certificates[0].certificateDetails[i]);
                                                    }
                                                }
                                            }

                                            if (expiredEconomicActivities.length > 0) {
                                                var textToDisplay = "<div class='well-sm bg-danger small'>" + $filter('translate')('mediaLicense.renewStopped') + "</div>";

                                                textToDisplay += "<table class='table table-hover' style='font-size: 14px;'><thead><tr><th style='width: 80%'>" +
                                                    $filter('translate')('mediaLicense.economicActivity') + "</th><th>" + $filter('translate')('mediaLicense.expiryDate') +
                                                    "</th></tr></thead><tbody>";

                                                for (var i = 0; i < expiredEconomicActivities.length; i++) {
                                                    textToDisplay += "<tr><td>" + $filter('localizeString')(expiredEconomicActivities[i].mediaLicenseEconomicActivity.economicActivity) +
                                                        "</td><td>" + moment(expiredEconomicActivities[i].expiryDate).format('DD-MMMM-YYYY') + "</td></tr>";

                                                    if (expiredEconomicActivities.length == (i + 1)) {
                                                        textToDisplay += "</tbody></table>";
                                                    }
                                                }

                                                SweetAlert.swal({
                                                    html: true,
                                                    title: $filter('translate')('general.notApplicable'),
                                                    text: textToDisplay,
                                                    customClass: "sweetalert-lg",
                                                    confirmButtonText: $filter('translate')('general.ok')
                                                });
                                            }
                                            else {
                                                $state.go('app.MediaLicenseServices.RenewMediaLicense', { applicationId: scope.application.id, applicationDetailId: scope.workFlowApplication.id }, { reload: true });
                                            }
                                        });

                                    break;

                                case 12:
                                    $state.go('app.MediaLicenseServices.RenewNewspaperMagazineLicense', { applicationId: scope.application.id, applicationDetailId: scope.workFlowApplication.id }, { reload: true });
                                    break;

                                case 18:
                                    $state.go('app.ForeignMediaServices.RenewPressCard', { applicationId: scope.application.id, applicationDetailId: scope.workFlowApplication.id }, { reload: true });
                                    break;

                                case 19:
                                    $state.go('app.ForeignMediaServices.RenewSponsorship', { applicationId: scope.application.id, applicationDetailId: scope.workFlowApplication.id }, { reload: true });
                                    break;
                            }

                            break;

                        //Verify Payment
                        case 27: case 28:
                            //Real.......................
                            var modalInstance = $uibModal.open({
                                templateUrl: 'app/views/Payment/verifyPayment/verifyPayment.html',
                                controller: 'VerifyPaymentController',
                                size: 'lg',
                                keyboard: false,
                                backdrop: 'static',
                                resolve: {
                                    applicationDetailId: applicationDetailId,
                                    visitId: null
                                }
                            });

                            break;

                        //Print Certificate
                        case 11: case 25: case 37:

                            if (scope.user.userTypeCode == '06') {
                                SweetAlert.swal({
                                    title: scope.translateFilter('workflow.pleaseSelectTheCertificateType'),
                                    text: "",
                                    type: "warning",
                                    showCancelButton: true,
                                    confirmButtonColor: "#DD6B55",
                                    confirmButtonText: scope.translateFilter('workflow.certificateWithHeader'),
                                    cancelButtonText: scope.translateFilter('workflow.certificateWithoutHeader'),
                                    closeOnConfirm: true,
                                    closeOnCancel: true
                                },
                                    function (isConfirm) {
                                        if (isConfirm) {
                                            $window.open(scope.workFlowApplication.certificates[0].certificateWithHeaderFullUrl, '_blank');
                                        } else {
                                            $window.open(scope.workFlowApplication.certificates[0].certificateFullUrl, '_blank');
                                        }
                                    });
                            }
                            else {
                                $window.open(scope.workFlowApplication.certificates[0].certificateWithHeaderFullUrl, '_blank');
                            }
                            break;

                        case 45:
                            var modalInstance = $uibModal.open({
                                templateUrl: 'app/views/Controls/workflowAction/workflowPopup/workflowPopup.html',
                                controller: 'WorkflowPopupController',
                                size: 'md',
                                keyboard: true,
                                backdrop: 'static',
                                resolve: {
                                    objOptions: function () {
                                        var options = {};
                                        options.modalTitle = scope.translateFilter('workflow.assignSupervisor');
                                        options.isThirdParty = true;
                                        options.isAssigning = true;
                                        options.isConditionalApproval = false;
                                        options.isMagazine = false;
                                        options.isDepartmentAssigning = false;
                                        options.isResolving = false;
                                        return options;
                                    }
                                }
                            });
                            modalInstance.result.then(function (actionTakenDetail) {
                                var actionTaken = {
                                    applicationDetailId: applicationDetailId,
                                    note: actionTakenDetail.notes,
                                    assignedToUser: actionTakenDetail.assignedToUser,
                                    thirdPartyOrganization: actionTakenDetail.thirdPartyOrganization
                                };

                                $http.post($rootScope.app.httpSource + 'api/Application/MaterialAssignMCApplication', actionTaken)
                                    .then(function (response) {
                                        scope.isBusy = false;
                                        SweetAlert.swal(scope.translateFilter('general.ok'), scope.translateFilter('workflow.mediaMaterialAssignedSuccessfully'), "success");
                                        scope.dtapplicationinstance.rerender();
                                    },
                                        function (response) {
                                            if (response.data.exceptionMessage === "ApplicationCheckedOutException") {
                                                SweetAlert.swal(scope.translateFilter('general.ok'), scope.translateFilter('general.applicationCheckedOut'), "error");
                                            }
                                            scope.isBusy = false;
                                        });
                            });
                            break;

                        case 46:
                            var modalInstance = $uibModal.open({
                                templateUrl: 'app/views/Controls/workflowAction/workflowPopup/workflowPopup.html',
                                controller: 'WorkflowPopupController',
                                size: 'md',
                                keyboard: true,
                                backdrop: 'static',
                                resolve: {
                                    objOptions: function () {
                                        var options = {};
                                        options.modalTitle = scope.translateFilter('workflow.managerRejectApplication');
                                        options.isThirdParty = false;
                                        options.isAssigning = false;
                                        options.isConditionalApproval = false;
                                        options.isMagazine = false;
                                        options.isDepartmentAssigning = false;
                                        options.isResolving = false;
                                        return options;
                                    }
                                }
                            });
                            modalInstance.result.then(function (actionTakenDetail) {
                                var actionTaken = {
                                    applicationDetailId: applicationDetailId,
                                    note: actionTakenDetail.notes,
                                    attachmentUrl: actionTakenDetail.attachmentUrl,
                                    thirdPartyOrganization: actionTakenDetail.thirdPartyOrganization
                                };

                                $http.post($rootScope.app.httpSource + 'api/Application/BackToEmployeeMLApplication', actionTaken)
                                    .then(function (response) {
                                        scope.isBusy = false;
                                        SweetAlert.swal(scope.translateFilter('general.ok'), scope.translateFilter('workflow.managerRejectedSuccessfully'), "success");
                                        scope.dtapplicationinstance.rerender();
                                    },
                                        function (response) {
                                            if (response.data.exceptionMessage === "ApplicationCheckedOutException") {
                                                SweetAlert.swal(scope.translateFilter('general.ok'), scope.translateFilter('general.applicationCheckedOut'), "error");
                                            }
                                            scope.isBusy = false;
                                        });
                            });
                            break;

                        case 44: //Add New Activity
                            $state.go('app.MediaLicenseServices.AddMediaActivity', { applicationId: scope.application.id, applicationDetailId: scope.workFlowApplication.id }, { reload: true });
                            break;

                        case 48: //Cancel Media Activity
                            $state.go('app.MediaLicenseServices.CancelMediaActivity', { applicationId: scope.application.id, applicationDetailId: scope.workFlowApplication.id }, { reload: true });
                            break;

                        case 57: //Add/ Remove/ Waive Partners
                            $state.go('app.MediaLicenseServices.ChangePartners', { applicationId: scope.application.id, applicationDetailId: scope.workFlowApplication.id }, { reload: true });
                            break;

                        case 52:
                            var modalInstance = $uibModal.open({
                                templateUrl: 'app/views/Controls/workflowAction/workflowPopup/workflowPopup.html',
                                controller: 'WorkflowPopupController',
                                size: 'md',
                                keyboard: true,
                                backdrop: 'static',
                                resolve: {
                                    objOptions: function () {
                                        var options = {};
                                        options.modalTitle = scope.translateFilter('workflow.approveVisit');
                                        options.isThirdParty = false;
                                        options.isAssigning = false;
                                        options.isConditionalApproval = false;
                                        options.isMagazine = false;
                                        options.isDepartmentAssigning = false;
                                        options.isResolving = false;
                                        return options;
                                    }
                                }
                            });
                            modalInstance.result.then(function (actionTakenDetail) {
                                var actionTaken = {
                                    visitId: applicationDetailId,
                                    note: actionTakenDetail.notes
                                };

                                $http.post($rootScope.app.httpSource + 'api/Visit/ApproveVisit', actionTaken)
                                    .then(function (response) {
                                        scope.isBusy = false;
                                        SweetAlert.swal(scope.translateFilter('general.ok'), scope.translateFilter('workflow.applicationApprovedSuccessfully'), "success");
                                        scope.dtapplicationinstance.rerender();
                                    },
                                        function (response) {
                                            scope.isBusy = false;
                                        });
                            });
                            break;

                        case 53:
                            var modalInstance = $uibModal.open({
                                templateUrl: 'app/views/Controls/workflowAction/workflowPopup/workflowPopup.html',
                                controller: 'WorkflowPopupController',
                                size: 'md',
                                keyboard: true,
                                backdrop: 'static',
                                resolve: {
                                    objOptions: function () {
                                        var options = {};
                                        options.modalTitle = scope.translateFilter('workflow.rejectVisit');
                                        options.isThirdParty = false;
                                        options.isAssigning = false;
                                        options.isConditionalApproval = false;
                                        options.isMagazine = false;
                                        options.isDepartmentAssigning = false;
                                        options.isResolving = false;
                                        return options;
                                    }
                                }
                            });
                            modalInstance.result.then(function (actionTakenDetail) {
                                var actionTaken = {
                                    applicationDetailId: applicationDetailId,
                                    note: actionTakenDetail.notes,
                                    attachmentUrl: actionTakenDetail.attachmentUrl,
                                    thirdPartyOrganization: actionTakenDetail.thirdPartyOrganization,
                                    isConditionallyApproved: actionTakenDetail.isConditionallyApproved
                                };

                                $http.post($rootScope.app.httpSource + 'api/Application/ApproveMLApplicationData', actionTaken)
                                    .then(function (response) {
                                        scope.isBusy = false;
                                        SweetAlert.swal(scope.translateFilter('general.ok'), scope.translateFilter('workflow.applicationApprovedSuccessfully'), "success");
                                        scope.dtapplicationinstance.rerender();
                                    },
                                        function (response) {
                                            scope.isBusy = false;
                                        });
                            });
                            break;

                        case 55:
                            $window.open(scope.workFlowApplication.vistitReportUrlFullPath, '_blank');
                            break;

                        case 59:
                            var modalInstance = $uibModal.open({
                                templateUrl: 'app/views/Controls/workflowAction/workflowPopup/workflowPopup.html',
                                controller: 'WorkflowPopupController',
                                size: 'md',
                                keyboard: true,
                                backdrop: 'static',
                                resolve: {
                                    objOptions: function () {
                                        var options = {};
                                        options.modalTitle = scope.translateFilter('enquiries.sendEnquiryToDepartment');
                                        options.isThirdParty = false;
                                        options.isAssigning = false;
                                        options.isConditionalApproval = false;
                                        options.isMagazine = false;
                                        options.isDepartmentAssigning = true;
                                        options.isResolving = false;
                                        return options;
                                    }
                                }
                            });
                            modalInstance.result.then(function (actionTakenDetail) {
                                var actionTaken = {
                                    enquiryId: applicationDetailId,
                                    note: actionTakenDetail.notes,
                                    department: actionTakenDetail.department,
                                    priority: actionTakenDetail.priority,
                                    enquiryType: actionTakenDetail.enquiryType
                                };

                                $http.post($rootScope.app.httpSource + 'api/Enquiry/SendToDepartment', actionTaken)
                                    .then(function (response) {
                                        scope.isBusy = false;
                                        SweetAlert.swal(scope.translateFilter('general.ok'), scope.translateFilter('enquiries.sentToDepartment'), "success");
                                        if (!scope.isEnquiryReview || scope.isEnquiryReview == 'undefined') {
                                            scope.dtapplicationinstance.rerender();
                                        }  
                                        $state.go('app.enquiries');
                                    },
                                        function (response) {
                                            scope.isBusy = false;
                                        });
                            });
                            break;

                        case 60:
                            var modalInstance = $uibModal.open({
                                templateUrl: 'app/views/Controls/workflowAction/workflowPopup/workflowPopup.html',
                                controller: 'WorkflowPopupController',
                                size: 'md',
                                keyboard: true,
                                backdrop: 'static',
                                resolve: {
                                    objOptions: function () {
                                        var options = {};
                                        options.modalTitle = scope.translateFilter('enquiries.resolve');;
                                        options.isThirdParty = false;
                                        options.isAssigning = false;
                                        options.isConditionalApproval = false;
                                        options.isMagazine = false;
                                        options.isDepartmentAssigning = false;
                                        options.isResolving = true;
                                        options.departmentId = scope.application != null ? scope.application.enquiryDetails[0].departmentId : scope.workFlowApplication.enquiryDetails[0].departmentId
;
                                        return options;
                                    }
                                }
                            });
                            modalInstance.result.then(function (actionTakenDetail) {
                                var actionTaken = {
                                    enquiryId: applicationDetailId,
                                    note: actionTakenDetail.notes,
                                    resolutionDesc: actionTakenDetail.resolutionDesc,
                                    problemCause: actionTakenDetail.problemCause,
                                    attachementUrl: actionTakenDetail.attachementUrl
                                };

                                $http.post($rootScope.app.httpSource + 'api/Enquiry/ResolveEnquiry', actionTaken)
                                    .then(function (response) {
                                        scope.isBusy = false;
                                        SweetAlert.swal(scope.translateFilter('general.ok'), scope.translateFilter('enquiries.resolved'), "success");
                                        if (!scope.isEnquiryReview || scope.isEnquiryReview == 'undefined') {
                                            scope.dtapplicationinstance.rerender();
                                        }
                                        $state.go('app.enquiries');
                                    },
                                        function (response) {
                                            scope.isBusy = false;
                                        });
                            });
                            break;

                        case 61:
                            var modalInstance = $uibModal.open({
                                templateUrl: 'app/views/Controls/workflowAction/workflowPopup/workflowPopup.html',
                                controller: 'WorkflowPopupController',
                                size: 'md',
                                keyboard: true,
                                backdrop: 'static',
                                resolve: {
                                    objOptions: function () {
                                        var options = {};
                                        options.modalTitle = scope.translateFilter('enquiries.sendBackToHappiness');;
                                        options.isThirdParty = false;
                                        options.isAssigning = false;
                                        options.isConditionalApproval = false;
                                        options.isMagazine = false;
                                        options.isDepartmentAssigning = false;
                                        options.isResolving = false;
                                        return options;
                                    }
                                }
                            });
                            modalInstance.result.then(function (actionTakenDetail) {
                                var actionTaken = {
                                    enquiryId: applicationDetailId,
                                    note: actionTakenDetail.notes
                                };

                                $http.post($rootScope.app.httpSource + 'api/Enquiry/SendBackToHappiness', actionTaken)
                                    .then(function (response) {
                                        scope.isBusy = false;
                                        SweetAlert.swal(scope.translateFilter('general.ok'), scope.translateFilter('enquiries.sentBackToHappiness'), "success");
                                        if (!scope.isEnquiryReview || scope.isEnquiryReview == 'undefined') {
                                            scope.dtapplicationinstance.rerender();
                                        }
                                        $state.go('app.enquiries');
                                    },
                                        function (response) {
                                            scope.isBusy = false;
                                        });
                            });
                            break;

                        case 62:
                            var modalInstance = $uibModal.open({
                                templateUrl: 'app/views/Controls/workflowAction/workflowPopup/workflowPopup.html',
                                controller: 'WorkflowPopupController',
                                size: 'md',
                                keyboard: true,
                                backdrop: 'static',
                                resolve: {
                                    objOptions: function () {
                                        var options = {};
                                        options.modalTitle = scope.translateFilter('enquiries.approveResolution');;
                                        options.isThirdParty = false;
                                        options.isAssigning = false;
                                        options.isConditionalApproval = false;
                                        options.isMagazine = false;
                                        options.isDepartmentAssigning = false;
                                        options.isResolving = false;
                                        options.isNeedMessage = true;
                                        return options;
                                    }
                                }
                            });
                            modalInstance.result.then(function (actionTakenDetail) {
                                var actionTaken = {
                                    enquiryId: applicationDetailId,
                                    note: actionTakenDetail.notes,
                                    messageToCustomer: actionTakenDetail.messageToCustomer
                                };

                                $http.post($rootScope.app.httpSource + 'api/Enquiry/ApproveResolution', actionTaken)
                                    .then(function (response) {
                                        scope.isBusy = false;
                                        SweetAlert.swal(scope.translateFilter('general.ok'), scope.translateFilter('enquiries.approvedResolution'), "success");
                                        if (!scope.isEnquiryReview || scope.isEnquiryReview == 'undefined') {
                                            scope.dtapplicationinstance.rerender();
                                        }
                                        $state.go('app.enquiries');
                                    },
                                        function (response) {
                                            scope.isBusy = false;
                                        });
                            });
                            break;

                        case 30:
                            var modalInstance = $uibModal.open({
                                templateUrl: 'app/views/Controls/workflowAction/workflowPopup/workflowPopup.html',
                                controller: 'WorkflowPopupController',
                                size: 'md',
                                keyboard: true,
                                backdrop: 'static',
                                resolve: {
                                    objOptions: function () {
                                        var options = {};
                                        options.modalTitle = scope.translateFilter('workflow.approveActionTitle');
                                        options.isThirdParty = false;
                                        options.isAssigning = false;
                                        options.isConditionalApproval = (scope.workFlowApplication.applicationTypeId == 2 ? true : false);
                                        options.isMagazine = false;
                                        options.isDepartmentAssigning = false;
                                        options.isResolving = false;
                                        return options;
                                    }
                                }
                            });
                            modalInstance.result.then(function (actionTakenDetail) {
                                var actionTaken = {
                                    applicationDetailId: applicationDetailId,
                                    note: actionTakenDetail.notes,
                                    attachmentUrl: actionTakenDetail.attachmentUrl,
                                    thirdPartyOrganization: actionTakenDetail.thirdPartyOrganization,
                                    isConditionallyApproved: actionTakenDetail.isConditionallyApproved
                                };

                                $http.post($rootScope.app.httpSource + 'api/Application/ApproveFMApplicationData', actionTaken)
                                    .then(function (response) {
                                        scope.isBusy = false;
                                        SweetAlert.swal(scope.translateFilter('general.ok'), scope.translateFilter('workflow.applicationApprovedSuccessfully'), "success");
                                        scope.dtapplicationinstance.rerender();
                                    },
                                        function (response) {
                                            if (response.data.exceptionMessage === "ApplicationCheckedOutException") {
                                                SweetAlert.swal(scope.translateFilter('general.ok'), scope.translateFilter('general.applicationCheckedOut'), "error");
                                            }
                                            scope.isBusy = false;
                                        });
                            });
                            break;
                        case 32:
                            var modalInstance = $uibModal.open({
                                templateUrl: 'app/views/Controls/workflowAction/workflowPopup/workflowPopup.html',
                                controller: 'WorkflowPopupController',
                                size: 'md',
                                keyboard: true,
                                backdrop: 'static',
                                resolve: {
                                    objOptions: function () {
                                        var options = {};
                                        options.modalTitle = scope.translateFilter('workflow.sendBackToCustomerActionTitle');
                                        options.isThirdParty = false;
                                        options.isAssigning = false;
                                        options.isConditionalApproval = false;
                                        options.isMagazine = false;
                                        options.isDepartmentAssigning = false;
                                        options.isResolving = false;
                                        return options;
                                    }
                                }
                            });
                            modalInstance.result.then(function (actionTakenDetail) {
                                var actionTaken = {
                                    applicationDetailId: applicationDetailId,
                                    note: actionTakenDetail.notes,
                                    attachmentUrl: actionTakenDetail.attachmentUrl,
                                    thirdPartyOrganization: actionTakenDetail.thirdPartyOrganization
                                };

                                $http.post($rootScope.app.httpSource + 'api/Application/SendFMApplicationToCustomer', actionTaken)
                                    .then(function (response) {
                                        scope.isBusy = false;
                                        SweetAlert.swal(scope.translateFilter('general.ok'), scope.translateFilter('workflow.sentBackToCustomersuccesfully'), "success");
                                        scope.dtapplicationinstance.rerender();
                                    },
                                        function (response) {
                                            if (response.data.exceptionMessage === "ApplicationCheckedOutException") {
                                                SweetAlert.swal(scope.translateFilter('general.ok'), scope.translateFilter('general.applicationCheckedOut'), "error");
                                            }
                                            scope.isBusy = false;
                                        });
                            });
                            break;
                        case 33:
                            var modalInstance = $uibModal.open({
                                templateUrl: 'app/views/Controls/workflowAction/workflowPopup/workflowPopup.html',
                                controller: 'WorkflowPopupController',
                                size: 'md',
                                keyboard: true,
                                backdrop: 'static',
                                resolve: {
                                    objOptions: function () {
                                        var options = {};
                                        options.modalTitle = scope.translateFilter('workflow.thirdPartyApproveApplication');
                                        options.isThirdParty = true;
                                        options.isAssigning = false;
                                        options.isConditionalApproval = false;
                                        options.isMagazine = false;
                                        options.isDepartmentAssigning = false;
                                        options.isResolving = false;
                                        return options;
                                    }
                                }
                            });
                            modalInstance.result.then(function (actionTakenDetail) {
                                var actionTaken = {
                                    applicationDetailId: applicationDetailId,
                                    note: actionTakenDetail.notes,
                                    attachmentUrl: actionTakenDetail.attachmentUrl,
                                    thirdPartyOrganization: actionTakenDetail.thirdPartyOrganization
                                };

                                $http.post($rootScope.app.httpSource + 'api/Application/ThirdPartyApproveFMApplication', actionTaken)
                                    .then(function (response) {
                                        scope.isBusy = false;
                                        SweetAlert.swal(scope.translateFilter('general.ok'), scope.translateFilter('workflow.thirdPartyApprovedsuccesfully'), "success");
                                        scope.dtapplicationinstance.rerender();
                                    },
                                        function (response) {
                                            if (response.data.exceptionMessage === "ApplicationCheckedOutException") {
                                                SweetAlert.swal(scope.translateFilter('general.ok'), scope.translateFilter('general.applicationCheckedOut'), "error");
                                            }
                                            scope.isBusy = false;
                                        });
                            });
                            break;
                        case 34:
                            var modalInstance = $uibModal.open({
                                templateUrl: 'app/views/Controls/workflowAction/workflowPopup/workflowPopup.html',
                                controller: 'WorkflowPopupController',
                                size: 'md',
                                keyboard: true,
                                backdrop: 'static',
                                resolve: {
                                    objOptions: function () {
                                        var options = {};
                                        options.modalTitle = scope.translateFilter('workflow.thirdPartyRejectApplication');
                                        options.isThirdParty = true;
                                        options.isAssigning = false;
                                        options.isConditionalApproval = false;
                                        options.isMagazine = false;
                                        options.isDepartmentAssigning = false;
                                        options.isResolving = false;
                                        return options;
                                    }
                                }
                            });
                            modalInstance.result.then(function (actionTakenDetail) {
                                var actionTaken = {
                                    applicationDetailId: applicationDetailId,
                                    note: actionTakenDetail.notes,
                                    attachmentUrl: actionTakenDetail.attachmentUrl,
                                    thirdPartyOrganization: actionTakenDetail.thirdPartyOrganization
                                };

                                $http.post($rootScope.app.httpSource + 'api/Application/ThirdPartyRejectFMApplication', actionTaken)
                                    .then(function (response) {
                                        scope.isBusy = false;
                                        SweetAlert.swal(scope.translateFilter('general.ok'), scope.translateFilter('workflow.thirdPartyRejectedsuccesfully'), "success");
                                        scope.dtapplicationinstance.rerender();
                                    },
                                        function (response) {
                                            if (response.data.exceptionMessage === "ApplicationCheckedOutException") {
                                                SweetAlert.swal(scope.translateFilter('general.ok'), scope.translateFilter('general.applicationCheckedOut'), "error");
                                            }
                                            scope.isBusy = false;
                                        });
                            });
                            break;
                        case 73:
                            var modalInstance = $uibModal.open({
                                templateUrl: 'app/views/Controls/workflowAction/workflowPopup/workflowPopup.html',
                                controller: 'WorkflowPopupController',
                                size: 'md',
                                keyboard: true,
                                backdrop: 'static',
                                resolve: {
                                    objOptions: function () {
                                        var options = {};
                                        options.modalTitle = scope.translateFilter('workflow.sendBackToEmployeeReviewTitle');
                                        options.isThirdParty = false;
                                        options.isAssigning = false;
                                        options.isConditionalApproval = false;
                                        options.isMagazine = false;
                                        options.isDepartmentAssigning = false;
                                        options.isResolving = false;
                                        return options;
                                    }
                                }
                            });
                            modalInstance.result.then(function (actionTakenDetail) {
                                var actionTaken = {
                                    applicationDetailId: applicationDetailId,
                                    note: actionTakenDetail.notes,
                                    attachmentUrl: actionTakenDetail.attachmentUrl,
                                    thirdPartyOrganization: actionTakenDetail.thirdPartyOrganization
                                };

                                $http.post($rootScope.app.httpSource + 'api/Application/BackToEmployeeFMApplication', actionTaken)
                                    .then(function (response) {
                                        scope.isBusy = false;
                                        SweetAlert.swal(scope.translateFilter('general.ok'), scope.translateFilter('workflow.sentBackToEmployeeReviewsuccesfully'), "success");
                                        scope.dtapplicationinstance.rerender();
                                    },
                                        function (response) {
                                            if (response.data.exceptionMessage === "ApplicationCheckedOutException") {
                                                SweetAlert.swal(scope.translateFilter('general.ok'), scope.translateFilter('general.applicationCheckedOut'), "error");
                                            }
                                            scope.isBusy = false;
                                        });
                            });
                            break;
                        case 36:
                            var modalInstance = $uibModal.open({
                                templateUrl: 'app/views/Controls/workflowAction/workflowPopup/workflowPopup.html',
                                controller: 'WorkflowPopupController',
                                size: 'md',
                                keyboard: true,
                                backdrop: 'static',
                                resolve: {
                                    objOptions: function () {
                                        var options = {};
                                        options.modalTitle = scope.translateFilter('workflow.approveActionTitle');
                                        options.isThirdParty = false;
                                        options.isAssigning = false;
                                        options.isConditionalApproval = false;
                                        options.isMagazine = ((scope.workFlowApplication.applicationTypeId == 1 && scope.application.serviceId == 12) ? true : false);
                                        options.isDepartmentAssigning = false;
                                        options.isResolving = false;
                                        return options;
                                    }
                                }
                            });
                            modalInstance.result.then(function (actionTakenDetail) {
                                var actionTaken = {
                                    applicationDetailId: applicationDetailId,
                                    note: actionTakenDetail.notes,
                                    attachmentUrl: actionTakenDetail.attachmentUrl,
                                    thirdPartyOrganization: actionTakenDetail.thirdPartyOrganization,
                                    bankGuaranteeUrl: actionTakenDetail.bankGuaranteeUrl,
                                    contentReportUrl: actionTakenDetail.contentReportUrl
                                };

                                $http.post($rootScope.app.httpSource + 'api/Application/ManagerApproveFMApplication', actionTaken)
                                    .then(function (response) {
                                        scope.isBusy = false;
                                        SweetAlert.swal(scope.translateFilter('general.ok'), scope.translateFilter('workflow.applicationApprovedSuccessfully'), "success");
                                        scope.dtapplicationinstance.rerender();
                                    },
                                        function (response) {
                                            if (response.data.exceptionMessage === "ApplicationCheckedOutException") {
                                                SweetAlert.swal(scope.translateFilter('general.ok'), scope.translateFilter('general.applicationCheckedOut'), "error");
                                            }
                                            scope.isBusy = false;
                                        });
                            });
                            break;
                        case 35:
                            var modalInstance = $uibModal.open({
                                templateUrl: 'app/views/Controls/workflowAction/workflowPopup/workflowPopup.html',
                                controller: 'WorkflowPopupController',
                                size: 'md',
                                keyboard: true,
                                backdrop: 'static',
                                resolve: {
                                    objOptions: function () {
                                        var options = {};
                                        options.modalTitle = scope.translateFilter('workflow.managerRejectApplication');
                                        options.isThirdParty = false;
                                        options.isAssigning = false;
                                        options.isConditionalApproval = false;
                                        options.isMagazine = false;
                                        options.isDepartmentAssigning = false;
                                        options.isResolving = false;
                                        return options;
                                    }
                                }
                            });
                            modalInstance.result.then(function (actionTakenDetail) {
                                var actionTaken = {
                                    applicationDetailId: applicationDetailId,
                                    note: actionTakenDetail.notes,
                                    attachmentUrl: actionTakenDetail.attachmentUrl,
                                    thirdPartyOrganization: actionTakenDetail.thirdPartyOrganization
                                };

                                $http.post($rootScope.app.httpSource + 'api/Application/ManagerRejectFMApplication', actionTaken)
                                    .then(function (response) {
                                        scope.isBusy = false;
                                        SweetAlert.swal(scope.translateFilter('general.ok'), scope.translateFilter('workflow.managerRejectedSuccessfully'), "success");
                                        scope.dtapplicationinstance.rerender();
                                    },
                                        function (response) {
                                            if (response.data.exceptionMessage === "ApplicationCheckedOutException") {
                                                SweetAlert.swal(scope.translateFilter('general.ok'), scope.translateFilter('general.applicationCheckedOut'), "error");
                                            }
                                            scope.isBusy = false;
                                        });
                            });
                            break;
                        case 76:
                            var modalInstance = $uibModal.open({
                                templateUrl: 'app/views/Controls/workflowAction/workflowPopup/workflowPopup.html',
                                controller: 'WorkflowPopupController',
                                size: 'md',
                                keyboard: true,
                                backdrop: 'static',
                                resolve: {
                                    objOptions: function () {
                                        var options = {};
                                        options.modalTitle = scope.translateFilter('workflow.managerPrintPressCard');
                                        options.isThirdParty = false;
                                        options.isAssigning = false;
                                        options.isConditionalApproval = false;
                                        options.isMagazine = false;
                                        options.isDepartmentAssigning = false;
                                        options.isResolving = false;
                                        return options;
                                    }
                                }
                            });
                            modalInstance.result.then(function (actionTakenDetail) {
                                var actionTaken = {
                                    applicationDetailId: applicationDetailId,
                                    note: actionTakenDetail.notes,
                                    attachmentUrl: actionTakenDetail.attachmentUrl,
                                    thirdPartyOrganization: actionTakenDetail.thirdPartyOrganization
                                };

                                $http.post($rootScope.app.httpSource + 'api/Application/ApproveFMIssuePressCard', actionTaken)
                                    .then(function (response) {
                                        scope.isBusy = false;
                                        SweetAlert.swal(scope.translateFilter('general.ok'), scope.translateFilter('workflow.managerPrintPressCardSuccessfully'), "success");
                                        scope.dtapplicationinstance.rerender();
                                    },
                                        function (response) {
                                            if (response.data.exceptionMessage === "ApplicationCheckedOutException") {
                                                SweetAlert.swal(scope.translateFilter('general.ok'), scope.translateFilter('general.applicationCheckedOut'), "error");
                                            }
                                            scope.isBusy = false;
                                        });
                            });
                            break;
                        case 74:
                            var modalInstance = $uibModal.open({
                                templateUrl: 'app/views/Controls/workflowAction/workflowPopup/workflowPopup.html',
                                controller: 'WorkflowPopupController',
                                size: 'md',
                                keyboard: true,
                                backdrop: 'static',
                                resolve: {
                                    objOptions: function () {
                                        var options = {};
                                        options.modalTitle = scope.translateFilter('workflow.approveActionTitle1');
                                        options.isThirdParty = false;
                                        options.isAssigning = false;
                                        options.isConditionalApproval = false;
                                        options.isMagazine = false;
                                        options.isDepartmentAssigning = false;
                                        options.isResolving = false;
                                        return options;
                                    }
                                }
                            });
                            modalInstance.result.then(function (actionTakenDetail) {
                                var actionTaken = {
                                    applicationDetailId: applicationDetailId,
                                    note: actionTakenDetail.notes,
                                    attachmentUrl: actionTakenDetail.attachmentUrl,
                                    thirdPartyOrganization: actionTakenDetail.thirdPartyOrganization
                                };

                                $http.post($rootScope.app.httpSource + 'api/Application/ApproveFMPassportData', actionTaken)
                                    .then(function (response) {
                                        scope.isBusy = false;
                                        SweetAlert.swal(scope.translateFilter('general.ok'), scope.translateFilter('workflow.applicationApprovedSuccessfully'), "success");
                                        scope.dtapplicationinstance.rerender();
                                    },
                                        function (response) {
                                            if (response.data.exceptionMessage === "ApplicationCheckedOutException") {
                                                SweetAlert.swal(scope.translateFilter('general.ok'), scope.translateFilter('general.applicationCheckedOut'), "error");
                                            }
                                            scope.isBusy = false;
                                        });
                            });
                            break;
                        case 75:
                            var modalInstance = $uibModal.open({
                                templateUrl: 'app/views/Controls/workflowAction/workflowPopup/workflowPopup.html',
                                controller: 'WorkflowPopupController',
                                size: 'md',
                                keyboard: true,
                                backdrop: 'static',
                                resolve: {
                                    objOptions: function () {
                                        var options = {};
                                        options.modalTitle = scope.translateFilter('workflow.thirdPartyApproveApplication');
                                        options.isThirdParty = false;
                                        options.isAssigning = false;
                                        options.isConditionalApproval = false;
                                        options.isMagazine = false;
                                        options.isDepartmentAssigning = false;
                                        options.isResolving = false;
                                        options.isSponsorship = true;
                                        return options;
                                    }
                                }
                            });
                            modalInstance.result.then(function (actionTakenDetail) {
                                var actionTaken = {
                                    applicationDetailId: applicationDetailId,
                                    note: actionTakenDetail.notes,
                                    attachmentUrl: actionTakenDetail.attachmentUrl,
                                    thirdPartyOrganization: actionTakenDetail.thirdPartyOrganization,
                                    issueDate: actionTakenDetail.fromCreatedOn,
                                    expiryDate: actionTakenDetail.toCreatedOn
                                };

                                $http.post($rootScope.app.httpSource + 'api/Application/ApproveFMSponsorshipData', actionTaken)
                                    .then(function (response) {
                                        scope.isBusy = false;
                                        SweetAlert.swal(scope.translateFilter('general.ok'), scope.translateFilter('workflow.applicationApprovedSuccessfully'), "success");
                                        scope.dtapplicationinstance.rerender();
                                    },
                                        function (response) {
                                            if (response.data.exceptionMessage === "ApplicationCheckedOutException") {
                                                SweetAlert.swal(scope.translateFilter('general.ok'), scope.translateFilter('general.applicationCheckedOut'), "error");
                                            }
                                            scope.isBusy = false;
                                        });
                            });
                            break;
                    }

                };
            }
        }
    }
})();