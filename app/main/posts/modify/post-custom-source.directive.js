module.exports = PostCustomSource;

PostCustomSource.$inject = [];

function PostCustomSource() {
    return {
        restrict: 'E',
        scope: {
            sourceselected: '='
        },
        template: require('./custom-source.html'),
        controller: PostCustomSourceController
    };
}

PostCustomSourceController.$inject = [
    '$scope',
    '$sce',
    'Util',
    'Notify'
];

function PostCustomSourceController(
    $scope,
    $sce,
    Util,
    Notify
) {
    $scope.constructIframe = constructIframe;
    $scope.dateOptions = { format: 'yyyy-mm-dd', onClose: save };

    if (!ngModel) {
        return;
    }

    // Update models on render
    ngModel.$render = render;

    // Render ngModel viewValue into scope
    function render() {
        $scope.source_date = moment(ngModel.$viewValue).toDate();
    }

    // Save model value
    // Only runs when modal closes, this avoids overwriting the time
    // and rounding it to 15mins, even when the user never changed it
    function save() {
        ngModel.$setViewValue($scope.model);
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
