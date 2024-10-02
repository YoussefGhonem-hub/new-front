
angular.module('eServices').controller('fetchBookController', fetchBookController);
fetchBookController.$inject = ['$rootScope', '$scope', '$http', '$uibModalInstance', 'fetchBook'];

function fetchBookController($rootScope, $scope, $http, $uibModalInstance, fetchBook) {
    var isbn = fetchBook;
    $scope.ISBN = fetchBook;
    $scope.NoData = "--";
    $scope.loading = true;

    $scope.closeModal = function () {
        $uibModalInstance.dismiss('cancel');
    };

    //Fetch Book details by ISBN - Google API
    var googleapi = 'https://www.googleapis.com/books/v1/volumes?q=isbn:' + isbn + '&jscmd=data&format=json&callback=JSON_CALLBACK';
    $http.jsonp(googleapi)
        .then(function (response) {
            $scope.loading = false;
            //console.log('Google Book details==', response.data);
            $scope.BookDetails = response.data;

            ///Good Read Books API
            if ($scope.BookDetails.totalItems == 0) {
                $scope.loading = true;
                $http.get($rootScope.app.httpSource + 'api/Book/GetByISBN?isbn=' + isbn)
                    .then(function (resp) {
                        $scope.loading = false;
                        $scope.GoodReadBook = resp.data;
                        if ($scope.GoodReadBook) {
                            $scope.GoodRead = $scope.GoodReadBook.GoodreadsResponse.search.results;
                            var checkOpenLibrary = ($scope.GoodRead.length == 0 ? true : false);
                            //console.log('Good Read Book===', $scope.GoodRead.length, $scope.GoodReadBook);
                        }

                        ///Open Library API
                        if (checkOpenLibrary || $scope.GoodReadBook == null) {
                            $scope.loading = true;
                            var openLibraryUrl = 'https://openlibrary.org/api/books?bibkeys=ISBN:' + isbn + '&jscmd=data&format=json&callback=JSON_CALLBACK';
                            $http.jsonp(openLibraryUrl)
                                .then(function (result) {
                                    $scope.loading = false;
                                    $scope.openBookLibraryBook = result.data[Object.keys(result.data)[0]];
                                    //console.log('Open Library==', $scope.openBookLibraryBook);
                                });
                        }
                    });
            }
        });
}

