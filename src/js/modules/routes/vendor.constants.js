/// <reference path="C:\Code\VisualStudioOnline\eServices\eServices\eServices.Web\vendor/angular-datetime-inputs/dist/datetime-inputs.min.js" />
/// <reference path="C:\Code\VisualStudioOnline\eServices\eServices\eServices.Web\vendor/js-xlsx-master/dist/xlsx.full.min.js" />
/// <reference path="C:\Code\VisualStudioOnline\eServices\eServices\eServices.Web\vendor/angular-ui-router/release/angular-ui-router.js" />
/// <reference path="C:\Code\VisualStudioOnline\eServices\eServices\eServices.Web\vendor/angular-ui-router/release/angular-ui-router.js" />
/// <reference path="C:\Code\VisualStudioOnline\eServices\eServices\eServices.Web\vendor/moment/angular-moment.js" />
/// <reference path="C:\Code\VisualStudioOnline\eServices\eServices\eServices.Web\vendor/bootstrap-toggle-master/js/bootstrap-toggle.min.js" />
/// <reference path="C:\Code\VisualStudioOnline\eServices\eServices\eServices.Web\vendor/bootstrap-toggle-master/js/bootstrap-toggle.min.js" />
/// <reference path="C:\Code\VisualStudioOnline\eServices\eServices\eServices.Web\vendor/angular-datatables/dist/plugins/colvis/angular-datatables.colvis.min.js" />
/// <reference path="C:\Code\VisualStudioOnline\eServices\eServices\eServices.Web\vendor/angular-datatables/dist/plugins/colvis/angular-datatables.colvis.min.js" />
/// <reference path="C:\Code\VisualStudioOnline\eServices\eServices\eServices.Web\vendor/angular-drag-and-drop-lists-master/angular-drag-and-drop-lists.js" />
/// <reference path="C:\Code\VisualStudioOnline\eServices\eServices\eServices.Web\vendor/angular-wizard-master/dist/angular-wizard.js" />
/**=========================================================
 * Module: VendorAssetsConstant.js
 =========================================================*/

(function () {
    'use strict';

    angular
        .module('eServices')
        .constant('VENDOR_ASSETS', {
            // jQuery based and standalone scripts
            scripts: {
                'animate': ['vendor/animate.css/animate.min.css'],
                'icons': ['vendor/font-awesome/css/font-awesome.min.css',
                    'vendor/weather-icons/css/weather-icons.min.css',
                    'vendor/feather/webfont/feather-webfont/feather.css'],
                'sparklines': ['app/plugins/sparklines/jquery.sparkline.min.js'],
                'slimscroll': ['vendor/slimscroll/jquery.slimscroll.min.js'],
                'screenfull': ['vendor/screenfull/dist/screenfull.js'],
                'flot-chart': ['vendor/flot/jquery.flot.js'],
                'flot-chart-plugins': ['vendor/flot.tooltip/js/jquery.flot.tooltip.min.js',
                    'vendor/flot/jquery.flot.resize.js',
                    'vendor/flot/jquery.flot.pie.js',
                    'vendor/flot/jquery.flot.time.js',
                    'vendor/flot/jquery.flot.categories.js',
                    'vendor/flot-spline/js/jquery.flot.spline.min.js'],
                'jquery-ui': ['vendor/jquery-ui/jquery-ui.min.js',
                    'vendor/jqueryui-touch-punch/jquery.ui.touch-punch.min.js'],

                'gcal': ['vendor/fullcalendar/dist/gcal.js'],
                'blueimp-gallery': ['vendor/blueimp-gallery/js/jquery.blueimp-gallery.min.js',
                    'vendor/blueimp-gallery/css/blueimp-gallery.min.css'],
                'filestyle': ['vendor/bootstrap-filestyle/src/bootstrap-filestyle.js'],
                'nestable': ['vendor/nestable/jquery.nestable.js'],
                'layerMorph': ['src/js/modules/layermorph/layer-morph.directive.js',
                    'src/js/modules/layermorph/layer-morph.service.js']
            },
            // Angular modules scripts (name is module name to be injected)
            modules: [
                {
                    name: 'toaster', files: ['vendor/angularjs-toaster/toaster.js',
                        'vendor/angularjs-toaster/toaster.css']
                },
                {
                    name: 'bootstrapToggle', files: ['vendor/angular-bootstrap-toggle-master/dist/angular-bootstrap-toggle.css',
                        'vendor/angular-bootstrap-toggle-master/dist/angular-bootstrap-toggle.js']
                },
                {
                    name: 'moment', files: ['vendor/moment/min/moment-with-locales.min.js', 'vendor/moment/src/moment-duration-format.js', 'vendor/moment/angular-moment.js'], serie: true
                },
                {
                    name: 'ui.knob', files: ['vendor/angular-knob/src/angular-knob.js',
                        'vendor/jquery-knob/dist/jquery.knob.min.js']
                },
                { name: 'easypiechart', files: ['vendor/jquery.easy-pie-chart/dist/angular.easypiechart.min.js'] },
                { name: 'angularFileUpload', files: ['vendor/angular-file-upload/dist/angular-file-upload.js'] },
                {
                    name: 'ngTable', files: ['vendor/ng-table/dist/ng-table.min.js',
                        'vendor/ng-table/dist/ng-table.min.css']
                },
                { name: 'ngTableExport', files: ['vendor/ng-table-export/ng-table-export.js'] },
                { name: 'zxcvbn', files: ['vendor/passwordstrengthmeter/bower_components/zxcvbn/dist/zxcvbn.js'] },
                { name: 'ui.map', files: ['vendor/angular-ui-map/ui-map.min.js'] },
                {
                    name: 'ui.calendar', files: ['vendor/fullcalendar/dist/fullcalendar.min.js',
                        'vendor/fullcalendar/dist/fullcalendar.css',
                        'vendor/angular-ui-calendar/src/calendar.js']
                },
                {
                    name: 'angularBootstrapNavTree', files: ['vendor/angular-bootstrap-nav-tree/dist/abn_tree_directive.js',
                        'vendor/angular-bootstrap-nav-tree/dist/abn_tree.css']
                },
                {
                    name: 'htmlSortable', files: ['vendor/html.sortable/dist/html.sortable.js',
                        'vendor/html.sortable/dist/html.sortable.angular.js']
                },
                {
                    name: 'xeditable', files: ['vendor/angular-xeditable/dist/js/xeditable.js',
                        'vendor/angular-xeditable/dist/css/xeditable.css']
                },
                //{name: 'angularFileUpload',         files: ['vendor/angular-file-upload/angular-file-upload.js']},
                {
                    name: 'ngImgCrop', files: ['vendor/ng-img-crop/compile/unminified/ng-img-crop.js',
                        'vendor/ng-img-crop/compile/unminified/ng-img-crop.css']
                },
                {
                    name: 'ui.select', files: ['vendor/angular-ui-select/dist/select.js',
                        'vendor/angular-ui-select/dist/select.css']
                },
                {
                    name: 'summernote', files: ['vendor/bootstrap/js/tooltip.js',
                        'vendor/summernote/dist/summernote.css',
                        'vendor/summernote/dist/summernote.js',
                        'vendor/angular-summernote/dist/angular-summernote.js'
                    ], serie: true, insertBefore: '#mainstyles'
                },
                { name: 'vr.directives.slider', files: ['vendor/venturocket-angular-slider/build/angular-slider.min.js'] },
                { name: 'rzModule', files: ['vendor/angularjs-slider-master/dist/rzslider.min.css', 'vendor/angularjs-slider-master/dist/rzslider.min.js'] },
                {
                    name: 'angularWizard', files: ['vendor/angular-wizard-master/dist/angular-wizard.js',
                        'vendor/angular-wizard-master/dist/angular-wizard.css']
                },
                {
                    name: 'datatables', files: ['vendor/datatables/media/css/jquery.dataTables.min.css',
                        'vendor/datatables/media/js/jquery.dataTables.min.js',
                        'vendor/angular-datatables/dist/angular-datatables.min.js',
                        'vendor/angular-datatables/responsive.js', 'vendor/angular-datatables/responsive.css',
                        'vendor/angular-datatables/dist/plugins/bootstrap/angular-datatables.bootstrap.min.js',
                        'vendor/angular-datatables/dist/plugins/bootstrap/datatables.bootstrap.min.css'], serie: true
                },
                {
                    name: 'oitozero.ngSweetAlert', files: ['vendor/sweetalert/dist/sweetalert.css',
                        'vendor/sweetalert/dist/sweetalert.min.js',
                        'vendor/angular-sweetalert/SweetAlert.js']
                },
                { name: 'recaptcha', files: ['vendor/angular-recaptcha/release/angular-recaptcha.js'] },
                { name: 'ngMask', files: ['vendor/ngMask-master/dist/ngMask.min.js'] },
                { name: 'draganddrop', files: ['vendor/angular-drag-and-drop-lists-master/angular-drag-and-drop-lists.js'] },
                {
                    name: 'angular-tour', files: ['vendor/angular-tour-master/dist/angular-tour.css', 'vendor/angular-tour-master/dist/angular-tour-tpls.js']
                },
                {
                    name: 'datetime-inputs', files: ['vendor/angular-datetime-inputs/dist/datetime-inputs.min.css', 'vendor/angular-datetime-inputs/dist/datetime-inputs.min.js']
                },
                {
                    name: 'Circlebar', files: ['vendor/circlebars-master/dist/circle.css', 'vendor/circlebars-master/dist/circle.js',
                        'vendor/circlebars-master/dist/skins/whitecircle.css', 'vendor/circlebars-master/dist/skins/yellowcircle.css']
                },
                {
                    name: 'countdown', files: ['vendor/jquery.countdown360-master/dist/jquery.countdown360.min.js']
                }
            ],
            modulesAr: [
                {
                    name: 'toaster', files: ['vendor/angularjs-toaster/toaster.js',
                        'vendor/angularjs-toaster/toaster.css']
                },
                {
                    name: 'bootstrapToggle', files: ['vendor/angular-bootstrap-toggle-master/dist/angular-bootstrap-toggle.min.css',
                        'vendor/angular-bootstrap-toggle-master/dist/angular-bootstrap-toggle.min.js']
                },
                {
                    name: 'moment', files: ['vendor/moment/min/moment-with-locales.min.js', 'vendor/moment/src/moment-duration-format.js', 'vendor/moment/locale/ar-ae.js',
                        'vendor/moment/angular-moment.js'], serie: true
                },
                {
                    name: 'ui.knob', files: ['vendor/angular-knob/src/angular-knob.js',
                        'vendor/jquery-knob/dist/jquery.knob.min.js']
                },
                { name: 'easypiechart', files: ['vendor/jquery.easy-pie-chart/dist/angular.easypiechart.min.js'] },
                { name: 'angularFileUpload', files: ['vendor/angular-file-upload/dist/angular-file-upload.js'] },
                {
                    name: 'ngTable', files: ['vendor/ng-table/dist/ng-table.min.js',
                        'vendor/ng-table/dist/ng-table.min.css']
                },
                { name: 'ngTableExport', files: ['vendor/ng-table-export/ng-table-export.js'] },
                {
                    name: 'ui.calendar', files: ['vendor/fullcalendar/dist/fullcalendar.min.js',
                        'vendor/fullcalendar/dist/fullcalendar.css',
                        'vendor/angular-ui-calendar/src/calendar.js']
                },
                {
                    name: 'angularBootstrapNavTree', files: ['vendor/angular-bootstrap-nav-tree/dist/abn_tree_directive.js',
                        'vendor/angular-bootstrap-nav-tree/dist/abn_tree.css']
                },
                {
                    name: 'htmlSortable', files: ['vendor/html.sortable/dist/html.sortable.js',
                        'vendor/html.sortable/dist/html.sortable.angular.js']
                },
                {
                    name: 'xeditable', files: ['vendor/angular-xeditable/dist/js/xeditable.js',
                        'vendor/angular-xeditable/dist/css/xeditable.css']
                },
                {
                    name: 'ngImgCrop', files: ['vendor/ng-img-crop/compile/unminified/ng-img-crop.js',
                        'vendor/ng-img-crop/compile/unminified/ng-img-crop.css']
                },
                {
                    name: 'ui.select', files: ['vendor/angular-ui-select/dist/select.js',
                        'vendor/angular-ui-select/dist/select-ar.css']
                },
                {
                    name: 'summernote', files: ['vendor/bootstrap/js/tooltip.js',
                        'vendor/summernote/dist/summernote.css',
                        'vendor/summernote/dist/summernote.js',
                        'vendor/angular-summernote/dist/angular-summernote.js'
                    ], serie: true, insertBefore: '#mainstyles'
                },
                { name: 'vr.directives.slider', files: ['vendor/venturocket-angular-slider/build/angular-slider.min.js'] },
                { name: 'rzModule', files: ['vendor/angularjs-slider-master/dist/rzslider.min.css', 'vendor/angularjs-slider-master/dist/rzslider.min.js'] },
                {
                    name: 'angularWizard', files: ['vendor/angular-wizard-master/dist/angular-wizard.js',
                        'vendor/angular-wizard-master/dist/angular-wizard-ar.css']
                },
                {
                    name: 'datatables', files: ['vendor/datatables/media/css/jquery.dataTables-ar.css',
                        'vendor/datatables/media/js/jquery.dataTables.min.js',
                        'vendor/angular-datatables/dist/angular-datatables.min.js',
                        'vendor/angular-datatables/responsive.js', 'vendor/angular-datatables/responsive.css',
                        'vendor/angular-datatables/dist/plugins/bootstrap/angular-datatables.bootstrap.min.js',
                        'vendor/angular-datatables/dist/plugins/bootstrap/datatables.bootstrap.min.css'], serie: true
                },
                {
                    name: 'oitozero.ngSweetAlert', files: ['vendor/sweetalert/dist/sweetalert.css',
                        'vendor/sweetalert/dist/sweetalert.min.js',
                        'vendor/angular-sweetalert/SweetAlert.js']
                },
                { name: 'ngMask', files: ['vendor/ngMask-master/dist/ngMask.min.js'] },
                { name: 'draganddrop', files: ['vendor/angular-drag-and-drop-lists-master/angular-drag-and-drop-lists.js'] },
                {
                    name: 'angular-tour', files: ['vendor/angular-tour-master/dist/angular-tour.css', 'vendor/angular-tour-master/dist/angular-tour-tpls.js']
                },
                {
                    name: 'datetime-inputs', files: ['vendor/angular-datetime-inputs/dist/datetime-inputs.min.css', 'vendor/angular-datetime-inputs/dist/datetime-inputs.min.js']
                },
                {
                    name: 'Circlebar', files: ['vendor/circlebars-master/dist/circle.css', 'vendor/circlebars-master/dist/circle.js',
                        'vendor/circlebars-master/dist/skins/whitecircle.css', 'vendor/circlebars-master/dist/skins/yellowcircle.css']
                },
                {
                    name: 'countdown', files: ['vendor/jquery.countdown360-master/dist/jquery.countdown360.min.js']
                }
            ]

        });

})();

