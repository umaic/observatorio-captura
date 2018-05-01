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
        template: require('./post-custom-actors-victims.html'),
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

    $scope.setAge = setAge;
    $scope.setCondition = setCondition;
    $scope.setEthnic = setEthnic;

    //$scope.categorySelected = categorySelected;
    $scope.selectAll = selectAll;
    $scope.selectChild = selectChild;
    $scope.selectParent = selectParent;
    $scope.selectedParents = [];
    $scope.disabledActors = [];
    $scope.actor_category = [];
    $scope.victim_category = [];
    $scope.post.values.victim_category = $scope.victim_category;
    $scope.victims = [{
        amount: null,
        victim_gender: null,
        victim_status: null,
        victim_ethnic_group: null,
        victim_sub_ethnic_group: null,
        victim_age: null,
        victim_age_group: null,
        victim_condition: null,
        victim_sub_condition: null,
        victim_occupation: null
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
        _.each($scope.victim_category, function (vc, index) {
            if (parseInt(vc.category) === cs) {
                $scope.victims = $scope.victim_category[index].victims;
            }
        });
    };

    activate();

    function addVictim() {
        $scope.victims.push({
            amount: null,
            victim_gender: null,
            victim_status: null,
            victim_ethnic_group: null,
            victim_sub_ethnic_group: null,
            victim_age: null,
            victim_age_group: null,
            victim_condition: null,
            victim_sub_condition: null,
            victim_occupation: null
        });
    }

    function delVictim(idx) {
        //console.log(idx);
        $scope.victims.splice(idx, 1);
    }

    function setAge(victim) {
        victim.ages_by_group = _.where($scope.post.victimsData.victim_age, {id_age_group: victim.victim_age_group});
    }

    function setCondition(victim) {
        victim.sub_conditions = _.where($scope.post.victimsData.victim_sub_condition, {id_condition: victim.victim_condition});
    }

    function setEthnic(victim) {
        victim.sub_ethnics = _.where($scope.post.victimsData.victim_sub_ethnic_group, {id_ethnic_group: victim.victim_ethnic_group});
    }

    function activate() {
        if ($scope.post.id) {
            $scope.selected_cat = $scope.post.values['4e8546ce-e248-47f4-889b-94c33a900f73'];
            _.each($scope.post.actor_category, function (pac) {
                var found_ac = false;
                _.each($scope.actor_category, function (ac) {
                    if (ac.category === parseInt(pac.tag_id)) {
                        ac.actors.push(parseInt(pac.actor_id));
                        found_ac = true;
                    }
                });
                if (!found_ac) {
                    $scope.actor_category.push({
                        category: parseInt(pac.tag_id),
                        actors: [parseInt(pac.actor_id)],
                        actorsParent: []
                    });
                }
            });
            _.each($scope.post.victim_category, function (pvc) {
                var found_vc = false;
                _.each($scope.victim_category, function (vc) {
                    if (vc.category === parseInt(pvc.tag_id)) {
                        vc.victims.push({
                            amount: parseInt(pvc.amount),
                            victim_gender: pvc.id_gender,
                            victim_status: pvc.id_status,
                            victim_ethnic_group: pvc.id_ethnic_group,
                            victim_sub_ethnic_group: pvc.id_sub_ethnic_group,
                            victim_age: pvc.id_age,
                            victim_age_group: pvc.id_age_group,
                            victim_condition: pvc.id_condition,
                            victim_sub_condition: pvc.id_sub_condition,
                            victim_occupation: pvc.id_occupation
                        });
                        found_vc = true;
                    }
                });
                if (!found_vc) {
                    $scope.victim_category.push({
                        category: parseInt(pvc.tag_id),
                        victims: [{
                            amount: parseInt(pvc.amount),
                            victim_gender: pvc.id_gender,
                            victim_status: pvc.id_status,
                            victim_ethnic_group: pvc.id_ethnic_group,
                            victim_sub_ethnic_group: pvc.id_sub_ethnic_group,
                            victim_age: pvc.id_age,
                            victim_age_group: pvc.id_age_group,
                            victim_condition: pvc.id_condition,
                            victim_sub_condition: pvc.id_sub_condition,
                            victim_occupation: pvc.id_occupation
                        }]
                    });
                }
            });
            $scope.selected_categories = $scope.post.categories.filter(function (category) {
                return $scope.selected_cat.includes(category.id);
            });
            $scope.category_selected = $scope.selected_categories[0].id;
            $scope.changeActorsCategory($scope.category_selected);
            _.each($scope.victim_category, function (vc, index) {
                if (vc.category === $scope.category_selected) {
                    $scope.victims = $scope.victim_category[index].victims;
                }
            });
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
            _.each($scope.victim_category, function (vc, index) {
                if (vc.category === $scope.category_selected) {
                    $scope.victims = $scope.victim_category[index].victims;
                }
            });
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
            var found_ac = false;
            var found_vc = false;
            _.each($scope.actor_category, function (ac) {
                if (ac.category === sel) {
                    found_ac = true;
                }
            });
            _.each($scope.victim_category, function (vc) {
                if (vc.category === sel) {
                    found_vc = true;
                }
            });
            if (!found_ac) {
                $scope.actor_category.push({
                    category: sel,
                    actors: [],
                    actorsParent: []
                });
            }
            if (!found_vc) {
                $scope.victim_category.push({
                    category: sel,
                    victims: [{
                        amount: null,
                        victim_gender: null,
                        victim_status: null,
                        victim_ethnic_group: null,
                        victim_sub_ethnic_group: null,
                        victim_age: null,
                        victim_age_group: null,
                        victim_condition: null,
                        victim_sub_condition: null,
                        victim_occupation: null
                    }]
                });
            }
        });
        _.each($scope.actor_category, function (ac, index) {
            if (ac && !selected.includes(ac.category)) {
                $scope.actor_category.splice(index, 1);
            }
        });
        _.each($scope.victim_category, function (vc, index) {
            if (vc && !selected.includes(vc.category)) {
                $scope.victim_category.splice(index, 1);
            }
        });
        $scope.selected_categories = categories.filter(function (category) {
            return selected.includes(category.id);
        });

        initCategory();
        setTimeout(fixInittab, 2000);
    });
}
