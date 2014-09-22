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


},{"./point":14}],4:[function(_dereq_,module,exports){
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


},{}],5:[function(_dereq_,module,exports){
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


},{"../point":14,"../vector":18,"./gl":4}],6:[function(_dereq_,module,exports){
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


},{"./gl":4,"./gl_program":8,"./gl_vertex_layout":11}],7:[function(_dereq_,module,exports){
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


},{"./gl":4,"./gl_builders":5,"./gl_geom":6,"./gl_program":8,"./gl_shaders":9,"./gl_vertex_layout":11,"queue-async":2}],8:[function(_dereq_,module,exports){
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
  this.transforms = options.transforms;
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
GLProgram.prototype.compile = function(callback) {
  var $__2 = this;
  var queue = Queue();
  this.computed_vertex_shader = this.vertex_shader;
  this.computed_fragment_shader = this.fragment_shader;
  var defines = this.buildDefineList();
  var regexp;
  var loaded_transforms = {};
  if (this.transforms != null) {
    for (var key in this.transforms) {
      var transform = this.transforms[key];
      if (transform == null) {
        continue;
      }
      if (typeof transform == 'string' || (typeof transform == 'object' && transform.length == null)) {
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
  var defines = {};
  for (var d in GLProgram.defines) {
    defines[d] = GLProgram.defines[d];
  }
  for (var d in this.defines) {
    defines[d] = this.defines[d];
  }
  return defines;
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


},{"../utils":17,"./gl":4,"./gl_texture":10,"queue-async":2}],9:[function(_dereq_,module,exports){
"use strict";
var shader_sources = {};
shader_sources['point_fragment'] = "\n" + "#define GLSLIFY 1\n" + "\n" + "uniform vec2 u_resolution;\n" + "varying vec3 v_color;\n" + "varying vec2 v_texcoord;\n" + "void main(void) {\n" + "  vec3 color = v_color;\n" + "  vec3 lighting = vec3(1.);\n" + "  float len = length(v_texcoord);\n" + "  if(len > 1.) {\n" + "    discard;\n" + "  }\n" + "  color *= (1. - smoothstep(.25, 1., len)) + 0.5;\n" + "  #pragma tangram: fragment\n" + "  gl_FragColor = vec4(color, 1.);\n" + "}\n" + "";
shader_sources['point_vertex'] = "\n" + "#define GLSLIFY 1\n" + "\n" + "uniform mat4 u_tile_view;\n" + "uniform mat4 u_perspective;\n" + "uniform float u_num_layers;\n" + "attribute vec3 a_position;\n" + "attribute vec2 a_texcoord;\n" + "attribute vec3 a_color;\n" + "attribute float a_layer;\n" + "varying vec3 v_color;\n" + "varying vec2 v_texcoord;\n" + "#if defined(FEATURE_SELECTION)\n" + "\n" + "attribute vec4 a_selection_color;\n" + "varying vec4 v_selection_color;\n" + "#endif\n" + "\n" + "float a_x_calculateZ(float z, float layer, const float num_layers, const float z_layer_scale) {\n" + "  float z_layer_range = (num_layers + 1.) * z_layer_scale;\n" + "  float z_layer = (layer + 1.) * z_layer_scale;\n" + "  z = z_layer + clamp(z, 0., z_layer_scale);\n" + "  z = (z_layer_range - z) / z_layer_range;\n" + "  return z;\n" + "}\n" + "#pragma tangram: globals\n" + "\n" + "void main() {\n" + "  \n" + "  #if defined(FEATURE_SELECTION)\n" + "  if(a_selection_color.xyz == vec3(0.)) {\n" + "    gl_Position = vec4(0., 0., 0., 1.);\n" + "    return;\n" + "  }\n" + "  v_selection_color = a_selection_color;\n" + "  #endif\n" + "  vec4 position = u_perspective * u_tile_view * vec4(a_position, 1.);\n" + "  #pragma tangram: vertex\n" + "  v_color = a_color;\n" + "  v_texcoord = a_texcoord;\n" + "  position.z -= a_layer * .001;\n" + "  gl_Position = position;\n" + "}\n" + "";
shader_sources['polygon_fragment'] = "\n" + "#define GLSLIFY 1\n" + "\n" + "uniform vec2 u_resolution;\n" + "uniform vec2 u_aspect;\n" + "uniform mat4 u_meter_view;\n" + "uniform float u_meters_per_pixel;\n" + "uniform float u_time;\n" + "uniform float u_map_zoom;\n" + "uniform vec2 u_map_center;\n" + "uniform vec2 u_tile_origin;\n" + "uniform float u_test;\n" + "uniform float u_test2;\n" + "varying vec3 v_color;\n" + "varying vec4 v_world_position;\n" + "#if defined(WORLD_POSITION_WRAP)\n" + "\n" + "vec2 world_position_anchor = vec2(floor(u_tile_origin / WORLD_POSITION_WRAP) * WORLD_POSITION_WRAP);\n" + "vec4 absoluteWorldPosition() {\n" + "  return vec4(v_world_position.xy + world_position_anchor, v_world_position.z, v_world_position.w);\n" + "}\n" + "#else\n" + "\n" + "vec4 absoluteWorldPosition() {\n" + "  return v_world_position;\n" + "}\n" + "#endif\n" + "\n" + "#if defined(LIGHTING_ENVIRONMENT)\n" + "\n" + "uniform sampler2D u_env_map;\n" + "#endif\n" + "\n" + "#if !defined(LIGHTING_VERTEX)\n" + "\n" + "varying vec4 v_position;\n" + "varying vec3 v_normal;\n" + "#else\n" + "\n" + "varying vec3 v_lighting;\n" + "#endif\n" + "\n" + "const float light_ambient = 0.5;\n" + "vec3 b_x_pointLight(vec4 position, vec3 normal, vec3 color, vec4 light_pos, float light_ambient, const bool backlight) {\n" + "  vec3 light_dir = normalize(position.xyz - light_pos.xyz);\n" + "  color *= abs(max(float(backlight) * -1., dot(normal, light_dir * -1.0))) + light_ambient;\n" + "  return color;\n" + "}\n" + "vec3 c_x_specularLight(vec4 position, vec3 normal, vec3 color, vec4 light_pos, float light_ambient, const bool backlight) {\n" + "  vec3 light_dir = normalize(position.xyz - light_pos.xyz);\n" + "  vec3 view_pos = vec3(0., 0., 500.);\n" + "  vec3 view_dir = normalize(position.xyz - view_pos.xyz);\n" + "  vec3 specularReflection;\n" + "  if(dot(normal, -light_dir) < 0.0) {\n" + "    specularReflection = vec3(0.0, 0.0, 0.0);\n" + "  } else {\n" + "    float attenuation = 1.0;\n" + "    float lightSpecularTerm = 1.0;\n" + "    float materialSpecularTerm = 10.0;\n" + "    float materialShininessTerm = 10.0;\n" + "    specularReflection = attenuation * vec3(lightSpecularTerm) * vec3(materialSpecularTerm) * pow(max(0.0, dot(reflect(-light_dir, normal), view_dir)), materialShininessTerm);\n" + "  }\n" + "  float diffuse = abs(max(float(backlight) * -1., dot(normal, light_dir * -1.0)));\n" + "  color *= diffuse + specularReflection + light_ambient;\n" + "  return color;\n" + "}\n" + "vec3 d_x_directionalLight(vec3 normal, vec3 color, vec3 light_dir, float light_ambient) {\n" + "  light_dir = normalize(light_dir);\n" + "  color *= dot(normal, light_dir * -1.0) + light_ambient;\n" + "  return color;\n" + "}\n" + "vec3 a_x_lighting(vec4 position, vec3 normal, vec3 color, vec4 light_pos, vec4 night_light_pos, vec3 light_dir, float light_ambient) {\n" + "  \n" + "  #if defined(LIGHTING_POINT)\n" + "  color = b_x_pointLight(position, normal, color, light_pos, light_ambient, true);\n" + "  #elif defined(LIGHTING_POINT_SPECULAR)\n" + "  color = c_x_specularLight(position, normal, color, light_pos, light_ambient, true);\n" + "  #elif defined(LIGHTING_NIGHT)\n" + "  color = b_x_pointLight(position, normal, color, night_light_pos, 0., false);\n" + "  #elif defined(LIGHTING_DIRECTION)\n" + "  color = d_x_directionalLight(normal, color, light_dir, light_ambient);\n" + "  #else\n" + "  color = color;\n" + "  #endif\n" + "  return color;\n" + "}\n" + "vec4 e_x_sphericalEnvironmentMap(vec3 view_pos, vec3 position, vec3 normal, sampler2D envmap) {\n" + "  vec3 eye = normalize(position.xyz - view_pos.xyz);\n" + "  if(eye.z > 0.01) {\n" + "    eye.z = 0.01;\n" + "  }\n" + "  vec3 r = reflect(eye, normal);\n" + "  float m = 2. * sqrt(pow(r.x, 2.) + pow(r.y, 2.) + pow(r.z + 1., 2.));\n" + "  vec2 uv = r.xy / m + .5;\n" + "  return texture2D(envmap, uv);\n" + "}\n" + "#pragma tangram: globals\n" + "\n" + "void main(void) {\n" + "  vec3 color = v_color;\n" + "  #if defined(LIGHTING_ENVIRONMENT)\n" + "  vec3 view_pos = vec3(0., 0., 100. * u_meters_per_pixel);\n" + "  color = e_x_sphericalEnvironmentMap(view_pos, v_position.xyz, v_normal, u_env_map).rgb;\n" + "  #endif\n" + "  \n" + "  #if !defined(LIGHTING_VERTEX) // default to per-pixel lighting\n" + "  vec3 lighting = a_x_lighting(v_position, v_normal, vec3(1.), vec4(0., 0., 150. * u_meters_per_pixel, 1.), vec4(0., 0., 50. * u_meters_per_pixel, 1.), vec3(0.2, 0.7, -0.5), light_ambient);\n" + "  #else\n" + "  vec3 lighting = v_lighting;\n" + "  #endif\n" + "  vec3 color_prelight = color;\n" + "  color *= lighting;\n" + "  #pragma tangram: fragment\n" + "  gl_FragColor = vec4(color, 1.0);\n" + "}\n" + "";
shader_sources['polygon_vertex'] = "\n" + "#define GLSLIFY 1\n" + "\n" + "uniform vec2 u_resolution;\n" + "uniform vec2 u_aspect;\n" + "uniform float u_time;\n" + "uniform float u_map_zoom;\n" + "uniform vec2 u_map_center;\n" + "uniform vec2 u_tile_origin;\n" + "uniform mat4 u_tile_world;\n" + "uniform mat4 u_tile_view;\n" + "uniform mat4 u_perspective;\n" + "uniform float u_meters_per_pixel;\n" + "uniform float u_num_layers;\n" + "attribute vec3 a_position;\n" + "attribute vec3 a_normal;\n" + "attribute vec3 a_color;\n" + "attribute float a_layer;\n" + "varying vec4 v_world_position;\n" + "varying vec3 v_color;\n" + "#if defined(WORLD_POSITION_WRAP)\n" + "\n" + "vec2 world_position_anchor = vec2(floor(u_tile_origin / WORLD_POSITION_WRAP) * WORLD_POSITION_WRAP);\n" + "vec4 absoluteWorldPosition() {\n" + "  return vec4(v_world_position.xy + world_position_anchor, v_world_position.z, v_world_position.w);\n" + "}\n" + "#else\n" + "\n" + "vec4 absoluteWorldPosition() {\n" + "  return v_world_position;\n" + "}\n" + "#endif\n" + "\n" + "#if defined(FEATURE_SELECTION)\n" + "\n" + "attribute vec4 a_selection_color;\n" + "varying vec4 v_selection_color;\n" + "#endif\n" + "\n" + "#if !defined(LIGHTING_VERTEX)\n" + "\n" + "varying vec4 v_position;\n" + "varying vec3 v_normal;\n" + "#else\n" + "\n" + "varying vec3 v_lighting;\n" + "#endif\n" + "\n" + "const float light_ambient = 0.5;\n" + "vec4 a_x_perspective(vec4 position, const vec2 perspective_offset, const vec2 perspective_factor) {\n" + "  position.xy += position.z * perspective_factor * (position.xy - perspective_offset);\n" + "  return position;\n" + "}\n" + "vec4 b_x_isometric(vec4 position, const vec2 axis, const float multiplier) {\n" + "  position.xy += position.z * axis * multiplier / u_aspect;\n" + "  return position;\n" + "}\n" + "float c_x_calculateZ(float z, float layer, const float num_layers, const float z_layer_scale) {\n" + "  float z_layer_range = (num_layers + 1.) * z_layer_scale;\n" + "  float z_layer = (layer + 1.) * z_layer_scale;\n" + "  z = z_layer + clamp(z, 0., z_layer_scale);\n" + "  z = (z_layer_range - z) / z_layer_range;\n" + "  return z;\n" + "}\n" + "vec3 e_x_pointLight(vec4 position, vec3 normal, vec3 color, vec4 light_pos, float light_ambient, const bool backlight) {\n" + "  vec3 light_dir = normalize(position.xyz - light_pos.xyz);\n" + "  color *= abs(max(float(backlight) * -1., dot(normal, light_dir * -1.0))) + light_ambient;\n" + "  return color;\n" + "}\n" + "vec3 f_x_specularLight(vec4 position, vec3 normal, vec3 color, vec4 light_pos, float light_ambient, const bool backlight) {\n" + "  vec3 light_dir = normalize(position.xyz - light_pos.xyz);\n" + "  vec3 view_pos = vec3(0., 0., 500.);\n" + "  vec3 view_dir = normalize(position.xyz - view_pos.xyz);\n" + "  vec3 specularReflection;\n" + "  if(dot(normal, -light_dir) < 0.0) {\n" + "    specularReflection = vec3(0.0, 0.0, 0.0);\n" + "  } else {\n" + "    float attenuation = 1.0;\n" + "    float lightSpecularTerm = 1.0;\n" + "    float materialSpecularTerm = 10.0;\n" + "    float materialShininessTerm = 10.0;\n" + "    specularReflection = attenuation * vec3(lightSpecularTerm) * vec3(materialSpecularTerm) * pow(max(0.0, dot(reflect(-light_dir, normal), view_dir)), materialShininessTerm);\n" + "  }\n" + "  float diffuse = abs(max(float(backlight) * -1., dot(normal, light_dir * -1.0)));\n" + "  color *= diffuse + specularReflection + light_ambient;\n" + "  return color;\n" + "}\n" + "vec3 g_x_directionalLight(vec3 normal, vec3 color, vec3 light_dir, float light_ambient) {\n" + "  light_dir = normalize(light_dir);\n" + "  color *= dot(normal, light_dir * -1.0) + light_ambient;\n" + "  return color;\n" + "}\n" + "vec3 d_x_lighting(vec4 position, vec3 normal, vec3 color, vec4 light_pos, vec4 night_light_pos, vec3 light_dir, float light_ambient) {\n" + "  \n" + "  #if defined(LIGHTING_POINT)\n" + "  color = e_x_pointLight(position, normal, color, light_pos, light_ambient, true);\n" + "  #elif defined(LIGHTING_POINT_SPECULAR)\n" + "  color = f_x_specularLight(position, normal, color, light_pos, light_ambient, true);\n" + "  #elif defined(LIGHTING_NIGHT)\n" + "  color = e_x_pointLight(position, normal, color, night_light_pos, 0., false);\n" + "  #elif defined(LIGHTING_DIRECTION)\n" + "  color = g_x_directionalLight(normal, color, light_dir, light_ambient);\n" + "  #else\n" + "  color = color;\n" + "  #endif\n" + "  return color;\n" + "}\n" + "#pragma tangram: globals\n" + "\n" + "void main() {\n" + "  \n" + "  #if defined(FEATURE_SELECTION)\n" + "  if(a_selection_color.xyz == vec3(0.)) {\n" + "    gl_Position = vec4(0., 0., 0., 1.);\n" + "    return;\n" + "  }\n" + "  v_selection_color = a_selection_color;\n" + "  #endif\n" + "  vec4 position = u_tile_view * vec4(a_position, 1.);\n" + "  v_world_position = u_tile_world * vec4(a_position, 1.);\n" + "  #if defined(WORLD_POSITION_WRAP)\n" + "  v_world_position.xy -= world_position_anchor;\n" + "  #endif\n" + "  \n" + "  #pragma tangram: vertex\n" + "  \n" + "  #if defined(LIGHTING_VERTEX)\n" + "  v_color = a_color;\n" + "  v_lighting = d_x_lighting(position, a_normal, vec3(1.), vec4(0., 0., 150. * u_meters_per_pixel, 1.), vec4(0., 0., 50. * u_meters_per_pixel, 1.), vec3(0.2, 0.7, -0.5), light_ambient);\n" + "  #else\n" + "  v_position = position;\n" + "  v_normal = a_normal;\n" + "  v_color = a_color;\n" + "  #endif\n" + "  position = u_perspective * position;\n" + "  position.z -= a_layer * .001;\n" + "  gl_Position = position;\n" + "}\n" + "";
shader_sources['selection_fragment'] = "\n" + "#define GLSLIFY 1\n" + "\n" + "#if defined(FEATURE_SELECTION)\n" + "\n" + "varying vec4 v_selection_color;\n" + "#endif\n" + "\n" + "void main(void) {\n" + "  \n" + "  #if defined(FEATURE_SELECTION)\n" + "  gl_FragColor = v_selection_color;\n" + "  #else\n" + "  gl_FragColor = vec4(0., 0., 0., 1.);\n" + "  #endif\n" + "  \n" + "}\n" + "";
shader_sources['simple_polygon_fragment'] = "\n" + "#define GLSLIFY 1\n" + "\n" + "uniform float u_meters_per_pixel;\n" + "varying vec3 v_color;\n" + "#if !defined(LIGHTING_VERTEX)\n" + "\n" + "varying vec4 v_position;\n" + "varying vec3 v_normal;\n" + "#endif\n" + "\n" + "vec3 a_x_pointLight(vec4 position, vec3 normal, vec3 color, vec4 light_pos, float light_ambient, const bool backlight) {\n" + "  vec3 light_dir = normalize(position.xyz - light_pos.xyz);\n" + "  color *= abs(max(float(backlight) * -1., dot(normal, light_dir * -1.0))) + light_ambient;\n" + "  return color;\n" + "}\n" + "#pragma tangram: globals\n" + "\n" + "void main(void) {\n" + "  vec3 color;\n" + "  #if !defined(LIGHTING_VERTEX) // default to per-pixel lighting\n" + "  vec4 light_pos = vec4(0., 0., 150. * u_meters_per_pixel, 1.);\n" + "  const float light_ambient = 0.5;\n" + "  const bool backlit = true;\n" + "  color = a_x_pointLight(v_position, v_normal, v_color, light_pos, light_ambient, backlit);\n" + "  #else\n" + "  color = v_color;\n" + "  #endif\n" + "  \n" + "  #pragma tangram: fragment\n" + "  gl_FragColor = vec4(color, 1.0);\n" + "}\n" + "";
shader_sources['simple_polygon_vertex'] = "\n" + "#define GLSLIFY 1\n" + "\n" + "uniform vec2 u_aspect;\n" + "uniform mat4 u_tile_view;\n" + "uniform mat4 u_meter_view;\n" + "uniform float u_meters_per_pixel;\n" + "uniform float u_num_layers;\n" + "attribute vec3 a_position;\n" + "attribute vec3 a_normal;\n" + "attribute vec3 a_color;\n" + "attribute float a_layer;\n" + "varying vec3 v_color;\n" + "#if !defined(LIGHTING_VERTEX)\n" + "\n" + "varying vec4 v_position;\n" + "varying vec3 v_normal;\n" + "#endif\n" + "\n" + "vec4 a_x_perspective(vec4 position, const vec2 perspective_offset, const vec2 perspective_factor) {\n" + "  position.xy += position.z * perspective_factor * (position.xy - perspective_offset);\n" + "  return position;\n" + "}\n" + "vec4 b_x_isometric(vec4 position, const vec2 axis, const float multiplier) {\n" + "  position.xy += position.z * axis * multiplier / u_aspect;\n" + "  return position;\n" + "}\n" + "float c_x_calculateZ(float z, float layer, const float num_layers, const float z_layer_scale) {\n" + "  float z_layer_range = (num_layers + 1.) * z_layer_scale;\n" + "  float z_layer = (layer + 1.) * z_layer_scale;\n" + "  z = z_layer + clamp(z, 0., z_layer_scale);\n" + "  z = (z_layer_range - z) / z_layer_range;\n" + "  return z;\n" + "}\n" + "vec3 d_x_pointLight(vec4 position, vec3 normal, vec3 color, vec4 light_pos, float light_ambient, const bool backlight) {\n" + "  vec3 light_dir = normalize(position.xyz - light_pos.xyz);\n" + "  color *= abs(max(float(backlight) * -1., dot(normal, light_dir * -1.0))) + light_ambient;\n" + "  return color;\n" + "}\n" + "#pragma tangram: globals\n" + "\n" + "void main() {\n" + "  vec4 position = u_tile_view * vec4(a_position, 1.);\n" + "  #pragma tangram: vertex\n" + "  \n" + "  #if defined(LIGHTING_VERTEX)\n" + "  vec4 light_pos = vec4(0., 0., 150. * u_meters_per_pixel, 1.);\n" + "  const float light_ambient = 0.5;\n" + "  const bool backlit = true;\n" + "  v_color = d_x_pointLight(position, a_normal, a_color, light_pos, light_ambient, backlit);\n" + "  #else\n" + "  v_position = position;\n" + "  v_normal = a_normal;\n" + "  v_color = a_color;\n" + "  #endif\n" + "  position = u_meter_view * position;\n" + "  #if defined(PROJECTION_PERSPECTIVE)\n" + "  position = a_x_perspective(position, vec2(-0.25, -0.25), vec2(0.6, 0.6));\n" + "  #elif defined(PROJECTION_ISOMETRIC)\n" + "  position = b_x_isometric(position, vec2(0., 1.), 1.);\n" + "  #endif\n" + "  position.z = c_x_calculateZ(position.z, a_layer, u_num_layers, 4096.);\n" + "  gl_Position = position;\n" + "}\n" + "";
module.exports = shader_sources;


},{}],10:[function(_dereq_,module,exports){
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


},{"../utils":17,"./gl":4}],11:[function(_dereq_,module,exports){
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


},{}],12:[function(_dereq_,module,exports){
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


},{"./scene":15}],13:[function(_dereq_,module,exports){
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


},{"./gl/gl":4,"./gl/gl_program.js":8,"./gl/gl_texture.js":10,"./leaflet_layer":12}],14:[function(_dereq_,module,exports){
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


},{}],15:[function(_dereq_,module,exports){
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
var $__8 = _dereq_('gl-matrix'),
    mat4 = $__8.mat4,
    vec3 = $__8.vec3;
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
  this.focal_length = 2.5;
  this.resetTime();
}
var $__default = Scene;
Scene.prototype.init = function(callback) {
  var $__9 = this;
  if (this.initialized) {
    return;
  }
  this.loadScene((function() {
    var queue = Queue();
    queue.defer((function(complete) {
      $__9.modes = Scene.createModes($__9.styles);
      $__9.updateActiveModes();
      complete();
    }));
    queue.defer((function(complete) {
      $__9.createWorkers(complete);
    }));
    queue.await((function() {
      $__9.container = $__9.container || document.body;
      $__9.canvas = document.createElement('canvas');
      $__9.canvas.style.position = 'absolute';
      $__9.canvas.style.top = 0;
      $__9.canvas.style.left = 0;
      $__9.canvas.style.zIndex = -1;
      $__9.container.appendChild($__9.canvas);
      $__9.gl = GL.getContext($__9.canvas);
      $__9.resizeMap($__9.container.clientWidth, $__9.container.clientHeight);
      $__9.initModes();
      $__9.initSelectionBuffer();
      $__9.last_render_count = null;
      $__9.initInputHandlers();
      $__9.initialized = true;
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
  var $__9 = this;
  var queue = Queue();
  var worker_url = Scene.library_base_url + 'tangram-worker.debug.js' + '?' + (+new Date());
  queue.defer((function(complete) {
    var createObjectURL = (window.URL && window.URL.createObjectURL) || (window.webkitURL && window.webkitURL.createObjectURL);
    if (createObjectURL && $__9.allow_cross_domain_workers) {
      var req = new XMLHttpRequest();
      req.onload = (function() {
        var worker_local_url = createObjectURL(new Blob([req.response], {type: 'application/javascript'}));
        $__9.makeWorkers(worker_local_url);
        complete();
      });
      req.open('GET', worker_url, true);
      req.responseType = 'text';
      req.send();
    } else {
      console.log($__9);
      $__9.makeWorkers(worker_url);
      complete();
    }
  }));
  queue.await((function() {
    $__9.workers.forEach((function(worker) {
      worker.addEventListener('message', $__9.workerBuildTileCompleted.bind($__9));
      worker.addEventListener('message', $__9.workerGetFeatureSelection.bind($__9));
      worker.addEventListener('message', $__9.workerLogMessage.bind($__9));
    }));
    $__9.next_worker = 0;
    $__9.selection_map_worker_size = {};
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
  this.removeTilesOutsideZoomRange(below, above);
  this.dirty = true;
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
  var buffer = 200 * Geo.meters_per_pixel[~~this.zoom];
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
  var meters_per_pixel = Geo.min_zoom_meters_per_pixel / Math.pow(2, this.zoom);
  var meter_zoom = Point(this.css_size.width / 2 * meters_per_pixel, this.css_size.height / 2 * meters_per_pixel);
  var tile_view_mat = mat4.create();
  var tile_world_mat = mat4.create();
  var camera_height = meter_zoom.y * this.focal_length;
  var focal_length = this.focal_length;
  var aspect = this.css_size.width / this.css_size.height;
  var znear = 1;
  var zfar = (camera_height + znear) * 5;
  var perspective_mat = mat4.create();
  mat4.perspective(perspective_mat, Math.atan(1 / focal_length) * 2, aspect, znear, zfar);
  mat4.translate(perspective_mat, perspective_mat, vec3.fromValues(0, 0, -camera_height));
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
          gl_program.uniform('2f', 'u_aspect', this.device_size.width / this.device_size.height, 1.0);
          gl_program.uniform('1f', 'u_time', ((+new Date()) - this.start_time) / 1000);
          gl_program.uniform('1f', 'u_map_zoom', this.zoom);
          gl_program.uniform('2f', 'u_map_center', center.x, center.y);
          gl_program.uniform('1f', 'u_num_layers', this.layers.length);
          gl_program.uniform('1f', 'u_meters_per_pixel', meters_per_pixel);
          gl_program.uniform('Matrix4fv', 'u_perspective', false, perspective_mat);
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
            gl_program.uniform('2f', 'u_aspect', this.fbo_size.width / this.fbo_size.height, 1.0);
            gl_program.uniform('1f', 'u_time', ((+new Date()) - this.start_time) / 1000);
            gl_program.uniform('1f', 'u_map_zoom', this.zoom);
            gl_program.uniform('2f', 'u_map_center', center.x, center.y);
            gl_program.uniform('1f', 'u_num_layers', this.layers.length);
            gl_program.uniform('1f', 'u_meters_per_pixel', meters_per_pixel);
            gl_program.uniform('Matrix4fv', 'u_perspective', false, perspective_mat);
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
  var $__9 = this;
  if (!this.initialized) {
    return;
  }
  this.layers_serialized = Utils.serializeWithFunctions(this.layers);
  this.styles_serialized = Utils.serializeWithFunctions(this.styles);
  this.selection_map = {};
  this.workers.forEach((function(worker) {
    worker.postMessage({
      type: 'prepareForRebuild',
      layers: $__9.layers_serialized,
      styles: $__9.styles_serialized
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
    var ad = $__9.tiles[a].center_dist;
    var bd = $__9.tiles[b].center_dist;
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
  var $__9 = this;
  if (event.data.type != 'buildTileCompleted') {
    return;
  }
  this.selection_map_worker_size[event.data.worker_id] = event.data.selection_map_size;
  this.selection_map_size = 0;
  Object.keys(this.selection_map_worker_size).forEach((function(worker) {
    $__9.selection_map_size += $__9.selection_map_worker_size[worker];
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
  var $__9 = this;
  var queue = Queue();
  if (!this.layer_source && typeof(this.layers) == 'string') {
    this.layer_source = Utils.urlForPath(this.layers);
  }
  if (!this.style_source && typeof(this.styles) == 'string') {
    this.style_source = Utils.urlForPath(this.styles);
  }
  if (this.layer_source) {
    queue.defer((function(complete) {
      Scene.loadLayers($__9.layer_source, (function(layers) {
        $__9.layers = layers;
        $__9.layers_serialized = Utils.serializeWithFunctions($__9.layers);
        complete();
      }));
    }));
  }
  if (this.style_source) {
    queue.defer((function(complete) {
      Scene.loadStyles($__9.style_source, (function(styles) {
        $__9.styles = styles;
        $__9.styles_serialized = Utils.serializeWithFunctions($__9.styles);
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
  var $__9 = this;
  if (!this.initialized) {
    return;
  }
  this.loadScene((function() {
    $__9.rebuildTiles();
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


},{"./geo":3,"./gl/gl":4,"./gl/gl_builders":5,"./gl/gl_modes":7,"./gl/gl_program":8,"./gl/gl_texture":10,"./point":14,"./style":16,"./utils":17,"gl-matrix":1,"js-yaml":"jkXaKS","queue-async":2}],16:[function(_dereq_,module,exports){
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


},{"./geo":3}],17:[function(_dereq_,module,exports){
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


},{}],18:[function(_dereq_,module,exports){
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


},{}]},{},[13])
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi9Vc2Vycy9iY2FtcGVyL0RvY3VtZW50cy9kZXYvdmVjdG9yLW1hcC9ub2RlX21vZHVsZXMvYnJvd3NlcmlmeS9ub2RlX21vZHVsZXMvYnJvd3Nlci1wYWNrL19wcmVsdWRlLmpzIiwiL1VzZXJzL2JjYW1wZXIvRG9jdW1lbnRzL2Rldi92ZWN0b3ItbWFwL25vZGVfbW9kdWxlcy9nbC1tYXRyaXgvZGlzdC9nbC1tYXRyaXguanMiLCIvVXNlcnMvYmNhbXBlci9Eb2N1bWVudHMvZGV2L3ZlY3Rvci1tYXAvbm9kZV9tb2R1bGVzL3F1ZXVlLWFzeW5jL3F1ZXVlLmpzIiwiL1VzZXJzL2JjYW1wZXIvRG9jdW1lbnRzL2Rldi92ZWN0b3ItbWFwL3NyYy9nZW8uanMiLCIvVXNlcnMvYmNhbXBlci9Eb2N1bWVudHMvZGV2L3ZlY3Rvci1tYXAvc3JjL2dsL2dsLmpzIiwiL1VzZXJzL2JjYW1wZXIvRG9jdW1lbnRzL2Rldi92ZWN0b3ItbWFwL3NyYy9nbC9nbF9idWlsZGVycy5qcyIsIi9Vc2Vycy9iY2FtcGVyL0RvY3VtZW50cy9kZXYvdmVjdG9yLW1hcC9zcmMvZ2wvZ2xfZ2VvbS5qcyIsIi9Vc2Vycy9iY2FtcGVyL0RvY3VtZW50cy9kZXYvdmVjdG9yLW1hcC9zcmMvZ2wvZ2xfbW9kZXMuanMiLCIvVXNlcnMvYmNhbXBlci9Eb2N1bWVudHMvZGV2L3ZlY3Rvci1tYXAvc3JjL2dsL2dsX3Byb2dyYW0uanMiLCIvVXNlcnMvYmNhbXBlci9Eb2N1bWVudHMvZGV2L3ZlY3Rvci1tYXAvc3JjL2dsL2dsX3NoYWRlcnMuanMiLCIvVXNlcnMvYmNhbXBlci9Eb2N1bWVudHMvZGV2L3ZlY3Rvci1tYXAvc3JjL2dsL2dsX3RleHR1cmUuanMiLCIvVXNlcnMvYmNhbXBlci9Eb2N1bWVudHMvZGV2L3ZlY3Rvci1tYXAvc3JjL2dsL2dsX3ZlcnRleF9sYXlvdXQuanMiLCIvVXNlcnMvYmNhbXBlci9Eb2N1bWVudHMvZGV2L3ZlY3Rvci1tYXAvc3JjL2xlYWZsZXRfbGF5ZXIuanMiLCIvVXNlcnMvYmNhbXBlci9Eb2N1bWVudHMvZGV2L3ZlY3Rvci1tYXAvc3JjL21vZHVsZS5qcyIsIi9Vc2Vycy9iY2FtcGVyL0RvY3VtZW50cy9kZXYvdmVjdG9yLW1hcC9zcmMvcG9pbnQuanMiLCIvVXNlcnMvYmNhbXBlci9Eb2N1bWVudHMvZGV2L3ZlY3Rvci1tYXAvc3JjL3NjZW5lLmpzIiwiL1VzZXJzL2JjYW1wZXIvRG9jdW1lbnRzL2Rldi92ZWN0b3ItbWFwL3NyYy9zdHlsZS5qcyIsIi9Vc2Vycy9iY2FtcGVyL0RvY3VtZW50cy9kZXYvdmVjdG9yLW1hcC9zcmMvdXRpbHMuanMiLCIvVXNlcnMvYmNhbXBlci9Eb2N1bWVudHMvZGV2L3ZlY3Rvci1tYXAvc3JjL3ZlY3Rvci5qcyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFBQTtBQ0FBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDL3hIQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7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RSxDQUFBLENBQUMsQ0FBRyxNQUFJLENBQUMsQ0FFcEMsRUFBQyxPQUFNLENBQUUsQ0FBQSxDQUFDLENBQUUsQ0FBQSxDQUFDLENBQUcsQ0FBQSxPQUFNLENBQUUsQ0FBQSxDQUFDLENBQUUsQ0FBQSxDQUFDLENBQUcsTUFBSSxDQUFDLENBQ3BDLEVBQUMsT0FBTSxDQUFFLENBQUEsQ0FBQyxDQUFFLENBQUEsQ0FBQyxDQUFHLENBQUEsT0FBTSxDQUFFLENBQUEsQ0FBQyxDQUFFLENBQUEsQ0FBQyxDQUFHLE1BQUksQ0FBQyxDQUNwQyxFQUFDLE9BQU0sQ0FBRSxDQUFBLEVBQUUsRUFBQSxDQUFDLENBQUUsQ0FBQSxDQUFDLENBQUcsQ0FBQSxPQUFNLENBQUUsQ0FBQSxFQUFFLEVBQUEsQ0FBQyxDQUFFLENBQUEsQ0FBQyxDQUFHLE1BQUksQ0FBQyxDQUM1QyxDQUFDO0FBR0QsQUFBSSxVQUFBLENBQUEsTUFBSyxFQUFJLENBQUEsTUFBSyxNQUFNLEFBQUMsQ0FDckIsQ0FBQyxDQUFBLENBQUcsRUFBQSxDQUFHLEVBQUEsQ0FBQyxDQUNSLENBQUEsTUFBSyxVQUFVLEFBQUMsQ0FBQyxDQUFDLE9BQU0sQ0FBRSxDQUFBLEVBQUUsRUFBQSxDQUFDLENBQUUsQ0FBQSxDQUFDLEVBQUksQ0FBQSxPQUFNLENBQUUsQ0FBQSxDQUFDLENBQUUsQ0FBQSxDQUFDLENBQUcsQ0FBQSxPQUFNLENBQUUsQ0FBQSxFQUFFLEVBQUEsQ0FBQyxDQUFFLENBQUEsQ0FBQyxFQUFJLENBQUEsT0FBTSxDQUFFLENBQUEsQ0FBQyxDQUFFLENBQUEsQ0FBQyxDQUFHLEVBQUEsQ0FBQyxDQUFDLENBQzFGLENBQUM7QUFFRCw0QkFBb0IsQ0FBRSxDQUFBLENBQUMsRUFBSSxDQUFBLE1BQUssQ0FBRSxDQUFBLENBQUMsQ0FBQztBQUNwQyw0QkFBb0IsQ0FBRSxDQUFBLENBQUMsRUFBSSxDQUFBLE1BQUssQ0FBRSxDQUFBLENBQUMsQ0FBQztBQUNwQyw0QkFBb0IsQ0FBRSxDQUFBLENBQUMsRUFBSSxDQUFBLE1BQUssQ0FBRSxDQUFB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QUFXLENBQUcsRUFBQyxDQUFHLENBQUEsRUFBQyxDQUFHO0FBQzNCLEFBQUksTUFBQSxDQUFBLEtBQUksRUFBSSxDQUFBLE1BQUssVUFBVSxBQUFDLENBQUMsQ0FBQyxDQUFDLEVBQUMsQ0FBRSxDQUFBLENBQUMsRUFBSSxDQUFBLEVBQUMsQ0FBRSxDQUFBLENBQUMsQ0FBQyxFQUFJLEVBQUMsQ0FBQSxDQUFHLENBQUEsRUFBQyxDQUFFLENBQUEsQ0FBQyxFQUFJLENBQUEsRUFBQyxDQUFFLENBQUEsQ0FBQyxDQUFDLENBQUMsQ0FBQztBQUVuRSxBQUFJLE1BQUEsQ0FBQSxRQUFPLEVBQUksRUFBQyxFQUFDLENBQUUsQ0FBQSxDQUFDLEVBQUksQ0FBQSxLQUFJLENBQUUsQ0FBQSxDQUFDLEVBQUksTUFBSSxDQUFBLENBQUUsRUFBQSxDQUFHLENBQUEsRUFBQyxDQUFFLENBQUEsQ0FBQyxFQUFJLENBQUEsS0FBSSxDQUFFLENBQUEsQ0FBQyxFQUFJLE1BQUksQ0FBQSxDQUFFLEVBQUEsQ0FBQyxDQUFDO0FBQ3ZFLEFBQUksTUFBQSxDQUFBLFFBQU8sRUFBSSxFQUFDLEVBQUMsQ0FBRSxDQUFBLENBQUMsRUFBSSxDQUFBLEtBQUksQ0FBRSxDQUFBLENBQUMsRUFBSSxNQUFJLENBQUEsQ0FBRSxFQUFBLENBQUcsQ0FBQSxFQUFDLENBQUUsQ0FBQSxDQUFDLEVBQUksQ0FBQSxLQUFJLENBQUUsQ0FBQSxDQUFDLEVBQUksTUFBSSxDQUFBLENBQUUsRUFBQSxDQUFDLENBQUM7QUFFdkUsQUFBSSxNQUFBLENBQUEsUUFBTyxFQUFJLEVBQUMsRUFBQyxDQUFFLENBQUEsQ0FBQyxFQUFJLENBQUEsS0FBSSxDQUFFLENBQUEsQ0FBQyxFQUFJLE1BQUksQ0FBQSxDQUFFLEVBQUEsQ0FBRyxDQUFBLEVBQUMsQ0FBRSxDQUFBLENBQUMsRUFBSSxDQUFBLEtBQUksQ0FBRSxDQUFBLENBQUMsRUFBSSxNQUFJLENBQUEsQ0FBRSxFQUFBLENBQUMsQ0FBQztBQUN2RSxBQUFJLE1BQUEsQ0FBQSxRQUFPLEVBQUksRUFBQyxFQUFDLENBQUUsQ0FBQSxDQUFDLEVBQUksQ0FBQSxLQUFJLENBQUUsQ0FBQSxDQUFDLEVBQUksTUFBSSxDQUFBLENBQUUsRUFBQSxDQUFHLENBQUEsRUFBQyxDQUFFLENBQUEsQ0FBQyxFQUFJLENBQUEsS0FBSSxDQUFFLENBQUEsQ0FBQyxFQUFJLE1BQUksQ0FBQSxDQUFFLEVBQUEsQ0FBQyxDQUFDO0FBRXZFLFdBQU8sS0FBSyxBQUFDLENBQ1QsUUFBTyxDQUFHLFNBQU8sQ0FBRyxTQUFPLENBQzNCLFNBQU8sQ0FBRyxTQUFPLENBQUcsU0FBTyxDQUMvQixDQUFDO0VBQ0w7QUFBQSxBQUlBLFNBQVMsWUFBVSxDQUFHLEVBQUMsQ0FBRyxDQUFBLEtBQUksQ0FBRyxDQUFBLEVBQUMsQ0FBRztBQUVqQyxBQUFJLE1BQUEsQ0FBQSxRQUFPLEVBQUksQ0FBQSxNQUFLLFVBQVUsQUFBQyxDQUFDLENBQUMsQ0FBQyxLQUFJLENBQUUsQ0FBQSxDQUFDLEVBQUksQ0FBQSxFQUFDLENBQUUsQ0FBQSxDQUFDLENBQUMsRUFBSSxFQUFDLENBQUEsQ0FBRyxDQUFBLEtBQUksQ0FBRSxDQUFBLENBQUMsRUFBSSxDQUFBLEVBQUMsQ0FBRSxDQUFBLENBQUMsQ0FBQyxDQUFDLENBQUM7QUFDNUUsQUFBSSxNQUFBLENBQUEsUUFBTyxFQUFJLEVBQ1gsQ0FBQyxFQUFDLENBQUUsQ0FBQSxDQUFDLEVBQUksQ0FBQSxRQUFPLENBQUUsQ0FBQSxDQUFDLEVBQUksTUFBSSxDQUFBLENBQUUsRUFBQSxDQUFHLENBQUEsRUFBQyxDQUFFLENBQUEsQ0FBQyxFQUFJLENBQUEsUUFBTyxDQUFFLENBQUEsQ0FBQyxFQUFJLE1BQUksQ0FBQSxDQUFFLEVBQUEsQ0FBQyxDQUM3RCxFQUFDLEtBQUksQ0FBRSxDQUFBLENBQUMsRUFBSSxDQUFBLFFBQU8sQ0FBRSxDQUFBLENBQUMsRUFBSSxNQUFJLENBQUEsQ0FBRSxFQUFBLENBQUcsQ0FBQSxLQUFJLENBQUUsQ0FBQSxDQUFDLEVBQUksQ0FBQSxRQUFPLENBQUUsQ0FBQSxDQUFDLEVBQUksTUFBSSxDQUFBLENBQUUsRUFBQSxDQUFDLENBQ3ZFLENBQUM7QUFDRCxBQUFJLE1BQUEsQ0FBQSxRQUFPLEVBQUksRUFDWCxDQUFDLEVBQUMsQ0FBRSxDQUFBLENBQUMsRUFBSSxDQUFBLFFBQU8sQ0FBRSxDQUFBLENBQUMsRUFBSSxNQUFJLENBQUEsQ0FBRSxFQUFBLENBQUcsQ0FBQSxFQUFDLENBQUUsQ0FBQSxDQUFDLEVBQUksQ0FBQSxRQUFPLENBQUUsQ0FBQSxDQUFDLEVBQUksTUFBSSxDQUFBLENBQUUsRUFBQSxDQUFDLENBQzdELEVBQUMsS0FBSSxDQUFFLENBQUEsQ0FBQyxFQUFJLENBQUEsUUFBTyxDQUFFLENBQUEsQ0FBQyxFQUFJLE1BQUksQ0FBQSxDQUFFLEVBQUEsQ0FBRyxDQUFBLEtBQUksQ0FBRSxDQUFBLENBQUMsRUFBSSxDQUFBLFFBQU8sQ0FBRSxDQUFBLENBQUMsRUFBSSxNQUFJLENBQUEsQ0FBRSxFQUFBLENBQUMsQ0FDdkUsQ0FBQztBQUVELEFBQUksTUFBQSxDQUFBLFFBQU8sRUFBSSxDQUFBLE1BQUssVUFBVSxBQUFDLENBQUMsQ0FBQyxDQUFDLEVBQUMsQ0FBRSxDQUFBLENBQUMsRUFBSSxDQUFBLEtBQUksQ0FBRSxDQUFBLENBQUMsQ0FBQyxFQUFJLEVBQUMsQ0FBQSxDQUFHLENBQUEsRUFBQyxDQUFFLENBQUEsQ0FBQyxFQUFJLENBQUEsS0FBSSxDQUFFLENBQUEsQ0FBQyxDQUFDLENBQUMsQ0FBQztBQUM1RSxBQUFJLE1BQUEsQ0FBQSxRQUFPLEVBQUksRUFDWCxDQUFDLEtBQUksQ0FBRSxDQUFBLENBQUMsRUFBSSxDQUFBLFFBQU8sQ0FBRSxDQUFBLENBQUMsRUFBSSxNQUFJLENBQUEsQ0FBRSxFQUFBLENBQUcsQ0FBQSxLQUFJLENBQUUsQ0FBQSxDQUFDLEVBQUksQ0FBQSxRQUFPLENBQUUsQ0FBQSxDQUFDLEVBQUksTUFBSSxDQUFBLENBQUUsRUFBQSxDQUFDLENBQ25FLEVBQUMsRUFBQyxDQUFFLENBQUEsQ0FBQyxFQUFJLENBQUEsUUFBTyxDQUFFLENBQUEs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Q0FBQyxDQUFFLENBQUEsQ0FBQyxDQUFHLENBQUEsQ0FBQSxFQUFJLE1BQUksQ0FBRyxFQUFBLENBQUcsRUFBQSxDQUFHLEVBQUEsQ0FBRyxFQUFBLENBQUcsSUFBRSxDQUFHLEVBQUEsQ0FDNUQsQ0FBQSxRQUFPLENBQUUsQ0FBQSxDQUFDLENBQUUsQ0FBQSxDQUFDLENBQUcsQ0FBQSxRQUFPLENBQUUsQ0FBQSxDQUFDLENBQUUsQ0FBQSxDQUFDLENBQUcsQ0FBQSxDQUFBLEVBQUksTUFBSSxDQUFHLEVBQUEsQ0FBRyxFQUFBLENBQUcsRUFBQSxDQUFHLEVBQUEsQ0FBRyxJQUFFLENBQUcsRUFBQSxDQUU1RCxDQUFBLFFBQU8sQ0FBRSxDQUFBLENBQUMsQ0FBRSxDQUFBLENBQUMsQ0FBRyxDQUFBLFFBQU8sQ0FBRSxDQUFBLENBQUMsQ0FBRSxDQUFBLENBQUMsQ0FBRyxDQUFBLENBQUEsRUFBSSxNQUFJLENBQUcsRUFBQSxDQUFHLEVBQUEsQ0FBRyxFQUFBLENBQUcsRUFBQSxDQUFHLElBQUUsQ0FBRyxFQUFBLENBQzVELENBQUEsUUFBTyxDQUFFLENBQUEsQ0FBQyxDQUFFLENBQUEsQ0FBQyxDQUFHLENBQUEsUUFBTyxDQUFFLENBQUEsQ0FBQyxDQUFFLENBQUEsQ0FBQyxDQUFHLENBQUEsQ0FBQSxFQUFJLE1BQUksQ0FBRyxFQUFBLENBQUcsRUFBQSxDQUFHLEVBQUEsQ0FBRyxFQUFBLENBQUcsSUFBRSxDQUFHLEVBQUEsQ0FFNUQsQ0FBQSxRQUFPLENBQUUsQ0FBQSxDQUFDLENBQUUsQ0FBQSxDQUFDLENBQUcsQ0FBQSxRQUFPLENBQUUsQ0FBQSxDQUFDLENBQUUsQ0FBQSxDQUFDLENBQUcsQ0FBQSxDQUFBLEVBQUksTUFBSSxDQUFHLEVBQUEsQ0FBRyxFQUFBLENBQUcsRUFBQSxDQUFHLEVBQUEsQ0FBRyxJQUFFLENBQUcsRUFBQSxDQUM1RCxDQUFBLFFBQU8sQ0FBRSxDQUFBLENBQUMsQ0FBRSxDQUFBLENBQUMsQ0FBRyxDQUFBLFFBQU8sQ0FBRSxDQUFBLENBQUMsQ0FBRSxDQUFBLENBQUMsQ0FBRyxDQUFBLENBQUEsRUFBSSxNQUFJLENBQUcsRUFBQSxDQUFHLEVBQUEsQ0FBRyxFQUFBLENBQUcsRUFBQSxDQUFHLElBQUUsQ0FBRyxFQUFBLENBRTVELENBQUEsUUFBTyxDQUFFLENBQUEsQ0FBQyxDQUFFLENBQUEsQ0FBQyxDQUFHLENBQUEsUUFBTyxDQUFFLENBQUEsQ0FBQyxDQUFFLENBQUEsQ0FBQyxDQUFHLENBQUEsQ0FBQSxFQUFJLE1BQUksQ0FBRyxFQUFBLENBQUcsRUFBQSxDQUFHLEVBQUEsQ0FBRyxFQUFBLENBQUcsSUFBRSxDQUFHLEVBQUEsQ0FDNUQsQ0FBQSxRQUFPLENBQUUsQ0FBQSxDQUFDLENBQUUsQ0FBQSxDQUFDLENBQUcsQ0FBQSxRQUFPLENBQUUsQ0FBQSxDQUFDLENBQUUsQ0FBQSxDQUFDLENBQUcsQ0FBQSxDQUFBLEVBQUksTUFBSSxDQUFHLEVBQUEsQ0FBRyxFQUFBLENBQUcsRUFBQSxDQUFHLEVBQUEsQ0FBRyxJQUFFLENBQUcsRUFBQSxDQUU1RCxDQUFBLFFBQU8sQ0FBRSxDQUFBLENBQUMsQ0FBRSxDQUFBLENBQUMsQ0FBRyxDQUFBLFFBQU8sQ0FBRSxDQUFBLENBQUMsQ0FBRSxDQUFBLENBQUMsQ0FBRyxDQUFBLENBQUEsRUFBSSxNQUFJLENBQUcsRUFBQSxDQUFHLEVBQUEsQ0FBRyxFQUFBLENBQUcsRUFBQSxDQUFHLElBQUUsQ0FBRyxFQUFBLENBQzVELENBQUEsUUFBTyxDQUFFLENBQUEsQ0FBQyxDQUFFLENBQUEsQ0FBQyxDQUFHLENBQUEsUUFBTyxDQUFFLENBQUEsQ0FBQyxDQUFFLENBQUEsQ0FBQyxDQUFHLENBQUEsQ0FBQSxFQUFJLE1BQUksQ0FBRyxFQUFBLENBQUcsRUFBQSxDQUFHLEVBQUEsQ0FBRyxFQUFBLENBQUcsSUFBRSxDQUFHLEVBQUEsQ0FFNUQsQ0FBQSxRQUFPLENBQUUsQ0FBQSxDQUFDLENBQUUsQ0FBQSxDQUFDLENBQUcsQ0FBQSxRQUFPLENBQUUsQ0FBQSxDQUFDLENBQUUsQ0FBQSxDQUFDLENBQUcsQ0FBQSxDQUFBLEVBQUksTUFBSSxDQUFHLEVBQUEsQ0FBRyxFQUFBLENBQUcsRUFBQSxDQUFHLEVBQUEsQ0FBRyxJQUFFLENBQUcsRUFBQSxDQUM1RCxDQUFBLFFBQU8sQ0FBRSxDQUFBLENBQUMsQ0FBRSxDQUFBLENBQUMsQ0FBRyxDQUFBLFFBQU8sQ0FBRSxDQUFBLENBQUMsQ0FBRSxDQUFBLENBQUMsQ0FBRyxDQUFBLENBQUEsRUFBSSxNQUFJLENBQUcsRUFBQSxDQUFHLEVBQUEsQ0FBRyxFQUFBLENBQUcsRUFBQSxDQUFHLElBQUUsQ0FBRyxFQUFBLENBRTVELENBQUEsUUFBTyxDQUFFLENBQUEsQ0FBQyxDQUFFLENBQUEsQ0FBQyxDQUFHLENBQUEsUUFBTyxDQUFFLENBQUEsQ0FBQyxDQUFFLENBQUEsQ0FBQyxDQUFHLENBQUEsQ0FBQSxFQUFJLE1BQUksQ0FBRyxFQUFBLENBQUcsRUFBQSxDQUFHLEVBQUEsQ0FBRyxFQUFBLENBQUcsSUFBRSxDQUFHLEVBQUEsQ0FDNUQsQ0FBQSxRQUFPLENBQUUsQ0FBQSxDQUFDLENBQUUsQ0FBQSxDQUFDLENBQUcsQ0FBQSxRQUFPLENBQUUsQ0FBQSxDQUFDLENBQUUsQ0FBQSxDQUFDLENBQUcsQ0FBQSxDQUFBLEVBQUksTUFBSSxDQUFHLEVBQUEsQ0FBRyxFQUFBLENBQUcsRUFBQSxDQUFHLEVBQUEsQ0FBRyxJQUFFLENBQUcsRUFBQSxDQUU1RCxDQUFBLFFBQU8sQ0FBRSxDQUFBLENBQUMsQ0FBRSxDQUFBLENBQUMsQ0FBRyxDQUFBLFFBQU8sQ0FBRSxDQUFBLENBQUMsQ0FBRSxDQUFBLENBQUMsQ0FBRyxDQUFBLENBQUEsRUFBSSxNQUFJLENBQUcsRUFBQSxDQUFHLEVBQUEsQ0FBRyxFQUFBLENBQUcsRUFBQSxDQUFHLElBQUUsQ0FBRyxFQUFBLENBQzVELENBQUEsUUFBTyxDQUFFLENBQUEsQ0FBQyxDQUFFLENBQUEsQ0FBQyxDQUFHLENBQUEsUUFBTyxDQUFFLENBQUEsQ0FBQyxDQUFFLENBQUEsQ0FBQyxDQUFHLENBQUEsQ0FBQSxFQUFJLE1BQUksQ0FBRyxFQUFBLENBQUcsRUFBQSxDQUFHLEVBQUEsQ0FBRyxFQUFBLENBQUcsSUFBRSxDQUFHLEVBQUEsQ0FDaEUsQ0FBQztJQUNMO0FBQUEsQUFFQSxPQUFJLFVBQVMsTUFBTSxHQUFLLFdBQVMsQ0FBQSxFQUFLLENBQUEsT0FBTSxhQUFhLENBQUc7QUFDeEQsQUFBSSxRQUFBLENBQUEsTUFBSyxDQUFDO0FBQ1YsU0FBSSxVQUFTLEdBQUssV0FBUyxDQUFHO0FBRTFCLGFBQUssRUFBSSxFQUFDLENBQUEsQ0FBRyxFQUFBLENBQUcsRUFBQSxDQUFDLENBQUM7TUFDdEIsS0FDSyxLQUFJLFVBQVMsR0FBSyxXQUFTLENBQUc7QUFFL0IsYUFBSyxFQUFJLEVBQUMsQ0FBQSxDQUFHLEVBQUEsQ0FBRyxFQUFBLENBQUMsQ0FBQztNQUN0QjtBQUFBLEFBSUEsWUFBTSxhQUFhLEtBQUssQUFBQyxDQUNyQixFQUFDLENBQUUsQ0FBQSxDQUFDLENBQUcsQ0FBQSxFQUFDLENBQUUsQ0FBQSxDQUFDLENBQUcsQ0FBQSxDQUFBLEVBQUksTUFBSSxDQUN0QixFQUFBLENBQUcsRUFBQSxDQUFHLEVBQUEsQ0FBRyxDQUFBLE1BQUssQ0FBRSxDQUFBLENBQUMsQ0FBRyxDQUFBLE1BQUssQ0FBRSxDQUFBLENBQUMsQ0FBRyxDQUFBLE1BQUssQ0FBRSxDQUFBLENBQUMsQ0FDdkMsQ0FBQSxLQUFJLENBQUUsQ0FBQSxDQUFDLENBQUcsQ0FBQSxLQUFJLENBQUUsQ0FBQSxDQUFDLENBQUcsQ0FBQSxDQUFBLEVBQUksTUFBSSxDQUM1QixFQUFBLENBQUcsRUFBQSxDQUFHLEVBQUEsQ0FBRyxDQUFBLE1BQUssQ0FBRSxDQUFBLENBQUMsQ0FBRyxDQUFBLE1BQUssQ0FBRSxDQUFBLENBQUMsQ0FBRyxDQUFBLE1BQUssQ0FBRSxDQUFBLENBQUMsQ0FDdkMsQ0FBQSxLQUFJLENBQUUsQ0FBQSxDQUFDLENBQUcsQ0FBQSxLQUFJLENBQUUsQ0FBQSxDQUFDLENBQUcsQ0FBQSxDQUFBLEVBQUksTUFBSSxDQUM1QixFQUFBLENBQUcsRUFBQSxDQUFHLEVBQUEsQ0FB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LENBQUEsTUFBSyxDQUFFLENBQUEsQ0FBQyxDQUFDO0FBRXJCLEFBQUksTUFBQSxDQUFBLFNBQVEsRUFBSSxFQUNaLENBQUMsS0FBSSxDQUFFLENBQUEsQ0FBQyxFQUFJLENBQUEsS0FBSSxFQUFFLEVBQUEsQ0FBRyxDQUFBLEtBQUksQ0FBRSxDQUFBLENBQUMsRUFBSSxDQUFBLE1BQUssRUFBRSxFQUFBLENBQUMsQ0FDeEMsRUFBQyxLQUFJLENBQUUsQ0FBQSxDQUFDLEVBQUksQ0FBQSxLQUFJLEVBQUUsRUFBQSxDQUFHLENBQUEsS0FBSSxDQUFFLENBQUEsQ0FBQyxFQUFJLENBQUEsTUFBSyxFQUFFLEVBQUEsQ0FBQyxDQUN4QyxFQUFDLEtBQUksQ0FBRSxDQUFBLENBQUMsRUFBSSxDQUFBLEtBQUksRUFBRSxFQUFBLENBQUcsQ0FBQSxLQUFJLENBQUUsQ0FBQSxDQUFDLEVBQUksQ0FBQSxNQUFLLEVBQUUsRUFBQSxDQUFDLENBRXhDLEVBQUMsS0FBSSxDQUFFLENBQUEsQ0FBQyxFQUFJLENBQUEsS0FBSSxFQUFFLEVBQUEsQ0FBRyxDQUFBLEtBQUksQ0FBRSxDQUFBLENBQUMsRUFBSSxDQUFBLE1BQUssRUFBRSxFQUFBLENBQUMsQ0FDeEMsRUFBQyxLQUFJLENBQUUsQ0FBQSxDQUFDLEVBQUksQ0FBQSxLQUFJLEVBQUUsRUFBQSxDQUFHLENBQUEsS0FBSSxDQUFFLENBQUEsQ0FBQyxFQUFJLENBQUEsTUFBSyxFQUFFLEVBQUEsQ0FBQyxDQUN4QyxFQUFDLEtBQUksQ0FBRSxDQUFBLENBQUMsRUFBSSxDQUFBLEtBQUksRUFBRSxFQUFBLENBQUcsQ0FBQSxLQUFJLENBQUUsQ0FBQSxDQUFDLEVBQUksQ0FBQSxNQUFLLEVBQUUsRUFBQSxDQUFDLENBQzVDLENBQUM7QUFHRCxPQUFJLENBQUEsR0FBSyxLQUFHLENBQUc7QUFDWCxjQUFRLENBQUUsQ0FBQSxDQUFDLENBQUUsQ0FBQSxDQUFDLEVBQUksRUFBQSxDQUFDO0FBQ25CLGNBQVEsQ0FBRSxDQUFBLENBQUMsQ0FBRSxDQUFBLENBQUMsRUFBSSxF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RUFBSSxVQUFTLEFBQUMsQ0FDbEQ7QUFDSSxBQUFJLElBQUEsQ0FBQSxHQUFFLEVBQUksQ0FBQSxLQUFJLEFBQUMsQ0FBQyxDQUFBLENBQUcsRUFBQSxDQUFDLENBQUM7QUFDckIsQUFBSSxJQUFBLENBQUEsR0FBRSxFQUFJLENBQUEsS0FBSSxBQUFDLENBQUMsSUFBRyxDQUFHLEtBQUcsQ0FBQyxDQUFDO0FBQzNCLEFBQUksSUFBQSxDQUFBLENBQUEsRUFBSTtBQUNKLEtBQUMsQ0FBRyxJQUFFO0FBQ04sV0FBTyxDQUFHO0FBQ04sU0FBRyxDQUFHLGFBQVc7QUFDakIsZ0JBQVUsQ0FBRyxFQUNULENBQUMsR0FBRSxFQUFFLEVBQUksS0FBRyxDQUFBLENBQUksQ0FBQSxHQUFFLEVBQUUsRUFBSSxLQUFHLENBQUcsQ0FBQSxHQUFFLEVBQUUsRUFBSSxLQUFHLENBQUEsQ0FBSSxDQUFBLEdBQUUsRUFBRSxFQUFJLEtBQUcsQ0FBQyxDQUN6RCxFQUFDLEdBQUUsRUFBRSxFQUFJLEtBQUcsQ0FBQSxDQUFJLENBQUEsR0FBRSxFQUFFLEVBQUksS0FBRyxDQUFHLENBQUEsR0FBRSxFQUFFLEVBQUksSUFBRSxDQUFBLENBQUksQ0FBQSxHQUFFLEVBQUUsRUFBSSxJQUFFLENBQUMsQ0FDdkQsRUFBQyxHQUFFLEVBQUUsRUFBSSxLQUFHLENBQUEsQ0FBSSxDQUFBLEdBQUUsRUFBRSxFQUFJLEtBQUcsQ0FBRyxDQUFBLEdBQUUsRUFBRSxFQUFJLEtBQUcsQ0FBQSxDQUFJLENBQUEsR0FBRSxFQUFFLEVBQUksS0FBRyxDQUFDLENBQ3pELEVBQUMsR0FBRSxFQUFFLEVBQUksS0FBRyxDQUFBLENBQUksQ0FBQSxHQUFFLEVBQUUsRUFBSSxLQUFHLENBQUcsQ0FBQSxHQUFFLEVBQUUsRUFBSSxLQUFHLENBQUEsQ0FBSSxDQUFBLEdBQUUsRUFBRSxFQUFJLEtBQUcsQ0FBQyxDQUN6RCxFQUFDLEdBQUUsRUFBRSxFQUFJLElBQUUsQ0FBQSxDQUFJLENBQUEsR0FBRSxFQUFFLEVBQUksSUFBRSxDQUFHLENBQUEsR0FBRSxF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QUMsSUFBRyxDQUFHLElBQUUsQ0FBQyxDQUFDO0lBQ3ZCO0FBQUEsQUFDQSxVQUFNO0VBQ1Y7QUFBQSxBQUVJLElBQUEsQ0FBQSxJQUFHLEVBQUksQ0FBQSxJQUFHLE1BQU0sQ0FBRSxHQUFFLENBQUMsRUFBSSxHQUFDLENBQUM7QUFDL0IsS0FBRyxJQUFJLEVBQUksSUFBRSxDQUFDO0FBQ2QsS0FBRyxPQUFPLEVBQUksT0FBSyxDQUFDO0FBQ3BCLEtBQUcsSUFBSSxFQUFJLENBQUEsR0FBRSxjQUFjLEFBQUMsQ0FBQyxJQUFHLE9BQU8sQ0FBQyxDQUFDO0FBQ3pDLEtBQUcsSUFBSSxFQUFJLENBQUEsR0FBRSxjQUFjLEFBQUMsQ0FBQztBQUFFLElBQUEsQ0FBRyxDQUFBLElBQUcsT0FBTyxFQUFFLEVBQUksRUFBQTtBQUFHLElBQUEsQ0FBRyxDQUFBLElBQUcsT0FBTyxFQUFFLEVBQUksRUFBQTtBQUFHLElBQUEsQ0FBRyxDQUFBLElBQUcsT0FBTyxFQUFFO0FBQUEsRUFBRSxDQUFDLENBQUM7QUFDOUYsS0FBRyxLQUFLLEVBQUk7QUFBRSxJQUFBLENBQUcsRUFBQyxJQUFHLElBQUksRUFBRSxFQUFJLENBQUEsSUFBRyxJQUFJLEVBQUUsQ0FBQztBQUFHLElBQUEsQ0FBRyxFQUFDLElBQUcsSUFBSSxFQUFFLEVBQUksQ0FBQSxJQUFHLElBQUksRUFBRSxDQUFDO0FBQUEsRUFBRSxDQUFDO0FBQzFFLEtBQUcsT0FBTyxFQUFJO0FBQUUsS0FBQyxDQUFHO0FBQUUsTUFBQSxDQUFHLENBQUEsSUFBRyxJQUFJLEVBQUU7QUFBRyxNQUFBLENBQUcsQ0FBQSxJQUFHLElBQUksRUFBRTtBQUFBLElBQUU7QUFBRyxLQUFDLENBQUc7QUFBRSxNQUFBLENBQUcsQ0FBQSxJQUFHLElBQUksRUFBRTtBQUFHLE1BQUEsQ0FBRyxDQUFBLElBQUcsSUFBSSxFQUFFO0FBQUEsSUFBRTtBQUFBLEVBQUUsQ0FBQztBQUM1RixLQUFHLE1BQU0sRUFBSSxHQUFDLENBQUM7QUFDZixLQUFHLFFBQVEsRUFBSSxLQUFHLENBQUM7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QUM7QUFDckM7QUFBQTs7O0FDM0ZBOzs7Ozs7O0FBQU8sQUFBSSxFQUFBLENBQUEsTUFBSyxFQUFJLEdBQUMsQ0FBQztBQUd0QixLQUFLLFNBQVMsRUFBSSxVQUFVLENBQUEsQ0FDNUI7QUFDSSxLQUFJLENBQUEsT0FBTyxHQUFLLEVBQUEsQ0FBRztBQUNmLFNBQU8sRUFBQyxDQUFBLENBQUUsQ0FBQSxDQUFDLEVBQUUsQ0FBQSxDQUFBLENBQUUsQ0FBQSxDQUFDLENBQUEsQ0FBSSxDQUFBLENBQUEsQ0FBRSxDQUFBLENBQUMsRUFBRSxDQUFBLENBQUEsQ0FBRSxDQUFBLENBQUMsQ0FBQyxDQUFDO0VBQ2xDLEtBQ0s7QUFDRCxTQUFPLEVBQUMsQ0FBQSxDQUFFLENBQUEsQ0FBQyxFQUFFLENBQUEsQ0FBQSxDQUFFLENBQUEsQ0FBQyxDQUFBLENBQUksQ0FBQSxDQUFBLENBQUUsQ0FBQSxDQUFDLEVBQUUsQ0FBQSxDQUFBLENBQUUsQ0FBQSxDQUFDLENBQUEsQ0FBSSxDQUFBLENBQUEsQ0FBRSxDQUFBLENBQUMsRUFBRSxDQUFBLENBQUEsQ0FBRSxDQUFBLENBQUMsQ0FBQyxDQUFDO0VBQzlDO0FBQUEsQUFDSixDQUFDO0FBR0QsS0FBSyxPQUFPLEVBQUksVUFBVSxDQUFBLENBQzFCO0FBQ0ksT0FBTyxDQUFBLElBQUcsS0FBSyxBQUFDLENBQUMsTUFBSyxTQUFTLEFBQUMsQ0FBQyxDQUFBLENBQUMsQ0FBQyxDQUFDO0FBQ3hDLENBQUM7QUFHRCxLQUFLLFVBQVUsRUFBSSxVQUFVLENBQUEsQ0FDN0I7QUFDSSxBQUFJLElBQUEsQ0FBQSxDQUFBLENBQUM7QUFDTCxLQUFJLENBQUEsT0FBTyxHQUFLLEVBQUEsQ0FBRztBQUNmLElBQUEsRUFBSSxDQUFBLENBQUEsQ0FBRSxDQUFBLENBQUMsRUFBRSxDQUFBLENBQUEsQ0FBRSxDQUFBLENBQUMsQ0FBQSxDQUFJLENBQUEsQ0FBQSxDQUFFLENBQUEsQ0FBQyxFQUFFLENBQUEsQ0FBQSxDQUFFLENBQUEsQ0FBQyxDQUFDO0FBQ3pCLElBQUEsRUFBSSxDQUFBLElBQUcsS0FBSyxBQUFDLENBQUMsQ0FBQSxDQUFDLENBQUM7QUFFaEIsT0FBSSxDQUFBLEdBQUssRUFBQSxDQUFHO0FBQ1IsV0FBTyxFQUFDLENBQUEsQ0FBRSxDQUFBLENBQUMsRUFBSSxFQUFBLENBQUcsQ0FBQSxDQUFBLENBQUUsQ0FBQSxDQUFDLEVBQUksRUFBQSxDQUFDLENBQUM7SUFDL0I7QUFBQSxBQUNBLFNBQU8sRUFBQyxDQUFBLENBQUcsRUFBQSxDQUFDLENBQUM7RUFDakIsS0FDSztBQUNELEFBQUksTUFBQSxDQUFBLENBQUEsRUFBSSxDQUFBLENBQUEsQ0FBRSxDQUFBLENBQUMsRUFBRSxDQUFBLENBQUEsQ0FBRSxDQUFBLENBQUMsQ0FBQSxDQUFJLENBQUEsQ0FBQSxDQUFFLENBQUEsQ0FBQyxFQUFFLENBQUEsQ0FBQSxDQUFFLENBQUEsQ0FBQyxDQUFBLENBQUksQ0FBQSxDQUFBLENBQUUsQ0FBQSxDQUFDLEVBQUUsQ0FBQSxDQUFBLENBQUUsQ0FBQSxDQUFDLENBQUM7QUFDekMsSUFBQSxFQUFJLENBQUEsSUFBRyxLQUFLLEFBQUMsQ0FBQyxDQUFBLENBQUMsQ0FBQztBQUVoQixPQUFJLENBQUEsR0FBSyxFQUFBLENBQUc7QUFDUixXQUFPLEVBQUMsQ0FBQSxDQUFFLENBQUEsQ0FBQyxFQUFJLEVBQUEsQ0FBRyxDQUFBLENBQUEsQ0FBRSxDQUFBLENBQUMsRUFBSSxFQUFBLENBQUcsQ0FBQSxDQUFBLENBQUUsQ0FBQSxDQUFDLEVBQUksRUFBQSxDQUFDLENBQUM7SUFDekM7QUFBQSxBQUNBLFNBQU8sRUFBQyxDQUFBLENBQUcsRUFBQSxDQUFHLEVBQUEsQ0FBQyxDQUFDO0VBQ3BCO0FBQUEsQUFDSixDQUFDO0FBR0QsS0FBSyxNQUFNLEVBQUssVUFBVSxFQUFDLENBQUcsQ0FBQSxFQUFDLENBQy9CO0FBQ0ksT0FBTyxFQUNILENBQUMsRUFBQyxDQUFFLENBQUEsQ0FBQyxFQUFJLENBQUEsRUFBQyxDQUFFLENBQUEsQ0FBQyxDQUFDLEVBQUksRUFBQyxFQUFDLENBQUUsQ0FBQSxDQUFDLEVBQUksQ0FBQSxFQUFDLENBQUUsQ0FBQSxDQUFDLENBQUMsQ0FDaEMsQ0FBQSxDQUFDLEVBQUMsQ0FBRSxDQUFBLENBQUMsRUFBSSxDQUFBLEVBQUMsQ0FBRSxDQUFBLENBQUMsQ0FBQyxFQUFJLEVBQUMsRUFBQyxDQUFFLENBQUEsQ0FBQyxFQUFJLENBQUEsRUFBQyxDQUFFLENBQUEsQ0FBQyxDQUFDLENBQ2hDLENBQUEsQ0FBQyxFQUFDLENBQUUsQ0FBQSxDQUFDLEVBQUksQ0FBQSxFQUFDLENBQUUsQ0FBQSxDQUFDLENBQUMsRUFBSSxFQUFDLEVBQUMsQ0FBRSxDQUFBLENBQUMsRUFBSSxDQUFBLEVBQUMsQ0FBRSxDQUFBLENBQUMsQ0FBQyxDQUNwQyxDQUFDO0FBQ0wsQ0FBQztBQUtELEtBQUssaUJBQWlCLEVBQUksVUFBVSxFQUFDLENBQUcsQ0FBQSxFQUFDLENBQUcsQ0FBQSxFQUFDLENBQUcsQ0FBQSxFQUFDLENBQUcsQ0FBQSxrQkFBaUIsQ0FDckU7QUFDSSxBQUFJLElBQUEsQ0FBQSxrQkFBaUIsRUFBSSxDQUFBLGtCQUFpQixHQUFLLEtBQUcsQ0FBQztBQUluRCxBQUFJLElBQUEsQ0FBQSxFQUFDLEVBQUksQ0FBQSxFQUFDLENBQUUsQ0FBQSxDQUFDLEVBQUksQ0FBQSxFQUFDLENBQUUsQ0FBQSxDQUFDLENBQUM7QUFDdEIsQUFBSSxJQUFBLENBQUEsRUFBQyxFQUFJLENBQUEsRUFBQyxDQUFFLENBQUEsQ0FBQyxFQUFJLENBQUEsRUFBQyxDQUFFLENBQUEsQ0FBQyxDQUFDO0FBQ3RCLEFBQUksSUFBQSxDQUFBLEVBQUMsRUFBSSxDQUFBLEVBQUMsQ0FBRSxDQUFBLENBQUMsRUFBSSxDQUFBLEVBQUMsQ0FBRSxDQUFBLENBQUMsQ0FBQztBQUN0QixBQUFJLElBQUEsQ0FBQSxFQUFDLEVBQUksQ0FBQSxFQUFDLENBQUUsQ0FBQSxDQUFDLEVBQUksQ0FBQSxFQUFDLENBQUUsQ0FBQSxDQUFDLENBQUM7QUFDdEIsQUFBSSxJQUFBLENBQUEsRUFBQyxFQUFJLENBQUEsQ0FBQyxFQUFDLENBQUUsQ0FBQSxDQUFDLEVBQUksQ0FBQSxFQUFDLENBQUUsQ0FBQSxDQUFDLENBQUMsRUFBSSxFQUFDLEVBQUMsQ0FBRSxDQUFBLENBQUMsRUFBSSxDQUFBLEVBQUMsQ0FBRSxDQUFBLENBQUMsQ0FBQyxDQUFDO0FBQzFDLEFBQUksSUFBQSxDQUFBLEVBQUMsRUFBSSxDQUFBLENBQUMsRUFBQyxDQUFFLENBQUEsQ0FBQyxFQUFJLENBQUEsRUFBQyxDQUFFLENBQUEsQ0FBQyxDQUFDLEVBQUksRUFBQyxFQUFDLENBQUUsQ0FBQSxDQUFDLEVBQUksQ0FBQSxFQUFDLENBQUUsQ0FBQSxDQUFDLENBQUMsQ0FBQztBQUMxQyxBQUFJLElBQUEsQ0FBQSxLQUFJLEVBQUksQ0FBQSxDQUFDLEVBQUMsRUFBSSxHQUFDLENBQUMsRUFBSSxFQUFDLEVBQUMsRUFBSSxHQUFDLENBQUMsQ0FBQztBQUVqQyxLQUFJLElBQUcsSUFBSSxBQUFDLENBQUMsS0FBSSxDQUFDLENBQUEsQ0FBSSxtQkFBaUIsQ0FBRztBQUN0QyxTQUFPLEVBQ0gsQ0FBQyxDQUFDLEVBQUMsRUFBSSxHQUFDLENBQUMsRUFBSSxFQUFDLEVBQUMsRUFBSSxHQUFDLENBQUMsQ0FBQyxFQUFJLE1BQUksQ0FDOUIsQ0FBQSxDQUFDLENBQUMsRUFBQyxFQUFJLEdBQUMsQ0FBQyxFQUFJLEVBQUMsRUFBQyxFQUFJLEdBQUMsQ0FBQyxDQUFDLEVBQUksTUFBSSxDQUNsQyxDQUFDO0VBQ0w7QUFBQSxBQUNBLE9BQU8sS0FBRyxDQUFDO0FBQ2YsQ0FBQztBQUNEIiwiZmlsZSI6ImdlbmVyYXRlZC5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzQ29udGVudCI6WyIoZnVuY3Rpb24gZSh0LG4scil7ZnVuY3Rpb24gcyhvLHUpe2lmKCFuW29dKXtpZighdFtvXSl7dmFyIGE9dHlwZW9mIHJlcXVpcmU9PVwiZnVuY3Rpb25cIiYmcmVxdWlyZTtpZighdSYmYSlyZXR1cm4gYShvLCEwKTtpZihpKXJldHVybiBpKG8sITApO3Rocm93IG5ldyBFcnJvcihcIkNhbm5vdCBmaW5kIG1vZHVsZSAnXCIrbytcIidcIil9dmFyIGY9bltvXT17ZXhwb3J0czp7fX07dFtvXVswXS5jYWxsKGYuZXhwb3J0cyxmdW5jdGlvbihlKXt2YXIgbj10W29dWzFdW2VdO3JldHVybiBzKG4/bjplKX0sZixmLmV4cG9ydHMsZSx0LG4scil9cmV0dXJuIG5bb10uZXhwb3J0c312YXIgaT10eXBlb2YgcmVxdWlyZT09XCJmdW5jdGlvblwiJiZyZXF1aXJlO2Zvcih2YXIgbz0wO288ci5sZW5ndGg7bysrKXMocltvXSk7cmV0dXJuIHN9KSIsIi8qKlxuICogQGZpbGVvdmVydmlldyBnbC1tYXRyaXggLSBIaWdoIHBlcmZvcm1hbmNlIG1hdHJpeCBhbmQgdmVjdG9yIG9wZXJhdGlvbnNcbiAqIEBhdXRob3IgQnJhbmRvbiBKb25lc1xuICogQGF1dGhvciBDb2xpbiBNYWNLZW56aWUgSVZcbiAqIEB2ZXJzaW9uIDIuMS4wXG4gKi9cblxuLyogQ29weXJpZ2h0IChjKSAyMDEzLCBCcmFuZG9uIEpvbmVzLCBDb2xpbiBNYWNLZW56aWUgSVYuIEFsbCByaWdodHMgcmVzZXJ2ZWQuXG5cblJlZGlzdHJpYnV0aW9uIGFuZCB1c2UgaW4gc291cmNlIGFuZCBiaW5hcnkgZm9ybXMsIHdpdGggb3Igd2l0aG91dCBtb2RpZmljYXRpb24sXG5hcmUgcGVybWl0dGVkIHByb3ZpZGVkIHRoYXQgdGhlIGZvbGxvd2luZyBjb25kaXRpb25zIGFyZSBtZXQ6XG5cbiAgKiBSZWRpc3RyaWJ1dGlvbnMgb2Ygc291cmNlIGNvZGUgbXVzdCByZXRhaW4gdGhlIGFib3ZlIGNvcHlyaWdodCBub3RpY2UsIHRoaXNcbiAgICBsaXN0IG9mIGNvbmRpdGlvbnMgYW5kIHRoZSBmb2xsb3dpbmcgZGlzY2xhaW1lci5cbiAgKiBSZWRpc3RyaWJ1dGlvbnMgaW4gYmluYXJ5IGZvcm0gbXVzdCByZXByb2R1Y2UgdGhlIGFib3ZlIGNvcHlyaWdodCBub3RpY2UsXG4gICAgdGhpcyBsaXN0IG9mIGNvbmRpdGlvbnMgYW5kIHRoZSBmb2xsb3dpbmcgZGlzY2xhaW1lciBpbiB0aGUgZG9jdW1lbnRhdGlvbiBcbiAgICBhbmQvb3Igb3RoZXIgbWF0ZXJpYWxzIHByb3ZpZGVkIHdpdGggdGhlIGRpc3RyaWJ1dGlvbi5cblxuVEhJUyBTT0ZUV0FSRSBJUyBQUk9WSURFRCBCWSBUSEUgQ09QWVJJR0hUIEhPTERFUlMgQU5EIENPTlRSSUJVVE9SUyBcIkFTIElTXCIgQU5EXG5BTlkgRVhQUkVTUyBPUiBJTVBMSUVEIFdBUlJBTlRJRVMsIElOQ0xVRElORywgQlVUIE5PVCBMSU1JVEVEIFRPLCBUSEUgSU1QTElFRFxuV0FSUkFOVElFUyBPRiBNRVJDSEFOVEFCSUxJVFkgQU5EIEZJVE5FU1MgRk9SIEEgUEFSVElDVUxBUiBQVVJQT1NFIEFSRSBcbkRJU0NMQUlNRUQuIElOIE5PIEVWRU5UIFNIQUxMIFRIRSBDT1BZUklHSFQgSE9MREVSIE9SIENPTlRSSUJVVE9SUyBCRSBMSUFCTEUgRk9SXG5BTlkgRElSRUNULCBJTkRJUkVDVCwgSU5DSURFTlRBTCwgU1BFQ0lBTCwgRVhFTVBMQVJZLCBPUiBDT05TRVFVRU5USUFMIERBTUFHRVNcbihJTkNMVURJTkcsIEJVVCBOT1QgTElNSVRFRCBUTywgUFJPQ1VSRU1FTlQgT0YgU1VCU1RJVFVURSBHT09EUyBPUiBTRVJWSUNFUztcbkxPU1MgT0YgVVNFLCBEQVRBLCBPUiBQUk9GSVRTOyBPUiBCVVNJTkVTUyBJTlRFUlJVUFRJT04pIEhPV0VWRVIgQ0FVU0VEIEFORCBPTlxuQU5ZIFRIRU9SWSBPRiBMSUFCSUxJVFksIFdIRVRIRVIgSU4gQ09OVFJBQ1QsIFNUUklDVCBMSUFCSUxJVFksIE9SIFRPUlRcbihJTkNMVURJTkcgTkVHTElHRU5DRSBPUiBPVEhFUldJU0UpIEFSSVNJTkcgSU4gQU5ZIFdBWSBPVVQgT0YgVEhFIFVTRSBPRiBUSElTXG5TT0ZUV0FSRSwgRVZFTiBJRiBBRFZJU0VEIE9GIFRIRSBQT1NTSUJJTElUWSBPRiBTVUNIIERBTUFHRS4gKi9cblxuXG4oZnVuY3Rpb24oKSB7XG4gIFwidXNlIHN0cmljdFwiO1xuXG4gIHZhciBzaGltID0ge307XG4gIGlmICh0eXBlb2YoZXhwb3J0cykgPT09ICd1bmRlZmluZWQnKSB7XG4gICAgaWYodHlwZW9mIGRlZmluZSA9PSAnZnVuY3Rpb24nICYmIHR5cGVvZiBkZWZpbmUuYW1kID09ICdvYmplY3QnICYmIGRlZmluZS5hbWQpIHtcbiAgICAgIHNoaW0uZXhwb3J0cyA9IHt9O1xuICAgICAgZGVmaW5lKGZ1bmN0aW9uKCkge1xuICAgICAgICByZXR1cm4gc2hpbS5leHBvcnRzO1xuICAgICAgfSk7XG4gICAgfSBlbHNlIHtcbiAgICAgIC8vIGdsLW1hdHJpeCBsaXZlcyBpbiBhIGJyb3dzZXIsIGRlZmluZSBpdHMgbmFtZXNwYWNlcyBpbiBnbG9iYWxcbiAgICAgIHNoaW0uZXhwb3J0cyA9IHdpbmRvdztcbiAgICB9ICAgIFxuICB9XG4gIGVsc2Uge1xuICAgIC8vIGdsLW1hdHJpeCBsaXZlcyBpbiBjb21tb25qcywgZGVmaW5lIGl0cyBuYW1lc3BhY2VzIGluIGV4cG9ydHNcbiAgICBzaGltLmV4cG9ydHMgPSBleHBvcnRzO1xuICB9XG5cbiAgKGZ1bmN0aW9uKGV4cG9ydHMpIHtcbiAgICAvKiBDb3B5cmlnaHQgKGMpIDIwMTMsIEJyYW5kb24gSm9uZXMsIENvbGluIE1hY0tlbnppZSBJVi4gQWxsIHJpZ2h0cyByZXNlcnZlZC5cblxuUmVkaXN0cmlidXRpb24gYW5kIHVzZSBpbiBzb3VyY2UgYW5kIGJpbmFyeSBmb3Jtcywgd2l0aCBvciB3aXRob3V0IG1vZGlmaWNhdGlvbixcbmFyZSBwZXJtaXR0ZWQgcHJvdmlkZWQgdGhhdCB0aGUgZm9sbG93aW5nIGNvbmRpdGlvbnMgYXJlIG1ldDpcblxuICAqIFJlZGlzdHJpYnV0aW9ucyBvZiBzb3VyY2UgY29kZSBtdXN0IHJldGFpbiB0aGUgYWJvdmUgY29weXJpZ2h0IG5vdGljZSwgdGhpc1xuICAgIGxpc3Qgb2YgY29uZGl0aW9ucyBhbmQgdGhlIGZvbGxvd2luZyBkaXNjbGFpbWVyLlxuICAqIFJlZGlzdHJpYnV0aW9ucyBpbiBiaW5hcnkgZm9ybSBtdXN0IHJlcHJvZHVjZSB0aGUgYWJvdmUgY29weXJpZ2h0IG5vdGljZSxcbiAgICB0aGlzIGxpc3Qgb2YgY29uZGl0aW9ucyBhbmQgdGhlIGZvbGxvd2luZyBkaXNjbGFpbWVyIGluIHRoZSBkb2N1bWVudGF0aW9uIFxuICAgIGFuZC9vciBvdGhlciBtYXRlcmlhbHMgcHJvdmlkZWQgd2l0aCB0aGUgZGlzdHJpYnV0aW9uLlxuXG5USElTIFNPRlRXQVJFIElTIFBST1ZJREVEIEJZIFRIRSBDT1BZUklHSFQgSE9MREVSUyBBTkQgQ09OVFJJQlVUT1JTIFwiQVMgSVNcIiBBTkRcbkFOWSBFWFBSRVNTIE9SIElNUExJRUQgV0FSUkFOVElFUywgSU5DTFVESU5HLCBCVVQgTk9UIExJTUlURUQgVE8sIFRIRSBJTVBMSUVEXG5XQVJSQU5USUVTIE9GIE1FUkNIQU5UQUJJTElUWSBBTkQgRklUTkVTUyBGT1IgQSBQQVJUSUNVTEFSIFBVUlBPU0UgQVJFIFxuRElTQ0xBSU1FRC4gSU4gTk8gRVZFTlQgU0hBTEwgVEhFIENPUFlSSUdIVCBIT0xERVIgT1IgQ09OVFJJQlVUT1JTIEJFIExJQUJMRSBGT1JcbkFOWSBESVJFQ1QsIElORElSRUNULCBJTkNJREVOVEFMLCBTUEVDSUFMLCBFWEVNUExBUlksIE9SIENPTlNFUVVFTlRJQUwgREFNQUdFU1xuKElOQ0xVRElORywgQlVUIE5PVCBMSU1JVEVEIFRPLCBQUk9DVVJFTUVOVCBPRiBTVUJTVElUVVRFIEdPT0RTIE9SIFNFUlZJQ0VTO1xuTE9TUyBPRiBVU0UsIERBVEEsIE9SIFBST0ZJVFM7IE9SIEJVU0lORVNTIElOVEVSUlVQVElPTikgSE9XRVZFUiBDQVVTRUQgQU5EIE9OXG5BTlkgVEhFT1JZIE9GIExJQUJJTElUWSwgV0hFVEhFUiBJTiBDT05UUkFDVCwgU1RSSUNUIExJQUJJTElUWSwgT1IgVE9SVFxuKElOQ0xVRElORyBORUdMSUdFTkNFIE9SIE9USEVSV0lTRSkgQVJJU0lORyBJTiBBTlkgV0FZIE9VVCBPRiBUSEUgVVNFIE9GIFRISVNcblNPRlRXQVJFLCBFVkVOIElGIEFEVklTRUQgT0YgVEhFIFBPU1NJQklMSVRZIE9GIFNVQ0ggREFNQUdFLiAqL1xuXG5cbmlmKCFHTE1BVF9FUFNJTE9OKSB7XG4gICAgdmFyIEdMTUFUX0VQU0lMT04gPSAwLjAwMDAwMTtcbn1cblxuaWYoIUdMTUFUX0FSUkFZX1RZUEUpIHtcbiAgICB2YXIgR0xNQVRfQVJSQVlfVFlQRSA9ICh0eXBlb2YgRmxvYXQzMkFycmF5ICE9PSAndW5kZWZpbmVkJykgPyBGbG9hdDMyQXJyYXkgOiBBcnJheTtcbn1cblxuLyoqXG4gKiBAY2xhc3MgQ29tbW9uIHV0aWxpdGllc1xuICogQG5hbWUgZ2xNYXRyaXhcbiAqL1xudmFyIGdsTWF0cml4ID0ge307XG5cbi8qKlxuICogU2V0cyB0aGUgdHlwZSBvZiBhcnJheSB1c2VkIHdoZW4gY3JlYXRpbmcgbmV3IHZlY3RvcnMgYW5kIG1hdHJpY2llc1xuICpcbiAqIEBwYXJhbSB7VHlwZX0gdHlwZSBBcnJheSB0eXBlLCBzdWNoIGFzIEZsb2F0MzJBcnJheSBvciBBcnJheVxuICovXG5nbE1hdHJpeC5zZXRNYXRyaXhBcnJheVR5cGUgPSBmdW5jdGlvbih0eXBlKSB7XG4gICAgR0xNQVRfQVJSQVlfVFlQRSA9IHR5cGU7XG59XG5cbmlmKHR5cGVvZihleHBvcnRzKSAhPT0gJ3VuZGVmaW5lZCcpIHtcbiAgICBleHBvcnRzLmdsTWF0cml4ID0gZ2xNYXRyaXg7XG59XG47XG4vKiBDb3B5cmlnaHQgKGMpIDIwMTMsIEJyYW5kb24gSm9uZXMsIENvbGluIE1hY0tlbnppZSBJVi4gQWxsIHJpZ2h0cyByZXNlcnZlZC5cblxuUmVkaXN0cmlidXRpb24gYW5kIHVzZSBpbiBzb3VyY2UgYW5kIGJpbmFyeSBmb3Jtcywgd2l0aCBvciB3aXRob3V0IG1vZGlmaWNhdGlvbixcbmFyZSBwZXJtaXR0ZWQgcHJvdmlkZWQgdGhhdCB0aGUgZm9sbG93aW5nIGNvbmRpdGlvbnMgYXJlIG1ldDpcblxuICAqIFJlZGlzdHJpYnV0aW9ucyBvZiBzb3VyY2UgY29kZSBtdXN0IHJldGFpbiB0aGUgYWJvdmUgY29weXJpZ2h0IG5vdGljZSwgdGhpc1xuICAgIGxpc3Qgb2YgY29uZGl0aW9ucyBhbmQgdGhlIGZvbGxvd2luZyBkaXNjbGFpbWVyLlxuICAqIFJlZGlzdHJpYnV0aW9ucyBpbiBiaW5hcnkgZm9ybSBtdXN0IHJlcHJvZHVjZSB0aGUgYWJvdmUgY29weXJpZ2h0IG5vdGljZSxcbiAgICB0aGlzIGxpc3Qgb2YgY29uZGl0aW9ucyBhbmQgdGhlIGZvbGxvd2luZyBkaXNjbGFpbWVyIGluIHRoZSBkb2N1bWVudGF0aW9uIFxuICAgIGFuZC9vciBvdGhlciBtYXRlcmlhbHMgcHJvdmlkZWQgd2l0aCB0aGUgZGlzdHJpYnV0aW9uLlxuXG5USElTIFNPRlRXQVJFIElTIFBST1ZJREVEIEJZIFRIRSBDT1BZUklHSFQgSE9MREVSUyBBTkQgQ09OVFJJQlVUT1JTIFwiQVMgSVNcIiBBTkRcbkFOWSBFWFBSRVNTIE9SIElNUExJRUQgV0FSUkFOVElFUywgSU5DTFVESU5HLCBCVVQgTk9UIExJTUlURUQgVE8sIFRIRSBJTVBMSUVEXG5XQVJSQU5USUVTIE9GIE1FUkNIQU5UQUJJTElUWSBBTkQgRklUTkVTUyBGT1IgQSBQQVJUSUNVTEFSIFBVUlBPU0UgQVJFIFxuRElTQ0xBSU1FRC4gSU4gTk8gRVZFTlQgU0hBTEwgVEhFIENPUFlSSUdIVCBIT0xERVIgT1IgQ09OVFJJQlVUT1JTIEJFIExJQUJMRSBGT1JcbkFOWSBESVJFQ1QsIElORElSRUNULCBJTkNJREVOVEFMLCBTUEVDSUFMLCBFWEVNUExBUlksIE9SIENPTlNFUVVFTlRJQUwgREFNQUdFU1xuKElOQ0xVRElORywgQlVUIE5PVCBMSU1JVEVEIFRPLCBQUk9DVVJFTUVOVCBPRiBTVUJTVElUVVRFIEdPT0RTIE9SIFNFUlZJQ0VTO1xuTE9TUyBPRiBVU0UsIERBVEEsIE9SIFBST0ZJVFM7IE9SIEJVU0lORVNTIElOVEVSUlVQVElPTikgSE9XRVZFUiBDQVVTRUQgQU5EIE9OXG5BTlkgVEhFT1JZIE9GIExJQUJJTElUWSwgV0hFVEhFUiBJTiBDT05UUkFDVCwgU1RSSUNUIExJQUJJTElUWSwgT1IgVE9SVFxuKElOQ0xVRElORyBORUdMSUdFTkNFIE9SIE9USEVSV0lTRSkgQVJJU0lORyBJTiBBTlkgV0FZIE9VVCBPRiBUSEUgVVNFIE9GIFRISVNcblNPRlRXQVJFLCBFVkVOIElGIEFEVklTRUQgT0YgVEhFIFBPU1NJQklMSVRZIE9GIFNVQ0ggREFNQUdFLiAqL1xuXG4vKipcbiAqIEBjbGFzcyAyIERpbWVuc2lvbmFsIFZlY3RvclxuICogQG5hbWUgdmVjMlxuICovXG5cbnZhciB2ZWMyID0ge307XG5cbi8qKlxuICogQ3JlYXRlcyBhIG5ldywgZW1wdHkgdmVjMlxuICpcbiAqIEByZXR1cm5zIHt2ZWMyfSBhIG5ldyAyRCB2ZWN0b3JcbiAqL1xudmVjMi5jcmVhdGUgPSBmdW5jdGlvbigpIHtcbiAgICB2YXIgb3V0ID0gbmV3IEdMTUFUX0FSUkFZX1RZUEUoMik7XG4gICAgb3V0WzBdID0gMDtcbiAgICBvdXRbMV0gPSAwO1xuICAgIHJldHVybiBvdXQ7XG59O1xuXG4vKipcbiAqIENyZWF0ZXMgYSBuZXcgdmVjMiBpbml0aWFsaXplZCB3aXRoIHZhbHVlcyBmcm9tIGFuIGV4aXN0aW5nIHZlY3RvclxuICpcbiAqIEBwYXJhbSB7dmVjMn0gYSB2ZWN0b3IgdG8gY2xvbmVcbiAqIEByZXR1cm5zIHt2ZWMyfSBhIG5ldyAyRCB2ZWN0b3JcbiAqL1xudmVjMi5jbG9uZSA9IGZ1bmN0aW9uKGEpIHtcbiAgICB2YXIgb3V0ID0gbmV3IEdMTUFUX0FSUkFZX1RZUEUoMik7XG4gICAgb3V0WzBdID0gYVswXTtcbiAgICBvdXRbMV0gPSBhWzFdO1xuICAgIHJldHVybiBvdXQ7XG59O1xuXG4vKipcbiAqIENyZWF0ZXMgYSBuZXcgdmVjMiBpbml0aWFsaXplZCB3aXRoIHRoZSBnaXZlbiB2YWx1ZXNcbiAqXG4gKiBAcGFyYW0ge051bWJlcn0geCBYIGNvbXBvbmVudFxuICogQHBhcmFtIHtOdW1iZXJ9IHkgWSBjb21wb25lbnRcbiAqIEByZXR1cm5zIHt2ZWMyfSBhIG5ldyAyRCB2ZWN0b3JcbiAqL1xudmVjMi5mcm9tVmFsdWVzID0gZnVuY3Rpb24oeCwgeSkge1xuICAgIHZhciBvdXQgPSBuZXcgR0xNQVRfQVJSQVlfVFlQRSgyKTtcbiAgICBvdXRbMF0gPSB4O1xuICAgIG91dFsxXSA9IHk7XG4gICAgcmV0dXJuIG91dDtcbn07XG5cbi8qKlxuICogQ29weSB0aGUgdmFsdWVzIGZyb20gb25lIHZlYzIgdG8gYW5vdGhlclxuICpcbiAqIEBwYXJhbSB7dmVjMn0gb3V0IHRoZSByZWNlaXZpbmcgdmVjdG9yXG4gKiBAcGFyYW0ge3ZlYzJ9IGEgdGhlIHNvdXJjZSB2ZWN0b3JcbiAqIEByZXR1cm5zIHt2ZWMyfSBvdXRcbiAqL1xudmVjMi5jb3B5ID0gZnVuY3Rpb24ob3V0LCBhKSB7XG4gICAgb3V0WzBdID0gYVswXTtcbiAgICBvdXRbMV0gPSBhWzFdO1xuICAgIHJldHVybiBvdXQ7XG59O1xuXG4vKipcbiAqIFNldCB0aGUgY29tcG9uZW50cyBvZiBhIHZlYzIgdG8gdGhlIGdpdmVuIHZhbHVlc1xuICpcbiAqIEBwYXJhbSB7dmVjMn0gb3V0IHRoZSByZWNlaXZpbmcgdmVjdG9yXG4gKiBAcGFyYW0ge051bWJlcn0geCBYIGNvbXBvbmVudFxuICogQHBhcmFtIHtOdW1iZXJ9IHkgWSBjb21wb25lbnRcbiAqIEByZXR1cm5zIHt2ZWMyfSBvdXRcbiAqL1xudmVjMi5zZXQgPSBmdW5jdGlvbihvdXQsIHgsIHkpIHtcbiAgICBvdXRbMF0gPSB4O1xuICAgIG91dFsxXSA9IHk7XG4gICAgcmV0dXJuIG91dDtcbn07XG5cbi8qKlxuICogQWRkcyB0d28gdmVjMidzXG4gKlxuICogQHBhcmFtIHt2ZWMyfSBvdXQgdGhlIHJlY2VpdmluZyB2ZWN0b3JcbiAqIEBwYXJhbSB7dmVjMn0gYSB0aGUgZmlyc3Qgb3BlcmFuZFxuICogQHBhcmFtIHt2ZWMyfSBiIHRoZSBzZWNvbmQgb3BlcmFuZFxuICogQHJldHVybnMge3ZlYzJ9IG91dFxuICovXG52ZWMyLmFkZCA9IGZ1bmN0aW9uKG91dCwgYSwgYikge1xuICAgIG91dFswXSA9IGFbMF0gKyBiWzBdO1xuICAgIG91dFsxXSA9IGFbMV0gKyBiWzFdO1xuICAgIHJldHVybiBvdXQ7XG59O1xuXG4vKipcbiAqIFN1YnRyYWN0cyB0d28gdmVjMidzXG4gKlxuICogQHBhcmFtIHt2ZWMyfSBvdXQgdGhlIHJlY2VpdmluZyB2ZWN0b3JcbiAqIEBwYXJhbSB7dmVjMn0gYSB0aGUgZmlyc3Qgb3BlcmFuZFxuICogQHBhcmFtIHt2ZWMyfSBiIHRoZSBzZWNvbmQgb3BlcmFuZFxuICogQHJldHVybnMge3ZlYzJ9IG91dFxuICovXG52ZWMyLnN1YnRyYWN0ID0gZnVuY3Rpb24ob3V0LCBhLCBiKSB7XG4gICAgb3V0WzBdID0gYVswXSAtIGJbMF07XG4gICAgb3V0WzFdID0gYVsxXSAtIGJbMV07XG4gICAgcmV0dXJuIG91dDtcbn07XG5cbi8qKlxuICogQWxpYXMgZm9yIHtAbGluayB2ZWMyLnN1YnRyYWN0fVxuICogQGZ1bmN0aW9uXG4gKi9cbnZlYzIuc3ViID0gdmVjMi5zdWJ0cmFjdDtcblxuLyoqXG4gKiBNdWx0aXBsaWVzIHR3byB2ZWMyJ3NcbiAqXG4gKiBAcGFyYW0ge3ZlYzJ9IG91dCB0aGUgcmVjZWl2aW5nIHZlY3RvclxuICogQHBhcmFtIHt2ZWMyfSBhIHRoZSBmaXJzdCBvcGVyYW5kXG4gKiBAcGFyYW0ge3ZlYzJ9IGIgdGhlIHNlY29uZCBvcGVyYW5kXG4gKiBAcmV0dXJucyB7dmVjMn0gb3V0XG4gKi9cbnZlYzIubXVsdGlwbHkgPSBmdW5jdGlvbihvdXQsIGEsIGIpIHtcbiAgICBvdXRbMF0gPSBhWzBdICogYlswXTtcbiAgICBvdXRbMV0gPSBhWzFdICogYlsxXTtcbiAgICByZXR1cm4gb3V0O1xufTtcblxuLyoqXG4gKiBBbGlhcyBmb3Ige0BsaW5rIHZlYzIubXVsdGlwbHl9XG4gKiBAZnVuY3Rpb25cbiAqL1xudmVjMi5tdWwgPSB2ZWMyLm11bHRpcGx5O1xuXG4vKipcbiAqIERpdmlkZXMgdHdvIHZlYzInc1xuICpcbiAqIEBwYXJhbSB7dmVjMn0gb3V0IHRoZSByZWNlaXZpbmcgdmVjdG9yXG4gKiBAcGFyYW0ge3ZlYzJ9IGEgdGhlIGZpcnN0IG9wZXJhbmRcbiAqIEBwYXJhbSB7dmVjMn0gYiB0aGUgc2Vjb25kIG9wZXJhbmRcbiAqIEByZXR1cm5zIHt2ZWMyfSBvdXRcbiAqL1xudmVjMi5kaXZpZGUgPSBmdW5jdGlvbihvdXQsIGEsIGIpIHtcbiAgICBvdXRbMF0gPSBhWzBdIC8gYlswXTtcbiAgICBvdXRbMV0gPSBhWzFdIC8gYlsxXTtcbiAgICByZXR1cm4gb3V0O1xufTtcblxuLyoqXG4gKiBBbGlhcyBmb3Ige0BsaW5rIHZlYzIuZGl2aWRlfVxuICogQGZ1bmN0aW9uXG4gKi9cbnZlYzIuZGl2ID0gdmVjMi5kaXZpZGU7XG5cbi8qKlxuICogUmV0dXJucyB0aGUgbWluaW11bSBvZiB0d28gdmVjMidzXG4gKlxuICogQHBhcmFtIHt2ZWMyfSBvdXQgdGhlIHJlY2VpdmluZyB2ZWN0b3JcbiAqIEBwYXJhbSB7dmVjMn0gYSB0aGUgZmlyc3Qgb3BlcmFuZFxuICogQHBhcmFtIHt2ZWMyfSBiIHRoZSBzZWNvbmQgb3BlcmFuZFxuICogQHJldHVybnMge3ZlYzJ9IG91dFxuICovXG52ZWMyLm1pbiA9IGZ1bmN0aW9uKG91dCwgYSwgYikge1xuICAgIG91dFswXSA9IE1hdGgubWluKGFbMF0sIGJbMF0pO1xuICAgIG91dFsxXSA9IE1hdGgubWluKGFbMV0sIGJbMV0pO1xuICAgIHJldHVybiBvdXQ7XG59O1xuXG4vKipcbiAqIFJldHVybnMgdGhlIG1heGltdW0gb2YgdHdvIHZlYzInc1xuICpcbiAqIEBwYXJhbSB7dmVjMn0gb3V0IHRoZSByZWNlaXZpbmcgdmVjdG9yXG4gKiBAcGFyYW0ge3ZlYzJ9IGEgdGhlIGZpcnN0IG9wZXJhbmRcbiAqIEBwYXJhbSB7dmVjMn0gYiB0aGUgc2Vjb25kIG9wZXJhbmRcbiAqIEByZXR1cm5zIHt2ZWMyfSBvdXRcbiAqL1xudmVjMi5tYXggPSBmdW5jdGlvbihvdXQsIGEsIGIpIHtcbiAgICBvdXRbMF0gPSBNYXRoLm1heChhWzBdLCBiWzBdKTtcbiAgICBvdXRbMV0gPSBNYXRoLm1heChhWzFdLCBiWzFdKTtcbiAgICByZXR1cm4gb3V0O1xufTtcblxuLyoqXG4gKiBTY2FsZXMgYSB2ZWMyIGJ5IGEgc2NhbGFyIG51bWJlclxuICpcbiAqIEBwYXJhbSB7dmVjMn0gb3V0IHRoZSByZWNlaXZpbmcgdmVjdG9yXG4gKiBAcGFyYW0ge3ZlYzJ9IGEgdGhlIHZlY3RvciB0byBzY2FsZVxuICogQHBhcmFtIHtOdW1iZXJ9IGIgYW1vdW50IHRvIHNjYWxlIHRoZSB2ZWN0b3IgYnlcbiAqIEByZXR1cm5zIHt2ZWMyfSBvdXRcbiAqL1xudmVjMi5zY2FsZSA9IGZ1bmN0aW9uKG91dCwgYSwgYikge1xuICAgIG91dFswXSA9IGFbMF0gKiBiO1xuICAgIG91dFsxXSA9IGFbMV0gKiBiO1xuICAgIHJldHVybiBvdXQ7XG59O1xuXG4vKipcbiAqIENhbGN1bGF0ZXMgdGhlIGV1Y2xpZGlhbiBkaXN0YW5jZSBiZXR3ZWVuIHR3byB2ZWMyJ3NcbiAqXG4gKiBAcGFyYW0ge3ZlYzJ9IGEgdGhlIGZpcnN0IG9wZXJhbmRcbiAqIEBwYXJhbSB7dmVjMn0gYiB0aGUgc2Vjb25kIG9wZXJhbmRcbiAqIEByZXR1cm5zIHtOdW1iZXJ9IGRpc3RhbmNlIGJldHdlZW4gYSBhbmQgYlxuICovXG52ZWMyLmRpc3RhbmNlID0gZnVuY3Rpb24oYSwgYikge1xuICAgIHZhciB4ID0gYlswXSAtIGFbMF0sXG4gICAgICAgIHkgPSBiWzFdIC0gYVsxXTtcbiAgICByZXR1cm4gTWF0aC5zcXJ0KHgqeCArIHkqeSk7XG59O1xuXG4vKipcbiAqIEFsaWFzIGZvciB7QGxpbmsgdmVjMi5kaXN0YW5jZX1cbiAqIEBmdW5jdGlvblxuICovXG52ZWMyLmRpc3QgPSB2ZWMyLmRpc3RhbmNlO1xuXG4vKipcbiAqIENhbGN1bGF0ZXMgdGhlIHNxdWFyZWQgZXVjbGlkaWFuIGRpc3RhbmNlIGJldHdlZW4gdHdvIHZlYzInc1xuICpcbiAqIEBwYXJhbSB7dmVjMn0gYSB0aGUgZmlyc3Qgb3BlcmFuZFxuICogQHBhcmFtIHt2ZWMyfSBiIHRoZSBzZWNvbmQgb3BlcmFuZFxuICogQHJldHVybnMge051bWJlcn0gc3F1YXJlZCBkaXN0YW5jZSBiZXR3ZWVuIGEgYW5kIGJcbiAqL1xudmVjMi5zcXVhcmVkRGlzdGFuY2UgPSBmdW5jdGlvbihhLCBiKSB7XG4gICAgdmFyIHggPSBiWzBdIC0gYVswXSxcbiAgICAgICAgeSA9IGJbMV0gLSBhWzFdO1xuICAgIHJldHVybiB4KnggKyB5Knk7XG59O1xuXG4vKipcbiAqIEFsaWFzIGZvciB7QGxpbmsgdmVjMi5zcXVhcmVkRGlzdGFuY2V9XG4gKiBAZnVuY3Rpb25cbiAqL1xudmVjMi5zcXJEaXN0ID0gdmVjMi5zcXVhcmVkRGlzdGFuY2U7XG5cbi8qKlxuICogQ2FsY3VsYXRlcyB0aGUgbGVuZ3RoIG9mIGEgdmVjMlxuICpcbiAqIEBwYXJhbSB7dmVjMn0gYSB2ZWN0b3IgdG8gY2FsY3VsYXRlIGxlbmd0aCBvZlxuICogQHJldHVybnMge051bWJlcn0gbGVuZ3RoIG9mIGFcbiAqL1xudmVjMi5sZW5ndGggPSBmdW5jdGlvbiAoYSkge1xuICAgIHZhciB4ID0gYVswXSxcbiAgICAgICAgeSA9IGFbMV07XG4gICAgcmV0dXJuIE1hdGguc3FydCh4KnggKyB5KnkpO1xufTtcblxuLyoqXG4gKiBBbGlhcyBmb3Ige0BsaW5rIHZlYzIubGVuZ3RofVxuICogQGZ1bmN0aW9uXG4gKi9cbnZlYzIubGVuID0gdmVjMi5sZW5ndGg7XG5cbi8qKlxuICogQ2FsY3VsYXRlcyB0aGUgc3F1YXJlZCBsZW5ndGggb2YgYSB2ZWMyXG4gKlxuICogQHBhcmFtIHt2ZWMyfSBhIHZlY3RvciB0byBjYWxjdWxhdGUgc3F1YXJlZCBsZW5ndGggb2ZcbiAqIEByZXR1cm5zIHtOdW1iZXJ9IHNxdWFyZWQgbGVuZ3RoIG9mIGFcbiAqL1xudmVjMi5zcXVhcmVkTGVuZ3RoID0gZnVuY3Rpb24gKGEpIHtcbiAgICB2YXIgeCA9IGFbMF0sXG4gICAgICAgIHkgPSBhWzFdO1xuICAgIHJldHVybiB4KnggKyB5Knk7XG59O1xuXG4vKipcbiAqIEFsaWFzIGZvciB7QGxpbmsgdmVjMi5zcXVhcmVkTGVuZ3RofVxuICogQGZ1bmN0aW9uXG4gKi9cbnZlYzIuc3FyTGVuID0gdmVjMi5zcXVhcmVkTGVuZ3RoO1xuXG4vKipcbiAqIE5lZ2F0ZXMgdGhlIGNvbXBvbmVudHMgb2YgYSB2ZWMyXG4gKlxuICogQHBhcmFtIHt2ZWMyfSBvdXQgdGhlIHJlY2VpdmluZyB2ZWN0b3JcbiAqIEBwYXJhbSB7dmVjMn0gYSB2ZWN0b3IgdG8gbmVnYXRlXG4gKiBAcmV0dXJucyB7dmVjMn0gb3V0XG4gKi9cbnZlYzIubmVnYXRlID0gZnVuY3Rpb24ob3V0LCBhKSB7XG4gICAgb3V0WzBdID0gLWFbMF07XG4gICAgb3V0WzFdID0gLWFbMV07XG4gICAgcmV0dXJuIG91dDtcbn07XG5cbi8qKlxuICogTm9ybWFsaXplIGEgdmVjMlxuICpcbiAqIEBwYXJhbSB7dmVjMn0gb3V0IHRoZSByZWNlaXZpbmcgdmVjdG9yXG4gKiBAcGFyYW0ge3ZlYzJ9IGEgdmVjdG9yIHRvIG5vcm1hbGl6ZVxuICogQHJldHVybnMge3ZlYzJ9IG91dFxuICovXG52ZWMyLm5vcm1hbGl6ZSA9IGZ1bmN0aW9uKG91dCwgYSkge1xuICAgIHZhciB4ID0gYVswXSxcbiAgICAgICAgeSA9IGFbMV07XG4gICAgdmFyIGxlbiA9IHgqeCArIHkqeTtcbiAgICBpZiAobGVuID4gMCkge1xuICAgICAgICAvL1RPRE86IGV2YWx1YXRlIHVzZSBvZiBnbG1faW52c3FydCBoZXJlP1xuICAgICAgICBsZW4gPSAxIC8gTWF0aC5zcXJ0KGxlbik7XG4gICAgICAgIG91dFswXSA9IGFbMF0gKiBsZW47XG4gICAgICAgIG91dFsxXSA9IGFbMV0gKiBsZW47XG4gICAgfVxuICAgIHJldHVybiBvdXQ7XG59O1xuXG4vKipcbiAqIENhbGN1bGF0ZXMgdGhlIGRvdCBwcm9kdWN0IG9mIHR3byB2ZWMyJ3NcbiAqXG4gKiBAcGFyYW0ge3ZlYzJ9IGEgdGhlIGZpcnN0IG9wZXJhbmRcbiAqIEBwYXJhbSB7dmVjMn0gYiB0aGUgc2Vjb25kIG9wZXJhbmRcbiAqIEByZXR1cm5zIHtOdW1iZXJ9IGRvdCBwcm9kdWN0IG9mIGEgYW5kIGJcbiAqL1xudmVjMi5kb3QgPSBmdW5jdGlvbiAoYSwgYikge1xuICAgIHJldHVybiBhWzBdICogYlswXSArIGFbMV0gKiBiWzFdO1xufTtcblxuLyoqXG4gKiBDb21wdXRlcyB0aGUgY3Jvc3MgcHJvZHVjdCBvZiB0d28gdmVjMidzXG4gKiBOb3RlIHRoYXQgdGhlIGNyb3NzIHByb2R1Y3QgbXVzdCBieSBkZWZpbml0aW9uIHByb2R1Y2UgYSAzRCB2ZWN0b3JcbiAqXG4gKiBAcGFyYW0ge3ZlYzN9IG91dCB0aGUgcmVjZWl2aW5nIHZlY3RvclxuICogQHBhcmFtIHt2ZWMyfSBhIHRoZSBmaXJzdCBvcGVyYW5kXG4gKiBAcGFyYW0ge3ZlYzJ9IGIgdGhlIHNlY29uZCBvcGVyYW5kXG4gKiBAcmV0dXJucyB7dmVjM30gb3V0XG4gKi9cbnZlYzIuY3Jvc3MgPSBmdW5jdGlvbihvdXQsIGEsIGIpIHtcbiAgICB2YXIgeiA9IGFbMF0gKiBiWzFdIC0gYVsxXSAqIGJbMF07XG4gICAgb3V0WzBdID0gb3V0WzFdID0gMDtcbiAgICBvdXRbMl0gPSB6O1xuICAgIHJldHVybiBvdXQ7XG59O1xuXG4vKipcbiAqIFBlcmZvcm1zIGEgbGluZWFyIGludGVycG9sYXRpb24gYmV0d2VlbiB0d28gdmVjMidzXG4gKlxuICogQHBhcmFtIHt2ZWMyfSBvdXQgdGhlIHJlY2VpdmluZyB2ZWN0b3JcbiAqIEBwYXJhbSB7dmVjMn0gYSB0aGUgZmlyc3Qgb3BlcmFuZFxuICogQHBhcmFtIHt2ZWMyfSBiIHRoZSBzZWNvbmQgb3BlcmFuZFxuICogQHBhcmFtIHtOdW1iZXJ9IHQgaW50ZXJwb2xhdGlvbiBhbW91bnQgYmV0d2VlbiB0aGUgdHdvIGlucHV0c1xuICogQHJldHVybnMge3ZlYzJ9IG91dFxuICovXG52ZWMyLmxlcnAgPSBmdW5jdGlvbiAob3V0LCBhLCBiLCB0KSB7XG4gICAgdmFyIGF4ID0gYVswXSxcbiAgICAgICAgYXkgPSBhWzFdO1xuICAgIG91dFswXSA9IGF4ICsgdCAqIChiWzBdIC0gYXgpO1xuICAgIG91dFsxXSA9IGF5ICsgdCAqIChiWzFdIC0gYXkpO1xuICAgIHJldHVybiBvdXQ7XG59O1xuXG4vKipcbiAqIFRyYW5zZm9ybXMgdGhlIHZlYzIgd2l0aCBhIG1hdDJcbiAqXG4gKiBAcGFyYW0ge3ZlYzJ9IG91dCB0aGUgcmVjZWl2aW5nIHZlY3RvclxuICogQHBhcmFtIHt2ZWMyfSBhIHRoZSB2ZWN0b3IgdG8gdHJhbnNmb3JtXG4gKiBAcGFyYW0ge21hdDJ9IG0gbWF0cml4IHRvIHRyYW5zZm9ybSB3aXRoXG4gKiBAcmV0dXJucyB7dmVjMn0gb3V0XG4gKi9cbnZlYzIudHJhbnNmb3JtTWF0MiA9IGZ1bmN0aW9uKG91dCwgYSwgbSkge1xuICAgIHZhciB4ID0gYVswXSxcbiAgICAgICAgeSA9IGFbMV07XG4gICAgb3V0WzBdID0gbVswXSAqIHggKyBtWzJdICogeTtcbiAgICBvdXRbMV0gPSBtWzFdICogeCArIG1bM10gKiB5O1xuICAgIHJldHVybiBvdXQ7XG59O1xuXG4vKipcbiAqIFRyYW5zZm9ybXMgdGhlIHZlYzIgd2l0aCBhIG1hdDJkXG4gKlxuICogQHBhcmFtIHt2ZWMyfSBvdXQgdGhlIHJlY2VpdmluZyB2ZWN0b3JcbiAqIEBwYXJhbSB7dmVjMn0gYSB0aGUgdmVjdG9yIHRvIHRyYW5zZm9ybVxuICogQHBhcmFtIHttYXQyZH0gbSBtYXRyaXggdG8gdHJhbnNmb3JtIHdpdGhcbiAqIEByZXR1cm5zIHt2ZWMyfSBvdXRcbiAqL1xudmVjMi50cmFuc2Zvcm1NYXQyZCA9IGZ1bmN0aW9uKG91dCwgYSwgbSkge1xuICAgIHZhciB4ID0gYVswXSxcbiAgICAgICAgeSA9IGFbMV07XG4gICAgb3V0WzBdID0gbVswXSAqIHggKyBtWzJdICogeSArIG1bNF07XG4gICAgb3V0WzFdID0gbVsxXSAqIHggKyBtWzNdICogeSArIG1bNV07XG4gICAgcmV0dXJuIG91dDtcbn07XG5cbi8qKlxuICogVHJhbnNmb3JtcyB0aGUgdmVjMiB3aXRoIGEgbWF0M1xuICogM3JkIHZlY3RvciBjb21wb25lbnQgaXMgaW1wbGljaXRseSAnMSdcbiAqXG4gKiBAcGFyYW0ge3ZlYzJ9IG91dCB0aGUgcmVjZWl2aW5nIHZlY3RvclxuICogQHBhcmFtIHt2ZWMyfSBhIHRoZSB2ZWN0b3IgdG8gdHJhbnNmb3JtXG4gKiBAcGFyYW0ge21hdDN9IG0gbWF0cml4IHRvIHRyYW5zZm9ybSB3aXRoXG4gKiBAcmV0dXJucyB7dmVjMn0gb3V0XG4gKi9cbnZlYzIudHJhbnNmb3JtTWF0MyA9IGZ1bmN0aW9uKG91dCwgYSwgbSkge1xuICAgIHZhciB4ID0gYVswXSxcbiAgICAgICAgeSA9IGFbMV07XG4gICAgb3V0WzBdID0gbVswXSAqIHggKyBtWzNdICogeSArIG1bNl07XG4gICAgb3V0WzFdID0gbVsxXSAqIHggKyBtWzRdICogeSArIG1bN107XG4gICAgcmV0dXJuIG91dDtcbn07XG5cbi8qKlxuICogVHJhbnNmb3JtcyB0aGUgdmVjMiB3aXRoIGEgbWF0NFxuICogM3JkIHZlY3RvciBjb21wb25lbnQgaXMgaW1wbGljaXRseSAnMCdcbiAqIDR0aCB2ZWN0b3IgY29tcG9uZW50IGlzIGltcGxpY2l0bHkgJzEnXG4gKlxuICogQHBhcmFtIHt2ZWMyfSBvdXQgdGhlIHJlY2VpdmluZyB2ZWN0b3JcbiAqIEBwYXJhbSB7dmVjMn0gYSB0aGUgdmVjdG9yIHRvIHRyYW5zZm9ybVxuICogQHBhcmFtIHttYXQ0fSBtIG1hdHJpeCB0byB0cmFuc2Zvcm0gd2l0aFxuICogQHJldHVybnMge3ZlYzJ9IG91dFxuICovXG52ZWMyLnRyYW5zZm9ybU1hdDQgPSBmdW5jdGlvbihvdXQsIGEsIG0pIHtcbiAgICB2YXIgeCA9IGFbMF0sIFxuICAgICAgICB5ID0gYVsxXTtcbiAgICBvdXRbMF0gPSBtWzBdICogeCArIG1bNF0gKiB5ICsgbVsxMl07XG4gICAgb3V0WzFdID0gbVsxXSAqIHggKyBtWzVdICogeSArIG1bMTNdO1xuICAgIHJldHVybiBvdXQ7XG59O1xuXG4vKipcbiAqIFBlcmZvcm0gc29tZSBvcGVyYXRpb24gb3ZlciBhbiBhcnJheSBvZiB2ZWMycy5cbiAqXG4gKiBAcGFyYW0ge0FycmF5fSBhIHRoZSBhcnJheSBvZiB2ZWN0b3JzIHRvIGl0ZXJhdGUgb3ZlclxuICogQHBhcmFtIHtOdW1iZXJ9IHN0cmlkZSBOdW1iZXIgb2YgZWxlbWVudHMgYmV0d2VlbiB0aGUgc3RhcnQgb2YgZWFjaCB2ZWMyLiBJZiAwIGFzc3VtZXMgdGlnaHRseSBwYWNrZWRcbiAqIEBwYXJhbSB7TnVtYmVyfSBvZmZzZXQgTnVtYmVyIG9mIGVsZW1lbnRzIHRvIHNraXAgYXQgdGhlIGJlZ2lubmluZyBvZiB0aGUgYXJyYXlcbiAqIEBwYXJhbSB7TnVtYmVyfSBjb3VudCBOdW1iZXIgb2YgdmVjMnMgdG8gaXRlcmF0ZSBvdmVyLiBJZiAwIGl0ZXJhdGVzIG92ZXIgZW50aXJlIGFycmF5XG4gKiBAcGFyYW0ge0Z1bmN0aW9ufSBmbiBGdW5jdGlvbiB0byBjYWxsIGZvciBlYWNoIHZlY3RvciBpbiB0aGUgYXJyYXlcbiAqIEBwYXJhbSB7T2JqZWN0fSBbYXJnXSBhZGRpdGlvbmFsIGFyZ3VtZW50IHRvIHBhc3MgdG8gZm5cbiAqIEByZXR1cm5zIHtBcnJheX0gYVxuICogQGZ1bmN0aW9uXG4gKi9cbnZlYzIuZm9yRWFjaCA9IChmdW5jdGlvbigpIHtcbiAgICB2YXIgdmVjID0gdmVjMi5jcmVhdGUoKTtcblxuICAgIHJldHVybiBmdW5jdGlvbihhLCBzdHJpZGUsIG9mZnNldCwgY291bnQsIGZuLCBhcmcpIHtcbiAgICAgICAgdmFyIGksIGw7XG4gICAgICAgIGlmKCFzdHJpZGUpIHtcbiAgICAgICAgICAgIHN0cmlkZSA9IDI7XG4gICAgICAgIH1cblxuICAgICAgICBpZighb2Zmc2V0KSB7XG4gICAgICAgICAgICBvZmZzZXQgPSAwO1xuICAgICAgICB9XG4gICAgICAgIFxuICAgICAgICBpZihjb3VudCkge1xuICAgICAgICAgICAgbCA9IE1hdGgubWluKChjb3VudCAqIHN0cmlkZSkgKyBvZmZzZXQsIGEubGVuZ3RoKTtcbiAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgIGwgPSBhLmxlbmd0aDtcbiAgICAgICAgfVxuXG4gICAgICAgIGZvcihpID0gb2Zmc2V0OyBpIDwgbDsgaSArPSBzdHJpZGUpIHtcbiAgICAgICAgICAgIHZlY1swXSA9IGFbaV07IHZlY1sxXSA9IGFbaSsxXTtcbiAgICAgICAgICAgIGZuKHZlYywgdmVjLCBhcmcpO1xuICAgICAgICAgICAgYVtpXSA9IHZlY1swXTsgYVtpKzFdID0gdmVjWzFdO1xuICAgICAgICB9XG4gICAgICAgIFxuICAgICAgICByZXR1cm4gYTtcbiAgICB9O1xufSkoKTtcblxuLyoqXG4gKiBSZXR1cm5zIGEgc3RyaW5nIHJlcHJlc2VudGF0aW9uIG9mIGEgdmVjdG9yXG4gKlxuICogQHBhcmFtIHt2ZWMyfSB2ZWMgdmVjdG9yIHRvIHJlcHJlc2VudCBhcyBhIHN0cmluZ1xuICogQHJldHVybnMge1N0cmluZ30gc3RyaW5nIHJlcHJlc2VudGF0aW9uIG9mIHRoZSB2ZWN0b3JcbiAqL1xudmVjMi5zdHIgPSBmdW5jdGlvbiAoYSkge1xuICAgIHJldHVybiAndmVjMignICsgYVswXSArICcsICcgKyBhWzFdICsgJyknO1xufTtcblxuaWYodHlwZW9mKGV4cG9ydHMpICE9PSAndW5kZWZpbmVkJykge1xuICAgIGV4cG9ydHMudmVjMiA9IHZlYzI7XG59XG47XG4vKiBDb3B5cmlnaHQgKGMpIDIwMTMsIEJyYW5kb24gSm9uZXMsIENvbGluIE1hY0tlbnppZSBJVi4gQWxsIHJpZ2h0cyByZXNlcnZlZC5cblxuUmVkaXN0cmlidXRpb24gYW5kIHVzZSBpbiBzb3VyY2UgYW5kIGJpbmFyeSBmb3Jtcywgd2l0aCBvciB3aXRob3V0IG1vZGlmaWNhdGlvbixcbmFyZSBwZXJtaXR0ZWQgcHJvdmlkZWQgdGhhdCB0aGUgZm9sbG93aW5nIGNvbmRpdGlvbnMgYXJlIG1ldDpcblxuICAqIFJlZGlzdHJpYnV0aW9ucyBvZiBzb3VyY2UgY29kZSBtdXN0IHJldGFpbiB0aGUgYWJvdmUgY29weXJpZ2h0IG5vdGljZSwgdGhpc1xuICAgIGxpc3Qgb2YgY29uZGl0aW9ucyBhbmQgdGhlIGZvbGxvd2luZyBkaXNjbGFpbWVyLlxuICAqIFJlZGlzdHJpYnV0aW9ucyBpbiBiaW5hcnkgZm9ybSBtdXN0IHJlcHJvZHVjZSB0aGUgYWJvdmUgY29weXJpZ2h0IG5vdGljZSxcbiAgICB0aGlzIGxpc3Qgb2YgY29uZGl0aW9ucyBhbmQgdGhlIGZvbGxvd2luZyBkaXNjbGFpbWVyIGluIHRoZSBkb2N1bWVudGF0aW9uIFxuICAgIGFuZC9vciBvdGhlciBtYXRlcmlhbHMgcHJvdmlkZWQgd2l0aCB0aGUgZGlzdHJpYnV0aW9uLlxuXG5USElTIFNPRlRXQVJFIElTIFBST1ZJREVEIEJZIFRIRSBDT1BZUklHSFQgSE9MREVSUyBBTkQgQ09OVFJJQlVUT1JTIFwiQVMgSVNcIiBBTkRcbkFOWSBFWFBSRVNTIE9SIElNUExJRUQgV0FSUkFOVElFUywgSU5DTFVESU5HLCBCVVQgTk9UIExJTUlURUQgVE8sIFRIRSBJTVBMSUVEXG5XQVJSQU5USUVTIE9GIE1FUkNIQU5UQUJJTElUWSBBTkQgRklUTkVTUyBGT1IgQSBQQVJUSUNVTEFSIFBVUlBPU0UgQVJFIFxuRElTQ0xBSU1FRC4gSU4gTk8gRVZFTlQgU0hBTEwgVEhFIENPUFlSSUdIVCBIT0xERVIgT1IgQ09OVFJJQlVUT1JTIEJFIExJQUJMRSBGT1JcbkFOWSBESVJFQ1QsIElORElSRUNULCBJTkNJREVOVEFMLCBTUEVDSUFMLCBFWEVNUExBUlksIE9SIENPTlNFUVVFTlRJQUwgREFNQUdFU1xuKElOQ0xVRElORywgQlVUIE5PVCBMSU1JVEVEIFRPLCBQUk9DVVJFTUVOVCBPRiBTVUJTVElUVVRFIEdPT0RTIE9SIFNFUlZJQ0VTO1xuTE9TUyBPRiBVU0UsIERBVEEsIE9SIFBST0ZJVFM7IE9SIEJVU0lORVNTIElOVEVSUlVQVElPTikgSE9XRVZFUiBDQVVTRUQgQU5EIE9OXG5BTlkgVEhFT1JZIE9GIExJQUJJTElUWSwgV0hFVEhFUiBJTiBDT05UUkFDVCwgU1RSSUNUIExJQUJJTElUWSwgT1IgVE9SVFxuKElOQ0xVRElORyBORUdMSUdFTkNFIE9SIE9USEVSV0lTRSkgQVJJU0lORyBJTiBBTlkgV0FZIE9VVCBPRiBUSEUgVVNFIE9GIFRISVNcblNPRlRXQVJFLCBFVkVOIElGIEFEVklTRUQgT0YgVEhFIFBPU1NJQklMSVRZIE9GIFNVQ0ggREFNQUdFLiAqL1xuXG4vKipcbiAqIEBjbGFzcyAzIERpbWVuc2lvbmFsIFZlY3RvclxuICogQG5hbWUgdmVjM1xuICovXG5cbnZhciB2ZWMzID0ge307XG5cbi8qKlxuICogQ3JlYXRlcyBhIG5ldywgZW1wdHkgdmVjM1xuICpcbiAqIEByZXR1cm5zIHt2ZWMzfSBhIG5ldyAzRCB2ZWN0b3JcbiAqL1xudmVjMy5jcmVhdGUgPSBmdW5jdGlvbigpIHtcbiAgICB2YXIgb3V0ID0gbmV3IEdMTUFUX0FSUkFZX1RZUEUoMyk7XG4gICAgb3V0WzBdID0gMDtcbiAgICBvdXRbMV0gPSAwO1xuICAgIG91dFsyXSA9IDA7XG4gICAgcmV0dXJuIG91dDtcbn07XG5cbi8qKlxuICogQ3JlYXRlcyBhIG5ldyB2ZWMzIGluaXRpYWxpemVkIHdpdGggdmFsdWVzIGZyb20gYW4gZXhpc3RpbmcgdmVjdG9yXG4gKlxuICogQHBhcmFtIHt2ZWMzfSBhIHZlY3RvciB0byBjbG9uZVxuICogQHJldHVybnMge3ZlYzN9IGEgbmV3IDNEIHZlY3RvclxuICovXG52ZWMzLmNsb25lID0gZnVuY3Rpb24oYSkge1xuICAgIHZhciBvdXQgPSBuZXcgR0xNQVRfQVJSQVlfVFlQRSgzKTtcbiAgICBvdXRbMF0gPSBhWzBdO1xuICAgIG91dFsxXSA9IGFbMV07XG4gICAgb3V0WzJdID0gYVsyXTtcbiAgICByZXR1cm4gb3V0O1xufTtcblxuLyoqXG4gKiBDcmVhdGVzIGEgbmV3IHZlYzMgaW5pdGlhbGl6ZWQgd2l0aCB0aGUgZ2l2ZW4gdmFsdWVzXG4gKlxuICogQHBhcmFtIHtOdW1iZXJ9IHggWCBjb21wb25lbnRcbiAqIEBwYXJhbSB7TnVtYmVyfSB5IFkgY29tcG9uZW50XG4gKiBAcGFyYW0ge051bWJlcn0geiBaIGNvbXBvbmVudFxuICogQHJldHVybnMge3ZlYzN9IGEgbmV3IDNEIHZlY3RvclxuICovXG52ZWMzLmZyb21WYWx1ZXMgPSBmdW5jdGlvbih4LCB5LCB6KSB7XG4gICAgdmFyIG91dCA9IG5ldyBHTE1BVF9BUlJBWV9UWVBFKDMpO1xuICAgIG91dFswXSA9IHg7XG4gICAgb3V0WzFdID0geTtcbiAgICBvdXRbMl0gPSB6O1xuICAgIHJldHVybiBvdXQ7XG59O1xuXG4vKipcbiAqIENvcHkgdGhlIHZhbHVlcyBmcm9tIG9uZSB2ZWMzIHRvIGFub3RoZXJcbiAqXG4gKiBAcGFyYW0ge3ZlYzN9IG91dCB0aGUgcmVjZWl2aW5nIHZlY3RvclxuICogQHBhcmFtIHt2ZWMzfSBhIHRoZSBzb3VyY2UgdmVjdG9yXG4gKiBAcmV0dXJucyB7dmVjM30gb3V0XG4gKi9cbnZlYzMuY29weSA9IGZ1bmN0aW9uKG91dCwgYSkge1xuICAgIG91dFswXSA9IGFbMF07XG4gICAgb3V0WzFdID0gYVsxXTtcbiAgICBvdXRbMl0gPSBhWzJdO1xuICAgIHJldHVybiBvdXQ7XG59O1xuXG4vKipcbiAqIFNldCB0aGUgY29tcG9uZW50cyBvZiBhIHZlYzMgdG8gdGhlIGdpdmVuIHZhbHVlc1xuICpcbiAqIEBwYXJhbSB7dmVjM30gb3V0IHRoZSByZWNlaXZpbmcgdmVjdG9yXG4gKiBAcGFyYW0ge051bWJlcn0geCBYIGNvbXBvbmVudFxuICogQHBhcmFtIHtOdW1iZXJ9IHkgWSBjb21wb25lbnRcbiAqIEBwYXJhbSB7TnVtYmVyfSB6IFogY29tcG9uZW50XG4gKiBAcmV0dXJucyB7dmVjM30gb3V0XG4gKi9cbnZlYzMuc2V0ID0gZnVuY3Rpb24ob3V0LCB4LCB5LCB6KSB7XG4gICAgb3V0WzBdID0geDtcbiAgICBvdXRbMV0gPSB5O1xuICAgIG91dFsyXSA9IHo7XG4gICAgcmV0dXJuIG91dDtcbn07XG5cbi8qKlxuICogQWRkcyB0d28gdmVjMydzXG4gKlxuICogQHBhcmFtIHt2ZWMzfSBvdXQgdGhlIHJlY2VpdmluZyB2ZWN0b3JcbiAqIEBwYXJhbSB7dmVjM30gYSB0aGUgZmlyc3Qgb3BlcmFuZFxuICogQHBhcmFtIHt2ZWMzfSBiIHRoZSBzZWNvbmQgb3BlcmFuZFxuICogQHJldHVybnMge3ZlYzN9IG91dFxuICovXG52ZWMzLmFkZCA9IGZ1bmN0aW9uKG91dCwgYSwgYikge1xuICAgIG91dFswXSA9IGFbMF0gKyBiWzBdO1xuICAgIG91dFsxXSA9IGFbMV0gKyBiWzFdO1xuICAgIG91dFsyXSA9IGFbMl0gKyBiWzJdO1xuICAgIHJldHVybiBvdXQ7XG59O1xuXG4vKipcbiAqIFN1YnRyYWN0cyB0d28gdmVjMydzXG4gKlxuICogQHBhcmFtIHt2ZWMzfSBvdXQgdGhlIHJlY2VpdmluZyB2ZWN0b3JcbiAqIEBwYXJhbSB7dmVjM30gYSB0aGUgZmlyc3Qgb3BlcmFuZFxuICogQHBhcmFtIHt2ZWMzfSBiIHRoZSBzZWNvbmQgb3BlcmFuZFxuICogQHJldHVybnMge3ZlYzN9IG91dFxuICovXG52ZWMzLnN1YnRyYWN0ID0gZnVuY3Rpb24ob3V0LCBhLCBiKSB7XG4gICAgb3V0WzBdID0gYVswXSAtIGJbMF07XG4gICAgb3V0WzFdID0gYVsxXSAtIGJbMV07XG4gICAgb3V0WzJdID0gYVsyXSAtIGJbMl07XG4gICAgcmV0dXJuIG91dDtcbn07XG5cbi8qKlxuICogQWxpYXMgZm9yIHtAbGluayB2ZWMzLnN1YnRyYWN0fVxuICogQGZ1bmN0aW9uXG4gKi9cbnZlYzMuc3ViID0gdmVjMy5zdWJ0cmFjdDtcblxuLyoqXG4gKiBNdWx0aXBsaWVzIHR3byB2ZWMzJ3NcbiAqXG4gKiBAcGFyYW0ge3ZlYzN9IG91dCB0aGUgcmVjZWl2aW5nIHZlY3RvclxuICogQHBhcmFtIHt2ZWMzfSBhIHRoZSBmaXJzdCBvcGVyYW5kXG4gKiBAcGFyYW0ge3ZlYzN9IGIgdGhlIHNlY29uZCBvcGVyYW5kXG4gKiBAcmV0dXJucyB7dmVjM30gb3V0XG4gKi9cbnZlYzMubXVsdGlwbHkgPSBmdW5jdGlvbihvdXQsIGEsIGIpIHtcbiAgICBvdXRbMF0gPSBhWzBdICogYlswXTtcbiAgICBvdXRbMV0gPSBhWzFdICogYlsxXTtcbiAgICBvdXRbMl0gPSBhWzJdICogYlsyXTtcbiAgICByZXR1cm4gb3V0O1xufTtcblxuLyoqXG4gKiBBbGlhcyBmb3Ige0BsaW5rIHZlYzMubXVsdGlwbHl9XG4gKiBAZnVuY3Rpb25cbiAqL1xudmVjMy5tdWwgPSB2ZWMzLm11bHRpcGx5O1xuXG4vKipcbiAqIERpdmlkZXMgdHdvIHZlYzMnc1xuICpcbiAqIEBwYXJhbSB7dmVjM30gb3V0IHRoZSByZWNlaXZpbmcgdmVjdG9yXG4gKiBAcGFyYW0ge3ZlYzN9IGEgdGhlIGZpcnN0IG9wZXJhbmRcbiAqIEBwYXJhbSB7dmVjM30gYiB0aGUgc2Vjb25kIG9wZXJhbmRcbiAqIEByZXR1cm5zIHt2ZWMzfSBvdXRcbiAqL1xudmVjMy5kaXZpZGUgPSBmdW5jdGlvbihvdXQsIGEsIGIpIHtcbiAgICBvdXRbMF0gPSBhWzBdIC8gYlswXTtcbiAgICBvdXRbMV0gPSBhWzFdIC8gYlsxXTtcbiAgICBvdXRbMl0gPSBhWzJdIC8gYlsyXTtcbiAgICByZXR1cm4gb3V0O1xufTtcblxuLyoqXG4gKiBBbGlhcyBmb3Ige0BsaW5rIHZlYzMuZGl2aWRlfVxuICogQGZ1bmN0aW9uXG4gKi9cbnZlYzMuZGl2ID0gdmVjMy5kaXZpZGU7XG5cbi8qKlxuICogUmV0dXJucyB0aGUgbWluaW11bSBvZiB0d28gdmVjMydzXG4gKlxuICogQHBhcmFtIHt2ZWMzfSBvdXQgdGhlIHJlY2VpdmluZyB2ZWN0b3JcbiAqIEBwYXJhbSB7dmVjM30gYSB0aGUgZmlyc3Qgb3BlcmFuZFxuICogQHBhcmFtIHt2ZWMzfSBiIHRoZSBzZWNvbmQgb3BlcmFuZFxuICogQHJldHVybnMge3ZlYzN9IG91dFxuICovXG52ZWMzLm1pbiA9IGZ1bmN0aW9uKG91dCwgYSwgYikge1xuICAgIG91dFswXSA9IE1hdGgubWluKGFbMF0sIGJbMF0pO1xuICAgIG91dFsxXSA9IE1hdGgubWluKGFbMV0sIGJbMV0pO1xuICAgIG91dFsyXSA9IE1hdGgubWluKGFbMl0sIGJbMl0pO1xuICAgIHJldHVybiBvdXQ7XG59O1xuXG4vKipcbiAqIFJldHVybnMgdGhlIG1heGltdW0gb2YgdHdvIHZlYzMnc1xuICpcbiAqIEBwYXJhbSB7dmVjM30gb3V0IHRoZSByZWNlaXZpbmcgdmVjdG9yXG4gKiBAcGFyYW0ge3ZlYzN9IGEgdGhlIGZpcnN0IG9wZXJhbmRcbiAqIEBwYXJhbSB7dmVjM30gYiB0aGUgc2Vjb25kIG9wZXJhbmRcbiAqIEByZXR1cm5zIHt2ZWMzfSBvdXRcbiAqL1xudmVjMy5tYXggPSBmdW5jdGlvbihvdXQsIGEsIGIpIHtcbiAgICBvdXRbMF0gPSBNYXRoLm1heChhWzBdLCBiWzBdKTtcbiAgICBvdXRbMV0gPSBNYXRoLm1heChhWzFdLCBiWzFdKTtcbiAgICBvdXRbMl0gPSBNYXRoLm1heChhWzJdLCBiWzJdKTtcbiAgICByZXR1cm4gb3V0O1xufTtcblxuLyoqXG4gKiBTY2FsZXMgYSB2ZWMzIGJ5IGEgc2NhbGFyIG51bWJlclxuICpcbiAqIEBwYXJhbSB7dmVjM30gb3V0IHRoZSByZWNlaXZpbmcgdmVjdG9yXG4gKiBAcGFyYW0ge3ZlYzN9IGEgdGhlIHZlY3RvciB0byBzY2FsZVxuICogQHBhcmFtIHtOdW1iZXJ9IGIgYW1vdW50IHRvIHNjYWxlIHRoZSB2ZWN0b3IgYnlcbiAqIEByZXR1cm5zIHt2ZWMzfSBvdXRcbiAqL1xudmVjMy5zY2FsZSA9IGZ1bmN0aW9uKG91dCwgYSwgYikge1xuICAgIG91dFswXSA9IGFbMF0gKiBiO1xuICAgIG91dFsxXSA9IGFbMV0gKiBiO1xuICAgIG91dFsyXSA9IGFbMl0gKiBiO1xuICAgIHJldHVybiBvdXQ7XG59O1xuXG4vKipcbiAqIENhbGN1bGF0ZXMgdGhlIGV1Y2xpZGlhbiBkaXN0YW5jZSBiZXR3ZWVuIHR3byB2ZWMzJ3NcbiAqXG4gKiBAcGFyYW0ge3ZlYzN9IGEgdGhlIGZpcnN0IG9wZXJhbmRcbiAqIEBwYXJhbSB7dmVjM30gYiB0aGUgc2Vjb25kIG9wZXJhbmRcbiAqIEByZXR1cm5zIHtOdW1iZXJ9IGRpc3RhbmNlIGJldHdlZW4gYSBhbmQgYlxuICovXG52ZWMzLmRpc3RhbmNlID0gZnVuY3Rpb24oYSwgYikge1xuICAgIHZhciB4ID0gYlswXSAtIGFbMF0sXG4gICAgICAgIHkgPSBiWzFdIC0gYVsxXSxcbiAgICAgICAgeiA9IGJbMl0gLSBhWzJdO1xuICAgIHJldHVybiBNYXRoLnNxcnQoeCp4ICsgeSp5ICsgeip6KTtcbn07XG5cbi8qKlxuICogQWxpYXMgZm9yIHtAbGluayB2ZWMzLmRpc3RhbmNlfVxuICogQGZ1bmN0aW9uXG4gKi9cbnZlYzMuZGlzdCA9IHZlYzMuZGlzdGFuY2U7XG5cbi8qKlxuICogQ2FsY3VsYXRlcyB0aGUgc3F1YXJlZCBldWNsaWRpYW4gZGlzdGFuY2UgYmV0d2VlbiB0d28gdmVjMydzXG4gKlxuICogQHBhcmFtIHt2ZWMzfSBhIHRoZSBmaXJzdCBvcGVyYW5kXG4gKiBAcGFyYW0ge3ZlYzN9IGIgdGhlIHNlY29uZCBvcGVyYW5kXG4gKiBAcmV0dXJucyB7TnVtYmVyfSBzcXVhcmVkIGRpc3RhbmNlIGJldHdlZW4gYSBhbmQgYlxuICovXG52ZWMzLnNxdWFyZWREaXN0YW5jZSA9IGZ1bmN0aW9uKGEsIGIpIHtcbiAgICB2YXIgeCA9IGJbMF0gLSBhWzBdLFxuICAgICAgICB5ID0gYlsxXSAtIGFbMV0sXG4gICAgICAgIHogPSBiWzJdIC0gYVsyXTtcbiAgICByZXR1cm4geCp4ICsgeSp5ICsgeip6O1xufTtcblxuLyoqXG4gKiBBbGlhcyBmb3Ige0BsaW5rIHZlYzMuc3F1YXJlZERpc3RhbmNlfVxuICogQGZ1bmN0aW9uXG4gKi9cbnZlYzMuc3FyRGlzdCA9IHZlYzMuc3F1YXJlZERpc3RhbmNlO1xuXG4vKipcbiAqIENhbGN1bGF0ZXMgdGhlIGxlbmd0aCBvZiBhIHZlYzNcbiAqXG4gKiBAcGFyYW0ge3ZlYzN9IGEgdmVjdG9yIHRvIGNhbGN1bGF0ZSBsZW5ndGggb2ZcbiAqIEByZXR1cm5zIHtOdW1iZXJ9IGxlbmd0aCBvZiBhXG4gKi9cbnZlYzMubGVuZ3RoID0gZnVuY3Rpb24gKGEpIHtcbiAgICB2YXIgeCA9IGFbMF0sXG4gICAgICAgIHkgPSBhWzFdLFxuICAgICAgICB6ID0gYVsyXTtcbiAgICByZXR1cm4gTWF0aC5zcXJ0KHgqeCArIHkqeSArIHoqeik7XG59O1xuXG4vKipcbiAqIEFsaWFzIGZvciB7QGxpbmsgdmVjMy5sZW5ndGh9XG4gKiBAZnVuY3Rpb25cbiAqL1xudmVjMy5sZW4gPSB2ZWMzLmxlbmd0aDtcblxuLyoqXG4gKiBDYWxjdWxhdGVzIHRoZSBzcXVhcmVkIGxlbmd0aCBvZiBhIHZlYzNcbiAqXG4gKiBAcGFyYW0ge3ZlYzN9IGEgdmVjdG9yIHRvIGNhbGN1bGF0ZSBzcXVhcmVkIGxlbmd0aCBvZlxuICogQHJldHVybnMge051bWJlcn0gc3F1YXJlZCBsZW5ndGggb2YgYVxuICovXG52ZWMzLnNxdWFyZWRMZW5ndGggPSBmdW5jdGlvbiAoYSkge1xuICAgIHZhciB4ID0gYVswXSxcbiAgICAgICAgeSA9IGFbMV0sXG4gICAgICAgIHogPSBhWzJdO1xuICAgIHJldHVybiB4KnggKyB5KnkgKyB6Kno7XG59O1xuXG4vKipcbiAqIEFsaWFzIGZvciB7QGxpbmsgdmVjMy5zcXVhcmVkTGVuZ3RofVxuICogQGZ1bmN0aW9uXG4gKi9cbnZlYzMuc3FyTGVuID0gdmVjMy5zcXVhcmVkTGVuZ3RoO1xuXG4vKipcbiAqIE5lZ2F0ZXMgdGhlIGNvbXBvbmVudHMgb2YgYSB2ZWMzXG4gKlxuICogQHBhcmFtIHt2ZWMzfSBvdXQgdGhlIHJlY2VpdmluZyB2ZWN0b3JcbiAqIEBwYXJhbSB7dmVjM30gYSB2ZWN0b3IgdG8gbmVnYXRlXG4gKiBAcmV0dXJucyB7dmVjM30gb3V0XG4gKi9cbnZlYzMubmVnYXRlID0gZnVuY3Rpb24ob3V0LCBhKSB7XG4gICAgb3V0WzBdID0gLWFbMF07XG4gICAgb3V0WzFdID0gLWFbMV07XG4gICAgb3V0WzJdID0gLWFbMl07XG4gICAgcmV0dXJuIG91dDtcbn07XG5cbi8qKlxuICogTm9ybWFsaXplIGEgdmVjM1xuICpcbiAqIEBwYXJhbSB7dmVjM30gb3V0IHRoZSByZWNlaXZpbmcgdmVjdG9yXG4gKiBAcGFyYW0ge3ZlYzN9IGEgdmVjdG9yIHRvIG5vcm1hbGl6ZVxuICogQHJldHVybnMge3ZlYzN9IG91dFxuICovXG52ZWMzLm5vcm1hbGl6ZSA9IGZ1bmN0aW9uKG91dCwgYSkge1xuICAgIHZhciB4ID0gYVswXSxcbiAgICAgICAgeSA9IGFbMV0sXG4gICAgICAgIHogPSBhWzJdO1xuICAgIHZhciBsZW4gPSB4KnggKyB5KnkgKyB6Kno7XG4gICAgaWYgKGxlbiA+IDApIHtcbiAgICAgICAgLy9UT0RPOiBldmFsdWF0ZSB1c2Ugb2YgZ2xtX2ludnNxcnQgaGVyZT9cbiAgICAgICAgbGVuID0gMSAvIE1hdGguc3FydChsZW4pO1xuICAgICAgICBvdXRbMF0gPSBhWzBdICogbGVuO1xuICAgICAgICBvdXRbMV0gPSBhWzFdICogbGVuO1xuICAgICAgICBvdXRbMl0gPSBhWzJdICogbGVuO1xuICAgIH1cbiAgICByZXR1cm4gb3V0O1xufTtcblxuLyoqXG4gKiBDYWxjdWxhdGVzIHRoZSBkb3QgcHJvZHVjdCBvZiB0d28gdmVjMydzXG4gKlxuICogQHBhcmFtIHt2ZWMzfSBhIHRoZSBmaXJzdCBvcGVyYW5kXG4gKiBAcGFyYW0ge3ZlYzN9IGIgdGhlIHNlY29uZCBvcGVyYW5kXG4gKiBAcmV0dXJucyB7TnVtYmVyfSBkb3QgcHJvZHVjdCBvZiBhIGFuZCBiXG4gKi9cbnZlYzMuZG90ID0gZnVuY3Rpb24gKGEsIGIpIHtcbiAgICByZXR1cm4gYVswXSAqIGJbMF0gKyBhWzFdICogYlsxXSArIGFbMl0gKiBiWzJdO1xufTtcblxuLyoqXG4gKiBDb21wdXRlcyB0aGUgY3Jvc3MgcHJvZHVjdCBvZiB0d28gdmVjMydzXG4gKlxuICogQHBhcmFtIHt2ZWMzfSBvdXQgdGhlIHJlY2VpdmluZyB2ZWN0b3JcbiAqIEBwYXJhbSB7dmVjM30gYSB0aGUgZmlyc3Qgb3BlcmFuZFxuICogQHBhcmFtIHt2ZWMzfSBiIHRoZSBzZWNvbmQgb3BlcmFuZFxuICogQHJldHVybnMge3ZlYzN9IG91dFxuICovXG52ZWMzLmNyb3NzID0gZnVuY3Rpb24ob3V0LCBhLCBiKSB7XG4gICAgdmFyIGF4ID0gYVswXSwgYXkgPSBhWzFdLCBheiA9IGFbMl0sXG4gICAgICAgIGJ4ID0gYlswXSwgYnkgPSBiWzFdLCBieiA9IGJbMl07XG5cbiAgICBvdXRbMF0gPSBheSAqIGJ6IC0gYXogKiBieTtcbiAgICBvdXRbMV0gPSBheiAqIGJ4IC0gYXggKiBiejtcbiAgICBvdXRbMl0gPSBheCAqIGJ5IC0gYXkgKiBieDtcbiAgICByZXR1cm4gb3V0O1xufTtcblxuLyoqXG4gKiBQZXJmb3JtcyBhIGxpbmVhciBpbnRlcnBvbGF0aW9uIGJldHdlZW4gdHdvIHZlYzMnc1xuICpcbiAqIEBwYXJhbSB7dmVjM30gb3V0IHRoZSByZWNlaXZpbmcgdmVjdG9yXG4gKiBAcGFyYW0ge3ZlYzN9IGEgdGhlIGZpcnN0IG9wZXJhbmRcbiAqIEBwYXJhbSB7dmVjM30gYiB0aGUgc2Vjb25kIG9wZXJhbmRcbiAqIEBwYXJhbSB7TnVtYmVyfSB0IGludGVycG9sYXRpb24gYW1vdW50IGJldHdlZW4gdGhlIHR3byBpbnB1dHNcbiAqIEByZXR1cm5zIHt2ZWMzfSBvdXRcbiAqL1xudmVjMy5sZXJwID0gZnVuY3Rpb24gKG91dCwgYSwgYiwgdCkge1xuICAgIHZhciBheCA9IGFbMF0sXG4gICAgICAgIGF5ID0gYVsxXSxcbiAgICAgICAgYXogPSBhWzJdO1xuICAgIG91dFswXSA9IGF4ICsgdCAqIChiWzBdIC0gYXgpO1xuICAgIG91dFsxXSA9IGF5ICsgdCAqIChiWzFdIC0gYXkpO1xuICAgIG91dFsyXSA9IGF6ICsgdCAqIChiWzJdIC0gYXopO1xuICAgIHJldHVybiBvdXQ7XG59O1xuXG4vKipcbiAqIFRyYW5zZm9ybXMgdGhlIHZlYzMgd2l0aCBhIG1hdDQuXG4gKiA0dGggdmVjdG9yIGNvbXBvbmVudCBpcyBpbXBsaWNpdGx5ICcxJ1xuICpcbiAqIEBwYXJhbSB7dmVjM30gb3V0IHRoZSByZWNlaXZpbmcgdmVjdG9yXG4gKiBAcGFyYW0ge3ZlYzN9IGEgdGhlIHZlY3RvciB0byB0cmFuc2Zvcm1cbiAqIEBwYXJhbSB7bWF0NH0gbSBtYXRyaXggdG8gdHJhbnNmb3JtIHdpdGhcbiAqIEByZXR1cm5zIHt2ZWMzfSBvdXRcbiAqL1xudmVjMy50cmFuc2Zvcm1NYXQ0ID0gZnVuY3Rpb24ob3V0LCBhLCBtKSB7XG4gICAgdmFyIHggPSBhWzBdLCB5ID0gYVsxXSwgeiA9IGFbMl07XG4gICAgb3V0WzBdID0gbVswXSAqIHggKyBtWzRdICogeSArIG1bOF0gKiB6ICsgbVsxMl07XG4gICAgb3V0WzFdID0gbVsxXSAqIHggKyBtWzVdICogeSArIG1bOV0gKiB6ICsgbVsxM107XG4gICAgb3V0WzJdID0gbVsyXSAqIHggKyBtWzZdICogeSArIG1bMTBdICogeiArIG1bMTRdO1xuICAgIHJldHVybiBvdXQ7XG59O1xuXG4vKipcbiAqIFRyYW5zZm9ybXMgdGhlIHZlYzMgd2l0aCBhIHF1YXRcbiAqXG4gKiBAcGFyYW0ge3ZlYzN9IG91dCB0aGUgcmVjZWl2aW5nIHZlY3RvclxuICogQHBhcmFtIHt2ZWMzfSBhIHRoZSB2ZWN0b3IgdG8gdHJhbnNmb3JtXG4gKiBAcGFyYW0ge3F1YXR9IHEgcXVhdGVybmlvbiB0byB0cmFuc2Zvcm0gd2l0aFxuICogQHJldHVybnMge3ZlYzN9IG91dFxuICovXG52ZWMzLnRyYW5zZm9ybVF1YXQgPSBmdW5jdGlvbihvdXQsIGEsIHEpIHtcbiAgICB2YXIgeCA9IGFbMF0sIHkgPSBhWzFdLCB6ID0gYVsyXSxcbiAgICAgICAgcXggPSBxWzBdLCBxeSA9IHFbMV0sIHF6ID0gcVsyXSwgcXcgPSBxWzNdLFxuXG4gICAgICAgIC8vIGNhbGN1bGF0ZSBxdWF0ICogdmVjXG4gICAgICAgIGl4ID0gcXcgKiB4ICsgcXkgKiB6IC0gcXogKiB5LFxuICAgICAgICBpeSA9IHF3ICogeSArIHF6ICogeCAtIHF4ICogeixcbiAgICAgICAgaXogPSBxdyAqIHogKyBxeCAqIHkgLSBxeSAqIHgsXG4gICAgICAgIGl3ID0gLXF4ICogeCAtIHF5ICogeSAtIHF6ICogejtcblxuICAgIC8vIGNhbGN1bGF0ZSByZXN1bHQgKiBpbnZlcnNlIHF1YXRcbiAgICBvdXRbMF0gPSBpeCAqIHF3ICsgaXcgKiAtcXggKyBpeSAqIC1xeiAtIGl6ICogLXF5O1xuICAgIG91dFsxXSA9IGl5ICogcXcgKyBpdyAqIC1xeSArIGl6ICogLXF4IC0gaXggKiAtcXo7XG4gICAgb3V0WzJdID0gaXogKiBxdyArIGl3ICogLXF6ICsgaXggKiAtcXkgLSBpeSAqIC1xeDtcbiAgICByZXR1cm4gb3V0O1xufTtcblxuLyoqXG4gKiBQZXJmb3JtIHNvbWUgb3BlcmF0aW9uIG92ZXIgYW4gYXJyYXkgb2YgdmVjM3MuXG4gKlxuICogQHBhcmFtIHtBcnJheX0gYSB0aGUgYXJyYXkgb2YgdmVjdG9ycyB0byBpdGVyYXRlIG92ZXJcbiAqIEBwYXJhbSB7TnVtYmVyfSBzdHJpZGUgTnVtYmVyIG9mIGVsZW1lbnRzIGJldHdlZW4gdGhlIHN0YXJ0IG9mIGVhY2ggdmVjMy4gSWYgMCBhc3N1bWVzIHRpZ2h0bHkgcGFja2VkXG4gKiBAcGFyYW0ge051bWJlcn0gb2Zmc2V0IE51bWJlciBvZiBlbGVtZW50cyB0byBza2lwIGF0IHRoZSBiZWdpbm5pbmcgb2YgdGhlIGFycmF5XG4gKiBAcGFyYW0ge051bWJlcn0gY291bnQgTnVtYmVyIG9mIHZlYzNzIHRvIGl0ZXJhdGUgb3Zlci4gSWYgMCBpdGVyYXRlcyBvdmVyIGVudGlyZSBhcnJheVxuICogQHBhcmFtIHtGdW5jdGlvbn0gZm4gRnVuY3Rpb24gdG8gY2FsbCBmb3IgZWFjaCB2ZWN0b3IgaW4gdGhlIGFycmF5XG4gKiBAcGFyYW0ge09iamVjdH0gW2FyZ10gYWRkaXRpb25hbCBhcmd1bWVudCB0byBwYXNzIHRvIGZuXG4gKiBAcmV0dXJucyB7QXJyYXl9IGFcbiAqIEBmdW5jdGlvblxuICovXG52ZWMzLmZvckVhY2ggPSAoZnVuY3Rpb24oKSB7XG4gICAgdmFyIHZlYyA9IHZlYzMuY3JlYXRlKCk7XG5cbiAgICByZXR1cm4gZnVuY3Rpb24oYSwgc3RyaWRlLCBvZmZzZXQsIGNvdW50LCBmbiwgYXJnKSB7XG4gICAgICAgIHZhciBpLCBsO1xuICAgICAgICBpZighc3RyaWRlKSB7XG4gICAgICAgICAgICBzdHJpZGUgPSAzO1xuICAgICAgICB9XG5cbiAgICAgICAgaWYoIW9mZnNldCkge1xuICAgICAgICAgICAgb2Zmc2V0ID0gMDtcbiAgICAgICAgfVxuICAgICAgICBcbiAgICAgICAgaWYoY291bnQpIHtcbiAgICAgICAgICAgIGwgPSBNYXRoLm1pbigoY291bnQgKiBzdHJpZGUpICsgb2Zmc2V0LCBhLmxlbmd0aCk7XG4gICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICBsID0gYS5sZW5ndGg7XG4gICAgICAgIH1cblxuICAgICAgICBmb3IoaSA9IG9mZnNldDsgaSA8IGw7IGkgKz0gc3RyaWRlKSB7XG4gICAgICAgICAgICB2ZWNbMF0gPSBhW2ldOyB2ZWNbMV0gPSBhW2krMV07IHZlY1syXSA9IGFbaSsyXTtcbiAgICAgICAgICAgIGZuKHZlYywgdmVjLCBhcmcpO1xuICAgICAgICAgICAgYVtpXSA9IHZlY1swXTsgYVtpKzFdID0gdmVjWzFdOyBhW2krMl0gPSB2ZWNbMl07XG4gICAgICAgIH1cbiAgICAgICAgXG4gICAgICAgIHJldHVybiBhO1xuICAgIH07XG59KSgpO1xuXG4vKipcbiAqIFJldHVybnMgYSBzdHJpbmcgcmVwcmVzZW50YXRpb24gb2YgYSB2ZWN0b3JcbiAqXG4gKiBAcGFyYW0ge3ZlYzN9IHZlYyB2ZWN0b3IgdG8gcmVwcmVzZW50IGFzIGEgc3RyaW5nXG4gKiBAcmV0dXJucyB7U3RyaW5nfSBzdHJpbmcgcmVwcmVzZW50YXRpb24gb2YgdGhlIHZlY3RvclxuICovXG52ZWMzLnN0ciA9IGZ1bmN0aW9uIChhKSB7XG4gICAgcmV0dXJuICd2ZWMzKCcgKyBhWzBdICsgJywgJyArIGFbMV0gKyAnLCAnICsgYVsyXSArICcpJztcbn07XG5cbmlmKHR5cGVvZihleHBvcnRzKSAhPT0gJ3VuZGVmaW5lZCcpIHtcbiAgICBleHBvcnRzLnZlYzMgPSB2ZWMzO1xufVxuO1xuLyogQ29weXJpZ2h0IChjKSAyMDEzLCBCcmFuZG9uIEpvbmVzLCBDb2xpbiBNYWNLZW56aWUgSVYuIEFsbCByaWdodHMgcmVzZXJ2ZWQuXG5cblJlZGlzdHJpYnV0aW9uIGFuZCB1c2UgaW4gc291cmNlIGFuZCBiaW5hcnkgZm9ybXMsIHdpdGggb3Igd2l0aG91dCBtb2RpZmljYXRpb24sXG5hcmUgcGVybWl0dGVkIHByb3ZpZGVkIHRoYXQgdGhlIGZvbGxvd2luZyBjb25kaXRpb25zIGFyZSBtZXQ6XG5cbiAgKiBSZWRpc3RyaWJ1dGlvbnMgb2Ygc291cmNlIGNvZGUgbXVzdCByZXRhaW4gdGhlIGFib3ZlIGNvcHlyaWdodCBub3RpY2UsIHRoaXNcbiAgICBsaXN0IG9mIGNvbmRpdGlvbnMgYW5kIHRoZSBmb2xsb3dpbmcgZGlzY2xhaW1lci5cbiAgKiBSZWRpc3RyaWJ1dGlvbnMgaW4gYmluYXJ5IGZvcm0gbXVzdCByZXByb2R1Y2UgdGhlIGFib3ZlIGNvcHlyaWdodCBub3RpY2UsXG4gICAgdGhpcyBsaXN0IG9mIGNvbmRpdGlvbnMgYW5kIHRoZSBmb2xsb3dpbmcgZGlzY2xhaW1lciBpbiB0aGUgZG9jdW1lbnRhdGlvbiBcbiAgICBhbmQvb3Igb3RoZXIgbWF0ZXJpYWxzIHByb3ZpZGVkIHdpdGggdGhlIGRpc3RyaWJ1dGlvbi5cblxuVEhJUyBTT0ZUV0FSRSBJUyBQUk9WSURFRCBCWSBUSEUgQ09QWVJJR0hUIEhPTERFUlMgQU5EIENPTlRSSUJVVE9SUyBcIkFTIElTXCIgQU5EXG5BTlkgRVhQUkVTUyBPUiBJTVBMSUVEIFdBUlJBTlRJRVMsIElOQ0xVRElORywgQlVUIE5PVCBMSU1JVEVEIFRPLCBUSEUgSU1QTElFRFxuV0FSUkFOVElFUyBPRiBNRVJDSEFOVEFCSUxJVFkgQU5EIEZJVE5FU1MgRk9SIEEgUEFSVElDVUxBUiBQVVJQT1NFIEFSRSBcbkRJU0NMQUlNRUQuIElOIE5PIEVWRU5UIFNIQUxMIFRIRSBDT1BZUklHSFQgSE9MREVSIE9SIENPTlRSSUJVVE9SUyBCRSBMSUFCTEUgRk9SXG5BTlkgRElSRUNULCBJTkRJUkVDVCwgSU5DSURFTlRBTCwgU1BFQ0lBTCwgRVhFTVBMQVJZLCBPUiBDT05TRVFVRU5USUFMIERBTUFHRVNcbihJTkNMVURJTkcsIEJVVCBOT1QgTElNSVRFRCBUTywgUFJPQ1VSRU1FTlQgT0YgU1VCU1RJVFVURSBHT09EUyBPUiBTRVJWSUNFUztcbkxPU1MgT0YgVVNFLCBEQVRBLCBPUiBQUk9GSVRTOyBPUiBCVVNJTkVTUyBJTlRFUlJVUFRJT04pIEhPV0VWRVIgQ0FVU0VEIEFORCBPTlxuQU5ZIFRIRU9SWSBPRiBMSUFCSUxJVFksIFdIRVRIRVIgSU4gQ09OVFJBQ1QsIFNUUklDVCBMSUFCSUxJVFksIE9SIFRPUlRcbihJTkNMVURJTkcgTkVHTElHRU5DRSBPUiBPVEhFUldJU0UpIEFSSVNJTkcgSU4gQU5ZIFdBWSBPVVQgT0YgVEhFIFVTRSBPRiBUSElTXG5TT0ZUV0FSRSwgRVZFTiBJRiBBRFZJU0VEIE9GIFRIRSBQT1NTSUJJTElUWSBPRiBTVUNIIERBTUFHRS4gKi9cblxuLyoqXG4gKiBAY2xhc3MgNCBEaW1lbnNpb25hbCBWZWN0b3JcbiAqIEBuYW1lIHZlYzRcbiAqL1xuXG52YXIgdmVjNCA9IHt9O1xuXG4vKipcbiAqIENyZWF0ZXMgYSBuZXcsIGVtcHR5IHZlYzRcbiAqXG4gKiBAcmV0dXJucyB7dmVjNH0gYSBuZXcgNEQgdmVjdG9yXG4gKi9cbnZlYzQuY3JlYXRlID0gZnVuY3Rpb24oKSB7XG4gICAgdmFyIG91dCA9IG5ldyBHTE1BVF9BUlJBWV9UWVBFKDQpO1xuICAgIG91dFswXSA9IDA7XG4gICAgb3V0WzFdID0gMDtcbiAgICBvdXRbMl0gPSAwO1xuICAgIG91dFszXSA9IDA7XG4gICAgcmV0dXJuIG91dDtcbn07XG5cbi8qKlxuICogQ3JlYXRlcyBhIG5ldyB2ZWM0IGluaXRpYWxpemVkIHdpdGggdmFsdWVzIGZyb20gYW4gZXhpc3RpbmcgdmVjdG9yXG4gKlxuICogQHBhcmFtIHt2ZWM0fSBhIHZlY3RvciB0byBjbG9uZVxuICogQHJldHVybnMge3ZlYzR9IGEgbmV3IDREIHZlY3RvclxuICovXG52ZWM0LmNsb25lID0gZnVuY3Rpb24oYSkge1xuICAgIHZhciBvdXQgPSBuZXcgR0xNQVRfQVJSQVlfVFlQRSg0KTtcbiAgICBvdXRbMF0gPSBhWzBdO1xuICAgIG91dFsxXSA9IGFbMV07XG4gICAgb3V0WzJdID0gYVsyXTtcbiAgICBvdXRbM10gPSBhWzNdO1xuICAgIHJldHVybiBvdXQ7XG59O1xuXG4vKipcbiAqIENyZWF0ZXMgYSBuZXcgdmVjNCBpbml0aWFsaXplZCB3aXRoIHRoZSBnaXZlbiB2YWx1ZXNcbiAqXG4gKiBAcGFyYW0ge051bWJlcn0geCBYIGNvbXBvbmVudFxuICogQHBhcmFtIHtOdW1iZXJ9IHkgWSBjb21wb25lbnRcbiAqIEBwYXJhbSB7TnVtYmVyfSB6IFogY29tcG9uZW50XG4gKiBAcGFyYW0ge051bWJlcn0gdyBXIGNvbXBvbmVudFxuICogQHJldHVybnMge3ZlYzR9IGEgbmV3IDREIHZlY3RvclxuICovXG52ZWM0LmZyb21WYWx1ZXMgPSBmdW5jdGlvbih4LCB5LCB6LCB3KSB7XG4gICAgdmFyIG91dCA9IG5ldyBHTE1BVF9BUlJBWV9UWVBFKDQpO1xuICAgIG91dFswXSA9IHg7XG4gICAgb3V0WzFdID0geTtcbiAgICBvdXRbMl0gPSB6O1xuICAgIG91dFszXSA9IHc7XG4gICAgcmV0dXJuIG91dDtcbn07XG5cbi8qKlxuICogQ29weSB0aGUgdmFsdWVzIGZyb20gb25lIHZlYzQgdG8gYW5vdGhlclxuICpcbiAqIEBwYXJhbSB7dmVjNH0gb3V0IHRoZSByZWNlaXZpbmcgdmVjdG9yXG4gKiBAcGFyYW0ge3ZlYzR9IGEgdGhlIHNvdXJjZSB2ZWN0b3JcbiAqIEByZXR1cm5zIHt2ZWM0fSBvdXRcbiAqL1xudmVjNC5jb3B5ID0gZnVuY3Rpb24ob3V0LCBhKSB7XG4gICAgb3V0WzBdID0gYVswXTtcbiAgICBvdXRbMV0gPSBhWzFdO1xuICAgIG91dFsyXSA9IGFbMl07XG4gICAgb3V0WzNdID0gYVszXTtcbiAgICByZXR1cm4gb3V0O1xufTtcblxuLyoqXG4gKiBTZXQgdGhlIGNvbXBvbmVudHMgb2YgYSB2ZWM0IHRvIHRoZSBnaXZlbiB2YWx1ZXNcbiAqXG4gKiBAcGFyYW0ge3ZlYzR9IG91dCB0aGUgcmVjZWl2aW5nIHZlY3RvclxuICogQHBhcmFtIHtOdW1iZXJ9IHggWCBjb21wb25lbnRcbiAqIEBwYXJhbSB7TnVtYmVyfSB5IFkgY29tcG9uZW50XG4gKiBAcGFyYW0ge051bWJlcn0geiBaIGNvbXBvbmVudFxuICogQHBhcmFtIHtOdW1iZXJ9IHcgVyBjb21wb25lbnRcbiAqIEByZXR1cm5zIHt2ZWM0fSBvdXRcbiAqL1xudmVjNC5zZXQgPSBmdW5jdGlvbihvdXQsIHgsIHksIHosIHcpIHtcbiAgICBvdXRbMF0gPSB4O1xuICAgIG91dFsxXSA9IHk7XG4gICAgb3V0WzJdID0gejtcbiAgICBvdXRbM10gPSB3O1xuICAgIHJldHVybiBvdXQ7XG59O1xuXG4vKipcbiAqIEFkZHMgdHdvIHZlYzQnc1xuICpcbiAqIEBwYXJhbSB7dmVjNH0gb3V0IHRoZSByZWNlaXZpbmcgdmVjdG9yXG4gKiBAcGFyYW0ge3ZlYzR9IGEgdGhlIGZpcnN0IG9wZXJhbmRcbiAqIEBwYXJhbSB7dmVjNH0gYiB0aGUgc2Vjb25kIG9wZXJhbmRcbiAqIEByZXR1cm5zIHt2ZWM0fSBvdXRcbiAqL1xudmVjNC5hZGQgPSBmdW5jdGlvbihvdXQsIGEsIGIpIHtcbiAgICBvdXRbMF0gPSBhWzBdICsgYlswXTtcbiAgICBvdXRbMV0gPSBhWzFdICsgYlsxXTtcbiAgICBvdXRbMl0gPSBhWzJdICsgYlsyXTtcbiAgICBvdXRbM10gPSBhWzNdICsgYlszXTtcbiAgICByZXR1cm4gb3V0O1xufTtcblxuLyoqXG4gKiBTdWJ0cmFjdHMgdHdvIHZlYzQnc1xuICpcbiAqIEBwYXJhbSB7dmVjNH0gb3V0IHRoZSByZWNlaXZpbmcgdmVjdG9yXG4gKiBAcGFyYW0ge3ZlYzR9IGEgdGhlIGZpcnN0IG9wZXJhbmRcbiAqIEBwYXJhbSB7dmVjNH0gYiB0aGUgc2Vjb25kIG9wZXJhbmRcbiAqIEByZXR1cm5zIHt2ZWM0fSBvdXRcbiAqL1xudmVjNC5zdWJ0cmFjdCA9IGZ1bmN0aW9uKG91dCwgYSwgYikge1xuICAgIG91dFswXSA9IGFbMF0gLSBiWzBdO1xuICAgIG91dFsxXSA9IGFbMV0gLSBiWzFdO1xuICAgIG91dFsyXSA9IGFbMl0gLSBiWzJdO1xuICAgIG91dFszXSA9IGFbM10gLSBiWzNdO1xuICAgIHJldHVybiBvdXQ7XG59O1xuXG4vKipcbiAqIEFsaWFzIGZvciB7QGxpbmsgdmVjNC5zdWJ0cmFjdH1cbiAqIEBmdW5jdGlvblxuICovXG52ZWM0LnN1YiA9IHZlYzQuc3VidHJhY3Q7XG5cbi8qKlxuICogTXVsdGlwbGllcyB0d28gdmVjNCdzXG4gKlxuICogQHBhcmFtIHt2ZWM0fSBvdXQgdGhlIHJlY2VpdmluZyB2ZWN0b3JcbiAqIEBwYXJhbSB7dmVjNH0gYSB0aGUgZmlyc3Qgb3BlcmFuZFxuICogQHBhcmFtIHt2ZWM0fSBiIHRoZSBzZWNvbmQgb3BlcmFuZFxuICogQHJldHVybnMge3ZlYzR9IG91dFxuICovXG52ZWM0Lm11bHRpcGx5ID0gZnVuY3Rpb24ob3V0LCBhLCBiKSB7XG4gICAgb3V0WzBdID0gYVswXSAqIGJbMF07XG4gICAgb3V0WzFdID0gYVsxXSAqIGJbMV07XG4gICAgb3V0WzJdID0gYVsyXSAqIGJbMl07XG4gICAgb3V0WzNdID0gYVszXSAqIGJbM107XG4gICAgcmV0dXJuIG91dDtcbn07XG5cbi8qKlxuICogQWxpYXMgZm9yIHtAbGluayB2ZWM0Lm11bHRpcGx5fVxuICogQGZ1bmN0aW9uXG4gKi9cbnZlYzQubXVsID0gdmVjNC5tdWx0aXBseTtcblxuLyoqXG4gKiBEaXZpZGVzIHR3byB2ZWM0J3NcbiAqXG4gKiBAcGFyYW0ge3ZlYzR9IG91dCB0aGUgcmVjZWl2aW5nIHZlY3RvclxuICogQHBhcmFtIHt2ZWM0fSBhIHRoZSBmaXJzdCBvcGVyYW5kXG4gKiBAcGFyYW0ge3ZlYzR9IGIgdGhlIHNlY29uZCBvcGVyYW5kXG4gKiBAcmV0dXJucyB7dmVjNH0gb3V0XG4gKi9cbnZlYzQuZGl2aWRlID0gZnVuY3Rpb24ob3V0LCBhLCBiKSB7XG4gICAgb3V0WzBdID0gYVswXSAvIGJbMF07XG4gICAgb3V0WzFdID0gYVsxXSAvIGJbMV07XG4gICAgb3V0WzJdID0gYVsyXSAvIGJbMl07XG4gICAgb3V0WzNdID0gYVszXSAvIGJbM107XG4gICAgcmV0dXJuIG91dDtcbn07XG5cbi8qKlxuICogQWxpYXMgZm9yIHtAbGluayB2ZWM0LmRpdmlkZX1cbiAqIEBmdW5jdGlvblxuICovXG52ZWM0LmRpdiA9IHZlYzQuZGl2aWRlO1xuXG4vKipcbiAqIFJldHVybnMgdGhlIG1pbmltdW0gb2YgdHdvIHZlYzQnc1xuICpcbiAqIEBwYXJhbSB7dmVjNH0gb3V0IHRoZSByZWNlaXZpbmcgdmVjdG9yXG4gKiBAcGFyYW0ge3ZlYzR9IGEgdGhlIGZpcnN0IG9wZXJhbmRcbiAqIEBwYXJhbSB7dmVjNH0gYiB0aGUgc2Vjb25kIG9wZXJhbmRcbiAqIEByZXR1cm5zIHt2ZWM0fSBvdXRcbiAqL1xudmVjNC5taW4gPSBmdW5jdGlvbihvdXQsIGEsIGIpIHtcbiAgICBvdXRbMF0gPSBNYXRoLm1pbihhWzBdLCBiWzBdKTtcbiAgICBvdXRbMV0gPSBNYXRoLm1pbihhWzFdLCBiWzFdKTtcbiAgICBvdXRbMl0gPSBNYXRoLm1pbihhWzJdLCBiWzJdKTtcbiAgICBvdXRbM10gPSBNYXRoLm1pbihhWzNdLCBiWzNdKTtcbiAgICByZXR1cm4gb3V0O1xufTtcblxuLyoqXG4gKiBSZXR1cm5zIHRoZSBtYXhpbXVtIG9mIHR3byB2ZWM0J3NcbiAqXG4gKiBAcGFyYW0ge3ZlYzR9IG91dCB0aGUgcmVjZWl2aW5nIHZlY3RvclxuICogQHBhcmFtIHt2ZWM0fSBhIHRoZSBmaXJzdCBvcGVyYW5kXG4gKiBAcGFyYW0ge3ZlYzR9IGIgdGhlIHNlY29uZCBvcGVyYW5kXG4gKiBAcmV0dXJucyB7dmVjNH0gb3V0XG4gKi9cbnZlYzQubWF4ID0gZnVuY3Rpb24ob3V0LCBhLCBiKSB7XG4gICAgb3V0WzBdID0gTWF0aC5tYXgoYVswXSwgYlswXSk7XG4gICAgb3V0WzFdID0gTWF0aC5tYXgoYVsxXSwgYlsxXSk7XG4gICAgb3V0WzJdID0gTWF0aC5tYXgoYVsyXSwgYlsyXSk7XG4gICAgb3V0WzNdID0gTWF0aC5tYXgoYVszXSwgYlszXSk7XG4gICAgcmV0dXJuIG91dDtcbn07XG5cbi8qKlxuICogU2NhbGVzIGEgdmVjNCBieSBhIHNjYWxhciBudW1iZXJcbiAqXG4gKiBAcGFyYW0ge3ZlYzR9IG91dCB0aGUgcmVjZWl2aW5nIHZlY3RvclxuICogQHBhcmFtIHt2ZWM0fSBhIHRoZSB2ZWN0b3IgdG8gc2NhbGVcbiAqIEBwYXJhbSB7TnVtYmVyfSBiIGFtb3VudCB0byBzY2FsZSB0aGUgdmVjdG9yIGJ5XG4gKiBAcmV0dXJucyB7dmVjNH0gb3V0XG4gKi9cbnZlYzQuc2NhbGUgPSBmdW5jdGlvbihvdXQsIGEsIGIpIHtcbiAgICBvdXRbMF0gPSBhWzBdICogYjtcbiAgICBvdXRbMV0gPSBhWzFdICogYjtcbiAgICBvdXRbMl0gPSBhWzJdICogYjtcbiAgICBvdXRbM10gPSBhWzNdICogYjtcbiAgICByZXR1cm4gb3V0O1xufTtcblxuLyoqXG4gKiBDYWxjdWxhdGVzIHRoZSBldWNsaWRpYW4gZGlzdGFuY2UgYmV0d2VlbiB0d28gdmVjNCdzXG4gKlxuICogQHBhcmFtIHt2ZWM0fSBhIHRoZSBmaXJzdCBvcGVyYW5kXG4gKiBAcGFyYW0ge3ZlYzR9IGIgdGhlIHNlY29uZCBvcGVyYW5kXG4gKiBAcmV0dXJucyB7TnVtYmVyfSBkaXN0YW5jZSBiZXR3ZWVuIGEgYW5kIGJcbiAqL1xudmVjNC5kaXN0YW5jZSA9IGZ1bmN0aW9uKGEsIGIpIHtcbiAgICB2YXIgeCA9IGJbMF0gLSBhWzBdLFxuICAgICAgICB5ID0gYlsxXSAtIGFbMV0sXG4gICAgICAgIHogPSBiWzJdIC0gYVsyXSxcbiAgICAgICAgdyA9IGJbM10gLSBhWzNdO1xuICAgIHJldHVybiBNYXRoLnNxcnQoeCp4ICsgeSp5ICsgeip6ICsgdyp3KTtcbn07XG5cbi8qKlxuICogQWxpYXMgZm9yIHtAbGluayB2ZWM0LmRpc3RhbmNlfVxuICogQGZ1bmN0aW9uXG4gKi9cbnZlYzQuZGlzdCA9IHZlYzQuZGlzdGFuY2U7XG5cbi8qKlxuICogQ2FsY3VsYXRlcyB0aGUgc3F1YXJlZCBldWNsaWRpYW4gZGlzdGFuY2UgYmV0d2VlbiB0d28gdmVjNCdzXG4gKlxuICogQHBhcmFtIHt2ZWM0fSBhIHRoZSBmaXJzdCBvcGVyYW5kXG4gKiBAcGFyYW0ge3ZlYzR9IGIgdGhlIHNlY29uZCBvcGVyYW5kXG4gKiBAcmV0dXJucyB7TnVtYmVyfSBzcXVhcmVkIGRpc3RhbmNlIGJldHdlZW4gYSBhbmQgYlxuICovXG52ZWM0LnNxdWFyZWREaXN0YW5jZSA9IGZ1bmN0aW9uKGEsIGIpIHtcbiAgICB2YXIgeCA9IGJbMF0gLSBhWzBdLFxuICAgICAgICB5ID0gYlsxXSAtIGFbMV0sXG4gICAgICAgIHogPSBiWzJdIC0gYVsyXSxcbiAgICAgICAgdyA9IGJbM10gLSBhWzNdO1xuICAgIHJldHVybiB4KnggKyB5KnkgKyB6KnogKyB3Knc7XG59O1xuXG4vKipcbiAqIEFsaWFzIGZvciB7QGxpbmsgdmVjNC5zcXVhcmVkRGlzdGFuY2V9XG4gKiBAZnVuY3Rpb25cbiAqL1xudmVjNC5zcXJEaXN0ID0gdmVjNC5zcXVhcmVkRGlzdGFuY2U7XG5cbi8qKlxuICogQ2FsY3VsYXRlcyB0aGUgbGVuZ3RoIG9mIGEgdmVjNFxuICpcbiAqIEBwYXJhbSB7dmVjNH0gYSB2ZWN0b3IgdG8gY2FsY3VsYXRlIGxlbmd0aCBvZlxuICogQHJldHVybnMge051bWJlcn0gbGVuZ3RoIG9mIGFcbiAqL1xudmVjNC5sZW5ndGggPSBmdW5jdGlvbiAoYSkge1xuICAgIHZhciB4ID0gYVswXSxcbiAgICAgICAgeSA9IGFbMV0sXG4gICAgICAgIHogPSBhWzJdLFxuICAgICAgICB3ID0gYVszXTtcbiAgICByZXR1cm4gTWF0aC5zcXJ0KHgqeCArIHkqeSArIHoqeiArIHcqdyk7XG59O1xuXG4vKipcbiAqIEFsaWFzIGZvciB7QGxpbmsgdmVjNC5sZW5ndGh9XG4gKiBAZnVuY3Rpb25cbiAqL1xudmVjNC5sZW4gPSB2ZWM0Lmxlbmd0aDtcblxuLyoqXG4gKiBDYWxjdWxhdGVzIHRoZSBzcXVhcmVkIGxlbmd0aCBvZiBhIHZlYzRcbiAqXG4gKiBAcGFyYW0ge3ZlYzR9IGEgdmVjdG9yIHRvIGNhbGN1bGF0ZSBzcXVhcmVkIGxlbmd0aCBvZlxuICogQHJldHVybnMge051bWJlcn0gc3F1YXJlZCBsZW5ndGggb2YgYVxuICovXG52ZWM0LnNxdWFyZWRMZW5ndGggPSBmdW5jdGlvbiAoYSkge1xuICAgIHZhciB4ID0gYVswXSxcbiAgICAgICAgeSA9IGFbMV0sXG4gICAgICAgIHogPSBhWzJdLFxuICAgICAgICB3ID0gYVszXTtcbiAgICByZXR1cm4geCp4ICsgeSp5ICsgeip6ICsgdyp3O1xufTtcblxuLyoqXG4gKiBBbGlhcyBmb3Ige0BsaW5rIHZlYzQuc3F1YXJlZExlbmd0aH1cbiAqIEBmdW5jdGlvblxuICovXG52ZWM0LnNxckxlbiA9IHZlYzQuc3F1YXJlZExlbmd0aDtcblxuLyoqXG4gKiBOZWdhdGVzIHRoZSBjb21wb25lbnRzIG9mIGEgdmVjNFxuICpcbiAqIEBwYXJhbSB7dmVjNH0gb3V0IHRoZSByZWNlaXZpbmcgdmVjdG9yXG4gKiBAcGFyYW0ge3ZlYzR9IGEgdmVjdG9yIHRvIG5lZ2F0ZVxuICogQHJldHVybnMge3ZlYzR9IG91dFxuICovXG52ZWM0Lm5lZ2F0ZSA9IGZ1bmN0aW9uKG91dCwgYSkge1xuICAgIG91dFswXSA9IC1hWzBdO1xuICAgIG91dFsxXSA9IC1hWzFdO1xuICAgIG91dFsyXSA9IC1hWzJdO1xuICAgIG91dFszXSA9IC1hWzNdO1xuICAgIHJldHVybiBvdXQ7XG59O1xuXG4vKipcbiAqIE5vcm1hbGl6ZSBhIHZlYzRcbiAqXG4gKiBAcGFyYW0ge3ZlYzR9IG91dCB0aGUgcmVjZWl2aW5nIHZlY3RvclxuICogQHBhcmFtIHt2ZWM0fSBhIHZlY3RvciB0byBub3JtYWxpemVcbiAqIEByZXR1cm5zIHt2ZWM0fSBvdXRcbiAqL1xudmVjNC5ub3JtYWxpemUgPSBmdW5jdGlvbihvdXQsIGEpIHtcbiAgICB2YXIgeCA9IGFbMF0sXG4gICAgICAgIHkgPSBhWzFdLFxuICAgICAgICB6ID0gYVsyXSxcbiAgICAgICAgdyA9IGFbM107XG4gICAgdmFyIGxlbiA9IHgqeCArIHkqeSArIHoqeiArIHcqdztcbiAgICBpZiAobGVuID4gMCkge1xuICAgICAgICBsZW4gPSAxIC8gTWF0aC5zcXJ0KGxlbik7XG4gICAgICAgIG91dFswXSA9IGFbMF0gKiBsZW47XG4gICAgICAgIG91dFsxXSA9IGFbMV0gKiBsZW47XG4gICAgICAgIG91dFsyXSA9IGFbMl0gKiBsZW47XG4gICAgICAgIG91dFszXSA9IGFbM10gKiBsZW47XG4gICAgfVxuICAgIHJldHVybiBvdXQ7XG59O1xuXG4vKipcbiAqIENhbGN1bGF0ZXMgdGhlIGRvdCBwcm9kdWN0IG9mIHR3byB2ZWM0J3NcbiAqXG4gKiBAcGFyYW0ge3ZlYzR9IGEgdGhlIGZpcnN0IG9wZXJhbmRcbiAqIEBwYXJhbSB7dmVjNH0gYiB0aGUgc2Vjb25kIG9wZXJhbmRcbiAqIEByZXR1cm5zIHtOdW1iZXJ9IGRvdCBwcm9kdWN0IG9mIGEgYW5kIGJcbiAqL1xudmVjNC5kb3QgPSBmdW5jdGlvbiAoYSwgYikge1xuICAgIHJldHVybiBhWzBdICogYlswXSArIGFbMV0gKiBiWzFdICsgYVsyXSAqIGJbMl0gKyBhWzNdICogYlszXTtcbn07XG5cbi8qKlxuICogUGVyZm9ybXMgYSBsaW5lYXIgaW50ZXJwb2xhdGlvbiBiZXR3ZWVuIHR3byB2ZWM0J3NcbiAqXG4gKiBAcGFyYW0ge3ZlYzR9IG91dCB0aGUgcmVjZWl2aW5nIHZlY3RvclxuICogQHBhcmFtIHt2ZWM0fSBhIHRoZSBmaXJzdCBvcGVyYW5kXG4gKiBAcGFyYW0ge3ZlYzR9IGIgdGhlIHNlY29uZCBvcGVyYW5kXG4gKiBAcGFyYW0ge051bWJlcn0gdCBpbnRlcnBvbGF0aW9uIGFtb3VudCBiZXR3ZWVuIHRoZSB0d28gaW5wdXRzXG4gKiBAcmV0dXJucyB7dmVjNH0gb3V0XG4gKi9cbnZlYzQubGVycCA9IGZ1bmN0aW9uIChvdXQsIGEsIGIsIHQpIHtcbiAgICB2YXIgYXggPSBhWzBdLFxuICAgICAgICBheSA9IGFbMV0sXG4gICAgICAgIGF6ID0gYVsyXSxcbiAgICAgICAgYXcgPSBhWzNdO1xuICAgIG91dFswXSA9IGF4ICsgdCAqIChiWzBdIC0gYXgpO1xuICAgIG91dFsxXSA9IGF5ICsgdCAqIChiWzFdIC0gYXkpO1xuICAgIG91dFsyXSA9IGF6ICsgdCAqIChiWzJdIC0gYXopO1xuICAgIG91dFszXSA9IGF3ICsgdCAqIChiWzNdIC0gYXcpO1xuICAgIHJldHVybiBvdXQ7XG59O1xuXG4vKipcbiAqIFRyYW5zZm9ybXMgdGhlIHZlYzQgd2l0aCBhIG1hdDQuXG4gKlxuICogQHBhcmFtIHt2ZWM0fSBvdXQgdGhlIHJlY2VpdmluZyB2ZWN0b3JcbiAqIEBwYXJhbSB7dmVjNH0gYSB0aGUgdmVjdG9yIHRvIHRyYW5zZm9ybVxuICogQHBhcmFtIHttYXQ0fSBtIG1hdHJpeCB0byB0cmFuc2Zvcm0gd2l0aFxuICogQHJldHVybnMge3ZlYzR9IG91dFxuICovXG52ZWM0LnRyYW5zZm9ybU1hdDQgPSBmdW5jdGlvbihvdXQsIGEsIG0pIHtcbiAgICB2YXIgeCA9IGFbMF0sIHkgPSBhWzFdLCB6ID0gYVsyXSwgdyA9IGFbM107XG4gICAgb3V0WzBdID0gbVswXSAqIHggKyBtWzRdICogeSArIG1bOF0gKiB6ICsgbVsxMl0gKiB3O1xuICAgIG91dFsxXSA9IG1bMV0gKiB4ICsgbVs1XSAqIHkgKyBtWzldICogeiArIG1bMTNdICogdztcbiAgICBvdXRbMl0gPSBtWzJdICogeCArIG1bNl0gKiB5ICsgbVsxMF0gKiB6ICsgbVsxNF0gKiB3O1xuICAgIG91dFszXSA9IG1bM10gKiB4ICsgbVs3XSAqIHkgKyBtWzExXSAqIHogKyBtWzE1XSAqIHc7XG4gICAgcmV0dXJuIG91dDtcbn07XG5cbi8qKlxuICogVHJhbnNmb3JtcyB0aGUgdmVjNCB3aXRoIGEgcXVhdFxuICpcbiAqIEBwYXJhbSB7dmVjNH0gb3V0IHRoZSByZWNlaXZpbmcgdmVjdG9yXG4gKiBAcGFyYW0ge3ZlYzR9IGEgdGhlIHZlY3RvciB0byB0cmFuc2Zvcm1cbiAqIEBwYXJhbSB7cXVhdH0gcSBxdWF0ZXJuaW9uIHRvIHRyYW5zZm9ybSB3aXRoXG4gKiBAcmV0dXJucyB7dmVjNH0gb3V0XG4gKi9cbnZlYzQudHJhbnNmb3JtUXVhdCA9IGZ1bmN0aW9uKG91dCwgYSwgcSkge1xuICAgIHZhciB4ID0gYVswXSwgeSA9IGFbMV0sIHogPSBhWzJdLFxuICAgICAgICBxeCA9IHFbMF0sIHF5ID0gcVsxXSwgcXogPSBxWzJdLCBxdyA9IHFbM10sXG5cbiAgICAgICAgLy8gY2FsY3VsYXRlIHF1YXQgKiB2ZWNcbiAgICAgICAgaXggPSBxdyAqIHggKyBxeSAqIHogLSBxeiAqIHksXG4gICAgICAgIGl5ID0gcXcgKiB5ICsgcXogKiB4IC0gcXggKiB6LFxuICAgICAgICBpeiA9IHF3ICogeiArIHF4ICogeSAtIHF5ICogeCxcbiAgICAgICAgaXcgPSAtcXggKiB4IC0gcXkgKiB5IC0gcXogKiB6O1xuXG4gICAgLy8gY2FsY3VsYXRlIHJlc3VsdCAqIGludmVyc2UgcXVhdFxuICAgIG91dFswXSA9IGl4ICogcXcgKyBpdyAqIC1xeCArIGl5ICogLXF6IC0gaXogKiAtcXk7XG4gICAgb3V0WzFdID0gaXkgKiBxdyArIGl3ICogLXF5ICsgaXogKiAtcXggLSBpeCAqIC1xejtcbiAgICBvdXRbMl0gPSBpeiAqIHF3ICsgaXcgKiAtcXogKyBpeCAqIC1xeSAtIGl5ICogLXF4O1xuICAgIHJldHVybiBvdXQ7XG59O1xuXG4vKipcbiAqIFBlcmZvcm0gc29tZSBvcGVyYXRpb24gb3ZlciBhbiBhcnJheSBvZiB2ZWM0cy5cbiAqXG4gKiBAcGFyYW0ge0FycmF5fSBhIHRoZSBhcnJheSBvZiB2ZWN0b3JzIHRvIGl0ZXJhdGUgb3ZlclxuICogQHBhcmFtIHtOdW1iZXJ9IHN0cmlkZSBOdW1iZXIgb2YgZWxlbWVudHMgYmV0d2VlbiB0aGUgc3RhcnQgb2YgZWFjaCB2ZWM0LiBJZiAwIGFzc3VtZXMgdGlnaHRseSBwYWNrZWRcbiAqIEBwYXJhbSB7TnVtYmVyfSBvZmZzZXQgTnVtYmVyIG9mIGVsZW1lbnRzIHRvIHNraXAgYXQgdGhlIGJlZ2lubmluZyBvZiB0aGUgYXJyYXlcbiAqIEBwYXJhbSB7TnVtYmVyfSBjb3VudCBOdW1iZXIgb2YgdmVjMnMgdG8gaXRlcmF0ZSBvdmVyLiBJZiAwIGl0ZXJhdGVzIG92ZXIgZW50aXJlIGFycmF5XG4gKiBAcGFyYW0ge0Z1bmN0aW9ufSBmbiBGdW5jdGlvbiB0byBjYWxsIGZvciBlYWNoIHZlY3RvciBpbiB0aGUgYXJyYXlcbiAqIEBwYXJhbSB7T2JqZWN0fSBbYXJnXSBhZGRpdGlvbmFsIGFyZ3VtZW50IHRvIHBhc3MgdG8gZm5cbiAqIEByZXR1cm5zIHtBcnJheX0gYVxuICogQGZ1bmN0aW9uXG4gKi9cbnZlYzQuZm9yRWFjaCA9IChmdW5jdGlvbigpIHtcbiAgICB2YXIgdmVjID0gdmVjNC5jcmVhdGUoKTtcblxuICAgIHJldHVybiBmdW5jdGlvbihhLCBzdHJpZGUsIG9mZnNldCwgY291bnQsIGZuLCBhcmcpIHtcbiAgICAgICAgdmFyIGksIGw7XG4gICAgICAgIGlmKCFzdHJpZGUpIHtcbiAgICAgICAgICAgIHN0cmlkZSA9IDQ7XG4gICAgICAgIH1cblxuICAgICAgICBpZighb2Zmc2V0KSB7XG4gICAgICAgICAgICBvZmZzZXQgPSAwO1xuICAgICAgICB9XG4gICAgICAgIFxuICAgICAgICBpZihjb3VudCkge1xuICAgICAgICAgICAgbCA9IE1hdGgubWluKChjb3VudCAqIHN0cmlkZSkgKyBvZmZzZXQsIGEubGVuZ3RoKTtcbiAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgIGwgPSBhLmxlbmd0aDtcbiAgICAgICAgfVxuXG4gICAgICAgIGZvcihpID0gb2Zmc2V0OyBpIDwgbDsgaSArPSBzdHJpZGUpIHtcbiAgICAgICAgICAgIHZlY1swXSA9IGFbaV07IHZlY1sxXSA9IGFbaSsxXTsgdmVjWzJdID0gYVtpKzJdOyB2ZWNbM10gPSBhW2krM107XG4gICAgICAgICAgICBmbih2ZWMsIHZlYywgYXJnKTtcbiAgICAgICAgICAgIGFbaV0gPSB2ZWNbMF07IGFbaSsxXSA9IHZlY1sxXTsgYVtpKzJdID0gdmVjWzJdOyBhW2krM10gPSB2ZWNbM107XG4gICAgICAgIH1cbiAgICAgICAgXG4gICAgICAgIHJldHVybiBhO1xuICAgIH07XG59KSgpO1xuXG4vKipcbiAqIFJldHVybnMgYSBzdHJpbmcgcmVwcmVzZW50YXRpb24gb2YgYSB2ZWN0b3JcbiAqXG4gKiBAcGFyYW0ge3ZlYzR9IHZlYyB2ZWN0b3IgdG8gcmVwcmVzZW50IGFzIGEgc3RyaW5nXG4gKiBAcmV0dXJucyB7U3RyaW5nfSBzdHJpbmcgcmVwcmVzZW50YXRpb24gb2YgdGhlIHZlY3RvclxuICovXG52ZWM0LnN0ciA9IGZ1bmN0aW9uIChhKSB7XG4gICAgcmV0dXJuICd2ZWM0KCcgKyBhWzBdICsgJywgJyArIGFbMV0gKyAnLCAnICsgYVsyXSArICcsICcgKyBhWzNdICsgJyknO1xufTtcblxuaWYodHlwZW9mKGV4cG9ydHMpICE9PSAndW5kZWZpbmVkJykge1xuICAgIGV4cG9ydHMudmVjNCA9IHZlYzQ7XG59XG47XG4vKiBDb3B5cmlnaHQgKGMpIDIwMTMsIEJyYW5kb24gSm9uZXMsIENvbGluIE1hY0tlbnppZSBJVi4gQWxsIHJpZ2h0cyByZXNlcnZlZC5cblxuUmVkaXN0cmlidXRpb24gYW5kIHVzZSBpbiBzb3VyY2UgYW5kIGJpbmFyeSBmb3Jtcywgd2l0aCBvciB3aXRob3V0IG1vZGlmaWNhdGlvbixcbmFyZSBwZXJtaXR0ZWQgcHJvdmlkZWQgdGhhdCB0aGUgZm9sbG93aW5nIGNvbmRpdGlvbnMgYXJlIG1ldDpcblxuICAqIFJlZGlzdHJpYnV0aW9ucyBvZiBzb3VyY2UgY29kZSBtdXN0IHJldGFpbiB0aGUgYWJvdmUgY29weXJpZ2h0IG5vdGljZSwgdGhpc1xuICAgIGxpc3Qgb2YgY29uZGl0aW9ucyBhbmQgdGhlIGZvbGxvd2luZyBkaXNjbGFpbWVyLlxuICAqIFJlZGlzdHJpYnV0aW9ucyBpbiBiaW5hcnkgZm9ybSBtdXN0IHJlcHJvZHVjZSB0aGUgYWJvdmUgY29weXJpZ2h0IG5vdGljZSxcbiAgICB0aGlzIGxpc3Qgb2YgY29uZGl0aW9ucyBhbmQgdGhlIGZvbGxvd2luZyBkaXNjbGFpbWVyIGluIHRoZSBkb2N1bWVudGF0aW9uIFxuICAgIGFuZC9vciBvdGhlciBtYXRlcmlhbHMgcHJvdmlkZWQgd2l0aCB0aGUgZGlzdHJpYnV0aW9uLlxuXG5USElTIFNPRlRXQVJFIElTIFBST1ZJREVEIEJZIFRIRSBDT1BZUklHSFQgSE9MREVSUyBBTkQgQ09OVFJJQlVUT1JTIFwiQVMgSVNcIiBBTkRcbkFOWSBFWFBSRVNTIE9SIElNUExJRUQgV0FSUkFOVElFUywgSU5DTFVESU5HLCBCVVQgTk9UIExJTUlURUQgVE8sIFRIRSBJTVBMSUVEXG5XQVJSQU5USUVTIE9GIE1FUkNIQU5UQUJJTElUWSBBTkQgRklUTkVTUyBGT1IgQSBQQVJUSUNVTEFSIFBVUlBPU0UgQVJFIFxuRElTQ0xBSU1FRC4gSU4gTk8gRVZFTlQgU0hBTEwgVEhFIENPUFlSSUdIVCBIT0xERVIgT1IgQ09OVFJJQlVUT1JTIEJFIExJQUJMRSBGT1JcbkFOWSBESVJFQ1QsIElORElSRUNULCBJTkNJREVOVEFMLCBTUEVDSUFMLCBFWEVNUExBUlksIE9SIENPTlNFUVVFTlRJQUwgREFNQUdFU1xuKElOQ0xVRElORywgQlVUIE5PVCBMSU1JVEVEIFRPLCBQUk9DVVJFTUVOVCBPRiBTVUJTVElUVVRFIEdPT0RTIE9SIFNFUlZJQ0VTO1xuTE9TUyBPRiBVU0UsIERBVEEsIE9SIFBST0ZJVFM7IE9SIEJVU0lORVNTIElOVEVSUlVQVElPTikgSE9XRVZFUiBDQVVTRUQgQU5EIE9OXG5BTlkgVEhFT1JZIE9GIExJQUJJTElUWSwgV0hFVEhFUiBJTiBDT05UUkFDVCwgU1RSSUNUIExJQUJJTElUWSwgT1IgVE9SVFxuKElOQ0xVRElORyBORUdMSUdFTkNFIE9SIE9USEVSV0lTRSkgQVJJU0lORyBJTiBBTlkgV0FZIE9VVCBPRiBUSEUgVVNFIE9GIFRISVNcblNPRlRXQVJFLCBFVkVOIElGIEFEVklTRUQgT0YgVEhFIFBPU1NJQklMSVRZIE9GIFNVQ0ggREFNQUdFLiAqL1xuXG4vKipcbiAqIEBjbGFzcyAyeDIgTWF0cml4XG4gKiBAbmFtZSBtYXQyXG4gKi9cblxudmFyIG1hdDIgPSB7fTtcblxudmFyIG1hdDJJZGVudGl0eSA9IG5ldyBGbG9hdDMyQXJyYXkoW1xuICAgIDEsIDAsXG4gICAgMCwgMVxuXSk7XG5cbi8qKlxuICogQ3JlYXRlcyBhIG5ldyBpZGVudGl0eSBtYXQyXG4gKlxuICogQHJldHVybnMge21hdDJ9IGEgbmV3IDJ4MiBtYXRyaXhcbiAqL1xubWF0Mi5jcmVhdGUgPSBmdW5jdGlvbigpIHtcbiAgICB2YXIgb3V0ID0gbmV3IEdMTUFUX0FSUkFZX1RZUEUoNCk7XG4gICAgb3V0WzBdID0gMTtcbiAgICBvdXRbMV0gPSAwO1xuICAgIG91dFsyXSA9IDA7XG4gICAgb3V0WzNdID0gMTtcbiAgICByZXR1cm4gb3V0O1xufTtcblxuLyoqXG4gKiBDcmVhdGVzIGEgbmV3IG1hdDIgaW5pdGlhbGl6ZWQgd2l0aCB2YWx1ZXMgZnJvbSBhbiBleGlzdGluZyBtYXRyaXhcbiAqXG4gKiBAcGFyYW0ge21hdDJ9IGEgbWF0cml4IHRvIGNsb25lXG4gKiBAcmV0dXJucyB7bWF0Mn0gYSBuZXcgMngyIG1hdHJpeFxuICovXG5tYXQyLmNsb25lID0gZnVuY3Rpb24oYSkge1xuICAgIHZhciBvdXQgPSBuZXcgR0xNQVRfQVJSQVlfVFlQRSg0KTtcbiAgICBvdXRbMF0gPSBhWzBdO1xuICAgIG91dFsxXSA9IGFbMV07XG4gICAgb3V0WzJdID0gYVsyXTtcbiAgICBvdXRbM10gPSBhWzNdO1xuICAgIHJldHVybiBvdXQ7XG59O1xuXG4vKipcbiAqIENvcHkgdGhlIHZhbHVlcyBmcm9tIG9uZSBtYXQyIHRvIGFub3RoZXJcbiAqXG4gKiBAcGFyYW0ge21hdDJ9IG91dCB0aGUgcmVjZWl2aW5nIG1hdHJpeFxuICogQHBhcmFtIHttYXQyfSBhIHRoZSBzb3VyY2UgbWF0cml4XG4gKiBAcmV0dXJucyB7bWF0Mn0gb3V0XG4gKi9cbm1hdDIuY29weSA9IGZ1bmN0aW9uKG91dCwgYSkge1xuICAgIG91dFswXSA9IGFbMF07XG4gICAgb3V0WzFdID0gYVsxXTtcbiAgICBvdXRbMl0gPSBhWzJdO1xuICAgIG91dFszXSA9IGFbM107XG4gICAgcmV0dXJuIG91dDtcbn07XG5cbi8qKlxuICogU2V0IGEgbWF0MiB0byB0aGUgaWRlbnRpdHkgbWF0cml4XG4gKlxuICogQHBhcmFtIHttYXQyfSBvdXQgdGhlIHJlY2VpdmluZyBtYXRyaXhcbiAqIEByZXR1cm5zIHttYXQyfSBvdXRcbiAqL1xubWF0Mi5pZGVudGl0eSA9IGZ1bmN0aW9uKG91dCkge1xuICAgIG91dFswXSA9IDE7XG4gICAgb3V0WzFdID0gMDtcbiAgICBvdXRbMl0gPSAwO1xuICAgIG91dFszXSA9IDE7XG4gICAgcmV0dXJuIG91dDtcbn07XG5cbi8qKlxuICogVHJhbnNwb3NlIHRoZSB2YWx1ZXMgb2YgYSBtYXQyXG4gKlxuICogQHBhcmFtIHttYXQyfSBvdXQgdGhlIHJlY2VpdmluZyBtYXRyaXhcbiAqIEBwYXJhbSB7bWF0Mn0gYSB0aGUgc291cmNlIG1hdHJpeFxuICogQHJldHVybnMge21hdDJ9IG91dFxuICovXG5tYXQyLnRyYW5zcG9zZSA9IGZ1bmN0aW9uKG91dCwgYSkge1xuICAgIC8vIElmIHdlIGFyZSB0cmFuc3Bvc2luZyBvdXJzZWx2ZXMgd2UgY2FuIHNraXAgYSBmZXcgc3RlcHMgYnV0IGhhdmUgdG8gY2FjaGUgc29tZSB2YWx1ZXNcbiAgICBpZiAob3V0ID09PSBhKSB7XG4gICAgICAgIHZhciBhMSA9IGFbMV07XG4gICAgICAgIG91dFsxXSA9IGFbMl07XG4gICAgICAgIG91dFsyXSA9IGExO1xuICAgIH0gZWxzZSB7XG4gICAgICAgIG91dFswXSA9IGFbMF07XG4gICAgICAgIG91dFsxXSA9IGFbMl07XG4gICAgICAgIG91dFsyXSA9IGFbMV07XG4gICAgICAgIG91dFszXSA9IGFbM107XG4gICAgfVxuICAgIFxuICAgIHJldHVybiBvdXQ7XG59O1xuXG4vKipcbiAqIEludmVydHMgYSBtYXQyXG4gKlxuICogQHBhcmFtIHttYXQyfSBvdXQgdGhlIHJlY2VpdmluZyBtYXRyaXhcbiAqIEBwYXJhbSB7bWF0Mn0gYSB0aGUgc291cmNlIG1hdHJpeFxuICogQHJldHVybnMge21hdDJ9IG91dFxuICovXG5tYXQyLmludmVydCA9IGZ1bmN0aW9uKG91dCwgYSkge1xuICAgIHZhciBhMCA9IGFbMF0sIGExID0gYVsxXSwgYTIgPSBhWzJdLCBhMyA9IGFbM10sXG5cbiAgICAgICAgLy8gQ2FsY3VsYXRlIHRoZSBkZXRlcm1pbmFudFxuICAgICAgICBkZXQgPSBhMCAqIGEzIC0gYTIgKiBhMTtcblxuICAgIGlmICghZGV0KSB7XG4gICAgICAgIHJldHVybiBudWxsO1xuICAgIH1cbiAgICBkZXQgPSAxLjAgLyBkZXQ7XG4gICAgXG4gICAgb3V0WzBdID0gIGEzICogZGV0O1xuICAgIG91dFsxXSA9IC1hMSAqIGRldDtcbiAgICBvdXRbMl0gPSAtYTIgKiBkZXQ7XG4gICAgb3V0WzNdID0gIGEwICogZGV0O1xuXG4gICAgcmV0dXJuIG91dDtcbn07XG5cbi8qKlxuICogQ2FsY3VsYXRlcyB0aGUgYWRqdWdhdGUgb2YgYSBtYXQyXG4gKlxuICogQHBhcmFtIHttYXQyfSBvdXQgdGhlIHJlY2VpdmluZyBtYXRyaXhcbiAqIEBwYXJhbSB7bWF0Mn0gYSB0aGUgc291cmNlIG1hdHJpeFxuICogQHJldHVybnMge21hdDJ9IG91dFxuICovXG5tYXQyLmFkam9pbnQgPSBmdW5jdGlvbihvdXQsIGEpIHtcbiAgICAvLyBDYWNoaW5nIHRoaXMgdmFsdWUgaXMgbmVzc2VjYXJ5IGlmIG91dCA9PSBhXG4gICAgdmFyIGEwID0gYVswXTtcbiAgICBvdXRbMF0gPSAgYVszXTtcbiAgICBvdXRbMV0gPSAtYVsxXTtcbiAgICBvdXRbMl0gPSAtYVsyXTtcbiAgICBvdXRbM10gPSAgYTA7XG5cbiAgICByZXR1cm4gb3V0O1xufTtcblxuLyoqXG4gKiBDYWxjdWxhdGVzIHRoZSBkZXRlcm1pbmFudCBvZiBhIG1hdDJcbiAqXG4gKiBAcGFyYW0ge21hdDJ9IGEgdGhlIHNvdXJjZSBtYXRyaXhcbiAqIEByZXR1cm5zIHtOdW1iZXJ9IGRldGVybWluYW50IG9mIGFcbiAqL1xubWF0Mi5kZXRlcm1pbmFudCA9IGZ1bmN0aW9uIChhKSB7XG4gICAgcmV0dXJuIGFbMF0gKiBhWzNdIC0gYVsyXSAqIGFbMV07XG59O1xuXG4vKipcbiAqIE11bHRpcGxpZXMgdHdvIG1hdDInc1xuICpcbiAqIEBwYXJhbSB7bWF0Mn0gb3V0IHRoZSByZWNlaXZpbmcgbWF0cml4XG4gKiBAcGFyYW0ge21hdDJ9IGEgdGhlIGZpcnN0IG9wZXJhbmRcbiAqIEBwYXJhbSB7bWF0Mn0gYiB0aGUgc2Vjb25kIG9wZXJhbmRcbiAqIEByZXR1cm5zIHttYXQyfSBvdXRcbiAqL1xubWF0Mi5tdWx0aXBseSA9IGZ1bmN0aW9uIChvdXQsIGEsIGIpIHtcbiAgICB2YXIgYTAgPSBhWzBdLCBhMSA9IGFbMV0sIGEyID0gYVsyXSwgYTMgPSBhWzNdO1xuICAgIHZhciBiMCA9IGJbMF0sIGIxID0gYlsxXSwgYjIgPSBiWzJdLCBiMyA9IGJbM107XG4gICAgb3V0WzBdID0gYTAgKiBiMCArIGExICogYjI7XG4gICAgb3V0WzFdID0gYTAgKiBiMSArIGExICogYjM7XG4gICAgb3V0WzJdID0gYTIgKiBiMCArIGEzICogYjI7XG4gICAgb3V0WzNdID0gYTIgKiBiMSArIGEzICogYjM7XG4gICAgcmV0dXJuIG91dDtcbn07XG5cbi8qKlxuICogQWxpYXMgZm9yIHtAbGluayBtYXQyLm11bHRpcGx5fVxuICogQGZ1bmN0aW9uXG4gKi9cbm1hdDIubXVsID0gbWF0Mi5tdWx0aXBseTtcblxuLyoqXG4gKiBSb3RhdGVzIGEgbWF0MiBieSB0aGUgZ2l2ZW4gYW5nbGVcbiAqXG4gKiBAcGFyYW0ge21hdDJ9IG91dCB0aGUgcmVjZWl2aW5nIG1hdHJpeFxuICogQHBhcmFtIHttYXQyfSBhIHRoZSBtYXRyaXggdG8gcm90YXRlXG4gKiBAcGFyYW0ge051bWJlcn0gcmFkIHRoZSBhbmdsZSB0byByb3RhdGUgdGhlIG1hdHJpeCBieVxuICogQHJldHVybnMge21hdDJ9IG91dFxuICovXG5tYXQyLnJvdGF0ZSA9IGZ1bmN0aW9uIChvdXQsIGEsIHJhZCkge1xuICAgIHZhciBhMCA9IGFbMF0sIGExID0gYVsxXSwgYTIgPSBhWzJdLCBhMyA9IGFbM10sXG4gICAgICAgIHMgPSBNYXRoLnNpbihyYWQpLFxuICAgICAgICBjID0gTWF0aC5jb3MocmFkKTtcbiAgICBvdXRbMF0gPSBhMCAqICBjICsgYTEgKiBzO1xuICAgIG91dFsxXSA9IGEwICogLXMgKyBhMSAqIGM7XG4gICAgb3V0WzJdID0gYTIgKiAgYyArIGEzICogcztcbiAgICBvdXRbM10gPSBhMiAqIC1zICsgYTMgKiBjO1xuICAgIHJldHVybiBvdXQ7XG59O1xuXG4vKipcbiAqIFNjYWxlcyB0aGUgbWF0MiBieSB0aGUgZGltZW5zaW9ucyBpbiB0aGUgZ2l2ZW4gdmVjMlxuICpcbiAqIEBwYXJhbSB7bWF0Mn0gb3V0IHRoZSByZWNlaXZpbmcgbWF0cml4XG4gKiBAcGFyYW0ge21hdDJ9IGEgdGhlIG1hdHJpeCB0byByb3RhdGVcbiAqIEBwYXJhbSB7dmVjMn0gdiB0aGUgdmVjMiB0byBzY2FsZSB0aGUgbWF0cml4IGJ5XG4gKiBAcmV0dXJucyB7bWF0Mn0gb3V0XG4gKiovXG5tYXQyLnNjYWxlID0gZnVuY3Rpb24ob3V0LCBhLCB2KSB7XG4gICAgdmFyIGEwID0gYVswXSwgYTEgPSBhWzFdLCBhMiA9IGFbMl0sIGEzID0gYVszXSxcbiAgICAgICAgdjAgPSB2WzBdLCB2MSA9IHZbMV07XG4gICAgb3V0WzBdID0gYTAgKiB2MDtcbiAgICBvdXRbMV0gPSBhMSAqIHYxO1xuICAgIG91dFsyXSA9IGEyICogdjA7XG4gICAgb3V0WzNdID0gYTMgKiB2MTtcbiAgICByZXR1cm4gb3V0O1xufTtcblxuLyoqXG4gKiBSZXR1cm5zIGEgc3RyaW5nIHJlcHJlc2VudGF0aW9uIG9mIGEgbWF0MlxuICpcbiAqIEBwYXJhbSB7bWF0Mn0gbWF0IG1hdHJpeCB0byByZXByZXNlbnQgYXMgYSBzdHJpbmdcbiAqIEByZXR1cm5zIHtTdHJpbmd9IHN0cmluZyByZXByZXNlbnRhdGlvbiBvZiB0aGUgbWF0cml4XG4gKi9cbm1hdDIuc3RyID0gZnVuY3Rpb24gKGEpIHtcbiAgICByZXR1cm4gJ21hdDIoJyArIGFbMF0gKyAnLCAnICsgYVsxXSArICcsICcgKyBhWzJdICsgJywgJyArIGFbM10gKyAnKSc7XG59O1xuXG5pZih0eXBlb2YoZXhwb3J0cykgIT09ICd1bmRlZmluZWQnKSB7XG4gICAgZXhwb3J0cy5tYXQyID0gbWF0Mjtcbn1cbjtcbi8qIENvcHlyaWdodCAoYykgMjAxMywgQnJhbmRvbiBKb25lcywgQ29saW4gTWFjS2VuemllIElWLiBBbGwgcmlnaHRzIHJlc2VydmVkLlxuXG5SZWRpc3RyaWJ1dGlvbiBhbmQgdXNlIGluIHNvdXJjZSBhbmQgYmluYXJ5IGZvcm1zLCB3aXRoIG9yIHdpdGhvdXQgbW9kaWZpY2F0aW9uLFxuYXJlIHBlcm1pdHRlZCBwcm92aWRlZCB0aGF0IHRoZSBmb2xsb3dpbmcgY29uZGl0aW9ucyBhcmUgbWV0OlxuXG4gICogUmVkaXN0cmlidXRpb25zIG9mIHNvdXJjZSBjb2RlIG11c3QgcmV0YWluIHRoZSBhYm92ZSBjb3B5cmlnaHQgbm90aWNlLCB0aGlzXG4gICAgbGlzdCBvZiBjb25kaXRpb25zIGFuZCB0aGUgZm9sbG93aW5nIGRpc2NsYWltZXIuXG4gICogUmVkaXN0cmlidXRpb25zIGluIGJpbmFyeSBmb3JtIG11c3QgcmVwcm9kdWNlIHRoZSBhYm92ZSBjb3B5cmlnaHQgbm90aWNlLFxuICAgIHRoaXMgbGlzdCBvZiBjb25kaXRpb25zIGFuZCB0aGUgZm9sbG93aW5nIGRpc2NsYWltZXIgaW4gdGhlIGRvY3VtZW50YXRpb24gXG4gICAgYW5kL29yIG90aGVyIG1hdGVyaWFscyBwcm92aWRlZCB3aXRoIHRoZSBkaXN0cmlidXRpb24uXG5cblRISVMgU09GVFdBUkUgSVMgUFJPVklERUQgQlkgVEhFIENPUFlSSUdIVCBIT0xERVJTIEFORCBDT05UUklCVVRPUlMgXCJBUyBJU1wiIEFORFxuQU5ZIEVYUFJFU1MgT1IgSU1QTElFRCBXQVJSQU5USUVTLCBJTkNMVURJTkcsIEJVVCBOT1QgTElNSVRFRCBUTywgVEhFIElNUExJRURcbldBUlJBTlRJRVMgT0YgTUVSQ0hBTlRBQklMSVRZIEFORCBGSVRORVNTIEZPUiBBIFBBUlRJQ1VMQVIgUFVSUE9TRSBBUkUgXG5ESVNDTEFJTUVELiBJTiBOTyBFVkVOVCBTSEFMTCBUSEUgQ09QWVJJR0hUIEhPTERFUiBPUiBDT05UUklCVVRPUlMgQkUgTElBQkxFIEZPUlxuQU5ZIERJUkVDVCwgSU5ESVJFQ1QsIElOQ0lERU5UQUwsIFNQRUNJQUwsIEVYRU1QTEFSWSwgT1IgQ09OU0VRVUVOVElBTCBEQU1BR0VTXG4oSU5DTFVESU5HLCBCVVQgTk9UIExJTUlURUQgVE8sIFBST0NVUkVNRU5UIE9GIFNVQlNUSVRVVEUgR09PRFMgT1IgU0VSVklDRVM7XG5MT1NTIE9GIFVTRSwgREFUQSwgT1IgUFJPRklUUzsgT1IgQlVTSU5FU1MgSU5URVJSVVBUSU9OKSBIT1dFVkVSIENBVVNFRCBBTkQgT05cbkFOWSBUSEVPUlkgT0YgTElBQklMSVRZLCBXSEVUSEVSIElOIENPTlRSQUNULCBTVFJJQ1QgTElBQklMSVRZLCBPUiBUT1JUXG4oSU5DTFVESU5HIE5FR0xJR0VOQ0UgT1IgT1RIRVJXSVNFKSBBUklTSU5HIElOIEFOWSBXQVkgT1VUIE9GIFRIRSBVU0UgT0YgVEhJU1xuU09GVFdBUkUsIEVWRU4gSUYgQURWSVNFRCBPRiBUSEUgUE9TU0lCSUxJVFkgT0YgU1VDSCBEQU1BR0UuICovXG5cbi8qKlxuICogQGNsYXNzIDJ4MyBNYXRyaXhcbiAqIEBuYW1lIG1hdDJkXG4gKiBcbiAqIEBkZXNjcmlwdGlvbiBcbiAqIEEgbWF0MmQgY29udGFpbnMgc2l4IGVsZW1lbnRzIGRlZmluZWQgYXM6XG4gKiA8cHJlPlxuICogW2EsIGIsXG4gKiAgYywgZCxcbiAqICB0eCx0eV1cbiAqIDwvcHJlPlxuICogVGhpcyBpcyBhIHNob3J0IGZvcm0gZm9yIHRoZSAzeDMgbWF0cml4OlxuICogPHByZT5cbiAqIFthLCBiLCAwXG4gKiAgYywgZCwgMFxuICogIHR4LHR5LDFdXG4gKiA8L3ByZT5cbiAqIFRoZSBsYXN0IGNvbHVtbiBpcyBpZ25vcmVkIHNvIHRoZSBhcnJheSBpcyBzaG9ydGVyIGFuZCBvcGVyYXRpb25zIGFyZSBmYXN0ZXIuXG4gKi9cblxudmFyIG1hdDJkID0ge307XG5cbnZhciBtYXQyZElkZW50aXR5ID0gbmV3IEZsb2F0MzJBcnJheShbXG4gICAgMSwgMCxcbiAgICAwLCAxLFxuICAgIDAsIDBcbl0pO1xuXG4vKipcbiAqIENyZWF0ZXMgYSBuZXcgaWRlbnRpdHkgbWF0MmRcbiAqXG4gKiBAcmV0dXJucyB7bWF0MmR9IGEgbmV3IDJ4MyBtYXRyaXhcbiAqL1xubWF0MmQuY3JlYXRlID0gZnVuY3Rpb24oKSB7XG4gICAgdmFyIG91dCA9IG5ldyBHTE1BVF9BUlJBWV9UWVBFKDYpO1xuICAgIG91dFswXSA9IDE7XG4gICAgb3V0WzFdID0gMDtcbiAgICBvdXRbMl0gPSAwO1xuICAgIG91dFszXSA9IDE7XG4gICAgb3V0WzRdID0gMDtcbiAgICBvdXRbNV0gPSAwO1xuICAgIHJldHVybiBvdXQ7XG59O1xuXG4vKipcbiAqIENyZWF0ZXMgYSBuZXcgbWF0MmQgaW5pdGlhbGl6ZWQgd2l0aCB2YWx1ZXMgZnJvbSBhbiBleGlzdGluZyBtYXRyaXhcbiAqXG4gKiBAcGFyYW0ge21hdDJkfSBhIG1hdHJpeCB0byBjbG9uZVxuICogQHJldHVybnMge21hdDJkfSBhIG5ldyAyeDMgbWF0cml4XG4gKi9cbm1hdDJkLmNsb25lID0gZnVuY3Rpb24oYSkge1xuICAgIHZhciBvdXQgPSBuZXcgR0xNQVRfQVJSQVlfVFlQRSg2KTtcbiAgICBvdXRbMF0gPSBhWzBdO1xuICAgIG91dFsxXSA9IGFbMV07XG4gICAgb3V0WzJdID0gYVsyXTtcbiAgICBvdXRbM10gPSBhWzNdO1xuICAgIG91dFs0XSA9IGFbNF07XG4gICAgb3V0WzVdID0gYVs1XTtcbiAgICByZXR1cm4gb3V0O1xufTtcblxuLyoqXG4gKiBDb3B5IHRoZSB2YWx1ZXMgZnJvbSBvbmUgbWF0MmQgdG8gYW5vdGhlclxuICpcbiAqIEBwYXJhbSB7bWF0MmR9IG91dCB0aGUgcmVjZWl2aW5nIG1hdHJpeFxuICogQHBhcmFtIHttYXQyZH0gYSB0aGUgc291cmNlIG1hdHJpeFxuICogQHJldHVybnMge21hdDJkfSBvdXRcbiAqL1xubWF0MmQuY29weSA9IGZ1bmN0aW9uKG91dCwgYSkge1xuICAgIG91dFswXSA9IGFbMF07XG4gICAgb3V0WzFdID0gYVsxXTtcbiAgICBvdXRbMl0gPSBhWzJdO1xuICAgIG91dFszXSA9IGFbM107XG4gICAgb3V0WzRdID0gYVs0XTtcbiAgICBvdXRbNV0gPSBhWzVdO1xuICAgIHJldHVybiBvdXQ7XG59O1xuXG4vKipcbiAqIFNldCBhIG1hdDJkIHRvIHRoZSBpZGVudGl0eSBtYXRyaXhcbiAqXG4gKiBAcGFyYW0ge21hdDJkfSBvdXQgdGhlIHJlY2VpdmluZyBtYXRyaXhcbiAqIEByZXR1cm5zIHttYXQyZH0gb3V0XG4gKi9cbm1hdDJkLmlkZW50aXR5ID0gZnVuY3Rpb24ob3V0KSB7XG4gICAgb3V0WzBdID0gMTtcbiAgICBvdXRbMV0gPSAwO1xuICAgIG91dFsyXSA9IDA7XG4gICAgb3V0WzNdID0gMTtcbiAgICBvdXRbNF0gPSAwO1xuICAgIG91dFs1XSA9IDA7XG4gICAgcmV0dXJuIG91dDtcbn07XG5cbi8qKlxuICogSW52ZXJ0cyBhIG1hdDJkXG4gKlxuICogQHBhcmFtIHttYXQyZH0gb3V0IHRoZSByZWNlaXZpbmcgbWF0cml4XG4gKiBAcGFyYW0ge21hdDJkfSBhIHRoZSBzb3VyY2UgbWF0cml4XG4gKiBAcmV0dXJucyB7bWF0MmR9IG91dFxuICovXG5tYXQyZC5pbnZlcnQgPSBmdW5jdGlvbihvdXQsIGEpIHtcbiAgICB2YXIgYWEgPSBhWzBdLCBhYiA9IGFbMV0sIGFjID0gYVsyXSwgYWQgPSBhWzNdLFxuICAgICAgICBhdHggPSBhWzRdLCBhdHkgPSBhWzVdO1xuXG4gICAgdmFyIGRldCA9IGFhICogYWQgLSBhYiAqIGFjO1xuICAgIGlmKCFkZXQpe1xuICAgICAgICByZXR1cm4gbnVsbDtcbiAgICB9XG4gICAgZGV0ID0gMS4wIC8gZGV0O1xuXG4gICAgb3V0WzBdID0gYWQgKiBkZXQ7XG4gICAgb3V0WzFdID0gLWFiICogZGV0O1xuICAgIG91dFsyXSA9IC1hYyAqIGRldDtcbiAgICBvdXRbM10gPSBhYSAqIGRldDtcbiAgICBvdXRbNF0gPSAoYWMgKiBhdHkgLSBhZCAqIGF0eCkgKiBkZXQ7XG4gICAgb3V0WzVdID0gKGFiICogYXR4IC0gYWEgKiBhdHkpICogZGV0O1xuICAgIHJldHVybiBvdXQ7XG59O1xuXG4vKipcbiAqIENhbGN1bGF0ZXMgdGhlIGRldGVybWluYW50IG9mIGEgbWF0MmRcbiAqXG4gKiBAcGFyYW0ge21hdDJkfSBhIHRoZSBzb3VyY2UgbWF0cml4XG4gKiBAcmV0dXJucyB7TnVtYmVyfSBkZXRlcm1pbmFudCBvZiBhXG4gKi9cbm1hdDJkLmRldGVybWluYW50ID0gZnVuY3Rpb24gKGEpIHtcbiAgICByZXR1cm4gYVswXSAqIGFbM10gLSBhWzFdICogYVsyXTtcbn07XG5cbi8qKlxuICogTXVsdGlwbGllcyB0d28gbWF0MmQnc1xuICpcbiAqIEBwYXJhbSB7bWF0MmR9IG91dCB0aGUgcmVjZWl2aW5nIG1hdHJpeFxuICogQHBhcmFtIHttYXQyZH0gYSB0aGUgZmlyc3Qgb3BlcmFuZFxuICogQHBhcmFtIHttYXQyZH0gYiB0aGUgc2Vjb25kIG9wZXJhbmRcbiAqIEByZXR1cm5zIHttYXQyZH0gb3V0XG4gKi9cbm1hdDJkLm11bHRpcGx5ID0gZnVuY3Rpb24gKG91dCwgYSwgYikge1xuICAgIHZhciBhYSA9IGFbMF0sIGFiID0gYVsxXSwgYWMgPSBhWzJdLCBhZCA9IGFbM10sXG4gICAgICAgIGF0eCA9IGFbNF0sIGF0eSA9IGFbNV0sXG4gICAgICAgIGJhID0gYlswXSwgYmIgPSBiWzFdLCBiYyA9IGJbMl0sIGJkID0gYlszXSxcbiAgICAgICAgYnR4ID0gYls0XSwgYnR5ID0gYls1XTtcblxuICAgIG91dFswXSA9IGFhKmJhICsgYWIqYmM7XG4gICAgb3V0WzFdID0gYWEqYmIgKyBhYipiZDtcbiAgICBvdXRbMl0gPSBhYypiYSArIGFkKmJjO1xuICAgIG91dFszXSA9IGFjKmJiICsgYWQqYmQ7XG4gICAgb3V0WzRdID0gYmEqYXR4ICsgYmMqYXR5ICsgYnR4O1xuICAgIG91dFs1XSA9IGJiKmF0eCArIGJkKmF0eSArIGJ0eTtcbiAgICByZXR1cm4gb3V0O1xufTtcblxuLyoqXG4gKiBBbGlhcyBmb3Ige0BsaW5rIG1hdDJkLm11bHRpcGx5fVxuICogQGZ1bmN0aW9uXG4gKi9cbm1hdDJkLm11bCA9IG1hdDJkLm11bHRpcGx5O1xuXG5cbi8qKlxuICogUm90YXRlcyBhIG1hdDJkIGJ5IHRoZSBnaXZlbiBhbmdsZVxuICpcbiAqIEBwYXJhbSB7bWF0MmR9IG91dCB0aGUgcmVjZWl2aW5nIG1hdHJpeFxuICogQHBhcmFtIHttYXQyZH0gYSB0aGUgbWF0cml4IHRvIHJvdGF0ZVxuICogQHBhcmFtIHtOdW1iZXJ9IHJhZCB0aGUgYW5nbGUgdG8gcm90YXRlIHRoZSBtYXRyaXggYnlcbiAqIEByZXR1cm5zIHttYXQyZH0gb3V0XG4gKi9cbm1hdDJkLnJvdGF0ZSA9IGZ1bmN0aW9uIChvdXQsIGEsIHJhZCkge1xuICAgIHZhciBhYSA9IGFbMF0sXG4gICAgICAgIGFiID0gYVsxXSxcbiAgICAgICAgYWMgPSBhWzJdLFxuICAgICAgICBhZCA9IGFbM10sXG4gICAgICAgIGF0eCA9IGFbNF0sXG4gICAgICAgIGF0eSA9IGFbNV0sXG4gICAgICAgIHN0ID0gTWF0aC5zaW4ocmFkKSxcbiAgICAgICAgY3QgPSBNYXRoLmNvcyhyYWQpO1xuXG4gICAgb3V0WzBdID0gYWEqY3QgKyBhYipzdDtcbiAgICBvdXRbMV0gPSAtYWEqc3QgKyBhYipjdDtcbiAgICBvdXRbMl0gPSBhYypjdCArIGFkKnN0O1xuICAgIG91dFszXSA9IC1hYypzdCArIGN0KmFkO1xuICAgIG91dFs0XSA9IGN0KmF0eCArIHN0KmF0eTtcbiAgICBvdXRbNV0gPSBjdCphdHkgLSBzdCphdHg7XG4gICAgcmV0dXJuIG91dDtcbn07XG5cbi8qKlxuICogU2NhbGVzIHRoZSBtYXQyZCBieSB0aGUgZGltZW5zaW9ucyBpbiB0aGUgZ2l2ZW4gdmVjMlxuICpcbiAqIEBwYXJhbSB7bWF0MmR9IG91dCB0aGUgcmVjZWl2aW5nIG1hdHJpeFxuICogQHBhcmFtIHttYXQyZH0gYSB0aGUgbWF0cml4IHRvIHRyYW5zbGF0ZVxuICogQHBhcmFtIHttYXQyZH0gdiB0aGUgdmVjMiB0byBzY2FsZSB0aGUgbWF0cml4IGJ5XG4gKiBAcmV0dXJucyB7bWF0MmR9IG91dFxuICoqL1xubWF0MmQuc2NhbGUgPSBmdW5jdGlvbihvdXQsIGEsIHYpIHtcbiAgICB2YXIgdnggPSB2WzBdLCB2eSA9IHZbMV07XG4gICAgb3V0WzBdID0gYVswXSAqIHZ4O1xuICAgIG91dFsxXSA9IGFbMV0gKiB2eTtcbiAgICBvdXRbMl0gPSBhWzJdICogdng7XG4gICAgb3V0WzNdID0gYVszXSAqIHZ5O1xuICAgIG91dFs0XSA9IGFbNF0gKiB2eDtcbiAgICBvdXRbNV0gPSBhWzVdICogdnk7XG4gICAgcmV0dXJuIG91dDtcbn07XG5cbi8qKlxuICogVHJhbnNsYXRlcyB0aGUgbWF0MmQgYnkgdGhlIGRpbWVuc2lvbnMgaW4gdGhlIGdpdmVuIHZlYzJcbiAqXG4gKiBAcGFyYW0ge21hdDJkfSBvdXQgdGhlIHJlY2VpdmluZyBtYXRyaXhcbiAqIEBwYXJhbSB7bWF0MmR9IGEgdGhlIG1hdHJpeCB0byB0cmFuc2xhdGVcbiAqIEBwYXJhbSB7bWF0MmR9IHYgdGhlIHZlYzIgdG8gdHJhbnNsYXRlIHRoZSBtYXRyaXggYnlcbiAqIEByZXR1cm5zIHttYXQyZH0gb3V0XG4gKiovXG5tYXQyZC50cmFuc2xhdGUgPSBmdW5jdGlvbihvdXQsIGEsIHYpIHtcbiAgICBvdXRbMF0gPSBhWzBdO1xuICAgIG91dFsxXSA9IGFbMV07XG4gICAgb3V0WzJdID0gYVsyXTtcbiAgICBvdXRbM10gPSBhWzNdO1xuICAgIG91dFs0XSA9IGFbNF0gKyB2WzBdO1xuICAgIG91dFs1XSA9IGFbNV0gKyB2WzFdO1xuICAgIHJldHVybiBvdXQ7XG59O1xuXG4vKipcbiAqIFJldHVybnMgYSBzdHJpbmcgcmVwcmVzZW50YXRpb24gb2YgYSBtYXQyZFxuICpcbiAqIEBwYXJhbSB7bWF0MmR9IGEgbWF0cml4IHRvIHJlcHJlc2VudCBhcyBhIHN0cmluZ1xuICogQHJldHVybnMge1N0cmluZ30gc3RyaW5nIHJlcHJlc2VudGF0aW9uIG9mIHRoZSBtYXRyaXhcbiAqL1xubWF0MmQuc3RyID0gZnVuY3Rpb24gKGEpIHtcbiAgICByZXR1cm4gJ21hdDJkKCcgKyBhWzBdICsgJywgJyArIGFbMV0gKyAnLCAnICsgYVsyXSArICcsICcgKyBcbiAgICAgICAgICAgICAgICAgICAgYVszXSArICcsICcgKyBhWzRdICsgJywgJyArIGFbNV0gKyAnKSc7XG59O1xuXG5pZih0eXBlb2YoZXhwb3J0cykgIT09ICd1bmRlZmluZWQnKSB7XG4gICAgZXhwb3J0cy5tYXQyZCA9IG1hdDJkO1xufVxuO1xuLyogQ29weXJpZ2h0IChjKSAyMDEzLCBCcmFuZG9uIEpvbmVzLCBDb2xpbiBNYWNLZW56aWUgSVYuIEFsbCByaWdodHMgcmVzZXJ2ZWQuXG5cblJlZGlzdHJpYnV0aW9uIGFuZCB1c2UgaW4gc291cmNlIGFuZCBiaW5hcnkgZm9ybXMsIHdpdGggb3Igd2l0aG91dCBtb2RpZmljYXRpb24sXG5hcmUgcGVybWl0dGVkIHByb3ZpZGVkIHRoYXQgdGhlIGZvbGxvd2luZyBjb25kaXRpb25zIGFyZSBtZXQ6XG5cbiAgKiBSZWRpc3RyaWJ1dGlvbnMgb2Ygc291cmNlIGNvZGUgbXVzdCByZXRhaW4gdGhlIGFib3ZlIGNvcHlyaWdodCBub3RpY2UsIHRoaXNcbiAgICBsaXN0IG9mIGNvbmRpdGlvbnMgYW5kIHRoZSBmb2xsb3dpbmcgZGlzY2xhaW1lci5cbiAgKiBSZWRpc3RyaWJ1dGlvbnMgaW4gYmluYXJ5IGZvcm0gbXVzdCByZXByb2R1Y2UgdGhlIGFib3ZlIGNvcHlyaWdodCBub3RpY2UsXG4gICAgdGhpcyBsaXN0IG9mIGNvbmRpdGlvbnMgYW5kIHRoZSBmb2xsb3dpbmcgZGlzY2xhaW1lciBpbiB0aGUgZG9jdW1lbnRhdGlvbiBcbiAgICBhbmQvb3Igb3RoZXIgbWF0ZXJpYWxzIHByb3ZpZGVkIHdpdGggdGhlIGRpc3RyaWJ1dGlvbi5cblxuVEhJUyBTT0ZUV0FSRSBJUyBQUk9WSURFRCBCWSBUSEUgQ09QWVJJR0hUIEhPTERFUlMgQU5EIENPTlRSSUJVVE9SUyBcIkFTIElTXCIgQU5EXG5BTlkgRVhQUkVTUyBPUiBJTVBMSUVEIFdBUlJBTlRJRVMsIElOQ0xVRElORywgQlVUIE5PVCBMSU1JVEVEIFRPLCBUSEUgSU1QTElFRFxuV0FSUkFOVElFUyBPRiBNRVJDSEFOVEFCSUxJVFkgQU5EIEZJVE5FU1MgRk9SIEEgUEFSVElDVUxBUiBQVVJQT1NFIEFSRSBcbkRJU0NMQUlNRUQuIElOIE5PIEVWRU5UIFNIQUxMIFRIRSBDT1BZUklHSFQgSE9MREVSIE9SIENPTlRSSUJVVE9SUyBCRSBMSUFCTEUgRk9SXG5BTlkgRElSRUNULCBJTkRJUkVDVCwgSU5DSURFTlRBTCwgU1BFQ0lBTCwgRVhFTVBMQVJZLCBPUiBDT05TRVFVRU5USUFMIERBTUFHRVNcbihJTkNMVURJTkcsIEJVVCBOT1QgTElNSVRFRCBUTywgUFJPQ1VSRU1FTlQgT0YgU1VCU1RJVFVURSBHT09EUyBPUiBTRVJWSUNFUztcbkxPU1MgT0YgVVNFLCBEQVRBLCBPUiBQUk9GSVRTOyBPUiBCVVNJTkVTUyBJTlRFUlJVUFRJT04pIEhPV0VWRVIgQ0FVU0VEIEFORCBPTlxuQU5ZIFRIRU9SWSBPRiBMSUFCSUxJVFksIFdIRVRIRVIgSU4gQ09OVFJBQ1QsIFNUUklDVCBMSUFCSUxJVFksIE9SIFRPUlRcbihJTkNMVURJTkcgTkVHTElHRU5DRSBPUiBPVEhFUldJU0UpIEFSSVNJTkcgSU4gQU5ZIFdBWSBPVVQgT0YgVEhFIFVTRSBPRiBUSElTXG5TT0ZUV0FSRSwgRVZFTiBJRiBBRFZJU0VEIE9GIFRIRSBQT1NTSUJJTElUWSBPRiBTVUNIIERBTUFHRS4gKi9cblxuLyoqXG4gKiBAY2xhc3MgM3gzIE1hdHJpeFxuICogQG5hbWUgbWF0M1xuICovXG5cbnZhciBtYXQzID0ge307XG5cbnZhciBtYXQzSWRlbnRpdHkgPSBuZXcgRmxvYXQzMkFycmF5KFtcbiAgICAxLCAwLCAwLFxuICAgIDAsIDEsIDAsXG4gICAgMCwgMCwgMVxuXSk7XG5cbi8qKlxuICogQ3JlYXRlcyBhIG5ldyBpZGVudGl0eSBtYXQzXG4gKlxuICogQHJldHVybnMge21hdDN9IGEgbmV3IDN4MyBtYXRyaXhcbiAqL1xubWF0My5jcmVhdGUgPSBmdW5jdGlvbigpIHtcbiAgICB2YXIgb3V0ID0gbmV3IEdMTUFUX0FSUkFZX1RZUEUoOSk7XG4gICAgb3V0WzBdID0gMTtcbiAgICBvdXRbMV0gPSAwO1xuICAgIG91dFsyXSA9IDA7XG4gICAgb3V0WzNdID0gMDtcbiAgICBvdXRbNF0gPSAxO1xuICAgIG91dFs1XSA9IDA7XG4gICAgb3V0WzZdID0gMDtcbiAgICBvdXRbN10gPSAwO1xuICAgIG91dFs4XSA9IDE7XG4gICAgcmV0dXJuIG91dDtcbn07XG5cbi8qKlxuICogQ3JlYXRlcyBhIG5ldyBtYXQzIGluaXRpYWxpemVkIHdpdGggdmFsdWVzIGZyb20gYW4gZXhpc3RpbmcgbWF0cml4XG4gKlxuICogQHBhcmFtIHttYXQzfSBhIG1hdHJpeCB0byBjbG9uZVxuICogQHJldHVybnMge21hdDN9IGEgbmV3IDN4MyBtYXRyaXhcbiAqL1xubWF0My5jbG9uZSA9IGZ1bmN0aW9uKGEpIHtcbiAgICB2YXIgb3V0ID0gbmV3IEdMTUFUX0FSUkFZX1RZUEUoOSk7XG4gICAgb3V0WzBdID0gYVswXTtcbiAgICBvdXRbMV0gPSBhWzFdO1xuICAgIG91dFsyXSA9IGFbMl07XG4gICAgb3V0WzNdID0gYVszXTtcbiAgICBvdXRbNF0gPSBhWzRdO1xuICAgIG91dFs1XSA9IGFbNV07XG4gICAgb3V0WzZdID0gYVs2XTtcbiAgICBvdXRbN10gPSBhWzddO1xuICAgIG91dFs4XSA9IGFbOF07XG4gICAgcmV0dXJuIG91dDtcbn07XG5cbi8qKlxuICogQ29weSB0aGUgdmFsdWVzIGZyb20gb25lIG1hdDMgdG8gYW5vdGhlclxuICpcbiAqIEBwYXJhbSB7bWF0M30gb3V0IHRoZSByZWNlaXZpbmcgbWF0cml4XG4gKiBAcGFyYW0ge21hdDN9IGEgdGhlIHNvdXJjZSBtYXRyaXhcbiAqIEByZXR1cm5zIHttYXQzfSBvdXRcbiAqL1xubWF0My5jb3B5ID0gZnVuY3Rpb24ob3V0LCBhKSB7XG4gICAgb3V0WzBdID0gYVswXTtcbiAgICBvdXRbMV0gPSBhWzFdO1xuICAgIG91dFsyXSA9IGFbMl07XG4gICAgb3V0WzNdID0gYVszXTtcbiAgICBvdXRbNF0gPSBhWzRdO1xuICAgIG91dFs1XSA9IGFbNV07XG4gICAgb3V0WzZdID0gYVs2XTtcbiAgICBvdXRbN10gPSBhWzddO1xuICAgIG91dFs4XSA9IGFbOF07XG4gICAgcmV0dXJuIG91dDtcbn07XG5cbi8qKlxuICogU2V0IGEgbWF0MyB0byB0aGUgaWRlbnRpdHkgbWF0cml4XG4gKlxuICogQHBhcmFtIHttYXQzfSBvdXQgdGhlIHJlY2VpdmluZyBtYXRyaXhcbiAqIEByZXR1cm5zIHttYXQzfSBvdXRcbiAqL1xubWF0My5pZGVudGl0eSA9IGZ1bmN0aW9uKG91dCkge1xuICAgIG91dFswXSA9IDE7XG4gICAgb3V0WzFdID0gMDtcbiAgICBvdXRbMl0gPSAwO1xuICAgIG91dFszXSA9IDA7XG4gICAgb3V0WzRdID0gMTtcbiAgICBvdXRbNV0gPSAwO1xuICAgIG91dFs2XSA9IDA7XG4gICAgb3V0WzddID0gMDtcbiAgICBvdXRbOF0gPSAxO1xuICAgIHJldHVybiBvdXQ7XG59O1xuXG4vKipcbiAqIFRyYW5zcG9zZSB0aGUgdmFsdWVzIG9mIGEgbWF0M1xuICpcbiAqIEBwYXJhbSB7bWF0M30gb3V0IHRoZSByZWNlaXZpbmcgbWF0cml4XG4gKiBAcGFyYW0ge21hdDN9IGEgdGhlIHNvdXJjZSBtYXRyaXhcbiAqIEByZXR1cm5zIHttYXQzfSBvdXRcbiAqL1xubWF0My50cmFuc3Bvc2UgPSBmdW5jdGlvbihvdXQsIGEpIHtcbiAgICAvLyBJZiB3ZSBhcmUgdHJhbnNwb3Npbmcgb3Vyc2VsdmVzIHdlIGNhbiBza2lwIGEgZmV3IHN0ZXBzIGJ1dCBoYXZlIHRvIGNhY2hlIHNvbWUgdmFsdWVzXG4gICAgaWYgKG91dCA9PT0gYSkge1xuICAgICAgICB2YXIgYTAxID0gYVsxXSwgYTAyID0gYVsyXSwgYTEyID0gYVs1XTtcbiAgICAgICAgb3V0WzFdID0gYVszXTtcbiAgICAgICAgb3V0WzJdID0gYVs2XTtcbiAgICAgICAgb3V0WzNdID0gYTAxO1xuICAgICAgICBvdXRbNV0gPSBhWzddO1xuICAgICAgICBvdXRbNl0gPSBhMDI7XG4gICAgICAgIG91dFs3XSA9IGExMjtcbiAgICB9IGVsc2Uge1xuICAgICAgICBvdXRbMF0gPSBhWzBdO1xuICAgICAgICBvdXRbMV0gPSBhWzNdO1xuICAgICAgICBvdXRbMl0gPSBhWzZdO1xuICAgICAgICBvdXRbM10gPSBhWzFdO1xuICAgICAgICBvdXRbNF0gPSBhWzRdO1xuICAgICAgICBvdXRbNV0gPSBhWzddO1xuICAgICAgICBvdXRbNl0gPSBhWzJdO1xuICAgICAgICBvdXRbN10gPSBhWzVdO1xuICAgICAgICBvdXRbOF0gPSBhWzhdO1xuICAgIH1cbiAgICBcbiAgICByZXR1cm4gb3V0O1xufTtcblxuLyoqXG4gKiBJbnZlcnRzIGEgbWF0M1xuICpcbiAqIEBwYXJhbSB7bWF0M30gb3V0IHRoZSByZWNlaXZpbmcgbWF0cml4XG4gKiBAcGFyYW0ge21hdDN9IGEgdGhlIHNvdXJjZSBtYXRyaXhcbiAqIEByZXR1cm5zIHttYXQzfSBvdXRcbiAqL1xubWF0My5pbnZlcnQgPSBmdW5jdGlvbihvdXQsIGEpIHtcbiAgICB2YXIgYTAwID0gYVswXSwgYTAxID0gYVsxXSwgYTAyID0gYVsyXSxcbiAgICAgICAgYTEwID0gYVszXSwgYTExID0gYVs0XSwgYTEyID0gYVs1XSxcbiAgICAgICAgYTIwID0gYVs2XSwgYTIxID0gYVs3XSwgYTIyID0gYVs4XSxcblxuICAgICAgICBiMDEgPSBhMjIgKiBhMTEgLSBhMTIgKiBhMjEsXG4gICAgICAgIGIxMSA9IC1hMjIgKiBhMTAgKyBhMTIgKiBhMjAsXG4gICAgICAgIGIyMSA9IGEyMSAqIGExMCAtIGExMSAqIGEyMCxcblxuICAgICAgICAvLyBDYWxjdWxhdGUgdGhlIGRldGVybWluYW50XG4gICAgICAgIGRldCA9IGEwMCAqIGIwMSArIGEwMSAqIGIxMSArIGEwMiAqIGIyMTtcblxuICAgIGlmICghZGV0KSB7IFxuICAgICAgICByZXR1cm4gbnVsbDsgXG4gICAgfVxuICAgIGRldCA9IDEuMCAvIGRldDtcblxuICAgIG91dFswXSA9IGIwMSAqIGRldDtcbiAgICBvdXRbMV0gPSAoLWEyMiAqIGEwMSArIGEwMiAqIGEyMSkgKiBkZXQ7XG4gICAgb3V0WzJdID0gKGExMiAqIGEwMSAtIGEwMiAqIGExMSkgKiBkZXQ7XG4gICAgb3V0WzNdID0gYjExICogZGV0O1xuICAgIG91dFs0XSA9IChhMjIgKiBhMDAgLSBhMDIgKiBhMjApICogZGV0O1xuICAgIG91dFs1XSA9ICgtYTEyICogYTAwICsgYTAyICogYTEwKSAqIGRldDtcbiAgICBvdXRbNl0gPSBiMjEgKiBkZXQ7XG4gICAgb3V0WzddID0gKC1hMjEgKiBhMDAgKyBhMDEgKiBhMjApICogZGV0O1xuICAgIG91dFs4XSA9IChhMTEgKiBhMDAgLSBhMDEgKiBhMTApICogZGV0O1xuICAgIHJldHVybiBvdXQ7XG59O1xuXG4vKipcbiAqIENhbGN1bGF0ZXMgdGhlIGFkanVnYXRlIG9mIGEgbWF0M1xuICpcbiAqIEBwYXJhbSB7bWF0M30gb3V0IHRoZSByZWNlaXZpbmcgbWF0cml4XG4gKiBAcGFyYW0ge21hdDN9IGEgdGhlIHNvdXJjZSBtYXRyaXhcbiAqIEByZXR1cm5zIHttYXQzfSBvdXRcbiAqL1xubWF0My5hZGpvaW50ID0gZnVuY3Rpb24ob3V0LCBhKSB7XG4gICAgdmFyIGEwMCA9IGFbMF0sIGEwMSA9IGFbMV0sIGEwMiA9IGFbMl0sXG4gICAgICAgIGExMCA9IGFbM10sIGExMSA9IGFbNF0sIGExMiA9IGFbNV0sXG4gICAgICAgIGEyMCA9IGFbNl0sIGEyMSA9IGFbN10sIGEyMiA9IGFbOF07XG5cbiAgICBvdXRbMF0gPSAoYTExICogYTIyIC0gYTEyICogYTIxKTtcbiAgICBvdXRbMV0gPSAoYTAyICogYTIxIC0gYTAxICogYTIyKTtcbiAgICBvdXRbMl0gPSAoYTAxICogYTEyIC0gYTAyICogYTExKTtcbiAgICBvdXRbM10gPSAoYTEyICogYTIwIC0gYTEwICogYTIyKTtcbiAgICBvdXRbNF0gPSAoYTAwICogYTIyIC0gYTAyICogYTIwKTtcbiAgICBvdXRbNV0gPSAoYTAyICogYTEwIC0gYTAwICogYTEyKTtcbiAgICBvdXRbNl0gPSAoYTEwICogYTIxIC0gYTExICogYTIwKTtcbiAgICBvdXRbN10gPSAoYTAxICogYTIwIC0gYTAwICogYTIxKTtcbiAgICBvdXRbOF0gPSAoYTAwICogYTExIC0gYTAxICogYTEwKTtcbiAgICByZXR1cm4gb3V0O1xufTtcblxuLyoqXG4gKiBDYWxjdWxhdGVzIHRoZSBkZXRlcm1pbmFudCBvZiBhIG1hdDNcbiAqXG4gKiBAcGFyYW0ge21hdDN9IGEgdGhlIHNvdXJjZSBtYXRyaXhcbiAqIEByZXR1cm5zIHtOdW1iZXJ9IGRldGVybWluYW50IG9mIGFcbiAqL1xubWF0My5kZXRlcm1pbmFudCA9IGZ1bmN0aW9uIChhKSB7XG4gICAgdmFyIGEwMCA9IGFbMF0sIGEwMSA9IGFbMV0sIGEwMiA9IGFbMl0sXG4gICAgICAgIGExMCA9IGFbM10sIGExMSA9IGFbNF0sIGExMiA9IGFbNV0sXG4gICAgICAgIGEyMCA9IGFbNl0sIGEyMSA9IGFbN10sIGEyMiA9IGFbOF07XG5cbiAgICByZXR1cm4gYTAwICogKGEyMiAqIGExMSAtIGExMiAqIGEyMSkgKyBhMDEgKiAoLWEyMiAqIGExMCArIGExMiAqIGEyMCkgKyBhMDIgKiAoYTIxICogYTEwIC0gYTExICogYTIwKTtcbn07XG5cbi8qKlxuICogTXVsdGlwbGllcyB0d28gbWF0MydzXG4gKlxuICogQHBhcmFtIHttYXQzfSBvdXQgdGhlIHJlY2VpdmluZyBtYXRyaXhcbiAqIEBwYXJhbSB7bWF0M30gYSB0aGUgZmlyc3Qgb3BlcmFuZFxuICogQHBhcmFtIHttYXQzfSBiIHRoZSBzZWNvbmQgb3BlcmFuZFxuICogQHJldHVybnMge21hdDN9IG91dFxuICovXG5tYXQzLm11bHRpcGx5ID0gZnVuY3Rpb24gKG91dCwgYSwgYikge1xuICAgIHZhciBhMDAgPSBhWzBdLCBhMDEgPSBhWzFdLCBhMDIgPSBhWzJdLFxuICAgICAgICBhMTAgPSBhWzNdLCBhMTEgPSBhWzRdLCBhMTIgPSBhWzVdLFxuICAgICAgICBhMjAgPSBhWzZdLCBhMjEgPSBhWzddLCBhMjIgPSBhWzhdLFxuXG4gICAgICAgIGIwMCA9IGJbMF0sIGIwMSA9IGJbMV0sIGIwMiA9IGJbMl0sXG4gICAgICAgIGIxMCA9IGJbM10sIGIxMSA9IGJbNF0sIGIxMiA9IGJbNV0sXG4gICAgICAgIGIyMCA9IGJbNl0sIGIyMSA9IGJbN10sIGIyMiA9IGJbOF07XG5cbiAgICBvdXRbMF0gPSBiMDAgKiBhMDAgKyBiMDEgKiBhMTAgKyBiMDIgKiBhMjA7XG4gICAgb3V0WzFdID0gYjAwICogYTAxICsgYjAxICogYTExICsgYjAyICogYTIxO1xuICAgIG91dFsyXSA9IGIwMCAqIGEwMiArIGIwMSAqIGExMiArIGIwMiAqIGEyMjtcblxuICAgIG91dFszXSA9IGIxMCAqIGEwMCArIGIxMSAqIGExMCArIGIxMiAqIGEyMDtcbiAgICBvdXRbNF0gPSBiMTAgKiBhMDEgKyBiMTEgKiBhMTEgKyBiMTIgKiBhMjE7XG4gICAgb3V0WzVdID0gYjEwICogYTAyICsgYjExICogYTEyICsgYjEyICogYTIyO1xuXG4gICAgb3V0WzZdID0gYjIwICogYTAwICsgYjIxICogYTEwICsgYjIyICogYTIwO1xuICAgIG91dFs3XSA9IGIyMCAqIGEwMSArIGIyMSAqIGExMSArIGIyMiAqIGEyMTtcbiAgICBvdXRbOF0gPSBiMjAgKiBhMDIgKyBiMjEgKiBhMTIgKyBiMjIgKiBhMjI7XG4gICAgcmV0dXJuIG91dDtcbn07XG5cbi8qKlxuICogQWxpYXMgZm9yIHtAbGluayBtYXQzLm11bHRpcGx5fVxuICogQGZ1bmN0aW9uXG4gKi9cbm1hdDMubXVsID0gbWF0My5tdWx0aXBseTtcblxuLyoqXG4gKiBUcmFuc2xhdGUgYSBtYXQzIGJ5IHRoZSBnaXZlbiB2ZWN0b3JcbiAqXG4gKiBAcGFyYW0ge21hdDN9IG91dCB0aGUgcmVjZWl2aW5nIG1hdHJpeFxuICogQHBhcmFtIHttYXQzfSBhIHRoZSBtYXRyaXggdG8gdHJhbnNsYXRlXG4gKiBAcGFyYW0ge3ZlYzJ9IHYgdmVjdG9yIHRvIHRyYW5zbGF0ZSBieVxuICogQHJldHVybnMge21hdDN9IG91dFxuICovXG5tYXQzLnRyYW5zbGF0ZSA9IGZ1bmN0aW9uKG91dCwgYSwgdikge1xuICAgIHZhciBhMDAgPSBhWzBdLCBhMDEgPSBhWzFdLCBhMDIgPSBhWzJdLFxuICAgICAgICBhMTAgPSBhWzNdLCBhMTEgPSBhWzRdLCBhMTIgPSBhWzVdLFxuICAgICAgICBhMjAgPSBhWzZdLCBhMjEgPSBhWzddLCBhMjIgPSBhWzhdLFxuICAgICAgICB4ID0gdlswXSwgeSA9IHZbMV07XG5cbiAgICBvdXRbMF0gPSBhMDA7XG4gICAgb3V0WzFdID0gYTAxO1xuICAgIG91dFsyXSA9IGEwMjtcblxuICAgIG91dFszXSA9IGExMDtcbiAgICBvdXRbNF0gPSBhMTE7XG4gICAgb3V0WzVdID0gYTEyO1xuXG4gICAgb3V0WzZdID0geCAqIGEwMCArIHkgKiBhMTAgKyBhMjA7XG4gICAgb3V0WzddID0geCAqIGEwMSArIHkgKiBhMTEgKyBhMjE7XG4gICAgb3V0WzhdID0geCAqIGEwMiArIHkgKiBhMTIgKyBhMjI7XG4gICAgcmV0dXJuIG91dDtcbn07XG5cbi8qKlxuICogUm90YXRlcyBhIG1hdDMgYnkgdGhlIGdpdmVuIGFuZ2xlXG4gKlxuICogQHBhcmFtIHttYXQzfSBvdXQgdGhlIHJlY2VpdmluZyBtYXRyaXhcbiAqIEBwYXJhbSB7bWF0M30gYSB0aGUgbWF0cml4IHRvIHJvdGF0ZVxuICogQHBhcmFtIHtOdW1iZXJ9IHJhZCB0aGUgYW5nbGUgdG8gcm90YXRlIHRoZSBtYXRyaXggYnlcbiAqIEByZXR1cm5zIHttYXQzfSBvdXRcbiAqL1xubWF0My5yb3RhdGUgPSBmdW5jdGlvbiAob3V0LCBhLCByYWQpIHtcbiAgICB2YXIgYTAwID0gYVswXSwgYTAxID0gYVsxXSwgYTAyID0gYVsyXSxcbiAgICAgICAgYTEwID0gYVszXSwgYTExID0gYVs0XSwgYTEyID0gYVs1XSxcbiAgICAgICAgYTIwID0gYVs2XSwgYTIxID0gYVs3XSwgYTIyID0gYVs4XSxcblxuICAgICAgICBzID0gTWF0aC5zaW4ocmFkKSxcbiAgICAgICAgYyA9IE1hdGguY29zKHJhZCk7XG5cbiAgICBvdXRbMF0gPSBjICogYTAwICsgcyAqIGExMDtcbiAgICBvdXRbMV0gPSBjICogYTAxICsgcyAqIGExMTtcbiAgICBvdXRbMl0gPSBjICogYTAyICsgcyAqIGExMjtcblxuICAgIG91dFszXSA9IGMgKiBhMTAgLSBzICogYTAwO1xuICAgIG91dFs0XSA9IGMgKiBhMTEgLSBzICogYTAxO1xuICAgIG91dFs1XSA9IGMgKiBhMTIgLSBzICogYTAyO1xuXG4gICAgb3V0WzZdID0gYTIwO1xuICAgIG91dFs3XSA9IGEyMTtcbiAgICBvdXRbOF0gPSBhMjI7XG4gICAgcmV0dXJuIG91dDtcbn07XG5cbi8qKlxuICogU2NhbGVzIHRoZSBtYXQzIGJ5IHRoZSBkaW1lbnNpb25zIGluIHRoZSBnaXZlbiB2ZWMyXG4gKlxuICogQHBhcmFtIHttYXQzfSBvdXQgdGhlIHJlY2VpdmluZyBtYXRyaXhcbiAqIEBwYXJhbSB7bWF0M30gYSB0aGUgbWF0cml4IHRvIHJvdGF0ZVxuICogQHBhcmFtIHt2ZWMyfSB2IHRoZSB2ZWMyIHRvIHNjYWxlIHRoZSBtYXRyaXggYnlcbiAqIEByZXR1cm5zIHttYXQzfSBvdXRcbiAqKi9cbm1hdDMuc2NhbGUgPSBmdW5jdGlvbihvdXQsIGEsIHYpIHtcbiAgICB2YXIgeCA9IHZbMF0sIHkgPSB2WzJdO1xuXG4gICAgb3V0WzBdID0geCAqIGFbMF07XG4gICAgb3V0WzFdID0geCAqIGFbMV07XG4gICAgb3V0WzJdID0geCAqIGFbMl07XG5cbiAgICBvdXRbM10gPSB5ICogYVszXTtcbiAgICBvdXRbNF0gPSB5ICogYVs0XTtcbiAgICBvdXRbNV0gPSB5ICogYVs1XTtcblxuICAgIG91dFs2XSA9IGFbNl07XG4gICAgb3V0WzddID0gYVs3XTtcbiAgICBvdXRbOF0gPSBhWzhdO1xuICAgIHJldHVybiBvdXQ7XG59O1xuXG4vKipcbiAqIENvcGllcyB0aGUgdmFsdWVzIGZyb20gYSBtYXQyZCBpbnRvIGEgbWF0M1xuICpcbiAqIEBwYXJhbSB7bWF0M30gb3V0IHRoZSByZWNlaXZpbmcgbWF0cml4XG4gKiBAcGFyYW0ge21hdDN9IGEgdGhlIG1hdHJpeCB0byByb3RhdGVcbiAqIEBwYXJhbSB7dmVjMn0gdiB0aGUgdmVjMiB0byBzY2FsZSB0aGUgbWF0cml4IGJ5XG4gKiBAcmV0dXJucyB7bWF0M30gb3V0XG4gKiovXG5tYXQzLmZyb21NYXQyZCA9IGZ1bmN0aW9uKG91dCwgYSkge1xuICAgIG91dFswXSA9IGFbMF07XG4gICAgb3V0WzFdID0gYVsxXTtcbiAgICBvdXRbMl0gPSAwO1xuXG4gICAgb3V0WzNdID0gYVsyXTtcbiAgICBvdXRbNF0gPSBhWzNdO1xuICAgIG91dFs1XSA9IDA7XG5cbiAgICBvdXRbNl0gPSBhWzRdO1xuICAgIG91dFs3XSA9IGFbNV07XG4gICAgb3V0WzhdID0gMTtcbiAgICByZXR1cm4gb3V0O1xufTtcblxuLyoqXG4qIENhbGN1bGF0ZXMgYSAzeDMgbWF0cml4IGZyb20gdGhlIGdpdmVuIHF1YXRlcm5pb25cbipcbiogQHBhcmFtIHttYXQzfSBvdXQgbWF0MyByZWNlaXZpbmcgb3BlcmF0aW9uIHJlc3VsdFxuKiBAcGFyYW0ge3F1YXR9IHEgUXVhdGVybmlvbiB0byBjcmVhdGUgbWF0cml4IGZyb21cbipcbiogQHJldHVybnMge21hdDN9IG91dFxuKi9cbm1hdDMuZnJvbVF1YXQgPSBmdW5jdGlvbiAob3V0LCBxKSB7XG4gICAgdmFyIHggPSBxWzBdLCB5ID0gcVsxXSwgeiA9IHFbMl0sIHcgPSBxWzNdLFxuICAgICAgICB4MiA9IHggKyB4LFxuICAgICAgICB5MiA9IHkgKyB5LFxuICAgICAgICB6MiA9IHogKyB6LFxuXG4gICAgICAgIHh4ID0geCAqIHgyLFxuICAgICAgICB4eSA9IHggKiB5MixcbiAgICAgICAgeHogPSB4ICogejIsXG4gICAgICAgIHl5ID0geSAqIHkyLFxuICAgICAgICB5eiA9IHkgKiB6MixcbiAgICAgICAgenogPSB6ICogejIsXG4gICAgICAgIHd4ID0gdyAqIHgyLFxuICAgICAgICB3eSA9IHcgKiB5MixcbiAgICAgICAgd3ogPSB3ICogejI7XG5cbiAgICBvdXRbMF0gPSAxIC0gKHl5ICsgenopO1xuICAgIG91dFsxXSA9IHh5ICsgd3o7XG4gICAgb3V0WzJdID0geHogLSB3eTtcblxuICAgIG91dFszXSA9IHh5IC0gd3o7XG4gICAgb3V0WzRdID0gMSAtICh4eCArIHp6KTtcbiAgICBvdXRbNV0gPSB5eiArIHd4O1xuXG4gICAgb3V0WzZdID0geHogKyB3eTtcbiAgICBvdXRbN10gPSB5eiAtIHd4O1xuICAgIG91dFs4XSA9IDEgLSAoeHggKyB5eSk7XG5cbiAgICByZXR1cm4gb3V0O1xufTtcblxuLyoqXG4gKiBSZXR1cm5zIGEgc3RyaW5nIHJlcHJlc2VudGF0aW9uIG9mIGEgbWF0M1xuICpcbiAqIEBwYXJhbSB7bWF0M30gbWF0IG1hdHJpeCB0byByZXByZXNlbnQgYXMgYSBzdHJpbmdcbiAqIEByZXR1cm5zIHtTdHJpbmd9IHN0cmluZyByZXByZXNlbnRhdGlvbiBvZiB0aGUgbWF0cml4XG4gKi9cbm1hdDMuc3RyID0gZnVuY3Rpb24gKGEpIHtcbiAgICByZXR1cm4gJ21hdDMoJyArIGFbMF0gKyAnLCAnICsgYVsxXSArICcsICcgKyBhWzJdICsgJywgJyArIFxuICAgICAgICAgICAgICAgICAgICBhWzNdICsgJywgJyArIGFbNF0gKyAnLCAnICsgYVs1XSArICcsICcgKyBcbiAgICAgICAgICAgICAgICAgICAgYVs2XSArICcsICcgKyBhWzddICsgJywgJyArIGFbOF0gKyAnKSc7XG59O1xuXG5pZih0eXBlb2YoZXhwb3J0cykgIT09ICd1bmRlZmluZWQnKSB7XG4gICAgZXhwb3J0cy5tYXQzID0gbWF0Mztcbn1cbjtcbi8qIENvcHlyaWdodCAoYykgMjAxMywgQnJhbmRvbiBKb25lcywgQ29saW4gTWFjS2VuemllIElWLiBBbGwgcmlnaHRzIHJlc2VydmVkLlxuXG5SZWRpc3RyaWJ1dGlvbiBhbmQgdXNlIGluIHNvdXJjZSBhbmQgYmluYXJ5IGZvcm1zLCB3aXRoIG9yIHdpdGhvdXQgbW9kaWZpY2F0aW9uLFxuYXJlIHBlcm1pdHRlZCBwcm92aWRlZCB0aGF0IHRoZSBmb2xsb3dpbmcgY29uZGl0aW9ucyBhcmUgbWV0OlxuXG4gICogUmVkaXN0cmlidXRpb25zIG9mIHNvdXJjZSBjb2RlIG11c3QgcmV0YWluIHRoZSBhYm92ZSBjb3B5cmlnaHQgbm90aWNlLCB0aGlzXG4gICAgbGlzdCBvZiBjb25kaXRpb25zIGFuZCB0aGUgZm9sbG93aW5nIGRpc2NsYWltZXIuXG4gICogUmVkaXN0cmlidXRpb25zIGluIGJpbmFyeSBmb3JtIG11c3QgcmVwcm9kdWNlIHRoZSBhYm92ZSBjb3B5cmlnaHQgbm90aWNlLFxuICAgIHRoaXMgbGlzdCBvZiBjb25kaXRpb25zIGFuZCB0aGUgZm9sbG93aW5nIGRpc2NsYWltZXIgaW4gdGhlIGRvY3VtZW50YXRpb24gXG4gICAgYW5kL29yIG90aGVyIG1hdGVyaWFscyBwcm92aWRlZCB3aXRoIHRoZSBkaXN0cmlidXRpb24uXG5cblRISVMgU09GVFdBUkUgSVMgUFJPVklERUQgQlkgVEhFIENPUFlSSUdIVCBIT0xERVJTIEFORCBDT05UUklCVVRPUlMgXCJBUyBJU1wiIEFORFxuQU5ZIEVYUFJFU1MgT1IgSU1QTElFRCBXQVJSQU5USUVTLCBJTkNMVURJTkcsIEJVVCBOT1QgTElNSVRFRCBUTywgVEhFIElNUExJRURcbldBUlJBTlRJRVMgT0YgTUVSQ0hBTlRBQklMSVRZIEFORCBGSVRORVNTIEZPUiBBIFBBUlRJQ1VMQVIgUFVSUE9TRSBBUkUgXG5ESVNDTEFJTUVELiBJTiBOTyBFVkVOVCBTSEFMTCBUSEUgQ09QWVJJR0hUIEhPTERFUiBPUiBDT05UUklCVVRPUlMgQkUgTElBQkxFIEZPUlxuQU5ZIERJUkVDVCwgSU5ESVJFQ1QsIElOQ0lERU5UQUwsIFNQRUNJQUwsIEVYRU1QTEFSWSwgT1IgQ09OU0VRVUVOVElBTCBEQU1BR0VTXG4oSU5DTFVESU5HLCBCVVQgTk9UIExJTUlURUQgVE8sIFBST0NVUkVNRU5UIE9GIFNVQlNUSVRVVEUgR09PRFMgT1IgU0VSVklDRVM7XG5MT1NTIE9GIFVTRSwgREFUQSwgT1IgUFJPRklUUzsgT1IgQlVTSU5FU1MgSU5URVJSVVBUSU9OKSBIT1dFVkVSIENBVVNFRCBBTkQgT05cbkFOWSBUSEVPUlkgT0YgTElBQklMSVRZLCBXSEVUSEVSIElOIENPTlRSQUNULCBTVFJJQ1QgTElBQklMSVRZLCBPUiBUT1JUXG4oSU5DTFVESU5HIE5FR0xJR0VOQ0UgT1IgT1RIRVJXSVNFKSBBUklTSU5HIElOIEFOWSBXQVkgT1VUIE9GIFRIRSBVU0UgT0YgVEhJU1xuU09GVFdBUkUsIEVWRU4gSUYgQURWSVNFRCBPRiBUSEUgUE9TU0lCSUxJVFkgT0YgU1VDSCBEQU1BR0UuICovXG5cbi8qKlxuICogQGNsYXNzIDR4NCBNYXRyaXhcbiAqIEBuYW1lIG1hdDRcbiAqL1xuXG52YXIgbWF0NCA9IHt9O1xuXG52YXIgbWF0NElkZW50aXR5ID0gbmV3IEZsb2F0MzJBcnJheShbXG4gICAgMSwgMCwgMCwgMCxcbiAgICAwLCAxLCAwLCAwLFxuICAgIDAsIDAsIDEsIDAsXG4gICAgMCwgMCwgMCwgMVxuXSk7XG5cbi8qKlxuICogQ3JlYXRlcyBhIG5ldyBpZGVudGl0eSBtYXQ0XG4gKlxuICogQHJldHVybnMge21hdDR9IGEgbmV3IDR4NCBtYXRyaXhcbiAqL1xubWF0NC5jcmVhdGUgPSBmdW5jdGlvbigpIHtcbiAgICB2YXIgb3V0ID0gbmV3IEdMTUFUX0FSUkFZX1RZUEUoMTYpO1xuICAgIG91dFswXSA9IDE7XG4gICAgb3V0WzFdID0gMDtcbiAgICBvdXRbMl0gPSAwO1xuICAgIG91dFszXSA9IDA7XG4gICAgb3V0WzRdID0gMDtcbiAgICBvdXRbNV0gPSAxO1xuICAgIG91dFs2XSA9IDA7XG4gICAgb3V0WzddID0gMDtcbiAgICBvdXRbOF0gPSAwO1xuICAgIG91dFs5XSA9IDA7XG4gICAgb3V0WzEwXSA9IDE7XG4gICAgb3V0WzExXSA9IDA7XG4gICAgb3V0WzEyXSA9IDA7XG4gICAgb3V0WzEzXSA9IDA7XG4gICAgb3V0WzE0XSA9IDA7XG4gICAgb3V0WzE1XSA9IDE7XG4gICAgcmV0dXJuIG91dDtcbn07XG5cbi8qKlxuICogQ3JlYXRlcyBhIG5ldyBtYXQ0IGluaXRpYWxpemVkIHdpdGggdmFsdWVzIGZyb20gYW4gZXhpc3RpbmcgbWF0cml4XG4gKlxuICogQHBhcmFtIHttYXQ0fSBhIG1hdHJpeCB0byBjbG9uZVxuICogQHJldHVybnMge21hdDR9IGEgbmV3IDR4NCBtYXRyaXhcbiAqL1xubWF0NC5jbG9uZSA9IGZ1bmN0aW9uKGEpIHtcbiAgICB2YXIgb3V0ID0gbmV3IEdMTUFUX0FSUkFZX1RZUEUoMTYpO1xuICAgIG91dFswXSA9IGFbMF07XG4gICAgb3V0WzFdID0gYVsxXTtcbiAgICBvdXRbMl0gPSBhWzJdO1xuICAgIG91dFszXSA9IGFbM107XG4gICAgb3V0WzRdID0gYVs0XTtcbiAgICBvdXRbNV0gPSBhWzVdO1xuICAgIG91dFs2XSA9IGFbNl07XG4gICAgb3V0WzddID0gYVs3XTtcbiAgICBvdXRbOF0gPSBhWzhdO1xuICAgIG91dFs5XSA9IGFbOV07XG4gICAgb3V0WzEwXSA9IGFbMTBdO1xuICAgIG91dFsxMV0gPSBhWzExXTtcbiAgICBvdXRbMTJdID0gYVsxMl07XG4gICAgb3V0WzEzXSA9IGFbMTNdO1xuICAgIG91dFsxNF0gPSBhWzE0XTtcbiAgICBvdXRbMTVdID0gYVsxNV07XG4gICAgcmV0dXJuIG91dDtcbn07XG5cbi8qKlxuICogQ29weSB0aGUgdmFsdWVzIGZyb20gb25lIG1hdDQgdG8gYW5vdGhlclxuICpcbiAqIEBwYXJhbSB7bWF0NH0gb3V0IHRoZSByZWNlaXZpbmcgbWF0cml4XG4gKiBAcGFyYW0ge21hdDR9IGEgdGhlIHNvdXJjZSBtYXRyaXhcbiAqIEByZXR1cm5zIHttYXQ0fSBvdXRcbiAqL1xubWF0NC5jb3B5ID0gZnVuY3Rpb24ob3V0LCBhKSB7XG4gICAgb3V0WzBdID0gYVswXTtcbiAgICBvdXRbMV0gPSBhWzFdO1xuICAgIG91dFsyXSA9IGFbMl07XG4gICAgb3V0WzNdID0gYVszXTtcbiAgICBvdXRbNF0gPSBhWzRdO1xuICAgIG91dFs1XSA9IGFbNV07XG4gICAgb3V0WzZdID0gYVs2XTtcbiAgICBvdXRbN10gPSBhWzddO1xuICAgIG91dFs4XSA9IGFbOF07XG4gICAgb3V0WzldID0gYVs5XTtcbiAgICBvdXRbMTBdID0gYVsxMF07XG4gICAgb3V0WzExXSA9IGFbMTFdO1xuICAgIG91dFsxMl0gPSBhWzEyXTtcbiAgICBvdXRbMTNdID0gYVsxM107XG4gICAgb3V0WzE0XSA9IGFbMTRdO1xuICAgIG91dFsxNV0gPSBhWzE1XTtcbiAgICByZXR1cm4gb3V0O1xufTtcblxuLyoqXG4gKiBTZXQgYSBtYXQ0IHRvIHRoZSBpZGVudGl0eSBtYXRyaXhcbiAqXG4gKiBAcGFyYW0ge21hdDR9IG91dCB0aGUgcmVjZWl2aW5nIG1hdHJpeFxuICogQHJldHVybnMge21hdDR9IG91dFxuICovXG5tYXQ0LmlkZW50aXR5ID0gZnVuY3Rpb24ob3V0KSB7XG4gICAgb3V0WzBdID0gMTtcbiAgICBvdXRbMV0gPSAwO1xuICAgIG91dFsyXSA9IDA7XG4gICAgb3V0WzNdID0gMDtcbiAgICBvdXRbNF0gPSAwO1xuICAgIG91dFs1XSA9IDE7XG4gICAgb3V0WzZdID0gMDtcbiAgICBvdXRbN10gPSAwO1xuICAgIG91dFs4XSA9IDA7XG4gICAgb3V0WzldID0gMDtcbiAgICBvdXRbMTBdID0gMTtcbiAgICBvdXRbMTFdID0gMDtcbiAgICBvdXRbMTJdID0gMDtcbiAgICBvdXRbMTNdID0gMDtcbiAgICBvdXRbMTRdID0gMDtcbiAgICBvdXRbMTVdID0gMTtcbiAgICByZXR1cm4gb3V0O1xufTtcblxuLyoqXG4gKiBUcmFuc3Bvc2UgdGhlIHZhbHVlcyBvZiBhIG1hdDRcbiAqXG4gKiBAcGFyYW0ge21hdDR9IG91dCB0aGUgcmVjZWl2aW5nIG1hdHJpeFxuICogQHBhcmFtIHttYXQ0fSBhIHRoZSBzb3VyY2UgbWF0cml4XG4gKiBAcmV0dXJucyB7bWF0NH0gb3V0XG4gKi9cbm1hdDQudHJhbnNwb3NlID0gZnVuY3Rpb24ob3V0LCBhKSB7XG4gICAgLy8gSWYgd2UgYXJlIHRyYW5zcG9zaW5nIG91cnNlbHZlcyB3ZSBjYW4gc2tpcCBhIGZldyBzdGVwcyBidXQgaGF2ZSB0byBjYWNoZSBzb21lIHZhbHVlc1xuICAgIGlmIChvdXQgPT09IGEpIHtcbiAgICAgICAgdmFyIGEwMSA9IGFbMV0sIGEwMiA9IGFbMl0sIGEwMyA9IGFbM10sXG4gICAgICAgICAgICBhMTIgPSBhWzZdLCBhMTMgPSBhWzddLFxuICAgICAgICAgICAgYTIzID0gYVsxMV07XG5cbiAgICAgICAgb3V0WzFdID0gYVs0XTtcbiAgICAgICAgb3V0WzJdID0gYVs4XTtcbiAgICAgICAgb3V0WzNdID0gYVsxMl07XG4gICAgICAgIG91dFs0XSA9IGEwMTtcbiAgICAgICAgb3V0WzZdID0gYVs5XTtcbiAgICAgICAgb3V0WzddID0gYVsxM107XG4gICAgICAgIG91dFs4XSA9IGEwMjtcbiAgICAgICAgb3V0WzldID0gYTEyO1xuICAgICAgICBvdXRbMTFdID0gYVsxNF07XG4gICAgICAgIG91dFsxMl0gPSBhMDM7XG4gICAgICAgIG91dFsxM10gPSBhMTM7XG4gICAgICAgIG91dFsxNF0gPSBhMjM7XG4gICAgfSBlbHNlIHtcbiAgICAgICAgb3V0WzBdID0gYVswXTtcbiAgICAgICAgb3V0WzFdID0gYVs0XTtcbiAgICAgICAgb3V0WzJdID0gYVs4XTtcbiAgICAgICAgb3V0WzNdID0gYVsxMl07XG4gICAgICAgIG91dFs0XSA9IGFbMV07XG4gICAgICAgIG91dFs1XSA9IGFbNV07XG4gICAgICAgIG91dFs2XSA9IGFbOV07XG4gICAgICAgIG91dFs3XSA9IGFbMTNdO1xuICAgICAgICBvdXRbOF0gPSBhWzJdO1xuICAgICAgICBvdXRbOV0gPSBhWzZdO1xuICAgICAgICBvdXRbMTBdID0gYVsxMF07XG4gICAgICAgIG91dFsxMV0gPSBhWzE0XTtcbiAgICAgICAgb3V0WzEyXSA9IGFbM107XG4gICAgICAgIG91dFsxM10gPSBhWzddO1xuICAgICAgICBvdXRbMTRdID0gYVsxMV07XG4gICAgICAgIG91dFsxNV0gPSBhWzE1XTtcbiAgICB9XG4gICAgXG4gICAgcmV0dXJuIG91dDtcbn07XG5cbi8qKlxuICogSW52ZXJ0cyBhIG1hdDRcbiAqXG4gKiBAcGFyYW0ge21hdDR9IG91dCB0aGUgcmVjZWl2aW5nIG1hdHJpeFxuICogQHBhcmFtIHttYXQ0fSBhIHRoZSBzb3VyY2UgbWF0cml4XG4gKiBAcmV0dXJucyB7bWF0NH0gb3V0XG4gKi9cbm1hdDQuaW52ZXJ0ID0gZnVuY3Rpb24ob3V0LCBhKSB7XG4gICAgdmFyIGEwMCA9IGFbMF0sIGEwMSA9IGFbMV0sIGEwMiA9IGFbMl0sIGEwMyA9IGFbM10sXG4gICAgICAgIGExMCA9IGFbNF0sIGExMSA9IGFbNV0sIGExMiA9IGFbNl0sIGExMyA9IGFbN10sXG4gICAgICAgIGEyMCA9IGFbOF0sIGEyMSA9IGFbOV0sIGEyMiA9IGFbMTBdLCBhMjMgPSBhWzExXSxcbiAgICAgICAgYTMwID0gYVsxMl0sIGEzMSA9IGFbMTNdLCBhMzIgPSBhWzE0XSwgYTMzID0gYVsxNV0sXG5cbiAgICAgICAgYjAwID0gYTAwICogYTExIC0gYTAxICogYTEwLFxuICAgICAgICBiMDEgPSBhMDAgKiBhMTIgLSBhMDIgKiBhMTAsXG4gICAgICAgIGIwMiA9IGEwMCAqIGExMyAtIGEwMyAqIGExMCxcbiAgICAgICAgYjAzID0gYTAxICogYTEyIC0gYTAyICogYTExLFxuICAgICAgICBiMDQgPSBhMDEgKiBhMTMgLSBhMDMgKiBhMTEsXG4gICAgICAgIGIwNSA9IGEwMiAqIGExMyAtIGEwMyAqIGExMixcbiAgICAgICAgYjA2ID0gYTIwICogYTMxIC0gYTIxICogYTMwLFxuICAgICAgICBiMDcgPSBhMjAgKiBhMzIgLSBhMjIgKiBhMzAsXG4gICAgICAgIGIwOCA9IGEyMCAqIGEzMyAtIGEyMyAqIGEzMCxcbiAgICAgICAgYjA5ID0gYTIxICogYTMyIC0gYTIyICogYTMxLFxuICAgICAgICBiMTAgPSBhMjEgKiBhMzMgLSBhMjMgKiBhMzEsXG4gICAgICAgIGIxMSA9IGEyMiAqIGEzMyAtIGEyMyAqIGEzMixcblxuICAgICAgICAvLyBDYWxjdWxhdGUgdGhlIGRldGVybWluYW50XG4gICAgICAgIGRldCA9IGIwMCAqIGIxMSAtIGIwMSAqIGIxMCArIGIwMiAqIGIwOSArIGIwMyAqIGIwOCAtIGIwNCAqIGIwNyArIGIwNSAqIGIwNjtcblxuICAgIGlmICghZGV0KSB7IFxuICAgICAgICByZXR1cm4gbnVsbDsgXG4gICAgfVxuICAgIGRldCA9IDEuMCAvIGRldDtcblxuICAgIG91dFswXSA9IChhMTEgKiBiMTEgLSBhMTIgKiBiMTAgKyBhMTMgKiBiMDkpICogZGV0O1xuICAgIG91dFsxXSA9IChhMDIgKiBiMTAgLSBhMDEgKiBiMTEgLSBhMDMgKiBiMDkpICogZGV0O1xuICAgIG91dFsyXSA9IChhMzEgKiBiMDUgLSBhMzIgKiBiMDQgKyBhMzMgKiBiMDMpICogZGV0O1xuICAgIG91dFszXSA9IChhMjIgKiBiMDQgLSBhMjEgKiBiMDUgLSBhMjMgKiBiMDMpICogZGV0O1xuICAgIG91dFs0XSA9IChhMTIgKiBiMDggLSBhMTAgKiBiMTEgLSBhMTMgKiBiMDcpICogZGV0O1xuICAgIG91dFs1XSA9IChhMDAgKiBiMTEgLSBhMDIgKiBiMDggKyBhMDMgKiBiMDcpICogZGV0O1xuICAgIG91dFs2XSA9IChhMzIgKiBiMDIgLSBhMzAgKiBiMDUgLSBhMzMgKiBiMDEpICogZGV0O1xuICAgIG91dFs3XSA9IChhMjAgKiBiMDUgLSBhMjIgKiBiMDIgKyBhMjMgKiBiMDEpICogZGV0O1xuICAgIG91dFs4XSA9IChhMTAgKiBiMTAgLSBhMTEgKiBiMDggKyBhMTMgKiBiMDYpICogZGV0O1xuICAgIG91dFs5XSA9IChhMDEgKiBiMDggLSBhMDAgKiBiMTAgLSBhMDMgKiBiMDYpICogZGV0O1xuICAgIG91dFsxMF0gPSAoYTMwICogYjA0IC0gYTMxICogYjAyICsgYTMzICogYjAwKSAqIGRldDtcbiAgICBvdXRbMTFdID0gKGEyMSAqIGIwMiAtIGEyMCAqIGIwNCAtIGEyMyAqIGIwMCkgKiBkZXQ7XG4gICAgb3V0WzEyXSA9IChhMTEgKiBiMDcgLSBhMTAgKiBiMDkgLSBhMTIgKiBiMDYpICogZGV0O1xuICAgIG91dFsxM10gPSAoYTAwICogYjA5IC0gYTAxICogYjA3ICsgYTAyICogYjA2KSAqIGRldDtcbiAgICBvdXRbMTRdID0gKGEzMSAqIGIwMSAtIGEzMCAqIGIwMyAtIGEzMiAqIGIwMCkgKiBkZXQ7XG4gICAgb3V0WzE1XSA9IChhMjAgKiBiMDMgLSBhMjEgKiBiMDEgKyBhMjIgKiBiMDApICogZGV0O1xuXG4gICAgcmV0dXJuIG91dDtcbn07XG5cbi8qKlxuICogQ2FsY3VsYXRlcyB0aGUgYWRqdWdhdGUgb2YgYSBtYXQ0XG4gKlxuICogQHBhcmFtIHttYXQ0fSBvdXQgdGhlIHJlY2VpdmluZyBtYXRyaXhcbiAqIEBwYXJhbSB7bWF0NH0gYSB0aGUgc291cmNlIG1hdHJpeFxuICogQHJldHVybnMge21hdDR9IG91dFxuICovXG5tYXQ0LmFkam9pbnQgPSBmdW5jdGlvbihvdXQsIGEpIHtcbiAgICB2YXIgYTAwID0gYVswXSwgYTAxID0gYVsxXSwgYTAyID0gYVsyXSwgYTAzID0gYVszXSxcbiAgICAgICAgYTEwID0gYVs0XSwgYTExID0gYVs1XSwgYTEyID0gYVs2XSwgYTEzID0gYVs3XSxcbiAgICAgICAgYTIwID0gYVs4XSwgYTIxID0gYVs5XSwgYTIyID0gYVsxMF0sIGEyMyA9IGFbMTFdLFxuICAgICAgICBhMzAgPSBhWzEyXSwgYTMxID0gYVsxM10sIGEzMiA9IGFbMTRdLCBhMzMgPSBhWzE1XTtcblxuICAgIG91dFswXSAgPSAgKGExMSAqIChhMjIgKiBhMzMgLSBhMjMgKiBhMzIpIC0gYTIxICogKGExMiAqIGEzMyAtIGExMyAqIGEzMikgKyBhMzEgKiAoYTEyICogYTIzIC0gYTEzICogYTIyKSk7XG4gICAgb3V0WzFdICA9IC0oYTAxICogKGEyMiAqIGEzMyAtIGEyMyAqIGEzMikgLSBhMjEgKiAoYTAyICogYTMzIC0gYTAzICogYTMyKSArIGEzMSAqIChhMDIgKiBhMjMgLSBhMDMgKiBhMjIpKTtcbiAgICBvdXRbMl0gID0gIChhMDEgKiAoYTEyICogYTMzIC0gYTEzICogYTMyKSAtIGExMSAqIChhMDIgKiBhMzMgLSBhMDMgKiBhMzIpICsgYTMxICogKGEwMiAqIGExMyAtIGEwMyAqIGExMikpO1xuICAgIG91dFszXSAgPSAtKGEwMSAqIChhMTIgKiBhMjMgLSBhMTMgKiBhMjIpIC0gYTExICogKGEwMiAqIGEyMyAtIGEwMyAqIGEyMikgKyBhMjEgKiAoYTAyICogYTEzIC0gYTAzICogYTEyKSk7XG4gICAgb3V0WzRdICA9IC0oYTEwICogKGEyMiAqIGEzMyAtIGEyMyAqIGEzMikgLSBhMjAgKiAoYTEyICogYTMzIC0gYTEzICogYTMyKSArIGEzMCAqIChhMTIgKiBhMjMgLSBhMTMgKiBhMjIpKTtcbiAgICBvdXRbNV0gID0gIChhMDAgKiAoYTIyICogYTMzIC0gYTIzICogYTMyKSAtIGEyMCAqIChhMDIgKiBhMzMgLSBhMDMgKiBhMzIpICsgYTMwICogKGEwMiAqIGEyMyAtIGEwMyAqIGEyMikpO1xuICAgIG91dFs2XSAgPSAtKGEwMCAqIChhMTIgKiBhMzMgLSBhMTMgKiBhMzIpIC0gYTEwICogKGEwMiAqIGEzMyAtIGEwMyAqIGEzMikgKyBhMzAgKiAoYTAyICogYTEzIC0gYTAzICogYTEyKSk7XG4gICAgb3V0WzddICA9ICAoYTAwICogKGExMiAqIGEyMyAtIGExMyAqIGEyMikgLSBhMTAgKiAoYTAyICogYTIzIC0gYTAzICogYTIyKSArIGEyMCAqIChhMDIgKiBhMTMgLSBhMDMgKiBhMTIpKTtcbiAgICBvdXRbOF0gID0gIChhMTAgKiAoYTIxICogYTMzIC0gYTIzICogYTMxKSAtIGEyMCAqIChhMTEgKiBhMzMgLSBhMTMgKiBhMzEpICsgYTMwICogKGExMSAqIGEyMyAtIGExMyAqIGEyMSkpO1xuICAgIG91dFs5XSAgPSAtKGEwMCAqIChhMjEgKiBhMzMgLSBhMjMgKiBhMzEpIC0gYTIwICogKGEwMSAqIGEzMyAtIGEwMyAqIGEzMSkgKyBhMzAgKiAoYTAxICogYTIzIC0gYTAzICogYTIxKSk7XG4gICAgb3V0WzEwXSA9ICAoYTAwICogKGExMSAqIGEzMyAtIGExMyAqIGEzMSkgLSBhMTAgKiAoYTAxICogYTMzIC0gYTAzICogYTMxKSArIGEzMCAqIChhMDEgKiBhMTMgLSBhMDMgKiBhMTEpKTtcbiAgICBvdXRbMTFdID0gLShhMDAgKiAoYTExICogYTIzIC0gYTEzICogYTIxKSAtIGExMCAqIChhMDEgKiBhMjMgLSBhMDMgKiBhMjEpICsgYTIwICogKGEwMSAqIGExMyAtIGEwMyAqIGExMSkpO1xuICAgIG91dFsxMl0gPSAtKGExMCAqIChhMjEgKiBhMzIgLSBhMjIgKiBhMzEpIC0gYTIwICogKGExMSAqIGEzMiAtIGExMiAqIGEzMSkgKyBhMzAgKiAoYTExICogYTIyIC0gYTEyICogYTIxKSk7XG4gICAgb3V0WzEzXSA9ICAoYTAwICogKGEyMSAqIGEzMiAtIGEyMiAqIGEzMSkgLSBhMjAgKiAoYTAxICogYTMyIC0gYTAyICogYTMxKSArIGEzMCAqIChhMDEgKiBhMjIgLSBhMDIgKiBhMjEpKTtcbiAgICBvdXRbMTRdID0gLShhMDAgKiAoYTExICogYTMyIC0gYTEyICogYTMxKSAtIGExMCAqIChhMDEgKiBhMzIgLSBhMDIgKiBhMzEpICsgYTMwICogKGEwMSAqIGExMiAtIGEwMiAqIGExMSkpO1xuICAgIG91dFsxNV0gPSAgKGEwMCAqIChhMTEgKiBhMjIgLSBhMTIgKiBhMjEpIC0gYTEwICogKGEwMSAqIGEyMiAtIGEwMiAqIGEyMSkgKyBhMjAgKiAoYTAxICogYTEyIC0gYTAyICogYTExKSk7XG4gICAgcmV0dXJuIG91dDtcbn07XG5cbi8qKlxuICogQ2FsY3VsYXRlcyB0aGUgZGV0ZXJtaW5hbnQgb2YgYSBtYXQ0XG4gKlxuICogQHBhcmFtIHttYXQ0fSBhIHRoZSBzb3VyY2UgbWF0cml4XG4gKiBAcmV0dXJucyB7TnVtYmVyfSBkZXRlcm1pbmFudCBvZiBhXG4gKi9cbm1hdDQuZGV0ZXJtaW5hbnQgPSBmdW5jdGlvbiAoYSkge1xuICAgIHZhciBhMDAgPSBhWzBdLCBhMDEgPSBhWzFdLCBhMDIgPSBhWzJdLCBhMDMgPSBhWzNdLFxuICAgICAgICBhMTAgPSBhWzRdLCBhMTEgPSBhWzVdLCBhMTIgPSBhWzZdLCBhMTMgPSBhWzddLFxuICAgICAgICBhMjAgPSBhWzhdLCBhMjEgPSBhWzldLCBhMjIgPSBhWzEwXSwgYTIzID0gYVsxMV0sXG4gICAgICAgIGEzMCA9IGFbMTJdLCBhMzEgPSBhWzEzXSwgYTMyID0gYVsxNF0sIGEzMyA9IGFbMTVdLFxuXG4gICAgICAgIGIwMCA9IGEwMCAqIGExMSAtIGEwMSAqIGExMCxcbiAgICAgICAgYjAxID0gYTAwICogYTEyIC0gYTAyICogYTEwLFxuICAgICAgICBiMDIgPSBhMDAgKiBhMTMgLSBhMDMgKiBhMTAsXG4gICAgICAgIGIwMyA9IGEwMSAqIGExMiAtIGEwMiAqIGExMSxcbiAgICAgICAgYjA0ID0gYTAxICogYTEzIC0gYTAzICogYTExLFxuICAgICAgICBiMDUgPSBhMDIgKiBhMTMgLSBhMDMgKiBhMTIsXG4gICAgICAgIGIwNiA9IGEyMCAqIGEzMSAtIGEyMSAqIGEzMCxcbiAgICAgICAgYjA3ID0gYTIwICogYTMyIC0gYTIyICogYTMwLFxuICAgICAgICBiMDggPSBhMjAgKiBhMzMgLSBhMjMgKiBhMzAsXG4gICAgICAgIGIwOSA9IGEyMSAqIGEzMiAtIGEyMiAqIGEzMSxcbiAgICAgICAgYjEwID0gYTIxICogYTMzIC0gYTIzICogYTMxLFxuICAgICAgICBiMTEgPSBhMjIgKiBhMzMgLSBhMjMgKiBhMzI7XG5cbiAgICAvLyBDYWxjdWxhdGUgdGhlIGRldGVybWluYW50XG4gICAgcmV0dXJuIGIwMCAqIGIxMSAtIGIwMSAqIGIxMCArIGIwMiAqIGIwOSArIGIwMyAqIGIwOCAtIGIwNCAqIGIwNyArIGIwNSAqIGIwNjtcbn07XG5cbi8qKlxuICogTXVsdGlwbGllcyB0d28gbWF0NCdzXG4gKlxuICogQHBhcmFtIHttYXQ0fSBvdXQgdGhlIHJlY2VpdmluZyBtYXRyaXhcbiAqIEBwYXJhbSB7bWF0NH0gYSB0aGUgZmlyc3Qgb3BlcmFuZFxuICogQHBhcmFtIHttYXQ0fSBiIHRoZSBzZWNvbmQgb3BlcmFuZFxuICogQHJldHVybnMge21hdDR9IG91dFxuICovXG5tYXQ0Lm11bHRpcGx5ID0gZnVuY3Rpb24gKG91dCwgYSwgYikge1xuICAgIHZhciBhMDAgPSBhWzBdLCBhMDEgPSBhWzFdLCBhMDIgPSBhWzJdLCBhMDMgPSBhWzNdLFxuICAgICAgICBhMTAgPSBhWzRdLCBhMTEgPSBhWzVdLCBhMTIgPSBhWzZdLCBhMTMgPSBhWzddLFxuICAgICAgICBhMjAgPSBhWzhdLCBhMjEgPSBhWzldLCBhMjIgPSBhWzEwXSwgYTIzID0gYVsxMV0sXG4gICAgICAgIGEzMCA9IGFbMTJdLCBhMzEgPSBhWzEzXSwgYTMyID0gYVsxNF0sIGEzMyA9IGFbMTVdO1xuXG4gICAgLy8gQ2FjaGUgb25seSB0aGUgY3VycmVudCBsaW5lIG9mIHRoZSBzZWNvbmQgbWF0cml4XG4gICAgdmFyIGIwICA9IGJbMF0sIGIxID0gYlsxXSwgYjIgPSBiWzJdLCBiMyA9IGJbM107ICBcbiAgICBvdXRbMF0gPSBiMCphMDAgKyBiMSphMTAgKyBiMiphMjAgKyBiMyphMzA7XG4gICAgb3V0WzFdID0gYjAqYTAxICsgYjEqYTExICsgYjIqYTIxICsgYjMqYTMxO1xuICAgIG91dFsyXSA9IGIwKmEwMiArIGIxKmExMiArIGIyKmEyMiArIGIzKmEzMjtcbiAgICBvdXRbM10gPSBiMCphMDMgKyBiMSphMTMgKyBiMiphMjMgKyBiMyphMzM7XG5cbiAgICBiMCA9IGJbNF07IGIxID0gYls1XTsgYjIgPSBiWzZdOyBiMyA9IGJbN107XG4gICAgb3V0WzRdID0gYjAqYTAwICsgYjEqYTEwICsgYjIqYTIwICsgYjMqYTMwO1xuICAgIG91dFs1XSA9IGIwKmEwMSArIGIxKmExMSArIGIyKmEyMSArIGIzKmEzMTtcbiAgICBvdXRbNl0gPSBiMCphMDIgKyBiMSphMTIgKyBiMiphMjIgKyBiMyphMzI7XG4gICAgb3V0WzddID0gYjAqYTAzICsgYjEqYTEzICsgYjIqYTIzICsgYjMqYTMzO1xuXG4gICAgYjAgPSBiWzhdOyBiMSA9IGJbOV07IGIyID0gYlsxMF07IGIzID0gYlsxMV07XG4gICAgb3V0WzhdID0gYjAqYTAwICsgYjEqYTEwICsgYjIqYTIwICsgYjMqYTMwO1xuICAgIG91dFs5XSA9IGIwKmEwMSArIGIxKmExMSArIGIyKmEyMSArIGIzKmEzMTtcbiAgICBvdXRbMTBdID0gYjAqYTAyICsgYjEqYTEyICsgYjIqYTIyICsgYjMqYTMyO1xuICAgIG91dFsxMV0gPSBiMCphMDMgKyBiMSphMTMgKyBiMiphMjMgKyBiMyphMzM7XG5cbiAgICBiMCA9IGJbMTJdOyBiMSA9IGJbMTNdOyBiMiA9IGJbMTRdOyBiMyA9IGJbMTVdO1xuICAgIG91dFsxMl0gPSBiMCphMDAgKyBiMSphMTAgKyBiMiphMjAgKyBiMyphMzA7XG4gICAgb3V0WzEzXSA9IGIwKmEwMSArIGIxKmExMSArIGIyKmEyMSArIGIzKmEzMTtcbiAgICBvdXRbMTRdID0gYjAqYTAyICsgYjEqYTEyICsgYjIqYTIyICsgYjMqYTMyO1xuICAgIG91dFsxNV0gPSBiMCphMDMgKyBiMSphMTMgKyBiMiphMjMgKyBiMyphMzM7XG4gICAgcmV0dXJuIG91dDtcbn07XG5cbi8qKlxuICogQWxpYXMgZm9yIHtAbGluayBtYXQ0Lm11bHRpcGx5fVxuICogQGZ1bmN0aW9uXG4gKi9cbm1hdDQubXVsID0gbWF0NC5tdWx0aXBseTtcblxuLyoqXG4gKiBUcmFuc2xhdGUgYSBtYXQ0IGJ5IHRoZSBnaXZlbiB2ZWN0b3JcbiAqXG4gKiBAcGFyYW0ge21hdDR9IG91dCB0aGUgcmVjZWl2aW5nIG1hdHJpeFxuICogQHBhcmFtIHttYXQ0fSBhIHRoZSBtYXRyaXggdG8gdHJhbnNsYXRlXG4gKiBAcGFyYW0ge3ZlYzN9IHYgdmVjdG9yIHRvIHRyYW5zbGF0ZSBieVxuICogQHJldHVybnMge21hdDR9IG91dFxuICovXG5tYXQ0LnRyYW5zbGF0ZSA9IGZ1bmN0aW9uIChvdXQsIGEsIHYpIHtcbiAgICB2YXIgeCA9IHZbMF0sIHkgPSB2WzFdLCB6ID0gdlsyXSxcbiAgICAgICAgYTAwLCBhMDEsIGEwMiwgYTAzLFxuICAgICAgICBhMTAsIGExMSwgYTEyLCBhMTMsXG4gICAgICAgIGEyMCwgYTIxLCBhMjIsIGEyMztcblxuICAgIGlmIChhID09PSBvdXQpIHtcbiAgICAgICAgb3V0WzEyXSA9IGFbMF0gKiB4ICsgYVs0XSAqIHkgKyBhWzhdICogeiArIGFbMTJdO1xuICAgICAgICBvdXRbMTNdID0gYVsxXSAqIHggKyBhWzVdICogeSArIGFbOV0gKiB6ICsgYVsxM107XG4gICAgICAgIG91dFsxNF0gPSBhWzJdICogeCArIGFbNl0gKiB5ICsgYVsxMF0gKiB6ICsgYVsxNF07XG4gICAgICAgIG91dFsxNV0gPSBhWzNdICogeCArIGFbN10gKiB5ICsgYVsxMV0gKiB6ICsgYVsxNV07XG4gICAgfSBlbHNlIHtcbiAgICAgICAgYTAwID0gYVswXTsgYTAxID0gYVsxXTsgYTAyID0gYVsyXTsgYTAzID0gYVszXTtcbiAgICAgICAgYTEwID0gYVs0XTsgYTExID0gYVs1XTsgYTEyID0gYVs2XTsgYTEzID0gYVs3XTtcbiAgICAgICAgYTIwID0gYVs4XTsgYTIxID0gYVs5XTsgYTIyID0gYVsxMF07IGEyMyA9IGFbMTFdO1xuXG4gICAgICAgIG91dFswXSA9IGEwMDsgb3V0WzFdID0gYTAxOyBvdXRbMl0gPSBhMDI7IG91dFszXSA9IGEwMztcbiAgICAgICAgb3V0WzRdID0gYTEwOyBvdXRbNV0gPSBhMTE7IG91dFs2XSA9IGExMjsgb3V0WzddID0gYTEzO1xuICAgICAgICBvdXRbOF0gPSBhMjA7IG91dFs5XSA9IGEyMTsgb3V0WzEwXSA9IGEyMjsgb3V0WzExXSA9IGEyMztcblxuICAgICAgICBvdXRbMTJdID0gYTAwICogeCArIGExMCAqIHkgKyBhMjAgKiB6ICsgYVsxMl07XG4gICAgICAgIG91dFsxM10gPSBhMDEgKiB4ICsgYTExICogeSArIGEyMSAqIHogKyBhWzEzXTtcbiAgICAgICAgb3V0WzE0XSA9IGEwMiAqIHggKyBhMTIgKiB5ICsgYTIyICogeiArIGFbMTRdO1xuICAgICAgICBvdXRbMTVdID0gYTAzICogeCArIGExMyAqIHkgKyBhMjMgKiB6ICsgYVsxNV07XG4gICAgfVxuXG4gICAgcmV0dXJuIG91dDtcbn07XG5cbi8qKlxuICogU2NhbGVzIHRoZSBtYXQ0IGJ5IHRoZSBkaW1lbnNpb25zIGluIHRoZSBnaXZlbiB2ZWMzXG4gKlxuICogQHBhcmFtIHttYXQ0fSBvdXQgdGhlIHJlY2VpdmluZyBtYXRyaXhcbiAqIEBwYXJhbSB7bWF0NH0gYSB0aGUgbWF0cml4IHRvIHNjYWxlXG4gKiBAcGFyYW0ge3ZlYzN9IHYgdGhlIHZlYzMgdG8gc2NhbGUgdGhlIG1hdHJpeCBieVxuICogQHJldHVybnMge21hdDR9IG91dFxuICoqL1xubWF0NC5zY2FsZSA9IGZ1bmN0aW9uKG91dCwgYSwgdikge1xuICAgIHZhciB4ID0gdlswXSwgeSA9IHZbMV0sIHogPSB2WzJdO1xuXG4gICAgb3V0WzBdID0gYVswXSAqIHg7XG4gICAgb3V0WzFdID0gYVsxXSAqIHg7XG4gICAgb3V0WzJdID0gYVsyXSAqIHg7XG4gICAgb3V0WzNdID0gYVszXSAqIHg7XG4gICAgb3V0WzRdID0gYVs0XSAqIHk7XG4gICAgb3V0WzVdID0gYVs1XSAqIHk7XG4gICAgb3V0WzZdID0gYVs2XSAqIHk7XG4gICAgb3V0WzddID0gYVs3XSAqIHk7XG4gICAgb3V0WzhdID0gYVs4XSAqIHo7XG4gICAgb3V0WzldID0gYVs5XSAqIHo7XG4gICAgb3V0WzEwXSA9IGFbMTBdICogejtcbiAgICBvdXRbMTFdID0gYVsxMV0gKiB6O1xuICAgIG91dFsxMl0gPSBhWzEyXTtcbiAgICBvdXRbMTNdID0gYVsxM107XG4gICAgb3V0WzE0XSA9IGFbMTRdO1xuICAgIG91dFsxNV0gPSBhWzE1XTtcbiAgICByZXR1cm4gb3V0O1xufTtcblxuLyoqXG4gKiBSb3RhdGVzIGEgbWF0NCBieSB0aGUgZ2l2ZW4gYW5nbGVcbiAqXG4gKiBAcGFyYW0ge21hdDR9IG91dCB0aGUgcmVjZWl2aW5nIG1hdHJpeFxuICogQHBhcmFtIHttYXQ0fSBhIHRoZSBtYXRyaXggdG8gcm90YXRlXG4gKiBAcGFyYW0ge051bWJlcn0gcmFkIHRoZSBhbmdsZSB0byByb3RhdGUgdGhlIG1hdHJpeCBieVxuICogQHBhcmFtIHt2ZWMzfSBheGlzIHRoZSBheGlzIHRvIHJvdGF0ZSBhcm91bmRcbiAqIEByZXR1cm5zIHttYXQ0fSBvdXRcbiAqL1xubWF0NC5yb3RhdGUgPSBmdW5jdGlvbiAob3V0LCBhLCByYWQsIGF4aXMpIHtcbiAgICB2YXIgeCA9IGF4aXNbMF0sIHkgPSBheGlzWzFdLCB6ID0gYXhpc1syXSxcbiAgICAgICAgbGVuID0gTWF0aC5zcXJ0KHggKiB4ICsgeSAqIHkgKyB6ICogeiksXG4gICAgICAgIHMsIGMsIHQsXG4gICAgICAgIGEwMCwgYTAxLCBhMDIsIGEwMyxcbiAgICAgICAgYTEwLCBhMTEsIGExMiwgYTEzLFxuICAgICAgICBhMjAsIGEyMSwgYTIyLCBhMjMsXG4gICAgICAgIGIwMCwgYjAxLCBiMDIsXG4gICAgICAgIGIxMCwgYjExLCBiMTIsXG4gICAgICAgIGIyMCwgYjIxLCBiMjI7XG5cbiAgICBpZiAoTWF0aC5hYnMobGVuKSA8IEdMTUFUX0VQU0lMT04pIHsgcmV0dXJuIG51bGw7IH1cbiAgICBcbiAgICBsZW4gPSAxIC8gbGVuO1xuICAgIHggKj0gbGVuO1xuICAgIHkgKj0gbGVuO1xuICAgIHogKj0gbGVuO1xuXG4gICAgcyA9IE1hdGguc2luKHJhZCk7XG4gICAgYyA9IE1hdGguY29zKHJhZCk7XG4gICAgdCA9IDEgLSBjO1xuXG4gICAgYTAwID0gYVswXTsgYTAxID0gYVsxXTsgYTAyID0gYVsyXTsgYTAzID0gYVszXTtcbiAgICBhMTAgPSBhWzRdOyBhMTEgPSBhWzVdOyBhMTIgPSBhWzZdOyBhMTMgPSBhWzddO1xuICAgIGEyMCA9IGFbOF07IGEyMSA9IGFbOV07IGEyMiA9IGFbMTBdOyBhMjMgPSBhWzExXTtcblxuICAgIC8vIENvbnN0cnVjdCB0aGUgZWxlbWVudHMgb2YgdGhlIHJvdGF0aW9uIG1hdHJpeFxuICAgIGIwMCA9IHggKiB4ICogdCArIGM7IGIwMSA9IHkgKiB4ICogdCArIHogKiBzOyBiMDIgPSB6ICogeCAqIHQgLSB5ICogcztcbiAgICBiMTAgPSB4ICogeSAqIHQgLSB6ICogczsgYjExID0geSAqIHkgKiB0ICsgYzsgYjEyID0geiAqIHkgKiB0ICsgeCAqIHM7XG4gICAgYjIwID0geCAqIHogKiB0ICsgeSAqIHM7IGIyMSA9IHkgKiB6ICogdCAtIHggKiBzOyBiMjIgPSB6ICogeiAqIHQgKyBjO1xuXG4gICAgLy8gUGVyZm9ybSByb3RhdGlvbi1zcGVjaWZpYyBtYXRyaXggbXVsdGlwbGljYXRpb25cbiAgICBvdXRbMF0gPSBhMDAgKiBiMDAgKyBhMTAgKiBiMDEgKyBhMjAgKiBiMDI7XG4gICAgb3V0WzFdID0gYTAxICogYjAwICsgYTExICogYjAxICsgYTIxICogYjAyO1xuICAgIG91dFsyXSA9IGEwMiAqIGIwMCArIGExMiAqIGIwMSArIGEyMiAqIGIwMjtcbiAgICBvdXRbM10gPSBhMDMgKiBiMDAgKyBhMTMgKiBiMDEgKyBhMjMgKiBiMDI7XG4gICAgb3V0WzRdID0gYTAwICogYjEwICsgYTEwICogYjExICsgYTIwICogYjEyO1xuICAgIG91dFs1XSA9IGEwMSAqIGIxMCArIGExMSAqIGIxMSArIGEyMSAqIGIxMjtcbiAgICBvdXRbNl0gPSBhMDIgKiBiMTAgKyBhMTIgKiBiMTEgKyBhMjIgKiBiMTI7XG4gICAgb3V0WzddID0gYTAzICogYjEwICsgYTEzICogYjExICsgYTIzICogYjEyO1xuICAgIG91dFs4XSA9IGEwMCAqIGIyMCArIGExMCAqIGIyMSArIGEyMCAqIGIyMjtcbiAgICBvdXRbOV0gPSBhMDEgKiBiMjAgKyBhMTEgKiBiMjEgKyBhMjEgKiBiMjI7XG4gICAgb3V0WzEwXSA9IGEwMiAqIGIyMCArIGExMiAqIGIyMSArIGEyMiAqIGIyMjtcbiAgICBvdXRbMTFdID0gYTAzICogYjIwICsgYTEzICogYjIxICsgYTIzICogYjIyO1xuXG4gICAgaWYgKGEgIT09IG91dCkgeyAvLyBJZiB0aGUgc291cmNlIGFuZCBkZXN0aW5hdGlvbiBkaWZmZXIsIGNvcHkgdGhlIHVuY2hhbmdlZCBsYXN0IHJvd1xuICAgICAgICBvdXRbMTJdID0gYVsxMl07XG4gICAgICAgIG91dFsxM10gPSBhWzEzXTtcbiAgICAgICAgb3V0WzE0XSA9IGFbMTRdO1xuICAgICAgICBvdXRbMTVdID0gYVsxNV07XG4gICAgfVxuICAgIHJldHVybiBvdXQ7XG59O1xuXG4vKipcbiAqIFJvdGF0ZXMgYSBtYXRyaXggYnkgdGhlIGdpdmVuIGFuZ2xlIGFyb3VuZCB0aGUgWCBheGlzXG4gKlxuICogQHBhcmFtIHttYXQ0fSBvdXQgdGhlIHJlY2VpdmluZyBtYXRyaXhcbiAqIEBwYXJhbSB7bWF0NH0gYSB0aGUgbWF0cml4IHRvIHJvdGF0ZVxuICogQHBhcmFtIHtOdW1iZXJ9IHJhZCB0aGUgYW5nbGUgdG8gcm90YXRlIHRoZSBtYXRyaXggYnlcbiAqIEByZXR1cm5zIHttYXQ0fSBvdXRcbiAqL1xubWF0NC5yb3RhdGVYID0gZnVuY3Rpb24gKG91dCwgYSwgcmFkKSB7XG4gICAgdmFyIHMgPSBNYXRoLnNpbihyYWQpLFxuICAgICAgICBjID0gTWF0aC5jb3MocmFkKSxcbiAgICAgICAgYTEwID0gYVs0XSxcbiAgICAgICAgYTExID0gYVs1XSxcbiAgICAgICAgYTEyID0gYVs2XSxcbiAgICAgICAgYTEzID0gYVs3XSxcbiAgICAgICAgYTIwID0gYVs4XSxcbiAgICAgICAgYTIxID0gYVs5XSxcbiAgICAgICAgYTIyID0gYVsxMF0sXG4gICAgICAgIGEyMyA9IGFbMTFdO1xuXG4gICAgaWYgKGEgIT09IG91dCkgeyAvLyBJZiB0aGUgc291cmNlIGFuZCBkZXN0aW5hdGlvbiBkaWZmZXIsIGNvcHkgdGhlIHVuY2hhbmdlZCByb3dzXG4gICAgICAgIG91dFswXSAgPSBhWzBdO1xuICAgICAgICBvdXRbMV0gID0gYVsxXTtcbiAgICAgICAgb3V0WzJdICA9IGFbMl07XG4gICAgICAgIG91dFszXSAgPSBhWzNdO1xuICAgICAgICBvdXRbMTJdID0gYVsxMl07XG4gICAgICAgIG91dFsxM10gPSBhWzEzXTtcbiAgICAgICAgb3V0WzE0XSA9IGFbMTRdO1xuICAgICAgICBvdXRbMTVdID0gYVsxNV07XG4gICAgfVxuXG4gICAgLy8gUGVyZm9ybSBheGlzLXNwZWNpZmljIG1hdHJpeCBtdWx0aXBsaWNhdGlvblxuICAgIG91dFs0XSA9IGExMCAqIGMgKyBhMjAgKiBzO1xuICAgIG91dFs1XSA9IGExMSAqIGMgKyBhMjEgKiBzO1xuICAgIG91dFs2XSA9IGExMiAqIGMgKyBhMjIgKiBzO1xuICAgIG91dFs3XSA9IGExMyAqIGMgKyBhMjMgKiBzO1xuICAgIG91dFs4XSA9IGEyMCAqIGMgLSBhMTAgKiBzO1xuICAgIG91dFs5XSA9IGEyMSAqIGMgLSBhMTEgKiBzO1xuICAgIG91dFsxMF0gPSBhMjIgKiBjIC0gYTEyICogcztcbiAgICBvdXRbMTFdID0gYTIzICogYyAtIGExMyAqIHM7XG4gICAgcmV0dXJuIG91dDtcbn07XG5cbi8qKlxuICogUm90YXRlcyBhIG1hdHJpeCBieSB0aGUgZ2l2ZW4gYW5nbGUgYXJvdW5kIHRoZSBZIGF4aXNcbiAqXG4gKiBAcGFyYW0ge21hdDR9IG91dCB0aGUgcmVjZWl2aW5nIG1hdHJpeFxuICogQHBhcmFtIHttYXQ0fSBhIHRoZSBtYXRyaXggdG8gcm90YXRlXG4gKiBAcGFyYW0ge051bWJlcn0gcmFkIHRoZSBhbmdsZSB0byByb3RhdGUgdGhlIG1hdHJpeCBieVxuICogQHJldHVybnMge21hdDR9IG91dFxuICovXG5tYXQ0LnJvdGF0ZVkgPSBmdW5jdGlvbiAob3V0LCBhLCByYWQpIHtcbiAgICB2YXIgcyA9IE1hdGguc2luKHJhZCksXG4gICAgICAgIGMgPSBNYXRoLmNvcyhyYWQpLFxuICAgICAgICBhMDAgPSBhWzBdLFxuICAgICAgICBhMDEgPSBhWzFdLFxuICAgICAgICBhMDIgPSBhWzJdLFxuICAgICAgICBhMDMgPSBhWzNdLFxuICAgICAgICBhMjAgPSBhWzhdLFxuICAgICAgICBhMjEgPSBhWzldLFxuICAgICAgICBhMjIgPSBhWzEwXSxcbiAgICAgICAgYTIzID0gYVsxMV07XG5cbiAgICBpZiAoYSAhPT0gb3V0KSB7IC8vIElmIHRoZSBzb3VyY2UgYW5kIGRlc3RpbmF0aW9uIGRpZmZlciwgY29weSB0aGUgdW5jaGFuZ2VkIHJvd3NcbiAgICAgICAgb3V0WzRdICA9IGFbNF07XG4gICAgICAgIG91dFs1XSAgPSBhWzVdO1xuICAgICAgICBvdXRbNl0gID0gYVs2XTtcbiAgICAgICAgb3V0WzddICA9IGFbN107XG4gICAgICAgIG91dFsxMl0gPSBhWzEyXTtcbiAgICAgICAgb3V0WzEzXSA9IGFbMTNdO1xuICAgICAgICBvdXRbMTRdID0gYVsxNF07XG4gICAgICAgIG91dFsxNV0gPSBhWzE1XTtcbiAgICB9XG5cbiAgICAvLyBQZXJmb3JtIGF4aXMtc3BlY2lmaWMgbWF0cml4IG11bHRpcGxpY2F0aW9uXG4gICAgb3V0WzBdID0gYTAwICogYyAtIGEyMCAqIHM7XG4gICAgb3V0WzFdID0gYTAxICogYyAtIGEyMSAqIHM7XG4gICAgb3V0WzJdID0gYTAyICogYyAtIGEyMiAqIHM7XG4gICAgb3V0WzNdID0gYTAzICogYyAtIGEyMyAqIHM7XG4gICAgb3V0WzhdID0gYTAwICogcyArIGEyMCAqIGM7XG4gICAgb3V0WzldID0gYTAxICogcyArIGEyMSAqIGM7XG4gICAgb3V0WzEwXSA9IGEwMiAqIHMgKyBhMjIgKiBjO1xuICAgIG91dFsxMV0gPSBhMDMgKiBzICsgYTIzICogYztcbiAgICByZXR1cm4gb3V0O1xufTtcblxuLyoqXG4gKiBSb3RhdGVzIGEgbWF0cml4IGJ5IHRoZSBnaXZlbiBhbmdsZSBhcm91bmQgdGhlIFogYXhpc1xuICpcbiAqIEBwYXJhbSB7bWF0NH0gb3V0IHRoZSByZWNlaXZpbmcgbWF0cml4XG4gKiBAcGFyYW0ge21hdDR9IGEgdGhlIG1hdHJpeCB0byByb3RhdGVcbiAqIEBwYXJhbSB7TnVtYmVyfSByYWQgdGhlIGFuZ2xlIHRvIHJvdGF0ZSB0aGUgbWF0cml4IGJ5XG4gKiBAcmV0dXJucyB7bWF0NH0gb3V0XG4gKi9cbm1hdDQucm90YXRlWiA9IGZ1bmN0aW9uIChvdXQsIGEsIHJhZCkge1xuICAgIHZhciBzID0gTWF0aC5zaW4ocmFkKSxcbiAgICAgICAgYyA9IE1hdGguY29zKHJhZCksXG4gICAgICAgIGEwMCA9IGFbMF0sXG4gICAgICAgIGEwMSA9IGFbMV0sXG4gICAgICAgIGEwMiA9IGFbMl0sXG4gICAgICAgIGEwMyA9IGFbM10sXG4gICAgICAgIGExMCA9IGFbNF0sXG4gICAgICAgIGExMSA9IGFbNV0sXG4gICAgICAgIGExMiA9IGFbNl0sXG4gICAgICAgIGExMyA9IGFbN107XG5cbiAgICBpZiAoYSAhPT0gb3V0KSB7IC8vIElmIHRoZSBzb3VyY2UgYW5kIGRlc3RpbmF0aW9uIGRpZmZlciwgY29weSB0aGUgdW5jaGFuZ2VkIGxhc3Qgcm93XG4gICAgICAgIG91dFs4XSAgPSBhWzhdO1xuICAgICAgICBvdXRbOV0gID0gYVs5XTtcbiAgICAgICAgb3V0WzEwXSA9IGFbMTBdO1xuICAgICAgICBvdXRbMTFdID0gYVsxMV07XG4gICAgICAgIG91dFsxMl0gPSBhWzEyXTtcbiAgICAgICAgb3V0WzEzXSA9IGFbMTNdO1xuICAgICAgICBvdXRbMTRdID0gYVsxNF07XG4gICAgICAgIG91dFsxNV0gPSBhWzE1XTtcbiAgICB9XG5cbiAgICAvLyBQZXJmb3JtIGF4aXMtc3BlY2lmaWMgbWF0cml4IG11bHRpcGxpY2F0aW9uXG4gICAgb3V0WzBdID0gYTAwICogYyArIGExMCAqIHM7XG4gICAgb3V0WzFdID0gYTAxICogYyArIGExMSAqIHM7XG4gICAgb3V0WzJdID0gYTAyICogYyArIGExMiAqIHM7XG4gICAgb3V0WzNdID0gYTAzICogYyArIGExMyAqIHM7XG4gICAgb3V0WzRdID0gYTEwICogYyAtIGEwMCAqIHM7XG4gICAgb3V0WzVdID0gYTExICogYyAtIGEwMSAqIHM7XG4gICAgb3V0WzZdID0gYTEyICogYyAtIGEwMiAqIHM7XG4gICAgb3V0WzddID0gYTEzICogYyAtIGEwMyAqIHM7XG4gICAgcmV0dXJuIG91dDtcbn07XG5cbi8qKlxuICogQ3JlYXRlcyBhIG1hdHJpeCBmcm9tIGEgcXVhdGVybmlvbiByb3RhdGlvbiBhbmQgdmVjdG9yIHRyYW5zbGF0aW9uXG4gKiBUaGlzIGlzIGVxdWl2YWxlbnQgdG8gKGJ1dCBtdWNoIGZhc3RlciB0aGFuKTpcbiAqXG4gKiAgICAgbWF0NC5pZGVudGl0eShkZXN0KTtcbiAqICAgICBtYXQ0LnRyYW5zbGF0ZShkZXN0LCB2ZWMpO1xuICogICAgIHZhciBxdWF0TWF0ID0gbWF0NC5jcmVhdGUoKTtcbiAqICAgICBxdWF0NC50b01hdDQocXVhdCwgcXVhdE1hdCk7XG4gKiAgICAgbWF0NC5tdWx0aXBseShkZXN0LCBxdWF0TWF0KTtcbiAqXG4gKiBAcGFyYW0ge21hdDR9IG91dCBtYXQ0IHJlY2VpdmluZyBvcGVyYXRpb24gcmVzdWx0XG4gKiBAcGFyYW0ge3F1YXQ0fSBxIFJvdGF0aW9uIHF1YXRlcm5pb25cbiAqIEBwYXJhbSB7dmVjM30gdiBUcmFuc2xhdGlvbiB2ZWN0b3JcbiAqIEByZXR1cm5zIHttYXQ0fSBvdXRcbiAqL1xubWF0NC5mcm9tUm90YXRpb25UcmFuc2xhdGlvbiA9IGZ1bmN0aW9uIChvdXQsIHEsIHYpIHtcbiAgICAvLyBRdWF0ZXJuaW9uIG1hdGhcbiAgICB2YXIgeCA9IHFbMF0sIHkgPSBxWzFdLCB6ID0gcVsyXSwgdyA9IHFbM10sXG4gICAgICAgIHgyID0geCArIHgsXG4gICAgICAgIHkyID0geSArIHksXG4gICAgICAgIHoyID0geiArIHosXG5cbiAgICAgICAgeHggPSB4ICogeDIsXG4gICAgICAgIHh5ID0geCAqIHkyLFxuICAgICAgICB4eiA9IHggKiB6MixcbiAgICAgICAgeXkgPSB5ICogeTIsXG4gICAgICAgIHl6ID0geSAqIHoyLFxuICAgICAgICB6eiA9IHogKiB6MixcbiAgICAgICAgd3ggPSB3ICogeDIsXG4gICAgICAgIHd5ID0gdyAqIHkyLFxuICAgICAgICB3eiA9IHcgKiB6MjtcblxuICAgIG91dFswXSA9IDEgLSAoeXkgKyB6eik7XG4gICAgb3V0WzFdID0geHkgKyB3ejtcbiAgICBvdXRbMl0gPSB4eiAtIHd5O1xuICAgIG91dFszXSA9IDA7XG4gICAgb3V0WzRdID0geHkgLSB3ejtcbiAgICBvdXRbNV0gPSAxIC0gKHh4ICsgenopO1xuICAgIG91dFs2XSA9IHl6ICsgd3g7XG4gICAgb3V0WzddID0gMDtcbiAgICBvdXRbOF0gPSB4eiArIHd5O1xuICAgIG91dFs5XSA9IHl6IC0gd3g7XG4gICAgb3V0WzEwXSA9IDEgLSAoeHggKyB5eSk7XG4gICAgb3V0WzExXSA9IDA7XG4gICAgb3V0WzEyXSA9IHZbMF07XG4gICAgb3V0WzEzXSA9IHZbMV07XG4gICAgb3V0WzE0XSA9IHZbMl07XG4gICAgb3V0WzE1XSA9IDE7XG4gICAgXG4gICAgcmV0dXJuIG91dDtcbn07XG5cbi8qKlxuKiBDYWxjdWxhdGVzIGEgNHg0IG1hdHJpeCBmcm9tIHRoZSBnaXZlbiBxdWF0ZXJuaW9uXG4qXG4qIEBwYXJhbSB7bWF0NH0gb3V0IG1hdDQgcmVjZWl2aW5nIG9wZXJhdGlvbiByZXN1bHRcbiogQHBhcmFtIHtxdWF0fSBxIFF1YXRlcm5pb24gdG8gY3JlYXRlIG1hdHJpeCBmcm9tXG4qXG4qIEByZXR1cm5zIHttYXQ0fSBvdXRcbiovXG5tYXQ0LmZyb21RdWF0ID0gZnVuY3Rpb24gKG91dCwgcSkge1xuICAgIHZhciB4ID0gcVswXSwgeSA9IHFbMV0sIHogPSBxWzJdLCB3ID0gcVszXSxcbiAgICAgICAgeDIgPSB4ICsgeCxcbiAgICAgICAgeTIgPSB5ICsgeSxcbiAgICAgICAgejIgPSB6ICsgeixcblxuICAgICAgICB4eCA9IHggKiB4MixcbiAgICAgICAgeHkgPSB4ICogeTIsXG4gICAgICAgIHh6ID0geCAqIHoyLFxuICAgICAgICB5eSA9IHkgKiB5MixcbiAgICAgICAgeXogPSB5ICogejIsXG4gICAgICAgIHp6ID0geiAqIHoyLFxuICAgICAgICB3eCA9IHcgKiB4MixcbiAgICAgICAgd3kgPSB3ICogeTIsXG4gICAgICAgIHd6ID0gdyAqIHoyO1xuXG4gICAgb3V0WzBdID0gMSAtICh5eSArIHp6KTtcbiAgICBvdXRbMV0gPSB4eSArIHd6O1xuICAgIG91dFsyXSA9IHh6IC0gd3k7XG4gICAgb3V0WzNdID0gMDtcblxuICAgIG91dFs0XSA9IHh5IC0gd3o7XG4gICAgb3V0WzVdID0gMSAtICh4eCArIHp6KTtcbiAgICBvdXRbNl0gPSB5eiArIHd4O1xuICAgIG91dFs3XSA9IDA7XG5cbiAgICBvdXRbOF0gPSB4eiArIHd5O1xuICAgIG91dFs5XSA9IHl6IC0gd3g7XG4gICAgb3V0WzEwXSA9IDEgLSAoeHggKyB5eSk7XG4gICAgb3V0WzExXSA9IDA7XG5cbiAgICBvdXRbMTJdID0gMDtcbiAgICBvdXRbMTNdID0gMDtcbiAgICBvdXRbMTRdID0gMDtcbiAgICBvdXRbMTVdID0gMTtcblxuICAgIHJldHVybiBvdXQ7XG59O1xuXG4vKipcbiAqIEdlbmVyYXRlcyBhIGZydXN0dW0gbWF0cml4IHdpdGggdGhlIGdpdmVuIGJvdW5kc1xuICpcbiAqIEBwYXJhbSB7bWF0NH0gb3V0IG1hdDQgZnJ1c3R1bSBtYXRyaXggd2lsbCBiZSB3cml0dGVuIGludG9cbiAqIEBwYXJhbSB7TnVtYmVyfSBsZWZ0IExlZnQgYm91bmQgb2YgdGhlIGZydXN0dW1cbiAqIEBwYXJhbSB7TnVtYmVyfSByaWdodCBSaWdodCBib3VuZCBvZiB0aGUgZnJ1c3R1bVxuICogQHBhcmFtIHtOdW1iZXJ9IGJvdHRvbSBCb3R0b20gYm91bmQgb2YgdGhlIGZydXN0dW1cbiAqIEBwYXJhbSB7TnVtYmVyfSB0b3AgVG9wIGJvdW5kIG9mIHRoZSBmcnVzdHVtXG4gKiBAcGFyYW0ge051bWJlcn0gbmVhciBOZWFyIGJvdW5kIG9mIHRoZSBmcnVzdHVtXG4gKiBAcGFyYW0ge051bWJlcn0gZmFyIEZhciBib3VuZCBvZiB0aGUgZnJ1c3R1bVxuICogQHJldHVybnMge21hdDR9IG91dFxuICovXG5tYXQ0LmZydXN0dW0gPSBmdW5jdGlvbiAob3V0LCBsZWZ0LCByaWdodCwgYm90dG9tLCB0b3AsIG5lYXIsIGZhcikge1xuICAgIHZhciBybCA9IDEgLyAocmlnaHQgLSBsZWZ0KSxcbiAgICAgICAgdGIgPSAxIC8gKHRvcCAtIGJvdHRvbSksXG4gICAgICAgIG5mID0gMSAvIChuZWFyIC0gZmFyKTtcbiAgICBvdXRbMF0gPSAobmVhciAqIDIpICogcmw7XG4gICAgb3V0WzFdID0gMDtcbiAgICBvdXRbMl0gPSAwO1xuICAgIG91dFszXSA9IDA7XG4gICAgb3V0WzRdID0gMDtcbiAgICBvdXRbNV0gPSAobmVhciAqIDIpICogdGI7XG4gICAgb3V0WzZdID0gMDtcbiAgICBvdXRbN10gPSAwO1xuICAgIG91dFs4XSA9IChyaWdodCArIGxlZnQpICogcmw7XG4gICAgb3V0WzldID0gKHRvcCArIGJvdHRvbSkgKiB0YjtcbiAgICBvdXRbMTBdID0gKGZhciArIG5lYXIpICogbmY7XG4gICAgb3V0WzExXSA9IC0xO1xuICAgIG91dFsxMl0gPSAwO1xuICAgIG91dFsxM10gPSAwO1xuICAgIG91dFsxNF0gPSAoZmFyICogbmVhciAqIDIpICogbmY7XG4gICAgb3V0WzE1XSA9IDA7XG4gICAgcmV0dXJuIG91dDtcbn07XG5cbi8qKlxuICogR2VuZXJhdGVzIGEgcGVyc3BlY3RpdmUgcHJvamVjdGlvbiBtYXRyaXggd2l0aCB0aGUgZ2l2ZW4gYm91bmRzXG4gKlxuICogQHBhcmFtIHttYXQ0fSBvdXQgbWF0NCBmcnVzdHVtIG1hdHJpeCB3aWxsIGJlIHdyaXR0ZW4gaW50b1xuICogQHBhcmFtIHtudW1iZXJ9IGZvdnkgVmVydGljYWwgZmllbGQgb2YgdmlldyBpbiByYWRpYW5zXG4gKiBAcGFyYW0ge251bWJlcn0gYXNwZWN0IEFzcGVjdCByYXRpby4gdHlwaWNhbGx5IHZpZXdwb3J0IHdpZHRoL2hlaWdodFxuICogQHBhcmFtIHtudW1iZXJ9IG5lYXIgTmVhciBib3VuZCBvZiB0aGUgZnJ1c3R1bVxuICogQHBhcmFtIHtudW1iZXJ9IGZhciBGYXIgYm91bmQgb2YgdGhlIGZydXN0dW1cbiAqIEByZXR1cm5zIHttYXQ0fSBvdXRcbiAqL1xubWF0NC5wZXJzcGVjdGl2ZSA9IGZ1bmN0aW9uIChvdXQsIGZvdnksIGFzcGVjdCwgbmVhciwgZmFyKSB7XG4gICAgdmFyIGYgPSAxLjAgLyBNYXRoLnRhbihmb3Z5IC8gMiksXG4gICAgICAgIG5mID0gMSAvIChuZWFyIC0gZmFyKTtcbiAgICBvdXRbMF0gPSBmIC8gYXNwZWN0O1xuICAgIG91dFsxXSA9IDA7XG4gICAgb3V0WzJdID0gMDtcbiAgICBvdXRbM10gPSAwO1xuICAgIG91dFs0XSA9IDA7XG4gICAgb3V0WzVdID0gZjtcbiAgICBvdXRbNl0gPSAwO1xuICAgIG91dFs3XSA9IDA7XG4gICAgb3V0WzhdID0gMDtcbiAgICBvdXRbOV0gPSAwO1xuICAgIG91dFsxMF0gPSAoZmFyICsgbmVhcikgKiBuZjtcbiAgICBvdXRbMTFdID0gLTE7XG4gICAgb3V0WzEyXSA9IDA7XG4gICAgb3V0WzEzXSA9IDA7XG4gICAgb3V0WzE0XSA9ICgyICogZmFyICogbmVhcikgKiBuZjtcbiAgICBvdXRbMTVdID0gMDtcbiAgICByZXR1cm4gb3V0O1xufTtcblxuLyoqXG4gKiBHZW5lcmF0ZXMgYSBvcnRob2dvbmFsIHByb2plY3Rpb24gbWF0cml4IHdpdGggdGhlIGdpdmVuIGJvdW5kc1xuICpcbiAqIEBwYXJhbSB7bWF0NH0gb3V0IG1hdDQgZnJ1c3R1bSBtYXRyaXggd2lsbCBiZSB3cml0dGVuIGludG9cbiAqIEBwYXJhbSB7bnVtYmVyfSBsZWZ0IExlZnQgYm91bmQgb2YgdGhlIGZydXN0dW1cbiAqIEBwYXJhbSB7bnVtYmVyfSByaWdodCBSaWdodCBib3VuZCBvZiB0aGUgZnJ1c3R1bVxuICogQHBhcmFtIHtudW1iZXJ9IGJvdHRvbSBCb3R0b20gYm91bmQgb2YgdGhlIGZydXN0dW1cbiAqIEBwYXJhbSB7bnVtYmVyfSB0b3AgVG9wIGJvdW5kIG9mIHRoZSBmcnVzdHVtXG4gKiBAcGFyYW0ge251bWJlcn0gbmVhciBOZWFyIGJvdW5kIG9mIHRoZSBmcnVzdHVtXG4gKiBAcGFyYW0ge251bWJlcn0gZmFyIEZhciBib3VuZCBvZiB0aGUgZnJ1c3R1bVxuICogQHJldHVybnMge21hdDR9IG91dFxuICovXG5tYXQ0Lm9ydGhvID0gZnVuY3Rpb24gKG91dCwgbGVmdCwgcmlnaHQsIGJvdHRvbSwgdG9wLCBuZWFyLCBmYXIpIHtcbiAgICB2YXIgbHIgPSAxIC8gKGxlZnQgLSByaWdodCksXG4gICAgICAgIGJ0ID0gMSAvIChib3R0b20gLSB0b3ApLFxuICAgICAgICBuZiA9IDEgLyAobmVhciAtIGZhcik7XG4gICAgb3V0WzBdID0gLTIgKiBscjtcbiAgICBvdXRbMV0gPSAwO1xuICAgIG91dFsyXSA9IDA7XG4gICAgb3V0WzNdID0gMDtcbiAgICBvdXRbNF0gPSAwO1xuICAgIG91dFs1XSA9IC0yICogYnQ7XG4gICAgb3V0WzZdID0gMDtcbiAgICBvdXRbN10gPSAwO1xuICAgIG91dFs4XSA9IDA7XG4gICAgb3V0WzldID0gMDtcbiAgICBvdXRbMTBdID0gMiAqIG5mO1xuICAgIG91dFsxMV0gPSAwO1xuICAgIG91dFsxMl0gPSAobGVmdCArIHJpZ2h0KSAqIGxyO1xuICAgIG91dFsxM10gPSAodG9wICsgYm90dG9tKSAqIGJ0O1xuICAgIG91dFsxNF0gPSAoZmFyICsgbmVhcikgKiBuZjtcbiAgICBvdXRbMTVdID0gMTtcbiAgICByZXR1cm4gb3V0O1xufTtcblxuLyoqXG4gKiBHZW5lcmF0ZXMgYSBsb29rLWF0IG1hdHJpeCB3aXRoIHRoZSBnaXZlbiBleWUgcG9zaXRpb24sIGZvY2FsIHBvaW50LCBhbmQgdXAgYXhpc1xuICpcbiAqIEBwYXJhbSB7bWF0NH0gb3V0IG1hdDQgZnJ1c3R1bSBtYXRyaXggd2lsbCBiZSB3cml0dGVuIGludG9cbiAqIEBwYXJhbSB7dmVjM30gZXllIFBvc2l0aW9uIG9mIHRoZSB2aWV3ZXJcbiAqIEBwYXJhbSB7dmVjM30gY2VudGVyIFBvaW50IHRoZSB2aWV3ZXIgaXMgbG9va2luZyBhdFxuICogQHBhcmFtIHt2ZWMzfSB1cCB2ZWMzIHBvaW50aW5nIHVwXG4gKiBAcmV0dXJucyB7bWF0NH0gb3V0XG4gKi9cbm1hdDQubG9va0F0ID0gZnVuY3Rpb24gKG91dCwgZXllLCBjZW50ZXIsIHVwKSB7XG4gICAgdmFyIHgwLCB4MSwgeDIsIHkwLCB5MSwgeTIsIHowLCB6MSwgejIsIGxlbixcbiAgICAgICAgZXlleCA9IGV5ZVswXSxcbiAgICAgICAgZXlleSA9IGV5ZVsxXSxcbiAgICAgICAgZXlleiA9IGV5ZVsyXSxcbiAgICAgICAgdXB4ID0gdXBbMF0sXG4gICAgICAgIHVweSA9IHVwWzFdLFxuICAgICAgICB1cHogPSB1cFsyXSxcbiAgICAgICAgY2VudGVyeCA9IGNlbnRlclswXSxcbiAgICAgICAgY2VudGVyeSA9IGNlbnRlclsxXSxcbiAgICAgICAgY2VudGVyeiA9IGNlbnRlclsyXTtcblxuICAgIGlmIChNYXRoLmFicyhleWV4IC0gY2VudGVyeCkgPCBHTE1BVF9FUFNJTE9OICYmXG4gICAgICAgIE1hdGguYWJzKGV5ZXkgLSBjZW50ZXJ5KSA8IEdMTUFUX0VQU0lMT04gJiZcbiAgICAgICAgTWF0aC5hYnMoZXlleiAtIGNlbnRlcnopIDwgR0xNQVRfRVBTSUxPTikge1xuICAgICAgICByZXR1cm4gbWF0NC5pZGVudGl0eShvdXQpO1xuICAgIH1cblxuICAgIHowID0gZXlleCAtIGNlbnRlcng7XG4gICAgejEgPSBleWV5IC0gY2VudGVyeTtcbiAgICB6MiA9IGV5ZXogLSBjZW50ZXJ6O1xuXG4gICAgbGVuID0gMSAvIE1hdGguc3FydCh6MCAqIHowICsgejEgKiB6MSArIHoyICogejIpO1xuICAgIHowICo9IGxlbjtcbiAgICB6MSAqPSBsZW47XG4gICAgejIgKj0gbGVuO1xuXG4gICAgeDAgPSB1cHkgKiB6MiAtIHVweiAqIHoxO1xuICAgIHgxID0gdXB6ICogejAgLSB1cHggKiB6MjtcbiAgICB4MiA9IHVweCAqIHoxIC0gdXB5ICogejA7XG4gICAgbGVuID0gTWF0aC5zcXJ0KHgwICogeDAgKyB4MSAqIHgxICsgeDIgKiB4Mik7XG4gICAgaWYgKCFsZW4pIHtcbiAgICAgICAgeDAgPSAwO1xuICAgICAgICB4MSA9IDA7XG4gICAgICAgIHgyID0gMDtcbiAgICB9IGVsc2Uge1xuICAgICAgICBsZW4gPSAxIC8gbGVuO1xuICAgICAgICB4MCAqPSBsZW47XG4gICAgICAgIHgxICo9IGxlbjtcbiAgICAgICAgeDIgKj0gbGVuO1xuICAgIH1cblxuICAgIHkwID0gejEgKiB4MiAtIHoyICogeDE7XG4gICAgeTEgPSB6MiAqIHgwIC0gejAgKiB4MjtcbiAgICB5MiA9IHowICogeDEgLSB6MSAqIHgwO1xuXG4gICAgbGVuID0gTWF0aC5zcXJ0KHkwICogeTAgKyB5MSAqIHkxICsgeTIgKiB5Mik7XG4gICAgaWYgKCFsZW4pIHtcbiAgICAgICAgeTAgPSAwO1xuICAgICAgICB5MSA9IDA7XG4gICAgICAgIHkyID0gMDtcbiAgICB9IGVsc2Uge1xuICAgICAgICBsZW4gPSAxIC8gbGVuO1xuICAgICAgICB5MCAqPSBsZW47XG4gICAgICAgIHkxICo9IGxlbjtcbiAgICAgICAgeTIgKj0gbGVuO1xuICAgIH1cblxuICAgIG91dFswXSA9IHgwO1xuICAgIG91dFsxXSA9IHkwO1xuICAgIG91dFsyXSA9IHowO1xuICAgIG91dFszXSA9IDA7XG4gICAgb3V0WzRdID0geDE7XG4gICAgb3V0WzVdID0geTE7XG4gICAgb3V0WzZdID0gejE7XG4gICAgb3V0WzddID0gMDtcbiAgICBvdXRbOF0gPSB4MjtcbiAgICBvdXRbOV0gPSB5MjtcbiAgICBvdXRbMTBdID0gejI7XG4gICAgb3V0WzExXSA9IDA7XG4gICAgb3V0WzEyXSA9IC0oeDAgKiBleWV4ICsgeDEgKiBleWV5ICsgeDIgKiBleWV6KTtcbiAgICBvdXRbMTNdID0gLSh5MCAqIGV5ZXggKyB5MSAqIGV5ZXkgKyB5MiAqIGV5ZXopO1xuICAgIG91dFsxNF0gPSAtKHowICogZXlleCArIHoxICogZXlleSArIHoyICogZXlleik7XG4gICAgb3V0WzE1XSA9IDE7XG5cbiAgICByZXR1cm4gb3V0O1xufTtcblxuLyoqXG4gKiBSZXR1cm5zIGEgc3RyaW5nIHJlcHJlc2VudGF0aW9uIG9mIGEgbWF0NFxuICpcbiAqIEBwYXJhbSB7bWF0NH0gbWF0IG1hdHJpeCB0byByZXByZXNlbnQgYXMgYSBzdHJpbmdcbiAqIEByZXR1cm5zIHtTdHJpbmd9IHN0cmluZyByZXByZXNlbnRhdGlvbiBvZiB0aGUgbWF0cml4XG4gKi9cbm1hdDQuc3RyID0gZnVuY3Rpb24gKGEpIHtcbiAgICByZXR1cm4gJ21hdDQoJyArIGFbMF0gKyAnLCAnICsgYVsxXSArICcsICcgKyBhWzJdICsgJywgJyArIGFbM10gKyAnLCAnICtcbiAgICAgICAgICAgICAgICAgICAgYVs0XSArICcsICcgKyBhWzVdICsgJywgJyArIGFbNl0gKyAnLCAnICsgYVs3XSArICcsICcgK1xuICAgICAgICAgICAgICAgICAgICBhWzhdICsgJywgJyArIGFbOV0gKyAnLCAnICsgYVsxMF0gKyAnLCAnICsgYVsxMV0gKyAnLCAnICsgXG4gICAgICAgICAgICAgICAgICAgIGFbMTJdICsgJywgJyArIGFbMTNdICsgJywgJyArIGFbMTRdICsgJywgJyArIGFbMTVdICsgJyknO1xufTtcblxuaWYodHlwZW9mKGV4cG9ydHMpICE9PSAndW5kZWZpbmVkJykge1xuICAgIGV4cG9ydHMubWF0NCA9IG1hdDQ7XG59XG47XG4vKiBDb3B5cmlnaHQgKGMpIDIwMTMsIEJyYW5kb24gSm9uZXMsIENvbGluIE1hY0tlbnppZSBJVi4gQWxsIHJpZ2h0cyByZXNlcnZlZC5cblxuUmVkaXN0cmlidXRpb24gYW5kIHVzZSBpbiBzb3VyY2UgYW5kIGJpbmFyeSBmb3Jtcywgd2l0aCBvciB3aXRob3V0IG1vZGlmaWNhdGlvbixcbmFyZSBwZXJtaXR0ZWQgcHJvdmlkZWQgdGhhdCB0aGUgZm9sbG93aW5nIGNvbmRpdGlvbnMgYXJlIG1ldDpcblxuICAqIFJlZGlzdHJpYnV0aW9ucyBvZiBzb3VyY2UgY29kZSBtdXN0IHJldGFpbiB0aGUgYWJvdmUgY29weXJpZ2h0IG5vdGljZSwgdGhpc1xuICAgIGxpc3Qgb2YgY29uZGl0aW9ucyBhbmQgdGhlIGZvbGxvd2luZyBkaXNjbGFpbWVyLlxuICAqIFJlZGlzdHJpYnV0aW9ucyBpbiBiaW5hcnkgZm9ybSBtdXN0IHJlcHJvZHVjZSB0aGUgYWJvdmUgY29weXJpZ2h0IG5vdGljZSxcbiAgICB0aGlzIGxpc3Qgb2YgY29uZGl0aW9ucyBhbmQgdGhlIGZvbGxvd2luZyBkaXNjbGFpbWVyIGluIHRoZSBkb2N1bWVudGF0aW9uIFxuICAgIGFuZC9vciBvdGhlciBtYXRlcmlhbHMgcHJvdmlkZWQgd2l0aCB0aGUgZGlzdHJpYnV0aW9uLlxuXG5USElTIFNPRlRXQVJFIElTIFBST1ZJREVEIEJZIFRIRSBDT1BZUklHSFQgSE9MREVSUyBBTkQgQ09OVFJJQlVUT1JTIFwiQVMgSVNcIiBBTkRcbkFOWSBFWFBSRVNTIE9SIElNUExJRUQgV0FSUkFOVElFUywgSU5DTFVESU5HLCBCVVQgTk9UIExJTUlURUQgVE8sIFRIRSBJTVBMSUVEXG5XQVJSQU5USUVTIE9GIE1FUkNIQU5UQUJJTElUWSBBTkQgRklUTkVTUyBGT1IgQSBQQVJUSUNVTEFSIFBVUlBPU0UgQVJFIFxuRElTQ0xBSU1FRC4gSU4gTk8gRVZFTlQgU0hBTEwgVEhFIENPUFlSSUdIVCBIT0xERVIgT1IgQ09OVFJJQlVUT1JTIEJFIExJQUJMRSBGT1JcbkFOWSBESVJFQ1QsIElORElSRUNULCBJTkNJREVOVEFMLCBTUEVDSUFMLCBFWEVNUExBUlksIE9SIENPTlNFUVVFTlRJQUwgREFNQUdFU1xuKElOQ0xVRElORywgQlVUIE5PVCBMSU1JVEVEIFRPLCBQUk9DVVJFTUVOVCBPRiBTVUJTVElUVVRFIEdPT0RTIE9SIFNFUlZJQ0VTO1xuTE9TUyBPRiBVU0UsIERBVEEsIE9SIFBST0ZJVFM7IE9SIEJVU0lORVNTIElOVEVSUlVQVElPTikgSE9XRVZFUiBDQVVTRUQgQU5EIE9OXG5BTlkgVEhFT1JZIE9GIExJQUJJTElUWSwgV0hFVEhFUiBJTiBDT05UUkFDVCwgU1RSSUNUIExJQUJJTElUWSwgT1IgVE9SVFxuKElOQ0xVRElORyBORUdMSUdFTkNFIE9SIE9USEVSV0lTRSkgQVJJU0lORyBJTiBBTlkgV0FZIE9VVCBPRiBUSEUgVVNFIE9GIFRISVNcblNPRlRXQVJFLCBFVkVOIElGIEFEVklTRUQgT0YgVEhFIFBPU1NJQklMSVRZIE9GIFNVQ0ggREFNQUdFLiAqL1xuXG4vKipcbiAqIEBjbGFzcyBRdWF0ZXJuaW9uXG4gKiBAbmFtZSBxdWF0XG4gKi9cblxudmFyIHF1YXQgPSB7fTtcblxudmFyIHF1YXRJZGVudGl0eSA9IG5ldyBGbG9hdDMyQXJyYXkoWzAsIDAsIDAsIDFdKTtcblxuLyoqXG4gKiBDcmVhdGVzIGEgbmV3IGlkZW50aXR5IHF1YXRcbiAqXG4gKiBAcmV0dXJucyB7cXVhdH0gYSBuZXcgcXVhdGVybmlvblxuICovXG5xdWF0LmNyZWF0ZSA9IGZ1bmN0aW9uKCkge1xuICAgIHZhciBvdXQgPSBuZXcgR0xNQVRfQVJSQVlfVFlQRSg0KTtcbiAgICBvdXRbMF0gPSAwO1xuICAgIG91dFsxXSA9IDA7XG4gICAgb3V0WzJdID0gMDtcbiAgICBvdXRbM10gPSAxO1xuICAgIHJldHVybiBvdXQ7XG59O1xuXG4vKipcbiAqIENyZWF0ZXMgYSBuZXcgcXVhdCBpbml0aWFsaXplZCB3aXRoIHZhbHVlcyBmcm9tIGFuIGV4aXN0aW5nIHF1YXRlcm5pb25cbiAqXG4gKiBAcGFyYW0ge3F1YXR9IGEgcXVhdGVybmlvbiB0byBjbG9uZVxuICogQHJldHVybnMge3F1YXR9IGEgbmV3IHF1YXRlcm5pb25cbiAqIEBmdW5jdGlvblxuICovXG5xdWF0LmNsb25lID0gdmVjNC5jbG9uZTtcblxuLyoqXG4gKiBDcmVhdGVzIGEgbmV3IHF1YXQgaW5pdGlhbGl6ZWQgd2l0aCB0aGUgZ2l2ZW4gdmFsdWVzXG4gKlxuICogQHBhcmFtIHtOdW1iZXJ9IHggWCBjb21wb25lbnRcbiAqIEBwYXJhbSB7TnVtYmVyfSB5IFkgY29tcG9uZW50XG4gKiBAcGFyYW0ge051bWJlcn0geiBaIGNvbXBvbmVudFxuICogQHBhcmFtIHtOdW1iZXJ9IHcgVyBjb21wb25lbnRcbiAqIEByZXR1cm5zIHtxdWF0fSBhIG5ldyBxdWF0ZXJuaW9uXG4gKiBAZnVuY3Rpb25cbiAqL1xucXVhdC5mcm9tVmFsdWVzID0gdmVjNC5mcm9tVmFsdWVzO1xuXG4vKipcbiAqIENvcHkgdGhlIHZhbHVlcyBmcm9tIG9uZSBxdWF0IHRvIGFub3RoZXJcbiAqXG4gKiBAcGFyYW0ge3F1YXR9IG91dCB0aGUgcmVjZWl2aW5nIHF1YXRlcm5pb25cbiAqIEBwYXJhbSB7cXVhdH0gYSB0aGUgc291cmNlIHF1YXRlcm5pb25cbiAqIEByZXR1cm5zIHtxdWF0fSBvdXRcbiAqIEBmdW5jdGlvblxuICovXG5xdWF0LmNvcHkgPSB2ZWM0LmNvcHk7XG5cbi8qKlxuICogU2V0IHRoZSBjb21wb25lbnRzIG9mIGEgcXVhdCB0byB0aGUgZ2l2ZW4gdmFsdWVzXG4gKlxuICogQHBhcmFtIHtxdWF0fSBvdXQgdGhlIHJlY2VpdmluZyBxdWF0ZXJuaW9uXG4gKiBAcGFyYW0ge051bWJlcn0geCBYIGNvbXBvbmVudFxuICogQHBhcmFtIHtOdW1iZXJ9IHkgWSBjb21wb25lbnRcbiAqIEBwYXJhbSB7TnVtYmVyfSB6IFogY29tcG9uZW50XG4gKiBAcGFyYW0ge051bWJlcn0gdyBXIGNvbXBvbmVudFxuICogQHJldHVybnMge3F1YXR9IG91dFxuICogQGZ1bmN0aW9uXG4gKi9cbnF1YXQuc2V0ID0gdmVjNC5zZXQ7XG5cbi8qKlxuICogU2V0IGEgcXVhdCB0byB0aGUgaWRlbnRpdHkgcXVhdGVybmlvblxuICpcbiAqIEBwYXJhbSB7cXVhdH0gb3V0IHRoZSByZWNlaXZpbmcgcXVhdGVybmlvblxuICogQHJldHVybnMge3F1YXR9IG91dFxuICovXG5xdWF0LmlkZW50aXR5ID0gZnVuY3Rpb24ob3V0KSB7XG4gICAgb3V0WzBdID0gMDtcbiAgICBvdXRbMV0gPSAwO1xuICAgIG91dFsyXSA9IDA7XG4gICAgb3V0WzNdID0gMTtcbiAgICByZXR1cm4gb3V0O1xufTtcblxuLyoqXG4gKiBTZXRzIGEgcXVhdCBmcm9tIHRoZSBnaXZlbiBhbmdsZSBhbmQgcm90YXRpb24gYXhpcyxcbiAqIHRoZW4gcmV0dXJucyBpdC5cbiAqXG4gKiBAcGFyYW0ge3F1YXR9IG91dCB0aGUgcmVjZWl2aW5nIHF1YXRlcm5pb25cbiAqIEBwYXJhbSB7dmVjM30gYXhpcyB0aGUgYXhpcyBhcm91bmQgd2hpY2ggdG8gcm90YXRlXG4gKiBAcGFyYW0ge051bWJlcn0gcmFkIHRoZSBhbmdsZSBpbiByYWRpYW5zXG4gKiBAcmV0dXJucyB7cXVhdH0gb3V0XG4gKiovXG5xdWF0LnNldEF4aXNBbmdsZSA9IGZ1bmN0aW9uKG91dCwgYXhpcywgcmFkKSB7XG4gICAgcmFkID0gcmFkICogMC41O1xuICAgIHZhciBzID0gTWF0aC5zaW4ocmFkKTtcbiAgICBvdXRbMF0gPSBzICogYXhpc1swXTtcbiAgICBvdXRbMV0gPSBzICogYXhpc1sxXTtcbiAgICBvdXRbMl0gPSBzICogYXhpc1syXTtcbiAgICBvdXRbM10gPSBNYXRoLmNvcyhyYWQpO1xuICAgIHJldHVybiBvdXQ7XG59O1xuXG4vKipcbiAqIEFkZHMgdHdvIHF1YXQnc1xuICpcbiAqIEBwYXJhbSB7cXVhdH0gb3V0IHRoZSByZWNlaXZpbmcgcXVhdGVybmlvblxuICogQHBhcmFtIHtxdWF0fSBhIHRoZSBmaXJzdCBvcGVyYW5kXG4gKiBAcGFyYW0ge3F1YXR9IGIgdGhlIHNlY29uZCBvcGVyYW5kXG4gKiBAcmV0dXJucyB7cXVhdH0gb3V0XG4gKiBAZnVuY3Rpb25cbiAqL1xucXVhdC5hZGQgPSB2ZWM0LmFkZDtcblxuLyoqXG4gKiBNdWx0aXBsaWVzIHR3byBxdWF0J3NcbiAqXG4gKiBAcGFyYW0ge3F1YXR9IG91dCB0aGUgcmVjZWl2aW5nIHF1YXRlcm5pb25cbiAqIEBwYXJhbSB7cXVhdH0gYSB0aGUgZmlyc3Qgb3BlcmFuZFxuICogQHBhcmFtIHtxdWF0fSBiIHRoZSBzZWNvbmQgb3BlcmFuZFxuICogQHJldHVybnMge3F1YXR9IG91dFxuICovXG5xdWF0Lm11bHRpcGx5ID0gZnVuY3Rpb24ob3V0LCBhLCBiKSB7XG4gICAgdmFyIGF4ID0gYVswXSwgYXkgPSBhWzFdLCBheiA9IGFbMl0sIGF3ID0gYVszXSxcbiAgICAgICAgYnggPSBiWzBdLCBieSA9IGJbMV0sIGJ6ID0gYlsyXSwgYncgPSBiWzNdO1xuXG4gICAgb3V0WzBdID0gYXggKiBidyArIGF3ICogYnggKyBheSAqIGJ6IC0gYXogKiBieTtcbiAgICBvdXRbMV0gPSBheSAqIGJ3ICsgYXcgKiBieSArIGF6ICogYnggLSBheCAqIGJ6O1xuICAgIG91dFsyXSA9IGF6ICogYncgKyBhdyAqIGJ6ICsgYXggKiBieSAtIGF5ICogYng7XG4gICAgb3V0WzNdID0gYXcgKiBidyAtIGF4ICogYnggLSBheSAqIGJ5IC0gYXogKiBiejtcbiAgICByZXR1cm4gb3V0O1xufTtcblxuLyoqXG4gKiBBbGlhcyBmb3Ige0BsaW5rIHF1YXQubXVsdGlwbHl9XG4gKiBAZnVuY3Rpb25cbiAqL1xucXVhdC5tdWwgPSBxdWF0Lm11bHRpcGx5O1xuXG4vKipcbiAqIFNjYWxlcyBhIHF1YXQgYnkgYSBzY2FsYXIgbnVtYmVyXG4gKlxuICogQHBhcmFtIHtxdWF0fSBvdXQgdGhlIHJlY2VpdmluZyB2ZWN0b3JcbiAqIEBwYXJhbSB7cXVhdH0gYSB0aGUgdmVjdG9yIHRvIHNjYWxlXG4gKiBAcGFyYW0ge051bWJlcn0gYiBhbW91bnQgdG8gc2NhbGUgdGhlIHZlY3RvciBieVxuICogQHJldHVybnMge3F1YXR9IG91dFxuICogQGZ1bmN0aW9uXG4gKi9cbnF1YXQuc2NhbGUgPSB2ZWM0LnNjYWxlO1xuXG4vKipcbiAqIFJvdGF0ZXMgYSBxdWF0ZXJuaW9uIGJ5IHRoZSBnaXZlbiBhbmdsZSBhcm91bmQgdGhlIFggYXhpc1xuICpcbiAqIEBwYXJhbSB7cXVhdH0gb3V0IHF1YXQgcmVjZWl2aW5nIG9wZXJhdGlvbiByZXN1bHRcbiAqIEBwYXJhbSB7cXVhdH0gYSBxdWF0IHRvIHJvdGF0ZVxuICogQHBhcmFtIHtudW1iZXJ9IHJhZCBhbmdsZSAoaW4gcmFkaWFucykgdG8gcm90YXRlXG4gKiBAcmV0dXJucyB7cXVhdH0gb3V0XG4gKi9cbnF1YXQucm90YXRlWCA9IGZ1bmN0aW9uIChvdXQsIGEsIHJhZCkge1xuICAgIHJhZCAqPSAwLjU7IFxuXG4gICAgdmFyIGF4ID0gYVswXSwgYXkgPSBhWzFdLCBheiA9IGFbMl0sIGF3ID0gYVszXSxcbiAgICAgICAgYnggPSBNYXRoLnNpbihyYWQpLCBidyA9IE1hdGguY29zKHJhZCk7XG5cbiAgICBvdXRbMF0gPSBheCAqIGJ3ICsgYXcgKiBieDtcbiAgICBvdXRbMV0gPSBheSAqIGJ3ICsgYXogKiBieDtcbiAgICBvdXRbMl0gPSBheiAqIGJ3IC0gYXkgKiBieDtcbiAgICBvdXRbM10gPSBhdyAqIGJ3IC0gYXggKiBieDtcbiAgICByZXR1cm4gb3V0O1xufTtcblxuLyoqXG4gKiBSb3RhdGVzIGEgcXVhdGVybmlvbiBieSB0aGUgZ2l2ZW4gYW5nbGUgYXJvdW5kIHRoZSBZIGF4aXNcbiAqXG4gKiBAcGFyYW0ge3F1YXR9IG91dCBxdWF0IHJlY2VpdmluZyBvcGVyYXRpb24gcmVzdWx0XG4gKiBAcGFyYW0ge3F1YXR9IGEgcXVhdCB0byByb3RhdGVcbiAqIEBwYXJhbSB7bnVtYmVyfSByYWQgYW5nbGUgKGluIHJhZGlhbnMpIHRvIHJvdGF0ZVxuICogQHJldHVybnMge3F1YXR9IG91dFxuICovXG5xdWF0LnJvdGF0ZVkgPSBmdW5jdGlvbiAob3V0LCBhLCByYWQpIHtcbiAgICByYWQgKj0gMC41OyBcblxuICAgIHZhciBheCA9IGFbMF0sIGF5ID0gYVsxXSwgYXogPSBhWzJdLCBhdyA9IGFbM10sXG4gICAgICAgIGJ5ID0gTWF0aC5zaW4ocmFkKSwgYncgPSBNYXRoLmNvcyhyYWQpO1xuXG4gICAgb3V0WzBdID0gYXggKiBidyAtIGF6ICogYnk7XG4gICAgb3V0WzFdID0gYXkgKiBidyArIGF3ICogYnk7XG4gICAgb3V0WzJdID0gYXogKiBidyArIGF4ICogYnk7XG4gICAgb3V0WzNdID0gYXcgKiBidyAtIGF5ICogYnk7XG4gICAgcmV0dXJuIG91dDtcbn07XG5cbi8qKlxuICogUm90YXRlcyBhIHF1YXRlcm5pb24gYnkgdGhlIGdpdmVuIGFuZ2xlIGFyb3VuZCB0aGUgWiBheGlzXG4gKlxuICogQHBhcmFtIHtxdWF0fSBvdXQgcXVhdCByZWNlaXZpbmcgb3BlcmF0aW9uIHJlc3VsdFxuICogQHBhcmFtIHtxdWF0fSBhIHF1YXQgdG8gcm90YXRlXG4gKiBAcGFyYW0ge251bWJlcn0gcmFkIGFuZ2xlIChpbiByYWRpYW5zKSB0byByb3RhdGVcbiAqIEByZXR1cm5zIHtxdWF0fSBvdXRcbiAqL1xucXVhdC5yb3RhdGVaID0gZnVuY3Rpb24gKG91dCwgYSwgcmFkKSB7XG4gICAgcmFkICo9IDAuNTsgXG5cbiAgICB2YXIgYXggPSBhWzBdLCBheSA9IGFbMV0sIGF6ID0gYVsyXSwgYXcgPSBhWzNdLFxuICAgICAgICBieiA9IE1hdGguc2luKHJhZCksIGJ3ID0gTWF0aC5jb3MocmFkKTtcblxuICAgIG91dFswXSA9IGF4ICogYncgKyBheSAqIGJ6O1xuICAgIG91dFsxXSA9IGF5ICogYncgLSBheCAqIGJ6O1xuICAgIG91dFsyXSA9IGF6ICogYncgKyBhdyAqIGJ6O1xuICAgIG91dFszXSA9IGF3ICogYncgLSBheiAqIGJ6O1xuICAgIHJldHVybiBvdXQ7XG59O1xuXG4vKipcbiAqIENhbGN1bGF0ZXMgdGhlIFcgY29tcG9uZW50IG9mIGEgcXVhdCBmcm9tIHRoZSBYLCBZLCBhbmQgWiBjb21wb25lbnRzLlxuICogQXNzdW1lcyB0aGF0IHF1YXRlcm5pb24gaXMgMSB1bml0IGluIGxlbmd0aC5cbiAqIEFueSBleGlzdGluZyBXIGNvbXBvbmVudCB3aWxsIGJlIGlnbm9yZWQuXG4gKlxuICogQHBhcmFtIHtxdWF0fSBvdXQgdGhlIHJlY2VpdmluZyBxdWF0ZXJuaW9uXG4gKiBAcGFyYW0ge3F1YXR9IGEgcXVhdCB0byBjYWxjdWxhdGUgVyBjb21wb25lbnQgb2ZcbiAqIEByZXR1cm5zIHtxdWF0fSBvdXRcbiAqL1xucXVhdC5jYWxjdWxhdGVXID0gZnVuY3Rpb24gKG91dCwgYSkge1xuICAgIHZhciB4ID0gYVswXSwgeSA9IGFbMV0sIHogPSBhWzJdO1xuXG4gICAgb3V0WzBdID0geDtcbiAgICBvdXRbMV0gPSB5O1xuICAgIG91dFsyXSA9IHo7XG4gICAgb3V0WzNdID0gLU1hdGguc3FydChNYXRoLmFicygxLjAgLSB4ICogeCAtIHkgKiB5IC0geiAqIHopKTtcbiAgICByZXR1cm4gb3V0O1xufTtcblxuLyoqXG4gKiBDYWxjdWxhdGVzIHRoZSBkb3QgcHJvZHVjdCBvZiB0d28gcXVhdCdzXG4gKlxuICogQHBhcmFtIHtxdWF0fSBhIHRoZSBmaXJzdCBvcGVyYW5kXG4gKiBAcGFyYW0ge3F1YXR9IGIgdGhlIHNlY29uZCBvcGVyYW5kXG4gKiBAcmV0dXJucyB7TnVtYmVyfSBkb3QgcHJvZHVjdCBvZiBhIGFuZCBiXG4gKiBAZnVuY3Rpb25cbiAqL1xucXVhdC5kb3QgPSB2ZWM0LmRvdDtcblxuLyoqXG4gKiBQZXJmb3JtcyBhIGxpbmVhciBpbnRlcnBvbGF0aW9uIGJldHdlZW4gdHdvIHF1YXQnc1xuICpcbiAqIEBwYXJhbSB7cXVhdH0gb3V0IHRoZSByZWNlaXZpbmcgcXVhdGVybmlvblxuICogQHBhcmFtIHtxdWF0fSBhIHRoZSBmaXJzdCBvcGVyYW5kXG4gKiBAcGFyYW0ge3F1YXR9IGIgdGhlIHNlY29uZCBvcGVyYW5kXG4gKiBAcGFyYW0ge051bWJlcn0gdCBpbnRlcnBvbGF0aW9uIGFtb3VudCBiZXR3ZWVuIHRoZSB0d28gaW5wdXRzXG4gKiBAcmV0dXJucyB7cXVhdH0gb3V0XG4gKiBAZnVuY3Rpb25cbiAqL1xucXVhdC5sZXJwID0gdmVjNC5sZXJwO1xuXG4vKipcbiAqIFBlcmZvcm1zIGEgc3BoZXJpY2FsIGxpbmVhciBpbnRlcnBvbGF0aW9uIGJldHdlZW4gdHdvIHF1YXRcbiAqXG4gKiBAcGFyYW0ge3F1YXR9IG91dCB0aGUgcmVjZWl2aW5nIHF1YXRlcm5pb25cbiAqIEBwYXJhbSB7cXVhdH0gYSB0aGUgZmlyc3Qgb3BlcmFuZFxuICogQHBhcmFtIHtxdWF0fSBiIHRoZSBzZWNvbmQgb3BlcmFuZFxuICogQHBhcmFtIHtOdW1iZXJ9IHQgaW50ZXJwb2xhdGlvbiBhbW91bnQgYmV0d2VlbiB0aGUgdHdvIGlucHV0c1xuICogQHJldHVybnMge3F1YXR9IG91dFxuICovXG5xdWF0LnNsZXJwID0gZnVuY3Rpb24gKG91dCwgYSwgYiwgdCkge1xuICAgIHZhciBheCA9IGFbMF0sIGF5ID0gYVsxXSwgYXogPSBhWzJdLCBhdyA9IGFbM10sXG4gICAgICAgIGJ4ID0gYlswXSwgYnkgPSBiWzFdLCBieiA9IGJbMl0sIGJ3ID0gYlszXTtcblxuICAgIHZhciBjb3NIYWxmVGhldGEgPSBheCAqIGJ4ICsgYXkgKiBieSArIGF6ICogYnogKyBhdyAqIGJ3LFxuICAgICAgICBoYWxmVGhldGEsXG4gICAgICAgIHNpbkhhbGZUaGV0YSxcbiAgICAgICAgcmF0aW9BLFxuICAgICAgICByYXRpb0I7XG5cbiAgICBpZiAoTWF0aC5hYnMoY29zSGFsZlRoZXRhKSA+PSAxLjApIHtcbiAgICAgICAgaWYgKG91dCAhPT0gYSkge1xuICAgICAgICAgICAgb3V0WzBdID0gYXg7XG4gICAgICAgICAgICBvdXRbMV0gPSBheTtcbiAgICAgICAgICAgIG91dFsyXSA9IGF6O1xuICAgICAgICAgICAgb3V0WzNdID0gYXc7XG4gICAgICAgIH1cbiAgICAgICAgcmV0dXJuIG91dDtcbiAgICB9XG5cbiAgICBoYWxmVGhldGEgPSBNYXRoLmFjb3MoY29zSGFsZlRoZXRhKTtcbiAgICBzaW5IYWxmVGhldGEgPSBNYXRoLnNxcnQoMS4wIC0gY29zSGFsZlRoZXRhICogY29zSGFsZlRoZXRhKTtcblxuICAgIGlmIChNYXRoLmFicyhzaW5IYWxmVGhldGEpIDwgMC4wMDEpIHtcbiAgICAgICAgb3V0WzBdID0gKGF4ICogMC41ICsgYnggKiAwLjUpO1xuICAgICAgICBvdXRbMV0gPSAoYXkgKiAwLjUgKyBieSAqIDAuNSk7XG4gICAgICAgIG91dFsyXSA9IChheiAqIDAuNSArIGJ6ICogMC41KTtcbiAgICAgICAgb3V0WzNdID0gKGF3ICogMC41ICsgYncgKiAwLjUpO1xuICAgICAgICByZXR1cm4gb3V0O1xuICAgIH1cblxuICAgIHJhdGlvQSA9IE1hdGguc2luKCgxIC0gdCkgKiBoYWxmVGhldGEpIC8gc2luSGFsZlRoZXRhO1xuICAgIHJhdGlvQiA9IE1hdGguc2luKHQgKiBoYWxmVGhldGEpIC8gc2luSGFsZlRoZXRhO1xuXG4gICAgb3V0WzBdID0gKGF4ICogcmF0aW9BICsgYnggKiByYXRpb0IpO1xuICAgIG91dFsxXSA9IChheSAqIHJhdGlvQSArIGJ5ICogcmF0aW9CKTtcbiAgICBvdXRbMl0gPSAoYXogKiByYXRpb0EgKyBieiAqIHJhdGlvQik7XG4gICAgb3V0WzNdID0gKGF3ICogcmF0aW9BICsgYncgKiByYXRpb0IpO1xuXG4gICAgcmV0dXJuIG91dDtcbn07XG5cbi8qKlxuICogQ2FsY3VsYXRlcyB0aGUgaW52ZXJzZSBvZiBhIHF1YXRcbiAqXG4gKiBAcGFyYW0ge3F1YXR9IG91dCB0aGUgcmVjZWl2aW5nIHF1YXRlcm5pb25cbiAqIEBwYXJhbSB7cXVhdH0gYSBxdWF0IHRvIGNhbGN1bGF0ZSBpbnZlcnNlIG9mXG4gKiBAcmV0dXJucyB7cXVhdH0gb3V0XG4gKi9cbnF1YXQuaW52ZXJ0ID0gZnVuY3Rpb24ob3V0LCBhKSB7XG4gICAgdmFyIGEwID0gYVswXSwgYTEgPSBhWzFdLCBhMiA9IGFbMl0sIGEzID0gYVszXSxcbiAgICAgICAgZG90ID0gYTAqYTAgKyBhMSphMSArIGEyKmEyICsgYTMqYTMsXG4gICAgICAgIGludkRvdCA9IGRvdCA/IDEuMC9kb3QgOiAwO1xuICAgIFxuICAgIC8vIFRPRE86IFdvdWxkIGJlIGZhc3RlciB0byByZXR1cm4gWzAsMCwwLDBdIGltbWVkaWF0ZWx5IGlmIGRvdCA9PSAwXG5cbiAgICBvdXRbMF0gPSAtYTAqaW52RG90O1xuICAgIG91dFsxXSA9IC1hMSppbnZEb3Q7XG4gICAgb3V0WzJdID0gLWEyKmludkRvdDtcbiAgICBvdXRbM10gPSBhMyppbnZEb3Q7XG4gICAgcmV0dXJuIG91dDtcbn07XG5cbi8qKlxuICogQ2FsY3VsYXRlcyB0aGUgY29uanVnYXRlIG9mIGEgcXVhdFxuICogSWYgdGhlIHF1YXRlcm5pb24gaXMgbm9ybWFsaXplZCwgdGhpcyBmdW5jdGlvbiBpcyBmYXN0ZXIgdGhhbiBxdWF0LmludmVyc2UgYW5kIHByb2R1Y2VzIHRoZSBzYW1lIHJlc3VsdC5cbiAqXG4gKiBAcGFyYW0ge3F1YXR9IG91dCB0aGUgcmVjZWl2aW5nIHF1YXRlcm5pb25cbiAqIEBwYXJhbSB7cXVhdH0gYSBxdWF0IHRvIGNhbGN1bGF0ZSBjb25qdWdhdGUgb2ZcbiAqIEByZXR1cm5zIHtxdWF0fSBvdXRcbiAqL1xucXVhdC5jb25qdWdhdGUgPSBmdW5jdGlvbiAob3V0LCBhKSB7XG4gICAgb3V0WzBdID0gLWFbMF07XG4gICAgb3V0WzFdID0gLWFbMV07XG4gICAgb3V0WzJdID0gLWFbMl07XG4gICAgb3V0WzNdID0gYVszXTtcbiAgICByZXR1cm4gb3V0O1xufTtcblxuLyoqXG4gKiBDYWxjdWxhdGVzIHRoZSBsZW5ndGggb2YgYSBxdWF0XG4gKlxuICogQHBhcmFtIHtxdWF0fSBhIHZlY3RvciB0byBjYWxjdWxhdGUgbGVuZ3RoIG9mXG4gKiBAcmV0dXJucyB7TnVtYmVyfSBsZW5ndGggb2YgYVxuICogQGZ1bmN0aW9uXG4gKi9cbnF1YXQubGVuZ3RoID0gdmVjNC5sZW5ndGg7XG5cbi8qKlxuICogQWxpYXMgZm9yIHtAbGluayBxdWF0Lmxlbmd0aH1cbiAqIEBmdW5jdGlvblxuICovXG5xdWF0LmxlbiA9IHF1YXQubGVuZ3RoO1xuXG4vKipcbiAqIENhbGN1bGF0ZXMgdGhlIHNxdWFyZWQgbGVuZ3RoIG9mIGEgcXVhdFxuICpcbiAqIEBwYXJhbSB7cXVhdH0gYSB2ZWN0b3IgdG8gY2FsY3VsYXRlIHNxdWFyZWQgbGVuZ3RoIG9mXG4gKiBAcmV0dXJucyB7TnVtYmVyfSBzcXVhcmVkIGxlbmd0aCBvZiBhXG4gKiBAZnVuY3Rpb25cbiAqL1xucXVhdC5zcXVhcmVkTGVuZ3RoID0gdmVjNC5zcXVhcmVkTGVuZ3RoO1xuXG4vKipcbiAqIEFsaWFzIGZvciB7QGxpbmsgcXVhdC5zcXVhcmVkTGVuZ3RofVxuICogQGZ1bmN0aW9uXG4gKi9cbnF1YXQuc3FyTGVuID0gcXVhdC5zcXVhcmVkTGVuZ3RoO1xuXG4vKipcbiAqIE5vcm1hbGl6ZSBhIHF1YXRcbiAqXG4gKiBAcGFyYW0ge3F1YXR9IG91dCB0aGUgcmVjZWl2aW5nIHF1YXRlcm5pb25cbiAqIEBwYXJhbSB7cXVhdH0gYSBxdWF0ZXJuaW9uIHRvIG5vcm1hbGl6ZVxuICogQHJldHVybnMge3F1YXR9IG91dFxuICogQGZ1bmN0aW9uXG4gKi9cbnF1YXQubm9ybWFsaXplID0gdmVjNC5ub3JtYWxpemU7XG5cbi8qKlxuICogQ3JlYXRlcyBhIHF1YXRlcm5pb24gZnJvbSB0aGUgZ2l2ZW4gM3gzIHJvdGF0aW9uIG1hdHJpeC5cbiAqXG4gKiBAcGFyYW0ge3F1YXR9IG91dCB0aGUgcmVjZWl2aW5nIHF1YXRlcm5pb25cbiAqIEBwYXJhbSB7bWF0M30gbSByb3RhdGlvbiBtYXRyaXhcbiAqIEByZXR1cm5zIHtxdWF0fSBvdXRcbiAqIEBmdW5jdGlvblxuICovXG5xdWF0LmZyb21NYXQzID0gKGZ1bmN0aW9uKCkge1xuICAgIHZhciBzX2lOZXh0ID0gWzEsMiwwXTtcbiAgICByZXR1cm4gZnVuY3Rpb24ob3V0LCBtKSB7XG4gICAgICAgIC8vIEFsZ29yaXRobSBpbiBLZW4gU2hvZW1ha2UncyBhcnRpY2xlIGluIDE5ODcgU0lHR1JBUEggY291cnNlIG5vdGVzXG4gICAgICAgIC8vIGFydGljbGUgXCJRdWF0ZXJuaW9uIENhbGN1bHVzIGFuZCBGYXN0IEFuaW1hdGlvblwiLlxuICAgICAgICB2YXIgZlRyYWNlID0gbVswXSArIG1bNF0gKyBtWzhdO1xuICAgICAgICB2YXIgZlJvb3Q7XG5cbiAgICAgICAgaWYgKCBmVHJhY2UgPiAwLjAgKSB7XG4gICAgICAgICAgICAvLyB8d3wgPiAxLzIsIG1heSBhcyB3ZWxsIGNob29zZSB3ID4gMS8yXG4gICAgICAgICAgICBmUm9vdCA9IE1hdGguc3FydChmVHJhY2UgKyAxLjApOyAgLy8gMndcbiAgICAgICAgICAgIG91dFszXSA9IDAuNSAqIGZSb290O1xuICAgICAgICAgICAgZlJvb3QgPSAwLjUvZlJvb3Q7ICAvLyAxLyg0dylcbiAgICAgICAgICAgIG91dFswXSA9IChtWzddLW1bNV0pKmZSb290O1xuICAgICAgICAgICAgb3V0WzFdID0gKG1bMl0tbVs2XSkqZlJvb3Q7XG4gICAgICAgICAgICBvdXRbMl0gPSAobVszXS1tWzFdKSpmUm9vdDtcbiAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgIC8vIHx3fCA8PSAxLzJcbiAgICAgICAgICAgIHZhciBpID0gMDtcbiAgICAgICAgICAgIGlmICggbVs0XSA+IG1bMF0gKVxuICAgICAgICAgICAgICBpID0gMTtcbiAgICAgICAgICAgIGlmICggbVs4XSA+IG1baSozK2ldIClcbiAgICAgICAgICAgICAgaSA9IDI7XG4gICAgICAgICAgICB2YXIgaiA9IHNfaU5leHRbaV07XG4gICAgICAgICAgICB2YXIgayA9IHNfaU5leHRbal07XG4gICAgICAgICAgICBcbiAgICAgICAgICAgIGZSb290ID0gTWF0aC5zcXJ0KG1baSozK2ldLW1baiozK2pdLW1bayozK2tdICsgMS4wKTtcbiAgICAgICAgICAgIG91dFtpXSA9IDAuNSAqIGZSb290O1xuICAgICAgICAgICAgZlJvb3QgPSAwLjUgLyBmUm9vdDtcbiAgICAgICAgICAgIG91dFszXSA9IChtW2sqMytqXSAtIG1baiozK2tdKSAqIGZSb290O1xuICAgICAgICAgICAgb3V0W2pdID0gKG1baiozK2ldICsgbVtpKjMral0pICogZlJvb3Q7XG4gICAgICAgICAgICBvdXRba10gPSAobVtrKjMraV0gKyBtW2kqMytrXSkgKiBmUm9vdDtcbiAgICAgICAgfVxuICAgICAgICBcbiAgICAgICAgcmV0dXJuIG91dDtcbiAgICB9O1xufSkoKTtcblxuLyoqXG4gKiBSZXR1cm5zIGEgc3RyaW5nIHJlcHJlc2VudGF0aW9uIG9mIGEgcXVhdGVuaW9uXG4gKlxuICogQHBhcmFtIHtxdWF0fSB2ZWMgdmVjdG9yIHRvIHJlcHJlc2VudCBhcyBhIHN0cmluZ1xuICogQHJldHVybnMge1N0cmluZ30gc3RyaW5nIHJlcHJlc2VudGF0aW9uIG9mIHRoZSB2ZWN0b3JcbiAqL1xucXVhdC5zdHIgPSBmdW5jdGlvbiAoYSkge1xuICAgIHJldHVybiAncXVhdCgnICsgYVswXSArICcsICcgKyBhWzFdICsgJywgJyArIGFbMl0gKyAnLCAnICsgYVszXSArICcpJztcbn07XG5cbmlmKHR5cGVvZihleHBvcnRzKSAhPT0gJ3VuZGVmaW5lZCcpIHtcbiAgICBleHBvcnRzLnF1YXQgPSBxdWF0O1xufVxuO1xuXG5cblxuXG5cblxuXG5cblxuXG5cblxuXG4gIH0pKHNoaW0uZXhwb3J0cyk7XG59KSgpO1xuIiwiKGZ1bmN0aW9uKCkge1xuICB2YXIgc2xpY2UgPSBbXS5zbGljZTtcblxuICBmdW5jdGlvbiBxdWV1ZShwYXJhbGxlbGlzbSkge1xuICAgIHZhciBxLFxuICAgICAgICB0YXNrcyA9IFtdLFxuICAgICAgICBzdGFydGVkID0gMCwgLy8gbnVtYmVyIG9mIHRhc2tzIHRoYXQgaGF2ZSBiZWVuIHN0YXJ0ZWQgKGFuZCBwZXJoYXBzIGZpbmlzaGVkKVxuICAgICAgICBhY3RpdmUgPSAwLCAvLyBudW1iZXIgb2YgdGFza3MgY3VycmVudGx5IGJlaW5nIGV4ZWN1dGVkIChzdGFydGVkIGJ1dCBub3QgZmluaXNoZWQpXG4gICAgICAgIHJlbWFpbmluZyA9IDAsIC8vIG51bWJlciBvZiB0YXNrcyBub3QgeWV0IGZpbmlzaGVkXG4gICAgICAgIHBvcHBpbmcsIC8vIGluc2lkZSBhIHN5bmNocm9ub3VzIHRhc2sgY2FsbGJhY2s/XG4gICAgICAgIGVycm9yID0gbnVsbCxcbiAgICAgICAgYXdhaXQgPSBub29wLFxuICAgICAgICBhbGw7XG5cbiAgICBpZiAoIXBhcmFsbGVsaXNtKSBwYXJhbGxlbGlzbSA9IEluZmluaXR5O1xuXG4gICAgZnVuY3Rpb24gcG9wKCkge1xuICAgICAgd2hpbGUgKHBvcHBpbmcgPSBzdGFydGVkIDwgdGFza3MubGVuZ3RoICYmIGFjdGl2ZSA8IHBhcmFsbGVsaXNtKSB7XG4gICAgICAgIHZhciBpID0gc3RhcnRlZCsrLFxuICAgICAgICAgICAgdCA9IHRhc2tzW2ldLFxuICAgICAgICAgICAgYSA9IHNsaWNlLmNhbGwodCwgMSk7XG4gICAgICAgIGEucHVzaChjYWxsYmFjayhpKSk7XG4gICAgICAgICsrYWN0aXZlO1xuICAgICAgICB0WzBdLmFwcGx5KG51bGwsIGEpO1xuICAgICAgfVxuICAgIH1cblxuICAgIGZ1bmN0aW9uIGNhbGxiYWNrKGkpIHtcbiAgICAgIHJldHVybiBmdW5jdGlvbihlLCByKSB7XG4gICAgICAgIC0tYWN0aXZlO1xuICAgICAgICBpZiAoZXJyb3IgIT0gbnVsbCkgcmV0dXJuO1xuICAgICAgICBpZiAoZSAhPSBudWxsKSB7XG4gICAgICAgICAgZXJyb3IgPSBlOyAvLyBpZ25vcmUgbmV3IHRhc2tzIGFuZCBzcXVlbGNoIGFjdGl2ZSBjYWxsYmFja3NcbiAgICAgICAgICBzdGFydGVkID0gcmVtYWluaW5nID0gTmFOOyAvLyBzdG9wIHF1ZXVlZCB0YXNrcyBmcm9tIHN0YXJ0aW5nXG4gICAgICAgICAgbm90aWZ5KCk7XG4gICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgdGFza3NbaV0gPSByO1xuICAgICAgICAgIGlmICgtLXJlbWFpbmluZykgcG9wcGluZyB8fCBwb3AoKTtcbiAgICAgICAgICBlbHNlIG5vdGlmeSgpO1xuICAgICAgICB9XG4gICAgICB9O1xuICAgIH1cblxuICAgIGZ1bmN0aW9uIG5vdGlmeSgpIHtcbiAgICAgIGlmIChlcnJvciAhPSBudWxsKSBhd2FpdChlcnJvcik7XG4gICAgICBlbHNlIGlmIChhbGwpIGF3YWl0KGVycm9yLCB0YXNrcyk7XG4gICAgICBlbHNlIGF3YWl0LmFwcGx5KG51bGwsIFtlcnJvcl0uY29uY2F0KHRhc2tzKSk7XG4gICAgfVxuXG4gICAgcmV0dXJuIHEgPSB7XG4gICAgICBkZWZlcjogZnVuY3Rpb24oKSB7XG4gICAgICAgIGlmICghZXJyb3IpIHtcbiAgICAgICAgICB0YXNrcy5wdXNoKGFyZ3VtZW50cyk7XG4gICAgICAgICAgKytyZW1haW5pbmc7XG4gICAgICAgICAgcG9wKCk7XG4gICAgICAgIH1cbiAgICAgICAgcmV0dXJuIHE7XG4gICAgICB9LFxuICAgICAgYXdhaXQ6IGZ1bmN0aW9uKGYpIHtcbiAgICAgICAgYXdhaXQgPSBmO1xuICAgICAgICBhbGwgPSBmYWxzZTtcbiAgICAgICAgaWYgKCFyZW1haW5pbmcpIG5vdGlmeSgpO1xuICAgICAgICByZXR1cm4gcTtcbiAgICAgIH0sXG4gICAgICBhd2FpdEFsbDogZnVuY3Rpb24oZikge1xuICAgICAgICBhd2FpdCA9IGY7XG4gICAgICAgIGFsbCA9IHRydWU7XG4gICAgICAgIGlmICghcmVtYWluaW5nKSBub3RpZnkoKTtcbiAgICAgICAgcmV0dXJuIHE7XG4gICAgICB9XG4gICAgfTtcbiAgfVxuXG4gIGZ1bmN0aW9uIG5vb3AoKSB7fVxuXG4gIHF1ZXVlLnZlcnNpb24gPSBcIjEuMC43XCI7XG4gIGlmICh0eXBlb2YgZGVmaW5lID09PSBcImZ1bmN0aW9uXCIgJiYgZGVmaW5lLmFtZCkgZGVmaW5lKGZ1bmN0aW9uKCkgeyByZXR1cm4gcXVldWU7IH0pO1xuICBlbHNlIGlmICh0eXBlb2YgbW9kdWxlID09PSBcIm9iamVjdFwiICYmIG1vZHVsZS5leHBvcnRzKSBtb2R1bGUuZXhwb3J0cyA9IHF1ZXVlO1xuICBlbHNlIHRoaXMucXVldWUgPSBxdWV1ZTtcbn0pKCk7XG4iLCIvLyBNaXNjZWxsYW5lb3VzIGdlbyBmdW5jdGlvbnNcbmltcG9ydCBQb2ludCBmcm9tICcuL3BvaW50JztcblxuZXhwb3J0IHZhciBHZW8gPSB7fTtcblxuLy8gUHJvamVjdGlvbiBjb25zdGFudHNcbkdlby50aWxlX3NpemUgPSAyNTY7XG5HZW8uaGFsZl9jaXJjdW1mZXJlbmNlX21ldGVycyA9IDIwMDM3NTA4LjM0Mjc4OTI0NDtcbkdlby5tYXBfb3JpZ2luX21ldGVycyA9IFBvaW50KC1HZW8uaGFsZl9jaXJjdW1mZXJlbmNlX21ldGVycywgR2VvLmhhbGZfY2lyY3VtZmVyZW5jZV9tZXRlcnMpO1xuR2VvLm1pbl96b29tX21ldGVyc19wZXJfcGl4ZWwgPSBHZW8uaGFsZl9jaXJjdW1mZXJlbmNlX21ldGVycyAqIDIgLyBHZW8udGlsZV9zaXplOyAvLyBtaW4gem9vbSBkcmF3cyB3b3JsZCBhcyAyIHRpbGVzIHdpZGVcbkdlby5tZXRlcnNfcGVyX3BpeGVsID0gW107XG5HZW8ubWF4X3pvb20gPSAyMDtcbmZvciAodmFyIHo9MDsgeiA8PSBHZW8ubWF4X3pvb207IHorKykge1xuICAgIEdlby5tZXRlcnNfcGVyX3BpeGVsW3pdID0gR2VvLm1pbl96b29tX21ldGVyc19wZXJfcGl4ZWwgLyBNYXRoLnBvdygyLCB6KTtcbn1cblxuLy8gQ29udmVyc2lvbiBmdW5jdGlvbnMgYmFzZWQgb24gYW4gZGVmaW5lZCB0aWxlIHNjYWxlXG5HZW8udW5pdHNfcGVyX21ldGVyID0gW107XG5HZW8uc2V0VGlsZVNjYWxlID0gZnVuY3Rpb24oc2NhbGUpXG57XG4gICAgR2VvLnRpbGVfc2NhbGUgPSBzY2FsZTtcbiAgICBHZW8udW5pdHNfcGVyX3BpeGVsID0gR2VvLnRpbGVfc2NhbGUgLyBHZW8udGlsZV9zaXplO1xuXG4gICAgZm9yICh2YXIgej0wOyB6IDw9IEdlby5tYXhfem9vbTsgeisrKSB7XG4gICAgICAgIEdlby51bml0c19wZXJfbWV0ZXJbel0gPSBHZW8udGlsZV9zY2FsZSAvIChHZW8udGlsZV9zaXplICogR2VvLm1ldGVyc19wZXJfcGl4ZWxbel0pO1xuICAgIH1cbn07XG5cbi8vIENvbnZlcnQgdGlsZSBsb2NhdGlvbiB0byBtZXJjYXRvciBtZXRlcnMgLSBtdWx0aXBseSBieSBwaXhlbHMgcGVyIHRpbGUsIHRoZW4gYnkgbWV0ZXJzIHBlciBwaXhlbCwgYWRqdXN0IGZvciBtYXAgb3JpZ2luXG5HZW8ubWV0ZXJzRm9yVGlsZSA9IGZ1bmN0aW9uICh0aWxlKVxue1xuICAgIHJldHVybiBQb2ludChcbiAgICAgICAgKHRpbGUueCAqIEdlby50aWxlX3NpemUgKiBHZW8ubWV0ZXJzX3Blcl9waXhlbFt0aWxlLnpdKSArIEdlby5tYXBfb3JpZ2luX21ldGVycy54LFxuICAgICAgICAoKHRpbGUueSAqIEdlby50aWxlX3NpemUgKiBHZW8ubWV0ZXJzX3Blcl9waXhlbFt0aWxlLnpdKSAqIC0xKSArIEdlby5tYXBfb3JpZ2luX21ldGVycy55XG4gICAgKTtcbn07XG5cbi8vIENvbnZlcnQgbWVyY2F0b3IgbWV0ZXJzIHRvIGxhdC1sbmdcbkdlby5tZXRlcnNUb0xhdExuZyA9IGZ1bmN0aW9uIChtZXRlcnMpXG57XG4gICAgdmFyIGMgPSBQb2ludC5jb3B5KG1ldGVycyk7XG5cbiAgICBjLnggLz0gR2VvLmhhbGZfY2lyY3VtZmVyZW5jZV9tZXRlcnM7XG4gICAgYy55IC89IEdlby5oYWxmX2NpcmN1bWZlcmVuY2VfbWV0ZXJzO1xuXG4gICAgYy55ID0gKDIgKiBNYXRoLmF0YW4oTWF0aC5leHAoYy55ICogTWF0aC5QSSkpIC0gKE1hdGguUEkgLyAyKSkgLyBNYXRoLlBJO1xuXG4gICAgYy54ICo9IDE4MDtcbiAgICBjLnkgKj0gMTgwO1xuXG4gICAgcmV0dXJuIGM7XG59O1xuXG4vLyBDb252ZXJ0IGxhdC1sbmcgdG8gbWVyY2F0b3IgbWV0ZXJzXG5HZW8ubGF0TG5nVG9NZXRlcnMgPSBmdW5jdGlvbihsYXRsbmcpXG57XG4gICAgdmFyIGMgPSBQb2ludC5jb3B5KGxhdGxuZyk7XG5cbiAgICAvLyBMYXRpdHVkZVxuICAgIGMueSA9IE1hdGgubG9nKE1hdGgudGFuKChjLnkgKyA5MCkgKiBNYXRoLlBJIC8gMzYwKSkgLyAoTWF0aC5QSSAvIDE4MCk7XG4gICAgYy55ID0gYy55ICogR2VvLmhhbGZfY2lyY3VtZmVyZW5jZV9tZXRlcnMgLyAxODA7XG5cbiAgICAvLyBMb25naXR1ZGVcbiAgICBjLnggPSBjLnggKiBHZW8uaGFsZl9jaXJjdW1mZXJlbmNlX21ldGVycyAvIDE4MDtcblxuICAgIHJldHVybiBjO1xufTtcblxuLy8gUnVuIGEgdHJhbnNmb3JtIGZ1bmN0aW9uIG9uIGVhY2ggY29vb3JkaW5hdGUgaW4gYSBHZW9KU09OIGdlb21ldHJ5XG5HZW8udHJhbnNmb3JtR2VvbWV0cnkgPSBmdW5jdGlvbiAoZ2VvbWV0cnksIHRyYW5zZm9ybSlcbntcbiAgICBpZiAoZ2VvbWV0cnkudHlwZSA9PSAnUG9pbnQnKSB7XG4gICAgICAgIHJldHVybiB0cmFuc2Zvcm0oZ2VvbWV0cnkuY29vcmRpbmF0ZXMpO1xuICAgIH1cbiAgICBlbHNlIGlmIChnZW9tZXRyeS50eXBlID09ICdMaW5lU3RyaW5nJyB8fCBnZW9tZXRyeS50eXBlID09ICdNdWx0aVBvaW50Jykge1xuICAgICAgICByZXR1cm4gZ2VvbWV0cnkuY29vcmRpbmF0ZXMubWFwKHRyYW5zZm9ybSk7XG4gICAgfVxuICAgIGVsc2UgaWYgKGdlb21ldHJ5LnR5cGUgPT0gJ1BvbHlnb24nIHx8IGdlb21ldHJ5LnR5cGUgPT0gJ011bHRpTGluZVN0cmluZycpIHtcbiAgICAgICAgcmV0dXJuIGdlb21ldHJ5LmNvb3JkaW5hdGVzLm1hcChmdW5jdGlvbiAoY29vcmRpbmF0ZXMpIHtcbiAgICAgICAgICAgIHJldHVybiBjb29yZGluYXRlcy5tYXAodHJhbnNmb3JtKTtcbiAgICAgICAgfSk7XG4gICAgfVxuICAgIGVsc2UgaWYgKGdlb21ldHJ5LnR5cGUgPT0gJ011bHRpUG9seWdvbicpIHtcbiAgICAgICAgcmV0dXJuIGdlb21ldHJ5LmNvb3JkaW5hdGVzLm1hcChmdW5jdGlvbiAocG9seWdvbikge1xuICAgICAgICAgICAgcmV0dXJuIHBvbHlnb24ubWFwKGZ1bmN0aW9uIChjb29yZGluYXRlcykge1xuICAgICAgICAgICAgICAgIHJldHVybiBjb29yZGluYXRlcy5tYXAodHJhbnNmb3JtKTtcbiAgICAgICAgICAgIH0pO1xuICAgICAgICB9KTtcbiAgICB9XG4gICAgLy8gVE9ETzogc3VwcG9ydCBHZW9tZXRyeUNvbGxlY3Rpb25cbiAgICByZXR1cm4ge307XG59O1xuXG5HZW8uYm94SW50ZXJzZWN0ID0gZnVuY3Rpb24gKGIxLCBiMilcbntcbiAgICByZXR1cm4gIShcbiAgICAgICAgYjIuc3cueCA+IGIxLm5lLnggfHxcbiAgICAgICAgYjIubmUueCA8IGIxLnN3LnggfHxcbiAgICAgICAgYjIuc3cueSA+IGIxLm5lLnkgfHxcbiAgICAgICAgYjIubmUueSA8IGIxLnN3LnlcbiAgICApO1xufTtcblxuLy8gU3BsaXQgdGhlIGxpbmVzIG9mIGEgZmVhdHVyZSB3aGVyZXZlciB0d28gcG9pbnRzIGFyZSBmYXJ0aGVyIGFwYXJ0IHRoYW4gYSBnaXZlbiB0b2xlcmFuY2Vcbkdlby5zcGxpdEZlYXR1cmVMaW5lcyAgPSBmdW5jdGlvbiAoZmVhdHVyZSwgdG9sZXJhbmNlKSB7XG4gICAgdmFyIHRvbGVyYW5jZSA9IHRvbGVyYW5jZSB8fCAwLjAwMTtcbiAgICB2YXIgdG9sZXJhbmNlX3NxID0gdG9sZXJhbmNlICogdG9sZXJhbmNlO1xuICAgIHZhciBnZW9tID0gZmVhdHVyZS5nZW9tZXRyeTtcbiAgICB2YXIgbGluZXM7XG5cbiAgICBpZiAoZ2VvbS50eXBlID09ICdNdWx0aUxpbmVTdHJpbmcnKSB7XG4gICAgICAgIGxpbmVzID0gZ2VvbS5jb29yZGluYXRlcztcbiAgICB9XG4gICAgZWxzZSBpZiAoZ2VvbS50eXBlID09J0xpbmVTdHJpbmcnKSB7XG4gICAgICAgIGxpbmVzID0gW2dlb20uY29vcmRpbmF0ZXNdO1xuICAgIH1cbiAgICBlbHNlIHtcbiAgICAgICAgcmV0dXJuIGZlYXR1cmU7XG4gICAgfVxuXG4gICAgdmFyIHNwbGl0X2xpbmVzID0gW107XG5cbiAgICBmb3IgKHZhciBzPTA7IHMgPCBsaW5lcy5sZW5ndGg7IHMrKykge1xuICAgICAgICB2YXIgc2VnID0gbGluZXNbc107XG4gICAgICAgIHZhciBzcGxpdF9zZWcgPSBbXTtcbiAgICAgICAgdmFyIGxhc3RfY29vcmQgPSBudWxsO1xuICAgICAgICB2YXIga2VlcDtcblxuICAgICAgICBmb3IgKHZhciBjPTA7IGMgPCBzZWcubGVuZ3RoOyBjKyspIHtcbiAgICAgICAgICAgIHZhciBjb29yZCA9IHNlZ1tjXTtcbiAgICAgICAgICAgIGtlZXAgPSB0cnVlO1xuXG4gICAgICAgICAgICBpZiAobGFzdF9jb29yZCAhPSBudWxsKSB7XG4gICAgICAgICAgICAgICAgdmFyIGRpc3QgPSAoY29vcmRbMF0gLSBsYXN0X2Nvb3JkWzBdKSAqIChjb29yZFswXSAtIGxhc3RfY29vcmRbMF0pICsgKGNvb3JkWzFdIC0gbGFzdF9jb29yZFsxXSkgKiAoY29vcmRbMV0gLSBsYXN0X2Nvb3JkWzFdKTtcbiAgICAgICAgICAgICAgICBpZiAoZGlzdCA+IHRvbGVyYW5jZV9zcSkge1xuICAgICAgICAgICAgICAgICAgICAvLyBjb25zb2xlLmxvZyhcInNwbGl0IGxpbmVzIGF0IChcIiArIGNvb3JkWzBdICsgXCIsIFwiICsgY29vcmRbMV0gKyBcIiksIFwiICsgTWF0aC5zcXJ0KGRpc3QpICsgXCIgYXBhcnRcIik7XG4gICAgICAgICAgICAgICAgICAgIGtlZXAgPSBmYWxzZTtcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICB9XG5cbiAgICAgICAgICAgIGlmIChrZWVwID09IGZhbHNlKSB7XG4gICAgICAgICAgICAgICAgc3BsaXRfbGluZXMucHVzaChzcGxpdF9zZWcpO1xuICAgICAgICAgICAgICAgIHNwbGl0X3NlZyA9IFtdO1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgc3BsaXRfc2VnLnB1c2goY29vcmQpO1xuXG4gICAgICAgICAgICBsYXN0X2Nvb3JkID0gY29vcmQ7XG4gICAgICAgIH1cblxuICAgICAgICBzcGxpdF9saW5lcy5wdXNoKHNwbGl0X3NlZyk7XG4gICAgICAgIHNwbGl0X3NlZyA9IFtdO1xuICAgIH1cblxuICAgIGlmIChzcGxpdF9saW5lcy5sZW5ndGggPT0gMSkge1xuICAgICAgICBnZW9tLnR5cGUgPSAnTGluZVN0cmluZyc7XG4gICAgICAgIGdlb20uY29vcmRpbmF0ZXMgPSBzcGxpdF9saW5lc1swXTtcbiAgICB9XG4gICAgZWxzZSB7XG4gICAgICAgIGdlb20udHlwZSA9ICdNdWx0aUxpbmVTdHJpbmcnO1xuICAgICAgICBnZW9tLmNvb3JkaW5hdGVzID0gc3BsaXRfbGluZXM7XG4gICAgfVxuXG4gICAgcmV0dXJuIGZlYXR1cmU7XG59O1xuIiwiLy8gV2ViR0wgbWFuYWdlbWVudCBhbmQgcmVuZGVyaW5nIGZ1bmN0aW9uc1xuXG5leHBvcnQgdmFyIEdMID0ge307XG5cbi8vIFNldHVwIGEgV2ViR0wgY29udGV4dFxuLy8gSWYgbm8gY2FudmFzIGVsZW1lbnQgaXMgcHJvdmlkZWQsIG9uZSBpcyBjcmVhdGVkIGFuZCBhZGRlZCB0byB0aGUgZG9jdW1lbnQgYm9keVxuR0wuZ2V0Q29udGV4dCA9IGZ1bmN0aW9uIGdldENvbnRleHQgKGNhbnZhcylcbntcblxuICAgIHZhciBmdWxsc2NyZWVuID0gZmFsc2U7XG4gICAgaWYgKGNhbnZhcyA9PSBudWxsKSB7XG4gICAgICAgIGNhbnZhcyA9IGRvY3VtZW50LmNyZWF0ZUVsZW1lbnQoJ2NhbnZhcycpO1xuICAgICAgICBjYW52YXMuc3R5bGUucG9zaXRpb24gPSAnYWJzb2x1dGUnO1xuICAgICAgICBjYW52YXMuc3R5bGUudG9wID0gMDtcbiAgICAgICAgY2FudmFzLnN0eWxlLmxlZnQgPSAwO1xuICAgICAgICBjYW52YXMuc3R5bGUuekluZGV4ID0gLTE7XG4gICAgICAgIGRvY3VtZW50LmJvZHkuYXBwZW5kQ2hpbGQoY2FudmFzKTtcbiAgICAgICAgZnVsbHNjcmVlbiA9IHRydWU7XG4gICAgfVxuXG4gICAgdmFyIGdsID0gY2FudmFzLmdldENvbnRleHQoJ2V4cGVyaW1lbnRhbC13ZWJnbCcpO1xuICAgIGlmICghZ2wpIHtcbiAgICAgICAgYWxlcnQoXCJDb3VsZG4ndCBjcmVhdGUgV2ViR0wgY29udGV4dC4gWW91ciBicm93c2VyIHByb2JhYmx5IGRvZXNuJ3Qgc3VwcG9ydCBXZWJHTCBvciBpdCdzIHR1cm5lZCBvZmY/XCIpO1xuICAgICAgICB0aHJvdyBcIkNvdWxkbid0IGNyZWF0ZSBXZWJHTCBjb250ZXh0XCI7XG4gICAgfVxuXG4gICAgR0wucmVzaXplQ2FudmFzKGdsLCB3aW5kb3cuaW5uZXJXaWR0aCwgd2luZG93LmlubmVySGVpZ2h0KTtcbiAgICBpZiAoZnVsbHNjcmVlbiA9PSB0cnVlKSB7XG4gICAgICAgIHdpbmRvdy5hZGRFdmVudExpc3RlbmVyKCdyZXNpemUnLCBmdW5jdGlvbiAoKSB7XG4gICAgICAgICAgICBHTC5yZXNpemVDYW52YXMoZ2wsIHdpbmRvdy5pbm5lcldpZHRoLCB3aW5kb3cuaW5uZXJIZWlnaHQpO1xuICAgICAgICB9KTtcbiAgICB9XG5cbiAgICAvLyBHTFZlcnRleEFycmF5T2JqZWN0LmluaXQoZ2wpOyAvLyBUT0RPOiB0aGlzIHBhdHRlcm4gZG9lc24ndCBzdXBwb3J0IG11bHRpcGxlIGFjdGl2ZSBHTCBjb250ZXh0cywgc2hvdWxkIHRoYXQgZXZlbiBiZSBzdXBwb3J0ZWQ/XG5cbiAgICByZXR1cm4gZ2w7XG59O1xuXG5HTC5yZXNpemVDYW52YXMgPSBmdW5jdGlvbiAoZ2wsIHdpZHRoLCBoZWlnaHQpXG57XG4gICAgdmFyIGRldmljZV9waXhlbF9yYXRpbyA9IHdpbmRvdy5kZXZpY2VQaXhlbFJhdGlvIHx8IDE7XG4gICAgZ2wuY2FudmFzLnN0eWxlLndpZHRoID0gd2lkdGggKyAncHgnO1xuICAgIGdsLmNhbnZhcy5zdHlsZS5oZWlnaHQgPSBoZWlnaHQgKyAncHgnO1xuICAgIGdsLmNhbnZhcy53aWR0aCA9IE1hdGgucm91bmQoZ2wuY2FudmFzLnN0eWxlLndpZHRoICogZGV2aWNlX3BpeGVsX3JhdGlvKTtcbiAgICBnbC5jYW52YXMuaGVpZ2h0ID0gTWF0aC5yb3VuZChnbC5jYW52YXMuc3R5bGUud2lkdGggKiBkZXZpY2VfcGl4ZWxfcmF0aW8pO1xuICAgIGdsLnZpZXdwb3J0KDAsIDAsIGdsLmNhbnZhcy53aWR0aCwgZ2wuY2FudmFzLmhlaWdodCk7XG59O1xuXG4vLyBDb21waWxlICYgbGluayBhIFdlYkdMIHByb2dyYW0gZnJvbSBwcm92aWRlZCB2ZXJ0ZXggYW5kIGZyYWdtZW50IHNoYWRlciBzb3VyY2VzXG4vLyB1cGRhdGUgYSBwcm9ncmFtIGlmIG9uZSBpcyBwYXNzZWQgaW4uIENyZWF0ZSBvbmUgaWYgbm90LiBBbGVydCBhbmQgZG9uJ3QgdXBkYXRlIGFueXRoaW5nIGlmIHRoZSBzaGFkZXJzIGRvbid0IGNvbXBpbGUuXG5HTC51cGRhdGVQcm9ncmFtID0gZnVuY3Rpb24gR0x1cGRhdGVQcm9ncmFtIChnbCwgcHJvZ3JhbSwgdmVydGV4X3NoYWRlcl9zb3VyY2UsIGZyYWdtZW50X3NoYWRlcl9zb3VyY2UpXG57XG4gICAgdHJ5IHtcbiAgICAgICAgdmFyIHZlcnRleF9zaGFkZXIgPSBHTC5jcmVhdGVTaGFkZXIoZ2wsIHZlcnRleF9zaGFkZXJfc291cmNlLCBnbC5WRVJURVhfU0hBREVSKTtcbiAgICAgICAgdmFyIGZyYWdtZW50X3NoYWRlciA9IEdMLmNyZWF0ZVNoYWRlcihnbCwgJyNpZmRlZiBHTF9FU1xcbnByZWNpc2lvbiBoaWdocCBmbG9hdDtcXG4jZW5kaWZcXG5cXG4nICsgZnJhZ21lbnRfc2hhZGVyX3NvdXJjZSwgZ2wuRlJBR01FTlRfU0hBREVSKTtcbiAgICB9XG4gICAgY2F0Y2goZXJyKSB7XG4gICAgICAgIC8vIGFsZXJ0KGVycik7XG4gICAgICAgIGNvbnNvbGUubG9nKGVycik7XG4gICAgICAgIHJldHVybiBwcm9ncmFtO1xuICAgIH1cblxuICAgIGdsLnVzZVByb2dyYW0obnVsbCk7XG4gICAgaWYgKHByb2dyYW0gIT0gbnVsbCkge1xuICAgICAgICB2YXIgb2xkX3NoYWRlcnMgPSBnbC5nZXRBdHRhY2hlZFNoYWRlcnMocHJvZ3JhbSk7XG4gICAgICAgIGZvcih2YXIgaSA9IDA7IGkgPCBvbGRfc2hhZGVycy5sZW5ndGg7IGkrKykge1xuICAgICAgICAgICAgZ2wuZGV0YWNoU2hhZGVyKHByb2dyYW0sIG9sZF9zaGFkZXJzW2ldKTtcbiAgICAgICAgfVxuICAgIH0gZWxzZSB7XG4gICAgICAgIHByb2dyYW0gPSBnbC5jcmVhdGVQcm9ncmFtKCk7XG4gICAgfVxuXG4gICAgaWYgKHZlcnRleF9zaGFkZXIgPT0gbnVsbCB8fCBmcmFnbWVudF9zaGFkZXIgPT0gbnVsbCkge1xuICAgICAgICByZXR1cm4gcHJvZ3JhbTtcbiAgICB9XG5cbiAgICBnbC5hdHRhY2hTaGFkZXIocHJvZ3JhbSwgdmVydGV4X3NoYWRlcik7XG4gICAgZ2wuYXR0YWNoU2hhZGVyKHByb2dyYW0sIGZyYWdtZW50X3NoYWRlcik7XG5cbiAgICBnbC5kZWxldGVTaGFkZXIodmVydGV4X3NoYWRlcik7XG4gICAgZ2wuZGVsZXRlU2hhZGVyKGZyYWdtZW50X3NoYWRlcik7XG5cbiAgICBnbC5saW5rUHJvZ3JhbShwcm9ncmFtKTtcblxuICAgIGlmICghZ2wuZ2V0UHJvZ3JhbVBhcmFtZXRlcihwcm9ncmFtLCBnbC5MSU5LX1NUQVRVUykpIHtcbiAgICAgICAgdmFyIHByb2dyYW1fZXJyb3IgPVxuICAgICAgICAgICAgXCJXZWJHTCBwcm9ncmFtIGVycm9yOlxcblwiICtcbiAgICAgICAgICAgIFwiVkFMSURBVEVfU1RBVFVTOiBcIiArIGdsLmdldFByb2dyYW1QYXJhbWV0ZXIocHJvZ3JhbSwgZ2wuVkFMSURBVEVfU1RBVFVTKSArIFwiXFxuXCIgK1xuICAgICAgICAgICAgXCJFUlJPUjogXCIgKyBnbC5nZXRFcnJvcigpICsgXCJcXG5cXG5cIiArXG4gICAgICAgICAgICBcIi0tLSBWZXJ0ZXggU2hhZGVyIC0tLVxcblwiICsgdmVydGV4X3NoYWRlcl9zb3VyY2UgKyBcIlxcblxcblwiICtcbiAgICAgICAgICAgIFwiLS0tIEZyYWdtZW50IFNoYWRlciAtLS1cXG5cIiArIGZyYWdtZW50X3NoYWRlcl9zb3VyY2U7XG4gICAgICAgIGNvbnNvbGUubG9nKHByb2dyYW1fZXJyb3IpO1xuICAgICAgICB0aHJvdyBwcm9ncmFtX2Vycm9yO1xuICAgIH1cblxuICAgIHJldHVybiBwcm9ncmFtO1xufTtcblxuLy8gQ29tcGlsZSBhIHZlcnRleCBvciBmcmFnbWVudCBzaGFkZXIgZnJvbSBwcm92aWRlZCBzb3VyY2VcbkdMLmNyZWF0ZVNoYWRlciA9IGZ1bmN0aW9uIEdMY3JlYXRlU2hhZGVyIChnbCwgc291cmNlLCB0eXBlKVxue1xuICAgIHZhciBzaGFkZXIgPSBnbC5jcmVhdGVTaGFkZXIodHlwZSk7XG5cbiAgICBnbC5zaGFkZXJTb3VyY2Uoc2hhZGVyLCBzb3VyY2UpO1xuICAgIGdsLmNvbXBpbGVTaGFkZXIoc2hhZGVyKTtcblxuICAgIGlmICghZ2wuZ2V0U2hhZGVyUGFyYW1ldGVyKHNoYWRlciwgZ2wuQ09NUElMRV9TVEFUVVMpKSB7XG4gICAgICAgIHZhciBzaGFkZXJfZXJyb3IgPVxuICAgICAgICAgICAgXCJXZWJHTCBzaGFkZXIgZXJyb3I6XFxuXCIgK1xuICAgICAgICAgICAgKHR5cGUgPT0gZ2wuVkVSVEVYX1NIQURFUiA/IFwiVkVSVEVYXCIgOiBcIkZSQUdNRU5UXCIpICsgXCIgU0hBREVSOlxcblwiICtcbiAgICAgICAgICAgIGdsLmdldFNoYWRlckluZm9Mb2coc2hhZGVyKTtcbiAgICAgICAgdGhyb3cgc2hhZGVyX2Vycm9yO1xuICAgIH1cblxuICAgIHJldHVybiBzaGFkZXI7XG59O1xuXG4vLyBUcmlhbmd1bGF0aW9uIHVzaW5nIGxpYnRlc3MuanMgcG9ydCBvZiBnbHVUZXNzZWxhdG9yXG4vLyBodHRwczovL2dpdGh1Yi5jb20vYnJlbmRhbmtlbm55L2xpYnRlc3MuanNcbnRyeSB7XG4gICAgR0wudGVzc2VsYXRvciA9IChmdW5jdGlvbiBpbml0VGVzc2VsYXRvcigpIHtcbiAgICAgICAgdmFyIHRlc3NlbGF0b3IgPSBuZXcgbGlidGVzcy5HbHVUZXNzZWxhdG9yKCk7XG5cbiAgICAgICAgLy8gQ2FsbGVkIGZvciBlYWNoIHZlcnRleCBvZiB0ZXNzZWxhdG9yIG91dHB1dFxuICAgICAgICBmdW5jdGlvbiB2ZXJ0ZXhDYWxsYmFjayhkYXRhLCBwb2x5VmVydEFycmF5KSB7XG4gICAgICAgICAgICBpZiAodGVzc2VsYXRvci56ICE9IG51bGwpIHtcbiAgICAgICAgICAgICAgICBwb2x5VmVydEFycmF5LnB1c2goW2RhdGFbMF0sIGRhdGFbMV0sIHRlc3NlbGF0b3Iuel0pO1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgZWxzZSB7XG4gICAgICAgICAgICAgICAgcG9seVZlcnRBcnJheS5wdXNoKFtkYXRhWzBdLCBkYXRhWzFdXSk7XG4gICAgICAgICAgICB9XG4gICAgICAgIH1cblxuICAgICAgICAvLyBDYWxsZWQgd2hlbiBzZWdtZW50cyBpbnRlcnNlY3QgYW5kIG11c3QgYmUgc3BsaXRcbiAgICAgICAgZnVuY3Rpb24gY29tYmluZUNhbGxiYWNrKGNvb3JkcywgZGF0YSwgd2VpZ2h0KSB7XG4gICAgICAgICAgICByZXR1cm4gY29vcmRzO1xuICAgICAgICB9XG5cbiAgICAgICAgLy8gQ2FsbGVkIHdoZW4gYSB2ZXJ0ZXggc3RhcnRzIG9yIHN0b3BzIGEgYm91bmRhcnkgZWRnZSBvZiBhIHBvbHlnb25cbiAgICAgICAgZnVuY3Rpb24gZWRnZUNhbGxiYWNrKGZsYWcpIHtcbiAgICAgICAgICAgIC8vIE5vLW9wIGNhbGxiYWNrIHRvIGZvcmNlIHNpbXBsZSB0cmlhbmdsZSBwcmltaXRpdmVzIChubyB0cmlhbmdsZSBzdHJpcHMgb3IgZmFucykuXG4gICAgICAgICAgICAvLyBTZWU6IGh0dHA6Ly93d3cuZ2xwcm9ncmFtbWluZy5jb20vcmVkL2NoYXB0ZXIxMS5odG1sXG4gICAgICAgICAgICAvLyBcIlNpbmNlIGVkZ2UgZmxhZ3MgbWFrZSBubyBzZW5zZSBpbiBhIHRyaWFuZ2xlIGZhbiBvciB0cmlhbmdsZSBzdHJpcCwgaWYgdGhlcmUgaXMgYSBjYWxsYmFja1xuICAgICAgICAgICAgLy8gYXNzb2NpYXRlZCB3aXRoIEdMVV9URVNTX0VER0VfRkxBRyB0aGF0IGVuYWJsZXMgZWRnZSBmbGFncywgdGhlIEdMVV9URVNTX0JFR0lOIGNhbGxiYWNrIGlzXG4gICAgICAgICAgICAvLyBjYWxsZWQgb25seSB3aXRoIEdMX1RSSUFOR0xFUy5cIlxuICAgICAgICAgICAgLy8gY29uc29sZS5sb2coJ0dMLnRlc3NlbGF0b3I6IGVkZ2UgZmxhZzogJyArIGZsYWcpO1xuICAgICAgICB9XG5cbiAgICAgICAgdGVzc2VsYXRvci5nbHVUZXNzQ2FsbGJhY2sobGlidGVzcy5nbHVFbnVtLkdMVV9URVNTX1ZFUlRFWF9EQVRBLCB2ZXJ0ZXhDYWxsYmFjayk7XG4gICAgICAgIHRlc3NlbGF0b3IuZ2x1VGVzc0NhbGxiYWNrKGxpYnRlc3MuZ2x1RW51bS5HTFVfVEVTU19DT01CSU5FLCBjb21iaW5lQ2FsbGJhY2spO1xuICAgICAgICB0ZXNzZWxhdG9yLmdsdVRlc3NDYWxsYmFjayhsaWJ0ZXNzLmdsdUVudW0uR0xVX1RFU1NfRURHRV9GTEFHLCBlZGdlQ2FsbGJhY2spO1xuXG4gICAgICAgIC8vIEJyZW5kYW4gS2Vubnk6XG4gICAgICAgIC8vIGxpYnRlc3Mgd2lsbCB0YWtlIDNkIHZlcnRzIGFuZCBmbGF0dGVuIHRvIGEgcGxhbmUgZm9yIHRlc3NlbGF0aW9uXG4gICAgICAgIC8vIHNpbmNlIG9ubHkgZG9pbmcgMmQgdGVzc2VsYXRpb24gaGVyZSwgcHJvdmlkZSB6PTEgbm9ybWFsIHRvIHNraXBcbiAgICAgICAgLy8gaXRlcmF0aW5nIG92ZXIgdmVydHMgb25seSB0byBnZXQgdGhlIHNhbWUgYW5zd2VyLlxuICAgICAgICAvLyBjb21tZW50IG91dCB0byB0ZXN0IG5vcm1hbC1nZW5lcmF0aW9uIGNvZGVcbiAgICAgICAgdGVzc2VsYXRvci5nbHVUZXNzTm9ybWFsKDAsIDAsIDEpO1xuXG4gICAgICAgIHJldHVybiB0ZXNzZWxhdG9yO1xuICAgIH0pKCk7XG5cbiAgICBHTC50cmlhbmd1bGF0ZVBvbHlnb24gPSBmdW5jdGlvbiBHTFRyaWFuZ3VsYXRlIChjb250b3VycywgeilcbiAgICB7XG4gICAgICAgIHZhciB0cmlhbmdsZVZlcnRzID0gW107XG4gICAgICAgIEdMLnRlc3NlbGF0b3IueiA9IHo7XG4gICAgICAgIEdMLnRlc3NlbGF0b3IuZ2x1VGVzc0JlZ2luUG9seWdvbih0cmlhbmdsZVZlcnRzKTtcblxuICAgICAgICBmb3IgKHZhciBpID0gMDsgaSA8IGNvbnRvdXJzLmxlbmd0aDsgaSsrKSB7XG4gICAgICAgICAgICBHTC50ZXNzZWxhdG9yLmdsdVRlc3NCZWdpbkNvbnRvdXIoKTtcbiAgICAgICAgICAgIHZhciBjb250b3VyID0gY29udG91cnNbaV07XG4gICAgICAgICAgICBmb3IgKHZhciBqID0gMDsgaiA8IGNvbnRvdXIubGVuZ3RoOyBqICsrKSB7XG4gICAgICAgICAgICAgICAgdmFyIGNvb3JkcyA9IFtjb250b3VyW2pdWzBdLCBjb250b3VyW2pdWzFdLCAwXTtcbiAgICAgICAgICAgICAgICBHTC50ZXNzZWxhdG9yLmdsdVRlc3NWZXJ0ZXgoY29vcmRzLCBjb29yZHMpO1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgR0wudGVzc2VsYXRvci5nbHVUZXNzRW5kQ29udG91cigpO1xuICAgICAgICB9XG5cbiAgICAgICAgR0wudGVzc2VsYXRvci5nbHVUZXNzRW5kUG9seWdvbigpO1xuICAgICAgICByZXR1cm4gdHJpYW5nbGVWZXJ0cztcbiAgICB9O1xufVxuY2F0Y2ggKGUpIHtcbiAgICAvLyBjb25zb2xlLmxvZyhcImxpYnRlc3Mgbm90IGRlZmluZWQhXCIpO1xuICAgIC8vIHNraXAgaWYgbGlidGVzcyBub3QgZGVmaW5lZFxufVxuXG4vLyBBZGQgdmVydGljZXMgdG8gYW4gYXJyYXkgKGRlc3RpbmVkIHRvIGJlIHVzZWQgYXMgYSBHTCBidWZmZXIpLCAnc3RyaXBpbmcnIGVhY2ggdmVydGV4IHdpdGggY29uc3RhbnQgZGF0YVxuLy8gUGVyLXZlcnRleCBhdHRyaWJ1dGVzIG11c3QgYmUgcHJlLXBhY2tlZCBpbnRvIHRoZSB2ZXJ0aWNlcyBhcnJheVxuLy8gVXNlZCBmb3IgYWRkaW5nIHZhbHVlcyB0aGF0IGFyZSBvZnRlbiBjb25zdGFudCBwZXIgZ2VvbWV0cnkgb3IgcG9seWdvbiwgbGlrZSBjb2xvcnMsIG5vcm1hbHMgKGZvciBwb2x5cyBzaXR0aW5nIGZsYXQgb24gbWFwKSwgbGF5ZXIgYW5kIG1hdGVyaWFsIGluZm8sIGV0Yy5cbkdMLmFkZFZlcnRpY2VzID0gZnVuY3Rpb24gKHZlcnRpY2VzLCB2ZXJ0ZXhfY29uc3RhbnRzLCB2ZXJ0ZXhfZGF0YSlcbntcbiAgICBpZiAodmVydGljZXMgPT0gbnVsbCkge1xuICAgICAgICByZXR1cm4gdmVydGV4X2RhdGE7XG4gICAgfVxuICAgIHZlcnRleF9jb25zdGFudHMgPSB2ZXJ0ZXhfY29uc3RhbnRzIHx8IFtdO1xuXG4gICAgZm9yICh2YXIgdj0wLCB2bGVuID0gdmVydGljZXMubGVuZ3RoOyB2IDwgdmxlbjsgdisrKSB7XG4gICAgICAgIHZlcnRleF9kYXRhLnB1c2guYXBwbHkodmVydGV4X2RhdGEsIHZlcnRpY2VzW3ZdKTtcbiAgICAgICAgdmVydGV4X2RhdGEucHVzaC5hcHBseSh2ZXJ0ZXhfZGF0YSwgdmVydGV4X2NvbnN0YW50cyk7XG4gICAgfVxuXG4gICAgcmV0dXJuIHZlcnRleF9kYXRhO1xufTtcblxuLy8gQWRkIHZlcnRpY2VzIHRvIGFuIGFycmF5LCAnc3RyaXBpbmcnIGVhY2ggdmVydGV4IHdpdGggY29uc3RhbnQgZGF0YVxuLy8gTXVsdGlwbGUsIHVuLXBhY2tlZCBhdHRyaWJ1dGUgYXJyYXlzIGNhbiBiZSBwcm92aWRlZFxuR0wuYWRkVmVydGljZXNNdWx0aXBsZUF0dHJpYnV0ZXMgPSBmdW5jdGlvbiAoZHluYW1pY3MsIGNvbnN0YW50cywgdmVydGV4X2RhdGEpXG57XG4gICAgdmFyIGRsZW4gPSBkeW5hbWljcy5sZW5ndGg7XG4gICAgdmFyIHZsZW4gPSBkeW5hbWljc1swXS5sZW5ndGg7XG4gICAgY29uc3RhbnRzID0gY29uc3RhbnRzIHx8IFtdO1xuXG4gICAgZm9yICh2YXIgdj0wOyB2IDwgdmxlbjsgdisrKSB7XG4gICAgICAgIGZvciAodmFyIGQ9MDsgZCA8IGRsZW47IGQrKykge1xuICAgICAgICAgICAgdmVydGV4X2RhdGEucHVzaC5hcHBseSh2ZXJ0ZXhfZGF0YSwgZHluYW1pY3NbZF1bdl0pO1xuICAgICAgICB9XG4gICAgICAgIHZlcnRleF9kYXRhLnB1c2guYXBwbHkodmVydGV4X2RhdGEsIGNvbnN0YW50cyk7XG4gICAgfVxuXG4gICAgcmV0dXJuIHZlcnRleF9kYXRhO1xufTtcblxuLy8gQWRkIHZlcnRpY2VzIHRvIGFuIGFycmF5LCB3aXRoIGEgdmFyaWFibGUgbGF5b3V0IChib3RoIHBlci12ZXJ0ZXggZHluYW1pYyBhbmQgY29uc3RhbnQgYXR0cmlicylcbi8vIEdMLmFkZFZlcnRpY2VzQnlBdHRyaWJ1dGVMYXlvdXQgPSBmdW5jdGlvbiAoYXR0cmlicywgdmVydGV4X2RhdGEpXG4vLyB7XG4vLyAgICAgdmFyIG1heF9sZW5ndGggPSAwO1xuLy8gICAgIGZvciAodmFyIGE9MDsgYSA8IGF0dHJpYnMubGVuZ3RoOyBhKyspIHtcbi8vICAgICAgICAgLy8gY29uc29sZS5sb2coYXR0cmlic1thXS5uYW1lKTtcbi8vICAgICAgICAgLy8gY29uc29sZS5sb2coXCJhIFwiICsgdHlwZW9mIGF0dHJpYnNbYV0uZGF0YSk7XG4vLyAgICAgICAgIGlmICh0eXBlb2YgYXR0cmlic1thXS5kYXRhID09ICdvYmplY3QnKSB7XG4vLyAgICAgICAgICAgICAvLyBjb25zb2xlLmxvZyhcImFbMF0gXCIgKyB0eXBlb2YgYXR0cmlic1thXS5kYXRhWzBdKTtcbi8vICAgICAgICAgICAgIC8vIFBlci12ZXJ0ZXggbGlzdCAtIGFycmF5IG9mIGFycmF5XG4vLyAgICAgICAgICAgICBpZiAodHlwZW9mIGF0dHJpYnNbYV0uZGF0YVswXSA9PSAnb2JqZWN0Jykge1xuLy8gICAgICAgICAgICAgICAgIGF0dHJpYnNbYV0uY3Vyc29yID0gMDtcbi8vICAgICAgICAgICAgICAgICBpZiAoYXR0cmlic1thXS5kYXRhLmxlbmd0aCA+IG1heF9sZW5ndGgpIHtcbi8vICAgICAgICAgICAgICAgICAgICAgbWF4X2xlbmd0aCA9IGF0dHJpYnNbYV0uZGF0YS5sZW5ndGg7XG4vLyAgICAgICAgICAgICAgICAgfVxuLy8gICAgICAgICAgICAgfVxuLy8gICAgICAgICAgICAgLy8gU3RhdGljIGFycmF5IGZvciBhbGwgdmVydGljZXNcbi8vICAgICAgICAgICAgIGVsc2Uge1xuLy8gICAgICAgICAgICAgICAgIGF0dHJpYnNbYV0ubmV4dF92ZXJ0ZXggPSBhdHRyaWJzW2FdLmRhdGE7XG4vLyAgICAgICAgICAgICB9XG4vLyAgICAgICAgIH1cbi8vICAgICAgICAgZWxzZSB7XG4vLyAgICAgICAgICAgICAvLyBTdGF0aWMgc2luZ2xlIHZhbHVlIGZvciBhbGwgdmVydGljZXMsIGNvbnZlcnQgdG8gYXJyYXlcbi8vICAgICAgICAgICAgIGF0dHJpYnNbYV0ubmV4dF92ZXJ0ZXggPSBbYXR0cmlic1thXS5kYXRhXTtcbi8vICAgICAgICAgfVxuLy8gICAgIH1cblxuLy8gICAgIGZvciAodmFyIHY9MDsgdiA8IG1heF9sZW5ndGg7IHYrKykge1xuLy8gICAgICAgICBmb3IgKHZhciBhPTA7IGEgPCBhdHRyaWJzLmxlbmd0aDsgYSsrKSB7XG4vLyAgICAgICAgICAgICBpZiAoYXR0cmlic1thXS5jdXJzb3IgIT0gbnVsbCkge1xuLy8gICAgICAgICAgICAgICAgIC8vIE5leHQgdmFsdWUgaW4gbGlzdFxuLy8gICAgICAgICAgICAgICAgIGF0dHJpYnNbYV0ubmV4dF92ZXJ0ZXggPSBhdHRyaWJzW2FdLmRhdGFbYXR0cmlic1thXS5jdXJzb3JdO1xuXG4vLyAgICAgICAgICAgICAgICAgLy8gVE9ETzogcmVwZWF0cyBpZiBvbmUgbGlzdCBpcyBzaG9ydGVyIHRoYW4gb3RoZXJzIC0gZGVzaXJlZCBiZWhhdmlvciwgb3IgZW5mb3JjZSBzYW1lIGxlbmd0aD9cbi8vICAgICAgICAgICAgICAgICBpZiAoYXR0cmlic1thXS5jdXJzb3IgPCBhdHRyaWJzW2FdLmRhdGEubGVuZ3RoKSB7XG4vLyAgICAgICAgICAgICAgICAgICAgIGF0dHJpYnNbYV0uY3Vyc29yKys7XG4vLyAgICAgICAgICAgICAgICAgfVxuLy8gICAgICAgICAgICAgfVxuLy8gICAgICAgICAgICAgdmVydGV4X2RhdGEucHVzaC5hcHBseSh2ZXJ0ZXhfZGF0YSwgYXR0cmlic1thXS5uZXh0X3ZlcnRleCk7XG4vLyAgICAgICAgIH1cbi8vICAgICB9XG4vLyAgICAgcmV0dXJuIHZlcnRleF9kYXRhO1xuLy8gfTtcbiIsImltcG9ydCBQb2ludCBmcm9tICcuLi9wb2ludCc7XG5pbXBvcnQge1ZlY3Rvcn0gZnJvbSAnLi4vdmVjdG9yJztcbmltcG9ydCB7R0x9IGZyb20gJy4vZ2wnO1xuXG5leHBvcnQgdmFyIEdMQnVpbGRlcnMgPSB7fTtcblxuR0xCdWlsZGVycy5kZWJ1ZyA9IGZhbHNlO1xuXG4vLyBUZXNzZWxhdGUgYSBmbGF0IDJEIHBvbHlnb24gd2l0aCBmaXhlZCBoZWlnaHQgYW5kIGFkZCB0byBHTCB2ZXJ0ZXggYnVmZmVyXG5HTEJ1aWxkZXJzLmJ1aWxkUG9seWdvbnMgPSBmdW5jdGlvbiBHTEJ1aWxkZXJzQnVpbGRQb2x5Z29ucyAocG9seWdvbnMsIHosIHZlcnRleF9kYXRhLCBvcHRpb25zKVxue1xuICAgIG9wdGlvbnMgPSBvcHRpb25zIHx8IHt9O1xuXG4gICAgdmFyIHZlcnRleF9jb25zdGFudHMgPSBbXTtcbiAgICBpZiAoeiAhPSBudWxsKSB7XG4gICAgICAgIHZlcnRleF9jb25zdGFudHMucHVzaCh6KTsgLy8gcHJvdmlkZWQgelxuICAgIH1cbiAgICBpZiAob3B0aW9ucy5ub3JtYWxzKSB7XG4gICAgICAgIHZlcnRleF9jb25zdGFudHMucHVzaCgwLCAwLCAxKTsgLy8gdXB3YXJkcy1mYWNpbmcgbm9ybWFsXG4gICAgfVxuICAgIGlmIChvcHRpb25zLnZlcnRleF9jb25zdGFudHMpIHtcbiAgICAgICAgdmVydGV4X2NvbnN0YW50cy5wdXNoLmFwcGx5KHZlcnRleF9jb25zdGFudHMsIG9wdGlvbnMudmVydGV4X2NvbnN0YW50cyk7XG4gICAgfVxuICAgIGlmICh2ZXJ0ZXhfY29uc3RhbnRzLmxlbmd0aCA9PSAwKSB7XG4gICAgICAgIHZlcnRleF9jb25zdGFudHMgPSBudWxsO1xuICAgIH1cblxuICAgIHZhciBudW1fcG9seWdvbnMgPSBwb2x5Z29ucy5sZW5ndGg7XG4gICAgZm9yICh2YXIgcD0wOyBwIDwgbnVtX3BvbHlnb25zOyBwKyspIHtcbiAgICAgICAgdmFyIHZlcnRpY2VzID0gR0wudHJpYW5ndWxhdGVQb2x5Z29uKHBvbHlnb25zW3BdKTtcbiAgICAgICAgR0wuYWRkVmVydGljZXModmVydGljZXMsIHZlcnRleF9jb25zdGFudHMsIHZlcnRleF9kYXRhKTtcbiAgICB9XG5cbiAgICByZXR1cm4gdmVydGV4X2RhdGE7XG59O1xuXG4vLyBDYWxsYmFjay1iYXNlIGJ1aWxkZXIgKGZvciBmdXR1cmUgZXhwbG9yYXRpb24pXG4vLyBUZXNzZWxhdGUgYSBmbGF0IDJEIHBvbHlnb24gd2l0aCBmaXhlZCBoZWlnaHQgYW5kIGFkZCB0byBHTCB2ZXJ0ZXggYnVmZmVyXG4vLyBHTEJ1aWxkZXJzLmJ1aWxkUG9seWdvbnMyID0gZnVuY3Rpb24gR0xCdWlsZGVyc0J1aWxkUG9seWdvbjIgKHBvbHlnb25zLCB6LCBhZGRHZW9tZXRyeSwgb3B0aW9ucylcbi8vIHtcbi8vICAgICBvcHRpb25zID0gb3B0aW9ucyB8fCB7fTtcblxuLy8gICAgIHZhciBudW1fcG9seWdvbnMgPSBwb2x5Z29ucy5sZW5ndGg7XG4vLyAgICAgZm9yICh2YXIgcD0wOyBwIDwgbnVtX3BvbHlnb25zOyBwKyspIHtcbi8vICAgICAgICAgdmFyIHZlcnRpY2VzID0ge1xuLy8gICAgICAgICAgICAgcG9zaXRpb25zOiBHTC50cmlhbmd1bGF0ZVBvbHlnb24ocG9seWdvbnNbcF0sIHopLFxuLy8gICAgICAgICAgICAgbm9ybWFsczogKG9wdGlvbnMubm9ybWFscyA/IFswLCAwLCAxXSA6IG51bGwpXG4vLyAgICAgICAgIH07XG5cbi8vICAgICAgICAgYWRkR2VvbWV0cnkodmVydGljZXMpO1xuLy8gICAgIH1cbi8vIH07XG5cbi8vIFRlc3NlbGF0ZSBhbmQgZXh0cnVkZSBhIGZsYXQgMkQgcG9seWdvbiBpbnRvIGEgc2ltcGxlIDNEIG1vZGVsIHdpdGggZml4ZWQgaGVpZ2h0IGFuZCBhZGQgdG8gR0wgdmVydGV4IGJ1ZmZlclxuR0xCdWlsZGVycy5idWlsZEV4dHJ1ZGVkUG9seWdvbnMgPSBmdW5jdGlvbiBHTEJ1aWxkZXJzQnVpbGRFeHRydWRlZFBvbHlnb24gKHBvbHlnb25zLCB6LCBoZWlnaHQsIG1pbl9oZWlnaHQsIHZlcnRleF9kYXRhLCBvcHRpb25zKVxue1xuICAgIG9wdGlvbnMgPSBvcHRpb25zIHx8IHt9O1xuICAgIHZhciBtaW5feiA9IHogKyAobWluX2hlaWdodCB8fCAwKTtcbiAgICB2YXIgbWF4X3ogPSB6ICsgaGVpZ2h0O1xuXG4gICAgLy8gVG9wXG4gICAgR0xCdWlsZGVycy5idWlsZFBvbHlnb25zKHBvbHlnb25zLCBtYXhfeiwgdmVydGV4X2RhdGEsIHsgbm9ybWFsczogdHJ1ZSwgdmVydGV4X2NvbnN0YW50czogb3B0aW9ucy52ZXJ0ZXhfY29uc3RhbnRzIH0pO1xuICAgIC8vIHZhciB0b3BfdmVydGV4X2NvbnN0YW50cyA9IFswLCAwLCAxXTtcbiAgICAvLyBpZiAob3B0aW9ucy52ZXJ0ZXhfY29uc3RhbnRzICE9IG51bGwpIHtcbiAgICAvLyAgICAgdG9wX3ZlcnRleF9jb25zdGFudHMucHVzaC5hcHBseSh0b3BfdmVydGV4X2NvbnN0YW50cywgb3B0aW9ucy52ZXJ0ZXhfY29uc3RhbnRzKTtcbiAgICAvLyB9XG4gICAgLy8gR0xCdWlsZGVycy5idWlsZFBvbHlnb25zMihcbiAgICAvLyAgICAgcG9seWdvbnMsXG4gICAgLy8gICAgIG1heF96LFxuICAgIC8vICAgICBmdW5jdGlvbiAodmVydGljZXMpIHtcbiAgICAvLyAgICAgICAgIEdMLmFkZFZlcnRpY2VzKHZlcnRpY2VzLnBvc2l0aW9ucywgdG9wX3ZlcnRleF9jb25zdGFudHMsIHZlcnRleF9kYXRhKTtcbiAgICAvLyAgICAgfVxuICAgIC8vICk7XG5cbiAgICAvLyBXYWxsc1xuICAgIHZhciB3YWxsX3ZlcnRleF9jb25zdGFudHMgPSBbbnVsbCwgbnVsbCwgbnVsbF07IC8vIG5vcm1hbHMgd2lsbCBiZSBjYWxjdWxhdGVkIGJlbG93XG4gICAgaWYgKG9wdGlvbnMudmVydGV4X2NvbnN0YW50cykge1xuICAgICAgICB3YWxsX3ZlcnRleF9jb25zdGFudHMucHVzaC5hcHBseSh3YWxsX3ZlcnRleF9jb25zdGFudHMsIG9wdGlvbnMudmVydGV4X2NvbnN0YW50cyk7XG4gICAgfVxuXG4gICAgdmFyIG51bV9wb2x5Z29ucyA9IHBvbHlnb25zLmxlbmd0aDtcbiAgICBmb3IgKHZhciBwPTA7IHAgPCBudW1fcG9seWdvbnM7IHArKykge1xuICAgICAgICB2YXIgcG9seWdvbiA9IHBvbHlnb25zW3BdO1xuXG4gICAgICAgIGZvciAodmFyIHE9MDsgcSA8IHBvbHlnb24ubGVuZ3RoOyBxKyspIHtcbiAgICAgICAgICAgIHZhciBjb250b3VyID0gcG9seWdvbltxXTtcblxuICAgICAgICAgICAgZm9yICh2YXIgdz0wOyB3IDwgY29udG91ci5sZW5ndGggLSAxOyB3KyspIHtcbiAgICAgICAgICAgICAgICB2YXIgd2FsbF92ZXJ0aWNlcyA9IFtdO1xuXG4gICAgICAgICAgICAgICAgLy8gVHdvIHRyaWFuZ2xlcyBmb3IgdGhlIHF1YWQgZm9ybWVkIGJ5IGVhY2ggdmVydGV4IHBhaXIsIGdvaW5nIGZyb20gYm90dG9tIHRvIHRvcCBoZWlnaHRcbiAgICAgICAgICAgICAgICB3YWxsX3ZlcnRpY2VzLnB1c2goXG4gICAgICAgICAgICAgICAgICAgIC8vIFRyaWFuZ2xlXG4gICAgICAgICAgICAgICAgICAgIFtjb250b3VyW3crMV1bMF0sIGNvbnRvdXJbdysxXVsxXSwgbWF4X3pdLFxuICAgICAgICAgICAgICAgICAgICBbY29udG91clt3KzFdWzBdLCBjb250b3VyW3crMV1bMV0sIG1pbl96XSxcbiAgICAgICAgICAgICAgICAgICAgW2NvbnRvdXJbd11bMF0sIGNvbnRvdXJbd11bMV0sIG1pbl96XSxcbiAgICAgICAgICAgICAgICAgICAgLy8gVHJpYW5nbGVcbiAgICAgICAgICAgICAgICAgICAgW2NvbnRvdXJbd11bMF0sIGNvbnRvdXJbd11bMV0sIG1pbl96XSxcbiAgICAgICAgICAgICAgICAgICAgW2NvbnRvdXJbd11bMF0sIGNvbnRvdXJbd11bMV0sIG1heF96XSxcbiAgICAgICAgICAgICAgICAgICAgW2NvbnRvdXJbdysxXVswXSwgY29udG91clt3KzFdWzFdLCBtYXhfel1cbiAgICAgICAgICAgICAgICApO1xuXG4gICAgICAgICAgICAgICAgLy8gQ2FsYyB0aGUgbm9ybWFsIG9mIHRoZSB3YWxsIGZyb20gdXAgdmVjdG9yIGFuZCBvbmUgc2VnbWVudCBvZiB0aGUgd2FsbCB0cmlhbmdsZXNcbiAgICAgICAgICAgICAgICB2YXIgbm9ybWFsID0gVmVjdG9yLmNyb3NzKFxuICAgICAgICAgICAgICAgICAgICBbMCwgMCwgMV0sXG4gICAgICAgICAgICAgICAgICAgIFZlY3Rvci5ub3JtYWxpemUoW2NvbnRvdXJbdysxXVswXSAtIGNvbnRvdXJbd11bMF0sIGNvbnRvdXJbdysxXVsxXSAtIGNvbnRvdXJbd11bMV0sIDBdKVxuICAgICAgICAgICAgICAgICk7XG5cbiAgICAgICAgICAgICAgICB3YWxsX3ZlcnRleF9jb25zdGFudHNbMF0gPSBub3JtYWxbMF07XG4gICAgICAgICAgICAgICAgd2FsbF92ZXJ0ZXhfY29uc3RhbnRzWzFdID0gbm9ybWFsWzFdO1xuICAgICAgICAgICAgICAgIHdhbGxfdmVydGV4X2NvbnN0YW50c1syXSA9IG5vcm1hbFsyXTtcblxuICAgICAgICAgICAgICAgIEdMLmFkZFZlcnRpY2VzKHdhbGxfdmVydGljZXMsIHdhbGxfdmVydGV4X2NvbnN0YW50cywgdmVydGV4X2RhdGEpO1xuICAgICAgICAgICAgfVxuICAgICAgICB9XG4gICAgfVxuXG4gICAgcmV0dXJuIHZlcnRleF9kYXRhO1xufTtcblxuLy8gQnVpbGQgdGVzc2VsbGF0ZWQgdHJpYW5nbGVzIGZvciBhIHBvbHlsaW5lXG4vLyBCYXNpY2FsbHkgZm9sbG93aW5nIHRoZSBtZXRob2QgZGVzY3JpYmVkIGhlcmUgZm9yIG1pdGVyIGpvaW50czpcbi8vIGh0dHA6Ly9hcnRncmFtbWVyLmJsb2dzcG90LmNvLnVrLzIwMTEvMDcvZHJhd2luZy1wb2x5bGluZXMtYnktdGVzc2VsbGF0aW9uLmh0bWxcbkdMQnVpbGRlcnMuYnVpbGRQb2x5bGluZXMgPSBmdW5jdGlvbiBHTEJ1aWxkZXJzQnVpbGRQb2x5bGluZXMgKGxpbmVzLCB6LCB3aWR0aCwgdmVydGV4X2RhdGEsIG9wdGlvbnMpXG57XG4gICAgb3B0aW9ucyA9IG9wdGlvbnMgfHwge307XG4gICAgb3B0aW9ucy5jbG9zZWRfcG9seWdvbiA9IG9wdGlvbnMuY2xvc2VkX3BvbHlnb24gfHwgZmFsc2U7XG4gICAgb3B0aW9ucy5yZW1vdmVfdGlsZV9lZGdlcyA9IG9wdGlvbnMucmVtb3ZlX3RpbGVfZWRnZXMgfHwgZmFsc2U7XG5cbiAgICB2YXIgdmVydGV4X2NvbnN0YW50cyA9IFt6LCAwLCAwLCAxXTsgLy8gcHJvdmlkZWQgeiwgYW5kIHVwd2FyZHMtZmFjaW5nIG5vcm1hbFxuICAgIGlmIChvcHRpb25zLnZlcnRleF9jb25zdGFudHMpIHtcbiAgICAgICAgdmVydGV4X2NvbnN0YW50cy5wdXNoLmFwcGx5KHZlcnRleF9jb25zdGFudHMsIG9wdGlvbnMudmVydGV4X2NvbnN0YW50cyk7XG4gICAgfVxuXG4gICAgLy8gTGluZSBjZW50ZXIgLSBkZWJ1Z2dpbmdcbiAgICBpZiAoR0xCdWlsZGVycy5kZWJ1ZyAmJiBvcHRpb25zLnZlcnRleF9saW5lcykge1xuICAgICAgICB2YXIgbnVtX2xpbmVzID0gbGluZXMubGVuZ3RoO1xuICAgICAgICBmb3IgKHZhciBsbj0wOyBsbiA8IG51bV9saW5lczsgbG4rKykge1xuICAgICAgICAgICAgdmFyIGxpbmUgPSBsaW5lc1tsbl07XG5cbiAgICAgICAgICAgIGZvciAodmFyIHA9MDsgcCA8IGxpbmUubGVuZ3RoIC0gMTsgcCsrKSB7XG4gICAgICAgICAgICAgICAgLy8gUG9pbnQgQSB0byBCXG4gICAgICAgICAgICAgICAgdmFyIHBhID0gbGluZVtwXTtcbiAgICAgICAgICAgICAgICB2YXIgcGIgPSBsaW5lW3ArMV07XG5cbiAgICAgICAgICAgICAgICBvcHRpb25zLnZlcnRleF9saW5lcy5wdXNoKFxuICAgICAgICAgICAgICAgICAgICBwYVswXSwgcGFbMV0sIHogKyAwLjAwMSwgMCwgMCwgMSwgMS4wLCAwLCAwLFxuICAgICAgICAgICAgICAgICAgICBwYlswXSwgcGJbMV0sIHogKyAwLjAwMSwgMCwgMCwgMSwgMS4wLCAwLCAwXG4gICAgICAgICAgICAgICAgKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgfTtcbiAgICB9XG5cbiAgICAvLyBCdWlsZCB0cmlhbmdsZXNcbiAgICB2YXIgdmVydGljZXMgPSBbXTtcbiAgICB2YXIgbnVtX2xpbmVzID0gbGluZXMubGVuZ3RoO1xuICAgIGZvciAodmFyIGxuPTA7IGxuIDwgbnVtX2xpbmVzOyBsbisrKSB7XG4gICAgICAgIHZhciBsaW5lID0gbGluZXNbbG5dO1xuICAgICAgICAvLyBNdWx0aXBsZSBsaW5lIHNlZ21lbnRzXG4gICAgICAgIGlmIChsaW5lLmxlbmd0aCA+IDIpIHtcbiAgICAgICAgICAgIC8vIEJ1aWxkIGFuY2hvcnMgZm9yIGxpbmUgc2VnbWVudHM6XG4gICAgICAgICAgICAvLyBhbmNob3JzIGFyZSAzIHBvaW50cywgZWFjaCBjb25uZWN0aW5nIDIgbGluZSBzZWdtZW50cyB0aGF0IHNoYXJlIGEgam9pbnQgKHN0YXJ0IHBvaW50LCBqb2ludCBwb2ludCwgZW5kIHBvaW50KVxuXG4gICAgICAgICAgICB2YXIgYW5jaG9ycyA9IFtdO1xuXG4gICAgICAgICAgICBpZiAobGluZS5sZW5ndGggPiAzKSB7XG4gICAgICAgICAgICAgICAgLy8gRmluZCBtaWRwb2ludHMgb2YgZWFjaCBsaW5lIHNlZ21lbnRcbiAgICAgICAgICAgICAgICAvLyBGb3IgY2xvc2VkIHBvbHlnb25zLCBjYWxjdWxhdGUgYWxsIG1pZHBvaW50cyBzaW5jZSBzZWdtZW50cyB3aWxsIHdyYXAgYXJvdW5kIHRvIGZpcnN0IG1pZHBvaW50XG4gICAgICAgICAgICAgICAgdmFyIG1pZCA9IFtdO1xuICAgICAgICAgICAgICAgIHZhciBwLCBwbWF4O1xuICAgICAgICAgICAgICAgIGlmIChvcHRpb25zLmNsb3NlZF9wb2x5Z29uID09IHRydWUpIHtcbiAgICAgICAgICAgICAgICAgICAgcCA9IDA7IC8vIHN0YXJ0IG9uIGZpcnN0IHBvaW50XG4gICAgICAgICAgICAgICAgICAgIHBtYXggPSBsaW5lLmxlbmd0aCAtIDE7XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgIC8vIEZvciBvcGVuIHBvbHlnb25zLCBza2lwIGZpcnN0IG1pZHBvaW50IGFuZCB1c2UgbGluZSBzdGFydCBpbnN0ZWFkXG4gICAgICAgICAgICAgICAgZWxzZSB7XG4gICAgICAgICAgICAgICAgICAgIHAgPSAxOyAvLyBzdGFydCBvbiBzZWNvbmQgcG9pbnRcbiAgICAgICAgICAgICAgICAgICAgcG1heCA9IGxpbmUubGVuZ3RoIC0gMjtcbiAgICAgICAgICAgICAgICAgICAgbWlkLnB1c2gobGluZVswXSk7IC8vIHVzZSBsaW5lIHN0YXJ0IGluc3RlYWQgb2YgZmlyc3QgbWlkcG9pbnRcbiAgICAgICAgICAgICAgICB9XG5cbiAgICAgICAgICAgICAgICAvLyBDYWxjIG1pZHBvaW50c1xuICAgICAgICAgICAgICAgIGZvciAoOyBwIDwgcG1heDsgcCsrKSB7XG4gICAgICAgICAgICAgICAgICAgIHZhciBwYSA9IGxpbmVbcF07XG4gICAgICAgICAgICAgICAgICAgIHZhciBwYiA9IGxpbmVbcCsxXTtcbiAgICAgICAgICAgICAgICAgICAgbWlkLnB1c2goWyhwYVswXSArIHBiWzBdKSAvIDIsIChwYVsxXSArIHBiWzFdKSAvIDJdKTtcbiAgICAgICAgICAgICAgICB9XG5cbiAgICAgICAgICAgICAgICAvLyBTYW1lIGNsb3NlZC9vcGVuIHBvbHlnb24gbG9naWMgYXMgYWJvdmU6IGtlZXAgbGFzdCBtaWRwb2ludCBmb3IgY2xvc2VkLCBza2lwIGZvciBvcGVuXG4gICAgICAgICAgICAgICAgdmFyIG1tYXg7XG4gICAgICAgICAgICAgICAgaWYgKG9wdGlvbnMuY2xvc2VkX3BvbHlnb24gPT0gdHJ1ZSkge1xuICAgICAgICAgICAgICAgICAgICBtbWF4ID0gbWlkLmxlbmd0aDtcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgZWxzZSB7XG4gICAgICAgICAgICAgICAgICAgIG1pZC5wdXNoKGxpbmVbbGluZS5sZW5ndGgtMV0pOyAvLyB1c2UgbGluZSBlbmQgaW5zdGVhZCBvZiBsYXN0IG1pZHBvaW50XG4gICAgICAgICAgICAgICAgICAgIG1tYXggPSBtaWQubGVuZ3RoIC0gMTtcbiAgICAgICAgICAgICAgICB9XG5cbiAgICAgICAgICAgICAgICAvLyBNYWtlIGFuY2hvcnMgYnkgY29ubmVjdGluZyBtaWRwb2ludHMgdG8gbGluZSBqb2ludHNcbiAgICAgICAgICAgICAgICBmb3IgKHA9MDsgcCA8IG1tYXg7IHArKykgIHtcbiAgICAgICAgICAgICAgICAgICAgYW5jaG9ycy5wdXNoKFttaWRbcF0sIGxpbmVbKHArMSkgJSBsaW5lLmxlbmd0aF0sIG1pZFsocCsxKSAlIG1pZC5sZW5ndGhdXSk7XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgfVxuICAgICAgICAgICAgZWxzZSB7XG4gICAgICAgICAgICAgICAgLy8gRGVnZW5lcmF0ZSBjYXNlLCBhIDMtcG9pbnQgbGluZSBpcyBqdXN0IGEgc2luZ2xlIGFuY2hvclxuICAgICAgICAgICAgICAgIGFuY2hvcnMgPSBbW2xpbmVbMF0sIGxpbmVbMV0sIGxpbmVbMl1dXTtcbiAgICAgICAgICAgIH1cblxuICAgICAgICAgICAgZm9yICh2YXIgcD0wOyBwIDwgYW5jaG9ycy5sZW5ndGg7IHArKykge1xuICAgICAgICAgICAgICAgIGlmICghb3B0aW9ucy5yZW1vdmVfdGlsZV9lZGdlcykge1xuICAgICAgICAgICAgICAgICAgICBidWlsZEFuY2hvcihhbmNob3JzW3BdWzBdLCBhbmNob3JzW3BdWzFdLCBhbmNob3JzW3BdWzJdKTtcbiAgICAgICAgICAgICAgICAgICAgLy8gYnVpbGRTZWdtZW50KGFuY2hvcnNbcF1bMF0sIGFuY2hvcnNbcF1bMV0pOyAvLyB1c2UgdGhlc2UgdG8gZHJhdyBleHRydWRlZCBzZWdtZW50cyB3L28gam9pbiwgZm9yIGRlYnVnZ2luZ1xuICAgICAgICAgICAgICAgICAgICAvLyBidWlsZFNlZ21lbnQoYW5jaG9yc1twXVsxXSwgYW5jaG9yc1twXVsyXSk7XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgIGVsc2Uge1xuICAgICAgICAgICAgICAgICAgICB2YXIgZWRnZTEgPSBHTEJ1aWxkZXJzLmlzT25UaWxlRWRnZShhbmNob3JzW3BdWzBdLCBhbmNob3JzW3BdWzFdKTtcbiAgICAgICAgICAgICAgICAgICAgdmFyIGVkZ2UyID0gR0xCdWlsZGVycy5pc09uVGlsZUVkZ2UoYW5jaG9yc1twXVsxXSwgYW5jaG9yc1twXVsyXSk7XG4gICAgICAgICAgICAgICAgICAgIGlmICghZWRnZTEgJiYgIWVkZ2UyKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICBidWlsZEFuY2hvcihhbmNob3JzW3BdWzBdLCBhbmNob3JzW3BdWzFdLCBhbmNob3JzW3BdWzJdKTtcbiAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgICAgICBlbHNlIGlmICghZWRnZTEpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgIGJ1aWxkU2VnbWVudChhbmNob3JzW3BdWzBdLCBhbmNob3JzW3BdWzFdKTtcbiAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgICAgICBlbHNlIGlmICghZWRnZTIpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgIGJ1aWxkU2VnbWVudChhbmNob3JzW3BdWzFdLCBhbmNob3JzW3BdWzJdKTtcbiAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgIH1cbiAgICAgICAgfVxuICAgICAgICAvLyBTaW5nbGUgMi1wb2ludCBzZWdtZW50XG4gICAgICAgIGVsc2UgaWYgKGxpbmUubGVuZ3RoID09IDIpIHtcbiAgICAgICAgICAgIGJ1aWxkU2VnbWVudChsaW5lWzBdLCBsaW5lWzFdKTsgLy8gVE9ETzogcmVwbGFjZSBidWlsZFNlZ21lbnQgd2l0aCBhIGRlZ2VuZXJhdGUgZm9ybSBvZiBidWlsZEFuY2hvcj8gYnVpbGRTZWdtZW50IGlzIHN0aWxsIHVzZWZ1bCBmb3IgZGVidWdnaW5nXG4gICAgICAgIH1cbiAgICB9O1xuXG4gICAgR0wuYWRkVmVydGljZXModmVydGljZXMsIHZlcnRleF9jb25zdGFudHMsIHZlcnRleF9kYXRhKTtcblxuICAgIC8vIEJ1aWxkIHRyaWFuZ2xlcyBmb3IgYSBzaW5nbGUgbGluZSBzZWdtZW50LCBleHRydWRlZCBieSB0aGUgcHJvdmlkZWQgd2lkdGhcbiAgICBmdW5jdGlvbiBidWlsZFNlZ21lbnQgKHBhLCBwYikge1xuICAgICAgICB2YXIgc2xvcGUgPSBWZWN0b3Iubm9ybWFsaXplKFsocGJbMV0gLSBwYVsxXSkgKiAtMSwgcGJbMF0gLSBwYVswXV0pO1xuXG4gICAgICAgIHZhciBwYV9vdXRlciA9IFtwYVswXSArIHNsb3BlWzBdICogd2lkdGgvMiwgcGFbMV0gKyBzbG9wZVsxXSAqIHdpZHRoLzJdO1xuICAgICAgICB2YXIgcGFfaW5uZXIgPSBbcGFbMF0gLSBzbG9wZVswXSAqIHdpZHRoLzIsIHBhWzFdIC0gc2xvcGVbMV0gKiB3aWR0aC8yXTtcblxuICAgICAgICB2YXIgcGJfb3V0ZXIgPSBbcGJbMF0gKyBzbG9wZVswXSAqIHdpZHRoLzIsIHBiWzFdICsgc2xvcGVbMV0gKiB3aWR0aC8yXTtcbiAgICAgICAgdmFyIHBiX2lubmVyID0gW3BiWzBdIC0gc2xvcGVbMF0gKiB3aWR0aC8yLCBwYlsxXSAtIHNsb3BlWzFdICogd2lkdGgvMl07XG5cbiAgICAgICAgdmVydGljZXMucHVzaChcbiAgICAgICAgICAgIHBiX2lubmVyLCBwYl9vdXRlciwgcGFfaW5uZXIsXG4gICAgICAgICAgICBwYV9pbm5lciwgcGJfb3V0ZXIsIHBhX291dGVyXG4gICAgICAgICk7XG4gICAgfVxuXG4gICAgLy8gQnVpbGQgdHJpYW5nbGVzIGZvciBhIDMtcG9pbnQgJ2FuY2hvcicgc2hhcGUsIGNvbnNpc3Rpbmcgb2YgdHdvIGxpbmUgc2VnbWVudHMgd2l0aCBhIGpvaW50XG4gICAgLy8gVE9ETzogbW92ZSB0aGVzZSBmdW5jdGlvbnMgb3V0IG9mIGNsb3N1cmVzP1xuICAgIGZ1bmN0aW9uIGJ1aWxkQW5jaG9yIChwYSwgam9pbnQsIHBiKSB7XG4gICAgICAgIC8vIElubmVyIGFuZCBvdXRlciBsaW5lIHNlZ21lbnRzIGZvciBbcGEsIGpvaW50XSBhbmQgW2pvaW50LCBwYl1cbiAgICAgICAgdmFyIHBhX3Nsb3BlID0gVmVjdG9yLm5vcm1hbGl6ZShbKGpvaW50WzFdIC0gcGFbMV0pICogLTEsIGpvaW50WzBdIC0gcGFbMF1dKTtcbiAgICAgICAgdmFyIHBhX291dGVyID0gW1xuICAgICAgICAgICAgW3BhWzBdICsgcGFfc2xvcGVbMF0gKiB3aWR0aC8yLCBwYVsxXSArIHBhX3Nsb3BlWzFdICogd2lkdGgvMl0sXG4gICAgICAgICAgICBbam9pbnRbMF0gKyBwYV9zbG9wZVswXSAqIHdpZHRoLzIsIGpvaW50WzFdICsgcGFfc2xvcGVbMV0gKiB3aWR0aC8yXVxuICAgICAgICBdO1xuICAgICAgICB2YXIgcGFfaW5uZXIgPSBbXG4gICAgICAgICAgICBbcGFbMF0gLSBwYV9zbG9wZVswXSAqIHdpZHRoLzIsIHBhWzFdIC0gcGFfc2xvcGVbMV0gKiB3aWR0aC8yXSxcbiAgICAgICAgICAgIFtqb2ludFswXSAtIHBhX3Nsb3BlWzBdICogd2lkdGgvMiwgam9pbnRbMV0gLSBwYV9zbG9wZVsxXSAqIHdpZHRoLzJdXG4gICAgICAgIF07XG5cbiAgICAgICAgdmFyIHBiX3Nsb3BlID0gVmVjdG9yLm5vcm1hbGl6ZShbKHBiWzFdIC0gam9pbnRbMV0pICogLTEsIHBiWzBdIC0gam9pbnRbMF1dKTtcbiAgICAgICAgdmFyIHBiX291dGVyID0gW1xuICAgICAgICAgICAgW2pvaW50WzBdICsgcGJfc2xvcGVbMF0gKiB3aWR0aC8yLCBqb2ludFsxXSArIHBiX3Nsb3BlWzFdICogd2lkdGgvMl0sXG4gICAgICAgICAgICBbcGJbMF0gKyBwYl9zbG9wZVswXSAqIHdpZHRoLzIsIHBiWzFdICsgcGJfc2xvcGVbMV0gKiB3aWR0aC8yXVxuICAgICAgICBdO1xuICAgICAgICB2YXIgcGJfaW5uZXIgPSBbXG4gICAgICAgICAgICBbam9pbnRbMF0gLSBwYl9zbG9wZVswXSAqIHdpZHRoLzIsIGpvaW50WzFdIC0gcGJfc2xvcGVbMV0gKiB3aWR0aC8yXSxcbiAgICAgICAgICAgIFtwYlswXSAtIHBiX3Nsb3BlWzBdICogd2lkdGgvMiwgcGJbMV0gLSBwYl9zbG9wZVsxXSAqIHdpZHRoLzJdXG4gICAgICAgIF07XG5cbiAgICAgICAgLy8gTWl0ZXIgam9pbiAtIHNvbHZlIGZvciB0aGUgaW50ZXJzZWN0aW9uIGJldHdlZW4gdGhlIHR3byBvdXRlciBsaW5lIHNlZ21lbnRzXG4gICAgICAgIHZhciBpbnRlcnNlY3Rpb24gPSBWZWN0b3IubGluZUludGVyc2VjdGlvbihwYV9vdXRlclswXSwgcGFfb3V0ZXJbMV0sIHBiX291dGVyWzBdLCBwYl9vdXRlclsxXSk7XG4gICAgICAgIHZhciBsaW5lX2RlYnVnID0gbnVsbDtcbiAgICAgICAgaWYgKGludGVyc2VjdGlvbiAhPSBudWxsKSB7XG4gICAgICAgICAgICB2YXIgaW50ZXJzZWN0X291dGVyID0gaW50ZXJzZWN0aW9uO1xuXG4gICAgICAgICAgICAvLyBDYXAgdGhlIGludGVyc2VjdGlvbiBwb2ludCB0byBhIHJlYXNvbmFibGUgZGlzdGFuY2UgKGFzIGpvaW4gYW5nbGUgYmVjb21lcyBzaGFycGVyLCBtaXRlciBqb2ludCBkaXN0YW5jZSB3b3VsZCBhcHByb2FjaCBpbmZpbml0eSlcbiAgICAgICAgICAgIHZhciBsZW5fc3EgPSBWZWN0b3IubGVuZ3RoU3EoW2ludGVyc2VjdF9vdXRlclswXSAtIGpvaW50WzBdLCBpbnRlcnNlY3Rfb3V0ZXJbMV0gLSBqb2ludFsxXV0pO1xuICAgICAgICAgICAgdmFyIG1pdGVyX2xlbl9tYXggPSAzOyAvLyBtdWx0aXBsaWVyIG9uIGxpbmUgd2lkdGggZm9yIG1heCBkaXN0YW5jZSBtaXRlciBqb2luIGNhbiBiZSBmcm9tIGpvaW50XG4gICAgICAgICAgICBpZiAobGVuX3NxID4gKHdpZHRoICogd2lkdGggKiBtaXRlcl9sZW5fbWF4ICogbWl0ZXJfbGVuX21heCkpIHtcbiAgICAgICAgICAgICAgICBsaW5lX2RlYnVnID0gJ2Rpc3RhbmNlJztcbiAgICAgICAgICAgICAgICBpbnRlcnNlY3Rfb3V0ZXIgPSBWZWN0b3Iubm9ybWFsaXplKFtpbnRlcnNlY3Rfb3V0ZXJbMF0gLSBqb2ludFswXSwgaW50ZXJzZWN0X291dGVyWzFdIC0gam9pbnRbMV1dKTtcbiAgICAgICAgICAgICAgICBpbnRlcnNlY3Rfb3V0ZXIgPSBbXG4gICAgICAgICAgICAgICAgICAgIGpvaW50WzBdICsgaW50ZXJzZWN0X291dGVyWzBdICogbWl0ZXJfbGVuX21heCxcbiAgICAgICAgICAgICAgICAgICAgam9pbnRbMV0gKyBpbnRlcnNlY3Rfb3V0ZXJbMV0gKiBtaXRlcl9sZW5fbWF4XG4gICAgICAgICAgICAgICAgXVxuICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICB2YXIgaW50ZXJzZWN0X2lubmVyID0gW1xuICAgICAgICAgICAgICAgIChqb2ludFswXSAtIGludGVyc2VjdF9vdXRlclswXSkgKyBqb2ludFswXSxcbiAgICAgICAgICAgICAgICAoam9pbnRbMV0gLSBpbnRlcnNlY3Rfb3V0ZXJbMV0pICsgam9pbnRbMV1cbiAgICAgICAgICAgIF07XG5cbiAgICAgICAgICAgIHZlcnRpY2VzLnB1c2goXG4gICAgICAgICAgICAgICAgaW50ZXJzZWN0X2lubmVyLCBpbnRlcnNlY3Rfb3V0ZXIsIHBhX2lubmVyWzBdLFxuICAgICAgICAgICAgICAgIHBhX2lubmVyWzBdLCBpbnRlcnNlY3Rfb3V0ZXIsIHBhX291dGVyWzBdLFxuXG4gICAgICAgICAgICAgICAgcGJfaW5uZXJbMV0sIHBiX291dGVyWzFdLCBpbnRlcnNlY3RfaW5uZXIsXG4gICAgICAgICAgICAgICAgaW50ZXJzZWN0X2lubmVyLCBwYl9vdXRlclsxXSwgaW50ZXJzZWN0X291dGVyXG4gICAgICAgICAgICApO1xuICAgICAgICB9XG4gICAgICAgIGVsc2Uge1xuICAgICAgICAgICAgLy8gTGluZSBzZWdtZW50cyBhcmUgcGFyYWxsZWwsIHVzZSB0aGUgZmlyc3Qgb3V0ZXIgbGluZSBzZWdtZW50IGFzIGpvaW4gaW5zdGVhZFxuICAgICAgICAgICAgbGluZV9kZWJ1ZyA9ICdwYXJhbGxlbCc7XG4gICAgICAgICAgICBwYV9pbm5lclsxXSA9IHBiX2lubmVyWzBdO1xuICAgICAgICAgICAgcGFfb3V0ZXJbMV0gPSBwYl9vdXRlclswXTtcblxuICAgICAgICAgICAgdmVydGljZXMucHVzaChcbiAgICAgICAgICAgICAgICBwYV9pbm5lclsxXSwgcGFfb3V0ZXJbMV0sIHBhX2lubmVyWzBdLFxuICAgICAgICAgICAgICAgIHBhX2lubmVyWzBdLCBwYV9vdXRlclsxXSwgcGFfb3V0ZXJbMF0sXG5cbiAgICAgICAgICAgICAgICBwYl9pbm5lclsxXSwgcGJfb3V0ZXJbMV0sIHBiX2lubmVyWzBdLFxuICAgICAgICAgICAgICAgIHBiX2lubmVyWzBdLCBwYl9vdXRlclsxXSwgcGJfb3V0ZXJbMF1cbiAgICAgICAgICAgICk7XG4gICAgICAgIH1cblxuICAgICAgICAvLyBFeHRydWRlZCBpbm5lci9vdXRlciBlZGdlcyAtIGRlYnVnZ2luZ1xuICAgICAgICBpZiAoR0xCdWlsZGVycy5kZWJ1ZyAmJiBvcHRpb25zLnZlcnRleF9saW5lcykge1xuICAgICAgICAgICAgb3B0aW9ucy52ZXJ0ZXhfbGluZXMucHVzaChcbiAgICAgICAgICAgICAgICBwYV9pbm5lclswXVswXSwgcGFfaW5uZXJbMF1bMV0sIHogKyAwLjAwMSwgMCwgMCwgMSwgMCwgMS4wLCAwLFxuICAgICAgICAgICAgICAgIHBhX2lubmVyWzFdWzBdLCBwYV9pbm5lclsxXVsxXSwgeiArIDAuMDAxLCAwLCAwLCAxLCAwLCAxLjAsIDAsXG5cbiAgICAgICAgICAgICAgICBwYl9pbm5lclswXVswXSwgcGJfaW5uZXJbMF1bMV0sIHogKyAwLjAwMSwgMCwgMCwgMSwgMCwgMS4wLCAwLFxuICAgICAgICAgICAgICAgIHBiX2lubmVyWzFdWzBdLCBwYl9pbm5lclsxXVsxXSwgeiArIDAuMDAxLCAwLCAwLCAxLCAwLCAxLjAsIDAsXG5cbiAgICAgICAgICAgICAgICBwYV9vdXRlclswXVswXSwgcGFfb3V0ZXJbMF1bMV0sIHogKyAwLjAwMSwgMCwgMCwgMSwgMCwgMS4wLCAwLFxuICAgICAgICAgICAgICAgIHBhX291dGVyWzFdWzBdLCBwYV9vdXRlclsxXVsxXSwgeiArIDAuMDAxLCAwLCAwLCAxLCAwLCAxLjAsIDAsXG5cbiAgICAgICAgICAgICAgICBwYl9vdXRlclswXVswXSwgcGJfb3V0ZXJbMF1bMV0sIHogKyAwLjAwMSwgMCwgMCwgMSwgMCwgMS4wLCAwLFxuICAgICAgICAgICAgICAgIHBiX291dGVyWzFdWzBdLCBwYl9vdXRlclsxXVsxXSwgeiArIDAuMDAxLCAwLCAwLCAxLCAwLCAxLjAsIDAsXG5cbiAgICAgICAgICAgICAgICBwYV9pbm5lclswXVswXSwgcGFfaW5uZXJbMF1bMV0sIHogKyAwLjAwMSwgMCwgMCwgMSwgMCwgMS4wLCAwLFxuICAgICAgICAgICAgICAgIHBhX291dGVyWzBdWzBdLCBwYV9vdXRlclswXVsxXSwgeiArIDAuMDAxLCAwLCAwLCAxLCAwLCAxLjAsIDAsXG5cbiAgICAgICAgICAgICAgICBwYV9pbm5lclsxXVswXSwgcGFfaW5uZXJbMV1bMV0sIHogKyAwLjAwMSwgMCwgMCwgMSwgMCwgMS4wLCAwLFxuICAgICAgICAgICAgICAgIHBhX291dGVyWzFdWzBdLCBwYV9vdXRlclsxXVsxXSwgeiArIDAuMDAxLCAwLCAwLCAxLCAwLCAxLjAsIDAsXG5cbiAgICAgICAgICAgICAgICBwYl9pbm5lclswXVswXSwgcGJfaW5uZXJbMF1bMV0sIHogKyAwLjAwMSwgMCwgMCwgMSwgMCwgMS4wLCAwLFxuICAgICAgICAgICAgICAgIHBiX291dGVyWzBdWzBdLCBwYl9vdXRlclswXVsxXSwgeiArIDAuMDAxLCAwLCAwLCAxLCAwLCAxLjAsIDAsXG5cbiAgICAgICAgICAgICAgICBwYl9pbm5lclsxXVswXSwgcGJfaW5uZXJbMV1bMV0sIHogKyAwLjAwMSwgMCwgMCwgMSwgMCwgMS4wLCAwLFxuICAgICAgICAgICAgICAgIHBiX291dGVyWzFdWzBdLCBwYl9vdXRlclsxXVsxXSwgeiArIDAuMDAxLCAwLCAwLCAxLCAwLCAxLjAsIDBcbiAgICAgICAgICAgICk7XG4gICAgICAgIH1cblxuICAgICAgICBpZiAoR0xCdWlsZGVycy5kZWJ1ZyAmJiBsaW5lX2RlYnVnICYmIG9wdGlvbnMudmVydGV4X2xpbmVzKSB7XG4gICAgICAgICAgICB2YXIgZGNvbG9yO1xuICAgICAgICAgICAgaWYgKGxpbmVfZGVidWcgPT0gJ3BhcmFsbGVsJykge1xuICAgICAgICAgICAgICAgIC8vIGNvbnNvbGUubG9nKFwiISEhIGxpbmVzIGFyZSBwYXJhbGxlbCAhISFcIik7XG4gICAgICAgICAgICAgICAgZGNvbG9yID0gWzAsIDEsIDBdO1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgZWxzZSBpZiAobGluZV9kZWJ1ZyA9PSAnZGlzdGFuY2UnKSB7XG4gICAgICAgICAgICAgICAgLy8gY29uc29sZS5sb2coXCIhISEgbWl0ZXIgaW50ZXJzZWN0aW9uIHBvaW50IGV4Y2VlZGVkIGFsbG93ZWQgZGlzdGFuY2UgZnJvbSBqb2ludCAhISFcIik7XG4gICAgICAgICAgICAgICAgZGNvbG9yID0gWzEsIDAsIDBdO1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgLy8gY29uc29sZS5sb2coJ09TTSBpZDogJyArIGZlYXR1cmUuaWQpOyAvLyBUT0RPOiBpZiB0aGlzIGZ1bmN0aW9uIGlzIG1vdmVkIG91dCBvZiBhIGNsb3N1cmUsIHRoaXMgZmVhdHVyZSBkZWJ1ZyBpbmZvIHdvbid0IGJlIGF2YWlsYWJsZVxuICAgICAgICAgICAgLy8gY29uc29sZS5sb2coW3BhLCBqb2ludCwgcGJdKTtcbiAgICAgICAgICAgIC8vIGNvbnNvbGUubG9nKGZlYXR1cmUpO1xuICAgICAgICAgICAgb3B0aW9ucy52ZXJ0ZXhfbGluZXMucHVzaChcbiAgICAgICAgICAgICAgICBwYVswXSwgcGFbMV0sIHogKyAwLjAwMixcbiAgICAgICAgICAgICAgICAwLCAwLCAxLCBkY29sb3JbMF0sIGRjb2xvclsxXSwgZGNvbG9yWzJdLFxuICAgICAgICAgICAgICAgIGpvaW50WzBdLCBqb2ludFsxXSwgeiArIDAuMDAyLFxuICAgICAgICAgICAgICAgIDAsIDAsIDEsIGRjb2xvclswXSwgZGNvbG9yWzFdLCBkY29sb3JbMl0sXG4gICAgICAgICAgICAgICAgam9pbnRbMF0sIGpvaW50WzFdLCB6ICsgMC4wMDIsXG4gICAgICAgICAgICAgICAgMCwgMCwgMSwgZGNvbG9yWzBdLCBkY29sb3JbMV0sIGRjb2xvclsyXSxcbiAgICAgICAgICAgICAgICBwYlswXSwgcGJbMV0sIHogKyAwLjAwMixcbiAgICAgICAgICAgICAgICAwLCAwLCAxLCBkY29sb3JbMF0sIGRjb2xvclsxXSwgZGNvbG9yWzJdXG4gICAgICAgICAgICApO1xuXG4gICAgICAgICAgICB2YXIgbnVtX2xpbmVzID0gbGluZXMubGVuZ3RoO1xuICAgICAgICAgICAgZm9yICh2YXIgbG49MDsgbG4gPCBudW1fbGluZXM7IGxuKyspIHtcbiAgICAgICAgICAgICAgICB2YXIgbGluZTIgPSBsaW5lc1tsbl07XG5cbiAgICAgICAgICAgICAgICBmb3IgKHZhciBwPTA7IHAgPCBsaW5lMi5sZW5ndGggLSAxOyBwKyspIHtcbiAgICAgICAgICAgICAgICAgICAgLy8gUG9pbnQgQSB0byBCXG4gICAgICAgICAgICAgICAgICAgIHZhciBwYSA9IGxpbmUyW3BdO1xuICAgICAgICAgICAgICAgICAgICB2YXIgcGIgPSBsaW5lMltwKzFdO1xuXG4gICAgICAgICAgICAgICAgICAgIG9wdGlvbnMudmVydGV4X2xpbmVzLnB1c2goXG4gICAgICAgICAgICAgICAgICAgICAgICBwYVswXSwgcGFbMV0sIHogKyAwLjAwMDUsXG4gICAgICAgICAgICAgICAgICAgICAgICAwLCAwLCAxLCAwLCAwLCAxLjAsXG4gICAgICAgICAgICAgICAgICAgICAgICBwYlswXSwgcGJbMV0sIHogKyAwLjAwMDUsXG4gICAgICAgICAgICAgICAgICAgICAgICAwLCAwLCAxLCAwLCAwLCAxLjBcbiAgICAgICAgICAgICAgICAgICAgKTtcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICB9O1xuICAgICAgICB9XG4gICAgfVxuXG4gICAgcmV0dXJuIHZlcnRleF9kYXRhO1xufTtcblxuLy8gQnVpbGQgYSBxdWFkIGNlbnRlcmVkIG9uIGEgcG9pbnRcbi8vIFogY29vcmQsIG5vcm1hbHMsIGFuZCB0ZXhjb29yZHMgYXJlIG9wdGlvbmFsXG4vLyBMYXlvdXQgb3JkZXIgaXM6XG4vLyAgIHBvc2l0aW9uICgyIG9yIDMgY29tcG9uZW50cylcbi8vICAgdGV4Y29vcmQgKG9wdGlvbmFsLCAyIGNvbXBvbmVudHMpXG4vLyAgIG5vcm1hbCAob3B0aW9uYWwsIDMgY29tcG9uZW50cylcbi8vICAgY29uc3RhbnRzIChvcHRpb25hbClcbkdMQnVpbGRlcnMuYnVpbGRRdWFkc0ZvclBvaW50cyA9IGZ1bmN0aW9uIChwb2ludHMsIHdpZHRoLCBoZWlnaHQsIHosIHZlcnRleF9kYXRhLCBvcHRpb25zKVxue1xuICAgIHZhciBvcHRpb25zID0gb3B0aW9ucyB8fCB7fTtcblxuICAgIHZhciB2ZXJ0ZXhfY29uc3RhbnRzID0gW107XG4gICAgaWYgKG9wdGlvbnMubm9ybWFscykge1xuICAgICAgICB2ZXJ0ZXhfY29uc3RhbnRzLnB1c2goMCwgMCwgMSk7IC8vIHVwd2FyZHMtZmFjaW5nIG5vcm1hbFxuICAgIH1cbiAgICBpZiAob3B0aW9ucy52ZXJ0ZXhfY29uc3RhbnRzKSB7XG4gICAgICAgIHZlcnRleF9jb25zdGFudHMucHVzaC5hcHBseSh2ZXJ0ZXhfY29uc3RhbnRzLCBvcHRpb25zLnZlcnRleF9jb25zdGFudHMpO1xuICAgIH1cbiAgICBpZiAodmVydGV4X2NvbnN0YW50cy5sZW5ndGggPT0gMCkge1xuICAgICAgICB2ZXJ0ZXhfY29uc3RhbnRzID0gbnVsbDtcbiAgICB9XG5cbiAgICB2YXIgbnVtX3BvaW50cyA9IHBvaW50cy5sZW5ndGg7XG4gICAgZm9yICh2YXIgcD0wOyBwIDwgbnVtX3BvaW50czsgcCsrKSB7XG4gICAgICAgIHZhciBwb2ludCA9IHBvaW50c1twXTtcblxuICAgICAgICB2YXIgcG9zaXRpb25zID0gW1xuICAgICAgICAgICAgW3BvaW50WzBdIC0gd2lkdGgvMiwgcG9pbnRbMV0gLSBoZWlnaHQvMl0sXG4gICAgICAgICAgICBbcG9pbnRbMF0gKyB3aWR0aC8yLCBwb2ludFsxXSAtIGhlaWdodC8yXSxcbiAgICAgICAgICAgIFtwb2ludFswXSArIHdpZHRoLzIsIHBvaW50WzFdICsgaGVpZ2h0LzJdLFxuXG4gICAgICAgICAgICBbcG9pbnRbMF0gLSB3aWR0aC8yLCBwb2ludFsxXSAtIGhlaWdodC8yXSxcbiAgICAgICAgICAgIFtwb2ludFswXSArIHdpZHRoLzIsIHBvaW50WzFdICsgaGVpZ2h0LzJdLFxuICAgICAgICAgICAgW3BvaW50WzBdIC0gd2lkdGgvMiwgcG9pbnRbMV0gKyBoZWlnaHQvMl0sXG4gICAgICAgIF07XG5cbiAgICAgICAgLy8gQWRkIHByb3ZpZGVkIHpcbiAgICAgICAgaWYgKHogIT0gbnVsbCkge1xuICAgICAgICAgICAgcG9zaXRpb25zWzBdWzJdID0gejtcbiAgICAgICAgICAgIHBvc2l0aW9uc1sxXVsyXSA9IHo7XG4gICAgICAgICAgICBwb3NpdGlvbnNbMl1bMl0gPSB6O1xuICAgICAgICAgICAgcG9zaXRpb25zWzNdWzJdID0gejtcbiAgICAgICAgICAgIHBvc2l0aW9uc1s0XVsyXSA9IHo7XG4gICAgICAgICAgICBwb3NpdGlvbnNbNV1bMl0gPSB6O1xuICAgICAgICB9XG5cbiAgICAgICAgaWYgKG9wdGlvbnMudGV4Y29vcmRzID09IHRydWUpIHtcbiAgICAgICAgICAgIHZhciB0ZXhjb29yZHMgPSBbXG4gICAgICAgICAgICAgICAgWy0xLCAtMV0sXG4gICAgICAgICAgICAgICAgWzEsIC0xXSxcbiAgICAgICAgICAgICAgICBbMSwgMV0sXG5cbiAgICAgICAgICAgICAgICBbLTEsIC0xXSxcbiAgICAgICAgICAgICAgICBbMSwgMV0sXG4gICAgICAgICAgICAgICAgWy0xLCAxXVxuICAgICAgICAgICAgXTtcblxuICAgICAgICAgICAgR0wuYWRkVmVydGljZXNNdWx0aXBsZUF0dHJpYnV0ZXMoW3Bvc2l0aW9ucywgdGV4Y29vcmRzXSwgdmVydGV4X2NvbnN0YW50cywgdmVydGV4X2RhdGEpO1xuICAgICAgICB9XG4gICAgICAgIGVsc2Uge1xuICAgICAgICAgICAgR0wuYWRkVmVydGljZXMocG9zaXRpb25zLCB2ZXJ0ZXhfY29uc3RhbnRzLCB2ZXJ0ZXhfZGF0YSk7XG4gICAgICAgIH1cbiAgICB9XG5cbiAgICByZXR1cm4gdmVydGV4X2RhdGE7XG59O1xuXG4vLyBDYWxsYmFjay1iYXNlIGJ1aWxkZXIgKGZvciBmdXR1cmUgZXhwbG9yYXRpb24pXG4vLyBHTEJ1aWxkZXJzLmJ1aWxkUXVhZHNGb3JQb2ludHMyID0gZnVuY3Rpb24gR0xCdWlsZGVyc0J1aWxkUXVhZHNGb3JQb2ludHMgKHBvaW50cywgd2lkdGgsIGhlaWdodCwgYWRkR2VvbWV0cnksIG9wdGlvbnMpXG4vLyB7XG4vLyAgICAgdmFyIG9wdGlvbnMgPSBvcHRpb25zIHx8IHt9O1xuXG4vLyAgICAgdmFyIG51bV9wb2ludHMgPSBwb2ludHMubGVuZ3RoO1xuLy8gICAgIGZvciAodmFyIHA9MDsgcCA8IG51bV9wb2ludHM7IHArKykge1xuLy8gICAgICAgICB2YXIgcG9pbnQgPSBwb2ludHNbcF07XG5cbi8vICAgICAgICAgdmFyIHBvc2l0aW9ucyA9IFtcbi8vICAgICAgICAgICAgIFtwb2ludFswXSAtIHdpZHRoLzIsIHBvaW50WzFdIC0gaGVpZ2h0LzJdLFxuLy8gICAgICAgICAgICAgW3BvaW50WzBdICsgd2lkdGgvMiwgcG9pbnRbMV0gLSBoZWlnaHQvMl0sXG4vLyAgICAgICAgICAgICBbcG9pbnRbMF0gKyB3aWR0aC8yLCBwb2ludFsxXSArIGhlaWdodC8yXSxcblxuLy8gICAgICAgICAgICAgW3BvaW50WzBdIC0gd2lkdGgvMiwgcG9pbnRbMV0gLSBoZWlnaHQvMl0sXG4vLyAgICAgICAgICAgICBbcG9pbnRbMF0gKyB3aWR0aC8yLCBwb2ludFsxXSArIGhlaWdodC8yXSxcbi8vICAgICAgICAgICAgIFtwb2ludFswXSAtIHdpZHRoLzIsIHBvaW50WzFdICsgaGVpZ2h0LzJdLFxuLy8gICAgICAgICBdO1xuXG4vLyAgICAgICAgIGlmIChvcHRpb25zLnRleGNvb3JkcyA9PSB0cnVlKSB7XG4vLyAgICAgICAgICAgICB2YXIgdGV4Y29vcmRzID0gW1xuLy8gICAgICAgICAgICAgICAgIFstMSwgLTFdLFxuLy8gICAgICAgICAgICAgICAgIFsxLCAtMV0sXG4vLyAgICAgICAgICAgICAgICAgWzEsIDFdLFxuXG4vLyAgICAgICAgICAgICAgICAgWy0xLCAtMV0sXG4vLyAgICAgICAgICAgICAgICAgWzEsIDFdLFxuLy8gICAgICAgICAgICAgICAgIFstMSwgMV1cbi8vICAgICAgICAgICAgIF07XG4vLyAgICAgICAgIH1cblxuLy8gICAgICAgICB2YXIgdmVydGljZXMgPSB7XG4vLyAgICAgICAgICAgICBwb3NpdGlvbnM6IHBvc2l0aW9ucyxcbi8vICAgICAgICAgICAgIG5vcm1hbHM6IChvcHRpb25zLm5vcm1hbHMgPyBbMCwgMCwgMV0gOiBudWxsKSxcbi8vICAgICAgICAgICAgIHRleGNvb3JkczogKG9wdGlvbnMudGV4Y29vcmRzICYmIHRleGNvb3Jkcylcbi8vICAgICAgICAgfTtcbi8vICAgICAgICAgYWRkR2VvbWV0cnkodmVydGljZXMpO1xuLy8gICAgIH1cbi8vIH07XG5cbi8vIEJ1aWxkIG5hdGl2ZSBHTCBsaW5lcyBmb3IgYSBwb2x5bGluZVxuR0xCdWlsZGVycy5idWlsZExpbmVzID0gZnVuY3Rpb24gR0xCdWlsZGVyc0J1aWxkTGluZXMgKGxpbmVzLCBmZWF0dXJlLCBsYXllciwgc3R5bGUsIHRpbGUsIHosIHZlcnRleF9kYXRhLCBvcHRpb25zKVxue1xuICAgIG9wdGlvbnMgPSBvcHRpb25zIHx8IHt9O1xuXG4gICAgdmFyIGNvbG9yID0gc3R5bGUuY29sb3I7XG4gICAgdmFyIHdpZHRoID0gc3R5bGUud2lkdGg7XG5cbiAgICB2YXIgbnVtX2xpbmVzID0gbGluZXMubGVuZ3RoO1xuICAgIGZvciAodmFyIGxuPTA7IGxuIDwgbnVtX2xpbmVzOyBsbisrKSB7XG4gICAgICAgIHZhciBsaW5lID0gbGluZXNbbG5dO1xuXG4gICAgICAgIGZvciAodmFyIHA9MDsgcCA8IGxpbmUubGVuZ3RoIC0gMTsgcCsrKSB7XG4gICAgICAgICAgICAvLyBQb2ludCBBIHRvIEJcbiAgICAgICAgICAgIHZhciBwYSA9IGxpbmVbcF07XG4gICAgICAgICAgICB2YXIgcGIgPSBsaW5lW3ArMV07XG5cbiAgICAgICAgICAgIHZlcnRleF9kYXRhLnB1c2goXG4gICAgICAgICAgICAgICAgLy8gUG9pbnQgQVxuICAgICAgICAgICAgICAgIHBhWzBdLCBwYVsxXSwgeixcbiAgICAgICAgICAgICAgICAwLCAwLCAxLCAvLyBmbGF0IHN1cmZhY2VzIHBvaW50IHN0cmFpZ2h0IHVwXG4gICAgICAgICAgICAgICAgY29sb3JbMF0sIGNvbG9yWzFdLCBjb2xvclsyXSxcbiAgICAgICAgICAgICAgICAvLyBQb2ludCBCXG4gICAgICAgICAgICAgICAgcGJbMF0sIHBiWzFdLCB6LFxuICAgICAgICAgICAgICAgIDAsIDAsIDEsIC8vIGZsYXQgc3VyZmFjZXMgcG9pbnQgc3RyYWlnaHQgdXBcbiAgICAgICAgICAgICAgICBjb2xvclswXSwgY29sb3JbMV0sIGNvbG9yWzJdXG4gICAgICAgICAgICApO1xuICAgICAgICB9XG4gICAgfTtcblxuICAgIHJldHVybiB2ZXJ0ZXhfZGF0YTtcbn07XG5cbi8qIFV0aWxpdHkgZnVuY3Rpb25zICovXG5cbi8vIFRlc3RzIGlmIGEgbGluZSBzZWdtZW50IChmcm9tIHBvaW50IEEgdG8gQikgaXMgbmVhcmx5IGNvaW5jaWRlbnQgd2l0aCB0aGUgZWRnZSBvZiBhIHRpbGVcbkdMQnVpbGRlcnMuaXNPblRpbGVFZGdlID0gZnVuY3Rpb24gKHBhLCBwYiwgb3B0aW9ucylcbntcbiAgICBvcHRpb25zID0gb3B0aW9ucyB8fCB7fTtcblxuICAgIHZhciB0b2xlcmFuY2VfZnVuY3Rpb24gPSBvcHRpb25zLnRvbGVyYW5jZV9mdW5jdGlvbiB8fCBHTEJ1aWxkZXJzLnZhbHVlc1dpdGhpblRvbGVyYW5jZTtcbiAgICB2YXIgdG9sZXJhbmNlID0gb3B0aW9ucy50b2xlcmFuY2UgfHwgMTsgLy8gdHdlYWsgdGhpcyBhZGp1c3QgaWYgY2F0Y2hpbmcgdG9vIGZldy9tYW55IGxpbmUgc2VnbWVudHMgbmVhciB0aWxlIGVkZ2VzXG4gICAgdmFyIHRpbGVfbWluID0gR0xCdWlsZGVycy50aWxlX2JvdW5kc1swXTtcbiAgICB2YXIgdGlsZV9tYXggPSBHTEJ1aWxkZXJzLnRpbGVfYm91bmRzWzFdO1xuICAgIHZhciBlZGdlID0gbnVsbDtcblxuICAgIGlmICh0b2xlcmFuY2VfZnVuY3Rpb24ocGFbMF0sIHRpbGVfbWluLngsIHRvbGVyYW5jZSkgJiYgdG9sZXJhbmNlX2Z1bmN0aW9uKHBiWzBdLCB0aWxlX21pbi54LCB0b2xlcmFuY2UpKSB7XG4gICAgICAgIGVkZ2UgPSAnbGVmdCc7XG4gICAgfVxuICAgIGVsc2UgaWYgKHRvbGVyYW5jZV9mdW5jdGlvbihwYVswXSwgdGlsZV9tYXgueCwgdG9sZXJhbmNlKSAmJiB0b2xlcmFuY2VfZnVuY3Rpb24ocGJbMF0sIHRpbGVfbWF4LngsIHRvbGVyYW5jZSkpIHtcbiAgICAgICAgZWRnZSA9ICdyaWdodCc7XG4gICAgfVxuICAgIGVsc2UgaWYgKHRvbGVyYW5jZV9mdW5jdGlvbihwYVsxXSwgdGlsZV9taW4ueSwgdG9sZXJhbmNlKSAmJiB0b2xlcmFuY2VfZnVuY3Rpb24ocGJbMV0sIHRpbGVfbWluLnksIHRvbGVyYW5jZSkpIHtcbiAgICAgICAgZWRnZSA9ICd0b3AnO1xuICAgIH1cbiAgICBlbHNlIGlmICh0b2xlcmFuY2VfZnVuY3Rpb24ocGFbMV0sIHRpbGVfbWF4LnksIHRvbGVyYW5jZSkgJiYgdG9sZXJhbmNlX2Z1bmN0aW9uKHBiWzFdLCB0aWxlX21heC55LCB0b2xlcmFuY2UpKSB7XG4gICAgICAgIGVkZ2UgPSAnYm90dG9tJztcbiAgICB9XG4gICAgcmV0dXJuIGVkZ2U7XG59O1xuXG5HTEJ1aWxkZXJzLnNldFRpbGVTY2FsZSA9IGZ1bmN0aW9uIChzY2FsZSlcbntcbiAgICBHTEJ1aWxkZXJzLnRpbGVfYm91bmRzID0gW1xuICAgICAgICBQb2ludCgwLCAwKSxcbiAgICAgICAgUG9pbnQoc2NhbGUsIC1zY2FsZSkgLy8gVE9ETzogY29ycmVjdCBmb3IgZmxpcHBlZCB5LWF4aXM/XG4gICAgXTtcbn07XG5cbkdMQnVpbGRlcnMudmFsdWVzV2l0aGluVG9sZXJhbmNlID0gZnVuY3Rpb24gKGEsIGIsIHRvbGVyYW5jZSlcbntcbiAgICB0b2xlcmFuY2UgPSB0b2xlcmFuY2UgfHwgMTtcbiAgICByZXR1cm4gKE1hdGguYWJzKGEgLSBiKSA8IHRvbGVyYW5jZSk7XG59O1xuXG4vLyBCdWlsZCBhIHppZ3phZyBsaW5lIHBhdHRlcm4gZm9yIHRlc3Rpbmcgam9pbnMgYW5kIGNhcHNcbkdMQnVpbGRlcnMuYnVpbGRaaWd6YWdMaW5lVGVzdFBhdHRlcm4gPSBmdW5jdGlvbiAoKVxue1xuICAgIHZhciBtaW4gPSBQb2ludCgwLCAwKTsgLy8gdGlsZS5taW47XG4gICAgdmFyIG1heCA9IFBvaW50KDQwOTYsIDQwOTYpOyAvLyB0aWxlLm1heDtcbiAgICB2YXIgZyA9IHtcbiAgICAgICAgaWQ6IDEyMyxcbiAgICAgICAgZ2VvbWV0cnk6IHtcbiAgICAgICAgICAgIHR5cGU6ICdMaW5lU3RyaW5nJyxcbiAgICAgICAgICAgIGNvb3JkaW5hdGVzOiBbXG4gICAgICAgICAgICAgICAgW21pbi54ICogMC43NSArIG1heC54ICogMC4yNSwgbWluLnkgKiAwLjc1ICsgbWF4LnkgKiAwLjI1XSxcbiAgICAgICAgICAgICAgICBbbWluLnggKiAwLjc1ICsgbWF4LnggKiAwLjI1LCBtaW4ueSAqIDAuNSArIG1heC55ICogMC41XSxcbiAgICAgICAgICAgICAgICBbbWluLnggKiAwLjI1ICsgbWF4LnggKiAwLjc1LCBtaW4ueSAqIDAuNzUgKyBtYXgueSAqIDAuMjVdLFxuICAgICAgICAgICAgICAgIFttaW4ueCAqIDAuMjUgKyBtYXgueCAqIDAuNzUsIG1pbi55ICogMC4yNSArIG1heC55ICogMC43NV0sXG4gICAgICAgICAgICAgICAgW21pbi54ICogMC40ICsgbWF4LnggKiAwLjYsIG1pbi55ICogMC41ICsgbWF4LnkgKiAwLjVdLFxuICAgICAgICAgICAgICAgIFttaW4ueCAqIDAuNSArIG1heC54ICogMC41LCBtaW4ueSAqIDAuMjUgKyBtYXgueSAqIDAuNzVdLFxuICAgICAgICAgICAgICAgIFttaW4ueCAqIDAuNzUgKyBtYXgueCAqIDAuMjUsIG1pbi55ICogMC4yNSArIG1heC55ICogMC43NV0sXG4gICAgICAgICAgICAgICAgW21pbi54ICogMC43NSArIG1heC54ICogMC4yNSwgbWluLnkgKiAwLjQgKyBtYXgueSAqIDAuNl1cbiAgICAgICAgICAgIF1cbiAgICAgICAgfSxcbiAgICAgICAgcHJvcGVydGllczoge1xuICAgICAgICAgICAga2luZDogJ2RlYnVnJ1xuICAgICAgICB9XG4gICAgfTtcbiAgICAvLyBjb25zb2xlLmxvZyhnLmdlb21ldHJ5LmNvb3JkaW5hdGVzKTtcbiAgICByZXR1cm4gZztcbn07XG4iLCIvKioqIE1hbmFnZSByZW5kZXJpbmcgZm9yIHByaW1pdGl2ZXMgKioqL1xuaW1wb3J0IHtHTH0gZnJvbSAnLi9nbCc7XG5pbXBvcnQgR0xWZXJ0ZXhMYXlvdXQgZnJvbSAnLi9nbF92ZXJ0ZXhfbGF5b3V0JztcbmltcG9ydCBHTFByb2dyYW0gZnJvbSAnLi9nbF9wcm9ncmFtJztcblxuLy8gQSBzaW5nbGUgbWVzaC9WQk8sIGRlc2NyaWJlZCBieSBhIHZlcnRleCBsYXlvdXQsIHRoYXQgY2FuIGJlIGRyYXduIHdpdGggb25lIG9yIG1vcmUgcHJvZ3JhbXNcbmV4cG9ydCBkZWZhdWx0IGZ1bmN0aW9uIEdMR2VvbWV0cnkgKGdsLCB2ZXJ0ZXhfZGF0YSwgdmVydGV4X2xheW91dCwgb3B0aW9ucylcbntcbiAgICBvcHRpb25zID0gb3B0aW9ucyB8fCB7fTtcblxuICAgIHRoaXMuZ2wgPSBnbDtcbiAgICB0aGlzLnZlcnRleF9kYXRhID0gdmVydGV4X2RhdGE7IC8vIEZsb2F0MzJBcnJheVxuICAgIHRoaXMudmVydGV4X2xheW91dCA9IHZlcnRleF9sYXlvdXQ7XG4gICAgdGhpcy5idWZmZXIgPSB0aGlzLmdsLmNyZWF0ZUJ1ZmZlcigpO1xuICAgIHRoaXMuZHJhd19tb2RlID0gb3B0aW9ucy5kcmF3X21vZGUgfHwgdGhpcy5nbC5UUklBTkdMRVM7XG4gICAgdGhpcy5kYXRhX3VzYWdlID0gb3B0aW9ucy5kYXRhX3VzYWdlIHx8IHRoaXMuZ2wuU1RBVElDX0RSQVc7XG4gICAgdGhpcy52ZXJ0aWNlc19wZXJfZ2VvbWV0cnkgPSAzOyAvLyBUT0RPOiBzdXBwb3J0IGxpbmVzLCBzdHJpcCwgZmFuLCBldGMuXG5cbiAgICB0aGlzLnZlcnRleF9jb3VudCA9IHRoaXMudmVydGV4X2RhdGEuYnl0ZUxlbmd0aCAvIHRoaXMudmVydGV4X2xheW91dC5zdHJpZGU7XG4gICAgdGhpcy5nZW9tZXRyeV9jb3VudCA9IHRoaXMudmVydGV4X2NvdW50IC8gdGhpcy52ZXJ0aWNlc19wZXJfZ2VvbWV0cnk7XG5cbiAgICAvLyBUT0RPOiBkaXNhYmxpbmcgVkFPcyBmb3Igbm93IGJlY2F1c2Ugd2UgbmVlZCB0byBzdXBwb3J0IGRpZmZlcmVudCB2ZXJ0ZXggbGF5b3V0ICsgcHJvZ3JhbSBjb21iaW5hdGlvbnMsXG4gICAgLy8gd2hlcmUgbm90IGFsbCBwcm9ncmFtcyB3aWxsIHJlY29nbml6ZSBhbGwgYXR0cmlidXRlcyAoZS5nLiBmZWF0dXJlIHNlbGVjdGlvbiBzaGFkZXJzIGluY2x1ZGUgZXh0cmEgYXR0cmliKS5cbiAgICAvLyBUbyBzdXBwb3J0IFZBT3MgaGVyZSwgd291bGQgbmVlZCB0byBzdXBwb3J0IG11bHRpcGxlIHBlciBnZW9tZXRyeSwga2V5ZWQgYnkgR0wgcHJvZ3JhbT9cbiAgICAvLyB0aGlzLnZhbyA9IEdMVmVydGV4QXJyYXlPYmplY3QuY3JlYXRlKGZ1bmN0aW9uKCkge1xuICAgIC8vICAgICB0aGlzLmdsLmJpbmRCdWZmZXIodGhpcy5nbC5BUlJBWV9CVUZGRVIsIHRoaXMuYnVmZmVyKTtcbiAgICAvLyAgICAgdGhpcy5zZXR1cCgpO1xuICAgIC8vIH0uYmluZCh0aGlzKSk7XG5cbiAgICB0aGlzLmdsLmJpbmRCdWZmZXIodGhpcy5nbC5BUlJBWV9CVUZGRVIsIHRoaXMuYnVmZmVyKTtcbiAgICB0aGlzLmdsLmJ1ZmZlckRhdGEodGhpcy5nbC5BUlJBWV9CVUZGRVIsIHRoaXMudmVydGV4X2RhdGEsIHRoaXMuZGF0YV91c2FnZSk7XG59XG5cbi8vIFJlbmRlciwgYnkgZGVmYXVsdCB3aXRoIGN1cnJlbnRseSBib3VuZCBwcm9ncmFtLCBvciBvdGhlcndpc2Ugd2l0aCBvcHRpb25hbGx5IHByb3ZpZGVkIG9uZVxuR0xHZW9tZXRyeS5wcm90b3R5cGUucmVuZGVyID0gZnVuY3Rpb24gKG9wdGlvbnMpXG57XG4gICAgb3B0aW9ucyA9IG9wdGlvbnMgfHwge307XG5cbiAgICAvLyBHTFZlcnRleEFycmF5T2JqZWN0LmJpbmQodGhpcy52YW8pO1xuXG4gICAgaWYgKHR5cGVvZiB0aGlzLl9yZW5kZXJfc2V0dXAgPT0gJ2Z1bmN0aW9uJykge1xuICAgICAgICB0aGlzLl9yZW5kZXJfc2V0dXAoKTtcbiAgICB9XG5cbiAgICB2YXIgZ2xfcHJvZ3JhbSA9IG9wdGlvbnMuZ2xfcHJvZ3JhbSB8fCBHTFByb2dyYW0uY3VycmVudDtcbiAgICBnbF9wcm9ncmFtLnVzZSgpO1xuXG4gICAgdGhpcy5nbC5iaW5kQnVmZmVyKHRoaXMuZ2wuQVJSQVlfQlVGRkVSLCB0aGlzLmJ1ZmZlcik7XG4gICAgdGhpcy52ZXJ0ZXhfbGF5b3V0LmVuYWJsZSh0aGlzLmdsLCBnbF9wcm9ncmFtKTtcblxuICAgIC8vIFRPRE86IHN1cHBvcnQgZWxlbWVudCBhcnJheSBtb2RlXG4gICAgdGhpcy5nbC5kcmF3QXJyYXlzKHRoaXMuZHJhd19tb2RlLCAwLCB0aGlzLnZlcnRleF9jb3VudCk7XG4gICAgLy8gR0xWZXJ0ZXhBcnJheU9iamVjdC5iaW5kKG51bGwpO1xufTtcblxuR0xHZW9tZXRyeS5wcm90b3R5cGUuZGVzdHJveSA9IGZ1bmN0aW9uICgpXG57XG4gICAgY29uc29sZS5sb2coXCJHTEdlb21ldHJ5LmRlc3Ryb3k6IGRlbGV0ZSBidWZmZXIgb2Ygc2l6ZSBcIiArIHRoaXMudmVydGV4X2RhdGEuYnl0ZUxlbmd0aCk7XG4gICAgdGhpcy5nbC5kZWxldGVCdWZmZXIodGhpcy5idWZmZXIpO1xuICAgIGRlbGV0ZSB0aGlzLnZlcnRleF9kYXRhO1xufTtcbiIsIi8vIFJlbmRlcmluZyBtb2Rlc1xuaW1wb3J0IHtHTH0gZnJvbSAnLi9nbCc7XG5pbXBvcnQgR0xWZXJ0ZXhMYXlvdXQgZnJvbSAnLi9nbF92ZXJ0ZXhfbGF5b3V0JztcbmltcG9ydCB7R0xCdWlsZGVyc30gZnJvbSAnLi9nbF9idWlsZGVycyc7XG5pbXBvcnQgR0xQcm9ncmFtIGZyb20gJy4vZ2xfcHJvZ3JhbSc7XG5pbXBvcnQgR0xHZW9tZXRyeSBmcm9tICcuL2dsX2dlb20nO1xuXG52YXIgc2hhZGVyX3NvdXJjZXMgPSByZXF1aXJlKCcuL2dsX3NoYWRlcnMnKTsgLy8gYnVpbHQtaW4gc2hhZGVyc1xuXG5pbXBvcnQgKiBhcyBRdWV1ZSBmcm9tICdxdWV1ZS1hc3luYyc7XG5cbmV4cG9ydCB2YXIgTW9kZXMgPSB7fTtcbmV4cG9ydCB2YXIgTW9kZU1hbmFnZXIgPSB7fTtcblxuXG4vLyBCYXNlXG5cbnZhciBSZW5kZXJNb2RlID0ge1xuICAgIGluaXQ6IGZ1bmN0aW9uIChnbCkge1xuICAgICAgICB0aGlzLmdsID0gZ2w7XG4gICAgICAgIHRoaXMubWFrZUdMUHJvZ3JhbSgpO1xuXG4gICAgICAgIGlmICh0eXBlb2YgdGhpcy5faW5pdCA9PSAnZnVuY3Rpb24nKSB7XG4gICAgICAgICAgICB0aGlzLl9pbml0KCk7XG4gICAgICAgIH1cbiAgICB9LFxuICAgIHJlZnJlc2g6IGZ1bmN0aW9uICgpIHsgLy8gVE9ETzogc2hvdWxkIHRoaXMgYmUgYXN5bmMvbm9uLWJsb2NraW5nP1xuICAgICAgICB0aGlzLm1ha2VHTFByb2dyYW0oKTtcbiAgICB9LFxuICAgIGRlZmluZXM6IHt9LFxuICAgIHNlbGVjdGlvbjogZmFsc2UsXG4gICAgYnVpbGRQb2x5Z29uczogZnVuY3Rpb24oKXt9LCAvLyBidWlsZCBmdW5jdGlvbnMgYXJlIG5vLW9wcyB1bnRpbCBvdmVycmlkZW5cbiAgICBidWlsZExpbmVzOiBmdW5jdGlvbigpe30sXG4gICAgYnVpbGRQb2ludHM6IGZ1bmN0aW9uKCl7fSxcbiAgICBtYWtlR0xHZW9tZXRyeTogZnVuY3Rpb24gKHZlcnRleF9kYXRhKSB7XG4gICAgICAgIHJldHVybiBuZXcgR0xHZW9tZXRyeSh0aGlzLmdsLCB2ZXJ0ZXhfZGF0YSwgdGhpcy52ZXJ0ZXhfbGF5b3V0KTtcbiAgICB9XG59O1xuXG5SZW5kZXJNb2RlLm1ha2VHTFByb2dyYW0gPSBmdW5jdGlvbiAoKVxue1xuICAgIC8vIGNvbnNvbGUubG9nKHRoaXMubmFtZSArIFwiOiBcIiArIFwic3RhcnQgYnVpbGRpbmdcIik7XG4gICAgdmFyIHF1ZXVlID0gUXVldWUoKTtcblxuICAgIC8vIEJ1aWxkIGRlZmluZXMgJiBmb3Igc2VsZWN0aW9uIChuZWVkIHRvIGNyZWF0ZSBhIG5ldyBvYmplY3Qgc2luY2UgdGhlIGZpcnN0IGlzIHN0b3JlZCBhcyBhIHJlZmVyZW5jZSBieSB0aGUgcHJvZ3JhbSlcbiAgICB2YXIgZGVmaW5lcyA9IHRoaXMuYnVpbGREZWZpbmVMaXN0KCk7XG4gICAgaWYgKHRoaXMuc2VsZWN0aW9uKSB7XG4gICAgICAgIHZhciBzZWxlY3Rpb25fZGVmaW5lcyA9IE9iamVjdC5jcmVhdGUoZGVmaW5lcyk7XG4gICAgICAgIHNlbGVjdGlvbl9kZWZpbmVzWydGRUFUVVJFX1NFTEVDVElPTiddID0gdHJ1ZTtcbiAgICB9XG5cbiAgICAvLyBHZXQgYW55IGN1c3RvbSBjb2RlIHRyYW5zZm9ybXNcbiAgICB2YXIgdHJhbnNmb3JtcyA9ICh0aGlzLnNoYWRlcnMgJiYgdGhpcy5zaGFkZXJzLnRyYW5zZm9ybXMpO1xuXG4gICAgLy8gQ3JlYXRlIHNoYWRlcnMgLSBwcm9ncmFtcyBtYXkgcG9pbnQgdG8gaW5oZXJpdGVkIHBhcmVudCBwcm9wZXJ0aWVzLCBidXQgc2hvdWxkIGJlIHJlcGxhY2VkIGJ5IHN1YmNsYXNzIHZlcnNpb25cbiAgICB2YXIgcHJvZ3JhbSA9ICh0aGlzLmhhc093blByb3BlcnR5KCdnbF9wcm9ncmFtJykgJiYgdGhpcy5nbF9wcm9ncmFtKTtcbiAgICB2YXIgc2VsZWN0aW9uX3Byb2dyYW0gPSAodGhpcy5oYXNPd25Qcm9wZXJ0eSgnc2VsZWN0aW9uX2dsX3Byb2dyYW0nKSAmJiB0aGlzLnNlbGVjdGlvbl9nbF9wcm9ncmFtKTtcblxuICAgIHF1ZXVlLmRlZmVyKGNvbXBsZXRlID0+IHtcbiAgICAgICAgaWYgKCFwcm9ncmFtKSB7XG4gICAgICAgICAgICAvLyBjb25zb2xlLmxvZyh0aGlzLm5hbWUgKyBcIjogXCIgKyBcImluc3RhbnRpYXRlXCIpO1xuICAgICAgICAgICAgcHJvZ3JhbSA9IG5ldyBHTFByb2dyYW0oXG4gICAgICAgICAgICAgICAgdGhpcy5nbCxcbiAgICAgICAgICAgICAgICBzaGFkZXJfc291cmNlc1t0aGlzLnZlcnRleF9zaGFkZXJfa2V5XSxcbiAgICAgICAgICAgICAgICBzaGFkZXJfc291cmNlc1t0aGlzLmZyYWdtZW50X3NoYWRlcl9rZXldLFxuICAgICAgICAgICAgICAgIHtcbiAgICAgICAgICAgICAgICAgICAgZGVmaW5lczogZGVmaW5lcyxcbiAgICAgICAgICAgICAgICAgICAgdHJhbnNmb3JtczogdHJhbnNmb3JtcyxcbiAgICAgICAgICAgICAgICAgICAgbmFtZTogdGhpcy5uYW1lLFxuICAgICAgICAgICAgICAgICAgICBjYWxsYmFjazogY29tcGxldGVcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICApO1xuICAgICAgICB9XG4gICAgICAgIGVsc2Uge1xuICAgICAgICAgICAgLy8gY29uc29sZS5sb2codGhpcy5uYW1lICsgXCI6IFwiICsgXCJyZS1jb21waWxlXCIpO1xuICAgICAgICAgICAgcHJvZ3JhbS5kZWZpbmVzID0gZGVmaW5lcztcbiAgICAgICAgICAgIHByb2dyYW0udHJhbnNmb3JtcyA9IHRyYW5zZm9ybXM7XG4gICAgICAgICAgICBwcm9ncmFtLmNvbXBpbGUoY29tcGxldGUpO1xuICAgICAgICB9XG4gICAgfSk7XG5cbiAgICBpZiAodGhpcy5zZWxlY3Rpb24pIHtcbiAgICAgICAgcXVldWUuZGVmZXIoY29tcGxldGUgPT4ge1xuICAgICAgICAgICAgaWYgKCFzZWxlY3Rpb25fcHJvZ3JhbSkge1xuICAgICAgICAgICAgICAgIC8vIGNvbnNvbGUubG9nKHRoaXMubmFtZSArIFwiOiBcIiArIFwic2VsZWN0aW9uIGluc3RhbnRpYXRlXCIpO1xuICAgICAgICAgICAgICAgIHNlbGVjdGlvbl9wcm9ncmFtID0gbmV3IEdMUHJvZ3JhbShcbiAgICAgICAgICAgICAgICAgICAgdGhpcy5nbCxcbiAgICAgICAgICAgICAgICAgICAgc2hhZGVyX3NvdXJjZXNbdGhpcy52ZXJ0ZXhfc2hhZGVyX2tleV0sXG4gICAgICAgICAgICAgICAgICAgIHNoYWRlcl9zb3VyY2VzWydzZWxlY3Rpb25fZnJhZ21lbnQnXSxcbiAgICAgICAgICAgICAgICAgICAge1xuICAgICAgICAgICAgICAgICAgICAgICAgZGVmaW5lczogc2VsZWN0aW9uX2RlZmluZXMsXG4gICAgICAgICAgICAgICAgICAgICAgICB0cmFuc2Zvcm1zOiB0cmFuc2Zvcm1zLFxuICAgICAgICAgICAgICAgICAgICAgICAgbmFtZTogKHRoaXMubmFtZSArICcgKHNlbGVjdGlvbiknKSxcbiAgICAgICAgICAgICAgICAgICAgICAgIGNhbGxiYWNrOiBjb21wbGV0ZVxuICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIGVsc2Uge1xuICAgICAgICAgICAgICAgIC8vIGNvbnNvbGUubG9nKHRoaXMubmFtZSArIFwiOiBcIiArIFwic2VsZWN0aW9uIHJlLWNvbXBpbGVcIik7XG4gICAgICAgICAgICAgICAgc2VsZWN0aW9uX3Byb2dyYW0uZGVmaW5lcyA9IHNlbGVjdGlvbl9kZWZpbmVzO1xuICAgICAgICAgICAgICAgIHNlbGVjdGlvbl9wcm9ncmFtLnRyYW5zZm9ybXMgPSB0cmFuc2Zvcm1zO1xuICAgICAgICAgICAgICAgIHNlbGVjdGlvbl9wcm9ncmFtLmNvbXBpbGUoY29tcGxldGUpO1xuICAgICAgICAgICAgfVxuICAgICAgICB9KTtcbiAgICB9XG5cbiAgICAvLyBXYWl0IGZvciBwcm9ncmFtKHMpIHRvIGNvbXBpbGUgYmVmb3JlIHJlcGxhY2luZyB0aGVtXG4gICAgLy8gVE9ETzogc2hvdWxkIHRoaXMgZW50aXJlIG1ldGhvZCBvZmZlciBhIGNhbGxiYWNrIGZvciB3aGVuIGNvbXBpbGF0aW9uIGNvbXBsZXRlcz9cbiAgICBxdWV1ZS5hd2FpdCgoKSA9PiB7XG4gICAgICAgaWYgKHByb2dyYW0pIHtcbiAgICAgICAgICAgdGhpcy5nbF9wcm9ncmFtID0gcHJvZ3JhbTtcbiAgICAgICB9XG5cbiAgICAgICBpZiAoc2VsZWN0aW9uX3Byb2dyYW0pIHtcbiAgICAgICAgICAgdGhpcy5zZWxlY3Rpb25fZ2xfcHJvZ3JhbSA9IHNlbGVjdGlvbl9wcm9ncmFtO1xuICAgICAgIH1cblxuICAgICAgIC8vIGNvbnNvbGUubG9nKHRoaXMubmFtZSArIFwiOiBcIiArIFwiZmluaXNoZWQgYnVpbGRpbmdcIik7XG4gICAgfSk7XG59XG5cbi8vIFRPRE86IGNvdWxkIHByb2JhYmx5IGNvbWJpbmUgYW5kIGdlbmVyYWxpemUgdGhpcyB3aXRoIHNpbWlsYXIgbWV0aG9kIGluIEdMUHJvZ3JhbVxuLy8gKGxpc3Qgb2YgZGVmaW5lIG9iamVjdHMgdGhhdCBpbmhlcml0IGZyb20gZWFjaCBvdGhlcilcblJlbmRlck1vZGUuYnVpbGREZWZpbmVMaXN0ID0gZnVuY3Rpb24gKClcbntcbiAgICAvLyBBZGQgYW55IGN1c3RvbSBkZWZpbmVzIHRvIGJ1aWx0LWluIG1vZGUgZGVmaW5lc1xuICAgIHZhciBkZWZpbmVzID0ge307IC8vIGNyZWF0ZSBhIG5ldyBvYmplY3QgdG8gYXZvaWQgbXV0YXRpbmcgYSBwcm90b3R5cGUgdmFsdWUgdGhhdCBtYXkgYmUgc2hhcmVkIHdpdGggb3RoZXIgbW9kZXNcbiAgICBpZiAodGhpcy5kZWZpbmVzICE9IG51bGwpIHtcbiAgICAgICAgZm9yICh2YXIgZCBpbiB0aGlzLmRlZmluZXMpIHtcbiAgICAgICAgICAgIGRlZmluZXNbZF0gPSB0aGlzLmRlZmluZXNbZF07XG4gICAgICAgIH1cbiAgICB9XG4gICAgaWYgKHRoaXMuc2hhZGVycyAhPSBudWxsICYmIHRoaXMuc2hhZGVycy5kZWZpbmVzICE9IG51bGwpIHtcbiAgICAgICAgZm9yICh2YXIgZCBpbiB0aGlzLnNoYWRlcnMuZGVmaW5lcykge1xuICAgICAgICAgICAgZGVmaW5lc1tkXSA9IHRoaXMuc2hhZGVycy5kZWZpbmVzW2RdO1xuICAgICAgICB9XG4gICAgfVxuICAgIHJldHVybiBkZWZpbmVzO1xufTtcblxuLy8gU2V0IG1vZGUgdW5pZm9ybXMgb24gY3VycmVudGx5IGJvdW5kIHByb2dyYW1cblJlbmRlck1vZGUuc2V0VW5pZm9ybXMgPSBmdW5jdGlvbiAoKVxue1xuICAgIHZhciBnbF9wcm9ncmFtID0gR0xQcm9ncmFtLmN1cnJlbnQ7XG4gICAgaWYgKGdsX3Byb2dyYW0gIT0gbnVsbCAmJiB0aGlzLnNoYWRlcnMgIT0gbnVsbCAmJiB0aGlzLnNoYWRlcnMudW5pZm9ybXMgIT0gbnVsbCkge1xuICAgICAgICBnbF9wcm9ncmFtLnNldFVuaWZvcm1zKHRoaXMuc2hhZGVycy51bmlmb3Jtcyk7XG4gICAgfVxufTtcblxuUmVuZGVyTW9kZS51cGRhdGUgPSBmdW5jdGlvbiAoKVxue1xuICAgIC8vIE1vZGUtc3BlY2lmaWMgYW5pbWF0aW9uXG4gICAgaWYgKHR5cGVvZiB0aGlzLmFuaW1hdGlvbiA9PSAnZnVuY3Rpb24nKSB7XG4gICAgICAgIHRoaXMuYW5pbWF0aW9uKCk7XG4gICAgfVxufTtcblxuLy8gVXBkYXRlIGJ1aWx0LWluIG1vZGUgb3IgY3JlYXRlIGEgbmV3IG9uZVxuTW9kZU1hbmFnZXIuY29uZmlndXJlTW9kZSA9IGZ1bmN0aW9uIChuYW1lLCBzZXR0aW5ncylcbntcbiAgICBNb2Rlc1tuYW1lXSA9IE1vZGVzW25hbWVdIHx8IE9iamVjdC5jcmVhdGUoTW9kZXNbc2V0dGluZ3MuZXh0ZW5kc10gfHwgUmVuZGVyTW9kZSk7XG4gICAgaWYgKE1vZGVzW3NldHRpbmdzLmV4dGVuZHNdKSB7XG4gICAgICAgIE1vZGVzW25hbWVdLnBhcmVudCA9IE1vZGVzW3NldHRpbmdzLmV4dGVuZHNdOyAvLyBleHBsaWNpdCAnc3VwZXInIGNsYXNzIGFjY2Vzc1xuICAgIH1cblxuICAgIGZvciAodmFyIHMgaW4gc2V0dGluZ3MpIHtcbiAgICAgICAgTW9kZXNbbmFtZV1bc10gPSBzZXR0aW5nc1tzXTtcbiAgICB9XG5cbiAgICBNb2Rlc1tuYW1lXS5uYW1lID0gbmFtZTtcbiAgICByZXR1cm4gTW9kZXNbbmFtZV07XG59O1xuXG5cbi8vIEJ1aWx0LWluIHJlbmRlcmluZyBtb2Rlc1xuXG4vKioqIFBsYWluIHBvbHlnb25zICoqKi9cblxuTW9kZXMucG9seWdvbnMgPSBPYmplY3QuY3JlYXRlKFJlbmRlck1vZGUpO1xuTW9kZXMucG9seWdvbnMubmFtZSA9ICdwb2x5Z29ucyc7XG5cbk1vZGVzLnBvbHlnb25zLnZlcnRleF9zaGFkZXJfa2V5ID0gJ3BvbHlnb25fdmVydGV4Jztcbk1vZGVzLnBvbHlnb25zLmZyYWdtZW50X3NoYWRlcl9rZXkgPSAncG9seWdvbl9mcmFnbWVudCc7XG5cbk1vZGVzLnBvbHlnb25zLmRlZmluZXMgPSB7XG4gICAgJ1dPUkxEX1BPU0lUSU9OX1dSQVAnOiAxMDAwMDAgLy8gZGVmYXVsdCB3b3JsZCBjb29yZHMgdG8gd3JhcCBldmVyeSAxMDAsMDAwIG1ldGVycywgY2FuIHR1cm4gb2ZmIGJ5IHNldHRpbmcgdGhpcyB0byAnZmFsc2UnXG59O1xuXG5Nb2Rlcy5wb2x5Z29ucy5zZWxlY3Rpb24gPSB0cnVlO1xuXG5Nb2Rlcy5wb2x5Z29ucy5faW5pdCA9IGZ1bmN0aW9uICgpIHtcbiAgICB0aGlzLnZlcnRleF9sYXlvdXQgPSBuZXcgR0xWZXJ0ZXhMYXlvdXQodGhpcy5nbCwgW1xuICAgICAgICB7IG5hbWU6ICdhX3Bvc2l0aW9uJywgc2l6ZTogMywgdHlwZTogdGhpcy5nbC5GTE9BVCwgbm9ybWFsaXplZDogZmFsc2UgfSxcbiAgICAgICAgeyBuYW1lOiAnYV9ub3JtYWwnLCBzaXplOiAzLCB0eXBlOiB0aGlzLmdsLkZMT0FULCBub3JtYWxpemVkOiBmYWxzZSB9LFxuICAgICAgICB7IG5hbWU6ICdhX2NvbG9yJywgc2l6ZTogMywgdHlwZTogdGhpcy5nbC5GTE9BVCwgbm9ybWFsaXplZDogZmFsc2UgfSxcbiAgICAgICAgeyBuYW1lOiAnYV9zZWxlY3Rpb25fY29sb3InLCBzaXplOiA0LCB0eXBlOiB0aGlzLmdsLkZMT0FULCBub3JtYWxpemVkOiBmYWxzZSB9LFxuICAgICAgICB7IG5hbWU6ICdhX2xheWVyJywgc2l6ZTogMSwgdHlwZTogdGhpcy5nbC5GTE9BVCwgbm9ybWFsaXplZDogZmFsc2UgfVxuICAgIF0pO1xufTtcblxuTW9kZXMucG9seWdvbnMuYnVpbGRQb2x5Z29ucyA9IGZ1bmN0aW9uIChwb2x5Z29ucywgc3R5bGUsIHZlcnRleF9kYXRhKVxue1xuICAgIC8vIENvbG9yIGFuZCBsYXllciBudW1iZXIgYXJlIGN1cnJlbnRseSBjb25zdGFudCBhY3Jvc3MgdmVydGljZXNcbiAgICB2YXIgdmVydGV4X2NvbnN0YW50cyA9IFtcbiAgICAgICAgc3R5bGUuY29sb3JbMF0sIHN0eWxlLmNvbG9yWzFdLCBzdHlsZS5jb2xvclsyXSxcbiAgICAgICAgc3R5bGUuc2VsZWN0aW9uLmNvbG9yWzBdLCBzdHlsZS5zZWxlY3Rpb24uY29sb3JbMV0sIHN0eWxlLnNlbGVjdGlvbi5jb2xvclsyXSwgc3R5bGUuc2VsZWN0aW9uLmNvbG9yWzNdLFxuICAgICAgICBzdHlsZS5sYXllcl9udW1cbiAgICBdO1xuXG4gICAgLy8gT3V0bGluZXMgaGF2ZSBhIHNsaWdodGx5IGRpZmZlcmVudCBzZXQgb2YgY29uc3RhbnRzLCBiZWNhdXNlIHRoZSBsYXllciBudW1iZXIgaXMgbW9kaWZpZWRcbiAgICBpZiAoc3R5bGUub3V0bGluZS5jb2xvcikge1xuICAgICAgICB2YXIgb3V0bGluZV92ZXJ0ZXhfY29uc3RhbnRzID0gW1xuICAgICAgICAgICAgc3R5bGUub3V0bGluZS5jb2xvclswXSwgc3R5bGUub3V0bGluZS5jb2xvclsxXSwgc3R5bGUub3V0bGluZS5jb2xvclsyXSxcbiAgICAgICAgICAgIHN0eWxlLnNlbGVjdGlvbi5jb2xvclswXSwgc3R5bGUuc2VsZWN0aW9uLmNvbG9yWzFdLCBzdHlsZS5zZWxlY3Rpb24uY29sb3JbMl0sIHN0eWxlLnNlbGVjdGlvbi5jb2xvclszXSxcbiAgICAgICAgICAgIHN0eWxlLmxheWVyX251bSAtIDAuNSAvLyBvdXRsaW5lcyBzaXQgYmV0d2VlbiBsYXllcnMsIHVuZGVybmVhdGggY3VycmVudCBsYXllciBidXQgYWJvdmUgdGhlIG9uZSBiZWxvd1xuICAgICAgICBdO1xuICAgIH1cblxuICAgIC8vIEV4dHJ1ZGVkIHBvbHlnb25zIChlLmcuIDNEIGJ1aWxkaW5ncylcbiAgICBpZiAoc3R5bGUuZXh0cnVkZSAmJiBzdHlsZS5oZWlnaHQpIHtcbiAgICAgICAgR0xCdWlsZGVycy5idWlsZEV4dHJ1ZGVkUG9seWdvbnMoXG4gICAgICAgICAgICBwb2x5Z29ucyxcbiAgICAgICAgICAgIHN0eWxlLnosXG4gICAgICAgICAgICBzdHlsZS5oZWlnaHQsXG4gICAgICAgICAgICBzdHlsZS5taW5faGVpZ2h0LFxuICAgICAgICAgICAgdmVydGV4X2RhdGEsXG4gICAgICAgICAgICB7XG4gICAgICAgICAgICAgICAgdmVydGV4X2NvbnN0YW50czogdmVydGV4X2NvbnN0YW50c1xuICAgICAgICAgICAgfVxuICAgICAgICApO1xuICAgIH1cbiAgICAvLyBSZWd1bGFyIHBvbHlnb25zXG4gICAgZWxzZSB7XG4gICAgICAgIEdMQnVpbGRlcnMuYnVpbGRQb2x5Z29ucyhcbiAgICAgICAgICAgIHBvbHlnb25zLFxuICAgICAgICAgICAgc3R5bGUueixcbiAgICAgICAgICAgIHZlcnRleF9kYXRhLFxuICAgICAgICAgICAge1xuICAgICAgICAgICAgICAgIG5vcm1hbHM6IHRydWUsXG4gICAgICAgICAgICAgICAgdmVydGV4X2NvbnN0YW50czogdmVydGV4X2NvbnN0YW50c1xuICAgICAgICAgICAgfVxuICAgICAgICApO1xuXG4gICAgICAgIC8vIENhbGxiYWNrLWJhc2UgYnVpbGRlciAoZm9yIGZ1dHVyZSBleHBsb3JhdGlvbilcbiAgICAgICAgLy8gdmFyIG5vcm1hbF92ZXJ0ZXhfY29uc3RhbnRzID0gWzAsIDAsIDFdLmNvbmNhdCh2ZXJ0ZXhfY29uc3RhbnRzKTtcbiAgICAgICAgLy8gR0xCdWlsZGVycy5idWlsZFBvbHlnb25zMihcbiAgICAgICAgLy8gICAgIHBvbHlnb25zLFxuICAgICAgICAvLyAgICAgeixcbiAgICAgICAgLy8gICAgIGZ1bmN0aW9uICh2ZXJ0aWNlcykge1xuICAgICAgICAvLyAgICAgICAgIC8vIHZhciB2cyA9IHZlcnRpY2VzLnBvc2l0aW9ucztcbiAgICAgICAgLy8gICAgICAgICAvLyBmb3IgKHZhciB2IGluIHZzKSB7XG4gICAgICAgIC8vICAgICAgICAgLy8gICAgIC8vIHZhciBiYyA9IFsodiAlIDMpID8gMCA6IDEsICgodiArIDEpICUgMykgPyAwIDogMSwgKCh2ICsgMikgJSAzKSA/IDAgOiAxXTtcbiAgICAgICAgLy8gICAgICAgICAvLyAgICAgLy8gdmFyIGJjID0gW2NlbnRyb2lkLngsIGNlbnRyb2lkLnksIDBdO1xuICAgICAgICAvLyAgICAgICAgIC8vICAgICAvLyB2c1t2XSA9IHZlcnRpY2VzLnBvc2l0aW9uc1t2XS5jb25jYXQoeiwgMCwgMCwgMSwgYmMpO1xuXG4gICAgICAgIC8vICAgICAgICAgLy8gICAgIC8vIHZzW3ZdID0gdmVydGljZXMucG9zaXRpb25zW3ZdLmNvbmNhdCh6LCAwLCAwLCAxKTtcbiAgICAgICAgLy8gICAgICAgICAvLyAgICAgdnNbdl0gPSB2ZXJ0aWNlcy5wb3NpdGlvbnNbdl0uY29uY2F0KDAsIDAsIDEpO1xuICAgICAgICAvLyAgICAgICAgIC8vIH1cblxuICAgICAgICAvLyAgICAgICAgIEdMLmFkZFZlcnRpY2VzKHZlcnRpY2VzLnBvc2l0aW9ucywgbm9ybWFsX3ZlcnRleF9jb25zdGFudHMsIHZlcnRleF9kYXRhKTtcblxuICAgICAgICAvLyAgICAgICAgIC8vIEdMLmFkZFZlcnRpY2VzQnlBdHRyaWJ1dGVMYXlvdXQoXG4gICAgICAgIC8vICAgICAgICAgLy8gICAgIFtcbiAgICAgICAgLy8gICAgICAgICAvLyAgICAgICAgIHsgbmFtZTogJ2FfcG9zaXRpb24nLCBkYXRhOiB2ZXJ0aWNlcy5wb3NpdGlvbnMgfSxcbiAgICAgICAgLy8gICAgICAgICAvLyAgICAgICAgIHsgbmFtZTogJ2Ffbm9ybWFsJywgZGF0YTogWzAsIDAsIDFdIH0sXG4gICAgICAgIC8vICAgICAgICAgLy8gICAgICAgICB7IG5hbWU6ICdhX2NvbG9yJywgZGF0YTogW3N0eWxlLmNvbG9yWzBdLCBzdHlsZS5jb2xvclsxXSwgc3R5bGUuY29sb3JbMl1dIH0sXG4gICAgICAgIC8vICAgICAgICAgLy8gICAgICAgICB7IG5hbWU6ICdhX2xheWVyJywgZGF0YTogc3R5bGUubGF5ZXJfbnVtIH1cbiAgICAgICAgLy8gICAgICAgICAvLyAgICAgXSxcbiAgICAgICAgLy8gICAgICAgICAvLyAgICAgdmVydGV4X2RhdGFcbiAgICAgICAgLy8gICAgICAgICAvLyApO1xuXG4gICAgICAgIC8vICAgICAgICAgLy8gR0wuYWRkVmVydGljZXNNdWx0aXBsZUF0dHJpYnV0ZXMoW3ZlcnRpY2VzLnBvc2l0aW9uc10sIG5vcm1hbF92ZXJ0ZXhfY29uc3RhbnRzLCB2ZXJ0ZXhfZGF0YSk7XG4gICAgICAgIC8vICAgICB9XG4gICAgICAgIC8vICk7XG4gICAgfVxuXG4gICAgLy8gUG9seWdvbiBvdXRsaW5lc1xuICAgIGlmIChzdHlsZS5vdXRsaW5lLmNvbG9yICYmIHN0eWxlLm91dGxpbmUud2lkdGgpIHtcbiAgICAgICAgZm9yICh2YXIgbXBjPTA7IG1wYyA8IHBvbHlnb25zLmxlbmd0aDsgbXBjKyspIHtcbiAgICAgICAgICAgIEdMQnVpbGRlcnMuYnVpbGRQb2x5bGluZXMoXG4gICAgICAgICAgICAgICAgcG9seWdvbnNbbXBjXSxcbiAgICAgICAgICAgICAgICBzdHlsZS56LFxuICAgICAgICAgICAgICAgIHN0eWxlLm91dGxpbmUud2lkdGgsXG4gICAgICAgICAgICAgICAgdmVydGV4X2RhdGEsXG4gICAgICAgICAgICAgICAge1xuICAgICAgICAgICAgICAgICAgICBjbG9zZWRfcG9seWdvbjogdHJ1ZSxcbiAgICAgICAgICAgICAgICAgICAgcmVtb3ZlX3RpbGVfZWRnZXM6IHRydWUsXG4gICAgICAgICAgICAgICAgICAgIHZlcnRleF9jb25zdGFudHM6IG91dGxpbmVfdmVydGV4X2NvbnN0YW50c1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICk7XG4gICAgICAgIH1cbiAgICB9XG59O1xuXG5Nb2Rlcy5wb2x5Z29ucy5idWlsZExpbmVzID0gZnVuY3Rpb24gKGxpbmVzLCBzdHlsZSwgdmVydGV4X2RhdGEpXG57XG4gICAgLy8gVE9PRDogcmVkdWNlIHJlZHVuZGFuY3kgb2YgY29uc3RhbnQgY2FsYyBiZXR3ZWVuIGJ1aWxkZXJzXG4gICAgLy8gQ29sb3IgYW5kIGxheWVyIG51bWJlciBhcmUgY3VycmVudGx5IGNvbnN0YW50IGFjcm9zcyB2ZXJ0aWNlc1xuICAgIHZhciB2ZXJ0ZXhfY29uc3RhbnRzID0gW1xuICAgICAgICBzdHlsZS5jb2xvclswXSwgc3R5bGUuY29sb3JbMV0sIHN0eWxlLmNvbG9yWzJdLFxuICAgICAgICBzdHlsZS5zZWxlY3Rpb24uY29sb3JbMF0sIHN0eWxlLnNlbGVjdGlvbi5jb2xvclsxXSwgc3R5bGUuc2VsZWN0aW9uLmNvbG9yWzJdLCBzdHlsZS5zZWxlY3Rpb24uY29sb3JbM10sXG4gICAgICAgIHN0eWxlLmxheWVyX251bVxuICAgIF07XG5cbiAgICAvLyBPdXRsaW5lcyBoYXZlIGEgc2xpZ2h0bHkgZGlmZmVyZW50IHNldCBvZiBjb25zdGFudHMsIGJlY2F1c2UgdGhlIGxheWVyIG51bWJlciBpcyBtb2RpZmllZFxuICAgIGlmIChzdHlsZS5vdXRsaW5lLmNvbG9yKSB7XG4gICAgICAgIHZhciBvdXRsaW5lX3ZlcnRleF9jb25zdGFudHMgPSBbXG4gICAgICAgICAgICBzdHlsZS5vdXRsaW5lLmNvbG9yWzBdLCBzdHlsZS5vdXRsaW5lLmNvbG9yWzFdLCBzdHlsZS5vdXRsaW5lLmNvbG9yWzJdLFxuICAgICAgICAgICAgc3R5bGUuc2VsZWN0aW9uLmNvbG9yWzBdLCBzdHlsZS5zZWxlY3Rpb24uY29sb3JbMV0sIHN0eWxlLnNlbGVjdGlvbi5jb2xvclsyXSwgc3R5bGUuc2VsZWN0aW9uLmNvbG9yWzNdLFxuICAgICAgICAgICAgc3R5bGUubGF5ZXJfbnVtIC0gMC41IC8vIG91dGxpbmVzIHNpdCBiZXR3ZWVuIGxheWVycywgdW5kZXJuZWF0aCBjdXJyZW50IGxheWVyIGJ1dCBhYm92ZSB0aGUgb25lIGJlbG93XG4gICAgICAgIF07XG4gICAgfVxuXG4gICAgLy8gTWFpbiBsaW5lc1xuICAgIEdMQnVpbGRlcnMuYnVpbGRQb2x5bGluZXMoXG4gICAgICAgIGxpbmVzLFxuICAgICAgICBzdHlsZS56LFxuICAgICAgICBzdHlsZS53aWR0aCxcbiAgICAgICAgdmVydGV4X2RhdGEsXG4gICAgICAgIHtcbiAgICAgICAgICAgIHZlcnRleF9jb25zdGFudHM6IHZlcnRleF9jb25zdGFudHNcbiAgICAgICAgfVxuICAgICk7XG5cbiAgICAvLyBMaW5lIG91dGxpbmVzXG4gICAgaWYgKHN0eWxlLm91dGxpbmUuY29sb3IgJiYgc3R5bGUub3V0bGluZS53aWR0aCkge1xuICAgICAgICBHTEJ1aWxkZXJzLmJ1aWxkUG9seWxpbmVzKFxuICAgICAgICAgICAgbGluZXMsXG4gICAgICAgICAgICBzdHlsZS56LFxuICAgICAgICAgICAgc3R5bGUud2lkdGggKyAyICogc3R5bGUub3V0bGluZS53aWR0aCxcbiAgICAgICAgICAgIHZlcnRleF9kYXRhLFxuICAgICAgICAgICAge1xuICAgICAgICAgICAgICAgIHZlcnRleF9jb25zdGFudHM6IG91dGxpbmVfdmVydGV4X2NvbnN0YW50c1xuICAgICAgICAgICAgfVxuICAgICAgICApO1xuICAgIH1cbn07XG5cbk1vZGVzLnBvbHlnb25zLmJ1aWxkUG9pbnRzID0gZnVuY3Rpb24gKHBvaW50cywgc3R5bGUsIHZlcnRleF9kYXRhKVxue1xuICAgIC8vIFRPT0Q6IHJlZHVjZSByZWR1bmRhbmN5IG9mIGNvbnN0YW50IGNhbGMgYmV0d2VlbiBidWlsZGVyc1xuICAgIC8vIENvbG9yIGFuZCBsYXllciBudW1iZXIgYXJlIGN1cnJlbnRseSBjb25zdGFudCBhY3Jvc3MgdmVydGljZXNcbiAgICB2YXIgdmVydGV4X2NvbnN0YW50cyA9IFtcbiAgICAgICAgc3R5bGUuY29sb3JbMF0sIHN0eWxlLmNvbG9yWzFdLCBzdHlsZS5jb2xvclsyXSxcbiAgICAgICAgc3R5bGUuc2VsZWN0aW9uLmNvbG9yWzBdLCBzdHlsZS5zZWxlY3Rpb24uY29sb3JbMV0sIHN0eWxlLnNlbGVjdGlvbi5jb2xvclsyXSwgc3R5bGUuc2VsZWN0aW9uLmNvbG9yWzNdLFxuICAgICAgICBzdHlsZS5sYXllcl9udW1cbiAgICBdO1xuXG4gICAgR0xCdWlsZGVycy5idWlsZFF1YWRzRm9yUG9pbnRzKFxuICAgICAgICBwb2ludHMsXG4gICAgICAgIHN0eWxlLnNpemUgKiAyLFxuICAgICAgICBzdHlsZS5zaXplICogMixcbiAgICAgICAgc3R5bGUueixcbiAgICAgICAgdmVydGV4X2RhdGEsXG4gICAgICAgIHtcbiAgICAgICAgICAgIG5vcm1hbHM6IHRydWUsXG4gICAgICAgICAgICB0ZXhjb29yZHM6IGZhbHNlLFxuICAgICAgICAgICAgdmVydGV4X2NvbnN0YW50czogdmVydGV4X2NvbnN0YW50c1xuICAgICAgICB9XG4gICAgKTtcbn07XG5cblxuLyoqKiBQb2ludHMgdy9zaW1wbGUgZGlzdGFuY2UgZmllbGQgcmVuZGVyaW5nICoqKi9cblxuTW9kZXMucG9pbnRzID0gT2JqZWN0LmNyZWF0ZShSZW5kZXJNb2RlKTtcbk1vZGVzLnBvaW50cy5uYW1lID0gJ3BvaW50cyc7XG5cbk1vZGVzLnBvaW50cy52ZXJ0ZXhfc2hhZGVyX2tleSA9ICdwb2ludF92ZXJ0ZXgnO1xuTW9kZXMucG9pbnRzLmZyYWdtZW50X3NoYWRlcl9rZXkgPSAncG9pbnRfZnJhZ21lbnQnO1xuXG5Nb2Rlcy5wb2ludHMuZGVmaW5lcyA9IHtcbiAgICAnRUZGRUNUX1NDUkVFTl9DT0xPUic6IHRydWVcbn07XG5cbk1vZGVzLnBvaW50cy5zZWxlY3Rpb24gPSB0cnVlO1xuXG5Nb2Rlcy5wb2ludHMuX2luaXQgPSBmdW5jdGlvbiAoKSB7XG4gICAgdGhpcy52ZXJ0ZXhfbGF5b3V0ID0gbmV3IEdMVmVydGV4TGF5b3V0KHRoaXMuZ2wsIFtcbiAgICAgICAgeyBuYW1lOiAnYV9wb3NpdGlvbicsIHNpemU6IDMsIHR5cGU6IHRoaXMuZ2wuRkxPQVQsIG5vcm1hbGl6ZWQ6IGZhbHNlIH0sXG4gICAgICAgIHsgbmFtZTogJ2FfdGV4Y29vcmQnLCBzaXplOiAyLCB0eXBlOiB0aGlzLmdsLkZMT0FULCBub3JtYWxpemVkOiBmYWxzZSB9LFxuICAgICAgICB7IG5hbWU6ICdhX2NvbG9yJywgc2l6ZTogMywgdHlwZTogdGhpcy5nbC5GTE9BVCwgbm9ybWFsaXplZDogZmFsc2UgfSxcbiAgICAgICAgeyBuYW1lOiAnYV9zZWxlY3Rpb25fY29sb3InLCBzaXplOiA0LCB0eXBlOiB0aGlzLmdsLkZMT0FULCBub3JtYWxpemVkOiBmYWxzZSB9LFxuICAgICAgICB7IG5hbWU6ICdhX2xheWVyJywgc2l6ZTogMSwgdHlwZTogdGhpcy5nbC5GTE9BVCwgbm9ybWFsaXplZDogZmFsc2UgfVxuICAgIF0pO1xufTtcblxuTW9kZXMucG9pbnRzLmJ1aWxkUG9pbnRzID0gZnVuY3Rpb24gKHBvaW50cywgc3R5bGUsIHZlcnRleF9kYXRhKVxue1xuICAgIC8vIFRPT0Q6IHJlZHVjZSByZWR1bmRhbmN5IG9mIGNvbnN0YW50IGNhbGMgYmV0d2VlbiBidWlsZGVyc1xuICAgIC8vIENvbG9yIGFuZCBsYXllciBudW1iZXIgYXJlIGN1cnJlbnRseSBjb25zdGFudCBhY3Jvc3MgdmVydGljZXNcbiAgICB2YXIgdmVydGV4X2NvbnN0YW50cyA9IFtcbiAgICAgICAgc3R5bGUuY29sb3JbMF0sIHN0eWxlLmNvbG9yWzFdLCBzdHlsZS5jb2xvclsyXSxcbiAgICAgICAgc3R5bGUuc2VsZWN0aW9uLmNvbG9yWzBdLCBzdHlsZS5zZWxlY3Rpb24uY29sb3JbMV0sIHN0eWxlLnNlbGVjdGlvbi5jb2xvclsyXSwgc3R5bGUuc2VsZWN0aW9uLmNvbG9yWzNdLFxuICAgICAgICBzdHlsZS5sYXllcl9udW1cbiAgICBdO1xuXG4gICAgR0xCdWlsZGVycy5idWlsZFF1YWRzRm9yUG9pbnRzKFxuICAgICAgICBwb2ludHMsXG4gICAgICAgIHN0eWxlLnNpemUgKiAyLFxuICAgICAgICBzdHlsZS5zaXplICogMixcbiAgICAgICAgc3R5bGUueixcbiAgICAgICAgdmVydGV4X2RhdGEsXG4gICAgICAgIHtcbiAgICAgICAgICAgIG5vcm1hbHM6IGZhbHNlLFxuICAgICAgICAgICAgdGV4Y29vcmRzOiB0cnVlLFxuICAgICAgICAgICAgdmVydGV4X2NvbnN0YW50czogdmVydGV4X2NvbnN0YW50c1xuICAgICAgICB9XG4gICAgKTtcbn07XG4iLCIvLyBUaGluIEdMIHByb2dyYW0gd3JhcHAgdG8gY2FjaGUgdW5pZm9ybSBsb2NhdGlvbnMvdmFsdWVzLCBkbyBjb21waWxlLXRpbWUgcHJlLXByb2Nlc3Npbmdcbi8vIChpbmplY3RpbmcgI2RlZmluZXMgYW5kICNwcmFnbWEgdHJhbnNmb3JtcyBpbnRvIHNoYWRlcnMpLCBldGMuXG5pbXBvcnQgKiBhcyBVdGlscyBmcm9tICcuLi91dGlscyc7XG5pbXBvcnQge0dMfSBmcm9tICcuL2dsJztcbmltcG9ydCBHTFRleHR1cmUgZnJvbSAnLi9nbF90ZXh0dXJlJztcbmltcG9ydCAqIGFzIFF1ZXVlIGZyb20gJ3F1ZXVlLWFzeW5jJztcblxuR0xQcm9ncmFtLmlkID0gMDsgLy8gYXNzaWduIGVhY2ggcHJvZ3JhbSBhIHVuaXF1ZSBpZFxuR0xQcm9ncmFtLnByb2dyYW1zID0ge307IC8vIHByb2dyYW1zLCBieSBpZFxuXG5leHBvcnQgZGVmYXVsdCBmdW5jdGlvbiBHTFByb2dyYW0gKGdsLCB2ZXJ0ZXhfc2hhZGVyLCBmcmFnbWVudF9zaGFkZXIsIG9wdGlvbnMpXG57XG4gICAgb3B0aW9ucyA9IG9wdGlvbnMgfHwge307XG5cbiAgICB0aGlzLmdsID0gZ2w7XG4gICAgdGhpcy5wcm9ncmFtID0gbnVsbDtcbiAgICB0aGlzLmNvbXBpbGVkID0gZmFsc2U7XG4gICAgdGhpcy5kZWZpbmVzID0gb3B0aW9ucy5kZWZpbmVzIHx8IHt9OyAvLyBrZXkvdmFsdWVzIGluc2VydGVkIGFzICNkZWZpbmVzIGludG8gc2hhZGVycyBhdCBjb21waWxlLXRpbWVcbiAgICB0aGlzLnRyYW5zZm9ybXMgPSBvcHRpb25zLnRyYW5zZm9ybXM7IC8vIGtleS92YWx1ZXMgZm9yIFVSTHMgb2YgYmxvY2tzIHRoYXQgY2FuIGJlIGluamVjdGVkIGludG8gc2hhZGVycyBhdCBjb21waWxlLXRpbWVcbiAgICB0aGlzLnVuaWZvcm1zID0ge307IC8vIHByb2dyYW0gbG9jYXRpb25zIG9mIHVuaWZvcm1zLCBzZXQvdXBkYXRlZCBhdCBjb21waWxlLXRpbWVcbiAgICB0aGlzLmF0dHJpYnMgPSB7fTsgLy8gcHJvZ3JhbSBsb2NhdGlvbnMgb2YgdmVydGV4IGF0dHJpYnV0ZXNcblxuICAgIHRoaXMudmVydGV4X3NoYWRlciA9IHZlcnRleF9zaGFkZXI7XG4gICAgdGhpcy5mcmFnbWVudF9zaGFkZXIgPSBmcmFnbWVudF9zaGFkZXI7XG5cbiAgICB0aGlzLmlkID0gR0xQcm9ncmFtLmlkKys7XG4gICAgR0xQcm9ncmFtLnByb2dyYW1zW3RoaXMuaWRdID0gdGhpcztcbiAgICB0aGlzLm5hbWUgPSBvcHRpb25zLm5hbWU7IC8vIGNhbiBwcm92aWRlIGEgcHJvZ3JhbSBuYW1lICh1c2VmdWwgZm9yIGRlYnVnZ2luZylcblxuICAgIHRoaXMuY29tcGlsZShvcHRpb25zLmNhbGxiYWNrKTtcbn07XG5cbi8vIFVzZSBwcm9ncmFtIHdyYXBwZXIgd2l0aCBzaW1wbGUgc3RhdGUgY2FjaGVcbkdMUHJvZ3JhbS5wcm90b3R5cGUudXNlID0gZnVuY3Rpb24gKClcbntcbiAgICBpZiAoIXRoaXMuY29tcGlsZWQpIHtcbiAgICAgICAgcmV0dXJuO1xuICAgIH1cblxuICAgIGlmIChHTFByb2dyYW0uY3VycmVudCAhPSB0aGlzKSB7XG4gICAgICAgIHRoaXMuZ2wudXNlUHJvZ3JhbSh0aGlzLnByb2dyYW0pO1xuICAgIH1cbiAgICBHTFByb2dyYW0uY3VycmVudCA9IHRoaXM7XG59O1xuR0xQcm9ncmFtLmN1cnJlbnQgPSBudWxsO1xuXG4vLyBHbG9iYWwgZGVmaW5lcyBhcHBsaWVkIHRvIGFsbCBwcm9ncmFtcyAoZHVwbGljYXRlIHByb3BlcnRpZXMgZm9yIGEgc3BlY2lmaWMgcHJvZ3JhbSB3aWxsIHRha2UgcHJlY2VkZW5jZSlcbkdMUHJvZ3JhbS5kZWZpbmVzID0ge307XG5cbkdMUHJvZ3JhbS5wcm90b3R5cGUuY29tcGlsZSA9IGZ1bmN0aW9uIChjYWxsYmFjaylcbntcbiAgICB2YXIgcXVldWUgPSBRdWV1ZSgpO1xuXG4gICAgLy8gQ29weSBzb3VyY2VzIGZyb20gcHJlLW1vZGlmaWVkIHRlbXBsYXRlXG4gICAgdGhpcy5jb21wdXRlZF92ZXJ0ZXhfc2hhZGVyID0gdGhpcy52ZXJ0ZXhfc2hhZGVyO1xuICAgIHRoaXMuY29tcHV0ZWRfZnJhZ21lbnRfc2hhZGVyID0gdGhpcy5mcmFnbWVudF9zaGFkZXI7XG5cbiAgICAvLyBNYWtlIGxpc3Qgb2YgZGVmaW5lcyB0byBiZSBpbmplY3RlZCBsYXRlclxuICAgIHZhciBkZWZpbmVzID0gdGhpcy5idWlsZERlZmluZUxpc3QoKTtcblxuICAgIC8vIEluamVjdCB1c2VyLWRlZmluZWQgdHJhbnNmb3JtcyAoYXJiaXRyYXJ5IGNvZGUgcG9pbnRzIG1hdGNoaW5nIG5hbWVkICNwcmFnbWFzKVxuICAgIC8vIFJlcGxhY2UgYWNjb3JkaW5nIHRvIHRoaXMgcGF0dGVybjpcbiAgICAvLyAjcHJhZ21hIHRhbmdyYW06IFtrZXldXG4gICAgLy8gZS5nLiAjcHJhZ21hIHRhbmdyYW06IGdsb2JhbHNcblxuICAgIC8vIFRPRE86IGZsYWcgdG8gYXZvaWQgcmUtcmV0cmlldmluZyB0cmFuc2Zvcm0gVVJMcyBvdmVyIG5ldHdvcmsgd2hlbiByZWJ1aWxkaW5nP1xuICAgIC8vIFRPRE86IHN1cHBvcnQgZ2xzbGlmeSAjcHJhZ21hIGV4cG9ydCBuYW1lcyBmb3IgYmV0dGVyIGNvbXBhdGliaWxpdHk/IChlLmcuIHJlbmFtZSBtYWluKCkgZnVuY3Rpb25zKVxuICAgIC8vIFRPRE86IGF1dG8taW5zZXJ0IHVuaWZvcm1zIHJlZmVyZW5jZWQgaW4gbW9kZSBkZWZpbml0aW9uLCBidXQgbm90IGluIHNoYWRlciBiYXNlIG9yIHRyYW5zZm9ybXM/IChwcm9ibGVtOiBkb24ndCBoYXZlIGFjY2VzcyB0byB1bmlmb3JtIGxpc3QvdHlwZSBoZXJlKVxuXG4gICAgLy8gR2F0aGVyIGFsbCB0cmFuc2Zvcm0gY29kZSBzbmlwcGV0cyAoY2FuIGJlIGVpdGhlciBpbmxpbmUgaW4gdGhlIHN0eWxlIGZpbGUsIG9yIG92ZXIgdGhlIG5ldHdvcmsgdmlhIFVSTClcbiAgICAvLyBUaGlzIGlzIGFuIGFzeW5jIHByb2Nlc3MsIHNpbmNlIGNvZGUgbWF5IGJlIHJldHJpZXZlZCByZW1vdGVseVxuICAgIHZhciByZWdleHA7XG4gICAgdmFyIGxvYWRlZF90cmFuc2Zvcm1zID0ge307IC8vIG1hc3RlciBsaXN0IG9mIHRyYW5zZm9ybXMsIHdpdGggYW4gb3JkZXJlZCBsaXN0IGZvciBlYWNoIChzaW5jZSB3ZSB3YW50IHRvIGd1YXJhbnRlZSBvcmRlciBvZiB0cmFuc2Zvcm1zKVxuICAgIGlmICh0aGlzLnRyYW5zZm9ybXMgIT0gbnVsbCkge1xuXG4gICAgICAgIGZvciAodmFyIGtleSBpbiB0aGlzLnRyYW5zZm9ybXMpIHtcbiAgICAgICAgICAgIHZhciB0cmFuc2Zvcm0gPSB0aGlzLnRyYW5zZm9ybXNba2V5XTtcbiAgICAgICAgICAgIGlmICh0cmFuc2Zvcm0gPT0gbnVsbCkge1xuICAgICAgICAgICAgICAgIGNvbnRpbnVlO1xuICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICAvLyBFYWNoIGNvZGUgcG9pbnQgY2FuIGJlIGEgc2luZ2xlIGl0ZW0gKHN0cmluZyBvciBoYXNoIG9iamVjdCkgb3IgYSBsaXN0IChhcnJheSBvYmplY3Qgd2l0aCBub24temVybyBsZW5ndGgpXG4gICAgICAgICAgICBpZiAodHlwZW9mIHRyYW5zZm9ybSA9PSAnc3RyaW5nJyB8fCAodHlwZW9mIHRyYW5zZm9ybSA9PSAnb2JqZWN0JyAmJiB0cmFuc2Zvcm0ubGVuZ3RoID09IG51bGwpKSB7XG4gICAgICAgICAgICAgICAgdHJhbnNmb3JtID0gW3RyYW5zZm9ybV07XG4gICAgICAgICAgICB9XG5cbiAgICAgICAgICAgIC8vIEZpcnN0IGZpbmQgY29kZSByZXBsYWNlIHBvaW50cyBpbiBzaGFkZXJzXG4gICAgICAgICAgICB2YXIgcmVnZXhwID0gbmV3IFJlZ0V4cCgnXlxcXFxzKiNwcmFnbWFcXFxccyt0YW5ncmFtOlxcXFxzKycgKyBrZXkgKyAnXFxcXHMqJCcsICdtJyk7XG4gICAgICAgICAgICB2YXIgaW5qZWN0X3ZlcnRleCA9IHRoaXMuY29tcHV0ZWRfdmVydGV4X3NoYWRlci5tYXRjaChyZWdleHApO1xuICAgICAgICAgICAgdmFyIGluamVjdF9mcmFnbWVudCA9IHRoaXMuY29tcHV0ZWRfZnJhZ21lbnRfc2hhZGVyLm1hdGNoKHJlZ2V4cCk7XG5cbiAgICAgICAgICAgIC8vIEF2b2lkIG5ldHdvcmsgcmVxdWVzdCBpZiBub3RoaW5nIHRvIHJlcGxhY2VcbiAgICAgICAgICAgIGlmIChpbmplY3RfdmVydGV4ID09IG51bGwgJiYgaW5qZWN0X2ZyYWdtZW50ID09IG51bGwpIHtcbiAgICAgICAgICAgICAgICBjb250aW51ZTtcbiAgICAgICAgICAgIH1cblxuICAgICAgICAgICAgLy8gQ29sbGVjdCBhbGwgdHJhbnNmb3JtcyBmb3IgdGhpcyB0eXBlXG4gICAgICAgICAgICBsb2FkZWRfdHJhbnNmb3Jtc1trZXldID0ge307XG4gICAgICAgICAgICBsb2FkZWRfdHJhbnNmb3Jtc1trZXldLnJlZ2V4cCA9IG5ldyBSZWdFeHAocmVnZXhwKTsgLy8gc2F2ZSByZWdleHAgc28gd2UgY2FuIGluamVjdCBsYXRlciB3aXRob3V0IGhhdmluZyB0byByZWNyZWF0ZSBpdFxuICAgICAgICAgICAgbG9hZGVkX3RyYW5zZm9ybXNba2V5XS5pbmplY3RfdmVydGV4ID0gKGluamVjdF92ZXJ0ZXggIT0gbnVsbCk7IC8vIHNhdmUgcmVnZXhwIGNvZGUgcG9pbnQgbWF0Y2hlcyBzbyB3ZSBkb24ndCBoYXZlIHRvIGRvIHRoZW0gYWdhaW5cbiAgICAgICAgICAgIGxvYWRlZF90cmFuc2Zvcm1zW2tleV0uaW5qZWN0X2ZyYWdtZW50ID0gKGluamVjdF9mcmFnbWVudCAhPSBudWxsKTtcbiAgICAgICAgICAgIGxvYWRlZF90cmFuc2Zvcm1zW2tleV0ubGlzdCA9IFtdO1xuXG4gICAgICAgICAgICAvLyBHZXQgdGhlIGNvZGUgKHBvc3NpYmx5IG92ZXIgdGhlIG5ldHdvcmssIHNvIG5lZWRzIHRvIGJlIGFzeW5jKVxuICAgICAgICAgICAgZm9yICh2YXIgdT0wOyB1IDwgdHJhbnNmb3JtLmxlbmd0aDsgdSsrKSB7XG4gICAgICAgICAgICAgICAgcXVldWUuZGVmZXIoR0xQcm9ncmFtLmxvYWRUcmFuc2Zvcm0sIGxvYWRlZF90cmFuc2Zvcm1zLCB0cmFuc2Zvcm1bdV0sIGtleSwgdSk7XG4gICAgICAgICAgICB9XG5cbiAgICAgICAgICAgIC8vIEFkZCBhICNkZWZpbmUgZm9yIHRoaXMgaW5qZWN0aW9uIHBvaW50XG4gICAgICAgICAgICBkZWZpbmVzWydUQU5HUkFNX1RSQU5TRk9STV8nICsga2V5LnJlcGxhY2UoJyAnLCAnXycpLnRvVXBwZXJDYXNlKCldID0gdHJ1ZTtcbiAgICAgICAgfVxuICAgIH1cblxuICAgIC8vIFdoZW4gYWxsIHRyYW5zZm9ybSBjb2RlIHNuaXBwZXRzIGFyZSBjb2xsZWN0ZWQsIGNvbWJpbmUgYW5kIGluamVjdCB0aGVtXG4gICAgcXVldWUuYXdhaXQoZXJyb3IgPT4ge1xuICAgICAgICBpZiAoZXJyb3IpIHtcbiAgICAgICAgICAgIGNvbnNvbGUubG9nKFwiZXJyb3IgbG9hZGluZyB0cmFuc2Zvcm1zOiBcIiArIGVycm9yKTtcbiAgICAgICAgICAgIHJldHVybjtcbiAgICAgICAgfVxuXG4gICAgICAgIC8vIERvIHRoZSBjb2RlIGluamVjdGlvbiB3aXRoIHRoZSBjb2xsZWN0ZWQgc291cmNlc1xuICAgICAgICBmb3IgKHZhciB0IGluIGxvYWRlZF90cmFuc2Zvcm1zKSB7XG4gICAgICAgICAgICAvLyBDb25jYXRlbmF0ZVxuICAgICAgICAgICAgdmFyIGNvbWJpbmVkX3NvdXJjZSA9IFwiXCI7XG4gICAgICAgICAgICBmb3IgKHZhciBzPTA7IHMgPCBsb2FkZWRfdHJhbnNmb3Jtc1t0XS5saXN0Lmxlbmd0aDsgcysrKSB7XG4gICAgICAgICAgICAgICAgY29tYmluZWRfc291cmNlICs9IGxvYWRlZF90cmFuc2Zvcm1zW3RdLmxpc3Rbc10gKyAnXFxuJztcbiAgICAgICAgICAgIH1cblxuICAgICAgICAgICAgLy8gSW5qZWN0XG4gICAgICAgICAgICBpZiAobG9hZGVkX3RyYW5zZm9ybXNbdF0uaW5qZWN0X3ZlcnRleCAhPSBudWxsKSB7XG4gICAgICAgICAgICAgICAgdGhpcy5jb21wdXRlZF92ZXJ0ZXhfc2hhZGVyID0gdGhpcy5jb21wdXRlZF92ZXJ0ZXhfc2hhZGVyLnJlcGxhY2UobG9hZGVkX3RyYW5zZm9ybXNbdF0ucmVnZXhwLCBjb21iaW5lZF9zb3VyY2UpO1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgaWYgKGxvYWRlZF90cmFuc2Zvcm1zW3RdLmluamVjdF9mcmFnbWVudCAhPSBudWxsKSB7XG4gICAgICAgICAgICAgICAgdGhpcy5jb21wdXRlZF9mcmFnbWVudF9zaGFkZXIgPSB0aGlzLmNvbXB1dGVkX2ZyYWdtZW50X3NoYWRlci5yZXBsYWNlKGxvYWRlZF90cmFuc2Zvcm1zW3RdLnJlZ2V4cCwgY29tYmluZWRfc291cmNlKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgfVxuXG4gICAgICAgIC8vIENsZWFuLXVwIGFueSAjcHJhZ21hcyB0aGF0IHdlcmVuJ3QgcmVwbGFjZWQgKHRvIHByZXZlbnQgY29tcGlsZXIgd2FybmluZ3MpXG4gICAgICAgIHZhciByZWdleHAgPSBuZXcgUmVnRXhwKCdeXFxcXHMqI3ByYWdtYVxcXFxzK3RhbmdyYW06XFxcXHMrXFxcXHcrXFxcXHMqJCcsICdnbScpO1xuICAgICAgICB0aGlzLmNvbXB1dGVkX3ZlcnRleF9zaGFkZXIgPSB0aGlzLmNvbXB1dGVkX3ZlcnRleF9zaGFkZXIucmVwbGFjZShyZWdleHAsICcnKTtcbiAgICAgICAgdGhpcy5jb21wdXRlZF9mcmFnbWVudF9zaGFkZXIgPSB0aGlzLmNvbXB1dGVkX2ZyYWdtZW50X3NoYWRlci5yZXBsYWNlKHJlZ2V4cCwgJycpO1xuXG4gICAgICAgIC8vIEJ1aWxkICYgaW5qZWN0IGRlZmluZXNcbiAgICAgICAgLy8gVGhpcyBpcyBkb25lICphZnRlciogY29kZSBpbmplY3Rpb24gc28gdGhhdCB3ZSBjYW4gYWRkIGRlZmluZXMgZm9yIHdoaWNoIGNvZGUgcG9pbnRzIHdlcmUgaW5qZWN0ZWRcbiAgICAgICAgdmFyIGRlZmluZV9zdHIgPSBHTFByb2dyYW0uYnVpbGREZWZpbmVTdHJpbmcoZGVmaW5lcyk7XG4gICAgICAgIHRoaXMuY29tcHV0ZWRfdmVydGV4X3NoYWRlciA9IGRlZmluZV9zdHIgKyB0aGlzLmNvbXB1dGVkX3ZlcnRleF9zaGFkZXI7XG4gICAgICAgIHRoaXMuY29tcHV0ZWRfZnJhZ21lbnRfc2hhZGVyID0gZGVmaW5lX3N0ciArIHRoaXMuY29tcHV0ZWRfZnJhZ21lbnRfc2hhZGVyO1xuXG4gICAgICAgIC8vIEluY2x1ZGUgcHJvZ3JhbSBpbmZvIHVzZWZ1bCBmb3IgZGVidWdnaW5nXG4gICAgICAgIHZhciBpbmZvID0gKHRoaXMubmFtZSA/ICh0aGlzLm5hbWUgKyAnIC8gaWQgJyArIHRoaXMuaWQpIDogKCdpZCAnICsgdGhpcy5pZCkpO1xuICAgICAgICB0aGlzLmNvbXB1dGVkX3ZlcnRleF9zaGFkZXIgPSAnLy8gUHJvZ3JhbTogJyArIGluZm8gKyAnXFxuJyArIHRoaXMuY29tcHV0ZWRfdmVydGV4X3NoYWRlcjtcbiAgICAgICAgdGhpcy5jb21wdXRlZF9mcmFnbWVudF9zaGFkZXIgPSAnLy8gUHJvZ3JhbTogJyArIGluZm8gKyAnXFxuJyArIHRoaXMuY29tcHV0ZWRfZnJhZ21lbnRfc2hhZGVyO1xuXG4gICAgICAgIC8vIENvbXBpbGUgJiBzZXQgdW5pZm9ybXMgdG8gY2FjaGVkIHZhbHVlc1xuICAgICAgICB0cnkge1xuICAgICAgICAgICAgdGhpcy5wcm9ncmFtID0gR0wudXBkYXRlUHJvZ3JhbSh0aGlzLmdsLCB0aGlzLnByb2dyYW0sIHRoaXMuY29tcHV0ZWRfdmVydGV4X3NoYWRlciwgdGhpcy5jb21wdXRlZF9mcmFnbWVudF9zaGFkZXIpO1xuICAgICAgICAgICAgLy8gdGhpcy5wcm9ncmFtID0gR0wudXBkYXRlUHJvZ3JhbSh0aGlzLmdsLCBudWxsLCB0aGlzLmNvbXB1dGVkX3ZlcnRleF9zaGFkZXIsIHRoaXMuY29tcHV0ZWRfZnJhZ21lbnRfc2hhZGVyKTtcbiAgICAgICAgICAgIHRoaXMuY29tcGlsZWQgPSB0cnVlO1xuICAgICAgICB9XG4gICAgICAgIGNhdGNoIChlKSB7XG4gICAgICAgICAgICB0aGlzLnByb2dyYW0gPSBudWxsO1xuICAgICAgICAgICAgdGhpcy5jb21waWxlZCA9IGZhbHNlO1xuICAgICAgICB9XG5cbiAgICAgICAgdGhpcy51c2UoKTtcbiAgICAgICAgdGhpcy5yZWZyZXNoVW5pZm9ybXMoKTtcbiAgICAgICAgdGhpcy5yZWZyZXNoQXR0cmlidXRlcygpO1xuXG4gICAgICAgIC8vIE5vdGlmeSBjYWxsZXJcbiAgICAgICAgaWYgKHR5cGVvZiBjYWxsYmFjayA9PSAnZnVuY3Rpb24nKSB7XG4gICAgICAgICAgICBjYWxsYmFjaygpO1xuICAgICAgICB9XG4gICAgfSk7XG59O1xuXG4vLyBSZXRyaWV2ZSBhIHNpbmdsZSB0cmFuc2Zvcm0sIGZvciBhIGdpdmVuIGluamVjdGlvbiBwb2ludCwgYXQgYSBjZXJ0YWluIGluZGV4ICh0byBwcmVzZXJ2ZSBvcmlnaW5hbCBvcmRlcilcbi8vIENhbiBiZSBhc3luYywgY2FsbHMgJ2NvbXBsZXRlJyBjYWxsYmFjayB3aGVuIGRvbmVcbkdMUHJvZ3JhbS5sb2FkVHJhbnNmb3JtID0gZnVuY3Rpb24gKHRyYW5zZm9ybXMsIGJsb2NrLCBrZXksIGluZGV4LCBjb21wbGV0ZSkge1xuICAgIC8vIENhbiBiZSBhbiBpbmxpbmUgYmxvY2sgb2YgR0xTTCwgb3IgYSBVUkwgdG8gcmV0cmlldmUgR0xTTCBibG9jayBmcm9tXG4gICAgdmFyIHR5cGUsIHZhbHVlLCBzb3VyY2U7XG5cbiAgICAvLyBJbmxpbmUgY29kZVxuICAgIGlmICh0eXBlb2YgYmxvY2sgPT0gJ3N0cmluZycpIHtcbiAgICAgICAgdHJhbnNmb3Jtc1trZXldLmxpc3RbaW5kZXhdID0gYmxvY2s7XG4gICAgICAgIGNvbXBsZXRlKCk7XG4gICAgfVxuICAgIC8vIFJlbW90ZSBjb2RlXG4gICAgZWxzZSBpZiAodHlwZW9mIGJsb2NrID09ICdvYmplY3QnICYmIGJsb2NrLnVybCkge1xuICAgICAgICB2YXIgcmVxID0gbmV3IFhNTEh0dHBSZXF1ZXN0KCk7XG5cbiAgICAgICAgcmVxLm9ubG9hZCA9IGZ1bmN0aW9uICgpIHtcbiAgICAgICAgICAgIHNvdXJjZSA9IHJlcS5yZXNwb25zZTtcbiAgICAgICAgICAgIHRyYW5zZm9ybXNba2V5XS5saXN0W2luZGV4XSA9IHNvdXJjZTtcbiAgICAgICAgICAgIGNvbXBsZXRlKCk7XG4gICAgICAgIH07XG4gICAgICAgIHJlcS5vcGVuKCdHRVQnLCBVdGlscy51cmxGb3JQYXRoKGJsb2NrLnVybCkgKyAnPycgKyAoK25ldyBEYXRlKCkpLCB0cnVlIC8qIGFzeW5jIGZsYWcgKi8pO1xuICAgICAgICByZXEucmVzcG9uc2VUeXBlID0gJ3RleHQnO1xuICAgICAgICByZXEuc2VuZCgpO1xuICAgIH1cbn07XG5cbi8vIE1ha2UgbGlzdCBvZiBkZWZpbmVzIChnbG9iYWwsIHRoZW4gcHJvZ3JhbS1zcGVjaWZpYylcbkdMUHJvZ3JhbS5wcm90b3R5cGUuYnVpbGREZWZpbmVMaXN0ID0gZnVuY3Rpb24gKCkge1xuICAgIHZhciBkZWZpbmVzID0ge307XG4gICAgZm9yICh2YXIgZCBpbiBHTFByb2dyYW0uZGVmaW5lcykge1xuICAgICAgICBkZWZpbmVzW2RdID0gR0xQcm9ncmFtLmRlZmluZXNbZF07XG4gICAgfVxuICAgIGZvciAodmFyIGQgaW4gdGhpcy5kZWZpbmVzKSB7XG4gICAgICAgIGRlZmluZXNbZF0gPSB0aGlzLmRlZmluZXNbZF07XG4gICAgfVxuICAgIHJldHVybiBkZWZpbmVzO1xufTtcblxuLy8gVHVybiAjZGVmaW5lcyBpbnRvIGEgY29tYmluZWQgc3RyaW5nXG5HTFByb2dyYW0uYnVpbGREZWZpbmVTdHJpbmcgPSBmdW5jdGlvbiAoZGVmaW5lcykge1xuICAgIHZhciBkZWZpbmVfc3RyID0gXCJcIjtcbiAgICBmb3IgKHZhciBkIGluIGRlZmluZXMpIHtcbiAgICAgICAgaWYgKGRlZmluZXNbZF0gPT0gZmFsc2UpIHtcbiAgICAgICAgICAgIGNvbnRpbnVlO1xuICAgICAgICB9XG4gICAgICAgIGVsc2UgaWYgKHR5cGVvZiBkZWZpbmVzW2RdID09ICdib29sZWFuJyAmJiBkZWZpbmVzW2RdID09IHRydWUpIHsgLy8gYm9vbGVhbnMgYXJlIHNpbXBsZSBkZWZpbmVzIHdpdGggbm8gdmFsdWVcbiAgICAgICAgICAgIGRlZmluZV9zdHIgKz0gXCIjZGVmaW5lIFwiICsgZCArIFwiXFxuXCI7XG4gICAgICAgIH1cbiAgICAgICAgZWxzZSBpZiAodHlwZW9mIGRlZmluZXNbZF0gPT0gJ251bWJlcicgJiYgTWF0aC5mbG9vcihkZWZpbmVzW2RdKSA9PSBkZWZpbmVzW2RdKSB7IC8vIGludCB0byBmbG9hdCBjb252ZXJzaW9uIHRvIHNhdGlzZnkgR0xTTCBmbG9hdHNcbiAgICAgICAgICAgIGRlZmluZV9zdHIgKz0gXCIjZGVmaW5lIFwiICsgZCArIFwiIFwiICsgZGVmaW5lc1tkXS50b0ZpeGVkKDEpICsgXCJcXG5cIjtcbiAgICAgICAgfVxuICAgICAgICBlbHNlIHsgLy8gYW55IG90aGVyIGZsb2F0IG9yIHN0cmluZyB2YWx1ZVxuICAgICAgICAgICAgZGVmaW5lX3N0ciArPSBcIiNkZWZpbmUgXCIgKyBkICsgXCIgXCIgKyBkZWZpbmVzW2RdICsgXCJcXG5cIjtcbiAgICAgICAgfVxuICAgIH1cbiAgICByZXR1cm4gZGVmaW5lX3N0cjtcbn07XG5cbi8vIFNldCB1bmlmb3JtcyBmcm9tIGEgSlMgb2JqZWN0LCB3aXRoIGluZmVycmVkIHR5cGVzXG5HTFByb2dyYW0ucHJvdG90eXBlLnNldFVuaWZvcm1zID0gZnVuY3Rpb24gKHVuaWZvcm1zKVxue1xuICAgIC8vIFRPRE86IG9ubHkgdXBkYXRlIHVuaWZvcm1zIHdoZW4gY2hhbmdlZFxuICAgIHZhciB0ZXh0dXJlX3VuaXQgPSAwO1xuXG4gICAgZm9yICh2YXIgdSBpbiB1bmlmb3Jtcykge1xuICAgICAgICB2YXIgdW5pZm9ybSA9IHVuaWZvcm1zW3VdO1xuXG4gICAgICAgIC8vIFNpbmdsZSBmbG9hdFxuICAgICAgICBpZiAodHlwZW9mIHVuaWZvcm0gPT0gJ251bWJlcicpIHtcbiAgICAgICAgICAgIHRoaXMudW5pZm9ybSgnMWYnLCB1LCB1bmlmb3JtKTtcbiAgICAgICAgfVxuICAgICAgICAvLyBNdWx0aXBsZSBmbG9hdHMgLSB2ZWN0b3Igb3IgYXJyYXlcbiAgICAgICAgZWxzZSBpZiAodHlwZW9mIHVuaWZvcm0gPT0gJ29iamVjdCcpIHtcbiAgICAgICAgICAgIC8vIGZsb2F0IHZlY3RvcnMgKHZlYzIsIHZlYzMsIHZlYzQpXG4gICAgICAgICAgICBpZiAodW5pZm9ybS5sZW5ndGggPj0gMiAmJiB1bmlmb3JtLmxlbmd0aCA8PSA0KSB7XG4gICAgICAgICAgICAgICAgdGhpcy51bmlmb3JtKHVuaWZvcm0ubGVuZ3RoICsgJ2Z2JywgdSwgdW5pZm9ybSk7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICAvLyBmbG9hdCBhcnJheVxuICAgICAgICAgICAgZWxzZSBpZiAodW5pZm9ybS5sZW5ndGggPiA0KSB7XG4gICAgICAgICAgICAgICAgdGhpcy51bmlmb3JtKCcxZnYnLCB1ICsgJ1swXScsIHVuaWZvcm0pO1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgLy8gVE9ETzogYXNzdW1lIG1hdHJpeCBmb3IgKHR5cGVvZiA9PSBGbG9hdDMyQXJyYXkgJiYgbGVuZ3RoID09IDE2KT9cbiAgICAgICAgfVxuICAgICAgICAvLyBCb29sZWFuXG4gICAgICAgIGVsc2UgaWYgKHR5cGVvZiB1bmlmb3JtID09ICdib29sZWFuJykge1xuICAgICAgICAgICAgdGhpcy51bmlmb3JtKCcxaScsIHUsIHVuaWZvcm0pO1xuICAgICAgICB9XG4gICAgICAgIC8vIFRleHR1cmVcbiAgICAgICAgZWxzZSBpZiAodHlwZW9mIHVuaWZvcm0gPT0gJ3N0cmluZycpIHtcbiAgICAgICAgICAgIHZhciB0ZXh0dXJlID0gR0xUZXh0dXJlLnRleHR1cmVzW3VuaWZvcm1dO1xuICAgICAgICAgICAgaWYgKHRleHR1cmUgPT0gbnVsbCkge1xuICAgICAgICAgICAgICAgIHRleHR1cmUgPSBuZXcgR0xUZXh0dXJlKHRoaXMuZ2wsIHVuaWZvcm0pO1xuICAgICAgICAgICAgICAgIHRleHR1cmUubG9hZCh1bmlmb3JtKTtcbiAgICAgICAgICAgIH1cblxuICAgICAgICAgICAgdGV4dHVyZS5iaW5kKHRleHR1cmVfdW5pdCk7XG4gICAgICAgICAgICB0aGlzLnVuaWZvcm0oJzFpJywgdSwgdGV4dHVyZV91bml0KTtcbiAgICAgICAgICAgIHRleHR1cmVfdW5pdCsrO1xuICAgICAgICB9XG4gICAgICAgIC8vIFRPRE86IHN1cHBvcnQgb3RoZXIgbm9uLWZsb2F0IHR5cGVzPyAoaW50LCBldGMuKVxuICAgIH1cbn07XG5cbi8vIGV4OiBwcm9ncmFtLnVuaWZvcm0oJzNmJywgJ3Bvc2l0aW9uJywgeCwgeSwgeik7XG4vLyBUT0RPOiBvbmx5IHVwZGF0ZSB1bmlmb3JtcyB3aGVuIGNoYW5nZWRcbkdMUHJvZ3JhbS5wcm90b3R5cGUudW5pZm9ybSA9IGZ1bmN0aW9uIChtZXRob2QsIG5hbWUpIC8vIG1ldGhvZC1hcHByb3ByaWF0ZSBhcmd1bWVudHMgZm9sbG93XG57XG4gICAgaWYgKCF0aGlzLmNvbXBpbGVkKSB7XG4gICAgICAgIHJldHVybjtcbiAgICB9XG5cbiAgICB2YXIgdW5pZm9ybSA9ICh0aGlzLnVuaWZvcm1zW25hbWVdID0gdGhpcy51bmlmb3Jtc1tuYW1lXSB8fCB7fSk7XG4gICAgdW5pZm9ybS5uYW1lID0gbmFtZTtcbiAgICB1bmlmb3JtLmxvY2F0aW9uID0gdW5pZm9ybS5sb2NhdGlvbiB8fCB0aGlzLmdsLmdldFVuaWZvcm1Mb2NhdGlvbih0aGlzLnByb2dyYW0sIG5hbWUpO1xuICAgIHVuaWZvcm0ubWV0aG9kID0gJ3VuaWZvcm0nICsgbWV0aG9kO1xuICAgIHVuaWZvcm0udmFsdWVzID0gQXJyYXkucHJvdG90eXBlLnNsaWNlLmNhbGwoYXJndW1lbnRzLCAyKTtcbiAgICB0aGlzLnVwZGF0ZVVuaWZvcm0obmFtZSk7XG59O1xuXG4vLyBTZXQgYSBzaW5nbGUgdW5pZm9ybVxuR0xQcm9ncmFtLnByb3RvdHlwZS51cGRhdGVVbmlmb3JtID0gZnVuY3Rpb24gKG5hbWUpXG57XG4gICAgaWYgKCF0aGlzLmNvbXBpbGVkKSB7XG4gICAgICAgIHJldHVybjtcbiAgICB9XG5cbiAgICB2YXIgdW5pZm9ybSA9IHRoaXMudW5pZm9ybXNbbmFtZV07XG4gICAgaWYgKHVuaWZvcm0gPT0gbnVsbCB8fCB1bmlmb3JtLmxvY2F0aW9uID09IG51bGwpIHtcbiAgICAgICAgcmV0dXJuO1xuICAgIH1cblxuICAgIHRoaXMudXNlKCk7XG4gICAgdGhpcy5nbFt1bmlmb3JtLm1ldGhvZF0uYXBwbHkodGhpcy5nbCwgW3VuaWZvcm0ubG9jYXRpb25dLmNvbmNhdCh1bmlmb3JtLnZhbHVlcykpOyAvLyBjYWxsIGFwcHJvcHJpYXRlIEdMIHVuaWZvcm0gbWV0aG9kIGFuZCBwYXNzIHRocm91Z2ggYXJndW1lbnRzXG59O1xuXG4vLyBSZWZyZXNoIHVuaWZvcm0gbG9jYXRpb25zIGFuZCBzZXQgdG8gbGFzdCBjYWNoZWQgdmFsdWVzXG5HTFByb2dyYW0ucHJvdG90eXBlLnJlZnJlc2hVbmlmb3JtcyA9IGZ1bmN0aW9uICgpXG57XG4gICAgaWYgKCF0aGlzLmNvbXBpbGVkKSB7XG4gICAgICAgIHJldHVybjtcbiAgICB9XG5cbiAgICBmb3IgKHZhciB1IGluIHRoaXMudW5pZm9ybXMpIHtcbiAgICAgICAgdGhpcy51bmlmb3Jtc1t1XS5sb2NhdGlvbiA9IHRoaXMuZ2wuZ2V0VW5pZm9ybUxvY2F0aW9uKHRoaXMucHJvZ3JhbSwgdSk7XG4gICAgICAgIHRoaXMudXBkYXRlVW5pZm9ybSh1KTtcbiAgICB9XG59O1xuXG5HTFByb2dyYW0ucHJvdG90eXBlLnJlZnJlc2hBdHRyaWJ1dGVzID0gZnVuY3Rpb24gKClcbntcbiAgICAvLyB2YXIgbGVuID0gdGhpcy5nbC5nZXRQcm9ncmFtUGFyYW1ldGVyKHRoaXMucHJvZ3JhbSwgdGhpcy5nbC5BQ1RJVkVfQVRUUklCVVRFUyk7XG4gICAgLy8gZm9yICh2YXIgaT0wOyBpIDwgbGVuOyBpKyspIHtcbiAgICAvLyAgICAgdmFyIGEgPSB0aGlzLmdsLmdldEFjdGl2ZUF0dHJpYih0aGlzLnByb2dyYW0sIGkpO1xuICAgIC8vICAgICBjb25zb2xlLmxvZyhhKTtcbiAgICAvLyB9XG4gICAgdGhpcy5hdHRyaWJzID0ge307XG59O1xuXG4vLyBHZXQgdGhlIGxvY2F0aW9uIG9mIGEgdmVydGV4IGF0dHJpYnV0ZVxuR0xQcm9ncmFtLnByb3RvdHlwZS5hdHRyaWJ1dGUgPSBmdW5jdGlvbiAobmFtZSlcbntcbiAgICBpZiAoIXRoaXMuY29tcGlsZWQpIHtcbiAgICAgICAgcmV0dXJuO1xuICAgIH1cblxuICAgIHZhciBhdHRyaWIgPSAodGhpcy5hdHRyaWJzW25hbWVdID0gdGhpcy5hdHRyaWJzW25hbWVdIHx8IHt9KTtcbiAgICBpZiAoYXR0cmliLmxvY2F0aW9uICE9IG51bGwpIHtcbiAgICAgICAgcmV0dXJuIGF0dHJpYjtcbiAgICB9XG5cbiAgICBhdHRyaWIubmFtZSA9IG5hbWU7XG4gICAgYXR0cmliLmxvY2F0aW9uID0gdGhpcy5nbC5nZXRBdHRyaWJMb2NhdGlvbih0aGlzLnByb2dyYW0sIG5hbWUpO1xuXG4gICAgLy8gdmFyIGluZm8gPSB0aGlzLmdsLmdldEFjdGl2ZUF0dHJpYih0aGlzLnByb2dyYW0sIGF0dHJpYi5sb2NhdGlvbik7XG4gICAgLy8gYXR0cmliLnR5cGUgPSBpbmZvLnR5cGU7XG4gICAgLy8gYXR0cmliLnNpemUgPSBpbmZvLnNpemU7XG5cbiAgICByZXR1cm4gYXR0cmliO1xufTtcbiIsIi8vIEdlbmVyYXRlZCBmcm9tIEdMU0wgZmlsZXMsIGRvbid0IGVkaXQhXG52YXIgc2hhZGVyX3NvdXJjZXMgPSB7fTtcblxuc2hhZGVyX3NvdXJjZXNbJ3BvaW50X2ZyYWdtZW50J10gPVxuXCJcXG5cIiArXG5cIiNkZWZpbmUgR0xTTElGWSAxXFxuXCIgK1xuXCJcXG5cIiArXG5cInVuaWZvcm0gdmVjMiB1X3Jlc29sdXRpb247XFxuXCIgK1xuXCJ2YXJ5aW5nIHZlYzMgdl9jb2xvcjtcXG5cIiArXG5cInZhcnlpbmcgdmVjMiB2X3RleGNvb3JkO1xcblwiICtcblwidm9pZCBtYWluKHZvaWQpIHtcXG5cIiArXG5cIiAgdmVjMyBjb2xvciA9IHZfY29sb3I7XFxuXCIgK1xuXCIgIHZlYzMgbGlnaHRpbmcgPSB2ZWMzKDEuKTtcXG5cIiArXG5cIiAgZmxvYXQgbGVuID0gbGVuZ3RoKHZfdGV4Y29vcmQpO1xcblwiICtcblwiICBpZihsZW4gPiAxLikge1xcblwiICtcblwiICAgIGRpc2NhcmQ7XFxuXCIgK1xuXCIgIH1cXG5cIiArXG5cIiAgY29sb3IgKj0gKDEuIC0gc21vb3Roc3RlcCguMjUsIDEuLCBsZW4pKSArIDAuNTtcXG5cIiArXG5cIiAgI3ByYWdtYSB0YW5ncmFtOiBmcmFnbWVudFxcblwiICtcblwiICBnbF9GcmFnQ29sb3IgPSB2ZWM0KGNvbG9yLCAxLik7XFxuXCIgK1xuXCJ9XFxuXCIgK1xuXCJcIjtcblxuc2hhZGVyX3NvdXJjZXNbJ3BvaW50X3ZlcnRleCddID1cblwiXFxuXCIgK1xuXCIjZGVmaW5lIEdMU0xJRlkgMVxcblwiICtcblwiXFxuXCIgK1xuXCJ1bmlmb3JtIG1hdDQgdV90aWxlX3ZpZXc7XFxuXCIgK1xuXCJ1bmlmb3JtIG1hdDQgdV9wZXJzcGVjdGl2ZTtcXG5cIiArXG5cInVuaWZvcm0gZmxvYXQgdV9udW1fbGF5ZXJzO1xcblwiICtcblwiYXR0cmlidXRlIHZlYzMgYV9wb3NpdGlvbjtcXG5cIiArXG5cImF0dHJpYnV0ZSB2ZWMyIGFfdGV4Y29vcmQ7XFxuXCIgK1xuXCJhdHRyaWJ1dGUgdmVjMyBhX2NvbG9yO1xcblwiICtcblwiYXR0cmlidXRlIGZsb2F0IGFfbGF5ZXI7XFxuXCIgK1xuXCJ2YXJ5aW5nIHZlYzMgdl9jb2xvcjtcXG5cIiArXG5cInZhcnlpbmcgdmVjMiB2X3RleGNvb3JkO1xcblwiICtcblwiI2lmIGRlZmluZWQoRkVBVFVSRV9TRUxFQ1RJT04pXFxuXCIgK1xuXCJcXG5cIiArXG5cImF0dHJpYnV0ZSB2ZWM0IGFfc2VsZWN0aW9uX2NvbG9yO1xcblwiICtcblwidmFyeWluZyB2ZWM0IHZfc2VsZWN0aW9uX2NvbG9yO1xcblwiICtcblwiI2VuZGlmXFxuXCIgK1xuXCJcXG5cIiArXG5cImZsb2F0IGFfeF9jYWxjdWxhdGVaKGZsb2F0IHosIGZsb2F0IGxheWVyLCBjb25zdCBmbG9hdCBudW1fbGF5ZXJzLCBjb25zdCBmbG9hdCB6X2xheWVyX3NjYWxlKSB7XFxuXCIgK1xuXCIgIGZsb2F0IHpfbGF5ZXJfcmFuZ2UgPSAobnVtX2xheWVycyArIDEuKSAqIHpfbGF5ZXJfc2NhbGU7XFxuXCIgK1xuXCIgIGZsb2F0IHpfbGF5ZXIgPSAobGF5ZXIgKyAxLikgKiB6X2xheWVyX3NjYWxlO1xcblwiICtcblwiICB6ID0gel9sYXllciArIGNsYW1wKHosIDAuLCB6X2xheWVyX3NjYWxlKTtcXG5cIiArXG5cIiAgeiA9ICh6X2xheWVyX3JhbmdlIC0geikgLyB6X2xheWVyX3JhbmdlO1xcblwiICtcblwiICByZXR1cm4gejtcXG5cIiArXG5cIn1cXG5cIiArXG5cIiNwcmFnbWEgdGFuZ3JhbTogZ2xvYmFsc1xcblwiICtcblwiXFxuXCIgK1xuXCJ2b2lkIG1haW4oKSB7XFxuXCIgK1xuXCIgIFxcblwiICtcblwiICAjaWYgZGVmaW5lZChGRUFUVVJFX1NFTEVDVElPTilcXG5cIiArXG5cIiAgaWYoYV9zZWxlY3Rpb25fY29sb3IueHl6ID09IHZlYzMoMC4pKSB7XFxuXCIgK1xuXCIgICAgZ2xfUG9zaXRpb24gPSB2ZWM0KDAuLCAwLiwgMC4sIDEuKTtcXG5cIiArXG5cIiAgICByZXR1cm47XFxuXCIgK1xuXCIgIH1cXG5cIiArXG5cIiAgdl9zZWxlY3Rpb25fY29sb3IgPSBhX3NlbGVjdGlvbl9jb2xvcjtcXG5cIiArXG5cIiAgI2VuZGlmXFxuXCIgK1xuXCIgIHZlYzQgcG9zaXRpb24gPSB1X3BlcnNwZWN0aXZlICogdV90aWxlX3ZpZXcgKiB2ZWM0KGFfcG9zaXRpb24sIDEuKTtcXG5cIiArXG5cIiAgI3ByYWdtYSB0YW5ncmFtOiB2ZXJ0ZXhcXG5cIiArXG5cIiAgdl9jb2xvciA9IGFfY29sb3I7XFxuXCIgK1xuXCIgIHZfdGV4Y29vcmQgPSBhX3RleGNvb3JkO1xcblwiICtcblwiICBwb3NpdGlvbi56IC09IGFfbGF5ZXIgKiAuMDAxO1xcblwiICtcblwiICBnbF9Qb3NpdGlvbiA9IHBvc2l0aW9uO1xcblwiICtcblwifVxcblwiICtcblwiXCI7XG5cbnNoYWRlcl9zb3VyY2VzWydwb2x5Z29uX2ZyYWdtZW50J10gPVxuXCJcXG5cIiArXG5cIiNkZWZpbmUgR0xTTElGWSAxXFxuXCIgK1xuXCJcXG5cIiArXG5cInVuaWZvcm0gdmVjMiB1X3Jlc29sdXRpb247XFxuXCIgK1xuXCJ1bmlmb3JtIHZlYzIgdV9hc3BlY3Q7XFxuXCIgK1xuXCJ1bmlmb3JtIG1hdDQgdV9tZXRlcl92aWV3O1xcblwiICtcblwidW5pZm9ybSBmbG9hdCB1X21ldGVyc19wZXJfcGl4ZWw7XFxuXCIgK1xuXCJ1bmlmb3JtIGZsb2F0IHVfdGltZTtcXG5cIiArXG5cInVuaWZvcm0gZmxvYXQgdV9tYXBfem9vbTtcXG5cIiArXG5cInVuaWZvcm0gdmVjMiB1X21hcF9jZW50ZXI7XFxuXCIgK1xuXCJ1bmlmb3JtIHZlYzIgdV90aWxlX29yaWdpbjtcXG5cIiArXG5cInVuaWZvcm0gZmxvYXQgdV90ZXN0O1xcblwiICtcblwidW5pZm9ybSBmbG9hdCB1X3Rlc3QyO1xcblwiICtcblwidmFyeWluZyB2ZWMzIHZfY29sb3I7XFxuXCIgK1xuXCJ2YXJ5aW5nIHZlYzQgdl93b3JsZF9wb3NpdGlvbjtcXG5cIiArXG5cIiNpZiBkZWZpbmVkKFdPUkxEX1BPU0lUSU9OX1dSQVApXFxuXCIgK1xuXCJcXG5cIiArXG5cInZlYzIgd29ybGRfcG9zaXRpb25fYW5jaG9yID0gdmVjMihmbG9vcih1X3RpbGVfb3JpZ2luIC8gV09STERfUE9TSVRJT05fV1JBUCkgKiBXT1JMRF9QT1NJVElPTl9XUkFQKTtcXG5cIiArXG5cInZlYzQgYWJzb2x1dGVXb3JsZFBvc2l0aW9uKCkge1xcblwiICtcblwiICByZXR1cm4gdmVjNCh2X3dvcmxkX3Bvc2l0aW9uLnh5ICsgd29ybGRfcG9zaXRpb25fYW5jaG9yLCB2X3dvcmxkX3Bvc2l0aW9uLnosIHZfd29ybGRfcG9zaXRpb24udyk7XFxuXCIgK1xuXCJ9XFxuXCIgK1xuXCIjZWxzZVxcblwiICtcblwiXFxuXCIgK1xuXCJ2ZWM0IGFic29sdXRlV29ybGRQb3NpdGlvbigpIHtcXG5cIiArXG5cIiAgcmV0dXJuIHZfd29ybGRfcG9zaXRpb247XFxuXCIgK1xuXCJ9XFxuXCIgK1xuXCIjZW5kaWZcXG5cIiArXG5cIlxcblwiICtcblwiI2lmIGRlZmluZWQoTElHSFRJTkdfRU5WSVJPTk1FTlQpXFxuXCIgK1xuXCJcXG5cIiArXG5cInVuaWZvcm0gc2FtcGxlcjJEIHVfZW52X21hcDtcXG5cIiArXG5cIiNlbmRpZlxcblwiICtcblwiXFxuXCIgK1xuXCIjaWYgIWRlZmluZWQoTElHSFRJTkdfVkVSVEVYKVxcblwiICtcblwiXFxuXCIgK1xuXCJ2YXJ5aW5nIHZlYzQgdl9wb3NpdGlvbjtcXG5cIiArXG5cInZhcnlpbmcgdmVjMyB2X25vcm1hbDtcXG5cIiArXG5cIiNlbHNlXFxuXCIgK1xuXCJcXG5cIiArXG5cInZhcnlpbmcgdmVjMyB2X2xpZ2h0aW5nO1xcblwiICtcblwiI2VuZGlmXFxuXCIgK1xuXCJcXG5cIiArXG5cImNvbnN0IGZsb2F0IGxpZ2h0X2FtYmllbnQgPSAwLjU7XFxuXCIgK1xuXCJ2ZWMzIGJfeF9wb2ludExpZ2h0KHZlYzQgcG9zaXRpb24sIHZlYzMgbm9ybWFsLCB2ZWMzIGNvbG9yLCB2ZWM0IGxpZ2h0X3BvcywgZmxvYXQgbGlnaHRfYW1iaWVudCwgY29uc3QgYm9vbCBiYWNrbGlnaHQpIHtcXG5cIiArXG5cIiAgdmVjMyBsaWdodF9kaXIgPSBub3JtYWxpemUocG9zaXRpb24ueHl6IC0gbGlnaHRfcG9zLnh5eik7XFxuXCIgK1xuXCIgIGNvbG9yICo9IGFicyhtYXgoZmxvYXQoYmFja2xpZ2h0KSAqIC0xLiwgZG90KG5vcm1hbCwgbGlnaHRfZGlyICogLTEuMCkpKSArIGxpZ2h0X2FtYmllbnQ7XFxuXCIgK1xuXCIgIHJldHVybiBjb2xvcjtcXG5cIiArXG5cIn1cXG5cIiArXG5cInZlYzMgY194X3NwZWN1bGFyTGlnaHQodmVjNCBwb3NpdGlvbiwgdmVjMyBub3JtYWwsIHZlYzMgY29sb3IsIHZlYzQgbGlnaHRfcG9zLCBmbG9hdCBsaWdodF9hbWJpZW50LCBjb25zdCBib29sIGJhY2tsaWdodCkge1xcblwiICtcblwiICB2ZWMzIGxpZ2h0X2RpciA9IG5vcm1hbGl6ZShwb3NpdGlvbi54eXogLSBsaWdodF9wb3MueHl6KTtcXG5cIiArXG5cIiAgdmVjMyB2aWV3X3BvcyA9IHZlYzMoMC4sIDAuLCA1MDAuKTtcXG5cIiArXG5cIiAgdmVjMyB2aWV3X2RpciA9IG5vcm1hbGl6ZShwb3NpdGlvbi54eXogLSB2aWV3X3Bvcy54eXopO1xcblwiICtcblwiICB2ZWMzIHNwZWN1bGFyUmVmbGVjdGlvbjtcXG5cIiArXG5cIiAgaWYoZG90KG5vcm1hbCwgLWxpZ2h0X2RpcikgPCAwLjApIHtcXG5cIiArXG5cIiAgICBzcGVjdWxhclJlZmxlY3Rpb24gPSB2ZWMzKDAuMCwgMC4wLCAwLjApO1xcblwiICtcblwiICB9IGVsc2Uge1xcblwiICtcblwiICAgIGZsb2F0IGF0dGVudWF0aW9uID0gMS4wO1xcblwiICtcblwiICAgIGZsb2F0IGxpZ2h0U3BlY3VsYXJUZXJtID0gMS4wO1xcblwiICtcblwiICAgIGZsb2F0IG1hdGVyaWFsU3BlY3VsYXJUZXJtID0gMTAuMDtcXG5cIiArXG5cIiAgICBmbG9hdCBtYXRlcmlhbFNoaW5pbmVzc1Rlcm0gPSAxMC4wO1xcblwiICtcblwiICAgIHNwZWN1bGFyUmVmbGVjdGlvbiA9IGF0dGVudWF0aW9uICogdmVjMyhsaWdodFNwZWN1bGFyVGVybSkgKiB2ZWMzKG1hdGVyaWFsU3BlY3VsYXJUZXJtKSAqIHBvdyhtYXgoMC4wLCBkb3QocmVmbGVjdCgtbGlnaHRfZGlyLCBub3JtYWwpLCB2aWV3X2RpcikpLCBtYXRlcmlhbFNoaW5pbmVzc1Rlcm0pO1xcblwiICtcblwiICB9XFxuXCIgK1xuXCIgIGZsb2F0IGRpZmZ1c2UgPSBhYnMobWF4KGZsb2F0KGJhY2tsaWdodCkgKiAtMS4sIGRvdChub3JtYWwsIGxpZ2h0X2RpciAqIC0xLjApKSk7XFxuXCIgK1xuXCIgIGNvbG9yICo9IGRpZmZ1c2UgKyBzcGVjdWxhclJlZmxlY3Rpb24gKyBsaWdodF9hbWJpZW50O1xcblwiICtcblwiICByZXR1cm4gY29sb3I7XFxuXCIgK1xuXCJ9XFxuXCIgK1xuXCJ2ZWMzIGRfeF9kaXJlY3Rpb25hbExpZ2h0KHZlYzMgbm9ybWFsLCB2ZWMzIGNvbG9yLCB2ZWMzIGxpZ2h0X2RpciwgZmxvYXQgbGlnaHRfYW1iaWVudCkge1xcblwiICtcblwiICBsaWdodF9kaXIgPSBub3JtYWxpemUobGlnaHRfZGlyKTtcXG5cIiArXG5cIiAgY29sb3IgKj0gZG90KG5vcm1hbCwgbGlnaHRfZGlyICogLTEuMCkgKyBsaWdodF9hbWJpZW50O1xcblwiICtcblwiICByZXR1cm4gY29sb3I7XFxuXCIgK1xuXCJ9XFxuXCIgK1xuXCJ2ZWMzIGFfeF9saWdodGluZyh2ZWM0IHBvc2l0aW9uLCB2ZWMzIG5vcm1hbCwgdmVjMyBjb2xvciwgdmVjNCBsaWdodF9wb3MsIHZlYzQgbmlnaHRfbGlnaHRfcG9zLCB2ZWMzIGxpZ2h0X2RpciwgZmxvYXQgbGlnaHRfYW1iaWVudCkge1xcblwiICtcblwiICBcXG5cIiArXG5cIiAgI2lmIGRlZmluZWQoTElHSFRJTkdfUE9JTlQpXFxuXCIgK1xuXCIgIGNvbG9yID0gYl94X3BvaW50TGlnaHQocG9zaXRpb24sIG5vcm1hbCwgY29sb3IsIGxpZ2h0X3BvcywgbGlnaHRfYW1iaWVudCwgdHJ1ZSk7XFxuXCIgK1xuXCIgICNlbGlmIGRlZmluZWQoTElHSFRJTkdfUE9JTlRfU1BFQ1VMQVIpXFxuXCIgK1xuXCIgIGNvbG9yID0gY194X3NwZWN1bGFyTGlnaHQocG9zaXRpb24sIG5vcm1hbCwgY29sb3IsIGxpZ2h0X3BvcywgbGlnaHRfYW1iaWVudCwgdHJ1ZSk7XFxuXCIgK1xuXCIgICNlbGlmIGRlZmluZWQoTElHSFRJTkdfTklHSFQpXFxuXCIgK1xuXCIgIGNvbG9yID0gYl94X3BvaW50TGlnaHQocG9zaXRpb24sIG5vcm1hbCwgY29sb3IsIG5pZ2h0X2xpZ2h0X3BvcywgMC4sIGZhbHNlKTtcXG5cIiArXG5cIiAgI2VsaWYgZGVmaW5lZChMSUdIVElOR19ESVJFQ1RJT04pXFxuXCIgK1xuXCIgIGNvbG9yID0gZF94X2RpcmVjdGlvbmFsTGlnaHQobm9ybWFsLCBjb2xvciwgbGlnaHRfZGlyLCBsaWdodF9hbWJpZW50KTtcXG5cIiArXG5cIiAgI2Vsc2VcXG5cIiArXG5cIiAgY29sb3IgPSBjb2xvcjtcXG5cIiArXG5cIiAgI2VuZGlmXFxuXCIgK1xuXCIgIHJldHVybiBjb2xvcjtcXG5cIiArXG5cIn1cXG5cIiArXG5cInZlYzQgZV94X3NwaGVyaWNhbEVudmlyb25tZW50TWFwKHZlYzMgdmlld19wb3MsIHZlYzMgcG9zaXRpb24sIHZlYzMgbm9ybWFsLCBzYW1wbGVyMkQgZW52bWFwKSB7XFxuXCIgK1xuXCIgIHZlYzMgZXllID0gbm9ybWFsaXplKHBvc2l0aW9uLnh5eiAtIHZpZXdfcG9zLnh5eik7XFxuXCIgK1xuXCIgIGlmKGV5ZS56ID4gMC4wMSkge1xcblwiICtcblwiICAgIGV5ZS56ID0gMC4wMTtcXG5cIiArXG5cIiAgfVxcblwiICtcblwiICB2ZWMzIHIgPSByZWZsZWN0KGV5ZSwgbm9ybWFsKTtcXG5cIiArXG5cIiAgZmxvYXQgbSA9IDIuICogc3FydChwb3coci54LCAyLikgKyBwb3coci55LCAyLikgKyBwb3coci56ICsgMS4sIDIuKSk7XFxuXCIgK1xuXCIgIHZlYzIgdXYgPSByLnh5IC8gbSArIC41O1xcblwiICtcblwiICByZXR1cm4gdGV4dHVyZTJEKGVudm1hcCwgdXYpO1xcblwiICtcblwifVxcblwiICtcblwiI3ByYWdtYSB0YW5ncmFtOiBnbG9iYWxzXFxuXCIgK1xuXCJcXG5cIiArXG5cInZvaWQgbWFpbih2b2lkKSB7XFxuXCIgK1xuXCIgIHZlYzMgY29sb3IgPSB2X2NvbG9yO1xcblwiICtcblwiICAjaWYgZGVmaW5lZChMSUdIVElOR19FTlZJUk9OTUVOVClcXG5cIiArXG5cIiAgdmVjMyB2aWV3X3BvcyA9IHZlYzMoMC4sIDAuLCAxMDAuICogdV9tZXRlcnNfcGVyX3BpeGVsKTtcXG5cIiArXG5cIiAgY29sb3IgPSBlX3hfc3BoZXJpY2FsRW52aXJvbm1lbnRNYXAodmlld19wb3MsIHZfcG9zaXRpb24ueHl6LCB2X25vcm1hbCwgdV9lbnZfbWFwKS5yZ2I7XFxuXCIgK1xuXCIgICNlbmRpZlxcblwiICtcblwiICBcXG5cIiArXG5cIiAgI2lmICFkZWZpbmVkKExJR0hUSU5HX1ZFUlRFWCkgLy8gZGVmYXVsdCB0byBwZXItcGl4ZWwgbGlnaHRpbmdcXG5cIiArXG5cIiAgdmVjMyBsaWdodGluZyA9IGFfeF9saWdodGluZyh2X3Bvc2l0aW9uLCB2X25vcm1hbCwgdmVjMygxLiksIHZlYzQoMC4sIDAuLCAxNTAuICogdV9tZXRlcnNfcGVyX3BpeGVsLCAxLiksIHZlYzQoMC4sIDAuLCA1MC4gKiB1X21ldGVyc19wZXJfcGl4ZWwsIDEuKSwgdmVjMygwLjIsIDAuNywgLTAuNSksIGxpZ2h0X2FtYmllbnQpO1xcblwiICtcblwiICAjZWxzZVxcblwiICtcblwiICB2ZWMzIGxpZ2h0aW5nID0gdl9saWdodGluZztcXG5cIiArXG5cIiAgI2VuZGlmXFxuXCIgK1xuXCIgIHZlYzMgY29sb3JfcHJlbGlnaHQgPSBjb2xvcjtcXG5cIiArXG5cIiAgY29sb3IgKj0gbGlnaHRpbmc7XFxuXCIgK1xuXCIgICNwcmFnbWEgdGFuZ3JhbTogZnJhZ21lbnRcXG5cIiArXG5cIiAgZ2xfRnJhZ0NvbG9yID0gdmVjNChjb2xvciwgMS4wKTtcXG5cIiArXG5cIn1cXG5cIiArXG5cIlwiO1xuXG5zaGFkZXJfc291cmNlc1sncG9seWdvbl92ZXJ0ZXgnXSA9XG5cIlxcblwiICtcblwiI2RlZmluZSBHTFNMSUZZIDFcXG5cIiArXG5cIlxcblwiICtcblwidW5pZm9ybSB2ZWMyIHVfcmVzb2x1dGlvbjtcXG5cIiArXG5cInVuaWZvcm0gdmVjMiB1X2FzcGVjdDtcXG5cIiArXG5cInVuaWZvcm0gZmxvYXQgdV90aW1lO1xcblwiICtcblwidW5pZm9ybSBmbG9hdCB1X21hcF96b29tO1xcblwiICtcblwidW5pZm9ybSB2ZWMyIHVfbWFwX2NlbnRlcjtcXG5cIiArXG5cInVuaWZvcm0gdmVjMiB1X3RpbGVfb3JpZ2luO1xcblwiICtcblwidW5pZm9ybSBtYXQ0IHVfdGlsZV93b3JsZDtcXG5cIiArXG5cInVuaWZvcm0gbWF0NCB1X3RpbGVfdmlldztcXG5cIiArXG5cInVuaWZvcm0gbWF0NCB1X3BlcnNwZWN0aXZlO1xcblwiICtcblwidW5pZm9ybSBmbG9hdCB1X21ldGVyc19wZXJfcGl4ZWw7XFxuXCIgK1xuXCJ1bmlmb3JtIGZsb2F0IHVfbnVtX2xheWVycztcXG5cIiArXG5cImF0dHJpYnV0ZSB2ZWMzIGFfcG9zaXRpb247XFxuXCIgK1xuXCJhdHRyaWJ1dGUgdmVjMyBhX25vcm1hbDtcXG5cIiArXG5cImF0dHJpYnV0ZSB2ZWMzIGFfY29sb3I7XFxuXCIgK1xuXCJhdHRyaWJ1dGUgZmxvYXQgYV9sYXllcjtcXG5cIiArXG5cInZhcnlpbmcgdmVjNCB2X3dvcmxkX3Bvc2l0aW9uO1xcblwiICtcblwidmFyeWluZyB2ZWMzIHZfY29sb3I7XFxuXCIgK1xuXCIjaWYgZGVmaW5lZChXT1JMRF9QT1NJVElPTl9XUkFQKVxcblwiICtcblwiXFxuXCIgK1xuXCJ2ZWMyIHdvcmxkX3Bvc2l0aW9uX2FuY2hvciA9IHZlYzIoZmxvb3IodV90aWxlX29yaWdpbiAvIFdPUkxEX1BPU0lUSU9OX1dSQVApICogV09STERfUE9TSVRJT05fV1JBUCk7XFxuXCIgK1xuXCJ2ZWM0IGFic29sdXRlV29ybGRQb3NpdGlvbigpIHtcXG5cIiArXG5cIiAgcmV0dXJuIHZlYzQodl93b3JsZF9wb3NpdGlvbi54eSArIHdvcmxkX3Bvc2l0aW9uX2FuY2hvciwgdl93b3JsZF9wb3NpdGlvbi56LCB2X3dvcmxkX3Bvc2l0aW9uLncpO1xcblwiICtcblwifVxcblwiICtcblwiI2Vsc2VcXG5cIiArXG5cIlxcblwiICtcblwidmVjNCBhYnNvbHV0ZVdvcmxkUG9zaXRpb24oKSB7XFxuXCIgK1xuXCIgIHJldHVybiB2X3dvcmxkX3Bvc2l0aW9uO1xcblwiICtcblwifVxcblwiICtcblwiI2VuZGlmXFxuXCIgK1xuXCJcXG5cIiArXG5cIiNpZiBkZWZpbmVkKEZFQVRVUkVfU0VMRUNUSU9OKVxcblwiICtcblwiXFxuXCIgK1xuXCJhdHRyaWJ1dGUgdmVjNCBhX3NlbGVjdGlvbl9jb2xvcjtcXG5cIiArXG5cInZhcnlpbmcgdmVjNCB2X3NlbGVjdGlvbl9jb2xvcjtcXG5cIiArXG5cIiNlbmRpZlxcblwiICtcblwiXFxuXCIgK1xuXCIjaWYgIWRlZmluZWQoTElHSFRJTkdfVkVSVEVYKVxcblwiICtcblwiXFxuXCIgK1xuXCJ2YXJ5aW5nIHZlYzQgdl9wb3NpdGlvbjtcXG5cIiArXG5cInZhcnlpbmcgdmVjMyB2X25vcm1hbDtcXG5cIiArXG5cIiNlbHNlXFxuXCIgK1xuXCJcXG5cIiArXG5cInZhcnlpbmcgdmVjMyB2X2xpZ2h0aW5nO1xcblwiICtcblwiI2VuZGlmXFxuXCIgK1xuXCJcXG5cIiArXG5cImNvbnN0IGZsb2F0IGxpZ2h0X2FtYmllbnQgPSAwLjU7XFxuXCIgK1xuXCJ2ZWM0IGFfeF9wZXJzcGVjdGl2ZSh2ZWM0IHBvc2l0aW9uLCBjb25zdCB2ZWMyIHBlcnNwZWN0aXZlX29mZnNldCwgY29uc3QgdmVjMiBwZXJzcGVjdGl2ZV9mYWN0b3IpIHtcXG5cIiArXG5cIiAgcG9zaXRpb24ueHkgKz0gcG9zaXRpb24ueiAqIHBlcnNwZWN0aXZlX2ZhY3RvciAqIChwb3NpdGlvbi54eSAtIHBlcnNwZWN0aXZlX29mZnNldCk7XFxuXCIgK1xuXCIgIHJldHVybiBwb3NpdGlvbjtcXG5cIiArXG5cIn1cXG5cIiArXG5cInZlYzQgYl94X2lzb21ldHJpYyh2ZWM0IHBvc2l0aW9uLCBjb25zdCB2ZWMyIGF4aXMsIGNvbnN0IGZsb2F0IG11bHRpcGxpZXIpIHtcXG5cIiArXG5cIiAgcG9zaXRpb24ueHkgKz0gcG9zaXRpb24ueiAqIGF4aXMgKiBtdWx0aXBsaWVyIC8gdV9hc3BlY3Q7XFxuXCIgK1xuXCIgIHJldHVybiBwb3NpdGlvbjtcXG5cIiArXG5cIn1cXG5cIiArXG5cImZsb2F0IGNfeF9jYWxjdWxhdGVaKGZsb2F0IHosIGZsb2F0IGxheWVyLCBjb25zdCBmbG9hdCBudW1fbGF5ZXJzLCBjb25zdCBmbG9hdCB6X2xheWVyX3NjYWxlKSB7XFxuXCIgK1xuXCIgIGZsb2F0IHpfbGF5ZXJfcmFuZ2UgPSAobnVtX2xheWVycyArIDEuKSAqIHpfbGF5ZXJfc2NhbGU7XFxuXCIgK1xuXCIgIGZsb2F0IHpfbGF5ZXIgPSAobGF5ZXIgKyAxLikgKiB6X2xheWVyX3NjYWxlO1xcblwiICtcblwiICB6ID0gel9sYXllciArIGNsYW1wKHosIDAuLCB6X2xheWVyX3NjYWxlKTtcXG5cIiArXG5cIiAgeiA9ICh6X2xheWVyX3JhbmdlIC0geikgLyB6X2xheWVyX3JhbmdlO1xcblwiICtcblwiICByZXR1cm4gejtcXG5cIiArXG5cIn1cXG5cIiArXG5cInZlYzMgZV94X3BvaW50TGlnaHQodmVjNCBwb3NpdGlvbiwgdmVjMyBub3JtYWwsIHZlYzMgY29sb3IsIHZlYzQgbGlnaHRfcG9zLCBmbG9hdCBsaWdodF9hbWJpZW50LCBjb25zdCBib29sIGJhY2tsaWdodCkge1xcblwiICtcblwiICB2ZWMzIGxpZ2h0X2RpciA9IG5vcm1hbGl6ZShwb3NpdGlvbi54eXogLSBsaWdodF9wb3MueHl6KTtcXG5cIiArXG5cIiAgY29sb3IgKj0gYWJzKG1heChmbG9hdChiYWNrbGlnaHQpICogLTEuLCBkb3Qobm9ybWFsLCBsaWdodF9kaXIgKiAtMS4wKSkpICsgbGlnaHRfYW1iaWVudDtcXG5cIiArXG5cIiAgcmV0dXJuIGNvbG9yO1xcblwiICtcblwifVxcblwiICtcblwidmVjMyBmX3hfc3BlY3VsYXJMaWdodCh2ZWM0IHBvc2l0aW9uLCB2ZWMzIG5vcm1hbCwgdmVjMyBjb2xvciwgdmVjNCBsaWdodF9wb3MsIGZsb2F0IGxpZ2h0X2FtYmllbnQsIGNvbnN0IGJvb2wgYmFja2xpZ2h0KSB7XFxuXCIgK1xuXCIgIHZlYzMgbGlnaHRfZGlyID0gbm9ybWFsaXplKHBvc2l0aW9uLnh5eiAtIGxpZ2h0X3Bvcy54eXopO1xcblwiICtcblwiICB2ZWMzIHZpZXdfcG9zID0gdmVjMygwLiwgMC4sIDUwMC4pO1xcblwiICtcblwiICB2ZWMzIHZpZXdfZGlyID0gbm9ybWFsaXplKHBvc2l0aW9uLnh5eiAtIHZpZXdfcG9zLnh5eik7XFxuXCIgK1xuXCIgIHZlYzMgc3BlY3VsYXJSZWZsZWN0aW9uO1xcblwiICtcblwiICBpZihkb3Qobm9ybWFsLCAtbGlnaHRfZGlyKSA8IDAuMCkge1xcblwiICtcblwiICAgIHNwZWN1bGFyUmVmbGVjdGlvbiA9IHZlYzMoMC4wLCAwLjAsIDAuMCk7XFxuXCIgK1xuXCIgIH0gZWxzZSB7XFxuXCIgK1xuXCIgICAgZmxvYXQgYXR0ZW51YXRpb24gPSAxLjA7XFxuXCIgK1xuXCIgICAgZmxvYXQgbGlnaHRTcGVjdWxhclRlcm0gPSAxLjA7XFxuXCIgK1xuXCIgICAgZmxvYXQgbWF0ZXJpYWxTcGVjdWxhclRlcm0gPSAxMC4wO1xcblwiICtcblwiICAgIGZsb2F0IG1hdGVyaWFsU2hpbmluZXNzVGVybSA9IDEwLjA7XFxuXCIgK1xuXCIgICAgc3BlY3VsYXJSZWZsZWN0aW9uID0gYXR0ZW51YXRpb24gKiB2ZWMzKGxpZ2h0U3BlY3VsYXJUZXJtKSAqIHZlYzMobWF0ZXJpYWxTcGVjdWxhclRlcm0pICogcG93KG1heCgwLjAsIGRvdChyZWZsZWN0KC1saWdodF9kaXIsIG5vcm1hbCksIHZpZXdfZGlyKSksIG1hdGVyaWFsU2hpbmluZXNzVGVybSk7XFxuXCIgK1xuXCIgIH1cXG5cIiArXG5cIiAgZmxvYXQgZGlmZnVzZSA9IGFicyhtYXgoZmxvYXQoYmFja2xpZ2h0KSAqIC0xLiwgZG90KG5vcm1hbCwgbGlnaHRfZGlyICogLTEuMCkpKTtcXG5cIiArXG5cIiAgY29sb3IgKj0gZGlmZnVzZSArIHNwZWN1bGFyUmVmbGVjdGlvbiArIGxpZ2h0X2FtYmllbnQ7XFxuXCIgK1xuXCIgIHJldHVybiBjb2xvcjtcXG5cIiArXG5cIn1cXG5cIiArXG5cInZlYzMgZ194X2RpcmVjdGlvbmFsTGlnaHQodmVjMyBub3JtYWwsIHZlYzMgY29sb3IsIHZlYzMgbGlnaHRfZGlyLCBmbG9hdCBsaWdodF9hbWJpZW50KSB7XFxuXCIgK1xuXCIgIGxpZ2h0X2RpciA9IG5vcm1hbGl6ZShsaWdodF9kaXIpO1xcblwiICtcblwiICBjb2xvciAqPSBkb3Qobm9ybWFsLCBsaWdodF9kaXIgKiAtMS4wKSArIGxpZ2h0X2FtYmllbnQ7XFxuXCIgK1xuXCIgIHJldHVybiBjb2xvcjtcXG5cIiArXG5cIn1cXG5cIiArXG5cInZlYzMgZF94X2xpZ2h0aW5nKHZlYzQgcG9zaXRpb24sIHZlYzMgbm9ybWFsLCB2ZWMzIGNvbG9yLCB2ZWM0IGxpZ2h0X3BvcywgdmVjNCBuaWdodF9saWdodF9wb3MsIHZlYzMgbGlnaHRfZGlyLCBmbG9hdCBsaWdodF9hbWJpZW50KSB7XFxuXCIgK1xuXCIgIFxcblwiICtcblwiICAjaWYgZGVmaW5lZChMSUdIVElOR19QT0lOVClcXG5cIiArXG5cIiAgY29sb3IgPSBlX3hfcG9pbnRMaWdodChwb3NpdGlvbiwgbm9ybWFsLCBjb2xvciwgbGlnaHRfcG9zLCBsaWdodF9hbWJpZW50LCB0cnVlKTtcXG5cIiArXG5cIiAgI2VsaWYgZGVmaW5lZChMSUdIVElOR19QT0lOVF9TUEVDVUxBUilcXG5cIiArXG5cIiAgY29sb3IgPSBmX3hfc3BlY3VsYXJMaWdodChwb3NpdGlvbiwgbm9ybWFsLCBjb2xvciwgbGlnaHRfcG9zLCBsaWdodF9hbWJpZW50LCB0cnVlKTtcXG5cIiArXG5cIiAgI2VsaWYgZGVmaW5lZChMSUdIVElOR19OSUdIVClcXG5cIiArXG5cIiAgY29sb3IgPSBlX3hfcG9pbnRMaWdodChwb3NpdGlvbiwgbm9ybWFsLCBjb2xvciwgbmlnaHRfbGlnaHRfcG9zLCAwLiwgZmFsc2UpO1xcblwiICtcblwiICAjZWxpZiBkZWZpbmVkKExJR0hUSU5HX0RJUkVDVElPTilcXG5cIiArXG5cIiAgY29sb3IgPSBnX3hfZGlyZWN0aW9uYWxMaWdodChub3JtYWwsIGNvbG9yLCBsaWdodF9kaXIsIGxpZ2h0X2FtYmllbnQpO1xcblwiICtcblwiICAjZWxzZVxcblwiICtcblwiICBjb2xvciA9IGNvbG9yO1xcblwiICtcblwiICAjZW5kaWZcXG5cIiArXG5cIiAgcmV0dXJuIGNvbG9yO1xcblwiICtcblwifVxcblwiICtcblwiI3ByYWdtYSB0YW5ncmFtOiBnbG9iYWxzXFxuXCIgK1xuXCJcXG5cIiArXG5cInZvaWQgbWFpbigpIHtcXG5cIiArXG5cIiAgXFxuXCIgK1xuXCIgICNpZiBkZWZpbmVkKEZFQVRVUkVfU0VMRUNUSU9OKVxcblwiICtcblwiICBpZihhX3NlbGVjdGlvbl9jb2xvci54eXogPT0gdmVjMygwLikpIHtcXG5cIiArXG5cIiAgICBnbF9Qb3NpdGlvbiA9IHZlYzQoMC4sIDAuLCAwLiwgMS4pO1xcblwiICtcblwiICAgIHJldHVybjtcXG5cIiArXG5cIiAgfVxcblwiICtcblwiICB2X3NlbGVjdGlvbl9jb2xvciA9IGFfc2VsZWN0aW9uX2NvbG9yO1xcblwiICtcblwiICAjZW5kaWZcXG5cIiArXG5cIiAgdmVjNCBwb3NpdGlvbiA9IHVfdGlsZV92aWV3ICogdmVjNChhX3Bvc2l0aW9uLCAxLik7XFxuXCIgK1xuXCIgIHZfd29ybGRfcG9zaXRpb24gPSB1X3RpbGVfd29ybGQgKiB2ZWM0KGFfcG9zaXRpb24sIDEuKTtcXG5cIiArXG5cIiAgI2lmIGRlZmluZWQoV09STERfUE9TSVRJT05fV1JBUClcXG5cIiArXG5cIiAgdl93b3JsZF9wb3NpdGlvbi54eSAtPSB3b3JsZF9wb3NpdGlvbl9hbmNob3I7XFxuXCIgK1xuXCIgICNlbmRpZlxcblwiICtcblwiICBcXG5cIiArXG5cIiAgI3ByYWdtYSB0YW5ncmFtOiB2ZXJ0ZXhcXG5cIiArXG5cIiAgXFxuXCIgK1xuXCIgICNpZiBkZWZpbmVkKExJR0hUSU5HX1ZFUlRFWClcXG5cIiArXG5cIiAgdl9jb2xvciA9IGFfY29sb3I7XFxuXCIgK1xuXCIgIHZfbGlnaHRpbmcgPSBkX3hfbGlnaHRpbmcocG9zaXRpb24sIGFfbm9ybWFsLCB2ZWMzKDEuKSwgdmVjNCgwLiwgMC4sIDE1MC4gKiB1X21ldGVyc19wZXJfcGl4ZWwsIDEuKSwgdmVjNCgwLiwgMC4sIDUwLiAqIHVfbWV0ZXJzX3Blcl9waXhlbCwgMS4pLCB2ZWMzKDAuMiwgMC43LCAtMC41KSwgbGlnaHRfYW1iaWVudCk7XFxuXCIgK1xuXCIgICNlbHNlXFxuXCIgK1xuXCIgIHZfcG9zaXRpb24gPSBwb3NpdGlvbjtcXG5cIiArXG5cIiAgdl9ub3JtYWwgPSBhX25vcm1hbDtcXG5cIiArXG5cIiAgdl9jb2xvciA9IGFfY29sb3I7XFxuXCIgK1xuXCIgICNlbmRpZlxcblwiICtcblwiICBwb3NpdGlvbiA9IHVfcGVyc3BlY3RpdmUgKiBwb3NpdGlvbjtcXG5cIiArXG5cIiAgcG9zaXRpb24ueiAtPSBhX2xheWVyICogLjAwMTtcXG5cIiArXG5cIiAgZ2xfUG9zaXRpb24gPSBwb3NpdGlvbjtcXG5cIiArXG5cIn1cXG5cIiArXG5cIlwiO1xuXG5zaGFkZXJfc291cmNlc1snc2VsZWN0aW9uX2ZyYWdtZW50J10gPVxuXCJcXG5cIiArXG5cIiNkZWZpbmUgR0xTTElGWSAxXFxuXCIgK1xuXCJcXG5cIiArXG5cIiNpZiBkZWZpbmVkKEZFQVRVUkVfU0VMRUNUSU9OKVxcblwiICtcblwiXFxuXCIgK1xuXCJ2YXJ5aW5nIHZlYzQgdl9zZWxlY3Rpb25fY29sb3I7XFxuXCIgK1xuXCIjZW5kaWZcXG5cIiArXG5cIlxcblwiICtcblwidm9pZCBtYWluKHZvaWQpIHtcXG5cIiArXG5cIiAgXFxuXCIgK1xuXCIgICNpZiBkZWZpbmVkKEZFQVRVUkVfU0VMRUNUSU9OKVxcblwiICtcblwiICBnbF9GcmFnQ29sb3IgPSB2X3NlbGVjdGlvbl9jb2xvcjtcXG5cIiArXG5cIiAgI2Vsc2VcXG5cIiArXG5cIiAgZ2xfRnJhZ0NvbG9yID0gdmVjNCgwLiwgMC4sIDAuLCAxLik7XFxuXCIgK1xuXCIgICNlbmRpZlxcblwiICtcblwiICBcXG5cIiArXG5cIn1cXG5cIiArXG5cIlwiO1xuXG5zaGFkZXJfc291cmNlc1snc2ltcGxlX3BvbHlnb25fZnJhZ21lbnQnXSA9XG5cIlxcblwiICtcblwiI2RlZmluZSBHTFNMSUZZIDFcXG5cIiArXG5cIlxcblwiICtcblwidW5pZm9ybSBmbG9hdCB1X21ldGVyc19wZXJfcGl4ZWw7XFxuXCIgK1xuXCJ2YXJ5aW5nIHZlYzMgdl9jb2xvcjtcXG5cIiArXG5cIiNpZiAhZGVmaW5lZChMSUdIVElOR19WRVJURVgpXFxuXCIgK1xuXCJcXG5cIiArXG5cInZhcnlpbmcgdmVjNCB2X3Bvc2l0aW9uO1xcblwiICtcblwidmFyeWluZyB2ZWMzIHZfbm9ybWFsO1xcblwiICtcblwiI2VuZGlmXFxuXCIgK1xuXCJcXG5cIiArXG5cInZlYzMgYV94X3BvaW50TGlnaHQodmVjNCBwb3NpdGlvbiwgdmVjMyBub3JtYWwsIHZlYzMgY29sb3IsIHZlYzQgbGlnaHRfcG9zLCBmbG9hdCBsaWdodF9hbWJpZW50LCBjb25zdCBib29sIGJhY2tsaWdodCkge1xcblwiICtcblwiICB2ZWMzIGxpZ2h0X2RpciA9IG5vcm1hbGl6ZShwb3NpdGlvbi54eXogLSBsaWdodF9wb3MueHl6KTtcXG5cIiArXG5cIiAgY29sb3IgKj0gYWJzKG1heChmbG9hdChiYWNrbGlnaHQpICogLTEuLCBkb3Qobm9ybWFsLCBsaWdodF9kaXIgKiAtMS4wKSkpICsgbGlnaHRfYW1iaWVudDtcXG5cIiArXG5cIiAgcmV0dXJuIGNvbG9yO1xcblwiICtcblwifVxcblwiICtcblwiI3ByYWdtYSB0YW5ncmFtOiBnbG9iYWxzXFxuXCIgK1xuXCJcXG5cIiArXG5cInZvaWQgbWFpbih2b2lkKSB7XFxuXCIgK1xuXCIgIHZlYzMgY29sb3I7XFxuXCIgK1xuXCIgICNpZiAhZGVmaW5lZChMSUdIVElOR19WRVJURVgpIC8vIGRlZmF1bHQgdG8gcGVyLXBpeGVsIGxpZ2h0aW5nXFxuXCIgK1xuXCIgIHZlYzQgbGlnaHRfcG9zID0gdmVjNCgwLiwgMC4sIDE1MC4gKiB1X21ldGVyc19wZXJfcGl4ZWwsIDEuKTtcXG5cIiArXG5cIiAgY29uc3QgZmxvYXQgbGlnaHRfYW1iaWVudCA9IDAuNTtcXG5cIiArXG5cIiAgY29uc3QgYm9vbCBiYWNrbGl0ID0gdHJ1ZTtcXG5cIiArXG5cIiAgY29sb3IgPSBhX3hfcG9pbnRMaWdodCh2X3Bvc2l0aW9uLCB2X25vcm1hbCwgdl9jb2xvciwgbGlnaHRfcG9zLCBsaWdodF9hbWJpZW50LCBiYWNrbGl0KTtcXG5cIiArXG5cIiAgI2Vsc2VcXG5cIiArXG5cIiAgY29sb3IgPSB2X2NvbG9yO1xcblwiICtcblwiICAjZW5kaWZcXG5cIiArXG5cIiAgXFxuXCIgK1xuXCIgICNwcmFnbWEgdGFuZ3JhbTogZnJhZ21lbnRcXG5cIiArXG5cIiAgZ2xfRnJhZ0NvbG9yID0gdmVjNChjb2xvciwgMS4wKTtcXG5cIiArXG5cIn1cXG5cIiArXG5cIlwiO1xuXG5zaGFkZXJfc291cmNlc1snc2ltcGxlX3BvbHlnb25fdmVydGV4J10gPVxuXCJcXG5cIiArXG5cIiNkZWZpbmUgR0xTTElGWSAxXFxuXCIgK1xuXCJcXG5cIiArXG5cInVuaWZvcm0gdmVjMiB1X2FzcGVjdDtcXG5cIiArXG5cInVuaWZvcm0gbWF0NCB1X3RpbGVfdmlldztcXG5cIiArXG5cInVuaWZvcm0gbWF0NCB1X21ldGVyX3ZpZXc7XFxuXCIgK1xuXCJ1bmlmb3JtIGZsb2F0IHVfbWV0ZXJzX3Blcl9waXhlbDtcXG5cIiArXG5cInVuaWZvcm0gZmxvYXQgdV9udW1fbGF5ZXJzO1xcblwiICtcblwiYXR0cmlidXRlIHZlYzMgYV9wb3NpdGlvbjtcXG5cIiArXG5cImF0dHJpYnV0ZSB2ZWMzIGFfbm9ybWFsO1xcblwiICtcblwiYXR0cmlidXRlIHZlYzMgYV9jb2xvcjtcXG5cIiArXG5cImF0dHJpYnV0ZSBmbG9hdCBhX2xheWVyO1xcblwiICtcblwidmFyeWluZyB2ZWMzIHZfY29sb3I7XFxuXCIgK1xuXCIjaWYgIWRlZmluZWQoTElHSFRJTkdfVkVSVEVYKVxcblwiICtcblwiXFxuXCIgK1xuXCJ2YXJ5aW5nIHZlYzQgdl9wb3NpdGlvbjtcXG5cIiArXG5cInZhcnlpbmcgdmVjMyB2X25vcm1hbDtcXG5cIiArXG5cIiNlbmRpZlxcblwiICtcblwiXFxuXCIgK1xuXCJ2ZWM0IGFfeF9wZXJzcGVjdGl2ZSh2ZWM0IHBvc2l0aW9uLCBjb25zdCB2ZWMyIHBlcnNwZWN0aXZlX29mZnNldCwgY29uc3QgdmVjMiBwZXJzcGVjdGl2ZV9mYWN0b3IpIHtcXG5cIiArXG5cIiAgcG9zaXRpb24ueHkgKz0gcG9zaXRpb24ueiAqIHBlcnNwZWN0aXZlX2ZhY3RvciAqIChwb3NpdGlvbi54eSAtIHBlcnNwZWN0aXZlX29mZnNldCk7XFxuXCIgK1xuXCIgIHJldHVybiBwb3NpdGlvbjtcXG5cIiArXG5cIn1cXG5cIiArXG5cInZlYzQgYl94X2lzb21ldHJpYyh2ZWM0IHBvc2l0aW9uLCBjb25zdCB2ZWMyIGF4aXMsIGNvbnN0IGZsb2F0IG11bHRpcGxpZXIpIHtcXG5cIiArXG5cIiAgcG9zaXRpb24ueHkgKz0gcG9zaXRpb24ueiAqIGF4aXMgKiBtdWx0aXBsaWVyIC8gdV9hc3BlY3Q7XFxuXCIgK1xuXCIgIHJldHVybiBwb3NpdGlvbjtcXG5cIiArXG5cIn1cXG5cIiArXG5cImZsb2F0IGNfeF9jYWxjdWxhdGVaKGZsb2F0IHosIGZsb2F0IGxheWVyLCBjb25zdCBmbG9hdCBudW1fbGF5ZXJzLCBjb25zdCBmbG9hdCB6X2xheWVyX3NjYWxlKSB7XFxuXCIgK1xuXCIgIGZsb2F0IHpfbGF5ZXJfcmFuZ2UgPSAobnVtX2xheWVycyArIDEuKSAqIHpfbGF5ZXJfc2NhbGU7XFxuXCIgK1xuXCIgIGZsb2F0IHpfbGF5ZXIgPSAobGF5ZXIgKyAxLikgKiB6X2xheWVyX3NjYWxlO1xcblwiICtcblwiICB6ID0gel9sYXllciArIGNsYW1wKHosIDAuLCB6X2xheWVyX3NjYWxlKTtcXG5cIiArXG5cIiAgeiA9ICh6X2xheWVyX3JhbmdlIC0geikgLyB6X2xheWVyX3JhbmdlO1xcblwiICtcblwiICByZXR1cm4gejtcXG5cIiArXG5cIn1cXG5cIiArXG5cInZlYzMgZF94X3BvaW50TGlnaHQodmVjNCBwb3NpdGlvbiwgdmVjMyBub3JtYWwsIHZlYzMgY29sb3IsIHZlYzQgbGlnaHRfcG9zLCBmbG9hdCBsaWdodF9hbWJpZW50LCBjb25zdCBib29sIGJhY2tsaWdodCkge1xcblwiICtcblwiICB2ZWMzIGxpZ2h0X2RpciA9IG5vcm1hbGl6ZShwb3NpdGlvbi54eXogLSBsaWdodF9wb3MueHl6KTtcXG5cIiArXG5cIiAgY29sb3IgKj0gYWJzKG1heChmbG9hdChiYWNrbGlnaHQpICogLTEuLCBkb3Qobm9ybWFsLCBsaWdodF9kaXIgKiAtMS4wKSkpICsgbGlnaHRfYW1iaWVudDtcXG5cIiArXG5cIiAgcmV0dXJuIGNvbG9yO1xcblwiICtcblwifVxcblwiICtcblwiI3ByYWdtYSB0YW5ncmFtOiBnbG9iYWxzXFxuXCIgK1xuXCJcXG5cIiArXG5cInZvaWQgbWFpbigpIHtcXG5cIiArXG5cIiAgdmVjNCBwb3NpdGlvbiA9IHVfdGlsZV92aWV3ICogdmVjNChhX3Bvc2l0aW9uLCAxLik7XFxuXCIgK1xuXCIgICNwcmFnbWEgdGFuZ3JhbTogdmVydGV4XFxuXCIgK1xuXCIgIFxcblwiICtcblwiICAjaWYgZGVmaW5lZChMSUdIVElOR19WRVJURVgpXFxuXCIgK1xuXCIgIHZlYzQgbGlnaHRfcG9zID0gdmVjNCgwLiwgMC4sIDE1MC4gKiB1X21ldGVyc19wZXJfcGl4ZWwsIDEuKTtcXG5cIiArXG5cIiAgY29uc3QgZmxvYXQgbGlnaHRfYW1iaWVudCA9IDAuNTtcXG5cIiArXG5cIiAgY29uc3QgYm9vbCBiYWNrbGl0ID0gdHJ1ZTtcXG5cIiArXG5cIiAgdl9jb2xvciA9IGRfeF9wb2ludExpZ2h0KHBvc2l0aW9uLCBhX25vcm1hbCwgYV9jb2xvciwgbGlnaHRfcG9zLCBsaWdodF9hbWJpZW50LCBiYWNrbGl0KTtcXG5cIiArXG5cIiAgI2Vsc2VcXG5cIiArXG5cIiAgdl9wb3NpdGlvbiA9IHBvc2l0aW9uO1xcblwiICtcblwiICB2X25vcm1hbCA9IGFfbm9ybWFsO1xcblwiICtcblwiICB2X2NvbG9yID0gYV9jb2xvcjtcXG5cIiArXG5cIiAgI2VuZGlmXFxuXCIgK1xuXCIgIHBvc2l0aW9uID0gdV9tZXRlcl92aWV3ICogcG9zaXRpb247XFxuXCIgK1xuXCIgICNpZiBkZWZpbmVkKFBST0pFQ1RJT05fUEVSU1BFQ1RJVkUpXFxuXCIgK1xuXCIgIHBvc2l0aW9uID0gYV94X3BlcnNwZWN0aXZlKHBvc2l0aW9uLCB2ZWMyKC0wLjI1LCAtMC4yNSksIHZlYzIoMC42LCAwLjYpKTtcXG5cIiArXG5cIiAgI2VsaWYgZGVmaW5lZChQUk9KRUNUSU9OX0lTT01FVFJJQylcXG5cIiArXG5cIiAgcG9zaXRpb24gPSBiX3hfaXNvbWV0cmljKHBvc2l0aW9uLCB2ZWMyKDAuLCAxLiksIDEuKTtcXG5cIiArXG5cIiAgI2VuZGlmXFxuXCIgK1xuXCIgIHBvc2l0aW9uLnogPSBjX3hfY2FsY3VsYXRlWihwb3NpdGlvbi56LCBhX2xheWVyLCB1X251bV9sYXllcnMsIDQwOTYuKTtcXG5cIiArXG5cIiAgZ2xfUG9zaXRpb24gPSBwb3NpdGlvbjtcXG5cIiArXG5cIn1cXG5cIiArXG5cIlwiO1xuXG5tb2R1bGUuZXhwb3J0cyA9IHNoYWRlcl9zb3VyY2VzOyBcblxuIiwiLy8gVGV4dHVyZSBtYW5hZ2VtZW50XG5pbXBvcnQgKiBhcyBVdGlscyBmcm9tICcuLi91dGlscyc7XG5pbXBvcnQge0dMfSBmcm9tICcuL2dsJztcblxuXG4vLyBHbG9iYWwgc2V0IG9mIHRleHR1cmVzLCBieSBuYW1lXG5HTFRleHR1cmUudGV4dHVyZXMgPSB7fTtcblxuLy8gR0wgdGV4dHVyZSB3cmFwcGVyIG9iamVjdCBmb3Iga2VlcGluZyB0cmFjayBvZiBhIGdsb2JhbCBzZXQgb2YgdGV4dHVyZXMsIGtleWVkIGJ5IGFuIGFyYml0cmFyeSBuYW1lXG5leHBvcnQgZGVmYXVsdCBmdW5jdGlvbiBHTFRleHR1cmUgKGdsLCBuYW1lLCBvcHRpb25zKSB7XG4gICAgb3B0aW9ucyA9IG9wdGlvbnMgfHwge307XG4gICAgdGhpcy5nbCA9IGdsO1xuICAgIHRoaXMudGV4dHVyZSA9IGdsLmNyZWF0ZVRleHR1cmUoKTtcbiAgICB0aGlzLmJpbmQoMCk7XG4gICAgdGhpcy5pbWFnZSA9IG51bGw7XG5cbiAgICAvLyBEZWZhdWx0IHRvIGEgMS1waXhlbCBibGFjayB0ZXh0dXJlIHNvIHdlIGNhbiBzYWZlbHkgcmVuZGVyIHdoaWxlIHdlIHdhaXQgZm9yIGFuIGltYWdlIHRvIGxvYWRcbiAgICAvLyBTZWU6IGh0dHA6Ly9zdGFja292ZXJmbG93LmNvbS9xdWVzdGlvbnMvMTk3MjIyNDcvd2ViZ2wtd2FpdC1mb3ItdGV4dHVyZS10by1sb2FkXG4gICAgdGhpcy5zZXREYXRhKDEsIDEsIG5ldyBVaW50OEFycmF5KFswLCAwLCAwLCAyNTVdKSwgeyBmaWx0ZXJpbmc6ICduZWFyZXN0JyB9KTtcblxuICAgIC8vIFRPRE86IGJldHRlciBzdXBwb3J0IGZvciBub24tVVJMIHNvdXJjZXM6IGNhbnZhcy92aWRlbyBlbGVtZW50cywgcmF3IHBpeGVsIGJ1ZmZlcnNcblxuICAgIHRoaXMubmFtZSA9IG5hbWU7XG4gICAgR0xUZXh0dXJlLnRleHR1cmVzW3RoaXMubmFtZV0gPSB0aGlzO1xufTtcblxuR0xUZXh0dXJlLnByb3RvdHlwZS5iaW5kID0gZnVuY3Rpb24gKHVuaXQpIHtcbiAgICB0aGlzLmdsLmFjdGl2ZVRleHR1cmUodGhpcy5nbC5URVhUVVJFMCArIHVuaXQpO1xuICAgIHRoaXMuZ2wuYmluZFRleHR1cmUodGhpcy5nbC5URVhUVVJFXzJELCB0aGlzLnRleHR1cmUpO1xufTtcblxuLy8gTG9hZHMgYSB0ZXh0dXJlIGZyb20gYSBVUkxcbkdMVGV4dHVyZS5wcm90b3R5cGUubG9hZCA9IGZ1bmN0aW9uICh1cmwsIG9wdGlvbnMpIHtcbiAgICBvcHRpb25zID0gb3B0aW9ucyB8fCB7fTtcbiAgICB0aGlzLmltYWdlID0gbmV3IEltYWdlKCk7XG4gICAgdGhpcy5pbWFnZS5vbmxvYWQgPSAoKSA9PiB7XG4gICAgICAgIHRoaXMud2lkdGggPSB0aGlzLmltYWdlLndpZHRoO1xuICAgICAgICB0aGlzLmhlaWdodCA9IHRoaXMuaW1hZ2UuaGVpZ2h0O1xuICAgICAgICB0aGlzLmRhdGEgPSBudWxsOyAvLyBtdXR1YWxseSBleGNsdXNpdmUgd2l0aCBkaXJlY3QgZGF0YSBidWZmZXIgdGV4dHVyZXNcbiAgICAgICAgdGhpcy51cGRhdGUob3B0aW9ucyk7XG4gICAgICAgIHRoaXMuc2V0VGV4dHVyZUZpbHRlcmluZyhvcHRpb25zKTtcbiAgICB9O1xuICAgIHRoaXMuaW1hZ2Uuc3JjID0gdXJsO1xufTtcblxuLy8gU2V0cyB0ZXh0dXJlIHRvIGEgcmF3IGltYWdlIGJ1ZmZlclxuR0xUZXh0dXJlLnByb3RvdHlwZS5zZXREYXRhID0gZnVuY3Rpb24gKHdpZHRoLCBoZWlnaHQsIGRhdGEsIG9wdGlvbnMpIHtcbiAgICB0aGlzLndpZHRoID0gd2lkdGg7XG4gICAgdGhpcy5oZWlnaHQgPSBoZWlnaHQ7XG4gICAgdGhpcy5kYXRhID0gZGF0YTtcbiAgICB0aGlzLmltYWdlID0gbnVsbDsgLy8gbXV0dWFsbHkgZXhjbHVzaXZlIHdpdGggaW1hZ2UgZWxlbWVudC1iYXNlZCB0ZXh0dXJlc1xuXG4gICAgdGhpcy51cGRhdGUob3B0aW9ucyk7XG4gICAgdGhpcy5zZXRUZXh0dXJlRmlsdGVyaW5nKG9wdGlvbnMpO1xufTtcblxuLy8gVXBsb2FkcyBjdXJyZW50IGltYWdlIG9yIGJ1ZmZlciB0byB0aGUgR1BVIChjYW4gYmUgdXNlZCB0byB1cGRhdGUgYW5pbWF0ZWQgdGV4dHVyZXMgb24gdGhlIGZseSlcbkdMVGV4dHVyZS5wcm90b3R5cGUudXBkYXRlID0gZnVuY3Rpb24gKG9wdGlvbnMpIHtcbiAgICBvcHRpb25zID0gb3B0aW9ucyB8fCB7fTtcblxuICAgIHRoaXMuYmluZCgwKTtcbiAgICB0aGlzLmdsLnBpeGVsU3RvcmVpKHRoaXMuZ2wuVU5QQUNLX0ZMSVBfWV9XRUJHTCwgKG9wdGlvbnMuVU5QQUNLX0ZMSVBfWV9XRUJHTCA9PT0gZmFsc2UgPyBmYWxzZSA6IHRydWUpKTtcblxuICAgIC8vIEltYWdlIGVsZW1lbnRcbiAgICBpZiAodGhpcy5pbWFnZSAmJiB0aGlzLmltYWdlLmNvbXBsZXRlKSB7XG4gICAgICAgIHRoaXMuZ2wudGV4SW1hZ2UyRCh0aGlzLmdsLlRFWFRVUkVfMkQsIDAsIHRoaXMuZ2wuUkdCQSwgdGhpcy5nbC5SR0JBLCB0aGlzLmdsLlVOU0lHTkVEX0JZVEUsIHRoaXMuaW1hZ2UpO1xuICAgIH1cbiAgICAvLyBSYXcgaW1hZ2UgYnVmZmVyXG4gICAgZWxzZSBpZiAodGhpcy53aWR0aCAmJiB0aGlzLmhlaWdodCkgeyAvLyBOT1RFOiB0aGlzLmRhdGEgY2FuIGJlIG51bGwsIHRvIHplcm8gb3V0IHRleHR1cmVcbiAgICAgICAgdGhpcy5nbC50ZXhJbWFnZTJEKHRoaXMuZ2wuVEVYVFVSRV8yRCwgMCwgdGhpcy5nbC5SR0JBLCB0aGlzLndpZHRoLCB0aGlzLmhlaWdodCwgMCwgdGhpcy5nbC5SR0JBLCB0aGlzLmdsLlVOU0lHTkVEX0JZVEUsIHRoaXMuZGF0YSk7XG4gICAgfVxufTtcblxuLy8gRGV0ZXJtaW5lcyBhcHByb3ByaWF0ZSBmaWx0ZXJpbmcgbW9kZVxuLy8gQXNzdW1lcyB0ZXh0dXJlIHRvIGJlIG9wZXJhdGVkIG9uIGlzIGFscmVhZHkgYm91bmRcbkdMVGV4dHVyZS5wcm90b3R5cGUuc2V0VGV4dHVyZUZpbHRlcmluZyA9IGZ1bmN0aW9uIChvcHRpb25zKSB7XG4gICAgb3B0aW9ucyA9IG9wdGlvbnMgfHwge307XG4gICAgb3B0aW9ucy5maWx0ZXJpbmcgPSBvcHRpb25zLmZpbHRlcmluZyB8fCAnbWlwbWFwJzsgLy8gZGVmYXVsdCB0byBtaXBtYXBzIGZvciBwb3dlci1vZi0yIHRleHR1cmVzXG4gICAgdmFyIGdsID0gdGhpcy5nbDtcblxuICAgIC8vIEZvciBwb3dlci1vZi0yIHRleHR1cmVzLCB0aGUgZm9sbG93aW5nIHByZXNldHMgYXJlIGF2YWlsYWJsZTpcbiAgICAvLyBtaXBtYXA6IGxpbmVhciBibGVuZCBmcm9tIG5lYXJlc3QgbWlwXG4gICAgLy8gbGluZWFyOiBsaW5lYXIgYmxlbmQgZnJvbSBvcmlnaW5hbCBpbWFnZSAobm8gbWlwcylcbiAgICAvLyBuZWFyZXN0OiBuZWFyZXN0IHBpeGVsIGZyb20gb3JpZ2luYWwgaW1hZ2UgKG5vIG1pcHMsICdibG9ja3knIGxvb2spXG4gICAgaWYgKFV0aWxzLmlzUG93ZXJPZjIodGhpcy53aWR0aCkgJiYgVXRpbHMuaXNQb3dlck9mMih0aGlzLmhlaWdodCkpIHtcbiAgICAgICAgdGhpcy5wb3dlcl9vZl8yID0gdHJ1ZTtcbiAgICAgICAgZ2wudGV4UGFyYW1ldGVyaShnbC5URVhUVVJFXzJELCBnbC5URVhUVVJFX1dSQVBfUywgb3B0aW9ucy5URVhUVVJFX1dSQVBfUyB8fCBnbC5DTEFNUF9UT19FREdFKTtcbiAgICAgICAgZ2wudGV4UGFyYW1ldGVyaShnbC5URVhUVVJFXzJELCBnbC5URVhUVVJFX1dSQVBfVCwgb3B0aW9ucy5URVhUVVJFX1dSQVBfVCB8fCBnbC5DTEFNUF9UT19FREdFKTtcblxuICAgICAgICBpZiAob3B0aW9ucy5maWx0ZXJpbmcgPT0gJ21pcG1hcCcpIHtcbiAgICAgICAgICAgIC8vIGNvbnNvbGUubG9nKFwicG93ZXItb2YtMiBNSVBNQVBcIik7XG4gICAgICAgICAgICB0aGlzLmZpbHRlcmluZyA9ICdtaXBtYXAnO1xuICAgICAgICAgICAgZ2wudGV4UGFyYW1ldGVyaShnbC5URVhUVVJFXzJELCBnbC5URVhUVVJFX01JTl9GSUxURVIsIGdsLkxJTkVBUl9NSVBNQVBfTkVBUkVTVCk7IC8vIFRPRE86IHVzZSB0cmlsaW5lYXIgZmlsdGVyaW5nIGJ5IGRlZnVhbHQgaW5zdGVhZD9cbiAgICAgICAgICAgIGdsLnRleFBhcmFtZXRlcmkoZ2wuVEVYVFVSRV8yRCwgZ2wuVEVYVFVSRV9NQUdfRklMVEVSLCBnbC5MSU5FQVIpO1xuICAgICAgICAgICAgZ2wuZ2VuZXJhdGVNaXBtYXAoZ2wuVEVYVFVSRV8yRCk7XG4gICAgICAgIH1cbiAgICAgICAgZWxzZSBpZiAob3B0aW9ucy5maWx0ZXJpbmcgPT0gJ2xpbmVhcicpIHtcbiAgICAgICAgICAgIC8vIGNvbnNvbGUubG9nKFwicG93ZXItb2YtMiBMSU5FQVJcIik7XG4gICAgICAgICAgICB0aGlzLmZpbHRlcmluZyA9ICdsaW5lYXInO1xuICAgICAgICAgICAgZ2wudGV4UGFyYW1ldGVyaShnbC5URVhUVVJFXzJELCBnbC5URVhUVVJFX01JTl9GSUxURVIsIGdsLkxJTkVBUik7XG4gICAgICAgICAgICBnbC50ZXhQYXJhbWV0ZXJpKGdsLlRFWFRVUkVfMkQsIGdsLlRFWFRVUkVfTUFHX0ZJTFRFUiwgZ2wuTElORUFSKTtcbiAgICAgICAgfVxuICAgICAgICBlbHNlIGlmIChvcHRpb25zLmZpbHRlcmluZyA9PSAnbmVhcmVzdCcpIHtcbiAgICAgICAgICAgIC8vIGNvbnNvbGUubG9nKFwicG93ZXItb2YtMiBORUFSRVNUXCIpO1xuICAgICAgICAgICAgdGhpcy5maWx0ZXJpbmcgPSAnbmVhcmVzdCc7XG4gICAgICAgICAgICBnbC50ZXhQYXJhbWV0ZXJpKGdsLlRFWFRVUkVfMkQsIGdsLlRFWFRVUkVfTUlOX0ZJTFRFUiwgZ2wuTkVBUkVTVCk7XG4gICAgICAgICAgICBnbC50ZXhQYXJhbWV0ZXJpKGdsLlRFWFRVUkVfMkQsIGdsLlRFWFRVUkVfTUFHX0ZJTFRFUiwgZ2wuTkVBUkVTVCk7XG4gICAgICAgIH1cbiAgICB9XG4gICAgZWxzZSB7XG4gICAgICAgIC8vIFdlYkdMIGhhcyBzdHJpY3QgcmVxdWlyZW1lbnRzIG9uIG5vbi1wb3dlci1vZi0yIHRleHR1cmVzOlxuICAgICAgICAvLyBObyBtaXBtYXBzIGFuZCBtdXN0IGNsYW1wIHRvIGVkZ2VcbiAgICAgICAgdGhpcy5wb3dlcl9vZl8yID0gZmFsc2U7XG4gICAgICAgIGdsLnRleFBhcmFtZXRlcmkoZ2wuVEVYVFVSRV8yRCwgZ2wuVEVYVFVSRV9XUkFQX1MsIGdsLkNMQU1QX1RPX0VER0UpO1xuICAgICAgICBnbC50ZXhQYXJhbWV0ZXJpKGdsLlRFWFRVUkVfMkQsIGdsLlRFWFRVUkVfV1JBUF9ULCBnbC5DTEFNUF9UT19FREdFKTtcblxuICAgICAgICBpZiAob3B0aW9ucy5maWx0ZXJpbmcgPT0gJ25lYXJlc3QnKSB7XG4gICAgICAgICAgICAvLyBjb25zb2xlLmxvZyhcInBvd2VyLW9mLTIgTkVBUkVTVFwiKTtcbiAgICAgICAgICAgIHRoaXMuZmlsdGVyaW5nID0gJ25lYXJlc3QnO1xuICAgICAgICAgICAgZ2wudGV4UGFyYW1ldGVyaShnbC5URVhUVVJFXzJELCBnbC5URVhUVVJFX01JTl9GSUxURVIsIGdsLk5FQVJFU1QpO1xuICAgICAgICAgICAgZ2wudGV4UGFyYW1ldGVyaShnbC5URVhUVVJFXzJELCBnbC5URVhUVVJFX01BR19GSUxURVIsIGdsLk5FQVJFU1QpO1xuICAgICAgICB9XG4gICAgICAgIGVsc2UgeyAvLyBkZWZhdWx0IHRvIGxpbmVhciBmb3Igbm9uLXBvd2VyLW9mLTIgdGV4dHVyZXNcbiAgICAgICAgICAgIC8vIGNvbnNvbGUubG9nKFwicG93ZXItb2YtMiBMSU5FQVJcIik7XG4gICAgICAgICAgICB0aGlzLmZpbHRlcmluZyA9ICdsaW5lYXInO1xuICAgICAgICAgICAgZ2wudGV4UGFyYW1ldGVyaShnbC5URVhUVVJFXzJELCBnbC5URVhUVVJFX01JTl9GSUxURVIsIGdsLkxJTkVBUik7XG4gICAgICAgICAgICBnbC50ZXhQYXJhbWV0ZXJpKGdsLlRFWFRVUkVfMkQsIGdsLlRFWFRVUkVfTUFHX0ZJTFRFUiwgZ2wuTElORUFSKTtcbiAgICAgICAgfVxuICAgIH1cbn07XG4iLCIvLyBEZXNjcmliZXMgYSB2ZXJ0ZXggbGF5b3V0IHRoYXQgY2FuIGJlIHVzZWQgd2l0aCBtYW55IGRpZmZlcmVudCBHTCBwcm9ncmFtcy5cbi8vIElmIGEgZ2l2ZW4gcHJvZ3JhbSBkb2Vzbid0IGluY2x1ZGUgYWxsIGF0dHJpYnV0ZXMsIGl0IGNhbiBzdGlsbCB1c2UgdGhlIHZlcnRleCBsYXlvdXRcbi8vIHRvIHJlYWQgdGhvc2UgYXR0cmlicyB0aGF0IGl0IGRvZXMgcmVjb2duaXplLCB1c2luZyB0aGUgYXR0cmliIG9mZnNldHMgdG8gc2tpcCBvdGhlcnMuXG4vLyBBdHRyaWJzIGFyZSBhbiBhcnJheSwgaW4gbGF5b3V0IG9yZGVyLCBvZjogbmFtZSwgc2l6ZSwgdHlwZSwgbm9ybWFsaXplZFxuLy8gZXg6IHsgbmFtZTogJ3Bvc2l0aW9uJywgc2l6ZTogMywgdHlwZTogZ2wuRkxPQVQsIG5vcm1hbGl6ZWQ6IGZhbHNlIH1cbmV4cG9ydCBkZWZhdWx0IGZ1bmN0aW9uIEdMVmVydGV4TGF5b3V0IChnbCwgYXR0cmlicykge1xuICAgIHRoaXMuYXR0cmlicyA9IGF0dHJpYnM7XG5cbiAgICAvLyBDYWxjIHZlcnRleCBzdHJpZGVcbiAgICB0aGlzLnN0cmlkZSA9IDA7XG4gICAgZm9yICh2YXIgYT0wOyBhIDwgdGhpcy5hdHRyaWJzLmxlbmd0aDsgYSsrKSB7XG4gICAgICAgIHZhciBhdHRyaWIgPSB0aGlzLmF0dHJpYnNbYV07XG5cbiAgICAgICAgYXR0cmliLmJ5dGVfc2l6ZSA9IGF0dHJpYi5zaXplO1xuXG4gICAgICAgIHN3aXRjaCAoYXR0cmliLnR5cGUpIHtcbiAgICAgICAgICAgIGNhc2UgZ2wuRkxPQVQ6XG4gICAgICAgICAgICBjYXNlIGdsLklOVDpcbiAgICAgICAgICAgIGNhc2UgZ2wuVU5TSUdORURfSU5UOlxuICAgICAgICAgICAgICAgIGF0dHJpYi5ieXRlX3NpemUgKj0gNDtcbiAgICAgICAgICAgICAgICBicmVhaztcbiAgICAgICAgICAgIGNhc2UgZ2wuU0hPUlQ6XG4gICAgICAgICAgICBjYXNlIGdsLlVOU0lHTkVEX1NIT1JUOlxuICAgICAgICAgICAgICAgIGF0dHJpYi5ieXRlX3NpemUgKj0gMjtcbiAgICAgICAgICAgICAgICBicmVhaztcbiAgICAgICAgfVxuXG4gICAgICAgIGF0dHJpYi5vZmZzZXQgPSB0aGlzLnN0cmlkZTtcbiAgICAgICAgdGhpcy5zdHJpZGUgKz0gYXR0cmliLmJ5dGVfc2l6ZTtcbiAgICB9XG59XG5cbi8vIFRyYWNrIGN1cnJlbnRseSBlbmFibGVkIGF0dHJpYnMsIGJ5IHRoZSBwcm9ncmFtIHRoZXkgYXJlIGJvdW5kIHRvXG5HTFZlcnRleExheW91dC5lbmFibGVkX2F0dHJpYnMgPSB7fTtcblxuLy8gU2V0dXAgYSB2ZXJ0ZXggbGF5b3V0IGZvciBhIHNwZWNpZmljIEdMIHByb2dyYW1cbi8vIEFzc3VtZXMgdGhhdCB0aGUgZGVzaXJlZCB2ZXJ0ZXggYnVmZmVyIChWQk8pIGlzIGFscmVhZHkgYm91bmRcbkdMVmVydGV4TGF5b3V0LnByb3RvdHlwZS5lbmFibGUgPSBmdW5jdGlvbiAoZ2wsIGdsX3Byb2dyYW0pXG57XG4gICAgLy8gRW5hYmxlIGFsbCBhdHRyaWJ1dGVzIGZvciB0aGlzIGxheW91dFxuICAgIGZvciAodmFyIGE9MDsgYSA8IHRoaXMuYXR0cmlicy5sZW5ndGg7IGErKykge1xuICAgICAgICB2YXIgYXR0cmliID0gdGhpcy5hdHRyaWJzW2FdO1xuICAgICAgICB2YXIgbG9jYXRpb24gPSBnbF9wcm9ncmFtLmF0dHJpYnV0ZShhdHRyaWIubmFtZSkubG9jYXRpb247XG5cbiAgICAgICAgaWYgKGxvY2F0aW9uICE9IC0xKSB7XG4gICAgICAgICAgICBnbC5lbmFibGVWZXJ0ZXhBdHRyaWJBcnJheShsb2NhdGlvbik7XG4gICAgICAgICAgICBnbC52ZXJ0ZXhBdHRyaWJQb2ludGVyKGxvY2F0aW9uLCBhdHRyaWIuc2l6ZSwgYXR0cmliLnR5cGUsIGF0dHJpYi5ub3JtYWxpemVkLCB0aGlzLnN0cmlkZSwgYXR0cmliLm9mZnNldCk7XG4gICAgICAgICAgICBHTFZlcnRleExheW91dC5lbmFibGVkX2F0dHJpYnNbbG9jYXRpb25dID0gZ2xfcHJvZ3JhbTtcbiAgICAgICAgfVxuICAgIH1cblxuICAgIC8vIERpc2FibGUgYW55IHByZXZpb3VzbHkgYm91bmQgYXR0cmlidXRlcyB0aGF0IGFyZW4ndCBmb3IgdGhpcyBsYXlvdXRcbiAgICB2YXIgdW51c3VlZF9hdHRyaWJzID0gW107XG4gICAgZm9yIChsb2NhdGlvbiBpbiBHTFZlcnRleExheW91dC5lbmFibGVkX2F0dHJpYnMpIHtcbiAgICAgICAgaWYgKEdMVmVydGV4TGF5b3V0LmVuYWJsZWRfYXR0cmlic1tsb2NhdGlvbl0gIT0gZ2xfcHJvZ3JhbSkge1xuICAgICAgICAgICAgZ2wuZGlzYWJsZVZlcnRleEF0dHJpYkFycmF5KGxvY2F0aW9uKTtcbiAgICAgICAgICAgIHVudXN1ZWRfYXR0cmlicy5wdXNoKGxvY2F0aW9uKTtcbiAgICAgICAgfVxuICAgIH1cblxuICAgIC8vIE1hcmsgYXR0cmlicyBhcyB1bnVzZWRcbiAgICBmb3IgKGxvY2F0aW9uIGluIHVudXN1ZWRfYXR0cmlicykge1xuICAgICAgICBkZWxldGUgR0xWZXJ0ZXhMYXlvdXQuZW5hYmxlZF9hdHRyaWJzW2xvY2F0aW9uXTtcbiAgICB9XG59O1xuIiwiaW1wb3J0IFNjZW5lIGZyb20gJy4vc2NlbmUnO1xuXG5leHBvcnQgdmFyIExlYWZsZXRMYXllciA9IEwuR3JpZExheWVyLmV4dGVuZCh7XG5cbiAgICBpbml0aWFsaXplOiBmdW5jdGlvbiAob3B0aW9ucykge1xuICAgICAgICBMLnNldE9wdGlvbnModGhpcywgb3B0aW9ucyk7XG4gICAgICAgIHRoaXMuc2NlbmUgPSBuZXcgU2NlbmUoXG4gICAgICAgICAgICB0aGlzLm9wdGlvbnMudmVjdG9yVGlsZVNvdXJjZSxcbiAgICAgICAgICAgIHRoaXMub3B0aW9ucy52ZWN0b3JMYXllcnMsXG4gICAgICAgICAgICB0aGlzLm9wdGlvbnMudmVjdG9yU3R5bGVzLFxuICAgICAgICAgICAgeyBudW1fd29ya2VyczogdGhpcy5vcHRpb25zLm51bVdvcmtlcnMgfVxuICAgICAgICApO1xuXG4gICAgICAgIHRoaXMuc2NlbmUuZGVidWcgPSB0aGlzLm9wdGlvbnMuZGVidWc7XG4gICAgICAgIHRoaXMuc2NlbmUuY29udGludW91c19hbmltYXRpb24gPSBmYWxzZTsgLy8gc2V0IHRvIHRydWUgZm9yIGFuaW1hdGlub3MsIGV0Yy4gKGV2ZW50dWFsbHkgd2lsbCBiZSBhdXRvbWF0ZWQpXG4gICAgfSxcblxuICAgIC8vIEZpbmlzaCBpbml0aWFsaXppbmcgc2NlbmUgYW5kIHNldHVwIGV2ZW50cyB3aGVuIGxheWVyIGlzIGFkZGVkIHRvIG1hcFxuICAgIG9uQWRkOiBmdW5jdGlvbiAobWFwKSB7XG5cbiAgICAgICAgdGhpcy5vbigndGlsZXVubG9hZCcsIChldmVudCkgPT4ge1xuICAgICAgICAgICAgdmFyIHRpbGUgPSBldmVudC50aWxlO1xuICAgICAgICAgICAgdmFyIGtleSA9IHRpbGUuZ2V0QXR0cmlidXRlKCdkYXRhLXRpbGUta2V5Jyk7XG4gICAgICAgICAgICB0aGlzLnNjZW5lLnJlbW92ZVRpbGUoa2V5KTtcbiAgICAgICAgfSk7XG5cbiAgICAgICAgdGhpcy5fbWFwLm9uKCdyZXNpemUnLCAoKSA9PiB7XG4gICAgICAgICAgICB2YXIgc2l6ZSA9IHRoaXMuX21hcC5nZXRTaXplKCk7XG4gICAgICAgICAgICB0aGlzLnNjZW5lLnJlc2l6ZU1hcChzaXplLngsIHNpemUueSk7XG4gICAgICAgICAgICB0aGlzLnVwZGF0ZUJvdW5kcygpO1xuICAgICAgICB9KTtcblxuICAgICAgICB0aGlzLl9tYXAub24oJ21vdmUnLCAgKCkgPT4ge1xuICAgICAgICAgICAgdmFyIGNlbnRlciA9IHRoaXMuX21hcC5nZXRDZW50ZXIoKTtcbiAgICAgICAgICAgIHRoaXMuc2NlbmUuc2V0Q2VudGVyKGNlbnRlci5sbmcsIGNlbnRlci5sYXQpO1xuICAgICAgICAgICAgdGhpcy51cGRhdGVCb3VuZHMoKTtcbiAgICAgICAgfSk7XG5cbiAgICAgICAgdGhpcy5fbWFwLm9uKCd6b29tc3RhcnQnLCAoKSA9PiB7XG4gICAgICAgICAgICBjb25zb2xlLmxvZyhcIm1hcC56b29tc3RhcnQgXCIgKyB0aGlzLl9tYXAuZ2V0Wm9vbSgpKTtcbiAgICAgICAgICAgIHRoaXMuc2NlbmUuc3RhcnRab29tKCk7XG4gICAgICAgIH0pO1xuXG4gICAgICAgIHRoaXMuX21hcC5vbignem9vbWVuZCcsICAoKSA9PiB7XG4gICAgICAgICAgICBjb25zb2xlLmxvZyhcIm1hcC56b29tZW5kIFwiICsgdGhpcy5fbWFwLmdldFpvb20oKSk7XG4gICAgICAgICAgICB0aGlzLnNjZW5lLnNldFpvb20odGhpcy5fbWFwLmdldFpvb20oKSk7XG4gICAgICAgICAgICB0aGlzLnVwZGF0ZUJvdW5kcygpO1xuICAgICAgICB9KTtcblxuICAgICAgICB0aGlzLl9tYXAub24oJ2RyYWdzdGFydCcsICAoKSA9PiB7XG4gICAgICAgICAgICB0aGlzLnNjZW5lLnBhbm5pbmcgPSB0cnVlO1xuICAgICAgICB9KTtcblxuICAgICAgICB0aGlzLl9tYXAub24oJ2RyYWdlbmQnLCAoKSA9PiB7XG4gICAgICAgICAgICB0aGlzLnNjZW5lLnBhbm5pbmcgPSBmYWxzZTtcbiAgICAgICAgfSk7XG5cbiAgICAgICAgLy8gQ2FudmFzIGVsZW1lbnQgd2lsbCBiZSBpbnNlcnRlZCBhZnRlciBtYXAgY29udGFpbmVyIChsZWFmbGV0IHRyYW5zZm9ybXMgc2hvdWxkbid0IGJlIGFwcGxpZWQgdG8gdGhlIEdMIGNhbnZhcylcbiAgICAgICAgLy8gVE9ETzogZmluZCBhIGJldHRlciB3YXkgdG8gZGVhbCB3aXRoIHRoaXM/IHJpZ2h0IG5vdyBHTCBtYXAgb25seSByZW5kZXJzIGNvcnJlY3RseSBhcyB0aGUgYm90dG9tIGxheWVyXG4gICAgICAgIHRoaXMuc2NlbmUuY29udGFpbmVyID0gdGhpcy5fbWFwLmdldENvbnRhaW5lcigpO1xuXG4gICAgICAgIHZhciBjZW50ZXIgPSB0aGlzLl9tYXAuZ2V0Q2VudGVyKCk7XG4gICAgICAgIHRoaXMuc2NlbmUuc2V0Q2VudGVyKGNlbnRlci5sbmcsIGNlbnRlci5sYXQpO1xuICAgICAgICBjb25zb2xlLmxvZyhcInpvb206IFwiICsgdGhpcy5fbWFwLmdldFpvb20oKSk7XG4gICAgICAgIHRoaXMuc2NlbmUuc2V0Wm9vbSh0aGlzLl9tYXAuZ2V0Wm9vbSgpKTtcbiAgICAgICAgdGhpcy51cGRhdGVCb3VuZHMoKTtcblxuICAgICAgICBMLkdyaWRMYXllci5wcm90b3R5cGUub25BZGQuYXBwbHkodGhpcywgYXJndW1lbnRzKTtcblxuICAgICAgICAvLyBVc2UgbGVhZmxldCdzIGV4aXN0aW5nIGV2ZW50IHN5c3RlbSBhcyB0aGUgY2FsbGJhY2sgbWVjaGFuaXNtXG4gICAgICAgIHRoaXMuc2NlbmUuaW5pdCgoKSA9PiB7XG4gICAgICAgICAgICB0aGlzLmZpcmUoJ2luaXQnKTtcbiAgICAgICAgfSk7XG4gICAgfSxcblxuICAgIG9uUmVtb3ZlOiBmdW5jdGlvbiAobWFwKSB7XG4gICAgICAgIEwuR3JpZExheWVyLnByb3RvdHlwZS5vblJlbW92ZS5hcHBseSh0aGlzLCBhcmd1bWVudHMpO1xuICAgICAgICAvLyBUT0RPOiByZW1vdmUgZXZlbnQgaGFuZGxlcnMsIGRlc3Ryb3kgbWFwXG4gICAgfSxcblxuICAgIGNyZWF0ZVRpbGU6IGZ1bmN0aW9uIChjb29yZHMsIGRvbmUpIHtcbiAgICAgICAgdmFyIGRpdiA9IGRvY3VtZW50LmNyZWF0ZUVsZW1lbnQoJ2RpdicpO1xuICAgICAgICB0aGlzLnNjZW5lLmxvYWRUaWxlKGNvb3JkcywgZGl2LCBkb25lKTtcbiAgICAgICAgcmV0dXJuIGRpdjtcbiAgICB9LFxuXG4gICAgdXBkYXRlQm91bmRzOiBmdW5jdGlvbiAoKSB7XG4gICAgICAgIHZhciBib3VuZHMgPSB0aGlzLl9tYXAuZ2V0Qm91bmRzKCk7XG4gICAgICAgIHRoaXMuc2NlbmUuc2V0Qm91bmRzKGJvdW5kcy5nZXRTb3V0aFdlc3QoKSwgYm91bmRzLmdldE5vcnRoRWFzdCgpKTtcbiAgICB9LFxuXG4gICAgcmVuZGVyOiBmdW5jdGlvbiAoKSB7XG4gICAgICAgIHRoaXMuc2NlbmUucmVuZGVyKCk7XG4gICAgfVxuXG59KTtcblxuZXhwb3J0IGZ1bmN0aW9uIGxlYWZsZXRMYXllcihvcHRpb25zKSB7XG4gICAgcmV0dXJuIG5ldyBMZWFmbGV0TGF5ZXIob3B0aW9ucyk7XG59XG4iLCIvLyBNb2R1bGVzIGFuZCBkZXBlbmRlbmNpZXMgdG8gZXhwb3NlIGluIHRoZSBwdWJsaWMgVGFuZ3JhbSBtb2R1bGVcblxuLy8gVGhlIGxlYWZsZXQgbGF5ZXIgcGx1Z2luIGlzIGN1cnJlbnRseSB0aGUgcHJpbWFyeSBtZWFucyBvZiB1c2luZyB0aGUgbGlicmFyeVxuXG5pbXBvcnQge0xlYWZsZXRMYXllciwgbGVhZmxldExheWVyfSBmcm9tICcuL2xlYWZsZXRfbGF5ZXInO1xuaW1wb3J0IHtHTH0gZnJvbSAnLi9nbC9nbCc7XG4vLyBHTCBmdW5jdGlvbnMgaW5jbHVkZWQgZm9yIGVhc2llciBkZWJ1Z2dpbmcgLyBkaXJlY3QgYWNjZXNzIHRvIHNldHRpbmcgZ2xvYmFsIGRlZmluZXMsIHJlbG9hZGluZyBwcm9ncmFtcywgZXRjLlxuXG5HTC5Qcm9ncmFtID0gcmVxdWlyZSgnLi9nbC9nbF9wcm9ncmFtLmpzJykuZGVmYXVsdDtcbkdMLlRleHR1cmUgPSByZXF1aXJlKCcuL2dsL2dsX3RleHR1cmUuanMnKTtcblxubW9kdWxlLmV4cG9ydHMgPSB7XG4gICAgTGVhZmxldExheWVyOiBMZWFmbGV0TGF5ZXIsXG4gICAgbGVhZmxldExheWVyOiBsZWFmbGV0TGF5ZXIsXG4gICAgR0w6IEdMXG59O1xuXG4iLCJcbmV4cG9ydCBkZWZhdWx0IGNsYXNzIFBvaW50IHtcbiAgICBjb25zdHJ1Y3Rvcih4LCB5KSB7XG4gICAgICAgIGlmICghICh0aGlzIGluc3RhbmNlb2YgUG9pbnQpKSB7XG4gICAgICAgICAgICByZXR1cm4gbmV3IFBvaW50KHgsIHkpO1xuICAgICAgICB9XG4gICAgICAgIHRoaXMueCA9IHg7XG4gICAgICAgIHRoaXMueSA9IHk7XG4gICAgfVxuXG4gICAgc3RhdGljIGNvcHkob3RoZXIpIHtcbiAgICAgICAgaWYgKG90aGVyID09IG51bGwpIHtcbiAgICAgICAgICAgIHJldHVybiBudWxsO1xuICAgICAgICB9XG4gICAgICAgIHJldHVybiBuZXcgUG9pbnQob3RoZXIueCwgb3RoZXIueSk7XG4gICAgfVxufVxuIiwiaW1wb3J0IFBvaW50IGZyb20gJy4vcG9pbnQnO1xuaW1wb3J0IHtHZW99IGZyb20gJy4vZ2VvJztcbmltcG9ydCAqIGFzIFV0aWxzIGZyb20gJy4vdXRpbHMnO1xuaW1wb3J0IHtTdHlsZX0gZnJvbSAnLi9zdHlsZSc7XG5pbXBvcnQgKiBhcyBRdWV1ZSBmcm9tICdxdWV1ZS1hc3luYyc7XG5pbXBvcnQge0dMfSBmcm9tICcuL2dsL2dsJztcbmltcG9ydCB7R0xCdWlsZGVyc30gZnJvbSAnLi9nbC9nbF9idWlsZGVycyc7XG5pbXBvcnQgR0xQcm9ncmFtIGZyb20gJy4vZ2wvZ2xfcHJvZ3JhbSc7XG5pbXBvcnQgR0xUZXh0dXJlIGZyb20gJy4vZ2wvZ2xfdGV4dHVyZSc7XG5pbXBvcnQge01vZGVNYW5hZ2VyfSBmcm9tICcuL2dsL2dsX21vZGVzJztcblxuaW1wb3J0IHttYXQ0LCB2ZWMzfSBmcm9tICdnbC1tYXRyaXgnO1xuXG4vLyBTZXR1cCB0aGF0IGhhcHBlbnMgb24gbWFpbiB0aHJlYWQgb25seSAoc2tpcCBpbiB3ZWIgd29ya2VyKVxudmFyIHlhbWw7XG5VdGlscy5ydW5JZkluTWFpblRocmVhZChmdW5jdGlvbigpIHtcbiAgICB0cnkge1xuICAgICAgICB5YW1sID0gcmVxdWlyZSgnanMteWFtbCcpO1xuICAgIH1cbiAgICBjYXRjaCAoZSkge1xuICAgICAgICBjb25zb2xlLmxvZyhcIm5vIFlBTUwgc3VwcG9ydCwganMteWFtbCBtb2R1bGUgbm90IGZvdW5kXCIpO1xuICAgIH1cblxuICAgIGZpbmRCYXNlTGlicmFyeVVSTCgpO1xufSk7XG5cbi8vIEdsb2JhbCBzZXR1cFxuU2NlbmUudGlsZV9zY2FsZSA9IDQwOTY7IC8vIGNvb3JkaW5hdGVzIGFyZSBsb2NhbGx5IHNjYWxlZCB0byB0aGUgcmFuZ2UgWzAsIHRpbGVfc2NhbGVdXG5HZW8uc2V0VGlsZVNjYWxlKFNjZW5lLnRpbGVfc2NhbGUpO1xuR0xCdWlsZGVycy5zZXRUaWxlU2NhbGUoU2NlbmUudGlsZV9zY2FsZSk7XG5HTFByb2dyYW0uZGVmaW5lcy5USUxFX1NDQUxFID0gU2NlbmUudGlsZV9zY2FsZTtcblNjZW5lLmRlYnVnID0gZmFsc2U7XG5cbi8vIExheWVycyAmIHN0eWxlczogcGFzcyBhbiBvYmplY3QgZGlyZWN0bHksIG9yIGEgVVJMIGFzIHN0cmluZyB0byBsb2FkIHJlbW90ZWx5XG4vLyBUT0RPLCBjb252ZXJ0IHRoaXMgdG8gdGhlIGNsYXNzIHN5dG5heCBvbmNlIHdlIGdldCB0aGUgcnVudGltZVxuLy8gd29ya2luZywgSVdcbmV4cG9ydCBkZWZhdWx0IGZ1bmN0aW9uIFNjZW5lKHRpbGVfc291cmNlLCBsYXllcnMsIHN0eWxlcywgb3B0aW9ucykge1xuICAgIHZhciBvcHRpb25zID0gb3B0aW9ucyB8fCB7fTtcbiAgICB0aGlzLmluaXRpYWxpemVkID0gZmFsc2U7XG5cbiAgICB0aGlzLnRpbGVfc291cmNlID0gdGlsZV9zb3VyY2U7XG4gICAgdGhpcy50aWxlcyA9IHt9O1xuICAgIHRoaXMucXVldWVkX3RpbGVzID0gW107XG4gICAgdGhpcy5udW1fd29ya2VycyA9IG9wdGlvbnMubnVtX3dvcmtlcnMgfHwgMTtcbiAgICB0aGlzLmFsbG93X2Nyb3NzX2RvbWFpbl93b3JrZXJzID0gKG9wdGlvbnMuYWxsb3dfY3Jvc3NfZG9tYWluX3dvcmtlcnMgPT09IGZhbHNlID8gZmFsc2UgOiB0cnVlKTtcblxuICAgIHRoaXMubGF5ZXJzID0gbGF5ZXJzO1xuICAgIHRoaXMuc3R5bGVzID0gc3R5bGVzO1xuXG4gICAgdGhpcy5kaXJ0eSA9IHRydWU7IC8vIHJlcXVlc3QgYSByZWRyYXdcbiAgICB0aGlzLmFuaW1hdGVkID0gZmFsc2U7IC8vIHJlcXVlc3QgcmVkcmF3IGV2ZXJ5IGZyYW1lXG5cbiAgICB0aGlzLmZyYW1lID0gMDtcbiAgICB0aGlzLnpvb20gPSBudWxsO1xuICAgIHRoaXMuY2VudGVyID0gbnVsbDtcbiAgICB0aGlzLmRldmljZV9waXhlbF9yYXRpbyA9IHdpbmRvdy5kZXZpY2VQaXhlbFJhdGlvIHx8IDE7XG5cbiAgICB0aGlzLnpvb21pbmcgPSBmYWxzZTtcbiAgICB0aGlzLnBhbm5pbmcgPSBmYWxzZTtcblxuICAgIHRoaXMuY29udGFpbmVyID0gb3B0aW9ucy5jb250YWluZXI7XG5cbiAgICB0aGlzLmZvY2FsX2xlbmd0aCA9IDIuNTtcblxuICAgIHRoaXMucmVzZXRUaW1lKCk7XG59XG5cblNjZW5lLnByb3RvdHlwZS5pbml0ID0gZnVuY3Rpb24gKGNhbGxiYWNrKSB7XG4gICAgaWYgKHRoaXMuaW5pdGlhbGl6ZWQpIHtcbiAgICAgICAgcmV0dXJuO1xuICAgIH1cblxuICAgIC8vIExvYWQgc2NlbmUgZGVmaW5pdGlvbiAobGF5ZXJzLCBzdHlsZXMsIGV0Yy4pLCB0aGVuIGNyZWF0ZSBtb2RlcyAmIHdvcmtlcnNcbiAgICB0aGlzLmxvYWRTY2VuZSgoKSA9PiB7XG4gICAgICAgIHZhciBxdWV1ZSA9IFF1ZXVlKCk7XG5cbiAgICAgICAgLy8gQ3JlYXRlIHJlbmRlcmluZyBtb2Rlc1xuICAgICAgICBxdWV1ZS5kZWZlcihjb21wbGV0ZSA9PiB7XG4gICAgICAgICAgICB0aGlzLm1vZGVzID0gU2NlbmUuY3JlYXRlTW9kZXModGhpcy5zdHlsZXMpO1xuICAgICAgICAgICAgdGhpcy51cGRhdGVBY3RpdmVNb2RlcygpO1xuICAgICAgICAgICAgY29tcGxldGUoKTtcbiAgICAgICAgfSk7XG5cbiAgICAgICAgLy8gQ3JlYXRlIHdlYiB3b3JrZXJzXG4gICAgICAgIHF1ZXVlLmRlZmVyKGNvbXBsZXRlID0+IHtcbiAgICAgICAgICAgIHRoaXMuY3JlYXRlV29ya2Vycyhjb21wbGV0ZSk7XG4gICAgICAgIH0pO1xuXG4gICAgICAgIC8vIFRoZW4gY3JlYXRlIEdMIGNvbnRleHRcbiAgICAgICAgcXVldWUuYXdhaXQoKCkgPT4ge1xuICAgICAgICAgICAgLy8gQ3JlYXRlIGNhbnZhcyAmIEdMXG4gICAgICAgICAgICB0aGlzLmNvbnRhaW5lciA9IHRoaXMuY29udGFpbmVyIHx8IGRvY3VtZW50LmJvZHk7XG4gICAgICAgICAgICB0aGlzLmNhbnZhcyA9IGRvY3VtZW50LmNyZWF0ZUVsZW1lbnQoJ2NhbnZhcycpO1xuICAgICAgICAgICAgdGhpcy5jYW52YXMuc3R5bGUucG9zaXRpb24gPSAnYWJzb2x1dGUnO1xuICAgICAgICAgICAgdGhpcy5jYW52YXMuc3R5bGUudG9wID0gMDtcbiAgICAgICAgICAgIHRoaXMuY2FudmFzLnN0eWxlLmxlZnQgPSAwO1xuICAgICAgICAgICAgdGhpcy5jYW52YXMuc3R5bGUuekluZGV4ID0gLTE7XG4gICAgICAgICAgICB0aGlzLmNvbnRhaW5lci5hcHBlbmRDaGlsZCh0aGlzLmNhbnZhcyk7XG5cbiAgICAgICAgICAgIHRoaXMuZ2wgPSBHTC5nZXRDb250ZXh0KHRoaXMuY2FudmFzKTtcbiAgICAgICAgICAgIHRoaXMucmVzaXplTWFwKHRoaXMuY29udGFpbmVyLmNsaWVudFdpZHRoLCB0aGlzLmNvbnRhaW5lci5jbGllbnRIZWlnaHQpO1xuXG4gICAgICAgICAgICB0aGlzLmluaXRNb2RlcygpOyAvLyBUT0RPOiByZW1vdmUgZ2wgY29udGV4dCBzdGF0ZSBmcm9tIG1vZGVzLCBhbmQgbW92ZSBpbml0IHRvIGNyZWF0ZSBzdGVwIGFib3ZlP1xuICAgICAgICAgICAgdGhpcy5pbml0U2VsZWN0aW9uQnVmZmVyKCk7XG5cbiAgICAgICAgICAgIC8vIHRoaXMuem9vbV9zdGVwID0gMC4wMjsgLy8gZm9yIGZyYWN0aW9uYWwgem9vbSB1c2VyIGFkanVzdG1lbnRcbiAgICAgICAgICAgIHRoaXMubGFzdF9yZW5kZXJfY291bnQgPSBudWxsO1xuICAgICAgICAgICAgdGhpcy5pbml0SW5wdXRIYW5kbGVycygpO1xuXG4gICAgICAgICAgICB0aGlzLmluaXRpYWxpemVkID0gdHJ1ZTtcblxuICAgICAgICAgICAgaWYgKHR5cGVvZiBjYWxsYmFjayA9PSAnZnVuY3Rpb24nKSB7XG4gICAgICAgICAgICAgICAgY2FsbGJhY2soKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgfSk7XG4gICAgfSk7XG59O1xuXG5TY2VuZS5wcm90b3R5cGUuaW5pdE1vZGVzID0gZnVuY3Rpb24gKCkge1xuICAgIC8vIEluaXQgR0wgY29udGV4dCBmb3IgbW9kZXMgKGNvbXBpbGVzIHByb2dyYW1zLCBldGMuKVxuICAgIGZvciAodmFyIG0gaW4gdGhpcy5tb2Rlcykge1xuICAgICAgICB0aGlzLm1vZGVzW21dLmluaXQodGhpcy5nbCk7XG4gICAgfVxufTtcblxuU2NlbmUucHJvdG90eXBlLmluaXRTZWxlY3Rpb25CdWZmZXIgPSBmdW5jdGlvbiAoKSB7XG4gICAgLy8gU2VsZWN0aW9uIHN0YXRlIHRyYWNraW5nXG4gICAgdGhpcy5waXhlbCA9IG5ldyBVaW50OEFycmF5KDQpO1xuICAgIHRoaXMucGl4ZWwzMiA9IG5ldyBGbG9hdDMyQXJyYXkodGhpcy5waXhlbC5idWZmZXIpO1xuICAgIHRoaXMuc2VsZWN0aW9uX3BvaW50ID0gUG9pbnQoMCwgMCk7XG4gICAgdGhpcy5zZWxlY3RlZF9mZWF0dXJlID0gbnVsbDtcbiAgICB0aGlzLnNlbGVjdGlvbl9jYWxsYmFjayA9IG51bGw7XG4gICAgdGhpcy5zZWxlY3Rpb25fY2FsbGJhY2tfdGltZXIgPSBudWxsO1xuICAgIHRoaXMuc2VsZWN0aW9uX2ZyYW1lX2RlbGF5ID0gNTsgLy8gZGVsYXkgZnJvbSBzZWxlY3Rpb24gcmVuZGVyIHRvIGZyYW1lYnVmZmVyIHNhbXBsZSwgdG8gYXZvaWQgQ1BVL0dQVSBzeW5jIGxvY2tcbiAgICB0aGlzLnVwZGF0ZV9zZWxlY3Rpb24gPSBmYWxzZTtcblxuICAgIC8vIEZyYW1lIGJ1ZmZlciBmb3Igc2VsZWN0aW9uXG4gICAgLy8gVE9ETzogaW5pdGlhdGUgbGF6aWx5IGluIGNhc2Ugd2UgZG9uJ3QgbmVlZCB0byBkbyBhbnkgc2VsZWN0aW9uXG4gICAgdGhpcy5mYm8gPSB0aGlzLmdsLmNyZWF0ZUZyYW1lYnVmZmVyKCk7XG4gICAgdGhpcy5nbC5iaW5kRnJhbWVidWZmZXIodGhpcy5nbC5GUkFNRUJVRkZFUiwgdGhpcy5mYm8pO1xuICAgIHRoaXMuZmJvX3NpemUgPSB7IHdpZHRoOiAyNTYsIGhlaWdodDogMjU2IH07IC8vIFRPRE86IG1ha2UgY29uZmlndXJhYmxlIC8gYWRhcHRpdmUgYmFzZWQgb24gY2FudmFzIHNpemVcbiAgICB0aGlzLmdsLnZpZXdwb3J0KDAsIDAsIHRoaXMuZmJvX3NpemUud2lkdGgsIHRoaXMuZmJvX3NpemUuaGVpZ2h0KTtcblxuICAgIC8vIFRleHR1cmUgZm9yIHRoZSBGQk8gY29sb3IgYXR0YWNobWVudFxuICAgIHRoaXMuZmJvX3RleHR1cmUgPSBuZXcgR0xUZXh0dXJlKHRoaXMuZ2wsICdzZWxlY3Rpb25fZmJvJyk7XG4gICAgdGhpcy5mYm9fdGV4dHVyZS5zZXREYXRhKHRoaXMuZmJvX3NpemUud2lkdGgsIHRoaXMuZmJvX3NpemUuaGVpZ2h0LCBudWxsLCB7IGZpbHRlcmluZzogJ25lYXJlc3QnIH0pO1xuICAgIHRoaXMuZ2wuZnJhbWVidWZmZXJUZXh0dXJlMkQodGhpcy5nbC5GUkFNRUJVRkZFUiwgdGhpcy5nbC5DT0xPUl9BVFRBQ0hNRU5UMCwgdGhpcy5nbC5URVhUVVJFXzJELCB0aGlzLmZib190ZXh0dXJlLnRleHR1cmUsIDApO1xuXG4gICAgLy8gUmVuZGVyYnVmZmVyIGZvciB0aGUgRkJPIGRlcHRoIGF0dGFjaG1lbnRcbiAgICB0aGlzLmZib19kZXB0aF9yYiA9IHRoaXMuZ2wuY3JlYXRlUmVuZGVyYnVmZmVyKCk7XG4gICAgdGhpcy5nbC5iaW5kUmVuZGVyYnVmZmVyKHRoaXMuZ2wuUkVOREVSQlVGRkVSLCB0aGlzLmZib19kZXB0aF9yYik7XG4gICAgdGhpcy5nbC5yZW5kZXJidWZmZXJTdG9yYWdlKHRoaXMuZ2wuUkVOREVSQlVGRkVSLCB0aGlzLmdsLkRFUFRIX0NPTVBPTkVOVDE2LCB0aGlzLmZib19zaXplLndpZHRoLCB0aGlzLmZib19zaXplLmhlaWdodCk7XG4gICAgdGhpcy5nbC5mcmFtZWJ1ZmZlclJlbmRlcmJ1ZmZlcih0aGlzLmdsLkZSQU1FQlVGRkVSLCB0aGlzLmdsLkRFUFRIX0FUVEFDSE1FTlQsIHRoaXMuZ2wuUkVOREVSQlVGRkVSLCB0aGlzLmZib19kZXB0aF9yYik7XG5cbiAgICB0aGlzLmdsLmJpbmRGcmFtZWJ1ZmZlcih0aGlzLmdsLkZSQU1FQlVGRkVSLCBudWxsKTtcbiAgICB0aGlzLmdsLnZpZXdwb3J0KDAsIDAsIHRoaXMuY2FudmFzLndpZHRoLCB0aGlzLmNhbnZhcy5oZWlnaHQpO1xufTtcblxuLy8gV2ViIHdvcmtlcnMgaGFuZGxlIGhlYXZ5IGR1dHkgdGlsZSBjb25zdHJ1Y3Rpb246IG5ldHdvcmtpbmcsIGdlb21ldHJ5IHByb2Nlc3NpbmcsIGV0Yy5cblNjZW5lLnByb3RvdHlwZS5jcmVhdGVXb3JrZXJzID0gZnVuY3Rpb24gKGNhbGxiYWNrKSB7XG4gICAgdmFyIHF1ZXVlID0gUXVldWUoKTtcbiAgICB2YXIgd29ya2VyX3VybCA9IFNjZW5lLmxpYnJhcnlfYmFzZV91cmwgKyAndGFuZ3JhbS13b3JrZXIuZGVidWcuanMnICsgJz8nICsgKCtuZXcgRGF0ZSgpKTtcblxuICAgIC8vIExvYWQgJiBpbnN0YW50aWF0ZSB3b3JrZXJzXG4gICAgcXVldWUuZGVmZXIoY29tcGxldGUgPT4ge1xuICAgICAgICAvLyBMb2NhbCBvYmplY3QgVVJMcyBzdXBwb3J0ZWQ/XG4gICAgICAgIHZhciBjcmVhdGVPYmplY3RVUkwgPSAod2luZG93LlVSTCAmJiB3aW5kb3cuVVJMLmNyZWF0ZU9iamVjdFVSTCkgfHwgKHdpbmRvdy53ZWJraXRVUkwgJiYgd2luZG93LndlYmtpdFVSTC5jcmVhdGVPYmplY3RVUkwpO1xuICAgICAgICBpZiAoY3JlYXRlT2JqZWN0VVJMICYmIHRoaXMuYWxsb3dfY3Jvc3NfZG9tYWluX3dvcmtlcnMpIHtcbiAgICAgICAgICAgIC8vIFRvIGFsbG93IHdvcmtlcnMgdG8gYmUgbG9hZGVkIGNyb3NzLWRvbWFpbiwgZmlyc3QgbG9hZCB3b3JrZXIgc291cmNlIHZpYSBYSFIsIHRoZW4gY3JlYXRlIGEgbG9jYWwgVVJMIHZpYSBhIGJsb2JcbiAgICAgICAgICAgIHZhciByZXEgPSBuZXcgWE1MSHR0cFJlcXVlc3QoKTtcbiAgICAgICAgICAgIHJlcS5vbmxvYWQgPSAoKSA9PiB7XG4gICAgICAgICAgICAgICAgdmFyIHdvcmtlcl9sb2NhbF91cmwgPSBjcmVhdGVPYmplY3RVUkwobmV3IEJsb2IoW3JlcS5yZXNwb25zZV0sIHsgdHlwZTogJ2FwcGxpY2F0aW9uL2phdmFzY3JpcHQnIH0pKTtcbiAgICAgICAgICAgICAgICB0aGlzLm1ha2VXb3JrZXJzKHdvcmtlcl9sb2NhbF91cmwpO1xuICAgICAgICAgICAgICAgIGNvbXBsZXRlKCk7XG4gICAgICAgICAgICB9O1xuICAgICAgICAgICAgcmVxLm9wZW4oJ0dFVCcsIHdvcmtlcl91cmwsIHRydWUgLyogYXN5bmMgZmxhZyAqLyk7XG4gICAgICAgICAgICByZXEucmVzcG9uc2VUeXBlID0gJ3RleHQnO1xuICAgICAgICAgICAgcmVxLnNlbmQoKTtcbiAgICAgICAgfVxuICAgICAgICAvLyBUcmFkaXRpb25hbCBsb2FkIGZyb20gcmVtb3RlIFVSTFxuICAgICAgICBlbHNlIHtcbiAgICAgICAgICAgIGNvbnNvbGUubG9nKHRoaXMpO1xuICAgICAgICAgICAgdGhpcy5tYWtlV29ya2Vycyh3b3JrZXJfdXJsKTtcbiAgICAgICAgICAgIGNvbXBsZXRlKCk7XG4gICAgICAgIH1cbiAgICB9KTtcblxuICAgIC8vIEluaXQgd29ya2Vyc1xuICAgIHF1ZXVlLmF3YWl0KCgpID0+IHtcbiAgICAgICAgdGhpcy53b3JrZXJzLmZvckVhY2god29ya2VyID0+IHtcbiAgICAgICAgICAgIHdvcmtlci5hZGRFdmVudExpc3RlbmVyKCdtZXNzYWdlJywgdGhpcy53b3JrZXJCdWlsZFRpbGVDb21wbGV0ZWQuYmluZCh0aGlzKSk7XG4gICAgICAgICAgICB3b3JrZXIuYWRkRXZlbnRMaXN0ZW5lcignbWVzc2FnZScsIHRoaXMud29ya2VyR2V0RmVhdHVyZVNlbGVjdGlvbi5iaW5kKHRoaXMpKTtcbiAgICAgICAgICAgIHdvcmtlci5hZGRFdmVudExpc3RlbmVyKCdtZXNzYWdlJywgdGhpcy53b3JrZXJMb2dNZXNzYWdlLmJpbmQodGhpcykpO1xuICAgICAgICB9KTtcblxuICAgICAgICB0aGlzLm5leHRfd29ya2VyID0gMDtcbiAgICAgICAgdGhpcy5zZWxlY3Rpb25fbWFwX3dvcmtlcl9zaXplID0ge307XG5cbiAgICAgICAgaWYgKHR5cGVvZiBjYWxsYmFjayA9PSAnZnVuY3Rpb24nKSB7XG4gICAgICAgICAgICBjYWxsYmFjaygpO1xuICAgICAgICB9XG4gICAgfSk7XG59O1xuXG4vLyBJbnN0YW50aWF0ZSB3b3JrZXJzIGZyb20gVVJMXG5TY2VuZS5wcm90b3R5cGUubWFrZVdvcmtlcnMgPSBmdW5jdGlvbiAodXJsKSB7XG4gICAgdGhpcy53b3JrZXJzID0gW107XG4gICAgZm9yICh2YXIgdz0wOyB3IDwgdGhpcy5udW1fd29ya2VyczsgdysrKSB7XG4gICAgICAgIHRoaXMud29ya2Vycy5wdXNoKG5ldyBXb3JrZXIodXJsKSk7XG4gICAgICAgIHRoaXMud29ya2Vyc1t3XS5wb3N0TWVzc2FnZSh7XG4gICAgICAgICAgICB0eXBlOiAnaW5pdCcsXG4gICAgICAgICAgICB3b3JrZXJfaWQ6IHcsXG4gICAgICAgICAgICBudW1fd29ya2VyczogdGhpcy5udW1fd29ya2Vyc1xuICAgICAgICB9KVxuICAgIH1cbn07XG5cbi8vIFBvc3QgYSBtZXNzYWdlIGFib3V0IGEgdGlsZSB0byB0aGUgbmV4dCB3b3JrZXIgKHJvdW5kIHJvYmJpbilcblNjZW5lLnByb3RvdHlwZS53b3JrZXJQb3N0TWVzc2FnZUZvclRpbGUgPSBmdW5jdGlvbiAodGlsZSwgbWVzc2FnZSkge1xuICAgIGlmICh0aWxlLndvcmtlciA9PSBudWxsKSB7XG4gICAgICAgIHRpbGUud29ya2VyID0gdGhpcy5uZXh0X3dvcmtlcjtcbiAgICAgICAgdGhpcy5uZXh0X3dvcmtlciA9ICh0aWxlLndvcmtlciArIDEpICUgdGhpcy53b3JrZXJzLmxlbmd0aDtcbiAgICB9XG4gICAgdGhpcy53b3JrZXJzW3RpbGUud29ya2VyXS5wb3N0TWVzc2FnZShtZXNzYWdlKTtcbn07XG5cblNjZW5lLnByb3RvdHlwZS5zZXRDZW50ZXIgPSBmdW5jdGlvbiAobG5nLCBsYXQpIHtcbiAgICB0aGlzLmNlbnRlciA9IHsgbG5nOiBsbmcsIGxhdDogbGF0IH07XG4gICAgdGhpcy5kaXJ0eSA9IHRydWU7XG59O1xuXG5TY2VuZS5wcm90b3R5cGUuc3RhcnRab29tID0gZnVuY3Rpb24gKCkge1xuICAgIHRoaXMubGFzdF96b29tID0gdGhpcy56b29tO1xuICAgIHRoaXMuem9vbWluZyA9IHRydWU7XG59O1xuXG5TY2VuZS5wcm90b3R5cGUucHJlc2VydmVfdGlsZXNfd2l0aGluX3pvb20gPSAyO1xuU2NlbmUucHJvdG90eXBlLnNldFpvb20gPSBmdW5jdGlvbiAoem9vbSkge1xuICAgIC8vIFNjaGVkdWxlIEdMIHRpbGVzIGZvciByZW1vdmFsIG9uIHpvb21cbiAgICB2YXIgYmVsb3cgPSB6b29tO1xuICAgIHZhciBhYm92ZSA9IHpvb207XG4gICAgaWYgKHRoaXMubGFzdF96b29tICE9IG51bGwpIHtcbiAgICAgICAgY29uc29sZS5sb2coXCJzY2VuZS5sYXN0X3pvb206IFwiICsgdGhpcy5sYXN0X3pvb20pO1xuICAgICAgICBpZiAoTWF0aC5hYnMoem9vbSAtIHRoaXMubGFzdF96b29tKSA8PSB0aGlzLnByZXNlcnZlX3RpbGVzX3dpdGhpbl96b29tKSB7XG4gICAgICAgICAgICBpZiAoem9vbSA+IHRoaXMubGFzdF96b29tKSB7XG4gICAgICAgICAgICAgICAgYmVsb3cgPSB6b29tIC0gdGhpcy5wcmVzZXJ2ZV90aWxlc193aXRoaW5fem9vbTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIGVsc2Uge1xuICAgICAgICAgICAgICAgIGFib3ZlID0gem9vbSArIHRoaXMucHJlc2VydmVfdGlsZXNfd2l0aGluX3pvb207XG4gICAgICAgICAgICB9XG4gICAgICAgIH1cbiAgICB9XG5cbiAgICB0aGlzLmxhc3Rfem9vbSA9IHRoaXMuem9vbTtcbiAgICB0aGlzLnpvb20gPSB6b29tO1xuICAgIHRoaXMuY2FwcGVkX3pvb20gPSBNYXRoLm1pbih+fnRoaXMuem9vbSwgdGhpcy50aWxlX3NvdXJjZS5tYXhfem9vbSB8fCB+fnRoaXMuem9vbSk7XG4gICAgdGhpcy56b29taW5nID0gZmFsc2U7XG5cbiAgICB0aGlzLnJlbW92ZVRpbGVzT3V0c2lkZVpvb21SYW5nZShiZWxvdywgYWJvdmUpO1xuICAgIHRoaXMuZGlydHkgPSB0cnVlO1xufTtcblxuU2NlbmUucHJvdG90eXBlLnJlbW92ZVRpbGVzT3V0c2lkZVpvb21SYW5nZSA9IGZ1bmN0aW9uIChiZWxvdywgYWJvdmUpIHtcbiAgICBiZWxvdyA9IE1hdGgubWluKGJlbG93LCB0aGlzLnRpbGVfc291cmNlLm1heF96b29tIHx8IGJlbG93KTtcbiAgICBhYm92ZSA9IE1hdGgubWluKGFib3ZlLCB0aGlzLnRpbGVfc291cmNlLm1heF96b29tIHx8IGFib3ZlKTtcblxuICAgIGNvbnNvbGUubG9nKFwicmVtb3ZlVGlsZXNPdXRzaWRlWm9vbVJhbmdlIFtcIiArIGJlbG93ICsgXCIsIFwiICsgYWJvdmUgKyBcIl0pXCIpO1xuICAgIHZhciByZW1vdmVfdGlsZXMgPSBbXTtcbiAgICBmb3IgKHZhciB0IGluIHRoaXMudGlsZXMpIHtcbiAgICAgICAgdmFyIHRpbGUgPSB0aGlzLnRpbGVzW3RdO1xuICAgICAgICBpZiAodGlsZS5jb29yZHMueiA8IGJlbG93IHx8IHRpbGUuY29vcmRzLnogPiBhYm92ZSkge1xuICAgICAgICAgICAgcmVtb3ZlX3RpbGVzLnB1c2godCk7XG4gICAgICAgIH1cbiAgICB9XG4gICAgZm9yICh2YXIgcj0wOyByIDwgcmVtb3ZlX3RpbGVzLmxlbmd0aDsgcisrKSB7XG4gICAgICAgIHZhciBrZXkgPSByZW1vdmVfdGlsZXNbcl07XG4gICAgICAgIGNvbnNvbGUubG9nKFwicmVtb3ZlZCBcIiArIGtleSArIFwiIChvdXRzaWRlIHJhbmdlIFtcIiArIGJlbG93ICsgXCIsIFwiICsgYWJvdmUgKyBcIl0pXCIpO1xuICAgICAgICB0aGlzLnJlbW92ZVRpbGUoa2V5KTtcbiAgICB9XG59O1xuXG5TY2VuZS5wcm90b3R5cGUuc2V0Qm91bmRzID0gZnVuY3Rpb24gKHN3LCBuZSkge1xuICAgIHRoaXMuYm91bmRzID0ge1xuICAgICAgICBzdzogeyBsbmc6IHN3LmxuZywgbGF0OiBzdy5sYXQgfSxcbiAgICAgICAgbmU6IHsgbG5nOiBuZS5sbmcsIGxhdDogbmUubGF0IH1cbiAgICB9O1xuXG4gICAgdmFyIGJ1ZmZlciA9IDIwMCAqIEdlby5tZXRlcnNfcGVyX3BpeGVsW35+dGhpcy56b29tXTsgLy8gcGl4ZWxzIC0+IG1ldGVyc1xuICAgIHRoaXMuYnVmZmVyZWRfbWV0ZXJfYm91bmRzID0ge1xuICAgICAgICBzdzogR2VvLmxhdExuZ1RvTWV0ZXJzKFBvaW50KHRoaXMuYm91bmRzLnN3LmxuZywgdGhpcy5ib3VuZHMuc3cubGF0KSksXG4gICAgICAgIG5lOiBHZW8ubGF0TG5nVG9NZXRlcnMoUG9pbnQodGhpcy5ib3VuZHMubmUubG5nLCB0aGlzLmJvdW5kcy5uZS5sYXQpKVxuICAgIH07XG4gICAgdGhpcy5idWZmZXJlZF9tZXRlcl9ib3VuZHMuc3cueCAtPSBidWZmZXI7XG4gICAgdGhpcy5idWZmZXJlZF9tZXRlcl9ib3VuZHMuc3cueSAtPSBidWZmZXI7XG4gICAgdGhpcy5idWZmZXJlZF9tZXRlcl9ib3VuZHMubmUueCArPSBidWZmZXI7XG4gICAgdGhpcy5idWZmZXJlZF9tZXRlcl9ib3VuZHMubmUueSArPSBidWZmZXI7XG5cbiAgICB0aGlzLmNlbnRlcl9tZXRlcnMgPSBQb2ludChcbiAgICAgICAgKHRoaXMuYnVmZmVyZWRfbWV0ZXJfYm91bmRzLnN3LnggKyB0aGlzLmJ1ZmZlcmVkX21ldGVyX2JvdW5kcy5uZS54KSAvIDIsXG4gICAgICAgICh0aGlzLmJ1ZmZlcmVkX21ldGVyX2JvdW5kcy5zdy55ICsgdGhpcy5idWZmZXJlZF9tZXRlcl9ib3VuZHMubmUueSkgLyAyXG4gICAgKTtcblxuICAgIC8vIGNvbnNvbGUubG9nKFwic2V0IHNjZW5lIGJvdW5kcyB0byBcIiArIEpTT04uc3RyaW5naWZ5KHRoaXMuYm91bmRzKSk7XG5cbiAgICAvLyBNYXJrIHRpbGVzIGFzIHZpc2libGUvaW52aXNpYmxlXG4gICAgZm9yICh2YXIgdCBpbiB0aGlzLnRpbGVzKSB7XG4gICAgICAgIHRoaXMudXBkYXRlVmlzaWJpbGl0eUZvclRpbGUodGhpcy50aWxlc1t0XSk7XG4gICAgfVxuXG4gICAgdGhpcy5kaXJ0eSA9IHRydWU7XG59O1xuXG5TY2VuZS5wcm90b3R5cGUuaXNUaWxlSW5ab29tID0gZnVuY3Rpb24gKHRpbGUpIHtcbiAgICByZXR1cm4gKE1hdGgubWluKHRpbGUuY29vcmRzLnosIHRoaXMudGlsZV9zb3VyY2UubWF4X3pvb20gfHwgdGlsZS5jb29yZHMueikgPT0gdGhpcy5jYXBwZWRfem9vbSk7XG59O1xuXG4vLyBVcGRhdGUgdmlzaWJpbGl0eSBhbmQgcmV0dXJuIHRydWUgaWYgY2hhbmdlZFxuU2NlbmUucHJvdG90eXBlLnVwZGF0ZVZpc2liaWxpdHlGb3JUaWxlID0gZnVuY3Rpb24gKHRpbGUpIHtcbiAgICB2YXIgdmlzaWJsZSA9IHRpbGUudmlzaWJsZTtcbiAgICB0aWxlLnZpc2libGUgPSB0aGlzLmlzVGlsZUluWm9vbSh0aWxlKSAmJiBHZW8uYm94SW50ZXJzZWN0KHRpbGUuYm91bmRzLCB0aGlzLmJ1ZmZlcmVkX21ldGVyX2JvdW5kcyk7XG4gICAgdGlsZS5jZW50ZXJfZGlzdCA9IE1hdGguYWJzKHRoaXMuY2VudGVyX21ldGVycy54IC0gdGlsZS5taW4ueCkgKyBNYXRoLmFicyh0aGlzLmNlbnRlcl9tZXRlcnMueSAtIHRpbGUubWluLnkpO1xuICAgIHJldHVybiAodmlzaWJsZSAhPSB0aWxlLnZpc2libGUpO1xufTtcblxuU2NlbmUucHJvdG90eXBlLnJlc2l6ZU1hcCA9IGZ1bmN0aW9uICh3aWR0aCwgaGVpZ2h0KSB7XG4gICAgdGhpcy5kaXJ0eSA9IHRydWU7XG5cbiAgICB0aGlzLmNzc19zaXplID0geyB3aWR0aDogd2lkdGgsIGhlaWdodDogaGVpZ2h0IH07XG4gICAgdGhpcy5kZXZpY2Vfc2l6ZSA9IHsgd2lkdGg6IE1hdGgucm91bmQodGhpcy5jc3Nfc2l6ZS53aWR0aCAqIHRoaXMuZGV2aWNlX3BpeGVsX3JhdGlvKSwgaGVpZ2h0OiBNYXRoLnJvdW5kKHRoaXMuY3NzX3NpemUuaGVpZ2h0ICogdGhpcy5kZXZpY2VfcGl4ZWxfcmF0aW8pIH07XG5cbiAgICB0aGlzLmNhbnZhcy5zdHlsZS53aWR0aCA9IHRoaXMuY3NzX3NpemUud2lkdGggKyAncHgnO1xuICAgIHRoaXMuY2FudmFzLnN0eWxlLmhlaWdodCA9IHRoaXMuY3NzX3NpemUuaGVpZ2h0ICsgJ3B4JztcbiAgICB0aGlzLmNhbnZhcy53aWR0aCA9IHRoaXMuZGV2aWNlX3NpemUud2lkdGg7XG4gICAgdGhpcy5jYW52YXMuaGVpZ2h0ID0gdGhpcy5kZXZpY2Vfc2l6ZS5oZWlnaHQ7XG5cbiAgICB0aGlzLmdsLmJpbmRGcmFtZWJ1ZmZlcih0aGlzLmdsLkZSQU1FQlVGRkVSLCBudWxsKTtcbiAgICB0aGlzLmdsLnZpZXdwb3J0KDAsIDAsIHRoaXMuY2FudmFzLndpZHRoLCB0aGlzLmNhbnZhcy5oZWlnaHQpO1xufTtcblxuU2NlbmUucHJvdG90eXBlLnJlcXVlc3RSZWRyYXcgPSBmdW5jdGlvbiAoKSB7XG4gICAgdGhpcy5kaXJ0eSA9IHRydWU7XG59O1xuXG4vLyBEZXRlcm1pbmUgYSBaIHZhbHVlIHRoYXQgd2lsbCBzdGFjayBmZWF0dXJlcyBpbiBhIFwicGFpbnRlcidzIGFsZ29yaXRobVwiIHN0eWxlLCBmaXJzdCBieSBsYXllciwgdGhlbiBieSBkcmF3IG9yZGVyIHdpdGhpbiBsYXllclxuLy8gRmVhdHVyZXMgYXJlIGFzc3VtZWQgdG8gYmUgYWxyZWFkeSBzb3J0ZWQgaW4gZGVzaXJlZCBkcmF3IG9yZGVyIGJ5IHRoZSBsYXllciBwcmUtcHJvY2Vzc29yXG5TY2VuZS5jYWxjdWxhdGVaID0gZnVuY3Rpb24gKGxheWVyLCB0aWxlLCBsYXllcl9vZmZzZXQsIGZlYXR1cmVfb2Zmc2V0KSB7XG4gICAgLy8gdmFyIGxheWVyX29mZnNldCA9IGxheWVyX29mZnNldCB8fCAwO1xuICAgIC8vIHZhciBmZWF0dXJlX29mZnNldCA9IGZlYXR1cmVfb2Zmc2V0IHx8IDA7XG4gICAgdmFyIHogPSAwOyAvLyBUT0RPOiBtYWRlIHRoaXMgYSBuby1vcCB1bnRpbCByZXZpc2l0aW5nIHdoZXJlIGl0IHNob3VsZCBsaXZlIC0gb25lLXRpbWUgY2FsYyBoZXJlLCBpbiB2ZXJ0ZXggbGF5b3V0L3NoYWRlciwgZXRjLlxuICAgIHJldHVybiB6O1xufTtcblxuU2NlbmUucHJvdG90eXBlLnJlbmRlciA9IGZ1bmN0aW9uICgpIHtcbiAgICB0aGlzLmxvYWRRdWV1ZWRUaWxlcygpO1xuXG4gICAgLy8gUmVuZGVyIG9uIGRlbWFuZFxuICAgIGlmICh0aGlzLmRpcnR5ID09IGZhbHNlIHx8IHRoaXMuaW5pdGlhbGl6ZWQgPT0gZmFsc2UpIHtcbiAgICAgICAgcmV0dXJuIGZhbHNlO1xuICAgIH1cbiAgICB0aGlzLmRpcnR5ID0gZmFsc2U7IC8vIHN1YmNsYXNzZXMgY2FuIHNldCB0aGlzIGJhY2sgdG8gdHJ1ZSB3aGVuIGFuaW1hdGlvbiBpcyBuZWVkZWRcblxuICAgIHRoaXMucmVuZGVyR0woKTtcblxuICAgIC8vIFJlZHJhdyBldmVyeSBmcmFtZSBpZiBhbmltYXRpbmdcbiAgICBpZiAodGhpcy5hbmltYXRlZCA9PSB0cnVlKSB7XG4gICAgICAgIHRoaXMuZGlydHkgPSB0cnVlO1xuICAgIH1cblxuICAgIHRoaXMuZnJhbWUrKztcblxuICAgIC8vIGNvbnNvbGUubG9nKFwicmVuZGVyIG1hcFwiKTtcbiAgICByZXR1cm4gdHJ1ZTtcbn07XG5cblNjZW5lLnByb3RvdHlwZS5yZXNldEZyYW1lID0gZnVuY3Rpb24gKCkge1xuICAgIGlmICghdGhpcy5pbml0aWFsaXplZCkge1xuICAgICAgICByZXR1cm47XG4gICAgfVxuXG4gICAgLy8gUmVzZXQgZnJhbWUgc3RhdGVcbiAgICB2YXIgZ2wgPSB0aGlzLmdsO1xuICAgIGdsLmNsZWFyQ29sb3IoMC4wLCAwLjAsIDAuMCwgMS4wKTtcbiAgICBnbC5jbGVhcihnbC5DT0xPUl9CVUZGRVJfQklUIHwgZ2wuREVQVEhfQlVGRkVSX0JJVCk7XG5cbiAgICAvLyBUT0RPOiB1bm5lY2Vzc2FyeSByZXBlYXQ/XG4gICAgZ2wuZW5hYmxlKGdsLkRFUFRIX1RFU1QpO1xuICAgIGdsLmRlcHRoRnVuYyhnbC5MRVNTKTtcbiAgICBnbC5lbmFibGUoZ2wuQ1VMTF9GQUNFKTtcbiAgICBnbC5jdWxsRmFjZShnbC5CQUNLKTtcbiAgICAvLyBnbC5lbmFibGUoZ2wuQkxFTkQpO1xuICAgIC8vIGdsLmJsZW5kRnVuYyhnbC5TUkNfQUxQSEEsIGdsLk9ORV9NSU5VU19TUkNfQUxQSEEpO1xufTtcblxuU2NlbmUucHJvdG90eXBlLnJlbmRlckdMID0gZnVuY3Rpb24gKCkge1xuICAgIHZhciBnbCA9IHRoaXMuZ2w7XG5cbiAgICB0aGlzLmlucHV0KCk7XG4gICAgdGhpcy5yZXNldEZyYW1lKCk7XG5cbiAgICAvLyBNYXAgdHJhbnNmb3Jtc1xuICAgIHZhciBjZW50ZXIgPSBHZW8ubGF0TG5nVG9NZXRlcnMoUG9pbnQodGhpcy5jZW50ZXIubG5nLCB0aGlzLmNlbnRlci5sYXQpKTtcbiAgICB2YXIgbWV0ZXJzX3Blcl9waXhlbCA9IEdlby5taW5fem9vbV9tZXRlcnNfcGVyX3BpeGVsIC8gTWF0aC5wb3coMiwgdGhpcy56b29tKTtcbiAgICB2YXIgbWV0ZXJfem9vbSA9IFBvaW50KHRoaXMuY3NzX3NpemUud2lkdGggLyAyICogbWV0ZXJzX3Blcl9waXhlbCwgdGhpcy5jc3Nfc2l6ZS5oZWlnaHQgLyAyICogbWV0ZXJzX3Blcl9waXhlbCk7XG5cbiAgICAvLyBNb2RlbC12aWV3IG1hdHJpY2VzXG4gICAgdmFyIHRpbGVfdmlld19tYXQgPSBtYXQ0LmNyZWF0ZSgpO1xuICAgIHZhciB0aWxlX3dvcmxkX21hdCA9IG1hdDQuY3JlYXRlKCk7XG5cbiAgICAvLyBQZXJzcGVjdGl2ZS1zdHlsZSBwcm9qZWN0aW9uc1xuICAgIC8vIERpc3RhbmNlIHRoYXQgY2FtZXJhIHNob3VsZCBiZSBmcm9tIGdyb3VuZCBzdWNoIHRoYXQgaXQgZml0cyB0aGUgZmllbGQgb2YgdmlldyBleHBlY3RlZFxuICAgIC8vIGZvciBhIGNvbnZlbnRpb25hbCB3ZWIgbWVyY2F0b3IgbWFwIGF0IHRoZSBjdXJyZW50IHpvb20gbGV2ZWwgYW5kIGNhbWVyYSBmb2NhbCBsZW5ndGhcbiAgICB2YXIgY2FtZXJhX2hlaWdodCA9IG1ldGVyX3pvb20ueSAqIHRoaXMuZm9jYWxfbGVuZ3RoO1xuICAgIHZhciBmb2NhbF9sZW5ndGggPSB0aGlzLmZvY2FsX2xlbmd0aDtcbiAgICB2YXIgYXNwZWN0ID0gdGhpcy5jc3Nfc2l6ZS53aWR0aCAvIHRoaXMuY3NzX3NpemUuaGVpZ2h0O1xuICAgIHZhciB6bmVhciA9IDE7ICAgICAgICAgICAgICAgICAgICAgICAgICAgLy8gemVybyBjbGlwcGluZyBwbGFuZSBjYXVzZSBhcnRpZmFjdHMsIGxvb2tzIGxpa2UgeiBwcmVjaXNpb24gaXNzdWVzIChUT0RPOiB3aHk/KVxuICAgIHZhciB6ZmFyID0gKGNhbWVyYV9oZWlnaHQgKyB6bmVhcikgKiA1OyAgLy8gcHV0IGdlb21ldHJ5IGluIG5lYXIgMjAlIG9mIGNsaXBwaW5nIHBsYW5lLCB0byB0YWtlIGFkdmFudGFnZSBvZiBoaWdoZXItcHJlY2lzaW9uIGRlcHRoIHJhbmdlIChUT0RPOiBjYWxjdWxhdGUgdGhlIGRlcHRoIG5lZWRlZCB0byBwbGFjZSBnZW9tZXRyeSBhdCB6PTAgaW4gbm9ybWFsaXplZCBkZXZpY2UgY29vcmRzPylcblxuICAgIHZhciBwZXJzcGVjdGl2ZV9tYXQgPSBtYXQ0LmNyZWF0ZSgpO1xuICAgIG1hdDQucGVyc3BlY3RpdmUocGVyc3BlY3RpdmVfbWF0LCBNYXRoLmF0YW4oMS9mb2NhbF9sZW5ndGgpKjIsIGFzcGVjdCwgem5lYXIsIHpmYXIpO1xuICAgIG1hdDQudHJhbnNsYXRlKHBlcnNwZWN0aXZlX21hdCwgcGVyc3BlY3RpdmVfbWF0LCB2ZWMzLmZyb21WYWx1ZXMoMCwgMCwgLWNhbWVyYV9oZWlnaHQpKTtcblxuICAgIC8vIFJlbmRlcmFibGUgdGlsZSBsaXN0XG4gICAgdmFyIHJlbmRlcmFibGVfdGlsZXMgPSBbXTtcbiAgICBmb3IgKHZhciB0IGluIHRoaXMudGlsZXMpIHtcbiAgICAgICAgdmFyIHRpbGUgPSB0aGlzLnRpbGVzW3RdO1xuICAgICAgICBpZiAodGlsZS5sb2FkZWQgPT0gdHJ1ZSAmJiB0aWxlLnZpc2libGUgPT0gdHJ1ZSkge1xuICAgICAgICAgICAgcmVuZGVyYWJsZV90aWxlcy5wdXNoKHRpbGUpO1xuICAgICAgICB9XG4gICAgfVxuICAgIHRoaXMucmVuZGVyYWJsZV90aWxlc19jb3VudCA9IHJlbmRlcmFibGVfdGlsZXMubGVuZ3RoO1xuXG4gICAgLy8gUmVuZGVyIG1haW4gcGFzcyAtIHRpbGVzIGdyb3VwZWQgYnkgcmVuZGVyaW5nIG1vZGUgKEdMIHByb2dyYW0pXG4gICAgdmFyIHJlbmRlcl9jb3VudCA9IDA7XG4gICAgZm9yICh2YXIgbW9kZSBpbiB0aGlzLm1vZGVzKSB7XG4gICAgICAgIC8vIFBlci1mcmFtZSBtb2RlIHVwZGF0ZXMvYW5pbWF0aW9uc1xuICAgICAgICAvLyBDYWxsZWQgZXZlbiBpZiB0aGUgbW9kZSBpc24ndCByZW5kZXJlZCBieSBhbnkgY3VycmVudCB0aWxlcywgc28gdGltZS1iYXNlZCBhbmltYXRpb25zLCBldGMuIGNvbnRpbnVlXG4gICAgICAgIHRoaXMubW9kZXNbbW9kZV0udXBkYXRlKCk7XG5cbiAgICAgICAgdmFyIGdsX3Byb2dyYW0gPSB0aGlzLm1vZGVzW21vZGVdLmdsX3Byb2dyYW07XG4gICAgICAgIGlmIChnbF9wcm9ncmFtID09IG51bGwgfHwgZ2xfcHJvZ3JhbS5jb21waWxlZCA9PSBmYWxzZSkge1xuICAgICAgICAgICAgY29udGludWU7XG4gICAgICAgIH1cblxuICAgICAgICB2YXIgZmlyc3RfZm9yX21vZGUgPSB0cnVlO1xuXG4gICAgICAgIC8vIFJlbmRlciB0aWxlIEdMIGdlb21ldHJpZXNcbiAgICAgICAgZm9yICh2YXIgdCBpbiByZW5kZXJhYmxlX3RpbGVzKSB7XG4gICAgICAgICAgICB2YXIgdGlsZSA9IHJlbmRlcmFibGVfdGlsZXNbdF07XG5cbiAgICAgICAgICAgIGlmICh0aWxlLmdsX2dlb21ldHJ5W21vZGVdICE9IG51bGwpIHtcbiAgICAgICAgICAgICAgICAvLyBTZXR1cCBtb2RlIGlmIGVuY291bnRlcmluZyBmb3IgZmlyc3QgdGltZSB0aGlzIGZyYW1lXG4gICAgICAgICAgICAgICAgLy8gKGxhenkgaW5pdCwgbm90IGFsbCBtb2RlcyB3aWxsIGJlIHVzZWQgaW4gYWxsIHNjcmVlbiB2aWV3czsgc29tZSBtb2RlcyBtaWdodCBiZSBkZWZpbmVkIGJ1dCBuZXZlciB1c2VkKVxuICAgICAgICAgICAgICAgIGlmIChmaXJzdF9mb3JfbW9kZSA9PSB0cnVlKSB7XG4gICAgICAgICAgICAgICAgICAgIGZpcnN0X2Zvcl9tb2RlID0gZmFsc2U7XG5cbiAgICAgICAgICAgICAgICAgICAgZ2xfcHJvZ3JhbS51c2UoKTtcbiAgICAgICAgICAgICAgICAgICAgdGhpcy5tb2Rlc1ttb2RlXS5zZXRVbmlmb3JtcygpO1xuXG4gICAgICAgICAgICAgICAgICAgIC8vIFRPRE86IGRvbid0IHNldCB1bmlmb3JtcyB3aGVuIHRoZXkgaGF2ZW4ndCBjaGFuZ2VkXG4gICAgICAgICAgICAgICAgICAgIGdsX3Byb2dyYW0udW5pZm9ybSgnMmYnLCAndV9yZXNvbHV0aW9uJywgdGhpcy5kZXZpY2Vfc2l6ZS53aWR0aCwgdGhpcy5kZXZpY2Vfc2l6ZS5oZWlnaHQpO1xuICAgICAgICAgICAgICAgICAgICBnbF9wcm9ncmFtLnVuaWZvcm0oJzJmJywgJ3VfYXNwZWN0JywgdGhpcy5kZXZpY2Vfc2l6ZS53aWR0aCAvIHRoaXMuZGV2aWNlX3NpemUuaGVpZ2h0LCAxLjApO1xuICAgICAgICAgICAgICAgICAgICBnbF9wcm9ncmFtLnVuaWZvcm0oJzFmJywgJ3VfdGltZScsICgoK25ldyBEYXRlKCkpIC0gdGhpcy5zdGFydF90aW1lKSAvIDEwMDApO1xuICAgICAgICAgICAgICAgICAgICBnbF9wcm9ncmFtLnVuaWZvcm0oJzFmJywgJ3VfbWFwX3pvb20nLCB0aGlzLnpvb20pOyAvLyBNYXRoLmZsb29yKHRoaXMuem9vbSkgKyAoTWF0aC5sb2coKHRoaXMuem9vbSAlIDEpICsgMSkgLyBNYXRoLkxOMiAvLyBzY2FsZSBmcmFjdGlvbmFsIHpvb20gYnkgbG9nXG4gICAgICAgICAgICAgICAgICAgIGdsX3Byb2dyYW0udW5pZm9ybSgnMmYnLCAndV9tYXBfY2VudGVyJywgY2VudGVyLngsIGNlbnRlci55KTtcbiAgICAgICAgICAgICAgICAgICAgZ2xfcHJvZ3JhbS51bmlmb3JtKCcxZicsICd1X251bV9sYXllcnMnLCB0aGlzLmxheWVycy5sZW5ndGgpO1xuICAgICAgICAgICAgICAgICAgICBnbF9wcm9ncmFtLnVuaWZvcm0oJzFmJywgJ3VfbWV0ZXJzX3Blcl9waXhlbCcsIG1ldGVyc19wZXJfcGl4ZWwpO1xuICAgICAgICAgICAgICAgICAgICAvLyBnbF9wcm9ncmFtLnVuaWZvcm0oJzJmJywgJ3VfbWV0ZXJfem9vbScsIG1ldGVyX3pvb20ueCwgbWV0ZXJfem9vbS55KTtcbiAgICAgICAgICAgICAgICAgICAgZ2xfcHJvZ3JhbS51bmlmb3JtKCdNYXRyaXg0ZnYnLCAndV9wZXJzcGVjdGl2ZScsIGZhbHNlLCBwZXJzcGVjdGl2ZV9tYXQpO1xuICAgICAgICAgICAgICAgIH1cblxuICAgICAgICAgICAgICAgIC8vIFRPRE86IGNhbGMgdGhlc2Ugb25jZSBwZXIgdGlsZSAoY3VycmVudGx5IGJlaW5nIG5lZWRsZXNzbHkgcmUtY2FsY3VsYXRlZCBwZXItdGlsZS1wZXItbW9kZSlcblxuICAgICAgICAgICAgICAgIC8vIFRpbGUgb3JpZ2luXG4gICAgICAgICAgICAgICAgZ2xfcHJvZ3JhbS51bmlmb3JtKCcyZicsICd1X3RpbGVfb3JpZ2luJywgdGlsZS5taW4ueCwgdGlsZS5taW4ueSk7XG5cbiAgICAgICAgICAgICAgICAvLyBUaWxlIHZpZXcgbWF0cml4IC0gdHJhbnNmb3JtIHRpbGUgc3BhY2UgaW50byB2aWV3IHNwYWNlIChtZXRlcnMsIHJlbGF0aXZlIHRvIGNhbWVyYSlcbiAgICAgICAgICAgICAgICBtYXQ0LmlkZW50aXR5KHRpbGVfdmlld19tYXQpO1xuICAgICAgICAgICAgICAgIG1hdDQudHJhbnNsYXRlKHRpbGVfdmlld19tYXQsIHRpbGVfdmlld19tYXQsIHZlYzMuZnJvbVZhbHVlcyh0aWxlLm1pbi54IC0gY2VudGVyLngsIHRpbGUubWluLnkgLSBjZW50ZXIueSwgMCkpOyAvLyBhZGp1c3QgZm9yIHRpbGUgb3JpZ2luICYgbWFwIGNlbnRlclxuICAgICAgICAgICAgICAgIG1hdDQuc2NhbGUodGlsZV92aWV3X21hdCwgdGlsZV92aWV3X21hdCwgdmVjMy5mcm9tVmFsdWVzKHRpbGUuc3Bhbi54IC8gU2NlbmUudGlsZV9zY2FsZSwgLTEgKiB0aWxlLnNwYW4ueSAvIFNjZW5lLnRpbGVfc2NhbGUsIDEpKTsgLy8gc2NhbGUgdGlsZSBsb2NhbCBjb29yZHMgdG8gbWV0ZXJzXG4gICAgICAgICAgICAgICAgZ2xfcHJvZ3JhbS51bmlmb3JtKCdNYXRyaXg0ZnYnLCAndV90aWxlX3ZpZXcnLCBmYWxzZSwgdGlsZV92aWV3X21hdCk7XG5cbiAgICAgICAgICAgICAgICAvLyBUaWxlIHdvcmxkIG1hdHJpeCAtIHRyYW5zZm9ybSB0aWxlIHNwYWNlIGludG8gd29ybGQgc3BhY2UgKG1ldGVycywgYWJzb2x1dGUgbWVyY2F0b3IgcG9zaXRpb24pXG4gICAgICAgICAgICAgICAgbWF0NC5pZGVudGl0eSh0aWxlX3dvcmxkX21hdCk7XG4gICAgICAgICAgICAgICAgbWF0NC50cmFuc2xhdGUodGlsZV93b3JsZF9tYXQsIHRpbGVfd29ybGRfbWF0LCB2ZWMzLmZyb21WYWx1ZXModGlsZS5taW4ueCwgdGlsZS5taW4ueSwgMCkpO1xuICAgICAgICAgICAgICAgIG1hdDQuc2NhbGUodGlsZV93b3JsZF9tYXQsIHRpbGVfd29ybGRfbWF0LCB2ZWMzLmZyb21WYWx1ZXModGlsZS5zcGFuLnggLyBTY2VuZS50aWxlX3NjYWxlLCAtMSAqIHRpbGUuc3Bhbi55IC8gU2NlbmUudGlsZV9zY2FsZSwgMSkpOyAvLyBzY2FsZSB0aWxlIGxvY2FsIGNvb3JkcyB0byBtZXRlcnNcbiAgICAgICAgICAgICAgICBnbF9wcm9ncmFtLnVuaWZvcm0oJ01hdHJpeDRmdicsICd1X3RpbGVfd29ybGQnLCBmYWxzZSwgdGlsZV93b3JsZF9tYXQpO1xuXG4gICAgICAgICAgICAgICAgLy8gUmVuZGVyIHRpbGVcbiAgICAgICAgICAgICAgICB0aWxlLmdsX2dlb21ldHJ5W21vZGVdLnJlbmRlcigpO1xuICAgICAgICAgICAgICAgIHJlbmRlcl9jb3VudCArPSB0aWxlLmdsX2dlb21ldHJ5W21vZGVdLmdlb21ldHJ5X2NvdW50O1xuICAgICAgICAgICAgfVxuICAgICAgICB9XG4gICAgfVxuXG4gICAgLy8gUmVuZGVyIHNlbGVjdGlvbiBwYXNzIChpZiBuZWVkZWQpXG4gICAgLy8gU2xpZ2h0IHZhcmlhdGlvbnMgb24gcmVuZGVyIHBhc3MgY29kZSBhYm92ZSAtIG1vc3RseSBiZWNhdXNlIHdlJ3JlIHJldXNpbmcgdW5pZm9ybXMgZnJvbSB0aGUgbWFpblxuICAgIC8vIG1vZGUgcHJvZ3JhbSwgZm9yIHRoZSBzZWxlY3Rpb24gcHJvZ3JhbVxuICAgIC8vIFRPRE86IHJlZHVjZSBkdXBsaWNhdGVkIGNvZGUgdy9tYWluIHJlbmRlciBwYXNzIGFib3ZlXG4gICAgaWYgKHRoaXMudXBkYXRlX3NlbGVjdGlvbikge1xuICAgICAgICB0aGlzLnVwZGF0ZV9zZWxlY3Rpb24gPSBmYWxzZTsgLy8gcmVzZXQgc2VsZWN0aW9uIGNoZWNrXG5cbiAgICAgICAgLy8gVE9ETzogcXVldWUgY2FsbGJhY2sgdGlsbCBwYW5uaW5nIGlzIG92ZXI/IGNvb3JkcyB3aGVyZSBzZWxlY3Rpb24gd2FzIHJlcXVlc3RlZCBhcmUgb3V0IG9mIGRhdGVcbiAgICAgICAgaWYgKHRoaXMucGFubmluZykge1xuICAgICAgICAgICAgcmV0dXJuO1xuICAgICAgICB9XG5cbiAgICAgICAgLy8gU3dpdGNoIHRvIEZCT1xuICAgICAgICBnbC5iaW5kRnJhbWVidWZmZXIoZ2wuRlJBTUVCVUZGRVIsIHRoaXMuZmJvKTtcbiAgICAgICAgZ2wudmlld3BvcnQoMCwgMCwgdGhpcy5mYm9fc2l6ZS53aWR0aCwgdGhpcy5mYm9fc2l6ZS5oZWlnaHQpO1xuICAgICAgICB0aGlzLnJlc2V0RnJhbWUoKTtcblxuICAgICAgICBmb3IgKG1vZGUgaW4gdGhpcy5tb2Rlcykge1xuICAgICAgICAgICAgZ2xfcHJvZ3JhbSA9IHRoaXMubW9kZXNbbW9kZV0uc2VsZWN0aW9uX2dsX3Byb2dyYW07XG4gICAgICAgICAgICBpZiAoZ2xfcHJvZ3JhbSA9PSBudWxsIHx8IGdsX3Byb2dyYW0uY29tcGlsZWQgPT0gZmFsc2UpIHtcbiAgICAgICAgICAgICAgICBjb250aW51ZTtcbiAgICAgICAgICAgIH1cblxuICAgICAgICAgICAgZmlyc3RfZm9yX21vZGUgPSB0cnVlO1xuXG4gICAgICAgICAgICAvLyBSZW5kZXIgdGlsZSBHTCBnZW9tZXRyaWVzXG4gICAgICAgICAgICBmb3IgKHQgaW4gcmVuZGVyYWJsZV90aWxlcykge1xuICAgICAgICAgICAgICAgIHRpbGUgPSByZW5kZXJhYmxlX3RpbGVzW3RdO1xuXG4gICAgICAgICAgICAgICAgaWYgKHRpbGUuZ2xfZ2VvbWV0cnlbbW9kZV0gIT0gbnVsbCkge1xuICAgICAgICAgICAgICAgICAgICAvLyBTZXR1cCBtb2RlIGlmIGVuY291bnRlcmluZyBmb3IgZmlyc3QgdGltZSB0aGlzIGZyYW1lXG4gICAgICAgICAgICAgICAgICAgIGlmIChmaXJzdF9mb3JfbW9kZSA9PSB0cnVlKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICBmaXJzdF9mb3JfbW9kZSA9IGZhbHNlO1xuXG4gICAgICAgICAgICAgICAgICAgICAgICBnbF9wcm9ncmFtLnVzZSgpO1xuICAgICAgICAgICAgICAgICAgICAgICAgdGhpcy5tb2Rlc1ttb2RlXS5zZXRVbmlmb3JtcygpO1xuXG4gICAgICAgICAgICAgICAgICAgICAgICBnbF9wcm9ncmFtLnVuaWZvcm0oJzJmJywgJ3VfcmVzb2x1dGlvbicsIHRoaXMuZmJvX3NpemUud2lkdGgsIHRoaXMuZmJvX3NpemUuaGVpZ2h0KTtcbiAgICAgICAgICAgICAgICAgICAgICAgIGdsX3Byb2dyYW0udW5pZm9ybSgnMmYnLCAndV9hc3BlY3QnLCB0aGlzLmZib19zaXplLndpZHRoIC8gdGhpcy5mYm9fc2l6ZS5oZWlnaHQsIDEuMCk7XG4gICAgICAgICAgICAgICAgICAgICAgICBnbF9wcm9ncmFtLnVuaWZvcm0oJzFmJywgJ3VfdGltZScsICgoK25ldyBEYXRlKCkpIC0gdGhpcy5zdGFydF90aW1lKSAvIDEwMDApO1xuICAgICAgICAgICAgICAgICAgICAgICAgZ2xfcHJvZ3JhbS51bmlmb3JtKCcxZicsICd1X21hcF96b29tJywgdGhpcy56b29tKTtcbiAgICAgICAgICAgICAgICAgICAgICAgIGdsX3Byb2dyYW0udW5pZm9ybSgnMmYnLCAndV9tYXBfY2VudGVyJywgY2VudGVyLngsIGNlbnRlci55KTtcbiAgICAgICAgICAgICAgICAgICAgICAgIGdsX3Byb2dyYW0udW5pZm9ybSgnMWYnLCAndV9udW1fbGF5ZXJzJywgdGhpcy5sYXllcnMubGVuZ3RoKTtcbiAgICAgICAgICAgICAgICAgICAgICAgIGdsX3Byb2dyYW0udW5pZm9ybSgnMWYnLCAndV9tZXRlcnNfcGVyX3BpeGVsJywgbWV0ZXJzX3Blcl9waXhlbCk7XG4gICAgICAgICAgICAgICAgICAgICAgICAvLyBnbF9wcm9ncmFtLnVuaWZvcm0oJzJmJywgJ3VfbWV0ZXJfem9vbScsIG1ldGVyX3pvb20ueCwgbWV0ZXJfem9vbS55KTtcbiAgICAgICAgICAgICAgICAgICAgICAgIGdsX3Byb2dyYW0udW5pZm9ybSgnTWF0cml4NGZ2JywgJ3VfcGVyc3BlY3RpdmUnLCBmYWxzZSwgcGVyc3BlY3RpdmVfbWF0KTtcbiAgICAgICAgICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICAgICAgICAgIC8vIFRpbGUgb3JpZ2luXG4gICAgICAgICAgICAgICAgICAgIGdsX3Byb2dyYW0udW5pZm9ybSgnMmYnLCAndV90aWxlX29yaWdpbicsIHRpbGUubWluLngsIHRpbGUubWluLnkpO1xuXG4gICAgICAgICAgICAgICAgICAgIC8vIFRpbGUgdmlldyBtYXRyaXggLSB0cmFuc2Zvcm0gdGlsZSBzcGFjZSBpbnRvIHZpZXcgc3BhY2UgKG1ldGVycywgcmVsYXRpdmUgdG8gY2FtZXJhKVxuICAgICAgICAgICAgICAgICAgICBtYXQ0LmlkZW50aXR5KHRpbGVfdmlld19tYXQpO1xuICAgICAgICAgICAgICAgICAgICBtYXQ0LnRyYW5zbGF0ZSh0aWxlX3ZpZXdfbWF0LCB0aWxlX3ZpZXdfbWF0LCB2ZWMzLmZyb21WYWx1ZXModGlsZS5taW4ueCAtIGNlbnRlci54LCB0aWxlLm1pbi55IC0gY2VudGVyLnksIDApKTsgLy8gYWRqdXN0IGZvciB0aWxlIG9yaWdpbiAmIG1hcCBjZW50ZXJcbiAgICAgICAgICAgICAgICAgICAgbWF0NC5zY2FsZSh0aWxlX3ZpZXdfbWF0LCB0aWxlX3ZpZXdfbWF0LCB2ZWMzLmZyb21WYWx1ZXModGlsZS5zcGFuLnggLyBTY2VuZS50aWxlX3NjYWxlLCAtMSAqIHRpbGUuc3Bhbi55IC8gU2NlbmUudGlsZV9zY2FsZSwgMSkpOyAvLyBzY2FsZSB0aWxlIGxvY2FsIGNvb3JkcyB0byBtZXRlcnNcbiAgICAgICAgICAgICAgICAgICAgZ2xfcHJvZ3JhbS51bmlmb3JtKCdNYXRyaXg0ZnYnLCAndV90aWxlX3ZpZXcnLCBmYWxzZSwgdGlsZV92aWV3X21hdCk7XG5cbiAgICAgICAgICAgICAgICAgICAgLy8gVGlsZSB3b3JsZCBtYXRyaXggLSB0cmFuc2Zvcm0gdGlsZSBzcGFjZSBpbnRvIHdvcmxkIHNwYWNlIChtZXRlcnMsIGFic29sdXRlIG1lcmNhdG9yIHBvc2l0aW9uKVxuICAgICAgICAgICAgICAgICAgICBtYXQ0LmlkZW50aXR5KHRpbGVfd29ybGRfbWF0KTtcbiAgICAgICAgICAgICAgICAgICAgbWF0NC50cmFuc2xhdGUodGlsZV93b3JsZF9tYXQsIHRpbGVfd29ybGRfbWF0LCB2ZWMzLmZyb21WYWx1ZXModGlsZS5taW4ueCwgdGlsZS5taW4ueSwgMCkpO1xuICAgICAgICAgICAgICAgICAgICBtYXQ0LnNjYWxlKHRpbGVfd29ybGRfbWF0LCB0aWxlX3dvcmxkX21hdCwgdmVjMy5mcm9tVmFsdWVzKHRpbGUuc3Bhbi54IC8gU2NlbmUudGlsZV9zY2FsZSwgLTEgKiB0aWxlLnNwYW4ueSAvIFNjZW5lLnRpbGVfc2NhbGUsIDEpKTsgLy8gc2NhbGUgdGlsZSBsb2NhbCBjb29yZHMgdG8gbWV0ZXJzXG4gICAgICAgICAgICAgICAgICAgIGdsX3Byb2dyYW0udW5pZm9ybSgnTWF0cml4NGZ2JywgJ3VfdGlsZV93b3JsZCcsIGZhbHNlLCB0aWxlX3dvcmxkX21hdCk7XG5cbiAgICAgICAgICAgICAgICAgICAgLy8gUmVuZGVyIHRpbGVcbiAgICAgICAgICAgICAgICAgICAgdGlsZS5nbF9nZW9tZXRyeVttb2RlXS5yZW5kZXIoKTtcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICB9XG4gICAgICAgIH1cblxuICAgICAgICAvLyBEZWxheSByZWFkaW5nIHRoZSBwaXhlbCByZXN1bHQgZnJvbSB0aGUgc2VsZWN0aW9uIGJ1ZmZlciB0byBhdm9pZCBDUFUvR1BVIHN5bmMgbG9jay5cbiAgICAgICAgLy8gQ2FsbGluZyByZWFkUGl4ZWxzIHN5bmNocm9ub3VzbHkgY2F1c2VkIGEgbWFzc2l2ZSBwZXJmb3JtYW5jZSBoaXQsIHByZXN1bWFibHkgc2luY2UgaXRcbiAgICAgICAgLy8gZm9yY2VkIHRoaXMgZnVuY3Rpb24gdG8gd2FpdCBmb3IgdGhlIEdQVSB0byBmaW5pc2ggcmVuZGVyaW5nIGFuZCByZXRyaWV2ZSB0aGUgdGV4dHVyZSBjb250ZW50cy5cbiAgICAgICAgaWYgKHRoaXMuc2VsZWN0aW9uX2NhbGxiYWNrX3RpbWVyICE9IG51bGwpIHtcbiAgICAgICAgICAgIGNsZWFyVGltZW91dCh0aGlzLnNlbGVjdGlvbl9jYWxsYmFja190aW1lcik7XG4gICAgICAgIH1cbiAgICAgICAgdGhpcy5zZWxlY3Rpb25fY2FsbGJhY2tfdGltZXIgPSBzZXRUaW1lb3V0KFxuICAgICAgICAgICAgdGhpcy5yZWFkU2VsZWN0aW9uQnVmZmVyLmJpbmQodGhpcyksXG4gICAgICAgICAgICB0aGlzLnNlbGVjdGlvbl9mcmFtZV9kZWxheVxuICAgICAgICApO1xuXG4gICAgICAgIC8vIFJlc2V0IHRvIHNjcmVlbiBidWZmZXJcbiAgICAgICAgZ2wuYmluZEZyYW1lYnVmZmVyKGdsLkZSQU1FQlVGRkVSLCBudWxsKTtcbiAgICAgICAgZ2wudmlld3BvcnQoMCwgMCwgdGhpcy5jYW52YXMud2lkdGgsIHRoaXMuY2FudmFzLmhlaWdodCk7XG4gICAgfVxuXG4gICAgaWYgKHJlbmRlcl9jb3VudCAhPSB0aGlzLmxhc3RfcmVuZGVyX2NvdW50KSB7XG4gICAgICAgIGNvbnNvbGUubG9nKFwicmVuZGVyZWQgXCIgKyByZW5kZXJfY291bnQgKyBcIiBwcmltaXRpdmVzXCIpO1xuICAgIH1cbiAgICB0aGlzLmxhc3RfcmVuZGVyX2NvdW50ID0gcmVuZGVyX2NvdW50O1xuXG4gICAgcmV0dXJuIHRydWU7XG59O1xuXG4vLyBSZXF1ZXN0IGZlYXR1cmUgc2VsZWN0aW9uXG4vLyBSdW5zIGFzeW5jaHJvbm91c2x5LCBzY2hlZHVsZXMgc2VsZWN0aW9uIGJ1ZmZlciB0byBiZSB1cGRhdGVkXG5TY2VuZS5wcm90b3R5cGUuZ2V0RmVhdHVyZUF0ID0gZnVuY3Rpb24gKHBpeGVsLCBjYWxsYmFjaykge1xuICAgIGlmICghdGhpcy5pbml0aWFsaXplZCkge1xuICAgICAgICByZXR1cm47XG4gICAgfVxuXG4gICAgLy8gVE9ETzogcXVldWUgY2FsbGJhY2tzIHdoaWxlIHN0aWxsIHBlcmZvcm1pbmcgb25seSBvbmUgc2VsZWN0aW9uIHJlbmRlciBwYXNzIHdpdGhpbiBYIHRpbWUgaW50ZXJ2YWw/XG4gICAgaWYgKHRoaXMudXBkYXRlX3NlbGVjdGlvbiA9PSB0cnVlKSB7XG4gICAgICAgIHJldHVybjtcbiAgICB9XG5cbiAgICB0aGlzLnNlbGVjdGlvbl9wb2ludCA9IFBvaW50KFxuICAgICAgICBwaXhlbC54ICogdGhpcy5kZXZpY2VfcGl4ZWxfcmF0aW8sXG4gICAgICAgIHRoaXMuZGV2aWNlX3NpemUuaGVpZ2h0IC0gKHBpeGVsLnkgKiB0aGlzLmRldmljZV9waXhlbF9yYXRpbylcbiAgICApO1xuICAgIHRoaXMuc2VsZWN0aW9uX2NhbGxiYWNrID0gY2FsbGJhY2s7XG4gICAgdGhpcy51cGRhdGVfc2VsZWN0aW9uID0gdHJ1ZTtcbiAgICB0aGlzLmRpcnR5ID0gdHJ1ZTtcbn07XG5cblNjZW5lLnByb3RvdHlwZS5yZWFkU2VsZWN0aW9uQnVmZmVyID0gZnVuY3Rpb24gKCkge1xuICAgIHZhciBnbCA9IHRoaXMuZ2w7XG5cbiAgICBnbC5iaW5kRnJhbWVidWZmZXIoZ2wuRlJBTUVCVUZGRVIsIHRoaXMuZmJvKTtcblxuICAgIC8vIENoZWNrIHNlbGVjdGlvbiBtYXAgYWdhaW5zdCBGQk9cbiAgICBnbC5yZWFkUGl4ZWxzKFxuICAgICAgICBNYXRoLmZsb29yKHRoaXMuc2VsZWN0aW9uX3BvaW50LnggKiB0aGlzLmZib19zaXplLndpZHRoIC8gdGhpcy5kZXZpY2Vfc2l6ZS53aWR0aCksXG4gICAgICAgIE1hdGguZmxvb3IodGhpcy5zZWxlY3Rpb25fcG9pbnQueSAqIHRoaXMuZmJvX3NpemUuaGVpZ2h0IC8gdGhpcy5kZXZpY2Vfc2l6ZS5oZWlnaHQpLFxuICAgICAgICAxLCAxLCBnbC5SR0JBLCBnbC5VTlNJR05FRF9CWVRFLCB0aGlzLnBpeGVsKTtcbiAgICB2YXIgZmVhdHVyZV9rZXkgPSAodGhpcy5waXhlbFswXSArICh0aGlzLnBpeGVsWzFdIDw8IDgpICsgKHRoaXMucGl4ZWxbMl0gPDwgMTYpICsgKHRoaXMucGl4ZWxbM10gPDwgMjQpKSA+Pj4gMDtcblxuICAgIC8vIGNvbnNvbGUubG9nKFxuICAgIC8vICAgICBNYXRoLmZsb29yKHRoaXMuc2VsZWN0aW9uX3BvaW50LnggKiB0aGlzLmZib19zaXplLndpZHRoIC8gdGhpcy5kZXZpY2Vfc2l6ZS53aWR0aCkgKyBcIiwgXCIgK1xuICAgIC8vICAgICBNYXRoLmZsb29yKHRoaXMuc2VsZWN0aW9uX3BvaW50LnkgKiB0aGlzLmZib19zaXplLmhlaWdodCAvIHRoaXMuZGV2aWNlX3NpemUuaGVpZ2h0KSArIFwiOiAoXCIgK1xuICAgIC8vICAgICB0aGlzLnBpeGVsWzBdICsgXCIsIFwiICsgdGhpcy5waXhlbFsxXSArIFwiLCBcIiArIHRoaXMucGl4ZWxbMl0gKyBcIiwgXCIgKyB0aGlzLnBpeGVsWzNdICsgXCIpXCIpO1xuXG4gICAgLy8gSWYgZmVhdHVyZSBmb3VuZCwgYXNrIGFwcHJvcHJpYXRlIHdlYiB3b3JrZXIgdG8gbG9va3VwIGZlYXR1cmVcbiAgICB2YXIgd29ya2VyX2lkID0gdGhpcy5waXhlbFszXTtcbiAgICBpZiAod29ya2VyX2lkICE9IDI1NSkgeyAvLyAyNTUgaW5kaWNhdGVzIGFuIGVtcHR5IHNlbGVjdGlvbiBidWZmZXIgcGl4ZWxcbiAgICAgICAgLy8gY29uc29sZS5sb2coXCJ3b3JrZXJfaWQ6IFwiICsgd29ya2VyX2lkKTtcbiAgICAgICAgaWYgKHRoaXMud29ya2Vyc1t3b3JrZXJfaWRdICE9IG51bGwpIHtcbiAgICAgICAgICAgIC8vIGNvbnNvbGUubG9nKFwicG9zdCBtZXNzYWdlXCIpO1xuICAgICAgICAgICAgdGhpcy53b3JrZXJzW3dvcmtlcl9pZF0ucG9zdE1lc3NhZ2Uoe1xuICAgICAgICAgICAgICAgIHR5cGU6ICdnZXRGZWF0dXJlU2VsZWN0aW9uJyxcbiAgICAgICAgICAgICAgICBrZXk6IGZlYXR1cmVfa2V5XG4gICAgICAgICAgICB9KTtcbiAgICAgICAgfVxuICAgIH1cbiAgICAvLyBObyBmZWF0dXJlIGZvdW5kLCBidXQgc3RpbGwgbmVlZCB0byBub3RpZnkgdmlhIGNhbGxiYWNrXG4gICAgZWxzZSB7XG4gICAgICAgIHRoaXMud29ya2VyR2V0RmVhdHVyZVNlbGVjdGlvbih7IGRhdGE6IHsgdHlwZTogJ2dldEZlYXR1cmVTZWxlY3Rpb24nLCBmZWF0dXJlOiBudWxsIH0gfSk7XG4gICAgfVxuXG4gICAgZ2wuYmluZEZyYW1lYnVmZmVyKGdsLkZSQU1FQlVGRkVSLCBudWxsKTtcbn07XG5cbi8vIENhbGxlZCBvbiBtYWluIHRocmVhZCB3aGVuIGEgd2ViIHdvcmtlciBmaW5kcyBhIGZlYXR1cmUgaW4gdGhlIHNlbGVjdGlvbiBidWZmZXJcblNjZW5lLnByb3RvdHlwZS53b3JrZXJHZXRGZWF0dXJlU2VsZWN0aW9uID0gZnVuY3Rpb24gKGV2ZW50KSB7XG4gICAgaWYgKGV2ZW50LmRhdGEudHlwZSAhPSAnZ2V0RmVhdHVyZVNlbGVjdGlvbicpIHtcbiAgICAgICAgcmV0dXJuO1xuICAgIH1cblxuICAgIHZhciBmZWF0dXJlID0gZXZlbnQuZGF0YS5mZWF0dXJlO1xuICAgIHZhciBjaGFuZ2VkID0gZmFsc2U7XG4gICAgaWYgKChmZWF0dXJlICE9IG51bGwgJiYgdGhpcy5zZWxlY3RlZF9mZWF0dXJlID09IG51bGwpIHx8XG4gICAgICAgIChmZWF0dXJlID09IG51bGwgJiYgdGhpcy5zZWxlY3RlZF9mZWF0dXJlICE9IG51bGwpIHx8XG4gICAgICAgIChmZWF0dXJlICE9IG51bGwgJiYgdGhpcy5zZWxlY3RlZF9mZWF0dXJlICE9IG51bGwgJiYgZmVhdHVyZS5pZCAhPSB0aGlzLnNlbGVjdGVkX2ZlYXR1cmUuaWQpKSB7XG4gICAgICAgIGNoYW5nZWQgPSB0cnVlO1xuICAgIH1cblxuICAgIHRoaXMuc2VsZWN0ZWRfZmVhdHVyZSA9IGZlYXR1cmU7XG5cbiAgICBpZiAodHlwZW9mIHRoaXMuc2VsZWN0aW9uX2NhbGxiYWNrID09ICdmdW5jdGlvbicpIHtcbiAgICAgICAgdGhpcy5zZWxlY3Rpb25fY2FsbGJhY2soeyBmZWF0dXJlOiB0aGlzLnNlbGVjdGVkX2ZlYXR1cmUsIGNoYW5nZWQ6IGNoYW5nZWQgfSk7XG4gICAgfVxufTtcblxuLy8gUXVldWUgYSB0aWxlIGZvciBsb2FkXG5TY2VuZS5wcm90b3R5cGUubG9hZFRpbGUgPSBmdW5jdGlvbiAoY29vcmRzLCBkaXYsIGNhbGxiYWNrKSB7XG4gICAgdGhpcy5xdWV1ZWRfdGlsZXNbdGhpcy5xdWV1ZWRfdGlsZXMubGVuZ3RoXSA9IGFyZ3VtZW50cztcbn07XG5cbi8vIExvYWQgYWxsIHF1ZXVlZCB0aWxlc1xuU2NlbmUucHJvdG90eXBlLmxvYWRRdWV1ZWRUaWxlcyA9IGZ1bmN0aW9uICgpIHtcbiAgICBpZiAoIXRoaXMuaW5pdGlhbGl6ZWQpIHtcbiAgICAgICAgcmV0dXJuO1xuICAgIH1cblxuICAgIGlmICh0aGlzLnF1ZXVlZF90aWxlcy5sZW5ndGggPT0gMCkge1xuICAgICAgICByZXR1cm47XG4gICAgfVxuXG4gICAgZm9yICh2YXIgdD0wOyB0IDwgdGhpcy5xdWV1ZWRfdGlsZXMubGVuZ3RoOyB0KyspIHtcbiAgICAgICAgdGhpcy5fbG9hZFRpbGUuYXBwbHkodGhpcywgdGhpcy5xdWV1ZWRfdGlsZXNbdF0pO1xuICAgIH1cblxuICAgIHRoaXMucXVldWVkX3RpbGVzID0gW107XG59O1xuXG4vLyBMb2FkIGEgc2luZ2xlIHRpbGVcblNjZW5lLnByb3RvdHlwZS5fbG9hZFRpbGUgPSBmdW5jdGlvbiAoY29vcmRzLCBkaXYsIGNhbGxiYWNrKSB7XG4gICAgLy8gT3Zlcnpvb20/XG4gICAgaWYgKGNvb3Jkcy56ID4gdGhpcy50aWxlX3NvdXJjZS5tYXhfem9vbSkge1xuICAgICAgICB2YXIgemdhcCA9IGNvb3Jkcy56IC0gdGhpcy50aWxlX3NvdXJjZS5tYXhfem9vbTtcbiAgICAgICAgLy8gdmFyIG9yaWdpbmFsX3RpbGUgPSBbY29vcmRzLngsIGNvb3Jkcy55LCBjb29yZHMuel0uam9pbignLycpO1xuICAgICAgICBjb29yZHMueCA9IH5+KGNvb3Jkcy54IC8gTWF0aC5wb3coMiwgemdhcCkpO1xuICAgICAgICBjb29yZHMueSA9IH5+KGNvb3Jkcy55IC8gTWF0aC5wb3coMiwgemdhcCkpO1xuICAgICAgICBjb29yZHMuZGlzcGxheV96ID0gY29vcmRzLno7IC8vIHogd2l0aG91dCBvdmVyem9vbVxuICAgICAgICBjb29yZHMueiAtPSB6Z2FwO1xuICAgICAgICAvLyBjb25zb2xlLmxvZyhcImFkanVzdGVkIGZvciBvdmVyem9vbSwgdGlsZSBcIiArIG9yaWdpbmFsX3RpbGUgKyBcIiAtPiBcIiArIFtjb29yZHMueCwgY29vcmRzLnksIGNvb3Jkcy56XS5qb2luKCcvJykpO1xuICAgIH1cblxuICAgIHRoaXMudHJhY2tUaWxlU2V0TG9hZFN0YXJ0KCk7XG5cbiAgICB2YXIga2V5ID0gW2Nvb3Jkcy54LCBjb29yZHMueSwgY29vcmRzLnpdLmpvaW4oJy8nKTtcblxuICAgIC8vIEFscmVhZHkgbG9hZGluZy9sb2FkZWQ/XG4gICAgaWYgKHRoaXMudGlsZXNba2V5XSkge1xuICAgICAgICAvLyBpZiAodGhpcy50aWxlc1trZXldLmxvYWRlZCA9PSB0cnVlKSB7XG4gICAgICAgIC8vICAgICBjb25zb2xlLmxvZyhcInVzZSBsb2FkZWQgdGlsZSBcIiArIGtleSArIFwiIGZyb20gY2FjaGVcIik7XG4gICAgICAgIC8vIH1cbiAgICAgICAgLy8gaWYgKHRoaXMudGlsZXNba2V5XS5sb2FkaW5nID09IHRydWUpIHtcbiAgICAgICAgLy8gICAgIGNvbnNvbGUubG9nKFwiYWxyZWFkeSBsb2FkaW5nIHRpbGUgXCIgKyBrZXkgKyBcIiwgc2tpcFwiKTtcbiAgICAgICAgLy8gfVxuXG4gICAgICAgIGlmIChjYWxsYmFjaykge1xuICAgICAgICAgICAgY2FsbGJhY2sobnVsbCwgZGl2KTtcbiAgICAgICAgfVxuICAgICAgICByZXR1cm47XG4gICAgfVxuXG4gICAgdmFyIHRpbGUgPSB0aGlzLnRpbGVzW2tleV0gPSB7fTtcbiAgICB0aWxlLmtleSA9IGtleTtcbiAgICB0aWxlLmNvb3JkcyA9IGNvb3JkcztcbiAgICB0aWxlLm1pbiA9IEdlby5tZXRlcnNGb3JUaWxlKHRpbGUuY29vcmRzKTtcbiAgICB0aWxlLm1heCA9IEdlby5tZXRlcnNGb3JUaWxlKHsgeDogdGlsZS5jb29yZHMueCArIDEsIHk6IHRpbGUuY29vcmRzLnkgKyAxLCB6OiB0aWxlLmNvb3Jkcy56IH0pO1xuICAgIHRpbGUuc3BhbiA9IHsgeDogKHRpbGUubWF4LnggLSB0aWxlLm1pbi54KSwgeTogKHRpbGUubWF4LnkgLSB0aWxlLm1pbi55KSB9O1xuICAgIHRpbGUuYm91bmRzID0geyBzdzogeyB4OiB0aWxlLm1pbi54LCB5OiB0aWxlLm1heC55IH0sIG5lOiB7IHg6IHRpbGUubWF4LngsIHk6IHRpbGUubWluLnkgfSB9O1xuICAgIHRpbGUuZGVidWcgPSB7fTtcbiAgICB0aWxlLmxvYWRpbmcgPSB0cnVlO1xuICAgIHRpbGUubG9hZGVkID0gZmFsc2U7XG5cbiAgICB0aGlzLmJ1aWxkVGlsZSh0aWxlLmtleSk7XG4gICAgdGhpcy51cGRhdGVUaWxlRWxlbWVudCh0aWxlLCBkaXYpO1xuICAgIHRoaXMudXBkYXRlVmlzaWJpbGl0eUZvclRpbGUodGlsZSk7XG5cbiAgICBpZiAoY2FsbGJhY2spIHtcbiAgICAgICAgY2FsbGJhY2sobnVsbCwgZGl2KTtcbiAgICB9XG59O1xuXG4vLyBSZWJ1aWxkIGFsbCB0aWxlc1xuLy8gVE9ETzogYWxzbyByZWJ1aWxkIG1vZGVzPyAoZGV0ZWN0IGlmIGNoYW5nZWQpXG5TY2VuZS5wcm90b3R5cGUucmVidWlsZFRpbGVzID0gZnVuY3Rpb24gKCkge1xuICAgIGlmICghdGhpcy5pbml0aWFsaXplZCkge1xuICAgICAgICByZXR1cm47XG4gICAgfVxuXG4gICAgLy8gVXBkYXRlIGxheWVycyAmIHN0eWxlc1xuICAgIHRoaXMubGF5ZXJzX3NlcmlhbGl6ZWQgPSBVdGlscy5zZXJpYWxpemVXaXRoRnVuY3Rpb25zKHRoaXMubGF5ZXJzKTtcbiAgICB0aGlzLnN0eWxlc19zZXJpYWxpemVkID0gVXRpbHMuc2VyaWFsaXplV2l0aEZ1bmN0aW9ucyh0aGlzLnN0eWxlcyk7XG4gICAgdGhpcy5zZWxlY3Rpb25fbWFwID0ge307XG5cbiAgICAvLyBUZWxsIHdvcmtlcnMgd2UncmUgYWJvdXQgdG8gcmVidWlsZCAoc28gdGhleSBjYW4gcmVmcmVzaCBzdHlsZXMsIGV0Yy4pXG4gICAgdGhpcy53b3JrZXJzLmZvckVhY2god29ya2VyID0+IHtcbiAgICAgICAgd29ya2VyLnBvc3RNZXNzYWdlKHtcbiAgICAgICAgICAgIHR5cGU6ICdwcmVwYXJlRm9yUmVidWlsZCcsXG4gICAgICAgICAgICBsYXllcnM6IHRoaXMubGF5ZXJzX3NlcmlhbGl6ZWQsXG4gICAgICAgICAgICBzdHlsZXM6IHRoaXMuc3R5bGVzX3NlcmlhbGl6ZWRcbiAgICAgICAgfSk7XG4gICAgfSk7XG5cbiAgICAvLyBSZWJ1aWxkIHZpc2libGUgdGlsZXMgZmlyc3QsIGZyb20gY2VudGVyIG91dFxuICAgIC8vIGNvbnNvbGUubG9nKFwiZmluZCB2aXNpYmxlXCIpO1xuICAgIHZhciB2aXNpYmxlID0gW10sIGludmlzaWJsZSA9IFtdO1xuICAgIGZvciAodmFyIHQgaW4gdGhpcy50aWxlcykge1xuICAgICAgICBpZiAodGhpcy50aWxlc1t0XS52aXNpYmxlID09IHRydWUpIHtcbiAgICAgICAgICAgIHZpc2libGUucHVzaCh0KTtcbiAgICAgICAgfVxuICAgICAgICBlbHNlIHtcbiAgICAgICAgICAgIGludmlzaWJsZS5wdXNoKHQpO1xuICAgICAgICB9XG4gICAgfVxuXG4gICAgLy8gY29uc29sZS5sb2coXCJzb3J0IHZpc2libGUgZGlzdGFuY2VcIik7XG4gICAgdmlzaWJsZS5zb3J0KChhLCBiKSA9PiB7XG4gICAgICAgIC8vIHZhciBhZCA9IE1hdGguYWJzKHRoaXMuY2VudGVyX21ldGVycy54IC0gdGhpcy50aWxlc1tiXS5taW4ueCkgKyBNYXRoLmFicyh0aGlzLmNlbnRlcl9tZXRlcnMueSAtIHRoaXMudGlsZXNbYl0ubWluLnkpO1xuICAgICAgICAvLyB2YXIgYmQgPSBNYXRoLmFicyh0aGlzLmNlbnRlcl9tZXRlcnMueCAtIHRoaXMudGlsZXNbYV0ubWluLngpICsgTWF0aC5hYnModGhpcy5jZW50ZXJfbWV0ZXJzLnkgLSB0aGlzLnRpbGVzW2FdLm1pbi55KTtcbiAgICAgICAgdmFyIGFkID0gdGhpcy50aWxlc1thXS5jZW50ZXJfZGlzdDtcbiAgICAgICAgdmFyIGJkID0gdGhpcy50aWxlc1tiXS5jZW50ZXJfZGlzdDtcbiAgICAgICAgcmV0dXJuIChiZCA+IGFkID8gLTEgOiAoYmQgPT0gYWQgPyAwIDogMSkpO1xuICAgIH0pO1xuXG4gICAgLy8gY29uc29sZS5sb2coXCJidWlsZCB2aXNpYmxlXCIpO1xuICAgIGZvciAodmFyIHQgaW4gdmlzaWJsZSkge1xuICAgICAgICB0aGlzLmJ1aWxkVGlsZSh2aXNpYmxlW3RdKTtcbiAgICB9XG5cbiAgICAvLyBjb25zb2xlLmxvZyhcImJ1aWxkIGludmlzaWJsZVwiKTtcbiAgICBmb3IgKHZhciB0IGluIGludmlzaWJsZSkge1xuICAgICAgICAvLyBLZWVwIHRpbGVzIGluIGN1cnJlbnQgem9vbSBidXQgb3V0IG9mIHZpc2libGUgcmFuZ2UsIGJ1dCByZWJ1aWxkIGFzIGxvd2VyIHByaW9yaXR5XG4gICAgICAgIGlmICh0aGlzLmlzVGlsZUluWm9vbSh0aGlzLnRpbGVzW2ludmlzaWJsZVt0XV0pID09IHRydWUpIHtcbiAgICAgICAgICAgIHRoaXMuYnVpbGRUaWxlKGludmlzaWJsZVt0XSk7XG4gICAgICAgIH1cbiAgICAgICAgLy8gRHJvcCB0aWxlcyBvdXRzaWRlIGN1cnJlbnQgem9vbVxuICAgICAgICBlbHNlIHtcbiAgICAgICAgICAgIHRoaXMucmVtb3ZlVGlsZShpbnZpc2libGVbdF0pO1xuICAgICAgICB9XG4gICAgfVxuXG4gICAgdGhpcy51cGRhdGVBY3RpdmVNb2RlcygpO1xuICAgIHRoaXMucmVzZXRUaW1lKCk7XG59O1xuXG5TY2VuZS5wcm90b3R5cGUuYnVpbGRUaWxlID0gZnVuY3Rpb24oa2V5KSB7XG4gICAgdmFyIHRpbGUgPSB0aGlzLnRpbGVzW2tleV07XG5cbiAgICB0aGlzLndvcmtlclBvc3RNZXNzYWdlRm9yVGlsZSh0aWxlLCB7XG4gICAgICAgIHR5cGU6ICdidWlsZFRpbGUnLFxuICAgICAgICB0aWxlOiB7XG4gICAgICAgICAgICBrZXk6IHRpbGUua2V5LFxuICAgICAgICAgICAgY29vcmRzOiB0aWxlLmNvb3JkcywgLy8gdXNlZCBieSBzdHlsZSBoZWxwZXJzXG4gICAgICAgICAgICBtaW46IHRpbGUubWluLCAvLyB1c2VkIGJ5IFRpbGVTb3VyY2UgdG8gc2NhbGUgdGlsZSB0byBsb2NhbCBleHRlbnRzXG4gICAgICAgICAgICBtYXg6IHRpbGUubWF4LCAvLyB1c2VkIGJ5IFRpbGVTb3VyY2UgdG8gc2NhbGUgdGlsZSB0byBsb2NhbCBleHRlbnRzXG4gICAgICAgICAgICBkZWJ1ZzogdGlsZS5kZWJ1Z1xuICAgICAgICB9LFxuICAgICAgICB0aWxlX3NvdXJjZTogdGhpcy50aWxlX3NvdXJjZSxcbiAgICAgICAgbGF5ZXJzOiB0aGlzLmxheWVyc19zZXJpYWxpemVkLFxuICAgICAgICBzdHlsZXM6IHRoaXMuc3R5bGVzX3NlcmlhbGl6ZWRcbiAgICB9KTtcbn07XG5cbi8vIFByb2Nlc3MgZ2VvbWV0cnkgZm9yIHRpbGUgLSBjYWxsZWQgYnkgd2ViIHdvcmtlclxuLy8gUmV0dXJucyBhIHNldCBvZiB0aWxlIGtleXMgdGhhdCBzaG91bGQgYmUgc2VudCB0byB0aGUgbWFpbiB0aHJlYWQgKHNvIHRoYXQgd2UgY2FuIG1pbmltaXplIGRhdGEgZXhjaGFuZ2UgYmV0d2VlbiB3b3JrZXIgYW5kIG1haW4gdGhyZWFkKVxuU2NlbmUuYWRkVGlsZSA9IGZ1bmN0aW9uICh0aWxlLCBsYXllcnMsIHN0eWxlcywgbW9kZXMpIHtcbiAgICB2YXIgbGF5ZXIsIHN0eWxlLCBmZWF0dXJlLCB6LCBtb2RlO1xuICAgIHZhciB2ZXJ0ZXhfZGF0YSA9IHt9O1xuXG4gICAgLy8gSm9pbiBsaW5lIHRlc3QgcGF0dGVyblxuICAgIC8vIGlmIChTY2VuZS5kZWJ1Zykge1xuICAgIC8vICAgICB0aWxlLmxheWVyc1sncm9hZHMnXS5mZWF0dXJlcy5wdXNoKFNjZW5lLmJ1aWxkWmlnemFnTGluZVRlc3RQYXR0ZXJuKCkpO1xuICAgIC8vIH1cblxuICAgIC8vIEJ1aWxkIHJhdyBnZW9tZXRyeSBhcnJheXNcbiAgICAvLyBSZW5kZXIgbGF5ZXJzLCBhbmQgZmVhdHVyZXMgd2l0aGluIGVhY2ggbGF5ZXIsIGluIHJldmVyc2Ugb3JkZXIgLSBha2EgdG9wIHRvIGJvdHRvbVxuICAgIHRpbGUuZGVidWcuZmVhdHVyZXMgPSAwO1xuICAgIGZvciAodmFyIGxheWVyX251bSA9IGxheWVycy5sZW5ndGgtMTsgbGF5ZXJfbnVtID49IDA7IGxheWVyX251bS0tKSB7XG4gICAgICAgIGxheWVyID0gbGF5ZXJzW2xheWVyX251bV07XG5cbiAgICAgICAgLy8gU2tpcCBsYXllcnMgd2l0aCBubyBzdHlsZXMgZGVmaW5lZCwgb3IgbGF5ZXJzIHNldCB0byBub3QgYmUgdmlzaWJsZVxuICAgICAgICBpZiAoc3R5bGVzLmxheWVyc1tsYXllci5uYW1lXSA9PSBudWxsIHx8IHN0eWxlcy5sYXllcnNbbGF5ZXIubmFtZV0udmlzaWJsZSA9PSBmYWxzZSkge1xuICAgICAgICAgICAgY29udGludWU7XG4gICAgICAgIH1cblxuICAgICAgICBpZiAodGlsZS5sYXllcnNbbGF5ZXIubmFtZV0gIT0gbnVsbCkge1xuICAgICAgICAgICAgdmFyIG51bV9mZWF0dXJlcyA9IHRpbGUubGF5ZXJzW2xheWVyLm5hbWVdLmZlYXR1cmVzLmxlbmd0aDtcblxuICAgICAgICAgICAgZm9yICh2YXIgZiA9IG51bV9mZWF0dXJlcy0xOyBmID49IDA7IGYtLSkge1xuICAgICAgICAgICAgICAgIGZlYXR1cmUgPSB0aWxlLmxheWVyc1tsYXllci5uYW1lXS5mZWF0dXJlc1tmXTtcbiAgICAgICAgICAgICAgICBzdHlsZSA9IFN0eWxlLnBhcnNlU3R5bGVGb3JGZWF0dXJlKGZlYXR1cmUsIGxheWVyLm5hbWUsIHN0eWxlcy5sYXllcnNbbGF5ZXIubmFtZV0sIHRpbGUpO1xuXG4gICAgICAgICAgICAgICAgLy8gU2tpcCBmZWF0dXJlP1xuICAgICAgICAgICAgICAgIGlmIChzdHlsZSA9PSBudWxsKSB7XG4gICAgICAgICAgICAgICAgICAgIGNvbnRpbnVlO1xuICAgICAgICAgICAgICAgIH1cblxuICAgICAgICAgICAgICAgIHN0eWxlLmxheWVyX251bSA9IGxheWVyX251bTtcbiAgICAgICAgICAgICAgICBzdHlsZS56ID0gU2NlbmUuY2FsY3VsYXRlWihsYXllciwgdGlsZSkgKyBzdHlsZS56O1xuXG4gICAgICAgICAgICAgICAgdmFyIHBvaW50cyA9IG51bGwsXG4gICAgICAgICAgICAgICAgICAgIGxpbmVzID0gbnVsbCxcbiAgICAgICAgICAgICAgICAgICAgcG9seWdvbnMgPSBudWxsO1xuXG4gICAgICAgICAgICAgICAgaWYgKGZlYXR1cmUuZ2VvbWV0cnkudHlwZSA9PSAnUG9seWdvbicpIHtcbiAgICAgICAgICAgICAgICAgICAgcG9seWdvbnMgPSBbZmVhdHVyZS5nZW9tZXRyeS5jb29yZGluYXRlc107XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgIGVsc2UgaWYgKGZlYXR1cmUuZ2VvbWV0cnkudHlwZSA9PSAnTXVsdGlQb2x5Z29uJykge1xuICAgICAgICAgICAgICAgICAgICBwb2x5Z29ucyA9IGZlYXR1cmUuZ2VvbWV0cnkuY29vcmRpbmF0ZXM7XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgIGVsc2UgaWYgKGZlYXR1cmUuZ2VvbWV0cnkudHlwZSA9PSAnTGluZVN0cmluZycpIHtcbiAgICAgICAgICAgICAgICAgICAgbGluZXMgPSBbZmVhdHVyZS5nZW9tZXRyeS5jb29yZGluYXRlc107XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgIGVsc2UgaWYgKGZlYXR1cmUuZ2VvbWV0cnkudHlwZSA9PSAnTXVsdGlMaW5lU3RyaW5nJykge1xuICAgICAgICAgICAgICAgICAgICBsaW5lcyA9IGZlYXR1cmUuZ2VvbWV0cnkuY29vcmRpbmF0ZXM7XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgIGVsc2UgaWYgKGZlYXR1cmUuZ2VvbWV0cnkudHlwZSA9PSAnUG9pbnQnKSB7XG4gICAgICAgICAgICAgICAgICAgIHBvaW50cyA9IFtmZWF0dXJlLmdlb21ldHJ5LmNvb3JkaW5hdGVzXTtcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgZWxzZSBpZiAoZmVhdHVyZS5nZW9tZXRyeS50eXBlID09ICdNdWx0aVBvaW50Jykge1xuICAgICAgICAgICAgICAgICAgICBwb2ludHMgPSBmZWF0dXJlLmdlb21ldHJ5LmNvb3JkaW5hdGVzO1xuICAgICAgICAgICAgICAgIH1cblxuICAgICAgICAgICAgICAgIC8vIEZpcnN0IGZlYXR1cmUgaW4gdGhpcyByZW5kZXIgbW9kZT9cbiAgICAgICAgICAgICAgICBtb2RlID0gc3R5bGUubW9kZS5uYW1lO1xuICAgICAgICAgICAgICAgIGlmICh2ZXJ0ZXhfZGF0YVttb2RlXSA9PSBudWxsKSB7XG4gICAgICAgICAgICAgICAgICAgIHZlcnRleF9kYXRhW21vZGVdID0gW107XG4gICAgICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICAgICAgaWYgKHBvbHlnb25zICE9IG51bGwpIHtcbiAgICAgICAgICAgICAgICAgICAgbW9kZXNbbW9kZV0uYnVpbGRQb2x5Z29ucyhwb2x5Z29ucywgc3R5bGUsIHZlcnRleF9kYXRhW21vZGVdKTtcbiAgICAgICAgICAgICAgICB9XG5cbiAgICAgICAgICAgICAgICBpZiAobGluZXMgIT0gbnVsbCkge1xuICAgICAgICAgICAgICAgICAgICBtb2Rlc1ttb2RlXS5idWlsZExpbmVzKGxpbmVzLCBzdHlsZSwgdmVydGV4X2RhdGFbbW9kZV0pO1xuICAgICAgICAgICAgICAgIH1cblxuICAgICAgICAgICAgICAgIGlmIChwb2ludHMgIT0gbnVsbCkge1xuICAgICAgICAgICAgICAgICAgICBtb2Rlc1ttb2RlXS5idWlsZFBvaW50cyhwb2ludHMsIHN0eWxlLCB2ZXJ0ZXhfZGF0YVttb2RlXSk7XG4gICAgICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICAgICAgdGlsZS5kZWJ1Zy5mZWF0dXJlcysrO1xuICAgICAgICAgICAgfVxuICAgICAgICB9XG4gICAgfVxuXG4gICAgdGlsZS52ZXJ0ZXhfZGF0YSA9IHt9O1xuICAgIGZvciAodmFyIHMgaW4gdmVydGV4X2RhdGEpIHtcbiAgICAgICAgdGlsZS52ZXJ0ZXhfZGF0YVtzXSA9IG5ldyBGbG9hdDMyQXJyYXkodmVydGV4X2RhdGFbc10pO1xuICAgIH1cblxuICAgIHJldHVybiB7XG4gICAgICAgIHZlcnRleF9kYXRhOiB0cnVlXG4gICAgfTtcbn07XG5cbi8vIENhbGxlZCBvbiBtYWluIHRocmVhZCB3aGVuIGEgd2ViIHdvcmtlciBjb21wbGV0ZXMgcHJvY2Vzc2luZyBmb3IgYSBzaW5nbGUgdGlsZSAoaW5pdGlhbCBsb2FkLCBvciByZWJ1aWxkKVxuU2NlbmUucHJvdG90eXBlLndvcmtlckJ1aWxkVGlsZUNvbXBsZXRlZCA9IGZ1bmN0aW9uIChldmVudCkge1xuICAgIGlmIChldmVudC5kYXRhLnR5cGUgIT0gJ2J1aWxkVGlsZUNvbXBsZXRlZCcpIHtcbiAgICAgICAgcmV0dXJuO1xuICAgIH1cblxuICAgIC8vIFRyYWNrIHNlbGVjdGlvbiBtYXAgc2l6ZSAoZm9yIHN0YXRzL2RlYnVnKSAtIHVwZGF0ZSBwZXIgd29ya2VyIGFuZCBzdW0gYWNyb3NzIHdvcmtlcnNcbiAgICB0aGlzLnNlbGVjdGlvbl9tYXBfd29ya2VyX3NpemVbZXZlbnQuZGF0YS53b3JrZXJfaWRdID0gZXZlbnQuZGF0YS5zZWxlY3Rpb25fbWFwX3NpemU7XG4gICAgdGhpcy5zZWxlY3Rpb25fbWFwX3NpemUgPSAwO1xuICAgIE9iamVjdFxuICAgICAgICAua2V5cyh0aGlzLnNlbGVjdGlvbl9tYXBfd29ya2VyX3NpemUpXG4gICAgICAgIC5mb3JFYWNoKHdvcmtlciA9PiB7XG4gICAgICAgICAgICB0aGlzLnNlbGVjdGlvbl9tYXBfc2l6ZSArPSB0aGlzLnNlbGVjdGlvbl9tYXBfd29ya2VyX3NpemVbd29ya2VyXTtcbiAgICAgICAgfSk7XG4gICAgY29uc29sZS5sb2coXCJzZWxlY3Rpb24gbWFwOiBcIiArIHRoaXMuc2VsZWN0aW9uX21hcF9zaXplICsgXCIgZmVhdHVyZXNcIik7XG5cbiAgICB2YXIgdGlsZSA9IGV2ZW50LmRhdGEudGlsZTtcblxuICAgIC8vIFJlbW92ZWQgdGhpcyB0aWxlIGR1cmluZyBsb2FkP1xuICAgIGlmICh0aGlzLnRpbGVzW3RpbGUua2V5XSA9PSBudWxsKSB7XG4gICAgICAgIGNvbnNvbGUubG9nKFwiZGlzY2FyZGVkIHRpbGUgXCIgKyB0aWxlLmtleSArIFwiIGluIFNjZW5lLnRpbGVXb3JrZXJDb21wbGV0ZWQgYmVjYXVzZSBwcmV2aW91c2x5IHJlbW92ZWRcIik7XG4gICAgICAgIHJldHVybjtcbiAgICB9XG5cbiAgICAvLyBVcGRhdGUgdGlsZSB3aXRoIHByb3BlcnRpZXMgZnJvbSB3b3JrZXJcbiAgICB0aWxlID0gdGhpcy5tZXJnZVRpbGUodGlsZS5rZXksIHRpbGUpO1xuXG4gICAgdGhpcy5idWlsZEdMR2VvbWV0cnkodGlsZSk7XG5cbiAgICB0aGlzLmRpcnR5ID0gdHJ1ZTtcbiAgICB0aGlzLnRyYWNrVGlsZVNldExvYWRFbmQoKTtcbiAgICB0aGlzLnByaW50RGVidWdGb3JUaWxlKHRpbGUpO1xufTtcblxuLy8gQ2FsbGVkIG9uIG1haW4gdGhyZWFkIHdoZW4gYSB3ZWIgd29ya2VyIGNvbXBsZXRlcyBwcm9jZXNzaW5nIGZvciBhIHNpbmdsZSB0aWxlXG5TY2VuZS5wcm90b3R5cGUuYnVpbGRHTEdlb21ldHJ5ID0gZnVuY3Rpb24gKHRpbGUpIHtcbiAgICB2YXIgdmVydGV4X2RhdGEgPSB0aWxlLnZlcnRleF9kYXRhO1xuXG4gICAgLy8gQ2xlYW51cCBleGlzdGluZyBHTCBnZW9tZXRyeSBvYmplY3RzXG4gICAgdGhpcy5mcmVlVGlsZVJlc291cmNlcyh0aWxlKTtcbiAgICB0aWxlLmdsX2dlb21ldHJ5ID0ge307XG5cbiAgICAvLyBDcmVhdGUgR0wgZ2VvbWV0cnkgb2JqZWN0c1xuICAgIGZvciAodmFyIHMgaW4gdmVydGV4X2RhdGEpIHtcbiAgICAgICAgdGlsZS5nbF9nZW9tZXRyeVtzXSA9IHRoaXMubW9kZXNbc10ubWFrZUdMR2VvbWV0cnkodmVydGV4X2RhdGFbc10pO1xuICAgIH1cblxuICAgIHRpbGUuZGVidWcuZ2VvbWV0cmllcyA9IDA7XG4gICAgdGlsZS5kZWJ1Zy5idWZmZXJfc2l6ZSA9IDA7XG4gICAgZm9yICh2YXIgcCBpbiB0aWxlLmdsX2dlb21ldHJ5KSB7XG4gICAgICAgIHRpbGUuZGVidWcuZ2VvbWV0cmllcyArPSB0aWxlLmdsX2dlb21ldHJ5W3BdLmdlb21ldHJ5X2NvdW50O1xuICAgICAgICB0aWxlLmRlYnVnLmJ1ZmZlcl9zaXplICs9IHRpbGUuZ2xfZ2VvbWV0cnlbcF0udmVydGV4X2RhdGEuYnl0ZUxlbmd0aDtcbiAgICB9XG4gICAgdGlsZS5kZWJ1Zy5nZW9tX3JhdGlvID0gKHRpbGUuZGVidWcuZ2VvbWV0cmllcyAvIHRpbGUuZGVidWcuZmVhdHVyZXMpLnRvRml4ZWQoMSk7XG5cbiAgICBkZWxldGUgdGlsZS52ZXJ0ZXhfZGF0YTsgLy8gVE9ETzogbWlnaHQgd2FudCB0byBwcmVzZXJ2ZSB0aGlzIGZvciByZWJ1aWxkaW5nIGdlb21ldHJpZXMgd2hlbiBzdHlsZXMvZXRjLiBjaGFuZ2U/XG59O1xuXG5TY2VuZS5wcm90b3R5cGUucmVtb3ZlVGlsZSA9IGZ1bmN0aW9uIChrZXkpXG57XG4gICAgaWYgKCF0aGlzLmluaXRpYWxpemVkKSB7XG4gICAgICAgIHJldHVybjtcbiAgICB9XG5cbiAgICBjb25zb2xlLmxvZyhcInRpbGUgdW5sb2FkIGZvciBcIiArIGtleSk7XG5cbiAgICBpZiAodGhpcy56b29taW5nID09IHRydWUpIHtcbiAgICAgICAgcmV0dXJuOyAvLyBzaG9ydCBjaXJjdWl0IHRpbGUgcmVtb3ZhbCwgd2lsbCBzd2VlcCBvdXQgdGlsZXMgYnkgem9vbSBsZXZlbCB3aGVuIHpvb20gZW5kc1xuICAgIH1cblxuICAgIHZhciB0aWxlID0gdGhpcy50aWxlc1trZXldO1xuXG4gICAgaWYgKHRpbGUgIT0gbnVsbCkge1xuICAgICAgICB0aGlzLmZyZWVUaWxlUmVzb3VyY2VzKHRpbGUpO1xuXG4gICAgICAgIC8vIFdlYiB3b3JrZXIgd2lsbCBjYW5jZWwgWEhSIHJlcXVlc3RzXG4gICAgICAgIHRoaXMud29ya2VyUG9zdE1lc3NhZ2VGb3JUaWxlKHRpbGUsIHtcbiAgICAgICAgICAgIHR5cGU6ICdyZW1vdmVUaWxlJyxcbiAgICAgICAgICAgIGtleTogdGlsZS5rZXlcbiAgICAgICAgfSk7XG4gICAgfVxuXG4gICAgZGVsZXRlIHRoaXMudGlsZXNba2V5XTtcbiAgICB0aGlzLmRpcnR5ID0gdHJ1ZTtcbn07XG5cbi8vIEZyZWUgYW55IEdMIC8gb3duZWQgcmVzb3VyY2VzXG5TY2VuZS5wcm90b3R5cGUuZnJlZVRpbGVSZXNvdXJjZXMgPSBmdW5jdGlvbiAodGlsZSlcbntcbiAgICBpZiAodGlsZSAhPSBudWxsICYmIHRpbGUuZ2xfZ2VvbWV0cnkgIT0gbnVsbCkge1xuICAgICAgICBmb3IgKHZhciBwIGluIHRpbGUuZ2xfZ2VvbWV0cnkpIHtcbiAgICAgICAgICAgIHRpbGUuZ2xfZ2VvbWV0cnlbcF0uZGVzdHJveSgpO1xuICAgICAgICB9XG4gICAgICAgIHRpbGUuZ2xfZ2VvbWV0cnkgPSBudWxsO1xuICAgIH1cbn07XG5cbi8vIEF0dGFjaGVzIHRyYWNraW5nIGFuZCBkZWJ1ZyBpbnRvIHRvIHRoZSBwcm92aWRlZCB0aWxlIERPTSBlbGVtZW50XG5TY2VuZS5wcm90b3R5cGUudXBkYXRlVGlsZUVsZW1lbnQgPSBmdW5jdGlvbiAodGlsZSwgZGl2KSB7XG4gICAgLy8gRGVidWcgaW5mb1xuICAgIGRpdi5zZXRBdHRyaWJ1dGUoJ2RhdGEtdGlsZS1rZXknLCB0aWxlLmtleSk7XG4gICAgZGl2LnN0eWxlLndpZHRoID0gJzI1NnB4JztcbiAgICBkaXYuc3R5bGUuaGVpZ2h0ID0gJzI1NnB4JztcblxuICAgIGlmICh0aGlzLmRlYnVnKSB7XG4gICAgICAgIHZhciBkZWJ1Z19vdmVybGF5ID0gZG9jdW1lbnQuY3JlYXRlRWxlbWVudCgnZGl2Jyk7XG4gICAgICAgIGRlYnVnX292ZXJsYXkudGV4dENvbnRlbnQgPSB0aWxlLmtleTtcbiAgICAgICAgZGVidWdfb3ZlcmxheS5zdHlsZS5wb3NpdGlvbiA9ICdhYnNvbHV0ZSc7XG4gICAgICAgIGRlYnVnX292ZXJsYXkuc3R5bGUubGVmdCA9IDA7XG4gICAgICAgIGRlYnVnX292ZXJsYXkuc3R5bGUudG9wID0gMDtcbiAgICAgICAgZGVidWdfb3ZlcmxheS5zdHlsZS5jb2xvciA9ICd3aGl0ZSc7XG4gICAgICAgIGRlYnVnX292ZXJsYXkuc3R5bGUuZm9udFNpemUgPSAnMTZweCc7XG4gICAgICAgIC8vIGRlYnVnX292ZXJsYXkuc3R5bGUudGV4dE91dGxpbmUgPSAnMXB4ICMwMDAwMDAnO1xuICAgICAgICBkaXYuYXBwZW5kQ2hpbGQoZGVidWdfb3ZlcmxheSk7XG5cbiAgICAgICAgZGl2LnN0eWxlLmJvcmRlclN0eWxlID0gJ3NvbGlkJztcbiAgICAgICAgZGl2LnN0eWxlLmJvcmRlckNvbG9yID0gJ3doaXRlJztcbiAgICAgICAgZGl2LnN0eWxlLmJvcmRlcldpZHRoID0gJzFweCc7XG4gICAgfVxufTtcblxuLy8gTWVyZ2UgcHJvcGVydGllcyBmcm9tIGEgcHJvdmlkZWQgdGlsZSBvYmplY3QgaW50byB0aGUgbWFpbiB0aWxlIHN0b3JlLiBTaGFsbG93IG1lcmdlIChqdXN0IGNvcGllcyB0b3AtbGV2ZWwgcHJvcGVydGllcykhXG4vLyBVc2VkIGZvciBzZWxlY3RpdmVseSB1cGRhdGluZyBwcm9wZXJ0aWVzIG9mIHRpbGVzIHBhc3NlZCBiZXR3ZWVuIG1haW4gdGhyZWFkIGFuZCB3b3JrZXJcbi8vIChzbyB3ZSBkb24ndCBoYXZlIHRvIHBhc3MgdGhlIHdob2xlIHRpbGUsIGluY2x1ZGluZyBzb21lIHByb3BlcnRpZXMgd2hpY2ggY2Fubm90IGJlIGNsb25lZCBmb3IgYSB3b3JrZXIpLlxuU2NlbmUucHJvdG90eXBlLm1lcmdlVGlsZSA9IGZ1bmN0aW9uIChrZXksIHNvdXJjZV90aWxlKSB7XG4gICAgdmFyIHRpbGUgPSB0aGlzLnRpbGVzW2tleV07XG5cbiAgICBpZiAodGlsZSA9PSBudWxsKSB7XG4gICAgICAgIHRoaXMudGlsZXNba2V5XSA9IHNvdXJjZV90aWxlO1xuICAgICAgICByZXR1cm4gdGhpcy50aWxlc1trZXldO1xuICAgIH1cblxuICAgIGZvciAodmFyIHAgaW4gc291cmNlX3RpbGUpIHtcbiAgICAgICAgLy8gY29uc29sZS5sb2coXCJtZXJnaW5nIFwiICsgcCArIFwiOiBcIiArIHNvdXJjZV90aWxlW3BdKTtcbiAgICAgICAgdGlsZVtwXSA9IHNvdXJjZV90aWxlW3BdO1xuICAgIH1cblxuICAgIHJldHVybiB0aWxlO1xufTtcblxuLy8gTG9hZCAob3IgcmVsb2FkKSB0aGUgc2NlbmUgY29uZmlnXG5TY2VuZS5wcm90b3R5cGUubG9hZFNjZW5lID0gZnVuY3Rpb24gKGNhbGxiYWNrKSB7XG4gICAgdmFyIHF1ZXVlID0gUXVldWUoKTtcblxuICAgIC8vIElmIHRoaXMgaXMgdGhlIGZpcnN0IHRpbWUgd2UncmUgbG9hZGluZyB0aGUgc2NlbmUsIGNvcHkgYW55IFVSTHNcbiAgICBpZiAoIXRoaXMubGF5ZXJfc291cmNlICYmIHR5cGVvZih0aGlzLmxheWVycykgPT0gJ3N0cmluZycpIHtcbiAgICAgICAgdGhpcy5sYXllcl9zb3VyY2UgPSBVdGlscy51cmxGb3JQYXRoKHRoaXMubGF5ZXJzKTtcbiAgICB9XG5cbiAgICBpZiAoIXRoaXMuc3R5bGVfc291cmNlICYmIHR5cGVvZih0aGlzLnN0eWxlcykgPT0gJ3N0cmluZycpIHtcbiAgICAgICAgdGhpcy5zdHlsZV9zb3VyY2UgPSBVdGlscy51cmxGb3JQYXRoKHRoaXMuc3R5bGVzKTtcbiAgICB9XG5cbiAgICAvLyBMYXllciBieSBVUkxcbiAgICBpZiAodGhpcy5sYXllcl9zb3VyY2UpIHtcbiAgICAgICAgcXVldWUuZGVmZXIoY29tcGxldGUgPT4ge1xuICAgICAgICAgICAgU2NlbmUubG9hZExheWVycyhcbiAgICAgICAgICAgICAgICB0aGlzLmxheWVyX3NvdXJjZSxcbiAgICAgICAgICAgICAgICBsYXllcnMgPT4ge1xuICAgICAgICAgICAgICAgICAgICB0aGlzLmxheWVycyA9IGxheWVycztcbiAgICAgICAgICAgICAgICAgICAgdGhpcy5sYXllcnNfc2VyaWFsaXplZCA9IFV0aWxzLnNlcmlhbGl6ZVdpdGhGdW5jdGlvbnModGhpcy5sYXllcnMpO1xuICAgICAgICAgICAgICAgICAgICBjb21wbGV0ZSgpO1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICk7XG4gICAgICAgIH0pO1xuICAgIH1cblxuICAgIC8vIFN0eWxlIGJ5IFVSTFxuICAgIGlmICh0aGlzLnN0eWxlX3NvdXJjZSkge1xuICAgICAgICBxdWV1ZS5kZWZlcihjb21wbGV0ZSA9PiB7XG4gICAgICAgICAgICBTY2VuZS5sb2FkU3R5bGVzKFxuICAgICAgICAgICAgICAgIHRoaXMuc3R5bGVfc291cmNlLFxuICAgICAgICAgICAgICAgIHN0eWxlcyA9PiB7XG4gICAgICAgICAgICAgICAgICAgIHRoaXMuc3R5bGVzID0gc3R5bGVzO1xuICAgICAgICAgICAgICAgICAgICB0aGlzLnN0eWxlc19zZXJpYWxpemVkID0gVXRpbHMuc2VyaWFsaXplV2l0aEZ1bmN0aW9ucyh0aGlzLnN0eWxlcyk7XG4gICAgICAgICAgICAgICAgICAgIGNvbXBsZXRlKCk7XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgKTtcbiAgICAgICAgfSk7XG4gICAgfVxuICAgIC8vIFN0eWxlIG9iamVjdFxuICAgIGVsc2Uge1xuICAgICAgICB0aGlzLnN0eWxlcyA9IFNjZW5lLnBvc3RQcm9jZXNzU3R5bGVzKHRoaXMuc3R5bGVzKTtcbiAgICB9XG5cbiAgICAvLyBFdmVyeXRoaW5nIGlzIGxvYWRlZFxuICAgIHF1ZXVlLmF3YWl0KGZ1bmN0aW9uKCkge1xuICAgICAgICBpZiAodHlwZW9mIGNhbGxiYWNrID09ICdmdW5jdGlvbicpIHtcbiAgICAgICAgICAgIGNhbGxiYWNrKCk7XG4gICAgICAgIH1cbiAgICB9KTtcbn07XG5cbi8vIFJlbG9hZCBzY2VuZSBjb25maWcgYW5kIHJlYnVpbGQgdGlsZXNcblNjZW5lLnByb3RvdHlwZS5yZWxvYWRTY2VuZSA9IGZ1bmN0aW9uICgpIHtcbiAgICBpZiAoIXRoaXMuaW5pdGlhbGl6ZWQpIHtcbiAgICAgICAgcmV0dXJuO1xuICAgIH1cblxuICAgIHRoaXMubG9hZFNjZW5lKCgpID0+IHtcbiAgICAgICAgdGhpcy5yZWJ1aWxkVGlsZXMoKTtcbiAgICB9KTtcbn07XG5cbi8vIENhbGxlZCAoY3VycmVudGx5IG1hbnVhbGx5KSBhZnRlciBtb2RlcyBhcmUgdXBkYXRlZCBpbiBzdHlsZXNoZWV0XG5TY2VuZS5wcm90b3R5cGUucmVmcmVzaE1vZGVzID0gZnVuY3Rpb24gKCkge1xuICAgIGlmICghdGhpcy5pbml0aWFsaXplZCkge1xuICAgICAgICByZXR1cm47XG4gICAgfVxuXG4gICAgdGhpcy5tb2RlcyA9IFNjZW5lLnJlZnJlc2hNb2Rlcyh0aGlzLm1vZGVzLCB0aGlzLnN0eWxlcyk7XG59O1xuXG5TY2VuZS5wcm90b3R5cGUudXBkYXRlQWN0aXZlTW9kZXMgPSBmdW5jdGlvbiAoKSB7XG4gICAgLy8gTWFrZSBhIHNldCBvZiBjdXJyZW50bHkgYWN0aXZlIG1vZGVzICh1c2VkIGluIGEgbGF5ZXIpXG4gICAgdGhpcy5hY3RpdmVfbW9kZXMgPSB7fTtcbiAgICB2YXIgYW5pbWF0ZWQgPSBmYWxzZTsgLy8gaXMgYW55IGFjdGl2ZSBtb2RlIGFuaW1hdGVkP1xuICAgIGZvciAodmFyIGwgaW4gdGhpcy5zdHlsZXMubGF5ZXJzKSB7XG4gICAgICAgIHZhciBtb2RlID0gdGhpcy5zdHlsZXMubGF5ZXJzW2xdLm1vZGUubmFtZTtcbiAgICAgICAgaWYgKHRoaXMuc3R5bGVzLmxheWVyc1tsXS52aXNpYmxlICE9PSBmYWxzZSkge1xuICAgICAgICAgICAgdGhpcy5hY3RpdmVfbW9kZXNbbW9kZV0gPSB0cnVlO1xuXG4gICAgICAgICAgICAvLyBDaGVjayBpZiB0aGlzIG1vZGUgaXMgYW5pbWF0ZWRcbiAgICAgICAgICAgIGlmIChhbmltYXRlZCA9PSBmYWxzZSAmJiB0aGlzLm1vZGVzW21vZGVdLmFuaW1hdGVkID09IHRydWUpIHtcbiAgICAgICAgICAgICAgICBhbmltYXRlZCA9IHRydWU7XG4gICAgICAgICAgICB9XG4gICAgICAgIH1cbiAgICB9XG4gICAgdGhpcy5hbmltYXRlZCA9IGFuaW1hdGVkO1xufTtcblxuLy8gUmVzZXQgaW50ZXJuYWwgY2xvY2ssIG1vc3RseSB1c2VmdWwgZm9yIGNvbnNpc3RlbnQgZXhwZXJpZW5jZSB3aGVuIGNoYW5naW5nIG1vZGVzL2RlYnVnZ2luZ1xuU2NlbmUucHJvdG90eXBlLnJlc2V0VGltZSA9IGZ1bmN0aW9uICgpIHtcbiAgICB0aGlzLnN0YXJ0X3RpbWUgPSArbmV3IERhdGUoKTtcbn07XG5cbi8vIFVzZXIgaW5wdXRcbi8vIFRPRE86IHJlc3RvcmUgZnJhY3Rpb25hbCB6b29tIHN1cHBvcnQgb25jZSBsZWFmbGV0IGFuaW1hdGlvbiByZWZhY3RvciBwdWxsIHJlcXVlc3QgaXMgbWVyZ2VkXG5cblNjZW5lLnByb3RvdHlwZS5pbml0SW5wdXRIYW5kbGVycyA9IGZ1bmN0aW9uICgpIHtcbiAgICAvLyB0aGlzLmtleSA9IG51bGw7XG5cbiAgICAvLyBkb2N1bWVudC5hZGRFdmVudExpc3RlbmVyKCdrZXlkb3duJywgZnVuY3Rpb24gKGV2ZW50KSB7XG4gICAgLy8gICAgIGlmIChldmVudC5rZXlDb2RlID09IDM3KSB7XG4gICAgLy8gICAgICAgICB0aGlzLmtleSA9ICdsZWZ0JztcbiAgICAvLyAgICAgfVxuICAgIC8vICAgICBlbHNlIGlmIChldmVudC5rZXlDb2RlID09IDM5KSB7XG4gICAgLy8gICAgICAgICB0aGlzLmtleSA9ICdyaWdodCc7XG4gICAgLy8gICAgIH1cbiAgICAvLyAgICAgZWxzZSBpZiAoZXZlbnQua2V5Q29kZSA9PSAzOCkge1xuICAgIC8vICAgICAgICAgdGhpcy5rZXkgPSAndXAnO1xuICAgIC8vICAgICB9XG4gICAgLy8gICAgIGVsc2UgaWYgKGV2ZW50LmtleUNvZGUgPT0gNDApIHtcbiAgICAvLyAgICAgICAgIHRoaXMua2V5ID0gJ2Rvd24nO1xuICAgIC8vICAgICB9XG4gICAgLy8gICAgIGVsc2UgaWYgKGV2ZW50LmtleUNvZGUgPT0gODMpIHsgLy8gc1xuICAgIC8vICAgICAgICAgY29uc29sZS5sb2coXCJyZWxvYWRpbmcgc2hhZGVyc1wiKTtcbiAgICAvLyAgICAgICAgIGZvciAodmFyIG1vZGUgaW4gdGhpcy5tb2Rlcykge1xuICAgIC8vICAgICAgICAgICAgIHRoaXMubW9kZXNbbW9kZV0uZ2xfcHJvZ3JhbS5jb21waWxlKCk7XG4gICAgLy8gICAgICAgICB9XG4gICAgLy8gICAgICAgICB0aGlzLmRpcnR5ID0gdHJ1ZTtcbiAgICAvLyAgICAgfVxuICAgIC8vIH0uYmluZCh0aGlzKSk7XG5cbiAgICAvLyBkb2N1bWVudC5hZGRFdmVudExpc3RlbmVyKCdrZXl1cCcsIGZ1bmN0aW9uIChldmVudCkge1xuICAgIC8vICAgICB0aGlzLmtleSA9IG51bGw7XG4gICAgLy8gfS5iaW5kKHRoaXMpKTtcbn07XG5cblNjZW5lLnByb3RvdHlwZS5pbnB1dCA9IGZ1bmN0aW9uICgpIHtcbiAgICAvLyAvLyBGcmFjdGlvbmFsIHpvb20gc2NhbGluZ1xuICAgIC8vIGlmICh0aGlzLmtleSA9PSAndXAnKSB7XG4gICAgLy8gICAgIHRoaXMuc2V0Wm9vbSh0aGlzLnpvb20gKyB0aGlzLnpvb21fc3RlcCk7XG4gICAgLy8gfVxuICAgIC8vIGVsc2UgaWYgKHRoaXMua2V5ID09ICdkb3duJykge1xuICAgIC8vICAgICB0aGlzLnNldFpvb20odGhpcy56b29tIC0gdGhpcy56b29tX3N0ZXApO1xuICAgIC8vIH1cbn07XG5cblxuLy8gU3RhdHMvZGVidWcvcHJvZmlsaW5nIG1ldGhvZHNcblxuLy8gUHJvZmlsaW5nIG1ldGhvZHMgdXNlZCB0byB0cmFjayB3aGVuIHNldHMgb2YgdGlsZXMgc3RhcnQvc3RvcCBsb2FkaW5nIHRvZ2V0aGVyXG4vLyBlLmcuIGluaXRpYWwgcGFnZSBsb2FkIGlzIG9uZSBzZXQgb2YgdGlsZXMsIG5ldyBzZXRzIG9mIHRpbGUgbG9hZHMgYXJlIHRoZW4gaW5pdGlhdGVkIGJ5IGEgbWFwIHBhbiBvciB6b29tXG5TY2VuZS5wcm90b3R5cGUudHJhY2tUaWxlU2V0TG9hZFN0YXJ0ID0gZnVuY3Rpb24gKCkge1xuICAgIC8vIFN0YXJ0IHRyYWNraW5nIG5ldyB0aWxlIHNldCBpZiBubyBvdGhlciB0aWxlcyBhbHJlYWR5IGxvYWRpbmdcbiAgICBpZiAodGhpcy50aWxlX3NldF9sb2FkaW5nID09IG51bGwpIHtcbiAgICAgICAgdGhpcy50aWxlX3NldF9sb2FkaW5nID0gK25ldyBEYXRlKCk7XG4gICAgICAgIGNvbnNvbGUubG9nKFwidGlsZSBzZXQgbG9hZCBTVEFSVFwiKTtcbiAgICB9XG59O1xuXG5TY2VuZS5wcm90b3R5cGUudHJhY2tUaWxlU2V0TG9hZEVuZCA9IGZ1bmN0aW9uICgpIHtcbiAgICAvLyBObyBtb3JlIHRpbGVzIGFjdGl2ZWx5IGxvYWRpbmc/XG4gICAgaWYgKHRoaXMudGlsZV9zZXRfbG9hZGluZyAhPSBudWxsKSB7XG4gICAgICAgIHZhciBlbmRfdGlsZV9zZXQgPSB0cnVlO1xuICAgICAgICBmb3IgKHZhciB0IGluIHRoaXMudGlsZXMpIHtcbiAgICAgICAgICAgIGlmICh0aGlzLnRpbGVzW3RdLmxvYWRpbmcgPT0gdHJ1ZSkge1xuICAgICAgICAgICAgICAgIGVuZF90aWxlX3NldCA9IGZhbHNlO1xuICAgICAgICAgICAgICAgIGJyZWFrO1xuICAgICAgICAgICAgfVxuICAgICAgICB9XG5cbiAgICAgICAgaWYgKGVuZF90aWxlX3NldCA9PSB0cnVlKSB7XG4gICAgICAgICAgICB0aGlzLmxhc3RfdGlsZV9zZXRfbG9hZCA9ICgrbmV3IERhdGUoKSkgLSB0aGlzLnRpbGVfc2V0X2xvYWRpbmc7XG4gICAgICAgICAgICB0aGlzLnRpbGVfc2V0X2xvYWRpbmcgPSBudWxsO1xuICAgICAgICAgICAgY29uc29sZS5sb2coXCJ0aWxlIHNldCBsb2FkIEZJTklTSEVEIGluOiBcIiArIHRoaXMubGFzdF90aWxlX3NldF9sb2FkKTtcbiAgICAgICAgfVxuICAgIH1cbn07XG5cblNjZW5lLnByb3RvdHlwZS5wcmludERlYnVnRm9yVGlsZSA9IGZ1bmN0aW9uICh0aWxlKSB7XG4gICAgY29uc29sZS5sb2coXG4gICAgICAgIFwiZGVidWcgZm9yIFwiICsgdGlsZS5rZXkgKyAnOiBbICcgK1xuICAgICAgICBPYmplY3Qua2V5cyh0aWxlLmRlYnVnKS5tYXAoZnVuY3Rpb24gKHQpIHsgcmV0dXJuIHQgKyAnOiAnICsgdGlsZS5kZWJ1Z1t0XTsgfSkuam9pbignLCAnKSArICcgXSdcbiAgICApO1xufTtcblxuLy8gUmVjb21waWxlIGFsbCBzaGFkZXJzXG5TY2VuZS5wcm90b3R5cGUuY29tcGlsZVNoYWRlcnMgPSBmdW5jdGlvbiAoKSB7XG4gICAgZm9yICh2YXIgbSBpbiB0aGlzLm1vZGVzKSB7XG4gICAgICAgIHRoaXMubW9kZXNbbV0uZ2xfcHJvZ3JhbS5jb21waWxlKCk7XG4gICAgfVxufTtcblxuLy8gU3VtIG9mIGEgZGVidWcgcHJvcGVydHkgYWNyb3NzIHRpbGVzXG5TY2VuZS5wcm90b3R5cGUuZ2V0RGVidWdTdW0gPSBmdW5jdGlvbiAocHJvcCwgZmlsdGVyKSB7XG4gICAgdmFyIHN1bSA9IDA7XG4gICAgZm9yICh2YXIgdCBpbiB0aGlzLnRpbGVzKSB7XG4gICAgICAgIGlmICh0aGlzLnRpbGVzW3RdLmRlYnVnW3Byb3BdICE9IG51bGwgJiYgKHR5cGVvZiBmaWx0ZXIgIT0gJ2Z1bmN0aW9uJyB8fCBmaWx0ZXIodGhpcy50aWxlc1t0XSkgPT0gdHJ1ZSkpIHtcbiAgICAgICAgICAgIHN1bSArPSB0aGlzLnRpbGVzW3RdLmRlYnVnW3Byb3BdO1xuICAgICAgICB9XG4gICAgfVxuICAgIHJldHVybiBzdW07XG59O1xuXG4vLyBBdmVyYWdlIG9mIGEgZGVidWcgcHJvcGVydHkgYWNyb3NzIHRpbGVzXG5TY2VuZS5wcm90b3R5cGUuZ2V0RGVidWdBdmVyYWdlID0gZnVuY3Rpb24gKHByb3AsIGZpbHRlcikge1xuICAgIHJldHVybiB0aGlzLmdldERlYnVnU3VtKHByb3AsIGZpbHRlcikgLyBPYmplY3Qua2V5cyh0aGlzLnRpbGVzKS5sZW5ndGg7XG59O1xuXG4vLyBMb2cgbWVzc2FnZXMgcGFzcyB0aHJvdWdoIGZyb20gd2ViIHdvcmtlcnNcblNjZW5lLnByb3RvdHlwZS53b3JrZXJMb2dNZXNzYWdlID0gZnVuY3Rpb24gKGV2ZW50KSB7XG4gICAgaWYgKGV2ZW50LmRhdGEudHlwZSAhPSAnbG9nJykge1xuICAgICAgICByZXR1cm47XG4gICAgfVxuXG4gICAgY29uc29sZS5sb2coXCJ3b3JrZXIgXCIgKyBldmVudC5kYXRhLndvcmtlcl9pZCArIFwiOiBcIiArIGV2ZW50LmRhdGEubXNnKTtcbn07XG5cblxuLyoqKiBDbGFzcyBtZXRob2RzIChzdGF0ZWxlc3MpICoqKi9cblxuU2NlbmUubG9hZExheWVycyA9IGZ1bmN0aW9uICh1cmwsIGNhbGxiYWNrKSB7XG4gICAgdmFyIGxheWVycztcbiAgICB2YXIgcmVxID0gbmV3IFhNTEh0dHBSZXF1ZXN0KCk7XG4gICAgcmVxLm9ubG9hZCA9IGZ1bmN0aW9uICgpIHtcbiAgICAgICAgZXZhbCgnbGF5ZXJzID0gJyArIHJlcS5yZXNwb25zZSk7IC8vIFRPRE86IHNlY3VyaXR5IVxuXG4gICAgICAgIGlmICh0eXBlb2YgY2FsbGJhY2sgPT0gJ2Z1bmN0aW9uJykge1xuICAgICAgICAgICAgY2FsbGJhY2sobGF5ZXJzKTtcbiAgICAgICAgfVxuICAgIH07XG4gICAgcmVxLm9wZW4oJ0dFVCcsIHVybCArICc/JyArICgrbmV3IERhdGUoKSksIHRydWUgLyogYXN5bmMgZmxhZyAqLyk7XG4gICAgcmVxLnJlc3BvbnNlVHlwZSA9ICd0ZXh0JztcbiAgICByZXEuc2VuZCgpO1xufTtcblxuU2NlbmUubG9hZFN0eWxlcyA9IGZ1bmN0aW9uICh1cmwsIGNhbGxiYWNrKSB7XG4gICAgdmFyIHN0eWxlcztcbiAgICB2YXIgcmVxID0gbmV3IFhNTEh0dHBSZXF1ZXN0KCk7XG5cbiAgICByZXEub25sb2FkID0gZnVuY3Rpb24gKCkge1xuICAgICAgICBzdHlsZXMgPSByZXEucmVzcG9uc2U7XG5cbiAgICAgICAgLy8gVHJ5IEpTT04gZmlyc3QsIHRoZW4gWUFNTCAoaWYgYXZhaWxhYmxlKVxuICAgICAgICB0cnkge1xuICAgICAgICAgICAgZXZhbCgnc3R5bGVzID0gJyArIHJlcS5yZXNwb25zZSk7XG4gICAgICAgIH1cbiAgICAgICAgY2F0Y2ggKGUpIHtcbiAgICAgICAgICAgIHRyeSB7XG4gICAgICAgICAgICAgICAgc3R5bGVzID0geWFtbC5zYWZlTG9hZChyZXEucmVzcG9uc2UpO1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgY2F0Y2ggKGUpIHtcbiAgICAgICAgICAgICAgICBjb25zb2xlLmxvZyhcImZhaWxlZCB0byBwYXJzZSBzdHlsZXMhXCIpO1xuICAgICAgICAgICAgICAgIGNvbnNvbGUubG9nKHN0eWxlcyk7XG4gICAgICAgICAgICAgICAgc3R5bGVzID0gbnVsbDtcbiAgICAgICAgICAgIH1cbiAgICAgICAgfVxuXG4gICAgICAgIC8vIEZpbmQgZ2VuZXJpYyBmdW5jdGlvbnMgJiBzdHlsZSBtYWNyb3NcbiAgICAgICAgVXRpbHMuc3RyaW5nc1RvRnVuY3Rpb25zKHN0eWxlcyk7XG4gICAgICAgIFN0eWxlLmV4cGFuZE1hY3JvcyhzdHlsZXMpO1xuICAgICAgICBTY2VuZS5wb3N0UHJvY2Vzc1N0eWxlcyhzdHlsZXMpO1xuXG4gICAgICAgIGlmICh0eXBlb2YgY2FsbGJhY2sgPT0gJ2Z1bmN0aW9uJykge1xuICAgICAgICAgICAgY2FsbGJhY2soc3R5bGVzKTtcbiAgICAgICAgfVxuICAgIH1cblxuICAgIHJlcS5vcGVuKCdHRVQnLCB1cmwgKyAnPycgKyAoK25ldyBEYXRlKCkpLCB0cnVlIC8qIGFzeW5jIGZsYWcgKi8pO1xuICAgIHJlcS5yZXNwb25zZVR5cGUgPSAndGV4dCc7XG4gICAgcmVxLnNlbmQoKTtcbn07XG5cbi8vIE5vcm1hbGl6ZSBzb21lIHN0eWxlIHNldHRpbmdzIHRoYXQgbWF5IG5vdCBoYXZlIGJlZW4gZXhwbGljaXRseSBzcGVjaWZpZWQgaW4gdGhlIHN0eWxlc2hlZXRcblNjZW5lLnBvc3RQcm9jZXNzU3R5bGVzID0gZnVuY3Rpb24gKHN0eWxlcykge1xuICAgIC8vIFBvc3QtcHJvY2VzcyBzdHlsZXNcbiAgICBmb3IgKHZhciBtIGluIHN0eWxlcy5sYXllcnMpIHtcbiAgICAgICAgaWYgKHN0eWxlcy5sYXllcnNbbV0udmlzaWJsZSAhPT0gZmFsc2UpIHtcbiAgICAgICAgICAgIHN0eWxlcy5sYXllcnNbbV0udmlzaWJsZSA9IHRydWU7XG4gICAgICAgIH1cblxuICAgICAgICBpZiAoKHN0eWxlcy5sYXllcnNbbV0ubW9kZSAmJiBzdHlsZXMubGF5ZXJzW21dLm1vZGUubmFtZSkgPT0gbnVsbCkge1xuICAgICAgICAgICAgc3R5bGVzLmxheWVyc1ttXS5tb2RlID0ge307XG4gICAgICAgICAgICBmb3IgKHZhciBwIGluIFN0eWxlLmRlZmF1bHRzLm1vZGUpIHtcbiAgICAgICAgICAgICAgICBzdHlsZXMubGF5ZXJzW21dLm1vZGVbcF0gPSBTdHlsZS5kZWZhdWx0cy5tb2RlW3BdO1xuICAgICAgICAgICAgfVxuICAgICAgICB9XG4gICAgfVxuXG4gICAgcmV0dXJuIHN0eWxlcztcbn07XG5cbi8vIFByb2Nlc3NlcyB0aGUgdGlsZSByZXNwb25zZSB0byBjcmVhdGUgbGF5ZXJzIGFzIGRlZmluZWQgYnkgdGhlIHNjZW5lXG4vLyBDYW4gaW5jbHVkZSBwb3N0LXByb2Nlc3NpbmcgdG8gcGFydGlhbGx5IGZpbHRlciBvciByZS1hcnJhbmdlIGRhdGEsIGUuZy4gb25seSBpbmNsdWRpbmcgUE9JcyB0aGF0IGhhdmUgbmFtZXNcblNjZW5lLnByb2Nlc3NMYXllcnNGb3JUaWxlID0gZnVuY3Rpb24gKGxheWVycywgdGlsZSkge1xuICAgIHZhciB0aWxlX2xheWVycyA9IHt9O1xuICAgIGZvciAodmFyIHQ9MDsgdCA8IGxheWVycy5sZW5ndGg7IHQrKykge1xuICAgICAgICBsYXllcnNbdF0ubnVtYmVyID0gdDtcblxuICAgICAgICBpZiAobGF5ZXJzW3RdICE9IG51bGwpIHtcbiAgICAgICAgICAgIC8vIEp1c3QgcGFzcyB0aHJvdWdoIGRhdGEgdW50b3VjaGVkIGlmIG5vIGRhdGEgdHJhbnNmb3JtIGZ1bmN0aW9uIGRlZmluZWRcbiAgICAgICAgICAgIGlmIChsYXllcnNbdF0uZGF0YSA9PSBudWxsKSB7XG4gICAgICAgICAgICAgICAgdGlsZV9sYXllcnNbbGF5ZXJzW3RdLm5hbWVdID0gdGlsZS5sYXllcnNbbGF5ZXJzW3RdLm5hbWVdO1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgLy8gUGFzcyB0aHJvdWdoIGRhdGEgYnV0IHdpdGggZGlmZmVyZW50IGxheWVyIG5hbWUgaW4gdGlsZSBzb3VyY2UgZGF0YVxuICAgICAgICAgICAgZWxzZSBpZiAodHlwZW9mIGxheWVyc1t0XS5kYXRhID09ICdzdHJpbmcnKSB7XG4gICAgICAgICAgICAgICAgdGlsZV9sYXllcnNbbGF5ZXJzW3RdLm5hbWVdID0gdGlsZS5sYXllcnNbbGF5ZXJzW3RdLmRhdGFdO1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgLy8gQXBwbHkgdGhlIHRyYW5zZm9ybSBmdW5jdGlvbiBmb3IgcG9zdC1wcm9jZXNzaW5nXG4gICAgICAgICAgICBlbHNlIGlmICh0eXBlb2YgbGF5ZXJzW3RdLmRhdGEgPT0gJ2Z1bmN0aW9uJykge1xuICAgICAgICAgICAgICAgIHRpbGVfbGF5ZXJzW2xheWVyc1t0XS5uYW1lXSA9IGxheWVyc1t0XS5kYXRhKHRpbGUubGF5ZXJzKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgfVxuXG4gICAgICAgIC8vIEhhbmRsZSBjYXNlcyB3aGVyZSBubyBkYXRhIHdhcyBmb3VuZCBpbiB0aWxlIG9yIHJldHVybmVkIGJ5IHBvc3QtcHJvY2Vzc29yXG4gICAgICAgIHRpbGVfbGF5ZXJzW2xheWVyc1t0XS5uYW1lXSA9IHRpbGVfbGF5ZXJzW2xheWVyc1t0XS5uYW1lXSB8fCB7IHR5cGU6ICdGZWF0dXJlQ29sbGVjdGlvbicsIGZlYXR1cmVzOiBbXSB9O1xuICAgIH1cbiAgICB0aWxlLmxheWVycyA9IHRpbGVfbGF5ZXJzO1xuICAgIHJldHVybiB0aWxlX2xheWVycztcbn07XG5cbi8vIENhbGxlZCBvbmNlIG9uIGluc3RhbnRpYXRpb25cblNjZW5lLmNyZWF0ZU1vZGVzID0gZnVuY3Rpb24gKHN0eWxlcykge1xuICAgIHZhciBtb2RlcyA9IHt9O1xuXG4gICAgLy8gQnVpbHQtaW4gbW9kZXNcbiAgICB2YXIgYnVpbHRfaW5zID0gcmVxdWlyZSgnLi9nbC9nbF9tb2RlcycpLk1vZGVzO1xuICAgIGZvciAodmFyIG0gaW4gYnVpbHRfaW5zKSB7XG4gICAgICAgIG1vZGVzW21dID0gYnVpbHRfaW5zW21dO1xuICAgIH1cblxuICAgIC8vIFN0eWxlc2hlZXQgbW9kZXNcbiAgICBmb3IgKHZhciBtIGluIHN0eWxlcy5tb2Rlcykge1xuICAgICAgICAvLyBpZiAobSAhPSAnYWxsJykge1xuICAgICAgICAgICAgbW9kZXNbbV0gPSBNb2RlTWFuYWdlci5jb25maWd1cmVNb2RlKG0sIHN0eWxlcy5tb2Rlc1ttXSk7XG4gICAgICAgIC8vIH1cbiAgICB9XG5cbiAgICByZXR1cm4gbW9kZXM7XG59O1xuXG5TY2VuZS5yZWZyZXNoTW9kZXMgPSBmdW5jdGlvbiAobW9kZXMsIHN0eWxlcykge1xuICAgIC8vIENvcHkgc3R5bGVzaGVldCBtb2Rlc1xuICAgIC8vIFRPRE86IGlzIHRoaXMgdGhlIGJlc3Qgd2F5IHRvIGNvcHkgc3R5bGVzaGVldCBjaGFuZ2VzIHRvIG1vZGUgaW5zdGFuY2VzP1xuICAgIGZvciAodmFyIG0gaW4gc3R5bGVzLm1vZGVzKSB7XG4gICAgICAgIC8vIGlmIChtICE9ICdhbGwnKSB7XG4gICAgICAgICAgICBtb2Rlc1ttXSA9IE1vZGVNYW5hZ2VyLmNvbmZpZ3VyZU1vZGUobSwgc3R5bGVzLm1vZGVzW21dKTtcbiAgICAgICAgLy8gfVxuICAgIH1cblxuICAgIC8vIFJlZnJlc2ggYWxsIG1vZGVzXG4gICAgZm9yIChtIGluIG1vZGVzKSB7XG4gICAgICAgIG1vZGVzW21dLnJlZnJlc2goKTtcbiAgICB9XG5cbiAgICByZXR1cm4gbW9kZXM7XG59O1xuXG5cbi8vIFByaXZhdGUvaW50ZXJuYWxcblxuLy8gR2V0IGJhc2UgVVJMIGZyb20gd2hpY2ggdGhlIGxpYnJhcnkgd2FzIGxvYWRlZFxuLy8gVXNlZCB0byBsb2FkIGFkZGl0aW9uYWwgcmVzb3VyY2VzIGxpa2Ugc2hhZGVycywgdGV4dHVyZXMsIGV0Yy4gaW4gY2FzZXMgd2hlcmUgbGlicmFyeSB3YXMgbG9hZGVkIGZyb20gYSByZWxhdGl2ZSBwYXRoXG5mdW5jdGlvbiBmaW5kQmFzZUxpYnJhcnlVUkwgKCkge1xuICAgIFNjZW5lLmxpYnJhcnlfYmFzZV91cmwgPSAnJztcbiAgICB2YXIgc2NyaXB0cyA9IGRvY3VtZW50LmdldEVsZW1lbnRzQnlUYWdOYW1lKCdzY3JpcHQnKTsgLy8gZG9jdW1lbnQucXVlcnlTZWxlY3RvckFsbCgnc2NyaXB0W3NyYyo9XCIuanNcIl0nKTtcbiAgICBmb3IgKHZhciBzPTA7IHMgPCBzY3JpcHRzLmxlbmd0aDsgcysrKSB7XG4gICAgICAgIHZhciBtYXRjaCA9IHNjcmlwdHNbc10uc3JjLmluZGV4T2YoJ3RhbmdyYW0uZGVidWcuanMnKTtcbiAgICAgICAgaWYgKG1hdGNoID09IC0xKSB7XG4gICAgICAgICAgICBtYXRjaCA9IHNjcmlwdHNbc10uc3JjLmluZGV4T2YoJ3RhbmdyYW0ubWluLmpzJyk7XG4gICAgICAgIH1cbiAgICAgICAgaWYgKG1hdGNoID49IDApIHtcbiAgICAgICAgICAgIFNjZW5lLmxpYnJhcnlfYmFzZV91cmwgPSBzY3JpcHRzW3NdLnNyYy5zdWJzdHIoMCwgbWF0Y2gpO1xuICAgICAgICAgICAgYnJlYWs7XG4gICAgICAgIH1cbiAgICB9XG59O1xuIiwiLyoqKiBTdHlsZSBoZWxwZXJzICoqKi9cbmltcG9ydCB7R2VvfSBmcm9tICcuL2dlbyc7XG5cbmV4cG9ydCB2YXIgU3R5bGUgPSB7fTtcblxuLy8gU3R5bGUgaGVscGVyc1xuXG5TdHlsZS5jb2xvciA9IHtcbiAgICBwc2V1ZG9SYW5kb21HcmF5c2NhbGU6IGZ1bmN0aW9uIChmKSB7IHZhciBjID0gTWF0aC5tYXgoKHBhcnNlSW50KGYuaWQsIDE2KSAlIDEwMCkgLyAxMDAsIDAuNCk7IHJldHVybiBbMC43ICogYywgMC43ICogYywgMC43ICogY107IH0sIC8vIHBzZXVkby1yYW5kb20gZ3JheXNjYWxlIGJ5IGdlb21ldHJ5IGlkXG4gICAgcHNldWRvUmFuZG9tQ29sb3I6IGZ1bmN0aW9uIChmKSB7IHJldHVybiBbMC43ICogKHBhcnNlSW50KGYuaWQsIDE2KSAvIDEwMCAlIDEpLCAwLjcgKiAocGFyc2VJbnQoZi5pZCwgMTYpIC8gMTAwMDAgJSAxKSwgMC43ICogKHBhcnNlSW50KGYuaWQsIDE2KSAvIDEwMDAwMDAgJSAxKV07IH0sIC8vIHBzZXVkby1yYW5kb20gY29sb3IgYnkgZ2VvbWV0cnkgaWRcbiAgICByYW5kb21Db2xvcjogZnVuY3Rpb24gKGYpIHsgcmV0dXJuIFswLjcgKiBNYXRoLnJhbmRvbSgpLCAwLjcgKiBNYXRoLnJhbmRvbSgpLCAwLjcgKiBNYXRoLnJhbmRvbSgpXTsgfSAvLyByYW5kb20gY29sb3Jcbn07XG5cbi8vIFJldHVybnMgYSBmdW5jdGlvbiAodGhhdCBjYW4gYmUgdXNlZCBhcyBhIGR5bmFtaWMgc3R5bGUpIHRoYXQgY29udmVydHMgcGl4ZWxzIHRvIG1ldGVycyBmb3IgdGhlIGN1cnJlbnQgem9vbSBsZXZlbC5cbi8vIFRoZSBwcm92aWRlZCBwaXhlbCB2YWx1ZSAoJ3AnKSBjYW4gaXRzZWxmIGJlIGEgZnVuY3Rpb24sIGluIHdoaWNoIGNhc2UgaXQgaXMgd3JhcHBlZCBieSB0aGlzIG9uZS5cblN0eWxlLnBpeGVscyA9IGZ1bmN0aW9uIChwLCB6KSB7XG4gICAgdmFyIGY7XG4gICAgZXZhbCgnZiA9IGZ1bmN0aW9uKGYsIHQsIGgpIHsgcmV0dXJuICcgKyAodHlwZW9mIHAgPT0gJ2Z1bmN0aW9uJyA/ICcoJyArIChwLnRvU3RyaW5nKCkgKyAnKGYsIHQsIGgpKScpIDogcCkgKyAnICogaC5HZW8ubWV0ZXJzX3Blcl9waXhlbFtoLnpvb21dOyB9Jyk7XG4gICAgcmV0dXJuIGY7XG59O1xuXG4vLyBDcmVhdGUgYSB1bmlxdWUgMzItYml0IGNvbG9yIHRvIGlkZW50aWZ5IGEgZmVhdHVyZVxuLy8gV29ya2VycyBpbmRlcGVuZGVudGx5IGNyZWF0ZS9tb2RpZnkgc2VsZWN0aW9uIGNvbG9ycyBpbiB0aGVpciBvd24gdGhyZWFkcywgYnV0IHdlIGFsc29cbi8vIG5lZWQgdGhlIG1haW4gdGhyZWFkIHRvIGtub3cgd2hlcmUgZWFjaCBmZWF0dXJlIGNvbG9yIG9yaWdpbmF0ZWQuIFRvIGFjY29tcGxpc2ggdGhpcyxcbi8vIHdlIHBhcnRpdGlvbiB0aGUgbWFwIGJ5IHNldHRpbmcgdGhlIDR0aCBjb21wb25lbnQgKGFscGhhIGNoYW5uZWwpIHRvIHRoZSB3b3JrZXIncyBpZC5cblN0eWxlLnNlbGVjdGlvbl9tYXAgPSB7fTsgLy8gdGhpcyB3aWxsIGJlIHVuaXF1ZSBwZXIgbW9kdWxlIGluc3RhbmNlIChzbyB1bmlxdWUgcGVyIHdvcmtlcilcblN0eWxlLnNlbGVjdGlvbl9tYXBfY3VycmVudCA9IDE7IC8vIHN0YXJ0IGF0IDEgc2luY2UgMSB3aWxsIGJlIGRpdmlkZWQgYnkgdGhpc1xuU3R5bGUuc2VsZWN0aW9uX21hcF9wcmVmaXggPSAwOyAvLyBzZXQgYnkgd29ya2VyIHRvIHdvcmtlciBpZCAjXG5TdHlsZS5nZW5lcmF0ZVNlbGVjdGlvbiA9IGZ1bmN0aW9uIChjb2xvcl9tYXApXG57XG4gICAgLy8gMzItYml0IGNvbG9yIGtleVxuICAgIFN0eWxlLnNlbGVjdGlvbl9tYXBfY3VycmVudCsrO1xuICAgIHZhciBpciA9IFN0eWxlLnNlbGVjdGlvbl9tYXBfY3VycmVudCAmIDI1NTtcbiAgICB2YXIgaWcgPSAoU3R5bGUuc2VsZWN0aW9uX21hcF9jdXJyZW50ID4+IDgpICYgMjU1O1xuICAgIHZhciBpYiA9IChTdHlsZS5zZWxlY3Rpb25fbWFwX2N1cnJlbnQgPj4gMTYpICYgMjU1O1xuICAgIHZhciBpYSA9IFN0eWxlLnNlbGVjdGlvbl9tYXBfcHJlZml4O1xuICAgIHZhciByID0gaXIgLyAyNTU7XG4gICAgdmFyIGcgPSBpZyAvIDI1NTtcbiAgICB2YXIgYiA9IGliIC8gMjU1O1xuICAgIHZhciBhID0gaWEgLyAyNTU7XG4gICAgdmFyIGtleSA9IChpciArIChpZyA8PCA4KSArIChpYiA8PCAxNikgKyAoaWEgPDwgMjQpKSA+Pj4gMDsgLy8gbmVlZCB1bnNpZ25lZCByaWdodCBzaGlmdCB0byBjb252ZXJ0IHRvIHBvc2l0aXZlICNcblxuICAgIGNvbG9yX21hcFtrZXldID0ge1xuICAgICAgICBjb2xvcjogW3IsIGcsIGIsIGFdLFxuICAgIH07XG5cbiAgICByZXR1cm4gY29sb3JfbWFwW2tleV07XG59O1xuXG5TdHlsZS5yZXNldFNlbGVjdGlvbk1hcCA9IGZ1bmN0aW9uICgpXG57XG4gICAgU3R5bGUuc2VsZWN0aW9uX21hcCA9IHt9O1xuICAgIFN0eWxlLnNlbGVjdGlvbl9tYXBfY3VycmVudCA9IDE7XG59O1xuXG4vLyBGaW5kIGFuZCBleHBhbmQgc3R5bGUgbWFjcm9zXG5TdHlsZS5tYWNyb3MgPSBbXG4gICAgJ1N0eWxlLmNvbG9yLnBzZXVkb1JhbmRvbUNvbG9yJyxcbiAgICAnU3R5bGUucGl4ZWxzJ1xuXTtcblxuU3R5bGUuZXhwYW5kTWFjcm9zID0gZnVuY3Rpb24gZXhwYW5kTWFjcm9zIChvYmopIHtcbiAgICBmb3IgKHZhciBwIGluIG9iaikge1xuICAgICAgICB2YXIgdmFsID0gb2JqW3BdO1xuXG4gICAgICAgIC8vIExvb3AgdGhyb3VnaCBvYmplY3QgcHJvcGVydGllc1xuICAgICAgICBpZiAodHlwZW9mIHZhbCA9PSAnb2JqZWN0Jykge1xuICAgICAgICAgICAgb2JqW3BdID0gZXhwYW5kTWFjcm9zKHZhbCk7XG4gICAgICAgIH1cbiAgICAgICAgLy8gQ29udmVydCBzdHJpbmdzIGJhY2sgaW50byBmdW5jdGlvbnNcbiAgICAgICAgZWxzZSBpZiAodHlwZW9mIHZhbCA9PSAnc3RyaW5nJykge1xuICAgICAgICAgICAgZm9yICh2YXIgbSBpbiBTdHlsZS5tYWNyb3MpIHtcbiAgICAgICAgICAgICAgICBpZiAodmFsLm1hdGNoKFN0eWxlLm1hY3Jvc1ttXSkpIHtcbiAgICAgICAgICAgICAgICAgICAgdmFyIGY7XG4gICAgICAgICAgICAgICAgICAgIHRyeSB7XG4gICAgICAgICAgICAgICAgICAgICAgICBldmFsKCdmID0gJyArIHZhbCk7XG4gICAgICAgICAgICAgICAgICAgICAgICBvYmpbcF0gPSBmO1xuICAgICAgICAgICAgICAgICAgICAgICAgYnJlYWs7XG4gICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICAgICAgY2F0Y2ggKGUpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgIC8vIGZhbGwtYmFjayB0byBvcmlnaW5hbCB2YWx1ZSBpZiBwYXJzaW5nIGZhaWxlZFxuICAgICAgICAgICAgICAgICAgICAgICAgb2JqW3BdID0gdmFsO1xuICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgfVxuICAgICAgICB9XG4gICAgfVxuXG4gICAgcmV0dXJuIG9iajtcbn07XG5cblxuLy8gU3R5bGUgZGVmYXVsdHNcblxuLy8gRGV0ZXJtaW5lIGZpbmFsIHN0eWxlIHByb3BlcnRpZXMgKGNvbG9yLCB3aWR0aCwgZXRjLilcblN0eWxlLmRlZmF1bHRzID0ge1xuICAgIGNvbG9yOiBbMS4wLCAwLCAwXSxcbiAgICB3aWR0aDogMSxcbiAgICBzaXplOiAxLFxuICAgIGV4dHJ1ZGU6IGZhbHNlLFxuICAgIGhlaWdodDogMjAsXG4gICAgbWluX2hlaWdodDogMCxcbiAgICBvdXRsaW5lOiB7XG4gICAgICAgIC8vIGNvbG9yOiBbMS4wLCAwLCAwXSxcbiAgICAgICAgLy8gd2lkdGg6IDEsXG4gICAgICAgIC8vIGRhc2g6IG51bGxcbiAgICB9LFxuICAgIHNlbGVjdGlvbjoge1xuICAgICAgICBhY3RpdmU6IGZhbHNlLFxuICAgICAgICBjb2xvcjogWzAsIDAsIDAsIDFdXG4gICAgfSxcbiAgICBtb2RlOiB7XG4gICAgICAgIG5hbWU6ICdwb2x5Z29ucydcbiAgICB9XG59O1xuXG4vLyBTdHlsZSBwYXJzaW5nXG5cbi8vIEhlbHBlciBmdW5jdGlvbnMgcGFzc2VkIHRvIGR5bmFtaWMgc3R5bGUgZnVuY3Rpb25zXG5TdHlsZS5oZWxwZXJzID0ge1xuICAgIFN0eWxlOiBTdHlsZSxcbiAgICBHZW86IEdlb1xufTtcblxuU3R5bGUucGFyc2VTdHlsZUZvckZlYXR1cmUgPSBmdW5jdGlvbiAoZmVhdHVyZSwgbGF5ZXJfbmFtZSwgbGF5ZXJfc3R5bGUsIHRpbGUpXG57XG4gICAgdmFyIGxheWVyX3N0eWxlID0gbGF5ZXJfc3R5bGUgfHwge307XG4gICAgdmFyIHN0eWxlID0ge307XG5cbiAgICBTdHlsZS5oZWxwZXJzLnpvb20gPSB0aWxlLmNvb3Jkcy56O1xuXG4gICAgLy8gVGVzdCB3aGV0aGVyIGZlYXR1cmVzIHNob3VsZCBiZSByZW5kZXJlZCBhdCBhbGxcbiAgICBpZiAodHlwZW9mIGxheWVyX3N0eWxlLmZpbHRlciA9PSAnZnVuY3Rpb24nKSB7XG4gICAgICAgIGlmIChsYXllcl9zdHlsZS5maWx0ZXIoZmVhdHVyZSwgdGlsZSwgU3R5bGUuaGVscGVycykgPT0gZmFsc2UpIHtcbiAgICAgICAgICAgIHJldHVybiBudWxsO1xuICAgICAgICB9XG4gICAgfVxuXG4gICAgLy8gUGFyc2Ugc3R5bGVzXG4gICAgc3R5bGUuY29sb3IgPSAobGF5ZXJfc3R5bGUuY29sb3IgJiYgKGxheWVyX3N0eWxlLmNvbG9yW2ZlYXR1cmUucHJvcGVydGllcy5raW5kXSB8fCBsYXllcl9zdHlsZS5jb2xvci5kZWZhdWx0KSkgfHwgU3R5bGUuZGVmYXVsdHMuY29sb3I7XG4gICAgaWYgKHR5cGVvZiBzdHlsZS5jb2xvciA9PSAnZnVuY3Rpb24nKSB7XG4gICAgICAgIHN0eWxlLmNvbG9yID0gc3R5bGUuY29sb3IoZmVhdHVyZSwgdGlsZSwgU3R5bGUuaGVscGVycyk7XG4gICAgfVxuXG4gICAgc3R5bGUud2lkdGggPSAobGF5ZXJfc3R5bGUud2lkdGggJiYgKGxheWVyX3N0eWxlLndpZHRoW2ZlYXR1cmUucHJvcGVydGllcy5raW5kXSB8fCBsYXllcl9zdHlsZS53aWR0aC5kZWZhdWx0KSkgfHwgU3R5bGUuZGVmYXVsdHMud2lkdGg7XG4gICAgaWYgKHR5cGVvZiBzdHlsZS53aWR0aCA9PSAnZnVuY3Rpb24nKSB7XG4gICAgICAgIHN0eWxlLndpZHRoID0gc3R5bGUud2lkdGgoZmVhdHVyZSwgdGlsZSwgU3R5bGUuaGVscGVycyk7XG4gICAgfVxuICAgIHN0eWxlLndpZHRoICo9IEdlby51bml0c19wZXJfbWV0ZXJbdGlsZS5jb29yZHMuel07XG5cbiAgICBzdHlsZS5zaXplID0gKGxheWVyX3N0eWxlLnNpemUgJiYgKGxheWVyX3N0eWxlLnNpemVbZmVhdHVyZS5wcm9wZXJ0aWVzLmtpbmRdIHx8IGxheWVyX3N0eWxlLnNpemUuZGVmYXVsdCkpIHx8IFN0eWxlLmRlZmF1bHRzLnNpemU7XG4gICAgaWYgKHR5cGVvZiBzdHlsZS5zaXplID09ICdmdW5jdGlvbicpIHtcbiAgICAgICAgc3R5bGUuc2l6ZSA9IHN0eWxlLnNpemUoZmVhdHVyZSwgdGlsZSwgU3R5bGUuaGVscGVycyk7XG4gICAgfVxuICAgIHN0eWxlLnNpemUgKj0gR2VvLnVuaXRzX3Blcl9tZXRlclt0aWxlLmNvb3Jkcy56XTtcblxuICAgIHN0eWxlLmV4dHJ1ZGUgPSAobGF5ZXJfc3R5bGUuZXh0cnVkZSAmJiAobGF5ZXJfc3R5bGUuZXh0cnVkZVtmZWF0dXJlLnByb3BlcnRpZXMua2luZF0gfHwgbGF5ZXJfc3R5bGUuZXh0cnVkZS5kZWZhdWx0KSkgfHwgU3R5bGUuZGVmYXVsdHMuZXh0cnVkZTtcbiAgICBpZiAodHlwZW9mIHN0eWxlLmV4dHJ1ZGUgPT0gJ2Z1bmN0aW9uJykge1xuICAgICAgICAvLyByZXR1cm5pbmcgYSBib29sZWFuIHdpbGwgZXh0cnVkZSB3aXRoIHRoZSBmZWF0dXJlJ3MgaGVpZ2h0LCBhIG51bWJlciB3aWxsIG92ZXJyaWRlIHRoZSBmZWF0dXJlIGhlaWdodCAoc2VlIGJlbG93KVxuICAgICAgICBzdHlsZS5leHRydWRlID0gc3R5bGUuZXh0cnVkZShmZWF0dXJlLCB0aWxlLCBTdHlsZS5oZWxwZXJzKTtcbiAgICB9XG5cbiAgICBzdHlsZS5oZWlnaHQgPSAoZmVhdHVyZS5wcm9wZXJ0aWVzICYmIGZlYXR1cmUucHJvcGVydGllcy5oZWlnaHQpIHx8IFN0eWxlLmRlZmF1bHRzLmhlaWdodDtcbiAgICBzdHlsZS5taW5faGVpZ2h0ID0gKGZlYXR1cmUucHJvcGVydGllcyAmJiBmZWF0dXJlLnByb3BlcnRpZXMubWluX2hlaWdodCkgfHwgU3R5bGUuZGVmYXVsdHMubWluX2hlaWdodDtcblxuICAgIC8vIGhlaWdodCBkZWZhdWx0cyB0byBmZWF0dXJlIGhlaWdodCwgYnV0IGV4dHJ1ZGUgc3R5bGUgY2FuIGR5bmFtaWNhbGx5IGFkanVzdCBoZWlnaHQgYnkgcmV0dXJuaW5nIGEgbnVtYmVyIG9yIGFycmF5IChpbnN0ZWFkIG9mIGEgYm9vbGVhbilcbiAgICBpZiAoc3R5bGUuZXh0cnVkZSkge1xuICAgICAgICBpZiAodHlwZW9mIHN0eWxlLmV4dHJ1ZGUgPT0gJ251bWJlcicpIHtcbiAgICAgICAgICAgIHN0eWxlLmhlaWdodCA9IHN0eWxlLmV4dHJ1ZGU7XG4gICAgICAgIH1cbiAgICAgICAgZWxzZSBpZiAodHlwZW9mIHN0eWxlLmV4dHJ1ZGUgPT0gJ29iamVjdCcgJiYgc3R5bGUuZXh0cnVkZS5sZW5ndGggPj0gMikge1xuICAgICAgICAgICAgc3R5bGUubWluX2hlaWdodCA9IHN0eWxlLmV4dHJ1ZGVbMF07XG4gICAgICAgICAgICBzdHlsZS5oZWlnaHQgPSBzdHlsZS5leHRydWRlWzFdO1xuICAgICAgICB9XG4gICAgfVxuXG4gICAgc3R5bGUueiA9IChsYXllcl9zdHlsZS56ICYmIChsYXllcl9zdHlsZS56W2ZlYXR1cmUucHJvcGVydGllcy5raW5kXSB8fCBsYXllcl9zdHlsZS56LmRlZmF1bHQpKSB8fCBTdHlsZS5kZWZhdWx0cy56IHx8IDA7XG4gICAgaWYgKHR5cGVvZiBzdHlsZS56ID09ICdmdW5jdGlvbicpIHtcbiAgICAgICAgc3R5bGUueiA9IHN0eWxlLnooZmVhdHVyZSwgdGlsZSwgU3R5bGUuaGVscGVycyk7XG4gICAgfVxuXG4gICAgc3R5bGUub3V0bGluZSA9IHt9O1xuICAgIGxheWVyX3N0eWxlLm91dGxpbmUgPSBsYXllcl9zdHlsZS5vdXRsaW5lIHx8IHt9O1xuICAgIHN0eWxlLm91dGxpbmUuY29sb3IgPSAobGF5ZXJfc3R5bGUub3V0bGluZS5jb2xvciAmJiAobGF5ZXJfc3R5bGUub3V0bGluZS5jb2xvcltmZWF0dXJlLnByb3BlcnRpZXMua2luZF0gfHwgbGF5ZXJfc3R5bGUub3V0bGluZS5jb2xvci5kZWZhdWx0KSkgfHwgU3R5bGUuZGVmYXVsdHMub3V0bGluZS5jb2xvcjtcbiAgICBpZiAodHlwZW9mIHN0eWxlLm91dGxpbmUuY29sb3IgPT0gJ2Z1bmN0aW9uJykge1xuICAgICAgICBzdHlsZS5vdXRsaW5lLmNvbG9yID0gc3R5bGUub3V0bGluZS5jb2xvcihmZWF0dXJlLCB0aWxlLCBTdHlsZS5oZWxwZXJzKTtcbiAgICB9XG5cbiAgICBzdHlsZS5vdXRsaW5lLndpZHRoID0gKGxheWVyX3N0eWxlLm91dGxpbmUud2lkdGggJiYgKGxheWVyX3N0eWxlLm91dGxpbmUud2lkdGhbZmVhdHVyZS5wcm9wZXJ0aWVzLmtpbmRdIHx8IGxheWVyX3N0eWxlLm91dGxpbmUud2lkdGguZGVmYXVsdCkpIHx8IFN0eWxlLmRlZmF1bHRzLm91dGxpbmUud2lkdGg7XG4gICAgaWYgKHR5cGVvZiBzdHlsZS5vdXRsaW5lLndpZHRoID09ICdmdW5jdGlvbicpIHtcbiAgICAgICAgc3R5bGUub3V0bGluZS53aWR0aCA9IHN0eWxlLm91dGxpbmUud2lkdGgoZmVhdHVyZSwgdGlsZSwgU3R5bGUuaGVscGVycyk7XG4gICAgfVxuICAgIHN0eWxlLm91dGxpbmUud2lkdGggKj0gR2VvLnVuaXRzX3Blcl9tZXRlclt0aWxlLmNvb3Jkcy56XTtcblxuICAgIHN0eWxlLm91dGxpbmUuZGFzaCA9IChsYXllcl9zdHlsZS5vdXRsaW5lLmRhc2ggJiYgKGxheWVyX3N0eWxlLm91dGxpbmUuZGFzaFtmZWF0dXJlLnByb3BlcnRpZXMua2luZF0gfHwgbGF5ZXJfc3R5bGUub3V0bGluZS5kYXNoLmRlZmF1bHQpKSB8fCBTdHlsZS5kZWZhdWx0cy5vdXRsaW5lLmRhc2g7XG4gICAgaWYgKHR5cGVvZiBzdHlsZS5vdXRsaW5lLmRhc2ggPT0gJ2Z1bmN0aW9uJykge1xuICAgICAgICBzdHlsZS5vdXRsaW5lLmRhc2ggPSBzdHlsZS5vdXRsaW5lLmRhc2goZmVhdHVyZSwgdGlsZSwgU3R5bGUuaGVscGVycyk7XG4gICAgfVxuXG4gICAgLy8gSW50ZXJhY3Rpdml0eSAoc2VsZWN0aW9uIG1hcClcbiAgICB2YXIgaW50ZXJhY3RpdmUgPSBmYWxzZTtcbiAgICBpZiAodHlwZW9mIGxheWVyX3N0eWxlLmludGVyYWN0aXZlID09ICdmdW5jdGlvbicpIHtcbiAgICAgICAgaW50ZXJhY3RpdmUgPSBsYXllcl9zdHlsZS5pbnRlcmFjdGl2ZShmZWF0dXJlLCB0aWxlLCBTdHlsZS5oZWxwZXJzKTtcbiAgICB9XG4gICAgZWxzZSB7XG4gICAgICAgIGludGVyYWN0aXZlID0gbGF5ZXJfc3R5bGUuaW50ZXJhY3RpdmU7XG4gICAgfVxuXG4gICAgaWYgKGludGVyYWN0aXZlID09IHRydWUpIHtcbiAgICAgICAgdmFyIHNlbGVjdG9yID0gU3R5bGUuZ2VuZXJhdGVTZWxlY3Rpb24oU3R5bGUuc2VsZWN0aW9uX21hcCk7XG5cbiAgICAgICAgc2VsZWN0b3IuZmVhdHVyZSA9IHtcbiAgICAgICAgICAgIGlkOiBmZWF0dXJlLmlkLFxuICAgICAgICAgICAgcHJvcGVydGllczogZmVhdHVyZS5wcm9wZXJ0aWVzXG4gICAgICAgIH07XG4gICAgICAgIHNlbGVjdG9yLmZlYXR1cmUucHJvcGVydGllcy5sYXllciA9IGxheWVyX25hbWU7IC8vIGFkZCBsYXllciBuYW1lIHRvIHByb3BlcnRpZXNcblxuICAgICAgICBzdHlsZS5zZWxlY3Rpb24gPSB7XG4gICAgICAgICAgICBhY3RpdmU6IHRydWUsXG4gICAgICAgICAgICBjb2xvcjogc2VsZWN0b3IuY29sb3JcbiAgICAgICAgfTtcbiAgICB9XG4gICAgZWxzZSB7XG4gICAgICAgIHN0eWxlLnNlbGVjdGlvbiA9IFN0eWxlLmRlZmF1bHRzLnNlbGVjdGlvbjtcbiAgICB9XG5cbiAgICBpZiAobGF5ZXJfc3R5bGUubW9kZSAhPSBudWxsICYmIGxheWVyX3N0eWxlLm1vZGUubmFtZSAhPSBudWxsKSB7XG4gICAgICAgIHN0eWxlLm1vZGUgPSB7fTtcbiAgICAgICAgZm9yICh2YXIgbSBpbiBsYXllcl9zdHlsZS5tb2RlKSB7XG4gICAgICAgICAgICBzdHlsZS5tb2RlW21dID0gbGF5ZXJfc3R5bGUubW9kZVttXTtcbiAgICAgICAgfVxuICAgIH1cbiAgICBlbHNlIHtcbiAgICAgICAgc3R5bGUubW9kZSA9IFN0eWxlLmRlZmF1bHRzLm1vZGU7XG4gICAgfVxuXG4gICAgcmV0dXJuIHN0eWxlO1xufTtcblxuIiwiLy8gTWlzY2VsbGFuZW91cyB1dGlsaXRpZXNcblxuLy8gU2ltcGxpc3RpYyBkZXRlY3Rpb24gb2YgcmVsYXRpdmUgcGF0aHMsIGFwcGVuZCBiYXNlIGlmIG5lY2Vzc2FyeVxuZXhwb3J0IGZ1bmN0aW9uIHVybEZvclBhdGgocGF0aCkge1xuICAgIGlmIChwYXRoID09IG51bGwgfHwgcGF0aCA9PSAnJykge1xuICAgICAgICByZXR1cm4gbnVsbDtcbiAgICB9XG5cbiAgICAvLyBDYW4gZXhwYW5kIGEgc2luZ2xlIHBhdGgsIG9yIGFuIGFycmF5IG9mIHBhdGhzXG4gICAgaWYgKHR5cGVvZiBwYXRoID09ICdvYmplY3QnICYmIHBhdGgubGVuZ3RoID4gMCkge1xuICAgICAgICAvLyBBcnJheSBvZiBwYXRoc1xuICAgICAgICBmb3IgKHZhciBwIGluIHBhdGgpIHtcbiAgICAgICAgICAgIHZhciBwcm90b2NvbCA9IHBhdGhbcF0udG9Mb3dlckNhc2UoKS5zdWJzdHIoMCwgNCk7XG4gICAgICAgICAgICBpZiAoIShwcm90b2NvbCA9PSAnaHR0cCcgfHwgcHJvdG9jb2wgPT0gJ2ZpbGUnKSkge1xuICAgICAgICAgICAgICAgIHBhdGhbcF0gPSB3aW5kb3cubG9jYXRpb24ub3JpZ2luICsgd2luZG93LmxvY2F0aW9uLnBhdGhuYW1lICsgcGF0aFtwXTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgfVxuICAgIH1cbiAgICBlbHNlIHtcbiAgICAgICAgLy8gU2luZ2xlIHBhdGhcbiAgICAgICAgdmFyIHByb3RvY29sID0gcGF0aC50b0xvd2VyQ2FzZSgpLnN1YnN0cigwLCA0KTtcbiAgICAgICAgaWYgKCEocHJvdG9jb2wgPT0gJ2h0dHAnIHx8IHByb3RvY29sID09ICdmaWxlJykpIHtcbiAgICAgICAgICAgIHBhdGggPSB3aW5kb3cubG9jYXRpb24ub3JpZ2luICsgd2luZG93LmxvY2F0aW9uLnBhdGhuYW1lICsgcGF0aDtcbiAgICAgICAgfVxuICAgIH1cbiAgICByZXR1cm4gcGF0aDtcbn07XG5cbi8vIFN0cmluZ2lmeSBhbiBvYmplY3QgaW50byBKU09OLCBidXQgY29udmVydCBmdW5jdGlvbnMgdG8gc3RyaW5nc1xuZXhwb3J0IGZ1bmN0aW9uIHNlcmlhbGl6ZVdpdGhGdW5jdGlvbnMob2JqKSB7XG4gICAgdmFyIHNlcmlhbGl6ZWQgPSBKU09OLnN0cmluZ2lmeShvYmosIGZ1bmN0aW9uKGssIHYpIHtcbiAgICAgICAgLy8gQ29udmVydCBmdW5jdGlvbnMgdG8gc3RyaW5nc1xuICAgICAgICBpZiAodHlwZW9mIHYgPT0gJ2Z1bmN0aW9uJykge1xuICAgICAgICAgICAgcmV0dXJuIHYudG9TdHJpbmcoKTtcbiAgICAgICAgfVxuICAgICAgICByZXR1cm4gdjtcbiAgICB9KTtcblxuICAgIHJldHVybiBzZXJpYWxpemVkO1xufTtcblxuLy8gUGFyc2UgYSBKU09OIHN0cmluZywgYnV0IGNvbnZlcnQgZnVuY3Rpb24tbGlrZSBzdHJpbmdzIGJhY2sgaW50byBmdW5jdGlvbnNcbmV4cG9ydCBmdW5jdGlvbiBkZXNlcmlhbGl6ZVdpdGhGdW5jdGlvbnMoc2VyaWFsaXplZCkge1xuICAgIHZhciBvYmogPSBKU09OLnBhcnNlKHNlcmlhbGl6ZWQpO1xuICAgIG9iaiA9IHN0cmluZ3NUb0Z1bmN0aW9ucyhvYmopO1xuXG4gICAgcmV0dXJuIG9iajtcbn07XG5cbi8vIFJlY3Vyc2l2ZWx5IHBhcnNlIGFuIG9iamVjdCwgYXR0ZW1wdGluZyB0byBjb252ZXJ0IHN0cmluZyBwcm9wZXJ0aWVzIHRoYXQgbG9vayBsaWtlIGZ1bmN0aW9ucyBiYWNrIGludG8gZnVuY3Rpb25zXG5leHBvcnQgZnVuY3Rpb24gc3RyaW5nc1RvRnVuY3Rpb25zKG9iaikge1xuICAgIGZvciAodmFyIHAgaW4gb2JqKSB7XG4gICAgICAgIHZhciB2YWwgPSBvYmpbcF07XG5cbiAgICAgICAgLy8gTG9vcCB0aHJvdWdoIG9iamVjdCBwcm9wZXJ0aWVzXG4gICAgICAgIGlmICh0eXBlb2YgdmFsID09ICdvYmplY3QnKSB7XG4gICAgICAgICAgICBvYmpbcF0gPSBzdHJpbmdzVG9GdW5jdGlvbnModmFsKTtcbiAgICAgICAgfVxuICAgICAgICAvLyBDb252ZXJ0IHN0cmluZ3MgYmFjayBpbnRvIGZ1bmN0aW9uc1xuICAgICAgICBlbHNlIGlmICh0eXBlb2YgdmFsID09ICdzdHJpbmcnICYmIHZhbC5tYXRjaCgvXmZ1bmN0aW9uLipcXCguKlxcKS8pICE9IG51bGwpIHtcbiAgICAgICAgICAgIHZhciBmO1xuICAgICAgICAgICAgdHJ5IHtcbiAgICAgICAgICAgICAgICBldmFsKCdmID0gJyArIHZhbCk7XG4gICAgICAgICAgICAgICAgb2JqW3BdID0gZjtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIGNhdGNoIChlKSB7XG4gICAgICAgICAgICAgICAgLy8gZmFsbC1iYWNrIHRvIG9yaWdpbmFsIHZhbHVlIGlmIHBhcnNpbmcgZmFpbGVkXG4gICAgICAgICAgICAgICAgb2JqW3BdID0gdmFsO1xuICAgICAgICAgICAgfVxuICAgICAgICB9XG4gICAgfVxuXG4gICAgcmV0dXJuIG9iajtcbn07XG5cbi8vIFJ1biBhIGJsb2NrIGlmIG9uIHRoZSBtYWluIHRocmVhZCAobm90IGluIGEgd2ViIHdvcmtlciksIHdpdGggb3B0aW9uYWwgZXJyb3IgKHdlYiB3b3JrZXIpIGJsb2NrXG5leHBvcnQgZnVuY3Rpb24gcnVuSWZJbk1haW5UaHJlYWQoYmxvY2ssIGVycikge1xuICAgIHRyeSB7XG4gICAgICAgIGlmICh3aW5kb3cuZG9jdW1lbnQgIT09IHVuZGVmaW5lZCkge1xuICAgICAgICAgICAgYmxvY2soKTtcbiAgICAgICAgfVxuICAgIH1cbiAgICBjYXRjaCAoZSkge1xuICAgICAgICBpZiAodHlwZW9mIGVyciA9PSAnZnVuY3Rpb24nKSB7XG4gICAgICAgICAgICBlcnIoKTtcbiAgICAgICAgfVxuICAgIH1cbn1cblxuLy8gVXNlZCBmb3IgZGlmZmVyZW50aWF0aW5nIGJldHdlZW4gcG93ZXItb2YtMiBhbmQgbm9uLXBvd2VyLW9mLTIgdGV4dHVyZXNcbi8vIFZpYTogaHR0cDovL3N0YWNrb3ZlcmZsb3cuY29tL3F1ZXN0aW9ucy8xOTcyMjI0Ny93ZWJnbC13YWl0LWZvci10ZXh0dXJlLXRvLWxvYWRcbmV4cG9ydCBmdW5jdGlvbiBpc1Bvd2VyT2YyKHZhbHVlKSB7XG4gICAgcmV0dXJuICh2YWx1ZSAmICh2YWx1ZSAtIDEpKSA9PSAwO1xufVxuIiwiLyoqKiBWZWN0b3IgZnVuY3Rpb25zIC0gdmVjdG9ycyBwcm92aWRlZCBhcyBbeCwgeSwgel0gYXJyYXlzICoqKi9cblxuZXhwb3J0IHZhciBWZWN0b3IgPSB7fTtcblxuLy8gVmVjdG9yIGxlbmd0aCBzcXVhcmVkXG5WZWN0b3IubGVuZ3RoU3EgPSBmdW5jdGlvbiAodilcbntcbiAgICBpZiAodi5sZW5ndGggPT0gMikge1xuICAgICAgICByZXR1cm4gKHZbMF0qdlswXSArIHZbMV0qdlsxXSk7XG4gICAgfVxuICAgIGVsc2Uge1xuICAgICAgICByZXR1cm4gKHZbMF0qdlswXSArIHZbMV0qdlsxXSArIHZbMl0qdlsyXSk7XG4gICAgfVxufTtcblxuLy8gVmVjdG9yIGxlbmd0aFxuVmVjdG9yLmxlbmd0aCA9IGZ1bmN0aW9uICh2KVxue1xuICAgIHJldHVybiBNYXRoLnNxcnQoVmVjdG9yLmxlbmd0aFNxKHYpKTtcbn07XG5cbi8vIE5vcm1hbGl6ZSBhIHZlY3RvclxuVmVjdG9yLm5vcm1hbGl6ZSA9IGZ1bmN0aW9uICh2KVxue1xuICAgIHZhciBkO1xuICAgIGlmICh2Lmxlbmd0aCA9PSAyKSB7XG4gICAgICAgIGQgPSB2WzBdKnZbMF0gKyB2WzFdKnZbMV07XG4gICAgICAgIGQgPSBNYXRoLnNxcnQoZCk7XG5cbiAgICAgICAgaWYgKGQgIT0gMCkge1xuICAgICAgICAgICAgcmV0dXJuIFt2WzBdIC8gZCwgdlsxXSAvIGRdO1xuICAgICAgICB9XG4gICAgICAgIHJldHVybiBbMCwgMF07XG4gICAgfVxuICAgIGVsc2Uge1xuICAgICAgICB2YXIgZCA9IHZbMF0qdlswXSArIHZbMV0qdlsxXSArIHZbMl0qdlsyXTtcbiAgICAgICAgZCA9IE1hdGguc3FydChkKTtcblxuICAgICAgICBpZiAoZCAhPSAwKSB7XG4gICAgICAgICAgICByZXR1cm4gW3ZbMF0gLyBkLCB2WzFdIC8gZCwgdlsyXSAvIGRdO1xuICAgICAgICB9XG4gICAgICAgIHJldHVybiBbMCwgMCwgMF07XG4gICAgfVxufTtcblxuLy8gQ3Jvc3MgcHJvZHVjdCBvZiB0d28gdmVjdG9yc1xuVmVjdG9yLmNyb3NzICA9IGZ1bmN0aW9uICh2MSwgdjIpXG57XG4gICAgcmV0dXJuIFtcbiAgICAgICAgKHYxWzFdICogdjJbMl0pIC0gKHYxWzJdICogdjJbMV0pLFxuICAgICAgICAodjFbMl0gKiB2MlswXSkgLSAodjFbMF0gKiB2MlsyXSksXG4gICAgICAgICh2MVswXSAqIHYyWzFdKSAtICh2MVsxXSAqIHYyWzBdKVxuICAgIF07XG59O1xuXG4vLyBGaW5kIHRoZSBpbnRlcnNlY3Rpb24gb2YgdHdvIGxpbmVzIHNwZWNpZmllZCBhcyBzZWdtZW50cyBmcm9tIHBvaW50cyAocDEsIHAyKSBhbmQgKHAzLCBwNClcbi8vIGh0dHA6Ly9lbi53aWtpcGVkaWEub3JnL3dpa2kvTGluZS1saW5lX2ludGVyc2VjdGlvblxuLy8gaHR0cDovL2VuLndpa2lwZWRpYS5vcmcvd2lraS9DcmFtZXInc19ydWxlXG5WZWN0b3IubGluZUludGVyc2VjdGlvbiA9IGZ1bmN0aW9uIChwMSwgcDIsIHAzLCBwNCwgcGFyYWxsZWxfdG9sZXJhbmNlKVxue1xuICAgIHZhciBwYXJhbGxlbF90b2xlcmFuY2UgPSBwYXJhbGxlbF90b2xlcmFuY2UgfHwgMC4wMTtcblxuICAgIC8vIGExKnggKyBiMSp5ID0gYzEgZm9yIGxpbmUgKHgxLCB5MSkgdG8gKHgyLCB5MilcbiAgICAvLyBhMip4ICsgYjIqeSA9IGMyIGZvciBsaW5lICh4MywgeTMpIHRvICh4NCwgeTQpXG4gICAgdmFyIGExID0gcDFbMV0gLSBwMlsxXTsgLy8geTEgLSB5MlxuICAgIHZhciBiMSA9IHAxWzBdIC0gcDJbMF07IC8vIHgxIC0geDJcbiAgICB2YXIgYTIgPSBwM1sxXSAtIHA0WzFdOyAvLyB5MyAtIHk0XG4gICAgdmFyIGIyID0gcDNbMF0gLSBwNFswXTsgLy8geDMgLSB4NFxuICAgIHZhciBjMSA9IChwMVswXSAqIHAyWzFdKSAtIChwMVsxXSAqIHAyWzBdKTsgLy8geDEqeTIgLSB5MSp4MlxuICAgIHZhciBjMiA9IChwM1swXSAqIHA0WzFdKSAtIChwM1sxXSAqIHA0WzBdKTsgLy8geDMqeTQgLSB5Myp4NFxuICAgIHZhciBkZW5vbSA9IChiMSAqIGEyKSAtIChhMSAqIGIyKTtcblxuICAgIGlmIChNYXRoLmFicyhkZW5vbSkgPiBwYXJhbGxlbF90b2xlcmFuY2UpIHtcbiAgICAgICAgcmV0dXJuIFtcbiAgICAgICAgICAgICgoYzEgKiBiMikgLSAoYjEgKiBjMikpIC8gZGVub20sXG4gICAgICAgICAgICAoKGMxICogYTIpIC0gKGExICogYzIpKSAvIGRlbm9tXG4gICAgICAgIF07XG4gICAgfVxuICAgIHJldHVybiBudWxsOyAvLyByZXR1cm4gbnVsbCBpZiBsaW5lcyBhcmUgKGNsb3NlIHRvKSBwYXJhbGxlbFxufTtcbiJdfQ==
(13)
});
