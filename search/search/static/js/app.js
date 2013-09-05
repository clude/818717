angular.module('818717', ['ui.bootstrap']).
  config(['$routeProvider', function($routeProvider) {

  }]).
  config(['$locationProvider', function($locationProvider) {
    $locationProvider.html5Mode(true);
  }]);

var TabsCtrl = function ($scope, $http) {
  var websites = [{ title: 'python'}];

  $http.
    get('/search/query/', {
      params: { 
        query: 'spcc',
        sort: 0,
        page: 0,
      }
    }).
    success(function(data){
      $scope.groups = [];
      angular.forEach(data.result, function(row) {
        var resource = angular.fromJson(row[0]);
        resource.sort_by = row[1];
        $scope.groups.push(resource);
      });
  });
};