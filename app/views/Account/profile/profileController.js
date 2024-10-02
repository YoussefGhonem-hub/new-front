/**=========================================================
 * Module: LoginController.js
 * Controller for the Chat APP 
 =========================================================*/

(function () {
    'use strict';

    angular
        .module('eServices')
        .controller('ProfileController', ProfileController);

    function ProfileController($rootScope, $scope, $http, $stateParams, $state, UserProfile, DTOptionsBuilder, DTColumnBuilder, $compile, $filter, $uibModal,
        editableOptions, editableThemes, SweetAlert, $timeout, FileUploader) {
        var vm = this;

        vm.translateFilter = $filter('translate');
        vm.user = UserProfile.getProfile();

        vm.userProfile = {};
        vm.dtInstance = {};
        vm.dtPartnerInstance = {};
        vm.dtFilterInstance = {};
        vm.myNestable = {};
        vm.myNestable2 = {};
        vm.forPerson = false;
        vm.isDisabled = false;
        vm.gEstab = {};
        vm.emailConfirmedTooltip = vm.translateFilter('completeProfile.emailConfirmedTooltip');
        vm.phoneConfirmedTooltip = vm.translateFilter('completeProfile.phoneConfirmedTooltip');
        vm.emailNotConfirmedTooltip = vm.translateFilter('completeProfile.emailNotConfirmedTooltip');
        vm.phoneNotConfirmedTooltip = vm.translateFilter('completeProfile.phoneNotConfirmedTooltip');

        /**/
        editableOptions.theme = 'bs3';
        editableThemes.bs3.inputClass = 'input-sm occupationxedit';
        editableThemes.bs3.buttonsClass = 'btn-sm';
        editableThemes.bs3.submitTpl = '<button type="submit" class="btn btn-success"><span class="fa fa-check"></span></button>';
        editableThemes.bs3.cancelTpl = '<button type="button" class="btn btn-default" ng-click="$form.$cancel()">' +
            '<span class="fa fa-times text-muted"></span>' +
            '</button>';

        $http.get($rootScope.app.httpSource + 'api/Gender')
            .then(function (resp) {
                vm.genders = resp.data;
            },
                function (response) { });

        vm.formatRoles = function () {
            vm.departments = [];
            vm.userDepartments = [];
            var mediaLicenseRoles = { nameEn: 'Media License', nameAr: 'التراخيص الإعلامية', roles: [], allowedTypes: ['Media License'] };
            var mediaContentRoles = { nameEn: 'Media Content', nameAr: 'المحتوى الإعلامي', roles: [], allowedTypes: ['Media Content'] };
            var foreignMediaRoles = { nameEn: 'Foreign Media', nameAr: 'الإعلام الخارجي', roles: [], allowedTypes: ['Foreign Media'] };
            var inspectionRoles = { nameEn: 'Inspection', nameAr: 'التفتيش', roles: [], allowedTypes: ['Inspection'] };
            var govCommRoles = { nameEn: 'Government Communication', nameAr: 'الاتصال الحكومي', roles: [], allowedTypes: ['Government Communication'] };
            var financeRoles = { nameEn: 'Finance', nameAr: 'المالية', roles: [], allowedTypes: ['Finance'] };
            var servicesRoles = { nameEn: 'Services', nameAr: 'الخدمات', roles: [], allowedTypes: ['Services'] };
            var menuRoles = { nameEn: 'Menu', nameAr: 'القائمة', roles: [], allowedTypes: ['Menu'] };
            var reportsRoles = { nameEn: 'Reports', nameAr: 'التقارير', roles: [], allowedTypes: ['Reports'] };
            var happinessCenterRoles = { nameEn: 'Happiness Center', nameAr: 'وحدة سعادة المتعاملين', roles: [], allowedTypes: ['Happiness Center'] };
            

            vm.userDepartments.push(mediaLicenseRoles);
            vm.userDepartments.push(mediaContentRoles);
            vm.userDepartments.push(foreignMediaRoles);
            vm.userDepartments.push(inspectionRoles);
            vm.userDepartments.push(govCommRoles);
            vm.userDepartments.push(financeRoles);
            vm.userDepartments.push(servicesRoles);
            vm.userDepartments.push(menuRoles);
            vm.userDepartments.push(reportsRoles);
            vm.userDepartments.push(happinessCenterRoles);

            var mediaLicenseSystemRoles = { nameEn: 'Media License', nameAr: 'التراخيص الإعلامية', roles: [], allowedTypes: ['Media License'] };
            var mediaContentSystemRoles = { nameEn: 'Media Content', nameAr: 'المحتوى الإعلامي', roles: [], allowedTypes: ['Media Content'] };
            var foreignMediaSystemRoles = { nameEn: 'Foreign Media', nameAr: 'الإعلام الخارجي', roles: [], allowedTypes: ['Foreign Media'] };
            var inspectionSystemRoles = { nameEn: 'Inspection', nameAr: 'التفتيش', roles: [], allowedTypes: ['Inspection'] };
            var govCommSystemRoles = { nameEn: 'Government Communication', nameAr: 'الاتصال الحكومي', roles: [], allowedTypes: ['Government Communication'] };
            var financeSystemRoles = { nameEn: 'Finance', nameAr: 'المالية', roles: [], allowedTypes: ['Finance'] };
            var servicesSystemRoles = { nameEn: 'Services', nameAr: 'الخدمات', roles: [], allowedTypes: ['Services'] };
            var menuSystemRoles = { nameEn: 'Menu', nameAr: 'القائمة', roles: [], allowedTypes: ['Menu'] };
            var reportsSystemRoles = { nameEn: 'Reports', nameAr: 'التقارير', roles: [], allowedTypes: ['Reports'] };
            var happinessCenterSystemRoles = { nameEn: 'Happiness Center', nameAr: 'وحدة سعادة المتعاملين', roles: [], allowedTypes: ['Happiness Center'] };

            vm.departments.push(mediaLicenseSystemRoles);
            vm.departments.push(mediaContentSystemRoles);
            vm.departments.push(foreignMediaSystemRoles);
            vm.departments.push(inspectionSystemRoles);
            vm.departments.push(govCommSystemRoles);
            vm.departments.push(financeSystemRoles);
            vm.departments.push(servicesSystemRoles);
            vm.departments.push(menuSystemRoles);
            vm.departments.push(reportsSystemRoles);
            vm.departments.push(happinessCenterSystemRoles);

            for (var i = 0; i < vm.roles.length; i++) {
                var department = vm.roles[i].name.split('$')[0];
                var userRole = null;
                if ($state.params.id) {
                    userRole = $filter('filter')(vm.roles[i].users, { userId: $state.params.id }, true)[0];
                }
                if (userRole !== undefined && userRole !== null) {
                    var existUserDepartment = $filter('filter')(vm.userDepartments, { nameEn: department }, true)[0];

                    if (existUserDepartment == undefined) {
                        var newDepartment = {};
                        newDepartment.id = i;
                        newDepartment.nameEn = department.nameEn;
                        newDepartment.nameAr = department.nameAr;
                        newDepartment.allowedTypes = [department];
                        newDepartment.roles = [];
                        var role = {};
                        role.nameEn = vm.roles[i].nameEn;
                        role.nameAr = vm.roles[i].nameAr;
                        role.fullName = vm.roles[i].name;
                        role.id = vm.roles[i].id;
                        role.type = newDepartment.nameEn;
                        role.description = vm.roles[i].description;

                        newDepartment.roles.push(role);
                        vm.userDepartments.push(newDepartment);
                    }
                    else {
                        var role = {};
                        role.nameEn = vm.roles[i].nameEn;
                        role.nameAr = vm.roles[i].nameAr;
                        role.fullName = vm.roles[i].name;
                        role.id = vm.roles[i].id;
                        role.type = existUserDepartment.nameEn;
                        role.description = vm.roles[i].description;

                        existUserDepartment.roles.push(role);
                    }
                }
                else {
                    var existDepartment = $filter('filter')(vm.departments, { nameEn: department }, true)[0];

                    if (existDepartment == undefined) {
                        var newDepartment = {};
                        newDepartment.id = i;
                        newDepartment.nameEn = department.nameEn;
                        newDepartment.nameAr = department.nameAr;
                        newDepartment.allowedTypes = [department];
                        newDepartment.roles = [];
                        var role = {};
                        role.nameEn = vm.roles[i].nameEn;
                        role.nameAr = vm.roles[i].nameAr;
                        role.fullName = vm.roles[i].name;
                        role.id = vm.roles[i].id;
                        role.type = newDepartment.nameEn;
                        role.description = vm.roles[i].description;

                        newDepartment.roles.push(role);
                        vm.departments.push(newDepartment);
                    }
                    else {
                        var role = {};
                        role.nameEn = vm.roles[i].nameEn;
                        role.nameAr = vm.roles[i].nameAr;
                        role.fullName = vm.roles[i].name;
                        role.id = vm.roles[i].id;
                        role.type = existDepartment.nameEn;
                        role.description = vm.roles[i].description;

                        existDepartment.roles.push(role);
                    }
                }
            }

        }
        if ($state.params.id) {
            $http.get($rootScope.app.httpSource + 'api/Roles/GetGroups')
                .then(function (resp) {
                    vm.groups = resp.data;
                },
                    function (response) { });

            $http.get($rootScope.app.httpSource + 'api/UserProfile/GetById?userId=' + $state.params.id)
                .then(function (resp) {
                    if (resp.data != null) {
                        resp.data.person.dateOfBirth = new Date(resp.data.person.dateOfBirth);
                        vm.userProfile = resp.data;
                        if (vm.userProfile.establishment != null) {
                            $http.get($rootScope.app.httpSource + 'api/Emirate')
                                .then(function (response) {
                                    vm.emirates = response.data;
                                    if (vm.userProfile.establishment != null) {
                                        vm.establishmentEmirate = $filter('filter')(vm.emirates, { id: vm.userProfile.establishment.authority.emirateId }, true)[0];
                                        vm.userEmirate = $filter('filter')(vm.emirates, { id: vm.userProfile.address }, true)[0];
                                    }
                                }, function (response) { });

                            $http.get($rootScope.app.httpSource + 'api/Community/GetByCommunityId?Id=' + vm.userProfile.address.communityId)
                                .then(function (resp) {
                                    vm.userProfile.address.emirate = resp.data;
                                },
                                    function (response) { });

                            $http.get($rootScope.app.httpSource + 'api/Title')
                                .then(function (response) {
                                    vm.titles = response.data;
                                    if (vm.userProfile.person && vm.userProfile.person.titleId) { // if edit mode set combo from data
                                        vm.userTitle = $filter('filter')(vm.titles, { id: vm.userProfile.person.titleId }, true)[0];
                                    }
                                },
                                    function (response) { });

                            $http.get($rootScope.app.httpSource + 'api/Community')
                                .then(function (response) {
                                    vm.communities = response.data;
                                    if (vm.userProfile.address != null) {

                                        vm.profileCommunities = $filter('filter')(vm.communities, { regionId: vm.userProfile.address.community.regionId }, true);
                                    }

                                    if (vm.userProfile.establishment != null) {

                                        vm.establishmentCommunities = $filter('filter')(vm.communities, { regionId: vm.userProfile.establishment.address.community.regionId }, true);
                                        vm.userProfile.establishment.tenancyContractEndDate = new Date(vm.userProfile.establishment.tenancyContractEndDate);
                                    }
                                }, function (response) { });

                            if (vm.userProfile.establishment != null && vm.userProfile.establishment.establishments.length > 0) {
                                vm.hasOtherBranches = true;
                            }
                        }

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
                            DTColumnBuilder.newColumn(null).withTitle(vm.translateFilter('completeProfile.name'))
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
                            DTColumnBuilder.newColumn(null).withTitle(vm.translateFilter('profileNationalityDirective.Nationality')).renderWith(vm.partnerCountryHtml),
                            DTColumnBuilder.newColumn(null).withTitle(' ').renderWith(vm.partnerCountryFlagHtml).notSortable(),
                            DTColumnBuilder.newColumn('person').withTitle(vm.translateFilter('profileNationalityDirective.EmiratesId'))
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
                            DTColumnBuilder.newColumn(null).withTitle(vm.translateFilter('profileNationalityDirective.DateOfBirth'))
                                .renderWith(function (data, type) {
                                    if (data.person != null) {
                                        return moment(data.person.dateOfBirth).format('DD-MMMM-YYYY');
                                    } else {
                                        return '------------';
                                    }
                                }),
                            DTColumnBuilder.newColumn(null).withTitle(vm.translateFilter('general.actions')).notSortable()
                                .renderWith(vm.partnerActionsHtml).withOption('width', '15%')];
                    }
                },
                    function (response) { });

            $http.get($rootScope.app.httpSource + 'api/Roles/GetAll')
                .then(function (resp) {
                    vm.roles = resp.data;
                    vm.formatRoles();
                },
                    function (response) { });
        }
        else {
            $http.get($rootScope.app.httpSource + 'api/UserProfile')
                .then(function (resp) {
                    if (resp.data != null) {
                        resp.data.person.dateOfBirth = new Date(resp.data.person.dateOfBirth);
                        resp.data.user.lastLoginDate = new Date(resp.data.user.lastLoginDate);
                        vm.userProfile = resp.data;
                        if (vm.userProfile.userType.code == '06') {
                            $http.get($rootScope.app.httpSource + 'api/Roles/GetCurrentUserGroup')
                                .then(function (resp) {
                                    vm.showCurrentUserRole = true;
                                    vm.roles = resp.data;
                                    vm.formatRoles();
                                },
                                    function (response) { });

                            if ($rootScope.language.selected !== 'English') {
                                vm.dtFilterOptions = DTOptionsBuilder.newOptions()
                                    .withFnServerData(vm.serverFilterData)
                                    .withOption('serverSide', true)
                                    .withDataProp('data')
                                    .withOption('processing', true)
                                    .withOption('responsive', true)
                                    .withOption('bFilter', false)
                                    .withOption('paging', false)
                                    .withOption('info', false)
                                    .withLanguageSource('app/langs/ar.json')
                                    .withOption('createdRow', vm.createdFilterRow)
                                    .withOption('rowCallback', vm.rowCallback).withBootstrap();
                            }
                            else {
                                vm.dtFilterOptions = DTOptionsBuilder.newOptions()
                                    .withFnServerData(vm.serverFilterData)
                                    .withOption('serverSide', true)
                                    .withDataProp('data')
                                    .withOption('processing', true)
                                    .withOption('responsive', true)
                                    .withOption('bFilter', false)
                                    .withOption('paging', false)
                                    .withOption('info', false)
                                    .withLanguageSource('app/langs/en.json')
                                    .withOption('createdRow', vm.createdFilterRow)
                                    .withOption('rowCallback', vm.rowCallback).withBootstrap();
                            }

                            vm.dtFilterColumns = [
                                DTColumnBuilder.newColumn('name').withTitle(vm.translateFilter('completeProfile.name')),
                                DTColumnBuilder.newColumn('id').notVisible(),
                                DTColumnBuilder.newColumn('menu').withTitle(vm.translateFilter('profile.page')).renderWith(function (data, type) {
                                    return $filter('localizeString')(data);
                                }),
                                DTColumnBuilder.newColumn(null).withTitle(vm.translateFilter('general.actions')).notSortable()
                                    .renderWith(vm.filterActionsHtml).withOption('width', '15%')];
                        }

                        $http.get($rootScope.app.httpSource + 'api/Emirate')
                            .then(function (response) {
                                vm.emirates = response.data;
                                if (vm.userProfile.establishment != null) {
                                    vm.establishmentEmirate = $filter('filter')(vm.emirates, { id: vm.userProfile.establishment.authority.emirateId }, true)[0];
                                    vm.userProfile.establishment.tenancyContractEndDate = new Date(vm.userProfile.establishment.tenancyContractEndDate);
                                }
                            }, function (response) { });

                        $http.get($rootScope.app.httpSource + 'api/Community/GetByCommunityId?Id=' + vm.userProfile.address.communityId)
                            .then(function (resp) {
                                vm.userProfile.address.emirate = resp.data;
                            },
                                function (response) { });

                        $http.get($rootScope.app.httpSource + 'api/Title')
                            .then(function (response) {
                                vm.titles = response.data;
                                if (vm.userProfile.person && vm.userProfile.person.titleId) { // if edit mode set combo from data
                                    vm.userTitle = $filter('filter')(vm.titles, { id: vm.userProfile.person.titleId }, true)[0];
                                }
                            },
                                function (response) { });
                        $http.get($rootScope.app.httpSource + 'api/Community')
                            .then(function (response) {
                                vm.communities = response.data;
                                vm.profileCommunities = $filter('filter')(vm.communities, { regionId: vm.userProfile.address.community.regionId }, true);
                                if (vm.userProfile.establishment != null) {
                                    vm.establishmentCommunities = $filter('filter')(vm.communities, { regionId: vm.userProfile.establishment.address.community.regionId }, true);
                                }

                            }, function (response) { });

                        if (vm.userProfile.establishment && vm.userProfile.establishment.establishments.length > 0) {
                            vm.hasOtherBranches = true;
                        }

                        //Not Free zone
                        if (vm.userProfile.userType.id != 5) {
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
                                DTColumnBuilder.newColumn(null).withTitle(vm.translateFilter('completeProfile.name'))
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
                                DTColumnBuilder.newColumn(null).withTitle(vm.translateFilter('profileNationalityDirective.Nationality')).renderWith(vm.partnerCountryHtml),
                                DTColumnBuilder.newColumn(null).withTitle(' ').renderWith(vm.partnerCountryFlagHtml),
                                DTColumnBuilder.newColumn('person').withTitle(vm.translateFilter('profileNationalityDirective.EmiratesId'))
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
                                DTColumnBuilder.newColumn(null).withTitle(vm.translateFilter('profileNationalityDirective.DateOfBirth')).renderWith(function (data, type) {
                                    if (data.person != null) {
                                        return moment(data.person.dateOfBirth).format('DD-MMMM-YYYY');
                                    } else {
                                        return '------------';
                                    }
                                }),
                                DTColumnBuilder.newColumn(null).withTitle(vm.translateFilter('general.actions')).notSortable()
                                    .renderWith(vm.partnerActionsHtml).withOption('width', '15%')];
                        }
                    }

                },
                    function (response) { });
        }

        vm.createdFilterRow = function (row, data, dataIndex) {
            if (data.isDefault) {
                $(row).css("background-color", "orange");
            }
            $compile(angular.element(row).contents())($scope);
        };

        vm.updateUserProfile = function () {
            vm.userProfile.person.gender = $filter('filter')(vm.genders, { id: vm.userProfile.person.genderId }, true)[0];
            $http.post($rootScope.app.httpSource + 'api/UserProfile/UpdateUserProfileInside', vm.userProfile)
                .then(
                    function (response) {

                    },
                    function (response) {
                        if (response.data.exceptionMessage == "EstablishmentExistException") {
                            vm.establishmentExist = true;
                            vm.userProfile.establishment.establishments.pop();
                            vm.dtInstance.rerender();
                            SweetAlert.swal({
                                title: $filter('translate')('general.notApplicable'), text: $filter('translate')('completeProfile.establishmentExist'),
                                confirmButtonText: $filter('translate')('general.ok')
                            });
                        }
                    });
        }

        vm.updateUserProfileInfo = function () {
            $http.post($rootScope.app.httpSource + 'api/UserProfile/UpdateUserProfileInfo', vm.userProfile)
                .then(
                    function (response) {
                    });
        };

        vm.AddPartnerToEstablishment = function (size, establishmentId) {
            var modalInstance = $uibModal.open({
                templateUrl: '/Partner.html',
                controller: ModalInstanceCtrl,
                size: size,
                scope: $scope,
                resolve: {
                    establishment: function () {
                        vm.gEstab = $filter('filter')(vm.userProfile.establishment.establishments, { id: establishmentId }, true)[0];
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
                            DTColumnBuilder.newColumn(null).withTitle(vm.translateFilter('completeProfile.name'))
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
                            DTColumnBuilder.newColumn(null).withTitle(vm.translateFilter('profileNationalityDirective.Nationality')).renderWith(vm.partnerCountryHtml),
                            DTColumnBuilder.newColumn(null).withTitle(' ').renderWith(vm.partnerCountryFlagHtml),
                            DTColumnBuilder.newColumn('person').withTitle(vm.translateFilter('profileNationalityDirective.EmiratesId')).renderWith(function (data, type) {
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
                            DTColumnBuilder.newColumn(null).withTitle(vm.translateFilter('profileNationalityDirective.DateOfBirth')).renderWith(function (data, type) {
                                if (data.person != null) {
                                    return moment(data.person.dateOfBirth).format('DD-MMMM-YYYY');
                                } else {
                                    return '------------';
                                }
                            }),
                            DTColumnBuilder.newColumn(null).withTitle(vm.translateFilter('general.actions')).notSortable()
                                .renderWith(vm.partnerActionsHtml).withOption('width', '15%')];
                    }
                }
            });

            var state = $('#modal-state');
            modalInstance.result.then(function () {
                vm.dtInstance.rerender();
            }, function () {
                state.text('Modal dismissed with Cancel status');
            });
        }

        //------------------------------------------------
        $scope.openCrop = function () {

            var modalInstance = $uibModal.open({
                templateUrl: 'app/views/Controls/cropImg/cropController.html',
                controller: 'CropController',
                size: 'lg',
                keyboard: false,
                backdrop: 'static'
            });

            modalInstance.result.then(function (url) {
                vm.userProfile.person.photoUrl = url.photoUrl;
                vm.userProfile.person.photoUrlFullPath = url.photoUrlFullPath;
                vm.updateUserProfile();
            });
        }
        //------------------------------------------------

        vm.showAdvance = function () {
            if (vm.showAdvanceFeature) {
                vm.showAdvanceFeature = false;
            }
            else {
                vm.showAdvanceFeature = true;
            }
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
                if (vm.userProfile.userType.id == 5) {

                    establishmentPartner.id = ($filter('filter')(vm.userProfile.establishment.establishments, { id: vm.gEstab.id }, true)[0].establishmentPartners.length) + 1;
                    $filter('filter')(vm.userProfile.establishment.establishments, { id: vm.gEstab.id }, true)[0].establishmentPartners.push(establishmentPartner);
                } else {
                    vm.userProfile.establishment.establishmentPartners.push(establishmentPartner);
                }
                vm.invalidPartners = false;
                vm.updateUserProfile();
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
                            var nodesx = vm.dtPartnerInstance.DataTable.rows({ order: 'applied' }).nodes();
                            var index = vm.dtPartnerInstance.DataTable.rows({ order: 'applied' }).nodes().indexOf(event.currentTarget.parentNode.parentNode.parentNode);

                            if (vm.userProfile.userType.id == 5) {
                                return $filter('filter')(vm.userProfile.establishment.establishments, { id: vm.gEstab.id }, true)[0].establishmentPartners[index];

                            }
                            else {
                                return vm.userProfile.establishment.establishmentPartners[index];
                            }
                        }
                        else {
                            if (vm.userProfile.userType.id == 5) {
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
                if (vm.userProfile.userType.id == 5) {
                    var partner = $filter('filter')($filter('filter')(vm.userProfile.establishment.establishments, { id: vm.gEstab.id }, true)[0].establishmentPartners, { id: establishmentPartner.id }, true)[0];
                    partner = establishmentPartner;
                }
                else {
                    var partner = $filter('filter')(vm.userProfile.establishment.establishmentPartners, { id: establishmentPartner.id }, true)[0];
                    partner = establishmentPartner;
                }
                vm.updateUserProfile();
                vm.dtPartnerInstance.rerender();
            }, function () {
                //state.text('Modal dismissed with Cancel status');
            });
        };

        vm.deletePartner = function (establishmentPartnerId, event) {

            var index;
            var tempStore;

            if (vm.userProfile.userType.id == 5) {
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
                        vm.updateUserProfile();
                        vm.dtPartnerInstance.rerender();
                    } else {

                        if (vm.userProfile.userType.id == 5) {
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

            //Then just call your service to get the records from server side
            var establishmentPartners = [];
            if (vm.userProfile.establishment != undefined && vm.userProfile.establishment.establishmentPartners != undefined && vm.userProfile.establishment.establishmentPartners.length > 0) {
                for (var i = 0; i < vm.userProfile.establishment.establishmentPartners.length; i++) {
                    if (vm.userProfile.establishment.establishmentPartners[i].person != undefined) {
                        vm.userProfile.establishment.establishmentPartners[i].person.dateOfBirth = new Date(vm.userProfile.establishment.establishmentPartners[i].person.dateOfBirth);
                    }
                    establishmentPartners.push(vm.userProfile.establishment.establishmentPartners[i]);
                }
            }
            else {
                var etabTemp = $filter('filter')(vm.userProfile.establishment.establishments, { id: vm.gEstab.id }, true)[0];
                if (etabTemp && etabTemp.establishmentPartners && etabTemp.establishmentPartners.length > 0) {
                    for (var i = 0; i < etabTemp.establishmentPartners.length; i++) {
                        if (etabTemp.establishmentPartners[i].person) {
                            etabTemp.establishmentPartners[i].person.dateOfBirth = new Date(etabTemp.establishmentPartners[i].person.dateOfBirth);
                        }
                        establishmentPartners.push(etabTemp.establishmentPartners[i]);
                    }
                }
            }

            var records;

            if (establishmentPartners.length > 0) {
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

        vm.deleteFilter = function (userFilterId, event) {
            var index;
            var tempStore;
            vm.isTemporaryDelete = true;
            index = vm.userFilters.indexOf($filter('filter')(vm.userFilters, { id: userFilterId }, true)[0]);
            tempStore = $filter('filter')(vm.userFilters, { id: userFilterId }, true)[0];
            vm.userFilters.splice(index, 1);

            var translate = $filter('translate');
            vm.dtFilterInstance.DataTable.draw();

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
                        $http.post($rootScope.app.httpSource + 'api/UserFilter/DeleteUserFilter', tempStore)
                            .then(function (response) {
                                vm.isBusy = false;
                                SweetAlert.swal(translate('general.confirmDeleteBtn'), translate('general.deleteMessage'), "error");
                                vm.isTemporaryDelete = undefined;
                                vm.dtFilterInstance.DataTable.draw();
                            },
                                function (response) { // optional
                                    SweetAlert.swal(translate('general.confirmDeleteBtn'), translate('general.deleteMessage'), "error");
                                });
                    } else {
                        vm.userFilters.splice(index, 0, tempStore);
                        SweetAlert.swal(translate('general.restoreBtn'), translate('general.restoreMessage'), "success");
                        vm.isTemporaryDelete = undefined;
                        vm.dtFilterInstance.rerender();
                    }
                });
        };

        vm.filterActionsHtml = function (data, type, full, meta) {
            var htmlSection = '';

            htmlSection = '<div class="list-icon"><div class="inline" ng-click="profile.changeFilterDefault(' + data.id +
                ', $event)"><em class="fa fa-magnet" style="cursor:pointer" uib-tooltip="' + vm.translateFilter('profile.filterDefault') +
                '"></em></div><div class="inline" ng-click="profile.deleteFilter(' + data.id + ', $event)"><em class="fa fa-trash" style="cursor:pointer" uib-tooltip="' +
                vm.translateFilter('general.delete') + '"></em></div></div>';

            return htmlSection;
        };

        vm.serverFilterData = function (sSource, aoData, fnCallback, oSettings) {

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

            if (!vm.isTemporaryDelete) {
                $http.get($rootScope.app.httpSource + 'api/UserFilter')
                    .then(function (resp) {

                        vm.userFilters = resp.data;

                        var records;

                        if (resp.data.length > 0) {
                            records = {
                                'draw': draw,
                                'recordsTotal': resp.data.length,
                                'recordsFiltered': resp.data.length,
                                'data': resp.data
                            };
                        }
                        else {
                            records = {
                                'draw': draw,
                                'recordsTotal': 0,
                                'recordsFiltered': 0,
                                'data': resp.data
                            };
                        }

                        fnCallback(records);
                    },
                        function (response) { });
            }
            else if (vm.isTemporaryDelete === true) {
                var records = {
                    'draw': draw,
                    'recordsTotal': vm.userFilters.length,
                    'recordsFiltered': vm.userFilters.length,
                    'data': vm.userFilters
                };
                fnCallback(records);
            }
        };

        vm.changeFilterDefault = function (userFilterId, event) {
            var index;
            var tempStore;
            index = vm.userFilters.indexOf($filter('filter')(vm.userFilters, { id: userFilterId }, true)[0]);
            tempStore = $filter('filter')(vm.userFilters, { id: userFilterId }, true)[0];

            var translate = $filter('translate');
            SweetAlert.swal({
                title: translate('profile.confirmDefault'),
                text: translate('profile.confirmDefaultInfo'),
                type: "warning",
                showCancelButton: true,
                confirmButtonColor: "#DD6B55",
                confirmButtonText: translate('profile.confirmSetDefaultBtn'),
                cancelButtonText: translate('general.restoreBtn'),
                closeOnConfirm: false,
                closeOnCancel: false
            },
                function (isConfirm) {
                    if (isConfirm) {
                        //delete
                        $http.post($rootScope.app.httpSource + 'api/UserFilter/SetDefaultUserFilter', tempStore)
                            .then(function (response) {
                                vm.isBusy = false;
                                SweetAlert.swal(translate('general.ok'), translate('profile.userDefaultFilter'), "success");
                                vm.isTemporaryDelete = undefined;
                                vm.dtFilterInstance.DataTable.draw();
                            },
                                function (response) { // optional
                                    SweetAlert.swal(translate('general.confirmDeleteBtn'), translate('general.deleteMessage'), "error");
                                });
                    } else {
                        SweetAlert.swal(translate('general.restoreBtn'), translate('general.restoreMessage'), "success");
                        vm.dtFilterInstance.rerender();
                    }
                });
        };

        $scope.format = 'dd-MMMM-yyyy';
        $scope.datePickerConfig = {
            format: 'dd-MMMM-yyyy',

        };
        $scope.dateOptions = {
            formatYear: 'yyyy',
            format: 'dd-MMMM-yyyy',
        };

        $scope.initDate = new Date(); //'2016-15-20'
        $scope.formats = ['dd-MMMM-yyyy', 'yyyy/MM/dd', 'dd.MM.yyyy', 'shortDate', 'yyyy/MM/dd'];
        $scope.format = $scope.formats[0];
        $scope.opened = {};
        var start = new Date();
        start.setFullYear(start.getFullYear() - 97);
        var end = new Date();
        end.setFullYear(end.getFullYear() - 16);

        $scope.dateOptions = {
            minDate: start,
            maxDate: end,
            startingDay: 1,
            todayBtn: false
        };
        // Disable select days > today
        $scope.disabled = function (date, mode) {
            return date > $scope.dateOptions.maxDate || date < $scope.dateOptions.minDate;
        };

        $scope.open = function ($event, elementOpened) {
            $event.preventDefault();
            $event.stopPropagation();

            $scope.opened[elementOpened] = !$scope.opened[elementOpened];
        };

        vm.updateRoles = function () {
            vm.isBusy = true;

            if (!vm.showAdvanceFeature) {
                $http.post($rootScope.app.httpSource + 'api/Roles/UpdateEmployeeGroup', vm.userProfile)
                    .then(function (response) {
                        vm.isBusy = false;
                    },
                        function (response) { // optional
                            vm.isBusy = false;
                        });
            }
            else {
                vm.userDepartments;
                vm.serverRoles = [];

                for (var i = 0; i < vm.userDepartments[0].roles.length; i++) {
                    vm.userDepartments[0].roles[i].userId = $state.params.id;
                    vm.serverRoles.push(vm.userDepartments[0].roles[i]);
                }
                for (var i = 0; i < vm.userDepartments[1].roles.length; i++) {
                    vm.userDepartments[1].roles[i].userId = $state.params.id;
                    vm.serverRoles.push(vm.userDepartments[1].roles[i]);
                }
                for (var i = 0; i < vm.userDepartments[2].roles.length; i++) {
                    vm.userDepartments[2].roles[i].userId = $state.params.id;
                    vm.serverRoles.push(vm.userDepartments[2].roles[i]);
                }
                for (var i = 0; i < vm.userDepartments[3].roles.length; i++) {
                    vm.userDepartments[3].roles[i].userId = $state.params.id;
                    vm.serverRoles.push(vm.userDepartments[3].roles[i]);
                }
                for (var i = 0; i < vm.userDepartments[4].roles.length; i++) {
                    vm.userDepartments[4].roles[i].userId = $state.params.id;
                    vm.serverRoles.push(vm.userDepartments[4].roles[i]);
                }
                for (var i = 0; i < vm.userDepartments[5].roles.length; i++) {
                    vm.userDepartments[5].roles[i].userId = $state.params.id;
                    vm.serverRoles.push(vm.userDepartments[5].roles[i]);
                }
                for (var i = 0; i < vm.userDepartments[6].roles.length; i++) {
                    vm.userDepartments[6].roles[i].userId = $state.params.id;
                    vm.serverRoles.push(vm.userDepartments[6].roles[i]);
                }
                for (var i = 0; i < vm.userDepartments[7].roles.length; i++) {
                    vm.userDepartments[7].roles[i].userId = $state.params.id;
                    vm.serverRoles.push(vm.userDepartments[7].roles[i]);
                }
                for (var i = 0; i < vm.userDepartments[8].roles.length; i++) {
                    vm.userDepartments[8].roles[i].userId = $state.params.id;
                    vm.serverRoles.push(vm.userDepartments[8].roles[i]);
                }
                for (var i = 0; i < vm.userDepartments[9].roles.length; i++) {
                    vm.userDepartments[9].roles[i].userId = $state.params.id;
                    vm.serverRoles.push(vm.userDepartments[9].roles[i]);
                }

                $http.post($rootScope.app.httpSource + 'api/Roles/UpdateUserRoles', vm.serverRoles)
                    .then(function (response) {
                        vm.isBusy = false;
                    },
                        function (response) { // optional
                            vm.isBusy = false;
                        });
            }
        };

        var ModalInstanceCtrl = function ($scope, $uibModalInstance) {

            $scope.ok = function () {
                vm.updateUserProfile();
                $uibModalInstance.close();
            };

            $scope.cancel = function () {
                $uibModalInstance.dismiss('cancel');
            };
        };

        vm.changePassword = function (size) {

            var modalInstance = $uibModal.open({
                templateUrl: 'app/views/Account/profile/changePassword/changePassword.html',
                controller: 'ChangePasswordController',
                size: size
            });

            modalInstance.result.then(function () {

            }, function () { });
        };

        vm.change2FA = function (enabled) {
            $http.get($rootScope.app.httpSource + 'api/Account/Enable2FA?enabled=' + enabled)
                .then(function (response) {
                    UserProfile.setRequireOTP(response.data);
                },
                    function (response) { // optional
                        alert('error');
                    });
        };

        vm.generateUserRoleReport = function () {
            $http.get($rootScope.app.httpSource + 'api/Roles/GenerateUserRoles?userId=' + $state.params.id, { responseType: 'arraybuffer' })
                .then(function (resp) {
                    var data = new Blob([resp.data], { type: 'application/pdf' });
                    saveAs(data, "RolesReport.pdf");
                },
                    function (response) {
                    });
        };
    }
    ProfileController.$inject = ['$rootScope', '$scope', '$http', '$stateParams', '$state', 'UserProfile', 'DTOptionsBuilder', 'DTColumnBuilder', '$compile', '$filter', '$uibModal',
        'editableOptions', 'editableThemes', 'SweetAlert', '$timeout', 'FileUploader'];

})();