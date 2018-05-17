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
            form: '=',
            post: '=',
        },
        template: require('./post-custom-source.html'),
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
    $scope.changeSource = changeSource;
    $scope.dateOptions = {format: 'yyyy-mm-dd'};
    var now = new Date();

    activate();

    function activate() {
        // remove default null value when creating a new post
        if ($scope.selected[0] === null) {
            $scope.selected = [];
        }
        $scope.sources = [];

        $scope.sources = $scope.available;

        if (!$scope.post.id) {
            $scope.sources_set = [{
                source_id: null,
                event_date: moment(now).toDate(),
                event_desc: null,
                url: null
            }];
        } else {
            $scope.sources_set = $scope.post.values.sources_set;
            parseIds($scope.sources_set);
        }
        setSourceOptions($scope.sources);
    }

    function parseIds(sources) {
        _.each($scope.sources_set, function (val) {
            val.source_id = parseInt(val.source_id);
        });
    }

    function addSource() {
        var s = {
            source_id: null,
            event_date: moment(now).toDate(),
            event_desc: null,
            url: null
        };
        $scope.sources_set.push(s);
    }

    function changeSource(source, idx) {
        if ($scope.selected[idx]) {
            $scope.selected[idx] = source.source_id
        } else {
            var found = _.find($scope.selected, function (val) {
                return (source.source_id == val);
            });
            if (!found) {
                if (source.source_id) {
                    $scope.selected.push(source.source_id);
                }
            }
        }
        $scope.post.values.sources_set = $scope.sources_set;
    }

    function delSource(idx) {
        //console.log(idx);
        if ($scope.sources_set[idx].source_id) {
            var id = $scope.sources_set[idx].source_id;
            var found = _.findIndex($scope.selected, function (val) {
                return (val == id);
            });

            if (found) {
                $scope.selected.splice(found, 1);
            }
        }
        $scope.sources_set.splice(idx, 1);
        $scope.post.values.sources_set = $scope.sources_set;
    }

    function setSourceOptions(sources) {
        $scope.sources_obj = _.filter(sources, function (source) {
            return source.children.length == 0;
        });

        _.each($scope.sources_obj, function (source) {
            if (source.parent) {
                var parent_obj = _.find(sources, function (s) {
                    return (source.parent.id == s.id);
                });

                source.parent.tag = parent_obj.tag;
            }
        });
    }
}
