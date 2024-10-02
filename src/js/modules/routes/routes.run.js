/**=========================================================
 * Module: RoutesRun
 =========================================================*/

(function () {
    'use strict';

    angular
        .module('eServices')
        .run(appRun);
    /* @ngInject */
    function appRun($rootScope, $window, UserProfile, $state, $location) {

        // Hook not found
        $rootScope.$on('$stateNotFound',
          function (event, unfoundState, fromState, fromParams) {
              console.log(unfoundState.to); // "lazy.state"
              console.log(unfoundState.toParams); // {a:1, b:2}
              console.log(unfoundState.options); // {inherit:false} + default options

              console.log('$stateNotFound ' + unfoundState.to + '  - fired when a state cannot be found by its name.');
              console.log(unfoundState, fromState, fromParams);
          });

        // Hook success
        $rootScope.$on('$stateChangeSuccess',
          function (event, toState, toParams, fromState, fromParams) {
              //console.log('$stateChangeSuccess to ' + toState.name + '- fired once the state transition is complete.');
              // success here
              // display new view from top
              $window.ga('send', 'pageview', $location.path());
              $window.scrollTo(0, 0);
          });

        $rootScope.$on('$stateChangeStart', function (event, newUrl, toParams, fromState, fromParams) {
            var userProfile = UserProfile.getProfile();
            //console.log('$stateChangeStart to ' + newUrl.name + '- fired when the transition begins. toState,toParams : \n', newUrl, toParams);
            if (newUrl.requireAuth) {
                if (!userProfile.isLoggedIn) {
                    event.preventDefault();
                    console.log('DENY');
                    //$location.path('/login');
                    $state.go('page.login'); 
                    return;
                }

                var paymentProgress = sessionStorage.getItem('paymentProgress');
                if(paymentProgress!=null && paymentProgress=="true")
                {
                    if(newUrl.name != "app.payment.transactionResponse")
                    {
                        event.preventDefault();
                        sessionStorage.removeItem('accessToken');
                        sessionStorage.removeItem('paymentProgress');
                        $state.go('page.login')
                    }
                    if (newUrl.name == "app.payment.transactionResponse") {
                        sessionStorage.removeItem('paymentProgress');
                    }
                }
            }
        });

        //$rootScope.$on('$stateChangeError', function (event, toState, toParams, fromState, fromParams, error) {
        //    console.log('$stateChangeError - fired when an error occurs during transition.');
        //    console.log(arguments);
        //});

        //$rootScope.$on('$viewContentLoading', function (event, viewConfig) {
        //    console.log('$viewContentLoading - view begins loading - dom not rendered', viewConfig);
        //});
    }
    appRun.$inject = ['$rootScope', '$window', 'UserProfile', '$state', '$location'];

})();

