/**=========================================================
 * Module: profileAddress
 * Reuse cases of address in user profile page
 =========================================================*/

(function () {
    'use strict';

    angular
        .module('eServices')
        .directive('happinessMeter', happinessMeter)

    happinessMeter.$inject = ['$rootScope', '$http', '$filter', '$state', '$timeout', '$compile']
    function happinessMeter($rootScope, $http, $filter, $state, $timeout, $compile) {
        return {
            restrict: 'E',
            scope: {
                happinessMeterControl: "=ngModel"
            },
            templateUrl: '/app/views/Controls/happinessRating/PMOHappinessMeter.html',
            link: link
        };

        function link(scope, element, attrs) {
            scope.happinessMeterControl.lang = $rootScope.language.selected !== 'English' ? 'arab' : 'en';

            $http.get($rootScope.app.httpSource + 'api/Service/GetByServiceId?serviceId=' + scope.happinessMeterControl.serviceId)
                .then(function (response) {
                    scope.service = response.data;
                    scope.happinessMeterControl.mainServiceCode = scope.service.serviceCategory.pmoCode;
                    
                    if (scope.service.pmoCode != '000') {
                        scope.happinessMeterControl.subServiceCode = scope.service.pmoCode;
                    }
                    else {
                        scope.happinessMeterControl.subServiceCode = scope.happinessMeterControl.publicationType.pmoCode;
                    }

                    if (scope.happinessMeterControl.applicationType) {
                        scope.happinessMeterControl.complementaryCode = scope.happinessMeterControl.applicationType.pmoCode;
                    }
                    else {
                        scope.happinessMeterControl.complementaryCode = "000";
                    }

                    var optionsPMO = {};
                    optionsPMO.language = scope.happinessMeterControl.lang;
                    //optionsPMO.fullSequenceCode = "000-000-000-000",
                    optionsPMO.entitySequenceID = "128";
                    optionsPMO.mainServiceSequenceID = scope.happinessMeterControl.mainServiceCode;
                    optionsPMO.subserviceSequenceID = scope.happinessMeterControl.subServiceCode;
                    optionsPMO.subserviceComplementaryID = scope.happinessMeterControl.complementaryCode;
                    optionsPMO.transactionId = scope.happinessMeterControl.transactionId;
                    optionsPMO.email = "hello@happinessmeter.gov.ae";
                    optionsPMO.phone = "+971000000000";
                    optionsPMO.originUrl = "https://happinessmeter.gov.ae";
                    optionsPMO.emiratesId = "0";

                    window.happinessMeterWidgetServices(optionsPMO, scope.happinessCallback());
                    $state.go('app.dashboard');
                });

            scope.happinessCallback = function (e) {
                
            };
        }
    }
})();
