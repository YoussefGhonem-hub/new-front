/**=========================================================
 * Module: profileNationality
 * Reuse cases of nationality in user profile page
 =========================================================*/

(function () {
    'use strict';

    angular
        .module('eServices')
        .directive('externalMediaAccount', externalMediaAccount)

    externalMediaAccount.$inject = ['$rootScope', '$http', '$filter', '$window', 'browser', 'DTOptionsBuilder', 'DTColumnBuilder', '$uibModal', '$compile', 'SweetAlert', 'UserProfile'];

    function externalMediaAccount($rootScope, $http, $filter, $window, browser, DTOptionsBuilder, DTColumnBuilder, $uibModal, $compile, SweetAlert, UserProfile) {
        return {
            restrict: 'E',
            scope: {
                passModel: "=ngModel",
                editMode: "=editMode",
                isReview: "=isReview",
                isForeignMediaLicense: "=isForeignMediaLicense"
            },
            templateUrl: '/app/views/Controls/externalMediaAccount/externalMediaAccountDirectiveTemplate.html',
            link: link
        };

        function link(scope, element, attrs) {
            scope.externalMediaAccountsDt = {};
            scope.externalMediaAccountsDt.dtInstance = {};
            scope.translateFilter = $filter('translate');
            var roles = UserProfile.getProfile().roles;
            scope.canEditExternalMediaAccount = (roles.indexOf('vgeW7B4qbkdaJhByGHvASqLGv5BdWm') != -1 && scope.isReview);
            scope.externalMediaAccountsDt.lang = $rootScope.language.selected !== 'English' ? 'ar' : 'en';

            scope.NewGUID = function () {
                function s4() {
                    return Math.floor((1 + Math.random()) * 0x10000)
                        .toString(16)
                        .substring(1);
                }
                return s4() + s4() + '-' + s4() + '-' + s4() + '-' + s4() + '-' + s4() + s4() + s4();
            }



            if (!scope.passModel.mediaLicenseEconomicActivityExternalMediaAccounts) {
                scope.passModel.mediaLicenseEconomicActivityExternalMediaAccounts = [];
            }

            scope.serverData = function (sSource, aoData, fnCallback, oSettings) {
                var aoDataLength = aoData.length;
                //All the parameters you need is in the aoData variable
                var draw = aoData[0].value;
                var order = aoData[2].value[0];
                var start = aoData[3].value;
                var length = aoData[4].value;
                var search = aoData[5].value;

                var params = {
                    searchtext: search.value,
                    page: (start / length) + 1,
                    pageSize: length,
                    sortBy: (order.column === 0 ? 'id' : aoData[1].value[order.column].data),
                    sortDirection: order.dir
                };

                //Then just call your service to get the records from server side           
                var records = {
                    'draw': draw,
                    'recordsTotal': scope.passModel.mediaLicenseEconomicActivityExternalMediaAccounts.length,
                    'recordsFiltered': scope.passModel.mediaLicenseEconomicActivityExternalMediaAccounts.length,
                    'data': scope.passModel.mediaLicenseEconomicActivityExternalMediaAccounts
                };

                fnCallback(records);
            };

            scope.actionsHtml = function (data, type, full, meta) {
                var htmlSection = '';

                if (scope.canEditExternalMediaAccount) {
                    htmlSection = '<div class="list-icon"><div class="inline" ng-click="edit(\'lg\',' + data.id + ')"><em class="fa fa-pencil" style="cursor:pointer" uib-tooltip="' +
                        scope.translateFilter('general.edit') + '"></em></div><div class="inline" ng-click="delete(' + data.id +
                        ', $event)"><em class="fa fa-trash" style="cursor:pointer" uib-tooltip="' + scope.translateFilter('general.delete') + '"></em></div></div>';
                } else {
                    if (scope.isReview == true && !scope.passModel[0]) {
                        htmlSection = '<div class="list-icon"><div class="inline" ng-click="review(\'lg\',' + data.id + ')"><em class="fa fa-search" style="cursor:pointer" uib-tooltip="' +
                            scope.translateFilter('general.review') + '"></em></div></div>';
                    }
                    else if (scope.isReview == undefined && !scope.passModel[0]) {
                        htmlSection = '<div class="list-icon"><div class="inline" ng-click="edit(\'lg\',' + data.id + ')"><em class="fa fa-pencil" style="cursor:pointer" uib-tooltip="' +
                            scope.translateFilter('general.edit') + '"></em></div><div class="inline" ng-click="delete(' + data.id +
                            ', $event)"><em class="fa fa-trash" style="cursor:pointer" uib-tooltip="' + scope.translateFilter('general.delete') + '"></em></div></div>';
                    }
                    else if (scope.isReview == undefined && (scope.passModel[0] && scope.passModel[0].isForeignMediaLicense)) {
                        htmlSection = '<div class="list-icon"><div class="inline" ng-click="edit(\'lg\',' + data.externalMediaAccount.id + ')"><em class="fa fa-pencil" style="cursor:pointer" uib-tooltip="' +
                            scope.translateFilter('general.edit') + '"></em></div><div class="inline" ng-click="delete(' + data.externalMediaAccount.id +
                            ', $event)"><em class="fa fa-trash" style="cursor:pointer" uib-tooltip="' + scope.translateFilter('general.delete') + '"></em></div></div>';
                    }
                    else {
                        htmlSection = '<div class="list-icon"><div class="inline" ng-click="review(\'lg\',' + data.id + ')"><em class="fa fa-search" style="cursor:pointer" uib-tooltip="' +
                            scope.translateFilter('general.review') + '"></em></div></div>';
                    }
                }

                return htmlSection;
            };

            scope.socialMediaLogo = function (data, type, full, meta) {
                if (data.externalMediaAccount.socialMedia != undefined) {
                    if (data.externalMediaAccount.socialMedia.id == 5) {
                        var htmlSection = '<i style="color:' + data.externalMediaAccount.socialMedia.color + '"></i><img height="20px" src="https://eservices.uaemc.gov.ae/app/img/MCYEmail/x.png">';
                    }
                    else {
                        var htmlSection = '<i style="color:' + data.externalMediaAccount.socialMedia.color + '" class="fa fa-2x ' + data.externalMediaAccount.socialMedia.logo + '"></i>';
                    }
                    return htmlSection;
                }
            };
            scope.websiteURLLink = function (data, type, full, meta) {
                var htmlSection = '<p><a style="cursor: pointer;text-decoration: underline" href="' + data.externalMediaAccount.websiteUrl + '" target="_blank">' + data.externalMediaAccount.websiteUrl +'</a></p>';
                return htmlSection;
            };

            scope.verifyAccountHtml = function (data, type, full, meta) {
                var htmlSection = '';
                if (!scope.passModel.isForeignMediaLicense && !scope.isReview && data.externalMediaAccount.socialMedia.code != 'Website' && data.externalMediaAccount.socialMedia.code != 'AppleApp' && data.externalMediaAccount.socialMedia.code != 'AndroidApp' && data.externalMediaAccount.socialMedia.code != 'Snapchat') {
                    if (data.externalMediaAccount.providerDetailId) {
                        htmlSection = '<div style="color:green;"><i class="fa fa-check"></i> ' + scope.translateFilter('externalMediaAccount.accountVerified') + '</div>';
                    } else {
                        htmlSection = '<div class="btn btn-warning" ng-click="verifyAccount(' + data.id + ')">' + scope.translateFilter('externalMediaAccount.verifyAccount') + '</div>';
                    }
                }
                return htmlSection;
            };



            function popupCenter(url, title, w, h) {
                var left = (screen.width / 2) - (w / 2);
                var top = (screen.height / 2) - (h / 2);
                return $window.open(url, title, 'width=' + w + ', height=' + h + ', top=' + top + ', left=' + left);
            }

            scope.windowmessageListener = null;

            scope.verifyAccount = function (externalMediaAccountId) {

                var exaccount = $filter('filter')(scope.passModel.mediaLicenseEconomicActivityExternalMediaAccounts, { id: externalMediaAccountId }, true)[0];
                $http.get($rootScope.app.httpSource + 'api/OAuth2/Auth?provider=' + exaccount.externalMediaAccount.socialMedia.code)
                    .then(function (response) {
                        if (scope.windowmessageListener) {
                            $window.removeEventListener("message", scope.windowmessageListener, false);
                        }
                        var newWin = popupCenter(response.data, exaccount.externalMediaAccount.displayName, 800, 500);
                        scope.windowmessageListener = function (event) {
                            exaccount.externalMediaAccount.providerDetailId = event.data;
                            newWin.close();
                            scope.externalMediaAccountsDt.dtInstance.rerender();
                        };

                        $window.addEventListener("message", scope.windowmessageListener, false);
                    },
                        function (response) {

                        });
            }


            scope.createdRow = function (row, data, dataIndex) {
                $compile(angular.element(row).contents())(scope);
            }

            scope.rowCallback = function () { };

            if ($rootScope.language.selected !== 'English') {
                scope.externalMediaAccountsDt.dtOptions = DTOptionsBuilder.newOptions()
                    .withFnServerData(scope.serverData)
                    .withOption('serverSide', true)
                    .withDataProp('data')
                    .withOption('processing', true)
                    .withOption('responsive', true)
                    .withLanguageSource('app/langs/ar.json')
                    .withOption('bFilter', false)
                    .withOption('paging', false)
                    .withOption('info', false)
                    .withOption('createdRow', scope.createdRow)
                    .withOption('rowCallback', scope.rowCallback).withBootstrap();
            }
            else {
                scope.externalMediaAccountsDt.dtOptions = DTOptionsBuilder.newOptions()
                    .withFnServerData(scope.serverData)
                    .withOption('serverSide', true)
                    .withDataProp('data')
                    .withOption('processing', true)
                    .withOption('responsive', true)
                    .withOption('bFilter', false)
                    .withOption('paging', false)
                    .withOption('info', false)
                    .withOption('createdRow', scope.createdRow)
                    .withOption('rowCallback', scope.rowCallback).withBootstrap();
            }

            if (scope.isReview && scope.passModel.isForeignMediaLicense) {
                scope.dtColumns = [
                    DTColumnBuilder.newColumn('externalMediaAccount.socialMedia').withTitle(scope.translateFilter('externalMediaAccount.type')).renderWith(
                        function (data, type) {
                            return $filter('localizeString')(data);
                        }),

                    DTColumnBuilder.newColumn(null).withTitle(' ').renderWith(scope.socialMediaLogo).notSortable(),
                    DTColumnBuilder.newColumn('externalMediaAccount.displayName').withTitle(scope.translateFilter('externalMediaAccount.displayName')),
                    DTColumnBuilder.newColumn('externalMediaAccount.websiteUrl').withTitle(scope.translateFilter('externalMediaAccount.websiteUrl')),
                    DTColumnBuilder.newColumn(null).withTitle(' ').renderWith(scope.verifyAccountHtml).notSortable()];
            }
            else {
                if (scope.externalMediaAccountsDt.lang == 'en') {
                    scope.dtColumns = [
                        DTColumnBuilder.newColumn('externalMediaAccount.socialMediaCategory').withTitle(scope.translateFilter('externalMediaAccount.category')).renderWith(
                            function (data, type) {
                                return $filter('localizeString')(data);
                            }),
                        DTColumnBuilder.newColumn('externalMediaAccount.externalMediaAccountClassifications[0].socialMediaSubCategory.nameEn').withTitle(scope.translateFilter('externalMediaAccount.subCategory')).renderWith(
                            function (data, type) {
                                return (data.replaceAll("0", ", "));
                            }),
                        DTColumnBuilder.newColumn('externalMediaAccount.socialMedia').withTitle(scope.translateFilter('externalMediaAccount.type')).renderWith(
                            function (data, type) {
                                return $filter('localizeString')(data);
                            }),
                        DTColumnBuilder.newColumn(null).withTitle(' ').renderWith(scope.socialMediaLogo).notSortable(),
                        DTColumnBuilder.newColumn('externalMediaAccount.displayName').withTitle(scope.translateFilter('externalMediaAccount.displayName')),
                        DTColumnBuilder.newColumn(null).withTitle(scope.translateFilter('externalMediaAccount.websiteUrl')).renderWith(scope.websiteURLLink),
                        //DTColumnBuilder.newColumn(null).withTitle(' ').renderWith(scope.verifyAccountHtml).notSortable(),
                        DTColumnBuilder.newColumn(null).withTitle(scope.translateFilter('general.actions')).notSortable()
                            .renderWith(scope.actionsHtml).withOption('width', '15%')];
                }
                else {
                    scope.dtColumns = [
                        DTColumnBuilder.newColumn('externalMediaAccount.socialMediaCategory').withTitle(scope.translateFilter('externalMediaAccount.category')).renderWith(
                            function (data, type) {
                                return $filter('localizeString')(data);
                            }),
                        DTColumnBuilder.newColumn('externalMediaAccount.externalMediaAccountClassifications[0].socialMediaSubCategory.nameAr').withTitle(scope.translateFilter('externalMediaAccount.subCategory')).renderWith(
                            function (data, type) {
                                return (data.replaceAll("0", ", "));
                            }),
                        DTColumnBuilder.newColumn('externalMediaAccount.socialMedia').withTitle(scope.translateFilter('externalMediaAccount.type')).renderWith(
                            function (data, type) {
                                return $filter('localizeString')(data);
                            }),
                        DTColumnBuilder.newColumn(null).withTitle(' ').renderWith(scope.socialMediaLogo).notSortable(),
                        DTColumnBuilder.newColumn('externalMediaAccount.displayName').withTitle(scope.translateFilter('externalMediaAccount.displayName')),
                        DTColumnBuilder.newColumn(null).withTitle(scope.translateFilter('externalMediaAccount.websiteUrl')).renderWith(scope.websiteURLLink),
                        //DTColumnBuilder.newColumn(null).withTitle(' ').renderWith(scope.verifyAccountHtml).notSortable(),
                        DTColumnBuilder.newColumn(null).withTitle(scope.translateFilter('general.actions')).notSortable()
                            .renderWith(scope.actionsHtml).withOption('width', '15%')];
                }
            }


            scope.open = function (size) {
                var modalInstance = $uibModal.open({
                    templateUrl: 'app/views/Controls/externalMediaAccount/externalMediaAccountPopup/externalMediaAccountPopup.html',
                    controller: 'ExternalMediaAccountPopupController',
                    size: size,
                    backdrop: 'static',
                    resolve: {
                        isForeignMedia: function () {
                            return scope.passModel.isForeignMediaLicense;
                        },
                        mediaLicenseEconomicActivityExternalMediaAccount: function () {
                            return null;
                        }
                    }
                });

                modalInstance.result.then(function (mediaLicenseEconomicActivityExternalMediaAccount) {
                    if (scope.passModel.mediaLicenseEconomicActivityExternalMediaAccounts == undefined) {
                        scope.passModel.mediaLicenseEconomicActivityExternalMediaAccounts = [];
                    }

                    mediaLicenseEconomicActivityExternalMediaAccount.externalMediaAccount.externalMediaAccountClassifications = [];

                    if (mediaLicenseEconomicActivityExternalMediaAccount.selectedSubCategory.length > 0) {
                        for (var i = 0; i < mediaLicenseEconomicActivityExternalMediaAccount.selectedSubCategory.length; i++) {
                            mediaLicenseEconomicActivityExternalMediaAccount.externalMediaAccount.externalMediaAccountClassifications.push({ socialMediaSubCategory: mediaLicenseEconomicActivityExternalMediaAccount.selectedSubCategory[i] });
                        }
                    }

                    mediaLicenseEconomicActivityExternalMediaAccount.id = scope.passModel.mediaLicenseEconomicActivityExternalMediaAccounts.length + 1;
                    scope.passModel.mediaLicenseEconomicActivityExternalMediaAccounts.push(mediaLicenseEconomicActivityExternalMediaAccount);
                    scope.externalMediaAccountsDt.dtInstance.rerender();
                }, function () {
                    //state.text('Modal dismissed with Cancel status');
                });
            };

            scope.edit = function (size, externalMediaAccountId) {
                var modalInstance = $uibModal.open({
                    templateUrl: 'app/views/Controls/externalMediaAccount/externalMediaAccountPopup/externalMediaAccountPopup.html',
                    controller: 'ExternalMediaAccountPopupController',
                    size: size,
                    backdrop: 'static',
                    resolve: {
                        isForeignMedia: function () {
                            if (scope.passModel.isForeignMediaLicense != undefined) {
                                return scope.passModel.isForeignMediaLicense;
                            }
                            else if (scope.passModel.isForeignMediaLicense == undefined && scope.passModel[0]) {
                                return scope.passModel[0].isForeignMediaLicense;
                            }
                        },
                        mediaLicenseEconomicActivityExternalMediaAccount: function () {
                            if (scope.passModel[0] && scope.passModel[0].isForeignMediaLicense) {
                                for (var i = 0; i < scope.passModel.mediaLicenseEconomicActivityExternalMediaAccounts.length; i++) {
                                    if (scope.passModel.mediaLicenseEconomicActivityExternalMediaAccounts[i].externalMediaAccount.id == externalMediaAccountId) {
                                        scope.passModel.mediaLicenseEconomicActivityExternalMediaAccounts[i].id = externalMediaAccountId;
                                        return $filter('filter')(scope.passModel.mediaLicenseEconomicActivityExternalMediaAccounts, { id: externalMediaAccountId }, true)[0];
                                    }
                                }
                            }
                            else {
                                return $filter('filter')(scope.passModel.mediaLicenseEconomicActivityExternalMediaAccounts, { id: externalMediaAccountId }, true)[0];
                            }

                        }
                    }
                });

                modalInstance.result.then(function (externalMediaAccount) {
                    var newExternalMediaAccount = $filter('filter')(scope.passModel.mediaLicenseEconomicActivityExternalMediaAccounts, { id: externalMediaAccount.Id }, true)[0];
                    newExternalMediaAccount = externalMediaAccount;
                    scope.externalMediaAccountsDt.dtInstance.rerender();
                }, function () {
                    //state.text('Modal dismissed with Cancel status');
                });
            };

            scope.delete = function (externalMediaAccountId, event) {
                var index;
                var tempStore;

                if (externalMediaAccountId == 0 || externalMediaAccountId == undefined) {
                    index = scope.externalMediaAccountsDt.dtInstance.DataTable.rows({ order: 'applied' }).nodes().indexOf(event.currentTarget.parentNode.parentNode.parentNode);
                    tempStore = scope.passModel.mediaLicenseEconomicActivityExternalMediaAccounts[index];
                    scope.passModel.mediaLicenseEconomicActivityExternalMediaAccounts.splice(index, 1);
                }
                else if (scope.passModel[0] && scope.passModel[0].isForeignMediaLicense) {
                    for (var i = 0; i < scope.passModel.mediaLicenseEconomicActivityExternalMediaAccounts.length; i++) {
                        if (scope.passModel.mediaLicenseEconomicActivityExternalMediaAccounts[i].externalMediaAccount.id == externalMediaAccountId) {
                            scope.passModel.mediaLicenseEconomicActivityExternalMediaAccounts[i].id = externalMediaAccountId;

                            index = scope.passModel.mediaLicenseEconomicActivityExternalMediaAccounts.indexOf($filter('filter')(scope.passModel.mediaLicenseEconomicActivityExternalMediaAccounts, { id: externalMediaAccountId }, true)[0]);
                            tempStore = $filter('filter')(scope.passModel.mediaLicenseEconomicActivityExternalMediaAccounts, { id: externalMediaAccountId }, true)[0];
                            scope.passModel.mediaLicenseEconomicActivityExternalMediaAccounts.splice(index, 1);
                        }
                    }
                }
                else {
                    index = scope.passModel.mediaLicenseEconomicActivityExternalMediaAccounts.indexOf($filter('filter')(scope.passModel.mediaLicenseEconomicActivityExternalMediaAccounts, { id: externalMediaAccountId }, true)[0]);
                    tempStore = $filter('filter')(scope.passModel.mediaLicenseEconomicActivityExternalMediaAccounts, { id: externalMediaAccountId }, true)[0];
                    scope.passModel.mediaLicenseEconomicActivityExternalMediaAccounts.splice(index, 1);
                }
                var translate = $filter('translate');
                scope.externalMediaAccountsDt.dtInstance.rerender();

                SweetAlert.swal({
                    title: translate('general.confirmDelete'),
                    text: translate('general.confirmDeleteInfo'),
                    type: "warning",
                    showCancelButton: true,
                    confirmButtonColor: "#DD6B55",
                    confirmButtonText: translate('general.confirmDeleteBtn'),
                    cancelButtonText: translate('general.restoreBtn'),
                    closeOnConfirm: false,
                    closeOnCancel: false
                },
                    function (isConfirm) {
                        if (isConfirm) {
                            //delete
                            SweetAlert.swal(translate('general.confirmDeleteBtn'), translate('general.deleteMessage'), "error");
                            scope.externalMediaAccountsDt.dtInstance.rerender();
                        } else {
                            scope.passModel.mediaLicenseEconomicActivityExternalMediaAccounts.splice(index, 0, tempStore);
                            SweetAlert.swal(translate('general.restoreBtn'), translate('general.restoreMessage'), "success");
                            scope.externalMediaAccountsDt.dtInstance.rerender();
                        }
                    });
            };

            scope.review = function (size, externalMediaAccountId, event) {
                var modalInstance = $uibModal.open({
                    templateUrl: 'app/views/Controls/externalMediaAccount/externalMediaAccountPopup/Review/reviewExternalMediaAccountPopup.html',
                    controller: 'reviewExternalMediaAccountPopupController',
                    size: size,
                    resolve: {
                        mediaLicenseEconomicActivityExternalMediaAccount: function () {
                            if (externalMediaAccountId == 0) {
                                index = vm.teamMemberDt.dtInstance.DataTable.rows({ order: 'applied' }).nodes().indexOf(event.currentTarget.parentNode.parentNode.parentNode);
                                return vm.photographyPermitModel.photographyPermitMembers[index];
                            }
                            else {
                                return $filter('filter')(scope.passModel.mediaLicenseEconomicActivityExternalMediaAccounts, { id: externalMediaAccountId }, true)[0];
                            }
                        }
                    }
                });
            };

            scope.ModifyExternalMediaAccountAndReprint = function () {
                scope.canEditExternalMediaAccount = false;
                $http.post($rootScope.app.httpSource + 'api/MediaLicense/ModifyExternalMediaAccountAndReprint', scope.passModel)
                    .then(function (response) {
                        SweetAlert.swal("تم ينجاح", "تم التعديل وتم طباعة الرخصة اذا كان الطلب مكتمل", "success");
                    },
                        function (response) {
                            SweetAlert.swal("حدث خطاء", "خطاء", "error");
                        });
            };

        }
    }
})();
