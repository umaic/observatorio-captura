module.exports = [
    '$scope',
    '$translate',
    '$rootScope',
    '$location',
    '$q',
    'ActorEndpoint',
    'Notify',
    '_',
function (
    $scope,
    $translate,
    $rootScope,
    $location,
    $q,
    ActorEndpoint,
    Notify,
    _
) {

    // Redirect to home if not authorized
    if ($rootScope.hasManageSettingsPermission() === false) {
        return $location.path('/');
    }

    $translate('tool.manage_actors').then(function (title) {
        $scope.title = title;
        $scope.$emit('setPageTitle', title);
    });
    // Change mode
    $scope.$emit('event:mode:change', 'settings');


    $scope.refreshView = function () {
        ActorEndpoint.queryFresh().$promise.then(function (actors) {
            $scope.allActors = actors;
            $scope.actors = _.map(_.where(actors, { parent_id: null }), function (actor) {
                if (actor && actor.children) {
                    actors.children = _.map(actor.children, function (child) {
                        return _.findWhere(actors, {id: parseInt(child.id)});
                    });
                }
                return actor;
            });
            console.log($scope.allActors);
        });
        $scope.selectedActors = [];
    };
    $scope.refreshView();

    $scope.deleteActor = function (actor) {
        Notify.confirmDelete('notify.actor.destroy_confirm', 'notify.actor.destroy_confirm_desc').then(function () {
            ActorEndpoint.delete(actor).$promise.then(function () {
                Notify.notify('notify.actor.destroy_success', { name: actor.actor });
                $scope.refreshView();
            }, handleResponseErrors);
        });
    };

    $scope.deleteActors = function () {
        Notify.confirmDelete('notify.actor.bulk_destroy_confirm', 'notify.actor.bulk_destroy_confirm_desc', { count: $scope.selectedActors.length }).then(function () {
            var calls = [];
            angular.forEach($scope.selectedActors, function (actorId) {
                calls.push(ActorEndpoint.delete({id: actorId }).$promise);
            });
            $q.all(calls).then(function () {
                Notify.notify('notify.actor.bulk_destroy_success', { count: $scope.selectedActors.length });
                $scope.refreshView();
            }, handleResponseErrors);
        });
    };

    $scope.isToggled = function (actor) {
        return $scope.selectedActors.indexOf(actor.id) > -1;
    };

    $scope.toggleActor = function (actor) {
        var idx = $scope.selectedActors.indexOf(actor.id);
        if (idx > -1) {
            $scope.selectedActors.splice(idx, 1);
        } else {
            $scope.selectedActors.push(actor.id);
        }
    };

    function handleResponseErrors(errorResponse) {
        Notify.apiErrors(errorResponse);
    }

}];
