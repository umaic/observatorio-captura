module.exports = ActorSelectorDirective;

ActorSelectorDirective.$inject = [];

function ActorSelectorDirective() {
    return {
        restrict: 'E',
        scope: {
            selected: '=',
            enableParents: '=',
            form: '=',
            available: '='
        },
        controller: ActorSelectorController,
        template: require('./actor-selector.html')
    };
}
ActorSelectorController.$inject = ['$scope', '$rootScope', '_'];

function ActorSelectorController($scope, $rootScope, _) {
    $scope.selectAll = selectAll;
    $scope.selectChild = selectChild;
    $scope.selectParent = selectParent;
    $scope.selectedParents = [];
    $scope.disabledActors = [];
    $scope.changeActors = changeActors;

    activate();

    function activate() {
        // remove default null value when creating a new post
        if ($scope.selected[0] === null) {
            $scope.selected = [];
        }
        $scope.actors = [];

        $scope.actors = $scope.available;
        // making sure no children are selected without their parents
        $scope.changeActors();
    }

    $scope.selectAllEnabled = function () {
        if ($scope.enableParents) {
            return $scope.selected.length === $scope.available.length;
        } else {
            return ($scope.selected.length + $scope.selectedParents.length) === $scope.available.length;
        }
    };

    function selectAll() {
        if ($scope.form) {
            // if used in a form, add the ng-dirty-class to categories.
            $scope.form.$setDirty();
        }

        if ($scope.selectAllEnabled()) {
            $scope.selected.splice(0, $scope.selected.length);
            $scope.selectedParents.splice(0, $scope.selectedParents.length);
        } else {
            _.each($scope.available, function (actor) {
                var isParentWithChildren = !actor.parent_id && actor.children.length > 0;
                if (!_.contains($scope.selected, actor.id) && !isParentWithChildren) {
                    $scope.selected.push.apply($scope.selected, [actor.id]);
                } else if (isParentWithChildren && !_.contains($scope.selectedParents, actor.id)) {
                    $scope.selectedParents.push.apply($scope.selectedParents, [actor.id]);
                }
            });
        }
    }

    function selectChild(child) {
        if ($scope.selected.includes(child.id)) {
            $scope.selected = _.filter($scope.selected, function (id) {
                return id !== child.id;
            });
        } else {
            $scope.selected.push(child.id);
            if (!$scope.selected.includes(child.parent.id)) {
                $scope.selected.push(child.parent.id);
            }
        }
    }

    function selectParent(parent) {
        if ($scope.selected.includes(parent.id)) {
            $scope.selected = _.filter($scope.selected, function (id) {
                return id !== parent.id;
            });
            if (parent.children && parent.children.length) {
                _.each(parent.children, function (child) {
                    $scope.selected = _.filter($scope.selected, function (id) {
                        return id !== child.id;
                    });
                });
            }
        } else {
            $scope.selected.push(parent.id);
        }
    }

    function changeActors() {
        _.each($scope.actors, function (actor) {
            var selectedChildren = _.chain(actor.children)
                .pluck('id')
                .intersection($scope.selected)
                .value();
            var parentIndexSelected = -1;
            var isParentWithChildren = !actor.parent_id && actor.children.length > 0;
            // If children are selected, add to disabled actors
            if (selectedChildren.length > 0) {
                $scope.disabledActors[actor.id] = true;
                // ... and ensure this actor is selected
                if (!_.contains($scope.selectedParents, actor.id)) {
                    $scope.selectedParents.push.apply($scope.selectedParents, [actor.id]);
                }
                if (!_.contains($scope.selected, actor.id) && $scope.enableParents === true) {
                    $scope.selected.push.apply($scope.selected, [actor.id]);
                }
            } else {
                var parentIndex = _.findIndex($scope.selectedParents, function (parentId) {
                    return parentId === actor.id;
                });
                parentIndexSelected = _.findIndex($scope.selected, function (parentId) {
                    return parentId === actor.id;
                });
                if (parentIndex >= 0) {
                    $scope.selectedParents.splice(parentIndex, 1);
                    if ($scope.enableParents === true) {
                        $scope.selected.splice(parentIndexSelected, 1);
                    }
                }
                if (isParentWithChildren) {
                    $scope.disabledActors[actor.id] = true;
                } else {
                    $scope.disabledActors[actor.id] = false;
                }
            }

            if ($scope.enableParents === false && isParentWithChildren) {
                parentIndexSelected = _.findIndex($scope.selected, function (parentId) {
                    return parentId === actor.id;
                });
                if (parentIndexSelected >= 0) {
                    $scope.selected.splice(parentIndexSelected, 1);
                }
            }
        });
    }
}
