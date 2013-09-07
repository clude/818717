
angular.
  module('search', []).
  factory('SearchService', function($http, $rootScope){
    var params = {
      query: '',
      sort: 0,
      page: 0
    };
    return {
      param: function(name, value)  {
        if (value === undefined) return params[name];
        var old_value = params[name];
        if (value === null) {
          delete params[name];
          $rootScope.$broadcast('search params', params);
          return old_value;
        }
        params[name] = value;
        if (value != old_value) {
          $rootScope.$broadcast('search params', params);
        }
        return value;
      },
      search: function()  {
        $http.get('/search/query/', { params: params }).success(function(data){
          console.log('searching:', params);
          $rootScope.$broadcast('search result', data);
        });
      },
      detail: function(group_hash)  {
        $http.get('/search/detail/'+group_hash+'/', { params: params }).success(function(data){
          $rootScope.$broadcast('detail result', { group_hash: group_hash , result: data.result });
        });
      }
    }
  }).
  controller('SearchCtrl', function($scope, $routeParams, SearchService) {
    $scope.group_details = {};
    if ($routeParams['query']) SearchService.param('query', $routeParams['query']);
    if ($routeParams['sort']) SearchService.param('sort', $routeParams['sort']);
    if ($routeParams['page']) SearchService.param('page', parseInt($routeParams['page']));

    $scope.expand = function(group_hash)  {
      if ($scope.group_details[group_hash]) {
        delete $scope.group_details[group_hash];
      }
      else {
        SearchService.detail(group_hash);
      }
    };

    $scope.paging = function(page)  {
      console.log(111);
      SearchService.param('page', page);
      SearchService.search();
    };

    $scope.page_class = function(page)  {
      if (page<0 || page>$scope.total_pages-1) return 'disabled';
      if (page == $scope.current_page) return 'active';
    };

    $scope.sort_text = function() {
      var sort = SearchService.param('sort');
      if (sort==0) return '活跃';
      if (sort==1) return '更新';
      if (sort==2) return '价格';
    }

    $scope.$on('search result', function(event, data) {
      $scope.pages = [];
      $scope.total_amount = data.meta[1][1];
      $scope.current_page = SearchService.param('page');
      $scope.total_pages = Math.ceil($scope.total_amount/20);
      for (var i=$scope.current_page-5; i<=$scope.current_page+5; ++i) {
        if (i<0 || i >$scope.total_pages-1) continue;
        $scope.pages.push(i);
      }

      $scope.groups = [];
      angular.forEach(data.result, function(row) {
        var group = angular.fromJson(row[0]);
        group.sort_by = row[1];
        $scope.groups.push(group);
      });
    });

    $scope.$on('detail result', function(event, data) {
      var details = [];
      angular.forEach(data.result, function(row){
        var resource = angular.fromJson(row[0]);
        details.push(resource);
      });
      $scope.group_details[data.group_hash] = details;
    });

    SearchService.search();
  });

