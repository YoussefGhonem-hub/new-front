(function () {
    'use strict';
    angular
        .module('eServices')
        .controller('visitBookController', visitBookController);

    visitBookController.$inject = ['$scope', '$state', '$http','$rootScope'];

    function visitBookController($scope, $state, $http, $rootScope) {
        var vm = this;
        vm.visitId = $state.params.id;
        //Get Inspection task details
        //$http.get($rootScope.app.httpSource + 'api/Visit/GetVisitById?visitId=' + $state.params.id)
        //    .then((response) => {
        //        vm.visitId = response.data;
        //    }, (error) => {
        //        console.log("Error -> ", error);
        //    });
    }
})();



