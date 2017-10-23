(function(){
    window.addEventListener('load', function () {
        // Inject demo API key on load or update
        layer.scene.subscribe({
            load: function (msg) {
                injectAPIKey(msg.config);
            },
            update: function (msg) {
                injectAPIKey(msg.config);
            }
        });
    });

    function injectAPIKey(config) {
        var demo_key = 'mapzen-T3tPjn7';
        if (config.global.sdk_mapzen_api_key) {
            config.global.sdk_mapzen_api_key = demo_key;
        }
        else {
            for (var name in config.sources) {
                var source = config.sources[name];
                if (source.url.search('mapzen.com')) {
                    source.url_params = source.url_params || {};
                    source.url_params.api_key = demo_key;
                }
            }
        }
    }
})();
