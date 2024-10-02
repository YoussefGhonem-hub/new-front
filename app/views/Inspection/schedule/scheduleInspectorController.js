/**=========================================================
 * Module: LoginController.js
 * Controller for the Chat APP 
 =========================================================*/

(function () {
    'use strict';

    angular
        .module('eServices')
        .controller('ScheduleInspectorController', ScheduleInspectorController);

    function ScheduleInspectorController($rootScope, $scope, $http, $stateParams, $state, $window, $uibModal, UserProfile, browser, $compile, $filter, calendarConfig) {
        var vm = this;
        vm.employees = [];
        vm.inspectionSchedule = {};
        vm.events = [];

        vm.eventDropped = function (event, start, end) {
            if (start < vm.inspectionSchedule.startDate || start > vm.inspectionSchedule.endDate) {
                alert('N/A');
            }
            else {
                var externalIndex = vm.establishments.indexOf(event);
                if (externalIndex > -1) {
                    var establishment = vm.establishments.splice(externalIndex, 1);
                    event.title = $filter('localizeString')(event) + '<br/><span data-translate="achievements.employeeName"></span>: ' + vm.inspector.firstName + ' ' + vm.inspector.lastName;
                    event.draggable = true;
                    event.userId = vm.inspector.id;
                    event.color = vm.inspector.color;
                    vm.events.push(event);
                    vm.params.filterParams.excludedEstablishmentIds.push(event.id);
                    if (vm.establishments.length == 0) {
                        vm.getEstablishments();
                    }
                }
                event.startsAt = new Date(moment(start).set({ hours: 8, minutes: 0 }));
                event.endsAt = new Date(moment(start).set({ hours: 15, minutes: 30 }));
                vm.viewDate = start;
                vm.cellIsOpen = true;
            }
        };

        vm.goToSecondStep = function () {
            vm.isBusy = true;
            vm.params = {};
            vm.params.filterParams = {};
            vm.params.filterParams.economicActivities = [];
            if (vm.inspectionSchedule.location.communities && vm.inspectionSchedule.location.communities.length > 0) {
                vm.params.filterParams.communities = vm.inspectionSchedule.location.communities;
            }
            else if (vm.inspectionSchedule.location.region) {
                vm.params.filterParams.regions = [];
                vm.params.filterParams.regions.push(vm.inspectionSchedule.location.region);
            }
            else {
                vm.params.filterParams.emirates = [];
                vm.params.filterParams.emirates.push(vm.inspectionSchedule.location.emirate);
            }

            $http.post($rootScope.app.httpSource + 'api/EconomicActivity/GetEconomicActivitiesEstablishmentCount', vm.params)
               .then(function (response) {
                   vm.economicActivities = response.data;
                   vm.activeStep = 2;
                   vm.isBusy = false;
               });
        }

        vm.goToThirdStep = function () {
            vm.isBusy = true;

            if (vm.params == undefined) {
                vm.params = {};
                vm.params.filterParams = {};
            }

            vm.params.page = 1;
            vm.params.pageSize = 10;
            vm.params.filterParams.excludedEstablishmentIds = [];

            if (vm.editMode) {
                for (var i = 0; i < vm.inspectionSchedule.taskGroupEmployees.length; i++) {
                    for (var j = 0; j < vm.inspectionSchedule.taskGroupEmployees[i].taskLists.length; j++) {
                        vm.params.filterParams.excludedEstablishmentIds.push(vm.inspectionSchedule.taskGroupEmployees[i].taskLists[j].establishmentId);
                    }
                }
            }

            if (vm.inspectionSchedule.location.communities && vm.inspectionSchedule.location.communities.length > 0) {
                vm.params.filterParams.communities = vm.inspectionSchedule.location.communities;
            }
            else if (vm.inspectionSchedule.location.region) {
                vm.params.filterParams.regions = [];
                vm.params.filterParams.regions.push(vm.inspectionSchedule.location.region);
            }
            else {
                vm.params.filterParams.emirates = [];
                vm.params.filterParams.emirates.push(vm.inspectionSchedule.location.emirate);
            }

            vm.calendarView = 'month';
            vm.viewDate = moment(vm.inspectionSchedule.startDate).startOf('month').toDate();
            vm.cellModifier = function (cell) {
                if (cell.date < vm.inspectionSchedule.startDate || cell.date > vm.inspectionSchedule.endDate) {
                    cell.cssClass = 'disabledCells';
                }
            };
            vm.inspector = vm.inspectors[0];

            for (var i = 0; i < vm.inspectors.length; i++) {
                if (i == 0) {
                    vm.inspectors[i].color = calendarConfig.colorTypes.info;
                }
                if (i == 1) {
                    vm.inspectors[i].color = calendarConfig.colorTypes.important;
                }
                if (i == 2) {
                    vm.inspectors[i].color = calendarConfig.colorTypes.warning;
                }
                if (i == 3) {
                    vm.inspectors[i].color = calendarConfig.colorTypes.inverse;
                }
                if (i == 4) {
                    vm.inspectors[i].color = calendarConfig.colorTypes.special;
                }
                if (i == 5) {
                    vm.inspectors[i].color = calendarConfig.colorTypes.success;
                }
            }

            vm.getEstablishments();
        }

        vm.previousToSecondStep = function () {
            vm.activeStep = 2;
            vm.returnBack = true;
        }

        vm.previousToFirstStep = function () {
            vm.activeStep = 1;
            vm.returnBack = true;
        }

        // -----------------------------------------------

        // -----------------------------------
        // Start and End Dates Datepicker
        // -----------------------------------
        // Disable select days < today
        vm.startDateDisabled = function (date, mode) {
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

        vm.endDisabled = function (date, mode) {
            var today = new Date();
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
        //-------------------------------------------------

        vm.getEstablishments = function () {
            $http.post($rootScope.app.httpSource + 'api/Establishment/GetEstablishments', vm.params)
                .then(function (resp) {
                    vm.params.totalRecords = resp.data.totalRecords;
                    if (vm.communities == undefined || vm.communities.length == 0) {
                        $http.get($rootScope.app.httpSource + 'api/Community/GetCommunities')
                            .then(function (response) {
                                vm.communities = response.data;
                                vm.establishments = resp.data.content;
                                vm.activeStep = 3;
                            });
                    }
                    else {
                        vm.establishments = resp.data.content;
                        vm.activeStep = 3;
                    }
                    vm.isBusy = false;
                },
                function (response) {
                    vm.isBusy = false;
                });
        };

        vm.Init = function () {
            vm.isBusy = false;
            vm.activeStep = 1;
            vm.terms = {};
            vm.user = UserProfile.getProfile();

            $http.get($rootScope.app.httpSource + 'api/InspectionReason')
                   .then(function (response) {
                       vm.inspectionReasons = response.data;
                   },
                   function (response) { });

            $http.get($rootScope.app.httpSource + 'api/UserProfile/GetInspectors')
                .then(function (resp) {
                    for (var i = 0; i < resp.data.length; i++) {
                        vm.employees.push(resp.data[i].user);
                    }
                },
                function (response) {
                });
        };

        //New Form Condition
        if ($state.params === undefined || $state.params.id === undefined || $state.params.id === "") {
            vm.editMode = false;
            vm.Init();
        }
        else {
            //Get the details of the submitted Form to edit
            $http.get($rootScope.app.httpSource + 'api/TaskGroup/GetById?id=' + $state.params.id)
              .then(function (response) {
                  vm.editMode = true;
                  vm.inspectionSchedule = response.data;
                  vm.inspectionSchedule.startDate = new Date(vm.inspectionSchedule.startDate);
                  vm.inspectionSchedule.endDate = new Date(vm.inspectionSchedule.endDate);
                  vm.inspectionSchedule.location = {};
                  vm.inspectionSchedule.location.emirate = response.data.region.emirate;
                  vm.inspectionSchedule.location.region = response.data.region;
                  vm.inspectionSchedule.location.communities = [];

                  for (var i = 0; i < vm.inspectionSchedule.taskGroupEmployees.length; i++) {
                      for (var j = 0; j < vm.inspectionSchedule.taskGroupEmployees[i].taskLists.length; j++) {
                          var event = {};
                          event.title = $filter('localizeString')(vm.inspectionSchedule.taskGroupEmployees[i].taskLists[j].establishment) +
                              '<br/><span data-translate="achievements.employeeName"></span>: ' + vm.inspectionSchedule.taskGroupEmployees[i].user.firstName + ' ' +
                              vm.inspectionSchedule.taskGroupEmployees[i].user.lastName;
                          event.draggable = true;
                          event.userId = vm.inspectionSchedule.taskGroupEmployees[i].userId;
                          //event.color = vm.inspector.color;
                          event.startsAt = new Date(vm.inspectionSchedule.taskGroupEmployees[i].taskLists[j].startsAt);
                          event.endsAt = new Date(vm.inspectionSchedule.taskGroupEmployees[i].taskLists[j].endsAt);
                          vm.events.push(event);
                      }
                  }

                  for (var i = 0; i < response.data.taskGroupCommunities.length; i++) {
                      vm.inspectionSchedule.location.communities.push(response.data.taskGroupCommunities[i].community);
                  }
                  vm.Init();
              });
        }

        //Save the details to the server
        vm.save = function (applicationStatusId) {
            vm.isBusy = true;
            vm.inspectionSchedule.inspectionReason = vm.params.filterParams.inspectionReason;

            if (vm.inspectionSchedule.location.region) {
                vm.inspectionSchedule.region = vm.inspectionSchedule.location.region;
            }
            else {
                vm.inspectionSchedule.region = vm.inspectionSchedule.location.emirate.regions[0];
            }

            if (vm.inspectionSchedule.location.communities && vm.inspectionSchedule.location.communities.length > 0) {
                vm.inspectionSchedule.taskGroupCommunities = [];
                for (var i = 0; i < vm.inspectionSchedule.location.communities.length; i++) {
                    var taskGroupCommunity = {};
                    taskGroupCommunity.community = vm.inspectionSchedule.location.communities[i];
                    vm.inspectionSchedule.taskGroupCommunities.push(taskGroupCommunity);
                }
            }

            for (var i = 0; i < vm.inspectionSchedule.taskGroupEmployees.length; i++) {
                var events = $filter('filter')(vm.events, { userId: vm.inspectionSchedule.taskGroupEmployees[i].user.id });

                if (events && events.length > 0) {
                    vm.inspectionSchedule.taskGroupEmployees[i].taskLists = [];

                    for (var j = 0; j < events.length; j++) {
                        var taskList = {};
                        taskList.visits = [{ establishmentId: events[j].id }];
                        taskList.startsAt = events[j].startsAt;
                        taskList.endsAt = events[j].endsAt;
                        vm.inspectionSchedule.taskGroupEmployees[i].taskLists.push(taskList);
                    }
                }
            }

            //Post to save
            switch (applicationStatusId) {
                case 1:
                    $http.post($rootScope.app.httpSource + 'api/TaskGroup/SaveTaskGroup', vm.inspectionSchedule)
                         .then(function (response) {
                             $state.go('app.scheduledTables');
                         },
                         function (response) { // optional
                             vm.isBusy = false;
                         });
                    break;

                case 2:
                    $http.post($rootScope.app.httpSource + 'api/TaskGroup/ApproveTaskGroup', vm.inspectionSchedule)
                         .then(function (response) {
                             $state.go('app.scheduledTables');
                         },
                         function (response) { // optional
                             vm.isBusy = false;
                         });
                    break;
            }
        }

        vm.doSearch = function () {
            vm.loading = true;
            vm.getEstablishments();
        };

        vm.DoPaging = function (page, pageSize, total) {
            vm.loading = true;
            vm.params.page = page;
            vm.getEstablishments();
        };
    }

    ScheduleInspectorController.$inject = ['$rootScope', '$scope', '$http', '$stateParams', '$state', '$window', '$uibModal', 'UserProfile', 'browser', '$compile', '$filter',
                                            'calendarConfig'];
})();