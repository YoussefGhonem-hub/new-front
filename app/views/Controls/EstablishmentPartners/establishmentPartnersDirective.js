/**=========================================================
 * Module: profileAddress
 * Reuse cases of address in user profile page
 =========================================================*/

(function () {
    'use strict';

    angular
        .module('eServices')
        .directive('establishmentPartners', establishmentPartners)

    establishmentPartners.$inject = ['$rootScope', '$http', '$filter', 'FileUploader', 'DTOptionsBuilder', 'DTColumnBuilder', '$compile', '$uibModal', 'SweetAlert', '$state']
    function establishmentPartners($rootScope, $http, $filter, FileUploader, DTOptionsBuilder, DTColumnBuilder, $compile, $uibModal, SweetAlert, $state) {
        return {
            restrict: 'E',
            scope: {
                userProfile: "="
            },
            templateUrl: '/app/views/Controls/EstablishmentPartners/establishmentPartnersDirectiveTemplate.html',
            link: link
        };

        function link(scope, element, attrs) {
            scope.translateFilter = $filter('translate');
            scope.dt = {};
            scope.dt.dtEstablishmentInstance = null;
            var establishments = [];

            function init() {

                $http.get($rootScope.app.httpSource + 'api/Emirate')
                    .then(function (response) {
                        scope.emirates = response.data;
                    }, function (response) { });

                scope.serverEstablishmentData = function (sSource, aoData, fnCallback, oSettings) {
                    //All the parameters you need is in the aoData variable
                    var draw = aoData[0].value;
                    var order = aoData[2].value[0];
                    var start = aoData[3].value;
                    var length = aoData[4].value;
                    var search = aoData[5].value;

                    scope.params = {
                        searchtext: (search.value === '' ? null : search.value),
                        page: (start / length) + 1,
                        pageSize: length,
                        sortBy: (order.column === 0 ? 'Id' : aoData[1].value[order.column].data),
                        sortDirection: order.dir,
                        filterParams: (scope.filterParams === undefined ? null : scope.filterParams),
                        userId: $state.params.id
                    };
                    //Then just call your service to get the records from server side

                    if (scope.isTemporaryDelete === undefined) {
                        $http.post($rootScope.app.httpSource + 'api/Establishment/GetEstablishments', scope.params)
                            .then(function (resp) {
                                if (scope.communities == undefined || scope.communities.length == 0) {
                                    $http.get($rootScope.app.httpSource + 'api/Community/GetCommunities')
                                        .then(function (response) {
                                            scope.communities = response.data;

                                            for (var i = 0; i < resp.data.content.length; i++) {
                                                resp.data.content[i].tenancyContractEndDate = new Date(resp.data.content[i].tenancyContractEndDate);
                                            }

                                            scope.establishments = resp.data.content;
                                            var records = {
                                                'draw': draw,
                                                'recordsTotal': resp.data.totalRecords,
                                                'recordsFiltered': resp.data.totalRecords,
                                                'data': resp.data.content
                                            };
                                            fnCallback(records);
                                        });
                                }
                                else {
                                    scope.establishments = resp.data.content;
                                    var records = {
                                        'draw': draw,
                                        'recordsTotal': resp.data.totalRecords,
                                        'recordsFiltered': resp.data.totalRecords,
                                        'data': resp.data.content
                                    };
                                    fnCallback(records);
                                }
                            },
                                function (response) {
                                    var records = {
                                        'draw': draw,
                                        'recordsTotal': 0,
                                        'recordsFiltered': 0,
                                        'data': []
                                    };
                                    fnCallback(records);
                                });
                    }
                    else if (scope.isTemporaryDelete === true) {
                        var records = {
                            'draw': draw,
                            'recordsTotal': scope.establishments.length,
                            'recordsFiltered': scope.establishments.length,
                            'data': scope.establishments
                        };
                        fnCallback(records);
                    }
                };

                scope.createdEstablishmentRow = function (row, data, dataIndex) {
                    $('td', row).eq(9).addClass('wrapperStyle');
                    $compile(angular.element(row).contents())(scope);
                }

                scope.rowEstablishmentCallback = function (tabRow, data, dataIndex) {
                    $(tabRow.lastChild.children[0]).unbind('click');
                    $(tabRow.lastChild.children[0]).on('click', data, function (event) {
                        var tr = $(tabRow);
                        var table = scope.dt.dtEstablishmentInstance.DataTable;
                        var row = table.row(tr);

                        if (row.child.isShown()) {
                            // This row is already open - close it
                            var index = establishments.indexOf(event.data);
                            var childs = row.child;
                            tr.removeClass('shown');
                            $('tr.slider' + index)
                                .children('td, th')
                                .animate({ padding: 0 })
                                .wrapInner('<div />')
                                .children()
                                .slideUp(function () { $(this).closest('tr').remove(); childs.hide() });
                        }
                        else {
                            // Open this row
                            row.child(scope.format(event.data)).show();
                            tr.addClass('shown');
                        }
                    });
                };

                scope.edit = function (size, establishmentId) {
                    var modalInstance = $uibModal.open({
                        templateUrl: 'app/views/Account/completeProfile/establishmentBranch/establishmentBranch.html',
                        controller: 'EstablishmentBranchController',
                        size: size,
                        resolve: {
                            emirates: function () {
                                return scope.emirates;
                            },
                            establishment: function () {
                                return $filter('filter')(scope.establishments, { id: establishmentId }, true)[0];
                            },
                            userType: function () {
                                return scope.userProfile.userType;
                            },
                            freeZoneEstablishment: function () {
                                if (scope.userProfile.userType.id == 5 && scope.userProfile.establishment != null) {
                                    return scope.userProfile.establishment;
                                }
                                else {
                                    return null;
                                }
                            }
                        }
                    });

                    modalInstance.result.then(function (establishmentBranch) {
                        var branch = $filter('filter')(scope.establishments, { id: establishmentBranch.id }, true)[0];
                        branch = establishmentBranch;
                        $http.post($rootScope.app.httpSource + 'api/Establishment/UpdateEstablishment', establishmentBranch)
                            .then(function (response) {
                                scope.dt.dtEstablishmentInstance.rerender();
                            },
                                function (response) {
                                });
                    }, function () {
                        //state.text('Modal dismissed with Cancel status');
                    });
                };

                scope.actionsHtml = function (data, type, full, meta) {
                    var htmlSection = '';

                    if (data.isAllowPartnerChange) {
                        htmlSection = '<div class="list-icon"><div class="inline" ng-click="edit(\'lg\',' + data.id + ')"><em class="fa fa-pencil" style="cursor:pointer" uib-tooltip="' +
                            scope.translateFilter('general.edit') + '"></em></div><div class="inline" ng-click="delete(' + data.id +
                            ', $event)"><em class="fa fa-trash" style="cursor:pointer" uib-tooltip="' + scope.translateFilter('general.delete') + '"></em></div></div>';
                    }
                    else {
                        htmlSection = '<div class="list-icon"><div class="inline" ng-click="reviewPartner(\'lg\',' + data.id +
                            ', $event)"><em class="fa fa-search" style="cursor:pointer" uib-tooltip="' + scope.translateFilter('general.review') + '"></em></div></div>';
                    }

                    return htmlSection;
                };

                scope.moreDetailsHtml = function (data, type, full, meta) {
                    var htmlSection = '';
                    htmlSection = '<div style="display:inline-block" class="list-iconMore"><div class="inline" style="color:white;"><em class="fa fa-users" style="cursor:pointer;" uib-tooltip="' +
                        $filter('translate')("establishment.ownerDetails") + '"></em></div></div>';
                    return htmlSection;
                };

                scope.reviewPartner = function (size, establishmentId, event) {
                    var modalInstance = $uibModal.open({
                        templateUrl: 'app/views/Account/completeProfile/establishmentBranch/establishmentBranch.html',
                        controller: 'EstablishmentBranchController',
                        size: size,
                        resolve: {
                            emirates: function () {
                                return scope.emirates;
                            },
                            establishment: function () {
                                return $filter('filter')(scope.establishments, { id: establishmentId }, true)[0];
                            },
                            userType: function () {
                                return scope.userProfile.userType;
                            },
                            freeZoneEstablishment: function () {
                                if (scope.userProfile.userType.id == 5 && scope.userProfile.establishment != null) {
                                    return scope.userProfile.establishment;
                                }
                                else {
                                    return null;
                                }
                            }
                        }
                    });

                    modalInstance.result.then(function (establishmentBranch) {
                        var branch = $filter('filter')(scope.establishments, { id: establishmentBranch.id }, true)[0];
                        branch = establishmentBranch;
                        $http.post($rootScope.app.httpSource + 'api/Establishment/UpdateEstablishment', establishmentBranch)
                            .then(function (response) {
                                //scope.dt.dtEstablishmentInstance.rerender();
                            },
                                function (response) {
                                });
                    }, function () {
                        //state.text('Modal dismissed with Cancel status');
                    });
                };

                scope.open = function (size) {

                    var modalInstance = $uibModal.open({
                        templateUrl: 'app/views/Account/completeProfile/establishmentBranch/establishmentBranch.html',
                        controller: 'EstablishmentBranchController',
                        size: size,
                        resolve: {
                            emirates: function () {
                                return scope.emirates;
                            },
                            establishment: function () {
                                return null;
                            },
                            userType: function () {
                                return scope.userProfile.userType;
                            },
                            freeZoneEstablishment: function () {
                                if (scope.userProfile.userType.id == 5) {
                                    return scope.userProfile.user;
                                }
                                else {
                                    return null;
                                }
                            }
                        }
                    });

                    modalInstance.result.then(function (establishmentBranch) {
                        scope.establishments.push(establishmentBranch);

                        $http.post($rootScope.app.httpSource + 'api/UserEstablishment/AddUserEstablishment', { establishment: establishmentBranch })
                            .then(
                                function (response) {
                                    if (response.data.exceptionMessage == "EstablishmentExistException") {
                                        scope.establishmentExist = true;
                                        scope.dt.dtEstablishmentInstance.rerender();
                                        SweetAlert.swal({
                                            title: $filter('translate')('general.notApplicable'), text: $filter('translate')('completeProfile.establishmentExist'),
                                            confirmButtonText: $filter('translate')('general.ok')
                                        });
                                    }
                                    else {
                                        scope.dt.dtEstablishmentInstance.rerender();
                                    }
                                },
                                function (response) {
                                    if (response.data.exceptionMessage == "EstablishmentExistException") {
                                        scope.establishmentExist = true;
                                        scope.dt.dtEstablishmentInstance.rerender();
                                        SweetAlert.swal({
                                            title: $filter('translate')('general.notApplicable'), text: $filter('translate')('completeProfile.establishmentExist'),
                                            confirmButtonText: $filter('translate')('general.ok')
                                        });
                                    }
                                });

                    }, function () {
                        //state.text('Modal dismissed with Cancel status');
                    });
                };

                scope.delete = function (establishmentId, event) {

                    var index;
                    var tempStore;
                    var translate = $filter('translate');

                    if (establishmentId == 0 || establishmentId == undefined) {
                        index = scope.dt.dtEstablishmentInstance.DataTable.rows({ order: 'applied' }).nodes().indexOf(event.currentTarget.parentNode.parentNode.parentNode);
                        tempStore = scope.establishments[index];
                        scope.establishments.splice(index, 1);
                        scope.isTemporaryDelete = true;
                    }
                    else {
                        index = scope.establishments.indexOf($filter('filter')(scope.establishments, { id: establishmentId }, true)[0]);
                        tempStore = $filter('filter')(scope.establishments, { id: establishmentId }, true)[0];
                        scope.establishments.splice(index, 1);
                        scope.isTemporaryDelete = true;
                    }

                    scope.dt.dtEstablishmentInstance.rerender();

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
                                //vm.updateUserProfile();
                                scope.isTemporaryDelete = undefined;
                                scope.dt.dtEstablishmentInstance.rerender();
                            } else {
                                scope.establishments.splice(index, 0, tempStore);
                                SweetAlert.swal(translate('general.restoreBtn'), translate('general.restoreMessage'), "success");
                                scope.isTemporaryDelete = undefined;
                                scope.dt.dtEstablishmentInstance.rerender();
                            }
                        });
                };

                scope.changePartners = function (estId, size) {
                    var modalInstance = $uibModal.open({
                        templateUrl: 'app/views/Account/completeProfile/establishmentPartner/establishmentPartner.html',
                        controller: 'EstablishmentPartnerController',
                        size: size,
                        backdrop: 'static',
                        resolve: {
                            establishmentPartner: function () {
                                return null;
                            }
                        }
                    });
                    modalInstance.result.then(function (establishmentPartner) {
                        establishmentPartner.establishmentId = estId;
                        $http.post($rootScope.app.httpSource + 'api/EstablishmentPartner/AddEstablishmentPartner', establishmentPartner)
                            .then(function (response) {
                                scope.dt.dtEstablishmentInstance.rerender();
                            },
                                function (response) { });

                    }, function () { });
                }

                scope.workflowActionsHtml = function (data, type, full, meta) {
                    var htmlSection = '';

                    if (data.isAllowPartnerChange) {
                        htmlSection = '<div style="display:inline-block" class=""><div class="btn btn-primary pull-right" ng-click="changePartners(' + data.id + ', \'lg\')">' +
                            scope.translateFilter('completeProfile.addNewPartner') + '</div></div>';
                    }
                    return htmlSection;
                };

                if ($rootScope.language.selected !== 'English') {
                    scope.dtEstablishmentOptions = DTOptionsBuilder.newOptions()
                        .withFnServerData(scope.serverEstablishmentData)
                        .withOption('serverSide', true)
                        .withDataProp('data')
                        .withOption('processing', true)
                        .withOption('responsive', true)
                        .withOption('bFilter', true)
                        .withOption('paging', true)
                        .withOption('info', false)
                        .withLanguageSource('app/langs/ar.json')
                        .withOption('createdRow', scope.createdEstablishmentRow)
                        .withOption('rowCallback', scope.rowEstablishmentCallback).withBootstrap();
                }
                else {
                    scope.dtEstablishmentOptions = DTOptionsBuilder.newOptions()
                        .withFnServerData(scope.serverEstablishmentData)
                        .withOption('serverSide', true)
                        .withDataProp('data')
                        .withOption('processing', true)
                        .withOption('responsive', true)
                        .withOption('bFilter', true)
                        .withOption('paging', true)
                        .withOption('info', false)
                        .withLanguageSource('app/langs/en.json')
                        .withOption('createdRow', scope.createdEstablishmentRow)
                        .withOption('rowCallback', scope.rowEstablishmentCallback).withBootstrap();
                }

                scope.dtEstablishmentColumns = [
                    DTColumnBuilder.newColumn(null).withTitle('').notSortable().renderWith(
                        function (data, type) {
                            if (data.parentId == null) {
                                return '<em class="fa-stack fa-2x"><i class="fa fa-circle fa-stack-2x"></i><em class="fa fa-building-o fa-stack-1x" style="color:white" ' +
                                    'uib-tooltip="{{\'establishment.mainBranch\' | translate}}"></em></em>';
                            }
                            else {
                                return '<em class="fa-stack fa-2x"><i class="fa fa-circle fa-stack-2x"></i><em class="fa fa-sitemap fa-stack-1x" style="color:white" ' +
                                    'uib-tooltip="{{\'establishment.branch\' | translate}}"></em></em>';
                            }
                        }),
                    DTColumnBuilder.newColumn('nameAr').withTitle(scope.translateFilter('completeProfile.establishmentNameAr')),
                    DTColumnBuilder.newColumn('nameEn').withTitle(scope.translateFilter('completeProfile.establishmentNameEn')),
                    DTColumnBuilder.newColumn('id').notVisible(),
                    DTColumnBuilder.newColumn('licenseNumber').withTitle(scope.translateFilter('completeProfile.LicenseNumber')),
                    DTColumnBuilder.newColumn('authority').withTitle(scope.translateFilter('completeProfile.Authority')).renderWith(
                        function (data, type) {
                            return $filter('localizeString')(data);
                        }),
                    DTColumnBuilder.newColumn('authority.emirate').withTitle(scope.translateFilter('address.Emirate')).renderWith(
                        function (data, type) {
                            return $filter('localizeString')(data);
                        }),
                    DTColumnBuilder.newColumn('address.community').withTitle(scope.translateFilter('address.Community')).renderWith(
                        function (data, type) {
                            return $filter('localizeString')(data);
                        }),
                    DTColumnBuilder.newColumn(null).withTitle(scope.translateFilter('general.actions')).notSortable()
                        .renderWith(scope.actionsHtml),
                    DTColumnBuilder.newColumn(null).withTitle(scope.translateFilter('general.procedures')).notSortable()
                        .renderWith(scope.workflowActionsHtml),
                    DTColumnBuilder.newColumn(null).withTitle('').notSortable().renderWith(scope.moreDetailsHtml).withOption('width', '20px')];

                scope.format = function (dRow) {
                    //is there a better way?!
                    var html2 = '';
                    var index = establishments.indexOf(dRow);
                    var applicationDetailIndex;

                    html2 += '<tr role="row" class="bg-gray slider' + index + '"><td colspan="10"><establishment-partners-list dir-class="\'partnerBackground\'" establishment-id="' +
                        dRow.id + '" for-service="false" is-review="' + !dRow.isAllowPartnerChange + '"></establishment-partners-list></td></tr>'

                    return $compile(html2)(scope);
                }
            }

            init();
        };
    }
})();
