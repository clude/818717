/**
 * Created with PyCharm.
 * User: zhuclude
 * Date: 9/8/13
 * Time: 11:18 PM
 * To change this template use File | Settings | File Templates.
 */

angular.module('b1b.controllers.console', []).
    controller('PVRPTCtrl',['$scope','B1BHttp',function($scope, B1BHttp){
        $scope.results = [];

        $scope.search = function(){
            var post_data = {};
            B1BHttp.get('/api/integration/rpt_pv/', { params: post_data }).success(function(rst){
                $scope.results = rst.data;
            });
        };

        $scope.search();
    }])
;
