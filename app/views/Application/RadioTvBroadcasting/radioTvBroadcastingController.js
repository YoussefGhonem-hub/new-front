/**=========================================================
 * Module: LoginController.js
 * Controller for the Chat APP 
 =========================================================*/

(function () {
    'use strict';

    angular
        .module('eServices')
        .controller('RadioTvBroadcastingController', RadioTvBroadcastingController);

    function RadioTvBroadcastingController($rootScope, $scope, $http, $stateParams, $state, $window, $uibModal, $filter, UserProfile, browser, DTOptionsBuilder, DTColumnBuilder, $compile) {
        var vm = this;
        vm.serviceFeesObj = { serviceId: 8, serviceFee: [], numberOfLanguages: 0, isRenew: false, emirateId: 0 };

        vm.goToSecondStep = function () {
            vm.activeStep = 2;
        }

        vm.goToThirdStep = function () {
            vm.activeStep = 3;
        }

        vm.goToFourthStep = function () {
            vm.activeStep = 4;
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
        }

        vm.preventLeadingZero = function () {
            if ((vm.license.chiefEditors[0].phoneNumber == undefined || vm.license.chiefEditors[0].phoneNumber.length == 0) && event.which == 48) {
                event.preventDefault();
            }
        }

        vm.translateFilter = $filter('translate');
        vm.dtPartnerInstance = {};

        vm.partnerActionsHtml = function (data, type, full, meta) {
            var htmlSection = '';

            htmlSection = '<div class="list-icon"><div class="inline" ng-click="radioCtl.editPartner(\'lg\',' +
                data.id + ', $event)"><em class="fa fa-pencil" style="cursor:pointer" uib-tooltip="' +
                vm.translateFilter('general.edit') + '"></em></div></div>';

            return htmlSection;
        };

        vm.partnerCountryHtml = function (data, type, full, meta) {
            var htmlSection = '';

            if (data.person) {
                htmlSection = '<div><span>' + $filter('localizeString')(data.person.country) + '</span></div>';
            }
            else {
                htmlSection = '<div><span>' + $filter('localizeString')(data.partnerEstablishment.country) + '</span></div>';
            }

            return htmlSection;
        };

        vm.partnerCountryFlagHtml = function (data, type, full, meta) {
            var htmlSection = '';

            if (data.person) {
                htmlSection = '<div><span><img class="img-responsive" style="display:inline-block; padding-left:10px; padding-right: 10px; max-width:60px" src="../src/imgs/Countries/' +
                    data.person.country.isoCode2 + '.png" /></span></div>';
            }
            else {
                htmlSection = '<div><span><img class="img-responsive" style="display:inline-block; padding-left:10px; padding-right: 10px; max-width:60px" src="../src/imgs/Countries/' +
                    data.partnerEstablishment.country.isoCode2 + '.png" /></span></div>';
            }

            return htmlSection;
        };

        vm.editPartner = function (size, personId, event) {
            var modalInstance = $uibModal.open({
                templateUrl: 'app/views/Account/completeProfile/establishmentPartner/establishmentPartner.html',
                controller: 'EstablishmentPartnerController',
                size: size,
                resolve: {
                    establishmentPartner: function () {
                        return $filter('filter')(vm.licenseOwners, { id: personId }, true)[0];
                    }
                }
            });

            modalInstance.result.then(function (establishmentPartner) {
                var partner = $filter('filter')(vm.licenseOwners, { id: establishmentPartner.id }, true)[0];
                partner = establishmentPartner;
                $http.post($rootScope.app.httpSource + 'api/EstablishmentPartner/UpdateEstablishmentPartner', partner)
                    .then(
                        function (response) {
                            vm.dtPartnerInstance.rerender();
                        },
                        function (response) {

                        });

            }, function () { });
        };

        vm.createdRow = function (row, data, dataIndex) {
            $compile(angular.element(row).contents())($scope);
        }

        vm.serverPartnerData = function (sSource, aoData, fnCallback, oSettings) {
            var establishmentId = vm.editMode ? vm.mediaLicenses.applicationDetail.application.establishment.id : $state.params.establishmentId;

            $http.get($rootScope.app.httpSource + 'api/Establishment/GetLicenseOwners?estId=' + establishmentId)
                .then(function (response) {
                    var draw = aoData[0].value;
                    var records;
                    vm.licenseOwners = response.data;

                    for (var i = 0; i < vm.licenseOwners.length; i++) {
                        vm.licenseOwners[i].requireAcquintanceForm = true;
                    }

                    if (vm.licenseOwners.length > 0) {
                        records = {
                            'draw': draw,
                            'recordsTotal': vm.licenseOwners.length,
                            'recordsFiltered': vm.licenseOwners.length,
                            'data': vm.licenseOwners
                        };
                    }
                    else {
                        records = {
                            'draw': draw,
                            'recordsTotal': 0,
                            'recordsFiltered': 0,
                            'data': vm.licenseOwners
                        };
                    }

                    fnCallback(records);
                });
        };

        vm.Init = function () {
            vm.activeStep = 1;
            vm.terms = {};
            vm.user = UserProfile.getProfile();
            vm.happinessMeterObj = {};
            vm.happinessMeterObj.serviceId = 8;
            vm.happinessMeterObj.applicationType = {};
            vm.happinessMeterObj.applicationType.pmoCode = "000";

            // -----------------------------------
            // File Uploading Handlers
            // -----------------------------------
            vm.uploadfeasibilityStudyUrl = 'api/Upload/UploadFile?uploadFile=FeasibilityStudyPath';
            vm.uploadcompanysObjectiveUrl = 'api/Upload/UploadFile?uploadFile=companysObjectivePath';

            $http.get($rootScope.app.httpSource + 'api/UserProfile')
                .then(function (resp) {
                    if (resp.data != null) {
                        vm.userProfile = resp.data;
                        if (vm.userProfile.address.community.regionId == 2 || vm.userProfile.address.community.regionId == 3 || vm.userProfile.address.community.regionId == 4)
                            vm.serviceFeesObj.emirateId = 1;
                        if (vm.userProfile.address.community.regionId == 5)
                            vm.serviceFeesObj.emirateId = 7;
                        if (vm.userProfile.address.community.regionId == 6)
                            vm.serviceFeesObj.emirateId = 8;
                        if (vm.userProfile.address.community.regionId == 9)
                            vm.serviceFeesObj.emirateId = 10;
                        if (vm.userProfile.address.community.regionId == 11)
                            vm.serviceFeesObj.emirateId = 6;
                        if (vm.userProfile.address.community.regionId == 13)
                            vm.serviceFeesObj.emirateId = 12;
                    }
                });

            $http.get($rootScope.app.httpSource + 'api/Office')
                .then(function (response) {
                    vm.mediaLicenses.offices = response.data;
                });

            $http.get($rootScope.app.httpSource + 'api/Language')
                .then(function (response) {
                    vm.mediaLicenses.tVs[0].languages = response.data;
                });

            $scope.$watch('radioCtl.mediaLicenses.tVs[0].isRadio', function (newVal, oldVal) {
                if (newVal != undefined) {
                    vm.serviceFeesObj.isRadio = newVal;
                    vm.serviceFeesObj.reloadTable();
                }
            });

            $scope.$watch('radioCtl.mediaLicenses.tVs[0].isEncrypted', function (newVal, oldVal) {
                if (newVal != undefined) {
                    vm.serviceFeesObj.isEncrypted = newVal;
                    vm.serviceFeesObj.reloadTable();
                }
            });

            $scope.$watch('radioCtl.mediaLicenses.tVs[0].selectedLangauges', function (newVal, oldVal) {
                if (newVal != undefined) {
                    vm.serviceFeesObj.numberOfLanguages = newVal.length;
                    vm.serviceFeesObj.reloadTable();
                }
            });

            if ($rootScope.language.selected !== 'English') {
                vm.dtPartnerOptions = DTOptionsBuilder.newOptions()
                    .withFnServerData(vm.serverPartnerData)
                    .withOption('serverSide', true)
                    .withDataProp('data')
                    .withOption('processing', true)
                    .withOption('responsive', true)
                    .withOption('bFilter', false)
                    .withOption('paging', false)
                    .withOption('info', false)
                    .withLanguageSource('app/langs/ar.json')
                    .withOption('createdRow', vm.createdRow)
                    .withOption('rowCallback', vm.rowCallback).withBootstrap();
            }
            else {
                vm.dtPartnerOptions = DTOptionsBuilder.newOptions()
                    .withFnServerData(vm.serverPartnerData)
                    .withOption('serverSide', true)
                    .withDataProp('data')
                    .withOption('processing', true)
                    .withOption('responsive', true)
                    .withOption('bFilter', false)
                    .withOption('paging', false)
                    .withOption('info', false)
                    .withLanguageSource('app/langs/en.json')
                    .withOption('createdRow', vm.createdRow)
                    .withOption('rowCallback', vm.rowCallback).withBootstrap();
            }

            vm.dtPartnerColumns = [
                DTColumnBuilder.newColumn('person.name').withTitle(vm.translateFilter('completeProfile.name')),
                DTColumnBuilder.newColumn('id').notVisible(),
                DTColumnBuilder.newColumn(null).withTitle(vm.translateFilter('profileNationalityDirective.Nationality')).renderWith(vm.partnerCountryHtml),
                DTColumnBuilder.newColumn(null).withTitle(' ').renderWith(vm.partnerCountryFlagHtml),
                DTColumnBuilder.newColumn('person.emiratesId').withTitle(vm.translateFilter('profileNationalityDirective.EmiratesId')),
                DTColumnBuilder.newColumn('person.dateOfBirth').withTitle(vm.translateFilter('profileNationalityDirective.DateOfBirth')).renderWith(function (data, type) {
                    return $filter('date')(data, 'dd-MMMM-yyyy');
                }),
                DTColumnBuilder.newColumn(null).withTitle(vm.translateFilter('general.actions')).notSortable()
                    .renderWith(vm.partnerActionsHtml).withOption('width', '15%')];
        };

        //New Form Condition
        if ($state.params === undefined || $state.params.id === undefined || $state.params.id === "") {
            vm.editMode = false;
            // New Permit
            vm.mediaLicenses = {
                applicationDetail: {
                    payments: [{
                        paymentDetails: []
                    }],
                    browser: {
                        name: browser.name
                    },
                    platform: {
                        name: browser.platform
                    },
                    versionNumber: browser.versionNumber,
                    application: {
                        serviceId: 8,
                    }
                },
                chiefEditors: [{
                    person: {},
                    address: {}
                }],
                tVs: [{
                    Name: "",
                    languages: [],
                    selectedLanguages: []
                }]
            };

            vm.mediaLicenses.applicationDetail.application.establishment = {};
            $http.get($rootScope.app.httpSource + 'api/Establishment/GetById?id=' + $state.params.establishmentId)
                .then(function (response) {
                    vm.mediaLicenses.applicationDetail.application.establishment = response.data;
                });

            vm.Init();
        }
        else {
            //Get the details of the submitted Form to edit
            $http.get($rootScope.app.httpSource + 'api/MediaLicense/GetById?id=' + $state.params.id)
                .then(function (response) {
                    vm.editMode = true;
                    vm.mediaLicenses = response.data;
                    vm.Init();
                });
        }

        //Save the details to the server
        vm.save = function (applicationStatusId) {
            vm.isBusy = true;
            vm.mediaLicenses.mediaLicenseEconomicActivities = [];

            if (vm.serviceFeesObj.serviceFee[0] != null) {
                vm.serviceFeesObj.serviceFee = vm.serviceFeesObj.serviceFee.filter(function (item) {
                    return item.fee !== 0;
                });
                vm.mediaLicenses.applicationDetail.payments[0].paymentDetails = vm.serviceFeesObj.serviceFee;

                for (var i = 0; i < vm.serviceFeesObj.serviceFee.length; i++) {
                    if (vm.serviceFeesObj.serviceFee[i].economicActivity != null) {
                        vm.mediaLicenses.mediaLicenseEconomicActivities.push({ economicActivity: vm.serviceFeesObj.serviceFee[i].economicActivity });
                    }
                }
            }
            else {
                vm.mediaLicenses.applicationDetail.payments = null;
                if (vm.mediaLicenses.tVs[0].isRadio) {
                    if (vm.mediaLicenses.tVs[0].isEncrypted) {
                        vm.mediaLicenses.mediaLicenseEconomicActivities.push({ economicActivity: { id: 25, isRequireThirdPartyApproval: true } });
                    }
                    else {
                        vm.mediaLicenses.mediaLicenseEconomicActivities.push({ economicActivity: { id: 27, isRequireThirdPartyApproval: true } });
                    }
                }
                else {
                    if (vm.mediaLicenses.tVs[0].isEncrypted) {
                        vm.mediaLicenses.mediaLicenseEconomicActivities.push({ economicActivity: { id: 26, isRequireThirdPartyApproval: true } });
                    }
                    else {
                        vm.mediaLicenses.mediaLicenseEconomicActivities.push({ economicActivity: { id: 5, isRequireThirdPartyApproval: true } });
                    }
                }
            }

            if ($rootScope.app.isPMOHappiness) {
                switch (applicationStatusId) {
                    case 1:
                        $http.post($rootScope.app.httpSource + 'api/MediaLicense/SaveMediaLicense', vm.mediaLicenses)
                            .then(function (response) {
                                vm.happinessMeterObj.transactionId = response.data;
                                vm.showHappinessMeter = true;
                            },
                                function (response) { // optional
                                    vm.isBusy = false;
                                });

                        break;

                    case 2:
                        $http.post($rootScope.app.httpSource + 'api/MediaLicense/SubmitMediaLicense', vm.mediaLicenses)
                            .then(function (response) {
                                vm.happinessMeterObj.transactionId = response.data;
                                vm.showHappinessMeter = true;
                            },
                                function (response) { // optional
                                    vm.isBusy = false;
                            });

                        break;
                }
            }
            else {
                var modalInstance = $uibModal.open({
                    templateUrl: 'app/views/Controls/happinessRating/happinessRating.html',
                    controller: 'HappinessRatingController',
                    size: 'lg',
                    keyboard: false,
                    backdrop: 'static'
                });

                modalInstance.result.then(function (happinessRate) {
                    vm.mediaLicenses.applicationDetail.happinessRate = happinessRate;
                    //Post to save
                    switch (applicationStatusId) {
                        case 1:
                            $http.post($rootScope.app.httpSource + 'api/MediaLicense/SaveMediaLicense', vm.mediaLicenses)
                                .then(function (response) {
                                    $state.go('app.dashboard');
                                },
                                    function (response) { // optional
                                        vm.isBusy = false;
                                    });
                            break;

                        case 2:
                            $http.post($rootScope.app.httpSource + 'api/MediaLicense/SubmitMediaLicense', vm.mediaLicenses)
                                .then(function (response) {
                                    $state.go('app.dashboard');
                                },
                                    function (response) { // optional
                                        vm.isBusy = false;
                                    });
                            break;
                    }
                });
            }
        }

        vm.workflowClick = function (actionId) {
            vm.isBusy = true;
            switch (actionId) {

                case 1:
                    $http.post($rootScope.app.httpSource + 'api/MediaLicense/UpdateMediaLicense', vm.mediaLicenses)
                        .then(function (response) {
                            $state.go('app.dashboard');
                        },
                            function (response) { // optional
                                vm.isBusy = false;
                            });
                    break;

                case 2:
                    $http.post($rootScope.app.httpSource + 'api/MediaLicense/SubmitUpdateMediaLicense', vm.mediaLicenses)
                        .then(function (response) {
                            $state.go('app.dashboard');
                        },
                            function (response) { // optional
                                vm.isBusy = false;
                            });
                    break;
            }
        }
    }

    RadioTvBroadcastingController.$inject = ['$rootScope', '$scope', '$http', '$stateParams', '$state', '$window', '$uibModal', '$filter', 'UserProfile', 'browser', 'DTOptionsBuilder',
        'DTColumnBuilder', '$compile'];

})();