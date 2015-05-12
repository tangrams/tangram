/* global map */
(function () {
  'use strict'
  var latitude
  var longitude

  if (!map) return false
  if (window.self !== window.top) return false

  var getCurrentLocation = function (success, error) {
    var geolocator = window.navigator.geolocation;
    var options = {
      enableHighAccuracy: true,
      maximumAge: 10000
    };

    if (geolocator) {
      // Fixes an infinite loop bug with Safari
      // https://stackoverflow.com/questions/27150465/geolocation-api-in-safari-8-and-7-1-keeps-asking-permission/28436277#28436277
      window.setTimeout(function () {
        geolocator.getCurrentPosition(success, error, options);
      }, 0);
    } else {
      document.getElementById('geolocator').style.display = 'none';
      console.log('Browser does not support geolocation');
    }
  }

  var onGeolocateSuccess = function (position) {
    latitude = position.coords.latitude;
    longitude = position.coords.longitude;

    /* global map */
    map.setView([latitude, longitude], 17);
    resetGeolocateButton();
  }

  var onGeolocateError = function (err) {
    console.log(err);
    alert('Unable to retrieve current position. Geolocation may be disabled on this browser or unavailable on this system.');
    resetGeolocateButton();
  }

  var resetGeolocateButton = function () {
    var button = document.getElementById('geolocator').querySelector('.geolocate-icon');
    button.classList.remove('geolocating');
  }

  document.getElementById('geolocator').querySelector('.geolocate-icon').addEventListener('click', function (e) {
    if (e.target.classList.contains('geolocating')) {
      return false;
    }
    e.target.classList.add('geolocating');
    getCurrentLocation(onGeolocateSuccess, onGeolocateError);
  });
})()
