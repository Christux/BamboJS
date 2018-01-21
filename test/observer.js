(function(){
	'use strict';

	var observer = {};

	bambo.module('test-observer', ['$observer', test]);

	function test($observer) {
		observer = $observer.create();
		return {};
	}

	describe("Observer Module", function(){

		var i=0;
		var callback = function() {
			return ++i;
		};

		it("Observer creation", function() {
			expect(observer.hasOwnProperty('notifyAll')).toBe(true);
			expect(observer.hasOwnProperty('registerHandler')).toBe(true);
		});

		it("Obserser handler registration", function(){

			expect(function(){
				return observer.registerHandler('coucou');
			})
			.toThrowError('Handler must be a function');

			expect(function(){
				return observer.registerHandler([]);
			})
			.toThrowError('Handler must be a function');

			expect(function(){
				return observer.registerHandler(function(){});
			})
			.not.toThrowError('Handler must be a function');
		});
		
		it("Observer notification", function() {

			observer.registerHandler(callback);

			expect(i).toBe(0);
			observer.notifyAll();
			expect(i).toBe(1);
		});

	});

})();