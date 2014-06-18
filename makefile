all: \
	dist/vector-map.min.js \
	dist/vector-map.debug.js \
	dist/vector-map-worker.min.js

# Dependencies for building the main library
vector-map-dependencies= \
	point.js \
	geo.js \
	gl.js \
	tile_source.js \
	style.js \
	vector_renderer.js \
	canvas_renderer.js \
	gl_renderer.js \
	gl_builders.js \
	gl_geom.js \
	shaders/gl_shaders.js \
	leaflet_vector_tile_layer.js

# Dependencies for building the web worker
vector-map-worker-dependencies= \
	vector_worker.js \
	lib/libtess.cat.js \
	point.js \
	geo.js \
	gl.js \
	tile_source.js \
	style.js \
	vector_renderer.js \
	canvas_renderer.js \
	gl_renderer.js \
	gl_builders.js \
	gl_geom.js

# browserify --debug adds source maps
dist/vector-map.debug.js: $(vector-map-dependencies)
	# $(build-vector-map) --source-map vector-map.debug.js.map > vector-map.debug.js
	./node_modules/.bin/browserify \
		leaflet_vector_tile_layer.js \
		--debug \
		> dist/vector-map.debug.js

dist/vector-map.min.js: dist/vector-map.debug.js
	./node_modules/.bin/uglifyjs \
		dist/vector-map.debug.js \
		-c -m \
		> dist/vector-map.min.js

dist/vector-map-worker.min.js: $(vector-map-worker-dependencies)
	./node_modules/.bin/browserify \
		vector_worker.js \
		> dist/temp.vector-map-worker.js; \
	./node_modules/.bin/uglifyjs \
		lib/libtess.cat.js \
		dist/temp.vector-map-worker.js \
		-c -m \
		> dist/vector-map-worker.min.js; \
	rm dist/temp.vector-map-worker.js

# Process shaders into strings and export as a module
shaders/gl_shaders.js: $(wildcard shaders/*.glsl)
	{ \
		cd shaders; \
		echo "// Generated from GLSL files, don't edit!"; \
		echo "var shader_sources = {};\n"; \
		for f in *.glsl; do \
			shader_name=`echo "$$f" | sed -e "s/\(.*\)\.glsl/\1/"`; \
			echo "shader_sources['$$shader_name'] ="; sed -e "s/'/\\\'/g" -e 's/"/\\\"/g' -e 's/^\(.*\)/"\1\\n" +/g' $$f; echo '"";\n'; \
		done; \
		echo "if (module.exports !== undefined) { module.exports = shader_sources; }\n"; \
	} > shaders/gl_shaders.js

clean:
	rm -f dist/*
	rm -f shaders/gl_shaders.js
	rm -f temp*
