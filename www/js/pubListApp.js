/**
 * This is the main JS file for the app. It contains the angular
 * controller and service definitions.
 */
var pubListApp = angular.module('pubListApp', ['onsen', 'ngCordova', 'ngResource', 'google-maps']);


/**
 * PubListRestApiService
 *
 * This service should control the interaction with the
 * external Pub List API
 */
 pubListApp.factory('PubResource', function($resource) {
	return $resource('https://31470a49-34fc-4d90-99a1-59bd8cd0d343\\:962226ba-8ae0-4d76-bac6-3d3ac50b2a6a@mooneyspublist.apispark.net/v1/pubs', {});
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
pubListApp.controller('CheckinController', function ($scope, $cordovaGeolocation, PubResource) {
    $scope.loading = false;

    $scope.submitPub = function () {
        PubResource.save({
    		'review': [
        		$scope.review
    		],
    		'longitude': $scope.longitude,
    		'latitude': $scope.latitude,
    		'name': $scope.pubName
		}, function(response) {
			alert('Pub Added To Database');
		});
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
 * MapController
 */
pubListApp.controller('MapController', function($scope, PubResource) {
    $scope.map = {
      control: {},
      center: {
        latitude: 53.3468,
        longitude: -6.2412
      },
      options: {
        streetViewControl: false,
        panControl: false,
        maxZoom: 20,
        minZoom: 3
      },
      zoom: 13,
      dragging: false
    };

	$scope.onMarkerClicked = function (marker) {
        marker.showWindow = true;
        $scope.$apply();
    };

	$scope.pubs = [];
	PubResource.get({}, function(data) {
		$scope.pubs = data.list;
	});
});
