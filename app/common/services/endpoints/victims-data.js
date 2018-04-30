module.exports = [
    '$resource',
    '$rootScope',
    'Util',
    'CacheFactory',
    function (
        $resource,
        $rootScope,
        Util,
        CacheFactory
    ) {
        var cache;
        if (!(cache = CacheFactory.get('actorCache'))) {
            cache = CacheFactory.createCache('actorCache');
        }
        cache.removeExpired();

        var VictimsDataEndpoint = $resource(Util.url('/victims-data'), {}, {
            query: {
                method: 'GET',
                isArray: true,
                cache: cache,
                transformResponse: function (data /*, header*/) {
                    return data;
                }
            }
        });

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
