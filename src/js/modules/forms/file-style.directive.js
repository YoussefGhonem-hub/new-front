/**=========================================================
 * Module: filestyle.js
 * Initializes the fielstyle plugin
 =========================================================*/
(function () {
    'use strict';

    angular
        .module('eServices')
        .directive('filestyle', filestyle);

    function filestyle() {

        controller.$inject = ['$scope', '$element', '$filter'];
        return {
            restrict: 'A',
            controller: controller
        };

        function controller($scope, $element, $filter) {
            var options = $element.data();

            // old usage support
            options.classInput = $element.data('classinput') || options.classInput;

            if (options.buttonText)
                options.buttonText = $filter('translate')(options.buttonText);

            $element.filestyle(options);
        }
    }
})();
