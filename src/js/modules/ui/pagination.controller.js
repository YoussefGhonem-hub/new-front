/**=========================================================
 * Module: DemoPaginationController
 * Provides a simple demo for pagination
 =========================================================*/
(function() {
    'use strict';

    angular
        .module('eServices')
        .controller('PaginationDemoController', PaginationDemoController);
    /* @ngInject */
    function PaginationDemoController($scope) {

      $scope.totalItems = 64;
      $scope.currentPage = 4;

      $scope.setPage = function (pageNo) {
        $scope.currentPage = pageNo;
      };

      $scope.pageChanged = function() {
        console.log('Page changed to: ' + $scope.currentPage);
      };

      $scope.maxSize = 5;
      $scope.bigTotalItems = 175;
      $scope.bigCurrentPage = 1;
    }
    PaginationDemoController.$inject = ['$scope'];
})();
