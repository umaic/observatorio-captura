module.exports = ['PostEndpoint', '$sce', 'moment', '_', function (PostEndpoint, $sce, moment, _) {
    return {
        restrict: 'E',
        replace: true,
        scope: {
            key: '=',
            value: '=',
            attribute: '=',
            type: '=',
            tags: '=',
            actors: '=',
            victimsd: '=',
            sources: '='
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
                        format += '- ' + actorObj[0].tag + ' (' + tagObj[0].tag + '). <br>';
                    } else {
                        format += '- ' + actorObj[0].tag + ' (' + tagObj[0].tag + ').';
                    }
                });
                return format;
            };
            $scope.formatVictimsCategory = function (array) {
                var format = ' ';
                _.each(array, function (data, index) {
                    format += '- ';
                    if (data.amount && data.amount >= 0) {
                        format += 'Personas: ' + data.amount;
                    }
                    if (data.id_age) {
                        var victim_age = _.where($scope.victimsd.victim_age, {id: data.id_age});
                        format += '. Edad: ' + victim_age[0].age;
                    }
                    if (data.id_age_group) {
                        var victim_age_group = _.where($scope.victimsd.victim_age_group, {id: data.id_age_group});
                        format += '. Grupo de Edad: ' + victim_age_group[0].age_group;
                    }
                    if (data.id_condition) {
                        var victim_condition = _.where($scope.victimsd.victim_condition, {id: data.id_condition});
                        format += '. Condición: ' + victim_condition[0].condition;
                    }
                    if (data.id_sub_condition) {
                        var victim_sub_condition = _.where($scope.victimsd.victim_sub_condition, {id: data.id_sub_condition});
                        format += '. Condición: ' + victim_sub_condition[0].sub_condition;
                    }
                    if (data.id_ethnic_group) {
                        var victim_ethnic_group = _.where($scope.victimsd.victim_ethnic_group, {id: data.id_ethnic_group});
                        format += '. Condición: ' + victim_ethnic_group[0].ethnic_group;
                    }
                    if (data.id_sub_ethnic_group) {
                        var victim_sub_ethnic_group = _.where($scope.victimsd.victim_sub_ethnic_group, {id: data.id_sub_ethnic_group});
                        format += '. Sub Grupo Étnico: ' + victim_sub_ethnic_group[0].sub_ethnic_group;
                    }
                    if (data.id_gender) {
                        var victim_gender = _.where($scope.victimsd.victim_gender, {id: data.id_gender});
                        format += '. Género: ' + victim_gender[0].gender;
                    }
                    if (data.id_occupation) {
                        var victim_occupation = _.where($scope.victimsd.victim_occupation, {id: data.id_occupation});
                        format += '. Ocupación: ' + victim_occupation[0].occupation;
                    }
                    if (data.id_status) {
                        var victim_status = _.where($scope.victimsd.victim_status, {id: data.id_status});
                        format += '. Estado: ' + victim_status[0].status;
                    }
                    var tagObj = _.where($scope.tags, {id: parseInt(data.tag_id)});
                    format += '. Categoría: ' + tagObj[0].tag + '.<br>';

                });
                return format;
            };
            $scope.formatSources = function (array) {
                var format = '<p>';
                _.each(array, function (data, index) {
                    var sourceObj = _.where($scope.sources, {id: parseInt(data.source_id)});
                    if (index < array.length - 1) {
                        format += sourceObj[0].tag + '<br>' + '. Fecha: ' + data.event_date + '<br>' + '. Descripción: ' + data.event_desc + '<br>' + '. Url: ' + data.url + '</p><p>';
                    } else {
                        format += sourceObj[0].tag + '<br>' + '. Fecha: ' + data.event_date + '<br>' + '. Descripción: ' + data.event_desc + '<br>' + '. Url: ' + data.url + '</p>';
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
            if ($scope.attribute.input === 'victimcat') {
                $scope.value = $scope.formatVictimsCategory($scope.value);
            }
            if ($scope.attribute.input === 'sour') {
                $scope.value = $scope.formatSources($scope.value);
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
