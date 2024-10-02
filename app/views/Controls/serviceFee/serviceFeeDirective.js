/**=========================================================
 * Module: profileAddress
 * Reuse cases of address in user profile page
 =========================================================*/

(function () {
    'use strict';

    angular
        .module('eServices')
        .directive('serviceFee', serviceFee)


    serviceFee.$inject = ['$rootScope', '$http', '$filter', 'DTOptionsBuilder', 'DTColumnBuilder', '$compile', '$state']
    function serviceFee($rootScope, $http, $filter, DTOptionsBuilder, DTColumnBuilder, $compile, $state) {
        return {
            restrict: 'E',
            scope: {
                serviceFeeControl: "=ngModel",
                isReview: "=?"
            },
            templateUrl: '/app/views/Controls/serviceFee/serviceFeeDirectiveTemplate.html',
            link: link
        };

        function link(scope, element, attrs) {
            function gridTable() {

                scope.serverData = function (sSource, aoData, fnCallback, oSettings) {
                    if (scope.isReview) {
                        var applicationDetailId = $state.params.id
                        if ($state.params.id == undefined || $state.params.id == "") {
                            applicationDetailId = scope.serviceFeeControl.applicationDetailId;
                        }

                   
                        var PaymentURL = '';
                        if (scope.serviceFeeControl.visitId != null)
                        {
                            PaymentURL = $rootScope.app.httpSource + 'api/Payment/GetByVisitId?id=' + scope.serviceFeeControl.visitId;
                        } else if (applicationDetailId != null)
                        {
                            PaymentURL = $rootScope.app.httpSource + 'api/Payment/GetByApplicationDetailId?id=' + applicationDetailId;
                        }

                        $http.get(PaymentURL).then(function (response) {
                                if (response.data) {
                                    var total = 0;
                                    for (var i = 0; i < response.data.paymentDetails.length; i++) {
                                        total += (response.data.paymentDetails[i].fee);
                                    }
                                    response.data.paymentDetails.total = total;
                                    scope.serviceFeeControl.total = response.data.paymentDetails.total;
                                    scope.authorized = true;
                                    scope.noFees = response.data.paymentDetails.length == 0 ? true : false;
                                    scope.noFees = response.data.paymentDetails.total == 0 ? true : false;

                                    //All the parameters you need is in the aoData variable
                                    var draw = aoData[0].value;
                                    var order = aoData[2].value[0];
                                    var start = aoData[3].value;
                                    var length = aoData[4].value;
                                    var search = aoData[5].value;

                                    var params = {
                                        searchtext: search.value,
                                        page: (start / length) + 1,
                                        pageSize: length,
                                        sortBy: (order.column === 0 ? 'id' : aoData[1].value[order.column].data),
                                        sortDirection: order.dir
                                    };

                                    //Then just call your service to get the records from server side           
                                    var records = {
                                        'draw': draw,
                                        'recordsTotal': response.data.paymentDetails.length,
                                        'recordsFiltered': response.data.paymentDetails.length,
                                        'data': response.data.paymentDetails
                                    };

                                    fnCallback(records);
                                }
                            });
                    }
                    else {
                        $http.post($rootScope.app.httpSource + 'api/ServiceFee/GetServiceFees', scope.serviceFeeControl)
                            .then(function (response) {
                                var total = 0;
                                if (response.data) {
                                    scope.serviceFeeControl.serviceFee = [];
                                    for (var i = 0; i < response.data.length; i++) {
                                        scope.serviceFeeControl.serviceFee.push(response.data[i]);
                                        scope.serviceFeeControl.serviceFee[i].fee = response.data[i].fee;
                                        total += (response.data[i].fee);
                                    }
                                }
                                scope.serviceFeeControl.total = total;
                                scope.authorized = true;
                                scope.noFees = scope.serviceFeeControl.serviceFee.length == 0 ? true : false;
                                scope.noFees = scope.serviceFeeControl.total == 0 ? true : false;

                                //All the parameters you need is in the aoData variable
                                var draw = aoData[0].value;
                                var order = aoData[2].value[0];
                                var start = aoData[3].value;
                                var length = aoData[4].value;
                                var search = aoData[5].value;

                                var params = {
                                    searchtext: search.value,
                                    page: (start / length) + 1,
                                    pageSize: length,
                                    sortBy: (order.column === 0 ? 'id' : aoData[1].value[order.column].data),
                                    sortDirection: order.dir
                                };

                                //Then just call your service to get the records from server side           
                                var records = {
                                    'draw': draw,
                                    'recordsTotal': scope.serviceFeeControl.serviceFee.length,
                                    'recordsFiltered': scope.serviceFeeControl.serviceFee.length,
                                    'data': scope.serviceFeeControl.serviceFee
                                };

                                fnCallback(records);
                            });
                    }
                };

                scope.createdRow = function (row, data, dataIndex) {
                    $compile(angular.element(row).contents())(scope);
                }

                scope.rowCallback = function () { };

                if ($rootScope.language.selected !== 'English') {
                    scope.grid.dtOptions = DTOptionsBuilder.newOptions()
                        .withFnServerData(scope.serverData)
                        .withOption('serverSide', true)
                        .withDataProp('data')
                        .withOption('processing', true)
                        .withLanguageSource('app/langs/ar.json')
                        .withOption('createdRow', scope.createdRow)
                        .withOption('bFilter', false)
                        .withOption('paging', false)
                        .withOption('info', false)
                        .withOption('rowCallback', scope.rowCallback).withBootstrap();
                }
                else {
                    scope.grid.dtOptions = DTOptionsBuilder.newOptions()
                        .withFnServerData(scope.serverData)
                        .withOption('serverSide', true)
                        .withDataProp('data')
                        .withOption('processing', true)
                        .withOption('createdRow', scope.createdRow)
                        .withOption('bFilter', false)
                        .withOption('paging', false)
                        .withOption('info', false)
                        .withOption('rowCallback', scope.rowCallback).withBootstrap();
                }

                scope.grid.dtColumns = [
                    DTColumnBuilder.newColumn(null).withTitle(scope.translateFilter('serviceFee.number')).renderWith(function (data, type, full, meta) {
                        var htmlSection = '';
                        htmlSection = '<div>' + (meta.row + 1) + '</div>';
                        return htmlSection;
                    }),
                    DTColumnBuilder.newColumn(null).withTitle(scope.translateFilter('serviceFee.activity')).renderWith(function (data, type, full, meta) {
                        var htmlSection = '';
                        if (data.nameEn != '' && data.nameEn != null) {
                            htmlSection = '<div>' + scope.localizeFilter(data) + '</div>';
                        }
                        else {
                            htmlSection = '<div>' + scope.localizeFilter(data.economicActivity) + '</div>';
                        }

                        return htmlSection;
                    }),
                    DTColumnBuilder.newColumn(null).withTitle(scope.translateFilter('serviceFee.note')).renderWith(function (data, type, full, meta) {
                        var htmlSection = '';

                        if (data.nameEn == '' || data.nameEn == null) {
                            if (data.economicActivity.descEn != null) {
                                htmlSection = '<div>' + $filter('localizeDescString')(data.economicActivity) + '</div>';
                            }
                        }

                        return htmlSection;
                    }),
                    DTColumnBuilder.newColumn('id').notVisible(),
                    DTColumnBuilder.newColumn('fee').withTitle(scope.translateFilter('serviceFee.fee'))];
            }

            var unwatch = scope.$watch('serviceFeeControl', function (newVal, oldVal) {
                if (newVal) {
                    init();
                    unwatch();
                }
            });

            function init() {
                scope.grid = {};
                scope.noFees = false;
                scope.authorized = false;
                scope.grid.dtInstance = {};
                scope.translateFilter = $filter('translate');
                scope.localizeFilter = $filter('localizeString');
                scope.serviceFeeControl.total = 0;
                scope.serviceFeeControl.reloadTable = function () {
                    if (scope.grid.dtInstance.rerender)
                        scope.grid.dtInstance.rerender();
                };

                if (scope.serviceFeeControl.serviceId != null && scope.serviceFeeControl.serviceId != undefined) {
                    scope.getServiceFees();
                }
                else if (scope.serviceFeeControl.applicationDetailId != null && scope.serviceFeeControl.applicationDetailId != undefined) {
                    $http.get($rootScope.app.httpSource + 'api/Payment/GetByApplicationDetailId?Id=' + scope.serviceFeeControl.applicationDetailId)
                        .then(function (response) {
                            scope.serviceFeeControl.serviceFee = response.data.paymentDetails;
                            var total = 0;
                            for (var i = 0; i < scope.serviceFeeControl.serviceFee.length; i++) {
                                total += (scope.serviceFeeControl.serviceFee[i].fee);
                            }
                            scope.serviceFeeControl.total = total;
                            scope.authorized = true;
                            scope.noFees = scope.serviceFeeControl.serviceFee.length == 0 ? true : false;
                            scope.noFees = scope.serviceFeeControl.total == 0 ? true : false;
                        });
                } else if (scope.serviceFeeControl.visitId != null && scope.serviceFeeControl.visitId != undefined) {
                    $http.get($rootScope.app.httpSource + 'api/Payment/GetByVisitId?Id=' + scope.serviceFeeControl.visitId)
                        .then(function (response) {
                            scope.serviceFeeControl.serviceFee = response.data.paymentDetails;
                            var total = 0;
                            for (var i = 0; i < scope.serviceFeeControl.serviceFee.length; i++) {
                                total += (scope.serviceFeeControl.serviceFee[i].fee);
                            }
                            scope.serviceFeeControl.total = total;
                            scope.authorized = true;
                            scope.noFees = scope.serviceFeeControl.serviceFee.length == 0 ? true : false;
                            scope.noFees = scope.serviceFeeControl.total == 0 ? true : false;
                        });
                }

                gridTable();
            }

            scope.getServiceFees = function () {
                $http.post($rootScope.app.httpSource + 'api/ServiceFee/GetServiceFees', scope.serviceFeeControl)
                    .then(function (response) {
                        var total = 0;
                        if (response.data) {
                            scope.serviceFeeControl.serviceFee = [];
                            for (var i = 0; i < response.data.length; i++) {
                                scope.serviceFeeControl.serviceFee.push(response.data[i]);
                                scope.serviceFeeControl.serviceFee[i].fee = response.data[i].fee;
                                total += (response.data[i].fee);
                            }
                        }

                        scope.serviceFeeControl.total = total;
                        scope.authorized = true;
                        scope.noFees = scope.serviceFeeControl.serviceFee.length == 0 ? true : false;
                        scope.noFees = scope.serviceFeeControl.total == 0 ? true : false;
                    });
            }
        }
    }
})();