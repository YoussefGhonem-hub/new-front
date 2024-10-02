
(function () {
    'use strict';
    angular
        .module('eServices')
        .directive('isbnValidator', isbnValidator);

    isbnValidator.$inject = ['$uibModal'];

    function isbnValidator($uibModal) {
        return {
            restrict: 'E',
            scope: {
                passModel: "=ngModel"
            },
            templateUrl: '/app/views/Controls/ISBNValidator/isbnValidatorDirectiveTemplate.html',
            link: link
        };

        function link(scope, element, attrs) {
            scope.open = function (size) {
                var modalInstance = $uibModal.open({
                    templateUrl: 'app/views/Controls/ISBNValidator/BookDetails/fetchBook.html',
                    controller: 'fetchBookController',
                    backdrop: 'static',
                    size: size,
                    resolve: {
                        fetchBook: function () {
                            return scope.passModel;
                        }
                    }
                });
            };
        }
    }
})();




