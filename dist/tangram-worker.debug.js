(function e(t,n,r){function s(o,u){if(!n[o]){if(!t[o]){var a=typeof require=="function"&&require;if(!u&&a)return a(o,!0);if(i)return i(o,!0);throw new Error("Cannot find module '"+o+"'")}var f=n[o]={exports:{}};t[o][0].call(f.exports,function(e){var n=t[o][1][e];return s(n?n:e)},f,f.exports,e,t,n,r)}return n[o].exports}var i=typeof require=="function"&&require;for(var o=0;o<r.length;o++)s(r[o]);return s})({1:[function(require,module,exports){

},{}],2:[function(require,module,exports){
// shim for using process in browser

var process = module.exports = {};

process.nextTick = (function () {
    var canSetImmediate = typeof window !== 'undefined'
    && window.setImmediate;
    var canPost = typeof window !== 'undefined'
    && window.postMessage && window.addEventListener
    ;

    if (canSetImmediate) {
        return function (f) { return window.setImmediate(f) };
    }

    if (canPost) {
        var queue = [];
        window.addEventListener('message', function (ev) {
            var source = ev.source;
            if ((source === window || source === null) && ev.data === 'process-tick') {
                ev.stopPropagation();
                if (queue.length > 0) {
                    var fn = queue.shift();
                    fn();
                }
            }
        }, true);

        return function nextTick(fn) {
            queue.push(fn);
            window.postMessage('process-tick', '*');
        };
    }

    return function nextTick(fn) {
        setTimeout(fn, 0);
    };
})();

process.title = 'browser';
process.browser = true;
process.env = {};
process.argv = [];

process.binding = function (name) {
    throw new Error('process.binding is not supported');
}

// TODO(shtylman)
process.cwd = function () { return '/' };
process.chdir = function (dir) {
    throw new Error('process.chdir is not supported');
};

},{}],3:[function(require,module,exports){
(function (process,global){
(function(global) {
  'use strict';
  if (global.$traceurRuntime) {
    return;
  }
  var $Object = Object;
  var $TypeError = TypeError;
  var $create = $Object.create;
  var $defineProperties = $Object.defineProperties;
  var $defineProperty = $Object.defineProperty;
  var $freeze = $Object.freeze;
  var $getOwnPropertyDescriptor = $Object.getOwnPropertyDescriptor;
  var $getOwnPropertyNames = $Object.getOwnPropertyNames;
  var $keys = $Object.keys;
  var $hasOwnProperty = $Object.prototype.hasOwnProperty;
  var $toString = $Object.prototype.toString;
  var $preventExtensions = Object.preventExtensions;
  var $seal = Object.seal;
  var $isExtensible = Object.isExtensible;
  function nonEnum(value) {
    return {
      configurable: true,
      enumerable: false,
      value: value,
      writable: true
    };
  }
  var types = {
    void: function voidType() {},
    any: function any() {},
    string: function string() {},
    number: function number() {},
    boolean: function boolean() {}
  };
  var method = nonEnum;
  var counter = 0;
  function newUniqueString() {
    return '__$' + Math.floor(Math.random() * 1e9) + '$' + ++counter + '$__';
  }
  var symbolInternalProperty = newUniqueString();
  var symbolDescriptionProperty = newUniqueString();
  var symbolDataProperty = newUniqueString();
  var symbolValues = $create(null);
  var privateNames = $create(null);
  function createPrivateName() {
    var s = newUniqueString();
    privateNames[s] = true;
    return s;
  }
  function isSymbol(symbol) {
    return typeof symbol === 'object' && symbol instanceof SymbolValue;
  }
  function typeOf(v) {
    if (isSymbol(v))
      return 'symbol';
    return typeof v;
  }
  function Symbol(description) {
    var value = new SymbolValue(description);
    if (!(this instanceof Symbol))
      return value;
    throw new TypeError('Symbol cannot be new\'ed');
  }
  $defineProperty(Symbol.prototype, 'constructor', nonEnum(Symbol));
  $defineProperty(Symbol.prototype, 'toString', method(function() {
    var symbolValue = this[symbolDataProperty];
    if (!getOption('symbols'))
      return symbolValue[symbolInternalProperty];
    if (!symbolValue)
      throw TypeError('Conversion from symbol to string');
    var desc = symbolValue[symbolDescriptionProperty];
    if (desc === undefined)
      desc = '';
    return 'Symbol(' + desc + ')';
  }));
  $defineProperty(Symbol.prototype, 'valueOf', method(function() {
    var symbolValue = this[symbolDataProperty];
    if (!symbolValue)
      throw TypeError('Conversion from symbol to string');
    if (!getOption('symbols'))
      return symbolValue[symbolInternalProperty];
    return symbolValue;
  }));
  function SymbolValue(description) {
    var key = newUniqueString();
    $defineProperty(this, symbolDataProperty, {value: this});
    $defineProperty(this, symbolInternalProperty, {value: key});
    $defineProperty(this, symbolDescriptionProperty, {value: description});
    freeze(this);
    symbolValues[key] = this;
  }
  $defineProperty(SymbolValue.prototype, 'constructor', nonEnum(Symbol));
  $defineProperty(SymbolValue.prototype, 'toString', {
    value: Symbol.prototype.toString,
    enumerable: false
  });
  $defineProperty(SymbolValue.prototype, 'valueOf', {
    value: Symbol.prototype.valueOf,
    enumerable: false
  });
  var hashProperty = createPrivateName();
  var hashPropertyDescriptor = {value: undefined};
  var hashObjectProperties = {
    hash: {value: undefined},
    self: {value: undefined}
  };
  var hashCounter = 0;
  function getOwnHashObject(object) {
    var hashObject = object[hashProperty];
    if (hashObject && hashObject.self === object)
      return hashObject;
    if ($isExtensible(object)) {
      hashObjectProperties.hash.value = hashCounter++;
      hashObjectProperties.self.value = object;
      hashPropertyDescriptor.value = $create(null, hashObjectProperties);
      $defineProperty(object, hashProperty, hashPropertyDescriptor);
      return hashPropertyDescriptor.value;
    }
    return undefined;
  }
  function freeze(object) {
    getOwnHashObject(object);
    return $freeze.apply(this, arguments);
  }
  function preventExtensions(object) {
    getOwnHashObject(object);
    return $preventExtensions.apply(this, arguments);
  }
  function seal(object) {
    getOwnHashObject(object);
    return $seal.apply(this, arguments);
  }
  Symbol.iterator = Symbol();
  freeze(SymbolValue.prototype);
  function toProperty(name) {
    if (isSymbol(name))
      return name[symbolInternalProperty];
    return name;
  }
  function getOwnPropertyNames(object) {
    var rv = [];
    var names = $getOwnPropertyNames(object);
    for (var i = 0; i < names.length; i++) {
      var name = names[i];
      if (!symbolValues[name] && !privateNames[name])
        rv.push(name);
    }
    return rv;
  }
  function getOwnPropertyDescriptor(object, name) {
    return $getOwnPropertyDescriptor(object, toProperty(name));
  }
  function getOwnPropertySymbols(object) {
    var rv = [];
    var names = $getOwnPropertyNames(object);
    for (var i = 0; i < names.length; i++) {
      var symbol = symbolValues[names[i]];
      if (symbol)
        rv.push(symbol);
    }
    return rv;
  }
  function hasOwnProperty(name) {
    return $hasOwnProperty.call(this, toProperty(name));
  }
  function getOption(name) {
    return global.traceur && global.traceur.options[name];
  }
  function setProperty(object, name, value) {
    var sym,
        desc;
    if (isSymbol(name)) {
      sym = name;
      name = name[symbolInternalProperty];
    }
    object[name] = value;
    if (sym && (desc = $getOwnPropertyDescriptor(object, name)))
      $defineProperty(object, name, {enumerable: false});
    return value;
  }
  function defineProperty(object, name, descriptor) {
    if (isSymbol(name)) {
      if (descriptor.enumerable) {
        descriptor = $create(descriptor, {enumerable: {value: false}});
      }
      name = name[symbolInternalProperty];
    }
    $defineProperty(object, name, descriptor);
    return object;
  }
  function polyfillObject(Object) {
    $defineProperty(Object, 'defineProperty', {value: defineProperty});
    $defineProperty(Object, 'getOwnPropertyNames', {value: getOwnPropertyNames});
    $defineProperty(Object, 'getOwnPropertyDescriptor', {value: getOwnPropertyDescriptor});
    $defineProperty(Object.prototype, 'hasOwnProperty', {value: hasOwnProperty});
    $defineProperty(Object, 'freeze', {value: freeze});
    $defineProperty(Object, 'preventExtensions', {value: preventExtensions});
    $defineProperty(Object, 'seal', {value: seal});
    Object.getOwnPropertySymbols = getOwnPropertySymbols;
  }
  function exportStar(object) {
    for (var i = 1; i < arguments.length; i++) {
      var names = $getOwnPropertyNames(arguments[i]);
      for (var j = 0; j < names.length; j++) {
        var name = names[j];
        if (privateNames[name])
          continue;
        (function(mod, name) {
          $defineProperty(object, name, {
            get: function() {
              return mod[name];
            },
            enumerable: true
          });
        })(arguments[i], names[j]);
      }
    }
    return object;
  }
  function isObject(x) {
    return x != null && (typeof x === 'object' || typeof x === 'function');
  }
  function toObject(x) {
    if (x == null)
      throw $TypeError();
    return $Object(x);
  }
  function checkObjectCoercible(argument) {
    if (argument == null) {
      throw new TypeError('Value cannot be converted to an Object');
    }
    return argument;
  }
  function setupGlobals(global) {
    global.Symbol = Symbol;
    global.Reflect = global.Reflect || {};
    global.Reflect.global = global.Reflect.global || global;
    polyfillObject(global.Object);
  }
  setupGlobals(global);
  global.$traceurRuntime = {
    createPrivateName: createPrivateName,
    exportStar: exportStar,
    getOwnHashObject: getOwnHashObject,
    privateNames: privateNames,
    setProperty: setProperty,
    setupGlobals: setupGlobals,
    toObject: toObject,
    isObject: isObject,
    toProperty: toProperty,
    type: types,
    typeof: typeOf,
    checkObjectCoercible: checkObjectCoercible,
    hasOwnProperty: function(o, p) {
      return hasOwnProperty.call(o, p);
    },
    defineProperties: $defineProperties,
    defineProperty: $defineProperty,
    getOwnPropertyDescriptor: $getOwnPropertyDescriptor,
    getOwnPropertyNames: $getOwnPropertyNames,
    keys: $keys
  };
})(typeof global !== 'undefined' ? global : this);
(function() {
  'use strict';
  function spread() {
    var rv = [],
        j = 0,
        iterResult;
    for (var i = 0; i < arguments.length; i++) {
      var valueToSpread = $traceurRuntime.checkObjectCoercible(arguments[i]);
      if (typeof valueToSpread[$traceurRuntime.toProperty(Symbol.iterator)] !== 'function') {
        throw new TypeError('Cannot spread non-iterable object.');
      }
      var iter = valueToSpread[$traceurRuntime.toProperty(Symbol.iterator)]();
      while (!(iterResult = iter.next()).done) {
        rv[j++] = iterResult.value;
      }
    }
    return rv;
  }
  $traceurRuntime.spread = spread;
})();
(function() {
  'use strict';
  var $Object = Object;
  var $TypeError = TypeError;
  var $create = $Object.create;
  var $defineProperties = $traceurRuntime.defineProperties;
  var $defineProperty = $traceurRuntime.defineProperty;
  var $getOwnPropertyDescriptor = $traceurRuntime.getOwnPropertyDescriptor;
  var $getOwnPropertyNames = $traceurRuntime.getOwnPropertyNames;
  var $getPrototypeOf = Object.getPrototypeOf;
  function superDescriptor(homeObject, name) {
    var proto = $getPrototypeOf(homeObject);
    do {
      var result = $getOwnPropertyDescriptor(proto, name);
      if (result)
        return result;
      proto = $getPrototypeOf(proto);
    } while (proto);
    return undefined;
  }
  function superCall(self, homeObject, name, args) {
    return superGet(self, homeObject, name).apply(self, args);
  }
  function superGet(self, homeObject, name) {
    var descriptor = superDescriptor(homeObject, name);
    if (descriptor) {
      if (!descriptor.get)
        return descriptor.value;
      return descriptor.get.call(self);
    }
    return undefined;
  }
  function superSet(self, homeObject, name, value) {
    var descriptor = superDescriptor(homeObject, name);
    if (descriptor && descriptor.set) {
      descriptor.set.call(self, value);
      return value;
    }
    throw $TypeError("super has no setter '" + name + "'.");
  }
  function getDescriptors(object) {
    var descriptors = {},
        name,
        names = $getOwnPropertyNames(object);
    for (var i = 0; i < names.length; i++) {
      var name = names[i];
      descriptors[name] = $getOwnPropertyDescriptor(object, name);
    }
    return descriptors;
  }
  function createClass(ctor, object, staticObject, superClass) {
    $defineProperty(object, 'constructor', {
      value: ctor,
      configurable: true,
      enumerable: false,
      writable: true
    });
    if (arguments.length > 3) {
      if (typeof superClass === 'function')
        ctor.__proto__ = superClass;
      ctor.prototype = $create(getProtoParent(superClass), getDescriptors(object));
    } else {
      ctor.prototype = object;
    }
    $defineProperty(ctor, 'prototype', {
      configurable: false,
      writable: false
    });
    return $defineProperties(ctor, getDescriptors(staticObject));
  }
  function getProtoParent(superClass) {
    if (typeof superClass === 'function') {
      var prototype = superClass.prototype;
      if ($Object(prototype) === prototype || prototype === null)
        return superClass.prototype;
      throw new $TypeError('super prototype must be an Object or null');
    }
    if (superClass === null)
      return null;
    throw new $TypeError(("Super expression must either be null or a function, not " + typeof superClass + "."));
  }
  function defaultSuperCall(self, homeObject, args) {
    if ($getPrototypeOf(homeObject) !== null)
      superCall(self, homeObject, 'constructor', args);
  }
  $traceurRuntime.createClass = createClass;
  $traceurRuntime.defaultSuperCall = defaultSuperCall;
  $traceurRuntime.superCall = superCall;
  $traceurRuntime.superGet = superGet;
  $traceurRuntime.superSet = superSet;
})();
(function() {
  'use strict';
  var createPrivateName = $traceurRuntime.createPrivateName;
  var $defineProperties = $traceurRuntime.defineProperties;
  var $defineProperty = $traceurRuntime.defineProperty;
  var $create = Object.create;
  var $TypeError = TypeError;
  function nonEnum(value) {
    return {
      configurable: true,
      enumerable: false,
      value: value,
      writable: true
    };
  }
  var ST_NEWBORN = 0;
  var ST_EXECUTING = 1;
  var ST_SUSPENDED = 2;
  var ST_CLOSED = 3;
  var END_STATE = -2;
  var RETHROW_STATE = -3;
  function getInternalError(state) {
    return new Error('Traceur compiler bug: invalid state in state machine: ' + state);
  }
  function GeneratorContext() {
    this.state = 0;
    this.GState = ST_NEWBORN;
    this.storedException = undefined;
    this.finallyFallThrough = undefined;
    this.sent_ = undefined;
    this.returnValue = undefined;
    this.tryStack_ = [];
  }
  GeneratorContext.prototype = {
    pushTry: function(catchState, finallyState) {
      if (finallyState !== null) {
        var finallyFallThrough = null;
        for (var i = this.tryStack_.length - 1; i >= 0; i--) {
          if (this.tryStack_[i].catch !== undefined) {
            finallyFallThrough = this.tryStack_[i].catch;
            break;
          }
        }
        if (finallyFallThrough === null)
          finallyFallThrough = RETHROW_STATE;
        this.tryStack_.push({
          finally: finallyState,
          finallyFallThrough: finallyFallThrough
        });
      }
      if (catchState !== null) {
        this.tryStack_.push({catch: catchState});
      }
    },
    popTry: function() {
      this.tryStack_.pop();
    },
    get sent() {
      this.maybeThrow();
      return this.sent_;
    },
    set sent(v) {
      this.sent_ = v;
    },
    get sentIgnoreThrow() {
      return this.sent_;
    },
    maybeThrow: function() {
      if (this.action === 'throw') {
        this.action = 'next';
        throw this.sent_;
      }
    },
    end: function() {
      switch (this.state) {
        case END_STATE:
          return this;
        case RETHROW_STATE:
          throw this.storedException;
        default:
          throw getInternalError(this.state);
      }
    },
    handleException: function(ex) {
      this.GState = ST_CLOSED;
      this.state = END_STATE;
      throw ex;
    }
  };
  function nextOrThrow(ctx, moveNext, action, x) {
    switch (ctx.GState) {
      case ST_EXECUTING:
        throw new Error(("\"" + action + "\" on executing generator"));
      case ST_CLOSED:
        if (action == 'next') {
          return {
            value: undefined,
            done: true
          };
        }
        throw x;
      case ST_NEWBORN:
        if (action === 'throw') {
          ctx.GState = ST_CLOSED;
          throw x;
        }
        if (x !== undefined)
          throw $TypeError('Sent value to newborn generator');
      case ST_SUSPENDED:
        ctx.GState = ST_EXECUTING;
        ctx.action = action;
        ctx.sent = x;
        var value = moveNext(ctx);
        var done = value === ctx;
        if (done)
          value = ctx.returnValue;
        ctx.GState = done ? ST_CLOSED : ST_SUSPENDED;
        return {
          value: value,
          done: done
        };
    }
  }
  var ctxName = createPrivateName();
  var moveNextName = createPrivateName();
  function GeneratorFunction() {}
  function GeneratorFunctionPrototype() {}
  GeneratorFunction.prototype = GeneratorFunctionPrototype;
  $defineProperty(GeneratorFunctionPrototype, 'constructor', nonEnum(GeneratorFunction));
  GeneratorFunctionPrototype.prototype = {
    constructor: GeneratorFunctionPrototype,
    next: function(v) {
      return nextOrThrow(this[ctxName], this[moveNextName], 'next', v);
    },
    throw: function(v) {
      return nextOrThrow(this[ctxName], this[moveNextName], 'throw', v);
    }
  };
  $defineProperties(GeneratorFunctionPrototype.prototype, {
    constructor: {enumerable: false},
    next: {enumerable: false},
    throw: {enumerable: false}
  });
  Object.defineProperty(GeneratorFunctionPrototype.prototype, Symbol.iterator, nonEnum(function() {
    return this;
  }));
  function createGeneratorInstance(innerFunction, functionObject, self) {
    var moveNext = getMoveNext(innerFunction, self);
    var ctx = new GeneratorContext();
    var object = $create(functionObject.prototype);
    object[ctxName] = ctx;
    object[moveNextName] = moveNext;
    return object;
  }
  function initGeneratorFunction(functionObject) {
    functionObject.prototype = $create(GeneratorFunctionPrototype.prototype);
    functionObject.__proto__ = GeneratorFunctionPrototype;
    return functionObject;
  }
  function AsyncFunctionContext() {
    GeneratorContext.call(this);
    this.err = undefined;
    var ctx = this;
    ctx.result = new Promise(function(resolve, reject) {
      ctx.resolve = resolve;
      ctx.reject = reject;
    });
  }
  AsyncFunctionContext.prototype = $create(GeneratorContext.prototype);
  AsyncFunctionContext.prototype.end = function() {
    switch (this.state) {
      case END_STATE:
        this.resolve(this.returnValue);
        break;
      case RETHROW_STATE:
        this.reject(this.storedException);
        break;
      default:
        this.reject(getInternalError(this.state));
    }
  };
  AsyncFunctionContext.prototype.handleException = function() {
    this.state = RETHROW_STATE;
  };
  function asyncWrap(innerFunction, self) {
    var moveNext = getMoveNext(innerFunction, self);
    var ctx = new AsyncFunctionContext();
    ctx.createCallback = function(newState) {
      return function(value) {
        ctx.state = newState;
        ctx.value = value;
        moveNext(ctx);
      };
    };
    ctx.errback = function(err) {
      handleCatch(ctx, err);
      moveNext(ctx);
    };
    moveNext(ctx);
    return ctx.result;
  }
  function getMoveNext(innerFunction, self) {
    return function(ctx) {
      while (true) {
        try {
          return innerFunction.call(self, ctx);
        } catch (ex) {
          handleCatch(ctx, ex);
        }
      }
    };
  }
  function handleCatch(ctx, ex) {
    ctx.storedException = ex;
    var last = ctx.tryStack_[ctx.tryStack_.length - 1];
    if (!last) {
      ctx.handleException(ex);
      return;
    }
    ctx.state = last.catch !== undefined ? last.catch : last.finally;
    if (last.finallyFallThrough !== undefined)
      ctx.finallyFallThrough = last.finallyFallThrough;
  }
  $traceurRuntime.asyncWrap = asyncWrap;
  $traceurRuntime.initGeneratorFunction = initGeneratorFunction;
  $traceurRuntime.createGeneratorInstance = createGeneratorInstance;
})();
(function() {
  function buildFromEncodedParts(opt_scheme, opt_userInfo, opt_domain, opt_port, opt_path, opt_queryData, opt_fragment) {
    var out = [];
    if (opt_scheme) {
      out.push(opt_scheme, ':');
    }
    if (opt_domain) {
      out.push('//');
      if (opt_userInfo) {
        out.push(opt_userInfo, '@');
      }
      out.push(opt_domain);
      if (opt_port) {
        out.push(':', opt_port);
      }
    }
    if (opt_path) {
      out.push(opt_path);
    }
    if (opt_queryData) {
      out.push('?', opt_queryData);
    }
    if (opt_fragment) {
      out.push('#', opt_fragment);
    }
    return out.join('');
  }
  ;
  var splitRe = new RegExp('^' + '(?:' + '([^:/?#.]+)' + ':)?' + '(?://' + '(?:([^/?#]*)@)?' + '([\\w\\d\\-\\u0100-\\uffff.%]*)' + '(?::([0-9]+))?' + ')?' + '([^?#]+)?' + '(?:\\?([^#]*))?' + '(?:#(.*))?' + '$');
  var ComponentIndex = {
    SCHEME: 1,
    USER_INFO: 2,
    DOMAIN: 3,
    PORT: 4,
    PATH: 5,
    QUERY_DATA: 6,
    FRAGMENT: 7
  };
  function split(uri) {
    return (uri.match(splitRe));
  }
  function removeDotSegments(path) {
    if (path === '/')
      return '/';
    var leadingSlash = path[0] === '/' ? '/' : '';
    var trailingSlash = path.slice(-1) === '/' ? '/' : '';
    var segments = path.split('/');
    var out = [];
    var up = 0;
    for (var pos = 0; pos < segments.length; pos++) {
      var segment = segments[pos];
      switch (segment) {
        case '':
        case '.':
          break;
        case '..':
          if (out.length)
            out.pop();
          else
            up++;
          break;
        default:
          out.push(segment);
      }
    }
    if (!leadingSlash) {
      while (up-- > 0) {
        out.unshift('..');
      }
      if (out.length === 0)
        out.push('.');
    }
    return leadingSlash + out.join('/') + trailingSlash;
  }
  function joinAndCanonicalizePath(parts) {
    var path = parts[ComponentIndex.PATH] || '';
    path = removeDotSegments(path);
    parts[ComponentIndex.PATH] = path;
    return buildFromEncodedParts(parts[ComponentIndex.SCHEME], parts[ComponentIndex.USER_INFO], parts[ComponentIndex.DOMAIN], parts[ComponentIndex.PORT], parts[ComponentIndex.PATH], parts[ComponentIndex.QUERY_DATA], parts[ComponentIndex.FRAGMENT]);
  }
  function canonicalizeUrl(url) {
    var parts = split(url);
    return joinAndCanonicalizePath(parts);
  }
  function resolveUrl(base, url) {
    var parts = split(url);
    var baseParts = split(base);
    if (parts[ComponentIndex.SCHEME]) {
      return joinAndCanonicalizePath(parts);
    } else {
      parts[ComponentIndex.SCHEME] = baseParts[ComponentIndex.SCHEME];
    }
    for (var i = ComponentIndex.SCHEME; i <= ComponentIndex.PORT; i++) {
      if (!parts[i]) {
        parts[i] = baseParts[i];
      }
    }
    if (parts[ComponentIndex.PATH][0] == '/') {
      return joinAndCanonicalizePath(parts);
    }
    var path = baseParts[ComponentIndex.PATH];
    var index = path.lastIndexOf('/');
    path = path.slice(0, index + 1) + parts[ComponentIndex.PATH];
    parts[ComponentIndex.PATH] = path;
    return joinAndCanonicalizePath(parts);
  }
  function isAbsolute(name) {
    if (!name)
      return false;
    if (name[0] === '/')
      return true;
    var parts = split(name);
    if (parts[ComponentIndex.SCHEME])
      return true;
    return false;
  }
  $traceurRuntime.canonicalizeUrl = canonicalizeUrl;
  $traceurRuntime.isAbsolute = isAbsolute;
  $traceurRuntime.removeDotSegments = removeDotSegments;
  $traceurRuntime.resolveUrl = resolveUrl;
})();
(function(global) {
  'use strict';
  var $__2 = $traceurRuntime,
      canonicalizeUrl = $__2.canonicalizeUrl,
      resolveUrl = $__2.resolveUrl,
      isAbsolute = $__2.isAbsolute;
  var moduleInstantiators = Object.create(null);
  var baseURL;
  if (global.location && global.location.href)
    baseURL = resolveUrl(global.location.href, './');
  else
    baseURL = '';
  var UncoatedModuleEntry = function UncoatedModuleEntry(url, uncoatedModule) {
    this.url = url;
    this.value_ = uncoatedModule;
  };
  ($traceurRuntime.createClass)(UncoatedModuleEntry, {}, {});
  var ModuleEvaluationError = function ModuleEvaluationError(erroneousModuleName, cause) {
    this.message = this.constructor.name + ': ' + this.stripCause(cause) + ' in ' + erroneousModuleName;
    if (!(cause instanceof $ModuleEvaluationError) && cause.stack)
      this.stack = this.stripStack(cause.stack);
    else
      this.stack = '';
  };
  var $ModuleEvaluationError = ModuleEvaluationError;
  ($traceurRuntime.createClass)(ModuleEvaluationError, {
    stripError: function(message) {
      return message.replace(/.*Error:/, this.constructor.name + ':');
    },
    stripCause: function(cause) {
      if (!cause)
        return '';
      if (!cause.message)
        return cause + '';
      return this.stripError(cause.message);
    },
    loadedBy: function(moduleName) {
      this.stack += '\n loaded by ' + moduleName;
    },
    stripStack: function(causeStack) {
      var stack = [];
      causeStack.split('\n').some((function(frame) {
        if (/UncoatedModuleInstantiator/.test(frame))
          return true;
        stack.push(frame);
      }));
      stack[0] = this.stripError(stack[0]);
      return stack.join('\n');
    }
  }, {}, Error);
  var UncoatedModuleInstantiator = function UncoatedModuleInstantiator(url, func) {
    $traceurRuntime.superCall(this, $UncoatedModuleInstantiator.prototype, "constructor", [url, null]);
    this.func = func;
  };
  var $UncoatedModuleInstantiator = UncoatedModuleInstantiator;
  ($traceurRuntime.createClass)(UncoatedModuleInstantiator, {getUncoatedModule: function() {
      if (this.value_)
        return this.value_;
      try {
        return this.value_ = this.func.call(global);
      } catch (ex) {
        if (ex instanceof ModuleEvaluationError) {
          ex.loadedBy(this.url);
          throw ex;
        }
        throw new ModuleEvaluationError(this.url, ex);
      }
    }}, {}, UncoatedModuleEntry);
  function getUncoatedModuleInstantiator(name) {
    if (!name)
      return;
    var url = ModuleStore.normalize(name);
    return moduleInstantiators[url];
  }
  ;
  var moduleInstances = Object.create(null);
  var liveModuleSentinel = {};
  function Module(uncoatedModule) {
    var isLive = arguments[1];
    var coatedModule = Object.create(null);
    Object.getOwnPropertyNames(uncoatedModule).forEach((function(name) {
      var getter,
          value;
      if (isLive === liveModuleSentinel) {
        var descr = Object.getOwnPropertyDescriptor(uncoatedModule, name);
        if (descr.get)
          getter = descr.get;
      }
      if (!getter) {
        value = uncoatedModule[name];
        getter = function() {
          return value;
        };
      }
      Object.defineProperty(coatedModule, name, {
        get: getter,
        enumerable: true
      });
    }));
    Object.preventExtensions(coatedModule);
    return coatedModule;
  }
  var ModuleStore = {
    normalize: function(name, refererName, refererAddress) {
      if (typeof name !== "string")
        throw new TypeError("module name must be a string, not " + typeof name);
      if (isAbsolute(name))
        return canonicalizeUrl(name);
      if (/[^\.]\/\.\.\//.test(name)) {
        throw new Error('module name embeds /../: ' + name);
      }
      if (name[0] === '.' && refererName)
        return resolveUrl(refererName, name);
      return canonicalizeUrl(name);
    },
    get: function(normalizedName) {
      var m = getUncoatedModuleInstantiator(normalizedName);
      if (!m)
        return undefined;
      var moduleInstance = moduleInstances[m.url];
      if (moduleInstance)
        return moduleInstance;
      moduleInstance = Module(m.getUncoatedModule(), liveModuleSentinel);
      return moduleInstances[m.url] = moduleInstance;
    },
    set: function(normalizedName, module) {
      normalizedName = String(normalizedName);
      moduleInstantiators[normalizedName] = new UncoatedModuleInstantiator(normalizedName, (function() {
        return module;
      }));
      moduleInstances[normalizedName] = module;
    },
    get baseURL() {
      return baseURL;
    },
    set baseURL(v) {
      baseURL = String(v);
    },
    registerModule: function(name, func) {
      var normalizedName = ModuleStore.normalize(name);
      if (moduleInstantiators[normalizedName])
        throw new Error('duplicate module named ' + normalizedName);
      moduleInstantiators[normalizedName] = new UncoatedModuleInstantiator(normalizedName, func);
    },
    bundleStore: Object.create(null),
    register: function(name, deps, func) {
      if (!deps || !deps.length && !func.length) {
        this.registerModule(name, func);
      } else {
        this.bundleStore[name] = {
          deps: deps,
          execute: function() {
            var $__0 = arguments;
            var depMap = {};
            deps.forEach((function(dep, index) {
              return depMap[dep] = $__0[index];
            }));
            var registryEntry = func.call(this, depMap);
            registryEntry.execute.call(this);
            return registryEntry.exports;
          }
        };
      }
    },
    getAnonymousModule: function(func) {
      return new Module(func.call(global), liveModuleSentinel);
    },
    getForTesting: function(name) {
      var $__0 = this;
      if (!this.testingPrefix_) {
        Object.keys(moduleInstances).some((function(key) {
          var m = /(traceur@[^\/]*\/)/.exec(key);
          if (m) {
            $__0.testingPrefix_ = m[1];
            return true;
          }
        }));
      }
      return this.get(this.testingPrefix_ + name);
    }
  };
  ModuleStore.set('@traceur/src/runtime/ModuleStore', new Module({ModuleStore: ModuleStore}));
  var setupGlobals = $traceurRuntime.setupGlobals;
  $traceurRuntime.setupGlobals = function(global) {
    setupGlobals(global);
  };
  $traceurRuntime.ModuleStore = ModuleStore;
  global.System = {
    register: ModuleStore.register.bind(ModuleStore),
    get: ModuleStore.get,
    set: ModuleStore.set,
    normalize: ModuleStore.normalize
  };
  $traceurRuntime.getModuleImpl = function(name) {
    var instantiator = getUncoatedModuleInstantiator(name);
    return instantiator && instantiator.getUncoatedModule();
  };
})(typeof global !== 'undefined' ? global : this);
System.register("traceur-runtime@0.0.62/src/runtime/polyfills/utils", [], function() {
  "use strict";
  var __moduleName = "traceur-runtime@0.0.62/src/runtime/polyfills/utils";
  var $ceil = Math.ceil;
  var $floor = Math.floor;
  var $isFinite = isFinite;
  var $isNaN = isNaN;
  var $pow = Math.pow;
  var $min = Math.min;
  var toObject = $traceurRuntime.toObject;
  function toUint32(x) {
    return x >>> 0;
  }
  function isObject(x) {
    return x && (typeof x === 'object' || typeof x === 'function');
  }
  function isCallable(x) {
    return typeof x === 'function';
  }
  function isNumber(x) {
    return typeof x === 'number';
  }
  function toInteger(x) {
    x = +x;
    if ($isNaN(x))
      return 0;
    if (x === 0 || !$isFinite(x))
      return x;
    return x > 0 ? $floor(x) : $ceil(x);
  }
  var MAX_SAFE_LENGTH = $pow(2, 53) - 1;
  function toLength(x) {
    var len = toInteger(x);
    return len < 0 ? 0 : $min(len, MAX_SAFE_LENGTH);
  }
  function checkIterable(x) {
    return !isObject(x) ? undefined : x[Symbol.iterator];
  }
  function isConstructor(x) {
    return isCallable(x);
  }
  function createIteratorResultObject(value, done) {
    return {
      value: value,
      done: done
    };
  }
  function maybeDefine(object, name, descr) {
    if (!(name in object)) {
      Object.defineProperty(object, name, descr);
    }
  }
  function maybeDefineMethod(object, name, value) {
    maybeDefine(object, name, {
      value: value,
      configurable: true,
      enumerable: false,
      writable: true
    });
  }
  function maybeDefineConst(object, name, value) {
    maybeDefine(object, name, {
      value: value,
      configurable: false,
      enumerable: false,
      writable: false
    });
  }
  function maybeAddFunctions(object, functions) {
    for (var i = 0; i < functions.length; i += 2) {
      var name = functions[i];
      var value = functions[i + 1];
      maybeDefineMethod(object, name, value);
    }
  }
  function maybeAddConsts(object, consts) {
    for (var i = 0; i < consts.length; i += 2) {
      var name = consts[i];
      var value = consts[i + 1];
      maybeDefineConst(object, name, value);
    }
  }
  function maybeAddIterator(object, func, Symbol) {
    if (!Symbol || !Symbol.iterator || object[Symbol.iterator])
      return;
    if (object['@@iterator'])
      func = object['@@iterator'];
    Object.defineProperty(object, Symbol.iterator, {
      value: func,
      configurable: true,
      enumerable: false,
      writable: true
    });
  }
  var polyfills = [];
  function registerPolyfill(func) {
    polyfills.push(func);
  }
  function polyfillAll(global) {
    polyfills.forEach((function(f) {
      return f(global);
    }));
  }
  return {
    get toObject() {
      return toObject;
    },
    get toUint32() {
      return toUint32;
    },
    get isObject() {
      return isObject;
    },
    get isCallable() {
      return isCallable;
    },
    get isNumber() {
      return isNumber;
    },
    get toInteger() {
      return toInteger;
    },
    get toLength() {
      return toLength;
    },
    get checkIterable() {
      return checkIterable;
    },
    get isConstructor() {
      return isConstructor;
    },
    get createIteratorResultObject() {
      return createIteratorResultObject;
    },
    get maybeDefine() {
      return maybeDefine;
    },
    get maybeDefineMethod() {
      return maybeDefineMethod;
    },
    get maybeDefineConst() {
      return maybeDefineConst;
    },
    get maybeAddFunctions() {
      return maybeAddFunctions;
    },
    get maybeAddConsts() {
      return maybeAddConsts;
    },
    get maybeAddIterator() {
      return maybeAddIterator;
    },
    get registerPolyfill() {
      return registerPolyfill;
    },
    get polyfillAll() {
      return polyfillAll;
    }
  };
});
System.register("traceur-runtime@0.0.62/src/runtime/polyfills/Map", [], function() {
  "use strict";
  var __moduleName = "traceur-runtime@0.0.62/src/runtime/polyfills/Map";
  var $__3 = System.get("traceur-runtime@0.0.62/src/runtime/polyfills/utils"),
      isObject = $__3.isObject,
      maybeAddIterator = $__3.maybeAddIterator,
      registerPolyfill = $__3.registerPolyfill;
  var getOwnHashObject = $traceurRuntime.getOwnHashObject;
  var $hasOwnProperty = Object.prototype.hasOwnProperty;
  var deletedSentinel = {};
  function lookupIndex(map, key) {
    if (isObject(key)) {
      var hashObject = getOwnHashObject(key);
      return hashObject && map.objectIndex_[hashObject.hash];
    }
    if (typeof key === 'string')
      return map.stringIndex_[key];
    return map.primitiveIndex_[key];
  }
  function initMap(map) {
    map.entries_ = [];
    map.objectIndex_ = Object.create(null);
    map.stringIndex_ = Object.create(null);
    map.primitiveIndex_ = Object.create(null);
    map.deletedCount_ = 0;
  }
  var Map = function Map() {
    var iterable = arguments[0];
    if (!isObject(this))
      throw new TypeError('Map called on incompatible type');
    if ($hasOwnProperty.call(this, 'entries_')) {
      throw new TypeError('Map can not be reentrantly initialised');
    }
    initMap(this);
    if (iterable !== null && iterable !== undefined) {
      for (var $__5 = iterable[Symbol.iterator](),
          $__6; !($__6 = $__5.next()).done; ) {
        var $__7 = $__6.value,
            key = $__7[0],
            value = $__7[1];
        {
          this.set(key, value);
        }
      }
    }
  };
  ($traceurRuntime.createClass)(Map, {
    get size() {
      return this.entries_.length / 2 - this.deletedCount_;
    },
    get: function(key) {
      var index = lookupIndex(this, key);
      if (index !== undefined)
        return this.entries_[index + 1];
    },
    set: function(key, value) {
      var objectMode = isObject(key);
      var stringMode = typeof key === 'string';
      var index = lookupIndex(this, key);
      if (index !== undefined) {
        this.entries_[index + 1] = value;
      } else {
        index = this.entries_.length;
        this.entries_[index] = key;
        this.entries_[index + 1] = value;
        if (objectMode) {
          var hashObject = getOwnHashObject(key);
          var hash = hashObject.hash;
          this.objectIndex_[hash] = index;
        } else if (stringMode) {
          this.stringIndex_[key] = index;
        } else {
          this.primitiveIndex_[key] = index;
        }
      }
      return this;
    },
    has: function(key) {
      return lookupIndex(this, key) !== undefined;
    },
    delete: function(key) {
      var objectMode = isObject(key);
      var stringMode = typeof key === 'string';
      var index;
      var hash;
      if (objectMode) {
        var hashObject = getOwnHashObject(key);
        if (hashObject) {
          index = this.objectIndex_[hash = hashObject.hash];
          delete this.objectIndex_[hash];
        }
      } else if (stringMode) {
        index = this.stringIndex_[key];
        delete this.stringIndex_[key];
      } else {
        index = this.primitiveIndex_[key];
        delete this.primitiveIndex_[key];
      }
      if (index !== undefined) {
        this.entries_[index] = deletedSentinel;
        this.entries_[index + 1] = undefined;
        this.deletedCount_++;
        return true;
      }
      return false;
    },
    clear: function() {
      initMap(this);
    },
    forEach: function(callbackFn) {
      var thisArg = arguments[1];
      for (var i = 0; i < this.entries_.length; i += 2) {
        var key = this.entries_[i];
        var value = this.entries_[i + 1];
        if (key === deletedSentinel)
          continue;
        callbackFn.call(thisArg, value, key, this);
      }
    },
    entries: $traceurRuntime.initGeneratorFunction(function $__8() {
      var i,
          key,
          value;
      return $traceurRuntime.createGeneratorInstance(function($ctx) {
        while (true)
          switch ($ctx.state) {
            case 0:
              i = 0;
              $ctx.state = 12;
              break;
            case 12:
              $ctx.state = (i < this.entries_.length) ? 8 : -2;
              break;
            case 4:
              i += 2;
              $ctx.state = 12;
              break;
            case 8:
              key = this.entries_[i];
              value = this.entries_[i + 1];
              $ctx.state = 9;
              break;
            case 9:
              $ctx.state = (key === deletedSentinel) ? 4 : 6;
              break;
            case 6:
              $ctx.state = 2;
              return [key, value];
            case 2:
              $ctx.maybeThrow();
              $ctx.state = 4;
              break;
            default:
              return $ctx.end();
          }
      }, $__8, this);
    }),
    keys: $traceurRuntime.initGeneratorFunction(function $__9() {
      var i,
          key,
          value;
      return $traceurRuntime.createGeneratorInstance(function($ctx) {
        while (true)
          switch ($ctx.state) {
            case 0:
              i = 0;
              $ctx.state = 12;
              break;
            case 12:
              $ctx.state = (i < this.entries_.length) ? 8 : -2;
              break;
            case 4:
              i += 2;
              $ctx.state = 12;
              break;
            case 8:
              key = this.entries_[i];
              value = this.entries_[i + 1];
              $ctx.state = 9;
              break;
            case 9:
              $ctx.state = (key === deletedSentinel) ? 4 : 6;
              break;
            case 6:
              $ctx.state = 2;
              return key;
            case 2:
              $ctx.maybeThrow();
              $ctx.state = 4;
              break;
            default:
              return $ctx.end();
          }
      }, $__9, this);
    }),
    values: $traceurRuntime.initGeneratorFunction(function $__10() {
      var i,
          key,
          value;
      return $traceurRuntime.createGeneratorInstance(function($ctx) {
        while (true)
          switch ($ctx.state) {
            case 0:
              i = 0;
              $ctx.state = 12;
              break;
            case 12:
              $ctx.state = (i < this.entries_.length) ? 8 : -2;
              break;
            case 4:
              i += 2;
              $ctx.state = 12;
              break;
            case 8:
              key = this.entries_[i];
              value = this.entries_[i + 1];
              $ctx.state = 9;
              break;
            case 9:
              $ctx.state = (key === deletedSentinel) ? 4 : 6;
              break;
            case 6:
              $ctx.state = 2;
              return value;
            case 2:
              $ctx.maybeThrow();
              $ctx.state = 4;
              break;
            default:
              return $ctx.end();
          }
      }, $__10, this);
    })
  }, {});
  Object.defineProperty(Map.prototype, Symbol.iterator, {
    configurable: true,
    writable: true,
    value: Map.prototype.entries
  });
  function polyfillMap(global) {
    var $__7 = global,
        Object = $__7.Object,
        Symbol = $__7.Symbol;
    if (!global.Map)
      global.Map = Map;
    var mapPrototype = global.Map.prototype;
    if (mapPrototype.entries) {
      maybeAddIterator(mapPrototype, mapPrototype.entries, Symbol);
      maybeAddIterator(Object.getPrototypeOf(new global.Map().entries()), function() {
        return this;
      }, Symbol);
    }
  }
  registerPolyfill(polyfillMap);
  return {
    get Map() {
      return Map;
    },
    get polyfillMap() {
      return polyfillMap;
    }
  };
});
System.get("traceur-runtime@0.0.62/src/runtime/polyfills/Map" + '');
System.register("traceur-runtime@0.0.62/src/runtime/polyfills/Set", [], function() {
  "use strict";
  var __moduleName = "traceur-runtime@0.0.62/src/runtime/polyfills/Set";
  var $__11 = System.get("traceur-runtime@0.0.62/src/runtime/polyfills/utils"),
      isObject = $__11.isObject,
      maybeAddIterator = $__11.maybeAddIterator,
      registerPolyfill = $__11.registerPolyfill;
  var Map = System.get("traceur-runtime@0.0.62/src/runtime/polyfills/Map").Map;
  var getOwnHashObject = $traceurRuntime.getOwnHashObject;
  var $hasOwnProperty = Object.prototype.hasOwnProperty;
  function initSet(set) {
    set.map_ = new Map();
  }
  var Set = function Set() {
    var iterable = arguments[0];
    if (!isObject(this))
      throw new TypeError('Set called on incompatible type');
    if ($hasOwnProperty.call(this, 'map_')) {
      throw new TypeError('Set can not be reentrantly initialised');
    }
    initSet(this);
    if (iterable !== null && iterable !== undefined) {
      for (var $__15 = iterable[Symbol.iterator](),
          $__16; !($__16 = $__15.next()).done; ) {
        var item = $__16.value;
        {
          this.add(item);
        }
      }
    }
  };
  ($traceurRuntime.createClass)(Set, {
    get size() {
      return this.map_.size;
    },
    has: function(key) {
      return this.map_.has(key);
    },
    add: function(key) {
      this.map_.set(key, key);
      return this;
    },
    delete: function(key) {
      return this.map_.delete(key);
    },
    clear: function() {
      return this.map_.clear();
    },
    forEach: function(callbackFn) {
      var thisArg = arguments[1];
      var $__13 = this;
      return this.map_.forEach((function(value, key) {
        callbackFn.call(thisArg, key, key, $__13);
      }));
    },
    values: $traceurRuntime.initGeneratorFunction(function $__18() {
      var $__19,
          $__20;
      return $traceurRuntime.createGeneratorInstance(function($ctx) {
        while (true)
          switch ($ctx.state) {
            case 0:
              $__19 = this.map_.keys()[Symbol.iterator]();
              $ctx.sent = void 0;
              $ctx.action = 'next';
              $ctx.state = 12;
              break;
            case 12:
              $__20 = $__19[$ctx.action]($ctx.sentIgnoreThrow);
              $ctx.state = 9;
              break;
            case 9:
              $ctx.state = ($__20.done) ? 3 : 2;
              break;
            case 3:
              $ctx.sent = $__20.value;
              $ctx.state = -2;
              break;
            case 2:
              $ctx.state = 12;
              return $__20.value;
            default:
              return $ctx.end();
          }
      }, $__18, this);
    }),
    entries: $traceurRuntime.initGeneratorFunction(function $__21() {
      var $__22,
          $__23;
      return $traceurRuntime.createGeneratorInstance(function($ctx) {
        while (true)
          switch ($ctx.state) {
            case 0:
              $__22 = this.map_.entries()[Symbol.iterator]();
              $ctx.sent = void 0;
              $ctx.action = 'next';
              $ctx.state = 12;
              break;
            case 12:
              $__23 = $__22[$ctx.action]($ctx.sentIgnoreThrow);
              $ctx.state = 9;
              break;
            case 9:
              $ctx.state = ($__23.done) ? 3 : 2;
              break;
            case 3:
              $ctx.sent = $__23.value;
              $ctx.state = -2;
              break;
            case 2:
              $ctx.state = 12;
              return $__23.value;
            default:
              return $ctx.end();
          }
      }, $__21, this);
    })
  }, {});
  Object.defineProperty(Set.prototype, Symbol.iterator, {
    configurable: true,
    writable: true,
    value: Set.prototype.values
  });
  Object.defineProperty(Set.prototype, 'keys', {
    configurable: true,
    writable: true,
    value: Set.prototype.values
  });
  function polyfillSet(global) {
    var $__17 = global,
        Object = $__17.Object,
        Symbol = $__17.Symbol;
    if (!global.Set)
      global.Set = Set;
    var setPrototype = global.Set.prototype;
    if (setPrototype.values) {
      maybeAddIterator(setPrototype, setPrototype.values, Symbol);
      maybeAddIterator(Object.getPrototypeOf(new global.Set().values()), function() {
        return this;
      }, Symbol);
    }
  }
  registerPolyfill(polyfillSet);
  return {
    get Set() {
      return Set;
    },
    get polyfillSet() {
      return polyfillSet;
    }
  };
});
System.get("traceur-runtime@0.0.62/src/runtime/polyfills/Set" + '');
System.register("traceur-runtime@0.0.62/node_modules/rsvp/lib/rsvp/asap", [], function() {
  "use strict";
  var __moduleName = "traceur-runtime@0.0.62/node_modules/rsvp/lib/rsvp/asap";
  var len = 0;
  function asap(callback, arg) {
    queue[len] = callback;
    queue[len + 1] = arg;
    len += 2;
    if (len === 2) {
      scheduleFlush();
    }
  }
  var $__default = asap;
  var browserGlobal = (typeof window !== 'undefined') ? window : {};
  var BrowserMutationObserver = browserGlobal.MutationObserver || browserGlobal.WebKitMutationObserver;
  var isWorker = typeof Uint8ClampedArray !== 'undefined' && typeof importScripts !== 'undefined' && typeof MessageChannel !== 'undefined';
  function useNextTick() {
    return function() {
      process.nextTick(flush);
    };
  }
  function useMutationObserver() {
    var iterations = 0;
    var observer = new BrowserMutationObserver(flush);
    var node = document.createTextNode('');
    observer.observe(node, {characterData: true});
    return function() {
      node.data = (iterations = ++iterations % 2);
    };
  }
  function useMessageChannel() {
    var channel = new MessageChannel();
    channel.port1.onmessage = flush;
    return function() {
      channel.port2.postMessage(0);
    };
  }
  function useSetTimeout() {
    return function() {
      setTimeout(flush, 1);
    };
  }
  var queue = new Array(1000);
  function flush() {
    for (var i = 0; i < len; i += 2) {
      var callback = queue[i];
      var arg = queue[i + 1];
      callback(arg);
      queue[i] = undefined;
      queue[i + 1] = undefined;
    }
    len = 0;
  }
  var scheduleFlush;
  if (typeof process !== 'undefined' && {}.toString.call(process) === '[object process]') {
    scheduleFlush = useNextTick();
  } else if (BrowserMutationObserver) {
    scheduleFlush = useMutationObserver();
  } else if (isWorker) {
    scheduleFlush = useMessageChannel();
  } else {
    scheduleFlush = useSetTimeout();
  }
  return {get default() {
      return $__default;
    }};
});
System.register("traceur-runtime@0.0.62/src/runtime/polyfills/Promise", [], function() {
  "use strict";
  var __moduleName = "traceur-runtime@0.0.62/src/runtime/polyfills/Promise";
  var async = System.get("traceur-runtime@0.0.62/node_modules/rsvp/lib/rsvp/asap").default;
  var registerPolyfill = System.get("traceur-runtime@0.0.62/src/runtime/polyfills/utils").registerPolyfill;
  var promiseRaw = {};
  function isPromise(x) {
    return x && typeof x === 'object' && x.status_ !== undefined;
  }
  function idResolveHandler(x) {
    return x;
  }
  function idRejectHandler(x) {
    throw x;
  }
  function chain(promise) {
    var onResolve = arguments[1] !== (void 0) ? arguments[1] : idResolveHandler;
    var onReject = arguments[2] !== (void 0) ? arguments[2] : idRejectHandler;
    var deferred = getDeferred(promise.constructor);
    switch (promise.status_) {
      case undefined:
        throw TypeError;
      case 0:
        promise.onResolve_.push(onResolve, deferred);
        promise.onReject_.push(onReject, deferred);
        break;
      case +1:
        promiseEnqueue(promise.value_, [onResolve, deferred]);
        break;
      case -1:
        promiseEnqueue(promise.value_, [onReject, deferred]);
        break;
    }
    return deferred.promise;
  }
  function getDeferred(C) {
    if (this === $Promise) {
      var promise = promiseInit(new $Promise(promiseRaw));
      return {
        promise: promise,
        resolve: (function(x) {
          promiseResolve(promise, x);
        }),
        reject: (function(r) {
          promiseReject(promise, r);
        })
      };
    } else {
      var result = {};
      result.promise = new C((function(resolve, reject) {
        result.resolve = resolve;
        result.reject = reject;
      }));
      return result;
    }
  }
  function promiseSet(promise, status, value, onResolve, onReject) {
    promise.status_ = status;
    promise.value_ = value;
    promise.onResolve_ = onResolve;
    promise.onReject_ = onReject;
    return promise;
  }
  function promiseInit(promise) {
    return promiseSet(promise, 0, undefined, [], []);
  }
  var Promise = function Promise(resolver) {
    if (resolver === promiseRaw)
      return;
    if (typeof resolver !== 'function')
      throw new TypeError;
    var promise = promiseInit(this);
    try {
      resolver((function(x) {
        promiseResolve(promise, x);
      }), (function(r) {
        promiseReject(promise, r);
      }));
    } catch (e) {
      promiseReject(promise, e);
    }
  };
  ($traceurRuntime.createClass)(Promise, {
    catch: function(onReject) {
      return this.then(undefined, onReject);
    },
    then: function(onResolve, onReject) {
      if (typeof onResolve !== 'function')
        onResolve = idResolveHandler;
      if (typeof onReject !== 'function')
        onReject = idRejectHandler;
      var that = this;
      var constructor = this.constructor;
      return chain(this, function(x) {
        x = promiseCoerce(constructor, x);
        return x === that ? onReject(new TypeError) : isPromise(x) ? x.then(onResolve, onReject) : onResolve(x);
      }, onReject);
    }
  }, {
    resolve: function(x) {
      if (this === $Promise) {
        if (isPromise(x)) {
          return x;
        }
        return promiseSet(new $Promise(promiseRaw), +1, x);
      } else {
        return new this(function(resolve, reject) {
          resolve(x);
        });
      }
    },
    reject: function(r) {
      if (this === $Promise) {
        return promiseSet(new $Promise(promiseRaw), -1, r);
      } else {
        return new this((function(resolve, reject) {
          reject(r);
        }));
      }
    },
    all: function(values) {
      var deferred = getDeferred(this);
      var resolutions = [];
      try {
        var count = values.length;
        if (count === 0) {
          deferred.resolve(resolutions);
        } else {
          for (var i = 0; i < values.length; i++) {
            this.resolve(values[i]).then(function(i, x) {
              resolutions[i] = x;
              if (--count === 0)
                deferred.resolve(resolutions);
            }.bind(undefined, i), (function(r) {
              deferred.reject(r);
            }));
          }
        }
      } catch (e) {
        deferred.reject(e);
      }
      return deferred.promise;
    },
    race: function(values) {
      var deferred = getDeferred(this);
      try {
        for (var i = 0; i < values.length; i++) {
          this.resolve(values[i]).then((function(x) {
            deferred.resolve(x);
          }), (function(r) {
            deferred.reject(r);
          }));
        }
      } catch (e) {
        deferred.reject(e);
      }
      return deferred.promise;
    }
  });
  var $Promise = Promise;
  var $PromiseReject = $Promise.reject;
  function promiseResolve(promise, x) {
    promiseDone(promise, +1, x, promise.onResolve_);
  }
  function promiseReject(promise, r) {
    promiseDone(promise, -1, r, promise.onReject_);
  }
  function promiseDone(promise, status, value, reactions) {
    if (promise.status_ !== 0)
      return;
    promiseEnqueue(value, reactions);
    promiseSet(promise, status, value);
  }
  function promiseEnqueue(value, tasks) {
    async((function() {
      for (var i = 0; i < tasks.length; i += 2) {
        promiseHandle(value, tasks[i], tasks[i + 1]);
      }
    }));
  }
  function promiseHandle(value, handler, deferred) {
    try {
      var result = handler(value);
      if (result === deferred.promise)
        throw new TypeError;
      else if (isPromise(result))
        chain(result, deferred.resolve, deferred.reject);
      else
        deferred.resolve(result);
    } catch (e) {
      try {
        deferred.reject(e);
      } catch (e) {}
    }
  }
  var thenableSymbol = '@@thenable';
  function isObject(x) {
    return x && (typeof x === 'object' || typeof x === 'function');
  }
  function promiseCoerce(constructor, x) {
    if (!isPromise(x) && isObject(x)) {
      var then;
      try {
        then = x.then;
      } catch (r) {
        var promise = $PromiseReject.call(constructor, r);
        x[thenableSymbol] = promise;
        return promise;
      }
      if (typeof then === 'function') {
        var p = x[thenableSymbol];
        if (p) {
          return p;
        } else {
          var deferred = getDeferred(constructor);
          x[thenableSymbol] = deferred.promise;
          try {
            then.call(x, deferred.resolve, deferred.reject);
          } catch (r) {
            deferred.reject(r);
          }
          return deferred.promise;
        }
      }
    }
    return x;
  }
  function polyfillPromise(global) {
    if (!global.Promise)
      global.Promise = Promise;
  }
  registerPolyfill(polyfillPromise);
  return {
    get Promise() {
      return Promise;
    },
    get polyfillPromise() {
      return polyfillPromise;
    }
  };
});
System.get("traceur-runtime@0.0.62/src/runtime/polyfills/Promise" + '');
System.register("traceur-runtime@0.0.62/src/runtime/polyfills/StringIterator", [], function() {
  "use strict";
  var $__29;
  var __moduleName = "traceur-runtime@0.0.62/src/runtime/polyfills/StringIterator";
  var $__27 = System.get("traceur-runtime@0.0.62/src/runtime/polyfills/utils"),
      createIteratorResultObject = $__27.createIteratorResultObject,
      isObject = $__27.isObject;
  var $__30 = $traceurRuntime,
      hasOwnProperty = $__30.hasOwnProperty,
      toProperty = $__30.toProperty;
  var iteratedString = Symbol('iteratedString');
  var stringIteratorNextIndex = Symbol('stringIteratorNextIndex');
  var StringIterator = function StringIterator() {};
  ($traceurRuntime.createClass)(StringIterator, ($__29 = {}, Object.defineProperty($__29, "next", {
    value: function() {
      var o = this;
      if (!isObject(o) || !hasOwnProperty(o, iteratedString)) {
        throw new TypeError('this must be a StringIterator object');
      }
      var s = o[toProperty(iteratedString)];
      if (s === undefined) {
        return createIteratorResultObject(undefined, true);
      }
      var position = o[toProperty(stringIteratorNextIndex)];
      var len = s.length;
      if (position >= len) {
        o[toProperty(iteratedString)] = undefined;
        return createIteratorResultObject(undefined, true);
      }
      var first = s.charCodeAt(position);
      var resultString;
      if (first < 0xD800 || first > 0xDBFF || position + 1 === len) {
        resultString = String.fromCharCode(first);
      } else {
        var second = s.charCodeAt(position + 1);
        if (second < 0xDC00 || second > 0xDFFF) {
          resultString = String.fromCharCode(first);
        } else {
          resultString = String.fromCharCode(first) + String.fromCharCode(second);
        }
      }
      o[toProperty(stringIteratorNextIndex)] = position + resultString.length;
      return createIteratorResultObject(resultString, false);
    },
    configurable: true,
    enumerable: true,
    writable: true
  }), Object.defineProperty($__29, Symbol.iterator, {
    value: function() {
      return this;
    },
    configurable: true,
    enumerable: true,
    writable: true
  }), $__29), {});
  function createStringIterator(string) {
    var s = String(string);
    var iterator = Object.create(StringIterator.prototype);
    iterator[toProperty(iteratedString)] = s;
    iterator[toProperty(stringIteratorNextIndex)] = 0;
    return iterator;
  }
  return {get createStringIterator() {
      return createStringIterator;
    }};
});
System.register("traceur-runtime@0.0.62/src/runtime/polyfills/String", [], function() {
  "use strict";
  var __moduleName = "traceur-runtime@0.0.62/src/runtime/polyfills/String";
  var createStringIterator = System.get("traceur-runtime@0.0.62/src/runtime/polyfills/StringIterator").createStringIterator;
  var $__32 = System.get("traceur-runtime@0.0.62/src/runtime/polyfills/utils"),
      maybeAddFunctions = $__32.maybeAddFunctions,
      maybeAddIterator = $__32.maybeAddIterator,
      registerPolyfill = $__32.registerPolyfill;
  var $toString = Object.prototype.toString;
  var $indexOf = String.prototype.indexOf;
  var $lastIndexOf = String.prototype.lastIndexOf;
  function startsWith(search) {
    var string = String(this);
    if (this == null || $toString.call(search) == '[object RegExp]') {
      throw TypeError();
    }
    var stringLength = string.length;
    var searchString = String(search);
    var searchLength = searchString.length;
    var position = arguments.length > 1 ? arguments[1] : undefined;
    var pos = position ? Number(position) : 0;
    if (isNaN(pos)) {
      pos = 0;
    }
    var start = Math.min(Math.max(pos, 0), stringLength);
    return $indexOf.call(string, searchString, pos) == start;
  }
  function endsWith(search) {
    var string = String(this);
    if (this == null || $toString.call(search) == '[object RegExp]') {
      throw TypeError();
    }
    var stringLength = string.length;
    var searchString = String(search);
    var searchLength = searchString.length;
    var pos = stringLength;
    if (arguments.length > 1) {
      var position = arguments[1];
      if (position !== undefined) {
        pos = position ? Number(position) : 0;
        if (isNaN(pos)) {
          pos = 0;
        }
      }
    }
    var end = Math.min(Math.max(pos, 0), stringLength);
    var start = end - searchLength;
    if (start < 0) {
      return false;
    }
    return $lastIndexOf.call(string, searchString, start) == start;
  }
  function contains(search) {
    if (this == null) {
      throw TypeError();
    }
    var string = String(this);
    var stringLength = string.length;
    var searchString = String(search);
    var searchLength = searchString.length;
    var position = arguments.length > 1 ? arguments[1] : undefined;
    var pos = position ? Number(position) : 0;
    if (isNaN(pos)) {
      pos = 0;
    }
    var start = Math.min(Math.max(pos, 0), stringLength);
    return $indexOf.call(string, searchString, pos) != -1;
  }
  function repeat(count) {
    if (this == null) {
      throw TypeError();
    }
    var string = String(this);
    var n = count ? Number(count) : 0;
    if (isNaN(n)) {
      n = 0;
    }
    if (n < 0 || n == Infinity) {
      throw RangeError();
    }
    if (n == 0) {
      return '';
    }
    var result = '';
    while (n--) {
      result += string;
    }
    return result;
  }
  function codePointAt(position) {
    if (this == null) {
      throw TypeError();
    }
    var string = String(this);
    var size = string.length;
    var index = position ? Number(position) : 0;
    if (isNaN(index)) {
      index = 0;
    }
    if (index < 0 || index >= size) {
      return undefined;
    }
    var first = string.charCodeAt(index);
    var second;
    if (first >= 0xD800 && first <= 0xDBFF && size > index + 1) {
      second = string.charCodeAt(index + 1);
      if (second >= 0xDC00 && second <= 0xDFFF) {
        return (first - 0xD800) * 0x400 + second - 0xDC00 + 0x10000;
      }
    }
    return first;
  }
  function raw(callsite) {
    var raw = callsite.raw;
    var len = raw.length >>> 0;
    if (len === 0)
      return '';
    var s = '';
    var i = 0;
    while (true) {
      s += raw[i];
      if (i + 1 === len)
        return s;
      s += arguments[++i];
    }
  }
  function fromCodePoint() {
    var codeUnits = [];
    var floor = Math.floor;
    var highSurrogate;
    var lowSurrogate;
    var index = -1;
    var length = arguments.length;
    if (!length) {
      return '';
    }
    while (++index < length) {
      var codePoint = Number(arguments[index]);
      if (!isFinite(codePoint) || codePoint < 0 || codePoint > 0x10FFFF || floor(codePoint) != codePoint) {
        throw RangeError('Invalid code point: ' + codePoint);
      }
      if (codePoint <= 0xFFFF) {
        codeUnits.push(codePoint);
      } else {
        codePoint -= 0x10000;
        highSurrogate = (codePoint >> 10) + 0xD800;
        lowSurrogate = (codePoint % 0x400) + 0xDC00;
        codeUnits.push(highSurrogate, lowSurrogate);
      }
    }
    return String.fromCharCode.apply(null, codeUnits);
  }
  function stringPrototypeIterator() {
    var o = $traceurRuntime.checkObjectCoercible(this);
    var s = String(o);
    return createStringIterator(s);
  }
  function polyfillString(global) {
    var String = global.String;
    maybeAddFunctions(String.prototype, ['codePointAt', codePointAt, 'contains', contains, 'endsWith', endsWith, 'startsWith', startsWith, 'repeat', repeat]);
    maybeAddFunctions(String, ['fromCodePoint', fromCodePoint, 'raw', raw]);
    maybeAddIterator(String.prototype, stringPrototypeIterator, Symbol);
  }
  registerPolyfill(polyfillString);
  return {
    get startsWith() {
      return startsWith;
    },
    get endsWith() {
      return endsWith;
    },
    get contains() {
      return contains;
    },
    get repeat() {
      return repeat;
    },
    get codePointAt() {
      return codePointAt;
    },
    get raw() {
      return raw;
    },
    get fromCodePoint() {
      return fromCodePoint;
    },
    get stringPrototypeIterator() {
      return stringPrototypeIterator;
    },
    get polyfillString() {
      return polyfillString;
    }
  };
});
System.get("traceur-runtime@0.0.62/src/runtime/polyfills/String" + '');
System.register("traceur-runtime@0.0.62/src/runtime/polyfills/ArrayIterator", [], function() {
  "use strict";
  var $__36;
  var __moduleName = "traceur-runtime@0.0.62/src/runtime/polyfills/ArrayIterator";
  var $__34 = System.get("traceur-runtime@0.0.62/src/runtime/polyfills/utils"),
      toObject = $__34.toObject,
      toUint32 = $__34.toUint32,
      createIteratorResultObject = $__34.createIteratorResultObject;
  var ARRAY_ITERATOR_KIND_KEYS = 1;
  var ARRAY_ITERATOR_KIND_VALUES = 2;
  var ARRAY_ITERATOR_KIND_ENTRIES = 3;
  var ArrayIterator = function ArrayIterator() {};
  ($traceurRuntime.createClass)(ArrayIterator, ($__36 = {}, Object.defineProperty($__36, "next", {
    value: function() {
      var iterator = toObject(this);
      var array = iterator.iteratorObject_;
      if (!array) {
        throw new TypeError('Object is not an ArrayIterator');
      }
      var index = iterator.arrayIteratorNextIndex_;
      var itemKind = iterator.arrayIterationKind_;
      var length = toUint32(array.length);
      if (index >= length) {
        iterator.arrayIteratorNextIndex_ = Infinity;
        return createIteratorResultObject(undefined, true);
      }
      iterator.arrayIteratorNextIndex_ = index + 1;
      if (itemKind == ARRAY_ITERATOR_KIND_VALUES)
        return createIteratorResultObject(array[index], false);
      if (itemKind == ARRAY_ITERATOR_KIND_ENTRIES)
        return createIteratorResultObject([index, array[index]], false);
      return createIteratorResultObject(index, false);
    },
    configurable: true,
    enumerable: true,
    writable: true
  }), Object.defineProperty($__36, Symbol.iterator, {
    value: function() {
      return this;
    },
    configurable: true,
    enumerable: true,
    writable: true
  }), $__36), {});
  function createArrayIterator(array, kind) {
    var object = toObject(array);
    var iterator = new ArrayIterator;
    iterator.iteratorObject_ = object;
    iterator.arrayIteratorNextIndex_ = 0;
    iterator.arrayIterationKind_ = kind;
    return iterator;
  }
  function entries() {
    return createArrayIterator(this, ARRAY_ITERATOR_KIND_ENTRIES);
  }
  function keys() {
    return createArrayIterator(this, ARRAY_ITERATOR_KIND_KEYS);
  }
  function values() {
    return createArrayIterator(this, ARRAY_ITERATOR_KIND_VALUES);
  }
  return {
    get entries() {
      return entries;
    },
    get keys() {
      return keys;
    },
    get values() {
      return values;
    }
  };
});
System.register("traceur-runtime@0.0.62/src/runtime/polyfills/Array", [], function() {
  "use strict";
  var __moduleName = "traceur-runtime@0.0.62/src/runtime/polyfills/Array";
  var $__37 = System.get("traceur-runtime@0.0.62/src/runtime/polyfills/ArrayIterator"),
      entries = $__37.entries,
      keys = $__37.keys,
      values = $__37.values;
  var $__38 = System.get("traceur-runtime@0.0.62/src/runtime/polyfills/utils"),
      checkIterable = $__38.checkIterable,
      isCallable = $__38.isCallable,
      isConstructor = $__38.isConstructor,
      maybeAddFunctions = $__38.maybeAddFunctions,
      maybeAddIterator = $__38.maybeAddIterator,
      registerPolyfill = $__38.registerPolyfill,
      toInteger = $__38.toInteger,
      toLength = $__38.toLength,
      toObject = $__38.toObject;
  function from(arrLike) {
    var mapFn = arguments[1];
    var thisArg = arguments[2];
    var C = this;
    var items = toObject(arrLike);
    var mapping = mapFn !== undefined;
    var k = 0;
    var arr,
        len;
    if (mapping && !isCallable(mapFn)) {
      throw TypeError();
    }
    if (checkIterable(items)) {
      arr = isConstructor(C) ? new C() : [];
      for (var $__39 = items[Symbol.iterator](),
          $__40; !($__40 = $__39.next()).done; ) {
        var item = $__40.value;
        {
          if (mapping) {
            arr[k] = mapFn.call(thisArg, item, k);
          } else {
            arr[k] = item;
          }
          k++;
        }
      }
      arr.length = k;
      return arr;
    }
    len = toLength(items.length);
    arr = isConstructor(C) ? new C(len) : new Array(len);
    for (; k < len; k++) {
      if (mapping) {
        arr[k] = typeof thisArg === 'undefined' ? mapFn(items[k], k) : mapFn.call(thisArg, items[k], k);
      } else {
        arr[k] = items[k];
      }
    }
    arr.length = len;
    return arr;
  }
  function of() {
    for (var items = [],
        $__41 = 0; $__41 < arguments.length; $__41++)
      items[$__41] = arguments[$__41];
    var C = this;
    var len = items.length;
    var arr = isConstructor(C) ? new C(len) : new Array(len);
    for (var k = 0; k < len; k++) {
      arr[k] = items[k];
    }
    arr.length = len;
    return arr;
  }
  function fill(value) {
    var start = arguments[1] !== (void 0) ? arguments[1] : 0;
    var end = arguments[2];
    var object = toObject(this);
    var len = toLength(object.length);
    var fillStart = toInteger(start);
    var fillEnd = end !== undefined ? toInteger(end) : len;
    fillStart = fillStart < 0 ? Math.max(len + fillStart, 0) : Math.min(fillStart, len);
    fillEnd = fillEnd < 0 ? Math.max(len + fillEnd, 0) : Math.min(fillEnd, len);
    while (fillStart < fillEnd) {
      object[fillStart] = value;
      fillStart++;
    }
    return object;
  }
  function find(predicate) {
    var thisArg = arguments[1];
    return findHelper(this, predicate, thisArg);
  }
  function findIndex(predicate) {
    var thisArg = arguments[1];
    return findHelper(this, predicate, thisArg, true);
  }
  function findHelper(self, predicate) {
    var thisArg = arguments[2];
    var returnIndex = arguments[3] !== (void 0) ? arguments[3] : false;
    var object = toObject(self);
    var len = toLength(object.length);
    if (!isCallable(predicate)) {
      throw TypeError();
    }
    for (var i = 0; i < len; i++) {
      if (i in object) {
        var value = object[i];
        if (predicate.call(thisArg, value, i, object)) {
          return returnIndex ? i : value;
        }
      }
    }
    return returnIndex ? -1 : undefined;
  }
  function polyfillArray(global) {
    var $__42 = global,
        Array = $__42.Array,
        Object = $__42.Object,
        Symbol = $__42.Symbol;
    maybeAddFunctions(Array.prototype, ['entries', entries, 'keys', keys, 'values', values, 'fill', fill, 'find', find, 'findIndex', findIndex]);
    maybeAddFunctions(Array, ['from', from, 'of', of]);
    maybeAddIterator(Array.prototype, values, Symbol);
    maybeAddIterator(Object.getPrototypeOf([].values()), function() {
      return this;
    }, Symbol);
  }
  registerPolyfill(polyfillArray);
  return {
    get from() {
      return from;
    },
    get of() {
      return of;
    },
    get fill() {
      return fill;
    },
    get find() {
      return find;
    },
    get findIndex() {
      return findIndex;
    },
    get polyfillArray() {
      return polyfillArray;
    }
  };
});
System.get("traceur-runtime@0.0.62/src/runtime/polyfills/Array" + '');
System.register("traceur-runtime@0.0.62/src/runtime/polyfills/Object", [], function() {
  "use strict";
  var __moduleName = "traceur-runtime@0.0.62/src/runtime/polyfills/Object";
  var $__43 = System.get("traceur-runtime@0.0.62/src/runtime/polyfills/utils"),
      maybeAddFunctions = $__43.maybeAddFunctions,
      registerPolyfill = $__43.registerPolyfill;
  var $__44 = $traceurRuntime,
      defineProperty = $__44.defineProperty,
      getOwnPropertyDescriptor = $__44.getOwnPropertyDescriptor,
      getOwnPropertyNames = $__44.getOwnPropertyNames,
      keys = $__44.keys,
      privateNames = $__44.privateNames;
  function is(left, right) {
    if (left === right)
      return left !== 0 || 1 / left === 1 / right;
    return left !== left && right !== right;
  }
  function assign(target) {
    for (var i = 1; i < arguments.length; i++) {
      var source = arguments[i];
      var props = keys(source);
      var p,
          length = props.length;
      for (p = 0; p < length; p++) {
        var name = props[p];
        if (privateNames[name])
          continue;
        target[name] = source[name];
      }
    }
    return target;
  }
  function mixin(target, source) {
    var props = getOwnPropertyNames(source);
    var p,
        descriptor,
        length = props.length;
    for (p = 0; p < length; p++) {
      var name = props[p];
      if (privateNames[name])
        continue;
      descriptor = getOwnPropertyDescriptor(source, props[p]);
      defineProperty(target, props[p], descriptor);
    }
    return target;
  }
  function polyfillObject(global) {
    var Object = global.Object;
    maybeAddFunctions(Object, ['assign', assign, 'is', is, 'mixin', mixin]);
  }
  registerPolyfill(polyfillObject);
  return {
    get is() {
      return is;
    },
    get assign() {
      return assign;
    },
    get mixin() {
      return mixin;
    },
    get polyfillObject() {
      return polyfillObject;
    }
  };
});
System.get("traceur-runtime@0.0.62/src/runtime/polyfills/Object" + '');
System.register("traceur-runtime@0.0.62/src/runtime/polyfills/Number", [], function() {
  "use strict";
  var __moduleName = "traceur-runtime@0.0.62/src/runtime/polyfills/Number";
  var $__46 = System.get("traceur-runtime@0.0.62/src/runtime/polyfills/utils"),
      isNumber = $__46.isNumber,
      maybeAddConsts = $__46.maybeAddConsts,
      maybeAddFunctions = $__46.maybeAddFunctions,
      registerPolyfill = $__46.registerPolyfill,
      toInteger = $__46.toInteger;
  var $abs = Math.abs;
  var $isFinite = isFinite;
  var $isNaN = isNaN;
  var MAX_SAFE_INTEGER = Math.pow(2, 53) - 1;
  var MIN_SAFE_INTEGER = -Math.pow(2, 53) + 1;
  var EPSILON = Math.pow(2, -52);
  function NumberIsFinite(number) {
    return isNumber(number) && $isFinite(number);
  }
  ;
  function isInteger(number) {
    return NumberIsFinite(number) && toInteger(number) === number;
  }
  function NumberIsNaN(number) {
    return isNumber(number) && $isNaN(number);
  }
  ;
  function isSafeInteger(number) {
    if (NumberIsFinite(number)) {
      var integral = toInteger(number);
      if (integral === number)
        return $abs(integral) <= MAX_SAFE_INTEGER;
    }
    return false;
  }
  function polyfillNumber(global) {
    var Number = global.Number;
    maybeAddConsts(Number, ['MAX_SAFE_INTEGER', MAX_SAFE_INTEGER, 'MIN_SAFE_INTEGER', MIN_SAFE_INTEGER, 'EPSILON', EPSILON]);
    maybeAddFunctions(Number, ['isFinite', NumberIsFinite, 'isInteger', isInteger, 'isNaN', NumberIsNaN, 'isSafeInteger', isSafeInteger]);
  }
  registerPolyfill(polyfillNumber);
  return {
    get MAX_SAFE_INTEGER() {
      return MAX_SAFE_INTEGER;
    },
    get MIN_SAFE_INTEGER() {
      return MIN_SAFE_INTEGER;
    },
    get EPSILON() {
      return EPSILON;
    },
    get isFinite() {
      return NumberIsFinite;
    },
    get isInteger() {
      return isInteger;
    },
    get isNaN() {
      return NumberIsNaN;
    },
    get isSafeInteger() {
      return isSafeInteger;
    },
    get polyfillNumber() {
      return polyfillNumber;
    }
  };
});
System.get("traceur-runtime@0.0.62/src/runtime/polyfills/Number" + '');
System.register("traceur-runtime@0.0.62/src/runtime/polyfills/polyfills", [], function() {
  "use strict";
  var __moduleName = "traceur-runtime@0.0.62/src/runtime/polyfills/polyfills";
  var polyfillAll = System.get("traceur-runtime@0.0.62/src/runtime/polyfills/utils").polyfillAll;
  polyfillAll(this);
  var setupGlobals = $traceurRuntime.setupGlobals;
  $traceurRuntime.setupGlobals = function(global) {
    setupGlobals(global);
    polyfillAll(global);
  };
  return {};
});
System.get("traceur-runtime@0.0.62/src/runtime/polyfills/polyfills" + '');

}).call(this,require("/Users/bcamper/Documents/dev/vector-map/node_modules/browserify/node_modules/insert-module-globals/node_modules/process/browser.js"),typeof self !== "undefined" ? self : typeof window !== "undefined" ? window : {})
},{"/Users/bcamper/Documents/dev/vector-map/node_modules/browserify/node_modules/insert-module-globals/node_modules/process/browser.js":2}],4:[function(require,module,exports){
/**
 * @fileoverview gl-matrix - High performance matrix and vector operations
 * @author Brandon Jones
 * @author Colin MacKenzie IV
 * @version 2.1.0
 */

/* Copyright (c) 2013, Brandon Jones, Colin MacKenzie IV. All rights reserved.

Redistribution and use in source and binary forms, with or without modification,
are permitted provided that the following conditions are met:

  * Redistributions of source code must retain the above copyright notice, this
    list of conditions and the following disclaimer.
  * Redistributions in binary form must reproduce the above copyright notice,
    this list of conditions and the following disclaimer in the documentation 
    and/or other materials provided with the distribution.

THIS SOFTWARE IS PROVIDED BY THE COPYRIGHT HOLDERS AND CONTRIBUTORS "AS IS" AND
ANY EXPRESS OR IMPLIED WARRANTIES, INCLUDING, BUT NOT LIMITED TO, THE IMPLIED
WARRANTIES OF MERCHANTABILITY AND FITNESS FOR A PARTICULAR PURPOSE ARE 
DISCLAIMED. IN NO EVENT SHALL THE COPYRIGHT HOLDER OR CONTRIBUTORS BE LIABLE FOR
ANY DIRECT, INDIRECT, INCIDENTAL, SPECIAL, EXEMPLARY, OR CONSEQUENTIAL DAMAGES
(INCLUDING, BUT NOT LIMITED TO, PROCUREMENT OF SUBSTITUTE GOODS OR SERVICES;
LOSS OF USE, DATA, OR PROFITS; OR BUSINESS INTERRUPTION) HOWEVER CAUSED AND ON
ANY THEORY OF LIABILITY, WHETHER IN CONTRACT, STRICT LIABILITY, OR TORT
(INCLUDING NEGLIGENCE OR OTHERWISE) ARISING IN ANY WAY OUT OF THE USE OF THIS
SOFTWARE, EVEN IF ADVISED OF THE POSSIBILITY OF SUCH DAMAGE. */


(function() {
  "use strict";

  var shim = {};
  if (typeof(exports) === 'undefined') {
    if(typeof define == 'function' && typeof define.amd == 'object' && define.amd) {
      shim.exports = {};
      define(function() {
        return shim.exports;
      });
    } else {
      // gl-matrix lives in a browser, define its namespaces in global
      shim.exports = window;
    }    
  }
  else {
    // gl-matrix lives in commonjs, define its namespaces in exports
    shim.exports = exports;
  }

  (function(exports) {
    /* Copyright (c) 2013, Brandon Jones, Colin MacKenzie IV. All rights reserved.

Redistribution and use in source and binary forms, with or without modification,
are permitted provided that the following conditions are met:

  * Redistributions of source code must retain the above copyright notice, this
    list of conditions and the following disclaimer.
  * Redistributions in binary form must reproduce the above copyright notice,
    this list of conditions and the following disclaimer in the documentation 
    and/or other materials provided with the distribution.

THIS SOFTWARE IS PROVIDED BY THE COPYRIGHT HOLDERS AND CONTRIBUTORS "AS IS" AND
ANY EXPRESS OR IMPLIED WARRANTIES, INCLUDING, BUT NOT LIMITED TO, THE IMPLIED
WARRANTIES OF MERCHANTABILITY AND FITNESS FOR A PARTICULAR PURPOSE ARE 
DISCLAIMED. IN NO EVENT SHALL THE COPYRIGHT HOLDER OR CONTRIBUTORS BE LIABLE FOR
ANY DIRECT, INDIRECT, INCIDENTAL, SPECIAL, EXEMPLARY, OR CONSEQUENTIAL DAMAGES
(INCLUDING, BUT NOT LIMITED TO, PROCUREMENT OF SUBSTITUTE GOODS OR SERVICES;
LOSS OF USE, DATA, OR PROFITS; OR BUSINESS INTERRUPTION) HOWEVER CAUSED AND ON
ANY THEORY OF LIABILITY, WHETHER IN CONTRACT, STRICT LIABILITY, OR TORT
(INCLUDING NEGLIGENCE OR OTHERWISE) ARISING IN ANY WAY OUT OF THE USE OF THIS
SOFTWARE, EVEN IF ADVISED OF THE POSSIBILITY OF SUCH DAMAGE. */


if(!GLMAT_EPSILON) {
    var GLMAT_EPSILON = 0.000001;
}

if(!GLMAT_ARRAY_TYPE) {
    var GLMAT_ARRAY_TYPE = (typeof Float32Array !== 'undefined') ? Float32Array : Array;
}

/**
 * @class Common utilities
 * @name glMatrix
 */
var glMatrix = {};

/**
 * Sets the type of array used when creating new vectors and matricies
 *
 * @param {Type} type Array type, such as Float32Array or Array
 */
glMatrix.setMatrixArrayType = function(type) {
    GLMAT_ARRAY_TYPE = type;
}

if(typeof(exports) !== 'undefined') {
    exports.glMatrix = glMatrix;
}
;
/* Copyright (c) 2013, Brandon Jones, Colin MacKenzie IV. All rights reserved.

Redistribution and use in source and binary forms, with or without modification,
are permitted provided that the following conditions are met:

  * Redistributions of source code must retain the above copyright notice, this
    list of conditions and the following disclaimer.
  * Redistributions in binary form must reproduce the above copyright notice,
    this list of conditions and the following disclaimer in the documentation 
    and/or other materials provided with the distribution.

THIS SOFTWARE IS PROVIDED BY THE COPYRIGHT HOLDERS AND CONTRIBUTORS "AS IS" AND
ANY EXPRESS OR IMPLIED WARRANTIES, INCLUDING, BUT NOT LIMITED TO, THE IMPLIED
WARRANTIES OF MERCHANTABILITY AND FITNESS FOR A PARTICULAR PURPOSE ARE 
DISCLAIMED. IN NO EVENT SHALL THE COPYRIGHT HOLDER OR CONTRIBUTORS BE LIABLE FOR
ANY DIRECT, INDIRECT, INCIDENTAL, SPECIAL, EXEMPLARY, OR CONSEQUENTIAL DAMAGES
(INCLUDING, BUT NOT LIMITED TO, PROCUREMENT OF SUBSTITUTE GOODS OR SERVICES;
LOSS OF USE, DATA, OR PROFITS; OR BUSINESS INTERRUPTION) HOWEVER CAUSED AND ON
ANY THEORY OF LIABILITY, WHETHER IN CONTRACT, STRICT LIABILITY, OR TORT
(INCLUDING NEGLIGENCE OR OTHERWISE) ARISING IN ANY WAY OUT OF THE USE OF THIS
SOFTWARE, EVEN IF ADVISED OF THE POSSIBILITY OF SUCH DAMAGE. */

/**
 * @class 2 Dimensional Vector
 * @name vec2
 */

var vec2 = {};

/**
 * Creates a new, empty vec2
 *
 * @returns {vec2} a new 2D vector
 */
vec2.create = function() {
    var out = new GLMAT_ARRAY_TYPE(2);
    out[0] = 0;
    out[1] = 0;
    return out;
};

/**
 * Creates a new vec2 initialized with values from an existing vector
 *
 * @param {vec2} a vector to clone
 * @returns {vec2} a new 2D vector
 */
vec2.clone = function(a) {
    var out = new GLMAT_ARRAY_TYPE(2);
    out[0] = a[0];
    out[1] = a[1];
    return out;
};

/**
 * Creates a new vec2 initialized with the given values
 *
 * @param {Number} x X component
 * @param {Number} y Y component
 * @returns {vec2} a new 2D vector
 */
vec2.fromValues = function(x, y) {
    var out = new GLMAT_ARRAY_TYPE(2);
    out[0] = x;
    out[1] = y;
    return out;
};

/**
 * Copy the values from one vec2 to another
 *
 * @param {vec2} out the receiving vector
 * @param {vec2} a the source vector
 * @returns {vec2} out
 */
vec2.copy = function(out, a) {
    out[0] = a[0];
    out[1] = a[1];
    return out;
};

/**
 * Set the components of a vec2 to the given values
 *
 * @param {vec2} out the receiving vector
 * @param {Number} x X component
 * @param {Number} y Y component
 * @returns {vec2} out
 */
vec2.set = function(out, x, y) {
    out[0] = x;
    out[1] = y;
    return out;
};

/**
 * Adds two vec2's
 *
 * @param {vec2} out the receiving vector
 * @param {vec2} a the first operand
 * @param {vec2} b the second operand
 * @returns {vec2} out
 */
vec2.add = function(out, a, b) {
    out[0] = a[0] + b[0];
    out[1] = a[1] + b[1];
    return out;
};

/**
 * Subtracts two vec2's
 *
 * @param {vec2} out the receiving vector
 * @param {vec2} a the first operand
 * @param {vec2} b the second operand
 * @returns {vec2} out
 */
vec2.subtract = function(out, a, b) {
    out[0] = a[0] - b[0];
    out[1] = a[1] - b[1];
    return out;
};

/**
 * Alias for {@link vec2.subtract}
 * @function
 */
vec2.sub = vec2.subtract;

/**
 * Multiplies two vec2's
 *
 * @param {vec2} out the receiving vector
 * @param {vec2} a the first operand
 * @param {vec2} b the second operand
 * @returns {vec2} out
 */
vec2.multiply = function(out, a, b) {
    out[0] = a[0] * b[0];
    out[1] = a[1] * b[1];
    return out;
};

/**
 * Alias for {@link vec2.multiply}
 * @function
 */
vec2.mul = vec2.multiply;

/**
 * Divides two vec2's
 *
 * @param {vec2} out the receiving vector
 * @param {vec2} a the first operand
 * @param {vec2} b the second operand
 * @returns {vec2} out
 */
vec2.divide = function(out, a, b) {
    out[0] = a[0] / b[0];
    out[1] = a[1] / b[1];
    return out;
};

/**
 * Alias for {@link vec2.divide}
 * @function
 */
vec2.div = vec2.divide;

/**
 * Returns the minimum of two vec2's
 *
 * @param {vec2} out the receiving vector
 * @param {vec2} a the first operand
 * @param {vec2} b the second operand
 * @returns {vec2} out
 */
vec2.min = function(out, a, b) {
    out[0] = Math.min(a[0], b[0]);
    out[1] = Math.min(a[1], b[1]);
    return out;
};

/**
 * Returns the maximum of two vec2's
 *
 * @param {vec2} out the receiving vector
 * @param {vec2} a the first operand
 * @param {vec2} b the second operand
 * @returns {vec2} out
 */
vec2.max = function(out, a, b) {
    out[0] = Math.max(a[0], b[0]);
    out[1] = Math.max(a[1], b[1]);
    return out;
};

/**
 * Scales a vec2 by a scalar number
 *
 * @param {vec2} out the receiving vector
 * @param {vec2} a the vector to scale
 * @param {Number} b amount to scale the vector by
 * @returns {vec2} out
 */
vec2.scale = function(out, a, b) {
    out[0] = a[0] * b;
    out[1] = a[1] * b;
    return out;
};

/**
 * Calculates the euclidian distance between two vec2's
 *
 * @param {vec2} a the first operand
 * @param {vec2} b the second operand
 * @returns {Number} distance between a and b
 */
vec2.distance = function(a, b) {
    var x = b[0] - a[0],
        y = b[1] - a[1];
    return Math.sqrt(x*x + y*y);
};

/**
 * Alias for {@link vec2.distance}
 * @function
 */
vec2.dist = vec2.distance;

/**
 * Calculates the squared euclidian distance between two vec2's
 *
 * @param {vec2} a the first operand
 * @param {vec2} b the second operand
 * @returns {Number} squared distance between a and b
 */
vec2.squaredDistance = function(a, b) {
    var x = b[0] - a[0],
        y = b[1] - a[1];
    return x*x + y*y;
};

/**
 * Alias for {@link vec2.squaredDistance}
 * @function
 */
vec2.sqrDist = vec2.squaredDistance;

/**
 * Calculates the length of a vec2
 *
 * @param {vec2} a vector to calculate length of
 * @returns {Number} length of a
 */
vec2.length = function (a) {
    var x = a[0],
        y = a[1];
    return Math.sqrt(x*x + y*y);
};

/**
 * Alias for {@link vec2.length}
 * @function
 */
vec2.len = vec2.length;

/**
 * Calculates the squared length of a vec2
 *
 * @param {vec2} a vector to calculate squared length of
 * @returns {Number} squared length of a
 */
vec2.squaredLength = function (a) {
    var x = a[0],
        y = a[1];
    return x*x + y*y;
};

/**
 * Alias for {@link vec2.squaredLength}
 * @function
 */
vec2.sqrLen = vec2.squaredLength;

/**
 * Negates the components of a vec2
 *
 * @param {vec2} out the receiving vector
 * @param {vec2} a vector to negate
 * @returns {vec2} out
 */
vec2.negate = function(out, a) {
    out[0] = -a[0];
    out[1] = -a[1];
    return out;
};

/**
 * Normalize a vec2
 *
 * @param {vec2} out the receiving vector
 * @param {vec2} a vector to normalize
 * @returns {vec2} out
 */
vec2.normalize = function(out, a) {
    var x = a[0],
        y = a[1];
    var len = x*x + y*y;
    if (len > 0) {
        //TODO: evaluate use of glm_invsqrt here?
        len = 1 / Math.sqrt(len);
        out[0] = a[0] * len;
        out[1] = a[1] * len;
    }
    return out;
};

/**
 * Calculates the dot product of two vec2's
 *
 * @param {vec2} a the first operand
 * @param {vec2} b the second operand
 * @returns {Number} dot product of a and b
 */
vec2.dot = function (a, b) {
    return a[0] * b[0] + a[1] * b[1];
};

/**
 * Computes the cross product of two vec2's
 * Note that the cross product must by definition produce a 3D vector
 *
 * @param {vec3} out the receiving vector
 * @param {vec2} a the first operand
 * @param {vec2} b the second operand
 * @returns {vec3} out
 */
vec2.cross = function(out, a, b) {
    var z = a[0] * b[1] - a[1] * b[0];
    out[0] = out[1] = 0;
    out[2] = z;
    return out;
};

/**
 * Performs a linear interpolation between two vec2's
 *
 * @param {vec2} out the receiving vector
 * @param {vec2} a the first operand
 * @param {vec2} b the second operand
 * @param {Number} t interpolation amount between the two inputs
 * @returns {vec2} out
 */
vec2.lerp = function (out, a, b, t) {
    var ax = a[0],
        ay = a[1];
    out[0] = ax + t * (b[0] - ax);
    out[1] = ay + t * (b[1] - ay);
    return out;
};

/**
 * Transforms the vec2 with a mat2
 *
 * @param {vec2} out the receiving vector
 * @param {vec2} a the vector to transform
 * @param {mat2} m matrix to transform with
 * @returns {vec2} out
 */
vec2.transformMat2 = function(out, a, m) {
    var x = a[0],
        y = a[1];
    out[0] = m[0] * x + m[2] * y;
    out[1] = m[1] * x + m[3] * y;
    return out;
};

/**
 * Transforms the vec2 with a mat2d
 *
 * @param {vec2} out the receiving vector
 * @param {vec2} a the vector to transform
 * @param {mat2d} m matrix to transform with
 * @returns {vec2} out
 */
vec2.transformMat2d = function(out, a, m) {
    var x = a[0],
        y = a[1];
    out[0] = m[0] * x + m[2] * y + m[4];
    out[1] = m[1] * x + m[3] * y + m[5];
    return out;
};

/**
 * Transforms the vec2 with a mat3
 * 3rd vector component is implicitly '1'
 *
 * @param {vec2} out the receiving vector
 * @param {vec2} a the vector to transform
 * @param {mat3} m matrix to transform with
 * @returns {vec2} out
 */
vec2.transformMat3 = function(out, a, m) {
    var x = a[0],
        y = a[1];
    out[0] = m[0] * x + m[3] * y + m[6];
    out[1] = m[1] * x + m[4] * y + m[7];
    return out;
};

/**
 * Transforms the vec2 with a mat4
 * 3rd vector component is implicitly '0'
 * 4th vector component is implicitly '1'
 *
 * @param {vec2} out the receiving vector
 * @param {vec2} a the vector to transform
 * @param {mat4} m matrix to transform with
 * @returns {vec2} out
 */
vec2.transformMat4 = function(out, a, m) {
    var x = a[0], 
        y = a[1];
    out[0] = m[0] * x + m[4] * y + m[12];
    out[1] = m[1] * x + m[5] * y + m[13];
    return out;
};

/**
 * Perform some operation over an array of vec2s.
 *
 * @param {Array} a the array of vectors to iterate over
 * @param {Number} stride Number of elements between the start of each vec2. If 0 assumes tightly packed
 * @param {Number} offset Number of elements to skip at the beginning of the array
 * @param {Number} count Number of vec2s to iterate over. If 0 iterates over entire array
 * @param {Function} fn Function to call for each vector in the array
 * @param {Object} [arg] additional argument to pass to fn
 * @returns {Array} a
 * @function
 */
vec2.forEach = (function() {
    var vec = vec2.create();

    return function(a, stride, offset, count, fn, arg) {
        var i, l;
        if(!stride) {
            stride = 2;
        }

        if(!offset) {
            offset = 0;
        }
        
        if(count) {
            l = Math.min((count * stride) + offset, a.length);
        } else {
            l = a.length;
        }

        for(i = offset; i < l; i += stride) {
            vec[0] = a[i]; vec[1] = a[i+1];
            fn(vec, vec, arg);
            a[i] = vec[0]; a[i+1] = vec[1];
        }
        
        return a;
    };
})();

/**
 * Returns a string representation of a vector
 *
 * @param {vec2} vec vector to represent as a string
 * @returns {String} string representation of the vector
 */
vec2.str = function (a) {
    return 'vec2(' + a[0] + ', ' + a[1] + ')';
};

if(typeof(exports) !== 'undefined') {
    exports.vec2 = vec2;
}
;
/* Copyright (c) 2013, Brandon Jones, Colin MacKenzie IV. All rights reserved.

Redistribution and use in source and binary forms, with or without modification,
are permitted provided that the following conditions are met:

  * Redistributions of source code must retain the above copyright notice, this
    list of conditions and the following disclaimer.
  * Redistributions in binary form must reproduce the above copyright notice,
    this list of conditions and the following disclaimer in the documentation 
    and/or other materials provided with the distribution.

THIS SOFTWARE IS PROVIDED BY THE COPYRIGHT HOLDERS AND CONTRIBUTORS "AS IS" AND
ANY EXPRESS OR IMPLIED WARRANTIES, INCLUDING, BUT NOT LIMITED TO, THE IMPLIED
WARRANTIES OF MERCHANTABILITY AND FITNESS FOR A PARTICULAR PURPOSE ARE 
DISCLAIMED. IN NO EVENT SHALL THE COPYRIGHT HOLDER OR CONTRIBUTORS BE LIABLE FOR
ANY DIRECT, INDIRECT, INCIDENTAL, SPECIAL, EXEMPLARY, OR CONSEQUENTIAL DAMAGES
(INCLUDING, BUT NOT LIMITED TO, PROCUREMENT OF SUBSTITUTE GOODS OR SERVICES;
LOSS OF USE, DATA, OR PROFITS; OR BUSINESS INTERRUPTION) HOWEVER CAUSED AND ON
ANY THEORY OF LIABILITY, WHETHER IN CONTRACT, STRICT LIABILITY, OR TORT
(INCLUDING NEGLIGENCE OR OTHERWISE) ARISING IN ANY WAY OUT OF THE USE OF THIS
SOFTWARE, EVEN IF ADVISED OF THE POSSIBILITY OF SUCH DAMAGE. */

/**
 * @class 3 Dimensional Vector
 * @name vec3
 */

var vec3 = {};

/**
 * Creates a new, empty vec3
 *
 * @returns {vec3} a new 3D vector
 */
vec3.create = function() {
    var out = new GLMAT_ARRAY_TYPE(3);
    out[0] = 0;
    out[1] = 0;
    out[2] = 0;
    return out;
};

/**
 * Creates a new vec3 initialized with values from an existing vector
 *
 * @param {vec3} a vector to clone
 * @returns {vec3} a new 3D vector
 */
vec3.clone = function(a) {
    var out = new GLMAT_ARRAY_TYPE(3);
    out[0] = a[0];
    out[1] = a[1];
    out[2] = a[2];
    return out;
};

/**
 * Creates a new vec3 initialized with the given values
 *
 * @param {Number} x X component
 * @param {Number} y Y component
 * @param {Number} z Z component
 * @returns {vec3} a new 3D vector
 */
vec3.fromValues = function(x, y, z) {
    var out = new GLMAT_ARRAY_TYPE(3);
    out[0] = x;
    out[1] = y;
    out[2] = z;
    return out;
};

/**
 * Copy the values from one vec3 to another
 *
 * @param {vec3} out the receiving vector
 * @param {vec3} a the source vector
 * @returns {vec3} out
 */
vec3.copy = function(out, a) {
    out[0] = a[0];
    out[1] = a[1];
    out[2] = a[2];
    return out;
};

/**
 * Set the components of a vec3 to the given values
 *
 * @param {vec3} out the receiving vector
 * @param {Number} x X component
 * @param {Number} y Y component
 * @param {Number} z Z component
 * @returns {vec3} out
 */
vec3.set = function(out, x, y, z) {
    out[0] = x;
    out[1] = y;
    out[2] = z;
    return out;
};

/**
 * Adds two vec3's
 *
 * @param {vec3} out the receiving vector
 * @param {vec3} a the first operand
 * @param {vec3} b the second operand
 * @returns {vec3} out
 */
vec3.add = function(out, a, b) {
    out[0] = a[0] + b[0];
    out[1] = a[1] + b[1];
    out[2] = a[2] + b[2];
    return out;
};

/**
 * Subtracts two vec3's
 *
 * @param {vec3} out the receiving vector
 * @param {vec3} a the first operand
 * @param {vec3} b the second operand
 * @returns {vec3} out
 */
vec3.subtract = function(out, a, b) {
    out[0] = a[0] - b[0];
    out[1] = a[1] - b[1];
    out[2] = a[2] - b[2];
    return out;
};

/**
 * Alias for {@link vec3.subtract}
 * @function
 */
vec3.sub = vec3.subtract;

/**
 * Multiplies two vec3's
 *
 * @param {vec3} out the receiving vector
 * @param {vec3} a the first operand
 * @param {vec3} b the second operand
 * @returns {vec3} out
 */
vec3.multiply = function(out, a, b) {
    out[0] = a[0] * b[0];
    out[1] = a[1] * b[1];
    out[2] = a[2] * b[2];
    return out;
};

/**
 * Alias for {@link vec3.multiply}
 * @function
 */
vec3.mul = vec3.multiply;

/**
 * Divides two vec3's
 *
 * @param {vec3} out the receiving vector
 * @param {vec3} a the first operand
 * @param {vec3} b the second operand
 * @returns {vec3} out
 */
vec3.divide = function(out, a, b) {
    out[0] = a[0] / b[0];
    out[1] = a[1] / b[1];
    out[2] = a[2] / b[2];
    return out;
};

/**
 * Alias for {@link vec3.divide}
 * @function
 */
vec3.div = vec3.divide;

/**
 * Returns the minimum of two vec3's
 *
 * @param {vec3} out the receiving vector
 * @param {vec3} a the first operand
 * @param {vec3} b the second operand
 * @returns {vec3} out
 */
vec3.min = function(out, a, b) {
    out[0] = Math.min(a[0], b[0]);
    out[1] = Math.min(a[1], b[1]);
    out[2] = Math.min(a[2], b[2]);
    return out;
};

/**
 * Returns the maximum of two vec3's
 *
 * @param {vec3} out the receiving vector
 * @param {vec3} a the first operand
 * @param {vec3} b the second operand
 * @returns {vec3} out
 */
vec3.max = function(out, a, b) {
    out[0] = Math.max(a[0], b[0]);
    out[1] = Math.max(a[1], b[1]);
    out[2] = Math.max(a[2], b[2]);
    return out;
};

/**
 * Scales a vec3 by a scalar number
 *
 * @param {vec3} out the receiving vector
 * @param {vec3} a the vector to scale
 * @param {Number} b amount to scale the vector by
 * @returns {vec3} out
 */
vec3.scale = function(out, a, b) {
    out[0] = a[0] * b;
    out[1] = a[1] * b;
    out[2] = a[2] * b;
    return out;
};

/**
 * Calculates the euclidian distance between two vec3's
 *
 * @param {vec3} a the first operand
 * @param {vec3} b the second operand
 * @returns {Number} distance between a and b
 */
vec3.distance = function(a, b) {
    var x = b[0] - a[0],
        y = b[1] - a[1],
        z = b[2] - a[2];
    return Math.sqrt(x*x + y*y + z*z);
};

/**
 * Alias for {@link vec3.distance}
 * @function
 */
vec3.dist = vec3.distance;

/**
 * Calculates the squared euclidian distance between two vec3's
 *
 * @param {vec3} a the first operand
 * @param {vec3} b the second operand
 * @returns {Number} squared distance between a and b
 */
vec3.squaredDistance = function(a, b) {
    var x = b[0] - a[0],
        y = b[1] - a[1],
        z = b[2] - a[2];
    return x*x + y*y + z*z;
};

/**
 * Alias for {@link vec3.squaredDistance}
 * @function
 */
vec3.sqrDist = vec3.squaredDistance;

/**
 * Calculates the length of a vec3
 *
 * @param {vec3} a vector to calculate length of
 * @returns {Number} length of a
 */
vec3.length = function (a) {
    var x = a[0],
        y = a[1],
        z = a[2];
    return Math.sqrt(x*x + y*y + z*z);
};

/**
 * Alias for {@link vec3.length}
 * @function
 */
vec3.len = vec3.length;

/**
 * Calculates the squared length of a vec3
 *
 * @param {vec3} a vector to calculate squared length of
 * @returns {Number} squared length of a
 */
vec3.squaredLength = function (a) {
    var x = a[0],
        y = a[1],
        z = a[2];
    return x*x + y*y + z*z;
};

/**
 * Alias for {@link vec3.squaredLength}
 * @function
 */
vec3.sqrLen = vec3.squaredLength;

/**
 * Negates the components of a vec3
 *
 * @param {vec3} out the receiving vector
 * @param {vec3} a vector to negate
 * @returns {vec3} out
 */
vec3.negate = function(out, a) {
    out[0] = -a[0];
    out[1] = -a[1];
    out[2] = -a[2];
    return out;
};

/**
 * Normalize a vec3
 *
 * @param {vec3} out the receiving vector
 * @param {vec3} a vector to normalize
 * @returns {vec3} out
 */
vec3.normalize = function(out, a) {
    var x = a[0],
        y = a[1],
        z = a[2];
    var len = x*x + y*y + z*z;
    if (len > 0) {
        //TODO: evaluate use of glm_invsqrt here?
        len = 1 / Math.sqrt(len);
        out[0] = a[0] * len;
        out[1] = a[1] * len;
        out[2] = a[2] * len;
    }
    return out;
};

/**
 * Calculates the dot product of two vec3's
 *
 * @param {vec3} a the first operand
 * @param {vec3} b the second operand
 * @returns {Number} dot product of a and b
 */
vec3.dot = function (a, b) {
    return a[0] * b[0] + a[1] * b[1] + a[2] * b[2];
};

/**
 * Computes the cross product of two vec3's
 *
 * @param {vec3} out the receiving vector
 * @param {vec3} a the first operand
 * @param {vec3} b the second operand
 * @returns {vec3} out
 */
vec3.cross = function(out, a, b) {
    var ax = a[0], ay = a[1], az = a[2],
        bx = b[0], by = b[1], bz = b[2];

    out[0] = ay * bz - az * by;
    out[1] = az * bx - ax * bz;
    out[2] = ax * by - ay * bx;
    return out;
};

/**
 * Performs a linear interpolation between two vec3's
 *
 * @param {vec3} out the receiving vector
 * @param {vec3} a the first operand
 * @param {vec3} b the second operand
 * @param {Number} t interpolation amount between the two inputs
 * @returns {vec3} out
 */
vec3.lerp = function (out, a, b, t) {
    var ax = a[0],
        ay = a[1],
        az = a[2];
    out[0] = ax + t * (b[0] - ax);
    out[1] = ay + t * (b[1] - ay);
    out[2] = az + t * (b[2] - az);
    return out;
};

/**
 * Transforms the vec3 with a mat4.
 * 4th vector component is implicitly '1'
 *
 * @param {vec3} out the receiving vector
 * @param {vec3} a the vector to transform
 * @param {mat4} m matrix to transform with
 * @returns {vec3} out
 */
vec3.transformMat4 = function(out, a, m) {
    var x = a[0], y = a[1], z = a[2];
    out[0] = m[0] * x + m[4] * y + m[8] * z + m[12];
    out[1] = m[1] * x + m[5] * y + m[9] * z + m[13];
    out[2] = m[2] * x + m[6] * y + m[10] * z + m[14];
    return out;
};

/**
 * Transforms the vec3 with a quat
 *
 * @param {vec3} out the receiving vector
 * @param {vec3} a the vector to transform
 * @param {quat} q quaternion to transform with
 * @returns {vec3} out
 */
vec3.transformQuat = function(out, a, q) {
    var x = a[0], y = a[1], z = a[2],
        qx = q[0], qy = q[1], qz = q[2], qw = q[3],

        // calculate quat * vec
        ix = qw * x + qy * z - qz * y,
        iy = qw * y + qz * x - qx * z,
        iz = qw * z + qx * y - qy * x,
        iw = -qx * x - qy * y - qz * z;

    // calculate result * inverse quat
    out[0] = ix * qw + iw * -qx + iy * -qz - iz * -qy;
    out[1] = iy * qw + iw * -qy + iz * -qx - ix * -qz;
    out[2] = iz * qw + iw * -qz + ix * -qy - iy * -qx;
    return out;
};

/**
 * Perform some operation over an array of vec3s.
 *
 * @param {Array} a the array of vectors to iterate over
 * @param {Number} stride Number of elements between the start of each vec3. If 0 assumes tightly packed
 * @param {Number} offset Number of elements to skip at the beginning of the array
 * @param {Number} count Number of vec3s to iterate over. If 0 iterates over entire array
 * @param {Function} fn Function to call for each vector in the array
 * @param {Object} [arg] additional argument to pass to fn
 * @returns {Array} a
 * @function
 */
vec3.forEach = (function() {
    var vec = vec3.create();

    return function(a, stride, offset, count, fn, arg) {
        var i, l;
        if(!stride) {
            stride = 3;
        }

        if(!offset) {
            offset = 0;
        }
        
        if(count) {
            l = Math.min((count * stride) + offset, a.length);
        } else {
            l = a.length;
        }

        for(i = offset; i < l; i += stride) {
            vec[0] = a[i]; vec[1] = a[i+1]; vec[2] = a[i+2];
            fn(vec, vec, arg);
            a[i] = vec[0]; a[i+1] = vec[1]; a[i+2] = vec[2];
        }
        
        return a;
    };
})();

/**
 * Returns a string representation of a vector
 *
 * @param {vec3} vec vector to represent as a string
 * @returns {String} string representation of the vector
 */
vec3.str = function (a) {
    return 'vec3(' + a[0] + ', ' + a[1] + ', ' + a[2] + ')';
};

if(typeof(exports) !== 'undefined') {
    exports.vec3 = vec3;
}
;
/* Copyright (c) 2013, Brandon Jones, Colin MacKenzie IV. All rights reserved.

Redistribution and use in source and binary forms, with or without modification,
are permitted provided that the following conditions are met:

  * Redistributions of source code must retain the above copyright notice, this
    list of conditions and the following disclaimer.
  * Redistributions in binary form must reproduce the above copyright notice,
    this list of conditions and the following disclaimer in the documentation 
    and/or other materials provided with the distribution.

THIS SOFTWARE IS PROVIDED BY THE COPYRIGHT HOLDERS AND CONTRIBUTORS "AS IS" AND
ANY EXPRESS OR IMPLIED WARRANTIES, INCLUDING, BUT NOT LIMITED TO, THE IMPLIED
WARRANTIES OF MERCHANTABILITY AND FITNESS FOR A PARTICULAR PURPOSE ARE 
DISCLAIMED. IN NO EVENT SHALL THE COPYRIGHT HOLDER OR CONTRIBUTORS BE LIABLE FOR
ANY DIRECT, INDIRECT, INCIDENTAL, SPECIAL, EXEMPLARY, OR CONSEQUENTIAL DAMAGES
(INCLUDING, BUT NOT LIMITED TO, PROCUREMENT OF SUBSTITUTE GOODS OR SERVICES;
LOSS OF USE, DATA, OR PROFITS; OR BUSINESS INTERRUPTION) HOWEVER CAUSED AND ON
ANY THEORY OF LIABILITY, WHETHER IN CONTRACT, STRICT LIABILITY, OR TORT
(INCLUDING NEGLIGENCE OR OTHERWISE) ARISING IN ANY WAY OUT OF THE USE OF THIS
SOFTWARE, EVEN IF ADVISED OF THE POSSIBILITY OF SUCH DAMAGE. */

/**
 * @class 4 Dimensional Vector
 * @name vec4
 */

var vec4 = {};

/**
 * Creates a new, empty vec4
 *
 * @returns {vec4} a new 4D vector
 */
vec4.create = function() {
    var out = new GLMAT_ARRAY_TYPE(4);
    out[0] = 0;
    out[1] = 0;
    out[2] = 0;
    out[3] = 0;
    return out;
};

/**
 * Creates a new vec4 initialized with values from an existing vector
 *
 * @param {vec4} a vector to clone
 * @returns {vec4} a new 4D vector
 */
vec4.clone = function(a) {
    var out = new GLMAT_ARRAY_TYPE(4);
    out[0] = a[0];
    out[1] = a[1];
    out[2] = a[2];
    out[3] = a[3];
    return out;
};

/**
 * Creates a new vec4 initialized with the given values
 *
 * @param {Number} x X component
 * @param {Number} y Y component
 * @param {Number} z Z component
 * @param {Number} w W component
 * @returns {vec4} a new 4D vector
 */
vec4.fromValues = function(x, y, z, w) {
    var out = new GLMAT_ARRAY_TYPE(4);
    out[0] = x;
    out[1] = y;
    out[2] = z;
    out[3] = w;
    return out;
};

/**
 * Copy the values from one vec4 to another
 *
 * @param {vec4} out the receiving vector
 * @param {vec4} a the source vector
 * @returns {vec4} out
 */
vec4.copy = function(out, a) {
    out[0] = a[0];
    out[1] = a[1];
    out[2] = a[2];
    out[3] = a[3];
    return out;
};

/**
 * Set the components of a vec4 to the given values
 *
 * @param {vec4} out the receiving vector
 * @param {Number} x X component
 * @param {Number} y Y component
 * @param {Number} z Z component
 * @param {Number} w W component
 * @returns {vec4} out
 */
vec4.set = function(out, x, y, z, w) {
    out[0] = x;
    out[1] = y;
    out[2] = z;
    out[3] = w;
    return out;
};

/**
 * Adds two vec4's
 *
 * @param {vec4} out the receiving vector
 * @param {vec4} a the first operand
 * @param {vec4} b the second operand
 * @returns {vec4} out
 */
vec4.add = function(out, a, b) {
    out[0] = a[0] + b[0];
    out[1] = a[1] + b[1];
    out[2] = a[2] + b[2];
    out[3] = a[3] + b[3];
    return out;
};

/**
 * Subtracts two vec4's
 *
 * @param {vec4} out the receiving vector
 * @param {vec4} a the first operand
 * @param {vec4} b the second operand
 * @returns {vec4} out
 */
vec4.subtract = function(out, a, b) {
    out[0] = a[0] - b[0];
    out[1] = a[1] - b[1];
    out[2] = a[2] - b[2];
    out[3] = a[3] - b[3];
    return out;
};

/**
 * Alias for {@link vec4.subtract}
 * @function
 */
vec4.sub = vec4.subtract;

/**
 * Multiplies two vec4's
 *
 * @param {vec4} out the receiving vector
 * @param {vec4} a the first operand
 * @param {vec4} b the second operand
 * @returns {vec4} out
 */
vec4.multiply = function(out, a, b) {
    out[0] = a[0] * b[0];
    out[1] = a[1] * b[1];
    out[2] = a[2] * b[2];
    out[3] = a[3] * b[3];
    return out;
};

/**
 * Alias for {@link vec4.multiply}
 * @function
 */
vec4.mul = vec4.multiply;

/**
 * Divides two vec4's
 *
 * @param {vec4} out the receiving vector
 * @param {vec4} a the first operand
 * @param {vec4} b the second operand
 * @returns {vec4} out
 */
vec4.divide = function(out, a, b) {
    out[0] = a[0] / b[0];
    out[1] = a[1] / b[1];
    out[2] = a[2] / b[2];
    out[3] = a[3] / b[3];
    return out;
};

/**
 * Alias for {@link vec4.divide}
 * @function
 */
vec4.div = vec4.divide;

/**
 * Returns the minimum of two vec4's
 *
 * @param {vec4} out the receiving vector
 * @param {vec4} a the first operand
 * @param {vec4} b the second operand
 * @returns {vec4} out
 */
vec4.min = function(out, a, b) {
    out[0] = Math.min(a[0], b[0]);
    out[1] = Math.min(a[1], b[1]);
    out[2] = Math.min(a[2], b[2]);
    out[3] = Math.min(a[3], b[3]);
    return out;
};

/**
 * Returns the maximum of two vec4's
 *
 * @param {vec4} out the receiving vector
 * @param {vec4} a the first operand
 * @param {vec4} b the second operand
 * @returns {vec4} out
 */
vec4.max = function(out, a, b) {
    out[0] = Math.max(a[0], b[0]);
    out[1] = Math.max(a[1], b[1]);
    out[2] = Math.max(a[2], b[2]);
    out[3] = Math.max(a[3], b[3]);
    return out;
};

/**
 * Scales a vec4 by a scalar number
 *
 * @param {vec4} out the receiving vector
 * @param {vec4} a the vector to scale
 * @param {Number} b amount to scale the vector by
 * @returns {vec4} out
 */
vec4.scale = function(out, a, b) {
    out[0] = a[0] * b;
    out[1] = a[1] * b;
    out[2] = a[2] * b;
    out[3] = a[3] * b;
    return out;
};

/**
 * Calculates the euclidian distance between two vec4's
 *
 * @param {vec4} a the first operand
 * @param {vec4} b the second operand
 * @returns {Number} distance between a and b
 */
vec4.distance = function(a, b) {
    var x = b[0] - a[0],
        y = b[1] - a[1],
        z = b[2] - a[2],
        w = b[3] - a[3];
    return Math.sqrt(x*x + y*y + z*z + w*w);
};

/**
 * Alias for {@link vec4.distance}
 * @function
 */
vec4.dist = vec4.distance;

/**
 * Calculates the squared euclidian distance between two vec4's
 *
 * @param {vec4} a the first operand
 * @param {vec4} b the second operand
 * @returns {Number} squared distance between a and b
 */
vec4.squaredDistance = function(a, b) {
    var x = b[0] - a[0],
        y = b[1] - a[1],
        z = b[2] - a[2],
        w = b[3] - a[3];
    return x*x + y*y + z*z + w*w;
};

/**
 * Alias for {@link vec4.squaredDistance}
 * @function
 */
vec4.sqrDist = vec4.squaredDistance;

/**
 * Calculates the length of a vec4
 *
 * @param {vec4} a vector to calculate length of
 * @returns {Number} length of a
 */
vec4.length = function (a) {
    var x = a[0],
        y = a[1],
        z = a[2],
        w = a[3];
    return Math.sqrt(x*x + y*y + z*z + w*w);
};

/**
 * Alias for {@link vec4.length}
 * @function
 */
vec4.len = vec4.length;

/**
 * Calculates the squared length of a vec4
 *
 * @param {vec4} a vector to calculate squared length of
 * @returns {Number} squared length of a
 */
vec4.squaredLength = function (a) {
    var x = a[0],
        y = a[1],
        z = a[2],
        w = a[3];
    return x*x + y*y + z*z + w*w;
};

/**
 * Alias for {@link vec4.squaredLength}
 * @function
 */
vec4.sqrLen = vec4.squaredLength;

/**
 * Negates the components of a vec4
 *
 * @param {vec4} out the receiving vector
 * @param {vec4} a vector to negate
 * @returns {vec4} out
 */
vec4.negate = function(out, a) {
    out[0] = -a[0];
    out[1] = -a[1];
    out[2] = -a[2];
    out[3] = -a[3];
    return out;
};

/**
 * Normalize a vec4
 *
 * @param {vec4} out the receiving vector
 * @param {vec4} a vector to normalize
 * @returns {vec4} out
 */
vec4.normalize = function(out, a) {
    var x = a[0],
        y = a[1],
        z = a[2],
        w = a[3];
    var len = x*x + y*y + z*z + w*w;
    if (len > 0) {
        len = 1 / Math.sqrt(len);
        out[0] = a[0] * len;
        out[1] = a[1] * len;
        out[2] = a[2] * len;
        out[3] = a[3] * len;
    }
    return out;
};

/**
 * Calculates the dot product of two vec4's
 *
 * @param {vec4} a the first operand
 * @param {vec4} b the second operand
 * @returns {Number} dot product of a and b
 */
vec4.dot = function (a, b) {
    return a[0] * b[0] + a[1] * b[1] + a[2] * b[2] + a[3] * b[3];
};

/**
 * Performs a linear interpolation between two vec4's
 *
 * @param {vec4} out the receiving vector
 * @param {vec4} a the first operand
 * @param {vec4} b the second operand
 * @param {Number} t interpolation amount between the two inputs
 * @returns {vec4} out
 */
vec4.lerp = function (out, a, b, t) {
    var ax = a[0],
        ay = a[1],
        az = a[2],
        aw = a[3];
    out[0] = ax + t * (b[0] - ax);
    out[1] = ay + t * (b[1] - ay);
    out[2] = az + t * (b[2] - az);
    out[3] = aw + t * (b[3] - aw);
    return out;
};

/**
 * Transforms the vec4 with a mat4.
 *
 * @param {vec4} out the receiving vector
 * @param {vec4} a the vector to transform
 * @param {mat4} m matrix to transform with
 * @returns {vec4} out
 */
vec4.transformMat4 = function(out, a, m) {
    var x = a[0], y = a[1], z = a[2], w = a[3];
    out[0] = m[0] * x + m[4] * y + m[8] * z + m[12] * w;
    out[1] = m[1] * x + m[5] * y + m[9] * z + m[13] * w;
    out[2] = m[2] * x + m[6] * y + m[10] * z + m[14] * w;
    out[3] = m[3] * x + m[7] * y + m[11] * z + m[15] * w;
    return out;
};

/**
 * Transforms the vec4 with a quat
 *
 * @param {vec4} out the receiving vector
 * @param {vec4} a the vector to transform
 * @param {quat} q quaternion to transform with
 * @returns {vec4} out
 */
vec4.transformQuat = function(out, a, q) {
    var x = a[0], y = a[1], z = a[2],
        qx = q[0], qy = q[1], qz = q[2], qw = q[3],

        // calculate quat * vec
        ix = qw * x + qy * z - qz * y,
        iy = qw * y + qz * x - qx * z,
        iz = qw * z + qx * y - qy * x,
        iw = -qx * x - qy * y - qz * z;

    // calculate result * inverse quat
    out[0] = ix * qw + iw * -qx + iy * -qz - iz * -qy;
    out[1] = iy * qw + iw * -qy + iz * -qx - ix * -qz;
    out[2] = iz * qw + iw * -qz + ix * -qy - iy * -qx;
    return out;
};

/**
 * Perform some operation over an array of vec4s.
 *
 * @param {Array} a the array of vectors to iterate over
 * @param {Number} stride Number of elements between the start of each vec4. If 0 assumes tightly packed
 * @param {Number} offset Number of elements to skip at the beginning of the array
 * @param {Number} count Number of vec2s to iterate over. If 0 iterates over entire array
 * @param {Function} fn Function to call for each vector in the array
 * @param {Object} [arg] additional argument to pass to fn
 * @returns {Array} a
 * @function
 */
vec4.forEach = (function() {
    var vec = vec4.create();

    return function(a, stride, offset, count, fn, arg) {
        var i, l;
        if(!stride) {
            stride = 4;
        }

        if(!offset) {
            offset = 0;
        }
        
        if(count) {
            l = Math.min((count * stride) + offset, a.length);
        } else {
            l = a.length;
        }

        for(i = offset; i < l; i += stride) {
            vec[0] = a[i]; vec[1] = a[i+1]; vec[2] = a[i+2]; vec[3] = a[i+3];
            fn(vec, vec, arg);
            a[i] = vec[0]; a[i+1] = vec[1]; a[i+2] = vec[2]; a[i+3] = vec[3];
        }
        
        return a;
    };
})();

/**
 * Returns a string representation of a vector
 *
 * @param {vec4} vec vector to represent as a string
 * @returns {String} string representation of the vector
 */
vec4.str = function (a) {
    return 'vec4(' + a[0] + ', ' + a[1] + ', ' + a[2] + ', ' + a[3] + ')';
};

if(typeof(exports) !== 'undefined') {
    exports.vec4 = vec4;
}
;
/* Copyright (c) 2013, Brandon Jones, Colin MacKenzie IV. All rights reserved.

Redistribution and use in source and binary forms, with or without modification,
are permitted provided that the following conditions are met:

  * Redistributions of source code must retain the above copyright notice, this
    list of conditions and the following disclaimer.
  * Redistributions in binary form must reproduce the above copyright notice,
    this list of conditions and the following disclaimer in the documentation 
    and/or other materials provided with the distribution.

THIS SOFTWARE IS PROVIDED BY THE COPYRIGHT HOLDERS AND CONTRIBUTORS "AS IS" AND
ANY EXPRESS OR IMPLIED WARRANTIES, INCLUDING, BUT NOT LIMITED TO, THE IMPLIED
WARRANTIES OF MERCHANTABILITY AND FITNESS FOR A PARTICULAR PURPOSE ARE 
DISCLAIMED. IN NO EVENT SHALL THE COPYRIGHT HOLDER OR CONTRIBUTORS BE LIABLE FOR
ANY DIRECT, INDIRECT, INCIDENTAL, SPECIAL, EXEMPLARY, OR CONSEQUENTIAL DAMAGES
(INCLUDING, BUT NOT LIMITED TO, PROCUREMENT OF SUBSTITUTE GOODS OR SERVICES;
LOSS OF USE, DATA, OR PROFITS; OR BUSINESS INTERRUPTION) HOWEVER CAUSED AND ON
ANY THEORY OF LIABILITY, WHETHER IN CONTRACT, STRICT LIABILITY, OR TORT
(INCLUDING NEGLIGENCE OR OTHERWISE) ARISING IN ANY WAY OUT OF THE USE OF THIS
SOFTWARE, EVEN IF ADVISED OF THE POSSIBILITY OF SUCH DAMAGE. */

/**
 * @class 2x2 Matrix
 * @name mat2
 */

var mat2 = {};

var mat2Identity = new Float32Array([
    1, 0,
    0, 1
]);

/**
 * Creates a new identity mat2
 *
 * @returns {mat2} a new 2x2 matrix
 */
mat2.create = function() {
    var out = new GLMAT_ARRAY_TYPE(4);
    out[0] = 1;
    out[1] = 0;
    out[2] = 0;
    out[3] = 1;
    return out;
};

/**
 * Creates a new mat2 initialized with values from an existing matrix
 *
 * @param {mat2} a matrix to clone
 * @returns {mat2} a new 2x2 matrix
 */
mat2.clone = function(a) {
    var out = new GLMAT_ARRAY_TYPE(4);
    out[0] = a[0];
    out[1] = a[1];
    out[2] = a[2];
    out[3] = a[3];
    return out;
};

/**
 * Copy the values from one mat2 to another
 *
 * @param {mat2} out the receiving matrix
 * @param {mat2} a the source matrix
 * @returns {mat2} out
 */
mat2.copy = function(out, a) {
    out[0] = a[0];
    out[1] = a[1];
    out[2] = a[2];
    out[3] = a[3];
    return out;
};

/**
 * Set a mat2 to the identity matrix
 *
 * @param {mat2} out the receiving matrix
 * @returns {mat2} out
 */
mat2.identity = function(out) {
    out[0] = 1;
    out[1] = 0;
    out[2] = 0;
    out[3] = 1;
    return out;
};

/**
 * Transpose the values of a mat2
 *
 * @param {mat2} out the receiving matrix
 * @param {mat2} a the source matrix
 * @returns {mat2} out
 */
mat2.transpose = function(out, a) {
    // If we are transposing ourselves we can skip a few steps but have to cache some values
    if (out === a) {
        var a1 = a[1];
        out[1] = a[2];
        out[2] = a1;
    } else {
        out[0] = a[0];
        out[1] = a[2];
        out[2] = a[1];
        out[3] = a[3];
    }
    
    return out;
};

/**
 * Inverts a mat2
 *
 * @param {mat2} out the receiving matrix
 * @param {mat2} a the source matrix
 * @returns {mat2} out
 */
mat2.invert = function(out, a) {
    var a0 = a[0], a1 = a[1], a2 = a[2], a3 = a[3],

        // Calculate the determinant
        det = a0 * a3 - a2 * a1;

    if (!det) {
        return null;
    }
    det = 1.0 / det;
    
    out[0] =  a3 * det;
    out[1] = -a1 * det;
    out[2] = -a2 * det;
    out[3] =  a0 * det;

    return out;
};

/**
 * Calculates the adjugate of a mat2
 *
 * @param {mat2} out the receiving matrix
 * @param {mat2} a the source matrix
 * @returns {mat2} out
 */
mat2.adjoint = function(out, a) {
    // Caching this value is nessecary if out == a
    var a0 = a[0];
    out[0] =  a[3];
    out[1] = -a[1];
    out[2] = -a[2];
    out[3] =  a0;

    return out;
};

/**
 * Calculates the determinant of a mat2
 *
 * @param {mat2} a the source matrix
 * @returns {Number} determinant of a
 */
mat2.determinant = function (a) {
    return a[0] * a[3] - a[2] * a[1];
};

/**
 * Multiplies two mat2's
 *
 * @param {mat2} out the receiving matrix
 * @param {mat2} a the first operand
 * @param {mat2} b the second operand
 * @returns {mat2} out
 */
mat2.multiply = function (out, a, b) {
    var a0 = a[0], a1 = a[1], a2 = a[2], a3 = a[3];
    var b0 = b[0], b1 = b[1], b2 = b[2], b3 = b[3];
    out[0] = a0 * b0 + a1 * b2;
    out[1] = a0 * b1 + a1 * b3;
    out[2] = a2 * b0 + a3 * b2;
    out[3] = a2 * b1 + a3 * b3;
    return out;
};

/**
 * Alias for {@link mat2.multiply}
 * @function
 */
mat2.mul = mat2.multiply;

/**
 * Rotates a mat2 by the given angle
 *
 * @param {mat2} out the receiving matrix
 * @param {mat2} a the matrix to rotate
 * @param {Number} rad the angle to rotate the matrix by
 * @returns {mat2} out
 */
mat2.rotate = function (out, a, rad) {
    var a0 = a[0], a1 = a[1], a2 = a[2], a3 = a[3],
        s = Math.sin(rad),
        c = Math.cos(rad);
    out[0] = a0 *  c + a1 * s;
    out[1] = a0 * -s + a1 * c;
    out[2] = a2 *  c + a3 * s;
    out[3] = a2 * -s + a3 * c;
    return out;
};

/**
 * Scales the mat2 by the dimensions in the given vec2
 *
 * @param {mat2} out the receiving matrix
 * @param {mat2} a the matrix to rotate
 * @param {vec2} v the vec2 to scale the matrix by
 * @returns {mat2} out
 **/
mat2.scale = function(out, a, v) {
    var a0 = a[0], a1 = a[1], a2 = a[2], a3 = a[3],
        v0 = v[0], v1 = v[1];
    out[0] = a0 * v0;
    out[1] = a1 * v1;
    out[2] = a2 * v0;
    out[3] = a3 * v1;
    return out;
};

/**
 * Returns a string representation of a mat2
 *
 * @param {mat2} mat matrix to represent as a string
 * @returns {String} string representation of the matrix
 */
mat2.str = function (a) {
    return 'mat2(' + a[0] + ', ' + a[1] + ', ' + a[2] + ', ' + a[3] + ')';
};

if(typeof(exports) !== 'undefined') {
    exports.mat2 = mat2;
}
;
/* Copyright (c) 2013, Brandon Jones, Colin MacKenzie IV. All rights reserved.

Redistribution and use in source and binary forms, with or without modification,
are permitted provided that the following conditions are met:

  * Redistributions of source code must retain the above copyright notice, this
    list of conditions and the following disclaimer.
  * Redistributions in binary form must reproduce the above copyright notice,
    this list of conditions and the following disclaimer in the documentation 
    and/or other materials provided with the distribution.

THIS SOFTWARE IS PROVIDED BY THE COPYRIGHT HOLDERS AND CONTRIBUTORS "AS IS" AND
ANY EXPRESS OR IMPLIED WARRANTIES, INCLUDING, BUT NOT LIMITED TO, THE IMPLIED
WARRANTIES OF MERCHANTABILITY AND FITNESS FOR A PARTICULAR PURPOSE ARE 
DISCLAIMED. IN NO EVENT SHALL THE COPYRIGHT HOLDER OR CONTRIBUTORS BE LIABLE FOR
ANY DIRECT, INDIRECT, INCIDENTAL, SPECIAL, EXEMPLARY, OR CONSEQUENTIAL DAMAGES
(INCLUDING, BUT NOT LIMITED TO, PROCUREMENT OF SUBSTITUTE GOODS OR SERVICES;
LOSS OF USE, DATA, OR PROFITS; OR BUSINESS INTERRUPTION) HOWEVER CAUSED AND ON
ANY THEORY OF LIABILITY, WHETHER IN CONTRACT, STRICT LIABILITY, OR TORT
(INCLUDING NEGLIGENCE OR OTHERWISE) ARISING IN ANY WAY OUT OF THE USE OF THIS
SOFTWARE, EVEN IF ADVISED OF THE POSSIBILITY OF SUCH DAMAGE. */

/**
 * @class 2x3 Matrix
 * @name mat2d
 * 
 * @description 
 * A mat2d contains six elements defined as:
 * <pre>
 * [a, b,
 *  c, d,
 *  tx,ty]
 * </pre>
 * This is a short form for the 3x3 matrix:
 * <pre>
 * [a, b, 0
 *  c, d, 0
 *  tx,ty,1]
 * </pre>
 * The last column is ignored so the array is shorter and operations are faster.
 */

var mat2d = {};

var mat2dIdentity = new Float32Array([
    1, 0,
    0, 1,
    0, 0
]);

/**
 * Creates a new identity mat2d
 *
 * @returns {mat2d} a new 2x3 matrix
 */
mat2d.create = function() {
    var out = new GLMAT_ARRAY_TYPE(6);
    out[0] = 1;
    out[1] = 0;
    out[2] = 0;
    out[3] = 1;
    out[4] = 0;
    out[5] = 0;
    return out;
};

/**
 * Creates a new mat2d initialized with values from an existing matrix
 *
 * @param {mat2d} a matrix to clone
 * @returns {mat2d} a new 2x3 matrix
 */
mat2d.clone = function(a) {
    var out = new GLMAT_ARRAY_TYPE(6);
    out[0] = a[0];
    out[1] = a[1];
    out[2] = a[2];
    out[3] = a[3];
    out[4] = a[4];
    out[5] = a[5];
    return out;
};

/**
 * Copy the values from one mat2d to another
 *
 * @param {mat2d} out the receiving matrix
 * @param {mat2d} a the source matrix
 * @returns {mat2d} out
 */
mat2d.copy = function(out, a) {
    out[0] = a[0];
    out[1] = a[1];
    out[2] = a[2];
    out[3] = a[3];
    out[4] = a[4];
    out[5] = a[5];
    return out;
};

/**
 * Set a mat2d to the identity matrix
 *
 * @param {mat2d} out the receiving matrix
 * @returns {mat2d} out
 */
mat2d.identity = function(out) {
    out[0] = 1;
    out[1] = 0;
    out[2] = 0;
    out[3] = 1;
    out[4] = 0;
    out[5] = 0;
    return out;
};

/**
 * Inverts a mat2d
 *
 * @param {mat2d} out the receiving matrix
 * @param {mat2d} a the source matrix
 * @returns {mat2d} out
 */
mat2d.invert = function(out, a) {
    var aa = a[0], ab = a[1], ac = a[2], ad = a[3],
        atx = a[4], aty = a[5];

    var det = aa * ad - ab * ac;
    if(!det){
        return null;
    }
    det = 1.0 / det;

    out[0] = ad * det;
    out[1] = -ab * det;
    out[2] = -ac * det;
    out[3] = aa * det;
    out[4] = (ac * aty - ad * atx) * det;
    out[5] = (ab * atx - aa * aty) * det;
    return out;
};

/**
 * Calculates the determinant of a mat2d
 *
 * @param {mat2d} a the source matrix
 * @returns {Number} determinant of a
 */
mat2d.determinant = function (a) {
    return a[0] * a[3] - a[1] * a[2];
};

/**
 * Multiplies two mat2d's
 *
 * @param {mat2d} out the receiving matrix
 * @param {mat2d} a the first operand
 * @param {mat2d} b the second operand
 * @returns {mat2d} out
 */
mat2d.multiply = function (out, a, b) {
    var aa = a[0], ab = a[1], ac = a[2], ad = a[3],
        atx = a[4], aty = a[5],
        ba = b[0], bb = b[1], bc = b[2], bd = b[3],
        btx = b[4], bty = b[5];

    out[0] = aa*ba + ab*bc;
    out[1] = aa*bb + ab*bd;
    out[2] = ac*ba + ad*bc;
    out[3] = ac*bb + ad*bd;
    out[4] = ba*atx + bc*aty + btx;
    out[5] = bb*atx + bd*aty + bty;
    return out;
};

/**
 * Alias for {@link mat2d.multiply}
 * @function
 */
mat2d.mul = mat2d.multiply;


/**
 * Rotates a mat2d by the given angle
 *
 * @param {mat2d} out the receiving matrix
 * @param {mat2d} a the matrix to rotate
 * @param {Number} rad the angle to rotate the matrix by
 * @returns {mat2d} out
 */
mat2d.rotate = function (out, a, rad) {
    var aa = a[0],
        ab = a[1],
        ac = a[2],
        ad = a[3],
        atx = a[4],
        aty = a[5],
        st = Math.sin(rad),
        ct = Math.cos(rad);

    out[0] = aa*ct + ab*st;
    out[1] = -aa*st + ab*ct;
    out[2] = ac*ct + ad*st;
    out[3] = -ac*st + ct*ad;
    out[4] = ct*atx + st*aty;
    out[5] = ct*aty - st*atx;
    return out;
};

/**
 * Scales the mat2d by the dimensions in the given vec2
 *
 * @param {mat2d} out the receiving matrix
 * @param {mat2d} a the matrix to translate
 * @param {mat2d} v the vec2 to scale the matrix by
 * @returns {mat2d} out
 **/
mat2d.scale = function(out, a, v) {
    var vx = v[0], vy = v[1];
    out[0] = a[0] * vx;
    out[1] = a[1] * vy;
    out[2] = a[2] * vx;
    out[3] = a[3] * vy;
    out[4] = a[4] * vx;
    out[5] = a[5] * vy;
    return out;
};

/**
 * Translates the mat2d by the dimensions in the given vec2
 *
 * @param {mat2d} out the receiving matrix
 * @param {mat2d} a the matrix to translate
 * @param {mat2d} v the vec2 to translate the matrix by
 * @returns {mat2d} out
 **/
mat2d.translate = function(out, a, v) {
    out[0] = a[0];
    out[1] = a[1];
    out[2] = a[2];
    out[3] = a[3];
    out[4] = a[4] + v[0];
    out[5] = a[5] + v[1];
    return out;
};

/**
 * Returns a string representation of a mat2d
 *
 * @param {mat2d} a matrix to represent as a string
 * @returns {String} string representation of the matrix
 */
mat2d.str = function (a) {
    return 'mat2d(' + a[0] + ', ' + a[1] + ', ' + a[2] + ', ' + 
                    a[3] + ', ' + a[4] + ', ' + a[5] + ')';
};

if(typeof(exports) !== 'undefined') {
    exports.mat2d = mat2d;
}
;
/* Copyright (c) 2013, Brandon Jones, Colin MacKenzie IV. All rights reserved.

Redistribution and use in source and binary forms, with or without modification,
are permitted provided that the following conditions are met:

  * Redistributions of source code must retain the above copyright notice, this
    list of conditions and the following disclaimer.
  * Redistributions in binary form must reproduce the above copyright notice,
    this list of conditions and the following disclaimer in the documentation 
    and/or other materials provided with the distribution.

THIS SOFTWARE IS PROVIDED BY THE COPYRIGHT HOLDERS AND CONTRIBUTORS "AS IS" AND
ANY EXPRESS OR IMPLIED WARRANTIES, INCLUDING, BUT NOT LIMITED TO, THE IMPLIED
WARRANTIES OF MERCHANTABILITY AND FITNESS FOR A PARTICULAR PURPOSE ARE 
DISCLAIMED. IN NO EVENT SHALL THE COPYRIGHT HOLDER OR CONTRIBUTORS BE LIABLE FOR
ANY DIRECT, INDIRECT, INCIDENTAL, SPECIAL, EXEMPLARY, OR CONSEQUENTIAL DAMAGES
(INCLUDING, BUT NOT LIMITED TO, PROCUREMENT OF SUBSTITUTE GOODS OR SERVICES;
LOSS OF USE, DATA, OR PROFITS; OR BUSINESS INTERRUPTION) HOWEVER CAUSED AND ON
ANY THEORY OF LIABILITY, WHETHER IN CONTRACT, STRICT LIABILITY, OR TORT
(INCLUDING NEGLIGENCE OR OTHERWISE) ARISING IN ANY WAY OUT OF THE USE OF THIS
SOFTWARE, EVEN IF ADVISED OF THE POSSIBILITY OF SUCH DAMAGE. */

/**
 * @class 3x3 Matrix
 * @name mat3
 */

var mat3 = {};

var mat3Identity = new Float32Array([
    1, 0, 0,
    0, 1, 0,
    0, 0, 1
]);

/**
 * Creates a new identity mat3
 *
 * @returns {mat3} a new 3x3 matrix
 */
mat3.create = function() {
    var out = new GLMAT_ARRAY_TYPE(9);
    out[0] = 1;
    out[1] = 0;
    out[2] = 0;
    out[3] = 0;
    out[4] = 1;
    out[5] = 0;
    out[6] = 0;
    out[7] = 0;
    out[8] = 1;
    return out;
};

/**
 * Creates a new mat3 initialized with values from an existing matrix
 *
 * @param {mat3} a matrix to clone
 * @returns {mat3} a new 3x3 matrix
 */
mat3.clone = function(a) {
    var out = new GLMAT_ARRAY_TYPE(9);
    out[0] = a[0];
    out[1] = a[1];
    out[2] = a[2];
    out[3] = a[3];
    out[4] = a[4];
    out[5] = a[5];
    out[6] = a[6];
    out[7] = a[7];
    out[8] = a[8];
    return out;
};

/**
 * Copy the values from one mat3 to another
 *
 * @param {mat3} out the receiving matrix
 * @param {mat3} a the source matrix
 * @returns {mat3} out
 */
mat3.copy = function(out, a) {
    out[0] = a[0];
    out[1] = a[1];
    out[2] = a[2];
    out[3] = a[3];
    out[4] = a[4];
    out[5] = a[5];
    out[6] = a[6];
    out[7] = a[7];
    out[8] = a[8];
    return out;
};

/**
 * Set a mat3 to the identity matrix
 *
 * @param {mat3} out the receiving matrix
 * @returns {mat3} out
 */
mat3.identity = function(out) {
    out[0] = 1;
    out[1] = 0;
    out[2] = 0;
    out[3] = 0;
    out[4] = 1;
    out[5] = 0;
    out[6] = 0;
    out[7] = 0;
    out[8] = 1;
    return out;
};

/**
 * Transpose the values of a mat3
 *
 * @param {mat3} out the receiving matrix
 * @param {mat3} a the source matrix
 * @returns {mat3} out
 */
mat3.transpose = function(out, a) {
    // If we are transposing ourselves we can skip a few steps but have to cache some values
    if (out === a) {
        var a01 = a[1], a02 = a[2], a12 = a[5];
        out[1] = a[3];
        out[2] = a[6];
        out[3] = a01;
        out[5] = a[7];
        out[6] = a02;
        out[7] = a12;
    } else {
        out[0] = a[0];
        out[1] = a[3];
        out[2] = a[6];
        out[3] = a[1];
        out[4] = a[4];
        out[5] = a[7];
        out[6] = a[2];
        out[7] = a[5];
        out[8] = a[8];
    }
    
    return out;
};

/**
 * Inverts a mat3
 *
 * @param {mat3} out the receiving matrix
 * @param {mat3} a the source matrix
 * @returns {mat3} out
 */
mat3.invert = function(out, a) {
    var a00 = a[0], a01 = a[1], a02 = a[2],
        a10 = a[3], a11 = a[4], a12 = a[5],
        a20 = a[6], a21 = a[7], a22 = a[8],

        b01 = a22 * a11 - a12 * a21,
        b11 = -a22 * a10 + a12 * a20,
        b21 = a21 * a10 - a11 * a20,

        // Calculate the determinant
        det = a00 * b01 + a01 * b11 + a02 * b21;

    if (!det) { 
        return null; 
    }
    det = 1.0 / det;

    out[0] = b01 * det;
    out[1] = (-a22 * a01 + a02 * a21) * det;
    out[2] = (a12 * a01 - a02 * a11) * det;
    out[3] = b11 * det;
    out[4] = (a22 * a00 - a02 * a20) * det;
    out[5] = (-a12 * a00 + a02 * a10) * det;
    out[6] = b21 * det;
    out[7] = (-a21 * a00 + a01 * a20) * det;
    out[8] = (a11 * a00 - a01 * a10) * det;
    return out;
};

/**
 * Calculates the adjugate of a mat3
 *
 * @param {mat3} out the receiving matrix
 * @param {mat3} a the source matrix
 * @returns {mat3} out
 */
mat3.adjoint = function(out, a) {
    var a00 = a[0], a01 = a[1], a02 = a[2],
        a10 = a[3], a11 = a[4], a12 = a[5],
        a20 = a[6], a21 = a[7], a22 = a[8];

    out[0] = (a11 * a22 - a12 * a21);
    out[1] = (a02 * a21 - a01 * a22);
    out[2] = (a01 * a12 - a02 * a11);
    out[3] = (a12 * a20 - a10 * a22);
    out[4] = (a00 * a22 - a02 * a20);
    out[5] = (a02 * a10 - a00 * a12);
    out[6] = (a10 * a21 - a11 * a20);
    out[7] = (a01 * a20 - a00 * a21);
    out[8] = (a00 * a11 - a01 * a10);
    return out;
};

/**
 * Calculates the determinant of a mat3
 *
 * @param {mat3} a the source matrix
 * @returns {Number} determinant of a
 */
mat3.determinant = function (a) {
    var a00 = a[0], a01 = a[1], a02 = a[2],
        a10 = a[3], a11 = a[4], a12 = a[5],
        a20 = a[6], a21 = a[7], a22 = a[8];

    return a00 * (a22 * a11 - a12 * a21) + a01 * (-a22 * a10 + a12 * a20) + a02 * (a21 * a10 - a11 * a20);
};

/**
 * Multiplies two mat3's
 *
 * @param {mat3} out the receiving matrix
 * @param {mat3} a the first operand
 * @param {mat3} b the second operand
 * @returns {mat3} out
 */
mat3.multiply = function (out, a, b) {
    var a00 = a[0], a01 = a[1], a02 = a[2],
        a10 = a[3], a11 = a[4], a12 = a[5],
        a20 = a[6], a21 = a[7], a22 = a[8],

        b00 = b[0], b01 = b[1], b02 = b[2],
        b10 = b[3], b11 = b[4], b12 = b[5],
        b20 = b[6], b21 = b[7], b22 = b[8];

    out[0] = b00 * a00 + b01 * a10 + b02 * a20;
    out[1] = b00 * a01 + b01 * a11 + b02 * a21;
    out[2] = b00 * a02 + b01 * a12 + b02 * a22;

    out[3] = b10 * a00 + b11 * a10 + b12 * a20;
    out[4] = b10 * a01 + b11 * a11 + b12 * a21;
    out[5] = b10 * a02 + b11 * a12 + b12 * a22;

    out[6] = b20 * a00 + b21 * a10 + b22 * a20;
    out[7] = b20 * a01 + b21 * a11 + b22 * a21;
    out[8] = b20 * a02 + b21 * a12 + b22 * a22;
    return out;
};

/**
 * Alias for {@link mat3.multiply}
 * @function
 */
mat3.mul = mat3.multiply;

/**
 * Translate a mat3 by the given vector
 *
 * @param {mat3} out the receiving matrix
 * @param {mat3} a the matrix to translate
 * @param {vec2} v vector to translate by
 * @returns {mat3} out
 */
mat3.translate = function(out, a, v) {
    var a00 = a[0], a01 = a[1], a02 = a[2],
        a10 = a[3], a11 = a[4], a12 = a[5],
        a20 = a[6], a21 = a[7], a22 = a[8],
        x = v[0], y = v[1];

    out[0] = a00;
    out[1] = a01;
    out[2] = a02;

    out[3] = a10;
    out[4] = a11;
    out[5] = a12;

    out[6] = x * a00 + y * a10 + a20;
    out[7] = x * a01 + y * a11 + a21;
    out[8] = x * a02 + y * a12 + a22;
    return out;
};

/**
 * Rotates a mat3 by the given angle
 *
 * @param {mat3} out the receiving matrix
 * @param {mat3} a the matrix to rotate
 * @param {Number} rad the angle to rotate the matrix by
 * @returns {mat3} out
 */
mat3.rotate = function (out, a, rad) {
    var a00 = a[0], a01 = a[1], a02 = a[2],
        a10 = a[3], a11 = a[4], a12 = a[5],
        a20 = a[6], a21 = a[7], a22 = a[8],

        s = Math.sin(rad),
        c = Math.cos(rad);

    out[0] = c * a00 + s * a10;
    out[1] = c * a01 + s * a11;
    out[2] = c * a02 + s * a12;

    out[3] = c * a10 - s * a00;
    out[4] = c * a11 - s * a01;
    out[5] = c * a12 - s * a02;

    out[6] = a20;
    out[7] = a21;
    out[8] = a22;
    return out;
};

/**
 * Scales the mat3 by the dimensions in the given vec2
 *
 * @param {mat3} out the receiving matrix
 * @param {mat3} a the matrix to rotate
 * @param {vec2} v the vec2 to scale the matrix by
 * @returns {mat3} out
 **/
mat3.scale = function(out, a, v) {
    var x = v[0], y = v[2];

    out[0] = x * a[0];
    out[1] = x * a[1];
    out[2] = x * a[2];

    out[3] = y * a[3];
    out[4] = y * a[4];
    out[5] = y * a[5];

    out[6] = a[6];
    out[7] = a[7];
    out[8] = a[8];
    return out;
};

/**
 * Copies the values from a mat2d into a mat3
 *
 * @param {mat3} out the receiving matrix
 * @param {mat3} a the matrix to rotate
 * @param {vec2} v the vec2 to scale the matrix by
 * @returns {mat3} out
 **/
mat3.fromMat2d = function(out, a) {
    out[0] = a[0];
    out[1] = a[1];
    out[2] = 0;

    out[3] = a[2];
    out[4] = a[3];
    out[5] = 0;

    out[6] = a[4];
    out[7] = a[5];
    out[8] = 1;
    return out;
};

/**
* Calculates a 3x3 matrix from the given quaternion
*
* @param {mat3} out mat3 receiving operation result
* @param {quat} q Quaternion to create matrix from
*
* @returns {mat3} out
*/
mat3.fromQuat = function (out, q) {
    var x = q[0], y = q[1], z = q[2], w = q[3],
        x2 = x + x,
        y2 = y + y,
        z2 = z + z,

        xx = x * x2,
        xy = x * y2,
        xz = x * z2,
        yy = y * y2,
        yz = y * z2,
        zz = z * z2,
        wx = w * x2,
        wy = w * y2,
        wz = w * z2;

    out[0] = 1 - (yy + zz);
    out[1] = xy + wz;
    out[2] = xz - wy;

    out[3] = xy - wz;
    out[4] = 1 - (xx + zz);
    out[5] = yz + wx;

    out[6] = xz + wy;
    out[7] = yz - wx;
    out[8] = 1 - (xx + yy);

    return out;
};

/**
 * Returns a string representation of a mat3
 *
 * @param {mat3} mat matrix to represent as a string
 * @returns {String} string representation of the matrix
 */
mat3.str = function (a) {
    return 'mat3(' + a[0] + ', ' + a[1] + ', ' + a[2] + ', ' + 
                    a[3] + ', ' + a[4] + ', ' + a[5] + ', ' + 
                    a[6] + ', ' + a[7] + ', ' + a[8] + ')';
};

if(typeof(exports) !== 'undefined') {
    exports.mat3 = mat3;
}
;
/* Copyright (c) 2013, Brandon Jones, Colin MacKenzie IV. All rights reserved.

Redistribution and use in source and binary forms, with or without modification,
are permitted provided that the following conditions are met:

  * Redistributions of source code must retain the above copyright notice, this
    list of conditions and the following disclaimer.
  * Redistributions in binary form must reproduce the above copyright notice,
    this list of conditions and the following disclaimer in the documentation 
    and/or other materials provided with the distribution.

THIS SOFTWARE IS PROVIDED BY THE COPYRIGHT HOLDERS AND CONTRIBUTORS "AS IS" AND
ANY EXPRESS OR IMPLIED WARRANTIES, INCLUDING, BUT NOT LIMITED TO, THE IMPLIED
WARRANTIES OF MERCHANTABILITY AND FITNESS FOR A PARTICULAR PURPOSE ARE 
DISCLAIMED. IN NO EVENT SHALL THE COPYRIGHT HOLDER OR CONTRIBUTORS BE LIABLE FOR
ANY DIRECT, INDIRECT, INCIDENTAL, SPECIAL, EXEMPLARY, OR CONSEQUENTIAL DAMAGES
(INCLUDING, BUT NOT LIMITED TO, PROCUREMENT OF SUBSTITUTE GOODS OR SERVICES;
LOSS OF USE, DATA, OR PROFITS; OR BUSINESS INTERRUPTION) HOWEVER CAUSED AND ON
ANY THEORY OF LIABILITY, WHETHER IN CONTRACT, STRICT LIABILITY, OR TORT
(INCLUDING NEGLIGENCE OR OTHERWISE) ARISING IN ANY WAY OUT OF THE USE OF THIS
SOFTWARE, EVEN IF ADVISED OF THE POSSIBILITY OF SUCH DAMAGE. */

/**
 * @class 4x4 Matrix
 * @name mat4
 */

var mat4 = {};

var mat4Identity = new Float32Array([
    1, 0, 0, 0,
    0, 1, 0, 0,
    0, 0, 1, 0,
    0, 0, 0, 1
]);

/**
 * Creates a new identity mat4
 *
 * @returns {mat4} a new 4x4 matrix
 */
mat4.create = function() {
    var out = new GLMAT_ARRAY_TYPE(16);
    out[0] = 1;
    out[1] = 0;
    out[2] = 0;
    out[3] = 0;
    out[4] = 0;
    out[5] = 1;
    out[6] = 0;
    out[7] = 0;
    out[8] = 0;
    out[9] = 0;
    out[10] = 1;
    out[11] = 0;
    out[12] = 0;
    out[13] = 0;
    out[14] = 0;
    out[15] = 1;
    return out;
};

/**
 * Creates a new mat4 initialized with values from an existing matrix
 *
 * @param {mat4} a matrix to clone
 * @returns {mat4} a new 4x4 matrix
 */
mat4.clone = function(a) {
    var out = new GLMAT_ARRAY_TYPE(16);
    out[0] = a[0];
    out[1] = a[1];
    out[2] = a[2];
    out[3] = a[3];
    out[4] = a[4];
    out[5] = a[5];
    out[6] = a[6];
    out[7] = a[7];
    out[8] = a[8];
    out[9] = a[9];
    out[10] = a[10];
    out[11] = a[11];
    out[12] = a[12];
    out[13] = a[13];
    out[14] = a[14];
    out[15] = a[15];
    return out;
};

/**
 * Copy the values from one mat4 to another
 *
 * @param {mat4} out the receiving matrix
 * @param {mat4} a the source matrix
 * @returns {mat4} out
 */
mat4.copy = function(out, a) {
    out[0] = a[0];
    out[1] = a[1];
    out[2] = a[2];
    out[3] = a[3];
    out[4] = a[4];
    out[5] = a[5];
    out[6] = a[6];
    out[7] = a[7];
    out[8] = a[8];
    out[9] = a[9];
    out[10] = a[10];
    out[11] = a[11];
    out[12] = a[12];
    out[13] = a[13];
    out[14] = a[14];
    out[15] = a[15];
    return out;
};

/**
 * Set a mat4 to the identity matrix
 *
 * @param {mat4} out the receiving matrix
 * @returns {mat4} out
 */
mat4.identity = function(out) {
    out[0] = 1;
    out[1] = 0;
    out[2] = 0;
    out[3] = 0;
    out[4] = 0;
    out[5] = 1;
    out[6] = 0;
    out[7] = 0;
    out[8] = 0;
    out[9] = 0;
    out[10] = 1;
    out[11] = 0;
    out[12] = 0;
    out[13] = 0;
    out[14] = 0;
    out[15] = 1;
    return out;
};

/**
 * Transpose the values of a mat4
 *
 * @param {mat4} out the receiving matrix
 * @param {mat4} a the source matrix
 * @returns {mat4} out
 */
mat4.transpose = function(out, a) {
    // If we are transposing ourselves we can skip a few steps but have to cache some values
    if (out === a) {
        var a01 = a[1], a02 = a[2], a03 = a[3],
            a12 = a[6], a13 = a[7],
            a23 = a[11];

        out[1] = a[4];
        out[2] = a[8];
        out[3] = a[12];
        out[4] = a01;
        out[6] = a[9];
        out[7] = a[13];
        out[8] = a02;
        out[9] = a12;
        out[11] = a[14];
        out[12] = a03;
        out[13] = a13;
        out[14] = a23;
    } else {
        out[0] = a[0];
        out[1] = a[4];
        out[2] = a[8];
        out[3] = a[12];
        out[4] = a[1];
        out[5] = a[5];
        out[6] = a[9];
        out[7] = a[13];
        out[8] = a[2];
        out[9] = a[6];
        out[10] = a[10];
        out[11] = a[14];
        out[12] = a[3];
        out[13] = a[7];
        out[14] = a[11];
        out[15] = a[15];
    }
    
    return out;
};

/**
 * Inverts a mat4
 *
 * @param {mat4} out the receiving matrix
 * @param {mat4} a the source matrix
 * @returns {mat4} out
 */
mat4.invert = function(out, a) {
    var a00 = a[0], a01 = a[1], a02 = a[2], a03 = a[3],
        a10 = a[4], a11 = a[5], a12 = a[6], a13 = a[7],
        a20 = a[8], a21 = a[9], a22 = a[10], a23 = a[11],
        a30 = a[12], a31 = a[13], a32 = a[14], a33 = a[15],

        b00 = a00 * a11 - a01 * a10,
        b01 = a00 * a12 - a02 * a10,
        b02 = a00 * a13 - a03 * a10,
        b03 = a01 * a12 - a02 * a11,
        b04 = a01 * a13 - a03 * a11,
        b05 = a02 * a13 - a03 * a12,
        b06 = a20 * a31 - a21 * a30,
        b07 = a20 * a32 - a22 * a30,
        b08 = a20 * a33 - a23 * a30,
        b09 = a21 * a32 - a22 * a31,
        b10 = a21 * a33 - a23 * a31,
        b11 = a22 * a33 - a23 * a32,

        // Calculate the determinant
        det = b00 * b11 - b01 * b10 + b02 * b09 + b03 * b08 - b04 * b07 + b05 * b06;

    if (!det) { 
        return null; 
    }
    det = 1.0 / det;

    out[0] = (a11 * b11 - a12 * b10 + a13 * b09) * det;
    out[1] = (a02 * b10 - a01 * b11 - a03 * b09) * det;
    out[2] = (a31 * b05 - a32 * b04 + a33 * b03) * det;
    out[3] = (a22 * b04 - a21 * b05 - a23 * b03) * det;
    out[4] = (a12 * b08 - a10 * b11 - a13 * b07) * det;
    out[5] = (a00 * b11 - a02 * b08 + a03 * b07) * det;
    out[6] = (a32 * b02 - a30 * b05 - a33 * b01) * det;
    out[7] = (a20 * b05 - a22 * b02 + a23 * b01) * det;
    out[8] = (a10 * b10 - a11 * b08 + a13 * b06) * det;
    out[9] = (a01 * b08 - a00 * b10 - a03 * b06) * det;
    out[10] = (a30 * b04 - a31 * b02 + a33 * b00) * det;
    out[11] = (a21 * b02 - a20 * b04 - a23 * b00) * det;
    out[12] = (a11 * b07 - a10 * b09 - a12 * b06) * det;
    out[13] = (a00 * b09 - a01 * b07 + a02 * b06) * det;
    out[14] = (a31 * b01 - a30 * b03 - a32 * b00) * det;
    out[15] = (a20 * b03 - a21 * b01 + a22 * b00) * det;

    return out;
};

/**
 * Calculates the adjugate of a mat4
 *
 * @param {mat4} out the receiving matrix
 * @param {mat4} a the source matrix
 * @returns {mat4} out
 */
mat4.adjoint = function(out, a) {
    var a00 = a[0], a01 = a[1], a02 = a[2], a03 = a[3],
        a10 = a[4], a11 = a[5], a12 = a[6], a13 = a[7],
        a20 = a[8], a21 = a[9], a22 = a[10], a23 = a[11],
        a30 = a[12], a31 = a[13], a32 = a[14], a33 = a[15];

    out[0]  =  (a11 * (a22 * a33 - a23 * a32) - a21 * (a12 * a33 - a13 * a32) + a31 * (a12 * a23 - a13 * a22));
    out[1]  = -(a01 * (a22 * a33 - a23 * a32) - a21 * (a02 * a33 - a03 * a32) + a31 * (a02 * a23 - a03 * a22));
    out[2]  =  (a01 * (a12 * a33 - a13 * a32) - a11 * (a02 * a33 - a03 * a32) + a31 * (a02 * a13 - a03 * a12));
    out[3]  = -(a01 * (a12 * a23 - a13 * a22) - a11 * (a02 * a23 - a03 * a22) + a21 * (a02 * a13 - a03 * a12));
    out[4]  = -(a10 * (a22 * a33 - a23 * a32) - a20 * (a12 * a33 - a13 * a32) + a30 * (a12 * a23 - a13 * a22));
    out[5]  =  (a00 * (a22 * a33 - a23 * a32) - a20 * (a02 * a33 - a03 * a32) + a30 * (a02 * a23 - a03 * a22));
    out[6]  = -(a00 * (a12 * a33 - a13 * a32) - a10 * (a02 * a33 - a03 * a32) + a30 * (a02 * a13 - a03 * a12));
    out[7]  =  (a00 * (a12 * a23 - a13 * a22) - a10 * (a02 * a23 - a03 * a22) + a20 * (a02 * a13 - a03 * a12));
    out[8]  =  (a10 * (a21 * a33 - a23 * a31) - a20 * (a11 * a33 - a13 * a31) + a30 * (a11 * a23 - a13 * a21));
    out[9]  = -(a00 * (a21 * a33 - a23 * a31) - a20 * (a01 * a33 - a03 * a31) + a30 * (a01 * a23 - a03 * a21));
    out[10] =  (a00 * (a11 * a33 - a13 * a31) - a10 * (a01 * a33 - a03 * a31) + a30 * (a01 * a13 - a03 * a11));
    out[11] = -(a00 * (a11 * a23 - a13 * a21) - a10 * (a01 * a23 - a03 * a21) + a20 * (a01 * a13 - a03 * a11));
    out[12] = -(a10 * (a21 * a32 - a22 * a31) - a20 * (a11 * a32 - a12 * a31) + a30 * (a11 * a22 - a12 * a21));
    out[13] =  (a00 * (a21 * a32 - a22 * a31) - a20 * (a01 * a32 - a02 * a31) + a30 * (a01 * a22 - a02 * a21));
    out[14] = -(a00 * (a11 * a32 - a12 * a31) - a10 * (a01 * a32 - a02 * a31) + a30 * (a01 * a12 - a02 * a11));
    out[15] =  (a00 * (a11 * a22 - a12 * a21) - a10 * (a01 * a22 - a02 * a21) + a20 * (a01 * a12 - a02 * a11));
    return out;
};

/**
 * Calculates the determinant of a mat4
 *
 * @param {mat4} a the source matrix
 * @returns {Number} determinant of a
 */
mat4.determinant = function (a) {
    var a00 = a[0], a01 = a[1], a02 = a[2], a03 = a[3],
        a10 = a[4], a11 = a[5], a12 = a[6], a13 = a[7],
        a20 = a[8], a21 = a[9], a22 = a[10], a23 = a[11],
        a30 = a[12], a31 = a[13], a32 = a[14], a33 = a[15],

        b00 = a00 * a11 - a01 * a10,
        b01 = a00 * a12 - a02 * a10,
        b02 = a00 * a13 - a03 * a10,
        b03 = a01 * a12 - a02 * a11,
        b04 = a01 * a13 - a03 * a11,
        b05 = a02 * a13 - a03 * a12,
        b06 = a20 * a31 - a21 * a30,
        b07 = a20 * a32 - a22 * a30,
        b08 = a20 * a33 - a23 * a30,
        b09 = a21 * a32 - a22 * a31,
        b10 = a21 * a33 - a23 * a31,
        b11 = a22 * a33 - a23 * a32;

    // Calculate the determinant
    return b00 * b11 - b01 * b10 + b02 * b09 + b03 * b08 - b04 * b07 + b05 * b06;
};

/**
 * Multiplies two mat4's
 *
 * @param {mat4} out the receiving matrix
 * @param {mat4} a the first operand
 * @param {mat4} b the second operand
 * @returns {mat4} out
 */
mat4.multiply = function (out, a, b) {
    var a00 = a[0], a01 = a[1], a02 = a[2], a03 = a[3],
        a10 = a[4], a11 = a[5], a12 = a[6], a13 = a[7],
        a20 = a[8], a21 = a[9], a22 = a[10], a23 = a[11],
        a30 = a[12], a31 = a[13], a32 = a[14], a33 = a[15];

    // Cache only the current line of the second matrix
    var b0  = b[0], b1 = b[1], b2 = b[2], b3 = b[3];  
    out[0] = b0*a00 + b1*a10 + b2*a20 + b3*a30;
    out[1] = b0*a01 + b1*a11 + b2*a21 + b3*a31;
    out[2] = b0*a02 + b1*a12 + b2*a22 + b3*a32;
    out[3] = b0*a03 + b1*a13 + b2*a23 + b3*a33;

    b0 = b[4]; b1 = b[5]; b2 = b[6]; b3 = b[7];
    out[4] = b0*a00 + b1*a10 + b2*a20 + b3*a30;
    out[5] = b0*a01 + b1*a11 + b2*a21 + b3*a31;
    out[6] = b0*a02 + b1*a12 + b2*a22 + b3*a32;
    out[7] = b0*a03 + b1*a13 + b2*a23 + b3*a33;

    b0 = b[8]; b1 = b[9]; b2 = b[10]; b3 = b[11];
    out[8] = b0*a00 + b1*a10 + b2*a20 + b3*a30;
    out[9] = b0*a01 + b1*a11 + b2*a21 + b3*a31;
    out[10] = b0*a02 + b1*a12 + b2*a22 + b3*a32;
    out[11] = b0*a03 + b1*a13 + b2*a23 + b3*a33;

    b0 = b[12]; b1 = b[13]; b2 = b[14]; b3 = b[15];
    out[12] = b0*a00 + b1*a10 + b2*a20 + b3*a30;
    out[13] = b0*a01 + b1*a11 + b2*a21 + b3*a31;
    out[14] = b0*a02 + b1*a12 + b2*a22 + b3*a32;
    out[15] = b0*a03 + b1*a13 + b2*a23 + b3*a33;
    return out;
};

/**
 * Alias for {@link mat4.multiply}
 * @function
 */
mat4.mul = mat4.multiply;

/**
 * Translate a mat4 by the given vector
 *
 * @param {mat4} out the receiving matrix
 * @param {mat4} a the matrix to translate
 * @param {vec3} v vector to translate by
 * @returns {mat4} out
 */
mat4.translate = function (out, a, v) {
    var x = v[0], y = v[1], z = v[2],
        a00, a01, a02, a03,
        a10, a11, a12, a13,
        a20, a21, a22, a23;

    if (a === out) {
        out[12] = a[0] * x + a[4] * y + a[8] * z + a[12];
        out[13] = a[1] * x + a[5] * y + a[9] * z + a[13];
        out[14] = a[2] * x + a[6] * y + a[10] * z + a[14];
        out[15] = a[3] * x + a[7] * y + a[11] * z + a[15];
    } else {
        a00 = a[0]; a01 = a[1]; a02 = a[2]; a03 = a[3];
        a10 = a[4]; a11 = a[5]; a12 = a[6]; a13 = a[7];
        a20 = a[8]; a21 = a[9]; a22 = a[10]; a23 = a[11];

        out[0] = a00; out[1] = a01; out[2] = a02; out[3] = a03;
        out[4] = a10; out[5] = a11; out[6] = a12; out[7] = a13;
        out[8] = a20; out[9] = a21; out[10] = a22; out[11] = a23;

        out[12] = a00 * x + a10 * y + a20 * z + a[12];
        out[13] = a01 * x + a11 * y + a21 * z + a[13];
        out[14] = a02 * x + a12 * y + a22 * z + a[14];
        out[15] = a03 * x + a13 * y + a23 * z + a[15];
    }

    return out;
};

/**
 * Scales the mat4 by the dimensions in the given vec3
 *
 * @param {mat4} out the receiving matrix
 * @param {mat4} a the matrix to scale
 * @param {vec3} v the vec3 to scale the matrix by
 * @returns {mat4} out
 **/
mat4.scale = function(out, a, v) {
    var x = v[0], y = v[1], z = v[2];

    out[0] = a[0] * x;
    out[1] = a[1] * x;
    out[2] = a[2] * x;
    out[3] = a[3] * x;
    out[4] = a[4] * y;
    out[5] = a[5] * y;
    out[6] = a[6] * y;
    out[7] = a[7] * y;
    out[8] = a[8] * z;
    out[9] = a[9] * z;
    out[10] = a[10] * z;
    out[11] = a[11] * z;
    out[12] = a[12];
    out[13] = a[13];
    out[14] = a[14];
    out[15] = a[15];
    return out;
};

/**
 * Rotates a mat4 by the given angle
 *
 * @param {mat4} out the receiving matrix
 * @param {mat4} a the matrix to rotate
 * @param {Number} rad the angle to rotate the matrix by
 * @param {vec3} axis the axis to rotate around
 * @returns {mat4} out
 */
mat4.rotate = function (out, a, rad, axis) {
    var x = axis[0], y = axis[1], z = axis[2],
        len = Math.sqrt(x * x + y * y + z * z),
        s, c, t,
        a00, a01, a02, a03,
        a10, a11, a12, a13,
        a20, a21, a22, a23,
        b00, b01, b02,
        b10, b11, b12,
        b20, b21, b22;

    if (Math.abs(len) < GLMAT_EPSILON) { return null; }
    
    len = 1 / len;
    x *= len;
    y *= len;
    z *= len;

    s = Math.sin(rad);
    c = Math.cos(rad);
    t = 1 - c;

    a00 = a[0]; a01 = a[1]; a02 = a[2]; a03 = a[3];
    a10 = a[4]; a11 = a[5]; a12 = a[6]; a13 = a[7];
    a20 = a[8]; a21 = a[9]; a22 = a[10]; a23 = a[11];

    // Construct the elements of the rotation matrix
    b00 = x * x * t + c; b01 = y * x * t + z * s; b02 = z * x * t - y * s;
    b10 = x * y * t - z * s; b11 = y * y * t + c; b12 = z * y * t + x * s;
    b20 = x * z * t + y * s; b21 = y * z * t - x * s; b22 = z * z * t + c;

    // Perform rotation-specific matrix multiplication
    out[0] = a00 * b00 + a10 * b01 + a20 * b02;
    out[1] = a01 * b00 + a11 * b01 + a21 * b02;
    out[2] = a02 * b00 + a12 * b01 + a22 * b02;
    out[3] = a03 * b00 + a13 * b01 + a23 * b02;
    out[4] = a00 * b10 + a10 * b11 + a20 * b12;
    out[5] = a01 * b10 + a11 * b11 + a21 * b12;
    out[6] = a02 * b10 + a12 * b11 + a22 * b12;
    out[7] = a03 * b10 + a13 * b11 + a23 * b12;
    out[8] = a00 * b20 + a10 * b21 + a20 * b22;
    out[9] = a01 * b20 + a11 * b21 + a21 * b22;
    out[10] = a02 * b20 + a12 * b21 + a22 * b22;
    out[11] = a03 * b20 + a13 * b21 + a23 * b22;

    if (a !== out) { // If the source and destination differ, copy the unchanged last row
        out[12] = a[12];
        out[13] = a[13];
        out[14] = a[14];
        out[15] = a[15];
    }
    return out;
};

/**
 * Rotates a matrix by the given angle around the X axis
 *
 * @param {mat4} out the receiving matrix
 * @param {mat4} a the matrix to rotate
 * @param {Number} rad the angle to rotate the matrix by
 * @returns {mat4} out
 */
mat4.rotateX = function (out, a, rad) {
    var s = Math.sin(rad),
        c = Math.cos(rad),
        a10 = a[4],
        a11 = a[5],
        a12 = a[6],
        a13 = a[7],
        a20 = a[8],
        a21 = a[9],
        a22 = a[10],
        a23 = a[11];

    if (a !== out) { // If the source and destination differ, copy the unchanged rows
        out[0]  = a[0];
        out[1]  = a[1];
        out[2]  = a[2];
        out[3]  = a[3];
        out[12] = a[12];
        out[13] = a[13];
        out[14] = a[14];
        out[15] = a[15];
    }

    // Perform axis-specific matrix multiplication
    out[4] = a10 * c + a20 * s;
    out[5] = a11 * c + a21 * s;
    out[6] = a12 * c + a22 * s;
    out[7] = a13 * c + a23 * s;
    out[8] = a20 * c - a10 * s;
    out[9] = a21 * c - a11 * s;
    out[10] = a22 * c - a12 * s;
    out[11] = a23 * c - a13 * s;
    return out;
};

/**
 * Rotates a matrix by the given angle around the Y axis
 *
 * @param {mat4} out the receiving matrix
 * @param {mat4} a the matrix to rotate
 * @param {Number} rad the angle to rotate the matrix by
 * @returns {mat4} out
 */
mat4.rotateY = function (out, a, rad) {
    var s = Math.sin(rad),
        c = Math.cos(rad),
        a00 = a[0],
        a01 = a[1],
        a02 = a[2],
        a03 = a[3],
        a20 = a[8],
        a21 = a[9],
        a22 = a[10],
        a23 = a[11];

    if (a !== out) { // If the source and destination differ, copy the unchanged rows
        out[4]  = a[4];
        out[5]  = a[5];
        out[6]  = a[6];
        out[7]  = a[7];
        out[12] = a[12];
        out[13] = a[13];
        out[14] = a[14];
        out[15] = a[15];
    }

    // Perform axis-specific matrix multiplication
    out[0] = a00 * c - a20 * s;
    out[1] = a01 * c - a21 * s;
    out[2] = a02 * c - a22 * s;
    out[3] = a03 * c - a23 * s;
    out[8] = a00 * s + a20 * c;
    out[9] = a01 * s + a21 * c;
    out[10] = a02 * s + a22 * c;
    out[11] = a03 * s + a23 * c;
    return out;
};

/**
 * Rotates a matrix by the given angle around the Z axis
 *
 * @param {mat4} out the receiving matrix
 * @param {mat4} a the matrix to rotate
 * @param {Number} rad the angle to rotate the matrix by
 * @returns {mat4} out
 */
mat4.rotateZ = function (out, a, rad) {
    var s = Math.sin(rad),
        c = Math.cos(rad),
        a00 = a[0],
        a01 = a[1],
        a02 = a[2],
        a03 = a[3],
        a10 = a[4],
        a11 = a[5],
        a12 = a[6],
        a13 = a[7];

    if (a !== out) { // If the source and destination differ, copy the unchanged last row
        out[8]  = a[8];
        out[9]  = a[9];
        out[10] = a[10];
        out[11] = a[11];
        out[12] = a[12];
        out[13] = a[13];
        out[14] = a[14];
        out[15] = a[15];
    }

    // Perform axis-specific matrix multiplication
    out[0] = a00 * c + a10 * s;
    out[1] = a01 * c + a11 * s;
    out[2] = a02 * c + a12 * s;
    out[3] = a03 * c + a13 * s;
    out[4] = a10 * c - a00 * s;
    out[5] = a11 * c - a01 * s;
    out[6] = a12 * c - a02 * s;
    out[7] = a13 * c - a03 * s;
    return out;
};

/**
 * Creates a matrix from a quaternion rotation and vector translation
 * This is equivalent to (but much faster than):
 *
 *     mat4.identity(dest);
 *     mat4.translate(dest, vec);
 *     var quatMat = mat4.create();
 *     quat4.toMat4(quat, quatMat);
 *     mat4.multiply(dest, quatMat);
 *
 * @param {mat4} out mat4 receiving operation result
 * @param {quat4} q Rotation quaternion
 * @param {vec3} v Translation vector
 * @returns {mat4} out
 */
mat4.fromRotationTranslation = function (out, q, v) {
    // Quaternion math
    var x = q[0], y = q[1], z = q[2], w = q[3],
        x2 = x + x,
        y2 = y + y,
        z2 = z + z,

        xx = x * x2,
        xy = x * y2,
        xz = x * z2,
        yy = y * y2,
        yz = y * z2,
        zz = z * z2,
        wx = w * x2,
        wy = w * y2,
        wz = w * z2;

    out[0] = 1 - (yy + zz);
    out[1] = xy + wz;
    out[2] = xz - wy;
    out[3] = 0;
    out[4] = xy - wz;
    out[5] = 1 - (xx + zz);
    out[6] = yz + wx;
    out[7] = 0;
    out[8] = xz + wy;
    out[9] = yz - wx;
    out[10] = 1 - (xx + yy);
    out[11] = 0;
    out[12] = v[0];
    out[13] = v[1];
    out[14] = v[2];
    out[15] = 1;
    
    return out;
};

/**
* Calculates a 4x4 matrix from the given quaternion
*
* @param {mat4} out mat4 receiving operation result
* @param {quat} q Quaternion to create matrix from
*
* @returns {mat4} out
*/
mat4.fromQuat = function (out, q) {
    var x = q[0], y = q[1], z = q[2], w = q[3],
        x2 = x + x,
        y2 = y + y,
        z2 = z + z,

        xx = x * x2,
        xy = x * y2,
        xz = x * z2,
        yy = y * y2,
        yz = y * z2,
        zz = z * z2,
        wx = w * x2,
        wy = w * y2,
        wz = w * z2;

    out[0] = 1 - (yy + zz);
    out[1] = xy + wz;
    out[2] = xz - wy;
    out[3] = 0;

    out[4] = xy - wz;
    out[5] = 1 - (xx + zz);
    out[6] = yz + wx;
    out[7] = 0;

    out[8] = xz + wy;
    out[9] = yz - wx;
    out[10] = 1 - (xx + yy);
    out[11] = 0;

    out[12] = 0;
    out[13] = 0;
    out[14] = 0;
    out[15] = 1;

    return out;
};

/**
 * Generates a frustum matrix with the given bounds
 *
 * @param {mat4} out mat4 frustum matrix will be written into
 * @param {Number} left Left bound of the frustum
 * @param {Number} right Right bound of the frustum
 * @param {Number} bottom Bottom bound of the frustum
 * @param {Number} top Top bound of the frustum
 * @param {Number} near Near bound of the frustum
 * @param {Number} far Far bound of the frustum
 * @returns {mat4} out
 */
mat4.frustum = function (out, left, right, bottom, top, near, far) {
    var rl = 1 / (right - left),
        tb = 1 / (top - bottom),
        nf = 1 / (near - far);
    out[0] = (near * 2) * rl;
    out[1] = 0;
    out[2] = 0;
    out[3] = 0;
    out[4] = 0;
    out[5] = (near * 2) * tb;
    out[6] = 0;
    out[7] = 0;
    out[8] = (right + left) * rl;
    out[9] = (top + bottom) * tb;
    out[10] = (far + near) * nf;
    out[11] = -1;
    out[12] = 0;
    out[13] = 0;
    out[14] = (far * near * 2) * nf;
    out[15] = 0;
    return out;
};

/**
 * Generates a perspective projection matrix with the given bounds
 *
 * @param {mat4} out mat4 frustum matrix will be written into
 * @param {number} fovy Vertical field of view in radians
 * @param {number} aspect Aspect ratio. typically viewport width/height
 * @param {number} near Near bound of the frustum
 * @param {number} far Far bound of the frustum
 * @returns {mat4} out
 */
mat4.perspective = function (out, fovy, aspect, near, far) {
    var f = 1.0 / Math.tan(fovy / 2),
        nf = 1 / (near - far);
    out[0] = f / aspect;
    out[1] = 0;
    out[2] = 0;
    out[3] = 0;
    out[4] = 0;
    out[5] = f;
    out[6] = 0;
    out[7] = 0;
    out[8] = 0;
    out[9] = 0;
    out[10] = (far + near) * nf;
    out[11] = -1;
    out[12] = 0;
    out[13] = 0;
    out[14] = (2 * far * near) * nf;
    out[15] = 0;
    return out;
};

/**
 * Generates a orthogonal projection matrix with the given bounds
 *
 * @param {mat4} out mat4 frustum matrix will be written into
 * @param {number} left Left bound of the frustum
 * @param {number} right Right bound of the frustum
 * @param {number} bottom Bottom bound of the frustum
 * @param {number} top Top bound of the frustum
 * @param {number} near Near bound of the frustum
 * @param {number} far Far bound of the frustum
 * @returns {mat4} out
 */
mat4.ortho = function (out, left, right, bottom, top, near, far) {
    var lr = 1 / (left - right),
        bt = 1 / (bottom - top),
        nf = 1 / (near - far);
    out[0] = -2 * lr;
    out[1] = 0;
    out[2] = 0;
    out[3] = 0;
    out[4] = 0;
    out[5] = -2 * bt;
    out[6] = 0;
    out[7] = 0;
    out[8] = 0;
    out[9] = 0;
    out[10] = 2 * nf;
    out[11] = 0;
    out[12] = (left + right) * lr;
    out[13] = (top + bottom) * bt;
    out[14] = (far + near) * nf;
    out[15] = 1;
    return out;
};

/**
 * Generates a look-at matrix with the given eye position, focal point, and up axis
 *
 * @param {mat4} out mat4 frustum matrix will be written into
 * @param {vec3} eye Position of the viewer
 * @param {vec3} center Point the viewer is looking at
 * @param {vec3} up vec3 pointing up
 * @returns {mat4} out
 */
mat4.lookAt = function (out, eye, center, up) {
    var x0, x1, x2, y0, y1, y2, z0, z1, z2, len,
        eyex = eye[0],
        eyey = eye[1],
        eyez = eye[2],
        upx = up[0],
        upy = up[1],
        upz = up[2],
        centerx = center[0],
        centery = center[1],
        centerz = center[2];

    if (Math.abs(eyex - centerx) < GLMAT_EPSILON &&
        Math.abs(eyey - centery) < GLMAT_EPSILON &&
        Math.abs(eyez - centerz) < GLMAT_EPSILON) {
        return mat4.identity(out);
    }

    z0 = eyex - centerx;
    z1 = eyey - centery;
    z2 = eyez - centerz;

    len = 1 / Math.sqrt(z0 * z0 + z1 * z1 + z2 * z2);
    z0 *= len;
    z1 *= len;
    z2 *= len;

    x0 = upy * z2 - upz * z1;
    x1 = upz * z0 - upx * z2;
    x2 = upx * z1 - upy * z0;
    len = Math.sqrt(x0 * x0 + x1 * x1 + x2 * x2);
    if (!len) {
        x0 = 0;
        x1 = 0;
        x2 = 0;
    } else {
        len = 1 / len;
        x0 *= len;
        x1 *= len;
        x2 *= len;
    }

    y0 = z1 * x2 - z2 * x1;
    y1 = z2 * x0 - z0 * x2;
    y2 = z0 * x1 - z1 * x0;

    len = Math.sqrt(y0 * y0 + y1 * y1 + y2 * y2);
    if (!len) {
        y0 = 0;
        y1 = 0;
        y2 = 0;
    } else {
        len = 1 / len;
        y0 *= len;
        y1 *= len;
        y2 *= len;
    }

    out[0] = x0;
    out[1] = y0;
    out[2] = z0;
    out[3] = 0;
    out[4] = x1;
    out[5] = y1;
    out[6] = z1;
    out[7] = 0;
    out[8] = x2;
    out[9] = y2;
    out[10] = z2;
    out[11] = 0;
    out[12] = -(x0 * eyex + x1 * eyey + x2 * eyez);
    out[13] = -(y0 * eyex + y1 * eyey + y2 * eyez);
    out[14] = -(z0 * eyex + z1 * eyey + z2 * eyez);
    out[15] = 1;

    return out;
};

/**
 * Returns a string representation of a mat4
 *
 * @param {mat4} mat matrix to represent as a string
 * @returns {String} string representation of the matrix
 */
mat4.str = function (a) {
    return 'mat4(' + a[0] + ', ' + a[1] + ', ' + a[2] + ', ' + a[3] + ', ' +
                    a[4] + ', ' + a[5] + ', ' + a[6] + ', ' + a[7] + ', ' +
                    a[8] + ', ' + a[9] + ', ' + a[10] + ', ' + a[11] + ', ' + 
                    a[12] + ', ' + a[13] + ', ' + a[14] + ', ' + a[15] + ')';
};

if(typeof(exports) !== 'undefined') {
    exports.mat4 = mat4;
}
;
/* Copyright (c) 2013, Brandon Jones, Colin MacKenzie IV. All rights reserved.

Redistribution and use in source and binary forms, with or without modification,
are permitted provided that the following conditions are met:

  * Redistributions of source code must retain the above copyright notice, this
    list of conditions and the following disclaimer.
  * Redistributions in binary form must reproduce the above copyright notice,
    this list of conditions and the following disclaimer in the documentation 
    and/or other materials provided with the distribution.

THIS SOFTWARE IS PROVIDED BY THE COPYRIGHT HOLDERS AND CONTRIBUTORS "AS IS" AND
ANY EXPRESS OR IMPLIED WARRANTIES, INCLUDING, BUT NOT LIMITED TO, THE IMPLIED
WARRANTIES OF MERCHANTABILITY AND FITNESS FOR A PARTICULAR PURPOSE ARE 
DISCLAIMED. IN NO EVENT SHALL THE COPYRIGHT HOLDER OR CONTRIBUTORS BE LIABLE FOR
ANY DIRECT, INDIRECT, INCIDENTAL, SPECIAL, EXEMPLARY, OR CONSEQUENTIAL DAMAGES
(INCLUDING, BUT NOT LIMITED TO, PROCUREMENT OF SUBSTITUTE GOODS OR SERVICES;
LOSS OF USE, DATA, OR PROFITS; OR BUSINESS INTERRUPTION) HOWEVER CAUSED AND ON
ANY THEORY OF LIABILITY, WHETHER IN CONTRACT, STRICT LIABILITY, OR TORT
(INCLUDING NEGLIGENCE OR OTHERWISE) ARISING IN ANY WAY OUT OF THE USE OF THIS
SOFTWARE, EVEN IF ADVISED OF THE POSSIBILITY OF SUCH DAMAGE. */

/**
 * @class Quaternion
 * @name quat
 */

var quat = {};

var quatIdentity = new Float32Array([0, 0, 0, 1]);

/**
 * Creates a new identity quat
 *
 * @returns {quat} a new quaternion
 */
quat.create = function() {
    var out = new GLMAT_ARRAY_TYPE(4);
    out[0] = 0;
    out[1] = 0;
    out[2] = 0;
    out[3] = 1;
    return out;
};

/**
 * Creates a new quat initialized with values from an existing quaternion
 *
 * @param {quat} a quaternion to clone
 * @returns {quat} a new quaternion
 * @function
 */
quat.clone = vec4.clone;

/**
 * Creates a new quat initialized with the given values
 *
 * @param {Number} x X component
 * @param {Number} y Y component
 * @param {Number} z Z component
 * @param {Number} w W component
 * @returns {quat} a new quaternion
 * @function
 */
quat.fromValues = vec4.fromValues;

/**
 * Copy the values from one quat to another
 *
 * @param {quat} out the receiving quaternion
 * @param {quat} a the source quaternion
 * @returns {quat} out
 * @function
 */
quat.copy = vec4.copy;

/**
 * Set the components of a quat to the given values
 *
 * @param {quat} out the receiving quaternion
 * @param {Number} x X component
 * @param {Number} y Y component
 * @param {Number} z Z component
 * @param {Number} w W component
 * @returns {quat} out
 * @function
 */
quat.set = vec4.set;

/**
 * Set a quat to the identity quaternion
 *
 * @param {quat} out the receiving quaternion
 * @returns {quat} out
 */
quat.identity = function(out) {
    out[0] = 0;
    out[1] = 0;
    out[2] = 0;
    out[3] = 1;
    return out;
};

/**
 * Sets a quat from the given angle and rotation axis,
 * then returns it.
 *
 * @param {quat} out the receiving quaternion
 * @param {vec3} axis the axis around which to rotate
 * @param {Number} rad the angle in radians
 * @returns {quat} out
 **/
quat.setAxisAngle = function(out, axis, rad) {
    rad = rad * 0.5;
    var s = Math.sin(rad);
    out[0] = s * axis[0];
    out[1] = s * axis[1];
    out[2] = s * axis[2];
    out[3] = Math.cos(rad);
    return out;
};

/**
 * Adds two quat's
 *
 * @param {quat} out the receiving quaternion
 * @param {quat} a the first operand
 * @param {quat} b the second operand
 * @returns {quat} out
 * @function
 */
quat.add = vec4.add;

/**
 * Multiplies two quat's
 *
 * @param {quat} out the receiving quaternion
 * @param {quat} a the first operand
 * @param {quat} b the second operand
 * @returns {quat} out
 */
quat.multiply = function(out, a, b) {
    var ax = a[0], ay = a[1], az = a[2], aw = a[3],
        bx = b[0], by = b[1], bz = b[2], bw = b[3];

    out[0] = ax * bw + aw * bx + ay * bz - az * by;
    out[1] = ay * bw + aw * by + az * bx - ax * bz;
    out[2] = az * bw + aw * bz + ax * by - ay * bx;
    out[3] = aw * bw - ax * bx - ay * by - az * bz;
    return out;
};

/**
 * Alias for {@link quat.multiply}
 * @function
 */
quat.mul = quat.multiply;

/**
 * Scales a quat by a scalar number
 *
 * @param {quat} out the receiving vector
 * @param {quat} a the vector to scale
 * @param {Number} b amount to scale the vector by
 * @returns {quat} out
 * @function
 */
quat.scale = vec4.scale;

/**
 * Rotates a quaternion by the given angle around the X axis
 *
 * @param {quat} out quat receiving operation result
 * @param {quat} a quat to rotate
 * @param {number} rad angle (in radians) to rotate
 * @returns {quat} out
 */
quat.rotateX = function (out, a, rad) {
    rad *= 0.5; 

    var ax = a[0], ay = a[1], az = a[2], aw = a[3],
        bx = Math.sin(rad), bw = Math.cos(rad);

    out[0] = ax * bw + aw * bx;
    out[1] = ay * bw + az * bx;
    out[2] = az * bw - ay * bx;
    out[3] = aw * bw - ax * bx;
    return out;
};

/**
 * Rotates a quaternion by the given angle around the Y axis
 *
 * @param {quat} out quat receiving operation result
 * @param {quat} a quat to rotate
 * @param {number} rad angle (in radians) to rotate
 * @returns {quat} out
 */
quat.rotateY = function (out, a, rad) {
    rad *= 0.5; 

    var ax = a[0], ay = a[1], az = a[2], aw = a[3],
        by = Math.sin(rad), bw = Math.cos(rad);

    out[0] = ax * bw - az * by;
    out[1] = ay * bw + aw * by;
    out[2] = az * bw + ax * by;
    out[3] = aw * bw - ay * by;
    return out;
};

/**
 * Rotates a quaternion by the given angle around the Z axis
 *
 * @param {quat} out quat receiving operation result
 * @param {quat} a quat to rotate
 * @param {number} rad angle (in radians) to rotate
 * @returns {quat} out
 */
quat.rotateZ = function (out, a, rad) {
    rad *= 0.5; 

    var ax = a[0], ay = a[1], az = a[2], aw = a[3],
        bz = Math.sin(rad), bw = Math.cos(rad);

    out[0] = ax * bw + ay * bz;
    out[1] = ay * bw - ax * bz;
    out[2] = az * bw + aw * bz;
    out[3] = aw * bw - az * bz;
    return out;
};

/**
 * Calculates the W component of a quat from the X, Y, and Z components.
 * Assumes that quaternion is 1 unit in length.
 * Any existing W component will be ignored.
 *
 * @param {quat} out the receiving quaternion
 * @param {quat} a quat to calculate W component of
 * @returns {quat} out
 */
quat.calculateW = function (out, a) {
    var x = a[0], y = a[1], z = a[2];

    out[0] = x;
    out[1] = y;
    out[2] = z;
    out[3] = -Math.sqrt(Math.abs(1.0 - x * x - y * y - z * z));
    return out;
};

/**
 * Calculates the dot product of two quat's
 *
 * @param {quat} a the first operand
 * @param {quat} b the second operand
 * @returns {Number} dot product of a and b
 * @function
 */
quat.dot = vec4.dot;

/**
 * Performs a linear interpolation between two quat's
 *
 * @param {quat} out the receiving quaternion
 * @param {quat} a the first operand
 * @param {quat} b the second operand
 * @param {Number} t interpolation amount between the two inputs
 * @returns {quat} out
 * @function
 */
quat.lerp = vec4.lerp;

/**
 * Performs a spherical linear interpolation between two quat
 *
 * @param {quat} out the receiving quaternion
 * @param {quat} a the first operand
 * @param {quat} b the second operand
 * @param {Number} t interpolation amount between the two inputs
 * @returns {quat} out
 */
quat.slerp = function (out, a, b, t) {
    var ax = a[0], ay = a[1], az = a[2], aw = a[3],
        bx = b[0], by = b[1], bz = b[2], bw = b[3];

    var cosHalfTheta = ax * bx + ay * by + az * bz + aw * bw,
        halfTheta,
        sinHalfTheta,
        ratioA,
        ratioB;

    if (Math.abs(cosHalfTheta) >= 1.0) {
        if (out !== a) {
            out[0] = ax;
            out[1] = ay;
            out[2] = az;
            out[3] = aw;
        }
        return out;
    }

    halfTheta = Math.acos(cosHalfTheta);
    sinHalfTheta = Math.sqrt(1.0 - cosHalfTheta * cosHalfTheta);

    if (Math.abs(sinHalfTheta) < 0.001) {
        out[0] = (ax * 0.5 + bx * 0.5);
        out[1] = (ay * 0.5 + by * 0.5);
        out[2] = (az * 0.5 + bz * 0.5);
        out[3] = (aw * 0.5 + bw * 0.5);
        return out;
    }

    ratioA = Math.sin((1 - t) * halfTheta) / sinHalfTheta;
    ratioB = Math.sin(t * halfTheta) / sinHalfTheta;

    out[0] = (ax * ratioA + bx * ratioB);
    out[1] = (ay * ratioA + by * ratioB);
    out[2] = (az * ratioA + bz * ratioB);
    out[3] = (aw * ratioA + bw * ratioB);

    return out;
};

/**
 * Calculates the inverse of a quat
 *
 * @param {quat} out the receiving quaternion
 * @param {quat} a quat to calculate inverse of
 * @returns {quat} out
 */
quat.invert = function(out, a) {
    var a0 = a[0], a1 = a[1], a2 = a[2], a3 = a[3],
        dot = a0*a0 + a1*a1 + a2*a2 + a3*a3,
        invDot = dot ? 1.0/dot : 0;
    
    // TODO: Would be faster to return [0,0,0,0] immediately if dot == 0

    out[0] = -a0*invDot;
    out[1] = -a1*invDot;
    out[2] = -a2*invDot;
    out[3] = a3*invDot;
    return out;
};

/**
 * Calculates the conjugate of a quat
 * If the quaternion is normalized, this function is faster than quat.inverse and produces the same result.
 *
 * @param {quat} out the receiving quaternion
 * @param {quat} a quat to calculate conjugate of
 * @returns {quat} out
 */
quat.conjugate = function (out, a) {
    out[0] = -a[0];
    out[1] = -a[1];
    out[2] = -a[2];
    out[3] = a[3];
    return out;
};

/**
 * Calculates the length of a quat
 *
 * @param {quat} a vector to calculate length of
 * @returns {Number} length of a
 * @function
 */
quat.length = vec4.length;

/**
 * Alias for {@link quat.length}
 * @function
 */
quat.len = quat.length;

/**
 * Calculates the squared length of a quat
 *
 * @param {quat} a vector to calculate squared length of
 * @returns {Number} squared length of a
 * @function
 */
quat.squaredLength = vec4.squaredLength;

/**
 * Alias for {@link quat.squaredLength}
 * @function
 */
quat.sqrLen = quat.squaredLength;

/**
 * Normalize a quat
 *
 * @param {quat} out the receiving quaternion
 * @param {quat} a quaternion to normalize
 * @returns {quat} out
 * @function
 */
quat.normalize = vec4.normalize;

/**
 * Creates a quaternion from the given 3x3 rotation matrix.
 *
 * @param {quat} out the receiving quaternion
 * @param {mat3} m rotation matrix
 * @returns {quat} out
 * @function
 */
quat.fromMat3 = (function() {
    var s_iNext = [1,2,0];
    return function(out, m) {
        // Algorithm in Ken Shoemake's article in 1987 SIGGRAPH course notes
        // article "Quaternion Calculus and Fast Animation".
        var fTrace = m[0] + m[4] + m[8];
        var fRoot;

        if ( fTrace > 0.0 ) {
            // |w| > 1/2, may as well choose w > 1/2
            fRoot = Math.sqrt(fTrace + 1.0);  // 2w
            out[3] = 0.5 * fRoot;
            fRoot = 0.5/fRoot;  // 1/(4w)
            out[0] = (m[7]-m[5])*fRoot;
            out[1] = (m[2]-m[6])*fRoot;
            out[2] = (m[3]-m[1])*fRoot;
        } else {
            // |w| <= 1/2
            var i = 0;
            if ( m[4] > m[0] )
              i = 1;
            if ( m[8] > m[i*3+i] )
              i = 2;
            var j = s_iNext[i];
            var k = s_iNext[j];
            
            fRoot = Math.sqrt(m[i*3+i]-m[j*3+j]-m[k*3+k] + 1.0);
            out[i] = 0.5 * fRoot;
            fRoot = 0.5 / fRoot;
            out[3] = (m[k*3+j] - m[j*3+k]) * fRoot;
            out[j] = (m[j*3+i] + m[i*3+j]) * fRoot;
            out[k] = (m[k*3+i] + m[i*3+k]) * fRoot;
        }
        
        return out;
    };
})();

/**
 * Returns a string representation of a quatenion
 *
 * @param {quat} vec vector to represent as a string
 * @returns {String} string representation of the vector
 */
quat.str = function (a) {
    return 'quat(' + a[0] + ', ' + a[1] + ', ' + a[2] + ', ' + a[3] + ')';
};

if(typeof(exports) !== 'undefined') {
    exports.quat = quat;
}
;













  })(shim.exports);
})();

},{}],5:[function(require,module,exports){
'use strict';


var yaml = require('./lib/js-yaml.js');


module.exports = yaml;

},{"./lib/js-yaml.js":6}],6:[function(require,module,exports){
'use strict';


var loader = require('./js-yaml/loader');
var dumper = require('./js-yaml/dumper');


function deprecated(name) {
  return function () {
    throw new Error('Function ' + name + ' is deprecated and cannot be used.');
  };
}


module.exports.Type                = require('./js-yaml/type');
module.exports.Schema              = require('./js-yaml/schema');
module.exports.FAILSAFE_SCHEMA     = require('./js-yaml/schema/failsafe');
module.exports.JSON_SCHEMA         = require('./js-yaml/schema/json');
module.exports.CORE_SCHEMA         = require('./js-yaml/schema/core');
module.exports.DEFAULT_SAFE_SCHEMA = require('./js-yaml/schema/default_safe');
module.exports.DEFAULT_FULL_SCHEMA = require('./js-yaml/schema/default_full');
module.exports.load                = loader.load;
module.exports.loadAll             = loader.loadAll;
module.exports.safeLoad            = loader.safeLoad;
module.exports.safeLoadAll         = loader.safeLoadAll;
module.exports.dump                = dumper.dump;
module.exports.safeDump            = dumper.safeDump;
module.exports.YAMLException       = require('./js-yaml/exception');

// Deprecared schema names from JS-YAML 2.0.x
module.exports.MINIMAL_SCHEMA = require('./js-yaml/schema/failsafe');
module.exports.SAFE_SCHEMA    = require('./js-yaml/schema/default_safe');
module.exports.DEFAULT_SCHEMA = require('./js-yaml/schema/default_full');

// Deprecated functions from JS-YAML 1.x.x
module.exports.scan           = deprecated('scan');
module.exports.parse          = deprecated('parse');
module.exports.compose        = deprecated('compose');
module.exports.addConstructor = deprecated('addConstructor');

},{"./js-yaml/dumper":8,"./js-yaml/exception":9,"./js-yaml/loader":10,"./js-yaml/schema":12,"./js-yaml/schema/core":13,"./js-yaml/schema/default_full":14,"./js-yaml/schema/default_safe":15,"./js-yaml/schema/failsafe":16,"./js-yaml/schema/json":17,"./js-yaml/type":18}],7:[function(require,module,exports){
'use strict';


function isNothing(subject) {
  return (undefined === subject) || (null === subject);
}


function isObject(subject) {
  return ('object' === typeof subject) && (null !== subject);
}


function toArray(sequence) {
  if (Array.isArray(sequence)) {
    return sequence;
  } else if (isNothing(sequence)) {
    return [];
  } else {
    return [ sequence ];
  }
}


function extend(target, source) {
  var index, length, key, sourceKeys;

  if (source) {
    sourceKeys = Object.keys(source);

    for (index = 0, length = sourceKeys.length; index < length; index += 1) {
      key = sourceKeys[index];
      target[key] = source[key];
    }
  }

  return target;
}


function repeat(string, count) {
  var result = '', cycle;

  for (cycle = 0; cycle < count; cycle += 1) {
    result += string;
  }

  return result;
}


function isNegativeZero(number) {
  return (0 === number) && (Number.NEGATIVE_INFINITY === 1 / number);
}


module.exports.isNothing      = isNothing;
module.exports.isObject       = isObject;
module.exports.toArray        = toArray;
module.exports.repeat         = repeat;
module.exports.isNegativeZero = isNegativeZero;
module.exports.extend         = extend;

},{}],8:[function(require,module,exports){
'use strict';


var common              = require('./common');
var YAMLException       = require('./exception');
var DEFAULT_FULL_SCHEMA = require('./schema/default_full');
var DEFAULT_SAFE_SCHEMA = require('./schema/default_safe');


var _toString       = Object.prototype.toString;
var _hasOwnProperty = Object.prototype.hasOwnProperty;


var CHAR_TAB                  = 0x09; /* Tab */
var CHAR_LINE_FEED            = 0x0A; /* LF */
var CHAR_CARRIAGE_RETURN      = 0x0D; /* CR */
var CHAR_SPACE                = 0x20; /* Space */
var CHAR_EXCLAMATION          = 0x21; /* ! */
var CHAR_DOUBLE_QUOTE         = 0x22; /* " */
var CHAR_SHARP                = 0x23; /* # */
var CHAR_PERCENT              = 0x25; /* % */
var CHAR_AMPERSAND            = 0x26; /* & */
var CHAR_SINGLE_QUOTE         = 0x27; /* ' */
var CHAR_ASTERISK             = 0x2A; /* * */
var CHAR_COMMA                = 0x2C; /* , */
var CHAR_MINUS                = 0x2D; /* - */
var CHAR_COLON                = 0x3A; /* : */
var CHAR_GREATER_THAN         = 0x3E; /* > */
var CHAR_QUESTION             = 0x3F; /* ? */
var CHAR_COMMERCIAL_AT        = 0x40; /* @ */
var CHAR_LEFT_SQUARE_BRACKET  = 0x5B; /* [ */
var CHAR_RIGHT_SQUARE_BRACKET = 0x5D; /* ] */
var CHAR_GRAVE_ACCENT         = 0x60; /* ` */
var CHAR_LEFT_CURLY_BRACKET   = 0x7B; /* { */
var CHAR_VERTICAL_LINE        = 0x7C; /* | */
var CHAR_RIGHT_CURLY_BRACKET  = 0x7D; /* } */


var ESCAPE_SEQUENCES = {};

ESCAPE_SEQUENCES[0x00]   = '\\0';
ESCAPE_SEQUENCES[0x07]   = '\\a';
ESCAPE_SEQUENCES[0x08]   = '\\b';
ESCAPE_SEQUENCES[0x09]   = '\\t';
ESCAPE_SEQUENCES[0x0A]   = '\\n';
ESCAPE_SEQUENCES[0x0B]   = '\\v';
ESCAPE_SEQUENCES[0x0C]   = '\\f';
ESCAPE_SEQUENCES[0x0D]   = '\\r';
ESCAPE_SEQUENCES[0x1B]   = '\\e';
ESCAPE_SEQUENCES[0x22]   = '\\"';
ESCAPE_SEQUENCES[0x5C]   = '\\\\';
ESCAPE_SEQUENCES[0x85]   = '\\N';
ESCAPE_SEQUENCES[0xA0]   = '\\_';
ESCAPE_SEQUENCES[0x2028] = '\\L';
ESCAPE_SEQUENCES[0x2029] = '\\P';


var DEPRECATED_BOOLEANS_SYNTAX = [
  'y', 'Y', 'yes', 'Yes', 'YES', 'on', 'On', 'ON',
  'n', 'N', 'no', 'No', 'NO', 'off', 'Off', 'OFF'
];


function compileStyleMap(schema, map) {
  var result, keys, index, length, tag, style, type;

  if (null === map) {
    return {};
  }

  result = {};
  keys = Object.keys(map);

  for (index = 0, length = keys.length; index < length; index += 1) {
    tag = keys[index];
    style = String(map[tag]);

    if ('!!' === tag.slice(0, 2)) {
      tag = 'tag:yaml.org,2002:' + tag.slice(2);
    }

    type = schema.compiledTypeMap[tag];

    if (type && _hasOwnProperty.call(type.styleAliases, style)) {
      style = type.styleAliases[style];
    }

    result[tag] = style;
  }

  return result;
}


function encodeHex(character) {
  var string, handle, length;

  string = character.toString(16).toUpperCase();

  if (character <= 0xFF) {
    handle = 'x';
    length = 2;
  } else if (character <= 0xFFFF) {
    handle = 'u';
    length = 4;
  } else if (character <= 0xFFFFFFFF) {
    handle = 'U';
    length = 8;
  } else {
    throw new YAMLException('code point within a string may not be greater than 0xFFFFFFFF');
  }

  return '\\' + handle + common.repeat('0', length - string.length) + string;
}


function State(options) {
  this.schema      = options['schema'] || DEFAULT_FULL_SCHEMA;
  this.indent      = Math.max(1, (options['indent'] || 2));
  this.skipInvalid = options['skipInvalid'] || false;
  this.flowLevel   = (common.isNothing(options['flowLevel']) ? -1 : options['flowLevel']);
  this.styleMap    = compileStyleMap(this.schema, options['styles'] || null);

  this.implicitTypes = this.schema.compiledImplicit;
  this.explicitTypes = this.schema.compiledExplicit;

  this.tag = null;
  this.result = '';
}


function generateNextLine(state, level) {
  return '\n' + common.repeat(' ', state.indent * level);
}

function testImplicitResolving(state, str) {
  var index, length, type;

  for (index = 0, length = state.implicitTypes.length; index < length; index += 1) {
    type = state.implicitTypes[index];

    if (type.resolve(str)) {
      return true;
    }
  }

  return false;
}

function writeScalar(state, object) {
  var isQuoted, checkpoint, position, length, character, first;

  state.dump = '';
  isQuoted = false;
  checkpoint = 0;
  first = object.charCodeAt(0) || 0;

  if (-1 !== DEPRECATED_BOOLEANS_SYNTAX.indexOf(object)) {
    // Ensure compatibility with YAML 1.0/1.1 loaders.
    isQuoted = true;
  } else if (0 === object.length) {
    // Quote empty string
    isQuoted = true;
  } else if (CHAR_SPACE    === first ||
             CHAR_SPACE    === object.charCodeAt(object.length - 1)) {
    isQuoted = true;
  } else if (CHAR_MINUS    === first ||
             CHAR_QUESTION === first) {
    // Don't check second symbol for simplicity
    isQuoted = true;
  }

  for (position = 0, length = object.length; position < length; position += 1) {
    character = object.charCodeAt(position);

    if (!isQuoted) {
      if (CHAR_TAB                  === character ||
          CHAR_LINE_FEED            === character ||
          CHAR_CARRIAGE_RETURN      === character ||
          CHAR_COMMA                === character ||
          CHAR_LEFT_SQUARE_BRACKET  === character ||
          CHAR_RIGHT_SQUARE_BRACKET === character ||
          CHAR_LEFT_CURLY_BRACKET   === character ||
          CHAR_RIGHT_CURLY_BRACKET  === character ||
          CHAR_SHARP                === character ||
          CHAR_AMPERSAND            === character ||
          CHAR_ASTERISK             === character ||
          CHAR_EXCLAMATION          === character ||
          CHAR_VERTICAL_LINE        === character ||
          CHAR_GREATER_THAN         === character ||
          CHAR_SINGLE_QUOTE         === character ||
          CHAR_DOUBLE_QUOTE         === character ||
          CHAR_PERCENT              === character ||
          CHAR_COMMERCIAL_AT        === character ||
          CHAR_COLON                === character ||
          CHAR_GRAVE_ACCENT         === character) {
        isQuoted = true;
      }
    }

    if (ESCAPE_SEQUENCES[character] ||
        !((0x00020 <= character && character <= 0x00007E) ||
          (0x00085 === character)                         ||
          (0x000A0 <= character && character <= 0x00D7FF) ||
          (0x0E000 <= character && character <= 0x00FFFD) ||
          (0x10000 <= character && character <= 0x10FFFF))) {
      state.dump += object.slice(checkpoint, position);
      state.dump += ESCAPE_SEQUENCES[character] || encodeHex(character);
      checkpoint = position + 1;
      isQuoted = true;
    }
  }

  if (checkpoint < position) {
    state.dump += object.slice(checkpoint, position);
  }

  if (!isQuoted && testImplicitResolving(state, state.dump)) {
    isQuoted = true;
  }

  if (isQuoted) {
    state.dump = '"' + state.dump + '"';
  }
}

function writeFlowSequence(state, level, object) {
  var _result = '',
      _tag    = state.tag,
      index,
      length;

  for (index = 0, length = object.length; index < length; index += 1) {
    // Write only valid elements.
    if (writeNode(state, level, object[index], false, false)) {
      if (0 !== index) {
        _result += ', ';
      }
      _result += state.dump;
    }
  }

  state.tag = _tag;
  state.dump = '[' + _result + ']';
}

function writeBlockSequence(state, level, object, compact) {
  var _result = '',
      _tag    = state.tag,
      index,
      length;

  for (index = 0, length = object.length; index < length; index += 1) {
    // Write only valid elements.
    if (writeNode(state, level + 1, object[index], true, true)) {
      if (!compact || 0 !== index) {
        _result += generateNextLine(state, level);
      }
      _result += '- ' + state.dump;
    }
  }

  state.tag = _tag;
  state.dump = _result || '[]'; // Empty sequence if no valid values.
}

function writeFlowMapping(state, level, object) {
  var _result       = '',
      _tag          = state.tag,
      objectKeyList = Object.keys(object),
      index,
      length,
      objectKey,
      objectValue,
      pairBuffer;

  for (index = 0, length = objectKeyList.length; index < length; index += 1) {
    pairBuffer = '';

    if (0 !== index) {
      pairBuffer += ', ';
    }

    objectKey = objectKeyList[index];
    objectValue = object[objectKey];

    if (!writeNode(state, level, objectKey, false, false)) {
      continue; // Skip this pair because of invalid key;
    }

    if (state.dump.length > 1024) {
      pairBuffer += '? ';
    }

    pairBuffer += state.dump + ': ';

    if (!writeNode(state, level, objectValue, false, false)) {
      continue; // Skip this pair because of invalid value.
    }

    pairBuffer += state.dump;

    // Both key and value are valid.
    _result += pairBuffer;
  }

  state.tag = _tag;
  state.dump = '{' + _result + '}';
}

function writeBlockMapping(state, level, object, compact) {
  var _result       = '',
      _tag          = state.tag,
      objectKeyList = Object.keys(object),
      index,
      length,
      objectKey,
      objectValue,
      explicitPair,
      pairBuffer;

  for (index = 0, length = objectKeyList.length; index < length; index += 1) {
    pairBuffer = '';

    if (!compact || 0 !== index) {
      pairBuffer += generateNextLine(state, level);
    }

    objectKey = objectKeyList[index];
    objectValue = object[objectKey];

    if (!writeNode(state, level + 1, objectKey, true, true)) {
      continue; // Skip this pair because of invalid key.
    }

    explicitPair = (null !== state.tag && '?' !== state.tag) ||
                   (state.dump && state.dump.length > 1024);

    if (explicitPair) {
      if (state.dump && CHAR_LINE_FEED === state.dump.charCodeAt(0)) {
        pairBuffer += '?';
      } else {
        pairBuffer += '? ';
      }
    }

    pairBuffer += state.dump;

    if (explicitPair) {
      pairBuffer += generateNextLine(state, level);
    }

    if (!writeNode(state, level + 1, objectValue, true, explicitPair)) {
      continue; // Skip this pair because of invalid value.
    }

    if (state.dump && CHAR_LINE_FEED === state.dump.charCodeAt(0)) {
      pairBuffer += ':';
    } else {
      pairBuffer += ': ';
    }

    pairBuffer += state.dump;

    // Both key and value are valid.
    _result += pairBuffer;
  }

  state.tag = _tag;
  state.dump = _result || '{}'; // Empty mapping if no valid pairs.
}

function detectType(state, object, explicit) {
  var _result, typeList, index, length, type, style;

  typeList = explicit ? state.explicitTypes : state.implicitTypes;

  for (index = 0, length = typeList.length; index < length; index += 1) {
    type = typeList[index];

    if ((type.instanceOf  || type.predicate) &&
        (!type.instanceOf || (('object' === typeof object) && (object instanceof type.instanceOf))) &&
        (!type.predicate  || type.predicate(object))) {

      state.tag = explicit ? type.tag : '?';

      if (type.represent) {
        style = state.styleMap[type.tag] || type.defaultStyle;

        if ('[object Function]' === _toString.call(type.represent)) {
          _result = type.represent(object, style);
        } else if (_hasOwnProperty.call(type.represent, style)) {
          _result = type.represent[style](object, style);
        } else {
          throw new YAMLException('!<' + type.tag + '> tag resolver accepts not "' + style + '" style');
        }

        state.dump = _result;
      }

      return true;
    }
  }

  return false;
}

// Serializes `object` and writes it to global `result`.
// Returns true on success, or false on invalid object.
//
function writeNode(state, level, object, block, compact) {
  state.tag = null;
  state.dump = object;

  if (!detectType(state, object, false)) {
    detectType(state, object, true);
  }

  var type = _toString.call(state.dump);

  if (block) {
    block = (0 > state.flowLevel || state.flowLevel > level);
  }

  if ((null !== state.tag && '?' !== state.tag) || (2 !== state.indent && level > 0)) {
    compact = false;
  }

  if ('[object Object]' === type) {
    if (block && (0 !== Object.keys(state.dump).length)) {
      writeBlockMapping(state, level, state.dump, compact);
    } else {
      writeFlowMapping(state, level, state.dump);
    }
  } else if ('[object Array]' === type) {
    if (block && (0 !== state.dump.length)) {
      writeBlockSequence(state, level, state.dump, compact);
    } else {
      writeFlowSequence(state, level, state.dump);
    }
  } else if ('[object String]' === type) {
    if ('?' !== state.tag) {
      writeScalar(state, state.dump);
    }
  } else if (state.skipInvalid) {
    return false;
  } else {
    throw new YAMLException('unacceptable kind of an object to dump ' + type);
  }

  if (null !== state.tag && '?' !== state.tag) {
    state.dump = '!<' + state.tag + '> ' + state.dump;
  }
  return true;
}


function dump(input, options) {
  options = options || {};

  var state = new State(options);

  if (writeNode(state, 0, input, true, true)) {
    return state.dump + '\n';
  } else {
    return '';
  }
}


function safeDump(input, options) {
  return dump(input, common.extend({ schema: DEFAULT_SAFE_SCHEMA }, options));
}


module.exports.dump     = dump;
module.exports.safeDump = safeDump;

},{"./common":7,"./exception":9,"./schema/default_full":14,"./schema/default_safe":15}],9:[function(require,module,exports){
'use strict';


function YAMLException(reason, mark) {
  this.name    = 'YAMLException';
  this.reason  = reason;
  this.mark    = mark;
  this.message = this.toString(false);
}


YAMLException.prototype.toString = function toString(compact) {
  var result;

  result = 'JS-YAML: ' + (this.reason || '(unknown reason)');

  if (!compact && this.mark) {
    result += ' ' + this.mark.toString();
  }

  return result;
};


module.exports = YAMLException;

},{}],10:[function(require,module,exports){
'use strict';


var common              = require('./common');
var YAMLException       = require('./exception');
var Mark                = require('./mark');
var DEFAULT_SAFE_SCHEMA = require('./schema/default_safe');
var DEFAULT_FULL_SCHEMA = require('./schema/default_full');


var _hasOwnProperty = Object.prototype.hasOwnProperty;


var CONTEXT_FLOW_IN   = 1;
var CONTEXT_FLOW_OUT  = 2;
var CONTEXT_BLOCK_IN  = 3;
var CONTEXT_BLOCK_OUT = 4;


var CHOMPING_CLIP  = 1;
var CHOMPING_STRIP = 2;
var CHOMPING_KEEP  = 3;


var PATTERN_NON_PRINTABLE         = /[\x00-\x08\x0B\x0C\x0E-\x1F\x7F-\x84\x86-\x9F\uD800-\uDFFF\uFFFE\uFFFF]/;
var PATTERN_NON_ASCII_LINE_BREAKS = /[\x85\u2028\u2029]/;
var PATTERN_FLOW_INDICATORS       = /[,\[\]\{\}]/;
var PATTERN_TAG_HANDLE            = /^(?:!|!!|![a-z\-]+!)$/i;
var PATTERN_TAG_URI               = /^(?:!|[^,\[\]\{\}])(?:%[0-9a-f]{2}|[0-9a-z\-#;\/\?:@&=\+\$,_\.!~\*'\(\)\[\]])*$/i;


function is_EOL(c) {
  return (c === 0x0A/* LF */) || (c === 0x0D/* CR */);
}

function is_WHITE_SPACE(c) {
  return (c === 0x09/* Tab */) || (c === 0x20/* Space */);
}

function is_WS_OR_EOL(c) {
  return (c === 0x09/* Tab */) ||
         (c === 0x20/* Space */) ||
         (c === 0x0A/* LF */) ||
         (c === 0x0D/* CR */);
}

function is_FLOW_INDICATOR(c) {
  return 0x2C/* , */ === c ||
         0x5B/* [ */ === c ||
         0x5D/* ] */ === c ||
         0x7B/* { */ === c ||
         0x7D/* } */ === c;
}

function fromHexCode(c) {
  var lc;

  if ((0x30/* 0 */ <= c) && (c <= 0x39/* 9 */)) {
    return c - 0x30;
  }

  lc = c | 0x20;
  if ((0x61/* a */ <= lc) && (lc <= 0x66/* f */)) {
    return lc - 0x61 + 10;
  }

  return -1;
}

function escapedHexLen(c) {
  if (c === 0x78/* x */) { return 2; }
  if (c === 0x75/* u */) { return 4; }
  if (c === 0x55/* U */) { return 8; }
  return 0;
}

function fromDecimalCode(c) {
  if ((0x30/* 0 */ <= c) && (c <= 0x39/* 9 */)) {
    return c - 0x30;
  }

  return -1;
}

function simpleEscapeSequence(c) {
 return (c === 0x30/* 0 */) ? '\x00' :
        (c === 0x61/* a */) ? '\x07' :
        (c === 0x62/* b */) ? '\x08' :
        (c === 0x74/* t */) ? '\x09' :
        (c === 0x09/* Tab */) ? '\x09' :
        (c === 0x6E/* n */) ? '\x0A' :
        (c === 0x76/* v */) ? '\x0B' :
        (c === 0x66/* f */) ? '\x0C' :
        (c === 0x72/* r */) ? '\x0D' :
        (c === 0x65/* e */) ? '\x1B' :
        (c === 0x20/* Space */) ? ' ' :
        (c === 0x22/* " */) ? '\x22' :
        (c === 0x2F/* / */) ? '/' :
        (c === 0x5C/* \ */) ? '\x5C' :
        (c === 0x4E/* N */) ? '\x85' :
        (c === 0x5F/* _ */) ? '\xA0' :
        (c === 0x4C/* L */) ? '\u2028' :
        (c === 0x50/* P */) ? '\u2029' : '';
}

var simpleEscapeCheck = new Array(256); // integer, for fast access
var simpleEscapeMap = new Array(256);
for (var i = 0; i < 256; i++) {
  simpleEscapeCheck[i] = simpleEscapeSequence(i) ? 1 : 0;
  simpleEscapeMap[i] = simpleEscapeSequence(i);
}


function State(input, options) {
  this.input = input;

  this.filename  = options['filename']  || null;
  this.schema    = options['schema']    || DEFAULT_FULL_SCHEMA;
  this.onWarning = options['onWarning'] || null;
  this.legacy    = options['legacy']    || false;

  this.implicitTypes = this.schema.compiledImplicit;
  this.typeMap       = this.schema.compiledTypeMap;

  this.length     = input.length;
  this.position   = 0;
  this.line       = 0;
  this.lineStart  = 0;
  this.lineIndent = 0;

  this.documents = [];

  /*
  this.version;
  this.checkLineBreaks;
  this.tagMap;
  this.anchorMap;
  this.tag;
  this.anchor;
  this.kind;
  this.result;*/

}


function generateError(state, message) {
  return new YAMLException(
    message,
    new Mark(state.filename, state.input, state.position, state.line, (state.position - state.lineStart)));
}

function throwError(state, message) {
  throw generateError(state, message);
}

function throwWarning(state, message) {
  var error = generateError(state, message);

  if (state.onWarning) {
    state.onWarning.call(null, error);
  } else {
    throw error;
  }
}


var directiveHandlers = {

  'YAML': function handleYamlDirective(state, name, args) {

      var match, major, minor;

      if (null !== state.version) {
        throwError(state, 'duplication of %YAML directive');
      }

      if (1 !== args.length) {
        throwError(state, 'YAML directive accepts exactly one argument');
      }

      match = /^([0-9]+)\.([0-9]+)$/.exec(args[0]);

      if (null === match) {
        throwError(state, 'ill-formed argument of the YAML directive');
      }

      major = parseInt(match[1], 10);
      minor = parseInt(match[2], 10);

      if (1 !== major) {
        throwError(state, 'unacceptable YAML version of the document');
      }

      state.version = args[0];
      state.checkLineBreaks = (minor < 2);

      if (1 !== minor && 2 !== minor) {
        throwWarning(state, 'unsupported YAML version of the document');
      }
    },

  'TAG': function handleTagDirective(state, name, args) {

      var handle, prefix;

      if (2 !== args.length) {
        throwError(state, 'TAG directive accepts exactly two arguments');
      }

      handle = args[0];
      prefix = args[1];

      if (!PATTERN_TAG_HANDLE.test(handle)) {
        throwError(state, 'ill-formed tag handle (first argument) of the TAG directive');
      }

      if (_hasOwnProperty.call(state.tagMap, handle)) {
        throwError(state, 'there is a previously declared suffix for "' + handle + '" tag handle');
      }

      if (!PATTERN_TAG_URI.test(prefix)) {
        throwError(state, 'ill-formed tag prefix (second argument) of the TAG directive');
      }

      state.tagMap[handle] = prefix;
    }
};


function captureSegment(state, start, end, checkJson) {
  var _position, _length, _character, _result;

  if (start < end) {
    _result = state.input.slice(start, end);

    if (checkJson) {
      for (_position = 0, _length = _result.length;
           _position < _length;
           _position += 1) {
        _character = _result.charCodeAt(_position);
        if (!(0x09 === _character ||
              0x20 <= _character && _character <= 0x10FFFF)) {
          throwError(state, 'expected valid JSON character');
        }
      }
    }

    state.result += _result;
  }
}

function mergeMappings(state, destination, source) {
  var sourceKeys, key, index, quantity;

  if (!common.isObject(source)) {
    throwError(state, 'cannot merge mappings; the provided source object is unacceptable');
  }

  sourceKeys = Object.keys(source);

  for (index = 0, quantity = sourceKeys.length; index < quantity; index += 1) {
    key = sourceKeys[index];

    if (!_hasOwnProperty.call(destination, key)) {
      destination[key] = source[key];
    }
  }
}

function storeMappingPair(state, _result, keyTag, keyNode, valueNode) {
  var index, quantity;

  keyNode = String(keyNode);

  if (null === _result) {
    _result = {};
  }

  if ('tag:yaml.org,2002:merge' === keyTag) {
    if (Array.isArray(valueNode)) {
      for (index = 0, quantity = valueNode.length; index < quantity; index += 1) {
        mergeMappings(state, _result, valueNode[index]);
      }
    } else {
      mergeMappings(state, _result, valueNode);
    }
  } else {
    _result[keyNode] = valueNode;
  }

  return _result;
}

function readLineBreak(state) {
  var ch;

  ch = state.input.charCodeAt(state.position);

  if (0x0A/* LF */ === ch) {
    state.position++;
  } else if (0x0D/* CR */ === ch) {
    state.position++;
    if (0x0A/* LF */ === state.input.charCodeAt(state.position)) {
      state.position++;
    }
  } else {
    throwError(state, 'a line break is expected');
  }

  state.line += 1;
  state.lineStart = state.position;
}

function skipSeparationSpace(state, allowComments, checkIndent) {
  var lineBreaks = 0,
      ch = state.input.charCodeAt(state.position);

  while (0 !== ch) {
    while (is_WHITE_SPACE(ch)) {
      ch = state.input.charCodeAt(++state.position);
    }

    if (allowComments && 0x23/* # */ === ch) {
      do {
        ch = state.input.charCodeAt(++state.position);
      } while (ch !== 0x0A/* LF */ && ch !== 0x0D/* CR */ && 0 !== ch);
    }

    if (is_EOL(ch)) {
      readLineBreak(state);

      ch = state.input.charCodeAt(state.position);
      lineBreaks++;
      state.lineIndent = 0;

      while (0x20/* Space */ === ch) {
        state.lineIndent++;
        ch = state.input.charCodeAt(++state.position);
      }

      if (state.lineIndent < checkIndent) {
        throwWarning(state, 'deficient indentation');
      }
    } else {
      break;
    }
  }

  return lineBreaks;
}

function testDocumentSeparator(state) {
  var _position = state.position,
      ch;

  ch = state.input.charCodeAt(_position);

  // Condition state.position === state.lineStart is tested
  // in parent on each call, for efficiency. No needs to test here again.
  if ((0x2D/* - */ === ch || 0x2E/* . */ === ch) &&
      state.input.charCodeAt(_position + 1) === ch &&
      state.input.charCodeAt(_position+ 2) === ch) {

    _position += 3;

    ch = state.input.charCodeAt(_position);

    if (ch === 0 || is_WS_OR_EOL(ch)) {
      return true;
    }
  }

  return false;
}

function writeFoldedLines(state, count) {
  if (1 === count) {
    state.result += ' ';
  } else if (count > 1) {
    state.result += common.repeat('\n', count - 1);
  }
}


function readPlainScalar(state, nodeIndent, withinFlowCollection) {
  var preceding,
      following,
      captureStart,
      captureEnd,
      hasPendingContent,
      _line,
      _lineStart,
      _lineIndent,
      _kind = state.kind,
      _result = state.result,
      ch;

  ch = state.input.charCodeAt(state.position);

  if (is_WS_OR_EOL(ch)             ||
      is_FLOW_INDICATOR(ch)        ||
      0x23/* # */           === ch ||
      0x26/* & */           === ch ||
      0x2A/* * */           === ch ||
      0x21/* ! */           === ch ||
      0x7C/* | */           === ch ||
      0x3E/* > */           === ch ||
      0x27/* ' */           === ch ||
      0x22/* " */           === ch ||
      0x25/* % */           === ch ||
      0x40/* @ */           === ch ||
      0x60/* ` */           === ch) {
    return false;
  }

  if (0x3F/* ? */ === ch || 0x2D/* - */ === ch) {
    following = state.input.charCodeAt(state.position + 1);

    if (is_WS_OR_EOL(following) ||
        withinFlowCollection && is_FLOW_INDICATOR(following)) {
      return false;
    }
  }

  state.kind = 'scalar';
  state.result = '';
  captureStart = captureEnd = state.position;
  hasPendingContent = false;

  while (0 !== ch) {
    if (0x3A/* : */ === ch) {
      following = state.input.charCodeAt(state.position+1);

      if (is_WS_OR_EOL(following) ||
          withinFlowCollection && is_FLOW_INDICATOR(following)) {
        break;
      }

    } else if (0x23/* # */ === ch) {
      preceding = state.input.charCodeAt(state.position - 1);

      if (is_WS_OR_EOL(preceding)) {
        break;
      }

    } else if ((state.position === state.lineStart && testDocumentSeparator(state)) ||
               withinFlowCollection && is_FLOW_INDICATOR(ch)) {
      break;

    } else if (is_EOL(ch)) {
      _line = state.line;
      _lineStart = state.lineStart;
      _lineIndent = state.lineIndent;
      skipSeparationSpace(state, false, -1);

      if (state.lineIndent >= nodeIndent) {
        hasPendingContent = true;
        ch = state.input.charCodeAt(state.position);
        continue;
      } else {
        state.position = captureEnd;
        state.line = _line;
        state.lineStart = _lineStart;
        state.lineIndent = _lineIndent;
        break;
      }
    }

    if (hasPendingContent) {
      captureSegment(state, captureStart, captureEnd, false);
      writeFoldedLines(state, state.line - _line);
      captureStart = captureEnd = state.position;
      hasPendingContent = false;
    }

    if (!is_WHITE_SPACE(ch)) {
      captureEnd = state.position + 1;
    }

    ch = state.input.charCodeAt(++state.position);
  }

  captureSegment(state, captureStart, captureEnd, false);

  if (state.result) {
    return true;
  } else {
    state.kind = _kind;
    state.result = _result;
    return false;
  }
}

function readSingleQuotedScalar(state, nodeIndent) {
  var ch,
      captureStart, captureEnd;

  ch = state.input.charCodeAt(state.position);

  if (0x27/* ' */ !== ch) {
    return false;
  }

  state.kind = 'scalar';
  state.result = '';
  state.position++;
  captureStart = captureEnd = state.position;

  while (0 !== (ch = state.input.charCodeAt(state.position))) {
    if (0x27/* ' */ === ch) {
      captureSegment(state, captureStart, state.position, true);
      ch = state.input.charCodeAt(++state.position);

      if (0x27/* ' */ === ch) {
        captureStart = captureEnd = state.position;
        state.position++;
      } else {
        return true;
      }

    } else if (is_EOL(ch)) {
      captureSegment(state, captureStart, captureEnd, true);
      writeFoldedLines(state, skipSeparationSpace(state, false, nodeIndent));
      captureStart = captureEnd = state.position;

    } else if (state.position === state.lineStart && testDocumentSeparator(state)) {
      throwError(state, 'unexpected end of the document within a single quoted scalar');

    } else {
      state.position++;
      captureEnd = state.position;
    }
  }

  throwError(state, 'unexpected end of the stream within a single quoted scalar');
}

function readDoubleQuotedScalar(state, nodeIndent) {
  var captureStart,
      captureEnd,
      hexLength,
      hexResult,
      tmp, tmpEsc,
      ch;

  ch = state.input.charCodeAt(state.position);

  if (0x22/* " */ !== ch) {
    return false;
  }

  state.kind = 'scalar';
  state.result = '';
  state.position++;
  captureStart = captureEnd = state.position;

  while (0 !== (ch = state.input.charCodeAt(state.position))) {
    if (0x22/* " */ === ch) {
      captureSegment(state, captureStart, state.position, true);
      state.position++;
      return true;

    } else if (0x5C/* \ */ === ch) {
      captureSegment(state, captureStart, state.position, true);
      ch = state.input.charCodeAt(++state.position);

      if (is_EOL(ch)) {
        skipSeparationSpace(state, false, nodeIndent);

        //TODO: rework to inline fn with no type cast?
      } else if (ch < 256 && simpleEscapeCheck[ch]) {
        state.result += simpleEscapeMap[ch];
        state.position++;

      } else if ((tmp = escapedHexLen(ch)) > 0) {
        hexLength = tmp;
        hexResult = 0;

        for (; hexLength > 0; hexLength--) {
          ch = state.input.charCodeAt(++state.position);

          if ((tmp = fromHexCode(ch)) >= 0) {
            hexResult = (hexResult << 4) + tmp;

          } else {
            throwError(state, 'expected hexadecimal character');
          }
        }

        state.result += String.fromCharCode(hexResult);
        state.position++;

      } else {
        throwError(state, 'unknown escape sequence');
      }

      captureStart = captureEnd = state.position;

    } else if (is_EOL(ch)) {
      captureSegment(state, captureStart, captureEnd, true);
      writeFoldedLines(state, skipSeparationSpace(state, false, nodeIndent));
      captureStart = captureEnd = state.position;

    } else if (state.position === state.lineStart && testDocumentSeparator(state)) {
      throwError(state, 'unexpected end of the document within a double quoted scalar');

    } else {
      state.position++;
      captureEnd = state.position;
    }
  }

  throwError(state, 'unexpected end of the stream within a double quoted scalar');
}

function readFlowCollection(state, nodeIndent) {
  var readNext = true,
      _line,
      _tag     = state.tag,
      _result,
      following,
      terminator,
      isPair,
      isExplicitPair,
      isMapping,
      keyNode,
      keyTag,
      valueNode,
      ch;

  ch = state.input.charCodeAt(state.position);

  if (ch === 0x5B/* [ */) {
    terminator = 0x5D/* ] */;
    isMapping = false;
    _result = [];
  } else if (ch === 0x7B/* { */) {
    terminator = 0x7D/* } */;
    isMapping = true;
    _result = {};
  } else {
    return false;
  }

  if (null !== state.anchor) {
    state.anchorMap[state.anchor] = _result;
  }

  ch = state.input.charCodeAt(++state.position);

  while (0 !== ch) {
    skipSeparationSpace(state, true, nodeIndent);

    ch = state.input.charCodeAt(state.position);

    if (ch === terminator) {
      state.position++;
      state.tag = _tag;
      state.kind = isMapping ? 'mapping' : 'sequence';
      state.result = _result;
      return true;
    } else if (!readNext) {
      throwError(state, 'missed comma between flow collection entries');
    }

    keyTag = keyNode = valueNode = null;
    isPair = isExplicitPair = false;

    if (0x3F/* ? */ === ch) {
      following = state.input.charCodeAt(state.position + 1);

      if (is_WS_OR_EOL(following)) {
        isPair = isExplicitPair = true;
        state.position++;
        skipSeparationSpace(state, true, nodeIndent);
      }
    }

    _line = state.line;
    composeNode(state, nodeIndent, CONTEXT_FLOW_IN, false, true);
    keyTag = state.tag;
    keyNode = state.result;
    skipSeparationSpace(state, true, nodeIndent);

    ch = state.input.charCodeAt(state.position);

    if ((isExplicitPair || state.line === _line) && 0x3A/* : */ === ch) {
      isPair = true;
      ch = state.input.charCodeAt(++state.position);
      skipSeparationSpace(state, true, nodeIndent);
      composeNode(state, nodeIndent, CONTEXT_FLOW_IN, false, true);
      valueNode = state.result;
    }

    if (isMapping) {
      storeMappingPair(state, _result, keyTag, keyNode, valueNode);
    } else if (isPair) {
      _result.push(storeMappingPair(state, null, keyTag, keyNode, valueNode));
    } else {
      _result.push(keyNode);
    }

    skipSeparationSpace(state, true, nodeIndent);

    ch = state.input.charCodeAt(state.position);

    if (0x2C/* , */ === ch) {
      readNext = true;
      ch = state.input.charCodeAt(++state.position);
    } else {
      readNext = false;
    }
  }

  throwError(state, 'unexpected end of the stream within a flow collection');
}

function readBlockScalar(state, nodeIndent) {
  var captureStart,
      folding,
      chomping       = CHOMPING_CLIP,
      detectedIndent = false,
      textIndent     = nodeIndent,
      emptyLines     = 0,
      atMoreIndented = false,
      tmp,
      ch;

  ch = state.input.charCodeAt(state.position);

  if (ch === 0x7C/* | */) {
    folding = false;
  } else if (ch === 0x3E/* > */) {
    folding = true;
  } else {
    return false;
  }

  state.kind = 'scalar';
  state.result = '';

  while (0 !== ch) {
    ch = state.input.charCodeAt(++state.position);

    if (0x2B/* + */ === ch || 0x2D/* - */ === ch) {
      if (CHOMPING_CLIP === chomping) {
        chomping = (0x2B/* + */ === ch) ? CHOMPING_KEEP : CHOMPING_STRIP;
      } else {
        throwError(state, 'repeat of a chomping mode identifier');
      }

    } else if ((tmp = fromDecimalCode(ch)) >= 0) {
      if (tmp === 0) {
        throwError(state, 'bad explicit indentation width of a block scalar; it cannot be less than one');
      } else if (!detectedIndent) {
        textIndent = nodeIndent + tmp - 1;
        detectedIndent = true;
      } else {
        throwError(state, 'repeat of an indentation width identifier');
      }

    } else {
      break;
    }
  }

  if (is_WHITE_SPACE(ch)) {
    do { ch = state.input.charCodeAt(++state.position); }
    while (is_WHITE_SPACE(ch));

    if (0x23/* # */ === ch) {
      do { ch = state.input.charCodeAt(++state.position); }
      while (!is_EOL(ch) && (0 !== ch));
    }
  }

  while (0 !== ch) {
    readLineBreak(state);
    state.lineIndent = 0;

    ch = state.input.charCodeAt(state.position);

    while ((!detectedIndent || state.lineIndent < textIndent) &&
           (0x20/* Space */ === ch)) {
      state.lineIndent++;
      ch = state.input.charCodeAt(++state.position);
    }

    if (!detectedIndent && state.lineIndent > textIndent) {
      textIndent = state.lineIndent;
    }

    if (is_EOL(ch)) {
      emptyLines++;
      continue;
    }

    // End of the scalar.
    if (state.lineIndent < textIndent) {

      // Perform the chomping.
      if (chomping === CHOMPING_KEEP) {
        state.result += common.repeat('\n', emptyLines);
      } else if (chomping === CHOMPING_CLIP) {
        if (detectedIndent) { // i.e. only if the scalar is not empty.
          state.result += '\n';
        }
      }

      // Break this `while` cycle and go to the funciton's epilogue.
      break;
    }

    // Folded style: use fancy rules to handle line breaks.
    if (folding) {

      // Lines starting with white space characters (more-indented lines) are not folded.
      if (is_WHITE_SPACE(ch)) {
        atMoreIndented = true;
        state.result += common.repeat('\n', emptyLines + 1);

      // End of more-indented block.
      } else if (atMoreIndented) {
        atMoreIndented = false;
        state.result += common.repeat('\n', emptyLines + 1);

      // Just one line break - perceive as the same line.
      } else if (0 === emptyLines) {
        if (detectedIndent) { // i.e. only if we have already read some scalar content.
          state.result += ' ';
        }

      // Several line breaks - perceive as different lines.
      } else {
        state.result += common.repeat('\n', emptyLines);
      }

    // Literal style: just add exact number of line breaks between content lines.
    } else {

      // If current line isn't the first one - count line break from the last content line.
      if (detectedIndent) {
        state.result += common.repeat('\n', emptyLines + 1);

      // In case of the first content line - count only empty lines.
      } else {
        state.result += common.repeat('\n', emptyLines);
      }
    }

    detectedIndent = true;
    emptyLines = 0;
    captureStart = state.position;

    while (!is_EOL(ch) && (0 !== ch))
    { ch = state.input.charCodeAt(++state.position); }

    captureSegment(state, captureStart, state.position, false);
  }

  return true;
}

function readBlockSequence(state, nodeIndent) {
  var _line,
      _tag      = state.tag,
      _result   = [],
      following,
      detected  = false,
      ch;

  if (null !== state.anchor) {
    state.anchorMap[state.anchor] = _result;
  }

  ch = state.input.charCodeAt(state.position);

  while (0 !== ch) {

    if (0x2D/* - */ !== ch) {
      break;
    }

    following = state.input.charCodeAt(state.position + 1);

    if (!is_WS_OR_EOL(following)) {
      break;
    }

    detected = true;
    state.position++;

    if (skipSeparationSpace(state, true, -1)) {
      if (state.lineIndent <= nodeIndent) {
        _result.push(null);
        ch = state.input.charCodeAt(state.position);
        continue;
      }
    }

    _line = state.line;
    composeNode(state, nodeIndent, CONTEXT_BLOCK_IN, false, true);
    _result.push(state.result);
    skipSeparationSpace(state, true, -1);

    ch = state.input.charCodeAt(state.position);

    if ((state.line === _line || state.lineIndent > nodeIndent) && (0 !== ch)) {
      throwError(state, 'bad indentation of a sequence entry');
    } else if (state.lineIndent < nodeIndent) {
      break;
    }
  }

  if (detected) {
    state.tag = _tag;
    state.kind = 'sequence';
    state.result = _result;
    return true;
  } else {
    return false;
  }
}

function readBlockMapping(state, nodeIndent, flowIndent) {
  var following,
      allowCompact,
      _line,
      _tag          = state.tag,
      _result       = {},
      keyTag        = null,
      keyNode       = null,
      valueNode     = null,
      atExplicitKey = false,
      detected      = false,
      ch;

  if (null !== state.anchor) {
    state.anchorMap[state.anchor] = _result;
  }

  ch = state.input.charCodeAt(state.position);

  while (0 !== ch) {
    following = state.input.charCodeAt(state.position + 1);
    _line = state.line; // Save the current line.

    //
    // Explicit notation case. There are two separate blocks:
    // first for the key (denoted by "?") and second for the value (denoted by ":")
    //
    if ((0x3F/* ? */ === ch || 0x3A/* : */  === ch) && is_WS_OR_EOL(following)) {

      if (0x3F/* ? */ === ch) {
        if (atExplicitKey) {
          storeMappingPair(state, _result, keyTag, keyNode, null);
          keyTag = keyNode = valueNode = null;
        }

        detected = true;
        atExplicitKey = true;
        allowCompact = true;

      } else if (atExplicitKey) {
        // i.e. 0x3A/* : */ === character after the explicit key.
        atExplicitKey = false;
        allowCompact = true;

      } else {
        throwError(state, 'incomplete explicit mapping pair; a key node is missed');
      }

      state.position += 1;
      ch = following;

    //
    // Implicit notation case. Flow-style node as the key first, then ":", and the value.
    //
    } else if (composeNode(state, flowIndent, CONTEXT_FLOW_OUT, false, true)) {

      if (state.line === _line) {
        ch = state.input.charCodeAt(state.position);

        while (is_WHITE_SPACE(ch)) {
          ch = state.input.charCodeAt(++state.position);
        }

        if (0x3A/* : */ === ch) {
          ch = state.input.charCodeAt(++state.position);

          if (!is_WS_OR_EOL(ch)) {
            throwError(state, 'a whitespace character is expected after the key-value separator within a block mapping');
          }

          if (atExplicitKey) {
            storeMappingPair(state, _result, keyTag, keyNode, null);
            keyTag = keyNode = valueNode = null;
          }

          detected = true;
          atExplicitKey = false;
          allowCompact = false;
          keyTag = state.tag;
          keyNode = state.result;

        } else if (detected) {
          throwError(state, 'can not read an implicit mapping pair; a colon is missed');

        } else {
          state.tag = _tag;
          return true; // Keep the result of `composeNode`.
        }

      } else if (detected) {
        throwError(state, 'can not read a block mapping entry; a multiline key may not be an implicit key');

      } else {
        state.tag = _tag;
        return true; // Keep the result of `composeNode`.
      }

    } else {
      break; // Reading is done. Go to the epilogue.
    }

    //
    // Common reading code for both explicit and implicit notations.
    //
    if (state.line === _line || state.lineIndent > nodeIndent) {
      if (composeNode(state, nodeIndent, CONTEXT_BLOCK_OUT, true, allowCompact)) {
        if (atExplicitKey) {
          keyNode = state.result;
        } else {
          valueNode = state.result;
        }
      }

      if (!atExplicitKey) {
        storeMappingPair(state, _result, keyTag, keyNode, valueNode);
        keyTag = keyNode = valueNode = null;
      }

      skipSeparationSpace(state, true, -1);
      ch = state.input.charCodeAt(state.position);
    }

    if (state.lineIndent > nodeIndent && (0 !== ch)) {
      throwError(state, 'bad indentation of a mapping entry');
    } else if (state.lineIndent < nodeIndent) {
      break;
    }
  }

  //
  // Epilogue.
  //

  // Special case: last mapping's node contains only the key in explicit notation.
  if (atExplicitKey) {
    storeMappingPair(state, _result, keyTag, keyNode, null);
  }

  // Expose the resulting mapping.
  if (detected) {
    state.tag = _tag;
    state.kind = 'mapping';
    state.result = _result;
  }

  return detected;
}

function readTagProperty(state) {
  var _position,
      isVerbatim = false,
      isNamed    = false,
      tagHandle,
      tagName,
      ch;

  ch = state.input.charCodeAt(state.position);

  if (0x21/* ! */ !== ch) {
    return false;
  }

  if (null !== state.tag) {
    throwError(state, 'duplication of a tag property');
  }

  ch = state.input.charCodeAt(++state.position);

  if (0x3C/* < */ === ch) {
    isVerbatim = true;
    ch = state.input.charCodeAt(++state.position);

  } else if (0x21/* ! */ === ch) {
    isNamed = true;
    tagHandle = '!!';
    ch = state.input.charCodeAt(++state.position);

  } else {
    tagHandle = '!';
  }

  _position = state.position;

  if (isVerbatim) {
    do { ch = state.input.charCodeAt(++state.position); }
    while (0 !== ch && 0x3E/* > */ !== ch);

    if (state.position < state.length) {
      tagName = state.input.slice(_position, state.position);
      ch = state.input.charCodeAt(++state.position);
    } else {
      throwError(state, 'unexpected end of the stream within a verbatim tag');
    }
  } else {
    while (0 !== ch && !is_WS_OR_EOL(ch)) {

      if (0x21/* ! */ === ch) {
        if (!isNamed) {
          tagHandle = state.input.slice(_position - 1, state.position + 1);

          if (!PATTERN_TAG_HANDLE.test(tagHandle)) {
            throwError(state, 'named tag handle cannot contain such characters');
          }

          isNamed = true;
          _position = state.position + 1;
        } else {
          throwError(state, 'tag suffix cannot contain exclamation marks');
        }
      }

      ch = state.input.charCodeAt(++state.position);
    }

    tagName = state.input.slice(_position, state.position);

    if (PATTERN_FLOW_INDICATORS.test(tagName)) {
      throwError(state, 'tag suffix cannot contain flow indicator characters');
    }
  }

  if (tagName && !PATTERN_TAG_URI.test(tagName)) {
    throwError(state, 'tag name cannot contain such characters: ' + tagName);
  }

  if (isVerbatim) {
    state.tag = tagName;

  } else if (_hasOwnProperty.call(state.tagMap, tagHandle)) {
    state.tag = state.tagMap[tagHandle] + tagName;

  } else if ('!' === tagHandle) {
    state.tag = '!' + tagName;

  } else if ('!!' === tagHandle) {
    state.tag = 'tag:yaml.org,2002:' + tagName;

  } else {
    throwError(state, 'undeclared tag handle "' + tagHandle + '"');
  }

  return true;
}

function readAnchorProperty(state) {
  var _position,
      ch;

  ch = state.input.charCodeAt(state.position);

  if (0x26/* & */ !== ch) {
    return false;
  }

  if (null !== state.anchor) {
    throwError(state, 'duplication of an anchor property');
  }

  ch = state.input.charCodeAt(++state.position);
  _position = state.position;

  while (0 !== ch && !is_WS_OR_EOL(ch) && !is_FLOW_INDICATOR(ch)) {
    ch = state.input.charCodeAt(++state.position);
  }

  if (state.position === _position) {
    throwError(state, 'name of an anchor node must contain at least one character');
  }

  state.anchor = state.input.slice(_position, state.position);
  return true;
}

function readAlias(state) {
  var _position, alias,
      len = state.length,
      input = state.input,
      ch;

  ch = state.input.charCodeAt(state.position);

  if (0x2A/* * */ !== ch) {
    return false;
  }

  ch = state.input.charCodeAt(++state.position);
  _position = state.position;

  while (0 !== ch && !is_WS_OR_EOL(ch) && !is_FLOW_INDICATOR(ch)) {
    ch = state.input.charCodeAt(++state.position);
  }

  if (state.position === _position) {
    throwError(state, 'name of an alias node must contain at least one character');
  }

  alias = state.input.slice(_position, state.position);

  if (!state.anchorMap.hasOwnProperty(alias)) {
    throwError(state, 'unidentified alias "' + alias + '"');
  }

  state.result = state.anchorMap[alias];
  skipSeparationSpace(state, true, -1);
  return true;
}

function composeNode(state, parentIndent, nodeContext, allowToSeek, allowCompact) {
  var allowBlockStyles,
      allowBlockScalars,
      allowBlockCollections,
      atNewLine  = false,
      isIndented = true,
      hasContent = false,
      typeIndex,
      typeQuantity,
      type,
      flowIndent,
      blockIndent,
      _result;

  state.tag    = null;
  state.anchor = null;
  state.kind   = null;
  state.result = null;

  allowBlockStyles = allowBlockScalars = allowBlockCollections =
    CONTEXT_BLOCK_OUT === nodeContext ||
    CONTEXT_BLOCK_IN  === nodeContext;

  if (allowToSeek) {
    if (skipSeparationSpace(state, true, -1)) {
      atNewLine = true;

      if (state.lineIndent === parentIndent) {
        isIndented = false;

      } else if (state.lineIndent > parentIndent) {
        isIndented = true;

      } else {
        return false;
      }
    }
  }

  if (isIndented) {
    while (readTagProperty(state) || readAnchorProperty(state)) {
      if (skipSeparationSpace(state, true, -1)) {
        atNewLine = true;

        if (state.lineIndent > parentIndent) {
          isIndented = true;
          allowBlockCollections = allowBlockStyles;

        } else if (state.lineIndent === parentIndent) {
          isIndented = false;
          allowBlockCollections = allowBlockStyles;

        } else {
          return true;
        }
      } else {
        allowBlockCollections = false;
      }
    }
  }

  if (allowBlockCollections) {
    allowBlockCollections = atNewLine || allowCompact;
  }

  if (isIndented || CONTEXT_BLOCK_OUT === nodeContext) {
    if (CONTEXT_FLOW_IN === nodeContext || CONTEXT_FLOW_OUT === nodeContext) {
      flowIndent = parentIndent;
    } else {
      flowIndent = parentIndent + 1;
    }

    blockIndent = state.position - state.lineStart;

    if (isIndented) {
      if (allowBlockCollections &&
          (readBlockSequence(state, blockIndent) ||
           readBlockMapping(state, blockIndent, flowIndent)) ||
          readFlowCollection(state, flowIndent)) {
        hasContent = true;
      } else {
        if ((allowBlockScalars && readBlockScalar(state, flowIndent)) ||
            readSingleQuotedScalar(state, flowIndent) ||
            readDoubleQuotedScalar(state, flowIndent)) {
          hasContent = true;

        } else if (readAlias(state)) {
          hasContent = true;

          if (null !== state.tag || null !== state.anchor) {
            throwError(state, 'alias node should not have any properties');
          }

        } else if (readPlainScalar(state, flowIndent, CONTEXT_FLOW_IN === nodeContext)) {
          hasContent = true;

          if (null === state.tag) {
            state.tag = '?';
          }
        }

        if (null !== state.anchor) {
          state.anchorMap[state.anchor] = state.result;
        }
      }
    } else {
      hasContent = allowBlockCollections && readBlockSequence(state, blockIndent);
    }
  }

  if (null !== state.tag && '!' !== state.tag) {
    if ('?' === state.tag) {
      for (typeIndex = 0, typeQuantity = state.implicitTypes.length;
           typeIndex < typeQuantity;
           typeIndex += 1) {
        type = state.implicitTypes[typeIndex];

        // Implicit resolving is not allowed for non-scalar types, and '?'
        // non-specific tag is only assigned to plain scalars. So, it isn't
        // needed to check for 'kind' conformity.

        if (type.resolve(state.result)) { // `state.result` updated in resolver if matched
          state.result = type.construct(state.result);
          state.tag = type.tag;
          break;
        }
      }
    } else if (_hasOwnProperty.call(state.typeMap, state.tag)) {
      type = state.typeMap[state.tag];

      if (null !== state.result && type.kind !== state.kind) {
        throwError(state, 'unacceptable node kind for !<' + state.tag + '> tag; it should be "' + type.kind + '", not "' + state.kind + '"');
      }

      if (!type.resolve(state.result)) { // `state.result` updated in resolver if matched
        throwError(state, 'cannot resolve a node with !<' + state.tag + '> explicit tag');
      } else {
        state.result = type.construct(state.result);
      }
    } else {
      throwWarning(state, 'unknown tag !<' + state.tag + '>');
    }
  }

  return null !== state.tag || null !== state.anchor || hasContent;
}

function readDocument(state) {
  var documentStart = state.position,
      _position,
      directiveName,
      directiveArgs,
      hasDirectives = false,
      ch;

  state.version = null;
  state.checkLineBreaks = state.legacy;
  state.tagMap = {};
  state.anchorMap = {};

  while (0 !== (ch = state.input.charCodeAt(state.position))) {
    skipSeparationSpace(state, true, -1);

    ch = state.input.charCodeAt(state.position);

    if (state.lineIndent > 0 || 0x25/* % */ !== ch) {
      break;
    }

    hasDirectives = true;
    ch = state.input.charCodeAt(++state.position);
    _position = state.position;

    while (0 !== ch && !is_WS_OR_EOL(ch)) {
      ch = state.input.charCodeAt(++state.position);
    }

    directiveName = state.input.slice(_position, state.position);
    directiveArgs = [];

    if (directiveName.length < 1) {
      throwError(state, 'directive name must not be less than one character in length');
    }

    while (0 !== ch) {
      while (is_WHITE_SPACE(ch)) {
        ch = state.input.charCodeAt(++state.position);
      }

      if (0x23/* # */ === ch) {
        do { ch = state.input.charCodeAt(++state.position); }
        while (0 !== ch && !is_EOL(ch));
        break;
      }

      if (is_EOL(ch)) {
        break;
      }

      _position = state.position;

      while (0 !== ch && !is_WS_OR_EOL(ch)) {
        ch = state.input.charCodeAt(++state.position);
      }

      directiveArgs.push(state.input.slice(_position, state.position));
    }

    if (0 !== ch) {
      readLineBreak(state);
    }

    if (_hasOwnProperty.call(directiveHandlers, directiveName)) {
      directiveHandlers[directiveName](state, directiveName, directiveArgs);
    } else {
      throwWarning(state, 'unknown document directive "' + directiveName + '"');
    }
  }

  skipSeparationSpace(state, true, -1);

  if (0 === state.lineIndent &&
      0x2D/* - */ === state.input.charCodeAt(state.position) &&
      0x2D/* - */ === state.input.charCodeAt(state.position + 1) &&
      0x2D/* - */ === state.input.charCodeAt(state.position + 2)) {
    state.position += 3;
    skipSeparationSpace(state, true, -1);

  } else if (hasDirectives) {
    throwError(state, 'directives end mark is expected');
  }

  composeNode(state, state.lineIndent - 1, CONTEXT_BLOCK_OUT, false, true);
  skipSeparationSpace(state, true, -1);

  if (state.checkLineBreaks &&
      PATTERN_NON_ASCII_LINE_BREAKS.test(state.input.slice(documentStart, state.position))) {
    throwWarning(state, 'non-ASCII line breaks are interpreted as content');
  }

  state.documents.push(state.result);

  if (state.position === state.lineStart && testDocumentSeparator(state)) {

    if (0x2E/* . */ === state.input.charCodeAt(state.position)) {
      state.position += 3;
      skipSeparationSpace(state, true, -1);
    }
    return;
  }

  if (state.position < (state.length - 1)) {
    throwError(state, 'end of the stream or a document separator is expected');
  } else {
    return;
  }
}


function loadDocuments(input, options) {
  input = String(input);
  options = options || {};

  if (0 !== input.length &&
      0x0A/* LF */ !== input.charCodeAt(input.length - 1) &&
      0x0D/* CR */ !== input.charCodeAt(input.length - 1)) {
    input += '\n';
  }

  var state = new State(input, options);

  if (PATTERN_NON_PRINTABLE.test(state.input)) {
    throwError(state, 'the stream contains non-printable characters');
  }

  // Use 0 as string terminator. That significantly simplifies bounds check.
  state.input += '\0';

  while (0x20/* Space */ === state.input.charCodeAt(state.position)) {
    state.lineIndent += 1;
    state.position += 1;
  }

  while (state.position < (state.length - 1)) {
    readDocument(state);
  }

  return state.documents;
}


function loadAll(input, iterator, options) {
  var documents = loadDocuments(input, options), index, length;

  for (index = 0, length = documents.length; index < length; index += 1) {
    iterator(documents[index]);
  }
}


function load(input, options) {
  var documents = loadDocuments(input, options), index, length;

  if (0 === documents.length) {
    return undefined;
  } else if (1 === documents.length) {
    return documents[0];
  } else {
    throw new YAMLException('expected a single document in the stream, but found more');
  }
}


function safeLoadAll(input, output, options) {
  loadAll(input, output, common.extend({ schema: DEFAULT_SAFE_SCHEMA }, options));
}


function safeLoad(input, options) {
  return load(input, common.extend({ schema: DEFAULT_SAFE_SCHEMA }, options));
}


module.exports.loadAll     = loadAll;
module.exports.load        = load;
module.exports.safeLoadAll = safeLoadAll;
module.exports.safeLoad    = safeLoad;

},{"./common":7,"./exception":9,"./mark":11,"./schema/default_full":14,"./schema/default_safe":15}],11:[function(require,module,exports){
'use strict';


var common = require('./common');


function Mark(name, buffer, position, line, column) {
  this.name     = name;
  this.buffer   = buffer;
  this.position = position;
  this.line     = line;
  this.column   = column;
}


Mark.prototype.getSnippet = function getSnippet(indent, maxLength) {
  var head, start, tail, end, snippet;

  if (!this.buffer) {
    return null;
  }

  indent = indent || 4;
  maxLength = maxLength || 75;

  head = '';
  start = this.position;

  while (start > 0 && -1 === '\x00\r\n\x85\u2028\u2029'.indexOf(this.buffer.charAt(start - 1))) {
    start -= 1;
    if (this.position - start > (maxLength / 2 - 1)) {
      head = ' ... ';
      start += 5;
      break;
    }
  }

  tail = '';
  end = this.position;

  while (end < this.buffer.length && -1 === '\x00\r\n\x85\u2028\u2029'.indexOf(this.buffer.charAt(end))) {
    end += 1;
    if (end - this.position > (maxLength / 2 - 1)) {
      tail = ' ... ';
      end -= 5;
      break;
    }
  }

  snippet = this.buffer.slice(start, end);

  return common.repeat(' ', indent) + head + snippet + tail + '\n' +
         common.repeat(' ', indent + this.position - start + head.length) + '^';
};


Mark.prototype.toString = function toString(compact) {
  var snippet, where = '';

  if (this.name) {
    where += 'in "' + this.name + '" ';
  }

  where += 'at line ' + (this.line + 1) + ', column ' + (this.column + 1);

  if (!compact) {
    snippet = this.getSnippet();

    if (snippet) {
      where += ':\n' + snippet;
    }
  }

  return where;
};


module.exports = Mark;

},{"./common":7}],12:[function(require,module,exports){
'use strict';


var common        = require('./common');
var YAMLException = require('./exception');
var Type          = require('./type');


function compileList(schema, name, result) {
  var exclude = [];

  schema.include.forEach(function (includedSchema) {
    result = compileList(includedSchema, name, result);
  });

  schema[name].forEach(function (currentType) {
    result.forEach(function (previousType, previousIndex) {
      if (previousType.tag === currentType.tag) {
        exclude.push(previousIndex);
      }
    });

    result.push(currentType);
  });

  return result.filter(function (type, index) {
    return -1 === exclude.indexOf(index);
  });
}


function compileMap(/* lists... */) {
  var result = {}, index, length;

  function collectType(type) {
    result[type.tag] = type;
  }

  for (index = 0, length = arguments.length; index < length; index += 1) {
    arguments[index].forEach(collectType);
  }

  return result;
}


function Schema(definition) {
  this.include  = definition.include  || [];
  this.implicit = definition.implicit || [];
  this.explicit = definition.explicit || [];

  this.implicit.forEach(function (type) {
    if (type.loadKind && 'scalar' !== type.loadKind) {
      throw new YAMLException('There is a non-scalar type in the implicit list of a schema. Implicit resolving of such types is not supported.');
    }
  });

  this.compiledImplicit = compileList(this, 'implicit', []);
  this.compiledExplicit = compileList(this, 'explicit', []);
  this.compiledTypeMap  = compileMap(this.compiledImplicit, this.compiledExplicit);
}


Schema.DEFAULT = null;


Schema.create = function createSchema() {
  var schemas, types;

  switch (arguments.length) {
  case 1:
    schemas = Schema.DEFAULT;
    types = arguments[0];
    break;

  case 2:
    schemas = arguments[0];
    types = arguments[1];
    break;

  default:
    throw new YAMLException('Wrong number of arguments for Schema.create function');
  }

  schemas = common.toArray(schemas);
  types = common.toArray(types);

  if (!schemas.every(function (schema) { return schema instanceof Schema; })) {
    throw new YAMLException('Specified list of super schemas (or a single Schema object) contains a non-Schema object.');
  }

  if (!types.every(function (type) { return type instanceof Type; })) {
    throw new YAMLException('Specified list of YAML types (or a single Type object) contains a non-Type object.');
  }

  return new Schema({
    include: schemas,
    explicit: types
  });
};


module.exports = Schema;

},{"./common":7,"./exception":9,"./type":18}],13:[function(require,module,exports){
// Standard YAML's Core schema.
// http://www.yaml.org/spec/1.2/spec.html#id2804923
//
// NOTE: JS-YAML does not support schema-specific tag resolution restrictions.
// So, Core schema has no distinctions from JSON schema is JS-YAML.


'use strict';


var Schema = require('../schema');


module.exports = new Schema({
  include: [
    require('./json')
  ]
});

},{"../schema":12,"./json":17}],14:[function(require,module,exports){
// JS-YAML's default schema for `load` function.
// It is not described in the YAML specification.
//
// This schema is based on JS-YAML's default safe schema and includes
// JavaScript-specific types: !!js/undefined, !!js/regexp and !!js/function.
//
// Also this schema is used as default base schema at `Schema.create` function.


'use strict';


var Schema = require('../schema');


module.exports = Schema.DEFAULT = new Schema({
  include: [
    require('./default_safe')
  ],
  explicit: [
    require('../type/js/undefined'),
    require('../type/js/regexp'),
    require('../type/js/function')
  ]
});

},{"../schema":12,"../type/js/function":23,"../type/js/regexp":24,"../type/js/undefined":25,"./default_safe":15}],15:[function(require,module,exports){
// JS-YAML's default schema for `safeLoad` function.
// It is not described in the YAML specification.
//
// This schema is based on standard YAML's Core schema and includes most of
// extra types described at YAML tag repository. (http://yaml.org/type/)


'use strict';


var Schema = require('../schema');


module.exports = new Schema({
  include: [
    require('./core')
  ],
  implicit: [
    require('../type/timestamp'),
    require('../type/merge')
  ],
  explicit: [
    require('../type/binary'),
    require('../type/omap'),
    require('../type/pairs'),
    require('../type/set')
  ]
});

},{"../schema":12,"../type/binary":19,"../type/merge":27,"../type/omap":29,"../type/pairs":30,"../type/set":32,"../type/timestamp":34,"./core":13}],16:[function(require,module,exports){
// Standard YAML's Failsafe schema.
// http://www.yaml.org/spec/1.2/spec.html#id2802346


'use strict';


var Schema = require('../schema');


module.exports = new Schema({
  explicit: [
    require('../type/str'),
    require('../type/seq'),
    require('../type/map')
  ]
});

},{"../schema":12,"../type/map":26,"../type/seq":31,"../type/str":33}],17:[function(require,module,exports){
// Standard YAML's JSON schema.
// http://www.yaml.org/spec/1.2/spec.html#id2803231
//
// NOTE: JS-YAML does not support schema-specific tag resolution restrictions.
// So, this schema is not such strict as defined in the YAML specification.
// It allows numbers in binary notaion, use `Null` and `NULL` as `null`, etc.


'use strict';


var Schema = require('../schema');


module.exports = new Schema({
  include: [
    require('./failsafe')
  ],
  implicit: [
    require('../type/null'),
    require('../type/bool'),
    require('../type/int'),
    require('../type/float')
  ]
});

},{"../schema":12,"../type/bool":20,"../type/float":21,"../type/int":22,"../type/null":28,"./failsafe":16}],18:[function(require,module,exports){
'use strict';

var YAMLException = require('./exception');

var TYPE_CONSTRUCTOR_OPTIONS = [
  'kind',
  'resolve',
  'construct',
  'instanceOf',
  'predicate',
  'represent',
  'defaultStyle',
  'styleAliases'
];

var YAML_NODE_KINDS = [
  'scalar',
  'sequence',
  'mapping'
];

function compileStyleAliases(map) {
  var result = {};

  if (null !== map) {
    Object.keys(map).forEach(function (style) {
      map[style].forEach(function (alias) {
        result[String(alias)] = style;
      });
    });
  }

  return result;
}

function Type(tag, options) {
  options = options || {};

  Object.keys(options).forEach(function (name) {
    if (-1 === TYPE_CONSTRUCTOR_OPTIONS.indexOf(name)) {
      throw new YAMLException('Unknown option "' + name + '" is met in definition of "' + tag + '" YAML type.');
    }
  });

  // TODO: Add tag format check.
  this.tag          = tag;
  this.kind         = options['kind']         || null;
  this.resolve      = options['resolve']      || function () { return true; };
  this.construct    = options['construct']    || function (data) { return data; };
  this.instanceOf   = options['instanceOf']   || null;
  this.predicate    = options['predicate']    || null;
  this.represent    = options['represent']    || null;
  this.defaultStyle = options['defaultStyle'] || null;
  this.styleAliases = compileStyleAliases(options['styleAliases'] || null);

  if (-1 === YAML_NODE_KINDS.indexOf(this.kind)) {
    throw new YAMLException('Unknown kind "' + this.kind + '" is specified for "' + tag + '" YAML type.');
  }
}

module.exports = Type;

},{"./exception":9}],19:[function(require,module,exports){
'use strict';


// A trick for browserified version.
// Since we make browserifier to ignore `buffer` module, NodeBuffer will be undefined
var NodeBuffer = require('buffer').Buffer;
var Type       = require('../type');


// [ 64, 65, 66 ] -> [ padding, CR, LF ]
var BASE64_MAP = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/=\n\r';


function resolveYamlBinary(data) {
  var code, idx, bitlen = 0, len = 0, max = data.length, map = BASE64_MAP;

  // Convert one by one.
  for (idx = 0; idx < max; idx ++) {
    code = map.indexOf(data.charAt(idx));

    // Skip CR/LF
    if (code > 64) { continue; }

    // Fail on illegal characters
    if (code < 0) { return false; }

    bitlen += 6;
  }

  // If there are any bits left, source was corrupted
  return (bitlen % 8) === 0;
}

function constructYamlBinary(data) {
  var code, idx, tailbits,
      input = data.replace(/[\r\n=]/g, ''), // remove CR/LF & padding to simplify scan
      max = input.length,
      map = BASE64_MAP,
      bits = 0,
      result = [];

  // Collect by 6*4 bits (3 bytes)

  for (idx = 0; idx < max; idx++) {
    if ((idx % 4 === 0) && idx) {
      result.push((bits >> 16) & 0xFF);
      result.push((bits >> 8) & 0xFF);
      result.push(bits & 0xFF);
    }

    bits = (bits << 6) | map.indexOf(input.charAt(idx));
  }

  // Dump tail

  tailbits = (max % 4)*6;

  if (tailbits === 0) {
    result.push((bits >> 16) & 0xFF);
    result.push((bits >> 8) & 0xFF);
    result.push(bits & 0xFF);
  } else if (tailbits === 18) {
    result.push((bits >> 10) & 0xFF);
    result.push((bits >> 2) & 0xFF);
  } else if (tailbits === 12) {
    result.push((bits >> 4) & 0xFF);
  }

  // Wrap into Buffer for NodeJS and leave Array for browser
  if (NodeBuffer) {
    return new NodeBuffer(result);
  }

  return result;
}

function representYamlBinary(object /*, style*/) {
  var result = '', bits = 0, idx, tail,
      max = object.length,
      map = BASE64_MAP;

  // Convert every three bytes to 4 ASCII characters.

  for (idx = 0; idx < max; idx++) {
    if ((idx % 3 === 0) && idx) {
      result += map[(bits >> 18) & 0x3F];
      result += map[(bits >> 12) & 0x3F];
      result += map[(bits >> 6) & 0x3F];
      result += map[bits & 0x3F];
    }

    bits = (bits << 8) + object[idx];
  }

  // Dump tail

  tail = max % 3;

  if (tail === 0) {
    result += map[(bits >> 18) & 0x3F];
    result += map[(bits >> 12) & 0x3F];
    result += map[(bits >> 6) & 0x3F];
    result += map[bits & 0x3F];
  } else if (tail === 2) {
    result += map[(bits >> 10) & 0x3F];
    result += map[(bits >> 4) & 0x3F];
    result += map[(bits << 2) & 0x3F];
    result += map[64];
  } else if (tail === 1) {
    result += map[(bits >> 2) & 0x3F];
    result += map[(bits << 4) & 0x3F];
    result += map[64];
    result += map[64];
  }

  return result;
}

function isBinary(object) {
  return NodeBuffer && NodeBuffer.isBuffer(object);
}

module.exports = new Type('tag:yaml.org,2002:binary', {
  kind: 'scalar',
  resolve: resolveYamlBinary,
  construct: constructYamlBinary,
  predicate: isBinary,
  represent: representYamlBinary
});

},{"../type":18,"buffer":1}],20:[function(require,module,exports){
'use strict';

var Type = require('../type');

function resolveYamlBoolean(data) {
  var max = data.length;

  return (max === 4 && (data === 'true' || data === 'True' || data === 'TRUE')) ||
         (max === 5 && (data === 'false' || data === 'False' || data === 'FALSE'));
}

function constructYamlBoolean(data) {
  return data === 'true' ||
         data === 'True' ||
         data === 'TRUE';
}

function isBoolean(object) {
  return '[object Boolean]' === Object.prototype.toString.call(object);
}

module.exports = new Type('tag:yaml.org,2002:bool', {
  kind: 'scalar',
  resolve: resolveYamlBoolean,
  construct: constructYamlBoolean,
  predicate: isBoolean,
  represent: {
    lowercase: function (object) { return object ? 'true' : 'false'; },
    uppercase: function (object) { return object ? 'TRUE' : 'FALSE'; },
    camelcase: function (object) { return object ? 'True' : 'False'; }
  },
  defaultStyle: 'lowercase'
});

},{"../type":18}],21:[function(require,module,exports){
'use strict';

var common = require('../common');
var Type   = require('../type');

var YAML_FLOAT_PATTERN = new RegExp(
  '^(?:[-+]?(?:[0-9][0-9_]*)\\.[0-9_]*(?:[eE][-+][0-9]+)?' +
  '|\\.[0-9_]+(?:[eE][-+][0-9]+)?' +
  '|[-+]?[0-9][0-9_]*(?::[0-5]?[0-9])+\\.[0-9_]*' +
  '|[-+]?\\.(?:inf|Inf|INF)' +
  '|\\.(?:nan|NaN|NAN))$');

function resolveYamlFloat(data) {
  var value, sign, base, digits;

  if (!YAML_FLOAT_PATTERN.test(data)) {
    return false;
  }
  return true;
}

function constructYamlFloat(data) {
  var value, sign, base, digits;

  value  = data.replace(/_/g, '').toLowerCase();
  sign   = '-' === value[0] ? -1 : 1;
  digits = [];

  if (0 <= '+-'.indexOf(value[0])) {
    value = value.slice(1);
  }

  if ('.inf' === value) {
    return (1 === sign) ? Number.POSITIVE_INFINITY : Number.NEGATIVE_INFINITY;

  } else if ('.nan' === value) {
    return NaN;

  } else if (0 <= value.indexOf(':')) {
    value.split(':').forEach(function (v) {
      digits.unshift(parseFloat(v, 10));
    });

    value = 0.0;
    base = 1;

    digits.forEach(function (d) {
      value += d * base;
      base *= 60;
    });

    return sign * value;

  } else {
    return sign * parseFloat(value, 10);
  }
}

function representYamlFloat(object, style) {
  if (isNaN(object)) {
    switch (style) {
    case 'lowercase':
      return '.nan';
    case 'uppercase':
      return '.NAN';
    case 'camelcase':
      return '.NaN';
    }
  } else if (Number.POSITIVE_INFINITY === object) {
    switch (style) {
    case 'lowercase':
      return '.inf';
    case 'uppercase':
      return '.INF';
    case 'camelcase':
      return '.Inf';
    }
  } else if (Number.NEGATIVE_INFINITY === object) {
    switch (style) {
    case 'lowercase':
      return '-.inf';
    case 'uppercase':
      return '-.INF';
    case 'camelcase':
      return '-.Inf';
    }
  } else if (common.isNegativeZero(object)) {
    return '-0.0';
  } else {
    return object.toString(10);
  }
}

function isFloat(object) {
  return ('[object Number]' === Object.prototype.toString.call(object)) &&
         (0 !== object % 1 || common.isNegativeZero(object));
}

module.exports = new Type('tag:yaml.org,2002:float', {
  kind: 'scalar',
  resolve: resolveYamlFloat,
  construct: constructYamlFloat,
  predicate: isFloat,
  represent: representYamlFloat,
  defaultStyle: 'lowercase'
});

},{"../common":7,"../type":18}],22:[function(require,module,exports){
'use strict';

var common = require('../common');
var Type   = require('../type');

function isHexCode(c) {
  return ((0x30/* 0 */ <= c) && (c <= 0x39/* 9 */)) ||
         ((0x41/* A */ <= c) && (c <= 0x46/* F */)) ||
         ((0x61/* a */ <= c) && (c <= 0x66/* f */));
}

function isOctCode(c) {
  return ((0x30/* 0 */ <= c) && (c <= 0x37/* 7 */));
}

function isDecCode(c) {
  return ((0x30/* 0 */ <= c) && (c <= 0x39/* 9 */));
}

function resolveYamlInteger(data) {
  var max = data.length,
      index = 0,
      hasDigits = false,
      ch;

  if (!max) { return false; }

  ch = data[index];

  // sign
  if (ch === '-' || ch === '+') {
    ch = data[++index];
  }

  if (ch === '0') {
    // 0
    if (index+1 === max) { return true; }
    ch = data[++index];

    // base 2, base 8, base 16

    if (ch === 'b') {
      // base 2
      index++;

      for (; index < max; index++) {
        ch = data[index];
        if (ch === '_') { continue; }
        if (ch !== '0' && ch !== '1') {
          return false;
        }
        hasDigits = true;
      }
      return hasDigits;
    }


    if (ch === 'x') {
      // base 16
      index++;

      for (; index < max; index++) {
        ch = data[index];
        if (ch === '_') { continue; }
        if (!isHexCode(data.charCodeAt(index))) {
          return false;
        }
        hasDigits = true;
      }
      return hasDigits;
    }

    // base 8
    for (; index < max; index++) {
      ch = data[index];
      if (ch === '_') { continue; }
      if (!isOctCode(data.charCodeAt(index))) {
        return false;
      }
      hasDigits = true;
    }
    return hasDigits;
  }

  // base 10 (except 0) or base 60

  for (; index < max; index++) {
    ch = data[index];
    if (ch === '_') { continue; }
    if (ch === ':') { break; }
    if (!isDecCode(data.charCodeAt(index))) {
      return false;
    }
    hasDigits = true;
  }

  if (!hasDigits) { return false; }

  // if !base60 - done;
  if (ch !== ':') { return true; }

  // base60 almost not used, no needs to optimize
  return /^(:[0-5]?[0-9])+$/.test(data.slice(index));
}

function constructYamlInteger(data) {
  var value = data, sign = 1, ch, base, digits = [];

  if (value.indexOf('_') !== -1) {
    value = value.replace(/_/g, '');
  }

  ch = value[0];

  if (ch === '-' || ch === '+') {
    if (ch === '-') { sign = -1; }
    value = value.slice(1);
    ch = value[0];
  }

  if ('0' === value) {
    return 0;
  }

  if (ch === '0') {
    if (value[1] === 'b') {
      return sign * parseInt(value.slice(2), 2);
    }
    if (value[1] === 'x') {
      return sign * parseInt(value, 16);
    }
    return sign * parseInt(value, 8);

  }

  if (value.indexOf(':') !== -1) {
    value.split(':').forEach(function (v) {
      digits.unshift(parseInt(v, 10));
    });

    value = 0;
    base = 1;

    digits.forEach(function (d) {
      value += (d * base);
      base *= 60;
    });

    return sign * value;

  }

  return sign * parseInt(value, 10);
}

function isInteger(object) {
  return ('[object Number]' === Object.prototype.toString.call(object)) &&
         (0 === object % 1 && !common.isNegativeZero(object));
}

module.exports = new Type('tag:yaml.org,2002:int', {
  kind: 'scalar',
  resolve: resolveYamlInteger,
  construct: constructYamlInteger,
  predicate: isInteger,
  represent: {
    binary:      function (object) { return '0b' + object.toString(2); },
    octal:       function (object) { return '0'  + object.toString(8); },
    decimal:     function (object) { return        object.toString(10); },
    hexadecimal: function (object) { return '0x' + object.toString(16).toUpperCase(); }
  },
  defaultStyle: 'decimal',
  styleAliases: {
    binary:      [ 2,  'bin' ],
    octal:       [ 8,  'oct' ],
    decimal:     [ 10, 'dec' ],
    hexadecimal: [ 16, 'hex' ]
  }
});

},{"../common":7,"../type":18}],23:[function(require,module,exports){
'use strict';

var esprima;

// Browserified version does not have esprima
//
// 1. For node.js just require module as deps
// 2. For browser try to require mudule via external AMD system.
//    If not found - try to fallback to window.esprima. If not
//    found too - then fail to parse.
//
try {
  esprima = require('esprima');
} catch (_) {
  /*global window */
  if (typeof window !== 'undefined') { esprima = window.esprima; }
}

var Type = require('../../type');

function resolveJavascriptFunction(data) {
  try {
    var source = '(' + data + ')',
        ast    = esprima.parse(source, { range: true }),
        params = [],
        body;

    if ('Program'             !== ast.type         ||
        1                     !== ast.body.length  ||
        'ExpressionStatement' !== ast.body[0].type ||
        'FunctionExpression'  !== ast.body[0].expression.type) {
      return false;
    }

    return true;
  } catch (err) {
    return false;
  }
}

function constructJavascriptFunction(data) {
  /*jslint evil:true*/

  var source = '(' + data + ')',
      ast    = esprima.parse(source, { range: true }),
      params = [],
      body;

  if ('Program'             !== ast.type         ||
      1                     !== ast.body.length  ||
      'ExpressionStatement' !== ast.body[0].type ||
      'FunctionExpression'  !== ast.body[0].expression.type) {
    throw new Error('Failed to resolve function');
  }

  ast.body[0].expression.params.forEach(function (param) {
    params.push(param.name);
  });

  body = ast.body[0].expression.body.range;

  // Esprima's ranges include the first '{' and the last '}' characters on
  // function expressions. So cut them out.
  return new Function(params, source.slice(body[0]+1, body[1]-1));
}

function representJavascriptFunction(object /*, style*/) {
  return object.toString();
}

function isFunction(object) {
  return '[object Function]' === Object.prototype.toString.call(object);
}

module.exports = new Type('tag:yaml.org,2002:js/function', {
  kind: 'scalar',
  resolve: resolveJavascriptFunction,
  construct: constructJavascriptFunction,
  predicate: isFunction,
  represent: representJavascriptFunction
});

},{"../../type":18,"esprima":35}],24:[function(require,module,exports){
'use strict';

var Type = require('../../type');

function resolveJavascriptRegExp(data) {
  var regexp = data,
      tail   = /\/([gim]*)$/.exec(data),
      modifiers = '';

  // if regexp starts with '/' it can have modifiers and must be properly closed
  // `/foo/gim` - modifiers tail can be maximum 3 chars
  if ('/' === regexp[0]) {
    if (tail) {
      modifiers = tail[1];
    }

    if (modifiers.length > 3) { return false; }
    // if expression starts with /, is should be properly terminated
    if (regexp[regexp.length - modifiers.length - 1] !== '/') { return false; }

    regexp = regexp.slice(1, regexp.length - modifiers.length - 1);
  }

  try {
    var dummy = new RegExp(regexp, modifiers);
    return true;
  } catch (error) {
    return false;
  }
}

function constructJavascriptRegExp(data) {
  var regexp = data,
      tail   = /\/([gim]*)$/.exec(data),
      modifiers = '';

  // `/foo/gim` - tail can be maximum 4 chars
  if ('/' === regexp[0]) {
    if (tail) {
      modifiers = tail[1];
    }
    regexp = regexp.slice(1, regexp.length - modifiers.length - 1);
  }

  return new RegExp(regexp, modifiers);
}

function representJavascriptRegExp(object /*, style*/) {
  var result = '/' + object.source + '/';

  if (object.global) {
    result += 'g';
  }

  if (object.multiline) {
    result += 'm';
  }

  if (object.ignoreCase) {
    result += 'i';
  }

  return result;
}

function isRegExp(object) {
  return '[object RegExp]' === Object.prototype.toString.call(object);
}

module.exports = new Type('tag:yaml.org,2002:js/regexp', {
  kind: 'scalar',
  resolve: resolveJavascriptRegExp,
  construct: constructJavascriptRegExp,
  predicate: isRegExp,
  represent: representJavascriptRegExp
});

},{"../../type":18}],25:[function(require,module,exports){
'use strict';

var Type = require('../../type');

function resolveJavascriptUndefined() {
  return true;
}

function constructJavascriptUndefined() {
  return undefined;
}

function representJavascriptUndefined() {
  return '';
}

function isUndefined(object) {
  return 'undefined' === typeof object;
}

module.exports = new Type('tag:yaml.org,2002:js/undefined', {
  kind: 'scalar',
  resolve: resolveJavascriptUndefined,
  construct: constructJavascriptUndefined,
  predicate: isUndefined,
  represent: representJavascriptUndefined
});

},{"../../type":18}],26:[function(require,module,exports){
'use strict';

var Type = require('../type');

module.exports = new Type('tag:yaml.org,2002:map', {
  kind: 'mapping'
});

},{"../type":18}],27:[function(require,module,exports){
'use strict';

var Type = require('../type');

function resolveYamlMerge(data) {
  return '<<' === data;
}

module.exports = new Type('tag:yaml.org,2002:merge', {
  kind: 'scalar',
  resolve: resolveYamlMerge,
});

},{"../type":18}],28:[function(require,module,exports){
'use strict';

var Type = require('../type');

function resolveYamlNull(data) {
  var max = data.length;

  return (max === 1 && data === '~') ||
         (max === 4 && (data === 'null' || data === 'Null' || data === 'NULL'));
}

function constructYamlNull() {
  return null;
}

function isNull(object) {
  return null === object;
}

module.exports = new Type('tag:yaml.org,2002:null', {
  kind: 'scalar',
  resolve: resolveYamlNull,
  construct: constructYamlNull,
  predicate: isNull,
  represent: {
    canonical: function () { return '~';    },
    lowercase: function () { return 'null'; },
    uppercase: function () { return 'NULL'; },
    camelcase: function () { return 'Null'; }
  },
  defaultStyle: 'lowercase'
});

},{"../type":18}],29:[function(require,module,exports){
'use strict';

var Type = require('../type');

var _hasOwnProperty = Object.prototype.hasOwnProperty;
var _toString       = Object.prototype.toString;

function resolveYamlOmap(data) {
  var objectKeys = [], index, length, pair, pairKey, pairHasKey,
      object = data;

  for (index = 0, length = object.length; index < length; index += 1) {
    pair = object[index];
    pairHasKey = false;

    if ('[object Object]' !== _toString.call(pair)) {
      return false;
    }

    for (pairKey in pair) {
      if (_hasOwnProperty.call(pair, pairKey)) {
        if (!pairHasKey) {
          pairHasKey = true;
        } else {
          return false;
        }
      }
    }

    if (!pairHasKey) {
      return false;
    }

    if (-1 === objectKeys.indexOf(pairKey)) {
      objectKeys.push(pairKey);
    } else {
      return false;
    }
  }

  return true;
}

module.exports = new Type('tag:yaml.org,2002:omap', {
  kind: 'sequence',
  resolve: resolveYamlOmap
});

},{"../type":18}],30:[function(require,module,exports){
'use strict';

var Type = require('../type');

var _toString = Object.prototype.toString;

function resolveYamlPairs(data) {
  var index, length, pair, keys, result,
      object = data;

  result = new Array(object.length);

  for (index = 0, length = object.length; index < length; index += 1) {
    pair = object[index];

    if ('[object Object]' !== _toString.call(pair)) {
      return false;
    }

    keys = Object.keys(pair);

    if (1 !== keys.length) {
      return false;
    }

    result[index] = [ keys[0], pair[keys[0]] ];
  }

  return true;
}

function constructYamlPairs(data) {
  var index, length, pair, keys, result,
      object = data;

  result = new Array(object.length);

  for (index = 0, length = object.length; index < length; index += 1) {
    pair = object[index];

    keys = Object.keys(pair);

    result[index] = [ keys[0], pair[keys[0]] ];
  }

  return result;
}

module.exports = new Type('tag:yaml.org,2002:pairs', {
  kind: 'sequence',
  resolve: resolveYamlPairs,
  construct: constructYamlPairs
});

},{"../type":18}],31:[function(require,module,exports){
'use strict';

var Type = require('../type');

module.exports = new Type('tag:yaml.org,2002:seq', {
  kind: 'sequence'
});

},{"../type":18}],32:[function(require,module,exports){
'use strict';

var Type = require('../type');

var _hasOwnProperty = Object.prototype.hasOwnProperty;

function resolveYamlSet(data) {
  var key, object = data;

  for (key in object) {
    if (_hasOwnProperty.call(object, key)) {
      if (null !== object[key]) {
        return false;
      }
    }
  }

  return true;
}

module.exports = new Type('tag:yaml.org,2002:set', {
  kind: 'mapping',
  resolve: resolveYamlSet
});

},{"../type":18}],33:[function(require,module,exports){
'use strict';

var Type = require('../type');

module.exports = new Type('tag:yaml.org,2002:str', {
  kind: 'scalar'
});

},{"../type":18}],34:[function(require,module,exports){
'use strict';

var Type = require('../type');

var YAML_TIMESTAMP_REGEXP = new RegExp(
  '^([0-9][0-9][0-9][0-9])'          + // [1] year
  '-([0-9][0-9]?)'                   + // [2] month
  '-([0-9][0-9]?)'                   + // [3] day
  '(?:(?:[Tt]|[ \\t]+)'              + // ...
  '([0-9][0-9]?)'                    + // [4] hour
  ':([0-9][0-9])'                    + // [5] minute
  ':([0-9][0-9])'                    + // [6] second
  '(?:\\.([0-9]*))?'                 + // [7] fraction
  '(?:[ \\t]*(Z|([-+])([0-9][0-9]?)' + // [8] tz [9] tz_sign [10] tz_hour
  '(?::([0-9][0-9]))?))?)?$');         // [11] tz_minute

function resolveYamlTimestamp(data) {
  var match, year, month, day, hour, minute, second, fraction = 0,
      delta = null, tz_hour, tz_minute, date;

  match = YAML_TIMESTAMP_REGEXP.exec(data);

  if (null === match) {
    return false;
  }

  return true;
}

function constructYamlTimestamp(data) {
  var match, year, month, day, hour, minute, second, fraction = 0,
      delta = null, tz_hour, tz_minute, date;

  match = YAML_TIMESTAMP_REGEXP.exec(data);

  if (null === match) {
    throw new Error('Date resolve error');
  }

  // match: [1] year [2] month [3] day

  year = +(match[1]);
  month = +(match[2]) - 1; // JS month starts with 0
  day = +(match[3]);

  if (!match[4]) { // no hour
    return new Date(Date.UTC(year, month, day));
  }

  // match: [4] hour [5] minute [6] second [7] fraction

  hour = +(match[4]);
  minute = +(match[5]);
  second = +(match[6]);

  if (match[7]) {
    fraction = match[7].slice(0, 3);
    while (fraction.length < 3) { // milli-seconds
      fraction += '0';
    }
    fraction = +fraction;
  }

  // match: [8] tz [9] tz_sign [10] tz_hour [11] tz_minute

  if (match[9]) {
    tz_hour = +(match[10]);
    tz_minute = +(match[11] || 0);
    delta = (tz_hour * 60 + tz_minute) * 60000; // delta in mili-seconds
    if ('-' === match[9]) {
      delta = -delta;
    }
  }

  date = new Date(Date.UTC(year, month, day, hour, minute, second, fraction));

  if (delta) {
    date.setTime(date.getTime() - delta);
  }

  return date;
}

function representYamlTimestamp(object /*, style*/) {
  return object.toISOString();
}

module.exports = new Type('tag:yaml.org,2002:timestamp', {
  kind: 'scalar',
  resolve: resolveYamlTimestamp,
  construct: constructYamlTimestamp,
  instanceOf: Date,
  represent: representYamlTimestamp
});

},{"../type":18}],35:[function(require,module,exports){
/*
  Copyright (C) 2012 Ariya Hidayat <ariya.hidayat@gmail.com>
  Copyright (C) 2012 Mathias Bynens <mathias@qiwi.be>
  Copyright (C) 2012 Joost-Wim Boekesteijn <joost-wim@boekesteijn.nl>
  Copyright (C) 2012 Kris Kowal <kris.kowal@cixar.com>
  Copyright (C) 2012 Yusuke Suzuki <utatane.tea@gmail.com>
  Copyright (C) 2012 Arpad Borsos <arpad.borsos@googlemail.com>
  Copyright (C) 2011 Ariya Hidayat <ariya.hidayat@gmail.com>

  Redistribution and use in source and binary forms, with or without
  modification, are permitted provided that the following conditions are met:

    * Redistributions of source code must retain the above copyright
      notice, this list of conditions and the following disclaimer.
    * Redistributions in binary form must reproduce the above copyright
      notice, this list of conditions and the following disclaimer in the
      documentation and/or other materials provided with the distribution.

  THIS SOFTWARE IS PROVIDED BY THE COPYRIGHT HOLDERS AND CONTRIBUTORS "AS IS"
  AND ANY EXPRESS OR IMPLIED WARRANTIES, INCLUDING, BUT NOT LIMITED TO, THE
  IMPLIED WARRANTIES OF MERCHANTABILITY AND FITNESS FOR A PARTICULAR PURPOSE
  ARE DISCLAIMED. IN NO EVENT SHALL <COPYRIGHT HOLDER> BE LIABLE FOR ANY
  DIRECT, INDIRECT, INCIDENTAL, SPECIAL, EXEMPLARY, OR CONSEQUENTIAL DAMAGES
  (INCLUDING, BUT NOT LIMITED TO, PROCUREMENT OF SUBSTITUTE GOODS OR SERVICES;
  LOSS OF USE, DATA, OR PROFITS; OR BUSINESS INTERRUPTION) HOWEVER CAUSED AND
  ON ANY THEORY OF LIABILITY, WHETHER IN CONTRACT, STRICT LIABILITY, OR TORT
  (INCLUDING NEGLIGENCE OR OTHERWISE) ARISING IN ANY WAY OUT OF THE USE OF
  THIS SOFTWARE, EVEN IF ADVISED OF THE POSSIBILITY OF SUCH DAMAGE.
*/

/*jslint bitwise:true plusplus:true */
/*global esprima:true, define:true, exports:true, window: true,
throwError: true, createLiteral: true, generateStatement: true,
parseAssignmentExpression: true, parseBlock: true, parseExpression: true,
parseFunctionDeclaration: true, parseFunctionExpression: true,
parseFunctionSourceElements: true, parseVariableIdentifier: true,
parseLeftHandSideExpression: true,
parseStatement: true, parseSourceElement: true */

(function (root, factory) {
    'use strict';

    // Universal Module Definition (UMD) to support AMD, CommonJS/Node.js,
    // Rhino, and plain browser loading.
    if (typeof define === 'function' && define.amd) {
        define(['exports'], factory);
    } else if (typeof exports !== 'undefined') {
        factory(exports);
    } else {
        factory((root.esprima = {}));
    }
}(this, function (exports) {
    'use strict';

    var Token,
        TokenName,
        Syntax,
        PropertyKind,
        Messages,
        Regex,
        source,
        strict,
        index,
        lineNumber,
        lineStart,
        length,
        buffer,
        state,
        extra;

    Token = {
        BooleanLiteral: 1,
        EOF: 2,
        Identifier: 3,
        Keyword: 4,
        NullLiteral: 5,
        NumericLiteral: 6,
        Punctuator: 7,
        StringLiteral: 8
    };

    TokenName = {};
    TokenName[Token.BooleanLiteral] = 'Boolean';
    TokenName[Token.EOF] = '<end>';
    TokenName[Token.Identifier] = 'Identifier';
    TokenName[Token.Keyword] = 'Keyword';
    TokenName[Token.NullLiteral] = 'Null';
    TokenName[Token.NumericLiteral] = 'Numeric';
    TokenName[Token.Punctuator] = 'Punctuator';
    TokenName[Token.StringLiteral] = 'String';

    Syntax = {
        AssignmentExpression: 'AssignmentExpression',
        ArrayExpression: 'ArrayExpression',
        BlockStatement: 'BlockStatement',
        BinaryExpression: 'BinaryExpression',
        BreakStatement: 'BreakStatement',
        CallExpression: 'CallExpression',
        CatchClause: 'CatchClause',
        ConditionalExpression: 'ConditionalExpression',
        ContinueStatement: 'ContinueStatement',
        DoWhileStatement: 'DoWhileStatement',
        DebuggerStatement: 'DebuggerStatement',
        EmptyStatement: 'EmptyStatement',
        ExpressionStatement: 'ExpressionStatement',
        ForStatement: 'ForStatement',
        ForInStatement: 'ForInStatement',
        FunctionDeclaration: 'FunctionDeclaration',
        FunctionExpression: 'FunctionExpression',
        Identifier: 'Identifier',
        IfStatement: 'IfStatement',
        Literal: 'Literal',
        LabeledStatement: 'LabeledStatement',
        LogicalExpression: 'LogicalExpression',
        MemberExpression: 'MemberExpression',
        NewExpression: 'NewExpression',
        ObjectExpression: 'ObjectExpression',
        Program: 'Program',
        Property: 'Property',
        ReturnStatement: 'ReturnStatement',
        SequenceExpression: 'SequenceExpression',
        SwitchStatement: 'SwitchStatement',
        SwitchCase: 'SwitchCase',
        ThisExpression: 'ThisExpression',
        ThrowStatement: 'ThrowStatement',
        TryStatement: 'TryStatement',
        UnaryExpression: 'UnaryExpression',
        UpdateExpression: 'UpdateExpression',
        VariableDeclaration: 'VariableDeclaration',
        VariableDeclarator: 'VariableDeclarator',
        WhileStatement: 'WhileStatement',
        WithStatement: 'WithStatement'
    };

    PropertyKind = {
        Data: 1,
        Get: 2,
        Set: 4
    };

    // Error messages should be identical to V8.
    Messages = {
        UnexpectedToken:  'Unexpected token %0',
        UnexpectedNumber:  'Unexpected number',
        UnexpectedString:  'Unexpected string',
        UnexpectedIdentifier:  'Unexpected identifier',
        UnexpectedReserved:  'Unexpected reserved word',
        UnexpectedEOS:  'Unexpected end of input',
        NewlineAfterThrow:  'Illegal newline after throw',
        InvalidRegExp: 'Invalid regular expression',
        UnterminatedRegExp:  'Invalid regular expression: missing /',
        InvalidLHSInAssignment:  'Invalid left-hand side in assignment',
        InvalidLHSInForIn:  'Invalid left-hand side in for-in',
        MultipleDefaultsInSwitch: 'More than one default clause in switch statement',
        NoCatchOrFinally:  'Missing catch or finally after try',
        UnknownLabel: 'Undefined label \'%0\'',
        Redeclaration: '%0 \'%1\' has already been declared',
        IllegalContinue: 'Illegal continue statement',
        IllegalBreak: 'Illegal break statement',
        IllegalReturn: 'Illegal return statement',
        StrictModeWith:  'Strict mode code may not include a with statement',
        StrictCatchVariable:  'Catch variable may not be eval or arguments in strict mode',
        StrictVarName:  'Variable name may not be eval or arguments in strict mode',
        StrictParamName:  'Parameter name eval or arguments is not allowed in strict mode',
        StrictParamDupe: 'Strict mode function may not have duplicate parameter names',
        StrictFunctionName:  'Function name may not be eval or arguments in strict mode',
        StrictOctalLiteral:  'Octal literals are not allowed in strict mode.',
        StrictDelete:  'Delete of an unqualified identifier in strict mode.',
        StrictDuplicateProperty:  'Duplicate data property in object literal not allowed in strict mode',
        AccessorDataProperty:  'Object literal may not have data and accessor property with the same name',
        AccessorGetSet:  'Object literal may not have multiple get/set accessors with the same name',
        StrictLHSAssignment:  'Assignment to eval or arguments is not allowed in strict mode',
        StrictLHSPostfix:  'Postfix increment/decrement may not have eval or arguments operand in strict mode',
        StrictLHSPrefix:  'Prefix increment/decrement may not have eval or arguments operand in strict mode',
        StrictReservedWord:  'Use of future reserved word in strict mode'
    };

    // See also tools/generate-unicode-regex.py.
    Regex = {
        NonAsciiIdentifierStart: new RegExp('[\xaa\xb5\xba\xc0-\xd6\xd8-\xf6\xf8-\u02c1\u02c6-\u02d1\u02e0-\u02e4\u02ec\u02ee\u0370-\u0374\u0376\u0377\u037a-\u037d\u0386\u0388-\u038a\u038c\u038e-\u03a1\u03a3-\u03f5\u03f7-\u0481\u048a-\u0527\u0531-\u0556\u0559\u0561-\u0587\u05d0-\u05ea\u05f0-\u05f2\u0620-\u064a\u066e\u066f\u0671-\u06d3\u06d5\u06e5\u06e6\u06ee\u06ef\u06fa-\u06fc\u06ff\u0710\u0712-\u072f\u074d-\u07a5\u07b1\u07ca-\u07ea\u07f4\u07f5\u07fa\u0800-\u0815\u081a\u0824\u0828\u0840-\u0858\u08a0\u08a2-\u08ac\u0904-\u0939\u093d\u0950\u0958-\u0961\u0971-\u0977\u0979-\u097f\u0985-\u098c\u098f\u0990\u0993-\u09a8\u09aa-\u09b0\u09b2\u09b6-\u09b9\u09bd\u09ce\u09dc\u09dd\u09df-\u09e1\u09f0\u09f1\u0a05-\u0a0a\u0a0f\u0a10\u0a13-\u0a28\u0a2a-\u0a30\u0a32\u0a33\u0a35\u0a36\u0a38\u0a39\u0a59-\u0a5c\u0a5e\u0a72-\u0a74\u0a85-\u0a8d\u0a8f-\u0a91\u0a93-\u0aa8\u0aaa-\u0ab0\u0ab2\u0ab3\u0ab5-\u0ab9\u0abd\u0ad0\u0ae0\u0ae1\u0b05-\u0b0c\u0b0f\u0b10\u0b13-\u0b28\u0b2a-\u0b30\u0b32\u0b33\u0b35-\u0b39\u0b3d\u0b5c\u0b5d\u0b5f-\u0b61\u0b71\u0b83\u0b85-\u0b8a\u0b8e-\u0b90\u0b92-\u0b95\u0b99\u0b9a\u0b9c\u0b9e\u0b9f\u0ba3\u0ba4\u0ba8-\u0baa\u0bae-\u0bb9\u0bd0\u0c05-\u0c0c\u0c0e-\u0c10\u0c12-\u0c28\u0c2a-\u0c33\u0c35-\u0c39\u0c3d\u0c58\u0c59\u0c60\u0c61\u0c85-\u0c8c\u0c8e-\u0c90\u0c92-\u0ca8\u0caa-\u0cb3\u0cb5-\u0cb9\u0cbd\u0cde\u0ce0\u0ce1\u0cf1\u0cf2\u0d05-\u0d0c\u0d0e-\u0d10\u0d12-\u0d3a\u0d3d\u0d4e\u0d60\u0d61\u0d7a-\u0d7f\u0d85-\u0d96\u0d9a-\u0db1\u0db3-\u0dbb\u0dbd\u0dc0-\u0dc6\u0e01-\u0e30\u0e32\u0e33\u0e40-\u0e46\u0e81\u0e82\u0e84\u0e87\u0e88\u0e8a\u0e8d\u0e94-\u0e97\u0e99-\u0e9f\u0ea1-\u0ea3\u0ea5\u0ea7\u0eaa\u0eab\u0ead-\u0eb0\u0eb2\u0eb3\u0ebd\u0ec0-\u0ec4\u0ec6\u0edc-\u0edf\u0f00\u0f40-\u0f47\u0f49-\u0f6c\u0f88-\u0f8c\u1000-\u102a\u103f\u1050-\u1055\u105a-\u105d\u1061\u1065\u1066\u106e-\u1070\u1075-\u1081\u108e\u10a0-\u10c5\u10c7\u10cd\u10d0-\u10fa\u10fc-\u1248\u124a-\u124d\u1250-\u1256\u1258\u125a-\u125d\u1260-\u1288\u128a-\u128d\u1290-\u12b0\u12b2-\u12b5\u12b8-\u12be\u12c0\u12c2-\u12c5\u12c8-\u12d6\u12d8-\u1310\u1312-\u1315\u1318-\u135a\u1380-\u138f\u13a0-\u13f4\u1401-\u166c\u166f-\u167f\u1681-\u169a\u16a0-\u16ea\u16ee-\u16f0\u1700-\u170c\u170e-\u1711\u1720-\u1731\u1740-\u1751\u1760-\u176c\u176e-\u1770\u1780-\u17b3\u17d7\u17dc\u1820-\u1877\u1880-\u18a8\u18aa\u18b0-\u18f5\u1900-\u191c\u1950-\u196d\u1970-\u1974\u1980-\u19ab\u19c1-\u19c7\u1a00-\u1a16\u1a20-\u1a54\u1aa7\u1b05-\u1b33\u1b45-\u1b4b\u1b83-\u1ba0\u1bae\u1baf\u1bba-\u1be5\u1c00-\u1c23\u1c4d-\u1c4f\u1c5a-\u1c7d\u1ce9-\u1cec\u1cee-\u1cf1\u1cf5\u1cf6\u1d00-\u1dbf\u1e00-\u1f15\u1f18-\u1f1d\u1f20-\u1f45\u1f48-\u1f4d\u1f50-\u1f57\u1f59\u1f5b\u1f5d\u1f5f-\u1f7d\u1f80-\u1fb4\u1fb6-\u1fbc\u1fbe\u1fc2-\u1fc4\u1fc6-\u1fcc\u1fd0-\u1fd3\u1fd6-\u1fdb\u1fe0-\u1fec\u1ff2-\u1ff4\u1ff6-\u1ffc\u2071\u207f\u2090-\u209c\u2102\u2107\u210a-\u2113\u2115\u2119-\u211d\u2124\u2126\u2128\u212a-\u212d\u212f-\u2139\u213c-\u213f\u2145-\u2149\u214e\u2160-\u2188\u2c00-\u2c2e\u2c30-\u2c5e\u2c60-\u2ce4\u2ceb-\u2cee\u2cf2\u2cf3\u2d00-\u2d25\u2d27\u2d2d\u2d30-\u2d67\u2d6f\u2d80-\u2d96\u2da0-\u2da6\u2da8-\u2dae\u2db0-\u2db6\u2db8-\u2dbe\u2dc0-\u2dc6\u2dc8-\u2dce\u2dd0-\u2dd6\u2dd8-\u2dde\u2e2f\u3005-\u3007\u3021-\u3029\u3031-\u3035\u3038-\u303c\u3041-\u3096\u309d-\u309f\u30a1-\u30fa\u30fc-\u30ff\u3105-\u312d\u3131-\u318e\u31a0-\u31ba\u31f0-\u31ff\u3400-\u4db5\u4e00-\u9fcc\ua000-\ua48c\ua4d0-\ua4fd\ua500-\ua60c\ua610-\ua61f\ua62a\ua62b\ua640-\ua66e\ua67f-\ua697\ua6a0-\ua6ef\ua717-\ua71f\ua722-\ua788\ua78b-\ua78e\ua790-\ua793\ua7a0-\ua7aa\ua7f8-\ua801\ua803-\ua805\ua807-\ua80a\ua80c-\ua822\ua840-\ua873\ua882-\ua8b3\ua8f2-\ua8f7\ua8fb\ua90a-\ua925\ua930-\ua946\ua960-\ua97c\ua984-\ua9b2\ua9cf\uaa00-\uaa28\uaa40-\uaa42\uaa44-\uaa4b\uaa60-\uaa76\uaa7a\uaa80-\uaaaf\uaab1\uaab5\uaab6\uaab9-\uaabd\uaac0\uaac2\uaadb-\uaadd\uaae0-\uaaea\uaaf2-\uaaf4\uab01-\uab06\uab09-\uab0e\uab11-\uab16\uab20-\uab26\uab28-\uab2e\uabc0-\uabe2\uac00-\ud7a3\ud7b0-\ud7c6\ud7cb-\ud7fb\uf900-\ufa6d\ufa70-\ufad9\ufb00-\ufb06\ufb13-\ufb17\ufb1d\ufb1f-\ufb28\ufb2a-\ufb36\ufb38-\ufb3c\ufb3e\ufb40\ufb41\ufb43\ufb44\ufb46-\ufbb1\ufbd3-\ufd3d\ufd50-\ufd8f\ufd92-\ufdc7\ufdf0-\ufdfb\ufe70-\ufe74\ufe76-\ufefc\uff21-\uff3a\uff41-\uff5a\uff66-\uffbe\uffc2-\uffc7\uffca-\uffcf\uffd2-\uffd7\uffda-\uffdc]'),
        NonAsciiIdentifierPart: new RegExp('[\xaa\xb5\xba\xc0-\xd6\xd8-\xf6\xf8-\u02c1\u02c6-\u02d1\u02e0-\u02e4\u02ec\u02ee\u0300-\u0374\u0376\u0377\u037a-\u037d\u0386\u0388-\u038a\u038c\u038e-\u03a1\u03a3-\u03f5\u03f7-\u0481\u0483-\u0487\u048a-\u0527\u0531-\u0556\u0559\u0561-\u0587\u0591-\u05bd\u05bf\u05c1\u05c2\u05c4\u05c5\u05c7\u05d0-\u05ea\u05f0-\u05f2\u0610-\u061a\u0620-\u0669\u066e-\u06d3\u06d5-\u06dc\u06df-\u06e8\u06ea-\u06fc\u06ff\u0710-\u074a\u074d-\u07b1\u07c0-\u07f5\u07fa\u0800-\u082d\u0840-\u085b\u08a0\u08a2-\u08ac\u08e4-\u08fe\u0900-\u0963\u0966-\u096f\u0971-\u0977\u0979-\u097f\u0981-\u0983\u0985-\u098c\u098f\u0990\u0993-\u09a8\u09aa-\u09b0\u09b2\u09b6-\u09b9\u09bc-\u09c4\u09c7\u09c8\u09cb-\u09ce\u09d7\u09dc\u09dd\u09df-\u09e3\u09e6-\u09f1\u0a01-\u0a03\u0a05-\u0a0a\u0a0f\u0a10\u0a13-\u0a28\u0a2a-\u0a30\u0a32\u0a33\u0a35\u0a36\u0a38\u0a39\u0a3c\u0a3e-\u0a42\u0a47\u0a48\u0a4b-\u0a4d\u0a51\u0a59-\u0a5c\u0a5e\u0a66-\u0a75\u0a81-\u0a83\u0a85-\u0a8d\u0a8f-\u0a91\u0a93-\u0aa8\u0aaa-\u0ab0\u0ab2\u0ab3\u0ab5-\u0ab9\u0abc-\u0ac5\u0ac7-\u0ac9\u0acb-\u0acd\u0ad0\u0ae0-\u0ae3\u0ae6-\u0aef\u0b01-\u0b03\u0b05-\u0b0c\u0b0f\u0b10\u0b13-\u0b28\u0b2a-\u0b30\u0b32\u0b33\u0b35-\u0b39\u0b3c-\u0b44\u0b47\u0b48\u0b4b-\u0b4d\u0b56\u0b57\u0b5c\u0b5d\u0b5f-\u0b63\u0b66-\u0b6f\u0b71\u0b82\u0b83\u0b85-\u0b8a\u0b8e-\u0b90\u0b92-\u0b95\u0b99\u0b9a\u0b9c\u0b9e\u0b9f\u0ba3\u0ba4\u0ba8-\u0baa\u0bae-\u0bb9\u0bbe-\u0bc2\u0bc6-\u0bc8\u0bca-\u0bcd\u0bd0\u0bd7\u0be6-\u0bef\u0c01-\u0c03\u0c05-\u0c0c\u0c0e-\u0c10\u0c12-\u0c28\u0c2a-\u0c33\u0c35-\u0c39\u0c3d-\u0c44\u0c46-\u0c48\u0c4a-\u0c4d\u0c55\u0c56\u0c58\u0c59\u0c60-\u0c63\u0c66-\u0c6f\u0c82\u0c83\u0c85-\u0c8c\u0c8e-\u0c90\u0c92-\u0ca8\u0caa-\u0cb3\u0cb5-\u0cb9\u0cbc-\u0cc4\u0cc6-\u0cc8\u0cca-\u0ccd\u0cd5\u0cd6\u0cde\u0ce0-\u0ce3\u0ce6-\u0cef\u0cf1\u0cf2\u0d02\u0d03\u0d05-\u0d0c\u0d0e-\u0d10\u0d12-\u0d3a\u0d3d-\u0d44\u0d46-\u0d48\u0d4a-\u0d4e\u0d57\u0d60-\u0d63\u0d66-\u0d6f\u0d7a-\u0d7f\u0d82\u0d83\u0d85-\u0d96\u0d9a-\u0db1\u0db3-\u0dbb\u0dbd\u0dc0-\u0dc6\u0dca\u0dcf-\u0dd4\u0dd6\u0dd8-\u0ddf\u0df2\u0df3\u0e01-\u0e3a\u0e40-\u0e4e\u0e50-\u0e59\u0e81\u0e82\u0e84\u0e87\u0e88\u0e8a\u0e8d\u0e94-\u0e97\u0e99-\u0e9f\u0ea1-\u0ea3\u0ea5\u0ea7\u0eaa\u0eab\u0ead-\u0eb9\u0ebb-\u0ebd\u0ec0-\u0ec4\u0ec6\u0ec8-\u0ecd\u0ed0-\u0ed9\u0edc-\u0edf\u0f00\u0f18\u0f19\u0f20-\u0f29\u0f35\u0f37\u0f39\u0f3e-\u0f47\u0f49-\u0f6c\u0f71-\u0f84\u0f86-\u0f97\u0f99-\u0fbc\u0fc6\u1000-\u1049\u1050-\u109d\u10a0-\u10c5\u10c7\u10cd\u10d0-\u10fa\u10fc-\u1248\u124a-\u124d\u1250-\u1256\u1258\u125a-\u125d\u1260-\u1288\u128a-\u128d\u1290-\u12b0\u12b2-\u12b5\u12b8-\u12be\u12c0\u12c2-\u12c5\u12c8-\u12d6\u12d8-\u1310\u1312-\u1315\u1318-\u135a\u135d-\u135f\u1380-\u138f\u13a0-\u13f4\u1401-\u166c\u166f-\u167f\u1681-\u169a\u16a0-\u16ea\u16ee-\u16f0\u1700-\u170c\u170e-\u1714\u1720-\u1734\u1740-\u1753\u1760-\u176c\u176e-\u1770\u1772\u1773\u1780-\u17d3\u17d7\u17dc\u17dd\u17e0-\u17e9\u180b-\u180d\u1810-\u1819\u1820-\u1877\u1880-\u18aa\u18b0-\u18f5\u1900-\u191c\u1920-\u192b\u1930-\u193b\u1946-\u196d\u1970-\u1974\u1980-\u19ab\u19b0-\u19c9\u19d0-\u19d9\u1a00-\u1a1b\u1a20-\u1a5e\u1a60-\u1a7c\u1a7f-\u1a89\u1a90-\u1a99\u1aa7\u1b00-\u1b4b\u1b50-\u1b59\u1b6b-\u1b73\u1b80-\u1bf3\u1c00-\u1c37\u1c40-\u1c49\u1c4d-\u1c7d\u1cd0-\u1cd2\u1cd4-\u1cf6\u1d00-\u1de6\u1dfc-\u1f15\u1f18-\u1f1d\u1f20-\u1f45\u1f48-\u1f4d\u1f50-\u1f57\u1f59\u1f5b\u1f5d\u1f5f-\u1f7d\u1f80-\u1fb4\u1fb6-\u1fbc\u1fbe\u1fc2-\u1fc4\u1fc6-\u1fcc\u1fd0-\u1fd3\u1fd6-\u1fdb\u1fe0-\u1fec\u1ff2-\u1ff4\u1ff6-\u1ffc\u200c\u200d\u203f\u2040\u2054\u2071\u207f\u2090-\u209c\u20d0-\u20dc\u20e1\u20e5-\u20f0\u2102\u2107\u210a-\u2113\u2115\u2119-\u211d\u2124\u2126\u2128\u212a-\u212d\u212f-\u2139\u213c-\u213f\u2145-\u2149\u214e\u2160-\u2188\u2c00-\u2c2e\u2c30-\u2c5e\u2c60-\u2ce4\u2ceb-\u2cf3\u2d00-\u2d25\u2d27\u2d2d\u2d30-\u2d67\u2d6f\u2d7f-\u2d96\u2da0-\u2da6\u2da8-\u2dae\u2db0-\u2db6\u2db8-\u2dbe\u2dc0-\u2dc6\u2dc8-\u2dce\u2dd0-\u2dd6\u2dd8-\u2dde\u2de0-\u2dff\u2e2f\u3005-\u3007\u3021-\u302f\u3031-\u3035\u3038-\u303c\u3041-\u3096\u3099\u309a\u309d-\u309f\u30a1-\u30fa\u30fc-\u30ff\u3105-\u312d\u3131-\u318e\u31a0-\u31ba\u31f0-\u31ff\u3400-\u4db5\u4e00-\u9fcc\ua000-\ua48c\ua4d0-\ua4fd\ua500-\ua60c\ua610-\ua62b\ua640-\ua66f\ua674-\ua67d\ua67f-\ua697\ua69f-\ua6f1\ua717-\ua71f\ua722-\ua788\ua78b-\ua78e\ua790-\ua793\ua7a0-\ua7aa\ua7f8-\ua827\ua840-\ua873\ua880-\ua8c4\ua8d0-\ua8d9\ua8e0-\ua8f7\ua8fb\ua900-\ua92d\ua930-\ua953\ua960-\ua97c\ua980-\ua9c0\ua9cf-\ua9d9\uaa00-\uaa36\uaa40-\uaa4d\uaa50-\uaa59\uaa60-\uaa76\uaa7a\uaa7b\uaa80-\uaac2\uaadb-\uaadd\uaae0-\uaaef\uaaf2-\uaaf6\uab01-\uab06\uab09-\uab0e\uab11-\uab16\uab20-\uab26\uab28-\uab2e\uabc0-\uabea\uabec\uabed\uabf0-\uabf9\uac00-\ud7a3\ud7b0-\ud7c6\ud7cb-\ud7fb\uf900-\ufa6d\ufa70-\ufad9\ufb00-\ufb06\ufb13-\ufb17\ufb1d-\ufb28\ufb2a-\ufb36\ufb38-\ufb3c\ufb3e\ufb40\ufb41\ufb43\ufb44\ufb46-\ufbb1\ufbd3-\ufd3d\ufd50-\ufd8f\ufd92-\ufdc7\ufdf0-\ufdfb\ufe00-\ufe0f\ufe20-\ufe26\ufe33\ufe34\ufe4d-\ufe4f\ufe70-\ufe74\ufe76-\ufefc\uff10-\uff19\uff21-\uff3a\uff3f\uff41-\uff5a\uff66-\uffbe\uffc2-\uffc7\uffca-\uffcf\uffd2-\uffd7\uffda-\uffdc]')
    };

    // Ensure the condition is true, otherwise throw an error.
    // This is only to have a better contract semantic, i.e. another safety net
    // to catch a logic error. The condition shall be fulfilled in normal case.
    // Do NOT use this to enforce a certain condition on any user input.

    function assert(condition, message) {
        if (!condition) {
            throw new Error('ASSERT: ' + message);
        }
    }

    function sliceSource(from, to) {
        return source.slice(from, to);
    }

    if (typeof 'esprima'[0] === 'undefined') {
        sliceSource = function sliceArraySource(from, to) {
            return source.slice(from, to).join('');
        };
    }

    function isDecimalDigit(ch) {
        return '0123456789'.indexOf(ch) >= 0;
    }

    function isHexDigit(ch) {
        return '0123456789abcdefABCDEF'.indexOf(ch) >= 0;
    }

    function isOctalDigit(ch) {
        return '01234567'.indexOf(ch) >= 0;
    }


    // 7.2 White Space

    function isWhiteSpace(ch) {
        return (ch === ' ') || (ch === '\u0009') || (ch === '\u000B') ||
            (ch === '\u000C') || (ch === '\u00A0') ||
            (ch.charCodeAt(0) >= 0x1680 &&
             '\u1680\u180E\u2000\u2001\u2002\u2003\u2004\u2005\u2006\u2007\u2008\u2009\u200A\u202F\u205F\u3000\uFEFF'.indexOf(ch) >= 0);
    }

    // 7.3 Line Terminators

    function isLineTerminator(ch) {
        return (ch === '\n' || ch === '\r' || ch === '\u2028' || ch === '\u2029');
    }

    // 7.6 Identifier Names and Identifiers

    function isIdentifierStart(ch) {
        return (ch === '$') || (ch === '_') || (ch === '\\') ||
            (ch >= 'a' && ch <= 'z') || (ch >= 'A' && ch <= 'Z') ||
            ((ch.charCodeAt(0) >= 0x80) && Regex.NonAsciiIdentifierStart.test(ch));
    }

    function isIdentifierPart(ch) {
        return (ch === '$') || (ch === '_') || (ch === '\\') ||
            (ch >= 'a' && ch <= 'z') || (ch >= 'A' && ch <= 'Z') ||
            ((ch >= '0') && (ch <= '9')) ||
            ((ch.charCodeAt(0) >= 0x80) && Regex.NonAsciiIdentifierPart.test(ch));
    }

    // 7.6.1.2 Future Reserved Words

    function isFutureReservedWord(id) {
        switch (id) {

        // Future reserved words.
        case 'class':
        case 'enum':
        case 'export':
        case 'extends':
        case 'import':
        case 'super':
            return true;
        }

        return false;
    }

    function isStrictModeReservedWord(id) {
        switch (id) {

        // Strict Mode reserved words.
        case 'implements':
        case 'interface':
        case 'package':
        case 'private':
        case 'protected':
        case 'public':
        case 'static':
        case 'yield':
        case 'let':
            return true;
        }

        return false;
    }

    function isRestrictedWord(id) {
        return id === 'eval' || id === 'arguments';
    }

    // 7.6.1.1 Keywords

    function isKeyword(id) {
        var keyword = false;
        switch (id.length) {
        case 2:
            keyword = (id === 'if') || (id === 'in') || (id === 'do');
            break;
        case 3:
            keyword = (id === 'var') || (id === 'for') || (id === 'new') || (id === 'try');
            break;
        case 4:
            keyword = (id === 'this') || (id === 'else') || (id === 'case') || (id === 'void') || (id === 'with');
            break;
        case 5:
            keyword = (id === 'while') || (id === 'break') || (id === 'catch') || (id === 'throw');
            break;
        case 6:
            keyword = (id === 'return') || (id === 'typeof') || (id === 'delete') || (id === 'switch');
            break;
        case 7:
            keyword = (id === 'default') || (id === 'finally');
            break;
        case 8:
            keyword = (id === 'function') || (id === 'continue') || (id === 'debugger');
            break;
        case 10:
            keyword = (id === 'instanceof');
            break;
        }

        if (keyword) {
            return true;
        }

        switch (id) {
        // Future reserved words.
        // 'const' is specialized as Keyword in V8.
        case 'const':
            return true;

        // For compatiblity to SpiderMonkey and ES.next
        case 'yield':
        case 'let':
            return true;
        }

        if (strict && isStrictModeReservedWord(id)) {
            return true;
        }

        return isFutureReservedWord(id);
    }

    // 7.4 Comments

    function skipComment() {
        var ch, blockComment, lineComment;

        blockComment = false;
        lineComment = false;

        while (index < length) {
            ch = source[index];

            if (lineComment) {
                ch = source[index++];
                if (isLineTerminator(ch)) {
                    lineComment = false;
                    if (ch === '\r' && source[index] === '\n') {
                        ++index;
                    }
                    ++lineNumber;
                    lineStart = index;
                }
            } else if (blockComment) {
                if (isLineTerminator(ch)) {
                    if (ch === '\r' && source[index + 1] === '\n') {
                        ++index;
                    }
                    ++lineNumber;
                    ++index;
                    lineStart = index;
                    if (index >= length) {
                        throwError({}, Messages.UnexpectedToken, 'ILLEGAL');
                    }
                } else {
                    ch = source[index++];
                    if (index >= length) {
                        throwError({}, Messages.UnexpectedToken, 'ILLEGAL');
                    }
                    if (ch === '*') {
                        ch = source[index];
                        if (ch === '/') {
                            ++index;
                            blockComment = false;
                        }
                    }
                }
            } else if (ch === '/') {
                ch = source[index + 1];
                if (ch === '/') {
                    index += 2;
                    lineComment = true;
                } else if (ch === '*') {
                    index += 2;
                    blockComment = true;
                    if (index >= length) {
                        throwError({}, Messages.UnexpectedToken, 'ILLEGAL');
                    }
                } else {
                    break;
                }
            } else if (isWhiteSpace(ch)) {
                ++index;
            } else if (isLineTerminator(ch)) {
                ++index;
                if (ch ===  '\r' && source[index] === '\n') {
                    ++index;
                }
                ++lineNumber;
                lineStart = index;
            } else {
                break;
            }
        }
    }

    function scanHexEscape(prefix) {
        var i, len, ch, code = 0;

        len = (prefix === 'u') ? 4 : 2;
        for (i = 0; i < len; ++i) {
            if (index < length && isHexDigit(source[index])) {
                ch = source[index++];
                code = code * 16 + '0123456789abcdef'.indexOf(ch.toLowerCase());
            } else {
                return '';
            }
        }
        return String.fromCharCode(code);
    }

    function scanIdentifier() {
        var ch, start, id, restore;

        ch = source[index];
        if (!isIdentifierStart(ch)) {
            return;
        }

        start = index;
        if (ch === '\\') {
            ++index;
            if (source[index] !== 'u') {
                return;
            }
            ++index;
            restore = index;
            ch = scanHexEscape('u');
            if (ch) {
                if (ch === '\\' || !isIdentifierStart(ch)) {
                    return;
                }
                id = ch;
            } else {
                index = restore;
                id = 'u';
            }
        } else {
            id = source[index++];
        }

        while (index < length) {
            ch = source[index];
            if (!isIdentifierPart(ch)) {
                break;
            }
            if (ch === '\\') {
                ++index;
                if (source[index] !== 'u') {
                    return;
                }
                ++index;
                restore = index;
                ch = scanHexEscape('u');
                if (ch) {
                    if (ch === '\\' || !isIdentifierPart(ch)) {
                        return;
                    }
                    id += ch;
                } else {
                    index = restore;
                    id += 'u';
                }
            } else {
                id += source[index++];
            }
        }

        // There is no keyword or literal with only one character.
        // Thus, it must be an identifier.
        if (id.length === 1) {
            return {
                type: Token.Identifier,
                value: id,
                lineNumber: lineNumber,
                lineStart: lineStart,
                range: [start, index]
            };
        }

        if (isKeyword(id)) {
            return {
                type: Token.Keyword,
                value: id,
                lineNumber: lineNumber,
                lineStart: lineStart,
                range: [start, index]
            };
        }

        // 7.8.1 Null Literals

        if (id === 'null') {
            return {
                type: Token.NullLiteral,
                value: id,
                lineNumber: lineNumber,
                lineStart: lineStart,
                range: [start, index]
            };
        }

        // 7.8.2 Boolean Literals

        if (id === 'true' || id === 'false') {
            return {
                type: Token.BooleanLiteral,
                value: id,
                lineNumber: lineNumber,
                lineStart: lineStart,
                range: [start, index]
            };
        }

        return {
            type: Token.Identifier,
            value: id,
            lineNumber: lineNumber,
            lineStart: lineStart,
            range: [start, index]
        };
    }

    // 7.7 Punctuators

    function scanPunctuator() {
        var start = index,
            ch1 = source[index],
            ch2,
            ch3,
            ch4;

        // Check for most common single-character punctuators.

        if (ch1 === ';' || ch1 === '{' || ch1 === '}') {
            ++index;
            return {
                type: Token.Punctuator,
                value: ch1,
                lineNumber: lineNumber,
                lineStart: lineStart,
                range: [start, index]
            };
        }

        if (ch1 === ',' || ch1 === '(' || ch1 === ')') {
            ++index;
            return {
                type: Token.Punctuator,
                value: ch1,
                lineNumber: lineNumber,
                lineStart: lineStart,
                range: [start, index]
            };
        }

        // Dot (.) can also start a floating-point number, hence the need
        // to check the next character.

        ch2 = source[index + 1];
        if (ch1 === '.' && !isDecimalDigit(ch2)) {
            return {
                type: Token.Punctuator,
                value: source[index++],
                lineNumber: lineNumber,
                lineStart: lineStart,
                range: [start, index]
            };
        }

        // Peek more characters.

        ch3 = source[index + 2];
        ch4 = source[index + 3];

        // 4-character punctuator: >>>=

        if (ch1 === '>' && ch2 === '>' && ch3 === '>') {
            if (ch4 === '=') {
                index += 4;
                return {
                    type: Token.Punctuator,
                    value: '>>>=',
                    lineNumber: lineNumber,
                    lineStart: lineStart,
                    range: [start, index]
                };
            }
        }

        // 3-character punctuators: === !== >>> <<= >>=

        if (ch1 === '=' && ch2 === '=' && ch3 === '=') {
            index += 3;
            return {
                type: Token.Punctuator,
                value: '===',
                lineNumber: lineNumber,
                lineStart: lineStart,
                range: [start, index]
            };
        }

        if (ch1 === '!' && ch2 === '=' && ch3 === '=') {
            index += 3;
            return {
                type: Token.Punctuator,
                value: '!==',
                lineNumber: lineNumber,
                lineStart: lineStart,
                range: [start, index]
            };
        }

        if (ch1 === '>' && ch2 === '>' && ch3 === '>') {
            index += 3;
            return {
                type: Token.Punctuator,
                value: '>>>',
                lineNumber: lineNumber,
                lineStart: lineStart,
                range: [start, index]
            };
        }

        if (ch1 === '<' && ch2 === '<' && ch3 === '=') {
            index += 3;
            return {
                type: Token.Punctuator,
                value: '<<=',
                lineNumber: lineNumber,
                lineStart: lineStart,
                range: [start, index]
            };
        }

        if (ch1 === '>' && ch2 === '>' && ch3 === '=') {
            index += 3;
            return {
                type: Token.Punctuator,
                value: '>>=',
                lineNumber: lineNumber,
                lineStart: lineStart,
                range: [start, index]
            };
        }

        // 2-character punctuators: <= >= == != ++ -- << >> && ||
        // += -= *= %= &= |= ^= /=

        if (ch2 === '=') {
            if ('<>=!+-*%&|^/'.indexOf(ch1) >= 0) {
                index += 2;
                return {
                    type: Token.Punctuator,
                    value: ch1 + ch2,
                    lineNumber: lineNumber,
                    lineStart: lineStart,
                    range: [start, index]
                };
            }
        }

        if (ch1 === ch2 && ('+-<>&|'.indexOf(ch1) >= 0)) {
            if ('+-<>&|'.indexOf(ch2) >= 0) {
                index += 2;
                return {
                    type: Token.Punctuator,
                    value: ch1 + ch2,
                    lineNumber: lineNumber,
                    lineStart: lineStart,
                    range: [start, index]
                };
            }
        }

        // The remaining 1-character punctuators.

        if ('[]<>+-*%&|^!~?:=/'.indexOf(ch1) >= 0) {
            return {
                type: Token.Punctuator,
                value: source[index++],
                lineNumber: lineNumber,
                lineStart: lineStart,
                range: [start, index]
            };
        }
    }

    // 7.8.3 Numeric Literals

    function scanNumericLiteral() {
        var number, start, ch;

        ch = source[index];
        assert(isDecimalDigit(ch) || (ch === '.'),
            'Numeric literal must start with a decimal digit or a decimal point');

        start = index;
        number = '';
        if (ch !== '.') {
            number = source[index++];
            ch = source[index];

            // Hex number starts with '0x'.
            // Octal number starts with '0'.
            if (number === '0') {
                if (ch === 'x' || ch === 'X') {
                    number += source[index++];
                    while (index < length) {
                        ch = source[index];
                        if (!isHexDigit(ch)) {
                            break;
                        }
                        number += source[index++];
                    }

                    if (number.length <= 2) {
                        // only 0x
                        throwError({}, Messages.UnexpectedToken, 'ILLEGAL');
                    }

                    if (index < length) {
                        ch = source[index];
                        if (isIdentifierStart(ch)) {
                            throwError({}, Messages.UnexpectedToken, 'ILLEGAL');
                        }
                    }
                    return {
                        type: Token.NumericLiteral,
                        value: parseInt(number, 16),
                        lineNumber: lineNumber,
                        lineStart: lineStart,
                        range: [start, index]
                    };
                } else if (isOctalDigit(ch)) {
                    number += source[index++];
                    while (index < length) {
                        ch = source[index];
                        if (!isOctalDigit(ch)) {
                            break;
                        }
                        number += source[index++];
                    }

                    if (index < length) {
                        ch = source[index];
                        if (isIdentifierStart(ch) || isDecimalDigit(ch)) {
                            throwError({}, Messages.UnexpectedToken, 'ILLEGAL');
                        }
                    }
                    return {
                        type: Token.NumericLiteral,
                        value: parseInt(number, 8),
                        octal: true,
                        lineNumber: lineNumber,
                        lineStart: lineStart,
                        range: [start, index]
                    };
                }

                // decimal number starts with '0' such as '09' is illegal.
                if (isDecimalDigit(ch)) {
                    throwError({}, Messages.UnexpectedToken, 'ILLEGAL');
                }
            }

            while (index < length) {
                ch = source[index];
                if (!isDecimalDigit(ch)) {
                    break;
                }
                number += source[index++];
            }
        }

        if (ch === '.') {
            number += source[index++];
            while (index < length) {
                ch = source[index];
                if (!isDecimalDigit(ch)) {
                    break;
                }
                number += source[index++];
            }
        }

        if (ch === 'e' || ch === 'E') {
            number += source[index++];

            ch = source[index];
            if (ch === '+' || ch === '-') {
                number += source[index++];
            }

            ch = source[index];
            if (isDecimalDigit(ch)) {
                number += source[index++];
                while (index < length) {
                    ch = source[index];
                    if (!isDecimalDigit(ch)) {
                        break;
                    }
                    number += source[index++];
                }
            } else {
                ch = 'character ' + ch;
                if (index >= length) {
                    ch = '<end>';
                }
                throwError({}, Messages.UnexpectedToken, 'ILLEGAL');
            }
        }

        if (index < length) {
            ch = source[index];
            if (isIdentifierStart(ch)) {
                throwError({}, Messages.UnexpectedToken, 'ILLEGAL');
            }
        }

        return {
            type: Token.NumericLiteral,
            value: parseFloat(number),
            lineNumber: lineNumber,
            lineStart: lineStart,
            range: [start, index]
        };
    }

    // 7.8.4 String Literals

    function scanStringLiteral() {
        var str = '', quote, start, ch, code, unescaped, restore, octal = false;

        quote = source[index];
        assert((quote === '\'' || quote === '"'),
            'String literal must starts with a quote');

        start = index;
        ++index;

        while (index < length) {
            ch = source[index++];

            if (ch === quote) {
                quote = '';
                break;
            } else if (ch === '\\') {
                ch = source[index++];
                if (!isLineTerminator(ch)) {
                    switch (ch) {
                    case 'n':
                        str += '\n';
                        break;
                    case 'r':
                        str += '\r';
                        break;
                    case 't':
                        str += '\t';
                        break;
                    case 'u':
                    case 'x':
                        restore = index;
                        unescaped = scanHexEscape(ch);
                        if (unescaped) {
                            str += unescaped;
                        } else {
                            index = restore;
                            str += ch;
                        }
                        break;
                    case 'b':
                        str += '\b';
                        break;
                    case 'f':
                        str += '\f';
                        break;
                    case 'v':
                        str += '\x0B';
                        break;

                    default:
                        if (isOctalDigit(ch)) {
                            code = '01234567'.indexOf(ch);

                            // \0 is not octal escape sequence
                            if (code !== 0) {
                                octal = true;
                            }

                            if (index < length && isOctalDigit(source[index])) {
                                octal = true;
                                code = code * 8 + '01234567'.indexOf(source[index++]);

                                // 3 digits are only allowed when string starts
                                // with 0, 1, 2, 3
                                if ('0123'.indexOf(ch) >= 0 &&
                                        index < length &&
                                        isOctalDigit(source[index])) {
                                    code = code * 8 + '01234567'.indexOf(source[index++]);
                                }
                            }
                            str += String.fromCharCode(code);
                        } else {
                            str += ch;
                        }
                        break;
                    }
                } else {
                    ++lineNumber;
                    if (ch ===  '\r' && source[index] === '\n') {
                        ++index;
                    }
                }
            } else if (isLineTerminator(ch)) {
                break;
            } else {
                str += ch;
            }
        }

        if (quote !== '') {
            throwError({}, Messages.UnexpectedToken, 'ILLEGAL');
        }

        return {
            type: Token.StringLiteral,
            value: str,
            octal: octal,
            lineNumber: lineNumber,
            lineStart: lineStart,
            range: [start, index]
        };
    }

    function scanRegExp() {
        var str, ch, start, pattern, flags, value, classMarker = false, restore, terminated = false;

        buffer = null;
        skipComment();

        start = index;
        ch = source[index];
        assert(ch === '/', 'Regular expression literal must start with a slash');
        str = source[index++];

        while (index < length) {
            ch = source[index++];
            str += ch;
            if (ch === '\\') {
                ch = source[index++];
                // ECMA-262 7.8.5
                if (isLineTerminator(ch)) {
                    throwError({}, Messages.UnterminatedRegExp);
                }
                str += ch;
            } else if (classMarker) {
                if (ch === ']') {
                    classMarker = false;
                }
            } else {
                if (ch === '/') {
                    terminated = true;
                    break;
                } else if (ch === '[') {
                    classMarker = true;
                } else if (isLineTerminator(ch)) {
                    throwError({}, Messages.UnterminatedRegExp);
                }
            }
        }

        if (!terminated) {
            throwError({}, Messages.UnterminatedRegExp);
        }

        // Exclude leading and trailing slash.
        pattern = str.substr(1, str.length - 2);

        flags = '';
        while (index < length) {
            ch = source[index];
            if (!isIdentifierPart(ch)) {
                break;
            }

            ++index;
            if (ch === '\\' && index < length) {
                ch = source[index];
                if (ch === 'u') {
                    ++index;
                    restore = index;
                    ch = scanHexEscape('u');
                    if (ch) {
                        flags += ch;
                        str += '\\u';
                        for (; restore < index; ++restore) {
                            str += source[restore];
                        }
                    } else {
                        index = restore;
                        flags += 'u';
                        str += '\\u';
                    }
                } else {
                    str += '\\';
                }
            } else {
                flags += ch;
                str += ch;
            }
        }

        try {
            value = new RegExp(pattern, flags);
        } catch (e) {
            throwError({}, Messages.InvalidRegExp);
        }

        return {
            literal: str,
            value: value,
            range: [start, index]
        };
    }

    function isIdentifierName(token) {
        return token.type === Token.Identifier ||
            token.type === Token.Keyword ||
            token.type === Token.BooleanLiteral ||
            token.type === Token.NullLiteral;
    }

    function advance() {
        var ch, token;

        skipComment();

        if (index >= length) {
            return {
                type: Token.EOF,
                lineNumber: lineNumber,
                lineStart: lineStart,
                range: [index, index]
            };
        }

        token = scanPunctuator();
        if (typeof token !== 'undefined') {
            return token;
        }

        ch = source[index];

        if (ch === '\'' || ch === '"') {
            return scanStringLiteral();
        }

        if (ch === '.' || isDecimalDigit(ch)) {
            return scanNumericLiteral();
        }

        token = scanIdentifier();
        if (typeof token !== 'undefined') {
            return token;
        }

        throwError({}, Messages.UnexpectedToken, 'ILLEGAL');
    }

    function lex() {
        var token;

        if (buffer) {
            index = buffer.range[1];
            lineNumber = buffer.lineNumber;
            lineStart = buffer.lineStart;
            token = buffer;
            buffer = null;
            return token;
        }

        buffer = null;
        return advance();
    }

    function lookahead() {
        var pos, line, start;

        if (buffer !== null) {
            return buffer;
        }

        pos = index;
        line = lineNumber;
        start = lineStart;
        buffer = advance();
        index = pos;
        lineNumber = line;
        lineStart = start;

        return buffer;
    }

    // Return true if there is a line terminator before the next token.

    function peekLineTerminator() {
        var pos, line, start, found;

        pos = index;
        line = lineNumber;
        start = lineStart;
        skipComment();
        found = lineNumber !== line;
        index = pos;
        lineNumber = line;
        lineStart = start;

        return found;
    }

    // Throw an exception

    function throwError(token, messageFormat) {
        var error,
            args = Array.prototype.slice.call(arguments, 2),
            msg = messageFormat.replace(
                /%(\d)/g,
                function (whole, index) {
                    return args[index] || '';
                }
            );

        if (typeof token.lineNumber === 'number') {
            error = new Error('Line ' + token.lineNumber + ': ' + msg);
            error.index = token.range[0];
            error.lineNumber = token.lineNumber;
            error.column = token.range[0] - lineStart + 1;
        } else {
            error = new Error('Line ' + lineNumber + ': ' + msg);
            error.index = index;
            error.lineNumber = lineNumber;
            error.column = index - lineStart + 1;
        }

        throw error;
    }

    function throwErrorTolerant() {
        try {
            throwError.apply(null, arguments);
        } catch (e) {
            if (extra.errors) {
                extra.errors.push(e);
            } else {
                throw e;
            }
        }
    }


    // Throw an exception because of the token.

    function throwUnexpected(token) {
        if (token.type === Token.EOF) {
            throwError(token, Messages.UnexpectedEOS);
        }

        if (token.type === Token.NumericLiteral) {
            throwError(token, Messages.UnexpectedNumber);
        }

        if (token.type === Token.StringLiteral) {
            throwError(token, Messages.UnexpectedString);
        }

        if (token.type === Token.Identifier) {
            throwError(token, Messages.UnexpectedIdentifier);
        }

        if (token.type === Token.Keyword) {
            if (isFutureReservedWord(token.value)) {
                throwError(token, Messages.UnexpectedReserved);
            } else if (strict && isStrictModeReservedWord(token.value)) {
                throwErrorTolerant(token, Messages.StrictReservedWord);
                return;
            }
            throwError(token, Messages.UnexpectedToken, token.value);
        }

        // BooleanLiteral, NullLiteral, or Punctuator.
        throwError(token, Messages.UnexpectedToken, token.value);
    }

    // Expect the next token to match the specified punctuator.
    // If not, an exception will be thrown.

    function expect(value) {
        var token = lex();
        if (token.type !== Token.Punctuator || token.value !== value) {
            throwUnexpected(token);
        }
    }

    // Expect the next token to match the specified keyword.
    // If not, an exception will be thrown.

    function expectKeyword(keyword) {
        var token = lex();
        if (token.type !== Token.Keyword || token.value !== keyword) {
            throwUnexpected(token);
        }
    }

    // Return true if the next token matches the specified punctuator.

    function match(value) {
        var token = lookahead();
        return token.type === Token.Punctuator && token.value === value;
    }

    // Return true if the next token matches the specified keyword

    function matchKeyword(keyword) {
        var token = lookahead();
        return token.type === Token.Keyword && token.value === keyword;
    }

    // Return true if the next token is an assignment operator

    function matchAssign() {
        var token = lookahead(),
            op = token.value;

        if (token.type !== Token.Punctuator) {
            return false;
        }
        return op === '=' ||
            op === '*=' ||
            op === '/=' ||
            op === '%=' ||
            op === '+=' ||
            op === '-=' ||
            op === '<<=' ||
            op === '>>=' ||
            op === '>>>=' ||
            op === '&=' ||
            op === '^=' ||
            op === '|=';
    }

    function consumeSemicolon() {
        var token, line;

        // Catch the very common case first.
        if (source[index] === ';') {
            lex();
            return;
        }

        line = lineNumber;
        skipComment();
        if (lineNumber !== line) {
            return;
        }

        if (match(';')) {
            lex();
            return;
        }

        token = lookahead();
        if (token.type !== Token.EOF && !match('}')) {
            throwUnexpected(token);
        }
    }

    // Return true if provided expression is LeftHandSideExpression

    function isLeftHandSide(expr) {
        return expr.type === Syntax.Identifier || expr.type === Syntax.MemberExpression;
    }

    // 11.1.4 Array Initialiser

    function parseArrayInitialiser() {
        var elements = [];

        expect('[');

        while (!match(']')) {
            if (match(',')) {
                lex();
                elements.push(null);
            } else {
                elements.push(parseAssignmentExpression());

                if (!match(']')) {
                    expect(',');
                }
            }
        }

        expect(']');

        return {
            type: Syntax.ArrayExpression,
            elements: elements
        };
    }

    // 11.1.5 Object Initialiser

    function parsePropertyFunction(param, first) {
        var previousStrict, body;

        previousStrict = strict;
        body = parseFunctionSourceElements();
        if (first && strict && isRestrictedWord(param[0].name)) {
            throwErrorTolerant(first, Messages.StrictParamName);
        }
        strict = previousStrict;

        return {
            type: Syntax.FunctionExpression,
            id: null,
            params: param,
            defaults: [],
            body: body,
            rest: null,
            generator: false,
            expression: false
        };
    }

    function parseObjectPropertyKey() {
        var token = lex();

        // Note: This function is called only from parseObjectProperty(), where
        // EOF and Punctuator tokens are already filtered out.

        if (token.type === Token.StringLiteral || token.type === Token.NumericLiteral) {
            if (strict && token.octal) {
                throwErrorTolerant(token, Messages.StrictOctalLiteral);
            }
            return createLiteral(token);
        }

        return {
            type: Syntax.Identifier,
            name: token.value
        };
    }

    function parseObjectProperty() {
        var token, key, id, param;

        token = lookahead();

        if (token.type === Token.Identifier) {

            id = parseObjectPropertyKey();

            // Property Assignment: Getter and Setter.

            if (token.value === 'get' && !match(':')) {
                key = parseObjectPropertyKey();
                expect('(');
                expect(')');
                return {
                    type: Syntax.Property,
                    key: key,
                    value: parsePropertyFunction([]),
                    kind: 'get'
                };
            } else if (token.value === 'set' && !match(':')) {
                key = parseObjectPropertyKey();
                expect('(');
                token = lookahead();
                if (token.type !== Token.Identifier) {
                    expect(')');
                    throwErrorTolerant(token, Messages.UnexpectedToken, token.value);
                    return {
                        type: Syntax.Property,
                        key: key,
                        value: parsePropertyFunction([]),
                        kind: 'set'
                    };
                } else {
                    param = [ parseVariableIdentifier() ];
                    expect(')');
                    return {
                        type: Syntax.Property,
                        key: key,
                        value: parsePropertyFunction(param, token),
                        kind: 'set'
                    };
                }
            } else {
                expect(':');
                return {
                    type: Syntax.Property,
                    key: id,
                    value: parseAssignmentExpression(),
                    kind: 'init'
                };
            }
        } else if (token.type === Token.EOF || token.type === Token.Punctuator) {
            throwUnexpected(token);
        } else {
            key = parseObjectPropertyKey();
            expect(':');
            return {
                type: Syntax.Property,
                key: key,
                value: parseAssignmentExpression(),
                kind: 'init'
            };
        }
    }

    function parseObjectInitialiser() {
        var properties = [], property, name, kind, map = {}, toString = String;

        expect('{');

        while (!match('}')) {
            property = parseObjectProperty();

            if (property.key.type === Syntax.Identifier) {
                name = property.key.name;
            } else {
                name = toString(property.key.value);
            }
            kind = (property.kind === 'init') ? PropertyKind.Data : (property.kind === 'get') ? PropertyKind.Get : PropertyKind.Set;
            if (Object.prototype.hasOwnProperty.call(map, name)) {
                if (map[name] === PropertyKind.Data) {
                    if (strict && kind === PropertyKind.Data) {
                        throwErrorTolerant({}, Messages.StrictDuplicateProperty);
                    } else if (kind !== PropertyKind.Data) {
                        throwErrorTolerant({}, Messages.AccessorDataProperty);
                    }
                } else {
                    if (kind === PropertyKind.Data) {
                        throwErrorTolerant({}, Messages.AccessorDataProperty);
                    } else if (map[name] & kind) {
                        throwErrorTolerant({}, Messages.AccessorGetSet);
                    }
                }
                map[name] |= kind;
            } else {
                map[name] = kind;
            }

            properties.push(property);

            if (!match('}')) {
                expect(',');
            }
        }

        expect('}');

        return {
            type: Syntax.ObjectExpression,
            properties: properties
        };
    }

    // 11.1.6 The Grouping Operator

    function parseGroupExpression() {
        var expr;

        expect('(');

        expr = parseExpression();

        expect(')');

        return expr;
    }


    // 11.1 Primary Expressions

    function parsePrimaryExpression() {
        var token = lookahead(),
            type = token.type;

        if (type === Token.Identifier) {
            return {
                type: Syntax.Identifier,
                name: lex().value
            };
        }

        if (type === Token.StringLiteral || type === Token.NumericLiteral) {
            if (strict && token.octal) {
                throwErrorTolerant(token, Messages.StrictOctalLiteral);
            }
            return createLiteral(lex());
        }

        if (type === Token.Keyword) {
            if (matchKeyword('this')) {
                lex();
                return {
                    type: Syntax.ThisExpression
                };
            }

            if (matchKeyword('function')) {
                return parseFunctionExpression();
            }
        }

        if (type === Token.BooleanLiteral) {
            lex();
            token.value = (token.value === 'true');
            return createLiteral(token);
        }

        if (type === Token.NullLiteral) {
            lex();
            token.value = null;
            return createLiteral(token);
        }

        if (match('[')) {
            return parseArrayInitialiser();
        }

        if (match('{')) {
            return parseObjectInitialiser();
        }

        if (match('(')) {
            return parseGroupExpression();
        }

        if (match('/') || match('/=')) {
            return createLiteral(scanRegExp());
        }

        return throwUnexpected(lex());
    }

    // 11.2 Left-Hand-Side Expressions

    function parseArguments() {
        var args = [];

        expect('(');

        if (!match(')')) {
            while (index < length) {
                args.push(parseAssignmentExpression());
                if (match(')')) {
                    break;
                }
                expect(',');
            }
        }

        expect(')');

        return args;
    }

    function parseNonComputedProperty() {
        var token = lex();

        if (!isIdentifierName(token)) {
            throwUnexpected(token);
        }

        return {
            type: Syntax.Identifier,
            name: token.value
        };
    }

    function parseNonComputedMember() {
        expect('.');

        return parseNonComputedProperty();
    }

    function parseComputedMember() {
        var expr;

        expect('[');

        expr = parseExpression();

        expect(']');

        return expr;
    }

    function parseNewExpression() {
        var expr;

        expectKeyword('new');

        expr = {
            type: Syntax.NewExpression,
            callee: parseLeftHandSideExpression(),
            'arguments': []
        };

        if (match('(')) {
            expr['arguments'] = parseArguments();
        }

        return expr;
    }

    function parseLeftHandSideExpressionAllowCall() {
        var expr;

        expr = matchKeyword('new') ? parseNewExpression() : parsePrimaryExpression();

        while (match('.') || match('[') || match('(')) {
            if (match('(')) {
                expr = {
                    type: Syntax.CallExpression,
                    callee: expr,
                    'arguments': parseArguments()
                };
            } else if (match('[')) {
                expr = {
                    type: Syntax.MemberExpression,
                    computed: true,
                    object: expr,
                    property: parseComputedMember()
                };
            } else {
                expr = {
                    type: Syntax.MemberExpression,
                    computed: false,
                    object: expr,
                    property: parseNonComputedMember()
                };
            }
        }

        return expr;
    }


    function parseLeftHandSideExpression() {
        var expr;

        expr = matchKeyword('new') ? parseNewExpression() : parsePrimaryExpression();

        while (match('.') || match('[')) {
            if (match('[')) {
                expr = {
                    type: Syntax.MemberExpression,
                    computed: true,
                    object: expr,
                    property: parseComputedMember()
                };
            } else {
                expr = {
                    type: Syntax.MemberExpression,
                    computed: false,
                    object: expr,
                    property: parseNonComputedMember()
                };
            }
        }

        return expr;
    }

    // 11.3 Postfix Expressions

    function parsePostfixExpression() {
        var expr = parseLeftHandSideExpressionAllowCall(), token;

        token = lookahead();
        if (token.type !== Token.Punctuator) {
            return expr;
        }

        if ((match('++') || match('--')) && !peekLineTerminator()) {
            // 11.3.1, 11.3.2
            if (strict && expr.type === Syntax.Identifier && isRestrictedWord(expr.name)) {
                throwErrorTolerant({}, Messages.StrictLHSPostfix);
            }
            if (!isLeftHandSide(expr)) {
                throwErrorTolerant({}, Messages.InvalidLHSInAssignment);
            }

            expr = {
                type: Syntax.UpdateExpression,
                operator: lex().value,
                argument: expr,
                prefix: false
            };
        }

        return expr;
    }

    // 11.4 Unary Operators

    function parseUnaryExpression() {
        var token, expr;

        token = lookahead();
        if (token.type !== Token.Punctuator && token.type !== Token.Keyword) {
            return parsePostfixExpression();
        }

        if (match('++') || match('--')) {
            token = lex();
            expr = parseUnaryExpression();
            // 11.4.4, 11.4.5
            if (strict && expr.type === Syntax.Identifier && isRestrictedWord(expr.name)) {
                throwErrorTolerant({}, Messages.StrictLHSPrefix);
            }

            if (!isLeftHandSide(expr)) {
                throwErrorTolerant({}, Messages.InvalidLHSInAssignment);
            }

            expr = {
                type: Syntax.UpdateExpression,
                operator: token.value,
                argument: expr,
                prefix: true
            };
            return expr;
        }

        if (match('+') || match('-') || match('~') || match('!')) {
            expr = {
                type: Syntax.UnaryExpression,
                operator: lex().value,
                argument: parseUnaryExpression(),
                prefix: true
            };
            return expr;
        }

        if (matchKeyword('delete') || matchKeyword('void') || matchKeyword('typeof')) {
            expr = {
                type: Syntax.UnaryExpression,
                operator: lex().value,
                argument: parseUnaryExpression(),
                prefix: true
            };
            if (strict && expr.operator === 'delete' && expr.argument.type === Syntax.Identifier) {
                throwErrorTolerant({}, Messages.StrictDelete);
            }
            return expr;
        }

        return parsePostfixExpression();
    }

    // 11.5 Multiplicative Operators

    function parseMultiplicativeExpression() {
        var expr = parseUnaryExpression();

        while (match('*') || match('/') || match('%')) {
            expr = {
                type: Syntax.BinaryExpression,
                operator: lex().value,
                left: expr,
                right: parseUnaryExpression()
            };
        }

        return expr;
    }

    // 11.6 Additive Operators

    function parseAdditiveExpression() {
        var expr = parseMultiplicativeExpression();

        while (match('+') || match('-')) {
            expr = {
                type: Syntax.BinaryExpression,
                operator: lex().value,
                left: expr,
                right: parseMultiplicativeExpression()
            };
        }

        return expr;
    }

    // 11.7 Bitwise Shift Operators

    function parseShiftExpression() {
        var expr = parseAdditiveExpression();

        while (match('<<') || match('>>') || match('>>>')) {
            expr = {
                type: Syntax.BinaryExpression,
                operator: lex().value,
                left: expr,
                right: parseAdditiveExpression()
            };
        }

        return expr;
    }
    // 11.8 Relational Operators

    function parseRelationalExpression() {
        var expr, previousAllowIn;

        previousAllowIn = state.allowIn;
        state.allowIn = true;

        expr = parseShiftExpression();

        while (match('<') || match('>') || match('<=') || match('>=') || (previousAllowIn && matchKeyword('in')) || matchKeyword('instanceof')) {
            expr = {
                type: Syntax.BinaryExpression,
                operator: lex().value,
                left: expr,
                right: parseShiftExpression()
            };
        }

        state.allowIn = previousAllowIn;
        return expr;
    }

    // 11.9 Equality Operators

    function parseEqualityExpression() {
        var expr = parseRelationalExpression();

        while (match('==') || match('!=') || match('===') || match('!==')) {
            expr = {
                type: Syntax.BinaryExpression,
                operator: lex().value,
                left: expr,
                right: parseRelationalExpression()
            };
        }

        return expr;
    }

    // 11.10 Binary Bitwise Operators

    function parseBitwiseANDExpression() {
        var expr = parseEqualityExpression();

        while (match('&')) {
            lex();
            expr = {
                type: Syntax.BinaryExpression,
                operator: '&',
                left: expr,
                right: parseEqualityExpression()
            };
        }

        return expr;
    }

    function parseBitwiseXORExpression() {
        var expr = parseBitwiseANDExpression();

        while (match('^')) {
            lex();
            expr = {
                type: Syntax.BinaryExpression,
                operator: '^',
                left: expr,
                right: parseBitwiseANDExpression()
            };
        }

        return expr;
    }

    function parseBitwiseORExpression() {
        var expr = parseBitwiseXORExpression();

        while (match('|')) {
            lex();
            expr = {
                type: Syntax.BinaryExpression,
                operator: '|',
                left: expr,
                right: parseBitwiseXORExpression()
            };
        }

        return expr;
    }

    // 11.11 Binary Logical Operators

    function parseLogicalANDExpression() {
        var expr = parseBitwiseORExpression();

        while (match('&&')) {
            lex();
            expr = {
                type: Syntax.LogicalExpression,
                operator: '&&',
                left: expr,
                right: parseBitwiseORExpression()
            };
        }

        return expr;
    }

    function parseLogicalORExpression() {
        var expr = parseLogicalANDExpression();

        while (match('||')) {
            lex();
            expr = {
                type: Syntax.LogicalExpression,
                operator: '||',
                left: expr,
                right: parseLogicalANDExpression()
            };
        }

        return expr;
    }

    // 11.12 Conditional Operator

    function parseConditionalExpression() {
        var expr, previousAllowIn, consequent;

        expr = parseLogicalORExpression();

        if (match('?')) {
            lex();
            previousAllowIn = state.allowIn;
            state.allowIn = true;
            consequent = parseAssignmentExpression();
            state.allowIn = previousAllowIn;
            expect(':');

            expr = {
                type: Syntax.ConditionalExpression,
                test: expr,
                consequent: consequent,
                alternate: parseAssignmentExpression()
            };
        }

        return expr;
    }

    // 11.13 Assignment Operators

    function parseAssignmentExpression() {
        var token, expr;

        token = lookahead();
        expr = parseConditionalExpression();

        if (matchAssign()) {
            // LeftHandSideExpression
            if (!isLeftHandSide(expr)) {
                throwErrorTolerant({}, Messages.InvalidLHSInAssignment);
            }

            // 11.13.1
            if (strict && expr.type === Syntax.Identifier && isRestrictedWord(expr.name)) {
                throwErrorTolerant(token, Messages.StrictLHSAssignment);
            }

            expr = {
                type: Syntax.AssignmentExpression,
                operator: lex().value,
                left: expr,
                right: parseAssignmentExpression()
            };
        }

        return expr;
    }

    // 11.14 Comma Operator

    function parseExpression() {
        var expr = parseAssignmentExpression();

        if (match(',')) {
            expr = {
                type: Syntax.SequenceExpression,
                expressions: [ expr ]
            };

            while (index < length) {
                if (!match(',')) {
                    break;
                }
                lex();
                expr.expressions.push(parseAssignmentExpression());
            }

        }
        return expr;
    }

    // 12.1 Block

    function parseStatementList() {
        var list = [],
            statement;

        while (index < length) {
            if (match('}')) {
                break;
            }
            statement = parseSourceElement();
            if (typeof statement === 'undefined') {
                break;
            }
            list.push(statement);
        }

        return list;
    }

    function parseBlock() {
        var block;

        expect('{');

        block = parseStatementList();

        expect('}');

        return {
            type: Syntax.BlockStatement,
            body: block
        };
    }

    // 12.2 Variable Statement

    function parseVariableIdentifier() {
        var token = lex();

        if (token.type !== Token.Identifier) {
            throwUnexpected(token);
        }

        return {
            type: Syntax.Identifier,
            name: token.value
        };
    }

    function parseVariableDeclaration(kind) {
        var id = parseVariableIdentifier(),
            init = null;

        // 12.2.1
        if (strict && isRestrictedWord(id.name)) {
            throwErrorTolerant({}, Messages.StrictVarName);
        }

        if (kind === 'const') {
            expect('=');
            init = parseAssignmentExpression();
        } else if (match('=')) {
            lex();
            init = parseAssignmentExpression();
        }

        return {
            type: Syntax.VariableDeclarator,
            id: id,
            init: init
        };
    }

    function parseVariableDeclarationList(kind) {
        var list = [];

        do {
            list.push(parseVariableDeclaration(kind));
            if (!match(',')) {
                break;
            }
            lex();
        } while (index < length);

        return list;
    }

    function parseVariableStatement() {
        var declarations;

        expectKeyword('var');

        declarations = parseVariableDeclarationList();

        consumeSemicolon();

        return {
            type: Syntax.VariableDeclaration,
            declarations: declarations,
            kind: 'var'
        };
    }

    // kind may be `const` or `let`
    // Both are experimental and not in the specification yet.
    // see http://wiki.ecmascript.org/doku.php?id=harmony:const
    // and http://wiki.ecmascript.org/doku.php?id=harmony:let
    function parseConstLetDeclaration(kind) {
        var declarations;

        expectKeyword(kind);

        declarations = parseVariableDeclarationList(kind);

        consumeSemicolon();

        return {
            type: Syntax.VariableDeclaration,
            declarations: declarations,
            kind: kind
        };
    }

    // 12.3 Empty Statement

    function parseEmptyStatement() {
        expect(';');

        return {
            type: Syntax.EmptyStatement
        };
    }

    // 12.4 Expression Statement

    function parseExpressionStatement() {
        var expr = parseExpression();

        consumeSemicolon();

        return {
            type: Syntax.ExpressionStatement,
            expression: expr
        };
    }

    // 12.5 If statement

    function parseIfStatement() {
        var test, consequent, alternate;

        expectKeyword('if');

        expect('(');

        test = parseExpression();

        expect(')');

        consequent = parseStatement();

        if (matchKeyword('else')) {
            lex();
            alternate = parseStatement();
        } else {
            alternate = null;
        }

        return {
            type: Syntax.IfStatement,
            test: test,
            consequent: consequent,
            alternate: alternate
        };
    }

    // 12.6 Iteration Statements

    function parseDoWhileStatement() {
        var body, test, oldInIteration;

        expectKeyword('do');

        oldInIteration = state.inIteration;
        state.inIteration = true;

        body = parseStatement();

        state.inIteration = oldInIteration;

        expectKeyword('while');

        expect('(');

        test = parseExpression();

        expect(')');

        if (match(';')) {
            lex();
        }

        return {
            type: Syntax.DoWhileStatement,
            body: body,
            test: test
        };
    }

    function parseWhileStatement() {
        var test, body, oldInIteration;

        expectKeyword('while');

        expect('(');

        test = parseExpression();

        expect(')');

        oldInIteration = state.inIteration;
        state.inIteration = true;

        body = parseStatement();

        state.inIteration = oldInIteration;

        return {
            type: Syntax.WhileStatement,
            test: test,
            body: body
        };
    }

    function parseForVariableDeclaration() {
        var token = lex();

        return {
            type: Syntax.VariableDeclaration,
            declarations: parseVariableDeclarationList(),
            kind: token.value
        };
    }

    function parseForStatement() {
        var init, test, update, left, right, body, oldInIteration;

        init = test = update = null;

        expectKeyword('for');

        expect('(');

        if (match(';')) {
            lex();
        } else {
            if (matchKeyword('var') || matchKeyword('let')) {
                state.allowIn = false;
                init = parseForVariableDeclaration();
                state.allowIn = true;

                if (init.declarations.length === 1 && matchKeyword('in')) {
                    lex();
                    left = init;
                    right = parseExpression();
                    init = null;
                }
            } else {
                state.allowIn = false;
                init = parseExpression();
                state.allowIn = true;

                if (matchKeyword('in')) {
                    // LeftHandSideExpression
                    if (!isLeftHandSide(init)) {
                        throwErrorTolerant({}, Messages.InvalidLHSInForIn);
                    }

                    lex();
                    left = init;
                    right = parseExpression();
                    init = null;
                }
            }

            if (typeof left === 'undefined') {
                expect(';');
            }
        }

        if (typeof left === 'undefined') {

            if (!match(';')) {
                test = parseExpression();
            }
            expect(';');

            if (!match(')')) {
                update = parseExpression();
            }
        }

        expect(')');

        oldInIteration = state.inIteration;
        state.inIteration = true;

        body = parseStatement();

        state.inIteration = oldInIteration;

        if (typeof left === 'undefined') {
            return {
                type: Syntax.ForStatement,
                init: init,
                test: test,
                update: update,
                body: body
            };
        }

        return {
            type: Syntax.ForInStatement,
            left: left,
            right: right,
            body: body,
            each: false
        };
    }

    // 12.7 The continue statement

    function parseContinueStatement() {
        var token, label = null;

        expectKeyword('continue');

        // Optimize the most common form: 'continue;'.
        if (source[index] === ';') {
            lex();

            if (!state.inIteration) {
                throwError({}, Messages.IllegalContinue);
            }

            return {
                type: Syntax.ContinueStatement,
                label: null
            };
        }

        if (peekLineTerminator()) {
            if (!state.inIteration) {
                throwError({}, Messages.IllegalContinue);
            }

            return {
                type: Syntax.ContinueStatement,
                label: null
            };
        }

        token = lookahead();
        if (token.type === Token.Identifier) {
            label = parseVariableIdentifier();

            if (!Object.prototype.hasOwnProperty.call(state.labelSet, label.name)) {
                throwError({}, Messages.UnknownLabel, label.name);
            }
        }

        consumeSemicolon();

        if (label === null && !state.inIteration) {
            throwError({}, Messages.IllegalContinue);
        }

        return {
            type: Syntax.ContinueStatement,
            label: label
        };
    }

    // 12.8 The break statement

    function parseBreakStatement() {
        var token, label = null;

        expectKeyword('break');

        // Optimize the most common form: 'break;'.
        if (source[index] === ';') {
            lex();

            if (!(state.inIteration || state.inSwitch)) {
                throwError({}, Messages.IllegalBreak);
            }

            return {
                type: Syntax.BreakStatement,
                label: null
            };
        }

        if (peekLineTerminator()) {
            if (!(state.inIteration || state.inSwitch)) {
                throwError({}, Messages.IllegalBreak);
            }

            return {
                type: Syntax.BreakStatement,
                label: null
            };
        }

        token = lookahead();
        if (token.type === Token.Identifier) {
            label = parseVariableIdentifier();

            if (!Object.prototype.hasOwnProperty.call(state.labelSet, label.name)) {
                throwError({}, Messages.UnknownLabel, label.name);
            }
        }

        consumeSemicolon();

        if (label === null && !(state.inIteration || state.inSwitch)) {
            throwError({}, Messages.IllegalBreak);
        }

        return {
            type: Syntax.BreakStatement,
            label: label
        };
    }

    // 12.9 The return statement

    function parseReturnStatement() {
        var token, argument = null;

        expectKeyword('return');

        if (!state.inFunctionBody) {
            throwErrorTolerant({}, Messages.IllegalReturn);
        }

        // 'return' followed by a space and an identifier is very common.
        if (source[index] === ' ') {
            if (isIdentifierStart(source[index + 1])) {
                argument = parseExpression();
                consumeSemicolon();
                return {
                    type: Syntax.ReturnStatement,
                    argument: argument
                };
            }
        }

        if (peekLineTerminator()) {
            return {
                type: Syntax.ReturnStatement,
                argument: null
            };
        }

        if (!match(';')) {
            token = lookahead();
            if (!match('}') && token.type !== Token.EOF) {
                argument = parseExpression();
            }
        }

        consumeSemicolon();

        return {
            type: Syntax.ReturnStatement,
            argument: argument
        };
    }

    // 12.10 The with statement

    function parseWithStatement() {
        var object, body;

        if (strict) {
            throwErrorTolerant({}, Messages.StrictModeWith);
        }

        expectKeyword('with');

        expect('(');

        object = parseExpression();

        expect(')');

        body = parseStatement();

        return {
            type: Syntax.WithStatement,
            object: object,
            body: body
        };
    }

    // 12.10 The swith statement

    function parseSwitchCase() {
        var test,
            consequent = [],
            statement;

        if (matchKeyword('default')) {
            lex();
            test = null;
        } else {
            expectKeyword('case');
            test = parseExpression();
        }
        expect(':');

        while (index < length) {
            if (match('}') || matchKeyword('default') || matchKeyword('case')) {
                break;
            }
            statement = parseStatement();
            if (typeof statement === 'undefined') {
                break;
            }
            consequent.push(statement);
        }

        return {
            type: Syntax.SwitchCase,
            test: test,
            consequent: consequent
        };
    }

    function parseSwitchStatement() {
        var discriminant, cases, clause, oldInSwitch, defaultFound;

        expectKeyword('switch');

        expect('(');

        discriminant = parseExpression();

        expect(')');

        expect('{');

        cases = [];

        if (match('}')) {
            lex();
            return {
                type: Syntax.SwitchStatement,
                discriminant: discriminant,
                cases: cases
            };
        }

        oldInSwitch = state.inSwitch;
        state.inSwitch = true;
        defaultFound = false;

        while (index < length) {
            if (match('}')) {
                break;
            }
            clause = parseSwitchCase();
            if (clause.test === null) {
                if (defaultFound) {
                    throwError({}, Messages.MultipleDefaultsInSwitch);
                }
                defaultFound = true;
            }
            cases.push(clause);
        }

        state.inSwitch = oldInSwitch;

        expect('}');

        return {
            type: Syntax.SwitchStatement,
            discriminant: discriminant,
            cases: cases
        };
    }

    // 12.13 The throw statement

    function parseThrowStatement() {
        var argument;

        expectKeyword('throw');

        if (peekLineTerminator()) {
            throwError({}, Messages.NewlineAfterThrow);
        }

        argument = parseExpression();

        consumeSemicolon();

        return {
            type: Syntax.ThrowStatement,
            argument: argument
        };
    }

    // 12.14 The try statement

    function parseCatchClause() {
        var param;

        expectKeyword('catch');

        expect('(');
        if (match(')')) {
            throwUnexpected(lookahead());
        }

        param = parseVariableIdentifier();
        // 12.14.1
        if (strict && isRestrictedWord(param.name)) {
            throwErrorTolerant({}, Messages.StrictCatchVariable);
        }

        expect(')');

        return {
            type: Syntax.CatchClause,
            param: param,
            body: parseBlock()
        };
    }

    function parseTryStatement() {
        var block, handlers = [], finalizer = null;

        expectKeyword('try');

        block = parseBlock();

        if (matchKeyword('catch')) {
            handlers.push(parseCatchClause());
        }

        if (matchKeyword('finally')) {
            lex();
            finalizer = parseBlock();
        }

        if (handlers.length === 0 && !finalizer) {
            throwError({}, Messages.NoCatchOrFinally);
        }

        return {
            type: Syntax.TryStatement,
            block: block,
            guardedHandlers: [],
            handlers: handlers,
            finalizer: finalizer
        };
    }

    // 12.15 The debugger statement

    function parseDebuggerStatement() {
        expectKeyword('debugger');

        consumeSemicolon();

        return {
            type: Syntax.DebuggerStatement
        };
    }

    // 12 Statements

    function parseStatement() {
        var token = lookahead(),
            expr,
            labeledBody;

        if (token.type === Token.EOF) {
            throwUnexpected(token);
        }

        if (token.type === Token.Punctuator) {
            switch (token.value) {
            case ';':
                return parseEmptyStatement();
            case '{':
                return parseBlock();
            case '(':
                return parseExpressionStatement();
            default:
                break;
            }
        }

        if (token.type === Token.Keyword) {
            switch (token.value) {
            case 'break':
                return parseBreakStatement();
            case 'continue':
                return parseContinueStatement();
            case 'debugger':
                return parseDebuggerStatement();
            case 'do':
                return parseDoWhileStatement();
            case 'for':
                return parseForStatement();
            case 'function':
                return parseFunctionDeclaration();
            case 'if':
                return parseIfStatement();
            case 'return':
                return parseReturnStatement();
            case 'switch':
                return parseSwitchStatement();
            case 'throw':
                return parseThrowStatement();
            case 'try':
                return parseTryStatement();
            case 'var':
                return parseVariableStatement();
            case 'while':
                return parseWhileStatement();
            case 'with':
                return parseWithStatement();
            default:
                break;
            }
        }

        expr = parseExpression();

        // 12.12 Labelled Statements
        if ((expr.type === Syntax.Identifier) && match(':')) {
            lex();

            if (Object.prototype.hasOwnProperty.call(state.labelSet, expr.name)) {
                throwError({}, Messages.Redeclaration, 'Label', expr.name);
            }

            state.labelSet[expr.name] = true;
            labeledBody = parseStatement();
            delete state.labelSet[expr.name];

            return {
                type: Syntax.LabeledStatement,
                label: expr,
                body: labeledBody
            };
        }

        consumeSemicolon();

        return {
            type: Syntax.ExpressionStatement,
            expression: expr
        };
    }

    // 13 Function Definition

    function parseFunctionSourceElements() {
        var sourceElement, sourceElements = [], token, directive, firstRestricted,
            oldLabelSet, oldInIteration, oldInSwitch, oldInFunctionBody;

        expect('{');

        while (index < length) {
            token = lookahead();
            if (token.type !== Token.StringLiteral) {
                break;
            }

            sourceElement = parseSourceElement();
            sourceElements.push(sourceElement);
            if (sourceElement.expression.type !== Syntax.Literal) {
                // this is not directive
                break;
            }
            directive = sliceSource(token.range[0] + 1, token.range[1] - 1);
            if (directive === 'use strict') {
                strict = true;
                if (firstRestricted) {
                    throwErrorTolerant(firstRestricted, Messages.StrictOctalLiteral);
                }
            } else {
                if (!firstRestricted && token.octal) {
                    firstRestricted = token;
                }
            }
        }

        oldLabelSet = state.labelSet;
        oldInIteration = state.inIteration;
        oldInSwitch = state.inSwitch;
        oldInFunctionBody = state.inFunctionBody;

        state.labelSet = {};
        state.inIteration = false;
        state.inSwitch = false;
        state.inFunctionBody = true;

        while (index < length) {
            if (match('}')) {
                break;
            }
            sourceElement = parseSourceElement();
            if (typeof sourceElement === 'undefined') {
                break;
            }
            sourceElements.push(sourceElement);
        }

        expect('}');

        state.labelSet = oldLabelSet;
        state.inIteration = oldInIteration;
        state.inSwitch = oldInSwitch;
        state.inFunctionBody = oldInFunctionBody;

        return {
            type: Syntax.BlockStatement,
            body: sourceElements
        };
    }

    function parseFunctionDeclaration() {
        var id, param, params = [], body, token, stricted, firstRestricted, message, previousStrict, paramSet;

        expectKeyword('function');
        token = lookahead();
        id = parseVariableIdentifier();
        if (strict) {
            if (isRestrictedWord(token.value)) {
                throwErrorTolerant(token, Messages.StrictFunctionName);
            }
        } else {
            if (isRestrictedWord(token.value)) {
                firstRestricted = token;
                message = Messages.StrictFunctionName;
            } else if (isStrictModeReservedWord(token.value)) {
                firstRestricted = token;
                message = Messages.StrictReservedWord;
            }
        }

        expect('(');

        if (!match(')')) {
            paramSet = {};
            while (index < length) {
                token = lookahead();
                param = parseVariableIdentifier();
                if (strict) {
                    if (isRestrictedWord(token.value)) {
                        stricted = token;
                        message = Messages.StrictParamName;
                    }
                    if (Object.prototype.hasOwnProperty.call(paramSet, token.value)) {
                        stricted = token;
                        message = Messages.StrictParamDupe;
                    }
                } else if (!firstRestricted) {
                    if (isRestrictedWord(token.value)) {
                        firstRestricted = token;
                        message = Messages.StrictParamName;
                    } else if (isStrictModeReservedWord(token.value)) {
                        firstRestricted = token;
                        message = Messages.StrictReservedWord;
                    } else if (Object.prototype.hasOwnProperty.call(paramSet, token.value)) {
                        firstRestricted = token;
                        message = Messages.StrictParamDupe;
                    }
                }
                params.push(param);
                paramSet[param.name] = true;
                if (match(')')) {
                    break;
                }
                expect(',');
            }
        }

        expect(')');

        previousStrict = strict;
        body = parseFunctionSourceElements();
        if (strict && firstRestricted) {
            throwError(firstRestricted, message);
        }
        if (strict && stricted) {
            throwErrorTolerant(stricted, message);
        }
        strict = previousStrict;

        return {
            type: Syntax.FunctionDeclaration,
            id: id,
            params: params,
            defaults: [],
            body: body,
            rest: null,
            generator: false,
            expression: false
        };
    }

    function parseFunctionExpression() {
        var token, id = null, stricted, firstRestricted, message, param, params = [], body, previousStrict, paramSet;

        expectKeyword('function');

        if (!match('(')) {
            token = lookahead();
            id = parseVariableIdentifier();
            if (strict) {
                if (isRestrictedWord(token.value)) {
                    throwErrorTolerant(token, Messages.StrictFunctionName);
                }
            } else {
                if (isRestrictedWord(token.value)) {
                    firstRestricted = token;
                    message = Messages.StrictFunctionName;
                } else if (isStrictModeReservedWord(token.value)) {
                    firstRestricted = token;
                    message = Messages.StrictReservedWord;
                }
            }
        }

        expect('(');

        if (!match(')')) {
            paramSet = {};
            while (index < length) {
                token = lookahead();
                param = parseVariableIdentifier();
                if (strict) {
                    if (isRestrictedWord(token.value)) {
                        stricted = token;
                        message = Messages.StrictParamName;
                    }
                    if (Object.prototype.hasOwnProperty.call(paramSet, token.value)) {
                        stricted = token;
                        message = Messages.StrictParamDupe;
                    }
                } else if (!firstRestricted) {
                    if (isRestrictedWord(token.value)) {
                        firstRestricted = token;
                        message = Messages.StrictParamName;
                    } else if (isStrictModeReservedWord(token.value)) {
                        firstRestricted = token;
                        message = Messages.StrictReservedWord;
                    } else if (Object.prototype.hasOwnProperty.call(paramSet, token.value)) {
                        firstRestricted = token;
                        message = Messages.StrictParamDupe;
                    }
                }
                params.push(param);
                paramSet[param.name] = true;
                if (match(')')) {
                    break;
                }
                expect(',');
            }
        }

        expect(')');

        previousStrict = strict;
        body = parseFunctionSourceElements();
        if (strict && firstRestricted) {
            throwError(firstRestricted, message);
        }
        if (strict && stricted) {
            throwErrorTolerant(stricted, message);
        }
        strict = previousStrict;

        return {
            type: Syntax.FunctionExpression,
            id: id,
            params: params,
            defaults: [],
            body: body,
            rest: null,
            generator: false,
            expression: false
        };
    }

    // 14 Program

    function parseSourceElement() {
        var token = lookahead();

        if (token.type === Token.Keyword) {
            switch (token.value) {
            case 'const':
            case 'let':
                return parseConstLetDeclaration(token.value);
            case 'function':
                return parseFunctionDeclaration();
            default:
                return parseStatement();
            }
        }

        if (token.type !== Token.EOF) {
            return parseStatement();
        }
    }

    function parseSourceElements() {
        var sourceElement, sourceElements = [], token, directive, firstRestricted;

        while (index < length) {
            token = lookahead();
            if (token.type !== Token.StringLiteral) {
                break;
            }

            sourceElement = parseSourceElement();
            sourceElements.push(sourceElement);
            if (sourceElement.expression.type !== Syntax.Literal) {
                // this is not directive
                break;
            }
            directive = sliceSource(token.range[0] + 1, token.range[1] - 1);
            if (directive === 'use strict') {
                strict = true;
                if (firstRestricted) {
                    throwErrorTolerant(firstRestricted, Messages.StrictOctalLiteral);
                }
            } else {
                if (!firstRestricted && token.octal) {
                    firstRestricted = token;
                }
            }
        }

        while (index < length) {
            sourceElement = parseSourceElement();
            if (typeof sourceElement === 'undefined') {
                break;
            }
            sourceElements.push(sourceElement);
        }
        return sourceElements;
    }

    function parseProgram() {
        var program;
        strict = false;
        program = {
            type: Syntax.Program,
            body: parseSourceElements()
        };
        return program;
    }

    // The following functions are needed only when the option to preserve
    // the comments is active.

    function addComment(type, value, start, end, loc) {
        assert(typeof start === 'number', 'Comment must have valid position');

        // Because the way the actual token is scanned, often the comments
        // (if any) are skipped twice during the lexical analysis.
        // Thus, we need to skip adding a comment if the comment array already
        // handled it.
        if (extra.comments.length > 0) {
            if (extra.comments[extra.comments.length - 1].range[1] > start) {
                return;
            }
        }

        extra.comments.push({
            type: type,
            value: value,
            range: [start, end],
            loc: loc
        });
    }

    function scanComment() {
        var comment, ch, loc, start, blockComment, lineComment;

        comment = '';
        blockComment = false;
        lineComment = false;

        while (index < length) {
            ch = source[index];

            if (lineComment) {
                ch = source[index++];
                if (isLineTerminator(ch)) {
                    loc.end = {
                        line: lineNumber,
                        column: index - lineStart - 1
                    };
                    lineComment = false;
                    addComment('Line', comment, start, index - 1, loc);
                    if (ch === '\r' && source[index] === '\n') {
                        ++index;
                    }
                    ++lineNumber;
                    lineStart = index;
                    comment = '';
                } else if (index >= length) {
                    lineComment = false;
                    comment += ch;
                    loc.end = {
                        line: lineNumber,
                        column: length - lineStart
                    };
                    addComment('Line', comment, start, length, loc);
                } else {
                    comment += ch;
                }
            } else if (blockComment) {
                if (isLineTerminator(ch)) {
                    if (ch === '\r' && source[index + 1] === '\n') {
                        ++index;
                        comment += '\r\n';
                    } else {
                        comment += ch;
                    }
                    ++lineNumber;
                    ++index;
                    lineStart = index;
                    if (index >= length) {
                        throwError({}, Messages.UnexpectedToken, 'ILLEGAL');
                    }
                } else {
                    ch = source[index++];
                    if (index >= length) {
                        throwError({}, Messages.UnexpectedToken, 'ILLEGAL');
                    }
                    comment += ch;
                    if (ch === '*') {
                        ch = source[index];
                        if (ch === '/') {
                            comment = comment.substr(0, comment.length - 1);
                            blockComment = false;
                            ++index;
                            loc.end = {
                                line: lineNumber,
                                column: index - lineStart
                            };
                            addComment('Block', comment, start, index, loc);
                            comment = '';
                        }
                    }
                }
            } else if (ch === '/') {
                ch = source[index + 1];
                if (ch === '/') {
                    loc = {
                        start: {
                            line: lineNumber,
                            column: index - lineStart
                        }
                    };
                    start = index;
                    index += 2;
                    lineComment = true;
                    if (index >= length) {
                        loc.end = {
                            line: lineNumber,
                            column: index - lineStart
                        };
                        lineComment = false;
                        addComment('Line', comment, start, index, loc);
                    }
                } else if (ch === '*') {
                    start = index;
                    index += 2;
                    blockComment = true;
                    loc = {
                        start: {
                            line: lineNumber,
                            column: index - lineStart - 2
                        }
                    };
                    if (index >= length) {
                        throwError({}, Messages.UnexpectedToken, 'ILLEGAL');
                    }
                } else {
                    break;
                }
            } else if (isWhiteSpace(ch)) {
                ++index;
            } else if (isLineTerminator(ch)) {
                ++index;
                if (ch ===  '\r' && source[index] === '\n') {
                    ++index;
                }
                ++lineNumber;
                lineStart = index;
            } else {
                break;
            }
        }
    }

    function filterCommentLocation() {
        var i, entry, comment, comments = [];

        for (i = 0; i < extra.comments.length; ++i) {
            entry = extra.comments[i];
            comment = {
                type: entry.type,
                value: entry.value
            };
            if (extra.range) {
                comment.range = entry.range;
            }
            if (extra.loc) {
                comment.loc = entry.loc;
            }
            comments.push(comment);
        }

        extra.comments = comments;
    }

    function collectToken() {
        var start, loc, token, range, value;

        skipComment();
        start = index;
        loc = {
            start: {
                line: lineNumber,
                column: index - lineStart
            }
        };

        token = extra.advance();
        loc.end = {
            line: lineNumber,
            column: index - lineStart
        };

        if (token.type !== Token.EOF) {
            range = [token.range[0], token.range[1]];
            value = sliceSource(token.range[0], token.range[1]);
            extra.tokens.push({
                type: TokenName[token.type],
                value: value,
                range: range,
                loc: loc
            });
        }

        return token;
    }

    function collectRegex() {
        var pos, loc, regex, token;

        skipComment();

        pos = index;
        loc = {
            start: {
                line: lineNumber,
                column: index - lineStart
            }
        };

        regex = extra.scanRegExp();
        loc.end = {
            line: lineNumber,
            column: index - lineStart
        };

        // Pop the previous token, which is likely '/' or '/='
        if (extra.tokens.length > 0) {
            token = extra.tokens[extra.tokens.length - 1];
            if (token.range[0] === pos && token.type === 'Punctuator') {
                if (token.value === '/' || token.value === '/=') {
                    extra.tokens.pop();
                }
            }
        }

        extra.tokens.push({
            type: 'RegularExpression',
            value: regex.literal,
            range: [pos, index],
            loc: loc
        });

        return regex;
    }

    function filterTokenLocation() {
        var i, entry, token, tokens = [];

        for (i = 0; i < extra.tokens.length; ++i) {
            entry = extra.tokens[i];
            token = {
                type: entry.type,
                value: entry.value
            };
            if (extra.range) {
                token.range = entry.range;
            }
            if (extra.loc) {
                token.loc = entry.loc;
            }
            tokens.push(token);
        }

        extra.tokens = tokens;
    }

    function createLiteral(token) {
        return {
            type: Syntax.Literal,
            value: token.value
        };
    }

    function createRawLiteral(token) {
        return {
            type: Syntax.Literal,
            value: token.value,
            raw: sliceSource(token.range[0], token.range[1])
        };
    }

    function createLocationMarker() {
        var marker = {};

        marker.range = [index, index];
        marker.loc = {
            start: {
                line: lineNumber,
                column: index - lineStart
            },
            end: {
                line: lineNumber,
                column: index - lineStart
            }
        };

        marker.end = function () {
            this.range[1] = index;
            this.loc.end.line = lineNumber;
            this.loc.end.column = index - lineStart;
        };

        marker.applyGroup = function (node) {
            if (extra.range) {
                node.groupRange = [this.range[0], this.range[1]];
            }
            if (extra.loc) {
                node.groupLoc = {
                    start: {
                        line: this.loc.start.line,
                        column: this.loc.start.column
                    },
                    end: {
                        line: this.loc.end.line,
                        column: this.loc.end.column
                    }
                };
            }
        };

        marker.apply = function (node) {
            if (extra.range) {
                node.range = [this.range[0], this.range[1]];
            }
            if (extra.loc) {
                node.loc = {
                    start: {
                        line: this.loc.start.line,
                        column: this.loc.start.column
                    },
                    end: {
                        line: this.loc.end.line,
                        column: this.loc.end.column
                    }
                };
            }
        };

        return marker;
    }

    function trackGroupExpression() {
        var marker, expr;

        skipComment();
        marker = createLocationMarker();
        expect('(');

        expr = parseExpression();

        expect(')');

        marker.end();
        marker.applyGroup(expr);

        return expr;
    }

    function trackLeftHandSideExpression() {
        var marker, expr;

        skipComment();
        marker = createLocationMarker();

        expr = matchKeyword('new') ? parseNewExpression() : parsePrimaryExpression();

        while (match('.') || match('[')) {
            if (match('[')) {
                expr = {
                    type: Syntax.MemberExpression,
                    computed: true,
                    object: expr,
                    property: parseComputedMember()
                };
                marker.end();
                marker.apply(expr);
            } else {
                expr = {
                    type: Syntax.MemberExpression,
                    computed: false,
                    object: expr,
                    property: parseNonComputedMember()
                };
                marker.end();
                marker.apply(expr);
            }
        }

        return expr;
    }

    function trackLeftHandSideExpressionAllowCall() {
        var marker, expr;

        skipComment();
        marker = createLocationMarker();

        expr = matchKeyword('new') ? parseNewExpression() : parsePrimaryExpression();

        while (match('.') || match('[') || match('(')) {
            if (match('(')) {
                expr = {
                    type: Syntax.CallExpression,
                    callee: expr,
                    'arguments': parseArguments()
                };
                marker.end();
                marker.apply(expr);
            } else if (match('[')) {
                expr = {
                    type: Syntax.MemberExpression,
                    computed: true,
                    object: expr,
                    property: parseComputedMember()
                };
                marker.end();
                marker.apply(expr);
            } else {
                expr = {
                    type: Syntax.MemberExpression,
                    computed: false,
                    object: expr,
                    property: parseNonComputedMember()
                };
                marker.end();
                marker.apply(expr);
            }
        }

        return expr;
    }

    function filterGroup(node) {
        var n, i, entry;

        n = (Object.prototype.toString.apply(node) === '[object Array]') ? [] : {};
        for (i in node) {
            if (node.hasOwnProperty(i) && i !== 'groupRange' && i !== 'groupLoc') {
                entry = node[i];
                if (entry === null || typeof entry !== 'object' || entry instanceof RegExp) {
                    n[i] = entry;
                } else {
                    n[i] = filterGroup(entry);
                }
            }
        }
        return n;
    }

    function wrapTrackingFunction(range, loc) {

        return function (parseFunction) {

            function isBinary(node) {
                return node.type === Syntax.LogicalExpression ||
                    node.type === Syntax.BinaryExpression;
            }

            function visit(node) {
                var start, end;

                if (isBinary(node.left)) {
                    visit(node.left);
                }
                if (isBinary(node.right)) {
                    visit(node.right);
                }

                if (range) {
                    if (node.left.groupRange || node.right.groupRange) {
                        start = node.left.groupRange ? node.left.groupRange[0] : node.left.range[0];
                        end = node.right.groupRange ? node.right.groupRange[1] : node.right.range[1];
                        node.range = [start, end];
                    } else if (typeof node.range === 'undefined') {
                        start = node.left.range[0];
                        end = node.right.range[1];
                        node.range = [start, end];
                    }
                }
                if (loc) {
                    if (node.left.groupLoc || node.right.groupLoc) {
                        start = node.left.groupLoc ? node.left.groupLoc.start : node.left.loc.start;
                        end = node.right.groupLoc ? node.right.groupLoc.end : node.right.loc.end;
                        node.loc = {
                            start: start,
                            end: end
                        };
                    } else if (typeof node.loc === 'undefined') {
                        node.loc = {
                            start: node.left.loc.start,
                            end: node.right.loc.end
                        };
                    }
                }
            }

            return function () {
                var marker, node;

                skipComment();

                marker = createLocationMarker();
                node = parseFunction.apply(null, arguments);
                marker.end();

                if (range && typeof node.range === 'undefined') {
                    marker.apply(node);
                }

                if (loc && typeof node.loc === 'undefined') {
                    marker.apply(node);
                }

                if (isBinary(node)) {
                    visit(node);
                }

                return node;
            };
        };
    }

    function patch() {

        var wrapTracking;

        if (extra.comments) {
            extra.skipComment = skipComment;
            skipComment = scanComment;
        }

        if (extra.raw) {
            extra.createLiteral = createLiteral;
            createLiteral = createRawLiteral;
        }

        if (extra.range || extra.loc) {

            extra.parseGroupExpression = parseGroupExpression;
            extra.parseLeftHandSideExpression = parseLeftHandSideExpression;
            extra.parseLeftHandSideExpressionAllowCall = parseLeftHandSideExpressionAllowCall;
            parseGroupExpression = trackGroupExpression;
            parseLeftHandSideExpression = trackLeftHandSideExpression;
            parseLeftHandSideExpressionAllowCall = trackLeftHandSideExpressionAllowCall;

            wrapTracking = wrapTrackingFunction(extra.range, extra.loc);

            extra.parseAdditiveExpression = parseAdditiveExpression;
            extra.parseAssignmentExpression = parseAssignmentExpression;
            extra.parseBitwiseANDExpression = parseBitwiseANDExpression;
            extra.parseBitwiseORExpression = parseBitwiseORExpression;
            extra.parseBitwiseXORExpression = parseBitwiseXORExpression;
            extra.parseBlock = parseBlock;
            extra.parseFunctionSourceElements = parseFunctionSourceElements;
            extra.parseCatchClause = parseCatchClause;
            extra.parseComputedMember = parseComputedMember;
            extra.parseConditionalExpression = parseConditionalExpression;
            extra.parseConstLetDeclaration = parseConstLetDeclaration;
            extra.parseEqualityExpression = parseEqualityExpression;
            extra.parseExpression = parseExpression;
            extra.parseForVariableDeclaration = parseForVariableDeclaration;
            extra.parseFunctionDeclaration = parseFunctionDeclaration;
            extra.parseFunctionExpression = parseFunctionExpression;
            extra.parseLogicalANDExpression = parseLogicalANDExpression;
            extra.parseLogicalORExpression = parseLogicalORExpression;
            extra.parseMultiplicativeExpression = parseMultiplicativeExpression;
            extra.parseNewExpression = parseNewExpression;
            extra.parseNonComputedProperty = parseNonComputedProperty;
            extra.parseObjectProperty = parseObjectProperty;
            extra.parseObjectPropertyKey = parseObjectPropertyKey;
            extra.parsePostfixExpression = parsePostfixExpression;
            extra.parsePrimaryExpression = parsePrimaryExpression;
            extra.parseProgram = parseProgram;
            extra.parsePropertyFunction = parsePropertyFunction;
            extra.parseRelationalExpression = parseRelationalExpression;
            extra.parseStatement = parseStatement;
            extra.parseShiftExpression = parseShiftExpression;
            extra.parseSwitchCase = parseSwitchCase;
            extra.parseUnaryExpression = parseUnaryExpression;
            extra.parseVariableDeclaration = parseVariableDeclaration;
            extra.parseVariableIdentifier = parseVariableIdentifier;

            parseAdditiveExpression = wrapTracking(extra.parseAdditiveExpression);
            parseAssignmentExpression = wrapTracking(extra.parseAssignmentExpression);
            parseBitwiseANDExpression = wrapTracking(extra.parseBitwiseANDExpression);
            parseBitwiseORExpression = wrapTracking(extra.parseBitwiseORExpression);
            parseBitwiseXORExpression = wrapTracking(extra.parseBitwiseXORExpression);
            parseBlock = wrapTracking(extra.parseBlock);
            parseFunctionSourceElements = wrapTracking(extra.parseFunctionSourceElements);
            parseCatchClause = wrapTracking(extra.parseCatchClause);
            parseComputedMember = wrapTracking(extra.parseComputedMember);
            parseConditionalExpression = wrapTracking(extra.parseConditionalExpression);
            parseConstLetDeclaration = wrapTracking(extra.parseConstLetDeclaration);
            parseEqualityExpression = wrapTracking(extra.parseEqualityExpression);
            parseExpression = wrapTracking(extra.parseExpression);
            parseForVariableDeclaration = wrapTracking(extra.parseForVariableDeclaration);
            parseFunctionDeclaration = wrapTracking(extra.parseFunctionDeclaration);
            parseFunctionExpression = wrapTracking(extra.parseFunctionExpression);
            parseLeftHandSideExpression = wrapTracking(parseLeftHandSideExpression);
            parseLogicalANDExpression = wrapTracking(extra.parseLogicalANDExpression);
            parseLogicalORExpression = wrapTracking(extra.parseLogicalORExpression);
            parseMultiplicativeExpression = wrapTracking(extra.parseMultiplicativeExpression);
            parseNewExpression = wrapTracking(extra.parseNewExpression);
            parseNonComputedProperty = wrapTracking(extra.parseNonComputedProperty);
            parseObjectProperty = wrapTracking(extra.parseObjectProperty);
            parseObjectPropertyKey = wrapTracking(extra.parseObjectPropertyKey);
            parsePostfixExpression = wrapTracking(extra.parsePostfixExpression);
            parsePrimaryExpression = wrapTracking(extra.parsePrimaryExpression);
            parseProgram = wrapTracking(extra.parseProgram);
            parsePropertyFunction = wrapTracking(extra.parsePropertyFunction);
            parseRelationalExpression = wrapTracking(extra.parseRelationalExpression);
            parseStatement = wrapTracking(extra.parseStatement);
            parseShiftExpression = wrapTracking(extra.parseShiftExpression);
            parseSwitchCase = wrapTracking(extra.parseSwitchCase);
            parseUnaryExpression = wrapTracking(extra.parseUnaryExpression);
            parseVariableDeclaration = wrapTracking(extra.parseVariableDeclaration);
            parseVariableIdentifier = wrapTracking(extra.parseVariableIdentifier);
        }

        if (typeof extra.tokens !== 'undefined') {
            extra.advance = advance;
            extra.scanRegExp = scanRegExp;

            advance = collectToken;
            scanRegExp = collectRegex;
        }
    }

    function unpatch() {
        if (typeof extra.skipComment === 'function') {
            skipComment = extra.skipComment;
        }

        if (extra.raw) {
            createLiteral = extra.createLiteral;
        }

        if (extra.range || extra.loc) {
            parseAdditiveExpression = extra.parseAdditiveExpression;
            parseAssignmentExpression = extra.parseAssignmentExpression;
            parseBitwiseANDExpression = extra.parseBitwiseANDExpression;
            parseBitwiseORExpression = extra.parseBitwiseORExpression;
            parseBitwiseXORExpression = extra.parseBitwiseXORExpression;
            parseBlock = extra.parseBlock;
            parseFunctionSourceElements = extra.parseFunctionSourceElements;
            parseCatchClause = extra.parseCatchClause;
            parseComputedMember = extra.parseComputedMember;
            parseConditionalExpression = extra.parseConditionalExpression;
            parseConstLetDeclaration = extra.parseConstLetDeclaration;
            parseEqualityExpression = extra.parseEqualityExpression;
            parseExpression = extra.parseExpression;
            parseForVariableDeclaration = extra.parseForVariableDeclaration;
            parseFunctionDeclaration = extra.parseFunctionDeclaration;
            parseFunctionExpression = extra.parseFunctionExpression;
            parseGroupExpression = extra.parseGroupExpression;
            parseLeftHandSideExpression = extra.parseLeftHandSideExpression;
            parseLeftHandSideExpressionAllowCall = extra.parseLeftHandSideExpressionAllowCall;
            parseLogicalANDExpression = extra.parseLogicalANDExpression;
            parseLogicalORExpression = extra.parseLogicalORExpression;
            parseMultiplicativeExpression = extra.parseMultiplicativeExpression;
            parseNewExpression = extra.parseNewExpression;
            parseNonComputedProperty = extra.parseNonComputedProperty;
            parseObjectProperty = extra.parseObjectProperty;
            parseObjectPropertyKey = extra.parseObjectPropertyKey;
            parsePrimaryExpression = extra.parsePrimaryExpression;
            parsePostfixExpression = extra.parsePostfixExpression;
            parseProgram = extra.parseProgram;
            parsePropertyFunction = extra.parsePropertyFunction;
            parseRelationalExpression = extra.parseRelationalExpression;
            parseStatement = extra.parseStatement;
            parseShiftExpression = extra.parseShiftExpression;
            parseSwitchCase = extra.parseSwitchCase;
            parseUnaryExpression = extra.parseUnaryExpression;
            parseVariableDeclaration = extra.parseVariableDeclaration;
            parseVariableIdentifier = extra.parseVariableIdentifier;
        }

        if (typeof extra.scanRegExp === 'function') {
            advance = extra.advance;
            scanRegExp = extra.scanRegExp;
        }
    }

    function stringToArray(str) {
        var length = str.length,
            result = [],
            i;
        for (i = 0; i < length; ++i) {
            result[i] = str.charAt(i);
        }
        return result;
    }

    function parse(code, options) {
        var program, toString;

        toString = String;
        if (typeof code !== 'string' && !(code instanceof String)) {
            code = toString(code);
        }

        source = code;
        index = 0;
        lineNumber = (source.length > 0) ? 1 : 0;
        lineStart = 0;
        length = source.length;
        buffer = null;
        state = {
            allowIn: true,
            labelSet: {},
            inFunctionBody: false,
            inIteration: false,
            inSwitch: false
        };

        extra = {};
        if (typeof options !== 'undefined') {
            extra.range = (typeof options.range === 'boolean') && options.range;
            extra.loc = (typeof options.loc === 'boolean') && options.loc;
            extra.raw = (typeof options.raw === 'boolean') && options.raw;
            if (typeof options.tokens === 'boolean' && options.tokens) {
                extra.tokens = [];
            }
            if (typeof options.comment === 'boolean' && options.comment) {
                extra.comments = [];
            }
            if (typeof options.tolerant === 'boolean' && options.tolerant) {
                extra.errors = [];
            }
        }

        if (length > 0) {
            if (typeof source[0] === 'undefined') {
                // Try first to convert to a string. This is good as fast path
                // for old IE which understands string indexing for string
                // literals only and not for string object.
                if (code instanceof String) {
                    source = code.valueOf();
                }

                // Force accessing the characters via an array.
                if (typeof source[0] === 'undefined') {
                    source = stringToArray(code);
                }
            }
        }

        patch();
        try {
            program = parseProgram();
            if (typeof extra.comments !== 'undefined') {
                filterCommentLocation();
                program.comments = extra.comments;
            }
            if (typeof extra.tokens !== 'undefined') {
                filterTokenLocation();
                program.tokens = extra.tokens;
            }
            if (typeof extra.errors !== 'undefined') {
                program.errors = extra.errors;
            }
            if (extra.range || extra.loc) {
                program.body = filterGroup(program.body);
            }
        } catch (e) {
            throw e;
        } finally {
            unpatch();
            extra = {};
        }

        return program;
    }

    // Sync with package.json.
    exports.version = '1.0.4';

    exports.parse = parse;

    // Deep copy.
    exports.Syntax = (function () {
        var name, types = {};

        if (typeof Object.create === 'function') {
            types = Object.create(null);
        }

        for (name in Syntax) {
            if (Syntax.hasOwnProperty(name)) {
                types[name] = Syntax[name];
            }
        }

        if (typeof Object.freeze === 'function') {
            Object.freeze(types);
        }

        return types;
    }());

}));
/* vim: set sw=4 ts=4 et tw=80 : */

},{}],36:[function(require,module,exports){
/*

 Copyright 2000, Silicon Graphics, Inc. All Rights Reserved.
 Copyright 2014, Google Inc. All Rights Reserved.

 Permission is hereby granted, free of charge, to any person obtaining a copy
 of this software and associated documentation files (the "Software"), to
 deal in the Software without restriction, including without limitation the
 rights to use, copy, modify, merge, publish, distribute, sublicense, and/or
 sell copies of the Software, and to permit persons to whom the Software is
 furnished to do so, subject to the following conditions:

 The above copyright notice including the dates of first publication and
 either this permission notice or a reference to http://oss.sgi.com/projects/FreeB/
 shall be included in all copies or substantial portions of the Software.

 THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
 IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
 FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL
 SILICON GRAPHICS, INC. BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY,
 WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM, OUT OF OR
 IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE SOFTWARE.

 Original Code. The Original Code is: OpenGL Sample Implementation,
 Version 1.2.1, released January 26, 2000, developed by Silicon Graphics,
 Inc. The Original Code is Copyright (c) 1991-2000 Silicon Graphics, Inc.
 Copyright in any portions created by third parties is as indicated
 elsewhere herein. All Rights Reserved.
*/
'use strict';var m;function s(a,b){return a.b===b.b&&a.a===b.a}function t(a,b){return a.b<b.b||a.b===b.b&&a.a<=b.a}function u(a,b,c){var d,e;d=b.b-a.b;e=c.b-b.b;return 0<d+e?d<e?b.a-a.a+d/(d+e)*(a.a-c.a):b.a-c.a+e/(d+e)*(c.a-a.a):0}function w(a,b,c){var d,e;d=b.b-a.b;e=c.b-b.b;return 0<d+e?(b.a-c.a)*d+(b.a-a.a)*e:0}function x(a,b){return a.a<b.a||a.a===b.a&&a.b<=b.b}function aa(a,b,c){var d,e;d=b.a-a.a;e=c.a-b.a;return 0<d+e?d<e?b.b-a.b+d/(d+e)*(a.b-c.b):b.b-c.b+e/(d+e)*(c.b-a.b):0}
function ba(a,b,c){var d,e;d=b.a-a.a;e=c.a-b.a;return 0<d+e?(b.b-c.b)*d+(b.b-a.b)*e:0}function ca(a){return t(z(a),a.a)}function da(a){return t(a.a,z(a))}function A(a,b,c,d){a=0>a?0:a;c=0>c?0:c;return a<=c?0===c?(b+d)/2:b+a/(a+c)*(d-b):d+c/(a+c)*(b-d)};function ea(a){var b=fa(a.b);B(b,a.c);B(b.b,a.c);C(b,a.a);return b}function D(a,b){var c=!1,d=!1;a!==b&&(b.a!==a.a&&(d=!0,E(b.a,a.a)),b.c!==a.c&&(c=!0,F(b.c,a.c)),G(b,a),d||(B(b,a.a),a.a.c=a),c||(C(b,a.c),a.c.b=a))}function H(a){var b=a.b,c=!1;a.c!==I(a)&&(c=!0,F(a.c,I(a)));a.d===a?E(a.a,null):(I(a).b=J(a),a.a.c=a.d,G(a,J(a)),c||C(a,a.c));b.d===b?(E(b.a,null),F(b.c,null)):(a.c.b=J(b),b.a.c=b.d,G(b,J(b)));ga(a)}
function K(a){var b=fa(a),c=b.b;G(b,a.e);b.a=z(a);B(c,b.a);b.c=c.c=a.c;b=b.b;G(a.b,J(a.b));G(a.b,b);a.b.a=b.a;z(b).c=b.b;b.b.c=I(a);b.g=a.g;b.b.g=a.b.g;return b}function L(a,b){var c=!1,d=fa(a),e=d.b;b.c!==a.c&&(c=!0,F(b.c,a.c));G(d,a.e);G(e,b);d.a=z(a);e.a=b.a;d.c=e.c=a.c;a.c.b=e;c||C(d,a.c);return d}function fa(a){var b=new M,c=new M,d=a.b.i;c.i=d;d.b.i=b;b.i=a;a.b.i=c;b.b=c;b.d=b;b.e=c;c.b=b;c.d=c;return c.e=b}function G(a,b){var c=a.d,d=b.d;c.b.e=b;d.b.e=a;a.d=d;b.d=c}
function B(a,b){var c=b.g,d=new ha(b,c);c.e=d;b.g=d;c=d.c=a;do c.a=d,c=c.d;while(c!==a)}function C(a,b){var c=b.g,d=new ia(b,c);c.a=d;b.g=d;d.b=a;d.c=b.c;c=a;do c.c=d,c=c.e;while(c!==a)}function ga(a){var b=a.i;a=a.b.i;b.b.i=a;a.b.i=b}function E(a,b){var c=a.c,d=c;do d.a=b,d=d.d;while(d!==c);c=a.g;d=a.e;d.g=c;c.e=d}function F(a,b){var c=a.b,d=c;do d.c=b,d=d.e;while(d!==c);c=a.g;d=a.a;d.g=c;c.a=d};function ja(a,b){return a[0]*b[0]+a[1]*b[1]+a[2]*b[2]}function ka(a){var b=0;Math.abs(a[1])>Math.abs(a[0])&&(b=1);Math.abs(a[2])>Math.abs(a[b])&&(b=2);return b};function la(a){if(3>a.c)return!0;var b=[0,0,0];b[0]=a.i[0];b[1]=a.i[1];b[2]=a.i[2];0===b[0]&&0===b[1]&&0===b[2]&&ma(a,b,!1);var c=ma(a,b,!0);if(2===c)return!1;if(0===c)return!0;switch(a.B){case 100132:if(0>c)return!0;break;case 100133:if(0<c)return!0;break;case 100134:return!0}N(a,a.n?2:3<a.c?6:4);b=0+a.c;O(a,a.g[0].a);if(0<c)for(c=1;c<b;++c)O(a,a.g[c].a);else for(c=b-1;0<c;--c)O(a,a.g[c].a);P(a);return!0}function Q(a){return!a.c||a.d}function na(a){for(;null!==a;)a.d=!1,a=a.e}
function oa(a){var b=new pa(0,null,qa),c=null,d;for(d=a;!Q(d.c);d=d.d)d.c.e=c,c=d.c,d.c.d=!0,++b.a;for(d=a;!Q(I(d));d=J(d))I(d).e=c,c=I(d),I(d).d=!0,++b.a;b.b=d;na(c);return b}
function ra(a){var b=new pa(0,null,sa),c=0,d=0,e=null,f,g;for(f=a;!Q(f.c);++d,f=f.d){f.c.e=e;e=f.c;f.c.d=!0;++d;f=f.e.b;if(Q(f.c))break;f.c.e=e;e=f.c;f.c.d=!0}g=f;for(f=a;!Q(I(f));++c,f=f.b.d.b){I(f).e=e;e=I(f);I(f).d=!0;++c;f=J(f);if(Q(I(f)))break;I(f).e=e;e=I(f);I(f).d=!0}a=f;b.a=d+c;0===(d&1)?b.b=g.b:0===(c&1)?b.b=a:(--b.a,b.b=a.d);na(e);return b}function qa(a,b,c){N(a,6);O(a,b.a.d);for(O(a,z(b).d);!Q(b.c);)b.c.d=!0,--c,b=b.d,O(a,z(b).d);P(a)}
function sa(a,b,c){N(a,5);O(a,b.a.d);for(O(a,z(b).d);!Q(b.c);){b.c.d=!0;--c;b=b.e.b;O(a,b.a.d);if(Q(b.c))break;b.c.d=!0;--c;b=b.d;O(a,z(b).d)}P(a)}function ta(a,b){b.c.e=a.m;a.m=b.c;b.c.d=!0}
function ma(a,b,c){c||(b[0]=b[1]=b[2]=0);for(var d=0+a.c,e=1,f=a.g[0],g=a.g[e],n=g.f[0]-f.f[0],l=g.f[1]-f.f[1],k=g.f[2]-f.f[2],h=0;++e<d;){var g=a.g[e],p=n,r=l,v=k,n=g.f[0]-f.f[0],l=g.f[1]-f.f[1],k=g.f[2]-f.f[2],g=[0,0,0];g[0]=r*k-v*l;g[1]=v*n-p*k;g[2]=p*l-r*n;p=g[0]*b[0]+g[1]*b[1]+g[2]*b[2];if(!c)0<=p?(b[0]+=g[0],b[1]+=g[1],b[2]+=g[2]):(b[0]-=g[0],b[1]-=g[1],b[2]-=g[2]);else if(0!==p)if(0<p){if(0>h)return 2;h=1}else{if(0<h)return 2;h=-1}}return h};var R=4*1E150;function ua(a,b){a.g+=b.g;a.b.g+=b.b.g}function va(a,b,c){a=a.a;b=b.h;c=c.h;if(z(b)===a)return z(c)===a?t(b.a,c.a)?0>=w(z(c),b.a,c.a):0<=w(z(b),c.a,b.a):0>=w(z(c),a,c.a);if(z(c)===a)return 0<=w(z(b),a,b.a);b=u(z(b),a,b.a);a=u(z(c),a,c.a);return b>=a}function S(a){a.h.j=null;var b=a.d;b.a.c=b.c;b.c.a=b.a;a.d=null}function wa(a,b){H(a.h);a.b=!1;a.h=b;b.j=a}function xa(a){var b=a.h.a;do a=T(a);while(a.h.a===b);a.b&&(b=L(U(a).h.b,a.h.e),wa(a,b),a=T(a));return a}
function ya(a){var b=z(a.h);do a=T(a);while(z(a.h)===b);return a}function za(a,b,c){var d=new Aa;d.h=c;d.d=Ba(a.k,b.d,d);return c.j=d}function Ca(a,b){switch(a.B){case 100130:return 0!==(b&1);case 100131:return 0!==b;case 100132:return 0<b;case 100133:return 0>b;case 100134:return 2<=b||-2>=b}return!1}function Da(a){var b=a.h,c=b.c;c.c=a.c;c.b=b;S(a)}
function V(a,b){for(var c=a,d=a.h;c!==b;){c.b=!1;var e=U(c),f=e.h;if(f.a!==d.a){if(!e.b){Da(c);break}f=L(d.d.b,f.b);wa(e,f)}d.d!==f&&(D(J(f),f),D(d,f));Da(c);d=e.h;c=e}return d}function W(a,b,c,d,e,f){var g=!0;do za(a,b,c.b),c=c.d;while(c!==d);for(null===e&&(e=U(b).h.b.d);;){d=U(b);c=d.h.b;if(c.a!==e.a)break;c.d!==e&&(D(J(c),c),D(J(e),c));d.e=b.e-c.g;d.c=Ca(a,d.e);b.a=!0;!g&&Ea(a,b)&&(ua(c,e),S(b),H(e));g=!1;b=d;e=c}b.a=!0;f&&Fa(a,b)}
function Ga(a,b,c,d,e){var f=[b.f[0],b.f[1],b.f[2]];b.d=null;var g;a.C?g=a.C(f,c,d,a.d):a.D&&(g=a.D(f,c,d));void 0===g&&(g=null);b.d=g;null===b.d&&(e?a.A||(X(a,100156),a.A=!0):b.d=c[0])}function Y(a,b,c){var d=[null,null,null,null];d[0]=b.a.d;d[1]=c.a.d;Ga(a,b.a,d,[.5,.5,0,0],!1);D(b,c)}
function Ha(a,b,c,d,e){var f=Math.abs(b.b-a.b)+Math.abs(b.a-a.a),g=Math.abs(c.b-a.b)+Math.abs(c.a-a.a),n=e+1;d[e]=.5*g/(f+g);d[n]=.5*f/(f+g);a.f[0]+=d[e]*b.f[0]+d[n]*c.f[0];a.f[1]+=d[e]*b.f[1]+d[n]*c.f[1];a.f[2]+=d[e]*b.f[2]+d[n]*c.f[2]}
function Ea(a,b){var c=U(b),d=b.h,e=c.h;if(t(d.a,e.a)){if(0<w(z(e),d.a,e.a))return!1;if(!s(d.a,e.a))K(e.b),D(d,J(e)),b.a=c.a=!0;else if(d.a!==e.a){var c=a.j,f=d.a.i;if(0<=f){var c=c.b,g=c.c,n=c.a,l=n[f].b;g[l].a=g[c.b].a;n[g[l].a].b=l;l<=--c.b&&(1>=l||c.g(n[g[l>>1].a].a,n[g[l].a].a)?Ia(c,l):Ja(c,l));n[f].a=null;n[f].b=c.d;c.d=f}else for(c.c[-(f+1)]=null;0<c.a&&null===c.c[c.d[c.a-1]];)--c.a;Y(a,J(e),d)}}else{if(0>w(z(d),e.a,d.a))return!1;T(b).a=b.a=!0;K(d.b);D(J(e),d)}return!0}
function Ka(a,b){var c=U(b),d=b.h,e=c.h,f=d.a,g=e.a,n=z(d),l=z(e),k=new ha;w(n,a.a,f);w(l,a.a,g);if(f===g||Math.min(f.a,n.a)>Math.max(g.a,l.a))return!1;if(t(f,g)){if(0<w(l,f,g))return!1}else if(0>w(n,g,f))return!1;var h=n,p=f,r=l,v=g,q,y;t(h,p)||(q=h,h=p,p=q);t(r,v)||(q=r,r=v,v=q);t(h,r)||(q=h,h=r,r=q,q=p,p=v,v=q);t(r,p)?t(p,v)?(q=u(h,r,p),y=u(r,p,v),0>q+y&&(q=-q,y=-y),k.b=A(q,r.b,y,p.b)):(q=w(h,r,p),y=-w(h,v,p),0>q+y&&(q=-q,y=-y),k.b=A(q,r.b,y,v.b)):k.b=(r.b+p.b)/2;x(h,p)||(q=h,h=p,p=q);x(r,v)||
(q=r,r=v,v=q);x(h,r)||(q=h,h=r,r=q,q=p,p=v,v=q);x(r,p)?x(p,v)?(q=aa(h,r,p),y=aa(r,p,v),0>q+y&&(q=-q,y=-y),k.a=A(q,r.a,y,p.a)):(q=ba(h,r,p),y=-ba(h,v,p),0>q+y&&(q=-q,y=-y),k.a=A(q,r.a,y,v.a)):k.a=(r.a+p.a)/2;t(k,a.a)&&(k.b=a.a.b,k.a=a.a.a);h=t(f,g)?f:g;t(h,k)&&(k.b=h.b,k.a=h.a);if(s(k,f)||s(k,g))return Ea(a,b),!1;if(!s(n,a.a)&&0<=w(n,a.a,k)||!s(l,a.a)&&0>=w(l,a.a,k)){if(l===a.a)return K(d.b),D(e.b,d),b=xa(b),d=U(b).h,V(U(b),c),W(a,b,J(d),d,d,!0),!0;if(n===a.a)return K(e.b),D(d.e,J(e)),c=b,b=ya(b),
f=U(b).h.b.d,c.h=J(e),e=V(c,null),W(a,b,e.d,d.b.d,f,!0),!0;0<=w(n,a.a,k)&&(T(b).a=b.a=!0,K(d.b),d.a.b=a.a.b,d.a.a=a.a.a);0>=w(l,a.a,k)&&(b.a=c.a=!0,K(e.b),e.a.b=a.a.b,e.a.a=a.a.a);return!1}K(d.b);K(e.b);D(J(e),d);d.a.b=k.b;d.a.a=k.a;d.a.i=La(a.j,d.a);d=d.a;e=[0,0,0,0];k=[f.d,n.d,g.d,l.d];d.f[0]=d.f[1]=d.f[2]=0;Ha(d,f,n,e,0);Ha(d,g,l,e,2);Ga(a,d,k,e,!0);T(b).a=b.a=c.a=!0;return!1}
function Fa(a,b){for(var c=U(b);;){for(;c.a;)b=c,c=U(c);if(!b.a&&(c=b,b=T(b),null===b||!b.a))break;b.a=!1;var d=b.h,e=c.h,f;if(f=z(d)!==z(e))a:{f=b;var g=U(f),n=f.h,l=g.h,k=void 0;if(t(z(n),z(l))){if(0>w(z(n),z(l),n.a)){f=!1;break a}T(f).a=f.a=!0;k=K(n);D(l.b,k);k.c.c=f.c}else{if(0<w(z(l),z(n),l.a)){f=!1;break a}f.a=g.a=!0;k=K(l);D(n.e,l.b);I(k).c=f.c}f=!0}f&&(c.b?(S(c),H(e),c=U(b),e=c.h):b.b&&(S(b),H(d),b=T(c),d=b.h));if(d.a!==e.a)if(z(d)===z(e)||b.b||c.b||z(d)!==a.a&&z(e)!==a.a)Ea(a,b);else if(Ka(a,
b))break;d.a===e.a&&z(d)===z(e)&&(ua(e,d),S(b),H(d),b=T(c))}}
function Ma(a,b){a.a=b;for(var c=b.c;null===c.j;)if(c=c.d,c===b.c){var c=a,d=b,e=new Aa;e.h=d.c.b;var f=c.k,g=f.a;do g=g.a;while(null!==g.b&&!f.c(f.b,e,g.b));var f=g.b,n=U(f),e=f.h,g=n.h;if(0===w(z(e),d,e.a))if(e=f.h,s(e.a,d))Y(c,e,d.c);else if(s(z(e),d)){var f=ya(f),e=U(f),g=e.h.b,l=n=g.d;e.b&&(S(e),H(g),g=J(n));D(d.c,g);ca(n)||(n=null);W(c,f,g.d,l,n,!0)}else K(e.b),f.b&&(H(e.d),f.b=!1),D(d.c,e),Ma(c,d);else l=t(z(g),z(e))?f:n,n=void 0,f.c||l.b?(l===f?n=L(d.c.b,e.e):n=L(g.b.d.b,d.c).b,l.b?wa(l,n):
(e=c,f=za(c,f,n),f.e=T(f).e+f.h.g,f.c=Ca(e,f.e)),Ma(c,d)):W(c,f,d.c,d.c,null,!0);return}c=xa(c.j);e=U(c);f=e.h;e=V(e,null);if(e.d===f){var f=e,e=f.d,g=U(c),n=c.h,l=g.h,k=!1;z(n)!==z(l)&&Ka(a,c);s(n.a,a.a)&&(D(J(e),n),c=xa(c),e=U(c).h,V(U(c),g),k=!0);s(l.a,a.a)&&(D(f,J(l)),f=V(g,null),k=!0);k?W(a,c,f.d,e,e,!0):(t(l.a,n.a)?d=J(l):d=n,d=L(f.d.b,d),W(a,c,d,d.d,d.d,!1),d.b.j.b=!0,Fa(a,c))}else W(a,c,e.d,f,f,!0)}
function Na(a,b){var c=new Aa,d=ea(a.b);d.a.b=R;d.a.a=b;z(d).b=-R;z(d).a=b;a.a=z(d);c.h=d;c.e=0;c.c=!1;c.b=!1;c.g=!0;c.a=!1;d=a.k;d=Ba(d,d.a,c);c.d=d};function Oa(a){this.a=new Pa;this.a.a=this.a;this.a.c=this.a;this.b=a;this.c=va}function Ba(a,b,c){do b=b.c;while(null!==b.b&&!a.c(a.b,b.b,c));a=new Pa;a.b=c;a.a=b.a;b.a.c=a;a.c=b;return b.a=a};function Pa(){this.c=this.a=this.b=null};function Qa(){this.f=[0,0,0];this.a=null};function Z(){this.e=0;this.G=this.b=this.p=null;this.i=[0,0,0];this.L=[0,0,0];this.l=[0,0,0];this.H=0;this.B=100130;this.A=!1;this.D=this.a=this.j=this.k=null;this.n=this.o=!1;this.d=this.C=this.F=this.u=this.x=this.s=this.q=this.w=this.v=this.y=this.t=this.r=this.m=null;this.z=!1;this.c=0;this.g=Array(100);for(var a=0;100>a;a++)this.g[a]=new Qa}m=Z.prototype;m.M=function(){$(this,0)};
m.R=function(a,b){switch(a){case 100142:if(0>b||1<b)break;this.H=b;return;case 100140:switch(b){case 100130:case 100131:case 100132:case 100133:case 100134:this.B=b;return}break;case 100141:this.n=!!b;return;default:X(this,100900);return}X(this,100901)};m.N=function(a){switch(a){case 100142:return this.H;case 100140:return this.B;case 100141:return this.n;default:X(this,100900)}return!1};m.Q=function(a,b,c){this.i[0]=a;this.i[1]=b;this.i[2]=c};
m.O=function(a,b){var c=b?b:null;switch(a){case 100100:this.r=c;break;case 100106:this.q=c;break;case 100104:this.t=c;this.o=!!c;break;case 100110:this.s=c;this.o=!!c;break;case 100101:this.y=c;break;case 100107:this.x=c;break;case 100102:this.v=c;break;case 100108:this.u=c;break;case 100103:this.G=c;break;case 100109:this.F=c;break;case 100105:this.D=c;break;case 100111:this.C=c;break;case 100112:this.w=c;break;default:X(this,100900)}};
m.S=function(a,b){var c=!1,d=[0,0,0];$(this,2);this.z&&(Ra(this),this.p=null);for(var e=0;3>e;++e){var f=a[e];-1E150>f&&(f=-1E150,c=!0);1E150<f&&(f=1E150,c=!0);d[e]=f}c&&X(this,100155);if(null===this.b){if(100>this.c){c=this.g[this.c];c.a=b;c.f[0]=d[0];c.f[1]=d[1];c.f[2]=d[2];++this.c;return}Ra(this)}Sa(this,d,b)};m.J=function(a){$(this,0);this.e=1;this.c=0;this.z=!1;this.b=null;this.d=a};m.I=function(){$(this,1);this.e=2;this.p=null;0<this.c&&(this.z=!0)};m.K=function(){$(this,2);this.e=1};
m.P=function(){$(this,1);this.e=0;if(null===this.b){if(!this.o&&!this.w&&la(this)){this.d=null;return}Ra(this)}var a=!1,b=[0,0,0];b[0]=this.i[0];b[1]=this.i[1];b[2]=this.i[2];if(0===b[0]&&0===b[1]&&0===b[2]){var c=[0,0,0],d=[0,0,0],a=[0,0,0],e=[0,0,0],f=[0,0,0];c[0]=c[1]=c[2]=-2*1E150;d[0]=d[1]=d[2]=2*1E150;var g=Array(3),n=Array(3),l,k,h=this.b.c;for(k=h.e;k!==h;k=k.e)for(l=0;3>l;++l){var p=k.f[l];p<d[l]&&(d[l]=p,n[l]=k);p>c[l]&&(c[l]=p,g[l]=k)}l=0;c[1]-d[1]>c[0]-d[0]&&(l=1);c[2]-d[2]>c[l]-d[l]&&
(l=2);if(d[l]>=c[l])b[0]=0,b[1]=0,b[2]=1;else{c=0;k=n[l];g=g[l];a[0]=k.f[0]-g.f[0];a[1]=k.f[1]-g.f[1];a[2]=k.f[2]-g.f[2];for(k=h.e;k!==h;k=k.e)e[0]=k.f[0]-g.f[0],e[1]=k.f[1]-g.f[1],e[2]=k.f[2]-g.f[2],f[0]=a[1]*e[2]-a[2]*e[1],f[1]=a[2]*e[0]-a[0]*e[2],f[2]=a[0]*e[1]-a[1]*e[0],l=f[0]*f[0]+f[1]*f[1]+f[2]*f[2],l>c&&(c=l,b[0]=f[0],b[1]=f[1],b[2]=f[2]);0>=c&&(b[0]=b[1]=b[2]=0,b[ka(a)]=1)}a=!0}e=this.L;f=this.l;h=ka(b);e[h]=0;e[(h+1)%3]=1;e[(h+2)%3]=0;f[h]=0;f[(h+1)%3]=0<b[h]?-0:0;f[(h+2)%3]=0<b[h]?1:-1;
b=this.b.c;for(h=b.e;h!==b;h=h.e)h.b=ja(h.f,e),h.a=ja(h.f,f);if(a){b=0;a=this.b.a;for(e=a.a;e!==a;e=e.a)if(f=e.b,!(0>=f.g)){do b+=(f.a.b-z(f).b)*(f.a.a+z(f).a),f=f.e;while(f!==e.b)}if(0>b){b=this.b.c;for(a=b.e;a!==b;a=a.e)a.a=-a.a;this.l[0]=-this.l[0];this.l[1]=-this.l[1];this.l[2]=-this.l[2]}}this.A=!1;b=this.b.b;for(e=b.i;e!==b;e=a)if(a=e.i,f=e.e,s(e.a,z(e))&&e.e.e!==e&&(Y(this,f,e),H(e),e=f,f=e.e),f.e===e){if(f!==e){if(f===a||f===a.b)a=a.i;H(f)}if(e===a||e===a.b)a=a.i;H(e)}this.j=b=new Ta;a=this.b.c;
for(e=a.e;e!==a;e=e.e)e.i=La(b,e);Ua(b);this.k=new Oa(this);Na(this,-R);for(Na(this,R);null!==(b=Va(this.j));){for(;;){a:if(a=this.j,0===a.a)a=Wa(a.b);else{e=a.c[a.d[a.a-1]];if(0!==a.b.b&&(f=Wa(a.b),a.g(f,e))){a=f;break a}a=e}if(null===a||!s(a,b))break;a=Va(this.j);Y(this,b.c,a.c)}Ma(this,b)}this.a=this.k.a.a.b.h.a;for(b=0;null!==(a=this.k.a.a.b);)a.g||++b,S(a);this.k=null;b=this.j;a=b.b;a.a=null;a.c=null;b.b=null;b.d=null;this.j=b.c=null;b=this.b;for(e=b.a.a;e!==b.a;e=a)a=e.a,e=e.b,e.e.e===e&&(ua(e.d,
e),H(e));if(!this.A){if(this.n)for(b=this.b,e=b.b.i;e!==b.b;e=a)a=e.i,I(e).c!==e.c.c?e.g=e.c.c?1:-1:H(e);else for(b=this.b,e=b.a.a;e!==b.a;e=a)if(a=e.a,e.c){for(e=e.b;t(z(e),e.a);e=e.d.b);for(;t(e.a,z(e));e=e.e);f=e.d.b;for(h=void 0;e.e!==f;)if(t(z(e),f.a)){for(;f.e!==e&&(ca(f.e)||0>=w(f.a,z(f),z(f.e)));)h=L(f.e,f),f=h.b;f=f.d.b}else{for(;f.e!==e&&(da(e.d.b)||0<=w(z(e),e.a,e.d.b.a));)h=L(e,e.d.b),e=h.b;e=e.e}for(;f.e.e!==e;)h=L(f.e,f),f=h.b}if(this.r||this.v||this.y||this.t||this.q||this.u||this.x||
this.s)if(this.n)for(b=this.b,a=b.a.a;a!==b.a;a=a.a){if(a.c){N(this,2);e=a.b;do O(this,e.a.d),e=e.e;while(e!==a.b);P(this)}}else{b=this.b;this.m=null;for(a=b.a.a;a!==b.a;a=a.a)a.d=!1;for(a=b.a.a;a!==b.a;a=a.a)a.c&&!a.d&&(e=a.b,f=new pa(1,e,ta),h=void 0,this.o||(h=oa(e),h.a>f.a&&(f=h),h=oa(e.e),h.a>f.a&&(f=h),h=oa(e.d.b),h.a>f.a&&(f=h),h=ra(e),h.a>f.a&&(f=h),h=ra(e.e),h.a>f.a&&(f=h),h=ra(e.d.b),h.a>f.a&&(f=h)),f.c(this,f.b,f.a));if(null!==this.m){b=-1;a=this.m;for(N(this,4);null!==a;a=a.e){e=a.b;do this.o&&
(f=I(e).c?0:1,b!==f&&(b=f,f=!!b,this.s?this.s(f,this.d):this.t&&this.t(f))),O(this,e.a.d),e=e.e;while(e!==a.b)}P(this);this.m=null}}if(this.w){b=this.b;for(e=b.a.a;e!==b.a;e=a)if(a=e.a,!e.c){f=e.b;h=f.e;k=void 0;do k=h,h=k.e,k.c=null,null===I(k)&&(k.d===k?E(k.a,null):(k.a.c=k.d,G(k,J(k))),g=k.b,g.d===g?E(g.a,null):(g.a.c=g.d,G(g,J(g))),ga(k));while(k!==f);f=e.g;e=e.a;e.g=f;f.a=e}this.w(this.b);this.d=this.b=null;return}}this.b=this.d=null};
function $(a,b){if(a.e!==b)for(;a.e!==b;)if(a.e<b)switch(a.e){case 0:X(a,100151);a.J(null);break;case 1:X(a,100152),a.I()}else switch(a.e){case 2:X(a,100154);a.K();break;case 1:X(a,100153);var c=a;c.e=0;c.p=null;c.b=null}}function Sa(a,b,c){var d=a.p;null===d?(d=ea(a.b),D(d,d.b)):(K(d),d=d.e);d.a.d=c;d.a.f[0]=b[0];d.a.f[1]=b[1];d.a.f[2]=b[2];d.g=1;d.b.g=-1;a.p=d}function Ra(a){a.b=new Xa;for(var b=0;b<a.c;b++){var c=a.g[b];Sa(a,c.f,c.a)}a.c=0;a.z=!1}function N(a,b){a.q?a.q(b,a.d):a.r&&a.r(b)}
function O(a,b){a.x?a.x(b,a.d):a.y&&a.y(b)}function P(a){a.u?a.u(a.d):a.v&&a.v()}function X(a,b){a.F?a.F(b,a.d):a.G&&a.G(b)};function ia(a,b){this.a=a||this;this.g=b||this;this.e=this.b=null;this.c=this.d=!1};function M(){this.i=this;this.j=this.c=this.a=this.e=this.d=this.b=null;this.g=0}function I(a){return a.b.c}function z(a){return a.b.a}function J(a){return a.b.e};function Xa(){this.c=new ha;this.a=new ia;this.b=new M;this.d=new M;this.b.b=this.d;this.d.b=this.b};function ha(a,b){this.e=a||this;this.g=b||this;this.d=this.c=null;this.f=[0,0,0];this.a=this.b=0;this.i=null};function Ya(){this.a=null;this.b=0}function Za(a,b){var c=Array(b),d=0;if(null!==a)for(;d<a.length;d++)c[d]=a[d];for(;d<b;d++)c[d]=new Ya;return c};function $a(){this.a=0}function ab(a,b){var c=Array(b),d=0;if(null!==a)for(;d<a.length;d++)c[d]=a[d];for(;d<b;d++)c[d]=new $a;return c};function Ta(){this.c=bb(null,32);this.d=null;this.a=0;this.e=32;this.i=!1;this.g=t;this.b=new cb(this.g)}function Ua(a){a.d=[];for(var b=0;b<a.a;b++)a.d[b]=b;a.d.sort(function(a,b){return function(e,f){return b(a[e],a[f])?1:-1}}(a.c,a.g));a.e=a.a;a.i=!0;db(a.b)}
function La(a,b){if(a.i){var c=a.b,d=++c.b;2*d>c.e&&(c.e*=2,c.c=ab(c.c,c.e+1),c.a=Za(c.a,c.e+1));var e;0===c.d?e=d:(e=c.d,c.d=c.a[e].b);c.c[d].a=e;c.a[e].b=d;c.a[e].a=b;c.i&&Ja(c,d);return e}c=a.a;++a.a>=a.e&&(a.e*=2,a.c=bb(a.c,a.e));a.c[c]=b;return-(c+1)}function bb(a,b){var c=Array(b),d=0;if(null!==a)for(;d<a.length;d++)c[d]=a[d];for(;d<b;d++)c[d]=null;return c}
function Va(a){if(0===a.a)return eb(a.b);var b=a.c[a.d[a.a-1]];if(0!==a.b.b&&a.g(Wa(a.b),b))return eb(a.b);do--a.a;while(0<a.a&&null===a.c[a.d[a.a-1]]);return b};function cb(a){this.c=ab(null,33);this.a=Za(null,33);this.b=0;this.e=32;this.d=0;this.i=!1;this.g=a;this.c[1].a=1}function db(a){for(var b=a.b;1<=b;--b)Ia(a,b);a.i=!0}function Wa(a){return a.a[a.c[1].a].a}function eb(a){var b=a.c,c=a.a,d=b[1].a,e=c[d].a;0<a.b&&(b[1].a=b[a.b].a,c[b[1].a].b=1,c[d].a=null,c[d].b=a.d,a.d=d,0<--a.b&&Ia(a,1));return e}
function Ia(a,b){for(var c=a.c,d=a.a,e=c[b].a;;){var f=b<<1;f<a.b&&a.g(d[c[f+1].a].a,d[c[f].a].a)&&++f;var g=c[f].a;if(f>a.b||a.g(d[e].a,d[g].a)){c[b].a=e;d[e].b=b;break}c[b].a=g;d[g].b=b;b=f}}function Ja(a,b){for(var c=a.c,d=a.a,e=c[b].a;;){var f=b>>1,g=c[f].a;if(0===f||a.g(d[g].a,d[e].a)){c[b].a=e;d[e].b=b;break}c[b].a=g;d[g].b=b;b=f}};function pa(a,b,c){this.a=a;this.b=b;this.c=c};function Aa(){this.d=this.h=null;this.e=0;this.b=this.a=this.g=this.c=!1}function U(a){return a.d.c.b}function T(a){return a.d.a.b};this.libtess={GluTesselator:Z,windingRule:{GLU_TESS_WINDING_ODD:100130,GLU_TESS_WINDING_NONZERO:100131,GLU_TESS_WINDING_POSITIVE:100132,GLU_TESS_WINDING_NEGATIVE:100133,GLU_TESS_WINDING_ABS_GEQ_TWO:100134},primitiveType:{GL_LINE_LOOP:2,GL_TRIANGLES:4,GL_TRIANGLE_STRIP:5,GL_TRIANGLE_FAN:6},errorType:{GLU_TESS_MISSING_BEGIN_POLYGON:100151,GLU_TESS_MISSING_END_POLYGON:100153,GLU_TESS_MISSING_BEGIN_CONTOUR:100152,GLU_TESS_MISSING_END_CONTOUR:100154,GLU_TESS_COORD_TOO_LARGE:100155,GLU_TESS_NEED_COMBINE_CALLBACK:100156},
gluEnum:{GLU_TESS_MESH:100112,GLU_TESS_TOLERANCE:100142,GLU_TESS_WINDING_RULE:100140,GLU_TESS_BOUNDARY_ONLY:100141,GLU_INVALID_ENUM:100900,GLU_INVALID_VALUE:100901,GLU_TESS_BEGIN:100100,GLU_TESS_VERTEX:100101,GLU_TESS_END:100102,GLU_TESS_ERROR:100103,GLU_TESS_EDGE_FLAG:100104,GLU_TESS_COMBINE:100105,GLU_TESS_BEGIN_DATA:100106,GLU_TESS_VERTEX_DATA:100107,GLU_TESS_END_DATA:100108,GLU_TESS_ERROR_DATA:100109,GLU_TESS_EDGE_FLAG_DATA:100110,GLU_TESS_COMBINE_DATA:100111}};Z.prototype.gluDeleteTess=Z.prototype.M;
Z.prototype.gluTessProperty=Z.prototype.R;Z.prototype.gluGetTessProperty=Z.prototype.N;Z.prototype.gluTessNormal=Z.prototype.Q;Z.prototype.gluTessCallback=Z.prototype.O;Z.prototype.gluTessVertex=Z.prototype.S;Z.prototype.gluTessBeginPolygon=Z.prototype.J;Z.prototype.gluTessBeginContour=Z.prototype.I;Z.prototype.gluTessEndContour=Z.prototype.K;Z.prototype.gluTessEndPolygon=Z.prototype.P; if (typeof module !== 'undefined') { module.exports = this.libtess; }

},{}],37:[function(require,module,exports){
/*
* loglevel - https://github.com/pimterry/loglevel
*
* Copyright (c) 2013 Tim Perry
* Licensed under the MIT license.
*/
(function (root, definition) {
    if (typeof module === 'object' && module.exports && typeof require === 'function') {
        module.exports = definition();
    } else if (typeof define === 'function' && typeof define.amd === 'object') {
        define(definition);
    } else {
        root.log = definition();
    }
}(this, function () {
    var self = {};
    var noop = function() {};
    var undefinedType = "undefined";

    function realMethod(methodName) {
        if (typeof console === undefinedType) {
            return false; // We can't build a real method without a console to log to
        } else if (console[methodName] !== undefined) {
            return bindMethod(console, methodName);
        } else if (console.log !== undefined) {
            return bindMethod(console, 'log');
        } else {
            return noop;
        }
    }

    function bindMethod(obj, methodName) {
        var method = obj[methodName];
        if (typeof method.bind === 'function') {
            return method.bind(obj);
        } else {
            try {
                return Function.prototype.bind.call(method, obj);
            } catch (e) {
                // Missing bind shim or IE8 + Modernizr, fallback to wrapping
                return function() {
                    return Function.prototype.apply.apply(method, [obj, arguments]);
                };
            }
        }
    }

    function enableLoggingWhenConsoleArrives(methodName, level) {
        return function () {
            if (typeof console !== undefinedType) {
                replaceLoggingMethods(level);
                self[methodName].apply(self, arguments);
            }
        };
    }

    var logMethods = [
        "trace",
        "debug",
        "info",
        "warn",
        "error"
    ];

    function replaceLoggingMethods(level) {
        for (var i = 0; i < logMethods.length; i++) {
            var methodName = logMethods[i];
            self[methodName] = (i < level) ? noop : self.methodFactory(methodName, level);
        }
    }

    function persistLevelIfPossible(levelNum) {
        var levelName = (logMethods[levelNum] || 'silent').toUpperCase();

        // Use localStorage if available
        try {
            window.localStorage['loglevel'] = levelName;
            return;
        } catch (ignore) {}

        // Use session cookie as fallback
        try {
            window.document.cookie = "loglevel=" + levelName + ";";
        } catch (ignore) {}
    }

    function loadPersistedLevel() {
        var storedLevel;

        try {
            storedLevel = window.localStorage['loglevel'];
        } catch (ignore) {}

        if (typeof storedLevel === undefinedType) {
            try {
                storedLevel = /loglevel=([^;]+)/.exec(window.document.cookie)[1];
            } catch (ignore) {}
        }
        
        if (self.levels[storedLevel] === undefined) {
            storedLevel = "WARN";
        }

        self.setLevel(self.levels[storedLevel]);
    }

    /*
     *
     * Public API
     *
     */

    self.levels = { "TRACE": 0, "DEBUG": 1, "INFO": 2, "WARN": 3,
        "ERROR": 4, "SILENT": 5};

    self.methodFactory = function (methodName, level) {
        return realMethod(methodName) ||
               enableLoggingWhenConsoleArrives(methodName, level);
    };

    self.setLevel = function (level) {
        if (typeof level === "string" && self.levels[level.toUpperCase()] !== undefined) {
            level = self.levels[level.toUpperCase()];
        }
        if (typeof level === "number" && level >= 0 && level <= self.levels.SILENT) {
            persistLevelIfPossible(level);
            replaceLoggingMethods(level);
            if (typeof console === undefinedType && level < self.levels.SILENT) {
                return "No console available for logging";
            }
        } else {
            throw "log.setLevel() called with invalid level: " + level;
        }
    };

    self.enableAll = function() {
        self.setLevel(self.levels.TRACE);
    };

    self.disableAll = function() {
        self.setLevel(self.levels.SILENT);
    };

    // Grab the current global log variable in case of overwrite
    var _log = (typeof window !== undefinedType) ? window.log : undefined;
    self.noConflict = function() {
        if (typeof window !== undefinedType &&
               window.log === self) {
            window.log = _log;
        }

        return self;
    };

    loadPersistedLevel();
    return self;
}));

},{}],38:[function(require,module,exports){
'use strict';

var ieee754 = require('ieee754');

module.exports = Protobuf;
function Protobuf(buf) {
    this.buf = buf;
    this.length = buf.length;
    this.pos = 0;
}

Protobuf.prototype.destroy = function() {
    this.buf = null;
};

Protobuf.prototype.readUInt32 = function() {
    var val = this.readUInt32LE(this.pos);
    this.pos += 4;
    return val;
};

Protobuf.prototype.readUInt64 = function() {
    var val = this.readUInt64LE(this.pos);
    this.pos += 8;
    return val;
};

Protobuf.prototype.readDouble = function() {
    var val = ieee754.read(this.buf, this.pos, false, 52, 8);
    this.pos += 8;
    return val;
};

Protobuf.prototype.readVarint = function() {
    // TODO: bounds checking
    var pos = this.pos;
    if (this.buf[pos] <= 0x7f) {
        this.pos++;
        return this.buf[pos];
    } else if (this.buf[pos + 1] <= 0x7f) {
        this.pos += 2;
        return (this.buf[pos] & 0x7f) | (this.buf[pos + 1] << 7);
    } else if (this.buf[pos + 2] <= 0x7f) {
        this.pos += 3;
        return (this.buf[pos] & 0x7f) | (this.buf[pos + 1] & 0x7f) << 7 | (this.buf[pos + 2]) << 14;
    } else if (this.buf[pos + 3] <= 0x7f) {
        this.pos += 4;
        return (this.buf[pos] & 0x7f) | (this.buf[pos + 1] & 0x7f) << 7 | (this.buf[pos + 2] & 0x7f) << 14 | (this.buf[pos + 3]) << 21;
    } else if (this.buf[pos + 4] <= 0x7f) {
        this.pos += 5;
        return ((this.buf[pos] & 0x7f) | (this.buf[pos + 1] & 0x7f) << 7 | (this.buf[pos + 2] & 0x7f) << 14 | (this.buf[pos + 3]) << 21) + (this.buf[pos + 4] * 268435456);
    } else {
        this.skip(0);
        return 0;
        // throw new Error("TODO: Handle 6+ byte varints");
    }
};

Protobuf.prototype.readSVarint = function() {
    var num = this.readVarint();
    if (num > 2147483647) throw new Error('TODO: Handle numbers >= 2^30');
    // zigzag encoding
    return ((num >> 1) ^ -(num & 1));
};

Protobuf.prototype.readString = function() {
    var bytes = this.readVarint();
    // TODO: bounds checking
    var chr = String.fromCharCode;
    var b = this.buf;
    var p = this.pos;
    var end = this.pos + bytes;
    var str = '';
    while (p < end) {
        if (b[p] <= 0x7F) str += chr(b[p++]);
        else if (b[p] <= 0xBF) throw new Error('Invalid UTF-8 codepoint: ' + b[p]);
        else if (b[p] <= 0xDF) str += chr((b[p++] & 0x1F) << 6 | (b[p++] & 0x3F));
        else if (b[p] <= 0xEF) str += chr((b[p++] & 0x1F) << 12 | (b[p++] & 0x3F) << 6 | (b[p++] & 0x3F));
        else if (b[p] <= 0xF7) p += 4; // We can't handle these codepoints in JS, so skip.
        else if (b[p] <= 0xFB) p += 5;
        else if (b[p] <= 0xFD) p += 6;
        else throw new Error('Invalid UTF-8 codepoint: ' + b[p]);
    }
    this.pos += bytes;
    return str;
};

Protobuf.prototype.readBuffer = function() {
    var bytes = this.readVarint();
    var buffer = this.buf.subarray(this.pos, this.pos + bytes);
    this.pos += bytes;
    return buffer;
};

Protobuf.prototype.readPacked = function(type) {
    // TODO: bounds checking
    var bytes = this.readVarint();
    var end = this.pos + bytes;
    var array = [];
    while (this.pos < end) {
        array.push(this['read' + type]());
    }
    return array;
};

Protobuf.prototype.skip = function(val) {
    // TODO: bounds checking
    var type = val & 0x7;
    switch (type) {
        /* varint */ case 0: while (this.buf[this.pos++] > 0x7f); break;
        /* 64 bit */ case 1: this.pos += 8; break;
        /* length */ case 2: var bytes = this.readVarint(); this.pos += bytes; break;
        /* 32 bit */ case 5: this.pos += 4; break;
        default: throw new Error('Unimplemented type: ' + type);
    }
};


},{"ieee754":39}],39:[function(require,module,exports){
exports.read = function(buffer, offset, isLE, mLen, nBytes) {
  var e, m,
      eLen = nBytes * 8 - mLen - 1,
      eMax = (1 << eLen) - 1,
      eBias = eMax >> 1,
      nBits = -7,
      i = isLE ? (nBytes - 1) : 0,
      d = isLE ? -1 : 1,
      s = buffer[offset + i];

  i += d;

  e = s & ((1 << (-nBits)) - 1);
  s >>= (-nBits);
  nBits += eLen;
  for (; nBits > 0; e = e * 256 + buffer[offset + i], i += d, nBits -= 8);

  m = e & ((1 << (-nBits)) - 1);
  e >>= (-nBits);
  nBits += mLen;
  for (; nBits > 0; m = m * 256 + buffer[offset + i], i += d, nBits -= 8);

  if (e === 0) {
    e = 1 - eBias;
  } else if (e === eMax) {
    return m ? NaN : ((s ? -1 : 1) * Infinity);
  } else {
    m = m + Math.pow(2, mLen);
    e = e - eBias;
  }
  return (s ? -1 : 1) * m * Math.pow(2, e - mLen);
};

exports.write = function(buffer, value, offset, isLE, mLen, nBytes) {
  var e, m, c,
      eLen = nBytes * 8 - mLen - 1,
      eMax = (1 << eLen) - 1,
      eBias = eMax >> 1,
      rt = (mLen === 23 ? Math.pow(2, -24) - Math.pow(2, -77) : 0),
      i = isLE ? 0 : (nBytes - 1),
      d = isLE ? 1 : -1,
      s = value < 0 || (value === 0 && 1 / value < 0) ? 1 : 0;

  value = Math.abs(value);

  if (isNaN(value) || value === Infinity) {
    m = isNaN(value) ? 1 : 0;
    e = eMax;
  } else {
    e = Math.floor(Math.log(value) / Math.LN2);
    if (value * (c = Math.pow(2, -e)) < 1) {
      e--;
      c *= 2;
    }
    if (e + eBias >= 1) {
      value += rt / c;
    } else {
      value += rt * Math.pow(2, 1 - eBias);
    }
    if (value * c >= 2) {
      e++;
      c /= 2;
    }

    if (e + eBias >= eMax) {
      m = 0;
      e = eMax;
    } else if (e + eBias >= 1) {
      m = (value * c - 1) * Math.pow(2, mLen);
      e = e + eBias;
    } else {
      m = value * Math.pow(2, eBias - 1) * Math.pow(2, mLen);
      e = 0;
    }
  }

  for (; mLen >= 8; buffer[offset + i] = m & 0xff, i += d, m /= 256, mLen -= 8);

  e = (e << mLen) | m;
  eLen += mLen;
  for (; eLen > 0; buffer[offset + i] = e & 0xff, i += d, e /= 256, eLen -= 8);

  buffer[offset + i - d] |= s * 128;
};

},{}],40:[function(require,module,exports){
module.exports.VectorTile = require('./lib/vectortile.js');
module.exports.VectorTileFeature = require('./lib/vectortilefeature.js');
module.exports.VectorTileLayer = require('./lib/vectortilelayer.js');

},{"./lib/vectortile.js":41,"./lib/vectortilefeature.js":42,"./lib/vectortilelayer.js":43}],41:[function(require,module,exports){
'use strict';

var VectorTileLayer = require('./vectortilelayer');

module.exports = VectorTile;

function VectorTile(buffer, end) {

    this.layers = {};
    this._buffer = buffer;

    end = end || buffer.length;

    while (buffer.pos < end) {
        var val = buffer.readVarint(),
            tag = val >> 3;

        if (tag == 3) {
            var layer = this.readLayer();
            if (layer.length) this.layers[layer.name] = layer;
        } else {
            buffer.skip(val);
        }
    }
}

VectorTile.prototype.readLayer = function() {
    var buffer = this._buffer,
        bytes = buffer.readVarint(),
        end = buffer.pos + bytes,
        layer = new VectorTileLayer(buffer, end);

    buffer.pos = end;

    return layer;
};

// Returns a dictionary of layers as individual GeoJSON feature collections, keyed by layer name
VectorTile.prototype.toGeoJSON = function () {
    var json = {};
    var layerNames = Object.keys(this.layers);

    for (var n=0; n < layerNames.length; n++) {
        json[layerNames[n]] = this.layers[layerNames[n]].toGeoJSON();
    }

    return json;
};

},{"./vectortilelayer":43}],42:[function(require,module,exports){
'use strict';

var Point = require('point-geometry');

module.exports = VectorTileFeature;

function VectorTileFeature(buffer, end, extent, keys, values) {

    this.properties = {};

    // Public
    this.extent = extent;
    this.type = 0;

    // Private
    this._buffer = buffer;
    this._geometry = -1;
    this._keys = keys;

    end = end || buffer.length;

    while (buffer.pos < end) {
        var val = buffer.readVarint(),
            tag = val >> 3;

        if (tag == 1) {
            this._id = buffer.readVarint();

        } else if (tag == 2) {
            var tagEnd = buffer.pos + buffer.readVarint();

            while (buffer.pos < tagEnd) {
                var key = keys[buffer.readVarint()];
                var value = values[buffer.readVarint()];
                this.properties[key] = value;
            }

        } else if (tag == 3) {
            this.type = buffer.readVarint();

        } else if (tag == 4) {
            this._geometry = buffer.pos;
            buffer.skip(val);

        } else {
            buffer.skip(val);
        }
    }
}

VectorTileFeature.types = ['Unknown', 'Point', 'LineString', 'Polygon'];

VectorTileFeature.prototype.loadGeometry = function() {
    var buffer = this._buffer;
    buffer.pos = this._geometry;

    var bytes = buffer.readVarint(),
        end = buffer.pos + bytes,
        cmd = 1,
        length = 0,
        x = 0,
        y = 0,
        lines = [],
        line;

    while (buffer.pos < end) {
        if (!length) {
            var cmd_length = buffer.readVarint();
            cmd = cmd_length & 0x7;
            length = cmd_length >> 3;
        }

        length--;

        if (cmd === 1 || cmd === 2) {
            x += buffer.readSVarint();
            y += buffer.readSVarint();

            if (cmd === 1) {
                // moveTo
                if (line) {
                    lines.push(line);
                }
                line = [];
            }

            line.push(new Point(x, y));
        } else if (cmd === 7) {
            // closePolygon
            line.push(line[0].clone());
        } else {
            throw new Error('unknown command ' + cmd);
        }
    }

    if (line) lines.push(line);

    return lines;
};

VectorTileFeature.prototype.bbox = function() {
    var buffer = this._buffer;
    buffer.pos = this._geometry;

    var bytes = buffer.readVarint(),
        end = buffer.pos + bytes,

        cmd = 1,
        length = 0,
        x = 0,
        y = 0,
        x1 = Infinity,
        x2 = -Infinity,
        y1 = Infinity,
        y2 = -Infinity;

    while (buffer.pos < end) {
        if (!length) {
            var cmd_length = buffer.readVarint();
            cmd = cmd_length & 0x7;
            length = cmd_length >> 3;
        }

        length--;

        if (cmd === 1 || cmd === 2) {
            x += buffer.readSVarint();
            y += buffer.readSVarint();
            if (x < x1) x1 = x;
            if (x > x2) x2 = x;
            if (y < y1) y1 = y;
            if (y > y2) y2 = y;

        } else if (cmd !== 7) {
            throw new Error('unknown command ' + cmd);
        }
    }

    return [x1, y1, x2, y2];
};

VectorTileFeature.prototype.toGeoJSON = function () {
    var geojson = {
        type: 'Feature',
        geometry: {},
        properties: {}
    };

    for (var k=0; k < this._keys.length; k++) {
        var key = this._keys[k];
        geojson.properties[key] = this.properties[key];
    }

    geojson.geometry.coordinates = this.loadGeometry();
    for (var r=0; r < geojson.geometry.coordinates.length; r++) {
        var ring = geojson.geometry.coordinates[r];
        for (var c=0; c < ring.length; c++) {
            ring[c] = [
                ring[c].x,
                ring[c].y
            ];
        }
    }

    if (VectorTileFeature.types[this.type] == 'Point') {
        geojson.geometry.type = 'Point';
    }
    else if (VectorTileFeature.types[this.type] == 'LineString') {
        if (geojson.geometry.coordinates.length == 1) {
            geojson.geometry.coordinates = geojson.geometry.coordinates[0];
            geojson.geometry.type = 'LineString';
        }
        else {
            geojson.geometry.type = 'MultiLineString';
        }
    }
    else if (VectorTileFeature.types[this.type] == 'Polygon') {
        geojson.geometry.type = 'Polygon';
    }

    return geojson;
};

},{"point-geometry":44}],43:[function(require,module,exports){
'use strict';

var VectorTileFeature = require('./vectortilefeature.js');

module.exports = VectorTileLayer;
function VectorTileLayer(buffer, end) {
    // Public
    this.version = 1;
    this.name = null;
    this.extent = 4096;
    this.length = 0;

    // Private
    this._buffer = buffer;
    this._keys = [];
    this._values = [];
    this._features = [];

    var val, tag;

    end = end || buffer.length;

    while (buffer.pos < end) {
        val = buffer.readVarint();
        tag = val >> 3;

        if (tag === 15) {
            this.version = buffer.readVarint();
        } else if (tag === 1) {
            this.name = buffer.readString();
        } else if (tag === 5) {
            this.extent = buffer.readVarint();
        } else if (tag === 2) {
            this.length++;
            this._features.push(buffer.pos);
            buffer.skip(val);

        } else if (tag === 3) {
            this._keys.push(buffer.readString());
        } else if (tag === 4) {
            this._values.push(this.readFeatureValue());
        } else {
            buffer.skip(val);
        }
    }
}

VectorTileLayer.prototype.readFeatureValue = function() {
    var buffer = this._buffer,
        value = null,
        bytes = buffer.readVarint(),
        end = buffer.pos + bytes,
        val, tag;

    while (buffer.pos < end) {
        val = buffer.readVarint();
        tag = val >> 3;

        if (tag == 1) {
            value = buffer.readString();
        } else if (tag == 2) {
            throw new Error('read float');
        } else if (tag == 3) {
            value = buffer.readDouble();
        } else if (tag == 4) {
            value = buffer.readVarint();
        } else if (tag == 5) {
            throw new Error('read uint');
        } else if (tag == 6) {
            value = buffer.readSVarint();
        } else if (tag == 7) {
            value = Boolean(buffer.readVarint());
        } else {
            buffer.skip(val);
        }
    }

    return value;
};

// return feature `i` from this layer as a `VectorTileFeature`
VectorTileLayer.prototype.feature = function(i) {
    if (i < 0 || i >= this._features.length) throw new Error('feature index out of bounds');

    this._buffer.pos = this._features[i];
    var end = this._buffer.readVarint() + this._buffer.pos;

    return new VectorTileFeature(this._buffer, end, this.extent, this._keys, this._values);
};

VectorTileLayer.prototype.toGeoJSON = function () {
    var geojson = {
        type: 'FeatureCollection',
        features: []
    };

    for (var f=0; f < this.length; f++) {
        geojson.features.push(this.feature(f).toGeoJSON());
    }

    return geojson;
};

},{"./vectortilefeature.js":42}],44:[function(require,module,exports){
'use strict';

module.exports = Point;

function Point(x, y) {
    this.x = x;
    this.y = y;
}

Point.prototype = {
    clone: function() { return new Point(this.x, this.y); },

    add:     function(p) { return this.clone()._add(p);     },
    sub:     function(p) { return this.clone()._sub(p);     },
    mult:    function(k) { return this.clone()._mult(k);    },
    div:     function(k) { return this.clone()._div(k);     },
    rotate:  function(a) { return this.clone()._rotate(a);  },
    matMult: function(m) { return this.clone()._matMult(m); },
    unit:    function() { return this.clone()._unit(); },
    perp:    function() { return this.clone()._perp(); },
    round:   function() { return this.clone()._round(); },

    mag: function() {
        return Math.sqrt(this.x * this.x + this.y * this.y);
    },

    equals: function(p) {
        return this.x === p.x &&
               this.y === p.y;
    },

    dist: function(p) {
        return Math.sqrt(this.distSqr(p));
    },

    distSqr: function(p) {
        var dx = p.x - this.x,
            dy = p.y - this.y;
        return dx * dx + dy * dy;
    },

    angle: function() {
        return Math.atan2(this.y, this.x);
    },

    angleTo: function(b) {
        return Math.atan2(this.y - b.y, this.x - b.x);
    },

    angleWith: function(b) {
        return this.angleWithSep(b.x, b.y);
    },

    // Find the angle of the two vectors, solving the formula for the cross product a x b = |a||b|sin(θ) for θ.
    angleWithSep: function(x, y) {
        return Math.atan2(
            this.x * y - this.y * x,
            this.x * x + this.y * y);
    },

    _matMult: function(m) {
        var x = m[0] * this.x + m[1] * this.y,
            y = m[2] * this.x + m[3] * this.y;
        this.x = x;
        this.y = y;
        return this;
    },

    _add: function(p) {
        this.x += p.x;
        this.y += p.y;
        return this;
    },

    _sub: function(p) {
        this.x -= p.x;
        this.y -= p.y;
        return this;
    },

    _mult: function(k) {
        this.x *= k;
        this.y *= k;
        return this;
    },

    _div: function(k) {
        this.x /= k;
        this.y /= k;
        return this;
    },

    _unit: function() {
        this._div(this.mag());
        return this;
    },

    _perp: function() {
        var y = this.y;
        this.y = this.x;
        this.x = -y;
        return this;
    },

    _rotate: function(angle) {
        var cos = Math.cos(angle),
            sin = Math.sin(angle),
            x = cos * this.x - sin * this.y,
            y = sin * this.x + cos * this.y;
        this.x = x;
        this.y = y;
        return this;
    },

    _round: function() {
        this.x = Math.round(this.x);
        this.y = Math.round(this.y);
        return this;
    }
};

// constructs Point from an array if necessary
Point.convert = function (a) {
    if (a instanceof Point) {
        return a;
    }
    if (Array.isArray(a)) {
        return new Point(a[0], a[1]);
    }
    return a;
};

},{}],45:[function(require,module,exports){
"use strict";
Object.defineProperties(exports, {
  default: {get: function() {
      return $__default;
    }},
  __esModule: {value: true}
});
var $__geo__,
    $__gl_47_gl_95_program__,
    $__gl_45_matrix__;
var Geo = ($__geo__ = require("./geo"), $__geo__ && $__geo__.__esModule && $__geo__ || {default: $__geo__}).Geo;
var GLProgram = ($__gl_47_gl_95_program__ = require("./gl/gl_program"), $__gl_47_gl_95_program__ && $__gl_47_gl_95_program__.__esModule && $__gl_47_gl_95_program__ || {default: $__gl_47_gl_95_program__}).default;
var glMatrix = ($__gl_45_matrix__ = require("gl-matrix"), $__gl_45_matrix__ && $__gl_45_matrix__.__esModule && $__gl_45_matrix__ || {default: $__gl_45_matrix__}).default;
var mat4 = glMatrix.mat4;
var vec3 = glMatrix.vec3;
var Camera = function Camera(scene) {
  this.scene = scene;
};
($traceurRuntime.createClass)(Camera, {
  update: function() {},
  setupProgram: function(gl_program) {}
}, {create: function(scene, config) {
    switch (config.type) {
      case 'isometric':
        return new IsometricCamera(scene, config);
      case 'perspective':
        return new PerspectiveCamera(scene, config);
      case 'flat':
      default:
        return new FlatCamera(scene, config);
    }
  }});
var $__default = Camera;
var PerspectiveCamera = function PerspectiveCamera(scene) {
  var options = arguments[1] !== (void 0) ? arguments[1] : {};
  $traceurRuntime.superCall(this, $PerspectiveCamera.prototype, "constructor", [scene]);
  this.type = 'perspective';
  this.focal_length = options.focal_length || [[16, 2], [17, 2.5], [18, 3], [19, 4], [20, 6]];
  this.vanishing_point = options.vanishing_point || {
    x: 0,
    y: 0
  };
  if (this.vanishing_point.length === 2) {
    this.vanishing_point = {
      x: this.vanishing_point[0],
      y: this.vanishing_point[1]
    };
  }
  this.height = null;
  this.computed_focal_length = null;
  this.perspective_mat = mat4.create();
  GLProgram.removeTransform('camera');
  GLProgram.addTransform('camera', "\n            uniform mat4 u_perspective;\n\n            void cameraProjection (inout vec4 position) {\n                position = u_perspective * position;\n            }");
};
var $PerspectiveCamera = PerspectiveCamera;
($traceurRuntime.createClass)(PerspectiveCamera, {
  update: function() {
    var meter_zoom_y = this.scene.css_size.height * Geo.metersPerPixel(this.scene.zoom);
    if (!(typeof this.focal_length === 'object' && this.focal_length.length >= 0)) {
      this.computed_focal_length = this.focal_length;
    } else {
      if (this.scene.zoom <= this.focal_length[0][0]) {
        this.computed_focal_length = this.focal_length[0][1];
      } else if (this.scene.zoom >= this.focal_length[this.focal_length.length - 1][0]) {
        this.computed_focal_length = this.focal_length[this.focal_length.length - 1][1];
      } else {
        for (var i = 0; i < this.focal_length.length - 1; i++) {
          if (this.scene.zoom >= this.focal_length[i][0] && this.scene.zoom < this.focal_length[i + 1][0]) {
            var focal_diff = this.focal_length[i + 1][1] - this.focal_length[i][1];
            var min_zoom = this.focal_length[i][0];
            var max_zoom = this.focal_length[i + 1][0];
            this.computed_focal_length = focal_diff * (this.scene.zoom - min_zoom) / (max_zoom - min_zoom) + this.focal_length[i][1];
            break;
          }
        }
      }
    }
    this.height = meter_zoom_y / 2 * this.computed_focal_length;
    var fov = Math.atan(1 / this.computed_focal_length) * 2;
    var aspect = this.scene.view_aspect;
    var znear = 1;
    var zfar = (this.height + znear) * 5;
    mat4.perspective(this.perspective_mat, fov, aspect, znear, zfar);
    this.perspective_mat[8] = -this.vanishing_point.x;
    this.perspective_mat[9] = -this.vanishing_point.y;
    mat4.translate(this.perspective_mat, this.perspective_mat, vec3.fromValues(meter_zoom_y / 2 * aspect * -this.vanishing_point.x, meter_zoom_y / 2 * -this.vanishing_point.y, -this.height));
  },
  setupProgram: function(gl_program) {
    gl_program.uniform('Matrix4fv', 'u_perspective', false, this.perspective_mat);
  }
}, {}, Camera);
var IsometricCamera = function IsometricCamera(scene) {
  var options = arguments[1] !== (void 0) ? arguments[1] : {};
  $traceurRuntime.superCall(this, $IsometricCamera.prototype, "constructor", [scene]);
  this.type = 'isometric';
  this.axis = options.axis || {
    x: 0,
    y: 1
  };
  if (this.axis.length === 2) {
    this.axis = {
      x: this.axis[0],
      y: this.axis[1]
    };
  }
  this.meter_view_mat = mat4.create();
  GLProgram.removeTransform('camera');
  GLProgram.addTransform('camera', "\n            uniform mat4 u_meter_view;\n            uniform vec2 u_isometric_axis;\n\n            void cameraProjection (inout vec4 position) {\n                position = u_meter_view * position;\n                position.xy += position.z * u_isometric_axis;\n\n                // Reverse z for depth buffer so up is negative,\n                // and scale down values so objects higher than one screen height will not get clipped\n                position.z = -position.z / 100. + 1. - 0.001; // pull forward slightly to avoid going past far clipping plane\n            }");
};
var $IsometricCamera = IsometricCamera;
($traceurRuntime.createClass)(IsometricCamera, {
  update: function() {
    mat4.identity(this.meter_view_mat);
    mat4.scale(this.meter_view_mat, this.meter_view_mat, vec3.fromValues(1 / this.scene.meter_zoom.x, 1 / this.scene.meter_zoom.y, 1 / this.scene.meter_zoom.y));
  },
  setupProgram: function(gl_program) {
    gl_program.uniform('2f', 'u_isometric_axis', this.axis.x / this.scene.view_aspect, this.axis.y);
    gl_program.uniform('Matrix4fv', 'u_meter_view', false, this.meter_view_mat);
  }
}, {}, Camera);
var FlatCamera = function FlatCamera(scene) {
  var options = arguments[1] !== (void 0) ? arguments[1] : {};
  $traceurRuntime.superCall(this, $FlatCamera.prototype, "constructor", [scene, options]);
  this.type = 'flat';
};
var $FlatCamera = FlatCamera;
($traceurRuntime.createClass)(FlatCamera, {update: function() {
    this.axis.x = 0;
    this.axis.y = 0;
    $traceurRuntime.superCall(this, $FlatCamera.prototype, "update", []);
  }}, {}, IsometricCamera);


},{"./geo":47,"./gl/gl_program":53,"gl-matrix":4}],46:[function(require,module,exports){
"use strict";
Object.defineProperties(exports, {
  MethodNotImplemented: {get: function() {
      return MethodNotImplemented;
    }},
  __esModule: {value: true}
});
var MethodNotImplemented = function MethodNotImplemented(methodName) {
  this.name = 'MethodNotImplemented';
  this.message = 'Method ' + methodName + ' must be implemented in subclass';
};
($traceurRuntime.createClass)(MethodNotImplemented, {}, {}, Error);


},{}],47:[function(require,module,exports){
"use strict";
Object.defineProperties(exports, {
  Geo: {get: function() {
      return Geo;
    }},
  __esModule: {value: true}
});
var Geo = {};
Geo.tile_size = 256;
Geo.half_circumference_meters = 20037508.342789244;
Geo.min_zoom_meters_per_pixel = Geo.half_circumference_meters * 2 / Geo.tile_size;
Geo.meters_per_pixel = [];
Geo.max_zoom = 20;
for (var z = 0; z <= Geo.max_zoom; z++) {
  Geo.meters_per_pixel[z] = Geo.min_zoom_meters_per_pixel / Math.pow(2, z);
}
Geo.metersPerPixel = function(zoom) {
  return Geo.min_zoom_meters_per_pixel / Math.pow(2, zoom);
};
Geo.units_per_meter = [];
Geo.setTileScale = function(scale) {
  Geo.tile_scale = scale;
  Geo.units_per_pixel = Geo.tile_scale / Geo.tile_size;
  for (var z = 0; z <= Geo.max_zoom; z++) {
    Geo.units_per_meter[z] = Geo.tile_scale / (Geo.tile_size * Geo.meters_per_pixel[z]);
  }
};
Geo.metersForTile = function(tile) {
  return {
    x: tile.x * Geo.half_circumference_meters * 2 / Math.pow(2, tile.z) - Geo.half_circumference_meters,
    y: -(tile.y * Geo.half_circumference_meters * 2 / Math.pow(2, tile.z) - Geo.half_circumference_meters)
  };
};
Geo.metersToLatLng = function($__0) {
  var $__1 = $__0,
      x = $__1[0],
      y = $__1[1];
  x /= Geo.half_circumference_meters;
  y /= Geo.half_circumference_meters;
  y = (2 * Math.atan(Math.exp(y * Math.PI)) - (Math.PI / 2)) / Math.PI;
  x *= 180;
  y *= 180;
  return [x, y];
};
Geo.latLngToMeters = function($__0) {
  var $__1 = $__0,
      x = $__1[0],
      y = $__1[1];
  y = Math.log(Math.tan(y * Math.PI / 360 + Math.PI / 4)) / Math.PI;
  y *= Geo.half_circumference_meters;
  x *= Geo.half_circumference_meters / 180;
  return [x, y];
};
Geo.transformGeometry = function(geometry, transform) {
  if (geometry.type === 'Point') {
    return transform(geometry.coordinates);
  } else if (geometry.type === 'LineString' || geometry.type === 'MultiPoint') {
    return geometry.coordinates.map(transform);
  } else if (geometry.type === 'Polygon' || geometry.type === 'MultiLineString') {
    return geometry.coordinates.map(function(coordinates) {
      return coordinates.map(transform);
    });
  } else if (geometry.type === 'MultiPolygon') {
    return geometry.coordinates.map(function(polygon) {
      return polygon.map(function(coordinates) {
        return coordinates.map(transform);
      });
    });
  }
  return {};
};
Geo.boxIntersect = function(b1, b2) {
  return !(b2.sw.x > b1.ne.x || b2.ne.x < b1.sw.x || b2.sw.y > b1.ne.y || b2.ne.y < b1.sw.y);
};
Geo.findBoundingBox = function(polygon) {
  var min_x = Infinity,
      max_x = -Infinity,
      min_y = Infinity,
      max_y = -Infinity;
  var num_coords = polygon[0].length;
  for (var c = 0; c < num_coords; c++) {
    var coord = polygon[0][c];
    if (coord[0] < min_x) {
      min_x = coord[0];
    }
    if (coord[1] < min_y) {
      min_y = coord[1];
    }
    if (coord[0] > max_x) {
      max_x = coord[0];
    }
    if (coord[1] > max_y) {
      max_y = coord[1];
    }
  }
  return [min_x, min_y, max_x, max_y];
};


},{}],48:[function(require,module,exports){
"use strict";
Object.defineProperties(exports, {
  GL: {get: function() {
      return GL;
    }},
  __esModule: {value: true}
});
var $__libtess__,
    $__loglevel__;
var libtess = ($__libtess__ = require("libtess"), $__libtess__ && $__libtess__.__esModule && $__libtess__ || {default: $__libtess__}).default;
var log = ($__loglevel__ = require("loglevel"), $__loglevel__ && $__loglevel__.__esModule && $__loglevel__ || {default: $__loglevel__}).default;
var GL = {};
GL.getContext = function getContext(canvas) {
  var fullscreen = false;
  if (canvas == null) {
    canvas = document.createElement('canvas');
    canvas.style.position = 'absolute';
    canvas.style.top = 0;
    canvas.style.left = 0;
    canvas.style.zIndex = -1;
    document.body.appendChild(canvas);
    fullscreen = true;
  }
  var gl = canvas.getContext('experimental-webgl');
  if (!gl) {
    alert("Couldn't create WebGL context. Your browser probably doesn't support WebGL or it's turned off?");
    throw "Couldn't create WebGL context";
  }
  GL.resizeCanvas(gl, window.innerWidth, window.innerHeight);
  if (fullscreen === true) {
    window.addEventListener('resize', function() {
      GL.resizeCanvas(gl, window.innerWidth, window.innerHeight);
    });
  }
  return gl;
};
GL.resizeCanvas = function(gl, width, height) {
  var device_pixel_ratio = window.devicePixelRatio || 1;
  gl.canvas.style.width = width + 'px';
  gl.canvas.style.height = height + 'px';
  gl.canvas.width = Math.round(gl.canvas.style.width * device_pixel_ratio);
  gl.canvas.height = Math.round(gl.canvas.style.width * device_pixel_ratio);
  gl.viewport(0, 0, gl.canvas.width, gl.canvas.height);
};
GL.updateProgram = function GLupdateProgram(gl, program, vertex_shader_source, fragment_shader_source) {
  try {
    var vertex_shader = GL.createShader(gl, vertex_shader_source, gl.VERTEX_SHADER);
    var fragment_shader = GL.createShader(gl, '#ifdef GL_ES\nprecision highp float;\n#endif\n\n' + fragment_shader_source, gl.FRAGMENT_SHADER);
  } catch (err) {
    log.error(err);
    throw err;
  }
  gl.useProgram(null);
  if (program != null) {
    var old_shaders = gl.getAttachedShaders(program);
    for (var i = 0; i < old_shaders.length; i++) {
      gl.detachShader(program, old_shaders[i]);
    }
  } else {
    program = gl.createProgram();
  }
  if (vertex_shader == null || fragment_shader == null) {
    return program;
  }
  gl.attachShader(program, vertex_shader);
  gl.attachShader(program, fragment_shader);
  gl.deleteShader(vertex_shader);
  gl.deleteShader(fragment_shader);
  gl.linkProgram(program);
  if (!gl.getProgramParameter(program, gl.LINK_STATUS)) {
    var program_error = new Error(("WebGL program error:\n            VALIDATE_STATUS: " + gl.getProgramParameter(program, gl.VALIDATE_STATUS) + "\n            ERROR: " + gl.getError() + "\n            --- Vertex Shader ---\n            " + vertex_shader_source + "\n            --- Fragment Shader ---\n            " + fragment_shader_source));
    log.error(program_error);
    throw program_error;
  }
  return program;
};
GL.createShader = function GLcreateShader(gl, source, type) {
  var shader = gl.createShader(type);
  gl.shaderSource(shader, source);
  gl.compileShader(shader);
  if (!gl.getShaderParameter(shader, gl.COMPILE_STATUS)) {
    var shader_error = "WebGL shader error:\n" + (type === gl.VERTEX_SHADER ? "VERTEX" : "FRAGMENT") + " SHADER:\n" + gl.getShaderInfoLog(shader);
    throw shader_error;
  }
  return shader;
};
GL.tesselator = (function initTesselator() {
  var tesselator = new libtess.GluTesselator();
  function vertexCallback(data, polyVertArray) {
    if (tesselator.z != null) {
      polyVertArray.push([data[0], data[1], tesselator.z]);
    } else {
      polyVertArray.push([data[0], data[1]]);
    }
  }
  function combineCallback(coords, data, weight) {
    return coords;
  }
  function edgeCallback(flag) {
    log.trace('GL.tesselator: edge flag: ' + flag);
  }
  tesselator.gluTessCallback(libtess.gluEnum.GLU_TESS_VERTEX_DATA, vertexCallback);
  tesselator.gluTessCallback(libtess.gluEnum.GLU_TESS_COMBINE, combineCallback);
  tesselator.gluTessCallback(libtess.gluEnum.GLU_TESS_EDGE_FLAG, edgeCallback);
  tesselator.gluTessNormal(0, 0, 1);
  return tesselator;
})();
GL.triangulatePolygon = function GLTriangulate(contours, z) {
  var triangleVerts = [];
  GL.tesselator.z = z;
  GL.tesselator.gluTessBeginPolygon(triangleVerts);
  for (var i = 0; i < contours.length; i++) {
    GL.tesselator.gluTessBeginContour();
    var contour = contours[i];
    for (var j = 0; j < contour.length; j++) {
      var coords = [contour[j][0], contour[j][1], 0];
      GL.tesselator.gluTessVertex(coords, coords);
    }
    GL.tesselator.gluTessEndContour();
  }
  GL.tesselator.gluTessEndPolygon();
  return triangleVerts;
};


},{"libtess":36,"loglevel":37}],49:[function(require,module,exports){
"use strict";
Object.defineProperties(exports, {
  GLBuilders: {get: function() {
      return GLBuilders;
    }},
  __esModule: {value: true}
});
var $___46__46__47_vector__,
    $___46__46__47_geo__,
    $__gl__;
var Vector = ($___46__46__47_vector__ = require("../vector"), $___46__46__47_vector__ && $___46__46__47_vector__.__esModule && $___46__46__47_vector__ || {default: $___46__46__47_vector__}).Vector;
var Geo = ($___46__46__47_geo__ = require("../geo"), $___46__46__47_geo__ && $___46__46__47_geo__.__esModule && $___46__46__47_geo__ || {default: $___46__46__47_geo__}).Geo;
var GL = ($__gl__ = require("./gl"), $__gl__ && $__gl__.__esModule && $__gl__ || {default: $__gl__}).GL;
var GLBuilders = {};
GLBuilders.debug = false;
GLBuilders.buildPolygons = function(polygons, vertex_data, vertex_template, $__3) {
  var $__4 = $__3,
      texcoord_index = $__4.texcoord_index,
      texcoord_scale = $__4.texcoord_scale;
  var $__5 = texcoord_scale || [[0, 0], [1, 1]],
      $__6 = $__5[0],
      min_u = $__6[0],
      min_v = $__6[1],
      $__7 = $__5[1],
      max_u = $__7[0],
      max_v = $__7[1];
  var num_polygons = polygons.length;
  for (var p = 0; p < num_polygons; p++) {
    var polygon = polygons[p];
    if (texcoord_index) {
      var $__8 = Geo.findBoundingBox(polygon),
          min_x = $__8[0],
          min_y = $__8[1],
          max_x = $__8[2],
          max_y = $__8[3];
      var span_x = max_x - min_x;
      var span_y = max_y - min_y;
      var scale_u = (max_u - min_u) / span_x;
      var scale_v = (max_v - min_v) / span_y;
    }
    var vertices = GL.triangulatePolygon(polygon);
    var num_vertices = vertices.length;
    for (var v = 0; v < num_vertices; v++) {
      var vertex = vertices[v];
      vertex_template[0] = vertex[0];
      vertex_template[1] = vertex[1];
      if (texcoord_index) {
        vertex_template[texcoord_index + 0] = (vertex[0] - min_x) * scale_u + min_u;
        vertex_template[texcoord_index + 1] = (vertex[1] - min_y) * scale_v + min_v;
      }
      vertex_data.addVertex(vertex_template);
    }
  }
};
GLBuilders.buildExtrudedPolygons = function(polygons, z, height, min_height, vertex_data, vertex_template, normal_index, $__3) {
  var $__4 = $__3,
      texcoord_index = $__4.texcoord_index,
      texcoord_scale = $__4.texcoord_scale;
  var min_z = z + (min_height || 0);
  var max_z = z + height;
  var $__5 = texcoord_scale || [[0, 0], [1, 1]],
      $__6 = $__5[0],
      min_u = $__6[0],
      min_v = $__6[1],
      $__7 = $__5[1],
      max_u = $__7[0],
      max_v = $__7[1];
  vertex_template[2] = max_z;
  GLBuilders.buildPolygons(polygons, vertex_data, vertex_template, {texcoord_index: texcoord_index});
  var num_polygons = polygons.length;
  for (var p = 0; p < num_polygons; p++) {
    var polygon = polygons[p];
    for (var q = 0; q < polygon.length; q++) {
      var contour = polygon[q];
      for (var w = 0; w < contour.length - 1; w++) {
        var wall_vertices = [[contour[w + 1][0], contour[w + 1][1], max_z], [contour[w + 1][0], contour[w + 1][1], min_z], [contour[w][0], contour[w][1], min_z], [contour[w][0], contour[w][1], min_z], [contour[w][0], contour[w][1], max_z], [contour[w + 1][0], contour[w + 1][1], max_z]];
        if (texcoord_index) {
          var texcoords = [[min_u, max_v], [min_u, min_v], [max_u, min_v], [max_u, min_v], [max_u, max_v], [min_u, max_v]];
        }
        var normal = Vector.cross([0, 0, 1], Vector.normalize([contour[w + 1][0] - contour[w][0], contour[w + 1][1] - contour[w][1], 0]));
        vertex_template[normal_index + 0] = normal[0];
        vertex_template[normal_index + 1] = normal[1];
        vertex_template[normal_index + 2] = normal[2];
        for (var wv = 0; wv < wall_vertices.length; wv++) {
          vertex_template[0] = wall_vertices[wv][0];
          vertex_template[1] = wall_vertices[wv][1];
          vertex_template[2] = wall_vertices[wv][2];
          if (texcoord_index) {
            vertex_template[texcoord_index + 0] = texcoords[wv][0];
            vertex_template[texcoord_index + 1] = texcoords[wv][1];
          }
          vertex_data.addVertex(vertex_template);
        }
      }
    }
  }
};
GLBuilders.buildPolylines = function(lines, z, width, vertex_data, vertex_template, $__3) {
  var $__4 = $__3,
      closed_polygon = $__4.closed_polygon,
      remove_tile_edges = $__4.remove_tile_edges,
      texcoord_index = $__4.texcoord_index,
      texcoord_scale = $__4.texcoord_scale;
  var vertices = [],
      texcoords = [],
      p,
      pa,
      pb,
      num_lines = lines.length;
  var $__5 = texcoord_scale || [[0, 0], [1, 1]],
      $__6 = $__5[0],
      min_u = $__6[0],
      min_v = $__6[1],
      $__7 = $__5[1],
      max_u = $__7[0],
      max_v = $__7[1];
  for (var ln = 0; ln < num_lines; ln++) {
    var line = lines[ln];
    if (line.length > 2) {
      var anchors = [];
      if (line.length > 3) {
        var mid = [];
        var pmax;
        if (closed_polygon === true) {
          p = 0;
          pmax = line.length - 1;
        } else {
          p = 1;
          pmax = line.length - 2;
          mid.push(line[0]);
        }
        for (; p < pmax; p++) {
          pa = line[p];
          pb = line[p + 1];
          mid.push([(pa[0] + pb[0]) / 2, (pa[1] + pb[1]) / 2]);
        }
        var mmax;
        if (closed_polygon === true) {
          mmax = mid.length;
        } else {
          mid.push(line[line.length - 1]);
          mmax = mid.length - 1;
        }
        for (p = 0; p < mmax; p++) {
          anchors.push([mid[p], line[(p + 1) % line.length], mid[(p + 1) % mid.length]]);
        }
      } else {
        anchors = [[line[0], line[1], line[2]]];
      }
      for (p = 0; p < anchors.length; p++) {
        if (!remove_tile_edges) {
          buildAnchor(anchors[p][0], anchors[p][1], anchors[p][2]);
        } else {
          var edge1 = GLBuilders.isOnTileEdge(anchors[p][0], anchors[p][1]);
          var edge2 = GLBuilders.isOnTileEdge(anchors[p][1], anchors[p][2]);
          if (!edge1 && !edge2) {
            buildAnchor(anchors[p][0], anchors[p][1], anchors[p][2]);
          } else if (!edge1) {
            buildSegment(anchors[p][0], anchors[p][1]);
          } else if (!edge2) {
            buildSegment(anchors[p][1], anchors[p][2]);
          }
        }
      }
    } else if (line.length === 2) {
      buildSegment(line[0], line[1]);
    }
  }
  for (var v = 0; v < vertices.length; v++) {
    vertex_template[0] = vertices[v][0];
    vertex_template[1] = vertices[v][1];
    if (texcoord_index) {
      vertex_template[texcoord_index + 0] = texcoords[v][0];
      vertex_template[texcoord_index + 1] = texcoords[v][1];
    }
    vertex_data.addVertex(vertex_template);
  }
  function buildSegment(pa, pb) {
    var slope = Vector.normalize([(pb[1] - pa[1]) * -1, pb[0] - pa[0]]);
    var pa_outer = [pa[0] + slope[0] * width / 2, pa[1] + slope[1] * width / 2];
    var pa_inner = [pa[0] - slope[0] * width / 2, pa[1] - slope[1] * width / 2];
    var pb_outer = [pb[0] + slope[0] * width / 2, pb[1] + slope[1] * width / 2];
    var pb_inner = [pb[0] - slope[0] * width / 2, pb[1] - slope[1] * width / 2];
    vertices.push(pb_inner, pb_outer, pa_inner, pa_inner, pb_outer, pa_outer);
    if (texcoord_index) {
      texcoords.push([min_u, min_v], [max_u, min_v], [min_u, max_v], [min_u, max_v], [max_u, min_v], [max_u, max_v]);
    }
  }
  function buildAnchor(pa, joint, pb) {
    var pa_slope = Vector.normalize([(joint[1] - pa[1]) * -1, joint[0] - pa[0]]);
    var pa_outer = [[pa[0] + pa_slope[0] * width / 2, pa[1] + pa_slope[1] * width / 2], [joint[0] + pa_slope[0] * width / 2, joint[1] + pa_slope[1] * width / 2]];
    var pa_inner = [[pa[0] - pa_slope[0] * width / 2, pa[1] - pa_slope[1] * width / 2], [joint[0] - pa_slope[0] * width / 2, joint[1] - pa_slope[1] * width / 2]];
    var pb_slope = Vector.normalize([(pb[1] - joint[1]) * -1, pb[0] - joint[0]]);
    var pb_outer = [[joint[0] + pb_slope[0] * width / 2, joint[1] + pb_slope[1] * width / 2], [pb[0] + pb_slope[0] * width / 2, pb[1] + pb_slope[1] * width / 2]];
    var pb_inner = [[joint[0] - pb_slope[0] * width / 2, joint[1] - pb_slope[1] * width / 2], [pb[0] - pb_slope[0] * width / 2, pb[1] - pb_slope[1] * width / 2]];
    var intersection = Vector.lineIntersection(pa_outer[0], pa_outer[1], pb_outer[0], pb_outer[1]);
    var line_debug = null;
    if (intersection != null) {
      var intersect_outer = intersection;
      var len_sq = Vector.lengthSq([intersect_outer[0] - joint[0], intersect_outer[1] - joint[1]]);
      var miter_len_max = 3;
      if (len_sq > (width * width * miter_len_max * miter_len_max)) {
        line_debug = 'distance';
        intersect_outer = Vector.normalize([intersect_outer[0] - joint[0], intersect_outer[1] - joint[1]]);
        intersect_outer = [joint[0] + intersect_outer[0] * miter_len_max, joint[1] + intersect_outer[1] * miter_len_max];
      }
      var intersect_inner = [(joint[0] - intersect_outer[0]) + joint[0], (joint[1] - intersect_outer[1]) + joint[1]];
      vertices.push(intersect_inner, intersect_outer, pa_inner[0], pa_inner[0], intersect_outer, pa_outer[0], pb_inner[1], pb_outer[1], intersect_inner, intersect_inner, pb_outer[1], intersect_outer);
    } else {
      line_debug = 'parallel';
      pa_inner[1] = pb_inner[0];
      pa_outer[1] = pb_outer[0];
      vertices.push(pa_inner[1], pa_outer[1], pa_inner[0], pa_inner[0], pa_outer[1], pa_outer[0], pb_inner[1], pb_outer[1], pb_inner[0], pb_inner[0], pb_outer[1], pb_outer[0]);
    }
    if (texcoord_index) {
      texcoords.push([min_u, min_v], [max_u, min_v], [min_u, max_v], [min_u, max_v], [max_u, min_v], [max_u, max_v], [min_u, min_v], [max_u, min_v], [min_u, max_v], [min_u, max_v], [max_u, min_v], [max_u, max_v]);
    }
  }
};
GLBuilders.buildQuadsForPoints = function(points, width, height, vertex_data, vertex_template, $__3) {
  var $__4 = $__3,
      texcoord_index = $__4.texcoord_index,
      texcoord_scale = $__4.texcoord_scale;
  var $__5 = texcoord_scale || [[0, 0], [1, 1]],
      $__6 = $__5[0],
      min_u = $__6[0],
      min_v = $__6[1],
      $__7 = $__5[1],
      max_u = $__7[0],
      max_v = $__7[1];
  var num_points = points.length;
  for (var p = 0; p < num_points; p++) {
    var point = points[p];
    var positions = [[point[0] - width / 2, point[1] - height / 2], [point[0] + width / 2, point[1] - height / 2], [point[0] + width / 2, point[1] + height / 2], [point[0] - width / 2, point[1] - height / 2], [point[0] + width / 2, point[1] + height / 2], [point[0] - width / 2, point[1] + height / 2]];
    if (texcoord_index) {
      var texcoords = [[min_u, min_v], [max_u, min_v], [max_u, max_v], [min_u, min_v], [max_u, max_v], [min_u, max_v]];
    }
    for (var pos = 0; pos < 6; pos++) {
      if (texcoord_index) {
        vertex_template[texcoord_index + 0] = texcoords[pos][0];
        vertex_template[texcoord_index + 1] = texcoords[pos][1];
      }
      vertex_template[0] = positions[pos][0];
      vertex_template[1] = positions[pos][1];
      vertex_data.addVertex(vertex_template);
    }
  }
};
GLBuilders.isOnTileEdge = function(pa, pb, options) {
  options = options || {};
  var tolerance_function = options.tolerance_function || GLBuilders.valuesWithinTolerance;
  var tolerance = options.tolerance || 1;
  var tile_min = GLBuilders.tile_bounds[0];
  var tile_max = GLBuilders.tile_bounds[1];
  var edge = null;
  if (tolerance_function(pa[0], tile_min.x, tolerance) && tolerance_function(pb[0], tile_min.x, tolerance)) {
    edge = 'left';
  } else if (tolerance_function(pa[0], tile_max.x, tolerance) && tolerance_function(pb[0], tile_max.x, tolerance)) {
    edge = 'right';
  } else if (tolerance_function(pa[1], tile_min.y, tolerance) && tolerance_function(pb[1], tile_min.y, tolerance)) {
    edge = 'top';
  } else if (tolerance_function(pa[1], tile_max.y, tolerance) && tolerance_function(pb[1], tile_max.y, tolerance)) {
    edge = 'bottom';
  }
  return edge;
};
GLBuilders.setTileScale = function(scale) {
  GLBuilders.tile_bounds = [{
    x: 0,
    y: 0
  }, {
    x: scale,
    y: -scale
  }];
};
GLBuilders.valuesWithinTolerance = function(a, b, tolerance) {
  tolerance = tolerance || 1;
  return (Math.abs(a - b) < tolerance);
};
GLBuilders.buildZigzagLineTestPattern = function() {
  var min = {
    x: 0,
    y: 0
  };
  var max = {
    x: 4096,
    y: 4096
  };
  var g = {
    id: 123,
    geometry: {
      type: 'LineString',
      coordinates: [[min.x * 0.75 + max.x * 0.25, min.y * 0.75 + max.y * 0.25], [min.x * 0.75 + max.x * 0.25, min.y * 0.5 + max.y * 0.5], [min.x * 0.25 + max.x * 0.75, min.y * 0.75 + max.y * 0.25], [min.x * 0.25 + max.x * 0.75, min.y * 0.25 + max.y * 0.75], [min.x * 0.4 + max.x * 0.6, min.y * 0.5 + max.y * 0.5], [min.x * 0.5 + max.x * 0.5, min.y * 0.25 + max.y * 0.75], [min.x * 0.75 + max.x * 0.25, min.y * 0.25 + max.y * 0.75], [min.x * 0.75 + max.x * 0.25, min.y * 0.4 + max.y * 0.6]]
    },
    properties: {kind: 'debug'}
  };
  return g;
};


},{"../geo":47,"../vector":63,"./gl":48}],50:[function(require,module,exports){
"use strict";
Object.defineProperties(exports, {
  default: {get: function() {
      return $__default;
    }},
  __esModule: {value: true}
});
var gl;
var $__default = gl = {};
gl.DEPTH_BUFFER_BIT = 0x00000100;
gl.STENCIL_BUFFER_BIT = 0x00000400;
gl.COLOR_BUFFER_BIT = 0x00004000;
gl.POINTS = 0x0000;
gl.LINES = 0x0001;
gl.LINE_LOOP = 0x0002;
gl.LINE_STRIP = 0x0003;
gl.TRIANGLES = 0x0004;
gl.TRIANGLE_STRIP = 0x0005;
gl.TRIANGLE_FAN = 0x0006;
gl.ZERO = 0;
gl.ONE = 1;
gl.SRC_COLOR = 0x0300;
gl.ONE_MINUS_SRC_COLOR = 0x0301;
gl.SRC_ALPHA = 0x0302;
gl.ONE_MINUS_SRC_ALPHA = 0x0303;
gl.DST_ALPHA = 0x0304;
gl.ONE_MINUS_DST_ALPHA = 0x0305;
gl.DST_COLOR = 0x0306;
gl.ONE_MINUS_DST_COLOR = 0x0307;
gl.SRC_ALPHA_SATURATE = 0x0308;
gl.FUNC_ADD = 0x8006;
gl.BLEND_EQUATION = 0x8009;
gl.BLEND_EQUATION_RGB = 0x8009;
gl.BLEND_EQUATION_ALPHA = 0x883D;
gl.FUNC_SUBTRACT = 0x800A;
gl.FUNC_REVERSE_SUBTRACT = 0x800B;
gl.BLEND_DST_RGB = 0x80C8;
gl.BLEND_SRC_RGB = 0x80C9;
gl.BLEND_DST_ALPHA = 0x80CA;
gl.BLEND_SRC_ALPHA = 0x80CB;
gl.CONSTANT_COLOR = 0x8001;
gl.ONE_MINUS_CONSTANT_COLOR = 0x8002;
gl.CONSTANT_ALPHA = 0x8003;
gl.ONE_MINUS_CONSTANT_ALPHA = 0x8004;
gl.BLEND_COLOR = 0x8005;
gl.ARRAY_BUFFER = 0x8892;
gl.ELEMENT_ARRAY_BUFFER = 0x8893;
gl.ARRAY_BUFFER_BINDING = 0x8894;
gl.ELEMENT_ARRAY_BUFFER_BINDING = 0x8895;
gl.STREAM_DRAW = 0x88E0;
gl.STATIC_DRAW = 0x88E4;
gl.DYNAMIC_DRAW = 0x88E8;
gl.BUFFER_SIZE = 0x8764;
gl.BUFFER_USAGE = 0x8765;
gl.CURRENT_VERTEX_ATTRIB = 0x8626;
gl.FRONT = 0x0404;
gl.BACK = 0x0405;
gl.FRONT_AND_BACK = 0x0408;
gl.CULL_FACE = 0x0B44;
gl.BLEND = 0x0BE2;
gl.DITHER = 0x0BD0;
gl.STENCIL_TEST = 0x0B90;
gl.DEPTH_TEST = 0x0B71;
gl.SCISSOR_TEST = 0x0C11;
gl.POLYGON_OFFSET_FILL = 0x8037;
gl.SAMPLE_ALPHA_TO_COVERAGE = 0x809E;
gl.SAMPLE_COVERAGE = 0x80A0;
gl.NO_ERROR = 0;
gl.INVALID_ENUM = 0x0500;
gl.INVALID_VALUE = 0x0501;
gl.INVALID_OPERATION = 0x0502;
gl.OUT_OF_MEMORY = 0x0505;
gl.CW = 0x0900;
gl.CCW = 0x0901;
gl.LINE_WIDTH = 0x0B21;
gl.ALIASED_POINT_SIZE_RANGE = 0x846D;
gl.ALIASED_LINE_WIDTH_RANGE = 0x846E;
gl.CULL_FACE_MODE = 0x0B45;
gl.FRONT_FACE = 0x0B46;
gl.DEPTH_RANGE = 0x0B70;
gl.DEPTH_WRITEMASK = 0x0B72;
gl.DEPTH_CLEAR_VALUE = 0x0B73;
gl.DEPTH_FUNC = 0x0B74;
gl.STENCIL_CLEAR_VALUE = 0x0B91;
gl.STENCIL_FUNC = 0x0B92;
gl.STENCIL_FAIL = 0x0B94;
gl.STENCIL_PASS_DEPTH_FAIL = 0x0B95;
gl.STENCIL_PASS_DEPTH_PASS = 0x0B96;
gl.STENCIL_REF = 0x0B97;
gl.STENCIL_VALUE_MASK = 0x0B93;
gl.STENCIL_WRITEMASK = 0x0B98;
gl.STENCIL_BACK_FUNC = 0x8800;
gl.STENCIL_BACK_FAIL = 0x8801;
gl.STENCIL_BACK_PASS_DEPTH_FAIL = 0x8802;
gl.STENCIL_BACK_PASS_DEPTH_PASS = 0x8803;
gl.STENCIL_BACK_REF = 0x8CA3;
gl.STENCIL_BACK_VALUE_MASK = 0x8CA4;
gl.STENCIL_BACK_WRITEMASK = 0x8CA5;
gl.VIEWPORT = 0x0BA2;
gl.SCISSOR_BOX = 0x0C10;
gl.COLOR_CLEAR_VALUE = 0x0C22;
gl.COLOR_WRITEMASK = 0x0C23;
gl.UNPACK_ALIGNMENT = 0x0CF5;
gl.PACK_ALIGNMENT = 0x0D05;
gl.MAX_TEXTURE_SIZE = 0x0D33;
gl.MAX_VIEWPORT_DIMS = 0x0D3A;
gl.SUBPIXEL_BITS = 0x0D50;
gl.RED_BITS = 0x0D52;
gl.GREEN_BITS = 0x0D53;
gl.BLUE_BITS = 0x0D54;
gl.ALPHA_BITS = 0x0D55;
gl.DEPTH_BITS = 0x0D56;
gl.STENCIL_BITS = 0x0D57;
gl.POLYGON_OFFSET_UNITS = 0x2A00;
gl.POLYGON_OFFSET_FACTOR = 0x8038;
gl.TEXTURE_BINDING_2D = 0x8069;
gl.SAMPLE_BUFFERS = 0x80A8;
gl.SAMPLES = 0x80A9;
gl.SAMPLE_COVERAGE_VALUE = 0x80AA;
gl.SAMPLE_COVERAGE_INVERT = 0x80AB;
gl.COMPRESSED_TEXTURE_FORMATS = 0x86A3;
gl.DONT_CARE = 0x1100;
gl.FASTEST = 0x1101;
gl.NICEST = 0x1102;
gl.GENERATE_MIPMAP_HINT = 0x8192;
gl.BYTE = 0x1400;
gl.UNSIGNED_BYTE = 0x1401;
gl.SHORT = 0x1402;
gl.UNSIGNED_SHORT = 0x1403;
gl.INT = 0x1404;
gl.UNSIGNED_INT = 0x1405;
gl.FLOAT = 0x1406;
gl.DEPTH_COMPONENT = 0x1902;
gl.ALPHA = 0x1906;
gl.RGB = 0x1907;
gl.RGBA = 0x1908;
gl.LUMINANCE = 0x1909;
gl.LUMINANCE_ALPHA = 0x190A;
gl.UNSIGNED_SHORT_4_4_4_4 = 0x8033;
gl.UNSIGNED_SHORT_5_5_5_1 = 0x8034;
gl.UNSIGNED_SHORT_5_6_5 = 0x8363;
gl.FRAGMENT_SHADER = 0x8B30;
gl.VERTEX_SHADER = 0x8B31;
gl.MAX_VERTEX_ATTRIBS = 0x8869;
gl.MAX_VERTEX_UNIFORM_VECTORS = 0x8DFB;
gl.MAX_VARYING_VECTORS = 0x8DFC;
gl.MAX_COMBINED_TEXTURE_IMAGE_UNITS = 0x8B4D;
gl.MAX_VERTEX_TEXTURE_IMAGE_UNITS = 0x8B4C;
gl.MAX_TEXTURE_IMAGE_UNITS = 0x8872;
gl.MAX_FRAGMENT_UNIFORM_VECTORS = 0x8DFD;
gl.SHADER_TYPE = 0x8B4F;
gl.DELETE_STATUS = 0x8B80;
gl.LINK_STATUS = 0x8B82;
gl.VALIDATE_STATUS = 0x8B83;
gl.ATTACHED_SHADERS = 0x8B85;
gl.ACTIVE_UNIFORMS = 0x8B86;
gl.ACTIVE_ATTRIBUTES = 0x8B89;
gl.SHADING_LANGUAGE_VERSION = 0x8B8C;
gl.CURRENT_PROGRAM = 0x8B8D;
gl.NEVER = 0x0200;
gl.LESS = 0x0201;
gl.EQUAL = 0x0202;
gl.LEQUAL = 0x0203;
gl.GREATER = 0x0204;
gl.NOTEQUAL = 0x0205;
gl.GEQUAL = 0x0206;
gl.ALWAYS = 0x0207;
gl.KEEP = 0x1E00;
gl.REPLACE = 0x1E01;
gl.INCR = 0x1E02;
gl.DECR = 0x1E03;
gl.INVERT = 0x150A;
gl.INCR_WRAP = 0x8507;
gl.DECR_WRAP = 0x8508;
gl.VENDOR = 0x1F00;
gl.RENDERER = 0x1F01;
gl.VERSION = 0x1F02;
gl.NEAREST = 0x2600;
gl.LINEAR = 0x2601;
gl.NEAREST_MIPMAP_NEAREST = 0x2700;
gl.LINEAR_MIPMAP_NEAREST = 0x2701;
gl.NEAREST_MIPMAP_LINEAR = 0x2702;
gl.LINEAR_MIPMAP_LINEAR = 0x2703;
gl.TEXTURE_MAG_FILTER = 0x2800;
gl.TEXTURE_MIN_FILTER = 0x2801;
gl.TEXTURE_WRAP_S = 0x2802;
gl.TEXTURE_WRAP_T = 0x2803;
gl.TEXTURE_2D = 0x0DE1;
gl.TEXTURE = 0x1702;
gl.TEXTURE_CUBE_MAP = 0x8513;
gl.TEXTURE_BINDING_CUBE_MAP = 0x8514;
gl.TEXTURE_CUBE_MAP_POSITIVE_X = 0x8515;
gl.TEXTURE_CUBE_MAP_NEGATIVE_X = 0x8516;
gl.TEXTURE_CUBE_MAP_POSITIVE_Y = 0x8517;
gl.TEXTURE_CUBE_MAP_NEGATIVE_Y = 0x8518;
gl.TEXTURE_CUBE_MAP_POSITIVE_Z = 0x8519;
gl.TEXTURE_CUBE_MAP_NEGATIVE_Z = 0x851A;
gl.MAX_CUBE_MAP_TEXTURE_SIZE = 0x851C;
gl.TEXTURE0 = 0x84C0;
gl.TEXTURE1 = 0x84C1;
gl.TEXTURE2 = 0x84C2;
gl.TEXTURE3 = 0x84C3;
gl.TEXTURE4 = 0x84C4;
gl.TEXTURE5 = 0x84C5;
gl.TEXTURE6 = 0x84C6;
gl.TEXTURE7 = 0x84C7;
gl.TEXTURE8 = 0x84C8;
gl.TEXTURE9 = 0x84C9;
gl.TEXTURE10 = 0x84CA;
gl.TEXTURE11 = 0x84CB;
gl.TEXTURE12 = 0x84CC;
gl.TEXTURE13 = 0x84CD;
gl.TEXTURE14 = 0x84CE;
gl.TEXTURE15 = 0x84CF;
gl.TEXTURE16 = 0x84D0;
gl.TEXTURE17 = 0x84D1;
gl.TEXTURE18 = 0x84D2;
gl.TEXTURE19 = 0x84D3;
gl.TEXTURE20 = 0x84D4;
gl.TEXTURE21 = 0x84D5;
gl.TEXTURE22 = 0x84D6;
gl.TEXTURE23 = 0x84D7;
gl.TEXTURE24 = 0x84D8;
gl.TEXTURE25 = 0x84D9;
gl.TEXTURE26 = 0x84DA;
gl.TEXTURE27 = 0x84DB;
gl.TEXTURE28 = 0x84DC;
gl.TEXTURE29 = 0x84DD;
gl.TEXTURE30 = 0x84DE;
gl.TEXTURE31 = 0x84DF;
gl.ACTIVE_TEXTURE = 0x84E0;
gl.REPEAT = 0x2901;
gl.CLAMP_TO_EDGE = 0x812F;
gl.MIRRORED_REPEAT = 0x8370;
gl.FLOAT_VEC2 = 0x8B50;
gl.FLOAT_VEC3 = 0x8B51;
gl.FLOAT_VEC4 = 0x8B52;
gl.INT_VEC2 = 0x8B53;
gl.INT_VEC3 = 0x8B54;
gl.INT_VEC4 = 0x8B55;
gl.BOOL = 0x8B56;
gl.BOOL_VEC2 = 0x8B57;
gl.BOOL_VEC3 = 0x8B58;
gl.BOOL_VEC4 = 0x8B59;
gl.FLOAT_MAT2 = 0x8B5A;
gl.FLOAT_MAT3 = 0x8B5B;
gl.FLOAT_MAT4 = 0x8B5C;
gl.SAMPLER_2D = 0x8B5E;
gl.SAMPLER_CUBE = 0x8B60;
gl.VERTEX_ATTRIB_ARRAY_ENABLED = 0x8622;
gl.VERTEX_ATTRIB_ARRAY_SIZE = 0x8623;
gl.VERTEX_ATTRIB_ARRAY_STRIDE = 0x8624;
gl.VERTEX_ATTRIB_ARRAY_TYPE = 0x8625;
gl.VERTEX_ATTRIB_ARRAY_NORMALIZED = 0x886A;
gl.VERTEX_ATTRIB_ARRAY_POINTER = 0x8645;
gl.VERTEX_ATTRIB_ARRAY_BUFFER_BINDING = 0x889F;
gl.IMPLEMENTATION_COLOR_READ_TYPE = 0x8B9A;
gl.IMPLEMENTATION_COLOR_READ_FORMAT = 0x8B9B;
gl.COMPILE_STATUS = 0x8B81;
gl.LOW_FLOAT = 0x8DF0;
gl.MEDIUM_FLOAT = 0x8DF1;
gl.HIGH_FLOAT = 0x8DF2;
gl.LOW_INT = 0x8DF3;
gl.MEDIUM_INT = 0x8DF4;
gl.HIGH_INT = 0x8DF5;
gl.FRAMEBUFFER = 0x8D40;
gl.RENDERBUFFER = 0x8D41;
gl.RGBA4 = 0x8056;
gl.RGB5_A1 = 0x8057;
gl.RGB565 = 0x8D62;
gl.DEPTH_COMPONENT16 = 0x81A5;
gl.STENCIL_INDEX = 0x1901;
gl.STENCIL_INDEX8 = 0x8D48;
gl.DEPTH_STENCIL = 0x84F9;
gl.RENDERBUFFER_WIDTH = 0x8D42;
gl.RENDERBUFFER_HEIGHT = 0x8D43;
gl.RENDERBUFFER_INTERNAL_FORMAT = 0x8D44;
gl.RENDERBUFFER_RED_SIZE = 0x8D50;
gl.RENDERBUFFER_GREEN_SIZE = 0x8D51;
gl.RENDERBUFFER_BLUE_SIZE = 0x8D52;
gl.RENDERBUFFER_ALPHA_SIZE = 0x8D53;
gl.RENDERBUFFER_DEPTH_SIZE = 0x8D54;
gl.RENDERBUFFER_STENCIL_SIZE = 0x8D55;
gl.FRAMEBUFFER_ATTACHMENT_OBJECT_TYPE = 0x8CD0;
gl.FRAMEBUFFER_ATTACHMENT_OBJECT_NAME = 0x8CD1;
gl.FRAMEBUFFER_ATTACHMENT_TEXTURE_LEVEL = 0x8CD2;
gl.FRAMEBUFFER_ATTACHMENT_TEXTURE_CUBE_MAP_FACE = 0x8CD3;
gl.COLOR_ATTACHMENT0 = 0x8CE0;
gl.DEPTH_ATTACHMENT = 0x8D00;
gl.STENCIL_ATTACHMENT = 0x8D20;
gl.DEPTH_STENCIL_ATTACHMENT = 0x821A;
gl.NONE = 0;
gl.FRAMEBUFFER_COMPLETE = 0x8CD5;
gl.FRAMEBUFFER_INCOMPLETE_ATTACHMENT = 0x8CD6;
gl.FRAMEBUFFER_INCOMPLETE_MISSING_ATTACHMENT = 0x8CD7;
gl.FRAMEBUFFER_INCOMPLETE_DIMENSIONS = 0x8CD9;
gl.FRAMEBUFFER_UNSUPPORTED = 0x8CDD;
gl.FRAMEBUFFER_BINDING = 0x8CA6;
gl.RENDERBUFFER_BINDING = 0x8CA7;
gl.MAX_RENDERBUFFER_SIZE = 0x84E8;
gl.INVALID_FRAMEBUFFER_OPERATION = 0x0506;
gl.UNPACK_FLIP_Y_WEBGL = 0x9240;
gl.UNPACK_PREMULTIPLY_ALPHA_WEBGL = 0x9241;
gl.CONTEXT_LOST_WEBGL = 0x9242;
gl.UNPACK_COLORSPACE_CONVERSION_WEBGL = 0x9243;
gl.BROWSER_DEFAULT_WEBGL = 0x9244;


},{}],51:[function(require,module,exports){
"use strict";
Object.defineProperties(exports, {
  default: {get: function() {
      return $__default;
    }},
  __esModule: {value: true}
});
var $__gl_95_program__,
    $__loglevel__;
var GLProgram = ($__gl_95_program__ = require("./gl_program"), $__gl_95_program__ && $__gl_95_program__.__esModule && $__gl_95_program__ || {default: $__gl_95_program__}).default;
var log = ($__loglevel__ = require("loglevel"), $__loglevel__ && $__loglevel__.__esModule && $__loglevel__ || {default: $__loglevel__}).default;
function GLGeometry(gl, vertex_data, vertex_layout, options) {
  options = options || {};
  this.gl = gl;
  this.vertex_data = vertex_data;
  this.vertex_layout = vertex_layout;
  this.buffer = this.gl.createBuffer();
  this.draw_mode = options.draw_mode || this.gl.TRIANGLES;
  this.data_usage = options.data_usage || this.gl.STATIC_DRAW;
  this.vertices_per_geometry = 3;
  this.vertex_count = this.vertex_data.byteLength / this.vertex_layout.stride;
  this.geometry_count = this.vertex_count / this.vertices_per_geometry;
  this.gl.bindBuffer(this.gl.ARRAY_BUFFER, this.buffer);
  this.gl.bufferData(this.gl.ARRAY_BUFFER, this.vertex_data, this.data_usage);
  this.valid = true;
}
var $__default = GLGeometry;
GLGeometry.prototype.render = function() {
  var options = arguments[0] !== (void 0) ? arguments[0] : {};
  if (!this.valid) {
    return false;
  }
  if (typeof this._render_setup === 'function') {
    this._render_setup();
  }
  var gl_program = options.gl_program || GLProgram.current;
  gl_program.use();
  this.gl.bindBuffer(this.gl.ARRAY_BUFFER, this.buffer);
  this.vertex_layout.enable(this.gl, gl_program);
  this.gl.drawArrays(this.draw_mode, 0, this.vertex_count);
  return true;
};
GLGeometry.prototype.destroy = function() {
  if (!this.valid) {
    return false;
  }
  log.debug('GLGeometry.destroy: delete buffer of size ' + this.vertex_data.byteLength);
  this.gl.deleteBuffer(this.buffer);
  this.buffer = null;
  delete this.vertex_data;
  this.valid = false;
  return true;
};


},{"./gl_program":53,"loglevel":37}],52:[function(require,module,exports){
"use strict";
Object.defineProperties(exports, {
  Modes: {get: function() {
      return Modes;
    }},
  ModeManager: {get: function() {
      return ModeManager;
    }},
  __esModule: {value: true}
});
var $__gl_95_vertex_95_layout__,
    $__gl_95_builders__,
    $__gl_95_program__,
    $__gl_95_geom__,
    $__gl_95_constants__,
    $__loglevel__;
var GLVertexLayout = ($__gl_95_vertex_95_layout__ = require("./gl_vertex_layout"), $__gl_95_vertex_95_layout__ && $__gl_95_vertex_95_layout__.__esModule && $__gl_95_vertex_95_layout__ || {default: $__gl_95_vertex_95_layout__}).default;
var GLBuilders = ($__gl_95_builders__ = require("./gl_builders"), $__gl_95_builders__ && $__gl_95_builders__.__esModule && $__gl_95_builders__ || {default: $__gl_95_builders__}).GLBuilders;
var GLProgram = ($__gl_95_program__ = require("./gl_program"), $__gl_95_program__ && $__gl_95_program__.__esModule && $__gl_95_program__ || {default: $__gl_95_program__}).default;
var GLGeometry = ($__gl_95_geom__ = require("./gl_geom"), $__gl_95_geom__ && $__gl_95_geom__.__esModule && $__gl_95_geom__ || {default: $__gl_95_geom__}).default;
var gl = ($__gl_95_constants__ = require("./gl_constants"), $__gl_95_constants__ && $__gl_95_constants__.__esModule && $__gl_95_constants__ || {default: $__gl_95_constants__}).default;
var log = ($__loglevel__ = require("loglevel"), $__loglevel__ && $__loglevel__.__esModule && $__loglevel__ || {default: $__loglevel__}).default;
var shader_sources = require('./gl_shaders');
var Modes = {};
var ModeManager = {};
var RenderMode = {
  init: function() {
    this.defines = {};
    this.shaders = {};
    this.selection = false;
    this.loading = false;
    this.gl_program = null;
    this.selection_gl_program = null;
  },
  setGL: function(gl, callback) {
    this.gl = gl;
    this.valid = true;
  },
  compile: function(callback) {
    this.makeGLProgram(callback);
  },
  makeGLGeometry: function(vertex_data) {
    return new GLGeometry(this.gl, vertex_data, this.vertex_layout);
  },
  isBuiltIn: function() {
    return this.hasOwnProperty('built_in');
  },
  buildPolygons: function() {},
  buildLines: function() {},
  buildPoints: function() {}
};
RenderMode.destroy = function() {
  if (this.gl_program) {
    this.gl_program.destroy();
    this.gl_program = null;
  }
  if (this.selection_gl_program) {
    this.selection_gl_program.destroy();
    this.selection_gl_program = null;
  }
  this.gl = null;
  this.valid = false;
  if (!this.isBuiltIn()) {
    delete Modes[this.name];
  }
};
RenderMode.makeGLProgram = function(callback) {
  var $__6 = this;
  callback = (typeof callback === 'function') ? callback : function() {};
  if (this.valid === false) {
    callback(new Error(("mode.makeGLProgram(): skipping for " + this.name + " because mode not valid")));
    return;
  }
  if (this.loading) {
    callback(new Error(("mode.makeGLProgram(): skipping for " + this.name + " because mode is already loading")));
    return;
  }
  this.loading = true;
  var defines = this.buildDefineList();
  if (this.selection) {
    var selection_defines = Object.assign({}, defines);
    selection_defines['FEATURE_SELECTION'] = true;
  }
  var transforms = (this.shaders && this.shaders.transforms);
  var program = this.gl_program;
  var selection_program = this.selection_gl_program;
  Promise.all([new Promise((function(resolve, reject) {
    program = new GLProgram($__6.gl, shader_sources[$__6.vertex_shader_key], shader_sources[$__6.fragment_shader_key], {
      defines: defines,
      transforms: transforms,
      name: $__6.name,
      resolve: resolve,
      reject: reject
    });
  })), new Promise((function(resolve, reject) {
    if ($__6.selection) {
      selection_program = new GLProgram($__6.gl, shader_sources[$__6.vertex_shader_key], shader_sources['selection_fragment'], {
        defines: selection_defines,
        transforms: transforms,
        name: ($__6.name + ' (selection)'),
        resolve: resolve,
        reject: reject
      });
    } else {
      resolve();
    }
  }))]).then((function() {
    $__6.loading = false;
    if (program) {
      $__6.gl_program = program;
    }
    if (selection_program) {
      $__6.selection_gl_program = selection_program;
    }
    callback();
  }), (function(error) {
    callback(new Error(("mode.makeGLProgram(): mode " + $__6.name + " completed with error: " + error.message)));
  }));
};
RenderMode.buildDefineList = function() {
  var defines = {};
  if (this.defines != null) {
    for (var d in this.defines) {
      defines[d] = this.defines[d];
    }
  }
  if (this.shaders != null && this.shaders.defines != null) {
    for (d in this.shaders.defines) {
      defines[d] = this.shaders.defines[d];
    }
  }
  return defines;
};
RenderMode.setUniforms = function() {
  var gl_program = GLProgram.current;
  if (gl_program != null && this.shaders != null && this.shaders.uniforms != null) {
    gl_program.setUniforms(this.shaders.uniforms);
  }
};
RenderMode.update = function() {};
ModeManager.updateMode = function(name, settings) {
  Modes[name] = Modes[name] || Object.create(Modes[settings.extends] || RenderMode);
  if (Modes[settings.extends]) {
    Modes[name].parent = Modes[settings.extends];
  }
  for (var s in settings) {
    Modes[name][s] = settings[s];
  }
  Modes[name].name = name;
  return Modes[name];
};
ModeManager.destroy = function(gl) {
  var modes = Object.keys(Modes);
  for (var $__7 = modes[Symbol.iterator](),
      $__8; !($__8 = $__7.next()).done; ) {
    var m = $__8.value;
    {
      var mode = Modes[m];
      if (mode.gl === gl) {
        log.trace(("destroying render mode " + mode.name));
        mode.destroy();
      }
    }
  }
};
var Polygons = Object.create(RenderMode);
Polygons.name = 'polygons';
Modes[Polygons.name] = Polygons;
Polygons.built_in = true;
Polygons.init = function() {
  RenderMode.init.apply(this);
  this.vertex_shader_key = 'polygon_vertex';
  this.fragment_shader_key = 'polygon_fragment';
  this.defines['WORLD_POSITION_WRAP'] = 100000;
  this.selection = true;
  var attribs = [{
    name: 'a_position',
    size: 3,
    type: gl.FLOAT,
    normalized: false
  }, {
    name: 'a_normal',
    size: 3,
    type: gl.FLOAT,
    normalized: false
  }, {
    name: 'a_color',
    size: 4,
    type: gl.UNSIGNED_BYTE,
    normalized: true
  }, {
    name: 'a_selection_color',
    size: 4,
    type: gl.UNSIGNED_BYTE,
    normalized: true
  }, {
    name: 'a_layer',
    size: 1,
    type: gl.FLOAT,
    normalized: false
  }];
  if (this.texcoords) {
    this.defines['TEXTURE_COORDS'] = true;
    attribs.push({
      name: 'a_texcoord',
      size: 2,
      type: gl.FLOAT,
      normalized: false
    });
  }
  this.vertex_layout = new GLVertexLayout(attribs);
};
Polygons.makeVertexTemplate = function(style) {
  var template = [0, 0, style.z, 0, 0, 1, style.color[0] * 255, style.color[1] * 255, style.color[2] * 255, 255, style.selection.color[0] * 255, style.selection.color[1] * 255, style.selection.color[2] * 255, style.selection.color[3] * 255, style.layer_num];
  if (this.texcoords) {
    template.push(0, 0);
  }
  return template;
};
Polygons.buildPolygons = function(polygons, style, vertex_data) {
  var vertex_template = this.makeVertexTemplate(style);
  if (style.extrude && style.height) {
    GLBuilders.buildExtrudedPolygons(polygons, style.z, style.height, style.min_height, vertex_data, vertex_template, this.vertex_layout.index.a_normal, {texcoord_index: this.vertex_layout.index.a_texcoord});
  } else {
    GLBuilders.buildPolygons(polygons, vertex_data, vertex_template, {texcoord_index: this.vertex_layout.index.a_texcoord});
  }
  if (style.outline.color && style.outline.width) {
    var color_index = this.vertex_layout.index.a_color;
    vertex_template[color_index + 0] = style.outline.color[0] * 255;
    vertex_template[color_index + 1] = style.outline.color[1] * 255;
    vertex_template[color_index + 2] = style.outline.color[2] * 255;
    vertex_template[this.vertex_layout.index.a_layer] += 0.25;
    for (var mpc = 0; mpc < polygons.length; mpc++) {
      GLBuilders.buildPolylines(polygons[mpc], style.z, style.outline.width, vertex_data, vertex_template, {
        texcoord_index: this.vertex_layout.index.a_texcoord,
        closed_polygon: true,
        remove_tile_edges: !style.outline.tile_edges
      });
    }
  }
};
Polygons.buildLines = function(lines, style, vertex_data) {
  var vertex_template = this.makeVertexTemplate(style);
  GLBuilders.buildPolylines(lines, style.z, style.width, vertex_data, vertex_template, {texcoord_index: this.vertex_layout.index.a_texcoord});
  if (style.outline.color && style.outline.width) {
    var color_index = this.vertex_layout.index.a_color;
    vertex_template[color_index + 0] = style.outline.color[0] * 255;
    vertex_template[color_index + 1] = style.outline.color[1] * 255;
    vertex_template[color_index + 2] = style.outline.color[2] * 255;
    vertex_template[this.vertex_layout.index.a_layer] -= 0.25;
    GLBuilders.buildPolylines(lines, style.z, style.width + 2 * style.outline.width, vertex_data, vertex_template, {texcoord_index: this.vertex_layout.index.a_texcoord});
  }
};
Polygons.buildPoints = function(points, style, vertex_data) {
  var vertex_template = this.makeVertexTemplate(style);
  GLBuilders.buildQuadsForPoints(points, style.size * 2, style.size * 2, vertex_data, vertex_template, {texcoord_index: this.vertex_layout.index.a_texcoord});
};
var Points = Object.create(RenderMode);
Points.name = 'points';
Modes[Points.name] = Points;
Points.built_in = true;
Points.init = function() {
  RenderMode.init.apply(this);
  this.vertex_shader_key = 'point_vertex';
  this.fragment_shader_key = 'point_fragment';
  this.defines['EFFECT_SCREEN_COLOR'] = true;
  this.selection = true;
  this.vertex_layout = new GLVertexLayout([{
    name: 'a_position',
    size: 3,
    type: gl.FLOAT,
    normalized: false
  }, {
    name: 'a_texcoord',
    size: 2,
    type: gl.FLOAT,
    normalized: false
  }, {
    name: 'a_color',
    size: 4,
    type: gl.UNSIGNED_BYTE,
    normalized: true
  }, {
    name: 'a_selection_color',
    size: 4,
    type: gl.UNSIGNED_BYTE,
    normalized: true
  }, {
    name: 'a_layer',
    size: 1,
    type: gl.FLOAT,
    normalized: false
  }]);
};
Points.makeVertexTemplate = function(style) {
  return [0, 0, style.z, 0, 0, style.color[0] * 255, style.color[1] * 255, style.color[2] * 255, 255, style.selection.color[0] * 255, style.selection.color[1] * 255, style.selection.color[2] * 255, style.selection.color[3] * 255, style.layer_num];
};
Points.buildPoints = function(points, style, vertex_data) {
  var vertex_template = this.makeVertexTemplate(style);
  GLBuilders.buildQuadsForPoints(points, style.size * 2, style.size * 2, vertex_data, vertex_template, {texcoord_index: this.vertex_layout.index.a_texcoord});
};


},{"./gl_builders":49,"./gl_constants":50,"./gl_geom":51,"./gl_program":53,"./gl_shaders":54,"./gl_vertex_layout":56,"loglevel":37}],53:[function(require,module,exports){
"use strict";
Object.defineProperties(exports, {
  default: {get: function() {
      return $__default;
    }},
  __esModule: {value: true}
});
var $___46__46__47_utils__,
    $__gl__,
    $__gl_95_texture__;
var Utils = ($___46__46__47_utils__ = require("../utils"), $___46__46__47_utils__ && $___46__46__47_utils__.__esModule && $___46__46__47_utils__ || {default: $___46__46__47_utils__}).default;
var GL = ($__gl__ = require("./gl"), $__gl__ && $__gl__.__esModule && $__gl__ || {default: $__gl__}).GL;
var GLTexture = ($__gl_95_texture__ = require("./gl_texture"), $__gl_95_texture__ && $__gl_95_texture__.__esModule && $__gl_95_texture__ || {default: $__gl_95_texture__}).default;
GLProgram.id = 0;
GLProgram.programs = {};
function GLProgram(gl, vertex_shader, fragment_shader, options) {
  options = options || {};
  this.gl = gl;
  this.program = null;
  this.compiled = false;
  this.compiling = false;
  this.defines = options.defines || {};
  this.transforms = options.transforms || {};
  this.compiling = false;
  this.defines = Object.assign({}, options.defines || {});
  this.transforms = Object.assign({}, options.transforms || {});
  this.uniforms = {};
  this.attribs = {};
  this.vertex_shader = vertex_shader;
  this.fragment_shader = fragment_shader;
  this.id = GLProgram.id++;
  GLProgram.programs[this.id] = this;
  this.name = options.name;
  this.compile({
    resolve: options.resolve,
    reject: options.reject
  });
}
var $__default = GLProgram;
GLProgram.prototype.destroy = function() {
  this.gl.useProgram(null);
  this.gl.deleteProgram(this.program);
  this.program = null;
  this.uniforms = {};
  this.attribs = {};
  delete GLProgram.programs[this.id];
  this.compiled = false;
};
GLProgram.prototype.use = function() {
  if (!this.compiled) {
    return;
  }
  if (GLProgram.current !== this) {
    this.gl.useProgram(this.program);
  }
  GLProgram.current = this;
};
GLProgram.current = null;
GLProgram.defines = {};
GLProgram.transforms = {};
GLProgram.addTransform = function(key) {
  var $__8;
  for (var transforms = [],
      $__4 = 1; $__4 < arguments.length; $__4++)
    transforms[$__4 - 1] = arguments[$__4];
  GLProgram.transforms[key] = GLProgram.transforms[key] || [];
  ($__8 = GLProgram.transforms[key]).push.apply($__8, $traceurRuntime.spread(transforms));
};
GLProgram.removeTransform = function(key) {
  GLProgram.transforms[key] = [];
};
GLProgram.prototype.compile = function($__6) {
  var $__7 = $__6,
      resolve = $__7.resolve,
      reject = $__7.reject;
  var $__3 = this;
  if (this.compiling) {
    reject(new Error(("GLProgram.compile(): skipping for " + this.id + " (" + this.name + ") because already compiling")));
    return;
  }
  this.compiling = true;
  this.compiled = false;
  this.computed_vertex_shader = this.vertex_shader;
  this.computed_fragment_shader = this.fragment_shader;
  var defines = this.buildDefineList();
  var transforms = this.buildShaderTransformList();
  var loaded_transforms = {};
  var regexp;
  var queue = [];
  for (var key in transforms) {
    var transform = transforms[key];
    if (transform == null) {
      continue;
    }
    if (!(typeof transform === 'object' && transform.length >= 0)) {
      transform = [transform];
    }
    regexp = new RegExp('^\\s*#pragma\\s+tangram:\\s+' + key + '\\s*$', 'm');
    var inject_vertex = this.computed_vertex_shader.match(regexp);
    var inject_fragment = this.computed_fragment_shader.match(regexp);
    if (inject_vertex == null && inject_fragment == null) {
      continue;
    }
    loaded_transforms[key] = {};
    loaded_transforms[key].regexp = new RegExp(regexp);
    loaded_transforms[key].inject_vertex = (inject_vertex != null);
    loaded_transforms[key].inject_fragment = (inject_fragment != null);
    loaded_transforms[key].list = [];
    for (var u = 0; u < transform.length; u++) {
      queue.push(new Promise((function(resolve, reject) {
        GLProgram.loadTransform(loaded_transforms, transform[u], key, u, resolve, reject);
      })));
    }
    defines['TANGRAM_TRANSFORM_' + key.replace(' ', '_').toUpperCase()] = true;
  }
  Promise.all(queue).then((function() {
    $__3.compiling = false;
    for (var t in loaded_transforms) {
      var combined_source = "";
      for (var s = 0; s < loaded_transforms[t].list.length; s++) {
        combined_source += loaded_transforms[t].list[s] + '\n';
      }
      if (loaded_transforms[t].inject_vertex != null) {
        $__3.computed_vertex_shader = $__3.computed_vertex_shader.replace(loaded_transforms[t].regexp, combined_source);
      }
      if (loaded_transforms[t].inject_fragment != null) {
        $__3.computed_fragment_shader = $__3.computed_fragment_shader.replace(loaded_transforms[t].regexp, combined_source);
      }
    }
    var regexp = new RegExp('^\\s*#pragma\\s+tangram:\\s+\\w+\\s*$', 'gm');
    $__3.computed_vertex_shader = $__3.computed_vertex_shader.replace(regexp, '');
    $__3.computed_fragment_shader = $__3.computed_fragment_shader.replace(regexp, '');
    var define_str = GLProgram.buildDefineString(defines);
    $__3.computed_vertex_shader = define_str + $__3.computed_vertex_shader;
    $__3.computed_fragment_shader = define_str + $__3.computed_fragment_shader;
    var info = ($__3.name ? ($__3.name + ' / id ' + $__3.id) : ('id ' + $__3.id));
    $__3.computed_vertex_shader = '// Program: ' + info + '\n' + $__3.computed_vertex_shader;
    $__3.computed_fragment_shader = '// Program: ' + info + '\n' + $__3.computed_fragment_shader;
    try {
      $__3.program = GL.updateProgram($__3.gl, $__3.program, $__3.computed_vertex_shader, $__3.computed_fragment_shader);
      $__3.compiled = true;
    } catch (e) {
      $__3.program = null;
      $__3.compiled = false;
    }
    $__3.use();
    $__3.refreshUniforms();
    $__3.refreshAttributes();
    resolve();
  }), (function(error) {
    reject(new Error(("GLProgram.compile(): skipping for " + $__3.id + " (" + $__3.name + ") errored: " + error.message)));
  }));
};
GLProgram.loadTransform = function(transforms, block, key, index, resolve, reject) {
  if (typeof block === 'string') {
    transforms[key].list[index] = block;
    resolve();
  } else if (typeof block === 'object' && block.url) {
    Utils.io(Utils.cacheBusterForUrl(block.url)).then((function(body) {
      transforms[key].list[index] = body;
      resolve();
    }), (function(error) {
      reject(error);
    }));
  }
};
GLProgram.prototype.buildDefineList = function() {
  var d,
      defines = {};
  for (d in GLProgram.defines) {
    defines[d] = GLProgram.defines[d];
  }
  for (d in this.defines) {
    defines[d] = this.defines[d];
  }
  return defines;
};
GLProgram.prototype.buildShaderTransformList = function() {
  var $__8,
      $__9;
  var d,
      transforms = {};
  for (d in GLProgram.transforms) {
    transforms[d] = [];
    if (typeof GLProgram.transforms[d] === 'object' && GLProgram.transforms[d].length >= 0) {
      ($__8 = transforms[d]).push.apply($__8, $traceurRuntime.spread(GLProgram.transforms[d]));
    } else {
      transforms[d] = [GLProgram.transforms[d]];
    }
  }
  for (d in this.transforms) {
    transforms[d] = transforms[d] || [];
    if (typeof this.transforms[d] === 'object' && this.transforms[d].length >= 0) {
      ($__9 = transforms[d]).push.apply($__9, $traceurRuntime.spread(this.transforms[d]));
    } else {
      transforms[d].push(this.transforms[d]);
    }
  }
  return transforms;
};
GLProgram.buildDefineString = function(defines) {
  var define_str = "";
  for (var d in defines) {
    if (defines[d] === false) {
      continue;
    } else if (typeof defines[d] === 'boolean' && defines[d] === true) {
      define_str += "#define " + d + "\n";
    } else if (typeof defines[d] === 'number' && Math.floor(defines[d]) === defines[d]) {
      define_str += "#define " + d + " " + defines[d].toFixed(1) + "\n";
    } else {
      define_str += "#define " + d + " " + defines[d] + "\n";
    }
  }
  return define_str;
};
GLProgram.prototype.setUniforms = function(uniforms) {
  if (!this.compiled) {
    return;
  }
  var texture_unit = 0;
  for (var u in uniforms) {
    var uniform = uniforms[u];
    if (typeof uniform === 'number') {
      this.uniform('1f', u, uniform);
    } else if (typeof uniform === 'object') {
      if (uniform.length >= 2 && uniform.length <= 4) {
        this.uniform(uniform.length + 'fv', u, uniform);
      } else if (uniform.length > 4) {
        this.uniform('1fv', u + '[0]', uniform);
      }
    } else if (typeof uniform === 'boolean') {
      this.uniform('1i', u, uniform);
    } else if (typeof uniform === 'string') {
      var texture = GLTexture.textures[uniform];
      if (texture == null) {
        texture = new GLTexture(this.gl, uniform);
        texture.load(uniform);
      }
      texture.bind(texture_unit);
      this.uniform('1i', u, texture_unit);
      texture_unit++;
    }
  }
};
GLProgram.prototype.uniform = function(method, name) {
  for (var values = [],
      $__5 = 2; $__5 < arguments.length; $__5++)
    values[$__5 - 2] = arguments[$__5];
  if (!this.compiled) {
    return;
  }
  var uniform = (this.uniforms[name] = this.uniforms[name] || {});
  uniform.name = name;
  uniform.location = uniform.location || this.gl.getUniformLocation(this.program, name);
  uniform.method = 'uniform' + method;
  uniform.values = values;
  this.updateUniform(name);
};
GLProgram.prototype.updateUniform = function(name) {
  if (!this.compiled) {
    return;
  }
  var uniform = this.uniforms[name];
  if (uniform == null || uniform.location == null) {
    return;
  }
  this.use();
  this.gl[uniform.method].apply(this.gl, [uniform.location].concat(uniform.values));
};
GLProgram.prototype.refreshUniforms = function() {
  if (!this.compiled) {
    return;
  }
  for (var u in this.uniforms) {
    this.uniforms[u].location = this.gl.getUniformLocation(this.program, u);
    this.updateUniform(u);
  }
};
GLProgram.prototype.refreshAttributes = function() {
  this.attribs = {};
};
GLProgram.prototype.attribute = function(name) {
  if (!this.compiled) {
    return;
  }
  var attrib = (this.attribs[name] = this.attribs[name] || {});
  if (attrib.location != null) {
    return attrib;
  }
  attrib.name = name;
  attrib.location = this.gl.getAttribLocation(this.program, name);
  return attrib;
};


},{"../utils":62,"./gl":48,"./gl_texture":55}],54:[function(require,module,exports){
"use strict";
var shader_sources = {};
shader_sources['point_fragment'] = "\n" + "#define GLSLIFY 1\n" + "\n" + "uniform vec2 u_resolution;\n" + "varying vec3 v_color;\n" + "varying vec2 v_texcoord;\n" + "void main(void) {\n" + "  vec3 color = v_color;\n" + "  vec3 lighting = vec3(1.);\n" + "  vec2 uv = v_texcoord * 2. - 1.;\n" + "  float len = length(uv);\n" + "  if(len > 1.) {\n" + "    discard;\n" + "  }\n" + "  color *= (1. - smoothstep(.25, 1., len)) + 0.5;\n" + "  #pragma tangram: fragment\n" + "  gl_FragColor = vec4(color, 1.);\n" + "}\n" + "";
shader_sources['point_vertex'] = "\n" + "#define GLSLIFY 1\n" + "\n" + "uniform mat4 u_tile_view;\n" + "uniform float u_num_layers;\n" + "attribute vec3 a_position;\n" + "attribute vec2 a_texcoord;\n" + "attribute vec3 a_color;\n" + "attribute float a_layer;\n" + "varying vec3 v_color;\n" + "varying vec2 v_texcoord;\n" + "#if defined(FEATURE_SELECTION)\n" + "\n" + "attribute vec4 a_selection_color;\n" + "varying vec4 v_selection_color;\n" + "#endif\n" + "\n" + "void a_x_reorderLayers(float layer, float num_layers, inout vec4 position) {\n" + "  float layer_order = ((layer + 1.) / (num_layers + 1.)) + 1.;\n" + "  position.z /= layer_order;\n" + "  position.xyw *= layer_order;\n" + "}\n" + "#pragma tangram: globals\n" + "\n" + "#pragma tangram: camera\n" + "\n" + "void main() {\n" + "  \n" + "  #if defined(FEATURE_SELECTION)\n" + "  if(a_selection_color.xyz == vec3(0.)) {\n" + "    gl_Position = vec4(0., 0., 0., 1.);\n" + "    return;\n" + "  }\n" + "  v_selection_color = a_selection_color;\n" + "  #endif\n" + "  vec4 position = u_tile_view * vec4(a_position, 1.);\n" + "  #pragma tangram: vertex\n" + "  v_color = a_color;\n" + "  v_texcoord = a_texcoord;\n" + "  cameraProjection(position);\n" + "  a_x_reorderLayers(a_layer, u_num_layers, position);\n" + "  gl_Position = position;\n" + "}\n" + "";
shader_sources['polygon_fragment'] = "\n" + "#define GLSLIFY 1\n" + "\n" + "uniform vec2 u_resolution;\n" + "uniform vec2 u_aspect;\n" + "uniform float u_meters_per_pixel;\n" + "uniform float u_time;\n" + "uniform float u_map_zoom;\n" + "uniform vec2 u_map_center;\n" + "uniform vec2 u_tile_origin;\n" + "uniform sampler2D u_texture;\n" + "varying vec3 v_color;\n" + "varying vec4 v_world_position;\n" + "#if defined(TEXTURE_COORDS)\n" + "\n" + "varying vec2 v_texcoord;\n" + "#endif\n" + "\n" + "#if defined(WORLD_POSITION_WRAP)\n" + "\n" + "vec2 world_position_anchor = vec2(floor(u_tile_origin / WORLD_POSITION_WRAP) * WORLD_POSITION_WRAP);\n" + "vec4 absoluteWorldPosition() {\n" + "  return vec4(v_world_position.xy + world_position_anchor, v_world_position.z, v_world_position.w);\n" + "}\n" + "#else\n" + "\n" + "vec4 absoluteWorldPosition() {\n" + "  return v_world_position;\n" + "}\n" + "#endif\n" + "\n" + "#if defined(LIGHTING_ENVIRONMENT)\n" + "\n" + "uniform sampler2D u_env_map;\n" + "#endif\n" + "\n" + "#if !defined(LIGHTING_VERTEX)\n" + "\n" + "varying vec4 v_position;\n" + "varying vec3 v_normal;\n" + "#else\n" + "\n" + "varying vec3 v_lighting;\n" + "#endif\n" + "\n" + "const float light_ambient = 0.5;\n" + "vec3 b_x_pointLight(vec4 position, vec3 normal, vec3 color, vec4 light_pos, float light_ambient, const bool backlight) {\n" + "  vec3 light_dir = normalize(position.xyz - light_pos.xyz);\n" + "  color *= abs(max(float(backlight) * -1., dot(normal, light_dir * -1.0))) + light_ambient;\n" + "  return color;\n" + "}\n" + "vec3 c_x_specularLight(vec4 position, vec3 normal, vec3 color, vec4 light_pos, float light_ambient, const bool backlight) {\n" + "  vec3 light_dir = normalize(position.xyz - light_pos.xyz);\n" + "  vec3 view_pos = vec3(0., 0., 500.);\n" + "  vec3 view_dir = normalize(position.xyz - view_pos.xyz);\n" + "  vec3 specularReflection;\n" + "  if(dot(normal, -light_dir) < 0.0) {\n" + "    specularReflection = vec3(0.0, 0.0, 0.0);\n" + "  } else {\n" + "    float attenuation = 1.0;\n" + "    float lightSpecularTerm = 1.0;\n" + "    float materialSpecularTerm = 10.0;\n" + "    float materialShininessTerm = 10.0;\n" + "    specularReflection = attenuation * vec3(lightSpecularTerm) * vec3(materialSpecularTerm) * pow(max(0.0, dot(reflect(-light_dir, normal), view_dir)), materialShininessTerm);\n" + "  }\n" + "  float diffuse = abs(max(float(backlight) * -1., dot(normal, light_dir * -1.0)));\n" + "  color *= diffuse + specularReflection + light_ambient;\n" + "  return color;\n" + "}\n" + "vec3 d_x_directionalLight(vec3 normal, vec3 color, vec3 light_dir, float light_ambient) {\n" + "  light_dir = normalize(light_dir);\n" + "  color *= dot(normal, light_dir * -1.0) + light_ambient;\n" + "  return color;\n" + "}\n" + "vec3 a_x_lighting(vec4 position, vec3 normal, vec3 color, vec4 light_pos, vec4 night_light_pos, vec3 light_dir, float light_ambient) {\n" + "  \n" + "  #if defined(LIGHTING_POINT)\n" + "  color = b_x_pointLight(position, normal, color, light_pos, light_ambient, true);\n" + "  #elif defined(LIGHTING_POINT_SPECULAR)\n" + "  color = c_x_specularLight(position, normal, color, light_pos, light_ambient, true);\n" + "  #elif defined(LIGHTING_NIGHT)\n" + "  color = b_x_pointLight(position, normal, color, night_light_pos, 0., false);\n" + "  #elif defined(LIGHTING_DIRECTION)\n" + "  color = d_x_directionalLight(normal, color, light_dir, light_ambient);\n" + "  #else\n" + "  color = color;\n" + "  #endif\n" + "  return color;\n" + "}\n" + "vec4 e_x_sphericalEnvironmentMap(vec3 view_pos, vec3 position, vec3 normal, sampler2D envmap) {\n" + "  vec3 eye = normalize(position.xyz - view_pos.xyz);\n" + "  if(eye.z > 0.01) {\n" + "    eye.z = 0.01;\n" + "  }\n" + "  vec3 r = reflect(eye, normal);\n" + "  float m = 2. * sqrt(pow(r.x, 2.) + pow(r.y, 2.) + pow(r.z + 1., 2.));\n" + "  vec2 uv = r.xy / m + .5;\n" + "  return texture2D(envmap, uv);\n" + "}\n" + "#pragma tangram: globals\n" + "\n" + "void main(void) {\n" + "  vec3 color = v_color;\n" + "  #if defined(LIGHTING_ENVIRONMENT)\n" + "  vec3 view_pos = vec3(0., 0., 100. * u_meters_per_pixel);\n" + "  color = e_x_sphericalEnvironmentMap(view_pos, v_position.xyz, v_normal, u_env_map).rgb;\n" + "  #endif\n" + "  \n" + "  #if !defined(LIGHTING_VERTEX) // default to per-pixel lighting\n" + "  vec3 lighting = a_x_lighting(v_position, v_normal, vec3(1.), vec4(0., 0., 150. * u_meters_per_pixel, 1.), vec4(0., 0., 50. * u_meters_per_pixel, 1.), vec3(0.2, 0.7, -0.5), light_ambient);\n" + "  #else\n" + "  vec3 lighting = v_lighting;\n" + "  #endif\n" + "  color *= lighting;\n" + "  #pragma tangram: fragment\n" + "  gl_FragColor = vec4(color, 1.0);\n" + "}\n" + "";
shader_sources['polygon_vertex'] = "\n" + "#define GLSLIFY 1\n" + "\n" + "uniform vec2 u_resolution;\n" + "uniform vec2 u_aspect;\n" + "uniform float u_time;\n" + "uniform float u_map_zoom;\n" + "uniform vec2 u_map_center;\n" + "uniform vec2 u_tile_origin;\n" + "uniform mat4 u_tile_world;\n" + "uniform mat4 u_tile_view;\n" + "uniform float u_meters_per_pixel;\n" + "uniform float u_num_layers;\n" + "attribute vec3 a_position;\n" + "attribute vec3 a_normal;\n" + "attribute vec3 a_color;\n" + "attribute float a_layer;\n" + "varying vec3 v_color;\n" + "varying vec4 v_world_position;\n" + "#if defined(TEXTURE_COORDS)\n" + "\n" + "attribute vec2 a_texcoord;\n" + "varying vec2 v_texcoord;\n" + "#endif\n" + "\n" + "#if defined(WORLD_POSITION_WRAP)\n" + "\n" + "vec2 world_position_anchor = vec2(floor(u_tile_origin / WORLD_POSITION_WRAP) * WORLD_POSITION_WRAP);\n" + "vec4 absoluteWorldPosition() {\n" + "  return vec4(v_world_position.xy + world_position_anchor, v_world_position.z, v_world_position.w);\n" + "}\n" + "#else\n" + "\n" + "vec4 absoluteWorldPosition() {\n" + "  return v_world_position;\n" + "}\n" + "#endif\n" + "\n" + "#if defined(FEATURE_SELECTION)\n" + "\n" + "attribute vec4 a_selection_color;\n" + "varying vec4 v_selection_color;\n" + "#endif\n" + "\n" + "#if !defined(LIGHTING_VERTEX)\n" + "\n" + "varying vec4 v_position;\n" + "varying vec3 v_normal;\n" + "#else\n" + "\n" + "varying vec3 v_lighting;\n" + "#endif\n" + "\n" + "const float light_ambient = 0.5;\n" + "void a_x_reorderLayers(float layer, float num_layers, inout vec4 position) {\n" + "  float layer_order = ((layer + 1.) / (num_layers + 1.)) + 1.;\n" + "  position.z /= layer_order;\n" + "  position.xyw *= layer_order;\n" + "}\n" + "vec3 c_x_pointLight(vec4 position, vec3 normal, vec3 color, vec4 light_pos, float light_ambient, const bool backlight) {\n" + "  vec3 light_dir = normalize(position.xyz - light_pos.xyz);\n" + "  color *= abs(max(float(backlight) * -1., dot(normal, light_dir * -1.0))) + light_ambient;\n" + "  return color;\n" + "}\n" + "vec3 d_x_specularLight(vec4 position, vec3 normal, vec3 color, vec4 light_pos, float light_ambient, const bool backlight) {\n" + "  vec3 light_dir = normalize(position.xyz - light_pos.xyz);\n" + "  vec3 view_pos = vec3(0., 0., 500.);\n" + "  vec3 view_dir = normalize(position.xyz - view_pos.xyz);\n" + "  vec3 specularReflection;\n" + "  if(dot(normal, -light_dir) < 0.0) {\n" + "    specularReflection = vec3(0.0, 0.0, 0.0);\n" + "  } else {\n" + "    float attenuation = 1.0;\n" + "    float lightSpecularTerm = 1.0;\n" + "    float materialSpecularTerm = 10.0;\n" + "    float materialShininessTerm = 10.0;\n" + "    specularReflection = attenuation * vec3(lightSpecularTerm) * vec3(materialSpecularTerm) * pow(max(0.0, dot(reflect(-light_dir, normal), view_dir)), materialShininessTerm);\n" + "  }\n" + "  float diffuse = abs(max(float(backlight) * -1., dot(normal, light_dir * -1.0)));\n" + "  color *= diffuse + specularReflection + light_ambient;\n" + "  return color;\n" + "}\n" + "vec3 e_x_directionalLight(vec3 normal, vec3 color, vec3 light_dir, float light_ambient) {\n" + "  light_dir = normalize(light_dir);\n" + "  color *= dot(normal, light_dir * -1.0) + light_ambient;\n" + "  return color;\n" + "}\n" + "vec3 b_x_lighting(vec4 position, vec3 normal, vec3 color, vec4 light_pos, vec4 night_light_pos, vec3 light_dir, float light_ambient) {\n" + "  \n" + "  #if defined(LIGHTING_POINT)\n" + "  color = c_x_pointLight(position, normal, color, light_pos, light_ambient, true);\n" + "  #elif defined(LIGHTING_POINT_SPECULAR)\n" + "  color = d_x_specularLight(position, normal, color, light_pos, light_ambient, true);\n" + "  #elif defined(LIGHTING_NIGHT)\n" + "  color = c_x_pointLight(position, normal, color, night_light_pos, 0., false);\n" + "  #elif defined(LIGHTING_DIRECTION)\n" + "  color = e_x_directionalLight(normal, color, light_dir, light_ambient);\n" + "  #else\n" + "  color = color;\n" + "  #endif\n" + "  return color;\n" + "}\n" + "#pragma tangram: globals\n" + "\n" + "#pragma tangram: camera\n" + "\n" + "void main() {\n" + "  \n" + "  #if defined(FEATURE_SELECTION)\n" + "  if(a_selection_color.xyz == vec3(0.)) {\n" + "    gl_Position = vec4(0., 0., 0., 1.);\n" + "    return;\n" + "  }\n" + "  v_selection_color = a_selection_color;\n" + "  #endif\n" + "  vec4 position = u_tile_view * vec4(a_position, 1.);\n" + "  #if defined(TEXTURE_COORDS)\n" + "  v_texcoord = a_texcoord;\n" + "  #endif\n" + "  v_world_position = u_tile_world * vec4(a_position, 1.);\n" + "  #if defined(WORLD_POSITION_WRAP)\n" + "  v_world_position.xy -= world_position_anchor;\n" + "  #endif\n" + "  \n" + "  #pragma tangram: vertex\n" + "  \n" + "  #if defined(LIGHTING_VERTEX)\n" + "  v_color = a_color;\n" + "  v_lighting = b_x_lighting(position, a_normal, vec3(1.), vec4(0., 0., 150. * u_meters_per_pixel, 1.), vec4(0., 0., 50. * u_meters_per_pixel, 1.), vec3(0.2, 0.7, -0.5), light_ambient);\n" + "  #else\n" + "  v_position = position;\n" + "  v_normal = a_normal;\n" + "  v_color = a_color;\n" + "  #endif\n" + "  cameraProjection(position);\n" + "  a_x_reorderLayers(a_layer, u_num_layers, position);\n" + "  gl_Position = position;\n" + "}\n" + "";
shader_sources['selection_fragment'] = "\n" + "#define GLSLIFY 1\n" + "\n" + "#if defined(FEATURE_SELECTION)\n" + "\n" + "varying vec4 v_selection_color;\n" + "#endif\n" + "\n" + "void main(void) {\n" + "  \n" + "  #if defined(FEATURE_SELECTION)\n" + "  gl_FragColor = v_selection_color;\n" + "  #else\n" + "  gl_FragColor = vec4(0., 0., 0., 1.);\n" + "  #endif\n" + "  \n" + "}\n" + "";
shader_sources['simple_polygon_fragment'] = "\n" + "#define GLSLIFY 1\n" + "\n" + "uniform float u_meters_per_pixel;\n" + "varying vec3 v_color;\n" + "#if !defined(LIGHTING_VERTEX)\n" + "\n" + "varying vec4 v_position;\n" + "varying vec3 v_normal;\n" + "#endif\n" + "\n" + "vec3 a_x_pointLight(vec4 position, vec3 normal, vec3 color, vec4 light_pos, float light_ambient, const bool backlight) {\n" + "  vec3 light_dir = normalize(position.xyz - light_pos.xyz);\n" + "  color *= abs(max(float(backlight) * -1., dot(normal, light_dir * -1.0))) + light_ambient;\n" + "  return color;\n" + "}\n" + "#pragma tangram: globals\n" + "\n" + "void main(void) {\n" + "  vec3 color;\n" + "  #if !defined(LIGHTING_VERTEX) // default to per-pixel lighting\n" + "  vec4 light_pos = vec4(0., 0., 150. * u_meters_per_pixel, 1.);\n" + "  const float light_ambient = 0.5;\n" + "  const bool backlit = true;\n" + "  color = a_x_pointLight(v_position, v_normal, v_color, light_pos, light_ambient, backlit);\n" + "  #else\n" + "  color = v_color;\n" + "  #endif\n" + "  \n" + "  #pragma tangram: fragment\n" + "  gl_FragColor = vec4(color, 1.0);\n" + "}\n" + "";
shader_sources['simple_polygon_vertex'] = "\n" + "#define GLSLIFY 1\n" + "\n" + "uniform vec2 u_aspect;\n" + "uniform mat4 u_tile_view;\n" + "uniform mat4 u_meter_view;\n" + "uniform float u_meters_per_pixel;\n" + "uniform float u_num_layers;\n" + "attribute vec3 a_position;\n" + "attribute vec3 a_normal;\n" + "attribute vec3 a_color;\n" + "attribute float a_layer;\n" + "varying vec3 v_color;\n" + "#if !defined(LIGHTING_VERTEX)\n" + "\n" + "varying vec4 v_position;\n" + "varying vec3 v_normal;\n" + "#endif\n" + "\n" + "vec4 a_x_perspective(vec4 position, const vec2 perspective_offset, const vec2 perspective_factor) {\n" + "  position.xy += position.z * perspective_factor * (position.xy - perspective_offset);\n" + "  return position;\n" + "}\n" + "vec4 b_x_isometric(vec4 position, const vec2 axis, const float multiplier) {\n" + "  position.xy += position.z * axis * multiplier / u_aspect;\n" + "  return position;\n" + "}\n" + "float c_x_calculateZ(float z, float layer, const float num_layers, const float z_layer_scale) {\n" + "  float z_layer_range = (num_layers + 1.) * z_layer_scale;\n" + "  float z_layer = (layer + 1.) * z_layer_scale;\n" + "  z = z_layer + clamp(z, 0., z_layer_scale);\n" + "  z = (z_layer_range - z) / z_layer_range;\n" + "  return z;\n" + "}\n" + "vec3 d_x_pointLight(vec4 position, vec3 normal, vec3 color, vec4 light_pos, float light_ambient, const bool backlight) {\n" + "  vec3 light_dir = normalize(position.xyz - light_pos.xyz);\n" + "  color *= abs(max(float(backlight) * -1., dot(normal, light_dir * -1.0))) + light_ambient;\n" + "  return color;\n" + "}\n" + "#pragma tangram: globals\n" + "\n" + "void main() {\n" + "  vec4 position = u_tile_view * vec4(a_position, 1.);\n" + "  #pragma tangram: vertex\n" + "  \n" + "  #if defined(LIGHTING_VERTEX)\n" + "  vec4 light_pos = vec4(0., 0., 150. * u_meters_per_pixel, 1.);\n" + "  const float light_ambient = 0.5;\n" + "  const bool backlit = true;\n" + "  v_color = d_x_pointLight(position, a_normal, a_color, light_pos, light_ambient, backlit);\n" + "  #else\n" + "  v_position = position;\n" + "  v_normal = a_normal;\n" + "  v_color = a_color;\n" + "  #endif\n" + "  position = u_meter_view * position;\n" + "  #if defined(PROJECTION_PERSPECTIVE)\n" + "  position = a_x_perspective(position, vec2(-0.25, -0.25), vec2(0.6, 0.6));\n" + "  #elif defined(PROJECTION_ISOMETRIC)\n" + "  position = b_x_isometric(position, vec2(0., 1.), 1.);\n" + "  #endif\n" + "  position.z = c_x_calculateZ(position.z, a_layer, u_num_layers, 4096.);\n" + "  gl_Position = position;\n" + "}\n" + "";
module.exports = shader_sources;


},{}],55:[function(require,module,exports){
"use strict";
Object.defineProperties(exports, {
  default: {get: function() {
      return $__default;
    }},
  __esModule: {value: true}
});
var $___46__46__47_utils__,
    $__loglevel__;
var Utils = ($___46__46__47_utils__ = require("../utils"), $___46__46__47_utils__ && $___46__46__47_utils__.__esModule && $___46__46__47_utils__ || {default: $___46__46__47_utils__}).default;
var log = ($__loglevel__ = require("loglevel"), $__loglevel__ && $__loglevel__.__esModule && $__loglevel__ || {default: $__loglevel__}).default;
GLTexture.textures = {};
function GLTexture(gl, name) {
  var options = arguments[2] !== (void 0) ? arguments[2] : {};
  this.gl = gl;
  this.texture = gl.createTexture();
  if (this.texture) {
    this.valid = true;
  }
  this.bind(0);
  this.image = null;
  this.setData(1, 1, new Uint8Array([0, 0, 0, 255]), {filtering: 'nearest'});
  this.name = name;
  GLTexture.textures[this.name] = this;
}
var $__default = GLTexture;
GLTexture.prototype.destroy = function() {
  if (!this.valid) {
    return;
  }
  this.gl.deleteTexture(this.texture);
  this.texture = null;
  delete this.data;
  this.data = null;
  delete GLTexture.textures[this.name];
  this.valid = false;
};
GLTexture.destroy = function(gl) {
  var textures = Object.keys(GLTexture.textures);
  for (var $__3 = textures[Symbol.iterator](),
      $__4; !($__4 = $__3.next()).done; ) {
    var t = $__4.value;
    {
      var texture = GLTexture.textures[t];
      if (texture.gl === gl) {
        log.trace(("destroying GLTexture " + texture.name));
        texture.destroy();
      }
    }
  }
};
GLTexture.prototype.bind = function(unit) {
  if (!this.valid) {
    return;
  }
  this.gl.activeTexture(this.gl.TEXTURE0 + unit);
  this.gl.bindTexture(this.gl.TEXTURE_2D, this.texture);
};
GLTexture.prototype.load = function(url) {
  var options = arguments[1] !== (void 0) ? arguments[1] : {};
  var $__2 = this;
  if (!this.valid) {
    return;
  }
  this.image = new Image();
  this.image.onload = (function() {
    $__2.width = $__2.image.width;
    $__2.height = $__2.image.height;
    $__2.data = null;
    $__2.update(options);
    $__2.setTextureFiltering(options);
  });
  this.image.src = url;
};
GLTexture.prototype.setData = function(width, height, data) {
  var options = arguments[3] !== (void 0) ? arguments[3] : {};
  this.width = width;
  this.height = height;
  this.data = data;
  this.image = null;
  this.update(options);
  this.setTextureFiltering(options);
};
GLTexture.prototype.update = function() {
  var options = arguments[0] !== (void 0) ? arguments[0] : {};
  if (!this.valid) {
    return;
  }
  this.bind(0);
  this.gl.pixelStorei(this.gl.UNPACK_FLIP_Y_WEBGL, (options.UNPACK_FLIP_Y_WEBGL === false ? false : true));
  if (this.image && this.image.complete) {
    this.gl.texImage2D(this.gl.TEXTURE_2D, 0, this.gl.RGBA, this.gl.RGBA, this.gl.UNSIGNED_BYTE, this.image);
  } else if (this.width && this.height) {
    this.gl.texImage2D(this.gl.TEXTURE_2D, 0, this.gl.RGBA, this.width, this.height, 0, this.gl.RGBA, this.gl.UNSIGNED_BYTE, this.data);
  }
};
GLTexture.prototype.setTextureFiltering = function() {
  var options = arguments[0] !== (void 0) ? arguments[0] : {};
  if (!this.valid) {
    return;
  }
  options.filtering = options.filtering || 'mipmap';
  var gl = this.gl;
  if (Utils.isPowerOf2(this.width) && Utils.isPowerOf2(this.height)) {
    this.power_of_2 = true;
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, options.TEXTURE_WRAP_S || gl.CLAMP_TO_EDGE);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, options.TEXTURE_WRAP_T || gl.CLAMP_TO_EDGE);
    if (options.filtering === 'mipmap') {
      log.trace('power-of-2 MIPMAP');
      this.filtering = 'mipmap';
      gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR_MIPMAP_NEAREST);
      gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR);
      gl.generateMipmap(gl.TEXTURE_2D);
    } else if (options.filtering === 'linear') {
      log.trace('power-of-2 LINEAR');
      this.filtering = 'linear';
      gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);
      gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR);
    } else if (options.filtering === 'nearest') {
      log.trace('power-of-2 NEAREST');
      this.filtering = 'nearest';
      gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.NEAREST);
      gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.NEAREST);
    }
  } else {
    this.power_of_2 = false;
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
    if (options.filtering === 'nearest') {
      log.trace('power-of-2 NEAREST');
      this.filtering = 'nearest';
      gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.NEAREST);
      gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.NEAREST);
    } else {
      log.trace('power-of-2 LINEAR');
      this.filtering = 'linear';
      gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);
      gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR);
    }
  }
};


},{"../utils":62,"loglevel":37}],56:[function(require,module,exports){
"use strict";
var $__3;
Object.defineProperties(exports, {
  default: {get: function() {
      return $__default;
    }},
  GLVertexData: {get: function() {
      return GLVertexData;
    }},
  __esModule: {value: true}
});
var $__gl_95_constants__,
    $__loglevel__;
var gl = ($__gl_95_constants__ = require("./gl_constants"), $__gl_95_constants__ && $__gl_95_constants__.__esModule && $__gl_95_constants__ || {default: $__gl_95_constants__}).default;
var log = ($__loglevel__ = require("loglevel"), $__loglevel__ && $__loglevel__.__esModule && $__loglevel__ || {default: $__loglevel__}).default;
var GLVertexLayout = function GLVertexLayout(attribs) {
  this.attribs = attribs;
  this.components = [];
  this.index = {};
  this.stride = 0;
  var count = 0;
  for (var $__4 = this.attribs[Symbol.iterator](),
      $__5; !($__5 = $__4.next()).done; ) {
    var attrib = $__5.value;
    {
      attrib.offset = this.stride;
      attrib.byte_size = attrib.size;
      var shift = 0;
      switch (attrib.type) {
        case gl.FLOAT:
        case gl.INT:
        case gl.UNSIGNED_INT:
          attrib.byte_size *= 4;
          shift = 2;
          break;
        case gl.SHORT:
        case gl.UNSIGNED_SHORT:
          attrib.byte_size *= 2;
          shift = 1;
          break;
      }
      this.stride += attrib.byte_size;
      if (this.stride & 3) {
        this.stride += 4 - (this.stride & 3);
      }
      var offset_typed = attrib.offset >> shift;
      if (attrib.size > 1) {
        for (var a = 0; a < attrib.size; a++) {
          this.components.push([attrib.type, null, shift, offset_typed++]);
        }
      } else {
        this.components.push([attrib.type, null, shift, offset_typed]);
      }
      this.index[attrib.name] = count;
      count += attrib.size;
    }
  }
};
var $GLVertexLayout = GLVertexLayout;
($traceurRuntime.createClass)(GLVertexLayout, {
  enable: function(gl, program) {
    for (var a = 0; a < this.attribs.length; a++) {
      var attrib = this.attribs[a];
      var location = program.attribute(attrib.name).location;
      if (location !== -1) {
        gl.enableVertexAttribArray(location);
        gl.vertexAttribPointer(location, attrib.size, attrib.type, attrib.normalized, this.stride, attrib.offset);
        $GLVertexLayout.enabled_attribs[location] = program;
      }
    }
    var unused_attribs = [];
    for (location in $GLVertexLayout.enabled_attribs) {
      if ($GLVertexLayout.enabled_attribs[location] !== program) {
        gl.disableVertexAttribArray(location);
        unused_attribs.push(location);
      }
    }
    for (location in unused_attribs) {
      delete $GLVertexLayout.enabled_attribs[location];
    }
  },
  createVertexData: function() {
    return new GLVertexData(this);
  }
}, {});
var $__default = GLVertexLayout;
GLVertexLayout.enabled_attribs = {};
var GLVertexData = function GLVertexData(vertex_layout) {
  this.vertex_layout = vertex_layout;
  this.block_size = 50000;
  this.block_num = 1;
  this.buffer_offset = 0;
  this.buffer = new ArrayBuffer(this.vertex_layout.stride * this.block_size * this.block_num);
  this.components = [];
  for (var $__4 = this.vertex_layout.components[Symbol.iterator](),
      $__5; !($__5 = $__4.next()).done; ) {
    var component = $__5.value;
    {
      this.components.push($traceurRuntime.spread(component));
    }
  }
  this.vertex_count = 0;
  this.setBufferViews();
};
($traceurRuntime.createClass)(GLVertexData, {
  setBufferViews: function() {
    this.buffer_views = {};
    for (var $__4 = this.vertex_layout.attribs[Symbol.iterator](),
        $__5; !($__5 = $__4.next()).done; ) {
      var attrib = $__5.value;
      {
        if (this.buffer_views[attrib.type] == null) {
          var array_type = this.array_types[attrib.type];
          this.buffer_views[attrib.type] = new array_type(this.buffer);
        }
      }
    }
    for (var $__6 = this.components[Symbol.iterator](),
        $__7; !($__7 = $__6.next()).done; ) {
      var component = $__7.value;
      {
        component[1] = this.buffer_views[component[0]];
      }
    }
  },
  checkBufferSize: function() {
    if ((this.buffer_offset + this.vertex_layout.stride) > this.buffer.byteLength) {
      this.block_num++;
      var new_block = new ArrayBuffer(this.vertex_layout.stride * this.block_size * this.block_num);
      var new_view = new Uint8Array(new_block);
      new_view.set(new Uint8Array(this.buffer));
      this.buffer = new_block;
      this.setBufferViews();
      log.info(("GLVertexData: expanded vertex block to " + this.block_size * this.block_num + " vertices"));
    }
  },
  addVertex: function(vertex) {
    this.checkBufferSize();
    var i = 0;
    var clen = this.components.length;
    for (var c = 0; c < clen; c++) {
      var component = this.components[c];
      component[1][(this.buffer_offset >> component[2]) + component[3]] = vertex[i++];
    }
    this.buffer_offset += this.vertex_layout.stride;
    this.vertex_count++;
  },
  end: function() {
    if (this.buffer_offset < this.buffer.byteLength) {
      var new_block = new ArrayBuffer(this.buffer_offset);
      var new_view = new Uint8Array(new_block);
      new_view.set(new Uint8Array(this.buffer, 0, this.buffer_offset));
      this.buffer = new_block;
    }
    return this;
  }
}, {});
GLVertexData.prototype.array_types = ($__3 = {}, Object.defineProperty($__3, gl.FLOAT, {
  value: Float32Array,
  configurable: true,
  enumerable: true,
  writable: true
}), Object.defineProperty($__3, gl.BYTE, {
  value: Int8Array,
  configurable: true,
  enumerable: true,
  writable: true
}), Object.defineProperty($__3, gl.UNSIGNED_BYTE, {
  value: Uint8Array,
  configurable: true,
  enumerable: true,
  writable: true
}), Object.defineProperty($__3, gl.INT, {
  value: Int32Array,
  configurable: true,
  enumerable: true,
  writable: true
}), Object.defineProperty($__3, gl.UNSIGNED_INT, {
  value: Uint32Array,
  configurable: true,
  enumerable: true,
  writable: true
}), Object.defineProperty($__3, gl.SHORT, {
  value: Int16Array,
  configurable: true,
  enumerable: true,
  writable: true
}), Object.defineProperty($__3, gl.UNSIGNED_SHORT, {
  value: Uint16Array,
  configurable: true,
  enumerable: true,
  writable: true
}), $__3);


},{"./gl_constants":50,"loglevel":37}],57:[function(require,module,exports){
"use strict";
Object.defineProperties(exports, {
  default: {get: function() {
      return $__default;
    }},
  __esModule: {value: true}
});
var $__geo__,
    $__utils__,
    $__worker_95_broker__,
    $__style__,
    $__gl_47_gl__,
    $__gl_47_gl_95_builders__,
    $__gl_47_gl_95_program__,
    $__gl_47_gl_95_texture__,
    $__gl_47_gl_95_modes__,
    $__camera__,
    $__js_45_yaml__,
    $__tile__,
    $__tile_95_source__,
    $__loglevel__,
    $__gl_45_matrix__;
var Geo = ($__geo__ = require("./geo"), $__geo__ && $__geo__.__esModule && $__geo__ || {default: $__geo__}).Geo;
var Utils = ($__utils__ = require("./utils"), $__utils__ && $__utils__.__esModule && $__utils__ || {default: $__utils__}).default;
var WorkerBroker = ($__worker_95_broker__ = require("./worker_broker"), $__worker_95_broker__ && $__worker_95_broker__.__esModule && $__worker_95_broker__ || {default: $__worker_95_broker__}).default;
var Style = ($__style__ = require("./style"), $__style__ && $__style__.__esModule && $__style__ || {default: $__style__}).Style;
var GL = ($__gl_47_gl__ = require("./gl/gl"), $__gl_47_gl__ && $__gl_47_gl__.__esModule && $__gl_47_gl__ || {default: $__gl_47_gl__}).GL;
var GLBuilders = ($__gl_47_gl_95_builders__ = require("./gl/gl_builders"), $__gl_47_gl_95_builders__ && $__gl_47_gl_95_builders__.__esModule && $__gl_47_gl_95_builders__ || {default: $__gl_47_gl_95_builders__}).GLBuilders;
var GLProgram = ($__gl_47_gl_95_program__ = require("./gl/gl_program"), $__gl_47_gl_95_program__ && $__gl_47_gl_95_program__.__esModule && $__gl_47_gl_95_program__ || {default: $__gl_47_gl_95_program__}).default;
var GLTexture = ($__gl_47_gl_95_texture__ = require("./gl/gl_texture"), $__gl_47_gl_95_texture__ && $__gl_47_gl_95_texture__.__esModule && $__gl_47_gl_95_texture__ || {default: $__gl_47_gl_95_texture__}).default;
var ModeManager = ($__gl_47_gl_95_modes__ = require("./gl/gl_modes"), $__gl_47_gl_95_modes__ && $__gl_47_gl_95_modes__.__esModule && $__gl_47_gl_95_modes__ || {default: $__gl_47_gl_95_modes__}).ModeManager;
var Camera = ($__camera__ = require("./camera"), $__camera__ && $__camera__.__esModule && $__camera__ || {default: $__camera__}).default;
var yaml = ($__js_45_yaml__ = require("js-yaml"), $__js_45_yaml__ && $__js_45_yaml__.__esModule && $__js_45_yaml__ || {default: $__js_45_yaml__}).default;
var Tile = ($__tile__ = require("./tile"), $__tile__ && $__tile__.__esModule && $__tile__ || {default: $__tile__}).default;
var TileSource = ($__tile_95_source__ = require("./tile_source"), $__tile_95_source__ && $__tile_95_source__.__esModule && $__tile_95_source__ || {default: $__tile_95_source__}).default;
var log = ($__loglevel__ = require("loglevel"), $__loglevel__ && $__loglevel__.__esModule && $__loglevel__ || {default: $__loglevel__}).default;
var glMatrix = ($__gl_45_matrix__ = require("gl-matrix"), $__gl_45_matrix__ && $__gl_45_matrix__.__esModule && $__gl_45_matrix__ || {default: $__gl_45_matrix__}).default;
var mat4 = glMatrix.mat4;
var vec3 = glMatrix.vec3;
Utils.inMainThread((function() {
  findBaseLibraryURL();
  Utils.requestAnimationFramePolyfill();
}));
Scene.tile_scale = 4096;
Geo.setTileScale(Scene.tile_scale);
GLBuilders.setTileScale(Scene.tile_scale);
GLProgram.defines.TILE_SCALE = Scene.tile_scale;
function Scene(tile_source, layer_source, style_source, options) {
  options = options || {};
  this.initialized = false;
  this.tile_source = tile_source;
  this.tiles = {};
  this.queued_tiles = [];
  this.num_workers = options.numWorkers || 2;
  this.allow_cross_domain_workers = (options.allowCrossDomainWorkers === false ? false : true);
  this.layer_source = layer_source;
  this.style_source = style_source;
  this.layers = null;
  this.styles = null;
  this.building = null;
  this.dirty = true;
  this.animated = false;
  this.preRender = options.preRender;
  this.postRender = options.postRender;
  this.render_loop = !options.disableRenderLoop;
  this.frame = 0;
  this.zoom = null;
  this.center = null;
  this.device_pixel_ratio = window.devicePixelRatio || 1;
  this.zooming = false;
  this.panning = false;
  this.logLevel = options.logLevel || 'debug';
  log.setLevel(this.logLevel);
  this.container = options.container;
  this.resetTime();
}
var $__default = Scene;
Scene.create = function($__23) {
  var $__24 = $__23,
      tile_source = $__24.tile_source,
      layers = $__24.layers,
      styles = $__24.styles;
  var options = arguments[1] !== (void 0) ? arguments[1] : {};
  if (!(tile_source instanceof TileSource)) {
    tile_source = TileSource.create(tile_source);
  }
  return new Scene(tile_source, layers, styles, options);
};
Scene.prototype.init = function(callback) {
  var $__15 = this;
  if (this.initialized) {
    return false;
  }
  this.initializing = true;
  this.loadScene().then((function() {
    Promise.all([new Promise((function(resolve, reject) {
      $__15.modes = Scene.createModes($__15.styles.modes);
      $__15.updateActiveModes();
      resolve();
    })), $__15.createWorkers()]).then((function(resolve, reject) {
      $__15.container = $__15.container || document.body;
      $__15.canvas = document.createElement('canvas');
      $__15.canvas.style.position = 'absolute';
      $__15.canvas.style.top = 0;
      $__15.canvas.style.left = 0;
      $__15.canvas.style.zIndex = -1;
      $__15.container.appendChild($__15.canvas);
      $__15.gl = GL.getContext($__15.canvas);
      $__15.resizeMap($__15.container.clientWidth, $__15.container.clientHeight);
      $__15.last_render_count = null;
      $__15.initInputHandlers();
      $__15.createCamera();
      $__15.createLighting();
      $__15.initSelectionBuffer();
      for (var $__16 = Utils.values($__15.modes)[Symbol.iterator](),
          $__17; !($__17 = $__16.next()).done; ) {
        var mode = $__17.value;
        {
          mode.setGL($__15.gl);
        }
      }
      $__15.updateModes((function() {
        $__15.initializing = false;
        $__15.initialized = true;
        if (typeof callback === 'function') {
          callback();
        }
      }));
      if ($__15.render_loop !== false) {
        $__15.setupRenderLoop();
      }
    }), (function(error) {
      throw error;
    }));
  }));
};
Scene.prototype.destroy = function() {
  this.initialized = false;
  this.renderLoop = (function() {});
  if (this.canvas && this.canvas.parentNode) {
    this.canvas.parentNode.removeChild(this.canvas);
    this.canvas = null;
  }
  this.container = null;
  if (this.gl) {
    this.gl.deleteFramebuffer(this.fbo);
    this.fbo = null;
    GLTexture.destroy(this.gl);
    ModeManager.destroy(this.gl);
    this.modes = {};
    this.gl = null;
  }
  if (Array.isArray(this.workers)) {
    this.workers.forEach((function(worker) {
      worker.terminate();
    }));
    this.workers = null;
  }
  this.tiles = {};
};
Scene.prototype.initSelectionBuffer = function() {
  this.pixel = new Uint8Array(4);
  this.pixel32 = new Float32Array(this.pixel.buffer);
  this.selection_requests = {};
  this.selected_feature = null;
  this.selection_callback_timer = null;
  this.selection_frame_delay = 5;
  this.fbo = this.gl.createFramebuffer();
  this.gl.bindFramebuffer(this.gl.FRAMEBUFFER, this.fbo);
  this.fbo_size = {
    width: 256,
    height: 256
  };
  this.fbo_size.aspect = this.fbo_size.width / this.fbo_size.height;
  this.gl.viewport(0, 0, this.fbo_size.width, this.fbo_size.height);
  var fbo_texture = new GLTexture(this.gl, 'selection_fbo');
  fbo_texture.setData(this.fbo_size.width, this.fbo_size.height, null, {filtering: 'nearest'});
  this.gl.framebufferTexture2D(this.gl.FRAMEBUFFER, this.gl.COLOR_ATTACHMENT0, this.gl.TEXTURE_2D, fbo_texture.texture, 0);
  var fbo_depth_rb = this.gl.createRenderbuffer();
  this.gl.bindRenderbuffer(this.gl.RENDERBUFFER, fbo_depth_rb);
  this.gl.renderbufferStorage(this.gl.RENDERBUFFER, this.gl.DEPTH_COMPONENT16, this.fbo_size.width, this.fbo_size.height);
  this.gl.framebufferRenderbuffer(this.gl.FRAMEBUFFER, this.gl.DEPTH_ATTACHMENT, this.gl.RENDERBUFFER, fbo_depth_rb);
  this.gl.bindFramebuffer(this.gl.FRAMEBUFFER, null);
  this.gl.viewport(0, 0, this.canvas.width, this.canvas.height);
};
Scene.prototype.createObjectURL = function() {
  return (window.URL && window.URL.createObjectURL) || (window.webkitURL && window.webkitURL.createObjectURL);
};
Scene.prototype.buildWorkerUrl = function() {
  return (Scene.library_base_url + "tangram-worker." + Scene.library_type + ".js?" + +new Date());
};
Scene.prototype.createWorkers = function() {
  var $__15 = this;
  return new Promise((function(resolve, reject) {
    var worker_url = $__15.buildWorkerUrl(),
        createObjectURL = $__15.createObjectURL();
    if (createObjectURL && $__15.allow_cross_domain_workers) {
      Utils.io(worker_url).then((function(body) {
        var worker_local_url = createObjectURL(new Blob([body], {type: 'application/javascript'}));
        $__15.makeWorkers(worker_local_url);
        $__15.initWorkerEvents();
        resolve();
      }), reject);
    } else {
      $__15.makeWorkers(worker_url);
      $__15.initWorkerEvents();
      resolve();
    }
  }));
};
Scene.prototype.initWorkerEvents = function() {
  var $__15 = this;
  this.workers.forEach((function(worker) {
    worker.addEventListener('message', $__15.workerLogMessage.bind($__15));
  }));
  this.next_worker = 0;
  this.selection_map_worker_size = {};
};
Scene.prototype.makeWorkers = function(url) {
  this.workers = [];
  for (var id = 0; id < this.num_workers; id++) {
    var worker = new Worker(url);
    this.workers[id] = worker;
    WorkerBroker.addWorker(worker);
    WorkerBroker.postMessage(worker, 'init', {worker_id: id});
  }
};
Scene.prototype.nextWorker = function() {
  var worker = this.workers[this.next_worker];
  this.next_worker = (this.next_worker + 1) % this.workers.length;
  return worker;
};
Scene.prototype.setCenter = function(lng, lat, zoom) {
  this.center = {
    lng: lng,
    lat: lat
  };
  if (zoom) {
    this.setZoom(zoom);
  }
  this.updateBounds();
};
Scene.prototype.startZoom = function() {
  this.last_zoom = this.zoom;
  this.zooming = true;
};
Scene.prototype.preserve_tiles_within_zoom = 2;
Scene.prototype.setZoom = function(zoom) {
  var below = zoom;
  var above = zoom;
  if (this.last_zoom != null) {
    log.trace(("scene.last_zoom: " + this.last_zoom));
    if (Math.abs(zoom - this.last_zoom) <= this.preserve_tiles_within_zoom) {
      if (zoom > this.last_zoom) {
        below = zoom - this.preserve_tiles_within_zoom;
      } else {
        above = zoom + this.preserve_tiles_within_zoom;
      }
    }
  }
  this.last_zoom = this.zoom;
  this.zoom = zoom;
  this.capped_zoom = Math.min(~~this.zoom, this.tile_source.max_zoom || ~~this.zoom);
  this.zooming = false;
  this.updateBounds();
  this.removeTilesOutsideZoomRange(below, above);
};
Scene.prototype.viewReady = function() {
  if (this.css_size == null || this.center == null || this.zoom == null) {
    return false;
  }
  return true;
};
Scene.prototype.updateBounds = function() {
  if (!this.viewReady()) {
    return;
  }
  this.meters_per_pixel = Geo.metersPerPixel(this.zoom);
  this.meter_zoom = {
    x: this.css_size.width / 2 * this.meters_per_pixel,
    y: this.css_size.height / 2 * this.meters_per_pixel
  };
  var $__23 = Geo.latLngToMeters([this.center.lng, this.center.lat]),
      x = $__23[0],
      y = $__23[1];
  this.center_meters = {
    x: x,
    y: y
  };
  this.bounds_meters = {
    sw: {
      x: this.center_meters.x - this.meter_zoom.x,
      y: this.center_meters.y - this.meter_zoom.y
    },
    ne: {
      x: this.center_meters.x + this.meter_zoom.x,
      y: this.center_meters.y + this.meter_zoom.y
    }
  };
  var buffer = 200 * this.meters_per_pixel;
  this.bounds_meters_buffered = {
    sw: {
      x: this.bounds_meters.sw.x - buffer,
      y: this.bounds_meters.sw.y - buffer
    },
    ne: {
      x: this.bounds_meters.ne.x + buffer,
      y: this.bounds_meters.ne.y + buffer
    }
  };
  for (var $__16 = Utils.values(this.tiles)[Symbol.iterator](),
      $__17; !($__17 = $__16.next()).done; ) {
    var tile = $__17.value;
    {
      tile.updateVisibility(this);
    }
  }
  this.dirty = true;
};
Scene.prototype.removeTilesOutsideZoomRange = function(below, above) {
  below = Math.min(below, this.tile_source.max_zoom || below);
  above = Math.min(above, this.tile_source.max_zoom || above);
  var remove_tiles = [];
  for (var t in this.tiles) {
    var tile = this.tiles[t];
    if (tile.coords.z < below || tile.coords.z > above) {
      remove_tiles.push(t);
    }
  }
  for (var r = 0; r < remove_tiles.length; r++) {
    var key = remove_tiles[r];
    log.debug(("removed " + key + " (outside range [" + below + ", " + above + "])"));
    this.removeTile(key);
  }
};
Scene.prototype.resizeMap = function(width, height) {
  this.dirty = true;
  this.css_size = {
    width: width,
    height: height
  };
  this.device_size = {
    width: Math.round(this.css_size.width * this.device_pixel_ratio),
    height: Math.round(this.css_size.height * this.device_pixel_ratio)
  };
  this.view_aspect = this.css_size.width / this.css_size.height;
  this.updateBounds();
  this.canvas.style.width = this.css_size.width + 'px';
  this.canvas.style.height = this.css_size.height + 'px';
  this.canvas.width = this.device_size.width;
  this.canvas.height = this.device_size.height;
  this.gl.bindFramebuffer(this.gl.FRAMEBUFFER, null);
  this.gl.viewport(0, 0, this.canvas.width, this.canvas.height);
};
Scene.prototype.requestRedraw = function() {
  this.dirty = true;
};
Scene.calculateZ = function(layer, tile, layer_offset, feature_offset) {
  var z = 0;
  return z;
};
Scene.prototype.setupRenderLoop = function() {
  var $__23 = arguments[0] !== (void 0) ? arguments[0] : {},
      pre_render = $__23.pre_render,
      post_render = $__23.post_render;
  var $__15 = this;
  this.renderLoop = (function() {
    if ($__15.initialized) {
      if (typeof $__15.preRender === 'function') {
        $__15.preRender();
      }
      $__15.render();
      if (typeof $__15.postRender === 'function') {
        $__15.postRender();
      }
    }
    window.requestAnimationFrame($__15.renderLoop);
  });
  setTimeout((function() {
    $__15.renderLoop();
  }), 0);
};
Scene.prototype.render = function() {
  this.loadQueuedTiles();
  if (this.dirty === false || this.initialized === false || this.viewReady() === false) {
    return false;
  }
  this.dirty = false;
  this.renderGL();
  if (this.animated === true) {
    this.dirty = true;
  }
  this.frame++;
  log.trace('Scene.render()');
  return true;
};
Scene.prototype.resetFrame = function() {
  if (!this.initialized) {
    return;
  }
  var gl = this.gl;
  gl.clearColor(0.0, 0.0, 0.0, 1.0);
  gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);
  gl.enable(gl.DEPTH_TEST);
  gl.depthFunc(gl.LESS);
  gl.enable(gl.CULL_FACE);
  gl.cullFace(gl.BACK);
};
Scene.prototype.renderGL = function() {
  var $__15 = this;
  var gl = this.gl;
  this.input();
  this.resetFrame();
  if (!this.center) {
    return;
  }
  var $__23 = Geo.latLngToMeters([this.center.lng, this.center.lat]),
      x = $__23[0],
      y = $__23[1];
  var center = {
    x: x,
    y: y
  };
  var tile_view_mat = mat4.create();
  var tile_world_mat = mat4.create();
  this.camera.update();
  var renderable_tiles = [];
  for (var t in this.tiles) {
    var tile = this.tiles[t];
    if (tile.loaded === true && tile.visible === true) {
      renderable_tiles.push(tile);
    }
  }
  this.renderable_tiles_count = renderable_tiles.length;
  var render_count = 0;
  for (var mode in this.modes) {
    this.modes[mode].update();
    var gl_program = this.modes[mode].gl_program;
    if (gl_program == null || gl_program.compiled === false) {
      continue;
    }
    var first_for_mode = true;
    for (t in renderable_tiles) {
      tile = renderable_tiles[t];
      if (tile.gl_geometry[mode] != null) {
        if (first_for_mode === true) {
          first_for_mode = false;
          gl_program.use();
          this.modes[mode].setUniforms();
          gl_program.uniform('2f', 'u_resolution', this.device_size.width, this.device_size.height);
          gl_program.uniform('2f', 'u_aspect', this.view_aspect, 1.0);
          gl_program.uniform('1f', 'u_time', ((+new Date()) - this.start_time) / 1000);
          gl_program.uniform('1f', 'u_map_zoom', this.zoom);
          gl_program.uniform('2f', 'u_map_center', center.x, center.y);
          gl_program.uniform('1f', 'u_num_layers', this.layers.length);
          gl_program.uniform('1f', 'u_meters_per_pixel', this.meters_per_pixel);
          this.camera.setupProgram(gl_program);
        }
        gl_program.uniform('2f', 'u_tile_origin', tile.min.x, tile.min.y);
        mat4.identity(tile_view_mat);
        mat4.translate(tile_view_mat, tile_view_mat, vec3.fromValues(tile.min.x - center.x, tile.min.y - center.y, 0));
        mat4.scale(tile_view_mat, tile_view_mat, vec3.fromValues(tile.span.x / Scene.tile_scale, -1 * tile.span.y / Scene.tile_scale, 1));
        gl_program.uniform('Matrix4fv', 'u_tile_view', false, tile_view_mat);
        mat4.identity(tile_world_mat);
        mat4.translate(tile_world_mat, tile_world_mat, vec3.fromValues(tile.min.x, tile.min.y, 0));
        mat4.scale(tile_world_mat, tile_world_mat, vec3.fromValues(tile.span.x / Scene.tile_scale, -1 * tile.span.y / Scene.tile_scale, 1));
        gl_program.uniform('Matrix4fv', 'u_tile_world', false, tile_world_mat);
        tile.gl_geometry[mode].render();
        render_count += tile.gl_geometry[mode].geometry_count;
      }
    }
  }
  if (Object.keys(this.selection_requests).length > 0) {
    if (this.panning) {
      return;
    }
    gl.bindFramebuffer(gl.FRAMEBUFFER, this.fbo);
    gl.viewport(0, 0, this.fbo_size.width, this.fbo_size.height);
    this.resetFrame();
    for (mode in this.modes) {
      gl_program = this.modes[mode].selection_gl_program;
      if (gl_program == null || gl_program.compiled === false) {
        continue;
      }
      first_for_mode = true;
      for (t in renderable_tiles) {
        tile = renderable_tiles[t];
        if (tile.gl_geometry[mode] != null) {
          if (first_for_mode === true) {
            first_for_mode = false;
            gl_program.use();
            this.modes[mode].setUniforms();
            gl_program.uniform('2f', 'u_resolution', this.fbo_size.width, this.fbo_size.height);
            gl_program.uniform('2f', 'u_aspect', this.fbo_size.aspect, 1.0);
            gl_program.uniform('1f', 'u_time', ((+new Date()) - this.start_time) / 1000);
            gl_program.uniform('1f', 'u_map_zoom', this.zoom);
            gl_program.uniform('2f', 'u_map_center', center.x, center.y);
            gl_program.uniform('1f', 'u_num_layers', this.layers.length);
            gl_program.uniform('1f', 'u_meters_per_pixel', this.meters_per_pixel);
            this.camera.setupProgram(gl_program);
          }
          gl_program.uniform('2f', 'u_tile_origin', tile.min.x, tile.min.y);
          mat4.identity(tile_view_mat);
          mat4.translate(tile_view_mat, tile_view_mat, vec3.fromValues(tile.min.x - center.x, tile.min.y - center.y, 0));
          mat4.scale(tile_view_mat, tile_view_mat, vec3.fromValues(tile.span.x / Scene.tile_scale, -1 * tile.span.y / Scene.tile_scale, 1));
          gl_program.uniform('Matrix4fv', 'u_tile_view', false, tile_view_mat);
          mat4.identity(tile_world_mat);
          mat4.translate(tile_world_mat, tile_world_mat, vec3.fromValues(tile.min.x, tile.min.y, 0));
          mat4.scale(tile_world_mat, tile_world_mat, vec3.fromValues(tile.span.x / Scene.tile_scale, -1 * tile.span.y / Scene.tile_scale, 1));
          gl_program.uniform('Matrix4fv', 'u_tile_world', false, tile_world_mat);
          tile.gl_geometry[mode].render();
        }
      }
    }
    if (this.selection_callback_timer != null) {
      clearTimeout(this.selection_callback_timer);
    }
    this.selection_callback_timer = setTimeout((function() {
      return $__15.doFeatureSelectionRequests();
    }), this.selection_frame_delay);
    gl.bindFramebuffer(gl.FRAMEBUFFER, null);
    gl.viewport(0, 0, this.canvas.width, this.canvas.height);
  }
  if (render_count !== this.last_render_count) {
    log.info(("Scene: rendered " + render_count + " primitives"));
  }
  this.last_render_count = render_count;
  return true;
};
Scene.prototype.getFeatureAt = function(pixel, callback) {
  if (typeof callback !== 'function') {
    throw new Error("Scene.getFeatureAt() called without a valid callback function");
  }
  if (!this.initialized) {
    callback(new Error("Scene.getFeatureAt() called before scene was initialized"));
    return;
  }
  this.selection_request_id = (this.selection_request_id + 1) || 0;
  this.selection_requests[this.selection_request_id] = {
    type: 'point',
    id: this.selection_request_id,
    point: {
      x: pixel.x * this.device_pixel_ratio,
      y: this.device_size.height - (pixel.y * this.device_pixel_ratio)
    },
    callback: callback
  };
  this.dirty = true;
};
Scene.prototype.doFeatureSelectionRequests = function() {
  var $__15 = this;
  var gl = this.gl;
  gl.bindFramebuffer(gl.FRAMEBUFFER, this.fbo);
  for (var $__16 = Utils.values(this.selection_requests)[Symbol.iterator](),
      $__17; !($__17 = $__16.next()).done; ) {
    var request = $__17.value;
    {
      if (request.sent) {
        continue;
      }
      if (request.type !== 'point') {
        continue;
      }
      gl.readPixels(Math.floor(request.point.x * this.fbo_size.width / this.device_size.width), Math.floor(request.point.y * this.fbo_size.height / this.device_size.height), 1, 1, gl.RGBA, gl.UNSIGNED_BYTE, this.pixel);
      var feature_key = (this.pixel[0] + (this.pixel[1] << 8) + (this.pixel[2] << 16) + (this.pixel[3] << 24)) >>> 0;
      var worker_id = this.pixel[3];
      if (worker_id !== 255) {
        if (this.workers[worker_id] != null) {
          WorkerBroker.postMessage(this.workers[worker_id], 'getFeatureSelection', {
            id: request.id,
            key: feature_key
          }, (function(message) {
            return $__15.workerGetFeatureSelection(message);
          }));
        }
      } else {
        this.workerGetFeatureSelection({
          id: request.id,
          feature: null
        });
      }
      request.sent = true;
    }
  }
  gl.bindFramebuffer(gl.FRAMEBUFFER, null);
};
Scene.prototype.workerGetFeatureSelection = function(message) {
  var request = this.selection_requests[message.id];
  if (!request) {
    throw new Error("Scene.workerGetFeatureSelection() called without any message");
  }
  var feature = message.feature;
  var changed = false;
  if ((feature != null && this.selected_feature == null) || (feature == null && this.selected_feature != null) || (feature != null && this.selected_feature != null && feature.id !== this.selected_feature.id)) {
    changed = true;
  }
  this.selected_feature = feature;
  if (typeof request.callback === 'function') {
    request.callback({
      feature: feature,
      changed: changed,
      request: request
    });
  }
  delete this.selection_requests[message.id];
};
Scene.prototype.loadTile = function() {
  for (var args = [],
      $__22 = 0; $__22 < arguments.length; $__22++)
    args[$__22] = arguments[$__22];
  this.queued_tiles[this.queued_tiles.length] = args;
};
Scene.prototype.loadQueuedTiles = function() {
  if (!this.initialized) {
    return;
  }
  if (this.queued_tiles.length === 0) {
    return;
  }
  for (var t = 0; t < this.queued_tiles.length; t++) {
    this._loadTile.apply(this, this.queued_tiles[t]);
  }
  this.queued_tiles = [];
};
Scene.prototype.cacheTile = function(tile) {
  this.tiles[tile.key] = tile;
};
Scene.prototype.hasTile = function(key) {
  return this.tiles[key] !== undefined;
};
Scene.prototype.forgetTile = function(key) {
  delete this.tiles[key];
};
Scene.prototype._loadTile = function(coords, div, callback) {
  var $__15 = this;
  callback = (typeof callback === 'function') ? callback : function() {};
  var tile = Tile.create({
    coords: coords,
    tile_source: this.tile_source
  });
  if (!this.hasTile(tile.key)) {
    tile.load(this, coords, div, (function(error, div) {
      $__15.cacheTile(tile);
      callback(null, div, tile);
    }));
  } else {
    callback(null, div);
  }
};
Scene.prototype.rebuildGeometry = function(callback) {
  var $__15 = this;
  if (!this.initialized) {
    if (typeof callback === 'function') {
      callback(false);
    }
    return;
  }
  if (this.building) {
    if (this.building.queued && typeof this.building.queued.callback === 'function') {
      this.building.queued.callback(null, false);
    }
    this.building.queued = {callback: callback};
    return;
  }
  this.building = {
    callback: callback,
    tiles: {}
  };
  this.layers_serialized = Utils.serializeWithFunctions(this.layers);
  this.styles_serialized = Utils.serializeWithFunctions(this.styles);
  this.selection_map = {};
  this.workers.forEach((function(worker) {
    WorkerBroker.postMessage(worker, 'prepareForRebuild', {
      layers: $__15.layers_serialized,
      styles: $__15.styles_serialized
    });
  }));
  var tile,
      visible = [],
      invisible = [];
  for (var $__16 = Utils.values(this.tiles)[Symbol.iterator](),
      $__17; !($__17 = $__16.next()).done; ) {
    tile = $__17.value;
    {
      if (tile.visible === true) {
        visible.push(tile);
      } else {
        invisible.push(tile);
      }
    }
  }
  visible.sort((function(a, b) {
    return (b.center_dist > a.center_dist ? -1 : (b.center_dist === a.center_dist ? 0 : 1));
  }));
  for (var $__18 = visible[Symbol.iterator](),
      $__19; !($__19 = $__18.next()).done; ) {
    tile = $__19.value;
    {
      tile.build(this);
    }
  }
  for (var $__20 = invisible[Symbol.iterator](),
      $__21; !($__21 = $__20.next()).done; ) {
    tile = $__21.value;
    {
      if (tile.isInZoom(this)) {
        tile.build(this);
      } else {
        this.removeTile(tile.key);
      }
    }
  }
  this.updateActiveModes();
  this.resetTime();
  if (this.building && Object.keys(this.building.tiles).length === 0) {
    callback = this.building.callback;
    this.building = null;
    if (typeof callback === 'function') {
      callback(null, true);
    }
  }
};
Scene.prototype.buildTileCompleted = function($__23) {
  var $__24 = $__23,
      tile = $__24.tile,
      worker_id = $__24.worker_id,
      selection_map_size = $__24.selection_map_size;
  this.selection_map_worker_size[worker_id] = selection_map_size;
  this.selection_map_size = 0;
  for (var wid in this.selection_map_worker_size) {
    this.selection_map_size += this.selection_map_worker_size[wid];
  }
  if (this.tiles[tile.key] == null) {
    log.debug(("discarded tile " + tile.key + " in Scene.buildTileCompleted because previously removed"));
  } else {
    var cached = this.tiles[tile.key];
    if (cached) {
      tile = cached.merge(tile);
    }
    if (!tile.error) {
      tile.finalizeGeometry(this.modes);
      this.dirty = true;
    } else {
      log.error(("main thread tile load error for " + tile.key + ": " + tile.error));
    }
    tile.printDebug();
  }
  this.trackTileSetLoadStop();
  this.trackTileBuildStop(tile.key);
};
Scene.prototype.trackTileBuildStart = function(key) {
  if (!this.building) {
    this.building = {tiles: {}};
  }
  this.building.tiles[key] = true;
  log.trace(("trackTileBuildStart for " + key + ": " + Object.keys(this.building.tiles).length));
};
Scene.prototype.trackTileBuildStop = function(key) {
  if (this.building) {
    log.trace(("trackTileBuildStop for " + key + ": " + Object.keys(this.building.tiles).length));
    delete this.building.tiles[key];
    if (Object.keys(this.building.tiles).length === 0) {
      log.info("Scene: build geometry finished");
      log.debug(("Scene: updated selection map: " + this.selection_map_size + " features"));
      var callback = this.building.callback;
      if (typeof callback === 'function') {
        callback(null, true);
      }
      var queued = this.building.queued;
      this.building = null;
      if (queued) {
        this.rebuildGeometry(queued.callback);
      }
    }
  }
};
Scene.prototype.removeTile = function(key) {
  if (!this.initialized) {
    return;
  }
  log.debug(("tile unload for " + key));
  if (this.zooming === true) {
    return;
  }
  var tile = this.tiles[key];
  if (tile != null) {
    tile.freeResources();
    tile.remove(this);
  }
  this.forgetTile(tile.key);
  this.dirty = true;
};
Scene.prototype.loadScene = function() {
  return Promise.all([this.loadLayers(this.layer_source), this.loadStyles(this.style_source)]);
};
Scene.prototype.parseResource = function(body) {
  var data = null;
  try {
    eval('data = ' + body);
  } catch (e) {
    try {
      data = yaml.safeLoad(body);
    } catch (e) {
      log.error('Scene: failed to parse');
      log.error(e);
    }
  }
  return data;
};
Scene.prototype.loadResource = function(source, postLoad) {
  var $__15 = this;
  return new Promise((function(resolve, reject) {
    if (typeof source === 'string') {
      Utils.io(Utils.cacheBusterForUrl(source)).then((function(body) {
        var data = $__15.parseResource(body);
        postLoad(data);
        resolve();
      }), reject);
    } else {
      postLoad(source);
      resolve();
    }
  }));
};
Scene.prototype.loadLayers = function(source) {
  var $__15 = this;
  return this.loadResource(source, (function(data) {
    $__15.layers = data;
    $__15.layers_serialized = Utils.serializeWithFunctions($__15.layers);
  }));
};
Scene.prototype.loadStyles = function(source) {
  var $__15 = this;
  return this.loadResource(source, (function(styles) {
    $__15.styles = styles;
    Style.expandMacros($__15.styles);
    Scene.preProcessStyles($__15.styles);
    $__15.styles_serialized = Utils.serializeWithFunctions($__15.styles);
  }));
};
Scene.prototype.reload = function() {
  var $__15 = this;
  if (!this.initialized) {
    return;
  }
  this.loadScene().then((function() {
    $__15.updateStyles();
    $__15.rebuildGeometry();
  }), (function(error) {
    throw error;
  }));
};
Scene.prototype.updateModes = function(callback) {
  var $__15 = this;
  callback = (typeof callback === 'function') ? callback : function() {};
  if (!this.initialized && !this.initializing) {
    callback(new Error('Scene.updateModes() called before scene was initialized'));
  }
  if (this.compiling) {
    if (this.compiling.queued && typeof this.compiling.queued.callback === 'function') {
      this.compiling.queued.callback(new Error('Scene.updateModes() queued request was superceded'));
    }
    this.compiling.queued = {callback: callback};
    return callback();
  }
  this.compiling = {callback: callback};
  var name;
  for (name in this.styles.modes) {
    this.modes[name] = ModeManager.updateMode(name, this.styles.modes[name]);
  }
  Promise.all(Object.keys(this.modes).map((function(_name) {
    var mode = $__15.modes[_name];
    return new Promise((function(resolve, reject) {
      mode.compile((function(error) {
        if (error) {
          reject(error);
        }
        log.trace(("Scene.updateModes(): compiled mode " + _name + " " + (error ? error : '')));
        resolve();
      }));
    }));
  }))).then((function() {
    log.debug("Scene.updateModes(): compiled all modes");
    $__15.dirty = true;
    var callback = $__15.compiling.callback;
    var queued = $__15.compiling.queued;
    $__15.compiling = null;
    callback(null);
    if (queued) {
      log.trace("Scene.updateModes(): starting queued request");
      $__15.updateModes(queued.callback);
    }
  }), (function(error) {
    callback(error);
  }));
};
Scene.prototype.updateActiveModes = function() {
  this.active_modes = {};
  var animated = false;
  for (var l in this.styles.layers) {
    var mode = this.styles.layers[l].mode.name;
    if (this.styles.layers[l].visible !== false && this.modes[mode]) {
      this.active_modes[mode] = true;
      if (animated === false && this.modes[mode].animated === true) {
        animated = true;
      }
    }
  }
  this.animated = animated;
};
Scene.prototype.createCamera = function() {
  this.camera = Camera.create(this, this.styles.camera);
};
Scene.prototype.createLighting = function() {
  var types = {
    diffuse: 'LIGHTING_POINT',
    specular: 'LIGHTING_POINT_SPECULAR',
    flat: 'LIGHTING_DIRECTION',
    night: 'LIGHTING_NIGHT'
  };
  for (var t in types) {
    GLProgram.defines[types[t]] = (t === this.styles.lighting.type);
  }
  this.lighting = {type: this.styles.lighting.type};
};
Scene.prototype.updateStyles = function() {
  if (this.styles.camera.type !== this.camera.type) {
    this.createCamera();
  }
  if (this.styles.lighting.type !== this.lighting.type) {
    this.createLighting();
  }
  this.updateModes();
};
Scene.prototype.resetTime = function() {
  this.start_time = +new Date();
};
Scene.prototype.initInputHandlers = function() {};
Scene.prototype.input = function() {};
Scene.prototype.trackTileSetLoadStart = function() {
  if (this.tile_set_loading == null) {
    this.tile_set_loading = +new Date();
    log.info('Scene: tile set load start');
  }
};
Scene.prototype.trackTileSetLoadStop = function() {
  if (this.tile_set_loading != null) {
    var end_tile_set = true;
    for (var t in this.tiles) {
      if (this.tiles[t].loading === true) {
        end_tile_set = false;
        break;
      }
    }
    if (end_tile_set === true) {
      this.last_tile_set_load = (+new Date()) - this.tile_set_loading;
      this.tile_set_loading = null;
      log.info(("Scene: tile set load finished in " + this.last_tile_set_load + "ms"));
    }
  }
};
Scene.prototype.getDebugSum = function(prop, filter) {
  var sum = 0;
  for (var t in this.tiles) {
    if (this.tiles[t].debug[prop] != null && (typeof filter !== 'function' || filter(this.tiles[t]) === true)) {
      sum += this.tiles[t].debug[prop];
    }
  }
  return sum;
};
Scene.prototype.getDebugAverage = function(prop, filter) {
  return this.getDebugSum(prop, filter) / Object.keys(this.tiles).length;
};
Scene.prototype.workerLogMessage = function(event) {
  var $__25;
  if (event.data.type !== 'log') {
    return;
  }
  var $__23 = event.data,
      worker_id = $__23.worker_id,
      level = $__23.level,
      msg = $__23.msg;
  if (log[level]) {
    ($__25 = log)[level].apply($__25, $traceurRuntime.spread([("worker " + worker_id + ":")], msg));
  } else {
    log.error(("Scene.workerLogMessage: unrecognized log level " + level));
  }
};
Scene.preProcessStyles = function(styles) {
  for (var m in styles.layers) {
    if (styles.layers[m].visible !== false) {
      styles.layers[m].visible = true;
    }
    if ((styles.layers[m].mode && styles.layers[m].mode.name) == null) {
      styles.layers[m].mode = {};
      for (var p in Style.defaults.mode) {
        styles.layers[m].mode[p] = Style.defaults.mode[p];
      }
    }
  }
  styles.camera = styles.camera || {};
  styles.lighting = styles.lighting || {};
  return styles;
};
Scene.processLayersForTile = function(layers, tile) {
  var tile_layers = {};
  for (var t = 0; t < layers.length; t++) {
    layers[t].number = t;
    if (layers[t] != null) {
      if (layers[t].data == null) {
        tile_layers[layers[t].name] = tile.layers[layers[t].name];
      } else if (typeof layers[t].data === 'string') {
        tile_layers[layers[t].name] = tile.layers[layers[t].data];
      } else if (typeof layers[t].data === 'function') {
        tile_layers[layers[t].name] = layers[t].data(tile.layers);
      }
    }
    tile_layers[layers[t].name] = tile_layers[layers[t].name] || {
      type: 'FeatureCollection',
      features: []
    };
  }
  tile.layers = tile_layers;
  return tile_layers;
};
Scene.createModes = function(stylesheet_modes) {
  var modes = {};
  var built_ins = require('./gl/gl_modes').Modes;
  for (var m in built_ins) {
    modes[m] = built_ins[m];
  }
  for (m in stylesheet_modes) {
    modes[m] = ModeManager.updateMode(m, stylesheet_modes[m]);
  }
  for (m in modes) {
    modes[m].init();
  }
  return modes;
};
function findBaseLibraryURL() {
  Scene.library_base_url = '';
  Scene.library_type = 'min';
  var script = document.currentScript;
  if (!script) {
    return;
  }
  Scene.library_base_url = script.src.substr(0, script.src.lastIndexOf('/')) + '/';
  if (['debug', 'test'].some((function(build) {
    return script.src.indexOf(("tangram." + build + ".js")) > -1;
  }))) {
    Scene.library_type = 'debug';
  }
}


},{"./camera":45,"./geo":47,"./gl/gl":48,"./gl/gl_builders":49,"./gl/gl_modes":52,"./gl/gl_program":53,"./gl/gl_texture":55,"./style":59,"./tile":60,"./tile_source":61,"./utils":62,"./worker_broker":64,"gl-matrix":4,"js-yaml":5,"loglevel":37}],58:[function(require,module,exports){
"use strict";
Object.defineProperties(exports, {
  SceneWorker: {get: function() {
      return SceneWorker;
    }},
  __esModule: {value: true}
});
var $__utils__,
    $__worker_95_broker__,
    $__style__,
    $__scene__,
    $__tile__,
    $__tile_95_source_46_js__,
    $__gl_47_gl_95_builders__;
var Utils = ($__utils__ = require("./utils"), $__utils__ && $__utils__.__esModule && $__utils__ || {default: $__utils__}).default;
var WorkerBroker = ($__worker_95_broker__ = require("./worker_broker"), $__worker_95_broker__ && $__worker_95_broker__.__esModule && $__worker_95_broker__ || {default: $__worker_95_broker__}).default;
var Style = ($__style__ = require("./style"), $__style__ && $__style__.__esModule && $__style__ || {default: $__style__}).Style;
var Scene = ($__scene__ = require("./scene"), $__scene__ && $__scene__.__esModule && $__scene__ || {default: $__scene__}).default;
var Tile = ($__tile__ = require("./tile"), $__tile__ && $__tile__.__esModule && $__tile__ || {default: $__tile__}).default;
var TileSource = ($__tile_95_source_46_js__ = require("./tile_source.js"), $__tile_95_source_46_js__ && $__tile_95_source_46_js__.__esModule && $__tile_95_source_46_js__ || {default: $__tile_95_source_46_js__}).default;
var GLBuilders = ($__gl_47_gl_95_builders__ = require("./gl/gl_builders"), $__gl_47_gl_95_builders__ && $__gl_47_gl_95_builders__.__esModule && $__gl_47_gl_95_builders__ || {default: $__gl_47_gl_95_builders__}).GLBuilders;
var SceneWorker = {};
SceneWorker.worker = self;
SceneWorker.tiles = {};
GLBuilders.setTileScale(Scene.tile_scale);
SceneWorker.worker.init = function($__8) {
  var worker_id = $__8.worker_id;
  SceneWorker.worker_id = worker_id;
  Style.selection_map_prefix = SceneWorker.worker_id;
};
SceneWorker.updateConfig = function(config) {
  if (!SceneWorker.tile_source && config.tile_source) {
    SceneWorker.tile_source = TileSource.create(config.tile_source);
  }
  if (!SceneWorker.layers && config.layers) {
    SceneWorker.layers = Utils.deserializeWithFunctions(config.layers);
  }
  if (!SceneWorker.styles && config.styles) {
    SceneWorker.styles = Utils.deserializeWithFunctions(config.styles, Style.wrapFunction);
    SceneWorker.modes = Scene.createModes(SceneWorker.styles.modes);
  }
};
SceneWorker.sliceTile = function(tile, keys) {
  keys = keys || {};
  keys.key = true;
  keys.loading = true;
  keys.loaded = true;
  keys.error = true;
  keys.debug = true;
  var tile_subset = {};
  for (var k in keys) {
    tile_subset[k] = tile[k];
  }
  return tile_subset;
};
SceneWorker.worker.buildTile = function($__8) {
  var $__9 = $__8,
      tile = $__9.tile,
      tile_source = $__9.tile_source,
      layers = $__9.layers,
      styles = $__9.styles;
  if (SceneWorker.tiles[tile.key] != null) {
    if (SceneWorker.tiles[tile.key].loading === true) {
      return;
    }
  }
  tile = SceneWorker.tiles[tile.key] = Object.assign(SceneWorker.tiles[tile.key] || {}, tile);
  SceneWorker.updateConfig({
    tile_source: tile_source,
    layers: layers,
    styles: styles
  });
  if (tile.loaded !== true) {
    return new Promise((function(resolve, reject) {
      SceneWorker.tile_source.loadTile(tile).then((function() {
        Scene.processLayersForTile(SceneWorker.layers, tile);
        var keys = Tile.buildGeometry(tile, SceneWorker.layers, SceneWorker.styles, SceneWorker.modes);
        resolve({
          tile: SceneWorker.sliceTile(tile, keys),
          worker_id: SceneWorker.worker_id,
          selection_map_size: Style.selection_map_size
        });
      }), (function(error) {
        if (error) {
          SceneWorker.log('error', ("tile load error for " + tile.key + ": " + error.toString()));
        } else {
          SceneWorker.log('debug', ("skip building tile " + tile.key + " because no longer loading"));
        }
        resolve({
          tile: SceneWorker.sliceTile(tile),
          worker_id: SceneWorker.worker_id,
          selection_map_size: Style.selection_map_size
        });
      }));
    }));
  } else {
    SceneWorker.log('debug', ("used worker cache for tile " + tile.key));
    var keys = Tile.buildGeometry(tile, SceneWorker.layers, SceneWorker.styles, SceneWorker.modes);
    return {
      tile: SceneWorker.sliceTile(tile, keys),
      worker_id: SceneWorker.worker_id,
      selection_map_size: Style.selection_map_size
    };
  }
};
SceneWorker.worker.removeTile = function(key) {
  var tile = SceneWorker.tiles[key];
  if (tile != null) {
    if (tile.loading === true) {
      SceneWorker.log('debug', ("cancel tile load for " + key));
      tile.loading = false;
    }
    delete SceneWorker.tiles[key];
    SceneWorker.log('debug', ("remove tile from cache for " + key));
  }
};
SceneWorker.worker.getFeatureSelection = function() {
  var $__8 = arguments[0] !== (void 0) ? arguments[0] : {},
      id = $__8.id,
      key = $__8.key;
  var selection = Style.selection_map[key];
  return {
    id: id,
    feature: (selection && selection.feature)
  };
};
SceneWorker.worker.prepareForRebuild = function(config) {
  SceneWorker.layers = null;
  SceneWorker.styles = null;
  SceneWorker.modes = null;
  SceneWorker.updateConfig(config);
  Style.resetSelectionMap();
  SceneWorker.log('debug', "worker updated config for tile rebuild");
};
SceneWorker.log = function(level) {
  for (var msg = [],
      $__7 = 1; $__7 < arguments.length; $__7++)
    msg[$__7 - 1] = arguments[$__7];
  SceneWorker.worker.postMessage({
    type: 'log',
    level: level || 'info',
    worker_id: SceneWorker.worker_id,
    msg: msg
  });
};


},{"./gl/gl_builders":49,"./scene":57,"./style":59,"./tile":60,"./tile_source.js":61,"./utils":62,"./worker_broker":64}],59:[function(require,module,exports){
"use strict";
Object.defineProperties(exports, {
  Style: {get: function() {
      return Style;
    }},
  __esModule: {value: true}
});
var $__geo__,
    $__loglevel__;
var Geo = ($__geo__ = require("./geo"), $__geo__ && $__geo__.__esModule && $__geo__ || {default: $__geo__}).Geo;
var log = ($__loglevel__ = require("loglevel"), $__loglevel__ && $__loglevel__.__esModule && $__loglevel__ || {default: $__loglevel__}).default;
var Style = {};
Style.color = {
  pseudoRandomGrayscale: function(f) {
    var c = Math.max((parseInt(f.id, 16) % 100) / 100, 0.4);
    return [0.7 * c, 0.7 * c, 0.7 * c];
  },
  pseudoRandomColor: function(f) {
    return [0.7 * (parseInt(f.id, 16) / 100 % 1), 0.7 * (parseInt(f.id, 16) / 10000 % 1), 0.7 * (parseInt(f.id, 16) / 1000000 % 1)];
  },
  randomColor: function(f) {
    return [0.7 * Math.random(), 0.7 * Math.random(), 0.7 * Math.random()];
  }
};
Style.pixels = function(p) {
  var f;
  eval('f = function() { return ' + (typeof p === 'function' ? '(' + (p.toString() + '())') : p) + ' * meters_per_pixel; }');
  return f;
};
Style.selection_map = {};
Style.selection_map_size = 1;
Style.selection_map_prefix = 0;
Style.generateSelection = function() {
  Style.selection_map_size++;
  var ir = Style.selection_map_size & 255;
  var ig = (Style.selection_map_size >> 8) & 255;
  var ib = (Style.selection_map_size >> 16) & 255;
  var ia = Style.selection_map_prefix;
  var r = ir / 255;
  var g = ig / 255;
  var b = ib / 255;
  var a = ia / 255;
  var key = (ir + (ig << 8) + (ib << 16) + (ia << 24)) >>> 0;
  Style.selection_map[key] = {color: [r, g, b, a]};
  return Style.selection_map[key];
};
Style.resetSelectionMap = function() {
  Style.selection_map = {};
  Style.selection_map_size = 1;
};
Style.macros = ['Style.color.pseudoRandomColor', 'Style.color.randomColor', 'Style.pixels'];
Style.wrapFunction = function(func) {
  var f = ("function(feature, tile, helpers) {\n                var feature = feature.properties;\n                var zoom = tile.coords.z;\n                var meters_per_pixel = helpers.Geo.metersPerPixel(zoom);\n                var properties = helpers.style_properties;\n                return (" + func + "());\n            }");
  return f;
};
Style.expandMacros = function expandMacros(obj) {
  for (var p in obj) {
    var val = obj[p];
    if (typeof val === 'object') {
      obj[p] = expandMacros(val);
    } else if (typeof val === 'string') {
      for (var m in Style.macros) {
        if (val.match(Style.macros[m])) {
          var f;
          try {
            eval('f = ' + val);
            obj[p] = f;
            log.trace(("expanded macro " + val + " to " + f));
            break;
          } catch (e) {
            obj[p] = val;
            log.trace(("failed to expand macro " + val));
          }
        }
      }
    }
  }
  return obj;
};
Style.defaults = {
  color: [1.0, 0, 0],
  width: 1,
  size: 1,
  extrude: false,
  height: 20,
  min_height: 0,
  outline: {},
  selection: {
    active: false,
    color: [0, 0, 0, 1]
  },
  mode: {name: 'polygons'}
};
Style.helpers = {
  Style: Style,
  Geo: Geo
};
Style.parseStyleForFeature = function(feature, layer_name, layer_style, tile) {
  layer_style = layer_style || {};
  var style = {};
  if (layer_style.properties) {
    Style.helpers.style_properties = Object.assign({}, layer_style.properties);
  }
  if (typeof layer_style.filter === 'function') {
    if (layer_style.filter(feature, tile, Style.helpers) === false) {
      return null;
    }
  }
  style.color = (layer_style.color && (layer_style.color[feature.properties.kind] || layer_style.color.default)) || Style.defaults.color;
  if (typeof style.color === 'function') {
    style.color = style.color(feature, tile, Style.helpers);
  }
  style.width = (layer_style.width && (layer_style.width[feature.properties.kind] || layer_style.width.default)) || Style.defaults.width;
  if (typeof style.width === 'function') {
    style.width = style.width(feature, tile, Style.helpers);
  }
  style.width *= Geo.units_per_meter[tile.coords.z];
  style.size = (layer_style.size && (layer_style.size[feature.properties.kind] || layer_style.size.default)) || Style.defaults.size;
  if (typeof style.size === 'function') {
    style.size = style.size(feature, tile, Style.helpers);
  }
  style.size *= Geo.units_per_meter[tile.coords.z];
  style.extrude = (layer_style.extrude && (layer_style.extrude[feature.properties.kind] || layer_style.extrude.default)) || Style.defaults.extrude;
  if (typeof style.extrude === 'function') {
    style.extrude = style.extrude(feature, tile, Style.helpers);
  }
  style.height = (feature.properties && feature.properties.height) || Style.defaults.height;
  style.min_height = (feature.properties && feature.properties.min_height) || Style.defaults.min_height;
  if (style.extrude) {
    if (typeof style.extrude === 'number') {
      style.height = style.extrude;
    } else if (typeof style.extrude === 'object' && style.extrude.length >= 2) {
      style.min_height = style.extrude[0];
      style.height = style.extrude[1];
    }
  }
  style.z = (layer_style.z && (layer_style.z[feature.properties.kind] || layer_style.z.default)) || Style.defaults.z || 0;
  if (typeof style.z === 'function') {
    style.z = style.z(feature, tile, Style.helpers);
  }
  style.outline = {};
  layer_style.outline = layer_style.outline || {};
  style.outline.color = (layer_style.outline.color && (layer_style.outline.color[feature.properties.kind] || layer_style.outline.color.default)) || Style.defaults.outline.color;
  if (typeof style.outline.color === 'function') {
    style.outline.color = style.outline.color(feature, tile, Style.helpers);
  }
  style.outline.width = (layer_style.outline.width && (layer_style.outline.width[feature.properties.kind] || layer_style.outline.width.default)) || Style.defaults.outline.width;
  if (typeof style.outline.width === 'function') {
    style.outline.width = style.outline.width(feature, tile, Style.helpers);
  }
  style.outline.width *= Geo.units_per_meter[tile.coords.z];
  style.outline.dash = (layer_style.outline.dash && (layer_style.outline.dash[feature.properties.kind] || layer_style.outline.dash.default)) || Style.defaults.outline.dash;
  if (typeof style.outline.dash === 'function') {
    style.outline.dash = style.outline.dash(feature, tile, Style.helpers);
  }
  style.outline.tile_edges = (layer_style.outline.tile_edges === true) ? true : false;
  var interactive = false;
  if (typeof layer_style.interactive === 'function') {
    interactive = layer_style.interactive(feature, tile, Style.helpers);
  } else {
    interactive = layer_style.interactive;
  }
  if (interactive === true) {
    var selector = Style.generateSelection();
    selector.feature = {
      id: feature.id,
      properties: feature.properties
    };
    selector.feature.properties.layer = layer_name;
    style.selection = {
      active: true,
      color: selector.color
    };
  } else {
    style.selection = Style.defaults.selection;
  }
  if (layer_style.mode != null && layer_style.mode.name != null) {
    style.mode = {};
    for (var m in layer_style.mode) {
      style.mode[m] = layer_style.mode[m];
    }
  } else {
    style.mode = Style.defaults.mode;
  }
  return style;
};


},{"./geo":47,"loglevel":37}],60:[function(require,module,exports){
"use strict";
Object.defineProperties(exports, {
  default: {get: function() {
      return $__default;
    }},
  __esModule: {value: true}
});
var $__geo__,
    $__style__,
    $__worker_95_broker__,
    $__loglevel__;
var Geo = ($__geo__ = require("./geo"), $__geo__ && $__geo__.__esModule && $__geo__ || {default: $__geo__}).Geo;
var Style = ($__style__ = require("./style"), $__style__ && $__style__.__esModule && $__style__ || {default: $__style__}).Style;
var WorkerBroker = ($__worker_95_broker__ = require("./worker_broker"), $__worker_95_broker__ && $__worker_95_broker__.__esModule && $__worker_95_broker__ || {default: $__worker_95_broker__}).default;
var log = ($__loglevel__ = require("loglevel"), $__loglevel__ && $__loglevel__.__esModule && $__loglevel__ || {default: $__loglevel__}).default;
var Tile = function Tile() {
  var spec = arguments[0] !== (void 0) ? arguments[0] : {};
  Object.assign(this, {
    coords: {
      x: null,
      y: null,
      z: null
    },
    debug: {},
    loading: false,
    loaded: false,
    error: null,
    worker: null
  }, spec);
};
var $Tile = Tile;
($traceurRuntime.createClass)(Tile, {
  freeResources: function() {
    if (this != null && this.gl_geometry != null) {
      for (var p in this.gl_geometry) {
        this.gl_geometry[p].destroy();
      }
      this.gl_geometry = null;
    }
  },
  destroy: function() {
    this.freeResources();
    this.worker = null;
  },
  buildAsMessage: function() {
    return {
      key: this.key,
      coords: this.coords,
      min: this.min,
      max: this.max,
      debug: this.debug
    };
  },
  workerMessage: function(scene) {
    var $__7;
    for (var message = [],
        $__5 = 1; $__5 < arguments.length; $__5++)
      message[$__5 - 1] = arguments[$__5];
    if (this.worker == null) {
      this.worker = scene.nextWorker();
    }
    ($__7 = WorkerBroker).postMessage.apply($__7, $traceurRuntime.spread([this.worker], message));
  },
  build: function(scene) {
    scene.trackTileBuildStart(this.key);
    this.workerMessage(scene, 'buildTile', {
      tile: this.buildAsMessage(),
      tile_source: this.tile_source.buildAsMessage(),
      layers: scene.layers_serialized,
      styles: scene.styles_serialized
    }, (function(message) {
      return scene.buildTileCompleted(message);
    }));
  },
  finalizeGeometry: function(modes) {
    var vertex_data = this.vertex_data;
    this.freeResources();
    this.gl_geometry = {};
    for (var s in vertex_data) {
      this.gl_geometry[s] = modes[s].makeGLGeometry(vertex_data[s]);
    }
    this.debug.geometries = 0;
    this.debug.buffer_size = 0;
    for (var p in this.gl_geometry) {
      this.debug.geometries += this.gl_geometry[p].geometry_count;
      this.debug.buffer_size += this.gl_geometry[p].vertex_data.byteLength;
    }
    this.debug.geom_ratio = (this.debug.geometries / this.debug.features).toFixed(1);
    delete this.vertex_data;
  },
  remove: function(scene) {
    this.workerMessage(scene, 'removeTile', this.key);
  },
  showDebug: function(div) {
    var debug_overlay = document.createElement('div');
    debug_overlay.textContent = this.key;
    debug_overlay.style.position = 'absolute';
    debug_overlay.style.left = 0;
    debug_overlay.style.top = 0;
    debug_overlay.style.color = 'white';
    debug_overlay.style.fontSize = '16px';
    debug_overlay.style.textOutline = '1px #000000';
    div.appendChild(debug_overlay);
    div.style.borderStyle = 'solid';
    div.style.borderColor = 'white';
    div.style.borderWidth = '1px';
    return debug_overlay;
  },
  printDebug: function() {
    log.debug(("Tile: debug for " + this.key + ": [  " + JSON.stringify(this.debug) + " ]"));
  },
  updateElement: function(div, scene) {
    div.setAttribute('data-tile-key', this.key);
    div.style.width = '256px';
    div.style.height = '256px';
    if (scene.debug) {
      this.showDebug(div);
    }
  },
  updateVisibility: function(scene) {
    var visible = this.visible;
    this.visible = this.isInZoom(scene) && Geo.boxIntersect(this.bounds, scene.bounds_meters_buffered);
    this.center_dist = Math.abs(scene.center_meters.x - this.min.x) + Math.abs(scene.center_meters.y - this.min.y);
    return (visible !== this.visible);
  },
  isInZoom: function(scene) {
    return (Math.min(this.coords.z, this.tile_source.max_zoom || this.coords.z)) === scene.capped_zoom;
  },
  get key() {
    var $__6 = this.tile_source.calculateOverZoom(this.coords),
        x = $__6.x,
        y = $__6.y,
        z = $__6.z;
    this.coords = {
      x: x,
      y: y,
      z: z
    };
    return [x, y, z].join('/');
  },
  load: function(scene, coords, div, cb) {
    scene.trackTileSetLoadStart();
    Object.assign(this, {
      coords: coords,
      min: Geo.metersForTile(coords),
      max: Geo.metersForTile({
        x: coords.x + 1,
        y: coords.y + 1,
        z: coords.z
      }),
      loading: true
    });
    this.span = {
      x: (this.max.x - this.min.x),
      y: (this.max.y - this.min.y)
    };
    this.bounds = {
      sw: {
        x: this.min.x,
        y: this.max.y
      },
      ne: {
        x: this.max.x,
        y: this.min.y
      }
    };
    this.build(scene);
    this.updateElement(div, scene);
    this.updateVisibility(scene);
    if (cb) {
      cb(null, div);
    }
  },
  merge: function(other) {
    for (var key in other) {
      if (key !== 'key') {
        this[key] = other[key];
      }
    }
    return this;
  }
}, {
  create: function(spec) {
    return new $Tile(spec);
  },
  buildGeometry: function(tile, layers, styles, modes) {
    var layer,
        style,
        feature,
        mode;
    var vertex_data = {};
    var mode_vertex_data;
    tile.debug.rendering = +new Date();
    tile.debug.features = 0;
    for (var layer_num = 0; layer_num < layers.length; layer_num++) {
      layer = layers[layer_num];
      if (styles.layers[layer.name] == null || styles.layers[layer.name].visible === false) {
        continue;
      }
      if (tile.layers[layer.name] != null) {
        var num_features = tile.layers[layer.name].features.length;
        for (var f = num_features - 1; f >= 0; f--) {
          feature = tile.layers[layer.name].features[f];
          style = Style.parseStyleForFeature(feature, layer.name, styles.layers[layer.name], tile);
          if (style == null) {
            continue;
          }
          mode = modes[style.mode.name];
          if (vertex_data[mode.name] == null) {
            vertex_data[mode.name] = mode.vertex_layout.createVertexData();
          }
          mode_vertex_data = vertex_data[mode.name];
          style.layer_num = layer_num;
          if (feature.geometry.type === 'Polygon') {
            mode.buildPolygons([feature.geometry.coordinates], style, mode_vertex_data);
          } else if (feature.geometry.type === 'MultiPolygon') {
            mode.buildPolygons(feature.geometry.coordinates, style, mode_vertex_data);
          } else if (feature.geometry.type === 'LineString') {
            mode.buildLines([feature.geometry.coordinates], style, mode_vertex_data);
          } else if (feature.geometry.type === 'MultiLineString') {
            mode.buildLines(feature.geometry.coordinates, style, mode_vertex_data);
          } else if (feature.geometry.type === 'Point') {
            mode.buildPoints([feature.geometry.coordinates], style, mode_vertex_data);
          } else if (feature.geometry.type === 'MultiPoint') {
            mode.buildPoints(feature.geometry.coordinates, style, mode_vertex_data);
          }
          tile.debug.features++;
        }
      }
    }
    tile.vertex_data = {};
    for (var m in vertex_data) {
      tile.vertex_data[m] = vertex_data[m].end().buffer;
    }
    tile.debug.rendering = +new Date() - tile.debug.rendering;
    return {vertex_data: true};
  }
});
var $__default = Tile;


},{"./geo":47,"./style":59,"./worker_broker":64,"loglevel":37}],61:[function(require,module,exports){
"use strict";
Object.defineProperties(exports, {
  default: {get: function() {
      return $__default;
    }},
  NetworkTileSource: {get: function() {
      return NetworkTileSource;
    }},
  GeoJSONTileSource: {get: function() {
      return GeoJSONTileSource;
    }},
  TopoJSONTileSource: {get: function() {
      return TopoJSONTileSource;
    }},
  MapboxFormatTileSource: {get: function() {
      return MapboxFormatTileSource;
    }},
  __esModule: {value: true}
});
var $__geo__,
    $__errors__,
    $__utils__,
    $__loglevel__;
var Geo = ($__geo__ = require("./geo"), $__geo__ && $__geo__.__esModule && $__geo__ || {default: $__geo__}).Geo;
var MethodNotImplemented = ($__errors__ = require("./errors"), $__errors__ && $__errors__.__esModule && $__errors__ || {default: $__errors__}).MethodNotImplemented;
var Utils = ($__utils__ = require("./utils"), $__utils__ && $__utils__.__esModule && $__utils__ || {default: $__utils__}).default;
var log = ($__loglevel__ = require("loglevel"), $__loglevel__ && $__loglevel__.__esModule && $__loglevel__ || {default: $__loglevel__}).default;
var TileSource = function TileSource(source) {
  this.url_template = source.url;
  this.max_zoom = source.max_zoom || Geo.max_zoom;
};
($traceurRuntime.createClass)(TileSource, {
  calculateOverZoom: function(coordinate) {
    var zgap,
        $__6 = coordinate,
        x = $__6.x,
        y = $__6.y,
        z = $__6.z;
    if (z > this.max_zoom) {
      zgap = z - this.max_zoom;
      x = ~~(x / Math.pow(2, zgap));
      y = ~~(y / Math.pow(2, zgap));
      z -= zgap;
    }
    return {
      x: x,
      y: y,
      z: z
    };
  },
  buildAsMessage: function() {
    return {
      url: this.url_template,
      max_zoom: this.max_zoom
    };
  },
  loadTile: function(tile) {
    throw new MethodNotImplemented('loadTile');
  }
}, {
  create: function(source) {
    switch (source.type) {
      case 'TopoJSONTileSource':
        return new TopoJSONTileSource(source);
      case 'MapboxFormatTileSource':
        return new MapboxFormatTileSource(source);
      case 'GeoJSONTileSource':
      default:
        return new GeoJSONTileSource(source);
    }
  },
  projectTile: function(tile) {
    var timer = +new Date();
    for (var t in tile.layers) {
      var num_features = tile.layers[t].features.length;
      for (var f = 0; f < num_features; f++) {
        var feature = tile.layers[t].features[f];
        feature.geometry.coordinates = Geo.transformGeometry(feature.geometry, Geo.latLngToMeters);
      }
    }
    if (tile.debug !== undefined) {
      tile.debug.projection = +new Date() - timer;
    }
    return tile;
  },
  scaleTile: function(tile) {
    for (var t in tile.layers) {
      var num_features = tile.layers[t].features.length;
      for (var f = 0; f < num_features; f++) {
        var feature = tile.layers[t].features[f];
        feature.geometry.coordinates = Geo.transformGeometry(feature.geometry, (function(coordinates) {
          coordinates[0] = (coordinates[0] - tile.min.x) * Geo.units_per_meter[tile.coords.z];
          coordinates[1] = (coordinates[1] - tile.min.y) * Geo.units_per_meter[tile.coords.z];
          return coordinates;
        }));
      }
    }
    return tile;
  }
});
var $__default = TileSource;
var NetworkTileSource = function NetworkTileSource(source) {
  $traceurRuntime.superCall(this, $NetworkTileSource.prototype, "constructor", [source]);
  this.response_type = "";
  this.url_hosts = null;
  var host_match = this.url_template.match(/{s:\[([^}+]+)\]}/);
  if (host_match != null && host_match.length > 1) {
    this.url_hosts = host_match[1].split(',');
    this.next_host = 0;
  }
};
var $NetworkTileSource = NetworkTileSource;
($traceurRuntime.createClass)(NetworkTileSource, {
  loadTile: function(tile) {
    var $__4 = this;
    var url = this.url_template.replace('{x}', tile.coords.x).replace('{y}', tile.coords.y).replace('{z}', tile.coords.z);
    if (this.url_hosts != null) {
      url = url.replace(/{s:\[([^}+]+)\]}/, this.url_hosts[this.next_host]);
      this.next_host = (this.next_host + 1) % this.url_hosts.length;
    }
    tile.url = url;
    tile.debug.network = +new Date();
    return new Promise((function(resolve, reject) {
      tile.loading = true;
      tile.loaded = false;
      tile.error = null;
      Utils.io(url, 60 * 100, $__4.response_type).then((function(body) {
        if (tile.loading !== true) {
          reject();
          return;
        }
        tile.debug.response_size = body.length || body.byteLength;
        tile.debug.network = +new Date() - tile.debug.network;
        tile.debug.parsing = +new Date();
        $__4.parseTile(tile, body);
        tile.debug.parsing = +new Date() - tile.debug.parsing;
        tile.loading = false;
        tile.loaded = true;
        resolve(tile);
      }), (function(error) {
        tile.loaded = false;
        tile.loading = false;
        tile.error = error.toString();
        reject(error);
      }));
    }));
  },
  parseTile: function(tile) {
    throw new MethodNotImplemented('parseTile');
  }
}, {}, TileSource);
var GeoJSONTileSource = function GeoJSONTileSource(source) {
  $traceurRuntime.superCall(this, $GeoJSONTileSource.prototype, "constructor", [source]);
};
var $GeoJSONTileSource = GeoJSONTileSource;
($traceurRuntime.createClass)(GeoJSONTileSource, {parseTile: function(tile, response) {
    tile.layers = JSON.parse(response);
    TileSource.projectTile(tile);
    TileSource.scaleTile(tile);
  }}, {}, NetworkTileSource);
var TopoJSONTileSource = function TopoJSONTileSource(source) {
  $traceurRuntime.superCall(this, $TopoJSONTileSource.prototype, "constructor", [source]);
  if (typeof topojson === 'undefined') {
    try {
      importScripts('http://d3js.org/topojson.v1.min.js');
      log.info('TopoJSONTileSource: loaded topojson library');
    } catch (e) {
      log.error('TopoJSONTileSource: failed to load TopoJSON library!');
    }
  }
};
var $TopoJSONTileSource = TopoJSONTileSource;
($traceurRuntime.createClass)(TopoJSONTileSource, {parseTile: function(tile, response) {
    if (typeof topojson === 'undefined') {
      tile.layers = {};
      return;
    }
    tile.layers = JSON.parse(response);
    if (tile.layers.objects.vectiles != null) {
      tile.layers = topojson.feature(tile.layers, tile.layers.objects.vectiles);
    } else {
      var layers = {};
      for (var t in tile.layers.objects) {
        layers[t] = topojson.feature(tile.layers, tile.layers.objects[t]);
      }
      tile.layers = layers;
    }
    TileSource.projectTile(tile);
    TileSource.scaleTile(tile);
  }}, {}, NetworkTileSource);
var MapboxFormatTileSource = function MapboxFormatTileSource(source) {
  $traceurRuntime.superCall(this, $MapboxFormatTileSource.prototype, "constructor", [source]);
  this.response_type = "arraybuffer";
  this.Protobuf = require('pbf');
  this.VectorTile = require('vector-tile').VectorTile;
};
var $MapboxFormatTileSource = MapboxFormatTileSource;
($traceurRuntime.createClass)(MapboxFormatTileSource, {parseTile: function(tile, response) {
    var data = new Uint8Array(response);
    var buffer = new this.Protobuf(data);
    tile.data = new this.VectorTile(buffer);
    tile.layers = tile.data.toGeoJSON();
    delete tile.data;
    for (var t in tile.layers) {
      var num_features = tile.layers[t].features.length;
      for (var f = 0; f < num_features; f++) {
        var feature = tile.layers[t].features[f];
        feature.properties.id = feature.properties.osm_id;
        feature.geometry.coordinates = Geo.transformGeometry(feature.geometry, (function(coordinates) {
          coordinates[1] = -coordinates[1];
          return coordinates;
        }));
      }
    }
  }}, {}, NetworkTileSource);


},{"./errors":46,"./geo":47,"./utils":62,"loglevel":37,"pbf":38,"vector-tile":40}],62:[function(require,module,exports){
"use strict";
Object.defineProperties(exports, {
  default: {get: function() {
      return $__default;
    }},
  __esModule: {value: true}
});
var Utils;
var $__default = Utils = {};
Utils.cacheBusterForUrl = function(url) {
  return url + '?' + (+new Date());
};
Utils.io = function(url) {
  var timeout = arguments[1] !== (void 0) ? arguments[1] : 1000;
  var responseType = arguments[2] !== (void 0) ? arguments[2] : 'text';
  var method = arguments[3] !== (void 0) ? arguments[3] : 'GET';
  var headers = arguments[4] !== (void 0) ? arguments[4] : {};
  var request = new XMLHttpRequest();
  return new Promise((function(resolve, reject) {
    request.timeout = timeout;
    request.onload = (function() {
      if (request.status === 200) {
        resolve(request.responseText);
      } else {
        reject(Error('Request error with a status of ' + request.statusText));
      }
    });
    request.onerror = (function(evt) {
      reject(Error('There was a network error' + evt.toString()));
    });
    request.ontimeout = (function(evt) {
      reject(Error('timeout ' + evt.toString()));
    });
    request.open(method, url, true);
    request.responseType = responseType;
    request.send();
  }));
};
Utils.requestAnimationFramePolyfill = function() {
  if (typeof window.requestAnimationFrame !== 'function') {
    window.requestAnimationFrame = window.webkitRequestAnimationFrame || window.mozRequestAnimationFrame || window.oRequestAnimationFrame || window.msRequestAnimationFrame || function(cb) {
      setTimeout(cb, 1000 / 60);
    };
  }
};
Utils.serializeWithFunctions = function(obj) {
  var serialized = JSON.stringify(obj, function(k, v) {
    if (typeof v === 'function') {
      return v.toString();
    }
    return v;
  });
  return serialized;
};
Utils.deserializeWithFunctions = function(serialized, wrap) {
  var obj = JSON.parse(serialized);
  obj = Utils.stringsToFunctions(obj, wrap);
  return obj;
};
Utils.stringsToFunctions = function(obj, wrap) {
  for (var p in obj) {
    var val = obj[p];
    if (typeof val === 'object') {
      obj[p] = Utils.stringsToFunctions(val, wrap);
    } else if (typeof val === 'string' && val.match(/^function.*\(.*\)/) != null) {
      var f;
      try {
        if (typeof wrap === 'function') {
          eval('f = ' + wrap(val));
        } else {
          eval('f = ' + val);
        }
        obj[p] = f;
      } catch (e) {
        obj[p] = val;
      }
    }
  }
  return obj;
};
Utils.inMainThread = function(block) {
  try {
    if (window.document !== undefined) {
      block();
    }
  } catch (e) {}
};
Utils.inWorkerThread = function(block) {
  try {
    if (window.document !== undefined) {}
  } catch (e) {
    if (self !== undefined) {
      block();
    }
  }
};
Utils.isPowerOf2 = function(value) {
  return (value & (value - 1)) === 0;
};
Utils.entries = $traceurRuntime.initGeneratorFunction(function $__2(obj) {
  var $__0,
      $__1,
      key;
  return $traceurRuntime.createGeneratorInstance(function($ctx) {
    while (true)
      switch ($ctx.state) {
        case 0:
          $__0 = Object.keys(obj)[Symbol.iterator]();
          $ctx.state = 4;
          break;
        case 4:
          $ctx.state = (!($__1 = $__0.next()).done) ? 5 : -2;
          break;
        case 5:
          key = $__1.value;
          $ctx.state = 6;
          break;
        case 6:
          $ctx.state = 2;
          return [key, obj[key]];
        case 2:
          $ctx.maybeThrow();
          $ctx.state = 4;
          break;
        default:
          return $ctx.end();
      }
  }, $__2, this);
});
Utils.values = $traceurRuntime.initGeneratorFunction(function $__3(obj) {
  var $__0,
      $__1,
      key;
  return $traceurRuntime.createGeneratorInstance(function($ctx) {
    while (true)
      switch ($ctx.state) {
        case 0:
          $__0 = Object.keys(obj)[Symbol.iterator]();
          $ctx.state = 4;
          break;
        case 4:
          $ctx.state = (!($__1 = $__0.next()).done) ? 5 : -2;
          break;
        case 5:
          key = $__1.value;
          $ctx.state = 6;
          break;
        case 6:
          $ctx.state = 2;
          return obj[key];
        case 2:
          $ctx.maybeThrow();
          $ctx.state = 4;
          break;
        default:
          return $ctx.end();
      }
  }, $__3, this);
});


},{}],63:[function(require,module,exports){
"use strict";
Object.defineProperties(exports, {
  Vector: {get: function() {
      return Vector;
    }},
  __esModule: {value: true}
});
var Vector = {};
Vector.lengthSq = function(v) {
  if (v.length === 2) {
    return (v[0] * v[0] + v[1] * v[1]);
  } else {
    return (v[0] * v[0] + v[1] * v[1] + v[2] * v[2]);
  }
};
Vector.length = function(v) {
  return Math.sqrt(Vector.lengthSq(v));
};
Vector.normalize = function(v) {
  var d;
  if (v.length === 2) {
    d = v[0] * v[0] + v[1] * v[1];
    d = Math.sqrt(d);
    if (d !== 0) {
      return [v[0] / d, v[1] / d];
    }
    return [0, 0];
  } else {
    d = v[0] * v[0] + v[1] * v[1] + v[2] * v[2];
    d = Math.sqrt(d);
    if (d !== 0) {
      return [v[0] / d, v[1] / d, v[2] / d];
    }
    return [0, 0, 0];
  }
};
Vector.cross = function(v1, v2) {
  return [(v1[1] * v2[2]) - (v1[2] * v2[1]), (v1[2] * v2[0]) - (v1[0] * v2[2]), (v1[0] * v2[1]) - (v1[1] * v2[0])];
};
Vector.lineIntersection = function(p1, p2, p3, p4, parallel_tolerance) {
  parallel_tolerance = parallel_tolerance || 0.01;
  var a1 = p1[1] - p2[1];
  var b1 = p1[0] - p2[0];
  var a2 = p3[1] - p4[1];
  var b2 = p3[0] - p4[0];
  var c1 = (p1[0] * p2[1]) - (p1[1] * p2[0]);
  var c2 = (p3[0] * p4[1]) - (p3[1] * p4[0]);
  var denom = (b1 * a2) - (a1 * b2);
  if (Math.abs(denom) > parallel_tolerance) {
    return [((c1 * b2) - (b1 * c2)) / denom, ((c1 * a2) - (a1 * c2)) / denom];
  }
  return null;
};


},{}],64:[function(require,module,exports){
"use strict";
Object.defineProperties(exports, {
  default: {get: function() {
      return $__default;
    }},
  __esModule: {value: true}
});
var WorkerBroker;
var $__default = WorkerBroker = {};
var message_id = 0;
var messages = {};
function setupMainThread() {
  WorkerBroker.postMessage = function(worker, method, message, callback, error) {
    var has_callback = (typeof callback === 'function') || (typeof error === 'function');
    if (has_callback) {
      messages[message_id] = {
        method: method,
        message: message,
        callback: callback,
        error: error
      };
    }
    worker.postMessage({
      worker_broker: true,
      message_id: message_id,
      method: method,
      message: message,
      has_callback: has_callback
    });
    message_id++;
  };
  WorkerBroker.addWorker = function(worker) {
    worker.addEventListener('message', (function(event) {
      var id = event.data.message_id;
      if (messages[id]) {
        if (messages[id].error && event.data.error) {
          messages[id].error(event.data.error);
        } else if (messages[id].callback) {
          messages[id].callback(event.data.message);
        }
        delete messages[id];
      }
    }));
  };
}
function setupWorkerThread() {
  self.addEventListener('message', (function(event) {
    var id = event.data.message_id;
    if (!event.data.worker_broker || id == null) {
      return;
    }
    var method = (typeof self[event.data.method] === 'function') && self[event.data.method];
    if (!method) {
      throw Error(("Worker broker could not dispatch message type " + event.data.method + " because worker has no method with that name"));
    }
    var result = method(event.data.message);
    if (event.data.has_callback) {
      if (result instanceof Promise) {
        result.then((function(value) {
          self.postMessage({
            message_id: id,
            message: value
          });
        }), (function(value) {
          self.postMessage({
            message_id: id,
            error: value
          });
        }));
      } else {
        self.postMessage({
          message_id: id,
          message: result
        });
      }
    }
  }));
}
try {
  if (window !== undefined) {
    setupMainThread();
  }
} catch (e) {
  if (self !== undefined) {
    setupWorkerThread();
  }
}


},{}]},{},[3,58])