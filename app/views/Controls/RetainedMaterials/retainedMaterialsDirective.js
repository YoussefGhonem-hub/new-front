(function () {
    'use strict';

    angular
        .module('eServices')
        .directive('retainedMaterials', retainedMaterials)

    retainedMaterials.$inject = ['$rootScope', '$http', '$filter', 'DTOptionsBuilder', 'DTColumnBuilder', '$interval', 'SweetAlert', '$uibModal','$compile'];

    function retainedMaterials($rootScope, $http, $filter, DTOptionsBuilder, DTColumnBuilder, $interval, SweetAlert, $uibModal, $compile) {
        return {
            restrict: 'E',
            scope: {
                visitRetainedMaterials: '=ngModel',
                isReview: "=?"
            },
            templateUrl: '/app/views/Controls/RetainedMaterials/retainedMaterialsDirectiveTemplate.html',
            link: link
        };

        function link(scope, element, attrs) {
            scope.translateFilter = $filter('translate');

            scope.serverMaterialData = (sSource, aoData, fnCallback, oSettings) => {
                //All the parameters you need is in the aoData variable
                if (scope.visitRetainedMaterials) {
                    let draw = aoData[0].value;
                    let order = aoData[2].value[0];
                    let start = aoData[3].value;
                    let length = aoData[4].value;
                    let search = aoData[5].value;
                    scope.params = {
                        searchtext: (search.value === '' ? null : search.value), //search.value,
                        page: (start / length) + 1,
                        pageSize: length,
                        sortBy: (order.column === 0 ? 'id' : aoData[1].value[order.column].data),
                        sortDirection: order.dir
                    };

                    var records = {
                        'draw': draw,
                        'recordsTotal': scope.visitRetainedMaterials.length,
                        'recordsFiltered': scope.visitRetainedMaterials.length,
                        'data': scope.visitRetainedMaterials
                    };

                    fnCallback(records);
                }
            };

            scope.dtMaterialInstance = (inst) => {
                scope.dtMaterialInstance = inst;
            }

            var createdRow = (row, data, dataIndex) => {
                $compile(angular.element(row).contents())(scope);
            };

            scope.rowCallback = () => { };

            scope.rmActionsHtml = function (data, type, full, meta) {
                var htmlSection = "";
                if (scope.isReview) {
                  
                }
                else {
                    htmlSection = '<div class="list-icon"><div class="inline" ng-click="edit(\'lg\',' +
                        data.id + ')"><em class="fa fa-pencil" style="cursor:pointer"></em></div>' +
                        '<div class="inline" ng-click="delete(' +
                        data.id + ')"><em class="fa fa-trash" style="cursor:pointer" ></em></div></div>';
                }
                return htmlSection;
            };


            if ($rootScope.language.selected !== 'English') {
                scope.dtMaterialOptions = DTOptionsBuilder.newOptions()
                    .withFnServerData(scope.serverMaterialData)
                    .withOption('serverSide', true)
                    .withDataProp('data')
                    .withOption('processing', true)
                    .withOption('responsive', true)
                    .withLanguageSource('app/langs/ar.json')
                    .withOption('bFilter', false)
                    .withOption('paging', false)
                    .withOption('info', false)
                    .withOption('createdRow', createdRow)
                    .withOption('rowCallback', scope.rowCallback).withBootstrap();
            }
            else {
                scope.dtMaterialOptions = DTOptionsBuilder.newOptions()
                    .withFnServerData(scope.serverMaterialData)
                    .withOption('serverSide', true)
                    .withDataProp('data')
                    .withOption('processing', true)
                    .withOption('responsive', true)
                    .withOption('bFilter', false)
                    .withOption('paging', false)
                    .withOption('info', false)
                    .withOption('createdRow', createdRow)
                    .withOption('rowCallback', scope.rowCallback).withBootstrap();
            }

           
               scope.dtMaterialColumns = [
                    DTColumnBuilder.newColumn("id").notVisible(),
                    DTColumnBuilder.newColumn("materialType").withTitle(scope.translateFilter('visit.materialType')).renderWith(
                        function (data, type) {
                            return $filter('localizeString')(data);
                        }),
                    DTColumnBuilder.newColumn("name").withTitle(scope.translateFilter('visit.materialName')),
                    DTColumnBuilder.newColumn("quantity").withTitle(scope.translateFilter('visit.materialQuantity')),
                    DTColumnBuilder.newColumn(null).withTitle(scope.isReview? "" : scope.translateFilter('general.actions')).notSortable()
                        .renderWith(scope.rmActionsHtml)];

           

           
            scope.open = function (size) {
                var modalInstance = $uibModal.open({
                    templateUrl: 'app/views/Controls/RetainedMaterials/VisitRetainedMaterial/visitRetainedMaterial.html',
                    controller: 'VisitRetainedMaterialController',
                    backdrop: 'static',
                    size: size,
                    resolve: {
                        retainedMaterial: function () {
                            return null;
                        }
                    }
                });

                modalInstance.result.then(function (retainedMaterial) {
                    if (scope.visitRetainedMaterials == undefined) {
                        scope.visitRetainedMaterials = [];
                    }
                    retainedMaterial.id = 0;
                    scope.visitRetainedMaterials.push(retainedMaterial);
                    scope.dtMaterialInstance.rerender();
                }, function () {
                    //state.text('Modal dismissed with Cancel status');
                });
            };

            scope.edit = function (size, materialId) {
                var modalInstance = $uibModal.open({
                    templateUrl: 'app/views/Controls/RetainedMaterials/VisitRetainedMaterial/visitRetainedMaterial.html',
                    controller: 'VisitRetainedMaterialController',
                    backdrop: 'static',
                    size: size,
                    resolve: {
                        retainedMaterial: function () {
                            return $filter('filter')(scope.visitRetainedMaterials, { id: materialId }, true)[0];
                        }
                    }
                });
                modalInstance.result.then(function (editedMaterial) {
                    var retmaterial = $filter('filter')(scope.visitRetainedMaterials, { id: editedMaterial.id }, true)[0];
                    scope.dtMaterialInstance.rerender();
                }, function () {
                    //state.text('Modal dismissed with Cancel status');
                });
            }

            scope.delete = function (materialId) {
                var index;
                var tempStore;

                if (materialId == 0 || materialId == undefined) {
                    index = scope.dtMaterialInstance.rows({ order: 'applied' }).nodes().indexOf(event.currentTarget.parentNode.parentNode.parentNode);
                    tempStore = scope.visitRetainedMaterials[index];
                    scope.visitRetainedMaterials.splice(index, 1);
                }
                else {
                    index = scope.visitRetainedMaterials.indexOf($filter('filter')(scope.visitRetainedMaterials, { id: materialId }, true)[0]);
                    tempStore = $filter('filter')(scope.visitRetainedMaterials, { id: materialId }, true)[0];
                    scope.visitRetainedMaterials.splice(index, 1);
                }
                var translate = $filter('translate');
                scope.dtMaterialInstance.rerender();

                SweetAlert.swal({
                    title: translate('general.confirmDelete'),
                    text: translate('general.confirmDeleteInfo'),
                    type: "warning",
                    showCancelButton: true,
                    confirmButtonColor: "#DD6B55",
                    confirmButtonText: translate('general.confirmDeleteBtn'),
                    cancelButtonText: translate('general.restoreBtn'),
                    closeOnConfirm: false,
                    closeOnCancel: false
                },
                    function (isConfirm) {
                        if (isConfirm) {
                            //delete
                            SweetAlert.swal(translate('general.confirmDeleteBtn'), translate('general.deleteMessage'), "error");
                            scope.dtMaterialInstance.rerender();
                        } else {
                            scope.visitRetainedMaterials.splice(index, 0, tempStore);
                            SweetAlert.swal(translate('general.restoreBtn'), translate('general.restoreMessage'), "success");
                            scope.dtMaterialInstance.rerender();
                        }
                    });
            }

            scope.$watch('visitRetainedMaterials', function (newVal, oldVal) {
                if (newVal !== oldVal) {
                    scope.dtMaterialInstance.rerender();
                }
            });
        }
    }
})();
