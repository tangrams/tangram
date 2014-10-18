BROWSERIFY = node_modules/.bin/browserify
UGLIFY = node_modules/.bin/uglifyjs
KARMA = ./node_modules/karma/bin/karma
JSHINT = ./node_modules/.bin/jshint
LIB_TESS = ./lib/libtess.cat.js
EXTERNAL_LIBS = $(LIB_TESS)
EXTERNAL_MODULES = js-yaml

all: \
	src/gl/gl_shaders.js \
	dist/tangram.min.js \
	dist/tangram.debug.js \
	dist/tangram-worker.min.js \
	dist/tangram-worker.debug.js \
	dist/js-yaml.js

# just debug packages, faster builds for most dev situations
dev: \
	dist/tangram.debug.js \
	dist/tangram-worker.debug.js

# browserify --debug adds source maps
dist/tangram.debug.js: $(shell $(BROWSERIFY) --list -t es6ify -x $(EXTERNAL_MODULES) src/module.js)
	node build.js --debug=true --require './src/module.js' > dist/tangram.debug.js

dist/tangram-worker.debug.js: $(shell $(BROWSERIFY) --list -t es6ify -x $(EXTERNAL_MODULES) src/scene_worker.js)
	node build.js --debug=true --require './src/scene_worker.js' > dist/temp.tangram-worker.debug.js
	cat $(EXTERNAL_LIBS) ./dist/temp.tangram-worker.debug.js > ./dist/tangram-worker.debug.js
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

dist/testable.js: clean src/gl/gl_shaders.js dist/tangram-worker.debug.js
	node build.js --debug=true --includeLet --all './test/*.js' > dist/testable.js

test: lint dist/testable.js
	$(KARMA) start --single-run

clean:
	rm -f dist/*
	rm -f src/gl/gl_shaders.js

lint:
	$(JSHINT) src/gl/*.js
	$(JSHINT) src/*.js
	$(JSHINT) test/*.js

karma-start:
	$(KARMA) start --no-watch

run-tests: lint dist/testable.js
	$(KARMA) run

.PHONY : clean all dev test lint karma-start run-tests
