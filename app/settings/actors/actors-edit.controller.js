module.exports = [
    '$scope',
    '$rootScope',
    '$translate',
    '$location',
    'RoleEndpoint',
    'ActorEndpoint',
    'FormEndpoint',
    'Notify',
    '_',
    'Util',
    '$transition$',
    '$q',
    '$state',
function (
    $scope,
    $rootScope,
    $translate,
    $location,
    RoleEndpoint,
    ActorEndpoint,
    FormEndpoint,
    Notify,
    _,
    Util,
    $transition$,
    $q,
    $state
) {

    // Redirect to home if not authorized
    if ($rootScope.hasManageSettingsPermission() === false) {
        return $location.path('/');
    }

    // Set initial actor properties and page title
    if ($location.path() === '/settings/actors/create') {
        // Set initial actor properties
        $scope.actor = {
            type: 'actor',
            icon: 'actor',
            color: '',
            parent_id: null
        };
        // Allow parent actor selector
        $scope.isParent = false;
        // Translate and set add actor page title
        $translate('actor.add_actor').then(function (title) {
            $scope.title = title;
            $scope.$emit('setPageTitle', title);
        });
    } else {
        // Get and set initial actor properties
        getActor();
        // Translate and set edit actor page title
        $translate('actor.edit_actor').then(function (title) {
            $scope.title = title;
            $rootScope.$emit('setPageTitle', title);
        });
    }

    // Change mode
    $scope.$emit('event:mode:change', 'settings');

    $scope.addParent = addParent;
    $scope.deleteActor = deleteActor;
    $scope.getParentName = getParentName;
    $scope.saveActor = saveActor;

    $scope.cancel = cancel;

    $scope.processing = false;
    $scope.save = $translate.instant('app.save');
    $scope.saving = $translate.instant('app.saving');

    activate();

    function activate() {
        getRoles();
        getParentActors();
    }

    function getRoles() {
        RoleEndpoint.query().$promise.then(function (roles) {
            $scope.roles = roles;
        });
    }

    function getParentActors() {
        ActorEndpoint.queryFresh({ level: 'parent' }).$promise.then(function (actors) {
            // Remove current actor to avoid circular reference
            $scope.parents = _.filter(actors, function (actor) {
                return actor.id !== parseInt($transition$.params().id);
            });
        });
    }

    function getActor() {
        ActorEndpoint.getFresh({ id: $transition$.params().id }).$promise.then(function (actor) {
            $scope.actor = actor;
            // Normalize parent actor
            if ($scope.actor.parent) {
                $scope.actor.parent_id = $scope.actor.parent.id;
                $scope.actor.parent_id_original = $scope.actor.parent.id;
                delete $scope.actor.parent;
            }
            if ($scope.actor.children && $scope.actor.children.length) {
                $scope.isParent = true;
            }
        });
    }

    function addParent(id) {
        return ActorEndpoint.getFresh({id: id});
    }

    function getParentName() {
        var parentName = 'Nada';
        if ($scope.actor && $scope.parents) {
            $scope.parents.forEach(function (parent) {
                if (parent.id === $scope.actor.parent_id) {
                    parentName = parent.actor;
                }
            });
        }
        return parentName;
    }

    function saveActor(actor) {
        // Set processing to disable user actions
        $scope.processing = true;
        // Save actor
        $q.when(
            ActorEndpoint
            .saveCache(actor)
            .$promise
        )
        .then(function (result) {
            // If parent actor, apply parent actor permisions to child actors
            if (result.children && result.children.length) {
                return updateChildrenPermissions(result);
            }
            // If child actor with new parent, apply new permissions to child actor
            if (result.parent && result.parent.id !== $scope.actor.parent_id_original) {
                return updateWithParentPermissions(result);
            }
        })
        .then(function () {
            // Display success message
            Notify.notify(
                'notify.actor.save_success',
                { name: $scope.actor.actor }
            );
            // Redirect to actors list
            $state.go('settings.actors', {}, { reload: true });
        })
        // Catch and handle errors
        .catch(handleResponseErrors);
    }

    function updateChildrenPermissions(actor) {
        var promises = [];
        _.each(actor.children, function (child) {
            promises.push(
              ActorEndpoint
              .saveCache({ id: child.id, role: actor.role })
              .$promise
            );
        });
        return $q.all(promises);
    }

    function updateWithParentPermissions(actor) {
        return ActorEndpoint
        .getFresh({ id: actor.parent.id })
        .$promise
        .then(function (parent) {
            return ActorEndpoint
            .saveCache({ id: actor.id, role: parent.role })
            .$promise;
        });
    }

    function deleteActor(actor) {
        Notify.confirmDelete(
            'notify.actor.destroy_confirm',
            'notify.actor.destroy_confirm_desc'
        ).then(function () {
            return ActorEndpoint
            .delete({ id: actor.id })
            .$promise
            .then(function () {
                Notify.notify('notify.actor.destroy_success');
                $location.url('/settings/actors');
            });
        })
        .catch(handleResponseErrors);
    }

    function handleResponseErrors(errorResponse) {
        $scope.processing = false;
        Notify.apiErrors(errorResponse);
    }

    function cancel() {
        $location.path('/settings/actors');
    }

}];
