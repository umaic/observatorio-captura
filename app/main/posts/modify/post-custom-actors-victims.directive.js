module.exports = PostCustomActorsVictims;

PostCustomActorsVictims.$inject = [];

function PostCustomActorsVictims() {
    return {
        restrict: 'E',
        scope: {
            formId: '=',
            attribute: '=',
            postValue: '=',
            available: '=',
            selected: '=',
            enableParents: '=',
            form: '=',
            post: '='
        },
        template: require('./custom-actors-victims.html'),
        controller: PostCustomActorsVictimsController
    };
}

PostCustomActorsVictimsController.$inject = [
    '$scope',
    '$rootScope',
    '$sce',
    'ActorEndpoint',
    '_',
    'Notify'
];

function PostCustomActorsVictimsController(
    $scope,
    $rootScope,
    $sce,
    ActorEndpoint,
    _,
    Notify
) {
    $scope.switchTab = switchTab;
    $scope.addVictim = addVictim;
    $scope.delVictim = delVictim;
    //$scope.categorySelected = categorySelected;
    $scope.selectAll = selectAll;
    $scope.selectChild = selectChild;
    $scope.selectParent = selectParent;
    $scope.selectedParents = [];
    $scope.selected_cat = [];
    $scope.disabledActors = [];
    $scope.actor_category = [];
    $scope.victims = [{
        amount: null,
        gender: null,
        status: null,
        ethnic_group: null,
        age: null,
        condition: null,
        occupation: null,
        tag_id: $scope.category_selected
    }];
    $scope.changeActors = changeActors;
    $scope.changeActorsCategory = function (cs) {
        $scope.category_selected = cs;
        _.each($scope.actor_category, function (ac) {
            if (ac.category === cs) {
                $scope.selected = angular.copy(ac.actors);
                $scope.selectedParents = angular.copy(ac.actorsParent);
                $scope.actors = [];
                $scope.actors = angular.copy($scope.available);
                $scope.changeActors();
            }
        });

    };

    activate();

    function addVictim() {
        var v = {
            amount: null,
            gender: null,
            status: null,
            ethnic_group: null,
            age: null,
            condition: null,
            occupation: null,
            tag_id: $scope.category_selected
        };
        $scope.victims.push(v);
    }

    function delVictim(idx) {
        //console.log(idx);
        $scope.victims.splice(idx, 1);
    }

    function activate() {
        if ($scope.post.id) {
            _.each($scope.post.actor_category, function (pac) {
                var exists = false;
                _.each($scope.actor_category, function (ac) {
                    if (ac.category === parseInt(pac.tag_id)) {
                        ac.actors.push(parseInt(pac.actor_id));
                        exists = true;
                    }
                });
                if (!exists) {
                    $scope.selected_cat.push(parseInt(pac.tag_id));
                    $scope.actor_category.push({
                        category: parseInt(pac.tag_id),
                        actors: [parseInt(pac.actor_id)],
                        actorsParent: []
                    });
                }
            });
            $scope.selected_categories = $scope.post.categories.filter(function (category) {
                return $scope.selected_cat.includes(category.id);
            });
            $scope.category_selected = $scope.selected_categories[0].id;
            $scope.changeActorsCategory($scope.category_selected);
            setTimeout(fixInittab, 2000);
        } else {
            // remove default null value when creating a new post
            if ($scope.selected[0] === null) {
                $scope.selected = [];
            }
            $scope.actors = [];
            $scope.actors = $scope.available;
            // making sure no children are selected without their parents
            $scope.changeActors();
        }
        console.log($scope.post);

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
        _.each($scope.actor_category, function (ac) {
            if (ac.category === $scope.category_selected) {
                ac.actors = angular.copy($scope.selected);
                ac.actorsParent = angular.copy($scope.selectedParents);
            }
        });
        $scope.post.values.actor_category = $scope.actor_category;
    }

    function initCategory() {
        if ($scope.selected_categories && $scope.selected_categories.length > 0) {
            $scope.category_selected = $scope.selected_categories[0].id;
        }
    }

    function fixInittab() {
        $scope.tab_history = {};
        // Set initial menu tab
        $scope.switchTab('post', 'actor');
    }

    function switchTab(section, tab) {

        // First unset last active tab
        var old_tab = $scope.tab_history[section];
        if (old_tab) {
            var old_tab_li = old_tab + '-li';
            angular.element(document.getElementById(old_tab)).removeClass('active');
            angular.element(document.getElementById(old_tab_li)).removeClass('active');
        }
        // Set new active tab
        tab = tab + '-' + section;
        $scope.tab_history[section] = tab;
        var tab_li = tab + '-li';
        angular.element(document.getElementById(tab)).addClass('active');
        angular.element(document.getElementById(tab_li)).addClass('active');
    }

    $rootScope.$on('selected_category', function (e) {
        var selected = e.targetScope.selected;
        var categories = e.targetScope.categories;
        _.each(selected, function (sel) {
            var exists = false;
            _.each($scope.actor_category, function (ac) {
                if (ac.category === sel) {
                    exists = true;
                }
            });
            if (!exists) {
                $scope.actor_category.push({
                    category: sel,
                    actors: [],
                    actorsParent: []
                });
            }
        });
        _.each($scope.actor_category, function (ac, index) {
            if (ac && !selected.includes(ac.category)) {
                $scope.actor_category.splice(index, 1);
            }
        });
        $scope.selected_categories = categories.filter(function (category) {
            return selected.includes(category.id);
        });

        initCategory();
        setTimeout(fixInittab, 2000);
    });
}
