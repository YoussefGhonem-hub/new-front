
(function () {
    'use strict';
    angular
        .module('eServices')
        .controller('ReviewSponsorshipController', ReviewSponsorshipController);
    function ReviewSponsorshipController($rootScope, $scope, $http, $stateParams, $state, $window, $uibModal, UserProfile, DTOptionsBuilder, DTColumnBuilder, $filter, $compile) {
        var vm = this;
        vm.translateFilter = $filter('translate');
        vm.applicationOpen = true;

        vm.Init = function () {
            vm.serviceFees = { serviceId: 19, serviceFee: [] };
            vm.user = UserProfile.getProfile();
        };

        //Get the details of the all applications
        $http.get($rootScope.app.httpSource + 'api/ForeignPressCard/GetAllAppliationByUser')
            .then(function (response) {
                vm.getAllPressCardApplications = response.data;
                vm.pressCardModel = {
                    pressCard1: {}
                }
                for (var i = 0; i < vm.getAllPressCardApplications.length; i++) {
                    vm.pressCardModel.pressCard1 = vm.getAllPressCardApplications[i];
                    vm.pressCardModel.certificateWithHeaderUrl = vm.pressCardModel.pressCard1.applicationDetail.certificates[0].certificateWithHeaderUrl;
                    vm.pressCardModel.certificateWithHeaderFullUrl = vm.pressCardModel.pressCard1.applicationDetail.certificates[0].certificateWithHeaderFullUrl;

                    vm.pressCardModel.assignmentLetterUrl = vm.pressCardModel.pressCard1.pressCard[0].assignmentLetterUrl;
                    vm.pressCardModel.assignmentLetterUrlFullPath = vm.pressCardModel.pressCard1.pressCard[0].assignmentLetterUrlFullPath;
                }
        
            });

        //Get the details of the submitted Form to review
        $http.get($rootScope.app.httpSource + 'api/ForeignPressCard/GetById?id=' + $state.params.id)
            .then(function (response) {
                vm.foreignPressCardModel = {
                    pressCards: []
                };
                vm.foreignPressCardModel.pressCards = {
                    foreignEntity: {
                        foreignEntitySocialMedias: [
                            {
                                isForeignMediaLicense: true,
                                mediaLicenseEconomicActivityExternalMediaAccounts: []
                            }
                        ]
                    }
                }

                vm.foreignPressCard = response.data;
                vm.foreignPressCard.pressCard[0].pressCard2.person.academicQualificationUrlFullPath
                for (var i = 0; i < vm.foreignPressCard.pressCard[0].foreignEntity.foreignEntitySocialMedias.length; i++) {
                    var foreignEntitySocialmedia = vm.foreignPressCard.pressCard[0].foreignEntity.foreignEntitySocialMedias[i];
                    vm.foreignPressCardModel.pressCards.foreignEntity.foreignEntitySocialMedias[0].mediaLicenseEconomicActivityExternalMediaAccounts.push({ externalMediaAccount: foreignEntitySocialmedia });
                }
                vm.userTypeCode = vm.foreignPressCard.applicationDetail.application.user.userProfiles[0].userType.code;
                vm.Init();
            });
    }
    ReviewSponsorshipController.$inject = ['$rootScope', '$scope', '$http', '$stateParams', '$state', '$window', '$uibModal', 'UserProfile', 'DTOptionsBuilder', 'DTColumnBuilder', '$filter', '$compile'];

})();