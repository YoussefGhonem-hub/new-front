/**=========================================================
 * Module: LoginController.js
 * Controller for the Chat APP 
 =========================================================*/

(function () {
    'use strict';

    angular
        .module('eServices')
        .controller('PrintingPermitController', PrintingPermitController);

    function PrintingPermitController($rootScope, $scope, $http, $stateParams, $state, $filter, $uibModal, UserProfile, SweetAlert, browser) {
        var vm = this;
        vm.user = UserProfile.getProfile();
        vm.serviceFeesObj = { serviceId: 2, serviceFee: [] };
        vm.urgentServices = { serviceId: 2, confirmFlag: false, service: [] };
        vm.selfMonitorUsers = false;
        if (vm.user.username == "michael.alkhoury@gmail.com" || vm.user.username == "nmc@magrudy.com" ||
            vm.user.username == "abdelhalim@kinokuniya.co.jp" || vm.user.username == "samehabdullah@almaya.ae" || vm.user.username == "attar.khan@jashanmalgroup.com") {
            vm.selfMonitorUsers = true;
        }

        vm.Init = function () {
            vm.terms = {};
            vm.user = UserProfile.getProfile();
            vm.uploadMaterialUrl = 'api/Upload/UploadFile?uploadFile=MaterialPath';
            vm.invoiceUrl = 'api/Upload/UploadFile?uploadFile=InvoicePath';
            vm.showRequiredError = false;
            vm.happinessMeterObj = {};
            vm.happinessMeterObj.serviceId = 2;
            vm.isBookTrading = false;

            $http.get($rootScope.app.httpSource + 'api/PrintedType')
                .then(function (response) {
                    vm.printedTypes = response.data;

                    for (var i = 0; i < vm.printedTypes.length; i++) {

                        if (vm.printedTypes[i].code == "BK" || vm.printedTypes[i].code == "MP" || vm.printedTypes[i].code == "OT" ||
                            vm.printedTypes[i].code == "BP") {
                            vm.printedTypes[i].publicationTypeId = 1;
                        }
                        else {
                            vm.printedTypes[i].publicationTypeId = 3;
                        }
                    }
                });

            $http.get($rootScope.app.httpSource + 'api/SubjectCategory')
                .then(function (response) {
                    vm.subjects = response.data;
                });

            vm.mediaMaterialTypeId = 9;
            $http.get($rootScope.app.httpSource + 'api/AgeClassification?mediaMaterialTypeId=' + vm.mediaMaterialTypeId)
                .then(function (response) {
                    vm.ageClassifications = response.data;
                });

            $http.get($rootScope.app.httpSource + 'api/BookCollectType')
                .then(function (response) {
                    vm.bookCollectTypes = response.data;
                });

            $http.get($rootScope.app.httpSource + 'api/Language')
                .then(function (response) {
                    vm.languages = response.data;
                });

            if (vm.user.userTypeCode == '01') {
                $http.get($rootScope.app.httpSource + 'api/UserProfile')
                    .then(function (response) {
                        vm.userProfile = response.data;
                        vm.authorDisabled = true;
                        vm.printingPermit.authorName = vm.userProfile.person.name;
                    });
            }
            $http.get($rootScope.app.httpSource + 'api/PrintingPermit/GetAllByUser')
                .then(function (response) {
                    vm.printingPermits = response.data;
                    if (vm.printingPermit.printingPermitId) {
                        for (var i = 0; i < vm.printingPermits.length; i++) {
                            if (vm.printingPermits[i].id == vm.printingPermit.printingPermitId) {
                                vm.printingPermit.printingPermit1 = vm.printingPermits[i];
                            }
                        }
                    }
                });

            if ($state.params.establishmentId != undefined) {
                $http.get($rootScope.app.httpSource + 'api/RegulateEntry/GetAllByEstablishmentId?establishmentId=' + $state.params.establishmentId)
                    .then(function (response) {
                        vm.regulateEntries = response.data;  
                    });
            }
            else {
                if (vm.user.userTypeCode != '01' && vm.printingPermit.publicationType.code == '02') {
                    $http.get($rootScope.app.httpSource + 'api/RegulateEntry/GetAllByEstablishmentId?establishmentId=' + vm.printingPermit.applicationDetail.application.establishmentId)
                        .then(function (response) {
                            vm.regulateEntries = response.data;
                            if (vm.printingPermit.regulateEntryId) {
                                for (var j = 0; j < vm.regulateEntries.length; j++) {
                                    if (vm.regulateEntries[j].id == vm.printingPermit.regulateEntryId) {
                                        vm.printingPermit.regulateEntry = vm.regulateEntries[j];
                                    }
                                }
                            }
                            if (vm.printingPermit.bookCollectTypeId != 5) {
                                vm.selectRegulateEntry();
                                vm.selectPermit();
                            }
                            else {
                                vm.printingPermit.title = vm.printingPermit.book.title;
                                vm.printingPermit.authorName = vm.printingPermit.book.authorName;
                                vm.printingPermit.subjectCategory = vm.printingPermit.book.subjectCategory;
                                for (var i = 0; i < vm.printingPermit.book.bookLanguages.length; i++) {
                                    vm.printingPermit.selectedLangauges.push(vm.printingPermit.book.bookLanguages[i].language);
                                }
                            }
                        });
                }
            }

            $scope.$watch('permit.printingPermit.publicationType', function (newVal, oldVal) {
                if (newVal != undefined) {
                    vm.serviceFeesObj.publicationTypeId = newVal.id;
                    vm.happinessMeterObj.publicationType = newVal;
                    vm.serviceFeesObj.reloadTable();

                    if (newVal.id !== 2) {
                        vm.printingPermit.isElectronic = true;
                    }
                }
            });

            $scope.$watch('permit.urgentServices', function (newVal, oldVal) {
                if (newVal != undefined) {
                    vm.serviceFeesObj.isUrgent = newVal.confirmFlag;
                    if (vm.serviceFeesObj.reloadTable)
                        vm.serviceFeesObj.reloadTable();
                }
            }, true);
        };

        //New Form Condition
        if ($state.params === undefined || $state.params.id === undefined || $state.params.id === "") {
            // New Permit
            vm.editMode = false;
            vm.printingPermit = {
                authorFlag: false,
                isElectronic: false,
                Name: "",
                authorName: "",
                publicationTypes: [],
                title: "",
                nationalDepositoryNo: "",
                languages: [],
                printedTypes: [],
                versionNumber: "",
                subjects: [],
                distributor: "",
                director: "",
                productionCompany: "",
                numberOfEpisodes: "",
                printingPermitsLanguages: [],
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
                    application: {}
                }
            };

            $http.get($rootScope.app.httpSource + 'api/PublicationType/PublicationTypeByEstablishmentId?establishmentId=' +
                ($state.params.establishmentId == undefined ? 0 : $state.params.establishmentId))
                .then(function (response) {
                    vm.publicationTypes = response.data;
                });

            vm.printingPermit.hasPrintingPermit = true;

            if (vm.user.userTypeCode != '01') {
                $http.get($rootScope.app.httpSource + 'api/Establishment/GetById?id=' + $state.params.establishmentId)
                    .then(function (response) {
                        vm.printingPermit.applicationDetail.application.establishment = response.data;
                        vm.establishmentId = vm.printingPermit.applicationDetail.application.establishment.id;
                        if (vm.printingPermit.applicationDetail.application.establishment.establishmentType != null) {
                            vm.establishmentTypeId = vm.printingPermit.applicationDetail.application.establishment.establishmentType.id;
                        }
                    });
            }
            vm.Init();
        }
        else {
            //Get the details of the submitted Form to edit
            $http.get($rootScope.app.httpSource + 'api/PrintingPermit/GetByPermitId?id=' + $state.params.id)
                .then(function (response) {
                    vm.printingPermit = response.data;
                    vm.editMode = true;

                    if (vm.printingPermit.applicationDetail.applicationStatusId == 9 && vm.user.userTypeCode != "06" && vm.printingPermit.applicationDetail.actionsTakens.length > 1) {
                        if (vm.printingPermit.applicationDetail.actionsTakens[vm.printingPermit.applicationDetail.actionsTakens.length - 1].transition.actionId == 18 &&
                            vm.printingPermit.applicationDetail.actionsTakens[vm.printingPermit.applicationDetail.actionsTakens.length - 1].note != "") {
                            vm.employeeNote = vm.printingPermit.applicationDetail.actionsTakens[vm.printingPermit.applicationDetail.actionsTakens.length - 1].note;
                            vm.employeeNoteDate = moment(vm.printingPermit.applicationDetail.actionsTakens[vm.printingPermit.applicationDetail.actionsTakens.length - 1].actionDate).format("dddd, MMMM Do YYYY, h:mm:ss a");
                        }
                    }
                    if (vm.user.userTypeCode != '01') {
                        $http.get($rootScope.app.httpSource + 'api/PublicationType/PublicationTypeByEstablishmentId?establishmentId=' + vm.printingPermit.applicationDetail.application.establishment.id)
                            .then(function (response) {
                                vm.printingPermit.publicationTypes = response.data;
                            });
                    }

                    if (vm.printingPermit.publicationType.code == '02') {
                        if (vm.printingPermit.printingPermitId != undefined && vm.printingPermit.printingPermitId != null) {
                            vm.printingPermit.hasPrintingPermit = true;

                            if (vm.printingPermits) {
                                for (var i = 0; i < vm.printingPermits.length; i++) {
                                    if (vm.printingPermits[i].id == vm.printingPermit.printingPermitId) {
                                        vm.printingPermit.printingPermit1 = vm.printingPermits[i];
                                    }
                                }
                            }
                        }
                        else {
                            vm.printingPermit.hasPrintingPermit = false;
                        }
                    }

                    vm.Init();
                });
        }

        vm.onChange = function () {
            if (vm.printingPermit.publicationType.code == '02') {
                vm.isBookTrading = true;
                vm.terms.reloadTable(vm.isBookTrading);
            }
            else {
                vm.isBookTrading = false;
                vm.terms.reloadTable(vm.isBookTrading);
            }
        }

        function preSubmit() {
            if (vm.printingPermit.publicationType.code == '02') {
                if (vm.printingPermit.bookCollectTypeId == 1) {
                    vm.printingPermit.regulateEntry = undefined;
                    if (vm.printingPermit.printingPermit1 == undefined) {
                        vm.showRequiredError = true;
                        return false;
                    }
                }
                else if (vm.printingPermit.bookCollectTypeId == 2) {
                    vm.printingPermit.printingPermit1 = undefined;
                    if (vm.printingPermit.regulateEntry == undefined) {
                        vm.showRequiredError = true;
                        return false;
                    }
                }
            }

            if (vm.serviceFeesObj.serviceFee[0] != null) {
                vm.printingPermit.applicationDetail.payments[0].paymentDetails = vm.serviceFeesObj.serviceFee;
            }
            else {
                vm.printingPermit.applicationDetail.payments = null;
            }

            return true;
        }
        function preSubmit_Update() {
            if (vm.printingPermit.publicationType.code == '02') {
                if (vm.printingPermit.bookCollectTypeId == 1) {
                    vm.printingPermit.regulateEntry = undefined;
                    if (vm.printingPermit.printingPermit1 == undefined) {
                        vm.showRequiredError = true;
                        return false;
                    }
                }
                else if (vm.printingPermit.bookCollectTypeId == 2) {
                    vm.printingPermit.printingPermit1 = undefined;
                    if (vm.printingPermit.regulateEntry == undefined) {
                        vm.showRequiredError = true;
                        return false;
                    }
                }
            }
            return true;
        }

        //Save the details to the server
        vm.save = function (applicationStatusId) {
            if (!preSubmit())
                return;
            vm.isBusy = true;

            if ($rootScope.app.isPMOHappiness) {
                vm.happinessMeterObj.publicationTypeId = vm.printingPermit.publicationType.id;
                if (vm.printingPermit.printingPermit1 != null) {
                    vm.printingPermit.printingPermitId = vm.printingPermit.printingPermit1.id;
                    vm.printingPermit.printingPermit1 = null;
                }
                if (vm.printingPermit.regulateEntry != null) {
                    vm.printingPermit.regulateEntryId = vm.printingPermit.regulateEntry.id;
                    vm.printingPermit.regulateEntry = null;
                }
                //Post to save
                switch (applicationStatusId) {
                    case 1:
                        $http.post($rootScope.app.httpSource + 'api/PrintingPermit/SavePrintingPermit', vm.printingPermit)
                            .then(function (response) {
                                vm.happinessMeterObj.transactionId = response.data;
                                vm.showHappinessMeter = true;
                            },
                                function (response) { // optional
                                    vm.isBusy = false;
                                });
                        break;
                    case 2:
                        $http.post($rootScope.app.httpSource + 'api/PrintingPermit/SubmitPrintingPermit', vm.printingPermit)
                            .then(function (response) {
                                vm.happinessMeterObj.transactionId = response.data.applicationDetail.id;
                                if (vm.serviceFeesObj.serviceFee.length != 0) {
                                    $http.get($rootScope.app.httpSource + 'api/Application/ReCreateCertificate?id=' + response.data.applicationDetailId)
                                        .then(function (resp) {
                                            vm.showHappinessMeter = true;
                                        },
                                            function (response) { // optional
                                                vm.isBusy = false;
                                            });
                                }
                                else {
                                    if ((response.data.publicationTypeId == 2 && response.data.book != null && response.data.book.isApproved) ||
                                        (response.data.publicationTypeId == 2 && response.data.book != null && response.data.bookCollectTypeId == 2 &&
                                        response.data.subjectSubCategory.isAutoApproval &&
                                        response.data.applicationDetail.applicationStatusId == 4
                                        )) {
                                        $http.get($rootScope.app.httpSource + 'api/Application/ReCreateCertificate?id=' + response.data.applicationDetailId)
                                            .then(function (resp) {
                                                vm.showHappinessMeter = true;
                                            },
                                                function (resp) { // optional
                                                    vm.isBusy = false;
                                                });
                                    }
                                    else {
                                        vm.showHappinessMeter = true;
                                    }
                                }
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
                    vm.printingPermit.applicationDetail.happinessRate = happinessRate;
                    if (vm.printingPermit.printingPermit1 != null) {
                        vm.printingPermit.printingPermitId = vm.printingPermit.printingPermit1.id;
                        vm.printingPermit.printingPermit1 = null;
                    }
                    if (vm.printingPermit.regulateEntry != null) {
                        vm.printingPermit.regulateEntryId = vm.printingPermit.regulateEntry.id;
                        vm.printingPermit.regulateEntry = null;
                    }
                    //Post to save
                    switch (applicationStatusId) {
                        case 1:
                            $http.post($rootScope.app.httpSource + 'api/PrintingPermit/SavePrintingPermit', vm.printingPermit)
                                .then(function (response) {
                                    $state.go('app.dashboard');
                                },
                                    function (response) { // optional
                                        vm.isBusy = false;
                                    });
                            break;

                        case 2:
                            $http.post($rootScope.app.httpSource + 'api/PrintingPermit/SubmitPrintingPermit', vm.printingPermit)
                                .then(function (response) {
                                    if (vm.serviceFeesObj.serviceFee.length != 0) {
                                        if (response.data.publicationTypeId == 2 && response.data.book != null && response.data.book.isApproved) {
                                            $http.get($rootScope.app.httpSource + 'api/Application/ReCreateCertificate?id=' + response.data.applicationDetailId)
                                                .then(function (response) {
                                                    $state.go('app.dashboard');
                                                },
                                                    function (response) { // optional
                                                        vm.isBusy = false;
                                                    });
                                        }
                                        else if (response.data.applicationDetail.applicationStatusId == 11) {
                                            $state.go('app.dashboard');
                                        }
                                        else {
                                            vm.paymentPopup(response.data.applicationDetailId);
                                        }
                                    }
                                    else {
                                        if ((response.data.publicationTypeId == 2 && response.data.book != null && response.data.book.isApproved) ||
                                            (response.data.publicationTypeId == 2 && response.data.book != null && response.data.bookCollectTypeId == 2 &&
                                            response.data.subjectSubCategory.isAutoApproval &&
                                            response.data.applicationDetail.applicationStatusId == 4
                                            )) {
                                            $http.get($rootScope.app.httpSource + 'api/Application/ReCreateCertificate?id=' + response.data.applicationDetailId)
                                                .then(function (response) {
                                                    $state.go('app.dashboard');
                                                },
                                                    function (response) { // optional
                                                        vm.isBusy = false;
                                                    });
                                        }
                                        else {
                                            $state.go('app.dashboard');
                                        }
                                    }
                                },
                                    function (response) { // optional
                                        vm.isBusy = false;
                                    });
                            break;
                    }
                });
            }
        };

        vm.removed = function (item) {
            if (vm.printingPermit.publicationType.code != '02') {
                for (var i = 0; i < vm.printingPermit.printingPermitsLanguages.length; i++) {
                    if (vm.printingPermit.printingPermitsLanguages[i].languageId == item.id) {
                        vm.printingPermit.printingPermitsLanguages.splice(i, 1);
                    }
                }
            }
            else if (vm.printingPermit.publicationType.code == '02') {
                for (var j = 0; j < vm.printingPermit.book.bookLanguages.length; j++) {
                    if (vm.printingPermit.book.bookLanguages[j].languageId == item.id) {
                        vm.printingPermit.book.bookLanguages.splice(j, 1);
                    }
                }
            }
        };

        vm.workflowClick = function (actionId) {
            if (!preSubmit_Update())
                return;
            vm.isBusy = true;
            if (vm.printingPermit.publicationType.code == '02') {
                vm.printingPermit.book.title = vm.printingPermit.title;
                vm.printingPermit.book.authorName = vm.printingPermit.authorName;
                vm.printingPermit.book.subjectCategory = vm.printingPermit.subjectCategory;

                for (var i = 0; i < vm.printingPermit.selectedLangauges.length; i++) {
                    if (vm.printingPermit.book.bookLanguages[i] == undefined) {
                        vm.printingPermit.book.bookLanguages.push({ language: vm.printingPermit.selectedLangauges[i] });
                    }
                }
            }
            switch (actionId) {
                case 12:
                    $http.post($rootScope.app.httpSource + 'api/PrintingPermit/UpdatePrintingPermit', vm.printingPermit)
                        .then(function (response) {
                            $state.go('app.dashboard');
                        },
                            function (response) { // optional
                                vm.isBusy = false;
                            });
                    break;

                case 13:
                    $http.post($rootScope.app.httpSource + 'api/PrintingPermit/SubmitUpdatePrintingPermit', vm.printingPermit)
                        .then(function (response) {
                            if (vm.serviceFeesObj.serviceFee.length == 0 || vm.printingPermit.applicationDetail.payments[0].paymentStatusId == 3) {
                                $state.go('app.dashboard');
                            }
                            else {
                                vm.paymentPopup(vm.printingPermit.applicationDetail.id);
                            }
                        },
                            function (response) { // optional
                                vm.isBusy = false;
                            });
                    break;
            }
        };

        vm.paymentPopup = function (applicationDetailId) {
            SweetAlert.swal({
                title: $filter('translate')('payment.applicationSubmittedSuccessfully'),
                text: $filter('translate')('payment.proceed'),
                type: "warning",
                showCancelButton: true,
                confirmButtonColor: "#DD6B55",
                confirmButtonText: $filter('translate')('payment.payNow'),
                cancelButtonText: $filter('translate')('payment.payLater'),
                closeOnConfirm: true,
                closeOnCancel: true
            }, function (isConfirm) {
                if (isConfirm) {
                    var modalInstance = $uibModal.open({
                        templateUrl: 'app/views/Payment/transactionRequest/transactionRequest.html',
                        controller: 'TransactionRequestController',
                        size: 'lg',
                        keyboard: false,
                        backdrop: 'static',
                        resolve: {
                            applicationDetailId: applicationDetailId,
                            isRenew: function () { return false; }
                        }
                    });
                    modalInstance.result.then(function (action) {
                    });
                } else {
                    $state.go('app.dashboard');
                }
            });
        };

        vm.selectPermit = function () {
            vm.showRequiredError = false;
            vm.printingPermit.selectedLangauges = [];
            if (vm.printingPermit.book == undefined) {
                vm.printingPermit.title = vm.printingPermit.printingPermit1.title;
                vm.printingPermit.authorName = vm.printingPermit.printingPermit1.authorName;
                vm.printingPermit.subjectCategory = vm.printingPermit.printingPermit1.subjectCategory;
                vm.printingPermit.book = {};
                vm.printingPermit.book.bookLanguages = [];
                vm.printingPermit.book.isbn = vm.printingPermit.printingPermit1.isbn;
                vm.printingPermit.book.nationalDepositoryNo = vm.printingPermit.printingPermit1.nationalDepositoryNo;
                for (var i = 0; i < vm.printingPermit.printingPermit1.printingPermitsLanguages.length; i++) {
                    vm.printingPermit.selectedLangauges.push(vm.printingPermit.printingPermit1.printingPermitsLanguages[i].language);
                    vm.printingPermit.book.bookLanguages.push({ languageId: vm.printingPermit.printingPermit1.printingPermitsLanguages[i].languageId, language: vm.printingPermit.printingPermit1.printingPermitsLanguages[i].language });
                }
            }
            else {
                vm.disableIsbn = true;
                vm.printingPermit.title = vm.printingPermit.book.title;
                vm.printingPermit.authorName = vm.printingPermit.book.authorName;
                vm.printingPermit.subjectCategory = vm.printingPermit.book.subjectCategory;
                for (var j = 0; j < vm.printingPermit.book.bookLanguages.length; j++) {
                    vm.printingPermit.selectedLangauges.push(vm.printingPermit.book.bookLanguages[j].language);
                    vm.printingPermit.printingPermitsLanguages.push(vm.printingPermit.book.bookLanguages[j].language);
                }
            }
        };

        vm.selectRegulateEntry = function () {
            vm.showRequiredError = false;
            vm.printingPermit.books = [];

            if (vm.printingPermit.regulateEntry) {
                vm.page = 1;

                vm.data = {
                    selected: null
                };

                vm.fetch = function ($select, $event) {
                    // no event means first load!
                    if (!$event) {
                        vm.page = 1;
                        vm.printingPermit.books = [];
                    } else {
                        $event.stopPropagation();
                        $event.preventDefault();
                        vm.page++;
                    }

                    vm.loading = true;
                    $http({
                        method: 'GET',
                        url: $rootScope.app.httpSource + 'api/RegulateEntry/GetLazyBookList',
                        params: {
                            searchtext: $select.search == "" ? null : $select.search,
                            pageIndex: vm.page,
                            regulateEntryId: vm.printingPermit.regulateEntry.id
                        }
                    }).then(function (resp) {
                        for (var i = 0; i < resp.data.length; i++) {
                            for (var j = 1; j < resp.data[i].book.bookLanguages.length; j++) {
                                if (resp.data[i].book.bookLanguages[j].languageId == resp.data[i].book.bookLanguages[j].languageId) {
                                    resp.data[i].book.bookLanguages.splice(1); 
                                }
                            }
                            vm.printingPermit.books.push(resp.data[i].book);
                        }      
                    })['finally'](function () {
                        vm.loading = false;
                    });
                };
            }
        };

        vm.selectBookCollectType = function () {
            if (vm.printingPermit.bookCollectTypeId != 1 && vm.printingPermit.bookCollectTypeId != 2 && vm.printingPermit.bookCollectTypeId != 6) {
                delete vm.printingPermit.books;
                vm.printingPermit.book = {};
            }
            else if (vm.printingPermit.bookCollectTypeId == 6) {

                vm.printingPermit.books = [];

                vm.page = 1;

                vm.data = {
                    selected: null
                };

                vm.fetch = function ($select, $event) {
                    // no event means first load!
                    if (!$event) {
                        vm.page = 1;
                        vm.printingPermit.books = [];
                    } else {
                        $event.stopPropagation();
                        $event.preventDefault();
                        vm.page++;
                    }

                    vm.loading = true;
                    $http({
                        method: 'GET',
                        url: $rootScope.app.httpSource + 'api/CustomerBook/GetLazyBookList',
                        params: {
                            searchtext: $select.search == "" ? null : $select.search,
                            pageIndex: vm.page
                        }
                    }).then(function (resp) {
                        for (var i = 0; i < resp.data.length; i++) {
                            vm.printingPermit.books.push(resp.data[i]);
                        }
                    })['finally'](function () {
                        vm.loading = false;
                    });
                };
            }
        };


        $scope.isValidISBN = true;
        vm.onISBNChange = function () {
            setTimeout(function () {
                if (vm.printingPermit.book.isbn) {
                    if (vm.printingPermit.book.isbn.length > 10) {
                        $('#isbnThirteen').focus();
                    }
                    else {
                        $('#isbnTen').focus();
                    }

                    if (vm.printingPermit.book.isbn.length == 10 || vm.printingPermit.book.isbn.length == 13 || vm.printingPermit.book.isbn.length == 0) {
                        $scope.isValidISBN = true;
                    }
                    else {
                        $scope.isValidISBN = false;
                    }
                }
                else {
                    $scope.isValidISBN = true;
                }
            }, 50);
        };
    }

    PrintingPermitController.$inject = ['$rootScope', '$scope', '$http', '$stateParams', '$state', '$filter', '$uibModal', 'UserProfile', 'SweetAlert', 'browser'];
})();