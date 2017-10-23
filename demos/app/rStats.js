// Render/GL stats: http://spite.github.io/rstats/
(function(){
    var glS = new glStats();
    glS.fractions = []; // turn this off till we need it

    var rStats_debug = new rStats({
        values: {
            frame: { caption: 'Total frame time (ms)', over: 10 },
            raf: { caption: 'Time since last rAF (ms)' },
            fps: { caption: 'Framerate (FPS)', below: 40 },
            tiles: { caption: 'Rendered tiles' },
            geometry_count: { caption: '# geoms' },
            feature_count: { caption: '# features' },
            buffer_size: { caption: 'GL buffers (MB)' }
        },
        CSSPath : 'demos/lib/',
        plugins: [glS]
    });

    // Move it to the bottom-left so it doesn't obscure zoom controls
    var rSDOM = document.querySelector('.rs-base');
    rSDOM.style.bottom = '0px';
    rSDOM.style.top = 'inherit';

    var scene = layer.scene;
    scene.subscribe({
        pre_update: function(will_render){
            rStats_debug('fps').frame();
            if (will_render) {
                rStats_debug('frame').start();
                glS.start();
            }
        },
        post_update: function(){
            rStats_debug('frame').end();
            rStats_debug('tiles').set(scene.debug.renderableTilesCount());
            rStats_debug('buffer_size').set((scene.tile_manager.getDebugSum('buffer_size') / (1024*1024)).toFixed(2));
            rStats_debug('geometry_count').set(scene.tile_manager.getDebugSum('geometry_count'));
            rStats_debug('feature_count').set(scene.tile_manager.getDebugSum('feature_count'));
            rStats_debug().update();
        }
    })
})()
