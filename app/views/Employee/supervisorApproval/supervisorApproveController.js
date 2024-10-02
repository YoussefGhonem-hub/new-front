/**=========================================================
 * Module: DashboardController.js
 =========================================================*/

(function () {
    'use strict';

    angular
        .module('eServices')
        .controller('SupervisorApproveController', SupervisorApproveController);

    SupervisorApproveController.$inject = ['$rootScope', '$scope', 'UserProfile', '$filter', 'DTOptionsBuilder', 'DTColumnBuilder', '$compile', '$http', '$uibModal', '$state', 'SweetAlert',
                                            '$window'];
    function SupervisorApproveController($rootScope, $scope, UserProfile, $filter, DTOptionsBuilder, DTColumnBuilder, $compile, $http, $uibModal, $state, SweetAlert, $window) {
        var vm = this;
        vm.user = UserProfile.getProfile();
        vm.dtApplicationInstance = {};
        vm.translateFilter = $filter('translate');

        if ($rootScope.language.selected !== 'English') {
            vm.dtApplicationOptions = DTOptionsBuilder.newOptions()
            .withFnServerData(serverData)
            .withOption('serverSide', true)
            .withDataProp('data')
            .withOption('processing', true)
            .withOption('aaSorting', [[1, 'desc']])
            .withOption('stateSave', true)
            .withOption('stateSaveCallback', function (settings, data) {
                localStorage.setItem('DataTables_' + settings.sInstance, JSON.stringify(data));
            })
            .withOption('stateLoadCallback', function (settings) {
                return JSON.parse(localStorage.getItem('DataTables_' + settings.sInstance))
            })
            .withOption('responsive', {
                details: {
                    renderer: renderer
                }
            })
            .withPaginationType('full_numbers')
            .withDisplayLength(10)
            .withLanguageSource('app/langs/ar.json')
            .withOption('createdRow', createdRow)
            .withOption('rowCallback', rowCallback).withBootstrap().withBootstrapOptions({
                TableTools: {
                    classes: {
                        container: 'btn-group',
                        buttons: {
                            normal: 'btn btn-danger'
                        }
                    }
                },
                pagination: {
                    classes: {
                        ul: 'pagination pagination-sm'
                    }
                }
            });
        }
        else {
            vm.dtApplicationOptions = DTOptionsBuilder.newOptions()
            .withFnServerData(serverData)
            .withOption('serverSide', true)
            .withDataProp('data')
            .withOption('processing', true)
            .withOption('aaSorting', [[1, 'desc']])
            .withOption('stateSave', true)
            .withOption('stateSaveCallback', function (settings, data) {
                localStorage.setItem('DataTables_' + settings.sInstance, JSON.stringify(data));
            })
            .withOption('stateLoadCallback', function (settings) {
                return JSON.parse(localStorage.getItem('DataTables_' + settings.sInstance))
            })
            .withOption('responsive', {
                details: {
                    renderer: renderer
                }
            })
            .withPaginationType('full_numbers')
            .withDisplayLength(10)
            .withLanguageSource('app/langs/en.json')
            .withOption('createdRow', createdRow)
            .withOption('rowCallback', rowCallback).withBootstrap().withBootstrapOptions({
                TableTools: {
                    classes: {
                        container: 'btn-group',
                        buttons: {
                            normal: 'btn btn-danger'
                        }
                    }
                },
                pagination: {
                    classes: {
                        ul: 'pagination pagination-sm'
                    }
                }
            });
        }

        vm.dtApplicationColumns = [
            DTColumnBuilder.newColumn('applicationNumber').withTitle(vm.translateFilter('dashboard.applicationNumber')),
            DTColumnBuilder.newColumn('id').notVisible(),
            DTColumnBuilder.newColumn('service.serviceCategory').withTitle(vm.translateFilter('dashboard.service')).renderWith(
                function (data, type) {
                    return $filter('localizeString')(data);
                }),
            DTColumnBuilder.newColumn('service').withTitle(vm.translateFilter('dashboard.service')).renderWith(
                function (data, type) {
                    return $filter('localizeString')(data);
                }),
            DTColumnBuilder.newColumn(null).withOption('defaultContent', ' ').withTitle(vm.translateFilter('dashboard.emirate')).renderWith(
                function (data, type) {
                    if (data.user.userProfiles.length > 0) {
                        if (data.user.userProfiles[0].userTypeId != 1) {
                            var community = $filter('filter')(vm.communities, { id: data.establishment.address.communityId }, true)[0];
                            return $filter('localizeString')(community.region.emirate);
                        }
                        else {
                            var community = $filter('filter')(vm.communities, { id: data.user.userProfiles[0].address.communityId }, true)[0];
                            return $filter('localizeString')(community.region.emirate);
                        }
                    };
                }),
            DTColumnBuilder.newColumn('createdOn').withTitle(vm.translateFilter('dashboard.createdOn')).renderWith(
                function (data, type) {
                    return $filter('date')(data, 'dd-MMMM-yyyy');
                }),
            DTColumnBuilder.newColumn(null).withOption('defaultContent', ' ').withTitle(vm.translateFilter('dashboard.subService')).renderWith(
                    function (data, type) {
                        if (data.serviceId == 2) {
                            return $filter('localizeString')(data.applicationDetails[0].printingPermits[0].publicationType);
                        }
                        else if (data.serviceId == 10) {
                            return $filter('localizeString')(data.applicationDetails[0].circulationMediaMaterials[0].artistWorkType.mediaMaterialType);
                        }
                        else {
                            return '';
                        }
                    }),
            DTColumnBuilder.newColumn(null).withTitle(vm.translateFilter('general.actions')).notSortable()
                .renderWith(actionsHtml),
            DTColumnBuilder.newColumn(null).withTitle(vm.translateFilter('general.procedures')).notSortable()
                .renderWith(workflowActionsHtml)];

        function serverData(sSource, aoData, fnCallback, oSettings) {
            var draw = aoData[0].value;
            var order = aoData[2].value[0];
            var start = aoData[3].value;
            var length = aoData[4].value;
            var search = aoData[5].value;

            vm.params = {
                searchtext: (search.value === '' ? null : search.value),
                page: (start / length) + 1,
                pageSize: length,
                sortBy: (order.column === 0 ? 'Id' : aoData[1].value[order.column].data),
                sortDirection: order.dir,
                filterParams: (vm.filterParams === undefined ? null : vm.filterParams)
            };

            $http.post($rootScope.app.httpSource + 'api/Application/GetSupervisorApprovalApplications', vm.params)
                .then(function (resp) {
                    $http.get($rootScope.app.httpSource + 'api/Community/GetCommunities')
                            .then(function (response) {
                                vm.communities = response.data;

                                vm.applications = resp.data.content;
                                vm.applicationDetails = [];
                                for (var i = 0; i < vm.applications.length; i++) {
                                    for (var j = 0; j < vm.applications[i].applicationDetails.length; j++) {
                                        vm.applicationDetails.push(vm.applications[i].applicationDetails[j]);
                                    }
                                }
                                var records = {
                                    'draw': draw,
                                    'recordsTotal': resp.data.totalRecords,
                                    'recordsFiltered': resp.data.totalRecords,
                                    'data': resp.data.content
                                };
                                fnCallback(records);
                            });
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
        };

        function createdRow(row, data, dataIndex) {
            if (data.applicationDetails[0].applicationStatus.id != 4 && data.applicationDetails[0].applicationStatus.id != 10 && data.applicationDetails[0].applicationStatus.id != 11 &&
                data.applicationDetails[0].payments.length > 0) {
                var urgentService = $filter('filter')(data.applicationDetails[0].payments[0].paymentDetails, { nameEn: 'Urgent Service Fee' }, true)[0];
                if (urgentService != null) {
                    $(row).addClass('urgent');
                }
            }
            $compile(angular.element(row).contents())($scope);
        };

        function rowCallback() {

        };

        function workflowActionsHtml(data, type, full, meta) {
            var htmlSection;
            var index = vm.applications.indexOf(data);
            htmlSection = '<div style="display:inline-block" class=""><workflow-action ng-model="approval.applications[' + index +
                            '].applicationDetails[0]" dtapplicationinstance="approval.dtApplicationInstance" application="approval.applications[' + index + ']"></workflow-action></div>';
            return htmlSection;
        };

        function actionsHtml(data, type, full, meta) {
            var htmlSection = '';
            if (data.applicationDetails.length == 1) {
                htmlSection = vm.bindButtons(data.applicationDetails[0], data.service);
            }
            return htmlSection;
        };

        vm.bindButtons = function (data, service) {
            var htmlSection = '';
            if (data.applicationStatus.id == 1) {
                htmlSection = '<div style="display:inline-block" class="list-icon"><div class="inline" ng-click="approval.actionList(' +
                    data.id + ',\'lg\')"><em class="fa fa-sitemap" style="cursor:pointer" uib-tooltip="' +
                    vm.translateFilter('general.procedureList') + '"></em></div></div>';
            }
            else if (data.applicationStatus.id == 9) {
                htmlSection = '<div style="display:inline-block" class="list-icon"><div class="inline" ng-click="approval.actionList(' +
                    data.id + ',\'lg\')"><em class="fa fa-sitemap" style="cursor:pointer" uib-tooltip="' +
                    vm.translateFilter('general.procedureList') + '"></em></div></div>';
            }
            else if (data.applicationStatus.id == 3 && service.serviceCategory.code == 'MC') {
                htmlSection = '<div style="display:inline-block" class="list-icon"><div class="inline" ng-click="approval.actionList(' +
                    data.id + ',\'lg\')"><em class="fa fa-sitemap" style="cursor:pointer" uib-tooltip="' +
                    vm.translateFilter('general.procedureList') + '"></em></div><div class="inline" ng-click="approval.review(' +
                    data.id + ',\'' + service.code + '\',\'' + service.serviceCategory.code + '\')"><em class="fa fa-search" style="cursor:pointer" uib-tooltip="' +
                    vm.translateFilter('general.review') + '"></em></div></div>';
            }
            else if (data.payments.length > 0 && data.payments[0].paymentStatusId == 3) {
                htmlSection = '<div class="list-icon"><div class="inline" ng-click="approval.review(' +
                    data.id + ',\'' + service.code + '\',\'' + service.serviceCategory.code + '\')"><em class="fa fa-search" style="cursor:pointer" uib-tooltip="' +
                    vm.translateFilter('general.review') + '"></em></div><div class="inline" ng-click="approval.actionList(' +
                    data.id + ',\'lg\')"><em class="fa fa-sitemap" style="cursor:pointer" uib-tooltip="' +
                    vm.translateFilter('general.procedureList') + '"></em></div><div class="inline" ng-click="approval.printReceipt(' + data.id + ')"><em class="fa fa-print" style="cursor:pointer" uib-tooltip="' +
                    vm.translateFilter('general.receipt') + '"></em></div></div>';
            }
            else {
                htmlSection = '<div style="display:inline-block" class="list-icon"><div class="inline" ng-click="approval.actionList(' +
                    data.id + ',\'lg\')"><em class="fa fa-sitemap" style="cursor:pointer" uib-tooltip="' +
                    vm.translateFilter('general.procedureList') + '"></em></div><div class="inline" ng-click="approval.review(' +
                    data.id + ',\'' + service.code + '\',\'' + service.serviceCategory.code + '\')"><em class="fa fa-search" style="cursor:pointer" uib-tooltip="' +
                    vm.translateFilter('general.review') + '"></em></div></div>';
            }

            return htmlSection;
        };

        vm.printReceipt = function (applicationDetailId) {
            var applicationDetail = null;
            for (var i = 0; i < vm.applications.length; i++) {
                applicationDetail = $filter('filter')(vm.applications[i].applicationDetails, { id: applicationDetailId }, true)[0];
                if (applicationDetail != null) break;
            }

            if (vm.user.userTypeCode == '06') {
                SweetAlert.swal({
                    title: vm.translateFilter('dashboard.pleaseSelectTheReceiptType'),
                    text: "",
                    type: "warning",
                    showCancelButton: true,
                    confirmButtonColor: "#DD6B55",
                    confirmButtonText: vm.translateFilter('dashboard.receiptWithHeader'),
                    cancelButtonText: vm.translateFilter('dashboard.receiptWithoutHeader'),
                    closeOnConfirm: true,
                    closeOnCancel: true
                },
              function (isConfirm) {
                  if (isConfirm) {
                      $window.open(applicationDetail.payments[0].paymentReceiptWithHeaderFullUrl, '_blank');
                  } else {
                      $window.open(applicationDetail.payments[0].paymentReceiptFullUrl, '_blank');
                  }
              });
            }
            else {
                $window.open(applicationDetail.payments[0].paymentReceiptWithHeaderFullUrl, '_blank');
            }
        }

        $scope.timelineOpened = false;

        vm.applicationDetail = function (applicationDetailId) {
            var applicationDetail = null;
            for (var i = 0; i < vm.applications.length; i++) {
                applicationDetail = $filter('filter')(vm.applications[i].applicationDetails, { id: applicationDetailId }, true)[0];
                if (applicationDetail != null) return applicationDetail;
            }
        }

        vm.actionList = function (applicationDetailId, size) {
            if (!$scope.timelineOpened) {
                var modalInstance = $uibModal.open({
                    templateUrl: 'app/views/Employee/Timeline/timeline.html',
                    controller: 'TimelineController',
                    size: size,
                    resolve: {
                        applicationDetail: function () {
                            return vm.applicationDetail(applicationDetailId);
                        },
                        application: function () {
                            return $filter('filter')(vm.applications, { id: vm.applicationDetail(applicationDetailId).applicationId }, true)[0];;
                        }
                    }
                });

                modalInstance.result.then(function (establishmentBranch) {

                    if (vm.userProfile.establishment.establishments == undefined) {
                        vm.userProfile.establishment.establishments = [];
                    }
                    vm.userProfile.establishment.establishments.push(establishmentBranch);
                    vm.dtInstance.rerender();
                }, function () {
                });

                // we want to update state whether the modal closed or was dismissed,
                // so use finally to handle both resolved and rejected promises.
                modalInstance.result.finally(function (selectedItem) {
                    $scope.timelineOpened = false;
                });
            }

            $scope.timelineOpened = true;
        }

        vm.review = function (Id, serviceCode, serviceCategoryCode) {
            if (serviceCategoryCode == 'ML') {
                switch (serviceCode) {
                    case "01":
                        $state.go('app.MediaLicenseServices.ReviewJournalistsAppointmentIssuePressCard', { id: Id });
                        break;

                    case "02":
                        $state.go('app.MediaLicenseServices.ReviewFilmPhotographyPermit', { id: Id });
                        break;

                    case "03":
                        $state.go('app.MediaLicenseServices.ReviewRadioTVBroadcastingLicense', { id: Id });
                        break;

                    case "04":
                        $state.go('app.MediaLicenseServices.ReviewMediaLicense', { id: Id });
                        break;

                    case "05":
                        $state.go('app.MediaLicenseServices.ReviewNewspaperMagazineLicense', { id: Id });
                        break;
                }
            }
            if (serviceCategoryCode == 'MC') {
                switch (serviceCode) {
                    case "01":
                        $state.go('app.MediaContentServices.ReviewPublicationsPrintingPermit', { id: Id });
                        break;

                    case "02":
                        $state.go('app.MediaContentServices.ReviewRegulateEntryMediaMaterial', { id: Id });
                        break;

                    case "03":
                        $state.go('app.MediaContentServices.ReviewCirculationMediaMaterialPermit', { id: Id });
                        break;

                    case "04":
                        $state.go('app.MediaContentServices.ReviewCirculationNewspaperMagazinePermit', { id: Id });
                        break;
                }
            }
            if (serviceCategoryCode == 'FM') {
                switch (serviceCode) {
                    case "01":
                        $state.go('app.ForeignMediaServices.ReviewAccreditationForeignJournalists', { id: Id });
                        break;
                }
            }
        };

        function renderer(api, rowIdx, columns) {
            var data = $.map(columns, function (col, i) {
                return col.hidden ?
                    '<li data-dtr-index="' + col.columnIndex + '" data-dt-row="' + col.rowIndex + '" data-dt-column="' + col.columnIndex + '">' +
                         '<span class="dtr-title">' +
                             col.title +
                       '</span> ' +
                       '<span class="dtr-data">' +
                           col.data +
                      '</span>' +
                  '</li>' :
                  '';
            }).join('');
            return data ?
                $compile(angular.element($('<ul data-dtr-index="' + rowIdx + '"/>').append(data)))($scope) :
             false;
        }
    }
})();