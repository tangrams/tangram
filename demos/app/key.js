(function(){
    window.addEventListener('load', function () {
        // Inject demo API key on load or update
        map.scene.subscribe({
            load: function (msg) {
                injectAPIKey(msg.config);
            },
            update: function (msg) {
                injectAPIKey(msg.config);
            }
        });
    });

    function injectAPIKey(config) {
        var demo_key = 'd161Q8KATMOhSOcVGNyQ8g';
        if (config.global.sdk_api_key) {
            config.global.sdk_api_key = demo_key;
        }
        else {
            for (var name in config.sources) {
                var source = config.sources[name];
                if (typeof source.url === 'string' && source.url.search('nextzen.org')) {
                    source.url_params = source.url_params || {};
                    source.url_params.api_key = demo_key;
                }
            }
        }
    }
})();
