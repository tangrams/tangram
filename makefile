BROWSERIFY = node_modules/.bin/browserify
UGLIFY = node_modules/.bin/uglifyjs
KARMA = ./node_modules/karma/bin/karma
JSHINT = ./node_modules/.bin/jshint

all: \
	src/gl/shader_sources.js \
	dist/tangram.min.js \
	dist/tangram.debug.js

# browserify --debug adds source maps
dist/tangram.debug.js: .npm $(shell $(BROWSERIFY) --list -t es6ify src/module.js)
	node build.js --debug=true --require './src/module.js' > dist/tangram.debug.js

dist/tangram.min.js: dist/tangram.debug.js
	$(UGLIFY) dist/tangram.debug.js -c warnings=false -m -o dist/tangram.min.js

# Process shaders into strings and export as a module
src/gl/shader_sources.js: $(wildcard src/gl/shaders/modules/*.glsl) $(wildcard src/gl/shaders/*.glsl)
	bash ./build_shaders.sh > src/gl/shader_sources.js

build-testable: lint dist/tangram.debug.js
	node build.js --debug=true --all './test/*.js' > dist/tangram.test.js

test: build-testable
	$(KARMA) start --single-run

test-ci: build-testable
	$(KARMA) start  --browsers SL_Firefox --single-run

clean:
	rm -f dist/*
	rm -f src/gl/shader_sources.js

lint: .npm
	$(JSHINT) `find src/ -name '*.js'`
	$(JSHINT) `find test/ -name '*.js'`

karma-start: .npm
	$(KARMA) start --browsers Chrome --no-watch

run-tests: build-testable
	$(KARMA) run --browsers Chrome

.npm: package.json
	npm install
	touch .npm

.PHONY : clean all test lint build-testable karma-start run-tests
