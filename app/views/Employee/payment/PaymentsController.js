/**=========================================================
 * Module: DashboardController.js
 =========================================================*/

(function () {
    'use strict';

    angular
        .module('eServices')
        .controller('PaymentsController', PaymentsController);

    PaymentsController.$inject = ['$rootScope', '$scope', 'UserProfile', '$filter', 'DTOptionsBuilder', 'DTColumnBuilder', '$compile', '$http', 'SweetAlert', '$window'];
    function PaymentsController($rootScope, $scope, UserProfile, $filter, DTOptionsBuilder, DTColumnBuilder, $compile, $http, SweetAlert, $window) {
        var vm = this;
        vm.user = UserProfile.getProfile();
        vm.dtApplicationInstance = {};
        vm.translateFilter = $filter('translate');

        vm.exportExcel = function () {
            $http.post($rootScope.app.httpSource + 'api/Payment/ExportPaymentExcel', vm.params, { responseType: 'arraybuffer' })
                .then(function (resp) {
                    var data = new Blob([resp.data], { type: 'application/vnd.ms-excel' });
                    saveAs(data, "Payments.xlsx");
                },
                    function (response) {
                    });
        };
        vm.exportPDF = function () {
            $http.post($rootScope.app.httpSource + 'api/Payment/ExportToPdf', vm.params, { responseType: 'arraybuffer' })
                .then(function (resp) {
                    var data = new Blob([resp.data], { type: 'application/pdf' });
                    saveAs(data, "Payments.pdf");
                },
                    function (response) {
                    });
        };
        vm.exportCSV = function () {

            $http.post($rootScope.app.httpSource + 'api/Payment/ExportCSV', vm.params)
                .then(function (resp) {
                    var myBlob = new Blob([resp.data], { type: 'text/html' });
                    var url = window.URL.createObjectURL(myBlob);
                    var a = document.createElement("a");
                    document.body.appendChild(a);
                    a.href = url;
                    a.download = "Payments.csv";
                    a.click();
                    window.URL.revokeObjectURL(url);
                },
                    function (response) {
                    });
        };

        if ($rootScope.language.selected !== 'English') {
            vm.dtPaymentsOptions = DTOptionsBuilder.newOptions()
                .withFnServerData(serverData)
                .withOption('serverSide', true)
                .withDataProp('data')
                .withOption('processing', true)
                .withOption('aaSorting', [[6, 'desc']])
                .withOption('stateSave', true)
                .withOption('stateSaveCallback', function (settings, data) {
                    localStorage.setItem('DataTables_' + settings.sInstance, JSON.stringify(data));
                })
                .withOption('stateLoadCallback', function (settings) {
                    return JSON.parse(localStorage.getItem('DataTables_' + settings.sInstance))
                })
                .withOption('responsive', {
                    details: {
                        renderer: renderer,
                    }
                })
                .withPaginationType('full_numbers')
                .withDisplayLength(10)
                .withLanguageSource('app/langs/ar.json')
                .withOption('createdRow', createdRow)
                .withOption('initComplete', function (settings, data) {
                    $compile(angular.element('#' + settings.sTableId).contents())($scope);
                })
                .withOption('fnDrawCallback', function (settings, data) {
                    $compile(angular.element('#' + settings.sTableId).contents())($scope);
                })
                .withOption('rowCallback', rowCallback).withBootstrap().withBootstrapOptions({
                    TableTools: {
                        classes: {
                            container: 'btn-group',
                            buttons: {
                                normal: 'btn btn-danger'
                            }
                        }
                    },
                    pagination: {
                        classes: {
                            ul: 'pagination pagination-sm'
                        }
                    }
                });
        }
        else {
            vm.dtPaymentsOptions = DTOptionsBuilder.newOptions()
                .withFnServerData(serverData)
                .withOption('serverSide', true)
                .withDataProp('data')
                .withOption('processing', true)
                .withOption('aaSorting', [[6, 'desc']])
                .withOption('stateSave', true)
                .withOption('stateLoadCallback', function (settings) {
                    return JSON.parse(localStorage.getItem('DataTables_' + settings.sInstance))
                })
                .withOption('responsive', {
                    details: {
                        renderer: renderer
                    }
                })
                .withPaginationType('full_numbers')
                .withDisplayLength(10)
                .withLanguageSource('app/langs/en.json')
                .withOption('createdRow', createdRow)
                .withOption('initComplete', function (settings, data) {
                    $compile(angular.element('#' + settings.sTableId).contents())($scope);
                })
                .withOption('fnDrawCallback', function (settings, data) {
                    $compile(angular.element('#' + settings.sTableId).contents())($scope);
                })
                .withOption('rowCallback', rowCallback).withBootstrap().withBootstrapOptions({
                    TableTools: {
                        classes: {
                            container: 'btn-group',
                            buttons: {
                                normal: 'btn btn-danger'
                            }
                        }
                    },
                    pagination: {
                        classes: {
                            ul: 'pagination pagination-sm'
                        }
                    }
                });
        }

        function actionsHtml(data, type, full, meta) {
            var htmlSection = '';

            if (data.paymentStatusId === 3) {
                if (data.paymentChannelId == 1) {
                    htmlSection = '<div class="list-icon"><div class="inline" ng-click="payments.printReceipt(' + data.id +
                        ')"><em class="fa fa-print" style="cursor:pointer" uib-tooltip="' + vm.translateFilter('general.receipt') + '"></em></div></div>';
                }
                else {
                    if (data.paymentChannelUrl != null) {
                        htmlSection = '<div class="list-icon"><div class="inline" ng-click="payments.printChannelUpload(' + data.id + ')"><em class="fa fa-money" style="cursor:pointer" ' +
                            'uib-tooltip="' + vm.translateFilter('general.paymentChannelUpload') + '"></em></div><div class="inline" ng-click="payments.printReceipt(' + data.id +
                            ')"><em class="fa fa-print" style="cursor:pointer" uib-tooltip="' + vm.translateFilter('general.receipt') + '"></em></div></div>';
                    }
                    else { 
                    htmlSection = '<div class="inline" ng-click="payments.printReceipt(' + data.id +
                            ')"><em class="fa fa-print" style="cursor:pointer" uib-tooltip="' + vm.translateFilter('general.receipt') + '"></em></div></div>';
                    }
                }
            }

            return htmlSection;
        }

        vm.printReceipt = function (paymentId) {
            var paymentObj = $filter('filter')(vm.allPayments, { id: paymentId }, true)[0];
           
            SweetAlert.swal({
                title: vm.translateFilter('dashboard.pleaseSelectTheReceiptType'),
                text: "",
                type: "warning",
                showCancelButton: true,
                confirmButtonColor: "#DD6B55",
                confirmButtonText: vm.translateFilter('dashboard.receiptWithHeader'),
                cancelButtonText: vm.translateFilter('dashboard.receiptWithoutHeader'),
                closeOnConfirm: true,
                closeOnCancel: true
            },
                function (isConfirm) {
                    if (isConfirm) {
                        $window.open(paymentObj.paymentReceiptWithHeaderFullUrl, '_blank');
                    } else {
                        $window.open(paymentObj.paymentReceiptFullUrl, '_blank');
                    }
                });
        };

        vm.printChannelUpload = function (paymentId) {
            var paymentChannelObj = $filter('filter')(vm.allPayments, { id: paymentId }, true)[0];
            $window.open(paymentChannelObj.paymentChannelFullUrl, '_blank');
        };

        vm.dtPaymentsColumns = [
            DTColumnBuilder.newColumn(null).withTitle(vm.translateFilter('dashboard.applicationNumber')).renderWith(
                function (data, type) {
                    if (data.applicationDetail) {
                        return data.applicationDetail.application.applicationNumber;
                    }
                    else {
                        return data.visit.visitNumber;
                    }
                }),
            DTColumnBuilder.newColumn('id').notVisible(),
            DTColumnBuilder.newColumn(null).withTitle(vm.translateFilter('dashboard.service')).renderWith(
                function (data, type) {
                    if (data.applicationDetail) {
                        return $filter('localizeString')(data.applicationDetail.application.service);
                    }
                    else {
                        return $filter('translate')('visit.service');
                    }
                }),
            DTColumnBuilder.newColumn(null).withTitle(vm.translateFilter('dashboard.applicationType')).renderWith(
                function (data, type) {
                    if (data.applicationDetail) {
                        return $filter('localizeString')(data.applicationDetail.applicationType);
                    }
                    else {
                        return '';
                    }
                }),
            DTColumnBuilder.newColumn(null).withOption('defaultContent', ' ').withTitle(vm.translateFilter('address.Emirate')).renderWith(
                function (data, type) {
                    var community = '';
                    if (data.applicationDetail && data.applicationDetail.application.user.userProfiles.length > 0) {
                        if (data.applicationDetail.application.user.userProfiles[0].userTypeId != 1) {
                            community = $filter('filter')(vm.communities, { id: data.applicationDetail.application.establishment.address.communityId }, true)[0];
                            return $filter('localizeString')(community.region.emirate);
                        }
                        else {
                            community = $filter('filter')(vm.communities, { id: data.applicationDetail.application.user.userProfiles[0].address.communityId }, true)[0];
                            return $filter('localizeString')(community.region.emirate);
                        }
                    } else {
                        community = $filter('filter')(vm.communities, { id: data.visit.establishment.address.communityId }, true)[0];
                        return $filter('localizeString')(community.region.emirate);
                    }
                }),
            DTColumnBuilder.newColumn(null).withTitle(vm.translateFilter('payment.paymentStatus')).renderWith(
                function (data, type) {
                    return $filter('localizeString')(data.paymentStatus);
                }),
            DTColumnBuilder.newColumn('paymentDate').withTitle(vm.translateFilter('payment.paymentDate')).renderWith(
                function (data, type) {
                    if (data)
                        return moment(data).format('Do MMMM YYYY, h:mm:ss a');
                    else
                        return '';
                }),
            DTColumnBuilder.newColumn('createdOn').withTitle(vm.translateFilter('dashboard.createdOn')).renderWith(
                function (data, type) {
                    return moment(data).format('Do MMMM YYYY');
                }),
            DTColumnBuilder.newColumn(null).withTitle(vm.translateFilter('payment.fees')).renderWith(
                function (data, type) {
                    if (data.paymentDetails.length > 0) {
                        var fee = 0;
                        for (var i = 0; i < data.paymentDetails.length; i++) {
                            fee += data.paymentDetails[i].fee;
                        }
                        return fee.toFixed(2);
                    }
                    else {
                        return '';
                    }
                }),
            DTColumnBuilder.newColumn(null).withTitle(vm.translateFilter('transactionRequest.paymentChannel')).renderWith(
                function (data, type) {
                    if (data.paymentChannel) {
                        return $filter('localizeString')(data.paymentChannel);
                    }
                    else {
                        return '';
                    }
                }),
            DTColumnBuilder.newColumn('pun').withTitle(vm.translateFilter('payment.PUN')),
            DTColumnBuilder.newColumn(null).withTitle(vm.translateFilter('transactionResponse.urn')).renderWith(
                function (data, type) {
                    if (data.purchaseCheckouts.length > 0) {
                        var urn = '';
                        for (var i = 0; i < data.purchaseCheckouts.length; i++) {
                            if (data.purchaseCheckouts[i].purchaseResponses.length > 0) {
                                for (var j = 0; j < data.purchaseCheckouts[i].purchaseResponses.length; j++) {
                                    if (data.purchaseCheckouts[i].purchaseResponses[j].checkoutStatus == 'CLOSED') {
                                        urn = data.purchaseCheckouts[i].purchaseResponses[j].urn;
                                    }
                                }                                
                            }                                                       
                        }
                        return urn;
                    }
                    else {
                        return '';
                    }
                }),
            DTColumnBuilder.newColumn(null).withTitle(vm.translateFilter('general.actions')).notSortable().renderWith(actionsHtml)];

        function serverData(sSource, aoData, fnCallback, oSettings) {
            var draw = aoData[0].value;
            var order = aoData[2].value[0];
            var start = aoData[3].value;
            var length = aoData[4].value;
            var search = aoData[5].value;

            vm.params = {
                searchtext: (search.value === '' ? null : search.value),
                page: (start / length) + 1,
                pageSize: length,
                sortBy: (order.column === 0 ? 'Id' : aoData[1].value[order.column].data),
                sortDirection: order.dir,
                filterParams: (vm.filterParams === undefined ? null : vm.filterParams)
            };

            $http.post($rootScope.app.httpSource + 'api/Payment/GetPayments', vm.params)
                .then(function (resp) {
                    $http.get($rootScope.app.httpSource + 'api/Community/GetCommunities')
                        .then(function (response) {
                            vm.communities = response.data;
                            vm.allPayments = resp.data.content;
                            var records = {
                                'draw': draw,
                                'recordsTotal': resp.data.totalRecords,
                                'recordsFiltered': resp.data.totalRecords,
                                'data': resp.data.content
                            };
                            fnCallback(records);
                        });
                },
                    function (response) {
                        var records = {
                            'draw': draw,
                            'recordsTotal': 0,
                            'recordsFiltered': 0,
                            'data': []
                        };
                        fnCallback(records);
                    });
        }

        function createdRow(row, data, dataIndex) {
            $compile(angular.element(row).contents())($scope);
        }

        function rowCallback(tabRow, data, dataIndex) { }

        function renderer(api, rowIdx, columns) {
            var data = $.map(columns, function (col, i) {
                return col.hidden ?
                    '<li data-dtr-index="' + col.columnIndex + '" data-dt-row="' + col.rowIndex + '" data-dt-column="' + col.columnIndex + '">' +
                    '<span class="dtr-title">' +
                    col.title +
                    '</span> ' +
                    '<span class="dtr-data">' +
                    col.data +
                    '</span>' +
                    '</li>' :
                    '';
            }).join('');
            return data ?
                $compile(angular.element($('<ul data-dtr-index="' + rowIdx + '"/>').append(data)))($scope) :
                false;
        }

        vm.isObjectEmpty = function (card) {
            if (card) {
                return Object.keys(card).length === 0;
            }
            else {
                return true;
            }
        };

        vm.filter = function ($scope) {
            vm.filterParams = $scope.filterParams;
            vm.dtApplicationInstance.DataTable.draw();
        };

        vm.userFilterData = function (id) {
            vm.filterParams = {};
            vm.filterParams.userFilterId = id;
            vm.dtApplicationInstance.DataTable.draw();
        };

        vm.removeFilter = function ($scope) {
            $scope.filterParams = {};
            vm.filterParams = $scope.filterParams;
            vm.dtApplicationInstance.DataTable.draw();
        };
    }
})();