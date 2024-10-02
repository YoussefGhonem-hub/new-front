
(function () {
    'use strict';

    angular
        .module('eServices')
        .directive('signature', signature)

    signature.$inject = ['$uibModal'];

    function signature($uibModal) {
        return {
            restrict: 'E',
            scope: {
                passModel: "=ngModel",
                signatureFullUrl: "=signatureFullUrl"
            },
            templateUrl: '/app/views/Controls/Signature/signatureDirectiveTemplate.html',
            link: link
        };

        function link(scope, element, attrs) {
            scope.open = function (size) {
                var modalInstance = $uibModal.open({
                    templateUrl: 'app/views/Controls/Signature/VisitContactPerson/signature.html',
                    controller: 'signatureController',
                    backdrop: 'static',
                    size: size,
                    resolve: {
                        contactPersonSign: function () {
                            return null;
                        }
                    }
                });
                modalInstance.result.then(function (contactPersonSign) {
                    scope.passModel = contactPersonSign.filename;
                    scope.signatureFullUrl = contactPersonSign.filepath;
                }, function () {
                    //state.text('Modal dismissed with Cancel status');
                });
            };

        }
    }
})();




