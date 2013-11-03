/**
 * Created with PyCharm.
 * User: zhuclude
 * Date: 9/7/13
 * Time: 3:01 PM
 * To change this template use File | Settings | File Templates.
 */
angular.module('b1b.services', []).
    factory('B1BHttp', ['$http','$q', function ($http,$q) {
        return {
            sendRequest: function(options){
                var deferred = $q.defer(),
                    promise = deferred.promise;

                promise.success = function(fn) {
                    promise.then(function(result) {
                        fn(result);
                    });
                    return promise;
                };

                promise.error = function(fn) {
                    promise.then(null, function(result) {
                        fn(result);
                    });
                    return promise;
                };

                var config = {
                    method:         'GET',
                    url:            '',
                    params:         null,
                    data:           null,
                    headers:        null,
                    successFn:      null,
                    errorFn:        null,
                    waitingElement: null,
                    isNeedShowWaiting: true
                };
                var opt = angular.extend(config, options);

                if(opt.waitingElement != null) opt.isNeedShowWaiting = true;

                // TODO: show block on waitingElement
                if(opt.isNeedShowWaiting ) VX.ui.showWaiting(opt.waitingElement, true);

                $http(
                    {
                        method:     opt.method,
                        url:        opt.url,
                        params:     opt.params,
                        data:       opt.data,
                        headers:    opt.headers
                    }
                ).
                success(function(data, status, headers, config) {
                    // TODO: hide block on waitingElement
                    if(opt.isNeedShowWaiting ) VX.ui.showWaiting(opt.waitingElement, false);
                    deferred.resolve(data);
                    //if(data.status == 1){
                    //    deferred.resolve(data);
                    //}else{
                    //    deferred.reject(data);
                    //}
                }).
                error(function(data, status, headers, config) {
                    // TODO: hide block on waitingElement
                    if(opt.isNeedShowWaiting ) VX.ui.showWaiting(opt.waitingElement, false);
                    deferred.reject(data);
                });

                return promise;
            },

            post: function(url, options){
                options = options || {};
                var defaultOpt = {
                    method: 'POST',
                    url: url
                }
                var opt = angular.extend(options, defaultOpt);
                return this.sendRequest(opt);
            },

            get: function(url, options){
                options = options || {};
                var defaultOpt = {
                    method: 'GET',
                    url: url
                }
                var opt = angular.extend(options, defaultOpt);
                return this.sendRequest(opt);
            }
        };
    }]).
    factory('SearchService', ['B1BHttp','$rootScope',function(B1BHttp, $rootScope){
        var params = {
            query: '',
            sort: 0,
            page: 0
        };
        return {

            param: function(name, value)  {
                if (name === undefined && value === undefined) return params;
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
            search: function(opts)  {
                var searchOpts = angular.extend({}, opts, {params: params});
                B1BHttp.get('/search/query/', searchOpts).success(function(data){
                    //console.log('searching:', params);
                    $rootScope.$broadcast('search result', data);
                });
            },
            detail: function(store_raw, opts)  {
                var searchOpts = angular.extend({}, opts, {params: params});
                B1BHttp.get('/search/detail/'+store_raw+'/', searchOpts).success(function(data){
                    $rootScope.$broadcast('detail result', { store_raw: store_raw , result: data.result });
                });
            }
        }
    }]).
    factory('UserService', ['B1BHttp','$rootScope',function(B1BHttp, $rootScope){
        var user = null;

        function refresh_user(data) {
            if (data) {
                user = data;
            }
            else {
                user = null;
            }
            $rootScope.$broadcast('user_changed', user);
        }

        //api.get_auth_user().success(refresh_user);

        var rst = {
            get_current_user: function(){
                return user;
            },

            get_authed_user: function(){
                return B1BHttp.get('/api/auth/autheduser/')
                    .success(function(rst){
                        refresh_user(rst.data);
                    })
            },

            login: function(credential, password){
                var postData = {credential:credential, password:password}
                return B1BHttp.get('/api/auth/login/', { params: postData })
                    .success(function(rst){
                        refresh_user(rst.data);
                        if(rst.status == 0){  //TODO, need to move this logic to B1BHttp
                            alert(rst.message);
                        }
                    })
                    .error(function(rst){
                        alert(rst.message);
                    });
            },

            register: function(cell, password)   {
                var postData = {credential:cell, password:password}
                return B1BHttp.get('/api/auth/register/', { params: postData })
                    .success(function(rst){
                        refresh_user(rst.data);
                        if(rst.status == 0){  //TODO, need to move this logic to B1BHttp
                            alert(rst.message);
                        }
                    })
                    .error(function(rst){
                        alert(rst.message);
                    });
            },

            logout: function()  {
                return B1BHttp.get('/api/auth/logout/')
                    .success(function(data){
                        refresh_user();
                    });
            },

            feedback: function(feedback)  {
                var postData = {fb:feedback}
                return B1BHttp.get('/api/auth/feedback/', { params: postData });
            }
        };

        // init load for get authed user ( not a good implement, need to move it to backend)
        rst.get_authed_user();

        return rst;
    }]).
    factory('APIIntegration', ['B1BHttp',function(B1BHttp){
        var rst = {
            fdc_buy: function(steel, buyer_cell, seller_cell){
                var data = angular.copy(steel);
                data.buyer_cell = buyer_cell;
                data.seller_cell = seller_cell;
                return B1BHttp.post('/api/integration/fdc_buy/', { data: data });
            },

            correct_error: function(posts){
                var data = angular.copy(posts);
                return B1BHttp.post('/api/integration/correct_error/', { data: data });
            }
        };

        return rst;
    }])
    .factory('Dialogs', ['$dialog','UserService',function($dialog, UserService){
        var opened_dialogs = [];
        var current_dialog = $dialog.dialog();
        var auth_dialog = $dialog.dialog({
            templateUrl: '/static/partials/modal_login.html',
            controller: 'AuthDialogCtrl'
        });

        var auth_closed = function(result)  {
            if (result) {
                current_dialog.open().then(dialog_closed);
            }
            else if (opened_dialogs.length > 0)  {
                current_dialog = opened_dialogs.pop();
                current_dialog.open().then(dialog_closed);
            }
        };

        var dialog_closed = function(result)    {
            if (result && result.open_child)    {
                if (!result.replace) {
                    opened_dialogs.push(current_dialog);
                }
                current_dialog = $dialog.dialog(result.open_child);
                if (result.auth && !User.get_current_user())    {
                    auth_dialog.open().then(auth_closed);
                }
                else {
                    current_dialog.open().then(dialog_closed);
                }
            }
            else if (opened_dialogs.length > 0)  {
                current_dialog = opened_dialogs.pop();
                current_dialog.open().then(dialog_closed);
            }
        };

        var open = function(options, auth, replace)    {
            if (current_dialog.isOpen())   {
                current_dialog.close({open_child: options, auth: auth, replace: replace});
            }
            else {
                current_dialog = $dialog.dialog(options);
                if (auth && !UserService.get_current_user()){
                    auth_dialog.open().then(auth_closed);
                }
                else {
                    current_dialog.open().then(dialog_closed);
                }
            }
        };

        return {
            'login': function() {
                open({
                    dialogClass: 'modal dialog_auth',
                    templateUrl: '/static/partials/modal_login.html',
                    controller: 'AuthDialogCtrl'
                });
            },
            'feedback': function(){
                open({
                    dialogClass: 'modal dialog_auth',
                    templateUrl: '/static/partials/modal_feedback.html',
                    controller: 'AuthDialogCtrl'
                });
            },
            'detail': function(steel){
                open({
                    dialogClass: 'modal dialog_detail',
                    resolve: {steel: function(){ return angular.copy(steel); }},
                    templateUrl: '/static/partials/modal_detail.html?1=1',
                    controller: 'DetailDialogCtrl'
                }, false, true);
            },
            'fdc': function(steel)  {
                open({
                    dialogClass: 'modal dialog_fdc',
                    resolve: {steel: function() {return angular.copy(steel); }},
                    templateUrl: '/static/partials/modal_fdc.html',
                    controller: 'DetailDialogCtrl'
                });
            },
            'close': function(){
                current_dialog.close();
            }
        };
    }])
;
