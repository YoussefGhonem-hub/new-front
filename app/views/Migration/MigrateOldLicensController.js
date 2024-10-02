/**=========================================================
 * Module: LoginController.js
 * Controller for the Chat APP 
 =========================================================*/

(function () {
    'use strict';

    angular
        .module('eServices')
        .controller('MigrateOldLicensController', MigrateOldLicensController);

    MigrateOldLicensController.$inject = ['$rootScope', '$scope', 'UserProfile', '$filter', 'DTOptionsBuilder', 'DTColumnBuilder', '$compile', '$http', '$uibModal', '$state', 'SweetAlert', '$window'];
    function MigrateOldLicensController($rootScope, $scope, UserProfile, $filter, DTOptionsBuilder, DTColumnBuilder, $compile, $http, $uibModal, $state, SweetAlert, $window) {
        var vm = this;
        $scope.cuurentstate = {};
        $scope.isBusy = false;

        vm.QueryParam = { email: '' };

        vm.queryresponse = null;
        vm.economicActivities = new Array();
        vm.selectActivities = new Array();
        vm.selectedEstablishment = null;
        vm.migrationResponse = null;
        vm.undomigrationResponse = null;
        vm.migratedEconomicActivities = null;





        $http.get($rootScope.app.httpSource + 'api/EconomicActivity')
            .then(function (response) {
                vm.economicActivities = response.data;
            });


        $scope.queryCurrentstate = function () {
            vm.queryresponse = null;
            vm.selectActivities = new Array();
            vm.selectedEstablishment = null;
            vm.migrationResponse = null;
            vm.undomigrationResponse = null;
            vm.migratedEconomicActivities = null;
            vm.selectedexpiryoption = null;



            $http.post($rootScope.app.httpSource + 'api/migration/Getcurrentstate', vm.QueryParam)
                .then(function (response) {
                    vm.queryresponse = response.data;
                    vm.migratedEconomicActivities = vm.queryresponse.migratedEconomicActivities;
                    vm.selectedexpiryoption = vm.queryresponse.originalExpiryOption;

                    if (vm.queryresponse.defaultMappingActivitieList != null) {
                        for (var i = 0; i <= vm.queryresponse.defaultMappingActivitieList.length - 1; i++) {
                            var itm = vm.economicActivities.filter((x) => x.id === vm.queryresponse.defaultMappingActivitieList[i])[0];
                            var existsItems = vm.selectActivities.filter(function (x) { return( x.id == itm.id) });
                            if (existsItems.length < 1) {
                                vm.selectActivities.push(itm);
                            }
                        }
                    }

                    if (vm.queryresponse.accountEstablishments != null) {
                        vm.selectedEstablishment = vm.queryresponse.accountEstablishments[0];
                    }

                    $('#tabtabsmain').click();
                });
        };




        $scope.showQuery = function () {
            vm.migrationResponse = null;
            vm.queryresponse = null;
            vm.selectedEstablishment = null;
            vm.undomigrationResponse = null;
            vm.migratedEconomicActivities = null;


        }

        $scope.migrateLicens = function () {

            $scope.isBusy = true;
            var migrateLicensRequest = {};
            migrateLicensRequest.email = vm.queryresponse.email;
            migrateLicensRequest.oldlicenseid = vm.queryresponse.oldlicenseid;
            migrateLicensRequest.selectActivities = vm.selectActivities;
            migrateLicensRequest.selectedEstablishmentIdID = vm.selectedEstablishment.id;
            migrateLicensRequest.expiryoptionmigratetype = vm.selectedexpiryoption.migrateType;

            $http.post($rootScope.app.httpSource + 'api/migration/migrateLicens', migrateLicensRequest)
                .then(function (response) {
                    vm.queryresponse = null;
                    vm.migrationResponse = response.data;
                });
        };


        $scope.undomigrateLicens = function () {

            $scope.isBusy = true;
            var migrateLicensRequest = {};
            migrateLicensRequest.email = vm.queryresponse.email;
            migrateLicensRequest.oldlicenseid = vm.queryresponse.oldlicenseid;

            $http.post($rootScope.app.httpSource + 'api/migration/undoMigrateLicens', migrateLicensRequest)
                .then(function (response) {
                    //vm.queryresponse = null;
                    vm.undomigrationResponse = response.data;
                    if (vm.undomigrationResponse.eRRORMESSAGE == '') {
                        $scope.queryCurrentstate();
                    }
                });
        };

        $scope.printCertificate = function () {
            $scope.isBusy = true;
            $http.get($rootScope.app.httpSource + 'api/Application/ReCreateCertificate?id=' + vm.queryresponse.migratedapplicationid)
                .then(function (response) {
                    $scope.isBusy = false;

                });
        };



    }
})();