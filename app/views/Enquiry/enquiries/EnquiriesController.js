/**=========================================================
 * Module: DashboardController.js
 =========================================================*/

(function () {
    'use strict';

    angular
        .module('eServices')
        .controller('EnquiriesController', EnquiriesController);

    EnquiriesController.$inject = ['$rootScope', '$scope', '$http', '$stateParams', '$state', 'UserProfile', 'DTOptionsBuilder', 'DTColumnBuilder', '$compile', '$filter', '$uibModal',
        'SweetAlert', '$timeout', 'FileUploader'];

    function EnquiriesController($rootScope, $scope, $http, $stateParams, $state, UserProfile, DTOptionsBuilder, DTColumnBuilder, $compile, $filter, $uibModal,
        SweetAlert, $timeout, FileUploader) {

        var vm = this;
        vm.user = UserProfile.getProfile();
        vm.dtApplicationInstance = {};
        vm.translateFilter = $filter('translate');

        vm.exportExcel = function () {
            $http.post($rootScope.app.httpSource + 'api/Enquiry/ExportExcel', vm.params, { responseType: 'arraybuffer' })
                .then(function (resp) {
                    var data = new Blob([resp.data], { type: 'application/vnd.ms-excel' });
                    saveAs(data, "Enquiries.xlsx");
                },
                    function (response) {
                    });
        };
        vm.exportPDF = function () {
            $http.post($rootScope.app.httpSource + 'api/Enquiry/ExportToPdf', vm.params, { responseType: 'arraybuffer' })
                .then(function (resp) {
                    var data = new Blob([resp.data], { type: 'application/pdf' });
                    saveAs(data, "Enquiries.pdf");
                },
                    function (response) {
                    });
        };
        vm.exportCSV = function () {
            $http.post($rootScope.app.httpSource + 'api/Enquiry/ExportCSV', vm.params)
                .then(function (resp) {
                    var myBlob = new Blob([resp.data], { type: 'text/html' });
                    var url = window.URL.createObjectURL(myBlob);
                    var a = document.createElement("a");
                    document.body.appendChild(a);
                    a.href = url;
                    a.download = "Enquiries.csv";
                    a.click();
                    window.URL.revokeObjectURL(url);
                },
                    function (response) {
                    });
        };

        if ($rootScope.language.selected !== 'English') {
            vm.dtApplicationOptions = DTOptionsBuilder.newOptions()
                .withFnServerData(serverData)
                .withOption('serverSide', true)
                .withDataProp('data')
                .withOption('processing', true)
                .withOption('searchDelay', 2000)
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
                        renderer: renderer,
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
                .withOption('searchDelay', 2000)
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
                    pagination: {
                        classes: {
                            ul: 'pagination pagination-sm'
                        }
                    }
                });
        }

        if (vm.user.userTypeCode == "06") {
            vm.dtApplicationColumns = [
                DTColumnBuilder.newColumn('enquiryNumber').withTitle(vm.translateFilter('dashboard.applicationNumber')),
                DTColumnBuilder.newColumn('id').notVisible(),
                DTColumnBuilder.newColumn('enquirySource').withTitle(vm.translateFilter('enquiries.enquirySource')).renderWith(
                    function (data, type) {
                        return $filter('localizeString')(data);
                    }),
                DTColumnBuilder.newColumn('enquiryType').withTitle(vm.translateFilter('enquiries.enquiryType')).renderWith(
                    function (data, type) {
                        return $filter('localizeString')(data);
                    }),
                DTColumnBuilder.newColumn(null).withTitle(vm.translateFilter('enquiries.service')).renderWith(
                    function (data, type) {
                        if (data.service == null && data.enquiryTypeId != 5) {
                            return $filter('localizeString')(data.applicationDetail.application.service);
                        }
                        else if (data.service != null) {
                            return $filter('localizeString')(data.service);
                        }
                        else {
                            return "";
                        }
                    }),
                DTColumnBuilder.newColumn(null).withTitle(vm.translateFilter('enquiries.priority')).renderWith(
                    function (data, type) {
                        if (data.enquiryDetails.length > 0) {
                            return $filter('localizeString')(data.enquiryDetails[0].priority);
                        }
                        else {
                            return "";
                        }
                    }),
                DTColumnBuilder.newColumn(null).withTitle(vm.translateFilter('enquiries.depatrtment')).renderWith(
                    function (data, type) {
                        if (data.enquiryDetails.length > 0) {
                            return $filter('localizeString')(data.enquiryDetails[0].department);
                        }
                        else {
                            return "";
                        }
                    }),
                DTColumnBuilder.newColumn(null).withTitle(vm.translateFilter('dashboard.createdOn')).renderWith(
                    function (data, type) {
                        return moment(data.createdOn).format('DD-MMMM-YYYY');
                    }),
                DTColumnBuilder.newColumn('enquiryStatus').withTitle(vm.translateFilter('dashboard.applicationStatus')).renderWith(
                    function (data, type) {
                        return $filter('localizeString')(data);
                    }),
                DTColumnBuilder.newColumn(null).withTitle(vm.translateFilter('dashboard.consumedTimeLabel')).renderWith(
                    function (data, type) {
                        return moment.duration(data.consumedTime, "minutes").format("d [" + vm.translateFilter('dashboard.days') +
                            "], h [" + vm.translateFilter('dashboard.hours') + "], m [" + vm.translateFilter('dashboard.minutes') + "]");
                    }).notSortable(),
                DTColumnBuilder.newColumn(null).withTitle(vm.translateFilter('general.actions')).notSortable()
                    .renderWith(actionsHtml),
                DTColumnBuilder.newColumn(null).withTitle(vm.translateFilter('general.procedures')).notSortable()
                    .renderWith(workflowActionsHtml)];

            $http.get($rootScope.app.httpSource + 'api/UserFilter?menuId=' + 39)
                .then(function (response) {
                    vm.userFilters = response.data;
                });
        }
        else {
            vm.dtApplicationColumns = [
                DTColumnBuilder.newColumn('enquiryNumber').withTitle(vm.translateFilter('dashboard.applicationNumber')),
                DTColumnBuilder.newColumn('id').notVisible(),
                DTColumnBuilder.newColumn('enquirySource').withTitle(vm.translateFilter('enquiries.enquirySource')).renderWith(
                    function (data, type) {
                        return $filter('localizeString')(data);
                    }),
                DTColumnBuilder.newColumn('enquiryType').withTitle(vm.translateFilter('enquiries.enquiryType')).renderWith(
                    function (data, type) {
                        return $filter('localizeString')(data);
                    }),
                DTColumnBuilder.newColumn(null).withTitle(vm.translateFilter('enquiries.service')).renderWith(
                    function (data, type) {
                        if (data.service == null && data.enquiryTypeId != 5) {
                            return $filter('localizeString')(data.applicationDetail.application.service);
                        }
                        else if (data.service != null) {
                            return $filter('localizeString')(data.service);
                        }
                        else {
                            return "";
                        }
                    }),
                DTColumnBuilder.newColumn(null).withTitle(vm.translateFilter('dashboard.createdOn')).renderWith(
                    function (data, type) {
                        return moment(data.createdOn).format('DD-MMMM-YYYY');
                    }),
                DTColumnBuilder.newColumn('enquiryStatus').withTitle(vm.translateFilter('dashboard.applicationStatus')).renderWith(
                    function (data, type) {
                        return $filter('localizeString')(data);
                    }),
                DTColumnBuilder.newColumn(null).withTitle(vm.translateFilter('general.actions')).notSortable()
                    .renderWith(actionsHtml)];
        }

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

            if (vm.isTemporaryDelete === undefined) {
                if (vm.user.userTypeCode == "06") {
                    $http.get($rootScope.app.httpSource + 'api/UserFilter/GetDefaultUserFilter?menuId=' + 39)
                        .then(function (responseFilter) {
                            vm.defaultUserFilter = responseFilter.data;

                            if (vm.defaultUserFilter != null) {
                                if (vm.params.filterParams == null) {
                                    vm.params.filterParams = {};
                                    vm.params.filterParams.userFilterId = vm.defaultUserFilter.id;

                                    if (vm.filterParams == null) {
                                        vm.filterParams = {};
                                        vm.filterParams.userFilterId = vm.defaultUserFilter.id;
                                    }
                                }
                            }

                            $http.post($rootScope.app.httpSource + 'api/Enquiry/GetEnquiries', vm.params)
                                .then(function (resp) {
                                    vm.enquiries = resp.data.content;
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
                        });
                }
                else {
                    $http.post($rootScope.app.httpSource + 'api/Enquiry/GetEnquiries', vm.params)
                        .then(function (resp) {
                            vm.enquiries = resp.data.content;
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
                }
            }
            else if (vm.isTemporaryDelete === true) {
                var records = {
                    'draw': draw,
                    'recordsTotal': vm.enquiries.length,
                    'recordsFiltered': vm.enquiries.length,
                    'data': vm.enquiries
                };
                fnCallback(records);
            }
        }

        function createdRow(row, data, dataIndex) {
            $compile(angular.element(row).contents())($scope);
        };

        function rowCallback(tabRow, data, dataIndex) {

        };

        function workflowActionsHtml(data, type, full, meta) {
            var htmlSection;
            var index = vm.enquiries.indexOf(data);

            return '<div style="display:inline-block" class=""><workflow-action ng-model="enquiry.enquiries[' + index +
                ']" dtapplicationinstance="enquiry.dtApplicationInstance" application="enquiry.enquiries[' + index + ']"></workflow-action></div>';
        };

        function actionsHtml(data, type, full, meta) {
            if (vm.user.userTypeCode == "06") {
                //<a ui-sref="app.ReviewEnquiry({id:Id})">

                return '<div style="display:inline-block" class="list-icon"><div class="inline" ng-click="enquiry.actionList(' + data.id +
                    ',\'lg\')"><em class="fa fa-sitemap" style="cursor:pointer" uib-tooltip="' + vm.translateFilter('general.procedureList') +
                    '"></em></div><a class="inline" ui-sref="app.ReviewEnquiry({id:' + data.id + '})" ><em class="fa fa-search" style="cursor:pointer" uib-tooltip="' +
                    vm.translateFilter('general.review') + '"></em></a></div>';

            }
            else {
                return '<div style="display:inline-block" class="list-icon"><div class="inline" ng-click="enquiry.review(' + data.id +
                    ')"><em class="fa fa-search" style="cursor:pointer" uib-tooltip="' + vm.translateFilter('general.review') + '"></em></div></div>';
            }
        };

        vm.edit = function (applicationId, Id, applicationTypeId, serviceCode, serviceCategoryCode) {
            $state.go('app.MediaLicenseServices.JournalistsAppointmentIssuePressCard', { id: Id });
        };

        $scope.timelineOpened = false;

        vm.actionList = function (enquiryId, size) {
            if (!$scope.timelineOpened) {
                var modalInstance = $uibModal.open({
                    templateUrl: 'app/views/Employee/Timeline/timeline.html',
                    controller: 'TimelineController',
                    size: size,
                    resolve: {
                        applicationDetail: function () {
                            return $filter('filter')(vm.enquiries, { id: enquiryId }, true)[0];
                        },
                        application: function () {
                            return $filter('filter')(vm.enquiries, { id: enquiryId }, true)[0];
                        }
                    }
                });

                modalInstance.result.then(function (establishmentBranch) {
                    $scope.timelineOpened = false;
                }, function () {
                });

                // we want to update state whether the modal closed or was dismissed,
                // so use finally to handle both resolved and rejected promises.
                modalInstance.result.finally(function (selectedItem) {
                    $scope.timelineOpened = false;
                });
            }

            $scope.timelineOpened = true;
        };

        vm.review = function (Id) {
            $state.go('app.ReviewEnquiry', { id: Id });
        };

        var index;
        var tempStore;

        vm.delete = function (applicationDetailId, event) {
            if (applicationDetailId == 0 || applicationDetailId == undefined) {
                index = vm.dtApplicationInstance.DataTable.rows({ order: 'applied' }).nodes().indexOf(event.currentTarget.parentNode.parentNode.parentNode);
                tempStore = vm.enquiries[index];
                vm.enquiries.splice(index, 1);
            }
            else {
                for (var i = 0; i < vm.enquiries.length; i++) {
                    if (vm.enquiries[i].applicationDetails.length == 1) {
                        var applicationDetail = $filter('filter')(vm.enquiries[i].applicationDetails, { id: applicationDetailId }, true)[0];
                        if (applicationDetail != undefined) {
                            index = vm.enquiries.indexOf(vm.enquiries[i]);
                            tempStore = $filter('filter')(vm.enquiries[i].applicationDetails, { id: applicationDetailId }, true)[0];
                            vm.enquiries.splice(index, 1);
                            vm.isTemporaryDelete = true;
                            break;
                        }
                    }
                    else {
                        index = vm.enquiries[i].applicationDetails.indexOf($filter('filter')(vm.enquiries[i].applicationDetails, { id: applicationDetailId }, true)[0]);
                        if (index != -1) {
                            tempStore = $filter('filter')(vm.enquiries[i].applicationDetails, { id: applicationDetailId }, true)[0];
                            vm.enquiries[i].applicationDetails.splice(index, 1);
                            vm.isTemporaryDelete = true;
                            break;
                        }
                    }
                }
            }
            var translate = $filter('translate');
            vm.dtApplicationInstance.DataTable.draw();

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
                        $http.post($rootScope.app.httpSource + 'api/ApplicationDetail/DeleteApplicationDetail', tempStore)
                            .then(function (response) {
                                vm.isBusy = false;
                                SweetAlert.swal(translate('general.confirmDeleteBtn'), translate('general.deleteMessage'), "error");
                                vm.isTemporaryDelete = undefined;
                                vm.dtApplicationInstance.DataTable.draw();
                            },
                                function (response) { // optional
                                    SweetAlert.swal(translate('general.confirmDeleteBtn'), translate('general.deleteMessage'), "error");
                                });
                    } else {
                        SweetAlert.swal(translate('general.restoreBtn'), translate('general.restoreMessage'), "success");
                        vm.isTemporaryDelete = undefined;
                        vm.dtApplicationInstance.DataTable.draw();
                    }
                });
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

        vm.isObjectEmpty = function (card) {
            if (card) {
                return Object.keys(card).length === 0;
            }
            else {
                return true;
            }
        }

        vm.userFilterData = function (userFilter) {
            vm.filterParams = {};
            vm.filterParams.userFilterId = userFilter.id;
            vm.selectedUserFilter = userFilter;
            vm.dtApplicationInstance.DataTable.draw();
        }

        vm.removeFilter = function ($scope) {
            vm.filterParams = {};
            vm.dtApplicationInstance.DataTable.draw();
        }

        vm.open = function (size) {
            var modalInstance = $uibModal.open({
                templateUrl: 'app/views/Enquiry/enquiries/AddEnquiry/addEnquiry.html',
                controller: 'AddEnquiryController',
                size: size,
                backdrop: 'static',
                resolve: {
                    enquiry: function () {
                        return null;
                    },
                    userType: function () {
                        return vm.user.userTypeCode;
                    }
                }
            });

            modalInstance.result.then(function (enquiry) {
                vm.insertEnquiry(enquiry);
            },
                function () {
                });
        };

        ///Insert Enquiry
        vm.insertEnquiry = function (enquiry) {
            vm.loading = true;
            if (enquiry.hasBeenResolved && vm.user.userTypeCode == '06') {
                enquiry.enquiryDetails = [];
                var enquiryDetail = {};
                enquiryDetail.priorityId = 3;
                enquiryDetail.departmentId = 8;
                enquiryDetail.resolutionDesc = enquiry.resolutionDesc;
                delete enquiry.resolutionDesc;
                enquiryDetail.attachementUrl = enquiry.attachementUrl2;
                delete enquiry.attachementUrl2;
                enquiry.enquiryDetails.push(enquiryDetail);
            }
            vm.lang = $rootScope.language.selected !== 'English' ? 'ar' : 'en';

            $http.post($rootScope.app.httpSource + 'api/Enquiry/SaveEnquiry', enquiry)
                .then(
                    function (response) {
                        vm.enquirId = response.data;

                        $http.get($rootScope.app.httpSource + 'api/UserProfile')
                            .then(function (resp) {
                                if (resp.data != null) {
                                    vm.userProfile = resp.data;

                                    vm.request = {};
                                    vm.request.meta_data = {};
                                    vm.request.meta_data.customer = {};
                                    vm.request.meta_data.employee = {};

                                    vm.request.meta_data.customer.emirates_id = (vm.userProfile.person.emiratesId != null && vm.userProfile.person.emiratesId.length == 18) ? vm.userProfile.person.emiratesId.replaceAll("-", "") : "";
                                    vm.request.meta_data.customer.name = vm.userProfile.person.name;
                                    vm.request.meta_data.customer.email = vm.userProfile.user.email;
                                    vm.request.meta_data.customer.mobile = vm.userProfile.user.phoneNumber;
                                    vm.request.meta_data.customer.gender = vm.userProfile.person.gender.nameEn.toLowerCase();
                                    vm.request.meta_data.customer.nationality = vm.userProfile.person.country.isoCode2;
                                    vm.request.meta_data.customer.user_id = vm.userProfile.user.id;
                                    vm.request.meta_data.transaction_id = vm.enquirId;
                                    vm.request.linking_id = "C/Af/CCGc/";
                                }
                                $http.post($rootScope.app.httpSource + 'api/PMOPulse/GetToken', vm.request)
                                    .then(function (response) {
                                        vm.loading = false;
                                        if (response.data != "") {
                                            vm.customerToken = response.data;

                                            window.CustomerPulse.render(
                                                document.getElementById('pulse-happiness-meter-widget-container'),
                                                {
                                                    modal: true,
                                                    token: vm.customerToken,
                                                    lang: vm.lang
                                                },
                                            );
                                            window.CustomerPulse.openModal();

                                            window.addEventListener('so-widget-completed', () => {
                                                //SweetAlert.swal($filter('translate')('establishment.success'), $filter('translate')('enquiries.enquiryAdded'), 'success');
                                                vm.dtApplicationInstance.DataTable.draw();
                                            });

                                            window.addEventListener('so-widget-closed', () => {
                                                console.log('modal has been closed.');
                                                vm.dtApplicationInstance.DataTable.draw();
                                            });

                                        }
                                        else {
                                            console.log('no survey has been completed.');
                                            SweetAlert.swal($filter('translate')('establishment.success'), $filter('translate')('enquiries.enquiryAdded'), 'success');
                                            vm.dtApplicationInstance.DataTable.draw();
                                        }
                                    })
                            })
                    },
                    function (error) {
                        SweetAlert.swal($filter('translate')('establishment.error'), $filter('translate')('enquiries.wrongApplication'), 'error');
                    });
        }
    }
})();