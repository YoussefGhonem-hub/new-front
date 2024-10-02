/**=========================================================
 * Module: RegulateItemsController.js
 * Controller for the Chat APP 
 =========================================================*/

(function () {
    'use strict';

    angular
        .module('eServices')
        .controller('RegulateItemsController', RegulateItemsController);
    /* @ngInject */
    function RegulateItemsController($rootScope, $scope, $uibModalInstance, $filter, $http, UserProfile, mediaMaterial, $state, mediaLicense, beneficiaryTypeId) {
        $scope.mediaMaterial = {};
        $scope.user = UserProfile.getProfile();
        $scope.beneficiaryTypeId = beneficiaryTypeId;
        if (mediaMaterial != undefined) {
            $scope.mediaMaterial = mediaMaterial;
        }
        $http.get($rootScope.app.httpSource + 'api/Language')
            .then(function (response) {
                $scope.mediaMaterial.languages = response.data;
            });

        $http.get($rootScope.app.httpSource + 'api/CustomMaterial')
            .then(function (response) {
                $scope.mediaMaterial.customMaterials = response.data;
            });

        if ($state.params.establishmentId) {
            if ($scope.user.userTypeCode == '07') {
                $http.get($rootScope.app.httpSource + 'api/MaterialType')
                    .then(function (response) {
                        var mediaTypes = response.data;
                        $scope.mediaMaterial.materialTypes = [];
                        if (beneficiaryTypeId != null && (beneficiaryTypeId == 1 || beneficiaryTypeId == 2)) {
                            $scope.mediaMaterial.materialTypes.push($filter('filter')(mediaTypes, { userTypeId: 2, code: 'BR' }, true)[0]);

                            if (mediaLicense != null && mediaLicense.numberOfBooksRegulateEntriesApplications > 0) {
                                $scope.mediaMaterial.materialTypes.push($filter('filter')(mediaTypes, { userTypeId: 2, code: 'BK' }, true)[0]);
                            }
                            if (mediaLicense != null && mediaLicense.numberOfComputerProgramsRegulateEntriesApplications > 0) {
                                $scope.mediaMaterial.materialTypes.push($filter('filter')(mediaTypes, { userTypeId: 2, code: 'CD' }, true)[0]);
                                $scope.mediaMaterial.materialTypes.push($filter('filter')(mediaTypes, { userTypeId: 2, code: 'DV' }, true)[0]);
                                $scope.mediaMaterial.materialTypes.push($filter('filter')(mediaTypes, { userTypeId: 2, code: 'CP' }, true)[0]);
                            }
                            if (mediaLicense != null && mediaLicense.numberOfVideoGamesRegulateEntriesApplications > 0) {
                                $scope.mediaMaterial.materialTypes.push($filter('filter')(mediaTypes, { userTypeId: 2, code: 'VG' }, true)[0]);
                            }
                            if (mediaLicense != null && mediaLicense.numberOfCinemaRegulateEntriesApplications > 0) {
                                $scope.mediaMaterial.materialTypes.push($filter('filter')(mediaTypes, { userTypeId: 2, code: 'CI' }, true)[0]);
                            }
                        }
                        else if (beneficiaryTypeId != null && beneficiaryTypeId == 3) {
                            $scope.mediaMaterial.materialTypes = $filter('filter')(mediaTypes, { userTypeId: 3 }, true);
                        }
                        else if (beneficiaryTypeId != null && beneficiaryTypeId == 4) {
                            $scope.mediaMaterial.materialTypes = $filter('filter')(mediaTypes, { userTypeId: 1 }, true);
                        }
                        else if (beneficiaryTypeId != null && beneficiaryTypeId == 5) {
                            $scope.mediaMaterial.materialTypes = $filter('filter')(mediaTypes, { userTypeId: 21 }, true);
                        }
                    });
            }
            else {
                $http.get($rootScope.app.httpSource + 'api/MaterialType?establishmentId=' + $state.params.establishmentId)
                    .then(function (response) {
                        if ($scope.user.userTypeCode == "02") {
                            $scope.mediaMaterial.materialTypes = $filter('filter')(response.data, { userTypeId: 2 }, true);
                        }
                        else {
                            $scope.mediaMaterial.materialTypes = response.data;
                        }
                    });
            }
        }
        else {
            $http.get($rootScope.app.httpSource + 'api/MaterialType')
                .then(function (response) {
                    if ($scope.user.userTypeCode == "01") {
                        $scope.mediaMaterial.materialTypes = $filter('filter')(response.data, { userTypeId: 1 }, true);
                    }
                });
        }

        $scope.ok = function () {
            $uibModalInstance.close($scope.mediaMaterial);
        };

        $scope.closeModal = function () {
            $uibModalInstance.dismiss('cancel');
        };

    }

    RegulateItemsController.$inject = ['$rootScope', '$scope', '$uibModalInstance', '$filter', '$http', 'UserProfile', 'mediaMaterial', '$state', 'mediaLicense', 'beneficiaryTypeId'];
})();