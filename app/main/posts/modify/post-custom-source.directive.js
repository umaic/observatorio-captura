module.exports = PostCustomSource;

PostCustomSource.$inject = [];

function PostCustomSource() {
    return {
        restrict: 'E',
        scope: {
            formId: '=',
            attribute: '=',
            postValue: '=',
            available: '=',
            selected: '=',
            enableParents: '=',
            form: '='
        },
        template: require('./custom-source.html'),
        controller: PostCustomSourceController
    };
}

PostCustomSourceController.$inject = [
    '$scope',
    '$sce',
    'Notify',
    'moment',
    '_',
];

function PostCustomSourceController(
    $scope,
    $sce,
    Notify,
    moment,
    _
) {
    $scope.dateOptions = { format: 'yyyy-mm-dd'};
    var now = new Date();
    $scope.source = {
        selected: null,
        date: moment(now).toDate(),
        desc: "",
        url: ""
    };

    activate();

    function activate() {
        // remove default null value when creating a new post
        if ($scope.selected[0] === null) {
            $scope.selected = [];
        }
        $scope.sources = [];

        $scope.sources = $scope.available;
        setSourceOptions($scope.sources);
    }

    function setSourceOptions(sources) {
        $scope.sources_obj = _.filter(sources, function (source){
            if (source.parent) {
                source.parent.tag = _.each(sources, function (s){
                    if (source.parent.id == s.id) {
                        return s.tag;
                    }
                })
            }
            return source.children.length == 0;
        });
        console.log($scope.sources_obj);
    }

    // if (!$scope.source.date) {
    //     return;
    // }

    // // Update models on render
    // $scope.source.date.$render = render;

    // // Render ngModel viewValue into scope
    // function render() {
    //     $scope.source.date = moment(ngModel.$viewValue).toDate();
    // }

    // // Save model value
    // // Only runs when modal closes, this avoids overwriting the time
    // // and rounding it to 15mins, even when the user never changed it
    // function save() {
    //     ngModel.$setViewValue($scope.source.date);
    // }
    // $scope.getVideoThumbnail = getVideoThumbnail;
}
