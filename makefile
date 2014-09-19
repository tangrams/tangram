BROWSERIFY = node_modules/.bin/browserify
UGLIFY = node_modules/.bin/uglifyjs
EXTERNAL_MODULES = js-yaml
WORKER_ONLY = ./lib/libtess.cat.js ./node_modules/traceur/bin/traceur-runtime.js

all: \
	src/gl/gl_shaders.js \
	dist/tangram.min.js \
	dist/tangram.debug.js \
	dist/tangram-worker.min.js \
	dist/tangram-worker.debug.js \
	dist/js-yaml.js

# browserify --debug adds source maps
dist/tangram.debug.js: $(shell $(BROWSERIFY) --list src/module.js)
	$(BROWSERIFY) -x $(EXTERNAL_MODULES) src/module.js --debug --standalone Tangram > dist/temp.tangram.debug.js
	cat ./node_modules/traceur/bin/traceur-runtime.js dist/temp.tangram.debug.js > dist/tangram.debug.js
	rm dist/temp.tangram.debug.js

dist/tangram-worker.debug.js: $(shell $(BROWSERIFY) --list -x $(EXTERNAL_MODULES) src/scene_worker.js)
	$(BROWSERIFY) -x $(EXTERNAL_MODULES) src/scene_worker.js > dist/temp.tangram-worker.debug.js
	cat $(WORKER_ONLY) ./dist/temp.tangram-worker.debug.js > ./dist/tangram-worker.debug.js
	rm dist/temp.tangram-worker.debug.js

dist/tangram.min.js: dist/tangram.debug.js
	$(UGLIFY) dist/tangram.debug.js -c -m -o dist/tangram.min.js

dist/tangram-worker.min.js: dist/tangram-worker.debug.js
	$(UGLIFY) dist/tangram-worker.debug.js -c -m > dist/tangram-worker.min.js

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
		echo "module.exports = shader_sources; \n"; \
	} > src/gl/gl_shaders.js
	rm -f src/gl/shaders/temp.glsl

clean:
	rm -f dist/*
	rm -f src/gl/gl_shaders.js

.PHONY : clean all
