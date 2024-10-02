/**=========================================================
 * Module: LoginController.js
 * Controller for the Chat APP 
 =========================================================*/

(function () {
    'use strict';

    angular
        .module('eServices')
        .controller('BookController', BookController);
    /* @ngInject */
    function BookController($rootScope, $scope, $uibModalInstance, $filter, $http, book, FileUploader) {
        $scope.book = {};
        $scope.inspectionVisitBookUrl = 'api/Upload/UploadFile?uploadFile=InspectionVisitBooks';

        $scope.initCompleted = () => {
            if (book != undefined)
            {
                $scope.book = book;
                _appendImage(book.photoUrlFullPath);
            }
        }

        $scope.ok = function () {
            Quagga.offDetected();
            $uibModalInstance.close($scope.book);
        };

        $scope.closeModal = function () {
            Quagga.offDetected();
            $uibModalInstance.dismiss('cancel');
        };

        $scope.scanBook = function () {
            App.init();
            document.getElementById('captureImage').click();
        };

        $scope.onFileChanged = function (e) {
            if (e.target.files && e.target.files.length) {
                $scope.progressStatus = true;
                $scope.$apply();
                App.decode(URL.createObjectURL(e.target.files[0]));
            }
        };

        var _appendImage = (url) => {
            var img = $("<img width='270px' height='270px'/>").attr("src", url);
            $("#result_strip").append(img);
        }

        var uploadUrl = $rootScope.app.httpSource + $scope.inspectionVisitBookUrl;
        $scope.uploader = new FileUploader({
            autoUpload: true,
            url: uploadUrl
        });

        $scope.uploader.onSuccessItem = function (fileItem, response, status, headers) {
            $scope.book.photoUrl = response.fileName;
            $scope.book.photoUrlFullPath = response.httpPath;
        };

        $scope.uploader.onErrorItem = function (fileItem, response, status, headers) {
            console.log("Error -> ", response, status);
        };
        
        var App = {
            init: function () {
                App.attachListeners();
                App.state.patchSize = "medium";
            },
            attachListeners: function () {
                $(".controls input[type=file]").on("change", $scope.onFileChanged);
            },
            _accessByPath: function (obj, path, val) {
                var parts = path.split('.'),
                    depth = parts.length,
                    setter = (typeof val !== "undefined") ? true : false;

                return parts.reduce(function (o, key, i) {
                    if (setter && (i + 1) === depth) {
                        o[key] = val;
                    }
                    return key in o ? o[key] : {};
                }, obj);
            },
            _convertNameToState: function (name) {
                return name.replace("_", ".").split("-").reduce(function (result, value) {
                    return result + value.charAt(0).toUpperCase() + value.substring(1);
                });
            },
            detachListeners: function () {
                $(".controls input[type=file]").off("change");
            },
            decode: function (src) {
                var self = this,
                    config = $.extend({}, self.state, { src: src });

                Quagga.decodeSingle(config, function (result) { });
            },
            setState: function (path, value) {
                var self = this;

                if (typeof self._accessByPath(self.inputMapper, path) === "function") {
                    value = self._accessByPath(self.inputMapper, path)(value);
                }

                self._accessByPath(self.state, path, value);

                console.log(JSON.stringify(self.state));
                App.detachListeners();
                App.init();
            },
            inputMapper: {
                inputStream: {
                    size: function (value) {
                        return parseInt(value);
                    }
                },
                numOfWorkers: function (value) {
                    return parseInt(value);
                },
                decoder: {
                    readers: function (value) {
                        if (value === 'ean_extended') {
                            return [{
                                format: "ean_reader",
                                config: {
                                    supplements: [
                                        'ean_5_reader', 'ean_2_reader'
                                    ]
                                }
                            }];
                        }
                        return [{
                            format: value + "_reader",
                            config: {}
                        }];
                    }
                }
            },
            state: {
                inputStream: {
                    size: 1280,
                    singleChannel: true
                },
                locator: {
                    patchSize: "medium",
                    halfSample: true
                },
                decoder: {
                    readers: [{
                        format: "ean_reader",
                        config: {}
                    }]
                },
                locate: true,
                src: null
            }
        };

        $scope.isBookExist = (isbn) => {
            $scope.progressStatus = true;
            $scope.tempISBN = isbn;
            $http.get($rootScope.app.httpSource + 'api/Book/CheckBookExist?isbn=' + isbn)
                .then((buk) => {
                    if (angular.isObject(buk.data)) {
                        $scope.book.title = buk.data.title;
                        $scope.book.authorName = buk.data.authorName;
                        $scope.book.isApproved = buk.data.isApproved;
                        //  $scope.book.id = buk.data.id;
                        $scope.book.isbn = buk.data.isbn;
                    }
                    else {
                        $scope.book.isbn = $scope.tempISBN;
                    }
                    $scope.progressStatus = false;
                }, (error) => {
                    console.log("CheckBookExist error-> ", error);
                    $scope.progressStatus = false;
                });
        }

        function calculateRectFromArea(canvas, area) {
            var canvasWidth = canvas.width,
                canvasHeight = canvas.height,
                top = parseInt(area.top) / 100,
                right = parseInt(area.right) / 100,
                bottom = parseInt(area.bottom) / 100,
                left = parseInt(area.left) / 100;

            top *= canvasHeight;
            right = canvasWidth - canvasWidth * right;
            bottom = canvasHeight - canvasHeight * bottom;
            left *= canvasWidth;

            return {
                x: left,
                y: top,
                width: right - left,
                height: bottom - top
            };
        }

        Quagga.onProcessed(function (result) {
            var drawingCtx = Quagga.canvas.ctx.overlay,
                drawingCanvas = Quagga.canvas.dom.overlay,
                area;

            if (result) {
                if (result.boxes) {
                    drawingCtx.clearRect(0, 0, parseInt(drawingCanvas.getAttribute("width")), parseInt(drawingCanvas.getAttribute("height")));
                    result.boxes.filter(function (box) {
                        return box !== result.box;
                    }).forEach(function (box) {
                        Quagga.ImageDebug.drawPath(box, { x: 0, y: 1 }, drawingCtx, { color: "green", lineWidth: 2 });
                    });
                }

                if (result.box) {
                    Quagga.ImageDebug.drawPath(result.box, { x: 0, y: 1 }, drawingCtx, { color: "#00F", lineWidth: 8 });
                }

                if (result.codeResult && result.codeResult.code) {
                    Quagga.ImageDebug.drawPath(result.line, { x: 'x', y: 'y' }, drawingCtx, { color: 'red', lineWidth: 20 });

                    $('#result_strip').empty();
                    let base64 = drawingCanvas.toDataURL().replace(/^data:image\/(png|jpg);base64,/, '');
                    resizeImage(base64, 270, 270, 1).then(function (newImg) {
                        $("#result_strip").append(newImg);
                    });
                }
                else {
                    console.log(App.state.patchSize);
                    if (App.state.patchSize == "small") {
                        App.state.patchSize = "medium";
                        var input = document.querySelector(".controls input[type=file]");
                        if (input.files && input.files.length) {
                            App.decode(URL.createObjectURL(input.files[0]));
                        }
                    }
                    else if (App.state.patchSize == "medium") {
                        App.state.patchSize = "large";
                        var input = document.querySelector(".controls input[type=file]");
                        if (input.files && input.files.length) {
                            App.decode(URL.createObjectURL(input.files[0]));
                        }
                    }
                    else if (App.state.patchSize == "large") {
                        App.state.patchSize = "x-large";
                        var input = document.querySelector(".controls input[type=file]");
                        if (input.files && input.files.length) {
                            App.decode(URL.createObjectURL(input.files[0]));
                        }
                    }
                    else {
                        App.state.patchSize = "medium";
                        swal("Barcode is  not detected, Please try again.");
                        $scope.book = {};
                        $('#result_strip').empty();
                        $scope.progressStatus = false;
                        $scope.$apply();
                    }
                }

                if (App.state.inputStream.area) {
                    area = calculateRectFromArea(drawingCanvas, App.state.inputStream.area);
                    drawingCtx.strokeStyle = "#0F0";
                    drawingCtx.strokeRect(area.x, area.y, area.width, area.height);
                }
            }
        });

        Quagga.onDetected(function (result) {
            App.state.patchSize = "medium";
            var code = result.codeResult.code,
                $node,
                canvas = Quagga.canvas.dom.image;
            swal("Barcode Detected : " + result.codeResult.code);
            $scope.isBookExist(code);
            let base64 = canvas.toDataURL().replace(/^data:image\/(png|jpg);base64,/, '');
            resizeImage(base64, 270, 270, 2).then(function (newImg) {
                $("#result_strip").append(newImg);
            });
            $scope.progressStatus = false;
            $scope.$apply();
            Quagga.stop();
        });

        var resizeImage = (base64, width, height, type) => {
            let canvas = document.createElement("canvas");
            canvas.width = width;
            canvas.height = height;
            let context = canvas.getContext("2d");
            let deferred = $.Deferred();
            $("<img/>").attr("src", "data:image/gif;base64," + base64).load(function () {
                context.scale(width / this.width, height / this.height);
                context.drawImage(this, 0, 0);
                let img;
                if (type === 1) {
                    img = $("<img style='position:absolute;' />").attr("src", canvas.toDataURL());
                }
                else {
                    img = $("<img />").attr("src", canvas.toDataURL());
                }
                deferred.resolve(img);
            });
            return deferred.promise();
        }
    }

    BookController.$inject = ['$rootScope', '$scope', '$uibModalInstance', '$filter', '$http', 'book', 'FileUploader'];
})();