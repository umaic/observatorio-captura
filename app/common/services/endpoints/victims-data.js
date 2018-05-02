module.exports = [
    '$q',
    '$resource',
    '$http',
    '$rootScope',
    'Util',
    'CacheFactory',
    function (
        $q,
        $resource,
        $http,
        $rootScope,
        Util,
        CacheFactory
    ) {
        var cache;
        if (!(cache = CacheFactory.get('actorCache'))) {
            cache = CacheFactory.createCache('actorCache');
        }
        cache.removeExpired();


        var VictimsDataEndpoint = {
            query: function () {
                var deferred = $q.defer();
                var request = $http({
                    method: "GET",
                    url: Util.url('/victims-data'),
                    headers: {
                        'Content-Type': 'application/x-www-form-urlencoded'
                    }
                }).then(function (response) {
                    deferred.resolve(response.data);
                });
                return deferred.promise;
            }
        };

        VictimsDataEndpoint.queryFresh = function (params) {
            cache.removeAll();
            return VictimsDataEndpoint.query(params);
        };

        $rootScope.$on('event:authentication:logout:succeeded', function () {
            VictimsDataEndpoint.queryFresh();
        });
        $rootScope.$on('event:authentication:login:succeeded', function () {
            VictimsDataEndpoint.queryFresh();
        });

        return VictimsDataEndpoint;

    }];
