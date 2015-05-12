/* global jQuery, select2 */
(function ($) {
    'use strict'

    if (window.self !== window.top) return false

    var STYLESHEET = 'demos/lib/locator/findcity.css'
    var CITY_DATA
    var CITY_DATA_URL = 'https://gist.githubusercontent.com/randymeech/1fb759d34521b43d373d/raw/3d2d7944ae32d819a17d60a44c6702b4406e6c91/cities'

    function _loadExternalStylesheet () {
        var el = document.createElement('link')
        el.setAttribute('rel', 'stylesheet')
        el.setAttribute('type', 'text/css')
        el.setAttribute('href', STYLESHEET)
        document.head.appendChild(el)
    }

    _loadExternalStylesheet()

    $.get(CITY_DATA_URL, function (data) {
        CITY_DATA = JSON.parse(data);

        // Process data
        CITY_DATA = CITY_DATA.map(function (item) {
            return {
                name: item.n,
                lat: item.l.split('/')[0],
                lng: item.l.split('/')[1],
                zoom: item.z
            }
        })

        // Sort
        CITY_DATA.sort(function (a, b) {
            if (a.name < b.name)
                return -1;
            if (a.name > b.name)
                return 1;
            return 0;
        });

        $(document).ready(function () {
            var $select = $('.js-citylocate-select2');
            CITY_DATA.forEach(function (item) {
                $select.append('<option value="' + item.name + '" data-lat="' + item.lat + '" data-lng="' + item.lng + '" data-zoom="' + item.zoom + '">' + item.name + '</option>')
            })

            $select.select2({
                placeholder: 'Search'
            });

            $select.on('select2:select', function (e) {
                /* global map */
                var el = e.params.data.element
                var lat = el.dataset.lat
                var lng = el.dataset.lng
                var zoom = (el.dataset.zoom === 'undefined') ? null : el.dataset.zoom;
                console.log(el, lat, lng, zoom)
                if (zoom) {
                    map.setView([lat, lng], zoom);
                } else {
                    map.setView([lat, lng]);
                }
            })
        });
    })
})(jQuery);
