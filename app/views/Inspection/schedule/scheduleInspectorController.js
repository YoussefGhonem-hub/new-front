(function () {
    'use strict';

    // Register the controller with the module
    angular
        .module('eServices')
        .controller('ScheduleInspectorController', ScheduleInspectorController);

    // Inject necessary dependencies
    ScheduleInspectorController.$inject = ['$rootScope', '$scope', '$http', '$stateParams', '$state', '$window', '$uibModal', 'UserProfile', 'browser', '$compile', '$filter', 'calendarConfig'];

    function ScheduleInspectorController($rootScope, $scope, $http, $stateParams, $state, $window, $uibModal, UserProfile, browser, $compile, $filter, calendarConfig) {
        var vm = this;
        vm.employees = [];
        vm.inspectionSchedule = {};
        vm.events = [];
        vm.isBusy = false;
        vm.activeStep = 1;

        // Event handler for dragging and dropping events
        vm.eventDropped = function (event, start, end) {
            if (start < vm.inspectionSchedule.startDate || start > vm.inspectionSchedule.endDate) {
                alert('N/A');
            } else {
                var externalIndex = vm.establishments.indexOf(event);
                if (externalIndex > -1) {
                    var establishment = vm.establishments.splice(externalIndex, 1);
                    event.title = $filter('localizeString')(event) + '<br/><span data-translate="achievements.employeeName"></span>: ' + vm.inspector.firstName + ' ' + vm.inspector.lastName;
                    event.draggable = true;
                    event.userId = vm.inspector.id;
                    event.color = vm.inspector.color;
                    vm.events.push(event);
                    vm.params.filterParams.excludedEstablishmentIds.push(event.id);
                    if (vm.establishments.length === 0) {
                        vm.getEstablishments();
                    }
                }
                event.startsAt = new Date(moment(start).set({ hours: 8, minutes: 0 }));
                event.endsAt = new Date(moment(start).set({ hours: 15, minutes: 30 }));
                vm.viewDate = start;
                vm.cellIsOpen = true;
            }
        };

        // Step navigation logic
        vm.goToSecondStep = function () {
            vm.isBusy = true;
            vm.params = {};
            vm.params.filterParams = {};
            vm.params.filterParams.economicActivities = [];

            if (1) {
                // Uncomment and modify if needed
                // vm.params.filterParams.communities = vm.inspectionSchedule.location.communities;
            } else if (vm.inspectionSchedule?.location?.region) {
                vm.params.filterParams.regions = [vm.inspectionSchedule.location.region];
            } else {
                vm.params.filterParams.emirates = [vm.inspectionSchedule.location.emirate];
            }

            $http.post($rootScope.app.httpSource + 'api/EconomicActivity/GetEconomicActivitiesEstablishmentCount', vm.params)
                .then(function (response) {
                    vm.economicActivities = response.data;
                    vm.activeStep = 2;
                    vm.isBusy = false;
                });
        };

        vm.goToThirdStep = function () {
            vm.isBusy = true;
            vm.params = vm.params || { filterParams: {} };
            vm.params.page = 1;
            vm.params.pageSize = 10;
            vm.params.filterParams.excludedEstablishmentIds = [];

            if (vm.editMode) {
                vm.inspectionSchedule.taskGroupEmployees.forEach(employee => {
                    employee.taskLists.forEach(task => {
                        vm.params.filterParams.excludedEstablishmentIds.push(task.establishmentId);
                    });
                });
            }

            if (1) {
                // Uncomment and modify if needed
                // vm.params.filterParams.communities = vm.inspectionSchedule.location.communities;
            } else if (vm.inspectionSchedule?.location?.region) {
                vm.params.filterParams.regions = [vm.inspectionSchedule.location.region];
            } else {
                vm.params.filterParams.emirates = [vm.inspectionSchedule.location.emirate];
            }

            vm.calendarView = 'month';
            vm.viewDate = moment(vm.inspectionSchedule.startDate).startOf('month').toDate();
            vm.cellModifier = function (cell) {
                if (cell.date < vm.inspectionSchedule.startDate || cell.date > vm.inspectionSchedule.endDate) {
                    cell.cssClass = 'disabledCells';
                }
            };

            vm.inspector = vm.inspectors[0];
            vm.inspectors.forEach((inspector, index) => {
                const colors = [
                    calendarConfig.colorTypes.info,
                    calendarConfig.colorTypes.important,
                    calendarConfig.colorTypes.warning,
                    calendarConfig.colorTypes.inverse,
                    calendarConfig.colorTypes.special,
                    calendarConfig.colorTypes.success
                ];
                inspector.color = colors[index % colors.length];
            });

            vm.getEstablishments();
        };

        // Previous step functions
        vm.previousToSecondStep = function () {
            vm.activeStep = 2;
            vm.returnBack = true;
        };

        vm.previousToFirstStep = function () {
            vm.activeStep = 1;
            vm.returnBack = true;
        };

        // Datepicker logic
        vm.startDateDisabled = function (date) {
            return date < new Date();
        };

        vm.toggleMin = function () {
            vm.minDate = vm.minDate ? null : new Date();
        };

        vm.toggleMin();

        vm.openStartDate = function ($event) {
            $event.preventDefault();
            $event.stopPropagation();
            vm.startDateOpened = true;
        };

        vm.dateOptions = {
            startingDay: 1
        };

        vm.formats = ['dd-MMMM-yyyy', 'yyyy/MM/dd', 'dd.MM.yyyy', 'shortDate'];
        vm.format = vm.formats[0];

        vm.endDisabled = function (date) {
            return date < vm.inspectionSchedule.startDate;
        };

        vm.endtoggleMin = function () {
            vm.endminDate = vm.endminDate ? null : new Date();
        };

        vm.endtoggleMin();

        vm.openEndDate = function ($event) {
            $event.preventDefault();
            $event.stopPropagation();
            vm.endDateOpened = true;
        };

        // Get establishments
        vm.getEstablishments = function () {
            $http.post($rootScope.app.httpSource + 'api/Establishment/GetEstablishments', vm.params)
                .then(function (resp) {
                    vm.params.totalRecords = resp.data.totalRecords;
                    if (!vm.communities || vm.communities.length === 0) {
                        $http.get($rootScope.app.httpSource + 'api/Community/GetCommunities')
                            .then(function (response) {
                                vm.communities = response.data;
                                vm.establishments = resp.data.content;
                                vm.activeStep = 3;
                            });
                    } else {
                        vm.establishments = resp.data.content;
                        vm.activeStep = 3;
                    }
                    vm.isBusy = false;
                }).catch(function () {
                    vm.isBusy = false;
                });
        };

        // Initialization function
        vm.Init = function () {
            vm.isBusy = false;
            vm.activeStep = 1;
            vm.terms = {};
            vm.user = UserProfile.getProfile();

            $http.get($rootScope.app.httpSource + 'api/InspectionReason')
                .then(function (response) {
                    vm.inspectionReasons = response.data;
                });

            $http.get($rootScope.app.httpSource + 'api/UserProfile/GetInspectors')
                .then(function (resp) {
                    resp.data.forEach(data => vm.employees.push(data.user));
                });
        };

        // Load form for new or edit mode
        if (!$state.params || !$state.params.id) {
            vm.editMode = false;
            vm.Init();
        } else {
            $http.get($rootScope.app.httpSource + 'api/TaskGroup/GetById?id=' + $state.params.id)
                .then(function (response) {
                    vm.editMode = true;
                    vm.inspectionSchedule = response.data;
                    vm.inspectionSchedule.startDate = new Date(vm.inspectionSchedule.startDate);
                    vm.inspectionSchedule.endDate = new Date(vm.inspectionSchedule.endDate);
                    vm.inspectionSchedule.location = {
                        emirate: response.data.region.emirate,
                        region: response.data.region,
                        communities: []
                    };

                    response.data.taskGroupCommunities.forEach(community => {
                        vm.inspectionSchedule.location.communities.push(community.community);
                    });

                    vm.inspectionSchedule.taskGroupEmployees.forEach(employee => {
                        employee.taskLists.forEach(task => {
                            var event = {
                                title: $filter('localizeString')(task.establishment) + '<br/><span data-translate="achievements.employeeName"></span>: ' + employee.user.firstName + ' ' + employee.user.lastName,
                                draggable: true,
                                userId: employee.userId,
                                startsAt: new Date(task.startsAt),
                                endsAt: new Date(task.endsAt)
                            };
                            vm.events.push(event);
                        });
                    });
                    vm.Init();
                });
        }

        // Save data to the server
        vm.save = function (applicationStatusId) {
            vm.isBusy = true;
            vm.inspectionSchedule.inspectionReason = vm.params.filterParams.inspectionReason;

            // Ensure location and emirate are defined
            if (vm.inspectionSchedule.location && vm.inspectionSchedule.location.region) {
                vm.inspectionSchedule.region = vm.inspectionSchedule.location.region;
            } else if (vm.inspectionSchedule.location && vm.inspectionSchedule.location.emirate && vm.inspectionSchedule.location.emirate.regions) {
                vm.inspectionSchedule.region = vm.inspectionSchedule.location.emirate.regions[0];
            } else {
                console.error('Location or emirate data is missing.', vm.inspectionSchedule);
                vm.isBusy = false;
                return;
            }

            // Ensure communities are defined
            if (vm.inspectionSchedule.location && vm.inspectionSchedule.location.communities && vm.inspectionSchedule.location.communities.length > 0) {
                vm.inspectionSchedule.taskGroupCommunities = vm.inspectionSchedule.location.communities.map(community => ({ community }));
            }

            vm.inspectionSchedule.taskGroupEmployees.forEach(employee => {
                var events = $filter('filter')(vm.events, { userId: employee.user.id });
                if (events.length > 0) {
                    employee.taskLists = events.map(event => ({
                        visits: [{ establishmentId: event.id }],
                        startsAt: event.startsAt,
                        endsAt: event.endsAt
                    }));
                }
            });

            // Post to save
            var apiUrl = applicationStatusId === 1
                ? 'api/TaskGroup/SaveTaskGroup'
                : 'api/TaskGroup/ApproveTaskGroup';

            $http.post($rootScope.app.httpSource + apiUrl, vm.inspectionSchedule)
                .then(function () {
                    $state.go('app.scheduledTables');
                }).finally(function () {
                    vm.isBusy = false;
                });
        };


        // Search and pagination
        vm.doSearch = function () {
            vm.loading = true;
            vm.getEstablishments();
        };

        vm.DoPaging = function (page, pageSize) {
            vm.loading = true;
            vm.params.page = page;
            vm.getEstablishments();
        };
    }
})();
