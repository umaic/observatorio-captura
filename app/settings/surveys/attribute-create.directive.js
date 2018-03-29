module.exports = [
    '$rootScope',
    '$translate',
    'ModalService',
    '_',
function (
    $rootScope,
    $translate,
    ModalService,
    _
) {
    return {
        restrict: 'E',
        template: require('./attribute-create.html'),
        link: function ($scope, $element, $attrs) {

            // Init an empty saved search
            $scope.newAttribute = {
                required: false,
                options: [],
                config: {},
                priority: 0
            };

            $scope.createNewAttribute = function (type) {
                // Set initial label name based on type
                type.label = '';
                $scope.openAttributeEditModal($scope.activeTask, _.extend($scope.newAttribute, type));
            };

            $scope.closeModal = function () {
                ModalService.close();
            };

            $scope.availableAttrTypes = [
                {
                    label: 'Texto corto',
                    type: 'varchar',
                    input: 'text',
                    description: $translate.instant('survey.text_desc')
                },
                {
                    label: 'Texto largo',
                    type: 'text',
                    input: 'textarea',
                    description: $translate.instant('survey.textarea_desc')
                },
                {
                    label: 'Número (Decimal)',
                    type: 'decimal',
                    input: 'number',
                    description: $translate.instant('survey.decimal_desc')
                },
                {
                    label: 'Número (entero)',
                    type: 'int',
                    input: 'number',
                    description: $translate.instant('survey.integer_desc')
                },
                {
                    label: 'Ubicación',
                    type: 'point',
                    input: 'location',
                    description: $translate.instant('survey.location_desc')
                },
                // {
                //     label: 'Geometry',
                //     type: 'geometry',
                //     input: 'text'
                // },
                {
                    label: 'Fecha',
                    type: 'datetime',
                    input: 'date',
                    description: $translate.instant('survey.date_desc')
                },
                {
                    label: 'Fecha y Hora',
                    type: 'datetime',
                    input: 'datetime',
                    description: $translate.instant('survey.datetime_desc')
                },
                // {
                //     label: 'Time',
                //     type: 'datetime',
                //     input: 'time'
                // },
                {
                    label: 'Lista',
                    type: 'varchar',
                    input: 'select',
                    description: $translate.instant('survey.select_desc')
                },
                {
                    label: 'Radio Buttons(s)',
                    type: 'varchar',
                    input: 'radio',
                    description: $translate.instant('survey.radio_desc')
                },
                {
                    label: 'Checkbox(es)',
                    type: 'varchar',
                    input: 'checkbox',
                    cardinality: 0,
                    description: $translate.instant('survey.checkbox_desc')
                },
                {
                    label: 'Relacionar reporte',
                    type: 'relation',
                    input: 'relation',
                    description: $translate.instant('survey.relation_desc')
                },
                {
                    label: 'Imagen',
                    type: 'media',
                    input: 'upload',
                    description: $translate.instant('survey.upload_desc'),
                    config: {
                        hasCaption: true
                    }
                },
                {
                    label: 'Embed video',
                    type: 'varchar',
                    input: 'video',
                    description: $translate.instant('survey.video_desc')
                },
                {
                    label: 'Markdown',
                    type: 'markdown',
                    input: 'markdown',
                    description: $translate.instant('survey.markdown_desc')
                },
                {
                    label: 'Categorías',
                    type: 'tags',
                    cardinality: 0,
                    input: 'tags',
                    description: $translate.instant('settings.settings_list.categories_desc')
                },
                {
                    label: 'Personalizado (Fuentes de información)',
                    type: 'custom_sources',
                    input: 'custom_sources',
                    description: 'Agregue fuentes de Información'
                },
                {
                    label: 'Personalizado (Actores y Afectados)',
                    type: 'custom_actors_victims',
                    input: 'custom_actors_victims',
                    description: 'Agregue actores y victimas para cada categoría'
                }
            ];
        }
    };
}];
