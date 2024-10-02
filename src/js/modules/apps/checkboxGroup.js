/**=========================================================
 * Module: SparklinesDirective.js
 * SparkLines Mini Charts
 =========================================================*/

(function () {
    'use strict';

    angular
        .module('eServices')
        .directive('checkboxGroup', checkboxGroup);

    checkboxGroup.$inject = ['$filter'];

    function checkboxGroup($filter) {
        return {
            restrict: "A",
            scope: {
                'options': '=?',
                'item': '=?',
                'property': '=?',
                'ispermitrequired': '=?',
            },
            link: function (scope, elem, attrs) {
                // Determine initial checked boxes
                var propertyId = '';

                if (scope.property == 'photographyPurpos') {
                    propertyId = scope.property + 'eId';
                }
                else {
                    propertyId = scope.property + 'Id';
                }
                var selectedItem = $filter('filter')(scope.options, { [propertyId]: scope.item.id }, true)[0];

                if (selectedItem !== undefined) {
                    elem[0].checked = true;
                }

                // Update array on click
                elem.bind('click', function () {
                    scope.item[scope.property] = angular.copy(scope.item);
                    var index = -1;
                    scope.options.filter(function (filterItem) {
                        var propertyName = scope.property;
                        if (filterItem[propertyName].id == scope.item.id)
                        {
                            index = scope.options.indexOf(filterItem);
                        }
                    });
                    // Add if checked
                    if (elem[0].checked) {
                        if (index === -1) scope.options.push(scope.item);
                    }
                        // Remove if unchecked
                    else {
                        if (index !== -1) scope.options.splice(index, 1);
                    }
                    // Sort and update DOM display
                    scope.$apply(scope.options.sort(function (a, b) {
                        return a - b
                    }));
                });

            }

        }

    }

})();