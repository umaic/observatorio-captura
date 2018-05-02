module.exports = [
    '$scope',
    'Authentication',
    function (
        $scope,
        Authentication
    ) {
        function run(Authentication) {
            Authentication.handleAuthentication();
        }
    }];
