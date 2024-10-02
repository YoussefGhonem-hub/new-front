(function () {
    'use strict';
    angular
        .module('eServices')
        .factory('PushNotificationService', PushNotificationService);

    PushNotificationService.$inject = ['$rootScope', 'Hub', '$timeout', 'ngToast', '$state', '$sce', 'UserProfile','$http'];
    function PushNotificationService($rootScope, Hub, $timeout, ngToast, $state, $sce, UserProfile, $http) {


        //declaring the hub connection
        var hub = new Hub('PushNotification', {

            //client side methods
            listeners: {               
                'newMessage': function (data) {
                    console.log("data ", data);
                    var myToastMsg = ngToast.create({
                        className: '',
                        timeout: 10000,
                        dismissButton: true,
                        dismissOnClick: false,
                        compileContent: true,
                        compileToScope: $rootScope,
                        //content: $sce.trustAsHtml('<div style="cursor: pointer;" ng-click="onToasterClick(' + data.ApplicationId+')">' +
                        //    '<span>' + data.UserName + ' has added new ' + data.ContentType + ' (' + data.ApplicationNumber +')</span></div>')
                        content: $sce.trustAsHtml('<blockquote ng-click="onToasterClick(' + data.ApplicationId + ',\'' + data.ServiceCode + '\',\'' + data.ServiceCategoryCode +'\')" class="blockquote blockquote-primary" style="border-left:0 !important; cursor: pointer;">' +
                            '<p>New ' + data.ContentType + ' added. (' + data.ApplicationNumber +')</p>' +
                            '<footer class="blockquote-footer" style="color:#fff"><cite title="Source Title">' + data.UserName + '</cite></footer> ' +
                            '</blockquote >')
                    });

                    // $rootScope.$emit('pushNotificationToaster',id);
                    $rootScope.onToasterClick = function (Id, serviceCode, serviceCategoryCode) {
                        console.log(Id, serviceCode, serviceCategoryCode);
                        ngToast.dismiss();
                        if (serviceCategoryCode == 'ML') {
                            switch (serviceCode) {
                                case "01":
                                    $state.go('app.MediaLicenseServices.ReviewJournalistsAppointmentIssuePressCard', { id: Id });
                                    break;

                                case "02":
                                    $state.go('app.MediaLicenseServices.ReviewGroundPhotographyPermit', { id: Id });
                                    break;

                                case "03":
                                    $state.go('app.MediaLicenseServices.ReviewRadioTVBroadcastingLicense', { id: Id });
                                    break;

                                case "04":
                                    $state.go('app.MediaLicenseServices.ReviewMediaLicense', { id: Id });
                                    break;

                                case "05":
                                    $state.go('app.MediaLicenseServices.ReviewNewspaperMagazineLicense', { id: Id });
                                    break;

                                case "06":
                                    $state.go('app.MediaLicenseServices.ReviewRepresentativeOffice', { id: Id });
                                    break;

                                case "07":
                                    $state.go('app.MediaLicenseServices.ReviewBookNewspaper', { id: Id });
                                    break;

                                case "08":
                                    $state.go('app.MediaLicenseServices.ReviewEquipmentPermit', { id: Id });
                                    break;

                                case "09":
                                    $state.go('app.MediaLicenseServices.ReviewAerialPhotographyPermit', { id: Id });
                                    break;
                            }
                        }
                        if (serviceCategoryCode == 'MC') {
                            switch (serviceCode) {
                                case "01":
                                    $state.go('app.MediaContentServices.ReviewPublicationsPrintingPermit', { id: Id });
                                    break;

                                case "02":
                                    $state.go('app.MediaContentServices.ReviewRegulateEntryMediaMaterial', { id: Id });
                                    break;

                                case "03":
                                    $state.go('app.MediaContentServices.ReviewCirculationMediaMaterialPermit', { id: Id });
                                    break;

                                case "04":
                                    $state.go('app.MediaContentServices.ReviewCirculationNewspaperMagazinePermit', { id: Id });
                                    break;
                            }
                        }
                        if (serviceCategoryCode == 'FM') {
                            switch (serviceCode) {
                                case "01":
                                    $state.go('app.ForeignMediaServices.ReviewAccreditationForeignJournalists', { id: Id });
                                    break;
                            }
                        }
                    };
                    $rootScope.$apply();
                }
            },

            //server side methods
            methods: [],
                        
            //handle connection error
            errorHandler: function (error) {
                console.error(error);
            },
            
            rootPath: $rootScope.app.httpSource + "signalr",

            queryParams: {
                'requestType': "WebClient"
            },

            autoConnect: true,

            stateChanged: function (state) {
                switch (state.newState) {
                    case $.signalR.connectionState.connecting:
                        console.log("SignalR Connecting..");
                        break;
                    case $.signalR.connectionState.connected:
                        console.log("SignalR connected..");
                        break;
                    case $.signalR.connectionState.reconnecting:
                        console.log("SignalR reconnecting..");
                        break;
                    case $.signalR.connectionState.disconnected:
                        console.log("SignalR disconnected..");   
                        let user = UserProfile.getProfile();
                        if (user.isLoggedIn) {
                            hub.connect();
                        }
                        break;
                }
            }
        });

        var subscribe = function (typeCode) {            
            hub.connect();
        };

        var unSubscribe = function (typeCode) {          
            hub.disconnect();
        }

        return {
            onSubscribe: subscribe,
            onUnSubscribe: unSubscribe,
        };
    };
})();