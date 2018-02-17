(function(){
	'use strict';

	var $injector = {};

	bambo.module('test-injector', ['$injector', test]);

	function test(injector) {
		$injector = injector;
		return {};
	}

	describe("Injector", function(){
		
		it("Resolve generic with deps array", function() {

			$injector.resolve(extractObserver, ['$http','$observer']);

			function extractObserver($thhp, $observer) {
				expect($observer.hasOwnProperty('create')).toBe(true);
			}
		});

		it("Resolve generic with wrong deps array", function() {

			expect(function(){
				return $injector.resolve(extractObserver, '$observer');
			})
			.toThrowError('Dependency parameter must be an array of strings');

			function extractObserver() {
			}
		});

		it("Resolve with not string deps format", function() {

			expect(function(){
				return $injector.resolve(extractObserver, ['$observer', {}]);
			})
			.toThrowError('Dependency must be a string');

			function extractObserver() {
			}
		});

		it("Resolve with $inject", function() {

			extractObserver.$inject = ['$observer'];

			$injector.resolve(extractObserver);

			function extractObserver($observer) {
				expect($observer.hasOwnProperty('create')).toBe(true);
			}
		});

		it("Resolve with $inject and deps array", function() {

			extractObserver.$inject = ['$observer'];

			$injector.resolve(extractObserver, ['$location']);

			function extractObserver($observer) {
				expect($observer.hasOwnProperty('create')).toBe(true);
			}
		});

		it("Resolve with wrong $inject", function() {

			extractObserver.$inject = '$observer';

			expect(function(){
				return $injector.resolve(extractObserver);
			})
			.toThrowError('$inject parameter must be an array');

			function extractObserver() {
			}
		});

		it("Resolve in array format", function() {

			$injector.resolve(['$observer', extractObserver]);

			function extractObserver($observer) {
				expect($observer.hasOwnProperty('create')).toBe(true);
			}
		});

		it("Resolve in wrong array format", function() {

			
			expect(function(){
				return $injector.resolve([extractObserver,'$observer']);;
			})
			.toThrowError('Last element must be a function');

			function extractObserver() {
			}
		});

		it("Resolve with external dependencies", function() {

			var ext = {
				$$moon: {version: '3.0'}
			};

			$injector.resolve(extractObserver, ['$observer', '$$moon'], ext);

			function extractObserver($observer, $moon) {
				expect($moon.version).toBe('3.0');
			}
		});

		it("Resolve with wrong external dependencies", function() {

			var ext = {};

			expect(function(){
				return $injector.resolve(extractObserver, ['$observer', '$$moon'], ext);
			})
			.toThrowError('Dependency module ' + '$$moon' + ' not found !');

			function extractObserver() {
			}
		});

		it("Resolve with multiple dependency levels", function() {

			$injector.register('Level1', ['Level2', function(obj){
				return obj;
			}]);
			$injector.register('Level2', ['Level3', function(obj){
				return {
					color: obj.color,
					price: 9.90
				};
			}]);
			$injector.register('Level3', function(){
				return {
					color: 'red'
				};
			});

			expect($injector.resolve(getColor,['Level1'])).toBe('red');
			expect($injector.resolve(getPrice,['Level2'])).toBe(9.90);
			expect($injector.resolve(getPrice,['Level3'])).toBe(undefined);

			function getColor(obj){
				return obj.color;
			}

			function getPrice(obj) {
				return obj.price;
			}
		});

		it("Resolve with infinite dependency loop", function() {

			$injector.register('foo', ['bar', function(){}]);
			$injector.register('bar', ['foo', function(){}]);

			expect(function(){
				return $injector.resolve(function(){}, ['foo']);
			})
			.toThrowError('Loop in module dependencies detected');
		});

		it("Define module with wrong constructor", function() {

			bambo.module('wrong', function(){return true;});

			expect(function(){
				return $injector.resolve(function(){}, ['wrong']);
			})
			.toThrowError('Module wrong constructor is not correctly defined, it must return an object');
		});

	});

})();