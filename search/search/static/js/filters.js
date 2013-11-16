/**
 * Created with PyCharm.
 * User: zhuclude
 * Date: 9/7/13
 * Time: 3:01 PM
 * To change this template use File | Settings | File Templates.
 */
angular.module('b1b.filters', []).
    filter('from_now', function() {
        return function(input) {
            return VX.format_friendly_date(input);
        };
    }).
    filter('price',['$filter', function($filter){
        return function(input) {
            var v = parseFloat(input);
            if(v == 0){
                return "---";
            }else{
                return (v>88888) ? '电议' : $filter('number')(v,0); //TODO
            }
        };
    }]).
    filter('hideusername', function(){
        return function(input,res)  {
            if (input) {
                return input.slice(0,4) + res + input.slice(7);
            }
        }
    })
;