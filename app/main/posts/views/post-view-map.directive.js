module.exports = PostViewMap;

PostViewMap.$inject = ['PostEndpoint', 'Maps', '_', 'PostFilters', 'Leaflet', '$q', '$rootScope', '$compile', '$location', '$timeout', '$state', '$translate'];

function PostViewMap(PostEndpoint, Maps, _, PostFilters, L, $q, $rootScope, $compile, $location, $timeout, $state, $translate) {
    return {
        restrict: 'E',
        replace: true,
        scope: {
            noui: '@',
            $transition$: '<',
            filters: '<'
        },
        template: require('./post-view-map.html'),
        link: PostViewMapLink
    };

    function PostViewMapLink($scope, element, attrs, controller) {
        var map, markers;
        var limit = 200;
        var requestBlockSize = 5;
        var numberOfChunks = 0;
        var currentGeoJsonRequests = [];
        var count_search = 0;

        activate();

        $rootScope.$on('show_victims', function (e) {
            console.log('show_victims');
        });

        $rootScope.$on('show_events', function (e) {
            console.log('show_events');
        });

        function activate() {
            // Set the page title
            $translate('post.posts').then(function (title) {
                $scope.title = title;
                $scope.$emit('setPageTitle', title);
            });

            // Grab initial filters
            //$scope.filters = PostFilters.getFilters();

            var posts = loadPosts();

            // Start loading data
            var mapSelector = $scope.noui ? '#map-noui' : '#map-full-size';
            var createMapDirective = Maps.createMap(element[0].querySelector(mapSelector));
            var createMap = createMapDirective.then(function (data) {
                map = data;
            });
            // When data is loaded
            $q.all({
                map: createMap,
                posts: posts
            })
                .then(function (data) {
                    addPostsToMap(data.posts);
                    return data;
                })
                .then(watchFilters);

            // Change state on mode change
            $scope.$watch(() => {
                return PostFilters.getModeId();
        }, (mode) => {
                if (PostFilters.getMode() === 'savedsearch') {
                    $state.go('posts.map.savedsearch', {savedSearchId: PostFilters.getModeId()});
                } else if (PostFilters.getMode() === 'collection') {
                    $state.go('posts.map.collection', {collectionId: PostFilters.getModeId()});
                } else {
                    $state.go('posts.map.all');
                }
            });

            // Cleanup leaflet map
            $scope.$on('$destroy', function () {
                if (map) {
                    map.remove();
                }
            });

        }

        function clearData() {
            if (markers) {
                map.removeLayer(markers);
                markers = undefined;
            }
        }

        function addPostsToMap(posts) {
            var forms = [];
            angular.forEach(posts.features, function (post) {
                var exists = false;
                angular.forEach(forms, function (fp) {
                    if (fp.form_id === post.properties.form) {
                        fp.features.push(post);
                        exists = true;
                    }
                });
                if (!exists) {
                    var post_copy = angular.copy(posts);
                    post_copy.form_id = post.properties.form;
                    post_copy.features = [post];
                    forms.push(post_copy);
                }
            });
            var geojsonParent = L.geoJson(posts, {
                pointToLayer: Maps.pointToLayer,
                onEachFeature: onEachFeature
            });
            angular.forEach(forms, function (p) {
                var mark = [];
                var victimsCount = 0;
                angular.forEach(p.features, function (feature) {
                    victimsCount += parseInt(feature.properties["victims"]);
                    var c = ' marker-cluster-';
                    if (parseInt(feature.properties["victims"]) < 10) {
                        c += 'small';
                    } else if (parseInt(feature.properties["victims"]) < 100) {
                        c += 'medium';
                    } else {
                        c += 'large';
                    }
                    var myIcon = new L.DivIcon({
                        html: '<div style="color:#FFF !important; background-color: ' + feature.properties["marker-color"] + '!important;"><span>' + feature.properties["victims"] + '</span></div>',
                        className: 'marker-cluster' + c,
                        iconSize: new L.Point(40, 40)
                    });
                    var m = new L.marker([feature.geometry.geometries[0]["coordinates"][1], feature.geometry.geometries[0]["coordinates"][0]], {icon: myIcon});
                    mark.push({marker: m, feature: feature});
                });
                $scope.victims = new L.markerClusterGroup({
                    iconCreateFunction: function (cluster) {
                        var childCount = cluster.getChildCount();
                        var c = ' marker-cluster-';
                        if (childCount < 10) {
                            c += 'small';
                        } else if (childCount < 100) {
                            c += 'medium';
                        } else {
                            c += 'large';
                        }
                        return new L.DivIcon({
                            html: '<div style="color:#FFF !important; background-color: ' + p.features[0].properties["marker-color"] + '!important;"><span>' + victimsCount + '</span></div>',
                            className: 'marker-cluster' + c,
                            iconSize: new L.Point(40, 40)
                        });
                    }
                });
                angular.forEach(mark, function (ma) {
                    ma.marker.addTo($scope.victims).on('click', function (e) {
                        getPostDetails(ma.feature).then(function (details) {
                            var scope = $rootScope.$new();
                            scope.post = details;
                            scope.goToPost = goToPost;
                            scope.selectedPost = {post: details};

                            var el = $compile('<post-card selected-post="selectedPost" post="post" short-content="true" click-action="goToPost"></post-card>')(scope);

                            ma.marker.bindPopup(el[0], {
                                'minWidth': '300',
                                'maxWidth': '300',
                                'className': 'pl-popup'
                            });
                            ma.marker.openPopup();
                        });
                    });
                });
                $scope.events = new L.markerClusterGroup({
                    iconCreateFunction: function (cluster) {
                        var childCount = cluster.getChildCount();
                        var c = ' marker-cluster-';
                        if (childCount < 10) {
                            c += 'small';
                        } else if (childCount < 100) {
                            c += 'medium';
                        } else {
                            c += 'large';
                        }
                        return new L.DivIcon({
                            html: '<div style="color:#FFF !important; background-color: ' + p.features[0].properties["marker-color"] + '!important;"><span>' + childCount + '</span></div>',
                            className: 'marker-cluster' + c,
                            iconSize: new L.Point(40, 40)
                        });
                    }
                });
                var geojson = L.geoJson(p, {
                    pointToLayer: Maps.pointToLayer,
                    onEachFeature: onEachFeature
                });
                if (map.options.clustering) {
                    angular.forEach(geojson.getLayers(), function (layer) {
                        $scope.events.addLayer(layer);
                    });
                    $scope.victims.addTo(map);
                } else {
                    markers = geojson;
                    markers.addTo(map);
                }
            });
            if (posts.features.length > 0) {
                map.fitBounds(geojsonParent.getBounds());
            }
            // Focus map on data points but..
            // Avoid zooming further than 15 (particularly when we just have a single point)
            if (map.getZoom() > 15) {
                map.setZoom(15);
            }
            $timeout(function () {
                map.invalidateSize();
            }, 1);
        }

        function watchFilters() {
            // whenever filters change, reload the posts on the map
            $scope.$watch(function () {
                return $scope.filters;
            }, function (newValue, oldValue) {
                var diff = _.omit(newValue, function (value, key, obj) {
                    return _.isEqual(oldValue[key], value);
                });
                var diffLength = _.keys(diff).length;

                if (diffLength > 0) {
                    cancelCurrentRequests();
                    clearData();
                    reloadMapPosts();
                }
            }, true);
        }

        function cancelCurrentRequests() {
            _.each(currentGeoJsonRequests, function (request) {
                request.$cancelRequest();
            });
            currentGeoJsonRequests = [];
        }

        function reloadMapPosts(query) {
            var test = loadPosts(query);
            test.then(addPostsToMap);
        }

        function loadPosts(query, offset, currentBlock) {
            offset = offset || 0;
            currentBlock = currentBlock || 1;

            query = query || PostFilters.getQueryParams($scope.filters);

            var conditions = _.extend(query, {
                limit: limit,
                offset: offset,
                has_location: 'mapped'
            });
            var ids = [];

            var request = PostEndpoint.geojson(conditions);
            currentGeoJsonRequests.push(request);

            return request.$promise.then(function (posts) {

                // Set number of chunks
                if (offset === 0 && posts.total > limit) {
                    numberOfChunks = Math.floor((posts.total - limit) / limit);
                    numberOfChunks += ((posts.total - limit) % limit) > 0 ? 1 : 0;
                }

                if (count_search > 0) {
                    for (var e of posts.features)
                        ids.push(e.properties.id);
                    $scope.$broadcast('parentmethod', ids);
                    $rootScope.categories = ids;
                }

                // Retrieve blocks of chunks
                // At the end of a block request the next block of chunks
                if (numberOfChunks > 0 && currentBlock === 1) {
                    var block = numberOfChunks > requestBlockSize ? requestBlockSize : numberOfChunks;
                    numberOfChunks -= requestBlockSize;
                    while (block > 0) {
                        block -= 1;
                        offset += limit;
                        loadPosts(query, offset, block).then(addPostsToMap);
                    }
                }
                count_search++;
                return posts;
            });
        }

        function goToPost(post) {
            // reload because otherwise the layout does not reload and that is wrong because we change layouts on data and map
            $state.go('posts.data.detail', {postId: post.id}, {reload: true});
        }

        function onEachFeature(feature, layer) {
            layer.on('click', function (e) {
                // Grab the layer that was actually clicked on
                var layer = e.layer;
                // If we somehow got the feature group: grab the first child
                // because the FeatureGroup doesn't get added to the map when clustering
                if (layer instanceof L.FeatureGroup) {
                    layer = layer.getLayers()[0];
                }

                if (layer.getPopup()) {
                    layer.openPopup();
                } else {
                    getPostDetails(feature).then(function (details) {
                        var scope = $rootScope.$new();
                        scope.post = details;
                        scope.goToPost = goToPost;
                        scope.selectedPost = {post: details};

                        var el = $compile('<post-card selected-post="selectedPost" post="post" short-content="true" click-action="goToPost"></post-card>')(scope);

                        layer.bindPopup(el[0], {
                            'minWidth': '300',
                            'maxWidth': '300',
                            'className': 'pl-popup'
                        });
                        layer.openPopup();
                    });
                }
            });
        }

        function getPostDetails(feature) {
            return PostEndpoint.get({id: feature.properties.id}).$promise;
        }

    }
}
