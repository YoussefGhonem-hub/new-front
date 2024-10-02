(function () {
    'use strict';
    angular
        .module('eServices').directive("fileread", fileread);

    fileread.$inject = ['$http', '$rootScope'];

    function fileread($http, $rootScope) {
        return {
            scope: {
                opts: '='
            },
            link: function ($scope, $elm, $attrs) {

                $http.get($rootScope.app.httpSource + 'api/SubjectCategory')
                    .then(function (response) {
                        $scope.subjects = response.data;
                    });

                $http.get($rootScope.app.httpSource + 'api/Language')
                    .then(function (response) {
                        $scope.languages = response.data;
                    });

                $elm.on('change', function (changeEvent) {
                    var reader = new FileReader();

                    reader.onload = function (evt) {
                        $scope.$apply(function () {
                            var data = evt.target.result;

                            var workbook = XLSX.read(data, { type: 'binary' });

                            var headerNames = XLSX.utils.sheet_to_json(
                                workbook.Sheets[workbook.SheetNames[0]],
                                { header: 1 }
                            )[0];

                            var data = XLSX.utils.sheet_to_json(workbook.Sheets[workbook.SheetNames[0]]);

                            for (var i = 0; i < data.length; i++) {
                                data[i].subjects = $scope.subjects;
                                data[i].languages = $scope.languages;
                                data[i].No = i + 1;
                            }

                            $scope.opts.data = data;

                            $elm.val(null);
                        });
                    };

                    reader.readAsBinaryString(changeEvent.target.files[0]);
                });
            }
        }
    }
})();