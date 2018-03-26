module.exports = PostCustomActorsVictims;

PostCustomActorsVictims.$inject = [];

function PostCustomActorsVictims() {
    return {
        restrict: 'E',
        scope: {
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
    'Notify'
];

function PostCustomActorsVictimsController(
    $scope,
    $rootScope,
    $sce,
    Notify
) {
    $scope.switchTab = switchTab;
    $scope.categorySelected = categorySelected;

    $scope.actors = [
        {
            label: "Bandas emergentes",
            value: false
        },
        {
            label: "Delincuencia",
            value: false
        },
        {
            label: "Fuerzas armadas estatales",
            value: false
        },
        {
            label: "Guerrillas",
            value: false
        },
    ];

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

    var initCategory = function (){
        if ($scope.selected_categories && $scope.selected_categories.length > 0) {
            $scope.categoria = $scope.selected_categories[0].id;
        }
    }

    function activate() {
            $scope.tab_history = {};

        // Set initial menu tab
            $scope.switchTab('post', 'actor');
        }

    function categorySelected() {
            $scope.actors = [
                {
                    label: "Bandas emergentes",
                    value: false
                },
                {
                    label: "Delincuencia",
                    value: false
                },
                {
                    label: "Fuerzas armadas estatales",
                    value: false
                },
                {
                    label: "Guerrillas",
                    value: false
                },
            ];
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

    $rootScope.$on('selected_category', function(e){
        var selected = e.targetScope.selected;
        var categories = e.targetScope.categories;

        $scope.selected_categories = categories.filter(function(category){
            return selected.includes(category.id);
        });

        initCategory();
        setTimeout(activate, 2000);
    }); 
}
