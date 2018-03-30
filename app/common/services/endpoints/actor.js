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

    var ActorEndpoint = $resource(Util.apiUrl('/actors/:id'), {
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

    ActorEndpoint.getFresh = function (params) {
        cache.remove(Util.apiUrl('/actors/' + params.id));
        return ActorEndpoint.get(params);
    };

    ActorEndpoint.queryFresh = function (params) {
        cache.removeAll();
        return ActorEndpoint.query(params);
    };

    ActorEndpoint.invalidateCache = function () {
        return cache.removeAll();
    };

    ActorEndpoint.saveCache = function (item) {
        var persist = item.id ? ActorEndpoint.update : ActorEndpoint.save;
        cache.removeAll();
        var result = persist(item);
        return result;
    };

    ActorEndpoint.delete = function (item) {
        cache.removeAll();
        var result = ActorEndpoint.deleteEntity(item);
        return result;
    };


    $rootScope.$on('event:authentication:logout:succeeded', function () {
        ActorEndpoint.queryFresh();
    });
    $rootScope.$on('event:authentication:login:succeeded', function () {
        ActorEndpoint.queryFresh();
    });

    return ActorEndpoint;

}];
