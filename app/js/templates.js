angular.module("eServices").run(["$templateCache", function ($templateCache) {
    $templateCache.put("templates/footer.html", '<div ng-controller="SettingsController as config" class="row col-md-12 text-center"><script type="text/ng-template" id="/terms1.html">' +
        '<div class="modal-header" ><button type="button" ng-click="cancel()" data-dismiss="modal" aria-hidden="true" class="close">x</button><h4 id="myModalLabel" class="modal-title text-capitalize" ' +
        'data-translate="register.terms"></h4></div><div class="modal-body" style="max-height:600px; overflow-y: auto;"><div class="row"><div class="col-lg-12"><h4 ' +
        'data-translate="terms.intro"></h4><p data-translate="terms.introDesc"></p></div></div><div class="row"><div class="col-lg-12"><h4 data-translate="terms.intellectualRights">' +
        '</h4><ol><li data-translate="terms.intellectualRightsDesc1"></li><li data-translate="terms.intellectualRightsDesc2"></li><li data-translate="terms.intellectualRightsDesc3">' +
        '</li></ol></div></div><div class="row"><div class="col-lg-12"><h4 data-translate="terms.gurantees"></h4><ol><li data-translate="terms.guranteesDesc1"></li><li ' +
        'data-translate="terms.guranteesDesc2"></li><li data-translate="terms.guranteesDesc3"></li><li data-translate="terms.guranteesDesc4"></li><li ' +
        'data-translate="terms.guranteesDesc5"></li><li data-translate="terms.guranteesDesc6"></li></ol></div></div><div class="row"><div class="col-lg-12"><h4 ' +
        'data-translate="terms.registration"></h4><ol><li data-translate="terms.registrationDesc1"></li><li data-translate="terms.registrationDesc2"></li><li ' +
        'data-translate="terms.registrationDesc3"></li><li data-translate="terms.registrationDesc4"></li><li data-translate="terms.registrationDesc5"></li><li ' +
        'data-translate="terms.registrationDesc6"></li><li data-translate="terms.registrationDesc7"></li><li data-translate="terms.registrationDesc8"></li></ol></div></div><div ' +
        'class="row"><div class="col-lg-12"><h4 data-translate="terms.links"></h4><ol><li data-translate="terms.linksDesc1"></li><li data-translate="terms.linksDesc2"></li><li ' +
        'data-translate="terms.linksDesc3"></li></ol></div></div><div class="row"><div class="col-lg-12"><h4 data-translate="terms.electronicCopies"></h4><p ' +
        'data-translate="terms.electronicCopiesDesc"></p></div></div><div class="row"><div class="col-lg-12"><h4 data-translate="terms.versioning"></h4><p ' +
        'data-translate="terms.versioningDesc"></p></div></div><div class="row"><div class="col-lg-12"><h4 data-translate="terms.laws"></h4><p data-translate="terms.lawsDesc"></p>' +
        '</div></div><div class="row"><div class="col-lg-12"><h4 data-translate="terms.adjustments"></h4><p data-translate="terms.adjustmentsDesc"></p></div></div><div class="row">' +
        '<div class="col-lg-12"><h4 data-translate="terms.responsibilities"></h4><ol><li data-translate="terms.responsibilitiesDesc1"></li><li ' +
        'data-translate="terms.responsibilitiesDesc2"></li></ol></div></div></div><div class="modal-footer"><button ng-click="ok()" class="btn btn-primary" ' +
        'data-translate="general.ok"></button></div></script><script type="text/ng-template" id="/privacy.html"><div class="modal-header" ><button type="button" ng-click="ok()" data-dismiss="modal" ' +
        'aria-hidden="true" class="close">×</button><h4 id="myModalLabel" class="modal-title text-capitalize" data-translate="register.privacy"></h4></div><div class="modal-body" ' +
        'style="max-height:600px; overflow-y: auto;"><div class="row"><div class="col-lg-12"><h4 data-translate="terms.intro"></h4><p data-translate="terms.introDesc"></p></div>' +
        '</div><div class="row"><div class="col-lg-12"><h4 data-translate="terms.intellectualRights"></h4><ol><li data-translate="terms.intellectualRightsDesc1"></li><li ' +
        'data-translate="terms.intellectualRightsDesc2"></li><li data-translate="terms.intellectualRightsDesc3"></li></ol></div></div><div class="row"><div class="col-lg-12"><h4 ' +
        'data-translate="terms.gurantees"></h4><ol><li data-translate="terms.guranteesDesc1"></li><li data-translate="terms.guranteesDesc2"></li><li ' +
        'data-translate="terms.guranteesDesc3"></li><li data-translate="terms.guranteesDesc4"></li><li data-translate="terms.guranteesDesc5"></li><li ' +
        'data-translate="terms.guranteesDesc6"></li></ol></div></div><div class="row"><div class="col-lg-12"><h4 data-translate="terms.registration"></h4><ol><li ' +
        'data-translate="terms.registrationDesc1"></li><li data-translate="terms.registrationDesc2"></li><li data-translate="terms.registrationDesc3"></li><li ' +
        'data-translate="terms.registrationDesc4"></li><li data-translate="terms.registrationDesc5"></li><li data-translate="terms.registrationDesc6"></li><li ' +
        'data-translate="terms.registrationDesc7"></li><li data-translate="terms.registrationDesc8"></li></ol></div></div><div class="row"><div class="col-lg-12"><h4 ' +
        'data-translate="terms.links"></h4><ol><li data-translate="terms.linksDesc1"></li><li data-translate="terms.linksDesc2"></li><li data-translate="terms.linksDesc3"></li></ol>' +
        '</div></div><div class="row"><div class="col-lg-12"><h4 data-translate="terms.electronicCopies"></h4><p data-translate="terms.electronicCopiesDesc"></p></div></div><div ' +
        'class="row"><div class="col-lg-12"><h4 data-translate="terms.versioning"></h4><p data-translate="terms.versioningDesc"></p></div></div><div class="row"><div ' +
        'class="col-lg-12"><h4 data-translate="terms.laws"></h4><p data-translate="terms.lawsDesc"></p></div></div><div class="row"><div class="col-lg-12"><h4 ' +
        'data-translate="terms.adjustments"></h4><p data-translate="terms.adjustmentsDesc"></p></div></div><div class="row"><div class="col-lg-12"><h4 ' +
        'data-translate="terms.responsibilities"></h4><ol><li data-translate="terms.responsibilitiesDesc1"></li><li data-translate="terms.responsibilitiesDesc2"></li></ol></div>' +
        '</div></div><div class="modal-footer"><button ng-click="ok()" class="btn btn-primary" data-translate="general.ok"></button></div></script><script type="text/ng-template" ' +
        'id="/accessibility.html"> <div class="modal-header" ><button type="button" ng-click="ok()" data-dismiss="modal" aria-hidden="true" class="close">x</button><h4 class="modal-title ' +
        'text-capitalize" data-translate="register.accessibility"></h4></div><div class="modal-body" style="max-height:600px; overflow-y: auto;"><div class="row"><div ' +
        'class="col-lg-12"><p data-translate="accessibility.introDesc"></p></div></div><div class="row"><div class="col-lg-12"><h4 data-translate="accessibility.zoomScreen"></h4><p ' +
        'data-translate="accessibility.zoomScreenDesc"></p></div></div><div class="row"><div class="col-lg-12"><h4 data-translate="accessibility.textSize"></h4><p ' +
        'data-translate="accessibility.textSizeDesc"></p></div></div><div class="row"><div class="col-lg-12"><h4 data-translate="accessibility.color"></h4><p ' +
        'data-translate="accessibility.colorDesc"></p></div></div></div><div class="modal-footer"><button ng-click="ok()" class="btn btn-primary" data-translate="general.ok">' +
        '</button></div></script><script type="text/ng-template" id="/happiness.html"><div class="modal-header" ><button type="button" ng-click="ok()" data-dismiss="modal" aria-hidden="true" ' +
        'class="close">×</button><h4 class="modal-title text-capitalize" data-translate="register.happiness"></h4></div><div class="modal-body" style="max-height:600px; ' +
        'overflow-y: auto;"><div class="row"><div class="col-lg-12"><img class="img-responsive" ng-src="{{charterUrl}}" /></div></div></div><div class="modal-footer"><button ' +
        'ng-click="ok()" class="btn btn-primary" data-translate="general.ok"></button></div></script><div class="row col-md-12"><a href="" data-translate="register.accessibility" ' +
        'ng-click="config.openAccessibility(\'lg\')"></a>&nbsp;|&nbsp;<a href="" data-translate="register.happiness" ng-click="config.openHappiness1(\'lg\')"></a>&nbsp;|&nbsp;<a ' +
        'href="" data-translate="register.privacy" ng-click="config.openPrivacy(\'lg\')"></a>&nbsp;|&nbsp;<a href="" data-translate="register.terms" ' +
        'ng-click="config.openTerms(\'lg\')"></a>&nbsp;|&nbsp;<a href="{{config.faqUrl}}" data-translate="register.faqs" target="_blank"></a></div><div class="row col-md-12" ' +
        'style="padding-top:10px;padding-bottom:20px;"><span ng-if="!app.layout.isRTL">{{ "general.allRights" | translate }} &copy; {{ app.year }} - UAE Media Council</span><span ng-if="app.layout.isRTL">{{ "general.allRights" | translate }} &copy; {{ app.year }} - مجلس الإمارات للإعلام</span></div></div>');

    $templateCache.put("templates/settings.html", '<div class="settings-inner">' +
        '   <div ng-click="showSettings=!showSettings" class="settings-button">' +
        '      <em class="icon-cog"></em>' +
        '   </div>' +
        '   <div ng-controller="SettingsController as config" ng-class="{ \'settings color-blind overflowClass\' : app.layout.isColorBlind, \'settings overflowClass\' : !app.layout.isColorBlind}">' +
        '      <div class="settings-inner">' +
        '         <div class="settings-content">' +
        '            <div class="pt ph">' +
        '               <p class="text-muted" data-translate="settings.THEMES"></p>' +
        '               <div class="clearfix mb">' +
        '                  <div ng-repeat="theme in config.themes" class="pull-left wd-tiny mb">' +
        '                     <div class="setting-color">' +
        '                        <label>' +
        '                           <input type="radio" name="setting-theme" ng-model="app.themeId" ng-value="$index" ng-change="config.setTheme($index)" />' +
        '                           <span class="icon-check"></span>' +
        '                           <ul class="list-table">' +
        '                              <li ng-class="theme.sidebar"></li>' +
        '                              <li ng-class="theme.brand"></li>' +
        '                              <li ng-class="theme.topbar"></li>' +
        '                           </ul>' +
        '                        </label>' +
        '                     </div>' +
        '                  </div>' +
        '               </div>' +
        '            </div>' +
        '            <hr/>' +
        '            <div class="p">' +
        '               <p class="text-muted" data-translate="settings.LAYOUT"></p>' +
        '               <div class="clearfix">' +
        '                  <p class="pull-left" data-translate="settings.Fixed"></p>' +
        '                  <div class="pull-right">' +
        '                     <label class="switch switch-info">' +
        '                        <input type="checkbox" ng-model="app.layout.isFixed" ng-disabled="app.layout.isMaterial" />' +
        '                        <span></span>' +
        '                     </label>' +
        '                  </div>' +
        '               </div>' +
        '               <div class="clearfix">' +
        '                  <p class="pull-left" data-translate="settings.Boxed"></p>' +
        '                  <div class="pull-right">' +
        '                     <label class="switch switch-info">' +
        '                        <input type="checkbox" ng-model="app.layout.isBoxed" ng-disabled="app.layout.isMaterial" />' +
        '                        <span></span>' +
        '                     </label>' +
        '                  </div>' +
        '               </div>' +
        '               <div class="clearfix">' +
        '                  <p class="pull-left" data-translate="settings.Material"></p>' +
        '                  <div class="pull-right">' +
        '                     <label ng-click="app.layout.isBoxed = false; app.layout.isFixed = true" class="switch switch-info">' +
        '                        <input type="checkbox" ng-model="app.layout.isMaterial" ng-disabled="app.layout.isDocked || app.sidebar.isMini" />' +
        '                        <span></span>' +
        '                     </label>' +
        '                  </div>' +
        '               </div>' +
        '               <div class="clearfix">' +
        '                  <p class="pull-left" data-translate="settings.TextSize"></p>' +
        '                  <text-size-slider min="12" max="24" unit="px" value="13"></text-size-slider>' +
        '               </div>' +
        '               <div class="clearfix">' +
        '                  <p class="pull-left" data-translate="settings.colorBlind"></p>' +
        '                  <div class="pull-right">' +
        '                     <label ng-click="app.layout.isBoxed = false; app.layout.isFixed = true" class="switch switch-info">' +
        '                        <input type="checkbox" ng-model="app.layout.isColorBlind" />' +
        '                        <span></span>' +
        '                     </label>' +
        '                  </div>' +
        '               </div>' +
        '            </div>' +
        '            <div class="p">' +
        '               <p class="text-muted" data-translate="settings.SIDEBAR"></p>' +
        '               <div class="clearfix">' +
        '                  <p class="pull-left" data-translate="settings.Mini"></p>' +
        '                  <div class="pull-right">' +
        '                     <label ng-click="app.layout.isMaterial = false;" class="switch switch-info">' +
        '                        <input type="checkbox" ng-model="app.sidebar.isMini" />' +
        '                        <span></span>' +
        '                     </label>' +
        '                  </div>' +
        '               </div>' +
        '               <div class="clearfix">' +
        '                  <p class="pull-left" data-translate="settings.Right"></p>' +
        '                  <div class="pull-right">' +
        '                     <label class="switch switch-info">' +
        '                        <input type="checkbox" ng-model="app.sidebar.isRight" />' +
        '                        <span></span>' +
        '                     </label>' +
        '                  </div>' +
        '               </div>' +
        '            </div>' +
        '            <div class="p">' +
        '               <p class="text-muted" data-translate="settings.FOOTER"></p>' +
        '               <div class="clearfix">' +
        '                  <p class="pull-left" data-translate="settings.Hidden"></p>' +
        '                  <div class="pull-right">' +
        '                     <label class="switch switch-info">' +
        '                        <input type="checkbox" ng-model="app.footer.hidden" />' +
        '                        <span></span>' +
        '                     </label>' +
        '                  </div>' +
        '               </div>' +
        '            </div>' +
        '            <hr/>' +
        '            <div class="p">' +
        '               <!-- START Language list-->' +
        '               <div class="pull-right">' +
        '                  <div uib-dropdown="" is-open="language.listIsOpen" class="btn-group btn-group-sm"><a uib-dropdown-toggle="" class="dropdown-toggle clickable">{{language.selected}}<span class="caret"></span></a>' +
        '                     <ul role="menu" class="dropdown-menu dropdown-menu-right animated fadeInLeft2">' +
        '                        <li ng-repeat="(localeId, langName) in language.available"><a ng-click="language.set(localeId, $event)" href="">{{langName}}</a>' +
        '                        </li>' +
        '                     </ul>' +
        '                  </div>' +
        '               </div>' +
        '               <!-- END Language list    -->' +
        '               <p class="text-muted" data-translate="settings.LANGUAGE"></p>' +
        '            </div>' +
        '         </div>' +
        '      </div>' +
        '   </div>' +
        '</div>');


    $templateCache.put("templates/sidebar.html", '<div ng-show="IsLoadingMenu === false" class="sidebar-wrapper">' +
        '    <div ui-sidebar="" ng-class="{ \'sidebar color-blind\' : app.layout.isColorBlind, \'sidebar\' : !app.layout.isColorBlind}">' +
        '        <div class="sidebar-nav">' +
        '            <ul class="nav" ng-repeat="mitem in userMenu">' +
        '                <li ng-if="mitem.subMenus.length == 0 && $index == 0" class="nav-heading">' +
        '                    <span translate="navbar.menu" class="text-muted"></span>' +
        '                </li>' +
        '                <li ng-if="mitem.subMenus.length == 0" ui-sref-active="active">' +
        '                    <a ui-sref="{{mitem.url}}" title="{{mitem | localizeString}}" ripple="" ng-class="{ \'color-blind\' : app.layout.isColorBlind}">' +
        '                        <em class="sidebar-item-icon" ng-class="mitem.logo"></em>' +
        '                        <span>{{mitem | localizeString}}</span>' +
        '                    </a>' +
        '                </li>' +
        '                <li ng-if="mitem.subMenus.length > 0" ng-class="{active:$state.includes(\'{{mitem.url}}\')}">' +
        '                    <a href="" title="{{mitem | localizeString}}" ripple="" ng-class="{ \'color-blind\' : app.layout.isColorBlind}">' +
        '                        <em class="sidebar-item-caret fa pull-right fa-angle-right"></em>' +
        '                        <em class="sidebar-item-icon" ng-class="mitem.logo"></em>' +
        '                        <span>{{mitem | localizeString}}</span>' +
        '                    </a>' +
        '                    <ul class="nav sidebar-subnav">' +
        '                        <li class="sidebar-subnav-header">' +
        '                            <a ng-class="{ \'color-blind\' : app.layout.isColorBlind}">' +
        '                                <em class="sidebar-item-icon fa fa-angle-right"></em>{{mitem | localizeString}}' +
        '                            </a>' +
        '                        </li>' +
        '                        <li ng-repeat="submitem in mitem.subMenus" ng-class="{active:$state.includes(\'{{submitem.url}}\')}">' +
        '                            <!--ui-sref-active="active"-->' +
        '                            <a title="{{submitem | localizeString}}" ripple="" ng-click="navigateToUrl(submitem)" ng-class="{ \'color-blind\' : app.layout.isColorBlind}">' +
        '                                <!--ui-sref="app.ui.buttons"-->' +
        '                                <div class="label pull-right label-success">{{submitem.menuCount}}</div>' +
        '                                <em class="sidebar-item-icon" ng-class="submitem.logo"></em>' +
        '                                <span>{{submitem | localizeString}}</span>' +
        '                            </a>' +
        '                        </li>' +
        '                    </ul>' +
        '                </li>' +
        '            </ul>' +
        '        </div>' +
        '    </div>' +
        '</div>');


    $templateCache.put("templates/top-navbar-dock.html", '<!-- START Top Navbar-->' +
        '<nav role="navigation" ng-controller="HeaderNavController as header" class="navbar topnavbar">' +
        '   <!-- START navbar header-->' +
        '   <div ng-class="app.theme.brand" class="navbar-header">' +
        '      <a ui-sref="app.dashboard" class="navbar-brand">' +
        '         <img src="app/img/logo.png" alt="App Logo" class="brand-logo" style="max-height:55px; filter: brightness(0) invert(1);" />' +
        '      </a>' +
        '      <!-- Mobile buttons-->' +
        '      <div class="mobile-toggles">' +
        '         <!-- Button to show/hide the header menu on mobile. Visible on mobile only.-->' +
        '         <a href="" ng-click="header.toggleHeaderMenu()" class="menu-toggle pull-left">' +
        '            <em class="fa fa-navicon fa-fw"></em>' +
        '         </a>' +
        '      </div>' +
        '   </div>' +
        '   <!-- END navbar header-->' +
        '   <!-- START Nav wrapper-->' +
        '   <div uib-collapse="header.headerMenuCollapsed" class="nav-wrapper collapse navbar-collapse">' +
        '      <!-- START Left navbar-->' +
        '      <ul class="nav navbar-nav">' +
        '         <li><a href="#/">Back</a>' +
        '         </li>' +
        '         <li uib-dropdown="" class="dropdown"><a href="" uib-dropdown-toggle="" class="dropdown-toggle">Dropdown</a>' +
        '            <!-- START Dropdown menu-->' +
        '            <ul class="dropdown-menu">' +
        '               <!-- START list item-->' +
        '               <li><a href="">Sub menu 1</a>' +
        '               </li>' +
        '               <li><a href="">Sub menu 2</a>' +
        '               </li>' +
        '               <li><a href="">Sub menu 3</a>' +
        '               </li>' +
        '            </ul>' +
        '         </li>' +
        '      </ul>' +
        '      <!-- END Left navbar-->' +
        '   </div>' +
        '</nav>' +
        '<!-- END Top Navbar-->');


    $templateCache.put("templates/top-navbar.html", '<!-- START Top Navbar-->' +
        '<nav role="navigation" ng-controller="HeaderNavController as header" class="navbar topnavbar">' +
        '    <!-- START navbar header-->' +
        '    <div class="navbar-header">' +
        '        <a ui-sref="app.dashboard" class="navbar-brand">' +
        '            <img src="app/img/UAEMC_BW_logo.png" alt="App Logo" class="brand-logo" style="max-height:48px !important; filter: brightness(0) invert(1);margin-left:-18px;" />' +
        '        </a>' +
        '        <!-- Mobile buttons-->' +
        '        <div class="mobile-toggles">' +
        '            <!-- Button to show/hide the sidebar on mobile. Visible on mobile only.-->' +
        '            <a href="" ng-click="app.sidebar.isOffscreen = !app.sidebar.isOffscreen" class="sidebar-toggle">' +
        '                <em class="fa fa-navicon"></em>' +
        '            </a>' +
        '            <!-- Button to show/hide the header menu on mobile. Visible on mobile only.-->' +
        '            <a href="" ng-click="header.toggleHeaderMenu()" class="menu-toggle hidden-material">' +
        '                <em class="fa fa-ellipsis-v fa-fw"></em>' +
        '            </a>' +
        '        </div>' +
        '    </div>' +
        '    <!-- END navbar header-->' +
        '    <!-- START Nav wrapper-->' +
        '    <div uib-collapse="header.headerMenuCollapsed" class="nav-wrapper collapse navbar-collapse">' +
        '        <!-- START Left navbar-->' +
        '        <ul class="nav navbar-nav hidden-material">' +
        '            <li>' +
        '                <!-- Button used to collapse the left sidebar. Only visible on tablet and desktops-->' +
        '                <a href="" ng-click="app.sidebar.isOffscreen = !app.sidebar.isOffscreen" class="hidden-xs">' +
        '                    <em ng-class="app.sidebar.isOffscreen ? \'fa-caret-right\':\'fa-caret-left\'" class="fa"></em>' +
        '                </a>' +
        '            </li>' +
        '            <!-- START profile screen-->' +
        '            <li>' +
        '                <a ui-sref="app.profile" title="{{\'navbar.profile\' | translate}}" ripple="" style="padding-top: 16px; padding-bottom: 13px">' +
        '                    <img class="media-object img-circle thumb40" src="{{header.user.userPhotoUrl}}" />' +
        '                    <span class="visible-xs-inline ml" data-translate="navbar.profile"></span>' +
        '                </a>' +
        '            </li>' +
        '            <!-- END profile screen-->' +
        '            <li>' +
        '                <a title="Profile" ripple=""><em>{{header.user.firstName}} {{header.user.lastName}}</em></a>' +
        '            </li>' +
        '        </ul>' +
        '        <!-- END Left navbar-->' +
        '        <!-- START Right navbar-->' +
        '        <ul class="nav navbar-nav hidden-material pull-right">' +
        '           <!--START Tour--> ' +
        '            <li>' +
        '                <a ng-click="header.startTour()" title="{{\'navbar.tour\' | translate}}" ripple="">' +
        '                    <em class="fa fa-info fa-fw"></em>' +
        '                    <span class="visible-xs-inline ml" data-translate="navbar.tour"></span>' +
        '                </a>' +
        '            </li>' +
        '            <!-- END Tour-->' +
        '            <!-- START Readspeaker-->' +
        '            <li>' +
        '               <a accesskey="L" title="اَستمعُ إلى هذه الصفحةِ مستخدما" href="//app-as.readspeaker.com/cgi-bin/rsent?customerid=9104&lang=ar_ar&readid=MyReadSpeakerArea&url=https://eservices.uaemc.gov.ae/#/app/dashboard" onclick="readpage(this.href, \'xp1\'); return false;">' +
        '                   <em class="fa fa-volume-up fa-fw"></em>' +
        '                   <span class="visible-xs-inline ml" data-translate="navbar.tour"></span>' +
        '               </a>' +
        '            </li>' +
        '            <!-- END Readspeaker-->' +
        '            <!-- START log out screen-->' +
        '            <li>' +
        '                <a ng-click="header.logOut()" title="{{\'navbar.signOut\' | translate}}" ripple="">' +
        '                    <em class="fa fa-sign-out fa-fw"></em>' +
        '                    <span class="visible-xs-inline ml" data-translate="navbar.signOut"></span>' +
        '                </a>' +
        '            </li>' +
        '            <!-- END log out screen-->' +
        '        </ul>' +
        '        <!-- END Right navbar-->' +
        '    </div>' +
        '    <!-- END Nav wrapper-->' +
        '</nav>' +
        '<!-- END Top Navbar-->');
}]);