/**=========================================================
 * Module: uploadingFiles
 * Reuse cases of uploading files
 =========================================================*/

(function () {
    'use strict';

    angular
        .module('eServices')
        .directive('uploadingFiles', uploadingFiles)

    uploadingFiles.$inject = ['FileUploader', '$rootScope', '$http', '$filter', '$window', 'browser'];

    function uploadingFiles(FileUploader, $rootScope, $http, $filter, $window, browser) {
        return {
            replace: false,
            scope: {
                'copyurl': "=",
                'copyurlfullpath': '=',
                'url': '=',
                'maxsize': '=?',
                'isrequired': '=?',
                'ispermit': '=?'
            },
            templateUrl: '/app/views/Controls/UploadingFilesDirective/UploadingFilesDirectiveTemplate.html',
            link: link
        };

        function link(scope, element, attrs) {
            var unwatch = scope.$watch('url', function (newVal, oldVal) {
                if (newVal) {
                    init();
                    // remove the watcher
                    //unwatch();
                }
                else {

                    // ------------------------------------
                    // Model 
                    // ------------------------------------
                }
            });

            function init() {
                if (scope.maxsize == undefined) {
                    scope.maxsize = 4194304;
                }
                
                if (scope.copyurl) {
                    switch (scope.copyurl.split('.')[1].toLowerCase()) {
                        case "jpg":
                        case "png":
                        case "jpeg":
                            scope.fileExtension = "fa fa-2x fa-file-image-o";
                            break;

                        case "pdf":
                            scope.fileExtension = "fa fa-2x fa-file-pdf-o";
                            break;
                    }
                }

                var uploadUrl = $rootScope.app.httpSource + scope.url;

                scope.uploader = new FileUploader({
                    autoUpload: true,
                    url: uploadUrl
                });

                scope.uploader.onSuccessItem = function (fileItem, response, status, headers) {
                    scope.copyurl = response.fileName;
                    scope.copyurlfullpath = response.httpPath;
                    scope.$apply();
                };

                scope.uploader.onErrorItem = function (fileItem, response, status, headers) {
                    scope.copyurl = "";
                    scope.copyurlfullpath = "";
                    scope.$apply();
                };

                scope.uploader.onAfterAddingFile = function (fileItem, response, status, headers) {
                    if (fileItem.file.type.toLowerCase() !== "image/png" && fileItem.file.type.toLowerCase() !== "image/jpeg" && fileItem.file.type.toLowerCase() !== "application/pdf") {
                        fileItem.remove();
                        scope.incorrectType = true;
                    }
                    else {
                        scope.incorrectType = false;
                    }
                    if (fileItem.file.size > scope.maxsize) {
                        fileItem.remove();
                        scope.incorrectSize = true;
                    }
                    else {
                        scope.incorrectSize = false;
                    }
                    switch (fileItem.file.name.split('.')[1].toLowerCase()) {                       
                        case "jpg":
                        case "png":
                        case "jpeg":
                            scope.fileExtension = "fa fa-2x fa-file-image-o";
                            break;

                        case "pdf":
                            scope.fileExtension = "fa fa-2x fa-file-pdf-o";
                            break;
                    }
                };

                scope.uploadAgain = function () {
                    delete scope.copyurlfullpath;
                    scope.uploader.queue.pop();
                }

                function makename() {
                    var text = "";
                    var possible = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";

                    for (var i = 0; i < 5; i++)
                        text += possible.charAt(Math.floor(Math.random() * possible.length));

                    scope.name = text;
                }
                makename();

                //--------------------------------------
            }
        }
    }
})();