/**
 * Created with PyCharm.
 * User: zhuclude
 * Date: 9/7/13
 * Time: 3:01 PM
 * To change this template use File | Settings | File Templates.
 */

'use strict';

/* Controllers */
angular.module('b1b.controllers', []).
    controller('NavCtrl',['$scope','SearchService' ,'UserService', 'Dialogs' ,function($scope, SearchService, UserService, Dialogs){
        $scope.user = null;
        $scope.newUser = false;

        $scope.openLoginDialog = function(){
            $scope.newUser = false;
            Dialogs.login();
        };

        $scope.openFeedbackDialog = function(){
            Dialogs.feedback();
        };

        $scope.logout = function(){
            UserService.logout();
        };

        $scope.$on('user_changed', function(event, data){
            $scope.user = data;
        });


    }]).
    controller('FilterCtrl',['$scope','SearchService' ,function($scope, SearchService){
        $scope.models = ['热轧', '冷轧', '热镀锌', '酸洗', '取向电工钢', '无取向电工钢', '电镀锌', '彩涂', '镀锌', '镀铝锌', '轧硬卷', '镀铬'];
        $scope.cities = ['上海', '北京', '天津', '南京', '无锡', '杭州', '济南', '西安', '武汉', '广州', '成都', '重庆'];
        $scope.producers = ['宝钢', '马钢', '鞍钢', '本钢', '舞钢', '南钢', '首钢', '邯郸', '通钢', '武钢', '沙钢', '唐钢', '日钢', '太钢', '柳钢', '天钢', '安钢'];
        $scope.filters = [[],[],[]];

        $scope.filters_to_query = function(filters) {
            var filterQuery = [];
            for (var i in $scope.filters)   {
                var subFilters = $scope.filters[i];
                if (subFilters.length > 0)  {
                    filterQuery.push('('+subFilters.join(')|(')+')')
                }
            }
            return filterQuery.join(' ');
        };

        $scope.select_filter = function(filter, index) {
            var filters = $scope.filters[index];

            var i = _.indexOf(filters, filter);
            if (i == -1)    {
                filters.push(filter);
            }
            else {
                filters.splice(i, 1);
            }
            SearchService.param('query', $scope.filters_to_query($scope.filters));
            SearchService.param('page', 0);
            SearchService.search();

        };

        $scope.clear_filters = function()   {
            $scope.filters = [[],[],[]];
            SearchService.param('query', $scope.filters_to_query($scope.filters));
            SearchService.param('page', 0);
            SearchService.search();
        };

        $scope.search = function(query)  {
            SearchService.param('query', query);
            SearchService.param('page', 0);
            SearchService.search();
        };

    }]).
    controller('SearchCtrl',['$scope','$routeParams', 'SearchService', 'Dialogs' ,function($scope, $routeParams, SearchService, Dialogs){

        $scope.modes = [
            { text: '活跃', sort: 0, arrow_up:false, is_selected: true },
            { text: '更新', sort: 1, arrow_up:false, is_selected: false },
            { text: '价格', sort: 2, arrow_up:true, is_selected: false }
        ];

        $scope.group_details = {};
        if ($routeParams['query']) SearchService.param('query', $routeParams['query']);
        if ($routeParams['sort']) SearchService.param('sort', $routeParams['sort']);
        if ($routeParams['page']) SearchService.param('page', parseInt($routeParams['page']));

        $scope.sort = function(sort_mode)  {
            for(var k in $scope.modes){
                $scope.modes[k].is_selected = false;
            }
            sort_mode.is_selected = true;

            SearchService.param('sort', sort_mode.sort);
            SearchService.param('page', 0);
            SearchService.search();
        };

        $scope.expand = function(group_hash)  {
            if ($scope.group_details[group_hash]) {
                delete $scope.group_details[group_hash];
            }
            else {
                SearchService.detail(group_hash);
            }
        };

        $scope.paging = function(page)  {
            SearchService.param('page', page);
            SearchService.search();
        };

        $scope.page_class = function(page)  {
            if (page<0 || page>$scope.total_pages-1) return 'disabled';
            if (page == $scope.current_page) return 'active';
        };

        $scope.open_detail = function(steel){
            Dialogs.detail(steel);
        };

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
                try {
                    var group = angular.fromJson(row[0]);
                    group.sort_by = row[1];
                    $scope.groups.push(group);
                } catch (e) {
                }
            });
        });

        $scope.$on('detail result', function(event, data) {
            var details = [];
            angular.forEach(data.result, function(row){
                try {
                  var resource = angular.fromJson(row[0]);
                  details.push(resource);
                } catch(e) {
                }
            });
            $scope.group_details[data.group_hash] = details;
        });

        SearchService.search();

    }]).
    controller('AuthDialogCtrl',['$scope', 'dialog', 'UserService', function($scope, dialog, UserService){
        var REGULATION = /^[1][3-8]\d{9}$/;
        $scope.cell = null;
        $scope.close = function(){
            dialog.close();

        };
        $scope.login = function(credential, password){
            if (REGULATION.test(credential)) {
                UserService.login(credential,password);
                dialog.close("ok");
            }
            else
                $scope.validateMsg = '请输入正确格式的手机号码';
        };
        $scope.register = function(credential, email, password){
            if (REGULATION.test(credential)) {
                UserService.register(credential,email,password)
                dialog.close("ok");
            }
            else
                $scope.validateMsg = '请输入正确格式的手机号码';
        };
        $scope.make_feedback = function(feedback)   {
            UserService.feedback(feedback).success(function(){
                dialog.close();
            });
        };
    }]).
    controller('DetailDialogCtrl',['$scope', 'dialog', 'UserService','APIIntegration', 'steel', function($scope, dialog, UserService, APIIntegration, steel){
        $scope.steel_selected = steel;
        $scope.stage = 0;

        $scope.step = function(next)    {
            if ($scope.stage == 4)  {
                $scope.fdc_buy(steel, $scope.buyer_cell, $scope.seller_cell)
            }
            else    {
                $scope.stage = next ? $scope.stage + 1 : $scope.stage - 1;
            }
        };

        $scope.refresh = function(steel){
            $scope.steel_selected = steel;
            $scope.seller_cell = steel.cell_raw;

            $scope.user = UserService.get_current_user();
            if ($scope.user)    {
                $scope.buyer_cell = $scope.user.name;
            }
        };

        $scope.buying = false;
        $scope.buy_text = function() {
            return $scope.buying ? '正在下单中...' : '下一步';
        }

        $scope.fdc_buy = function(steel, buyer_cell, seller_cell) {
            $scope.buying = true;
            APIIntegration
                .fdc_buy(steel, buyer_cell, seller_cell)
                .success(function(data){
                    if (data.status == 1) {
                        alert('下单成功, 请等待短信提示');
                    }
                    else    {
                        alert('下单失败:' + data.message);
                    }
                    $scope.close();
                    $scope.buying = false;
                })
                .error(function(data){
                    alert('下单失败');
                    $scope.close();
                    $scope.buying = false;
                });
        };

        $scope.refresh($scope.steel_selected);

        $scope.close = function()   {
            dialog.close();
        }
    }])
;

