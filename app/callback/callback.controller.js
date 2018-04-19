var app = angular.module('app', []);
app.controller('CallbackController', function($scope, Authentication) {
	function run(Authentication) {
	   Authentication.handleAuthentication();
	}
});