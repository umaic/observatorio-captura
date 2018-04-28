module.exports = [
    '$scope',
    '$translate',
    '$rootScope',
    '$location',
    '$q',
    'SourceEndpoint',
    'Notify',
    '_',
function (
    $scope,
    $translate,
    $rootScope,
    $location,
    $q,
    SourceEndpoint,
    Notify,
    _
) {

    // Redirect to home if not authorized
    if ($rootScope.hasManageSettingsPermission() === false) {
        return $location.path('/');
    }

    $translate('tool.manage_sources').then(function (title) {
        $scope.title = title;
        $scope.$emit('setPageTitle', title);
    });
    // Change mode
    $scope.$emit('event:mode:change', 'settings');


    $scope.refreshView = function () {
        SourceEndpoint.queryFresh().$promise.then(function (sources) {
            $scope.allSources = sources;
            $scope.sources = _.map(_.where(sources, { parent_id: null }), function (source) {
                if (source && source.children) {
                    source.children = _.map(source.children, function (child) {
                        return _.findWhere(sources, {id: parseInt(child.id)});
                    });
                }
                return source;
            });
        });
        $scope.selectedSources = [];
    };
    $scope.refreshView();

    $scope.deleteSource = function (source) {
        Notify.confirmDelete('notify.source.destroy_confirm', 'notify.source.destroy_confirm_desc').then(function () {
            SourceEndpoint.delete(source).$promise.then(function () {
                Notify.notify('notify.source.destroy_success', { name: source.source });
                $scope.refreshView();
            }, handleResponseErrors);
        });
    };

    $scope.deleteSources = function () {
        Notify.confirmDelete('notify.source.bulk_destroy_confirm', 'notify.source.bulk_destroy_confirm_desc', { count: $scope.selectedSources.length }).then(function () {
            var calls = [];
            angular.forEach($scope.selectedSources, function (actorId) {
                calls.push(SourceEndpoint.delete({id: actorId }).$promise);
            });
            $q.all(calls).then(function () {
                Notify.notify('notify.source.bulk_destroy_success', { count: $scope.selectedSources.length });
                $scope.refreshView();
            }, handleResponseErrors);
        });
    };

    $scope.isToggled = function (source) {
        return $scope.selectedSources.indexOf(source.id) > -1;
    };

    $scope.toggleSource = function (source) {
        var idx = $scope.selectedSources.indexOf(source.id);
        if (idx > -1) {
            $scope.selectedSources.splice(idx, 1);
        } else {
            $scope.selectedSources.push(source.id);
        }
    };

    function handleResponseErrors(errorResponse) {
        Notify.apiErrors(errorResponse);
    }

}];
