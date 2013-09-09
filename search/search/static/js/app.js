/**
 * Created with PyCharm.
 * User: zhuclude
 * Date: 9/7/13
 * Time: 4:06 PM
 * To change this template use File | Settings | File Templates.
 */
'use strict';
// register global value niUtil
if(window.b1b){

} else{
    window.b1b = {};
}
//window.ni = ni || {};

angular.module('b1b', ['ui.bootstrap', 'b1b.filters', 'b1b.services', 'b1b.directives', 'b1b.controllers', 'b1b.controllers.console']).
    provider('newVersion', function () {
        var get = function (url) {
            return url + '?v=' + (ni.version || '');
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
                when('/console/rpt/pv', {templateUrl: '/static/partials/rpt_pv.html', controller: 'PVRPTCtrl'}).
                otherwise({redirectTo: '/'});
            ;
        }]).
    config(['$locationProvider', function($locationProvider) {
        $locationProvider.html5Mode(true);
    }])
;



