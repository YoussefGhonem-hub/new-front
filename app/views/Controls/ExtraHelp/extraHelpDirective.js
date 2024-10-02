
(function () {
    'use strict';
    angular
        .module('eServices')
        .directive('extraHelp', extraHelp)

    extraHelp.$inject = ['$compile', '$filter'];
    function extraHelp($compile, $filter) {
        return {
            link: function (scope, element, attributes) {
                var translate = $filter('translate');
                var el = angular.element('<div><div style="width:3%; display:inline-block; vertical-align:top;"><i class="fa fa-info-circle" aria-hidden="true" style="padding-top:5px"></i></div><div style="width:95%; display:inline-block">' + translate(attributes.extraHelp) +'</div></div>');
                $compile(el)(scope);

                if(element[0].nodeName == "DIV"){
                    element[0].after(el[0]);
                }
                else{
                    element[0].parentElement.append(el[0]);
                }
            }
        }
    }
})();
