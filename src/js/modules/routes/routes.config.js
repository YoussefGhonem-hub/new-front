/**=========================================================
 * Module: RoutesConfig.js
 =========================================================*/

(function () {
    'use strict';

    angular
        .module('eServices')
        .config(routesConfig)
        ;

    routesConfig.$inject = ['$locationProvider', '$stateProvider', '$urlRouterProvider', 'RouteProvider'];
    function routesConfig($locationProvider, $stateProvider, $urlRouterProvider, Route) {

        // use the HTML5 History API
        $locationProvider.html5Mode(false);

        // Default route
        //$urlRouterProvider.otherwise('/app/dashboard');
        $urlRouterProvider.otherwise(function ($injector, $location) {
            //store empinspection original URL to use URL later redirect after login            
            sessionStorage.setItem('empInspection', $location.$$url.substring(12));

            var $state = $injector.get("$state");
            //Anas
            $state.go("page.login");
            //$state.go("app.TestCountry");
        });

        // Application Routes States
        $stateProvider
            .state('app', {
                url: '/app',
                abstract: true,
                templateUrl: Route.base('app.html'),
                resolve: {
                    _assets: Route.require('icons', 'screenfull', 'sparklines', 'slimscroll', 'toaster', 'animate', 'angular-tour')
                }
            })
            .state('app.dashboard', {
                url: '/dashboard',
                templateUrl: Route.base('Dashboard/dashboard.html'),
                resolve: {
                    assets: Route.require('datatables', 'oitozero.ngSweetAlert', 'layerMorph', 'icons', 'ui.select', 'moment', 'filestyle', 'angularFileUpload', 'rzModule', 'bootstrapToggle')
                },
                requireAuth: true
            })
            .state('app.profile', {
                url: '/profile/:id?',
                templateUrl: Route.base('Account/profile/app.profile.html'),
                resolve: {
                    assets: Route.require('blueimp-gallery', 'ui.select', 'datatables', 'filestyle', 'angularFileUpload', 'moment', 'ngMask', 'draganddrop', 'xeditable', 'oitozero.ngSweetAlert', 'ngImgCrop')
                },
                requireAuth: true
            })
            .state('app.achievements', {
                url: '/achievements/:id?',
                templateUrl: Route.base('Employee/achievements/achievements.html'),
                resolve: {
                    assets: Route.require('ui.select', 'flot-chart', 'flot-chart-plugins', 'easypiechart', 'moment', 'ngMask', 'oitozero.ngSweetAlert')
                },
                requireAuth: true
            })
            .state('app.establishments', {
                url: '/establishments/:id?',
                templateUrl: Route.base('Inspection/establishments/establishments.html'),
                resolve: {
                    assets: Route.require('datatables', 'oitozero.ngSweetAlert', 'layerMorph', 'icons', 'ui.select', 'moment', 'filestyle', 'angularFileUpload', 'rzModule', 'bootstrapToggle')
                },
                requireAuth: true
            })
            .state('app.enquiries', {
                url: '/enquiries/:id?',
                templateUrl: Route.base('Enquiry/enquiries/enquiries.html'),
                resolve: {
                    assets: Route.require('datatables', 'oitozero.ngSweetAlert', 'layerMorph', 'icons', 'ui.select', 'moment', 'filestyle', 'angularFileUpload', 'rzModule', 'bootstrapToggle')
                },
                requireAuth: true
            })
            .state('app.ReviewEnquiry', {
                url: '/enquiries/review/:id',
                templateUrl: Route.base('Enquiry/enquiries/review/page.reviewEnquiry.html'),
                resolve: {
                    assets: Route.require('ui.select', 'moment', 'datatables', 'filestyle', 'angularFileUpload', 'ngMask', 'blueimp-gallery', 'oitozero.ngSweetAlert', 'rzModule', 'blueimp-gallery')
                },
                requireAuth: true
            })
            .state('app.establishmentsFines', {
                url: '/establishmentsFines/:id?',
                templateUrl: Route.base('Inspection/establishmentsFines/establishmentsFines.html'),
                resolve: {
                    assets: Route.require('datatables', 'oitozero.ngSweetAlert', 'layerMorph', 'icons', 'ui.select', 'moment', 'filestyle', 'angularFileUpload', 'rzModule', 'bootstrapToggle')
                },
                requireAuth: true
            })
            .state('app.scheduleInspectors', {
                url: '/schedule/:id?',
                templateUrl: Route.base('Inspection/schedule/page.scheduleInspector.html'),
                resolve: {
                    assets: Route.require('ui.select', 'moment', 'datatables', 'filestyle', 'angularFileUpload', 'ngMask', 'blueimp-gallery', 'oitozero.ngSweetAlert', 'rzModule', 'draganddrop')
                },
                requireAuth: true
            })
            .state('app.visit', {
                url: '/visit/:establishmentId/:visitId?',
                templateUrl: Route.base('Inspection/visit/page.visit.html'),
                resolve: {
                    assets: Route.require('ui.select', 'moment', 'filestyle', 'angularFileUpload', 'ngMask', 'blueimp-gallery', 'oitozero.ngSweetAlert', 'rzModule', 'datatables')
                },
                requireAuth: true
            })
            .state('app.visit2', {
                url: '/visit/:establishmentId?',
                templateUrl: Route.base('Inspection/visit/page.visit.html'),
                resolve: {
                    assets: Route.require('ui.select', 'moment', 'filestyle', 'angularFileUpload', 'ngMask', 'blueimp-gallery', 'oitozero.ngSweetAlert', 'rzModule', 'datatables')
                },
                requireAuth: true
            })
            .state('app.unscheduledvisit', {
                url: '/unscheduledvisit',
                templateUrl: Route.base('Inspection/visit/page.unscheduledvisit.html'),
                resolve: {
                    assets: Route.require('ui.select', 'moment', 'filestyle', 'angularFileUpload', 'ngMask', 'blueimp-gallery', 'oitozero.ngSweetAlert', 'rzModule', 'datatables')
                },
                requireAuth: true
            })
            .state('app.scheduledTables', {
                url: '/scheduledTables',
                templateUrl: Route.base('Inspection/scheduledTables/scheduledTables.html'),
                resolve: {
                    assets: Route.require('ui.select', 'moment', 'datatables', 'filestyle', 'angularFileUpload', 'ngMask', 'blueimp-gallery', 'oitozero.ngSweetAlert', 'rzModule', 'draganddrop')
                },
                requireAuth: true
            })
            .state('app.roles', {
                url: '/roles',
                templateUrl: Route.base('Account/admin/roles.html'),
                resolve: {
                    assets: Route.require('blueimp-gallery', 'ui.select', 'datatables', 'filestyle', 'angularFileUpload', 'moment', 'ngMask')
                },
                requireAuth: true
            })
            .state('app.payments', {
                url: '/payments',
                templateUrl: Route.base('Employee/payment/payments.html'),
                resolve: {
                    assets: Route.require('blueimp-gallery', 'ui.select', 'datatables', 'filestyle', 'angularFileUpload', 'moment', 'layerMorph', 'oitozero.ngSweetAlert', 'bootstrapToggle')
                },
                requireAuth: true
            })
            .state('app.books', {
                url: '/books',
                templateUrl: Route.base('Employee/book/books.html'),
                resolve: {
                    assets: Route.require('blueimp-gallery', 'ui.select', 'datatables', 'filestyle', 'angularFileUpload', 'moment', 'layerMorph', 'oitozero.ngSweetAlert')
                },
                requireAuth: true
            })
            .state('app.regulateItems', {
                url: '/regulateItems',
                templateUrl: Route.base('Employee/regulate/regulateEntryItems.html'),
                resolve: {
                    assets: Route.require('blueimp-gallery', 'ui.select', 'datatables', 'filestyle', 'angularFileUpload', 'moment', 'layerMorph', 'oitozero.ngSweetAlert')
                },
                requireAuth: true
            })
            .state('app.bookCard', {
                url: '/books/:id',
                templateUrl: Route.base('Employee/book/bookCard.html'),
                resolve: {
                    assets: Route.require('blueimp-gallery', 'ui.select', 'datatables', 'filestyle', 'angularFileUpload', 'moment', 'layerMorph', 'oitozero.ngSweetAlert')
                },
                requireAuth: true
            })
            .state('app.users', {
                url: '/users',
                template: '<div ui-view ng-class="app.views.animation"></div>',
                requireAuth: true
            })
            .state('app.users.customers', {
                url: '/customers',
                templateUrl: Route.base('Account/customers/customers.html'),
                resolve: {
                    assets: Route.require('blueimp-gallery', 'ui.select', 'datatables', 'layerMorph', 'filestyle', 'angularFileUpload', 'moment', 'ngMask', 'oitozero.ngSweetAlert', 'rzModule')
                },
                requireAuth: true
            })
            .state('app.applications', {
                url: '/applications',
                template: '<div ui-view ng-class="app.views.animation" ng-cloak></div>',
                requireAuth: true
            })
            .state('app.applications.approveData', {
                url: '/approveData',
                templateUrl: Route.base('Employee/approval/approveData.html'),
                resolve: {
                    assets: Route.require('blueimp-gallery', 'ui.select', 'datatables', 'moment', 'oitozero.ngSweetAlert', 'layerMorph')
                },
                requireAuth: true
            })
            .state('app.applications.urgent', {
                url: '/urgent',
                templateUrl: Route.base('Employee/urgent/urgent.html'),
                resolve: {
                    assets: Route.require('blueimp-gallery', 'ui.select', 'datatables', 'moment', 'oitozero.ngSweetAlert', 'layerMorph')
                },
                requireAuth: true
            })
            .state('app.applications.approve', {
                url: '/approve',
                templateUrl: Route.base('Employee/managerApproval/managerApprove.html'),
                resolve: {
                    assets: Route.require('blueimp-gallery', 'ui.select', 'datatables', 'moment', 'ngMask', 'oitozero.ngSweetAlert', 'layerMorph', 'bootstrapToggle')
                },
                requireAuth: true
            })
            .state('app.applications.thirdPartyApproval', {
                url: '/thirdPartyApprove',
                templateUrl: Route.base('Employee/thirdPartyApproval/thirdPartyApprove.html'),
                resolve: {
                    assets: Route.require('blueimp-gallery', 'ui.select', 'datatables', 'filestyle', 'angularFileUpload', 'moment', 'ngMask', 'oitozero.ngSweetAlert', 'layerMorph', 'bootstrapToggle')
                },
                requireAuth: true
            })
            .state('app.applications.supervisorApproval', {
                url: '/supervisorApprove',
                templateUrl: Route.base('Employee/supervisorApproval/supervisorApprove.html'),
                resolve: {
                    assets: Route.require('blueimp-gallery', 'ui.select', 'datatables', 'filestyle', 'angularFileUpload', 'moment', 'ngMask', 'oitozero.ngSweetAlert')
                },
                requireAuth: true
            })
            .state('app.users.employees', {
                url: '/employees',
                templateUrl: Route.base('Account/employees/employees.html'),
                resolve: {
                    assets: Route.require('blueimp-gallery', 'ui.select', 'datatables', 'filestyle', 'angularFileUpload', 'moment', 'ngMask', 'oitozero.ngSweetAlert')
                },
                requireAuth: true
            })
            .state('app.payment', {
                url: '/payment',
                template: '<div ui-view ng-class="app.views.animation" ng-cloak></div>'
            })
            .state('app.payment.transactionResponse', {
                url: '/transactionResponse/:pun',
                templateUrl: Route.base('Payment/transactionResponse/transactionResponse.html'),
                resolve: {
                    assets: Route.require('datatables', 'oitozero.ngSweetAlert')
                },
                requireAuth: true
            })
            .state('app.payment.purchaseResponse', {
                url: '/purchaseResponse/:uid',
                templateUrl: Route.base('Payment/transactionResponse/purchaseResponse.html'),
                resolve: {
                    assets: Route.require('datatables', 'oitozero.ngSweetAlert')
                },
                requireAuth: true
            })
            .state('paymentReceipt', {
                url: '/paymentReceipt/:pun',
                templateUrl: Route.base('Payment/paymentReceipt/paymentReceipt.html'),
                resolve: {
                    assets: Route.require('datatables', 'filestyle', 'angularFileUpload')
                },
                requireAuth: true
            })
            .state('app.MediaLicenseServices', {
                url: '/MediaLicenseServices',
                template: '<div ui-view ng-class="app.views.animation" ng-cloak></div>'
            })
            .state('app.MediaLicenseServices.MediaLicense', {
                url: '/mediaLicense/:id?/:establishmentId?',
                templateUrl: Route.base('Application/MediaLicense/page.mediaLicense.html'),
                resolve: {
                    assets: Route.require('ui.select', 'moment', 'datatables', 'filestyle', 'angularFileUpload', 'ngMask', 'blueimp-gallery', 'oitozero.ngSweetAlert', 'rzModule')
                },
                requireAuth: true
            })
            .state('app.MediaLicenseServices.ReviewMediaLicense', {
                url: '/mediaLicense/review/:id?/:establishmentId?',
                templateUrl: Route.base('Application/MediaLicense/review/page.reviewMediaLicense.html'),
                resolve: {
                    assets: Route.require('ui.select', 'moment', 'datatables', 'filestyle', 'angularFileUpload', 'ngMask', 'blueimp-gallery', 'oitozero.ngSweetAlert', 'rzModule', 'blueimp-gallery')
                },
                requireAuth: true
            })
            .state('app.MediaLicenseServices.RenewMediaLicense', {
                url: '/mediaLicense/renew/:applicationId/:applicationDetailId?/:edit?',
                templateUrl: Route.base('Application/MediaLicense/Renew/page.renewMediaLicense.html'),
                resolve: {
                    assets: Route.require('ui.select', 'moment', 'datatables', 'filestyle', 'angularFileUpload', 'ngMask', 'blueimp-gallery', 'oitozero.ngSweetAlert', 'rzModule')
                },
                requireAuth: true
            })
            .state('app.MediaLicenseServices.AddMediaActivity', {
                url: '/mediaLicense/addMediaActivity/:applicationId/:applicationDetailId?',
                templateUrl: Route.base('Application/MediaLicense/AddActivity/page.addMediaActivity.html'),
                resolve: {
                    assets: Route.require('ui.select', 'moment', 'datatables', 'filestyle', 'angularFileUpload', 'ngMask', 'blueimp-gallery', 'oitozero.ngSweetAlert', 'rzModule')
                },
                requireAuth: true
            })
            .state('app.MediaLicenseServices.CancelMediaActivity', {
                url: '/mediaLicense/cancelMediaActivity/:applicationId/:applicationDetailId?',
                templateUrl: Route.base('Application/MediaLicense/CancelActivity/page.cancelMediaActivity.html'),
                resolve: {
                    assets: Route.require('ui.select', 'moment', 'datatables', 'filestyle', 'angularFileUpload', 'ngMask', 'blueimp-gallery', 'oitozero.ngSweetAlert', 'rzModule')
                },
                requireAuth: true
            })
            .state('app.MediaLicenseServices.GroundPhotographyPermit', {
                url: '/groundPhotographyPermit/:id?/:establishmentId?',
                templateUrl: Route.base('Application/GroundPhotographyPermit/page.groundPhotographyPermit.html'),
                resolve: {
                    assets: Route.require('ui.select', 'moment', 'datatables', 'filestyle', 'angularFileUpload', 'ngMask', 'blueimp-gallery', 'oitozero.ngSweetAlert')
                },
                requireAuth: true
            })
            .state('app.MediaLicenseServices.AerialPhotographyPermit', {
                url: '/aerialPhotographyPermit/:id?/:establishmentId?',
                templateUrl: Route.base('Application/AerialPhotographyPermit/page.aerialPhotographyPermit.html'),
                resolve: {
                    assets: Route.require('ui.select', 'moment', 'datatables', 'filestyle', 'angularFileUpload', 'ngMask', 'blueimp-gallery', 'oitozero.ngSweetAlert')
                },
                requireAuth: true
            })
            .state('app.MediaLicenseServices.BookNewspaper', {
                url: '/BookNewspaperName/:id?/:establishmentId?',
                templateUrl: Route.base('Application/NewspaperNameBooking/page.newspaperNameBooking.html'),
                resolve: {
                    assets: Route.require('ui.select', 'moment', 'datatables', 'filestyle', 'angularFileUpload', 'ngMask', 'blueimp-gallery', 'oitozero.ngSweetAlert')
                },
                requireAuth: true
            })
            .state('app.MediaLicenseServices.EquipmentPermit', {
                url: '/PhotoEquipmentPermit/:id?/:establishmentId?',
                templateUrl: Route.base('Application/PhotoEquipmentPermit/page.photoEquipmentPermit.html'),
                resolve: {
                    assets: Route.require('ui.select', 'moment', 'datatables', 'filestyle', 'angularFileUpload', 'ngMask', 'blueimp-gallery', 'oitozero.ngSweetAlert')
                },
                requireAuth: true
            })
            .state('app.MediaLicenseServices.RepresentativeOffice', {
                url: '/RepresentativeOffice/:id?/:establishmentId?',
                templateUrl: Route.base('Application/RepresentativeOffice/page.representativeOffice.html'),
                resolve: {
                    assets: Route.require('ui.select', 'moment', 'datatables', 'filestyle', 'angularFileUpload', 'ngMask', 'blueimp-gallery', 'oitozero.ngSweetAlert')
                },
                requireAuth: true
            })
            .state('app.MediaLicenseServices.ReviewBookNewspaper', {
                url: '/BookNewspaperName/review/:id?/:establishmentId?',
                templateUrl: Route.base('Application/NewspaperNameBooking/Review/page.reviewNewspaperNameBooking.html'),
                resolve: {
                    assets: Route.require('ui.select', 'moment', 'datatables', 'filestyle', 'angularFileUpload', 'ngMask', 'blueimp-gallery', 'oitozero.ngSweetAlert')
                },
                requireAuth: true
            })
            .state('app.MediaLicenseServices.ReviewRepresentativeOffice', {
                url: '/RepresentativeOffice/review/:id?/:establishmentId?',
                templateUrl: Route.base('Application/RepresentativeOffice/Review/page.reviewRepresentativeOffice.html'),
                resolve: {
                    assets: Route.require('ui.select', 'moment', 'datatables', 'filestyle', 'angularFileUpload', 'ngMask', 'blueimp-gallery', 'oitozero.ngSweetAlert')
                },
                requireAuth: true
            })
            .state('app.MediaLicenseServices.ReviewEquipmentPermit', {
                url: '/PhotoEquipmentPermit/review/:id?/:establishmentId?',
                templateUrl: Route.base('Application/PhotoEquipmentPermit/Review/page.reviewPhotoEquipmentPermit.html'),
                resolve: {
                    assets: Route.require('ui.select', 'moment', 'datatables', 'filestyle', 'angularFileUpload', 'ngMask', 'blueimp-gallery', 'oitozero.ngSweetAlert')
                },
                requireAuth: true
            })
            .state('app.MediaLicenseServices.ReviewGroundPhotographyPermit', {
                url: '/groundPhotographyPermit/review/:id?/:establishmentId?',
                templateUrl: Route.base('Application/groundPhotographyPermit/review/page.reviewGroundPhotographyPermit.html'),
                resolve: {
                    assets: Route.require('ui.select', 'moment', 'datatables', 'filestyle', 'angularFileUpload', 'ngMask', 'blueimp-gallery', 'oitozero.ngSweetAlert')
                },
                requireAuth: true
            })
            .state('app.MediaLicenseServices.ReviewAerialPhotographyPermit', {
                url: '/aerialPhotographyPermit/review/:id?/:establishmentId?',
                templateUrl: Route.base('Application/aerialPhotographyPermit/review/page.reviewAerialPhotographyPermit.html'),
                resolve: {
                    assets: Route.require('ui.select', 'moment', 'datatables', 'filestyle', 'angularFileUpload', 'ngMask', 'blueimp-gallery', 'oitozero.ngSweetAlert')
                },
                requireAuth: true
            })
            .state('app.MediaLicenseServices.NewspaperMagazineLicense', {
                url: '/newspaperMagazineLicense/:id?/:establishmentId?',
                templateUrl: Route.base('Application/newspaperMagazineLicense/page.newspaperMagazineLicense.html'),
                resolve: {
                    assets: Route.require('ui.select', 'filestyle', 'angularFileUpload', 'moment', 'angularWizard', 'datatables', 'ngMask', 'blueimp-gallery', 'oitozero.ngSweetAlert', 'rzModule')
                },
                requireAuth: true
            })
            .state('app.MediaLicenseServices.ReviewNewspaperMagazineLicense', {
                url: '/newspaperMagazineLicense/review/:id?/:establishmentId?',
                templateUrl: Route.base('Application/newspaperMagazineLicense/review/page.reviewNewspaperMagazineLicense.html'),
                resolve: {
                    assets: Route.require('ui.select', 'moment', 'datatables', 'filestyle', 'angularFileUpload', 'ngMask', 'blueimp-gallery', 'oitozero.ngSweetAlert', 'rzModule')
                },
                requireAuth: true
            })
            .state('app.MediaLicenseServices.RenewNewspaperMagazineLicense', {
                url: '/newspaperMagazineLicense/renew/:applicationId/:applicationDetailId?',
                templateUrl: Route.base('Application/newspaperMagazineLicense/Renew/page.renewNewspaperMagazineLicense.html'),
                resolve: {
                    assets: Route.require('ui.select', 'filestyle', 'angularFileUpload', 'moment', 'angularWizard', 'datatables', 'ngMask', 'blueimp-gallery', 'oitozero.ngSweetAlert', 'rzModule')
                },
                requireAuth: true
            })
            .state('app.MediaLicenseServices.RadioTVBroadcastingLicense', {
                url: '/radioTVBroadcastingLicense/:id?/:establishmentId?',
                templateUrl: Route.base('Application/RadioTvBroadcasting/page.radioTvBroadcasting.html'),
                resolve: {
                    assets: Route.require('ui.select', 'filestyle', 'angularFileUpload', 'moment', 'angularWizard', 'datatables', 'ngMask', 'blueimp-gallery', 'oitozero.ngSweetAlert', 'rzModule')
                },
                requireAuth: true
            })
            .state('app.MediaLicenseServices.ReviewRadioTVBroadcastingLicense', {
                url: '/radioTVBroadcastingLicense/review/:id?/:establishmentId?',
                templateUrl: Route.base('Application/RadioTvBroadcasting/review/page.reviewTvBroadcasting.html'),
                resolve: {
                    assets: Route.require('ui.select', 'moment', 'datatables', 'filestyle', 'angularFileUpload', 'ngMask', 'blueimp-gallery', 'oitozero.ngSweetAlert', 'rzModule')
                },
                requireAuth: true
            })
            .state('app.MediaLicenseServices.RenewRadioTvBroadcasting', {
                url: '/radioTVBroadcastingLicense/renew/:applicationId/:applicationDetailId?',
                templateUrl: Route.base('Application/RadioTvBroadcasting/Renew/page.renewTvBroadcasting.html'),
                resolve: {
                    assets: Route.require('ui.select', 'moment', 'datatables', 'filestyle', 'angularFileUpload', 'ngMask', 'blueimp-gallery', 'oitozero.ngSweetAlert', 'rzModule')
                },
                requireAuth: true
            })
            .state('app.MediaLicenseServices.ChangePartners', {
                url: '/changePartners/:applicationId/:applicationDetailId?/:edit?',
                templateUrl: Route.base('Application/MediaLicense/ChangePartners/page.changePartners.html'),
                resolve: {
                    assets: Route.require('ui.select', 'filestyle', 'angularFileUpload', 'moment', 'angularWizard', 'datatables', 'ngMask', 'blueimp-gallery', 'oitozero.ngSweetAlert', 'rzModule')
                },
                requireAuth: true
            })
            .state('page', {
                url: '/page',
                templateUrl: Route.base('page.html'),
                resolve: {
                    assets: Route.require('icons', 'animate')
                }
            })
            .state('page.login', {
                url: '/login/:tkt/:smpl',
                templateUrl: Route.base('Account/login/page.login.html'),
                requireAuth: false,
                resolve: {
                    assets: Route.require('oitozero.ngSweetAlert', 'moment', 'countdown')
                }
            })
            .state('page.smartpasslogin', {
                url: '/smartpasslogin/:tkt?',
                templateUrl: Route.base('Account/login/page.smartpasslogin.html'),
                requireAuth: false,
                resolve: {
                    assets: Route.require('oitozero.ngSweetAlert', 'moment')
                }
            })
            .state('page.uaepasslogin', {
                url: '/uaepasslogin/:st/:dt',
                templateUrl: Route.base('Account/login/page.uaepasslogin.html'),
                requireAuth: false,
                resolve: {
                    assets: Route.require('oitozero.ngSweetAlert', 'moment')
                }
            })
            .state('page.register', {
                url: '/register',
                templateUrl: Route.base('Account/register/page.register.html'),
                resolve: {
                    assets: Route.require('ui.select', 'oitozero.ngSweetAlert', 'ngMask')
                },
                requireAuth: false
            }).state('page.confirmEmail', {
                url: '/confirmEmail?userId&code',
                templateUrl: Route.base('Account/confirmEmail/page.confirmEmail.html'),
                resolve: {
                    assets: Route.require('oitozero.ngSweetAlert')
                },
                requireAuth: false
            }).state('page.confirmPhone', {
                url: '/confirmPhone',
                templateUrl: Route.base('Account/confirmPhone/page.confirmPhone.html'),
                requireAuth: false
            }).state('page.recover', {
                url: '/recover',
                templateUrl: Route.base('Account/recover/page.recover.html'),
                resolve: {
                    assets: Route.require('oitozero.ngSweetAlert')
                },
                requireAuth: false
            }).state('page.reset', {
                url: '/resetPassword?userId&code',
                templateUrl: Route.base('Account/recover/page.reset.html'),
                requireAuth: false
            })
            .state('page.lock', {
                url: '/lock',
                templateUrl: Route.base('page.lock.html')
            })
            .state('page.completeProfile', {
                url: '/completeProfile',
                templateUrl: Route.base('Account/completeProfile/page.completeProfile.html'),
                resolve: {
                    assets: Route.require('ui.select', 'filestyle', 'angularFileUpload', 'moment', 'angularWizard', 'datatables', 'oitozero.ngSweetAlert', 'ngMask', 'blueimp-gallery')
                },
                requireAuth: true
            })            
            .state('page.qrcode', {
                url: '/qrcode?id',
                templateUrl: Route.base('Account/qrCode/page.foreignPressCardQRCode.html'),
                resolve: {
                    assets: Route.require('ui.select', 'filestyle', 'angularFileUpload', 'moment', 'angularWizard', 'datatables', 'oitozero.ngSweetAlert', 'ngMask', 'blueimp-gallery')
                },
                requireAuth: false
            })
            .state('page.payFines/', {
                url: '/payFines/:uid',
                templateUrl: Route.base('Inspection/payFines/page.payFines.html'),
                resolve: {
                    assets: Route.require('ui.select', 'filestyle', 'angularFileUpload', 'moment', 'angularWizard', 'datatables', 'oitozero.ngSweetAlert', 'ngMask', 'blueimp-gallery')
                },
                requireAuth: false
            })
            .state('app.MediaContentServices', {
                url: '/MediaContentServices',
                template: '<div ui-view ng-class="app.views.animation" ng-cloak></div>'
            })
            .state('app.MediaContentServices.RegulateEntryMediaMaterial', {
                url: '/RegulateEntryMediaMaterial/:id?/:establishmentId?',
                templateUrl: Route.base('Application/RegulateMediaMaterial/page.regulateMediaMaterial.html'),
                resolve: {
                    assets: Route.require('ui.select', 'datatables', 'oitozero.ngSweetAlert', 'moment', 'ngMask', 'filestyle', 'angularFileUpload', 'blueimp-gallery')
                },
                requireAuth: true
            })
            .state('app.MediaContentServices.ReviewRegulateEntryMediaMaterial', {
                url: '/RegulateEntryMediaMaterial/review/:id?/:establishmentId?',
                templateUrl: Route.base('Application/RegulateMediaMaterial/review/page.reviewRegulateMediaMaterial.html'),
                resolve: {
                    assets: Route.require('ui.select', 'datatables', 'moment', 'ngMask', 'angularFileUpload', 'oitozero.ngSweetAlert', 'blueimp-gallery')
                },
                requireAuth: true
            })
            .state('app.MediaContentServices.PublicationsPrintingPermit', {
                url: '/PublicationsPrintingPermit/:id?/:establishmentId?',
                templateUrl: Route.base('Application/printingPermit/page.printingPermit.html'),
                resolve: {
                    assets: Route.require('ui.select', 'datatables', 'moment', 'ngMask', 'oitozero.ngSweetAlert', 'filestyle', 'angularFileUpload', 'blueimp-gallery')
                },
                requireAuth: true
            })
            .state('app.MediaContentServices.ReviewPublicationsPrintingPermit', {
                url: '/PublicationsPrintingPermit/review/:id?/:establishmentId?',
                templateUrl: Route.base('Application/printingPermit/review/page.reviewPrintingPermit.html'),
                resolve: {
                    assets: Route.require('ui.select', 'datatables', 'moment', 'ngMask', 'angularFileUpload', 'oitozero.ngSweetAlert', 'blueimp-gallery')
                },
                requireAuth: true
            })
            .state('app.MediaContentServices.CirculationMediaMaterialPermit', {
                url: '/CirculationMediaMaterialPermit/:id?/:establishmentId?',
                templateUrl: Route.base('Application/CirculationMediaMaterialPermit/page.circulationMediaMaterialPermit.html'),
                resolve: {
                    assets: Route.require('ui.select', 'datatables', 'moment', 'oitozero.ngSweetAlert', 'filestyle', 'angularFileUpload', 'blueimp-gallery')
                },
                requireAuth: true
            })
            .state('app.MediaContentServices.ReviewCirculationMediaMaterialPermit', {
                url: '/CirculationMediaMaterialPermit/review/:id?/:establishmentId?',
                templateUrl: Route.base('Application/CirculationMediaMaterialPermit/review/page.reviewCirculationMediaMaterial.html'),
                resolve: {
                    assets: Route.require('ui.select', 'datatables', 'moment', 'oitozero.ngSweetAlert', 'filestyle', 'angularFileUpload', 'blueimp-gallery')
                },
                requireAuth: true
            })
            .state('app.MediaContentServices.CirculationNewspaperMagazinePermit', {
                url: '/CirculationNewspaperMagazinePermit/:id?/:establishmentId?',
                templateUrl: Route.base('Application/CirculationNewspaperMagazine/page.circulationNewspaperMagazine.html'),
                resolve: {
                    assets: Route.require('ui.select', 'datatables', 'moment', 'filestyle', 'angularFileUpload', 'ngMask', 'blueimp-gallery', 'oitozero.ngSweetAlert')
                },
                requireAuth: true
            })
            .state('app.MediaContentServices.ReviewCirculationNewspaperMagazinePermit', {
                url: '/CirculationNewspaperMagazinePermit/review/:id?/:establishmentId?',
                templateUrl: Route.base('Application/CirculationNewspaperMagazine/review/page.reviewCirculationNewspaperMagazine.html'),
                resolve: {
                    assets: Route.require('ui.select', 'datatables', 'moment', 'filestyle', 'angularFileUpload', 'ngMask', 'blueimp-gallery', 'oitozero.ngSweetAlert')
                },
                requireAuth: true
            })
            .state('app.MediaContentServices.MediaMaterialApproval', {
                url: '/MediaMaterialApproval/:applicationDetailId/:reportId?',
                templateUrl: Route.base('Controller/page.mediaMaterialApproval.html'),
                resolve: {
                    assets: Route.require('ui.select', 'datatables', 'moment', 'filestyle', 'angularFileUpload', 'ngMask', 'blueimp-gallery', 'oitozero.ngSweetAlert', 'datetime-inputs', 'draganddrop')
                },
                requireAuth: true
            })
            .state('app.MediaLicenseServices.JournalistsAppointmentIssuePressCard', {
                url: '/JournalistsAppointmentIssuePressCard/:id?/:establishmentId?',
                templateUrl: Route.base('Application/JournalistsAppointment/page.journalistsAppointment.html'),
                resolve: {
                    assets: Route.require('ui.select', 'datatables', 'moment', 'filestyle', 'angularFileUpload', 'ngMask', 'blueimp-gallery', 'oitozero.ngSweetAlert')
                },
                requireAuth: true
            })
            .state('app.MediaLicenseServices.ReviewJournalistsAppointmentIssuePressCard', {
                url: '/JournalistsAppointmentIssuePressCard/review/:id?/:establishmentId?',
                templateUrl: Route.base('Application/JournalistsAppointment/review/page.reviewJournalistsAppointment.html'),
                resolve: {
                    assets: Route.require('ui.select', 'datatables', 'moment', 'filestyle', 'angularFileUpload', 'ngMask', 'blueimp-gallery', 'oitozero.ngSweetAlert')
                },
                requireAuth: true
            })
            .state('app.ForeignMediaServices', {
                url: '/ForeignMediaServices',
                template: '<div ui-view ng-class="app.views.animation" ng-cloak></div>'
            })
            .state('app.ForeignMediaServices.AccreditationForeignJournalists', {
                url: '/AccreditationForeignJournalists/:id',
                templateUrl: Route.base('Application/ForeignJournalists/page.foreignJournalist.html'),
                resolve: {
                    assets: Route.require('ui.select', 'datatables', 'moment', 'filestyle', 'angularFileUpload', 'ngMask', 'blueimp-gallery', 'oitozero.ngSweetAlert')
                }
            })
            .state('app.ForeignMediaServices.ReviewAccreditationForeignJournalists', {
                url: '/AccreditationForeignJournalists/review/:id',
                templateUrl: Route.base('Application/ForeignJournalists/review/page.reviewForeignJournalists.html'),
                resolve: {
                    assets: Route.require('ui.select', 'datatables', 'moment', 'filestyle', 'angularFileUpload', 'ngMask', 'blueimp-gallery', 'oitozero.ngSweetAlert')
                }
            })
            .state('app.ForeignMediaServices.IssuePressCardForTheForeignReporter', {
                url: '/IssuePressCard/:id',
                templateUrl: Route.base('Application/ForeignMediaPressCard/page.foreignMediaIssuePressCard.html'),
                resolve: {
                    assets: Route.require('ui.select', 'datatables', 'moment', 'filestyle', 'angularFileUpload', 'ngMask', 'blueimp-gallery', 'oitozero.ngSweetAlert', 'ngImgCrop')
                }
            })
            .state('app.ForeignMediaServices.ReviewIssuePressCardForTheForeignReporter', {
                url: '/IssuePressCard/review/:id',
                templateUrl: Route.base('Application/ForeignMediaPressCard/review/page.reviewForeignMediaIssuePressCard.html'),
                resolve: {
                    assets: Route.require('ui.select', 'datatables', 'moment', 'filestyle', 'angularFileUpload', 'ngMask', 'blueimp-gallery', 'oitozero.ngSweetAlert')
                }
            })
            .state('app.ForeignMediaServices.RenewPressCard', {
                url: '/IssuePressCard/renew/:applicationId/:applicationDetailId?/:edit?',
                templateUrl: Route.base('Application/ForeignMediaPressCard/Renew/page.renewForeignMediaIssuePressCard.html'),
                resolve: {
                    assets: Route.require('ui.select', 'moment', 'datatables', 'filestyle', 'angularFileUpload', 'ngMask', 'blueimp-gallery', 'oitozero.ngSweetAlert', 'rzModule')
                },
                requireAuth: true
            })
            .state('app.ForeignMediaServices.IssueSponsorship', {
                url: '/IssueSponsorship/:id',
                templateUrl: Route.base('Application/Sponsorship/page.issueSponsorship.html'),
                resolve: {
                    assets: Route.require('ui.select', 'datatables', 'moment', 'filestyle', 'angularFileUpload', 'ngMask', 'blueimp-gallery', 'oitozero.ngSweetAlert')
                }
            })
            .state('app.ForeignMediaServices.ReviewSponsorship', {
                url: '/IssueSponsorship/review/:id',
                templateUrl: Route.base('Application/Sponsorship/Review/page.reviewSponsorship.html'),
                resolve: {
                    assets: Route.require('ui.select', 'datatables', 'moment', 'filestyle', 'angularFileUpload', 'ngMask', 'blueimp-gallery', 'oitozero.ngSweetAlert')
                }
            })
            .state('app.ForeignMediaServices.RenewSponsorship', {
                url: '/IssueSponsorship/renew/:applicationId/:applicationDetailId?/:edit?',
                templateUrl: Route.base('Application/Sponsorship/Renew/page.renewSponsorship.html'),
                resolve: {
                    assets: Route.require('ui.select', 'moment', 'datatables', 'filestyle', 'angularFileUpload', 'ngMask', 'blueimp-gallery', 'oitozero.ngSweetAlert', 'rzModule')
                },
                requireAuth: true
            })
            .state('app.MediaLicenseServices.SocialMediaLicense', {
                url: '/socialMediaLicense/:id?/:establishmentId?',
                templateUrl: Route.base('Application/SocialMediaLicense/page.socialMediaLicense.html'),
                resolve: {
                    assets: Route.require('ui.select', 'moment', 'datatables', 'filestyle', 'angularFileUpload', 'ngMask', 'blueimp-gallery', 'oitozero.ngSweetAlert', 'rzModule')
                },
                requireAuth: true
            })
            .state('app-dock', {
                url: '/dock',
                abstract: true,
                templateUrl: Route.base('app-dock.html'),
                controller: ['$rootScope', '$scope', function ($rootScope, $scope) {
                    $rootScope.app.layout.isDocked = true;
                    $scope.$on('$destroy', function () {
                        $rootScope.app.layout.isDocked = false;
                    });
                    // we can't use dropdown when material and docked
                    // main content overlaps dropdowns (forced for demo)
                    $rootScope.app.layout.isMaterial = false;
                }],
                resolve: {
                    assets: Route.require('icons', 'screenfull', 'sparklines', 'slimscroll', 'toaster', 'animate')
                }
            })
            .state('app-dock.dashboard', {
                url: '/dashboard',
                templateUrl: Route.base('dashboard.html'),
                resolve: {
                    assets: Route.require('flot-chart', 'flot-chart-plugins', 'easypiechart')
                }
            })
            .state('app-fh', {
                url: '/fh',
                abstract: true,
                templateUrl: Route.base('app-fh.html'),
                resolve: {
                    assets: Route.require('icons', 'screenfull', 'sparklines', 'slimscroll', 'toaster', 'animate')
                }

            }).state('app.migration', {
                url: '/migration',
                templateUrl: Route.base('Migration/MigrateOldLicens.html'),
                resolve: {
                    assets: Route.require('datatables', 'oitozero.ngSweetAlert', 'layerMorph', 'icons', 'ui.select', 'moment', 'filestyle', 'angularFileUpload', 'rzModule', 'bootstrapToggle')
                },
                requireAuth: true

            })
            .state('app.techsupport', {
                url: '/techsupport',
                templateUrl: Route.base('Tools/techsupport.html'),
                resolve: {
                    assets: Route.require('datatables', 'blueimp-gallery','oitozero.ngSweetAlert', 'layerMorph', 'icons', 'ui.select', 'moment', 'filestyle', 'angularFileUpload', 'rzModule', 'bootstrapToggle')
                },
                requireAuth: true

            })
            .state('app.tasks', {
                url: '/task/:id?',
                templateUrl: Route.base('Inspection/task/task.html'),
                resolve: {
                    assets: Route.require('datatables', 'oitozero.ngSweetAlert', 'layerMorph', 'icons', 'ui.select', 'moment', 'filestyle', 'angularFileUpload', 'rzModule', 'bootstrapToggle')
                },
                requireAuth: true
            })
            .state('app.visits', {
                url: '/visitList',
                templateUrl: Route.base('Inspection/visitList/visitList.html'),
                resolve: {
                    assets: Route.require('datatables', 'oitozero.ngSweetAlert', 'layerMorph', 'icons', 'ui.select', 'moment', 'filestyle', 'angularFileUpload', 'rzModule', 'bootstrapToggle')
                },
                requireAuth: true
            })
            .state('app.ReviewTask', {
                url: '/Task/Review/:id?/:establishmentId?',
                templateUrl: Route.base('Inspection/task/Review/page.reviewTask.html'),
                resolve: {
                    assets: Route.require('ui.select', 'moment', 'datatables', 'filestyle', 'angularFileUpload', 'ngMask', 'blueimp-gallery', 'oitozero.ngSweetAlert', 'rzModule', 'blueimp-gallery')
                },
                requireAuth: true
            })
            .state('app.ReviewVisitList', {
                url: '/VisitList/review/:id?/:establishmentId?',
                templateUrl: Route.base('Inspection/visitList/Review/page.reviewVisitList.html'),
                resolve: {
                    assets: Route.require('ui.select', 'moment', 'datatables', 'filestyle', 'angularFileUpload', 'ngMask', 'blueimp-gallery', 'oitozero.ngSweetAlert', 'rzModule', 'blueimp-gallery')
                },
                requireAuth: true
            })
            .state('app.ReviewEstablishment', {
                url: '/Establishment/review/:id?/:establishmentId?',
                templateUrl: Route.base('Inspection/establishments/Review/page.reviewEstablishment.html'),
                resolve: {
                    assets: Route.require('ui.select', 'moment', 'datatables', 'filestyle', 'angularFileUpload', 'ngMask', 'blueimp-gallery', 'oitozero.ngSweetAlert', 'rzModule', 'blueimp-gallery')
                },
                requireAuth: true
            })
            .state('app.newspapers', {
                url: '/newspapers',
                templateUrl: Route.base('Employee/newspaper/Newspaper.html'),
                resolve: {
                    assets: Route.require('blueimp-gallery', 'ui.select', 'datatables', 'filestyle', 'angularFileUpload', 'moment', 'layerMorph', 'oitozero.ngSweetAlert')
                },
                requireAuth: true
            })
            .state('app.NewspaperCard', {
                url: '/Newspapers/:id',
                templateUrl: Route.base('Employee/newspaper/NewspaperCard.html'),
                resolve: {
                    assets: Route.require('blueimp-gallery', 'ui.select', 'datatables', 'filestyle', 'angularFileUpload', 'moment', 'layerMorph', 'oitozero.ngSweetAlert')
                },
                requireAuth: true
            })
            .state('app.systemManagement', {
                url: '/systemManagement',
                templateUrl: Route.base('Account/admin/SystemManagement/systemManagement.html'),
                resolve: {
                    assets: Route.require('datatables', 'oitozero.ngSweetAlert', 'layerMorph', 'icons', 'ui.select', 'moment', 'filestyle', 'angularFileUpload', 'rzModule', 'bootstrapToggle')
                },
                requireAuth: true
            })
            .state('app.reports', {
                url: '/reports',
                templateUrl: Route.base('Report/reports/reportList.html'),
                resolve: {
                    assets: Route.require('datatables', 'oitozero.ngSweetAlert', 'layerMorph', 'icons', 'ui.select', 'moment', 'filestyle', 'angularFileUpload', 'rzModule', 'bootstrapToggle')
                },
                requireAuth: true
            })
            ;
    }

})();