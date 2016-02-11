angular.module('ui.tab.hide', [])
    .provider('hideableTabsetConfig', function() {
       //the default options
        var defaultConfig = {
          showTooltips: true,
        };

        var config = angular.extend({}, defaultConfig);

        return {
          setShowTooltips : function(value) {
            config.showTooltips = value;
          },
          $get: function() {
            return {
                showTooltips: config.showTooltips
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
                        '<div class="btn-group" uib-dropdown>',
                        '<button type="button" class="btn" uib-dropdown-toggle></button>',
                        '<ul class="dropdown-menu dropdown-menu-right" role="menu" aria-labelledby="single-button">',
                          '<li role="menuitem" ng-repeat="tab in dropdownTabs" ng-class="{\'disabled\': tab.disabled}" ng-click="activateTab(tab)">',
                            '<a href><span class="dropDownTabActiveMark" ng-style="{\'visibility\': tab.active?\'visible\':\'hidden\'}"></span>{{tab.title}}</a>',
                          '</li>',
                        '</ul>',
                        '</div>',
                      '</div>'].join(''),
            link: function($scope, $element) {
                $scope.dropdownTabs = [];
                $scope.isDropDownOpen = false;
                $scope.hideDropDown = false;

                $scope.api = {
                    doUpdate: function() {
                        $timeout(function() {
                            $scope.update()
                        });
                    }
                };

                $scope.onWindowResize = function() {
                    $scope.update();
                    
                    // DEBUG
                    console.log('resized..');
                };

                $scope.update = function() {
                    var allTabs = $scope.tabContainer.querySelectorAll('li');
                    var totalWidth = $scope.tabContainer.offsetWidth;
                    var calcWidth = 0;
                    angular.forEach(allTabs, function (tab) {
                        
                        calcWidth+= tab.offsetWidth;
                        
                        var tabEl = angular.element(tab);
                        
                        if (calcWidth >= totalWidth) {
                           // tabEl.hide();
                        } else {
                            //tabEl.show();
                        }
                    });
                        
                    // DEBUG
                    console.log('do update..');
                };

                $scope.init = function() {
                    $scope.tabContainer = $element[0].querySelector('.spacer ul.nav-tabs');
                    if (!$scope.tabContainer) return;

                    // populate drop down list
                    var allTabs = $scope.tabContainer.querySelectorAll('li');
                    angular.forEach(allTabs, function (tab) {
                        var tabScope = angular.element(tab).isolateScope();
                            tabScope.title = tabScope.headingElement.textContent;
                        
                        //push new field to use as title in the drop down.
                        $scope.dropdownTabs.push(tabScope);
                    });
                    
                    
                    var tabsetElement = angular.element($element[0].querySelector('.spacer div'));
                    $scope.$watchCollection(
                        function () {
                            return tabsetElement.isolateScope() ? tabsetElement.isolateScope().tabs : false;
                        },
                        function () {
                            $timeout(function () {
                                $scope.update();
                            });    
                        }
                    );

                    // attaching event to window resize.
                    angular.element($window).on('resize', $scope.onWindowResize);
                    
                    // DEBUG
                    console.log('init...');
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