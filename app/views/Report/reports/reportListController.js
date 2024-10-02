/**=========================================================
 * Module: DashboardController.js
 =========================================================*/

(function () {
    'use strict';

    angular
        .module('eServices')
        .controller('ReportListController', ReportListController);

    ReportListController.$inject = ['$rootScope', '$scope', 'UserProfile', '$filter', 'DTOptionsBuilder', 'DTColumnBuilder', '$compile', '$http', '$uibModal', '$state', 'SweetAlert', '$window'];
    function ReportListController($rootScope, $scope, UserProfile, $filter, DTOptionsBuilder, DTColumnBuilder, $compile, $http, $uibModal, $state, SweetAlert, $window) {

        var vm = this;
        vm.isBusy = false;
        vm.user = UserProfile.getProfile();
        vm.filter = {};

        vm.filter.fromCreatedOn = new Date(2017, 6, 30);
        vm.filter.toCreatedOn = new Date();

        vm.translateFilter = $filter('translate');

        vm.ReportsData = [];
        //vm.UserGeneratedReportsPath = $rootScope.app.httpSource + '/Reports/UserGeneratedReports/';
        vm.UserGeneratedReportsPath = $rootScope.app.httpSource + '/UserGeneratedReports/';

        vm.selectedReportGroup = {};
        vm.reportGroups = [];
        vm.GetReportGroups = function () {
            $http.get($rootScope.app.httpSource + 'api/Report/GetReportGroups/').then(function (res) {
                vm.reportGroups = res.data;

                if (vm.reportGroups.length > 0) {
                    vm.selectedReportGroup = vm.reportGroups[0];
                    vm.GetReportDefinitions();
                }

            }, function (err) { });
        };


        vm.newReportOpened = false;
        vm.newReport = function (reportId) {

            if (!vm.newReportOpened) {
                var modalInstance = $uibModal.open({
                    templateUrl: 'app/views/Report/reports/newReport.html',
                    controller: 'newReportController',
                    size: 'lg',
                    resolve: {
                        report: function () {
                            return $filter('filter')(vm.ReportsData, { id: reportId }, true)[0];
                        }
                    }
                });

                modalInstance.result.then(function (result) {
                    vm.isBusy = true;
                    $http.post($rootScope.app.httpSource + 'api/Report/savereport/', { reportid: result.id, parameters: result.parameters }).then(
                        function (resresult) {
                            $http.get($rootScope.app.httpSource + 'api/Report/GetReportInstances/' + result.id).then(function (r2) {
                                result.reportInstance = r2.data;
                                vm.isBusy = false;

                            }, function (err2) {
                                vm.isBusy = false;
                            });
                        },
                        function (err) {
                            vm.isBusy = false;

                        });
                    vm.newReportOpened = false;
                }, function () {
                });
                modalInstance.result.finally(function (selectedItem) {
                    vm.newReportOpened = false;
                });
            }

            vm.newReportOpened = true;

        };

        vm.refreshReport = function (report) {
            vm.isBusy = true;
            $http.get($rootScope.app.httpSource + 'api/Report/GetReportInstances/' + report.id).then(function (r2) {
                report.reportInstance = r2.data;
                vm.isBusy = false;
            }, function (err2) {
                vm.isBusy = false;
            });
        };

        vm.GetReportDefinitions = function () {
            vm.isBusy = true;
            $http.get($rootScope.app.httpSource + 'api/Report/GetReportDefinitions/' + vm.selectedReportGroup.id)
                .then(function (rep) {
                    vm.ReportsData = rep.data;
                    vm.isBusy = false;
                }, function (err) {
                    vm.isBusy = false;
                });
        };


        vm.init = function () {
            vm.GetReportGroups();

        };

    }
})();