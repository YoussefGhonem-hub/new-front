/**=========================================================
 * Module: profileAddress
 * Reuse cases of address in user profile page
 =========================================================*/

(function () {
    'use strict';

    angular.module('eServices')
        .directive('partnersList', partnersList)

    partnersList.$inject = ['$rootScope', '$http', '$stateParams', '$state', 'UserProfile', 'DTOptionsBuilder', 'DTColumnBuilder', '$compile', '$filter', '$uibModal', 'SweetAlert',
        '$timeout', 'FileUploader'];

    function partnersList($rootScope, $http, $stateParams, $state, UserProfile, DTOptionsBuilder, DTColumnBuilder, $compile, $filter, $uibModal, SweetAlert, $timeout, FileUploader) {
        return {
            restrict: 'E',
            scope: {
                userProfile: "=?",
                establishmentId: '=?',
                isViewonly: '=?'
            },
            templateUrl: '/app/views/Controls/establishment/partnersListDirectiveTemplate.html',
            link: link
        };

        function link(scope, element, attrs) {

            scope.establishment = {};

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
                if (scope.establishmentPartners.length > 0) {
                    records = {
                        'draw': draw,
                        'recordsTotal': scope.establishmentPartners.length,
                        'recordsFiltered': scope.establishmentPartners.length,
                        'data': scope.establishmentPartners
                    };
                }
                else {
                    records = {
                        'draw': draw,
                        'recordsTotal': 0,
                        'recordsFiltered': 0,
                        'data': scope.establishmentPartners
                    };
                }

                fnCallback(records);
            };

            if (scope.establishmentId != null) {
                scope.isViewonly = true;
                $http.get($rootScope.app.httpSource + 'api/Establishment/GetPartners?estId=' + scope.establishmentId)
                    .then(function (response) {
                        scope.establishmentPartners = response.data;

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
                            .withOption('createdRow', createdRow)
                            .withOption('rowCallback', scope.rowCallback).withBootstrap();
                    });

            } else {
                if (scope.userProfile.userEstablishments != undefined && scope.userProfile.userEstablishments.length > 0) {
                    scope.establishment = scope.userProfile.userEstablishments[0].establishment;
                    scope.establishmentPartners = scope.userProfile.userEstablishments[0].establishment.establishmentPartners;

                    if (scope.userProfile.userType.id == 5 || scope.userProfile.userType.id == 3 || scope.userProfile.userType.id == 4) {
                        scope.isFreeZone = true;
                    }
                    else {
                        scope.isFreeZone = false;
                    }

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
                        .withOption('createdRow', createdRow)
                        .withOption('rowCallback', scope.rowCallback).withBootstrap();
                }
            }

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
                    resolve: {
                        establishmentPartner: function () {
                            return null;
                        }
                    }
                });
                modalInstance.result.then(function (establishmentPartner) {
                    if (scope.isFreeZone) {
                        establishmentPartner.id = $filter('filter')(scope.userProfile.establishment.establishments, { id: scope.gEstab.id }, true)[0].establishmentPartners.length + 1;
                        $filter('filter')(scope.userProfile.establishment.establishments, { id: scope.gEstab.id }, true)[0].establishmentPartners.push(establishmentPartner);
                    } else {
                        if (scope.userProfile.userEstablishments[0].establishment.establishmentPartners == undefined) {
                            scope.userProfile.userEstablishments[0].establishment.establishmentPartners = [];
                        }
                        scope.userProfile.userEstablishments[0].establishment.establishmentPartners.push(establishmentPartner);
                        scope.establishmentPartners = scope.userProfile.userEstablishments[0].establishment.establishmentPartners;
                    }
                    scope.invalidPartners = false;
                    scope.dtPartnerInstance.rerender();

                }, function () { });
            };

            scope.deletePartner = function (establishmentPartnerId, event) {
                var index;
                var tempStore;
                var partnerTempStore;

                if (scope.isFreeZone) {
                    var establishment = $filter('filter')(scope.userProfile.establishment.establishments, { id: scope.gEstab.id }, true)[0];
                    if (establishmentPartnerId == 0 || establishmentPartnerId == undefined) {
                        index = scope.dtPartnerInstance.DataTable.rows({ order: 'applied' }).nodes().indexOf(event.currentTarget.parentNode.parentNode.parentNode);
                        tempStore = establishment.establishmentPartners[index];
                        establishment.establishmentPartners.splice(index, 1);
                    }
                    else {
                        index = establishment.establishmentPartners.indexOf($filter('filter')(establishment.establishmentPartners, { id: establishmentPartnerId }, true)[0]);
                        tempStore = $filter('filter')(establishment.establishmentPartners, { id: establishmentPartnerId }, true)[0];
                        establishment.establishmentPartners.splice(index, 1);
                    }
                }
                else {
                    if (establishmentPartnerId == 0 || establishmentPartnerId == undefined) {
                        index = scope.dtPartnerInstance.DataTable.rows({ order: 'applied' }).nodes().indexOf(event.currentTarget.parentNode.parentNode.parentNode);
                        tempStore = scope.userProfile.establishment.establishmentPartners[index];
                        scope.userProfile.establishment.establishmentPartners.splice(index, 1);
                        scope.establishmentPartners.splice(index, 1);
                    }
                    else {
                        index = scope.userProfile.establishment.establishmentPartners.indexOf($filter('filter')(scope.userProfile.establishment.establishmentPartners, { id: establishmentPartnerId }, true)[0]);
                        tempStore = $filter('filter')(scope.userProfile.establishment.establishmentPartners, { id: establishmentPartnerId }, true)[0];
                        scope.userProfile.establishment.establishmentPartners.splice(index, 1);
                        partnerTempStore = $filter('filter')(scope.establishmentPartners, { id: establishmentPartnerId }, true)[0];
                        scope.establishmentPartners.splice(index, 1);
                    }
                }
                var translate = $filter('translate');
                scope.dtPartnerInstance.rerender();

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
                            scope.dtPartnerInstance.rerender();
                        } else {
                            if (scope.isFreeZone) {
                                var establishment = $filter('filter')(scope.userProfile.establishment.establishments, { id: scope.gEstab.id }, true)[0];
                                establishment.establishmentPartners.splice(index, 0, tempStore);
                            }
                            else {
                                scope.userProfile.establishment.establishmentPartners.splice(index, 0, tempStore);
                                scope.establishmentPartners.splice(index, 0, partnerTempStore);
                            }
                            SweetAlert.swal(translate('general.restoreBtn'), translate('general.restoreMessage'), "success");
                            scope.dtPartnerInstance.rerender();
                        }
                    });
            };

            scope.editPartner = function (size, establishmentPartnerId, event) {
                var modalInstance = $uibModal.open({
                    templateUrl: 'app/views/Account/completeProfile/establishmentPartner/establishmentPartner.html',
                    controller: 'EstablishmentPartnerController',
                    size: size,
                    resolve: {
                        establishmentPartner: function () {
                            if (establishmentPartnerId == 0) {
                                var index = scope.dtPartnerInstance.DataTable.rows({ order: 'applied' }).nodes().indexOf(event.currentTarget.parentNode.parentNode.parentNode);
                                if (index == -1) {
                                    index = scope.dtPartnerInstance.DataTable.row(this).index();
                                }
                                if (scope.isFreeZone) {
                                    return $filter('filter')(scope.userProfile.establishment.establishments, { id: scope.gEstab.id }, true)[0].establishmentPartners[index];

                                }
                                else {
                                    return scope.userProfile.establishment.establishmentPartners[index];
                                }
                            }
                            else {

                                if (scope.isFreeZone) {
                                    return $filter('filter')($filter('filter')(scope.userProfile.establishment.establishments, { id: scope.gEstab.id }, true)[0].establishmentPartners, {
                                        id: establishmentPartnerId
                                    }, true)[0];

                                }
                                else {
                                    return $filter('filter')(scope.userProfile.establishment.establishmentPartners, {
                                        id: establishmentPartnerId
                                    }, true)[0];
                                }
                            }
                        }
                    }
                });

                modalInstance.result.then(function (establishmentPartner) {
                    if (scope.isFreeZone) {
                        var partner = $filter('filter')($filter('filter')(scope.userProfile.establishment.establishments, { id: scope.gEstab.id }, true)[0].establishmentPartners, { id: establishmentPartner.id }, true)[0];
                        partner = establishmentPartner;
                    }
                    else {
                        var partner = $filter('filter')(scope.userProfile.establishment.establishmentPartners, { id: establishmentPartner.id }, true)[0];
                        partner = establishmentPartner;
                    }
                    scope.dtPartnerInstance.rerender();

                }, function () {
                    //state.text('Modal dismissed with Cancel status');
                });
            };

            scope.updateUserProfile = function () {
                $http.post($rootScope.app.httpSource + 'api/UserProfile/UpdateUserProfileInside', scope.userProfile).then(
                    function (response) {
                        scope.dtPartnerInstance.rerender();
                    },
                    function (response) {
                        scope.dtPartnerInstance.rerender();
                    });
            }

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
                                return $filter('filter')(scope.establishmentPartners, {
                                    id: establishmentPartnerId
                                }, true)[0];
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

            scope.partnerActionsHtml = function (data, type, full, meta) {
                var htmlSection = '';

                if (!scope.isViewonly) {
                    htmlSection = '<div class="list-icon"><div class="inline" ng-click="editPartner(\'lg\',' +
                                    data.id + ', $event)"><em class="fa fa-pencil" style="cursor:pointer" uib-tooltip="' +
                                    scope.translateFilter('general.edit') + '"></em></div><div class="inline" ng-click="deletePartner(' +
                                    data.id + ', $event)"><em class="fa fa-trash" style="cursor:pointer" uib-tooltip="' +
                                    scope.translateFilter('general.delete') + '"></em></div></div>';
                }
                else {
                    htmlSection = '<div class="list-icon"><div class="inline" ng-click="reviewPartner(\'lg\',' +
                                    data.id + ', $event)"><em class="fa fa-search" style="cursor:pointer" uib-tooltip="' +
                                    scope.translateFilter('general.review') + '"></em></div></div>';
                }

                return htmlSection;
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

            function createdRow(row, data, dataIndex) {
                $compile(angular.element(row).contents())(scope);
            };

            scope.rowCallback = function () { };

            scope.dtPartnerColumns = [
                DTColumnBuilder.newColumn(null).withTitle(scope.translateFilter(' ')).notSortable()
                    .renderWith(function (data, type) {


                        var ownericon = data.isOwner ? '<i class="fa fa-circle-thin fa-stack-2x" aria-hidden="true" style="color:#3f51b5;" ></i> ' : '';
                        var ownertooltip = data.isOwner ? '    ' + scope.translateFilter('general.licenseOwners') + '   ' : '';

                        if (data.person != null) {

                            return '<em class="fa-stack fa-2x"><em class="fa fa-user-o  fa-stack-1x" style="color:#000000" uib-tooltip="' + scope.translateFilter('completeProfile.IndividualPartner') + ownertooltip + '">' + ownericon + '</em></em> ';

                        }
                        else if (data.partnerEstablishment != null) {
                            return '<em class="fa-stack fa-2x"><em class="fa fa-building-o fa-stack-1x" style="color:#000000" uib-tooltip="' + scope.translateFilter('completeProfile.CompnayPartner') + ownertooltip + '">' + ownericon + '</em></em>';
                        }
                    }),

                DTColumnBuilder.newColumn(null).withTitle(scope.translateFilter('completeProfile.name'))
                    .renderWith(function (data, type) {
                        if (data.person != null) {
                            return data.person.name;

                        }
                        else if (data.partnerEstablishment != null) {
                            return data.partnerEstablishment.nameEn;
                        } else {
                            return '';
                        }
                    }),
                DTColumnBuilder.newColumn('id').notVisible(),
                DTColumnBuilder.newColumn(null).withTitle(scope.translateFilter('profileNationalityDirective.Nationality')).renderWith(scope.partnerCountryHtml),
                DTColumnBuilder.newColumn(null).withTitle(' ').renderWith(scope.partnerCountryFlagHtml).notSortable(),
                DTColumnBuilder.newColumn('person').withTitle(scope.translateFilter('profileNationalityDirective.EmiratesId'))
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
                DTColumnBuilder.newColumn(null).withTitle(scope.translateFilter('profileNationalityDirective.DateOfBirth'))
                    .renderWith(function (data, type) {
                        if (data.person != null) {
                            return moment(data.person.dateOfBirth).format('DD-MMMM-YYYY');
                        } else {
                            return '';
                        }
                    }),
                DTColumnBuilder.newColumn(null).withTitle(scope.translateFilter('general.actions')).notSortable()
                    .renderWith(scope.partnerActionsHtml).withOption('width', '15%')];
        }
    };
})();
