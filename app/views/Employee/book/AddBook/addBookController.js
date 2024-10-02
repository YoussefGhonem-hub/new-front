
(function () {
    'use strict';

    angular
        .module('eServices')
        .controller('addBookController', addBookController);

    function addBookController($rootScope, $http, $scope, $uibModalInstance, book) {

        if (book == null) {
            $scope.book = {};
            //$scope.book.id = 0;
            $scope.book.bookLanguages = [];
            $scope.book.selectedLangauges = [];
        }
        $scope.ok = function () {
            $uibModalInstance.close($scope.book);
        };

        $scope.closeModal = function () {
            $uibModalInstance.dismiss();
        };

        $scope.send = function (sendSMS) {
            $uibModalInstance.close(sendSMS);
        };

        $http.get($rootScope.app.httpSource + 'api/SubjectCategory')
            .then(function (response) {
                $scope.subjects = response.data;
            });

        $http.get($rootScope.app.httpSource + 'api/Language')
            .then(function (response) {
                $scope.languages = response.data;
            });

        $scope.book.isValidISBN = true;
        $scope.onISBNChange = function () {
            setTimeout(function () {
                if ($scope.book.isbn) {
                    if ($scope.book.isbn.length > 10) {
                        $('#isbnThirteen').focus();
                    }
                    else {
                        $('#isbnTen').focus();
                    }

                    if ($scope.book.isbn.length == 10 || $scope.book.isbn.length == 13 || $scope.book.isbn.length == 0) {
                        $scope.book.isValidISBN = true;
                    }
                    else {
                        $scope.book.isValidISBN = false;
                    }
                }
                else {
                    $scope.book.isValidISBN = true;
                }
            }, 50);
        };
    }

    addBookController.$inject = ['$rootScope', '$http', '$scope', '$uibModalInstance', 'book'];
})();


