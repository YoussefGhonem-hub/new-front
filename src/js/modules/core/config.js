/**=========================================================
 * Module: CoreConfig
 =========================================================*/
(function () {
    'use strict';

    angular
        .module('eServices')
        .config(commonConfig)
        .config(lazyLoadConfig)
        .config(filemanagerConfig);

    // Common object accessibility
    commonConfig.$inject = ['$controllerProvider', '$compileProvider', '$filterProvider', '$provide', '$httpProvider'];
    function commonConfig($controllerProvider, $compileProvider, $filterProvider, $provide, $httpProvider) {

        var app = angular.module('eServices');
        app.controller = $controllerProvider.register;
        app.directive = $compileProvider.directive;
        app.filter = $filterProvider.register;
        app.factory = $provide.factory;
        app.service = $provide.service;
        app.constant = $provide.constant;
        app.value = $provide.value;
        $httpProvider.defaults.withCredentials = true;

        $httpProvider.interceptors.push(function ($rootScope, $q, $location) {
            return {
                request: function (config) {
                    return config
                },
                response: function (response) {
                    return response;
                },
                responseError: function (rejection) {
                    if (rejection.status === 401 && rejection.config.url.indexOf("UserProfile/GetEmployees") == -1 && rejection.config.url.indexOf("UserProfile/GetInspectors") == -1 &&
                        rejection.config.url.indexOf("Roles/GetGroups") == -1 && rejection.config.url.indexOf("Roles/GetAll") == -1 &&
                        rejection.config.url.indexOf("api/Check/") == -1) {

                        $location.path('page/login');
                        return rejection;
                    } else {
                        return $q.reject(rejection);
                    }
                }
            }
        });

    }

    // Lazy load configuration
    lazyLoadConfig.$inject = ['$ocLazyLoadProvider', 'VENDOR_ASSETS'];
    function lazyLoadConfig($ocLazyLoadProvider, VENDOR_ASSETS) {

        $ocLazyLoadProvider.config({
            debug: false,
            events: true,
            modules: VENDOR_ASSETS.modules,
            modulesAr: VENDOR_ASSETS.modulesAr
        });

    }

    filemanagerConfig.$inject = ['fileManagerConfigProvider'];
    function filemanagerConfig(fileManagerConfigProvider) {
        var defaults = fileManagerConfigProvider.$get();

        fileManagerConfigProvider.set({
            appName: 'angular-filemanager'
        });

    }

})();