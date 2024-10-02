/**=========================================================
 * Module: DashboardController.js
 =========================================================*/

(function () {
    'use strict';

    angular
        .module('eServices')
        .controller('urgentController', urgentController);

    urgentController.$inject = ['$rootScope', '$scope', 'UserProfile', '$filter', 'DTOptionsBuilder', 'DTColumnBuilder', '$compile', '$http', '$uibModal', '$state', 'SweetAlert'];
    function urgentController($rootScope, $scope, UserProfile, $filter, DTOptionsBuilder, DTColumnBuilder, $compile, $http, $uibModal, $state, SweetAlert) {
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
            .withOption('responsive', {
                details: {
                    renderer: renderer
                }
            })
            .withPaginationType('full_numbers')
            .withDisplayLength(10)
            .withLanguageSource('app/langs/ar.json')
            .withOption('createdRow', createdRow)
            .withOption('initComplete', function (settings, data) {
                $compile(angular.element('#' + settings.sTableId).contents())($scope);
            })
            .withOption('fnDrawCallback', function (settings, data) {
                $compile(angular.element('#' + settings.sTableId).contents())($scope);
            })
            .withOption('rowCallback', rowCallback).withBootstrap().withBootstrapOptions({
                TableTools: {
                    classes: {
                        container: 'btn-group',
                        buttons: {
                            normal: 'btn btn-danger'
                        }
                    }
                },
                ColVis: {
                    classes: {
                        masterButton: 'btn btn-primary'
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
            .withOption('responsive', {
                details: {
                    renderer: renderer
                }
            })
            .withPaginationType('full_numbers')
            .withDisplayLength(10)
            .withLanguageSource('app/langs/en.json')
            .withOption('createdRow', createdRow)
            .withOption('initComplete', function (settings, data) {
                $compile(angular.element('#' + settings.sTableId).contents())($scope);
            })
            .withOption('fnDrawCallback', function (settings, data) {
                $compile(angular.element('#' + settings.sTableId).contents())($scope);
            })
            .withOption('rowCallback', rowCallback).withBootstrap().withBootstrapOptions({
                TableTools: {
                    classes: {
                        container: 'btn-group',
                        buttons: {
                            normal: 'btn btn-danger'
                        }
                    }
                },
                ColVis: {
                    classes: {
                        masterButton: 'btn btn-primary'
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
                DTColumnBuilder.newColumn('service').withTitle(vm.translateFilter('dashboard.service')).renderWith(
                    function (data, type) {
                        return $filter('localizeString')(data);
                    }),
                DTColumnBuilder.newColumn('office').withOption('defaultContent', ' ').withTitle(vm.translateFilter('general.office')).renderWith(
                    function (data, type) {
                        return $filter('localizeString')(data);
                    }),
                DTColumnBuilder.newColumn(null).withTitle(vm.translateFilter('dashboard.createdOn')).renderWith(
                    function (data, type) {
                        if (data.applicationDetails.length == 1) {
                            return moment(data.createdOn).format('DD-MMMM-YYYY');
                        }
                        else {
                            return '';
                        };
                    }),
                DTColumnBuilder.newColumn('applicationDetails').withTitle(vm.translateFilter('dashboard.applicationStatus')).renderWith(
                    function (data, type) {
                        if (data.length == 1) {
                            return $filter('localizeString')(data[0].applicationStatus);
                        }
                        else {
                            return '';
                        }
                    }),
                DTColumnBuilder.newColumn(null).withTitle(vm.translateFilter('dashboard.consumedTimeLabel')).renderWith(
                    function (data, type) {
                        if (data.applicationDetails.length == 1) {
                            return moment.duration(data.applicationDetails[0].consumedTime, "minutes").format("d [" + vm.translateFilter('dashboard.days') + "], h [" + vm.translateFilter('dashboard.hours') +
                                    "], m [" + vm.translateFilter('dashboard.minutes') + "]");
                        }
                        else {
                            return '';
                        }
                    }).notSortable(),
                DTColumnBuilder.newColumn(null).withOption('defaultContent', ' ').withTitle(vm.translateFilter('dashboard.lastActionDate')).renderWith(
                    function (data, type) {
                        if (data.applicationDetails.length == 1) {
                            return moment($filter('orderBy')(data.applicationDetails[0].actionsTakens, function (action) {
                                return action.actionDate;
                            }, true)[0].actionDate).format('DD-MMMM-YYYY');
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

            var params = {
                searchtext: (search.value === '' ? null : search.value),
                page: (start / length) + 1,
                pageSize: length,
                sortBy: (order.column === 0 ? 'Id' : aoData[1].value[order.column].data),
                sortDirection: order.dir,
                filterParams: (vm.filterParams === undefined ? null : vm.filterParams)
            };

            $http.post($rootScope.app.httpSource + 'api/Application/GetUrgentApplications', params)
                .then(function (resp) {
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
            if (data.applicationDetails[0].applicationStatus.id != 4 && data.applicationDetails[0].applicationStatus.id != 10 && data.applicationDetails[0].applicationStatus.id != 11) {
                var urgentService = $filter('filter')(data.applicationDetails[0].payments[0].paymentDetails, { nameEn: 'Urgent Service Fee' }, true)[0];
                if (urgentService != null) {
                    $(row).addClass('urgent');
                }
            }
            $compile(angular.element(row).contents())($scope);
        };

        function rowCallback(tabRow, data, dataIndex) {
            if (data.applicationDetails.length > 1) {
                $(tabRow.lastChild.children[0]).unbind('click');
                $(tabRow.lastChild.children[0]).on('click', data, function (event) {
                    var tr = $(tabRow);
                    var table = vm.dtApplicationInstance.DataTable;
                    var row = table.row(tr);

                    if (event.data.applicationDetails.length > 1) {
                        if (row.child.isShown()) {
                            // This row is already open - close it
                            var index = vm.applications.indexOf(event.data);
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
                            row.child(format(event.data)).show();
                            tr.addClass('shown');
                        }
                    }
                });
            }
        };

        function format(dRow) {
            //is there a better way?!
            var html2 = '';
            var index = vm.applications.indexOf(dRow);
            var applicationDetailIndex;
            if (vm.user.userTypeCode == "06") {
                for (var i = 0; i < dRow.applicationDetails.length; i++) {
                    applicationDetailIndex = vm.applicationDetails.indexOf(dRow.applicationDetails[i]);
                    html2 += '<tr role="row" class="bg-gray slider' + index + '"><td></td><td></td><td></td><td>' + moment(dRow.applicationDetails[i].createdOn).format('DD-MMMM-YYYY') + '</td><td>' +
                             $filter('localizeString')(dRow.applicationDetails[i].applicationStatus) + '</td><td>' + moment.duration(dRow.applicationDetails[i].consumedTime,
                             "minutes").format("d [" + vm.translateFilter('dashboard.days') + "], h [" + vm.translateFilter('dashboard.hours') + "], m [" +
                             vm.translateFilter('dashboard.minutes') + "]") + '</td><td>' + $filter('date')($filter('orderBy')(dRow.applicationDetails[i].actionsTakens, function (action) {
                                 return action.actionDate;
                             }, true)[0].actionDate, 'dd-MMMM-yyyy') + '</td><td>' + vm.bindButtons(dRow.applicationDetails[i], dRow.service) + '</td><td><div ' +
                             'style="display:inline-block"><workflow-action is-default="true" ng-model="approval.applicationDetails[' + applicationDetailIndex +
                             ']" dtapplicationinstance="approval.dtApplicationInstance" application="approval.applications[' + index + ']"></workflow-action></div></td></tr>';
                }
            }
            else {
                for (var i = 0; i < dRow.applicationDetails.length; i++) {
                    applicationDetailIndex = vm.applicationDetails.indexOf(dRow.applicationDetails[i]);
                    html2 += '<tr role="row" class="bg-gray slider' + index + '"><td></td><td></td><td></td><td>' + moment(dRow.applicationDetails[i].createdOn).format('DD-MMMM-YYYY') + '</td><td>' +
                                $filter('localizeString')(dRow.applicationDetails[i].applicationStatus) + '</td><td>' + vm.bindButtons(dRow.applicationDetails[i], dRow.service) +
                                '</td><td><div style="display:inline-block"><workflow-action ' +
                                'is-default="true" ng-model="approval.applicationDetails[' + applicationDetailIndex + ']" dtapplicationinstance="approval.dtApplicationInstance" ' +
                                'application="approval.applications[' + index + ']"></workflow-action></div></td></tr>';
                }
            }

            return $compile(html2)($scope);
        }

        function workflowActionsHtml(data, type, full, meta) {
            var htmlSection;
            var index = vm.applications.indexOf(data);
            if (data.applicationDetails.length == 1) {
                htmlSection = '<div style="display:inline-block" class=""><workflow-action ng-model="approval.applications[' + index +
                    '].applicationDetails[0]" dtapplicationinstance="approval.dtApplicationInstance" application="approval.applications[' + index + ']"></workflow-action></div>';
            }
            else {
                htmlSection = '<toggle ng-model="toggleValue' + index + '" style="slow" size="btn-sm" onstyle="btn-success" offstyle="btn-primary" ng-change="changed()" on="' +
                                $filter('translate')("dashboard.lessDetails") + '" off="' + $filter('translate')("dashboard.moreDetails") + '"></toggle>'
            }
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
            htmlSection = '<div style="display:inline-block" class="list-icon"><div class="inline" ng-click="approval.actionList(' +
                            data.id + ',\'lg\', $event)"><em class="fa fa-sitemap" style="cursor:pointer" uib-tooltip="' +
                            vm.translateFilter('general.procedureList') + '"></em></div><div class="inline" ng-click="approval.review(' +
                            data.id + ',\'' + service.code + '\',\'' + service.serviceCategory.code + '\')"><em class="fa fa-search" style="cursor:pointer" uib-tooltip="' +
                            vm.translateFilter('general.review') + '"></em></div></div>';

            return htmlSection;
        };

        $scope.timelineOpened = false;

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

        vm.applicationDetail = function (applicationDetailId) {
            var applicationDetail = null;
            for (var i = 0; i < vm.applications.length; i++) {
                applicationDetail = $filter('filter')(vm.applications[i].applicationDetails, { id: applicationDetailId }, true)[0];
                if (applicationDetail != null) return applicationDetail;
            }
        };

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

        vm.filter = function ($scope) {
            vm.filterParams = $scope.filterParams;
            vm.dtApplicationInstance.DataTable.draw();
        }
    }
})();
