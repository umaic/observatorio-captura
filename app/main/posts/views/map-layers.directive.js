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

	$scope.close = true;
	$scope.searchText = "";

	$rootScope.$on('show_modal_layers', function (e) {
		$scope.show_modal_layers();
	});

	$scope.show_modal_layers = function(){
		$scope.close = !$scope.close;
	}

	$http({
        method: "get",
        headers: {
            'Content-Type': 'text/xml; charset=utf-8'
        },
        url: '../../../assets/xml/data.xml'
    }).then(function (response) {
        var parser = new DOMParser();
		var xmlDoc = parser.parseFromString(response.data,"text/xml");
		var layers = xmlDoc.getElementsByTagName("Layer");
		var count = 0;
		$scope.layers = []
		for(var l of layers){
			if(count > 0){
				$scope.layers.push({
					name: l.getElementsByTagName("Name")[0].childNodes[0].nodeValue,
					title: l.getElementsByTagName("Title")[0].childNodes[0].nodeValue,
					text: l.getElementsByTagName("Abstract")[0].childNodes[0].nodeValue,
					isChecked: false,
					id: l.getElementsByTagName("Name")[0].childNodes[0].nodeValue
				});
			}
			count++;
		}
    });

    $scope.layer = function (layer){
    	console.log(layer.isChecked);
		if(!layer.isChecked){
			$rootScope.map.eachLayer(function(l) {
		    	if( l instanceof L.TileLayer ){
			    	if(layer.name == l.options.layers)
			    		$rootScope.map.removeLayer(l);
			    }
			});
		}else{
	    	var districtLayer = L.tileLayer.wms('https://geonode.umaic.org/geoserver/wms', {
	            layers: layer.name,
	            tiled: true,
	            format: 'image/png',
	            transparent: true
	        });
	        $rootScope.map.addLayer(districtLayer);
	    }
    }

}
