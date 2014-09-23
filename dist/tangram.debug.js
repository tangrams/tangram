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
!function(e){if("object"==typeof exports&&"undefined"!=typeof module)module.exports=e();else if("function"==typeof define&&define.amd)define([],e);else{var f;"undefined"!=typeof window?f=window:"undefined"!=typeof global?f=global:"undefined"!=typeof self&&(f=self),f.Tangram=e()}}(function(){var define,module,exports;return (function e(t,n,r){function s(o,u){if(!n[o]){if(!t[o]){var a=typeof require=="function"&&require;if(!u&&a)return a(o,!0);if(i)return i(o,!0);throw new Error("Cannot find module '"+o+"'")}var f=n[o]={exports:{}};t[o][0].call(f.exports,function(e){var n=t[o][1][e];return s(n?n:e)},f,f.exports,e,t,n,r)}return n[o].exports}var i=typeof require=="function"&&require;for(var o=0;o<r.length;o++)s(r[o]);return s})({1:[function(_dereq_,module,exports){
/**
 * @fileoverview gl-matrix - High performance matrix and vector operations
 * @author Brandon Jones
 * @author Colin MacKenzie IV
 * @version 2.2.1
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


(function(_global) {
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
      shim.exports = typeof(window) !== 'undefined' ? window : _global;
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

if(!GLMAT_RANDOM) {
    var GLMAT_RANDOM = Math.random;
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

var degree = Math.PI / 180;

/**
* Convert Degree To Radian
*
* @param {Number} Angle in Degrees
*/
glMatrix.toRadian = function(a){
     return a * degree;
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
 * Subtracts vector b from vector a
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
 * Adds two vec2's after scaling the second operand by a scalar value
 *
 * @param {vec2} out the receiving vector
 * @param {vec2} a the first operand
 * @param {vec2} b the second operand
 * @param {Number} scale the amount to scale b by before adding
 * @returns {vec2} out
 */
vec2.scaleAndAdd = function(out, a, b, scale) {
    out[0] = a[0] + (b[0] * scale);
    out[1] = a[1] + (b[1] * scale);
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
 * Generates a random vector with the given scale
 *
 * @param {vec2} out the receiving vector
 * @param {Number} [scale] Length of the resulting vector. If ommitted, a unit vector will be returned
 * @returns {vec2} out
 */
vec2.random = function (out, scale) {
    scale = scale || 1.0;
    var r = GLMAT_RANDOM() * 2.0 * Math.PI;
    out[0] = Math.cos(r) * scale;
    out[1] = Math.sin(r) * scale;
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
 * Subtracts vector b from vector a
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
 * Adds two vec3's after scaling the second operand by a scalar value
 *
 * @param {vec3} out the receiving vector
 * @param {vec3} a the first operand
 * @param {vec3} b the second operand
 * @param {Number} scale the amount to scale b by before adding
 * @returns {vec3} out
 */
vec3.scaleAndAdd = function(out, a, b, scale) {
    out[0] = a[0] + (b[0] * scale);
    out[1] = a[1] + (b[1] * scale);
    out[2] = a[2] + (b[2] * scale);
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
 * Generates a random vector with the given scale
 *
 * @param {vec3} out the receiving vector
 * @param {Number} [scale] Length of the resulting vector. If ommitted, a unit vector will be returned
 * @returns {vec3} out
 */
vec3.random = function (out, scale) {
    scale = scale || 1.0;

    var r = GLMAT_RANDOM() * 2.0 * Math.PI;
    var z = (GLMAT_RANDOM() * 2.0) - 1.0;
    var zScale = Math.sqrt(1.0-z*z) * scale;

    out[0] = Math.cos(r) * zScale;
    out[1] = Math.sin(r) * zScale;
    out[2] = z * scale;
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
 * Transforms the vec3 with a mat3.
 *
 * @param {vec3} out the receiving vector
 * @param {vec3} a the vector to transform
 * @param {mat4} m the 3x3 matrix to transform with
 * @returns {vec3} out
 */
vec3.transformMat3 = function(out, a, m) {
    var x = a[0], y = a[1], z = a[2];
    out[0] = x * m[0] + y * m[3] + z * m[6];
    out[1] = x * m[1] + y * m[4] + z * m[7];
    out[2] = x * m[2] + y * m[5] + z * m[8];
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
    // benchmarks: http://jsperf.com/quaternion-transform-vec3-implementations

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

/*
* Rotate a 3D vector around the x-axis
* @param {vec3} out The receiving vec3
* @param {vec3} a The vec3 point to rotate
* @param {vec3} b The origin of the rotation
* @param {Number} c The angle of rotation
* @returns {vec3} out
*/
vec3.rotateX = function(out, a, b, c){
   var p = [], r=[];
	  //Translate point to the origin
	  p[0] = a[0] - b[0];
	  p[1] = a[1] - b[1];
  	p[2] = a[2] - b[2];

	  //perform rotation
	  r[0] = p[0];
	  r[1] = p[1]*Math.cos(c) - p[2]*Math.sin(c);
	  r[2] = p[1]*Math.sin(c) + p[2]*Math.cos(c);

	  //translate to correct position
	  out[0] = r[0] + b[0];
	  out[1] = r[1] + b[1];
	  out[2] = r[2] + b[2];

  	return out;
};

/*
* Rotate a 3D vector around the y-axis
* @param {vec3} out The receiving vec3
* @param {vec3} a The vec3 point to rotate
* @param {vec3} b The origin of the rotation
* @param {Number} c The angle of rotation
* @returns {vec3} out
*/
vec3.rotateY = function(out, a, b, c){
  	var p = [], r=[];
  	//Translate point to the origin
  	p[0] = a[0] - b[0];
  	p[1] = a[1] - b[1];
  	p[2] = a[2] - b[2];
  
  	//perform rotation
  	r[0] = p[2]*Math.sin(c) + p[0]*Math.cos(c);
  	r[1] = p[1];
  	r[2] = p[2]*Math.cos(c) - p[0]*Math.sin(c);
  
  	//translate to correct position
  	out[0] = r[0] + b[0];
  	out[1] = r[1] + b[1];
  	out[2] = r[2] + b[2];
  
  	return out;
};

/*
* Rotate a 3D vector around the z-axis
* @param {vec3} out The receiving vec3
* @param {vec3} a The vec3 point to rotate
* @param {vec3} b The origin of the rotation
* @param {Number} c The angle of rotation
* @returns {vec3} out
*/
vec3.rotateZ = function(out, a, b, c){
  	var p = [], r=[];
  	//Translate point to the origin
  	p[0] = a[0] - b[0];
  	p[1] = a[1] - b[1];
  	p[2] = a[2] - b[2];
  
  	//perform rotation
  	r[0] = p[0]*Math.cos(c) - p[1]*Math.sin(c);
  	r[1] = p[0]*Math.sin(c) + p[1]*Math.cos(c);
  	r[2] = p[2];
  
  	//translate to correct position
  	out[0] = r[0] + b[0];
  	out[1] = r[1] + b[1];
  	out[2] = r[2] + b[2];
  
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
 * Subtracts vector b from vector a
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
 * Adds two vec4's after scaling the second operand by a scalar value
 *
 * @param {vec4} out the receiving vector
 * @param {vec4} a the first operand
 * @param {vec4} b the second operand
 * @param {Number} scale the amount to scale b by before adding
 * @returns {vec4} out
 */
vec4.scaleAndAdd = function(out, a, b, scale) {
    out[0] = a[0] + (b[0] * scale);
    out[1] = a[1] + (b[1] * scale);
    out[2] = a[2] + (b[2] * scale);
    out[3] = a[3] + (b[3] * scale);
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
 * Generates a random vector with the given scale
 *
 * @param {vec4} out the receiving vector
 * @param {Number} [scale] Length of the resulting vector. If ommitted, a unit vector will be returned
 * @returns {vec4} out
 */
vec4.random = function (out, scale) {
    scale = scale || 1.0;

    //TODO: This is a pretty awful way of doing this. Find something better.
    out[0] = GLMAT_RANDOM();
    out[1] = GLMAT_RANDOM();
    out[2] = GLMAT_RANDOM();
    out[3] = GLMAT_RANDOM();
    vec4.normalize(out, out);
    vec4.scale(out, out, scale);
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
    out[0] = a0 * b0 + a2 * b1;
    out[1] = a1 * b0 + a3 * b1;
    out[2] = a0 * b2 + a2 * b3;
    out[3] = a1 * b2 + a3 * b3;
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
    out[0] = a0 *  c + a2 * s;
    out[1] = a1 *  c + a3 * s;
    out[2] = a0 * -s + a2 * c;
    out[3] = a1 * -s + a3 * c;
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
    out[1] = a1 * v0;
    out[2] = a2 * v1;
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

/**
 * Returns Frobenius norm of a mat2
 *
 * @param {mat2} a the matrix to calculate Frobenius norm of
 * @returns {Number} Frobenius norm
 */
mat2.frob = function (a) {
    return(Math.sqrt(Math.pow(a[0], 2) + Math.pow(a[1], 2) + Math.pow(a[2], 2) + Math.pow(a[3], 2)))
};

/**
 * Returns L, D and U matrices (Lower triangular, Diagonal and Upper triangular) by factorizing the input matrix
 * @param {mat2} L the lower triangular matrix 
 * @param {mat2} D the diagonal matrix 
 * @param {mat2} U the upper triangular matrix 
 * @param {mat2} a the input matrix to factorize
 */

mat2.LDU = function (L, D, U, a) { 
    L[2] = a[2]/a[0]; 
    U[0] = a[0]; 
    U[1] = a[1]; 
    U[3] = a[3] - L[2] * U[1]; 
    return [L, D, U];       
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
 * [a, c, tx,
 *  b, d, ty]
 * </pre>
 * This is a short form for the 3x3 matrix:
 * <pre>
 * [a, c, tx,
 *  b, d, ty,
 *  0, 0, 1]
 * </pre>
 * The last row is ignored so the array is shorter and operations are faster.
 */

var mat2d = {};

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
    var a0 = a[0], a1 = a[1], a2 = a[2], a3 = a[3], a4 = a[4], a5 = a[5],
        b0 = b[0], b1 = b[1], b2 = b[2], b3 = b[3], b4 = b[4], b5 = b[5];
    out[0] = a0 * b0 + a2 * b1;
    out[1] = a1 * b0 + a3 * b1;
    out[2] = a0 * b2 + a2 * b3;
    out[3] = a1 * b2 + a3 * b3;
    out[4] = a0 * b4 + a2 * b5 + a4;
    out[5] = a1 * b4 + a3 * b5 + a5;
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
    var a0 = a[0], a1 = a[1], a2 = a[2], a3 = a[3], a4 = a[4], a5 = a[5],
        s = Math.sin(rad),
        c = Math.cos(rad);
    out[0] = a0 *  c + a2 * s;
    out[1] = a1 *  c + a3 * s;
    out[2] = a0 * -s + a2 * c;
    out[3] = a1 * -s + a3 * c;
    out[4] = a4;
    out[5] = a5;
    return out;
};

/**
 * Scales the mat2d by the dimensions in the given vec2
 *
 * @param {mat2d} out the receiving matrix
 * @param {mat2d} a the matrix to translate
 * @param {vec2} v the vec2 to scale the matrix by
 * @returns {mat2d} out
 **/
mat2d.scale = function(out, a, v) {
    var a0 = a[0], a1 = a[1], a2 = a[2], a3 = a[3], a4 = a[4], a5 = a[5],
        v0 = v[0], v1 = v[1];
    out[0] = a0 * v0;
    out[1] = a1 * v0;
    out[2] = a2 * v1;
    out[3] = a3 * v1;
    out[4] = a4;
    out[5] = a5;
    return out;
};

/**
 * Translates the mat2d by the dimensions in the given vec2
 *
 * @param {mat2d} out the receiving matrix
 * @param {mat2d} a the matrix to translate
 * @param {vec2} v the vec2 to translate the matrix by
 * @returns {mat2d} out
 **/
mat2d.translate = function(out, a, v) {
    var a0 = a[0], a1 = a[1], a2 = a[2], a3 = a[3], a4 = a[4], a5 = a[5],
        v0 = v[0], v1 = v[1];
    out[0] = a0;
    out[1] = a1;
    out[2] = a2;
    out[3] = a3;
    out[4] = a0 * v0 + a2 * v1 + a4;
    out[5] = a1 * v0 + a3 * v1 + a5;
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

/**
 * Returns Frobenius norm of a mat2d
 *
 * @param {mat2d} a the matrix to calculate Frobenius norm of
 * @returns {Number} Frobenius norm
 */
mat2d.frob = function (a) { 
    return(Math.sqrt(Math.pow(a[0], 2) + Math.pow(a[1], 2) + Math.pow(a[2], 2) + Math.pow(a[3], 2) + Math.pow(a[4], 2) + Math.pow(a[5], 2) + 1))
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
 * Copies the upper-left 3x3 values into the given mat3.
 *
 * @param {mat3} out the receiving 3x3 matrix
 * @param {mat4} a   the source 4x4 matrix
 * @returns {mat3} out
 */
mat3.fromMat4 = function(out, a) {
    out[0] = a[0];
    out[1] = a[1];
    out[2] = a[2];
    out[3] = a[4];
    out[4] = a[5];
    out[5] = a[6];
    out[6] = a[8];
    out[7] = a[9];
    out[8] = a[10];
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
    var x = v[0], y = v[1];

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
 * @param {mat2d} a the matrix to copy
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
        yx = y * x2,
        yy = y * y2,
        zx = z * x2,
        zy = z * y2,
        zz = z * z2,
        wx = w * x2,
        wy = w * y2,
        wz = w * z2;

    out[0] = 1 - yy - zz;
    out[3] = yx - wz;
    out[6] = zx + wy;

    out[1] = yx + wz;
    out[4] = 1 - xx - zz;
    out[7] = zy - wx;

    out[2] = zx - wy;
    out[5] = zy + wx;
    out[8] = 1 - xx - yy;

    return out;
};

/**
* Calculates a 3x3 normal matrix (transpose inverse) from the 4x4 matrix
*
* @param {mat3} out mat3 receiving operation result
* @param {mat4} a Mat4 to derive the normal matrix from
*
* @returns {mat3} out
*/
mat3.normalFromMat4 = function (out, a) {
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
    out[1] = (a12 * b08 - a10 * b11 - a13 * b07) * det;
    out[2] = (a10 * b10 - a11 * b08 + a13 * b06) * det;

    out[3] = (a02 * b10 - a01 * b11 - a03 * b09) * det;
    out[4] = (a00 * b11 - a02 * b08 + a03 * b07) * det;
    out[5] = (a01 * b08 - a00 * b10 - a03 * b06) * det;

    out[6] = (a31 * b05 - a32 * b04 + a33 * b03) * det;
    out[7] = (a32 * b02 - a30 * b05 - a33 * b01) * det;
    out[8] = (a30 * b04 - a31 * b02 + a33 * b00) * det;

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

/**
 * Returns Frobenius norm of a mat3
 *
 * @param {mat3} a the matrix to calculate Frobenius norm of
 * @returns {Number} Frobenius norm
 */
mat3.frob = function (a) {
    return(Math.sqrt(Math.pow(a[0], 2) + Math.pow(a[1], 2) + Math.pow(a[2], 2) + Math.pow(a[3], 2) + Math.pow(a[4], 2) + Math.pow(a[5], 2) + Math.pow(a[6], 2) + Math.pow(a[7], 2) + Math.pow(a[8], 2)))
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

mat4.fromQuat = function (out, q) {
    var x = q[0], y = q[1], z = q[2], w = q[3],
        x2 = x + x,
        y2 = y + y,
        z2 = z + z,

        xx = x * x2,
        yx = y * x2,
        yy = y * y2,
        zx = z * x2,
        zy = z * y2,
        zz = z * z2,
        wx = w * x2,
        wy = w * y2,
        wz = w * z2;

    out[0] = 1 - yy - zz;
    out[1] = yx + wz;
    out[2] = zx - wy;
    out[3] = 0;

    out[4] = yx - wz;
    out[5] = 1 - xx - zz;
    out[6] = zy + wx;
    out[7] = 0;

    out[8] = zx + wy;
    out[9] = zy - wx;
    out[10] = 1 - xx - yy;
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

/**
 * Returns Frobenius norm of a mat4
 *
 * @param {mat4} a the matrix to calculate Frobenius norm of
 * @returns {Number} Frobenius norm
 */
mat4.frob = function (a) {
    return(Math.sqrt(Math.pow(a[0], 2) + Math.pow(a[1], 2) + Math.pow(a[2], 2) + Math.pow(a[3], 2) + Math.pow(a[4], 2) + Math.pow(a[5], 2) + Math.pow(a[6], 2) + Math.pow(a[6], 2) + Math.pow(a[7], 2) + Math.pow(a[8], 2) + Math.pow(a[9], 2) + Math.pow(a[10], 2) + Math.pow(a[11], 2) + Math.pow(a[12], 2) + Math.pow(a[13], 2) + Math.pow(a[14], 2) + Math.pow(a[15], 2) ))
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
 * Sets a quaternion to represent the shortest rotation from one
 * vector to another.
 *
 * Both vectors are assumed to be unit length.
 *
 * @param {quat} out the receiving quaternion.
 * @param {vec3} a the initial vector
 * @param {vec3} b the destination vector
 * @returns {quat} out
 */
quat.rotationTo = (function() {
    var tmpvec3 = vec3.create();
    var xUnitVec3 = vec3.fromValues(1,0,0);
    var yUnitVec3 = vec3.fromValues(0,1,0);

    return function(out, a, b) {
        var dot = vec3.dot(a, b);
        if (dot < -0.999999) {
            vec3.cross(tmpvec3, xUnitVec3, a);
            if (vec3.length(tmpvec3) < 0.000001)
                vec3.cross(tmpvec3, yUnitVec3, a);
            vec3.normalize(tmpvec3, tmpvec3);
            quat.setAxisAngle(out, tmpvec3, Math.PI);
            return out;
        } else if (dot > 0.999999) {
            out[0] = 0;
            out[1] = 0;
            out[2] = 0;
            out[3] = 1;
            return out;
        } else {
            vec3.cross(tmpvec3, a, b);
            out[0] = tmpvec3[0];
            out[1] = tmpvec3[1];
            out[2] = tmpvec3[2];
            out[3] = 1 + dot;
            return quat.normalize(out, out);
        }
    };
})();

/**
 * Sets the specified quaternion with values corresponding to the given
 * axes. Each axis is a vec3 and is expected to be unit length and
 * perpendicular to all other specified axes.
 *
 * @param {vec3} view  the vector representing the viewing direction
 * @param {vec3} right the vector representing the local "right" direction
 * @param {vec3} up    the vector representing the local "up" direction
 * @returns {quat} out
 */
quat.setAxes = (function() {
    var matr = mat3.create();

    return function(out, view, right, up) {
        matr[0] = right[0];
        matr[3] = right[1];
        matr[6] = right[2];

        matr[1] = up[0];
        matr[4] = up[1];
        matr[7] = up[2];

        matr[2] = -view[0];
        matr[5] = -view[1];
        matr[8] = -view[2];

        return quat.normalize(out, quat.fromMat3(out, matr));
    };
})();

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
 * Rotates a quaternion by the given angle about the X axis
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
 * Rotates a quaternion by the given angle about the Y axis
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
 * Rotates a quaternion by the given angle about the Z axis
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
    // benchmarks:
    //    http://jsperf.com/quaternion-slerp-implementations

    var ax = a[0], ay = a[1], az = a[2], aw = a[3],
        bx = b[0], by = b[1], bz = b[2], bw = b[3];

    var        omega, cosom, sinom, scale0, scale1;

    // calc cosine
    cosom = ax * bx + ay * by + az * bz + aw * bw;
    // adjust signs (if necessary)
    if ( cosom < 0.0 ) {
        cosom = -cosom;
        bx = - bx;
        by = - by;
        bz = - bz;
        bw = - bw;
    }
    // calculate coefficients
    if ( (1.0 - cosom) > 0.000001 ) {
        // standard case (slerp)
        omega  = Math.acos(cosom);
        sinom  = Math.sin(omega);
        scale0 = Math.sin((1.0 - t) * omega) / sinom;
        scale1 = Math.sin(t * omega) / sinom;
    } else {        
        // "from" and "to" quaternions are very close 
        //  ... so we can do a linear interpolation
        scale0 = 1.0 - t;
        scale1 = t;
    }
    // calculate final values
    out[0] = scale0 * ax + scale1 * bx;
    out[1] = scale0 * ay + scale1 * by;
    out[2] = scale0 * az + scale1 * bz;
    out[3] = scale0 * aw + scale1 * bw;
    
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
 * NOTE: The resultant quaternion is not normalized, so you should be sure
 * to renormalize the quaternion yourself where necessary.
 *
 * @param {quat} out the receiving quaternion
 * @param {mat3} m rotation matrix
 * @returns {quat} out
 * @function
 */
quat.fromMat3 = function(out, m) {
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
        var j = (i+1)%3;
        var k = (i+2)%3;
        
        fRoot = Math.sqrt(m[i*3+i]-m[j*3+j]-m[k*3+k] + 1.0);
        out[i] = 0.5 * fRoot;
        fRoot = 0.5 / fRoot;
        out[3] = (m[k*3+j] - m[j*3+k]) * fRoot;
        out[j] = (m[j*3+i] + m[i*3+j]) * fRoot;
        out[k] = (m[k*3+i] + m[i*3+k]) * fRoot;
    }
    
    return out;
};

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
})(this);

},{}],2:[function(_dereq_,module,exports){
(function() {
  var slice = [].slice;

  function queue(parallelism) {
    var q,
        tasks = [],
        started = 0, // number of tasks that have been started (and perhaps finished)
        active = 0, // number of tasks currently being executed (started but not finished)
        remaining = 0, // number of tasks not yet finished
        popping, // inside a synchronous task callback?
        error = null,
        await = noop,
        all;

    if (!parallelism) parallelism = Infinity;

    function pop() {
      while (popping = started < tasks.length && active < parallelism) {
        var i = started++,
            t = tasks[i],
            a = slice.call(t, 1);
        a.push(callback(i));
        ++active;
        t[0].apply(null, a);
      }
    }

    function callback(i) {
      return function(e, r) {
        --active;
        if (error != null) return;
        if (e != null) {
          error = e; // ignore new tasks and squelch active callbacks
          started = remaining = NaN; // stop queued tasks from starting
          notify();
        } else {
          tasks[i] = r;
          if (--remaining) popping || pop();
          else notify();
        }
      };
    }

    function notify() {
      if (error != null) await(error);
      else if (all) await(error, tasks);
      else await.apply(null, [error].concat(tasks));
    }

    return q = {
      defer: function() {
        if (!error) {
          tasks.push(arguments);
          ++remaining;
          pop();
        }
        return q;
      },
      await: function(f) {
        await = f;
        all = false;
        if (!remaining) notify();
        return q;
      },
      awaitAll: function(f) {
        await = f;
        all = true;
        if (!remaining) notify();
        return q;
      }
    };
  }

  function noop() {}

  queue.version = "1.0.7";
  if (typeof define === "function" && define.amd) define(function() { return queue; });
  else if (typeof module === "object" && module.exports) module.exports = queue;
  else this.queue = queue;
})();

},{}],3:[function(_dereq_,module,exports){
"use strict";
Object.defineProperties(exports, {
  default: {get: function() {
      return $__default;
    }},
  PerspectiveCamera: {get: function() {
      return PerspectiveCamera;
    }},
  IsometricCamera: {get: function() {
      return IsometricCamera;
    }},
  FlatCamera: {get: function() {
      return FlatCamera;
    }},
  __esModule: {value: true}
});
var Geo = _dereq_('./geo').Geo;
var GLProgram = _dereq_('./gl/gl_program').default;
var $__2 = _dereq_('gl-matrix'),
    mat4 = $__2.mat4,
    vec3 = $__2.vec3;
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
  this.focal_length = 2.5;
  this.perspective_mat = mat4.create();
  GLProgram.removeTransform('camera');
  GLProgram.addTransform('camera', 'uniform mat4 u_perspective;', 'void cameraProjection (inout vec4 position) { \n\
                position = u_perspective * position; \n\
            }');
};
var $PerspectiveCamera = PerspectiveCamera;
($traceurRuntime.createClass)(PerspectiveCamera, {
  update: function() {
    var meter_zoom_y = this.scene.css_size.height * Geo.metersPerPixel(this.scene.zoom);
    var camera_height = meter_zoom_y / 2 * this.focal_length;
    var fov = Math.atan(1 / this.focal_length) * 2;
    var aspect = this.scene.view_aspect;
    var znear = 1;
    var zfar = (camera_height + znear) * 5;
    mat4.perspective(this.perspective_mat, fov, aspect, znear, zfar);
    mat4.translate(this.perspective_mat, this.perspective_mat, vec3.fromValues(0, 0, -camera_height));
  },
  setupProgram: function(gl_program) {
    gl_program.uniform('Matrix4fv', 'u_perspective', false, this.perspective_mat);
  }
}, {}, Camera);
var IsometricCamera = function IsometricCamera(scene) {
  var options = arguments[1] !== (void 0) ? arguments[1] : {};
  $traceurRuntime.superCall(this, $IsometricCamera.prototype, "constructor", [scene]);
  this.meter_view_mat = mat4.create();
  GLProgram.removeTransform('camera');
  GLProgram.addTransform('camera', 'uniform mat4 u_meter_view;', 'vec2 isometric_axis = vec2(0., 1.);', 'float isometric_scale = 1.;', 'void cameraProjection (inout vec4 position) { \n\
                position = u_meter_view * position; \n\
                position.xy += position.z * isometric_axis * isometric_scale / 1.; \n\
                                                                                    \n\
                // Reverse z for depth buffer so up is negative, \n\
                // and scale down values so objects higher than one screen height will not get clipped \n\
                position.z = -position.z / 100. + 1.; \n\
            }');
};
var $IsometricCamera = IsometricCamera;
($traceurRuntime.createClass)(IsometricCamera, {
  update: function() {
    mat4.identity(this.meter_view_mat);
    mat4.scale(this.meter_view_mat, this.meter_view_mat, vec3.fromValues(1 / this.scene.meter_zoom.x, 1 / this.scene.meter_zoom.y, 1 / this.scene.meter_zoom.y));
  },
  setupProgram: function(gl_program) {
    gl_program.uniform('Matrix4fv', 'u_meter_view', false, this.meter_view_mat);
  }
}, {}, Camera);
var FlatCamera = function FlatCamera(scene) {
  var options = arguments[1] !== (void 0) ? arguments[1] : {};
  $traceurRuntime.superCall(this, $FlatCamera.prototype, "constructor", [scene]);
  this.meter_view_mat = mat4.create();
  GLProgram.removeTransform('camera');
  GLProgram.addTransform('camera', 'uniform mat4 u_meter_view;', 'void cameraProjection (inout vec4 position) { \n\
                position = u_meter_view * position; \n\
                                                                \n\
                // Reverse z for depth buffer so up is negative, \n\
                // and scale down values so objects higher than one screen height will not get clipped \n\
                position.z = -position.z / 100. + 1.; \n\
            }');
};
var $FlatCamera = FlatCamera;
($traceurRuntime.createClass)(FlatCamera, {
  update: function() {
    mat4.identity(this.meter_view_mat);
    mat4.scale(this.meter_view_mat, this.meter_view_mat, vec3.fromValues(1 / this.scene.meter_zoom.x, 1 / this.scene.meter_zoom.y, 1 / this.scene.meter_zoom.y));
  },
  setupProgram: function(gl_program) {
    gl_program.uniform('Matrix4fv', 'u_meter_view', false, this.meter_view_mat);
  }
}, {}, Camera);


},{"./geo":4,"./gl/gl_program":9,"gl-matrix":1}],4:[function(_dereq_,module,exports){
"use strict";
Object.defineProperties(exports, {
  Geo: {get: function() {
      return Geo;
    }},
  __esModule: {value: true}
});
var Point = _dereq_('./point').default;
var Geo = {};
Geo.tile_size = 256;
Geo.half_circumference_meters = 20037508.342789244;
Geo.map_origin_meters = Point(-Geo.half_circumference_meters, Geo.half_circumference_meters);
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
  return Point((tile.x * Geo.tile_size * Geo.meters_per_pixel[tile.z]) + Geo.map_origin_meters.x, ((tile.y * Geo.tile_size * Geo.meters_per_pixel[tile.z]) * -1) + Geo.map_origin_meters.y);
};
Geo.metersToLatLng = function(meters) {
  var c = Point.copy(meters);
  c.x /= Geo.half_circumference_meters;
  c.y /= Geo.half_circumference_meters;
  c.y = (2 * Math.atan(Math.exp(c.y * Math.PI)) - (Math.PI / 2)) / Math.PI;
  c.x *= 180;
  c.y *= 180;
  return c;
};
Geo.latLngToMeters = function(latlng) {
  var c = Point.copy(latlng);
  c.y = Math.log(Math.tan((c.y + 90) * Math.PI / 360)) / (Math.PI / 180);
  c.y = c.y * Geo.half_circumference_meters / 180;
  c.x = c.x * Geo.half_circumference_meters / 180;
  return c;
};
Geo.transformGeometry = function(geometry, transform) {
  if (geometry.type == 'Point') {
    return transform(geometry.coordinates);
  } else if (geometry.type == 'LineString' || geometry.type == 'MultiPoint') {
    return geometry.coordinates.map(transform);
  } else if (geometry.type == 'Polygon' || geometry.type == 'MultiLineString') {
    return geometry.coordinates.map(function(coordinates) {
      return coordinates.map(transform);
    });
  } else if (geometry.type == 'MultiPolygon') {
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
Geo.splitFeatureLines = function(feature, tolerance) {
  var tolerance = tolerance || 0.001;
  var tolerance_sq = tolerance * tolerance;
  var geom = feature.geometry;
  var lines;
  if (geom.type == 'MultiLineString') {
    lines = geom.coordinates;
  } else if (geom.type == 'LineString') {
    lines = [geom.coordinates];
  } else {
    return feature;
  }
  var split_lines = [];
  for (var s = 0; s < lines.length; s++) {
    var seg = lines[s];
    var split_seg = [];
    var last_coord = null;
    var keep;
    for (var c = 0; c < seg.length; c++) {
      var coord = seg[c];
      keep = true;
      if (last_coord != null) {
        var dist = (coord[0] - last_coord[0]) * (coord[0] - last_coord[0]) + (coord[1] - last_coord[1]) * (coord[1] - last_coord[1]);
        if (dist > tolerance_sq) {
          keep = false;
        }
      }
      if (keep == false) {
        split_lines.push(split_seg);
        split_seg = [];
      }
      split_seg.push(coord);
      last_coord = coord;
    }
    split_lines.push(split_seg);
    split_seg = [];
  }
  if (split_lines.length == 1) {
    geom.type = 'LineString';
    geom.coordinates = split_lines[0];
  } else {
    geom.type = 'MultiLineString';
    geom.coordinates = split_lines;
  }
  return feature;
};


},{"./point":15}],5:[function(_dereq_,module,exports){
"use strict";
Object.defineProperties(exports, {
  GL: {get: function() {
      return GL;
    }},
  __esModule: {value: true}
});
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
  if (fullscreen == true) {
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
    console.log(err);
    return program;
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
    var program_error = "WebGL program error:\n" + "VALIDATE_STATUS: " + gl.getProgramParameter(program, gl.VALIDATE_STATUS) + "\n" + "ERROR: " + gl.getError() + "\n\n" + "--- Vertex Shader ---\n" + vertex_shader_source + "\n\n" + "--- Fragment Shader ---\n" + fragment_shader_source;
    console.log(program_error);
    throw program_error;
  }
  return program;
};
GL.createShader = function GLcreateShader(gl, source, type) {
  var shader = gl.createShader(type);
  gl.shaderSource(shader, source);
  gl.compileShader(shader);
  if (!gl.getShaderParameter(shader, gl.COMPILE_STATUS)) {
    var shader_error = "WebGL shader error:\n" + (type == gl.VERTEX_SHADER ? "VERTEX" : "FRAGMENT") + " SHADER:\n" + gl.getShaderInfoLog(shader);
    throw shader_error;
  }
  return shader;
};
try {
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
    function edgeCallback(flag) {}
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
} catch (e) {}
GL.addVertices = function(vertices, vertex_constants, vertex_data) {
  if (vertices == null) {
    return vertex_data;
  }
  vertex_constants = vertex_constants || [];
  for (var v = 0,
      vlen = vertices.length; v < vlen; v++) {
    vertex_data.push.apply(vertex_data, vertices[v]);
    vertex_data.push.apply(vertex_data, vertex_constants);
  }
  return vertex_data;
};
GL.addVerticesMultipleAttributes = function(dynamics, constants, vertex_data) {
  var dlen = dynamics.length;
  var vlen = dynamics[0].length;
  constants = constants || [];
  for (var v = 0; v < vlen; v++) {
    for (var d = 0; d < dlen; d++) {
      vertex_data.push.apply(vertex_data, dynamics[d][v]);
    }
    vertex_data.push.apply(vertex_data, constants);
  }
  return vertex_data;
};


},{}],6:[function(_dereq_,module,exports){
"use strict";
Object.defineProperties(exports, {
  GLBuilders: {get: function() {
      return GLBuilders;
    }},
  __esModule: {value: true}
});
var Point = _dereq_('../point').default;
var Vector = _dereq_('../vector').Vector;
var GL = _dereq_('./gl').GL;
var GLBuilders = {};
GLBuilders.debug = false;
GLBuilders.buildPolygons = function GLBuildersBuildPolygons(polygons, z, vertex_data, options) {
  options = options || {};
  var vertex_constants = [];
  if (z != null) {
    vertex_constants.push(z);
  }
  if (options.normals) {
    vertex_constants.push(0, 0, 1);
  }
  if (options.vertex_constants) {
    vertex_constants.push.apply(vertex_constants, options.vertex_constants);
  }
  if (vertex_constants.length == 0) {
    vertex_constants = null;
  }
  var num_polygons = polygons.length;
  for (var p = 0; p < num_polygons; p++) {
    var vertices = GL.triangulatePolygon(polygons[p]);
    GL.addVertices(vertices, vertex_constants, vertex_data);
  }
  return vertex_data;
};
GLBuilders.buildExtrudedPolygons = function GLBuildersBuildExtrudedPolygon(polygons, z, height, min_height, vertex_data, options) {
  options = options || {};
  var min_z = z + (min_height || 0);
  var max_z = z + height;
  GLBuilders.buildPolygons(polygons, max_z, vertex_data, {
    normals: true,
    vertex_constants: options.vertex_constants
  });
  var wall_vertex_constants = [null, null, null];
  if (options.vertex_constants) {
    wall_vertex_constants.push.apply(wall_vertex_constants, options.vertex_constants);
  }
  var num_polygons = polygons.length;
  for (var p = 0; p < num_polygons; p++) {
    var polygon = polygons[p];
    for (var q = 0; q < polygon.length; q++) {
      var contour = polygon[q];
      for (var w = 0; w < contour.length - 1; w++) {
        var wall_vertices = [];
        wall_vertices.push([contour[w + 1][0], contour[w + 1][1], max_z], [contour[w + 1][0], contour[w + 1][1], min_z], [contour[w][0], contour[w][1], min_z], [contour[w][0], contour[w][1], min_z], [contour[w][0], contour[w][1], max_z], [contour[w + 1][0], contour[w + 1][1], max_z]);
        var normal = Vector.cross([0, 0, 1], Vector.normalize([contour[w + 1][0] - contour[w][0], contour[w + 1][1] - contour[w][1], 0]));
        wall_vertex_constants[0] = normal[0];
        wall_vertex_constants[1] = normal[1];
        wall_vertex_constants[2] = normal[2];
        GL.addVertices(wall_vertices, wall_vertex_constants, vertex_data);
      }
    }
  }
  return vertex_data;
};
GLBuilders.buildPolylines = function GLBuildersBuildPolylines(lines, z, width, vertex_data, options) {
  options = options || {};
  options.closed_polygon = options.closed_polygon || false;
  options.remove_tile_edges = options.remove_tile_edges || false;
  var vertex_constants = [z, 0, 0, 1];
  if (options.vertex_constants) {
    vertex_constants.push.apply(vertex_constants, options.vertex_constants);
  }
  if (GLBuilders.debug && options.vertex_lines) {
    var num_lines = lines.length;
    for (var ln = 0; ln < num_lines; ln++) {
      var line = lines[ln];
      for (var p = 0; p < line.length - 1; p++) {
        var pa = line[p];
        var pb = line[p + 1];
        options.vertex_lines.push(pa[0], pa[1], z + 0.001, 0, 0, 1, 1.0, 0, 0, pb[0], pb[1], z + 0.001, 0, 0, 1, 1.0, 0, 0);
      }
    }
    ;
  }
  var vertices = [];
  var num_lines = lines.length;
  for (var ln = 0; ln < num_lines; ln++) {
    var line = lines[ln];
    if (line.length > 2) {
      var anchors = [];
      if (line.length > 3) {
        var mid = [];
        var p,
            pmax;
        if (options.closed_polygon == true) {
          p = 0;
          pmax = line.length - 1;
        } else {
          p = 1;
          pmax = line.length - 2;
          mid.push(line[0]);
        }
        for (; p < pmax; p++) {
          var pa = line[p];
          var pb = line[p + 1];
          mid.push([(pa[0] + pb[0]) / 2, (pa[1] + pb[1]) / 2]);
        }
        var mmax;
        if (options.closed_polygon == true) {
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
      for (var p = 0; p < anchors.length; p++) {
        if (!options.remove_tile_edges) {
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
    } else if (line.length == 2) {
      buildSegment(line[0], line[1]);
    }
  }
  ;
  GL.addVertices(vertices, vertex_constants, vertex_data);
  function buildSegment(pa, pb) {
    var slope = Vector.normalize([(pb[1] - pa[1]) * -1, pb[0] - pa[0]]);
    var pa_outer = [pa[0] + slope[0] * width / 2, pa[1] + slope[1] * width / 2];
    var pa_inner = [pa[0] - slope[0] * width / 2, pa[1] - slope[1] * width / 2];
    var pb_outer = [pb[0] + slope[0] * width / 2, pb[1] + slope[1] * width / 2];
    var pb_inner = [pb[0] - slope[0] * width / 2, pb[1] - slope[1] * width / 2];
    vertices.push(pb_inner, pb_outer, pa_inner, pa_inner, pb_outer, pa_outer);
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
    if (GLBuilders.debug && options.vertex_lines) {
      options.vertex_lines.push(pa_inner[0][0], pa_inner[0][1], z + 0.001, 0, 0, 1, 0, 1.0, 0, pa_inner[1][0], pa_inner[1][1], z + 0.001, 0, 0, 1, 0, 1.0, 0, pb_inner[0][0], pb_inner[0][1], z + 0.001, 0, 0, 1, 0, 1.0, 0, pb_inner[1][0], pb_inner[1][1], z + 0.001, 0, 0, 1, 0, 1.0, 0, pa_outer[0][0], pa_outer[0][1], z + 0.001, 0, 0, 1, 0, 1.0, 0, pa_outer[1][0], pa_outer[1][1], z + 0.001, 0, 0, 1, 0, 1.0, 0, pb_outer[0][0], pb_outer[0][1], z + 0.001, 0, 0, 1, 0, 1.0, 0, pb_outer[1][0], pb_outer[1][1], z + 0.001, 0, 0, 1, 0, 1.0, 0, pa_inner[0][0], pa_inner[0][1], z + 0.001, 0, 0, 1, 0, 1.0, 0, pa_outer[0][0], pa_outer[0][1], z + 0.001, 0, 0, 1, 0, 1.0, 0, pa_inner[1][0], pa_inner[1][1], z + 0.001, 0, 0, 1, 0, 1.0, 0, pa_outer[1][0], pa_outer[1][1], z + 0.001, 0, 0, 1, 0, 1.0, 0, pb_inner[0][0], pb_inner[0][1], z + 0.001, 0, 0, 1, 0, 1.0, 0, pb_outer[0][0], pb_outer[0][1], z + 0.001, 0, 0, 1, 0, 1.0, 0, pb_inner[1][0], pb_inner[1][1], z + 0.001, 0, 0, 1, 0, 1.0, 0, pb_outer[1][0], pb_outer[1][1], z + 0.001, 0, 0, 1, 0, 1.0, 0);
    }
    if (GLBuilders.debug && line_debug && options.vertex_lines) {
      var dcolor;
      if (line_debug == 'parallel') {
        dcolor = [0, 1, 0];
      } else if (line_debug == 'distance') {
        dcolor = [1, 0, 0];
      }
      options.vertex_lines.push(pa[0], pa[1], z + 0.002, 0, 0, 1, dcolor[0], dcolor[1], dcolor[2], joint[0], joint[1], z + 0.002, 0, 0, 1, dcolor[0], dcolor[1], dcolor[2], joint[0], joint[1], z + 0.002, 0, 0, 1, dcolor[0], dcolor[1], dcolor[2], pb[0], pb[1], z + 0.002, 0, 0, 1, dcolor[0], dcolor[1], dcolor[2]);
      var num_lines = lines.length;
      for (var ln = 0; ln < num_lines; ln++) {
        var line2 = lines[ln];
        for (var p = 0; p < line2.length - 1; p++) {
          var pa = line2[p];
          var pb = line2[p + 1];
          options.vertex_lines.push(pa[0], pa[1], z + 0.0005, 0, 0, 1, 0, 0, 1.0, pb[0], pb[1], z + 0.0005, 0, 0, 1, 0, 0, 1.0);
        }
      }
      ;
    }
  }
  return vertex_data;
};
GLBuilders.buildQuadsForPoints = function(points, width, height, z, vertex_data, options) {
  var options = options || {};
  var vertex_constants = [];
  if (options.normals) {
    vertex_constants.push(0, 0, 1);
  }
  if (options.vertex_constants) {
    vertex_constants.push.apply(vertex_constants, options.vertex_constants);
  }
  if (vertex_constants.length == 0) {
    vertex_constants = null;
  }
  var num_points = points.length;
  for (var p = 0; p < num_points; p++) {
    var point = points[p];
    var positions = [[point[0] - width / 2, point[1] - height / 2], [point[0] + width / 2, point[1] - height / 2], [point[0] + width / 2, point[1] + height / 2], [point[0] - width / 2, point[1] - height / 2], [point[0] + width / 2, point[1] + height / 2], [point[0] - width / 2, point[1] + height / 2]];
    if (z != null) {
      positions[0][2] = z;
      positions[1][2] = z;
      positions[2][2] = z;
      positions[3][2] = z;
      positions[4][2] = z;
      positions[5][2] = z;
    }
    if (options.texcoords == true) {
      var texcoords = [[-1, -1], [1, -1], [1, 1], [-1, -1], [1, 1], [-1, 1]];
      GL.addVerticesMultipleAttributes([positions, texcoords], vertex_constants, vertex_data);
    } else {
      GL.addVertices(positions, vertex_constants, vertex_data);
    }
  }
  return vertex_data;
};
GLBuilders.buildLines = function GLBuildersBuildLines(lines, feature, layer, style, tile, z, vertex_data, options) {
  options = options || {};
  var color = style.color;
  var width = style.width;
  var num_lines = lines.length;
  for (var ln = 0; ln < num_lines; ln++) {
    var line = lines[ln];
    for (var p = 0; p < line.length - 1; p++) {
      var pa = line[p];
      var pb = line[p + 1];
      vertex_data.push(pa[0], pa[1], z, 0, 0, 1, color[0], color[1], color[2], pb[0], pb[1], z, 0, 0, 1, color[0], color[1], color[2]);
    }
  }
  ;
  return vertex_data;
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
  GLBuilders.tile_bounds = [Point(0, 0), Point(scale, -scale)];
};
GLBuilders.valuesWithinTolerance = function(a, b, tolerance) {
  tolerance = tolerance || 1;
  return (Math.abs(a - b) < tolerance);
};
GLBuilders.buildZigzagLineTestPattern = function() {
  var min = Point(0, 0);
  var max = Point(4096, 4096);
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


},{"../point":15,"../vector":19,"./gl":5}],7:[function(_dereq_,module,exports){
"use strict";
Object.defineProperties(exports, {
  default: {get: function() {
      return $__default;
    }},
  __esModule: {value: true}
});
var GL = _dereq_('./gl').GL;
var GLVertexLayout = _dereq_('./gl_vertex_layout').default;
var GLProgram = _dereq_('./gl_program').default;
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
}
var $__default = GLGeometry;
GLGeometry.prototype.render = function(options) {
  options = options || {};
  if (typeof this._render_setup == 'function') {
    this._render_setup();
  }
  var gl_program = options.gl_program || GLProgram.current;
  gl_program.use();
  this.gl.bindBuffer(this.gl.ARRAY_BUFFER, this.buffer);
  this.vertex_layout.enable(this.gl, gl_program);
  this.gl.drawArrays(this.draw_mode, 0, this.vertex_count);
};
GLGeometry.prototype.destroy = function() {
  console.log("GLGeometry.destroy: delete buffer of size " + this.vertex_data.byteLength);
  this.gl.deleteBuffer(this.buffer);
  delete this.vertex_data;
};


},{"./gl":5,"./gl_program":9,"./gl_vertex_layout":12}],8:[function(_dereq_,module,exports){
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
var GL = _dereq_('./gl').GL;
var GLVertexLayout = _dereq_('./gl_vertex_layout').default;
var GLBuilders = _dereq_('./gl_builders').GLBuilders;
var GLProgram = _dereq_('./gl_program').default;
var GLGeometry = _dereq_('./gl_geom').default;
var shader_sources = _dereq_('./gl_shaders');
var Queue = _dereq_('queue-async');
var Modes = {};
var ModeManager = {};
var RenderMode = {
  init: function(gl) {
    this.gl = gl;
    this.makeGLProgram();
    if (typeof this._init == 'function') {
      this._init();
    }
  },
  refresh: function() {
    this.makeGLProgram();
  },
  defines: {},
  selection: false,
  buildPolygons: function() {},
  buildLines: function() {},
  buildPoints: function() {},
  makeGLGeometry: function(vertex_data) {
    return new GLGeometry(this.gl, vertex_data, this.vertex_layout);
  }
};
RenderMode.makeGLProgram = function() {
  var $__5 = this;
  var queue = Queue();
  var defines = this.buildDefineList();
  if (this.selection) {
    var selection_defines = Object.create(defines);
    selection_defines['FEATURE_SELECTION'] = true;
  }
  var transforms = (this.shaders && this.shaders.transforms);
  var program = (this.hasOwnProperty('gl_program') && this.gl_program);
  var selection_program = (this.hasOwnProperty('selection_gl_program') && this.selection_gl_program);
  queue.defer((function(complete) {
    if (!program) {
      program = new GLProgram($__5.gl, shader_sources[$__5.vertex_shader_key], shader_sources[$__5.fragment_shader_key], {
        defines: defines,
        transforms: transforms,
        name: $__5.name,
        callback: complete
      });
    } else {
      program.defines = defines;
      program.transforms = transforms;
      program.compile(complete);
    }
  }));
  if (this.selection) {
    queue.defer((function(complete) {
      if (!selection_program) {
        selection_program = new GLProgram($__5.gl, shader_sources[$__5.vertex_shader_key], shader_sources['selection_fragment'], {
          defines: selection_defines,
          transforms: transforms,
          name: ($__5.name + ' (selection)'),
          callback: complete
        });
      } else {
        selection_program.defines = selection_defines;
        selection_program.transforms = transforms;
        selection_program.compile(complete);
      }
    }));
  }
  queue.await((function() {
    if (program) {
      $__5.gl_program = program;
    }
    if (selection_program) {
      $__5.selection_gl_program = selection_program;
    }
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
    for (var d in this.shaders.defines) {
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
RenderMode.update = function() {
  if (typeof this.animation == 'function') {
    this.animation();
  }
};
ModeManager.configureMode = function(name, settings) {
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
Modes.polygons = Object.create(RenderMode);
Modes.polygons.name = 'polygons';
Modes.polygons.vertex_shader_key = 'polygon_vertex';
Modes.polygons.fragment_shader_key = 'polygon_fragment';
Modes.polygons.defines = {'WORLD_POSITION_WRAP': 100000};
Modes.polygons.selection = true;
Modes.polygons._init = function() {
  this.vertex_layout = new GLVertexLayout(this.gl, [{
    name: 'a_position',
    size: 3,
    type: this.gl.FLOAT,
    normalized: false
  }, {
    name: 'a_normal',
    size: 3,
    type: this.gl.FLOAT,
    normalized: false
  }, {
    name: 'a_color',
    size: 3,
    type: this.gl.FLOAT,
    normalized: false
  }, {
    name: 'a_selection_color',
    size: 4,
    type: this.gl.FLOAT,
    normalized: false
  }, {
    name: 'a_layer',
    size: 1,
    type: this.gl.FLOAT,
    normalized: false
  }]);
};
Modes.polygons.buildPolygons = function(polygons, style, vertex_data) {
  var vertex_constants = [style.color[0], style.color[1], style.color[2], style.selection.color[0], style.selection.color[1], style.selection.color[2], style.selection.color[3], style.layer_num];
  if (style.outline.color) {
    var outline_vertex_constants = [style.outline.color[0], style.outline.color[1], style.outline.color[2], style.selection.color[0], style.selection.color[1], style.selection.color[2], style.selection.color[3], style.layer_num - 0.5];
  }
  if (style.extrude && style.height) {
    GLBuilders.buildExtrudedPolygons(polygons, style.z, style.height, style.min_height, vertex_data, {vertex_constants: vertex_constants});
  } else {
    GLBuilders.buildPolygons(polygons, style.z, vertex_data, {
      normals: true,
      vertex_constants: vertex_constants
    });
  }
  if (style.outline.color && style.outline.width) {
    for (var mpc = 0; mpc < polygons.length; mpc++) {
      GLBuilders.buildPolylines(polygons[mpc], style.z, style.outline.width, vertex_data, {
        closed_polygon: true,
        remove_tile_edges: true,
        vertex_constants: outline_vertex_constants
      });
    }
  }
};
Modes.polygons.buildLines = function(lines, style, vertex_data) {
  var vertex_constants = [style.color[0], style.color[1], style.color[2], style.selection.color[0], style.selection.color[1], style.selection.color[2], style.selection.color[3], style.layer_num];
  if (style.outline.color) {
    var outline_vertex_constants = [style.outline.color[0], style.outline.color[1], style.outline.color[2], style.selection.color[0], style.selection.color[1], style.selection.color[2], style.selection.color[3], style.layer_num - 0.5];
  }
  GLBuilders.buildPolylines(lines, style.z, style.width, vertex_data, {vertex_constants: vertex_constants});
  if (style.outline.color && style.outline.width) {
    GLBuilders.buildPolylines(lines, style.z, style.width + 2 * style.outline.width, vertex_data, {vertex_constants: outline_vertex_constants});
  }
};
Modes.polygons.buildPoints = function(points, style, vertex_data) {
  var vertex_constants = [style.color[0], style.color[1], style.color[2], style.selection.color[0], style.selection.color[1], style.selection.color[2], style.selection.color[3], style.layer_num];
  GLBuilders.buildQuadsForPoints(points, style.size * 2, style.size * 2, style.z, vertex_data, {
    normals: true,
    texcoords: false,
    vertex_constants: vertex_constants
  });
};
Modes.points = Object.create(RenderMode);
Modes.points.name = 'points';
Modes.points.vertex_shader_key = 'point_vertex';
Modes.points.fragment_shader_key = 'point_fragment';
Modes.points.defines = {'EFFECT_SCREEN_COLOR': true};
Modes.points.selection = true;
Modes.points._init = function() {
  this.vertex_layout = new GLVertexLayout(this.gl, [{
    name: 'a_position',
    size: 3,
    type: this.gl.FLOAT,
    normalized: false
  }, {
    name: 'a_texcoord',
    size: 2,
    type: this.gl.FLOAT,
    normalized: false
  }, {
    name: 'a_color',
    size: 3,
    type: this.gl.FLOAT,
    normalized: false
  }, {
    name: 'a_selection_color',
    size: 4,
    type: this.gl.FLOAT,
    normalized: false
  }, {
    name: 'a_layer',
    size: 1,
    type: this.gl.FLOAT,
    normalized: false
  }]);
};
Modes.points.buildPoints = function(points, style, vertex_data) {
  var vertex_constants = [style.color[0], style.color[1], style.color[2], style.selection.color[0], style.selection.color[1], style.selection.color[2], style.selection.color[3], style.layer_num];
  GLBuilders.buildQuadsForPoints(points, style.size * 2, style.size * 2, style.z, vertex_data, {
    normals: false,
    texcoords: true,
    vertex_constants: vertex_constants
  });
};


},{"./gl":5,"./gl_builders":6,"./gl_geom":7,"./gl_program":9,"./gl_shaders":10,"./gl_vertex_layout":12,"queue-async":2}],9:[function(_dereq_,module,exports){
"use strict";
Object.defineProperties(exports, {
  default: {get: function() {
      return $__default;
    }},
  __esModule: {value: true}
});
var Utils = _dereq_('../utils');
var GL = _dereq_('./gl').GL;
var GLTexture = _dereq_('./gl_texture').default;
var Queue = _dereq_('queue-async');
GLProgram.id = 0;
GLProgram.programs = {};
function GLProgram(gl, vertex_shader, fragment_shader, options) {
  options = options || {};
  this.gl = gl;
  this.program = null;
  this.compiled = false;
  this.defines = options.defines || {};
  this.transforms = options.transforms || {};
  this.uniforms = {};
  this.attribs = {};
  this.vertex_shader = vertex_shader;
  this.fragment_shader = fragment_shader;
  this.id = GLProgram.id++;
  GLProgram.programs[this.id] = this;
  this.name = options.name;
  this.compile(options.callback);
}
var $__default = GLProgram;
;
GLProgram.prototype.use = function() {
  if (!this.compiled) {
    return;
  }
  if (GLProgram.current != this) {
    this.gl.useProgram(this.program);
  }
  GLProgram.current = this;
};
GLProgram.current = null;
GLProgram.defines = {};
GLProgram.transforms = {};
GLProgram.addTransform = function(key) {
  var $__4;
  for (var transforms = [],
      $__3 = 1; $__3 < arguments.length; $__3++)
    transforms[$__3 - 1] = arguments[$__3];
  GLProgram.transforms[key] = GLProgram.transforms[key] || [];
  ($__4 = GLProgram.transforms[key]).push.apply($__4, $traceurRuntime.spread(transforms));
};
GLProgram.removeTransform = function(key) {
  GLProgram.transforms[key] = [];
};
GLProgram.prototype.compile = function(callback) {
  var $__2 = this;
  var queue = Queue();
  this.computed_vertex_shader = this.vertex_shader;
  this.computed_fragment_shader = this.fragment_shader;
  var defines = this.buildDefineList();
  var transforms = this.buildShaderTransformList();
  var loaded_transforms = {};
  var regexp;
  for (var key in transforms) {
    var transform = transforms[key];
    if (transform == null) {
      continue;
    }
    if (!(typeof transform === 'object' && transform.length >= 0)) {
      transform = [transform];
    }
    var regexp = new RegExp('^\\s*#pragma\\s+tangram:\\s+' + key + '\\s*$', 'm');
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
      queue.defer(GLProgram.loadTransform, loaded_transforms, transform[u], key, u);
    }
    defines['TANGRAM_TRANSFORM_' + key.replace(' ', '_').toUpperCase()] = true;
  }
  queue.await((function(error) {
    if (error) {
      console.log("error loading transforms: " + error);
      return;
    }
    for (var t in loaded_transforms) {
      var combined_source = "";
      for (var s = 0; s < loaded_transforms[t].list.length; s++) {
        combined_source += loaded_transforms[t].list[s] + '\n';
      }
      if (loaded_transforms[t].inject_vertex != null) {
        $__2.computed_vertex_shader = $__2.computed_vertex_shader.replace(loaded_transforms[t].regexp, combined_source);
      }
      if (loaded_transforms[t].inject_fragment != null) {
        $__2.computed_fragment_shader = $__2.computed_fragment_shader.replace(loaded_transforms[t].regexp, combined_source);
      }
    }
    var regexp = new RegExp('^\\s*#pragma\\s+tangram:\\s+\\w+\\s*$', 'gm');
    $__2.computed_vertex_shader = $__2.computed_vertex_shader.replace(regexp, '');
    $__2.computed_fragment_shader = $__2.computed_fragment_shader.replace(regexp, '');
    var define_str = GLProgram.buildDefineString(defines);
    $__2.computed_vertex_shader = define_str + $__2.computed_vertex_shader;
    $__2.computed_fragment_shader = define_str + $__2.computed_fragment_shader;
    var info = ($__2.name ? ($__2.name + ' / id ' + $__2.id) : ('id ' + $__2.id));
    $__2.computed_vertex_shader = '// Program: ' + info + '\n' + $__2.computed_vertex_shader;
    $__2.computed_fragment_shader = '// Program: ' + info + '\n' + $__2.computed_fragment_shader;
    try {
      $__2.program = GL.updateProgram($__2.gl, $__2.program, $__2.computed_vertex_shader, $__2.computed_fragment_shader);
      $__2.compiled = true;
    } catch (e) {
      $__2.program = null;
      $__2.compiled = false;
    }
    $__2.use();
    $__2.refreshUniforms();
    $__2.refreshAttributes();
    if (typeof callback == 'function') {
      callback();
    }
  }));
};
GLProgram.loadTransform = function(transforms, block, key, index, complete) {
  var type,
      value,
      source;
  if (typeof block == 'string') {
    transforms[key].list[index] = block;
    complete();
  } else if (typeof block == 'object' && block.url) {
    var req = new XMLHttpRequest();
    req.onload = function() {
      source = req.response;
      transforms[key].list[index] = source;
      complete();
    };
    req.open('GET', Utils.urlForPath(block.url) + '?' + (+new Date()), true);
    req.responseType = 'text';
    req.send();
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
  var $__4,
      $__5;
  var d,
      transforms = {};
  for (d in GLProgram.transforms) {
    transforms[d] = [];
    if (typeof GLProgram.transforms[d] === 'object' && GLProgram.transforms[d].length >= 0) {
      ($__4 = transforms[d]).push.apply($__4, $traceurRuntime.spread(GLProgram.transforms[d]));
    } else {
      transforms[d] = [GLProgram.transforms[d]];
    }
  }
  for (d in this.transforms) {
    transforms[d] = transforms[d] || [];
    if (typeof this.transforms[d] === 'object' && this.transforms[d].length >= 0) {
      ($__5 = transforms[d]).push.apply($__5, $traceurRuntime.spread(this.transforms[d]));
    } else {
      transforms[d].push(this.transforms[d]);
    }
  }
  return transforms;
};
GLProgram.buildDefineString = function(defines) {
  var define_str = "";
  for (var d in defines) {
    if (defines[d] == false) {
      continue;
    } else if (typeof defines[d] == 'boolean' && defines[d] == true) {
      define_str += "#define " + d + "\n";
    } else if (typeof defines[d] == 'number' && Math.floor(defines[d]) == defines[d]) {
      define_str += "#define " + d + " " + defines[d].toFixed(1) + "\n";
    } else {
      define_str += "#define " + d + " " + defines[d] + "\n";
    }
  }
  return define_str;
};
GLProgram.prototype.setUniforms = function(uniforms) {
  var texture_unit = 0;
  for (var u in uniforms) {
    var uniform = uniforms[u];
    if (typeof uniform == 'number') {
      this.uniform('1f', u, uniform);
    } else if (typeof uniform == 'object') {
      if (uniform.length >= 2 && uniform.length <= 4) {
        this.uniform(uniform.length + 'fv', u, uniform);
      } else if (uniform.length > 4) {
        this.uniform('1fv', u + '[0]', uniform);
      }
    } else if (typeof uniform == 'boolean') {
      this.uniform('1i', u, uniform);
    } else if (typeof uniform == 'string') {
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
  if (!this.compiled) {
    return;
  }
  var uniform = (this.uniforms[name] = this.uniforms[name] || {});
  uniform.name = name;
  uniform.location = uniform.location || this.gl.getUniformLocation(this.program, name);
  uniform.method = 'uniform' + method;
  uniform.values = Array.prototype.slice.call(arguments, 2);
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


},{"../utils":18,"./gl":5,"./gl_texture":11,"queue-async":2}],10:[function(_dereq_,module,exports){
"use strict";
var shader_sources = {};
shader_sources['point_fragment'] = "\n" + "#define GLSLIFY 1\n" + "\n" + "uniform vec2 u_resolution;\n" + "varying vec3 v_color;\n" + "varying vec2 v_texcoord;\n" + "void main(void) {\n" + "  vec3 color = v_color;\n" + "  vec3 lighting = vec3(1.);\n" + "  float len = length(v_texcoord);\n" + "  if(len > 1.) {\n" + "    discard;\n" + "  }\n" + "  color *= (1. - smoothstep(.25, 1., len)) + 0.5;\n" + "  #pragma tangram: fragment\n" + "  gl_FragColor = vec4(color, 1.);\n" + "}\n" + "";
shader_sources['point_vertex'] = "\n" + "#define GLSLIFY 1\n" + "\n" + "uniform mat4 u_tile_view;\n" + "uniform float u_num_layers;\n" + "attribute vec3 a_position;\n" + "attribute vec2 a_texcoord;\n" + "attribute vec3 a_color;\n" + "attribute float a_layer;\n" + "varying vec3 v_color;\n" + "varying vec2 v_texcoord;\n" + "#if defined(FEATURE_SELECTION)\n" + "\n" + "attribute vec4 a_selection_color;\n" + "varying vec4 v_selection_color;\n" + "#endif\n" + "\n" + "float a_x_calculateZ(float z, float layer, const float num_layers, const float z_layer_scale) {\n" + "  float z_layer_range = (num_layers + 1.) * z_layer_scale;\n" + "  float z_layer = (layer + 1.) * z_layer_scale;\n" + "  z = z_layer + clamp(z, 0., z_layer_scale);\n" + "  z = (z_layer_range - z) / z_layer_range;\n" + "  return z;\n" + "}\n" + "#pragma tangram: globals\n" + "\n" + "#pragma tangram: camera\n" + "\n" + "void main() {\n" + "  \n" + "  #if defined(FEATURE_SELECTION)\n" + "  if(a_selection_color.xyz == vec3(0.)) {\n" + "    gl_Position = vec4(0., 0., 0., 1.);\n" + "    return;\n" + "  }\n" + "  v_selection_color = a_selection_color;\n" + "  #endif\n" + "  vec4 position = u_tile_view * vec4(a_position, 1.);\n" + "  #pragma tangram: vertex\n" + "  v_color = a_color;\n" + "  v_texcoord = a_texcoord;\n" + "  cameraProjection(position);\n" + "  position.z -= (a_layer + 1.) * .001;\n" + "  gl_Position = position;\n" + "}\n" + "";
shader_sources['polygon_fragment'] = "\n" + "#define GLSLIFY 1\n" + "\n" + "uniform vec2 u_resolution;\n" + "uniform vec2 u_aspect;\n" + "uniform float u_meters_per_pixel;\n" + "uniform float u_time;\n" + "uniform float u_map_zoom;\n" + "uniform vec2 u_map_center;\n" + "uniform vec2 u_tile_origin;\n" + "uniform float u_test;\n" + "uniform float u_test2;\n" + "varying vec3 v_color;\n" + "varying vec4 v_world_position;\n" + "#if defined(WORLD_POSITION_WRAP)\n" + "\n" + "vec2 world_position_anchor = vec2(floor(u_tile_origin / WORLD_POSITION_WRAP) * WORLD_POSITION_WRAP);\n" + "vec4 absoluteWorldPosition() {\n" + "  return vec4(v_world_position.xy + world_position_anchor, v_world_position.z, v_world_position.w);\n" + "}\n" + "#else\n" + "\n" + "vec4 absoluteWorldPosition() {\n" + "  return v_world_position;\n" + "}\n" + "#endif\n" + "\n" + "#if defined(LIGHTING_ENVIRONMENT)\n" + "\n" + "uniform sampler2D u_env_map;\n" + "#endif\n" + "\n" + "#if !defined(LIGHTING_VERTEX)\n" + "\n" + "varying vec4 v_position;\n" + "varying vec3 v_normal;\n" + "#else\n" + "\n" + "varying vec3 v_lighting;\n" + "#endif\n" + "\n" + "const float light_ambient = 0.5;\n" + "vec3 b_x_pointLight(vec4 position, vec3 normal, vec3 color, vec4 light_pos, float light_ambient, const bool backlight) {\n" + "  vec3 light_dir = normalize(position.xyz - light_pos.xyz);\n" + "  color *= abs(max(float(backlight) * -1., dot(normal, light_dir * -1.0))) + light_ambient;\n" + "  return color;\n" + "}\n" + "vec3 c_x_specularLight(vec4 position, vec3 normal, vec3 color, vec4 light_pos, float light_ambient, const bool backlight) {\n" + "  vec3 light_dir = normalize(position.xyz - light_pos.xyz);\n" + "  vec3 view_pos = vec3(0., 0., 500.);\n" + "  vec3 view_dir = normalize(position.xyz - view_pos.xyz);\n" + "  vec3 specularReflection;\n" + "  if(dot(normal, -light_dir) < 0.0) {\n" + "    specularReflection = vec3(0.0, 0.0, 0.0);\n" + "  } else {\n" + "    float attenuation = 1.0;\n" + "    float lightSpecularTerm = 1.0;\n" + "    float materialSpecularTerm = 10.0;\n" + "    float materialShininessTerm = 10.0;\n" + "    specularReflection = attenuation * vec3(lightSpecularTerm) * vec3(materialSpecularTerm) * pow(max(0.0, dot(reflect(-light_dir, normal), view_dir)), materialShininessTerm);\n" + "  }\n" + "  float diffuse = abs(max(float(backlight) * -1., dot(normal, light_dir * -1.0)));\n" + "  color *= diffuse + specularReflection + light_ambient;\n" + "  return color;\n" + "}\n" + "vec3 d_x_directionalLight(vec3 normal, vec3 color, vec3 light_dir, float light_ambient) {\n" + "  light_dir = normalize(light_dir);\n" + "  color *= dot(normal, light_dir * -1.0) + light_ambient;\n" + "  return color;\n" + "}\n" + "vec3 a_x_lighting(vec4 position, vec3 normal, vec3 color, vec4 light_pos, vec4 night_light_pos, vec3 light_dir, float light_ambient) {\n" + "  \n" + "  #if defined(LIGHTING_POINT)\n" + "  color = b_x_pointLight(position, normal, color, light_pos, light_ambient, true);\n" + "  #elif defined(LIGHTING_POINT_SPECULAR)\n" + "  color = c_x_specularLight(position, normal, color, light_pos, light_ambient, true);\n" + "  #elif defined(LIGHTING_NIGHT)\n" + "  color = b_x_pointLight(position, normal, color, night_light_pos, 0., false);\n" + "  #elif defined(LIGHTING_DIRECTION)\n" + "  color = d_x_directionalLight(normal, color, light_dir, light_ambient);\n" + "  #else\n" + "  color = color;\n" + "  #endif\n" + "  return color;\n" + "}\n" + "vec4 e_x_sphericalEnvironmentMap(vec3 view_pos, vec3 position, vec3 normal, sampler2D envmap) {\n" + "  vec3 eye = normalize(position.xyz - view_pos.xyz);\n" + "  if(eye.z > 0.01) {\n" + "    eye.z = 0.01;\n" + "  }\n" + "  vec3 r = reflect(eye, normal);\n" + "  float m = 2. * sqrt(pow(r.x, 2.) + pow(r.y, 2.) + pow(r.z + 1., 2.));\n" + "  vec2 uv = r.xy / m + .5;\n" + "  return texture2D(envmap, uv);\n" + "}\n" + "#pragma tangram: globals\n" + "\n" + "void main(void) {\n" + "  vec3 color = v_color;\n" + "  #if defined(LIGHTING_ENVIRONMENT)\n" + "  vec3 view_pos = vec3(0., 0., 100. * u_meters_per_pixel);\n" + "  color = e_x_sphericalEnvironmentMap(view_pos, v_position.xyz, v_normal, u_env_map).rgb;\n" + "  #endif\n" + "  \n" + "  #if !defined(LIGHTING_VERTEX) // default to per-pixel lighting\n" + "  vec3 lighting = a_x_lighting(v_position, v_normal, vec3(1.), vec4(0., 0., 150. * u_meters_per_pixel, 1.), vec4(0., 0., 50. * u_meters_per_pixel, 1.), vec3(0.2, 0.7, -0.5), light_ambient);\n" + "  #else\n" + "  vec3 lighting = v_lighting;\n" + "  #endif\n" + "  vec3 color_prelight = color;\n" + "  color *= lighting;\n" + "  #pragma tangram: fragment\n" + "  gl_FragColor = vec4(color, 1.0);\n" + "}\n" + "";
shader_sources['polygon_vertex'] = "\n" + "#define GLSLIFY 1\n" + "\n" + "uniform vec2 u_resolution;\n" + "uniform vec2 u_aspect;\n" + "uniform float u_time;\n" + "uniform float u_map_zoom;\n" + "uniform vec2 u_map_center;\n" + "uniform vec2 u_tile_origin;\n" + "uniform mat4 u_tile_world;\n" + "uniform mat4 u_tile_view;\n" + "uniform float u_meters_per_pixel;\n" + "uniform float u_num_layers;\n" + "attribute vec3 a_position;\n" + "attribute vec3 a_normal;\n" + "attribute vec3 a_color;\n" + "attribute float a_layer;\n" + "varying vec4 v_world_position;\n" + "varying vec3 v_color;\n" + "#if defined(WORLD_POSITION_WRAP)\n" + "\n" + "vec2 world_position_anchor = vec2(floor(u_tile_origin / WORLD_POSITION_WRAP) * WORLD_POSITION_WRAP);\n" + "vec4 absoluteWorldPosition() {\n" + "  return vec4(v_world_position.xy + world_position_anchor, v_world_position.z, v_world_position.w);\n" + "}\n" + "#else\n" + "\n" + "vec4 absoluteWorldPosition() {\n" + "  return v_world_position;\n" + "}\n" + "#endif\n" + "\n" + "#if defined(FEATURE_SELECTION)\n" + "\n" + "attribute vec4 a_selection_color;\n" + "varying vec4 v_selection_color;\n" + "#endif\n" + "\n" + "#if !defined(LIGHTING_VERTEX)\n" + "\n" + "varying vec4 v_position;\n" + "varying vec3 v_normal;\n" + "#else\n" + "\n" + "varying vec3 v_lighting;\n" + "#endif\n" + "\n" + "const float light_ambient = 0.5;\n" + "float a_x_calculateZ(float z, float layer, const float num_layers, const float z_layer_scale) {\n" + "  float z_layer_range = (num_layers + 1.) * z_layer_scale;\n" + "  float z_layer = (layer + 1.) * z_layer_scale;\n" + "  z = z_layer + clamp(z, 0., z_layer_scale);\n" + "  z = (z_layer_range - z) / z_layer_range;\n" + "  return z;\n" + "}\n" + "vec3 c_x_pointLight(vec4 position, vec3 normal, vec3 color, vec4 light_pos, float light_ambient, const bool backlight) {\n" + "  vec3 light_dir = normalize(position.xyz - light_pos.xyz);\n" + "  color *= abs(max(float(backlight) * -1., dot(normal, light_dir * -1.0))) + light_ambient;\n" + "  return color;\n" + "}\n" + "vec3 d_x_specularLight(vec4 position, vec3 normal, vec3 color, vec4 light_pos, float light_ambient, const bool backlight) {\n" + "  vec3 light_dir = normalize(position.xyz - light_pos.xyz);\n" + "  vec3 view_pos = vec3(0., 0., 500.);\n" + "  vec3 view_dir = normalize(position.xyz - view_pos.xyz);\n" + "  vec3 specularReflection;\n" + "  if(dot(normal, -light_dir) < 0.0) {\n" + "    specularReflection = vec3(0.0, 0.0, 0.0);\n" + "  } else {\n" + "    float attenuation = 1.0;\n" + "    float lightSpecularTerm = 1.0;\n" + "    float materialSpecularTerm = 10.0;\n" + "    float materialShininessTerm = 10.0;\n" + "    specularReflection = attenuation * vec3(lightSpecularTerm) * vec3(materialSpecularTerm) * pow(max(0.0, dot(reflect(-light_dir, normal), view_dir)), materialShininessTerm);\n" + "  }\n" + "  float diffuse = abs(max(float(backlight) * -1., dot(normal, light_dir * -1.0)));\n" + "  color *= diffuse + specularReflection + light_ambient;\n" + "  return color;\n" + "}\n" + "vec3 e_x_directionalLight(vec3 normal, vec3 color, vec3 light_dir, float light_ambient) {\n" + "  light_dir = normalize(light_dir);\n" + "  color *= dot(normal, light_dir * -1.0) + light_ambient;\n" + "  return color;\n" + "}\n" + "vec3 b_x_lighting(vec4 position, vec3 normal, vec3 color, vec4 light_pos, vec4 night_light_pos, vec3 light_dir, float light_ambient) {\n" + "  \n" + "  #if defined(LIGHTING_POINT)\n" + "  color = c_x_pointLight(position, normal, color, light_pos, light_ambient, true);\n" + "  #elif defined(LIGHTING_POINT_SPECULAR)\n" + "  color = d_x_specularLight(position, normal, color, light_pos, light_ambient, true);\n" + "  #elif defined(LIGHTING_NIGHT)\n" + "  color = c_x_pointLight(position, normal, color, night_light_pos, 0., false);\n" + "  #elif defined(LIGHTING_DIRECTION)\n" + "  color = e_x_directionalLight(normal, color, light_dir, light_ambient);\n" + "  #else\n" + "  color = color;\n" + "  #endif\n" + "  return color;\n" + "}\n" + "#pragma tangram: globals\n" + "\n" + "#pragma tangram: camera\n" + "\n" + "void main() {\n" + "  \n" + "  #if defined(FEATURE_SELECTION)\n" + "  if(a_selection_color.xyz == vec3(0.)) {\n" + "    gl_Position = vec4(0., 0., 0., 1.);\n" + "    return;\n" + "  }\n" + "  v_selection_color = a_selection_color;\n" + "  #endif\n" + "  vec4 position = u_tile_view * vec4(a_position, 1.);\n" + "  v_world_position = u_tile_world * vec4(a_position, 1.);\n" + "  #if defined(WORLD_POSITION_WRAP)\n" + "  v_world_position.xy -= world_position_anchor;\n" + "  #endif\n" + "  \n" + "  #pragma tangram: vertex\n" + "  \n" + "  #if defined(LIGHTING_VERTEX)\n" + "  v_color = a_color;\n" + "  v_lighting = b_x_lighting(position, a_normal, vec3(1.), vec4(0., 0., 150. * u_meters_per_pixel, 1.), vec4(0., 0., 50. * u_meters_per_pixel, 1.), vec3(0.2, 0.7, -0.5), light_ambient);\n" + "  #else\n" + "  v_position = position;\n" + "  v_normal = a_normal;\n" + "  v_color = a_color;\n" + "  #endif\n" + "  cameraProjection(position);\n" + "  position.z -= (a_layer + 1.) * .001;\n" + "  gl_Position = position;\n" + "}\n" + "";
shader_sources['selection_fragment'] = "\n" + "#define GLSLIFY 1\n" + "\n" + "#if defined(FEATURE_SELECTION)\n" + "\n" + "varying vec4 v_selection_color;\n" + "#endif\n" + "\n" + "void main(void) {\n" + "  \n" + "  #if defined(FEATURE_SELECTION)\n" + "  gl_FragColor = v_selection_color;\n" + "  #else\n" + "  gl_FragColor = vec4(0., 0., 0., 1.);\n" + "  #endif\n" + "  \n" + "}\n" + "";
shader_sources['simple_polygon_fragment'] = "\n" + "#define GLSLIFY 1\n" + "\n" + "uniform float u_meters_per_pixel;\n" + "varying vec3 v_color;\n" + "#if !defined(LIGHTING_VERTEX)\n" + "\n" + "varying vec4 v_position;\n" + "varying vec3 v_normal;\n" + "#endif\n" + "\n" + "vec3 a_x_pointLight(vec4 position, vec3 normal, vec3 color, vec4 light_pos, float light_ambient, const bool backlight) {\n" + "  vec3 light_dir = normalize(position.xyz - light_pos.xyz);\n" + "  color *= abs(max(float(backlight) * -1., dot(normal, light_dir * -1.0))) + light_ambient;\n" + "  return color;\n" + "}\n" + "#pragma tangram: globals\n" + "\n" + "void main(void) {\n" + "  vec3 color;\n" + "  #if !defined(LIGHTING_VERTEX) // default to per-pixel lighting\n" + "  vec4 light_pos = vec4(0., 0., 150. * u_meters_per_pixel, 1.);\n" + "  const float light_ambient = 0.5;\n" + "  const bool backlit = true;\n" + "  color = a_x_pointLight(v_position, v_normal, v_color, light_pos, light_ambient, backlit);\n" + "  #else\n" + "  color = v_color;\n" + "  #endif\n" + "  \n" + "  #pragma tangram: fragment\n" + "  gl_FragColor = vec4(color, 1.0);\n" + "}\n" + "";
shader_sources['simple_polygon_vertex'] = "\n" + "#define GLSLIFY 1\n" + "\n" + "uniform vec2 u_aspect;\n" + "uniform mat4 u_tile_view;\n" + "uniform mat4 u_meter_view;\n" + "uniform float u_meters_per_pixel;\n" + "uniform float u_num_layers;\n" + "attribute vec3 a_position;\n" + "attribute vec3 a_normal;\n" + "attribute vec3 a_color;\n" + "attribute float a_layer;\n" + "varying vec3 v_color;\n" + "#if !defined(LIGHTING_VERTEX)\n" + "\n" + "varying vec4 v_position;\n" + "varying vec3 v_normal;\n" + "#endif\n" + "\n" + "vec4 a_x_perspective(vec4 position, const vec2 perspective_offset, const vec2 perspective_factor) {\n" + "  position.xy += position.z * perspective_factor * (position.xy - perspective_offset);\n" + "  return position;\n" + "}\n" + "vec4 b_x_isometric(vec4 position, const vec2 axis, const float multiplier) {\n" + "  position.xy += position.z * axis * multiplier / u_aspect;\n" + "  return position;\n" + "}\n" + "float c_x_calculateZ(float z, float layer, const float num_layers, const float z_layer_scale) {\n" + "  float z_layer_range = (num_layers + 1.) * z_layer_scale;\n" + "  float z_layer = (layer + 1.) * z_layer_scale;\n" + "  z = z_layer + clamp(z, 0., z_layer_scale);\n" + "  z = (z_layer_range - z) / z_layer_range;\n" + "  return z;\n" + "}\n" + "vec3 d_x_pointLight(vec4 position, vec3 normal, vec3 color, vec4 light_pos, float light_ambient, const bool backlight) {\n" + "  vec3 light_dir = normalize(position.xyz - light_pos.xyz);\n" + "  color *= abs(max(float(backlight) * -1., dot(normal, light_dir * -1.0))) + light_ambient;\n" + "  return color;\n" + "}\n" + "#pragma tangram: globals\n" + "\n" + "void main() {\n" + "  vec4 position = u_tile_view * vec4(a_position, 1.);\n" + "  #pragma tangram: vertex\n" + "  \n" + "  #if defined(LIGHTING_VERTEX)\n" + "  vec4 light_pos = vec4(0., 0., 150. * u_meters_per_pixel, 1.);\n" + "  const float light_ambient = 0.5;\n" + "  const bool backlit = true;\n" + "  v_color = d_x_pointLight(position, a_normal, a_color, light_pos, light_ambient, backlit);\n" + "  #else\n" + "  v_position = position;\n" + "  v_normal = a_normal;\n" + "  v_color = a_color;\n" + "  #endif\n" + "  position = u_meter_view * position;\n" + "  #if defined(PROJECTION_PERSPECTIVE)\n" + "  position = a_x_perspective(position, vec2(-0.25, -0.25), vec2(0.6, 0.6));\n" + "  #elif defined(PROJECTION_ISOMETRIC)\n" + "  position = b_x_isometric(position, vec2(0., 1.), 1.);\n" + "  #endif\n" + "  position.z = c_x_calculateZ(position.z, a_layer, u_num_layers, 4096.);\n" + "  gl_Position = position;\n" + "}\n" + "";
module.exports = shader_sources;


},{}],11:[function(_dereq_,module,exports){
"use strict";
Object.defineProperties(exports, {
  default: {get: function() {
      return $__default;
    }},
  __esModule: {value: true}
});
var Utils = _dereq_('../utils');
var GL = _dereq_('./gl').GL;
GLTexture.textures = {};
function GLTexture(gl, name, options) {
  options = options || {};
  this.gl = gl;
  this.texture = gl.createTexture();
  this.bind(0);
  this.image = null;
  this.setData(1, 1, new Uint8Array([0, 0, 0, 255]), {filtering: 'nearest'});
  this.name = name;
  GLTexture.textures[this.name] = this;
}
var $__default = GLTexture;
;
GLTexture.prototype.bind = function(unit) {
  this.gl.activeTexture(this.gl.TEXTURE0 + unit);
  this.gl.bindTexture(this.gl.TEXTURE_2D, this.texture);
};
GLTexture.prototype.load = function(url, options) {
  var $__1 = this;
  options = options || {};
  this.image = new Image();
  this.image.onload = (function() {
    $__1.width = $__1.image.width;
    $__1.height = $__1.image.height;
    $__1.data = null;
    $__1.update(options);
    $__1.setTextureFiltering(options);
  });
  this.image.src = url;
};
GLTexture.prototype.setData = function(width, height, data, options) {
  this.width = width;
  this.height = height;
  this.data = data;
  this.image = null;
  this.update(options);
  this.setTextureFiltering(options);
};
GLTexture.prototype.update = function(options) {
  options = options || {};
  this.bind(0);
  this.gl.pixelStorei(this.gl.UNPACK_FLIP_Y_WEBGL, (options.UNPACK_FLIP_Y_WEBGL === false ? false : true));
  if (this.image && this.image.complete) {
    this.gl.texImage2D(this.gl.TEXTURE_2D, 0, this.gl.RGBA, this.gl.RGBA, this.gl.UNSIGNED_BYTE, this.image);
  } else if (this.width && this.height) {
    this.gl.texImage2D(this.gl.TEXTURE_2D, 0, this.gl.RGBA, this.width, this.height, 0, this.gl.RGBA, this.gl.UNSIGNED_BYTE, this.data);
  }
};
GLTexture.prototype.setTextureFiltering = function(options) {
  options = options || {};
  options.filtering = options.filtering || 'mipmap';
  var gl = this.gl;
  if (Utils.isPowerOf2(this.width) && Utils.isPowerOf2(this.height)) {
    this.power_of_2 = true;
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, options.TEXTURE_WRAP_S || gl.CLAMP_TO_EDGE);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, options.TEXTURE_WRAP_T || gl.CLAMP_TO_EDGE);
    if (options.filtering == 'mipmap') {
      this.filtering = 'mipmap';
      gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR_MIPMAP_NEAREST);
      gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR);
      gl.generateMipmap(gl.TEXTURE_2D);
    } else if (options.filtering == 'linear') {
      this.filtering = 'linear';
      gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);
      gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR);
    } else if (options.filtering == 'nearest') {
      this.filtering = 'nearest';
      gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.NEAREST);
      gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.NEAREST);
    }
  } else {
    this.power_of_2 = false;
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
    if (options.filtering == 'nearest') {
      this.filtering = 'nearest';
      gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.NEAREST);
      gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.NEAREST);
    } else {
      this.filtering = 'linear';
      gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);
      gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR);
    }
  }
};


},{"../utils":18,"./gl":5}],12:[function(_dereq_,module,exports){
"use strict";
Object.defineProperties(exports, {
  default: {get: function() {
      return $__default;
    }},
  __esModule: {value: true}
});
function GLVertexLayout(gl, attribs) {
  this.attribs = attribs;
  this.stride = 0;
  for (var a = 0; a < this.attribs.length; a++) {
    var attrib = this.attribs[a];
    attrib.byte_size = attrib.size;
    switch (attrib.type) {
      case gl.FLOAT:
      case gl.INT:
      case gl.UNSIGNED_INT:
        attrib.byte_size *= 4;
        break;
      case gl.SHORT:
      case gl.UNSIGNED_SHORT:
        attrib.byte_size *= 2;
        break;
    }
    attrib.offset = this.stride;
    this.stride += attrib.byte_size;
  }
}
var $__default = GLVertexLayout;
GLVertexLayout.enabled_attribs = {};
GLVertexLayout.prototype.enable = function(gl, gl_program) {
  for (var a = 0; a < this.attribs.length; a++) {
    var attrib = this.attribs[a];
    var location = gl_program.attribute(attrib.name).location;
    if (location != -1) {
      gl.enableVertexAttribArray(location);
      gl.vertexAttribPointer(location, attrib.size, attrib.type, attrib.normalized, this.stride, attrib.offset);
      GLVertexLayout.enabled_attribs[location] = gl_program;
    }
  }
  var unusued_attribs = [];
  for (location in GLVertexLayout.enabled_attribs) {
    if (GLVertexLayout.enabled_attribs[location] != gl_program) {
      gl.disableVertexAttribArray(location);
      unusued_attribs.push(location);
    }
  }
  for (location in unusued_attribs) {
    delete GLVertexLayout.enabled_attribs[location];
  }
};


},{}],13:[function(_dereq_,module,exports){
"use strict";
Object.defineProperties(exports, {
  LeafletLayer: {get: function() {
      return LeafletLayer;
    }},
  leafletLayer: {get: function() {
      return leafletLayer;
    }},
  __esModule: {value: true}
});
var Scene = _dereq_('./scene').default;
var LeafletLayer = L.GridLayer.extend({
  initialize: function(options) {
    L.setOptions(this, options);
    this.scene = new Scene(this.options.vectorTileSource, this.options.vectorLayers, this.options.vectorStyles, {num_workers: this.options.numWorkers});
    this.scene.debug = this.options.debug;
    this.scene.continuous_animation = false;
  },
  onAdd: function(map) {
    var $__1 = this;
    this.on('tileunload', (function(event) {
      var tile = event.tile;
      var key = tile.getAttribute('data-tile-key');
      $__1.scene.removeTile(key);
    }));
    this._map.on('resize', (function() {
      var size = $__1._map.getSize();
      $__1.scene.resizeMap(size.x, size.y);
      $__1.updateBounds();
    }));
    this._map.on('move', (function() {
      var center = $__1._map.getCenter();
      $__1.scene.setCenter(center.lng, center.lat);
      $__1.updateBounds();
    }));
    this._map.on('zoomstart', (function() {
      console.log("map.zoomstart " + $__1._map.getZoom());
      $__1.scene.startZoom();
    }));
    this._map.on('zoomend', (function() {
      console.log("map.zoomend " + $__1._map.getZoom());
      $__1.scene.setZoom($__1._map.getZoom());
      $__1.updateBounds();
    }));
    this._map.on('dragstart', (function() {
      $__1.scene.panning = true;
    }));
    this._map.on('dragend', (function() {
      $__1.scene.panning = false;
    }));
    this.scene.container = this._map.getContainer();
    var center = this._map.getCenter();
    this.scene.setCenter(center.lng, center.lat);
    console.log("zoom: " + this._map.getZoom());
    this.scene.setZoom(this._map.getZoom());
    this.updateBounds();
    L.GridLayer.prototype.onAdd.apply(this, arguments);
    this.scene.init((function() {
      $__1.fire('init');
    }));
  },
  onRemove: function(map) {
    L.GridLayer.prototype.onRemove.apply(this, arguments);
  },
  createTile: function(coords, done) {
    var div = document.createElement('div');
    this.scene.loadTile(coords, div, done);
    return div;
  },
  updateBounds: function() {
    var bounds = this._map.getBounds();
    this.scene.setBounds(bounds.getSouthWest(), bounds.getNorthEast());
  },
  render: function() {
    this.scene.render();
  }
});
function leafletLayer(options) {
  return new LeafletLayer(options);
}


},{"./scene":16}],14:[function(_dereq_,module,exports){
"use strict";
var $__0 = _dereq_('./leaflet_layer'),
    LeafletLayer = $__0.LeafletLayer,
    leafletLayer = $__0.leafletLayer;
var GL = _dereq_('./gl/gl').GL;
GL.Program = _dereq_('./gl/gl_program.js').default;
GL.Texture = _dereq_('./gl/gl_texture.js');
module.exports = {
  LeafletLayer: LeafletLayer,
  leafletLayer: leafletLayer,
  GL: GL
};


},{"./gl/gl":5,"./gl/gl_program.js":9,"./gl/gl_texture.js":11,"./leaflet_layer":13}],15:[function(_dereq_,module,exports){
"use strict";
Object.defineProperties(exports, {
  default: {get: function() {
      return $__default;
    }},
  __esModule: {value: true}
});
var Point = function Point(x, y) {
  if (!(this instanceof $Point)) {
    return new $Point(x, y);
  }
  this.x = x;
  this.y = y;
};
var $Point = Point;
($traceurRuntime.createClass)(Point, {}, {copy: function(other) {
    if (other == null) {
      return null;
    }
    return new $Point(other.x, other.y);
  }});
var $__default = Point;


},{}],16:[function(_dereq_,module,exports){
"use strict";
Object.defineProperties(exports, {
  default: {get: function() {
      return $__default;
    }},
  __esModule: {value: true}
});
var Point = _dereq_('./point').default;
var Geo = _dereq_('./geo').Geo;
var Utils = _dereq_('./utils');
var Style = _dereq_('./style').Style;
var Queue = _dereq_('queue-async');
var GL = _dereq_('./gl/gl').GL;
var GLBuilders = _dereq_('./gl/gl_builders').GLBuilders;
var GLProgram = _dereq_('./gl/gl_program').default;
var GLTexture = _dereq_('./gl/gl_texture').default;
var ModeManager = _dereq_('./gl/gl_modes').ModeManager;
var Camera = _dereq_('./camera').default;
var $__9 = _dereq_('gl-matrix'),
    mat4 = $__9.mat4,
    vec3 = $__9.vec3;
var yaml;
Utils.runIfInMainThread(function() {
  try {
    yaml = _dereq_('js-yaml');
  } catch (e) {
    console.log("no YAML support, js-yaml module not found");
  }
  findBaseLibraryURL();
});
Scene.tile_scale = 4096;
Geo.setTileScale(Scene.tile_scale);
GLBuilders.setTileScale(Scene.tile_scale);
GLProgram.defines.TILE_SCALE = Scene.tile_scale;
Scene.debug = false;
function Scene(tile_source, layers, styles, options) {
  var options = options || {};
  this.initialized = false;
  this.tile_source = tile_source;
  this.tiles = {};
  this.queued_tiles = [];
  this.num_workers = options.num_workers || 1;
  this.allow_cross_domain_workers = (options.allow_cross_domain_workers === false ? false : true);
  this.layers = layers;
  this.styles = styles;
  this.dirty = true;
  this.animated = false;
  this.frame = 0;
  this.zoom = null;
  this.center = null;
  this.device_pixel_ratio = window.devicePixelRatio || 1;
  this.zooming = false;
  this.panning = false;
  this.container = options.container;
  this.resetTime();
}
var $__default = Scene;
Scene.prototype.init = function(callback) {
  var $__10 = this;
  if (this.initialized) {
    return;
  }
  this.loadScene((function() {
    var queue = Queue();
    queue.defer((function(complete) {
      $__10.modes = Scene.createModes($__10.styles);
      $__10.updateActiveModes();
      complete();
    }));
    queue.defer((function(complete) {
      $__10.createWorkers(complete);
    }));
    queue.await((function() {
      $__10.container = $__10.container || document.body;
      $__10.canvas = document.createElement('canvas');
      $__10.canvas.style.position = 'absolute';
      $__10.canvas.style.top = 0;
      $__10.canvas.style.left = 0;
      $__10.canvas.style.zIndex = -1;
      $__10.container.appendChild($__10.canvas);
      $__10.gl = GL.getContext($__10.canvas);
      $__10.resizeMap($__10.container.clientWidth, $__10.container.clientHeight);
      $__10.camera = Camera.create($__10, $__10.styles.camera);
      $__10.initModes();
      $__10.initSelectionBuffer();
      $__10.last_render_count = null;
      $__10.initInputHandlers();
      $__10.initialized = true;
      if (typeof callback == 'function') {
        callback();
      }
    }));
  }));
};
Scene.prototype.initModes = function() {
  for (var m in this.modes) {
    this.modes[m].init(this.gl);
  }
};
Scene.prototype.initSelectionBuffer = function() {
  this.pixel = new Uint8Array(4);
  this.pixel32 = new Float32Array(this.pixel.buffer);
  this.selection_point = Point(0, 0);
  this.selected_feature = null;
  this.selection_callback = null;
  this.selection_callback_timer = null;
  this.selection_frame_delay = 5;
  this.update_selection = false;
  this.fbo = this.gl.createFramebuffer();
  this.gl.bindFramebuffer(this.gl.FRAMEBUFFER, this.fbo);
  this.fbo_size = {
    width: 256,
    height: 256
  };
  this.fbo_size.aspect = this.fbo_size.width / this.fbo_size.height;
  this.gl.viewport(0, 0, this.fbo_size.width, this.fbo_size.height);
  this.fbo_texture = new GLTexture(this.gl, 'selection_fbo');
  this.fbo_texture.setData(this.fbo_size.width, this.fbo_size.height, null, {filtering: 'nearest'});
  this.gl.framebufferTexture2D(this.gl.FRAMEBUFFER, this.gl.COLOR_ATTACHMENT0, this.gl.TEXTURE_2D, this.fbo_texture.texture, 0);
  this.fbo_depth_rb = this.gl.createRenderbuffer();
  this.gl.bindRenderbuffer(this.gl.RENDERBUFFER, this.fbo_depth_rb);
  this.gl.renderbufferStorage(this.gl.RENDERBUFFER, this.gl.DEPTH_COMPONENT16, this.fbo_size.width, this.fbo_size.height);
  this.gl.framebufferRenderbuffer(this.gl.FRAMEBUFFER, this.gl.DEPTH_ATTACHMENT, this.gl.RENDERBUFFER, this.fbo_depth_rb);
  this.gl.bindFramebuffer(this.gl.FRAMEBUFFER, null);
  this.gl.viewport(0, 0, this.canvas.width, this.canvas.height);
};
Scene.prototype.createWorkers = function(callback) {
  var $__10 = this;
  var queue = Queue();
  var worker_url = Scene.library_base_url + 'tangram-worker.debug.js' + '?' + (+new Date());
  queue.defer((function(complete) {
    var createObjectURL = (window.URL && window.URL.createObjectURL) || (window.webkitURL && window.webkitURL.createObjectURL);
    if (createObjectURL && $__10.allow_cross_domain_workers) {
      var req = new XMLHttpRequest();
      req.onload = (function() {
        var worker_local_url = createObjectURL(new Blob([req.response], {type: 'application/javascript'}));
        $__10.makeWorkers(worker_local_url);
        complete();
      });
      req.open('GET', worker_url, true);
      req.responseType = 'text';
      req.send();
    } else {
      console.log($__10);
      $__10.makeWorkers(worker_url);
      complete();
    }
  }));
  queue.await((function() {
    $__10.workers.forEach((function(worker) {
      worker.addEventListener('message', $__10.workerBuildTileCompleted.bind($__10));
      worker.addEventListener('message', $__10.workerGetFeatureSelection.bind($__10));
      worker.addEventListener('message', $__10.workerLogMessage.bind($__10));
    }));
    $__10.next_worker = 0;
    $__10.selection_map_worker_size = {};
    if (typeof callback == 'function') {
      callback();
    }
  }));
};
Scene.prototype.makeWorkers = function(url) {
  this.workers = [];
  for (var w = 0; w < this.num_workers; w++) {
    this.workers.push(new Worker(url));
    this.workers[w].postMessage({
      type: 'init',
      worker_id: w,
      num_workers: this.num_workers
    });
  }
};
Scene.prototype.workerPostMessageForTile = function(tile, message) {
  if (tile.worker == null) {
    tile.worker = this.next_worker;
    this.next_worker = (tile.worker + 1) % this.workers.length;
  }
  this.workers[tile.worker].postMessage(message);
};
Scene.prototype.setCenter = function(lng, lat) {
  this.center = {
    lng: lng,
    lat: lat
  };
  this.dirty = true;
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
    console.log("scene.last_zoom: " + this.last_zoom);
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
  this.updateMeterView();
  this.removeTilesOutsideZoomRange(below, above);
  this.dirty = true;
};
Scene.prototype.updateMeterView = function() {
  this.meters_per_pixel = Geo.metersPerPixel(this.zoom);
  if (this.css_size !== undefined) {
    this.meter_zoom = {
      x: this.css_size.width / 2 * this.meters_per_pixel,
      y: this.css_size.height / 2 * this.meters_per_pixel
    };
  }
};
Scene.prototype.removeTilesOutsideZoomRange = function(below, above) {
  below = Math.min(below, this.tile_source.max_zoom || below);
  above = Math.min(above, this.tile_source.max_zoom || above);
  console.log("removeTilesOutsideZoomRange [" + below + ", " + above + "])");
  var remove_tiles = [];
  for (var t in this.tiles) {
    var tile = this.tiles[t];
    if (tile.coords.z < below || tile.coords.z > above) {
      remove_tiles.push(t);
    }
  }
  for (var r = 0; r < remove_tiles.length; r++) {
    var key = remove_tiles[r];
    console.log("removed " + key + " (outside range [" + below + ", " + above + "])");
    this.removeTile(key);
  }
};
Scene.prototype.setBounds = function(sw, ne) {
  this.bounds = {
    sw: {
      lng: sw.lng,
      lat: sw.lat
    },
    ne: {
      lng: ne.lng,
      lat: ne.lat
    }
  };
  var buffer = 200 * this.meters_per_pixel;
  this.buffered_meter_bounds = {
    sw: Geo.latLngToMeters(Point(this.bounds.sw.lng, this.bounds.sw.lat)),
    ne: Geo.latLngToMeters(Point(this.bounds.ne.lng, this.bounds.ne.lat))
  };
  this.buffered_meter_bounds.sw.x -= buffer;
  this.buffered_meter_bounds.sw.y -= buffer;
  this.buffered_meter_bounds.ne.x += buffer;
  this.buffered_meter_bounds.ne.y += buffer;
  this.center_meters = Point((this.buffered_meter_bounds.sw.x + this.buffered_meter_bounds.ne.x) / 2, (this.buffered_meter_bounds.sw.y + this.buffered_meter_bounds.ne.y) / 2);
  for (var t in this.tiles) {
    this.updateVisibilityForTile(this.tiles[t]);
  }
  this.dirty = true;
};
Scene.prototype.isTileInZoom = function(tile) {
  return (Math.min(tile.coords.z, this.tile_source.max_zoom || tile.coords.z) == this.capped_zoom);
};
Scene.prototype.updateVisibilityForTile = function(tile) {
  var visible = tile.visible;
  tile.visible = this.isTileInZoom(tile) && Geo.boxIntersect(tile.bounds, this.buffered_meter_bounds);
  tile.center_dist = Math.abs(this.center_meters.x - tile.min.x) + Math.abs(this.center_meters.y - tile.min.y);
  return (visible != tile.visible);
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
  this.updateMeterView();
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
Scene.prototype.render = function() {
  this.loadQueuedTiles();
  if (this.dirty == false || this.initialized == false) {
    return false;
  }
  this.dirty = false;
  this.renderGL();
  if (this.animated == true) {
    this.dirty = true;
  }
  this.frame++;
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
  var gl = this.gl;
  this.input();
  this.resetFrame();
  var center = Geo.latLngToMeters(Point(this.center.lng, this.center.lat));
  var tile_view_mat = mat4.create();
  var tile_world_mat = mat4.create();
  this.camera.update();
  var renderable_tiles = [];
  for (var t in this.tiles) {
    var tile = this.tiles[t];
    if (tile.loaded == true && tile.visible == true) {
      renderable_tiles.push(tile);
    }
  }
  this.renderable_tiles_count = renderable_tiles.length;
  var render_count = 0;
  for (var mode in this.modes) {
    this.modes[mode].update();
    var gl_program = this.modes[mode].gl_program;
    if (gl_program == null || gl_program.compiled == false) {
      continue;
    }
    var first_for_mode = true;
    for (var t in renderable_tiles) {
      var tile = renderable_tiles[t];
      if (tile.gl_geometry[mode] != null) {
        if (first_for_mode == true) {
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
  if (this.update_selection) {
    this.update_selection = false;
    if (this.panning) {
      return;
    }
    gl.bindFramebuffer(gl.FRAMEBUFFER, this.fbo);
    gl.viewport(0, 0, this.fbo_size.width, this.fbo_size.height);
    this.resetFrame();
    for (mode in this.modes) {
      gl_program = this.modes[mode].selection_gl_program;
      if (gl_program == null || gl_program.compiled == false) {
        continue;
      }
      first_for_mode = true;
      for (t in renderable_tiles) {
        tile = renderable_tiles[t];
        if (tile.gl_geometry[mode] != null) {
          if (first_for_mode == true) {
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
    this.selection_callback_timer = setTimeout(this.readSelectionBuffer.bind(this), this.selection_frame_delay);
    gl.bindFramebuffer(gl.FRAMEBUFFER, null);
    gl.viewport(0, 0, this.canvas.width, this.canvas.height);
  }
  if (render_count != this.last_render_count) {
    console.log("rendered " + render_count + " primitives");
  }
  this.last_render_count = render_count;
  return true;
};
Scene.prototype.getFeatureAt = function(pixel, callback) {
  if (!this.initialized) {
    return;
  }
  if (this.update_selection == true) {
    return;
  }
  this.selection_point = Point(pixel.x * this.device_pixel_ratio, this.device_size.height - (pixel.y * this.device_pixel_ratio));
  this.selection_callback = callback;
  this.update_selection = true;
  this.dirty = true;
};
Scene.prototype.readSelectionBuffer = function() {
  var gl = this.gl;
  gl.bindFramebuffer(gl.FRAMEBUFFER, this.fbo);
  gl.readPixels(Math.floor(this.selection_point.x * this.fbo_size.width / this.device_size.width), Math.floor(this.selection_point.y * this.fbo_size.height / this.device_size.height), 1, 1, gl.RGBA, gl.UNSIGNED_BYTE, this.pixel);
  var feature_key = (this.pixel[0] + (this.pixel[1] << 8) + (this.pixel[2] << 16) + (this.pixel[3] << 24)) >>> 0;
  var worker_id = this.pixel[3];
  if (worker_id != 255) {
    if (this.workers[worker_id] != null) {
      this.workers[worker_id].postMessage({
        type: 'getFeatureSelection',
        key: feature_key
      });
    }
  } else {
    this.workerGetFeatureSelection({data: {
        type: 'getFeatureSelection',
        feature: null
      }});
  }
  gl.bindFramebuffer(gl.FRAMEBUFFER, null);
};
Scene.prototype.workerGetFeatureSelection = function(event) {
  if (event.data.type != 'getFeatureSelection') {
    return;
  }
  var feature = event.data.feature;
  var changed = false;
  if ((feature != null && this.selected_feature == null) || (feature == null && this.selected_feature != null) || (feature != null && this.selected_feature != null && feature.id != this.selected_feature.id)) {
    changed = true;
  }
  this.selected_feature = feature;
  if (typeof this.selection_callback == 'function') {
    this.selection_callback({
      feature: this.selected_feature,
      changed: changed
    });
  }
};
Scene.prototype.loadTile = function(coords, div, callback) {
  this.queued_tiles[this.queued_tiles.length] = arguments;
};
Scene.prototype.loadQueuedTiles = function() {
  if (!this.initialized) {
    return;
  }
  if (this.queued_tiles.length == 0) {
    return;
  }
  for (var t = 0; t < this.queued_tiles.length; t++) {
    this._loadTile.apply(this, this.queued_tiles[t]);
  }
  this.queued_tiles = [];
};
Scene.prototype._loadTile = function(coords, div, callback) {
  if (coords.z > this.tile_source.max_zoom) {
    var zgap = coords.z - this.tile_source.max_zoom;
    coords.x = ~~(coords.x / Math.pow(2, zgap));
    coords.y = ~~(coords.y / Math.pow(2, zgap));
    coords.display_z = coords.z;
    coords.z -= zgap;
  }
  this.trackTileSetLoadStart();
  var key = [coords.x, coords.y, coords.z].join('/');
  if (this.tiles[key]) {
    if (callback) {
      callback(null, div);
    }
    return;
  }
  var tile = this.tiles[key] = {};
  tile.key = key;
  tile.coords = coords;
  tile.min = Geo.metersForTile(tile.coords);
  tile.max = Geo.metersForTile({
    x: tile.coords.x + 1,
    y: tile.coords.y + 1,
    z: tile.coords.z
  });
  tile.span = {
    x: (tile.max.x - tile.min.x),
    y: (tile.max.y - tile.min.y)
  };
  tile.bounds = {
    sw: {
      x: tile.min.x,
      y: tile.max.y
    },
    ne: {
      x: tile.max.x,
      y: tile.min.y
    }
  };
  tile.debug = {};
  tile.loading = true;
  tile.loaded = false;
  this.buildTile(tile.key);
  this.updateTileElement(tile, div);
  this.updateVisibilityForTile(tile);
  if (callback) {
    callback(null, div);
  }
};
Scene.prototype.rebuildTiles = function() {
  var $__10 = this;
  if (!this.initialized) {
    return;
  }
  this.layers_serialized = Utils.serializeWithFunctions(this.layers);
  this.styles_serialized = Utils.serializeWithFunctions(this.styles);
  this.selection_map = {};
  this.workers.forEach((function(worker) {
    worker.postMessage({
      type: 'prepareForRebuild',
      layers: $__10.layers_serialized,
      styles: $__10.styles_serialized
    });
  }));
  var visible = [],
      invisible = [];
  for (var t in this.tiles) {
    if (this.tiles[t].visible == true) {
      visible.push(t);
    } else {
      invisible.push(t);
    }
  }
  visible.sort((function(a, b) {
    var ad = $__10.tiles[a].center_dist;
    var bd = $__10.tiles[b].center_dist;
    return (bd > ad ? -1 : (bd == ad ? 0 : 1));
  }));
  for (var t in visible) {
    this.buildTile(visible[t]);
  }
  for (var t in invisible) {
    if (this.isTileInZoom(this.tiles[invisible[t]]) == true) {
      this.buildTile(invisible[t]);
    } else {
      this.removeTile(invisible[t]);
    }
  }
  this.updateActiveModes();
  this.resetTime();
};
Scene.prototype.buildTile = function(key) {
  var tile = this.tiles[key];
  this.workerPostMessageForTile(tile, {
    type: 'buildTile',
    tile: {
      key: tile.key,
      coords: tile.coords,
      min: tile.min,
      max: tile.max,
      debug: tile.debug
    },
    tile_source: this.tile_source,
    layers: this.layers_serialized,
    styles: this.styles_serialized
  });
};
Scene.addTile = function(tile, layers, styles, modes) {
  var layer,
      style,
      feature,
      z,
      mode;
  var vertex_data = {};
  tile.debug.features = 0;
  for (var layer_num = layers.length - 1; layer_num >= 0; layer_num--) {
    layer = layers[layer_num];
    if (styles.layers[layer.name] == null || styles.layers[layer.name].visible == false) {
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
        style.layer_num = layer_num;
        style.z = Scene.calculateZ(layer, tile) + style.z;
        var points = null,
            lines = null,
            polygons = null;
        if (feature.geometry.type == 'Polygon') {
          polygons = [feature.geometry.coordinates];
        } else if (feature.geometry.type == 'MultiPolygon') {
          polygons = feature.geometry.coordinates;
        } else if (feature.geometry.type == 'LineString') {
          lines = [feature.geometry.coordinates];
        } else if (feature.geometry.type == 'MultiLineString') {
          lines = feature.geometry.coordinates;
        } else if (feature.geometry.type == 'Point') {
          points = [feature.geometry.coordinates];
        } else if (feature.geometry.type == 'MultiPoint') {
          points = feature.geometry.coordinates;
        }
        mode = style.mode.name;
        if (vertex_data[mode] == null) {
          vertex_data[mode] = [];
        }
        if (polygons != null) {
          modes[mode].buildPolygons(polygons, style, vertex_data[mode]);
        }
        if (lines != null) {
          modes[mode].buildLines(lines, style, vertex_data[mode]);
        }
        if (points != null) {
          modes[mode].buildPoints(points, style, vertex_data[mode]);
        }
        tile.debug.features++;
      }
    }
  }
  tile.vertex_data = {};
  for (var s in vertex_data) {
    tile.vertex_data[s] = new Float32Array(vertex_data[s]);
  }
  return {vertex_data: true};
};
Scene.prototype.workerBuildTileCompleted = function(event) {
  var $__10 = this;
  if (event.data.type != 'buildTileCompleted') {
    return;
  }
  this.selection_map_worker_size[event.data.worker_id] = event.data.selection_map_size;
  this.selection_map_size = 0;
  Object.keys(this.selection_map_worker_size).forEach((function(worker) {
    $__10.selection_map_size += $__10.selection_map_worker_size[worker];
  }));
  console.log("selection map: " + this.selection_map_size + " features");
  var tile = event.data.tile;
  if (this.tiles[tile.key] == null) {
    console.log("discarded tile " + tile.key + " in Scene.tileWorkerCompleted because previously removed");
    return;
  }
  tile = this.mergeTile(tile.key, tile);
  this.buildGLGeometry(tile);
  this.dirty = true;
  this.trackTileSetLoadEnd();
  this.printDebugForTile(tile);
};
Scene.prototype.buildGLGeometry = function(tile) {
  var vertex_data = tile.vertex_data;
  this.freeTileResources(tile);
  tile.gl_geometry = {};
  for (var s in vertex_data) {
    tile.gl_geometry[s] = this.modes[s].makeGLGeometry(vertex_data[s]);
  }
  tile.debug.geometries = 0;
  tile.debug.buffer_size = 0;
  for (var p in tile.gl_geometry) {
    tile.debug.geometries += tile.gl_geometry[p].geometry_count;
    tile.debug.buffer_size += tile.gl_geometry[p].vertex_data.byteLength;
  }
  tile.debug.geom_ratio = (tile.debug.geometries / tile.debug.features).toFixed(1);
  delete tile.vertex_data;
};
Scene.prototype.removeTile = function(key) {
  if (!this.initialized) {
    return;
  }
  console.log("tile unload for " + key);
  if (this.zooming == true) {
    return;
  }
  var tile = this.tiles[key];
  if (tile != null) {
    this.freeTileResources(tile);
    this.workerPostMessageForTile(tile, {
      type: 'removeTile',
      key: tile.key
    });
  }
  delete this.tiles[key];
  this.dirty = true;
};
Scene.prototype.freeTileResources = function(tile) {
  if (tile != null && tile.gl_geometry != null) {
    for (var p in tile.gl_geometry) {
      tile.gl_geometry[p].destroy();
    }
    tile.gl_geometry = null;
  }
};
Scene.prototype.updateTileElement = function(tile, div) {
  div.setAttribute('data-tile-key', tile.key);
  div.style.width = '256px';
  div.style.height = '256px';
  if (this.debug) {
    var debug_overlay = document.createElement('div');
    debug_overlay.textContent = tile.key;
    debug_overlay.style.position = 'absolute';
    debug_overlay.style.left = 0;
    debug_overlay.style.top = 0;
    debug_overlay.style.color = 'white';
    debug_overlay.style.fontSize = '16px';
    div.appendChild(debug_overlay);
    div.style.borderStyle = 'solid';
    div.style.borderColor = 'white';
    div.style.borderWidth = '1px';
  }
};
Scene.prototype.mergeTile = function(key, source_tile) {
  var tile = this.tiles[key];
  if (tile == null) {
    this.tiles[key] = source_tile;
    return this.tiles[key];
  }
  for (var p in source_tile) {
    tile[p] = source_tile[p];
  }
  return tile;
};
Scene.prototype.loadScene = function(callback) {
  var $__10 = this;
  var queue = Queue();
  if (!this.layer_source && typeof(this.layers) == 'string') {
    this.layer_source = Utils.urlForPath(this.layers);
  }
  if (!this.style_source && typeof(this.styles) == 'string') {
    this.style_source = Utils.urlForPath(this.styles);
  }
  if (this.layer_source) {
    queue.defer((function(complete) {
      Scene.loadLayers($__10.layer_source, (function(layers) {
        $__10.layers = layers;
        $__10.layers_serialized = Utils.serializeWithFunctions($__10.layers);
        complete();
      }));
    }));
  }
  if (this.style_source) {
    queue.defer((function(complete) {
      Scene.loadStyles($__10.style_source, (function(styles) {
        $__10.styles = styles;
        $__10.styles_serialized = Utils.serializeWithFunctions($__10.styles);
        complete();
      }));
    }));
  } else {
    this.styles = Scene.postProcessStyles(this.styles);
  }
  queue.await(function() {
    if (typeof callback == 'function') {
      callback();
    }
  });
};
Scene.prototype.reloadScene = function() {
  var $__10 = this;
  if (!this.initialized) {
    return;
  }
  this.loadScene((function() {
    $__10.rebuildTiles();
  }));
};
Scene.prototype.refreshModes = function() {
  if (!this.initialized) {
    return;
  }
  this.modes = Scene.refreshModes(this.modes, this.styles);
};
Scene.prototype.updateActiveModes = function() {
  this.active_modes = {};
  var animated = false;
  for (var l in this.styles.layers) {
    var mode = this.styles.layers[l].mode.name;
    if (this.styles.layers[l].visible !== false) {
      this.active_modes[mode] = true;
      if (animated == false && this.modes[mode].animated == true) {
        animated = true;
      }
    }
  }
  this.animated = animated;
};
Scene.prototype.resetTime = function() {
  this.start_time = +new Date();
};
Scene.prototype.initInputHandlers = function() {};
Scene.prototype.input = function() {};
Scene.prototype.trackTileSetLoadStart = function() {
  if (this.tile_set_loading == null) {
    this.tile_set_loading = +new Date();
    console.log("tile set load START");
  }
};
Scene.prototype.trackTileSetLoadEnd = function() {
  if (this.tile_set_loading != null) {
    var end_tile_set = true;
    for (var t in this.tiles) {
      if (this.tiles[t].loading == true) {
        end_tile_set = false;
        break;
      }
    }
    if (end_tile_set == true) {
      this.last_tile_set_load = (+new Date()) - this.tile_set_loading;
      this.tile_set_loading = null;
      console.log("tile set load FINISHED in: " + this.last_tile_set_load);
    }
  }
};
Scene.prototype.printDebugForTile = function(tile) {
  console.log("debug for " + tile.key + ': [ ' + Object.keys(tile.debug).map(function(t) {
    return t + ': ' + tile.debug[t];
  }).join(', ') + ' ]');
};
Scene.prototype.compileShaders = function() {
  for (var m in this.modes) {
    this.modes[m].gl_program.compile();
  }
};
Scene.prototype.getDebugSum = function(prop, filter) {
  var sum = 0;
  for (var t in this.tiles) {
    if (this.tiles[t].debug[prop] != null && (typeof filter != 'function' || filter(this.tiles[t]) == true)) {
      sum += this.tiles[t].debug[prop];
    }
  }
  return sum;
};
Scene.prototype.getDebugAverage = function(prop, filter) {
  return this.getDebugSum(prop, filter) / Object.keys(this.tiles).length;
};
Scene.prototype.workerLogMessage = function(event) {
  if (event.data.type != 'log') {
    return;
  }
  console.log("worker " + event.data.worker_id + ": " + event.data.msg);
};
Scene.loadLayers = function(url, callback) {
  var layers;
  var req = new XMLHttpRequest();
  req.onload = function() {
    eval('layers = ' + req.response);
    if (typeof callback == 'function') {
      callback(layers);
    }
  };
  req.open('GET', url + '?' + (+new Date()), true);
  req.responseType = 'text';
  req.send();
};
Scene.loadStyles = function(url, callback) {
  var styles;
  var req = new XMLHttpRequest();
  req.onload = function() {
    styles = req.response;
    try {
      eval('styles = ' + req.response);
    } catch (e) {
      try {
        styles = yaml.safeLoad(req.response);
      } catch (e) {
        console.log("failed to parse styles!");
        console.log(styles);
        styles = null;
      }
    }
    Utils.stringsToFunctions(styles);
    Style.expandMacros(styles);
    Scene.postProcessStyles(styles);
    if (typeof callback == 'function') {
      callback(styles);
    }
  };
  req.open('GET', url + '?' + (+new Date()), true);
  req.responseType = 'text';
  req.send();
};
Scene.postProcessStyles = function(styles) {
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
  return styles;
};
Scene.processLayersForTile = function(layers, tile) {
  var tile_layers = {};
  for (var t = 0; t < layers.length; t++) {
    layers[t].number = t;
    if (layers[t] != null) {
      if (layers[t].data == null) {
        tile_layers[layers[t].name] = tile.layers[layers[t].name];
      } else if (typeof layers[t].data == 'string') {
        tile_layers[layers[t].name] = tile.layers[layers[t].data];
      } else if (typeof layers[t].data == 'function') {
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
Scene.createModes = function(styles) {
  var modes = {};
  var built_ins = _dereq_('./gl/gl_modes').Modes;
  for (var m in built_ins) {
    modes[m] = built_ins[m];
  }
  for (var m in styles.modes) {
    modes[m] = ModeManager.configureMode(m, styles.modes[m]);
  }
  return modes;
};
Scene.refreshModes = function(modes, styles) {
  for (var m in styles.modes) {
    modes[m] = ModeManager.configureMode(m, styles.modes[m]);
  }
  for (m in modes) {
    modes[m].refresh();
  }
  return modes;
};
function findBaseLibraryURL() {
  Scene.library_base_url = '';
  var scripts = document.getElementsByTagName('script');
  for (var s = 0; s < scripts.length; s++) {
    var match = scripts[s].src.indexOf('tangram.debug.js');
    if (match == -1) {
      match = scripts[s].src.indexOf('tangram.min.js');
    }
    if (match >= 0) {
      Scene.library_base_url = scripts[s].src.substr(0, match);
      break;
    }
  }
}
;


},{"./camera":3,"./geo":4,"./gl/gl":5,"./gl/gl_builders":6,"./gl/gl_modes":8,"./gl/gl_program":9,"./gl/gl_texture":11,"./point":15,"./style":17,"./utils":18,"gl-matrix":1,"js-yaml":"jkXaKS","queue-async":2}],17:[function(_dereq_,module,exports){
"use strict";
Object.defineProperties(exports, {
  Style: {get: function() {
      return Style;
    }},
  __esModule: {value: true}
});
var Geo = _dereq_('./geo').Geo;
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
Style.pixels = function(p, z) {
  var f;
  eval('f = function(f, t, h) { return ' + (typeof p == 'function' ? '(' + (p.toString() + '(f, t, h))') : p) + ' * h.Geo.meters_per_pixel[h.zoom]; }');
  return f;
};
Style.selection_map = {};
Style.selection_map_current = 1;
Style.selection_map_prefix = 0;
Style.generateSelection = function(color_map) {
  Style.selection_map_current++;
  var ir = Style.selection_map_current & 255;
  var ig = (Style.selection_map_current >> 8) & 255;
  var ib = (Style.selection_map_current >> 16) & 255;
  var ia = Style.selection_map_prefix;
  var r = ir / 255;
  var g = ig / 255;
  var b = ib / 255;
  var a = ia / 255;
  var key = (ir + (ig << 8) + (ib << 16) + (ia << 24)) >>> 0;
  color_map[key] = {color: [r, g, b, a]};
  return color_map[key];
};
Style.resetSelectionMap = function() {
  Style.selection_map = {};
  Style.selection_map_current = 1;
};
Style.macros = ['Style.color.pseudoRandomColor', 'Style.pixels'];
Style.expandMacros = function expandMacros(obj) {
  for (var p in obj) {
    var val = obj[p];
    if (typeof val == 'object') {
      obj[p] = expandMacros(val);
    } else if (typeof val == 'string') {
      for (var m in Style.macros) {
        if (val.match(Style.macros[m])) {
          var f;
          try {
            eval('f = ' + val);
            obj[p] = f;
            break;
          } catch (e) {
            obj[p] = val;
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
  var layer_style = layer_style || {};
  var style = {};
  Style.helpers.zoom = tile.coords.z;
  if (typeof layer_style.filter == 'function') {
    if (layer_style.filter(feature, tile, Style.helpers) == false) {
      return null;
    }
  }
  style.color = (layer_style.color && (layer_style.color[feature.properties.kind] || layer_style.color.default)) || Style.defaults.color;
  if (typeof style.color == 'function') {
    style.color = style.color(feature, tile, Style.helpers);
  }
  style.width = (layer_style.width && (layer_style.width[feature.properties.kind] || layer_style.width.default)) || Style.defaults.width;
  if (typeof style.width == 'function') {
    style.width = style.width(feature, tile, Style.helpers);
  }
  style.width *= Geo.units_per_meter[tile.coords.z];
  style.size = (layer_style.size && (layer_style.size[feature.properties.kind] || layer_style.size.default)) || Style.defaults.size;
  if (typeof style.size == 'function') {
    style.size = style.size(feature, tile, Style.helpers);
  }
  style.size *= Geo.units_per_meter[tile.coords.z];
  style.extrude = (layer_style.extrude && (layer_style.extrude[feature.properties.kind] || layer_style.extrude.default)) || Style.defaults.extrude;
  if (typeof style.extrude == 'function') {
    style.extrude = style.extrude(feature, tile, Style.helpers);
  }
  style.height = (feature.properties && feature.properties.height) || Style.defaults.height;
  style.min_height = (feature.properties && feature.properties.min_height) || Style.defaults.min_height;
  if (style.extrude) {
    if (typeof style.extrude == 'number') {
      style.height = style.extrude;
    } else if (typeof style.extrude == 'object' && style.extrude.length >= 2) {
      style.min_height = style.extrude[0];
      style.height = style.extrude[1];
    }
  }
  style.z = (layer_style.z && (layer_style.z[feature.properties.kind] || layer_style.z.default)) || Style.defaults.z || 0;
  if (typeof style.z == 'function') {
    style.z = style.z(feature, tile, Style.helpers);
  }
  style.outline = {};
  layer_style.outline = layer_style.outline || {};
  style.outline.color = (layer_style.outline.color && (layer_style.outline.color[feature.properties.kind] || layer_style.outline.color.default)) || Style.defaults.outline.color;
  if (typeof style.outline.color == 'function') {
    style.outline.color = style.outline.color(feature, tile, Style.helpers);
  }
  style.outline.width = (layer_style.outline.width && (layer_style.outline.width[feature.properties.kind] || layer_style.outline.width.default)) || Style.defaults.outline.width;
  if (typeof style.outline.width == 'function') {
    style.outline.width = style.outline.width(feature, tile, Style.helpers);
  }
  style.outline.width *= Geo.units_per_meter[tile.coords.z];
  style.outline.dash = (layer_style.outline.dash && (layer_style.outline.dash[feature.properties.kind] || layer_style.outline.dash.default)) || Style.defaults.outline.dash;
  if (typeof style.outline.dash == 'function') {
    style.outline.dash = style.outline.dash(feature, tile, Style.helpers);
  }
  var interactive = false;
  if (typeof layer_style.interactive == 'function') {
    interactive = layer_style.interactive(feature, tile, Style.helpers);
  } else {
    interactive = layer_style.interactive;
  }
  if (interactive == true) {
    var selector = Style.generateSelection(Style.selection_map);
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


},{"./geo":4}],18:[function(_dereq_,module,exports){
"use strict";
Object.defineProperties(exports, {
  urlForPath: {get: function() {
      return urlForPath;
    }},
  serializeWithFunctions: {get: function() {
      return serializeWithFunctions;
    }},
  deserializeWithFunctions: {get: function() {
      return deserializeWithFunctions;
    }},
  stringsToFunctions: {get: function() {
      return stringsToFunctions;
    }},
  runIfInMainThread: {get: function() {
      return runIfInMainThread;
    }},
  isPowerOf2: {get: function() {
      return isPowerOf2;
    }},
  __esModule: {value: true}
});
function urlForPath(path) {
  if (path == null || path == '') {
    return null;
  }
  if (typeof path == 'object' && path.length > 0) {
    for (var p in path) {
      var protocol = path[p].toLowerCase().substr(0, 4);
      if (!(protocol == 'http' || protocol == 'file')) {
        path[p] = window.location.origin + window.location.pathname + path[p];
      }
    }
  } else {
    var protocol = path.toLowerCase().substr(0, 4);
    if (!(protocol == 'http' || protocol == 'file')) {
      path = window.location.origin + window.location.pathname + path;
    }
  }
  return path;
}
;
function serializeWithFunctions(obj) {
  var serialized = JSON.stringify(obj, function(k, v) {
    if (typeof v == 'function') {
      return v.toString();
    }
    return v;
  });
  return serialized;
}
;
function deserializeWithFunctions(serialized) {
  var obj = JSON.parse(serialized);
  obj = stringsToFunctions(obj);
  return obj;
}
;
function stringsToFunctions(obj) {
  for (var p in obj) {
    var val = obj[p];
    if (typeof val == 'object') {
      obj[p] = stringsToFunctions(val);
    } else if (typeof val == 'string' && val.match(/^function.*\(.*\)/) != null) {
      var f;
      try {
        eval('f = ' + val);
        obj[p] = f;
      } catch (e) {
        obj[p] = val;
      }
    }
  }
  return obj;
}
;
function runIfInMainThread(block, err) {
  try {
    if (window.document !== undefined) {
      block();
    }
  } catch (e) {
    if (typeof err == 'function') {
      err();
    }
  }
}
function isPowerOf2(value) {
  return (value & (value - 1)) == 0;
}


},{}],19:[function(_dereq_,module,exports){
"use strict";
Object.defineProperties(exports, {
  Vector: {get: function() {
      return Vector;
    }},
  __esModule: {value: true}
});
var Vector = {};
Vector.lengthSq = function(v) {
  if (v.length == 2) {
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
  if (v.length == 2) {
    d = v[0] * v[0] + v[1] * v[1];
    d = Math.sqrt(d);
    if (d != 0) {
      return [v[0] / d, v[1] / d];
    }
    return [0, 0];
  } else {
    var d = v[0] * v[0] + v[1] * v[1] + v[2] * v[2];
    d = Math.sqrt(d);
    if (d != 0) {
      return [v[0] / d, v[1] / d, v[2] / d];
    }
    return [0, 0, 0];
  }
};
Vector.cross = function(v1, v2) {
  return [(v1[1] * v2[2]) - (v1[2] * v2[1]), (v1[2] * v2[0]) - (v1[0] * v2[2]), (v1[0] * v2[1]) - (v1[1] * v2[0])];
};
Vector.lineIntersection = function(p1, p2, p3, p4, parallel_tolerance) {
  var parallel_tolerance = parallel_tolerance || 0.01;
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


},{}]},{},[14])
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi9Vc2Vycy9iY2FtcGVyL0RvY3VtZW50cy9kZXYvdmVjdG9yLW1hcC9ub2RlX21vZHVsZXMvYnJvd3NlcmlmeS9ub2RlX21vZHVsZXMvYnJvd3Nlci1wYWNrL19wcmVsdWRlLmpzIiwiL1VzZXJzL2JjYW1wZXIvRG9jdW1lbnRzL2Rldi92ZWN0b3ItbWFwL25vZGVfbW9kdWxlcy9nbC1tYXRyaXgvZGlzdC9nbC1tYXRyaXguanMiLCIvVXNlcnMvYmNhbXBlci9Eb2N1bWVudHMvZGV2L3ZlY3Rvci1tYXAvbm9kZV9tb2R1bGVzL3F1ZXVlLWFzeW5jL3F1ZXVlLmpzIiwiL1VzZXJzL2JjYW1wZXIvRG9jdW1lbnRzL2Rldi92ZWN0b3ItbWFwL3NyYy9jYW1lcmEuanMiLCIvVXNlcnMvYmNhbXBlci9Eb2N1bWVudHMvZGV2L3ZlY3Rvci1tYXAvc3JjL2dlby5qcyIsIi9Vc2Vycy9iY2FtcGVyL0RvY3VtZW50cy9kZXYvdmVjdG9yLW1hcC9zcmMvZ2wvZ2wuanMiLCIvVXNlcnMvYmNhbXBlci9Eb2N1bWVudHMvZGV2L3ZlY3Rvci1tYXAvc3JjL2dsL2dsX2J1aWxkZXJzLmpzIiwiL1VzZXJzL2JjYW1wZXIvRG9jdW1lbnRzL2Rldi92ZWN0b3ItbWFwL3NyYy9nbC9nbF9nZW9tLmpzIiwiL1VzZXJzL2JjYW1wZXIvRG9jdW1lbnRzL2Rldi92ZWN0b3ItbWFwL3NyYy9nbC9nbF9tb2Rlcy5qcyIsIi9Vc2Vycy9iY2FtcGVyL0RvY3VtZW50cy9kZXYvdmVjdG9yLW1hcC9zcmMvZ2wvZ2xfcHJvZ3JhbS5qcyIsIi9Vc2Vycy9iY2FtcGVyL0RvY3VtZW50cy9kZXYvdmVjdG9yLW1hcC9zcmMvZ2wvZ2xfc2hhZGVycy5qcyIsIi9Vc2Vycy9iY2FtcGVyL0RvY3VtZW50cy9kZXYvdmVjdG9yLW1hcC9zcmMvZ2wvZ2xfdGV4dHVyZS5qcyIsIi9Vc2Vycy9iY2FtcGVyL0RvY3VtZW50cy9kZXYvdmVjdG9yLW1hcC9zcmMvZ2wvZ2xfdmVydGV4X2xheW91dC5qcyIsIi9Vc2Vycy9iY2FtcGVyL0RvY3VtZW50cy9kZXYvdmVjdG9yLW1hcC9zcmMvbGVhZmxldF9sYXllci5qcyIsIi9Vc2Vycy9iY2FtcGVyL0RvY3VtZW50cy9kZXYvdmVjdG9yLW1hcC9zcmMvbW9kdWxlLmpzIiwiL1VzZXJzL2JjYW1wZXIvRG9jdW1lbnRzL2Rldi92ZWN0b3ItbWFwL3NyYy9wb2ludC5qcyIsIi9Vc2Vycy9iY2FtcGVyL0RvY3VtZW50cy9kZXYvdmVjdG9yLW1hcC9zcmMvc2NlbmUuanMiLCIvVXNlcnMvYmNhbXBlci9Eb2N1bWVudHMvZGV2L3ZlY3Rvci1tYXAvc3JjL3N0eWxlLmpzIiwiL1VzZXJzL2JjYW1wZXIvRG9jdW1lbnRzL2Rldi92ZWN0b3ItbWFwL3NyYy91dGlscy5qcyIsIi9Vc2Vycy9iY2FtcGVyL0RvY3VtZW50cy9kZXYvdmVjdG9yLW1hcC9zcmMvdmVjdG9yLmpzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUFBO0FDQUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FB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LEVBQUksQ0FBQSxFQUFDLENBQUUsQ0FBQSxDQUFDLENBQUMsQ0FBQyxDQUFDO0FBRW5FLEFBQUksTUFBQSxDQUFBLFFBQU8sRUFBSSxFQUFDLEVBQUMsQ0FBRSxDQUFBLENBQUMsRUFBSSxDQUFBLEtBQUksQ0FBRSxDQUFBLENBQUMsRUFBSSxNQUFJLENBQUEsQ0FBRSxFQUFBLENBQUcsQ0FBQSxFQUFDLENBQUUsQ0FBQSxDQUFDLEVBQUksQ0FBQSxLQUFJLENBQUUsQ0FBQSxDQUFDLEVBQUksTUFBSSxDQUFBLENBQUUsRUFBQSxDQUFDLENBQUM7QUFDdkUsQUFBSSxNQUFBLENBQUEsUUFBTyxFQUFJLEVBQUMsRUFBQyxDQUFFLENBQUEsQ0FBQyxFQUFJLENBQUEsS0FBSSxDQUFFLENBQUEsQ0FBQyxFQUFJLE1BQUksQ0FBQSxDQUFFLEVBQUEsQ0FBRyxDQUFBLEVBQUMsQ0FBRSxDQUFBLENBQUMsRUFBSSxDQUFBLEtBQUksQ0FBRSxDQUFBLENBQUMsRUFBSSxNQUFJLENBQUEsQ0FBRSxFQUFBLENBQUMsQ0FBQztBQUV2RSxBQUFJLE1BQUEsQ0FBQSxRQUFPLEVBQUksRUFBQyxFQUFDLENBQUUsQ0FBQSxDQUFDLEVBQUksQ0FBQSxLQUFJLENBQUUsQ0FBQSxDQUFDLEVBQUksTUFBSSxDQUFBLENBQUUsRUFBQSxDQUFHLENBQUEsRUFBQyxDQUFFLENBQUEsQ0FBQyxFQUFJLENBQUEsS0FBSSxDQUFFLENBQUEsQ0FBQyxFQUFJLE1BQUksQ0FBQSxDQUFFLEVBQUEsQ0FBQyxDQUFDO0FBQ3ZFLEFBQUksTUFBQSxDQUFBLFFBQU8sRUFBSSxFQUFDLEVBQUMsQ0FBRSxDQUFBLENBQUMsRUFBSSxDQUFBLEtBQUksQ0FBRSxDQUFBLENBQUMsRUFBSSxNQUFJLENBQUEsQ0FBRSxFQUFBLENBQUcsQ0FBQSxFQUFDLENBQUUsQ0FBQSxDQUFDLEVBQUksQ0FBQSxLQUFJLENBQUUsQ0FBQSxDQUFDLEVBQUksTUFBSSxDQUFBLENBQUUsRUFBQSxDQUFDLENBQUM7QUFFdkUsV0FBTyxLQUFLLEFBQUMsQ0FDVCxRQUFPLENBQUcsU0FBTyxDQUFHLFNBQU8sQ0FDM0IsU0FBTyxDQUFHLFNBQU8sQ0FBRyxTQUFPLENBQy9CLENBQUM7RUFDTDtBQUFBLEFBSUEsU0FBUyxZQUFVLENBQUcsRUFBQyxDQUFHLENBQUEsS0FBSSxDQUFHLENBQUEsRUFBQyxDQUFHO0FBRWpDLEFBQUksTUFBQSxDQUFBLFFBQU8sRUFBSSxDQUFBLE1BQUssVUFBVSxBQUFDLENBQUMsQ0FBQyxDQUFDLEtBQUksQ0FBRSxDQUFBLENBQUMsRUFBSSxDQUFBLEVBQUMsQ0FBRSxDQUFBLENBQUMsQ0FBQyxFQUFJLEVBQUMsQ0FBQSxDQUFHLENBQUEsS0FBSSxDQUFFLENBQUEsQ0FBQyxFQUFJLENBQUEsRUFBQyxDQUFFLENBQUEsQ0FBQyxDQUFDLENBQUMsQ0FBQztBQUM1RSxBQUFJLE1BQUEsQ0FBQSxRQUFPLEVBQUksRUFDWCxDQUFDLEVBQUMsQ0FBRSxDQUFBLENBQUMsRUFBSSxDQUFBLFFBQU8sQ0FBRSxDQUFBLENBQUMsRUFBSSxNQUFJLENBQUEsQ0FBRSxFQUFBLENBQUcsQ0FBQSxFQUFDLENBQUUsQ0FBQSxDQUFDLEVBQUksQ0FBQSxRQUFPLENBQUUsQ0FBQSxDQUFDLEVBQUksTUFBSSxDQUFBLENBQUUsRUFBQSxDQUFDLENBQzdELEVBQUMsS0FBSSxDQUFFLENBQUEsQ0FBQyxFQUFJLENBQUEsUUFBTyxDQUFFLENBQUEsQ0FBQyxFQUFJLE1BQUksQ0FBQSxDQUFFLEVBQUEsQ0FBRyxDQUFBLEtBQUksQ0FBRSxDQUFBLENBQUMsRUFBSSxDQUFBLFFBQU8sQ0FBRSxDQUFBLENBQUMsRUFBSSxNQUFJLENBQUEsQ0FBRSxFQUFBLENBQUMsQ0FDdkUsQ0FBQztBQUNELEFBQUksTUFBQSxDQUFBLFFBQU8sRUFBSSxFQUNYLENBQUMsRUFBQyxDQUFFLENBQUEsQ0FBQyxFQUFJLENBQUEsUUFBTyxDQUFFLENBQUEsQ0FBQyxFQUFJLE1BQUksQ0FBQSxDQUFFLEVBQUEsQ0FBRyxDQUFBLEVBQUMsQ0FBRSxDQUFBLENBQUMsRUFBSSxDQUFBLFFBQU8sQ0FBRSxDQUFBLENBQUMsRUFBSSxNQUFJLENBQUEsQ0FBRSxFQUFBLENBQUMsQ0FDN0QsRUFBQyxLQUFJLENBQUUsQ0FBQSxDQUFDLEVBQUksQ0FBQSxRQUFPLENBQUUsQ0FBQSxDQUFDLEVBQUksTUFBSSxDQUFBLENBQUUsRUFBQSxDQUFHLENBQUEsS0FBSSxDQUFFLENBQUEsQ0FBQyxFQUFJLENBQUEsUUFBTyxDQUFFLENBQUEsQ0FBQyxFQUFJLE1BQUksQ0FBQSxDQUFFLEVBQUEsQ0FBQyxDQUN2RSxDQUFDO0FBRUQsQUFBSSxNQUFBLENBQUEsUUFBTyxFQUFJLENBQUEsTUFBSyxVQUFVLEFBQUMsQ0FBQyxDQUFDLENBQUMsRUFBQyxDQUFFLENBQUEsQ0FBQyxFQUFJLENBQUEsS0FBSSxDQUFFLENBQUEsQ0FBQyxDQUFDLEVBQUksRUFBQyxDQUFBLENBQUcsQ0FBQSxFQUFDLENBQUUsQ0FBQSxDQUFDLEVBQUksQ0FBQSxLQUFJLENBQUUsQ0FBQSxDQUFDLENBQUMsQ0FBQyxDQUFDO0FBQzVFLEFBQUksTUFBQSxDQUFBLFFBQU8sRUFBSSxFQUNYLENBQUMsS0FBSSxDQUFFLENBQUEsQ0FBQyxFQUFJLENBQUEsUUFBTyxDQUFFLENBQUEsQ0FBQyxFQUFJLE1BQUksQ0FBQSxDQUFFLEVBQUEsQ0FBRyxDQUFBLEtBQUksQ0FBRSxDQUFBLENBQUMsRUFBSSxDQUFBLFFBQU8sQ0FBRSxDQUFBLENBQUMsRUFBSSxNQUFJLENBQUEsQ0FBRSxFQUFBLENBQUMsQ0FDbkUsRUFBQyxFQUFDLENBQUUsQ0FBQSxDQUFDLEVBQUksQ0FBQSxRQUFPLENBQUUsQ0FBQSxDQUFDLEVBQUksTUFBSSxDQUFBLENBQUUsRUFBQSxDQUFHLENBQUEsRUFBQyxDQUFFLENBQUEsQ0FBQyxFQUFJLENBQUEsUUFBTyxDQUFFLENBQUEsQ0FBQyxFQUFJLE1BQUksQ0FBQSxDQUFFLEVBQUEsQ0FBQyxDQUNqRSxDQUFDO0FBQ0QsQUFBSSxNQUFBLENBQUEsUUFBTyxFQUFJLEVBQ1gsQ0FBQyxLQUFJLENBQUUsQ0FBQSxDQUFDLEVBQUksQ0FB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RyxDQUFBLENBQUEsRUFBSSxNQUFJLENBQUcsRUFBQSxDQUFHLEVBQUEsQ0FBRyxFQUFBLENBQUcsRUFBQSxDQUFHLElBQUUsQ0FBRyxFQUFBLENBRTVELENBQUEsUUFBTyxDQUFFLENBQUEsQ0FBQyxDQUFFLENBQUEsQ0FBQyxDQUFHLENBQUEsUUFBTyxDQUFFLENBQUEsQ0FBQyxDQUFFLENBQUEsQ0FBQyxDQUFHLENBQUEsQ0FBQSxFQUFJLE1BQUksQ0FBRyxFQUFBLENBQUcsRUFBQSxDQUFHLEVBQUEsQ0FBRyxFQUFBLENBQUcsSUFBRSxDQUFHLEVBQUEsQ0FDNUQsQ0FBQSxRQUFPLENBQUUsQ0FBQSxDQUFDLENBQUUsQ0FBQSxDQUFDLENBQUcsQ0FBQSxRQUFPLENBQUUsQ0FBQSxDQUFDLENBQUUsQ0FBQSxDQUFDLENBQUcsQ0FBQSxDQUFBLEVBQUksTUFBSSxDQUFHLEVBQUEsQ0FBRyxFQUFBLENBQUcsRUFBQSxDQUFHLEVBQUEsQ0FBRyxJQUFFLENBQUcsRUFBQSxDQUU1RCxDQUFBLFFBQU8sQ0FBRSxDQUFBLENBQUMsQ0FBRSxDQUFBLENBQUMsQ0FBRyxDQUFBLFFBQU8sQ0FBRSxDQUFBLENBQUMsQ0FBRSxDQUFBLENBQUMsQ0FBRyxDQUFBLENBQUEsRUFBSSxNQUFJLENBQUcsRUFBQSxDQUFHLEVBQUEsQ0FBRyxFQUFBLENBQUcsRUFBQSxDQUFHLElBQUUsQ0FBRyxFQUFBLENBQzVELENBQUEsUUFBTyxDQUFFLENBQUEsQ0FBQyxDQUFFLENBQUEsQ0FBQyxDQUFHLENBQUEsUUFBTyxDQUFFLENBQUEsQ0FBQyxDQUFFLENBQUEsQ0FBQyxDQUFHLENBQUEsQ0FBQSxFQUFJLE1BQUksQ0FBRyxFQUFBLENBQUcsRUFBQSxDQUFHLEVBQUEsQ0FBRyxFQUFBLENBQUcsSUFBRSxDQUFHLEVBQUEsQ0FFNUQsQ0FBQSxRQUFPLENBQUUsQ0FBQSxDQUFDLENBQUUsQ0FBQSxDQUFDLENBQUcsQ0FBQSxRQUFPLENBQUUsQ0FBQSxDQUFDLENBQUUsQ0FBQSxDQUFDLENBQUcsQ0FBQSxDQUFBLEVBQUksTUFBSSxDQUFHLEVBQUEsQ0FBRyxFQUFBLENBQUcsRUFBQSxDQUFHLEVBQUEsQ0FBRyxJQUFFLENBQUcsRUFBQSxDQUM1RCxDQUFBLFFBQU8sQ0FBRSxDQUFBLENBQUMsQ0FBRSxDQUFBLENBQUMsQ0FBRyxDQUFBLFFBQU8sQ0FBRSxDQUFBLENBQUMsQ0FBRSxDQUFBLENBQUMsQ0FBRyxDQUFBLENBQUEsRUFBSSxNQUFJLENBQUcsRUFBQSxDQUFHLEVBQUEsQ0FBRyxFQUFBLENBQUcsRUFBQSxDQUFHLElBQUUsQ0FBRyxFQUFBLENBRTVELENBQUEsUUFBTyxDQUFFLENBQUEsQ0FBQyxDQUFFLENBQUEsQ0FBQyxDQUFHLENBQUEsUUFBTyxDQUFFLENBQUEsQ0FBQyxDQUFFLENBQUEsQ0FBQyxDQUFHLENBQUEsQ0FBQSxFQUFJLE1BQUksQ0FBRyxFQUFBLENBQUcsRUFBQSxDQUFHLEVBQUEsQ0FBRyxFQUFBLENBQUcsSUFBRSxDQUFHLEVBQUEsQ0FDNUQsQ0FBQSxRQUFPLENBQUUsQ0FBQSxDQUFDLENBQUUsQ0FBQSxDQUFDLENBQUcsQ0FBQSxRQUFPLENBQUUsQ0FBQSxDQUFDLENBQUUsQ0FBQSxDQUFDLENBQUcsQ0FBQSxDQUFBLEVBQUksTUFBSSxDQUFHLEVBQUEsQ0FBRyxFQUFBLENBQUcsRUFBQSxDQUFHLEVBQUEsQ0FBRyxJQUFFLENBQUcsRUFBQSxDQUU1RCxDQUFBLFFBQU8sQ0FBRSxDQUFBLENBQUMsQ0FBRSxDQUFBLENBQUMsQ0FBRyxDQUFBLFFBQU8sQ0FBRSxDQUFBLENBQUMsQ0FBRSxDQUFBLENBQUMsQ0FBRyxDQUFBLENBQUEsRUFBSSxNQUFJLENBQUcsRUFBQSxDQUFHLEVBQUEsQ0FBRyxFQUFBLENBQUcsRUFBQSxDQUFHLElBQUUsQ0FBRyxFQUFBLENBQzVELENBQUEsUUFBTyxDQUFFLENBQUEsQ0FBQyxDQUFFLENBQUEsQ0FBQyxDQUFHLENBQUEsUUFBTyxDQUFFLENBQUEsQ0FBQyxDQUFFLENBQUEsQ0FBQyxDQUFHLENBQUEsQ0FBQSxFQUFJLE1BQUksQ0FBRyxFQUFBLENBQUcsRUFBQSxDQUFHLEVBQUEsQ0FBRyxFQUFBLENBQUcsSUFBRSxDQUFHLEVBQUEsQ0FFNUQsQ0FBQSxRQUFPLENBQUUsQ0FBQSxDQUFDLENBQUUsQ0FBQSxDQUFDLENBQUcsQ0FBQSxRQUFPLENBQUUsQ0FBQSxDQUFDLENBQUUsQ0FBQSxDQUFDLENBQUcsQ0FBQSxDQUFBLEVBQUksTUFBSSxDQUFHLEVBQUEsQ0FBRyxFQUFBLENBQUcsRUFBQSxDQUFHLEVBQUEsQ0FBRyxJQUFFLENBQUcsRUFBQSxDQUM1RCxDQUFBLFFBQU8sQ0FBRSxDQUFBLENBQUMsQ0FBRSxDQUFBLENBQUMsQ0FBRyxDQUFBLFFBQU8sQ0FBRSxDQUFBLENBQUMsQ0FBRSxDQUFBLENBQUMsQ0FBRyxDQUFBLENBQUEsRUFBSSxNQUFJLENBQUcsRUFBQSxDQUFHLEVBQUEsQ0FBRyxFQUFBLENBQUcsRUFBQSxDQUFHLElBQUUsQ0FBRyxFQUFBLENBRTVELENBQUEsUUFBTyxDQUFFLENBQUEsQ0FBQyxDQUFFLENBQUEsQ0FBQyxDQUFHLENBQUEsUUFBTyxDQUFFLENBQUEsQ0FBQyxDQUFFLENBQUEsQ0FBQyxDQUFHLENBQUEsQ0FBQSxFQUFJLE1BQUksQ0FBRyxFQUFBLENBQUcsRUFBQSxDQUFHLEVBQUEsQ0FBRyxFQUFBLENBQUcsSUFBRSxDQUFHLEVBQUEsQ0FDNUQsQ0FBQSxRQUFPLENBQUUsQ0FBQSxDQUFDLENBQUUsQ0FBQSxDQUFDLENBQUcsQ0FBQSxRQUFPLENBQUUsQ0FBQSxDQUFDLENBQUUsQ0FBQSxDQUFDLENBQUcsQ0FBQSxDQUFBLEVBQUksTUFBSSxDQUFHLEVBQUEsQ0FBRyxFQUFBLENBQUcsRUFBQSxDQUFHLEVBQUEsQ0FBRyxJQUFFLENBQUcsRUFBQSxDQUNoRSxDQUFDO0lBQ0w7QUFBQSxBQUVBLE9BQUksVUFBUyxNQUFNLEdBQUssV0FBUyxDQUFBLEVBQUssQ0FBQSxPQUFNLGFBQWEsQ0FBRztBQUN4RCxBQUFJLFFBQUEsQ0FBQSxNQUFLLENBQUM7QUFDVixTQUFJLFVBQVMsR0FBSyxXQUFTLENBQUc7QUFFMUIsYUFBSyxFQUFJLEVBQUMsQ0FBQSxDQUFHLEVBQUEsQ0FBRyxFQUFBLENBQUMsQ0FBQztNQUN0QixLQUNLLEtBQUksVUFBUyxHQUFLLFdBQVMsQ0FBRztBQUUvQixhQUFLLEVBQUksRUFBQyxDQUFBLENBQUcsRUFBQSxDQUFHLEVBQUEsQ0FBQyxDQUFDO01BQ3RCO0FBQUEsQUFJQSxZQUFNLGFBQWEsS0FBSyxBQUFDLENBQ3JCLEVBQUMsQ0FBRSxDQUFBLENBQUMsQ0FBRyxDQUFBLEVBQUMsQ0FBRSxDQUFBLENBQUMsQ0FBRyxDQUFBLENBQUEsRUFBSSxNQUFJLENBQ3RCLEVBQUEsQ0FBRyxFQUFBLENBQUcsRUFBQSxDQUFHLENBQUEsTUFBSyxDQUFFLENBQUEsQ0FBQyxDQUFHLENBQUEsTUFBSyxDQUFFLENBQUEsQ0FBQyxDQUFHLENBQUEsTUFBSyxDQUFFLENBQUEsQ0FBQyxDQUN2QyxDQUFBLEtBQUksQ0FBRSxDQUFBLENBQUMsQ0FBRyxDQUFBLEtBQUksQ0FBRSxDQUFBLENBQUMsQ0FBRyxDQUFBLENBQUEsRUFBSSxNQUFJLENBQzVCLEVBQUEsQ0FBRyxFQUFBLENBQUcsRUFBQSxDQUFHLENBQUEsTUFBSyxDQUFFLENBQUEsQ0FBQyxDQUFHLENBQUEsTUFBSyxDQUFFLENBQUEsQ0FBQyxDQUFHLENBQUEsTUFBSyxDQUFFLENBQUEsQ0FBQyxDQUN2QyxDQUFBLEtBQUksQ0FBRSxDQUFBLENBQUMsQ0FBRyxDQUFBLEtBQUksQ0FBRSxDQUFBLENBQUMsQ0FBRyxDQUFBLENBQUEsRUFBSSxNQUFJLENBQzVCLEVBQUEsQ0FBRyxFQUFBLENBQUcsRUFBQSxDQUFHLENBQUEsTUFBSyxDQUFFLENBQUEsQ0FBQyxDQUFHLENBQUEsTUFBSyxDQUFFLENBQUEsQ0FBQyxDQUFHLENBQUEsTUFBSyxDQUFFLENBQUEsQ0FBQyxDQUN2QyxDQUFBLEVBQUMsQ0FBRSxDQUFBLENBQUMsQ0FBRyxDQUFBLEVBQUMsQ0FBRSxDQUFBLENBQUMsQ0FBRyxDQUFBLENBQUEsRUFBSSxNQUFJLENBQ3RCLEVBQUEsQ0FBRyxFQUFBLENBQUcs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QUEsQ0FBQyxDQUFBLENBQUksQ0FBQSxDQUFBLENBQUUsQ0FBQSxDQUFDLEVBQUUsQ0FBQSxDQUFBLENBQUUsQ0FBQSxDQUFDLENBQUEsQ0FBSSxDQUFBLENBQUEsQ0FBRSxDQUFBLENBQUMsRUFBRSxDQUFBLENBQUEsQ0FBRSxDQUFBLENBQUMsQ0FBQyxDQUFDO0VBQzlDO0FBQUEsQUFDSixDQUFDO0FBR0QsS0FBSyxPQUFPLEVBQUksVUFBVSxDQUFBLENBQzFCO0FBQ0ksT0FBTyxDQUFBLElBQUcsS0FBSyxBQUFDLENBQUMsTUFBSyxTQUFTLEFBQUMsQ0FBQyxDQUFBLENBQUMsQ0FBQyxDQUFDO0FBQ3hDLENBQUM7QUFHRCxLQUFLLFVBQVUsRUFBSSxVQUFVLENBQUEsQ0FDN0I7QUFDSSxBQUFJLElBQUEsQ0FBQSxDQUFBLENBQUM7QUFDTCxLQUFJLENBQUEsT0FBTyxHQUFLLEVBQUEsQ0FBRztBQUNmLElBQUEsRUFBSSxDQUFBLENBQUEsQ0FBRSxDQUFBLENBQUMsRUFBRSxDQUFBLENBQUEsQ0FBRSxDQUFBLENBQUMsQ0FBQSxDQUFJLENBQUEsQ0FBQSxDQUFFLENBQUEsQ0FBQyxFQUFFLENBQUEsQ0FBQSxDQUFFLENBQUEsQ0FBQyxDQUFDO0FBQ3pCLElBQUEsRUFBSSxDQUFBLElBQUcsS0FBSyxBQUFDLENBQUMsQ0FBQSxDQUFDLENBQUM7QUFFaEIsT0FBSSxDQUFBLEdBQUssRUFBQSxDQUFHO0FBQ1IsV0FBTyxFQUFDLENBQUEsQ0FBRSxDQUFBLENBQUMsRUFBSSxFQUFBLENBQUcsQ0FBQSxDQUFBLENBQUUsQ0FBQSxDQUFDLEVBQUksRUFBQSxDQUFDLENBQUM7SUFDL0I7QUFBQSxBQUNBLFNBQU8sRUFBQyxDQUFBLENBQUcsRUFBQSxDQUFDLENBQUM7RUFDakIsS0FDSztBQUNELEFBQUksTUFBQSxDQUFBLENBQUEsRUFBSSxDQUFBLENBQUEsQ0FBRSxDQUFBLENBQUMsRUFBRSxDQUFBLENBQUEsQ0FBRSxDQUFBLENBQUMsQ0FBQSxDQUFJLENBQUEsQ0FBQSxDQUFFLENBQUEsQ0FBQyxFQUFFLENBQUEsQ0FBQSxDQUFFLENBQUEsQ0FBQyxDQUFBLENBQUksQ0FBQSxDQUFBLENBQUUsQ0FBQSxDQUFDLEVBQUUsQ0FBQSxDQUFBLENBQUUsQ0FBQSxDQUFDLENBQUM7QUFDekMsSUFBQSxFQUFJLENBQUEsSUFBRyxLQUFLLEFBQUMsQ0FBQyxDQUFBLENBQUMsQ0FBQztBQUVoQixPQUFJLENBQUEsR0FBSyxFQUFBLENBQUc7QUFDUixXQUFPLEVBQUMsQ0FBQSxDQUFFLENBQUEsQ0FBQyxFQUFJLEVBQUEsQ0FBRyxDQUFBLENBQUEsQ0FBRSxDQUFBLENBQUMsRUFBSSxFQUFBLENBQUcsQ0FBQSxDQUFBLENBQUUsQ0FBQSxDQUFDLEVBQUksRUFBQSxDQUFDLENBQUM7SUFDekM7QUFBQSxBQUNBLFNBQU8sRUFBQyxDQUFBLENBQUcsRUFBQSxDQUFHLEVBQUEsQ0FBQyxDQUFDO0VBQ3BCO0FBQUEsQUFDSixDQUFDO0FBR0QsS0FBSyxNQUFNLEVBQUssVUFBVSxFQUFDLENBQUcsQ0FBQSxFQUFDLENBQy9CO0FBQ0ksT0FBTyxFQUNILENBQUMsRUFBQyxDQUFFLENBQUEsQ0FBQyxFQUFJLENBQUEsRUFBQyxDQUFFLENBQUEsQ0FBQyxDQUFDLEVBQUksRUFBQyxFQUFDLENBQUUsQ0FBQSxDQUFDLEVBQUksQ0FBQSxFQUFDLENBQUUsQ0FBQSxDQUFDLENBQUMsQ0FDaEMsQ0FBQSxDQUFDLEVBQUMsQ0FBRSxDQUFBLENBQUMsRUFBSSxDQUFBLEVBQUMsQ0FBRSxDQUFBLENBQUMsQ0FBQyxFQUFJLEVBQUMsRUFBQyxDQUFFLENBQUEsQ0FBQyxFQUFJLENBQUEsRUFBQyxDQUFFLENBQUEsQ0FBQyxDQUFDLENBQ2hDLENBQUEsQ0FBQyxFQUFDLENBQUUsQ0FBQSxDQUFDLEVBQUksQ0FBQSxFQUFDLENBQUUsQ0FBQSxDQUFDLENBQUMsRUFBSSxFQUFDLEVBQUMsQ0FBRSxDQUFBLENBQUMsRUFBSSxDQUFBLEVBQUMsQ0FBRSxDQUFBLENBQUMsQ0FBQyxDQUNwQyxDQUFDO0FBQ0wsQ0FBQztBQUtELEtBQUssaUJBQWlCLEVBQUksVUFBVSxFQUFDLENBQUcsQ0FBQSxFQUFDLENBQUcsQ0FBQSxFQUFDLENBQUcsQ0FBQSxFQUFDLENBQUcsQ0FBQSxrQkFBaUIsQ0FDckU7QUFDSSxBQUFJLElBQUEsQ0FBQSxrQkFBaUIsRUFBSSxDQUFBLGtCQUFpQixHQUFLLEtBQUcsQ0FBQztBQUluRCxBQUFJLElBQUEsQ0FBQSxFQUFDLEVBQUksQ0FBQSxFQUFDLENBQUUsQ0FBQSxDQUFDLEVBQUksQ0FBQSxFQUFDLENBQUUsQ0FBQSxDQUFDLENBQUM7QUFDdEIsQUFBSSxJQUFBLENBQUEsRUFBQyxFQUFJLENBQUEsRUFBQyxDQUFFLENBQUEsQ0FBQyxFQUFJLENBQUEsRUFBQyxDQUFFLENBQUEsQ0FBQyxDQUFDO0FBQ3RCLEFBQUksSUFBQSxDQUFBLEVBQUMsRUFBSSxDQUFBLEVBQUMsQ0FBRSxDQUFBLENBQUMsRUFBSSxDQUFBLEVBQUMsQ0FBRSxDQUFBLENBQUMsQ0FBQztBQUN0QixBQUFJLElBQUEsQ0FBQSxFQUFDLEVBQUksQ0FBQSxFQUFDLENBQUUsQ0FBQSxDQUFDLEVBQUksQ0FBQSxFQUFDLENBQUUsQ0FBQSxDQUFDLENBQUM7QUFDdEIsQUFBSSxJQUFBLENBQUEsRUFBQyxFQUFJLENBQUEsQ0FBQyxFQUFDLENBQUUsQ0FBQSxDQUFDLEVBQUksQ0FBQSxFQUFDLENBQUUsQ0FBQSxDQUFDLENBQUMsRUFBSSxFQUFDLEVBQUMsQ0FBRSxDQUFBLENBQUMsRUFBSSxDQUFBLEVBQUMsQ0FBRSxDQUFBLENBQUMsQ0FBQyxDQUFDO0FBQzFDLEFBQUksSUFBQSxDQUFBLEVBQUMsRUFBSSxDQUFBLENBQUMsRUFBQyxDQUFFLENBQUEsQ0FBQyxFQUFJLENBQUEsRUFBQyxDQUFFLENBQUEsQ0FBQyxDQUFDLEVBQUksRUFBQyxFQUFDLENBQUUsQ0FBQSxDQUFDLEVBQUksQ0FBQSxFQUFDLENBQUUsQ0FBQSxDQUFDLENBQUMsQ0FBQztBQUMxQyxBQUFJLElBQUEsQ0FBQSxLQUFJLEVBQUksQ0FBQSxDQUFDLEVBQUMsRUFBSSxHQUFDLENBQUMsRUFBSSxFQUFDLEVBQUMsRUFBSSxHQUFDLENBQUMsQ0FBQztBQUVqQyxLQUFJLElBQUcsSUFBSSxBQUFDLENBQUMsS0FBSSxDQUFDLENBQUEsQ0FBSSxtQkFBaUIsQ0FBRztBQUN0QyxTQUFPLEVBQ0gsQ0FBQyxDQUFDLEVBQUMsRUFBSSxHQUFDLENBQUMsRUFBSSxFQUFDLEVBQUMsRUFBSSxHQUFDLENBQUMsQ0FBQyxFQUFJLE1BQUksQ0FDOUIsQ0FBQSxDQUFDLENBQUMsRUFBQyxFQUFJLEdBQUMsQ0FBQyxFQUFJLEVBQUMsRUFBQyxFQUFJLEdBQUMsQ0FBQyxDQUFDLEVBQUksTUFBSSxDQUNsQyxDQUFDO0VBQ0w7QUFBQSxBQUNBLE9BQU8sS0FBRyxDQUFDO0FBQ2YsQ0FBQztBQUNEIiwiZmlsZSI6ImdlbmVyYXRlZC5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzQ29udGVudCI6WyIoZnVuY3Rpb24gZSh0LG4scil7ZnVuY3Rpb24gcyhvLHUpe2lmKCFuW29dKXtpZighdFtvXSl7dmFyIGE9dHlwZW9mIHJlcXVpcmU9PVwiZnVuY3Rpb25cIiYmcmVxdWlyZTtpZighdSYmYSlyZXR1cm4gYShvLCEwKTtpZihpKXJldHVybiBpKG8sITApO3Rocm93IG5ldyBFcnJvcihcIkNhbm5vdCBmaW5kIG1vZHVsZSAnXCIrbytcIidcIil9dmFyIGY9bltvXT17ZXhwb3J0czp7fX07dFtvXVswXS5jYWxsKGYuZXhwb3J0cyxmdW5jdGlvbihlKXt2YXIgbj10W29dWzFdW2VdO3JldHVybiBzKG4/bjplKX0sZixmLmV4cG9ydHMsZSx0LG4scil9cmV0dXJuIG5bb10uZXhwb3J0c312YXIgaT10eXBlb2YgcmVxdWlyZT09XCJmdW5jdGlvblwiJiZyZXF1aXJlO2Zvcih2YXIgbz0wO288ci5sZW5ndGg7bysrKXMocltvXSk7cmV0dXJuIHN9KSIsIi8qKlxuICogQGZpbGVvdmVydmlldyBnbC1tYXRyaXggLSBIaWdoIHBlcmZvcm1hbmNlIG1hdHJpeCBhbmQgdmVjdG9yIG9wZXJhdGlvbnNcbiAqIEBhdXRob3IgQnJhbmRvbiBKb25lc1xuICogQGF1dGhvciBDb2xpbiBNYWNLZW56aWUgSVZcbiAqIEB2ZXJzaW9uIDIuMi4xXG4gKi9cblxuLyogQ29weXJpZ2h0IChjKSAyMDEzLCBCcmFuZG9uIEpvbmVzLCBDb2xpbiBNYWNLZW56aWUgSVYuIEFsbCByaWdodHMgcmVzZXJ2ZWQuXG5cblJlZGlzdHJpYnV0aW9uIGFuZCB1c2UgaW4gc291cmNlIGFuZCBiaW5hcnkgZm9ybXMsIHdpdGggb3Igd2l0aG91dCBtb2RpZmljYXRpb24sXG5hcmUgcGVybWl0dGVkIHByb3ZpZGVkIHRoYXQgdGhlIGZvbGxvd2luZyBjb25kaXRpb25zIGFyZSBtZXQ6XG5cbiAgKiBSZWRpc3RyaWJ1dGlvbnMgb2Ygc291cmNlIGNvZGUgbXVzdCByZXRhaW4gdGhlIGFib3ZlIGNvcHlyaWdodCBub3RpY2UsIHRoaXNcbiAgICBsaXN0IG9mIGNvbmRpdGlvbnMgYW5kIHRoZSBmb2xsb3dpbmcgZGlzY2xhaW1lci5cbiAgKiBSZWRpc3RyaWJ1dGlvbnMgaW4gYmluYXJ5IGZvcm0gbXVzdCByZXByb2R1Y2UgdGhlIGFib3ZlIGNvcHlyaWdodCBub3RpY2UsXG4gICAgdGhpcyBsaXN0IG9mIGNvbmRpdGlvbnMgYW5kIHRoZSBmb2xsb3dpbmcgZGlzY2xhaW1lciBpbiB0aGUgZG9jdW1lbnRhdGlvblxuICAgIGFuZC9vciBvdGhlciBtYXRlcmlhbHMgcHJvdmlkZWQgd2l0aCB0aGUgZGlzdHJpYnV0aW9uLlxuXG5USElTIFNPRlRXQVJFIElTIFBST1ZJREVEIEJZIFRIRSBDT1BZUklHSFQgSE9MREVSUyBBTkQgQ09OVFJJQlVUT1JTIFwiQVMgSVNcIiBBTkRcbkFOWSBFWFBSRVNTIE9SIElNUExJRUQgV0FSUkFOVElFUywgSU5DTFVESU5HLCBCVVQgTk9UIExJTUlURUQgVE8sIFRIRSBJTVBMSUVEXG5XQVJSQU5USUVTIE9GIE1FUkNIQU5UQUJJTElUWSBBTkQgRklUTkVTUyBGT1IgQSBQQVJUSUNVTEFSIFBVUlBPU0UgQVJFXG5ESVNDTEFJTUVELiBJTiBOTyBFVkVOVCBTSEFMTCBUSEUgQ09QWVJJR0hUIEhPTERFUiBPUiBDT05UUklCVVRPUlMgQkUgTElBQkxFIEZPUlxuQU5ZIERJUkVDVCwgSU5ESVJFQ1QsIElOQ0lERU5UQUwsIFNQRUNJQUwsIEVYRU1QTEFSWSwgT1IgQ09OU0VRVUVOVElBTCBEQU1BR0VTXG4oSU5DTFVESU5HLCBCVVQgTk9UIExJTUlURUQgVE8sIFBST0NVUkVNRU5UIE9GIFNVQlNUSVRVVEUgR09PRFMgT1IgU0VSVklDRVM7XG5MT1NTIE9GIFVTRSwgREFUQSwgT1IgUFJPRklUUzsgT1IgQlVTSU5FU1MgSU5URVJSVVBUSU9OKSBIT1dFVkVSIENBVVNFRCBBTkQgT05cbkFOWSBUSEVPUlkgT0YgTElBQklMSVRZLCBXSEVUSEVSIElOIENPTlRSQUNULCBTVFJJQ1QgTElBQklMSVRZLCBPUiBUT1JUXG4oSU5DTFVESU5HIE5FR0xJR0VOQ0UgT1IgT1RIRVJXSVNFKSBBUklTSU5HIElOIEFOWSBXQVkgT1VUIE9GIFRIRSBVU0UgT0YgVEhJU1xuU09GVFdBUkUsIEVWRU4gSUYgQURWSVNFRCBPRiBUSEUgUE9TU0lCSUxJVFkgT0YgU1VDSCBEQU1BR0UuICovXG5cblxuKGZ1bmN0aW9uKF9nbG9iYWwpIHtcbiAgXCJ1c2Ugc3RyaWN0XCI7XG5cbiAgdmFyIHNoaW0gPSB7fTtcbiAgaWYgKHR5cGVvZihleHBvcnRzKSA9PT0gJ3VuZGVmaW5lZCcpIHtcbiAgICBpZih0eXBlb2YgZGVmaW5lID09ICdmdW5jdGlvbicgJiYgdHlwZW9mIGRlZmluZS5hbWQgPT0gJ29iamVjdCcgJiYgZGVmaW5lLmFtZCkge1xuICAgICAgc2hpbS5leHBvcnRzID0ge307XG4gICAgICBkZWZpbmUoZnVuY3Rpb24oKSB7XG4gICAgICAgIHJldHVybiBzaGltLmV4cG9ydHM7XG4gICAgICB9KTtcbiAgICB9IGVsc2Uge1xuICAgICAgLy8gZ2wtbWF0cml4IGxpdmVzIGluIGEgYnJvd3NlciwgZGVmaW5lIGl0cyBuYW1lc3BhY2VzIGluIGdsb2JhbFxuICAgICAgc2hpbS5leHBvcnRzID0gdHlwZW9mKHdpbmRvdykgIT09ICd1bmRlZmluZWQnID8gd2luZG93IDogX2dsb2JhbDtcbiAgICB9XG4gIH1cbiAgZWxzZSB7XG4gICAgLy8gZ2wtbWF0cml4IGxpdmVzIGluIGNvbW1vbmpzLCBkZWZpbmUgaXRzIG5hbWVzcGFjZXMgaW4gZXhwb3J0c1xuICAgIHNoaW0uZXhwb3J0cyA9IGV4cG9ydHM7XG4gIH1cblxuICAoZnVuY3Rpb24oZXhwb3J0cykge1xuICAgIC8qIENvcHlyaWdodCAoYykgMjAxMywgQnJhbmRvbiBKb25lcywgQ29saW4gTWFjS2VuemllIElWLiBBbGwgcmlnaHRzIHJlc2VydmVkLlxuXG5SZWRpc3RyaWJ1dGlvbiBhbmQgdXNlIGluIHNvdXJjZSBhbmQgYmluYXJ5IGZvcm1zLCB3aXRoIG9yIHdpdGhvdXQgbW9kaWZpY2F0aW9uLFxuYXJlIHBlcm1pdHRlZCBwcm92aWRlZCB0aGF0IHRoZSBmb2xsb3dpbmcgY29uZGl0aW9ucyBhcmUgbWV0OlxuXG4gICogUmVkaXN0cmlidXRpb25zIG9mIHNvdXJjZSBjb2RlIG11c3QgcmV0YWluIHRoZSBhYm92ZSBjb3B5cmlnaHQgbm90aWNlLCB0aGlzXG4gICAgbGlzdCBvZiBjb25kaXRpb25zIGFuZCB0aGUgZm9sbG93aW5nIGRpc2NsYWltZXIuXG4gICogUmVkaXN0cmlidXRpb25zIGluIGJpbmFyeSBmb3JtIG11c3QgcmVwcm9kdWNlIHRoZSBhYm92ZSBjb3B5cmlnaHQgbm90aWNlLFxuICAgIHRoaXMgbGlzdCBvZiBjb25kaXRpb25zIGFuZCB0aGUgZm9sbG93aW5nIGRpc2NsYWltZXIgaW4gdGhlIGRvY3VtZW50YXRpb24gXG4gICAgYW5kL29yIG90aGVyIG1hdGVyaWFscyBwcm92aWRlZCB3aXRoIHRoZSBkaXN0cmlidXRpb24uXG5cblRISVMgU09GVFdBUkUgSVMgUFJPVklERUQgQlkgVEhFIENPUFlSSUdIVCBIT0xERVJTIEFORCBDT05UUklCVVRPUlMgXCJBUyBJU1wiIEFORFxuQU5ZIEVYUFJFU1MgT1IgSU1QTElFRCBXQVJSQU5USUVTLCBJTkNMVURJTkcsIEJVVCBOT1QgTElNSVRFRCBUTywgVEhFIElNUExJRURcbldBUlJBTlRJRVMgT0YgTUVSQ0hBTlRBQklMSVRZIEFORCBGSVRORVNTIEZPUiBBIFBBUlRJQ1VMQVIgUFVSUE9TRSBBUkUgXG5ESVNDTEFJTUVELiBJTiBOTyBFVkVOVCBTSEFMTCBUSEUgQ09QWVJJR0hUIEhPTERFUiBPUiBDT05UUklCVVRPUlMgQkUgTElBQkxFIEZPUlxuQU5ZIERJUkVDVCwgSU5ESVJFQ1QsIElOQ0lERU5UQUwsIFNQRUNJQUwsIEVYRU1QTEFSWSwgT1IgQ09OU0VRVUVOVElBTCBEQU1BR0VTXG4oSU5DTFVESU5HLCBCVVQgTk9UIExJTUlURUQgVE8sIFBST0NVUkVNRU5UIE9GIFNVQlNUSVRVVEUgR09PRFMgT1IgU0VSVklDRVM7XG5MT1NTIE9GIFVTRSwgREFUQSwgT1IgUFJPRklUUzsgT1IgQlVTSU5FU1MgSU5URVJSVVBUSU9OKSBIT1dFVkVSIENBVVNFRCBBTkQgT05cbkFOWSBUSEVPUlkgT0YgTElBQklMSVRZLCBXSEVUSEVSIElOIENPTlRSQUNULCBTVFJJQ1QgTElBQklMSVRZLCBPUiBUT1JUXG4oSU5DTFVESU5HIE5FR0xJR0VOQ0UgT1IgT1RIRVJXSVNFKSBBUklTSU5HIElOIEFOWSBXQVkgT1VUIE9GIFRIRSBVU0UgT0YgVEhJU1xuU09GVFdBUkUsIEVWRU4gSUYgQURWSVNFRCBPRiBUSEUgUE9TU0lCSUxJVFkgT0YgU1VDSCBEQU1BR0UuICovXG5cblxuaWYoIUdMTUFUX0VQU0lMT04pIHtcbiAgICB2YXIgR0xNQVRfRVBTSUxPTiA9IDAuMDAwMDAxO1xufVxuXG5pZighR0xNQVRfQVJSQVlfVFlQRSkge1xuICAgIHZhciBHTE1BVF9BUlJBWV9UWVBFID0gKHR5cGVvZiBGbG9hdDMyQXJyYXkgIT09ICd1bmRlZmluZWQnKSA/IEZsb2F0MzJBcnJheSA6IEFycmF5O1xufVxuXG5pZighR0xNQVRfUkFORE9NKSB7XG4gICAgdmFyIEdMTUFUX1JBTkRPTSA9IE1hdGgucmFuZG9tO1xufVxuXG4vKipcbiAqIEBjbGFzcyBDb21tb24gdXRpbGl0aWVzXG4gKiBAbmFtZSBnbE1hdHJpeFxuICovXG52YXIgZ2xNYXRyaXggPSB7fTtcblxuLyoqXG4gKiBTZXRzIHRoZSB0eXBlIG9mIGFycmF5IHVzZWQgd2hlbiBjcmVhdGluZyBuZXcgdmVjdG9ycyBhbmQgbWF0cmljaWVzXG4gKlxuICogQHBhcmFtIHtUeXBlfSB0eXBlIEFycmF5IHR5cGUsIHN1Y2ggYXMgRmxvYXQzMkFycmF5IG9yIEFycmF5XG4gKi9cbmdsTWF0cml4LnNldE1hdHJpeEFycmF5VHlwZSA9IGZ1bmN0aW9uKHR5cGUpIHtcbiAgICBHTE1BVF9BUlJBWV9UWVBFID0gdHlwZTtcbn1cblxuaWYodHlwZW9mKGV4cG9ydHMpICE9PSAndW5kZWZpbmVkJykge1xuICAgIGV4cG9ydHMuZ2xNYXRyaXggPSBnbE1hdHJpeDtcbn1cblxudmFyIGRlZ3JlZSA9IE1hdGguUEkgLyAxODA7XG5cbi8qKlxuKiBDb252ZXJ0IERlZ3JlZSBUbyBSYWRpYW5cbipcbiogQHBhcmFtIHtOdW1iZXJ9IEFuZ2xlIGluIERlZ3JlZXNcbiovXG5nbE1hdHJpeC50b1JhZGlhbiA9IGZ1bmN0aW9uKGEpe1xuICAgICByZXR1cm4gYSAqIGRlZ3JlZTtcbn1cbjtcbi8qIENvcHlyaWdodCAoYykgMjAxMywgQnJhbmRvbiBKb25lcywgQ29saW4gTWFjS2VuemllIElWLiBBbGwgcmlnaHRzIHJlc2VydmVkLlxuXG5SZWRpc3RyaWJ1dGlvbiBhbmQgdXNlIGluIHNvdXJjZSBhbmQgYmluYXJ5IGZvcm1zLCB3aXRoIG9yIHdpdGhvdXQgbW9kaWZpY2F0aW9uLFxuYXJlIHBlcm1pdHRlZCBwcm92aWRlZCB0aGF0IHRoZSBmb2xsb3dpbmcgY29uZGl0aW9ucyBhcmUgbWV0OlxuXG4gICogUmVkaXN0cmlidXRpb25zIG9mIHNvdXJjZSBjb2RlIG11c3QgcmV0YWluIHRoZSBhYm92ZSBjb3B5cmlnaHQgbm90aWNlLCB0aGlzXG4gICAgbGlzdCBvZiBjb25kaXRpb25zIGFuZCB0aGUgZm9sbG93aW5nIGRpc2NsYWltZXIuXG4gICogUmVkaXN0cmlidXRpb25zIGluIGJpbmFyeSBmb3JtIG11c3QgcmVwcm9kdWNlIHRoZSBhYm92ZSBjb3B5cmlnaHQgbm90aWNlLFxuICAgIHRoaXMgbGlzdCBvZiBjb25kaXRpb25zIGFuZCB0aGUgZm9sbG93aW5nIGRpc2NsYWltZXIgaW4gdGhlIGRvY3VtZW50YXRpb24gXG4gICAgYW5kL29yIG90aGVyIG1hdGVyaWFscyBwcm92aWRlZCB3aXRoIHRoZSBkaXN0cmlidXRpb24uXG5cblRISVMgU09GVFdBUkUgSVMgUFJPVklERUQgQlkgVEhFIENPUFlSSUdIVCBIT0xERVJTIEFORCBDT05UUklCVVRPUlMgXCJBUyBJU1wiIEFORFxuQU5ZIEVYUFJFU1MgT1IgSU1QTElFRCBXQVJSQU5USUVTLCBJTkNMVURJTkcsIEJVVCBOT1QgTElNSVRFRCBUTywgVEhFIElNUExJRURcbldBUlJBTlRJRVMgT0YgTUVSQ0hBTlRBQklMSVRZIEFORCBGSVRORVNTIEZPUiBBIFBBUlRJQ1VMQVIgUFVSUE9TRSBBUkUgXG5ESVNDTEFJTUVELiBJTiBOTyBFVkVOVCBTSEFMTCBUSEUgQ09QWVJJR0hUIEhPTERFUiBPUiBDT05UUklCVVRPUlMgQkUgTElBQkxFIEZPUlxuQU5ZIERJUkVDVCwgSU5ESVJFQ1QsIElOQ0lERU5UQUwsIFNQRUNJQUwsIEVYRU1QTEFSWSwgT1IgQ09OU0VRVUVOVElBTCBEQU1BR0VTXG4oSU5DTFVESU5HLCBCVVQgTk9UIExJTUlURUQgVE8sIFBST0NVUkVNRU5UIE9GIFNVQlNUSVRVVEUgR09PRFMgT1IgU0VSVklDRVM7XG5MT1NTIE9GIFVTRSwgREFUQSwgT1IgUFJPRklUUzsgT1IgQlVTSU5FU1MgSU5URVJSVVBUSU9OKSBIT1dFVkVSIENBVVNFRCBBTkQgT05cbkFOWSBUSEVPUlkgT0YgTElBQklMSVRZLCBXSEVUSEVSIElOIENPTlRSQUNULCBTVFJJQ1QgTElBQklMSVRZLCBPUiBUT1JUXG4oSU5DTFVESU5HIE5FR0xJR0VOQ0UgT1IgT1RIRVJXSVNFKSBBUklTSU5HIElOIEFOWSBXQVkgT1VUIE9GIFRIRSBVU0UgT0YgVEhJU1xuU09GVFdBUkUsIEVWRU4gSUYgQURWSVNFRCBPRiBUSEUgUE9TU0lCSUxJVFkgT0YgU1VDSCBEQU1BR0UuICovXG5cbi8qKlxuICogQGNsYXNzIDIgRGltZW5zaW9uYWwgVmVjdG9yXG4gKiBAbmFtZSB2ZWMyXG4gKi9cblxudmFyIHZlYzIgPSB7fTtcblxuLyoqXG4gKiBDcmVhdGVzIGEgbmV3LCBlbXB0eSB2ZWMyXG4gKlxuICogQHJldHVybnMge3ZlYzJ9IGEgbmV3IDJEIHZlY3RvclxuICovXG52ZWMyLmNyZWF0ZSA9IGZ1bmN0aW9uKCkge1xuICAgIHZhciBvdXQgPSBuZXcgR0xNQVRfQVJSQVlfVFlQRSgyKTtcbiAgICBvdXRbMF0gPSAwO1xuICAgIG91dFsxXSA9IDA7XG4gICAgcmV0dXJuIG91dDtcbn07XG5cbi8qKlxuICogQ3JlYXRlcyBhIG5ldyB2ZWMyIGluaXRpYWxpemVkIHdpdGggdmFsdWVzIGZyb20gYW4gZXhpc3RpbmcgdmVjdG9yXG4gKlxuICogQHBhcmFtIHt2ZWMyfSBhIHZlY3RvciB0byBjbG9uZVxuICogQHJldHVybnMge3ZlYzJ9IGEgbmV3IDJEIHZlY3RvclxuICovXG52ZWMyLmNsb25lID0gZnVuY3Rpb24oYSkge1xuICAgIHZhciBvdXQgPSBuZXcgR0xNQVRfQVJSQVlfVFlQRSgyKTtcbiAgICBvdXRbMF0gPSBhWzBdO1xuICAgIG91dFsxXSA9IGFbMV07XG4gICAgcmV0dXJuIG91dDtcbn07XG5cbi8qKlxuICogQ3JlYXRlcyBhIG5ldyB2ZWMyIGluaXRpYWxpemVkIHdpdGggdGhlIGdpdmVuIHZhbHVlc1xuICpcbiAqIEBwYXJhbSB7TnVtYmVyfSB4IFggY29tcG9uZW50XG4gKiBAcGFyYW0ge051bWJlcn0geSBZIGNvbXBvbmVudFxuICogQHJldHVybnMge3ZlYzJ9IGEgbmV3IDJEIHZlY3RvclxuICovXG52ZWMyLmZyb21WYWx1ZXMgPSBmdW5jdGlvbih4LCB5KSB7XG4gICAgdmFyIG91dCA9IG5ldyBHTE1BVF9BUlJBWV9UWVBFKDIpO1xuICAgIG91dFswXSA9IHg7XG4gICAgb3V0WzFdID0geTtcbiAgICByZXR1cm4gb3V0O1xufTtcblxuLyoqXG4gKiBDb3B5IHRoZSB2YWx1ZXMgZnJvbSBvbmUgdmVjMiB0byBhbm90aGVyXG4gKlxuICogQHBhcmFtIHt2ZWMyfSBvdXQgdGhlIHJlY2VpdmluZyB2ZWN0b3JcbiAqIEBwYXJhbSB7dmVjMn0gYSB0aGUgc291cmNlIHZlY3RvclxuICogQHJldHVybnMge3ZlYzJ9IG91dFxuICovXG52ZWMyLmNvcHkgPSBmdW5jdGlvbihvdXQsIGEpIHtcbiAgICBvdXRbMF0gPSBhWzBdO1xuICAgIG91dFsxXSA9IGFbMV07XG4gICAgcmV0dXJuIG91dDtcbn07XG5cbi8qKlxuICogU2V0IHRoZSBjb21wb25lbnRzIG9mIGEgdmVjMiB0byB0aGUgZ2l2ZW4gdmFsdWVzXG4gKlxuICogQHBhcmFtIHt2ZWMyfSBvdXQgdGhlIHJlY2VpdmluZyB2ZWN0b3JcbiAqIEBwYXJhbSB7TnVtYmVyfSB4IFggY29tcG9uZW50XG4gKiBAcGFyYW0ge051bWJlcn0geSBZIGNvbXBvbmVudFxuICogQHJldHVybnMge3ZlYzJ9IG91dFxuICovXG52ZWMyLnNldCA9IGZ1bmN0aW9uKG91dCwgeCwgeSkge1xuICAgIG91dFswXSA9IHg7XG4gICAgb3V0WzFdID0geTtcbiAgICByZXR1cm4gb3V0O1xufTtcblxuLyoqXG4gKiBBZGRzIHR3byB2ZWMyJ3NcbiAqXG4gKiBAcGFyYW0ge3ZlYzJ9IG91dCB0aGUgcmVjZWl2aW5nIHZlY3RvclxuICogQHBhcmFtIHt2ZWMyfSBhIHRoZSBmaXJzdCBvcGVyYW5kXG4gKiBAcGFyYW0ge3ZlYzJ9IGIgdGhlIHNlY29uZCBvcGVyYW5kXG4gKiBAcmV0dXJucyB7dmVjMn0gb3V0XG4gKi9cbnZlYzIuYWRkID0gZnVuY3Rpb24ob3V0LCBhLCBiKSB7XG4gICAgb3V0WzBdID0gYVswXSArIGJbMF07XG4gICAgb3V0WzFdID0gYVsxXSArIGJbMV07XG4gICAgcmV0dXJuIG91dDtcbn07XG5cbi8qKlxuICogU3VidHJhY3RzIHZlY3RvciBiIGZyb20gdmVjdG9yIGFcbiAqXG4gKiBAcGFyYW0ge3ZlYzJ9IG91dCB0aGUgcmVjZWl2aW5nIHZlY3RvclxuICogQHBhcmFtIHt2ZWMyfSBhIHRoZSBmaXJzdCBvcGVyYW5kXG4gKiBAcGFyYW0ge3ZlYzJ9IGIgdGhlIHNlY29uZCBvcGVyYW5kXG4gKiBAcmV0dXJucyB7dmVjMn0gb3V0XG4gKi9cbnZlYzIuc3VidHJhY3QgPSBmdW5jdGlvbihvdXQsIGEsIGIpIHtcbiAgICBvdXRbMF0gPSBhWzBdIC0gYlswXTtcbiAgICBvdXRbMV0gPSBhWzFdIC0gYlsxXTtcbiAgICByZXR1cm4gb3V0O1xufTtcblxuLyoqXG4gKiBBbGlhcyBmb3Ige0BsaW5rIHZlYzIuc3VidHJhY3R9XG4gKiBAZnVuY3Rpb25cbiAqL1xudmVjMi5zdWIgPSB2ZWMyLnN1YnRyYWN0O1xuXG4vKipcbiAqIE11bHRpcGxpZXMgdHdvIHZlYzInc1xuICpcbiAqIEBwYXJhbSB7dmVjMn0gb3V0IHRoZSByZWNlaXZpbmcgdmVjdG9yXG4gKiBAcGFyYW0ge3ZlYzJ9IGEgdGhlIGZpcnN0IG9wZXJhbmRcbiAqIEBwYXJhbSB7dmVjMn0gYiB0aGUgc2Vjb25kIG9wZXJhbmRcbiAqIEByZXR1cm5zIHt2ZWMyfSBvdXRcbiAqL1xudmVjMi5tdWx0aXBseSA9IGZ1bmN0aW9uKG91dCwgYSwgYikge1xuICAgIG91dFswXSA9IGFbMF0gKiBiWzBdO1xuICAgIG91dFsxXSA9IGFbMV0gKiBiWzFdO1xuICAgIHJldHVybiBvdXQ7XG59O1xuXG4vKipcbiAqIEFsaWFzIGZvciB7QGxpbmsgdmVjMi5tdWx0aXBseX1cbiAqIEBmdW5jdGlvblxuICovXG52ZWMyLm11bCA9IHZlYzIubXVsdGlwbHk7XG5cbi8qKlxuICogRGl2aWRlcyB0d28gdmVjMidzXG4gKlxuICogQHBhcmFtIHt2ZWMyfSBvdXQgdGhlIHJlY2VpdmluZyB2ZWN0b3JcbiAqIEBwYXJhbSB7dmVjMn0gYSB0aGUgZmlyc3Qgb3BlcmFuZFxuICogQHBhcmFtIHt2ZWMyfSBiIHRoZSBzZWNvbmQgb3BlcmFuZFxuICogQHJldHVybnMge3ZlYzJ9IG91dFxuICovXG52ZWMyLmRpdmlkZSA9IGZ1bmN0aW9uKG91dCwgYSwgYikge1xuICAgIG91dFswXSA9IGFbMF0gLyBiWzBdO1xuICAgIG91dFsxXSA9IGFbMV0gLyBiWzFdO1xuICAgIHJldHVybiBvdXQ7XG59O1xuXG4vKipcbiAqIEFsaWFzIGZvciB7QGxpbmsgdmVjMi5kaXZpZGV9XG4gKiBAZnVuY3Rpb25cbiAqL1xudmVjMi5kaXYgPSB2ZWMyLmRpdmlkZTtcblxuLyoqXG4gKiBSZXR1cm5zIHRoZSBtaW5pbXVtIG9mIHR3byB2ZWMyJ3NcbiAqXG4gKiBAcGFyYW0ge3ZlYzJ9IG91dCB0aGUgcmVjZWl2aW5nIHZlY3RvclxuICogQHBhcmFtIHt2ZWMyfSBhIHRoZSBmaXJzdCBvcGVyYW5kXG4gKiBAcGFyYW0ge3ZlYzJ9IGIgdGhlIHNlY29uZCBvcGVyYW5kXG4gKiBAcmV0dXJucyB7dmVjMn0gb3V0XG4gKi9cbnZlYzIubWluID0gZnVuY3Rpb24ob3V0LCBhLCBiKSB7XG4gICAgb3V0WzBdID0gTWF0aC5taW4oYVswXSwgYlswXSk7XG4gICAgb3V0WzFdID0gTWF0aC5taW4oYVsxXSwgYlsxXSk7XG4gICAgcmV0dXJuIG91dDtcbn07XG5cbi8qKlxuICogUmV0dXJucyB0aGUgbWF4aW11bSBvZiB0d28gdmVjMidzXG4gKlxuICogQHBhcmFtIHt2ZWMyfSBvdXQgdGhlIHJlY2VpdmluZyB2ZWN0b3JcbiAqIEBwYXJhbSB7dmVjMn0gYSB0aGUgZmlyc3Qgb3BlcmFuZFxuICogQHBhcmFtIHt2ZWMyfSBiIHRoZSBzZWNvbmQgb3BlcmFuZFxuICogQHJldHVybnMge3ZlYzJ9IG91dFxuICovXG52ZWMyLm1heCA9IGZ1bmN0aW9uKG91dCwgYSwgYikge1xuICAgIG91dFswXSA9IE1hdGgubWF4KGFbMF0sIGJbMF0pO1xuICAgIG91dFsxXSA9IE1hdGgubWF4KGFbMV0sIGJbMV0pO1xuICAgIHJldHVybiBvdXQ7XG59O1xuXG4vKipcbiAqIFNjYWxlcyBhIHZlYzIgYnkgYSBzY2FsYXIgbnVtYmVyXG4gKlxuICogQHBhcmFtIHt2ZWMyfSBvdXQgdGhlIHJlY2VpdmluZyB2ZWN0b3JcbiAqIEBwYXJhbSB7dmVjMn0gYSB0aGUgdmVjdG9yIHRvIHNjYWxlXG4gKiBAcGFyYW0ge051bWJlcn0gYiBhbW91bnQgdG8gc2NhbGUgdGhlIHZlY3RvciBieVxuICogQHJldHVybnMge3ZlYzJ9IG91dFxuICovXG52ZWMyLnNjYWxlID0gZnVuY3Rpb24ob3V0LCBhLCBiKSB7XG4gICAgb3V0WzBdID0gYVswXSAqIGI7XG4gICAgb3V0WzFdID0gYVsxXSAqIGI7XG4gICAgcmV0dXJuIG91dDtcbn07XG5cbi8qKlxuICogQWRkcyB0d28gdmVjMidzIGFmdGVyIHNjYWxpbmcgdGhlIHNlY29uZCBvcGVyYW5kIGJ5IGEgc2NhbGFyIHZhbHVlXG4gKlxuICogQHBhcmFtIHt2ZWMyfSBvdXQgdGhlIHJlY2VpdmluZyB2ZWN0b3JcbiAqIEBwYXJhbSB7dmVjMn0gYSB0aGUgZmlyc3Qgb3BlcmFuZFxuICogQHBhcmFtIHt2ZWMyfSBiIHRoZSBzZWNvbmQgb3BlcmFuZFxuICogQHBhcmFtIHtOdW1iZXJ9IHNjYWxlIHRoZSBhbW91bnQgdG8gc2NhbGUgYiBieSBiZWZvcmUgYWRkaW5nXG4gKiBAcmV0dXJucyB7dmVjMn0gb3V0XG4gKi9cbnZlYzIuc2NhbGVBbmRBZGQgPSBmdW5jdGlvbihvdXQsIGEsIGIsIHNjYWxlKSB7XG4gICAgb3V0WzBdID0gYVswXSArIChiWzBdICogc2NhbGUpO1xuICAgIG91dFsxXSA9IGFbMV0gKyAoYlsxXSAqIHNjYWxlKTtcbiAgICByZXR1cm4gb3V0O1xufTtcblxuLyoqXG4gKiBDYWxjdWxhdGVzIHRoZSBldWNsaWRpYW4gZGlzdGFuY2UgYmV0d2VlbiB0d28gdmVjMidzXG4gKlxuICogQHBhcmFtIHt2ZWMyfSBhIHRoZSBmaXJzdCBvcGVyYW5kXG4gKiBAcGFyYW0ge3ZlYzJ9IGIgdGhlIHNlY29uZCBvcGVyYW5kXG4gKiBAcmV0dXJucyB7TnVtYmVyfSBkaXN0YW5jZSBiZXR3ZWVuIGEgYW5kIGJcbiAqL1xudmVjMi5kaXN0YW5jZSA9IGZ1bmN0aW9uKGEsIGIpIHtcbiAgICB2YXIgeCA9IGJbMF0gLSBhWzBdLFxuICAgICAgICB5ID0gYlsxXSAtIGFbMV07XG4gICAgcmV0dXJuIE1hdGguc3FydCh4KnggKyB5KnkpO1xufTtcblxuLyoqXG4gKiBBbGlhcyBmb3Ige0BsaW5rIHZlYzIuZGlzdGFuY2V9XG4gKiBAZnVuY3Rpb25cbiAqL1xudmVjMi5kaXN0ID0gdmVjMi5kaXN0YW5jZTtcblxuLyoqXG4gKiBDYWxjdWxhdGVzIHRoZSBzcXVhcmVkIGV1Y2xpZGlhbiBkaXN0YW5jZSBiZXR3ZWVuIHR3byB2ZWMyJ3NcbiAqXG4gKiBAcGFyYW0ge3ZlYzJ9IGEgdGhlIGZpcnN0IG9wZXJhbmRcbiAqIEBwYXJhbSB7dmVjMn0gYiB0aGUgc2Vjb25kIG9wZXJhbmRcbiAqIEByZXR1cm5zIHtOdW1iZXJ9IHNxdWFyZWQgZGlzdGFuY2UgYmV0d2VlbiBhIGFuZCBiXG4gKi9cbnZlYzIuc3F1YXJlZERpc3RhbmNlID0gZnVuY3Rpb24oYSwgYikge1xuICAgIHZhciB4ID0gYlswXSAtIGFbMF0sXG4gICAgICAgIHkgPSBiWzFdIC0gYVsxXTtcbiAgICByZXR1cm4geCp4ICsgeSp5O1xufTtcblxuLyoqXG4gKiBBbGlhcyBmb3Ige0BsaW5rIHZlYzIuc3F1YXJlZERpc3RhbmNlfVxuICogQGZ1bmN0aW9uXG4gKi9cbnZlYzIuc3FyRGlzdCA9IHZlYzIuc3F1YXJlZERpc3RhbmNlO1xuXG4vKipcbiAqIENhbGN1bGF0ZXMgdGhlIGxlbmd0aCBvZiBhIHZlYzJcbiAqXG4gKiBAcGFyYW0ge3ZlYzJ9IGEgdmVjdG9yIHRvIGNhbGN1bGF0ZSBsZW5ndGggb2ZcbiAqIEByZXR1cm5zIHtOdW1iZXJ9IGxlbmd0aCBvZiBhXG4gKi9cbnZlYzIubGVuZ3RoID0gZnVuY3Rpb24gKGEpIHtcbiAgICB2YXIgeCA9IGFbMF0sXG4gICAgICAgIHkgPSBhWzFdO1xuICAgIHJldHVybiBNYXRoLnNxcnQoeCp4ICsgeSp5KTtcbn07XG5cbi8qKlxuICogQWxpYXMgZm9yIHtAbGluayB2ZWMyLmxlbmd0aH1cbiAqIEBmdW5jdGlvblxuICovXG52ZWMyLmxlbiA9IHZlYzIubGVuZ3RoO1xuXG4vKipcbiAqIENhbGN1bGF0ZXMgdGhlIHNxdWFyZWQgbGVuZ3RoIG9mIGEgdmVjMlxuICpcbiAqIEBwYXJhbSB7dmVjMn0gYSB2ZWN0b3IgdG8gY2FsY3VsYXRlIHNxdWFyZWQgbGVuZ3RoIG9mXG4gKiBAcmV0dXJucyB7TnVtYmVyfSBzcXVhcmVkIGxlbmd0aCBvZiBhXG4gKi9cbnZlYzIuc3F1YXJlZExlbmd0aCA9IGZ1bmN0aW9uIChhKSB7XG4gICAgdmFyIHggPSBhWzBdLFxuICAgICAgICB5ID0gYVsxXTtcbiAgICByZXR1cm4geCp4ICsgeSp5O1xufTtcblxuLyoqXG4gKiBBbGlhcyBmb3Ige0BsaW5rIHZlYzIuc3F1YXJlZExlbmd0aH1cbiAqIEBmdW5jdGlvblxuICovXG52ZWMyLnNxckxlbiA9IHZlYzIuc3F1YXJlZExlbmd0aDtcblxuLyoqXG4gKiBOZWdhdGVzIHRoZSBjb21wb25lbnRzIG9mIGEgdmVjMlxuICpcbiAqIEBwYXJhbSB7dmVjMn0gb3V0IHRoZSByZWNlaXZpbmcgdmVjdG9yXG4gKiBAcGFyYW0ge3ZlYzJ9IGEgdmVjdG9yIHRvIG5lZ2F0ZVxuICogQHJldHVybnMge3ZlYzJ9IG91dFxuICovXG52ZWMyLm5lZ2F0ZSA9IGZ1bmN0aW9uKG91dCwgYSkge1xuICAgIG91dFswXSA9IC1hWzBdO1xuICAgIG91dFsxXSA9IC1hWzFdO1xuICAgIHJldHVybiBvdXQ7XG59O1xuXG4vKipcbiAqIE5vcm1hbGl6ZSBhIHZlYzJcbiAqXG4gKiBAcGFyYW0ge3ZlYzJ9IG91dCB0aGUgcmVjZWl2aW5nIHZlY3RvclxuICogQHBhcmFtIHt2ZWMyfSBhIHZlY3RvciB0byBub3JtYWxpemVcbiAqIEByZXR1cm5zIHt2ZWMyfSBvdXRcbiAqL1xudmVjMi5ub3JtYWxpemUgPSBmdW5jdGlvbihvdXQsIGEpIHtcbiAgICB2YXIgeCA9IGFbMF0sXG4gICAgICAgIHkgPSBhWzFdO1xuICAgIHZhciBsZW4gPSB4KnggKyB5Knk7XG4gICAgaWYgKGxlbiA+IDApIHtcbiAgICAgICAgLy9UT0RPOiBldmFsdWF0ZSB1c2Ugb2YgZ2xtX2ludnNxcnQgaGVyZT9cbiAgICAgICAgbGVuID0gMSAvIE1hdGguc3FydChsZW4pO1xuICAgICAgICBvdXRbMF0gPSBhWzBdICogbGVuO1xuICAgICAgICBvdXRbMV0gPSBhWzFdICogbGVuO1xuICAgIH1cbiAgICByZXR1cm4gb3V0O1xufTtcblxuLyoqXG4gKiBDYWxjdWxhdGVzIHRoZSBkb3QgcHJvZHVjdCBvZiB0d28gdmVjMidzXG4gKlxuICogQHBhcmFtIHt2ZWMyfSBhIHRoZSBmaXJzdCBvcGVyYW5kXG4gKiBAcGFyYW0ge3ZlYzJ9IGIgdGhlIHNlY29uZCBvcGVyYW5kXG4gKiBAcmV0dXJucyB7TnVtYmVyfSBkb3QgcHJvZHVjdCBvZiBhIGFuZCBiXG4gKi9cbnZlYzIuZG90ID0gZnVuY3Rpb24gKGEsIGIpIHtcbiAgICByZXR1cm4gYVswXSAqIGJbMF0gKyBhWzFdICogYlsxXTtcbn07XG5cbi8qKlxuICogQ29tcHV0ZXMgdGhlIGNyb3NzIHByb2R1Y3Qgb2YgdHdvIHZlYzInc1xuICogTm90ZSB0aGF0IHRoZSBjcm9zcyBwcm9kdWN0IG11c3QgYnkgZGVmaW5pdGlvbiBwcm9kdWNlIGEgM0QgdmVjdG9yXG4gKlxuICogQHBhcmFtIHt2ZWMzfSBvdXQgdGhlIHJlY2VpdmluZyB2ZWN0b3JcbiAqIEBwYXJhbSB7dmVjMn0gYSB0aGUgZmlyc3Qgb3BlcmFuZFxuICogQHBhcmFtIHt2ZWMyfSBiIHRoZSBzZWNvbmQgb3BlcmFuZFxuICogQHJldHVybnMge3ZlYzN9IG91dFxuICovXG52ZWMyLmNyb3NzID0gZnVuY3Rpb24ob3V0LCBhLCBiKSB7XG4gICAgdmFyIHogPSBhWzBdICogYlsxXSAtIGFbMV0gKiBiWzBdO1xuICAgIG91dFswXSA9IG91dFsxXSA9IDA7XG4gICAgb3V0WzJdID0gejtcbiAgICByZXR1cm4gb3V0O1xufTtcblxuLyoqXG4gKiBQZXJmb3JtcyBhIGxpbmVhciBpbnRlcnBvbGF0aW9uIGJldHdlZW4gdHdvIHZlYzInc1xuICpcbiAqIEBwYXJhbSB7dmVjMn0gb3V0IHRoZSByZWNlaXZpbmcgdmVjdG9yXG4gKiBAcGFyYW0ge3ZlYzJ9IGEgdGhlIGZpcnN0IG9wZXJhbmRcbiAqIEBwYXJhbSB7dmVjMn0gYiB0aGUgc2Vjb25kIG9wZXJhbmRcbiAqIEBwYXJhbSB7TnVtYmVyfSB0IGludGVycG9sYXRpb24gYW1vdW50IGJldHdlZW4gdGhlIHR3byBpbnB1dHNcbiAqIEByZXR1cm5zIHt2ZWMyfSBvdXRcbiAqL1xudmVjMi5sZXJwID0gZnVuY3Rpb24gKG91dCwgYSwgYiwgdCkge1xuICAgIHZhciBheCA9IGFbMF0sXG4gICAgICAgIGF5ID0gYVsxXTtcbiAgICBvdXRbMF0gPSBheCArIHQgKiAoYlswXSAtIGF4KTtcbiAgICBvdXRbMV0gPSBheSArIHQgKiAoYlsxXSAtIGF5KTtcbiAgICByZXR1cm4gb3V0O1xufTtcblxuLyoqXG4gKiBHZW5lcmF0ZXMgYSByYW5kb20gdmVjdG9yIHdpdGggdGhlIGdpdmVuIHNjYWxlXG4gKlxuICogQHBhcmFtIHt2ZWMyfSBvdXQgdGhlIHJlY2VpdmluZyB2ZWN0b3JcbiAqIEBwYXJhbSB7TnVtYmVyfSBbc2NhbGVdIExlbmd0aCBvZiB0aGUgcmVzdWx0aW5nIHZlY3Rvci4gSWYgb21taXR0ZWQsIGEgdW5pdCB2ZWN0b3Igd2lsbCBiZSByZXR1cm5lZFxuICogQHJldHVybnMge3ZlYzJ9IG91dFxuICovXG52ZWMyLnJhbmRvbSA9IGZ1bmN0aW9uIChvdXQsIHNjYWxlKSB7XG4gICAgc2NhbGUgPSBzY2FsZSB8fCAxLjA7XG4gICAgdmFyIHIgPSBHTE1BVF9SQU5ET00oKSAqIDIuMCAqIE1hdGguUEk7XG4gICAgb3V0WzBdID0gTWF0aC5jb3MocikgKiBzY2FsZTtcbiAgICBvdXRbMV0gPSBNYXRoLnNpbihyKSAqIHNjYWxlO1xuICAgIHJldHVybiBvdXQ7XG59O1xuXG4vKipcbiAqIFRyYW5zZm9ybXMgdGhlIHZlYzIgd2l0aCBhIG1hdDJcbiAqXG4gKiBAcGFyYW0ge3ZlYzJ9IG91dCB0aGUgcmVjZWl2aW5nIHZlY3RvclxuICogQHBhcmFtIHt2ZWMyfSBhIHRoZSB2ZWN0b3IgdG8gdHJhbnNmb3JtXG4gKiBAcGFyYW0ge21hdDJ9IG0gbWF0cml4IHRvIHRyYW5zZm9ybSB3aXRoXG4gKiBAcmV0dXJucyB7dmVjMn0gb3V0XG4gKi9cbnZlYzIudHJhbnNmb3JtTWF0MiA9IGZ1bmN0aW9uKG91dCwgYSwgbSkge1xuICAgIHZhciB4ID0gYVswXSxcbiAgICAgICAgeSA9IGFbMV07XG4gICAgb3V0WzBdID0gbVswXSAqIHggKyBtWzJdICogeTtcbiAgICBvdXRbMV0gPSBtWzFdICogeCArIG1bM10gKiB5O1xuICAgIHJldHVybiBvdXQ7XG59O1xuXG4vKipcbiAqIFRyYW5zZm9ybXMgdGhlIHZlYzIgd2l0aCBhIG1hdDJkXG4gKlxuICogQHBhcmFtIHt2ZWMyfSBvdXQgdGhlIHJlY2VpdmluZyB2ZWN0b3JcbiAqIEBwYXJhbSB7dmVjMn0gYSB0aGUgdmVjdG9yIHRvIHRyYW5zZm9ybVxuICogQHBhcmFtIHttYXQyZH0gbSBtYXRyaXggdG8gdHJhbnNmb3JtIHdpdGhcbiAqIEByZXR1cm5zIHt2ZWMyfSBvdXRcbiAqL1xudmVjMi50cmFuc2Zvcm1NYXQyZCA9IGZ1bmN0aW9uKG91dCwgYSwgbSkge1xuICAgIHZhciB4ID0gYVswXSxcbiAgICAgICAgeSA9IGFbMV07XG4gICAgb3V0WzBdID0gbVswXSAqIHggKyBtWzJdICogeSArIG1bNF07XG4gICAgb3V0WzFdID0gbVsxXSAqIHggKyBtWzNdICogeSArIG1bNV07XG4gICAgcmV0dXJuIG91dDtcbn07XG5cbi8qKlxuICogVHJhbnNmb3JtcyB0aGUgdmVjMiB3aXRoIGEgbWF0M1xuICogM3JkIHZlY3RvciBjb21wb25lbnQgaXMgaW1wbGljaXRseSAnMSdcbiAqXG4gKiBAcGFyYW0ge3ZlYzJ9IG91dCB0aGUgcmVjZWl2aW5nIHZlY3RvclxuICogQHBhcmFtIHt2ZWMyfSBhIHRoZSB2ZWN0b3IgdG8gdHJhbnNmb3JtXG4gKiBAcGFyYW0ge21hdDN9IG0gbWF0cml4IHRvIHRyYW5zZm9ybSB3aXRoXG4gKiBAcmV0dXJucyB7dmVjMn0gb3V0XG4gKi9cbnZlYzIudHJhbnNmb3JtTWF0MyA9IGZ1bmN0aW9uKG91dCwgYSwgbSkge1xuICAgIHZhciB4ID0gYVswXSxcbiAgICAgICAgeSA9IGFbMV07XG4gICAgb3V0WzBdID0gbVswXSAqIHggKyBtWzNdICogeSArIG1bNl07XG4gICAgb3V0WzFdID0gbVsxXSAqIHggKyBtWzRdICogeSArIG1bN107XG4gICAgcmV0dXJuIG91dDtcbn07XG5cbi8qKlxuICogVHJhbnNmb3JtcyB0aGUgdmVjMiB3aXRoIGEgbWF0NFxuICogM3JkIHZlY3RvciBjb21wb25lbnQgaXMgaW1wbGljaXRseSAnMCdcbiAqIDR0aCB2ZWN0b3IgY29tcG9uZW50IGlzIGltcGxpY2l0bHkgJzEnXG4gKlxuICogQHBhcmFtIHt2ZWMyfSBvdXQgdGhlIHJlY2VpdmluZyB2ZWN0b3JcbiAqIEBwYXJhbSB7dmVjMn0gYSB0aGUgdmVjdG9yIHRvIHRyYW5zZm9ybVxuICogQHBhcmFtIHttYXQ0fSBtIG1hdHJpeCB0byB0cmFuc2Zvcm0gd2l0aFxuICogQHJldHVybnMge3ZlYzJ9IG91dFxuICovXG52ZWMyLnRyYW5zZm9ybU1hdDQgPSBmdW5jdGlvbihvdXQsIGEsIG0pIHtcbiAgICB2YXIgeCA9IGFbMF0sIFxuICAgICAgICB5ID0gYVsxXTtcbiAgICBvdXRbMF0gPSBtWzBdICogeCArIG1bNF0gKiB5ICsgbVsxMl07XG4gICAgb3V0WzFdID0gbVsxXSAqIHggKyBtWzVdICogeSArIG1bMTNdO1xuICAgIHJldHVybiBvdXQ7XG59O1xuXG4vKipcbiAqIFBlcmZvcm0gc29tZSBvcGVyYXRpb24gb3ZlciBhbiBhcnJheSBvZiB2ZWMycy5cbiAqXG4gKiBAcGFyYW0ge0FycmF5fSBhIHRoZSBhcnJheSBvZiB2ZWN0b3JzIHRvIGl0ZXJhdGUgb3ZlclxuICogQHBhcmFtIHtOdW1iZXJ9IHN0cmlkZSBOdW1iZXIgb2YgZWxlbWVudHMgYmV0d2VlbiB0aGUgc3RhcnQgb2YgZWFjaCB2ZWMyLiBJZiAwIGFzc3VtZXMgdGlnaHRseSBwYWNrZWRcbiAqIEBwYXJhbSB7TnVtYmVyfSBvZmZzZXQgTnVtYmVyIG9mIGVsZW1lbnRzIHRvIHNraXAgYXQgdGhlIGJlZ2lubmluZyBvZiB0aGUgYXJyYXlcbiAqIEBwYXJhbSB7TnVtYmVyfSBjb3VudCBOdW1iZXIgb2YgdmVjMnMgdG8gaXRlcmF0ZSBvdmVyLiBJZiAwIGl0ZXJhdGVzIG92ZXIgZW50aXJlIGFycmF5XG4gKiBAcGFyYW0ge0Z1bmN0aW9ufSBmbiBGdW5jdGlvbiB0byBjYWxsIGZvciBlYWNoIHZlY3RvciBpbiB0aGUgYXJyYXlcbiAqIEBwYXJhbSB7T2JqZWN0fSBbYXJnXSBhZGRpdGlvbmFsIGFyZ3VtZW50IHRvIHBhc3MgdG8gZm5cbiAqIEByZXR1cm5zIHtBcnJheX0gYVxuICogQGZ1bmN0aW9uXG4gKi9cbnZlYzIuZm9yRWFjaCA9IChmdW5jdGlvbigpIHtcbiAgICB2YXIgdmVjID0gdmVjMi5jcmVhdGUoKTtcblxuICAgIHJldHVybiBmdW5jdGlvbihhLCBzdHJpZGUsIG9mZnNldCwgY291bnQsIGZuLCBhcmcpIHtcbiAgICAgICAgdmFyIGksIGw7XG4gICAgICAgIGlmKCFzdHJpZGUpIHtcbiAgICAgICAgICAgIHN0cmlkZSA9IDI7XG4gICAgICAgIH1cblxuICAgICAgICBpZighb2Zmc2V0KSB7XG4gICAgICAgICAgICBvZmZzZXQgPSAwO1xuICAgICAgICB9XG4gICAgICAgIFxuICAgICAgICBpZihjb3VudCkge1xuICAgICAgICAgICAgbCA9IE1hdGgubWluKChjb3VudCAqIHN0cmlkZSkgKyBvZmZzZXQsIGEubGVuZ3RoKTtcbiAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgIGwgPSBhLmxlbmd0aDtcbiAgICAgICAgfVxuXG4gICAgICAgIGZvcihpID0gb2Zmc2V0OyBpIDwgbDsgaSArPSBzdHJpZGUpIHtcbiAgICAgICAgICAgIHZlY1swXSA9IGFbaV07IHZlY1sxXSA9IGFbaSsxXTtcbiAgICAgICAgICAgIGZuKHZlYywgdmVjLCBhcmcpO1xuICAgICAgICAgICAgYVtpXSA9IHZlY1swXTsgYVtpKzFdID0gdmVjWzFdO1xuICAgICAgICB9XG4gICAgICAgIFxuICAgICAgICByZXR1cm4gYTtcbiAgICB9O1xufSkoKTtcblxuLyoqXG4gKiBSZXR1cm5zIGEgc3RyaW5nIHJlcHJlc2VudGF0aW9uIG9mIGEgdmVjdG9yXG4gKlxuICogQHBhcmFtIHt2ZWMyfSB2ZWMgdmVjdG9yIHRvIHJlcHJlc2VudCBhcyBhIHN0cmluZ1xuICogQHJldHVybnMge1N0cmluZ30gc3RyaW5nIHJlcHJlc2VudGF0aW9uIG9mIHRoZSB2ZWN0b3JcbiAqL1xudmVjMi5zdHIgPSBmdW5jdGlvbiAoYSkge1xuICAgIHJldHVybiAndmVjMignICsgYVswXSArICcsICcgKyBhWzFdICsgJyknO1xufTtcblxuaWYodHlwZW9mKGV4cG9ydHMpICE9PSAndW5kZWZpbmVkJykge1xuICAgIGV4cG9ydHMudmVjMiA9IHZlYzI7XG59XG47XG4vKiBDb3B5cmlnaHQgKGMpIDIwMTMsIEJyYW5kb24gSm9uZXMsIENvbGluIE1hY0tlbnppZSBJVi4gQWxsIHJpZ2h0cyByZXNlcnZlZC5cblxuUmVkaXN0cmlidXRpb24gYW5kIHVzZSBpbiBzb3VyY2UgYW5kIGJpbmFyeSBmb3Jtcywgd2l0aCBvciB3aXRob3V0IG1vZGlmaWNhdGlvbixcbmFyZSBwZXJtaXR0ZWQgcHJvdmlkZWQgdGhhdCB0aGUgZm9sbG93aW5nIGNvbmRpdGlvbnMgYXJlIG1ldDpcblxuICAqIFJlZGlzdHJpYnV0aW9ucyBvZiBzb3VyY2UgY29kZSBtdXN0IHJldGFpbiB0aGUgYWJvdmUgY29weXJpZ2h0IG5vdGljZSwgdGhpc1xuICAgIGxpc3Qgb2YgY29uZGl0aW9ucyBhbmQgdGhlIGZvbGxvd2luZyBkaXNjbGFpbWVyLlxuICAqIFJlZGlzdHJpYnV0aW9ucyBpbiBiaW5hcnkgZm9ybSBtdXN0IHJlcHJvZHVjZSB0aGUgYWJvdmUgY29weXJpZ2h0IG5vdGljZSxcbiAgICB0aGlzIGxpc3Qgb2YgY29uZGl0aW9ucyBhbmQgdGhlIGZvbGxvd2luZyBkaXNjbGFpbWVyIGluIHRoZSBkb2N1bWVudGF0aW9uIFxuICAgIGFuZC9vciBvdGhlciBtYXRlcmlhbHMgcHJvdmlkZWQgd2l0aCB0aGUgZGlzdHJpYnV0aW9uLlxuXG5USElTIFNPRlRXQVJFIElTIFBST1ZJREVEIEJZIFRIRSBDT1BZUklHSFQgSE9MREVSUyBBTkQgQ09OVFJJQlVUT1JTIFwiQVMgSVNcIiBBTkRcbkFOWSBFWFBSRVNTIE9SIElNUExJRUQgV0FSUkFOVElFUywgSU5DTFVESU5HLCBCVVQgTk9UIExJTUlURUQgVE8sIFRIRSBJTVBMSUVEXG5XQVJSQU5USUVTIE9GIE1FUkNIQU5UQUJJTElUWSBBTkQgRklUTkVTUyBGT1IgQSBQQVJUSUNVTEFSIFBVUlBPU0UgQVJFIFxuRElTQ0xBSU1FRC4gSU4gTk8gRVZFTlQgU0hBTEwgVEhFIENPUFlSSUdIVCBIT0xERVIgT1IgQ09OVFJJQlVUT1JTIEJFIExJQUJMRSBGT1JcbkFOWSBESVJFQ1QsIElORElSRUNULCBJTkNJREVOVEFMLCBTUEVDSUFMLCBFWEVNUExBUlksIE9SIENPTlNFUVVFTlRJQUwgREFNQUdFU1xuKElOQ0xVRElORywgQlVUIE5PVCBMSU1JVEVEIFRPLCBQUk9DVVJFTUVOVCBPRiBTVUJTVElUVVRFIEdPT0RTIE9SIFNFUlZJQ0VTO1xuTE9TUyBPRiBVU0UsIERBVEEsIE9SIFBST0ZJVFM7IE9SIEJVU0lORVNTIElOVEVSUlVQVElPTikgSE9XRVZFUiBDQVVTRUQgQU5EIE9OXG5BTlkgVEhFT1JZIE9GIExJQUJJTElUWSwgV0hFVEhFUiBJTiBDT05UUkFDVCwgU1RSSUNUIExJQUJJTElUWSwgT1IgVE9SVFxuKElOQ0xVRElORyBORUdMSUdFTkNFIE9SIE9USEVSV0lTRSkgQVJJU0lORyBJTiBBTlkgV0FZIE9VVCBPRiBUSEUgVVNFIE9GIFRISVNcblNPRlRXQVJFLCBFVkVOIElGIEFEVklTRUQgT0YgVEhFIFBPU1NJQklMSVRZIE9GIFNVQ0ggREFNQUdFLiAqL1xuXG4vKipcbiAqIEBjbGFzcyAzIERpbWVuc2lvbmFsIFZlY3RvclxuICogQG5hbWUgdmVjM1xuICovXG5cbnZhciB2ZWMzID0ge307XG5cbi8qKlxuICogQ3JlYXRlcyBhIG5ldywgZW1wdHkgdmVjM1xuICpcbiAqIEByZXR1cm5zIHt2ZWMzfSBhIG5ldyAzRCB2ZWN0b3JcbiAqL1xudmVjMy5jcmVhdGUgPSBmdW5jdGlvbigpIHtcbiAgICB2YXIgb3V0ID0gbmV3IEdMTUFUX0FSUkFZX1RZUEUoMyk7XG4gICAgb3V0WzBdID0gMDtcbiAgICBvdXRbMV0gPSAwO1xuICAgIG91dFsyXSA9IDA7XG4gICAgcmV0dXJuIG91dDtcbn07XG5cbi8qKlxuICogQ3JlYXRlcyBhIG5ldyB2ZWMzIGluaXRpYWxpemVkIHdpdGggdmFsdWVzIGZyb20gYW4gZXhpc3RpbmcgdmVjdG9yXG4gKlxuICogQHBhcmFtIHt2ZWMzfSBhIHZlY3RvciB0byBjbG9uZVxuICogQHJldHVybnMge3ZlYzN9IGEgbmV3IDNEIHZlY3RvclxuICovXG52ZWMzLmNsb25lID0gZnVuY3Rpb24oYSkge1xuICAgIHZhciBvdXQgPSBuZXcgR0xNQVRfQVJSQVlfVFlQRSgzKTtcbiAgICBvdXRbMF0gPSBhWzBdO1xuICAgIG91dFsxXSA9IGFbMV07XG4gICAgb3V0WzJdID0gYVsyXTtcbiAgICByZXR1cm4gb3V0O1xufTtcblxuLyoqXG4gKiBDcmVhdGVzIGEgbmV3IHZlYzMgaW5pdGlhbGl6ZWQgd2l0aCB0aGUgZ2l2ZW4gdmFsdWVzXG4gKlxuICogQHBhcmFtIHtOdW1iZXJ9IHggWCBjb21wb25lbnRcbiAqIEBwYXJhbSB7TnVtYmVyfSB5IFkgY29tcG9uZW50XG4gKiBAcGFyYW0ge051bWJlcn0geiBaIGNvbXBvbmVudFxuICogQHJldHVybnMge3ZlYzN9IGEgbmV3IDNEIHZlY3RvclxuICovXG52ZWMzLmZyb21WYWx1ZXMgPSBmdW5jdGlvbih4LCB5LCB6KSB7XG4gICAgdmFyIG91dCA9IG5ldyBHTE1BVF9BUlJBWV9UWVBFKDMpO1xuICAgIG91dFswXSA9IHg7XG4gICAgb3V0WzFdID0geTtcbiAgICBvdXRbMl0gPSB6O1xuICAgIHJldHVybiBvdXQ7XG59O1xuXG4vKipcbiAqIENvcHkgdGhlIHZhbHVlcyBmcm9tIG9uZSB2ZWMzIHRvIGFub3RoZXJcbiAqXG4gKiBAcGFyYW0ge3ZlYzN9IG91dCB0aGUgcmVjZWl2aW5nIHZlY3RvclxuICogQHBhcmFtIHt2ZWMzfSBhIHRoZSBzb3VyY2UgdmVjdG9yXG4gKiBAcmV0dXJucyB7dmVjM30gb3V0XG4gKi9cbnZlYzMuY29weSA9IGZ1bmN0aW9uKG91dCwgYSkge1xuICAgIG91dFswXSA9IGFbMF07XG4gICAgb3V0WzFdID0gYVsxXTtcbiAgICBvdXRbMl0gPSBhWzJdO1xuICAgIHJldHVybiBvdXQ7XG59O1xuXG4vKipcbiAqIFNldCB0aGUgY29tcG9uZW50cyBvZiBhIHZlYzMgdG8gdGhlIGdpdmVuIHZhbHVlc1xuICpcbiAqIEBwYXJhbSB7dmVjM30gb3V0IHRoZSByZWNlaXZpbmcgdmVjdG9yXG4gKiBAcGFyYW0ge051bWJlcn0geCBYIGNvbXBvbmVudFxuICogQHBhcmFtIHtOdW1iZXJ9IHkgWSBjb21wb25lbnRcbiAqIEBwYXJhbSB7TnVtYmVyfSB6IFogY29tcG9uZW50XG4gKiBAcmV0dXJucyB7dmVjM30gb3V0XG4gKi9cbnZlYzMuc2V0ID0gZnVuY3Rpb24ob3V0LCB4LCB5LCB6KSB7XG4gICAgb3V0WzBdID0geDtcbiAgICBvdXRbMV0gPSB5O1xuICAgIG91dFsyXSA9IHo7XG4gICAgcmV0dXJuIG91dDtcbn07XG5cbi8qKlxuICogQWRkcyB0d28gdmVjMydzXG4gKlxuICogQHBhcmFtIHt2ZWMzfSBvdXQgdGhlIHJlY2VpdmluZyB2ZWN0b3JcbiAqIEBwYXJhbSB7dmVjM30gYSB0aGUgZmlyc3Qgb3BlcmFuZFxuICogQHBhcmFtIHt2ZWMzfSBiIHRoZSBzZWNvbmQgb3BlcmFuZFxuICogQHJldHVybnMge3ZlYzN9IG91dFxuICovXG52ZWMzLmFkZCA9IGZ1bmN0aW9uKG91dCwgYSwgYikge1xuICAgIG91dFswXSA9IGFbMF0gKyBiWzBdO1xuICAgIG91dFsxXSA9IGFbMV0gKyBiWzFdO1xuICAgIG91dFsyXSA9IGFbMl0gKyBiWzJdO1xuICAgIHJldHVybiBvdXQ7XG59O1xuXG4vKipcbiAqIFN1YnRyYWN0cyB2ZWN0b3IgYiBmcm9tIHZlY3RvciBhXG4gKlxuICogQHBhcmFtIHt2ZWMzfSBvdXQgdGhlIHJlY2VpdmluZyB2ZWN0b3JcbiAqIEBwYXJhbSB7dmVjM30gYSB0aGUgZmlyc3Qgb3BlcmFuZFxuICogQHBhcmFtIHt2ZWMzfSBiIHRoZSBzZWNvbmQgb3BlcmFuZFxuICogQHJldHVybnMge3ZlYzN9IG91dFxuICovXG52ZWMzLnN1YnRyYWN0ID0gZnVuY3Rpb24ob3V0LCBhLCBiKSB7XG4gICAgb3V0WzBdID0gYVswXSAtIGJbMF07XG4gICAgb3V0WzFdID0gYVsxXSAtIGJbMV07XG4gICAgb3V0WzJdID0gYVsyXSAtIGJbMl07XG4gICAgcmV0dXJuIG91dDtcbn07XG5cbi8qKlxuICogQWxpYXMgZm9yIHtAbGluayB2ZWMzLnN1YnRyYWN0fVxuICogQGZ1bmN0aW9uXG4gKi9cbnZlYzMuc3ViID0gdmVjMy5zdWJ0cmFjdDtcblxuLyoqXG4gKiBNdWx0aXBsaWVzIHR3byB2ZWMzJ3NcbiAqXG4gKiBAcGFyYW0ge3ZlYzN9IG91dCB0aGUgcmVjZWl2aW5nIHZlY3RvclxuICogQHBhcmFtIHt2ZWMzfSBhIHRoZSBmaXJzdCBvcGVyYW5kXG4gKiBAcGFyYW0ge3ZlYzN9IGIgdGhlIHNlY29uZCBvcGVyYW5kXG4gKiBAcmV0dXJucyB7dmVjM30gb3V0XG4gKi9cbnZlYzMubXVsdGlwbHkgPSBmdW5jdGlvbihvdXQsIGEsIGIpIHtcbiAgICBvdXRbMF0gPSBhWzBdICogYlswXTtcbiAgICBvdXRbMV0gPSBhWzFdICogYlsxXTtcbiAgICBvdXRbMl0gPSBhWzJdICogYlsyXTtcbiAgICByZXR1cm4gb3V0O1xufTtcblxuLyoqXG4gKiBBbGlhcyBmb3Ige0BsaW5rIHZlYzMubXVsdGlwbHl9XG4gKiBAZnVuY3Rpb25cbiAqL1xudmVjMy5tdWwgPSB2ZWMzLm11bHRpcGx5O1xuXG4vKipcbiAqIERpdmlkZXMgdHdvIHZlYzMnc1xuICpcbiAqIEBwYXJhbSB7dmVjM30gb3V0IHRoZSByZWNlaXZpbmcgdmVjdG9yXG4gKiBAcGFyYW0ge3ZlYzN9IGEgdGhlIGZpcnN0IG9wZXJhbmRcbiAqIEBwYXJhbSB7dmVjM30gYiB0aGUgc2Vjb25kIG9wZXJhbmRcbiAqIEByZXR1cm5zIHt2ZWMzfSBvdXRcbiAqL1xudmVjMy5kaXZpZGUgPSBmdW5jdGlvbihvdXQsIGEsIGIpIHtcbiAgICBvdXRbMF0gPSBhWzBdIC8gYlswXTtcbiAgICBvdXRbMV0gPSBhWzFdIC8gYlsxXTtcbiAgICBvdXRbMl0gPSBhWzJdIC8gYlsyXTtcbiAgICByZXR1cm4gb3V0O1xufTtcblxuLyoqXG4gKiBBbGlhcyBmb3Ige0BsaW5rIHZlYzMuZGl2aWRlfVxuICogQGZ1bmN0aW9uXG4gKi9cbnZlYzMuZGl2ID0gdmVjMy5kaXZpZGU7XG5cbi8qKlxuICogUmV0dXJucyB0aGUgbWluaW11bSBvZiB0d28gdmVjMydzXG4gKlxuICogQHBhcmFtIHt2ZWMzfSBvdXQgdGhlIHJlY2VpdmluZyB2ZWN0b3JcbiAqIEBwYXJhbSB7dmVjM30gYSB0aGUgZmlyc3Qgb3BlcmFuZFxuICogQHBhcmFtIHt2ZWMzfSBiIHRoZSBzZWNvbmQgb3BlcmFuZFxuICogQHJldHVybnMge3ZlYzN9IG91dFxuICovXG52ZWMzLm1pbiA9IGZ1bmN0aW9uKG91dCwgYSwgYikge1xuICAgIG91dFswXSA9IE1hdGgubWluKGFbMF0sIGJbMF0pO1xuICAgIG91dFsxXSA9IE1hdGgubWluKGFbMV0sIGJbMV0pO1xuICAgIG91dFsyXSA9IE1hdGgubWluKGFbMl0sIGJbMl0pO1xuICAgIHJldHVybiBvdXQ7XG59O1xuXG4vKipcbiAqIFJldHVybnMgdGhlIG1heGltdW0gb2YgdHdvIHZlYzMnc1xuICpcbiAqIEBwYXJhbSB7dmVjM30gb3V0IHRoZSByZWNlaXZpbmcgdmVjdG9yXG4gKiBAcGFyYW0ge3ZlYzN9IGEgdGhlIGZpcnN0IG9wZXJhbmRcbiAqIEBwYXJhbSB7dmVjM30gYiB0aGUgc2Vjb25kIG9wZXJhbmRcbiAqIEByZXR1cm5zIHt2ZWMzfSBvdXRcbiAqL1xudmVjMy5tYXggPSBmdW5jdGlvbihvdXQsIGEsIGIpIHtcbiAgICBvdXRbMF0gPSBNYXRoLm1heChhWzBdLCBiWzBdKTtcbiAgICBvdXRbMV0gPSBNYXRoLm1heChhWzFdLCBiWzFdKTtcbiAgICBvdXRbMl0gPSBNYXRoLm1heChhWzJdLCBiWzJdKTtcbiAgICByZXR1cm4gb3V0O1xufTtcblxuLyoqXG4gKiBTY2FsZXMgYSB2ZWMzIGJ5IGEgc2NhbGFyIG51bWJlclxuICpcbiAqIEBwYXJhbSB7dmVjM30gb3V0IHRoZSByZWNlaXZpbmcgdmVjdG9yXG4gKiBAcGFyYW0ge3ZlYzN9IGEgdGhlIHZlY3RvciB0byBzY2FsZVxuICogQHBhcmFtIHtOdW1iZXJ9IGIgYW1vdW50IHRvIHNjYWxlIHRoZSB2ZWN0b3IgYnlcbiAqIEByZXR1cm5zIHt2ZWMzfSBvdXRcbiAqL1xudmVjMy5zY2FsZSA9IGZ1bmN0aW9uKG91dCwgYSwgYikge1xuICAgIG91dFswXSA9IGFbMF0gKiBiO1xuICAgIG91dFsxXSA9IGFbMV0gKiBiO1xuICAgIG91dFsyXSA9IGFbMl0gKiBiO1xuICAgIHJldHVybiBvdXQ7XG59O1xuXG4vKipcbiAqIEFkZHMgdHdvIHZlYzMncyBhZnRlciBzY2FsaW5nIHRoZSBzZWNvbmQgb3BlcmFuZCBieSBhIHNjYWxhciB2YWx1ZVxuICpcbiAqIEBwYXJhbSB7dmVjM30gb3V0IHRoZSByZWNlaXZpbmcgdmVjdG9yXG4gKiBAcGFyYW0ge3ZlYzN9IGEgdGhlIGZpcnN0IG9wZXJhbmRcbiAqIEBwYXJhbSB7dmVjM30gYiB0aGUgc2Vjb25kIG9wZXJhbmRcbiAqIEBwYXJhbSB7TnVtYmVyfSBzY2FsZSB0aGUgYW1vdW50IHRvIHNjYWxlIGIgYnkgYmVmb3JlIGFkZGluZ1xuICogQHJldHVybnMge3ZlYzN9IG91dFxuICovXG52ZWMzLnNjYWxlQW5kQWRkID0gZnVuY3Rpb24ob3V0LCBhLCBiLCBzY2FsZSkge1xuICAgIG91dFswXSA9IGFbMF0gKyAoYlswXSAqIHNjYWxlKTtcbiAgICBvdXRbMV0gPSBhWzFdICsgKGJbMV0gKiBzY2FsZSk7XG4gICAgb3V0WzJdID0gYVsyXSArIChiWzJdICogc2NhbGUpO1xuICAgIHJldHVybiBvdXQ7XG59O1xuXG4vKipcbiAqIENhbGN1bGF0ZXMgdGhlIGV1Y2xpZGlhbiBkaXN0YW5jZSBiZXR3ZWVuIHR3byB2ZWMzJ3NcbiAqXG4gKiBAcGFyYW0ge3ZlYzN9IGEgdGhlIGZpcnN0IG9wZXJhbmRcbiAqIEBwYXJhbSB7dmVjM30gYiB0aGUgc2Vjb25kIG9wZXJhbmRcbiAqIEByZXR1cm5zIHtOdW1iZXJ9IGRpc3RhbmNlIGJldHdlZW4gYSBhbmQgYlxuICovXG52ZWMzLmRpc3RhbmNlID0gZnVuY3Rpb24oYSwgYikge1xuICAgIHZhciB4ID0gYlswXSAtIGFbMF0sXG4gICAgICAgIHkgPSBiWzFdIC0gYVsxXSxcbiAgICAgICAgeiA9IGJbMl0gLSBhWzJdO1xuICAgIHJldHVybiBNYXRoLnNxcnQoeCp4ICsgeSp5ICsgeip6KTtcbn07XG5cbi8qKlxuICogQWxpYXMgZm9yIHtAbGluayB2ZWMzLmRpc3RhbmNlfVxuICogQGZ1bmN0aW9uXG4gKi9cbnZlYzMuZGlzdCA9IHZlYzMuZGlzdGFuY2U7XG5cbi8qKlxuICogQ2FsY3VsYXRlcyB0aGUgc3F1YXJlZCBldWNsaWRpYW4gZGlzdGFuY2UgYmV0d2VlbiB0d28gdmVjMydzXG4gKlxuICogQHBhcmFtIHt2ZWMzfSBhIHRoZSBmaXJzdCBvcGVyYW5kXG4gKiBAcGFyYW0ge3ZlYzN9IGIgdGhlIHNlY29uZCBvcGVyYW5kXG4gKiBAcmV0dXJucyB7TnVtYmVyfSBzcXVhcmVkIGRpc3RhbmNlIGJldHdlZW4gYSBhbmQgYlxuICovXG52ZWMzLnNxdWFyZWREaXN0YW5jZSA9IGZ1bmN0aW9uKGEsIGIpIHtcbiAgICB2YXIgeCA9IGJbMF0gLSBhWzBdLFxuICAgICAgICB5ID0gYlsxXSAtIGFbMV0sXG4gICAgICAgIHogPSBiWzJdIC0gYVsyXTtcbiAgICByZXR1cm4geCp4ICsgeSp5ICsgeip6O1xufTtcblxuLyoqXG4gKiBBbGlhcyBmb3Ige0BsaW5rIHZlYzMuc3F1YXJlZERpc3RhbmNlfVxuICogQGZ1bmN0aW9uXG4gKi9cbnZlYzMuc3FyRGlzdCA9IHZlYzMuc3F1YXJlZERpc3RhbmNlO1xuXG4vKipcbiAqIENhbGN1bGF0ZXMgdGhlIGxlbmd0aCBvZiBhIHZlYzNcbiAqXG4gKiBAcGFyYW0ge3ZlYzN9IGEgdmVjdG9yIHRvIGNhbGN1bGF0ZSBsZW5ndGggb2ZcbiAqIEByZXR1cm5zIHtOdW1iZXJ9IGxlbmd0aCBvZiBhXG4gKi9cbnZlYzMubGVuZ3RoID0gZnVuY3Rpb24gKGEpIHtcbiAgICB2YXIgeCA9IGFbMF0sXG4gICAgICAgIHkgPSBhWzFdLFxuICAgICAgICB6ID0gYVsyXTtcbiAgICByZXR1cm4gTWF0aC5zcXJ0KHgqeCArIHkqeSArIHoqeik7XG59O1xuXG4vKipcbiAqIEFsaWFzIGZvciB7QGxpbmsgdmVjMy5sZW5ndGh9XG4gKiBAZnVuY3Rpb25cbiAqL1xudmVjMy5sZW4gPSB2ZWMzLmxlbmd0aDtcblxuLyoqXG4gKiBDYWxjdWxhdGVzIHRoZSBzcXVhcmVkIGxlbmd0aCBvZiBhIHZlYzNcbiAqXG4gKiBAcGFyYW0ge3ZlYzN9IGEgdmVjdG9yIHRvIGNhbGN1bGF0ZSBzcXVhcmVkIGxlbmd0aCBvZlxuICogQHJldHVybnMge051bWJlcn0gc3F1YXJlZCBsZW5ndGggb2YgYVxuICovXG52ZWMzLnNxdWFyZWRMZW5ndGggPSBmdW5jdGlvbiAoYSkge1xuICAgIHZhciB4ID0gYVswXSxcbiAgICAgICAgeSA9IGFbMV0sXG4gICAgICAgIHogPSBhWzJdO1xuICAgIHJldHVybiB4KnggKyB5KnkgKyB6Kno7XG59O1xuXG4vKipcbiAqIEFsaWFzIGZvciB7QGxpbmsgdmVjMy5zcXVhcmVkTGVuZ3RofVxuICogQGZ1bmN0aW9uXG4gKi9cbnZlYzMuc3FyTGVuID0gdmVjMy5zcXVhcmVkTGVuZ3RoO1xuXG4vKipcbiAqIE5lZ2F0ZXMgdGhlIGNvbXBvbmVudHMgb2YgYSB2ZWMzXG4gKlxuICogQHBhcmFtIHt2ZWMzfSBvdXQgdGhlIHJlY2VpdmluZyB2ZWN0b3JcbiAqIEBwYXJhbSB7dmVjM30gYSB2ZWN0b3IgdG8gbmVnYXRlXG4gKiBAcmV0dXJucyB7dmVjM30gb3V0XG4gKi9cbnZlYzMubmVnYXRlID0gZnVuY3Rpb24ob3V0LCBhKSB7XG4gICAgb3V0WzBdID0gLWFbMF07XG4gICAgb3V0WzFdID0gLWFbMV07XG4gICAgb3V0WzJdID0gLWFbMl07XG4gICAgcmV0dXJuIG91dDtcbn07XG5cbi8qKlxuICogTm9ybWFsaXplIGEgdmVjM1xuICpcbiAqIEBwYXJhbSB7dmVjM30gb3V0IHRoZSByZWNlaXZpbmcgdmVjdG9yXG4gKiBAcGFyYW0ge3ZlYzN9IGEgdmVjdG9yIHRvIG5vcm1hbGl6ZVxuICogQHJldHVybnMge3ZlYzN9IG91dFxuICovXG52ZWMzLm5vcm1hbGl6ZSA9IGZ1bmN0aW9uKG91dCwgYSkge1xuICAgIHZhciB4ID0gYVswXSxcbiAgICAgICAgeSA9IGFbMV0sXG4gICAgICAgIHogPSBhWzJdO1xuICAgIHZhciBsZW4gPSB4KnggKyB5KnkgKyB6Kno7XG4gICAgaWYgKGxlbiA+IDApIHtcbiAgICAgICAgLy9UT0RPOiBldmFsdWF0ZSB1c2Ugb2YgZ2xtX2ludnNxcnQgaGVyZT9cbiAgICAgICAgbGVuID0gMSAvIE1hdGguc3FydChsZW4pO1xuICAgICAgICBvdXRbMF0gPSBhWzBdICogbGVuO1xuICAgICAgICBvdXRbMV0gPSBhWzFdICogbGVuO1xuICAgICAgICBvdXRbMl0gPSBhWzJdICogbGVuO1xuICAgIH1cbiAgICByZXR1cm4gb3V0O1xufTtcblxuLyoqXG4gKiBDYWxjdWxhdGVzIHRoZSBkb3QgcHJvZHVjdCBvZiB0d28gdmVjMydzXG4gKlxuICogQHBhcmFtIHt2ZWMzfSBhIHRoZSBmaXJzdCBvcGVyYW5kXG4gKiBAcGFyYW0ge3ZlYzN9IGIgdGhlIHNlY29uZCBvcGVyYW5kXG4gKiBAcmV0dXJucyB7TnVtYmVyfSBkb3QgcHJvZHVjdCBvZiBhIGFuZCBiXG4gKi9cbnZlYzMuZG90ID0gZnVuY3Rpb24gKGEsIGIpIHtcbiAgICByZXR1cm4gYVswXSAqIGJbMF0gKyBhWzFdICogYlsxXSArIGFbMl0gKiBiWzJdO1xufTtcblxuLyoqXG4gKiBDb21wdXRlcyB0aGUgY3Jvc3MgcHJvZHVjdCBvZiB0d28gdmVjMydzXG4gKlxuICogQHBhcmFtIHt2ZWMzfSBvdXQgdGhlIHJlY2VpdmluZyB2ZWN0b3JcbiAqIEBwYXJhbSB7dmVjM30gYSB0aGUgZmlyc3Qgb3BlcmFuZFxuICogQHBhcmFtIHt2ZWMzfSBiIHRoZSBzZWNvbmQgb3BlcmFuZFxuICogQHJldHVybnMge3ZlYzN9IG91dFxuICovXG52ZWMzLmNyb3NzID0gZnVuY3Rpb24ob3V0LCBhLCBiKSB7XG4gICAgdmFyIGF4ID0gYVswXSwgYXkgPSBhWzFdLCBheiA9IGFbMl0sXG4gICAgICAgIGJ4ID0gYlswXSwgYnkgPSBiWzFdLCBieiA9IGJbMl07XG5cbiAgICBvdXRbMF0gPSBheSAqIGJ6IC0gYXogKiBieTtcbiAgICBvdXRbMV0gPSBheiAqIGJ4IC0gYXggKiBiejtcbiAgICBvdXRbMl0gPSBheCAqIGJ5IC0gYXkgKiBieDtcbiAgICByZXR1cm4gb3V0O1xufTtcblxuLyoqXG4gKiBQZXJmb3JtcyBhIGxpbmVhciBpbnRlcnBvbGF0aW9uIGJldHdlZW4gdHdvIHZlYzMnc1xuICpcbiAqIEBwYXJhbSB7dmVjM30gb3V0IHRoZSByZWNlaXZpbmcgdmVjdG9yXG4gKiBAcGFyYW0ge3ZlYzN9IGEgdGhlIGZpcnN0IG9wZXJhbmRcbiAqIEBwYXJhbSB7dmVjM30gYiB0aGUgc2Vjb25kIG9wZXJhbmRcbiAqIEBwYXJhbSB7TnVtYmVyfSB0IGludGVycG9sYXRpb24gYW1vdW50IGJldHdlZW4gdGhlIHR3byBpbnB1dHNcbiAqIEByZXR1cm5zIHt2ZWMzfSBvdXRcbiAqL1xudmVjMy5sZXJwID0gZnVuY3Rpb24gKG91dCwgYSwgYiwgdCkge1xuICAgIHZhciBheCA9IGFbMF0sXG4gICAgICAgIGF5ID0gYVsxXSxcbiAgICAgICAgYXogPSBhWzJdO1xuICAgIG91dFswXSA9IGF4ICsgdCAqIChiWzBdIC0gYXgpO1xuICAgIG91dFsxXSA9IGF5ICsgdCAqIChiWzFdIC0gYXkpO1xuICAgIG91dFsyXSA9IGF6ICsgdCAqIChiWzJdIC0gYXopO1xuICAgIHJldHVybiBvdXQ7XG59O1xuXG4vKipcbiAqIEdlbmVyYXRlcyBhIHJhbmRvbSB2ZWN0b3Igd2l0aCB0aGUgZ2l2ZW4gc2NhbGVcbiAqXG4gKiBAcGFyYW0ge3ZlYzN9IG91dCB0aGUgcmVjZWl2aW5nIHZlY3RvclxuICogQHBhcmFtIHtOdW1iZXJ9IFtzY2FsZV0gTGVuZ3RoIG9mIHRoZSByZXN1bHRpbmcgdmVjdG9yLiBJZiBvbW1pdHRlZCwgYSB1bml0IHZlY3RvciB3aWxsIGJlIHJldHVybmVkXG4gKiBAcmV0dXJucyB7dmVjM30gb3V0XG4gKi9cbnZlYzMucmFuZG9tID0gZnVuY3Rpb24gKG91dCwgc2NhbGUpIHtcbiAgICBzY2FsZSA9IHNjYWxlIHx8IDEuMDtcblxuICAgIHZhciByID0gR0xNQVRfUkFORE9NKCkgKiAyLjAgKiBNYXRoLlBJO1xuICAgIHZhciB6ID0gKEdMTUFUX1JBTkRPTSgpICogMi4wKSAtIDEuMDtcbiAgICB2YXIgelNjYWxlID0gTWF0aC5zcXJ0KDEuMC16KnopICogc2NhbGU7XG5cbiAgICBvdXRbMF0gPSBNYXRoLmNvcyhyKSAqIHpTY2FsZTtcbiAgICBvdXRbMV0gPSBNYXRoLnNpbihyKSAqIHpTY2FsZTtcbiAgICBvdXRbMl0gPSB6ICogc2NhbGU7XG4gICAgcmV0dXJuIG91dDtcbn07XG5cbi8qKlxuICogVHJhbnNmb3JtcyB0aGUgdmVjMyB3aXRoIGEgbWF0NC5cbiAqIDR0aCB2ZWN0b3IgY29tcG9uZW50IGlzIGltcGxpY2l0bHkgJzEnXG4gKlxuICogQHBhcmFtIHt2ZWMzfSBvdXQgdGhlIHJlY2VpdmluZyB2ZWN0b3JcbiAqIEBwYXJhbSB7dmVjM30gYSB0aGUgdmVjdG9yIHRvIHRyYW5zZm9ybVxuICogQHBhcmFtIHttYXQ0fSBtIG1hdHJpeCB0byB0cmFuc2Zvcm0gd2l0aFxuICogQHJldHVybnMge3ZlYzN9IG91dFxuICovXG52ZWMzLnRyYW5zZm9ybU1hdDQgPSBmdW5jdGlvbihvdXQsIGEsIG0pIHtcbiAgICB2YXIgeCA9IGFbMF0sIHkgPSBhWzFdLCB6ID0gYVsyXTtcbiAgICBvdXRbMF0gPSBtWzBdICogeCArIG1bNF0gKiB5ICsgbVs4XSAqIHogKyBtWzEyXTtcbiAgICBvdXRbMV0gPSBtWzFdICogeCArIG1bNV0gKiB5ICsgbVs5XSAqIHogKyBtWzEzXTtcbiAgICBvdXRbMl0gPSBtWzJdICogeCArIG1bNl0gKiB5ICsgbVsxMF0gKiB6ICsgbVsxNF07XG4gICAgcmV0dXJuIG91dDtcbn07XG5cbi8qKlxuICogVHJhbnNmb3JtcyB0aGUgdmVjMyB3aXRoIGEgbWF0My5cbiAqXG4gKiBAcGFyYW0ge3ZlYzN9IG91dCB0aGUgcmVjZWl2aW5nIHZlY3RvclxuICogQHBhcmFtIHt2ZWMzfSBhIHRoZSB2ZWN0b3IgdG8gdHJhbnNmb3JtXG4gKiBAcGFyYW0ge21hdDR9IG0gdGhlIDN4MyBtYXRyaXggdG8gdHJhbnNmb3JtIHdpdGhcbiAqIEByZXR1cm5zIHt2ZWMzfSBvdXRcbiAqL1xudmVjMy50cmFuc2Zvcm1NYXQzID0gZnVuY3Rpb24ob3V0LCBhLCBtKSB7XG4gICAgdmFyIHggPSBhWzBdLCB5ID0gYVsxXSwgeiA9IGFbMl07XG4gICAgb3V0WzBdID0geCAqIG1bMF0gKyB5ICogbVszXSArIHogKiBtWzZdO1xuICAgIG91dFsxXSA9IHggKiBtWzFdICsgeSAqIG1bNF0gKyB6ICogbVs3XTtcbiAgICBvdXRbMl0gPSB4ICogbVsyXSArIHkgKiBtWzVdICsgeiAqIG1bOF07XG4gICAgcmV0dXJuIG91dDtcbn07XG5cbi8qKlxuICogVHJhbnNmb3JtcyB0aGUgdmVjMyB3aXRoIGEgcXVhdFxuICpcbiAqIEBwYXJhbSB7dmVjM30gb3V0IHRoZSByZWNlaXZpbmcgdmVjdG9yXG4gKiBAcGFyYW0ge3ZlYzN9IGEgdGhlIHZlY3RvciB0byB0cmFuc2Zvcm1cbiAqIEBwYXJhbSB7cXVhdH0gcSBxdWF0ZXJuaW9uIHRvIHRyYW5zZm9ybSB3aXRoXG4gKiBAcmV0dXJucyB7dmVjM30gb3V0XG4gKi9cbnZlYzMudHJhbnNmb3JtUXVhdCA9IGZ1bmN0aW9uKG91dCwgYSwgcSkge1xuICAgIC8vIGJlbmNobWFya3M6IGh0dHA6Ly9qc3BlcmYuY29tL3F1YXRlcm5pb24tdHJhbnNmb3JtLXZlYzMtaW1wbGVtZW50YXRpb25zXG5cbiAgICB2YXIgeCA9IGFbMF0sIHkgPSBhWzFdLCB6ID0gYVsyXSxcbiAgICAgICAgcXggPSBxWzBdLCBxeSA9IHFbMV0sIHF6ID0gcVsyXSwgcXcgPSBxWzNdLFxuXG4gICAgICAgIC8vIGNhbGN1bGF0ZSBxdWF0ICogdmVjXG4gICAgICAgIGl4ID0gcXcgKiB4ICsgcXkgKiB6IC0gcXogKiB5LFxuICAgICAgICBpeSA9IHF3ICogeSArIHF6ICogeCAtIHF4ICogeixcbiAgICAgICAgaXogPSBxdyAqIHogKyBxeCAqIHkgLSBxeSAqIHgsXG4gICAgICAgIGl3ID0gLXF4ICogeCAtIHF5ICogeSAtIHF6ICogejtcblxuICAgIC8vIGNhbGN1bGF0ZSByZXN1bHQgKiBpbnZlcnNlIHF1YXRcbiAgICBvdXRbMF0gPSBpeCAqIHF3ICsgaXcgKiAtcXggKyBpeSAqIC1xeiAtIGl6ICogLXF5O1xuICAgIG91dFsxXSA9IGl5ICogcXcgKyBpdyAqIC1xeSArIGl6ICogLXF4IC0gaXggKiAtcXo7XG4gICAgb3V0WzJdID0gaXogKiBxdyArIGl3ICogLXF6ICsgaXggKiAtcXkgLSBpeSAqIC1xeDtcbiAgICByZXR1cm4gb3V0O1xufTtcblxuLypcbiogUm90YXRlIGEgM0QgdmVjdG9yIGFyb3VuZCB0aGUgeC1heGlzXG4qIEBwYXJhbSB7dmVjM30gb3V0IFRoZSByZWNlaXZpbmcgdmVjM1xuKiBAcGFyYW0ge3ZlYzN9IGEgVGhlIHZlYzMgcG9pbnQgdG8gcm90YXRlXG4qIEBwYXJhbSB7dmVjM30gYiBUaGUgb3JpZ2luIG9mIHRoZSByb3RhdGlvblxuKiBAcGFyYW0ge051bWJlcn0gYyBUaGUgYW5nbGUgb2Ygcm90YXRpb25cbiogQHJldHVybnMge3ZlYzN9IG91dFxuKi9cbnZlYzMucm90YXRlWCA9IGZ1bmN0aW9uKG91dCwgYSwgYiwgYyl7XG4gICB2YXIgcCA9IFtdLCByPVtdO1xuXHQgIC8vVHJhbnNsYXRlIHBvaW50IHRvIHRoZSBvcmlnaW5cblx0ICBwWzBdID0gYVswXSAtIGJbMF07XG5cdCAgcFsxXSA9IGFbMV0gLSBiWzFdO1xuICBcdHBbMl0gPSBhWzJdIC0gYlsyXTtcblxuXHQgIC8vcGVyZm9ybSByb3RhdGlvblxuXHQgIHJbMF0gPSBwWzBdO1xuXHQgIHJbMV0gPSBwWzFdKk1hdGguY29zKGMpIC0gcFsyXSpNYXRoLnNpbihjKTtcblx0ICByWzJdID0gcFsxXSpNYXRoLnNpbihjKSArIHBbMl0qTWF0aC5jb3MoYyk7XG5cblx0ICAvL3RyYW5zbGF0ZSB0byBjb3JyZWN0IHBvc2l0aW9uXG5cdCAgb3V0WzBdID0gclswXSArIGJbMF07XG5cdCAgb3V0WzFdID0gclsxXSArIGJbMV07XG5cdCAgb3V0WzJdID0gclsyXSArIGJbMl07XG5cbiAgXHRyZXR1cm4gb3V0O1xufTtcblxuLypcbiogUm90YXRlIGEgM0QgdmVjdG9yIGFyb3VuZCB0aGUgeS1heGlzXG4qIEBwYXJhbSB7dmVjM30gb3V0IFRoZSByZWNlaXZpbmcgdmVjM1xuKiBAcGFyYW0ge3ZlYzN9IGEgVGhlIHZlYzMgcG9pbnQgdG8gcm90YXRlXG4qIEBwYXJhbSB7dmVjM30gYiBUaGUgb3JpZ2luIG9mIHRoZSByb3RhdGlvblxuKiBAcGFyYW0ge051bWJlcn0gYyBUaGUgYW5nbGUgb2Ygcm90YXRpb25cbiogQHJldHVybnMge3ZlYzN9IG91dFxuKi9cbnZlYzMucm90YXRlWSA9IGZ1bmN0aW9uKG91dCwgYSwgYiwgYyl7XG4gIFx0dmFyIHAgPSBbXSwgcj1bXTtcbiAgXHQvL1RyYW5zbGF0ZSBwb2ludCB0byB0aGUgb3JpZ2luXG4gIFx0cFswXSA9IGFbMF0gLSBiWzBdO1xuICBcdHBbMV0gPSBhWzFdIC0gYlsxXTtcbiAgXHRwWzJdID0gYVsyXSAtIGJbMl07XG4gIFxuICBcdC8vcGVyZm9ybSByb3RhdGlvblxuICBcdHJbMF0gPSBwWzJdKk1hdGguc2luKGMpICsgcFswXSpNYXRoLmNvcyhjKTtcbiAgXHRyWzFdID0gcFsxXTtcbiAgXHRyWzJdID0gcFsyXSpNYXRoLmNvcyhjKSAtIHBbMF0qTWF0aC5zaW4oYyk7XG4gIFxuICBcdC8vdHJhbnNsYXRlIHRvIGNvcnJlY3QgcG9zaXRpb25cbiAgXHRvdXRbMF0gPSByWzBdICsgYlswXTtcbiAgXHRvdXRbMV0gPSByWzFdICsgYlsxXTtcbiAgXHRvdXRbMl0gPSByWzJdICsgYlsyXTtcbiAgXG4gIFx0cmV0dXJuIG91dDtcbn07XG5cbi8qXG4qIFJvdGF0ZSBhIDNEIHZlY3RvciBhcm91bmQgdGhlIHotYXhpc1xuKiBAcGFyYW0ge3ZlYzN9IG91dCBUaGUgcmVjZWl2aW5nIHZlYzNcbiogQHBhcmFtIHt2ZWMzfSBhIFRoZSB2ZWMzIHBvaW50IHRvIHJvdGF0ZVxuKiBAcGFyYW0ge3ZlYzN9IGIgVGhlIG9yaWdpbiBvZiB0aGUgcm90YXRpb25cbiogQHBhcmFtIHtOdW1iZXJ9IGMgVGhlIGFuZ2xlIG9mIHJvdGF0aW9uXG4qIEByZXR1cm5zIHt2ZWMzfSBvdXRcbiovXG52ZWMzLnJvdGF0ZVogPSBmdW5jdGlvbihvdXQsIGEsIGIsIGMpe1xuICBcdHZhciBwID0gW10sIHI9W107XG4gIFx0Ly9UcmFuc2xhdGUgcG9pbnQgdG8gdGhlIG9yaWdpblxuICBcdHBbMF0gPSBhWzBdIC0gYlswXTtcbiAgXHRwWzFdID0gYVsxXSAtIGJbMV07XG4gIFx0cFsyXSA9IGFbMl0gLSBiWzJdO1xuICBcbiAgXHQvL3BlcmZvcm0gcm90YXRpb25cbiAgXHRyWzBdID0gcFswXSpNYXRoLmNvcyhjKSAtIHBbMV0qTWF0aC5zaW4oYyk7XG4gIFx0clsxXSA9IHBbMF0qTWF0aC5zaW4oYykgKyBwWzFdKk1hdGguY29zKGMpO1xuICBcdHJbMl0gPSBwWzJdO1xuICBcbiAgXHQvL3RyYW5zbGF0ZSB0byBjb3JyZWN0IHBvc2l0aW9uXG4gIFx0b3V0WzBdID0gclswXSArIGJbMF07XG4gIFx0b3V0WzFdID0gclsxXSArIGJbMV07XG4gIFx0b3V0WzJdID0gclsyXSArIGJbMl07XG4gIFxuICBcdHJldHVybiBvdXQ7XG59O1xuXG4vKipcbiAqIFBlcmZvcm0gc29tZSBvcGVyYXRpb24gb3ZlciBhbiBhcnJheSBvZiB2ZWMzcy5cbiAqXG4gKiBAcGFyYW0ge0FycmF5fSBhIHRoZSBhcnJheSBvZiB2ZWN0b3JzIHRvIGl0ZXJhdGUgb3ZlclxuICogQHBhcmFtIHtOdW1iZXJ9IHN0cmlkZSBOdW1iZXIgb2YgZWxlbWVudHMgYmV0d2VlbiB0aGUgc3RhcnQgb2YgZWFjaCB2ZWMzLiBJZiAwIGFzc3VtZXMgdGlnaHRseSBwYWNrZWRcbiAqIEBwYXJhbSB7TnVtYmVyfSBvZmZzZXQgTnVtYmVyIG9mIGVsZW1lbnRzIHRvIHNraXAgYXQgdGhlIGJlZ2lubmluZyBvZiB0aGUgYXJyYXlcbiAqIEBwYXJhbSB7TnVtYmVyfSBjb3VudCBOdW1iZXIgb2YgdmVjM3MgdG8gaXRlcmF0ZSBvdmVyLiBJZiAwIGl0ZXJhdGVzIG92ZXIgZW50aXJlIGFycmF5XG4gKiBAcGFyYW0ge0Z1bmN0aW9ufSBmbiBGdW5jdGlvbiB0byBjYWxsIGZvciBlYWNoIHZlY3RvciBpbiB0aGUgYXJyYXlcbiAqIEBwYXJhbSB7T2JqZWN0fSBbYXJnXSBhZGRpdGlvbmFsIGFyZ3VtZW50IHRvIHBhc3MgdG8gZm5cbiAqIEByZXR1cm5zIHtBcnJheX0gYVxuICogQGZ1bmN0aW9uXG4gKi9cbnZlYzMuZm9yRWFjaCA9IChmdW5jdGlvbigpIHtcbiAgICB2YXIgdmVjID0gdmVjMy5jcmVhdGUoKTtcblxuICAgIHJldHVybiBmdW5jdGlvbihhLCBzdHJpZGUsIG9mZnNldCwgY291bnQsIGZuLCBhcmcpIHtcbiAgICAgICAgdmFyIGksIGw7XG4gICAgICAgIGlmKCFzdHJpZGUpIHtcbiAgICAgICAgICAgIHN0cmlkZSA9IDM7XG4gICAgICAgIH1cblxuICAgICAgICBpZighb2Zmc2V0KSB7XG4gICAgICAgICAgICBvZmZzZXQgPSAwO1xuICAgICAgICB9XG4gICAgICAgIFxuICAgICAgICBpZihjb3VudCkge1xuICAgICAgICAgICAgbCA9IE1hdGgubWluKChjb3VudCAqIHN0cmlkZSkgKyBvZmZzZXQsIGEubGVuZ3RoKTtcbiAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgIGwgPSBhLmxlbmd0aDtcbiAgICAgICAgfVxuXG4gICAgICAgIGZvcihpID0gb2Zmc2V0OyBpIDwgbDsgaSArPSBzdHJpZGUpIHtcbiAgICAgICAgICAgIHZlY1swXSA9IGFbaV07IHZlY1sxXSA9IGFbaSsxXTsgdmVjWzJdID0gYVtpKzJdO1xuICAgICAgICAgICAgZm4odmVjLCB2ZWMsIGFyZyk7XG4gICAgICAgICAgICBhW2ldID0gdmVjWzBdOyBhW2krMV0gPSB2ZWNbMV07IGFbaSsyXSA9IHZlY1syXTtcbiAgICAgICAgfVxuICAgICAgICBcbiAgICAgICAgcmV0dXJuIGE7XG4gICAgfTtcbn0pKCk7XG5cbi8qKlxuICogUmV0dXJucyBhIHN0cmluZyByZXByZXNlbnRhdGlvbiBvZiBhIHZlY3RvclxuICpcbiAqIEBwYXJhbSB7dmVjM30gdmVjIHZlY3RvciB0byByZXByZXNlbnQgYXMgYSBzdHJpbmdcbiAqIEByZXR1cm5zIHtTdHJpbmd9IHN0cmluZyByZXByZXNlbnRhdGlvbiBvZiB0aGUgdmVjdG9yXG4gKi9cbnZlYzMuc3RyID0gZnVuY3Rpb24gKGEpIHtcbiAgICByZXR1cm4gJ3ZlYzMoJyArIGFbMF0gKyAnLCAnICsgYVsxXSArICcsICcgKyBhWzJdICsgJyknO1xufTtcblxuaWYodHlwZW9mKGV4cG9ydHMpICE9PSAndW5kZWZpbmVkJykge1xuICAgIGV4cG9ydHMudmVjMyA9IHZlYzM7XG59XG47XG4vKiBDb3B5cmlnaHQgKGMpIDIwMTMsIEJyYW5kb24gSm9uZXMsIENvbGluIE1hY0tlbnppZSBJVi4gQWxsIHJpZ2h0cyByZXNlcnZlZC5cblxuUmVkaXN0cmlidXRpb24gYW5kIHVzZSBpbiBzb3VyY2UgYW5kIGJpbmFyeSBmb3Jtcywgd2l0aCBvciB3aXRob3V0IG1vZGlmaWNhdGlvbixcbmFyZSBwZXJtaXR0ZWQgcHJvdmlkZWQgdGhhdCB0aGUgZm9sbG93aW5nIGNvbmRpdGlvbnMgYXJlIG1ldDpcblxuICAqIFJlZGlzdHJpYnV0aW9ucyBvZiBzb3VyY2UgY29kZSBtdXN0IHJldGFpbiB0aGUgYWJvdmUgY29weXJpZ2h0IG5vdGljZSwgdGhpc1xuICAgIGxpc3Qgb2YgY29uZGl0aW9ucyBhbmQgdGhlIGZvbGxvd2luZyBkaXNjbGFpbWVyLlxuICAqIFJlZGlzdHJpYnV0aW9ucyBpbiBiaW5hcnkgZm9ybSBtdXN0IHJlcHJvZHVjZSB0aGUgYWJvdmUgY29weXJpZ2h0IG5vdGljZSxcbiAgICB0aGlzIGxpc3Qgb2YgY29uZGl0aW9ucyBhbmQgdGhlIGZvbGxvd2luZyBkaXNjbGFpbWVyIGluIHRoZSBkb2N1bWVudGF0aW9uIFxuICAgIGFuZC9vciBvdGhlciBtYXRlcmlhbHMgcHJvdmlkZWQgd2l0aCB0aGUgZGlzdHJpYnV0aW9uLlxuXG5USElTIFNPRlRXQVJFIElTIFBST1ZJREVEIEJZIFRIRSBDT1BZUklHSFQgSE9MREVSUyBBTkQgQ09OVFJJQlVUT1JTIFwiQVMgSVNcIiBBTkRcbkFOWSBFWFBSRVNTIE9SIElNUExJRUQgV0FSUkFOVElFUywgSU5DTFVESU5HLCBCVVQgTk9UIExJTUlURUQgVE8sIFRIRSBJTVBMSUVEXG5XQVJSQU5USUVTIE9GIE1FUkNIQU5UQUJJTElUWSBBTkQgRklUTkVTUyBGT1IgQSBQQVJUSUNVTEFSIFBVUlBPU0UgQVJFIFxuRElTQ0xBSU1FRC4gSU4gTk8gRVZFTlQgU0hBTEwgVEhFIENPUFlSSUdIVCBIT0xERVIgT1IgQ09OVFJJQlVUT1JTIEJFIExJQUJMRSBGT1JcbkFOWSBESVJFQ1QsIElORElSRUNULCBJTkNJREVOVEFMLCBTUEVDSUFMLCBFWEVNUExBUlksIE9SIENPTlNFUVVFTlRJQUwgREFNQUdFU1xuKElOQ0xVRElORywgQlVUIE5PVCBMSU1JVEVEIFRPLCBQUk9DVVJFTUVOVCBPRiBTVUJTVElUVVRFIEdPT0RTIE9SIFNFUlZJQ0VTO1xuTE9TUyBPRiBVU0UsIERBVEEsIE9SIFBST0ZJVFM7IE9SIEJVU0lORVNTIElOVEVSUlVQVElPTikgSE9XRVZFUiBDQVVTRUQgQU5EIE9OXG5BTlkgVEhFT1JZIE9GIExJQUJJTElUWSwgV0hFVEhFUiBJTiBDT05UUkFDVCwgU1RSSUNUIExJQUJJTElUWSwgT1IgVE9SVFxuKElOQ0xVRElORyBORUdMSUdFTkNFIE9SIE9USEVSV0lTRSkgQVJJU0lORyBJTiBBTlkgV0FZIE9VVCBPRiBUSEUgVVNFIE9GIFRISVNcblNPRlRXQVJFLCBFVkVOIElGIEFEVklTRUQgT0YgVEhFIFBPU1NJQklMSVRZIE9GIFNVQ0ggREFNQUdFLiAqL1xuXG4vKipcbiAqIEBjbGFzcyA0IERpbWVuc2lvbmFsIFZlY3RvclxuICogQG5hbWUgdmVjNFxuICovXG5cbnZhciB2ZWM0ID0ge307XG5cbi8qKlxuICogQ3JlYXRlcyBhIG5ldywgZW1wdHkgdmVjNFxuICpcbiAqIEByZXR1cm5zIHt2ZWM0fSBhIG5ldyA0RCB2ZWN0b3JcbiAqL1xudmVjNC5jcmVhdGUgPSBmdW5jdGlvbigpIHtcbiAgICB2YXIgb3V0ID0gbmV3IEdMTUFUX0FSUkFZX1RZUEUoNCk7XG4gICAgb3V0WzBdID0gMDtcbiAgICBvdXRbMV0gPSAwO1xuICAgIG91dFsyXSA9IDA7XG4gICAgb3V0WzNdID0gMDtcbiAgICByZXR1cm4gb3V0O1xufTtcblxuLyoqXG4gKiBDcmVhdGVzIGEgbmV3IHZlYzQgaW5pdGlhbGl6ZWQgd2l0aCB2YWx1ZXMgZnJvbSBhbiBleGlzdGluZyB2ZWN0b3JcbiAqXG4gKiBAcGFyYW0ge3ZlYzR9IGEgdmVjdG9yIHRvIGNsb25lXG4gKiBAcmV0dXJucyB7dmVjNH0gYSBuZXcgNEQgdmVjdG9yXG4gKi9cbnZlYzQuY2xvbmUgPSBmdW5jdGlvbihhKSB7XG4gICAgdmFyIG91dCA9IG5ldyBHTE1BVF9BUlJBWV9UWVBFKDQpO1xuICAgIG91dFswXSA9IGFbMF07XG4gICAgb3V0WzFdID0gYVsxXTtcbiAgICBvdXRbMl0gPSBhWzJdO1xuICAgIG91dFszXSA9IGFbM107XG4gICAgcmV0dXJuIG91dDtcbn07XG5cbi8qKlxuICogQ3JlYXRlcyBhIG5ldyB2ZWM0IGluaXRpYWxpemVkIHdpdGggdGhlIGdpdmVuIHZhbHVlc1xuICpcbiAqIEBwYXJhbSB7TnVtYmVyfSB4IFggY29tcG9uZW50XG4gKiBAcGFyYW0ge051bWJlcn0geSBZIGNvbXBvbmVudFxuICogQHBhcmFtIHtOdW1iZXJ9IHogWiBjb21wb25lbnRcbiAqIEBwYXJhbSB7TnVtYmVyfSB3IFcgY29tcG9uZW50XG4gKiBAcmV0dXJucyB7dmVjNH0gYSBuZXcgNEQgdmVjdG9yXG4gKi9cbnZlYzQuZnJvbVZhbHVlcyA9IGZ1bmN0aW9uKHgsIHksIHosIHcpIHtcbiAgICB2YXIgb3V0ID0gbmV3IEdMTUFUX0FSUkFZX1RZUEUoNCk7XG4gICAgb3V0WzBdID0geDtcbiAgICBvdXRbMV0gPSB5O1xuICAgIG91dFsyXSA9IHo7XG4gICAgb3V0WzNdID0gdztcbiAgICByZXR1cm4gb3V0O1xufTtcblxuLyoqXG4gKiBDb3B5IHRoZSB2YWx1ZXMgZnJvbSBvbmUgdmVjNCB0byBhbm90aGVyXG4gKlxuICogQHBhcmFtIHt2ZWM0fSBvdXQgdGhlIHJlY2VpdmluZyB2ZWN0b3JcbiAqIEBwYXJhbSB7dmVjNH0gYSB0aGUgc291cmNlIHZlY3RvclxuICogQHJldHVybnMge3ZlYzR9IG91dFxuICovXG52ZWM0LmNvcHkgPSBmdW5jdGlvbihvdXQsIGEpIHtcbiAgICBvdXRbMF0gPSBhWzBdO1xuICAgIG91dFsxXSA9IGFbMV07XG4gICAgb3V0WzJdID0gYVsyXTtcbiAgICBvdXRbM10gPSBhWzNdO1xuICAgIHJldHVybiBvdXQ7XG59O1xuXG4vKipcbiAqIFNldCB0aGUgY29tcG9uZW50cyBvZiBhIHZlYzQgdG8gdGhlIGdpdmVuIHZhbHVlc1xuICpcbiAqIEBwYXJhbSB7dmVjNH0gb3V0IHRoZSByZWNlaXZpbmcgdmVjdG9yXG4gKiBAcGFyYW0ge051bWJlcn0geCBYIGNvbXBvbmVudFxuICogQHBhcmFtIHtOdW1iZXJ9IHkgWSBjb21wb25lbnRcbiAqIEBwYXJhbSB7TnVtYmVyfSB6IFogY29tcG9uZW50XG4gKiBAcGFyYW0ge051bWJlcn0gdyBXIGNvbXBvbmVudFxuICogQHJldHVybnMge3ZlYzR9IG91dFxuICovXG52ZWM0LnNldCA9IGZ1bmN0aW9uKG91dCwgeCwgeSwgeiwgdykge1xuICAgIG91dFswXSA9IHg7XG4gICAgb3V0WzFdID0geTtcbiAgICBvdXRbMl0gPSB6O1xuICAgIG91dFszXSA9IHc7XG4gICAgcmV0dXJuIG91dDtcbn07XG5cbi8qKlxuICogQWRkcyB0d28gdmVjNCdzXG4gKlxuICogQHBhcmFtIHt2ZWM0fSBvdXQgdGhlIHJlY2VpdmluZyB2ZWN0b3JcbiAqIEBwYXJhbSB7dmVjNH0gYSB0aGUgZmlyc3Qgb3BlcmFuZFxuICogQHBhcmFtIHt2ZWM0fSBiIHRoZSBzZWNvbmQgb3BlcmFuZFxuICogQHJldHVybnMge3ZlYzR9IG91dFxuICovXG52ZWM0LmFkZCA9IGZ1bmN0aW9uKG91dCwgYSwgYikge1xuICAgIG91dFswXSA9IGFbMF0gKyBiWzBdO1xuICAgIG91dFsxXSA9IGFbMV0gKyBiWzFdO1xuICAgIG91dFsyXSA9IGFbMl0gKyBiWzJdO1xuICAgIG91dFszXSA9IGFbM10gKyBiWzNdO1xuICAgIHJldHVybiBvdXQ7XG59O1xuXG4vKipcbiAqIFN1YnRyYWN0cyB2ZWN0b3IgYiBmcm9tIHZlY3RvciBhXG4gKlxuICogQHBhcmFtIHt2ZWM0fSBvdXQgdGhlIHJlY2VpdmluZyB2ZWN0b3JcbiAqIEBwYXJhbSB7dmVjNH0gYSB0aGUgZmlyc3Qgb3BlcmFuZFxuICogQHBhcmFtIHt2ZWM0fSBiIHRoZSBzZWNvbmQgb3BlcmFuZFxuICogQHJldHVybnMge3ZlYzR9IG91dFxuICovXG52ZWM0LnN1YnRyYWN0ID0gZnVuY3Rpb24ob3V0LCBhLCBiKSB7XG4gICAgb3V0WzBdID0gYVswXSAtIGJbMF07XG4gICAgb3V0WzFdID0gYVsxXSAtIGJbMV07XG4gICAgb3V0WzJdID0gYVsyXSAtIGJbMl07XG4gICAgb3V0WzNdID0gYVszXSAtIGJbM107XG4gICAgcmV0dXJuIG91dDtcbn07XG5cbi8qKlxuICogQWxpYXMgZm9yIHtAbGluayB2ZWM0LnN1YnRyYWN0fVxuICogQGZ1bmN0aW9uXG4gKi9cbnZlYzQuc3ViID0gdmVjNC5zdWJ0cmFjdDtcblxuLyoqXG4gKiBNdWx0aXBsaWVzIHR3byB2ZWM0J3NcbiAqXG4gKiBAcGFyYW0ge3ZlYzR9IG91dCB0aGUgcmVjZWl2aW5nIHZlY3RvclxuICogQHBhcmFtIHt2ZWM0fSBhIHRoZSBmaXJzdCBvcGVyYW5kXG4gKiBAcGFyYW0ge3ZlYzR9IGIgdGhlIHNlY29uZCBvcGVyYW5kXG4gKiBAcmV0dXJucyB7dmVjNH0gb3V0XG4gKi9cbnZlYzQubXVsdGlwbHkgPSBmdW5jdGlvbihvdXQsIGEsIGIpIHtcbiAgICBvdXRbMF0gPSBhWzBdICogYlswXTtcbiAgICBvdXRbMV0gPSBhWzFdICogYlsxXTtcbiAgICBvdXRbMl0gPSBhWzJdICogYlsyXTtcbiAgICBvdXRbM10gPSBhWzNdICogYlszXTtcbiAgICByZXR1cm4gb3V0O1xufTtcblxuLyoqXG4gKiBBbGlhcyBmb3Ige0BsaW5rIHZlYzQubXVsdGlwbHl9XG4gKiBAZnVuY3Rpb25cbiAqL1xudmVjNC5tdWwgPSB2ZWM0Lm11bHRpcGx5O1xuXG4vKipcbiAqIERpdmlkZXMgdHdvIHZlYzQnc1xuICpcbiAqIEBwYXJhbSB7dmVjNH0gb3V0IHRoZSByZWNlaXZpbmcgdmVjdG9yXG4gKiBAcGFyYW0ge3ZlYzR9IGEgdGhlIGZpcnN0IG9wZXJhbmRcbiAqIEBwYXJhbSB7dmVjNH0gYiB0aGUgc2Vjb25kIG9wZXJhbmRcbiAqIEByZXR1cm5zIHt2ZWM0fSBvdXRcbiAqL1xudmVjNC5kaXZpZGUgPSBmdW5jdGlvbihvdXQsIGEsIGIpIHtcbiAgICBvdXRbMF0gPSBhWzBdIC8gYlswXTtcbiAgICBvdXRbMV0gPSBhWzFdIC8gYlsxXTtcbiAgICBvdXRbMl0gPSBhWzJdIC8gYlsyXTtcbiAgICBvdXRbM10gPSBhWzNdIC8gYlszXTtcbiAgICByZXR1cm4gb3V0O1xufTtcblxuLyoqXG4gKiBBbGlhcyBmb3Ige0BsaW5rIHZlYzQuZGl2aWRlfVxuICogQGZ1bmN0aW9uXG4gKi9cbnZlYzQuZGl2ID0gdmVjNC5kaXZpZGU7XG5cbi8qKlxuICogUmV0dXJucyB0aGUgbWluaW11bSBvZiB0d28gdmVjNCdzXG4gKlxuICogQHBhcmFtIHt2ZWM0fSBvdXQgdGhlIHJlY2VpdmluZyB2ZWN0b3JcbiAqIEBwYXJhbSB7dmVjNH0gYSB0aGUgZmlyc3Qgb3BlcmFuZFxuICogQHBhcmFtIHt2ZWM0fSBiIHRoZSBzZWNvbmQgb3BlcmFuZFxuICogQHJldHVybnMge3ZlYzR9IG91dFxuICovXG52ZWM0Lm1pbiA9IGZ1bmN0aW9uKG91dCwgYSwgYikge1xuICAgIG91dFswXSA9IE1hdGgubWluKGFbMF0sIGJbMF0pO1xuICAgIG91dFsxXSA9IE1hdGgubWluKGFbMV0sIGJbMV0pO1xuICAgIG91dFsyXSA9IE1hdGgubWluKGFbMl0sIGJbMl0pO1xuICAgIG91dFszXSA9IE1hdGgubWluKGFbM10sIGJbM10pO1xuICAgIHJldHVybiBvdXQ7XG59O1xuXG4vKipcbiAqIFJldHVybnMgdGhlIG1heGltdW0gb2YgdHdvIHZlYzQnc1xuICpcbiAqIEBwYXJhbSB7dmVjNH0gb3V0IHRoZSByZWNlaXZpbmcgdmVjdG9yXG4gKiBAcGFyYW0ge3ZlYzR9IGEgdGhlIGZpcnN0IG9wZXJhbmRcbiAqIEBwYXJhbSB7dmVjNH0gYiB0aGUgc2Vjb25kIG9wZXJhbmRcbiAqIEByZXR1cm5zIHt2ZWM0fSBvdXRcbiAqL1xudmVjNC5tYXggPSBmdW5jdGlvbihvdXQsIGEsIGIpIHtcbiAgICBvdXRbMF0gPSBNYXRoLm1heChhWzBdLCBiWzBdKTtcbiAgICBvdXRbMV0gPSBNYXRoLm1heChhWzFdLCBiWzFdKTtcbiAgICBvdXRbMl0gPSBNYXRoLm1heChhWzJdLCBiWzJdKTtcbiAgICBvdXRbM10gPSBNYXRoLm1heChhWzNdLCBiWzNdKTtcbiAgICByZXR1cm4gb3V0O1xufTtcblxuLyoqXG4gKiBTY2FsZXMgYSB2ZWM0IGJ5IGEgc2NhbGFyIG51bWJlclxuICpcbiAqIEBwYXJhbSB7dmVjNH0gb3V0IHRoZSByZWNlaXZpbmcgdmVjdG9yXG4gKiBAcGFyYW0ge3ZlYzR9IGEgdGhlIHZlY3RvciB0byBzY2FsZVxuICogQHBhcmFtIHtOdW1iZXJ9IGIgYW1vdW50IHRvIHNjYWxlIHRoZSB2ZWN0b3IgYnlcbiAqIEByZXR1cm5zIHt2ZWM0fSBvdXRcbiAqL1xudmVjNC5zY2FsZSA9IGZ1bmN0aW9uKG91dCwgYSwgYikge1xuICAgIG91dFswXSA9IGFbMF0gKiBiO1xuICAgIG91dFsxXSA9IGFbMV0gKiBiO1xuICAgIG91dFsyXSA9IGFbMl0gKiBiO1xuICAgIG91dFszXSA9IGFbM10gKiBiO1xuICAgIHJldHVybiBvdXQ7XG59O1xuXG4vKipcbiAqIEFkZHMgdHdvIHZlYzQncyBhZnRlciBzY2FsaW5nIHRoZSBzZWNvbmQgb3BlcmFuZCBieSBhIHNjYWxhciB2YWx1ZVxuICpcbiAqIEBwYXJhbSB7dmVjNH0gb3V0IHRoZSByZWNlaXZpbmcgdmVjdG9yXG4gKiBAcGFyYW0ge3ZlYzR9IGEgdGhlIGZpcnN0IG9wZXJhbmRcbiAqIEBwYXJhbSB7dmVjNH0gYiB0aGUgc2Vjb25kIG9wZXJhbmRcbiAqIEBwYXJhbSB7TnVtYmVyfSBzY2FsZSB0aGUgYW1vdW50IHRvIHNjYWxlIGIgYnkgYmVmb3JlIGFkZGluZ1xuICogQHJldHVybnMge3ZlYzR9IG91dFxuICovXG52ZWM0LnNjYWxlQW5kQWRkID0gZnVuY3Rpb24ob3V0LCBhLCBiLCBzY2FsZSkge1xuICAgIG91dFswXSA9IGFbMF0gKyAoYlswXSAqIHNjYWxlKTtcbiAgICBvdXRbMV0gPSBhWzFdICsgKGJbMV0gKiBzY2FsZSk7XG4gICAgb3V0WzJdID0gYVsyXSArIChiWzJdICogc2NhbGUpO1xuICAgIG91dFszXSA9IGFbM10gKyAoYlszXSAqIHNjYWxlKTtcbiAgICByZXR1cm4gb3V0O1xufTtcblxuLyoqXG4gKiBDYWxjdWxhdGVzIHRoZSBldWNsaWRpYW4gZGlzdGFuY2UgYmV0d2VlbiB0d28gdmVjNCdzXG4gKlxuICogQHBhcmFtIHt2ZWM0fSBhIHRoZSBmaXJzdCBvcGVyYW5kXG4gKiBAcGFyYW0ge3ZlYzR9IGIgdGhlIHNlY29uZCBvcGVyYW5kXG4gKiBAcmV0dXJucyB7TnVtYmVyfSBkaXN0YW5jZSBiZXR3ZWVuIGEgYW5kIGJcbiAqL1xudmVjNC5kaXN0YW5jZSA9IGZ1bmN0aW9uKGEsIGIpIHtcbiAgICB2YXIgeCA9IGJbMF0gLSBhWzBdLFxuICAgICAgICB5ID0gYlsxXSAtIGFbMV0sXG4gICAgICAgIHogPSBiWzJdIC0gYVsyXSxcbiAgICAgICAgdyA9IGJbM10gLSBhWzNdO1xuICAgIHJldHVybiBNYXRoLnNxcnQoeCp4ICsgeSp5ICsgeip6ICsgdyp3KTtcbn07XG5cbi8qKlxuICogQWxpYXMgZm9yIHtAbGluayB2ZWM0LmRpc3RhbmNlfVxuICogQGZ1bmN0aW9uXG4gKi9cbnZlYzQuZGlzdCA9IHZlYzQuZGlzdGFuY2U7XG5cbi8qKlxuICogQ2FsY3VsYXRlcyB0aGUgc3F1YXJlZCBldWNsaWRpYW4gZGlzdGFuY2UgYmV0d2VlbiB0d28gdmVjNCdzXG4gKlxuICogQHBhcmFtIHt2ZWM0fSBhIHRoZSBmaXJzdCBvcGVyYW5kXG4gKiBAcGFyYW0ge3ZlYzR9IGIgdGhlIHNlY29uZCBvcGVyYW5kXG4gKiBAcmV0dXJucyB7TnVtYmVyfSBzcXVhcmVkIGRpc3RhbmNlIGJldHdlZW4gYSBhbmQgYlxuICovXG52ZWM0LnNxdWFyZWREaXN0YW5jZSA9IGZ1bmN0aW9uKGEsIGIpIHtcbiAgICB2YXIgeCA9IGJbMF0gLSBhWzBdLFxuICAgICAgICB5ID0gYlsxXSAtIGFbMV0sXG4gICAgICAgIHogPSBiWzJdIC0gYVsyXSxcbiAgICAgICAgdyA9IGJbM10gLSBhWzNdO1xuICAgIHJldHVybiB4KnggKyB5KnkgKyB6KnogKyB3Knc7XG59O1xuXG4vKipcbiAqIEFsaWFzIGZvciB7QGxpbmsgdmVjNC5zcXVhcmVkRGlzdGFuY2V9XG4gKiBAZnVuY3Rpb25cbiAqL1xudmVjNC5zcXJEaXN0ID0gdmVjNC5zcXVhcmVkRGlzdGFuY2U7XG5cbi8qKlxuICogQ2FsY3VsYXRlcyB0aGUgbGVuZ3RoIG9mIGEgdmVjNFxuICpcbiAqIEBwYXJhbSB7dmVjNH0gYSB2ZWN0b3IgdG8gY2FsY3VsYXRlIGxlbmd0aCBvZlxuICogQHJldHVybnMge051bWJlcn0gbGVuZ3RoIG9mIGFcbiAqL1xudmVjNC5sZW5ndGggPSBmdW5jdGlvbiAoYSkge1xuICAgIHZhciB4ID0gYVswXSxcbiAgICAgICAgeSA9IGFbMV0sXG4gICAgICAgIHogPSBhWzJdLFxuICAgICAgICB3ID0gYVszXTtcbiAgICByZXR1cm4gTWF0aC5zcXJ0KHgqeCArIHkqeSArIHoqeiArIHcqdyk7XG59O1xuXG4vKipcbiAqIEFsaWFzIGZvciB7QGxpbmsgdmVjNC5sZW5ndGh9XG4gKiBAZnVuY3Rpb25cbiAqL1xudmVjNC5sZW4gPSB2ZWM0Lmxlbmd0aDtcblxuLyoqXG4gKiBDYWxjdWxhdGVzIHRoZSBzcXVhcmVkIGxlbmd0aCBvZiBhIHZlYzRcbiAqXG4gKiBAcGFyYW0ge3ZlYzR9IGEgdmVjdG9yIHRvIGNhbGN1bGF0ZSBzcXVhcmVkIGxlbmd0aCBvZlxuICogQHJldHVybnMge051bWJlcn0gc3F1YXJlZCBsZW5ndGggb2YgYVxuICovXG52ZWM0LnNxdWFyZWRMZW5ndGggPSBmdW5jdGlvbiAoYSkge1xuICAgIHZhciB4ID0gYVswXSxcbiAgICAgICAgeSA9IGFbMV0sXG4gICAgICAgIHogPSBhWzJdLFxuICAgICAgICB3ID0gYVszXTtcbiAgICByZXR1cm4geCp4ICsgeSp5ICsgeip6ICsgdyp3O1xufTtcblxuLyoqXG4gKiBBbGlhcyBmb3Ige0BsaW5rIHZlYzQuc3F1YXJlZExlbmd0aH1cbiAqIEBmdW5jdGlvblxuICovXG52ZWM0LnNxckxlbiA9IHZlYzQuc3F1YXJlZExlbmd0aDtcblxuLyoqXG4gKiBOZWdhdGVzIHRoZSBjb21wb25lbnRzIG9mIGEgdmVjNFxuICpcbiAqIEBwYXJhbSB7dmVjNH0gb3V0IHRoZSByZWNlaXZpbmcgdmVjdG9yXG4gKiBAcGFyYW0ge3ZlYzR9IGEgdmVjdG9yIHRvIG5lZ2F0ZVxuICogQHJldHVybnMge3ZlYzR9IG91dFxuICovXG52ZWM0Lm5lZ2F0ZSA9IGZ1bmN0aW9uKG91dCwgYSkge1xuICAgIG91dFswXSA9IC1hWzBdO1xuICAgIG91dFsxXSA9IC1hWzFdO1xuICAgIG91dFsyXSA9IC1hWzJdO1xuICAgIG91dFszXSA9IC1hWzNdO1xuICAgIHJldHVybiBvdXQ7XG59O1xuXG4vKipcbiAqIE5vcm1hbGl6ZSBhIHZlYzRcbiAqXG4gKiBAcGFyYW0ge3ZlYzR9IG91dCB0aGUgcmVjZWl2aW5nIHZlY3RvclxuICogQHBhcmFtIHt2ZWM0fSBhIHZlY3RvciB0byBub3JtYWxpemVcbiAqIEByZXR1cm5zIHt2ZWM0fSBvdXRcbiAqL1xudmVjNC5ub3JtYWxpemUgPSBmdW5jdGlvbihvdXQsIGEpIHtcbiAgICB2YXIgeCA9IGFbMF0sXG4gICAgICAgIHkgPSBhWzFdLFxuICAgICAgICB6ID0gYVsyXSxcbiAgICAgICAgdyA9IGFbM107XG4gICAgdmFyIGxlbiA9IHgqeCArIHkqeSArIHoqeiArIHcqdztcbiAgICBpZiAobGVuID4gMCkge1xuICAgICAgICBsZW4gPSAxIC8gTWF0aC5zcXJ0KGxlbik7XG4gICAgICAgIG91dFswXSA9IGFbMF0gKiBsZW47XG4gICAgICAgIG91dFsxXSA9IGFbMV0gKiBsZW47XG4gICAgICAgIG91dFsyXSA9IGFbMl0gKiBsZW47XG4gICAgICAgIG91dFszXSA9IGFbM10gKiBsZW47XG4gICAgfVxuICAgIHJldHVybiBvdXQ7XG59O1xuXG4vKipcbiAqIENhbGN1bGF0ZXMgdGhlIGRvdCBwcm9kdWN0IG9mIHR3byB2ZWM0J3NcbiAqXG4gKiBAcGFyYW0ge3ZlYzR9IGEgdGhlIGZpcnN0IG9wZXJhbmRcbiAqIEBwYXJhbSB7dmVjNH0gYiB0aGUgc2Vjb25kIG9wZXJhbmRcbiAqIEByZXR1cm5zIHtOdW1iZXJ9IGRvdCBwcm9kdWN0IG9mIGEgYW5kIGJcbiAqL1xudmVjNC5kb3QgPSBmdW5jdGlvbiAoYSwgYikge1xuICAgIHJldHVybiBhWzBdICogYlswXSArIGFbMV0gKiBiWzFdICsgYVsyXSAqIGJbMl0gKyBhWzNdICogYlszXTtcbn07XG5cbi8qKlxuICogUGVyZm9ybXMgYSBsaW5lYXIgaW50ZXJwb2xhdGlvbiBiZXR3ZWVuIHR3byB2ZWM0J3NcbiAqXG4gKiBAcGFyYW0ge3ZlYzR9IG91dCB0aGUgcmVjZWl2aW5nIHZlY3RvclxuICogQHBhcmFtIHt2ZWM0fSBhIHRoZSBmaXJzdCBvcGVyYW5kXG4gKiBAcGFyYW0ge3ZlYzR9IGIgdGhlIHNlY29uZCBvcGVyYW5kXG4gKiBAcGFyYW0ge051bWJlcn0gdCBpbnRlcnBvbGF0aW9uIGFtb3VudCBiZXR3ZWVuIHRoZSB0d28gaW5wdXRzXG4gKiBAcmV0dXJucyB7dmVjNH0gb3V0XG4gKi9cbnZlYzQubGVycCA9IGZ1bmN0aW9uIChvdXQsIGEsIGIsIHQpIHtcbiAgICB2YXIgYXggPSBhWzBdLFxuICAgICAgICBheSA9IGFbMV0sXG4gICAgICAgIGF6ID0gYVsyXSxcbiAgICAgICAgYXcgPSBhWzNdO1xuICAgIG91dFswXSA9IGF4ICsgdCAqIChiWzBdIC0gYXgpO1xuICAgIG91dFsxXSA9IGF5ICsgdCAqIChiWzFdIC0gYXkpO1xuICAgIG91dFsyXSA9IGF6ICsgdCAqIChiWzJdIC0gYXopO1xuICAgIG91dFszXSA9IGF3ICsgdCAqIChiWzNdIC0gYXcpO1xuICAgIHJldHVybiBvdXQ7XG59O1xuXG4vKipcbiAqIEdlbmVyYXRlcyBhIHJhbmRvbSB2ZWN0b3Igd2l0aCB0aGUgZ2l2ZW4gc2NhbGVcbiAqXG4gKiBAcGFyYW0ge3ZlYzR9IG91dCB0aGUgcmVjZWl2aW5nIHZlY3RvclxuICogQHBhcmFtIHtOdW1iZXJ9IFtzY2FsZV0gTGVuZ3RoIG9mIHRoZSByZXN1bHRpbmcgdmVjdG9yLiBJZiBvbW1pdHRlZCwgYSB1bml0IHZlY3RvciB3aWxsIGJlIHJldHVybmVkXG4gKiBAcmV0dXJucyB7dmVjNH0gb3V0XG4gKi9cbnZlYzQucmFuZG9tID0gZnVuY3Rpb24gKG91dCwgc2NhbGUpIHtcbiAgICBzY2FsZSA9IHNjYWxlIHx8IDEuMDtcblxuICAgIC8vVE9ETzogVGhpcyBpcyBhIHByZXR0eSBhd2Z1bCB3YXkgb2YgZG9pbmcgdGhpcy4gRmluZCBzb21ldGhpbmcgYmV0dGVyLlxuICAgIG91dFswXSA9IEdMTUFUX1JBTkRPTSgpO1xuICAgIG91dFsxXSA9IEdMTUFUX1JBTkRPTSgpO1xuICAgIG91dFsyXSA9IEdMTUFUX1JBTkRPTSgpO1xuICAgIG91dFszXSA9IEdMTUFUX1JBTkRPTSgpO1xuICAgIHZlYzQubm9ybWFsaXplKG91dCwgb3V0KTtcbiAgICB2ZWM0LnNjYWxlKG91dCwgb3V0LCBzY2FsZSk7XG4gICAgcmV0dXJuIG91dDtcbn07XG5cbi8qKlxuICogVHJhbnNmb3JtcyB0aGUgdmVjNCB3aXRoIGEgbWF0NC5cbiAqXG4gKiBAcGFyYW0ge3ZlYzR9IG91dCB0aGUgcmVjZWl2aW5nIHZlY3RvclxuICogQHBhcmFtIHt2ZWM0fSBhIHRoZSB2ZWN0b3IgdG8gdHJhbnNmb3JtXG4gKiBAcGFyYW0ge21hdDR9IG0gbWF0cml4IHRvIHRyYW5zZm9ybSB3aXRoXG4gKiBAcmV0dXJucyB7dmVjNH0gb3V0XG4gKi9cbnZlYzQudHJhbnNmb3JtTWF0NCA9IGZ1bmN0aW9uKG91dCwgYSwgbSkge1xuICAgIHZhciB4ID0gYVswXSwgeSA9IGFbMV0sIHogPSBhWzJdLCB3ID0gYVszXTtcbiAgICBvdXRbMF0gPSBtWzBdICogeCArIG1bNF0gKiB5ICsgbVs4XSAqIHogKyBtWzEyXSAqIHc7XG4gICAgb3V0WzFdID0gbVsxXSAqIHggKyBtWzVdICogeSArIG1bOV0gKiB6ICsgbVsxM10gKiB3O1xuICAgIG91dFsyXSA9IG1bMl0gKiB4ICsgbVs2XSAqIHkgKyBtWzEwXSAqIHogKyBtWzE0XSAqIHc7XG4gICAgb3V0WzNdID0gbVszXSAqIHggKyBtWzddICogeSArIG1bMTFdICogeiArIG1bMTVdICogdztcbiAgICByZXR1cm4gb3V0O1xufTtcblxuLyoqXG4gKiBUcmFuc2Zvcm1zIHRoZSB2ZWM0IHdpdGggYSBxdWF0XG4gKlxuICogQHBhcmFtIHt2ZWM0fSBvdXQgdGhlIHJlY2VpdmluZyB2ZWN0b3JcbiAqIEBwYXJhbSB7dmVjNH0gYSB0aGUgdmVjdG9yIHRvIHRyYW5zZm9ybVxuICogQHBhcmFtIHtxdWF0fSBxIHF1YXRlcm5pb24gdG8gdHJhbnNmb3JtIHdpdGhcbiAqIEByZXR1cm5zIHt2ZWM0fSBvdXRcbiAqL1xudmVjNC50cmFuc2Zvcm1RdWF0ID0gZnVuY3Rpb24ob3V0LCBhLCBxKSB7XG4gICAgdmFyIHggPSBhWzBdLCB5ID0gYVsxXSwgeiA9IGFbMl0sXG4gICAgICAgIHF4ID0gcVswXSwgcXkgPSBxWzFdLCBxeiA9IHFbMl0sIHF3ID0gcVszXSxcblxuICAgICAgICAvLyBjYWxjdWxhdGUgcXVhdCAqIHZlY1xuICAgICAgICBpeCA9IHF3ICogeCArIHF5ICogeiAtIHF6ICogeSxcbiAgICAgICAgaXkgPSBxdyAqIHkgKyBxeiAqIHggLSBxeCAqIHosXG4gICAgICAgIGl6ID0gcXcgKiB6ICsgcXggKiB5IC0gcXkgKiB4LFxuICAgICAgICBpdyA9IC1xeCAqIHggLSBxeSAqIHkgLSBxeiAqIHo7XG5cbiAgICAvLyBjYWxjdWxhdGUgcmVzdWx0ICogaW52ZXJzZSBxdWF0XG4gICAgb3V0WzBdID0gaXggKiBxdyArIGl3ICogLXF4ICsgaXkgKiAtcXogLSBpeiAqIC1xeTtcbiAgICBvdXRbMV0gPSBpeSAqIHF3ICsgaXcgKiAtcXkgKyBpeiAqIC1xeCAtIGl4ICogLXF6O1xuICAgIG91dFsyXSA9IGl6ICogcXcgKyBpdyAqIC1xeiArIGl4ICogLXF5IC0gaXkgKiAtcXg7XG4gICAgcmV0dXJuIG91dDtcbn07XG5cbi8qKlxuICogUGVyZm9ybSBzb21lIG9wZXJhdGlvbiBvdmVyIGFuIGFycmF5IG9mIHZlYzRzLlxuICpcbiAqIEBwYXJhbSB7QXJyYXl9IGEgdGhlIGFycmF5IG9mIHZlY3RvcnMgdG8gaXRlcmF0ZSBvdmVyXG4gKiBAcGFyYW0ge051bWJlcn0gc3RyaWRlIE51bWJlciBvZiBlbGVtZW50cyBiZXR3ZWVuIHRoZSBzdGFydCBvZiBlYWNoIHZlYzQuIElmIDAgYXNzdW1lcyB0aWdodGx5IHBhY2tlZFxuICogQHBhcmFtIHtOdW1iZXJ9IG9mZnNldCBOdW1iZXIgb2YgZWxlbWVudHMgdG8gc2tpcCBhdCB0aGUgYmVnaW5uaW5nIG9mIHRoZSBhcnJheVxuICogQHBhcmFtIHtOdW1iZXJ9IGNvdW50IE51bWJlciBvZiB2ZWMycyB0byBpdGVyYXRlIG92ZXIuIElmIDAgaXRlcmF0ZXMgb3ZlciBlbnRpcmUgYXJyYXlcbiAqIEBwYXJhbSB7RnVuY3Rpb259IGZuIEZ1bmN0aW9uIHRvIGNhbGwgZm9yIGVhY2ggdmVjdG9yIGluIHRoZSBhcnJheVxuICogQHBhcmFtIHtPYmplY3R9IFthcmddIGFkZGl0aW9uYWwgYXJndW1lbnQgdG8gcGFzcyB0byBmblxuICogQHJldHVybnMge0FycmF5fSBhXG4gKiBAZnVuY3Rpb25cbiAqL1xudmVjNC5mb3JFYWNoID0gKGZ1bmN0aW9uKCkge1xuICAgIHZhciB2ZWMgPSB2ZWM0LmNyZWF0ZSgpO1xuXG4gICAgcmV0dXJuIGZ1bmN0aW9uKGEsIHN0cmlkZSwgb2Zmc2V0LCBjb3VudCwgZm4sIGFyZykge1xuICAgICAgICB2YXIgaSwgbDtcbiAgICAgICAgaWYoIXN0cmlkZSkge1xuICAgICAgICAgICAgc3RyaWRlID0gNDtcbiAgICAgICAgfVxuXG4gICAgICAgIGlmKCFvZmZzZXQpIHtcbiAgICAgICAgICAgIG9mZnNldCA9IDA7XG4gICAgICAgIH1cbiAgICAgICAgXG4gICAgICAgIGlmKGNvdW50KSB7XG4gICAgICAgICAgICBsID0gTWF0aC5taW4oKGNvdW50ICogc3RyaWRlKSArIG9mZnNldCwgYS5sZW5ndGgpO1xuICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgbCA9IGEubGVuZ3RoO1xuICAgICAgICB9XG5cbiAgICAgICAgZm9yKGkgPSBvZmZzZXQ7IGkgPCBsOyBpICs9IHN0cmlkZSkge1xuICAgICAgICAgICAgdmVjWzBdID0gYVtpXTsgdmVjWzFdID0gYVtpKzFdOyB2ZWNbMl0gPSBhW2krMl07IHZlY1szXSA9IGFbaSszXTtcbiAgICAgICAgICAgIGZuKHZlYywgdmVjLCBhcmcpO1xuICAgICAgICAgICAgYVtpXSA9IHZlY1swXTsgYVtpKzFdID0gdmVjWzFdOyBhW2krMl0gPSB2ZWNbMl07IGFbaSszXSA9IHZlY1szXTtcbiAgICAgICAgfVxuICAgICAgICBcbiAgICAgICAgcmV0dXJuIGE7XG4gICAgfTtcbn0pKCk7XG5cbi8qKlxuICogUmV0dXJucyBhIHN0cmluZyByZXByZXNlbnRhdGlvbiBvZiBhIHZlY3RvclxuICpcbiAqIEBwYXJhbSB7dmVjNH0gdmVjIHZlY3RvciB0byByZXByZXNlbnQgYXMgYSBzdHJpbmdcbiAqIEByZXR1cm5zIHtTdHJpbmd9IHN0cmluZyByZXByZXNlbnRhdGlvbiBvZiB0aGUgdmVjdG9yXG4gKi9cbnZlYzQuc3RyID0gZnVuY3Rpb24gKGEpIHtcbiAgICByZXR1cm4gJ3ZlYzQoJyArIGFbMF0gKyAnLCAnICsgYVsxXSArICcsICcgKyBhWzJdICsgJywgJyArIGFbM10gKyAnKSc7XG59O1xuXG5pZih0eXBlb2YoZXhwb3J0cykgIT09ICd1bmRlZmluZWQnKSB7XG4gICAgZXhwb3J0cy52ZWM0ID0gdmVjNDtcbn1cbjtcbi8qIENvcHlyaWdodCAoYykgMjAxMywgQnJhbmRvbiBKb25lcywgQ29saW4gTWFjS2VuemllIElWLiBBbGwgcmlnaHRzIHJlc2VydmVkLlxuXG5SZWRpc3RyaWJ1dGlvbiBhbmQgdXNlIGluIHNvdXJjZSBhbmQgYmluYXJ5IGZvcm1zLCB3aXRoIG9yIHdpdGhvdXQgbW9kaWZpY2F0aW9uLFxuYXJlIHBlcm1pdHRlZCBwcm92aWRlZCB0aGF0IHRoZSBmb2xsb3dpbmcgY29uZGl0aW9ucyBhcmUgbWV0OlxuXG4gICogUmVkaXN0cmlidXRpb25zIG9mIHNvdXJjZSBjb2RlIG11c3QgcmV0YWluIHRoZSBhYm92ZSBjb3B5cmlnaHQgbm90aWNlLCB0aGlzXG4gICAgbGlzdCBvZiBjb25kaXRpb25zIGFuZCB0aGUgZm9sbG93aW5nIGRpc2NsYWltZXIuXG4gICogUmVkaXN0cmlidXRpb25zIGluIGJpbmFyeSBmb3JtIG11c3QgcmVwcm9kdWNlIHRoZSBhYm92ZSBjb3B5cmlnaHQgbm90aWNlLFxuICAgIHRoaXMgbGlzdCBvZiBjb25kaXRpb25zIGFuZCB0aGUgZm9sbG93aW5nIGRpc2NsYWltZXIgaW4gdGhlIGRvY3VtZW50YXRpb24gXG4gICAgYW5kL29yIG90aGVyIG1hdGVyaWFscyBwcm92aWRlZCB3aXRoIHRoZSBkaXN0cmlidXRpb24uXG5cblRISVMgU09GVFdBUkUgSVMgUFJPVklERUQgQlkgVEhFIENPUFlSSUdIVCBIT0xERVJTIEFORCBDT05UUklCVVRPUlMgXCJBUyBJU1wiIEFORFxuQU5ZIEVYUFJFU1MgT1IgSU1QTElFRCBXQVJSQU5USUVTLCBJTkNMVURJTkcsIEJVVCBOT1QgTElNSVRFRCBUTywgVEhFIElNUExJRURcbldBUlJBTlRJRVMgT0YgTUVSQ0hBTlRBQklMSVRZIEFORCBGSVRORVNTIEZPUiBBIFBBUlRJQ1VMQVIgUFVSUE9TRSBBUkUgXG5ESVNDTEFJTUVELiBJTiBOTyBFVkVOVCBTSEFMTCBUSEUgQ09QWVJJR0hUIEhPTERFUiBPUiBDT05UUklCVVRPUlMgQkUgTElBQkxFIEZPUlxuQU5ZIERJUkVDVCwgSU5ESVJFQ1QsIElOQ0lERU5UQUwsIFNQRUNJQUwsIEVYRU1QTEFSWSwgT1IgQ09OU0VRVUVOVElBTCBEQU1BR0VTXG4oSU5DTFVESU5HLCBCVVQgTk9UIExJTUlURUQgVE8sIFBST0NVUkVNRU5UIE9GIFNVQlNUSVRVVEUgR09PRFMgT1IgU0VSVklDRVM7XG5MT1NTIE9GIFVTRSwgREFUQSwgT1IgUFJPRklUUzsgT1IgQlVTSU5FU1MgSU5URVJSVVBUSU9OKSBIT1dFVkVSIENBVVNFRCBBTkQgT05cbkFOWSBUSEVPUlkgT0YgTElBQklMSVRZLCBXSEVUSEVSIElOIENPTlRSQUNULCBTVFJJQ1QgTElBQklMSVRZLCBPUiBUT1JUXG4oSU5DTFVESU5HIE5FR0xJR0VOQ0UgT1IgT1RIRVJXSVNFKSBBUklTSU5HIElOIEFOWSBXQVkgT1VUIE9GIFRIRSBVU0UgT0YgVEhJU1xuU09GVFdBUkUsIEVWRU4gSUYgQURWSVNFRCBPRiBUSEUgUE9TU0lCSUxJVFkgT0YgU1VDSCBEQU1BR0UuICovXG5cbi8qKlxuICogQGNsYXNzIDJ4MiBNYXRyaXhcbiAqIEBuYW1lIG1hdDJcbiAqL1xuXG52YXIgbWF0MiA9IHt9O1xuXG4vKipcbiAqIENyZWF0ZXMgYSBuZXcgaWRlbnRpdHkgbWF0MlxuICpcbiAqIEByZXR1cm5zIHttYXQyfSBhIG5ldyAyeDIgbWF0cml4XG4gKi9cbm1hdDIuY3JlYXRlID0gZnVuY3Rpb24oKSB7XG4gICAgdmFyIG91dCA9IG5ldyBHTE1BVF9BUlJBWV9UWVBFKDQpO1xuICAgIG91dFswXSA9IDE7XG4gICAgb3V0WzFdID0gMDtcbiAgICBvdXRbMl0gPSAwO1xuICAgIG91dFszXSA9IDE7XG4gICAgcmV0dXJuIG91dDtcbn07XG5cbi8qKlxuICogQ3JlYXRlcyBhIG5ldyBtYXQyIGluaXRpYWxpemVkIHdpdGggdmFsdWVzIGZyb20gYW4gZXhpc3RpbmcgbWF0cml4XG4gKlxuICogQHBhcmFtIHttYXQyfSBhIG1hdHJpeCB0byBjbG9uZVxuICogQHJldHVybnMge21hdDJ9IGEgbmV3IDJ4MiBtYXRyaXhcbiAqL1xubWF0Mi5jbG9uZSA9IGZ1bmN0aW9uKGEpIHtcbiAgICB2YXIgb3V0ID0gbmV3IEdMTUFUX0FSUkFZX1RZUEUoNCk7XG4gICAgb3V0WzBdID0gYVswXTtcbiAgICBvdXRbMV0gPSBhWzFdO1xuICAgIG91dFsyXSA9IGFbMl07XG4gICAgb3V0WzNdID0gYVszXTtcbiAgICByZXR1cm4gb3V0O1xufTtcblxuLyoqXG4gKiBDb3B5IHRoZSB2YWx1ZXMgZnJvbSBvbmUgbWF0MiB0byBhbm90aGVyXG4gKlxuICogQHBhcmFtIHttYXQyfSBvdXQgdGhlIHJlY2VpdmluZyBtYXRyaXhcbiAqIEBwYXJhbSB7bWF0Mn0gYSB0aGUgc291cmNlIG1hdHJpeFxuICogQHJldHVybnMge21hdDJ9IG91dFxuICovXG5tYXQyLmNvcHkgPSBmdW5jdGlvbihvdXQsIGEpIHtcbiAgICBvdXRbMF0gPSBhWzBdO1xuICAgIG91dFsxXSA9IGFbMV07XG4gICAgb3V0WzJdID0gYVsyXTtcbiAgICBvdXRbM10gPSBhWzNdO1xuICAgIHJldHVybiBvdXQ7XG59O1xuXG4vKipcbiAqIFNldCBhIG1hdDIgdG8gdGhlIGlkZW50aXR5IG1hdHJpeFxuICpcbiAqIEBwYXJhbSB7bWF0Mn0gb3V0IHRoZSByZWNlaXZpbmcgbWF0cml4XG4gKiBAcmV0dXJucyB7bWF0Mn0gb3V0XG4gKi9cbm1hdDIuaWRlbnRpdHkgPSBmdW5jdGlvbihvdXQpIHtcbiAgICBvdXRbMF0gPSAxO1xuICAgIG91dFsxXSA9IDA7XG4gICAgb3V0WzJdID0gMDtcbiAgICBvdXRbM10gPSAxO1xuICAgIHJldHVybiBvdXQ7XG59O1xuXG4vKipcbiAqIFRyYW5zcG9zZSB0aGUgdmFsdWVzIG9mIGEgbWF0MlxuICpcbiAqIEBwYXJhbSB7bWF0Mn0gb3V0IHRoZSByZWNlaXZpbmcgbWF0cml4XG4gKiBAcGFyYW0ge21hdDJ9IGEgdGhlIHNvdXJjZSBtYXRyaXhcbiAqIEByZXR1cm5zIHttYXQyfSBvdXRcbiAqL1xubWF0Mi50cmFuc3Bvc2UgPSBmdW5jdGlvbihvdXQsIGEpIHtcbiAgICAvLyBJZiB3ZSBhcmUgdHJhbnNwb3Npbmcgb3Vyc2VsdmVzIHdlIGNhbiBza2lwIGEgZmV3IHN0ZXBzIGJ1dCBoYXZlIHRvIGNhY2hlIHNvbWUgdmFsdWVzXG4gICAgaWYgKG91dCA9PT0gYSkge1xuICAgICAgICB2YXIgYTEgPSBhWzFdO1xuICAgICAgICBvdXRbMV0gPSBhWzJdO1xuICAgICAgICBvdXRbMl0gPSBhMTtcbiAgICB9IGVsc2Uge1xuICAgICAgICBvdXRbMF0gPSBhWzBdO1xuICAgICAgICBvdXRbMV0gPSBhWzJdO1xuICAgICAgICBvdXRbMl0gPSBhWzFdO1xuICAgICAgICBvdXRbM10gPSBhWzNdO1xuICAgIH1cbiAgICBcbiAgICByZXR1cm4gb3V0O1xufTtcblxuLyoqXG4gKiBJbnZlcnRzIGEgbWF0MlxuICpcbiAqIEBwYXJhbSB7bWF0Mn0gb3V0IHRoZSByZWNlaXZpbmcgbWF0cml4XG4gKiBAcGFyYW0ge21hdDJ9IGEgdGhlIHNvdXJjZSBtYXRyaXhcbiAqIEByZXR1cm5zIHttYXQyfSBvdXRcbiAqL1xubWF0Mi5pbnZlcnQgPSBmdW5jdGlvbihvdXQsIGEpIHtcbiAgICB2YXIgYTAgPSBhWzBdLCBhMSA9IGFbMV0sIGEyID0gYVsyXSwgYTMgPSBhWzNdLFxuXG4gICAgICAgIC8vIENhbGN1bGF0ZSB0aGUgZGV0ZXJtaW5hbnRcbiAgICAgICAgZGV0ID0gYTAgKiBhMyAtIGEyICogYTE7XG5cbiAgICBpZiAoIWRldCkge1xuICAgICAgICByZXR1cm4gbnVsbDtcbiAgICB9XG4gICAgZGV0ID0gMS4wIC8gZGV0O1xuICAgIFxuICAgIG91dFswXSA9ICBhMyAqIGRldDtcbiAgICBvdXRbMV0gPSAtYTEgKiBkZXQ7XG4gICAgb3V0WzJdID0gLWEyICogZGV0O1xuICAgIG91dFszXSA9ICBhMCAqIGRldDtcblxuICAgIHJldHVybiBvdXQ7XG59O1xuXG4vKipcbiAqIENhbGN1bGF0ZXMgdGhlIGFkanVnYXRlIG9mIGEgbWF0MlxuICpcbiAqIEBwYXJhbSB7bWF0Mn0gb3V0IHRoZSByZWNlaXZpbmcgbWF0cml4XG4gKiBAcGFyYW0ge21hdDJ9IGEgdGhlIHNvdXJjZSBtYXRyaXhcbiAqIEByZXR1cm5zIHttYXQyfSBvdXRcbiAqL1xubWF0Mi5hZGpvaW50ID0gZnVuY3Rpb24ob3V0LCBhKSB7XG4gICAgLy8gQ2FjaGluZyB0aGlzIHZhbHVlIGlzIG5lc3NlY2FyeSBpZiBvdXQgPT0gYVxuICAgIHZhciBhMCA9IGFbMF07XG4gICAgb3V0WzBdID0gIGFbM107XG4gICAgb3V0WzFdID0gLWFbMV07XG4gICAgb3V0WzJdID0gLWFbMl07XG4gICAgb3V0WzNdID0gIGEwO1xuXG4gICAgcmV0dXJuIG91dDtcbn07XG5cbi8qKlxuICogQ2FsY3VsYXRlcyB0aGUgZGV0ZXJtaW5hbnQgb2YgYSBtYXQyXG4gKlxuICogQHBhcmFtIHttYXQyfSBhIHRoZSBzb3VyY2UgbWF0cml4XG4gKiBAcmV0dXJucyB7TnVtYmVyfSBkZXRlcm1pbmFudCBvZiBhXG4gKi9cbm1hdDIuZGV0ZXJtaW5hbnQgPSBmdW5jdGlvbiAoYSkge1xuICAgIHJldHVybiBhWzBdICogYVszXSAtIGFbMl0gKiBhWzFdO1xufTtcblxuLyoqXG4gKiBNdWx0aXBsaWVzIHR3byBtYXQyJ3NcbiAqXG4gKiBAcGFyYW0ge21hdDJ9IG91dCB0aGUgcmVjZWl2aW5nIG1hdHJpeFxuICogQHBhcmFtIHttYXQyfSBhIHRoZSBmaXJzdCBvcGVyYW5kXG4gKiBAcGFyYW0ge21hdDJ9IGIgdGhlIHNlY29uZCBvcGVyYW5kXG4gKiBAcmV0dXJucyB7bWF0Mn0gb3V0XG4gKi9cbm1hdDIubXVsdGlwbHkgPSBmdW5jdGlvbiAob3V0LCBhLCBiKSB7XG4gICAgdmFyIGEwID0gYVswXSwgYTEgPSBhWzFdLCBhMiA9IGFbMl0sIGEzID0gYVszXTtcbiAgICB2YXIgYjAgPSBiWzBdLCBiMSA9IGJbMV0sIGIyID0gYlsyXSwgYjMgPSBiWzNdO1xuICAgIG91dFswXSA9IGEwICogYjAgKyBhMiAqIGIxO1xuICAgIG91dFsxXSA9IGExICogYjAgKyBhMyAqIGIxO1xuICAgIG91dFsyXSA9IGEwICogYjIgKyBhMiAqIGIzO1xuICAgIG91dFszXSA9IGExICogYjIgKyBhMyAqIGIzO1xuICAgIHJldHVybiBvdXQ7XG59O1xuXG4vKipcbiAqIEFsaWFzIGZvciB7QGxpbmsgbWF0Mi5tdWx0aXBseX1cbiAqIEBmdW5jdGlvblxuICovXG5tYXQyLm11bCA9IG1hdDIubXVsdGlwbHk7XG5cbi8qKlxuICogUm90YXRlcyBhIG1hdDIgYnkgdGhlIGdpdmVuIGFuZ2xlXG4gKlxuICogQHBhcmFtIHttYXQyfSBvdXQgdGhlIHJlY2VpdmluZyBtYXRyaXhcbiAqIEBwYXJhbSB7bWF0Mn0gYSB0aGUgbWF0cml4IHRvIHJvdGF0ZVxuICogQHBhcmFtIHtOdW1iZXJ9IHJhZCB0aGUgYW5nbGUgdG8gcm90YXRlIHRoZSBtYXRyaXggYnlcbiAqIEByZXR1cm5zIHttYXQyfSBvdXRcbiAqL1xubWF0Mi5yb3RhdGUgPSBmdW5jdGlvbiAob3V0LCBhLCByYWQpIHtcbiAgICB2YXIgYTAgPSBhWzBdLCBhMSA9IGFbMV0sIGEyID0gYVsyXSwgYTMgPSBhWzNdLFxuICAgICAgICBzID0gTWF0aC5zaW4ocmFkKSxcbiAgICAgICAgYyA9IE1hdGguY29zKHJhZCk7XG4gICAgb3V0WzBdID0gYTAgKiAgYyArIGEyICogcztcbiAgICBvdXRbMV0gPSBhMSAqICBjICsgYTMgKiBzO1xuICAgIG91dFsyXSA9IGEwICogLXMgKyBhMiAqIGM7XG4gICAgb3V0WzNdID0gYTEgKiAtcyArIGEzICogYztcbiAgICByZXR1cm4gb3V0O1xufTtcblxuLyoqXG4gKiBTY2FsZXMgdGhlIG1hdDIgYnkgdGhlIGRpbWVuc2lvbnMgaW4gdGhlIGdpdmVuIHZlYzJcbiAqXG4gKiBAcGFyYW0ge21hdDJ9IG91dCB0aGUgcmVjZWl2aW5nIG1hdHJpeFxuICogQHBhcmFtIHttYXQyfSBhIHRoZSBtYXRyaXggdG8gcm90YXRlXG4gKiBAcGFyYW0ge3ZlYzJ9IHYgdGhlIHZlYzIgdG8gc2NhbGUgdGhlIG1hdHJpeCBieVxuICogQHJldHVybnMge21hdDJ9IG91dFxuICoqL1xubWF0Mi5zY2FsZSA9IGZ1bmN0aW9uKG91dCwgYSwgdikge1xuICAgIHZhciBhMCA9IGFbMF0sIGExID0gYVsxXSwgYTIgPSBhWzJdLCBhMyA9IGFbM10sXG4gICAgICAgIHYwID0gdlswXSwgdjEgPSB2WzFdO1xuICAgIG91dFswXSA9IGEwICogdjA7XG4gICAgb3V0WzFdID0gYTEgKiB2MDtcbiAgICBvdXRbMl0gPSBhMiAqIHYxO1xuICAgIG91dFszXSA9IGEzICogdjE7XG4gICAgcmV0dXJuIG91dDtcbn07XG5cbi8qKlxuICogUmV0dXJucyBhIHN0cmluZyByZXByZXNlbnRhdGlvbiBvZiBhIG1hdDJcbiAqXG4gKiBAcGFyYW0ge21hdDJ9IG1hdCBtYXRyaXggdG8gcmVwcmVzZW50IGFzIGEgc3RyaW5nXG4gKiBAcmV0dXJucyB7U3RyaW5nfSBzdHJpbmcgcmVwcmVzZW50YXRpb24gb2YgdGhlIG1hdHJpeFxuICovXG5tYXQyLnN0ciA9IGZ1bmN0aW9uIChhKSB7XG4gICAgcmV0dXJuICdtYXQyKCcgKyBhWzBdICsgJywgJyArIGFbMV0gKyAnLCAnICsgYVsyXSArICcsICcgKyBhWzNdICsgJyknO1xufTtcblxuLyoqXG4gKiBSZXR1cm5zIEZyb2Jlbml1cyBub3JtIG9mIGEgbWF0MlxuICpcbiAqIEBwYXJhbSB7bWF0Mn0gYSB0aGUgbWF0cml4IHRvIGNhbGN1bGF0ZSBGcm9iZW5pdXMgbm9ybSBvZlxuICogQHJldHVybnMge051bWJlcn0gRnJvYmVuaXVzIG5vcm1cbiAqL1xubWF0Mi5mcm9iID0gZnVuY3Rpb24gKGEpIHtcbiAgICByZXR1cm4oTWF0aC5zcXJ0KE1hdGgucG93KGFbMF0sIDIpICsgTWF0aC5wb3coYVsxXSwgMikgKyBNYXRoLnBvdyhhWzJdLCAyKSArIE1hdGgucG93KGFbM10sIDIpKSlcbn07XG5cbi8qKlxuICogUmV0dXJucyBMLCBEIGFuZCBVIG1hdHJpY2VzIChMb3dlciB0cmlhbmd1bGFyLCBEaWFnb25hbCBhbmQgVXBwZXIgdHJpYW5ndWxhcikgYnkgZmFjdG9yaXppbmcgdGhlIGlucHV0IG1hdHJpeFxuICogQHBhcmFtIHttYXQyfSBMIHRoZSBsb3dlciB0cmlhbmd1bGFyIG1hdHJpeCBcbiAqIEBwYXJhbSB7bWF0Mn0gRCB0aGUgZGlhZ29uYWwgbWF0cml4IFxuICogQHBhcmFtIHttYXQyfSBVIHRoZSB1cHBlciB0cmlhbmd1bGFyIG1hdHJpeCBcbiAqIEBwYXJhbSB7bWF0Mn0gYSB0aGUgaW5wdXQgbWF0cml4IHRvIGZhY3Rvcml6ZVxuICovXG5cbm1hdDIuTERVID0gZnVuY3Rpb24gKEwsIEQsIFUsIGEpIHsgXG4gICAgTFsyXSA9IGFbMl0vYVswXTsgXG4gICAgVVswXSA9IGFbMF07IFxuICAgIFVbMV0gPSBhWzFdOyBcbiAgICBVWzNdID0gYVszXSAtIExbMl0gKiBVWzFdOyBcbiAgICByZXR1cm4gW0wsIEQsIFVdOyAgICAgICBcbn07IFxuXG5pZih0eXBlb2YoZXhwb3J0cykgIT09ICd1bmRlZmluZWQnKSB7XG4gICAgZXhwb3J0cy5tYXQyID0gbWF0Mjtcbn1cbjtcbi8qIENvcHlyaWdodCAoYykgMjAxMywgQnJhbmRvbiBKb25lcywgQ29saW4gTWFjS2VuemllIElWLiBBbGwgcmlnaHRzIHJlc2VydmVkLlxuXG5SZWRpc3RyaWJ1dGlvbiBhbmQgdXNlIGluIHNvdXJjZSBhbmQgYmluYXJ5IGZvcm1zLCB3aXRoIG9yIHdpdGhvdXQgbW9kaWZpY2F0aW9uLFxuYXJlIHBlcm1pdHRlZCBwcm92aWRlZCB0aGF0IHRoZSBmb2xsb3dpbmcgY29uZGl0aW9ucyBhcmUgbWV0OlxuXG4gICogUmVkaXN0cmlidXRpb25zIG9mIHNvdXJjZSBjb2RlIG11c3QgcmV0YWluIHRoZSBhYm92ZSBjb3B5cmlnaHQgbm90aWNlLCB0aGlzXG4gICAgbGlzdCBvZiBjb25kaXRpb25zIGFuZCB0aGUgZm9sbG93aW5nIGRpc2NsYWltZXIuXG4gICogUmVkaXN0cmlidXRpb25zIGluIGJpbmFyeSBmb3JtIG11c3QgcmVwcm9kdWNlIHRoZSBhYm92ZSBjb3B5cmlnaHQgbm90aWNlLFxuICAgIHRoaXMgbGlzdCBvZiBjb25kaXRpb25zIGFuZCB0aGUgZm9sbG93aW5nIGRpc2NsYWltZXIgaW4gdGhlIGRvY3VtZW50YXRpb24gXG4gICAgYW5kL29yIG90aGVyIG1hdGVyaWFscyBwcm92aWRlZCB3aXRoIHRoZSBkaXN0cmlidXRpb24uXG5cblRISVMgU09GVFdBUkUgSVMgUFJPVklERUQgQlkgVEhFIENPUFlSSUdIVCBIT0xERVJTIEFORCBDT05UUklCVVRPUlMgXCJBUyBJU1wiIEFORFxuQU5ZIEVYUFJFU1MgT1IgSU1QTElFRCBXQVJSQU5USUVTLCBJTkNMVURJTkcsIEJVVCBOT1QgTElNSVRFRCBUTywgVEhFIElNUExJRURcbldBUlJBTlRJRVMgT0YgTUVSQ0hBTlRBQklMSVRZIEFORCBGSVRORVNTIEZPUiBBIFBBUlRJQ1VMQVIgUFVSUE9TRSBBUkUgXG5ESVNDTEFJTUVELiBJTiBOTyBFVkVOVCBTSEFMTCBUSEUgQ09QWVJJR0hUIEhPTERFUiBPUiBDT05UUklCVVRPUlMgQkUgTElBQkxFIEZPUlxuQU5ZIERJUkVDVCwgSU5ESVJFQ1QsIElOQ0lERU5UQUwsIFNQRUNJQUwsIEVYRU1QTEFSWSwgT1IgQ09OU0VRVUVOVElBTCBEQU1BR0VTXG4oSU5DTFVESU5HLCBCVVQgTk9UIExJTUlURUQgVE8sIFBST0NVUkVNRU5UIE9GIFNVQlNUSVRVVEUgR09PRFMgT1IgU0VSVklDRVM7XG5MT1NTIE9GIFVTRSwgREFUQSwgT1IgUFJPRklUUzsgT1IgQlVTSU5FU1MgSU5URVJSVVBUSU9OKSBIT1dFVkVSIENBVVNFRCBBTkQgT05cbkFOWSBUSEVPUlkgT0YgTElBQklMSVRZLCBXSEVUSEVSIElOIENPTlRSQUNULCBTVFJJQ1QgTElBQklMSVRZLCBPUiBUT1JUXG4oSU5DTFVESU5HIE5FR0xJR0VOQ0UgT1IgT1RIRVJXSVNFKSBBUklTSU5HIElOIEFOWSBXQVkgT1VUIE9GIFRIRSBVU0UgT0YgVEhJU1xuU09GVFdBUkUsIEVWRU4gSUYgQURWSVNFRCBPRiBUSEUgUE9TU0lCSUxJVFkgT0YgU1VDSCBEQU1BR0UuICovXG5cbi8qKlxuICogQGNsYXNzIDJ4MyBNYXRyaXhcbiAqIEBuYW1lIG1hdDJkXG4gKiBcbiAqIEBkZXNjcmlwdGlvbiBcbiAqIEEgbWF0MmQgY29udGFpbnMgc2l4IGVsZW1lbnRzIGRlZmluZWQgYXM6XG4gKiA8cHJlPlxuICogW2EsIGMsIHR4LFxuICogIGIsIGQsIHR5XVxuICogPC9wcmU+XG4gKiBUaGlzIGlzIGEgc2hvcnQgZm9ybSBmb3IgdGhlIDN4MyBtYXRyaXg6XG4gKiA8cHJlPlxuICogW2EsIGMsIHR4LFxuICogIGIsIGQsIHR5LFxuICogIDAsIDAsIDFdXG4gKiA8L3ByZT5cbiAqIFRoZSBsYXN0IHJvdyBpcyBpZ25vcmVkIHNvIHRoZSBhcnJheSBpcyBzaG9ydGVyIGFuZCBvcGVyYXRpb25zIGFyZSBmYXN0ZXIuXG4gKi9cblxudmFyIG1hdDJkID0ge307XG5cbi8qKlxuICogQ3JlYXRlcyBhIG5ldyBpZGVudGl0eSBtYXQyZFxuICpcbiAqIEByZXR1cm5zIHttYXQyZH0gYSBuZXcgMngzIG1hdHJpeFxuICovXG5tYXQyZC5jcmVhdGUgPSBmdW5jdGlvbigpIHtcbiAgICB2YXIgb3V0ID0gbmV3IEdMTUFUX0FSUkFZX1RZUEUoNik7XG4gICAgb3V0WzBdID0gMTtcbiAgICBvdXRbMV0gPSAwO1xuICAgIG91dFsyXSA9IDA7XG4gICAgb3V0WzNdID0gMTtcbiAgICBvdXRbNF0gPSAwO1xuICAgIG91dFs1XSA9IDA7XG4gICAgcmV0dXJuIG91dDtcbn07XG5cbi8qKlxuICogQ3JlYXRlcyBhIG5ldyBtYXQyZCBpbml0aWFsaXplZCB3aXRoIHZhbHVlcyBmcm9tIGFuIGV4aXN0aW5nIG1hdHJpeFxuICpcbiAqIEBwYXJhbSB7bWF0MmR9IGEgbWF0cml4IHRvIGNsb25lXG4gKiBAcmV0dXJucyB7bWF0MmR9IGEgbmV3IDJ4MyBtYXRyaXhcbiAqL1xubWF0MmQuY2xvbmUgPSBmdW5jdGlvbihhKSB7XG4gICAgdmFyIG91dCA9IG5ldyBHTE1BVF9BUlJBWV9UWVBFKDYpO1xuICAgIG91dFswXSA9IGFbMF07XG4gICAgb3V0WzFdID0gYVsxXTtcbiAgICBvdXRbMl0gPSBhWzJdO1xuICAgIG91dFszXSA9IGFbM107XG4gICAgb3V0WzRdID0gYVs0XTtcbiAgICBvdXRbNV0gPSBhWzVdO1xuICAgIHJldHVybiBvdXQ7XG59O1xuXG4vKipcbiAqIENvcHkgdGhlIHZhbHVlcyBmcm9tIG9uZSBtYXQyZCB0byBhbm90aGVyXG4gKlxuICogQHBhcmFtIHttYXQyZH0gb3V0IHRoZSByZWNlaXZpbmcgbWF0cml4XG4gKiBAcGFyYW0ge21hdDJkfSBhIHRoZSBzb3VyY2UgbWF0cml4XG4gKiBAcmV0dXJucyB7bWF0MmR9IG91dFxuICovXG5tYXQyZC5jb3B5ID0gZnVuY3Rpb24ob3V0LCBhKSB7XG4gICAgb3V0WzBdID0gYVswXTtcbiAgICBvdXRbMV0gPSBhWzFdO1xuICAgIG91dFsyXSA9IGFbMl07XG4gICAgb3V0WzNdID0gYVszXTtcbiAgICBvdXRbNF0gPSBhWzRdO1xuICAgIG91dFs1XSA9IGFbNV07XG4gICAgcmV0dXJuIG91dDtcbn07XG5cbi8qKlxuICogU2V0IGEgbWF0MmQgdG8gdGhlIGlkZW50aXR5IG1hdHJpeFxuICpcbiAqIEBwYXJhbSB7bWF0MmR9IG91dCB0aGUgcmVjZWl2aW5nIG1hdHJpeFxuICogQHJldHVybnMge21hdDJkfSBvdXRcbiAqL1xubWF0MmQuaWRlbnRpdHkgPSBmdW5jdGlvbihvdXQpIHtcbiAgICBvdXRbMF0gPSAxO1xuICAgIG91dFsxXSA9IDA7XG4gICAgb3V0WzJdID0gMDtcbiAgICBvdXRbM10gPSAxO1xuICAgIG91dFs0XSA9IDA7XG4gICAgb3V0WzVdID0gMDtcbiAgICByZXR1cm4gb3V0O1xufTtcblxuLyoqXG4gKiBJbnZlcnRzIGEgbWF0MmRcbiAqXG4gKiBAcGFyYW0ge21hdDJkfSBvdXQgdGhlIHJlY2VpdmluZyBtYXRyaXhcbiAqIEBwYXJhbSB7bWF0MmR9IGEgdGhlIHNvdXJjZSBtYXRyaXhcbiAqIEByZXR1cm5zIHttYXQyZH0gb3V0XG4gKi9cbm1hdDJkLmludmVydCA9IGZ1bmN0aW9uKG91dCwgYSkge1xuICAgIHZhciBhYSA9IGFbMF0sIGFiID0gYVsxXSwgYWMgPSBhWzJdLCBhZCA9IGFbM10sXG4gICAgICAgIGF0eCA9IGFbNF0sIGF0eSA9IGFbNV07XG5cbiAgICB2YXIgZGV0ID0gYWEgKiBhZCAtIGFiICogYWM7XG4gICAgaWYoIWRldCl7XG4gICAgICAgIHJldHVybiBudWxsO1xuICAgIH1cbiAgICBkZXQgPSAxLjAgLyBkZXQ7XG5cbiAgICBvdXRbMF0gPSBhZCAqIGRldDtcbiAgICBvdXRbMV0gPSAtYWIgKiBkZXQ7XG4gICAgb3V0WzJdID0gLWFjICogZGV0O1xuICAgIG91dFszXSA9IGFhICogZGV0O1xuICAgIG91dFs0XSA9IChhYyAqIGF0eSAtIGFkICogYXR4KSAqIGRldDtcbiAgICBvdXRbNV0gPSAoYWIgKiBhdHggLSBhYSAqIGF0eSkgKiBkZXQ7XG4gICAgcmV0dXJuIG91dDtcbn07XG5cbi8qKlxuICogQ2FsY3VsYXRlcyB0aGUgZGV0ZXJtaW5hbnQgb2YgYSBtYXQyZFxuICpcbiAqIEBwYXJhbSB7bWF0MmR9IGEgdGhlIHNvdXJjZSBtYXRyaXhcbiAqIEByZXR1cm5zIHtOdW1iZXJ9IGRldGVybWluYW50IG9mIGFcbiAqL1xubWF0MmQuZGV0ZXJtaW5hbnQgPSBmdW5jdGlvbiAoYSkge1xuICAgIHJldHVybiBhWzBdICogYVszXSAtIGFbMV0gKiBhWzJdO1xufTtcblxuLyoqXG4gKiBNdWx0aXBsaWVzIHR3byBtYXQyZCdzXG4gKlxuICogQHBhcmFtIHttYXQyZH0gb3V0IHRoZSByZWNlaXZpbmcgbWF0cml4XG4gKiBAcGFyYW0ge21hdDJkfSBhIHRoZSBmaXJzdCBvcGVyYW5kXG4gKiBAcGFyYW0ge21hdDJkfSBiIHRoZSBzZWNvbmQgb3BlcmFuZFxuICogQHJldHVybnMge21hdDJkfSBvdXRcbiAqL1xubWF0MmQubXVsdGlwbHkgPSBmdW5jdGlvbiAob3V0LCBhLCBiKSB7XG4gICAgdmFyIGEwID0gYVswXSwgYTEgPSBhWzFdLCBhMiA9IGFbMl0sIGEzID0gYVszXSwgYTQgPSBhWzRdLCBhNSA9IGFbNV0sXG4gICAgICAgIGIwID0gYlswXSwgYjEgPSBiWzFdLCBiMiA9IGJbMl0sIGIzID0gYlszXSwgYjQgPSBiWzRdLCBiNSA9IGJbNV07XG4gICAgb3V0WzBdID0gYTAgKiBiMCArIGEyICogYjE7XG4gICAgb3V0WzFdID0gYTEgKiBiMCArIGEzICogYjE7XG4gICAgb3V0WzJdID0gYTAgKiBiMiArIGEyICogYjM7XG4gICAgb3V0WzNdID0gYTEgKiBiMiArIGEzICogYjM7XG4gICAgb3V0WzRdID0gYTAgKiBiNCArIGEyICogYjUgKyBhNDtcbiAgICBvdXRbNV0gPSBhMSAqIGI0ICsgYTMgKiBiNSArIGE1O1xuICAgIHJldHVybiBvdXQ7XG59O1xuXG4vKipcbiAqIEFsaWFzIGZvciB7QGxpbmsgbWF0MmQubXVsdGlwbHl9XG4gKiBAZnVuY3Rpb25cbiAqL1xubWF0MmQubXVsID0gbWF0MmQubXVsdGlwbHk7XG5cblxuLyoqXG4gKiBSb3RhdGVzIGEgbWF0MmQgYnkgdGhlIGdpdmVuIGFuZ2xlXG4gKlxuICogQHBhcmFtIHttYXQyZH0gb3V0IHRoZSByZWNlaXZpbmcgbWF0cml4XG4gKiBAcGFyYW0ge21hdDJkfSBhIHRoZSBtYXRyaXggdG8gcm90YXRlXG4gKiBAcGFyYW0ge051bWJlcn0gcmFkIHRoZSBhbmdsZSB0byByb3RhdGUgdGhlIG1hdHJpeCBieVxuICogQHJldHVybnMge21hdDJkfSBvdXRcbiAqL1xubWF0MmQucm90YXRlID0gZnVuY3Rpb24gKG91dCwgYSwgcmFkKSB7XG4gICAgdmFyIGEwID0gYVswXSwgYTEgPSBhWzFdLCBhMiA9IGFbMl0sIGEzID0gYVszXSwgYTQgPSBhWzRdLCBhNSA9IGFbNV0sXG4gICAgICAgIHMgPSBNYXRoLnNpbihyYWQpLFxuICAgICAgICBjID0gTWF0aC5jb3MocmFkKTtcbiAgICBvdXRbMF0gPSBhMCAqICBjICsgYTIgKiBzO1xuICAgIG91dFsxXSA9IGExICogIGMgKyBhMyAqIHM7XG4gICAgb3V0WzJdID0gYTAgKiAtcyArIGEyICogYztcbiAgICBvdXRbM10gPSBhMSAqIC1zICsgYTMgKiBjO1xuICAgIG91dFs0XSA9IGE0O1xuICAgIG91dFs1XSA9IGE1O1xuICAgIHJldHVybiBvdXQ7XG59O1xuXG4vKipcbiAqIFNjYWxlcyB0aGUgbWF0MmQgYnkgdGhlIGRpbWVuc2lvbnMgaW4gdGhlIGdpdmVuIHZlYzJcbiAqXG4gKiBAcGFyYW0ge21hdDJkfSBvdXQgdGhlIHJlY2VpdmluZyBtYXRyaXhcbiAqIEBwYXJhbSB7bWF0MmR9IGEgdGhlIG1hdHJpeCB0byB0cmFuc2xhdGVcbiAqIEBwYXJhbSB7dmVjMn0gdiB0aGUgdmVjMiB0byBzY2FsZSB0aGUgbWF0cml4IGJ5XG4gKiBAcmV0dXJucyB7bWF0MmR9IG91dFxuICoqL1xubWF0MmQuc2NhbGUgPSBmdW5jdGlvbihvdXQsIGEsIHYpIHtcbiAgICB2YXIgYTAgPSBhWzBdLCBhMSA9IGFbMV0sIGEyID0gYVsyXSwgYTMgPSBhWzNdLCBhNCA9IGFbNF0sIGE1ID0gYVs1XSxcbiAgICAgICAgdjAgPSB2WzBdLCB2MSA9IHZbMV07XG4gICAgb3V0WzBdID0gYTAgKiB2MDtcbiAgICBvdXRbMV0gPSBhMSAqIHYwO1xuICAgIG91dFsyXSA9IGEyICogdjE7XG4gICAgb3V0WzNdID0gYTMgKiB2MTtcbiAgICBvdXRbNF0gPSBhNDtcbiAgICBvdXRbNV0gPSBhNTtcbiAgICByZXR1cm4gb3V0O1xufTtcblxuLyoqXG4gKiBUcmFuc2xhdGVzIHRoZSBtYXQyZCBieSB0aGUgZGltZW5zaW9ucyBpbiB0aGUgZ2l2ZW4gdmVjMlxuICpcbiAqIEBwYXJhbSB7bWF0MmR9IG91dCB0aGUgcmVjZWl2aW5nIG1hdHJpeFxuICogQHBhcmFtIHttYXQyZH0gYSB0aGUgbWF0cml4IHRvIHRyYW5zbGF0ZVxuICogQHBhcmFtIHt2ZWMyfSB2IHRoZSB2ZWMyIHRvIHRyYW5zbGF0ZSB0aGUgbWF0cml4IGJ5XG4gKiBAcmV0dXJucyB7bWF0MmR9IG91dFxuICoqL1xubWF0MmQudHJhbnNsYXRlID0gZnVuY3Rpb24ob3V0LCBhLCB2KSB7XG4gICAgdmFyIGEwID0gYVswXSwgYTEgPSBhWzFdLCBhMiA9IGFbMl0sIGEzID0gYVszXSwgYTQgPSBhWzRdLCBhNSA9IGFbNV0sXG4gICAgICAgIHYwID0gdlswXSwgdjEgPSB2WzFdO1xuICAgIG91dFswXSA9IGEwO1xuICAgIG91dFsxXSA9IGExO1xuICAgIG91dFsyXSA9IGEyO1xuICAgIG91dFszXSA9IGEzO1xuICAgIG91dFs0XSA9IGEwICogdjAgKyBhMiAqIHYxICsgYTQ7XG4gICAgb3V0WzVdID0gYTEgKiB2MCArIGEzICogdjEgKyBhNTtcbiAgICByZXR1cm4gb3V0O1xufTtcblxuLyoqXG4gKiBSZXR1cm5zIGEgc3RyaW5nIHJlcHJlc2VudGF0aW9uIG9mIGEgbWF0MmRcbiAqXG4gKiBAcGFyYW0ge21hdDJkfSBhIG1hdHJpeCB0byByZXByZXNlbnQgYXMgYSBzdHJpbmdcbiAqIEByZXR1cm5zIHtTdHJpbmd9IHN0cmluZyByZXByZXNlbnRhdGlvbiBvZiB0aGUgbWF0cml4XG4gKi9cbm1hdDJkLnN0ciA9IGZ1bmN0aW9uIChhKSB7XG4gICAgcmV0dXJuICdtYXQyZCgnICsgYVswXSArICcsICcgKyBhWzFdICsgJywgJyArIGFbMl0gKyAnLCAnICsgXG4gICAgICAgICAgICAgICAgICAgIGFbM10gKyAnLCAnICsgYVs0XSArICcsICcgKyBhWzVdICsgJyknO1xufTtcblxuLyoqXG4gKiBSZXR1cm5zIEZyb2Jlbml1cyBub3JtIG9mIGEgbWF0MmRcbiAqXG4gKiBAcGFyYW0ge21hdDJkfSBhIHRoZSBtYXRyaXggdG8gY2FsY3VsYXRlIEZyb2Jlbml1cyBub3JtIG9mXG4gKiBAcmV0dXJucyB7TnVtYmVyfSBGcm9iZW5pdXMgbm9ybVxuICovXG5tYXQyZC5mcm9iID0gZnVuY3Rpb24gKGEpIHsgXG4gICAgcmV0dXJuKE1hdGguc3FydChNYXRoLnBvdyhhWzBdLCAyKSArIE1hdGgucG93KGFbMV0sIDIpICsgTWF0aC5wb3coYVsyXSwgMikgKyBNYXRoLnBvdyhhWzNdLCAyKSArIE1hdGgucG93KGFbNF0sIDIpICsgTWF0aC5wb3coYVs1XSwgMikgKyAxKSlcbn07IFxuXG5pZih0eXBlb2YoZXhwb3J0cykgIT09ICd1bmRlZmluZWQnKSB7XG4gICAgZXhwb3J0cy5tYXQyZCA9IG1hdDJkO1xufVxuO1xuLyogQ29weXJpZ2h0IChjKSAyMDEzLCBCcmFuZG9uIEpvbmVzLCBDb2xpbiBNYWNLZW56aWUgSVYuIEFsbCByaWdodHMgcmVzZXJ2ZWQuXG5cblJlZGlzdHJpYnV0aW9uIGFuZCB1c2UgaW4gc291cmNlIGFuZCBiaW5hcnkgZm9ybXMsIHdpdGggb3Igd2l0aG91dCBtb2RpZmljYXRpb24sXG5hcmUgcGVybWl0dGVkIHByb3ZpZGVkIHRoYXQgdGhlIGZvbGxvd2luZyBjb25kaXRpb25zIGFyZSBtZXQ6XG5cbiAgKiBSZWRpc3RyaWJ1dGlvbnMgb2Ygc291cmNlIGNvZGUgbXVzdCByZXRhaW4gdGhlIGFib3ZlIGNvcHlyaWdodCBub3RpY2UsIHRoaXNcbiAgICBsaXN0IG9mIGNvbmRpdGlvbnMgYW5kIHRoZSBmb2xsb3dpbmcgZGlzY2xhaW1lci5cbiAgKiBSZWRpc3RyaWJ1dGlvbnMgaW4gYmluYXJ5IGZvcm0gbXVzdCByZXByb2R1Y2UgdGhlIGFib3ZlIGNvcHlyaWdodCBub3RpY2UsXG4gICAgdGhpcyBsaXN0IG9mIGNvbmRpdGlvbnMgYW5kIHRoZSBmb2xsb3dpbmcgZGlzY2xhaW1lciBpbiB0aGUgZG9jdW1lbnRhdGlvbiBcbiAgICBhbmQvb3Igb3RoZXIgbWF0ZXJpYWxzIHByb3ZpZGVkIHdpdGggdGhlIGRpc3RyaWJ1dGlvbi5cblxuVEhJUyBTT0ZUV0FSRSBJUyBQUk9WSURFRCBCWSBUSEUgQ09QWVJJR0hUIEhPTERFUlMgQU5EIENPTlRSSUJVVE9SUyBcIkFTIElTXCIgQU5EXG5BTlkgRVhQUkVTUyBPUiBJTVBMSUVEIFdBUlJBTlRJRVMsIElOQ0xVRElORywgQlVUIE5PVCBMSU1JVEVEIFRPLCBUSEUgSU1QTElFRFxuV0FSUkFOVElFUyBPRiBNRVJDSEFOVEFCSUxJVFkgQU5EIEZJVE5FU1MgRk9SIEEgUEFSVElDVUxBUiBQVVJQT1NFIEFSRSBcbkRJU0NMQUlNRUQuIElOIE5PIEVWRU5UIFNIQUxMIFRIRSBDT1BZUklHSFQgSE9MREVSIE9SIENPTlRSSUJVVE9SUyBCRSBMSUFCTEUgRk9SXG5BTlkgRElSRUNULCBJTkRJUkVDVCwgSU5DSURFTlRBTCwgU1BFQ0lBTCwgRVhFTVBMQVJZLCBPUiBDT05TRVFVRU5USUFMIERBTUFHRVNcbihJTkNMVURJTkcsIEJVVCBOT1QgTElNSVRFRCBUTywgUFJPQ1VSRU1FTlQgT0YgU1VCU1RJVFVURSBHT09EUyBPUiBTRVJWSUNFUztcbkxPU1MgT0YgVVNFLCBEQVRBLCBPUiBQUk9GSVRTOyBPUiBCVVNJTkVTUyBJTlRFUlJVUFRJT04pIEhPV0VWRVIgQ0FVU0VEIEFORCBPTlxuQU5ZIFRIRU9SWSBPRiBMSUFCSUxJVFksIFdIRVRIRVIgSU4gQ09OVFJBQ1QsIFNUUklDVCBMSUFCSUxJVFksIE9SIFRPUlRcbihJTkNMVURJTkcgTkVHTElHRU5DRSBPUiBPVEhFUldJU0UpIEFSSVNJTkcgSU4gQU5ZIFdBWSBPVVQgT0YgVEhFIFVTRSBPRiBUSElTXG5TT0ZUV0FSRSwgRVZFTiBJRiBBRFZJU0VEIE9GIFRIRSBQT1NTSUJJTElUWSBPRiBTVUNIIERBTUFHRS4gKi9cblxuLyoqXG4gKiBAY2xhc3MgM3gzIE1hdHJpeFxuICogQG5hbWUgbWF0M1xuICovXG5cbnZhciBtYXQzID0ge307XG5cbi8qKlxuICogQ3JlYXRlcyBhIG5ldyBpZGVudGl0eSBtYXQzXG4gKlxuICogQHJldHVybnMge21hdDN9IGEgbmV3IDN4MyBtYXRyaXhcbiAqL1xubWF0My5jcmVhdGUgPSBmdW5jdGlvbigpIHtcbiAgICB2YXIgb3V0ID0gbmV3IEdMTUFUX0FSUkFZX1RZUEUoOSk7XG4gICAgb3V0WzBdID0gMTtcbiAgICBvdXRbMV0gPSAwO1xuICAgIG91dFsyXSA9IDA7XG4gICAgb3V0WzNdID0gMDtcbiAgICBvdXRbNF0gPSAxO1xuICAgIG91dFs1XSA9IDA7XG4gICAgb3V0WzZdID0gMDtcbiAgICBvdXRbN10gPSAwO1xuICAgIG91dFs4XSA9IDE7XG4gICAgcmV0dXJuIG91dDtcbn07XG5cbi8qKlxuICogQ29waWVzIHRoZSB1cHBlci1sZWZ0IDN4MyB2YWx1ZXMgaW50byB0aGUgZ2l2ZW4gbWF0My5cbiAqXG4gKiBAcGFyYW0ge21hdDN9IG91dCB0aGUgcmVjZWl2aW5nIDN4MyBtYXRyaXhcbiAqIEBwYXJhbSB7bWF0NH0gYSAgIHRoZSBzb3VyY2UgNHg0IG1hdHJpeFxuICogQHJldHVybnMge21hdDN9IG91dFxuICovXG5tYXQzLmZyb21NYXQ0ID0gZnVuY3Rpb24ob3V0LCBhKSB7XG4gICAgb3V0WzBdID0gYVswXTtcbiAgICBvdXRbMV0gPSBhWzFdO1xuICAgIG91dFsyXSA9IGFbMl07XG4gICAgb3V0WzNdID0gYVs0XTtcbiAgICBvdXRbNF0gPSBhWzVdO1xuICAgIG91dFs1XSA9IGFbNl07XG4gICAgb3V0WzZdID0gYVs4XTtcbiAgICBvdXRbN10gPSBhWzldO1xuICAgIG91dFs4XSA9IGFbMTBdO1xuICAgIHJldHVybiBvdXQ7XG59O1xuXG4vKipcbiAqIENyZWF0ZXMgYSBuZXcgbWF0MyBpbml0aWFsaXplZCB3aXRoIHZhbHVlcyBmcm9tIGFuIGV4aXN0aW5nIG1hdHJpeFxuICpcbiAqIEBwYXJhbSB7bWF0M30gYSBtYXRyaXggdG8gY2xvbmVcbiAqIEByZXR1cm5zIHttYXQzfSBhIG5ldyAzeDMgbWF0cml4XG4gKi9cbm1hdDMuY2xvbmUgPSBmdW5jdGlvbihhKSB7XG4gICAgdmFyIG91dCA9IG5ldyBHTE1BVF9BUlJBWV9UWVBFKDkpO1xuICAgIG91dFswXSA9IGFbMF07XG4gICAgb3V0WzFdID0gYVsxXTtcbiAgICBvdXRbMl0gPSBhWzJdO1xuICAgIG91dFszXSA9IGFbM107XG4gICAgb3V0WzRdID0gYVs0XTtcbiAgICBvdXRbNV0gPSBhWzVdO1xuICAgIG91dFs2XSA9IGFbNl07XG4gICAgb3V0WzddID0gYVs3XTtcbiAgICBvdXRbOF0gPSBhWzhdO1xuICAgIHJldHVybiBvdXQ7XG59O1xuXG4vKipcbiAqIENvcHkgdGhlIHZhbHVlcyBmcm9tIG9uZSBtYXQzIHRvIGFub3RoZXJcbiAqXG4gKiBAcGFyYW0ge21hdDN9IG91dCB0aGUgcmVjZWl2aW5nIG1hdHJpeFxuICogQHBhcmFtIHttYXQzfSBhIHRoZSBzb3VyY2UgbWF0cml4XG4gKiBAcmV0dXJucyB7bWF0M30gb3V0XG4gKi9cbm1hdDMuY29weSA9IGZ1bmN0aW9uKG91dCwgYSkge1xuICAgIG91dFswXSA9IGFbMF07XG4gICAgb3V0WzFdID0gYVsxXTtcbiAgICBvdXRbMl0gPSBhWzJdO1xuICAgIG91dFszXSA9IGFbM107XG4gICAgb3V0WzRdID0gYVs0XTtcbiAgICBvdXRbNV0gPSBhWzVdO1xuICAgIG91dFs2XSA9IGFbNl07XG4gICAgb3V0WzddID0gYVs3XTtcbiAgICBvdXRbOF0gPSBhWzhdO1xuICAgIHJldHVybiBvdXQ7XG59O1xuXG4vKipcbiAqIFNldCBhIG1hdDMgdG8gdGhlIGlkZW50aXR5IG1hdHJpeFxuICpcbiAqIEBwYXJhbSB7bWF0M30gb3V0IHRoZSByZWNlaXZpbmcgbWF0cml4XG4gKiBAcmV0dXJucyB7bWF0M30gb3V0XG4gKi9cbm1hdDMuaWRlbnRpdHkgPSBmdW5jdGlvbihvdXQpIHtcbiAgICBvdXRbMF0gPSAxO1xuICAgIG91dFsxXSA9IDA7XG4gICAgb3V0WzJdID0gMDtcbiAgICBvdXRbM10gPSAwO1xuICAgIG91dFs0XSA9IDE7XG4gICAgb3V0WzVdID0gMDtcbiAgICBvdXRbNl0gPSAwO1xuICAgIG91dFs3XSA9IDA7XG4gICAgb3V0WzhdID0gMTtcbiAgICByZXR1cm4gb3V0O1xufTtcblxuLyoqXG4gKiBUcmFuc3Bvc2UgdGhlIHZhbHVlcyBvZiBhIG1hdDNcbiAqXG4gKiBAcGFyYW0ge21hdDN9IG91dCB0aGUgcmVjZWl2aW5nIG1hdHJpeFxuICogQHBhcmFtIHttYXQzfSBhIHRoZSBzb3VyY2UgbWF0cml4XG4gKiBAcmV0dXJucyB7bWF0M30gb3V0XG4gKi9cbm1hdDMudHJhbnNwb3NlID0gZnVuY3Rpb24ob3V0LCBhKSB7XG4gICAgLy8gSWYgd2UgYXJlIHRyYW5zcG9zaW5nIG91cnNlbHZlcyB3ZSBjYW4gc2tpcCBhIGZldyBzdGVwcyBidXQgaGF2ZSB0byBjYWNoZSBzb21lIHZhbHVlc1xuICAgIGlmIChvdXQgPT09IGEpIHtcbiAgICAgICAgdmFyIGEwMSA9IGFbMV0sIGEwMiA9IGFbMl0sIGExMiA9IGFbNV07XG4gICAgICAgIG91dFsxXSA9IGFbM107XG4gICAgICAgIG91dFsyXSA9IGFbNl07XG4gICAgICAgIG91dFszXSA9IGEwMTtcbiAgICAgICAgb3V0WzVdID0gYVs3XTtcbiAgICAgICAgb3V0WzZdID0gYTAyO1xuICAgICAgICBvdXRbN10gPSBhMTI7XG4gICAgfSBlbHNlIHtcbiAgICAgICAgb3V0WzBdID0gYVswXTtcbiAgICAgICAgb3V0WzFdID0gYVszXTtcbiAgICAgICAgb3V0WzJdID0gYVs2XTtcbiAgICAgICAgb3V0WzNdID0gYVsxXTtcbiAgICAgICAgb3V0WzRdID0gYVs0XTtcbiAgICAgICAgb3V0WzVdID0gYVs3XTtcbiAgICAgICAgb3V0WzZdID0gYVsyXTtcbiAgICAgICAgb3V0WzddID0gYVs1XTtcbiAgICAgICAgb3V0WzhdID0gYVs4XTtcbiAgICB9XG4gICAgXG4gICAgcmV0dXJuIG91dDtcbn07XG5cbi8qKlxuICogSW52ZXJ0cyBhIG1hdDNcbiAqXG4gKiBAcGFyYW0ge21hdDN9IG91dCB0aGUgcmVjZWl2aW5nIG1hdHJpeFxuICogQHBhcmFtIHttYXQzfSBhIHRoZSBzb3VyY2UgbWF0cml4XG4gKiBAcmV0dXJucyB7bWF0M30gb3V0XG4gKi9cbm1hdDMuaW52ZXJ0ID0gZnVuY3Rpb24ob3V0LCBhKSB7XG4gICAgdmFyIGEwMCA9IGFbMF0sIGEwMSA9IGFbMV0sIGEwMiA9IGFbMl0sXG4gICAgICAgIGExMCA9IGFbM10sIGExMSA9IGFbNF0sIGExMiA9IGFbNV0sXG4gICAgICAgIGEyMCA9IGFbNl0sIGEyMSA9IGFbN10sIGEyMiA9IGFbOF0sXG5cbiAgICAgICAgYjAxID0gYTIyICogYTExIC0gYTEyICogYTIxLFxuICAgICAgICBiMTEgPSAtYTIyICogYTEwICsgYTEyICogYTIwLFxuICAgICAgICBiMjEgPSBhMjEgKiBhMTAgLSBhMTEgKiBhMjAsXG5cbiAgICAgICAgLy8gQ2FsY3VsYXRlIHRoZSBkZXRlcm1pbmFudFxuICAgICAgICBkZXQgPSBhMDAgKiBiMDEgKyBhMDEgKiBiMTEgKyBhMDIgKiBiMjE7XG5cbiAgICBpZiAoIWRldCkgeyBcbiAgICAgICAgcmV0dXJuIG51bGw7IFxuICAgIH1cbiAgICBkZXQgPSAxLjAgLyBkZXQ7XG5cbiAgICBvdXRbMF0gPSBiMDEgKiBkZXQ7XG4gICAgb3V0WzFdID0gKC1hMjIgKiBhMDEgKyBhMDIgKiBhMjEpICogZGV0O1xuICAgIG91dFsyXSA9IChhMTIgKiBhMDEgLSBhMDIgKiBhMTEpICogZGV0O1xuICAgIG91dFszXSA9IGIxMSAqIGRldDtcbiAgICBvdXRbNF0gPSAoYTIyICogYTAwIC0gYTAyICogYTIwKSAqIGRldDtcbiAgICBvdXRbNV0gPSAoLWExMiAqIGEwMCArIGEwMiAqIGExMCkgKiBkZXQ7XG4gICAgb3V0WzZdID0gYjIxICogZGV0O1xuICAgIG91dFs3XSA9ICgtYTIxICogYTAwICsgYTAxICogYTIwKSAqIGRldDtcbiAgICBvdXRbOF0gPSAoYTExICogYTAwIC0gYTAxICogYTEwKSAqIGRldDtcbiAgICByZXR1cm4gb3V0O1xufTtcblxuLyoqXG4gKiBDYWxjdWxhdGVzIHRoZSBhZGp1Z2F0ZSBvZiBhIG1hdDNcbiAqXG4gKiBAcGFyYW0ge21hdDN9IG91dCB0aGUgcmVjZWl2aW5nIG1hdHJpeFxuICogQHBhcmFtIHttYXQzfSBhIHRoZSBzb3VyY2UgbWF0cml4XG4gKiBAcmV0dXJucyB7bWF0M30gb3V0XG4gKi9cbm1hdDMuYWRqb2ludCA9IGZ1bmN0aW9uKG91dCwgYSkge1xuICAgIHZhciBhMDAgPSBhWzBdLCBhMDEgPSBhWzFdLCBhMDIgPSBhWzJdLFxuICAgICAgICBhMTAgPSBhWzNdLCBhMTEgPSBhWzRdLCBhMTIgPSBhWzVdLFxuICAgICAgICBhMjAgPSBhWzZdLCBhMjEgPSBhWzddLCBhMjIgPSBhWzhdO1xuXG4gICAgb3V0WzBdID0gKGExMSAqIGEyMiAtIGExMiAqIGEyMSk7XG4gICAgb3V0WzFdID0gKGEwMiAqIGEyMSAtIGEwMSAqIGEyMik7XG4gICAgb3V0WzJdID0gKGEwMSAqIGExMiAtIGEwMiAqIGExMSk7XG4gICAgb3V0WzNdID0gKGExMiAqIGEyMCAtIGExMCAqIGEyMik7XG4gICAgb3V0WzRdID0gKGEwMCAqIGEyMiAtIGEwMiAqIGEyMCk7XG4gICAgb3V0WzVdID0gKGEwMiAqIGExMCAtIGEwMCAqIGExMik7XG4gICAgb3V0WzZdID0gKGExMCAqIGEyMSAtIGExMSAqIGEyMCk7XG4gICAgb3V0WzddID0gKGEwMSAqIGEyMCAtIGEwMCAqIGEyMSk7XG4gICAgb3V0WzhdID0gKGEwMCAqIGExMSAtIGEwMSAqIGExMCk7XG4gICAgcmV0dXJuIG91dDtcbn07XG5cbi8qKlxuICogQ2FsY3VsYXRlcyB0aGUgZGV0ZXJtaW5hbnQgb2YgYSBtYXQzXG4gKlxuICogQHBhcmFtIHttYXQzfSBhIHRoZSBzb3VyY2UgbWF0cml4XG4gKiBAcmV0dXJucyB7TnVtYmVyfSBkZXRlcm1pbmFudCBvZiBhXG4gKi9cbm1hdDMuZGV0ZXJtaW5hbnQgPSBmdW5jdGlvbiAoYSkge1xuICAgIHZhciBhMDAgPSBhWzBdLCBhMDEgPSBhWzFdLCBhMDIgPSBhWzJdLFxuICAgICAgICBhMTAgPSBhWzNdLCBhMTEgPSBhWzRdLCBhMTIgPSBhWzVdLFxuICAgICAgICBhMjAgPSBhWzZdLCBhMjEgPSBhWzddLCBhMjIgPSBhWzhdO1xuXG4gICAgcmV0dXJuIGEwMCAqIChhMjIgKiBhMTEgLSBhMTIgKiBhMjEpICsgYTAxICogKC1hMjIgKiBhMTAgKyBhMTIgKiBhMjApICsgYTAyICogKGEyMSAqIGExMCAtIGExMSAqIGEyMCk7XG59O1xuXG4vKipcbiAqIE11bHRpcGxpZXMgdHdvIG1hdDMnc1xuICpcbiAqIEBwYXJhbSB7bWF0M30gb3V0IHRoZSByZWNlaXZpbmcgbWF0cml4XG4gKiBAcGFyYW0ge21hdDN9IGEgdGhlIGZpcnN0IG9wZXJhbmRcbiAqIEBwYXJhbSB7bWF0M30gYiB0aGUgc2Vjb25kIG9wZXJhbmRcbiAqIEByZXR1cm5zIHttYXQzfSBvdXRcbiAqL1xubWF0My5tdWx0aXBseSA9IGZ1bmN0aW9uIChvdXQsIGEsIGIpIHtcbiAgICB2YXIgYTAwID0gYVswXSwgYTAxID0gYVsxXSwgYTAyID0gYVsyXSxcbiAgICAgICAgYTEwID0gYVszXSwgYTExID0gYVs0XSwgYTEyID0gYVs1XSxcbiAgICAgICAgYTIwID0gYVs2XSwgYTIxID0gYVs3XSwgYTIyID0gYVs4XSxcblxuICAgICAgICBiMDAgPSBiWzBdLCBiMDEgPSBiWzFdLCBiMDIgPSBiWzJdLFxuICAgICAgICBiMTAgPSBiWzNdLCBiMTEgPSBiWzRdLCBiMTIgPSBiWzVdLFxuICAgICAgICBiMjAgPSBiWzZdLCBiMjEgPSBiWzddLCBiMjIgPSBiWzhdO1xuXG4gICAgb3V0WzBdID0gYjAwICogYTAwICsgYjAxICogYTEwICsgYjAyICogYTIwO1xuICAgIG91dFsxXSA9IGIwMCAqIGEwMSArIGIwMSAqIGExMSArIGIwMiAqIGEyMTtcbiAgICBvdXRbMl0gPSBiMDAgKiBhMDIgKyBiMDEgKiBhMTIgKyBiMDIgKiBhMjI7XG5cbiAgICBvdXRbM10gPSBiMTAgKiBhMDAgKyBiMTEgKiBhMTAgKyBiMTIgKiBhMjA7XG4gICAgb3V0WzRdID0gYjEwICogYTAxICsgYjExICogYTExICsgYjEyICogYTIxO1xuICAgIG91dFs1XSA9IGIxMCAqIGEwMiArIGIxMSAqIGExMiArIGIxMiAqIGEyMjtcblxuICAgIG91dFs2XSA9IGIyMCAqIGEwMCArIGIyMSAqIGExMCArIGIyMiAqIGEyMDtcbiAgICBvdXRbN10gPSBiMjAgKiBhMDEgKyBiMjEgKiBhMTEgKyBiMjIgKiBhMjE7XG4gICAgb3V0WzhdID0gYjIwICogYTAyICsgYjIxICogYTEyICsgYjIyICogYTIyO1xuICAgIHJldHVybiBvdXQ7XG59O1xuXG4vKipcbiAqIEFsaWFzIGZvciB7QGxpbmsgbWF0My5tdWx0aXBseX1cbiAqIEBmdW5jdGlvblxuICovXG5tYXQzLm11bCA9IG1hdDMubXVsdGlwbHk7XG5cbi8qKlxuICogVHJhbnNsYXRlIGEgbWF0MyBieSB0aGUgZ2l2ZW4gdmVjdG9yXG4gKlxuICogQHBhcmFtIHttYXQzfSBvdXQgdGhlIHJlY2VpdmluZyBtYXRyaXhcbiAqIEBwYXJhbSB7bWF0M30gYSB0aGUgbWF0cml4IHRvIHRyYW5zbGF0ZVxuICogQHBhcmFtIHt2ZWMyfSB2IHZlY3RvciB0byB0cmFuc2xhdGUgYnlcbiAqIEByZXR1cm5zIHttYXQzfSBvdXRcbiAqL1xubWF0My50cmFuc2xhdGUgPSBmdW5jdGlvbihvdXQsIGEsIHYpIHtcbiAgICB2YXIgYTAwID0gYVswXSwgYTAxID0gYVsxXSwgYTAyID0gYVsyXSxcbiAgICAgICAgYTEwID0gYVszXSwgYTExID0gYVs0XSwgYTEyID0gYVs1XSxcbiAgICAgICAgYTIwID0gYVs2XSwgYTIxID0gYVs3XSwgYTIyID0gYVs4XSxcbiAgICAgICAgeCA9IHZbMF0sIHkgPSB2WzFdO1xuXG4gICAgb3V0WzBdID0gYTAwO1xuICAgIG91dFsxXSA9IGEwMTtcbiAgICBvdXRbMl0gPSBhMDI7XG5cbiAgICBvdXRbM10gPSBhMTA7XG4gICAgb3V0WzRdID0gYTExO1xuICAgIG91dFs1XSA9IGExMjtcblxuICAgIG91dFs2XSA9IHggKiBhMDAgKyB5ICogYTEwICsgYTIwO1xuICAgIG91dFs3XSA9IHggKiBhMDEgKyB5ICogYTExICsgYTIxO1xuICAgIG91dFs4XSA9IHggKiBhMDIgKyB5ICogYTEyICsgYTIyO1xuICAgIHJldHVybiBvdXQ7XG59O1xuXG4vKipcbiAqIFJvdGF0ZXMgYSBtYXQzIGJ5IHRoZSBnaXZlbiBhbmdsZVxuICpcbiAqIEBwYXJhbSB7bWF0M30gb3V0IHRoZSByZWNlaXZpbmcgbWF0cml4XG4gKiBAcGFyYW0ge21hdDN9IGEgdGhlIG1hdHJpeCB0byByb3RhdGVcbiAqIEBwYXJhbSB7TnVtYmVyfSByYWQgdGhlIGFuZ2xlIHRvIHJvdGF0ZSB0aGUgbWF0cml4IGJ5XG4gKiBAcmV0dXJucyB7bWF0M30gb3V0XG4gKi9cbm1hdDMucm90YXRlID0gZnVuY3Rpb24gKG91dCwgYSwgcmFkKSB7XG4gICAgdmFyIGEwMCA9IGFbMF0sIGEwMSA9IGFbMV0sIGEwMiA9IGFbMl0sXG4gICAgICAgIGExMCA9IGFbM10sIGExMSA9IGFbNF0sIGExMiA9IGFbNV0sXG4gICAgICAgIGEyMCA9IGFbNl0sIGEyMSA9IGFbN10sIGEyMiA9IGFbOF0sXG5cbiAgICAgICAgcyA9IE1hdGguc2luKHJhZCksXG4gICAgICAgIGMgPSBNYXRoLmNvcyhyYWQpO1xuXG4gICAgb3V0WzBdID0gYyAqIGEwMCArIHMgKiBhMTA7XG4gICAgb3V0WzFdID0gYyAqIGEwMSArIHMgKiBhMTE7XG4gICAgb3V0WzJdID0gYyAqIGEwMiArIHMgKiBhMTI7XG5cbiAgICBvdXRbM10gPSBjICogYTEwIC0gcyAqIGEwMDtcbiAgICBvdXRbNF0gPSBjICogYTExIC0gcyAqIGEwMTtcbiAgICBvdXRbNV0gPSBjICogYTEyIC0gcyAqIGEwMjtcblxuICAgIG91dFs2XSA9IGEyMDtcbiAgICBvdXRbN10gPSBhMjE7XG4gICAgb3V0WzhdID0gYTIyO1xuICAgIHJldHVybiBvdXQ7XG59O1xuXG4vKipcbiAqIFNjYWxlcyB0aGUgbWF0MyBieSB0aGUgZGltZW5zaW9ucyBpbiB0aGUgZ2l2ZW4gdmVjMlxuICpcbiAqIEBwYXJhbSB7bWF0M30gb3V0IHRoZSByZWNlaXZpbmcgbWF0cml4XG4gKiBAcGFyYW0ge21hdDN9IGEgdGhlIG1hdHJpeCB0byByb3RhdGVcbiAqIEBwYXJhbSB7dmVjMn0gdiB0aGUgdmVjMiB0byBzY2FsZSB0aGUgbWF0cml4IGJ5XG4gKiBAcmV0dXJucyB7bWF0M30gb3V0XG4gKiovXG5tYXQzLnNjYWxlID0gZnVuY3Rpb24ob3V0LCBhLCB2KSB7XG4gICAgdmFyIHggPSB2WzBdLCB5ID0gdlsxXTtcblxuICAgIG91dFswXSA9IHggKiBhWzBdO1xuICAgIG91dFsxXSA9IHggKiBhWzFdO1xuICAgIG91dFsyXSA9IHggKiBhWzJdO1xuXG4gICAgb3V0WzNdID0geSAqIGFbM107XG4gICAgb3V0WzRdID0geSAqIGFbNF07XG4gICAgb3V0WzVdID0geSAqIGFbNV07XG5cbiAgICBvdXRbNl0gPSBhWzZdO1xuICAgIG91dFs3XSA9IGFbN107XG4gICAgb3V0WzhdID0gYVs4XTtcbiAgICByZXR1cm4gb3V0O1xufTtcblxuLyoqXG4gKiBDb3BpZXMgdGhlIHZhbHVlcyBmcm9tIGEgbWF0MmQgaW50byBhIG1hdDNcbiAqXG4gKiBAcGFyYW0ge21hdDN9IG91dCB0aGUgcmVjZWl2aW5nIG1hdHJpeFxuICogQHBhcmFtIHttYXQyZH0gYSB0aGUgbWF0cml4IHRvIGNvcHlcbiAqIEByZXR1cm5zIHttYXQzfSBvdXRcbiAqKi9cbm1hdDMuZnJvbU1hdDJkID0gZnVuY3Rpb24ob3V0LCBhKSB7XG4gICAgb3V0WzBdID0gYVswXTtcbiAgICBvdXRbMV0gPSBhWzFdO1xuICAgIG91dFsyXSA9IDA7XG5cbiAgICBvdXRbM10gPSBhWzJdO1xuICAgIG91dFs0XSA9IGFbM107XG4gICAgb3V0WzVdID0gMDtcblxuICAgIG91dFs2XSA9IGFbNF07XG4gICAgb3V0WzddID0gYVs1XTtcbiAgICBvdXRbOF0gPSAxO1xuICAgIHJldHVybiBvdXQ7XG59O1xuXG4vKipcbiogQ2FsY3VsYXRlcyBhIDN4MyBtYXRyaXggZnJvbSB0aGUgZ2l2ZW4gcXVhdGVybmlvblxuKlxuKiBAcGFyYW0ge21hdDN9IG91dCBtYXQzIHJlY2VpdmluZyBvcGVyYXRpb24gcmVzdWx0XG4qIEBwYXJhbSB7cXVhdH0gcSBRdWF0ZXJuaW9uIHRvIGNyZWF0ZSBtYXRyaXggZnJvbVxuKlxuKiBAcmV0dXJucyB7bWF0M30gb3V0XG4qL1xubWF0My5mcm9tUXVhdCA9IGZ1bmN0aW9uIChvdXQsIHEpIHtcbiAgICB2YXIgeCA9IHFbMF0sIHkgPSBxWzFdLCB6ID0gcVsyXSwgdyA9IHFbM10sXG4gICAgICAgIHgyID0geCArIHgsXG4gICAgICAgIHkyID0geSArIHksXG4gICAgICAgIHoyID0geiArIHosXG5cbiAgICAgICAgeHggPSB4ICogeDIsXG4gICAgICAgIHl4ID0geSAqIHgyLFxuICAgICAgICB5eSA9IHkgKiB5MixcbiAgICAgICAgenggPSB6ICogeDIsXG4gICAgICAgIHp5ID0geiAqIHkyLFxuICAgICAgICB6eiA9IHogKiB6MixcbiAgICAgICAgd3ggPSB3ICogeDIsXG4gICAgICAgIHd5ID0gdyAqIHkyLFxuICAgICAgICB3eiA9IHcgKiB6MjtcblxuICAgIG91dFswXSA9IDEgLSB5eSAtIHp6O1xuICAgIG91dFszXSA9IHl4IC0gd3o7XG4gICAgb3V0WzZdID0genggKyB3eTtcblxuICAgIG91dFsxXSA9IHl4ICsgd3o7XG4gICAgb3V0WzRdID0gMSAtIHh4IC0geno7XG4gICAgb3V0WzddID0genkgLSB3eDtcblxuICAgIG91dFsyXSA9IHp4IC0gd3k7XG4gICAgb3V0WzVdID0genkgKyB3eDtcbiAgICBvdXRbOF0gPSAxIC0geHggLSB5eTtcblxuICAgIHJldHVybiBvdXQ7XG59O1xuXG4vKipcbiogQ2FsY3VsYXRlcyBhIDN4MyBub3JtYWwgbWF0cml4ICh0cmFuc3Bvc2UgaW52ZXJzZSkgZnJvbSB0aGUgNHg0IG1hdHJpeFxuKlxuKiBAcGFyYW0ge21hdDN9IG91dCBtYXQzIHJlY2VpdmluZyBvcGVyYXRpb24gcmVzdWx0XG4qIEBwYXJhbSB7bWF0NH0gYSBNYXQ0IHRvIGRlcml2ZSB0aGUgbm9ybWFsIG1hdHJpeCBmcm9tXG4qXG4qIEByZXR1cm5zIHttYXQzfSBvdXRcbiovXG5tYXQzLm5vcm1hbEZyb21NYXQ0ID0gZnVuY3Rpb24gKG91dCwgYSkge1xuICAgIHZhciBhMDAgPSBhWzBdLCBhMDEgPSBhWzFdLCBhMDIgPSBhWzJdLCBhMDMgPSBhWzNdLFxuICAgICAgICBhMTAgPSBhWzRdLCBhMTEgPSBhWzVdLCBhMTIgPSBhWzZdLCBhMTMgPSBhWzddLFxuICAgICAgICBhMjAgPSBhWzhdLCBhMjEgPSBhWzldLCBhMjIgPSBhWzEwXSwgYTIzID0gYVsxMV0sXG4gICAgICAgIGEzMCA9IGFbMTJdLCBhMzEgPSBhWzEzXSwgYTMyID0gYVsxNF0sIGEzMyA9IGFbMTVdLFxuXG4gICAgICAgIGIwMCA9IGEwMCAqIGExMSAtIGEwMSAqIGExMCxcbiAgICAgICAgYjAxID0gYTAwICogYTEyIC0gYTAyICogYTEwLFxuICAgICAgICBiMDIgPSBhMDAgKiBhMTMgLSBhMDMgKiBhMTAsXG4gICAgICAgIGIwMyA9IGEwMSAqIGExMiAtIGEwMiAqIGExMSxcbiAgICAgICAgYjA0ID0gYTAxICogYTEzIC0gYTAzICogYTExLFxuICAgICAgICBiMDUgPSBhMDIgKiBhMTMgLSBhMDMgKiBhMTIsXG4gICAgICAgIGIwNiA9IGEyMCAqIGEzMSAtIGEyMSAqIGEzMCxcbiAgICAgICAgYjA3ID0gYTIwICogYTMyIC0gYTIyICogYTMwLFxuICAgICAgICBiMDggPSBhMjAgKiBhMzMgLSBhMjMgKiBhMzAsXG4gICAgICAgIGIwOSA9IGEyMSAqIGEzMiAtIGEyMiAqIGEzMSxcbiAgICAgICAgYjEwID0gYTIxICogYTMzIC0gYTIzICogYTMxLFxuICAgICAgICBiMTEgPSBhMjIgKiBhMzMgLSBhMjMgKiBhMzIsXG5cbiAgICAgICAgLy8gQ2FsY3VsYXRlIHRoZSBkZXRlcm1pbmFudFxuICAgICAgICBkZXQgPSBiMDAgKiBiMTEgLSBiMDEgKiBiMTAgKyBiMDIgKiBiMDkgKyBiMDMgKiBiMDggLSBiMDQgKiBiMDcgKyBiMDUgKiBiMDY7XG5cbiAgICBpZiAoIWRldCkgeyBcbiAgICAgICAgcmV0dXJuIG51bGw7IFxuICAgIH1cbiAgICBkZXQgPSAxLjAgLyBkZXQ7XG5cbiAgICBvdXRbMF0gPSAoYTExICogYjExIC0gYTEyICogYjEwICsgYTEzICogYjA5KSAqIGRldDtcbiAgICBvdXRbMV0gPSAoYTEyICogYjA4IC0gYTEwICogYjExIC0gYTEzICogYjA3KSAqIGRldDtcbiAgICBvdXRbMl0gPSAoYTEwICogYjEwIC0gYTExICogYjA4ICsgYTEzICogYjA2KSAqIGRldDtcblxuICAgIG91dFszXSA9IChhMDIgKiBiMTAgLSBhMDEgKiBiMTEgLSBhMDMgKiBiMDkpICogZGV0O1xuICAgIG91dFs0XSA9IChhMDAgKiBiMTEgLSBhMDIgKiBiMDggKyBhMDMgKiBiMDcpICogZGV0O1xuICAgIG91dFs1XSA9IChhMDEgKiBiMDggLSBhMDAgKiBiMTAgLSBhMDMgKiBiMDYpICogZGV0O1xuXG4gICAgb3V0WzZdID0gKGEzMSAqIGIwNSAtIGEzMiAqIGIwNCArIGEzMyAqIGIwMykgKiBkZXQ7XG4gICAgb3V0WzddID0gKGEzMiAqIGIwMiAtIGEzMCAqIGIwNSAtIGEzMyAqIGIwMSkgKiBkZXQ7XG4gICAgb3V0WzhdID0gKGEzMCAqIGIwNCAtIGEzMSAqIGIwMiArIGEzMyAqIGIwMCkgKiBkZXQ7XG5cbiAgICByZXR1cm4gb3V0O1xufTtcblxuLyoqXG4gKiBSZXR1cm5zIGEgc3RyaW5nIHJlcHJlc2VudGF0aW9uIG9mIGEgbWF0M1xuICpcbiAqIEBwYXJhbSB7bWF0M30gbWF0IG1hdHJpeCB0byByZXByZXNlbnQgYXMgYSBzdHJpbmdcbiAqIEByZXR1cm5zIHtTdHJpbmd9IHN0cmluZyByZXByZXNlbnRhdGlvbiBvZiB0aGUgbWF0cml4XG4gKi9cbm1hdDMuc3RyID0gZnVuY3Rpb24gKGEpIHtcbiAgICByZXR1cm4gJ21hdDMoJyArIGFbMF0gKyAnLCAnICsgYVsxXSArICcsICcgKyBhWzJdICsgJywgJyArIFxuICAgICAgICAgICAgICAgICAgICBhWzNdICsgJywgJyArIGFbNF0gKyAnLCAnICsgYVs1XSArICcsICcgKyBcbiAgICAgICAgICAgICAgICAgICAgYVs2XSArICcsICcgKyBhWzddICsgJywgJyArIGFbOF0gKyAnKSc7XG59O1xuXG4vKipcbiAqIFJldHVybnMgRnJvYmVuaXVzIG5vcm0gb2YgYSBtYXQzXG4gKlxuICogQHBhcmFtIHttYXQzfSBhIHRoZSBtYXRyaXggdG8gY2FsY3VsYXRlIEZyb2Jlbml1cyBub3JtIG9mXG4gKiBAcmV0dXJucyB7TnVtYmVyfSBGcm9iZW5pdXMgbm9ybVxuICovXG5tYXQzLmZyb2IgPSBmdW5jdGlvbiAoYSkge1xuICAgIHJldHVybihNYXRoLnNxcnQoTWF0aC5wb3coYVswXSwgMikgKyBNYXRoLnBvdyhhWzFdLCAyKSArIE1hdGgucG93KGFbMl0sIDIpICsgTWF0aC5wb3coYVszXSwgMikgKyBNYXRoLnBvdyhhWzRdLCAyKSArIE1hdGgucG93KGFbNV0sIDIpICsgTWF0aC5wb3coYVs2XSwgMikgKyBNYXRoLnBvdyhhWzddLCAyKSArIE1hdGgucG93KGFbOF0sIDIpKSlcbn07XG5cblxuaWYodHlwZW9mKGV4cG9ydHMpICE9PSAndW5kZWZpbmVkJykge1xuICAgIGV4cG9ydHMubWF0MyA9IG1hdDM7XG59XG47XG4vKiBDb3B5cmlnaHQgKGMpIDIwMTMsIEJyYW5kb24gSm9uZXMsIENvbGluIE1hY0tlbnppZSBJVi4gQWxsIHJpZ2h0cyByZXNlcnZlZC5cblxuUmVkaXN0cmlidXRpb24gYW5kIHVzZSBpbiBzb3VyY2UgYW5kIGJpbmFyeSBmb3Jtcywgd2l0aCBvciB3aXRob3V0IG1vZGlmaWNhdGlvbixcbmFyZSBwZXJtaXR0ZWQgcHJvdmlkZWQgdGhhdCB0aGUgZm9sbG93aW5nIGNvbmRpdGlvbnMgYXJlIG1ldDpcblxuICAqIFJlZGlzdHJpYnV0aW9ucyBvZiBzb3VyY2UgY29kZSBtdXN0IHJldGFpbiB0aGUgYWJvdmUgY29weXJpZ2h0IG5vdGljZSwgdGhpc1xuICAgIGxpc3Qgb2YgY29uZGl0aW9ucyBhbmQgdGhlIGZvbGxvd2luZyBkaXNjbGFpbWVyLlxuICAqIFJlZGlzdHJpYnV0aW9ucyBpbiBiaW5hcnkgZm9ybSBtdXN0IHJlcHJvZHVjZSB0aGUgYWJvdmUgY29weXJpZ2h0IG5vdGljZSxcbiAgICB0aGlzIGxpc3Qgb2YgY29uZGl0aW9ucyBhbmQgdGhlIGZvbGxvd2luZyBkaXNjbGFpbWVyIGluIHRoZSBkb2N1bWVudGF0aW9uIFxuICAgIGFuZC9vciBvdGhlciBtYXRlcmlhbHMgcHJvdmlkZWQgd2l0aCB0aGUgZGlzdHJpYnV0aW9uLlxuXG5USElTIFNPRlRXQVJFIElTIFBST1ZJREVEIEJZIFRIRSBDT1BZUklHSFQgSE9MREVSUyBBTkQgQ09OVFJJQlVUT1JTIFwiQVMgSVNcIiBBTkRcbkFOWSBFWFBSRVNTIE9SIElNUExJRUQgV0FSUkFOVElFUywgSU5DTFVESU5HLCBCVVQgTk9UIExJTUlURUQgVE8sIFRIRSBJTVBMSUVEXG5XQVJSQU5USUVTIE9GIE1FUkNIQU5UQUJJTElUWSBBTkQgRklUTkVTUyBGT1IgQSBQQVJUSUNVTEFSIFBVUlBPU0UgQVJFIFxuRElTQ0xBSU1FRC4gSU4gTk8gRVZFTlQgU0hBTEwgVEhFIENPUFlSSUdIVCBIT0xERVIgT1IgQ09OVFJJQlVUT1JTIEJFIExJQUJMRSBGT1JcbkFOWSBESVJFQ1QsIElORElSRUNULCBJTkNJREVOVEFMLCBTUEVDSUFMLCBFWEVNUExBUlksIE9SIENPTlNFUVVFTlRJQUwgREFNQUdFU1xuKElOQ0xVRElORywgQlVUIE5PVCBMSU1JVEVEIFRPLCBQUk9DVVJFTUVOVCBPRiBTVUJTVElUVVRFIEdPT0RTIE9SIFNFUlZJQ0VTO1xuTE9TUyBPRiBVU0UsIERBVEEsIE9SIFBST0ZJVFM7IE9SIEJVU0lORVNTIElOVEVSUlVQVElPTikgSE9XRVZFUiBDQVVTRUQgQU5EIE9OXG5BTlkgVEhFT1JZIE9GIExJQUJJTElUWSwgV0hFVEhFUiBJTiBDT05UUkFDVCwgU1RSSUNUIExJQUJJTElUWSwgT1IgVE9SVFxuKElOQ0xVRElORyBORUdMSUdFTkNFIE9SIE9USEVSV0lTRSkgQVJJU0lORyBJTiBBTlkgV0FZIE9VVCBPRiBUSEUgVVNFIE9GIFRISVNcblNPRlRXQVJFLCBFVkVOIElGIEFEVklTRUQgT0YgVEhFIFBPU1NJQklMSVRZIE9GIFNVQ0ggREFNQUdFLiAqL1xuXG4vKipcbiAqIEBjbGFzcyA0eDQgTWF0cml4XG4gKiBAbmFtZSBtYXQ0XG4gKi9cblxudmFyIG1hdDQgPSB7fTtcblxuLyoqXG4gKiBDcmVhdGVzIGEgbmV3IGlkZW50aXR5IG1hdDRcbiAqXG4gKiBAcmV0dXJucyB7bWF0NH0gYSBuZXcgNHg0IG1hdHJpeFxuICovXG5tYXQ0LmNyZWF0ZSA9IGZ1bmN0aW9uKCkge1xuICAgIHZhciBvdXQgPSBuZXcgR0xNQVRfQVJSQVlfVFlQRSgxNik7XG4gICAgb3V0WzBdID0gMTtcbiAgICBvdXRbMV0gPSAwO1xuICAgIG91dFsyXSA9IDA7XG4gICAgb3V0WzNdID0gMDtcbiAgICBvdXRbNF0gPSAwO1xuICAgIG91dFs1XSA9IDE7XG4gICAgb3V0WzZdID0gMDtcbiAgICBvdXRbN10gPSAwO1xuICAgIG91dFs4XSA9IDA7XG4gICAgb3V0WzldID0gMDtcbiAgICBvdXRbMTBdID0gMTtcbiAgICBvdXRbMTFdID0gMDtcbiAgICBvdXRbMTJdID0gMDtcbiAgICBvdXRbMTNdID0gMDtcbiAgICBvdXRbMTRdID0gMDtcbiAgICBvdXRbMTVdID0gMTtcbiAgICByZXR1cm4gb3V0O1xufTtcblxuLyoqXG4gKiBDcmVhdGVzIGEgbmV3IG1hdDQgaW5pdGlhbGl6ZWQgd2l0aCB2YWx1ZXMgZnJvbSBhbiBleGlzdGluZyBtYXRyaXhcbiAqXG4gKiBAcGFyYW0ge21hdDR9IGEgbWF0cml4IHRvIGNsb25lXG4gKiBAcmV0dXJucyB7bWF0NH0gYSBuZXcgNHg0IG1hdHJpeFxuICovXG5tYXQ0LmNsb25lID0gZnVuY3Rpb24oYSkge1xuICAgIHZhciBvdXQgPSBuZXcgR0xNQVRfQVJSQVlfVFlQRSgxNik7XG4gICAgb3V0WzBdID0gYVswXTtcbiAgICBvdXRbMV0gPSBhWzFdO1xuICAgIG91dFsyXSA9IGFbMl07XG4gICAgb3V0WzNdID0gYVszXTtcbiAgICBvdXRbNF0gPSBhWzRdO1xuICAgIG91dFs1XSA9IGFbNV07XG4gICAgb3V0WzZdID0gYVs2XTtcbiAgICBvdXRbN10gPSBhWzddO1xuICAgIG91dFs4XSA9IGFbOF07XG4gICAgb3V0WzldID0gYVs5XTtcbiAgICBvdXRbMTBdID0gYVsxMF07XG4gICAgb3V0WzExXSA9IGFbMTFdO1xuICAgIG91dFsxMl0gPSBhWzEyXTtcbiAgICBvdXRbMTNdID0gYVsxM107XG4gICAgb3V0WzE0XSA9IGFbMTRdO1xuICAgIG91dFsxNV0gPSBhWzE1XTtcbiAgICByZXR1cm4gb3V0O1xufTtcblxuLyoqXG4gKiBDb3B5IHRoZSB2YWx1ZXMgZnJvbSBvbmUgbWF0NCB0byBhbm90aGVyXG4gKlxuICogQHBhcmFtIHttYXQ0fSBvdXQgdGhlIHJlY2VpdmluZyBtYXRyaXhcbiAqIEBwYXJhbSB7bWF0NH0gYSB0aGUgc291cmNlIG1hdHJpeFxuICogQHJldHVybnMge21hdDR9IG91dFxuICovXG5tYXQ0LmNvcHkgPSBmdW5jdGlvbihvdXQsIGEpIHtcbiAgICBvdXRbMF0gPSBhWzBdO1xuICAgIG91dFsxXSA9IGFbMV07XG4gICAgb3V0WzJdID0gYVsyXTtcbiAgICBvdXRbM10gPSBhWzNdO1xuICAgIG91dFs0XSA9IGFbNF07XG4gICAgb3V0WzVdID0gYVs1XTtcbiAgICBvdXRbNl0gPSBhWzZdO1xuICAgIG91dFs3XSA9IGFbN107XG4gICAgb3V0WzhdID0gYVs4XTtcbiAgICBvdXRbOV0gPSBhWzldO1xuICAgIG91dFsxMF0gPSBhWzEwXTtcbiAgICBvdXRbMTFdID0gYVsxMV07XG4gICAgb3V0WzEyXSA9IGFbMTJdO1xuICAgIG91dFsxM10gPSBhWzEzXTtcbiAgICBvdXRbMTRdID0gYVsxNF07XG4gICAgb3V0WzE1XSA9IGFbMTVdO1xuICAgIHJldHVybiBvdXQ7XG59O1xuXG4vKipcbiAqIFNldCBhIG1hdDQgdG8gdGhlIGlkZW50aXR5IG1hdHJpeFxuICpcbiAqIEBwYXJhbSB7bWF0NH0gb3V0IHRoZSByZWNlaXZpbmcgbWF0cml4XG4gKiBAcmV0dXJucyB7bWF0NH0gb3V0XG4gKi9cbm1hdDQuaWRlbnRpdHkgPSBmdW5jdGlvbihvdXQpIHtcbiAgICBvdXRbMF0gPSAxO1xuICAgIG91dFsxXSA9IDA7XG4gICAgb3V0WzJdID0gMDtcbiAgICBvdXRbM10gPSAwO1xuICAgIG91dFs0XSA9IDA7XG4gICAgb3V0WzVdID0gMTtcbiAgICBvdXRbNl0gPSAwO1xuICAgIG91dFs3XSA9IDA7XG4gICAgb3V0WzhdID0gMDtcbiAgICBvdXRbOV0gPSAwO1xuICAgIG91dFsxMF0gPSAxO1xuICAgIG91dFsxMV0gPSAwO1xuICAgIG91dFsxMl0gPSAwO1xuICAgIG91dFsxM10gPSAwO1xuICAgIG91dFsxNF0gPSAwO1xuICAgIG91dFsxNV0gPSAxO1xuICAgIHJldHVybiBvdXQ7XG59O1xuXG4vKipcbiAqIFRyYW5zcG9zZSB0aGUgdmFsdWVzIG9mIGEgbWF0NFxuICpcbiAqIEBwYXJhbSB7bWF0NH0gb3V0IHRoZSByZWNlaXZpbmcgbWF0cml4XG4gKiBAcGFyYW0ge21hdDR9IGEgdGhlIHNvdXJjZSBtYXRyaXhcbiAqIEByZXR1cm5zIHttYXQ0fSBvdXRcbiAqL1xubWF0NC50cmFuc3Bvc2UgPSBmdW5jdGlvbihvdXQsIGEpIHtcbiAgICAvLyBJZiB3ZSBhcmUgdHJhbnNwb3Npbmcgb3Vyc2VsdmVzIHdlIGNhbiBza2lwIGEgZmV3IHN0ZXBzIGJ1dCBoYXZlIHRvIGNhY2hlIHNvbWUgdmFsdWVzXG4gICAgaWYgKG91dCA9PT0gYSkge1xuICAgICAgICB2YXIgYTAxID0gYVsxXSwgYTAyID0gYVsyXSwgYTAzID0gYVszXSxcbiAgICAgICAgICAgIGExMiA9IGFbNl0sIGExMyA9IGFbN10sXG4gICAgICAgICAgICBhMjMgPSBhWzExXTtcblxuICAgICAgICBvdXRbMV0gPSBhWzRdO1xuICAgICAgICBvdXRbMl0gPSBhWzhdO1xuICAgICAgICBvdXRbM10gPSBhWzEyXTtcbiAgICAgICAgb3V0WzRdID0gYTAxO1xuICAgICAgICBvdXRbNl0gPSBhWzldO1xuICAgICAgICBvdXRbN10gPSBhWzEzXTtcbiAgICAgICAgb3V0WzhdID0gYTAyO1xuICAgICAgICBvdXRbOV0gPSBhMTI7XG4gICAgICAgIG91dFsxMV0gPSBhWzE0XTtcbiAgICAgICAgb3V0WzEyXSA9IGEwMztcbiAgICAgICAgb3V0WzEzXSA9IGExMztcbiAgICAgICAgb3V0WzE0XSA9IGEyMztcbiAgICB9IGVsc2Uge1xuICAgICAgICBvdXRbMF0gPSBhWzBdO1xuICAgICAgICBvdXRbMV0gPSBhWzRdO1xuICAgICAgICBvdXRbMl0gPSBhWzhdO1xuICAgICAgICBvdXRbM10gPSBhWzEyXTtcbiAgICAgICAgb3V0WzRdID0gYVsxXTtcbiAgICAgICAgb3V0WzVdID0gYVs1XTtcbiAgICAgICAgb3V0WzZdID0gYVs5XTtcbiAgICAgICAgb3V0WzddID0gYVsxM107XG4gICAgICAgIG91dFs4XSA9IGFbMl07XG4gICAgICAgIG91dFs5XSA9IGFbNl07XG4gICAgICAgIG91dFsxMF0gPSBhWzEwXTtcbiAgICAgICAgb3V0WzExXSA9IGFbMTRdO1xuICAgICAgICBvdXRbMTJdID0gYVszXTtcbiAgICAgICAgb3V0WzEzXSA9IGFbN107XG4gICAgICAgIG91dFsxNF0gPSBhWzExXTtcbiAgICAgICAgb3V0WzE1XSA9IGFbMTVdO1xuICAgIH1cbiAgICBcbiAgICByZXR1cm4gb3V0O1xufTtcblxuLyoqXG4gKiBJbnZlcnRzIGEgbWF0NFxuICpcbiAqIEBwYXJhbSB7bWF0NH0gb3V0IHRoZSByZWNlaXZpbmcgbWF0cml4XG4gKiBAcGFyYW0ge21hdDR9IGEgdGhlIHNvdXJjZSBtYXRyaXhcbiAqIEByZXR1cm5zIHttYXQ0fSBvdXRcbiAqL1xubWF0NC5pbnZlcnQgPSBmdW5jdGlvbihvdXQsIGEpIHtcbiAgICB2YXIgYTAwID0gYVswXSwgYTAxID0gYVsxXSwgYTAyID0gYVsyXSwgYTAzID0gYVszXSxcbiAgICAgICAgYTEwID0gYVs0XSwgYTExID0gYVs1XSwgYTEyID0gYVs2XSwgYTEzID0gYVs3XSxcbiAgICAgICAgYTIwID0gYVs4XSwgYTIxID0gYVs5XSwgYTIyID0gYVsxMF0sIGEyMyA9IGFbMTFdLFxuICAgICAgICBhMzAgPSBhWzEyXSwgYTMxID0gYVsxM10sIGEzMiA9IGFbMTRdLCBhMzMgPSBhWzE1XSxcblxuICAgICAgICBiMDAgPSBhMDAgKiBhMTEgLSBhMDEgKiBhMTAsXG4gICAgICAgIGIwMSA9IGEwMCAqIGExMiAtIGEwMiAqIGExMCxcbiAgICAgICAgYjAyID0gYTAwICogYTEzIC0gYTAzICogYTEwLFxuICAgICAgICBiMDMgPSBhMDEgKiBhMTIgLSBhMDIgKiBhMTEsXG4gICAgICAgIGIwNCA9IGEwMSAqIGExMyAtIGEwMyAqIGExMSxcbiAgICAgICAgYjA1ID0gYTAyICogYTEzIC0gYTAzICogYTEyLFxuICAgICAgICBiMDYgPSBhMjAgKiBhMzEgLSBhMjEgKiBhMzAsXG4gICAgICAgIGIwNyA9IGEyMCAqIGEzMiAtIGEyMiAqIGEzMCxcbiAgICAgICAgYjA4ID0gYTIwICogYTMzIC0gYTIzICogYTMwLFxuICAgICAgICBiMDkgPSBhMjEgKiBhMzIgLSBhMjIgKiBhMzEsXG4gICAgICAgIGIxMCA9IGEyMSAqIGEzMyAtIGEyMyAqIGEzMSxcbiAgICAgICAgYjExID0gYTIyICogYTMzIC0gYTIzICogYTMyLFxuXG4gICAgICAgIC8vIENhbGN1bGF0ZSB0aGUgZGV0ZXJtaW5hbnRcbiAgICAgICAgZGV0ID0gYjAwICogYjExIC0gYjAxICogYjEwICsgYjAyICogYjA5ICsgYjAzICogYjA4IC0gYjA0ICogYjA3ICsgYjA1ICogYjA2O1xuXG4gICAgaWYgKCFkZXQpIHsgXG4gICAgICAgIHJldHVybiBudWxsOyBcbiAgICB9XG4gICAgZGV0ID0gMS4wIC8gZGV0O1xuXG4gICAgb3V0WzBdID0gKGExMSAqIGIxMSAtIGExMiAqIGIxMCArIGExMyAqIGIwOSkgKiBkZXQ7XG4gICAgb3V0WzFdID0gKGEwMiAqIGIxMCAtIGEwMSAqIGIxMSAtIGEwMyAqIGIwOSkgKiBkZXQ7XG4gICAgb3V0WzJdID0gKGEzMSAqIGIwNSAtIGEzMiAqIGIwNCArIGEzMyAqIGIwMykgKiBkZXQ7XG4gICAgb3V0WzNdID0gKGEyMiAqIGIwNCAtIGEyMSAqIGIwNSAtIGEyMyAqIGIwMykgKiBkZXQ7XG4gICAgb3V0WzRdID0gKGExMiAqIGIwOCAtIGExMCAqIGIxMSAtIGExMyAqIGIwNykgKiBkZXQ7XG4gICAgb3V0WzVdID0gKGEwMCAqIGIxMSAtIGEwMiAqIGIwOCArIGEwMyAqIGIwNykgKiBkZXQ7XG4gICAgb3V0WzZdID0gKGEzMiAqIGIwMiAtIGEzMCAqIGIwNSAtIGEzMyAqIGIwMSkgKiBkZXQ7XG4gICAgb3V0WzddID0gKGEyMCAqIGIwNSAtIGEyMiAqIGIwMiArIGEyMyAqIGIwMSkgKiBkZXQ7XG4gICAgb3V0WzhdID0gKGExMCAqIGIxMCAtIGExMSAqIGIwOCArIGExMyAqIGIwNikgKiBkZXQ7XG4gICAgb3V0WzldID0gKGEwMSAqIGIwOCAtIGEwMCAqIGIxMCAtIGEwMyAqIGIwNikgKiBkZXQ7XG4gICAgb3V0WzEwXSA9IChhMzAgKiBiMDQgLSBhMzEgKiBiMDIgKyBhMzMgKiBiMDApICogZGV0O1xuICAgIG91dFsxMV0gPSAoYTIxICogYjAyIC0gYTIwICogYjA0IC0gYTIzICogYjAwKSAqIGRldDtcbiAgICBvdXRbMTJdID0gKGExMSAqIGIwNyAtIGExMCAqIGIwOSAtIGExMiAqIGIwNikgKiBkZXQ7XG4gICAgb3V0WzEzXSA9IChhMDAgKiBiMDkgLSBhMDEgKiBiMDcgKyBhMDIgKiBiMDYpICogZGV0O1xuICAgIG91dFsxNF0gPSAoYTMxICogYjAxIC0gYTMwICogYjAzIC0gYTMyICogYjAwKSAqIGRldDtcbiAgICBvdXRbMTVdID0gKGEyMCAqIGIwMyAtIGEyMSAqIGIwMSArIGEyMiAqIGIwMCkgKiBkZXQ7XG5cbiAgICByZXR1cm4gb3V0O1xufTtcblxuLyoqXG4gKiBDYWxjdWxhdGVzIHRoZSBhZGp1Z2F0ZSBvZiBhIG1hdDRcbiAqXG4gKiBAcGFyYW0ge21hdDR9IG91dCB0aGUgcmVjZWl2aW5nIG1hdHJpeFxuICogQHBhcmFtIHttYXQ0fSBhIHRoZSBzb3VyY2UgbWF0cml4XG4gKiBAcmV0dXJucyB7bWF0NH0gb3V0XG4gKi9cbm1hdDQuYWRqb2ludCA9IGZ1bmN0aW9uKG91dCwgYSkge1xuICAgIHZhciBhMDAgPSBhWzBdLCBhMDEgPSBhWzFdLCBhMDIgPSBhWzJdLCBhMDMgPSBhWzNdLFxuICAgICAgICBhMTAgPSBhWzRdLCBhMTEgPSBhWzVdLCBhMTIgPSBhWzZdLCBhMTMgPSBhWzddLFxuICAgICAgICBhMjAgPSBhWzhdLCBhMjEgPSBhWzldLCBhMjIgPSBhWzEwXSwgYTIzID0gYVsxMV0sXG4gICAgICAgIGEzMCA9IGFbMTJdLCBhMzEgPSBhWzEzXSwgYTMyID0gYVsxNF0sIGEzMyA9IGFbMTVdO1xuXG4gICAgb3V0WzBdICA9ICAoYTExICogKGEyMiAqIGEzMyAtIGEyMyAqIGEzMikgLSBhMjEgKiAoYTEyICogYTMzIC0gYTEzICogYTMyKSArIGEzMSAqIChhMTIgKiBhMjMgLSBhMTMgKiBhMjIpKTtcbiAgICBvdXRbMV0gID0gLShhMDEgKiAoYTIyICogYTMzIC0gYTIzICogYTMyKSAtIGEyMSAqIChhMDIgKiBhMzMgLSBhMDMgKiBhMzIpICsgYTMxICogKGEwMiAqIGEyMyAtIGEwMyAqIGEyMikpO1xuICAgIG91dFsyXSAgPSAgKGEwMSAqIChhMTIgKiBhMzMgLSBhMTMgKiBhMzIpIC0gYTExICogKGEwMiAqIGEzMyAtIGEwMyAqIGEzMikgKyBhMzEgKiAoYTAyICogYTEzIC0gYTAzICogYTEyKSk7XG4gICAgb3V0WzNdICA9IC0oYTAxICogKGExMiAqIGEyMyAtIGExMyAqIGEyMikgLSBhMTEgKiAoYTAyICogYTIzIC0gYTAzICogYTIyKSArIGEyMSAqIChhMDIgKiBhMTMgLSBhMDMgKiBhMTIpKTtcbiAgICBvdXRbNF0gID0gLShhMTAgKiAoYTIyICogYTMzIC0gYTIzICogYTMyKSAtIGEyMCAqIChhMTIgKiBhMzMgLSBhMTMgKiBhMzIpICsgYTMwICogKGExMiAqIGEyMyAtIGExMyAqIGEyMikpO1xuICAgIG91dFs1XSAgPSAgKGEwMCAqIChhMjIgKiBhMzMgLSBhMjMgKiBhMzIpIC0gYTIwICogKGEwMiAqIGEzMyAtIGEwMyAqIGEzMikgKyBhMzAgKiAoYTAyICogYTIzIC0gYTAzICogYTIyKSk7XG4gICAgb3V0WzZdICA9IC0oYTAwICogKGExMiAqIGEzMyAtIGExMyAqIGEzMikgLSBhMTAgKiAoYTAyICogYTMzIC0gYTAzICogYTMyKSArIGEzMCAqIChhMDIgKiBhMTMgLSBhMDMgKiBhMTIpKTtcbiAgICBvdXRbN10gID0gIChhMDAgKiAoYTEyICogYTIzIC0gYTEzICogYTIyKSAtIGExMCAqIChhMDIgKiBhMjMgLSBhMDMgKiBhMjIpICsgYTIwICogKGEwMiAqIGExMyAtIGEwMyAqIGExMikpO1xuICAgIG91dFs4XSAgPSAgKGExMCAqIChhMjEgKiBhMzMgLSBhMjMgKiBhMzEpIC0gYTIwICogKGExMSAqIGEzMyAtIGExMyAqIGEzMSkgKyBhMzAgKiAoYTExICogYTIzIC0gYTEzICogYTIxKSk7XG4gICAgb3V0WzldICA9IC0oYTAwICogKGEyMSAqIGEzMyAtIGEyMyAqIGEzMSkgLSBhMjAgKiAoYTAxICogYTMzIC0gYTAzICogYTMxKSArIGEzMCAqIChhMDEgKiBhMjMgLSBhMDMgKiBhMjEpKTtcbiAgICBvdXRbMTBdID0gIChhMDAgKiAoYTExICogYTMzIC0gYTEzICogYTMxKSAtIGExMCAqIChhMDEgKiBhMzMgLSBhMDMgKiBhMzEpICsgYTMwICogKGEwMSAqIGExMyAtIGEwMyAqIGExMSkpO1xuICAgIG91dFsxMV0gPSAtKGEwMCAqIChhMTEgKiBhMjMgLSBhMTMgKiBhMjEpIC0gYTEwICogKGEwMSAqIGEyMyAtIGEwMyAqIGEyMSkgKyBhMjAgKiAoYTAxICogYTEzIC0gYTAzICogYTExKSk7XG4gICAgb3V0WzEyXSA9IC0oYTEwICogKGEyMSAqIGEzMiAtIGEyMiAqIGEzMSkgLSBhMjAgKiAoYTExICogYTMyIC0gYTEyICogYTMxKSArIGEzMCAqIChhMTEgKiBhMjIgLSBhMTIgKiBhMjEpKTtcbiAgICBvdXRbMTNdID0gIChhMDAgKiAoYTIxICogYTMyIC0gYTIyICogYTMxKSAtIGEyMCAqIChhMDEgKiBhMzIgLSBhMDIgKiBhMzEpICsgYTMwICogKGEwMSAqIGEyMiAtIGEwMiAqIGEyMSkpO1xuICAgIG91dFsxNF0gPSAtKGEwMCAqIChhMTEgKiBhMzIgLSBhMTIgKiBhMzEpIC0gYTEwICogKGEwMSAqIGEzMiAtIGEwMiAqIGEzMSkgKyBhMzAgKiAoYTAxICogYTEyIC0gYTAyICogYTExKSk7XG4gICAgb3V0WzE1XSA9ICAoYTAwICogKGExMSAqIGEyMiAtIGExMiAqIGEyMSkgLSBhMTAgKiAoYTAxICogYTIyIC0gYTAyICogYTIxKSArIGEyMCAqIChhMDEgKiBhMTIgLSBhMDIgKiBhMTEpKTtcbiAgICByZXR1cm4gb3V0O1xufTtcblxuLyoqXG4gKiBDYWxjdWxhdGVzIHRoZSBkZXRlcm1pbmFudCBvZiBhIG1hdDRcbiAqXG4gKiBAcGFyYW0ge21hdDR9IGEgdGhlIHNvdXJjZSBtYXRyaXhcbiAqIEByZXR1cm5zIHtOdW1iZXJ9IGRldGVybWluYW50IG9mIGFcbiAqL1xubWF0NC5kZXRlcm1pbmFudCA9IGZ1bmN0aW9uIChhKSB7XG4gICAgdmFyIGEwMCA9IGFbMF0sIGEwMSA9IGFbMV0sIGEwMiA9IGFbMl0sIGEwMyA9IGFbM10sXG4gICAgICAgIGExMCA9IGFbNF0sIGExMSA9IGFbNV0sIGExMiA9IGFbNl0sIGExMyA9IGFbN10sXG4gICAgICAgIGEyMCA9IGFbOF0sIGEyMSA9IGFbOV0sIGEyMiA9IGFbMTBdLCBhMjMgPSBhWzExXSxcbiAgICAgICAgYTMwID0gYVsxMl0sIGEzMSA9IGFbMTNdLCBhMzIgPSBhWzE0XSwgYTMzID0gYVsxNV0sXG5cbiAgICAgICAgYjAwID0gYTAwICogYTExIC0gYTAxICogYTEwLFxuICAgICAgICBiMDEgPSBhMDAgKiBhMTIgLSBhMDIgKiBhMTAsXG4gICAgICAgIGIwMiA9IGEwMCAqIGExMyAtIGEwMyAqIGExMCxcbiAgICAgICAgYjAzID0gYTAxICogYTEyIC0gYTAyICogYTExLFxuICAgICAgICBiMDQgPSBhMDEgKiBhMTMgLSBhMDMgKiBhMTEsXG4gICAgICAgIGIwNSA9IGEwMiAqIGExMyAtIGEwMyAqIGExMixcbiAgICAgICAgYjA2ID0gYTIwICogYTMxIC0gYTIxICogYTMwLFxuICAgICAgICBiMDcgPSBhMjAgKiBhMzIgLSBhMjIgKiBhMzAsXG4gICAgICAgIGIwOCA9IGEyMCAqIGEzMyAtIGEyMyAqIGEzMCxcbiAgICAgICAgYjA5ID0gYTIxICogYTMyIC0gYTIyICogYTMxLFxuICAgICAgICBiMTAgPSBhMjEgKiBhMzMgLSBhMjMgKiBhMzEsXG4gICAgICAgIGIxMSA9IGEyMiAqIGEzMyAtIGEyMyAqIGEzMjtcblxuICAgIC8vIENhbGN1bGF0ZSB0aGUgZGV0ZXJtaW5hbnRcbiAgICByZXR1cm4gYjAwICogYjExIC0gYjAxICogYjEwICsgYjAyICogYjA5ICsgYjAzICogYjA4IC0gYjA0ICogYjA3ICsgYjA1ICogYjA2O1xufTtcblxuLyoqXG4gKiBNdWx0aXBsaWVzIHR3byBtYXQ0J3NcbiAqXG4gKiBAcGFyYW0ge21hdDR9IG91dCB0aGUgcmVjZWl2aW5nIG1hdHJpeFxuICogQHBhcmFtIHttYXQ0fSBhIHRoZSBmaXJzdCBvcGVyYW5kXG4gKiBAcGFyYW0ge21hdDR9IGIgdGhlIHNlY29uZCBvcGVyYW5kXG4gKiBAcmV0dXJucyB7bWF0NH0gb3V0XG4gKi9cbm1hdDQubXVsdGlwbHkgPSBmdW5jdGlvbiAob3V0LCBhLCBiKSB7XG4gICAgdmFyIGEwMCA9IGFbMF0sIGEwMSA9IGFbMV0sIGEwMiA9IGFbMl0sIGEwMyA9IGFbM10sXG4gICAgICAgIGExMCA9IGFbNF0sIGExMSA9IGFbNV0sIGExMiA9IGFbNl0sIGExMyA9IGFbN10sXG4gICAgICAgIGEyMCA9IGFbOF0sIGEyMSA9IGFbOV0sIGEyMiA9IGFbMTBdLCBhMjMgPSBhWzExXSxcbiAgICAgICAgYTMwID0gYVsxMl0sIGEzMSA9IGFbMTNdLCBhMzIgPSBhWzE0XSwgYTMzID0gYVsxNV07XG5cbiAgICAvLyBDYWNoZSBvbmx5IHRoZSBjdXJyZW50IGxpbmUgb2YgdGhlIHNlY29uZCBtYXRyaXhcbiAgICB2YXIgYjAgID0gYlswXSwgYjEgPSBiWzFdLCBiMiA9IGJbMl0sIGIzID0gYlszXTsgIFxuICAgIG91dFswXSA9IGIwKmEwMCArIGIxKmExMCArIGIyKmEyMCArIGIzKmEzMDtcbiAgICBvdXRbMV0gPSBiMCphMDEgKyBiMSphMTEgKyBiMiphMjEgKyBiMyphMzE7XG4gICAgb3V0WzJdID0gYjAqYTAyICsgYjEqYTEyICsgYjIqYTIyICsgYjMqYTMyO1xuICAgIG91dFszXSA9IGIwKmEwMyArIGIxKmExMyArIGIyKmEyMyArIGIzKmEzMztcblxuICAgIGIwID0gYls0XTsgYjEgPSBiWzVdOyBiMiA9IGJbNl07IGIzID0gYls3XTtcbiAgICBvdXRbNF0gPSBiMCphMDAgKyBiMSphMTAgKyBiMiphMjAgKyBiMyphMzA7XG4gICAgb3V0WzVdID0gYjAqYTAxICsgYjEqYTExICsgYjIqYTIxICsgYjMqYTMxO1xuICAgIG91dFs2XSA9IGIwKmEwMiArIGIxKmExMiArIGIyKmEyMiArIGIzKmEzMjtcbiAgICBvdXRbN10gPSBiMCphMDMgKyBiMSphMTMgKyBiMiphMjMgKyBiMyphMzM7XG5cbiAgICBiMCA9IGJbOF07IGIxID0gYls5XTsgYjIgPSBiWzEwXTsgYjMgPSBiWzExXTtcbiAgICBvdXRbOF0gPSBiMCphMDAgKyBiMSphMTAgKyBiMiphMjAgKyBiMyphMzA7XG4gICAgb3V0WzldID0gYjAqYTAxICsgYjEqYTExICsgYjIqYTIxICsgYjMqYTMxO1xuICAgIG91dFsxMF0gPSBiMCphMDIgKyBiMSphMTIgKyBiMiphMjIgKyBiMyphMzI7XG4gICAgb3V0WzExXSA9IGIwKmEwMyArIGIxKmExMyArIGIyKmEyMyArIGIzKmEzMztcblxuICAgIGIwID0gYlsxMl07IGIxID0gYlsxM107IGIyID0gYlsxNF07IGIzID0gYlsxNV07XG4gICAgb3V0WzEyXSA9IGIwKmEwMCArIGIxKmExMCArIGIyKmEyMCArIGIzKmEzMDtcbiAgICBvdXRbMTNdID0gYjAqYTAxICsgYjEqYTExICsgYjIqYTIxICsgYjMqYTMxO1xuICAgIG91dFsxNF0gPSBiMCphMDIgKyBiMSphMTIgKyBiMiphMjIgKyBiMyphMzI7XG4gICAgb3V0WzE1XSA9IGIwKmEwMyArIGIxKmExMyArIGIyKmEyMyArIGIzKmEzMztcbiAgICByZXR1cm4gb3V0O1xufTtcblxuLyoqXG4gKiBBbGlhcyBmb3Ige0BsaW5rIG1hdDQubXVsdGlwbHl9XG4gKiBAZnVuY3Rpb25cbiAqL1xubWF0NC5tdWwgPSBtYXQ0Lm11bHRpcGx5O1xuXG4vKipcbiAqIFRyYW5zbGF0ZSBhIG1hdDQgYnkgdGhlIGdpdmVuIHZlY3RvclxuICpcbiAqIEBwYXJhbSB7bWF0NH0gb3V0IHRoZSByZWNlaXZpbmcgbWF0cml4XG4gKiBAcGFyYW0ge21hdDR9IGEgdGhlIG1hdHJpeCB0byB0cmFuc2xhdGVcbiAqIEBwYXJhbSB7dmVjM30gdiB2ZWN0b3IgdG8gdHJhbnNsYXRlIGJ5XG4gKiBAcmV0dXJucyB7bWF0NH0gb3V0XG4gKi9cbm1hdDQudHJhbnNsYXRlID0gZnVuY3Rpb24gKG91dCwgYSwgdikge1xuICAgIHZhciB4ID0gdlswXSwgeSA9IHZbMV0sIHogPSB2WzJdLFxuICAgICAgICBhMDAsIGEwMSwgYTAyLCBhMDMsXG4gICAgICAgIGExMCwgYTExLCBhMTIsIGExMyxcbiAgICAgICAgYTIwLCBhMjEsIGEyMiwgYTIzO1xuXG4gICAgaWYgKGEgPT09IG91dCkge1xuICAgICAgICBvdXRbMTJdID0gYVswXSAqIHggKyBhWzRdICogeSArIGFbOF0gKiB6ICsgYVsxMl07XG4gICAgICAgIG91dFsxM10gPSBhWzFdICogeCArIGFbNV0gKiB5ICsgYVs5XSAqIHogKyBhWzEzXTtcbiAgICAgICAgb3V0WzE0XSA9IGFbMl0gKiB4ICsgYVs2XSAqIHkgKyBhWzEwXSAqIHogKyBhWzE0XTtcbiAgICAgICAgb3V0WzE1XSA9IGFbM10gKiB4ICsgYVs3XSAqIHkgKyBhWzExXSAqIHogKyBhWzE1XTtcbiAgICB9IGVsc2Uge1xuICAgICAgICBhMDAgPSBhWzBdOyBhMDEgPSBhWzFdOyBhMDIgPSBhWzJdOyBhMDMgPSBhWzNdO1xuICAgICAgICBhMTAgPSBhWzRdOyBhMTEgPSBhWzVdOyBhMTIgPSBhWzZdOyBhMTMgPSBhWzddO1xuICAgICAgICBhMjAgPSBhWzhdOyBhMjEgPSBhWzldOyBhMjIgPSBhWzEwXTsgYTIzID0gYVsxMV07XG5cbiAgICAgICAgb3V0WzBdID0gYTAwOyBvdXRbMV0gPSBhMDE7IG91dFsyXSA9IGEwMjsgb3V0WzNdID0gYTAzO1xuICAgICAgICBvdXRbNF0gPSBhMTA7IG91dFs1XSA9IGExMTsgb3V0WzZdID0gYTEyOyBvdXRbN10gPSBhMTM7XG4gICAgICAgIG91dFs4XSA9IGEyMDsgb3V0WzldID0gYTIxOyBvdXRbMTBdID0gYTIyOyBvdXRbMTFdID0gYTIzO1xuXG4gICAgICAgIG91dFsxMl0gPSBhMDAgKiB4ICsgYTEwICogeSArIGEyMCAqIHogKyBhWzEyXTtcbiAgICAgICAgb3V0WzEzXSA9IGEwMSAqIHggKyBhMTEgKiB5ICsgYTIxICogeiArIGFbMTNdO1xuICAgICAgICBvdXRbMTRdID0gYTAyICogeCArIGExMiAqIHkgKyBhMjIgKiB6ICsgYVsxNF07XG4gICAgICAgIG91dFsxNV0gPSBhMDMgKiB4ICsgYTEzICogeSArIGEyMyAqIHogKyBhWzE1XTtcbiAgICB9XG5cbiAgICByZXR1cm4gb3V0O1xufTtcblxuLyoqXG4gKiBTY2FsZXMgdGhlIG1hdDQgYnkgdGhlIGRpbWVuc2lvbnMgaW4gdGhlIGdpdmVuIHZlYzNcbiAqXG4gKiBAcGFyYW0ge21hdDR9IG91dCB0aGUgcmVjZWl2aW5nIG1hdHJpeFxuICogQHBhcmFtIHttYXQ0fSBhIHRoZSBtYXRyaXggdG8gc2NhbGVcbiAqIEBwYXJhbSB7dmVjM30gdiB0aGUgdmVjMyB0byBzY2FsZSB0aGUgbWF0cml4IGJ5XG4gKiBAcmV0dXJucyB7bWF0NH0gb3V0XG4gKiovXG5tYXQ0LnNjYWxlID0gZnVuY3Rpb24ob3V0LCBhLCB2KSB7XG4gICAgdmFyIHggPSB2WzBdLCB5ID0gdlsxXSwgeiA9IHZbMl07XG5cbiAgICBvdXRbMF0gPSBhWzBdICogeDtcbiAgICBvdXRbMV0gPSBhWzFdICogeDtcbiAgICBvdXRbMl0gPSBhWzJdICogeDtcbiAgICBvdXRbM10gPSBhWzNdICogeDtcbiAgICBvdXRbNF0gPSBhWzRdICogeTtcbiAgICBvdXRbNV0gPSBhWzVdICogeTtcbiAgICBvdXRbNl0gPSBhWzZdICogeTtcbiAgICBvdXRbN10gPSBhWzddICogeTtcbiAgICBvdXRbOF0gPSBhWzhdICogejtcbiAgICBvdXRbOV0gPSBhWzldICogejtcbiAgICBvdXRbMTBdID0gYVsxMF0gKiB6O1xuICAgIG91dFsxMV0gPSBhWzExXSAqIHo7XG4gICAgb3V0WzEyXSA9IGFbMTJdO1xuICAgIG91dFsxM10gPSBhWzEzXTtcbiAgICBvdXRbMTRdID0gYVsxNF07XG4gICAgb3V0WzE1XSA9IGFbMTVdO1xuICAgIHJldHVybiBvdXQ7XG59O1xuXG4vKipcbiAqIFJvdGF0ZXMgYSBtYXQ0IGJ5IHRoZSBnaXZlbiBhbmdsZVxuICpcbiAqIEBwYXJhbSB7bWF0NH0gb3V0IHRoZSByZWNlaXZpbmcgbWF0cml4XG4gKiBAcGFyYW0ge21hdDR9IGEgdGhlIG1hdHJpeCB0byByb3RhdGVcbiAqIEBwYXJhbSB7TnVtYmVyfSByYWQgdGhlIGFuZ2xlIHRvIHJvdGF0ZSB0aGUgbWF0cml4IGJ5XG4gKiBAcGFyYW0ge3ZlYzN9IGF4aXMgdGhlIGF4aXMgdG8gcm90YXRlIGFyb3VuZFxuICogQHJldHVybnMge21hdDR9IG91dFxuICovXG5tYXQ0LnJvdGF0ZSA9IGZ1bmN0aW9uIChvdXQsIGEsIHJhZCwgYXhpcykge1xuICAgIHZhciB4ID0gYXhpc1swXSwgeSA9IGF4aXNbMV0sIHogPSBheGlzWzJdLFxuICAgICAgICBsZW4gPSBNYXRoLnNxcnQoeCAqIHggKyB5ICogeSArIHogKiB6KSxcbiAgICAgICAgcywgYywgdCxcbiAgICAgICAgYTAwLCBhMDEsIGEwMiwgYTAzLFxuICAgICAgICBhMTAsIGExMSwgYTEyLCBhMTMsXG4gICAgICAgIGEyMCwgYTIxLCBhMjIsIGEyMyxcbiAgICAgICAgYjAwLCBiMDEsIGIwMixcbiAgICAgICAgYjEwLCBiMTEsIGIxMixcbiAgICAgICAgYjIwLCBiMjEsIGIyMjtcblxuICAgIGlmIChNYXRoLmFicyhsZW4pIDwgR0xNQVRfRVBTSUxPTikgeyByZXR1cm4gbnVsbDsgfVxuICAgIFxuICAgIGxlbiA9IDEgLyBsZW47XG4gICAgeCAqPSBsZW47XG4gICAgeSAqPSBsZW47XG4gICAgeiAqPSBsZW47XG5cbiAgICBzID0gTWF0aC5zaW4ocmFkKTtcbiAgICBjID0gTWF0aC5jb3MocmFkKTtcbiAgICB0ID0gMSAtIGM7XG5cbiAgICBhMDAgPSBhWzBdOyBhMDEgPSBhWzFdOyBhMDIgPSBhWzJdOyBhMDMgPSBhWzNdO1xuICAgIGExMCA9IGFbNF07IGExMSA9IGFbNV07IGExMiA9IGFbNl07IGExMyA9IGFbN107XG4gICAgYTIwID0gYVs4XTsgYTIxID0gYVs5XTsgYTIyID0gYVsxMF07IGEyMyA9IGFbMTFdO1xuXG4gICAgLy8gQ29uc3RydWN0IHRoZSBlbGVtZW50cyBvZiB0aGUgcm90YXRpb24gbWF0cml4XG4gICAgYjAwID0geCAqIHggKiB0ICsgYzsgYjAxID0geSAqIHggKiB0ICsgeiAqIHM7IGIwMiA9IHogKiB4ICogdCAtIHkgKiBzO1xuICAgIGIxMCA9IHggKiB5ICogdCAtIHogKiBzOyBiMTEgPSB5ICogeSAqIHQgKyBjOyBiMTIgPSB6ICogeSAqIHQgKyB4ICogcztcbiAgICBiMjAgPSB4ICogeiAqIHQgKyB5ICogczsgYjIxID0geSAqIHogKiB0IC0geCAqIHM7IGIyMiA9IHogKiB6ICogdCArIGM7XG5cbiAgICAvLyBQZXJmb3JtIHJvdGF0aW9uLXNwZWNpZmljIG1hdHJpeCBtdWx0aXBsaWNhdGlvblxuICAgIG91dFswXSA9IGEwMCAqIGIwMCArIGExMCAqIGIwMSArIGEyMCAqIGIwMjtcbiAgICBvdXRbMV0gPSBhMDEgKiBiMDAgKyBhMTEgKiBiMDEgKyBhMjEgKiBiMDI7XG4gICAgb3V0WzJdID0gYTAyICogYjAwICsgYTEyICogYjAxICsgYTIyICogYjAyO1xuICAgIG91dFszXSA9IGEwMyAqIGIwMCArIGExMyAqIGIwMSArIGEyMyAqIGIwMjtcbiAgICBvdXRbNF0gPSBhMDAgKiBiMTAgKyBhMTAgKiBiMTEgKyBhMjAgKiBiMTI7XG4gICAgb3V0WzVdID0gYTAxICogYjEwICsgYTExICogYjExICsgYTIxICogYjEyO1xuICAgIG91dFs2XSA9IGEwMiAqIGIxMCArIGExMiAqIGIxMSArIGEyMiAqIGIxMjtcbiAgICBvdXRbN10gPSBhMDMgKiBiMTAgKyBhMTMgKiBiMTEgKyBhMjMgKiBiMTI7XG4gICAgb3V0WzhdID0gYTAwICogYjIwICsgYTEwICogYjIxICsgYTIwICogYjIyO1xuICAgIG91dFs5XSA9IGEwMSAqIGIyMCArIGExMSAqIGIyMSArIGEyMSAqIGIyMjtcbiAgICBvdXRbMTBdID0gYTAyICogYjIwICsgYTEyICogYjIxICsgYTIyICogYjIyO1xuICAgIG91dFsxMV0gPSBhMDMgKiBiMjAgKyBhMTMgKiBiMjEgKyBhMjMgKiBiMjI7XG5cbiAgICBpZiAoYSAhPT0gb3V0KSB7IC8vIElmIHRoZSBzb3VyY2UgYW5kIGRlc3RpbmF0aW9uIGRpZmZlciwgY29weSB0aGUgdW5jaGFuZ2VkIGxhc3Qgcm93XG4gICAgICAgIG91dFsxMl0gPSBhWzEyXTtcbiAgICAgICAgb3V0WzEzXSA9IGFbMTNdO1xuICAgICAgICBvdXRbMTRdID0gYVsxNF07XG4gICAgICAgIG91dFsxNV0gPSBhWzE1XTtcbiAgICB9XG4gICAgcmV0dXJuIG91dDtcbn07XG5cbi8qKlxuICogUm90YXRlcyBhIG1hdHJpeCBieSB0aGUgZ2l2ZW4gYW5nbGUgYXJvdW5kIHRoZSBYIGF4aXNcbiAqXG4gKiBAcGFyYW0ge21hdDR9IG91dCB0aGUgcmVjZWl2aW5nIG1hdHJpeFxuICogQHBhcmFtIHttYXQ0fSBhIHRoZSBtYXRyaXggdG8gcm90YXRlXG4gKiBAcGFyYW0ge051bWJlcn0gcmFkIHRoZSBhbmdsZSB0byByb3RhdGUgdGhlIG1hdHJpeCBieVxuICogQHJldHVybnMge21hdDR9IG91dFxuICovXG5tYXQ0LnJvdGF0ZVggPSBmdW5jdGlvbiAob3V0LCBhLCByYWQpIHtcbiAgICB2YXIgcyA9IE1hdGguc2luKHJhZCksXG4gICAgICAgIGMgPSBNYXRoLmNvcyhyYWQpLFxuICAgICAgICBhMTAgPSBhWzRdLFxuICAgICAgICBhMTEgPSBhWzVdLFxuICAgICAgICBhMTIgPSBhWzZdLFxuICAgICAgICBhMTMgPSBhWzddLFxuICAgICAgICBhMjAgPSBhWzhdLFxuICAgICAgICBhMjEgPSBhWzldLFxuICAgICAgICBhMjIgPSBhWzEwXSxcbiAgICAgICAgYTIzID0gYVsxMV07XG5cbiAgICBpZiAoYSAhPT0gb3V0KSB7IC8vIElmIHRoZSBzb3VyY2UgYW5kIGRlc3RpbmF0aW9uIGRpZmZlciwgY29weSB0aGUgdW5jaGFuZ2VkIHJvd3NcbiAgICAgICAgb3V0WzBdICA9IGFbMF07XG4gICAgICAgIG91dFsxXSAgPSBhWzFdO1xuICAgICAgICBvdXRbMl0gID0gYVsyXTtcbiAgICAgICAgb3V0WzNdICA9IGFbM107XG4gICAgICAgIG91dFsxMl0gPSBhWzEyXTtcbiAgICAgICAgb3V0WzEzXSA9IGFbMTNdO1xuICAgICAgICBvdXRbMTRdID0gYVsxNF07XG4gICAgICAgIG91dFsxNV0gPSBhWzE1XTtcbiAgICB9XG5cbiAgICAvLyBQZXJmb3JtIGF4aXMtc3BlY2lmaWMgbWF0cml4IG11bHRpcGxpY2F0aW9uXG4gICAgb3V0WzRdID0gYTEwICogYyArIGEyMCAqIHM7XG4gICAgb3V0WzVdID0gYTExICogYyArIGEyMSAqIHM7XG4gICAgb3V0WzZdID0gYTEyICogYyArIGEyMiAqIHM7XG4gICAgb3V0WzddID0gYTEzICogYyArIGEyMyAqIHM7XG4gICAgb3V0WzhdID0gYTIwICogYyAtIGExMCAqIHM7XG4gICAgb3V0WzldID0gYTIxICogYyAtIGExMSAqIHM7XG4gICAgb3V0WzEwXSA9IGEyMiAqIGMgLSBhMTIgKiBzO1xuICAgIG91dFsxMV0gPSBhMjMgKiBjIC0gYTEzICogcztcbiAgICByZXR1cm4gb3V0O1xufTtcblxuLyoqXG4gKiBSb3RhdGVzIGEgbWF0cml4IGJ5IHRoZSBnaXZlbiBhbmdsZSBhcm91bmQgdGhlIFkgYXhpc1xuICpcbiAqIEBwYXJhbSB7bWF0NH0gb3V0IHRoZSByZWNlaXZpbmcgbWF0cml4XG4gKiBAcGFyYW0ge21hdDR9IGEgdGhlIG1hdHJpeCB0byByb3RhdGVcbiAqIEBwYXJhbSB7TnVtYmVyfSByYWQgdGhlIGFuZ2xlIHRvIHJvdGF0ZSB0aGUgbWF0cml4IGJ5XG4gKiBAcmV0dXJucyB7bWF0NH0gb3V0XG4gKi9cbm1hdDQucm90YXRlWSA9IGZ1bmN0aW9uIChvdXQsIGEsIHJhZCkge1xuICAgIHZhciBzID0gTWF0aC5zaW4ocmFkKSxcbiAgICAgICAgYyA9IE1hdGguY29zKHJhZCksXG4gICAgICAgIGEwMCA9IGFbMF0sXG4gICAgICAgIGEwMSA9IGFbMV0sXG4gICAgICAgIGEwMiA9IGFbMl0sXG4gICAgICAgIGEwMyA9IGFbM10sXG4gICAgICAgIGEyMCA9IGFbOF0sXG4gICAgICAgIGEyMSA9IGFbOV0sXG4gICAgICAgIGEyMiA9IGFbMTBdLFxuICAgICAgICBhMjMgPSBhWzExXTtcblxuICAgIGlmIChhICE9PSBvdXQpIHsgLy8gSWYgdGhlIHNvdXJjZSBhbmQgZGVzdGluYXRpb24gZGlmZmVyLCBjb3B5IHRoZSB1bmNoYW5nZWQgcm93c1xuICAgICAgICBvdXRbNF0gID0gYVs0XTtcbiAgICAgICAgb3V0WzVdICA9IGFbNV07XG4gICAgICAgIG91dFs2XSAgPSBhWzZdO1xuICAgICAgICBvdXRbN10gID0gYVs3XTtcbiAgICAgICAgb3V0WzEyXSA9IGFbMTJdO1xuICAgICAgICBvdXRbMTNdID0gYVsxM107XG4gICAgICAgIG91dFsxNF0gPSBhWzE0XTtcbiAgICAgICAgb3V0WzE1XSA9IGFbMTVdO1xuICAgIH1cblxuICAgIC8vIFBlcmZvcm0gYXhpcy1zcGVjaWZpYyBtYXRyaXggbXVsdGlwbGljYXRpb25cbiAgICBvdXRbMF0gPSBhMDAgKiBjIC0gYTIwICogcztcbiAgICBvdXRbMV0gPSBhMDEgKiBjIC0gYTIxICogcztcbiAgICBvdXRbMl0gPSBhMDIgKiBjIC0gYTIyICogcztcbiAgICBvdXRbM10gPSBhMDMgKiBjIC0gYTIzICogcztcbiAgICBvdXRbOF0gPSBhMDAgKiBzICsgYTIwICogYztcbiAgICBvdXRbOV0gPSBhMDEgKiBzICsgYTIxICogYztcbiAgICBvdXRbMTBdID0gYTAyICogcyArIGEyMiAqIGM7XG4gICAgb3V0WzExXSA9IGEwMyAqIHMgKyBhMjMgKiBjO1xuICAgIHJldHVybiBvdXQ7XG59O1xuXG4vKipcbiAqIFJvdGF0ZXMgYSBtYXRyaXggYnkgdGhlIGdpdmVuIGFuZ2xlIGFyb3VuZCB0aGUgWiBheGlzXG4gKlxuICogQHBhcmFtIHttYXQ0fSBvdXQgdGhlIHJlY2VpdmluZyBtYXRyaXhcbiAqIEBwYXJhbSB7bWF0NH0gYSB0aGUgbWF0cml4IHRvIHJvdGF0ZVxuICogQHBhcmFtIHtOdW1iZXJ9IHJhZCB0aGUgYW5nbGUgdG8gcm90YXRlIHRoZSBtYXRyaXggYnlcbiAqIEByZXR1cm5zIHttYXQ0fSBvdXRcbiAqL1xubWF0NC5yb3RhdGVaID0gZnVuY3Rpb24gKG91dCwgYSwgcmFkKSB7XG4gICAgdmFyIHMgPSBNYXRoLnNpbihyYWQpLFxuICAgICAgICBjID0gTWF0aC5jb3MocmFkKSxcbiAgICAgICAgYTAwID0gYVswXSxcbiAgICAgICAgYTAxID0gYVsxXSxcbiAgICAgICAgYTAyID0gYVsyXSxcbiAgICAgICAgYTAzID0gYVszXSxcbiAgICAgICAgYTEwID0gYVs0XSxcbiAgICAgICAgYTExID0gYVs1XSxcbiAgICAgICAgYTEyID0gYVs2XSxcbiAgICAgICAgYTEzID0gYVs3XTtcblxuICAgIGlmIChhICE9PSBvdXQpIHsgLy8gSWYgdGhlIHNvdXJjZSBhbmQgZGVzdGluYXRpb24gZGlmZmVyLCBjb3B5IHRoZSB1bmNoYW5nZWQgbGFzdCByb3dcbiAgICAgICAgb3V0WzhdICA9IGFbOF07XG4gICAgICAgIG91dFs5XSAgPSBhWzldO1xuICAgICAgICBvdXRbMTBdID0gYVsxMF07XG4gICAgICAgIG91dFsxMV0gPSBhWzExXTtcbiAgICAgICAgb3V0WzEyXSA9IGFbMTJdO1xuICAgICAgICBvdXRbMTNdID0gYVsxM107XG4gICAgICAgIG91dFsxNF0gPSBhWzE0XTtcbiAgICAgICAgb3V0WzE1XSA9IGFbMTVdO1xuICAgIH1cblxuICAgIC8vIFBlcmZvcm0gYXhpcy1zcGVjaWZpYyBtYXRyaXggbXVsdGlwbGljYXRpb25cbiAgICBvdXRbMF0gPSBhMDAgKiBjICsgYTEwICogcztcbiAgICBvdXRbMV0gPSBhMDEgKiBjICsgYTExICogcztcbiAgICBvdXRbMl0gPSBhMDIgKiBjICsgYTEyICogcztcbiAgICBvdXRbM10gPSBhMDMgKiBjICsgYTEzICogcztcbiAgICBvdXRbNF0gPSBhMTAgKiBjIC0gYTAwICogcztcbiAgICBvdXRbNV0gPSBhMTEgKiBjIC0gYTAxICogcztcbiAgICBvdXRbNl0gPSBhMTIgKiBjIC0gYTAyICogcztcbiAgICBvdXRbN10gPSBhMTMgKiBjIC0gYTAzICogcztcbiAgICByZXR1cm4gb3V0O1xufTtcblxuLyoqXG4gKiBDcmVhdGVzIGEgbWF0cml4IGZyb20gYSBxdWF0ZXJuaW9uIHJvdGF0aW9uIGFuZCB2ZWN0b3IgdHJhbnNsYXRpb25cbiAqIFRoaXMgaXMgZXF1aXZhbGVudCB0byAoYnV0IG11Y2ggZmFzdGVyIHRoYW4pOlxuICpcbiAqICAgICBtYXQ0LmlkZW50aXR5KGRlc3QpO1xuICogICAgIG1hdDQudHJhbnNsYXRlKGRlc3QsIHZlYyk7XG4gKiAgICAgdmFyIHF1YXRNYXQgPSBtYXQ0LmNyZWF0ZSgpO1xuICogICAgIHF1YXQ0LnRvTWF0NChxdWF0LCBxdWF0TWF0KTtcbiAqICAgICBtYXQ0Lm11bHRpcGx5KGRlc3QsIHF1YXRNYXQpO1xuICpcbiAqIEBwYXJhbSB7bWF0NH0gb3V0IG1hdDQgcmVjZWl2aW5nIG9wZXJhdGlvbiByZXN1bHRcbiAqIEBwYXJhbSB7cXVhdDR9IHEgUm90YXRpb24gcXVhdGVybmlvblxuICogQHBhcmFtIHt2ZWMzfSB2IFRyYW5zbGF0aW9uIHZlY3RvclxuICogQHJldHVybnMge21hdDR9IG91dFxuICovXG5tYXQ0LmZyb21Sb3RhdGlvblRyYW5zbGF0aW9uID0gZnVuY3Rpb24gKG91dCwgcSwgdikge1xuICAgIC8vIFF1YXRlcm5pb24gbWF0aFxuICAgIHZhciB4ID0gcVswXSwgeSA9IHFbMV0sIHogPSBxWzJdLCB3ID0gcVszXSxcbiAgICAgICAgeDIgPSB4ICsgeCxcbiAgICAgICAgeTIgPSB5ICsgeSxcbiAgICAgICAgejIgPSB6ICsgeixcblxuICAgICAgICB4eCA9IHggKiB4MixcbiAgICAgICAgeHkgPSB4ICogeTIsXG4gICAgICAgIHh6ID0geCAqIHoyLFxuICAgICAgICB5eSA9IHkgKiB5MixcbiAgICAgICAgeXogPSB5ICogejIsXG4gICAgICAgIHp6ID0geiAqIHoyLFxuICAgICAgICB3eCA9IHcgKiB4MixcbiAgICAgICAgd3kgPSB3ICogeTIsXG4gICAgICAgIHd6ID0gdyAqIHoyO1xuXG4gICAgb3V0WzBdID0gMSAtICh5eSArIHp6KTtcbiAgICBvdXRbMV0gPSB4eSArIHd6O1xuICAgIG91dFsyXSA9IHh6IC0gd3k7XG4gICAgb3V0WzNdID0gMDtcbiAgICBvdXRbNF0gPSB4eSAtIHd6O1xuICAgIG91dFs1XSA9IDEgLSAoeHggKyB6eik7XG4gICAgb3V0WzZdID0geXogKyB3eDtcbiAgICBvdXRbN10gPSAwO1xuICAgIG91dFs4XSA9IHh6ICsgd3k7XG4gICAgb3V0WzldID0geXogLSB3eDtcbiAgICBvdXRbMTBdID0gMSAtICh4eCArIHl5KTtcbiAgICBvdXRbMTFdID0gMDtcbiAgICBvdXRbMTJdID0gdlswXTtcbiAgICBvdXRbMTNdID0gdlsxXTtcbiAgICBvdXRbMTRdID0gdlsyXTtcbiAgICBvdXRbMTVdID0gMTtcbiAgICBcbiAgICByZXR1cm4gb3V0O1xufTtcblxubWF0NC5mcm9tUXVhdCA9IGZ1bmN0aW9uIChvdXQsIHEpIHtcbiAgICB2YXIgeCA9IHFbMF0sIHkgPSBxWzFdLCB6ID0gcVsyXSwgdyA9IHFbM10sXG4gICAgICAgIHgyID0geCArIHgsXG4gICAgICAgIHkyID0geSArIHksXG4gICAgICAgIHoyID0geiArIHosXG5cbiAgICAgICAgeHggPSB4ICogeDIsXG4gICAgICAgIHl4ID0geSAqIHgyLFxuICAgICAgICB5eSA9IHkgKiB5MixcbiAgICAgICAgenggPSB6ICogeDIsXG4gICAgICAgIHp5ID0geiAqIHkyLFxuICAgICAgICB6eiA9IHogKiB6MixcbiAgICAgICAgd3ggPSB3ICogeDIsXG4gICAgICAgIHd5ID0gdyAqIHkyLFxuICAgICAgICB3eiA9IHcgKiB6MjtcblxuICAgIG91dFswXSA9IDEgLSB5eSAtIHp6O1xuICAgIG91dFsxXSA9IHl4ICsgd3o7XG4gICAgb3V0WzJdID0genggLSB3eTtcbiAgICBvdXRbM10gPSAwO1xuXG4gICAgb3V0WzRdID0geXggLSB3ejtcbiAgICBvdXRbNV0gPSAxIC0geHggLSB6ejtcbiAgICBvdXRbNl0gPSB6eSArIHd4O1xuICAgIG91dFs3XSA9IDA7XG5cbiAgICBvdXRbOF0gPSB6eCArIHd5O1xuICAgIG91dFs5XSA9IHp5IC0gd3g7XG4gICAgb3V0WzEwXSA9IDEgLSB4eCAtIHl5O1xuICAgIG91dFsxMV0gPSAwO1xuXG4gICAgb3V0WzEyXSA9IDA7XG4gICAgb3V0WzEzXSA9IDA7XG4gICAgb3V0WzE0XSA9IDA7XG4gICAgb3V0WzE1XSA9IDE7XG5cbiAgICByZXR1cm4gb3V0O1xufTtcblxuLyoqXG4gKiBHZW5lcmF0ZXMgYSBmcnVzdHVtIG1hdHJpeCB3aXRoIHRoZSBnaXZlbiBib3VuZHNcbiAqXG4gKiBAcGFyYW0ge21hdDR9IG91dCBtYXQ0IGZydXN0dW0gbWF0cml4IHdpbGwgYmUgd3JpdHRlbiBpbnRvXG4gKiBAcGFyYW0ge051bWJlcn0gbGVmdCBMZWZ0IGJvdW5kIG9mIHRoZSBmcnVzdHVtXG4gKiBAcGFyYW0ge051bWJlcn0gcmlnaHQgUmlnaHQgYm91bmQgb2YgdGhlIGZydXN0dW1cbiAqIEBwYXJhbSB7TnVtYmVyfSBib3R0b20gQm90dG9tIGJvdW5kIG9mIHRoZSBmcnVzdHVtXG4gKiBAcGFyYW0ge051bWJlcn0gdG9wIFRvcCBib3VuZCBvZiB0aGUgZnJ1c3R1bVxuICogQHBhcmFtIHtOdW1iZXJ9IG5lYXIgTmVhciBib3VuZCBvZiB0aGUgZnJ1c3R1bVxuICogQHBhcmFtIHtOdW1iZXJ9IGZhciBGYXIgYm91bmQgb2YgdGhlIGZydXN0dW1cbiAqIEByZXR1cm5zIHttYXQ0fSBvdXRcbiAqL1xubWF0NC5mcnVzdHVtID0gZnVuY3Rpb24gKG91dCwgbGVmdCwgcmlnaHQsIGJvdHRvbSwgdG9wLCBuZWFyLCBmYXIpIHtcbiAgICB2YXIgcmwgPSAxIC8gKHJpZ2h0IC0gbGVmdCksXG4gICAgICAgIHRiID0gMSAvICh0b3AgLSBib3R0b20pLFxuICAgICAgICBuZiA9IDEgLyAobmVhciAtIGZhcik7XG4gICAgb3V0WzBdID0gKG5lYXIgKiAyKSAqIHJsO1xuICAgIG91dFsxXSA9IDA7XG4gICAgb3V0WzJdID0gMDtcbiAgICBvdXRbM10gPSAwO1xuICAgIG91dFs0XSA9IDA7XG4gICAgb3V0WzVdID0gKG5lYXIgKiAyKSAqIHRiO1xuICAgIG91dFs2XSA9IDA7XG4gICAgb3V0WzddID0gMDtcbiAgICBvdXRbOF0gPSAocmlnaHQgKyBsZWZ0KSAqIHJsO1xuICAgIG91dFs5XSA9ICh0b3AgKyBib3R0b20pICogdGI7XG4gICAgb3V0WzEwXSA9IChmYXIgKyBuZWFyKSAqIG5mO1xuICAgIG91dFsxMV0gPSAtMTtcbiAgICBvdXRbMTJdID0gMDtcbiAgICBvdXRbMTNdID0gMDtcbiAgICBvdXRbMTRdID0gKGZhciAqIG5lYXIgKiAyKSAqIG5mO1xuICAgIG91dFsxNV0gPSAwO1xuICAgIHJldHVybiBvdXQ7XG59O1xuXG4vKipcbiAqIEdlbmVyYXRlcyBhIHBlcnNwZWN0aXZlIHByb2plY3Rpb24gbWF0cml4IHdpdGggdGhlIGdpdmVuIGJvdW5kc1xuICpcbiAqIEBwYXJhbSB7bWF0NH0gb3V0IG1hdDQgZnJ1c3R1bSBtYXRyaXggd2lsbCBiZSB3cml0dGVuIGludG9cbiAqIEBwYXJhbSB7bnVtYmVyfSBmb3Z5IFZlcnRpY2FsIGZpZWxkIG9mIHZpZXcgaW4gcmFkaWFuc1xuICogQHBhcmFtIHtudW1iZXJ9IGFzcGVjdCBBc3BlY3QgcmF0aW8uIHR5cGljYWxseSB2aWV3cG9ydCB3aWR0aC9oZWlnaHRcbiAqIEBwYXJhbSB7bnVtYmVyfSBuZWFyIE5lYXIgYm91bmQgb2YgdGhlIGZydXN0dW1cbiAqIEBwYXJhbSB7bnVtYmVyfSBmYXIgRmFyIGJvdW5kIG9mIHRoZSBmcnVzdHVtXG4gKiBAcmV0dXJucyB7bWF0NH0gb3V0XG4gKi9cbm1hdDQucGVyc3BlY3RpdmUgPSBmdW5jdGlvbiAob3V0LCBmb3Z5LCBhc3BlY3QsIG5lYXIsIGZhcikge1xuICAgIHZhciBmID0gMS4wIC8gTWF0aC50YW4oZm92eSAvIDIpLFxuICAgICAgICBuZiA9IDEgLyAobmVhciAtIGZhcik7XG4gICAgb3V0WzBdID0gZiAvIGFzcGVjdDtcbiAgICBvdXRbMV0gPSAwO1xuICAgIG91dFsyXSA9IDA7XG4gICAgb3V0WzNdID0gMDtcbiAgICBvdXRbNF0gPSAwO1xuICAgIG91dFs1XSA9IGY7XG4gICAgb3V0WzZdID0gMDtcbiAgICBvdXRbN10gPSAwO1xuICAgIG91dFs4XSA9IDA7XG4gICAgb3V0WzldID0gMDtcbiAgICBvdXRbMTBdID0gKGZhciArIG5lYXIpICogbmY7XG4gICAgb3V0WzExXSA9IC0xO1xuICAgIG91dFsxMl0gPSAwO1xuICAgIG91dFsxM10gPSAwO1xuICAgIG91dFsxNF0gPSAoMiAqIGZhciAqIG5lYXIpICogbmY7XG4gICAgb3V0WzE1XSA9IDA7XG4gICAgcmV0dXJuIG91dDtcbn07XG5cbi8qKlxuICogR2VuZXJhdGVzIGEgb3J0aG9nb25hbCBwcm9qZWN0aW9uIG1hdHJpeCB3aXRoIHRoZSBnaXZlbiBib3VuZHNcbiAqXG4gKiBAcGFyYW0ge21hdDR9IG91dCBtYXQ0IGZydXN0dW0gbWF0cml4IHdpbGwgYmUgd3JpdHRlbiBpbnRvXG4gKiBAcGFyYW0ge251bWJlcn0gbGVmdCBMZWZ0IGJvdW5kIG9mIHRoZSBmcnVzdHVtXG4gKiBAcGFyYW0ge251bWJlcn0gcmlnaHQgUmlnaHQgYm91bmQgb2YgdGhlIGZydXN0dW1cbiAqIEBwYXJhbSB7bnVtYmVyfSBib3R0b20gQm90dG9tIGJvdW5kIG9mIHRoZSBmcnVzdHVtXG4gKiBAcGFyYW0ge251bWJlcn0gdG9wIFRvcCBib3VuZCBvZiB0aGUgZnJ1c3R1bVxuICogQHBhcmFtIHtudW1iZXJ9IG5lYXIgTmVhciBib3VuZCBvZiB0aGUgZnJ1c3R1bVxuICogQHBhcmFtIHtudW1iZXJ9IGZhciBGYXIgYm91bmQgb2YgdGhlIGZydXN0dW1cbiAqIEByZXR1cm5zIHttYXQ0fSBvdXRcbiAqL1xubWF0NC5vcnRobyA9IGZ1bmN0aW9uIChvdXQsIGxlZnQsIHJpZ2h0LCBib3R0b20sIHRvcCwgbmVhciwgZmFyKSB7XG4gICAgdmFyIGxyID0gMSAvIChsZWZ0IC0gcmlnaHQpLFxuICAgICAgICBidCA9IDEgLyAoYm90dG9tIC0gdG9wKSxcbiAgICAgICAgbmYgPSAxIC8gKG5lYXIgLSBmYXIpO1xuICAgIG91dFswXSA9IC0yICogbHI7XG4gICAgb3V0WzFdID0gMDtcbiAgICBvdXRbMl0gPSAwO1xuICAgIG91dFszXSA9IDA7XG4gICAgb3V0WzRdID0gMDtcbiAgICBvdXRbNV0gPSAtMiAqIGJ0O1xuICAgIG91dFs2XSA9IDA7XG4gICAgb3V0WzddID0gMDtcbiAgICBvdXRbOF0gPSAwO1xuICAgIG91dFs5XSA9IDA7XG4gICAgb3V0WzEwXSA9IDIgKiBuZjtcbiAgICBvdXRbMTFdID0gMDtcbiAgICBvdXRbMTJdID0gKGxlZnQgKyByaWdodCkgKiBscjtcbiAgICBvdXRbMTNdID0gKHRvcCArIGJvdHRvbSkgKiBidDtcbiAgICBvdXRbMTRdID0gKGZhciArIG5lYXIpICogbmY7XG4gICAgb3V0WzE1XSA9IDE7XG4gICAgcmV0dXJuIG91dDtcbn07XG5cbi8qKlxuICogR2VuZXJhdGVzIGEgbG9vay1hdCBtYXRyaXggd2l0aCB0aGUgZ2l2ZW4gZXllIHBvc2l0aW9uLCBmb2NhbCBwb2ludCwgYW5kIHVwIGF4aXNcbiAqXG4gKiBAcGFyYW0ge21hdDR9IG91dCBtYXQ0IGZydXN0dW0gbWF0cml4IHdpbGwgYmUgd3JpdHRlbiBpbnRvXG4gKiBAcGFyYW0ge3ZlYzN9IGV5ZSBQb3NpdGlvbiBvZiB0aGUgdmlld2VyXG4gKiBAcGFyYW0ge3ZlYzN9IGNlbnRlciBQb2ludCB0aGUgdmlld2VyIGlzIGxvb2tpbmcgYXRcbiAqIEBwYXJhbSB7dmVjM30gdXAgdmVjMyBwb2ludGluZyB1cFxuICogQHJldHVybnMge21hdDR9IG91dFxuICovXG5tYXQ0Lmxvb2tBdCA9IGZ1bmN0aW9uIChvdXQsIGV5ZSwgY2VudGVyLCB1cCkge1xuICAgIHZhciB4MCwgeDEsIHgyLCB5MCwgeTEsIHkyLCB6MCwgejEsIHoyLCBsZW4sXG4gICAgICAgIGV5ZXggPSBleWVbMF0sXG4gICAgICAgIGV5ZXkgPSBleWVbMV0sXG4gICAgICAgIGV5ZXogPSBleWVbMl0sXG4gICAgICAgIHVweCA9IHVwWzBdLFxuICAgICAgICB1cHkgPSB1cFsxXSxcbiAgICAgICAgdXB6ID0gdXBbMl0sXG4gICAgICAgIGNlbnRlcnggPSBjZW50ZXJbMF0sXG4gICAgICAgIGNlbnRlcnkgPSBjZW50ZXJbMV0sXG4gICAgICAgIGNlbnRlcnogPSBjZW50ZXJbMl07XG5cbiAgICBpZiAoTWF0aC5hYnMoZXlleCAtIGNlbnRlcngpIDwgR0xNQVRfRVBTSUxPTiAmJlxuICAgICAgICBNYXRoLmFicyhleWV5IC0gY2VudGVyeSkgPCBHTE1BVF9FUFNJTE9OICYmXG4gICAgICAgIE1hdGguYWJzKGV5ZXogLSBjZW50ZXJ6KSA8IEdMTUFUX0VQU0lMT04pIHtcbiAgICAgICAgcmV0dXJuIG1hdDQuaWRlbnRpdHkob3V0KTtcbiAgICB9XG5cbiAgICB6MCA9IGV5ZXggLSBjZW50ZXJ4O1xuICAgIHoxID0gZXlleSAtIGNlbnRlcnk7XG4gICAgejIgPSBleWV6IC0gY2VudGVyejtcblxuICAgIGxlbiA9IDEgLyBNYXRoLnNxcnQoejAgKiB6MCArIHoxICogejEgKyB6MiAqIHoyKTtcbiAgICB6MCAqPSBsZW47XG4gICAgejEgKj0gbGVuO1xuICAgIHoyICo9IGxlbjtcblxuICAgIHgwID0gdXB5ICogejIgLSB1cHogKiB6MTtcbiAgICB4MSA9IHVweiAqIHowIC0gdXB4ICogejI7XG4gICAgeDIgPSB1cHggKiB6MSAtIHVweSAqIHowO1xuICAgIGxlbiA9IE1hdGguc3FydCh4MCAqIHgwICsgeDEgKiB4MSArIHgyICogeDIpO1xuICAgIGlmICghbGVuKSB7XG4gICAgICAgIHgwID0gMDtcbiAgICAgICAgeDEgPSAwO1xuICAgICAgICB4MiA9IDA7XG4gICAgfSBlbHNlIHtcbiAgICAgICAgbGVuID0gMSAvIGxlbjtcbiAgICAgICAgeDAgKj0gbGVuO1xuICAgICAgICB4MSAqPSBsZW47XG4gICAgICAgIHgyICo9IGxlbjtcbiAgICB9XG5cbiAgICB5MCA9IHoxICogeDIgLSB6MiAqIHgxO1xuICAgIHkxID0gejIgKiB4MCAtIHowICogeDI7XG4gICAgeTIgPSB6MCAqIHgxIC0gejEgKiB4MDtcblxuICAgIGxlbiA9IE1hdGguc3FydCh5MCAqIHkwICsgeTEgKiB5MSArIHkyICogeTIpO1xuICAgIGlmICghbGVuKSB7XG4gICAgICAgIHkwID0gMDtcbiAgICAgICAgeTEgPSAwO1xuICAgICAgICB5MiA9IDA7XG4gICAgfSBlbHNlIHtcbiAgICAgICAgbGVuID0gMSAvIGxlbjtcbiAgICAgICAgeTAgKj0gbGVuO1xuICAgICAgICB5MSAqPSBsZW47XG4gICAgICAgIHkyICo9IGxlbjtcbiAgICB9XG5cbiAgICBvdXRbMF0gPSB4MDtcbiAgICBvdXRbMV0gPSB5MDtcbiAgICBvdXRbMl0gPSB6MDtcbiAgICBvdXRbM10gPSAwO1xuICAgIG91dFs0XSA9IHgxO1xuICAgIG91dFs1XSA9IHkxO1xuICAgIG91dFs2XSA9IHoxO1xuICAgIG91dFs3XSA9IDA7XG4gICAgb3V0WzhdID0geDI7XG4gICAgb3V0WzldID0geTI7XG4gICAgb3V0WzEwXSA9IHoyO1xuICAgIG91dFsxMV0gPSAwO1xuICAgIG91dFsxMl0gPSAtKHgwICogZXlleCArIHgxICogZXlleSArIHgyICogZXlleik7XG4gICAgb3V0WzEzXSA9IC0oeTAgKiBleWV4ICsgeTEgKiBleWV5ICsgeTIgKiBleWV6KTtcbiAgICBvdXRbMTRdID0gLSh6MCAqIGV5ZXggKyB6MSAqIGV5ZXkgKyB6MiAqIGV5ZXopO1xuICAgIG91dFsxNV0gPSAxO1xuXG4gICAgcmV0dXJuIG91dDtcbn07XG5cbi8qKlxuICogUmV0dXJucyBhIHN0cmluZyByZXByZXNlbnRhdGlvbiBvZiBhIG1hdDRcbiAqXG4gKiBAcGFyYW0ge21hdDR9IG1hdCBtYXRyaXggdG8gcmVwcmVzZW50IGFzIGEgc3RyaW5nXG4gKiBAcmV0dXJucyB7U3RyaW5nfSBzdHJpbmcgcmVwcmVzZW50YXRpb24gb2YgdGhlIG1hdHJpeFxuICovXG5tYXQ0LnN0ciA9IGZ1bmN0aW9uIChhKSB7XG4gICAgcmV0dXJuICdtYXQ0KCcgKyBhWzBdICsgJywgJyArIGFbMV0gKyAnLCAnICsgYVsyXSArICcsICcgKyBhWzNdICsgJywgJyArXG4gICAgICAgICAgICAgICAgICAgIGFbNF0gKyAnLCAnICsgYVs1XSArICcsICcgKyBhWzZdICsgJywgJyArIGFbN10gKyAnLCAnICtcbiAgICAgICAgICAgICAgICAgICAgYVs4XSArICcsICcgKyBhWzldICsgJywgJyArIGFbMTBdICsgJywgJyArIGFbMTFdICsgJywgJyArIFxuICAgICAgICAgICAgICAgICAgICBhWzEyXSArICcsICcgKyBhWzEzXSArICcsICcgKyBhWzE0XSArICcsICcgKyBhWzE1XSArICcpJztcbn07XG5cbi8qKlxuICogUmV0dXJucyBGcm9iZW5pdXMgbm9ybSBvZiBhIG1hdDRcbiAqXG4gKiBAcGFyYW0ge21hdDR9IGEgdGhlIG1hdHJpeCB0byBjYWxjdWxhdGUgRnJvYmVuaXVzIG5vcm0gb2ZcbiAqIEByZXR1cm5zIHtOdW1iZXJ9IEZyb2Jlbml1cyBub3JtXG4gKi9cbm1hdDQuZnJvYiA9IGZ1bmN0aW9uIChhKSB7XG4gICAgcmV0dXJuKE1hdGguc3FydChNYXRoLnBvdyhhWzBdLCAyKSArIE1hdGgucG93KGFbMV0sIDIpICsgTWF0aC5wb3coYVsyXSwgMikgKyBNYXRoLnBvdyhhWzNdLCAyKSArIE1hdGgucG93KGFbNF0sIDIpICsgTWF0aC5wb3coYVs1XSwgMikgKyBNYXRoLnBvdyhhWzZdLCAyKSArIE1hdGgucG93KGFbNl0sIDIpICsgTWF0aC5wb3coYVs3XSwgMikgKyBNYXRoLnBvdyhhWzhdLCAyKSArIE1hdGgucG93KGFbOV0sIDIpICsgTWF0aC5wb3coYVsxMF0sIDIpICsgTWF0aC5wb3coYVsxMV0sIDIpICsgTWF0aC5wb3coYVsxMl0sIDIpICsgTWF0aC5wb3coYVsxM10sIDIpICsgTWF0aC5wb3coYVsxNF0sIDIpICsgTWF0aC5wb3coYVsxNV0sIDIpICkpXG59O1xuXG5cbmlmKHR5cGVvZihleHBvcnRzKSAhPT0gJ3VuZGVmaW5lZCcpIHtcbiAgICBleHBvcnRzLm1hdDQgPSBtYXQ0O1xufVxuO1xuLyogQ29weXJpZ2h0IChjKSAyMDEzLCBCcmFuZG9uIEpvbmVzLCBDb2xpbiBNYWNLZW56aWUgSVYuIEFsbCByaWdodHMgcmVzZXJ2ZWQuXG5cblJlZGlzdHJpYnV0aW9uIGFuZCB1c2UgaW4gc291cmNlIGFuZCBiaW5hcnkgZm9ybXMsIHdpdGggb3Igd2l0aG91dCBtb2RpZmljYXRpb24sXG5hcmUgcGVybWl0dGVkIHByb3ZpZGVkIHRoYXQgdGhlIGZvbGxvd2luZyBjb25kaXRpb25zIGFyZSBtZXQ6XG5cbiAgKiBSZWRpc3RyaWJ1dGlvbnMgb2Ygc291cmNlIGNvZGUgbXVzdCByZXRhaW4gdGhlIGFib3ZlIGNvcHlyaWdodCBub3RpY2UsIHRoaXNcbiAgICBsaXN0IG9mIGNvbmRpdGlvbnMgYW5kIHRoZSBmb2xsb3dpbmcgZGlzY2xhaW1lci5cbiAgKiBSZWRpc3RyaWJ1dGlvbnMgaW4gYmluYXJ5IGZvcm0gbXVzdCByZXByb2R1Y2UgdGhlIGFib3ZlIGNvcHlyaWdodCBub3RpY2UsXG4gICAgdGhpcyBsaXN0IG9mIGNvbmRpdGlvbnMgYW5kIHRoZSBmb2xsb3dpbmcgZGlzY2xhaW1lciBpbiB0aGUgZG9jdW1lbnRhdGlvbiBcbiAgICBhbmQvb3Igb3RoZXIgbWF0ZXJpYWxzIHByb3ZpZGVkIHdpdGggdGhlIGRpc3RyaWJ1dGlvbi5cblxuVEhJUyBTT0ZUV0FSRSBJUyBQUk9WSURFRCBCWSBUSEUgQ09QWVJJR0hUIEhPTERFUlMgQU5EIENPTlRSSUJVVE9SUyBcIkFTIElTXCIgQU5EXG5BTlkgRVhQUkVTUyBPUiBJTVBMSUVEIFdBUlJBTlRJRVMsIElOQ0xVRElORywgQlVUIE5PVCBMSU1JVEVEIFRPLCBUSEUgSU1QTElFRFxuV0FSUkFOVElFUyBPRiBNRVJDSEFOVEFCSUxJVFkgQU5EIEZJVE5FU1MgRk9SIEEgUEFSVElDVUxBUiBQVVJQT1NFIEFSRSBcbkRJU0NMQUlNRUQuIElOIE5PIEVWRU5UIFNIQUxMIFRIRSBDT1BZUklHSFQgSE9MREVSIE9SIENPTlRSSUJVVE9SUyBCRSBMSUFCTEUgRk9SXG5BTlkgRElSRUNULCBJTkRJUkVDVCwgSU5DSURFTlRBTCwgU1BFQ0lBTCwgRVhFTVBMQVJZLCBPUiBDT05TRVFVRU5USUFMIERBTUFHRVNcbihJTkNMVURJTkcsIEJVVCBOT1QgTElNSVRFRCBUTywgUFJPQ1VSRU1FTlQgT0YgU1VCU1RJVFVURSBHT09EUyBPUiBTRVJWSUNFUztcbkxPU1MgT0YgVVNFLCBEQVRBLCBPUiBQUk9GSVRTOyBPUiBCVVNJTkVTUyBJTlRFUlJVUFRJT04pIEhPV0VWRVIgQ0FVU0VEIEFORCBPTlxuQU5ZIFRIRU9SWSBPRiBMSUFCSUxJVFksIFdIRVRIRVIgSU4gQ09OVFJBQ1QsIFNUUklDVCBMSUFCSUxJVFksIE9SIFRPUlRcbihJTkNMVURJTkcgTkVHTElHRU5DRSBPUiBPVEhFUldJU0UpIEFSSVNJTkcgSU4gQU5ZIFdBWSBPVVQgT0YgVEhFIFVTRSBPRiBUSElTXG5TT0ZUV0FSRSwgRVZFTiBJRiBBRFZJU0VEIE9GIFRIRSBQT1NTSUJJTElUWSBPRiBTVUNIIERBTUFHRS4gKi9cblxuLyoqXG4gKiBAY2xhc3MgUXVhdGVybmlvblxuICogQG5hbWUgcXVhdFxuICovXG5cbnZhciBxdWF0ID0ge307XG5cbi8qKlxuICogQ3JlYXRlcyBhIG5ldyBpZGVudGl0eSBxdWF0XG4gKlxuICogQHJldHVybnMge3F1YXR9IGEgbmV3IHF1YXRlcm5pb25cbiAqL1xucXVhdC5jcmVhdGUgPSBmdW5jdGlvbigpIHtcbiAgICB2YXIgb3V0ID0gbmV3IEdMTUFUX0FSUkFZX1RZUEUoNCk7XG4gICAgb3V0WzBdID0gMDtcbiAgICBvdXRbMV0gPSAwO1xuICAgIG91dFsyXSA9IDA7XG4gICAgb3V0WzNdID0gMTtcbiAgICByZXR1cm4gb3V0O1xufTtcblxuLyoqXG4gKiBTZXRzIGEgcXVhdGVybmlvbiB0byByZXByZXNlbnQgdGhlIHNob3J0ZXN0IHJvdGF0aW9uIGZyb20gb25lXG4gKiB2ZWN0b3IgdG8gYW5vdGhlci5cbiAqXG4gKiBCb3RoIHZlY3RvcnMgYXJlIGFzc3VtZWQgdG8gYmUgdW5pdCBsZW5ndGguXG4gKlxuICogQHBhcmFtIHtxdWF0fSBvdXQgdGhlIHJlY2VpdmluZyBxdWF0ZXJuaW9uLlxuICogQHBhcmFtIHt2ZWMzfSBhIHRoZSBpbml0aWFsIHZlY3RvclxuICogQHBhcmFtIHt2ZWMzfSBiIHRoZSBkZXN0aW5hdGlvbiB2ZWN0b3JcbiAqIEByZXR1cm5zIHtxdWF0fSBvdXRcbiAqL1xucXVhdC5yb3RhdGlvblRvID0gKGZ1bmN0aW9uKCkge1xuICAgIHZhciB0bXB2ZWMzID0gdmVjMy5jcmVhdGUoKTtcbiAgICB2YXIgeFVuaXRWZWMzID0gdmVjMy5mcm9tVmFsdWVzKDEsMCwwKTtcbiAgICB2YXIgeVVuaXRWZWMzID0gdmVjMy5mcm9tVmFsdWVzKDAsMSwwKTtcblxuICAgIHJldHVybiBmdW5jdGlvbihvdXQsIGEsIGIpIHtcbiAgICAgICAgdmFyIGRvdCA9IHZlYzMuZG90KGEsIGIpO1xuICAgICAgICBpZiAoZG90IDwgLTAuOTk5OTk5KSB7XG4gICAgICAgICAgICB2ZWMzLmNyb3NzKHRtcHZlYzMsIHhVbml0VmVjMywgYSk7XG4gICAgICAgICAgICBpZiAodmVjMy5sZW5ndGgodG1wdmVjMykgPCAwLjAwMDAwMSlcbiAgICAgICAgICAgICAgICB2ZWMzLmNyb3NzKHRtcHZlYzMsIHlVbml0VmVjMywgYSk7XG4gICAgICAgICAgICB2ZWMzLm5vcm1hbGl6ZSh0bXB2ZWMzLCB0bXB2ZWMzKTtcbiAgICAgICAgICAgIHF1YXQuc2V0QXhpc0FuZ2xlKG91dCwgdG1wdmVjMywgTWF0aC5QSSk7XG4gICAgICAgICAgICByZXR1cm4gb3V0O1xuICAgICAgICB9IGVsc2UgaWYgKGRvdCA+IDAuOTk5OTk5KSB7XG4gICAgICAgICAgICBvdXRbMF0gPSAwO1xuICAgICAgICAgICAgb3V0WzFdID0gMDtcbiAgICAgICAgICAgIG91dFsyXSA9IDA7XG4gICAgICAgICAgICBvdXRbM10gPSAxO1xuICAgICAgICAgICAgcmV0dXJuIG91dDtcbiAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgIHZlYzMuY3Jvc3ModG1wdmVjMywgYSwgYik7XG4gICAgICAgICAgICBvdXRbMF0gPSB0bXB2ZWMzWzBdO1xuICAgICAgICAgICAgb3V0WzFdID0gdG1wdmVjM1sxXTtcbiAgICAgICAgICAgIG91dFsyXSA9IHRtcHZlYzNbMl07XG4gICAgICAgICAgICBvdXRbM10gPSAxICsgZG90O1xuICAgICAgICAgICAgcmV0dXJuIHF1YXQubm9ybWFsaXplKG91dCwgb3V0KTtcbiAgICAgICAgfVxuICAgIH07XG59KSgpO1xuXG4vKipcbiAqIFNldHMgdGhlIHNwZWNpZmllZCBxdWF0ZXJuaW9uIHdpdGggdmFsdWVzIGNvcnJlc3BvbmRpbmcgdG8gdGhlIGdpdmVuXG4gKiBheGVzLiBFYWNoIGF4aXMgaXMgYSB2ZWMzIGFuZCBpcyBleHBlY3RlZCB0byBiZSB1bml0IGxlbmd0aCBhbmRcbiAqIHBlcnBlbmRpY3VsYXIgdG8gYWxsIG90aGVyIHNwZWNpZmllZCBheGVzLlxuICpcbiAqIEBwYXJhbSB7dmVjM30gdmlldyAgdGhlIHZlY3RvciByZXByZXNlbnRpbmcgdGhlIHZpZXdpbmcgZGlyZWN0aW9uXG4gKiBAcGFyYW0ge3ZlYzN9IHJpZ2h0IHRoZSB2ZWN0b3IgcmVwcmVzZW50aW5nIHRoZSBsb2NhbCBcInJpZ2h0XCIgZGlyZWN0aW9uXG4gKiBAcGFyYW0ge3ZlYzN9IHVwICAgIHRoZSB2ZWN0b3IgcmVwcmVzZW50aW5nIHRoZSBsb2NhbCBcInVwXCIgZGlyZWN0aW9uXG4gKiBAcmV0dXJucyB7cXVhdH0gb3V0XG4gKi9cbnF1YXQuc2V0QXhlcyA9IChmdW5jdGlvbigpIHtcbiAgICB2YXIgbWF0ciA9IG1hdDMuY3JlYXRlKCk7XG5cbiAgICByZXR1cm4gZnVuY3Rpb24ob3V0LCB2aWV3LCByaWdodCwgdXApIHtcbiAgICAgICAgbWF0clswXSA9IHJpZ2h0WzBdO1xuICAgICAgICBtYXRyWzNdID0gcmlnaHRbMV07XG4gICAgICAgIG1hdHJbNl0gPSByaWdodFsyXTtcblxuICAgICAgICBtYXRyWzFdID0gdXBbMF07XG4gICAgICAgIG1hdHJbNF0gPSB1cFsxXTtcbiAgICAgICAgbWF0cls3XSA9IHVwWzJdO1xuXG4gICAgICAgIG1hdHJbMl0gPSAtdmlld1swXTtcbiAgICAgICAgbWF0cls1XSA9IC12aWV3WzFdO1xuICAgICAgICBtYXRyWzhdID0gLXZpZXdbMl07XG5cbiAgICAgICAgcmV0dXJuIHF1YXQubm9ybWFsaXplKG91dCwgcXVhdC5mcm9tTWF0MyhvdXQsIG1hdHIpKTtcbiAgICB9O1xufSkoKTtcblxuLyoqXG4gKiBDcmVhdGVzIGEgbmV3IHF1YXQgaW5pdGlhbGl6ZWQgd2l0aCB2YWx1ZXMgZnJvbSBhbiBleGlzdGluZyBxdWF0ZXJuaW9uXG4gKlxuICogQHBhcmFtIHtxdWF0fSBhIHF1YXRlcm5pb24gdG8gY2xvbmVcbiAqIEByZXR1cm5zIHtxdWF0fSBhIG5ldyBxdWF0ZXJuaW9uXG4gKiBAZnVuY3Rpb25cbiAqL1xucXVhdC5jbG9uZSA9IHZlYzQuY2xvbmU7XG5cbi8qKlxuICogQ3JlYXRlcyBhIG5ldyBxdWF0IGluaXRpYWxpemVkIHdpdGggdGhlIGdpdmVuIHZhbHVlc1xuICpcbiAqIEBwYXJhbSB7TnVtYmVyfSB4IFggY29tcG9uZW50XG4gKiBAcGFyYW0ge051bWJlcn0geSBZIGNvbXBvbmVudFxuICogQHBhcmFtIHtOdW1iZXJ9IHogWiBjb21wb25lbnRcbiAqIEBwYXJhbSB7TnVtYmVyfSB3IFcgY29tcG9uZW50XG4gKiBAcmV0dXJucyB7cXVhdH0gYSBuZXcgcXVhdGVybmlvblxuICogQGZ1bmN0aW9uXG4gKi9cbnF1YXQuZnJvbVZhbHVlcyA9IHZlYzQuZnJvbVZhbHVlcztcblxuLyoqXG4gKiBDb3B5IHRoZSB2YWx1ZXMgZnJvbSBvbmUgcXVhdCB0byBhbm90aGVyXG4gKlxuICogQHBhcmFtIHtxdWF0fSBvdXQgdGhlIHJlY2VpdmluZyBxdWF0ZXJuaW9uXG4gKiBAcGFyYW0ge3F1YXR9IGEgdGhlIHNvdXJjZSBxdWF0ZXJuaW9uXG4gKiBAcmV0dXJucyB7cXVhdH0gb3V0XG4gKiBAZnVuY3Rpb25cbiAqL1xucXVhdC5jb3B5ID0gdmVjNC5jb3B5O1xuXG4vKipcbiAqIFNldCB0aGUgY29tcG9uZW50cyBvZiBhIHF1YXQgdG8gdGhlIGdpdmVuIHZhbHVlc1xuICpcbiAqIEBwYXJhbSB7cXVhdH0gb3V0IHRoZSByZWNlaXZpbmcgcXVhdGVybmlvblxuICogQHBhcmFtIHtOdW1iZXJ9IHggWCBjb21wb25lbnRcbiAqIEBwYXJhbSB7TnVtYmVyfSB5IFkgY29tcG9uZW50XG4gKiBAcGFyYW0ge051bWJlcn0geiBaIGNvbXBvbmVudFxuICogQHBhcmFtIHtOdW1iZXJ9IHcgVyBjb21wb25lbnRcbiAqIEByZXR1cm5zIHtxdWF0fSBvdXRcbiAqIEBmdW5jdGlvblxuICovXG5xdWF0LnNldCA9IHZlYzQuc2V0O1xuXG4vKipcbiAqIFNldCBhIHF1YXQgdG8gdGhlIGlkZW50aXR5IHF1YXRlcm5pb25cbiAqXG4gKiBAcGFyYW0ge3F1YXR9IG91dCB0aGUgcmVjZWl2aW5nIHF1YXRlcm5pb25cbiAqIEByZXR1cm5zIHtxdWF0fSBvdXRcbiAqL1xucXVhdC5pZGVudGl0eSA9IGZ1bmN0aW9uKG91dCkge1xuICAgIG91dFswXSA9IDA7XG4gICAgb3V0WzFdID0gMDtcbiAgICBvdXRbMl0gPSAwO1xuICAgIG91dFszXSA9IDE7XG4gICAgcmV0dXJuIG91dDtcbn07XG5cbi8qKlxuICogU2V0cyBhIHF1YXQgZnJvbSB0aGUgZ2l2ZW4gYW5nbGUgYW5kIHJvdGF0aW9uIGF4aXMsXG4gKiB0aGVuIHJldHVybnMgaXQuXG4gKlxuICogQHBhcmFtIHtxdWF0fSBvdXQgdGhlIHJlY2VpdmluZyBxdWF0ZXJuaW9uXG4gKiBAcGFyYW0ge3ZlYzN9IGF4aXMgdGhlIGF4aXMgYXJvdW5kIHdoaWNoIHRvIHJvdGF0ZVxuICogQHBhcmFtIHtOdW1iZXJ9IHJhZCB0aGUgYW5nbGUgaW4gcmFkaWFuc1xuICogQHJldHVybnMge3F1YXR9IG91dFxuICoqL1xucXVhdC5zZXRBeGlzQW5nbGUgPSBmdW5jdGlvbihvdXQsIGF4aXMsIHJhZCkge1xuICAgIHJhZCA9IHJhZCAqIDAuNTtcbiAgICB2YXIgcyA9IE1hdGguc2luKHJhZCk7XG4gICAgb3V0WzBdID0gcyAqIGF4aXNbMF07XG4gICAgb3V0WzFdID0gcyAqIGF4aXNbMV07XG4gICAgb3V0WzJdID0gcyAqIGF4aXNbMl07XG4gICAgb3V0WzNdID0gTWF0aC5jb3MocmFkKTtcbiAgICByZXR1cm4gb3V0O1xufTtcblxuLyoqXG4gKiBBZGRzIHR3byBxdWF0J3NcbiAqXG4gKiBAcGFyYW0ge3F1YXR9IG91dCB0aGUgcmVjZWl2aW5nIHF1YXRlcm5pb25cbiAqIEBwYXJhbSB7cXVhdH0gYSB0aGUgZmlyc3Qgb3BlcmFuZFxuICogQHBhcmFtIHtxdWF0fSBiIHRoZSBzZWNvbmQgb3BlcmFuZFxuICogQHJldHVybnMge3F1YXR9IG91dFxuICogQGZ1bmN0aW9uXG4gKi9cbnF1YXQuYWRkID0gdmVjNC5hZGQ7XG5cbi8qKlxuICogTXVsdGlwbGllcyB0d28gcXVhdCdzXG4gKlxuICogQHBhcmFtIHtxdWF0fSBvdXQgdGhlIHJlY2VpdmluZyBxdWF0ZXJuaW9uXG4gKiBAcGFyYW0ge3F1YXR9IGEgdGhlIGZpcnN0IG9wZXJhbmRcbiAqIEBwYXJhbSB7cXVhdH0gYiB0aGUgc2Vjb25kIG9wZXJhbmRcbiAqIEByZXR1cm5zIHtxdWF0fSBvdXRcbiAqL1xucXVhdC5tdWx0aXBseSA9IGZ1bmN0aW9uKG91dCwgYSwgYikge1xuICAgIHZhciBheCA9IGFbMF0sIGF5ID0gYVsxXSwgYXogPSBhWzJdLCBhdyA9IGFbM10sXG4gICAgICAgIGJ4ID0gYlswXSwgYnkgPSBiWzFdLCBieiA9IGJbMl0sIGJ3ID0gYlszXTtcblxuICAgIG91dFswXSA9IGF4ICogYncgKyBhdyAqIGJ4ICsgYXkgKiBieiAtIGF6ICogYnk7XG4gICAgb3V0WzFdID0gYXkgKiBidyArIGF3ICogYnkgKyBheiAqIGJ4IC0gYXggKiBiejtcbiAgICBvdXRbMl0gPSBheiAqIGJ3ICsgYXcgKiBieiArIGF4ICogYnkgLSBheSAqIGJ4O1xuICAgIG91dFszXSA9IGF3ICogYncgLSBheCAqIGJ4IC0gYXkgKiBieSAtIGF6ICogYno7XG4gICAgcmV0dXJuIG91dDtcbn07XG5cbi8qKlxuICogQWxpYXMgZm9yIHtAbGluayBxdWF0Lm11bHRpcGx5fVxuICogQGZ1bmN0aW9uXG4gKi9cbnF1YXQubXVsID0gcXVhdC5tdWx0aXBseTtcblxuLyoqXG4gKiBTY2FsZXMgYSBxdWF0IGJ5IGEgc2NhbGFyIG51bWJlclxuICpcbiAqIEBwYXJhbSB7cXVhdH0gb3V0IHRoZSByZWNlaXZpbmcgdmVjdG9yXG4gKiBAcGFyYW0ge3F1YXR9IGEgdGhlIHZlY3RvciB0byBzY2FsZVxuICogQHBhcmFtIHtOdW1iZXJ9IGIgYW1vdW50IHRvIHNjYWxlIHRoZSB2ZWN0b3IgYnlcbiAqIEByZXR1cm5zIHtxdWF0fSBvdXRcbiAqIEBmdW5jdGlvblxuICovXG5xdWF0LnNjYWxlID0gdmVjNC5zY2FsZTtcblxuLyoqXG4gKiBSb3RhdGVzIGEgcXVhdGVybmlvbiBieSB0aGUgZ2l2ZW4gYW5nbGUgYWJvdXQgdGhlIFggYXhpc1xuICpcbiAqIEBwYXJhbSB7cXVhdH0gb3V0IHF1YXQgcmVjZWl2aW5nIG9wZXJhdGlvbiByZXN1bHRcbiAqIEBwYXJhbSB7cXVhdH0gYSBxdWF0IHRvIHJvdGF0ZVxuICogQHBhcmFtIHtudW1iZXJ9IHJhZCBhbmdsZSAoaW4gcmFkaWFucykgdG8gcm90YXRlXG4gKiBAcmV0dXJucyB7cXVhdH0gb3V0XG4gKi9cbnF1YXQucm90YXRlWCA9IGZ1bmN0aW9uIChvdXQsIGEsIHJhZCkge1xuICAgIHJhZCAqPSAwLjU7IFxuXG4gICAgdmFyIGF4ID0gYVswXSwgYXkgPSBhWzFdLCBheiA9IGFbMl0sIGF3ID0gYVszXSxcbiAgICAgICAgYnggPSBNYXRoLnNpbihyYWQpLCBidyA9IE1hdGguY29zKHJhZCk7XG5cbiAgICBvdXRbMF0gPSBheCAqIGJ3ICsgYXcgKiBieDtcbiAgICBvdXRbMV0gPSBheSAqIGJ3ICsgYXogKiBieDtcbiAgICBvdXRbMl0gPSBheiAqIGJ3IC0gYXkgKiBieDtcbiAgICBvdXRbM10gPSBhdyAqIGJ3IC0gYXggKiBieDtcbiAgICByZXR1cm4gb3V0O1xufTtcblxuLyoqXG4gKiBSb3RhdGVzIGEgcXVhdGVybmlvbiBieSB0aGUgZ2l2ZW4gYW5nbGUgYWJvdXQgdGhlIFkgYXhpc1xuICpcbiAqIEBwYXJhbSB7cXVhdH0gb3V0IHF1YXQgcmVjZWl2aW5nIG9wZXJhdGlvbiByZXN1bHRcbiAqIEBwYXJhbSB7cXVhdH0gYSBxdWF0IHRvIHJvdGF0ZVxuICogQHBhcmFtIHtudW1iZXJ9IHJhZCBhbmdsZSAoaW4gcmFkaWFucykgdG8gcm90YXRlXG4gKiBAcmV0dXJucyB7cXVhdH0gb3V0XG4gKi9cbnF1YXQucm90YXRlWSA9IGZ1bmN0aW9uIChvdXQsIGEsIHJhZCkge1xuICAgIHJhZCAqPSAwLjU7IFxuXG4gICAgdmFyIGF4ID0gYVswXSwgYXkgPSBhWzFdLCBheiA9IGFbMl0sIGF3ID0gYVszXSxcbiAgICAgICAgYnkgPSBNYXRoLnNpbihyYWQpLCBidyA9IE1hdGguY29zKHJhZCk7XG5cbiAgICBvdXRbMF0gPSBheCAqIGJ3IC0gYXogKiBieTtcbiAgICBvdXRbMV0gPSBheSAqIGJ3ICsgYXcgKiBieTtcbiAgICBvdXRbMl0gPSBheiAqIGJ3ICsgYXggKiBieTtcbiAgICBvdXRbM10gPSBhdyAqIGJ3IC0gYXkgKiBieTtcbiAgICByZXR1cm4gb3V0O1xufTtcblxuLyoqXG4gKiBSb3RhdGVzIGEgcXVhdGVybmlvbiBieSB0aGUgZ2l2ZW4gYW5nbGUgYWJvdXQgdGhlIFogYXhpc1xuICpcbiAqIEBwYXJhbSB7cXVhdH0gb3V0IHF1YXQgcmVjZWl2aW5nIG9wZXJhdGlvbiByZXN1bHRcbiAqIEBwYXJhbSB7cXVhdH0gYSBxdWF0IHRvIHJvdGF0ZVxuICogQHBhcmFtIHtudW1iZXJ9IHJhZCBhbmdsZSAoaW4gcmFkaWFucykgdG8gcm90YXRlXG4gKiBAcmV0dXJucyB7cXVhdH0gb3V0XG4gKi9cbnF1YXQucm90YXRlWiA9IGZ1bmN0aW9uIChvdXQsIGEsIHJhZCkge1xuICAgIHJhZCAqPSAwLjU7IFxuXG4gICAgdmFyIGF4ID0gYVswXSwgYXkgPSBhWzFdLCBheiA9IGFbMl0sIGF3ID0gYVszXSxcbiAgICAgICAgYnogPSBNYXRoLnNpbihyYWQpLCBidyA9IE1hdGguY29zKHJhZCk7XG5cbiAgICBvdXRbMF0gPSBheCAqIGJ3ICsgYXkgKiBiejtcbiAgICBvdXRbMV0gPSBheSAqIGJ3IC0gYXggKiBiejtcbiAgICBvdXRbMl0gPSBheiAqIGJ3ICsgYXcgKiBiejtcbiAgICBvdXRbM10gPSBhdyAqIGJ3IC0gYXogKiBiejtcbiAgICByZXR1cm4gb3V0O1xufTtcblxuLyoqXG4gKiBDYWxjdWxhdGVzIHRoZSBXIGNvbXBvbmVudCBvZiBhIHF1YXQgZnJvbSB0aGUgWCwgWSwgYW5kIFogY29tcG9uZW50cy5cbiAqIEFzc3VtZXMgdGhhdCBxdWF0ZXJuaW9uIGlzIDEgdW5pdCBpbiBsZW5ndGguXG4gKiBBbnkgZXhpc3RpbmcgVyBjb21wb25lbnQgd2lsbCBiZSBpZ25vcmVkLlxuICpcbiAqIEBwYXJhbSB7cXVhdH0gb3V0IHRoZSByZWNlaXZpbmcgcXVhdGVybmlvblxuICogQHBhcmFtIHtxdWF0fSBhIHF1YXQgdG8gY2FsY3VsYXRlIFcgY29tcG9uZW50IG9mXG4gKiBAcmV0dXJucyB7cXVhdH0gb3V0XG4gKi9cbnF1YXQuY2FsY3VsYXRlVyA9IGZ1bmN0aW9uIChvdXQsIGEpIHtcbiAgICB2YXIgeCA9IGFbMF0sIHkgPSBhWzFdLCB6ID0gYVsyXTtcblxuICAgIG91dFswXSA9IHg7XG4gICAgb3V0WzFdID0geTtcbiAgICBvdXRbMl0gPSB6O1xuICAgIG91dFszXSA9IC1NYXRoLnNxcnQoTWF0aC5hYnMoMS4wIC0geCAqIHggLSB5ICogeSAtIHogKiB6KSk7XG4gICAgcmV0dXJuIG91dDtcbn07XG5cbi8qKlxuICogQ2FsY3VsYXRlcyB0aGUgZG90IHByb2R1Y3Qgb2YgdHdvIHF1YXQnc1xuICpcbiAqIEBwYXJhbSB7cXVhdH0gYSB0aGUgZmlyc3Qgb3BlcmFuZFxuICogQHBhcmFtIHtxdWF0fSBiIHRoZSBzZWNvbmQgb3BlcmFuZFxuICogQHJldHVybnMge051bWJlcn0gZG90IHByb2R1Y3Qgb2YgYSBhbmQgYlxuICogQGZ1bmN0aW9uXG4gKi9cbnF1YXQuZG90ID0gdmVjNC5kb3Q7XG5cbi8qKlxuICogUGVyZm9ybXMgYSBsaW5lYXIgaW50ZXJwb2xhdGlvbiBiZXR3ZWVuIHR3byBxdWF0J3NcbiAqXG4gKiBAcGFyYW0ge3F1YXR9IG91dCB0aGUgcmVjZWl2aW5nIHF1YXRlcm5pb25cbiAqIEBwYXJhbSB7cXVhdH0gYSB0aGUgZmlyc3Qgb3BlcmFuZFxuICogQHBhcmFtIHtxdWF0fSBiIHRoZSBzZWNvbmQgb3BlcmFuZFxuICogQHBhcmFtIHtOdW1iZXJ9IHQgaW50ZXJwb2xhdGlvbiBhbW91bnQgYmV0d2VlbiB0aGUgdHdvIGlucHV0c1xuICogQHJldHVybnMge3F1YXR9IG91dFxuICogQGZ1bmN0aW9uXG4gKi9cbnF1YXQubGVycCA9IHZlYzQubGVycDtcblxuLyoqXG4gKiBQZXJmb3JtcyBhIHNwaGVyaWNhbCBsaW5lYXIgaW50ZXJwb2xhdGlvbiBiZXR3ZWVuIHR3byBxdWF0XG4gKlxuICogQHBhcmFtIHtxdWF0fSBvdXQgdGhlIHJlY2VpdmluZyBxdWF0ZXJuaW9uXG4gKiBAcGFyYW0ge3F1YXR9IGEgdGhlIGZpcnN0IG9wZXJhbmRcbiAqIEBwYXJhbSB7cXVhdH0gYiB0aGUgc2Vjb25kIG9wZXJhbmRcbiAqIEBwYXJhbSB7TnVtYmVyfSB0IGludGVycG9sYXRpb24gYW1vdW50IGJldHdlZW4gdGhlIHR3byBpbnB1dHNcbiAqIEByZXR1cm5zIHtxdWF0fSBvdXRcbiAqL1xucXVhdC5zbGVycCA9IGZ1bmN0aW9uIChvdXQsIGEsIGIsIHQpIHtcbiAgICAvLyBiZW5jaG1hcmtzOlxuICAgIC8vICAgIGh0dHA6Ly9qc3BlcmYuY29tL3F1YXRlcm5pb24tc2xlcnAtaW1wbGVtZW50YXRpb25zXG5cbiAgICB2YXIgYXggPSBhWzBdLCBheSA9IGFbMV0sIGF6ID0gYVsyXSwgYXcgPSBhWzNdLFxuICAgICAgICBieCA9IGJbMF0sIGJ5ID0gYlsxXSwgYnogPSBiWzJdLCBidyA9IGJbM107XG5cbiAgICB2YXIgICAgICAgIG9tZWdhLCBjb3NvbSwgc2lub20sIHNjYWxlMCwgc2NhbGUxO1xuXG4gICAgLy8gY2FsYyBjb3NpbmVcbiAgICBjb3NvbSA9IGF4ICogYnggKyBheSAqIGJ5ICsgYXogKiBieiArIGF3ICogYnc7XG4gICAgLy8gYWRqdXN0IHNpZ25zIChpZiBuZWNlc3NhcnkpXG4gICAgaWYgKCBjb3NvbSA8IDAuMCApIHtcbiAgICAgICAgY29zb20gPSAtY29zb207XG4gICAgICAgIGJ4ID0gLSBieDtcbiAgICAgICAgYnkgPSAtIGJ5O1xuICAgICAgICBieiA9IC0gYno7XG4gICAgICAgIGJ3ID0gLSBidztcbiAgICB9XG4gICAgLy8gY2FsY3VsYXRlIGNvZWZmaWNpZW50c1xuICAgIGlmICggKDEuMCAtIGNvc29tKSA+IDAuMDAwMDAxICkge1xuICAgICAgICAvLyBzdGFuZGFyZCBjYXNlIChzbGVycClcbiAgICAgICAgb21lZ2EgID0gTWF0aC5hY29zKGNvc29tKTtcbiAgICAgICAgc2lub20gID0gTWF0aC5zaW4ob21lZ2EpO1xuICAgICAgICBzY2FsZTAgPSBNYXRoLnNpbigoMS4wIC0gdCkgKiBvbWVnYSkgLyBzaW5vbTtcbiAgICAgICAgc2NhbGUxID0gTWF0aC5zaW4odCAqIG9tZWdhKSAvIHNpbm9tO1xuICAgIH0gZWxzZSB7ICAgICAgICBcbiAgICAgICAgLy8gXCJmcm9tXCIgYW5kIFwidG9cIiBxdWF0ZXJuaW9ucyBhcmUgdmVyeSBjbG9zZSBcbiAgICAgICAgLy8gIC4uLiBzbyB3ZSBjYW4gZG8gYSBsaW5lYXIgaW50ZXJwb2xhdGlvblxuICAgICAgICBzY2FsZTAgPSAxLjAgLSB0O1xuICAgICAgICBzY2FsZTEgPSB0O1xuICAgIH1cbiAgICAvLyBjYWxjdWxhdGUgZmluYWwgdmFsdWVzXG4gICAgb3V0WzBdID0gc2NhbGUwICogYXggKyBzY2FsZTEgKiBieDtcbiAgICBvdXRbMV0gPSBzY2FsZTAgKiBheSArIHNjYWxlMSAqIGJ5O1xuICAgIG91dFsyXSA9IHNjYWxlMCAqIGF6ICsgc2NhbGUxICogYno7XG4gICAgb3V0WzNdID0gc2NhbGUwICogYXcgKyBzY2FsZTEgKiBidztcbiAgICBcbiAgICByZXR1cm4gb3V0O1xufTtcblxuLyoqXG4gKiBDYWxjdWxhdGVzIHRoZSBpbnZlcnNlIG9mIGEgcXVhdFxuICpcbiAqIEBwYXJhbSB7cXVhdH0gb3V0IHRoZSByZWNlaXZpbmcgcXVhdGVybmlvblxuICogQHBhcmFtIHtxdWF0fSBhIHF1YXQgdG8gY2FsY3VsYXRlIGludmVyc2Ugb2ZcbiAqIEByZXR1cm5zIHtxdWF0fSBvdXRcbiAqL1xucXVhdC5pbnZlcnQgPSBmdW5jdGlvbihvdXQsIGEpIHtcbiAgICB2YXIgYTAgPSBhWzBdLCBhMSA9IGFbMV0sIGEyID0gYVsyXSwgYTMgPSBhWzNdLFxuICAgICAgICBkb3QgPSBhMCphMCArIGExKmExICsgYTIqYTIgKyBhMyphMyxcbiAgICAgICAgaW52RG90ID0gZG90ID8gMS4wL2RvdCA6IDA7XG4gICAgXG4gICAgLy8gVE9ETzogV291bGQgYmUgZmFzdGVyIHRvIHJldHVybiBbMCwwLDAsMF0gaW1tZWRpYXRlbHkgaWYgZG90ID09IDBcblxuICAgIG91dFswXSA9IC1hMCppbnZEb3Q7XG4gICAgb3V0WzFdID0gLWExKmludkRvdDtcbiAgICBvdXRbMl0gPSAtYTIqaW52RG90O1xuICAgIG91dFszXSA9IGEzKmludkRvdDtcbiAgICByZXR1cm4gb3V0O1xufTtcblxuLyoqXG4gKiBDYWxjdWxhdGVzIHRoZSBjb25qdWdhdGUgb2YgYSBxdWF0XG4gKiBJZiB0aGUgcXVhdGVybmlvbiBpcyBub3JtYWxpemVkLCB0aGlzIGZ1bmN0aW9uIGlzIGZhc3RlciB0aGFuIHF1YXQuaW52ZXJzZSBhbmQgcHJvZHVjZXMgdGhlIHNhbWUgcmVzdWx0LlxuICpcbiAqIEBwYXJhbSB7cXVhdH0gb3V0IHRoZSByZWNlaXZpbmcgcXVhdGVybmlvblxuICogQHBhcmFtIHtxdWF0fSBhIHF1YXQgdG8gY2FsY3VsYXRlIGNvbmp1Z2F0ZSBvZlxuICogQHJldHVybnMge3F1YXR9IG91dFxuICovXG5xdWF0LmNvbmp1Z2F0ZSA9IGZ1bmN0aW9uIChvdXQsIGEpIHtcbiAgICBvdXRbMF0gPSAtYVswXTtcbiAgICBvdXRbMV0gPSAtYVsxXTtcbiAgICBvdXRbMl0gPSAtYVsyXTtcbiAgICBvdXRbM10gPSBhWzNdO1xuICAgIHJldHVybiBvdXQ7XG59O1xuXG4vKipcbiAqIENhbGN1bGF0ZXMgdGhlIGxlbmd0aCBvZiBhIHF1YXRcbiAqXG4gKiBAcGFyYW0ge3F1YXR9IGEgdmVjdG9yIHRvIGNhbGN1bGF0ZSBsZW5ndGggb2ZcbiAqIEByZXR1cm5zIHtOdW1iZXJ9IGxlbmd0aCBvZiBhXG4gKiBAZnVuY3Rpb25cbiAqL1xucXVhdC5sZW5ndGggPSB2ZWM0Lmxlbmd0aDtcblxuLyoqXG4gKiBBbGlhcyBmb3Ige0BsaW5rIHF1YXQubGVuZ3RofVxuICogQGZ1bmN0aW9uXG4gKi9cbnF1YXQubGVuID0gcXVhdC5sZW5ndGg7XG5cbi8qKlxuICogQ2FsY3VsYXRlcyB0aGUgc3F1YXJlZCBsZW5ndGggb2YgYSBxdWF0XG4gKlxuICogQHBhcmFtIHtxdWF0fSBhIHZlY3RvciB0byBjYWxjdWxhdGUgc3F1YXJlZCBsZW5ndGggb2ZcbiAqIEByZXR1cm5zIHtOdW1iZXJ9IHNxdWFyZWQgbGVuZ3RoIG9mIGFcbiAqIEBmdW5jdGlvblxuICovXG5xdWF0LnNxdWFyZWRMZW5ndGggPSB2ZWM0LnNxdWFyZWRMZW5ndGg7XG5cbi8qKlxuICogQWxpYXMgZm9yIHtAbGluayBxdWF0LnNxdWFyZWRMZW5ndGh9XG4gKiBAZnVuY3Rpb25cbiAqL1xucXVhdC5zcXJMZW4gPSBxdWF0LnNxdWFyZWRMZW5ndGg7XG5cbi8qKlxuICogTm9ybWFsaXplIGEgcXVhdFxuICpcbiAqIEBwYXJhbSB7cXVhdH0gb3V0IHRoZSByZWNlaXZpbmcgcXVhdGVybmlvblxuICogQHBhcmFtIHtxdWF0fSBhIHF1YXRlcm5pb24gdG8gbm9ybWFsaXplXG4gKiBAcmV0dXJucyB7cXVhdH0gb3V0XG4gKiBAZnVuY3Rpb25cbiAqL1xucXVhdC5ub3JtYWxpemUgPSB2ZWM0Lm5vcm1hbGl6ZTtcblxuLyoqXG4gKiBDcmVhdGVzIGEgcXVhdGVybmlvbiBmcm9tIHRoZSBnaXZlbiAzeDMgcm90YXRpb24gbWF0cml4LlxuICpcbiAqIE5PVEU6IFRoZSByZXN1bHRhbnQgcXVhdGVybmlvbiBpcyBub3Qgbm9ybWFsaXplZCwgc28geW91IHNob3VsZCBiZSBzdXJlXG4gKiB0byByZW5vcm1hbGl6ZSB0aGUgcXVhdGVybmlvbiB5b3Vyc2VsZiB3aGVyZSBuZWNlc3NhcnkuXG4gKlxuICogQHBhcmFtIHtxdWF0fSBvdXQgdGhlIHJlY2VpdmluZyBxdWF0ZXJuaW9uXG4gKiBAcGFyYW0ge21hdDN9IG0gcm90YXRpb24gbWF0cml4XG4gKiBAcmV0dXJucyB7cXVhdH0gb3V0XG4gKiBAZnVuY3Rpb25cbiAqL1xucXVhdC5mcm9tTWF0MyA9IGZ1bmN0aW9uKG91dCwgbSkge1xuICAgIC8vIEFsZ29yaXRobSBpbiBLZW4gU2hvZW1ha2UncyBhcnRpY2xlIGluIDE5ODcgU0lHR1JBUEggY291cnNlIG5vdGVzXG4gICAgLy8gYXJ0aWNsZSBcIlF1YXRlcm5pb24gQ2FsY3VsdXMgYW5kIEZhc3QgQW5pbWF0aW9uXCIuXG4gICAgdmFyIGZUcmFjZSA9IG1bMF0gKyBtWzRdICsgbVs4XTtcbiAgICB2YXIgZlJvb3Q7XG5cbiAgICBpZiAoIGZUcmFjZSA+IDAuMCApIHtcbiAgICAgICAgLy8gfHd8ID4gMS8yLCBtYXkgYXMgd2VsbCBjaG9vc2UgdyA+IDEvMlxuICAgICAgICBmUm9vdCA9IE1hdGguc3FydChmVHJhY2UgKyAxLjApOyAgLy8gMndcbiAgICAgICAgb3V0WzNdID0gMC41ICogZlJvb3Q7XG4gICAgICAgIGZSb290ID0gMC41L2ZSb290OyAgLy8gMS8oNHcpXG4gICAgICAgIG91dFswXSA9IChtWzddLW1bNV0pKmZSb290O1xuICAgICAgICBvdXRbMV0gPSAobVsyXS1tWzZdKSpmUm9vdDtcbiAgICAgICAgb3V0WzJdID0gKG1bM10tbVsxXSkqZlJvb3Q7XG4gICAgfSBlbHNlIHtcbiAgICAgICAgLy8gfHd8IDw9IDEvMlxuICAgICAgICB2YXIgaSA9IDA7XG4gICAgICAgIGlmICggbVs0XSA+IG1bMF0gKVxuICAgICAgICAgIGkgPSAxO1xuICAgICAgICBpZiAoIG1bOF0gPiBtW2kqMytpXSApXG4gICAgICAgICAgaSA9IDI7XG4gICAgICAgIHZhciBqID0gKGkrMSklMztcbiAgICAgICAgdmFyIGsgPSAoaSsyKSUzO1xuICAgICAgICBcbiAgICAgICAgZlJvb3QgPSBNYXRoLnNxcnQobVtpKjMraV0tbVtqKjMral0tbVtrKjMra10gKyAxLjApO1xuICAgICAgICBvdXRbaV0gPSAwLjUgKiBmUm9vdDtcbiAgICAgICAgZlJvb3QgPSAwLjUgLyBmUm9vdDtcbiAgICAgICAgb3V0WzNdID0gKG1bayozK2pdIC0gbVtqKjMra10pICogZlJvb3Q7XG4gICAgICAgIG91dFtqXSA9IChtW2oqMytpXSArIG1baSozK2pdKSAqIGZSb290O1xuICAgICAgICBvdXRba10gPSAobVtrKjMraV0gKyBtW2kqMytrXSkgKiBmUm9vdDtcbiAgICB9XG4gICAgXG4gICAgcmV0dXJuIG91dDtcbn07XG5cbi8qKlxuICogUmV0dXJucyBhIHN0cmluZyByZXByZXNlbnRhdGlvbiBvZiBhIHF1YXRlbmlvblxuICpcbiAqIEBwYXJhbSB7cXVhdH0gdmVjIHZlY3RvciB0byByZXByZXNlbnQgYXMgYSBzdHJpbmdcbiAqIEByZXR1cm5zIHtTdHJpbmd9IHN0cmluZyByZXByZXNlbnRhdGlvbiBvZiB0aGUgdmVjdG9yXG4gKi9cbnF1YXQuc3RyID0gZnVuY3Rpb24gKGEpIHtcbiAgICByZXR1cm4gJ3F1YXQoJyArIGFbMF0gKyAnLCAnICsgYVsxXSArICcsICcgKyBhWzJdICsgJywgJyArIGFbM10gKyAnKSc7XG59O1xuXG5pZih0eXBlb2YoZXhwb3J0cykgIT09ICd1bmRlZmluZWQnKSB7XG4gICAgZXhwb3J0cy5xdWF0ID0gcXVhdDtcbn1cbjtcblxuXG5cblxuXG5cblxuXG5cblxuXG5cblxuICB9KShzaGltLmV4cG9ydHMpO1xufSkodGhpcyk7XG4iLCIoZnVuY3Rpb24oKSB7XG4gIHZhciBzbGljZSA9IFtdLnNsaWNlO1xuXG4gIGZ1bmN0aW9uIHF1ZXVlKHBhcmFsbGVsaXNtKSB7XG4gICAgdmFyIHEsXG4gICAgICAgIHRhc2tzID0gW10sXG4gICAgICAgIHN0YXJ0ZWQgPSAwLCAvLyBudW1iZXIgb2YgdGFza3MgdGhhdCBoYXZlIGJlZW4gc3RhcnRlZCAoYW5kIHBlcmhhcHMgZmluaXNoZWQpXG4gICAgICAgIGFjdGl2ZSA9IDAsIC8vIG51bWJlciBvZiB0YXNrcyBjdXJyZW50bHkgYmVpbmcgZXhlY3V0ZWQgKHN0YXJ0ZWQgYnV0IG5vdCBmaW5pc2hlZClcbiAgICAgICAgcmVtYWluaW5nID0gMCwgLy8gbnVtYmVyIG9mIHRhc2tzIG5vdCB5ZXQgZmluaXNoZWRcbiAgICAgICAgcG9wcGluZywgLy8gaW5zaWRlIGEgc3luY2hyb25vdXMgdGFzayBjYWxsYmFjaz9cbiAgICAgICAgZXJyb3IgPSBudWxsLFxuICAgICAgICBhd2FpdCA9IG5vb3AsXG4gICAgICAgIGFsbDtcblxuICAgIGlmICghcGFyYWxsZWxpc20pIHBhcmFsbGVsaXNtID0gSW5maW5pdHk7XG5cbiAgICBmdW5jdGlvbiBwb3AoKSB7XG4gICAgICB3aGlsZSAocG9wcGluZyA9IHN0YXJ0ZWQgPCB0YXNrcy5sZW5ndGggJiYgYWN0aXZlIDwgcGFyYWxsZWxpc20pIHtcbiAgICAgICAgdmFyIGkgPSBzdGFydGVkKyssXG4gICAgICAgICAgICB0ID0gdGFza3NbaV0sXG4gICAgICAgICAgICBhID0gc2xpY2UuY2FsbCh0LCAxKTtcbiAgICAgICAgYS5wdXNoKGNhbGxiYWNrKGkpKTtcbiAgICAgICAgKythY3RpdmU7XG4gICAgICAgIHRbMF0uYXBwbHkobnVsbCwgYSk7XG4gICAgICB9XG4gICAgfVxuXG4gICAgZnVuY3Rpb24gY2FsbGJhY2soaSkge1xuICAgICAgcmV0dXJuIGZ1bmN0aW9uKGUsIHIpIHtcbiAgICAgICAgLS1hY3RpdmU7XG4gICAgICAgIGlmIChlcnJvciAhPSBudWxsKSByZXR1cm47XG4gICAgICAgIGlmIChlICE9IG51bGwpIHtcbiAgICAgICAgICBlcnJvciA9IGU7IC8vIGlnbm9yZSBuZXcgdGFza3MgYW5kIHNxdWVsY2ggYWN0aXZlIGNhbGxiYWNrc1xuICAgICAgICAgIHN0YXJ0ZWQgPSByZW1haW5pbmcgPSBOYU47IC8vIHN0b3AgcXVldWVkIHRhc2tzIGZyb20gc3RhcnRpbmdcbiAgICAgICAgICBub3RpZnkoKTtcbiAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICB0YXNrc1tpXSA9IHI7XG4gICAgICAgICAgaWYgKC0tcmVtYWluaW5nKSBwb3BwaW5nIHx8IHBvcCgpO1xuICAgICAgICAgIGVsc2Ugbm90aWZ5KCk7XG4gICAgICAgIH1cbiAgICAgIH07XG4gICAgfVxuXG4gICAgZnVuY3Rpb24gbm90aWZ5KCkge1xuICAgICAgaWYgKGVycm9yICE9IG51bGwpIGF3YWl0KGVycm9yKTtcbiAgICAgIGVsc2UgaWYgKGFsbCkgYXdhaXQoZXJyb3IsIHRhc2tzKTtcbiAgICAgIGVsc2UgYXdhaXQuYXBwbHkobnVsbCwgW2Vycm9yXS5jb25jYXQodGFza3MpKTtcbiAgICB9XG5cbiAgICByZXR1cm4gcSA9IHtcbiAgICAgIGRlZmVyOiBmdW5jdGlvbigpIHtcbiAgICAgICAgaWYgKCFlcnJvcikge1xuICAgICAgICAgIHRhc2tzLnB1c2goYXJndW1lbnRzKTtcbiAgICAgICAgICArK3JlbWFpbmluZztcbiAgICAgICAgICBwb3AoKTtcbiAgICAgICAgfVxuICAgICAgICByZXR1cm4gcTtcbiAgICAgIH0sXG4gICAgICBhd2FpdDogZnVuY3Rpb24oZikge1xuICAgICAgICBhd2FpdCA9IGY7XG4gICAgICAgIGFsbCA9IGZhbHNlO1xuICAgICAgICBpZiAoIXJlbWFpbmluZykgbm90aWZ5KCk7XG4gICAgICAgIHJldHVybiBxO1xuICAgICAgfSxcbiAgICAgIGF3YWl0QWxsOiBmdW5jdGlvbihmKSB7XG4gICAgICAgIGF3YWl0ID0gZjtcbiAgICAgICAgYWxsID0gdHJ1ZTtcbiAgICAgICAgaWYgKCFyZW1haW5pbmcpIG5vdGlmeSgpO1xuICAgICAgICByZXR1cm4gcTtcbiAgICAgIH1cbiAgICB9O1xuICB9XG5cbiAgZnVuY3Rpb24gbm9vcCgpIHt9XG5cbiAgcXVldWUudmVyc2lvbiA9IFwiMS4wLjdcIjtcbiAgaWYgKHR5cGVvZiBkZWZpbmUgPT09IFwiZnVuY3Rpb25cIiAmJiBkZWZpbmUuYW1kKSBkZWZpbmUoZnVuY3Rpb24oKSB7IHJldHVybiBxdWV1ZTsgfSk7XG4gIGVsc2UgaWYgKHR5cGVvZiBtb2R1bGUgPT09IFwib2JqZWN0XCIgJiYgbW9kdWxlLmV4cG9ydHMpIG1vZHVsZS5leHBvcnRzID0gcXVldWU7XG4gIGVsc2UgdGhpcy5xdWV1ZSA9IHF1ZXVlO1xufSkoKTtcbiIsImltcG9ydCB7R2VvfSBmcm9tICcuL2dlbyc7XG5pbXBvcnQgR0xQcm9ncmFtIGZyb20gJy4vZ2wvZ2xfcHJvZ3JhbSc7XG5cbmltcG9ydCB7bWF0NCwgdmVjM30gZnJvbSAnZ2wtbWF0cml4JztcblxuLy8gTm90ZTogV2Ugd2FudCBzb21ldGhpbmcgbW9yZSBsaWtlIGFuIGludGVyZmFjZSBoZXJlLiBTdWNoIGEgdGhpbiBiYXNlIGNsYXNzIG1heSBub3QgYmUgd29ydGggaXQsIGJ1dCBkb2VzIHByb3ZpZGUgc29tZSBub3RhdGlvbmFsIGNsYXJpdHkgYW55d2F5LlxuZXhwb3J0IGRlZmF1bHQgY2xhc3MgQ2FtZXJhIHtcblxuICAgIGNvbnN0cnVjdG9yKHNjZW5lKSB7XG4gICAgICAgIHRoaXMuc2NlbmUgPSBzY2VuZTtcbiAgICB9XG5cbiAgICAvLyBDcmVhdGUgYSBjYW1lcmEgYnkgdHlwZSBuYW1lLCBmYWN0b3J5LXN0eWxlXG4gICAgc3RhdGljIGNyZWF0ZShzY2VuZSwgY29uZmlnKSB7XG4gICAgICAgIHN3aXRjaCAoY29uZmlnLnR5cGUpIHtcbiAgICAgICAgICAgIGNhc2UgJ2lzb21ldHJpYyc6XG4gICAgICAgICAgICAgICAgcmV0dXJuIG5ldyBJc29tZXRyaWNDYW1lcmEoc2NlbmUsIGNvbmZpZyk7XG4gICAgICAgICAgICBjYXNlICdwZXJzcGVjdGl2ZSc6XG4gICAgICAgICAgICAgICAgcmV0dXJuIG5ldyBQZXJzcGVjdGl2ZUNhbWVyYShzY2VuZSwgY29uZmlnKTtcbiAgICAgICAgICAgIGNhc2UgJ2ZsYXQnOlxuICAgICAgICAgICAgZGVmYXVsdDpcbiAgICAgICAgICAgICAgICByZXR1cm4gbmV3IEZsYXRDYW1lcmEoc2NlbmUsIGNvbmZpZyk7XG4gICAgICAgIH1cbiAgICB9XG5cbiAgICAvLyBVcGRhdGUgbWV0aG9kIGNhbGxlZCBvbmNlIHBlciBmcmFtZVxuICAgIHVwZGF0ZSgpIHtcbiAgICB9XG5cbiAgICAvLyBDYWxsZWQgb25jZSBwZXIgZnJhbWUgcGVyIHByb2dyYW0gKGUuZy4gZm9yIG1haW4gcmVuZGVyIHBhc3MsIHRoZW4gZm9yIGVhYyBhZGRpdGlvbmFsIHBhc3MgZm9yIGZlYXR1cmUgc2VsZWN0aW9uLCBldGMuKVxuICAgIHNldHVwUHJvZ3JhbShnbF9wcm9ncmFtKSB7XG4gICAgfVxuXG59XG5cbmV4cG9ydCBjbGFzcyBQZXJzcGVjdGl2ZUNhbWVyYSBleHRlbmRzIENhbWVyYSB7XG5cbiAgICBjb25zdHJ1Y3RvcihzY2VuZSwgb3B0aW9ucyA9IHt9KSB7XG4gICAgICAgIHN1cGVyKHNjZW5lKTtcbiAgICAgICAgdGhpcy5mb2NhbF9sZW5ndGggPSAyLjU7XG4gICAgICAgIHRoaXMucGVyc3BlY3RpdmVfbWF0ID0gbWF0NC5jcmVhdGUoKTtcblxuICAgICAgICBHTFByb2dyYW0ucmVtb3ZlVHJhbnNmb3JtKCdjYW1lcmEnKTtcbiAgICAgICAgR0xQcm9ncmFtLmFkZFRyYW5zZm9ybShcbiAgICAgICAgICAgICdjYW1lcmEnLFxuXG4gICAgICAgICAgICAndW5pZm9ybSBtYXQ0IHVfcGVyc3BlY3RpdmU7JyxcblxuICAgICAgICAgICAgJ3ZvaWQgY2FtZXJhUHJvamVjdGlvbiAoaW5vdXQgdmVjNCBwb3NpdGlvbikgeyBcXG5cXFxuICAgICAgICAgICAgICAgIHBvc2l0aW9uID0gdV9wZXJzcGVjdGl2ZSAqIHBvc2l0aW9uOyBcXG5cXFxuICAgICAgICAgICAgfSdcbiAgICAgICAgKTtcbiAgICB9XG5cbiAgICB1cGRhdGUoKSB7XG4gICAgICAgIC8vIEhlaWdodCBvZiB0aGUgdmlld3BvcnQgaW4gbWV0ZXJzIGF0IGN1cnJlbnQgem9vbVxuICAgICAgICB2YXIgbWV0ZXJfem9vbV95ID0gdGhpcy5zY2VuZS5jc3Nfc2l6ZS5oZWlnaHQgKiBHZW8ubWV0ZXJzUGVyUGl4ZWwodGhpcy5zY2VuZS56b29tKTtcblxuICAgICAgICAvLyBEaXN0YW5jZSB0aGF0IGNhbWVyYSBzaG91bGQgYmUgZnJvbSBncm91bmQgc3VjaCB0aGF0IGl0IGZpdHMgdGhlIGZpZWxkIG9mIHZpZXcgZXhwZWN0ZWRcbiAgICAgICAgLy8gZm9yIGEgY29udmVudGlvbmFsIHdlYiBtZXJjYXRvciBtYXAgYXQgdGhlIGN1cnJlbnQgem9vbSBsZXZlbCBhbmQgY2FtZXJhIGZvY2FsIGxlbmd0aFxuICAgICAgICB2YXIgY2FtZXJhX2hlaWdodCA9IG1ldGVyX3pvb21feSAvIDIgKiB0aGlzLmZvY2FsX2xlbmd0aDtcblxuICAgICAgICAvLyBQZXJzcGVjdGl2ZSBtYXRyaXggcGFyYW1zXG4gICAgICAgIC8vIEFkanVzbWVudCBvZiBmb2NhbCBsZW5ndGggKGFyY3RhbmdlbnQpIGlzIGJlY2F1c2UgcGVyc3BlY3RpdmUgbWF0cml4IGJ1aWxkZXIgZXhwZWN0cyBmaWVsZC1vZi12aWV3IGluIHJhZGlhbnMsIGJ1dCB3ZSBhcmVcbiAgICAgICAgLy8gcGFzc2luZyB0aGUgZmluYWwgdmFsdWUgZXhwZWN0ZWQgdG8gYmUgaW4gdGhlIHBlcnNwZWN0aXZlIG1hdHJpeCwgc28gd2UgbmVlZCB0byByZXZlcnNlLWNhbGN1bGF0ZSB0aGUgb3JpZ2luYWwgRk9WIGhlcmUuXG4gICAgICAgIHZhciBmb3YgPSBNYXRoLmF0YW4oMSAvIHRoaXMuZm9jYWxfbGVuZ3RoKSAqIDI7XG4gICAgICAgIHZhciBhc3BlY3QgPSB0aGlzLnNjZW5lLnZpZXdfYXNwZWN0O1xuICAgICAgICB2YXIgem5lYXIgPSAxOyAgICAgICAgICAgICAgICAgICAgICAgICAgIC8vIHplcm8gY2xpcHBpbmcgcGxhbmUgY2F1c2UgYXJ0aWZhY3RzLCBsb29rcyBsaWtlIHogcHJlY2lzaW9uIGlzc3VlcyAoVE9ETzogd2h5PylcbiAgICAgICAgdmFyIHpmYXIgPSAoY2FtZXJhX2hlaWdodCArIHpuZWFyKSAqIDU7ICAvLyBwdXQgZ2VvbWV0cnkgaW4gbmVhciAyMCUgb2YgY2xpcHBpbmcgcGxhbmUsIHRvIHRha2UgYWR2YW50YWdlIG9mIGhpZ2hlci1wcmVjaXNpb24gZGVwdGggcmFuZ2UgKFRPRE86IGNhbGN1bGF0ZSB0aGUgZGVwdGggbmVlZGVkIHRvIHBsYWNlIGdlb21ldHJ5IGF0IHo9MCBpbiBub3JtYWxpemVkIGRldmljZSBjb29yZHM/KVxuXG4gICAgICAgIG1hdDQucGVyc3BlY3RpdmUodGhpcy5wZXJzcGVjdGl2ZV9tYXQsIGZvdiwgYXNwZWN0LCB6bmVhciwgemZhcik7XG5cbiAgICAgICAgLy8gVHJhbnNsYXRlIGdlb21ldHJ5IGludG8gdGhlIGRpc3RhbmNlIHNvIHRoYXQgY2FtZXJhIGlzIGFwcHJvcHJpYXRlIGxldmVsIGFib3ZlIGdyb3VuZFxuICAgICAgICBtYXQ0LnRyYW5zbGF0ZSh0aGlzLnBlcnNwZWN0aXZlX21hdCwgdGhpcy5wZXJzcGVjdGl2ZV9tYXQsIHZlYzMuZnJvbVZhbHVlcygwLCAwLCAtY2FtZXJhX2hlaWdodCkpO1xuICAgIH1cblxuICAgIHNldHVwUHJvZ3JhbShnbF9wcm9ncmFtKSB7XG4gICAgICAgIGdsX3Byb2dyYW0udW5pZm9ybSgnTWF0cml4NGZ2JywgJ3VfcGVyc3BlY3RpdmUnLCBmYWxzZSwgdGhpcy5wZXJzcGVjdGl2ZV9tYXQpO1xuICAgIH1cblxufVxuXG4vLyBJc29tZXRyaWMtc3R5bGUgcHJvamVjdGlvblxuZXhwb3J0IGNsYXNzIElzb21ldHJpY0NhbWVyYSBleHRlbmRzIENhbWVyYSB7XG5cbiAgICBjb25zdHJ1Y3RvcihzY2VuZSwgb3B0aW9ucyA9IHt9KSB7XG4gICAgICAgIHN1cGVyKHNjZW5lKTtcbiAgICAgICAgdGhpcy5tZXRlcl92aWV3X21hdCA9IG1hdDQuY3JlYXRlKCk7XG5cbiAgICAgICAgR0xQcm9ncmFtLnJlbW92ZVRyYW5zZm9ybSgnY2FtZXJhJyk7XG4gICAgICAgIEdMUHJvZ3JhbS5hZGRUcmFuc2Zvcm0oXG4gICAgICAgICAgICAnY2FtZXJhJyxcblxuICAgICAgICAgICAgJ3VuaWZvcm0gbWF0NCB1X21ldGVyX3ZpZXc7JyxcblxuICAgICAgICAgICAgJ3ZlYzIgaXNvbWV0cmljX2F4aXMgPSB2ZWMyKDAuLCAxLik7JyxcbiAgICAgICAgICAgICdmbG9hdCBpc29tZXRyaWNfc2NhbGUgPSAxLjsnLFxuXG4gICAgICAgICAgICAndm9pZCBjYW1lcmFQcm9qZWN0aW9uIChpbm91dCB2ZWM0IHBvc2l0aW9uKSB7IFxcblxcXG4gICAgICAgICAgICAgICAgcG9zaXRpb24gPSB1X21ldGVyX3ZpZXcgKiBwb3NpdGlvbjsgXFxuXFxcbiAgICAgICAgICAgICAgICBwb3NpdGlvbi54eSArPSBwb3NpdGlvbi56ICogaXNvbWV0cmljX2F4aXMgKiBpc29tZXRyaWNfc2NhbGUgLyAxLjsgXFxuXFxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIFxcblxcXG4gICAgICAgICAgICAgICAgLy8gUmV2ZXJzZSB6IGZvciBkZXB0aCBidWZmZXIgc28gdXAgaXMgbmVnYXRpdmUsIFxcblxcXG4gICAgICAgICAgICAgICAgLy8gYW5kIHNjYWxlIGRvd24gdmFsdWVzIHNvIG9iamVjdHMgaGlnaGVyIHRoYW4gb25lIHNjcmVlbiBoZWlnaHQgd2lsbCBub3QgZ2V0IGNsaXBwZWQgXFxuXFxcbiAgICAgICAgICAgICAgICBwb3NpdGlvbi56ID0gLXBvc2l0aW9uLnogLyAxMDAuICsgMS47IFxcblxcXG4gICAgICAgICAgICB9J1xuICAgICAgICApO1xuICAgIH1cblxuICAgIHVwZGF0ZSgpIHtcbiAgICAgICAgLy8gQ29udmVydCBtZXJjYXRvciBtZXRlcnMgdG8gc2NyZWVuIHNwYWNlXG4gICAgICAgIG1hdDQuaWRlbnRpdHkodGhpcy5tZXRlcl92aWV3X21hdCk7XG4gICAgICAgIG1hdDQuc2NhbGUodGhpcy5tZXRlcl92aWV3X21hdCwgdGhpcy5tZXRlcl92aWV3X21hdCwgdmVjMy5mcm9tVmFsdWVzKDEgLyB0aGlzLnNjZW5lLm1ldGVyX3pvb20ueCwgMSAvIHRoaXMuc2NlbmUubWV0ZXJfem9vbS55LCAxIC8gdGhpcy5zY2VuZS5tZXRlcl96b29tLnkpKTtcbiAgICB9XG5cbiAgICBzZXR1cFByb2dyYW0oZ2xfcHJvZ3JhbSkge1xuICAgICAgICBnbF9wcm9ncmFtLnVuaWZvcm0oJ01hdHJpeDRmdicsICd1X21ldGVyX3ZpZXcnLCBmYWxzZSwgdGhpcy5tZXRlcl92aWV3X21hdCk7XG4gICAgfVxuXG59XG5cbi8vIEZsYXQgcHJvamVjdGlvbiAoZS5nLiBqdXN0IHRvcC1kb3duLCBubyBwZXJzcGVjdGl2ZSlcbmV4cG9ydCBjbGFzcyBGbGF0Q2FtZXJhIGV4dGVuZHMgQ2FtZXJhIHtcblxuICAgIGNvbnN0cnVjdG9yKHNjZW5lLCBvcHRpb25zID0ge30pIHtcbiAgICAgICAgc3VwZXIoc2NlbmUpO1xuICAgICAgICB0aGlzLm1ldGVyX3ZpZXdfbWF0ID0gbWF0NC5jcmVhdGUoKTtcblxuICAgICAgICBHTFByb2dyYW0ucmVtb3ZlVHJhbnNmb3JtKCdjYW1lcmEnKTtcbiAgICAgICAgR0xQcm9ncmFtLmFkZFRyYW5zZm9ybShcbiAgICAgICAgICAgICdjYW1lcmEnLFxuXG4gICAgICAgICAgICAndW5pZm9ybSBtYXQ0IHVfbWV0ZXJfdmlldzsnLFxuXG4gICAgICAgICAgICAndm9pZCBjYW1lcmFQcm9qZWN0aW9uIChpbm91dCB2ZWM0IHBvc2l0aW9uKSB7IFxcblxcXG4gICAgICAgICAgICAgICAgcG9zaXRpb24gPSB1X21ldGVyX3ZpZXcgKiBwb3NpdGlvbjsgXFxuXFxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBcXG5cXFxuICAgICAgICAgICAgICAgIC8vIFJldmVyc2UgeiBmb3IgZGVwdGggYnVmZmVyIHNvIHVwIGlzIG5lZ2F0aXZlLCBcXG5cXFxuICAgICAgICAgICAgICAgIC8vIGFuZCBzY2FsZSBkb3duIHZhbHVlcyBzbyBvYmplY3RzIGhpZ2hlciB0aGFuIG9uZSBzY3JlZW4gaGVpZ2h0IHdpbGwgbm90IGdldCBjbGlwcGVkIFxcblxcXG4gICAgICAgICAgICAgICAgcG9zaXRpb24ueiA9IC1wb3NpdGlvbi56IC8gMTAwLiArIDEuOyBcXG5cXFxuICAgICAgICAgICAgfSdcbiAgICAgICAgKTtcbiAgICB9XG5cbiAgICB1cGRhdGUoKSB7XG4gICAgICAgIC8vIENvbnZlcnQgbWVyY2F0b3IgbWV0ZXJzIHRvIHNjcmVlbiBzcGFjZVxuICAgICAgICBtYXQ0LmlkZW50aXR5KHRoaXMubWV0ZXJfdmlld19tYXQpO1xuICAgICAgICBtYXQ0LnNjYWxlKHRoaXMubWV0ZXJfdmlld19tYXQsIHRoaXMubWV0ZXJfdmlld19tYXQsIHZlYzMuZnJvbVZhbHVlcygxIC8gdGhpcy5zY2VuZS5tZXRlcl96b29tLngsIDEgLyB0aGlzLnNjZW5lLm1ldGVyX3pvb20ueSwgMSAvIHRoaXMuc2NlbmUubWV0ZXJfem9vbS55KSk7XG4gICAgfVxuXG4gICAgc2V0dXBQcm9ncmFtKGdsX3Byb2dyYW0pIHtcbiAgICAgICAgZ2xfcHJvZ3JhbS51bmlmb3JtKCdNYXRyaXg0ZnYnLCAndV9tZXRlcl92aWV3JywgZmFsc2UsIHRoaXMubWV0ZXJfdmlld19tYXQpO1xuICAgIH1cblxufVxuIiwiLy8gTWlzY2VsbGFuZW91cyBnZW8gZnVuY3Rpb25zXG5pbXBvcnQgUG9pbnQgZnJvbSAnLi9wb2ludCc7XG5cbmV4cG9ydCB2YXIgR2VvID0ge307XG5cbi8vIFByb2plY3Rpb24gY29uc3RhbnRzXG5HZW8udGlsZV9zaXplID0gMjU2O1xuR2VvLmhhbGZfY2lyY3VtZmVyZW5jZV9tZXRlcnMgPSAyMDAzNzUwOC4zNDI3ODkyNDQ7XG5HZW8ubWFwX29yaWdpbl9tZXRlcnMgPSBQb2ludCgtR2VvLmhhbGZfY2lyY3VtZmVyZW5jZV9tZXRlcnMsIEdlby5oYWxmX2NpcmN1bWZlcmVuY2VfbWV0ZXJzKTtcbkdlby5taW5fem9vbV9tZXRlcnNfcGVyX3BpeGVsID0gR2VvLmhhbGZfY2lyY3VtZmVyZW5jZV9tZXRlcnMgKiAyIC8gR2VvLnRpbGVfc2l6ZTsgLy8gbWluIHpvb20gZHJhd3Mgd29ybGQgYXMgMiB0aWxlcyB3aWRlXG5HZW8ubWV0ZXJzX3Blcl9waXhlbCA9IFtdO1xuR2VvLm1heF96b29tID0gMjA7XG5mb3IgKHZhciB6PTA7IHogPD0gR2VvLm1heF96b29tOyB6KyspIHtcbiAgICBHZW8ubWV0ZXJzX3Blcl9waXhlbFt6XSA9IEdlby5taW5fem9vbV9tZXRlcnNfcGVyX3BpeGVsIC8gTWF0aC5wb3coMiwgeik7XG59XG5cbkdlby5tZXRlcnNQZXJQaXhlbCA9IGZ1bmN0aW9uICh6b29tKSB7XG4gICAgcmV0dXJuIEdlby5taW5fem9vbV9tZXRlcnNfcGVyX3BpeGVsIC8gTWF0aC5wb3coMiwgem9vbSk7XG59XG5cbi8vIENvbnZlcnNpb24gZnVuY3Rpb25zIGJhc2VkIG9uIGFuIGRlZmluZWQgdGlsZSBzY2FsZVxuR2VvLnVuaXRzX3Blcl9tZXRlciA9IFtdO1xuR2VvLnNldFRpbGVTY2FsZSA9IGZ1bmN0aW9uKHNjYWxlKVxue1xuICAgIEdlby50aWxlX3NjYWxlID0gc2NhbGU7XG4gICAgR2VvLnVuaXRzX3Blcl9waXhlbCA9IEdlby50aWxlX3NjYWxlIC8gR2VvLnRpbGVfc2l6ZTtcblxuICAgIGZvciAodmFyIHo9MDsgeiA8PSBHZW8ubWF4X3pvb207IHorKykge1xuICAgICAgICBHZW8udW5pdHNfcGVyX21ldGVyW3pdID0gR2VvLnRpbGVfc2NhbGUgLyAoR2VvLnRpbGVfc2l6ZSAqIEdlby5tZXRlcnNfcGVyX3BpeGVsW3pdKTtcbiAgICB9XG59O1xuXG4vLyBDb252ZXJ0IHRpbGUgbG9jYXRpb24gdG8gbWVyY2F0b3IgbWV0ZXJzIC0gbXVsdGlwbHkgYnkgcGl4ZWxzIHBlciB0aWxlLCB0aGVuIGJ5IG1ldGVycyBwZXIgcGl4ZWwsIGFkanVzdCBmb3IgbWFwIG9yaWdpblxuR2VvLm1ldGVyc0ZvclRpbGUgPSBmdW5jdGlvbiAodGlsZSlcbntcbiAgICByZXR1cm4gUG9pbnQoXG4gICAgICAgICh0aWxlLnggKiBHZW8udGlsZV9zaXplICogR2VvLm1ldGVyc19wZXJfcGl4ZWxbdGlsZS56XSkgKyBHZW8ubWFwX29yaWdpbl9tZXRlcnMueCxcbiAgICAgICAgKCh0aWxlLnkgKiBHZW8udGlsZV9zaXplICogR2VvLm1ldGVyc19wZXJfcGl4ZWxbdGlsZS56XSkgKiAtMSkgKyBHZW8ubWFwX29yaWdpbl9tZXRlcnMueVxuICAgICk7XG59O1xuXG4vLyBDb252ZXJ0IG1lcmNhdG9yIG1ldGVycyB0byBsYXQtbG5nXG5HZW8ubWV0ZXJzVG9MYXRMbmcgPSBmdW5jdGlvbiAobWV0ZXJzKVxue1xuICAgIHZhciBjID0gUG9pbnQuY29weShtZXRlcnMpO1xuXG4gICAgYy54IC89IEdlby5oYWxmX2NpcmN1bWZlcmVuY2VfbWV0ZXJzO1xuICAgIGMueSAvPSBHZW8uaGFsZl9jaXJjdW1mZXJlbmNlX21ldGVycztcblxuICAgIGMueSA9ICgyICogTWF0aC5hdGFuKE1hdGguZXhwKGMueSAqIE1hdGguUEkpKSAtIChNYXRoLlBJIC8gMikpIC8gTWF0aC5QSTtcblxuICAgIGMueCAqPSAxODA7XG4gICAgYy55ICo9IDE4MDtcblxuICAgIHJldHVybiBjO1xufTtcblxuLy8gQ29udmVydCBsYXQtbG5nIHRvIG1lcmNhdG9yIG1ldGVyc1xuR2VvLmxhdExuZ1RvTWV0ZXJzID0gZnVuY3Rpb24obGF0bG5nKVxue1xuICAgIHZhciBjID0gUG9pbnQuY29weShsYXRsbmcpO1xuXG4gICAgLy8gTGF0aXR1ZGVcbiAgICBjLnkgPSBNYXRoLmxvZyhNYXRoLnRhbigoYy55ICsgOTApICogTWF0aC5QSSAvIDM2MCkpIC8gKE1hdGguUEkgLyAxODApO1xuICAgIGMueSA9IGMueSAqIEdlby5oYWxmX2NpcmN1bWZlcmVuY2VfbWV0ZXJzIC8gMTgwO1xuXG4gICAgLy8gTG9uZ2l0dWRlXG4gICAgYy54ID0gYy54ICogR2VvLmhhbGZfY2lyY3VtZmVyZW5jZV9tZXRlcnMgLyAxODA7XG5cbiAgICByZXR1cm4gYztcbn07XG5cbi8vIFJ1biBhIHRyYW5zZm9ybSBmdW5jdGlvbiBvbiBlYWNoIGNvb29yZGluYXRlIGluIGEgR2VvSlNPTiBnZW9tZXRyeVxuR2VvLnRyYW5zZm9ybUdlb21ldHJ5ID0gZnVuY3Rpb24gKGdlb21ldHJ5LCB0cmFuc2Zvcm0pXG57XG4gICAgaWYgKGdlb21ldHJ5LnR5cGUgPT0gJ1BvaW50Jykge1xuICAgICAgICByZXR1cm4gdHJhbnNmb3JtKGdlb21ldHJ5LmNvb3JkaW5hdGVzKTtcbiAgICB9XG4gICAgZWxzZSBpZiAoZ2VvbWV0cnkudHlwZSA9PSAnTGluZVN0cmluZycgfHwgZ2VvbWV0cnkudHlwZSA9PSAnTXVsdGlQb2ludCcpIHtcbiAgICAgICAgcmV0dXJuIGdlb21ldHJ5LmNvb3JkaW5hdGVzLm1hcCh0cmFuc2Zvcm0pO1xuICAgIH1cbiAgICBlbHNlIGlmIChnZW9tZXRyeS50eXBlID09ICdQb2x5Z29uJyB8fCBnZW9tZXRyeS50eXBlID09ICdNdWx0aUxpbmVTdHJpbmcnKSB7XG4gICAgICAgIHJldHVybiBnZW9tZXRyeS5jb29yZGluYXRlcy5tYXAoZnVuY3Rpb24gKGNvb3JkaW5hdGVzKSB7XG4gICAgICAgICAgICByZXR1cm4gY29vcmRpbmF0ZXMubWFwKHRyYW5zZm9ybSk7XG4gICAgICAgIH0pO1xuICAgIH1cbiAgICBlbHNlIGlmIChnZW9tZXRyeS50eXBlID09ICdNdWx0aVBvbHlnb24nKSB7XG4gICAgICAgIHJldHVybiBnZW9tZXRyeS5jb29yZGluYXRlcy5tYXAoZnVuY3Rpb24gKHBvbHlnb24pIHtcbiAgICAgICAgICAgIHJldHVybiBwb2x5Z29uLm1hcChmdW5jdGlvbiAoY29vcmRpbmF0ZXMpIHtcbiAgICAgICAgICAgICAgICByZXR1cm4gY29vcmRpbmF0ZXMubWFwKHRyYW5zZm9ybSk7XG4gICAgICAgICAgICB9KTtcbiAgICAgICAgfSk7XG4gICAgfVxuICAgIC8vIFRPRE86IHN1cHBvcnQgR2VvbWV0cnlDb2xsZWN0aW9uXG4gICAgcmV0dXJuIHt9O1xufTtcblxuR2VvLmJveEludGVyc2VjdCA9IGZ1bmN0aW9uIChiMSwgYjIpXG57XG4gICAgcmV0dXJuICEoXG4gICAgICAgIGIyLnN3LnggPiBiMS5uZS54IHx8XG4gICAgICAgIGIyLm5lLnggPCBiMS5zdy54IHx8XG4gICAgICAgIGIyLnN3LnkgPiBiMS5uZS55IHx8XG4gICAgICAgIGIyLm5lLnkgPCBiMS5zdy55XG4gICAgKTtcbn07XG5cbi8vIFNwbGl0IHRoZSBsaW5lcyBvZiBhIGZlYXR1cmUgd2hlcmV2ZXIgdHdvIHBvaW50cyBhcmUgZmFydGhlciBhcGFydCB0aGFuIGEgZ2l2ZW4gdG9sZXJhbmNlXG5HZW8uc3BsaXRGZWF0dXJlTGluZXMgID0gZnVuY3Rpb24gKGZlYXR1cmUsIHRvbGVyYW5jZSkge1xuICAgIHZhciB0b2xlcmFuY2UgPSB0b2xlcmFuY2UgfHwgMC4wMDE7XG4gICAgdmFyIHRvbGVyYW5jZV9zcSA9IHRvbGVyYW5jZSAqIHRvbGVyYW5jZTtcbiAgICB2YXIgZ2VvbSA9IGZlYXR1cmUuZ2VvbWV0cnk7XG4gICAgdmFyIGxpbmVzO1xuXG4gICAgaWYgKGdlb20udHlwZSA9PSAnTXVsdGlMaW5lU3RyaW5nJykge1xuICAgICAgICBsaW5lcyA9IGdlb20uY29vcmRpbmF0ZXM7XG4gICAgfVxuICAgIGVsc2UgaWYgKGdlb20udHlwZSA9PSdMaW5lU3RyaW5nJykge1xuICAgICAgICBsaW5lcyA9IFtnZW9tLmNvb3JkaW5hdGVzXTtcbiAgICB9XG4gICAgZWxzZSB7XG4gICAgICAgIHJldHVybiBmZWF0dXJlO1xuICAgIH1cblxuICAgIHZhciBzcGxpdF9saW5lcyA9IFtdO1xuXG4gICAgZm9yICh2YXIgcz0wOyBzIDwgbGluZXMubGVuZ3RoOyBzKyspIHtcbiAgICAgICAgdmFyIHNlZyA9IGxpbmVzW3NdO1xuICAgICAgICB2YXIgc3BsaXRfc2VnID0gW107XG4gICAgICAgIHZhciBsYXN0X2Nvb3JkID0gbnVsbDtcbiAgICAgICAgdmFyIGtlZXA7XG5cbiAgICAgICAgZm9yICh2YXIgYz0wOyBjIDwgc2VnLmxlbmd0aDsgYysrKSB7XG4gICAgICAgICAgICB2YXIgY29vcmQgPSBzZWdbY107XG4gICAgICAgICAgICBrZWVwID0gdHJ1ZTtcblxuICAgICAgICAgICAgaWYgKGxhc3RfY29vcmQgIT0gbnVsbCkge1xuICAgICAgICAgICAgICAgIHZhciBkaXN0ID0gKGNvb3JkWzBdIC0gbGFzdF9jb29yZFswXSkgKiAoY29vcmRbMF0gLSBsYXN0X2Nvb3JkWzBdKSArIChjb29yZFsxXSAtIGxhc3RfY29vcmRbMV0pICogKGNvb3JkWzFdIC0gbGFzdF9jb29yZFsxXSk7XG4gICAgICAgICAgICAgICAgaWYgKGRpc3QgPiB0b2xlcmFuY2Vfc3EpIHtcbiAgICAgICAgICAgICAgICAgICAgLy8gY29uc29sZS5sb2coXCJzcGxpdCBsaW5lcyBhdCAoXCIgKyBjb29yZFswXSArIFwiLCBcIiArIGNvb3JkWzFdICsgXCIpLCBcIiArIE1hdGguc3FydChkaXN0KSArIFwiIGFwYXJ0XCIpO1xuICAgICAgICAgICAgICAgICAgICBrZWVwID0gZmFsc2U7XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICBpZiAoa2VlcCA9PSBmYWxzZSkge1xuICAgICAgICAgICAgICAgIHNwbGl0X2xpbmVzLnB1c2goc3BsaXRfc2VnKTtcbiAgICAgICAgICAgICAgICBzcGxpdF9zZWcgPSBbXTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIHNwbGl0X3NlZy5wdXNoKGNvb3JkKTtcblxuICAgICAgICAgICAgbGFzdF9jb29yZCA9IGNvb3JkO1xuICAgICAgICB9XG5cbiAgICAgICAgc3BsaXRfbGluZXMucHVzaChzcGxpdF9zZWcpO1xuICAgICAgICBzcGxpdF9zZWcgPSBbXTtcbiAgICB9XG5cbiAgICBpZiAoc3BsaXRfbGluZXMubGVuZ3RoID09IDEpIHtcbiAgICAgICAgZ2VvbS50eXBlID0gJ0xpbmVTdHJpbmcnO1xuICAgICAgICBnZW9tLmNvb3JkaW5hdGVzID0gc3BsaXRfbGluZXNbMF07XG4gICAgfVxuICAgIGVsc2Uge1xuICAgICAgICBnZW9tLnR5cGUgPSAnTXVsdGlMaW5lU3RyaW5nJztcbiAgICAgICAgZ2VvbS5jb29yZGluYXRlcyA9IHNwbGl0X2xpbmVzO1xuICAgIH1cblxuICAgIHJldHVybiBmZWF0dXJlO1xufTtcbiIsIi8vIFdlYkdMIG1hbmFnZW1lbnQgYW5kIHJlbmRlcmluZyBmdW5jdGlvbnNcblxuZXhwb3J0IHZhciBHTCA9IHt9O1xuXG4vLyBTZXR1cCBhIFdlYkdMIGNvbnRleHRcbi8vIElmIG5vIGNhbnZhcyBlbGVtZW50IGlzIHByb3ZpZGVkLCBvbmUgaXMgY3JlYXRlZCBhbmQgYWRkZWQgdG8gdGhlIGRvY3VtZW50IGJvZHlcbkdMLmdldENvbnRleHQgPSBmdW5jdGlvbiBnZXRDb250ZXh0IChjYW52YXMpXG57XG5cbiAgICB2YXIgZnVsbHNjcmVlbiA9IGZhbHNlO1xuICAgIGlmIChjYW52YXMgPT0gbnVsbCkge1xuICAgICAgICBjYW52YXMgPSBkb2N1bWVudC5jcmVhdGVFbGVtZW50KCdjYW52YXMnKTtcbiAgICAgICAgY2FudmFzLnN0eWxlLnBvc2l0aW9uID0gJ2Fic29sdXRlJztcbiAgICAgICAgY2FudmFzLnN0eWxlLnRvcCA9IDA7XG4gICAgICAgIGNhbnZhcy5zdHlsZS5sZWZ0ID0gMDtcbiAgICAgICAgY2FudmFzLnN0eWxlLnpJbmRleCA9IC0xO1xuICAgICAgICBkb2N1bWVudC5ib2R5LmFwcGVuZENoaWxkKGNhbnZhcyk7XG4gICAgICAgIGZ1bGxzY3JlZW4gPSB0cnVlO1xuICAgIH1cblxuICAgIHZhciBnbCA9IGNhbnZhcy5nZXRDb250ZXh0KCdleHBlcmltZW50YWwtd2ViZ2wnKTtcbiAgICBpZiAoIWdsKSB7XG4gICAgICAgIGFsZXJ0KFwiQ291bGRuJ3QgY3JlYXRlIFdlYkdMIGNvbnRleHQuIFlvdXIgYnJvd3NlciBwcm9iYWJseSBkb2Vzbid0IHN1cHBvcnQgV2ViR0wgb3IgaXQncyB0dXJuZWQgb2ZmP1wiKTtcbiAgICAgICAgdGhyb3cgXCJDb3VsZG4ndCBjcmVhdGUgV2ViR0wgY29udGV4dFwiO1xuICAgIH1cblxuICAgIEdMLnJlc2l6ZUNhbnZhcyhnbCwgd2luZG93LmlubmVyV2lkdGgsIHdpbmRvdy5pbm5lckhlaWdodCk7XG4gICAgaWYgKGZ1bGxzY3JlZW4gPT0gdHJ1ZSkge1xuICAgICAgICB3aW5kb3cuYWRkRXZlbnRMaXN0ZW5lcigncmVzaXplJywgZnVuY3Rpb24gKCkge1xuICAgICAgICAgICAgR0wucmVzaXplQ2FudmFzKGdsLCB3aW5kb3cuaW5uZXJXaWR0aCwgd2luZG93LmlubmVySGVpZ2h0KTtcbiAgICAgICAgfSk7XG4gICAgfVxuXG4gICAgLy8gR0xWZXJ0ZXhBcnJheU9iamVjdC5pbml0KGdsKTsgLy8gVE9ETzogdGhpcyBwYXR0ZXJuIGRvZXNuJ3Qgc3VwcG9ydCBtdWx0aXBsZSBhY3RpdmUgR0wgY29udGV4dHMsIHNob3VsZCB0aGF0IGV2ZW4gYmUgc3VwcG9ydGVkP1xuXG4gICAgcmV0dXJuIGdsO1xufTtcblxuR0wucmVzaXplQ2FudmFzID0gZnVuY3Rpb24gKGdsLCB3aWR0aCwgaGVpZ2h0KVxue1xuICAgIHZhciBkZXZpY2VfcGl4ZWxfcmF0aW8gPSB3aW5kb3cuZGV2aWNlUGl4ZWxSYXRpbyB8fCAxO1xuICAgIGdsLmNhbnZhcy5zdHlsZS53aWR0aCA9IHdpZHRoICsgJ3B4JztcbiAgICBnbC5jYW52YXMuc3R5bGUuaGVpZ2h0ID0gaGVpZ2h0ICsgJ3B4JztcbiAgICBnbC5jYW52YXMud2lkdGggPSBNYXRoLnJvdW5kKGdsLmNhbnZhcy5zdHlsZS53aWR0aCAqIGRldmljZV9waXhlbF9yYXRpbyk7XG4gICAgZ2wuY2FudmFzLmhlaWdodCA9IE1hdGgucm91bmQoZ2wuY2FudmFzLnN0eWxlLndpZHRoICogZGV2aWNlX3BpeGVsX3JhdGlvKTtcbiAgICBnbC52aWV3cG9ydCgwLCAwLCBnbC5jYW52YXMud2lkdGgsIGdsLmNhbnZhcy5oZWlnaHQpO1xufTtcblxuLy8gQ29tcGlsZSAmIGxpbmsgYSBXZWJHTCBwcm9ncmFtIGZyb20gcHJvdmlkZWQgdmVydGV4IGFuZCBmcmFnbWVudCBzaGFkZXIgc291cmNlc1xuLy8gdXBkYXRlIGEgcHJvZ3JhbSBpZiBvbmUgaXMgcGFzc2VkIGluLiBDcmVhdGUgb25lIGlmIG5vdC4gQWxlcnQgYW5kIGRvbid0IHVwZGF0ZSBhbnl0aGluZyBpZiB0aGUgc2hhZGVycyBkb24ndCBjb21waWxlLlxuR0wudXBkYXRlUHJvZ3JhbSA9IGZ1bmN0aW9uIEdMdXBkYXRlUHJvZ3JhbSAoZ2wsIHByb2dyYW0sIHZlcnRleF9zaGFkZXJfc291cmNlLCBmcmFnbWVudF9zaGFkZXJfc291cmNlKVxue1xuICAgIHRyeSB7XG4gICAgICAgIHZhciB2ZXJ0ZXhfc2hhZGVyID0gR0wuY3JlYXRlU2hhZGVyKGdsLCB2ZXJ0ZXhfc2hhZGVyX3NvdXJjZSwgZ2wuVkVSVEVYX1NIQURFUik7XG4gICAgICAgIHZhciBmcmFnbWVudF9zaGFkZXIgPSBHTC5jcmVhdGVTaGFkZXIoZ2wsICcjaWZkZWYgR0xfRVNcXG5wcmVjaXNpb24gaGlnaHAgZmxvYXQ7XFxuI2VuZGlmXFxuXFxuJyArIGZyYWdtZW50X3NoYWRlcl9zb3VyY2UsIGdsLkZSQUdNRU5UX1NIQURFUik7XG4gICAgfVxuICAgIGNhdGNoKGVycikge1xuICAgICAgICAvLyBhbGVydChlcnIpO1xuICAgICAgICBjb25zb2xlLmxvZyhlcnIpO1xuICAgICAgICByZXR1cm4gcHJvZ3JhbTtcbiAgICB9XG5cbiAgICBnbC51c2VQcm9ncmFtKG51bGwpO1xuICAgIGlmIChwcm9ncmFtICE9IG51bGwpIHtcbiAgICAgICAgdmFyIG9sZF9zaGFkZXJzID0gZ2wuZ2V0QXR0YWNoZWRTaGFkZXJzKHByb2dyYW0pO1xuICAgICAgICBmb3IodmFyIGkgPSAwOyBpIDwgb2xkX3NoYWRlcnMubGVuZ3RoOyBpKyspIHtcbiAgICAgICAgICAgIGdsLmRldGFjaFNoYWRlcihwcm9ncmFtLCBvbGRfc2hhZGVyc1tpXSk7XG4gICAgICAgIH1cbiAgICB9IGVsc2Uge1xuICAgICAgICBwcm9ncmFtID0gZ2wuY3JlYXRlUHJvZ3JhbSgpO1xuICAgIH1cblxuICAgIGlmICh2ZXJ0ZXhfc2hhZGVyID09IG51bGwgfHwgZnJhZ21lbnRfc2hhZGVyID09IG51bGwpIHtcbiAgICAgICAgcmV0dXJuIHByb2dyYW07XG4gICAgfVxuXG4gICAgZ2wuYXR0YWNoU2hhZGVyKHByb2dyYW0sIHZlcnRleF9zaGFkZXIpO1xuICAgIGdsLmF0dGFjaFNoYWRlcihwcm9ncmFtLCBmcmFnbWVudF9zaGFkZXIpO1xuXG4gICAgZ2wuZGVsZXRlU2hhZGVyKHZlcnRleF9zaGFkZXIpO1xuICAgIGdsLmRlbGV0ZVNoYWRlcihmcmFnbWVudF9zaGFkZXIpO1xuXG4gICAgZ2wubGlua1Byb2dyYW0ocHJvZ3JhbSk7XG5cbiAgICBpZiAoIWdsLmdldFByb2dyYW1QYXJhbWV0ZXIocHJvZ3JhbSwgZ2wuTElOS19TVEFUVVMpKSB7XG4gICAgICAgIHZhciBwcm9ncmFtX2Vycm9yID1cbiAgICAgICAgICAgIFwiV2ViR0wgcHJvZ3JhbSBlcnJvcjpcXG5cIiArXG4gICAgICAgICAgICBcIlZBTElEQVRFX1NUQVRVUzogXCIgKyBnbC5nZXRQcm9ncmFtUGFyYW1ldGVyKHByb2dyYW0sIGdsLlZBTElEQVRFX1NUQVRVUykgKyBcIlxcblwiICtcbiAgICAgICAgICAgIFwiRVJST1I6IFwiICsgZ2wuZ2V0RXJyb3IoKSArIFwiXFxuXFxuXCIgK1xuICAgICAgICAgICAgXCItLS0gVmVydGV4IFNoYWRlciAtLS1cXG5cIiArIHZlcnRleF9zaGFkZXJfc291cmNlICsgXCJcXG5cXG5cIiArXG4gICAgICAgICAgICBcIi0tLSBGcmFnbWVudCBTaGFkZXIgLS0tXFxuXCIgKyBmcmFnbWVudF9zaGFkZXJfc291cmNlO1xuICAgICAgICBjb25zb2xlLmxvZyhwcm9ncmFtX2Vycm9yKTtcbiAgICAgICAgdGhyb3cgcHJvZ3JhbV9lcnJvcjtcbiAgICB9XG5cbiAgICByZXR1cm4gcHJvZ3JhbTtcbn07XG5cbi8vIENvbXBpbGUgYSB2ZXJ0ZXggb3IgZnJhZ21lbnQgc2hhZGVyIGZyb20gcHJvdmlkZWQgc291cmNlXG5HTC5jcmVhdGVTaGFkZXIgPSBmdW5jdGlvbiBHTGNyZWF0ZVNoYWRlciAoZ2wsIHNvdXJjZSwgdHlwZSlcbntcbiAgICB2YXIgc2hhZGVyID0gZ2wuY3JlYXRlU2hhZGVyKHR5cGUpO1xuXG4gICAgZ2wuc2hhZGVyU291cmNlKHNoYWRlciwgc291cmNlKTtcbiAgICBnbC5jb21waWxlU2hhZGVyKHNoYWRlcik7XG5cbiAgICBpZiAoIWdsLmdldFNoYWRlclBhcmFtZXRlcihzaGFkZXIsIGdsLkNPTVBJTEVfU1RBVFVTKSkge1xuICAgICAgICB2YXIgc2hhZGVyX2Vycm9yID1cbiAgICAgICAgICAgIFwiV2ViR0wgc2hhZGVyIGVycm9yOlxcblwiICtcbiAgICAgICAgICAgICh0eXBlID09IGdsLlZFUlRFWF9TSEFERVIgPyBcIlZFUlRFWFwiIDogXCJGUkFHTUVOVFwiKSArIFwiIFNIQURFUjpcXG5cIiArXG4gICAgICAgICAgICBnbC5nZXRTaGFkZXJJbmZvTG9nKHNoYWRlcik7XG4gICAgICAgIHRocm93IHNoYWRlcl9lcnJvcjtcbiAgICB9XG5cbiAgICByZXR1cm4gc2hhZGVyO1xufTtcblxuLy8gVHJpYW5ndWxhdGlvbiB1c2luZyBsaWJ0ZXNzLmpzIHBvcnQgb2YgZ2x1VGVzc2VsYXRvclxuLy8gaHR0cHM6Ly9naXRodWIuY29tL2JyZW5kYW5rZW5ueS9saWJ0ZXNzLmpzXG50cnkge1xuICAgIEdMLnRlc3NlbGF0b3IgPSAoZnVuY3Rpb24gaW5pdFRlc3NlbGF0b3IoKSB7XG4gICAgICAgIHZhciB0ZXNzZWxhdG9yID0gbmV3IGxpYnRlc3MuR2x1VGVzc2VsYXRvcigpO1xuXG4gICAgICAgIC8vIENhbGxlZCBmb3IgZWFjaCB2ZXJ0ZXggb2YgdGVzc2VsYXRvciBvdXRwdXRcbiAgICAgICAgZnVuY3Rpb24gdmVydGV4Q2FsbGJhY2soZGF0YSwgcG9seVZlcnRBcnJheSkge1xuICAgICAgICAgICAgaWYgKHRlc3NlbGF0b3IueiAhPSBudWxsKSB7XG4gICAgICAgICAgICAgICAgcG9seVZlcnRBcnJheS5wdXNoKFtkYXRhWzBdLCBkYXRhWzFdLCB0ZXNzZWxhdG9yLnpdKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIGVsc2Uge1xuICAgICAgICAgICAgICAgIHBvbHlWZXJ0QXJyYXkucHVzaChbZGF0YVswXSwgZGF0YVsxXV0pO1xuICAgICAgICAgICAgfVxuICAgICAgICB9XG5cbiAgICAgICAgLy8gQ2FsbGVkIHdoZW4gc2VnbWVudHMgaW50ZXJzZWN0IGFuZCBtdXN0IGJlIHNwbGl0XG4gICAgICAgIGZ1bmN0aW9uIGNvbWJpbmVDYWxsYmFjayhjb29yZHMsIGRhdGEsIHdlaWdodCkge1xuICAgICAgICAgICAgcmV0dXJuIGNvb3JkcztcbiAgICAgICAgfVxuXG4gICAgICAgIC8vIENhbGxlZCB3aGVuIGEgdmVydGV4IHN0YXJ0cyBvciBzdG9wcyBhIGJvdW5kYXJ5IGVkZ2Ugb2YgYSBwb2x5Z29uXG4gICAgICAgIGZ1bmN0aW9uIGVkZ2VDYWxsYmFjayhmbGFnKSB7XG4gICAgICAgICAgICAvLyBOby1vcCBjYWxsYmFjayB0byBmb3JjZSBzaW1wbGUgdHJpYW5nbGUgcHJpbWl0aXZlcyAobm8gdHJpYW5nbGUgc3RyaXBzIG9yIGZhbnMpLlxuICAgICAgICAgICAgLy8gU2VlOiBodHRwOi8vd3d3LmdscHJvZ3JhbW1pbmcuY29tL3JlZC9jaGFwdGVyMTEuaHRtbFxuICAgICAgICAgICAgLy8gXCJTaW5jZSBlZGdlIGZsYWdzIG1ha2Ugbm8gc2Vuc2UgaW4gYSB0cmlhbmdsZSBmYW4gb3IgdHJpYW5nbGUgc3RyaXAsIGlmIHRoZXJlIGlzIGEgY2FsbGJhY2tcbiAgICAgICAgICAgIC8vIGFzc29jaWF0ZWQgd2l0aCBHTFVfVEVTU19FREdFX0ZMQUcgdGhhdCBlbmFibGVzIGVkZ2UgZmxhZ3MsIHRoZSBHTFVfVEVTU19CRUdJTiBjYWxsYmFjayBpc1xuICAgICAgICAgICAgLy8gY2FsbGVkIG9ubHkgd2l0aCBHTF9UUklBTkdMRVMuXCJcbiAgICAgICAgICAgIC8vIGNvbnNvbGUubG9nKCdHTC50ZXNzZWxhdG9yOiBlZGdlIGZsYWc6ICcgKyBmbGFnKTtcbiAgICAgICAgfVxuXG4gICAgICAgIHRlc3NlbGF0b3IuZ2x1VGVzc0NhbGxiYWNrKGxpYnRlc3MuZ2x1RW51bS5HTFVfVEVTU19WRVJURVhfREFUQSwgdmVydGV4Q2FsbGJhY2spO1xuICAgICAgICB0ZXNzZWxhdG9yLmdsdVRlc3NDYWxsYmFjayhsaWJ0ZXNzLmdsdUVudW0uR0xVX1RFU1NfQ09NQklORSwgY29tYmluZUNhbGxiYWNrKTtcbiAgICAgICAgdGVzc2VsYXRvci5nbHVUZXNzQ2FsbGJhY2sobGlidGVzcy5nbHVFbnVtLkdMVV9URVNTX0VER0VfRkxBRywgZWRnZUNhbGxiYWNrKTtcblxuICAgICAgICAvLyBCcmVuZGFuIEtlbm55OlxuICAgICAgICAvLyBsaWJ0ZXNzIHdpbGwgdGFrZSAzZCB2ZXJ0cyBhbmQgZmxhdHRlbiB0byBhIHBsYW5lIGZvciB0ZXNzZWxhdGlvblxuICAgICAgICAvLyBzaW5jZSBvbmx5IGRvaW5nIDJkIHRlc3NlbGF0aW9uIGhlcmUsIHByb3ZpZGUgej0xIG5vcm1hbCB0byBza2lwXG4gICAgICAgIC8vIGl0ZXJhdGluZyBvdmVyIHZlcnRzIG9ubHkgdG8gZ2V0IHRoZSBzYW1lIGFuc3dlci5cbiAgICAgICAgLy8gY29tbWVudCBvdXQgdG8gdGVzdCBub3JtYWwtZ2VuZXJhdGlvbiBjb2RlXG4gICAgICAgIHRlc3NlbGF0b3IuZ2x1VGVzc05vcm1hbCgwLCAwLCAxKTtcblxuICAgICAgICByZXR1cm4gdGVzc2VsYXRvcjtcbiAgICB9KSgpO1xuXG4gICAgR0wudHJpYW5ndWxhdGVQb2x5Z29uID0gZnVuY3Rpb24gR0xUcmlhbmd1bGF0ZSAoY29udG91cnMsIHopXG4gICAge1xuICAgICAgICB2YXIgdHJpYW5nbGVWZXJ0cyA9IFtdO1xuICAgICAgICBHTC50ZXNzZWxhdG9yLnogPSB6O1xuICAgICAgICBHTC50ZXNzZWxhdG9yLmdsdVRlc3NCZWdpblBvbHlnb24odHJpYW5nbGVWZXJ0cyk7XG5cbiAgICAgICAgZm9yICh2YXIgaSA9IDA7IGkgPCBjb250b3Vycy5sZW5ndGg7IGkrKykge1xuICAgICAgICAgICAgR0wudGVzc2VsYXRvci5nbHVUZXNzQmVnaW5Db250b3VyKCk7XG4gICAgICAgICAgICB2YXIgY29udG91ciA9IGNvbnRvdXJzW2ldO1xuICAgICAgICAgICAgZm9yICh2YXIgaiA9IDA7IGogPCBjb250b3VyLmxlbmd0aDsgaiArKykge1xuICAgICAgICAgICAgICAgIHZhciBjb29yZHMgPSBbY29udG91cltqXVswXSwgY29udG91cltqXVsxXSwgMF07XG4gICAgICAgICAgICAgICAgR0wudGVzc2VsYXRvci5nbHVUZXNzVmVydGV4KGNvb3JkcywgY29vcmRzKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIEdMLnRlc3NlbGF0b3IuZ2x1VGVzc0VuZENvbnRvdXIoKTtcbiAgICAgICAgfVxuXG4gICAgICAgIEdMLnRlc3NlbGF0b3IuZ2x1VGVzc0VuZFBvbHlnb24oKTtcbiAgICAgICAgcmV0dXJuIHRyaWFuZ2xlVmVydHM7XG4gICAgfTtcbn1cbmNhdGNoIChlKSB7XG4gICAgLy8gY29uc29sZS5sb2coXCJsaWJ0ZXNzIG5vdCBkZWZpbmVkIVwiKTtcbiAgICAvLyBza2lwIGlmIGxpYnRlc3Mgbm90IGRlZmluZWRcbn1cblxuLy8gQWRkIHZlcnRpY2VzIHRvIGFuIGFycmF5IChkZXN0aW5lZCB0byBiZSB1c2VkIGFzIGEgR0wgYnVmZmVyKSwgJ3N0cmlwaW5nJyBlYWNoIHZlcnRleCB3aXRoIGNvbnN0YW50IGRhdGFcbi8vIFBlci12ZXJ0ZXggYXR0cmlidXRlcyBtdXN0IGJlIHByZS1wYWNrZWQgaW50byB0aGUgdmVydGljZXMgYXJyYXlcbi8vIFVzZWQgZm9yIGFkZGluZyB2YWx1ZXMgdGhhdCBhcmUgb2Z0ZW4gY29uc3RhbnQgcGVyIGdlb21ldHJ5IG9yIHBvbHlnb24sIGxpa2UgY29sb3JzLCBub3JtYWxzIChmb3IgcG9seXMgc2l0dGluZyBmbGF0IG9uIG1hcCksIGxheWVyIGFuZCBtYXRlcmlhbCBpbmZvLCBldGMuXG5HTC5hZGRWZXJ0aWNlcyA9IGZ1bmN0aW9uICh2ZXJ0aWNlcywgdmVydGV4X2NvbnN0YW50cywgdmVydGV4X2RhdGEpXG57XG4gICAgaWYgKHZlcnRpY2VzID09IG51bGwpIHtcbiAgICAgICAgcmV0dXJuIHZlcnRleF9kYXRhO1xuICAgIH1cbiAgICB2ZXJ0ZXhfY29uc3RhbnRzID0gdmVydGV4X2NvbnN0YW50cyB8fCBbXTtcblxuICAgIGZvciAodmFyIHY9MCwgdmxlbiA9IHZlcnRpY2VzLmxlbmd0aDsgdiA8IHZsZW47IHYrKykge1xuICAgICAgICB2ZXJ0ZXhfZGF0YS5wdXNoLmFwcGx5KHZlcnRleF9kYXRhLCB2ZXJ0aWNlc1t2XSk7XG4gICAgICAgIHZlcnRleF9kYXRhLnB1c2guYXBwbHkodmVydGV4X2RhdGEsIHZlcnRleF9jb25zdGFudHMpO1xuICAgIH1cblxuICAgIHJldHVybiB2ZXJ0ZXhfZGF0YTtcbn07XG5cbi8vIEFkZCB2ZXJ0aWNlcyB0byBhbiBhcnJheSwgJ3N0cmlwaW5nJyBlYWNoIHZlcnRleCB3aXRoIGNvbnN0YW50IGRhdGFcbi8vIE11bHRpcGxlLCB1bi1wYWNrZWQgYXR0cmlidXRlIGFycmF5cyBjYW4gYmUgcHJvdmlkZWRcbkdMLmFkZFZlcnRpY2VzTXVsdGlwbGVBdHRyaWJ1dGVzID0gZnVuY3Rpb24gKGR5bmFtaWNzLCBjb25zdGFudHMsIHZlcnRleF9kYXRhKVxue1xuICAgIHZhciBkbGVuID0gZHluYW1pY3MubGVuZ3RoO1xuICAgIHZhciB2bGVuID0gZHluYW1pY3NbMF0ubGVuZ3RoO1xuICAgIGNvbnN0YW50cyA9IGNvbnN0YW50cyB8fCBbXTtcblxuICAgIGZvciAodmFyIHY9MDsgdiA8IHZsZW47IHYrKykge1xuICAgICAgICBmb3IgKHZhciBkPTA7IGQgPCBkbGVuOyBkKyspIHtcbiAgICAgICAgICAgIHZlcnRleF9kYXRhLnB1c2guYXBwbHkodmVydGV4X2RhdGEsIGR5bmFtaWNzW2RdW3ZdKTtcbiAgICAgICAgfVxuICAgICAgICB2ZXJ0ZXhfZGF0YS5wdXNoLmFwcGx5KHZlcnRleF9kYXRhLCBjb25zdGFudHMpO1xuICAgIH1cblxuICAgIHJldHVybiB2ZXJ0ZXhfZGF0YTtcbn07XG5cbi8vIEFkZCB2ZXJ0aWNlcyB0byBhbiBhcnJheSwgd2l0aCBhIHZhcmlhYmxlIGxheW91dCAoYm90aCBwZXItdmVydGV4IGR5bmFtaWMgYW5kIGNvbnN0YW50IGF0dHJpYnMpXG4vLyBHTC5hZGRWZXJ0aWNlc0J5QXR0cmlidXRlTGF5b3V0ID0gZnVuY3Rpb24gKGF0dHJpYnMsIHZlcnRleF9kYXRhKVxuLy8ge1xuLy8gICAgIHZhciBtYXhfbGVuZ3RoID0gMDtcbi8vICAgICBmb3IgKHZhciBhPTA7IGEgPCBhdHRyaWJzLmxlbmd0aDsgYSsrKSB7XG4vLyAgICAgICAgIC8vIGNvbnNvbGUubG9nKGF0dHJpYnNbYV0ubmFtZSk7XG4vLyAgICAgICAgIC8vIGNvbnNvbGUubG9nKFwiYSBcIiArIHR5cGVvZiBhdHRyaWJzW2FdLmRhdGEpO1xuLy8gICAgICAgICBpZiAodHlwZW9mIGF0dHJpYnNbYV0uZGF0YSA9PSAnb2JqZWN0Jykge1xuLy8gICAgICAgICAgICAgLy8gY29uc29sZS5sb2coXCJhWzBdIFwiICsgdHlwZW9mIGF0dHJpYnNbYV0uZGF0YVswXSk7XG4vLyAgICAgICAgICAgICAvLyBQZXItdmVydGV4IGxpc3QgLSBhcnJheSBvZiBhcnJheVxuLy8gICAgICAgICAgICAgaWYgKHR5cGVvZiBhdHRyaWJzW2FdLmRhdGFbMF0gPT0gJ29iamVjdCcpIHtcbi8vICAgICAgICAgICAgICAgICBhdHRyaWJzW2FdLmN1cnNvciA9IDA7XG4vLyAgICAgICAgICAgICAgICAgaWYgKGF0dHJpYnNbYV0uZGF0YS5sZW5ndGggPiBtYXhfbGVuZ3RoKSB7XG4vLyAgICAgICAgICAgICAgICAgICAgIG1heF9sZW5ndGggPSBhdHRyaWJzW2FdLmRhdGEubGVuZ3RoO1xuLy8gICAgICAgICAgICAgICAgIH1cbi8vICAgICAgICAgICAgIH1cbi8vICAgICAgICAgICAgIC8vIFN0YXRpYyBhcnJheSBmb3IgYWxsIHZlcnRpY2VzXG4vLyAgICAgICAgICAgICBlbHNlIHtcbi8vICAgICAgICAgICAgICAgICBhdHRyaWJzW2FdLm5leHRfdmVydGV4ID0gYXR0cmlic1thXS5kYXRhO1xuLy8gICAgICAgICAgICAgfVxuLy8gICAgICAgICB9XG4vLyAgICAgICAgIGVsc2Uge1xuLy8gICAgICAgICAgICAgLy8gU3RhdGljIHNpbmdsZSB2YWx1ZSBmb3IgYWxsIHZlcnRpY2VzLCBjb252ZXJ0IHRvIGFycmF5XG4vLyAgICAgICAgICAgICBhdHRyaWJzW2FdLm5leHRfdmVydGV4ID0gW2F0dHJpYnNbYV0uZGF0YV07XG4vLyAgICAgICAgIH1cbi8vICAgICB9XG5cbi8vICAgICBmb3IgKHZhciB2PTA7IHYgPCBtYXhfbGVuZ3RoOyB2KyspIHtcbi8vICAgICAgICAgZm9yICh2YXIgYT0wOyBhIDwgYXR0cmlicy5sZW5ndGg7IGErKykge1xuLy8gICAgICAgICAgICAgaWYgKGF0dHJpYnNbYV0uY3Vyc29yICE9IG51bGwpIHtcbi8vICAgICAgICAgICAgICAgICAvLyBOZXh0IHZhbHVlIGluIGxpc3Rcbi8vICAgICAgICAgICAgICAgICBhdHRyaWJzW2FdLm5leHRfdmVydGV4ID0gYXR0cmlic1thXS5kYXRhW2F0dHJpYnNbYV0uY3Vyc29yXTtcblxuLy8gICAgICAgICAgICAgICAgIC8vIFRPRE86IHJlcGVhdHMgaWYgb25lIGxpc3QgaXMgc2hvcnRlciB0aGFuIG90aGVycyAtIGRlc2lyZWQgYmVoYXZpb3IsIG9yIGVuZm9yY2Ugc2FtZSBsZW5ndGg/XG4vLyAgICAgICAgICAgICAgICAgaWYgKGF0dHJpYnNbYV0uY3Vyc29yIDwgYXR0cmlic1thXS5kYXRhLmxlbmd0aCkge1xuLy8gICAgICAgICAgICAgICAgICAgICBhdHRyaWJzW2FdLmN1cnNvcisrO1xuLy8gICAgICAgICAgICAgICAgIH1cbi8vICAgICAgICAgICAgIH1cbi8vICAgICAgICAgICAgIHZlcnRleF9kYXRhLnB1c2guYXBwbHkodmVydGV4X2RhdGEsIGF0dHJpYnNbYV0ubmV4dF92ZXJ0ZXgpO1xuLy8gICAgICAgICB9XG4vLyAgICAgfVxuLy8gICAgIHJldHVybiB2ZXJ0ZXhfZGF0YTtcbi8vIH07XG4iLCJpbXBvcnQgUG9pbnQgZnJvbSAnLi4vcG9pbnQnO1xuaW1wb3J0IHtWZWN0b3J9IGZyb20gJy4uL3ZlY3Rvcic7XG5pbXBvcnQge0dMfSBmcm9tICcuL2dsJztcblxuZXhwb3J0IHZhciBHTEJ1aWxkZXJzID0ge307XG5cbkdMQnVpbGRlcnMuZGVidWcgPSBmYWxzZTtcblxuLy8gVGVzc2VsYXRlIGEgZmxhdCAyRCBwb2x5Z29uIHdpdGggZml4ZWQgaGVpZ2h0IGFuZCBhZGQgdG8gR0wgdmVydGV4IGJ1ZmZlclxuR0xCdWlsZGVycy5idWlsZFBvbHlnb25zID0gZnVuY3Rpb24gR0xCdWlsZGVyc0J1aWxkUG9seWdvbnMgKHBvbHlnb25zLCB6LCB2ZXJ0ZXhfZGF0YSwgb3B0aW9ucylcbntcbiAgICBvcHRpb25zID0gb3B0aW9ucyB8fCB7fTtcblxuICAgIHZhciB2ZXJ0ZXhfY29uc3RhbnRzID0gW107XG4gICAgaWYgKHogIT0gbnVsbCkge1xuICAgICAgICB2ZXJ0ZXhfY29uc3RhbnRzLnB1c2goeik7IC8vIHByb3ZpZGVkIHpcbiAgICB9XG4gICAgaWYgKG9wdGlvbnMubm9ybWFscykge1xuICAgICAgICB2ZXJ0ZXhfY29uc3RhbnRzLnB1c2goMCwgMCwgMSk7IC8vIHVwd2FyZHMtZmFjaW5nIG5vcm1hbFxuICAgIH1cbiAgICBpZiAob3B0aW9ucy52ZXJ0ZXhfY29uc3RhbnRzKSB7XG4gICAgICAgIHZlcnRleF9jb25zdGFudHMucHVzaC5hcHBseSh2ZXJ0ZXhfY29uc3RhbnRzLCBvcHRpb25zLnZlcnRleF9jb25zdGFudHMpO1xuICAgIH1cbiAgICBpZiAodmVydGV4X2NvbnN0YW50cy5sZW5ndGggPT0gMCkge1xuICAgICAgICB2ZXJ0ZXhfY29uc3RhbnRzID0gbnVsbDtcbiAgICB9XG5cbiAgICB2YXIgbnVtX3BvbHlnb25zID0gcG9seWdvbnMubGVuZ3RoO1xuICAgIGZvciAodmFyIHA9MDsgcCA8IG51bV9wb2x5Z29uczsgcCsrKSB7XG4gICAgICAgIHZhciB2ZXJ0aWNlcyA9IEdMLnRyaWFuZ3VsYXRlUG9seWdvbihwb2x5Z29uc1twXSk7XG4gICAgICAgIEdMLmFkZFZlcnRpY2VzKHZlcnRpY2VzLCB2ZXJ0ZXhfY29uc3RhbnRzLCB2ZXJ0ZXhfZGF0YSk7XG4gICAgfVxuXG4gICAgcmV0dXJuIHZlcnRleF9kYXRhO1xufTtcblxuLy8gQ2FsbGJhY2stYmFzZSBidWlsZGVyIChmb3IgZnV0dXJlIGV4cGxvcmF0aW9uKVxuLy8gVGVzc2VsYXRlIGEgZmxhdCAyRCBwb2x5Z29uIHdpdGggZml4ZWQgaGVpZ2h0IGFuZCBhZGQgdG8gR0wgdmVydGV4IGJ1ZmZlclxuLy8gR0xCdWlsZGVycy5idWlsZFBvbHlnb25zMiA9IGZ1bmN0aW9uIEdMQnVpbGRlcnNCdWlsZFBvbHlnb24yIChwb2x5Z29ucywgeiwgYWRkR2VvbWV0cnksIG9wdGlvbnMpXG4vLyB7XG4vLyAgICAgb3B0aW9ucyA9IG9wdGlvbnMgfHwge307XG5cbi8vICAgICB2YXIgbnVtX3BvbHlnb25zID0gcG9seWdvbnMubGVuZ3RoO1xuLy8gICAgIGZvciAodmFyIHA9MDsgcCA8IG51bV9wb2x5Z29uczsgcCsrKSB7XG4vLyAgICAgICAgIHZhciB2ZXJ0aWNlcyA9IHtcbi8vICAgICAgICAgICAgIHBvc2l0aW9uczogR0wudHJpYW5ndWxhdGVQb2x5Z29uKHBvbHlnb25zW3BdLCB6KSxcbi8vICAgICAgICAgICAgIG5vcm1hbHM6IChvcHRpb25zLm5vcm1hbHMgPyBbMCwgMCwgMV0gOiBudWxsKVxuLy8gICAgICAgICB9O1xuXG4vLyAgICAgICAgIGFkZEdlb21ldHJ5KHZlcnRpY2VzKTtcbi8vICAgICB9XG4vLyB9O1xuXG4vLyBUZXNzZWxhdGUgYW5kIGV4dHJ1ZGUgYSBmbGF0IDJEIHBvbHlnb24gaW50byBhIHNpbXBsZSAzRCBtb2RlbCB3aXRoIGZpeGVkIGhlaWdodCBhbmQgYWRkIHRvIEdMIHZlcnRleCBidWZmZXJcbkdMQnVpbGRlcnMuYnVpbGRFeHRydWRlZFBvbHlnb25zID0gZnVuY3Rpb24gR0xCdWlsZGVyc0J1aWxkRXh0cnVkZWRQb2x5Z29uIChwb2x5Z29ucywgeiwgaGVpZ2h0LCBtaW5faGVpZ2h0LCB2ZXJ0ZXhfZGF0YSwgb3B0aW9ucylcbntcbiAgICBvcHRpb25zID0gb3B0aW9ucyB8fCB7fTtcbiAgICB2YXIgbWluX3ogPSB6ICsgKG1pbl9oZWlnaHQgfHwgMCk7XG4gICAgdmFyIG1heF96ID0geiArIGhlaWdodDtcblxuICAgIC8vIFRvcFxuICAgIEdMQnVpbGRlcnMuYnVpbGRQb2x5Z29ucyhwb2x5Z29ucywgbWF4X3osIHZlcnRleF9kYXRhLCB7IG5vcm1hbHM6IHRydWUsIHZlcnRleF9jb25zdGFudHM6IG9wdGlvbnMudmVydGV4X2NvbnN0YW50cyB9KTtcbiAgICAvLyB2YXIgdG9wX3ZlcnRleF9jb25zdGFudHMgPSBbMCwgMCwgMV07XG4gICAgLy8gaWYgKG9wdGlvbnMudmVydGV4X2NvbnN0YW50cyAhPSBudWxsKSB7XG4gICAgLy8gICAgIHRvcF92ZXJ0ZXhfY29uc3RhbnRzLnB1c2guYXBwbHkodG9wX3ZlcnRleF9jb25zdGFudHMsIG9wdGlvbnMudmVydGV4X2NvbnN0YW50cyk7XG4gICAgLy8gfVxuICAgIC8vIEdMQnVpbGRlcnMuYnVpbGRQb2x5Z29uczIoXG4gICAgLy8gICAgIHBvbHlnb25zLFxuICAgIC8vICAgICBtYXhfeixcbiAgICAvLyAgICAgZnVuY3Rpb24gKHZlcnRpY2VzKSB7XG4gICAgLy8gICAgICAgICBHTC5hZGRWZXJ0aWNlcyh2ZXJ0aWNlcy5wb3NpdGlvbnMsIHRvcF92ZXJ0ZXhfY29uc3RhbnRzLCB2ZXJ0ZXhfZGF0YSk7XG4gICAgLy8gICAgIH1cbiAgICAvLyApO1xuXG4gICAgLy8gV2FsbHNcbiAgICB2YXIgd2FsbF92ZXJ0ZXhfY29uc3RhbnRzID0gW251bGwsIG51bGwsIG51bGxdOyAvLyBub3JtYWxzIHdpbGwgYmUgY2FsY3VsYXRlZCBiZWxvd1xuICAgIGlmIChvcHRpb25zLnZlcnRleF9jb25zdGFudHMpIHtcbiAgICAgICAgd2FsbF92ZXJ0ZXhfY29uc3RhbnRzLnB1c2guYXBwbHkod2FsbF92ZXJ0ZXhfY29uc3RhbnRzLCBvcHRpb25zLnZlcnRleF9jb25zdGFudHMpO1xuICAgIH1cblxuICAgIHZhciBudW1fcG9seWdvbnMgPSBwb2x5Z29ucy5sZW5ndGg7XG4gICAgZm9yICh2YXIgcD0wOyBwIDwgbnVtX3BvbHlnb25zOyBwKyspIHtcbiAgICAgICAgdmFyIHBvbHlnb24gPSBwb2x5Z29uc1twXTtcblxuICAgICAgICBmb3IgKHZhciBxPTA7IHEgPCBwb2x5Z29uLmxlbmd0aDsgcSsrKSB7XG4gICAgICAgICAgICB2YXIgY29udG91ciA9IHBvbHlnb25bcV07XG5cbiAgICAgICAgICAgIGZvciAodmFyIHc9MDsgdyA8IGNvbnRvdXIubGVuZ3RoIC0gMTsgdysrKSB7XG4gICAgICAgICAgICAgICAgdmFyIHdhbGxfdmVydGljZXMgPSBbXTtcblxuICAgICAgICAgICAgICAgIC8vIFR3byB0cmlhbmdsZXMgZm9yIHRoZSBxdWFkIGZvcm1lZCBieSBlYWNoIHZlcnRleCBwYWlyLCBnb2luZyBmcm9tIGJvdHRvbSB0byB0b3AgaGVpZ2h0XG4gICAgICAgICAgICAgICAgd2FsbF92ZXJ0aWNlcy5wdXNoKFxuICAgICAgICAgICAgICAgICAgICAvLyBUcmlhbmdsZVxuICAgICAgICAgICAgICAgICAgICBbY29udG91clt3KzFdWzBdLCBjb250b3VyW3crMV1bMV0sIG1heF96XSxcbiAgICAgICAgICAgICAgICAgICAgW2NvbnRvdXJbdysxXVswXSwgY29udG91clt3KzFdWzFdLCBtaW5fel0sXG4gICAgICAgICAgICAgICAgICAgIFtjb250b3VyW3ddWzBdLCBjb250b3VyW3ddWzFdLCBtaW5fel0sXG4gICAgICAgICAgICAgICAgICAgIC8vIFRyaWFuZ2xlXG4gICAgICAgICAgICAgICAgICAgIFtjb250b3VyW3ddWzBdLCBjb250b3VyW3ddWzFdLCBtaW5fel0sXG4gICAgICAgICAgICAgICAgICAgIFtjb250b3VyW3ddWzBdLCBjb250b3VyW3ddWzFdLCBtYXhfel0sXG4gICAgICAgICAgICAgICAgICAgIFtjb250b3VyW3crMV1bMF0sIGNvbnRvdXJbdysxXVsxXSwgbWF4X3pdXG4gICAgICAgICAgICAgICAgKTtcblxuICAgICAgICAgICAgICAgIC8vIENhbGMgdGhlIG5vcm1hbCBvZiB0aGUgd2FsbCBmcm9tIHVwIHZlY3RvciBhbmQgb25lIHNlZ21lbnQgb2YgdGhlIHdhbGwgdHJpYW5nbGVzXG4gICAgICAgICAgICAgICAgdmFyIG5vcm1hbCA9IFZlY3Rvci5jcm9zcyhcbiAgICAgICAgICAgICAgICAgICAgWzAsIDAsIDFdLFxuICAgICAgICAgICAgICAgICAgICBWZWN0b3Iubm9ybWFsaXplKFtjb250b3VyW3crMV1bMF0gLSBjb250b3VyW3ddWzBdLCBjb250b3VyW3crMV1bMV0gLSBjb250b3VyW3ddWzFdLCAwXSlcbiAgICAgICAgICAgICAgICApO1xuXG4gICAgICAgICAgICAgICAgd2FsbF92ZXJ0ZXhfY29uc3RhbnRzWzBdID0gbm9ybWFsWzBdO1xuICAgICAgICAgICAgICAgIHdhbGxfdmVydGV4X2NvbnN0YW50c1sxXSA9IG5vcm1hbFsxXTtcbiAgICAgICAgICAgICAgICB3YWxsX3ZlcnRleF9jb25zdGFudHNbMl0gPSBub3JtYWxbMl07XG5cbiAgICAgICAgICAgICAgICBHTC5hZGRWZXJ0aWNlcyh3YWxsX3ZlcnRpY2VzLCB3YWxsX3ZlcnRleF9jb25zdGFudHMsIHZlcnRleF9kYXRhKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgfVxuICAgIH1cblxuICAgIHJldHVybiB2ZXJ0ZXhfZGF0YTtcbn07XG5cbi8vIEJ1aWxkIHRlc3NlbGxhdGVkIHRyaWFuZ2xlcyBmb3IgYSBwb2x5bGluZVxuLy8gQmFzaWNhbGx5IGZvbGxvd2luZyB0aGUgbWV0aG9kIGRlc2NyaWJlZCBoZXJlIGZvciBtaXRlciBqb2ludHM6XG4vLyBodHRwOi8vYXJ0Z3JhbW1lci5ibG9nc3BvdC5jby51ay8yMDExLzA3L2RyYXdpbmctcG9seWxpbmVzLWJ5LXRlc3NlbGxhdGlvbi5odG1sXG5HTEJ1aWxkZXJzLmJ1aWxkUG9seWxpbmVzID0gZnVuY3Rpb24gR0xCdWlsZGVyc0J1aWxkUG9seWxpbmVzIChsaW5lcywgeiwgd2lkdGgsIHZlcnRleF9kYXRhLCBvcHRpb25zKVxue1xuICAgIG9wdGlvbnMgPSBvcHRpb25zIHx8IHt9O1xuICAgIG9wdGlvbnMuY2xvc2VkX3BvbHlnb24gPSBvcHRpb25zLmNsb3NlZF9wb2x5Z29uIHx8IGZhbHNlO1xuICAgIG9wdGlvbnMucmVtb3ZlX3RpbGVfZWRnZXMgPSBvcHRpb25zLnJlbW92ZV90aWxlX2VkZ2VzIHx8IGZhbHNlO1xuXG4gICAgdmFyIHZlcnRleF9jb25zdGFudHMgPSBbeiwgMCwgMCwgMV07IC8vIHByb3ZpZGVkIHosIGFuZCB1cHdhcmRzLWZhY2luZyBub3JtYWxcbiAgICBpZiAob3B0aW9ucy52ZXJ0ZXhfY29uc3RhbnRzKSB7XG4gICAgICAgIHZlcnRleF9jb25zdGFudHMucHVzaC5hcHBseSh2ZXJ0ZXhfY29uc3RhbnRzLCBvcHRpb25zLnZlcnRleF9jb25zdGFudHMpO1xuICAgIH1cblxuICAgIC8vIExpbmUgY2VudGVyIC0gZGVidWdnaW5nXG4gICAgaWYgKEdMQnVpbGRlcnMuZGVidWcgJiYgb3B0aW9ucy52ZXJ0ZXhfbGluZXMpIHtcbiAgICAgICAgdmFyIG51bV9saW5lcyA9IGxpbmVzLmxlbmd0aDtcbiAgICAgICAgZm9yICh2YXIgbG49MDsgbG4gPCBudW1fbGluZXM7IGxuKyspIHtcbiAgICAgICAgICAgIHZhciBsaW5lID0gbGluZXNbbG5dO1xuXG4gICAgICAgICAgICBmb3IgKHZhciBwPTA7IHAgPCBsaW5lLmxlbmd0aCAtIDE7IHArKykge1xuICAgICAgICAgICAgICAgIC8vIFBvaW50IEEgdG8gQlxuICAgICAgICAgICAgICAgIHZhciBwYSA9IGxpbmVbcF07XG4gICAgICAgICAgICAgICAgdmFyIHBiID0gbGluZVtwKzFdO1xuXG4gICAgICAgICAgICAgICAgb3B0aW9ucy52ZXJ0ZXhfbGluZXMucHVzaChcbiAgICAgICAgICAgICAgICAgICAgcGFbMF0sIHBhWzFdLCB6ICsgMC4wMDEsIDAsIDAsIDEsIDEuMCwgMCwgMCxcbiAgICAgICAgICAgICAgICAgICAgcGJbMF0sIHBiWzFdLCB6ICsgMC4wMDEsIDAsIDAsIDEsIDEuMCwgMCwgMFxuICAgICAgICAgICAgICAgICk7XG4gICAgICAgICAgICB9XG4gICAgICAgIH07XG4gICAgfVxuXG4gICAgLy8gQnVpbGQgdHJpYW5nbGVzXG4gICAgdmFyIHZlcnRpY2VzID0gW107XG4gICAgdmFyIG51bV9saW5lcyA9IGxpbmVzLmxlbmd0aDtcbiAgICBmb3IgKHZhciBsbj0wOyBsbiA8IG51bV9saW5lczsgbG4rKykge1xuICAgICAgICB2YXIgbGluZSA9IGxpbmVzW2xuXTtcbiAgICAgICAgLy8gTXVsdGlwbGUgbGluZSBzZWdtZW50c1xuICAgICAgICBpZiAobGluZS5sZW5ndGggPiAyKSB7XG4gICAgICAgICAgICAvLyBCdWlsZCBhbmNob3JzIGZvciBsaW5lIHNlZ21lbnRzOlxuICAgICAgICAgICAgLy8gYW5jaG9ycyBhcmUgMyBwb2ludHMsIGVhY2ggY29ubmVjdGluZyAyIGxpbmUgc2VnbWVudHMgdGhhdCBzaGFyZSBhIGpvaW50IChzdGFydCBwb2ludCwgam9pbnQgcG9pbnQsIGVuZCBwb2ludClcblxuICAgICAgICAgICAgdmFyIGFuY2hvcnMgPSBbXTtcblxuICAgICAgICAgICAgaWYgKGxpbmUubGVuZ3RoID4gMykge1xuICAgICAgICAgICAgICAgIC8vIEZpbmQgbWlkcG9pbnRzIG9mIGVhY2ggbGluZSBzZWdtZW50XG4gICAgICAgICAgICAgICAgLy8gRm9yIGNsb3NlZCBwb2x5Z29ucywgY2FsY3VsYXRlIGFsbCBtaWRwb2ludHMgc2luY2Ugc2VnbWVudHMgd2lsbCB3cmFwIGFyb3VuZCB0byBmaXJzdCBtaWRwb2ludFxuICAgICAgICAgICAgICAgIHZhciBtaWQgPSBbXTtcbiAgICAgICAgICAgICAgICB2YXIgcCwgcG1heDtcbiAgICAgICAgICAgICAgICBpZiAob3B0aW9ucy5jbG9zZWRfcG9seWdvbiA9PSB0cnVlKSB7XG4gICAgICAgICAgICAgICAgICAgIHAgPSAwOyAvLyBzdGFydCBvbiBmaXJzdCBwb2ludFxuICAgICAgICAgICAgICAgICAgICBwbWF4ID0gbGluZS5sZW5ndGggLSAxO1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICAvLyBGb3Igb3BlbiBwb2x5Z29ucywgc2tpcCBmaXJzdCBtaWRwb2ludCBhbmQgdXNlIGxpbmUgc3RhcnQgaW5zdGVhZFxuICAgICAgICAgICAgICAgIGVsc2Uge1xuICAgICAgICAgICAgICAgICAgICBwID0gMTsgLy8gc3RhcnQgb24gc2Vjb25kIHBvaW50XG4gICAgICAgICAgICAgICAgICAgIHBtYXggPSBsaW5lLmxlbmd0aCAtIDI7XG4gICAgICAgICAgICAgICAgICAgIG1pZC5wdXNoKGxpbmVbMF0pOyAvLyB1c2UgbGluZSBzdGFydCBpbnN0ZWFkIG9mIGZpcnN0IG1pZHBvaW50XG4gICAgICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICAgICAgLy8gQ2FsYyBtaWRwb2ludHNcbiAgICAgICAgICAgICAgICBmb3IgKDsgcCA8IHBtYXg7IHArKykge1xuICAgICAgICAgICAgICAgICAgICB2YXIgcGEgPSBsaW5lW3BdO1xuICAgICAgICAgICAgICAgICAgICB2YXIgcGIgPSBsaW5lW3ArMV07XG4gICAgICAgICAgICAgICAgICAgIG1pZC5wdXNoKFsocGFbMF0gKyBwYlswXSkgLyAyLCAocGFbMV0gKyBwYlsxXSkgLyAyXSk7XG4gICAgICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICAgICAgLy8gU2FtZSBjbG9zZWQvb3BlbiBwb2x5Z29uIGxvZ2ljIGFzIGFib3ZlOiBrZWVwIGxhc3QgbWlkcG9pbnQgZm9yIGNsb3NlZCwgc2tpcCBmb3Igb3BlblxuICAgICAgICAgICAgICAgIHZhciBtbWF4O1xuICAgICAgICAgICAgICAgIGlmIChvcHRpb25zLmNsb3NlZF9wb2x5Z29uID09IHRydWUpIHtcbiAgICAgICAgICAgICAgICAgICAgbW1heCA9IG1pZC5sZW5ndGg7XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgIGVsc2Uge1xuICAgICAgICAgICAgICAgICAgICBtaWQucHVzaChsaW5lW2xpbmUubGVuZ3RoLTFdKTsgLy8gdXNlIGxpbmUgZW5kIGluc3RlYWQgb2YgbGFzdCBtaWRwb2ludFxuICAgICAgICAgICAgICAgICAgICBtbWF4ID0gbWlkLmxlbmd0aCAtIDE7XG4gICAgICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICAgICAgLy8gTWFrZSBhbmNob3JzIGJ5IGNvbm5lY3RpbmcgbWlkcG9pbnRzIHRvIGxpbmUgam9pbnRzXG4gICAgICAgICAgICAgICAgZm9yIChwPTA7IHAgPCBtbWF4OyBwKyspICB7XG4gICAgICAgICAgICAgICAgICAgIGFuY2hvcnMucHVzaChbbWlkW3BdLCBsaW5lWyhwKzEpICUgbGluZS5sZW5ndGhdLCBtaWRbKHArMSkgJSBtaWQubGVuZ3RoXV0pO1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIGVsc2Uge1xuICAgICAgICAgICAgICAgIC8vIERlZ2VuZXJhdGUgY2FzZSwgYSAzLXBvaW50IGxpbmUgaXMganVzdCBhIHNpbmdsZSBhbmNob3JcbiAgICAgICAgICAgICAgICBhbmNob3JzID0gW1tsaW5lWzBdLCBsaW5lWzFdLCBsaW5lWzJdXV07XG4gICAgICAgICAgICB9XG5cbiAgICAgICAgICAgIGZvciAodmFyIHA9MDsgcCA8IGFuY2hvcnMubGVuZ3RoOyBwKyspIHtcbiAgICAgICAgICAgICAgICBpZiAoIW9wdGlvbnMucmVtb3ZlX3RpbGVfZWRnZXMpIHtcbiAgICAgICAgICAgICAgICAgICAgYnVpbGRBbmNob3IoYW5jaG9yc1twXVswXSwgYW5jaG9yc1twXVsxXSwgYW5jaG9yc1twXVsyXSk7XG4gICAgICAgICAgICAgICAgICAgIC8vIGJ1aWxkU2VnbWVudChhbmNob3JzW3BdWzBdLCBhbmNob3JzW3BdWzFdKTsgLy8gdXNlIHRoZXNlIHRvIGRyYXcgZXh0cnVkZWQgc2VnbWVudHMgdy9vIGpvaW4sIGZvciBkZWJ1Z2dpbmdcbiAgICAgICAgICAgICAgICAgICAgLy8gYnVpbGRTZWdtZW50KGFuY2hvcnNbcF1bMV0sIGFuY2hvcnNbcF1bMl0pO1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICBlbHNlIHtcbiAgICAgICAgICAgICAgICAgICAgdmFyIGVkZ2UxID0gR0xCdWlsZGVycy5pc09uVGlsZUVkZ2UoYW5jaG9yc1twXVswXSwgYW5jaG9yc1twXVsxXSk7XG4gICAgICAgICAgICAgICAgICAgIHZhciBlZGdlMiA9IEdMQnVpbGRlcnMuaXNPblRpbGVFZGdlKGFuY2hvcnNbcF1bMV0sIGFuY2hvcnNbcF1bMl0pO1xuICAgICAgICAgICAgICAgICAgICBpZiAoIWVkZ2UxICYmICFlZGdlMikge1xuICAgICAgICAgICAgICAgICAgICAgICAgYnVpbGRBbmNob3IoYW5jaG9yc1twXVswXSwgYW5jaG9yc1twXVsxXSwgYW5jaG9yc1twXVsyXSk7XG4gICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICAgICAgZWxzZSBpZiAoIWVkZ2UxKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICBidWlsZFNlZ21lbnQoYW5jaG9yc1twXVswXSwgYW5jaG9yc1twXVsxXSk7XG4gICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICAgICAgZWxzZSBpZiAoIWVkZ2UyKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICBidWlsZFNlZ21lbnQoYW5jaG9yc1twXVsxXSwgYW5jaG9yc1twXVsyXSk7XG4gICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICB9XG4gICAgICAgIH1cbiAgICAgICAgLy8gU2luZ2xlIDItcG9pbnQgc2VnbWVudFxuICAgICAgICBlbHNlIGlmIChsaW5lLmxlbmd0aCA9PSAyKSB7XG4gICAgICAgICAgICBidWlsZFNlZ21lbnQobGluZVswXSwgbGluZVsxXSk7IC8vIFRPRE86IHJlcGxhY2UgYnVpbGRTZWdtZW50IHdpdGggYSBkZWdlbmVyYXRlIGZvcm0gb2YgYnVpbGRBbmNob3I/IGJ1aWxkU2VnbWVudCBpcyBzdGlsbCB1c2VmdWwgZm9yIGRlYnVnZ2luZ1xuICAgICAgICB9XG4gICAgfTtcblxuICAgIEdMLmFkZFZlcnRpY2VzKHZlcnRpY2VzLCB2ZXJ0ZXhfY29uc3RhbnRzLCB2ZXJ0ZXhfZGF0YSk7XG5cbiAgICAvLyBCdWlsZCB0cmlhbmdsZXMgZm9yIGEgc2luZ2xlIGxpbmUgc2VnbWVudCwgZXh0cnVkZWQgYnkgdGhlIHByb3ZpZGVkIHdpZHRoXG4gICAgZnVuY3Rpb24gYnVpbGRTZWdtZW50IChwYSwgcGIpIHtcbiAgICAgICAgdmFyIHNsb3BlID0gVmVjdG9yLm5vcm1hbGl6ZShbKHBiWzFdIC0gcGFbMV0pICogLTEsIHBiWzBdIC0gcGFbMF1dKTtcblxuICAgICAgICB2YXIgcGFfb3V0ZXIgPSBbcGFbMF0gKyBzbG9wZVswXSAqIHdpZHRoLzIsIHBhWzFdICsgc2xvcGVbMV0gKiB3aWR0aC8yXTtcbiAgICAgICAgdmFyIHBhX2lubmVyID0gW3BhWzBdIC0gc2xvcGVbMF0gKiB3aWR0aC8yLCBwYVsxXSAtIHNsb3BlWzFdICogd2lkdGgvMl07XG5cbiAgICAgICAgdmFyIHBiX291dGVyID0gW3BiWzBdICsgc2xvcGVbMF0gKiB3aWR0aC8yLCBwYlsxXSArIHNsb3BlWzFdICogd2lkdGgvMl07XG4gICAgICAgIHZhciBwYl9pbm5lciA9IFtwYlswXSAtIHNsb3BlWzBdICogd2lkdGgvMiwgcGJbMV0gLSBzbG9wZVsxXSAqIHdpZHRoLzJdO1xuXG4gICAgICAgIHZlcnRpY2VzLnB1c2goXG4gICAgICAgICAgICBwYl9pbm5lciwgcGJfb3V0ZXIsIHBhX2lubmVyLFxuICAgICAgICAgICAgcGFfaW5uZXIsIHBiX291dGVyLCBwYV9vdXRlclxuICAgICAgICApO1xuICAgIH1cblxuICAgIC8vIEJ1aWxkIHRyaWFuZ2xlcyBmb3IgYSAzLXBvaW50ICdhbmNob3InIHNoYXBlLCBjb25zaXN0aW5nIG9mIHR3byBsaW5lIHNlZ21lbnRzIHdpdGggYSBqb2ludFxuICAgIC8vIFRPRE86IG1vdmUgdGhlc2UgZnVuY3Rpb25zIG91dCBvZiBjbG9zdXJlcz9cbiAgICBmdW5jdGlvbiBidWlsZEFuY2hvciAocGEsIGpvaW50LCBwYikge1xuICAgICAgICAvLyBJbm5lciBhbmQgb3V0ZXIgbGluZSBzZWdtZW50cyBmb3IgW3BhLCBqb2ludF0gYW5kIFtqb2ludCwgcGJdXG4gICAgICAgIHZhciBwYV9zbG9wZSA9IFZlY3Rvci5ub3JtYWxpemUoWyhqb2ludFsxXSAtIHBhWzFdKSAqIC0xLCBqb2ludFswXSAtIHBhWzBdXSk7XG4gICAgICAgIHZhciBwYV9vdXRlciA9IFtcbiAgICAgICAgICAgIFtwYVswXSArIHBhX3Nsb3BlWzBdICogd2lkdGgvMiwgcGFbMV0gKyBwYV9zbG9wZVsxXSAqIHdpZHRoLzJdLFxuICAgICAgICAgICAgW2pvaW50WzBdICsgcGFfc2xvcGVbMF0gKiB3aWR0aC8yLCBqb2ludFsxXSArIHBhX3Nsb3BlWzFdICogd2lkdGgvMl1cbiAgICAgICAgXTtcbiAgICAgICAgdmFyIHBhX2lubmVyID0gW1xuICAgICAgICAgICAgW3BhWzBdIC0gcGFfc2xvcGVbMF0gKiB3aWR0aC8yLCBwYVsxXSAtIHBhX3Nsb3BlWzFdICogd2lkdGgvMl0sXG4gICAgICAgICAgICBbam9pbnRbMF0gLSBwYV9zbG9wZVswXSAqIHdpZHRoLzIsIGpvaW50WzFdIC0gcGFfc2xvcGVbMV0gKiB3aWR0aC8yXVxuICAgICAgICBdO1xuXG4gICAgICAgIHZhciBwYl9zbG9wZSA9IFZlY3Rvci5ub3JtYWxpemUoWyhwYlsxXSAtIGpvaW50WzFdKSAqIC0xLCBwYlswXSAtIGpvaW50WzBdXSk7XG4gICAgICAgIHZhciBwYl9vdXRlciA9IFtcbiAgICAgICAgICAgIFtqb2ludFswXSArIHBiX3Nsb3BlWzBdICogd2lkdGgvMiwgam9pbnRbMV0gKyBwYl9zbG9wZVsxXSAqIHdpZHRoLzJdLFxuICAgICAgICAgICAgW3BiWzBdICsgcGJfc2xvcGVbMF0gKiB3aWR0aC8yLCBwYlsxXSArIHBiX3Nsb3BlWzFdICogd2lkdGgvMl1cbiAgICAgICAgXTtcbiAgICAgICAgdmFyIHBiX2lubmVyID0gW1xuICAgICAgICAgICAgW2pvaW50WzBdIC0gcGJfc2xvcGVbMF0gKiB3aWR0aC8yLCBqb2ludFsxXSAtIHBiX3Nsb3BlWzFdICogd2lkdGgvMl0sXG4gICAgICAgICAgICBbcGJbMF0gLSBwYl9zbG9wZVswXSAqIHdpZHRoLzIsIHBiWzFdIC0gcGJfc2xvcGVbMV0gKiB3aWR0aC8yXVxuICAgICAgICBdO1xuXG4gICAgICAgIC8vIE1pdGVyIGpvaW4gLSBzb2x2ZSBmb3IgdGhlIGludGVyc2VjdGlvbiBiZXR3ZWVuIHRoZSB0d28gb3V0ZXIgbGluZSBzZWdtZW50c1xuICAgICAgICB2YXIgaW50ZXJzZWN0aW9uID0gVmVjdG9yLmxpbmVJbnRlcnNlY3Rpb24ocGFfb3V0ZXJbMF0sIHBhX291dGVyWzFdLCBwYl9vdXRlclswXSwgcGJfb3V0ZXJbMV0pO1xuICAgICAgICB2YXIgbGluZV9kZWJ1ZyA9IG51bGw7XG4gICAgICAgIGlmIChpbnRlcnNlY3Rpb24gIT0gbnVsbCkge1xuICAgICAgICAgICAgdmFyIGludGVyc2VjdF9vdXRlciA9IGludGVyc2VjdGlvbjtcblxuICAgICAgICAgICAgLy8gQ2FwIHRoZSBpbnRlcnNlY3Rpb24gcG9pbnQgdG8gYSByZWFzb25hYmxlIGRpc3RhbmNlIChhcyBqb2luIGFuZ2xlIGJlY29tZXMgc2hhcnBlciwgbWl0ZXIgam9pbnQgZGlzdGFuY2Ugd291bGQgYXBwcm9hY2ggaW5maW5pdHkpXG4gICAgICAgICAgICB2YXIgbGVuX3NxID0gVmVjdG9yLmxlbmd0aFNxKFtpbnRlcnNlY3Rfb3V0ZXJbMF0gLSBqb2ludFswXSwgaW50ZXJzZWN0X291dGVyWzFdIC0gam9pbnRbMV1dKTtcbiAgICAgICAgICAgIHZhciBtaXRlcl9sZW5fbWF4ID0gMzsgLy8gbXVsdGlwbGllciBvbiBsaW5lIHdpZHRoIGZvciBtYXggZGlzdGFuY2UgbWl0ZXIgam9pbiBjYW4gYmUgZnJvbSBqb2ludFxuICAgICAgICAgICAgaWYgKGxlbl9zcSA+ICh3aWR0aCAqIHdpZHRoICogbWl0ZXJfbGVuX21heCAqIG1pdGVyX2xlbl9tYXgpKSB7XG4gICAgICAgICAgICAgICAgbGluZV9kZWJ1ZyA9ICdkaXN0YW5jZSc7XG4gICAgICAgICAgICAgICAgaW50ZXJzZWN0X291dGVyID0gVmVjdG9yLm5vcm1hbGl6ZShbaW50ZXJzZWN0X291dGVyWzBdIC0gam9pbnRbMF0sIGludGVyc2VjdF9vdXRlclsxXSAtIGpvaW50WzFdXSk7XG4gICAgICAgICAgICAgICAgaW50ZXJzZWN0X291dGVyID0gW1xuICAgICAgICAgICAgICAgICAgICBqb2ludFswXSArIGludGVyc2VjdF9vdXRlclswXSAqIG1pdGVyX2xlbl9tYXgsXG4gICAgICAgICAgICAgICAgICAgIGpvaW50WzFdICsgaW50ZXJzZWN0X291dGVyWzFdICogbWl0ZXJfbGVuX21heFxuICAgICAgICAgICAgICAgIF1cbiAgICAgICAgICAgIH1cblxuICAgICAgICAgICAgdmFyIGludGVyc2VjdF9pbm5lciA9IFtcbiAgICAgICAgICAgICAgICAoam9pbnRbMF0gLSBpbnRlcnNlY3Rfb3V0ZXJbMF0pICsgam9pbnRbMF0sXG4gICAgICAgICAgICAgICAgKGpvaW50WzFdIC0gaW50ZXJzZWN0X291dGVyWzFdKSArIGpvaW50WzFdXG4gICAgICAgICAgICBdO1xuXG4gICAgICAgICAgICB2ZXJ0aWNlcy5wdXNoKFxuICAgICAgICAgICAgICAgIGludGVyc2VjdF9pbm5lciwgaW50ZXJzZWN0X291dGVyLCBwYV9pbm5lclswXSxcbiAgICAgICAgICAgICAgICBwYV9pbm5lclswXSwgaW50ZXJzZWN0X291dGVyLCBwYV9vdXRlclswXSxcblxuICAgICAgICAgICAgICAgIHBiX2lubmVyWzFdLCBwYl9vdXRlclsxXSwgaW50ZXJzZWN0X2lubmVyLFxuICAgICAgICAgICAgICAgIGludGVyc2VjdF9pbm5lciwgcGJfb3V0ZXJbMV0sIGludGVyc2VjdF9vdXRlclxuICAgICAgICAgICAgKTtcbiAgICAgICAgfVxuICAgICAgICBlbHNlIHtcbiAgICAgICAgICAgIC8vIExpbmUgc2VnbWVudHMgYXJlIHBhcmFsbGVsLCB1c2UgdGhlIGZpcnN0IG91dGVyIGxpbmUgc2VnbWVudCBhcyBqb2luIGluc3RlYWRcbiAgICAgICAgICAgIGxpbmVfZGVidWcgPSAncGFyYWxsZWwnO1xuICAgICAgICAgICAgcGFfaW5uZXJbMV0gPSBwYl9pbm5lclswXTtcbiAgICAgICAgICAgIHBhX291dGVyWzFdID0gcGJfb3V0ZXJbMF07XG5cbiAgICAgICAgICAgIHZlcnRpY2VzLnB1c2goXG4gICAgICAgICAgICAgICAgcGFfaW5uZXJbMV0sIHBhX291dGVyWzFdLCBwYV9pbm5lclswXSxcbiAgICAgICAgICAgICAgICBwYV9pbm5lclswXSwgcGFfb3V0ZXJbMV0sIHBhX291dGVyWzBdLFxuXG4gICAgICAgICAgICAgICAgcGJfaW5uZXJbMV0sIHBiX291dGVyWzFdLCBwYl9pbm5lclswXSxcbiAgICAgICAgICAgICAgICBwYl9pbm5lclswXSwgcGJfb3V0ZXJbMV0sIHBiX291dGVyWzBdXG4gICAgICAgICAgICApO1xuICAgICAgICB9XG5cbiAgICAgICAgLy8gRXh0cnVkZWQgaW5uZXIvb3V0ZXIgZWRnZXMgLSBkZWJ1Z2dpbmdcbiAgICAgICAgaWYgKEdMQnVpbGRlcnMuZGVidWcgJiYgb3B0aW9ucy52ZXJ0ZXhfbGluZXMpIHtcbiAgICAgICAgICAgIG9wdGlvbnMudmVydGV4X2xpbmVzLnB1c2goXG4gICAgICAgICAgICAgICAgcGFfaW5uZXJbMF1bMF0sIHBhX2lubmVyWzBdWzFdLCB6ICsgMC4wMDEsIDAsIDAsIDEsIDAsIDEuMCwgMCxcbiAgICAgICAgICAgICAgICBwYV9pbm5lclsxXVswXSwgcGFfaW5uZXJbMV1bMV0sIHogKyAwLjAwMSwgMCwgMCwgMSwgMCwgMS4wLCAwLFxuXG4gICAgICAgICAgICAgICAgcGJfaW5uZXJbMF1bMF0sIHBiX2lubmVyWzBdWzFdLCB6ICsgMC4wMDEsIDAsIDAsIDEsIDAsIDEuMCwgMCxcbiAgICAgICAgICAgICAgICBwYl9pbm5lclsxXVswXSwgcGJfaW5uZXJbMV1bMV0sIHogKyAwLjAwMSwgMCwgMCwgMSwgMCwgMS4wLCAwLFxuXG4gICAgICAgICAgICAgICAgcGFfb3V0ZXJbMF1bMF0sIHBhX291dGVyWzBdWzFdLCB6ICsgMC4wMDEsIDAsIDAsIDEsIDAsIDEuMCwgMCxcbiAgICAgICAgICAgICAgICBwYV9vdXRlclsxXVswXSwgcGFfb3V0ZXJbMV1bMV0sIHogKyAwLjAwMSwgMCwgMCwgMSwgMCwgMS4wLCAwLFxuXG4gICAgICAgICAgICAgICAgcGJfb3V0ZXJbMF1bMF0sIHBiX291dGVyWzBdWzFdLCB6ICsgMC4wMDEsIDAsIDAsIDEsIDAsIDEuMCwgMCxcbiAgICAgICAgICAgICAgICBwYl9vdXRlclsxXVswXSwgcGJfb3V0ZXJbMV1bMV0sIHogKyAwLjAwMSwgMCwgMCwgMSwgMCwgMS4wLCAwLFxuXG4gICAgICAgICAgICAgICAgcGFfaW5uZXJbMF1bMF0sIHBhX2lubmVyWzBdWzFdLCB6ICsgMC4wMDEsIDAsIDAsIDEsIDAsIDEuMCwgMCxcbiAgICAgICAgICAgICAgICBwYV9vdXRlclswXVswXSwgcGFfb3V0ZXJbMF1bMV0sIHogKyAwLjAwMSwgMCwgMCwgMSwgMCwgMS4wLCAwLFxuXG4gICAgICAgICAgICAgICAgcGFfaW5uZXJbMV1bMF0sIHBhX2lubmVyWzFdWzFdLCB6ICsgMC4wMDEsIDAsIDAsIDEsIDAsIDEuMCwgMCxcbiAgICAgICAgICAgICAgICBwYV9vdXRlclsxXVswXSwgcGFfb3V0ZXJbMV1bMV0sIHogKyAwLjAwMSwgMCwgMCwgMSwgMCwgMS4wLCAwLFxuXG4gICAgICAgICAgICAgICAgcGJfaW5uZXJbMF1bMF0sIHBiX2lubmVyWzBdWzFdLCB6ICsgMC4wMDEsIDAsIDAsIDEsIDAsIDEuMCwgMCxcbiAgICAgICAgICAgICAgICBwYl9vdXRlclswXVswXSwgcGJfb3V0ZXJbMF1bMV0sIHogKyAwLjAwMSwgMCwgMCwgMSwgMCwgMS4wLCAwLFxuXG4gICAgICAgICAgICAgICAgcGJfaW5uZXJbMV1bMF0sIHBiX2lubmVyWzFdWzFdLCB6ICsgMC4wMDEsIDAsIDAsIDEsIDAsIDEuMCwgMCxcbiAgICAgICAgICAgICAgICBwYl9vdXRlclsxXVswXSwgcGJfb3V0ZXJbMV1bMV0sIHogKyAwLjAwMSwgMCwgMCwgMSwgMCwgMS4wLCAwXG4gICAgICAgICAgICApO1xuICAgICAgICB9XG5cbiAgICAgICAgaWYgKEdMQnVpbGRlcnMuZGVidWcgJiYgbGluZV9kZWJ1ZyAmJiBvcHRpb25zLnZlcnRleF9saW5lcykge1xuICAgICAgICAgICAgdmFyIGRjb2xvcjtcbiAgICAgICAgICAgIGlmIChsaW5lX2RlYnVnID09ICdwYXJhbGxlbCcpIHtcbiAgICAgICAgICAgICAgICAvLyBjb25zb2xlLmxvZyhcIiEhISBsaW5lcyBhcmUgcGFyYWxsZWwgISEhXCIpO1xuICAgICAgICAgICAgICAgIGRjb2xvciA9IFswLCAxLCAwXTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIGVsc2UgaWYgKGxpbmVfZGVidWcgPT0gJ2Rpc3RhbmNlJykge1xuICAgICAgICAgICAgICAgIC8vIGNvbnNvbGUubG9nKFwiISEhIG1pdGVyIGludGVyc2VjdGlvbiBwb2ludCBleGNlZWRlZCBhbGxvd2VkIGRpc3RhbmNlIGZyb20gam9pbnQgISEhXCIpO1xuICAgICAgICAgICAgICAgIGRjb2xvciA9IFsxLCAwLCAwXTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIC8vIGNvbnNvbGUubG9nKCdPU00gaWQ6ICcgKyBmZWF0dXJlLmlkKTsgLy8gVE9ETzogaWYgdGhpcyBmdW5jdGlvbiBpcyBtb3ZlZCBvdXQgb2YgYSBjbG9zdXJlLCB0aGlzIGZlYXR1cmUgZGVidWcgaW5mbyB3b24ndCBiZSBhdmFpbGFibGVcbiAgICAgICAgICAgIC8vIGNvbnNvbGUubG9nKFtwYSwgam9pbnQsIHBiXSk7XG4gICAgICAgICAgICAvLyBjb25zb2xlLmxvZyhmZWF0dXJlKTtcbiAgICAgICAgICAgIG9wdGlvbnMudmVydGV4X2xpbmVzLnB1c2goXG4gICAgICAgICAgICAgICAgcGFbMF0sIHBhWzFdLCB6ICsgMC4wMDIsXG4gICAgICAgICAgICAgICAgMCwgMCwgMSwgZGNvbG9yWzBdLCBkY29sb3JbMV0sIGRjb2xvclsyXSxcbiAgICAgICAgICAgICAgICBqb2ludFswXSwgam9pbnRbMV0sIHogKyAwLjAwMixcbiAgICAgICAgICAgICAgICAwLCAwLCAxLCBkY29sb3JbMF0sIGRjb2xvclsxXSwgZGNvbG9yWzJdLFxuICAgICAgICAgICAgICAgIGpvaW50WzBdLCBqb2ludFsxXSwgeiArIDAuMDAyLFxuICAgICAgICAgICAgICAgIDAsIDAsIDEsIGRjb2xvclswXSwgZGNvbG9yWzFdLCBkY29sb3JbMl0sXG4gICAgICAgICAgICAgICAgcGJbMF0sIHBiWzFdLCB6ICsgMC4wMDIsXG4gICAgICAgICAgICAgICAgMCwgMCwgMSwgZGNvbG9yWzBdLCBkY29sb3JbMV0sIGRjb2xvclsyXVxuICAgICAgICAgICAgKTtcblxuICAgICAgICAgICAgdmFyIG51bV9saW5lcyA9IGxpbmVzLmxlbmd0aDtcbiAgICAgICAgICAgIGZvciAodmFyIGxuPTA7IGxuIDwgbnVtX2xpbmVzOyBsbisrKSB7XG4gICAgICAgICAgICAgICAgdmFyIGxpbmUyID0gbGluZXNbbG5dO1xuXG4gICAgICAgICAgICAgICAgZm9yICh2YXIgcD0wOyBwIDwgbGluZTIubGVuZ3RoIC0gMTsgcCsrKSB7XG4gICAgICAgICAgICAgICAgICAgIC8vIFBvaW50IEEgdG8gQlxuICAgICAgICAgICAgICAgICAgICB2YXIgcGEgPSBsaW5lMltwXTtcbiAgICAgICAgICAgICAgICAgICAgdmFyIHBiID0gbGluZTJbcCsxXTtcblxuICAgICAgICAgICAgICAgICAgICBvcHRpb25zLnZlcnRleF9saW5lcy5wdXNoKFxuICAgICAgICAgICAgICAgICAgICAgICAgcGFbMF0sIHBhWzFdLCB6ICsgMC4wMDA1LFxuICAgICAgICAgICAgICAgICAgICAgICAgMCwgMCwgMSwgMCwgMCwgMS4wLFxuICAgICAgICAgICAgICAgICAgICAgICAgcGJbMF0sIHBiWzFdLCB6ICsgMC4wMDA1LFxuICAgICAgICAgICAgICAgICAgICAgICAgMCwgMCwgMSwgMCwgMCwgMS4wXG4gICAgICAgICAgICAgICAgICAgICk7XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgfTtcbiAgICAgICAgfVxuICAgIH1cblxuICAgIHJldHVybiB2ZXJ0ZXhfZGF0YTtcbn07XG5cbi8vIEJ1aWxkIGEgcXVhZCBjZW50ZXJlZCBvbiBhIHBvaW50XG4vLyBaIGNvb3JkLCBub3JtYWxzLCBhbmQgdGV4Y29vcmRzIGFyZSBvcHRpb25hbFxuLy8gTGF5b3V0IG9yZGVyIGlzOlxuLy8gICBwb3NpdGlvbiAoMiBvciAzIGNvbXBvbmVudHMpXG4vLyAgIHRleGNvb3JkIChvcHRpb25hbCwgMiBjb21wb25lbnRzKVxuLy8gICBub3JtYWwgKG9wdGlvbmFsLCAzIGNvbXBvbmVudHMpXG4vLyAgIGNvbnN0YW50cyAob3B0aW9uYWwpXG5HTEJ1aWxkZXJzLmJ1aWxkUXVhZHNGb3JQb2ludHMgPSBmdW5jdGlvbiAocG9pbnRzLCB3aWR0aCwgaGVpZ2h0LCB6LCB2ZXJ0ZXhfZGF0YSwgb3B0aW9ucylcbntcbiAgICB2YXIgb3B0aW9ucyA9IG9wdGlvbnMgfHwge307XG5cbiAgICB2YXIgdmVydGV4X2NvbnN0YW50cyA9IFtdO1xuICAgIGlmIChvcHRpb25zLm5vcm1hbHMpIHtcbiAgICAgICAgdmVydGV4X2NvbnN0YW50cy5wdXNoKDAsIDAsIDEpOyAvLyB1cHdhcmRzLWZhY2luZyBub3JtYWxcbiAgICB9XG4gICAgaWYgKG9wdGlvbnMudmVydGV4X2NvbnN0YW50cykge1xuICAgICAgICB2ZXJ0ZXhfY29uc3RhbnRzLnB1c2guYXBwbHkodmVydGV4X2NvbnN0YW50cywgb3B0aW9ucy52ZXJ0ZXhfY29uc3RhbnRzKTtcbiAgICB9XG4gICAgaWYgKHZlcnRleF9jb25zdGFudHMubGVuZ3RoID09IDApIHtcbiAgICAgICAgdmVydGV4X2NvbnN0YW50cyA9IG51bGw7XG4gICAgfVxuXG4gICAgdmFyIG51bV9wb2ludHMgPSBwb2ludHMubGVuZ3RoO1xuICAgIGZvciAodmFyIHA9MDsgcCA8IG51bV9wb2ludHM7IHArKykge1xuICAgICAgICB2YXIgcG9pbnQgPSBwb2ludHNbcF07XG5cbiAgICAgICAgdmFyIHBvc2l0aW9ucyA9IFtcbiAgICAgICAgICAgIFtwb2ludFswXSAtIHdpZHRoLzIsIHBvaW50WzFdIC0gaGVpZ2h0LzJdLFxuICAgICAgICAgICAgW3BvaW50WzBdICsgd2lkdGgvMiwgcG9pbnRbMV0gLSBoZWlnaHQvMl0sXG4gICAgICAgICAgICBbcG9pbnRbMF0gKyB3aWR0aC8yLCBwb2ludFsxXSArIGhlaWdodC8yXSxcblxuICAgICAgICAgICAgW3BvaW50WzBdIC0gd2lkdGgvMiwgcG9pbnRbMV0gLSBoZWlnaHQvMl0sXG4gICAgICAgICAgICBbcG9pbnRbMF0gKyB3aWR0aC8yLCBwb2ludFsxXSArIGhlaWdodC8yXSxcbiAgICAgICAgICAgIFtwb2ludFswXSAtIHdpZHRoLzIsIHBvaW50WzFdICsgaGVpZ2h0LzJdLFxuICAgICAgICBdO1xuXG4gICAgICAgIC8vIEFkZCBwcm92aWRlZCB6XG4gICAgICAgIGlmICh6ICE9IG51bGwpIHtcbiAgICAgICAgICAgIHBvc2l0aW9uc1swXVsyXSA9IHo7XG4gICAgICAgICAgICBwb3NpdGlvbnNbMV1bMl0gPSB6O1xuICAgICAgICAgICAgcG9zaXRpb25zWzJdWzJdID0gejtcbiAgICAgICAgICAgIHBvc2l0aW9uc1szXVsyXSA9IHo7XG4gICAgICAgICAgICBwb3NpdGlvbnNbNF1bMl0gPSB6O1xuICAgICAgICAgICAgcG9zaXRpb25zWzVdWzJdID0gejtcbiAgICAgICAgfVxuXG4gICAgICAgIGlmIChvcHRpb25zLnRleGNvb3JkcyA9PSB0cnVlKSB7XG4gICAgICAgICAgICB2YXIgdGV4Y29vcmRzID0gW1xuICAgICAgICAgICAgICAgIFstMSwgLTFdLFxuICAgICAgICAgICAgICAgIFsxLCAtMV0sXG4gICAgICAgICAgICAgICAgWzEsIDFdLFxuXG4gICAgICAgICAgICAgICAgWy0xLCAtMV0sXG4gICAgICAgICAgICAgICAgWzEsIDFdLFxuICAgICAgICAgICAgICAgIFstMSwgMV1cbiAgICAgICAgICAgIF07XG5cbiAgICAgICAgICAgIEdMLmFkZFZlcnRpY2VzTXVsdGlwbGVBdHRyaWJ1dGVzKFtwb3NpdGlvbnMsIHRleGNvb3Jkc10sIHZlcnRleF9jb25zdGFudHMsIHZlcnRleF9kYXRhKTtcbiAgICAgICAgfVxuICAgICAgICBlbHNlIHtcbiAgICAgICAgICAgIEdMLmFkZFZlcnRpY2VzKHBvc2l0aW9ucywgdmVydGV4X2NvbnN0YW50cywgdmVydGV4X2RhdGEpO1xuICAgICAgICB9XG4gICAgfVxuXG4gICAgcmV0dXJuIHZlcnRleF9kYXRhO1xufTtcblxuLy8gQ2FsbGJhY2stYmFzZSBidWlsZGVyIChmb3IgZnV0dXJlIGV4cGxvcmF0aW9uKVxuLy8gR0xCdWlsZGVycy5idWlsZFF1YWRzRm9yUG9pbnRzMiA9IGZ1bmN0aW9uIEdMQnVpbGRlcnNCdWlsZFF1YWRzRm9yUG9pbnRzIChwb2ludHMsIHdpZHRoLCBoZWlnaHQsIGFkZEdlb21ldHJ5LCBvcHRpb25zKVxuLy8ge1xuLy8gICAgIHZhciBvcHRpb25zID0gb3B0aW9ucyB8fCB7fTtcblxuLy8gICAgIHZhciBudW1fcG9pbnRzID0gcG9pbnRzLmxlbmd0aDtcbi8vICAgICBmb3IgKHZhciBwPTA7IHAgPCBudW1fcG9pbnRzOyBwKyspIHtcbi8vICAgICAgICAgdmFyIHBvaW50ID0gcG9pbnRzW3BdO1xuXG4vLyAgICAgICAgIHZhciBwb3NpdGlvbnMgPSBbXG4vLyAgICAgICAgICAgICBbcG9pbnRbMF0gLSB3aWR0aC8yLCBwb2ludFsxXSAtIGhlaWdodC8yXSxcbi8vICAgICAgICAgICAgIFtwb2ludFswXSArIHdpZHRoLzIsIHBvaW50WzFdIC0gaGVpZ2h0LzJdLFxuLy8gICAgICAgICAgICAgW3BvaW50WzBdICsgd2lkdGgvMiwgcG9pbnRbMV0gKyBoZWlnaHQvMl0sXG5cbi8vICAgICAgICAgICAgIFtwb2ludFswXSAtIHdpZHRoLzIsIHBvaW50WzFdIC0gaGVpZ2h0LzJdLFxuLy8gICAgICAgICAgICAgW3BvaW50WzBdICsgd2lkdGgvMiwgcG9pbnRbMV0gKyBoZWlnaHQvMl0sXG4vLyAgICAgICAgICAgICBbcG9pbnRbMF0gLSB3aWR0aC8yLCBwb2ludFsxXSArIGhlaWdodC8yXSxcbi8vICAgICAgICAgXTtcblxuLy8gICAgICAgICBpZiAob3B0aW9ucy50ZXhjb29yZHMgPT0gdHJ1ZSkge1xuLy8gICAgICAgICAgICAgdmFyIHRleGNvb3JkcyA9IFtcbi8vICAgICAgICAgICAgICAgICBbLTEsIC0xXSxcbi8vICAgICAgICAgICAgICAgICBbMSwgLTFdLFxuLy8gICAgICAgICAgICAgICAgIFsxLCAxXSxcblxuLy8gICAgICAgICAgICAgICAgIFstMSwgLTFdLFxuLy8gICAgICAgICAgICAgICAgIFsxLCAxXSxcbi8vICAgICAgICAgICAgICAgICBbLTEsIDFdXG4vLyAgICAgICAgICAgICBdO1xuLy8gICAgICAgICB9XG5cbi8vICAgICAgICAgdmFyIHZlcnRpY2VzID0ge1xuLy8gICAgICAgICAgICAgcG9zaXRpb25zOiBwb3NpdGlvbnMsXG4vLyAgICAgICAgICAgICBub3JtYWxzOiAob3B0aW9ucy5ub3JtYWxzID8gWzAsIDAsIDFdIDogbnVsbCksXG4vLyAgICAgICAgICAgICB0ZXhjb29yZHM6IChvcHRpb25zLnRleGNvb3JkcyAmJiB0ZXhjb29yZHMpXG4vLyAgICAgICAgIH07XG4vLyAgICAgICAgIGFkZEdlb21ldHJ5KHZlcnRpY2VzKTtcbi8vICAgICB9XG4vLyB9O1xuXG4vLyBCdWlsZCBuYXRpdmUgR0wgbGluZXMgZm9yIGEgcG9seWxpbmVcbkdMQnVpbGRlcnMuYnVpbGRMaW5lcyA9IGZ1bmN0aW9uIEdMQnVpbGRlcnNCdWlsZExpbmVzIChsaW5lcywgZmVhdHVyZSwgbGF5ZXIsIHN0eWxlLCB0aWxlLCB6LCB2ZXJ0ZXhfZGF0YSwgb3B0aW9ucylcbntcbiAgICBvcHRpb25zID0gb3B0aW9ucyB8fCB7fTtcblxuICAgIHZhciBjb2xvciA9IHN0eWxlLmNvbG9yO1xuICAgIHZhciB3aWR0aCA9IHN0eWxlLndpZHRoO1xuXG4gICAgdmFyIG51bV9saW5lcyA9IGxpbmVzLmxlbmd0aDtcbiAgICBmb3IgKHZhciBsbj0wOyBsbiA8IG51bV9saW5lczsgbG4rKykge1xuICAgICAgICB2YXIgbGluZSA9IGxpbmVzW2xuXTtcblxuICAgICAgICBmb3IgKHZhciBwPTA7IHAgPCBsaW5lLmxlbmd0aCAtIDE7IHArKykge1xuICAgICAgICAgICAgLy8gUG9pbnQgQSB0byBCXG4gICAgICAgICAgICB2YXIgcGEgPSBsaW5lW3BdO1xuICAgICAgICAgICAgdmFyIHBiID0gbGluZVtwKzFdO1xuXG4gICAgICAgICAgICB2ZXJ0ZXhfZGF0YS5wdXNoKFxuICAgICAgICAgICAgICAgIC8vIFBvaW50IEFcbiAgICAgICAgICAgICAgICBwYVswXSwgcGFbMV0sIHosXG4gICAgICAgICAgICAgICAgMCwgMCwgMSwgLy8gZmxhdCBzdXJmYWNlcyBwb2ludCBzdHJhaWdodCB1cFxuICAgICAgICAgICAgICAgIGNvbG9yWzBdLCBjb2xvclsxXSwgY29sb3JbMl0sXG4gICAgICAgICAgICAgICAgLy8gUG9pbnQgQlxuICAgICAgICAgICAgICAgIHBiWzBdLCBwYlsxXSwgeixcbiAgICAgICAgICAgICAgICAwLCAwLCAxLCAvLyBmbGF0IHN1cmZhY2VzIHBvaW50IHN0cmFpZ2h0IHVwXG4gICAgICAgICAgICAgICAgY29sb3JbMF0sIGNvbG9yWzFdLCBjb2xvclsyXVxuICAgICAgICAgICAgKTtcbiAgICAgICAgfVxuICAgIH07XG5cbiAgICByZXR1cm4gdmVydGV4X2RhdGE7XG59O1xuXG4vKiBVdGlsaXR5IGZ1bmN0aW9ucyAqL1xuXG4vLyBUZXN0cyBpZiBhIGxpbmUgc2VnbWVudCAoZnJvbSBwb2ludCBBIHRvIEIpIGlzIG5lYXJseSBjb2luY2lkZW50IHdpdGggdGhlIGVkZ2Ugb2YgYSB0aWxlXG5HTEJ1aWxkZXJzLmlzT25UaWxlRWRnZSA9IGZ1bmN0aW9uIChwYSwgcGIsIG9wdGlvbnMpXG57XG4gICAgb3B0aW9ucyA9IG9wdGlvbnMgfHwge307XG5cbiAgICB2YXIgdG9sZXJhbmNlX2Z1bmN0aW9uID0gb3B0aW9ucy50b2xlcmFuY2VfZnVuY3Rpb24gfHwgR0xCdWlsZGVycy52YWx1ZXNXaXRoaW5Ub2xlcmFuY2U7XG4gICAgdmFyIHRvbGVyYW5jZSA9IG9wdGlvbnMudG9sZXJhbmNlIHx8IDE7IC8vIHR3ZWFrIHRoaXMgYWRqdXN0IGlmIGNhdGNoaW5nIHRvbyBmZXcvbWFueSBsaW5lIHNlZ21lbnRzIG5lYXIgdGlsZSBlZGdlc1xuICAgIHZhciB0aWxlX21pbiA9IEdMQnVpbGRlcnMudGlsZV9ib3VuZHNbMF07XG4gICAgdmFyIHRpbGVfbWF4ID0gR0xCdWlsZGVycy50aWxlX2JvdW5kc1sxXTtcbiAgICB2YXIgZWRnZSA9IG51bGw7XG5cbiAgICBpZiAodG9sZXJhbmNlX2Z1bmN0aW9uKHBhWzBdLCB0aWxlX21pbi54LCB0b2xlcmFuY2UpICYmIHRvbGVyYW5jZV9mdW5jdGlvbihwYlswXSwgdGlsZV9taW4ueCwgdG9sZXJhbmNlKSkge1xuICAgICAgICBlZGdlID0gJ2xlZnQnO1xuICAgIH1cbiAgICBlbHNlIGlmICh0b2xlcmFuY2VfZnVuY3Rpb24ocGFbMF0sIHRpbGVfbWF4LngsIHRvbGVyYW5jZSkgJiYgdG9sZXJhbmNlX2Z1bmN0aW9uKHBiWzBdLCB0aWxlX21heC54LCB0b2xlcmFuY2UpKSB7XG4gICAgICAgIGVkZ2UgPSAncmlnaHQnO1xuICAgIH1cbiAgICBlbHNlIGlmICh0b2xlcmFuY2VfZnVuY3Rpb24ocGFbMV0sIHRpbGVfbWluLnksIHRvbGVyYW5jZSkgJiYgdG9sZXJhbmNlX2Z1bmN0aW9uKHBiWzFdLCB0aWxlX21pbi55LCB0b2xlcmFuY2UpKSB7XG4gICAgICAgIGVkZ2UgPSAndG9wJztcbiAgICB9XG4gICAgZWxzZSBpZiAodG9sZXJhbmNlX2Z1bmN0aW9uKHBhWzFdLCB0aWxlX21heC55LCB0b2xlcmFuY2UpICYmIHRvbGVyYW5jZV9mdW5jdGlvbihwYlsxXSwgdGlsZV9tYXgueSwgdG9sZXJhbmNlKSkge1xuICAgICAgICBlZGdlID0gJ2JvdHRvbSc7XG4gICAgfVxuICAgIHJldHVybiBlZGdlO1xufTtcblxuR0xCdWlsZGVycy5zZXRUaWxlU2NhbGUgPSBmdW5jdGlvbiAoc2NhbGUpXG57XG4gICAgR0xCdWlsZGVycy50aWxlX2JvdW5kcyA9IFtcbiAgICAgICAgUG9pbnQoMCwgMCksXG4gICAgICAgIFBvaW50KHNjYWxlLCAtc2NhbGUpIC8vIFRPRE86IGNvcnJlY3QgZm9yIGZsaXBwZWQgeS1heGlzP1xuICAgIF07XG59O1xuXG5HTEJ1aWxkZXJzLnZhbHVlc1dpdGhpblRvbGVyYW5jZSA9IGZ1bmN0aW9uIChhLCBiLCB0b2xlcmFuY2UpXG57XG4gICAgdG9sZXJhbmNlID0gdG9sZXJhbmNlIHx8IDE7XG4gICAgcmV0dXJuIChNYXRoLmFicyhhIC0gYikgPCB0b2xlcmFuY2UpO1xufTtcblxuLy8gQnVpbGQgYSB6aWd6YWcgbGluZSBwYXR0ZXJuIGZvciB0ZXN0aW5nIGpvaW5zIGFuZCBjYXBzXG5HTEJ1aWxkZXJzLmJ1aWxkWmlnemFnTGluZVRlc3RQYXR0ZXJuID0gZnVuY3Rpb24gKClcbntcbiAgICB2YXIgbWluID0gUG9pbnQoMCwgMCk7IC8vIHRpbGUubWluO1xuICAgIHZhciBtYXggPSBQb2ludCg0MDk2LCA0MDk2KTsgLy8gdGlsZS5tYXg7XG4gICAgdmFyIGcgPSB7XG4gICAgICAgIGlkOiAxMjMsXG4gICAgICAgIGdlb21ldHJ5OiB7XG4gICAgICAgICAgICB0eXBlOiAnTGluZVN0cmluZycsXG4gICAgICAgICAgICBjb29yZGluYXRlczogW1xuICAgICAgICAgICAgICAgIFttaW4ueCAqIDAuNzUgKyBtYXgueCAqIDAuMjUsIG1pbi55ICogMC43NSArIG1heC55ICogMC4yNV0sXG4gICAgICAgICAgICAgICAgW21pbi54ICogMC43NSArIG1heC54ICogMC4yNSwgbWluLnkgKiAwLjUgKyBtYXgueSAqIDAuNV0sXG4gICAgICAgICAgICAgICAgW21pbi54ICogMC4yNSArIG1heC54ICogMC43NSwgbWluLnkgKiAwLjc1ICsgbWF4LnkgKiAwLjI1XSxcbiAgICAgICAgICAgICAgICBbbWluLnggKiAwLjI1ICsgbWF4LnggKiAwLjc1LCBtaW4ueSAqIDAuMjUgKyBtYXgueSAqIDAuNzVdLFxuICAgICAgICAgICAgICAgIFttaW4ueCAqIDAuNCArIG1heC54ICogMC42LCBtaW4ueSAqIDAuNSArIG1heC55ICogMC41XSxcbiAgICAgICAgICAgICAgICBbbWluLnggKiAwLjUgKyBtYXgueCAqIDAuNSwgbWluLnkgKiAwLjI1ICsgbWF4LnkgKiAwLjc1XSxcbiAgICAgICAgICAgICAgICBbbWluLnggKiAwLjc1ICsgbWF4LnggKiAwLjI1LCBtaW4ueSAqIDAuMjUgKyBtYXgueSAqIDAuNzVdLFxuICAgICAgICAgICAgICAgIFttaW4ueCAqIDAuNzUgKyBtYXgueCAqIDAuMjUsIG1pbi55ICogMC40ICsgbWF4LnkgKiAwLjZdXG4gICAgICAgICAgICBdXG4gICAgICAgIH0sXG4gICAgICAgIHByb3BlcnRpZXM6IHtcbiAgICAgICAgICAgIGtpbmQ6ICdkZWJ1ZydcbiAgICAgICAgfVxuICAgIH07XG4gICAgLy8gY29uc29sZS5sb2coZy5nZW9tZXRyeS5jb29yZGluYXRlcyk7XG4gICAgcmV0dXJuIGc7XG59O1xuIiwiLyoqKiBNYW5hZ2UgcmVuZGVyaW5nIGZvciBwcmltaXRpdmVzICoqKi9cbmltcG9ydCB7R0x9IGZyb20gJy4vZ2wnO1xuaW1wb3J0IEdMVmVydGV4TGF5b3V0IGZyb20gJy4vZ2xfdmVydGV4X2xheW91dCc7XG5pbXBvcnQgR0xQcm9ncmFtIGZyb20gJy4vZ2xfcHJvZ3JhbSc7XG5cbi8vIEEgc2luZ2xlIG1lc2gvVkJPLCBkZXNjcmliZWQgYnkgYSB2ZXJ0ZXggbGF5b3V0LCB0aGF0IGNhbiBiZSBkcmF3biB3aXRoIG9uZSBvciBtb3JlIHByb2dyYW1zXG5leHBvcnQgZGVmYXVsdCBmdW5jdGlvbiBHTEdlb21ldHJ5IChnbCwgdmVydGV4X2RhdGEsIHZlcnRleF9sYXlvdXQsIG9wdGlvbnMpXG57XG4gICAgb3B0aW9ucyA9IG9wdGlvbnMgfHwge307XG5cbiAgICB0aGlzLmdsID0gZ2w7XG4gICAgdGhpcy52ZXJ0ZXhfZGF0YSA9IHZlcnRleF9kYXRhOyAvLyBGbG9hdDMyQXJyYXlcbiAgICB0aGlzLnZlcnRleF9sYXlvdXQgPSB2ZXJ0ZXhfbGF5b3V0O1xuICAgIHRoaXMuYnVmZmVyID0gdGhpcy5nbC5jcmVhdGVCdWZmZXIoKTtcbiAgICB0aGlzLmRyYXdfbW9kZSA9IG9wdGlvbnMuZHJhd19tb2RlIHx8IHRoaXMuZ2wuVFJJQU5HTEVTO1xuICAgIHRoaXMuZGF0YV91c2FnZSA9IG9wdGlvbnMuZGF0YV91c2FnZSB8fCB0aGlzLmdsLlNUQVRJQ19EUkFXO1xuICAgIHRoaXMudmVydGljZXNfcGVyX2dlb21ldHJ5ID0gMzsgLy8gVE9ETzogc3VwcG9ydCBsaW5lcywgc3RyaXAsIGZhbiwgZXRjLlxuXG4gICAgdGhpcy52ZXJ0ZXhfY291bnQgPSB0aGlzLnZlcnRleF9kYXRhLmJ5dGVMZW5ndGggLyB0aGlzLnZlcnRleF9sYXlvdXQuc3RyaWRlO1xuICAgIHRoaXMuZ2VvbWV0cnlfY291bnQgPSB0aGlzLnZlcnRleF9jb3VudCAvIHRoaXMudmVydGljZXNfcGVyX2dlb21ldHJ5O1xuXG4gICAgLy8gVE9ETzogZGlzYWJsaW5nIFZBT3MgZm9yIG5vdyBiZWNhdXNlIHdlIG5lZWQgdG8gc3VwcG9ydCBkaWZmZXJlbnQgdmVydGV4IGxheW91dCArIHByb2dyYW0gY29tYmluYXRpb25zLFxuICAgIC8vIHdoZXJlIG5vdCBhbGwgcHJvZ3JhbXMgd2lsbCByZWNvZ25pemUgYWxsIGF0dHJpYnV0ZXMgKGUuZy4gZmVhdHVyZSBzZWxlY3Rpb24gc2hhZGVycyBpbmNsdWRlIGV4dHJhIGF0dHJpYikuXG4gICAgLy8gVG8gc3VwcG9ydCBWQU9zIGhlcmUsIHdvdWxkIG5lZWQgdG8gc3VwcG9ydCBtdWx0aXBsZSBwZXIgZ2VvbWV0cnksIGtleWVkIGJ5IEdMIHByb2dyYW0/XG4gICAgLy8gdGhpcy52YW8gPSBHTFZlcnRleEFycmF5T2JqZWN0LmNyZWF0ZShmdW5jdGlvbigpIHtcbiAgICAvLyAgICAgdGhpcy5nbC5iaW5kQnVmZmVyKHRoaXMuZ2wuQVJSQVlfQlVGRkVSLCB0aGlzLmJ1ZmZlcik7XG4gICAgLy8gICAgIHRoaXMuc2V0dXAoKTtcbiAgICAvLyB9LmJpbmQodGhpcykpO1xuXG4gICAgdGhpcy5nbC5iaW5kQnVmZmVyKHRoaXMuZ2wuQVJSQVlfQlVGRkVSLCB0aGlzLmJ1ZmZlcik7XG4gICAgdGhpcy5nbC5idWZmZXJEYXRhKHRoaXMuZ2wuQVJSQVlfQlVGRkVSLCB0aGlzLnZlcnRleF9kYXRhLCB0aGlzLmRhdGFfdXNhZ2UpO1xufVxuXG4vLyBSZW5kZXIsIGJ5IGRlZmF1bHQgd2l0aCBjdXJyZW50bHkgYm91bmQgcHJvZ3JhbSwgb3Igb3RoZXJ3aXNlIHdpdGggb3B0aW9uYWxseSBwcm92aWRlZCBvbmVcbkdMR2VvbWV0cnkucHJvdG90eXBlLnJlbmRlciA9IGZ1bmN0aW9uIChvcHRpb25zKVxue1xuICAgIG9wdGlvbnMgPSBvcHRpb25zIHx8IHt9O1xuXG4gICAgLy8gR0xWZXJ0ZXhBcnJheU9iamVjdC5iaW5kKHRoaXMudmFvKTtcblxuICAgIGlmICh0eXBlb2YgdGhpcy5fcmVuZGVyX3NldHVwID09ICdmdW5jdGlvbicpIHtcbiAgICAgICAgdGhpcy5fcmVuZGVyX3NldHVwKCk7XG4gICAgfVxuXG4gICAgdmFyIGdsX3Byb2dyYW0gPSBvcHRpb25zLmdsX3Byb2dyYW0gfHwgR0xQcm9ncmFtLmN1cnJlbnQ7XG4gICAgZ2xfcHJvZ3JhbS51c2UoKTtcblxuICAgIHRoaXMuZ2wuYmluZEJ1ZmZlcih0aGlzLmdsLkFSUkFZX0JVRkZFUiwgdGhpcy5idWZmZXIpO1xuICAgIHRoaXMudmVydGV4X2xheW91dC5lbmFibGUodGhpcy5nbCwgZ2xfcHJvZ3JhbSk7XG5cbiAgICAvLyBUT0RPOiBzdXBwb3J0IGVsZW1lbnQgYXJyYXkgbW9kZVxuICAgIHRoaXMuZ2wuZHJhd0FycmF5cyh0aGlzLmRyYXdfbW9kZSwgMCwgdGhpcy52ZXJ0ZXhfY291bnQpO1xuICAgIC8vIEdMVmVydGV4QXJyYXlPYmplY3QuYmluZChudWxsKTtcbn07XG5cbkdMR2VvbWV0cnkucHJvdG90eXBlLmRlc3Ryb3kgPSBmdW5jdGlvbiAoKVxue1xuICAgIGNvbnNvbGUubG9nKFwiR0xHZW9tZXRyeS5kZXN0cm95OiBkZWxldGUgYnVmZmVyIG9mIHNpemUgXCIgKyB0aGlzLnZlcnRleF9kYXRhLmJ5dGVMZW5ndGgpO1xuICAgIHRoaXMuZ2wuZGVsZXRlQnVmZmVyKHRoaXMuYnVmZmVyKTtcbiAgICBkZWxldGUgdGhpcy52ZXJ0ZXhfZGF0YTtcbn07XG4iLCIvLyBSZW5kZXJpbmcgbW9kZXNcbmltcG9ydCB7R0x9IGZyb20gJy4vZ2wnO1xuaW1wb3J0IEdMVmVydGV4TGF5b3V0IGZyb20gJy4vZ2xfdmVydGV4X2xheW91dCc7XG5pbXBvcnQge0dMQnVpbGRlcnN9IGZyb20gJy4vZ2xfYnVpbGRlcnMnO1xuaW1wb3J0IEdMUHJvZ3JhbSBmcm9tICcuL2dsX3Byb2dyYW0nO1xuaW1wb3J0IEdMR2VvbWV0cnkgZnJvbSAnLi9nbF9nZW9tJztcblxudmFyIHNoYWRlcl9zb3VyY2VzID0gcmVxdWlyZSgnLi9nbF9zaGFkZXJzJyk7IC8vIGJ1aWx0LWluIHNoYWRlcnNcblxuaW1wb3J0ICogYXMgUXVldWUgZnJvbSAncXVldWUtYXN5bmMnO1xuXG5leHBvcnQgdmFyIE1vZGVzID0ge307XG5leHBvcnQgdmFyIE1vZGVNYW5hZ2VyID0ge307XG5cblxuLy8gQmFzZVxuXG52YXIgUmVuZGVyTW9kZSA9IHtcbiAgICBpbml0OiBmdW5jdGlvbiAoZ2wpIHtcbiAgICAgICAgdGhpcy5nbCA9IGdsO1xuICAgICAgICB0aGlzLm1ha2VHTFByb2dyYW0oKTtcblxuICAgICAgICBpZiAodHlwZW9mIHRoaXMuX2luaXQgPT0gJ2Z1bmN0aW9uJykge1xuICAgICAgICAgICAgdGhpcy5faW5pdCgpO1xuICAgICAgICB9XG4gICAgfSxcbiAgICByZWZyZXNoOiBmdW5jdGlvbiAoKSB7IC8vIFRPRE86IHNob3VsZCB0aGlzIGJlIGFzeW5jL25vbi1ibG9ja2luZz9cbiAgICAgICAgdGhpcy5tYWtlR0xQcm9ncmFtKCk7XG4gICAgfSxcbiAgICBkZWZpbmVzOiB7fSxcbiAgICBzZWxlY3Rpb246IGZhbHNlLFxuICAgIGJ1aWxkUG9seWdvbnM6IGZ1bmN0aW9uKCl7fSwgLy8gYnVpbGQgZnVuY3Rpb25zIGFyZSBuby1vcHMgdW50aWwgb3ZlcnJpZGVuXG4gICAgYnVpbGRMaW5lczogZnVuY3Rpb24oKXt9LFxuICAgIGJ1aWxkUG9pbnRzOiBmdW5jdGlvbigpe30sXG4gICAgbWFrZUdMR2VvbWV0cnk6IGZ1bmN0aW9uICh2ZXJ0ZXhfZGF0YSkge1xuICAgICAgICByZXR1cm4gbmV3IEdMR2VvbWV0cnkodGhpcy5nbCwgdmVydGV4X2RhdGEsIHRoaXMudmVydGV4X2xheW91dCk7XG4gICAgfVxufTtcblxuUmVuZGVyTW9kZS5tYWtlR0xQcm9ncmFtID0gZnVuY3Rpb24gKClcbntcbiAgICAvLyBjb25zb2xlLmxvZyh0aGlzLm5hbWUgKyBcIjogXCIgKyBcInN0YXJ0IGJ1aWxkaW5nXCIpO1xuICAgIHZhciBxdWV1ZSA9IFF1ZXVlKCk7XG5cbiAgICAvLyBCdWlsZCBkZWZpbmVzICYgZm9yIHNlbGVjdGlvbiAobmVlZCB0byBjcmVhdGUgYSBuZXcgb2JqZWN0IHNpbmNlIHRoZSBmaXJzdCBpcyBzdG9yZWQgYXMgYSByZWZlcmVuY2UgYnkgdGhlIHByb2dyYW0pXG4gICAgdmFyIGRlZmluZXMgPSB0aGlzLmJ1aWxkRGVmaW5lTGlzdCgpO1xuICAgIGlmICh0aGlzLnNlbGVjdGlvbikge1xuICAgICAgICB2YXIgc2VsZWN0aW9uX2RlZmluZXMgPSBPYmplY3QuY3JlYXRlKGRlZmluZXMpO1xuICAgICAgICBzZWxlY3Rpb25fZGVmaW5lc1snRkVBVFVSRV9TRUxFQ1RJT04nXSA9IHRydWU7XG4gICAgfVxuXG4gICAgLy8gR2V0IGFueSBjdXN0b20gY29kZSB0cmFuc2Zvcm1zXG4gICAgdmFyIHRyYW5zZm9ybXMgPSAodGhpcy5zaGFkZXJzICYmIHRoaXMuc2hhZGVycy50cmFuc2Zvcm1zKTtcblxuICAgIC8vIENyZWF0ZSBzaGFkZXJzIC0gcHJvZ3JhbXMgbWF5IHBvaW50IHRvIGluaGVyaXRlZCBwYXJlbnQgcHJvcGVydGllcywgYnV0IHNob3VsZCBiZSByZXBsYWNlZCBieSBzdWJjbGFzcyB2ZXJzaW9uXG4gICAgdmFyIHByb2dyYW0gPSAodGhpcy5oYXNPd25Qcm9wZXJ0eSgnZ2xfcHJvZ3JhbScpICYmIHRoaXMuZ2xfcHJvZ3JhbSk7XG4gICAgdmFyIHNlbGVjdGlvbl9wcm9ncmFtID0gKHRoaXMuaGFzT3duUHJvcGVydHkoJ3NlbGVjdGlvbl9nbF9wcm9ncmFtJykgJiYgdGhpcy5zZWxlY3Rpb25fZ2xfcHJvZ3JhbSk7XG5cbiAgICBxdWV1ZS5kZWZlcihjb21wbGV0ZSA9PiB7XG4gICAgICAgIGlmICghcHJvZ3JhbSkge1xuICAgICAgICAgICAgLy8gY29uc29sZS5sb2codGhpcy5uYW1lICsgXCI6IFwiICsgXCJpbnN0YW50aWF0ZVwiKTtcbiAgICAgICAgICAgIHByb2dyYW0gPSBuZXcgR0xQcm9ncmFtKFxuICAgICAgICAgICAgICAgIHRoaXMuZ2wsXG4gICAgICAgICAgICAgICAgc2hhZGVyX3NvdXJjZXNbdGhpcy52ZXJ0ZXhfc2hhZGVyX2tleV0sXG4gICAgICAgICAgICAgICAgc2hhZGVyX3NvdXJjZXNbdGhpcy5mcmFnbWVudF9zaGFkZXJfa2V5XSxcbiAgICAgICAgICAgICAgICB7XG4gICAgICAgICAgICAgICAgICAgIGRlZmluZXM6IGRlZmluZXMsXG4gICAgICAgICAgICAgICAgICAgIHRyYW5zZm9ybXM6IHRyYW5zZm9ybXMsXG4gICAgICAgICAgICAgICAgICAgIG5hbWU6IHRoaXMubmFtZSxcbiAgICAgICAgICAgICAgICAgICAgY2FsbGJhY2s6IGNvbXBsZXRlXG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgKTtcbiAgICAgICAgfVxuICAgICAgICBlbHNlIHtcbiAgICAgICAgICAgIC8vIGNvbnNvbGUubG9nKHRoaXMubmFtZSArIFwiOiBcIiArIFwicmUtY29tcGlsZVwiKTtcbiAgICAgICAgICAgIHByb2dyYW0uZGVmaW5lcyA9IGRlZmluZXM7XG4gICAgICAgICAgICBwcm9ncmFtLnRyYW5zZm9ybXMgPSB0cmFuc2Zvcm1zO1xuICAgICAgICAgICAgcHJvZ3JhbS5jb21waWxlKGNvbXBsZXRlKTtcbiAgICAgICAgfVxuICAgIH0pO1xuXG4gICAgaWYgKHRoaXMuc2VsZWN0aW9uKSB7XG4gICAgICAgIHF1ZXVlLmRlZmVyKGNvbXBsZXRlID0+IHtcbiAgICAgICAgICAgIGlmICghc2VsZWN0aW9uX3Byb2dyYW0pIHtcbiAgICAgICAgICAgICAgICAvLyBjb25zb2xlLmxvZyh0aGlzLm5hbWUgKyBcIjogXCIgKyBcInNlbGVjdGlvbiBpbnN0YW50aWF0ZVwiKTtcbiAgICAgICAgICAgICAgICBzZWxlY3Rpb25fcHJvZ3JhbSA9IG5ldyBHTFByb2dyYW0oXG4gICAgICAgICAgICAgICAgICAgIHRoaXMuZ2wsXG4gICAgICAgICAgICAgICAgICAgIHNoYWRlcl9zb3VyY2VzW3RoaXMudmVydGV4X3NoYWRlcl9rZXldLFxuICAgICAgICAgICAgICAgICAgICBzaGFkZXJfc291cmNlc1snc2VsZWN0aW9uX2ZyYWdtZW50J10sXG4gICAgICAgICAgICAgICAgICAgIHtcbiAgICAgICAgICAgICAgICAgICAgICAgIGRlZmluZXM6IHNlbGVjdGlvbl9kZWZpbmVzLFxuICAgICAgICAgICAgICAgICAgICAgICAgdHJhbnNmb3JtczogdHJhbnNmb3JtcyxcbiAgICAgICAgICAgICAgICAgICAgICAgIG5hbWU6ICh0aGlzLm5hbWUgKyAnIChzZWxlY3Rpb24pJyksXG4gICAgICAgICAgICAgICAgICAgICAgICBjYWxsYmFjazogY29tcGxldGVcbiAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgICk7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICBlbHNlIHtcbiAgICAgICAgICAgICAgICAvLyBjb25zb2xlLmxvZyh0aGlzLm5hbWUgKyBcIjogXCIgKyBcInNlbGVjdGlvbiByZS1jb21waWxlXCIpO1xuICAgICAgICAgICAgICAgIHNlbGVjdGlvbl9wcm9ncmFtLmRlZmluZXMgPSBzZWxlY3Rpb25fZGVmaW5lcztcbiAgICAgICAgICAgICAgICBzZWxlY3Rpb25fcHJvZ3JhbS50cmFuc2Zvcm1zID0gdHJhbnNmb3JtcztcbiAgICAgICAgICAgICAgICBzZWxlY3Rpb25fcHJvZ3JhbS5jb21waWxlKGNvbXBsZXRlKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgfSk7XG4gICAgfVxuXG4gICAgLy8gV2FpdCBmb3IgcHJvZ3JhbShzKSB0byBjb21waWxlIGJlZm9yZSByZXBsYWNpbmcgdGhlbVxuICAgIC8vIFRPRE86IHNob3VsZCB0aGlzIGVudGlyZSBtZXRob2Qgb2ZmZXIgYSBjYWxsYmFjayBmb3Igd2hlbiBjb21waWxhdGlvbiBjb21wbGV0ZXM/XG4gICAgcXVldWUuYXdhaXQoKCkgPT4ge1xuICAgICAgIGlmIChwcm9ncmFtKSB7XG4gICAgICAgICAgIHRoaXMuZ2xfcHJvZ3JhbSA9IHByb2dyYW07XG4gICAgICAgfVxuXG4gICAgICAgaWYgKHNlbGVjdGlvbl9wcm9ncmFtKSB7XG4gICAgICAgICAgIHRoaXMuc2VsZWN0aW9uX2dsX3Byb2dyYW0gPSBzZWxlY3Rpb25fcHJvZ3JhbTtcbiAgICAgICB9XG5cbiAgICAgICAvLyBjb25zb2xlLmxvZyh0aGlzLm5hbWUgKyBcIjogXCIgKyBcImZpbmlzaGVkIGJ1aWxkaW5nXCIpO1xuICAgIH0pO1xufVxuXG4vLyBUT0RPOiBjb3VsZCBwcm9iYWJseSBjb21iaW5lIGFuZCBnZW5lcmFsaXplIHRoaXMgd2l0aCBzaW1pbGFyIG1ldGhvZCBpbiBHTFByb2dyYW1cbi8vIChsaXN0IG9mIGRlZmluZSBvYmplY3RzIHRoYXQgaW5oZXJpdCBmcm9tIGVhY2ggb3RoZXIpXG5SZW5kZXJNb2RlLmJ1aWxkRGVmaW5lTGlzdCA9IGZ1bmN0aW9uICgpXG57XG4gICAgLy8gQWRkIGFueSBjdXN0b20gZGVmaW5lcyB0byBidWlsdC1pbiBtb2RlIGRlZmluZXNcbiAgICB2YXIgZGVmaW5lcyA9IHt9OyAvLyBjcmVhdGUgYSBuZXcgb2JqZWN0IHRvIGF2b2lkIG11dGF0aW5nIGEgcHJvdG90eXBlIHZhbHVlIHRoYXQgbWF5IGJlIHNoYXJlZCB3aXRoIG90aGVyIG1vZGVzXG4gICAgaWYgKHRoaXMuZGVmaW5lcyAhPSBudWxsKSB7XG4gICAgICAgIGZvciAodmFyIGQgaW4gdGhpcy5kZWZpbmVzKSB7XG4gICAgICAgICAgICBkZWZpbmVzW2RdID0gdGhpcy5kZWZpbmVzW2RdO1xuICAgICAgICB9XG4gICAgfVxuICAgIGlmICh0aGlzLnNoYWRlcnMgIT0gbnVsbCAmJiB0aGlzLnNoYWRlcnMuZGVmaW5lcyAhPSBudWxsKSB7XG4gICAgICAgIGZvciAodmFyIGQgaW4gdGhpcy5zaGFkZXJzLmRlZmluZXMpIHtcbiAgICAgICAgICAgIGRlZmluZXNbZF0gPSB0aGlzLnNoYWRlcnMuZGVmaW5lc1tkXTtcbiAgICAgICAgfVxuICAgIH1cbiAgICByZXR1cm4gZGVmaW5lcztcbn07XG5cbi8vIFNldCBtb2RlIHVuaWZvcm1zIG9uIGN1cnJlbnRseSBib3VuZCBwcm9ncmFtXG5SZW5kZXJNb2RlLnNldFVuaWZvcm1zID0gZnVuY3Rpb24gKClcbntcbiAgICB2YXIgZ2xfcHJvZ3JhbSA9IEdMUHJvZ3JhbS5jdXJyZW50O1xuICAgIGlmIChnbF9wcm9ncmFtICE9IG51bGwgJiYgdGhpcy5zaGFkZXJzICE9IG51bGwgJiYgdGhpcy5zaGFkZXJzLnVuaWZvcm1zICE9IG51bGwpIHtcbiAgICAgICAgZ2xfcHJvZ3JhbS5zZXRVbmlmb3Jtcyh0aGlzLnNoYWRlcnMudW5pZm9ybXMpO1xuICAgIH1cbn07XG5cblJlbmRlck1vZGUudXBkYXRlID0gZnVuY3Rpb24gKClcbntcbiAgICAvLyBNb2RlLXNwZWNpZmljIGFuaW1hdGlvblxuICAgIGlmICh0eXBlb2YgdGhpcy5hbmltYXRpb24gPT0gJ2Z1bmN0aW9uJykge1xuICAgICAgICB0aGlzLmFuaW1hdGlvbigpO1xuICAgIH1cbn07XG5cbi8vIFVwZGF0ZSBidWlsdC1pbiBtb2RlIG9yIGNyZWF0ZSBhIG5ldyBvbmVcbk1vZGVNYW5hZ2VyLmNvbmZpZ3VyZU1vZGUgPSBmdW5jdGlvbiAobmFtZSwgc2V0dGluZ3MpXG57XG4gICAgTW9kZXNbbmFtZV0gPSBNb2Rlc1tuYW1lXSB8fCBPYmplY3QuY3JlYXRlKE1vZGVzW3NldHRpbmdzLmV4dGVuZHNdIHx8IFJlbmRlck1vZGUpO1xuICAgIGlmIChNb2Rlc1tzZXR0aW5ncy5leHRlbmRzXSkge1xuICAgICAgICBNb2Rlc1tuYW1lXS5wYXJlbnQgPSBNb2Rlc1tzZXR0aW5ncy5leHRlbmRzXTsgLy8gZXhwbGljaXQgJ3N1cGVyJyBjbGFzcyBhY2Nlc3NcbiAgICB9XG5cbiAgICBmb3IgKHZhciBzIGluIHNldHRpbmdzKSB7XG4gICAgICAgIE1vZGVzW25hbWVdW3NdID0gc2V0dGluZ3Nbc107XG4gICAgfVxuXG4gICAgTW9kZXNbbmFtZV0ubmFtZSA9IG5hbWU7XG4gICAgcmV0dXJuIE1vZGVzW25hbWVdO1xufTtcblxuXG4vLyBCdWlsdC1pbiByZW5kZXJpbmcgbW9kZXNcblxuLyoqKiBQbGFpbiBwb2x5Z29ucyAqKiovXG5cbk1vZGVzLnBvbHlnb25zID0gT2JqZWN0LmNyZWF0ZShSZW5kZXJNb2RlKTtcbk1vZGVzLnBvbHlnb25zLm5hbWUgPSAncG9seWdvbnMnO1xuXG5Nb2Rlcy5wb2x5Z29ucy52ZXJ0ZXhfc2hhZGVyX2tleSA9ICdwb2x5Z29uX3ZlcnRleCc7XG5Nb2Rlcy5wb2x5Z29ucy5mcmFnbWVudF9zaGFkZXJfa2V5ID0gJ3BvbHlnb25fZnJhZ21lbnQnO1xuXG5Nb2Rlcy5wb2x5Z29ucy5kZWZpbmVzID0ge1xuICAgICdXT1JMRF9QT1NJVElPTl9XUkFQJzogMTAwMDAwIC8vIGRlZmF1bHQgd29ybGQgY29vcmRzIHRvIHdyYXAgZXZlcnkgMTAwLDAwMCBtZXRlcnMsIGNhbiB0dXJuIG9mZiBieSBzZXR0aW5nIHRoaXMgdG8gJ2ZhbHNlJ1xufTtcblxuTW9kZXMucG9seWdvbnMuc2VsZWN0aW9uID0gdHJ1ZTtcblxuTW9kZXMucG9seWdvbnMuX2luaXQgPSBmdW5jdGlvbiAoKSB7XG4gICAgdGhpcy52ZXJ0ZXhfbGF5b3V0ID0gbmV3IEdMVmVydGV4TGF5b3V0KHRoaXMuZ2wsIFtcbiAgICAgICAgeyBuYW1lOiAnYV9wb3NpdGlvbicsIHNpemU6IDMsIHR5cGU6IHRoaXMuZ2wuRkxPQVQsIG5vcm1hbGl6ZWQ6IGZhbHNlIH0sXG4gICAgICAgIHsgbmFtZTogJ2Ffbm9ybWFsJywgc2l6ZTogMywgdHlwZTogdGhpcy5nbC5GTE9BVCwgbm9ybWFsaXplZDogZmFsc2UgfSxcbiAgICAgICAgeyBuYW1lOiAnYV9jb2xvcicsIHNpemU6IDMsIHR5cGU6IHRoaXMuZ2wuRkxPQVQsIG5vcm1hbGl6ZWQ6IGZhbHNlIH0sXG4gICAgICAgIHsgbmFtZTogJ2Ffc2VsZWN0aW9uX2NvbG9yJywgc2l6ZTogNCwgdHlwZTogdGhpcy5nbC5GTE9BVCwgbm9ybWFsaXplZDogZmFsc2UgfSxcbiAgICAgICAgeyBuYW1lOiAnYV9sYXllcicsIHNpemU6IDEsIHR5cGU6IHRoaXMuZ2wuRkxPQVQsIG5vcm1hbGl6ZWQ6IGZhbHNlIH1cbiAgICBdKTtcbn07XG5cbk1vZGVzLnBvbHlnb25zLmJ1aWxkUG9seWdvbnMgPSBmdW5jdGlvbiAocG9seWdvbnMsIHN0eWxlLCB2ZXJ0ZXhfZGF0YSlcbntcbiAgICAvLyBDb2xvciBhbmQgbGF5ZXIgbnVtYmVyIGFyZSBjdXJyZW50bHkgY29uc3RhbnQgYWNyb3NzIHZlcnRpY2VzXG4gICAgdmFyIHZlcnRleF9jb25zdGFudHMgPSBbXG4gICAgICAgIHN0eWxlLmNvbG9yWzBdLCBzdHlsZS5jb2xvclsxXSwgc3R5bGUuY29sb3JbMl0sXG4gICAgICAgIHN0eWxlLnNlbGVjdGlvbi5jb2xvclswXSwgc3R5bGUuc2VsZWN0aW9uLmNvbG9yWzFdLCBzdHlsZS5zZWxlY3Rpb24uY29sb3JbMl0sIHN0eWxlLnNlbGVjdGlvbi5jb2xvclszXSxcbiAgICAgICAgc3R5bGUubGF5ZXJfbnVtXG4gICAgXTtcblxuICAgIC8vIE91dGxpbmVzIGhhdmUgYSBzbGlnaHRseSBkaWZmZXJlbnQgc2V0IG9mIGNvbnN0YW50cywgYmVjYXVzZSB0aGUgbGF5ZXIgbnVtYmVyIGlzIG1vZGlmaWVkXG4gICAgaWYgKHN0eWxlLm91dGxpbmUuY29sb3IpIHtcbiAgICAgICAgdmFyIG91dGxpbmVfdmVydGV4X2NvbnN0YW50cyA9IFtcbiAgICAgICAgICAgIHN0eWxlLm91dGxpbmUuY29sb3JbMF0sIHN0eWxlLm91dGxpbmUuY29sb3JbMV0sIHN0eWxlLm91dGxpbmUuY29sb3JbMl0sXG4gICAgICAgICAgICBzdHlsZS5zZWxlY3Rpb24uY29sb3JbMF0sIHN0eWxlLnNlbGVjdGlvbi5jb2xvclsxXSwgc3R5bGUuc2VsZWN0aW9uLmNvbG9yWzJdLCBzdHlsZS5zZWxlY3Rpb24uY29sb3JbM10sXG4gICAgICAgICAgICBzdHlsZS5sYXllcl9udW0gLSAwLjUgLy8gb3V0bGluZXMgc2l0IGJldHdlZW4gbGF5ZXJzLCB1bmRlcm5lYXRoIGN1cnJlbnQgbGF5ZXIgYnV0IGFib3ZlIHRoZSBvbmUgYmVsb3dcbiAgICAgICAgXTtcbiAgICB9XG5cbiAgICAvLyBFeHRydWRlZCBwb2x5Z29ucyAoZS5nLiAzRCBidWlsZGluZ3MpXG4gICAgaWYgKHN0eWxlLmV4dHJ1ZGUgJiYgc3R5bGUuaGVpZ2h0KSB7XG4gICAgICAgIEdMQnVpbGRlcnMuYnVpbGRFeHRydWRlZFBvbHlnb25zKFxuICAgICAgICAgICAgcG9seWdvbnMsXG4gICAgICAgICAgICBzdHlsZS56LFxuICAgICAgICAgICAgc3R5bGUuaGVpZ2h0LFxuICAgICAgICAgICAgc3R5bGUubWluX2hlaWdodCxcbiAgICAgICAgICAgIHZlcnRleF9kYXRhLFxuICAgICAgICAgICAge1xuICAgICAgICAgICAgICAgIHZlcnRleF9jb25zdGFudHM6IHZlcnRleF9jb25zdGFudHNcbiAgICAgICAgICAgIH1cbiAgICAgICAgKTtcbiAgICB9XG4gICAgLy8gUmVndWxhciBwb2x5Z29uc1xuICAgIGVsc2Uge1xuICAgICAgICBHTEJ1aWxkZXJzLmJ1aWxkUG9seWdvbnMoXG4gICAgICAgICAgICBwb2x5Z29ucyxcbiAgICAgICAgICAgIHN0eWxlLnosXG4gICAgICAgICAgICB2ZXJ0ZXhfZGF0YSxcbiAgICAgICAgICAgIHtcbiAgICAgICAgICAgICAgICBub3JtYWxzOiB0cnVlLFxuICAgICAgICAgICAgICAgIHZlcnRleF9jb25zdGFudHM6IHZlcnRleF9jb25zdGFudHNcbiAgICAgICAgICAgIH1cbiAgICAgICAgKTtcblxuICAgICAgICAvLyBDYWxsYmFjay1iYXNlIGJ1aWxkZXIgKGZvciBmdXR1cmUgZXhwbG9yYXRpb24pXG4gICAgICAgIC8vIHZhciBub3JtYWxfdmVydGV4X2NvbnN0YW50cyA9IFswLCAwLCAxXS5jb25jYXQodmVydGV4X2NvbnN0YW50cyk7XG4gICAgICAgIC8vIEdMQnVpbGRlcnMuYnVpbGRQb2x5Z29uczIoXG4gICAgICAgIC8vICAgICBwb2x5Z29ucyxcbiAgICAgICAgLy8gICAgIHosXG4gICAgICAgIC8vICAgICBmdW5jdGlvbiAodmVydGljZXMpIHtcbiAgICAgICAgLy8gICAgICAgICAvLyB2YXIgdnMgPSB2ZXJ0aWNlcy5wb3NpdGlvbnM7XG4gICAgICAgIC8vICAgICAgICAgLy8gZm9yICh2YXIgdiBpbiB2cykge1xuICAgICAgICAvLyAgICAgICAgIC8vICAgICAvLyB2YXIgYmMgPSBbKHYgJSAzKSA/IDAgOiAxLCAoKHYgKyAxKSAlIDMpID8gMCA6IDEsICgodiArIDIpICUgMykgPyAwIDogMV07XG4gICAgICAgIC8vICAgICAgICAgLy8gICAgIC8vIHZhciBiYyA9IFtjZW50cm9pZC54LCBjZW50cm9pZC55LCAwXTtcbiAgICAgICAgLy8gICAgICAgICAvLyAgICAgLy8gdnNbdl0gPSB2ZXJ0aWNlcy5wb3NpdGlvbnNbdl0uY29uY2F0KHosIDAsIDAsIDEsIGJjKTtcblxuICAgICAgICAvLyAgICAgICAgIC8vICAgICAvLyB2c1t2XSA9IHZlcnRpY2VzLnBvc2l0aW9uc1t2XS5jb25jYXQoeiwgMCwgMCwgMSk7XG4gICAgICAgIC8vICAgICAgICAgLy8gICAgIHZzW3ZdID0gdmVydGljZXMucG9zaXRpb25zW3ZdLmNvbmNhdCgwLCAwLCAxKTtcbiAgICAgICAgLy8gICAgICAgICAvLyB9XG5cbiAgICAgICAgLy8gICAgICAgICBHTC5hZGRWZXJ0aWNlcyh2ZXJ0aWNlcy5wb3NpdGlvbnMsIG5vcm1hbF92ZXJ0ZXhfY29uc3RhbnRzLCB2ZXJ0ZXhfZGF0YSk7XG5cbiAgICAgICAgLy8gICAgICAgICAvLyBHTC5hZGRWZXJ0aWNlc0J5QXR0cmlidXRlTGF5b3V0KFxuICAgICAgICAvLyAgICAgICAgIC8vICAgICBbXG4gICAgICAgIC8vICAgICAgICAgLy8gICAgICAgICB7IG5hbWU6ICdhX3Bvc2l0aW9uJywgZGF0YTogdmVydGljZXMucG9zaXRpb25zIH0sXG4gICAgICAgIC8vICAgICAgICAgLy8gICAgICAgICB7IG5hbWU6ICdhX25vcm1hbCcsIGRhdGE6IFswLCAwLCAxXSB9LFxuICAgICAgICAvLyAgICAgICAgIC8vICAgICAgICAgeyBuYW1lOiAnYV9jb2xvcicsIGRhdGE6IFtzdHlsZS5jb2xvclswXSwgc3R5bGUuY29sb3JbMV0sIHN0eWxlLmNvbG9yWzJdXSB9LFxuICAgICAgICAvLyAgICAgICAgIC8vICAgICAgICAgeyBuYW1lOiAnYV9sYXllcicsIGRhdGE6IHN0eWxlLmxheWVyX251bSB9XG4gICAgICAgIC8vICAgICAgICAgLy8gICAgIF0sXG4gICAgICAgIC8vICAgICAgICAgLy8gICAgIHZlcnRleF9kYXRhXG4gICAgICAgIC8vICAgICAgICAgLy8gKTtcblxuICAgICAgICAvLyAgICAgICAgIC8vIEdMLmFkZFZlcnRpY2VzTXVsdGlwbGVBdHRyaWJ1dGVzKFt2ZXJ0aWNlcy5wb3NpdGlvbnNdLCBub3JtYWxfdmVydGV4X2NvbnN0YW50cywgdmVydGV4X2RhdGEpO1xuICAgICAgICAvLyAgICAgfVxuICAgICAgICAvLyApO1xuICAgIH1cblxuICAgIC8vIFBvbHlnb24gb3V0bGluZXNcbiAgICBpZiAoc3R5bGUub3V0bGluZS5jb2xvciAmJiBzdHlsZS5vdXRsaW5lLndpZHRoKSB7XG4gICAgICAgIGZvciAodmFyIG1wYz0wOyBtcGMgPCBwb2x5Z29ucy5sZW5ndGg7IG1wYysrKSB7XG4gICAgICAgICAgICBHTEJ1aWxkZXJzLmJ1aWxkUG9seWxpbmVzKFxuICAgICAgICAgICAgICAgIHBvbHlnb25zW21wY10sXG4gICAgICAgICAgICAgICAgc3R5bGUueixcbiAgICAgICAgICAgICAgICBzdHlsZS5vdXRsaW5lLndpZHRoLFxuICAgICAgICAgICAgICAgIHZlcnRleF9kYXRhLFxuICAgICAgICAgICAgICAgIHtcbiAgICAgICAgICAgICAgICAgICAgY2xvc2VkX3BvbHlnb246IHRydWUsXG4gICAgICAgICAgICAgICAgICAgIHJlbW92ZV90aWxlX2VkZ2VzOiB0cnVlLFxuICAgICAgICAgICAgICAgICAgICB2ZXJ0ZXhfY29uc3RhbnRzOiBvdXRsaW5lX3ZlcnRleF9jb25zdGFudHNcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICApO1xuICAgICAgICB9XG4gICAgfVxufTtcblxuTW9kZXMucG9seWdvbnMuYnVpbGRMaW5lcyA9IGZ1bmN0aW9uIChsaW5lcywgc3R5bGUsIHZlcnRleF9kYXRhKVxue1xuICAgIC8vIFRPT0Q6IHJlZHVjZSByZWR1bmRhbmN5IG9mIGNvbnN0YW50IGNhbGMgYmV0d2VlbiBidWlsZGVyc1xuICAgIC8vIENvbG9yIGFuZCBsYXllciBudW1iZXIgYXJlIGN1cnJlbnRseSBjb25zdGFudCBhY3Jvc3MgdmVydGljZXNcbiAgICB2YXIgdmVydGV4X2NvbnN0YW50cyA9IFtcbiAgICAgICAgc3R5bGUuY29sb3JbMF0sIHN0eWxlLmNvbG9yWzFdLCBzdHlsZS5jb2xvclsyXSxcbiAgICAgICAgc3R5bGUuc2VsZWN0aW9uLmNvbG9yWzBdLCBzdHlsZS5zZWxlY3Rpb24uY29sb3JbMV0sIHN0eWxlLnNlbGVjdGlvbi5jb2xvclsyXSwgc3R5bGUuc2VsZWN0aW9uLmNvbG9yWzNdLFxuICAgICAgICBzdHlsZS5sYXllcl9udW1cbiAgICBdO1xuXG4gICAgLy8gT3V0bGluZXMgaGF2ZSBhIHNsaWdodGx5IGRpZmZlcmVudCBzZXQgb2YgY29uc3RhbnRzLCBiZWNhdXNlIHRoZSBsYXllciBudW1iZXIgaXMgbW9kaWZpZWRcbiAgICBpZiAoc3R5bGUub3V0bGluZS5jb2xvcikge1xuICAgICAgICB2YXIgb3V0bGluZV92ZXJ0ZXhfY29uc3RhbnRzID0gW1xuICAgICAgICAgICAgc3R5bGUub3V0bGluZS5jb2xvclswXSwgc3R5bGUub3V0bGluZS5jb2xvclsxXSwgc3R5bGUub3V0bGluZS5jb2xvclsyXSxcbiAgICAgICAgICAgIHN0eWxlLnNlbGVjdGlvbi5jb2xvclswXSwgc3R5bGUuc2VsZWN0aW9uLmNvbG9yWzFdLCBzdHlsZS5zZWxlY3Rpb24uY29sb3JbMl0sIHN0eWxlLnNlbGVjdGlvbi5jb2xvclszXSxcbiAgICAgICAgICAgIHN0eWxlLmxheWVyX251bSAtIDAuNSAvLyBvdXRsaW5lcyBzaXQgYmV0d2VlbiBsYXllcnMsIHVuZGVybmVhdGggY3VycmVudCBsYXllciBidXQgYWJvdmUgdGhlIG9uZSBiZWxvd1xuICAgICAgICBdO1xuICAgIH1cblxuICAgIC8vIE1haW4gbGluZXNcbiAgICBHTEJ1aWxkZXJzLmJ1aWxkUG9seWxpbmVzKFxuICAgICAgICBsaW5lcyxcbiAgICAgICAgc3R5bGUueixcbiAgICAgICAgc3R5bGUud2lkdGgsXG4gICAgICAgIHZlcnRleF9kYXRhLFxuICAgICAgICB7XG4gICAgICAgICAgICB2ZXJ0ZXhfY29uc3RhbnRzOiB2ZXJ0ZXhfY29uc3RhbnRzXG4gICAgICAgIH1cbiAgICApO1xuXG4gICAgLy8gTGluZSBvdXRsaW5lc1xuICAgIGlmIChzdHlsZS5vdXRsaW5lLmNvbG9yICYmIHN0eWxlLm91dGxpbmUud2lkdGgpIHtcbiAgICAgICAgR0xCdWlsZGVycy5idWlsZFBvbHlsaW5lcyhcbiAgICAgICAgICAgIGxpbmVzLFxuICAgICAgICAgICAgc3R5bGUueixcbiAgICAgICAgICAgIHN0eWxlLndpZHRoICsgMiAqIHN0eWxlLm91dGxpbmUud2lkdGgsXG4gICAgICAgICAgICB2ZXJ0ZXhfZGF0YSxcbiAgICAgICAgICAgIHtcbiAgICAgICAgICAgICAgICB2ZXJ0ZXhfY29uc3RhbnRzOiBvdXRsaW5lX3ZlcnRleF9jb25zdGFudHNcbiAgICAgICAgICAgIH1cbiAgICAgICAgKTtcbiAgICB9XG59O1xuXG5Nb2Rlcy5wb2x5Z29ucy5idWlsZFBvaW50cyA9IGZ1bmN0aW9uIChwb2ludHMsIHN0eWxlLCB2ZXJ0ZXhfZGF0YSlcbntcbiAgICAvLyBUT09EOiByZWR1Y2UgcmVkdW5kYW5jeSBvZiBjb25zdGFudCBjYWxjIGJldHdlZW4gYnVpbGRlcnNcbiAgICAvLyBDb2xvciBhbmQgbGF5ZXIgbnVtYmVyIGFyZSBjdXJyZW50bHkgY29uc3RhbnQgYWNyb3NzIHZlcnRpY2VzXG4gICAgdmFyIHZlcnRleF9jb25zdGFudHMgPSBbXG4gICAgICAgIHN0eWxlLmNvbG9yWzBdLCBzdHlsZS5jb2xvclsxXSwgc3R5bGUuY29sb3JbMl0sXG4gICAgICAgIHN0eWxlLnNlbGVjdGlvbi5jb2xvclswXSwgc3R5bGUuc2VsZWN0aW9uLmNvbG9yWzFdLCBzdHlsZS5zZWxlY3Rpb24uY29sb3JbMl0sIHN0eWxlLnNlbGVjdGlvbi5jb2xvclszXSxcbiAgICAgICAgc3R5bGUubGF5ZXJfbnVtXG4gICAgXTtcblxuICAgIEdMQnVpbGRlcnMuYnVpbGRRdWFkc0ZvclBvaW50cyhcbiAgICAgICAgcG9pbnRzLFxuICAgICAgICBzdHlsZS5zaXplICogMixcbiAgICAgICAgc3R5bGUuc2l6ZSAqIDIsXG4gICAgICAgIHN0eWxlLnosXG4gICAgICAgIHZlcnRleF9kYXRhLFxuICAgICAgICB7XG4gICAgICAgICAgICBub3JtYWxzOiB0cnVlLFxuICAgICAgICAgICAgdGV4Y29vcmRzOiBmYWxzZSxcbiAgICAgICAgICAgIHZlcnRleF9jb25zdGFudHM6IHZlcnRleF9jb25zdGFudHNcbiAgICAgICAgfVxuICAgICk7XG59O1xuXG5cbi8qKiogUG9pbnRzIHcvc2ltcGxlIGRpc3RhbmNlIGZpZWxkIHJlbmRlcmluZyAqKiovXG5cbk1vZGVzLnBvaW50cyA9IE9iamVjdC5jcmVhdGUoUmVuZGVyTW9kZSk7XG5Nb2Rlcy5wb2ludHMubmFtZSA9ICdwb2ludHMnO1xuXG5Nb2Rlcy5wb2ludHMudmVydGV4X3NoYWRlcl9rZXkgPSAncG9pbnRfdmVydGV4Jztcbk1vZGVzLnBvaW50cy5mcmFnbWVudF9zaGFkZXJfa2V5ID0gJ3BvaW50X2ZyYWdtZW50JztcblxuTW9kZXMucG9pbnRzLmRlZmluZXMgPSB7XG4gICAgJ0VGRkVDVF9TQ1JFRU5fQ09MT1InOiB0cnVlXG59O1xuXG5Nb2Rlcy5wb2ludHMuc2VsZWN0aW9uID0gdHJ1ZTtcblxuTW9kZXMucG9pbnRzLl9pbml0ID0gZnVuY3Rpb24gKCkge1xuICAgIHRoaXMudmVydGV4X2xheW91dCA9IG5ldyBHTFZlcnRleExheW91dCh0aGlzLmdsLCBbXG4gICAgICAgIHsgbmFtZTogJ2FfcG9zaXRpb24nLCBzaXplOiAzLCB0eXBlOiB0aGlzLmdsLkZMT0FULCBub3JtYWxpemVkOiBmYWxzZSB9LFxuICAgICAgICB7IG5hbWU6ICdhX3RleGNvb3JkJywgc2l6ZTogMiwgdHlwZTogdGhpcy5nbC5GTE9BVCwgbm9ybWFsaXplZDogZmFsc2UgfSxcbiAgICAgICAgeyBuYW1lOiAnYV9jb2xvcicsIHNpemU6IDMsIHR5cGU6IHRoaXMuZ2wuRkxPQVQsIG5vcm1hbGl6ZWQ6IGZhbHNlIH0sXG4gICAgICAgIHsgbmFtZTogJ2Ffc2VsZWN0aW9uX2NvbG9yJywgc2l6ZTogNCwgdHlwZTogdGhpcy5nbC5GTE9BVCwgbm9ybWFsaXplZDogZmFsc2UgfSxcbiAgICAgICAgeyBuYW1lOiAnYV9sYXllcicsIHNpemU6IDEsIHR5cGU6IHRoaXMuZ2wuRkxPQVQsIG5vcm1hbGl6ZWQ6IGZhbHNlIH1cbiAgICBdKTtcbn07XG5cbk1vZGVzLnBvaW50cy5idWlsZFBvaW50cyA9IGZ1bmN0aW9uIChwb2ludHMsIHN0eWxlLCB2ZXJ0ZXhfZGF0YSlcbntcbiAgICAvLyBUT09EOiByZWR1Y2UgcmVkdW5kYW5jeSBvZiBjb25zdGFudCBjYWxjIGJldHdlZW4gYnVpbGRlcnNcbiAgICAvLyBDb2xvciBhbmQgbGF5ZXIgbnVtYmVyIGFyZSBjdXJyZW50bHkgY29uc3RhbnQgYWNyb3NzIHZlcnRpY2VzXG4gICAgdmFyIHZlcnRleF9jb25zdGFudHMgPSBbXG4gICAgICAgIHN0eWxlLmNvbG9yWzBdLCBzdHlsZS5jb2xvclsxXSwgc3R5bGUuY29sb3JbMl0sXG4gICAgICAgIHN0eWxlLnNlbGVjdGlvbi5jb2xvclswXSwgc3R5bGUuc2VsZWN0aW9uLmNvbG9yWzFdLCBzdHlsZS5zZWxlY3Rpb24uY29sb3JbMl0sIHN0eWxlLnNlbGVjdGlvbi5jb2xvclszXSxcbiAgICAgICAgc3R5bGUubGF5ZXJfbnVtXG4gICAgXTtcblxuICAgIEdMQnVpbGRlcnMuYnVpbGRRdWFkc0ZvclBvaW50cyhcbiAgICAgICAgcG9pbnRzLFxuICAgICAgICBzdHlsZS5zaXplICogMixcbiAgICAgICAgc3R5bGUuc2l6ZSAqIDIsXG4gICAgICAgIHN0eWxlLnosXG4gICAgICAgIHZlcnRleF9kYXRhLFxuICAgICAgICB7XG4gICAgICAgICAgICBub3JtYWxzOiBmYWxzZSxcbiAgICAgICAgICAgIHRleGNvb3JkczogdHJ1ZSxcbiAgICAgICAgICAgIHZlcnRleF9jb25zdGFudHM6IHZlcnRleF9jb25zdGFudHNcbiAgICAgICAgfVxuICAgICk7XG59O1xuIiwiLy8gVGhpbiBHTCBwcm9ncmFtIHdyYXBwIHRvIGNhY2hlIHVuaWZvcm0gbG9jYXRpb25zL3ZhbHVlcywgZG8gY29tcGlsZS10aW1lIHByZS1wcm9jZXNzaW5nXG4vLyAoaW5qZWN0aW5nICNkZWZpbmVzIGFuZCAjcHJhZ21hIHRyYW5zZm9ybXMgaW50byBzaGFkZXJzKSwgZXRjLlxuaW1wb3J0ICogYXMgVXRpbHMgZnJvbSAnLi4vdXRpbHMnO1xuaW1wb3J0IHtHTH0gZnJvbSAnLi9nbCc7XG5pbXBvcnQgR0xUZXh0dXJlIGZyb20gJy4vZ2xfdGV4dHVyZSc7XG5pbXBvcnQgKiBhcyBRdWV1ZSBmcm9tICdxdWV1ZS1hc3luYyc7XG5cbkdMUHJvZ3JhbS5pZCA9IDA7IC8vIGFzc2lnbiBlYWNoIHByb2dyYW0gYSB1bmlxdWUgaWRcbkdMUHJvZ3JhbS5wcm9ncmFtcyA9IHt9OyAvLyBwcm9ncmFtcywgYnkgaWRcblxuZXhwb3J0IGRlZmF1bHQgZnVuY3Rpb24gR0xQcm9ncmFtIChnbCwgdmVydGV4X3NoYWRlciwgZnJhZ21lbnRfc2hhZGVyLCBvcHRpb25zKVxue1xuICAgIG9wdGlvbnMgPSBvcHRpb25zIHx8IHt9O1xuXG4gICAgdGhpcy5nbCA9IGdsO1xuICAgIHRoaXMucHJvZ3JhbSA9IG51bGw7XG4gICAgdGhpcy5jb21waWxlZCA9IGZhbHNlO1xuICAgIHRoaXMuZGVmaW5lcyA9IG9wdGlvbnMuZGVmaW5lcyB8fCB7fTsgLy8ga2V5L3ZhbHVlcyBpbnNlcnRlZCBhcyAjZGVmaW5lcyBpbnRvIHNoYWRlcnMgYXQgY29tcGlsZS10aW1lXG4gICAgdGhpcy50cmFuc2Zvcm1zID0gb3B0aW9ucy50cmFuc2Zvcm1zIHx8IHt9OyAvLyBrZXkvdmFsdWVzIGZvciBVUkxzIG9mIGJsb2NrcyB0aGF0IGNhbiBiZSBpbmplY3RlZCBpbnRvIHNoYWRlcnMgYXQgY29tcGlsZS10aW1lXG4gICAgdGhpcy51bmlmb3JtcyA9IHt9OyAvLyBwcm9ncmFtIGxvY2F0aW9ucyBvZiB1bmlmb3Jtcywgc2V0L3VwZGF0ZWQgYXQgY29tcGlsZS10aW1lXG4gICAgdGhpcy5hdHRyaWJzID0ge307IC8vIHByb2dyYW0gbG9jYXRpb25zIG9mIHZlcnRleCBhdHRyaWJ1dGVzXG5cbiAgICB0aGlzLnZlcnRleF9zaGFkZXIgPSB2ZXJ0ZXhfc2hhZGVyO1xuICAgIHRoaXMuZnJhZ21lbnRfc2hhZGVyID0gZnJhZ21lbnRfc2hhZGVyO1xuXG4gICAgdGhpcy5pZCA9IEdMUHJvZ3JhbS5pZCsrO1xuICAgIEdMUHJvZ3JhbS5wcm9ncmFtc1t0aGlzLmlkXSA9IHRoaXM7XG4gICAgdGhpcy5uYW1lID0gb3B0aW9ucy5uYW1lOyAvLyBjYW4gcHJvdmlkZSBhIHByb2dyYW0gbmFtZSAodXNlZnVsIGZvciBkZWJ1Z2dpbmcpXG5cbiAgICB0aGlzLmNvbXBpbGUob3B0aW9ucy5jYWxsYmFjayk7XG59O1xuXG4vLyBVc2UgcHJvZ3JhbSB3cmFwcGVyIHdpdGggc2ltcGxlIHN0YXRlIGNhY2hlXG5HTFByb2dyYW0ucHJvdG90eXBlLnVzZSA9IGZ1bmN0aW9uICgpXG57XG4gICAgaWYgKCF0aGlzLmNvbXBpbGVkKSB7XG4gICAgICAgIHJldHVybjtcbiAgICB9XG5cbiAgICBpZiAoR0xQcm9ncmFtLmN1cnJlbnQgIT0gdGhpcykge1xuICAgICAgICB0aGlzLmdsLnVzZVByb2dyYW0odGhpcy5wcm9ncmFtKTtcbiAgICB9XG4gICAgR0xQcm9ncmFtLmN1cnJlbnQgPSB0aGlzO1xufTtcbkdMUHJvZ3JhbS5jdXJyZW50ID0gbnVsbDtcblxuLy8gR2xvYmFsIGNvbmZpZyBhcHBsaWVkIHRvIGFsbCBwcm9ncmFtcyAoZHVwbGljYXRlIHByb3BlcnRpZXMgZm9yIGEgc3BlY2lmaWMgcHJvZ3JhbSB3aWxsIHRha2UgcHJlY2VkZW5jZSlcbkdMUHJvZ3JhbS5kZWZpbmVzID0ge307XG5HTFByb2dyYW0udHJhbnNmb3JtcyA9IHt9O1xuXG5HTFByb2dyYW0uYWRkVHJhbnNmb3JtID0gZnVuY3Rpb24gKGtleSwgLi4udHJhbnNmb3Jtcykge1xuICAgIEdMUHJvZ3JhbS50cmFuc2Zvcm1zW2tleV0gPSBHTFByb2dyYW0udHJhbnNmb3Jtc1trZXldIHx8IFtdO1xuICAgIEdMUHJvZ3JhbS50cmFuc2Zvcm1zW2tleV0ucHVzaCguLi50cmFuc2Zvcm1zKTtcbn07XG5cbi8vIFJlbW92ZSBhbGwgZ2xvYmFsIHNoYWRlciB0cmFuc2Zvcm1zIGZvciBhIGdpdmVuIGtleVxuR0xQcm9ncmFtLnJlbW92ZVRyYW5zZm9ybSA9IGZ1bmN0aW9uIChrZXkpIHtcbiAgICBHTFByb2dyYW0udHJhbnNmb3Jtc1trZXldID0gW107XG59O1xuXG5HTFByb2dyYW0ucHJvdG90eXBlLmNvbXBpbGUgPSBmdW5jdGlvbiAoY2FsbGJhY2spXG57XG4gICAgdmFyIHF1ZXVlID0gUXVldWUoKTtcblxuICAgIC8vIENvcHkgc291cmNlcyBmcm9tIHByZS1tb2RpZmllZCB0ZW1wbGF0ZVxuICAgIHRoaXMuY29tcHV0ZWRfdmVydGV4X3NoYWRlciA9IHRoaXMudmVydGV4X3NoYWRlcjtcbiAgICB0aGlzLmNvbXB1dGVkX2ZyYWdtZW50X3NoYWRlciA9IHRoaXMuZnJhZ21lbnRfc2hhZGVyO1xuXG4gICAgLy8gTWFrZSBsaXN0IG9mIGRlZmluZXMgdG8gYmUgaW5qZWN0ZWQgbGF0ZXJcbiAgICB2YXIgZGVmaW5lcyA9IHRoaXMuYnVpbGREZWZpbmVMaXN0KCk7XG5cbiAgICAvLyBJbmplY3QgdXNlci1kZWZpbmVkIHRyYW5zZm9ybXMgKGFyYml0cmFyeSBjb2RlIHBvaW50cyBtYXRjaGluZyBuYW1lZCAjcHJhZ21hcylcbiAgICAvLyBSZXBsYWNlIGFjY29yZGluZyB0byB0aGlzIHBhdHRlcm46XG4gICAgLy8gI3ByYWdtYSB0YW5ncmFtOiBba2V5XVxuICAgIC8vIGUuZy4gI3ByYWdtYSB0YW5ncmFtOiBnbG9iYWxzXG5cbiAgICAvLyBUT0RPOiBmbGFnIHRvIGF2b2lkIHJlLXJldHJpZXZpbmcgdHJhbnNmb3JtIFVSTHMgb3ZlciBuZXR3b3JrIHdoZW4gcmVidWlsZGluZz9cbiAgICAvLyBUT0RPOiBzdXBwb3J0IGdsc2xpZnkgI3ByYWdtYSBleHBvcnQgbmFtZXMgZm9yIGJldHRlciBjb21wYXRpYmlsaXR5PyAoZS5nLiByZW5hbWUgbWFpbigpIGZ1bmN0aW9ucylcbiAgICAvLyBUT0RPOiBhdXRvLWluc2VydCB1bmlmb3JtcyByZWZlcmVuY2VkIGluIG1vZGUgZGVmaW5pdGlvbiwgYnV0IG5vdCBpbiBzaGFkZXIgYmFzZSBvciB0cmFuc2Zvcm1zPyAocHJvYmxlbTogZG9uJ3QgaGF2ZSBhY2Nlc3MgdG8gdW5pZm9ybSBsaXN0L3R5cGUgaGVyZSlcblxuICAgIC8vIEdhdGhlciBhbGwgdHJhbnNmb3JtIGNvZGUgc25pcHBldHMgKGNhbiBiZSBlaXRoZXIgaW5saW5lIGluIHRoZSBzdHlsZSBmaWxlLCBvciBvdmVyIHRoZSBuZXR3b3JrIHZpYSBVUkwpXG4gICAgLy8gVGhpcyBpcyBhbiBhc3luYyBwcm9jZXNzLCBzaW5jZSBjb2RlIG1heSBiZSByZXRyaWV2ZWQgcmVtb3RlbHlcbiAgICB2YXIgdHJhbnNmb3JtcyA9IHRoaXMuYnVpbGRTaGFkZXJUcmFuc2Zvcm1MaXN0KCk7XG4gICAgdmFyIGxvYWRlZF90cmFuc2Zvcm1zID0ge307IC8vIG1hc3RlciBsaXN0IG9mIHRyYW5zZm9ybXMsIHdpdGggYW4gb3JkZXJlZCBsaXN0IGZvciBlYWNoIChzaW5jZSB3ZSB3YW50IHRvIGd1YXJhbnRlZSBvcmRlciBvZiB0cmFuc2Zvcm1zKVxuICAgIHZhciByZWdleHA7XG5cbiAgICBmb3IgKHZhciBrZXkgaW4gdHJhbnNmb3Jtcykge1xuICAgICAgICB2YXIgdHJhbnNmb3JtID0gdHJhbnNmb3Jtc1trZXldO1xuICAgICAgICBpZiAodHJhbnNmb3JtID09IG51bGwpIHtcbiAgICAgICAgICAgIGNvbnRpbnVlO1xuICAgICAgICB9XG5cbiAgICAgICAgLy8gRWFjaCBjb2RlIHBvaW50IGNhbiBiZSBhIHNpbmdsZSBpdGVtIChzdHJpbmcgb3IgaGFzaCBvYmplY3QpIG9yIGEgbGlzdCAoYXJyYXkgb2JqZWN0IHdpdGggbm9uLXplcm8gbGVuZ3RoKVxuICAgICAgICBpZiAoISh0eXBlb2YgdHJhbnNmb3JtID09PSAnb2JqZWN0JyAmJiB0cmFuc2Zvcm0ubGVuZ3RoID49IDApKSB7XG4gICAgICAgICAgICB0cmFuc2Zvcm0gPSBbdHJhbnNmb3JtXTtcbiAgICAgICAgfVxuXG4gICAgICAgIC8vIEZpcnN0IGZpbmQgY29kZSByZXBsYWNlIHBvaW50cyBpbiBzaGFkZXJzXG4gICAgICAgIHZhciByZWdleHAgPSBuZXcgUmVnRXhwKCdeXFxcXHMqI3ByYWdtYVxcXFxzK3RhbmdyYW06XFxcXHMrJyArIGtleSArICdcXFxccyokJywgJ20nKTtcbiAgICAgICAgdmFyIGluamVjdF92ZXJ0ZXggPSB0aGlzLmNvbXB1dGVkX3ZlcnRleF9zaGFkZXIubWF0Y2gocmVnZXhwKTtcbiAgICAgICAgdmFyIGluamVjdF9mcmFnbWVudCA9IHRoaXMuY29tcHV0ZWRfZnJhZ21lbnRfc2hhZGVyLm1hdGNoKHJlZ2V4cCk7XG5cbiAgICAgICAgLy8gQXZvaWQgbmV0d29yayByZXF1ZXN0IGlmIG5vdGhpbmcgdG8gcmVwbGFjZVxuICAgICAgICBpZiAoaW5qZWN0X3ZlcnRleCA9PSBudWxsICYmIGluamVjdF9mcmFnbWVudCA9PSBudWxsKSB7XG4gICAgICAgICAgICBjb250aW51ZTtcbiAgICAgICAgfVxuXG4gICAgICAgIC8vIENvbGxlY3QgYWxsIHRyYW5zZm9ybXMgZm9yIHRoaXMgdHlwZVxuICAgICAgICBsb2FkZWRfdHJhbnNmb3Jtc1trZXldID0ge307XG4gICAgICAgIGxvYWRlZF90cmFuc2Zvcm1zW2tleV0ucmVnZXhwID0gbmV3IFJlZ0V4cChyZWdleHApOyAvLyBzYXZlIHJlZ2V4cCBzbyB3ZSBjYW4gaW5qZWN0IGxhdGVyIHdpdGhvdXQgaGF2aW5nIHRvIHJlY3JlYXRlIGl0XG4gICAgICAgIGxvYWRlZF90cmFuc2Zvcm1zW2tleV0uaW5qZWN0X3ZlcnRleCA9IChpbmplY3RfdmVydGV4ICE9IG51bGwpOyAvLyBzYXZlIHJlZ2V4cCBjb2RlIHBvaW50IG1hdGNoZXMgc28gd2UgZG9uJ3QgaGF2ZSB0byBkbyB0aGVtIGFnYWluXG4gICAgICAgIGxvYWRlZF90cmFuc2Zvcm1zW2tleV0uaW5qZWN0X2ZyYWdtZW50ID0gKGluamVjdF9mcmFnbWVudCAhPSBudWxsKTtcbiAgICAgICAgbG9hZGVkX3RyYW5zZm9ybXNba2V5XS5saXN0ID0gW107XG5cbiAgICAgICAgLy8gR2V0IHRoZSBjb2RlIChwb3NzaWJseSBvdmVyIHRoZSBuZXR3b3JrLCBzbyBuZWVkcyB0byBiZSBhc3luYylcbiAgICAgICAgZm9yICh2YXIgdT0wOyB1IDwgdHJhbnNmb3JtLmxlbmd0aDsgdSsrKSB7XG4gICAgICAgICAgICBxdWV1ZS5kZWZlcihHTFByb2dyYW0ubG9hZFRyYW5zZm9ybSwgbG9hZGVkX3RyYW5zZm9ybXMsIHRyYW5zZm9ybVt1XSwga2V5LCB1KTtcbiAgICAgICAgfVxuXG4gICAgICAgIC8vIEFkZCBhICNkZWZpbmUgZm9yIHRoaXMgaW5qZWN0aW9uIHBvaW50XG4gICAgICAgIGRlZmluZXNbJ1RBTkdSQU1fVFJBTlNGT1JNXycgKyBrZXkucmVwbGFjZSgnICcsICdfJykudG9VcHBlckNhc2UoKV0gPSB0cnVlO1xuICAgIH1cblxuICAgIC8vIFdoZW4gYWxsIHRyYW5zZm9ybSBjb2RlIHNuaXBwZXRzIGFyZSBjb2xsZWN0ZWQsIGNvbWJpbmUgYW5kIGluamVjdCB0aGVtXG4gICAgcXVldWUuYXdhaXQoZXJyb3IgPT4ge1xuICAgICAgICBpZiAoZXJyb3IpIHtcbiAgICAgICAgICAgIGNvbnNvbGUubG9nKFwiZXJyb3IgbG9hZGluZyB0cmFuc2Zvcm1zOiBcIiArIGVycm9yKTtcbiAgICAgICAgICAgIHJldHVybjtcbiAgICAgICAgfVxuXG4gICAgICAgIC8vIERvIHRoZSBjb2RlIGluamVjdGlvbiB3aXRoIHRoZSBjb2xsZWN0ZWQgc291cmNlc1xuICAgICAgICBmb3IgKHZhciB0IGluIGxvYWRlZF90cmFuc2Zvcm1zKSB7XG4gICAgICAgICAgICAvLyBDb25jYXRlbmF0ZVxuICAgICAgICAgICAgdmFyIGNvbWJpbmVkX3NvdXJjZSA9IFwiXCI7XG4gICAgICAgICAgICBmb3IgKHZhciBzPTA7IHMgPCBsb2FkZWRfdHJhbnNmb3Jtc1t0XS5saXN0Lmxlbmd0aDsgcysrKSB7XG4gICAgICAgICAgICAgICAgY29tYmluZWRfc291cmNlICs9IGxvYWRlZF90cmFuc2Zvcm1zW3RdLmxpc3Rbc10gKyAnXFxuJztcbiAgICAgICAgICAgIH1cblxuICAgICAgICAgICAgLy8gSW5qZWN0XG4gICAgICAgICAgICBpZiAobG9hZGVkX3RyYW5zZm9ybXNbdF0uaW5qZWN0X3ZlcnRleCAhPSBudWxsKSB7XG4gICAgICAgICAgICAgICAgdGhpcy5jb21wdXRlZF92ZXJ0ZXhfc2hhZGVyID0gdGhpcy5jb21wdXRlZF92ZXJ0ZXhfc2hhZGVyLnJlcGxhY2UobG9hZGVkX3RyYW5zZm9ybXNbdF0ucmVnZXhwLCBjb21iaW5lZF9zb3VyY2UpO1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgaWYgKGxvYWRlZF90cmFuc2Zvcm1zW3RdLmluamVjdF9mcmFnbWVudCAhPSBudWxsKSB7XG4gICAgICAgICAgICAgICAgdGhpcy5jb21wdXRlZF9mcmFnbWVudF9zaGFkZXIgPSB0aGlzLmNvbXB1dGVkX2ZyYWdtZW50X3NoYWRlci5yZXBsYWNlKGxvYWRlZF90cmFuc2Zvcm1zW3RdLnJlZ2V4cCwgY29tYmluZWRfc291cmNlKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgfVxuXG4gICAgICAgIC8vIENsZWFuLXVwIGFueSAjcHJhZ21hcyB0aGF0IHdlcmVuJ3QgcmVwbGFjZWQgKHRvIHByZXZlbnQgY29tcGlsZXIgd2FybmluZ3MpXG4gICAgICAgIHZhciByZWdleHAgPSBuZXcgUmVnRXhwKCdeXFxcXHMqI3ByYWdtYVxcXFxzK3RhbmdyYW06XFxcXHMrXFxcXHcrXFxcXHMqJCcsICdnbScpO1xuICAgICAgICB0aGlzLmNvbXB1dGVkX3ZlcnRleF9zaGFkZXIgPSB0aGlzLmNvbXB1dGVkX3ZlcnRleF9zaGFkZXIucmVwbGFjZShyZWdleHAsICcnKTtcbiAgICAgICAgdGhpcy5jb21wdXRlZF9mcmFnbWVudF9zaGFkZXIgPSB0aGlzLmNvbXB1dGVkX2ZyYWdtZW50X3NoYWRlci5yZXBsYWNlKHJlZ2V4cCwgJycpO1xuXG4gICAgICAgIC8vIEJ1aWxkICYgaW5qZWN0IGRlZmluZXNcbiAgICAgICAgLy8gVGhpcyBpcyBkb25lICphZnRlciogY29kZSBpbmplY3Rpb24gc28gdGhhdCB3ZSBjYW4gYWRkIGRlZmluZXMgZm9yIHdoaWNoIGNvZGUgcG9pbnRzIHdlcmUgaW5qZWN0ZWRcbiAgICAgICAgdmFyIGRlZmluZV9zdHIgPSBHTFByb2dyYW0uYnVpbGREZWZpbmVTdHJpbmcoZGVmaW5lcyk7XG4gICAgICAgIHRoaXMuY29tcHV0ZWRfdmVydGV4X3NoYWRlciA9IGRlZmluZV9zdHIgKyB0aGlzLmNvbXB1dGVkX3ZlcnRleF9zaGFkZXI7XG4gICAgICAgIHRoaXMuY29tcHV0ZWRfZnJhZ21lbnRfc2hhZGVyID0gZGVmaW5lX3N0ciArIHRoaXMuY29tcHV0ZWRfZnJhZ21lbnRfc2hhZGVyO1xuXG4gICAgICAgIC8vIEluY2x1ZGUgcHJvZ3JhbSBpbmZvIHVzZWZ1bCBmb3IgZGVidWdnaW5nXG4gICAgICAgIHZhciBpbmZvID0gKHRoaXMubmFtZSA/ICh0aGlzLm5hbWUgKyAnIC8gaWQgJyArIHRoaXMuaWQpIDogKCdpZCAnICsgdGhpcy5pZCkpO1xuICAgICAgICB0aGlzLmNvbXB1dGVkX3ZlcnRleF9zaGFkZXIgPSAnLy8gUHJvZ3JhbTogJyArIGluZm8gKyAnXFxuJyArIHRoaXMuY29tcHV0ZWRfdmVydGV4X3NoYWRlcjtcbiAgICAgICAgdGhpcy5jb21wdXRlZF9mcmFnbWVudF9zaGFkZXIgPSAnLy8gUHJvZ3JhbTogJyArIGluZm8gKyAnXFxuJyArIHRoaXMuY29tcHV0ZWRfZnJhZ21lbnRfc2hhZGVyO1xuXG4gICAgICAgIC8vIENvbXBpbGUgJiBzZXQgdW5pZm9ybXMgdG8gY2FjaGVkIHZhbHVlc1xuICAgICAgICB0cnkge1xuICAgICAgICAgICAgdGhpcy5wcm9ncmFtID0gR0wudXBkYXRlUHJvZ3JhbSh0aGlzLmdsLCB0aGlzLnByb2dyYW0sIHRoaXMuY29tcHV0ZWRfdmVydGV4X3NoYWRlciwgdGhpcy5jb21wdXRlZF9mcmFnbWVudF9zaGFkZXIpO1xuICAgICAgICAgICAgLy8gdGhpcy5wcm9ncmFtID0gR0wudXBkYXRlUHJvZ3JhbSh0aGlzLmdsLCBudWxsLCB0aGlzLmNvbXB1dGVkX3ZlcnRleF9zaGFkZXIsIHRoaXMuY29tcHV0ZWRfZnJhZ21lbnRfc2hhZGVyKTtcbiAgICAgICAgICAgIHRoaXMuY29tcGlsZWQgPSB0cnVlO1xuICAgICAgICB9XG4gICAgICAgIGNhdGNoIChlKSB7XG4gICAgICAgICAgICB0aGlzLnByb2dyYW0gPSBudWxsO1xuICAgICAgICAgICAgdGhpcy5jb21waWxlZCA9IGZhbHNlO1xuICAgICAgICB9XG5cbiAgICAgICAgdGhpcy51c2UoKTtcbiAgICAgICAgdGhpcy5yZWZyZXNoVW5pZm9ybXMoKTtcbiAgICAgICAgdGhpcy5yZWZyZXNoQXR0cmlidXRlcygpO1xuXG4gICAgICAgIC8vIE5vdGlmeSBjYWxsZXJcbiAgICAgICAgaWYgKHR5cGVvZiBjYWxsYmFjayA9PSAnZnVuY3Rpb24nKSB7XG4gICAgICAgICAgICBjYWxsYmFjaygpO1xuICAgICAgICB9XG4gICAgfSk7XG59O1xuXG4vLyBSZXRyaWV2ZSBhIHNpbmdsZSB0cmFuc2Zvcm0sIGZvciBhIGdpdmVuIGluamVjdGlvbiBwb2ludCwgYXQgYSBjZXJ0YWluIGluZGV4ICh0byBwcmVzZXJ2ZSBvcmlnaW5hbCBvcmRlcilcbi8vIENhbiBiZSBhc3luYywgY2FsbHMgJ2NvbXBsZXRlJyBjYWxsYmFjayB3aGVuIGRvbmVcbkdMUHJvZ3JhbS5sb2FkVHJhbnNmb3JtID0gZnVuY3Rpb24gKHRyYW5zZm9ybXMsIGJsb2NrLCBrZXksIGluZGV4LCBjb21wbGV0ZSkge1xuICAgIC8vIENhbiBiZSBhbiBpbmxpbmUgYmxvY2sgb2YgR0xTTCwgb3IgYSBVUkwgdG8gcmV0cmlldmUgR0xTTCBibG9jayBmcm9tXG4gICAgdmFyIHR5cGUsIHZhbHVlLCBzb3VyY2U7XG5cbiAgICAvLyBJbmxpbmUgY29kZVxuICAgIGlmICh0eXBlb2YgYmxvY2sgPT0gJ3N0cmluZycpIHtcbiAgICAgICAgdHJhbnNmb3Jtc1trZXldLmxpc3RbaW5kZXhdID0gYmxvY2s7XG4gICAgICAgIGNvbXBsZXRlKCk7XG4gICAgfVxuICAgIC8vIFJlbW90ZSBjb2RlXG4gICAgZWxzZSBpZiAodHlwZW9mIGJsb2NrID09ICdvYmplY3QnICYmIGJsb2NrLnVybCkge1xuICAgICAgICB2YXIgcmVxID0gbmV3IFhNTEh0dHBSZXF1ZXN0KCk7XG5cbiAgICAgICAgcmVxLm9ubG9hZCA9IGZ1bmN0aW9uICgpIHtcbiAgICAgICAgICAgIHNvdXJjZSA9IHJlcS5yZXNwb25zZTtcbiAgICAgICAgICAgIHRyYW5zZm9ybXNba2V5XS5saXN0W2luZGV4XSA9IHNvdXJjZTtcbiAgICAgICAgICAgIGNvbXBsZXRlKCk7XG4gICAgICAgIH07XG4gICAgICAgIHJlcS5vcGVuKCdHRVQnLCBVdGlscy51cmxGb3JQYXRoKGJsb2NrLnVybCkgKyAnPycgKyAoK25ldyBEYXRlKCkpLCB0cnVlIC8qIGFzeW5jIGZsYWcgKi8pO1xuICAgICAgICByZXEucmVzcG9uc2VUeXBlID0gJ3RleHQnO1xuICAgICAgICByZXEuc2VuZCgpO1xuICAgIH1cbn07XG5cbi8vIE1ha2UgbGlzdCBvZiBkZWZpbmVzIChnbG9iYWwsIHRoZW4gcHJvZ3JhbS1zcGVjaWZpYylcbkdMUHJvZ3JhbS5wcm90b3R5cGUuYnVpbGREZWZpbmVMaXN0ID0gZnVuY3Rpb24gKCkge1xuICAgIHZhciBkLCBkZWZpbmVzID0ge307XG4gICAgZm9yIChkIGluIEdMUHJvZ3JhbS5kZWZpbmVzKSB7XG4gICAgICAgIGRlZmluZXNbZF0gPSBHTFByb2dyYW0uZGVmaW5lc1tkXTtcbiAgICB9XG4gICAgZm9yIChkIGluIHRoaXMuZGVmaW5lcykge1xuICAgICAgICBkZWZpbmVzW2RdID0gdGhpcy5kZWZpbmVzW2RdO1xuICAgIH1cbiAgICByZXR1cm4gZGVmaW5lcztcbn07XG5cbi8vIE1ha2UgbGlzdCBvZiBzaGFkZXIgdHJhbnNmb3JtcyAoZ2xvYmFsLCB0aGVuIHByb2dyYW0tc3BlY2lmaWMpXG5HTFByb2dyYW0ucHJvdG90eXBlLmJ1aWxkU2hhZGVyVHJhbnNmb3JtTGlzdCA9IGZ1bmN0aW9uICgpIHtcbiAgICB2YXIgZCwgdHJhbnNmb3JtcyA9IHt9O1xuICAgIGZvciAoZCBpbiBHTFByb2dyYW0udHJhbnNmb3Jtcykge1xuICAgICAgICB0cmFuc2Zvcm1zW2RdID0gW107XG5cbiAgICAgICAgaWYgKHR5cGVvZiBHTFByb2dyYW0udHJhbnNmb3Jtc1tkXSA9PT0gJ29iamVjdCcgJiYgR0xQcm9ncmFtLnRyYW5zZm9ybXNbZF0ubGVuZ3RoID49IDApIHtcbiAgICAgICAgICAgIHRyYW5zZm9ybXNbZF0ucHVzaCguLi5HTFByb2dyYW0udHJhbnNmb3Jtc1tkXSk7XG4gICAgICAgIH1cbiAgICAgICAgZWxzZSB7XG4gICAgICAgICAgICB0cmFuc2Zvcm1zW2RdID0gW0dMUHJvZ3JhbS50cmFuc2Zvcm1zW2RdXTtcbiAgICAgICAgfVxuICAgIH1cbiAgICBmb3IgKGQgaW4gdGhpcy50cmFuc2Zvcm1zKSB7XG4gICAgICAgIHRyYW5zZm9ybXNbZF0gPSB0cmFuc2Zvcm1zW2RdIHx8IFtdO1xuXG4gICAgICAgIGlmICh0eXBlb2YgdGhpcy50cmFuc2Zvcm1zW2RdID09PSAnb2JqZWN0JyAmJiB0aGlzLnRyYW5zZm9ybXNbZF0ubGVuZ3RoID49IDApIHtcbiAgICAgICAgICAgIHRyYW5zZm9ybXNbZF0ucHVzaCguLi50aGlzLnRyYW5zZm9ybXNbZF0pO1xuICAgICAgICB9XG4gICAgICAgIGVsc2Uge1xuICAgICAgICAgICAgdHJhbnNmb3Jtc1tkXS5wdXNoKHRoaXMudHJhbnNmb3Jtc1tkXSk7XG4gICAgICAgIH1cbiAgICB9XG4gICAgcmV0dXJuIHRyYW5zZm9ybXM7XG59O1xuXG4vLyBUdXJuICNkZWZpbmVzIGludG8gYSBjb21iaW5lZCBzdHJpbmdcbkdMUHJvZ3JhbS5idWlsZERlZmluZVN0cmluZyA9IGZ1bmN0aW9uIChkZWZpbmVzKSB7XG4gICAgdmFyIGRlZmluZV9zdHIgPSBcIlwiO1xuICAgIGZvciAodmFyIGQgaW4gZGVmaW5lcykge1xuICAgICAgICBpZiAoZGVmaW5lc1tkXSA9PSBmYWxzZSkge1xuICAgICAgICAgICAgY29udGludWU7XG4gICAgICAgIH1cbiAgICAgICAgZWxzZSBpZiAodHlwZW9mIGRlZmluZXNbZF0gPT0gJ2Jvb2xlYW4nICYmIGRlZmluZXNbZF0gPT0gdHJ1ZSkgeyAvLyBib29sZWFucyBhcmUgc2ltcGxlIGRlZmluZXMgd2l0aCBubyB2YWx1ZVxuICAgICAgICAgICAgZGVmaW5lX3N0ciArPSBcIiNkZWZpbmUgXCIgKyBkICsgXCJcXG5cIjtcbiAgICAgICAgfVxuICAgICAgICBlbHNlIGlmICh0eXBlb2YgZGVmaW5lc1tkXSA9PSAnbnVtYmVyJyAmJiBNYXRoLmZsb29yKGRlZmluZXNbZF0pID09IGRlZmluZXNbZF0pIHsgLy8gaW50IHRvIGZsb2F0IGNvbnZlcnNpb24gdG8gc2F0aXNmeSBHTFNMIGZsb2F0c1xuICAgICAgICAgICAgZGVmaW5lX3N0ciArPSBcIiNkZWZpbmUgXCIgKyBkICsgXCIgXCIgKyBkZWZpbmVzW2RdLnRvRml4ZWQoMSkgKyBcIlxcblwiO1xuICAgICAgICB9XG4gICAgICAgIGVsc2UgeyAvLyBhbnkgb3RoZXIgZmxvYXQgb3Igc3RyaW5nIHZhbHVlXG4gICAgICAgICAgICBkZWZpbmVfc3RyICs9IFwiI2RlZmluZSBcIiArIGQgKyBcIiBcIiArIGRlZmluZXNbZF0gKyBcIlxcblwiO1xuICAgICAgICB9XG4gICAgfVxuICAgIHJldHVybiBkZWZpbmVfc3RyO1xufTtcblxuLy8gU2V0IHVuaWZvcm1zIGZyb20gYSBKUyBvYmplY3QsIHdpdGggaW5mZXJyZWQgdHlwZXNcbkdMUHJvZ3JhbS5wcm90b3R5cGUuc2V0VW5pZm9ybXMgPSBmdW5jdGlvbiAodW5pZm9ybXMpXG57XG4gICAgLy8gVE9ETzogb25seSB1cGRhdGUgdW5pZm9ybXMgd2hlbiBjaGFuZ2VkXG4gICAgdmFyIHRleHR1cmVfdW5pdCA9IDA7XG5cbiAgICBmb3IgKHZhciB1IGluIHVuaWZvcm1zKSB7XG4gICAgICAgIHZhciB1bmlmb3JtID0gdW5pZm9ybXNbdV07XG5cbiAgICAgICAgLy8gU2luZ2xlIGZsb2F0XG4gICAgICAgIGlmICh0eXBlb2YgdW5pZm9ybSA9PSAnbnVtYmVyJykge1xuICAgICAgICAgICAgdGhpcy51bmlmb3JtKCcxZicsIHUsIHVuaWZvcm0pO1xuICAgICAgICB9XG4gICAgICAgIC8vIE11bHRpcGxlIGZsb2F0cyAtIHZlY3RvciBvciBhcnJheVxuICAgICAgICBlbHNlIGlmICh0eXBlb2YgdW5pZm9ybSA9PSAnb2JqZWN0Jykge1xuICAgICAgICAgICAgLy8gZmxvYXQgdmVjdG9ycyAodmVjMiwgdmVjMywgdmVjNClcbiAgICAgICAgICAgIGlmICh1bmlmb3JtLmxlbmd0aCA+PSAyICYmIHVuaWZvcm0ubGVuZ3RoIDw9IDQpIHtcbiAgICAgICAgICAgICAgICB0aGlzLnVuaWZvcm0odW5pZm9ybS5sZW5ndGggKyAnZnYnLCB1LCB1bmlmb3JtKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIC8vIGZsb2F0IGFycmF5XG4gICAgICAgICAgICBlbHNlIGlmICh1bmlmb3JtLmxlbmd0aCA+IDQpIHtcbiAgICAgICAgICAgICAgICB0aGlzLnVuaWZvcm0oJzFmdicsIHUgKyAnWzBdJywgdW5pZm9ybSk7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICAvLyBUT0RPOiBhc3N1bWUgbWF0cml4IGZvciAodHlwZW9mID09IEZsb2F0MzJBcnJheSAmJiBsZW5ndGggPT0gMTYpP1xuICAgICAgICB9XG4gICAgICAgIC8vIEJvb2xlYW5cbiAgICAgICAgZWxzZSBpZiAodHlwZW9mIHVuaWZvcm0gPT0gJ2Jvb2xlYW4nKSB7XG4gICAgICAgICAgICB0aGlzLnVuaWZvcm0oJzFpJywgdSwgdW5pZm9ybSk7XG4gICAgICAgIH1cbiAgICAgICAgLy8gVGV4dHVyZVxuICAgICAgICBlbHNlIGlmICh0eXBlb2YgdW5pZm9ybSA9PSAnc3RyaW5nJykge1xuICAgICAgICAgICAgdmFyIHRleHR1cmUgPSBHTFRleHR1cmUudGV4dHVyZXNbdW5pZm9ybV07XG4gICAgICAgICAgICBpZiAodGV4dHVyZSA9PSBudWxsKSB7XG4gICAgICAgICAgICAgICAgdGV4dHVyZSA9IG5ldyBHTFRleHR1cmUodGhpcy5nbCwgdW5pZm9ybSk7XG4gICAgICAgICAgICAgICAgdGV4dHVyZS5sb2FkKHVuaWZvcm0pO1xuICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICB0ZXh0dXJlLmJpbmQodGV4dHVyZV91bml0KTtcbiAgICAgICAgICAgIHRoaXMudW5pZm9ybSgnMWknLCB1LCB0ZXh0dXJlX3VuaXQpO1xuICAgICAgICAgICAgdGV4dHVyZV91bml0Kys7XG4gICAgICAgIH1cbiAgICAgICAgLy8gVE9ETzogc3VwcG9ydCBvdGhlciBub24tZmxvYXQgdHlwZXM/IChpbnQsIGV0Yy4pXG4gICAgfVxufTtcblxuLy8gZXg6IHByb2dyYW0udW5pZm9ybSgnM2YnLCAncG9zaXRpb24nLCB4LCB5LCB6KTtcbi8vIFRPRE86IG9ubHkgdXBkYXRlIHVuaWZvcm1zIHdoZW4gY2hhbmdlZFxuR0xQcm9ncmFtLnByb3RvdHlwZS51bmlmb3JtID0gZnVuY3Rpb24gKG1ldGhvZCwgbmFtZSkgLy8gbWV0aG9kLWFwcHJvcHJpYXRlIGFyZ3VtZW50cyBmb2xsb3dcbntcbiAgICBpZiAoIXRoaXMuY29tcGlsZWQpIHtcbiAgICAgICAgcmV0dXJuO1xuICAgIH1cblxuICAgIHZhciB1bmlmb3JtID0gKHRoaXMudW5pZm9ybXNbbmFtZV0gPSB0aGlzLnVuaWZvcm1zW25hbWVdIHx8IHt9KTtcbiAgICB1bmlmb3JtLm5hbWUgPSBuYW1lO1xuICAgIHVuaWZvcm0ubG9jYXRpb24gPSB1bmlmb3JtLmxvY2F0aW9uIHx8IHRoaXMuZ2wuZ2V0VW5pZm9ybUxvY2F0aW9uKHRoaXMucHJvZ3JhbSwgbmFtZSk7XG4gICAgdW5pZm9ybS5tZXRob2QgPSAndW5pZm9ybScgKyBtZXRob2Q7XG4gICAgdW5pZm9ybS52YWx1ZXMgPSBBcnJheS5wcm90b3R5cGUuc2xpY2UuY2FsbChhcmd1bWVudHMsIDIpO1xuICAgIHRoaXMudXBkYXRlVW5pZm9ybShuYW1lKTtcbn07XG5cbi8vIFNldCBhIHNpbmdsZSB1bmlmb3JtXG5HTFByb2dyYW0ucHJvdG90eXBlLnVwZGF0ZVVuaWZvcm0gPSBmdW5jdGlvbiAobmFtZSlcbntcbiAgICBpZiAoIXRoaXMuY29tcGlsZWQpIHtcbiAgICAgICAgcmV0dXJuO1xuICAgIH1cblxuICAgIHZhciB1bmlmb3JtID0gdGhpcy51bmlmb3Jtc1tuYW1lXTtcbiAgICBpZiAodW5pZm9ybSA9PSBudWxsIHx8IHVuaWZvcm0ubG9jYXRpb24gPT0gbnVsbCkge1xuICAgICAgICByZXR1cm47XG4gICAgfVxuXG4gICAgdGhpcy51c2UoKTtcbiAgICB0aGlzLmdsW3VuaWZvcm0ubWV0aG9kXS5hcHBseSh0aGlzLmdsLCBbdW5pZm9ybS5sb2NhdGlvbl0uY29uY2F0KHVuaWZvcm0udmFsdWVzKSk7IC8vIGNhbGwgYXBwcm9wcmlhdGUgR0wgdW5pZm9ybSBtZXRob2QgYW5kIHBhc3MgdGhyb3VnaCBhcmd1bWVudHNcbn07XG5cbi8vIFJlZnJlc2ggdW5pZm9ybSBsb2NhdGlvbnMgYW5kIHNldCB0byBsYXN0IGNhY2hlZCB2YWx1ZXNcbkdMUHJvZ3JhbS5wcm90b3R5cGUucmVmcmVzaFVuaWZvcm1zID0gZnVuY3Rpb24gKClcbntcbiAgICBpZiAoIXRoaXMuY29tcGlsZWQpIHtcbiAgICAgICAgcmV0dXJuO1xuICAgIH1cblxuICAgIGZvciAodmFyIHUgaW4gdGhpcy51bmlmb3Jtcykge1xuICAgICAgICB0aGlzLnVuaWZvcm1zW3VdLmxvY2F0aW9uID0gdGhpcy5nbC5nZXRVbmlmb3JtTG9jYXRpb24odGhpcy5wcm9ncmFtLCB1KTtcbiAgICAgICAgdGhpcy51cGRhdGVVbmlmb3JtKHUpO1xuICAgIH1cbn07XG5cbkdMUHJvZ3JhbS5wcm90b3R5cGUucmVmcmVzaEF0dHJpYnV0ZXMgPSBmdW5jdGlvbiAoKVxue1xuICAgIC8vIHZhciBsZW4gPSB0aGlzLmdsLmdldFByb2dyYW1QYXJhbWV0ZXIodGhpcy5wcm9ncmFtLCB0aGlzLmdsLkFDVElWRV9BVFRSSUJVVEVTKTtcbiAgICAvLyBmb3IgKHZhciBpPTA7IGkgPCBsZW47IGkrKykge1xuICAgIC8vICAgICB2YXIgYSA9IHRoaXMuZ2wuZ2V0QWN0aXZlQXR0cmliKHRoaXMucHJvZ3JhbSwgaSk7XG4gICAgLy8gICAgIGNvbnNvbGUubG9nKGEpO1xuICAgIC8vIH1cbiAgICB0aGlzLmF0dHJpYnMgPSB7fTtcbn07XG5cbi8vIEdldCB0aGUgbG9jYXRpb24gb2YgYSB2ZXJ0ZXggYXR0cmlidXRlXG5HTFByb2dyYW0ucHJvdG90eXBlLmF0dHJpYnV0ZSA9IGZ1bmN0aW9uIChuYW1lKVxue1xuICAgIGlmICghdGhpcy5jb21waWxlZCkge1xuICAgICAgICByZXR1cm47XG4gICAgfVxuXG4gICAgdmFyIGF0dHJpYiA9ICh0aGlzLmF0dHJpYnNbbmFtZV0gPSB0aGlzLmF0dHJpYnNbbmFtZV0gfHwge30pO1xuICAgIGlmIChhdHRyaWIubG9jYXRpb24gIT0gbnVsbCkge1xuICAgICAgICByZXR1cm4gYXR0cmliO1xuICAgIH1cblxuICAgIGF0dHJpYi5uYW1lID0gbmFtZTtcbiAgICBhdHRyaWIubG9jYXRpb24gPSB0aGlzLmdsLmdldEF0dHJpYkxvY2F0aW9uKHRoaXMucHJvZ3JhbSwgbmFtZSk7XG5cbiAgICAvLyB2YXIgaW5mbyA9IHRoaXMuZ2wuZ2V0QWN0aXZlQXR0cmliKHRoaXMucHJvZ3JhbSwgYXR0cmliLmxvY2F0aW9uKTtcbiAgICAvLyBhdHRyaWIudHlwZSA9IGluZm8udHlwZTtcbiAgICAvLyBhdHRyaWIuc2l6ZSA9IGluZm8uc2l6ZTtcblxuICAgIHJldHVybiBhdHRyaWI7XG59O1xuIiwiLy8gR2VuZXJhdGVkIGZyb20gR0xTTCBmaWxlcywgZG9uJ3QgZWRpdCFcbnZhciBzaGFkZXJfc291cmNlcyA9IHt9O1xuXG5zaGFkZXJfc291cmNlc1sncG9pbnRfZnJhZ21lbnQnXSA9XG5cIlxcblwiICtcblwiI2RlZmluZSBHTFNMSUZZIDFcXG5cIiArXG5cIlxcblwiICtcblwidW5pZm9ybSB2ZWMyIHVfcmVzb2x1dGlvbjtcXG5cIiArXG5cInZhcnlpbmcgdmVjMyB2X2NvbG9yO1xcblwiICtcblwidmFyeWluZyB2ZWMyIHZfdGV4Y29vcmQ7XFxuXCIgK1xuXCJ2b2lkIG1haW4odm9pZCkge1xcblwiICtcblwiICB2ZWMzIGNvbG9yID0gdl9jb2xvcjtcXG5cIiArXG5cIiAgdmVjMyBsaWdodGluZyA9IHZlYzMoMS4pO1xcblwiICtcblwiICBmbG9hdCBsZW4gPSBsZW5ndGgodl90ZXhjb29yZCk7XFxuXCIgK1xuXCIgIGlmKGxlbiA+IDEuKSB7XFxuXCIgK1xuXCIgICAgZGlzY2FyZDtcXG5cIiArXG5cIiAgfVxcblwiICtcblwiICBjb2xvciAqPSAoMS4gLSBzbW9vdGhzdGVwKC4yNSwgMS4sIGxlbikpICsgMC41O1xcblwiICtcblwiICAjcHJhZ21hIHRhbmdyYW06IGZyYWdtZW50XFxuXCIgK1xuXCIgIGdsX0ZyYWdDb2xvciA9IHZlYzQoY29sb3IsIDEuKTtcXG5cIiArXG5cIn1cXG5cIiArXG5cIlwiO1xuXG5zaGFkZXJfc291cmNlc1sncG9pbnRfdmVydGV4J10gPVxuXCJcXG5cIiArXG5cIiNkZWZpbmUgR0xTTElGWSAxXFxuXCIgK1xuXCJcXG5cIiArXG5cInVuaWZvcm0gbWF0NCB1X3RpbGVfdmlldztcXG5cIiArXG5cInVuaWZvcm0gZmxvYXQgdV9udW1fbGF5ZXJzO1xcblwiICtcblwiYXR0cmlidXRlIHZlYzMgYV9wb3NpdGlvbjtcXG5cIiArXG5cImF0dHJpYnV0ZSB2ZWMyIGFfdGV4Y29vcmQ7XFxuXCIgK1xuXCJhdHRyaWJ1dGUgdmVjMyBhX2NvbG9yO1xcblwiICtcblwiYXR0cmlidXRlIGZsb2F0IGFfbGF5ZXI7XFxuXCIgK1xuXCJ2YXJ5aW5nIHZlYzMgdl9jb2xvcjtcXG5cIiArXG5cInZhcnlpbmcgdmVjMiB2X3RleGNvb3JkO1xcblwiICtcblwiI2lmIGRlZmluZWQoRkVBVFVSRV9TRUxFQ1RJT04pXFxuXCIgK1xuXCJcXG5cIiArXG5cImF0dHJpYnV0ZSB2ZWM0IGFfc2VsZWN0aW9uX2NvbG9yO1xcblwiICtcblwidmFyeWluZyB2ZWM0IHZfc2VsZWN0aW9uX2NvbG9yO1xcblwiICtcblwiI2VuZGlmXFxuXCIgK1xuXCJcXG5cIiArXG5cImZsb2F0IGFfeF9jYWxjdWxhdGVaKGZsb2F0IHosIGZsb2F0IGxheWVyLCBjb25zdCBmbG9hdCBudW1fbGF5ZXJzLCBjb25zdCBmbG9hdCB6X2xheWVyX3NjYWxlKSB7XFxuXCIgK1xuXCIgIGZsb2F0IHpfbGF5ZXJfcmFuZ2UgPSAobnVtX2xheWVycyArIDEuKSAqIHpfbGF5ZXJfc2NhbGU7XFxuXCIgK1xuXCIgIGZsb2F0IHpfbGF5ZXIgPSAobGF5ZXIgKyAxLikgKiB6X2xheWVyX3NjYWxlO1xcblwiICtcblwiICB6ID0gel9sYXllciArIGNsYW1wKHosIDAuLCB6X2xheWVyX3NjYWxlKTtcXG5cIiArXG5cIiAgeiA9ICh6X2xheWVyX3JhbmdlIC0geikgLyB6X2xheWVyX3JhbmdlO1xcblwiICtcblwiICByZXR1cm4gejtcXG5cIiArXG5cIn1cXG5cIiArXG5cIiNwcmFnbWEgdGFuZ3JhbTogZ2xvYmFsc1xcblwiICtcblwiXFxuXCIgK1xuXCIjcHJhZ21hIHRhbmdyYW06IGNhbWVyYVxcblwiICtcblwiXFxuXCIgK1xuXCJ2b2lkIG1haW4oKSB7XFxuXCIgK1xuXCIgIFxcblwiICtcblwiICAjaWYgZGVmaW5lZChGRUFUVVJFX1NFTEVDVElPTilcXG5cIiArXG5cIiAgaWYoYV9zZWxlY3Rpb25fY29sb3IueHl6ID09IHZlYzMoMC4pKSB7XFxuXCIgK1xuXCIgICAgZ2xfUG9zaXRpb24gPSB2ZWM0KDAuLCAwLiwgMC4sIDEuKTtcXG5cIiArXG5cIiAgICByZXR1cm47XFxuXCIgK1xuXCIgIH1cXG5cIiArXG5cIiAgdl9zZWxlY3Rpb25fY29sb3IgPSBhX3NlbGVjdGlvbl9jb2xvcjtcXG5cIiArXG5cIiAgI2VuZGlmXFxuXCIgK1xuXCIgIHZlYzQgcG9zaXRpb24gPSB1X3RpbGVfdmlldyAqIHZlYzQoYV9wb3NpdGlvbiwgMS4pO1xcblwiICtcblwiICAjcHJhZ21hIHRhbmdyYW06IHZlcnRleFxcblwiICtcblwiICB2X2NvbG9yID0gYV9jb2xvcjtcXG5cIiArXG5cIiAgdl90ZXhjb29yZCA9IGFfdGV4Y29vcmQ7XFxuXCIgK1xuXCIgIGNhbWVyYVByb2plY3Rpb24ocG9zaXRpb24pO1xcblwiICtcblwiICBwb3NpdGlvbi56IC09IChhX2xheWVyICsgMS4pICogLjAwMTtcXG5cIiArXG5cIiAgZ2xfUG9zaXRpb24gPSBwb3NpdGlvbjtcXG5cIiArXG5cIn1cXG5cIiArXG5cIlwiO1xuXG5zaGFkZXJfc291cmNlc1sncG9seWdvbl9mcmFnbWVudCddID1cblwiXFxuXCIgK1xuXCIjZGVmaW5lIEdMU0xJRlkgMVxcblwiICtcblwiXFxuXCIgK1xuXCJ1bmlmb3JtIHZlYzIgdV9yZXNvbHV0aW9uO1xcblwiICtcblwidW5pZm9ybSB2ZWMyIHVfYXNwZWN0O1xcblwiICtcblwidW5pZm9ybSBmbG9hdCB1X21ldGVyc19wZXJfcGl4ZWw7XFxuXCIgK1xuXCJ1bmlmb3JtIGZsb2F0IHVfdGltZTtcXG5cIiArXG5cInVuaWZvcm0gZmxvYXQgdV9tYXBfem9vbTtcXG5cIiArXG5cInVuaWZvcm0gdmVjMiB1X21hcF9jZW50ZXI7XFxuXCIgK1xuXCJ1bmlmb3JtIHZlYzIgdV90aWxlX29yaWdpbjtcXG5cIiArXG5cInVuaWZvcm0gZmxvYXQgdV90ZXN0O1xcblwiICtcblwidW5pZm9ybSBmbG9hdCB1X3Rlc3QyO1xcblwiICtcblwidmFyeWluZyB2ZWMzIHZfY29sb3I7XFxuXCIgK1xuXCJ2YXJ5aW5nIHZlYzQgdl93b3JsZF9wb3NpdGlvbjtcXG5cIiArXG5cIiNpZiBkZWZpbmVkKFdPUkxEX1BPU0lUSU9OX1dSQVApXFxuXCIgK1xuXCJcXG5cIiArXG5cInZlYzIgd29ybGRfcG9zaXRpb25fYW5jaG9yID0gdmVjMihmbG9vcih1X3RpbGVfb3JpZ2luIC8gV09STERfUE9TSVRJT05fV1JBUCkgKiBXT1JMRF9QT1NJVElPTl9XUkFQKTtcXG5cIiArXG5cInZlYzQgYWJzb2x1dGVXb3JsZFBvc2l0aW9uKCkge1xcblwiICtcblwiICByZXR1cm4gdmVjNCh2X3dvcmxkX3Bvc2l0aW9uLnh5ICsgd29ybGRfcG9zaXRpb25fYW5jaG9yLCB2X3dvcmxkX3Bvc2l0aW9uLnosIHZfd29ybGRfcG9zaXRpb24udyk7XFxuXCIgK1xuXCJ9XFxuXCIgK1xuXCIjZWxzZVxcblwiICtcblwiXFxuXCIgK1xuXCJ2ZWM0IGFic29sdXRlV29ybGRQb3NpdGlvbigpIHtcXG5cIiArXG5cIiAgcmV0dXJuIHZfd29ybGRfcG9zaXRpb247XFxuXCIgK1xuXCJ9XFxuXCIgK1xuXCIjZW5kaWZcXG5cIiArXG5cIlxcblwiICtcblwiI2lmIGRlZmluZWQoTElHSFRJTkdfRU5WSVJPTk1FTlQpXFxuXCIgK1xuXCJcXG5cIiArXG5cInVuaWZvcm0gc2FtcGxlcjJEIHVfZW52X21hcDtcXG5cIiArXG5cIiNlbmRpZlxcblwiICtcblwiXFxuXCIgK1xuXCIjaWYgIWRlZmluZWQoTElHSFRJTkdfVkVSVEVYKVxcblwiICtcblwiXFxuXCIgK1xuXCJ2YXJ5aW5nIHZlYzQgdl9wb3NpdGlvbjtcXG5cIiArXG5cInZhcnlpbmcgdmVjMyB2X25vcm1hbDtcXG5cIiArXG5cIiNlbHNlXFxuXCIgK1xuXCJcXG5cIiArXG5cInZhcnlpbmcgdmVjMyB2X2xpZ2h0aW5nO1xcblwiICtcblwiI2VuZGlmXFxuXCIgK1xuXCJcXG5cIiArXG5cImNvbnN0IGZsb2F0IGxpZ2h0X2FtYmllbnQgPSAwLjU7XFxuXCIgK1xuXCJ2ZWMzIGJfeF9wb2ludExpZ2h0KHZlYzQgcG9zaXRpb24sIHZlYzMgbm9ybWFsLCB2ZWMzIGNvbG9yLCB2ZWM0IGxpZ2h0X3BvcywgZmxvYXQgbGlnaHRfYW1iaWVudCwgY29uc3QgYm9vbCBiYWNrbGlnaHQpIHtcXG5cIiArXG5cIiAgdmVjMyBsaWdodF9kaXIgPSBub3JtYWxpemUocG9zaXRpb24ueHl6IC0gbGlnaHRfcG9zLnh5eik7XFxuXCIgK1xuXCIgIGNvbG9yICo9IGFicyhtYXgoZmxvYXQoYmFja2xpZ2h0KSAqIC0xLiwgZG90KG5vcm1hbCwgbGlnaHRfZGlyICogLTEuMCkpKSArIGxpZ2h0X2FtYmllbnQ7XFxuXCIgK1xuXCIgIHJldHVybiBjb2xvcjtcXG5cIiArXG5cIn1cXG5cIiArXG5cInZlYzMgY194X3NwZWN1bGFyTGlnaHQodmVjNCBwb3NpdGlvbiwgdmVjMyBub3JtYWwsIHZlYzMgY29sb3IsIHZlYzQgbGlnaHRfcG9zLCBmbG9hdCBsaWdodF9hbWJpZW50LCBjb25zdCBib29sIGJhY2tsaWdodCkge1xcblwiICtcblwiICB2ZWMzIGxpZ2h0X2RpciA9IG5vcm1hbGl6ZShwb3NpdGlvbi54eXogLSBsaWdodF9wb3MueHl6KTtcXG5cIiArXG5cIiAgdmVjMyB2aWV3X3BvcyA9IHZlYzMoMC4sIDAuLCA1MDAuKTtcXG5cIiArXG5cIiAgdmVjMyB2aWV3X2RpciA9IG5vcm1hbGl6ZShwb3NpdGlvbi54eXogLSB2aWV3X3Bvcy54eXopO1xcblwiICtcblwiICB2ZWMzIHNwZWN1bGFyUmVmbGVjdGlvbjtcXG5cIiArXG5cIiAgaWYoZG90KG5vcm1hbCwgLWxpZ2h0X2RpcikgPCAwLjApIHtcXG5cIiArXG5cIiAgICBzcGVjdWxhclJlZmxlY3Rpb24gPSB2ZWMzKDAuMCwgMC4wLCAwLjApO1xcblwiICtcblwiICB9IGVsc2Uge1xcblwiICtcblwiICAgIGZsb2F0IGF0dGVudWF0aW9uID0gMS4wO1xcblwiICtcblwiICAgIGZsb2F0IGxpZ2h0U3BlY3VsYXJUZXJtID0gMS4wO1xcblwiICtcblwiICAgIGZsb2F0IG1hdGVyaWFsU3BlY3VsYXJUZXJtID0gMTAuMDtcXG5cIiArXG5cIiAgICBmbG9hdCBtYXRlcmlhbFNoaW5pbmVzc1Rlcm0gPSAxMC4wO1xcblwiICtcblwiICAgIHNwZWN1bGFyUmVmbGVjdGlvbiA9IGF0dGVudWF0aW9uICogdmVjMyhsaWdodFNwZWN1bGFyVGVybSkgKiB2ZWMzKG1hdGVyaWFsU3BlY3VsYXJUZXJtKSAqIHBvdyhtYXgoMC4wLCBkb3QocmVmbGVjdCgtbGlnaHRfZGlyLCBub3JtYWwpLCB2aWV3X2RpcikpLCBtYXRlcmlhbFNoaW5pbmVzc1Rlcm0pO1xcblwiICtcblwiICB9XFxuXCIgK1xuXCIgIGZsb2F0IGRpZmZ1c2UgPSBhYnMobWF4KGZsb2F0KGJhY2tsaWdodCkgKiAtMS4sIGRvdChub3JtYWwsIGxpZ2h0X2RpciAqIC0xLjApKSk7XFxuXCIgK1xuXCIgIGNvbG9yICo9IGRpZmZ1c2UgKyBzcGVjdWxhclJlZmxlY3Rpb24gKyBsaWdodF9hbWJpZW50O1xcblwiICtcblwiICByZXR1cm4gY29sb3I7XFxuXCIgK1xuXCJ9XFxuXCIgK1xuXCJ2ZWMzIGRfeF9kaXJlY3Rpb25hbExpZ2h0KHZlYzMgbm9ybWFsLCB2ZWMzIGNvbG9yLCB2ZWMzIGxpZ2h0X2RpciwgZmxvYXQgbGlnaHRfYW1iaWVudCkge1xcblwiICtcblwiICBsaWdodF9kaXIgPSBub3JtYWxpemUobGlnaHRfZGlyKTtcXG5cIiArXG5cIiAgY29sb3IgKj0gZG90KG5vcm1hbCwgbGlnaHRfZGlyICogLTEuMCkgKyBsaWdodF9hbWJpZW50O1xcblwiICtcblwiICByZXR1cm4gY29sb3I7XFxuXCIgK1xuXCJ9XFxuXCIgK1xuXCJ2ZWMzIGFfeF9saWdodGluZyh2ZWM0IHBvc2l0aW9uLCB2ZWMzIG5vcm1hbCwgdmVjMyBjb2xvciwgdmVjNCBsaWdodF9wb3MsIHZlYzQgbmlnaHRfbGlnaHRfcG9zLCB2ZWMzIGxpZ2h0X2RpciwgZmxvYXQgbGlnaHRfYW1iaWVudCkge1xcblwiICtcblwiICBcXG5cIiArXG5cIiAgI2lmIGRlZmluZWQoTElHSFRJTkdfUE9JTlQpXFxuXCIgK1xuXCIgIGNvbG9yID0gYl94X3BvaW50TGlnaHQocG9zaXRpb24sIG5vcm1hbCwgY29sb3IsIGxpZ2h0X3BvcywgbGlnaHRfYW1iaWVudCwgdHJ1ZSk7XFxuXCIgK1xuXCIgICNlbGlmIGRlZmluZWQoTElHSFRJTkdfUE9JTlRfU1BFQ1VMQVIpXFxuXCIgK1xuXCIgIGNvbG9yID0gY194X3NwZWN1bGFyTGlnaHQocG9zaXRpb24sIG5vcm1hbCwgY29sb3IsIGxpZ2h0X3BvcywgbGlnaHRfYW1iaWVudCwgdHJ1ZSk7XFxuXCIgK1xuXCIgICNlbGlmIGRlZmluZWQoTElHSFRJTkdfTklHSFQpXFxuXCIgK1xuXCIgIGNvbG9yID0gYl94X3BvaW50TGlnaHQocG9zaXRpb24sIG5vcm1hbCwgY29sb3IsIG5pZ2h0X2xpZ2h0X3BvcywgMC4sIGZhbHNlKTtcXG5cIiArXG5cIiAgI2VsaWYgZGVmaW5lZChMSUdIVElOR19ESVJFQ1RJT04pXFxuXCIgK1xuXCIgIGNvbG9yID0gZF94X2RpcmVjdGlvbmFsTGlnaHQobm9ybWFsLCBjb2xvciwgbGlnaHRfZGlyLCBsaWdodF9hbWJpZW50KTtcXG5cIiArXG5cIiAgI2Vsc2VcXG5cIiArXG5cIiAgY29sb3IgPSBjb2xvcjtcXG5cIiArXG5cIiAgI2VuZGlmXFxuXCIgK1xuXCIgIHJldHVybiBjb2xvcjtcXG5cIiArXG5cIn1cXG5cIiArXG5cInZlYzQgZV94X3NwaGVyaWNhbEVudmlyb25tZW50TWFwKHZlYzMgdmlld19wb3MsIHZlYzMgcG9zaXRpb24sIHZlYzMgbm9ybWFsLCBzYW1wbGVyMkQgZW52bWFwKSB7XFxuXCIgK1xuXCIgIHZlYzMgZXllID0gbm9ybWFsaXplKHBvc2l0aW9uLnh5eiAtIHZpZXdfcG9zLnh5eik7XFxuXCIgK1xuXCIgIGlmKGV5ZS56ID4gMC4wMSkge1xcblwiICtcblwiICAgIGV5ZS56ID0gMC4wMTtcXG5cIiArXG5cIiAgfVxcblwiICtcblwiICB2ZWMzIHIgPSByZWZsZWN0KGV5ZSwgbm9ybWFsKTtcXG5cIiArXG5cIiAgZmxvYXQgbSA9IDIuICogc3FydChwb3coci54LCAyLikgKyBwb3coci55LCAyLikgKyBwb3coci56ICsgMS4sIDIuKSk7XFxuXCIgK1xuXCIgIHZlYzIgdXYgPSByLnh5IC8gbSArIC41O1xcblwiICtcblwiICByZXR1cm4gdGV4dHVyZTJEKGVudm1hcCwgdXYpO1xcblwiICtcblwifVxcblwiICtcblwiI3ByYWdtYSB0YW5ncmFtOiBnbG9iYWxzXFxuXCIgK1xuXCJcXG5cIiArXG5cInZvaWQgbWFpbih2b2lkKSB7XFxuXCIgK1xuXCIgIHZlYzMgY29sb3IgPSB2X2NvbG9yO1xcblwiICtcblwiICAjaWYgZGVmaW5lZChMSUdIVElOR19FTlZJUk9OTUVOVClcXG5cIiArXG5cIiAgdmVjMyB2aWV3X3BvcyA9IHZlYzMoMC4sIDAuLCAxMDAuICogdV9tZXRlcnNfcGVyX3BpeGVsKTtcXG5cIiArXG5cIiAgY29sb3IgPSBlX3hfc3BoZXJpY2FsRW52aXJvbm1lbnRNYXAodmlld19wb3MsIHZfcG9zaXRpb24ueHl6LCB2X25vcm1hbCwgdV9lbnZfbWFwKS5yZ2I7XFxuXCIgK1xuXCIgICNlbmRpZlxcblwiICtcblwiICBcXG5cIiArXG5cIiAgI2lmICFkZWZpbmVkKExJR0hUSU5HX1ZFUlRFWCkgLy8gZGVmYXVsdCB0byBwZXItcGl4ZWwgbGlnaHRpbmdcXG5cIiArXG5cIiAgdmVjMyBsaWdodGluZyA9IGFfeF9saWdodGluZyh2X3Bvc2l0aW9uLCB2X25vcm1hbCwgdmVjMygxLiksIHZlYzQoMC4sIDAuLCAxNTAuICogdV9tZXRlcnNfcGVyX3BpeGVsLCAxLiksIHZlYzQoMC4sIDAuLCA1MC4gKiB1X21ldGVyc19wZXJfcGl4ZWwsIDEuKSwgdmVjMygwLjIsIDAuNywgLTAuNSksIGxpZ2h0X2FtYmllbnQpO1xcblwiICtcblwiICAjZWxzZVxcblwiICtcblwiICB2ZWMzIGxpZ2h0aW5nID0gdl9saWdodGluZztcXG5cIiArXG5cIiAgI2VuZGlmXFxuXCIgK1xuXCIgIHZlYzMgY29sb3JfcHJlbGlnaHQgPSBjb2xvcjtcXG5cIiArXG5cIiAgY29sb3IgKj0gbGlnaHRpbmc7XFxuXCIgK1xuXCIgICNwcmFnbWEgdGFuZ3JhbTogZnJhZ21lbnRcXG5cIiArXG5cIiAgZ2xfRnJhZ0NvbG9yID0gdmVjNChjb2xvciwgMS4wKTtcXG5cIiArXG5cIn1cXG5cIiArXG5cIlwiO1xuXG5zaGFkZXJfc291cmNlc1sncG9seWdvbl92ZXJ0ZXgnXSA9XG5cIlxcblwiICtcblwiI2RlZmluZSBHTFNMSUZZIDFcXG5cIiArXG5cIlxcblwiICtcblwidW5pZm9ybSB2ZWMyIHVfcmVzb2x1dGlvbjtcXG5cIiArXG5cInVuaWZvcm0gdmVjMiB1X2FzcGVjdDtcXG5cIiArXG5cInVuaWZvcm0gZmxvYXQgdV90aW1lO1xcblwiICtcblwidW5pZm9ybSBmbG9hdCB1X21hcF96b29tO1xcblwiICtcblwidW5pZm9ybSB2ZWMyIHVfbWFwX2NlbnRlcjtcXG5cIiArXG5cInVuaWZvcm0gdmVjMiB1X3RpbGVfb3JpZ2luO1xcblwiICtcblwidW5pZm9ybSBtYXQ0IHVfdGlsZV93b3JsZDtcXG5cIiArXG5cInVuaWZvcm0gbWF0NCB1X3RpbGVfdmlldztcXG5cIiArXG5cInVuaWZvcm0gZmxvYXQgdV9tZXRlcnNfcGVyX3BpeGVsO1xcblwiICtcblwidW5pZm9ybSBmbG9hdCB1X251bV9sYXllcnM7XFxuXCIgK1xuXCJhdHRyaWJ1dGUgdmVjMyBhX3Bvc2l0aW9uO1xcblwiICtcblwiYXR0cmlidXRlIHZlYzMgYV9ub3JtYWw7XFxuXCIgK1xuXCJhdHRyaWJ1dGUgdmVjMyBhX2NvbG9yO1xcblwiICtcblwiYXR0cmlidXRlIGZsb2F0IGFfbGF5ZXI7XFxuXCIgK1xuXCJ2YXJ5aW5nIHZlYzQgdl93b3JsZF9wb3NpdGlvbjtcXG5cIiArXG5cInZhcnlpbmcgdmVjMyB2X2NvbG9yO1xcblwiICtcblwiI2lmIGRlZmluZWQoV09STERfUE9TSVRJT05fV1JBUClcXG5cIiArXG5cIlxcblwiICtcblwidmVjMiB3b3JsZF9wb3NpdGlvbl9hbmNob3IgPSB2ZWMyKGZsb29yKHVfdGlsZV9vcmlnaW4gLyBXT1JMRF9QT1NJVElPTl9XUkFQKSAqIFdPUkxEX1BPU0lUSU9OX1dSQVApO1xcblwiICtcblwidmVjNCBhYnNvbHV0ZVdvcmxkUG9zaXRpb24oKSB7XFxuXCIgK1xuXCIgIHJldHVybiB2ZWM0KHZfd29ybGRfcG9zaXRpb24ueHkgKyB3b3JsZF9wb3NpdGlvbl9hbmNob3IsIHZfd29ybGRfcG9zaXRpb24ueiwgdl93b3JsZF9wb3NpdGlvbi53KTtcXG5cIiArXG5cIn1cXG5cIiArXG5cIiNlbHNlXFxuXCIgK1xuXCJcXG5cIiArXG5cInZlYzQgYWJzb2x1dGVXb3JsZFBvc2l0aW9uKCkge1xcblwiICtcblwiICByZXR1cm4gdl93b3JsZF9wb3NpdGlvbjtcXG5cIiArXG5cIn1cXG5cIiArXG5cIiNlbmRpZlxcblwiICtcblwiXFxuXCIgK1xuXCIjaWYgZGVmaW5lZChGRUFUVVJFX1NFTEVDVElPTilcXG5cIiArXG5cIlxcblwiICtcblwiYXR0cmlidXRlIHZlYzQgYV9zZWxlY3Rpb25fY29sb3I7XFxuXCIgK1xuXCJ2YXJ5aW5nIHZlYzQgdl9zZWxlY3Rpb25fY29sb3I7XFxuXCIgK1xuXCIjZW5kaWZcXG5cIiArXG5cIlxcblwiICtcblwiI2lmICFkZWZpbmVkKExJR0hUSU5HX1ZFUlRFWClcXG5cIiArXG5cIlxcblwiICtcblwidmFyeWluZyB2ZWM0IHZfcG9zaXRpb247XFxuXCIgK1xuXCJ2YXJ5aW5nIHZlYzMgdl9ub3JtYWw7XFxuXCIgK1xuXCIjZWxzZVxcblwiICtcblwiXFxuXCIgK1xuXCJ2YXJ5aW5nIHZlYzMgdl9saWdodGluZztcXG5cIiArXG5cIiNlbmRpZlxcblwiICtcblwiXFxuXCIgK1xuXCJjb25zdCBmbG9hdCBsaWdodF9hbWJpZW50ID0gMC41O1xcblwiICtcblwiZmxvYXQgYV94X2NhbGN1bGF0ZVooZmxvYXQgeiwgZmxvYXQgbGF5ZXIsIGNvbnN0IGZsb2F0IG51bV9sYXllcnMsIGNvbnN0IGZsb2F0IHpfbGF5ZXJfc2NhbGUpIHtcXG5cIiArXG5cIiAgZmxvYXQgel9sYXllcl9yYW5nZSA9IChudW1fbGF5ZXJzICsgMS4pICogel9sYXllcl9zY2FsZTtcXG5cIiArXG5cIiAgZmxvYXQgel9sYXllciA9IChsYXllciArIDEuKSAqIHpfbGF5ZXJfc2NhbGU7XFxuXCIgK1xuXCIgIHogPSB6X2xheWVyICsgY2xhbXAoeiwgMC4sIHpfbGF5ZXJfc2NhbGUpO1xcblwiICtcblwiICB6ID0gKHpfbGF5ZXJfcmFuZ2UgLSB6KSAvIHpfbGF5ZXJfcmFuZ2U7XFxuXCIgK1xuXCIgIHJldHVybiB6O1xcblwiICtcblwifVxcblwiICtcblwidmVjMyBjX3hfcG9pbnRMaWdodCh2ZWM0IHBvc2l0aW9uLCB2ZWMzIG5vcm1hbCwgdmVjMyBjb2xvciwgdmVjNCBsaWdodF9wb3MsIGZsb2F0IGxpZ2h0X2FtYmllbnQsIGNvbnN0IGJvb2wgYmFja2xpZ2h0KSB7XFxuXCIgK1xuXCIgIHZlYzMgbGlnaHRfZGlyID0gbm9ybWFsaXplKHBvc2l0aW9uLnh5eiAtIGxpZ2h0X3Bvcy54eXopO1xcblwiICtcblwiICBjb2xvciAqPSBhYnMobWF4KGZsb2F0KGJhY2tsaWdodCkgKiAtMS4sIGRvdChub3JtYWwsIGxpZ2h0X2RpciAqIC0xLjApKSkgKyBsaWdodF9hbWJpZW50O1xcblwiICtcblwiICByZXR1cm4gY29sb3I7XFxuXCIgK1xuXCJ9XFxuXCIgK1xuXCJ2ZWMzIGRfeF9zcGVjdWxhckxpZ2h0KHZlYzQgcG9zaXRpb24sIHZlYzMgbm9ybWFsLCB2ZWMzIGNvbG9yLCB2ZWM0IGxpZ2h0X3BvcywgZmxvYXQgbGlnaHRfYW1iaWVudCwgY29uc3QgYm9vbCBiYWNrbGlnaHQpIHtcXG5cIiArXG5cIiAgdmVjMyBsaWdodF9kaXIgPSBub3JtYWxpemUocG9zaXRpb24ueHl6IC0gbGlnaHRfcG9zLnh5eik7XFxuXCIgK1xuXCIgIHZlYzMgdmlld19wb3MgPSB2ZWMzKDAuLCAwLiwgNTAwLik7XFxuXCIgK1xuXCIgIHZlYzMgdmlld19kaXIgPSBub3JtYWxpemUocG9zaXRpb24ueHl6IC0gdmlld19wb3MueHl6KTtcXG5cIiArXG5cIiAgdmVjMyBzcGVjdWxhclJlZmxlY3Rpb247XFxuXCIgK1xuXCIgIGlmKGRvdChub3JtYWwsIC1saWdodF9kaXIpIDwgMC4wKSB7XFxuXCIgK1xuXCIgICAgc3BlY3VsYXJSZWZsZWN0aW9uID0gdmVjMygwLjAsIDAuMCwgMC4wKTtcXG5cIiArXG5cIiAgfSBlbHNlIHtcXG5cIiArXG5cIiAgICBmbG9hdCBhdHRlbnVhdGlvbiA9IDEuMDtcXG5cIiArXG5cIiAgICBmbG9hdCBsaWdodFNwZWN1bGFyVGVybSA9IDEuMDtcXG5cIiArXG5cIiAgICBmbG9hdCBtYXRlcmlhbFNwZWN1bGFyVGVybSA9IDEwLjA7XFxuXCIgK1xuXCIgICAgZmxvYXQgbWF0ZXJpYWxTaGluaW5lc3NUZXJtID0gMTAuMDtcXG5cIiArXG5cIiAgICBzcGVjdWxhclJlZmxlY3Rpb24gPSBhdHRlbnVhdGlvbiAqIHZlYzMobGlnaHRTcGVjdWxhclRlcm0pICogdmVjMyhtYXRlcmlhbFNwZWN1bGFyVGVybSkgKiBwb3cobWF4KDAuMCwgZG90KHJlZmxlY3QoLWxpZ2h0X2Rpciwgbm9ybWFsKSwgdmlld19kaXIpKSwgbWF0ZXJpYWxTaGluaW5lc3NUZXJtKTtcXG5cIiArXG5cIiAgfVxcblwiICtcblwiICBmbG9hdCBkaWZmdXNlID0gYWJzKG1heChmbG9hdChiYWNrbGlnaHQpICogLTEuLCBkb3Qobm9ybWFsLCBsaWdodF9kaXIgKiAtMS4wKSkpO1xcblwiICtcblwiICBjb2xvciAqPSBkaWZmdXNlICsgc3BlY3VsYXJSZWZsZWN0aW9uICsgbGlnaHRfYW1iaWVudDtcXG5cIiArXG5cIiAgcmV0dXJuIGNvbG9yO1xcblwiICtcblwifVxcblwiICtcblwidmVjMyBlX3hfZGlyZWN0aW9uYWxMaWdodCh2ZWMzIG5vcm1hbCwgdmVjMyBjb2xvciwgdmVjMyBsaWdodF9kaXIsIGZsb2F0IGxpZ2h0X2FtYmllbnQpIHtcXG5cIiArXG5cIiAgbGlnaHRfZGlyID0gbm9ybWFsaXplKGxpZ2h0X2Rpcik7XFxuXCIgK1xuXCIgIGNvbG9yICo9IGRvdChub3JtYWwsIGxpZ2h0X2RpciAqIC0xLjApICsgbGlnaHRfYW1iaWVudDtcXG5cIiArXG5cIiAgcmV0dXJuIGNvbG9yO1xcblwiICtcblwifVxcblwiICtcblwidmVjMyBiX3hfbGlnaHRpbmcodmVjNCBwb3NpdGlvbiwgdmVjMyBub3JtYWwsIHZlYzMgY29sb3IsIHZlYzQgbGlnaHRfcG9zLCB2ZWM0IG5pZ2h0X2xpZ2h0X3BvcywgdmVjMyBsaWdodF9kaXIsIGZsb2F0IGxpZ2h0X2FtYmllbnQpIHtcXG5cIiArXG5cIiAgXFxuXCIgK1xuXCIgICNpZiBkZWZpbmVkKExJR0hUSU5HX1BPSU5UKVxcblwiICtcblwiICBjb2xvciA9IGNfeF9wb2ludExpZ2h0KHBvc2l0aW9uLCBub3JtYWwsIGNvbG9yLCBsaWdodF9wb3MsIGxpZ2h0X2FtYmllbnQsIHRydWUpO1xcblwiICtcblwiICAjZWxpZiBkZWZpbmVkKExJR0hUSU5HX1BPSU5UX1NQRUNVTEFSKVxcblwiICtcblwiICBjb2xvciA9IGRfeF9zcGVjdWxhckxpZ2h0KHBvc2l0aW9uLCBub3JtYWwsIGNvbG9yLCBsaWdodF9wb3MsIGxpZ2h0X2FtYmllbnQsIHRydWUpO1xcblwiICtcblwiICAjZWxpZiBkZWZpbmVkKExJR0hUSU5HX05JR0hUKVxcblwiICtcblwiICBjb2xvciA9IGNfeF9wb2ludExpZ2h0KHBvc2l0aW9uLCBub3JtYWwsIGNvbG9yLCBuaWdodF9saWdodF9wb3MsIDAuLCBmYWxzZSk7XFxuXCIgK1xuXCIgICNlbGlmIGRlZmluZWQoTElHSFRJTkdfRElSRUNUSU9OKVxcblwiICtcblwiICBjb2xvciA9IGVfeF9kaXJlY3Rpb25hbExpZ2h0KG5vcm1hbCwgY29sb3IsIGxpZ2h0X2RpciwgbGlnaHRfYW1iaWVudCk7XFxuXCIgK1xuXCIgICNlbHNlXFxuXCIgK1xuXCIgIGNvbG9yID0gY29sb3I7XFxuXCIgK1xuXCIgICNlbmRpZlxcblwiICtcblwiICByZXR1cm4gY29sb3I7XFxuXCIgK1xuXCJ9XFxuXCIgK1xuXCIjcHJhZ21hIHRhbmdyYW06IGdsb2JhbHNcXG5cIiArXG5cIlxcblwiICtcblwiI3ByYWdtYSB0YW5ncmFtOiBjYW1lcmFcXG5cIiArXG5cIlxcblwiICtcblwidm9pZCBtYWluKCkge1xcblwiICtcblwiICBcXG5cIiArXG5cIiAgI2lmIGRlZmluZWQoRkVBVFVSRV9TRUxFQ1RJT04pXFxuXCIgK1xuXCIgIGlmKGFfc2VsZWN0aW9uX2NvbG9yLnh5eiA9PSB2ZWMzKDAuKSkge1xcblwiICtcblwiICAgIGdsX1Bvc2l0aW9uID0gdmVjNCgwLiwgMC4sIDAuLCAxLik7XFxuXCIgK1xuXCIgICAgcmV0dXJuO1xcblwiICtcblwiICB9XFxuXCIgK1xuXCIgIHZfc2VsZWN0aW9uX2NvbG9yID0gYV9zZWxlY3Rpb25fY29sb3I7XFxuXCIgK1xuXCIgICNlbmRpZlxcblwiICtcblwiICB2ZWM0IHBvc2l0aW9uID0gdV90aWxlX3ZpZXcgKiB2ZWM0KGFfcG9zaXRpb24sIDEuKTtcXG5cIiArXG5cIiAgdl93b3JsZF9wb3NpdGlvbiA9IHVfdGlsZV93b3JsZCAqIHZlYzQoYV9wb3NpdGlvbiwgMS4pO1xcblwiICtcblwiICAjaWYgZGVmaW5lZChXT1JMRF9QT1NJVElPTl9XUkFQKVxcblwiICtcblwiICB2X3dvcmxkX3Bvc2l0aW9uLnh5IC09IHdvcmxkX3Bvc2l0aW9uX2FuY2hvcjtcXG5cIiArXG5cIiAgI2VuZGlmXFxuXCIgK1xuXCIgIFxcblwiICtcblwiICAjcHJhZ21hIHRhbmdyYW06IHZlcnRleFxcblwiICtcblwiICBcXG5cIiArXG5cIiAgI2lmIGRlZmluZWQoTElHSFRJTkdfVkVSVEVYKVxcblwiICtcblwiICB2X2NvbG9yID0gYV9jb2xvcjtcXG5cIiArXG5cIiAgdl9saWdodGluZyA9IGJfeF9saWdodGluZyhwb3NpdGlvbiwgYV9ub3JtYWwsIHZlYzMoMS4pLCB2ZWM0KDAuLCAwLiwgMTUwLiAqIHVfbWV0ZXJzX3Blcl9waXhlbCwgMS4pLCB2ZWM0KDAuLCAwLiwgNTAuICogdV9tZXRlcnNfcGVyX3BpeGVsLCAxLiksIHZlYzMoMC4yLCAwLjcsIC0wLjUpLCBsaWdodF9hbWJpZW50KTtcXG5cIiArXG5cIiAgI2Vsc2VcXG5cIiArXG5cIiAgdl9wb3NpdGlvbiA9IHBvc2l0aW9uO1xcblwiICtcblwiICB2X25vcm1hbCA9IGFfbm9ybWFsO1xcblwiICtcblwiICB2X2NvbG9yID0gYV9jb2xvcjtcXG5cIiArXG5cIiAgI2VuZGlmXFxuXCIgK1xuXCIgIGNhbWVyYVByb2plY3Rpb24ocG9zaXRpb24pO1xcblwiICtcblwiICBwb3NpdGlvbi56IC09IChhX2xheWVyICsgMS4pICogLjAwMTtcXG5cIiArXG5cIiAgZ2xfUG9zaXRpb24gPSBwb3NpdGlvbjtcXG5cIiArXG5cIn1cXG5cIiArXG5cIlwiO1xuXG5zaGFkZXJfc291cmNlc1snc2VsZWN0aW9uX2ZyYWdtZW50J10gPVxuXCJcXG5cIiArXG5cIiNkZWZpbmUgR0xTTElGWSAxXFxuXCIgK1xuXCJcXG5cIiArXG5cIiNpZiBkZWZpbmVkKEZFQVRVUkVfU0VMRUNUSU9OKVxcblwiICtcblwiXFxuXCIgK1xuXCJ2YXJ5aW5nIHZlYzQgdl9zZWxlY3Rpb25fY29sb3I7XFxuXCIgK1xuXCIjZW5kaWZcXG5cIiArXG5cIlxcblwiICtcblwidm9pZCBtYWluKHZvaWQpIHtcXG5cIiArXG5cIiAgXFxuXCIgK1xuXCIgICNpZiBkZWZpbmVkKEZFQVRVUkVfU0VMRUNUSU9OKVxcblwiICtcblwiICBnbF9GcmFnQ29sb3IgPSB2X3NlbGVjdGlvbl9jb2xvcjtcXG5cIiArXG5cIiAgI2Vsc2VcXG5cIiArXG5cIiAgZ2xfRnJhZ0NvbG9yID0gdmVjNCgwLiwgMC4sIDAuLCAxLik7XFxuXCIgK1xuXCIgICNlbmRpZlxcblwiICtcblwiICBcXG5cIiArXG5cIn1cXG5cIiArXG5cIlwiO1xuXG5zaGFkZXJfc291cmNlc1snc2ltcGxlX3BvbHlnb25fZnJhZ21lbnQnXSA9XG5cIlxcblwiICtcblwiI2RlZmluZSBHTFNMSUZZIDFcXG5cIiArXG5cIlxcblwiICtcblwidW5pZm9ybSBmbG9hdCB1X21ldGVyc19wZXJfcGl4ZWw7XFxuXCIgK1xuXCJ2YXJ5aW5nIHZlYzMgdl9jb2xvcjtcXG5cIiArXG5cIiNpZiAhZGVmaW5lZChMSUdIVElOR19WRVJURVgpXFxuXCIgK1xuXCJcXG5cIiArXG5cInZhcnlpbmcgdmVjNCB2X3Bvc2l0aW9uO1xcblwiICtcblwidmFyeWluZyB2ZWMzIHZfbm9ybWFsO1xcblwiICtcblwiI2VuZGlmXFxuXCIgK1xuXCJcXG5cIiArXG5cInZlYzMgYV94X3BvaW50TGlnaHQodmVjNCBwb3NpdGlvbiwgdmVjMyBub3JtYWwsIHZlYzMgY29sb3IsIHZlYzQgbGlnaHRfcG9zLCBmbG9hdCBsaWdodF9hbWJpZW50LCBjb25zdCBib29sIGJhY2tsaWdodCkge1xcblwiICtcblwiICB2ZWMzIGxpZ2h0X2RpciA9IG5vcm1hbGl6ZShwb3NpdGlvbi54eXogLSBsaWdodF9wb3MueHl6KTtcXG5cIiArXG5cIiAgY29sb3IgKj0gYWJzKG1heChmbG9hdChiYWNrbGlnaHQpICogLTEuLCBkb3Qobm9ybWFsLCBsaWdodF9kaXIgKiAtMS4wKSkpICsgbGlnaHRfYW1iaWVudDtcXG5cIiArXG5cIiAgcmV0dXJuIGNvbG9yO1xcblwiICtcblwifVxcblwiICtcblwiI3ByYWdtYSB0YW5ncmFtOiBnbG9iYWxzXFxuXCIgK1xuXCJcXG5cIiArXG5cInZvaWQgbWFpbih2b2lkKSB7XFxuXCIgK1xuXCIgIHZlYzMgY29sb3I7XFxuXCIgK1xuXCIgICNpZiAhZGVmaW5lZChMSUdIVElOR19WRVJURVgpIC8vIGRlZmF1bHQgdG8gcGVyLXBpeGVsIGxpZ2h0aW5nXFxuXCIgK1xuXCIgIHZlYzQgbGlnaHRfcG9zID0gdmVjNCgwLiwgMC4sIDE1MC4gKiB1X21ldGVyc19wZXJfcGl4ZWwsIDEuKTtcXG5cIiArXG5cIiAgY29uc3QgZmxvYXQgbGlnaHRfYW1iaWVudCA9IDAuNTtcXG5cIiArXG5cIiAgY29uc3QgYm9vbCBiYWNrbGl0ID0gdHJ1ZTtcXG5cIiArXG5cIiAgY29sb3IgPSBhX3hfcG9pbnRMaWdodCh2X3Bvc2l0aW9uLCB2X25vcm1hbCwgdl9jb2xvciwgbGlnaHRfcG9zLCBsaWdodF9hbWJpZW50LCBiYWNrbGl0KTtcXG5cIiArXG5cIiAgI2Vsc2VcXG5cIiArXG5cIiAgY29sb3IgPSB2X2NvbG9yO1xcblwiICtcblwiICAjZW5kaWZcXG5cIiArXG5cIiAgXFxuXCIgK1xuXCIgICNwcmFnbWEgdGFuZ3JhbTogZnJhZ21lbnRcXG5cIiArXG5cIiAgZ2xfRnJhZ0NvbG9yID0gdmVjNChjb2xvciwgMS4wKTtcXG5cIiArXG5cIn1cXG5cIiArXG5cIlwiO1xuXG5zaGFkZXJfc291cmNlc1snc2ltcGxlX3BvbHlnb25fdmVydGV4J10gPVxuXCJcXG5cIiArXG5cIiNkZWZpbmUgR0xTTElGWSAxXFxuXCIgK1xuXCJcXG5cIiArXG5cInVuaWZvcm0gdmVjMiB1X2FzcGVjdDtcXG5cIiArXG5cInVuaWZvcm0gbWF0NCB1X3RpbGVfdmlldztcXG5cIiArXG5cInVuaWZvcm0gbWF0NCB1X21ldGVyX3ZpZXc7XFxuXCIgK1xuXCJ1bmlmb3JtIGZsb2F0IHVfbWV0ZXJzX3Blcl9waXhlbDtcXG5cIiArXG5cInVuaWZvcm0gZmxvYXQgdV9udW1fbGF5ZXJzO1xcblwiICtcblwiYXR0cmlidXRlIHZlYzMgYV9wb3NpdGlvbjtcXG5cIiArXG5cImF0dHJpYnV0ZSB2ZWMzIGFfbm9ybWFsO1xcblwiICtcblwiYXR0cmlidXRlIHZlYzMgYV9jb2xvcjtcXG5cIiArXG5cImF0dHJpYnV0ZSBmbG9hdCBhX2xheWVyO1xcblwiICtcblwidmFyeWluZyB2ZWMzIHZfY29sb3I7XFxuXCIgK1xuXCIjaWYgIWRlZmluZWQoTElHSFRJTkdfVkVSVEVYKVxcblwiICtcblwiXFxuXCIgK1xuXCJ2YXJ5aW5nIHZlYzQgdl9wb3NpdGlvbjtcXG5cIiArXG5cInZhcnlpbmcgdmVjMyB2X25vcm1hbDtcXG5cIiArXG5cIiNlbmRpZlxcblwiICtcblwiXFxuXCIgK1xuXCJ2ZWM0IGFfeF9wZXJzcGVjdGl2ZSh2ZWM0IHBvc2l0aW9uLCBjb25zdCB2ZWMyIHBlcnNwZWN0aXZlX29mZnNldCwgY29uc3QgdmVjMiBwZXJzcGVjdGl2ZV9mYWN0b3IpIHtcXG5cIiArXG5cIiAgcG9zaXRpb24ueHkgKz0gcG9zaXRpb24ueiAqIHBlcnNwZWN0aXZlX2ZhY3RvciAqIChwb3NpdGlvbi54eSAtIHBlcnNwZWN0aXZlX29mZnNldCk7XFxuXCIgK1xuXCIgIHJldHVybiBwb3NpdGlvbjtcXG5cIiArXG5cIn1cXG5cIiArXG5cInZlYzQgYl94X2lzb21ldHJpYyh2ZWM0IHBvc2l0aW9uLCBjb25zdCB2ZWMyIGF4aXMsIGNvbnN0IGZsb2F0IG11bHRpcGxpZXIpIHtcXG5cIiArXG5cIiAgcG9zaXRpb24ueHkgKz0gcG9zaXRpb24ueiAqIGF4aXMgKiBtdWx0aXBsaWVyIC8gdV9hc3BlY3Q7XFxuXCIgK1xuXCIgIHJldHVybiBwb3NpdGlvbjtcXG5cIiArXG5cIn1cXG5cIiArXG5cImZsb2F0IGNfeF9jYWxjdWxhdGVaKGZsb2F0IHosIGZsb2F0IGxheWVyLCBjb25zdCBmbG9hdCBudW1fbGF5ZXJzLCBjb25zdCBmbG9hdCB6X2xheWVyX3NjYWxlKSB7XFxuXCIgK1xuXCIgIGZsb2F0IHpfbGF5ZXJfcmFuZ2UgPSAobnVtX2xheWVycyArIDEuKSAqIHpfbGF5ZXJfc2NhbGU7XFxuXCIgK1xuXCIgIGZsb2F0IHpfbGF5ZXIgPSAobGF5ZXIgKyAxLikgKiB6X2xheWVyX3NjYWxlO1xcblwiICtcblwiICB6ID0gel9sYXllciArIGNsYW1wKHosIDAuLCB6X2xheWVyX3NjYWxlKTtcXG5cIiArXG5cIiAgeiA9ICh6X2xheWVyX3JhbmdlIC0geikgLyB6X2xheWVyX3JhbmdlO1xcblwiICtcblwiICByZXR1cm4gejtcXG5cIiArXG5cIn1cXG5cIiArXG5cInZlYzMgZF94X3BvaW50TGlnaHQodmVjNCBwb3NpdGlvbiwgdmVjMyBub3JtYWwsIHZlYzMgY29sb3IsIHZlYzQgbGlnaHRfcG9zLCBmbG9hdCBsaWdodF9hbWJpZW50LCBjb25zdCBib29sIGJhY2tsaWdodCkge1xcblwiICtcblwiICB2ZWMzIGxpZ2h0X2RpciA9IG5vcm1hbGl6ZShwb3NpdGlvbi54eXogLSBsaWdodF9wb3MueHl6KTtcXG5cIiArXG5cIiAgY29sb3IgKj0gYWJzKG1heChmbG9hdChiYWNrbGlnaHQpICogLTEuLCBkb3Qobm9ybWFsLCBsaWdodF9kaXIgKiAtMS4wKSkpICsgbGlnaHRfYW1iaWVudDtcXG5cIiArXG5cIiAgcmV0dXJuIGNvbG9yO1xcblwiICtcblwifVxcblwiICtcblwiI3ByYWdtYSB0YW5ncmFtOiBnbG9iYWxzXFxuXCIgK1xuXCJcXG5cIiArXG5cInZvaWQgbWFpbigpIHtcXG5cIiArXG5cIiAgdmVjNCBwb3NpdGlvbiA9IHVfdGlsZV92aWV3ICogdmVjNChhX3Bvc2l0aW9uLCAxLik7XFxuXCIgK1xuXCIgICNwcmFnbWEgdGFuZ3JhbTogdmVydGV4XFxuXCIgK1xuXCIgIFxcblwiICtcblwiICAjaWYgZGVmaW5lZChMSUdIVElOR19WRVJURVgpXFxuXCIgK1xuXCIgIHZlYzQgbGlnaHRfcG9zID0gdmVjNCgwLiwgMC4sIDE1MC4gKiB1X21ldGVyc19wZXJfcGl4ZWwsIDEuKTtcXG5cIiArXG5cIiAgY29uc3QgZmxvYXQgbGlnaHRfYW1iaWVudCA9IDAuNTtcXG5cIiArXG5cIiAgY29uc3QgYm9vbCBiYWNrbGl0ID0gdHJ1ZTtcXG5cIiArXG5cIiAgdl9jb2xvciA9IGRfeF9wb2ludExpZ2h0KHBvc2l0aW9uLCBhX25vcm1hbCwgYV9jb2xvciwgbGlnaHRfcG9zLCBsaWdodF9hbWJpZW50LCBiYWNrbGl0KTtcXG5cIiArXG5cIiAgI2Vsc2VcXG5cIiArXG5cIiAgdl9wb3NpdGlvbiA9IHBvc2l0aW9uO1xcblwiICtcblwiICB2X25vcm1hbCA9IGFfbm9ybWFsO1xcblwiICtcblwiICB2X2NvbG9yID0gYV9jb2xvcjtcXG5cIiArXG5cIiAgI2VuZGlmXFxuXCIgK1xuXCIgIHBvc2l0aW9uID0gdV9tZXRlcl92aWV3ICogcG9zaXRpb247XFxuXCIgK1xuXCIgICNpZiBkZWZpbmVkKFBST0pFQ1RJT05fUEVSU1BFQ1RJVkUpXFxuXCIgK1xuXCIgIHBvc2l0aW9uID0gYV94X3BlcnNwZWN0aXZlKHBvc2l0aW9uLCB2ZWMyKC0wLjI1LCAtMC4yNSksIHZlYzIoMC42LCAwLjYpKTtcXG5cIiArXG5cIiAgI2VsaWYgZGVmaW5lZChQUk9KRUNUSU9OX0lTT01FVFJJQylcXG5cIiArXG5cIiAgcG9zaXRpb24gPSBiX3hfaXNvbWV0cmljKHBvc2l0aW9uLCB2ZWMyKDAuLCAxLiksIDEuKTtcXG5cIiArXG5cIiAgI2VuZGlmXFxuXCIgK1xuXCIgIHBvc2l0aW9uLnogPSBjX3hfY2FsY3VsYXRlWihwb3NpdGlvbi56LCBhX2xheWVyLCB1X251bV9sYXllcnMsIDQwOTYuKTtcXG5cIiArXG5cIiAgZ2xfUG9zaXRpb24gPSBwb3NpdGlvbjtcXG5cIiArXG5cIn1cXG5cIiArXG5cIlwiO1xuXG5tb2R1bGUuZXhwb3J0cyA9IHNoYWRlcl9zb3VyY2VzOyBcblxuIiwiLy8gVGV4dHVyZSBtYW5hZ2VtZW50XG5pbXBvcnQgKiBhcyBVdGlscyBmcm9tICcuLi91dGlscyc7XG5pbXBvcnQge0dMfSBmcm9tICcuL2dsJztcblxuXG4vLyBHbG9iYWwgc2V0IG9mIHRleHR1cmVzLCBieSBuYW1lXG5HTFRleHR1cmUudGV4dHVyZXMgPSB7fTtcblxuLy8gR0wgdGV4dHVyZSB3cmFwcGVyIG9iamVjdCBmb3Iga2VlcGluZyB0cmFjayBvZiBhIGdsb2JhbCBzZXQgb2YgdGV4dHVyZXMsIGtleWVkIGJ5IGFuIGFyYml0cmFyeSBuYW1lXG5leHBvcnQgZGVmYXVsdCBmdW5jdGlvbiBHTFRleHR1cmUgKGdsLCBuYW1lLCBvcHRpb25zKSB7XG4gICAgb3B0aW9ucyA9IG9wdGlvbnMgfHwge307XG4gICAgdGhpcy5nbCA9IGdsO1xuICAgIHRoaXMudGV4dHVyZSA9IGdsLmNyZWF0ZVRleHR1cmUoKTtcbiAgICB0aGlzLmJpbmQoMCk7XG4gICAgdGhpcy5pbWFnZSA9IG51bGw7XG5cbiAgICAvLyBEZWZhdWx0IHRvIGEgMS1waXhlbCBibGFjayB0ZXh0dXJlIHNvIHdlIGNhbiBzYWZlbHkgcmVuZGVyIHdoaWxlIHdlIHdhaXQgZm9yIGFuIGltYWdlIHRvIGxvYWRcbiAgICAvLyBTZWU6IGh0dHA6Ly9zdGFja292ZXJmbG93LmNvbS9xdWVzdGlvbnMvMTk3MjIyNDcvd2ViZ2wtd2FpdC1mb3ItdGV4dHVyZS10by1sb2FkXG4gICAgdGhpcy5zZXREYXRhKDEsIDEsIG5ldyBVaW50OEFycmF5KFswLCAwLCAwLCAyNTVdKSwgeyBmaWx0ZXJpbmc6ICduZWFyZXN0JyB9KTtcblxuICAgIC8vIFRPRE86IGJldHRlciBzdXBwb3J0IGZvciBub24tVVJMIHNvdXJjZXM6IGNhbnZhcy92aWRlbyBlbGVtZW50cywgcmF3IHBpeGVsIGJ1ZmZlcnNcblxuICAgIHRoaXMubmFtZSA9IG5hbWU7XG4gICAgR0xUZXh0dXJlLnRleHR1cmVzW3RoaXMubmFtZV0gPSB0aGlzO1xufTtcblxuR0xUZXh0dXJlLnByb3RvdHlwZS5iaW5kID0gZnVuY3Rpb24gKHVuaXQpIHtcbiAgICB0aGlzLmdsLmFjdGl2ZVRleHR1cmUodGhpcy5nbC5URVhUVVJFMCArIHVuaXQpO1xuICAgIHRoaXMuZ2wuYmluZFRleHR1cmUodGhpcy5nbC5URVhUVVJFXzJELCB0aGlzLnRleHR1cmUpO1xufTtcblxuLy8gTG9hZHMgYSB0ZXh0dXJlIGZyb20gYSBVUkxcbkdMVGV4dHVyZS5wcm90b3R5cGUubG9hZCA9IGZ1bmN0aW9uICh1cmwsIG9wdGlvbnMpIHtcbiAgICBvcHRpb25zID0gb3B0aW9ucyB8fCB7fTtcbiAgICB0aGlzLmltYWdlID0gbmV3IEltYWdlKCk7XG4gICAgdGhpcy5pbWFnZS5vbmxvYWQgPSAoKSA9PiB7XG4gICAgICAgIHRoaXMud2lkdGggPSB0aGlzLmltYWdlLndpZHRoO1xuICAgICAgICB0aGlzLmhlaWdodCA9IHRoaXMuaW1hZ2UuaGVpZ2h0O1xuICAgICAgICB0aGlzLmRhdGEgPSBudWxsOyAvLyBtdXR1YWxseSBleGNsdXNpdmUgd2l0aCBkaXJlY3QgZGF0YSBidWZmZXIgdGV4dHVyZXNcbiAgICAgICAgdGhpcy51cGRhdGUob3B0aW9ucyk7XG4gICAgICAgIHRoaXMuc2V0VGV4dHVyZUZpbHRlcmluZyhvcHRpb25zKTtcbiAgICB9O1xuICAgIHRoaXMuaW1hZ2Uuc3JjID0gdXJsO1xufTtcblxuLy8gU2V0cyB0ZXh0dXJlIHRvIGEgcmF3IGltYWdlIGJ1ZmZlclxuR0xUZXh0dXJlLnByb3RvdHlwZS5zZXREYXRhID0gZnVuY3Rpb24gKHdpZHRoLCBoZWlnaHQsIGRhdGEsIG9wdGlvbnMpIHtcbiAgICB0aGlzLndpZHRoID0gd2lkdGg7XG4gICAgdGhpcy5oZWlnaHQgPSBoZWlnaHQ7XG4gICAgdGhpcy5kYXRhID0gZGF0YTtcbiAgICB0aGlzLmltYWdlID0gbnVsbDsgLy8gbXV0dWFsbHkgZXhjbHVzaXZlIHdpdGggaW1hZ2UgZWxlbWVudC1iYXNlZCB0ZXh0dXJlc1xuXG4gICAgdGhpcy51cGRhdGUob3B0aW9ucyk7XG4gICAgdGhpcy5zZXRUZXh0dXJlRmlsdGVyaW5nKG9wdGlvbnMpO1xufTtcblxuLy8gVXBsb2FkcyBjdXJyZW50IGltYWdlIG9yIGJ1ZmZlciB0byB0aGUgR1BVIChjYW4gYmUgdXNlZCB0byB1cGRhdGUgYW5pbWF0ZWQgdGV4dHVyZXMgb24gdGhlIGZseSlcbkdMVGV4dHVyZS5wcm90b3R5cGUudXBkYXRlID0gZnVuY3Rpb24gKG9wdGlvbnMpIHtcbiAgICBvcHRpb25zID0gb3B0aW9ucyB8fCB7fTtcblxuICAgIHRoaXMuYmluZCgwKTtcbiAgICB0aGlzLmdsLnBpeGVsU3RvcmVpKHRoaXMuZ2wuVU5QQUNLX0ZMSVBfWV9XRUJHTCwgKG9wdGlvbnMuVU5QQUNLX0ZMSVBfWV9XRUJHTCA9PT0gZmFsc2UgPyBmYWxzZSA6IHRydWUpKTtcblxuICAgIC8vIEltYWdlIGVsZW1lbnRcbiAgICBpZiAodGhpcy5pbWFnZSAmJiB0aGlzLmltYWdlLmNvbXBsZXRlKSB7XG4gICAgICAgIHRoaXMuZ2wudGV4SW1hZ2UyRCh0aGlzLmdsLlRFWFRVUkVfMkQsIDAsIHRoaXMuZ2wuUkdCQSwgdGhpcy5nbC5SR0JBLCB0aGlzLmdsLlVOU0lHTkVEX0JZVEUsIHRoaXMuaW1hZ2UpO1xuICAgIH1cbiAgICAvLyBSYXcgaW1hZ2UgYnVmZmVyXG4gICAgZWxzZSBpZiAodGhpcy53aWR0aCAmJiB0aGlzLmhlaWdodCkgeyAvLyBOT1RFOiB0aGlzLmRhdGEgY2FuIGJlIG51bGwsIHRvIHplcm8gb3V0IHRleHR1cmVcbiAgICAgICAgdGhpcy5nbC50ZXhJbWFnZTJEKHRoaXMuZ2wuVEVYVFVSRV8yRCwgMCwgdGhpcy5nbC5SR0JBLCB0aGlzLndpZHRoLCB0aGlzLmhlaWdodCwgMCwgdGhpcy5nbC5SR0JBLCB0aGlzLmdsLlVOU0lHTkVEX0JZVEUsIHRoaXMuZGF0YSk7XG4gICAgfVxufTtcblxuLy8gRGV0ZXJtaW5lcyBhcHByb3ByaWF0ZSBmaWx0ZXJpbmcgbW9kZVxuLy8gQXNzdW1lcyB0ZXh0dXJlIHRvIGJlIG9wZXJhdGVkIG9uIGlzIGFscmVhZHkgYm91bmRcbkdMVGV4dHVyZS5wcm90b3R5cGUuc2V0VGV4dHVyZUZpbHRlcmluZyA9IGZ1bmN0aW9uIChvcHRpb25zKSB7XG4gICAgb3B0aW9ucyA9IG9wdGlvbnMgfHwge307XG4gICAgb3B0aW9ucy5maWx0ZXJpbmcgPSBvcHRpb25zLmZpbHRlcmluZyB8fCAnbWlwbWFwJzsgLy8gZGVmYXVsdCB0byBtaXBtYXBzIGZvciBwb3dlci1vZi0yIHRleHR1cmVzXG4gICAgdmFyIGdsID0gdGhpcy5nbDtcblxuICAgIC8vIEZvciBwb3dlci1vZi0yIHRleHR1cmVzLCB0aGUgZm9sbG93aW5nIHByZXNldHMgYXJlIGF2YWlsYWJsZTpcbiAgICAvLyBtaXBtYXA6IGxpbmVhciBibGVuZCBmcm9tIG5lYXJlc3QgbWlwXG4gICAgLy8gbGluZWFyOiBsaW5lYXIgYmxlbmQgZnJvbSBvcmlnaW5hbCBpbWFnZSAobm8gbWlwcylcbiAgICAvLyBuZWFyZXN0OiBuZWFyZXN0IHBpeGVsIGZyb20gb3JpZ2luYWwgaW1hZ2UgKG5vIG1pcHMsICdibG9ja3knIGxvb2spXG4gICAgaWYgKFV0aWxzLmlzUG93ZXJPZjIodGhpcy53aWR0aCkgJiYgVXRpbHMuaXNQb3dlck9mMih0aGlzLmhlaWdodCkpIHtcbiAgICAgICAgdGhpcy5wb3dlcl9vZl8yID0gdHJ1ZTtcbiAgICAgICAgZ2wudGV4UGFyYW1ldGVyaShnbC5URVhUVVJFXzJELCBnbC5URVhUVVJFX1dSQVBfUywgb3B0aW9ucy5URVhUVVJFX1dSQVBfUyB8fCBnbC5DTEFNUF9UT19FREdFKTtcbiAgICAgICAgZ2wudGV4UGFyYW1ldGVyaShnbC5URVhUVVJFXzJELCBnbC5URVhUVVJFX1dSQVBfVCwgb3B0aW9ucy5URVhUVVJFX1dSQVBfVCB8fCBnbC5DTEFNUF9UT19FREdFKTtcblxuICAgICAgICBpZiAob3B0aW9ucy5maWx0ZXJpbmcgPT0gJ21pcG1hcCcpIHtcbiAgICAgICAgICAgIC8vIGNvbnNvbGUubG9nKFwicG93ZXItb2YtMiBNSVBNQVBcIik7XG4gICAgICAgICAgICB0aGlzLmZpbHRlcmluZyA9ICdtaXBtYXAnO1xuICAgICAgICAgICAgZ2wudGV4UGFyYW1ldGVyaShnbC5URVhUVVJFXzJELCBnbC5URVhUVVJFX01JTl9GSUxURVIsIGdsLkxJTkVBUl9NSVBNQVBfTkVBUkVTVCk7IC8vIFRPRE86IHVzZSB0cmlsaW5lYXIgZmlsdGVyaW5nIGJ5IGRlZnVhbHQgaW5zdGVhZD9cbiAgICAgICAgICAgIGdsLnRleFBhcmFtZXRlcmkoZ2wuVEVYVFVSRV8yRCwgZ2wuVEVYVFVSRV9NQUdfRklMVEVSLCBnbC5MSU5FQVIpO1xuICAgICAgICAgICAgZ2wuZ2VuZXJhdGVNaXBtYXAoZ2wuVEVYVFVSRV8yRCk7XG4gICAgICAgIH1cbiAgICAgICAgZWxzZSBpZiAob3B0aW9ucy5maWx0ZXJpbmcgPT0gJ2xpbmVhcicpIHtcbiAgICAgICAgICAgIC8vIGNvbnNvbGUubG9nKFwicG93ZXItb2YtMiBMSU5FQVJcIik7XG4gICAgICAgICAgICB0aGlzLmZpbHRlcmluZyA9ICdsaW5lYXInO1xuICAgICAgICAgICAgZ2wudGV4UGFyYW1ldGVyaShnbC5URVhUVVJFXzJELCBnbC5URVhUVVJFX01JTl9GSUxURVIsIGdsLkxJTkVBUik7XG4gICAgICAgICAgICBnbC50ZXhQYXJhbWV0ZXJpKGdsLlRFWFRVUkVfMkQsIGdsLlRFWFRVUkVfTUFHX0ZJTFRFUiwgZ2wuTElORUFSKTtcbiAgICAgICAgfVxuICAgICAgICBlbHNlIGlmIChvcHRpb25zLmZpbHRlcmluZyA9PSAnbmVhcmVzdCcpIHtcbiAgICAgICAgICAgIC8vIGNvbnNvbGUubG9nKFwicG93ZXItb2YtMiBORUFSRVNUXCIpO1xuICAgICAgICAgICAgdGhpcy5maWx0ZXJpbmcgPSAnbmVhcmVzdCc7XG4gICAgICAgICAgICBnbC50ZXhQYXJhbWV0ZXJpKGdsLlRFWFRVUkVfMkQsIGdsLlRFWFRVUkVfTUlOX0ZJTFRFUiwgZ2wuTkVBUkVTVCk7XG4gICAgICAgICAgICBnbC50ZXhQYXJhbWV0ZXJpKGdsLlRFWFRVUkVfMkQsIGdsLlRFWFRVUkVfTUFHX0ZJTFRFUiwgZ2wuTkVBUkVTVCk7XG4gICAgICAgIH1cbiAgICB9XG4gICAgZWxzZSB7XG4gICAgICAgIC8vIFdlYkdMIGhhcyBzdHJpY3QgcmVxdWlyZW1lbnRzIG9uIG5vbi1wb3dlci1vZi0yIHRleHR1cmVzOlxuICAgICAgICAvLyBObyBtaXBtYXBzIGFuZCBtdXN0IGNsYW1wIHRvIGVkZ2VcbiAgICAgICAgdGhpcy5wb3dlcl9vZl8yID0gZmFsc2U7XG4gICAgICAgIGdsLnRleFBhcmFtZXRlcmkoZ2wuVEVYVFVSRV8yRCwgZ2wuVEVYVFVSRV9XUkFQX1MsIGdsLkNMQU1QX1RPX0VER0UpO1xuICAgICAgICBnbC50ZXhQYXJhbWV0ZXJpKGdsLlRFWFRVUkVfMkQsIGdsLlRFWFRVUkVfV1JBUF9ULCBnbC5DTEFNUF9UT19FREdFKTtcblxuICAgICAgICBpZiAob3B0aW9ucy5maWx0ZXJpbmcgPT0gJ25lYXJlc3QnKSB7XG4gICAgICAgICAgICAvLyBjb25zb2xlLmxvZyhcInBvd2VyLW9mLTIgTkVBUkVTVFwiKTtcbiAgICAgICAgICAgIHRoaXMuZmlsdGVyaW5nID0gJ25lYXJlc3QnO1xuICAgICAgICAgICAgZ2wudGV4UGFyYW1ldGVyaShnbC5URVhUVVJFXzJELCBnbC5URVhUVVJFX01JTl9GSUxURVIsIGdsLk5FQVJFU1QpO1xuICAgICAgICAgICAgZ2wudGV4UGFyYW1ldGVyaShnbC5URVhUVVJFXzJELCBnbC5URVhUVVJFX01BR19GSUxURVIsIGdsLk5FQVJFU1QpO1xuICAgICAgICB9XG4gICAgICAgIGVsc2UgeyAvLyBkZWZhdWx0IHRvIGxpbmVhciBmb3Igbm9uLXBvd2VyLW9mLTIgdGV4dHVyZXNcbiAgICAgICAgICAgIC8vIGNvbnNvbGUubG9nKFwicG93ZXItb2YtMiBMSU5FQVJcIik7XG4gICAgICAgICAgICB0aGlzLmZpbHRlcmluZyA9ICdsaW5lYXInO1xuICAgICAgICAgICAgZ2wudGV4UGFyYW1ldGVyaShnbC5URVhUVVJFXzJELCBnbC5URVhUVVJFX01JTl9GSUxURVIsIGdsLkxJTkVBUik7XG4gICAgICAgICAgICBnbC50ZXhQYXJhbWV0ZXJpKGdsLlRFWFRVUkVfMkQsIGdsLlRFWFRVUkVfTUFHX0ZJTFRFUiwgZ2wuTElORUFSKTtcbiAgICAgICAgfVxuICAgIH1cbn07XG4iLCIvLyBEZXNjcmliZXMgYSB2ZXJ0ZXggbGF5b3V0IHRoYXQgY2FuIGJlIHVzZWQgd2l0aCBtYW55IGRpZmZlcmVudCBHTCBwcm9ncmFtcy5cbi8vIElmIGEgZ2l2ZW4gcHJvZ3JhbSBkb2Vzbid0IGluY2x1ZGUgYWxsIGF0dHJpYnV0ZXMsIGl0IGNhbiBzdGlsbCB1c2UgdGhlIHZlcnRleCBsYXlvdXRcbi8vIHRvIHJlYWQgdGhvc2UgYXR0cmlicyB0aGF0IGl0IGRvZXMgcmVjb2duaXplLCB1c2luZyB0aGUgYXR0cmliIG9mZnNldHMgdG8gc2tpcCBvdGhlcnMuXG4vLyBBdHRyaWJzIGFyZSBhbiBhcnJheSwgaW4gbGF5b3V0IG9yZGVyLCBvZjogbmFtZSwgc2l6ZSwgdHlwZSwgbm9ybWFsaXplZFxuLy8gZXg6IHsgbmFtZTogJ3Bvc2l0aW9uJywgc2l6ZTogMywgdHlwZTogZ2wuRkxPQVQsIG5vcm1hbGl6ZWQ6IGZhbHNlIH1cbmV4cG9ydCBkZWZhdWx0IGZ1bmN0aW9uIEdMVmVydGV4TGF5b3V0IChnbCwgYXR0cmlicykge1xuICAgIHRoaXMuYXR0cmlicyA9IGF0dHJpYnM7XG5cbiAgICAvLyBDYWxjIHZlcnRleCBzdHJpZGVcbiAgICB0aGlzLnN0cmlkZSA9IDA7XG4gICAgZm9yICh2YXIgYT0wOyBhIDwgdGhpcy5hdHRyaWJzLmxlbmd0aDsgYSsrKSB7XG4gICAgICAgIHZhciBhdHRyaWIgPSB0aGlzLmF0dHJpYnNbYV07XG5cbiAgICAgICAgYXR0cmliLmJ5dGVfc2l6ZSA9IGF0dHJpYi5zaXplO1xuXG4gICAgICAgIHN3aXRjaCAoYXR0cmliLnR5cGUpIHtcbiAgICAgICAgICAgIGNhc2UgZ2wuRkxPQVQ6XG4gICAgICAgICAgICBjYXNlIGdsLklOVDpcbiAgICAgICAgICAgIGNhc2UgZ2wuVU5TSUdORURfSU5UOlxuICAgICAgICAgICAgICAgIGF0dHJpYi5ieXRlX3NpemUgKj0gNDtcbiAgICAgICAgICAgICAgICBicmVhaztcbiAgICAgICAgICAgIGNhc2UgZ2wuU0hPUlQ6XG4gICAgICAgICAgICBjYXNlIGdsLlVOU0lHTkVEX1NIT1JUOlxuICAgICAgICAgICAgICAgIGF0dHJpYi5ieXRlX3NpemUgKj0gMjtcbiAgICAgICAgICAgICAgICBicmVhaztcbiAgICAgICAgfVxuXG4gICAgICAgIGF0dHJpYi5vZmZzZXQgPSB0aGlzLnN0cmlkZTtcbiAgICAgICAgdGhpcy5zdHJpZGUgKz0gYXR0cmliLmJ5dGVfc2l6ZTtcbiAgICB9XG59XG5cbi8vIFRyYWNrIGN1cnJlbnRseSBlbmFibGVkIGF0dHJpYnMsIGJ5IHRoZSBwcm9ncmFtIHRoZXkgYXJlIGJvdW5kIHRvXG5HTFZlcnRleExheW91dC5lbmFibGVkX2F0dHJpYnMgPSB7fTtcblxuLy8gU2V0dXAgYSB2ZXJ0ZXggbGF5b3V0IGZvciBhIHNwZWNpZmljIEdMIHByb2dyYW1cbi8vIEFzc3VtZXMgdGhhdCB0aGUgZGVzaXJlZCB2ZXJ0ZXggYnVmZmVyIChWQk8pIGlzIGFscmVhZHkgYm91bmRcbkdMVmVydGV4TGF5b3V0LnByb3RvdHlwZS5lbmFibGUgPSBmdW5jdGlvbiAoZ2wsIGdsX3Byb2dyYW0pXG57XG4gICAgLy8gRW5hYmxlIGFsbCBhdHRyaWJ1dGVzIGZvciB0aGlzIGxheW91dFxuICAgIGZvciAodmFyIGE9MDsgYSA8IHRoaXMuYXR0cmlicy5sZW5ndGg7IGErKykge1xuICAgICAgICB2YXIgYXR0cmliID0gdGhpcy5hdHRyaWJzW2FdO1xuICAgICAgICB2YXIgbG9jYXRpb24gPSBnbF9wcm9ncmFtLmF0dHJpYnV0ZShhdHRyaWIubmFtZSkubG9jYXRpb247XG5cbiAgICAgICAgaWYgKGxvY2F0aW9uICE9IC0xKSB7XG4gICAgICAgICAgICBnbC5lbmFibGVWZXJ0ZXhBdHRyaWJBcnJheShsb2NhdGlvbik7XG4gICAgICAgICAgICBnbC52ZXJ0ZXhBdHRyaWJQb2ludGVyKGxvY2F0aW9uLCBhdHRyaWIuc2l6ZSwgYXR0cmliLnR5cGUsIGF0dHJpYi5ub3JtYWxpemVkLCB0aGlzLnN0cmlkZSwgYXR0cmliLm9mZnNldCk7XG4gICAgICAgICAgICBHTFZlcnRleExheW91dC5lbmFibGVkX2F0dHJpYnNbbG9jYXRpb25dID0gZ2xfcHJvZ3JhbTtcbiAgICAgICAgfVxuICAgIH1cblxuICAgIC8vIERpc2FibGUgYW55IHByZXZpb3VzbHkgYm91bmQgYXR0cmlidXRlcyB0aGF0IGFyZW4ndCBmb3IgdGhpcyBsYXlvdXRcbiAgICB2YXIgdW51c3VlZF9hdHRyaWJzID0gW107XG4gICAgZm9yIChsb2NhdGlvbiBpbiBHTFZlcnRleExheW91dC5lbmFibGVkX2F0dHJpYnMpIHtcbiAgICAgICAgaWYgKEdMVmVydGV4TGF5b3V0LmVuYWJsZWRfYXR0cmlic1tsb2NhdGlvbl0gIT0gZ2xfcHJvZ3JhbSkge1xuICAgICAgICAgICAgZ2wuZGlzYWJsZVZlcnRleEF0dHJpYkFycmF5KGxvY2F0aW9uKTtcbiAgICAgICAgICAgIHVudXN1ZWRfYXR0cmlicy5wdXNoKGxvY2F0aW9uKTtcbiAgICAgICAgfVxuICAgIH1cblxuICAgIC8vIE1hcmsgYXR0cmlicyBhcyB1bnVzZWRcbiAgICBmb3IgKGxvY2F0aW9uIGluIHVudXN1ZWRfYXR0cmlicykge1xuICAgICAgICBkZWxldGUgR0xWZXJ0ZXhMYXlvdXQuZW5hYmxlZF9hdHRyaWJzW2xvY2F0aW9uXTtcbiAgICB9XG59O1xuIiwiaW1wb3J0IFNjZW5lIGZyb20gJy4vc2NlbmUnO1xuXG5leHBvcnQgdmFyIExlYWZsZXRMYXllciA9IEwuR3JpZExheWVyLmV4dGVuZCh7XG5cbiAgICBpbml0aWFsaXplOiBmdW5jdGlvbiAob3B0aW9ucykge1xuICAgICAgICBMLnNldE9wdGlvbnModGhpcywgb3B0aW9ucyk7XG4gICAgICAgIHRoaXMuc2NlbmUgPSBuZXcgU2NlbmUoXG4gICAgICAgICAgICB0aGlzLm9wdGlvbnMudmVjdG9yVGlsZVNvdXJjZSxcbiAgICAgICAgICAgIHRoaXMub3B0aW9ucy52ZWN0b3JMYXllcnMsXG4gICAgICAgICAgICB0aGlzLm9wdGlvbnMudmVjdG9yU3R5bGVzLFxuICAgICAgICAgICAgeyBudW1fd29ya2VyczogdGhpcy5vcHRpb25zLm51bVdvcmtlcnMgfVxuICAgICAgICApO1xuXG4gICAgICAgIHRoaXMuc2NlbmUuZGVidWcgPSB0aGlzLm9wdGlvbnMuZGVidWc7XG4gICAgICAgIHRoaXMuc2NlbmUuY29udGludW91c19hbmltYXRpb24gPSBmYWxzZTsgLy8gc2V0IHRvIHRydWUgZm9yIGFuaW1hdGlub3MsIGV0Yy4gKGV2ZW50dWFsbHkgd2lsbCBiZSBhdXRvbWF0ZWQpXG4gICAgfSxcblxuICAgIC8vIEZpbmlzaCBpbml0aWFsaXppbmcgc2NlbmUgYW5kIHNldHVwIGV2ZW50cyB3aGVuIGxheWVyIGlzIGFkZGVkIHRvIG1hcFxuICAgIG9uQWRkOiBmdW5jdGlvbiAobWFwKSB7XG5cbiAgICAgICAgdGhpcy5vbigndGlsZXVubG9hZCcsIChldmVudCkgPT4ge1xuICAgICAgICAgICAgdmFyIHRpbGUgPSBldmVudC50aWxlO1xuICAgICAgICAgICAgdmFyIGtleSA9IHRpbGUuZ2V0QXR0cmlidXRlKCdkYXRhLXRpbGUta2V5Jyk7XG4gICAgICAgICAgICB0aGlzLnNjZW5lLnJlbW92ZVRpbGUoa2V5KTtcbiAgICAgICAgfSk7XG5cbiAgICAgICAgdGhpcy5fbWFwLm9uKCdyZXNpemUnLCAoKSA9PiB7XG4gICAgICAgICAgICB2YXIgc2l6ZSA9IHRoaXMuX21hcC5nZXRTaXplKCk7XG4gICAgICAgICAgICB0aGlzLnNjZW5lLnJlc2l6ZU1hcChzaXplLngsIHNpemUueSk7XG4gICAgICAgICAgICB0aGlzLnVwZGF0ZUJvdW5kcygpO1xuICAgICAgICB9KTtcblxuICAgICAgICB0aGlzLl9tYXAub24oJ21vdmUnLCAgKCkgPT4ge1xuICAgICAgICAgICAgdmFyIGNlbnRlciA9IHRoaXMuX21hcC5nZXRDZW50ZXIoKTtcbiAgICAgICAgICAgIHRoaXMuc2NlbmUuc2V0Q2VudGVyKGNlbnRlci5sbmcsIGNlbnRlci5sYXQpO1xuICAgICAgICAgICAgdGhpcy51cGRhdGVCb3VuZHMoKTtcbiAgICAgICAgfSk7XG5cbiAgICAgICAgdGhpcy5fbWFwLm9uKCd6b29tc3RhcnQnLCAoKSA9PiB7XG4gICAgICAgICAgICBjb25zb2xlLmxvZyhcIm1hcC56b29tc3RhcnQgXCIgKyB0aGlzLl9tYXAuZ2V0Wm9vbSgpKTtcbiAgICAgICAgICAgIHRoaXMuc2NlbmUuc3RhcnRab29tKCk7XG4gICAgICAgIH0pO1xuXG4gICAgICAgIHRoaXMuX21hcC5vbignem9vbWVuZCcsICAoKSA9PiB7XG4gICAgICAgICAgICBjb25zb2xlLmxvZyhcIm1hcC56b29tZW5kIFwiICsgdGhpcy5fbWFwLmdldFpvb20oKSk7XG4gICAgICAgICAgICB0aGlzLnNjZW5lLnNldFpvb20odGhpcy5fbWFwLmdldFpvb20oKSk7XG4gICAgICAgICAgICB0aGlzLnVwZGF0ZUJvdW5kcygpO1xuICAgICAgICB9KTtcblxuICAgICAgICB0aGlzLl9tYXAub24oJ2RyYWdzdGFydCcsICAoKSA9PiB7XG4gICAgICAgICAgICB0aGlzLnNjZW5lLnBhbm5pbmcgPSB0cnVlO1xuICAgICAgICB9KTtcblxuICAgICAgICB0aGlzLl9tYXAub24oJ2RyYWdlbmQnLCAoKSA9PiB7XG4gICAgICAgICAgICB0aGlzLnNjZW5lLnBhbm5pbmcgPSBmYWxzZTtcbiAgICAgICAgfSk7XG5cbiAgICAgICAgLy8gQ2FudmFzIGVsZW1lbnQgd2lsbCBiZSBpbnNlcnRlZCBhZnRlciBtYXAgY29udGFpbmVyIChsZWFmbGV0IHRyYW5zZm9ybXMgc2hvdWxkbid0IGJlIGFwcGxpZWQgdG8gdGhlIEdMIGNhbnZhcylcbiAgICAgICAgLy8gVE9ETzogZmluZCBhIGJldHRlciB3YXkgdG8gZGVhbCB3aXRoIHRoaXM/IHJpZ2h0IG5vdyBHTCBtYXAgb25seSByZW5kZXJzIGNvcnJlY3RseSBhcyB0aGUgYm90dG9tIGxheWVyXG4gICAgICAgIHRoaXMuc2NlbmUuY29udGFpbmVyID0gdGhpcy5fbWFwLmdldENvbnRhaW5lcigpO1xuXG4gICAgICAgIHZhciBjZW50ZXIgPSB0aGlzLl9tYXAuZ2V0Q2VudGVyKCk7XG4gICAgICAgIHRoaXMuc2NlbmUuc2V0Q2VudGVyKGNlbnRlci5sbmcsIGNlbnRlci5sYXQpO1xuICAgICAgICBjb25zb2xlLmxvZyhcInpvb206IFwiICsgdGhpcy5fbWFwLmdldFpvb20oKSk7XG4gICAgICAgIHRoaXMuc2NlbmUuc2V0Wm9vbSh0aGlzLl9tYXAuZ2V0Wm9vbSgpKTtcbiAgICAgICAgdGhpcy51cGRhdGVCb3VuZHMoKTtcblxuICAgICAgICBMLkdyaWRMYXllci5wcm90b3R5cGUub25BZGQuYXBwbHkodGhpcywgYXJndW1lbnRzKTtcblxuICAgICAgICAvLyBVc2UgbGVhZmxldCdzIGV4aXN0aW5nIGV2ZW50IHN5c3RlbSBhcyB0aGUgY2FsbGJhY2sgbWVjaGFuaXNtXG4gICAgICAgIHRoaXMuc2NlbmUuaW5pdCgoKSA9PiB7XG4gICAgICAgICAgICB0aGlzLmZpcmUoJ2luaXQnKTtcbiAgICAgICAgfSk7XG4gICAgfSxcblxuICAgIG9uUmVtb3ZlOiBmdW5jdGlvbiAobWFwKSB7XG4gICAgICAgIEwuR3JpZExheWVyLnByb3RvdHlwZS5vblJlbW92ZS5hcHBseSh0aGlzLCBhcmd1bWVudHMpO1xuICAgICAgICAvLyBUT0RPOiByZW1vdmUgZXZlbnQgaGFuZGxlcnMsIGRlc3Ryb3kgbWFwXG4gICAgfSxcblxuICAgIGNyZWF0ZVRpbGU6IGZ1bmN0aW9uIChjb29yZHMsIGRvbmUpIHtcbiAgICAgICAgdmFyIGRpdiA9IGRvY3VtZW50LmNyZWF0ZUVsZW1lbnQoJ2RpdicpO1xuICAgICAgICB0aGlzLnNjZW5lLmxvYWRUaWxlKGNvb3JkcywgZGl2LCBkb25lKTtcbiAgICAgICAgcmV0dXJuIGRpdjtcbiAgICB9LFxuXG4gICAgdXBkYXRlQm91bmRzOiBmdW5jdGlvbiAoKSB7XG4gICAgICAgIHZhciBib3VuZHMgPSB0aGlzLl9tYXAuZ2V0Qm91bmRzKCk7XG4gICAgICAgIHRoaXMuc2NlbmUuc2V0Qm91bmRzKGJvdW5kcy5nZXRTb3V0aFdlc3QoKSwgYm91bmRzLmdldE5vcnRoRWFzdCgpKTtcbiAgICB9LFxuXG4gICAgcmVuZGVyOiBmdW5jdGlvbiAoKSB7XG4gICAgICAgIHRoaXMuc2NlbmUucmVuZGVyKCk7XG4gICAgfVxuXG59KTtcblxuZXhwb3J0IGZ1bmN0aW9uIGxlYWZsZXRMYXllcihvcHRpb25zKSB7XG4gICAgcmV0dXJuIG5ldyBMZWFmbGV0TGF5ZXIob3B0aW9ucyk7XG59XG4iLCIvLyBNb2R1bGVzIGFuZCBkZXBlbmRlbmNpZXMgdG8gZXhwb3NlIGluIHRoZSBwdWJsaWMgVGFuZ3JhbSBtb2R1bGVcblxuLy8gVGhlIGxlYWZsZXQgbGF5ZXIgcGx1Z2luIGlzIGN1cnJlbnRseSB0aGUgcHJpbWFyeSBtZWFucyBvZiB1c2luZyB0aGUgbGlicmFyeVxuXG5pbXBvcnQge0xlYWZsZXRMYXllciwgbGVhZmxldExheWVyfSBmcm9tICcuL2xlYWZsZXRfbGF5ZXInO1xuaW1wb3J0IHtHTH0gZnJvbSAnLi9nbC9nbCc7XG4vLyBHTCBmdW5jdGlvbnMgaW5jbHVkZWQgZm9yIGVhc2llciBkZWJ1Z2dpbmcgLyBkaXJlY3QgYWNjZXNzIHRvIHNldHRpbmcgZ2xvYmFsIGRlZmluZXMsIHJlbG9hZGluZyBwcm9ncmFtcywgZXRjLlxuXG5HTC5Qcm9ncmFtID0gcmVxdWlyZSgnLi9nbC9nbF9wcm9ncmFtLmpzJykuZGVmYXVsdDtcbkdMLlRleHR1cmUgPSByZXF1aXJlKCcuL2dsL2dsX3RleHR1cmUuanMnKTtcblxubW9kdWxlLmV4cG9ydHMgPSB7XG4gICAgTGVhZmxldExheWVyOiBMZWFmbGV0TGF5ZXIsXG4gICAgbGVhZmxldExheWVyOiBsZWFmbGV0TGF5ZXIsXG4gICAgR0w6IEdMXG59O1xuXG4iLCJcbmV4cG9ydCBkZWZhdWx0IGNsYXNzIFBvaW50IHtcbiAgICBjb25zdHJ1Y3Rvcih4LCB5KSB7XG4gICAgICAgIGlmICghICh0aGlzIGluc3RhbmNlb2YgUG9pbnQpKSB7XG4gICAgICAgICAgICByZXR1cm4gbmV3IFBvaW50KHgsIHkpO1xuICAgICAgICB9XG4gICAgICAgIHRoaXMueCA9IHg7XG4gICAgICAgIHRoaXMueSA9IHk7XG4gICAgfVxuXG4gICAgc3RhdGljIGNvcHkob3RoZXIpIHtcbiAgICAgICAgaWYgKG90aGVyID09IG51bGwpIHtcbiAgICAgICAgICAgIHJldHVybiBudWxsO1xuICAgICAgICB9XG4gICAgICAgIHJldHVybiBuZXcgUG9pbnQob3RoZXIueCwgb3RoZXIueSk7XG4gICAgfVxufVxuIiwiaW1wb3J0IFBvaW50IGZyb20gJy4vcG9pbnQnO1xuaW1wb3J0IHtHZW99IGZyb20gJy4vZ2VvJztcbmltcG9ydCAqIGFzIFV0aWxzIGZyb20gJy4vdXRpbHMnO1xuaW1wb3J0IHtTdHlsZX0gZnJvbSAnLi9zdHlsZSc7XG5pbXBvcnQgKiBhcyBRdWV1ZSBmcm9tICdxdWV1ZS1hc3luYyc7XG5pbXBvcnQge0dMfSBmcm9tICcuL2dsL2dsJztcbmltcG9ydCB7R0xCdWlsZGVyc30gZnJvbSAnLi9nbC9nbF9idWlsZGVycyc7XG5pbXBvcnQgR0xQcm9ncmFtIGZyb20gJy4vZ2wvZ2xfcHJvZ3JhbSc7XG5pbXBvcnQgR0xUZXh0dXJlIGZyb20gJy4vZ2wvZ2xfdGV4dHVyZSc7XG5pbXBvcnQge01vZGVNYW5hZ2VyfSBmcm9tICcuL2dsL2dsX21vZGVzJztcbmltcG9ydCBDYW1lcmEgZnJvbSAnLi9jYW1lcmEnO1xuXG5pbXBvcnQge21hdDQsIHZlYzN9IGZyb20gJ2dsLW1hdHJpeCc7XG5cbi8vIFNldHVwIHRoYXQgaGFwcGVucyBvbiBtYWluIHRocmVhZCBvbmx5IChza2lwIGluIHdlYiB3b3JrZXIpXG52YXIgeWFtbDtcblV0aWxzLnJ1bklmSW5NYWluVGhyZWFkKGZ1bmN0aW9uKCkge1xuICAgIHRyeSB7XG4gICAgICAgIHlhbWwgPSByZXF1aXJlKCdqcy15YW1sJyk7XG4gICAgfVxuICAgIGNhdGNoIChlKSB7XG4gICAgICAgIGNvbnNvbGUubG9nKFwibm8gWUFNTCBzdXBwb3J0LCBqcy15YW1sIG1vZHVsZSBub3QgZm91bmRcIik7XG4gICAgfVxuXG4gICAgZmluZEJhc2VMaWJyYXJ5VVJMKCk7XG59KTtcblxuLy8gR2xvYmFsIHNldHVwXG5TY2VuZS50aWxlX3NjYWxlID0gNDA5NjsgLy8gY29vcmRpbmF0ZXMgYXJlIGxvY2FsbHkgc2NhbGVkIHRvIHRoZSByYW5nZSBbMCwgdGlsZV9zY2FsZV1cbkdlby5zZXRUaWxlU2NhbGUoU2NlbmUudGlsZV9zY2FsZSk7XG5HTEJ1aWxkZXJzLnNldFRpbGVTY2FsZShTY2VuZS50aWxlX3NjYWxlKTtcbkdMUHJvZ3JhbS5kZWZpbmVzLlRJTEVfU0NBTEUgPSBTY2VuZS50aWxlX3NjYWxlO1xuU2NlbmUuZGVidWcgPSBmYWxzZTtcblxuLy8gTGF5ZXJzICYgc3R5bGVzOiBwYXNzIGFuIG9iamVjdCBkaXJlY3RseSwgb3IgYSBVUkwgYXMgc3RyaW5nIHRvIGxvYWQgcmVtb3RlbHlcbi8vIFRPRE8sIGNvbnZlcnQgdGhpcyB0byB0aGUgY2xhc3Mgc3l0bmF4IG9uY2Ugd2UgZ2V0IHRoZSBydW50aW1lXG4vLyB3b3JraW5nLCBJV1xuZXhwb3J0IGRlZmF1bHQgZnVuY3Rpb24gU2NlbmUodGlsZV9zb3VyY2UsIGxheWVycywgc3R5bGVzLCBvcHRpb25zKSB7XG4gICAgdmFyIG9wdGlvbnMgPSBvcHRpb25zIHx8IHt9O1xuICAgIHRoaXMuaW5pdGlhbGl6ZWQgPSBmYWxzZTtcblxuICAgIHRoaXMudGlsZV9zb3VyY2UgPSB0aWxlX3NvdXJjZTtcbiAgICB0aGlzLnRpbGVzID0ge307XG4gICAgdGhpcy5xdWV1ZWRfdGlsZXMgPSBbXTtcbiAgICB0aGlzLm51bV93b3JrZXJzID0gb3B0aW9ucy5udW1fd29ya2VycyB8fCAxO1xuICAgIHRoaXMuYWxsb3dfY3Jvc3NfZG9tYWluX3dvcmtlcnMgPSAob3B0aW9ucy5hbGxvd19jcm9zc19kb21haW5fd29ya2VycyA9PT0gZmFsc2UgPyBmYWxzZSA6IHRydWUpO1xuXG4gICAgdGhpcy5sYXllcnMgPSBsYXllcnM7XG4gICAgdGhpcy5zdHlsZXMgPSBzdHlsZXM7XG5cbiAgICB0aGlzLmRpcnR5ID0gdHJ1ZTsgLy8gcmVxdWVzdCBhIHJlZHJhd1xuICAgIHRoaXMuYW5pbWF0ZWQgPSBmYWxzZTsgLy8gcmVxdWVzdCByZWRyYXcgZXZlcnkgZnJhbWVcblxuICAgIHRoaXMuZnJhbWUgPSAwO1xuICAgIHRoaXMuem9vbSA9IG51bGw7XG4gICAgdGhpcy5jZW50ZXIgPSBudWxsO1xuICAgIHRoaXMuZGV2aWNlX3BpeGVsX3JhdGlvID0gd2luZG93LmRldmljZVBpeGVsUmF0aW8gfHwgMTtcblxuICAgIHRoaXMuem9vbWluZyA9IGZhbHNlO1xuICAgIHRoaXMucGFubmluZyA9IGZhbHNlO1xuXG4gICAgdGhpcy5jb250YWluZXIgPSBvcHRpb25zLmNvbnRhaW5lcjtcblxuICAgIHRoaXMucmVzZXRUaW1lKCk7XG59XG5cblNjZW5lLnByb3RvdHlwZS5pbml0ID0gZnVuY3Rpb24gKGNhbGxiYWNrKSB7XG4gICAgaWYgKHRoaXMuaW5pdGlhbGl6ZWQpIHtcbiAgICAgICAgcmV0dXJuO1xuICAgIH1cblxuICAgIC8vIExvYWQgc2NlbmUgZGVmaW5pdGlvbiAobGF5ZXJzLCBzdHlsZXMsIGV0Yy4pLCB0aGVuIGNyZWF0ZSBtb2RlcyAmIHdvcmtlcnNcbiAgICB0aGlzLmxvYWRTY2VuZSgoKSA9PiB7XG4gICAgICAgIHZhciBxdWV1ZSA9IFF1ZXVlKCk7XG5cbiAgICAgICAgLy8gQ3JlYXRlIHJlbmRlcmluZyBtb2Rlc1xuICAgICAgICBxdWV1ZS5kZWZlcihjb21wbGV0ZSA9PiB7XG4gICAgICAgICAgICB0aGlzLm1vZGVzID0gU2NlbmUuY3JlYXRlTW9kZXModGhpcy5zdHlsZXMpO1xuICAgICAgICAgICAgdGhpcy51cGRhdGVBY3RpdmVNb2RlcygpO1xuICAgICAgICAgICAgY29tcGxldGUoKTtcbiAgICAgICAgfSk7XG5cbiAgICAgICAgLy8gQ3JlYXRlIHdlYiB3b3JrZXJzXG4gICAgICAgIHF1ZXVlLmRlZmVyKGNvbXBsZXRlID0+IHtcbiAgICAgICAgICAgIHRoaXMuY3JlYXRlV29ya2Vycyhjb21wbGV0ZSk7XG4gICAgICAgIH0pO1xuXG4gICAgICAgIC8vIFRoZW4gY3JlYXRlIEdMIGNvbnRleHRcbiAgICAgICAgcXVldWUuYXdhaXQoKCkgPT4ge1xuICAgICAgICAgICAgLy8gQ3JlYXRlIGNhbnZhcyAmIEdMXG4gICAgICAgICAgICB0aGlzLmNvbnRhaW5lciA9IHRoaXMuY29udGFpbmVyIHx8IGRvY3VtZW50LmJvZHk7XG4gICAgICAgICAgICB0aGlzLmNhbnZhcyA9IGRvY3VtZW50LmNyZWF0ZUVsZW1lbnQoJ2NhbnZhcycpO1xuICAgICAgICAgICAgdGhpcy5jYW52YXMuc3R5bGUucG9zaXRpb24gPSAnYWJzb2x1dGUnO1xuICAgICAgICAgICAgdGhpcy5jYW52YXMuc3R5bGUudG9wID0gMDtcbiAgICAgICAgICAgIHRoaXMuY2FudmFzLnN0eWxlLmxlZnQgPSAwO1xuICAgICAgICAgICAgdGhpcy5jYW52YXMuc3R5bGUuekluZGV4ID0gLTE7XG4gICAgICAgICAgICB0aGlzLmNvbnRhaW5lci5hcHBlbmRDaGlsZCh0aGlzLmNhbnZhcyk7XG5cbiAgICAgICAgICAgIHRoaXMuZ2wgPSBHTC5nZXRDb250ZXh0KHRoaXMuY2FudmFzKTtcbiAgICAgICAgICAgIHRoaXMucmVzaXplTWFwKHRoaXMuY29udGFpbmVyLmNsaWVudFdpZHRoLCB0aGlzLmNvbnRhaW5lci5jbGllbnRIZWlnaHQpO1xuXG4gICAgICAgICAgICAvLyBDYW1lcmFcbiAgICAgICAgICAgIHRoaXMuY2FtZXJhID0gQ2FtZXJhLmNyZWF0ZSh0aGlzLCB0aGlzLnN0eWxlcy5jYW1lcmEpO1xuXG4gICAgICAgICAgICB0aGlzLmluaXRNb2RlcygpOyAvLyBUT0RPOiByZW1vdmUgZ2wgY29udGV4dCBzdGF0ZSBmcm9tIG1vZGVzLCBhbmQgbW92ZSBpbml0IHRvIGNyZWF0ZSBzdGVwIGFib3ZlP1xuICAgICAgICAgICAgdGhpcy5pbml0U2VsZWN0aW9uQnVmZmVyKCk7XG5cbiAgICAgICAgICAgIC8vIHRoaXMuem9vbV9zdGVwID0gMC4wMjsgLy8gZm9yIGZyYWN0aW9uYWwgem9vbSB1c2VyIGFkanVzdG1lbnRcbiAgICAgICAgICAgIHRoaXMubGFzdF9yZW5kZXJfY291bnQgPSBudWxsO1xuICAgICAgICAgICAgdGhpcy5pbml0SW5wdXRIYW5kbGVycygpO1xuXG4gICAgICAgICAgICB0aGlzLmluaXRpYWxpemVkID0gdHJ1ZTtcblxuICAgICAgICAgICAgaWYgKHR5cGVvZiBjYWxsYmFjayA9PSAnZnVuY3Rpb24nKSB7XG4gICAgICAgICAgICAgICAgY2FsbGJhY2soKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgfSk7XG4gICAgfSk7XG59O1xuXG5TY2VuZS5wcm90b3R5cGUuaW5pdE1vZGVzID0gZnVuY3Rpb24gKCkge1xuICAgIC8vIEluaXQgR0wgY29udGV4dCBmb3IgbW9kZXMgKGNvbXBpbGVzIHByb2dyYW1zLCBldGMuKVxuICAgIGZvciAodmFyIG0gaW4gdGhpcy5tb2Rlcykge1xuICAgICAgICB0aGlzLm1vZGVzW21dLmluaXQodGhpcy5nbCk7XG4gICAgfVxufTtcblxuU2NlbmUucHJvdG90eXBlLmluaXRTZWxlY3Rpb25CdWZmZXIgPSBmdW5jdGlvbiAoKSB7XG4gICAgLy8gU2VsZWN0aW9uIHN0YXRlIHRyYWNraW5nXG4gICAgdGhpcy5waXhlbCA9IG5ldyBVaW50OEFycmF5KDQpO1xuICAgIHRoaXMucGl4ZWwzMiA9IG5ldyBGbG9hdDMyQXJyYXkodGhpcy5waXhlbC5idWZmZXIpO1xuICAgIHRoaXMuc2VsZWN0aW9uX3BvaW50ID0gUG9pbnQoMCwgMCk7XG4gICAgdGhpcy5zZWxlY3RlZF9mZWF0dXJlID0gbnVsbDtcbiAgICB0aGlzLnNlbGVjdGlvbl9jYWxsYmFjayA9IG51bGw7XG4gICAgdGhpcy5zZWxlY3Rpb25fY2FsbGJhY2tfdGltZXIgPSBudWxsO1xuICAgIHRoaXMuc2VsZWN0aW9uX2ZyYW1lX2RlbGF5ID0gNTsgLy8gZGVsYXkgZnJvbSBzZWxlY3Rpb24gcmVuZGVyIHRvIGZyYW1lYnVmZmVyIHNhbXBsZSwgdG8gYXZvaWQgQ1BVL0dQVSBzeW5jIGxvY2tcbiAgICB0aGlzLnVwZGF0ZV9zZWxlY3Rpb24gPSBmYWxzZTtcblxuICAgIC8vIEZyYW1lIGJ1ZmZlciBmb3Igc2VsZWN0aW9uXG4gICAgLy8gVE9ETzogaW5pdGlhdGUgbGF6aWx5IGluIGNhc2Ugd2UgZG9uJ3QgbmVlZCB0byBkbyBhbnkgc2VsZWN0aW9uXG4gICAgdGhpcy5mYm8gPSB0aGlzLmdsLmNyZWF0ZUZyYW1lYnVmZmVyKCk7XG4gICAgdGhpcy5nbC5iaW5kRnJhbWVidWZmZXIodGhpcy5nbC5GUkFNRUJVRkZFUiwgdGhpcy5mYm8pO1xuICAgIHRoaXMuZmJvX3NpemUgPSB7IHdpZHRoOiAyNTYsIGhlaWdodDogMjU2IH07IC8vIFRPRE86IG1ha2UgY29uZmlndXJhYmxlIC8gYWRhcHRpdmUgYmFzZWQgb24gY2FudmFzIHNpemVcbiAgICB0aGlzLmZib19zaXplLmFzcGVjdCA9IHRoaXMuZmJvX3NpemUud2lkdGggLyB0aGlzLmZib19zaXplLmhlaWdodDtcbiAgICB0aGlzLmdsLnZpZXdwb3J0KDAsIDAsIHRoaXMuZmJvX3NpemUud2lkdGgsIHRoaXMuZmJvX3NpemUuaGVpZ2h0KTtcblxuICAgIC8vIFRleHR1cmUgZm9yIHRoZSBGQk8gY29sb3IgYXR0YWNobWVudFxuICAgIHRoaXMuZmJvX3RleHR1cmUgPSBuZXcgR0xUZXh0dXJlKHRoaXMuZ2wsICdzZWxlY3Rpb25fZmJvJyk7XG4gICAgdGhpcy5mYm9fdGV4dHVyZS5zZXREYXRhKHRoaXMuZmJvX3NpemUud2lkdGgsIHRoaXMuZmJvX3NpemUuaGVpZ2h0LCBudWxsLCB7IGZpbHRlcmluZzogJ25lYXJlc3QnIH0pO1xuICAgIHRoaXMuZ2wuZnJhbWVidWZmZXJUZXh0dXJlMkQodGhpcy5nbC5GUkFNRUJVRkZFUiwgdGhpcy5nbC5DT0xPUl9BVFRBQ0hNRU5UMCwgdGhpcy5nbC5URVhUVVJFXzJELCB0aGlzLmZib190ZXh0dXJlLnRleHR1cmUsIDApO1xuXG4gICAgLy8gUmVuZGVyYnVmZmVyIGZvciB0aGUgRkJPIGRlcHRoIGF0dGFjaG1lbnRcbiAgICB0aGlzLmZib19kZXB0aF9yYiA9IHRoaXMuZ2wuY3JlYXRlUmVuZGVyYnVmZmVyKCk7XG4gICAgdGhpcy5nbC5iaW5kUmVuZGVyYnVmZmVyKHRoaXMuZ2wuUkVOREVSQlVGRkVSLCB0aGlzLmZib19kZXB0aF9yYik7XG4gICAgdGhpcy5nbC5yZW5kZXJidWZmZXJTdG9yYWdlKHRoaXMuZ2wuUkVOREVSQlVGRkVSLCB0aGlzLmdsLkRFUFRIX0NPTVBPTkVOVDE2LCB0aGlzLmZib19zaXplLndpZHRoLCB0aGlzLmZib19zaXplLmhlaWdodCk7XG4gICAgdGhpcy5nbC5mcmFtZWJ1ZmZlclJlbmRlcmJ1ZmZlcih0aGlzLmdsLkZSQU1FQlVGRkVSLCB0aGlzLmdsLkRFUFRIX0FUVEFDSE1FTlQsIHRoaXMuZ2wuUkVOREVSQlVGRkVSLCB0aGlzLmZib19kZXB0aF9yYik7XG5cbiAgICB0aGlzLmdsLmJpbmRGcmFtZWJ1ZmZlcih0aGlzLmdsLkZSQU1FQlVGRkVSLCBudWxsKTtcbiAgICB0aGlzLmdsLnZpZXdwb3J0KDAsIDAsIHRoaXMuY2FudmFzLndpZHRoLCB0aGlzLmNhbnZhcy5oZWlnaHQpO1xufTtcblxuLy8gV2ViIHdvcmtlcnMgaGFuZGxlIGhlYXZ5IGR1dHkgdGlsZSBjb25zdHJ1Y3Rpb246IG5ldHdvcmtpbmcsIGdlb21ldHJ5IHByb2Nlc3NpbmcsIGV0Yy5cblNjZW5lLnByb3RvdHlwZS5jcmVhdGVXb3JrZXJzID0gZnVuY3Rpb24gKGNhbGxiYWNrKSB7XG4gICAgdmFyIHF1ZXVlID0gUXVldWUoKTtcbiAgICB2YXIgd29ya2VyX3VybCA9IFNjZW5lLmxpYnJhcnlfYmFzZV91cmwgKyAndGFuZ3JhbS13b3JrZXIuZGVidWcuanMnICsgJz8nICsgKCtuZXcgRGF0ZSgpKTtcblxuICAgIC8vIExvYWQgJiBpbnN0YW50aWF0ZSB3b3JrZXJzXG4gICAgcXVldWUuZGVmZXIoY29tcGxldGUgPT4ge1xuICAgICAgICAvLyBMb2NhbCBvYmplY3QgVVJMcyBzdXBwb3J0ZWQ/XG4gICAgICAgIHZhciBjcmVhdGVPYmplY3RVUkwgPSAod2luZG93LlVSTCAmJiB3aW5kb3cuVVJMLmNyZWF0ZU9iamVjdFVSTCkgfHwgKHdpbmRvdy53ZWJraXRVUkwgJiYgd2luZG93LndlYmtpdFVSTC5jcmVhdGVPYmplY3RVUkwpO1xuICAgICAgICBpZiAoY3JlYXRlT2JqZWN0VVJMICYmIHRoaXMuYWxsb3dfY3Jvc3NfZG9tYWluX3dvcmtlcnMpIHtcbiAgICAgICAgICAgIC8vIFRvIGFsbG93IHdvcmtlcnMgdG8gYmUgbG9hZGVkIGNyb3NzLWRvbWFpbiwgZmlyc3QgbG9hZCB3b3JrZXIgc291cmNlIHZpYSBYSFIsIHRoZW4gY3JlYXRlIGEgbG9jYWwgVVJMIHZpYSBhIGJsb2JcbiAgICAgICAgICAgIHZhciByZXEgPSBuZXcgWE1MSHR0cFJlcXVlc3QoKTtcbiAgICAgICAgICAgIHJlcS5vbmxvYWQgPSAoKSA9PiB7XG4gICAgICAgICAgICAgICAgdmFyIHdvcmtlcl9sb2NhbF91cmwgPSBjcmVhdGVPYmplY3RVUkwobmV3IEJsb2IoW3JlcS5yZXNwb25zZV0sIHsgdHlwZTogJ2FwcGxpY2F0aW9uL2phdmFzY3JpcHQnIH0pKTtcbiAgICAgICAgICAgICAgICB0aGlzLm1ha2VXb3JrZXJzKHdvcmtlcl9sb2NhbF91cmwpO1xuICAgICAgICAgICAgICAgIGNvbXBsZXRlKCk7XG4gICAgICAgICAgICB9O1xuICAgICAgICAgICAgcmVxLm9wZW4oJ0dFVCcsIHdvcmtlcl91cmwsIHRydWUgLyogYXN5bmMgZmxhZyAqLyk7XG4gICAgICAgICAgICByZXEucmVzcG9uc2VUeXBlID0gJ3RleHQnO1xuICAgICAgICAgICAgcmVxLnNlbmQoKTtcbiAgICAgICAgfVxuICAgICAgICAvLyBUcmFkaXRpb25hbCBsb2FkIGZyb20gcmVtb3RlIFVSTFxuICAgICAgICBlbHNlIHtcbiAgICAgICAgICAgIGNvbnNvbGUubG9nKHRoaXMpO1xuICAgICAgICAgICAgdGhpcy5tYWtlV29ya2Vycyh3b3JrZXJfdXJsKTtcbiAgICAgICAgICAgIGNvbXBsZXRlKCk7XG4gICAgICAgIH1cbiAgICB9KTtcblxuICAgIC8vIEluaXQgd29ya2Vyc1xuICAgIHF1ZXVlLmF3YWl0KCgpID0+IHtcbiAgICAgICAgdGhpcy53b3JrZXJzLmZvckVhY2god29ya2VyID0+IHtcbiAgICAgICAgICAgIHdvcmtlci5hZGRFdmVudExpc3RlbmVyKCdtZXNzYWdlJywgdGhpcy53b3JrZXJCdWlsZFRpbGVDb21wbGV0ZWQuYmluZCh0aGlzKSk7XG4gICAgICAgICAgICB3b3JrZXIuYWRkRXZlbnRMaXN0ZW5lcignbWVzc2FnZScsIHRoaXMud29ya2VyR2V0RmVhdHVyZVNlbGVjdGlvbi5iaW5kKHRoaXMpKTtcbiAgICAgICAgICAgIHdvcmtlci5hZGRFdmVudExpc3RlbmVyKCdtZXNzYWdlJywgdGhpcy53b3JrZXJMb2dNZXNzYWdlLmJpbmQodGhpcykpO1xuICAgICAgICB9KTtcblxuICAgICAgICB0aGlzLm5leHRfd29ya2VyID0gMDtcbiAgICAgICAgdGhpcy5zZWxlY3Rpb25fbWFwX3dvcmtlcl9zaXplID0ge307XG5cbiAgICAgICAgaWYgKHR5cGVvZiBjYWxsYmFjayA9PSAnZnVuY3Rpb24nKSB7XG4gICAgICAgICAgICBjYWxsYmFjaygpO1xuICAgICAgICB9XG4gICAgfSk7XG59O1xuXG4vLyBJbnN0YW50aWF0ZSB3b3JrZXJzIGZyb20gVVJMXG5TY2VuZS5wcm90b3R5cGUubWFrZVdvcmtlcnMgPSBmdW5jdGlvbiAodXJsKSB7XG4gICAgdGhpcy53b3JrZXJzID0gW107XG4gICAgZm9yICh2YXIgdz0wOyB3IDwgdGhpcy5udW1fd29ya2VyczsgdysrKSB7XG4gICAgICAgIHRoaXMud29ya2Vycy5wdXNoKG5ldyBXb3JrZXIodXJsKSk7XG4gICAgICAgIHRoaXMud29ya2Vyc1t3XS5wb3N0TWVzc2FnZSh7XG4gICAgICAgICAgICB0eXBlOiAnaW5pdCcsXG4gICAgICAgICAgICB3b3JrZXJfaWQ6IHcsXG4gICAgICAgICAgICBudW1fd29ya2VyczogdGhpcy5udW1fd29ya2Vyc1xuICAgICAgICB9KVxuICAgIH1cbn07XG5cbi8vIFBvc3QgYSBtZXNzYWdlIGFib3V0IGEgdGlsZSB0byB0aGUgbmV4dCB3b3JrZXIgKHJvdW5kIHJvYmJpbilcblNjZW5lLnByb3RvdHlwZS53b3JrZXJQb3N0TWVzc2FnZUZvclRpbGUgPSBmdW5jdGlvbiAodGlsZSwgbWVzc2FnZSkge1xuICAgIGlmICh0aWxlLndvcmtlciA9PSBudWxsKSB7XG4gICAgICAgIHRpbGUud29ya2VyID0gdGhpcy5uZXh0X3dvcmtlcjtcbiAgICAgICAgdGhpcy5uZXh0X3dvcmtlciA9ICh0aWxlLndvcmtlciArIDEpICUgdGhpcy53b3JrZXJzLmxlbmd0aDtcbiAgICB9XG4gICAgdGhpcy53b3JrZXJzW3RpbGUud29ya2VyXS5wb3N0TWVzc2FnZShtZXNzYWdlKTtcbn07XG5cblNjZW5lLnByb3RvdHlwZS5zZXRDZW50ZXIgPSBmdW5jdGlvbiAobG5nLCBsYXQpIHtcbiAgICB0aGlzLmNlbnRlciA9IHsgbG5nOiBsbmcsIGxhdDogbGF0IH07XG4gICAgdGhpcy5kaXJ0eSA9IHRydWU7XG59O1xuXG5TY2VuZS5wcm90b3R5cGUuc3RhcnRab29tID0gZnVuY3Rpb24gKCkge1xuICAgIHRoaXMubGFzdF96b29tID0gdGhpcy56b29tO1xuICAgIHRoaXMuem9vbWluZyA9IHRydWU7XG59O1xuXG5TY2VuZS5wcm90b3R5cGUucHJlc2VydmVfdGlsZXNfd2l0aGluX3pvb20gPSAyO1xuU2NlbmUucHJvdG90eXBlLnNldFpvb20gPSBmdW5jdGlvbiAoem9vbSkge1xuICAgIC8vIFNjaGVkdWxlIEdMIHRpbGVzIGZvciByZW1vdmFsIG9uIHpvb21cbiAgICB2YXIgYmVsb3cgPSB6b29tO1xuICAgIHZhciBhYm92ZSA9IHpvb207XG4gICAgaWYgKHRoaXMubGFzdF96b29tICE9IG51bGwpIHtcbiAgICAgICAgY29uc29sZS5sb2coXCJzY2VuZS5sYXN0X3pvb206IFwiICsgdGhpcy5sYXN0X3pvb20pO1xuICAgICAgICBpZiAoTWF0aC5hYnMoem9vbSAtIHRoaXMubGFzdF96b29tKSA8PSB0aGlzLnByZXNlcnZlX3RpbGVzX3dpdGhpbl96b29tKSB7XG4gICAgICAgICAgICBpZiAoem9vbSA+IHRoaXMubGFzdF96b29tKSB7XG4gICAgICAgICAgICAgICAgYmVsb3cgPSB6b29tIC0gdGhpcy5wcmVzZXJ2ZV90aWxlc193aXRoaW5fem9vbTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIGVsc2Uge1xuICAgICAgICAgICAgICAgIGFib3ZlID0gem9vbSArIHRoaXMucHJlc2VydmVfdGlsZXNfd2l0aGluX3pvb207XG4gICAgICAgICAgICB9XG4gICAgICAgIH1cbiAgICB9XG5cbiAgICB0aGlzLmxhc3Rfem9vbSA9IHRoaXMuem9vbTtcbiAgICB0aGlzLnpvb20gPSB6b29tO1xuICAgIHRoaXMuY2FwcGVkX3pvb20gPSBNYXRoLm1pbih+fnRoaXMuem9vbSwgdGhpcy50aWxlX3NvdXJjZS5tYXhfem9vbSB8fCB+fnRoaXMuem9vbSk7XG4gICAgdGhpcy56b29taW5nID0gZmFsc2U7XG4gICAgdGhpcy51cGRhdGVNZXRlclZpZXcoKTtcblxuICAgIHRoaXMucmVtb3ZlVGlsZXNPdXRzaWRlWm9vbVJhbmdlKGJlbG93LCBhYm92ZSk7XG4gICAgdGhpcy5kaXJ0eSA9IHRydWU7XG59O1xuXG5TY2VuZS5wcm90b3R5cGUudXBkYXRlTWV0ZXJWaWV3ID0gZnVuY3Rpb24gKCkge1xuICAgIHRoaXMubWV0ZXJzX3Blcl9waXhlbCA9IEdlby5tZXRlcnNQZXJQaXhlbCh0aGlzLnpvb20pO1xuXG4gICAgLy8gU2l6ZSBvZiB0aGUgaGFsZi12aWV3cG9ydCBpbiBtZXRlcnMgYXQgY3VycmVudCB6b29tXG4gICAgaWYgKHRoaXMuY3NzX3NpemUgIT09IHVuZGVmaW5lZCkgeyAvLyBUT0RPOiByZXBsYWNlIHRoaXMgY2hlY2s/XG4gICAgICAgIHRoaXMubWV0ZXJfem9vbSA9IHtcbiAgICAgICAgICAgIHg6IHRoaXMuY3NzX3NpemUud2lkdGggLyAyICogdGhpcy5tZXRlcnNfcGVyX3BpeGVsLFxuICAgICAgICAgICAgeTogdGhpcy5jc3Nfc2l6ZS5oZWlnaHQgLyAyICogdGhpcy5tZXRlcnNfcGVyX3BpeGVsXG4gICAgICAgIH07XG4gICAgfVxufTtcblxuU2NlbmUucHJvdG90eXBlLnJlbW92ZVRpbGVzT3V0c2lkZVpvb21SYW5nZSA9IGZ1bmN0aW9uIChiZWxvdywgYWJvdmUpIHtcbiAgICBiZWxvdyA9IE1hdGgubWluKGJlbG93LCB0aGlzLnRpbGVfc291cmNlLm1heF96b29tIHx8IGJlbG93KTtcbiAgICBhYm92ZSA9IE1hdGgubWluKGFib3ZlLCB0aGlzLnRpbGVfc291cmNlLm1heF96b29tIHx8IGFib3ZlKTtcblxuICAgIGNvbnNvbGUubG9nKFwicmVtb3ZlVGlsZXNPdXRzaWRlWm9vbVJhbmdlIFtcIiArIGJlbG93ICsgXCIsIFwiICsgYWJvdmUgKyBcIl0pXCIpO1xuICAgIHZhciByZW1vdmVfdGlsZXMgPSBbXTtcbiAgICBmb3IgKHZhciB0IGluIHRoaXMudGlsZXMpIHtcbiAgICAgICAgdmFyIHRpbGUgPSB0aGlzLnRpbGVzW3RdO1xuICAgICAgICBpZiAodGlsZS5jb29yZHMueiA8IGJlbG93IHx8IHRpbGUuY29vcmRzLnogPiBhYm92ZSkge1xuICAgICAgICAgICAgcmVtb3ZlX3RpbGVzLnB1c2godCk7XG4gICAgICAgIH1cbiAgICB9XG4gICAgZm9yICh2YXIgcj0wOyByIDwgcmVtb3ZlX3RpbGVzLmxlbmd0aDsgcisrKSB7XG4gICAgICAgIHZhciBrZXkgPSByZW1vdmVfdGlsZXNbcl07XG4gICAgICAgIGNvbnNvbGUubG9nKFwicmVtb3ZlZCBcIiArIGtleSArIFwiIChvdXRzaWRlIHJhbmdlIFtcIiArIGJlbG93ICsgXCIsIFwiICsgYWJvdmUgKyBcIl0pXCIpO1xuICAgICAgICB0aGlzLnJlbW92ZVRpbGUoa2V5KTtcbiAgICB9XG59O1xuXG5TY2VuZS5wcm90b3R5cGUuc2V0Qm91bmRzID0gZnVuY3Rpb24gKHN3LCBuZSkge1xuICAgIHRoaXMuYm91bmRzID0ge1xuICAgICAgICBzdzogeyBsbmc6IHN3LmxuZywgbGF0OiBzdy5sYXQgfSxcbiAgICAgICAgbmU6IHsgbG5nOiBuZS5sbmcsIGxhdDogbmUubGF0IH1cbiAgICB9O1xuXG4gICAgdmFyIGJ1ZmZlciA9IDIwMCAqIHRoaXMubWV0ZXJzX3Blcl9waXhlbDsgLy8gcGl4ZWxzIC0+IG1ldGVyc1xuICAgIHRoaXMuYnVmZmVyZWRfbWV0ZXJfYm91bmRzID0ge1xuICAgICAgICBzdzogR2VvLmxhdExuZ1RvTWV0ZXJzKFBvaW50KHRoaXMuYm91bmRzLnN3LmxuZywgdGhpcy5ib3VuZHMuc3cubGF0KSksXG4gICAgICAgIG5lOiBHZW8ubGF0TG5nVG9NZXRlcnMoUG9pbnQodGhpcy5ib3VuZHMubmUubG5nLCB0aGlzLmJvdW5kcy5uZS5sYXQpKVxuICAgIH07XG4gICAgdGhpcy5idWZmZXJlZF9tZXRlcl9ib3VuZHMuc3cueCAtPSBidWZmZXI7XG4gICAgdGhpcy5idWZmZXJlZF9tZXRlcl9ib3VuZHMuc3cueSAtPSBidWZmZXI7XG4gICAgdGhpcy5idWZmZXJlZF9tZXRlcl9ib3VuZHMubmUueCArPSBidWZmZXI7XG4gICAgdGhpcy5idWZmZXJlZF9tZXRlcl9ib3VuZHMubmUueSArPSBidWZmZXI7XG5cbiAgICB0aGlzLmNlbnRlcl9tZXRlcnMgPSBQb2ludChcbiAgICAgICAgKHRoaXMuYnVmZmVyZWRfbWV0ZXJfYm91bmRzLnN3LnggKyB0aGlzLmJ1ZmZlcmVkX21ldGVyX2JvdW5kcy5uZS54KSAvIDIsXG4gICAgICAgICh0aGlzLmJ1ZmZlcmVkX21ldGVyX2JvdW5kcy5zdy55ICsgdGhpcy5idWZmZXJlZF9tZXRlcl9ib3VuZHMubmUueSkgLyAyXG4gICAgKTtcblxuICAgIC8vIGNvbnNvbGUubG9nKFwic2V0IHNjZW5lIGJvdW5kcyB0byBcIiArIEpTT04uc3RyaW5naWZ5KHRoaXMuYm91bmRzKSk7XG5cbiAgICAvLyBNYXJrIHRpbGVzIGFzIHZpc2libGUvaW52aXNpYmxlXG4gICAgZm9yICh2YXIgdCBpbiB0aGlzLnRpbGVzKSB7XG4gICAgICAgIHRoaXMudXBkYXRlVmlzaWJpbGl0eUZvclRpbGUodGhpcy50aWxlc1t0XSk7XG4gICAgfVxuXG4gICAgdGhpcy5kaXJ0eSA9IHRydWU7XG59O1xuXG5TY2VuZS5wcm90b3R5cGUuaXNUaWxlSW5ab29tID0gZnVuY3Rpb24gKHRpbGUpIHtcbiAgICByZXR1cm4gKE1hdGgubWluKHRpbGUuY29vcmRzLnosIHRoaXMudGlsZV9zb3VyY2UubWF4X3pvb20gfHwgdGlsZS5jb29yZHMueikgPT0gdGhpcy5jYXBwZWRfem9vbSk7XG59O1xuXG4vLyBVcGRhdGUgdmlzaWJpbGl0eSBhbmQgcmV0dXJuIHRydWUgaWYgY2hhbmdlZFxuU2NlbmUucHJvdG90eXBlLnVwZGF0ZVZpc2liaWxpdHlGb3JUaWxlID0gZnVuY3Rpb24gKHRpbGUpIHtcbiAgICB2YXIgdmlzaWJsZSA9IHRpbGUudmlzaWJsZTtcbiAgICB0aWxlLnZpc2libGUgPSB0aGlzLmlzVGlsZUluWm9vbSh0aWxlKSAmJiBHZW8uYm94SW50ZXJzZWN0KHRpbGUuYm91bmRzLCB0aGlzLmJ1ZmZlcmVkX21ldGVyX2JvdW5kcyk7XG4gICAgdGlsZS5jZW50ZXJfZGlzdCA9IE1hdGguYWJzKHRoaXMuY2VudGVyX21ldGVycy54IC0gdGlsZS5taW4ueCkgKyBNYXRoLmFicyh0aGlzLmNlbnRlcl9tZXRlcnMueSAtIHRpbGUubWluLnkpO1xuICAgIHJldHVybiAodmlzaWJsZSAhPSB0aWxlLnZpc2libGUpO1xufTtcblxuU2NlbmUucHJvdG90eXBlLnJlc2l6ZU1hcCA9IGZ1bmN0aW9uICh3aWR0aCwgaGVpZ2h0KSB7XG4gICAgdGhpcy5kaXJ0eSA9IHRydWU7XG5cbiAgICB0aGlzLmNzc19zaXplID0geyB3aWR0aDogd2lkdGgsIGhlaWdodDogaGVpZ2h0IH07XG4gICAgdGhpcy5kZXZpY2Vfc2l6ZSA9IHsgd2lkdGg6IE1hdGgucm91bmQodGhpcy5jc3Nfc2l6ZS53aWR0aCAqIHRoaXMuZGV2aWNlX3BpeGVsX3JhdGlvKSwgaGVpZ2h0OiBNYXRoLnJvdW5kKHRoaXMuY3NzX3NpemUuaGVpZ2h0ICogdGhpcy5kZXZpY2VfcGl4ZWxfcmF0aW8pIH07XG4gICAgdGhpcy52aWV3X2FzcGVjdCA9IHRoaXMuY3NzX3NpemUud2lkdGggLyB0aGlzLmNzc19zaXplLmhlaWdodDtcbiAgICB0aGlzLnVwZGF0ZU1ldGVyVmlldygpO1xuXG4gICAgdGhpcy5jYW52YXMuc3R5bGUud2lkdGggPSB0aGlzLmNzc19zaXplLndpZHRoICsgJ3B4JztcbiAgICB0aGlzLmNhbnZhcy5zdHlsZS5oZWlnaHQgPSB0aGlzLmNzc19zaXplLmhlaWdodCArICdweCc7XG4gICAgdGhpcy5jYW52YXMud2lkdGggPSB0aGlzLmRldmljZV9zaXplLndpZHRoO1xuICAgIHRoaXMuY2FudmFzLmhlaWdodCA9IHRoaXMuZGV2aWNlX3NpemUuaGVpZ2h0O1xuXG4gICAgdGhpcy5nbC5iaW5kRnJhbWVidWZmZXIodGhpcy5nbC5GUkFNRUJVRkZFUiwgbnVsbCk7XG4gICAgdGhpcy5nbC52aWV3cG9ydCgwLCAwLCB0aGlzLmNhbnZhcy53aWR0aCwgdGhpcy5jYW52YXMuaGVpZ2h0KTtcbn07XG5cblNjZW5lLnByb3RvdHlwZS5yZXF1ZXN0UmVkcmF3ID0gZnVuY3Rpb24gKCkge1xuICAgIHRoaXMuZGlydHkgPSB0cnVlO1xufTtcblxuLy8gRGV0ZXJtaW5lIGEgWiB2YWx1ZSB0aGF0IHdpbGwgc3RhY2sgZmVhdHVyZXMgaW4gYSBcInBhaW50ZXIncyBhbGdvcml0aG1cIiBzdHlsZSwgZmlyc3QgYnkgbGF5ZXIsIHRoZW4gYnkgZHJhdyBvcmRlciB3aXRoaW4gbGF5ZXJcbi8vIEZlYXR1cmVzIGFyZSBhc3N1bWVkIHRvIGJlIGFscmVhZHkgc29ydGVkIGluIGRlc2lyZWQgZHJhdyBvcmRlciBieSB0aGUgbGF5ZXIgcHJlLXByb2Nlc3NvclxuU2NlbmUuY2FsY3VsYXRlWiA9IGZ1bmN0aW9uIChsYXllciwgdGlsZSwgbGF5ZXJfb2Zmc2V0LCBmZWF0dXJlX29mZnNldCkge1xuICAgIC8vIHZhciBsYXllcl9vZmZzZXQgPSBsYXllcl9vZmZzZXQgfHwgMDtcbiAgICAvLyB2YXIgZmVhdHVyZV9vZmZzZXQgPSBmZWF0dXJlX29mZnNldCB8fCAwO1xuICAgIHZhciB6ID0gMDsgLy8gVE9ETzogbWFkZSB0aGlzIGEgbm8tb3AgdW50aWwgcmV2aXNpdGluZyB3aGVyZSBpdCBzaG91bGQgbGl2ZSAtIG9uZS10aW1lIGNhbGMgaGVyZSwgaW4gdmVydGV4IGxheW91dC9zaGFkZXIsIGV0Yy5cbiAgICByZXR1cm4gejtcbn07XG5cblNjZW5lLnByb3RvdHlwZS5yZW5kZXIgPSBmdW5jdGlvbiAoKSB7XG4gICAgdGhpcy5sb2FkUXVldWVkVGlsZXMoKTtcblxuICAgIC8vIFJlbmRlciBvbiBkZW1hbmRcbiAgICBpZiAodGhpcy5kaXJ0eSA9PSBmYWxzZSB8fCB0aGlzLmluaXRpYWxpemVkID09IGZhbHNlKSB7XG4gICAgICAgIHJldHVybiBmYWxzZTtcbiAgICB9XG4gICAgdGhpcy5kaXJ0eSA9IGZhbHNlOyAvLyBzdWJjbGFzc2VzIGNhbiBzZXQgdGhpcyBiYWNrIHRvIHRydWUgd2hlbiBhbmltYXRpb24gaXMgbmVlZGVkXG5cbiAgICB0aGlzLnJlbmRlckdMKCk7XG5cbiAgICAvLyBSZWRyYXcgZXZlcnkgZnJhbWUgaWYgYW5pbWF0aW5nXG4gICAgaWYgKHRoaXMuYW5pbWF0ZWQgPT0gdHJ1ZSkge1xuICAgICAgICB0aGlzLmRpcnR5ID0gdHJ1ZTtcbiAgICB9XG5cbiAgICB0aGlzLmZyYW1lKys7XG5cbiAgICAvLyBjb25zb2xlLmxvZyhcInJlbmRlciBtYXBcIik7XG4gICAgcmV0dXJuIHRydWU7XG59O1xuXG5TY2VuZS5wcm90b3R5cGUucmVzZXRGcmFtZSA9IGZ1bmN0aW9uICgpIHtcbiAgICBpZiAoIXRoaXMuaW5pdGlhbGl6ZWQpIHtcbiAgICAgICAgcmV0dXJuO1xuICAgIH1cblxuICAgIC8vIFJlc2V0IGZyYW1lIHN0YXRlXG4gICAgdmFyIGdsID0gdGhpcy5nbDtcbiAgICBnbC5jbGVhckNvbG9yKDAuMCwgMC4wLCAwLjAsIDEuMCk7XG4gICAgZ2wuY2xlYXIoZ2wuQ09MT1JfQlVGRkVSX0JJVCB8IGdsLkRFUFRIX0JVRkZFUl9CSVQpO1xuXG4gICAgLy8gVE9ETzogdW5uZWNlc3NhcnkgcmVwZWF0P1xuICAgIGdsLmVuYWJsZShnbC5ERVBUSF9URVNUKTtcbiAgICBnbC5kZXB0aEZ1bmMoZ2wuTEVTUyk7XG4gICAgZ2wuZW5hYmxlKGdsLkNVTExfRkFDRSk7XG4gICAgZ2wuY3VsbEZhY2UoZ2wuQkFDSyk7XG4gICAgLy8gZ2wuZW5hYmxlKGdsLkJMRU5EKTtcbiAgICAvLyBnbC5ibGVuZEZ1bmMoZ2wuU1JDX0FMUEhBLCBnbC5PTkVfTUlOVVNfU1JDX0FMUEhBKTtcbn07XG5cblNjZW5lLnByb3RvdHlwZS5yZW5kZXJHTCA9IGZ1bmN0aW9uICgpIHtcbiAgICB2YXIgZ2wgPSB0aGlzLmdsO1xuXG4gICAgdGhpcy5pbnB1dCgpO1xuICAgIHRoaXMucmVzZXRGcmFtZSgpO1xuXG4gICAgLy8gTWFwIHRyYW5zZm9ybXNcbiAgICB2YXIgY2VudGVyID0gR2VvLmxhdExuZ1RvTWV0ZXJzKFBvaW50KHRoaXMuY2VudGVyLmxuZywgdGhpcy5jZW50ZXIubGF0KSk7XG5cbiAgICAvLyBNb2RlbC12aWV3IG1hdHJpY2VzXG4gICAgdmFyIHRpbGVfdmlld19tYXQgPSBtYXQ0LmNyZWF0ZSgpO1xuICAgIHZhciB0aWxlX3dvcmxkX21hdCA9IG1hdDQuY3JlYXRlKCk7XG5cbiAgICAvLyBVcGRhdGUgY2FtZXJhXG4gICAgdGhpcy5jYW1lcmEudXBkYXRlKCk7XG5cbiAgICAvLyBSZW5kZXJhYmxlIHRpbGUgbGlzdFxuICAgIHZhciByZW5kZXJhYmxlX3RpbGVzID0gW107XG4gICAgZm9yICh2YXIgdCBpbiB0aGlzLnRpbGVzKSB7XG4gICAgICAgIHZhciB0aWxlID0gdGhpcy50aWxlc1t0XTtcbiAgICAgICAgaWYgKHRpbGUubG9hZGVkID09IHRydWUgJiYgdGlsZS52aXNpYmxlID09IHRydWUpIHtcbiAgICAgICAgICAgIHJlbmRlcmFibGVfdGlsZXMucHVzaCh0aWxlKTtcbiAgICAgICAgfVxuICAgIH1cbiAgICB0aGlzLnJlbmRlcmFibGVfdGlsZXNfY291bnQgPSByZW5kZXJhYmxlX3RpbGVzLmxlbmd0aDtcblxuICAgIC8vIFJlbmRlciBtYWluIHBhc3MgLSB0aWxlcyBncm91cGVkIGJ5IHJlbmRlcmluZyBtb2RlIChHTCBwcm9ncmFtKVxuICAgIHZhciByZW5kZXJfY291bnQgPSAwO1xuICAgIGZvciAodmFyIG1vZGUgaW4gdGhpcy5tb2Rlcykge1xuICAgICAgICAvLyBQZXItZnJhbWUgbW9kZSB1cGRhdGVzL2FuaW1hdGlvbnNcbiAgICAgICAgLy8gQ2FsbGVkIGV2ZW4gaWYgdGhlIG1vZGUgaXNuJ3QgcmVuZGVyZWQgYnkgYW55IGN1cnJlbnQgdGlsZXMsIHNvIHRpbWUtYmFzZWQgYW5pbWF0aW9ucywgZXRjLiBjb250aW51ZVxuICAgICAgICB0aGlzLm1vZGVzW21vZGVdLnVwZGF0ZSgpO1xuXG4gICAgICAgIHZhciBnbF9wcm9ncmFtID0gdGhpcy5tb2Rlc1ttb2RlXS5nbF9wcm9ncmFtO1xuICAgICAgICBpZiAoZ2xfcHJvZ3JhbSA9PSBudWxsIHx8IGdsX3Byb2dyYW0uY29tcGlsZWQgPT0gZmFsc2UpIHtcbiAgICAgICAgICAgIGNvbnRpbnVlO1xuICAgICAgICB9XG5cbiAgICAgICAgdmFyIGZpcnN0X2Zvcl9tb2RlID0gdHJ1ZTtcblxuICAgICAgICAvLyBSZW5kZXIgdGlsZSBHTCBnZW9tZXRyaWVzXG4gICAgICAgIGZvciAodmFyIHQgaW4gcmVuZGVyYWJsZV90aWxlcykge1xuICAgICAgICAgICAgdmFyIHRpbGUgPSByZW5kZXJhYmxlX3RpbGVzW3RdO1xuXG4gICAgICAgICAgICBpZiAodGlsZS5nbF9nZW9tZXRyeVttb2RlXSAhPSBudWxsKSB7XG4gICAgICAgICAgICAgICAgLy8gU2V0dXAgbW9kZSBpZiBlbmNvdW50ZXJpbmcgZm9yIGZpcnN0IHRpbWUgdGhpcyBmcmFtZVxuICAgICAgICAgICAgICAgIC8vIChsYXp5IGluaXQsIG5vdCBhbGwgbW9kZXMgd2lsbCBiZSB1c2VkIGluIGFsbCBzY3JlZW4gdmlld3M7IHNvbWUgbW9kZXMgbWlnaHQgYmUgZGVmaW5lZCBidXQgbmV2ZXIgdXNlZClcbiAgICAgICAgICAgICAgICBpZiAoZmlyc3RfZm9yX21vZGUgPT0gdHJ1ZSkge1xuICAgICAgICAgICAgICAgICAgICBmaXJzdF9mb3JfbW9kZSA9IGZhbHNlO1xuXG4gICAgICAgICAgICAgICAgICAgIGdsX3Byb2dyYW0udXNlKCk7XG4gICAgICAgICAgICAgICAgICAgIHRoaXMubW9kZXNbbW9kZV0uc2V0VW5pZm9ybXMoKTtcblxuICAgICAgICAgICAgICAgICAgICAvLyBUT0RPOiBkb24ndCBzZXQgdW5pZm9ybXMgd2hlbiB0aGV5IGhhdmVuJ3QgY2hhbmdlZFxuICAgICAgICAgICAgICAgICAgICBnbF9wcm9ncmFtLnVuaWZvcm0oJzJmJywgJ3VfcmVzb2x1dGlvbicsIHRoaXMuZGV2aWNlX3NpemUud2lkdGgsIHRoaXMuZGV2aWNlX3NpemUuaGVpZ2h0KTtcbiAgICAgICAgICAgICAgICAgICAgZ2xfcHJvZ3JhbS51bmlmb3JtKCcyZicsICd1X2FzcGVjdCcsIHRoaXMudmlld19hc3BlY3QsIDEuMCk7XG4gICAgICAgICAgICAgICAgICAgIGdsX3Byb2dyYW0udW5pZm9ybSgnMWYnLCAndV90aW1lJywgKCgrbmV3IERhdGUoKSkgLSB0aGlzLnN0YXJ0X3RpbWUpIC8gMTAwMCk7XG4gICAgICAgICAgICAgICAgICAgIGdsX3Byb2dyYW0udW5pZm9ybSgnMWYnLCAndV9tYXBfem9vbScsIHRoaXMuem9vbSk7IC8vIE1hdGguZmxvb3IodGhpcy56b29tKSArIChNYXRoLmxvZygodGhpcy56b29tICUgMSkgKyAxKSAvIE1hdGguTE4yIC8vIHNjYWxlIGZyYWN0aW9uYWwgem9vbSBieSBsb2dcbiAgICAgICAgICAgICAgICAgICAgZ2xfcHJvZ3JhbS51bmlmb3JtKCcyZicsICd1X21hcF9jZW50ZXInLCBjZW50ZXIueCwgY2VudGVyLnkpO1xuICAgICAgICAgICAgICAgICAgICBnbF9wcm9ncmFtLnVuaWZvcm0oJzFmJywgJ3VfbnVtX2xheWVycycsIHRoaXMubGF5ZXJzLmxlbmd0aCk7XG4gICAgICAgICAgICAgICAgICAgIGdsX3Byb2dyYW0udW5pZm9ybSgnMWYnLCAndV9tZXRlcnNfcGVyX3BpeGVsJywgdGhpcy5tZXRlcnNfcGVyX3BpeGVsKTtcblxuICAgICAgICAgICAgICAgICAgICB0aGlzLmNhbWVyYS5zZXR1cFByb2dyYW0oZ2xfcHJvZ3JhbSk7XG4gICAgICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICAgICAgLy8gVE9ETzogY2FsYyB0aGVzZSBvbmNlIHBlciB0aWxlIChjdXJyZW50bHkgYmVpbmcgbmVlZGxlc3NseSByZS1jYWxjdWxhdGVkIHBlci10aWxlLXBlci1tb2RlKVxuXG4gICAgICAgICAgICAgICAgLy8gVGlsZSBvcmlnaW5cbiAgICAgICAgICAgICAgICBnbF9wcm9ncmFtLnVuaWZvcm0oJzJmJywgJ3VfdGlsZV9vcmlnaW4nLCB0aWxlLm1pbi54LCB0aWxlLm1pbi55KTtcblxuICAgICAgICAgICAgICAgIC8vIFRpbGUgdmlldyBtYXRyaXggLSB0cmFuc2Zvcm0gdGlsZSBzcGFjZSBpbnRvIHZpZXcgc3BhY2UgKG1ldGVycywgcmVsYXRpdmUgdG8gY2FtZXJhKVxuICAgICAgICAgICAgICAgIG1hdDQuaWRlbnRpdHkodGlsZV92aWV3X21hdCk7XG4gICAgICAgICAgICAgICAgbWF0NC50cmFuc2xhdGUodGlsZV92aWV3X21hdCwgdGlsZV92aWV3X21hdCwgdmVjMy5mcm9tVmFsdWVzKHRpbGUubWluLnggLSBjZW50ZXIueCwgdGlsZS5taW4ueSAtIGNlbnRlci55LCAwKSk7IC8vIGFkanVzdCBmb3IgdGlsZSBvcmlnaW4gJiBtYXAgY2VudGVyXG4gICAgICAgICAgICAgICAgbWF0NC5zY2FsZSh0aWxlX3ZpZXdfbWF0LCB0aWxlX3ZpZXdfbWF0LCB2ZWMzLmZyb21WYWx1ZXModGlsZS5zcGFuLnggLyBTY2VuZS50aWxlX3NjYWxlLCAtMSAqIHRpbGUuc3Bhbi55IC8gU2NlbmUudGlsZV9zY2FsZSwgMSkpOyAvLyBzY2FsZSB0aWxlIGxvY2FsIGNvb3JkcyB0byBtZXRlcnNcbiAgICAgICAgICAgICAgICBnbF9wcm9ncmFtLnVuaWZvcm0oJ01hdHJpeDRmdicsICd1X3RpbGVfdmlldycsIGZhbHNlLCB0aWxlX3ZpZXdfbWF0KTtcblxuICAgICAgICAgICAgICAgIC8vIFRpbGUgd29ybGQgbWF0cml4IC0gdHJhbnNmb3JtIHRpbGUgc3BhY2UgaW50byB3b3JsZCBzcGFjZSAobWV0ZXJzLCBhYnNvbHV0ZSBtZXJjYXRvciBwb3NpdGlvbilcbiAgICAgICAgICAgICAgICBtYXQ0LmlkZW50aXR5KHRpbGVfd29ybGRfbWF0KTtcbiAgICAgICAgICAgICAgICBtYXQ0LnRyYW5zbGF0ZSh0aWxlX3dvcmxkX21hdCwgdGlsZV93b3JsZF9tYXQsIHZlYzMuZnJvbVZhbHVlcyh0aWxlLm1pbi54LCB0aWxlLm1pbi55LCAwKSk7XG4gICAgICAgICAgICAgICAgbWF0NC5zY2FsZSh0aWxlX3dvcmxkX21hdCwgdGlsZV93b3JsZF9tYXQsIHZlYzMuZnJvbVZhbHVlcyh0aWxlLnNwYW4ueCAvIFNjZW5lLnRpbGVfc2NhbGUsIC0xICogdGlsZS5zcGFuLnkgLyBTY2VuZS50aWxlX3NjYWxlLCAxKSk7IC8vIHNjYWxlIHRpbGUgbG9jYWwgY29vcmRzIHRvIG1ldGVyc1xuICAgICAgICAgICAgICAgIGdsX3Byb2dyYW0udW5pZm9ybSgnTWF0cml4NGZ2JywgJ3VfdGlsZV93b3JsZCcsIGZhbHNlLCB0aWxlX3dvcmxkX21hdCk7XG5cbiAgICAgICAgICAgICAgICAvLyBSZW5kZXIgdGlsZVxuICAgICAgICAgICAgICAgIHRpbGUuZ2xfZ2VvbWV0cnlbbW9kZV0ucmVuZGVyKCk7XG4gICAgICAgICAgICAgICAgcmVuZGVyX2NvdW50ICs9IHRpbGUuZ2xfZ2VvbWV0cnlbbW9kZV0uZ2VvbWV0cnlfY291bnQ7XG4gICAgICAgICAgICB9XG4gICAgICAgIH1cbiAgICB9XG5cbiAgICAvLyBSZW5kZXIgc2VsZWN0aW9uIHBhc3MgKGlmIG5lZWRlZClcbiAgICAvLyBTbGlnaHQgdmFyaWF0aW9ucyBvbiByZW5kZXIgcGFzcyBjb2RlIGFib3ZlIC0gbW9zdGx5IGJlY2F1c2Ugd2UncmUgcmV1c2luZyB1bmlmb3JtcyBmcm9tIHRoZSBtYWluXG4gICAgLy8gbW9kZSBwcm9ncmFtLCBmb3IgdGhlIHNlbGVjdGlvbiBwcm9ncmFtXG4gICAgLy8gVE9ETzogcmVkdWNlIGR1cGxpY2F0ZWQgY29kZSB3L21haW4gcmVuZGVyIHBhc3MgYWJvdmVcbiAgICBpZiAodGhpcy51cGRhdGVfc2VsZWN0aW9uKSB7XG4gICAgICAgIHRoaXMudXBkYXRlX3NlbGVjdGlvbiA9IGZhbHNlOyAvLyByZXNldCBzZWxlY3Rpb24gY2hlY2tcblxuICAgICAgICAvLyBUT0RPOiBxdWV1ZSBjYWxsYmFjayB0aWxsIHBhbm5pbmcgaXMgb3Zlcj8gY29vcmRzIHdoZXJlIHNlbGVjdGlvbiB3YXMgcmVxdWVzdGVkIGFyZSBvdXQgb2YgZGF0ZVxuICAgICAgICBpZiAodGhpcy5wYW5uaW5nKSB7XG4gICAgICAgICAgICByZXR1cm47XG4gICAgICAgIH1cblxuICAgICAgICAvLyBTd2l0Y2ggdG8gRkJPXG4gICAgICAgIGdsLmJpbmRGcmFtZWJ1ZmZlcihnbC5GUkFNRUJVRkZFUiwgdGhpcy5mYm8pO1xuICAgICAgICBnbC52aWV3cG9ydCgwLCAwLCB0aGlzLmZib19zaXplLndpZHRoLCB0aGlzLmZib19zaXplLmhlaWdodCk7XG4gICAgICAgIHRoaXMucmVzZXRGcmFtZSgpO1xuXG4gICAgICAgIGZvciAobW9kZSBpbiB0aGlzLm1vZGVzKSB7XG4gICAgICAgICAgICBnbF9wcm9ncmFtID0gdGhpcy5tb2Rlc1ttb2RlXS5zZWxlY3Rpb25fZ2xfcHJvZ3JhbTtcbiAgICAgICAgICAgIGlmIChnbF9wcm9ncmFtID09IG51bGwgfHwgZ2xfcHJvZ3JhbS5jb21waWxlZCA9PSBmYWxzZSkge1xuICAgICAgICAgICAgICAgIGNvbnRpbnVlO1xuICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICBmaXJzdF9mb3JfbW9kZSA9IHRydWU7XG5cbiAgICAgICAgICAgIC8vIFJlbmRlciB0aWxlIEdMIGdlb21ldHJpZXNcbiAgICAgICAgICAgIGZvciAodCBpbiByZW5kZXJhYmxlX3RpbGVzKSB7XG4gICAgICAgICAgICAgICAgdGlsZSA9IHJlbmRlcmFibGVfdGlsZXNbdF07XG5cbiAgICAgICAgICAgICAgICBpZiAodGlsZS5nbF9nZW9tZXRyeVttb2RlXSAhPSBudWxsKSB7XG4gICAgICAgICAgICAgICAgICAgIC8vIFNldHVwIG1vZGUgaWYgZW5jb3VudGVyaW5nIGZvciBmaXJzdCB0aW1lIHRoaXMgZnJhbWVcbiAgICAgICAgICAgICAgICAgICAgaWYgKGZpcnN0X2Zvcl9tb2RlID09IHRydWUpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgIGZpcnN0X2Zvcl9tb2RlID0gZmFsc2U7XG5cbiAgICAgICAgICAgICAgICAgICAgICAgIGdsX3Byb2dyYW0udXNlKCk7XG4gICAgICAgICAgICAgICAgICAgICAgICB0aGlzLm1vZGVzW21vZGVdLnNldFVuaWZvcm1zKCk7XG5cbiAgICAgICAgICAgICAgICAgICAgICAgIGdsX3Byb2dyYW0udW5pZm9ybSgnMmYnLCAndV9yZXNvbHV0aW9uJywgdGhpcy5mYm9fc2l6ZS53aWR0aCwgdGhpcy5mYm9fc2l6ZS5oZWlnaHQpO1xuICAgICAgICAgICAgICAgICAgICAgICAgZ2xfcHJvZ3JhbS51bmlmb3JtKCcyZicsICd1X2FzcGVjdCcsIHRoaXMuZmJvX3NpemUuYXNwZWN0LCAxLjApO1xuICAgICAgICAgICAgICAgICAgICAgICAgZ2xfcHJvZ3JhbS51bmlmb3JtKCcxZicsICd1X3RpbWUnLCAoKCtuZXcgRGF0ZSgpKSAtIHRoaXMuc3RhcnRfdGltZSkgLyAxMDAwKTtcbiAgICAgICAgICAgICAgICAgICAgICAgIGdsX3Byb2dyYW0udW5pZm9ybSgnMWYnLCAndV9tYXBfem9vbScsIHRoaXMuem9vbSk7XG4gICAgICAgICAgICAgICAgICAgICAgICBnbF9wcm9ncmFtLnVuaWZvcm0oJzJmJywgJ3VfbWFwX2NlbnRlcicsIGNlbnRlci54LCBjZW50ZXIueSk7XG4gICAgICAgICAgICAgICAgICAgICAgICBnbF9wcm9ncmFtLnVuaWZvcm0oJzFmJywgJ3VfbnVtX2xheWVycycsIHRoaXMubGF5ZXJzLmxlbmd0aCk7XG4gICAgICAgICAgICAgICAgICAgICAgICBnbF9wcm9ncmFtLnVuaWZvcm0oJzFmJywgJ3VfbWV0ZXJzX3Blcl9waXhlbCcsIHRoaXMubWV0ZXJzX3Blcl9waXhlbCk7XG5cbiAgICAgICAgICAgICAgICAgICAgICAgIHRoaXMuY2FtZXJhLnNldHVwUHJvZ3JhbShnbF9wcm9ncmFtKTtcbiAgICAgICAgICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICAgICAgICAgIC8vIFRpbGUgb3JpZ2luXG4gICAgICAgICAgICAgICAgICAgIGdsX3Byb2dyYW0udW5pZm9ybSgnMmYnLCAndV90aWxlX29yaWdpbicsIHRpbGUubWluLngsIHRpbGUubWluLnkpO1xuXG4gICAgICAgICAgICAgICAgICAgIC8vIFRpbGUgdmlldyBtYXRyaXggLSB0cmFuc2Zvcm0gdGlsZSBzcGFjZSBpbnRvIHZpZXcgc3BhY2UgKG1ldGVycywgcmVsYXRpdmUgdG8gY2FtZXJhKVxuICAgICAgICAgICAgICAgICAgICBtYXQ0LmlkZW50aXR5KHRpbGVfdmlld19tYXQpO1xuICAgICAgICAgICAgICAgICAgICBtYXQ0LnRyYW5zbGF0ZSh0aWxlX3ZpZXdfbWF0LCB0aWxlX3ZpZXdfbWF0LCB2ZWMzLmZyb21WYWx1ZXModGlsZS5taW4ueCAtIGNlbnRlci54LCB0aWxlLm1pbi55IC0gY2VudGVyLnksIDApKTsgLy8gYWRqdXN0IGZvciB0aWxlIG9yaWdpbiAmIG1hcCBjZW50ZXJcbiAgICAgICAgICAgICAgICAgICAgbWF0NC5zY2FsZSh0aWxlX3ZpZXdfbWF0LCB0aWxlX3ZpZXdfbWF0LCB2ZWMzLmZyb21WYWx1ZXModGlsZS5zcGFuLnggLyBTY2VuZS50aWxlX3NjYWxlLCAtMSAqIHRpbGUuc3Bhbi55IC8gU2NlbmUudGlsZV9zY2FsZSwgMSkpOyAvLyBzY2FsZSB0aWxlIGxvY2FsIGNvb3JkcyB0byBtZXRlcnNcbiAgICAgICAgICAgICAgICAgICAgZ2xfcHJvZ3JhbS51bmlmb3JtKCdNYXRyaXg0ZnYnLCAndV90aWxlX3ZpZXcnLCBmYWxzZSwgdGlsZV92aWV3X21hdCk7XG5cbiAgICAgICAgICAgICAgICAgICAgLy8gVGlsZSB3b3JsZCBtYXRyaXggLSB0cmFuc2Zvcm0gdGlsZSBzcGFjZSBpbnRvIHdvcmxkIHNwYWNlIChtZXRlcnMsIGFic29sdXRlIG1lcmNhdG9yIHBvc2l0aW9uKVxuICAgICAgICAgICAgICAgICAgICBtYXQ0LmlkZW50aXR5KHRpbGVfd29ybGRfbWF0KTtcbiAgICAgICAgICAgICAgICAgICAgbWF0NC50cmFuc2xhdGUodGlsZV93b3JsZF9tYXQsIHRpbGVfd29ybGRfbWF0LCB2ZWMzLmZyb21WYWx1ZXModGlsZS5taW4ueCwgdGlsZS5taW4ueSwgMCkpO1xuICAgICAgICAgICAgICAgICAgICBtYXQ0LnNjYWxlKHRpbGVfd29ybGRfbWF0LCB0aWxlX3dvcmxkX21hdCwgdmVjMy5mcm9tVmFsdWVzKHRpbGUuc3Bhbi54IC8gU2NlbmUudGlsZV9zY2FsZSwgLTEgKiB0aWxlLnNwYW4ueSAvIFNjZW5lLnRpbGVfc2NhbGUsIDEpKTsgLy8gc2NhbGUgdGlsZSBsb2NhbCBjb29yZHMgdG8gbWV0ZXJzXG4gICAgICAgICAgICAgICAgICAgIGdsX3Byb2dyYW0udW5pZm9ybSgnTWF0cml4NGZ2JywgJ3VfdGlsZV93b3JsZCcsIGZhbHNlLCB0aWxlX3dvcmxkX21hdCk7XG5cbiAgICAgICAgICAgICAgICAgICAgLy8gUmVuZGVyIHRpbGVcbiAgICAgICAgICAgICAgICAgICAgdGlsZS5nbF9nZW9tZXRyeVttb2RlXS5yZW5kZXIoKTtcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICB9XG4gICAgICAgIH1cblxuICAgICAgICAvLyBEZWxheSByZWFkaW5nIHRoZSBwaXhlbCByZXN1bHQgZnJvbSB0aGUgc2VsZWN0aW9uIGJ1ZmZlciB0byBhdm9pZCBDUFUvR1BVIHN5bmMgbG9jay5cbiAgICAgICAgLy8gQ2FsbGluZyByZWFkUGl4ZWxzIHN5bmNocm9ub3VzbHkgY2F1c2VkIGEgbWFzc2l2ZSBwZXJmb3JtYW5jZSBoaXQsIHByZXN1bWFibHkgc2luY2UgaXRcbiAgICAgICAgLy8gZm9yY2VkIHRoaXMgZnVuY3Rpb24gdG8gd2FpdCBmb3IgdGhlIEdQVSB0byBmaW5pc2ggcmVuZGVyaW5nIGFuZCByZXRyaWV2ZSB0aGUgdGV4dHVyZSBjb250ZW50cy5cbiAgICAgICAgaWYgKHRoaXMuc2VsZWN0aW9uX2NhbGxiYWNrX3RpbWVyICE9IG51bGwpIHtcbiAgICAgICAgICAgIGNsZWFyVGltZW91dCh0aGlzLnNlbGVjdGlvbl9jYWxsYmFja190aW1lcik7XG4gICAgICAgIH1cbiAgICAgICAgdGhpcy5zZWxlY3Rpb25fY2FsbGJhY2tfdGltZXIgPSBzZXRUaW1lb3V0KFxuICAgICAgICAgICAgdGhpcy5yZWFkU2VsZWN0aW9uQnVmZmVyLmJpbmQodGhpcyksXG4gICAgICAgICAgICB0aGlzLnNlbGVjdGlvbl9mcmFtZV9kZWxheVxuICAgICAgICApO1xuXG4gICAgICAgIC8vIFJlc2V0IHRvIHNjcmVlbiBidWZmZXJcbiAgICAgICAgZ2wuYmluZEZyYW1lYnVmZmVyKGdsLkZSQU1FQlVGRkVSLCBudWxsKTtcbiAgICAgICAgZ2wudmlld3BvcnQoMCwgMCwgdGhpcy5jYW52YXMud2lkdGgsIHRoaXMuY2FudmFzLmhlaWdodCk7XG4gICAgfVxuXG4gICAgaWYgKHJlbmRlcl9jb3VudCAhPSB0aGlzLmxhc3RfcmVuZGVyX2NvdW50KSB7XG4gICAgICAgIGNvbnNvbGUubG9nKFwicmVuZGVyZWQgXCIgKyByZW5kZXJfY291bnQgKyBcIiBwcmltaXRpdmVzXCIpO1xuICAgIH1cbiAgICB0aGlzLmxhc3RfcmVuZGVyX2NvdW50ID0gcmVuZGVyX2NvdW50O1xuXG4gICAgcmV0dXJuIHRydWU7XG59O1xuXG4vLyBSZXF1ZXN0IGZlYXR1cmUgc2VsZWN0aW9uXG4vLyBSdW5zIGFzeW5jaHJvbm91c2x5LCBzY2hlZHVsZXMgc2VsZWN0aW9uIGJ1ZmZlciB0byBiZSB1cGRhdGVkXG5TY2VuZS5wcm90b3R5cGUuZ2V0RmVhdHVyZUF0ID0gZnVuY3Rpb24gKHBpeGVsLCBjYWxsYmFjaykge1xuICAgIGlmICghdGhpcy5pbml0aWFsaXplZCkge1xuICAgICAgICByZXR1cm47XG4gICAgfVxuXG4gICAgLy8gVE9ETzogcXVldWUgY2FsbGJhY2tzIHdoaWxlIHN0aWxsIHBlcmZvcm1pbmcgb25seSBvbmUgc2VsZWN0aW9uIHJlbmRlciBwYXNzIHdpdGhpbiBYIHRpbWUgaW50ZXJ2YWw/XG4gICAgaWYgKHRoaXMudXBkYXRlX3NlbGVjdGlvbiA9PSB0cnVlKSB7XG4gICAgICAgIHJldHVybjtcbiAgICB9XG5cbiAgICB0aGlzLnNlbGVjdGlvbl9wb2ludCA9IFBvaW50KFxuICAgICAgICBwaXhlbC54ICogdGhpcy5kZXZpY2VfcGl4ZWxfcmF0aW8sXG4gICAgICAgIHRoaXMuZGV2aWNlX3NpemUuaGVpZ2h0IC0gKHBpeGVsLnkgKiB0aGlzLmRldmljZV9waXhlbF9yYXRpbylcbiAgICApO1xuICAgIHRoaXMuc2VsZWN0aW9uX2NhbGxiYWNrID0gY2FsbGJhY2s7XG4gICAgdGhpcy51cGRhdGVfc2VsZWN0aW9uID0gdHJ1ZTtcbiAgICB0aGlzLmRpcnR5ID0gdHJ1ZTtcbn07XG5cblNjZW5lLnByb3RvdHlwZS5yZWFkU2VsZWN0aW9uQnVmZmVyID0gZnVuY3Rpb24gKCkge1xuICAgIHZhciBnbCA9IHRoaXMuZ2w7XG5cbiAgICBnbC5iaW5kRnJhbWVidWZmZXIoZ2wuRlJBTUVCVUZGRVIsIHRoaXMuZmJvKTtcblxuICAgIC8vIENoZWNrIHNlbGVjdGlvbiBtYXAgYWdhaW5zdCBGQk9cbiAgICBnbC5yZWFkUGl4ZWxzKFxuICAgICAgICBNYXRoLmZsb29yKHRoaXMuc2VsZWN0aW9uX3BvaW50LnggKiB0aGlzLmZib19zaXplLndpZHRoIC8gdGhpcy5kZXZpY2Vfc2l6ZS53aWR0aCksXG4gICAgICAgIE1hdGguZmxvb3IodGhpcy5zZWxlY3Rpb25fcG9pbnQueSAqIHRoaXMuZmJvX3NpemUuaGVpZ2h0IC8gdGhpcy5kZXZpY2Vfc2l6ZS5oZWlnaHQpLFxuICAgICAgICAxLCAxLCBnbC5SR0JBLCBnbC5VTlNJR05FRF9CWVRFLCB0aGlzLnBpeGVsKTtcbiAgICB2YXIgZmVhdHVyZV9rZXkgPSAodGhpcy5waXhlbFswXSArICh0aGlzLnBpeGVsWzFdIDw8IDgpICsgKHRoaXMucGl4ZWxbMl0gPDwgMTYpICsgKHRoaXMucGl4ZWxbM10gPDwgMjQpKSA+Pj4gMDtcblxuICAgIC8vIGNvbnNvbGUubG9nKFxuICAgIC8vICAgICBNYXRoLmZsb29yKHRoaXMuc2VsZWN0aW9uX3BvaW50LnggKiB0aGlzLmZib19zaXplLndpZHRoIC8gdGhpcy5kZXZpY2Vfc2l6ZS53aWR0aCkgKyBcIiwgXCIgK1xuICAgIC8vICAgICBNYXRoLmZsb29yKHRoaXMuc2VsZWN0aW9uX3BvaW50LnkgKiB0aGlzLmZib19zaXplLmhlaWdodCAvIHRoaXMuZGV2aWNlX3NpemUuaGVpZ2h0KSArIFwiOiAoXCIgK1xuICAgIC8vICAgICB0aGlzLnBpeGVsWzBdICsgXCIsIFwiICsgdGhpcy5waXhlbFsxXSArIFwiLCBcIiArIHRoaXMucGl4ZWxbMl0gKyBcIiwgXCIgKyB0aGlzLnBpeGVsWzNdICsgXCIpXCIpO1xuXG4gICAgLy8gSWYgZmVhdHVyZSBmb3VuZCwgYXNrIGFwcHJvcHJpYXRlIHdlYiB3b3JrZXIgdG8gbG9va3VwIGZlYXR1cmVcbiAgICB2YXIgd29ya2VyX2lkID0gdGhpcy5waXhlbFszXTtcbiAgICBpZiAod29ya2VyX2lkICE9IDI1NSkgeyAvLyAyNTUgaW5kaWNhdGVzIGFuIGVtcHR5IHNlbGVjdGlvbiBidWZmZXIgcGl4ZWxcbiAgICAgICAgLy8gY29uc29sZS5sb2coXCJ3b3JrZXJfaWQ6IFwiICsgd29ya2VyX2lkKTtcbiAgICAgICAgaWYgKHRoaXMud29ya2Vyc1t3b3JrZXJfaWRdICE9IG51bGwpIHtcbiAgICAgICAgICAgIC8vIGNvbnNvbGUubG9nKFwicG9zdCBtZXNzYWdlXCIpO1xuICAgICAgICAgICAgdGhpcy53b3JrZXJzW3dvcmtlcl9pZF0ucG9zdE1lc3NhZ2Uoe1xuICAgICAgICAgICAgICAgIHR5cGU6ICdnZXRGZWF0dXJlU2VsZWN0aW9uJyxcbiAgICAgICAgICAgICAgICBrZXk6IGZlYXR1cmVfa2V5XG4gICAgICAgICAgICB9KTtcbiAgICAgICAgfVxuICAgIH1cbiAgICAvLyBObyBmZWF0dXJlIGZvdW5kLCBidXQgc3RpbGwgbmVlZCB0byBub3RpZnkgdmlhIGNhbGxiYWNrXG4gICAgZWxzZSB7XG4gICAgICAgIHRoaXMud29ya2VyR2V0RmVhdHVyZVNlbGVjdGlvbih7IGRhdGE6IHsgdHlwZTogJ2dldEZlYXR1cmVTZWxlY3Rpb24nLCBmZWF0dXJlOiBudWxsIH0gfSk7XG4gICAgfVxuXG4gICAgZ2wuYmluZEZyYW1lYnVmZmVyKGdsLkZSQU1FQlVGRkVSLCBudWxsKTtcbn07XG5cbi8vIENhbGxlZCBvbiBtYWluIHRocmVhZCB3aGVuIGEgd2ViIHdvcmtlciBmaW5kcyBhIGZlYXR1cmUgaW4gdGhlIHNlbGVjdGlvbiBidWZmZXJcblNjZW5lLnByb3RvdHlwZS53b3JrZXJHZXRGZWF0dXJlU2VsZWN0aW9uID0gZnVuY3Rpb24gKGV2ZW50KSB7XG4gICAgaWYgKGV2ZW50LmRhdGEudHlwZSAhPSAnZ2V0RmVhdHVyZVNlbGVjdGlvbicpIHtcbiAgICAgICAgcmV0dXJuO1xuICAgIH1cblxuICAgIHZhciBmZWF0dXJlID0gZXZlbnQuZGF0YS5mZWF0dXJlO1xuICAgIHZhciBjaGFuZ2VkID0gZmFsc2U7XG4gICAgaWYgKChmZWF0dXJlICE9IG51bGwgJiYgdGhpcy5zZWxlY3RlZF9mZWF0dXJlID09IG51bGwpIHx8XG4gICAgICAgIChmZWF0dXJlID09IG51bGwgJiYgdGhpcy5zZWxlY3RlZF9mZWF0dXJlICE9IG51bGwpIHx8XG4gICAgICAgIChmZWF0dXJlICE9IG51bGwgJiYgdGhpcy5zZWxlY3RlZF9mZWF0dXJlICE9IG51bGwgJiYgZmVhdHVyZS5pZCAhPSB0aGlzLnNlbGVjdGVkX2ZlYXR1cmUuaWQpKSB7XG4gICAgICAgIGNoYW5nZWQgPSB0cnVlO1xuICAgIH1cblxuICAgIHRoaXMuc2VsZWN0ZWRfZmVhdHVyZSA9IGZlYXR1cmU7XG5cbiAgICBpZiAodHlwZW9mIHRoaXMuc2VsZWN0aW9uX2NhbGxiYWNrID09ICdmdW5jdGlvbicpIHtcbiAgICAgICAgdGhpcy5zZWxlY3Rpb25fY2FsbGJhY2soeyBmZWF0dXJlOiB0aGlzLnNlbGVjdGVkX2ZlYXR1cmUsIGNoYW5nZWQ6IGNoYW5nZWQgfSk7XG4gICAgfVxufTtcblxuLy8gUXVldWUgYSB0aWxlIGZvciBsb2FkXG5TY2VuZS5wcm90b3R5cGUubG9hZFRpbGUgPSBmdW5jdGlvbiAoY29vcmRzLCBkaXYsIGNhbGxiYWNrKSB7XG4gICAgdGhpcy5xdWV1ZWRfdGlsZXNbdGhpcy5xdWV1ZWRfdGlsZXMubGVuZ3RoXSA9IGFyZ3VtZW50cztcbn07XG5cbi8vIExvYWQgYWxsIHF1ZXVlZCB0aWxlc1xuU2NlbmUucHJvdG90eXBlLmxvYWRRdWV1ZWRUaWxlcyA9IGZ1bmN0aW9uICgpIHtcbiAgICBpZiAoIXRoaXMuaW5pdGlhbGl6ZWQpIHtcbiAgICAgICAgcmV0dXJuO1xuICAgIH1cblxuICAgIGlmICh0aGlzLnF1ZXVlZF90aWxlcy5sZW5ndGggPT0gMCkge1xuICAgICAgICByZXR1cm47XG4gICAgfVxuXG4gICAgZm9yICh2YXIgdD0wOyB0IDwgdGhpcy5xdWV1ZWRfdGlsZXMubGVuZ3RoOyB0KyspIHtcbiAgICAgICAgdGhpcy5fbG9hZFRpbGUuYXBwbHkodGhpcywgdGhpcy5xdWV1ZWRfdGlsZXNbdF0pO1xuICAgIH1cblxuICAgIHRoaXMucXVldWVkX3RpbGVzID0gW107XG59O1xuXG4vLyBMb2FkIGEgc2luZ2xlIHRpbGVcblNjZW5lLnByb3RvdHlwZS5fbG9hZFRpbGUgPSBmdW5jdGlvbiAoY29vcmRzLCBkaXYsIGNhbGxiYWNrKSB7XG4gICAgLy8gT3Zlcnpvb20/XG4gICAgaWYgKGNvb3Jkcy56ID4gdGhpcy50aWxlX3NvdXJjZS5tYXhfem9vbSkge1xuICAgICAgICB2YXIgemdhcCA9IGNvb3Jkcy56IC0gdGhpcy50aWxlX3NvdXJjZS5tYXhfem9vbTtcbiAgICAgICAgLy8gdmFyIG9yaWdpbmFsX3RpbGUgPSBbY29vcmRzLngsIGNvb3Jkcy55LCBjb29yZHMuel0uam9pbignLycpO1xuICAgICAgICBjb29yZHMueCA9IH5+KGNvb3Jkcy54IC8gTWF0aC5wb3coMiwgemdhcCkpO1xuICAgICAgICBjb29yZHMueSA9IH5+KGNvb3Jkcy55IC8gTWF0aC5wb3coMiwgemdhcCkpO1xuICAgICAgICBjb29yZHMuZGlzcGxheV96ID0gY29vcmRzLno7IC8vIHogd2l0aG91dCBvdmVyem9vbVxuICAgICAgICBjb29yZHMueiAtPSB6Z2FwO1xuICAgICAgICAvLyBjb25zb2xlLmxvZyhcImFkanVzdGVkIGZvciBvdmVyem9vbSwgdGlsZSBcIiArIG9yaWdpbmFsX3RpbGUgKyBcIiAtPiBcIiArIFtjb29yZHMueCwgY29vcmRzLnksIGNvb3Jkcy56XS5qb2luKCcvJykpO1xuICAgIH1cblxuICAgIHRoaXMudHJhY2tUaWxlU2V0TG9hZFN0YXJ0KCk7XG5cbiAgICB2YXIga2V5ID0gW2Nvb3Jkcy54LCBjb29yZHMueSwgY29vcmRzLnpdLmpvaW4oJy8nKTtcblxuICAgIC8vIEFscmVhZHkgbG9hZGluZy9sb2FkZWQ/XG4gICAgaWYgKHRoaXMudGlsZXNba2V5XSkge1xuICAgICAgICAvLyBpZiAodGhpcy50aWxlc1trZXldLmxvYWRlZCA9PSB0cnVlKSB7XG4gICAgICAgIC8vICAgICBjb25zb2xlLmxvZyhcInVzZSBsb2FkZWQgdGlsZSBcIiArIGtleSArIFwiIGZyb20gY2FjaGVcIik7XG4gICAgICAgIC8vIH1cbiAgICAgICAgLy8gaWYgKHRoaXMudGlsZXNba2V5XS5sb2FkaW5nID09IHRydWUpIHtcbiAgICAgICAgLy8gICAgIGNvbnNvbGUubG9nKFwiYWxyZWFkeSBsb2FkaW5nIHRpbGUgXCIgKyBrZXkgKyBcIiwgc2tpcFwiKTtcbiAgICAgICAgLy8gfVxuXG4gICAgICAgIGlmIChjYWxsYmFjaykge1xuICAgICAgICAgICAgY2FsbGJhY2sobnVsbCwgZGl2KTtcbiAgICAgICAgfVxuICAgICAgICByZXR1cm47XG4gICAgfVxuXG4gICAgdmFyIHRpbGUgPSB0aGlzLnRpbGVzW2tleV0gPSB7fTtcbiAgICB0aWxlLmtleSA9IGtleTtcbiAgICB0aWxlLmNvb3JkcyA9IGNvb3JkcztcbiAgICB0aWxlLm1pbiA9IEdlby5tZXRlcnNGb3JUaWxlKHRpbGUuY29vcmRzKTtcbiAgICB0aWxlLm1heCA9IEdlby5tZXRlcnNGb3JUaWxlKHsgeDogdGlsZS5jb29yZHMueCArIDEsIHk6IHRpbGUuY29vcmRzLnkgKyAxLCB6OiB0aWxlLmNvb3Jkcy56IH0pO1xuICAgIHRpbGUuc3BhbiA9IHsgeDogKHRpbGUubWF4LnggLSB0aWxlLm1pbi54KSwgeTogKHRpbGUubWF4LnkgLSB0aWxlLm1pbi55KSB9O1xuICAgIHRpbGUuYm91bmRzID0geyBzdzogeyB4OiB0aWxlLm1pbi54LCB5OiB0aWxlLm1heC55IH0sIG5lOiB7IHg6IHRpbGUubWF4LngsIHk6IHRpbGUubWluLnkgfSB9O1xuICAgIHRpbGUuZGVidWcgPSB7fTtcbiAgICB0aWxlLmxvYWRpbmcgPSB0cnVlO1xuICAgIHRpbGUubG9hZGVkID0gZmFsc2U7XG5cbiAgICB0aGlzLmJ1aWxkVGlsZSh0aWxlLmtleSk7XG4gICAgdGhpcy51cGRhdGVUaWxlRWxlbWVudCh0aWxlLCBkaXYpO1xuICAgIHRoaXMudXBkYXRlVmlzaWJpbGl0eUZvclRpbGUodGlsZSk7XG5cbiAgICBpZiAoY2FsbGJhY2spIHtcbiAgICAgICAgY2FsbGJhY2sobnVsbCwgZGl2KTtcbiAgICB9XG59O1xuXG4vLyBSZWJ1aWxkIGFsbCB0aWxlc1xuLy8gVE9ETzogYWxzbyByZWJ1aWxkIG1vZGVzPyAoZGV0ZWN0IGlmIGNoYW5nZWQpXG5TY2VuZS5wcm90b3R5cGUucmVidWlsZFRpbGVzID0gZnVuY3Rpb24gKCkge1xuICAgIGlmICghdGhpcy5pbml0aWFsaXplZCkge1xuICAgICAgICByZXR1cm47XG4gICAgfVxuXG4gICAgLy8gVXBkYXRlIGxheWVycyAmIHN0eWxlc1xuICAgIHRoaXMubGF5ZXJzX3NlcmlhbGl6ZWQgPSBVdGlscy5zZXJpYWxpemVXaXRoRnVuY3Rpb25zKHRoaXMubGF5ZXJzKTtcbiAgICB0aGlzLnN0eWxlc19zZXJpYWxpemVkID0gVXRpbHMuc2VyaWFsaXplV2l0aEZ1bmN0aW9ucyh0aGlzLnN0eWxlcyk7XG4gICAgdGhpcy5zZWxlY3Rpb25fbWFwID0ge307XG5cbiAgICAvLyBUZWxsIHdvcmtlcnMgd2UncmUgYWJvdXQgdG8gcmVidWlsZCAoc28gdGhleSBjYW4gcmVmcmVzaCBzdHlsZXMsIGV0Yy4pXG4gICAgdGhpcy53b3JrZXJzLmZvckVhY2god29ya2VyID0+IHtcbiAgICAgICAgd29ya2VyLnBvc3RNZXNzYWdlKHtcbiAgICAgICAgICAgIHR5cGU6ICdwcmVwYXJlRm9yUmVidWlsZCcsXG4gICAgICAgICAgICBsYXllcnM6IHRoaXMubGF5ZXJzX3NlcmlhbGl6ZWQsXG4gICAgICAgICAgICBzdHlsZXM6IHRoaXMuc3R5bGVzX3NlcmlhbGl6ZWRcbiAgICAgICAgfSk7XG4gICAgfSk7XG5cbiAgICAvLyBSZWJ1aWxkIHZpc2libGUgdGlsZXMgZmlyc3QsIGZyb20gY2VudGVyIG91dFxuICAgIC8vIGNvbnNvbGUubG9nKFwiZmluZCB2aXNpYmxlXCIpO1xuICAgIHZhciB2aXNpYmxlID0gW10sIGludmlzaWJsZSA9IFtdO1xuICAgIGZvciAodmFyIHQgaW4gdGhpcy50aWxlcykge1xuICAgICAgICBpZiAodGhpcy50aWxlc1t0XS52aXNpYmxlID09IHRydWUpIHtcbiAgICAgICAgICAgIHZpc2libGUucHVzaCh0KTtcbiAgICAgICAgfVxuICAgICAgICBlbHNlIHtcbiAgICAgICAgICAgIGludmlzaWJsZS5wdXNoKHQpO1xuICAgICAgICB9XG4gICAgfVxuXG4gICAgLy8gY29uc29sZS5sb2coXCJzb3J0IHZpc2libGUgZGlzdGFuY2VcIik7XG4gICAgdmlzaWJsZS5zb3J0KChhLCBiKSA9PiB7XG4gICAgICAgIC8vIHZhciBhZCA9IE1hdGguYWJzKHRoaXMuY2VudGVyX21ldGVycy54IC0gdGhpcy50aWxlc1tiXS5taW4ueCkgKyBNYXRoLmFicyh0aGlzLmNlbnRlcl9tZXRlcnMueSAtIHRoaXMudGlsZXNbYl0ubWluLnkpO1xuICAgICAgICAvLyB2YXIgYmQgPSBNYXRoLmFicyh0aGlzLmNlbnRlcl9tZXRlcnMueCAtIHRoaXMudGlsZXNbYV0ubWluLngpICsgTWF0aC5hYnModGhpcy5jZW50ZXJfbWV0ZXJzLnkgLSB0aGlzLnRpbGVzW2FdLm1pbi55KTtcbiAgICAgICAgdmFyIGFkID0gdGhpcy50aWxlc1thXS5jZW50ZXJfZGlzdDtcbiAgICAgICAgdmFyIGJkID0gdGhpcy50aWxlc1tiXS5jZW50ZXJfZGlzdDtcbiAgICAgICAgcmV0dXJuIChiZCA+IGFkID8gLTEgOiAoYmQgPT0gYWQgPyAwIDogMSkpO1xuICAgIH0pO1xuXG4gICAgLy8gY29uc29sZS5sb2coXCJidWlsZCB2aXNpYmxlXCIpO1xuICAgIGZvciAodmFyIHQgaW4gdmlzaWJsZSkge1xuICAgICAgICB0aGlzLmJ1aWxkVGlsZSh2aXNpYmxlW3RdKTtcbiAgICB9XG5cbiAgICAvLyBjb25zb2xlLmxvZyhcImJ1aWxkIGludmlzaWJsZVwiKTtcbiAgICBmb3IgKHZhciB0IGluIGludmlzaWJsZSkge1xuICAgICAgICAvLyBLZWVwIHRpbGVzIGluIGN1cnJlbnQgem9vbSBidXQgb3V0IG9mIHZpc2libGUgcmFuZ2UsIGJ1dCByZWJ1aWxkIGFzIGxvd2VyIHByaW9yaXR5XG4gICAgICAgIGlmICh0aGlzLmlzVGlsZUluWm9vbSh0aGlzLnRpbGVzW2ludmlzaWJsZVt0XV0pID09IHRydWUpIHtcbiAgICAgICAgICAgIHRoaXMuYnVpbGRUaWxlKGludmlzaWJsZVt0XSk7XG4gICAgICAgIH1cbiAgICAgICAgLy8gRHJvcCB0aWxlcyBvdXRzaWRlIGN1cnJlbnQgem9vbVxuICAgICAgICBlbHNlIHtcbiAgICAgICAgICAgIHRoaXMucmVtb3ZlVGlsZShpbnZpc2libGVbdF0pO1xuICAgICAgICB9XG4gICAgfVxuXG4gICAgdGhpcy51cGRhdGVBY3RpdmVNb2RlcygpO1xuICAgIHRoaXMucmVzZXRUaW1lKCk7XG59O1xuXG5TY2VuZS5wcm90b3R5cGUuYnVpbGRUaWxlID0gZnVuY3Rpb24oa2V5KSB7XG4gICAgdmFyIHRpbGUgPSB0aGlzLnRpbGVzW2tleV07XG5cbiAgICB0aGlzLndvcmtlclBvc3RNZXNzYWdlRm9yVGlsZSh0aWxlLCB7XG4gICAgICAgIHR5cGU6ICdidWlsZFRpbGUnLFxuICAgICAgICB0aWxlOiB7XG4gICAgICAgICAgICBrZXk6IHRpbGUua2V5LFxuICAgICAgICAgICAgY29vcmRzOiB0aWxlLmNvb3JkcywgLy8gdXNlZCBieSBzdHlsZSBoZWxwZXJzXG4gICAgICAgICAgICBtaW46IHRpbGUubWluLCAvLyB1c2VkIGJ5IFRpbGVTb3VyY2UgdG8gc2NhbGUgdGlsZSB0byBsb2NhbCBleHRlbnRzXG4gICAgICAgICAgICBtYXg6IHRpbGUubWF4LCAvLyB1c2VkIGJ5IFRpbGVTb3VyY2UgdG8gc2NhbGUgdGlsZSB0byBsb2NhbCBleHRlbnRzXG4gICAgICAgICAgICBkZWJ1ZzogdGlsZS5kZWJ1Z1xuICAgICAgICB9LFxuICAgICAgICB0aWxlX3NvdXJjZTogdGhpcy50aWxlX3NvdXJjZSxcbiAgICAgICAgbGF5ZXJzOiB0aGlzLmxheWVyc19zZXJpYWxpemVkLFxuICAgICAgICBzdHlsZXM6IHRoaXMuc3R5bGVzX3NlcmlhbGl6ZWRcbiAgICB9KTtcbn07XG5cbi8vIFByb2Nlc3MgZ2VvbWV0cnkgZm9yIHRpbGUgLSBjYWxsZWQgYnkgd2ViIHdvcmtlclxuLy8gUmV0dXJucyBhIHNldCBvZiB0aWxlIGtleXMgdGhhdCBzaG91bGQgYmUgc2VudCB0byB0aGUgbWFpbiB0aHJlYWQgKHNvIHRoYXQgd2UgY2FuIG1pbmltaXplIGRhdGEgZXhjaGFuZ2UgYmV0d2VlbiB3b3JrZXIgYW5kIG1haW4gdGhyZWFkKVxuU2NlbmUuYWRkVGlsZSA9IGZ1bmN0aW9uICh0aWxlLCBsYXllcnMsIHN0eWxlcywgbW9kZXMpIHtcbiAgICB2YXIgbGF5ZXIsIHN0eWxlLCBmZWF0dXJlLCB6LCBtb2RlO1xuICAgIHZhciB2ZXJ0ZXhfZGF0YSA9IHt9O1xuXG4gICAgLy8gSm9pbiBsaW5lIHRlc3QgcGF0dGVyblxuICAgIC8vIGlmIChTY2VuZS5kZWJ1Zykge1xuICAgIC8vICAgICB0aWxlLmxheWVyc1sncm9hZHMnXS5mZWF0dXJlcy5wdXNoKFNjZW5lLmJ1aWxkWmlnemFnTGluZVRlc3RQYXR0ZXJuKCkpO1xuICAgIC8vIH1cblxuICAgIC8vIEJ1aWxkIHJhdyBnZW9tZXRyeSBhcnJheXNcbiAgICAvLyBSZW5kZXIgbGF5ZXJzLCBhbmQgZmVhdHVyZXMgd2l0aGluIGVhY2ggbGF5ZXIsIGluIHJldmVyc2Ugb3JkZXIgLSBha2EgdG9wIHRvIGJvdHRvbVxuICAgIHRpbGUuZGVidWcuZmVhdHVyZXMgPSAwO1xuICAgIGZvciAodmFyIGxheWVyX251bSA9IGxheWVycy5sZW5ndGgtMTsgbGF5ZXJfbnVtID49IDA7IGxheWVyX251bS0tKSB7XG4gICAgICAgIGxheWVyID0gbGF5ZXJzW2xheWVyX251bV07XG5cbiAgICAgICAgLy8gU2tpcCBsYXllcnMgd2l0aCBubyBzdHlsZXMgZGVmaW5lZCwgb3IgbGF5ZXJzIHNldCB0byBub3QgYmUgdmlzaWJsZVxuICAgICAgICBpZiAoc3R5bGVzLmxheWVyc1tsYXllci5uYW1lXSA9PSBudWxsIHx8IHN0eWxlcy5sYXllcnNbbGF5ZXIubmFtZV0udmlzaWJsZSA9PSBmYWxzZSkge1xuICAgICAgICAgICAgY29udGludWU7XG4gICAgICAgIH1cblxuICAgICAgICBpZiAodGlsZS5sYXllcnNbbGF5ZXIubmFtZV0gIT0gbnVsbCkge1xuICAgICAgICAgICAgdmFyIG51bV9mZWF0dXJlcyA9IHRpbGUubGF5ZXJzW2xheWVyLm5hbWVdLmZlYXR1cmVzLmxlbmd0aDtcblxuICAgICAgICAgICAgZm9yICh2YXIgZiA9IG51bV9mZWF0dXJlcy0xOyBmID49IDA7IGYtLSkge1xuICAgICAgICAgICAgICAgIGZlYXR1cmUgPSB0aWxlLmxheWVyc1tsYXllci5uYW1lXS5mZWF0dXJlc1tmXTtcbiAgICAgICAgICAgICAgICBzdHlsZSA9IFN0eWxlLnBhcnNlU3R5bGVGb3JGZWF0dXJlKGZlYXR1cmUsIGxheWVyLm5hbWUsIHN0eWxlcy5sYXllcnNbbGF5ZXIubmFtZV0sIHRpbGUpO1xuXG4gICAgICAgICAgICAgICAgLy8gU2tpcCBmZWF0dXJlP1xuICAgICAgICAgICAgICAgIGlmIChzdHlsZSA9PSBudWxsKSB7XG4gICAgICAgICAgICAgICAgICAgIGNvbnRpbnVlO1xuICAgICAgICAgICAgICAgIH1cblxuICAgICAgICAgICAgICAgIHN0eWxlLmxheWVyX251bSA9IGxheWVyX251bTtcbiAgICAgICAgICAgICAgICBzdHlsZS56ID0gU2NlbmUuY2FsY3VsYXRlWihsYXllciwgdGlsZSkgKyBzdHlsZS56O1xuXG4gICAgICAgICAgICAgICAgdmFyIHBvaW50cyA9IG51bGwsXG4gICAgICAgICAgICAgICAgICAgIGxpbmVzID0gbnVsbCxcbiAgICAgICAgICAgICAgICAgICAgcG9seWdvbnMgPSBudWxsO1xuXG4gICAgICAgICAgICAgICAgaWYgKGZlYXR1cmUuZ2VvbWV0cnkudHlwZSA9PSAnUG9seWdvbicpIHtcbiAgICAgICAgICAgICAgICAgICAgcG9seWdvbnMgPSBbZmVhdHVyZS5nZW9tZXRyeS5jb29yZGluYXRlc107XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgIGVsc2UgaWYgKGZlYXR1cmUuZ2VvbWV0cnkudHlwZSA9PSAnTXVsdGlQb2x5Z29uJykge1xuICAgICAgICAgICAgICAgICAgICBwb2x5Z29ucyA9IGZlYXR1cmUuZ2VvbWV0cnkuY29vcmRpbmF0ZXM7XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgIGVsc2UgaWYgKGZlYXR1cmUuZ2VvbWV0cnkudHlwZSA9PSAnTGluZVN0cmluZycpIHtcbiAgICAgICAgICAgICAgICAgICAgbGluZXMgPSBbZmVhdHVyZS5nZW9tZXRyeS5jb29yZGluYXRlc107XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgIGVsc2UgaWYgKGZlYXR1cmUuZ2VvbWV0cnkudHlwZSA9PSAnTXVsdGlMaW5lU3RyaW5nJykge1xuICAgICAgICAgICAgICAgICAgICBsaW5lcyA9IGZlYXR1cmUuZ2VvbWV0cnkuY29vcmRpbmF0ZXM7XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgIGVsc2UgaWYgKGZlYXR1cmUuZ2VvbWV0cnkudHlwZSA9PSAnUG9pbnQnKSB7XG4gICAgICAgICAgICAgICAgICAgIHBvaW50cyA9IFtmZWF0dXJlLmdlb21ldHJ5LmNvb3JkaW5hdGVzXTtcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgZWxzZSBpZiAoZmVhdHVyZS5nZW9tZXRyeS50eXBlID09ICdNdWx0aVBvaW50Jykge1xuICAgICAgICAgICAgICAgICAgICBwb2ludHMgPSBmZWF0dXJlLmdlb21ldHJ5LmNvb3JkaW5hdGVzO1xuICAgICAgICAgICAgICAgIH1cblxuICAgICAgICAgICAgICAgIC8vIEZpcnN0IGZlYXR1cmUgaW4gdGhpcyByZW5kZXIgbW9kZT9cbiAgICAgICAgICAgICAgICBtb2RlID0gc3R5bGUubW9kZS5uYW1lO1xuICAgICAgICAgICAgICAgIGlmICh2ZXJ0ZXhfZGF0YVttb2RlXSA9PSBudWxsKSB7XG4gICAgICAgICAgICAgICAgICAgIHZlcnRleF9kYXRhW21vZGVdID0gW107XG4gICAgICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICAgICAgaWYgKHBvbHlnb25zICE9IG51bGwpIHtcbiAgICAgICAgICAgICAgICAgICAgbW9kZXNbbW9kZV0uYnVpbGRQb2x5Z29ucyhwb2x5Z29ucywgc3R5bGUsIHZlcnRleF9kYXRhW21vZGVdKTtcbiAgICAgICAgICAgICAgICB9XG5cbiAgICAgICAgICAgICAgICBpZiAobGluZXMgIT0gbnVsbCkge1xuICAgICAgICAgICAgICAgICAgICBtb2Rlc1ttb2RlXS5idWlsZExpbmVzKGxpbmVzLCBzdHlsZSwgdmVydGV4X2RhdGFbbW9kZV0pO1xuICAgICAgICAgICAgICAgIH1cblxuICAgICAgICAgICAgICAgIGlmIChwb2ludHMgIT0gbnVsbCkge1xuICAgICAgICAgICAgICAgICAgICBtb2Rlc1ttb2RlXS5idWlsZFBvaW50cyhwb2ludHMsIHN0eWxlLCB2ZXJ0ZXhfZGF0YVttb2RlXSk7XG4gICAgICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICAgICAgdGlsZS5kZWJ1Zy5mZWF0dXJlcysrO1xuICAgICAgICAgICAgfVxuICAgICAgICB9XG4gICAgfVxuXG4gICAgdGlsZS52ZXJ0ZXhfZGF0YSA9IHt9O1xuICAgIGZvciAodmFyIHMgaW4gdmVydGV4X2RhdGEpIHtcbiAgICAgICAgdGlsZS52ZXJ0ZXhfZGF0YVtzXSA9IG5ldyBGbG9hdDMyQXJyYXkodmVydGV4X2RhdGFbc10pO1xuICAgIH1cblxuICAgIHJldHVybiB7XG4gICAgICAgIHZlcnRleF9kYXRhOiB0cnVlXG4gICAgfTtcbn07XG5cbi8vIENhbGxlZCBvbiBtYWluIHRocmVhZCB3aGVuIGEgd2ViIHdvcmtlciBjb21wbGV0ZXMgcHJvY2Vzc2luZyBmb3IgYSBzaW5nbGUgdGlsZSAoaW5pdGlhbCBsb2FkLCBvciByZWJ1aWxkKVxuU2NlbmUucHJvdG90eXBlLndvcmtlckJ1aWxkVGlsZUNvbXBsZXRlZCA9IGZ1bmN0aW9uIChldmVudCkge1xuICAgIGlmIChldmVudC5kYXRhLnR5cGUgIT0gJ2J1aWxkVGlsZUNvbXBsZXRlZCcpIHtcbiAgICAgICAgcmV0dXJuO1xuICAgIH1cblxuICAgIC8vIFRyYWNrIHNlbGVjdGlvbiBtYXAgc2l6ZSAoZm9yIHN0YXRzL2RlYnVnKSAtIHVwZGF0ZSBwZXIgd29ya2VyIGFuZCBzdW0gYWNyb3NzIHdvcmtlcnNcbiAgICB0aGlzLnNlbGVjdGlvbl9tYXBfd29ya2VyX3NpemVbZXZlbnQuZGF0YS53b3JrZXJfaWRdID0gZXZlbnQuZGF0YS5zZWxlY3Rpb25fbWFwX3NpemU7XG4gICAgdGhpcy5zZWxlY3Rpb25fbWFwX3NpemUgPSAwO1xuICAgIE9iamVjdFxuICAgICAgICAua2V5cyh0aGlzLnNlbGVjdGlvbl9tYXBfd29ya2VyX3NpemUpXG4gICAgICAgIC5mb3JFYWNoKHdvcmtlciA9PiB7XG4gICAgICAgICAgICB0aGlzLnNlbGVjdGlvbl9tYXBfc2l6ZSArPSB0aGlzLnNlbGVjdGlvbl9tYXBfd29ya2VyX3NpemVbd29ya2VyXTtcbiAgICAgICAgfSk7XG4gICAgY29uc29sZS5sb2coXCJzZWxlY3Rpb24gbWFwOiBcIiArIHRoaXMuc2VsZWN0aW9uX21hcF9zaXplICsgXCIgZmVhdHVyZXNcIik7XG5cbiAgICB2YXIgdGlsZSA9IGV2ZW50LmRhdGEudGlsZTtcblxuICAgIC8vIFJlbW92ZWQgdGhpcyB0aWxlIGR1cmluZyBsb2FkP1xuICAgIGlmICh0aGlzLnRpbGVzW3RpbGUua2V5XSA9PSBudWxsKSB7XG4gICAgICAgIGNvbnNvbGUubG9nKFwiZGlzY2FyZGVkIHRpbGUgXCIgKyB0aWxlLmtleSArIFwiIGluIFNjZW5lLnRpbGVXb3JrZXJDb21wbGV0ZWQgYmVjYXVzZSBwcmV2aW91c2x5IHJlbW92ZWRcIik7XG4gICAgICAgIHJldHVybjtcbiAgICB9XG5cbiAgICAvLyBVcGRhdGUgdGlsZSB3aXRoIHByb3BlcnRpZXMgZnJvbSB3b3JrZXJcbiAgICB0aWxlID0gdGhpcy5tZXJnZVRpbGUodGlsZS5rZXksIHRpbGUpO1xuXG4gICAgdGhpcy5idWlsZEdMR2VvbWV0cnkodGlsZSk7XG5cbiAgICB0aGlzLmRpcnR5ID0gdHJ1ZTtcbiAgICB0aGlzLnRyYWNrVGlsZVNldExvYWRFbmQoKTtcbiAgICB0aGlzLnByaW50RGVidWdGb3JUaWxlKHRpbGUpO1xufTtcblxuLy8gQ2FsbGVkIG9uIG1haW4gdGhyZWFkIHdoZW4gYSB3ZWIgd29ya2VyIGNvbXBsZXRlcyBwcm9jZXNzaW5nIGZvciBhIHNpbmdsZSB0aWxlXG5TY2VuZS5wcm90b3R5cGUuYnVpbGRHTEdlb21ldHJ5ID0gZnVuY3Rpb24gKHRpbGUpIHtcbiAgICB2YXIgdmVydGV4X2RhdGEgPSB0aWxlLnZlcnRleF9kYXRhO1xuXG4gICAgLy8gQ2xlYW51cCBleGlzdGluZyBHTCBnZW9tZXRyeSBvYmplY3RzXG4gICAgdGhpcy5mcmVlVGlsZVJlc291cmNlcyh0aWxlKTtcbiAgICB0aWxlLmdsX2dlb21ldHJ5ID0ge307XG5cbiAgICAvLyBDcmVhdGUgR0wgZ2VvbWV0cnkgb2JqZWN0c1xuICAgIGZvciAodmFyIHMgaW4gdmVydGV4X2RhdGEpIHtcbiAgICAgICAgdGlsZS5nbF9nZW9tZXRyeVtzXSA9IHRoaXMubW9kZXNbc10ubWFrZUdMR2VvbWV0cnkodmVydGV4X2RhdGFbc10pO1xuICAgIH1cblxuICAgIHRpbGUuZGVidWcuZ2VvbWV0cmllcyA9IDA7XG4gICAgdGlsZS5kZWJ1Zy5idWZmZXJfc2l6ZSA9IDA7XG4gICAgZm9yICh2YXIgcCBpbiB0aWxlLmdsX2dlb21ldHJ5KSB7XG4gICAgICAgIHRpbGUuZGVidWcuZ2VvbWV0cmllcyArPSB0aWxlLmdsX2dlb21ldHJ5W3BdLmdlb21ldHJ5X2NvdW50O1xuICAgICAgICB0aWxlLmRlYnVnLmJ1ZmZlcl9zaXplICs9IHRpbGUuZ2xfZ2VvbWV0cnlbcF0udmVydGV4X2RhdGEuYnl0ZUxlbmd0aDtcbiAgICB9XG4gICAgdGlsZS5kZWJ1Zy5nZW9tX3JhdGlvID0gKHRpbGUuZGVidWcuZ2VvbWV0cmllcyAvIHRpbGUuZGVidWcuZmVhdHVyZXMpLnRvRml4ZWQoMSk7XG5cbiAgICBkZWxldGUgdGlsZS52ZXJ0ZXhfZGF0YTsgLy8gVE9ETzogbWlnaHQgd2FudCB0byBwcmVzZXJ2ZSB0aGlzIGZvciByZWJ1aWxkaW5nIGdlb21ldHJpZXMgd2hlbiBzdHlsZXMvZXRjLiBjaGFuZ2U/XG59O1xuXG5TY2VuZS5wcm90b3R5cGUucmVtb3ZlVGlsZSA9IGZ1bmN0aW9uIChrZXkpXG57XG4gICAgaWYgKCF0aGlzLmluaXRpYWxpemVkKSB7XG4gICAgICAgIHJldHVybjtcbiAgICB9XG5cbiAgICBjb25zb2xlLmxvZyhcInRpbGUgdW5sb2FkIGZvciBcIiArIGtleSk7XG5cbiAgICBpZiAodGhpcy56b29taW5nID09IHRydWUpIHtcbiAgICAgICAgcmV0dXJuOyAvLyBzaG9ydCBjaXJjdWl0IHRpbGUgcmVtb3ZhbCwgd2lsbCBzd2VlcCBvdXQgdGlsZXMgYnkgem9vbSBsZXZlbCB3aGVuIHpvb20gZW5kc1xuICAgIH1cblxuICAgIHZhciB0aWxlID0gdGhpcy50aWxlc1trZXldO1xuXG4gICAgaWYgKHRpbGUgIT0gbnVsbCkge1xuICAgICAgICB0aGlzLmZyZWVUaWxlUmVzb3VyY2VzKHRpbGUpO1xuXG4gICAgICAgIC8vIFdlYiB3b3JrZXIgd2lsbCBjYW5jZWwgWEhSIHJlcXVlc3RzXG4gICAgICAgIHRoaXMud29ya2VyUG9zdE1lc3NhZ2VGb3JUaWxlKHRpbGUsIHtcbiAgICAgICAgICAgIHR5cGU6ICdyZW1vdmVUaWxlJyxcbiAgICAgICAgICAgIGtleTogdGlsZS5rZXlcbiAgICAgICAgfSk7XG4gICAgfVxuXG4gICAgZGVsZXRlIHRoaXMudGlsZXNba2V5XTtcbiAgICB0aGlzLmRpcnR5ID0gdHJ1ZTtcbn07XG5cbi8vIEZyZWUgYW55IEdMIC8gb3duZWQgcmVzb3VyY2VzXG5TY2VuZS5wcm90b3R5cGUuZnJlZVRpbGVSZXNvdXJjZXMgPSBmdW5jdGlvbiAodGlsZSlcbntcbiAgICBpZiAodGlsZSAhPSBudWxsICYmIHRpbGUuZ2xfZ2VvbWV0cnkgIT0gbnVsbCkge1xuICAgICAgICBmb3IgKHZhciBwIGluIHRpbGUuZ2xfZ2VvbWV0cnkpIHtcbiAgICAgICAgICAgIHRpbGUuZ2xfZ2VvbWV0cnlbcF0uZGVzdHJveSgpO1xuICAgICAgICB9XG4gICAgICAgIHRpbGUuZ2xfZ2VvbWV0cnkgPSBudWxsO1xuICAgIH1cbn07XG5cbi8vIEF0dGFjaGVzIHRyYWNraW5nIGFuZCBkZWJ1ZyBpbnRvIHRvIHRoZSBwcm92aWRlZCB0aWxlIERPTSBlbGVtZW50XG5TY2VuZS5wcm90b3R5cGUudXBkYXRlVGlsZUVsZW1lbnQgPSBmdW5jdGlvbiAodGlsZSwgZGl2KSB7XG4gICAgLy8gRGVidWcgaW5mb1xuICAgIGRpdi5zZXRBdHRyaWJ1dGUoJ2RhdGEtdGlsZS1rZXknLCB0aWxlLmtleSk7XG4gICAgZGl2LnN0eWxlLndpZHRoID0gJzI1NnB4JztcbiAgICBkaXYuc3R5bGUuaGVpZ2h0ID0gJzI1NnB4JztcblxuICAgIGlmICh0aGlzLmRlYnVnKSB7XG4gICAgICAgIHZhciBkZWJ1Z19vdmVybGF5ID0gZG9jdW1lbnQuY3JlYXRlRWxlbWVudCgnZGl2Jyk7XG4gICAgICAgIGRlYnVnX292ZXJsYXkudGV4dENvbnRlbnQgPSB0aWxlLmtleTtcbiAgICAgICAgZGVidWdfb3ZlcmxheS5zdHlsZS5wb3NpdGlvbiA9ICdhYnNvbHV0ZSc7XG4gICAgICAgIGRlYnVnX292ZXJsYXkuc3R5bGUubGVmdCA9IDA7XG4gICAgICAgIGRlYnVnX292ZXJsYXkuc3R5bGUudG9wID0gMDtcbiAgICAgICAgZGVidWdfb3ZlcmxheS5zdHlsZS5jb2xvciA9ICd3aGl0ZSc7XG4gICAgICAgIGRlYnVnX292ZXJsYXkuc3R5bGUuZm9udFNpemUgPSAnMTZweCc7XG4gICAgICAgIC8vIGRlYnVnX292ZXJsYXkuc3R5bGUudGV4dE91dGxpbmUgPSAnMXB4ICMwMDAwMDAnO1xuICAgICAgICBkaXYuYXBwZW5kQ2hpbGQoZGVidWdfb3ZlcmxheSk7XG5cbiAgICAgICAgZGl2LnN0eWxlLmJvcmRlclN0eWxlID0gJ3NvbGlkJztcbiAgICAgICAgZGl2LnN0eWxlLmJvcmRlckNvbG9yID0gJ3doaXRlJztcbiAgICAgICAgZGl2LnN0eWxlLmJvcmRlcldpZHRoID0gJzFweCc7XG4gICAgfVxufTtcblxuLy8gTWVyZ2UgcHJvcGVydGllcyBmcm9tIGEgcHJvdmlkZWQgdGlsZSBvYmplY3QgaW50byB0aGUgbWFpbiB0aWxlIHN0b3JlLiBTaGFsbG93IG1lcmdlIChqdXN0IGNvcGllcyB0b3AtbGV2ZWwgcHJvcGVydGllcykhXG4vLyBVc2VkIGZvciBzZWxlY3RpdmVseSB1cGRhdGluZyBwcm9wZXJ0aWVzIG9mIHRpbGVzIHBhc3NlZCBiZXR3ZWVuIG1haW4gdGhyZWFkIGFuZCB3b3JrZXJcbi8vIChzbyB3ZSBkb24ndCBoYXZlIHRvIHBhc3MgdGhlIHdob2xlIHRpbGUsIGluY2x1ZGluZyBzb21lIHByb3BlcnRpZXMgd2hpY2ggY2Fubm90IGJlIGNsb25lZCBmb3IgYSB3b3JrZXIpLlxuU2NlbmUucHJvdG90eXBlLm1lcmdlVGlsZSA9IGZ1bmN0aW9uIChrZXksIHNvdXJjZV90aWxlKSB7XG4gICAgdmFyIHRpbGUgPSB0aGlzLnRpbGVzW2tleV07XG5cbiAgICBpZiAodGlsZSA9PSBudWxsKSB7XG4gICAgICAgIHRoaXMudGlsZXNba2V5XSA9IHNvdXJjZV90aWxlO1xuICAgICAgICByZXR1cm4gdGhpcy50aWxlc1trZXldO1xuICAgIH1cblxuICAgIGZvciAodmFyIHAgaW4gc291cmNlX3RpbGUpIHtcbiAgICAgICAgLy8gY29uc29sZS5sb2coXCJtZXJnaW5nIFwiICsgcCArIFwiOiBcIiArIHNvdXJjZV90aWxlW3BdKTtcbiAgICAgICAgdGlsZVtwXSA9IHNvdXJjZV90aWxlW3BdO1xuICAgIH1cblxuICAgIHJldHVybiB0aWxlO1xufTtcblxuLy8gTG9hZCAob3IgcmVsb2FkKSB0aGUgc2NlbmUgY29uZmlnXG5TY2VuZS5wcm90b3R5cGUubG9hZFNjZW5lID0gZnVuY3Rpb24gKGNhbGxiYWNrKSB7XG4gICAgdmFyIHF1ZXVlID0gUXVldWUoKTtcblxuICAgIC8vIElmIHRoaXMgaXMgdGhlIGZpcnN0IHRpbWUgd2UncmUgbG9hZGluZyB0aGUgc2NlbmUsIGNvcHkgYW55IFVSTHNcbiAgICBpZiAoIXRoaXMubGF5ZXJfc291cmNlICYmIHR5cGVvZih0aGlzLmxheWVycykgPT0gJ3N0cmluZycpIHtcbiAgICAgICAgdGhpcy5sYXllcl9zb3VyY2UgPSBVdGlscy51cmxGb3JQYXRoKHRoaXMubGF5ZXJzKTtcbiAgICB9XG5cbiAgICBpZiAoIXRoaXMuc3R5bGVfc291cmNlICYmIHR5cGVvZih0aGlzLnN0eWxlcykgPT0gJ3N0cmluZycpIHtcbiAgICAgICAgdGhpcy5zdHlsZV9zb3VyY2UgPSBVdGlscy51cmxGb3JQYXRoKHRoaXMuc3R5bGVzKTtcbiAgICB9XG5cbiAgICAvLyBMYXllciBieSBVUkxcbiAgICBpZiAodGhpcy5sYXllcl9zb3VyY2UpIHtcbiAgICAgICAgcXVldWUuZGVmZXIoY29tcGxldGUgPT4ge1xuICAgICAgICAgICAgU2NlbmUubG9hZExheWVycyhcbiAgICAgICAgICAgICAgICB0aGlzLmxheWVyX3NvdXJjZSxcbiAgICAgICAgICAgICAgICBsYXllcnMgPT4ge1xuICAgICAgICAgICAgICAgICAgICB0aGlzLmxheWVycyA9IGxheWVycztcbiAgICAgICAgICAgICAgICAgICAgdGhpcy5sYXllcnNfc2VyaWFsaXplZCA9IFV0aWxzLnNlcmlhbGl6ZVdpdGhGdW5jdGlvbnModGhpcy5sYXllcnMpO1xuICAgICAgICAgICAgICAgICAgICBjb21wbGV0ZSgpO1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICk7XG4gICAgICAgIH0pO1xuICAgIH1cblxuICAgIC8vIFN0eWxlIGJ5IFVSTFxuICAgIGlmICh0aGlzLnN0eWxlX3NvdXJjZSkge1xuICAgICAgICBxdWV1ZS5kZWZlcihjb21wbGV0ZSA9PiB7XG4gICAgICAgICAgICBTY2VuZS5sb2FkU3R5bGVzKFxuICAgICAgICAgICAgICAgIHRoaXMuc3R5bGVfc291cmNlLFxuICAgICAgICAgICAgICAgIHN0eWxlcyA9PiB7XG4gICAgICAgICAgICAgICAgICAgIHRoaXMuc3R5bGVzID0gc3R5bGVzO1xuICAgICAgICAgICAgICAgICAgICB0aGlzLnN0eWxlc19zZXJpYWxpemVkID0gVXRpbHMuc2VyaWFsaXplV2l0aEZ1bmN0aW9ucyh0aGlzLnN0eWxlcyk7XG4gICAgICAgICAgICAgICAgICAgIGNvbXBsZXRlKCk7XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgKTtcbiAgICAgICAgfSk7XG4gICAgfVxuICAgIC8vIFN0eWxlIG9iamVjdFxuICAgIGVsc2Uge1xuICAgICAgICB0aGlzLnN0eWxlcyA9IFNjZW5lLnBvc3RQcm9jZXNzU3R5bGVzKHRoaXMuc3R5bGVzKTtcbiAgICB9XG5cbiAgICAvLyBFdmVyeXRoaW5nIGlzIGxvYWRlZFxuICAgIHF1ZXVlLmF3YWl0KGZ1bmN0aW9uKCkge1xuICAgICAgICBpZiAodHlwZW9mIGNhbGxiYWNrID09ICdmdW5jdGlvbicpIHtcbiAgICAgICAgICAgIGNhbGxiYWNrKCk7XG4gICAgICAgIH1cbiAgICB9KTtcbn07XG5cbi8vIFJlbG9hZCBzY2VuZSBjb25maWcgYW5kIHJlYnVpbGQgdGlsZXNcblNjZW5lLnByb3RvdHlwZS5yZWxvYWRTY2VuZSA9IGZ1bmN0aW9uICgpIHtcbiAgICBpZiAoIXRoaXMuaW5pdGlhbGl6ZWQpIHtcbiAgICAgICAgcmV0dXJuO1xuICAgIH1cblxuICAgIHRoaXMubG9hZFNjZW5lKCgpID0+IHtcbiAgICAgICAgdGhpcy5yZWJ1aWxkVGlsZXMoKTtcbiAgICB9KTtcbn07XG5cbi8vIENhbGxlZCAoY3VycmVudGx5IG1hbnVhbGx5KSBhZnRlciBtb2RlcyBhcmUgdXBkYXRlZCBpbiBzdHlsZXNoZWV0XG5TY2VuZS5wcm90b3R5cGUucmVmcmVzaE1vZGVzID0gZnVuY3Rpb24gKCkge1xuICAgIGlmICghdGhpcy5pbml0aWFsaXplZCkge1xuICAgICAgICByZXR1cm47XG4gICAgfVxuXG4gICAgdGhpcy5tb2RlcyA9IFNjZW5lLnJlZnJlc2hNb2Rlcyh0aGlzLm1vZGVzLCB0aGlzLnN0eWxlcyk7XG59O1xuXG5TY2VuZS5wcm90b3R5cGUudXBkYXRlQWN0aXZlTW9kZXMgPSBmdW5jdGlvbiAoKSB7XG4gICAgLy8gTWFrZSBhIHNldCBvZiBjdXJyZW50bHkgYWN0aXZlIG1vZGVzICh1c2VkIGluIGEgbGF5ZXIpXG4gICAgdGhpcy5hY3RpdmVfbW9kZXMgPSB7fTtcbiAgICB2YXIgYW5pbWF0ZWQgPSBmYWxzZTsgLy8gaXMgYW55IGFjdGl2ZSBtb2RlIGFuaW1hdGVkP1xuICAgIGZvciAodmFyIGwgaW4gdGhpcy5zdHlsZXMubGF5ZXJzKSB7XG4gICAgICAgIHZhciBtb2RlID0gdGhpcy5zdHlsZXMubGF5ZXJzW2xdLm1vZGUubmFtZTtcbiAgICAgICAgaWYgKHRoaXMuc3R5bGVzLmxheWVyc1tsXS52aXNpYmxlICE9PSBmYWxzZSkge1xuICAgICAgICAgICAgdGhpcy5hY3RpdmVfbW9kZXNbbW9kZV0gPSB0cnVlO1xuXG4gICAgICAgICAgICAvLyBDaGVjayBpZiB0aGlzIG1vZGUgaXMgYW5pbWF0ZWRcbiAgICAgICAgICAgIGlmIChhbmltYXRlZCA9PSBmYWxzZSAmJiB0aGlzLm1vZGVzW21vZGVdLmFuaW1hdGVkID09IHRydWUpIHtcbiAgICAgICAgICAgICAgICBhbmltYXRlZCA9IHRydWU7XG4gICAgICAgICAgICB9XG4gICAgICAgIH1cbiAgICB9XG4gICAgdGhpcy5hbmltYXRlZCA9IGFuaW1hdGVkO1xufTtcblxuLy8gUmVzZXQgaW50ZXJuYWwgY2xvY2ssIG1vc3RseSB1c2VmdWwgZm9yIGNvbnNpc3RlbnQgZXhwZXJpZW5jZSB3aGVuIGNoYW5naW5nIG1vZGVzL2RlYnVnZ2luZ1xuU2NlbmUucHJvdG90eXBlLnJlc2V0VGltZSA9IGZ1bmN0aW9uICgpIHtcbiAgICB0aGlzLnN0YXJ0X3RpbWUgPSArbmV3IERhdGUoKTtcbn07XG5cbi8vIFVzZXIgaW5wdXRcbi8vIFRPRE86IHJlc3RvcmUgZnJhY3Rpb25hbCB6b29tIHN1cHBvcnQgb25jZSBsZWFmbGV0IGFuaW1hdGlvbiByZWZhY3RvciBwdWxsIHJlcXVlc3QgaXMgbWVyZ2VkXG5cblNjZW5lLnByb3RvdHlwZS5pbml0SW5wdXRIYW5kbGVycyA9IGZ1bmN0aW9uICgpIHtcbiAgICAvLyB0aGlzLmtleSA9IG51bGw7XG5cbiAgICAvLyBkb2N1bWVudC5hZGRFdmVudExpc3RlbmVyKCdrZXlkb3duJywgZnVuY3Rpb24gKGV2ZW50KSB7XG4gICAgLy8gICAgIGlmIChldmVudC5rZXlDb2RlID09IDM3KSB7XG4gICAgLy8gICAgICAgICB0aGlzLmtleSA9ICdsZWZ0JztcbiAgICAvLyAgICAgfVxuICAgIC8vICAgICBlbHNlIGlmIChldmVudC5rZXlDb2RlID09IDM5KSB7XG4gICAgLy8gICAgICAgICB0aGlzLmtleSA9ICdyaWdodCc7XG4gICAgLy8gICAgIH1cbiAgICAvLyAgICAgZWxzZSBpZiAoZXZlbnQua2V5Q29kZSA9PSAzOCkge1xuICAgIC8vICAgICAgICAgdGhpcy5rZXkgPSAndXAnO1xuICAgIC8vICAgICB9XG4gICAgLy8gICAgIGVsc2UgaWYgKGV2ZW50LmtleUNvZGUgPT0gNDApIHtcbiAgICAvLyAgICAgICAgIHRoaXMua2V5ID0gJ2Rvd24nO1xuICAgIC8vICAgICB9XG4gICAgLy8gICAgIGVsc2UgaWYgKGV2ZW50LmtleUNvZGUgPT0gODMpIHsgLy8gc1xuICAgIC8vICAgICAgICAgY29uc29sZS5sb2coXCJyZWxvYWRpbmcgc2hhZGVyc1wiKTtcbiAgICAvLyAgICAgICAgIGZvciAodmFyIG1vZGUgaW4gdGhpcy5tb2Rlcykge1xuICAgIC8vICAgICAgICAgICAgIHRoaXMubW9kZXNbbW9kZV0uZ2xfcHJvZ3JhbS5jb21waWxlKCk7XG4gICAgLy8gICAgICAgICB9XG4gICAgLy8gICAgICAgICB0aGlzLmRpcnR5ID0gdHJ1ZTtcbiAgICAvLyAgICAgfVxuICAgIC8vIH0uYmluZCh0aGlzKSk7XG5cbiAgICAvLyBkb2N1bWVudC5hZGRFdmVudExpc3RlbmVyKCdrZXl1cCcsIGZ1bmN0aW9uIChldmVudCkge1xuICAgIC8vICAgICB0aGlzLmtleSA9IG51bGw7XG4gICAgLy8gfS5iaW5kKHRoaXMpKTtcbn07XG5cblNjZW5lLnByb3RvdHlwZS5pbnB1dCA9IGZ1bmN0aW9uICgpIHtcbiAgICAvLyAvLyBGcmFjdGlvbmFsIHpvb20gc2NhbGluZ1xuICAgIC8vIGlmICh0aGlzLmtleSA9PSAndXAnKSB7XG4gICAgLy8gICAgIHRoaXMuc2V0Wm9vbSh0aGlzLnpvb20gKyB0aGlzLnpvb21fc3RlcCk7XG4gICAgLy8gfVxuICAgIC8vIGVsc2UgaWYgKHRoaXMua2V5ID09ICdkb3duJykge1xuICAgIC8vICAgICB0aGlzLnNldFpvb20odGhpcy56b29tIC0gdGhpcy56b29tX3N0ZXApO1xuICAgIC8vIH1cbn07XG5cblxuLy8gU3RhdHMvZGVidWcvcHJvZmlsaW5nIG1ldGhvZHNcblxuLy8gUHJvZmlsaW5nIG1ldGhvZHMgdXNlZCB0byB0cmFjayB3aGVuIHNldHMgb2YgdGlsZXMgc3RhcnQvc3RvcCBsb2FkaW5nIHRvZ2V0aGVyXG4vLyBlLmcuIGluaXRpYWwgcGFnZSBsb2FkIGlzIG9uZSBzZXQgb2YgdGlsZXMsIG5ldyBzZXRzIG9mIHRpbGUgbG9hZHMgYXJlIHRoZW4gaW5pdGlhdGVkIGJ5IGEgbWFwIHBhbiBvciB6b29tXG5TY2VuZS5wcm90b3R5cGUudHJhY2tUaWxlU2V0TG9hZFN0YXJ0ID0gZnVuY3Rpb24gKCkge1xuICAgIC8vIFN0YXJ0IHRyYWNraW5nIG5ldyB0aWxlIHNldCBpZiBubyBvdGhlciB0aWxlcyBhbHJlYWR5IGxvYWRpbmdcbiAgICBpZiAodGhpcy50aWxlX3NldF9sb2FkaW5nID09IG51bGwpIHtcbiAgICAgICAgdGhpcy50aWxlX3NldF9sb2FkaW5nID0gK25ldyBEYXRlKCk7XG4gICAgICAgIGNvbnNvbGUubG9nKFwidGlsZSBzZXQgbG9hZCBTVEFSVFwiKTtcbiAgICB9XG59O1xuXG5TY2VuZS5wcm90b3R5cGUudHJhY2tUaWxlU2V0TG9hZEVuZCA9IGZ1bmN0aW9uICgpIHtcbiAgICAvLyBObyBtb3JlIHRpbGVzIGFjdGl2ZWx5IGxvYWRpbmc/XG4gICAgaWYgKHRoaXMudGlsZV9zZXRfbG9hZGluZyAhPSBudWxsKSB7XG4gICAgICAgIHZhciBlbmRfdGlsZV9zZXQgPSB0cnVlO1xuICAgICAgICBmb3IgKHZhciB0IGluIHRoaXMudGlsZXMpIHtcbiAgICAgICAgICAgIGlmICh0aGlzLnRpbGVzW3RdLmxvYWRpbmcgPT0gdHJ1ZSkge1xuICAgICAgICAgICAgICAgIGVuZF90aWxlX3NldCA9IGZhbHNlO1xuICAgICAgICAgICAgICAgIGJyZWFrO1xuICAgICAgICAgICAgfVxuICAgICAgICB9XG5cbiAgICAgICAgaWYgKGVuZF90aWxlX3NldCA9PSB0cnVlKSB7XG4gICAgICAgICAgICB0aGlzLmxhc3RfdGlsZV9zZXRfbG9hZCA9ICgrbmV3IERhdGUoKSkgLSB0aGlzLnRpbGVfc2V0X2xvYWRpbmc7XG4gICAgICAgICAgICB0aGlzLnRpbGVfc2V0X2xvYWRpbmcgPSBudWxsO1xuICAgICAgICAgICAgY29uc29sZS5sb2coXCJ0aWxlIHNldCBsb2FkIEZJTklTSEVEIGluOiBcIiArIHRoaXMubGFzdF90aWxlX3NldF9sb2FkKTtcbiAgICAgICAgfVxuICAgIH1cbn07XG5cblNjZW5lLnByb3RvdHlwZS5wcmludERlYnVnRm9yVGlsZSA9IGZ1bmN0aW9uICh0aWxlKSB7XG4gICAgY29uc29sZS5sb2coXG4gICAgICAgIFwiZGVidWcgZm9yIFwiICsgdGlsZS5rZXkgKyAnOiBbICcgK1xuICAgICAgICBPYmplY3Qua2V5cyh0aWxlLmRlYnVnKS5tYXAoZnVuY3Rpb24gKHQpIHsgcmV0dXJuIHQgKyAnOiAnICsgdGlsZS5kZWJ1Z1t0XTsgfSkuam9pbignLCAnKSArICcgXSdcbiAgICApO1xufTtcblxuLy8gUmVjb21waWxlIGFsbCBzaGFkZXJzXG5TY2VuZS5wcm90b3R5cGUuY29tcGlsZVNoYWRlcnMgPSBmdW5jdGlvbiAoKSB7XG4gICAgZm9yICh2YXIgbSBpbiB0aGlzLm1vZGVzKSB7XG4gICAgICAgIHRoaXMubW9kZXNbbV0uZ2xfcHJvZ3JhbS5jb21waWxlKCk7XG4gICAgfVxufTtcblxuLy8gU3VtIG9mIGEgZGVidWcgcHJvcGVydHkgYWNyb3NzIHRpbGVzXG5TY2VuZS5wcm90b3R5cGUuZ2V0RGVidWdTdW0gPSBmdW5jdGlvbiAocHJvcCwgZmlsdGVyKSB7XG4gICAgdmFyIHN1bSA9IDA7XG4gICAgZm9yICh2YXIgdCBpbiB0aGlzLnRpbGVzKSB7XG4gICAgICAgIGlmICh0aGlzLnRpbGVzW3RdLmRlYnVnW3Byb3BdICE9IG51bGwgJiYgKHR5cGVvZiBmaWx0ZXIgIT0gJ2Z1bmN0aW9uJyB8fCBmaWx0ZXIodGhpcy50aWxlc1t0XSkgPT0gdHJ1ZSkpIHtcbiAgICAgICAgICAgIHN1bSArPSB0aGlzLnRpbGVzW3RdLmRlYnVnW3Byb3BdO1xuICAgICAgICB9XG4gICAgfVxuICAgIHJldHVybiBzdW07XG59O1xuXG4vLyBBdmVyYWdlIG9mIGEgZGVidWcgcHJvcGVydHkgYWNyb3NzIHRpbGVzXG5TY2VuZS5wcm90b3R5cGUuZ2V0RGVidWdBdmVyYWdlID0gZnVuY3Rpb24gKHByb3AsIGZpbHRlcikge1xuICAgIHJldHVybiB0aGlzLmdldERlYnVnU3VtKHByb3AsIGZpbHRlcikgLyBPYmplY3Qua2V5cyh0aGlzLnRpbGVzKS5sZW5ndGg7XG59O1xuXG4vLyBMb2cgbWVzc2FnZXMgcGFzcyB0aHJvdWdoIGZyb20gd2ViIHdvcmtlcnNcblNjZW5lLnByb3RvdHlwZS53b3JrZXJMb2dNZXNzYWdlID0gZnVuY3Rpb24gKGV2ZW50KSB7XG4gICAgaWYgKGV2ZW50LmRhdGEudHlwZSAhPSAnbG9nJykge1xuICAgICAgICByZXR1cm47XG4gICAgfVxuXG4gICAgY29uc29sZS5sb2coXCJ3b3JrZXIgXCIgKyBldmVudC5kYXRhLndvcmtlcl9pZCArIFwiOiBcIiArIGV2ZW50LmRhdGEubXNnKTtcbn07XG5cblxuLyoqKiBDbGFzcyBtZXRob2RzIChzdGF0ZWxlc3MpICoqKi9cblxuU2NlbmUubG9hZExheWVycyA9IGZ1bmN0aW9uICh1cmwsIGNhbGxiYWNrKSB7XG4gICAgdmFyIGxheWVycztcbiAgICB2YXIgcmVxID0gbmV3IFhNTEh0dHBSZXF1ZXN0KCk7XG4gICAgcmVxLm9ubG9hZCA9IGZ1bmN0aW9uICgpIHtcbiAgICAgICAgZXZhbCgnbGF5ZXJzID0gJyArIHJlcS5yZXNwb25zZSk7IC8vIFRPRE86IHNlY3VyaXR5IVxuXG4gICAgICAgIGlmICh0eXBlb2YgY2FsbGJhY2sgPT0gJ2Z1bmN0aW9uJykge1xuICAgICAgICAgICAgY2FsbGJhY2sobGF5ZXJzKTtcbiAgICAgICAgfVxuICAgIH07XG4gICAgcmVxLm9wZW4oJ0dFVCcsIHVybCArICc/JyArICgrbmV3IERhdGUoKSksIHRydWUgLyogYXN5bmMgZmxhZyAqLyk7XG4gICAgcmVxLnJlc3BvbnNlVHlwZSA9ICd0ZXh0JztcbiAgICByZXEuc2VuZCgpO1xufTtcblxuU2NlbmUubG9hZFN0eWxlcyA9IGZ1bmN0aW9uICh1cmwsIGNhbGxiYWNrKSB7XG4gICAgdmFyIHN0eWxlcztcbiAgICB2YXIgcmVxID0gbmV3IFhNTEh0dHBSZXF1ZXN0KCk7XG5cbiAgICByZXEub25sb2FkID0gZnVuY3Rpb24gKCkge1xuICAgICAgICBzdHlsZXMgPSByZXEucmVzcG9uc2U7XG5cbiAgICAgICAgLy8gVHJ5IEpTT04gZmlyc3QsIHRoZW4gWUFNTCAoaWYgYXZhaWxhYmxlKVxuICAgICAgICB0cnkge1xuICAgICAgICAgICAgZXZhbCgnc3R5bGVzID0gJyArIHJlcS5yZXNwb25zZSk7XG4gICAgICAgIH1cbiAgICAgICAgY2F0Y2ggKGUpIHtcbiAgICAgICAgICAgIHRyeSB7XG4gICAgICAgICAgICAgICAgc3R5bGVzID0geWFtbC5zYWZlTG9hZChyZXEucmVzcG9uc2UpO1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgY2F0Y2ggKGUpIHtcbiAgICAgICAgICAgICAgICBjb25zb2xlLmxvZyhcImZhaWxlZCB0byBwYXJzZSBzdHlsZXMhXCIpO1xuICAgICAgICAgICAgICAgIGNvbnNvbGUubG9nKHN0eWxlcyk7XG4gICAgICAgICAgICAgICAgc3R5bGVzID0gbnVsbDtcbiAgICAgICAgICAgIH1cbiAgICAgICAgfVxuXG4gICAgICAgIC8vIEZpbmQgZ2VuZXJpYyBmdW5jdGlvbnMgJiBzdHlsZSBtYWNyb3NcbiAgICAgICAgVXRpbHMuc3RyaW5nc1RvRnVuY3Rpb25zKHN0eWxlcyk7XG4gICAgICAgIFN0eWxlLmV4cGFuZE1hY3JvcyhzdHlsZXMpO1xuICAgICAgICBTY2VuZS5wb3N0UHJvY2Vzc1N0eWxlcyhzdHlsZXMpO1xuXG4gICAgICAgIGlmICh0eXBlb2YgY2FsbGJhY2sgPT0gJ2Z1bmN0aW9uJykge1xuICAgICAgICAgICAgY2FsbGJhY2soc3R5bGVzKTtcbiAgICAgICAgfVxuICAgIH1cblxuICAgIHJlcS5vcGVuKCdHRVQnLCB1cmwgKyAnPycgKyAoK25ldyBEYXRlKCkpLCB0cnVlIC8qIGFzeW5jIGZsYWcgKi8pO1xuICAgIHJlcS5yZXNwb25zZVR5cGUgPSAndGV4dCc7XG4gICAgcmVxLnNlbmQoKTtcbn07XG5cbi8vIE5vcm1hbGl6ZSBzb21lIHN0eWxlIHNldHRpbmdzIHRoYXQgbWF5IG5vdCBoYXZlIGJlZW4gZXhwbGljaXRseSBzcGVjaWZpZWQgaW4gdGhlIHN0eWxlc2hlZXRcblNjZW5lLnBvc3RQcm9jZXNzU3R5bGVzID0gZnVuY3Rpb24gKHN0eWxlcykge1xuICAgIC8vIFBvc3QtcHJvY2VzcyBzdHlsZXNcbiAgICBmb3IgKHZhciBtIGluIHN0eWxlcy5sYXllcnMpIHtcbiAgICAgICAgaWYgKHN0eWxlcy5sYXllcnNbbV0udmlzaWJsZSAhPT0gZmFsc2UpIHtcbiAgICAgICAgICAgIHN0eWxlcy5sYXllcnNbbV0udmlzaWJsZSA9IHRydWU7XG4gICAgICAgIH1cblxuICAgICAgICBpZiAoKHN0eWxlcy5sYXllcnNbbV0ubW9kZSAmJiBzdHlsZXMubGF5ZXJzW21dLm1vZGUubmFtZSkgPT0gbnVsbCkge1xuICAgICAgICAgICAgc3R5bGVzLmxheWVyc1ttXS5tb2RlID0ge307XG4gICAgICAgICAgICBmb3IgKHZhciBwIGluIFN0eWxlLmRlZmF1bHRzLm1vZGUpIHtcbiAgICAgICAgICAgICAgICBzdHlsZXMubGF5ZXJzW21dLm1vZGVbcF0gPSBTdHlsZS5kZWZhdWx0cy5tb2RlW3BdO1xuICAgICAgICAgICAgfVxuICAgICAgICB9XG4gICAgfVxuXG4gICAgc3R5bGVzLmNhbWVyYSA9IHN0eWxlcy5jYW1lcmEgfHwge307IC8vIGVuc3VyZSBjYW1lcmEgb2JqZWN0XG5cbiAgICByZXR1cm4gc3R5bGVzO1xufTtcblxuLy8gUHJvY2Vzc2VzIHRoZSB0aWxlIHJlc3BvbnNlIHRvIGNyZWF0ZSBsYXllcnMgYXMgZGVmaW5lZCBieSB0aGUgc2NlbmVcbi8vIENhbiBpbmNsdWRlIHBvc3QtcHJvY2Vzc2luZyB0byBwYXJ0aWFsbHkgZmlsdGVyIG9yIHJlLWFycmFuZ2UgZGF0YSwgZS5nLiBvbmx5IGluY2x1ZGluZyBQT0lzIHRoYXQgaGF2ZSBuYW1lc1xuU2NlbmUucHJvY2Vzc0xheWVyc0ZvclRpbGUgPSBmdW5jdGlvbiAobGF5ZXJzLCB0aWxlKSB7XG4gICAgdmFyIHRpbGVfbGF5ZXJzID0ge307XG4gICAgZm9yICh2YXIgdD0wOyB0IDwgbGF5ZXJzLmxlbmd0aDsgdCsrKSB7XG4gICAgICAgIGxheWVyc1t0XS5udW1iZXIgPSB0O1xuXG4gICAgICAgIGlmIChsYXllcnNbdF0gIT0gbnVsbCkge1xuICAgICAgICAgICAgLy8gSnVzdCBwYXNzIHRocm91Z2ggZGF0YSB1bnRvdWNoZWQgaWYgbm8gZGF0YSB0cmFuc2Zvcm0gZnVuY3Rpb24gZGVmaW5lZFxuICAgICAgICAgICAgaWYgKGxheWVyc1t0XS5kYXRhID09IG51bGwpIHtcbiAgICAgICAgICAgICAgICB0aWxlX2xheWVyc1tsYXllcnNbdF0ubmFtZV0gPSB0aWxlLmxheWVyc1tsYXllcnNbdF0ubmFtZV07XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICAvLyBQYXNzIHRocm91Z2ggZGF0YSBidXQgd2l0aCBkaWZmZXJlbnQgbGF5ZXIgbmFtZSBpbiB0aWxlIHNvdXJjZSBkYXRhXG4gICAgICAgICAgICBlbHNlIGlmICh0eXBlb2YgbGF5ZXJzW3RdLmRhdGEgPT0gJ3N0cmluZycpIHtcbiAgICAgICAgICAgICAgICB0aWxlX2xheWVyc1tsYXllcnNbdF0ubmFtZV0gPSB0aWxlLmxheWVyc1tsYXllcnNbdF0uZGF0YV07XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICAvLyBBcHBseSB0aGUgdHJhbnNmb3JtIGZ1bmN0aW9uIGZvciBwb3N0LXByb2Nlc3NpbmdcbiAgICAgICAgICAgIGVsc2UgaWYgKHR5cGVvZiBsYXllcnNbdF0uZGF0YSA9PSAnZnVuY3Rpb24nKSB7XG4gICAgICAgICAgICAgICAgdGlsZV9sYXllcnNbbGF5ZXJzW3RdLm5hbWVdID0gbGF5ZXJzW3RdLmRhdGEodGlsZS5sYXllcnMpO1xuICAgICAgICAgICAgfVxuICAgICAgICB9XG5cbiAgICAgICAgLy8gSGFuZGxlIGNhc2VzIHdoZXJlIG5vIGRhdGEgd2FzIGZvdW5kIGluIHRpbGUgb3IgcmV0dXJuZWQgYnkgcG9zdC1wcm9jZXNzb3JcbiAgICAgICAgdGlsZV9sYXllcnNbbGF5ZXJzW3RdLm5hbWVdID0gdGlsZV9sYXllcnNbbGF5ZXJzW3RdLm5hbWVdIHx8IHsgdHlwZTogJ0ZlYXR1cmVDb2xsZWN0aW9uJywgZmVhdHVyZXM6IFtdIH07XG4gICAgfVxuICAgIHRpbGUubGF5ZXJzID0gdGlsZV9sYXllcnM7XG4gICAgcmV0dXJuIHRpbGVfbGF5ZXJzO1xufTtcblxuLy8gQ2FsbGVkIG9uY2Ugb24gaW5zdGFudGlhdGlvblxuU2NlbmUuY3JlYXRlTW9kZXMgPSBmdW5jdGlvbiAoc3R5bGVzKSB7XG4gICAgdmFyIG1vZGVzID0ge307XG5cbiAgICAvLyBCdWlsdC1pbiBtb2Rlc1xuICAgIHZhciBidWlsdF9pbnMgPSByZXF1aXJlKCcuL2dsL2dsX21vZGVzJykuTW9kZXM7XG4gICAgZm9yICh2YXIgbSBpbiBidWlsdF9pbnMpIHtcbiAgICAgICAgbW9kZXNbbV0gPSBidWlsdF9pbnNbbV07XG4gICAgfVxuXG4gICAgLy8gU3R5bGVzaGVldCBtb2Rlc1xuICAgIGZvciAodmFyIG0gaW4gc3R5bGVzLm1vZGVzKSB7XG4gICAgICAgIC8vIGlmIChtICE9ICdhbGwnKSB7XG4gICAgICAgICAgICBtb2Rlc1ttXSA9IE1vZGVNYW5hZ2VyLmNvbmZpZ3VyZU1vZGUobSwgc3R5bGVzLm1vZGVzW21dKTtcbiAgICAgICAgLy8gfVxuICAgIH1cblxuICAgIHJldHVybiBtb2Rlcztcbn07XG5cblNjZW5lLnJlZnJlc2hNb2RlcyA9IGZ1bmN0aW9uIChtb2Rlcywgc3R5bGVzKSB7XG4gICAgLy8gQ29weSBzdHlsZXNoZWV0IG1vZGVzXG4gICAgLy8gVE9ETzogaXMgdGhpcyB0aGUgYmVzdCB3YXkgdG8gY29weSBzdHlsZXNoZWV0IGNoYW5nZXMgdG8gbW9kZSBpbnN0YW5jZXM/XG4gICAgZm9yICh2YXIgbSBpbiBzdHlsZXMubW9kZXMpIHtcbiAgICAgICAgLy8gaWYgKG0gIT0gJ2FsbCcpIHtcbiAgICAgICAgICAgIG1vZGVzW21dID0gTW9kZU1hbmFnZXIuY29uZmlndXJlTW9kZShtLCBzdHlsZXMubW9kZXNbbV0pO1xuICAgICAgICAvLyB9XG4gICAgfVxuXG4gICAgLy8gUmVmcmVzaCBhbGwgbW9kZXNcbiAgICBmb3IgKG0gaW4gbW9kZXMpIHtcbiAgICAgICAgbW9kZXNbbV0ucmVmcmVzaCgpO1xuICAgIH1cblxuICAgIHJldHVybiBtb2Rlcztcbn07XG5cblxuLy8gUHJpdmF0ZS9pbnRlcm5hbFxuXG4vLyBHZXQgYmFzZSBVUkwgZnJvbSB3aGljaCB0aGUgbGlicmFyeSB3YXMgbG9hZGVkXG4vLyBVc2VkIHRvIGxvYWQgYWRkaXRpb25hbCByZXNvdXJjZXMgbGlrZSBzaGFkZXJzLCB0ZXh0dXJlcywgZXRjLiBpbiBjYXNlcyB3aGVyZSBsaWJyYXJ5IHdhcyBsb2FkZWQgZnJvbSBhIHJlbGF0aXZlIHBhdGhcbmZ1bmN0aW9uIGZpbmRCYXNlTGlicmFyeVVSTCAoKSB7XG4gICAgU2NlbmUubGlicmFyeV9iYXNlX3VybCA9ICcnO1xuICAgIHZhciBzY3JpcHRzID0gZG9jdW1lbnQuZ2V0RWxlbWVudHNCeVRhZ05hbWUoJ3NjcmlwdCcpOyAvLyBkb2N1bWVudC5xdWVyeVNlbGVjdG9yQWxsKCdzY3JpcHRbc3JjKj1cIi5qc1wiXScpO1xuICAgIGZvciAodmFyIHM9MDsgcyA8IHNjcmlwdHMubGVuZ3RoOyBzKyspIHtcbiAgICAgICAgdmFyIG1hdGNoID0gc2NyaXB0c1tzXS5zcmMuaW5kZXhPZigndGFuZ3JhbS5kZWJ1Zy5qcycpO1xuICAgICAgICBpZiAobWF0Y2ggPT0gLTEpIHtcbiAgICAgICAgICAgIG1hdGNoID0gc2NyaXB0c1tzXS5zcmMuaW5kZXhPZigndGFuZ3JhbS5taW4uanMnKTtcbiAgICAgICAgfVxuICAgICAgICBpZiAobWF0Y2ggPj0gMCkge1xuICAgICAgICAgICAgU2NlbmUubGlicmFyeV9iYXNlX3VybCA9IHNjcmlwdHNbc10uc3JjLnN1YnN0cigwLCBtYXRjaCk7XG4gICAgICAgICAgICBicmVhaztcbiAgICAgICAgfVxuICAgIH1cbn07XG4iLCIvKioqIFN0eWxlIGhlbHBlcnMgKioqL1xuaW1wb3J0IHtHZW99IGZyb20gJy4vZ2VvJztcblxuZXhwb3J0IHZhciBTdHlsZSA9IHt9O1xuXG4vLyBTdHlsZSBoZWxwZXJzXG5cblN0eWxlLmNvbG9yID0ge1xuICAgIHBzZXVkb1JhbmRvbUdyYXlzY2FsZTogZnVuY3Rpb24gKGYpIHsgdmFyIGMgPSBNYXRoLm1heCgocGFyc2VJbnQoZi5pZCwgMTYpICUgMTAwKSAvIDEwMCwgMC40KTsgcmV0dXJuIFswLjcgKiBjLCAwLjcgKiBjLCAwLjcgKiBjXTsgfSwgLy8gcHNldWRvLXJhbmRvbSBncmF5c2NhbGUgYnkgZ2VvbWV0cnkgaWRcbiAgICBwc2V1ZG9SYW5kb21Db2xvcjogZnVuY3Rpb24gKGYpIHsgcmV0dXJuIFswLjcgKiAocGFyc2VJbnQoZi5pZCwgMTYpIC8gMTAwICUgMSksIDAuNyAqIChwYXJzZUludChmLmlkLCAxNikgLyAxMDAwMCAlIDEpLCAwLjcgKiAocGFyc2VJbnQoZi5pZCwgMTYpIC8gMTAwMDAwMCAlIDEpXTsgfSwgLy8gcHNldWRvLXJhbmRvbSBjb2xvciBieSBnZW9tZXRyeSBpZFxuICAgIHJhbmRvbUNvbG9yOiBmdW5jdGlvbiAoZikgeyByZXR1cm4gWzAuNyAqIE1hdGgucmFuZG9tKCksIDAuNyAqIE1hdGgucmFuZG9tKCksIDAuNyAqIE1hdGgucmFuZG9tKCldOyB9IC8vIHJhbmRvbSBjb2xvclxufTtcblxuLy8gUmV0dXJucyBhIGZ1bmN0aW9uICh0aGF0IGNhbiBiZSB1c2VkIGFzIGEgZHluYW1pYyBzdHlsZSkgdGhhdCBjb252ZXJ0cyBwaXhlbHMgdG8gbWV0ZXJzIGZvciB0aGUgY3VycmVudCB6b29tIGxldmVsLlxuLy8gVGhlIHByb3ZpZGVkIHBpeGVsIHZhbHVlICgncCcpIGNhbiBpdHNlbGYgYmUgYSBmdW5jdGlvbiwgaW4gd2hpY2ggY2FzZSBpdCBpcyB3cmFwcGVkIGJ5IHRoaXMgb25lLlxuU3R5bGUucGl4ZWxzID0gZnVuY3Rpb24gKHAsIHopIHtcbiAgICB2YXIgZjtcbiAgICBldmFsKCdmID0gZnVuY3Rpb24oZiwgdCwgaCkgeyByZXR1cm4gJyArICh0eXBlb2YgcCA9PSAnZnVuY3Rpb24nID8gJygnICsgKHAudG9TdHJpbmcoKSArICcoZiwgdCwgaCkpJykgOiBwKSArICcgKiBoLkdlby5tZXRlcnNfcGVyX3BpeGVsW2guem9vbV07IH0nKTtcbiAgICByZXR1cm4gZjtcbn07XG5cbi8vIENyZWF0ZSBhIHVuaXF1ZSAzMi1iaXQgY29sb3IgdG8gaWRlbnRpZnkgYSBmZWF0dXJlXG4vLyBXb3JrZXJzIGluZGVwZW5kZW50bHkgY3JlYXRlL21vZGlmeSBzZWxlY3Rpb24gY29sb3JzIGluIHRoZWlyIG93biB0aHJlYWRzLCBidXQgd2UgYWxzb1xuLy8gbmVlZCB0aGUgbWFpbiB0aHJlYWQgdG8ga25vdyB3aGVyZSBlYWNoIGZlYXR1cmUgY29sb3Igb3JpZ2luYXRlZC4gVG8gYWNjb21wbGlzaCB0aGlzLFxuLy8gd2UgcGFydGl0aW9uIHRoZSBtYXAgYnkgc2V0dGluZyB0aGUgNHRoIGNvbXBvbmVudCAoYWxwaGEgY2hhbm5lbCkgdG8gdGhlIHdvcmtlcidzIGlkLlxuU3R5bGUuc2VsZWN0aW9uX21hcCA9IHt9OyAvLyB0aGlzIHdpbGwgYmUgdW5pcXVlIHBlciBtb2R1bGUgaW5zdGFuY2UgKHNvIHVuaXF1ZSBwZXIgd29ya2VyKVxuU3R5bGUuc2VsZWN0aW9uX21hcF9jdXJyZW50ID0gMTsgLy8gc3RhcnQgYXQgMSBzaW5jZSAxIHdpbGwgYmUgZGl2aWRlZCBieSB0aGlzXG5TdHlsZS5zZWxlY3Rpb25fbWFwX3ByZWZpeCA9IDA7IC8vIHNldCBieSB3b3JrZXIgdG8gd29ya2VyIGlkICNcblN0eWxlLmdlbmVyYXRlU2VsZWN0aW9uID0gZnVuY3Rpb24gKGNvbG9yX21hcClcbntcbiAgICAvLyAzMi1iaXQgY29sb3Iga2V5XG4gICAgU3R5bGUuc2VsZWN0aW9uX21hcF9jdXJyZW50Kys7XG4gICAgdmFyIGlyID0gU3R5bGUuc2VsZWN0aW9uX21hcF9jdXJyZW50ICYgMjU1O1xuICAgIHZhciBpZyA9IChTdHlsZS5zZWxlY3Rpb25fbWFwX2N1cnJlbnQgPj4gOCkgJiAyNTU7XG4gICAgdmFyIGliID0gKFN0eWxlLnNlbGVjdGlvbl9tYXBfY3VycmVudCA+PiAxNikgJiAyNTU7XG4gICAgdmFyIGlhID0gU3R5bGUuc2VsZWN0aW9uX21hcF9wcmVmaXg7XG4gICAgdmFyIHIgPSBpciAvIDI1NTtcbiAgICB2YXIgZyA9IGlnIC8gMjU1O1xuICAgIHZhciBiID0gaWIgLyAyNTU7XG4gICAgdmFyIGEgPSBpYSAvIDI1NTtcbiAgICB2YXIga2V5ID0gKGlyICsgKGlnIDw8IDgpICsgKGliIDw8IDE2KSArIChpYSA8PCAyNCkpID4+PiAwOyAvLyBuZWVkIHVuc2lnbmVkIHJpZ2h0IHNoaWZ0IHRvIGNvbnZlcnQgdG8gcG9zaXRpdmUgI1xuXG4gICAgY29sb3JfbWFwW2tleV0gPSB7XG4gICAgICAgIGNvbG9yOiBbciwgZywgYiwgYV0sXG4gICAgfTtcblxuICAgIHJldHVybiBjb2xvcl9tYXBba2V5XTtcbn07XG5cblN0eWxlLnJlc2V0U2VsZWN0aW9uTWFwID0gZnVuY3Rpb24gKClcbntcbiAgICBTdHlsZS5zZWxlY3Rpb25fbWFwID0ge307XG4gICAgU3R5bGUuc2VsZWN0aW9uX21hcF9jdXJyZW50ID0gMTtcbn07XG5cbi8vIEZpbmQgYW5kIGV4cGFuZCBzdHlsZSBtYWNyb3NcblN0eWxlLm1hY3JvcyA9IFtcbiAgICAnU3R5bGUuY29sb3IucHNldWRvUmFuZG9tQ29sb3InLFxuICAgICdTdHlsZS5waXhlbHMnXG5dO1xuXG5TdHlsZS5leHBhbmRNYWNyb3MgPSBmdW5jdGlvbiBleHBhbmRNYWNyb3MgKG9iaikge1xuICAgIGZvciAodmFyIHAgaW4gb2JqKSB7XG4gICAgICAgIHZhciB2YWwgPSBvYmpbcF07XG5cbiAgICAgICAgLy8gTG9vcCB0aHJvdWdoIG9iamVjdCBwcm9wZXJ0aWVzXG4gICAgICAgIGlmICh0eXBlb2YgdmFsID09ICdvYmplY3QnKSB7XG4gICAgICAgICAgICBvYmpbcF0gPSBleHBhbmRNYWNyb3ModmFsKTtcbiAgICAgICAgfVxuICAgICAgICAvLyBDb252ZXJ0IHN0cmluZ3MgYmFjayBpbnRvIGZ1bmN0aW9uc1xuICAgICAgICBlbHNlIGlmICh0eXBlb2YgdmFsID09ICdzdHJpbmcnKSB7XG4gICAgICAgICAgICBmb3IgKHZhciBtIGluIFN0eWxlLm1hY3Jvcykge1xuICAgICAgICAgICAgICAgIGlmICh2YWwubWF0Y2goU3R5bGUubWFjcm9zW21dKSkge1xuICAgICAgICAgICAgICAgICAgICB2YXIgZjtcbiAgICAgICAgICAgICAgICAgICAgdHJ5IHtcbiAgICAgICAgICAgICAgICAgICAgICAgIGV2YWwoJ2YgPSAnICsgdmFsKTtcbiAgICAgICAgICAgICAgICAgICAgICAgIG9ialtwXSA9IGY7XG4gICAgICAgICAgICAgICAgICAgICAgICBicmVhaztcbiAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgICAgICBjYXRjaCAoZSkge1xuICAgICAgICAgICAgICAgICAgICAgICAgLy8gZmFsbC1iYWNrIHRvIG9yaWdpbmFsIHZhbHVlIGlmIHBhcnNpbmcgZmFpbGVkXG4gICAgICAgICAgICAgICAgICAgICAgICBvYmpbcF0gPSB2YWw7XG4gICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICB9XG4gICAgICAgIH1cbiAgICB9XG5cbiAgICByZXR1cm4gb2JqO1xufTtcblxuXG4vLyBTdHlsZSBkZWZhdWx0c1xuXG4vLyBEZXRlcm1pbmUgZmluYWwgc3R5bGUgcHJvcGVydGllcyAoY29sb3IsIHdpZHRoLCBldGMuKVxuU3R5bGUuZGVmYXVsdHMgPSB7XG4gICAgY29sb3I6IFsxLjAsIDAsIDBdLFxuICAgIHdpZHRoOiAxLFxuICAgIHNpemU6IDEsXG4gICAgZXh0cnVkZTogZmFsc2UsXG4gICAgaGVpZ2h0OiAyMCxcbiAgICBtaW5faGVpZ2h0OiAwLFxuICAgIG91dGxpbmU6IHtcbiAgICAgICAgLy8gY29sb3I6IFsxLjAsIDAsIDBdLFxuICAgICAgICAvLyB3aWR0aDogMSxcbiAgICAgICAgLy8gZGFzaDogbnVsbFxuICAgIH0sXG4gICAgc2VsZWN0aW9uOiB7XG4gICAgICAgIGFjdGl2ZTogZmFsc2UsXG4gICAgICAgIGNvbG9yOiBbMCwgMCwgMCwgMV1cbiAgICB9LFxuICAgIG1vZGU6IHtcbiAgICAgICAgbmFtZTogJ3BvbHlnb25zJ1xuICAgIH1cbn07XG5cbi8vIFN0eWxlIHBhcnNpbmdcblxuLy8gSGVscGVyIGZ1bmN0aW9ucyBwYXNzZWQgdG8gZHluYW1pYyBzdHlsZSBmdW5jdGlvbnNcblN0eWxlLmhlbHBlcnMgPSB7XG4gICAgU3R5bGU6IFN0eWxlLFxuICAgIEdlbzogR2VvXG59O1xuXG5TdHlsZS5wYXJzZVN0eWxlRm9yRmVhdHVyZSA9IGZ1bmN0aW9uIChmZWF0dXJlLCBsYXllcl9uYW1lLCBsYXllcl9zdHlsZSwgdGlsZSlcbntcbiAgICB2YXIgbGF5ZXJfc3R5bGUgPSBsYXllcl9zdHlsZSB8fCB7fTtcbiAgICB2YXIgc3R5bGUgPSB7fTtcblxuICAgIFN0eWxlLmhlbHBlcnMuem9vbSA9IHRpbGUuY29vcmRzLno7XG5cbiAgICAvLyBUZXN0IHdoZXRoZXIgZmVhdHVyZXMgc2hvdWxkIGJlIHJlbmRlcmVkIGF0IGFsbFxuICAgIGlmICh0eXBlb2YgbGF5ZXJfc3R5bGUuZmlsdGVyID09ICdmdW5jdGlvbicpIHtcbiAgICAgICAgaWYgKGxheWVyX3N0eWxlLmZpbHRlcihmZWF0dXJlLCB0aWxlLCBTdHlsZS5oZWxwZXJzKSA9PSBmYWxzZSkge1xuICAgICAgICAgICAgcmV0dXJuIG51bGw7XG4gICAgICAgIH1cbiAgICB9XG5cbiAgICAvLyBQYXJzZSBzdHlsZXNcbiAgICBzdHlsZS5jb2xvciA9IChsYXllcl9zdHlsZS5jb2xvciAmJiAobGF5ZXJfc3R5bGUuY29sb3JbZmVhdHVyZS5wcm9wZXJ0aWVzLmtpbmRdIHx8IGxheWVyX3N0eWxlLmNvbG9yLmRlZmF1bHQpKSB8fCBTdHlsZS5kZWZhdWx0cy5jb2xvcjtcbiAgICBpZiAodHlwZW9mIHN0eWxlLmNvbG9yID09ICdmdW5jdGlvbicpIHtcbiAgICAgICAgc3R5bGUuY29sb3IgPSBzdHlsZS5jb2xvcihmZWF0dXJlLCB0aWxlLCBTdHlsZS5oZWxwZXJzKTtcbiAgICB9XG5cbiAgICBzdHlsZS53aWR0aCA9IChsYXllcl9zdHlsZS53aWR0aCAmJiAobGF5ZXJfc3R5bGUud2lkdGhbZmVhdHVyZS5wcm9wZXJ0aWVzLmtpbmRdIHx8IGxheWVyX3N0eWxlLndpZHRoLmRlZmF1bHQpKSB8fCBTdHlsZS5kZWZhdWx0cy53aWR0aDtcbiAgICBpZiAodHlwZW9mIHN0eWxlLndpZHRoID09ICdmdW5jdGlvbicpIHtcbiAgICAgICAgc3R5bGUud2lkdGggPSBzdHlsZS53aWR0aChmZWF0dXJlLCB0aWxlLCBTdHlsZS5oZWxwZXJzKTtcbiAgICB9XG4gICAgc3R5bGUud2lkdGggKj0gR2VvLnVuaXRzX3Blcl9tZXRlclt0aWxlLmNvb3Jkcy56XTtcblxuICAgIHN0eWxlLnNpemUgPSAobGF5ZXJfc3R5bGUuc2l6ZSAmJiAobGF5ZXJfc3R5bGUuc2l6ZVtmZWF0dXJlLnByb3BlcnRpZXMua2luZF0gfHwgbGF5ZXJfc3R5bGUuc2l6ZS5kZWZhdWx0KSkgfHwgU3R5bGUuZGVmYXVsdHMuc2l6ZTtcbiAgICBpZiAodHlwZW9mIHN0eWxlLnNpemUgPT0gJ2Z1bmN0aW9uJykge1xuICAgICAgICBzdHlsZS5zaXplID0gc3R5bGUuc2l6ZShmZWF0dXJlLCB0aWxlLCBTdHlsZS5oZWxwZXJzKTtcbiAgICB9XG4gICAgc3R5bGUuc2l6ZSAqPSBHZW8udW5pdHNfcGVyX21ldGVyW3RpbGUuY29vcmRzLnpdO1xuXG4gICAgc3R5bGUuZXh0cnVkZSA9IChsYXllcl9zdHlsZS5leHRydWRlICYmIChsYXllcl9zdHlsZS5leHRydWRlW2ZlYXR1cmUucHJvcGVydGllcy5raW5kXSB8fCBsYXllcl9zdHlsZS5leHRydWRlLmRlZmF1bHQpKSB8fCBTdHlsZS5kZWZhdWx0cy5leHRydWRlO1xuICAgIGlmICh0eXBlb2Ygc3R5bGUuZXh0cnVkZSA9PSAnZnVuY3Rpb24nKSB7XG4gICAgICAgIC8vIHJldHVybmluZyBhIGJvb2xlYW4gd2lsbCBleHRydWRlIHdpdGggdGhlIGZlYXR1cmUncyBoZWlnaHQsIGEgbnVtYmVyIHdpbGwgb3ZlcnJpZGUgdGhlIGZlYXR1cmUgaGVpZ2h0IChzZWUgYmVsb3cpXG4gICAgICAgIHN0eWxlLmV4dHJ1ZGUgPSBzdHlsZS5leHRydWRlKGZlYXR1cmUsIHRpbGUsIFN0eWxlLmhlbHBlcnMpO1xuICAgIH1cblxuICAgIHN0eWxlLmhlaWdodCA9IChmZWF0dXJlLnByb3BlcnRpZXMgJiYgZmVhdHVyZS5wcm9wZXJ0aWVzLmhlaWdodCkgfHwgU3R5bGUuZGVmYXVsdHMuaGVpZ2h0O1xuICAgIHN0eWxlLm1pbl9oZWlnaHQgPSAoZmVhdHVyZS5wcm9wZXJ0aWVzICYmIGZlYXR1cmUucHJvcGVydGllcy5taW5faGVpZ2h0KSB8fCBTdHlsZS5kZWZhdWx0cy5taW5faGVpZ2h0O1xuXG4gICAgLy8gaGVpZ2h0IGRlZmF1bHRzIHRvIGZlYXR1cmUgaGVpZ2h0LCBidXQgZXh0cnVkZSBzdHlsZSBjYW4gZHluYW1pY2FsbHkgYWRqdXN0IGhlaWdodCBieSByZXR1cm5pbmcgYSBudW1iZXIgb3IgYXJyYXkgKGluc3RlYWQgb2YgYSBib29sZWFuKVxuICAgIGlmIChzdHlsZS5leHRydWRlKSB7XG4gICAgICAgIGlmICh0eXBlb2Ygc3R5bGUuZXh0cnVkZSA9PSAnbnVtYmVyJykge1xuICAgICAgICAgICAgc3R5bGUuaGVpZ2h0ID0gc3R5bGUuZXh0cnVkZTtcbiAgICAgICAgfVxuICAgICAgICBlbHNlIGlmICh0eXBlb2Ygc3R5bGUuZXh0cnVkZSA9PSAnb2JqZWN0JyAmJiBzdHlsZS5leHRydWRlLmxlbmd0aCA+PSAyKSB7XG4gICAgICAgICAgICBzdHlsZS5taW5faGVpZ2h0ID0gc3R5bGUuZXh0cnVkZVswXTtcbiAgICAgICAgICAgIHN0eWxlLmhlaWdodCA9IHN0eWxlLmV4dHJ1ZGVbMV07XG4gICAgICAgIH1cbiAgICB9XG5cbiAgICBzdHlsZS56ID0gKGxheWVyX3N0eWxlLnogJiYgKGxheWVyX3N0eWxlLnpbZmVhdHVyZS5wcm9wZXJ0aWVzLmtpbmRdIHx8IGxheWVyX3N0eWxlLnouZGVmYXVsdCkpIHx8IFN0eWxlLmRlZmF1bHRzLnogfHwgMDtcbiAgICBpZiAodHlwZW9mIHN0eWxlLnogPT0gJ2Z1bmN0aW9uJykge1xuICAgICAgICBzdHlsZS56ID0gc3R5bGUueihmZWF0dXJlLCB0aWxlLCBTdHlsZS5oZWxwZXJzKTtcbiAgICB9XG5cbiAgICBzdHlsZS5vdXRsaW5lID0ge307XG4gICAgbGF5ZXJfc3R5bGUub3V0bGluZSA9IGxheWVyX3N0eWxlLm91dGxpbmUgfHwge307XG4gICAgc3R5bGUub3V0bGluZS5jb2xvciA9IChsYXllcl9zdHlsZS5vdXRsaW5lLmNvbG9yICYmIChsYXllcl9zdHlsZS5vdXRsaW5lLmNvbG9yW2ZlYXR1cmUucHJvcGVydGllcy5raW5kXSB8fCBsYXllcl9zdHlsZS5vdXRsaW5lLmNvbG9yLmRlZmF1bHQpKSB8fCBTdHlsZS5kZWZhdWx0cy5vdXRsaW5lLmNvbG9yO1xuICAgIGlmICh0eXBlb2Ygc3R5bGUub3V0bGluZS5jb2xvciA9PSAnZnVuY3Rpb24nKSB7XG4gICAgICAgIHN0eWxlLm91dGxpbmUuY29sb3IgPSBzdHlsZS5vdXRsaW5lLmNvbG9yKGZlYXR1cmUsIHRpbGUsIFN0eWxlLmhlbHBlcnMpO1xuICAgIH1cblxuICAgIHN0eWxlLm91dGxpbmUud2lkdGggPSAobGF5ZXJfc3R5bGUub3V0bGluZS53aWR0aCAmJiAobGF5ZXJfc3R5bGUub3V0bGluZS53aWR0aFtmZWF0dXJlLnByb3BlcnRpZXMua2luZF0gfHwgbGF5ZXJfc3R5bGUub3V0bGluZS53aWR0aC5kZWZhdWx0KSkgfHwgU3R5bGUuZGVmYXVsdHMub3V0bGluZS53aWR0aDtcbiAgICBpZiAodHlwZW9mIHN0eWxlLm91dGxpbmUud2lkdGggPT0gJ2Z1bmN0aW9uJykge1xuICAgICAgICBzdHlsZS5vdXRsaW5lLndpZHRoID0gc3R5bGUub3V0bGluZS53aWR0aChmZWF0dXJlLCB0aWxlLCBTdHlsZS5oZWxwZXJzKTtcbiAgICB9XG4gICAgc3R5bGUub3V0bGluZS53aWR0aCAqPSBHZW8udW5pdHNfcGVyX21ldGVyW3RpbGUuY29vcmRzLnpdO1xuXG4gICAgc3R5bGUub3V0bGluZS5kYXNoID0gKGxheWVyX3N0eWxlLm91dGxpbmUuZGFzaCAmJiAobGF5ZXJfc3R5bGUub3V0bGluZS5kYXNoW2ZlYXR1cmUucHJvcGVydGllcy5raW5kXSB8fCBsYXllcl9zdHlsZS5vdXRsaW5lLmRhc2guZGVmYXVsdCkpIHx8IFN0eWxlLmRlZmF1bHRzLm91dGxpbmUuZGFzaDtcbiAgICBpZiAodHlwZW9mIHN0eWxlLm91dGxpbmUuZGFzaCA9PSAnZnVuY3Rpb24nKSB7XG4gICAgICAgIHN0eWxlLm91dGxpbmUuZGFzaCA9IHN0eWxlLm91dGxpbmUuZGFzaChmZWF0dXJlLCB0aWxlLCBTdHlsZS5oZWxwZXJzKTtcbiAgICB9XG5cbiAgICAvLyBJbnRlcmFjdGl2aXR5IChzZWxlY3Rpb24gbWFwKVxuICAgIHZhciBpbnRlcmFjdGl2ZSA9IGZhbHNlO1xuICAgIGlmICh0eXBlb2YgbGF5ZXJfc3R5bGUuaW50ZXJhY3RpdmUgPT0gJ2Z1bmN0aW9uJykge1xuICAgICAgICBpbnRlcmFjdGl2ZSA9IGxheWVyX3N0eWxlLmludGVyYWN0aXZlKGZlYXR1cmUsIHRpbGUsIFN0eWxlLmhlbHBlcnMpO1xuICAgIH1cbiAgICBlbHNlIHtcbiAgICAgICAgaW50ZXJhY3RpdmUgPSBsYXllcl9zdHlsZS5pbnRlcmFjdGl2ZTtcbiAgICB9XG5cbiAgICBpZiAoaW50ZXJhY3RpdmUgPT0gdHJ1ZSkge1xuICAgICAgICB2YXIgc2VsZWN0b3IgPSBTdHlsZS5nZW5lcmF0ZVNlbGVjdGlvbihTdHlsZS5zZWxlY3Rpb25fbWFwKTtcblxuICAgICAgICBzZWxlY3Rvci5mZWF0dXJlID0ge1xuICAgICAgICAgICAgaWQ6IGZlYXR1cmUuaWQsXG4gICAgICAgICAgICBwcm9wZXJ0aWVzOiBmZWF0dXJlLnByb3BlcnRpZXNcbiAgICAgICAgfTtcbiAgICAgICAgc2VsZWN0b3IuZmVhdHVyZS5wcm9wZXJ0aWVzLmxheWVyID0gbGF5ZXJfbmFtZTsgLy8gYWRkIGxheWVyIG5hbWUgdG8gcHJvcGVydGllc1xuXG4gICAgICAgIHN0eWxlLnNlbGVjdGlvbiA9IHtcbiAgICAgICAgICAgIGFjdGl2ZTogdHJ1ZSxcbiAgICAgICAgICAgIGNvbG9yOiBzZWxlY3Rvci5jb2xvclxuICAgICAgICB9O1xuICAgIH1cbiAgICBlbHNlIHtcbiAgICAgICAgc3R5bGUuc2VsZWN0aW9uID0gU3R5bGUuZGVmYXVsdHMuc2VsZWN0aW9uO1xuICAgIH1cblxuICAgIGlmIChsYXllcl9zdHlsZS5tb2RlICE9IG51bGwgJiYgbGF5ZXJfc3R5bGUubW9kZS5uYW1lICE9IG51bGwpIHtcbiAgICAgICAgc3R5bGUubW9kZSA9IHt9O1xuICAgICAgICBmb3IgKHZhciBtIGluIGxheWVyX3N0eWxlLm1vZGUpIHtcbiAgICAgICAgICAgIHN0eWxlLm1vZGVbbV0gPSBsYXllcl9zdHlsZS5tb2RlW21dO1xuICAgICAgICB9XG4gICAgfVxuICAgIGVsc2Uge1xuICAgICAgICBzdHlsZS5tb2RlID0gU3R5bGUuZGVmYXVsdHMubW9kZTtcbiAgICB9XG5cbiAgICByZXR1cm4gc3R5bGU7XG59O1xuXG4iLCIvLyBNaXNjZWxsYW5lb3VzIHV0aWxpdGllc1xuXG4vLyBTaW1wbGlzdGljIGRldGVjdGlvbiBvZiByZWxhdGl2ZSBwYXRocywgYXBwZW5kIGJhc2UgaWYgbmVjZXNzYXJ5XG5leHBvcnQgZnVuY3Rpb24gdXJsRm9yUGF0aChwYXRoKSB7XG4gICAgaWYgKHBhdGggPT0gbnVsbCB8fCBwYXRoID09ICcnKSB7XG4gICAgICAgIHJldHVybiBudWxsO1xuICAgIH1cblxuICAgIC8vIENhbiBleHBhbmQgYSBzaW5nbGUgcGF0aCwgb3IgYW4gYXJyYXkgb2YgcGF0aHNcbiAgICBpZiAodHlwZW9mIHBhdGggPT0gJ29iamVjdCcgJiYgcGF0aC5sZW5ndGggPiAwKSB7XG4gICAgICAgIC8vIEFycmF5IG9mIHBhdGhzXG4gICAgICAgIGZvciAodmFyIHAgaW4gcGF0aCkge1xuICAgICAgICAgICAgdmFyIHByb3RvY29sID0gcGF0aFtwXS50b0xvd2VyQ2FzZSgpLnN1YnN0cigwLCA0KTtcbiAgICAgICAgICAgIGlmICghKHByb3RvY29sID09ICdodHRwJyB8fCBwcm90b2NvbCA9PSAnZmlsZScpKSB7XG4gICAgICAgICAgICAgICAgcGF0aFtwXSA9IHdpbmRvdy5sb2NhdGlvbi5vcmlnaW4gKyB3aW5kb3cubG9jYXRpb24ucGF0aG5hbWUgKyBwYXRoW3BdO1xuICAgICAgICAgICAgfVxuICAgICAgICB9XG4gICAgfVxuICAgIGVsc2Uge1xuICAgICAgICAvLyBTaW5nbGUgcGF0aFxuICAgICAgICB2YXIgcHJvdG9jb2wgPSBwYXRoLnRvTG93ZXJDYXNlKCkuc3Vic3RyKDAsIDQpO1xuICAgICAgICBpZiAoIShwcm90b2NvbCA9PSAnaHR0cCcgfHwgcHJvdG9jb2wgPT0gJ2ZpbGUnKSkge1xuICAgICAgICAgICAgcGF0aCA9IHdpbmRvdy5sb2NhdGlvbi5vcmlnaW4gKyB3aW5kb3cubG9jYXRpb24ucGF0aG5hbWUgKyBwYXRoO1xuICAgICAgICB9XG4gICAgfVxuICAgIHJldHVybiBwYXRoO1xufTtcblxuLy8gU3RyaW5naWZ5IGFuIG9iamVjdCBpbnRvIEpTT04sIGJ1dCBjb252ZXJ0IGZ1bmN0aW9ucyB0byBzdHJpbmdzXG5leHBvcnQgZnVuY3Rpb24gc2VyaWFsaXplV2l0aEZ1bmN0aW9ucyhvYmopIHtcbiAgICB2YXIgc2VyaWFsaXplZCA9IEpTT04uc3RyaW5naWZ5KG9iaiwgZnVuY3Rpb24oaywgdikge1xuICAgICAgICAvLyBDb252ZXJ0IGZ1bmN0aW9ucyB0byBzdHJpbmdzXG4gICAgICAgIGlmICh0eXBlb2YgdiA9PSAnZnVuY3Rpb24nKSB7XG4gICAgICAgICAgICByZXR1cm4gdi50b1N0cmluZygpO1xuICAgICAgICB9XG4gICAgICAgIHJldHVybiB2O1xuICAgIH0pO1xuXG4gICAgcmV0dXJuIHNlcmlhbGl6ZWQ7XG59O1xuXG4vLyBQYXJzZSBhIEpTT04gc3RyaW5nLCBidXQgY29udmVydCBmdW5jdGlvbi1saWtlIHN0cmluZ3MgYmFjayBpbnRvIGZ1bmN0aW9uc1xuZXhwb3J0IGZ1bmN0aW9uIGRlc2VyaWFsaXplV2l0aEZ1bmN0aW9ucyhzZXJpYWxpemVkKSB7XG4gICAgdmFyIG9iaiA9IEpTT04ucGFyc2Uoc2VyaWFsaXplZCk7XG4gICAgb2JqID0gc3RyaW5nc1RvRnVuY3Rpb25zKG9iaik7XG5cbiAgICByZXR1cm4gb2JqO1xufTtcblxuLy8gUmVjdXJzaXZlbHkgcGFyc2UgYW4gb2JqZWN0LCBhdHRlbXB0aW5nIHRvIGNvbnZlcnQgc3RyaW5nIHByb3BlcnRpZXMgdGhhdCBsb29rIGxpa2UgZnVuY3Rpb25zIGJhY2sgaW50byBmdW5jdGlvbnNcbmV4cG9ydCBmdW5jdGlvbiBzdHJpbmdzVG9GdW5jdGlvbnMob2JqKSB7XG4gICAgZm9yICh2YXIgcCBpbiBvYmopIHtcbiAgICAgICAgdmFyIHZhbCA9IG9ialtwXTtcblxuICAgICAgICAvLyBMb29wIHRocm91Z2ggb2JqZWN0IHByb3BlcnRpZXNcbiAgICAgICAgaWYgKHR5cGVvZiB2YWwgPT0gJ29iamVjdCcpIHtcbiAgICAgICAgICAgIG9ialtwXSA9IHN0cmluZ3NUb0Z1bmN0aW9ucyh2YWwpO1xuICAgICAgICB9XG4gICAgICAgIC8vIENvbnZlcnQgc3RyaW5ncyBiYWNrIGludG8gZnVuY3Rpb25zXG4gICAgICAgIGVsc2UgaWYgKHR5cGVvZiB2YWwgPT0gJ3N0cmluZycgJiYgdmFsLm1hdGNoKC9eZnVuY3Rpb24uKlxcKC4qXFwpLykgIT0gbnVsbCkge1xuICAgICAgICAgICAgdmFyIGY7XG4gICAgICAgICAgICB0cnkge1xuICAgICAgICAgICAgICAgIGV2YWwoJ2YgPSAnICsgdmFsKTtcbiAgICAgICAgICAgICAgICBvYmpbcF0gPSBmO1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgY2F0Y2ggKGUpIHtcbiAgICAgICAgICAgICAgICAvLyBmYWxsLWJhY2sgdG8gb3JpZ2luYWwgdmFsdWUgaWYgcGFyc2luZyBmYWlsZWRcbiAgICAgICAgICAgICAgICBvYmpbcF0gPSB2YWw7XG4gICAgICAgICAgICB9XG4gICAgICAgIH1cbiAgICB9XG5cbiAgICByZXR1cm4gb2JqO1xufTtcblxuLy8gUnVuIGEgYmxvY2sgaWYgb24gdGhlIG1haW4gdGhyZWFkIChub3QgaW4gYSB3ZWIgd29ya2VyKSwgd2l0aCBvcHRpb25hbCBlcnJvciAod2ViIHdvcmtlcikgYmxvY2tcbmV4cG9ydCBmdW5jdGlvbiBydW5JZkluTWFpblRocmVhZChibG9jaywgZXJyKSB7XG4gICAgdHJ5IHtcbiAgICAgICAgaWYgKHdpbmRvdy5kb2N1bWVudCAhPT0gdW5kZWZpbmVkKSB7XG4gICAgICAgICAgICBibG9jaygpO1xuICAgICAgICB9XG4gICAgfVxuICAgIGNhdGNoIChlKSB7XG4gICAgICAgIGlmICh0eXBlb2YgZXJyID09ICdmdW5jdGlvbicpIHtcbiAgICAgICAgICAgIGVycigpO1xuICAgICAgICB9XG4gICAgfVxufVxuXG4vLyBVc2VkIGZvciBkaWZmZXJlbnRpYXRpbmcgYmV0d2VlbiBwb3dlci1vZi0yIGFuZCBub24tcG93ZXItb2YtMiB0ZXh0dXJlc1xuLy8gVmlhOiBodHRwOi8vc3RhY2tvdmVyZmxvdy5jb20vcXVlc3Rpb25zLzE5NzIyMjQ3L3dlYmdsLXdhaXQtZm9yLXRleHR1cmUtdG8tbG9hZFxuZXhwb3J0IGZ1bmN0aW9uIGlzUG93ZXJPZjIodmFsdWUpIHtcbiAgICByZXR1cm4gKHZhbHVlICYgKHZhbHVlIC0gMSkpID09IDA7XG59XG4iLCIvKioqIFZlY3RvciBmdW5jdGlvbnMgLSB2ZWN0b3JzIHByb3ZpZGVkIGFzIFt4LCB5LCB6XSBhcnJheXMgKioqL1xuXG5leHBvcnQgdmFyIFZlY3RvciA9IHt9O1xuXG4vLyBWZWN0b3IgbGVuZ3RoIHNxdWFyZWRcblZlY3Rvci5sZW5ndGhTcSA9IGZ1bmN0aW9uICh2KVxue1xuICAgIGlmICh2Lmxlbmd0aCA9PSAyKSB7XG4gICAgICAgIHJldHVybiAodlswXSp2WzBdICsgdlsxXSp2WzFdKTtcbiAgICB9XG4gICAgZWxzZSB7XG4gICAgICAgIHJldHVybiAodlswXSp2WzBdICsgdlsxXSp2WzFdICsgdlsyXSp2WzJdKTtcbiAgICB9XG59O1xuXG4vLyBWZWN0b3IgbGVuZ3RoXG5WZWN0b3IubGVuZ3RoID0gZnVuY3Rpb24gKHYpXG57XG4gICAgcmV0dXJuIE1hdGguc3FydChWZWN0b3IubGVuZ3RoU3EodikpO1xufTtcblxuLy8gTm9ybWFsaXplIGEgdmVjdG9yXG5WZWN0b3Iubm9ybWFsaXplID0gZnVuY3Rpb24gKHYpXG57XG4gICAgdmFyIGQ7XG4gICAgaWYgKHYubGVuZ3RoID09IDIpIHtcbiAgICAgICAgZCA9IHZbMF0qdlswXSArIHZbMV0qdlsxXTtcbiAgICAgICAgZCA9IE1hdGguc3FydChkKTtcblxuICAgICAgICBpZiAoZCAhPSAwKSB7XG4gICAgICAgICAgICByZXR1cm4gW3ZbMF0gLyBkLCB2WzFdIC8gZF07XG4gICAgICAgIH1cbiAgICAgICAgcmV0dXJuIFswLCAwXTtcbiAgICB9XG4gICAgZWxzZSB7XG4gICAgICAgIHZhciBkID0gdlswXSp2WzBdICsgdlsxXSp2WzFdICsgdlsyXSp2WzJdO1xuICAgICAgICBkID0gTWF0aC5zcXJ0KGQpO1xuXG4gICAgICAgIGlmIChkICE9IDApIHtcbiAgICAgICAgICAgIHJldHVybiBbdlswXSAvIGQsIHZbMV0gLyBkLCB2WzJdIC8gZF07XG4gICAgICAgIH1cbiAgICAgICAgcmV0dXJuIFswLCAwLCAwXTtcbiAgICB9XG59O1xuXG4vLyBDcm9zcyBwcm9kdWN0IG9mIHR3byB2ZWN0b3JzXG5WZWN0b3IuY3Jvc3MgID0gZnVuY3Rpb24gKHYxLCB2MilcbntcbiAgICByZXR1cm4gW1xuICAgICAgICAodjFbMV0gKiB2MlsyXSkgLSAodjFbMl0gKiB2MlsxXSksXG4gICAgICAgICh2MVsyXSAqIHYyWzBdKSAtICh2MVswXSAqIHYyWzJdKSxcbiAgICAgICAgKHYxWzBdICogdjJbMV0pIC0gKHYxWzFdICogdjJbMF0pXG4gICAgXTtcbn07XG5cbi8vIEZpbmQgdGhlIGludGVyc2VjdGlvbiBvZiB0d28gbGluZXMgc3BlY2lmaWVkIGFzIHNlZ21lbnRzIGZyb20gcG9pbnRzIChwMSwgcDIpIGFuZCAocDMsIHA0KVxuLy8gaHR0cDovL2VuLndpa2lwZWRpYS5vcmcvd2lraS9MaW5lLWxpbmVfaW50ZXJzZWN0aW9uXG4vLyBodHRwOi8vZW4ud2lraXBlZGlhLm9yZy93aWtpL0NyYW1lcidzX3J1bGVcblZlY3Rvci5saW5lSW50ZXJzZWN0aW9uID0gZnVuY3Rpb24gKHAxLCBwMiwgcDMsIHA0LCBwYXJhbGxlbF90b2xlcmFuY2UpXG57XG4gICAgdmFyIHBhcmFsbGVsX3RvbGVyYW5jZSA9IHBhcmFsbGVsX3RvbGVyYW5jZSB8fCAwLjAxO1xuXG4gICAgLy8gYTEqeCArIGIxKnkgPSBjMSBmb3IgbGluZSAoeDEsIHkxKSB0byAoeDIsIHkyKVxuICAgIC8vIGEyKnggKyBiMip5ID0gYzIgZm9yIGxpbmUgKHgzLCB5MykgdG8gKHg0LCB5NClcbiAgICB2YXIgYTEgPSBwMVsxXSAtIHAyWzFdOyAvLyB5MSAtIHkyXG4gICAgdmFyIGIxID0gcDFbMF0gLSBwMlswXTsgLy8geDEgLSB4MlxuICAgIHZhciBhMiA9IHAzWzFdIC0gcDRbMV07IC8vIHkzIC0geTRcbiAgICB2YXIgYjIgPSBwM1swXSAtIHA0WzBdOyAvLyB4MyAtIHg0XG4gICAgdmFyIGMxID0gKHAxWzBdICogcDJbMV0pIC0gKHAxWzFdICogcDJbMF0pOyAvLyB4MSp5MiAtIHkxKngyXG4gICAgdmFyIGMyID0gKHAzWzBdICogcDRbMV0pIC0gKHAzWzFdICogcDRbMF0pOyAvLyB4Myp5NCAtIHkzKng0XG4gICAgdmFyIGRlbm9tID0gKGIxICogYTIpIC0gKGExICogYjIpO1xuXG4gICAgaWYgKE1hdGguYWJzKGRlbm9tKSA+IHBhcmFsbGVsX3RvbGVyYW5jZSkge1xuICAgICAgICByZXR1cm4gW1xuICAgICAgICAgICAgKChjMSAqIGIyKSAtIChiMSAqIGMyKSkgLyBkZW5vbSxcbiAgICAgICAgICAgICgoYzEgKiBhMikgLSAoYTEgKiBjMikpIC8gZGVub21cbiAgICAgICAgXTtcbiAgICB9XG4gICAgcmV0dXJuIG51bGw7IC8vIHJldHVybiBudWxsIGlmIGxpbmVzIGFyZSAoY2xvc2UgdG8pIHBhcmFsbGVsXG59O1xuIl19
(14)
});
