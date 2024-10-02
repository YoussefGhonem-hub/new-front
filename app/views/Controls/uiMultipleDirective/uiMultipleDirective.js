(function () {
    'use strict';

    angular
        .module('eServices')
        .directive('uiMultiple', Directive);

    function Directive($rootScope) {
        return {
            replace: false,
            scope: {
                'frommodel': '=',
                'tomodel': '=',
                'item': '=',
                'editmode': '='
            },
            link: link
        };
        function link(scope, element, attrs) {
            var unwatch = scope.$watch('editmode', function (newVal, oldVal) {
                if (newVal) {
                    if (scope.editmode) {
                        scope.frommodel = [];
                        for (var id in scope.tomodel) {
                            scope.frommodel.push(scope.tomodel[id][scope.item]);
                        }
                    }
                    init();
                    unwatch();
                }
                else if(newVal !==undefined &&  !newVal){
                    init();
                    unwatch();
                }
            });

            function init() {
                scope.$watch('frommodel.length', function (newVal, oldVal) {
                    if (!scope.editmode) {
                        scope.tomodel = [];
                    }
                    for (var id in scope.frommodel) {
                        var langexist = scope.tomodel.filter(function (filterItem) {
                            return filterItem[scope.item].id == scope.frommodel[id].id;
                        });
                        if (langexist.length == 0) {
                            var object = {};
                            eval("object." + [scope.item][0] + " = 'null' ");
                            object[[scope.item]] = scope.frommodel[id];
                            scope.tomodel.push(object);
                        }
                    }
                });
            }
        }
        }
    
})();