(function(){
    var url_hash = getValuesFromUrl();
    const defaultLocation = [16, 40.70531887544228, -74.00976419448853];
    var location = url_hash || defaultLocation;
    var map_start_location = {lat: location[1], lng: location[2], zoom: location[0]};

    /*** URL parsing ***/
    // URL hash pattern #[zoom]/[lat]/[lng]
    function getValuesFromUrl() {
        var url_hash = window.location.hash.slice(1, window.location.hash.length).split('/');
        if (url_hash.length < 3 || parseFloat(url_hash[0]) === 'number') {
            url_hash = false;
        } else {
            url_hash = url_hash.map(x => parseFloat(x));
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
            var url_options = [Math.round(map.getZoom() * 1000)/1000, center.lat, center.lng];

            window.location.hash = url_options.join('/');
        }, update_url_throttle);
    }

    window.addEventListener('load', function () {
        // update URL scene load
        map.scene.subscribe({
            load: onLoad(),
            move: updateURL,
        });
    });

    function onLoad() {
        map.setView(map_start_location);
    }

})();
