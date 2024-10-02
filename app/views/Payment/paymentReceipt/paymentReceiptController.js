/**=========================================================
 * Module: LoginController.js
 * Controller for the Chat APP 
 =========================================================*/

(function () {
    'use strict';

    angular
        .module('eServices')
        .controller('PaymentReceiptController', PaymentReceiptController);
    /* @ngInject */
    PaymentReceiptController.$inject = ['$rootScope', '$scope', '$http', '$stateParams', '$state', '$uibModal', 'UserProfile', '$filter', 'DTOptionsBuilder', 'DTColumnBuilder', '$compile', '$window','FileUploader'];

    function PaymentReceiptController($rootScope, $scope, $http, $stateParams, $state, $uibModal, UserProfile, $filter, DTOptionsBuilder, DTColumnBuilder, $compile, $window, FileUploader) {
        var vm = this;

        vm.user = UserProfile.getProfile();
        $http.get($rootScope.app.httpSource + 'api/Payment/GetPaymentReceipt?PUN=' + $state.params.pun)
            .then(function (response) {
                vm.paymentReceipt = response.data;
                setTimeout(function () { printReceipt() }, 2000);
            });
        $scope.translateFilter = $filter('translate');
        $scope.localizeFilter = $filter('localizeString'); 
        $scope.printDate = new Date();
        $scope.dtColumns = [
            DTColumnBuilder.newColumn('description').withTitle($scope.translateFilter('receipt.description')).notSortable(),
            DTColumnBuilder.newColumn('amount').withTitle($scope.translateFilter('receipt.amount')).notSortable(),
            DTColumnBuilder.newColumn('description').withTitle($scope.translateFilter('receipt.descriptionAr')).notSortable()];


        function printReceipt() {
            var data;
            $window.scrollTo(0, 0);
            html2canvas(document.getElementsByClassName('paymentReceipt')).then(function (canvas) {
                data = canvas.toDataURL({
                    format: 'jpeg',
                    quality: 1,
                    height: 850,
                    width: 600,
                    letterRendering: true
                });
                var docDefinition = {
                    pageSize: 'A4',
                    pageMargins: [20, 40, 20, 40],
                    content: [{
                        image: data,
                        width: 550
                    }]
                };
                pdfMake.createPdf(docDefinition).open();
                pdfMake.createPdf(docDefinition).getDataUrl(function(dataURL) {
                    var pdfdata = dataURItoBlob(dataURL); // Convert to UTF-8...        
                    var dummy = new FileUploader.FileItem(vm.paymentReceiptUploader, {});
                   // var newFile = new File(pdfdata, "testingpdf.pdf", { type: "application/pdf" })
                    dummy.file = pdfdata;
                    dummy.file.name = "Receipt.pdf";
                    dummy._file.name = "Receipt.pdf";
                    dummy._file = pdfdata;
                    dummy.isUploaded = false;
                    vm.paymentReceiptUploader.queue.push(dummy);
                    vm.paymentReceiptUploader.uploadItem(0);
                });;

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
                // setTimeout(function () { $window.close() },2000);
            });

        }
        $scope.pdfMaker = function () {
            printReceipt();
        }

        vm.uploadpaymentReceiptUrl = $rootScope.app.httpSource + 'api/Upload/UploadFile?uploadFile=PaymentReceipt';
        vm.paymentReceiptUploader = new FileUploader({
            autoUpload: true,
            disableMultipart: true,
            url: vm.uploadpaymentReceiptUrl
        });
        vm.paymentReceiptUploader.onSuccessItem = function (fileItem, response, status, headers) {
            vm.paymentReceiptCopyUrl = response.fileName;
            vm.paymentReceiptCopyUrlFullPath = response.httpPath;

        };
        vm.paymentReceiptUploader.onErrorItem = function (fileItem, response, status, headers) {
            vm.paymentReceiptCopyUrl = "";
            vm.paymentReceiptCopyUrlFullPath = "";
        };
    }
})();