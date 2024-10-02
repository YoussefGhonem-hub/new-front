/**=========================================================
 * Module: reviewMediaLicenseController.js
 * Controller for the Review Review FM IssuePressCardController
 =========================================================*/
(function () {
    'use strict';
    angular
        .module('eServices')
        .controller('ReviewFMIssuePressCardController', ReviewFMIssuePressCardController);
    function ReviewFMIssuePressCardController($rootScope, $scope, $http, $stateParams, $state, $window, $uibModal, UserProfile, DTOptionsBuilder, DTColumnBuilder, $filter, $compile) {
        var vm = this;
        vm.translateFilter = $filter('translate');
        vm.applicationOpen = true;

        vm.Init = function () {
            vm.serviceFees = { serviceId: 18, serviceFee: [] };
            vm.user = UserProfile.getProfile();
        };

        function gridTable() {
            //Press Card Datatable

            vm.teamMemberDt = {};
            vm.teamMemberDt.dtInstance = {};
            vm.teamMemberDt.serverData = function (sSource, aoData, fnCallback, oSettings) {
                var aoDataLength = aoData.length;
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
                    sortBy: (order.column === 0 ? 'id' : aoData[1].value[order.column].data),
                    sortDirection: order.dir
                };

                //Then just call your service to get the records from server side           

                var records = {
                    'draw': draw,
                    'recordsTotal': vm.foreignPressCard.applicationDetail.certificates[0].certificateDetails.length,
                    'recordsFiltered': vm.foreignPressCard.applicationDetail.certificates[0].certificateDetails.length,
                    'data': vm.foreignPressCard.applicationDetail.certificates[0].certificateDetails
                };

                fnCallback(records);
            };

            vm.teamMemberDt.createdRow = function (row, data, dataIndex) {
                // Recompiling so we can bind Angular directive to the DT
                $compile(angular.element(row).contents())($scope);
            };

            if ($rootScope.language.selected !== 'English') {
                vm.teamMemberDt.dtOptions = DTOptionsBuilder.newOptions()
                    .withFnServerData(vm.teamMemberDt.serverData)
                    .withOption('serverSide', true)
                    .withDataProp('data')
                    .withOption('processing', true)
                    .withOption('responsive', true)
                    .withLanguageSource('app/langs/ar.json')
                    .withOption('bFilter', false)
                    .withOption('paging', false)
                    .withOption('info', false)
                    .withOption('createdRow', vm.teamMemberDt.createdRow).withBootstrap();
            }
            else {
                vm.teamMemberDt.dtOptions = DTOptionsBuilder.newOptions()
                    .withFnServerData(vm.teamMemberDt.serverData)
                    .withOption('serverSide', true)
                    .withDataProp('data')
                    .withOption('processing', true)
                    .withOption('responsive', true)
                    .withOption('bFilter', false)
                    .withOption('paging', false)
                    .withOption('info', false)
                    .withOption('createdRow', vm.teamMemberDt.createdRow).withBootstrap();
            };

            vm.teamMemberDt.dtColumns = [
                DTColumnBuilder.newColumn('mediaLicenseEconomicActivity.economicActivity').withTitle(vm.translateFilter('mediaLicense.economicActivity')).renderWith(
                    function (data, type) {
                        return $filter('localizeString')(data);
                    }),
                DTColumnBuilder.newColumn('issueDate').withTitle(vm.translateFilter('mediaLicense.issueDate')).renderWith(
                    function (data, type) {
                        return moment(data).format('DD-MMMM-YYYY');
                    }),
                DTColumnBuilder.newColumn('expiryDate').withTitle(vm.translateFilter('mediaLicense.expiryDate')).renderWith(
                    function (data, type) {
                        return moment(data).format('DD-MMMM-YYYY');
                    })];
        }

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
                //vm.foreignPressCard.pressCard[0].assignmentLetterUrlFullPath = 'http://localhost:1113/UserUploads/AssignmentLetter/' + vm.foreignPressCard.pressCard[0].assignmentLetterUrl;
                for (var i = 0; i < vm.foreignPressCard.pressCard[0].foreignEntity.foreignEntitySocialMedias.length; i++) {
                    var foreignEntitySocialmedia = vm.foreignPressCard.pressCard[0].foreignEntity.foreignEntitySocialMedias[i];
                    vm.foreignPressCardModel.pressCards.foreignEntity.foreignEntitySocialMedias[0].mediaLicenseEconomicActivityExternalMediaAccounts.push({ externalMediaAccount: foreignEntitySocialmedia });
                }
                vm.userTypeCode = vm.foreignPressCard.applicationDetail.application.user.userProfiles[0].userType.code;
                vm.Init();
                gridTable();
            });
    }
    ReviewFMIssuePressCardController.$inject = ['$rootScope', '$scope', '$http', '$stateParams', '$state', '$window', '$uibModal', 'UserProfile', 'DTOptionsBuilder', 'DTColumnBuilder', '$filter', '$compile'];

})();