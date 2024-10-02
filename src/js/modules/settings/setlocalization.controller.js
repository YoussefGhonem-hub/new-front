/**=========================================================
 * Module: LoginController.js
 * Controller for the Chat APP 
 =========================================================*/

(function () {
    'use strict';

    angular
        .module('eServices')
        .controller('setlocalizationController', setlocalizationController);
    /* @ngInject */
    function setlocalizationController($rootScope, $scope, SweetAlert, $http, $filter, $state) {
        var vm = this;
        vm.isRTLValue = false;
        vm.isRTLValue = $rootScope.app.layout.isRTL;
        if (!vm.isRTLValu) {
            var _opts = { url: 'https://onecontact3xg.itmaxglobal.com/clicktointeract/', bodyBackground: '#b68a34', headerBackground: '#b08b43', headerTitle: 'Live Chat', instance: 'uaemc', mediaType: 'chat', service: 'IME', language: 'en', headerColor: '#FFFFFF' }; (function () { var n = document.createElement('script'), t; n.setAttribute('id', 'preview-widget'); n.setAttribute('opts', JSON.stringify(_opts)); n.type = 'text/javascript'; n.async = !0; n.src = 'https://onecontact3xg.itmaxglobal.com/clicktointeract/widget/widget.js?time=' + (new Date).getTime(); document.body.appendChild(n); t = document.getElementById('preview-widget'); t.parentNode.insertBefore(n, t) })();
        }
        else {
            var _opts = { url: 'https://onecontact3xg.itmaxglobal.com/clicktointeract/', bodyBackground: '#b68a34', headerBackground: '#b08b43', headerTitle: 'دردشة مباشرة', instance: 'uaemc', mediaType: 'chat', service: 'IME', language: 'en', headerColor: '#FFFFFF' }; (function () { var n = document.createElement('script'), t; n.setAttribute('id', 'preview-widget'); n.setAttribute('opts', JSON.stringify(_opts)); n.type = 'text/javascript'; n.async = !0; n.src = 'https://onecontact3xg.itmaxglobal.com/clicktointeract/widget/widget.js?time=' + (new Date).getTime(); document.body.appendChild(n); t = document.getElementById('preview-widget'); t.parentNode.insertBefore(n, t) })();
        }

    }
    setlocalizationController.$inject = ['$rootScope', '$scope', 'SweetAlert', '$http', '$filter', '$state'];

})();