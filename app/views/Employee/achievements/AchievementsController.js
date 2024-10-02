/**=========================================================
 * Module: DashboardController.js
 =========================================================*/

(function () {
    'use strict';

    angular
        .module('eServices')
        .controller('AchievementsController', AchievementsController);

    AchievementsController.$inject = ['$rootScope', '$scope', 'UserProfile', '$filter', 'flotOptions', 'colors', '$http', '$timeout', '$state'];
    function AchievementsController($rootScope, $scope, UserProfile, $filter, flotOptions, colors, $http, $timeout, $state) {
        var vm = this;
        vm.user = UserProfile.getProfile();
        vm.filter = {};
        vm.areaSplineSeries = [];
        vm.employees = [];
        vm.filter.fromCreatedOn = new Date(2017, 6, 30);
        vm.filter.toCreatedOn = new Date();

        $http.get($rootScope.app.httpSource + 'api/UserProfile/GetEmployees')
        .then(function (resp) {
            vm.showEmployee = true;
            for (var i = 0; i < resp.data.length; i++) {
                vm.employees.push(resp.data[i].user);
            }
        },
        function (response) {
            vm.showEmployee = false;
        });

        // -----------------------------------
        // Date Of Birth Datepicker
        // -----------------------------------
        // Disable select days < today
        $scope.disabled = function (date, mode) {
            var today = new Date("7-30-2017");
            return date < today;
        };

        $scope.toggleMin = function () {
            $scope.minDate = $scope.minDate ? null : new Date();
        };
        $scope.toggleMin();

        $scope.open = function ($event) {
            $event.preventDefault();
            $event.stopPropagation();

            $scope.opened = true;
        };

        $scope.dateOptions = {
            startingDay: 1
        };

        $scope.formats = ['dd-MMMM-yyyy', 'yyyy/MM/dd', 'dd.MM.yyyy', 'shortDate'];
        $scope.format = $scope.formats[0];
        // -----------------------------------
        // Date Of Birth Datepicker
        // -----------------------------------
        // Disable select days < start date
        $scope.enddisabled = function (date, mode) {
            var today = new Date();
            return date < vm.filter.fromCreatedOn;
        };

        $scope.endtoggleMin = function () {
            $scope.endminDate = $scope.endminDate ? null : new Date();
        };
        $scope.endtoggleMin();

        $scope.endopen = function ($event) {
            $event.preventDefault();
            $event.stopPropagation();

            $scope.endopened = true;
        };

        $scope.enddateOptions = {
            startingDay: 1
        };

        $scope.endformats = ['dd-MMMM-yyyy', 'yyyy/MM/dd', 'dd.MM.yyyy', 'shortDate'];
        $scope.endformat = $scope.endformats[0];
        //-------------------------------------------------

        vm.search = function () {
            $http.post($rootScope.app.httpSource + 'api/Achievement/GetAchievements', vm.filter)
            .then(function (resp) {
                vm.achievement = resp.data;
                vm.filter.userId = resp.data.userId;

                var allActions = 0;
                var totalRate = 0;
                var totalApplications = 0;

                for (var i = 0; i < resp.data.employeeActions.length; i++) {
                    allActions += resp.data.employeeActions[i].numberOfActions;
                }
                vm.achievement.allActions = allActions;

                vm.piePercent1 = Math.floor(((allActions - resp.data.employeeWrongActions.length) / allActions) * 100);
                vm.piePercent2 = Math.floor((resp.data.applicationsWithinAverage.length / allActions) * 100);

                for (var i = 0; i < resp.data.applicationsPerHappiness.length; i++) {
                    if (resp.data.applicationsPerHappiness[i].nameEn == "Happy") {
                        totalRate += resp.data.applicationsPerHappiness[i].numberOfApplications * 3;
                    }
                    else if (resp.data.applicationsPerHappiness[i].nameEn == "Neutral") {
                        totalRate += resp.data.applicationsPerHappiness[i].numberOfApplications * 2;
                    }
                    else {
                        totalRate += resp.data.applicationsPerHappiness[i].numberOfApplications;
                    }
                    totalApplications += resp.data.applicationsPerHappiness[i].numberOfApplications;
                }

                vm.happinessRateValue = Math.floor((totalRate / (totalApplications * 3)) * 100);
                vm.actionRate = (allActions / resp.data.numberOfWorkingHours).toFixed(2);

                if (resp.data.employeeWrongActions.length > 0) {
                    vm.achievement.lastWrongActionDtae = moment(resp.data.employeeWrongActions[resp.data.employeeWrongActions.length - 1].actionDate).startOf('day').fromNow();
                }

                vm.achievement.lastActionMoment = moment(resp.data.lastActionDate).startOf('day').fromNow();

                vm.sparkValuesLine = [];

                for (var i = 0; i < vm.achievement.actionsPerMonth.length; i++) {
                    vm.sparkValuesLine.push(vm.achievement.actionsPerMonth[i].numberOfActions);
                }

                vm.loadProgressValues();

                var totalMinutes = 0;
                var numberOfDays = 0;

                for (var i = 0; i < vm.achievement.actionTimes.length; i++) {
                    numberOfDays++;
                    totalMinutes += vm.achievement.actionTimes[i].minutes;
                }

                vm.achievement.averageActionInMinutes = Math.floor(totalMinutes / numberOfDays);

                var totalApplications = 0;
                var totalDesktopApplications = 0;
                var totalMobileApplications = 0;
                var totalTabletApplications = 0;

                for (var i = 0; i < vm.achievement.applicationsPerPlatform.length; i++) {
                    totalApplications += vm.achievement.applicationsPerPlatform[i].numberOfApplications;

                    if (vm.achievement.applicationsPerPlatform[i].name == 'Win' || vm.achievement.applicationsPerPlatform[i].name == 'mac') {
                        totalDesktopApplications += vm.achievement.applicationsPerPlatform[i].numberOfApplications;
                    }

                    if (vm.achievement.applicationsPerPlatform[i].name == 'iphone' || vm.achievement.applicationsPerPlatform[i].name == 'Android') {
                        totalMobileApplications += vm.achievement.applicationsPerPlatform[i].numberOfApplications;
                    }

                    if (vm.achievement.applicationsPerPlatform[i].name == 'ipad') {
                        totalTabletApplications += vm.achievement.applicationsPerPlatform[i].numberOfApplications;
                    }
                }

                vm.achievement.totalApplications = totalApplications;
                vm.achievement.totalDesktopApplications = totalDesktopApplications;
                vm.achievement.totalMobileApplications = totalMobileApplications;
                vm.achievement.totalTabletApplications = totalTabletApplications;
                vm.achievement.approveApplicationDataActions = 0;
                vm.achievement.sendBackToCustomerActions = 0;
                vm.achievement.externalPartyApproveActions = 0;
                vm.achievement.externalPartyRejectActions = 0;
                vm.achievement.rejectActions = 0;
                vm.achievement.approveActions = 0;
                vm.achievement.mediaMaterialApproveActions = 0;
                vm.achievement.mediaMaterialRejectActions = 0;
                vm.achievement.sendBackForEmployeeReviewActions = 0;
                vm.achievement.assignMaterialToSupervisorActions = 0;
                vm.achievement.sendBackToEmployeeForReviewActions = 0;
                vm.achievement.sendBackToSupervisorForReviewActions = 0;

                for (var i = 0; i < vm.achievement.employeeActions.length; i++) {
                    switch (vm.achievement.employeeActions[i].nameEn) {
                        case "Approve Application Data":
                            vm.achievement.approveApplicationDataActions = vm.achievement.employeeActions[i].numberOfActions;
                            break;
                        case "Send Back To Customer":
                            vm.achievement.sendBackToCustomerActions = vm.achievement.employeeActions[i].numberOfActions;
                            break;
                        case "External Party Approve":
                            vm.achievement.externalPartyApproveActions = vm.achievement.employeeActions[i].numberOfActions;
                            break;
                        case "External Party Reject":
                            vm.achievement.externalPartyRejectActions = vm.achievement.employeeActions[i].numberOfActions;
                            break;
                        case "Reject":
                            vm.achievement.rejectActions = vm.achievement.employeeActions[i].numberOfActions;
                            break;
                        case "Approve":
                            vm.achievement.approveActions = vm.achievement.employeeActions[i].numberOfActions;
                            break;
                        case "Media Material Approve":
                            vm.achievement.mediaMaterialApproveActions = vm.achievement.employeeActions[i].numberOfActions;
                            break;
                        case "Media Material Reject":
                            vm.achievement.mediaMaterialRejectActions = vm.achievement.employeeActions[i].numberOfActions;
                            break;
                        case "Send Back For Employee Review":
                            vm.achievement.sendBackForEmployeeReviewActions = vm.achievement.employeeActions[i].numberOfActions;
                            break;
                        case "Assign Material To Supervisor":
                            vm.achievement.assignMaterialToSupervisorActions = vm.achievement.employeeActions[i].numberOfActions;
                            break;
                        case "Send Back To Employee For Review":
                            vm.achievement.sendBackToEmployeeForReviewActions = vm.achievement.employeeActions[i].numberOfActions;
                            break;
                        case "Send Back To Supervisor For Review":
                            vm.achievement.sendBackToSupervisorForReviewActions = vm.achievement.employeeActions[i].numberOfActions;
                            break;
                    }
                }

                vm.achievement.servicesList = [];
                var monthEn = new Array();
                monthEn[0] = "January";
                monthEn[1] = "February";
                monthEn[2] = "March";
                monthEn[3] = "April";
                monthEn[4] = "May";
                monthEn[5] = "June";
                monthEn[6] = "July";
                monthEn[7] = "August";
                monthEn[8] = "September";
                monthEn[9] = "October";
                monthEn[10] = "November";
                monthEn[11] = "December";

                var monthAr = new Array();
                monthAr[0] = "يناير";
                monthAr[1] = "فبراير";
                monthAr[2] = "مارس";
                monthAr[3] = "أبريل";
                monthAr[4] = "مايو";
                monthAr[5] = "يونيو";
                monthAr[6] = "يوليو";
                monthAr[7] = "أغسطس";
                monthAr[8] = "سبتمبر";
                monthAr[9] = "أكتوبر";
                monthAr[10] = "نوفمبر";
                monthAr[11] = "ديسمبر";

                vm.monthsData = [];
                vm.yearsData = [];
                var startYear = vm.filter.fromCreatedOn.getFullYear();
                var endYear = vm.filter.toCreatedOn.getFullYear();
                var yearCounter = startYear;

                for (var i = 0; i <= (endYear - startYear) ; i++) {
                    var newYear = {};
                    newYear.nameEn = yearCounter;
                    newYear.nameAr = yearCounter;
                    newYear.value = yearCounter;
                    newYear.months = [];

                    var startMonth = yearCounter == endYear && (endYear - startYear) == 0 ?
                            ((yearCounter == 2017 && vm.filter.fromCreatedOn.getMonth() < 6) ? 6 : vm.filter.fromCreatedOn.getMonth()) :
                            ((yearCounter != 2017) ? 0 : (vm.filter.fromCreatedOn.getMonth() < 6 ? 6 : vm.filter.fromCreatedOn.getMonth()));
                    var endMonth = yearCounter == endYear ? vm.filter.toCreatedOn.getMonth() : 11;

                    for (var j = startMonth; j <= endMonth; j++) {
                        var newMonth = {};
                        newMonth.nameEn = monthEn[j];
                        newMonth.nameAr = monthAr[j];
                        newMonth.value = j;
                        newYear.months.push(newMonth);
                    }

                    vm.yearsData.push(newYear);
                    yearCounter++;
                }

                vm.selectedYear = vm.yearsData[0];
                vm.selectedMonth = vm.yearsData[0].months[0];

                vm.splineData = getSplineData(vm.achievement.applicationPerService, vm.selectedYear.value, vm.selectedMonth.value + 1);

                for (var i = 0; i < vm.achievement.lastFiveActions.length; i++) {
                    vm.achievement.lastFiveActions[i].actionDate = moment(vm.achievement.lastFiveActions[i].actionDate).startOf('day').fromNow();
                }
            },
            function (response) {

            });
        }

        vm.search();

        // Some numbers for demo
        vm.loadProgressValues = function () {
            vm.happinessRate = 0;
            vm.progressVal = [0, 0, 0, 0];
            // helps to show animation when values change
            $timeout(function () {
                vm.happinessRate = vm.happinessRateValue;
                vm.progressVal[1] = 34;
                vm.progressVal[2] = 22;
                vm.progressVal[3] = 76;
            });
        };

        // Pie Charts
        // ----------------------------------- 
        vm.pieOptions = {
            animate: {
                duration: 700,
                enabled: true
            },
            barColor: colors.byName('info'),
            // trackColor: colors.byName('inverse'),
            scaleColor: false,
            lineWidth: 10,
            lineCap: 'circle'
        };

        // Dashboard charts
        // ----------------------------------- 

        function getSplineData(items, selectedYear, selectedMonth) {

            // Spline chart
            vm.splineChartOpts = angular.extend({}, flotOptions['default'], {
                series: {
                    lines: {
                        show: false
                    },
                    splines: {
                        show: true,
                        tension: 0.2,
                        lineWidth: 2,
                        fill: 0.5
                    },
                }
            });

            var services = [];

            var openOfficeServiceList = $filter('filter')(items, { nameEn: 'Open representative office for media mean', year: selectedYear, month: selectedMonth }, true);
            var publishingPermitServiceList = $filter('filter')(items, { nameEn: 'Publishing Printing & Text Permit', year: selectedYear, month: selectedMonth }, true);
            var regulateEntriesServiceList = $filter('filter')(items, { nameEn: 'Regulate Entries', year: selectedYear, month: selectedMonth }, true);
            var journalistsAppointmentServiceList = $filter('filter')(items, { nameEn: 'Journalists Appointment', year: selectedYear, month: selectedMonth }, true);
            var bookMagazineServiceList = $filter('filter')(items, { nameEn: 'Book magazine or newspaper name', year: selectedYear, month: selectedMonth }, true);
            var photographyPermitServiceList = $filter('filter')(items, { nameEn: 'Film Photography Permit', year: selectedYear, month: selectedMonth }, true);
            var radioLicenseServiceList = $filter('filter')(items, { nameEn: 'Radio & TV Broadcasting License', year: selectedYear, month: selectedMonth }, true);
            var mediaLicenseServiceList = $filter('filter')(items, { nameEn: 'Media License', year: selectedYear, month: selectedMonth }, true);
            var mediaMaterialPermitServiceList = $filter('filter')(items, { nameEn: 'Circulation Media Material Permit', year: selectedYear, month: selectedMonth }, true);
            var circulationNewspaperPermitServiceList = $filter('filter')(items, { nameEn: 'Circulation Newspaper Magazine Permit', year: selectedYear, month: selectedMonth }, true);
            var newspaperMediaLicenseServiceList = $filter('filter')(items, { nameEn: 'Newspaper Media License', year: selectedYear, month: selectedMonth }, true);
            var equipmentPermitServiceList = $filter('filter')(items, { nameEn: 'Photocopying equipment permit', year: selectedYear, month: selectedMonth }, true);

            if (openOfficeServiceList.length > 0) {
                var legendObject = {};
                legendObject.label = $filter('localizeString')(openOfficeServiceList[0]);
                legendObject.color = colors.byName($rootScope.app.theme.name);
                legendObject.data = [];

                for (var i = 0; i < openOfficeServiceList.length; i++) {
                    for (var j = 1; j < 32; j++) {
                        if (openOfficeServiceList[i].day == j) {
                            var pair = [];
                            pair.push(openOfficeServiceList[i].day);
                            pair.push(openOfficeServiceList[i].numberOfApplication);
                            legendObject.data.push(pair);
                            break;
                        }
                        else {
                            var isExist = false;
                            for (var k = 0; k < legendObject.data.length; k++) {
                                if (legendObject.data[k][0] == j) {
                                    isExist = true;
                                }
                            }
                            if (!isExist) {
                                var pair = [];
                                pair.push(j);
                                pair.push(0);
                                legendObject.data.push(pair);
                            }
                        }
                    }
                }

                services.push(legendObject);
                var serviceExist = $filter('filter')(vm.achievement.servicesList, { name: $filter('localizeString')(openOfficeServiceList[0]) }, true)[0];

                if (!serviceExist) {
                    var service = {};
                    service.name = $filter('localizeString')(openOfficeServiceList[0]);
                    service.show = true;
                    vm.achievement.servicesList.push(service);
                    vm.areaSplineSeries.push(true);
                }
                else {
                    if (!serviceExist.show) {
                        var item = $filter('filter')(services, { label: $filter('localizeString')(openOfficeServiceList[0]) }, true)[0];
                        var index = services.indexOf(item);
                        services.splice(index, 1);
                    }
                }
            }

            if (publishingPermitServiceList.length > 0) {
                var legendObject = {};
                legendObject.label = $filter('localizeString')(publishingPermitServiceList[0]);
                legendObject.color = colors.byName($rootScope.app.theme.name);
                legendObject.data = [];

                for (var i = 0; i < publishingPermitServiceList.length; i++) {
                    for (var j = 1; j < 32; j++) {
                        if (publishingPermitServiceList[i].day == j) {
                            var pair = [];
                            pair.push(publishingPermitServiceList[i].day);
                            pair.push(publishingPermitServiceList[i].numberOfApplication);
                            legendObject.data.push(pair);
                            break;
                        }
                        else {
                            var isExist = false;
                            for (var k = 0; k < legendObject.data.length; k++) {
                                if (legendObject.data[k][0] == j) {
                                    isExist = true;
                                }
                            }
                            if (!isExist) {
                                var pair = [];
                                pair.push(j);
                                pair.push(0);
                                legendObject.data.push(pair);
                            }
                        }
                    }
                }

                services.push(legendObject);
                var isExist = $filter('filter')(vm.achievement.servicesList, { name: $filter('localizeString')(publishingPermitServiceList[0]) }, true)[0];

                if (!isExist) {
                    var service = {};
                    service.name = $filter('localizeString')(publishingPermitServiceList[0]);
                    service.show = true;
                    vm.achievement.servicesList.push(service);
                    vm.areaSplineSeries.push(true);
                }
                else {
                    if (!isExist.show) {
                        var item = $filter('filter')(services, { label: $filter('localizeString')(publishingPermitServiceList[0]) }, true)[0];
                        var index = services.indexOf(item);
                        services.splice(index, 1);
                    }
                }
            }

            if (regulateEntriesServiceList.length > 0) {
                var legendObject = {};
                legendObject.label = $filter('localizeString')(regulateEntriesServiceList[0]);
                legendObject.color = colors.byName($rootScope.app.theme.name);
                legendObject.data = [];

                for (var i = 0; i < regulateEntriesServiceList.length; i++) {
                    for (var j = 1; j < 32; j++) {
                        if (regulateEntriesServiceList[i].day == j) {
                            var pair = [];
                            pair.push(regulateEntriesServiceList[i].day);
                            pair.push(regulateEntriesServiceList[i].numberOfApplication);
                            legendObject.data.push(pair);
                            break;
                        }
                        else {
                            var isExist = false;
                            for (var k = 0; k < legendObject.data.length; k++) {
                                if (legendObject.data[k][0] == j) {
                                    isExist = true;
                                }
                            }
                            if (!isExist) {
                                var pair = [];
                                pair.push(j);
                                pair.push(0);
                                legendObject.data.push(pair);
                            }
                        }
                    }
                }

                services.push(legendObject);
                var isExist = $filter('filter')(vm.achievement.servicesList, { name: $filter('localizeString')(regulateEntriesServiceList[0]) }, true)[0];

                if (!isExist) {
                    var service = {};
                    service.name = $filter('localizeString')(regulateEntriesServiceList[0]);
                    service.show = true;
                    vm.achievement.servicesList.push(service);
                    vm.areaSplineSeries.push(true);
                }
                else {
                    if (!isExist.show) {
                        var item = $filter('filter')(services, { label: $filter('localizeString')(regulateEntriesServiceList[0]) }, true)[0];
                        var index = services.indexOf(item);
                        services.splice(index, 1);
                    }
                }
            }

            if (journalistsAppointmentServiceList.length > 0) {
                var legendObject = {};
                legendObject.label = $filter('localizeString')(journalistsAppointmentServiceList[0]);
                legendObject.color = colors.byName($rootScope.app.theme.name);
                legendObject.data = [];

                for (var i = 0; i < journalistsAppointmentServiceList.length; i++) {
                    for (var j = 1; j < 32; j++) {
                        if (journalistsAppointmentServiceList[i].day == j) {
                            var pair = [];
                            pair.push(journalistsAppointmentServiceList[i].day);
                            pair.push(journalistsAppointmentServiceList[i].numberOfApplication);
                            legendObject.data.push(pair);
                            break;
                        }
                        else {
                            var isExist = false;
                            for (var k = 0; k < legendObject.data.length; k++) {
                                if (legendObject.data[k][0] == j) {
                                    isExist = true;
                                }
                            }
                            if (!isExist) {
                                var pair = [];
                                pair.push(j);
                                pair.push(0);
                                legendObject.data.push(pair);
                            }
                        }
                    }
                }

                services.push(legendObject);
                var isExist = $filter('filter')(vm.achievement.servicesList, { name: $filter('localizeString')(journalistsAppointmentServiceList[0]) }, true)[0];

                if (!isExist) {
                    var service = {};
                    service.name = $filter('localizeString')(journalistsAppointmentServiceList[0]);
                    service.show = true;
                    vm.achievement.servicesList.push(service);
                    vm.areaSplineSeries.push(true);
                }
                else {
                    if (!isExist.show) {
                        var item = $filter('filter')(services, { label: $filter('localizeString')(journalistsAppointmentServiceList[0]) }, true)[0];
                        var index = services.indexOf(item);
                        services.splice(index, 1);
                    }
                }
            }

            if (bookMagazineServiceList.length > 0) {
                var legendObject = {};
                legendObject.label = $filter('localizeString')(bookMagazineServiceList[0]);
                legendObject.color = colors.byName($rootScope.app.theme.name);
                legendObject.data = [];

                for (var i = 0; i < bookMagazineServiceList.length; i++) {
                    for (var j = 1; j < 32; j++) {
                        if (bookMagazineServiceList[i].day == j) {
                            var pair = [];
                            pair.push(bookMagazineServiceList[i].day);
                            pair.push(bookMagazineServiceList[i].numberOfApplication);
                            legendObject.data.push(pair);
                            break;
                        }
                        else {
                            var isExist = false;
                            for (var k = 0; k < legendObject.data.length; k++) {
                                if (legendObject.data[k][0] == j) {
                                    isExist = true;
                                }
                            }
                            if (!isExist) {
                                var pair = [];
                                pair.push(j);
                                pair.push(0);
                                legendObject.data.push(pair);
                            }
                        }
                    }
                }

                services.push(legendObject);
                var isExist = $filter('filter')(vm.achievement.servicesList, { name: $filter('localizeString')(bookMagazineServiceList[0]) }, true)[0];

                if (!isExist) {
                    var service = {};
                    service.name = $filter('localizeString')(bookMagazineServiceList[0]);
                    service.show = true;
                    vm.achievement.servicesList.push(service);
                    vm.areaSplineSeries.push(true);
                }
                else {
                    if (!isExist.show) {
                        var item = $filter('filter')(services, { label: $filter('localizeString')(bookMagazineServiceList[0]) }, true)[0];
                        var index = services.indexOf(item);
                        services.splice(index, 1);
                    }
                }
            }

            if (photographyPermitServiceList.length > 0) {
                var legendObject = {};
                legendObject.label = $filter('localizeString')(photographyPermitServiceList[0]);
                legendObject.color = colors.byName($rootScope.app.theme.name);
                legendObject.data = [];

                for (var i = 0; i < photographyPermitServiceList.length; i++) {
                    for (var j = 1; j < 32; j++) {
                        if (photographyPermitServiceList[i].day == j) {
                            var pair = [];
                            pair.push(photographyPermitServiceList[i].day);
                            pair.push(photographyPermitServiceList[i].numberOfApplication);
                            legendObject.data.push(pair);
                            break;
                        }
                        else {
                            var isExist = false;
                            for (var k = 0; k < legendObject.data.length; k++) {
                                if (legendObject.data[k][0] == j) {
                                    isExist = true;
                                }
                            }
                            if (!isExist) {
                                var pair = [];
                                pair.push(j);
                                pair.push(0);
                                legendObject.data.push(pair);
                            }
                        }
                    }
                }

                services.push(legendObject);
                var isExist = $filter('filter')(vm.achievement.servicesList, { name: $filter('localizeString')(photographyPermitServiceList[0]) }, true)[0];

                if (!isExist) {
                    var service = {};
                    service.name = $filter('localizeString')(photographyPermitServiceList[0]);
                    service.show = true;
                    vm.achievement.servicesList.push(service);
                    vm.areaSplineSeries.push(true);
                }
                else {
                    if (!isExist.show) {
                        var item = $filter('filter')(services, { label: $filter('localizeString')(photographyPermitServiceList[0]) }, true)[0];
                        var index = services.indexOf(item);
                        services.splice(index, 1);
                    }
                }
            }

            if (radioLicenseServiceList.length > 0) {
                var legendObject = {};
                legendObject.label = $filter('localizeString')(radioLicenseServiceList[0]);
                legendObject.color = colors.byName($rootScope.app.theme.name);
                legendObject.data = [];

                for (var i = 0; i < radioLicenseServiceList.length; i++) {
                    for (var j = 1; j < 32; j++) {
                        if (radioLicenseServiceList[i].day == j) {
                            var pair = [];
                            pair.push(radioLicenseServiceList[i].day);
                            pair.push(radioLicenseServiceList[i].numberOfApplication);
                            legendObject.data.push(pair);
                            break;
                        }
                        else {
                            var isExist = false;
                            for (var k = 0; k < legendObject.data.length; k++) {
                                if (legendObject.data[k][0] == j) {
                                    isExist = true;
                                }
                            }
                            if (!isExist) {
                                var pair = [];
                                pair.push(j);
                                pair.push(0);
                                legendObject.data.push(pair);
                            }
                        }
                    }
                }

                services.push(legendObject);
                var isExist = $filter('filter')(vm.achievement.servicesList, { name: $filter('localizeString')(radioLicenseServiceList[0]) }, true)[0];

                if (!isExist) {
                    var service = {};
                    service.name = $filter('localizeString')(radioLicenseServiceList[0]);
                    service.show = true;
                    vm.achievement.servicesList.push(service);
                    vm.areaSplineSeries.push(true);
                }
                else {
                    if (!isExist.show) {
                        var item = $filter('filter')(services, { label: $filter('localizeString')(radioLicenseServiceList[0]) }, true)[0];
                        var index = services.indexOf(item);
                        services.splice(index, 1);
                    }
                }
            }

            if (mediaLicenseServiceList.length > 0) {
                var legendObject = {};
                legendObject.label = $filter('localizeString')(mediaLicenseServiceList[0]);
                legendObject.color = colors.byName($rootScope.app.theme.name);
                legendObject.data = [];

                for (var i = 0; i < mediaLicenseServiceList.length; i++) {
                    for (var j = 1; j < 32; j++) {
                        if (mediaLicenseServiceList[i].day == j) {
                            var pair = [];
                            pair.push(mediaLicenseServiceList[i].day);
                            pair.push(mediaLicenseServiceList[i].numberOfApplication);
                            legendObject.data.push(pair);
                            break;
                        }
                        else {
                            var isExist = false;
                            for (var k = 0; k < legendObject.data.length; k++) {
                                if (legendObject.data[k][0] == j) {
                                    isExist = true;
                                }
                            }
                            if (!isExist) {
                                var pair = [];
                                pair.push(j);
                                pair.push(0);
                                legendObject.data.push(pair);
                            }
                        }
                    }
                }

                services.push(legendObject);
                var isExist = $filter('filter')(vm.achievement.servicesList, { name: $filter('localizeString')(mediaLicenseServiceList[0]) }, true)[0];

                if (!isExist) {
                    var service = {};
                    service.name = $filter('localizeString')(mediaLicenseServiceList[0]);
                    service.show = true;
                    vm.achievement.servicesList.push(service);
                    vm.areaSplineSeries.push(true);
                }
                else {
                    if (!isExist.show) {
                        var item = $filter('filter')(services, { label: $filter('localizeString')(mediaLicenseServiceList[0]) }, true)[0];
                        var index = services.indexOf(item);
                        services.splice(index, 1);
                    }
                }
            }

            if (mediaMaterialPermitServiceList.length > 0) {
                var legendObject = {};
                legendObject.label = $filter('localizeString')(mediaMaterialPermitServiceList[0]);
                legendObject.color = colors.byName($rootScope.app.theme.name);
                legendObject.data = [];

                for (var i = 0; i < mediaMaterialPermitServiceList.length; i++) {
                    for (var j = 1; j < 32; j++) {
                        if (mediaMaterialPermitServiceList[i].day == j) {
                            var pair = [];
                            pair.push(mediaMaterialPermitServiceList[i].day);
                            pair.push(mediaMaterialPermitServiceList[i].numberOfApplication);
                            legendObject.data.push(pair);
                            break;
                        }
                        else {
                            var isExist = false;
                            for (var k = 0; k < legendObject.data.length; k++) {
                                if (legendObject.data[k][0] == j) {
                                    isExist = true;
                                }
                            }
                            if (!isExist) {
                                var pair = [];
                                pair.push(j);
                                pair.push(0);
                                legendObject.data.push(pair);
                            }
                        }
                    }
                }

                services.push(legendObject);
                var isExist = $filter('filter')(vm.achievement.servicesList, { name: $filter('localizeString')(mediaMaterialPermitServiceList[0]) }, true)[0];

                if (!isExist) {
                    var service = {};
                    service.name = $filter('localizeString')(mediaMaterialPermitServiceList[0]);
                    service.show = true;
                    vm.achievement.servicesList.push(service);
                    vm.areaSplineSeries.push(true);
                }
                else {
                    if (!isExist.show) {
                        var item = $filter('filter')(services, { label: $filter('localizeString')(mediaMaterialPermitServiceList[0]) }, true)[0];
                        var index = services.indexOf(item);
                        services.splice(index, 1);
                    }
                }
            }

            if (circulationNewspaperPermitServiceList.length > 0) {
                var legendObject = {};
                legendObject.label = $filter('localizeString')(circulationNewspaperPermitServiceList[0]);
                legendObject.color = colors.byName($rootScope.app.theme.name);
                legendObject.data = [];

                for (var i = 0; i < circulationNewspaperPermitServiceList.length; i++) {
                    for (var j = 1; j < 32; j++) {
                        if (circulationNewspaperPermitServiceList[i].day == j) {
                            var pair = [];
                            pair.push(circulationNewspaperPermitServiceList[i].day);
                            pair.push(circulationNewspaperPermitServiceList[i].numberOfApplication);
                            legendObject.data.push(pair);
                            break;
                        }
                        else {
                            var isExist = false;
                            for (var k = 0; k < legendObject.data.length; k++) {
                                if (legendObject.data[k][0] == j) {
                                    isExist = true;
                                }
                            }
                            if (!isExist) {
                                var pair = [];
                                pair.push(j);
                                pair.push(0);
                                legendObject.data.push(pair);
                            }
                        }
                    }
                }

                services.push(legendObject);
                var isExist = $filter('filter')(vm.achievement.servicesList, { name: $filter('localizeString')(circulationNewspaperPermitServiceList[0]) }, true)[0];

                if (!isExist) {
                    var service = {};
                    service.name = $filter('localizeString')(circulationNewspaperPermitServiceList[0]);
                    service.show = true;
                    vm.achievement.servicesList.push(service);
                    vm.areaSplineSeries.push(true);
                }
                else {
                    if (!isExist.show) {
                        var item = $filter('filter')(services, { label: $filter('localizeString')(circulationNewspaperPermitServiceList[0]) }, true)[0];
                        var index = services.indexOf(item);
                        services.splice(index, 1);
                    }
                }
            }

            if (newspaperMediaLicenseServiceList.length > 0) {
                var legendObject = {};
                legendObject.label = $filter('localizeString')(newspaperMediaLicenseServiceList[0]);
                legendObject.color = colors.byName($rootScope.app.theme.name);
                legendObject.data = [];

                for (var i = 0; i < newspaperMediaLicenseServiceList.length; i++) {
                    for (var j = 1; j < 32; j++) {
                        if (newspaperMediaLicenseServiceList[i].day == j) {
                            var pair = [];
                            pair.push(newspaperMediaLicenseServiceList[i].day);
                            pair.push(newspaperMediaLicenseServiceList[i].numberOfApplication);
                            legendObject.data.push(pair);
                            break;
                        }
                        else {
                            var isExist = false;
                            for (var k = 0; k < legendObject.data.length; k++) {
                                if (legendObject.data[k][0] == j) {
                                    isExist = true;
                                }
                            }
                            if (!isExist) {
                                var pair = [];
                                pair.push(j);
                                pair.push(0);
                                legendObject.data.push(pair);
                            }
                        }
                    }
                }

                services.push(legendObject);
                var isExist = $filter('filter')(vm.achievement.servicesList, { name: $filter('localizeString')(newspaperMediaLicenseServiceList[0]) }, true)[0];

                if (!isExist) {
                    var service = {};
                    service.name = $filter('localizeString')(newspaperMediaLicenseServiceList[0]);
                    service.show = true;
                    vm.achievement.servicesList.push(service);
                    vm.areaSplineSeries.push(true);
                }
                else {
                    if (!isExist.show) {
                        var item = $filter('filter')(services, { label: $filter('localizeString')(newspaperMediaLicenseServiceList[0]) }, true)[0];
                        var index = services.indexOf(item);
                        services.splice(index, 1);
                    }
                }
            }

            if (equipmentPermitServiceList.length > 0) {
                var legendObject = {};
                legendObject.label = $filter('localizeString')(equipmentPermitServiceList[0]);
                legendObject.color = colors.byName($rootScope.app.theme.name);
                legendObject.data = [];

                for (var i = 0; i < equipmentPermitServiceList.length; i++) {
                    for (var j = 1; j < 32; j++) {
                        if (equipmentPermitServiceList[i].day == j) {
                            var pair = [];
                            pair.push(equipmentPermitServiceList[i].day);
                            pair.push(equipmentPermitServiceList[i].numberOfApplication);
                            legendObject.data.push(pair);
                            break;
                        }
                        else {
                            var isExist = false;
                            for (var k = 0; k < legendObject.data.length; k++) {
                                if (legendObject.data[k][0] == j) {
                                    isExist = true;
                                }
                            }
                            for (var k = 0; k < legendObject.data.length; k++) {
                                if (legendObject.data[k][0] == j) {
                                    isExist = true;
                                }
                            }
                            if (!isExist) {
                                var pair = [];
                                pair.push(j);
                                pair.push(0);
                                legendObject.data.push(pair);
                            }
                        }
                    }
                }

                services.push(legendObject);
                var isExist = $filter('filter')(vm.achievement.servicesList, { name: $filter('localizeString')(equipmentPermitServiceList[0]) }, true)[0];

                if (!isExist) {
                    var service = {};
                    service.name = $filter('localizeString')(equipmentPermitServiceList[0]);
                    service.show = true;
                    vm.achievement.servicesList.push(service);
                    vm.areaSplineSeries.push(true);
                }
                else {
                    if (!isExist.show) {
                        var item = $filter('filter')(services, { label: $filter('localizeString')(equipmentPermitServiceList[0]) }, true)[0];
                        var index = services.indexOf(item);
                        services.splice(index, 1);
                    }
                }
            }

            return services;
        }

        //$scope.$watch('app.theme.name', function (val) {
        //    vm.splineData = getSplineData(vm.achievement.applicationPerService, 10);
        //});

        vm.Update = function () {
            vm.splineData = getSplineData(vm.achievement.applicationPerService, vm.selectedYear.value, vm.selectedMonth.value + 1);
        }

        // Small line chart
        // ----------------------------------- 

        vm.smallChartOpts = angular.extend({}, flotOptions['default'], {
            points: {
                show: true,
                radius: 1
            },
            series: {
                lines: {
                    show: true,
                    fill: 1,
                    lineWidth: 1,
                    fillColor: { colors: [{ opacity: 0.4 }, { opacity: 0.4 }] }
                }
            },
            grid: {
                show: false
            },
            legend: {
                show: false
            },
            xaxis: {
                tickDecimals: 0
            }
        });
        vm.smallChartData1 = [{
            'label': '',
            'color': colors.byName('success'),
            'data': [
              ['1', 8], ['2', 10], ['3', 12], ['4', 13], ['5', 13], ['6', 12], ['7', 11], ['8', 10], ['9', 9], ['10', 8], ['11', 8], ['12', 9], ['13', 10], ['14', 9], ['15', 8]
            ]
        }];
        vm.smallChartData2 = [{
            'label': '',
            'color': colors.byName('warning'),
            'data': [
              ['1', 9], ['2', 10], ['3', 9], ['4', 11], ['5', 12], ['6', 11], ['7', 10], ['8', 9], ['9', 8], ['10', 8], ['11', 8], ['12', 10], ['13', 12], ['14', 13], ['15', 13]
            ]
        }];

        // Sparkline
        // ----------------------------------- 
        vm.sparkOptionsLine = {
            chartRangeMin: 0,
            type: 'line',
            height: '80',
            width: '100%',
            lineWidth: '2',
            lineColor: colors.byName('purple'),
            spotColor: '#888',
            minSpotColor: colors.byName('purple'),
            maxSpotColor: colors.byName('purple'),
            fillColor: '',
            highlightLineColor: '#fff',
            spotRadius: '3',
            resize: 'true'
        };
    }
})();