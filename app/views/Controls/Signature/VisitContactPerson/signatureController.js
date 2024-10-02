
angular.module('eServices').controller('signatureController', signatureController);
signatureController.$inject = ['$scope', '$http', '$modalInstance', '$uibModalInstance', 'contactPersonSign', "$rootScope"];

function signatureController($scope, $http, $modalInstance, $uibModalInstance, contactPersonSign, $rootScope) {

    $scope.closeModal = function () {
        var signature = $scope.accept();
        var fileObj = {};
        fileObj.fileLocation = 'Signatures';
        fileObj.base64 = signature.dataUrl;

        $http.post($rootScope.app.httpSource + 'api/Upload/UploadBase64', fileObj)
            .then(function (response) {
                contactPersonSignObj = {};
                contactPersonSignObj.filename = response.data.fileName;
                contactPersonSignObj.filepath = response.data.httpPath;

                $uibModalInstance.close(contactPersonSignObj);
            },
            function (response) {
                $uibModalInstance.close(contactPersonSign);
                $uibModalInstance.dismiss('cancel');
            });
    };

    $scope.boundingBox = {
        width: 700,
        height: 300
    };

};

