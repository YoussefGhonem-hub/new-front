/**=========================================================
 * Module: profileAddress
 * Reuse cases of address in user profile page
 =========================================================*/

(function () {
    'use strict';

    angular.module('eServices')
        .directive('establishmentPartnersList', establishmentPartnersList)

    establishmentPartnersList.$inject = ['$rootScope', '$http', '$stateParams', '$state', 'UserProfile', 'DTOptionsBuilder', 'DTColumnBuilder', '$compile', '$filter', '$uibModal', 'SweetAlert',
        '$timeout', 'FileUploader'];

    function establishmentPartnersList($rootScope, $http, $stateParams, $state, UserProfile, DTOptionsBuilder, DTColumnBuilder, $compile, $filter, $uibModal, SweetAlert, $timeout, FileUploader) {
        return {
            restrict: 'E',
            scope: {
                establishmentId: '=',
                dirClass: '=?',
                forService: '=',
                editOnly: '=',
                establishmentPartners: '=',
                mediaLicensePartners: '=?',
                isRequireThirdParty: '=?',
                isReview: '=?',
                dtPartnerInstance: '=?'
            },
            templateUrl: '/app/views/Controls/EstablishmentPartners/establishmentPartnersListDirectiveTemplate.html',
            link: link
        };

        function link(scope, element, attrs) {
            scope.params = {
                page: 1,
                pageSize: 3,  // Adjust this value as necessary for your use case
                totalRecords: 0
            };

            // Function to handle the paging action
            scope.DoPaging = function (page, pageSize) {
                scope.params.page = page;
                scope.params.pageSize = pageSize;

                // Slice the list of partners based on page and pageSize
                var start = (page - 1) * pageSize;
                var end = start + pageSize;

                scope.paginatedPartners = scope.establishmentPartners.slice(start, end);
            };

            // Watch for any changes in the partner list and update the total records
            scope.$watch('establishmentPartners', function (newVal, oldVal) {
                if (newVal) {
                    scope.params.totalRecords = newVal.length;
                    scope.DoPaging(scope.params.page, scope.params.pageSize);
                }
            }, true);
            scope.establishment = {};
            scope.isMediaLicensePartnerUpdates = false;
            scope.serverPartnerData = function (sSource, aoData, fnCallback, oSettings) {
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
                    sortBy: (order.column === 0 ? 'ID' : aoData[1].value[order.column].data),
                    sortDirection: order.dir
                };
                var records;
                records = {
                    'draw': draw,
                    'recordsTotal': scope.establishmentPartners.length,
                    'recordsFiltered': scope.establishmentPartners.length,
                    'data': scope.establishmentPartners
                };

                fnCallback(records);
            };

            scope.createdRow = function (row, data, dataIndex) {
                if (data.changePartnerTypeId == 2) {
                    $(row).addClass('strikeout');
                }
                else if (data.changePartnerTypeId == 1) {
                    $('td', row).eq(6).addClass('newStyle');
                }
                $compile(angular.element(row).contents())(scope);
            };

            scope.rowCallback = function (row, data) {
                if (data.error) {
                    row.className = 'urgent';
                }
            };

            if (scope.mediaLicensePartners) {
                scope.establishmentPartners = [];
                scope.isMediaLicensePartnerUpdates = true;
                for (var i = 0; i < scope.mediaLicensePartners.length; i++) {
                    var establishmentPartner = {};
                    if (scope.mediaLicensePartners[i].person) {
                        establishmentPartner.person = scope.mediaLicensePartners[i].person;
                        establishmentPartner.personId = scope.mediaLicensePartners[i].personId;
                        if (scope.isRequireThirdParty) {
                            establishmentPartner.requireAcquintanceForm = true;
                        }
                    }
                    if (scope.mediaLicensePartners[i].establishment) {
                        establishmentPartner.partnerEstablishment = scope.mediaLicensePartners[i].establishment;
                        establishmentPartner.partnerEstablishmentId = scope.mediaLicensePartners[i].establishmentId;
                    }
                    establishmentPartner.id = scope.mediaLicensePartners[i].id;
                    establishmentPartner.changePartnerType = scope.mediaLicensePartners[i].changePartnerType;
                    establishmentPartner.changePartnerTypeId = scope.mediaLicensePartners[i].changePartnerTypeId;
                    scope.establishmentPartners.push(establishmentPartner);
                }

                if ($rootScope.language.selected !== 'English') {
                    scope.dtPartnerOptions = DTOptionsBuilder.newOptions()
                        .withFnServerData(scope.serverPartnerData)
                        .withOption('serverSide', true)
                        .withDataProp('data')
                        .withOption('processing', true)
                        .withOption('responsive', true)
                        .withOption('bFilter', false)
                        .withOption('paging', false)
                        .withOption('info', false)
                        .withLanguageSource('app/langs/ar.json')
                        .withOption('createdRow', scope.createdRow)
                        .withOption('rowCallback', scope.rowCallback).withBootstrap();
                }
                else {
                    scope.dtPartnerOptions = DTOptionsBuilder.newOptions()
                        .withFnServerData(scope.serverPartnerData)
                        .withOption('serverSide', true)
                        .withDataProp('data')
                        .withOption('processing', true)
                        .withOption('responsive', true)
                        .withOption('bFilter', false)
                        .withOption('paging', false)
                        .withOption('info', false)
                        .withLanguageSource('app/langs/en.json')
                        .withOption('createdRow', scope.createdRow)
                        .withOption('rowCallback', scope.rowCallback).withBootstrap();
                }
            }
            else {
                $http.get($rootScope.app.httpSource + 'api/Establishment/GetPartners?estId=' + scope.establishmentId)
                    .then(function (response) {
                        scope.establishmentPartners = response.data;
                        scope.fixedPartners = angular.copy(response.data);

                        if (scope.isRequireThirdParty) {
                            for (var i = 0; i < scope.establishmentPartners.length; i++) {
                                scope.establishmentPartners[i].requireAcquintanceForm = true;
                            }
                        }

                        if ($rootScope.language.selected !== 'English') {
                            scope.dtPartnerOptions = DTOptionsBuilder.newOptions()
                                .withFnServerData(scope.serverPartnerData)
                                .withOption('serverSide', true)
                                .withDataProp('data')
                                .withOption('processing', true)
                                .withOption('responsive', true)
                                .withOption('bFilter', false)
                                .withOption('paging', false)
                                .withOption('info', false)
                                .withLanguageSource('app/langs/ar.json')
                                .withOption('createdRow', scope.createdRow)
                                .withOption('rowCallback', scope.rowCallback).withBootstrap();
                        }
                        else {
                            scope.dtPartnerOptions = DTOptionsBuilder.newOptions()
                                .withFnServerData(scope.serverPartnerData)
                                .withOption('serverSide', true)
                                .withDataProp('data')
                                .withOption('processing', true)
                                .withOption('responsive', true)
                                .withOption('bFilter', false)
                                .withOption('paging', false)
                                .withOption('info', false)
                                .withLanguageSource('app/langs/en.json')
                                .withOption('createdRow', scope.createdRow)
                                .withOption('rowCallback', scope.rowCallback).withBootstrap();
                        }
                    });
            }

            $http.get($rootScope.app.httpSource + 'api/EstablishmentPartner/GetAllOtherPartners?estId=' + scope.establishmentId)
                .then(function (response) {
                    scope.allPartners = response.data;
                });

            scope.existingPartnerList = function (size) {
                var modalInstance = $uibModal.open({
                    templateUrl: 'app/views/Application/MediaLicense/ChangePartners/ExistingPartner/existingPartners.html',
                    controller: 'ExistingPartnersController',
                    size: size,
                    backdrop: 'static',
                    resolve: {
                        partners: function () {
                            return scope.allPartners;
                        },
                        exceptPartners: function () {
                            return scope.establishmentPartners;
                        }
                    }
                });

                modalInstance.result.then(function (teamMember) {
                    if (scope.establishmentPartners == undefined) {
                        scope.establishmentPartners = [];
                    }

                    for (var i = 0; i < teamMember.length; i++) {

                        if (scope.isRequireThirdParty) {
                            teamMember[i].requireAcquintanceForm = true;
                        }
                        teamMember[i].alreadyExistAdded = true;

                        scope.establishmentPartners.push(teamMember[i]);
                        scope.dtPartnerInstance.DataTable.row.add(teamMember[i]).draw();
                    }

                    if (scope.dtPartnerInstance) {
                        scope.dtPartnerInstance.rerender();
                    }

                }, function () {
                    //state.text('Modal dismissed with Cancel status');
                });
            };

            scope.dtPartnerInstanceCallback = function (inst) {
                scope.dtPartnerInstance = inst;
            }

            if (scope.establishmentPartners == undefined) {
                scope.establishmentPartners = [];
            }

            scope.translateFilter = $filter('translate');

            scope.openPartner = function (size) {

                var modalInstance = $uibModal.open({
                    templateUrl: 'app/views/Account/completeProfile/establishmentPartner/establishmentPartner.html',
                    controller: 'EstablishmentPartnerController',
                    size: size,
                    backdrop: 'static',
                    resolve: {
                        establishmentPartner: function () {
                            if (scope.isRequireThirdParty) {
                                return 'new';
                            }
                            else {
                                return null;
                            }
                        }
                    }
                });
                modalInstance.result.then(function (establishmentPartner) {
                    var duplicatePerson = false;
                    var translate = $filter('translate');
                    establishmentPartner.changePartnerTypeId = null;

                    if (scope.establishmentPartners == undefined) {
                        scope.establishmentPartners = [];
                    }
                    
                    for (var i = 0; i < scope.establishmentPartners.length; i++) {
                        if (scope.establishmentPartners[i].personId && establishmentPartner.person &&
                            ((establishmentPartner.person.emiratesId != null && scope.establishmentPartners[i].person.emiratesId == establishmentPartner.person.emiratesId) ||
                                (establishmentPartner.person.passportNumber != null && scope.establishmentPartners[i].person.passportNumber == establishmentPartner.person.passportNumber))) {
                            duplicatePerson = true;
                        }
                    }

                    if (duplicatePerson) {
                        SweetAlert.swal(translate('general.wrongAction'), translate('changePartners.duplicatePerson'), "error");
                    }
                    else {
                        scope.dtPartnerInstance.DataTable.row.add(establishmentPartner).draw();
                        scope.establishmentPartners.push(establishmentPartner);
                        scope.dtPartnerInstance.rerender();
                    }

                }, function () { });
            };

            scope.deletePartner = function (rowIndex, event) {
                var tempStore = null;

                if ((scope.establishmentPartners[rowIndex].personId != null && scope.fixedPartners[rowIndex] != undefined &&
                    scope.establishmentPartners[rowIndex].personId == scope.fixedPartners[rowIndex].personId && scope.forService) ||
                    (scope.establishmentPartners[rowIndex].partnerEstablishmentId != null && scope.fixedPartners[rowIndex] != undefined &&
                        scope.establishmentPartners[rowIndex].partnerEstablishmentId == scope.fixedPartners[rowIndex].partnerEstablishmentId && scope.forService)) {
                    scope.establishmentPartners[rowIndex].changePartnerTypeId = 2;
                }
                else {
                    tempStore = scope.establishmentPartners[rowIndex];
                    scope.establishmentPartners.splice(rowIndex, 1);
                }

                var translate = $filter('translate');
                scope.dtPartnerInstance.rerender();

                if (tempStore != null) {
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
                                SweetAlert.swal(translate('general.confirmDeleteBtn'), translate('general.deleteMessage'), "error");
                                tempStore.deletedOn = new Date();
                                scope.updateUserProfile(tempStore);
                                scope.dtPartnerInstance.rerender();
                            } else {
                                scope.establishmentPartners.splice(rowIndex, 0, tempStore);
                                SweetAlert.swal(translate('general.restoreBtn'), translate('general.restoreMessage'), "success");
                                scope.dtPartnerInstance.rerender();
                            }
                        });
                }
            };

            scope.updateUserProfile = function (partner) {
                $http.post($rootScope.app.httpSource + 'api/EstablishmentPartner/UpdateEstablishmentPartner', partner)
                    .then(
                        function (response) {

                        },
                        function (response) {
                            if (response.data.exceptionMessage == "EstablishmentExistException") {
                                SweetAlert.swal({
                                    title: $filter('translate')('general.notApplicable'), text: $filter('translate')('completeProfile.establishmentExist'),
                                    confirmButtonText: $filter('translate')('general.ok')
                                });
                            }
                        });
            }
            scope.updateUserProfileMediaLicensePartner = function (partner) {
                $http.post($rootScope.app.httpSource + 'api/EstablishmentPartner/UpdateMediaLicensePartner', partner)
                    .then(
                        function (response) {

                        },
                        function (response) {
                            if (response.data.exceptionMessage == "EstablishmentExistException") {
                                SweetAlert.swal({
                                    title: $filter('translate')('general.notApplicable'), text: $filter('translate')('completeProfile.establishmentExist'),
                                    confirmButtonText: $filter('translate')('general.ok')
                                });
                            }
                        });
            }
            scope.editPartner = function (size, rowIndex, event) {
                console.log(scope.establishmentPartners);
                var modalInstance = $uibModal.open({
                    templateUrl: 'app/views/Account/completeProfile/establishmentPartner/establishmentPartner.html',
                    controller: 'EstablishmentPartnerController',
                    size: size,
                    backdrop: 'static',
                    resolve: {
                        establishmentPartner: function () {
                            return scope.establishmentPartners[rowIndex];
                        }
                    }
                });

                modalInstance.result.then(function (establishmentPartner) {
                    var partner = $filter('filter')(scope.establishmentPartners, { id: establishmentPartner.id }, true)[0];
                    partner = establishmentPartner;
                    if (scope.isMediaLicensePartnerUpdates == false) {
                        scope.updateUserProfile(partner);
                    }
                    else if (scope.isMediaLicensePartnerUpdates == true) {
                        scope.updateUserProfileMediaLicensePartner(partner);
                    };
                    scope.dtPartnerInstance.rerender();

                }, function () {

                });
            };

            scope.reviewPartner = function (size, establishmentPartnerId, event) {
                var modalInstance = $uibModal.open({
                    templateUrl: 'app/views/Account/completeProfile/establishmentPartner/Review/reviewEstablishmentPartner.html',
                    controller: 'ReviewEstablishmentPartnerController',
                    size: size,
                    resolve: {
                        establishmentPartner: function () {
                            if (establishmentPartnerId == 0) {
                                index = scope.dtPartnerInstance.DataTable.rows({ order: 'applied' }).nodes().indexOf(event.currentTarget.parentNode.parentNode.parentNode);
                                return scope.establishmentPartners[index];
                            }
                            else {
                                return $filter('filter')(scope.establishmentPartners, { id: establishmentPartnerId }, true)[0];
                            }
                        }
                    }
                });

                modalInstance.result.then(function (establishmentPartner) {
                    var partner = $filter('filter')(scope.establishmentPartners, { id: establishmentPartner.id }, true)[0];
                    partner = establishmentPartner;
                }, function () {
                    //state.text('Modal dismissed with Cancel status');
                });
            };

            angular.element(document.body).bind('click', function (e) {
                var popups = $("div[uib-tooltip-popup]");
                if (popups) {
                    for (var i = 0; i < popups.length; i++) {
                        var popup = popups[i];
                        var popupElement = angular.element(popup);

                        if (popupElement[0].previousSibling != e.target) {
                            popupElement.scope().$parent.isOpen = false;
                            popupElement.remove();
                        }
                    }
                }
            });

            scope.partnerActionsHtml = function (data, type, full, meta) {
                var htmlSection = '';

                if (scope.mediaLicensePartners || scope.isReview) {
                    scope.user = UserProfile.getProfile();
                    if (scope.user.userTypeCode == '06') {
                        htmlSection = '<div class="list-icon"><div class="inline" ng-click="reviewPartner(\'lg\',' + data.id +
                            ', $event)"><em class="fa fa-search" style="cursor:pointer" uib-tooltip="' + scope.translateFilter('general.review') + '"></em></div></div>';
                    }
                    else {
                        htmlSection = '<div class="list-icon"><div class="inline" ng-click="editPartner(\'lg\',' +
                            meta.row + ', $event)"><em class="fa fa-pencil" style="cursor:pointer" uib-tooltip="' +
                            scope.translateFilter('general.edit') + '"></em></div><div class="inline" ng-click="deletePartner(' +
                            meta.row + ', $event)"><em class="fa fa-trash" style="cursor:pointer" uib-tooltip="' +
                            scope.translateFilter('general.delete') + '"></em></div></div>';
                    }
                }
                else if (scope.editOnly == true) {
                    htmlSection = '<div class="list-icon"><div class="inline" ng-click="editPartner(\'lg\',' +
                        meta.row + ', $event)"><em class="fa fa-pencil" style="cursor:pointer" uib-tooltip="' +
                        scope.translateFilter('general.edit') + '"></em></div></div>';
                }
                else {
                    if (data.changePartnerTypeId == null || data.changePartnerTypeId != 2) {
                        htmlSection = '<div class="list-icon"><div class="inline" ng-click="editPartner(\'lg\',' +
                            meta.row + ', $event)"><em class="fa fa-pencil" style="cursor:pointer" uib-tooltip="' +
                            scope.translateFilter('general.edit') + '"></em></div><div class="inline" ng-click="deletePartner(' +
                            meta.row + ', $event)"><em class="fa fa-trash" style="cursor:pointer" uib-tooltip="' +
                            scope.translateFilter('general.delete') + '"></em></div></div>';
                    }
                    else {
                        htmlSection = '<div class="list-icon"><div class="inline" ng-click="undo(' + data.id + ', $event)"><em class="fa fa-undo" style="cursor:pointer" uib-tooltip="' +
                            scope.translateFilter('general.delete') + '"></em></div></div>';
                    }
                }

                return htmlSection;
            };

            scope.undo = function (establishmentPartnerId, event) {
                var index;

                if (establishmentPartnerId == 0 || establishmentPartnerId == undefined) {
                    index = vm.dtPartnerInstance.DataTable.rows({ order: 'applied' }).nodes().indexOf(event.currentTarget.parentNode.parentNode.parentNode);
                    scope.establishmentPartners[index].changePartnerTypeId = null;
                }
                else {
                    index = scope.establishmentPartners.indexOf($filter('filter')(scope.establishmentPartners, { id: establishmentPartnerId }, true)[0]);
                    scope.establishmentPartners[index].changePartnerTypeId = null;
                }

                scope.dtPartnerInstance.rerender();
            };

            scope.partnerCountryHtml = function (data, type, full, meta) {
                var __cou = (data.partnerEstablishment == null ? $filter('localizeString')(data.person.country) : $filter('localizeString')(data.partnerEstablishment.country));
                var htmlSection = '<div><span>' + __cou + '</span></div>';
                return htmlSection;
            };

            scope.partnerCountryFlagHtml = function (data, type, full, meta) {
                var __isoCode2 = (data.partnerEstablishment == null ? data.person.country.isoCode2 : data.partnerEstablishment.country.isoCode2);
                var htmlSection = '<div><span><img class="img-responsive" style="display:inline-block; ' +
                    'padding-left:10px; padding-right: 10px; max-width:60px" src="../src/imgs/Countries/' + __isoCode2 + '.png" /></span></div>';

                return htmlSection;
            };

            scope.dtPartnerColumns = [
                DTColumnBuilder.newColumn(null).withTitle(scope.translateFilter(' ')).notSortable().withClass((scope.dirClass != undefined ? scope.dirClass : null))
                    .renderWith(function (data, type) {
                        var ownericon = data.isOwner ? '<i class="fa fa-circle-thin fa-stack-2x" aria-hidden="true" style="color:#3f51b5;" ></i> ' : '';
                        var ownertooltip = data.isOwner ? '    ' + scope.translateFilter('general.licenseOwners') + '   ' : '';

                        if (data.person != null) {
                            return '<em class="fa-stack fa-2x"><em class="fa fa-user-o  fa-stack-1x" class="' + (scope.dirClass != undefined ? scope.dirClass : null) + '" uib-tooltip="' +
                                scope.translateFilter('completeProfile.IndividualPartner') + ownertooltip + '">' + ownericon + '</em></em> ';
                        }
                        else if (data.partnerEstablishment != null) {
                            return '<em class="fa-stack fa-2x"><em class="fa fa-building-o fa-stack-1x" class="' + (scope.dirClass != undefined ? scope.dirClass : null) + '" uib-tooltip="' + scope.translateFilter('completeProfile.CompnayPartner') + ownertooltip + '">' + ownericon + '</em></em>';
                        }
                    }),
                DTColumnBuilder.newColumn(null).withTitle(scope.translateFilter('completeProfile.name')).notSortable().withClass((scope.dirClass != undefined ? scope.dirClass : null))
                    .renderWith(function (data, type) {
                        if (data.person != null) {
                            return data.person.name;

                        }
                        else if (data.partnerEstablishment != null) {
                            return $filter('localizeString')(data.partnerEstablishment);
                        } else {
                            return '';
                        }
                    }),
                DTColumnBuilder.newColumn('id').notVisible(),
                DTColumnBuilder.newColumn(null).withTitle(scope.translateFilter('profileNationalityDirective.Nationality')).notSortable().renderWith(scope.partnerCountryHtml)
                    .withClass((scope.dirClass != undefined ? scope.dirClass : null)),
                DTColumnBuilder.newColumn(null).withTitle(' ').renderWith(scope.partnerCountryFlagHtml).withClass((scope.dirClass != undefined ? scope.dirClass : null)).notSortable(),
                DTColumnBuilder.newColumn('person').withTitle(scope.translateFilter('profileNationalityDirective.EmiratesId')).notSortable()
                    .withClass((scope.dirClass != undefined ? scope.dirClass : null))
                    .renderWith(function (data, type) {
                        if (data == null) {
                            return '';
                        }
                        if (data.emiratesId != null) {
                            return data.emiratesId;
                        } else if (data.passportNumber != null) {
                            return data.passportNumber
                        } else {
                            return '';
                        }
                    }),
                DTColumnBuilder.newColumn(null).withTitle(scope.translateFilter('profileNationalityDirective.DateOfBirth')).notSortable()
                    .withClass((scope.dirClass != undefined ? scope.dirClass : null))
                    .renderWith(function (data, type) {
                        if (data.person != null) {
                            return moment(data.person.dateOfBirth).format('DD-MMMM-YYYY');
                        } else {
                            return '';
                        }
                    }),
                DTColumnBuilder.newColumn(null).withTitle(scope.translateFilter('general.actions')).notSortable().withClass((scope.dirClass != undefined ? scope.dirClass : null))
                    .renderWith(scope.partnerActionsHtml).withOption('width', '15%')];
        }
    };
})();
