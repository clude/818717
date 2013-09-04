angular.module('818717', ['ui.bootstrap']).
  config(['$routeProvider', function($routeProvider) {

  }]).
  config(['$locationProvider', function($locationProvider) {
    $locationProvider.html5Mode(true);
  }]);

var TabsCtrl = function ($scope, $http) {
  var websites = [{ title: 'python'}];

  $http.get('/search/query/上海/').success(function(data){
      $scope.groups = [];
      angular.forEach(data.result, function(row) {
        var resource = angular.fromJson(row[2]);
        resource.id = row[0];
        resource.hit_count = row[1];
        $scope.groups.push(resource);
      });
  });
};