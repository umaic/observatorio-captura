require('angular');
require('@uirouter/angularjs');
require('angular-resource');
require('angular-translate');
require('angular-translate-loader-static-files');
require('angular-ui-bootstrap');
require('angular-datepicker/build/angular-datepicker');
require('angular-sanitize');
require('angular-elastic');
require('angular-filter');
require('angular-local-storage');
require('checklist-model');
require('ngGeolocation/ngGeolocation');
require('ng-showdown');
window.Highcharts = require('highcharts');
require('alasql');
window.d3 = require('d3'); // Required for nvd3
require('./common/wrapper/nvd3-wrapper');
require('angular-nvd3/src/angular-nvd3');
require('angular-cache');
require('angular-linkify');
window.auth0 = require('auth0-js');  // Required for angular-auth0
require('angular-auth0');

// Load ushahidi modules
require('./common/common-module.js');
require('./main/main-module.js');
require('./settings/settings.module.js');

// Load platform-pattern-library CSS
require('ushahidi-platform-pattern-library/assets/fonts/Lato/css/fonts.css');
require('ushahidi-platform-pattern-library/assets/css/style.min.css');
require('../sass/vendor.scss');

// Stub ngRaven module incase its not configured
angular.module('ngRaven', []);

// Make sure we have a window.ushahidi object
window.ushahidi = window.ushahidi || {};

// this 'environment variable' will be set within the gulpfile
var backendUrl = window.ushahidi.backendUrl = (window.ushahidi.backendUrl || BACKEND_URL).replace(/\/$/, ''),
    intercomAppId = window.ushahidi.intercomAppId = window.ushahidi.intercomAppId || '',
    appStoreId = window.ushahidi.appStoreId = window.ushahidi.appStoreId || '',
    apiUrl = window.ushahidi.apiUrl = backendUrl + '/api/v3',
    //apiUrl = window.ushahidi.apiUrl = 'http://apimonitor.kuery.com.co' + '/api/v3',
    platform_websocket_redis_adapter_url = window.ushahidi.platform_websocket_redis_adapter_url || '',
    claimedAnonymousScopes = [
        'apikeys',
        'posts',
        'media',
        'forms',
        'api',
        'tags',
        'actors',
        'sources',
        'savedsearches',
        'sets',
        'users',
        'stats',
        'layers',
        'config',
        'messages',
        'notifications',
        'webhooks',
        'contacts',
        'roles',
        'permissions',
        'csv',
        'tos'
    ];

angular.module('app',
    [
        'checklist-model',
        'monospaced.elastic',
        'auth0.auth0',
        'ui.router',
        'ngResource',
        'LocalStorageModule',
        'pascalprecht.translate',
        'ui.bootstrap.pagination',
        'angular-datepicker',
        'angular.filter',
        'ng-showdown',
        'ngGeolocation',
        'nvd3',
        'angular-cache',
        'linkify',
        'ngRaven',
        'ushahidi.common',
        'ushahidi.main',
        'ushahidi.settings',
        'ui.bootstrap.dropdown',
        'ngSanitize'
    ])

    .constant('CONST', {
        BACKEND_URL: backendUrl,
        API_URL: apiUrl,
        INTERCOM_APP_ID: intercomAppId,
        APP_STORE_ID: appStoreId,
        DEFAULT_LOCALE: 'en_US',
        auth0_clientID: '5RVlNXQkW9vBM35eimh4cpaChvxJjAPg',
        auth0_domain: 'kuery.auth0.com',
        auth0_audience: 'https://kuery.auth0.com/userinfo',
        auth0_redirectUri: 'http://monitor.kuery.com.co:3000/callback',
        OAUTH_CLIENT_ID: 'ushahidiui',
        OAUTH_CLIENT_SECRET: '35e7f0bca957836d05ca0492211b0ac707671261',
        CLAIMED_ANONYMOUS_SCOPES: claimedAnonymousScopes,
        CLAIMED_USER_SCOPES: claimedAnonymousScopes.concat('dataproviders'),
        MAPBOX_API_KEY: window.ushahidi.mapboxApiKey || 'pk.eyJ1IjoidXNoYWhpZGkiLCJhIjoiY2lxaXUzeHBvMDdndmZ0bmVmOWoyMzN6NiJ9.CX56ZmZJv0aUsxvH5huJBw', // Default OSS mapbox api key
        TOS_RELEASE_DATE: new Date(window.ushahidi.tosReleaseDate).toJSON() ? new Date(window.ushahidi.tosReleaseDate) : false, // Date in UTC
        PLATFORM_WEBSOCKET_REDIS_ADAPTER_URL: platform_websocket_redis_adapter_url,
        EXPORT_POLLING_INTERVAL: window.ushahidi.export_polling_interval || 30000,
        EXPORT_POLLING_COUNT: window.ushahidi.export_polling_count || 50
    })
    .config(config)
    .config(['$compileProvider', function ($compileProvider) {
        $compileProvider.debugInfoEnabled(false);
    }])
    .config(['$locationProvider', function ($locationProvider) {
        $locationProvider.html5Mode(true).hashPrefix('!');
    }])
    .config(['$urlRouterProvider', '$urlMatcherFactoryProvider',
        function ($urlRouterProvider, $urlMatcherFactoryProvider) {
            $urlRouterProvider.when('', '/views/map');
            $urlRouterProvider.when('/', '/views/map');
            // if the path doesn't match any of the urls you configured
            // otherwise will take care of routing the user to the specified url
            $urlRouterProvider.otherwise('/404');
            $urlMatcherFactoryProvider.strictMode(false);
        }])
    .config(['$showdownProvider', function ($showdownProvider) {
        $showdownProvider.setOption('simplifiedAutoLink', true);
        $showdownProvider.setOption('excludeTrailingPunctuationFromURLs', true);
        $showdownProvider.setOption('openLinksInNewWindow', true);
        $showdownProvider.setOption('tasklists', true);
        $showdownProvider.setOption('sanitize', true);
    }])

    .factory('_', function () {
        return require('underscore/underscore');
    })
    .factory('d3', function () {
        return window.d3;
    })
    .factory('URI', function () {
        return require('URIjs/src/URI.js');
    })
    .factory('Leaflet', function () {
        var L = require('leaflet');
        // Load leaflet plugins here too
        require('imports-loader?L=leaflet!leaflet.markercluster');
        require('imports-loader?L=leaflet!leaflet.locatecontrol/src/L.Control.Locate');
        return L;
    })
    .factory('moment', function () {
        return require('moment');
    })
    .factory('io', function () {
        return require('socket.io-client');
    })
    .factory('BootstrapConfig', ['_', function (_) {
        return window.ushahidi.bootstrapConfig ?
            _.indexBy(window.ushahidi.bootstrapConfig, 'id') :
            {map: {}, site: {}, features: {}};
    }])
    // inject the router instance into a `run` block by name
    // .run(['$uiRouter', '$trace', '$location', function ($uiRouter, $trace, $location) {
    //     // * uncomment this to enable the visualizer *
    //     let Visualizer = require('@uirouter/visualizer').Visualizer;
    //     let pluginInstance = $uiRouter.plugin(Visualizer);
    //     $trace.enable('TRANSITION');
    // }])
    .run(['$rootScope', 'LoadingProgress', function ($rootScope, LoadingProgress) {
        $rootScope.$on('$stateChangeError', console.log.bind(console));
        // this handles the loading-state app-wide
        LoadingProgress.watchTransitions();
    }])
    .run(['$rootScope', function ($rootScope) {
        $rootScope.$on('$stateChangeError', console.log.bind(console));
    }])
    .run(function () {
        angular.element(document.getElementById('bootstrap-app')).removeClass('hidden');
        angular.element(document.getElementById('bootstrap-loading')).addClass('hidden');
    })
    .controller('CallbackController', ['$scope', 'Authentication', function ($scope, Authentication) {
        Authentication.handleAuthentication();
    }])
    .factory(
        "transformRequestAsFormPost",
        function () {
            // I prepare the request data for the form post.
            function transformRequest(data, getHeaders) {
                var headers = getHeaders();
                headers["Content-type"] = "application/x-www-form-urlencoded; charset=utf-8";
                return (serializeData(data));
            }

            // Return the factory value.
            return (transformRequest);
            // ---
            // PRVIATE METHODS.
            // ---
            // I serialize the given Object into a key-value pair string. This
            // method expects an object and will default to the toString() method.
            // --
            // NOTE: This is an atered version of the jQuery.param() method which
            // will serialize a data collection for Form posting.
            // --
            // https://github.com/jquery/jquery/blob/master/src/serialize.js#L45
            function serializeData(data) {
                // If this is not an object, defer to native stringification.
                if (!angular.isObject(data)) {
                    return ((data == null) ? "" : data.toString());
                }
                var buffer = [];
                // Serialize each key in the object.
                for (var name in data) {
                    if (!data.hasOwnProperty(name)) {
                        continue;
                    }
                    var value = data[name];
                    buffer.push(
                        encodeURIComponent(name) +
                        "=" +
                        encodeURIComponent((value == null) ? "" : value)
                    );
                }
                // Serialize the buffer and clean it up for transportation.
                var source = buffer
                    .join("&")
                    .replace(/%20/g, "+")
                ;
                return (source);
            }
        }
    );


config.$inject = [
    '$stateProvider',
    '$locationProvider',
    '$urlRouterProvider',
    'CONST',
    'angularAuth0Provider'
];

function config(
    $stateProvider,
    $locationProvider,
    $urlRouterProvider,
    CONST,
    angularAuth0Provider
) {

    $stateProvider
        .state('callback', {
            url: '/callback',
            controller: 'CallbackController',
            templateUrl: 'settings/callback/callback.html',
            controllerAs: 'vm'
        });
    // Initialization for the angular-auth0 library

    angularAuth0Provider.init({
        clientID: CONST.auth0_clientID,
        domain: CONST.auth0_domain,
        responseType: 'token id_token',
        audience: CONST.auth0_audience,
        redirectUri: CONST.auth0_redirectUri,
        scope: 'openid'
    });

    $urlRouterProvider.otherwise('/');

    $locationProvider.hashPrefix('');

    /// Comment out the line below to run the app
    // without HTML5 mode (will use hashes in routes)
    $locationProvider.html5Mode(true);
}
