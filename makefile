BROWSERIFY = node_modules/.bin/browserify
UGLIFY = node_modules/.bin/uglifyjs
KARMA = ./node_modules/karma/bin/karma
JSHINT = ./node_modules/.bin/jshint

all: \
	src/gl/gl_shaders.js \
	dist/tangram.min.js \
	dist/tangram.debug.js \
	dist/tangram-worker.min.js \
	dist/tangram-worker.debug.js

# just debug packages, faster builds for most dev situations
dev: \
	dist/tangram.debug.js \
	dist/tangram-worker.debug.js

# browserify --debug adds source maps
dist/tangram.debug.js: $(shell $(BROWSERIFY) --list -t es6ify src/module.js)
	node build.js --debug=true --require './src/module.js' > dist/tangram.debug.js

dist/tangram-worker.debug.js: $(shell $(BROWSERIFY) --list -t es6ify src/scene_worker.js)
	node build.js --debug=true --require './src/scene_worker.js' > dist/tangram-worker.debug.js

dist/tangram.min.js: dist/tangram.debug.js
	$(UGLIFY) dist/tangram.debug.js -c warnings=false -m -o dist/tangram.min.js

dist/tangram-worker.min.js: dist/tangram-worker.debug.js
	$(UGLIFY) dist/tangram-worker.debug.js -c warnings=false -m > dist/tangram-worker.min.js

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

build-testable: lint src/gl/gl_shaders.js dist/tangram-worker.debug.js
	node build.js --debug=true --includeLet --all './test/*.js' > dist/tangram.test.js

test: build-testable
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

run-tests: build-testable
	$(KARMA) run

.PHONY : clean all dev test lint karma-start run-tests
