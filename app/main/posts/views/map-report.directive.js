module.exports = MapReportDirective;

MapReportDirective.$inject = [];

function MapReportDirective() {
    return {
        restrict: 'E',
        scope: {
            filters: '=',
            selectedPost: '='
        },
        controller: MapReportController,
        template: require('./map-report.html')
    };
}

MapReportController.$inject = ['$http', '$scope', '$rootScope', 'Notify', 'PostLockService', '$state', 'LoadingProgress', 'transformRequestAsFormPost', 'Util'];
function MapReportController($http, $scope, $rootScope, Notify, PostLockService, $state, LoadingProgress, transformRequestAsFormPost, Util) {
    
    $scope.tab = 1;
    $scope.showTabs = true;
    var countg = 0;

    $scope.changeTab = function (tab) {
        $scope.tab = tab;
    };

    $scope.showHideTabs = function () {
        $scope.showTabs = !$scope.showTabs;
    };

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
        
    	//$rootScope.addLayersToMap();
    	//addWMSLayer('geonode:col_admbnda_adm2_igac_ochal', 'geonode:col_admbnda_adm2_igac_ochal', true);
    }

    $scope.$on('parentmethod', function (event, ids) {
        $scope.categories = ids;
        $http({
	        method: "post",
	        url: Util.url('/report'),
	        headers: {
                'Content-Type' : 'application/x-www-form-urlencoded'
            },
            transformRequest: transformRequestAsFormPost,
            data: {ids: ids}
	    }).then(function(response) {
	        $scope.resume = response.data.events.total_by_type;
	        $scope.resumeCount = Object.keys($scope.resume).length;
	        $scope.categories = [];
	        $scope.data1 = [];
	        $scope.data2 = [];
	        Object.keys(response.data.events.dates).forEach(function(k, v){
	        	$scope.categories.push(getDateFormatter(k));
			});
			var cat = response.data.events.total_by_day.desastres;
			$scope.data1 = cat == undefined ? [] : Object.keys(cat).map(function(k) { return cat[k] });
			cat = response.data.events.total_by_day.violencia_armada;
			$scope.data2 = cat == undefined ? [] : Object.keys(cat).map(function(k) { return cat[k] });
			$scope.events_by_category = response.data.events.total_by_categories;
			$scope.victims_count = response.data.events.victims_count;
			print_graphics();
	    });
    })

    $http({
        method: "get",
        url: Util.url('/report')
    }).then(function (response) {
        $scope.resume = response.data.events.total_by_type;
        $scope.resumeCount = Object.keys($scope.resume).length;
        $scope.categories = [];
        $scope.data1 = [];
        $scope.data2 = [];
        Object.keys(response.data.events.dates).forEach(function(k, v){
        	$scope.categories.push(getDateFormatter(k));
		});
		var cat = response.data.events.total_by_day.desastres;
		$scope.data1 = cat == undefined ? [] : Object.keys(cat).map(function(k) { return cat[k] });
		cat = response.data.events.total_by_day.violencia_armada;
		$scope.data2 = cat == undefined ? [] : Object.keys(cat).map(function(k) { return cat[k] });
		$scope.events_by_category = response.data.events.total_by_categories;
		$scope.victims_count = response.data.events.victims_count;
		print_graphics();
    });

    function print_graphics(){

    	var newDiv = angular.element("<div id='graph" + countg + "'></div>");
    	var newDiv2 = angular.element("<div id='graph2'></div>");
    	var newDiv3 = angular.element("<div id='graph3'></div>");
	    var target = document.getElementById('container');
	    angular.element(target).append(newDiv);
	    angular.element(target).append(newDiv2);
	    angular.element(target).append(newDiv3);

    	$scope.chart = Highcharts.chart("graph" + countg, {
	    	chart:{
	    		height: 220
	    	},
		    title: {
		        text: 'EVENTOS'
		    },
		    xAxis: {
		        categories: $scope.categories,
		        crosshair: true,
		        tickInterval: 2,
		        isDirty: true
		    },
		    series: [{
		    	showInLegend: false,
		        name: 'Desastres',
		        type: 'line',
		        yAxis: 1,
		        data: $scope.data1,
		        color: '#D40000'
		    }, {
		    	showInLegend: false,
		        name: 'Violencia Armada',
		        type: 'line',
		        data: $scope.data2,
		        color: '#2CA02C'
		    }],
		    yAxis: [{ // Primary yAxis
		        labels: {
		            format: '{value}',
		            style: {
		                color: '#2CA02C'
		            }
		        },
		        title: {
		            text: 'Eventos',
		            style: {
		                color: '#2CA02C'
		            }
		        },
		        opposite: true,
		        isDirty: true,
		        formatter: function(){
	              return abbreviateNumber(this.value);
	            }
		    }, {
		        title: {
		            text: 'Eventos',
		            style: {
		                color: '#D40000'
		            }
		        },
		        labels: {
		            format: '{value}',
		            style: {
		                color: '#D40000'
		            }
		        }
		    }]
		});
		Highcharts.chart('graph2', {
		    chart: {
		        type: 'pie',
		        height: 220
		    },
		    title: {
		        text: 'Victimas por grupo poblacional'
		    },
		    plotOptions: {
		        series: {
		            dataLabels: {
		                enabled: true,
		                format: '{point.name}: {point.y:.1f}%'
		            }
		        }
		    },

		    tooltip: {
		        headerFormat: '<span style="font-size:11px">{series.name}</span><br>',
		        pointFormat: '<span style="color:{point.color}">{point.name}</span>: <b>{point.y:.2f}%</b> of total<br/>'
		    },

		    "series": [
		        {
		            "name": "Datos",
		            "colorByPoint": true,
		            "data": [
		                {
		                    "name": "Indígena",
		                    "y": (($scope.victims_count.indigenas * 100) / 100),
		                    "drilldown": "Indigena"
		                },
		                {
		                    "name": "Población en general",
		                    "y": (($scope.victims_count.otro * 100) / 100),
		                    "drilldown": "Población en general"
		                },
		                {
		                    "name": "Sin info",
		                    "y": (($scope.victims_count.no_info * 100) / 100),
		                    "drilldown": "Sin info"
		                },
		                {
		                    "name": "Extranjero",
		                    "y": (($scope.victims_count.extranjero * 100) / 100),
		                    "drilldown": "Extranjero"
		                }
		            ]
		        }
		    ]
		});
		Highcharts.chart('graph3', {
		    chart: {
		        type: 'pie',
		        height: 220
		    },
		    title: {
		        text: 'Victimas por genero'
		    },
		    plotOptions: {
		        series: {
		            dataLabels: {
		                enabled: true,
		                format: '{point.name}: {point.y:.1f}%'
		            }
		        }
		    },

		    tooltip: {
		        headerFormat: '<span style="font-size:11px">{series.name}</span><br>',
		        pointFormat: '<span style="color:{point.color}">{point.name}</span>: <b>{point.y:.2f}%</b> of total<br/>'
		    },

		    "series": [
		        {
		            "name": "Datos",
		            "colorByPoint": true,
		            "data": [
		                {
		                    "name": "Hombres",
		                    "y": (($scope.victims_count.hombres * 100) / 100),
		                    "drilldown": "Hombres"
		                },
		                {
		                    "name": "Mujeres",
		                    "y": (($scope.victims_count.menores * 100) / 100),
		                    "drilldown": "Mujeres"
		                },
		                {
		                    "name": "Desconocido",
		                    "y": (($scope.victims_count.desconocido * 100) / 100),
		                    "drilldown": "Desconocido"
		                }
		            ]
		        }
		    ]
		});
		//$scope.$apply();
    }

    function abbreviateNumber(value) {
        var newValue = value;
        if (value >= 1000) {
            var suffixes = ["", "k", "m", "b", "t"];
            var suffixNum = Math.floor(("" + value).length / 3);
            var shortValue = '';
            for (var precision = 2; precision >= 1; precision--) {
                shortValue = parseFloat((suffixNum != 0 ? (value / Math.pow(1000, suffixNum)) : value).toPrecision(precision));
                var dotLessShortValue = (shortValue + '').replace(/[^a-zA-Z 0-9]+/g, '');
                if (dotLessShortValue.length <= 2) {
                    break;
                }
            }
            if (shortValue % 1 != 0) shortNum = shortValue.toFixed(1);
            newValue = shortValue + suffixes[suffixNum];
        }
        return newValue;
    }

    function getDateFormatter(date_string) {
        var tt = date_string.split("-");
        var d = new Date(date_string)
        return tt[2] + ' ' + d.toLocaleString("en-us", {month: "short"});
    }

}
