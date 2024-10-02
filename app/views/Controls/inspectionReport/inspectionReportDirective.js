/**=========================================================
 * Module: inspectionReport
 =========================================================*/

(function () {
    'use strict';

    angular
        .module('eServices')
        .directive('inspectionReport', inspectionReport)

    inspectionReport.$inject = ['$rootScope', '$http', '$filter', '$window', 'browser', 'DTOptionsBuilder', 'DTColumnBuilder'];

    function inspectionReport($rootScope, $http, $filter, $window, browser, DTOptionsBuilder, DTColumnBuilder) {
        return {
            restrict: 'E',
            scope: {
                passModel: "=ngModel"
            },
            templateUrl: '/app/views/Controls/inspectionReport/inspectionReportDirectiveTemplate.html',
            link: link
        };

        function link(scope, element, attrs) {

            //To get the visit info
            scope.$watch('passModel', function (newValue, oldValue) {
                if (newValue != null) {
                    var establishmentId = newValue.applicationDetail.application.establishmentId;
                    $http.get($rootScope.app.httpSource + 'api/Visit/GetVisitDetailsById?establishmentId=' + establishmentId)
                        .then(function (response) {
                            if (response.data != null) {

                                newValue.isOpen = false;
                                newValue.isShow = true;
                                scope.visitInfo = response.data;

                                if (response.data.establishment != null){
                                    scope.ContractEndDate = moment(response.data.establishment.tenancyContractEndDate).format('DD-MMMM-YYYY');
                                }
                                else {
                                    scope.ContractEndDate = moment(response.data.taskList.establishment.tenancyContractEndDate).format('DD-MMMM-YYYY');
                                }

                                scope.InspectionVisitOn = moment(response.data.createdOn).format('DD-MMMM-YYYY, h:mm a');
                                scope.violationReasons = response.data.visitViolations;
                                scope.notes = response.data.note;
                                scope.visitBooks = response.data.visitBooks;
                                scope.visitRetainedMaterials = response.data.visitRetainedMaterials;
                                scope.contactSignatureUrl = response.data.contactSignatureUrl;
                                scope.contactPhone = response.data.contactPhone;
                                scope.contactEmail = response.data.contactEmail;
                                scope.contactName = response.data.contactName;
                            }
                            else {
                                newValue.isShow = false;
                            }
                        },
                        function (error) {
                            
                        });
                }
            });          
        }
    }
})();
