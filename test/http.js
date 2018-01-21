(function(){
	'use strict';

	var http;

	bambo.module('test-http', ['$http', test]);

	function test($http) {
		http = $http;
		return {};
	}

	describe("HTTP Module", function(){

		it("Module creation", function() {
			expect(http.hasOwnProperty('get')).toBe(true);
			expect(http.hasOwnProperty('post')).toBe(true);
		});

		it("Wrong url type", function() {
			expect(function(){
				return http.get({});
			})
			.toThrowError('Url must be a string');
		})

		describe("HTTP Request", function(){
			var value;

			beforeEach(function(done) {
	
				http.get('resource.json')
				.success(function(data) {
					value = JSON.parse(data);
					done();
				})
				.send();
			});

			it("Get resource", function(done){
				expect(value.lamp).toBe(true);
				expect(value.window).toBe(false);
				done();
			});
		});

		describe("HTTP Request with wrong url", function(){
			var value;

			beforeEach(function(done) {
	
				http.get('toto.json')
				.success(function(data){
					value = false;
					done();
				})
				.error(function(err) {
					value = true;
					done();
				})
				.send();
			});

			it("Get resource", function(done){
				expect(value).toBe(true);
				done();
			});
		});

	});

})();