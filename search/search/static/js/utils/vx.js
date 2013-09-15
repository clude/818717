/**
 * Created with IntelliJ IDEA.
 * User: zhuclude
 * Date: 7/4/13
 * Time: 3:11 PM
 * To change this template use File | Settings | File Templates.
 */


;(function() {
    // Baseline setup
    // --------------

    // Establish the root object, `window` in the browser, or `global` on the server.
    var root = this;

//    var vx = function(obj) {
//        if (obj instanceof _) return obj;
//        if (!(this instanceof _)) return new _(obj);
//        this._wrapped = obj;
//    };

    var vx = { version: '1.0'};

    if(root._){
        var _ = root._;
    }else{
        if (typeof exports !== 'undefined') {
            _ = require('underscore');
        }
    }

    // Export the vx object for **Node.js**, with
    // backwards-compatibility for the old `require()` API. If we're in
    // the browser, add `VX` as a global object via a string identifier,
    // for Closure Compiler "advanced" mode.
    if (typeof exports !== 'undefined') {
        if (typeof module !== 'undefined' && module.exports) {
            exports = module.exports = vx;
        }
        exports.VX = vx;
    } else {
        root.VX = vx;
    }

    vx.hasProp = function(obj, prop) {
        return Object.prototype.hasOwnProperty.call(obj, prop);
    };

    /*
     * isCopyAll: when true, do not check the target property, copy all values from source even when the target do not have the property
     *            when false or null, need to check whether the target has the same property
     * */
    vx.copyProps = function(target, source, isCopyAll){
        isCopyAll = isCopyAll || false;
        if(target && source){
            for(var p in source){
                // p is method
                if(typeof(source[p])=="function"){
                    // do nothing
                }else{
                    if(isCopyAll) {
                        target[p] = source[p];
                    } else{
                        if(vx.hasProp(target, p)){
                            target[p] = source[p];
                        }
                    }
                }
            }
        }
    };

    vx.inherit = function(parent, protoProps, staticProps) {
        var child;

        // The constructor function for the new subclass is either defined by you
        // (the "constructor" property in your `extend` definition), or defaulted
        // by us to simply call the parent's constructor.
        if (protoProps && protoProps.hasOwnProperty('constructor')) {
            child = protoProps.constructor;
        } else {
            child = function(){ parent.apply(this, arguments); };
        }

        // Inherit class (static) properties from parent.
        _.extend(child, parent);

        // Set the prototype chain to inherit from `parent`, without calling
        // `parent`'s constructor function.
        function ctor() {}
        ctor.prototype = parent.prototype;
        child.prototype = new ctor();

        // Add prototype properties (instance properties) to the subclass,
        // if supplied.
        if (protoProps) _.extend(child.prototype, protoProps);

        // Add static properties to the constructor function, if supplied.
        if (staticProps) _.extend(child, staticProps);

        // Correctly set child's `prototype.constructor`.
        child.prototype.constructor = child;

        // Set a convenience property in case the parent's prototype is needed later.
        child.__super__ = parent.prototype;

        return child;
    };

    vx.classExtends = function(protoProps, classProps) {
        return vx.inherit(this, protoProps, classProps);
    };

    vx.format = function() {
        if (arguments.length == 0)
            return null;

        var str = arguments[0];
        for (var i = 1; i < arguments.length; i++) {
            var re = new RegExp('\\{' + (i - 1) + '\\}', 'gm');
            str = str.replace(re, arguments[i]);
        }
        return str;
    };

    vx.getPropertyValueList = function(sources, propName){
        var results = [];
        if(sources){
            for(var k in sources){
                var v = sources[k][propName];
                if(v){
                    results.push(v);
                }
            }
        }
        return results;
    };

    vx.format_friendly_date = function (date) {
        var time = (new Date().getTime()-date)/1000;
        if (time < 60) return Math.floor(time)+'秒前';
        time /= 60;
        if (time < 60) return Math.floor(time)+'分前';
        time /= 60;
        if (time < 24) return Math.floor(time)+'小时前';
        time /= 24;
        if (time < 7) return Math.floor(time)+'天前';
        time /= 7;
        return Math.floor(time)+'周前';
    };

    vx.ui = {
        // depend on blockUI plugin
        showWaiting: function(selector, isShow, opts) {
            var messageHtml = "<img alt='Waiting..' src='" + "/static/images/img_loading_bar.gif' />";
            var defaultOpts = {
                message: messageHtml,
                css: {
                    cursor: "default",
                    border: 'none',
                    opacity: 1,
                    backgroundColor: 'transparent'
                },
                overlayCSS: { opacity: 0.1, backgroundColor: '#eee' },
                showOverlay: true,
                fadeIn: 0
            }
            var newOpts = jQuery.extend({}, defaultOpts, opts);
            // show full waiting
            if (selector == null) {
                if (isShow) {
                    jQuery.blockUI(newOpts);
                } else {
                    jQuery.unblockUI({ fadeOut: 0 });
                }
            } else {
                // show waiting on element
                // var selector = '#' + id;
                newOpts.css.top = '48%';
                newOpts.css.left = '48%';

                if (isShow) {
                    jQuery(selector).block(newOpts);
                } else {
                    jQuery(selector).unblock();
                }
            }
        },

        showMessageAutoClose: function(message) {
            var opts = {
                message: message,
                css: {
                    cursor: "default",
                    border: '1px solid #3985c0',
                    padding: '15px',
                    width: '20%',
                    left: '40%',
                    opacity:.5,
                    'border-radius': '6px',
                    color: '#fff',
                    backgroundColor: '#4A96D0'
                },
                overlayCSS: { opacity: 0.0, backgroundColor: '#eee' },
                showOverlay: true,
                fadeIn: 300,
                timeout: 1000
            };

            vx.ui.showWaiting(null, true, opts);
        }
    }


}).call(this);

