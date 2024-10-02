(function () {
    'use strict';

    angular
        .module('eServices')
        .directive('bookScanner', bookScanner)

    bookScanner.$inject = ['$rootScope', '$http', '$filter', 'DTOptionsBuilder', 'DTColumnBuilder', '$interval', 'SweetAlert', '$uibModal', '$compile'];

    function bookScanner($rootScope, $http, $filter, DTOptionsBuilder, DTColumnBuilder, $interval, SweetAlert, $uibModal, $compile) {
        return {
            restrict: 'E',
            scope: {
                visitBooks: '=ngModel',
                isReview: "=?"
            },
            templateUrl: '/app/views/Controls/bookScanner/bookScannertDirectiveTemplate.html',
            link: link
        };

        function link(scope, element, attrs) {
            var vm = scope;
            vm.vbook = {};
            vm.exstBook = {};
            vm.progressStatus = false;
            vm.translateFilter = $filter('translate');
            vm.isIPad = navigator.platform === "iPad" ? true : false;

            vm.serverBookData = (sSource, aoData, fnCallback, oSettings) => {
                if (scope.visitBooks) {
                    //All the parameters you need is in the aoData variable
                    let draw = aoData[0].value;
                    let order = aoData[2].value[0];
                    let start = aoData[3].value;
                    let length = aoData[4].value;
                    let search = aoData[5].value;

                    vm.params = {
                        searchtext: search.value,
                        page: (start / length) + 1,
                        pageSize: length,
                        sortBy: (order.column === 0 ? 'id' : aoData[1].value[order.column].data),
                        sortDirection: order.dir
                    };

                    var records = {
                        'draw': draw,
                        'recordsTotal': scope.visitBooks.length,
                        'recordsFiltered': scope.visitBooks.length,
                        'data': scope.visitBooks
                    };

                    fnCallback(records);
                }
            };

            vm.editBook = function (size, bookId) {
                var modalInstance = $uibModal.open({
                    templateUrl: 'app/views/Controls/bookScanner/book/book.html',
                    controller: 'BookController',
                    backdrop: 'static',
                    size: size,
                    resolve: {
                        book: function () {
                            return $filter('filter')(vm.visitBooks, { id: bookId }, true)[0];
                        }
                    }
                });
                modalInstance.result.then(function (editedBook) {
                    var book = $filter('filter')(vm.visitBooks, { id: editedBook.id }, true)[0];
                    book = editedBook;
                    vm.dtBookInstance.rerender();
                }, function () {
                    //state.text('Modal dismissed with Cancel status');
                });
            }

            vm.deleteBook = function (bookId) {
                var index;
                var tempStore;

                if (bookId == 0 || bookId == undefined) {
                    index = vm.dtBookInstance.rows({ order: 'applied' }).nodes().indexOf(event.currentTarget.parentNode.parentNode.parentNode);
                    tempStore = vm.visitBooks[index];
                    vm.visitBooks.splice(index, 1);
                }
                else {
                    index = vm.visitBooks.indexOf($filter('filter')(vm.visitBooks, { id: bookId }, true)[0]);
                    tempStore = $filter('filter')(vm.visitBooks, { id: bookId }, true)[0];
                    vm.visitBooks.splice(index, 1);
                }
                var translate = $filter('translate');
                vm.dtBookInstance.rerender();

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
                            vm.dtBookInstance.rerender();
                        } else {
                            vm.visitBooks.splice(index, 0, tempStore);
                            SweetAlert.swal(translate('general.restoreBtn'), translate('general.restoreMessage'), "success");
                            vm.dtBookInstance.rerender();
                        }
                    });
            }

            vm.dtBookInstanceCallback = (inst) => {
                vm.dtBookInstance = inst;
            }

            var createdRow = (row, data, dataIndex) => {
                $compile(angular.element(row).contents())(scope);
            };

            vm.rowCallback = () => { };

            vm.bookActionsHtml = function (data, type, full, meta) {
                var htmlSection = "";
                if (scope.isReview) {

                }
                else {
                    htmlSection = '<div class="list-icon"><div class="inline" ng-click="editBook(\'lg\',' +
                        data.id + ')"><em class="fa fa-pencil" style="cursor:pointer" uib-tooltip="' +
                        scope.translateFilter('general.edit') + '"></em></div><div class="inline" ng-click="deleteBook(' +
                        data.id + ')"><em class="fa fa-trash" style="cursor:pointer" uib-tooltip="' +
                        scope.translateFilter('general.delete') + '"></em></div></div>';
                }
                return htmlSection;
            };

            if ($rootScope.language.selected !== 'English') {
                vm.dtBookOptions = DTOptionsBuilder.newOptions()
                    .withFnServerData(scope.serverBookData)
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
                vm.dtBookOptions = DTOptionsBuilder.newOptions()
                    .withFnServerData(scope.serverBookData)
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

            vm.dtBookColumns = [
                DTColumnBuilder.newColumn("id").notVisible(),
                DTColumnBuilder.newColumn("title").withTitle(vm.translateFilter('printingPermit.bookTitle')),
                DTColumnBuilder.newColumn("authorName").withTitle(vm.translateFilter('printingPermit.authorName')),
                DTColumnBuilder.newColumn("isbn").withTitle(vm.translateFilter('printingPermit.isbn')),
                DTColumnBuilder.newColumn(null).withTitle(vm.translateFilter('bookCard.approvalStatus')).renderWith(
                    function (data, type) {
                        if (data.isApproved === true) {
                            return '<div><img src="../app/img/approved.png" width="90" height="30"></div>';
                        }
                        else {
                            return '<div><img src="../app/img/notapproved.png" width="90" height="30"></div>';
                        }
                    }).notSortable(),
                DTColumnBuilder.newColumn(null).withTitle(scope.isReview ? "" : vm.translateFilter('general.actions')).notSortable()
                    .renderWith(vm.bookActionsHtml)];

            vm.open = function (size) {
                var modalInstance = $uibModal.open({
                    templateUrl: 'app/views/Controls/bookScanner/book/book.html',
                    controller: 'BookController',
                    backdrop: 'static',
                    size: size,
                    resolve: {
                        book: function () {
                            return null;
                        }
                    }
                });

                modalInstance.result.then(function (book) {

                    if (vm.visitBooks == undefined) {
                        vm.visitBooks = [];
                    }
                    book.id = 0;
                    vm.visitBooks.push(book);
                    vm.dtBookInstance.rerender();
                }, function () {
                    //state.text('Modal dismissed with Cancel status');
                });
            };

            scope.$watch('visitBooks', function (newVal, oldVal) {
                if (newVal !== oldVal) {
                    vm.dtBookInstance.rerender();
                }
            });

            vm.onSaveBook = () => {
                let onSaveRequest = () => {
                    console.log(vm.vbook, vm.exstBook);
                    vm.progressStatus = true;
                    vm.vbook.visitId = vm.visitId;
                    $http.post($rootScope.app.httpSource + 'api/VisitBook/CreateBook', vm.vbook)
                        .then((resp) => {
                            SweetAlert.swal("Saved Successfully.", "", "success");
                            vm.vbook = {};
                            vm.exstBook = {};
                            $('#result_strip').empty();
                            vm.progressStatus = false;
                            vm.dtBookInstance.rerender();
                        }, (error) => {
                            console.log("CreateBook save error ->", error);
                            vm.progressStatus = false;
                            SweetAlert.swal("ISBN Already exist.", "", "error");
                        });
                }
                if (angular.isDefined(vm.exstBook.isbn)) {
                    if (vm.exstBook.isbn !== vm.vbook.isbn) {
                        vm.vbook.isApproved = false;
                        vm.vbook.bookId = null;
                    }
                    onSaveRequest();
                }
                else {
                    onSaveRequest();
                }

            }
        }
    }
})();
