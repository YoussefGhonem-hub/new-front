/**=========================================================
 * Module: DashboardController.js
 =========================================================*/

(function () {
    'use strict';

    angular
        .module('eServices')
        .controller('ChooseEstablishmentController', ChooseEstablishmentController);

    ChooseEstablishmentController.$inject = ['$rootScope', '$scope', '$http', '$uibModalInstance', '$filter', 'menuItemClicked', '$state'];
    function ChooseEstablishmentController($rootScope, $scope, $http, $uibModalInstance, $filter, menuItemClicked, $state) {
        $scope.object = {};
        $scope.params = {};
        $scope.params.page = 1;
        $scope.params.pageSize = 7;
        $scope.loading = true;

        $scope.ok = function () {
            $uibModalInstance.close($scope.object.selectedItem);
        };

        $scope.closeModal = function () {
            $uibModalInstance.dismiss();
        };

        $scope.DoPaging = function (page, pageSize, total) {
            $scope.loading = true;
            $scope.params.page = page;
            $scope.getEstablishmentData();
        };

        $scope.DoSearch = function () {
            $scope.loading = true;
            $scope.getEstablishmentData();
        };

        $scope.getEstablishmentData = function () {
            switch (menuItemClicked.id) {
                case 4:
                    $http.post($rootScope.app.httpSource + 'api/Establishment/GetPagedEstablishmentApplications', $scope.params)
                        .then(function (response) {
                            $scope.loading = false;
                            $scope.establishmentApplications = response.data.content;
                            $scope.params.totalRecords = response.data.totalRecords;
                            for (var i = 0; i < $scope.establishmentApplications.length; i++) {
                                $scope.establishmentApplications[i].info = null;
                                if ($scope.establishmentApplications[i].numberOfBooksRegulateEntriesApplications == 0 &&
                                    $scope.establishmentApplications[i].numberOfComputerProgramsRegulateEntriesApplications == 0 &&
                                    $scope.establishmentApplications[i].numberOfVideoGamesRegulateEntriesApplications == 0 &&
                                    $scope.establishmentApplications[i].numberOfCinemaRegulateEntriesApplications == 0 &&
                                    $scope.establishmentApplications[i].numberOfNewspaperRegulateEntriesApplications == 0) {
                                    $scope.establishmentApplications[i].info = $filter('translate')('establishment.hasNoRegulateEntriesMediaLicesne');
                                }
                            }
                        },
                        function (response) { $scope.loading = false; });

                    break;

                case 8:
                    $http.post($rootScope.app.httpSource + 'api/Establishment/GetPagedEstablishmentApplications', $scope.params)
                        .then(function (response) {
                            $scope.loading = false;
                            $scope.establishmentApplications = response.data.content;
                            $scope.params.totalRecords = response.data.totalRecords;
                            for (var i = 0; i < $scope.establishmentApplications.length; i++) {
                                $scope.establishmentApplications[i].info = null;
                                if ($scope.establishmentApplications[i].numberOfApplications1 != 0) {
                                    $scope.establishmentApplications[i].info = $filter('translate')('establishment.hasMediaLicesne');
                                }
                            }
                        },
                        function (response) { $scope.loading = false; });

                    break;

                case 44:
                    $http.post($rootScope.app.httpSource + 'api/Establishment/GetPagedEstablishmentApplications', $scope.params)
                        .then(function (response) {
                            $scope.loading = false;
                            $scope.establishmentApplications = response.data.content;
                            $scope.params.totalRecords = response.data.totalRecords;
                            for (var i = 0; i < $scope.establishmentApplications.length; i++) {
                                $scope.establishmentApplications[i].info = null;
                                if ($scope.establishmentApplications[i].numberOfSocialMediaApplications != 0) {
                                    $scope.establishmentApplications[i].info = $filter('translate')('establishment.hasSocialMediaLicesne');
                                }
                            }
                        },
                            function (response) { $scope.loading = false; });

                    break;

                case 12:
                    $http.post($rootScope.app.httpSource + 'api/Establishment/GetPagedEstablishmentApplications', $scope.params)
                        .then(function (response) {
                            $scope.loading = false;
                            $scope.establishmentApplications = response.data.content;
                            $scope.params.totalRecords = response.data.totalRecords;
                            for (var i = 0; i < $scope.establishmentApplications.length; i++) {
                                $scope.establishmentApplications[i].info = null;
                                if ($scope.establishmentApplications[i].numberOfOpticalMediaApplications == 0 && $scope.establishmentApplications[i].numberOfAudioMediaApplications == 0 &&
                                    $scope.establishmentApplications[i].numberOfComputerProgramsMediaApplications == 0 &&
                                    $scope.establishmentApplications[i].numberOfVideoGamesMediaApplications == 0 && $scope.establishmentApplications[i].numberOfCinemaMediaApplications == 0) {
                                    $scope.establishmentApplications[i].info = $filter('translate')('establishment.hasNoCirculationMediaLicense');
                                }
                            }
                        },
                        function (response) { $scope.loading = false; });

                    break;

                case 13:
                    $http.post($rootScope.app.httpSource + 'api/Establishment/GetPagedEstablishmentApplications', $scope.params)
                        .then(function (response) {
                            $scope.loading = false;
                            $scope.establishmentApplications = response.data.content;
                            $scope.params.totalRecords = response.data.totalRecords;
                            for (var i = 0; i < $scope.establishmentApplications.length; i++) {
                                $scope.establishmentApplications[i].info = null;
                                if ($scope.establishmentApplications[i].numberOfNewspaperApplications == 0 && $scope.establishmentApplications[i].numberOfImportNewspaperApplications == 0) {
                                    $scope.establishmentApplications[i].info = $filter('translate')('establishment.hasNewspaper');
                                }
                            }
                        },
                        function (response) { $scope.loading = false; });

                    break;
                case 42:
                    $state.go(menuItemClicked.url);
                    $scope.loading = false;                    
                    document.getElementById('btnCloseId').click();
                    break;
                case 43:
                    $state.go(menuItemClicked.url);
                    $scope.loading = false;                                   
                    document.getElementById('btnCloseId').click();
                    break;
                default:
                    $http.post($rootScope.app.httpSource + 'api/Establishment/GetPagedEstablishmentApplications', $scope.params)
                        .then(function (response) {
                            $scope.loading = false;
                            $scope.establishmentApplications = response.data.content;
                            $scope.params.totalRecords = response.data.totalRecords;
                            for (var i = 0; i < $scope.establishmentApplications.length; i++) {
                                $scope.establishmentApplications[i].info = null;
                            }
                        },
                            function (response) {$scope.loading = false;});

                    break;
                    
            };
        }

        $scope.getEstablishmentData();
    }
})();
