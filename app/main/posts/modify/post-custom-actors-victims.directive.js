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
            form: '='
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
    'Notify'
];

function PostCustomActorsVictimsController(
    $scope,
    $rootScope,
    $sce,
    ActorEndpoint,
    Notify
) {
    $scope.switchTab = switchTab;
    //$scope.categorySelected = categorySelected;
    $scope.selectAll = selectAll;
    $scope.selectChild = selectChild;
    $scope.selectParent = selectParent;
    $scope.selectedParents = [];
    $scope.disabledActors = [];
    $scope.changeActors = changeActors;

    $scope.estados = [
        {
            label: "Desconocido",
            value: 'desconocido'
        },
        {
            label: "Herido",
            value: 'herido'
        },
        {
            label: "Muerto",
            value: 'muerto'
        },
        {
            label: "No aplica",
            value: 'na'
        },
    ];

    $scope.generos = [
        {
            label: "Desconocido",
            value: 'desconocido'
        },
        {
            label: "Femenino",
            value: 'femenino'
        },
        {
            label: "Masculino",
            value: 'masculino'
        },
    ];

    $scope.poblaciones = [
        {
            label: "AfroColombiano",
            value: 'afro'
        },
        {
            label: "Extranjero",
            value: 'extranjero'
        },
        {
            label: "Gitano",
            value: 'gitano'
        },
        {
            label: "Indígena",
            value: 'indigena'
        },
        {
            label: "Menores",
            value: 'menores'
        },
    ];

    $scope.condiciones = [
        {
            label: "Actor armado no estatal",
            value: 'actor_no_estatal'
        },
        {
            label: "Civil",
            value: 'civil'
        },
        {
            label: "Desconocido",
            value: 'desconocido'
        },
        {
            label: "Desmovilizado",
            value: 'desmovilizado'
        },
        {
            label: "Militar",
            value: 'militar'
        },
    ];

    $scope.ocupaciones = [
        {
            label: "Alcalde",
            value: 'alcalde'
        },
        {
            label: "Combatiente",
            value: 'combatiente'
        },
        {
            label: "Comerciante",
            value: 'comerciante'
        },
        {
            label: "Contratista",
            value: 'contratista'
        },
        {
            label: "Estudiante",
            value: 'estudiante'
        },
    ];

    $scope.edades = [
        {
            label: "Desconocido",
            value: 'desconocido'
        },
        {
            label: "Mayor de 18 años",
            value: 'mayor'
        },
        {
            label: "Menor de 18 años",
            value: 'menor'
        },
    ];

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

    var initCategory = function (){
        if ($scope.selected_categories && $scope.selected_categories.length > 0) {
            $scope.categoria = $scope.selected_categories[0].id;
        }
    }

    function fixInittab() {
            $scope.tab_history = {};

        // Set initial menu tab
            $scope.switchTab('post', 'actor');
        }

    // function categorySelected() {
    //         $scope.actors = [
    //             {
    //                 label: "Bandas emergentes",
    //                 value: false
    //             },
    //             {
    //                 label: "Delincuencia",
    //                 value: false
    //             },
    //             {
    //                 label: "Fuerzas armadas estatales",
    //                 value: false
    //             },
    //             {
    //                 label: "Guerrillas",
    //                 value: false
    //             },
    //         ];
    //     }

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

    $rootScope.$on('selected_category', function(e){
        var selected = e.targetScope.selected;
        var categories = e.targetScope.categories;

        $scope.selected_categories = categories.filter(function(category){
            return selected.includes(category.id);
        });

        initCategory();
        setTimeout(fixInittab, 2000);
    }); 
}
