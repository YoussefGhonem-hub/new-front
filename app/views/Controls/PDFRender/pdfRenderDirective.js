
(function () {
    'use strict';

    angular
        .module('eServices')
        .directive('pdfRender', pdfRender)

    pdfRender.$inject = ['$uibModal'];

    var httpurl = "";
    $.ajax({
        url: httpurl,
        type: 'GET',
        headers: {
            "Access-Control-Allow-Origin": "http://localhost:1113",
        },
        success: function (data) {

        }

    });

    function pdfRender($uibModal) {
        return {
            restrict: 'E',
            scope: {
                passModel: "=src"
            },
            templateUrl: '/app/views/Controls/PDFRender/pdfRenderDirectiveTemplate.html',
            link: link
        };

        function link(scope, element, attrs) {
            scope.open = function (size) {
                var modalInstance = $uibModal.open({
                    templateUrl: 'app/views/Controls/PDFRender/MediaLicenseCertificate/certificate.html',
                    controller: 'certificateController',
                    backdrop: 'static',
                    size: size,
                    resolve: {
                        certificateUrl: function () {
                            return scope.passModel;
                        }
                    }
                });
            };

        }
    }
})();




