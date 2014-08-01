BROWSERIFY = node_modules/.bin/browserify
UGLIFY = node_modules/.bin/uglifyjs
EXTERNAL_MODULES = js-yaml
WORKER_ONLY = lib/libtess.cat.js

all: \
	src/gl/gl_shaders.js \
	dist/vector-map.min.js \
	dist/vector-map.debug.js \
	dist/vector-map-worker.min.js \
	dist/js-yaml.js

# browserify --debug adds source maps
dist/vector-map.debug.js: $(shell $(BROWSERIFY) --list src/module.js)
	$(BROWSERIFY) -x $(EXTERNAL_MODULES) src/module.js --debug --standalone Tangram > dist/vector-map.debug.js

dist/vector-map.min.js: dist/vector-map.debug.js
	$(UGLIFY) dist/vector-map.debug.js -c -m -o dist/vector-map.min.js

dist/vector-map-worker.min.js: $(shell $(BROWSERIFY) --list -x $(EXTERNAL_MODULES) src/vector_worker.js)
	$(BROWSERIFY) -x $(EXTERNAL_MODULES) src/vector_worker.js > dist/temp.vector-map-worker.js
	$(UGLIFY) $(WORKER_ONLY) dist/temp.vector-map-worker.js -c -m > dist/vector-map-worker.min.js
	rm dist/temp.vector-map-worker.js

# externalized & modularized js-yaml, so YAML support can be included optionally (parser is large)
dist/js-yaml.js: ./node_modules/js-yaml/index.js
	$(BROWSERIFY) -r js-yaml node_modules/js-yaml/index.js | \
	$(UGLIFY) -c -m > dist/js-yaml.js

# Process shaders into strings and export as a module
src/gl/gl_shaders.js: $(wildcard src/gl/shaders/modules/*.glsl) $(wildcard src/gl/shaders/*.glsl)
	{ \
		cd src/gl/shaders; \
		echo "// Generated from GLSL files, don't edit!"; \
		echo "var shader_sources = {};\n"; \
		for f in *.glsl; do \
			shader_name=`echo "$$f" | sed -e "s/\(.*\)\.glsl/\1/"`; \
			echo "shader_sources['$$shader_name'] ="; \
			../../../node_modules/glslify/bin/glslify $$f -o temp.glsl; \
			sed -e "s/'/\\\'/g" -e 's/"/\\\"/g' -e 's/^\(.*\)/"\1\\n" +/g' temp.glsl; \
			echo '"";\n'; \
		done; \
		echo "if (module.exports !== undefined) { module.exports = shader_sources; }\n"; \
	} > src/gl/gl_shaders.js
	rm -f src/gl/shaders/temp.glsl

clean:
	rm -f dist/*
	rm -f src/gl/gl_shaders.js
