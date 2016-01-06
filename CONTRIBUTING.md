# Contributing to Tangram

## Quickstart

To get Tangram up and running locally:

1. Clone or download this repository:
  	- clone in a terminal window with `git clone https://github.com/tangrams/tangram.git`
  	- or download a zip directly: https://github.com/tangrams/tangram/archive/master.zip
  	- or use [Bower](http://bower.io/): `bower install tangram`
2. Start a webserver in the repository's directory:
  	- in a terminal window, enter: `python -m SimpleHTTPServer 8000`
  	- if that doesn't work, try: `python -m http.server`
3. View the map at http://localhost:8000 (or whatever port you started the server on)

### Building

If you'd like to contribute to the project or just make changes to the source code for fun, you'll need to install the development requirements and build the library:

```shell
npm install
make
```

The library will be minified in `dist/`, and `index.html` provides an example for rendering from different sources and simple Leaflet integration.

### Testing

Tests are included to ensure that the code functions as expected. To run all of the tests:

```shell
npm test
```
Every time this runs, a new browser instance is created. If you wish to have a single browser instance and run the test suite against that instance do the following,

```shell
make karma-start
```

And then run the tests with,

```shell
make run-tests
```

### Lint
We're using jshint to maintain code quality.

```shell
make lint
```
