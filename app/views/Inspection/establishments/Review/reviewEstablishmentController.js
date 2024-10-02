
/**=========================================================
 * Module: ReviewVisitListController.js
 * Controller for Review Visit List
 =========================================================*/
(function () {
    'use strict';

    angular
        .module('eServices')
        .controller('ReviewEstablishmentController', ReviewEstablishmentController);

    function ReviewEstablishmentController($rootScope, $scope, $http, $stateParams, $state, $window, $uibModal, UserProfile, DTOptionsBuilder, DTColumnBuilder, $filter, $compile) {
        var vm = this;
        vm.translateFilter = $filter('translate');
        vm.establishmentHasPrevVists = true;
        vm.open = false;

        $http.get($rootScope.app.httpSource + 'api/Establishment/GetById?id=' + $state.params.id)
            .then(function (response) {
                vm.establishment = response.data;
            });
    }
    ReviewEstablishmentController.$inject = ['$rootScope', '$scope', '$http', '$stateParams', '$state', '$window', '$uibModal', 'UserProfile', 'DTOptionsBuilder',
        'DTColumnBuilder', '$filter', '$compile'];

})();