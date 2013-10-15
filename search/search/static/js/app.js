
'use strict';

window.b1b = window.b1b | {}

// This is a placeholder, the real template cache will be built later
// or, in the dev mode, just load from /static/partials directly.
angular.module('templates-partials', []);

angular.module('b1b', ['ui.bootstrap', 'b1b.filters', 'b1b.services', 'b1b.directives', 'b1b.controllers', 'b1b.controllers.console']).
    provider('newVersion', function () {
        var get = function (url) {
            return url + '?v=' + (b1b.version || '');
        };
        this.$get = function () {
            return get;
        };
        this.get = get;
    }).
    config(['$routeProvider', '$locationProvider', 'newVersionProvider',
        function($routeProvider, newVersionProvider) {
            $routeProvider.
                when('/', {templateUrl: '/static/partials/search.html', controller: 'SearchCtrl'}).
                when('/group/:group_hash', { templateUrl:'/static/partials/group.html', controller: 'GroupCtrl'}).
                when('/console/rpt/pv', {templateUrl: '/static/partials/rpt_pv.html', controller: 'PVRPTCtrl'}).
                otherwise({redirectTo: '/'});
            ;
        }]).
    config(['$locationProvider', function($locationProvider) {
        $locationProvider.html5Mode(true);
    }])
;



