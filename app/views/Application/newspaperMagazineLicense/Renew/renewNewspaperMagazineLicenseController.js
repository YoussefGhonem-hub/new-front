(function () {
    'use strict';

    angular
        .module('eServices')
        .controller('RenewNewspaperMagazineLicenseController', RenewNewspaperMagazineLicenseController);

    function RenewNewspaperMagazineLicenseController($rootScope, $scope, $http, $stateParams, $state, WizardHandler, $uibModal, browser, $timeout, DTOptionsBuilder, DTColumnBuilder, $compile,
        $filter, SweetAlert, UserProfile) {
        var vm = this;
        vm.translateFilter = $filter('translate');
        vm.dtPartnerInstance = {};
        vm.serviceFeesObj = { serviceId: 12, serviceFee: [], numberOfLanguages: 0, isRenew: true, economicActivityIds: [], emirateId: 0 };
        vm.user = UserProfile.getProfile();

        vm.releaseTypes = [];
        vm.licenseOwners = [];

        vm.uploadRegistrationUrl = 'api/Upload/UploadFile?uploadFile=NewspaperRegistration';

        vm.goBackFromLast = function () {
            if (vm.license.newspapers[0].releaseTypeId == 2) {
                vm.activeStep = 2;
            }
            else {
                vm.activeStep = 3;
            }
        };

        vm.preventLeadingZero = function () {
            if ((vm.license.chiefEditors[0].phoneNumber == undefined || vm.license.chiefEditors[0].phoneNumber.length == 0) && event.which == 48) {
                event.preventDefault();
            }
        }

        vm.partnerActionsHtml = function (data, type, full, meta) {
            var htmlSection = '';

            htmlSection = '<div class="list-icon"><div class="inline" ng-click="vm.editPartner(\'lg\',' +
                data.id + ', $event)"><em class="fa fa-pencil" style="cursor:pointer" uib-tooltip="' +
                vm.translateFilter('general.edit') + '"></em></div></div>';

            return htmlSection;
        };

        vm.partnerCountryHtml = function (data, type, full, meta) {
            var htmlSection = '<div><span>' + $filter('localizeString')(data.person.country) + '</span></div>';

            return htmlSection;
        };

        vm.partnerCountryFlagHtml = function (data, type, full, meta) {
            var htmlSection = '<div><span><img class="img-responsive" style="display:inline-block; ' +
                'padding-left:10px; padding-right: 10px; max-width:60px" src="../src/imgs/Countries/' + data.person.country.isoCode2 + '.png" /></span></div>';

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
        };

        vm.rowCallback = function () {

        };

        vm.serverPartnerData = function (sSource, aoData, fnCallback, oSettings) {
            $http.get($rootScope.app.httpSource + 'api/Establishment/GetLicenseOwners?estId=' + vm.mediaLicenses.applicationDetail.application.establishment.id)
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

        vm.init = function () {
            vm.happinessMeterObj = {};
            vm.happinessMeterObj.serviceId = 12;
            vm.happinessMeterObj.applicationType = {};
            vm.happinessMeterObj.applicationType.pmoCode = "001";

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

            $http.get($rootScope.app.httpSource + 'api/MediaLicense/GetById?id=' + $state.params.applicationDetailId)
                .then(function (response) {

                    vm.license = response.data;
                    vm.license.applicationDetail.payments = [{
                        paymentDetails: []
                    }];

                    for (var i = 0; i < vm.license.mediaLicenseEconomicActivities.length; i++) {
                        vm.serviceFeesObj.economicActivityIds.push(vm.license.mediaLicenseEconomicActivities[i].economicActivity.id)
                    }

                    vm.license.yearsOfLicense = 1;
                    vm.renewDate = moment(response.data.applicationDetail.certificates[0].certificateDetails[0].expiryDate).add(1, 'day').format("DD-MMMM-YYYY");
                    vm.endDate = moment(moment(response.data.applicationDetail.certificates[0].certificateDetails[0].expiryDate)).add(vm.license.yearsOfLicense, 'years').format("DD-MMMM-YYYY");

                    vm.license.newspapers[0].selectedCategories = [];
                    for (var i = 0; i < vm.license.newspapers[0].newspaperSubjectCategories.length; i++) {
                        vm.license.newspapers[0].selectedCategories.push(vm.license.newspapers[0].newspaperSubjectCategories[i].newspaperCategory);
                    }

                    $http.get($rootScope.app.httpSource + 'api/PeriodicalType')
                        .then(function (response) {
                            vm.license.newspapers[0].periodicalTypes = response.data;
                            vm.allPerodicalTypes = response.data;

                            $scope.$watch('vm.license.newspapers[0].isMagazine', function (newVal, oldVal) {
                                if (newVal != undefined) {
                                    if (vm.serviceFeesObj.isElectronic) {
                                        vm.serviceFeesObj.isMagazine = null;
                                    }
                                    else {
                                        vm.serviceFeesObj.isMagazine = newVal;

                                        if (newVal) {
                                            vm.license.newspapers[0].periodicalTypes = [];
                                            vm.license.newspapers[0].periodicalTypes.push(vm.allPerodicalTypes[1]);
                                            vm.license.newspapers[0].periodicalTypes.push(vm.allPerodicalTypes[2]);
                                            vm.license.newspapers[0].periodicalTypes.push(vm.allPerodicalTypes[3]);
                                            vm.license.newspapers[0].periodicalTypes.push(vm.allPerodicalTypes[4]);
                                            vm.license.newspapers[0].periodicalTypes.push(vm.allPerodicalTypes[5]);
                                        }
                                        else {
                                            vm.license.newspapers[0].periodicalTypes = [];
                                            vm.license.newspapers[0].periodicalTypes.push(vm.allPerodicalTypes[0]);
                                            vm.license.newspapers[0].periodicalTypes.push(vm.allPerodicalTypes[1]);
                                        }

                                        if (newVal != oldVal)
                                            vm.license.newspapers[0].periodicalType = null;
                                    }
                                    if (vm.serviceFeesObj.reloadTable) {
                                        vm.serviceFeesObj.reloadTable();

                                    }
                                }
                            });

                            $scope.$watch('vm.license.newspapers[0].isReprint', function (newVal, oldVal) {
                                if (newVal != undefined) {
                                    vm.serviceFeesObj.isReprint = newVal;
                                    if (newVal) {
                                        vm.license.chiefEditors = null;
                                    }

                                    if (vm.serviceFeesObj.reloadTable)
                                        vm.serviceFeesObj.reloadTable();
                                }
                            });

                            $scope.$watch('vm.license.newspapers[0].periodicalType', function (newVal, oldVal) {
                                if (newVal != undefined) {
                                    vm.serviceFeesObj.periodicalTypeId = newVal.id;
                                    if (vm.serviceFeesObj.reloadTable) {
                                        vm.serviceFeesObj.reloadTable();

                                    }
                                }
                            });

                        });

                    $http.get($rootScope.app.httpSource + 'api/NewspaperCategory')
                        .then(function (response) {
                            vm.license.newspapers[0].categories = response.data;
                        });

                    $http.get($rootScope.app.httpSource + 'api/Language')
                        .then(function (response) {
                            vm.license.newspapers[0].languages = response.data;
                        });

                    $http.get($rootScope.app.httpSource + 'api/Qualification')
                        .then(function (response) {
                            if (vm.license.chiefEditors)
                                vm.license.chiefEditors[0].qualifications = response.data;
                        });

                    $http.get($rootScope.app.httpSource + 'api/ReleaseType')
                        .then(function (response) {
                            vm.releaseTypes = response.data;
                        });

                });

            vm.isBusy = false;
            vm.activeStep = 1;

            // -----------------------------------
            // File Uploading Init
            // -----------------------------------
            $scope.uploadQualificationUrl = 'api/Upload/UploadFile?uploadFile=QualificationCopyPath';

            //Items Datatable
            vm.languageItemsDt = {};
            vm.languageItemsDt.dtInstance = {};
            vm.languageItemsDt.serverData = function (sSource, aoData, fnCallback, oSettings) {
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
                    'recordsTotal': vm.license.newspapers[0].newspaperLanguages.length,
                    'recordsFiltered': vm.license.newspapers[0].newspaperLanguages.length,
                    'data': vm.license.newspapers[0].newspaperLanguages
                };

                fnCallback(records);
            };

            vm.languageItemsDt.actionsHtml = function (data, type, full, meta) {
                var htmlSection = '';

                htmlSection = '<div class="list-icon"><div class="inline" ng-click="vm.languageItemsDt.edit(\'lg\',' +
                    data.id + ')"><em class="fa fa-pencil" style="cursor:pointer" uib-tooltip="' +
                    vm.translateFilter('general.edit') + '"></em></div><div class="inline" ng-click="vm.languageItemsDt.delete(' +
                    data.id + ', $event)"><em class="fa fa-trash" style="cursor:pointer" uib-tooltip="' +
                    vm.translateFilter('general.delete') + '"></em></div></div>';

                return htmlSection;
            };

            vm.languageItemsDt.createdRow = function (row, data, dataIndex) {
                // Recompiling so we can bind Angular directive to the DT
                $compile(angular.element(row).contents())($scope);
            }

            vm.languageItemsDt.rowCallback = function () { };

            vm.translateFilter = $filter('translate');

            if ($rootScope.language.selected !== 'English') {
                vm.languageItemsDt.dtOptions = DTOptionsBuilder.newOptions()
                    .withFnServerData(vm.languageItemsDt.serverData)
                    .withOption('serverSide', true)
                    .withDataProp('data')
                    .withOption('processing', true)
                    .withOption('responsive', true)
                    .withLanguageSource('app/langs/ar.json')
                    .withOption('bFilter', false)
                    .withOption('paging', false)
                    .withOption('info', false)
                    .withOption('createdRow', vm.languageItemsDt.createdRow)
                    .withOption('rowCallback', vm.languageItemsDt.rowCallback).withBootstrap();
            }
            else {
                vm.languageItemsDt.dtOptions = DTOptionsBuilder.newOptions()
                    .withFnServerData(vm.languageItemsDt.serverData)
                    .withOption('serverSide', true)
                    .withDataProp('data')
                    .withOption('processing', true)
                    .withOption('responsive', true)
                    .withOption('bFilter', false)
                    .withOption('paging', false)
                    .withOption('info', false)
                    .withOption('createdRow', vm.languageItemsDt.createdRow)
                    .withOption('rowCallback', vm.languageItemsDt.rowCallback).withBootstrap();
            }

            vm.languageItemsDt.dtColumns = [
                DTColumnBuilder.newColumn('language').withTitle(vm.translateFilter('mediaMaterial.language')).renderWith(
                    function (data, type) {
                        return $filter('localizeString')(data);
                    }), ,
                DTColumnBuilder.newColumn('name').withTitle(vm.translateFilter('newspaper.suggestedName')),
                DTColumnBuilder.newColumn(null).withTitle(vm.translateFilter('general.actions')).notSortable()
                    .renderWith(vm.languageItemsDt.actionsHtml).withOption('width', '15%')];

            vm.languageItemsDt.open = function (size) {

                var modalInstance = $uibModal.open({
                    templateUrl: 'app/views/Application/newspaperMagazineLicense/languageItems/languageItems.html',
                    controller: 'LanguageItemsController',
                    size: size,
                    resolve: {
                        newspaperLanguage: function () {
                            return null;
                        }
                    }
                });

                modalInstance.result.then(function (newspaperLanguage) {
                    if (vm.license.newspapers[0].newspaperLanguages == undefined) {
                        vm.license.newspapers[0].newspaperLanguages = [];
                    }
                    newspaperLanguage.id = vm.license.newspapers[0].newspaperLanguages.length + 1;
                    vm.license.newspapers[0].newspaperLanguages.push(newspaperLanguage);
                    vm.serviceFeesObj.numberOfLanguages = vm.license.newspapers[0].newspaperLanguages.length;
                    vm.serviceFeesObj.reloadTable();

                    vm.languageItemsDt.dtInstance.rerender();

                }, function () { });
            };

            vm.languageItemsDt.edit = function (size, newspaperLanguageId) {
                var modalInstance = $uibModal.open({
                    templateUrl: 'app/views/Application/newspaperMagazineLicense/languageItems/languageItems.html',
                    controller: 'LanguageItemsController',
                    size: size,
                    resolve: {
                        newspaperLanguage: function () {
                            return $filter('filter')(vm.license.newspapers[0].newspaperLanguages, { id: newspaperLanguageId }, true)[0];
                        }
                    }
                });

                modalInstance.result.then(function (newspaperLanguage) {
                    var newMediaMaterialItem = $filter('filter')(vm.license.newspapers[0].newspaperLanguages, { id: newspaperLanguage.Id }, true)[0];
                    newMediaMaterialItem = newspaperLanguage;
                    vm.languageItemsDt.dtInstance.rerender();
                }, function () { });
            };

            vm.languageItemsDt.delete = function (newspaperLanguageId, event) {
                var index;
                var tempStore;

                if (newspaperLanguageId == 0 || newspaperLanguageId == undefined) {
                    index = vm.languageItemsDt.dtInstance.DataTable.rows({ order: 'applied' }).nodes().indexOf(event.currentTarget.parentNode.parentNode.parentNode);
                    tempStore = vm.license.newspapers[0].newspaperLanguages[index];
                    vm.license.newspapers[0].newspaperLanguages.splice(index, 1);
                }
                else {
                    index = vm.license.newspapers[0].newspaperLanguages.indexOf($filter('filter')(vm.license.newspapers[0].newspaperLanguages, { id: newspaperLanguageId }, true)[0]);
                    tempStore = $filter('filter')(vm.license.newspapers[0].newspaperLanguages, { id: newspaperLanguageId }, true)[0];
                    vm.license.newspapers[0].newspaperLanguages.splice(index, 1);
                }
                var translate = $filter('translate');
                vm.languageItemsDt.dtInstance.rerender();

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
                            vm.serviceFeesObj.numberOfLanguages = vm.license.newspapers[0].newspaperLanguages.length;
                            vm.serviceFeesObj.reloadTable();
                            SweetAlert.swal(translate('general.confirmDeleteBtn'), translate('general.deleteMessage'), "error");
                            vm.languageItemsDt.dtInstance.rerender();
                        } else {
                            vm.license.newspapers[0].newspaperLanguages.splice(index, 0, tempStore);
                            SweetAlert.swal(translate('general.restoreBtn'), translate('general.restoreMessage'), "success");
                            vm.languageItemsDt.dtInstance.rerender();
                        }
                    });
            };

            $scope.$watch('vm.license.newspapers[0].isElectronic', function (newVal, oldVal) {
                if (newVal != undefined) {

                    vm.serviceFeesObj.isElectronic = newVal;

                    if (newVal) {
                        vm.serviceFeesObj.isMagazine = null;
                        vm.serviceFeesObj.isReprint = null;
                        vm.serviceFeesObj.periodicalTypeId = null;
                    }

                    if (vm.serviceFeesObj.reloadTable)
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

        // Get the newspaper license data and initlize it
        vm.getById = function (id) {
            $http.get($rootScope.app.httpSource + 'api/MediaLicense/GetById?id=' + id)
                .then(function (response) {
                    vm.license = response.data;

                    if (vm.license.chiefEditors.length > 0 && vm.license.chiefEditors[0].person.dateOfBirth) {
                        vm.license.chiefEditors[0].person.dateOfBirth = new Date(vm.license.chiefEditors[0].person.dateOfBirth);
                    }
                    vm.license.newspapers[0].languages = [];
                    vm.license.newspapers[0].periodicalTypes = [];
                    vm.license.newspapers[0].categories = [];
                    vm.editMode = true;
                    vm.init();
                },
                    function (response) { });
        };

        //New Form Condition
        if ($state.params === undefined || $state.params.id === undefined || $state.params.id === "") {
            vm.editMode = false;
            vm.reprintType = true;
            vm.newType = false;
            vm.license = {
                chiefEditors: [{
                    person: {},
                    address: {},
                    qualification: {}
                }],
                newspapers: [{
                    Name: "",
                    newspaperLanguages: [],
                    numberOfCopies: "",
                    itemPrice: "",
                    subscriptionFees: "",
                    PeriodicalType: null,
                    periodicalTypes: [],
                    categories: [],
                    selectedCategories: null,
                    licenseCopyUrlId: vm.licenseCopyUrlId,
                    tenancyContractCopyId: vm.tenancyContractCopyId,
                    address: {}
                }],
                yearsOfLicense: 1,
                terms: {}
            };
            vm.license.applicationDetail = {
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
                    ServiceId: 12,
                    establishment: {}
                }
            };

            vm.init();
        }
        else {
            //Get the details of the submitted Form to edit
            vm.reprintType = true;
            vm.newType = false;
            vm.getById($state.params.id);
            vm.editMode = true;
        }

        // Save the details to the server
        vm.save = function (applicationStatusId) {
            //Post to save
            ///  vm.isBusy = true;
            vm.license.mediaLicenseEconomicActivities = [];

            if (vm.serviceFeesObj.serviceFee[0] != null) {
                vm.license.applicationDetail.payments[0].paymentDetails = vm.serviceFeesObj.serviceFee;

                for (var i = 0; i < vm.serviceFeesObj.serviceFee.length; i++) {
                    if (vm.serviceFeesObj.serviceFee[i].economicActivity != null) {
                        vm.license.mediaLicenseEconomicActivities.push({ economicActivity: vm.serviceFeesObj.serviceFee[i].economicActivity });
                    }
                }
            }
            else {
                vm.license.applicationDetail.payments = null;

                if (vm.license.newspapers[0].isElectronic) {
                    vm.license.mediaLicenseEconomicActivities.push({ economicActivity: { id: 1020, isRequireThirdPartyApproval: true } });
                }
                else {
                    if (vm.license.newspapers[0].isReprint) {
                        if (vm.license.newspapers[0].isMagazine) {
                            switch (vm.license.newspapers[0].periodicalType.id) {
                                case 2:
                                    vm.license.mediaLicenseEconomicActivities.push({ economicActivity: { id: 1030, isRequireThirdPartyApproval: true } });
                                    break;

                                case 3:
                                    vm.license.mediaLicenseEconomicActivities.push({ economicActivity: { id: 1032, isRequireThirdPartyApproval: true } });
                                    break;

                                case 4:
                                    vm.license.mediaLicenseEconomicActivities.push({ economicActivity: { id: 1017, isRequireThirdPartyApproval: true } });
                                    break;

                                case 5:
                                    vm.license.mediaLicenseEconomicActivities.push({ economicActivity: { id: 1018, isRequireThirdPartyApproval: true } });
                                    break;

                                case 6:
                                    vm.license.mediaLicenseEconomicActivities.push({ economicActivity: { id: 1019, isRequireThirdPartyApproval: true } });
                                    break;
                            }
                        }
                        else {
                            switch (vm.license.newspapers[0].periodicalType.id) {
                                case 1:
                                    vm.license.mediaLicenseEconomicActivities.push({ economicActivity: { id: 1015, isRequireThirdPartyApproval: true } });
                                    break;

                                case 2:
                                    vm.license.mediaLicenseEconomicActivities.push({ economicActivity: { id: 1016, isRequireThirdPartyApproval: true } });
                                    break;
                            }
                        }
                    }
                    else {
                        if (vm.license.newspapers[0].isMagazine) {
                            switch (vm.license.newspapers[0].periodicalType.id) {
                                case 2:
                                    vm.license.mediaLicenseEconomicActivities.push({ economicActivity: { id: 1029, isRequireThirdPartyApproval: true } });
                                    break;

                                case 3:
                                    vm.license.mediaLicenseEconomicActivities.push({ economicActivity: { id: 1031, isRequireThirdPartyApproval: true } });
                                    break;

                                case 4:
                                    vm.license.mediaLicenseEconomicActivities.push({ economicActivity: { id: 1011, isRequireThirdPartyApproval: true } });
                                    break;

                                case 5:
                                    vm.license.mediaLicenseEconomicActivities.push({ economicActivity: { id: 1012, isRequireThirdPartyApproval: true } });
                                    break;

                                case 6:
                                    vm.license.mediaLicenseEconomicActivities.push({ economicActivity: { id: 1014, isRequireThirdPartyApproval: true } });
                                    break;
                            }
                        }
                        else {
                            switch (vm.license.newspapers[0].periodicalType.id) {
                                case 1:
                                    vm.license.mediaLicenseEconomicActivities.push({ economicActivity: { id: 1008, isRequireThirdPartyApproval: true } });
                                    break;

                                case 2:
                                    vm.license.mediaLicenseEconomicActivities.push({ economicActivity: { id: 1010, isRequireThirdPartyApproval: true } });
                                    break;
                            }
                        }
                    }
                }
            }

            for (var i = 0; i < vm.licenseOwners.length; i++) {
                if (vm.licenseOwners[i].person) {
                    if (vm.licenseOwners[i].person.acquitanceFormUrl == undefined || vm.licenseOwners[i].person.acquitanceFormUrl == null ||
                        moment().diff(vm.licenseOwners[i].person.dateOfBirth, 'years', true) < 25) {
                        vm.licenseOwners[i].error = true;
                    }
                    else {
                        vm.licenseOwners[i].error = false;
                    }
                } else {
                    vm.licenseOwners[i].error = false;
                }

            }

            //if ($filter('filter')(vm.licenseOwners, { error: true }, true)) {
            //    vm.dtPartnerInstance.DataTable.rows(
            //        function (idx, data, node) {
            //            return data.error == undefined || data.error == false ? false : true;
            //        }).nodes().to$().addClass('urgent');

            //    if (vm.dtPartnerInstance.DataTable.rows(
            //        function (idx, data, node) {
            //            return data.error == undefined || data.error == false ? false : true;
            //        }).nodes().length > 0) {
            //        vm.isBusy = false;
            //        return true;
            //    }
            //}
            if ($rootScope.app.isPMOHappiness) {
                switch (applicationStatusId) {
                    case 1:

                        break;

                    case 2:
                        $http.post($rootScope.app.httpSource + 'api/MediaLicense/RenewNewspaperMediaLicenses', vm.license)
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
                    vm.license.applicationDetail.happinessRate = happinessRate;

                    //Post to save
                    switch (applicationStatusId) {
                        case 1:
                            //$http.post($rootScope.app.httpSource + 'api/MediaLicense/SaveMediaLicense', vm.license)
                            //    .then(function (response) {
                            //        $state.go('app.dashboard');
                            //    },
                            //    function (response) { // optional
                            //        if (response.data.exceptionMessage == "Name Already Taken") {

                            //        }
                            //        vm.isBusy = false;
                            //    });
                            break;

                        case 2:
                            $http.post($rootScope.app.httpSource + 'api/MediaLicense/RenewNewspaperMediaLicenses', vm.license)
                                .then(function (response) {
                                    $state.go('app.dashboard');
                                },
                                    function (response) { // optional
                                        if (response.data.exceptionMessage == "Name Already Taken") {

                                        }
                                        vm.isBusy = false;
                                    });
                            break;
                    }
                });
            }
        };

        vm.workflowClick = function (actionId) {
            vm.isBusy = true;
            switch (actionId) {

                case 1:
                    $http.post($rootScope.app.httpSource + 'api/MediaLicense/UpdateMediaLicense', vm.license)
                        .then(function (response) {
                            $state.go('app.dashboard');
                        },
                            function (response) { // optional
                                vm.isBusy = false;
                            });
                    break;

                case 2:
                    $http.post($rootScope.app.httpSource + 'api/MediaLicense/SubmitUpdateMediaLicense', vm.license)
                        .then(function (response) {
                            $state.go('app.dashboard');
                        },
                            function (response) { // optional
                                vm.isBusy = false;
                            });
                    break;
            }
        }

        vm.nextToSecond = function () {
            vm.activeStep = 2;
        }

        vm.nextToThird = function () {
            if (vm.license.newspapers[0].releaseTypeId == 2) {
                vm.activeStep = 4;
            }
            else {
                vm.activeStep = 3;
            }
        }

        vm.nextToFourth = function () {
            vm.activeStep = 4;
        }
    }
    RenewNewspaperMagazineLicenseController.$inject = ['$rootScope', '$scope', '$http', '$stateParams', '$state', 'WizardHandler', '$uibModal', 'browser', '$timeout', 'DTOptionsBuilder',
        'DTColumnBuilder', '$compile', '$filter', 'SweetAlert', 'UserProfile'];
})();