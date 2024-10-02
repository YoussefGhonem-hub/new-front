
(function () {
    'use strict';
    angular
        .module('eServices')
        .directive('customerPulse', customerPulse)

    customerPulse.$inject = ['$rootScope', '$http', '$filter', '$state', '$timeout', '$compile']
    function customerPulse($rootScope, $http, $filter, $state, $timeout, $compile) {
        return {
            restrict: 'E',
            scope: {
                customerPulseControl: "=ngModel"
            },
            templateUrl: '/app/views/Controls/happinessRating/CustomerPulse.html',
            link: link
        };

        function link(scope, element, attrs) {
            scope.loading = true;
            scope.customerPulseControl.lang = $rootScope.language.selected !== 'English' ? 'ar' : 'en';

            $http.get($rootScope.app.httpSource + 'api/Service/GetByServiceId?serviceId=' + scope.customerPulseControl.serviceId)
                .then(function (response) {
                    scope.service = response.data;
                    scope.request = {};

                    $http.get($rootScope.app.httpSource + 'api/UserProfile')
                        .then(function (resp) {
                            if (resp.data != null) {
                                scope.userProfile = resp.data;

                                scope.request.meta_data = {};
                                scope.request.meta_data.customer = {};
                                scope.request.meta_data.employee = {};

                                scope.request.meta_data.customer.emirates_id = (scope.userProfile.person.emiratesId != null && scope.userProfile.person.emiratesId.length == 18) ? scope.userProfile.person.emiratesId.replaceAll("-", "") : "";
                                scope.request.meta_data.customer.name = scope.userProfile.person.name;
                                scope.request.meta_data.customer.email = scope.userProfile.user.email;
                                scope.request.meta_data.customer.mobile = scope.userProfile.user.phoneNumber;
                                scope.request.meta_data.customer.gender = scope.userProfile.person.gender.nameEn.toLowerCase();
                                scope.request.meta_data.customer.nationality = scope.userProfile.person.country.isoCode2;
                                scope.request.meta_data.customer.user_id = scope.userProfile.user.id;
                                scope.request.meta_data.transaction_id = scope.customerPulseControl.transactionId;
                            }

                            if (scope.customerPulseControl.serviceId == 9) {
                                var pulseCodes = scope.service.pmoPulseCode;
                                var pulseCodesArr = pulseCodes.split(',');

                                if (scope.customerPulseControl.applicationType.pmoCode == "000")//ML New
                                    scope.request.linking_id = pulseCodesArr[0];
                                if (scope.customerPulseControl.applicationType.pmoCode == "001")//ML Renew
                                    scope.request.linking_id = pulseCodesArr[1];
                                //if (scope.customerPulseControl.applicationType.pmoCode == "000")//Add new activity
                                //    scope.request.linking_id = pulseCodesArr[2];
                                if (scope.customerPulseControl.applicationType.pmoCode == "005")//Cancel activity (reset from controller)
                                    scope.request.linking_id = pulseCodesArr[2];
                                if (scope.customerPulseControl.applicationType.pmoCode == "004")//Add/remove/waive partner
                                    scope.request.linking_id = pulseCodesArr[3];
                            }
                            else if (scope.customerPulseControl.serviceId == 12) {
                                var pulseCodes = scope.service.pmoPulseCode;
                                var pulseCodesArr = pulseCodes.split(',');

                                if (scope.customerPulseControl.applicationType.pmoCode == "000")//Newspaper New
                                    scope.request.linking_id = pulseCodesArr[0];
                                if (scope.customerPulseControl.applicationType.pmoCode == "001")//Newspaper Renew
                                    scope.request.linking_id = pulseCodesArr[1];
                                if (scope.customerPulseControl.applicationType.pmoCode == "004")//Remove activity (reset from controller)
                                    scope.request.linking_id = pulseCodesArr[2];
                            }
                            else if (scope.customerPulseControl.serviceId == 8) {
                                var pulseCodes = scope.service.pmoPulseCode;
                                var pulseCodesArr = pulseCodes.split(',');

                                if (scope.customerPulseControl.applicationType.pmoCode == "000")//RadioTv New
                                    scope.request.linking_id = pulseCodesArr[0];
                                if (scope.customerPulseControl.applicationType.pmoCode == "001")//RadioTv Renew
                                    scope.request.linking_id = pulseCodesArr[1];
                            }
                            else if (scope.customerPulseControl.serviceId == 18) {
                                var pulseCodes = scope.service.pmoPulseCode;
                                var pulseCodesArr = pulseCodes.split(',');

                                if (scope.customerPulseControl.applicationType.pmoCode == "000")//foreign media New
                                    scope.request.linking_id = pulseCodesArr[0];
                                if (scope.customerPulseControl.applicationType.pmoCode == "001")//foreign media Renew
                                    scope.request.linking_id = pulseCodesArr[1];
                            }
                            else if (scope.customerPulseControl.serviceId == 19) {
                                var pulseCodes = scope.service.pmoPulseCode;
                                var pulseCodesArr = pulseCodes.split(',');

                                if (scope.customerPulseControl.applicationType.pmoCode == "000")//foreign media New
                                    scope.request.linking_id = pulseCodesArr[0];
                                if (scope.customerPulseControl.applicationType.pmoCode == "001")//foreign media Renew
                                    scope.request.linking_id = pulseCodesArr[1];
                            }
                            else if (scope.customerPulseControl.serviceId == 1) {
                                var pulseCodes = scope.service.pmoPulseCode;
                                var pulseCodesArr = pulseCodes.split(',');

                                if (scope.customerPulseControl.applicationType.pmoCode == "000")//open rep office New
                                    scope.request.linking_id = pulseCodesArr[0];
                                if (scope.customerPulseControl.applicationType.pmoCode == "001")//open rep office Renew
                                    scope.request.linking_id = pulseCodesArr[1];
                            }
                            else if (scope.customerPulseControl.serviceId == 2) {
                                var pulseCodes = scope.service.pmoPulseCode;
                                var pulseCodesArr = pulseCodes.split(',');

                                if (scope.customerPulseControl.publicationTypeId == 1)//Print permit
                                    scope.request.linking_id = pulseCodesArr[0];
                                if (scope.customerPulseControl.publicationTypeId == 2)//Book trading
                                    scope.request.linking_id = pulseCodesArr[1];
                                if (scope.customerPulseControl.publicationTypeId == 3)//Text permit
                                    scope.request.linking_id = pulseCodesArr[2];
                                if (scope.customerPulseControl.publicationTypeId == 4)//Print Business directory
                                    scope.request.linking_id = pulseCodesArr[3];

                            }
                            else {
                                scope.request.linking_id = scope.service.pmoPulseCode;
                            }

                            $http.post($rootScope.app.httpSource + 'api/PMOPulse/GetToken', scope.request)
                                .then(function (response) {
                                    scope.loading = false;
                                    if (response.data != "") {
                                        scope.customerToken = response.data;

                                        window.CustomerPulse.render(
                                            document.getElementById('pulse-happiness-meter-widget-container'),
                                            {
                                                modal: true,
                                                token: scope.customerToken,
                                                lang: scope.customerPulseControl.lang
                                            },
                                        );
                                        window.CustomerPulse.openModal();

                                        window.addEventListener('so-widget-completed', () => {
                                            console.log('survey has been completed and submitted.');
                                            $state.go('app.dashboard');
                                        });

                                        window.addEventListener('so-widget-closed', () => {
                                            console.log('modal has been closed.');
                                            $state.go('app.dashboard');
                                        });
                                    }
                                    else {
                                        console.log('no survey has been completed.');
                                        $state.go('app.dashboard');
                                    }
                                },
                                    function (response) { scope.loading = false; }
                            );
                        });
                });
        }
    }
})();
