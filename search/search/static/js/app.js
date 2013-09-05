
function timestamp_from_now(input) {
  var time = (new Date().getTime()-input)/1000;
  if (time < 60) return Math.floor(time)+'秒';
  time /= 60;
  if (time < 60) return Math.floor(time)+'分';
  time /= 60;
  if (time < 24) return Math.floor(time)+'小时';
  time /= 24;
  if (time < 7) return Math.floor(time)+'天';
  time /= 7;
  return Math.floor(time)+'周';
}

function price_text(input)  {
  return (parseFloat(input)>88888) ? '电议' : input;
}

angular.module('818717', ['ui.bootstrap', 'search']).
  config(['$routeProvider', function($routeProvider) {
    $routeProvider.
      when('/', {templateUrl: 'static/partials/search.html', controller: SearchCtrl}).
      otherwise({redirectTo: '/'});
  }]).
  config(['$locationProvider', function($locationProvider) {
    $locationProvider.html5Mode(true);
  }]).
  filter('from_now', function() { return timestamp_from_now; }).
  filter('price', function(){ return price_text; }).
  filter('sort_by_text', function(SearchService){
    return function(input)  {
      var sort = SearchService.param('sort');
      if (sort == 0) return input;
      if (sort == 1) return timestamp_from_now(input);
      if (sort == 2) return price_text(input);
    };
  });

function NavCtrl($scope, SearchService)  {
  $scope.modes = [
    { text: '活跃', sort: 0 },
    { text: '更新', sort: 1 },
    { text: '价格', sort: 2 }
  ];

  $scope.sort = function(sort_mode)  {
    SearchService.param('sort', sort_mode);
    SearchService.param('page', 0);
    SearchService.search();
  };

  $scope.search = function(query)  {
    SearchService.param('query', query);
    SearchService.param('page', 0);
    SearchService.search();
  };
  
  function load_params()  {
    $scope.params = {
      query: SearchService.param('query'),
      sort_mode: $scope.modes[SearchService.param('sort')]
    };
  };

  load_params();

  $scope.$on('search params', function(event, data) {
    load_params();
  });
}