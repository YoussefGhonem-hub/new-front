/**=========================================================
 * Module: LoginController.js
 * Controller for the Chat APP 
 =========================================================*/

(function () {
    'use strict';

    angular
        .module('eServices')
        .controller('ReviewNewspaperNameBookingController', ReviewNewspaperNameBookingController);

    function ReviewNewspaperNameBookingController($rootScope, $scope, $http, $stateParams, $state, $window, $uibModal, UserProfile, DTOptionsBuilder, DTColumnBuilder, $filter, $compile) {
        var vm = this;
        vm.translateFilter = $filter('translate');
        vm.dtPartnerInstance = {};
        vm.applicationOpen = true;
        vm.serviceFeesObj = { serviceId: 5, serviceFee: [] };

        vm.Init = function () {
            vm.user = UserProfile.getProfile();

            vm.createdRow = function (row, data, dataIndex) {
                // Recompiling so we can bind Angular directive to the DT
                $compile(angular.element(row).contents())($scope);
            }

            function renderer(api, rowIdx, columns) {
                var data = $.map(columns, function (col, i) {
                    return col.hidden ?
                        '<li data-dtr-index="' + col.columnIndex + '" data-dt-row="' + col.rowIndex + '" data-dt-column="' + col.columnIndex + '">' +
                             '<span class="dtr-title">' +
                                 col.title +
                           '</span> ' +
                           '<span class="dtr-data">' +
                               col.data +
                          '</span>' +
                      '</li>' :
                      '';
                }).join('');
                return data ?
                    $compile(angular.element($('<ul data-dtr-index="' + rowIdx + '"/>').append(data)))($scope) :
                 false;
            }

            vm.userCountryHtml = function (data, type, full, meta) {
                var htmlSection = '<div><span><img class="img-responsive" style="display:inline-block; ' +
                    'padding-left:10px; padding-right: 10px; max-width:60px" src="../src/imgs/Countries/' + data.person.country.isoCode2 + '.png" /></span></div>';

                return htmlSection;
            };

            vm.partnerActionsHtml = function (data, type, full, meta) {
                var htmlSection = '';

                htmlSection = '<div class="list-icon"><div class="inline" ng-click="vm.reviewPartner(\'lg\',' +
                    data.id + ', $event)"><em class="fa fa-search" style="cursor:pointer" uib-tooltip="' +
                    vm.translateFilter('general.review') + '"></em></div></div>';
                return htmlSection;
            };

            vm.serverPartnerData = function (sSource, aoData, fnCallback, oSettings) {
                //All the parameters you need is in the aoData variable
                var draw = aoData[0].value;
                var order = aoData[2].value[0];
                var start = aoData[3].value;
                var length = aoData[4].value;
                var search = aoData[5].value;
                var records;

                var params = {
                    searchtext: search.value,
                    page: (start / length) + 1,
                    pageSize: length,
                    sortBy: (order.column === 0 ? 'ID' : aoData[1].value[order.column].data),
                    sortDirection: order.dir
                };

                //Then just call your service to get the records from server side
                $http.get($rootScope.app.httpSource + 'api/Establishment/GetPartners?estId=' + vm.bookingNewspaperName.applicationDetail.application.establishment.id)
                    .then(function (response) {
                        vm.establishmentPartners = response.data;
                        records = {
                            'draw': draw,
                            'recordsTotal': vm.establishmentPartners.length,
                            'recordsFiltered': vm.establishmentPartners.length,
                            'data': vm.establishmentPartners
                        };

                        fnCallback(records);
                    }, function (response) { });
            };

            vm.dtPartnerOptions = DTOptionsBuilder.newOptions()
                                .withFnServerData(vm.serverPartnerData)
                                .withOption('serverSide', true)
                                .withDataProp('data')
                                .withOption('processing', true)
                                .withOption('responsive', {
                                    details: {
                                        renderer: renderer
                                    }
                                })
                                .withLanguageSource('app/langs/en.json')
                                .withOption('createdRow', vm.createdRow)
                                .withOption('bFilter', false)
                                .withOption('paging', false)
                                .withOption('info', false).withBootstrap();

            vm.dtPartnerColumns = [
                DTColumnBuilder.newColumn('person.name').withTitle(vm.translateFilter('completeProfile.name')),
                DTColumnBuilder.newColumn('id').notVisible(),
                DTColumnBuilder.newColumn('person.country').withTitle(vm.translateFilter('profileNationalityDirective.Nationality')).renderWith(
                function (data, type) {
                    return $filter('localizeString')(data);
                }),
                DTColumnBuilder.newColumn(null).withTitle(' ').renderWith(vm.userCountryHtml).notSortable(),
                DTColumnBuilder.newColumn('person.emiratesId').withTitle(vm.translateFilter('profileNationalityDirective.EmiratesId')),
                DTColumnBuilder.newColumn('person.dateOfBirth').withTitle(vm.translateFilter('profileNationalityDirective.DateOfBirth')).renderWith(function (data, type) {
                    return $filter('date')(data, 'dd-MMMM-yyyy');
                }),
                DTColumnBuilder.newColumn(null).withTitle(vm.translateFilter('general.actions')).notSortable()
                    .renderWith(vm.partnerActionsHtml).withOption('width', '15%')];
        }

        //Get the details of the submitted Form to edit
        $http.get($rootScope.app.httpSource + 'api/BookingNewspaperName/GetById?id=' + $state.params.id)
          .then(function (response) {
              vm.bookingNewspaperName = response.data;
              vm.userTypeCode = vm.bookingNewspaperName.applicationDetail.application.user.userProfiles[0].userType.code;
              vm.Init();
          });
    }

    ReviewNewspaperNameBookingController.$inject = ['$rootScope', '$scope', '$http', '$stateParams', '$state', '$window', '$uibModal', 'UserProfile', 'DTOptionsBuilder',
        'DTColumnBuilder', '$filter', '$compile'];

})();