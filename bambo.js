/*!
BamboJS

Description : Light javascript module builder
Author : Christophe Rubeck
Version : 1.2
Date : 2018 march 11
See : https://github.com/Christux/BamboJS
*//*

Description :
-------------

	The library is designed for modules building thanks to dependency injection.
	A module is therefore a singleton (instanciate once).
	Dependency modules are automatiquely instanciated.

	After module instanciation, the boot sequence is launched.
	All $init are run (see module template), then all $build, then all $final.


Usage :
-------

	- module(name, constructor, loadOnStartup)
		name: string
		constructor: function that returns an object
		loadOnStartup: boolean, default true

	- forEach(array, callback)
		array: array or object (loop on properties)
		callback: function that loops ont all elements

	- isString(item)
	- isObject(item)
	- isArray(item)
	- isFunction(item)
	- isBoolean(item)
	- isNumber(item)
	- isUndefinedOrNull(item)


Module template :
-----------------

	bambo.module(['dep1','dep2', function(dep1, dep2) {

		return {
			$init: function() {
			},
			$build: ['dep3', function(dep3) {
			}],
			$final: function() {
			},
			method1: function() {
			},
			method2: function() {
			},
			etc.
		};
	}]);

	$init, $build and $final methods are optional.

*/


(function(context){
	'use strict';

	if(context.hasOwnProperty('bambo'))
		throw new Error('Library BamboJS is already loaded !');
	else
		context.bambo = createBamboCore();

	//////////////////// BAMBO ///////////////////////////////////////
	function createBamboCore() {

		var injector = createInjector();

		return (function() {

			/*
			 * Register internal modules
			 */			
			injector.register('$http', createHttpModule);
			injector.register('$scroll', createScrollModule);
			injector.register('$observer', createObserverModule);
			injector.register('$location', createLocationModule);
			injector.register('$flux', createFluxModule);
			injector.register('$konami', createKonami);

			/*
			* Initialize all sub-object
			*/
			var init = execStep("$init");
			var build = execStep("$build");
			var final = execStep("$final");

			/*
			* Waits until all module constructors are loaded before to init
			*/
			window.addEventListener(
					"load",
					(function () {
						return function () {
							// Load statups module and their dependencies
							instanciate();

							// Module boot sequence
							init();
							build();
							final();
						};
					})(),
					false);

			return this;
			
		}).call({
			module: function(name, constructor, loadOnStartup) {

				if (!isString(name) || name === '')
					throw new Error('Module name must be a string');

				injector.register(name, constructor, isBoolean(loadOnStartup) ? loadOnStartup : true);
				
				return this;
			},
			isString: isString,
			isObject: isObject,
			isArray: isArray,
			isFunction: isFunction,
			isBoolean: isBoolean,
			isNumber: isNumber,
			isUndefinedOrNull: isUndefinedOrNull, 
			forEach: forEach
		});

		//------------------------------------------------------------------------

		function instanciate() {
			injector.forEachModules(function(module){
				if(module.loadOnStartup()) {
					module.getInstance();
				}
			});
		}

		function execStep(step) {
			return function () {
				injector.forEachModules(function(module){
					
					if (module.isInstanciated()){
						var obj = module.getInstance();
						
						if(obj.hasOwnProperty(step)) {
							injector.resolve(obj[step]);
						}
					}
				});
			};
		}
	}

	/////////////////////// Utils ///////////////////////////////////////////
	function isObject(val) {
		return (typeof val === 'object' && !Array.isArray(val) && val !== null);
	}

	function isArray(val) {
		return Array.isArray(val);
	}

	function isString(val) {
		return typeof val === 'string';
	}

	function isFunction(val) {
		return typeof val === 'function';
	}

	function isBoolean(val) {
		return typeof val === 'boolean';
	}

	function isNumber(val) {
		return typeof val === 'number';
	}

	function isUndefinedOrNull(val) {
		return typeof val === 'undefined' || val === null;
	}

	function forEach(array,callback) {

		if(!isObject(array) && !isArray(array)) {
			throw new Error('First parameter must be an array or an object');
		}

		if(!isFunction(callback)) {
			throw new Error('Second parameter must be a function');
		}

		if(isArray(array)) {
			for(var i=0, l=array.length; i<l; i++) {
				callback(array[i],i);
			}
		}

		if(isObject(array)) {
			var i=0;
			for(var pptName in array) {
				if(array.hasOwnProperty(pptName)) {
					callback(array[pptName],i++);
				}
			}
		}
	}

	///////////////// INJECTOR //////////////////////////
	function createInjector() {
		
		var modules = {};

		return (function () {

			/*
			 * Registration of itself
			 */

			modules['$injector'] = createSingleton('$injector',null,false,this);
			
			return this;

		}).call({

			/*
			 * Public methods
			 */

			register: function (name, constructor, loadOnStartup) {
				addModule(name, createSingleton(name, constructor, loadOnStartup || false));
			},
			resolve: function (func, deps, extDependencies) {
				return resolve(func, deps, modules, extDependencies, 0);
			},
			forEachModules: function(callback) {
				
				forEach(modules, function(module){
					callback.apply(this, [module]);
				});
			}
		});

		//-----------------------------------------------------------

		function createSingleton(name, constructor, loadOnStartup, instance) {

			var instance = instance || undefined;

			return {
				getInstance: function(recursionLevel) {

					if(!isInstanciated()){
						instance = instanciate(recursionLevel);
					}
					return instance;
				},
				isInstanciated: function() {
					return isInstanciated();
				},
				loadOnStartup: function() {
					return loadOnStartup;
				}
			};

			//-----------------------------
			function isInstanciated() {
				return isObject(instance);
			}

			function instanciate(recursionLevel) {

				var recursionLevel = isNumber(recursionLevel) ? recursionLevel + 1 : 0;
				
				var obj = resolve(constructor, [], modules, {}, recursionLevel);

				if (!isObject(obj)) {
					throw new Error('Module ' + name + ' constructor is not correctly defined, it must return an object');
				}

				return obj;
			}
		}

		function addModule(name, obj) {

			if (modules.hasOwnProperty(name)) {
				throw new Error('Module ' + name + ' is already registered');
			}

			modules[name] = obj;
		}

		function resolve(func, deps, intDependencies, extDependencies, recursionLevel) {

			// Avoid infinite loop in module instanciation
			if(recursionLevel > 1000)
				throw new Error('Loop in module dependencies detected');

			// Array format
			if (isArray(func)) {
				var array = func;
				var func = array[array.length-1];
				var deps = array.slice(0,array.length-1);

				if(!isFunction(func)) 
					throw new Error('Last element must be a function');
			}
			else {
				var deps = deps || [];

				if(func.hasOwnProperty('$inject')) {

					deps = func.$inject;

					if(!isArray(deps))
						throw new Error('$inject parameter must be an array');
				}
			}

			if(!isFunction(func)) 
					throw new Error('First element must be a function');

			if(!isArray(deps))
					throw new Error('Dependency parameter must be an array of strings');

			return factory(func, getModules(deps, intDependencies || {}, extDependencies || {}, recursionLevel));
		}


		function getModules(deps, intDependencies, extDependencies, recursionLevel) {
			var mods = [];

			forEach(deps, function (dep) {

				if(!isString(dep))
					throw new Error('Dependency must be a string');

				if (intDependencies.hasOwnProperty(dep)) {
					mods.push(intDependencies[dep].getInstance(recursionLevel));
				} else {
					if (extDependencies.hasOwnProperty(dep)) {
						mods.push(extDependencies[dep]);
					} else {
						throw new Error('Dependency module ' + dep + ' not found !');
					}
				}
			});
			return mods;
		}

		function factory(func, mods) {
			return func.apply(this, mods);
		}
	}

	/////////////// SCROLL /////////////////////////////
	function createScrollModule() {

		return (function () {

			var self = createObserver(this);

			/*
			* Listen to change scroll event
			*/
			window.addEventListener(
				"scroll",
				(function () {
					return function () {
						self.notifyAll(get());
					};
				})(),
				false);
	
			return this;
		}).call({
			set: set,
			get: get,
			reset: reset
		});

		//----------------------------------------------

		function set(position) {
			window.document.body.scrollTop = position;
			window.document.documentElement.scrollTop = position;
		}

		function get() {
			return window.pageYOffset;
		}

		function reset() {
			set(0);
		}
	}

	//////////////////// OBSERVER //////////////////////////
	function createObserverModule() {

		return {
			create: createObserver
		}
	}

	function createObserver(obj) {

		var actionHandlers = [];

		return (function(){

			this.registerHandler = registerHandler;
			this.unregisterHandler = unregisterHandler;
			this.notifyAll = notifyAll;

			return this;
		})
		.call(obj || {});

		//---------------------------------------------

		function registerHandler(handler) {
            
            if (isFunction(handler)) {
                actionHandlers.push(handler);
			}
			else {
				throw new Error('Handler must be a function');
			}
		}
		
		function unregisterHandler(handler) {
            
            if (isFunction(handler)) {
                actionHandlers = actionHandlers.filter(function(hl){
					return hl !== handler;
				});
			}
			else {
				throw new Error('Handler must be a function');
			}
		}

		function notifyAll() {
			var args = arguments;

        	forEach(actionHandlers, function (ah) {
                if (isFunction(ah)) {
                    ah.apply(this, args);
                }
            });
		}
	}

	/////////////////////// LOCATION ///////////////////////////////////
	function createLocationModule() {

		return (function () {

			var self = createObserver(this);

			/*
			* Listen to change scroll event
			*/
			window.addEventListener(
				"hashchange",
				(function () {
					return function () {
						self.notifyAll(getAnchor());
					};
				})(),
				false);
	
			return this;

		}).call({
			getAnchor: getAnchor,
			get: getAnchor
		});

		//-----------------------------------------------------
		
		function getAnchor() {
			return window.location.hash.split('#')[1];
		}
	}

	/////////////////////// HTTP ///////////////////////////////////
	function createHttpModule() {
			
		return {
			get: function (url) {

				if(!isString(url))
					throw new Error('Url must be a string');

				return createXhrBuilder('GET', url, null);
			},
			post: function (url, obj) {

				if(!isString(url))
					throw new Error('Url must be a string');

				return createXhrBuilder('POST', url, obj);
			}
		};
	}

	function createXhrBuilder(verb, url, obj) {

		var xhr = new XMLHttpRequest();
		var success, error, timeout;
		var obj = obj || null;

		return (function() {
			
			xhr.onreadystatechange = function () {

				if (xhr.readyState === xhr.DONE) {
					if (xhr.status === 200) {
						if (success) {
							if (isFunction(success)) {
								success(xhr.responseText);
							}
						}
					} else {
						if (error) {
							if (isFunction(error)) {
								error(xhr.status + " " + xhr.statusText);
							}
						}
					}
				}
			};
	
			xhr.onerror = function (e) {
				if (error) {
					if (isFunction(error)) {
						error(e.error);
					}
				}
			};
	
			xhr.ontimeout = function (e) {
				if(timeout) {
					if(isFunction(timeout)) {
						timeout(e);
					}
				}
			};

			return this;

		}).call({
			success: function (callback) {
				success = callback;
				return this;
			},
			error: function (callback) {
				error = callback;
				return this;
			},
			timeout: function(callback) {
				timeout = callback;
				return this;
			},
			setTimeout: function(delay) {
				xhr.timeout = delay;
				return this;
			},
			send: function() {
				xhr.open(verb, url, true);
				xhr.send(obj);
			}
        });
	}
	
	/////////////////// FLUX ///////////////////////////////////////////
	function createFluxModule() {

		var actionHandlers = {};

		return (function(){

			return this;

		}).call({
			registerHandler: function(action, handler) {
				registerAction(action);
				actionHandlers[action].registerHandler(handler);
			},
			unregisterHandler: function(action, handler) {

				if(isActionRegistered(action)) {
					actionHandlers[action].unregisterHandler(handler);
				}
			},
			notifyAll: function(action) {
				
				if(isActionRegistered(action)) {
					actionHandlers[action].notifyAll();
				}
			},
			isActionRegistered: function(action) {
				isActionString(action);
				return actionHandlers.hasOwnProperty(action);
			},
			registerAction: function(action) {
				registerAction(action);
			}
		});

		//---------------------------------------------------------
		function isActionRegistered(action) {

			isActionString(action);

			var exists = actionHandlers.hasOwnProperty(action);

			if(!exists)
				throw new Error('Action '+action+' does not exist !');
				 
			return exists;
		}

		function registerAction(action) {
			isActionString(action);
			if(!actionHandlers.hasOwnProperty(action)) {
				actionHandlers[action] = createObserver();
			}
		}

		function isActionString(action) {
			if(!isString(action))
				throw new Error('Action parameter must be a string !');
		}
	}

	//////////////// KONAMI ////////////////////////////////////////////
	function createKonami() {

		var pattern = "38384040373937396665";
		var input = "";
		var observer = createObserver();
		var timer = null;

		return (function(){

			document.addEventListener("keydown", keydownHandler);

			return this;
			})
			.call({
				registerHandler: observer.registerHandler,
				unregisterHandler: observer.unregisterHandler
			});

		// ----------------------------------------------------
		function keydownHandler (e) {
			clearTimeout(timer);

			input += e ? e.keyCode : event.keyCode;

			timer = setTimeout(cleanup, 1000);

			if (input.length > pattern.length) {
				input = input.substr((input.length - pattern.length));
			}

			if (input === pattern) {
				console.log("Konami activated");
				observer.notifyAll();
				cleanup();
				e.preventDefault();
			}
		}

		function cleanup() {
			clearTimeout(timer);
			input = '';
		}
	}


})(this);