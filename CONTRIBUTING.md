# Contributing to Tangram

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
Every time this runs, an new browser instance is created. If you wish to
have a single browser instance and run the test suite against that
instance do the following,

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