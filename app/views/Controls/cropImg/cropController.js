(function () {
    'use strict';

    angular.module('eServices')
    .controller('CropController', CropController);


    function CropController($rootScope, $http, $scope, $uibModalInstance, $filter, $timeout, FileUploader) {

        $scope.reset = function () {
            $scope.myImage = '';
            $scope.myCroppedImage = '';
            $scope.imgcropType = 'square';
            $scope.showRequiredError = false;
        };

        $scope.reset();

        var handleFileSelect = function (evt) {
            var file = evt.currentTarget.files[0];
            var reader = new FileReader();
            reader.onload = function (evt) {
                $scope.$apply(function ($scope) {
                    $scope.myImage = evt.target.result;
                });
            };
            if (file)
                reader.readAsDataURL(file);
        };

        $timeout(function () { angular.element(document.querySelector('#fileInput')).on('change', handleFileSelect); }, 500);

        $scope.ok = function () {
            if (!$scope.myCroppedImage.length || !$scope.myImage.length) {
                $scope.showRequiredError = true;
                return;
            }
            $scope.showRequiredError = false;
            $scope.uploadUrl = $rootScope.app.httpSource + 'api/Upload/UploadFile?uploadFile=ProfilePersonalPhotoPath';
            $scope.profileImageUploader = new FileUploader({
                autoUpload: true,
                disableMultipart: true,
                url: $scope.uploadUrl
            });
            $scope.profileImageUploader.onSuccessItem = function (fileItem, response, status, headers) {
                $scope.photoUrl = response.fileName;
                $scope.photoUrlFullPath = response.httpPath;
                $uibModalInstance.close($scope);
            };
            var imagedata = dataURItoBlob($scope.myCroppedImage); // Convert to UTF-8...        
            var dummy = new FileUploader.FileItem($scope.profileImageUploader, {});
            // var newFile = new File(pdfdata, "testingpdf.pdf", { type: "application/pdf" })
            dummy.file = imagedata;
            dummy.file.name = "ProfileImage.png";
            dummy._file.name = "ProfileImage.png";
            dummy._file = imagedata;
            dummy.isUploaded = false;
            $scope.profileImageUploader.queue.push(dummy);
            $scope.profileImageUploader.uploadItem(0);
        };

        function dataURItoBlob(dataURI) {
            // convert base64 to raw binary data held in a string
            // doesn't handle URLEncoded DataURIs - see SO answer #6850276 for code that does this
            var byteString = atob(dataURI.split(',')[1]);

            // separate out the mime component
            var mimeString = dataURI.split(',')[0].split(':')[1].split(';')[0];

            // write the bytes of the string to an ArrayBuffer
            var ab = new ArrayBuffer(byteString.length);
            var ia = new Uint8Array(ab);
            for (var i = 0; i < byteString.length; i++) {
                ia[i] = byteString.charCodeAt(i);
            }

            //New Code
            return new Blob([ab], { type: mimeString });
        }
        $scope.cancel = function () {
            $uibModalInstance.dismiss('cancel');
        };

        CropController.$inject = ['$rootScope', '$http', '$scope', '$uibModalInstance', '$filter', '$timeout', 'FileUploader'];
    }
})();