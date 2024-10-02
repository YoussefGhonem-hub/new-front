/**=========================================================
 * Module: TooltipConfig.js
 =========================================================*/

(function() {
    'use strict';

    angular
        .module('eServices')
        .config(tooltipConfig);
    /* @ngInject */
    function tooltipConfig($tooltipProvider) {

      $tooltipProvider.options({
        appendToBody: true
      });

    }
    tooltipConfig.$inject = ['$tooltipProvider'];

})();
