/**=========================================================
 * Module: LoginController.js
 * Controller for the Chat APP 
 =========================================================*/

(function () {
    'use strict';

    angular
        .module('eServices')
        .controller('ReviewRadioTvBroadcastingController', ReviewRadioTvBroadcastingController);

    function ReviewRadioTvBroadcastingController($rootScope, $scope, $http, $stateParams, $state,  $window, $uibModal, UserProfile, DTOptionsBuilder, DTColumnBuilder, $filter, $compile) {
        var vm = this;
        vm.translateFilter = $filter('translate');
        vm.dtPartnerInstance = {};
        vm.applicationOpen = true;

        vm.Init = function () {
            vm.serviceFeesObj = { serviceId: 8, serviceFee: [] };
            vm.user = UserProfile.getProfile();

            vm.createdRow = function (row, data, dataIndex) {
                // Recompiling so we can bind Angular directive to the DT
                $compile(angular.element(row).contents())($scope);
            }

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
        };

        //Get the details of the submitted Form to edit
        $http.get($rootScope.app.httpSource + 'api/MediaLicense/GetById?id=' + $state.params.id)
          .then(function (response) {
              vm.mediaLicenses = response.data;
              vm.Init();
          });
    }

    ReviewRadioTvBroadcastingController.$inject = ['$rootScope', '$scope', '$http', '$stateParams', '$state',   '$window', '$uibModal', 'UserProfile', 'DTOptionsBuilder',
        'DTColumnBuilder', '$filter', '$compile'];

})();