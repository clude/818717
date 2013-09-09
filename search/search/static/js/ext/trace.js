/**
 * Created with PyCharm.
 * User: zhuclude
 * Date: 9/8/13
 * Time: 10:23 PM
 * To change this template use File | Settings | File Templates.
 */

;(function() {
    // Baseline setup
    // --------------
    var trace = {
        version: '0.1'
    }

    trace.traceEvent = function(type, funcName, funcContent){
        jQuery.get("/api/integration/trace/", { type: type, fn: funcName, fc: funcContent} );
    }

    // Establish the root object, `window` in the browser, or `global` on the server.
    var root = this;

    root.trace = trace;

    jQuery(document).ready(function(){
        // send a page loaded logger to backend
        trace.traceEvent(1, 'page', window.location.href);

        // apply click trace event on the dom element which has attribute "trc_f", trc_f should be in
        // format "$type,$name,$content"
        jQuery("[trc_f]").live('click', function(e){
            var $e = $(this);
            var tc = $e.attr('trc_f');

            try{
                var tcArr = tc.split(',');
                trace.traceEvent(tcArr[0], tcArr[1], tcArr[2]);
            }catch(e){
                // pass
            }
        })
    })

}).call(this);
