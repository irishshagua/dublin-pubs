/**
 * This is the main JS file for the app. It contains the angular
 * controller and service definitions.
 */
var pubListApp = angular.module('pubListApp', ['onsen', 'ngCordova', 'ngResource', 'uiGmapgoogle-maps']);


/**
 * PubListRestApiService
 *
 * This service should control the interaction with the
 * external Pub List API
 */
 pubListApp.factory('PubResource', function($resource) {
	return $resource('https://mooneyspublist.apispark.net/v1/pubs', {});
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
		center: {
			latitude: 53.3468,
			longitude: -6.2412
		},
		zoom: 13
	};

	$scope.pubs = [];
	PubResource.get({}, function(data) {
		$scope.pubs = data.list;
		angular.forEach($scope.pubs, function(pub) {
			pub.coords = {
				latitude: pub.latitude,
				longitude: pub.longitude
			};
		});
	});
});
