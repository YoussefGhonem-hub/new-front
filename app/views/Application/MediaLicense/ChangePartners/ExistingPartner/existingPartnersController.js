(function () {
    'use strict';

    angular
        .module('eServices')
        .controller('ExistingPartnersController', ExistingPartnersController);
    /* @ngInject */
    function ExistingPartnersController($rootScope, $scope, $uibModalInstance, $filter, $http, partners, exceptPartners, DTOptionsBuilder, DTColumnBuilder, $compile) {

        $scope.partners = partners;
        $scope.exceptPartners = exceptPartners;

        $scope.ok = function () {
            $uibModalInstance.close($scope.myResult);
        };

        $scope.closeModal = function () {
            $uibModalInstance.dismiss('cancel');
        };

        $scope.selected = {};
        $scope.selectAll = false;
        $scope.toggleAll = toggleAll;
        $scope.toggleOne = toggleOne;

        $scope.teamMemberDt = {};
        $scope.teamMemberDt.dtInstance = {};
        $scope.translateFilter = $filter('translate');

        if ($rootScope.language.selected !== 'English') {
            $scope.teamMemberDt.dtOptions = DTOptionsBuilder.newOptions()
                .withFnServerData(serverData)
                .withOption('serverSide', true)
                .withDataProp('data')
                .withOption('processing', true)
                .withOption('searchDelay', 2000)
                .withOption('aaSorting', [[1, 'desc']])
                .withOption('responsive', true)
                .withLanguageSource('app/langs/ar.json')
                .withOption('bFilter', false)
                .withOption('info', false)
                .withOption('responsive', {
                    details: {
                        renderer: renderer,
                    }
                })
                .withPaginationType('full_numbers')
                .withDisplayLength(10)
                .withOption('rowCallback', rowCallback).withBootstrap().withBootstrapOptions({
                    TableTools: {
                        classes: {
                            container: 'btn-group',
                            buttons: {
                                normal: 'btn btn-danger'
                            }
                        }
                    },
                    pagination: {
                        classes: {
                            ul: 'pagination pagination-sm'
                        }
                    }
                })
                .withOption('createdRow', createdRow)
                .withOption('rowCallback', rowCallback).withBootstrap();
        }
        else {
            $scope.teamMemberDt.dtOptions = DTOptionsBuilder.newOptions()
                .withFnServerData(serverData)
                .withOption('serverSide', true)
                .withDataProp('data')
                .withOption('processing', true)
                .withOption('searchDelay', 2000)
                .withOption('aaSorting', [[1, 'desc']])
                .withOption('responsive', true)
                .withOption('bFilter', false)
                .withOption('info', false)
                .withOption('responsive', {
                    details: {
                        renderer: renderer,
                    }
                })
                .withPaginationType('full_numbers')
                .withDisplayLength(10)
                .withOption('rowCallback', rowCallback).withBootstrap().withBootstrapOptions({
                    TableTools: {
                        classes: {
                            container: 'btn-group',
                            buttons: {
                                normal: 'btn btn-danger'
                            }
                        }
                    },
                    pagination: {
                        classes: {
                            ul: 'pagination pagination-sm'
                        }
                    }
                })
                .withOption('createdRow', createdRow)
                .withOption('rowCallback', rowCallback).withBootstrap();
        }

        $scope.teamMemberDt.dtColumns = [
            DTColumnBuilder.newColumn(null).notSortable()
                .renderWith(function (data, type, full, meta) {
                    return '<input type="checkbox" ng-model="selected[' + data.id + ']" ng-click="toggleOne(selected)">';
                }),
            DTColumnBuilder.newColumn(null).withTitle($scope.translateFilter(' ')).notSortable()
                .renderWith(function (data, type) {
                    var ownericon = data.isOwner ? '<i class="fa fa-circle-thin fa-stack-2x" aria-hidden="true" style="color:#3f51b5;" ></i> ' : '';
                    var ownertooltip = data.isOwner ? '    ' + $scope.translateFilter('general.licenseOwners') + '   ' : '';

                    if (data.person != null) {
                        return '<em class="fa-stack fa-2x"><em class="fa fa-user-o  fa-stack-1x" uib-tooltip="' +
                            $scope.translateFilter('completeProfile.IndividualPartner') + ownertooltip + '">' + ownericon + '</em></em> ';
                    }
                    else if (data.partnerEstablishment != null) {
                        return '<em class="fa-stack fa-2x"><em class="fa fa-building-o fa-stack-1x" uib-tooltip="' + $scope.translateFilter('completeProfile.CompnayPartner') + ownertooltip + '">' + ownericon + '</em></em>';
                    }
                }),
            DTColumnBuilder.newColumn(null).withTitle($scope.translateFilter('completeProfile.name')).notSortable()
                .renderWith(function (data, type) {
                    if (data.person != null) {
                        return data.person.name;

                    }
                    else if (data.partnerEstablishment != null) {
                        return data.partnerEstablishment.nameEn;
                    } else {
                        return '';
                    }
                }),
            DTColumnBuilder.newColumn('id').notVisible(),
            DTColumnBuilder.newColumn(null).withTitle($scope.translateFilter('profileNationalityDirective.Nationality')).notSortable().renderWith(partnerCountryHtml),
            DTColumnBuilder.newColumn(null).withTitle(' ').renderWith(partnerCountryFlagHtml).notSortable(),
            DTColumnBuilder.newColumn('person').withTitle($scope.translateFilter('profileNationalityDirective.EmiratesId')).notSortable()
                .renderWith(function (data, type) {
                    if (data == null) {
                        return '';
                    }
                    if (data.emiratesId != null) {
                        return data.emiratesId;
                    } else if (data.passportNumber != null) {
                        return data.passportNumber
                    } else {
                        return '';
                    }
                })
        ];

        function serverData(sSource, aoData, fnCallback, oSettings) {
            var draw = aoData[0].value;
            var order = aoData[2].value[0];
            var start = aoData[3].value;
            var length = aoData[4].value;
            var search = aoData[5].value;

            var differObjects = areDifferentByProperty($scope.partners, $scope.exceptPartners);

            var records = {
                'draw': draw,
                'recordsTotal': differObjects.length,
                'recordsFiltered': differObjects.length,
                'data': differObjects
            };
            fnCallback(records);
        };

        function createdRow(row, data, dataIndex) {
            $compile(angular.element(row).contents())($scope);
        };

        function rowCallback(tabRow, data, dataIndex) {

        };

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

        function toggleAll(selectAll, selectedItems) {
            for (var id in selectedItems) {
                if (selectedItems.hasOwnProperty(id)) {
                    selectedItems[id] = selectAll;
                }
            }
        }

        function toggleOne(selectedItems) {
            $scope.myResult = [];
            for (var id in selectedItems) {
                $scope.selectAll = false;
                var item = $scope.partners.filter(person => (person.id == id));
                for (var i = 0; i < item.length; i++) {
                    $scope.myResult.push(item[i]);
                }
            }
            $scope.selectAll = true;
        }

        function partnerCountryHtml(data, type, full, meta) {
            var __cou = (data.partnerEstablishment == null ? $filter('localizeString')(data.person.country) : $filter('localizeString')(data.partnerEstablishment.country));
            var htmlSection = '<div><span>' + __cou + '</span></div>';
            return htmlSection;
        };

        function partnerCountryFlagHtml(data, type, full, meta) {
            var __isoCode2 = (data.partnerEstablishment == null ? data.person.country.isoCode2 : data.partnerEstablishment.country.isoCode2);
            var htmlSection = '<div><span><img class="img-responsive" style="display:inline-block; ' +
                'padding-left:10px; padding-right: 10px; max-width:60px" src="../src/imgs/Countries/' + __isoCode2 + '.png" /></span></div>';

            return htmlSection;
        };

        function areDifferentByProperty(a, b) {
            var combined = [];
            for (var i = 0; i < a.length; i++) {
                var isFound = false;
                for (var j = 0; j < b.length; j++) {
                    if ((a[i].personId != null && a[i].personId == b[j].personId) || (a[i].partnerEstablishmentId != null && a[i].partnerEstablishmentId == b[j].partnerEstablishmentId)) {
                        isFound = true;
                        break;
                    }
                }

                if (!isFound) {
                    combined.push(a[i]);
                }
            }

            return combined;
        }
    }

    ExistingPartnersController.$inject = ['$rootScope', '$scope', '$uibModalInstance', '$filter', '$http', 'partners', 'exceptPartners', 'DTOptionsBuilder', 'DTColumnBuilder', '$compile'];
})();