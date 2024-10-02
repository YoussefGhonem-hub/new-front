/**=========================================================
 * Module: DashboardController.js
 =========================================================*/

(function () {
    'use strict';

    angular
        .module('eServices')
        .controller('BookCardController', BookCardController);

    BookCardController.$inject = ['$rootScope', '$scope', 'UserProfile', '$filter', 'DTOptionsBuilder', 'DTColumnBuilder', '$compile', '$http', '$uibModal', '$state', '$sce'];
    function BookCardController($rootScope, $scope, UserProfile, $filter, DTOptionsBuilder, DTColumnBuilder, $compile, $http, $uibModal, $state, $sce) {
        var vm = this;
        vm.user = UserProfile.getProfile();
        vm.translateFilter = $filter('translate');

        $http.get($rootScope.app.httpSource + 'api/Book/GetById?id=' + $state.params.id)
            .then(function (resp) {
                vm.book = resp.data;
                if (vm.book.isbn != '') {
                    //var url = "https://www.goodreads.com/search.xml?key=n7Yb1AOF8uBJ9Adq3CorFw&q=" + vm.book.isbn + "&jscmd=data&format=json&callback=JSON_CALLBACK";
                    var url = "https://openlibrary.org/api/books?bibkeys=ISBN:" + vm.book.isbn + "&jscmd=data&format=json&callback=JSON_CALLBACK";
                    //var url = "http://xisbn.worldcat.org/webservices/xid/isbn/" + vm.book.isbn + "?method=getMetadata&jscmd=data&format=json&callback=JSON_CALLBACK";
                    $http.jsonp(url)
                        .then(function (reponse) {
                            vm.openBookLibraryBook = reponse.data[Object.keys(reponse.data)[0]];
                        });
                }
            });

        if ($rootScope.language.selected !== 'English') {
            vm.dtApplicationOptions = DTOptionsBuilder.newOptions()
            .withFnServerData(serverData)
            .withOption('serverSide', true)
            .withDataProp('data')
            .withOption('processing', true)
            .withOption('searchDelay', 2000)
            .withOption('aaSorting', [[1, 'desc']])
            .withOption('stateSave', true)
            .withOption('stateSaveCallback', function (settings, data) {
                localStorage.setItem('DataTables_' + settings.sInstance, JSON.stringify(data));
            })
            .withOption('stateLoadCallback', function (settings) {
                return JSON.parse(localStorage.getItem('DataTables_' + settings.sInstance))
            })
            .withOption('responsive', {
                details: {
                    renderer: renderer,
                }
            })
            .withOption('bFilter', false)
            .withOption('paging', false)
            .withOption('info', false)
            .withLanguageSource('app/langs/ar.json')
            .withOption('createdRow', createdRow)
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
            });
        }
        else {
            vm.dtApplicationOptions = DTOptionsBuilder.newOptions()
            .withFnServerData(serverData)
            .withOption('serverSide', true)
            .withDataProp('data')
            .withOption('processing', true)
            .withOption('searchDelay', 2000)
            .withOption('aaSorting', [[1, 'desc']])
            .withOption('stateSave', true)
            .withOption('stateSaveCallback', function (settings, data) {
                localStorage.setItem('DataTables_' + settings.sInstance, JSON.stringify(data));
            })
            .withOption('stateLoadCallback', function (settings) {
                return JSON.parse(localStorage.getItem('DataTables_' + settings.sInstance))
            })
            .withOption('responsive', {
                details: {
                    renderer: renderer,
                }
            })
            .withOption('bFilter', false)
            .withOption('paging', false)
            .withOption('info', false)
            .withLanguageSource('app/langs/en.json')
            .withOption('createdRow', createdRow)
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
            });
        }

        vm.dtApplicationColumns = [
            DTColumnBuilder.newColumn('applicationNumber').withTitle(vm.translateFilter('dashboard.applicationNumber')),
            DTColumnBuilder.newColumn('id').notVisible(),
            DTColumnBuilder.newColumn('service').withTitle(vm.translateFilter('dashboard.service')).renderWith(
                    function (data, type) {
                        return $filter('localizeString')(data);
                    }),
            DTColumnBuilder.newColumn(null).withOption('defaultContent', ' ').withTitle(vm.translateFilter('address.Emirate')).renderWith(
                function (data, type) {
                    if (data.user.userProfiles.length > 0) {
                        if (data.user.userProfiles[0].userTypeId != 1) {
                            var community = $filter('filter')(vm.communities, { id: data.establishment.address.communityId }, true)[0];
                            return $filter('localizeString')(community.region.emirate);
                        }
                        else {
                            var community = $filter('filter')(vm.communities, { id: data.user.userProfiles[0].address.communityId }, true)[0];
                            return $filter('localizeString')(community.region.emirate);
                        }
                    };
                }),
            DTColumnBuilder.newColumn(null).withOption('defaultContent', ' ').withTitle(vm.translateFilter('completeProfile.establishmentName')).renderWith(
                function (data, type) {
                    if (data.establishment != null) {
                        var community = $filter('filter')(vm.communities, { id: data.establishment.address.communityId }, true)[0];
                        return data.establishment.nameEn;
                    }
                    else {
                        return data.user.userProfiles[0].person.name;
                    }
                }),
            DTColumnBuilder.newColumn(null).withTitle(vm.translateFilter('dashboard.createdOn')).renderWith(
                function (data, type) {
                    if (data.applicationDetails.length == 1) {
                        return moment(data.createdOn).format('DD-MMMM-YYYY');
                    }
                    else {
                        return '';
                    };
                }),
            DTColumnBuilder.newColumn('applicationDetails').withTitle(vm.translateFilter('dashboard.applicationStatus')).renderWith(
                function (data, type) {
                    if (data.length == 1) {
                        return $filter('localizeString')(data[0].applicationStatus);
                    }
                    else {
                        return '';
                    }
                }),
            DTColumnBuilder.newColumn(null).withTitle(vm.translateFilter('dashboard.consumedTimeLabel')).renderWith(
                function (data, type) {
                    if (data.applicationDetails.length == 1) {
                        return moment.duration(data.applicationDetails[0].consumedTime, "minutes").format("d [" + vm.translateFilter('dashboard.days') + "], h [" + vm.translateFilter('dashboard.hours') +
                                "], m [" + vm.translateFilter('dashboard.minutes') + "]");
                    }
                    else {
                        return '';
                    }
                }).notSortable(),
            DTColumnBuilder.newColumn(null).withOption('defaultContent', ' ').withTitle(vm.translateFilter('dashboard.subService')).renderWith(
                function (data, type) {
                    if (data.serviceId == 2) {
                        return $filter('localizeString')(data.applicationDetails[0].printingPermits[0].publicationType);
                    }
                    else if (data.serviceId == 10) {
                        return $filter('localizeString')(data.applicationDetails[0].circulationMediaMaterials[0].artistWorkType.mediaMaterialType);
                    }
                    else {
                        return '';
                    }
                }),
            DTColumnBuilder.newColumn(null).withTitle(vm.translateFilter('general.actions')).notSortable()
                .renderWith(actionsHtml)];

        function serverData(sSource, aoData, fnCallback, oSettings) {
            var draw = aoData[0].value;
            var order = aoData[2].value[0];
            var start = aoData[3].value;
            var length = aoData[4].value;
            var search = aoData[5].value;

            vm.params = {
                searchtext: (search.value === '' ? null : search.value),
                page: (start / length) + 1,
                pageSize: length,
                sortBy: (order.column === 0 ? 'Id' : aoData[1].value[order.column].data),
                sortDirection: order.dir
            };

            $http.post($rootScope.app.httpSource + 'api/Application/GetBookApplications?bookId=' + $state.params.id)
                .then(function (resp) {
                    vm.numberOfApplications = resp.data.length;
                    $http.get($rootScope.app.httpSource + 'api/Community/GetCommunities')
                        .then(function (response) {
                            vm.communities = response.data;
                            var records = {
                                'draw': draw,
                                'recordsTotal': resp.data.length,
                                'recordsFiltered': resp.data.length,
                                'data': resp.data
                            };
                            fnCallback(records);
                        });
                },
                function (response) {
                    var records = {
                        'draw': draw,
                        'recordsTotal': 0,
                        'recordsFiltered': 0,
                        'data': []
                    };
                    fnCallback(records);
                });
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

        function createdRow(row, data, dataIndex) {
            $compile(angular.element(row).contents())($scope);
        };

        function rowCallback(tabRow, data, dataIndex) {
        };

        function actionsHtml(data, type, full, meta) {
            var htmlSection = '';
            if (data.applicationDetails.length == 1) {
                htmlSection = vm.bindButtons(data.applicationDetails[0], data.service);
            }
            return htmlSection;
        };

        vm.bindButtons = function (data, service) {
            var htmlSection = '';
            htmlSection = '<div style="display:inline-block" class="list-icon"><div class="inline" ng-click="bookCard.review(' +
                data.id + ',\'' + service.code + '\',\'' + service.serviceCategory.code + '\')"><em class="fa fa-search" style="cursor:pointer" uib-tooltip="' +
                vm.translateFilter('general.review') + '"></em></div></div>';

            return htmlSection;
        };

        vm.review = function (Id, serviceCode, serviceCategoryCode) {
            switch (serviceCode) {
                case "01":
                    $state.go('app.MediaContentServices.ReviewPublicationsPrintingPermit', { id: Id });
                    break;

                case "02":
                    $state.go('app.MediaContentServices.ReviewRegulateEntryMediaMaterial', { id: Id });
                    break;
            }
        };
    }
})();