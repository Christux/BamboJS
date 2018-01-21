(function(){
	'use strict';

	var flux = {};

	bambo.module('test-flux', ['$flux', test]);

	function test($flux) {
		flux = $flux;
		return {};
	}

	describe("Flux Module", function(){

		var i=0;
		var callback = function() {
			return ++i;
		};

		it("Flux creation", function() {
			expect(flux.hasOwnProperty('notifyAll')).toBe(true);
			expect(flux.hasOwnProperty('registerHandler')).toBe(true);
			expect(flux.hasOwnProperty('registerAction')).toBe(true);
			expect(flux.hasOwnProperty('isActionRegistered')).toBe(true);
		});

		it("Flux handler registration", function(){

			expect(function(){
				return flux.registerHandler('coucou');
			})
			.toThrowError('Handler must be a function');

			expect(function(){
				return flux.registerHandler({});
			})
			.toThrowError('Action parameter must be a string !');
		});

		it("Flux notification", function() {

			flux.registerHandler('flux', callback);

			expect(i).toBe(0);
			flux.notifyAll('flux');
			expect(i).toBe(1);

			expect(function(){
				return flux.notifyAll('bambo');
			})
			.toThrowError('Action bambo does not exist !');
		});
		
	});

})();