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
    $scope.$on('selected_category', function(e){
        var selected = e.targetScope.selected;
        var categories = e.targetScope.categories;

        $scope.selected_categories = categories.filter(function(category){
            return selected.includes(category.id);
        });

        console.log($scope.selected_categories);
    });   
}
