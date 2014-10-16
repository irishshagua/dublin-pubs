/**
 * This is the main JS file for the app. It contains the angular 
 * controller and service definitions.
 */
var pubListApp = angular.module('pubListApp', ['onsen', 'ngCordova', 'leaflet-directive', 'ngResource']);


/**
 * UtilityService
 */
pubListApp.service('UtilityService', function () {
    this.setOrDefault = function(prop) {
        return prop === 'undefined' ? '' : prop;
    };
});


/**
 * PubListRestApiService
 * 
 * This service should control the interaction with the
 * external Pub List API
 */
 pubListApp.factory('PubResource', function($resource) {
	return $resource('https://mooneyspublist.apispark.net/v1/pubs/', {})
 });
 
pubListApp.service('PubListRestApiService', function () {
    this.getPubs = function () {
        console.log("Get Pubs called");
        return [
            {
                id: 1, 
                name: 'Dawson Lounge', 
                longitude: -6.25886, 
                latitide: 53.33972,
                review: ['Smallest pub in Ireland']
            }
        ];    
    };
    
    this.submitPub = function (pub) {
        console.log("Submit Pub: " + pub.name + " " + pub.latitude + " " + pub.longitude + " " + pub.review);        
    };
});

/**
 * PubListController
 * 
 */
pubListApp.controller('PubListController', function ($scope, PubResource) {
	PubResource.get({}, function(data) {
		$scope.pubs = data.list;
	});
});

/**
 * CheckinController
 * 
 */ 
pubListApp.controller('CheckinController', function ($scope, $cordovaGeolocation, PubListRestApiService) {
    $scope.loading = false;
    
    $scope.submitPub = function () {
        PubListRestApiService.submitPub(
           {
               name: $scope.name,
               latitude: $scope.latitude,
               longitude: $scope.longitude,
               review: $scope.review
           }
        );
    };
   
    $scope.findGeoCoords = function () {
        $scope.loading = true;
        
        $cordovaGeolocation
            .getCurrentPosition( {
                timeout: 5000, 
                enableHighAccuracy: true 
            })
            .then(function (position) {
                $scope.loading = false;
                $scope.latitude = position.coords.latitude;    
                $scope.longitude = position.coords.longitude;
            }, function (err) {
                $scope.loading = false;        
                alert("Trying to load geo coords failed: " + err.message);
            });
    };
});


/**
 * GlobalSettingsController
 */
pubListApp.controller('GlobalSettingsController', function ($scope, UtilityService) {    
    // Globally Stored Settings
    $scope.pubsApiDomain = UtilityService.setOrDefault(window.localStorage.pubsApiDomain);
    $scope.pubsApiVersion = UtilityService.setOrDefault(window.localStorage.pubsApiVersion);
    $scope.pubsApiLogin = UtilityService.setOrDefault(window.localStorage.pubsApiLogin);
    $scope.pubsApiPassword = UtilityService.setOrDefault(window.localStorage.pubsApiPassword);
    
    $scope.persistToStorage = function () {
        window.localStorage.pubsApiDomain = $scope.pubsApiDomain;
        window.localStorage.pubsApiVersion = $scope.pubsApiVersion;
        window.localStorage.pubsApiLogin = $scope.pubsApiLogin;
        window.localStorage.pubsApiPassword = $scope.pubsApiPassword;
    };
});


/**
 * SearchController
 */
pubListApp.controller('SearchController', function ($scope, PubResource) {
    $scope.pubs = [];
	PubResource.get({}, function(data) {	
		$scope.pubs = data.list;
	});    
});


/**
 * MapController
 */
pubListApp.controller('MapController', function($scope, PubResource, leafletData) {
	$scope.screenDimensions = {
		width: window.innerWidth - 45,
		height: window.innerHeight - 200
	};
	
	$scope.dublin = {
		lat: 53.3468,
		lng: -6.2412,
		zoom: 11
	};
	
	$scope.dublinPubs = {};
	PubResource.get({}, function(data) {	
		var pubCount = 0;
		angular.forEach(data.list, function(pub) {
			$scope.dublinPubs[pubCount++] = {lat: pub.latitude, lng: pub.longitude, message: pub.name};
		});
	});
	
	
	$scope.clickToInvalidateSize = function() {
		leafletData.getMap().then(function(map) {
			map.callInitHooks();
			map._onResize();
			map.invalidateSize();
		});
	}
});