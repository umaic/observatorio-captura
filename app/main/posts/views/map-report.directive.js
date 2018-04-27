module.exports = MapReportDirective;
var apiUrl = window.ushahidi.apiUrl = 'http://apimonitor.kuery.com.co';

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

MapReportController.$inject = ['$http', '$scope', '$rootScope', 'Notify', 'PostLockService', '$state', 'LoadingProgress'];
function MapReportController($http, $scope, $rootScope, Notify, PostLockService, $state, LoadingProgress) {
    
    $scope.tab = 1;
    $scope.showTabs = true;

    $scope.changeTab = function(tab) {
    	$scope.tab = tab;
    };

    $scope.showHideTabs = function() {
    	$scope.showTabs = !$scope.showTabs;
    };

    $http({
        method: "get",
        url: apiUrl + '/report',
    }).then(function(response) {
        $scope.resume = response.data.events.total_by_type;
        $scope.categories = [];
        $scope.data1 = [];
        $scope.data2 = [];
        Object.keys(response.data.events.dates).forEach(function(k, v){
        	$scope.categories.push(getDateFormatter(k));
		});
		var cat = response.data.events.total_by_day.desastres;
		var data1 = Object.keys(cat).map(function(k) { return cat[k] });
		cat = response.data.events.total_by_day.violencia_armada;
		var data2 = Object.keys(cat).map(function(k) { return cat[k] });
		$scope.events_by_category = response.data.events.total_by_categories;
		$scope.victims_count = response.data.events.victims_count;
		
		Highcharts.chart('container', {
	    	chart:{
	    		height: 220
	    	},
		    title: {
		        text: 'EVENTOS'
		    },
		    xAxis: {
		        categories: $scope.categories,
		        crosshair: true,
		        tickInterval: 2
		    },
		    series: [{
		    	showInLegend: false,
		        name: 'Desastres',
		        type: 'line',
		        yAxis: 1,
		        data: data1,
		        color: '#D40000'
		    }, {
		    	showInLegend: false,
		        name: 'Violencia Armada',
		        type: 'line',
		        data: data2,
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
    });

	function abbreviateNumber(value) {
	    var newValue = value;
	    if (value >= 1000) {
	        var suffixes = ["", "k", "m", "b","t"];
	        var suffixNum = Math.floor( (""+value).length/3 );
	        var shortValue = '';
	        for (var precision = 2; precision >= 1; precision--) {
	            shortValue = parseFloat( (suffixNum != 0 ? (value / Math.pow(1000,suffixNum) ) : value).toPrecision(precision));
	            var dotLessShortValue = (shortValue + '').replace(/[^a-zA-Z 0-9]+/g,'');
	            if (dotLessShortValue.length <= 2) { break; }
	        }
	        if (shortValue % 1 != 0)  shortNum = shortValue.toFixed(1);
	        newValue = shortValue+suffixes[suffixNum];
	    }
	    return newValue;
	}

	function getDateFormatter(date_string){
		var tt = date_string.split("-");
		var d = new Date(date_string)
        return tt[2] + ' ' + d.toLocaleString("en-us", {month: "short"});
	}
}
