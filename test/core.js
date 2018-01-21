(function(){
	'use strict';

	describe("BamboJS", function() {
	  
		it("BamboJS loading", function() {
		  expect(window.hasOwnProperty('bambo')).toBe(true);
		});

		it("BamboJS module", function() {
		  expect(bambo.hasOwnProperty('module')).toBe(true);
		});
	
		it("Define module with wrong name format", function() {

			expect(function(){
				return bambo.module({}, function(){});
			})
			.toThrowError('Module name must be a string');
		});

		it("isObject", function() {
			expect(bambo.isObject({})).toBe(true);
			expect(bambo.isObject('hello')).toBe(false);
			expect(bambo.isObject(null)).toBe(false);
			expect(bambo.isObject(['bob','joe'])).toBe(false);
			expect(bambo.isObject(4)).toBe(false);
			expect(bambo.isObject(function(){})).toBe(false);
			expect(bambo.isObject(true)).toBe(false);
		});

		it("isArray", function() {
			expect(bambo.isArray({})).toBe(false);
			expect(bambo.isArray('hello')).toBe(false);
			expect(bambo.isArray(null)).toBe(false);
			expect(bambo.isArray(['bob','joe'])).toBe(true);
			expect(bambo.isArray(4)).toBe(false);
			expect(bambo.isArray(function(){})).toBe(false);
			expect(bambo.isArray(true)).toBe(false);
		});

		it("isString", function() {
			expect(bambo.isString({})).toBe(false);
			expect(bambo.isString('hello')).toBe(true);
			expect(bambo.isString(null)).toBe(false);
			expect(bambo.isString(['bob','joe'])).toBe(false);
			expect(bambo.isString(4)).toBe(false);
			expect(bambo.isString(function(){})).toBe(false);
			expect(bambo.isString(true)).toBe(false);
		});

		it("isFunction", function() {
			expect(bambo.isFunction({})).toBe(false);
			expect(bambo.isFunction('hello')).toBe(false);
			expect(bambo.isFunction(null)).toBe(false);
			expect(bambo.isFunction(['bob','joe'])).toBe(false);
			expect(bambo.isFunction(4)).toBe(false);
			expect(bambo.isFunction(function(){})).toBe(true);
			expect(bambo.isFunction(true)).toBe(false);
		});

		it("isBoolean", function() {
			expect(bambo.isBoolean({})).toBe(false);
			expect(bambo.isBoolean('true')).toBe(false);
			expect(bambo.isBoolean(null)).toBe(false);
			expect(bambo.isBoolean(['bob','joe'])).toBe(false);
			expect(bambo.isBoolean(4)).toBe(false);
			expect(bambo.isBoolean(function(){})).toBe(false);
			expect(bambo.isBoolean(true)).toBe(true);
		});

		it("isNumber", function() {
			expect(bambo.isNumber({})).toBe(false);
			expect(bambo.isNumber('true')).toBe(false);
			expect(bambo.isNumber(null)).toBe(false);
			expect(bambo.isNumber(['bob','joe'])).toBe(false);
			expect(bambo.isNumber(4)).toBe(true);
			expect(bambo.isNumber(function(){})).toBe(false);
			expect(bambo.isNumber(true)).toBe(false);
		});

		it("forEach", function() {
			expect(function() {
				return bambo.forEach('hello');
			}).toThrowError("First parameter must be an array or an object");

			expect(function() {
				return bambo.forEach(['bob','joe'],{});
			}).toThrowError('Second parameter must be a function');

			var result = [];
			bambo.forEach(['bob','joe'], function(val, idx){
				result[idx] = val;
			});

			expect(result[0]).toBe('bob');
			expect(result[1]).toBe('joe');
		});
	
	});

}());