(function(){
	'use strict';

	var scroll;

	bambo.module('test-scroll', ['$scroll', test]);

	function test($scroll) {
		scroll = $scroll;
		return {};
	}

	describe('Scroll Module',function(){

		it("Module creation", function() {
			expect(scroll.hasOwnProperty('get')).toBe(true);
			expect(scroll.hasOwnProperty('reset')).toBe(true);
		});

		it('Get value',function(){
			expect(scroll.get()).toBe(0);
		});

	});

})();