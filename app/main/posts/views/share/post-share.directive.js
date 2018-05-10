module.exports = PostShareDirective;

PostShareDirective.$inject = [];

function PostShareDirective() {
    return {
        restrict: 'E',
        replace: true,
        scope: {
            filters: '=',
            button: '=?',
            postId: '=?'
        },
        controller: PostShareController,
        template: require('./post-share.html')
    };
}

PostShareController.$inject = [
    '$rootScope',
    '$scope',
    '$window',
    'ModalService'
];

function PostShareController(
    $rootScope,
    $scope,
    $window,
    ModalService
) {
    $scope.buttonAct = 'e';
    $scope.loading = false;
    $scope.openShareMenu = openShareMenu;
    $scope.activeButton = activeButton;
    $scope.showEvents = showEvents;
    $scope.showVictims = showVictims;
    $scope.isButton = isButton;
    $scope.isAdd = isAdd;

    activate();

    function activeButton(b) {
        return $scope.buttonAct == b;
    }

    function showVictims() {
        $scope.buttonAct = 'v';
        $rootScope.$emit('show_victims');
    }

    function showEvents() {
        $scope.buttonAct = 'e';
        $rootScope.$emit('show_events');
    }

    function activate() {
    }

    function isButton() {
        return $scope.button;
    }

    function isAdd() {
        if ($window.location.href.indexOf('post') > 0) {
            return true;
        }
        return false;
    }

    function openShareMenu() {
        var template = '<share-menu-modal filters="filters" post-id="' + $scope.postId + '"></share-menu-modal>';
        ModalService.openTemplate(template, 'app.share', 'share', $scope, true, true);
    }
}
