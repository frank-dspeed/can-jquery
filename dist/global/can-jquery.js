/*[global-shim-start]*/
(function(exports, global, doEval){ // jshint ignore:line
	var origDefine = global.define;

	var get = function(name){
		var parts = name.split("."),
			cur = global,
			i;
		for(i = 0 ; i < parts.length; i++){
			if(!cur) {
				break;
			}
			cur = cur[parts[i]];
		}
		return cur;
	};
	var modules = (global.define && global.define.modules) ||
		(global._define && global._define.modules) || {};
	var ourDefine = global.define = function(moduleName, deps, callback){
		var module;
		if(typeof deps === "function") {
			callback = deps;
			deps = [];
		}
		var args = [],
			i;
		for(i =0; i < deps.length; i++) {
			args.push( exports[deps[i]] ? get(exports[deps[i]]) : ( modules[deps[i]] || get(deps[i]) )  );
		}
		// CJS has no dependencies but 3 callback arguments
		if(!deps.length && callback.length) {
			module = { exports: {} };
			var require = function(name) {
				return exports[name] ? get(exports[name]) : modules[name];
			};
			args.push(require, module.exports, module);
		}
		// Babel uses the exports and module object.
		else if(!args[0] && deps[0] === "exports") {
			module = { exports: {} };
			args[0] = module.exports;
			if(deps[1] === "module") {
				args[1] = module;
			}
		} else if(!args[0] && deps[0] === "module") {
			args[0] = { id: moduleName };
		}

		global.define = origDefine;
		var result = callback ? callback.apply(null, args) : undefined;
		global.define = ourDefine;

		// Favor CJS module.exports over the return value
		modules[moduleName] = module && module.exports ? module.exports : result;
	};
	global.define.orig = origDefine;
	global.define.modules = modules;
	global.define.amd = true;
	ourDefine("@loader", [], function(){
		// shim for @@global-helpers
		var noop = function(){};
		return {
			get: function(){
				return { prepareGlobal: noop, retrieveGlobal: noop };
			},
			global: global,
			__exec: function(__load){
				doEval(__load.source, global);
			}
		};
	});
}
)({},window,function(__$source__, __$global__) { // jshint ignore:line
	eval("(function() { " + __$source__ + " \n }).call(__$global__);");
}
)
/*can-jquery@3.0.0-pre.3#can-jquery*/
define('can-jquery', function (require, exports, module) {
    var $ = require('jquery');
    var ns = require('can-util/namespace');
    var domEvents = require('can-util/dom/events/events');
    var domData = require('can-util/dom/data/data');
    module.exports = ns.$ = $;
    var inSpecial = false;
    var EVENT_HANDLER = 'can-jquery.eventHandler';
    var DELEGATE_HANDLER = 'can-jquery.delegateHandler';
    var slice = Array.prototype.slice;
    var addEventListener = domEvents.addEventListener;
    domEvents.addEventListener = function (event, callback) {
        if (!inSpecial) {
            var handler = function (ev) {
                ev.eventArguments = slice.call(arguments, 1);
                return callback.apply(this, arguments);
            };
            domData.set.call(callback, EVENT_HANDLER, handler);
            $(this).on(event, handler);
        }
        return addEventListener.apply(this, arguments);
    };
    var removeEventListener = domEvents.removeEventListener;
    domEvents.removeEventListener = function (event, callback) {
        if (!inSpecial) {
            var eventHandler = domData.get.call(callback, EVENT_HANDLER);
            if (eventHandler) {
                domData.clean.call(callback, EVENT_HANDLER);
            }
            $(this).off(event, callback);
        }
        return removeEventListener.apply(this, arguments);
    };
    var addDelegateListener = domEvents.addDelegateListener;
    domEvents.addDelegateListener = function (type, selector, callback) {
        var handler = function (ev) {
            if (ev instanceof $.Event && ev.eventArguments) {
                var args = [ev].concat(ev.eventArguments);
                return callback.apply(this, args);
            }
            return callback.apply(this, arguments);
        };
        domData.set.call(callback, DELEGATE_HANDLER, handler);
        return addDelegateListener.call(this, type, selector, handler);
    };
    var removeDelegateListener = domEvents.removeDelegateListener;
    domEvents.removeDelegateListener = function (type, selector, callback) {
        var handler = domData.get.call(callback, DELEGATE_HANDLER);
        if (handler) {
            domData.clean.call(callback, DELEGATE_HANDLER);
        }
        return removeDelegateListener.apply(this, arguments);
    };
    function withSpecial(callback) {
        return function () {
            inSpecial = true;
            callback.apply(this, arguments);
            inSpecial = false;
        };
    }
    function setupSpecialEvent(eventName) {
        var handler = function () {
            $(this).trigger(eventName);
        };
        $.event.special[eventName] = {
            setup: withSpecial(function () {
                domEvents.addEventListener.call(this, eventName, handler);
            }),
            teardown: withSpecial(function () {
                domEvents.removeEventListener.call(this, eventName, handler);
            })
        };
    }
    [
        'inserted',
        'removed',
        'attributes'
    ].forEach(setupSpecialEvent);
});
/*[global-shim-end]*/
(function(){ // jshint ignore:line
	window._define = window.define;
	window.define = window.define.orig;
}
)();