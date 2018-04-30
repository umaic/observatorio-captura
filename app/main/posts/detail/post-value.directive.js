module.exports = ['PostEndpoint', 'moment', '_', function (PostEndpoint, moment, _) {
    return {
        restrict: 'E',
        replace: true,
        scope: {
            key: '=',
            value: '=',
            attribute: '=',
            type: '=',
            tags: '=',
            actors: '='
        },
        template: require('./post-value.html'),
        link: function ($scope) {
            // This whole directive is wrong and it should feel wrong
            // Depending on whether we are dealing with a post task or a standard task
            // the css class is swapped. This Boolean manages that distinction.
            $scope.standardTask = $scope.type === 'standard';
            // TODO Move to Service
            $scope.formatTags = function (tagIds) {
                // getting tag-names and formatting them for displaying
                var formatedTags = ' ';
                _.each(tagIds, function (tag, index) {
                    var tagObj = _.where($scope.tags, {id: parseInt(tag)});
                    if (tagObj[0]) {
                        tag = tagObj[0].tag;
                        if (index < tagIds.length - 1) {
                            formatedTags += tag + ', ';
                        } else {
                            formatedTags += tag;
                        }
                    }
                });
                return formatedTags;
            };
            $scope.formatActors = function (tagIds) {
                // getting tag-names and formatting them for displaying
                var formatedActors = ' ';
                _.each(tagIds, function (tag, index) {
                    var tagObj = _.where($scope.actors, {id: parseInt(tag)});
                    if (tagObj[0]) {
                        tag = tagObj[0].tag;
                        if (index < tagIds.length - 1) {
                            formatedActors += tag + ', ';
                        } else {
                            formatedActors += tag;
                        }
                    }
                });
                return formatedActors;
            };
            $scope.formatActorsCategory = function (array) {
                var format = ' ';
                _.each(array, function (data, index) {
                    var actorObj = _.where($scope.actors, {id: parseInt(data.actor_id)});
                    var tagObj = _.where($scope.tags, {id: parseInt(data.tag_id)});

                    if (index < array.length - 1) {
                        format += actorObj[0].tag + ' (' +  tagObj[0].tag + '), ';
                    } else {
                        format += actorObj[0].tag + ' (' +  tagObj[0].tag + ')';
                    }
                });
                return format;
            };
            if ($scope.attribute.type === 'relation') {
                $scope.value = $scope.value.map(function (entry) {
                    return PostEndpoint.get({id: entry});
                });
            }
            if ($scope.attribute.input === 'tags') {
                $scope.value = $scope.formatTags($scope.value);
            }
            if ($scope.attribute.input === 'actors') {
                $scope.value = $scope.formatActors($scope.value);
            }
            if ($scope.attribute.input === 'actorscat') {
                $scope.value = $scope.formatActorsCategory($scope.value);
            }
            if ($scope.attribute.type === 'datetime') {
                if ($scope.attribute.input === 'date') {
                    $scope.value = $scope.value.map(function (entry) {
                        return moment(entry).format('LL');
                    });
                }
                if ($scope.attribute.input === 'datetime') {
                    $scope.value = $scope.value.map(function (entry) {
                        return moment(entry).format('LLL');
                    });
                }
                if ($scope.attribute.input === 'time') {
                    $scope.value = $scope.value.map(function (entry) {
                        return moment(entry).format('LT');
                    });
                }
            }
        }
    };
}];
