/// <reference path="establishmentBranch/establishmentBranch.html" />
/// <reference path="establishmentBranch/establishmentBranch.html" />
/**=========================================================
 * Module: LoginController.js
 * Controller for the Chat APP 
 =========================================================*/

(function () {
    'use strict';

    angular
        .module('eServices')
        .controller('CompleteProfileController', CompleteProfileController);

    function CompleteProfileController($rootScope, $scope, $http, $stateParams, $state, UserProfile, WizardHandler, $filter, DTOptionsBuilder, DTColumnBuilder, $compile,
        $uibModal, SweetAlert, LoginService) {
        var vm = this;


        vm.logOut = function () {
            LoginService.logout();
            $state.go('page.login')
        };

        vm.user = UserProfile.getProfile();
        vm.validMobile = false;
        vm.userProfile = {}
        vm.userProfile.person = {};
        vm.isUpdateInfo = false;
        vm.isFreeZone = false;
        vm.forPerson = false;
        vm.forEstablishment = true;
        vm.dtPartnerInstance = {};
        vm.translateFilter = $filter('translate');
        vm.gEstab = {};
        vm.userProfile.userEstablishments = [];
        var newEstablishment = {};
        newEstablishment.establishmentPartners = [];
        vm.userProfile.userEstablishments.push({ establishment: newEstablishment });
        vm.customerTypes = [];

        if (vm.user.username.split('@')[1] === 'nmc.gov.ae' || vm.user.username.split('@')[1] === 'nmcuae.ae') {
            vm.userProfile.userType = {
                id: 19,
                code: "06"
            };
            vm.userProfile.userTypeId = 19;
        }

        if (vm.user.firstName.includes('MCY') && vm.user.lastName.includes('Customer')) {
            vm.isUpdateInfo = true;
        }

        $http.get($rootScope.app.httpSource + 'api/Country')
            .then(function (response) {
                var countryList = response.data;
                vm.user.country = $filter('filter')(countryList, { isoCode3: 'ARE' }, true)[0];
                vm.countries = countryList;
            },
                function (response) { });

        vm.loadGovernmentType = function () {
            $http.get($rootScope.app.httpSource + 'api/GovernmentType')
                    .then(function (response) {
                        vm.governmentTypes = response.data;
                    });
        }

        vm.loadUserType = function (AllowedTypes) {
            $http.get($rootScope.app.httpSource + 'api/UserType')
                .then(function (response) {
                    if (AllowedTypes) {
                        for (var i = 0; i <= response.data.length - 1; i++) {
                            if (AllowedTypes.indexOf(response.data[i].id) != -1)
                                vm.customerTypes.push(response.data[i]);
                        }
                    } else {
                        vm.customerTypes = response.data;
                    }
                },
                function (response) { });
        }

        vm.loadEmirate = function () {
            $http.get($rootScope.app.httpSource + 'api/Emirate')
                .then(function (response) {
                    vm.emirates = response.data;
                    if (vm.userProfile.userEstablishments.length > 0 && vm.userProfile.userEstablishments[0].establishment.authority != null) {
                        vm.establishmentEmirate = $filter('filter')(vm.emirates, { id: vm.userProfile.userEstablishments[0].establishment.authority.emirateId }, true)[0];
                    }
                }, function (response) { });
        }

        vm.loadGovernmentType();
        vm.loadEmirate();

        if (vm.user.smartpassPersonId) {
            $http.get($rootScope.app.httpSource + 'api/Person/GetById?id=' + vm.user.smartpassPersonId)
             .then(function (response) {
                 vm.userProfile.person = response.data;
                 vm.userProfile.person.dateOfBirth = new Date(response.data.dateOfBirth);
                 vm.userProfile.userTypeId = 1;
                 //var gccCountries = ['BHR', 'KWT', 'OMN', 'QAT', 'SAU', 'ARE'];
                 var isGCC = false;
                 //if (gccCountries.indexOf(vm.userProfile.person.country.isoCode3) != -1) {
                 //    isGCC = true;
                 //}
                 if (isGCC) {
                     vm.loadUserType([1, 2]);
                 } else {
                     vm.loadUserType([1]);
                 }

             }, function (response) { });
        } else {
            vm.loadUserType();
        }

        $http.get($rootScope.app.httpSource + 'api/UserProfile')
            .then(function (resp) {
                if (resp.data != null) {
                    if (resp.data.isCompleted != null && resp.data.isCompleted == true) {
                        $state.go('app.dashboard', {}, { reload: true });
                    }
                    if (resp.data.address.street == 'Street name') {
                        vm.individualUserOnly = true;
                    }
                    resp.data.person.dateOfBirth = new Date(resp.data.person.dateOfBirth);
                    vm.userProfile = resp.data;

                    var countryId = vm.userProfile.person.nationalityId;
                    $http.get($rootScope.app.httpSource + 'api/Country/GetUAE?countryId=' + countryId)
                        .then(function (response) {
                            vm.userProfile.person.country = response.data;
                        },
                            function (response) { });

                    if (vm.userProfile.userEstablishments.length > 0) {
                        vm.userProfile.userEstablishments[0].establishment.tenancyContractEndDate =
                            (vm.userProfile.userEstablishments[0].establishment.tenancyContractEndDate != undefined &&
                            vm.userProfile.userEstablishments[0].establishment.tenancyContractEndDate != null) ? new Date(vm.userProfile.userEstablishments[0].establishment.tenancyContractEndDate) : undefined;

                        vm.hasValidLicense = vm.userProfile.userEstablishments[0].establishment.hasValidLicense;

                        if (vm.emirates != null && vm.userProfile.userEstablishments[0].establishment.authority != null) {
                            vm.establishmentEmirate = $filter('filter')(vm.emirates, { id: vm.userProfile.userEstablishments[0].establishment.authority.emirateId }, true)[0];
                        }

                        if (vm.userProfile.userType.id == 5 || vm.userProfile.userType.id == 3 || vm.userProfile.userType.id == 4) {
                            vm.isFreeZone = true;
                        }
                        else {
                            vm.isFreeZone = false;
                        }

                        if (vm.userProfile.userType.id == 3 || vm.userProfile.userType.id == 4) {
                            vm.isNPO = false;
                        }
                        else {
                            vm.isNPO = true;
                        }
                    }
                }
                else {
                    vm.userProfile.address = {}
                }
            },
            function (response) { });

        vm.save = function () {
            vm.isBusy = true;

            vm.userProfile.userType = $filter('filter')(vm.customerTypes, { id: vm.userProfile.userTypeId }, true)[0];

            if (vm.userProfile.userType == null) {
                vm.userProfile.userType = {};
                vm.userProfile.userType.id = vm.userProfile.userTypeId;
            }

            if (vm.userProfile.userType.id == 3) {
                vm.userProfile.governmentType = $filter('filter')(vm.governmentTypes, { id: vm.userProfile.governmentTypeId }, true)[0];
            }

            if (vm.userProfile.userType.id == 1 || vm.userProfile.userType.id == 19) {
                vm.userProfile.isCompleted = true;
            }
            if (vm.userProfile.userType.id == 5 || vm.userProfile.userType.id == 3 || vm.userProfile.userType.id == 4) {
                vm.isFreeZone = true;
            }
            else {
                vm.isFreeZone = false;
            }
            if (vm.userProfile.userType.id == 3 || vm.userProfile.userType.id == 4) {
                vm.isNPO = false;
            }
            else {
                vm.isNPO = true;
            }

            if (vm.user.username.split('@')[1] === 'nmc.gov.ae' || vm.user.username.split('@')[1] === 'nmcuae.ae') {
                vm.userProfile.userType = {
                    id: 19,
                    code: "06"
                };
                vm.userProfile.userTypeId = 19;
            }

            if (vm.userProfile.userEstablishments.length > 0) {
                vm.userProfile.userEstablishments[0].establishment.hasValidLicense = vm.hasValidLicense;
            }

            if (vm.userProfile.id == undefined || vm.userProfile.id == 0) {
                $http.post($rootScope.app.httpSource + 'api/UserProfile/AddUserProfile', vm.userProfile)
                   .then(function (response) {
                       vm.isBusy = false;

                       UserProfile.setUserTypeCode(vm.userProfile.userType.code);

                       if (vm.userProfile.userType.id == 1 || vm.userProfile.userType.id == 19) {
                           $state.go('app.dashboard', {}, { reload: true });
                       }

                       vm.userProfile = response.data;
                       vm.userProfile.language = {};
                       vm.userProfile.language.id = response.data.defaultLanguageId;
                       vm.userProfile.defaultLanguageId = response.data.defaultLanguageId;
                       vm.EmritIdRepeated = false;
                       vm.differentData = false;
                       vm.establishmentExist = false;
                       vm.licenseNumberValidChecker = false;
                       WizardHandler.wizard().next();
                   },
                   function (response) { // optional
                       if (response.data.exceptionMessage == "User Already Registered") {
                           vm.EmritIdRepeated = true;
                       }
                       if (response.data.exceptionMessage == "DifferentPersonProfileDataException") {
                           vm.differentData = true;
                       }
                       vm.isBusy = false;
                   });
            }
            else {
                var LicenseNumberCheck = vm.userProfile;

                $http.post($rootScope.app.httpSource + 'api/UserProfile/UpdateUserProfile', vm.userProfile)
                   .then(function (response) {
                       vm.isBusy = false;

                       if (vm.userProfile.userType.id == 1) {
                           $state.go('app.dashboard', {}, { reload: true });
                       }

                       if (!response.data) {
                           vm.EmritIdRepeated = true;
                       }
                       else {
                           vm.EmritIdRepeated = false;
                           vm.establishmentExist = false;
                           vm.licenseNumberValidChecker = false;

                           vm.userProfile = response.data;
                           vm.userProfile.language = {};
                           vm.userProfile.language.id = response.data.defaultLanguageId;
                           vm.userProfile.defaultLanguageId = response.data.defaultLanguageId;

                           if (vm.userProfile.userEstablishments.length == 0) {
                               var newEstablishment = {};
                               newEstablishment.establishmentPartners = [];
                               newEstablishment.address = {};
                               vm.userProfile.userEstablishments.push({ establishment: newEstablishment });
                           }
                           
                           if ((vm.userProfile.userEstablishments[0].establishment.establishmentPartners == undefined ||
                               vm.userProfile.userEstablishments[0].establishment.establishmentPartners.length == 0) && vm.userProfile.userTypeId == 2) {
                               var accountOwner = {};
                               accountOwner.id = 0;
                               accountOwner.personId = vm.userProfile.personId;
                               accountOwner.establishmentId = vm.userProfile.userEstablishments[0].establishment.id;
                               accountOwner.person = vm.userProfile.person;
                               accountOwner.isOwner = true;
                               vm.userProfile.userEstablishments[0].establishment.establishmentPartners = [];
                               vm.userProfile.userEstablishments[0].establishment.establishmentPartners.push(accountOwner);
                               $compile(angular.element(document.querySelector("#partnersList")))($scope);
                           }

                           WizardHandler.wizard().next();
                       }
                   },
                   function (response) {
                       if (response.data.exceptionMessage == "EstablishmentExistException") {
                           vm.establishmentExist = true;
                       }
                       else if (response.data.exceptionMessage == "EstablishmentLicenseNumberValidChecker") {
                           vm.licenseNumberValidChecker = true;
                       }
                       vm.isBusy = false;
                   });
            }

            vm.dtPartnerOptions = DTOptionsBuilder.newOptions()
                            .withFnServerData(vm.serverPartnerData)
                            .withOption('serverSide', true)
                            .withDataProp('data')
                            .withOption('processing', true)
                 .withOption('responsive', {
                     details: {
                         renderer: renderer
                     }
                 })
                            .withLanguageSource('app/langs/en.json')
                            .withOption('createdRow', vm.createdRow)
                            .withOption('bFilter', false)
                            .withOption('paging', false)
                            .withOption('info', false);

            vm.dtPartnerColumns = [
                DTColumnBuilder.newColumn('person.name').withTitle(vm.translateFilter('completeProfile.name')),
                DTColumnBuilder.newColumn('id').notVisible(),
                DTColumnBuilder.newColumn(null).withTitle(vm.translateFilter('profileNationalityDirective.Nationality')).renderWith(vm.partnerCountryHtml),
                DTColumnBuilder.newColumn('person').withTitle(vm.translateFilter('profileNationalityDirective.EmiratesId')).renderWith(function (data, type) {
                    if (data.emiratesId == undefined || data.emiratesId == "") {
                        return data.passportNumber;
                    }
                    else {
                        return data.emiratesId;
                    }
                }),
                DTColumnBuilder.newColumn('person.dateOfBirth').withTitle(vm.translateFilter('profileNationalityDirective.DateOfBirth')).renderWith(function (data, type) {
                    return $filter('date')(data, 'dd-MMMM-yyyy');
                }),
                DTColumnBuilder.newColumn(null).withTitle(vm.translateFilter('general.actions')).notSortable()
                    .renderWith(vm.partnerActionsHtml).withOption('width', '15%')];
        }

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

        vm.finish = function () {
            if (vm.userProfile.userEstablishments[0].establishment.establishmentPartners == undefined || vm.userProfile.userEstablishments[0].establishment.establishmentPartners.length == 0) {
                if (vm.isFreeZone && vm.userProfile.userEstablishments.length > 1) {
                    var count;
                    for (count = 0; count < vm.userProfile.userEstablishments.length; count++) {
                        if (!((vm.userProfile.userEstablishments[count].establishment.establishmentPartners != undefined || vm.userProfile.userEstablishments[count].establishment.establishmentPartners != null) && vm.userProfile.userEstablishments[count].establishment.establishmentPartners.length != 0)) {
                            vm.invalidPartners = true;
                            return;
                        }
                    }
                }
            }
            vm.isBusy = true;
            vm.userProfile.isCompleted = true;
            if (vm.isFreeZone) {
                vm.userProfile.userEstablishments[0].establishment.establishmentPartners = [];
            }

            $http.post($rootScope.app.httpSource + 'api/UserProfile/UpdateUserProfile', vm.userProfile)
               .then(function (response) {
                   vm.isBusy = false;
                   $state.go('app.dashboard');
               },
               function (response) { // optional
                   vm.isBusy = false;
               });
        }

        vm.createdRow = function (row, data, dataIndex) {
            // Recompiling so we can bind Angular directive to the DT
            $compile(angular.element(row).contents())($scope);
        }

        vm.actionsHtml = function (data, type, full, meta) {
            var htmlSection = '';

            htmlSection = '<div class="list-icon"><div class="inline" ng-click="complete.edit(\'lg\',' +
                data.id + ')"><em class="fa fa-pencil" style="cursor:pointer" uib-tooltip="' +
                vm.translateFilter('general.edit') + '"></em></div><div class="inline" ng-click="complete.delete(' +
                data.id + ', $event)"><em class="fa fa-trash" style="cursor:pointer" uib-tooltip="' +
                vm.translateFilter('general.delete') + '"></em></div></div>';

            return htmlSection;
        };

        vm.freeZoneActionsHtml = function (data, type, full, meta) {
            var htmlSection = '';

            htmlSection = '<div class="list-icon"><div class="inline" ng-click="complete.edit(\'lg\',' +
                data.id + ')"><em class="fa fa-pencil" style="cursor:pointer" uib-tooltip="' +
                vm.translateFilter('general.edit') + '"></em></div><div class="inline" ng-click="complete.delete(' +
                data.id + ', $event)"><em class="fa fa-trash" style="cursor:pointer" uib-tooltip="' +
                vm.translateFilter('general.delete') + '"></em></div><div class="inline" ng-click="complete.AddPartnerToEstablishment(\'lg\',' +
                data.id + ')"><em class="fa fa-user-plus" style="cursor:pointer" uib-tooltip="' +
                vm.translateFilter('general.partner') + '"></em></div></div>';

            return htmlSection;
        };

        vm.partnerActionsHtml = function (data, type, full, meta) {
            var htmlSection = '';

            htmlSection = '<div class="list-icon"><div class="inline" ng-click="complete.editPartner(\'lg\',' +
                data.id + ', $event)"><em class="fa fa-pencil" style="cursor:pointer" uib-tooltip="' +
                vm.translateFilter('general.edit') + '"></em></div><div class="inline" ng-click="complete.deletePartner(' +
                data.id + ', $event)"><em class="fa fa-trash" style="cursor:pointer" uib-tooltip="' +
                vm.translateFilter('general.delete') + '"></em></div></div>';
            return htmlSection;
        };

        vm.partnerCountryHtml = function (data, type, full, meta) {
            var htmlSection = '<div><span>' + $filter('localizeString')(data.person.country) + '</span><span><img class="img-responsive" style="display:inline-block; ' +
                'padding-left:10px; padding-right: 10px; max-width:60px" src="../src/imgs/Countries/' + data.person.country.isoCode2 + '.png" /></span></div>';

            return htmlSection;
        };

        vm.openPartner = function (size) {

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
                if (vm.isFreeZone) {
                    establishmentPartner.id = $filter('filter')(vm.userProfile.establishment.establishments, { id: vm.gEstab.id }, true)[0].establishmentPartners.length + 1;
                    $filter('filter')(vm.userProfile.establishment.establishments, { id: vm.gEstab.id }, true)[0].establishmentPartners.push(establishmentPartner);
                } else {
                    if (vm.userProfile.establishment.establishmentPartners == undefined) {
                        vm.userProfile.establishment.establishmentPartners = [];
                    }
                    vm.userProfile.establishment.establishmentPartners.push(establishmentPartner);
                }
                vm.invalidPartners = false;
                vm.dtPartnerInstance.rerender();
            }, function () { });
        };

        vm.editPartner = function (size, establishmentPartnerId, event) {

            var modalInstance = $uibModal.open({
                templateUrl: 'app/views/Account/completeProfile/establishmentPartner/establishmentPartner.html',
                controller: 'EstablishmentPartnerController',
                size: size,
                resolve: {
                    establishmentPartner: function () {
                        if (establishmentPartnerId == 0) {
                            var index = vm.dtPartnerInstance.DataTable.rows({ order: 'applied' }).nodes().indexOf(event.currentTarget.parentNode.parentNode.parentNode);
                            if (index == -1) {
                                index = vm.dtPartnerInstance.DataTable.row(this).index();
                            }
                            if (vm.isFreeZone) {
                                return $filter('filter')(vm.userProfile.establishment.establishments, { id: vm.gEstab.id }, true)[0].establishmentPartners[index];

                            }
                            else {
                                return vm.userProfile.establishment.establishmentPartners[index];
                            }
                        }
                        else {

                            if (vm.isFreeZone) {
                                return $filter('filter')($filter('filter')(vm.userProfile.establishment.establishments, { id: vm.gEstab.id }, true)[0].establishmentPartners, { id: establishmentPartnerId }, true)[0];

                            }
                            else {
                                return $filter('filter')(vm.userProfile.establishment.establishmentPartners, { id: establishmentPartnerId }, true)[0];
                            }
                        }
                    }
                }
            });

            modalInstance.result.then(function (establishmentPartner) {
                if (vm.isFreeZone) {
                    var partner = $filter('filter')($filter('filter')(vm.userProfile.establishment.establishments, { id: vm.gEstab.id }, true)[0].establishmentPartners, { id: establishmentPartner.id }, true)[0];
                    partner = establishmentPartner;
                }
                else {
                    var partner = $filter('filter')(vm.userProfile.establishment.establishmentPartners, { id: establishmentPartner.id }, true)[0];
                    partner = establishmentPartner;
                }
                vm.dtPartnerInstance.rerender();
            }, function () {
                //state.text('Modal dismissed with Cancel status');
            });
        };

        vm.deletePartner = function (establishmentPartnerId, event) {
            var index;
            var tempStore;

            if (vm.isFreeZone) {
                var establishment = $filter('filter')(vm.userProfile.establishment.establishments, { id: vm.gEstab.id }, true)[0];
                if (establishmentPartnerId == 0 || establishmentPartnerId == undefined) {
                    index = vm.dtPartnerInstance.DataTable.rows({ order: 'applied' }).nodes().indexOf(event.currentTarget.parentNode.parentNode.parentNode);
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
                    index = vm.dtPartnerInstance.DataTable.rows({ order: 'applied' }).nodes().indexOf(event.currentTarget.parentNode.parentNode.parentNode);
                    tempStore = vm.userProfile.establishment.establishmentPartners[index];
                    vm.userProfile.establishment.establishmentPartners.splice(index, 1);
                }
                else {
                    index = vm.userProfile.establishment.establishmentPartners.indexOf($filter('filter')(vm.userProfile.establishment.establishmentPartners, { id: establishmentPartnerId }, true)[0]);
                    tempStore = $filter('filter')(vm.userProfile.establishment.establishmentPartners, { id: establishmentPartnerId }, true)[0];
                    vm.userProfile.establishment.establishmentPartners.splice(index, 1);
                }
            }
            var translate = $filter('translate');
            vm.dtPartnerInstance.rerender();

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
                        vm.dtPartnerInstance.rerender();
                    } else {


                        if (vm.isFreeZone) {
                            var establishment = $filter('filter')(vm.userProfile.establishment.establishments, { id: vm.gEstab.id }, true)[0];
                            establishment.establishmentPartners.splice(index, 0, tempStore);
                        }
                        else {
                            vm.userProfile.establishment.establishmentPartners.splice(index, 0, tempStore);
                        }
                        SweetAlert.swal(translate('general.restoreBtn'), translate('general.restoreMessage'), "success");
                        vm.dtPartnerInstance.rerender();
                    }
                });
        };

        vm.serverPartnerData = function (sSource, aoData, fnCallback, oSettings) {
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

            //Then just call your service to get the records from server side
            var establishmentPartners = [];
            if (vm.userProfile.establishment) {
                if (vm.userProfile.establishment.establishmentPartners == undefined || vm.userProfile.establishment.establishmentPartners.length == 0) {
                    var accountOwner = {};
                    accountOwner.id = 0;
                    accountOwner.personId = vm.userProfile.personId;
                    accountOwner.establishmentId = vm.userProfile.establishment.id;
                    accountOwner.person = vm.userProfile.person;
                    vm.userProfile.establishment.establishmentPartners = [];
                    vm.userProfile.establishment.establishmentPartners.push(accountOwner);
                }

                if (vm.userProfile.establishment != undefined && vm.userProfile.establishment.establishmentPartners != undefined && vm.userProfile.establishment.establishmentPartners.length > 0 && vm.userProfile.establishment.establishmentPartners[0] != undefined) {
                    for (var i = 0; i < vm.userProfile.establishment.establishmentPartners.length; i++) {

                        if (vm.userProfile.establishment.establishmentPartners[i].person != undefined) {
                            vm.userProfile.establishment.establishmentPartners[i].person.dateOfBirth = new Date(vm.userProfile.establishment.establishmentPartners[i].person.dateOfBirth);
                        }
                        establishmentPartners.push(vm.userProfile.establishment.establishmentPartners[i]);
                    }
                }
                else {
                    vm.modalestablishmentPartners = [];
                    if (vm.userProfile.establishment.establishments && vm.userProfile.establishment.establishments != null && vm.userProfile.establishment.establishments.length > 0) {
                        var etabTemp = $filter('filter')(vm.userProfile.establishment.establishments, { id: vm.gEstab.id }, true)[0];

                        for (var i = 0; i < etabTemp.establishmentPartners.length; i++) {
                            etabTemp.establishmentPartners[i].person.dateOfBirth = new Date(etabTemp.establishmentPartners[i].person.dateOfBirth);
                            establishmentPartners.push(etabTemp.establishmentPartners[i]);
                            vm.modalestablishmentPartners.push(etabTemp.establishmentPartners[i]);
                        }
                    }
                }
            }
            var records;

            if (establishmentPartners && establishmentPartners.length > 0) {
                records = {
                    'draw': draw,
                    'recordsTotal': establishmentPartners.length,
                    'recordsFiltered': establishmentPartners.length,
                    'data': establishmentPartners
                };
            }
            else {
                records = {
                    'draw': draw,
                    'recordsTotal': 0,
                    'recordsFiltered': 0,
                    'data': establishmentPartners
                };
            }

            fnCallback(records);
        };

        vm.OfficialLetterUrlP = 'api/Upload/UploadFile?uploadFile=ObligationLetterPath';
        $scope.licenseCopyUrl = 'api/Upload/UploadFile?uploadFile=ProfileLicenseCopyPath';
        $scope.tenancyContractUrl = 'api/Upload/UploadFile?uploadFile=ProfileTenancyContractPath';

        //Date Popup Options
        vm.today = function () {
            vm.userProfile.establishment.tenancyContractEndDate = new Date();
        };
        vm.clear = function () {
            vm.userProfile.establishment.tenancyContractEndDate = null;
        };

        vm.dateOptions = {
            formatYear: 'yy',
            maxDate: new Date(2020, 5, 22),
            minDate: new Date(1920, 5, 22),
            startingDay: 1
        };

        vm.openTenancyContractDatePopup = function () {
            vm.tenancyContractDatePopup.opened = true;
        };

        vm.setDate = function (year, month, day) {
            vm.userProfile.establishment.tenancyContractEndDate = new Date(year, month, day);
        };

        vm.format = 'dd-MMMM-yyyy';

        vm.tenancyContractDatePopup = {
            opened: false
        };
        //END

        var ModalInstanceCtrl = function ($scope, $uibModalInstance) {
            $scope.ok = function () {
                $uibModalInstance.close();
            };

            $scope.cancel = function () {
                $uibModalInstance.dismiss('cancel');
            };
        };

        vm.preventLeadingZero = function () {
            if ((vm.user.phoneNumber == undefined || vm.user.phoneNumber.length == 0) && event.which == 48) {
                event.preventDefault();
            }
        }

        vm.validMobileNumber = function () {
            vm.validMobile = true;
        };

        vm.invalidMobileNumber = function () {
            vm.validMobile = false;
        };

        vm.updateAccountInfo = function () {
            var translate = $filter('translate');
            vm.user = UserProfile.getProfile();
            $http.post($rootScope.app.httpSource + 'api/UserProfile/UpdateAccountInfo', vm.user)
                .then(function (response) {
                    var res = response.data;
                    if (res) {
                        SweetAlert.swal(translate('establishment.success'), translate('completeProfile.UpdatedAcc'), "success");
                    }
                    else {
                        SweetAlert.swal(translate('establishment.error'), translate('completeProfile.NotUpdatedAcc'), "error");
                    }});
        };

        vm.checkerLicenseNumber = function () {

            var licenseNumber = vm.userProfile.userEstablishments[0].establishment.licenseNumber;
            if (licenseNumber != null) {
                licenseNumber = licenseNumber.replace(/\s/g, '');
                var sectionToCheck = licenseNumber;
                var checkArabicPattern = /[\u0600-\u06FF\u0750-\u077F]/;
                var checkSpeicalCharacterformat = /[!@#$%^&*()_+\=\[\]{};':"\\|,.<>\/?]+/;

                var checkSpecialCharacterCount = sectionToCheck.match(/[@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/g);

                if ((checkSpecialCharacterCount != null && checkSpecialCharacterCount.length > 2)) {
                    vm.licenseNumberValidChecker = true;
                }
                else if (checkSpeicalCharacterformat.test(sectionToCheck)) {
                    vm.licenseNumberValidChecker = true;
                }
                else if (sectionToCheck.endsWith("CN") || sectionToCheck.endsWith("cn")) {
                    vm.licenseNumberValidChecker = true;
                }
                else if (checkArabicPattern.test(sectionToCheck)) {
                    vm.licenseNumberValidChecker = true;
                }
                else if (vm.userProfile.userEstablishments[0].establishment.licenseNumber.indexOf(' ') >= 0) {
                    vm.licenseNumberValidChecker = true;
                }
                else {
                    vm.licenseNumberValidChecker = false;
                }
            }
        }

    }
    CompleteProfileController.$inject = ['$rootScope', '$scope', '$http', '$stateParams', '$state', 'UserProfile', 'WizardHandler', '$filter', 'DTOptionsBuilder',
        'DTColumnBuilder', '$compile', '$uibModal', 'SweetAlert', 'LoginService'];

})();