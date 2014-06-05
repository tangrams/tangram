all: dist/vector-map.min.js dist/vector-map.debug.js dist/vector-map-worker.min.js

vector-map-dependencies=.shaders geo.js gl.js tile_source.js vector_renderer.js canvas_renderer.js gl_renderer.js gl_builders.js leaflet_vector_tile_layer.js
vector-map-worker-dependencies=lib/libtess.cat.js lib/mapbox-vector-tile.js geo.js gl.js tile_source.js vector_renderer.js canvas_renderer.js gl_renderer.js gl_builders.js vector_worker.js

# cd'ing into dist and then pathing back to source files to fix a source map relative URL issue (can probably fix with the right uglify options)
build-vector-map=cd dist; ../node_modules/.bin/uglifyjs ../geo.js ../gl.js ../tile_source.js ../vector_renderer.js ../canvas_renderer.js ../gl_renderer.js ../gl_builders.js ../leaflet_vector_tile_layer.js ../shaders/*.glsl.js -c -m
build-vector-map-worker=cd dist; ../node_modules/.bin/uglifyjs ../lib/libtess.cat.js ../lib/mapbox-vector-tile.js ../geo.js ../gl.js ../tile_source.js ../vector_renderer.js ../canvas_renderer.js ../gl_renderer.js ../gl_builders.js ../vector_worker.js -c -m

dist/vector-map.min.js: $(vector-map-dependencies)
	$(build-vector-map) > vector-map.min.js

dist/vector-map.debug.js: $(vector-map-dependencies)
	$(build-vector-map) --source-map vector-map.debug.js.map > vector-map.debug.js

dist/vector-map-worker.min.js: $(vector-map-worker-dependencies)
	$(build-vector-map-worker) > vector-map-worker.min.js

# Process shaders into strings and set as JS vars
.shaders: $(wildcard shaders/*.glsl)
	cd shaders; \
	for f in *.glsl; do \
		shader_name=`echo "$$f" | sed -e "s/\(.*\)\.glsl/\1/"`; \
		(echo -n "// Generated from $$f, don't edit\nGLRenderer.shader_sources['$$shader_name'] ="; sed -e "s/'/\\\'/g" -e 's/"/\\\"/g' -e 's/^\(.*\)/"\1\\n" +/g' $$f; echo '"";';) > $$f.js; \
	done;
	touch .shaders;

lib/mapbox-vector-tile.js: node_modules/vector-tile/lib/vectortile.js node_modules/vector-tile/lib/vectortilelayer.js node_modules/vector-tile/lib/vectortilefeature.js
	./node_modules/.bin/browserify -r ./node_modules/vector-tile/lib/vectortile.js:vectortile -r ./node_modules/vector-tile/lib/vectortilelayer.js:vectortilelayer -r ./node_modules/vector-tile/lib/vectortilefeature.js:vectortilefeature > lib/mapbox-vector-tile.js

clean:
	rm -f dist/*
	rm -f shaders/*.glsl.js
	touch shaders/*.glsl
	rm -f lib/mapbox-vector-tile.js
