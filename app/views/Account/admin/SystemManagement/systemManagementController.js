(function () {
    'use strict';
    angular
        .module('eServices')
        .controller('systemManagementController', systemManagementController)
    systemManagementController.$inject = ['$http'];

    function systemManagementController($http) {
        var vm = this;

        $(document).ready(function () {
            setTimeout(function () {
                $(".tab-content > .tab-pane:nth-child(1) > div:nth-child(1)").css("display", "inline-block");
            }, 1000);
        });
    }

})();