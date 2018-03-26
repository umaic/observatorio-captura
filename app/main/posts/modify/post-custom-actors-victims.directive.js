module.exports = PostCustomActorsVictims;

PostCustomActorsVictims.$inject = [];

function PostCustomActorsVictims() {
    return {
        restrict: 'E',
        scope: {
            form: '='
        },
        template: require('./custom-actors-victims.html'),
        controller: PostCustomActorsVictimsController
    };
}

PostCustomActorsVictimsController.$inject = [
    '$scope',
    '$sce',
    'Notify'
];

function PostCustomActorsVictimsController(
    $scope,
    $sce,
    Notify
) {
    // console.log($scope);    
}
