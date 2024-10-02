/**=========================================================
 * Module: LoginController.js
 * Controller for the Chat APP 
 =========================================================*/

(function () {
    'use strict';

    angular
        .module('eServices')
        .controller('techsupportController', techsupportController);

    techsupportController.$inject = ['$rootScope', '$scope', 'UserProfile', '$filter', 'DTOptionsBuilder', 'DTColumnBuilder', '$compile', '$http', '$uibModal', '$state', 'SweetAlert', '$window', 'FileUploader'];
    function techsupportController($rootScope, $scope, UserProfile, $filter, DTOptionsBuilder, DTColumnBuilder, $compile, $http, $uibModal, $state, SweetAlert, $window, FileUploader) {
        var vm = this;


        vm.selectedChangeType = { id: 0, name:''};
        vm.changeTypes = [{ id: 1, name: 'تعديل حساب' }, { id: 2, name: 'تعديل بيانات المنشأة' }, { id: 3, name: 'تعديل بيانات شخص' }, { id: 4, name: 'تغير رئيس التحرير لمجلة او جريدة' }];
        (UserProfile.getProfile().roles.indexOf('vgeW7B4qbkdaJhByGHvASqLGv5BdWm') != -1)
        {
            vm.changeTypes.push({ id: 5, name: 'سجل التعديلات' })
        }


        vm.enquiry = {};
        vm.resetEnquiry = function () {
            vm.enquiry = { enquiryErrorMsg: '', isByEnqury: false, closeEnquiryAfterSave: false, EnquryNumber: '', found: false };
        };
        vm.resetEnquiry();

        vm.enquiryChange = function () {
            if (vm.enquiry.EnquryNumber.startsWith("HC-") && vm.enquiry.EnquryNumber.length === 16) {
                $http.get($rootScope.app.httpSource + 'api/tools/GetEnquiry?EnquiryNumber=' + vm.enquiry.EnquryNumber)
                    .then(function (res) {
                        vm.resetEnquiry();
                        vm.enquiry.EnquryNumber = res.data.enquiry.enquiryNumber;
                        vm.enquiry.description = res.data.enquiry.description;
                        vm.enquiry.enquiryStatus = res.data.enquiry.enquiryStatus;
                        vm.enquiry.department = res.data.department;
                        vm.enquiry.found = true;
                        vm.enquiry.enquiryErrorMsg = '';
                        vm.enquiry.isByEnqury = true;
                    },
                        function (err) {
                            vm.resetEnquiry();
                            vm.enquiry.enquiryErrorMsg = 'خطاء غير موجود';
                        });
            }
        };


        vm.account = {};
        vm.resetAccount = function () {
            vm.account = {
                user: {
                    newemail: '',
                    newphoneNumber: '',
                    email: '',
                    modifyMobileandUsername: false,
                    editMode: false
                }
            };
        };
        vm.resetAccount();

        vm.GetAccount = function () {
            $http.get($rootScope.app.httpSource + 'api/tools/GetAccount?email=' + vm.account.user.email)
                .then(function (response) {
                    vm.account = response.data;
                    vm.account.editMode = true;
                    vm.account.modifyMobileandUsername = false;
                }, function () {
                    SweetAlert.swal('خطاء', 'الحساب غير موجود', "error");
                });

        };

        vm.Cancel = function () {
            vm.resetAccount();
            vm.resetEnquiry();
            vm.resetEstablishment();
            vm.resetPerson();
            vm.resetestablishmentLogs();
            vm.resetPersonLogs();
            vm.resetChiefEditor();
        };
        vm.modifyAccount = function () {

            if (vm.account.modifyMobileandUsername && !vm.validateEmail(vm.account.user.newemail)) {
                SweetAlert.swal('خطاء', 'البريد المدخل غير صحيح', "error");
                return false;
            }
            if (vm.account.modifyMobileandUsername && !vm.validateMobile(vm.account.user.newphoneNumber)) {
                SweetAlert.swal('خطاء', 'رقم الهاتف المدخل غير صحيح', "error");
                return false;
            }

            vm.account.enquiry = vm.enquiry;
            $http.post($rootScope.app.httpSource + 'api/tools/modifyAccount', vm.account)
                .then(function (res) {
                    SweetAlert.swal('تم', res.data.message, res.data.isSuccess ? "success" : "error");
                    vm.resetAccount();
                    vm.resetEnquiry();
                }, function () {
                    SweetAlert.swal('خطاء', 'خطاء', "error");
                });
        };

        vm.validateEmail = function (email) {
            var re = /^(([^<>()\[\]\\.,;:\s@"]+(\.[^<>()\[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
            return re.test(String(email).toLowerCase());
        };
        vm.validateMobile = function (num) {
            if (num.startsWith("+971") && num.length === 13) {
                return true;
            }
            return false;
        };



        vm.app = {};
        vm.resetApplication = function () {
            vm.app = {
                application: { applicationNumber: '' },
                modificationType: null,
                modificationTypes: new Array(),
                editMode: false
            };
        };
        vm.resetApplication();

        vm.setApplicationOptions = function () {
            if (vm.app.application.serviceId === 2 && vm.app.application.applicationDetail.applicationStatus.id === 10) {
                vm.app.modificationTypes.push({ name: 'تحويل الطلب الى غير ملغي', id: 1 });
            }
            //var id = vm.Application.ApplicationDetail.applicationStatus.id;
        };

        vm.GetApplication = function () {
            vm.resetApplication();
            $http.get($rootScope.app.httpSource + 'api/tools/GetApplication?ApplicationNumber=' + vm.app.application.applicationNumber)
                .then(function (res) {
                    if (!res.data.isSuccess) {
                        SweetAlert.swal('خطاء', res.data.message, "error");

                    } else {

                        vm.app.application = res.data.app.application;
                        vm.app.application.applicationDetail = res.data.app.applicationDetail;
                        vm.app.editMode = true;
                        vm.setApplicationOptions();
                    }

                }, function (errRes) {
                    vm.resetApplication();
                });
        };

        vm.establishment = {};
        vm.emirates = {};
        vm.resetEstablishment = function () {
            vm.establishment = {
                establishment: { licenseNumber: '' },
                editMode: false,
                modifyEstablishment: false
            };
            vm.emirates = {};
        };
        vm.uploadlicenseCopytUrl = 'api/Upload/UploadFile?uploadFile=ProfileLicenseCopyPath';
        vm.uploadtenancyContractUrl = 'api/Upload/UploadFile?uploadFile=ProfileTenancyContractPath';
        vm.resetEstablishment();
        vm.filter = {};
        vm.format = 'dd-MMMM-yyyy';
        vm.toCreatedOnPopup = {
            opened: false
        };
        vm.openToCreatedOn = function ($event) {
            vm.toCreatedOnPopup.opened = true;
        };
        vm.GetEstablishment = function () {
            $http.get($rootScope.app.httpSource + 'api/tools/GetEstablishment', {
                params: {
                    licenseNumber: vm.establishment.licenseNumber,
                    emirateId: vm.emirates.establishmentEmirate.id
                }
            }).then(function (response) {
                vm.establishment = response.data.establishment;
                vm.establishment.editMode = true;
            }, function () {
                SweetAlert.swal('خطاء', 'الحساب غير موجود', "error");
            });

        };
        $http.get($rootScope.app.httpSource + 'api/Emirate')
            .then(function (response) {
                vm.emirates = response.data;
                vm.emiratesLogs = response.data;
            },
                function (response) { });
        vm.modifyEstablishment = function () {

            vm.establishment.enquiry = vm.enquiry;
            $http.post($rootScope.app.httpSource + 'api/tools/modifyEstablishment', vm.establishment)
                .then(function (res) {
                    SweetAlert.swal('تم', res.data.message, res.data.isSuccess ? "success" : "error");
                    vm.resetEstablishment();
                }, function () {
                    SweetAlert.swal('خطاء', 'خطاء', "error");
                });
        };
        vm.person = {};
        vm.person.country = {};
        vm.resetPerson = function () {
            vm.person = {
                person: { emiratesId: '' },
                editMode: false,
                IsPassport: false
            };
            vm.person.country = {};
        };
        vm.opendateOfBirthDatePopup = function () {
            vm.dateOfBirthPopup.opened = true;
        };
        vm.dateOfBirthPopup = {
            opened: false
        };
        vm.dateOptions = {
            minDate: start,
            maxDate: end,
            startingDay: 1,
            todayBtn: false
        };
        var start = new Date();
        start.setFullYear(start.getFullYear() - 97);
        var end = new Date();
        //if (scope.isLicenseOwner) {
            end.setFullYear(end.getFullYear() - 21);
        
        vm.uploadPhotoUrl = 'api/Upload/UploadFile?uploadFile=ProfilePersonalPhotoPath';
        vm.uploadPassportUrl = 'api/Upload/UploadFile?uploadFile=ProfilePassportPhotoPath';
        vm.uploadEmiratesIdUrl = 'api/Upload/UploadFile?uploadFile=ProfileEmaraitsIDPhotoPath';
        vm.uploadAcquaintanceFormUrl = 'api/Upload/UploadFile?uploadFile=AcquaintanceFormPath';
        vm.uploadIqamaUrl = 'api/Upload/UploadFile?uploadFile=IqamaCopyPath';
        vm.uploadQualificationUrl = 'api/Upload/UploadFile?uploadFile=QualificationCopyPath';

        vm.GetPerson = function () {
            $http.get($rootScope.app.httpSource + 'api/tools/GetPerson', {
                params: {
                    emiratesId: vm.person.emiratesId
                }
            }).then(function (response) {
                if (response.data == null) {
                    SweetAlert.swal('خطاء', 'الحساب غير موجود', "error");
                } else {
                vm.person = response.data.person.person;
                vm.person.country = response.data.person.country;
                vm.person.editMode = true;
                if (vm.person.emiratesId == null) {
                    vm.person.IsPassport = true;
                    vm.person.emiratesId = vm.person.passportNumber;
                    }
                }
            }, function () {
                SweetAlert.swal('خطاء', 'الحساب غير موجود', "error");
            });

        };
        $http.get($rootScope.app.httpSource + 'api/Country')
            .then(function (response) {
                vm.countries = response.data;
            },
                function (response) { });
        $http.get($rootScope.app.httpSource + 'api/Qualification')
            .then(function (response) {
                vm.qualifications = response.data;
            });

        vm.modifyPerson = function () {

            vm.person.enquiry = vm.enquiry;
            $http.post($rootScope.app.httpSource + 'api/tools/modifyPerson', vm.person)
                .then(function (res) {
                    SweetAlert.swal('تم', res.data.message, res.data.isSuccess ? "success" : "error");
                    vm.resetPerson();
                }, function () {
                    SweetAlert.swal('خطاء', 'خطاء', "error");
                });
        };
        vm.personLogs = {};
        vm.establishmentLogs = {};
        vm.personLogs = {};
        vm.resetPersonLogs = function () {
            vm.personLogs = {
                personLogs: { emiratesId: '' },
                editMode: false
            };
            if (document.getElementById("personLogs")!=null)
                document.getElementById("personLogs").innerHTML = "";
        };
        vm.GetPersonLogs = function () {
            $http.get($rootScope.app.httpSource + 'api/tools/GetPersonLogs', {
                params: {
                    emiratesId: vm.personLogs.emiratesId
                }
            }).then(function (response) {
                vm.personLogs = response.data.personLogs;
                vm.personLogs.editMode = true;
                for (var i = 0; i < vm.personLogs.length; i++) {

                    var strintoOjb = JSON.parse(vm.personLogs[i].value);

                    strintoOjb["createdDate"] = moment(vm.personLogs[i].createdDate).format('LLLL');

                    var objtostr = JSON.stringify(strintoOjb);
                    vm.personLogs[i].value = objtostr;

                    var div = document.createElement('div');
                    div.id = [i] + "_" + vm.personLogs[i].key;
                    document.getElementById("personLogs").appendChild(div);
                    document.getElementById(div.id).appendChild(renderjson(JSON.parse(vm.personLogs[i].value)));
                    document.getElementById("personLogs").appendChild(div);
                }
            }, function () {
                SweetAlert.swal('خطاء', 'الحساب غير موجود', "error");
            });

        };
        vm.establishmentLogs = {};
        vm.emiratesLogs = {};
        vm.resetestablishmentLogs = function () {
            vm.establishmentLogs = {
                establishmentLogs: { licenseNumber: '' },
                editMode: false
            };
            vm.emiratesLogs = {};
            if (document.getElementById("establishmentLogs") != null)
                 document.getElementById("establishmentLogs").innerHTML = "";
        };
        vm.GetEstablishmentLogs = function () {
            $http.get($rootScope.app.httpSource + 'api/tools/GetEstablishmentLogs', {
                params: {
                    licenseNumber: vm.establishmentLogs.licenseNumber,
                    emirateId: vm.emiratesLogs.establishmentEmirateLog.id
                }
            }).then(function (response) {
                vm.establishmentLogs = response.data.establishmentLogs;
                vm.establishmentLogs.editMode = true;
                for (var i = 0; i < vm.establishmentLogs.length; i++) {

                    var strintoOjb = JSON.parse(vm.establishmentLogs[i].value);

                    strintoOjb.TenancyContractEndDate["old"] = moment(strintoOjb.TenancyContractEndDate["old"]).format('DD-MMMM-YYYY');
                    strintoOjb.TenancyContractEndDate["new"] = !(strintoOjb.TenancyContractEndDate["new"] === '') ? moment(strintoOjb.TenancyContractEndDate["new"]).format('DD-MMMM-YYYY') : '';

                    strintoOjb["createdDate"] = moment(vm.establishmentLogs[i].createdDate).format('LLLL');

                    var objtostr = JSON.stringify(strintoOjb);
                    vm.establishmentLogs[i].value = objtostr;

                    var div = document.createElement('div');
                    div.id = [i] + "_" + vm.establishmentLogs[i].key;
                    document.getElementById("establishmentLogs").appendChild(div);

                    document.getElementById(div.id).appendChild(renderjson(JSON.parse(vm.establishmentLogs[i].value)));
                    document.getElementById("establishmentLogs").appendChild(div);
                }
            }, function () {
                SweetAlert.swal('خطاء', 'الحساب غير موجود', "error");
            });

        };

        vm.chiefEditor = {};
        vm.chiefEditorPost = {};
        vm.isPersonExist = [];
        vm.chiefEditor.isEmiratesIdExist = false;
        vm.chiefEditor.isChiefEditorNotExistOrNotApplicable = false;
        vm.chiefEditor.person = {};
        vm.chiefEditor.address = {};
        vm.resetChiefEditor = function () {
            vm.chiefEditor = {
                person: {},
                address: {},
                isEmiratesIdExist: false,
                editMode: false,
                editModeForPerson: false
            };
            vm.chiefEditorPost = {};
            vm.isPersonExist = [];
        };
        vm.GetPersonForChiefEditor = function () {
            $http.get($rootScope.app.httpSource + 'api/tools/GetPerson', {
                params: {
                    emiratesId: vm.chiefEditorPost.emiratesId
                }
            }).then(function (response) {
                if (response.data != null) {
                    vm.isPersonExist.push(response.data.person.person);
                    vm.chiefEditorPost.personId = vm.isPersonExist[0].id;
                    vm.chiefEditor.editModeForPerson = true;
                } else {
                    vm.chiefEditor.isEmiratesIdExist = true;
                    vm.chiefEditor.editModeForPerson = true;
                }
            }, function () {
                SweetAlert.swal('خطاء', 'الحساب غير موجود', "error");
            });

        };
        vm.GetChiefEditor = function () {
            $http.get($rootScope.app.httpSource + 'api/tools/GetChiefEditor?ApplicationNumber=' + vm.chiefEditor.applicationNumber)
                .then(function (res) {
                    if (!res.data.isSuccess) {
                        SweetAlert.swal('خطاء', res.data.message, "error");
                    } else {
                        var applicatonNumber = vm.chiefEditor.applicationNumber;
                        vm.chiefEditor = res.data.app.chiefEditor; 
                        vm.chiefEditor.applicationNumber = applicatonNumber;
                        vm.chiefEditor.newspaperLanguageName = res.data.app.newspaperLanguageName;
                        vm.chiefEditorPost.newspaperMediaLicenseId = res.data.app.chiefEditor.medialLicenseId;
                        vm.chiefEditorPost.id = res.data.app.chiefEditor.id;
                        vm.chiefEditor.person.isSmartpass = true;
                        vm.chiefEditor.editMode = true;
                        vm.chiefEditor.isChiefEditorExist = true;
                    }
                }, function (errRes) {
                    vm.resetChiefEditor();
                });
        };
        vm.changeChiefEditor = function () {
            vm.chiefEditor.isChiefEditorExist = false;
            vm.chiefEditor.isChangeEditor = true;
        };
        vm.modifyChiefEditor = function () {           
            vm.chiefEditorPost.enquiry = vm.enquiry;
            $http.post($rootScope.app.httpSource + 'api/tools/modifyChiefEditor', vm.chiefEditorPost)
                .then(function (res) {
                    SweetAlert.swal('تم', res.data.message, res.data.isSuccess ? "success" : "error");
                    vm.resetChiefEditor();
                    vm.resetEnquiry();
                }, function () {
                    SweetAlert.swal('خطاء', 'خطاء', "error");
                });
        };

    }

})();