/**=========================================================
 * Module: TranslatorService
 =========================================================*/

(function () {
    'use strict';

    angular
        .module('eServices')
        .service('translator', translator);
    /* @ngInject */
    function translator($rootScope, $translate, $http, $cookies, $localStorage, tmhDynamicLocale) {
        /*jshint validthis:true*/
        var self = this;

        self.init = init;
        self.set = set;
        self.data = {
            // Handles language dropdown
            listIsOpen: false,
            // list of available languages
            available: {
                'en': 'English',
                'ar': 'العربية'
            },
            selected: 'English'
        };

        /////////////////////

        // display always the current ui language
        function init() {
            var proposedLanguage = $translate.proposedLanguage() || $translate.use();
            var preferredLanguage = $translate.preferredLanguage(); // we know we have set a preferred one in App.config
            self.data.selected = self.data.available[(proposedLanguage || preferredLanguage)];

            // Init internationalization service
            $rootScope.language = self.data;
            $rootScope.language.set = angular.bind(self, self.set);

            if ($cookies.get('Culture') == undefined) {
                $cookies.put('Culture', (preferredLanguage === 'ar' ? 'ar-AE' : 'en-US'));
                moment.locale(preferredLanguage);
            }

            $rootScope.$locale = proposedLanguage;
            tmhDynamicLocale.set(proposedLanguage);

            return self.data;
        }

        function set(localeId, ev) {
            // Set the new idiom

            var CultureVal = 'en-US';
            if (localeId && localeId.indexOf("ar") != -1) {
                CultureVal = 'ar-AE';
            }

            $translate.use(localeId);
            $cookies.put('Culture', CultureVal);
            moment.locale(localeId);
            tmhDynamicLocale.set(localeId);

            $http.post($rootScope.app.httpSource + 'api/Culture/SetCulture', { value: CultureVal }, { withCredential: true })
                  .then(function (response) {
                  },
                  function (response) { // optional
                      alert('failed');
                  });

            if (localeId === 'ar') {
                $rootScope.app.layout.isRTL = true;
                $localStorage.settings.layout.isRTL = true;
            }
            else {
                $rootScope.app.layout.isRTL = false;
                $localStorage.settings.layout.isRTL = false;
            }
            // save a reference for the current language
            self.data.selected = self.data.available[localeId];
            // finally toggle dropdown
            self.data.listIsOpen = !self.data.listIsOpen;
        }

    }
    translator.$inject = ['$rootScope', '$translate', '$http', '$cookies', '$localStorage', 'tmhDynamicLocale'];

})();