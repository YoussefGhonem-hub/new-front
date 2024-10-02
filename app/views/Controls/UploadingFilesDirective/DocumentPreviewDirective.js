/**=========================================================
 * Module: documentPreview
 * Reuse cases of uploading files
 =========================================================*/



(function () {
    'use strict';

    angular
        .module('eServices')
        .service('documentPreviewService', documentPreviewService);


    function documentPreviewService($http, $rootScope) {

        var Service = this;
        Service.configList = [];

        Service.configList =
            [
            { id: 1, entity: 'Establishment', type: 'TradeLicense', descriptionProperty: 'nameAr', ulrProperty: 'licenseCopyUrlFullPath', translateTitle: 'completeProfile.UploadLicenseCopy', code: 'Establishment-TradeLicense', urlDocument:'licenseCopyUrl' },
            { id: 2, entity: 'Establishment', type: 'TenancyContract', descriptionProperty: 'nameAr', ulrProperty: 'tenancyContractCopyUrlFullPath', translateTitle: 'completeProfile.UploadTenancyContract', code: 'Establishment-TenancyContract', urlDocument: 'tenancyContractCopyUrl' },
            { id: 3, entity: 'Establishment', type: 'MemorandumOfAssociation', descriptionProperty: 'nameAr', ulrProperty: 'memorandumOfAssociationCopyUrlFullPath', translateTitle: 'completeProfile.MemorandumOfAssociation', code: 'Establishment-MemorandumOfAssociation', urlDocument: 'memorandumOfAssociationCopyUrl'},
            { id: 4, entity: 'Establishment', type: 'PowerOfAttorney', descriptionProperty: 'nameAr', ulrProperty: 'powerOfAttorneyCopyUrlFullPath', translateTitle: 'completeProfile.PowerOfAttorney', code: 'Establishment-PowerOfAttorney', urlDocument: 'powerOfAttorneyCopyUrl'},
            { id: 5, entity: 'Establishment', type: 'Statement', descriptionProperty: 'nameAr', ulrProperty: 'statementCopyUrlFullPath', translateTitle: 'completeProfile.Statement', code: 'Establishment-Statement', urlDocument: 'statementCopyUrl'}
            ];


        Service.loadConfigList = function (callback) {
            $http.get($rootScope.app.httpSource + 'api/RejectedDocumentType')
                .then(function (response) {
                    Service.configList = response.data;

                    callback();
                });
        };
                

        Service.rejections = [];
        //if (localStorage.getItem('rejections').length === 0) {
        //    Service.rejections = [];
        //} else {
        //    Service.rejections = JSON.parse(localStorage.getItem('rejections'));
        //}
        Service.findRejection = function (itm) {
            for (var i = 0; i <= Service.rejections.length - 1; i++) {
                if (Service.rejections[i].EntityId === itm.EntityId &&
                    Service.rejections[i].modelId === itm.modelId &&
                    Service.rejections[i].applicationDetailId === itm.applicationDetailId) {

                    return Service.rejections[i];
                }
            }
            return null;
        };

        Service.removeRejection = function (itm) {
            for (var i = 0; i <= Service.rejections.length - 1; i++) {
                if (Service.rejections[i].EntityId === itm.EntityId &&
                    Service.rejections[i].modelId === itm.modelId &&
                    Service.rejections[i].applicationDetailId === itm.applicationDetailId) {

                    Service.rejections.splice(i, 1);
                }
            }
            //localStorage.setItem('rejections', JSON.stringify(Service.rejections));
        };

        Service.reject = function (config, model, applicationDetailId,docUrl) {
            var itm = { EntityId: config.id, modelId: model.id, applicationDetailId: applicationDetailId, type: config.type, DocumentUrl: docUrl};
            Service.rejections.push(itm);
            localStorage.setItem('rejections', JSON.stringify(Service.rejections));
        };

        Service.approve = function (config, model, applicationDetailId,docUrl) {
            var itm = { EntityId: config.id, modelId: model.id, applicationDetailId: applicationDetailId, type: config.type, DocumentUrl: docUrl};
            Service.removeRejection(itm);
        };

        Service.isApproved = function (config, model, applicationDetailId,docUrl) {
            var itm = { EntityId: config.id, modelId: model.id, applicationDetailId: applicationDetailId, type: config.type, DocumentUrl:docUrl};
            return Service.findRejection(itm) === null;
        };

        Service.getConfig = function (entity, type) {
            if (Service.configList.length < 1) {
                Service.loadConfigList(function () { Service.getConfig(entity, type); });
            } else {
                for (var i = 0; i <= Service.configList.length - 1; i++) {
                    if (Service.configList[i].entity === entity && Service.configList[i].type === type)
                        return Service.configList[i];
                }
            }
        };

        Service.getConfigByCode = function (code) {
            if (Service.configList.length < 1) {
                Service.loadConfigList(function () { Service.getConfigByCode(code); });
            } else {
                for (var i = 0; i <= Service.configList.length - 1; i++) {
                    if (Service.configList[i].code === code)
                        return Service.configList[i];
                }
            }
            
        };

        //Service.getConfigByCode = function (code) {           
        //        for (var i = 0; i <= Service.configList.length - 1; i++) {
        //            if (Service.configList[i].code === code)                                            
        //            return Service.configList[i];
        //        }            

        //};



        documentPreviewService.$inject = ['$http', '$rootScope'];



    }
})();




(function () {
    'use strict';

    angular
        .module('eServices')
        .directive('documentPreview', documentPreview);

    documentPreview.$inject = ['FileUploader', '$rootScope', '$http', '$filter', '$window', 'browser', '$uibModal', 'documentPreviewService'];

    function documentPreview(FileUploader, $rootScope, $http, $filter, $window, browser, $uibModal, documentPreviewService) {
        return {
            replace: false,
            scope: {
                'ngModel': "=",
                'modelTypeCode': '=?',
                'applicationDetail': '=?'
            },
            templateUrl: '/app/views/Controls/UploadingFilesDirective/DocumentPreviewDirectiveTemplate.html',
            link: link
        };

        function link(scope, element, attrs) {


            scope.config = documentPreviewService.getConfigByCode(scope.modelTypeCode);
            
            
            scope.fullUrl = '';
            scope.extension = '';
            scope.isEditMode = true;
            scope.isApproved = true;
            scope.UrlDocument = '';
            scope.check = function (isApproved) {
                scope.isApproved = isApproved;
                if (scope.applicationDetail) {
                    if (scope.isApproved) {
                        documentPreviewService.approve(scope.config, scope.ngModel, scope.applicationDetail.id, scope.UrlDocument);
                    } else {
                        documentPreviewService.reject(scope.config, scope.ngModel, scope.applicationDetail.id, scope.UrlDocument);
                    }
                }
            };


            scope.$watch('ngModel', function () {
                if (scope.ngModel !== null && scope.ngModel !== undefined) {                    
                    scope.fullUrl = scope.ngModel[scope.config.ulrProperty];
                    scope.UrlDocument = scope.ngModel[scope.config.urlDocument];
                    console.log('scope.ngModel', scope.ngModel);
                    if (scope.fullUrl !== '' && scope.fullUrl !== null) {
                        scope.extension = scope.fullUrl.split('.')[1].toLowerCase();
                    }

                    scope.isApproved = documentPreviewService.isApproved(scope.config, scope.ngModel, scope.applicationDetail.id, scope.UrlDocument);

                }
            });


            scope.openfile = function () {
                var modalInstance = $uibModal.open({
                    templateUrl: 'app/views/Other/iframewindow/iframewindow.html',
                    controller: 'iframewindowController',
                    size: 'full',
                    resolve: {
                        data: function () {
                            return { title: scope.config.translateTitle, url: scope.fullUrl };
                        }
                    }
                });
                modalInstance.result.then(function (result) {
                }, function () {
                });
                modalInstance.result.finally(function (selectedItem) {

                });
            };


        }
    }
})();