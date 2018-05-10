module.exports = MapLayersDirective;

MapLayersDirective.$inject = [];

function MapLayersDirective() {
    return {
        restrict: 'E',
        scope: {
            filters: '=',
            selectedPost: '='
        },
        controller: MapLayerController,
        template: require('./map-layers.html')
    };
}

MapLayerController.$inject = ['$http', '$scope', '$rootScope', 'Notify', 'PostLockService', '$state', 'LoadingProgress', 'transformRequestAsFormPost', 'Util'];
function MapLayerController($http, $scope, $rootScope, Notify, PostLockService, $state, LoadingProgress, transformRequestAsFormPost, Util) {

	$http({
        method: "get",
        headers: {
            'Content-Type': 'text/xml; charset=utf-8'
        },
        url: 'https://geonode.umaic.org/geoserver/wms?request=GetCapabilities&service=WMS&version=1.3'
    }).then(function (response) {
        var parser = new DOMParser();
        console.log(response);
		//var xmlDoc = parser.parseFromString(text,"text/xml");
    });

    $scope.layer = function (){
    	var districtLayer = L.tileLayer.wms('https://geonode.umaic.org/geoserver/wms', {
            layers: 'geonode:col_municipality_2014_v2',
            tiled: true,
            format: 'image/png',
            transparent: true
        });
        setTimeout(function(){ 
        	$rootScope.map.addLayer(districtLayer);
        },500);
    }

}
