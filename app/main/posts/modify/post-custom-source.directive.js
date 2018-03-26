module.exports = PostCustomSource;

PostCustomSource.$inject = [];

function PostCustomSource() {
    return {
        restrict: 'E',
        scope: {
            source: '='
        },
        template: require('./custom-source.html'),
        controller: PostCustomSourceController
    };
}

PostCustomSourceController.$inject = [
    '$scope',
    '$sce',
    'Notify',
    'moment'
];

function PostCustomSourceController(
    $scope,
    $sce,
    Notify,
    moment
) {
    $scope.dateOptions = { format: 'yyyy-mm-dd', onClose: save };
    console.log($scope);

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
    function save() {
        ngModel.$setViewValue($scope.source.date);
    }

    $scope.sources = [
    {
    	label: 'ACNUR',
    	value: 'ACNUR'
    },
    {
    	label: 'Banco Mundial',
    	value: 'Banco Mundial'
    },
    {
    	label: 'CEPAL',
    	value: 'CEPAL'
    },
    ];
    // $scope.getVideoThumbnail = getVideoThumbnail;
}
