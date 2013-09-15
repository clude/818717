/**
 * Created with PyCharm.
 * User: zhuclude
 * Date: 9/7/13
 * Time: 3:01 PM
 * To change this template use File | Settings | File Templates.
 */

angular.module('b1b.directives', [])
    .directive('bibpopover', function ($parse, $compile,$timeout,$http,$templateCache,$q) {

        var templateBase = "<div>{{popoverContent}}</div>";

        return {
            restrict: 'A',
            //transclude: true,
            //scope: { popoverContent: '@'},
            link: function (scope, element, attrs) {

                // it is not a good approach, make sure the values is fixed string value (not dynamicly from scope)
                // if we directly read the attrs values instead of using $observe
                var popPlacement = attrs.popoverPlacement || 'right';
                var popTitle = attrs.popoverTitle || '';

                //scope.contentMsg = "fasdfasdfafa";

                attrs.$observe('popoverTemplate', function(templateUrl){
                    var templatePromise;
                    if(templateUrl){
                        templatePromise = $http.get(templateUrl, {cache:$templateCache})
                            .then(function(response) { return response.data; });
                    }else{
                        templatePromise = $q.when(templateBase);
                    }

                    templatePromise.then(function(template){
                        //var popover = $compile( template )( scope);
                        var popover = template;
                        element.popover(
                            {content:
                                function(){
                                    $timeout(function(){
                                        $compile( element.data('bs.popover').tip() )( scope);
                                    },50);
                                    return popover;
                                },
                                html :true,
                                animation: false,
                                placement: popPlacement,
                                title: popTitle
                            }
                        );
                    })

                })

                scope.popoverCloseMe = function(v){
                   element.data('bs.popover').tip().remove();
                   element.popover('hide');
                };

            }
        }

    })
;
