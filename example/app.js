var app = angular.module('TabHideDemo', ['ui.bootstrap', 'ui.tab.hide']);

app.config(function(hideableTabsetConfigProvider) {
    hideableTabsetConfigProvider.setShowTooltips (true);
});

app.controller('MainCtrl', function() {
    var vm = this;
    vm.tabs = [];
    vm.hideTabsApi = {};

    vm.doUpdate = function() {
        if (vm.hideTabsApi.doUpdate) {
            vm.hideTabsApi.doUpdate();
        }
    };

    vm.addTab = function(){
        vm.tabs.push({
            heading: 'New Tab ' + vm.tabs.length,
            content: 'This is the content for a NEW tab ' + vm.tabs.length,
            active: true
        });
    };

    vm.removeTab = function(){
        vm.tabs.splice(vm.tabs.length - 1, 1);
    };

    for(var i=0; i<15; i++) {
        vm.tabs.push({
          heading: 'Tab ' + i,
          content: 'This is the content for tab ' + i
        });
    }

});
