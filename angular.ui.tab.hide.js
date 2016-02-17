angular.module('ui.tab.hide', [])
    .provider('hideableTabsetConfig', function() {
       //the default options
        var defaultConfig = {
        };

        var config = angular.extend({}, defaultConfig);

        return {
          $get: function() {
            return {
            };
          }
        };
    })

    .directive('hideableTabset', function (hideableTabsetConfig, $window, $timeout) {
        return {
            restrict: 'AE',
            transclude: true,
            scope: {
                api: '=?'
            },
            template: ['<div class="ui-tabs-hideable">',
                        '<div class="spacer" ng-transclude></div>',
                        '<div class="btn-group" uib-dropdown ng-hide="hideDropDown">',
                            '<button type="button" class="btn" uib-dropdown-toggle></button>',
                            '<ul class="dropdown-menu dropdown-menu-right" role="menu" aria-labelledby="single-button">',
                              '<li role="menuitem" ng-repeat="tab in dropdownTabs" ng-click="activateTab(tab)">',
                                '<a href><span class="dropDownTabActiveMark" ng-style="{\'visibility\': tab.active?\'visible\':\'hidden\'}"></span>{{tab.title}}</a>',
                              '</li>',
                            '</ul>',
                        '</div>',
                      '</div>'].join(''),
            link: function($scope, $element, $attrs, $controller) {
                $scope.dropdownTabs = [];
                $scope.hideDropDown = true;

                $scope.api = {
                    doUpdate: function() {
                        $timeout(function() {
                            $scope.reCalc();
                        });
                    }
                };
                
                var winResizeTimeout;

                $scope.onWindowResize = function() {
                      // delay to avoid running lots of times
                      clearTimeout(winResizeTimeout);
                      winResizeTimeout = setTimeout(function() {
                        $scope.reCalc();
                        $scope.$apply();
                      }, 250);
                };
                
                $scope.activateTab = function(tab) {
                    if (tab.disabled) return;
                    tab.active = true;

                    $timeout(function () {
                        $scope.reCalc();
                    });
                }

                $scope.reCalc = function() {
                    var visibleWidth = $scope.tabContainer.offsetWidth;
                    var allTabs = $scope.tabContainer.querySelectorAll('li');

                    var activeTab = angular.element($scope.tabContainer.querySelector('li.active'));
                        activeTab.css("visibility", "visible");
                    
                    // calculate total tabset width
                    var calcWidth = 0;
                    angular.forEach(allTabs, function (tab) {
                        var tabEl = angular.element(tab);
                            tabEl.css("display", "table-cell");

                        calcWidth+= tabEl.width();
                    });
                    
                    if (calcWidth > visibleWidth) {
                        $scope.hideDropDown = false;

                        // shrink the visible width to respect drop down width
                        visibleWidth = visibleWidth - 25;
                    } else {
                        $scope.hideDropDown = true;
                    }

                    // shrink the visible width to respect active tab width
                    visibleWidth = visibleWidth - activeTab.width();

                    calcWidth = 0;
                    angular.forEach(allTabs, function (tab) {
                        var tabEl = angular.element(tab);
                        if (!tabEl.hasClass("active")) {
                            calcWidth+= tabEl.width();
                        }

                        // hide tabs overlaps visible width
                        if (calcWidth > visibleWidth) {
                            if (!tabEl.hasClass("active")) {
                                tabEl.css("visibility", "hidden");
                                tabEl.css("display", "none");
                            }
                        } else {
                            tabEl.css("visibility", "visible");
                            tabEl.css("display", "table-cell");
                        }
                    });
                };

                $scope.populateDropdown = function() {
                     var allTabs = $scope.tabContainer.querySelectorAll('li');

                     $scope.dropdownTabs = [];

                     angular.forEach(allTabs, function (tab) {
                         var tabEl = angular.element(tab);

                         // push new field to use as title in the drop down
                         var tabScope = tabEl.isolateScope();
                            tabScope.title = tabScope.headingElement.textContent;
                         $scope.dropdownTabs.push(tabScope);
                    });
                 };

                $scope.init = function() {
                    $scope.tabContainer = $element[0].querySelector('.spacer ul.nav-tabs');
                    if (!$scope.tabContainer) return;
                    
                    var tabsetElement = angular.element($element[0].querySelector('.spacer div'));
                    $scope.$watchCollection(
                        function () {
                            return tabsetElement.isolateScope() ? tabsetElement.isolateScope().tabs : false;
                        },
                        function () {
                            $timeout(function () {
                                $scope.populateDropdown();
                                $scope.reCalc();
                            });    
                        }
                    );

                    // attaching event to window resize.
                    angular.element($window).on('resize', $scope.onWindowResize);
                };

                // init only once (and make sure DOM is rendered)
                $timeout(function() {
                    $scope.init();
                });

                // when scope destroyed
                $scope.$on('$destroy', function () {
                    angular.element($window).off('resize', $scope.onWindowResize);
                });
            }
        };
});