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
    $scope.addSource = addSource;
    $scope.delSource = delSource;
    $scope.dateOptions = { format: 'yyyy-mm-dd'};
    var now = new Date();

    activate();

    function activate() {
        // remove default null value when creating a new post
        if ($scope.selected[0] === null) {
            $scope.selected = [];
        }
        $scope.sources = [];
        $scope.sources_set = [{
            source_id: null,
            date: moment(now).toDate(),
            desc: null,
            link: null,
            tag_id: $scope.category_selected
        }];

        $scope.sources = $scope.available;
        setSourceOptions($scope.sources);
    }

    function addSource(){
        var s = {
            source_id: null,
            date: moment(now).toDate(),
            desc: null,
            link: null,
            tag_id: $scope.category_selected
        };
        $scope.sources_set.push(s);
        _.each($scope.sources_set, function (source){
            var found = _.find($scope.selected, function (val){
                return (source.tag_id == val);
            });
            if (!found) {
                $scope.selected.push(source.tag_id);
            }
        });
        console.log($scope.selected);
    }

    function delSource (idx){
        //console.log(idx);
        var tag = $scope.sources_set[idx].tag_id;
        var found = _.findIndex($scope.selected, function (val){
                return (val == tag);
            });

        if (found) {
                $scope.selected.splice(found, 1);
            }
        $scope.sources_set.splice(idx,1);
        console.log($scope.selected);
    }

    function setSourceOptions(sources) {
        $scope.sources_obj = _.filter(sources, function (source){
            return source.children.length == 0;
        });

        _.each($scope.sources_obj, function (source){
            if (source.parent) {
                var parent_obj = _.find(sources, function(s){
                    return (source.parent.id == s.id);
                });

                source.parent.tag = parent_obj.tag;
            }
        });
    }

    //para establecer las fuentes seleccionadas, hacer un watch de sources_set e ir armando la variable selected según las fuentes que se vayan agregando

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
