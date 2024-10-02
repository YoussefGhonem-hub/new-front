/**=========================================================
 * Module: SidebarDirective
 * Wraps the sidebar. Handles collapsed state and slide
 =========================================================*/

 (function () {
  'use strict';

  angular
      .module('eServices')
      .directive('uiSidebars', uiSidebars);

  uiSidebar.$inject = ['$rootScope', '$window', '$timeout', 'MEDIA_QUERY', '$http', '$uibModal', '$state', '$filter', 'SweetAlert'];
  function uiSidebar($rootScope, $window, $timeout, MEDIA_QUERY, $http, $uibModal, $state, $filter, SweetAlert) {
      debugger;
      return {
          restrict: 'A',
          link: link
      };

      function link(scope, element) {

          $rootScope.IsLoadingMenu = true;
         // $http.defaults.withCredentials = true;
         // $http.defaults.headers.common['Authorization'] = 'Bearer ' + sessionStorage.getItem('accessToken');
          $http.get($rootScope.app.httpSource + 'api/Menu/GetMenu')
             .then(function (response) {
                 $rootScope.IsLoadingMenu = false;
                 $rootScope.userMenu = response.data;

                 $timeout(function () {
                     element.find('a').on('click', function (event) {

                         var ele = angular.element(this),
                             par = ele.parent()[0];

                         // remove active class (ul > li > a)
                         var lis = ele.parent().parent().children();
                         angular.forEach(lis, function (li) {
                             if (li !== par)

                                 angular.element(li).removeClass('active');
                         });

                         var next = ele.next();
                         if (next.length && next[0].tagName === 'UL') {

                             ele.parent().toggleClass('active');
                             event.preventDefault();
                         }
                     });
                 });
             },
             function (response) { // optional
                 $rootScope.IsLoadingMenu = false;
             });

          $http.get($rootScope.app.httpSource + 'api/UserProfile')
              .then(function (resp) {
                  scope.userProfile = resp.data;
              },
              function (response) { });

          // on mobiles, sidebar starts off-screen
          if (onMobile()) $timeout(function () {
              $rootScope.app.sidebar.isOffscreen = true;
          });
          // hide sidebar on route change
          $rootScope.$on('$stateChangeStart', function () {

              if (onMobile())
                  $rootScope.app.sidebar.isOffscreen = true;
          });

          $window.addEventListener('resize', function () {
              $timeout(function () {
                  if (!(navigator.platform.indexOf("iPad") != -1))
                      $rootScope.app.sidebar.isOffscreen = onMobile();
              });
          });

          function onMobile() {
              return $window.innerWidth < MEDIA_QUERY.tablet;
          }

          scope.navigateToUrl = function (menuItem) {
              $http.get($rootScope.app.httpSource + 'api/UserProfile')
                  .then(function (resp) {
                          scope.userProfile = resp.data;
                      },
                      function (response) { });

              switch (scope.userProfile.userTypeId) {
                  case 1:
                      if (menuItem.id == 10) {
                          $http.get($rootScope.app.httpSource + 'api/Journalist')
                              .then(function (response) {
                                  if (response.data != null && response.data != '') {
                                      SweetAlert.swal({
                                          title: $filter('translate')('general.notApplicable'), text: $filter('translate')('journalists.multipleCards'),
                                          confirmButtonText: $filter('translate')('general.ok')
                                      });
                                  }
                                  else {
                                      $state.go(menuItem.url);
                                  }
                              },
                              function (response) { });
                      }
                      else if (menuItem.id == 42) {
                          $http.get($rootScope.app.httpSource + 'api/ForeignPressCard/CheckPressCardAppliationCountByUser')
                              .then(function (response) {
                                  if (response.data == 3) {
                                      SweetAlert.swal({
                                          title: $filter('translate')('general.notApplicable'), text: $filter('translate')('journalists.multipleCards'),
                                          confirmButtonText: $filter('translate')('general.ok')
                                      });
                                  }
                                  else {
                                      $state.go(menuItem.url);
                                  }
                              },
                                  function (response) { });
                      }

                      else if (menuItem.id == 44) {
                          var dob = new Date(scope.userProfile.person.dateOfBirth);
                          const diff = Date.now() - dob.getTime();
                          const ageDate = new Date(diff);
                          var age = Math.abs(ageDate.getUTCFullYear() - 1970);
                          if (age < 18) {
                              SweetAlert.swal({
                                  title: $filter('translate')('general.notApplicable'), text: $filter('translate')('mediaLicense.ageUnder18'),
                                  confirmButtonText: $filter('translate')('general.ok')
                              });
                          }
                          else {
                              $http.get($rootScope.app.httpSource + 'api/Establishment/GetUserApplications?userId=' + scope.userProfile.userId)
                                  .then(function (response) {
                                      scope.userApplications = response.data;
                                      var userApps = $filter('filter')(scope.userApplications, { userId: scope.userProfile.userId }, true)[0];

                                      if (userApps.numberOfApplications > 0) {
                                          SweetAlert.swal({
                                              title: $filter('translate')('general.notApplicable'), text: $filter('translate')('mediaLicense.hasMediaLicesne'),
                                              confirmButtonText: $filter('translate')('general.ok')
                                          });
                                      }
                                      else {
                                          $state.go(menuItem.url);
                                      }
                                  },
                                      function (response) { });
                          }
                      }
                      else {
                          $state.go(menuItem.url);
                      }

                      break;

                  case 2: case 3: case 4: case 5: case 23: case 24:
                      if (scope.userProfile.userEstablishments.length > 1) {
                          var modalInstance = $uibModal.open({
                              templateUrl: 'app/views/Controls/ChooseEstablishment/chooseEstablishment.html',
                              controller: 'ChooseEstablishmentController',
                              size: 'lg',
                              resolve: {
                                  menuItemClicked: function () {
                                      return menuItem;
                                  }
                              }
                          });

                          modalInstance.result.then(function (establishmentBranch) {
                              $state.go(menuItem.url, { id: null, establishmentId: establishmentBranch.id }, { reload: true });
                          }, function () {
                          });
                      }
                      else {
                          //You have to put your code here
                          //If your establishment doesn't have any activities for media material type
                          //Then sweetAlert wron action (as above) must appear
                          switch (menuItem.id) {
                              case 8:
                                  $http.get($rootScope.app.httpSource + 'api/Establishment/GetEstablishmentApplications?estId=' + scope.userProfile.userEstablishments[0].establishment.id)
                                   .then(function (response) {
                                       scope.establishmentApplications = response.data;
                                       var establishment = $filter('filter')(scope.establishmentApplications, { establishmentId: parseInt(scope.userProfile.userEstablishments[0].establishment.id) }, true)[0];

                                       if (establishment.numberOfApplications1 > 0) {
                                           SweetAlert.swal({
                                               title: $filter('translate')('general.notApplicable'), text: $filter('translate')('establishment.hasMediaLicesne'),
                                               confirmButtonText: $filter('translate')('general.ok')
                                           });
                                       }
                                       else {
                                           $state.go(menuItem.url, { id: null, establishmentId: scope.userProfile.userEstablishments[0].establishment.id }, { reload: true });
                                       }
                                   });

                                  break;

                              case 12:
                                  $http.get($rootScope.app.httpSource + 'api/Establishment/GetEstablishmentApplications?estId=' + scope.userProfile.userEstablishments[0].establishment.id)
                                      .then(function (response) {
                                          scope.establishmentApplications = response.data;
                                          var establishment = $filter('filter')(scope.establishmentApplications, { establishmentId: parseInt(scope.userProfile.userEstablishments[0].establishment.id) }, true)[0];

                                          if (establishment.numberOfOpticalMediaApplications == 0 && establishment.numberOfAudioMediaApplications == 0 &&
                                              establishment.numberOfComputerProgramsMediaApplications == 0 && establishment.numberOfVideoGamesMediaApplications == 0 &&
                                              establishment.numberOfCinemaMediaApplications == 0) {
                                              SweetAlert.swal({
                                                  title: $filter('translate')('general.notApplicable'), text: $filter('translate')('establishment.hasNoCirculationMediaLicense'),
                                                  confirmButtonText: $filter('translate')('general.ok')
                                              });
                                          }
                                          else {
                                              $state.go(menuItem.url, { id: null, establishmentId: scope.userProfile.userEstablishments[0].establishment.id }, { reload: true });
                                          }
                                      },
                                      function (response) { });
                                  break;

                              case 13:
                                  $http.get($rootScope.app.httpSource + 'api/Establishment/GetEstablishmentApplications?estId=' + scope.userProfile.userEstablishments[0].establishment.id)
                                  .then(function (response) {
                                      scope.establishmentApplications = response.data;
                                      var establishment = $filter('filter')(scope.establishmentApplications, { establishmentId: parseInt(scope.userProfile.userEstablishments[0].establishment.id) }, true)[0];

                                      if (establishment.numberOfNewspaperApplications == 0 && establishment.numberOfImportNewspaperApplications == 0) {
                                          SweetAlert.swal({
                                              title: $filter('translate')('general.notApplicable'), text: $filter('translate')('establishment.hasNewspaper'),
                                              confirmButtonText: $filter('translate')('general.ok')
                                          });
                                      }
                                      else {
                                          $state.go(menuItem.url, { id: null, establishmentId: scope.userProfile.userEstablishments[0].establishment.id }, { reload: true });
                                      }
                                  },
                                  function (response) { });

                                  break;

                              case 44:
                                  $http.get($rootScope.app.httpSource + 'api/Establishment/GetEstablishmentApplications?estId=' + scope.userProfile.userEstablishments[0].establishment.id)
                                      .then(function (response) {
                                          scope.establishmentApplications = response.data;
                                          var establishment = $filter('filter')(scope.establishmentApplications, { establishmentId: parseInt(scope.userProfile.userEstablishments[0].establishment.id) }, true)[0];

                                          if (establishment.numberOfSocialMediaApplications > 0) {
                                              SweetAlert.swal({
                                                  title: $filter('translate')('general.notApplicable'), text: $filter('translate')('establishment.hasSocialMediaLicesne'),
                                                  confirmButtonText: $filter('translate')('general.ok')
                                              });
                                          }
                                          else {
                                              $state.go(menuItem.url, { id: null, establishmentId: scope.userProfile.userEstablishments[0].establishment.id }, { reload: true });
                                          }
                                      });

                                  break;

                              default:
                                  $state.go(menuItem.url, { id: null, establishmentId: scope.userProfile.userEstablishments[0].establishment.id }, { reload: true });
                                  break;
                          }
                      }
                      break;
                  case 19:
                      $state.go(menuItem.url);
                      break;

                  case 20:
                      $state.go(menuItem.url, { id: null, establishmentId: scope.userProfile.userEstablishments[0].establishment.id }, { reload: true });
                      break;

                  case 22:
                      $state.go(menuItem.url, { id: null, establishmentId: scope.userProfile.userEstablishments[0].establishment.id }, { reload: true });
                      break;
              }
          }
      }
  }
})();
