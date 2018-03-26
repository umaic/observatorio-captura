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
    '$rootScope',
    '$sce',
    'Notify'
];

function PostCustomActorsVictimsController(
    $scope,
    $rootScope,
    $sce,
    Notify
) {
    $scope.switchTab = switchTab;

    var initCategory = function (){
        if ($scope.selected_categories && $scope.selected_categories.length > 0) {
            $scope.categoria = $scope.selected_categories[0].id;
        }
    }

    function activate() {
            $scope.tab_history = {};

        // Set initial menu tab
            $scope.switchTab('post', 'actor');
        }

    function switchTab(section, tab) {

        // First unset last active tab
        var old_tab = $scope.tab_history[section];
        if (old_tab) {
            var old_tab_li = old_tab + '-li';
            angular.element(document.getElementById(old_tab)).removeClass('active');
            angular.element(document.getElementById(old_tab_li)).removeClass('active');
        }
        // Set new active tab
        tab = tab + '-' + section;
        $scope.tab_history[section] = tab;
        var tab_li = tab + '-li';
        angular.element(document.getElementById(tab)).addClass('active');
        angular.element(document.getElementById(tab_li)).addClass('active');
    } 

    $rootScope.$on('selected_category', function(e){
        var selected = e.targetScope.selected;
        var categories = e.targetScope.categories;

        $scope.selected_categories = categories.filter(function(category){
            return selected.includes(category.id);
        });

        initCategory();
        activate();
    }); 
}
