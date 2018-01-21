# BamboJS

Light javascript module builder
Copyright (C) 2018 Christux

## Description

The library is designed for modules building thanks to dependency injection.
A module is therefore a singleton (instanciate once).
Dependency modules are automatiquely instanciated.

After module instanciation, the boot sequence is launched.
All $init are run (see module template), then all $build, then all $final.


## Usage

- module(name, constructor, loadOnStartup)
	* name: string
	* constructor: function that returns an object
	* loadOnStartup: boolean, default true

- forEach(array, callback)
	* array: array or object (loop on properties)
	* callback: function that loops ont all elements

- isString(item)
- isObject(item)
- isArray(item)
- isFunction(item)
- isBoolean(item)
- isNumber(item)


## Module template
```
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
```
$init, $build and $final methods are optional.


## License :

This projected is licensed under the terms of the LGPL