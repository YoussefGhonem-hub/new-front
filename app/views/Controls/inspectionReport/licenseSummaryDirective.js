/**=========================================================
 * Module: licenseSummary
 =========================================================*/

(function () {
    'use strict';


    licenseSummary.$inject = ['$rootScope', '$http', '$filter', '$window','$uibModal', 'browser', 'DTOptionsBuilder', 'DTColumnBuilder'];

    function licenseSummary($rootScope, $http, $filter, $window, $uibModal , browser, DTOptionsBuilder, DTColumnBuilder) {
        return {
            restrict: 'E',
            scope: {
                establishmentId: "=ngModel",
                fullDetails: "=fullDetails"
            },
            templateUrl: '/app/views/Controls/inspectionReport/licenseSummaryDirectiveTemplate.html',
            link: link
        };
        function link(scope, element, attrs) {

            scope.licenseSummary = {};

            var init = function () {
                if (scope.establishmentId != 0) {
                    $http.get($rootScope.app.httpSource + 'api/Visit/GetLicenseSummary/' + scope.establishmentId).then(function (res) {
                        scope.licenseSummary = res.data;

                        if (scope.licenseSummary.mediaLicens && scope.licenseSummary.mediaLicens.activities && scope.licenseSummary.mediaLicens.activities.length > 0) {
                            for (var i = 0; i <= scope.licenseSummary.mediaLicens.activities.length - 1; i++) {
                                if (new Date(scope.licenseSummary.mediaLicens.activities[i].expiryDate) > new Date()) {
                                    scope.licenseSummary.mediaLicens.activities[i].lableColor = 'success';
                                } else {
                                    scope.licenseSummary.mediaLicens.activities[i].lableColor = 'danger';
                                }
                            }
                        }
                      
                        if (scope.licenseSummary.establishment) {
                            if (scope.licenseSummary.establishment.licenseCopyUrl) {
                                scope.licenseSummary.establishment.licenseCopyUrl = $rootScope.app.httpSource + '/UserUploads/ProfileLicenseCopy/' + scope.licenseSummary.establishment.licenseCopyUrl;
                            }
                            if (scope.licenseSummary.establishment.tenancyContractCopyUrl) {
                                scope.licenseSummary.establishment.tenancyContractCopyUrl = $rootScope.app.httpSource + '/UserUploads/ProfileTenancyContract/' + scope.licenseSummary.establishment.tenancyContractCopyUrl;
                            }
                        }

                        if (scope.licenseSummary.mediaLicens) {
                            if (scope.licenseSummary.mediaLicens) {
                                scope.licenseSummary.mediaLicens.certificateUrl = $rootScope.app.httpSource + '/Reports/Certificates/' + scope.licenseSummary.mediaLicens.certificateUrl;
                            }
                        }


                    }, function (err) {

                    });
                } else {
                    scope.hasVists = true;
                }
            };

            scope.$watch('establishmentId', function (newVal, oldVal) {
                if (newVal) {
                    init();
                }
            });
            

            scope.openIframe = function (title, url) {
                var modalInstance = $uibModal.open({
                    templateUrl: 'app/views/Other/iframewindow/iframewindow.html',
                    controller: 'iframewindowController',
                    size: 'full',
                    resolve: {
                        data: function () {
                            return { title: title, url: url };
                        }
                    }
                });

                modalInstance.result.then(function (result) {

                }, function () {
                });
                modalInstance.result.finally(function (selectedItem) {
                    vm.newReportOpened = false;
                });

            };











          

        }
    }


    angular
        .module('eServices')
        .directive('licenseSummary', licenseSummary);

})();
