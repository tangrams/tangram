BROWSERIFY = node_modules/.bin/browserify
UGLIFY = node_modules/.bin/uglifyjs

all: \
	dist/vector-map.min.js \
	dist/vector-map.debug.js \
	dist/vector-map-worker.min.js

# browserify --debug adds source maps
dist/vector-map.debug.js: shaders/gl_shaders.js $(shell $(BROWSERIFY) --list leaflet_vector_tile_layer.js)
	$(BROWSERIFY) leaflet_vector_tile_layer.js --debug > dist/vector-map.debug.js

dist/vector-map.min.js: dist/vector-map.debug.js
	$(UGLIFY) dist/vector-map.debug.js -c -m -o dist/vector-map.min.js

dist/vector-map-worker.min.js: $(shell $(BROWSERIFY) --list vector_worker.js)
	$(BROWSERIFY) vector_worker.js > dist/temp.vector-map-worker.js
	$(UGLIFY) lib/libtess.cat.js dist/temp.vector-map-worker.js -c -m > dist/vector-map-worker.min.js
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
