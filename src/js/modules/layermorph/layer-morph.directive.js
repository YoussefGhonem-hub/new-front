/**=========================================================
 * Module: LayerMorphDirective.js
 =========================================================*/

(function () {
    'use strict';

    angular
        .module('eServices')
        .directive('btnLayerMorph', btnLayerMorph)
        .directive('layerMorphOverlay', layerMorphOverlay)
        .directive('layerMorphClose', layerMorphClose)
        .directive('layerMorphFilter', layerMorphFilter);
    /* @ngInject */
    function btnLayerMorph(LayerMorph, $timeout) {

        return {
            restrict: 'A',
            scope: {
                btnLayer: "="
            },
            link: function (scope, element, attrs) {
                $timeout(function () {
                    init();
                }, 2000);

                function init() {
                    var queryResult = document.querySelector(attrs.target);
                    var target = angular.element(queryResult);

                    if (!target.length) {
                        console.log('LayerMorph: Wrong target ' + attrs.target);
                        return;
                    }

                    element.on('click', function () {
                        LayerMorph.open(element, target);
                    });
                }
            }
        };
    }
    btnLayerMorph.$inject = ['LayerMorph', '$timeout'];
    /* @ngInject */
    function layerMorphOverlay(LayerMorph, $document) {

        return {
            restrict: 'C',
            link: function (scope, element, attrs) {
                $document.ready(function () {
                    LayerMorph.init();
                });
            }
        };
    }
    layerMorphOverlay.$inject = ['LayerMorph', '$document'];

    /* @ngInject */
    function layerMorphClose(LayerMorph) {

        return {
            restrict: 'A',
            link: function (scope, element, attrs) {
                element.on('click', function () {
                    LayerMorph.close();
                });
            }
        };
    }
    layerMorphClose.$inject = ['LayerMorph'];

    /* @ngInject */
    function layerMorphFilter(LayerMorph) {

        return {
            restrict: 'A',
            link: function (scope, element, attrs) {
                element.on('click', function () {
                    LayerMorph.close();
                });
            }
        };
    }
    layerMorphFilter.$inject = ['LayerMorph'];

})();
