(function(){
    var url_hash = getValuesFromUrl();
    var map_start_location = url_hash ? url_hash.slice(0, 3) : [16, 40.70531887544228, -74.00976419448853];

    /*** URL parsing ***/
    // URL hash pattern #[zoom]/[lat]/[lng]
    function getValuesFromUrl() {
        var url_hash = window.location.hash.slice(1, window.location.hash.length).split('/');
        if (url_hash.length < 3 || parseFloat(url_hash[0]) === 'number') {
            url_hash = false;
        }
        return url_hash;
    }

    // Put current state on URL
    var update_url_throttle = 100;
    var update_url_timeout = null;

    function updateURL() {
        clearTimeout(update_url_timeout);
        update_url_timeout = setTimeout(function() {
            var center = map.getCenter();
            var url_options = [map.getZoom(), center.lat, center.lng];

            window.location.hash = url_options.join('/');
        }, update_url_throttle);
    }

    window.addEventListener('load', function () {
        // update URL scene load
        map.scene.subscribe({
            load: onLoad()
        });
    });

    function onLoad() {
        updateURL();
        map.setView(map_start_location.slice(1, 3), map_start_location[0]);
    }

})();
