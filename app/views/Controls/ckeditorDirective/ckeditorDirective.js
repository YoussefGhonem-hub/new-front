(function () {
    'use strict';

    angular
        .module('eServices')
        .directive('ckeditor', Directive);

    function Directive($rootScope) {
        return {
            require: 'ngModel',
            link: function (scope, element, attr, ngModel) {
                var editorOptions;
                if (attr.ckeditor === 'minimum') {
                    // minimum editor
                    editorOptions = {
                        height: 100,
                        toolbar: [
                            { name: 'basic', items: ['Bold', 'Italic', 'Underline'] },
                            { name: 'links', items: ['Link', 'Unlink'] },
                            { name: 'tools', items: ['Maximize'] },
                            { name: 'document', items: ['Source'] }
                        ],
                        removePlugins: 'elementspath',
                        resize_enabled: false,
                        toolbarCanCollapse: true,
                        toolbarStartupExpanded: false
                    };
                } else {
                    // regular editor
                    editorOptions = {
                        removeButtons: 'About,NewPage,Preview,Source,Outdent,Indent,Table,indentblock,Form,Checkbox,Radio,TextField,Textarea,Select,Button,ImageButton,HiddenField,CreateDiv,BidiLtr,BidiRtl,Flash,Iframe',
                        removePlugins: 'elementspath,indentblock',
                        toolbarStartupExpanded: false,
                        toolbarCanCollapse: true,
                        toolbar: 'Basic',
                        resize_enabled: false,
                        extraPlugins: 'colorbutton,sourcedialog,uploadimage',
                        filebrowserImageUploadUrl: $rootScope.app.httpSource + 'api/Upload/UploadCKEditorFile?type=Images',
                        filebrowserImageBrowseUrl: $rootScope.app.httpSource + 'api/Upload/UploadCKEditorFile?type=Images'
                    };
                }

                // enable ckeditor
                var ckeditor = element.ckeditor(editorOptions);
                // update ngModel on change
                ckeditor.editor.on('change', function () {
                    ngModel.$setViewValue(this.getData());
                });
            }
        };
    }
})();