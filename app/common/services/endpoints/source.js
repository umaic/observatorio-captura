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
    if (!(cache = CacheFactory.get('sourceCache'))) {
        cache = CacheFactory.createCache('sourceCache');
    }
    cache.removeExpired();

    var SourceEndpoint = $resource(Util.apiUrl('/sources/:id'), {
        id: '@id'
    }, {
        query: {
            method: 'GET',
            isArray: true,
            cache: cache,
            transformResponse: function (data /*, header*/) {
                return Util.transformResponse(data).results;
            }
        },
        update: {
            method: 'PUT'
        },
        get: {
            method: 'GET',
            cache: cache,
            params: {'ignore403': '@ignore403'}
        },
        deleteEntity: {
            method: 'DELETE'
        }
    });

    SourceEndpoint.getFresh = function (params) {
        cache.remove(Util.apiUrl('/sources/' + params.id));
        return SourceEndpoint.get(params);
    };

    SourceEndpoint.queryFresh = function (params) {
        cache.removeAll();
        return SourceEndpoint.query(params);
    };

    SourceEndpoint.invalidateCache = function () {
        return cache.removeAll();
    };

    SourceEndpoint.saveCache = function (item) {
        var persist = item.id ? SourceEndpoint.update : SourceEndpoint.save;
        cache.removeAll();
        var result = persist(item);
        return result;
    };

    SourceEndpoint.delete = function (item) {
        cache.removeAll();
        var result = SourceEndpoint.deleteEntity(item);
        return result;
    };


    $rootScope.$on('event:authentication:logout:succeeded', function () {
        SourceEndpoint.queryFresh();
    });
    $rootScope.$on('event:authentication:login:succeeded', function () {
        SourceEndpoint.queryFresh();
    });

    return SourceEndpoint;

}];
