/**=========================================================
 * Module: LoginController.js
 * Controller for the Chat APP 
 =========================================================*/

(function () {
    'use strict';

    angular
        .module('eServices')
        .controller('visitController', visitController);

    function visitController($rootScope, $scope, $http, $stateParams, $state, $window, $uibModal, UserProfile, browser, $compile, $filter, DTOptionsBuilder, DTColumnBuilder, SweetAlert) {
        var vm = this;
        vm.visitDetOpen = true;
        vm.translateFilter = $filter('translate');
        vm.uploadEstablishmentEntranceUrl = 'api/Upload/UploadFile?uploadFile=EstablishmentEntrancePath';
        vm.uploadViolationPhotoUrl = 'api/Upload/UploadFile?uploadFile=InspectionViolationPhoto';
        vm.serviceFeesObj = { serviceId: 15, serviceFee: [], ViolationIds: [] };
        vm.locAddress = {};
        vm.establishment = { id: 0 };
        vm.establishmentHasPrevVists = true;

        vm.individualUser = { id: 0 };
        vm.isIndividual = false;
        vm.locAddressGeolocation = {};


        $http.get($rootScope.app.httpSource + 'api/EstablishmentVisitStatus')
            .then(function (response) {
                vm.establishmentVisitStatuses = response.data;
            },
                function (response) { });

        $http.get($rootScope.app.httpSource + 'api/InspectionVisitViolation')
            .then(function (response) {
                vm.violationReasons = response.data;
            },
                function (response) { // optional
                    alert('failed');
                });

        vm.goToSecondStep = function () {
            if (vm.visit.establishmentVisitStatus.id == 3) {
                vm.activeStep = 2;
            }
            else {
                vm.save(1);
            }
        }

        vm.goToThirdStep = function () {
            vm.activeStep = 3;
        }

        vm.goToFourthStep = function () {
            vm.activeStep = 4;
        }

        vm.goToFifthStep = function () {
            vm.activeStep = 5;
        }

        vm.previousToFourthStep = function () {
            vm.activeStep = 4;
            vm.returnBack = true;
        }

        vm.previousToThirdStep = function () {
            vm.activeStep = 3;
            vm.returnBack = true;
        }

        vm.previousToSecondStep = function () {
            vm.activeStep = 2;
            vm.returnBack = true;
        }

        vm.previousToFirstStep = function () {
            vm.activeStep = 1;
            vm.returnBack = true;
        };

        vm.preventLeadingZero = function () {
            if ((vm.visit.contactPhone == undefined || vm.visit.contactPhone.length == 0) && event.which == 48) {
                event.preventDefault();
            }
        }



        vm.getLocation = function () {

            var modalInstance = $uibModal.open({
                templateUrl: 'app/views/Inspection/maps/maps.html',
                controller: 'mapsController',
                backdrop: 'static',
                keyboard: false,
                size: 'lg',
                resolve: {
                    establishment: function () {
                        if (vm.locAddress.latitude) {
                            vm.establishment.address.latitude = vm.locAddress.latitude;
                            vm.establishment.address.longitude = vm.locAddress.longitude;
                        }
                        vm.establishment.isDraggable = true;
                        return vm.establishment;
                    }
                }
            });

            modalInstance.result.then(function (establishmentBranch) {
                $http.post($rootScope.app.httpSource + 'api/Address/UpdateAddress', establishmentBranch.address)
                    .then(function (response) {

                    },
                        function (response) { // optional
                            //vm.isBusy = false;
                        });
            }, function () { });

            // we want to update state whether the modal closed or was dismissed,
            // so use finally to handle both resolved and rejected promises.
            modalInstance.result.finally(function (selectedItem) {

            });
        }

        vm.mapsSelector = function () {
            if ((navigator.platform.indexOf("iPhone") != -1) ||
                (navigator.platform.indexOf("iPad") != -1) ||
                (navigator.platform.indexOf("iPod") != -1)) {
                let url = "https://maps.google.com/maps?daddr=" + vm.establishment.address.latitude + "," + vm.establishment.address.longitude + "&amp;l5=";
                var wnd = window.open(url);
                SweetAlert.swal({
                    title: "Hello",
                    text: "Did you reach to the exact location ?.",
                    type: "warning",
                    showCancelButton: true,
                    confirmButtonClass: "btn-danger",
                    confirmButtonText: "Yes",
                    cancelButtonText: "No",
                    closeOnConfirm: false,
                    closeOnCancel: false
                },
                    function (isConfirm) {
                        if (isConfirm) {
                            swal("", "Thank You. :)", "success");
                        } else {
                            swal("", "Please try again.", "error");
                        }
                    });
                wnd.close();
            }
            else {
                window.open("https://maps.google.com/maps?daddr=" + vm.establishment.address.latitude + "," + vm.establishment.address.longitude + "&amp;l5=");
            }
        }

        vm.Init = function () {
            vm.isBusy = false;
            vm.activeStep = 1;
            vm.terms = {};
            vm.user = UserProfile.getProfile();
            vm.selectedList = {};

            //visit photo add Datatable
            vm.visitSignDt = {};

            for (var i = 0; i < vm.violationReasons.length; i++) {
                var exsits = $filter('filter')(vm.visit.selectedvisitViolations, { 'id': vm.violationReasons[i].id });
                if (exsits.length == 0)
                    vm.visit.selectedvisitViolations.push(vm.violationReasons[i]);
            }

            vm.visit.selectedvisitViolations = vm.visit.selectedvisitViolations.sort(function (a, b) {
                return a.id - b.id;
            });
            $scope.$watch('vm.visit.establishmentVisitStatus', function (newVal, oldVal) {
                if (newVal != undefined) {
                    if (newVal.id == 1 | newVal.id == 2 | newVal.id == 3) {
                        vm.isBusy = false;
                    }
                    else if (newVal.id == 4) {
                        vm.isBusy = true;
                    }
                }
            });
        };

        vm.changeViolations = function (obj) {
            var selectedViolations = $filter('filter')(vm.visit.selectedvisitViolations, { selected: true });
            vm.serviceFeesObj.ViolationIds = [];
            vm.serviceFeesObj.ViolationIds = selectedViolations.map(viol => viol.violationId ? viol.violationId : viol.id);
            vm.serviceFeesObj.reloadTable();
        };

        function getPosition(position) {
            vm.locAddress.latitude = position.coords.latitude;
            vm.locAddress.longitude = position.coords.longitude;
        }

        function getGeoPosition(position) {
            vm.locAddressGeolocation.latitude = position.coords.latitude;
            vm.locAddressGeolocation.longitude = position.coords.longitude;
        }

        function getCurrentLocation() {
            if (vm.establishment.id != 0) {
                if (vm.establishment.address.longitude == null || vm.establishment.address.latitude == null) {
                    navigator.geolocation.getCurrentPosition(getPosition);
                }
            }
        }

        function getCurrentGeoLocation() {
            if (vm.establishment.id != 0) {
                navigator.geolocation.getCurrentPosition(getGeoPosition);
            }
        }
        vm.changeGeoLocation = function () {

            var translate = $filter('translate');
            var modalInstance = $uibModal.open({
                templateUrl: 'app/views/Inspection/maps/maps.html',
                controller: 'mapsController',
                backdrop: 'static',
                keyboard: false,
                size: 'lg',
                resolve: {
                    establishment: function () {
                        if (vm.locAddressGeolocation.latitude) {
                            vm.establishment.address.latitude = vm.locAddressGeolocation.latitude;
                            vm.establishment.address.longitude = vm.locAddressGeolocation.longitude;
                        }
                        vm.establishment.isDraggable = true;
                        return vm.establishment;
                    }
                }
            });

            modalInstance.result.then(function (establishmentBranch) {
                $http.post($rootScope.app.httpSource + 'api/Address/UpdateAddress', establishmentBranch.address)
                    .then(function (response) {
                        SweetAlert.swal(translate('general.ok'), translate('visit.geoLocationSuccess'), "success");
                    },
                        function (response) { // optional
                            //vm.isBusy = false;
                        });
            }, function () { });

            // we want to update state whether the modal closed or was dismissed,
            // so use finally to handle both resolved and rejected promises.
            modalInstance.result.finally(function (selectedItem) {

            });
        }

        // new form
        if ($state.params === undefined || $state.params.visitId === undefined || $state.params.visitId === "") {
            //Get the details of the submitted Form to edit
            $http.get($rootScope.app.httpSource + 'api/Establishment/GetById?id=' + $state.params.establishmentId)
                .then(function (response) {
                    vm.editMode = false;
                    vm.establishment = response.data;

                    vm.visit = {
                        selectedvisitViolations: [],
                        establishment: vm.establishment,
                        visitViolations: [],
                        establishmentVisitStatuses: [],
                        visitPhotos: [],
                        visitBooks: [],
                        visitRetainedMaterials: [],
                        payments: [{
                            paymentDetails: []
                        }]
                    };

                    vm.Init();
                    getCurrentLocation();
                    getCurrentGeoLocation();
                },
                    function (response) {
                        vm.isBusy = false;
                        if (response.status == 400) {
                            $http.get($rootScope.app.httpSource + 'api/UserProfile/GetByUserId?userId=' + $state.params.establishmentId)
                                .then(function (response) {
                                    vm.editMode = false;
                                    vm.isIndividual = true;
                                    vm.individualUser = response.data;

                                    vm.visit = {
                                        selectedvisitViolations: [],
                                        userProfile: vm.individualUser,
                                        visitViolations: [],
                                        establishmentVisitStatuses: [],
                                        visitPhotos: [],
                                        visitBooks: [],
                                        visitRetainedMaterials: [],
                                        payments: [{
                                            paymentDetails: []
                                        }]
                                    };
                                    vm.Init();
                                })
                        }
                    }
                );
        }
        else {
            //Get the details of the submitted Form to edit
            $http.get($rootScope.app.httpSource + 'api/Visit/GetVisitById?visitId=' + $state.params.visitId)
                .then(function (response) {
                    vm.editMode = true;
                    vm.visit = response.data;
                    if (vm.visit.establishment != null && vm.visit.establishment.licenseNumber != '900098_9') {
                        vm.establishment = vm.visit.establishment;
                    }
                    else {
                        vm.individualUser = vm.visit.userProfile;
                        vm.isIndividual = true;
                    }

                    for (var i = 0; i < response.data.visitViolations.length; i++) {
                        vm.serviceFeesObj.ViolationIds[i] = response.data.visitViolations[i].violationId;
                    }

                    for (var i = 0; i < vm.visit.selectedvisitViolations.length; i++) {
                        vm.visit.selectedvisitViolations[i].selected = true;
                    }

                    vm.Init();
                    getCurrentLocation();
                    getCurrentGeoLocation();
                });
        }

        $http.get($rootScope.app.httpSource + 'api/ApplicationDetail/GetByEstablishmentId?establishmentId=' + $state.params.establishmentId)
            .then(function (response) {
                vm.applicationDetail = response.data;
                gridTable();
            }, function (response) {
            });

        function gridTable() {
            //Members Datatable
            vm.teamMemberDt = {};
            vm.teamMemberDt.dtInstance = {};
            vm.teamMemberDt.serverData = function (sSource, aoData, fnCallback, oSettings) {
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
                    'recordsTotal': vm.applicationDetail.certificates[0].certificateDetails.length,
                    'recordsFiltered': vm.applicationDetail.certificates[0].certificateDetails.length,
                    'data': vm.applicationDetail.certificates[0].certificateDetails
                };

                fnCallback(records);
            };

            vm.teamMemberDt.createdRow = function (row, data, dataIndex) {
                // Recompiling so we can bind Angular directive to the DT
                $compile(angular.element(row).contents())($scope);
            };

            if ($rootScope.language.selected !== 'English') {
                vm.teamMemberDt.dtOptions = DTOptionsBuilder.newOptions()
                    .withFnServerData(vm.teamMemberDt.serverData)
                    .withOption('serverSide', true)
                    .withDataProp('data')
                    .withOption('processing', true)
                    .withOption('responsive', true)
                    .withLanguageSource('app/langs/ar.json')
                    .withOption('bFilter', false)
                    .withOption('paging', false)
                    .withOption('info', false)
                    .withOption('createdRow', vm.teamMemberDt.createdRow).withBootstrap();
            }
            else {
                vm.teamMemberDt.dtOptions = DTOptionsBuilder.newOptions()
                    .withFnServerData(vm.teamMemberDt.serverData)
                    .withOption('serverSide', true)
                    .withDataProp('data')
                    .withOption('processing', true)
                    .withOption('responsive', true)
                    .withOption('bFilter', false)
                    .withOption('paging', false)
                    .withOption('info', false)
                    .withOption('createdRow', vm.teamMemberDt.createdRow).withBootstrap();
            };

            vm.teamMemberDt.dtColumns = [
                DTColumnBuilder.newColumn('mediaLicenseEconomicActivity.economicActivity').withTitle(vm.translateFilter('mediaLicense.economicActivity')).renderWith(
                    function (data, type) {
                        return $filter('localizeString')(data);
                    }),
                DTColumnBuilder.newColumn('issueDate').withTitle(vm.translateFilter('mediaLicense.issueDate')).renderWith(
                    function (data, type) {
                        return moment(data).format('DD-MMMM-YYYY');
                    }),
                DTColumnBuilder.newColumn('expiryDate').withTitle(vm.translateFilter('mediaLicense.expiryDate')).renderWith(
                    function (data, type) {
                        return moment(data).format('DD-MMMM-YYYY');
                    })
            ];
        }

        //Save the details to the server
        vm.save = function (applicationStatusId) {

            if (vm.visit.establishmentVisitStatus.id == 2) {
                if (vm.establishment.address.latitude == null && vm.establishment.address.longitude == null) {
                    vm.showRequiredError = true;
                    return;
                }
            }
            vm.isBusy = true;
            var translate = $filter('translate');

            //service fee
            if (vm.serviceFeesObj.serviceFee[0] != null) {
                if (vm.visit.payments.length == 0) {
                    vm.visit.payments = [{ paymentDetails: [] }];
                }
                vm.visit.payments[0].paymentDetails = vm.serviceFeesObj.serviceFee;
            }

            if (vm.serviceFeesObj.serviceFee[0] != null) {
                vm.visit.payments[0].paymentDetails = vm.serviceFeesObj.serviceFee;
            }
            else {
                vm.visit.payments = null;
            }

            vm.visit.selectedvisitViolations = $filter('filter')(vm.visit.selectedvisitViolations, { 'selected': true });
            $http.post($rootScope.app.httpSource + 'api/Visit/SaveVisit', vm.visit)
                .then(function (res) {
                    if (res.data === true) {
                        vm.isBusy = false;
                        SweetAlert.swal(translate('general.ok'), translate('visit.visitSubmittedSuccessfully'), "success");
                        $state.go('app.visits');
                    } else {
                        SweetAlert.swal(translate('general.ok'), translate('visit.visitSubmittedError'), "error");
                    }
                },
                    function (reserr) {
                        vm.isBusy = false;
                        SweetAlert.swal(translate('general.ok'), translate('visit.visitSubmittedError'), "error");

                    });
        };

        vm.addvisitphotos = function (size) {
            var modalInstance = $uibModal.open({
                templateUrl: 'app/views/Inspection/visit/VisitPhotos/visitphotos.html',
                controller: 'VisitPhotoController',
                size: size,
                resolve: {
                    violationphotos: function () {
                        return null;
                    }
                }
            });
            modalInstance.result.then(function (violationphotos) {
                if (vm.visit.visitPhotos == undefined) {
                    vm.visit.visitPhotos = [];
                }
                violationphotos.id = 0;
                violationphotos.visitPhotoUrl = violationphotos.visitPhotoUrl;
                violationphotos.visitPhotoUrlFullPath = violationphotos.visitPhotoUrlFullPath;
                vm.visit.visitPhotos.push(violationphotos);
                vm.showRequiredErrorforvisitphoto = false;
            }, function () {
                //state.text('Modal dismissed with Cancel status');
            });
        };

        vm.deleteVisitPhotos = function (index) {
            vm.visit.visitPhotos.splice(index, 1);
        };

        vm.estMlOpen = false;
        vm.estDetisOpen = false;
    }

    visitController.$inject = ['$rootScope', '$scope', '$http', '$stateParams', '$state', '$window', '$uibModal', 'UserProfile', 'browser', '$compile', '$filter', 'DTOptionsBuilder',
        'DTColumnBuilder', 'SweetAlert'];
})();