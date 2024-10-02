/**=========================================================
 * Module: CoreController.js
 =========================================================*/

(function () {
    'use strict';

    angular
        .module('eServices')
        .controller('CoreController', CoreController);

    /* @ngInject */
    function CoreController($rootScope, $filter) {
        // Get title for each page
        $rootScope.pageTitle = function () {
            if ($rootScope.app.layout.isRTL) {
                return $filter('localizeString')($rootScope.app) + ' - ' + 'مجلس الإمارات للإعلام';
            }
            else {
                return $filter('localizeString')($rootScope.app) + ' - ' + 'UAE Media Council';
            }
           
        };

        // Cancel events from templates
        // ----------------------------------- 
        $rootScope.cancel = function ($event) {
            $event.preventDefault();
            $event.stopPropagation();
        };
    }

    CoreController.$inject = ['$rootScope', '$filter'];
})();
