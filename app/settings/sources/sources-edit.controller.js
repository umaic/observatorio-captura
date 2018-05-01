module.exports = [
    '$scope',
    '$rootScope',
    '$translate',
    '$location',
    'RoleEndpoint',
    'SourceEndpoint',
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
    SourceEndpoint,
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

    // Set initial source properties and page title
    if ($location.path() === '/settings/sources/create') {
        // Set initial source properties
        $scope.source = {
            type: 'source',
            icon: 'source',
            color: '',
            parent_id: null
        };
        // Allow parent source selector
        $scope.isParent = false;
        // Translate and set add source page title
        $translate('source.add_source').then(function (title) {
            $scope.title = title;
            $scope.$emit('setPageTitle', title);
        });
    } else {
        // Get and set initial source properties
        getSource();
        // Translate and set edit source page title
        $translate('source.edit_source').then(function (title) {
            $scope.title = title;
            $rootScope.$emit('setPageTitle', title);
        });
    }

    // Change mode
    $scope.$emit('event:mode:change', 'settings');

    $scope.addParent = addParent;
    $scope.deleteSource = deleteSource;
    $scope.getParentName = getParentName;
    $scope.saveSource = saveSource;

    $scope.cancel = cancel;

    $scope.processing = false;
    $scope.save = $translate.instant('app.save');
    $scope.saving = $translate.instant('app.saving');

    activate();

    function activate() {
        getRoles();
        getParentSources();
    }

    function getRoles() {
        RoleEndpoint.query().$promise.then(function (roles) {
            $scope.roles = roles;
        });
    }

    function getParentSources() {
        SourceEndpoint.queryFresh({ level: 'parent' }).$promise.then(function (sources) {
            // Remove current source to avoid circular reference
            $scope.parents = _.filter(sources, function (source) {
                return source.id !== parseInt($transition$.params().id);
            });
        });
    }

    function getSource() {
        SourceEndpoint.getFresh({ id: $transition$.params().id }).$promise.then(function (source) {
            $scope.source = source;
            // Normalize parent source
            if ($scope.source.parent) {
                $scope.source.parent_id = $scope.source.parent.id;
                $scope.source.parent_id_original = $scope.source.parent.id;
                delete $scope.source.parent;
            }
            if ($scope.source.children && $scope.source.children.length) {
                $scope.isParent = true;
            }
        });
    }

    function addParent(id) {
        return SourceEndpoint.getFresh({id: id});
    }

    function getParentName() {
        var parentName = 'Nada';
        if ($scope.source && $scope.parents) {
            $scope.parents.forEach(function (parent) {
                if (parent.id === $scope.source.parent_id) {
                    parentName = parent.source;
                }
            });
        }
        return parentName;
    }

    function saveSource(source) {
        // Set processing to disable user actions
        $scope.processing = true;
        // Save source
        $q.when(
            SourceEndpoint
            .saveCache(source)
            .$promise
        )
        .then(function (result) {
            // If parent source, apply parent source permisions to child sources
            if (result.children && result.children.length) {
                return updateChildrenPermissions(result);
            }
            // If child source with new parent, apply new permissions to child source
            if (result.parent && result.parent.id !== $scope.source.parent_id_original) {
                return updateWithParentPermissions(result);
            }
        })
        .then(function () {
            // Display success message
            Notify.notify(
                'notify.source.save_success',
                { name: $scope.source.source }
            );
            // Redirect to sources list
            $state.go('settings.sources', {}, { reload: true });
        })
        // Catch and handle errors
        .catch(handleResponseErrors);
    }

    function updateChildrenPermissions(source) {
        var promises = [];
        _.each(source.children, function (child) {
            promises.push(
              SourceEndpoint
              .saveCache({ id: child.id, role: source.role })
              .$promise
            );
        });
        return $q.all(promises);
    }

    function updateWithParentPermissions(source) {
        return SourceEndpoint
        .getFresh({ id: source.parent.id })
        .$promise
        .then(function (parent) {
            return SourceEndpoint
            .saveCache({ id: source.id, role: parent.role })
            .$promise;
        });
    }

    function deleteSource(source) {
        Notify.confirmDelete(
            'notify.source.destroy_confirm',
            'notify.source.destroy_confirm_desc'
        ).then(function () {
            return SourceEndpoint
            .delete({ id: source.id })
            .$promise
            .then(function () {
                Notify.notify('notify.source.destroy_success');
                $location.url('/settings/sources');
            });
        })
        .catch(handleResponseErrors);
    }

    function handleResponseErrors(errorResponse) {
        $scope.processing = false;
        Notify.apiErrors(errorResponse);
    }

    function cancel() {
        $location.path('/settings/sources');
    }

}];
