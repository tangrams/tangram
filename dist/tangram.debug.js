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
      $__10.createCamera();
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
    $__10.refreshCamera();
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
Scene.prototype.createCamera = function() {
  this.camera = Camera.create(this, this.styles.camera);
};
Scene.prototype.refreshCamera = function() {
  this.createCamera();
  this.refreshModes();
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
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi9Vc2Vycy9iY2FtcGVyL0RvY3VtZW50cy9kZXYvdmVjdG9yLW1hcC9ub2RlX21vZHVsZXMvYnJvd3NlcmlmeS9ub2RlX21vZHVsZXMvYnJvd3Nlci1wYWNrL19wcmVsdWRlLmpzIiwiL1VzZXJzL2JjYW1wZXIvRG9jdW1lbnRzL2Rldi92ZWN0b3ItbWFwL25vZGVfbW9kdWxlcy9nbC1tYXRyaXgvZGlzdC9nbC1tYXRyaXguanMiLCIvVXNlcnMvYmNhbXBlci9Eb2N1bWVudHMvZGV2L3ZlY3Rvci1tYXAvbm9kZV9tb2R1bGVzL3F1ZXVlLWFzeW5jL3F1ZXVlLmpzIiwiL1VzZXJzL2JjYW1wZXIvRG9jdW1lbnRzL2Rldi92ZWN0b3ItbWFwL3NyYy9jYW1lcmEuanMiLCIvVXNlcnMvYmNhbXBlci9Eb2N1bWVudHMvZGV2L3ZlY3Rvci1tYXAvc3JjL2dlby5qcyIsIi9Vc2Vycy9iY2FtcGVyL0RvY3VtZW50cy9kZXYvdmVjdG9yLW1hcC9zcmMvZ2wvZ2wuanMiLCIvVXNlcnMvYmNhbXBlci9Eb2N1bWVudHMvZGV2L3ZlY3Rvci1tYXAvc3JjL2dsL2dsX2J1aWxkZXJzLmpzIiwiL1VzZXJzL2JjYW1wZXIvRG9jdW1lbnRzL2Rldi92ZWN0b3ItbWFwL3NyYy9nbC9nbF9nZW9tLmpzIiwiL1VzZXJzL2JjYW1wZXIvRG9jdW1lbnRzL2Rldi92ZWN0b3ItbWFwL3NyYy9nbC9nbF9tb2Rlcy5qcyIsIi9Vc2Vycy9iY2FtcGVyL0RvY3VtZW50cy9kZXYvdmVjdG9yLW1hcC9zcmMvZ2wvZ2xfcHJvZ3JhbS5qcyIsIi9Vc2Vycy9iY2FtcGVyL0RvY3VtZW50cy9kZXYvdmVjdG9yLW1hcC9zcmMvZ2wvZ2xfc2hhZGVycy5qcyIsIi9Vc2Vycy9iY2FtcGVyL0RvY3VtZW50cy9kZXYvdmVjdG9yLW1hcC9zcmMvZ2wvZ2xfdGV4dHVyZS5qcyIsIi9Vc2Vycy9iY2FtcGVyL0RvY3VtZW50cy9kZXYvdmVjdG9yLW1hcC9zcmMvZ2wvZ2xfdmVydGV4X2xheW91dC5qcyIsIi9Vc2Vycy9iY2FtcGVyL0RvY3VtZW50cy9kZXYvdmVjdG9yLW1hcC9zcmMvbGVhZmxldF9sYXllci5qcyIsIi9Vc2Vycy9iY2FtcGVyL0RvY3VtZW50cy9kZXYvdmVjdG9yLW1hcC9zcmMvbW9kdWxlLmpzIiwiL1VzZXJzL2JjYW1wZXIvRG9jdW1lbnRzL2Rldi92ZWN0b3ItbWFwL3NyYy9wb2ludC5qcyIsIi9Vc2Vycy9iY2FtcGVyL0RvY3VtZW50cy9kZXYvdmVjdG9yLW1hcC9zcmMvc2NlbmUuanMiLCIvVXNlcnMvYmNhbXBlci9Eb2N1bWVudHMvZGV2L3ZlY3Rvci1tYXAvc3JjL3N0eWxlLmpzIiwiL1VzZXJzL2JjYW1wZXIvRG9jdW1lbnRzL2Rldi92ZWN0b3ItbWFwL3NyYy91dGlscy5qcyIsIi9Vc2Vycy9iY2FtcGVyL0RvY3VtZW50cy9kZXYvdmVjdG9yLW1hcC9zcmMvdmVjdG9yLmpzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUFBO0FDQUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUMveEhBO0FBQ0E7QUFDQTtBQUNB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LENBQUEsQ0FBQSxFQUFJLENBQUEsT0FBTSxPQUFPLENBQUcsQ0FBQSxDQUFBLEVBQUUsQ0FBRztBQUNuQyxBQUFJLFFBQUEsQ0FBQSxPQUFNLEVBQUksQ0FBQSxPQUFNLENBQUUsQ0FBQSxDQUFDLENBQUM7QUFFeEIsVUFBUyxHQUFBLENBQUEsQ0FBQSxFQUFFLEVBQUEsQ0FBRyxDQUFBLENBQUEsRUFBSSxDQUFBLE9BQU0sT0FBTyxFQUFJLEVBQUEsQ0FBRyxDQUFBLENBQUEsRUFBRSxDQUFHO0FBQ3ZDLEFBQUksVUFBQSxDQUFBLGFBQVksRUFBSSxHQUFDLENBQUM7QUFHdEIsb0JBQVksS0FBSyxBQUFDLENBRWQsQ0FBQyxPQUFNLENBQUUsQ0FBQSxFQUFFLEVBQUEsQ0FBQyxDQUFFLENBQUEsQ0FBQyxDQUFHLENBQUEsT0FBTSxDQUFFLENBQUEsRUFBRSxFQUFBLENBQUMsQ0FBRSxDQUFBLENBQUMsQ0FBRyxNQUFJLENBQUMsQ0FDeEMsRUFBQyxPQUFNLENBQUUsQ0FBQSxFQUFFLEVBQUEsQ0FBQyxDQUFFLENBQUEsQ0FBQyxDQUFHLENBQUEsT0FBTSxDQUFFLENBQUEsRUFBRSxFQUFBLENBQUMsQ0FBRSxDQUFBLENBQUMsQ0FBRyxNQUFJLENBQUMsQ0FDeEMsRUFBQyxPQUFNLENBQUUsQ0FBQSxDQUFDLENBQUUsQ0FBQSxDQUFDLENBQUcsQ0FBQSxPQUFNLENBQUUsQ0FBQSxDQUFDLENBQUUsQ0FBQSxDQUFDLENBQUcsTUFBSSxDQUFDLENBRXBDLEVBQUMsT0FBTSxDQUFFLENBQUEsQ0FBQyxDQUFFLENBQUEsQ0FBQyxDQUFHLENBQUEsT0FBTSxDQUFFLENBQUEsQ0FBQyxDQUFFLENBQUEsQ0FBQyxDQUFHLE1BQUksQ0FBQyxDQUNwQyxFQUFDLE9BQU0sQ0FBRSxDQUFBLENBQUMsQ0FBRSxDQUFBLENBQUMsQ0FBRyxDQUFBLE9BQU0sQ0FBRSxDQUFBLENBQUMsQ0FBRSxDQUFBLENBQUMsQ0FBRyxNQUFJLENBQUMsQ0FDcEMsRUFBQyxPQUFNLENBQUUsQ0FBQSxFQUFFLEVBQUEsQ0FBQyxDQUFF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QyxDQUFFLENBQUEsQ0FBQyxFQUFJLENBQUEsS0FBSSxDQUFFLENBQUEsQ0FBQyxFQUFJLE1BQUksQ0FBQSxDQUFFLEVBQUEsQ0FBRyxDQUFBLEVBQUMsQ0FBRSxDQUFBLENBQUMsRUFBSSxDQUFBLEtBQUksQ0FBRSxDQUFBLENBQUMsRUFBSSxNQUFJLENBQUEsQ0FBRSxFQUFBLENBQUMsQ0FBQztBQUN2RSxBQUFJLE1BQUEsQ0FBQSxRQUFPLEVBQUksRUFBQyxFQUFDLENBQUUsQ0FBQSxDQUFDLEVBQUksQ0FBQSxLQUFJLENBQUUsQ0FBQSxDQUFDLEVBQUksTUFBSSxDQUFBLENBQUUsRUFBQSxDQUFHLENBQUEsRUFBQyxDQUFFLENBQUEsQ0FBQyxFQUFJLENBQUEsS0FBSSxDQUFFLENBQUEsQ0FBQyxFQUFJLE1BQUksQ0FBQSxDQUFFLEVBQUEsQ0FBQyxDQUFDO0FBRXZFLEFBQUksTUFBQSxDQUFBLFFBQU8sRUFBSSxFQUFDLEVBQUMsQ0FBRSxDQUFBLENBQUMsRUFBSSxDQUFBLEtBQUksQ0FBRSxDQUFBLENBQUMsRUFBSSxNQUFJLENBQUEsQ0FBRSxFQUFBLENBQUcsQ0FBQSxFQUFDLENBQUUsQ0FBQSxDQUFDLEVBQUksQ0FBQSxLQUFJLENBQUUsQ0FBQSxDQUFDLEVBQUksTUFBSSxDQUFBLENBQUUsRUFBQSxDQUFDLENBQUM7QUFDdkUsQUFBSSxNQUFBLENBQUEsUUFBTyxFQUFJLEVBQUMsRUFBQyxDQUFFLENBQUEsQ0FBQyxFQUFJLENBQUEsS0FBSSxDQUFFLENBQUEsQ0FBQyxFQUFJLE1BQUksQ0FBQSxDQUFFLEVBQUEsQ0FBRyxDQUFBLEVBQUMsQ0FBRSxDQUFBLENBQUMsRUFBSSxDQUFBLEtBQUksQ0FBRSxDQUFBLENBQUMsRUFBSSxNQUFJLENBQUEsQ0FBRSxFQUFBLENBQUMsQ0FBQztBQUV2RSxXQUFPLEtBQUssQUFBQyxDQUNULFFBQU8sQ0FBRyxTQUFPLENBQUcsU0FBTyxDQUMzQixTQUFPLENBQUcsU0FBTyxDQUFHLFNBQU8sQ0FDL0IsQ0FBQztFQUNMO0FBQUEsQUFJQSxTQUFTLFlBQVUsQ0FBRyxFQUFDLENBQUcsQ0FBQSxLQUFJLENBQUcsQ0FBQSxFQUFDLENBQUc7QUFFakMsQUFBSSxNQUFBLENBQUEsUUFBTyxFQUFJLENBQUEsTUFBSyxVQUFVLEFBQUMsQ0FBQyxDQUFDLENBQUMsS0FBSSxDQUFFLENBQUEsQ0FBQyxFQUFJLENBQUEsRUFBQyxDQUFFLENBQUEsQ0FBQyxDQUFDLEVBQUksRUFBQyxDQUFBLENBQUcsQ0FBQSxLQUFJLENBQUUsQ0FBQSxDQUFDLEVBQUksQ0FBQSxFQUFDLENBQUUsQ0FBQSxDQUFDLENBQUMsQ0FBQyxDQUFDO0FBQzVFLEFBQUksTUFBQSxDQUFBLFFBQU8sRUFBSSxFQUNYLENBQUMsRUFBQyxDQUFFLENBQUEsQ0FBQyxFQUFJLENBQUEsUUFBTyxDQUFFLENBQUEsQ0FBQyxFQUFJLE1BQUksQ0FBQSxDQUFFLEVBQUEsQ0FBRyxDQUFBLEVBQUMsQ0FBRSxDQUFBLENBQUMsRUFBSSxDQUFBLFFBQU8sQ0FBRSxDQUFBLENBQUMsRUFBSSxNQUFJLENBQUEsQ0FBRSxFQUFBLENBQUMsQ0FDN0QsRUFBQyxLQUFJLENBQUUsQ0FBQSxDQUFDLEVBQUksQ0FBQSxRQUFPLENBQUUsQ0FBQSxDQUFDLEVBQUksTUFBSSxDQUFBLENBQUUsRUFBQSxDQUFHLENBQUEsS0FBSSxDQUFFLENBQUEsQ0FBQyxFQUFJLENBQUEsUUFBTyxDQUFFLENBQUEsQ0FBQyxFQUFJLE1BQUksQ0FBQSxDQUFFLEVBQUEsQ0FBQyxDQUN2RSxDQUFDO0FBQ0QsQUFBSSxNQUFBLENBQUEsUUFBTyxFQUFJLEVBQ1gsQ0FBQyxFQUFDLENBQUUsQ0FBQSxDQUFDLEVBQUksQ0FBQSxRQUFPLENBQUUsQ0FBQSxDQUFDLEVBQUksTUFBSSxDQUFBLENBQUUsRUFBQSxDQUFHLENBQUEsRUFBQyxDQUFFLENBQUEsQ0FBQyxFQUFJLENBQUEsUUFBTyxDQUFFLENBQUEsQ0FBQyxFQUFJLE1BQUksQ0FBQSxDQUFFLEVBQUEsQ0FBQyxDQUM3RCxFQUFDLEtBQUksQ0FBRSxDQUFBLENBQUMsRUFBSSxDQUFBLFFBQU8sQ0FBRSxDQUFBLENBQUMsRUFBSSxNQUFJLENBQUEsQ0FBRSxFQUFBLENBQUcsQ0FBQSxLQUFJLENBQUUsQ0FBQSxDQUFDLEVBQUksQ0FBQSxRQUFPLENBQUUsQ0FBQSxDQUFDLEVBQUksTUFBSSxDQUFBLENBQUUsRUFBQSxDQUFDLENBQ3ZFLENBQUM7QUFFRCxBQUFJLE1BQUEsQ0FBQSxRQUFPLEVBQUksQ0FBQSxNQUFLLFVBQVUsQUFBQyxDQUFDLENBQUMsQ0FBQyxFQUFDLENBQUUsQ0FBQSxDQUFDLEVBQUksQ0FBQSxLQUFJLENBQUUsQ0FBQSxDQUFDLENBQUMsRUFBSSxFQUFDLENBQUEsQ0FBRyxDQUFBLEVBQUMsQ0FBRSxDQUFBLENBQUMsRUFBSSxDQUFBLEtBQUksQ0FBRSxDQUFBLENBQUMsQ0FBQyxDQUFDLENBQUM7QUFDNUUsQUFBSSxNQUFBLENBQUEsUUFBTyxFQUFJLEVBQ1gsQ0FBQyxLQUFJLENBQUUsQ0FBQSxDQUFDLEVBQUksQ0FBQSxRQUFPLENBQUUsQ0FBQSxDQUFDLEVBQUksTUFBSSxDQUFBLENBQUUsRUFBQSxDQUFHLENBQUEsS0FBSSxDQUFFLENBQUEsQ0FBQyxFQUFJLENBQUEsUUFBTyxDQUFFLENBQUEsQ0FBQyxFQUFJLE1BQUksQ0FBQSxDQUFFLEVBQUEsQ0FBQyxDQUNuRSxFQUFDLEVBQUMsQ0FBRSxDQUFBLENBQUMsRUFBSSxDQUFBLFFBQU8sQ0FBRSxDQUFBLENBQUMsRUFBSSxNQUFJLENBQUEsQ0FBRSxFQUFBLENBQUcsQ0FBQSxFQUFDLENBQUUsQ0FBQSxDQUFDLEVBQUksQ0FBQSxRQUFPLENBQUUsQ0FBQSxDQUFDLEVBQUksTUFBSSxDQUFBLENBQUUsRUFBQSxDQUFDLENBQ2pFLENBQUM7QUFDRCxBQUFJLE1BQUEsQ0FBQSxRQUFPLEVBQUksRUFDWCxDQUFDLEtBQUksQ0FBRSxDQUFBLENBQUMsRUFBSSxDQUFBLFFBQU8sQ0FBRSxDQUFBLENBQUMsRUFBSSxNQUFJLENBQUEsQ0FBRSxFQUFBLENBQUcsQ0FBQSxLQUFJLENBQUUsQ0FBQSxDQUFDLEVBQUksQ0FB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NUQsQ0FBQSxRQUFPLENBQUUsQ0FBQSxDQUFDLENBQUUsQ0FBQSxDQUFDLENBQUcsQ0FBQSxRQUFPLENBQUUsQ0FBQSxDQUFDLENBQUUsQ0FBQSxDQUFDLENBQUcsQ0FBQSxDQUFBLEVBQUksTUFBSSxDQUFHLEVBQUEsQ0FBRyxFQUFBLENBQUcsRUFBQSxDQUFHLEVBQUEsQ0FBRyxJQUFFLENBQUcsRUFBQSxDQUM1RCxDQUFBLFFBQU8sQ0FBRSxDQUFBLENBQUMsQ0FBRSxDQUFBLENBQUMsQ0FBRyxDQUFBLFFBQU8sQ0FBRSxDQUFBLENBQUMsQ0FBRSxDQUFBLENBQUMsQ0FBRyxDQUFBLENBQUEsRUFBSSxNQUFJLENBQUcsRUFBQSxDQUFHLEVBQUEsQ0FBRyxFQUFBLENBQUcsRUFBQSxDQUFHLElBQUUsQ0FBRyxFQUFBLENBRTVELENBQUEsUUFBTyxDQUFFLENBQUEsQ0FBQyxDQUFFLENBQUEsQ0FBQyxDQUFHLENBQUEsUUFBTyxDQUFFLENBQUEsQ0FBQyxDQUFFLENBQUEsQ0FBQyxDQUFHLENBQUEsQ0FBQSxFQUFJLE1BQUksQ0FBRyxFQUFBLENBQUcsRUFBQSxDQUFHLEVBQUEsQ0FBRyxFQUFBLENBQUcsSUFBRSxDQUFHLEVBQUEsQ0FDNUQsQ0FBQSxRQUFPLENBQUUsQ0FBQSxDQUFDLENBQUUsQ0FBQSxDQUFDLENBQUcsQ0FBQSxRQUFPLENBQUUsQ0FBQSxDQUFDLENBQUUsQ0FBQSxDQUFDLENBQUcsQ0FBQSxDQUFBLEVBQUksTUFBSSxDQUFHLEVBQUEsQ0FBRyxFQUFBLENBQUcsRUFBQSxDQUFHLEVBQUEsQ0FBRyxJQUFFLENBQUcsRUFBQSxDQUU1RCxDQUFBLFFBQU8sQ0FBRSxDQUFBLENBQUMsQ0FBRSxDQUFBLENBQUMsQ0FBRyxDQUFBLFFBQU8sQ0FBRSxDQUFBLENBQUMsQ0FBRSxDQUFBLENBQUMsQ0FBRyxDQUFBLENBQUEsRUFBSSxNQUFJLENBQUcsRUFBQSxDQUFHLEVBQUEsQ0FBRyxFQUFBLENBQUcsRUFBQSxDQUFHLElBQUUsQ0FBRyxFQUFBLENBQzVELENBQUEsUUFBTyxDQUFFLENBQUEsQ0FBQyxDQUFFLENBQUEsQ0FBQyxDQUFHLENBQUEsUUFBTyxDQUFFLENBQUEsQ0FBQyxDQUFFLENBQUEsQ0FBQyxDQUFHLENBQUEsQ0FBQSxFQUFJLE1BQUksQ0FBRyxFQUFBLENBQUcsRUFBQSxDQUFHLEVBQUEsQ0FBRyxFQUFBLENBQUcsSUFBRSxDQUFHLEVBQUEsQ0FFNUQsQ0FBQSxRQUFPLENBQUUsQ0FBQSxDQUFDLENBQUUsQ0FBQSxDQUFDLENBQUcsQ0FBQSxRQUFPLENBQUUsQ0FBQSxDQUFDLENBQUUsQ0FBQSxDQUFDLENBQUcsQ0FBQSxDQUFBLEVBQUksTUFBSSxDQUFHLEVBQUEsQ0FBRyxFQUFBLENBQUcsRUFBQSxDQUFHLEVBQUEsQ0FBRyxJQUFFLENBQUcsRUFBQSxDQUM1RCxDQUFBLFFBQU8sQ0FBRSxDQUFBLENBQUMsQ0FBRSxDQUFBLENBQUMsQ0FBRyxDQUFBLFFBQU8sQ0FBRSxDQUFBLENBQUMsQ0FBRSxDQUFBLENBQUMsQ0FBRyxDQUFBLENBQUEsRUFBSSxNQUFJLENBQUcsRUFBQSxDQUFHLEVBQUEsQ0FBRyxFQUFBLENBQUcsRUFBQSxDQUFHLElBQUUsQ0FBRyxFQUFBLENBRTVELENBQUEsUUFBTyxDQUFFLENBQUEsQ0FBQyxDQUFFLENBQUEsQ0FBQyxDQUFHLENBQUEsUUFBTyxDQUFFLENBQUEsQ0FBQyxDQUFFLENBQUEsQ0FBQyxDQUFHLENBQUEsQ0FBQSxFQUFJLE1BQUksQ0FBRyxFQUFBLENBQUcsRUFBQSxDQUFHLEVBQUEsQ0FBRyxFQUFBLENBQUcsSUFBRSxDQUFHLEVBQUEsQ0FDNUQsQ0FBQSxRQUFPLENBQUUsQ0FBQSxDQUFDLENBQUUsQ0FBQSxDQUFDLENBQUcsQ0FBQSxRQUFPLENBQUUsQ0FBQSxDQUFDLENBQUUsQ0FBQSxDQUFDLENBQUcsQ0FBQSxDQUFBLEVBQUksTUFBSSxDQUFHLEVBQUEsQ0FBRyxFQUFBLENBQUcsRUFBQSxDQUFHLEVBQUEsQ0FBRyxJQUFFLENBQUcsRUFBQSxDQUU1RCxDQUFBLFFBQU8sQ0FBRSxDQUFBLENBQUMsQ0FBRSxDQUFBLENBQUMsQ0FBRyxDQUFBLFFBQU8sQ0FBRSxDQUFBLENBQUMsQ0FBRSxDQUFBLENBQUMsQ0FBRyxDQUFBLENBQUEsRUFBSSxNQUFJLENBQUcsRUFBQSxDQUFHLEVBQUEsQ0FBRyxFQUFBLENBQUcsRUFBQSxDQUFHLElBQUUsQ0FBRyxFQUFBLENBQzVELENBQUEsUUFBTyxDQUFFLENBQUEsQ0FBQyxDQUFFLENBQUEsQ0FBQyxDQUFHLENBQUEsUUFBTyxDQUFFLENBQUEsQ0FBQyxDQUFFLENBQUEsQ0FBQyxDQUFHLENBQUEsQ0FBQSxFQUFJLE1BQUksQ0FBRyxFQUFBLENBQUcsRUFBQSxDQUFHLEVBQUEsQ0FBRyxFQUFBLENBQUcsSUFBRSxDQUFHLEVBQUEsQ0FFNUQsQ0FBQSxRQUFPLENBQUUsQ0FBQSxDQUFDLENBQUUsQ0FBQSxDQUFDLENBQUcsQ0FBQSxRQUFPLENBQUUsQ0FBQSxDQUFDLENBQUUsQ0FBQSxDQUFDLENBQUcsQ0FBQSxDQUFBLEVBQUksTUFBSSxDQUFHLEVBQUEsQ0FBRyxFQUFBLENBQUcsRUFBQSxDQUFHLEVBQUEsQ0FBRyxJQUFFLENBQUcsRUFBQSxDQUM1RCxDQUFBLFFBQU8sQ0FBRSxDQUFBLENBQUMsQ0FBRSxDQUFBLENBQUMsQ0FBRyxDQUFBLFFBQU8sQ0FBRSxDQUFBLENBQUMsQ0FBRSxDQUFBLENBQUMsQ0FBRyxDQUFBLENBQUEsRUFBSSxNQUFJLENBQUcsRUFBQSxDQUFHLEVBQUEsQ0FBRyxFQUFBLENBQUcsRUFBQSxDQUFHLElBQUUsQ0FBRyxFQUFBLENBQ2hFLENBQUM7SUFDTDtBQUFBLEFBRUEsT0FBSSxVQUFTLE1BQU0sR0FBSyxXQUFTLENBQUEsRUFBSyxDQUFBLE9BQU0sYUFBYSxDQUFHO0FBQ3hELEFBQUksUUFBQSxDQUFBLE1BQUssQ0FBQztBQUNWLFNBQUksVUFBUyxHQUFLLFdBQVMsQ0FBRztBQUUxQixhQUFLLEVBQUksRUFBQyxDQUFBLENBQUcsRUFBQSxDQUFHLEVBQUEsQ0FBQyxDQUFDO01BQ3RCLEtBQ0ssS0FBSSxVQUFTLEdBQUssV0FBUyxDQUFHO0FBRS9CLGFBQUssRUFBSSxFQUFDLENBQUEsQ0FBRyxFQUFBLENBQUcsRUFBQSxDQUFDLENBQUM7TUFDdEI7QUFBQSxBQUlBLFlBQU0sYUFBYSxLQUFLLEFBQUMsQ0FDckIsRUFBQyxDQUFFLENBQUEsQ0FBQyxDQUFHLENBQUEsRUFBQyxDQUFFLENBQUEsQ0FBQyxDQUFHLENBQUEsQ0FBQSxFQUFJLE1BQUksQ0FDdEIsRUFBQSxDQUFHLEVBQUEsQ0FBRyxFQUFBLENBQUcsQ0FBQSxNQUFLLENBQUUsQ0FBQSxDQUFDLENBQUcsQ0FBQSxNQUFLLENBQUUsQ0FBQSxDQUFDLENBQUcsQ0FBQSxNQUFLLENBQUUsQ0FBQSxDQUFDLENBQ3ZDLENBQUEsS0FBSSxDQUFFLENBQUEsQ0FBQyxDQUFHLENBQUEsS0FBSSxDQUFFLENBQUEsQ0FBQyxDQUFHLENBQUEsQ0FBQSxFQUFJLE1BQUksQ0FDNUIsRUFBQSxDQUFHLEVBQUEsQ0FBRyxFQUFBLENBQUcsQ0FBQSxNQUFLLENBQUUsQ0FBQSxDQUFDLENBQUcsQ0FBQSxNQUFLLENBQUUsQ0FBQSxDQUFDLENBQUcsQ0FBQSxNQUFLLENBQUUsQ0FBQSxDQUFDLENBQ3ZDLENBQUEsS0FBSSxDQUFFLENBQUEsQ0FBQyxDQUFHLENBQUEsS0FBSSxDQUFFLENBQUEsQ0FBQyxDQUFHLENBQUEsQ0FBQSxFQUFJLE1BQUksQ0FDNUIsRUFBQSxDQUFHLEVBQUEsQ0FBRyxFQUFBLENBQUcsQ0FBQSxNQUFLLENBQUUsQ0FBQSxDQUFDLENBQUcsQ0FBQSxNQUFLLENBQUUsQ0FBQSxDQUFDLENBQUcsQ0FBQSxNQUFLLENBQUUsQ0FBQSxDQUFDLENBQ3ZDLENBQUEsRUFBQyxDQUFFLENBQUEsQ0FBQyxDQUFHLENBQUEsRUFBQyxDQUFFLENBQUEsQ0FBQyxDQUFHLENBQUEsQ0FBQSxFQUFJLE1BQUksQ0FDdEIsRUFBQSxDQUFHLEVBQUEsQ0FBRyxFQUFBLENBQUcsQ0FBQSxNQUFLLENBQUUsQ0FBQSxDQUFDLENBQUcsQ0FBQSxNQUFLLENBQUUsQ0FBQSxDQUFDLENBQUcsQ0FBQSxNQUFLLENBQUUs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LEdBQUUsRUFBRSxFQUFJLEtBQUcsQ0FBQSxDQUFJLENBQUEsR0FBRSxFQUFFLEVBQUksS0FBRyxDQUFHLENBQUEsR0FBRSxFQUFFLEVBQUksS0FBRyxDQUFBLENBQUksQ0FBQSxHQUFFLEVBQUUsRUFBSSxLQUFHLENBQUMsQ0FDekQsRUFBQyxHQUFFLEVBQUUsRUFBSSxLQUFHLENBQUEsQ0FBSSxDQUFBLEdBQUUsRUFBRSxFQUFJLEtBQUcsQ0FBRyxDQUFBLEdBQUUsRUFBRSxFQUFJLElBQUUsQ0FBQSxDQUFJLENBQUEsR0FBRSxFQUFFLEVBQUksSUFBRSxDQUFDLENBQ3ZELEVBQUMsR0FBRSxFQUFFLEVBQUksS0FBRyxDQUFBLENBQUksQ0FBQSxHQUFFLEVBQUUsRUFBSSxLQUFHLENBQUcsQ0FBQSxHQUFFLEVBQUUsRUFBSSxLQUFHLENBQUEsQ0FBSSxDQUFBLEdBQUUsRUFBRSxFQUFJLEtBQUcsQ0FBQyxDQUN6RCxFQUFDLEdBQUUsRUFBRSxFQUFJLEtBQUcsQ0FBQSxDQUFJLENBQUEsR0FBRSxFQUFFLEVBQUksS0FBRyxDQUFHLENBQUEsR0FBRSxFQUFFLEVBQUksS0FBRyxDQUFBLENBQUksQ0FBQSxHQUFFLEVBQUUsRUFBSSxLQUFHLENBQUMsQ0FDekQsRUFBQyxHQUFFLEVBQUUsRUFBSSxJQUFFLENBQUEsQ0FBSSxDQUFBLEdBQUUsRUFBRSxFQUFJLElBQUUsQ0FBRyxDQUFBLEdBQUUsRUFBRSxFQUFJLElBQUUsQ0FBQSxDQUFJLENBQUEsR0FBRSxFQUFFLEVBQUksSUFBRSxDQUFDLENBQ3JELEVBQUMsR0FBRSxFQUFFLEVBQUksSUFBRSxDQUFBLENBQUksQ0FBQSxHQUFFLEVBQUUsRUFBSSxJQUFFLENBQUcsQ0FBQSxHQUFFLEVBQUUsRUFBSSxLQUFHLENBQUEsQ0FBSSxDQUFBLEdBQUUsRUFBRSxFQUFJLEtBQUcsQ0FBQyxDQUN2RCxFQUFDLEdBQUUsRUFBRSxFQUFJLEtBQUcsQ0FBQSxDQUFJLENBQUEsR0FBRSxFQUFFLEVBQUksS0FBRyxDQUFHLENBQUEsR0FBRSxFQUFFLEVBQUksS0FB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QVUsUUFBUSxNQUFNLFFBQVEsQ0FBQyxDQUFDLEdBQUssQ0FBQSxLQUFJLFNBQVMsUUFBUSxNQUFNLENBQUM7QUFDOUssS0FBSSxNQUFPLE1BQUksUUFBUSxNQUFNLENBQUEsRUFBSyxXQUFTLENBQUc7QUFDMUMsUUFBSSxRQUFRLE1BQU0sRUFBSSxDQUFBLEtBQUksUUFBUSxNQUFNLEFBQUMsQ0FBQyxPQUFNLENBQUcsS0FBRyxDQUFHLENBQUEsS0FBSSxRQUFRLENBQUMsQ0FBQztFQUMzRTtBQUFBLEFBRUEsTUFBSSxRQUFRLE1BQU0sRUFBSSxDQUFBLENBQUMsV0FBVSxRQUFRLE1BQU0sR0FBSyxFQUFDLFdBQVUsUUFBUSxNQUFNLENBQUUsT0FBTSxXQUFXLEtBQUssQ0FBQyxHQUFLLENBQUEsV0FBVSxRQUFRLE1BQU0sUUFBUSxDQUFDLENBQUMsR0FBSyxDQUFBLEtBQUksU0FBUyxRQUFRLE1BQU0sQ0FBQztBQUM5SyxLQUFJLE1BQU8sTUFBSSxRQUFRLE1BQU0sQ0FBQSxFQUFLLFdBQVMsQ0FBRztBQUMxQyxRQUFJLFFBQVEsTUFBTSxFQUFJLENBQUEsS0FBSSxRQUFRLE1BQU0sQUFBQyxDQUFDLE9BQU0sQ0FBRyxLQUFHLENBQUcsQ0FBQSxLQUFJLFFBQVEsQ0FBQyxDQUFDO0VBQzNFO0FBQUEsQUFDQSxNQUFJLFFBQVEsTUFBTSxHQUFLLENBQUEsR0FBRSxnQkFBZ0IsQ0FBRSxJQUFHLE9BQU8sRUFBRSxDQUFDLENBQUM7QUFFekQsTUFBSSxRQUFRLEtBQUssRUFBSSxDQUFBLENBQUMsV0FBVSxRQUFRLEtBQUssR0FBSyxFQUFDLFdBQVUsUUFBUSxLQUFLLENBQUUsT0FBTSxXQUFXLEtBQUssQ0FBQyxHQUFLLENBQUEsV0FBVSxRQUFRLEtBQUssUUFBUSxDQUFDLENBQUMsR0FBSyxDQUFBLEtBQUksU0FBUyxRQUFRLEtBQUssQ0FBQztBQUN6SyxLQUFJLE1BQU8sTUFBSSxRQUFRLEtBQUssQ0FBQSxFQUFLLFdBQVMsQ0FBRztBQUN6QyxRQUFJLFFBQVEsS0FBSyxFQUFJLENBQUEsS0FBSSxR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QyxDQUFFLENBQUEsQ0FBQyxFQUFJLENBQUEsRUFBQyxDQUFFLENBQUEsQ0FBQyxDQUFDLEVBQUksRUFBQyxFQUFDLENBQUUsQ0FBQSxDQUFDLEVBQUksQ0FBQSxFQUFDLENBQUUsQ0FBQSxDQUFDLENBQUMsQ0FDcEMsQ0FBQztBQUNMLENBQUM7QUFLRCxLQUFLLGlCQUFpQixFQUFJLFVBQVUsRUFBQyxDQUFHLENBQUEsRUFBQyxDQUFHLENBQUEsRUFBQyxDQUFHLENBQUEsRUFBQyxDQUFHLENBQUEsa0JBQWlCLENBQ3JFO0FBQ0ksQUFBSSxJQUFBLENBQUEsa0JBQWlCLEVBQUksQ0FBQSxrQkFBaUIsR0FBSyxLQUFHLENBQUM7QUFJbkQsQUFBSSxJQUFBLENBQUEsRUFBQyxFQUFJLENBQUEsRUFBQyxDQUFFLENBQUEsQ0FBQyxFQUFJLENBQUEsRUFBQyxDQUFFLENBQUEsQ0FBQyxDQUFDO0FBQ3RCLEFBQUksSUFBQSxDQUFBLEVBQUMsRUFBSSxDQUFBLEVBQUMsQ0FBRSxDQUFBLENBQUMsRUFBSSxDQUFBLEVBQUMsQ0FBRSxDQUFBLENBQUMsQ0FBQztBQUN0QixBQUFJLElBQUEsQ0FBQSxFQUFDLEVBQUksQ0FBQSxFQUFDLENBQUUsQ0FBQSxDQUFDLEVBQUksQ0FBQSxFQUFDLENBQUUsQ0FBQSxDQUFDLENBQUM7QUFDdEIsQUFBSSxJQUFBLENBQUEsRUFBQyxFQUFJLENBQUEsRUFBQyxDQUFFLENBQUEsQ0FBQyxFQUFJLENBQUEsRUFBQyxDQUFFLENBQUEsQ0FBQyxDQUFDO0FBQ3RCLEFBQUksSUFBQSxDQUFBLEVBQUMsRUFBSSxDQUFBLENBQUMsRUFBQyxDQUFFLENBQUEsQ0FBQyxFQUFJLENBQUEsRUFBQyxDQUFFLENBQUEsQ0FBQyxDQUFDLEVBQUksRUFBQyxFQUFDLENBQUUsQ0FBQSxDQUFDLEVBQUksQ0FBQSxFQUFDLENBQUUsQ0FBQSxDQUFDLENBQUMsQ0FBQztBQUMxQyxBQUFJLElBQUEsQ0FBQSxFQUFDLEVBQUksQ0FBQSxDQUFDLEVBQUMsQ0FBRSxDQUFBLENBQUMsRUFBSSxDQUFBLEVBQUMsQ0FBRSxDQUFBLENBQUMsQ0FBQyxFQUFJLEVBQUMsRUFBQyxDQUFFLENBQUEsQ0FBQyxFQUFJLENBQUEsRUFBQyxDQUFFLENBQUEsQ0FBQyxDQUFDLENBQUM7QUFDMUMsQUFBSSxJQUFBLENBQUEsS0FBSSxFQUFJLENBQUEsQ0FBQyxFQUFDLEVBQUksR0FBQyxDQUFDLEVBQUksRUFBQyxFQUFDLEVBQUksR0FBQyxDQUFDLENBQUM7QUFFakMsS0FBSSxJQUFHLElBQUksQUFBQyxDQUFDLEtBQUksQ0FBQyxDQUFBLENBQUksbUJBQWlCLENBQUc7QUFDdEMsU0FBTyxFQUNILENBQUMsQ0FBQyxFQUFDLEVBQUksR0FBQyxDQUFDLEVBQUksRUFBQyxFQUFDLEVBQUksR0FBQyxDQUFDLENBQUMsRUFBSSxNQUFJLENBQzlCLENBQUEsQ0FBQyxDQUFDLEVBQUMsRUFBSSxHQUFDLENBQUMsRUFBSSxFQUFDLEVBQUMsRUFBSSxHQUFDLENBQUMsQ0FBQyxFQUFJLE1BQUksQ0FDbEMsQ0FBQztFQUNMO0FBQUEsQUFDQSxPQUFPLEtBQUcsQ0FBQztBQUNmLENBQUM7QUFDRCIsImZpbGUiOiJnZW5lcmF0ZWQuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlc0NvbnRlbnQiOlsiKGZ1bmN0aW9uIGUodCxuLHIpe2Z1bmN0aW9uIHMobyx1KXtpZighbltvXSl7aWYoIXRbb10pe3ZhciBhPXR5cGVvZiByZXF1aXJlPT1cImZ1bmN0aW9uXCImJnJlcXVpcmU7aWYoIXUmJmEpcmV0dXJuIGEobywhMCk7aWYoaSlyZXR1cm4gaShvLCEwKTt0aHJvdyBuZXcgRXJyb3IoXCJDYW5ub3QgZmluZCBtb2R1bGUgJ1wiK28rXCInXCIpfXZhciBmPW5bb109e2V4cG9ydHM6e319O3Rbb11bMF0uY2FsbChmLmV4cG9ydHMsZnVuY3Rpb24oZSl7dmFyIG49dFtvXVsxXVtlXTtyZXR1cm4gcyhuP246ZSl9LGYsZi5leHBvcnRzLGUsdCxuLHIpfXJldHVybiBuW29dLmV4cG9ydHN9dmFyIGk9dHlwZW9mIHJlcXVpcmU9PVwiZnVuY3Rpb25cIiYmcmVxdWlyZTtmb3IodmFyIG89MDtvPHIubGVuZ3RoO28rKylzKHJbb10pO3JldHVybiBzfSkiLCIvKipcbiAqIEBmaWxlb3ZlcnZpZXcgZ2wtbWF0cml4IC0gSGlnaCBwZXJmb3JtYW5jZSBtYXRyaXggYW5kIHZlY3RvciBvcGVyYXRpb25zXG4gKiBAYXV0aG9yIEJyYW5kb24gSm9uZXNcbiAqIEBhdXRob3IgQ29saW4gTWFjS2VuemllIElWXG4gKiBAdmVyc2lvbiAyLjEuMFxuICovXG5cbi8qIENvcHlyaWdodCAoYykgMjAxMywgQnJhbmRvbiBKb25lcywgQ29saW4gTWFjS2VuemllIElWLiBBbGwgcmlnaHRzIHJlc2VydmVkLlxuXG5SZWRpc3RyaWJ1dGlvbiBhbmQgdXNlIGluIHNvdXJjZSBhbmQgYmluYXJ5IGZvcm1zLCB3aXRoIG9yIHdpdGhvdXQgbW9kaWZpY2F0aW9uLFxuYXJlIHBlcm1pdHRlZCBwcm92aWRlZCB0aGF0IHRoZSBmb2xsb3dpbmcgY29uZGl0aW9ucyBhcmUgbWV0OlxuXG4gICogUmVkaXN0cmlidXRpb25zIG9mIHNvdXJjZSBjb2RlIG11c3QgcmV0YWluIHRoZSBhYm92ZSBjb3B5cmlnaHQgbm90aWNlLCB0aGlzXG4gICAgbGlzdCBvZiBjb25kaXRpb25zIGFuZCB0aGUgZm9sbG93aW5nIGRpc2NsYWltZXIuXG4gICogUmVkaXN0cmlidXRpb25zIGluIGJpbmFyeSBmb3JtIG11c3QgcmVwcm9kdWNlIHRoZSBhYm92ZSBjb3B5cmlnaHQgbm90aWNlLFxuICAgIHRoaXMgbGlzdCBvZiBjb25kaXRpb25zIGFuZCB0aGUgZm9sbG93aW5nIGRpc2NsYWltZXIgaW4gdGhlIGRvY3VtZW50YXRpb24gXG4gICAgYW5kL29yIG90aGVyIG1hdGVyaWFscyBwcm92aWRlZCB3aXRoIHRoZSBkaXN0cmlidXRpb24uXG5cblRISVMgU09GVFdBUkUgSVMgUFJPVklERUQgQlkgVEhFIENPUFlSSUdIVCBIT0xERVJTIEFORCBDT05UUklCVVRPUlMgXCJBUyBJU1wiIEFORFxuQU5ZIEVYUFJFU1MgT1IgSU1QTElFRCBXQVJSQU5USUVTLCBJTkNMVURJTkcsIEJVVCBOT1QgTElNSVRFRCBUTywgVEhFIElNUExJRURcbldBUlJBTlRJRVMgT0YgTUVSQ0hBTlRBQklMSVRZIEFORCBGSVRORVNTIEZPUiBBIFBBUlRJQ1VMQVIgUFVSUE9TRSBBUkUgXG5ESVNDTEFJTUVELiBJTiBOTyBFVkVOVCBTSEFMTCBUSEUgQ09QWVJJR0hUIEhPTERFUiBPUiBDT05UUklCVVRPUlMgQkUgTElBQkxFIEZPUlxuQU5ZIERJUkVDVCwgSU5ESVJFQ1QsIElOQ0lERU5UQUwsIFNQRUNJQUwsIEVYRU1QTEFSWSwgT1IgQ09OU0VRVUVOVElBTCBEQU1BR0VTXG4oSU5DTFVESU5HLCBCVVQgTk9UIExJTUlURUQgVE8sIFBST0NVUkVNRU5UIE9GIFNVQlNUSVRVVEUgR09PRFMgT1IgU0VSVklDRVM7XG5MT1NTIE9GIFVTRSwgREFUQSwgT1IgUFJPRklUUzsgT1IgQlVTSU5FU1MgSU5URVJSVVBUSU9OKSBIT1dFVkVSIENBVVNFRCBBTkQgT05cbkFOWSBUSEVPUlkgT0YgTElBQklMSVRZLCBXSEVUSEVSIElOIENPTlRSQUNULCBTVFJJQ1QgTElBQklMSVRZLCBPUiBUT1JUXG4oSU5DTFVESU5HIE5FR0xJR0VOQ0UgT1IgT1RIRVJXSVNFKSBBUklTSU5HIElOIEFOWSBXQVkgT1VUIE9GIFRIRSBVU0UgT0YgVEhJU1xuU09GVFdBUkUsIEVWRU4gSUYgQURWSVNFRCBPRiBUSEUgUE9TU0lCSUxJVFkgT0YgU1VDSCBEQU1BR0UuICovXG5cblxuKGZ1bmN0aW9uKCkge1xuICBcInVzZSBzdHJpY3RcIjtcblxuICB2YXIgc2hpbSA9IHt9O1xuICBpZiAodHlwZW9mKGV4cG9ydHMpID09PSAndW5kZWZpbmVkJykge1xuICAgIGlmKHR5cGVvZiBkZWZpbmUgPT0gJ2Z1bmN0aW9uJyAmJiB0eXBlb2YgZGVmaW5lLmFtZCA9PSAnb2JqZWN0JyAmJiBkZWZpbmUuYW1kKSB7XG4gICAgICBzaGltLmV4cG9ydHMgPSB7fTtcbiAgICAgIGRlZmluZShmdW5jdGlvbigpIHtcbiAgICAgICAgcmV0dXJuIHNoaW0uZXhwb3J0cztcbiAgICAgIH0pO1xuICAgIH0gZWxzZSB7XG4gICAgICAvLyBnbC1tYXRyaXggbGl2ZXMgaW4gYSBicm93c2VyLCBkZWZpbmUgaXRzIG5hbWVzcGFjZXMgaW4gZ2xvYmFsXG4gICAgICBzaGltLmV4cG9ydHMgPSB3aW5kb3c7XG4gICAgfSAgICBcbiAgfVxuICBlbHNlIHtcbiAgICAvLyBnbC1tYXRyaXggbGl2ZXMgaW4gY29tbW9uanMsIGRlZmluZSBpdHMgbmFtZXNwYWNlcyBpbiBleHBvcnRzXG4gICAgc2hpbS5leHBvcnRzID0gZXhwb3J0cztcbiAgfVxuXG4gIChmdW5jdGlvbihleHBvcnRzKSB7XG4gICAgLyogQ29weXJpZ2h0IChjKSAyMDEzLCBCcmFuZG9uIEpvbmVzLCBDb2xpbiBNYWNLZW56aWUgSVYuIEFsbCByaWdodHMgcmVzZXJ2ZWQuXG5cblJlZGlzdHJpYnV0aW9uIGFuZCB1c2UgaW4gc291cmNlIGFuZCBiaW5hcnkgZm9ybXMsIHdpdGggb3Igd2l0aG91dCBtb2RpZmljYXRpb24sXG5hcmUgcGVybWl0dGVkIHByb3ZpZGVkIHRoYXQgdGhlIGZvbGxvd2luZyBjb25kaXRpb25zIGFyZSBtZXQ6XG5cbiAgKiBSZWRpc3RyaWJ1dGlvbnMgb2Ygc291cmNlIGNvZGUgbXVzdCByZXRhaW4gdGhlIGFib3ZlIGNvcHlyaWdodCBub3RpY2UsIHRoaXNcbiAgICBsaXN0IG9mIGNvbmRpdGlvbnMgYW5kIHRoZSBmb2xsb3dpbmcgZGlzY2xhaW1lci5cbiAgKiBSZWRpc3RyaWJ1dGlvbnMgaW4gYmluYXJ5IGZvcm0gbXVzdCByZXByb2R1Y2UgdGhlIGFib3ZlIGNvcHlyaWdodCBub3RpY2UsXG4gICAgdGhpcyBsaXN0IG9mIGNvbmRpdGlvbnMgYW5kIHRoZSBmb2xsb3dpbmcgZGlzY2xhaW1lciBpbiB0aGUgZG9jdW1lbnRhdGlvbiBcbiAgICBhbmQvb3Igb3RoZXIgbWF0ZXJpYWxzIHByb3ZpZGVkIHdpdGggdGhlIGRpc3RyaWJ1dGlvbi5cblxuVEhJUyBTT0ZUV0FSRSBJUyBQUk9WSURFRCBCWSBUSEUgQ09QWVJJR0hUIEhPTERFUlMgQU5EIENPTlRSSUJVVE9SUyBcIkFTIElTXCIgQU5EXG5BTlkgRVhQUkVTUyBPUiBJTVBMSUVEIFdBUlJBTlRJRVMsIElOQ0xVRElORywgQlVUIE5PVCBMSU1JVEVEIFRPLCBUSEUgSU1QTElFRFxuV0FSUkFOVElFUyBPRiBNRVJDSEFOVEFCSUxJVFkgQU5EIEZJVE5FU1MgRk9SIEEgUEFSVElDVUxBUiBQVVJQT1NFIEFSRSBcbkRJU0NMQUlNRUQuIElOIE5PIEVWRU5UIFNIQUxMIFRIRSBDT1BZUklHSFQgSE9MREVSIE9SIENPTlRSSUJVVE9SUyBCRSBMSUFCTEUgRk9SXG5BTlkgRElSRUNULCBJTkRJUkVDVCwgSU5DSURFTlRBTCwgU1BFQ0lBTCwgRVhFTVBMQVJZLCBPUiBDT05TRVFVRU5USUFMIERBTUFHRVNcbihJTkNMVURJTkcsIEJVVCBOT1QgTElNSVRFRCBUTywgUFJPQ1VSRU1FTlQgT0YgU1VCU1RJVFVURSBHT09EUyBPUiBTRVJWSUNFUztcbkxPU1MgT0YgVVNFLCBEQVRBLCBPUiBQUk9GSVRTOyBPUiBCVVNJTkVTUyBJTlRFUlJVUFRJT04pIEhPV0VWRVIgQ0FVU0VEIEFORCBPTlxuQU5ZIFRIRU9SWSBPRiBMSUFCSUxJVFksIFdIRVRIRVIgSU4gQ09OVFJBQ1QsIFNUUklDVCBMSUFCSUxJVFksIE9SIFRPUlRcbihJTkNMVURJTkcgTkVHTElHRU5DRSBPUiBPVEhFUldJU0UpIEFSSVNJTkcgSU4gQU5ZIFdBWSBPVVQgT0YgVEhFIFVTRSBPRiBUSElTXG5TT0ZUV0FSRSwgRVZFTiBJRiBBRFZJU0VEIE9GIFRIRSBQT1NTSUJJTElUWSBPRiBTVUNIIERBTUFHRS4gKi9cblxuXG5pZighR0xNQVRfRVBTSUxPTikge1xuICAgIHZhciBHTE1BVF9FUFNJTE9OID0gMC4wMDAwMDE7XG59XG5cbmlmKCFHTE1BVF9BUlJBWV9UWVBFKSB7XG4gICAgdmFyIEdMTUFUX0FSUkFZX1RZUEUgPSAodHlwZW9mIEZsb2F0MzJBcnJheSAhPT0gJ3VuZGVmaW5lZCcpID8gRmxvYXQzMkFycmF5IDogQXJyYXk7XG59XG5cbi8qKlxuICogQGNsYXNzIENvbW1vbiB1dGlsaXRpZXNcbiAqIEBuYW1lIGdsTWF0cml4XG4gKi9cbnZhciBnbE1hdHJpeCA9IHt9O1xuXG4vKipcbiAqIFNldHMgdGhlIHR5cGUgb2YgYXJyYXkgdXNlZCB3aGVuIGNyZWF0aW5nIG5ldyB2ZWN0b3JzIGFuZCBtYXRyaWNpZXNcbiAqXG4gKiBAcGFyYW0ge1R5cGV9IHR5cGUgQXJyYXkgdHlwZSwgc3VjaCBhcyBGbG9hdDMyQXJyYXkgb3IgQXJyYXlcbiAqL1xuZ2xNYXRyaXguc2V0TWF0cml4QXJyYXlUeXBlID0gZnVuY3Rpb24odHlwZSkge1xuICAgIEdMTUFUX0FSUkFZX1RZUEUgPSB0eXBlO1xufVxuXG5pZih0eXBlb2YoZXhwb3J0cykgIT09ICd1bmRlZmluZWQnKSB7XG4gICAgZXhwb3J0cy5nbE1hdHJpeCA9IGdsTWF0cml4O1xufVxuO1xuLyogQ29weXJpZ2h0IChjKSAyMDEzLCBCcmFuZG9uIEpvbmVzLCBDb2xpbiBNYWNLZW56aWUgSVYuIEFsbCByaWdodHMgcmVzZXJ2ZWQuXG5cblJlZGlzdHJpYnV0aW9uIGFuZCB1c2UgaW4gc291cmNlIGFuZCBiaW5hcnkgZm9ybXMsIHdpdGggb3Igd2l0aG91dCBtb2RpZmljYXRpb24sXG5hcmUgcGVybWl0dGVkIHByb3ZpZGVkIHRoYXQgdGhlIGZvbGxvd2luZyBjb25kaXRpb25zIGFyZSBtZXQ6XG5cbiAgKiBSZWRpc3RyaWJ1dGlvbnMgb2Ygc291cmNlIGNvZGUgbXVzdCByZXRhaW4gdGhlIGFib3ZlIGNvcHlyaWdodCBub3RpY2UsIHRoaXNcbiAgICBsaXN0IG9mIGNvbmRpdGlvbnMgYW5kIHRoZSBmb2xsb3dpbmcgZGlzY2xhaW1lci5cbiAgKiBSZWRpc3RyaWJ1dGlvbnMgaW4gYmluYXJ5IGZvcm0gbXVzdCByZXByb2R1Y2UgdGhlIGFib3ZlIGNvcHlyaWdodCBub3RpY2UsXG4gICAgdGhpcyBsaXN0IG9mIGNvbmRpdGlvbnMgYW5kIHRoZSBmb2xsb3dpbmcgZGlzY2xhaW1lciBpbiB0aGUgZG9jdW1lbnRhdGlvbiBcbiAgICBhbmQvb3Igb3RoZXIgbWF0ZXJpYWxzIHByb3ZpZGVkIHdpdGggdGhlIGRpc3RyaWJ1dGlvbi5cblxuVEhJUyBTT0ZUV0FSRSBJUyBQUk9WSURFRCBCWSBUSEUgQ09QWVJJR0hUIEhPTERFUlMgQU5EIENPTlRSSUJVVE9SUyBcIkFTIElTXCIgQU5EXG5BTlkgRVhQUkVTUyBPUiBJTVBMSUVEIFdBUlJBTlRJRVMsIElOQ0xVRElORywgQlVUIE5PVCBMSU1JVEVEIFRPLCBUSEUgSU1QTElFRFxuV0FSUkFOVElFUyBPRiBNRVJDSEFOVEFCSUxJVFkgQU5EIEZJVE5FU1MgRk9SIEEgUEFSVElDVUxBUiBQVVJQT1NFIEFSRSBcbkRJU0NMQUlNRUQuIElOIE5PIEVWRU5UIFNIQUxMIFRIRSBDT1BZUklHSFQgSE9MREVSIE9SIENPTlRSSUJVVE9SUyBCRSBMSUFCTEUgRk9SXG5BTlkgRElSRUNULCBJTkRJUkVDVCwgSU5DSURFTlRBTCwgU1BFQ0lBTCwgRVhFTVBMQVJZLCBPUiBDT05TRVFVRU5USUFMIERBTUFHRVNcbihJTkNMVURJTkcsIEJVVCBOT1QgTElNSVRFRCBUTywgUFJPQ1VSRU1FTlQgT0YgU1VCU1RJVFVURSBHT09EUyBPUiBTRVJWSUNFUztcbkxPU1MgT0YgVVNFLCBEQVRBLCBPUiBQUk9GSVRTOyBPUiBCVVNJTkVTUyBJTlRFUlJVUFRJT04pIEhPV0VWRVIgQ0FVU0VEIEFORCBPTlxuQU5ZIFRIRU9SWSBPRiBMSUFCSUxJVFksIFdIRVRIRVIgSU4gQ09OVFJBQ1QsIFNUUklDVCBMSUFCSUxJVFksIE9SIFRPUlRcbihJTkNMVURJTkcgTkVHTElHRU5DRSBPUiBPVEhFUldJU0UpIEFSSVNJTkcgSU4gQU5ZIFdBWSBPVVQgT0YgVEhFIFVTRSBPRiBUSElTXG5TT0ZUV0FSRSwgRVZFTiBJRiBBRFZJU0VEIE9GIFRIRSBQT1NTSUJJTElUWSBPRiBTVUNIIERBTUFHRS4gKi9cblxuLyoqXG4gKiBAY2xhc3MgMiBEaW1lbnNpb25hbCBWZWN0b3JcbiAqIEBuYW1lIHZlYzJcbiAqL1xuXG52YXIgdmVjMiA9IHt9O1xuXG4vKipcbiAqIENyZWF0ZXMgYSBuZXcsIGVtcHR5IHZlYzJcbiAqXG4gKiBAcmV0dXJucyB7dmVjMn0gYSBuZXcgMkQgdmVjdG9yXG4gKi9cbnZlYzIuY3JlYXRlID0gZnVuY3Rpb24oKSB7XG4gICAgdmFyIG91dCA9IG5ldyBHTE1BVF9BUlJBWV9UWVBFKDIpO1xuICAgIG91dFswXSA9IDA7XG4gICAgb3V0WzFdID0gMDtcbiAgICByZXR1cm4gb3V0O1xufTtcblxuLyoqXG4gKiBDcmVhdGVzIGEgbmV3IHZlYzIgaW5pdGlhbGl6ZWQgd2l0aCB2YWx1ZXMgZnJvbSBhbiBleGlzdGluZyB2ZWN0b3JcbiAqXG4gKiBAcGFyYW0ge3ZlYzJ9IGEgdmVjdG9yIHRvIGNsb25lXG4gKiBAcmV0dXJucyB7dmVjMn0gYSBuZXcgMkQgdmVjdG9yXG4gKi9cbnZlYzIuY2xvbmUgPSBmdW5jdGlvbihhKSB7XG4gICAgdmFyIG91dCA9IG5ldyBHTE1BVF9BUlJBWV9UWVBFKDIpO1xuICAgIG91dFswXSA9IGFbMF07XG4gICAgb3V0WzFdID0gYVsxXTtcbiAgICByZXR1cm4gb3V0O1xufTtcblxuLyoqXG4gKiBDcmVhdGVzIGEgbmV3IHZlYzIgaW5pdGlhbGl6ZWQgd2l0aCB0aGUgZ2l2ZW4gdmFsdWVzXG4gKlxuICogQHBhcmFtIHtOdW1iZXJ9IHggWCBjb21wb25lbnRcbiAqIEBwYXJhbSB7TnVtYmVyfSB5IFkgY29tcG9uZW50XG4gKiBAcmV0dXJucyB7dmVjMn0gYSBuZXcgMkQgdmVjdG9yXG4gKi9cbnZlYzIuZnJvbVZhbHVlcyA9IGZ1bmN0aW9uKHgsIHkpIHtcbiAgICB2YXIgb3V0ID0gbmV3IEdMTUFUX0FSUkFZX1RZUEUoMik7XG4gICAgb3V0WzBdID0geDtcbiAgICBvdXRbMV0gPSB5O1xuICAgIHJldHVybiBvdXQ7XG59O1xuXG4vKipcbiAqIENvcHkgdGhlIHZhbHVlcyBmcm9tIG9uZSB2ZWMyIHRvIGFub3RoZXJcbiAqXG4gKiBAcGFyYW0ge3ZlYzJ9IG91dCB0aGUgcmVjZWl2aW5nIHZlY3RvclxuICogQHBhcmFtIHt2ZWMyfSBhIHRoZSBzb3VyY2UgdmVjdG9yXG4gKiBAcmV0dXJucyB7dmVjMn0gb3V0XG4gKi9cbnZlYzIuY29weSA9IGZ1bmN0aW9uKG91dCwgYSkge1xuICAgIG91dFswXSA9IGFbMF07XG4gICAgb3V0WzFdID0gYVsxXTtcbiAgICByZXR1cm4gb3V0O1xufTtcblxuLyoqXG4gKiBTZXQgdGhlIGNvbXBvbmVudHMgb2YgYSB2ZWMyIHRvIHRoZSBnaXZlbiB2YWx1ZXNcbiAqXG4gKiBAcGFyYW0ge3ZlYzJ9IG91dCB0aGUgcmVjZWl2aW5nIHZlY3RvclxuICogQHBhcmFtIHtOdW1iZXJ9IHggWCBjb21wb25lbnRcbiAqIEBwYXJhbSB7TnVtYmVyfSB5IFkgY29tcG9uZW50XG4gKiBAcmV0dXJucyB7dmVjMn0gb3V0XG4gKi9cbnZlYzIuc2V0ID0gZnVuY3Rpb24ob3V0LCB4LCB5KSB7XG4gICAgb3V0WzBdID0geDtcbiAgICBvdXRbMV0gPSB5O1xuICAgIHJldHVybiBvdXQ7XG59O1xuXG4vKipcbiAqIEFkZHMgdHdvIHZlYzInc1xuICpcbiAqIEBwYXJhbSB7dmVjMn0gb3V0IHRoZSByZWNlaXZpbmcgdmVjdG9yXG4gKiBAcGFyYW0ge3ZlYzJ9IGEgdGhlIGZpcnN0IG9wZXJhbmRcbiAqIEBwYXJhbSB7dmVjMn0gYiB0aGUgc2Vjb25kIG9wZXJhbmRcbiAqIEByZXR1cm5zIHt2ZWMyfSBvdXRcbiAqL1xudmVjMi5hZGQgPSBmdW5jdGlvbihvdXQsIGEsIGIpIHtcbiAgICBvdXRbMF0gPSBhWzBdICsgYlswXTtcbiAgICBvdXRbMV0gPSBhWzFdICsgYlsxXTtcbiAgICByZXR1cm4gb3V0O1xufTtcblxuLyoqXG4gKiBTdWJ0cmFjdHMgdHdvIHZlYzInc1xuICpcbiAqIEBwYXJhbSB7dmVjMn0gb3V0IHRoZSByZWNlaXZpbmcgdmVjdG9yXG4gKiBAcGFyYW0ge3ZlYzJ9IGEgdGhlIGZpcnN0IG9wZXJhbmRcbiAqIEBwYXJhbSB7dmVjMn0gYiB0aGUgc2Vjb25kIG9wZXJhbmRcbiAqIEByZXR1cm5zIHt2ZWMyfSBvdXRcbiAqL1xudmVjMi5zdWJ0cmFjdCA9IGZ1bmN0aW9uKG91dCwgYSwgYikge1xuICAgIG91dFswXSA9IGFbMF0gLSBiWzBdO1xuICAgIG91dFsxXSA9IGFbMV0gLSBiWzFdO1xuICAgIHJldHVybiBvdXQ7XG59O1xuXG4vKipcbiAqIEFsaWFzIGZvciB7QGxpbmsgdmVjMi5zdWJ0cmFjdH1cbiAqIEBmdW5jdGlvblxuICovXG52ZWMyLnN1YiA9IHZlYzIuc3VidHJhY3Q7XG5cbi8qKlxuICogTXVsdGlwbGllcyB0d28gdmVjMidzXG4gKlxuICogQHBhcmFtIHt2ZWMyfSBvdXQgdGhlIHJlY2VpdmluZyB2ZWN0b3JcbiAqIEBwYXJhbSB7dmVjMn0gYSB0aGUgZmlyc3Qgb3BlcmFuZFxuICogQHBhcmFtIHt2ZWMyfSBiIHRoZSBzZWNvbmQgb3BlcmFuZFxuICogQHJldHVybnMge3ZlYzJ9IG91dFxuICovXG52ZWMyLm11bHRpcGx5ID0gZnVuY3Rpb24ob3V0LCBhLCBiKSB7XG4gICAgb3V0WzBdID0gYVswXSAqIGJbMF07XG4gICAgb3V0WzFdID0gYVsxXSAqIGJbMV07XG4gICAgcmV0dXJuIG91dDtcbn07XG5cbi8qKlxuICogQWxpYXMgZm9yIHtAbGluayB2ZWMyLm11bHRpcGx5fVxuICogQGZ1bmN0aW9uXG4gKi9cbnZlYzIubXVsID0gdmVjMi5tdWx0aXBseTtcblxuLyoqXG4gKiBEaXZpZGVzIHR3byB2ZWMyJ3NcbiAqXG4gKiBAcGFyYW0ge3ZlYzJ9IG91dCB0aGUgcmVjZWl2aW5nIHZlY3RvclxuICogQHBhcmFtIHt2ZWMyfSBhIHRoZSBmaXJzdCBvcGVyYW5kXG4gKiBAcGFyYW0ge3ZlYzJ9IGIgdGhlIHNlY29uZCBvcGVyYW5kXG4gKiBAcmV0dXJucyB7dmVjMn0gb3V0XG4gKi9cbnZlYzIuZGl2aWRlID0gZnVuY3Rpb24ob3V0LCBhLCBiKSB7XG4gICAgb3V0WzBdID0gYVswXSAvIGJbMF07XG4gICAgb3V0WzFdID0gYVsxXSAvIGJbMV07XG4gICAgcmV0dXJuIG91dDtcbn07XG5cbi8qKlxuICogQWxpYXMgZm9yIHtAbGluayB2ZWMyLmRpdmlkZX1cbiAqIEBmdW5jdGlvblxuICovXG52ZWMyLmRpdiA9IHZlYzIuZGl2aWRlO1xuXG4vKipcbiAqIFJldHVybnMgdGhlIG1pbmltdW0gb2YgdHdvIHZlYzInc1xuICpcbiAqIEBwYXJhbSB7dmVjMn0gb3V0IHRoZSByZWNlaXZpbmcgdmVjdG9yXG4gKiBAcGFyYW0ge3ZlYzJ9IGEgdGhlIGZpcnN0IG9wZXJhbmRcbiAqIEBwYXJhbSB7dmVjMn0gYiB0aGUgc2Vjb25kIG9wZXJhbmRcbiAqIEByZXR1cm5zIHt2ZWMyfSBvdXRcbiAqL1xudmVjMi5taW4gPSBmdW5jdGlvbihvdXQsIGEsIGIpIHtcbiAgICBvdXRbMF0gPSBNYXRoLm1pbihhWzBdLCBiWzBdKTtcbiAgICBvdXRbMV0gPSBNYXRoLm1pbihhWzFdLCBiWzFdKTtcbiAgICByZXR1cm4gb3V0O1xufTtcblxuLyoqXG4gKiBSZXR1cm5zIHRoZSBtYXhpbXVtIG9mIHR3byB2ZWMyJ3NcbiAqXG4gKiBAcGFyYW0ge3ZlYzJ9IG91dCB0aGUgcmVjZWl2aW5nIHZlY3RvclxuICogQHBhcmFtIHt2ZWMyfSBhIHRoZSBmaXJzdCBvcGVyYW5kXG4gKiBAcGFyYW0ge3ZlYzJ9IGIgdGhlIHNlY29uZCBvcGVyYW5kXG4gKiBAcmV0dXJucyB7dmVjMn0gb3V0XG4gKi9cbnZlYzIubWF4ID0gZnVuY3Rpb24ob3V0LCBhLCBiKSB7XG4gICAgb3V0WzBdID0gTWF0aC5tYXgoYVswXSwgYlswXSk7XG4gICAgb3V0WzFdID0gTWF0aC5tYXgoYVsxXSwgYlsxXSk7XG4gICAgcmV0dXJuIG91dDtcbn07XG5cbi8qKlxuICogU2NhbGVzIGEgdmVjMiBieSBhIHNjYWxhciBudW1iZXJcbiAqXG4gKiBAcGFyYW0ge3ZlYzJ9IG91dCB0aGUgcmVjZWl2aW5nIHZlY3RvclxuICogQHBhcmFtIHt2ZWMyfSBhIHRoZSB2ZWN0b3IgdG8gc2NhbGVcbiAqIEBwYXJhbSB7TnVtYmVyfSBiIGFtb3VudCB0byBzY2FsZSB0aGUgdmVjdG9yIGJ5XG4gKiBAcmV0dXJucyB7dmVjMn0gb3V0XG4gKi9cbnZlYzIuc2NhbGUgPSBmdW5jdGlvbihvdXQsIGEsIGIpIHtcbiAgICBvdXRbMF0gPSBhWzBdICogYjtcbiAgICBvdXRbMV0gPSBhWzFdICogYjtcbiAgICByZXR1cm4gb3V0O1xufTtcblxuLyoqXG4gKiBDYWxjdWxhdGVzIHRoZSBldWNsaWRpYW4gZGlzdGFuY2UgYmV0d2VlbiB0d28gdmVjMidzXG4gKlxuICogQHBhcmFtIHt2ZWMyfSBhIHRoZSBmaXJzdCBvcGVyYW5kXG4gKiBAcGFyYW0ge3ZlYzJ9IGIgdGhlIHNlY29uZCBvcGVyYW5kXG4gKiBAcmV0dXJucyB7TnVtYmVyfSBkaXN0YW5jZSBiZXR3ZWVuIGEgYW5kIGJcbiAqL1xudmVjMi5kaXN0YW5jZSA9IGZ1bmN0aW9uKGEsIGIpIHtcbiAgICB2YXIgeCA9IGJbMF0gLSBhWzBdLFxuICAgICAgICB5ID0gYlsxXSAtIGFbMV07XG4gICAgcmV0dXJuIE1hdGguc3FydCh4KnggKyB5KnkpO1xufTtcblxuLyoqXG4gKiBBbGlhcyBmb3Ige0BsaW5rIHZlYzIuZGlzdGFuY2V9XG4gKiBAZnVuY3Rpb25cbiAqL1xudmVjMi5kaXN0ID0gdmVjMi5kaXN0YW5jZTtcblxuLyoqXG4gKiBDYWxjdWxhdGVzIHRoZSBzcXVhcmVkIGV1Y2xpZGlhbiBkaXN0YW5jZSBiZXR3ZWVuIHR3byB2ZWMyJ3NcbiAqXG4gKiBAcGFyYW0ge3ZlYzJ9IGEgdGhlIGZpcnN0IG9wZXJhbmRcbiAqIEBwYXJhbSB7dmVjMn0gYiB0aGUgc2Vjb25kIG9wZXJhbmRcbiAqIEByZXR1cm5zIHtOdW1iZXJ9IHNxdWFyZWQgZGlzdGFuY2UgYmV0d2VlbiBhIGFuZCBiXG4gKi9cbnZlYzIuc3F1YXJlZERpc3RhbmNlID0gZnVuY3Rpb24oYSwgYikge1xuICAgIHZhciB4ID0gYlswXSAtIGFbMF0sXG4gICAgICAgIHkgPSBiWzFdIC0gYVsxXTtcbiAgICByZXR1cm4geCp4ICsgeSp5O1xufTtcblxuLyoqXG4gKiBBbGlhcyBmb3Ige0BsaW5rIHZlYzIuc3F1YXJlZERpc3RhbmNlfVxuICogQGZ1bmN0aW9uXG4gKi9cbnZlYzIuc3FyRGlzdCA9IHZlYzIuc3F1YXJlZERpc3RhbmNlO1xuXG4vKipcbiAqIENhbGN1bGF0ZXMgdGhlIGxlbmd0aCBvZiBhIHZlYzJcbiAqXG4gKiBAcGFyYW0ge3ZlYzJ9IGEgdmVjdG9yIHRvIGNhbGN1bGF0ZSBsZW5ndGggb2ZcbiAqIEByZXR1cm5zIHtOdW1iZXJ9IGxlbmd0aCBvZiBhXG4gKi9cbnZlYzIubGVuZ3RoID0gZnVuY3Rpb24gKGEpIHtcbiAgICB2YXIgeCA9IGFbMF0sXG4gICAgICAgIHkgPSBhWzFdO1xuICAgIHJldHVybiBNYXRoLnNxcnQoeCp4ICsgeSp5KTtcbn07XG5cbi8qKlxuICogQWxpYXMgZm9yIHtAbGluayB2ZWMyLmxlbmd0aH1cbiAqIEBmdW5jdGlvblxuICovXG52ZWMyLmxlbiA9IHZlYzIubGVuZ3RoO1xuXG4vKipcbiAqIENhbGN1bGF0ZXMgdGhlIHNxdWFyZWQgbGVuZ3RoIG9mIGEgdmVjMlxuICpcbiAqIEBwYXJhbSB7dmVjMn0gYSB2ZWN0b3IgdG8gY2FsY3VsYXRlIHNxdWFyZWQgbGVuZ3RoIG9mXG4gKiBAcmV0dXJucyB7TnVtYmVyfSBzcXVhcmVkIGxlbmd0aCBvZiBhXG4gKi9cbnZlYzIuc3F1YXJlZExlbmd0aCA9IGZ1bmN0aW9uIChhKSB7XG4gICAgdmFyIHggPSBhWzBdLFxuICAgICAgICB5ID0gYVsxXTtcbiAgICByZXR1cm4geCp4ICsgeSp5O1xufTtcblxuLyoqXG4gKiBBbGlhcyBmb3Ige0BsaW5rIHZlYzIuc3F1YXJlZExlbmd0aH1cbiAqIEBmdW5jdGlvblxuICovXG52ZWMyLnNxckxlbiA9IHZlYzIuc3F1YXJlZExlbmd0aDtcblxuLyoqXG4gKiBOZWdhdGVzIHRoZSBjb21wb25lbnRzIG9mIGEgdmVjMlxuICpcbiAqIEBwYXJhbSB7dmVjMn0gb3V0IHRoZSByZWNlaXZpbmcgdmVjdG9yXG4gKiBAcGFyYW0ge3ZlYzJ9IGEgdmVjdG9yIHRvIG5lZ2F0ZVxuICogQHJldHVybnMge3ZlYzJ9IG91dFxuICovXG52ZWMyLm5lZ2F0ZSA9IGZ1bmN0aW9uKG91dCwgYSkge1xuICAgIG91dFswXSA9IC1hWzBdO1xuICAgIG91dFsxXSA9IC1hWzFdO1xuICAgIHJldHVybiBvdXQ7XG59O1xuXG4vKipcbiAqIE5vcm1hbGl6ZSBhIHZlYzJcbiAqXG4gKiBAcGFyYW0ge3ZlYzJ9IG91dCB0aGUgcmVjZWl2aW5nIHZlY3RvclxuICogQHBhcmFtIHt2ZWMyfSBhIHZlY3RvciB0byBub3JtYWxpemVcbiAqIEByZXR1cm5zIHt2ZWMyfSBvdXRcbiAqL1xudmVjMi5ub3JtYWxpemUgPSBmdW5jdGlvbihvdXQsIGEpIHtcbiAgICB2YXIgeCA9IGFbMF0sXG4gICAgICAgIHkgPSBhWzFdO1xuICAgIHZhciBsZW4gPSB4KnggKyB5Knk7XG4gICAgaWYgKGxlbiA+IDApIHtcbiAgICAgICAgLy9UT0RPOiBldmFsdWF0ZSB1c2Ugb2YgZ2xtX2ludnNxcnQgaGVyZT9cbiAgICAgICAgbGVuID0gMSAvIE1hdGguc3FydChsZW4pO1xuICAgICAgICBvdXRbMF0gPSBhWzBdICogbGVuO1xuICAgICAgICBvdXRbMV0gPSBhWzFdICogbGVuO1xuICAgIH1cbiAgICByZXR1cm4gb3V0O1xufTtcblxuLyoqXG4gKiBDYWxjdWxhdGVzIHRoZSBkb3QgcHJvZHVjdCBvZiB0d28gdmVjMidzXG4gKlxuICogQHBhcmFtIHt2ZWMyfSBhIHRoZSBmaXJzdCBvcGVyYW5kXG4gKiBAcGFyYW0ge3ZlYzJ9IGIgdGhlIHNlY29uZCBvcGVyYW5kXG4gKiBAcmV0dXJucyB7TnVtYmVyfSBkb3QgcHJvZHVjdCBvZiBhIGFuZCBiXG4gKi9cbnZlYzIuZG90ID0gZnVuY3Rpb24gKGEsIGIpIHtcbiAgICByZXR1cm4gYVswXSAqIGJbMF0gKyBhWzFdICogYlsxXTtcbn07XG5cbi8qKlxuICogQ29tcHV0ZXMgdGhlIGNyb3NzIHByb2R1Y3Qgb2YgdHdvIHZlYzInc1xuICogTm90ZSB0aGF0IHRoZSBjcm9zcyBwcm9kdWN0IG11c3QgYnkgZGVmaW5pdGlvbiBwcm9kdWNlIGEgM0QgdmVjdG9yXG4gKlxuICogQHBhcmFtIHt2ZWMzfSBvdXQgdGhlIHJlY2VpdmluZyB2ZWN0b3JcbiAqIEBwYXJhbSB7dmVjMn0gYSB0aGUgZmlyc3Qgb3BlcmFuZFxuICogQHBhcmFtIHt2ZWMyfSBiIHRoZSBzZWNvbmQgb3BlcmFuZFxuICogQHJldHVybnMge3ZlYzN9IG91dFxuICovXG52ZWMyLmNyb3NzID0gZnVuY3Rpb24ob3V0LCBhLCBiKSB7XG4gICAgdmFyIHogPSBhWzBdICogYlsxXSAtIGFbMV0gKiBiWzBdO1xuICAgIG91dFswXSA9IG91dFsxXSA9IDA7XG4gICAgb3V0WzJdID0gejtcbiAgICByZXR1cm4gb3V0O1xufTtcblxuLyoqXG4gKiBQZXJmb3JtcyBhIGxpbmVhciBpbnRlcnBvbGF0aW9uIGJldHdlZW4gdHdvIHZlYzInc1xuICpcbiAqIEBwYXJhbSB7dmVjMn0gb3V0IHRoZSByZWNlaXZpbmcgdmVjdG9yXG4gKiBAcGFyYW0ge3ZlYzJ9IGEgdGhlIGZpcnN0IG9wZXJhbmRcbiAqIEBwYXJhbSB7dmVjMn0gYiB0aGUgc2Vjb25kIG9wZXJhbmRcbiAqIEBwYXJhbSB7TnVtYmVyfSB0IGludGVycG9sYXRpb24gYW1vdW50IGJldHdlZW4gdGhlIHR3byBpbnB1dHNcbiAqIEByZXR1cm5zIHt2ZWMyfSBvdXRcbiAqL1xudmVjMi5sZXJwID0gZnVuY3Rpb24gKG91dCwgYSwgYiwgdCkge1xuICAgIHZhciBheCA9IGFbMF0sXG4gICAgICAgIGF5ID0gYVsxXTtcbiAgICBvdXRbMF0gPSBheCArIHQgKiAoYlswXSAtIGF4KTtcbiAgICBvdXRbMV0gPSBheSArIHQgKiAoYlsxXSAtIGF5KTtcbiAgICByZXR1cm4gb3V0O1xufTtcblxuLyoqXG4gKiBUcmFuc2Zvcm1zIHRoZSB2ZWMyIHdpdGggYSBtYXQyXG4gKlxuICogQHBhcmFtIHt2ZWMyfSBvdXQgdGhlIHJlY2VpdmluZyB2ZWN0b3JcbiAqIEBwYXJhbSB7dmVjMn0gYSB0aGUgdmVjdG9yIHRvIHRyYW5zZm9ybVxuICogQHBhcmFtIHttYXQyfSBtIG1hdHJpeCB0byB0cmFuc2Zvcm0gd2l0aFxuICogQHJldHVybnMge3ZlYzJ9IG91dFxuICovXG52ZWMyLnRyYW5zZm9ybU1hdDIgPSBmdW5jdGlvbihvdXQsIGEsIG0pIHtcbiAgICB2YXIgeCA9IGFbMF0sXG4gICAgICAgIHkgPSBhWzFdO1xuICAgIG91dFswXSA9IG1bMF0gKiB4ICsgbVsyXSAqIHk7XG4gICAgb3V0WzFdID0gbVsxXSAqIHggKyBtWzNdICogeTtcbiAgICByZXR1cm4gb3V0O1xufTtcblxuLyoqXG4gKiBUcmFuc2Zvcm1zIHRoZSB2ZWMyIHdpdGggYSBtYXQyZFxuICpcbiAqIEBwYXJhbSB7dmVjMn0gb3V0IHRoZSByZWNlaXZpbmcgdmVjdG9yXG4gKiBAcGFyYW0ge3ZlYzJ9IGEgdGhlIHZlY3RvciB0byB0cmFuc2Zvcm1cbiAqIEBwYXJhbSB7bWF0MmR9IG0gbWF0cml4IHRvIHRyYW5zZm9ybSB3aXRoXG4gKiBAcmV0dXJucyB7dmVjMn0gb3V0XG4gKi9cbnZlYzIudHJhbnNmb3JtTWF0MmQgPSBmdW5jdGlvbihvdXQsIGEsIG0pIHtcbiAgICB2YXIgeCA9IGFbMF0sXG4gICAgICAgIHkgPSBhWzFdO1xuICAgIG91dFswXSA9IG1bMF0gKiB4ICsgbVsyXSAqIHkgKyBtWzRdO1xuICAgIG91dFsxXSA9IG1bMV0gKiB4ICsgbVszXSAqIHkgKyBtWzVdO1xuICAgIHJldHVybiBvdXQ7XG59O1xuXG4vKipcbiAqIFRyYW5zZm9ybXMgdGhlIHZlYzIgd2l0aCBhIG1hdDNcbiAqIDNyZCB2ZWN0b3IgY29tcG9uZW50IGlzIGltcGxpY2l0bHkgJzEnXG4gKlxuICogQHBhcmFtIHt2ZWMyfSBvdXQgdGhlIHJlY2VpdmluZyB2ZWN0b3JcbiAqIEBwYXJhbSB7dmVjMn0gYSB0aGUgdmVjdG9yIHRvIHRyYW5zZm9ybVxuICogQHBhcmFtIHttYXQzfSBtIG1hdHJpeCB0byB0cmFuc2Zvcm0gd2l0aFxuICogQHJldHVybnMge3ZlYzJ9IG91dFxuICovXG52ZWMyLnRyYW5zZm9ybU1hdDMgPSBmdW5jdGlvbihvdXQsIGEsIG0pIHtcbiAgICB2YXIgeCA9IGFbMF0sXG4gICAgICAgIHkgPSBhWzFdO1xuICAgIG91dFswXSA9IG1bMF0gKiB4ICsgbVszXSAqIHkgKyBtWzZdO1xuICAgIG91dFsxXSA9IG1bMV0gKiB4ICsgbVs0XSAqIHkgKyBtWzddO1xuICAgIHJldHVybiBvdXQ7XG59O1xuXG4vKipcbiAqIFRyYW5zZm9ybXMgdGhlIHZlYzIgd2l0aCBhIG1hdDRcbiAqIDNyZCB2ZWN0b3IgY29tcG9uZW50IGlzIGltcGxpY2l0bHkgJzAnXG4gKiA0dGggdmVjdG9yIGNvbXBvbmVudCBpcyBpbXBsaWNpdGx5ICcxJ1xuICpcbiAqIEBwYXJhbSB7dmVjMn0gb3V0IHRoZSByZWNlaXZpbmcgdmVjdG9yXG4gKiBAcGFyYW0ge3ZlYzJ9IGEgdGhlIHZlY3RvciB0byB0cmFuc2Zvcm1cbiAqIEBwYXJhbSB7bWF0NH0gbSBtYXRyaXggdG8gdHJhbnNmb3JtIHdpdGhcbiAqIEByZXR1cm5zIHt2ZWMyfSBvdXRcbiAqL1xudmVjMi50cmFuc2Zvcm1NYXQ0ID0gZnVuY3Rpb24ob3V0LCBhLCBtKSB7XG4gICAgdmFyIHggPSBhWzBdLCBcbiAgICAgICAgeSA9IGFbMV07XG4gICAgb3V0WzBdID0gbVswXSAqIHggKyBtWzRdICogeSArIG1bMTJdO1xuICAgIG91dFsxXSA9IG1bMV0gKiB4ICsgbVs1XSAqIHkgKyBtWzEzXTtcbiAgICByZXR1cm4gb3V0O1xufTtcblxuLyoqXG4gKiBQZXJmb3JtIHNvbWUgb3BlcmF0aW9uIG92ZXIgYW4gYXJyYXkgb2YgdmVjMnMuXG4gKlxuICogQHBhcmFtIHtBcnJheX0gYSB0aGUgYXJyYXkgb2YgdmVjdG9ycyB0byBpdGVyYXRlIG92ZXJcbiAqIEBwYXJhbSB7TnVtYmVyfSBzdHJpZGUgTnVtYmVyIG9mIGVsZW1lbnRzIGJldHdlZW4gdGhlIHN0YXJ0IG9mIGVhY2ggdmVjMi4gSWYgMCBhc3N1bWVzIHRpZ2h0bHkgcGFja2VkXG4gKiBAcGFyYW0ge051bWJlcn0gb2Zmc2V0IE51bWJlciBvZiBlbGVtZW50cyB0byBza2lwIGF0IHRoZSBiZWdpbm5pbmcgb2YgdGhlIGFycmF5XG4gKiBAcGFyYW0ge051bWJlcn0gY291bnQgTnVtYmVyIG9mIHZlYzJzIHRvIGl0ZXJhdGUgb3Zlci4gSWYgMCBpdGVyYXRlcyBvdmVyIGVudGlyZSBhcnJheVxuICogQHBhcmFtIHtGdW5jdGlvbn0gZm4gRnVuY3Rpb24gdG8gY2FsbCBmb3IgZWFjaCB2ZWN0b3IgaW4gdGhlIGFycmF5XG4gKiBAcGFyYW0ge09iamVjdH0gW2FyZ10gYWRkaXRpb25hbCBhcmd1bWVudCB0byBwYXNzIHRvIGZuXG4gKiBAcmV0dXJucyB7QXJyYXl9IGFcbiAqIEBmdW5jdGlvblxuICovXG52ZWMyLmZvckVhY2ggPSAoZnVuY3Rpb24oKSB7XG4gICAgdmFyIHZlYyA9IHZlYzIuY3JlYXRlKCk7XG5cbiAgICByZXR1cm4gZnVuY3Rpb24oYSwgc3RyaWRlLCBvZmZzZXQsIGNvdW50LCBmbiwgYXJnKSB7XG4gICAgICAgIHZhciBpLCBsO1xuICAgICAgICBpZighc3RyaWRlKSB7XG4gICAgICAgICAgICBzdHJpZGUgPSAyO1xuICAgICAgICB9XG5cbiAgICAgICAgaWYoIW9mZnNldCkge1xuICAgICAgICAgICAgb2Zmc2V0ID0gMDtcbiAgICAgICAgfVxuICAgICAgICBcbiAgICAgICAgaWYoY291bnQpIHtcbiAgICAgICAgICAgIGwgPSBNYXRoLm1pbigoY291bnQgKiBzdHJpZGUpICsgb2Zmc2V0LCBhLmxlbmd0aCk7XG4gICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICBsID0gYS5sZW5ndGg7XG4gICAgICAgIH1cblxuICAgICAgICBmb3IoaSA9IG9mZnNldDsgaSA8IGw7IGkgKz0gc3RyaWRlKSB7XG4gICAgICAgICAgICB2ZWNbMF0gPSBhW2ldOyB2ZWNbMV0gPSBhW2krMV07XG4gICAgICAgICAgICBmbih2ZWMsIHZlYywgYXJnKTtcbiAgICAgICAgICAgIGFbaV0gPSB2ZWNbMF07IGFbaSsxXSA9IHZlY1sxXTtcbiAgICAgICAgfVxuICAgICAgICBcbiAgICAgICAgcmV0dXJuIGE7XG4gICAgfTtcbn0pKCk7XG5cbi8qKlxuICogUmV0dXJucyBhIHN0cmluZyByZXByZXNlbnRhdGlvbiBvZiBhIHZlY3RvclxuICpcbiAqIEBwYXJhbSB7dmVjMn0gdmVjIHZlY3RvciB0byByZXByZXNlbnQgYXMgYSBzdHJpbmdcbiAqIEByZXR1cm5zIHtTdHJpbmd9IHN0cmluZyByZXByZXNlbnRhdGlvbiBvZiB0aGUgdmVjdG9yXG4gKi9cbnZlYzIuc3RyID0gZnVuY3Rpb24gKGEpIHtcbiAgICByZXR1cm4gJ3ZlYzIoJyArIGFbMF0gKyAnLCAnICsgYVsxXSArICcpJztcbn07XG5cbmlmKHR5cGVvZihleHBvcnRzKSAhPT0gJ3VuZGVmaW5lZCcpIHtcbiAgICBleHBvcnRzLnZlYzIgPSB2ZWMyO1xufVxuO1xuLyogQ29weXJpZ2h0IChjKSAyMDEzLCBCcmFuZG9uIEpvbmVzLCBDb2xpbiBNYWNLZW56aWUgSVYuIEFsbCByaWdodHMgcmVzZXJ2ZWQuXG5cblJlZGlzdHJpYnV0aW9uIGFuZCB1c2UgaW4gc291cmNlIGFuZCBiaW5hcnkgZm9ybXMsIHdpdGggb3Igd2l0aG91dCBtb2RpZmljYXRpb24sXG5hcmUgcGVybWl0dGVkIHByb3ZpZGVkIHRoYXQgdGhlIGZvbGxvd2luZyBjb25kaXRpb25zIGFyZSBtZXQ6XG5cbiAgKiBSZWRpc3RyaWJ1dGlvbnMgb2Ygc291cmNlIGNvZGUgbXVzdCByZXRhaW4gdGhlIGFib3ZlIGNvcHlyaWdodCBub3RpY2UsIHRoaXNcbiAgICBsaXN0IG9mIGNvbmRpdGlvbnMgYW5kIHRoZSBmb2xsb3dpbmcgZGlzY2xhaW1lci5cbiAgKiBSZWRpc3RyaWJ1dGlvbnMgaW4gYmluYXJ5IGZvcm0gbXVzdCByZXByb2R1Y2UgdGhlIGFib3ZlIGNvcHlyaWdodCBub3RpY2UsXG4gICAgdGhpcyBsaXN0IG9mIGNvbmRpdGlvbnMgYW5kIHRoZSBmb2xsb3dpbmcgZGlzY2xhaW1lciBpbiB0aGUgZG9jdW1lbnRhdGlvbiBcbiAgICBhbmQvb3Igb3RoZXIgbWF0ZXJpYWxzIHByb3ZpZGVkIHdpdGggdGhlIGRpc3RyaWJ1dGlvbi5cblxuVEhJUyBTT0ZUV0FSRSBJUyBQUk9WSURFRCBCWSBUSEUgQ09QWVJJR0hUIEhPTERFUlMgQU5EIENPTlRSSUJVVE9SUyBcIkFTIElTXCIgQU5EXG5BTlkgRVhQUkVTUyBPUiBJTVBMSUVEIFdBUlJBTlRJRVMsIElOQ0xVRElORywgQlVUIE5PVCBMSU1JVEVEIFRPLCBUSEUgSU1QTElFRFxuV0FSUkFOVElFUyBPRiBNRVJDSEFOVEFCSUxJVFkgQU5EIEZJVE5FU1MgRk9SIEEgUEFSVElDVUxBUiBQVVJQT1NFIEFSRSBcbkRJU0NMQUlNRUQuIElOIE5PIEVWRU5UIFNIQUxMIFRIRSBDT1BZUklHSFQgSE9MREVSIE9SIENPTlRSSUJVVE9SUyBCRSBMSUFCTEUgRk9SXG5BTlkgRElSRUNULCBJTkRJUkVDVCwgSU5DSURFTlRBTCwgU1BFQ0lBTCwgRVhFTVBMQVJZLCBPUiBDT05TRVFVRU5USUFMIERBTUFHRVNcbihJTkNMVURJTkcsIEJVVCBOT1QgTElNSVRFRCBUTywgUFJPQ1VSRU1FTlQgT0YgU1VCU1RJVFVURSBHT09EUyBPUiBTRVJWSUNFUztcbkxPU1MgT0YgVVNFLCBEQVRBLCBPUiBQUk9GSVRTOyBPUiBCVVNJTkVTUyBJTlRFUlJVUFRJT04pIEhPV0VWRVIgQ0FVU0VEIEFORCBPTlxuQU5ZIFRIRU9SWSBPRiBMSUFCSUxJVFksIFdIRVRIRVIgSU4gQ09OVFJBQ1QsIFNUUklDVCBMSUFCSUxJVFksIE9SIFRPUlRcbihJTkNMVURJTkcgTkVHTElHRU5DRSBPUiBPVEhFUldJU0UpIEFSSVNJTkcgSU4gQU5ZIFdBWSBPVVQgT0YgVEhFIFVTRSBPRiBUSElTXG5TT0ZUV0FSRSwgRVZFTiBJRiBBRFZJU0VEIE9GIFRIRSBQT1NTSUJJTElUWSBPRiBTVUNIIERBTUFHRS4gKi9cblxuLyoqXG4gKiBAY2xhc3MgMyBEaW1lbnNpb25hbCBWZWN0b3JcbiAqIEBuYW1lIHZlYzNcbiAqL1xuXG52YXIgdmVjMyA9IHt9O1xuXG4vKipcbiAqIENyZWF0ZXMgYSBuZXcsIGVtcHR5IHZlYzNcbiAqXG4gKiBAcmV0dXJucyB7dmVjM30gYSBuZXcgM0QgdmVjdG9yXG4gKi9cbnZlYzMuY3JlYXRlID0gZnVuY3Rpb24oKSB7XG4gICAgdmFyIG91dCA9IG5ldyBHTE1BVF9BUlJBWV9UWVBFKDMpO1xuICAgIG91dFswXSA9IDA7XG4gICAgb3V0WzFdID0gMDtcbiAgICBvdXRbMl0gPSAwO1xuICAgIHJldHVybiBvdXQ7XG59O1xuXG4vKipcbiAqIENyZWF0ZXMgYSBuZXcgdmVjMyBpbml0aWFsaXplZCB3aXRoIHZhbHVlcyBmcm9tIGFuIGV4aXN0aW5nIHZlY3RvclxuICpcbiAqIEBwYXJhbSB7dmVjM30gYSB2ZWN0b3IgdG8gY2xvbmVcbiAqIEByZXR1cm5zIHt2ZWMzfSBhIG5ldyAzRCB2ZWN0b3JcbiAqL1xudmVjMy5jbG9uZSA9IGZ1bmN0aW9uKGEpIHtcbiAgICB2YXIgb3V0ID0gbmV3IEdMTUFUX0FSUkFZX1RZUEUoMyk7XG4gICAgb3V0WzBdID0gYVswXTtcbiAgICBvdXRbMV0gPSBhWzFdO1xuICAgIG91dFsyXSA9IGFbMl07XG4gICAgcmV0dXJuIG91dDtcbn07XG5cbi8qKlxuICogQ3JlYXRlcyBhIG5ldyB2ZWMzIGluaXRpYWxpemVkIHdpdGggdGhlIGdpdmVuIHZhbHVlc1xuICpcbiAqIEBwYXJhbSB7TnVtYmVyfSB4IFggY29tcG9uZW50XG4gKiBAcGFyYW0ge051bWJlcn0geSBZIGNvbXBvbmVudFxuICogQHBhcmFtIHtOdW1iZXJ9IHogWiBjb21wb25lbnRcbiAqIEByZXR1cm5zIHt2ZWMzfSBhIG5ldyAzRCB2ZWN0b3JcbiAqL1xudmVjMy5mcm9tVmFsdWVzID0gZnVuY3Rpb24oeCwgeSwgeikge1xuICAgIHZhciBvdXQgPSBuZXcgR0xNQVRfQVJSQVlfVFlQRSgzKTtcbiAgICBvdXRbMF0gPSB4O1xuICAgIG91dFsxXSA9IHk7XG4gICAgb3V0WzJdID0gejtcbiAgICByZXR1cm4gb3V0O1xufTtcblxuLyoqXG4gKiBDb3B5IHRoZSB2YWx1ZXMgZnJvbSBvbmUgdmVjMyB0byBhbm90aGVyXG4gKlxuICogQHBhcmFtIHt2ZWMzfSBvdXQgdGhlIHJlY2VpdmluZyB2ZWN0b3JcbiAqIEBwYXJhbSB7dmVjM30gYSB0aGUgc291cmNlIHZlY3RvclxuICogQHJldHVybnMge3ZlYzN9IG91dFxuICovXG52ZWMzLmNvcHkgPSBmdW5jdGlvbihvdXQsIGEpIHtcbiAgICBvdXRbMF0gPSBhWzBdO1xuICAgIG91dFsxXSA9IGFbMV07XG4gICAgb3V0WzJdID0gYVsyXTtcbiAgICByZXR1cm4gb3V0O1xufTtcblxuLyoqXG4gKiBTZXQgdGhlIGNvbXBvbmVudHMgb2YgYSB2ZWMzIHRvIHRoZSBnaXZlbiB2YWx1ZXNcbiAqXG4gKiBAcGFyYW0ge3ZlYzN9IG91dCB0aGUgcmVjZWl2aW5nIHZlY3RvclxuICogQHBhcmFtIHtOdW1iZXJ9IHggWCBjb21wb25lbnRcbiAqIEBwYXJhbSB7TnVtYmVyfSB5IFkgY29tcG9uZW50XG4gKiBAcGFyYW0ge051bWJlcn0geiBaIGNvbXBvbmVudFxuICogQHJldHVybnMge3ZlYzN9IG91dFxuICovXG52ZWMzLnNldCA9IGZ1bmN0aW9uKG91dCwgeCwgeSwgeikge1xuICAgIG91dFswXSA9IHg7XG4gICAgb3V0WzFdID0geTtcbiAgICBvdXRbMl0gPSB6O1xuICAgIHJldHVybiBvdXQ7XG59O1xuXG4vKipcbiAqIEFkZHMgdHdvIHZlYzMnc1xuICpcbiAqIEBwYXJhbSB7dmVjM30gb3V0IHRoZSByZWNlaXZpbmcgdmVjdG9yXG4gKiBAcGFyYW0ge3ZlYzN9IGEgdGhlIGZpcnN0IG9wZXJhbmRcbiAqIEBwYXJhbSB7dmVjM30gYiB0aGUgc2Vjb25kIG9wZXJhbmRcbiAqIEByZXR1cm5zIHt2ZWMzfSBvdXRcbiAqL1xudmVjMy5hZGQgPSBmdW5jdGlvbihvdXQsIGEsIGIpIHtcbiAgICBvdXRbMF0gPSBhWzBdICsgYlswXTtcbiAgICBvdXRbMV0gPSBhWzFdICsgYlsxXTtcbiAgICBvdXRbMl0gPSBhWzJdICsgYlsyXTtcbiAgICByZXR1cm4gb3V0O1xufTtcblxuLyoqXG4gKiBTdWJ0cmFjdHMgdHdvIHZlYzMnc1xuICpcbiAqIEBwYXJhbSB7dmVjM30gb3V0IHRoZSByZWNlaXZpbmcgdmVjdG9yXG4gKiBAcGFyYW0ge3ZlYzN9IGEgdGhlIGZpcnN0IG9wZXJhbmRcbiAqIEBwYXJhbSB7dmVjM30gYiB0aGUgc2Vjb25kIG9wZXJhbmRcbiAqIEByZXR1cm5zIHt2ZWMzfSBvdXRcbiAqL1xudmVjMy5zdWJ0cmFjdCA9IGZ1bmN0aW9uKG91dCwgYSwgYikge1xuICAgIG91dFswXSA9IGFbMF0gLSBiWzBdO1xuICAgIG91dFsxXSA9IGFbMV0gLSBiWzFdO1xuICAgIG91dFsyXSA9IGFbMl0gLSBiWzJdO1xuICAgIHJldHVybiBvdXQ7XG59O1xuXG4vKipcbiAqIEFsaWFzIGZvciB7QGxpbmsgdmVjMy5zdWJ0cmFjdH1cbiAqIEBmdW5jdGlvblxuICovXG52ZWMzLnN1YiA9IHZlYzMuc3VidHJhY3Q7XG5cbi8qKlxuICogTXVsdGlwbGllcyB0d28gdmVjMydzXG4gKlxuICogQHBhcmFtIHt2ZWMzfSBvdXQgdGhlIHJlY2VpdmluZyB2ZWN0b3JcbiAqIEBwYXJhbSB7dmVjM30gYSB0aGUgZmlyc3Qgb3BlcmFuZFxuICogQHBhcmFtIHt2ZWMzfSBiIHRoZSBzZWNvbmQgb3BlcmFuZFxuICogQHJldHVybnMge3ZlYzN9IG91dFxuICovXG52ZWMzLm11bHRpcGx5ID0gZnVuY3Rpb24ob3V0LCBhLCBiKSB7XG4gICAgb3V0WzBdID0gYVswXSAqIGJbMF07XG4gICAgb3V0WzFdID0gYVsxXSAqIGJbMV07XG4gICAgb3V0WzJdID0gYVsyXSAqIGJbMl07XG4gICAgcmV0dXJuIG91dDtcbn07XG5cbi8qKlxuICogQWxpYXMgZm9yIHtAbGluayB2ZWMzLm11bHRpcGx5fVxuICogQGZ1bmN0aW9uXG4gKi9cbnZlYzMubXVsID0gdmVjMy5tdWx0aXBseTtcblxuLyoqXG4gKiBEaXZpZGVzIHR3byB2ZWMzJ3NcbiAqXG4gKiBAcGFyYW0ge3ZlYzN9IG91dCB0aGUgcmVjZWl2aW5nIHZlY3RvclxuICogQHBhcmFtIHt2ZWMzfSBhIHRoZSBmaXJzdCBvcGVyYW5kXG4gKiBAcGFyYW0ge3ZlYzN9IGIgdGhlIHNlY29uZCBvcGVyYW5kXG4gKiBAcmV0dXJucyB7dmVjM30gb3V0XG4gKi9cbnZlYzMuZGl2aWRlID0gZnVuY3Rpb24ob3V0LCBhLCBiKSB7XG4gICAgb3V0WzBdID0gYVswXSAvIGJbMF07XG4gICAgb3V0WzFdID0gYVsxXSAvIGJbMV07XG4gICAgb3V0WzJdID0gYVsyXSAvIGJbMl07XG4gICAgcmV0dXJuIG91dDtcbn07XG5cbi8qKlxuICogQWxpYXMgZm9yIHtAbGluayB2ZWMzLmRpdmlkZX1cbiAqIEBmdW5jdGlvblxuICovXG52ZWMzLmRpdiA9IHZlYzMuZGl2aWRlO1xuXG4vKipcbiAqIFJldHVybnMgdGhlIG1pbmltdW0gb2YgdHdvIHZlYzMnc1xuICpcbiAqIEBwYXJhbSB7dmVjM30gb3V0IHRoZSByZWNlaXZpbmcgdmVjdG9yXG4gKiBAcGFyYW0ge3ZlYzN9IGEgdGhlIGZpcnN0IG9wZXJhbmRcbiAqIEBwYXJhbSB7dmVjM30gYiB0aGUgc2Vjb25kIG9wZXJhbmRcbiAqIEByZXR1cm5zIHt2ZWMzfSBvdXRcbiAqL1xudmVjMy5taW4gPSBmdW5jdGlvbihvdXQsIGEsIGIpIHtcbiAgICBvdXRbMF0gPSBNYXRoLm1pbihhWzBdLCBiWzBdKTtcbiAgICBvdXRbMV0gPSBNYXRoLm1pbihhWzFdLCBiWzFdKTtcbiAgICBvdXRbMl0gPSBNYXRoLm1pbihhWzJdLCBiWzJdKTtcbiAgICByZXR1cm4gb3V0O1xufTtcblxuLyoqXG4gKiBSZXR1cm5zIHRoZSBtYXhpbXVtIG9mIHR3byB2ZWMzJ3NcbiAqXG4gKiBAcGFyYW0ge3ZlYzN9IG91dCB0aGUgcmVjZWl2aW5nIHZlY3RvclxuICogQHBhcmFtIHt2ZWMzfSBhIHRoZSBmaXJzdCBvcGVyYW5kXG4gKiBAcGFyYW0ge3ZlYzN9IGIgdGhlIHNlY29uZCBvcGVyYW5kXG4gKiBAcmV0dXJucyB7dmVjM30gb3V0XG4gKi9cbnZlYzMubWF4ID0gZnVuY3Rpb24ob3V0LCBhLCBiKSB7XG4gICAgb3V0WzBdID0gTWF0aC5tYXgoYVswXSwgYlswXSk7XG4gICAgb3V0WzFdID0gTWF0aC5tYXgoYVsxXSwgYlsxXSk7XG4gICAgb3V0WzJdID0gTWF0aC5tYXgoYVsyXSwgYlsyXSk7XG4gICAgcmV0dXJuIG91dDtcbn07XG5cbi8qKlxuICogU2NhbGVzIGEgdmVjMyBieSBhIHNjYWxhciBudW1iZXJcbiAqXG4gKiBAcGFyYW0ge3ZlYzN9IG91dCB0aGUgcmVjZWl2aW5nIHZlY3RvclxuICogQHBhcmFtIHt2ZWMzfSBhIHRoZSB2ZWN0b3IgdG8gc2NhbGVcbiAqIEBwYXJhbSB7TnVtYmVyfSBiIGFtb3VudCB0byBzY2FsZSB0aGUgdmVjdG9yIGJ5XG4gKiBAcmV0dXJucyB7dmVjM30gb3V0XG4gKi9cbnZlYzMuc2NhbGUgPSBmdW5jdGlvbihvdXQsIGEsIGIpIHtcbiAgICBvdXRbMF0gPSBhWzBdICogYjtcbiAgICBvdXRbMV0gPSBhWzFdICogYjtcbiAgICBvdXRbMl0gPSBhWzJdICogYjtcbiAgICByZXR1cm4gb3V0O1xufTtcblxuLyoqXG4gKiBDYWxjdWxhdGVzIHRoZSBldWNsaWRpYW4gZGlzdGFuY2UgYmV0d2VlbiB0d28gdmVjMydzXG4gKlxuICogQHBhcmFtIHt2ZWMzfSBhIHRoZSBmaXJzdCBvcGVyYW5kXG4gKiBAcGFyYW0ge3ZlYzN9IGIgdGhlIHNlY29uZCBvcGVyYW5kXG4gKiBAcmV0dXJucyB7TnVtYmVyfSBkaXN0YW5jZSBiZXR3ZWVuIGEgYW5kIGJcbiAqL1xudmVjMy5kaXN0YW5jZSA9IGZ1bmN0aW9uKGEsIGIpIHtcbiAgICB2YXIgeCA9IGJbMF0gLSBhWzBdLFxuICAgICAgICB5ID0gYlsxXSAtIGFbMV0sXG4gICAgICAgIHogPSBiWzJdIC0gYVsyXTtcbiAgICByZXR1cm4gTWF0aC5zcXJ0KHgqeCArIHkqeSArIHoqeik7XG59O1xuXG4vKipcbiAqIEFsaWFzIGZvciB7QGxpbmsgdmVjMy5kaXN0YW5jZX1cbiAqIEBmdW5jdGlvblxuICovXG52ZWMzLmRpc3QgPSB2ZWMzLmRpc3RhbmNlO1xuXG4vKipcbiAqIENhbGN1bGF0ZXMgdGhlIHNxdWFyZWQgZXVjbGlkaWFuIGRpc3RhbmNlIGJldHdlZW4gdHdvIHZlYzMnc1xuICpcbiAqIEBwYXJhbSB7dmVjM30gYSB0aGUgZmlyc3Qgb3BlcmFuZFxuICogQHBhcmFtIHt2ZWMzfSBiIHRoZSBzZWNvbmQgb3BlcmFuZFxuICogQHJldHVybnMge051bWJlcn0gc3F1YXJlZCBkaXN0YW5jZSBiZXR3ZWVuIGEgYW5kIGJcbiAqL1xudmVjMy5zcXVhcmVkRGlzdGFuY2UgPSBmdW5jdGlvbihhLCBiKSB7XG4gICAgdmFyIHggPSBiWzBdIC0gYVswXSxcbiAgICAgICAgeSA9IGJbMV0gLSBhWzFdLFxuICAgICAgICB6ID0gYlsyXSAtIGFbMl07XG4gICAgcmV0dXJuIHgqeCArIHkqeSArIHoqejtcbn07XG5cbi8qKlxuICogQWxpYXMgZm9yIHtAbGluayB2ZWMzLnNxdWFyZWREaXN0YW5jZX1cbiAqIEBmdW5jdGlvblxuICovXG52ZWMzLnNxckRpc3QgPSB2ZWMzLnNxdWFyZWREaXN0YW5jZTtcblxuLyoqXG4gKiBDYWxjdWxhdGVzIHRoZSBsZW5ndGggb2YgYSB2ZWMzXG4gKlxuICogQHBhcmFtIHt2ZWMzfSBhIHZlY3RvciB0byBjYWxjdWxhdGUgbGVuZ3RoIG9mXG4gKiBAcmV0dXJucyB7TnVtYmVyfSBsZW5ndGggb2YgYVxuICovXG52ZWMzLmxlbmd0aCA9IGZ1bmN0aW9uIChhKSB7XG4gICAgdmFyIHggPSBhWzBdLFxuICAgICAgICB5ID0gYVsxXSxcbiAgICAgICAgeiA9IGFbMl07XG4gICAgcmV0dXJuIE1hdGguc3FydCh4KnggKyB5KnkgKyB6KnopO1xufTtcblxuLyoqXG4gKiBBbGlhcyBmb3Ige0BsaW5rIHZlYzMubGVuZ3RofVxuICogQGZ1bmN0aW9uXG4gKi9cbnZlYzMubGVuID0gdmVjMy5sZW5ndGg7XG5cbi8qKlxuICogQ2FsY3VsYXRlcyB0aGUgc3F1YXJlZCBsZW5ndGggb2YgYSB2ZWMzXG4gKlxuICogQHBhcmFtIHt2ZWMzfSBhIHZlY3RvciB0byBjYWxjdWxhdGUgc3F1YXJlZCBsZW5ndGggb2ZcbiAqIEByZXR1cm5zIHtOdW1iZXJ9IHNxdWFyZWQgbGVuZ3RoIG9mIGFcbiAqL1xudmVjMy5zcXVhcmVkTGVuZ3RoID0gZnVuY3Rpb24gKGEpIHtcbiAgICB2YXIgeCA9IGFbMF0sXG4gICAgICAgIHkgPSBhWzFdLFxuICAgICAgICB6ID0gYVsyXTtcbiAgICByZXR1cm4geCp4ICsgeSp5ICsgeip6O1xufTtcblxuLyoqXG4gKiBBbGlhcyBmb3Ige0BsaW5rIHZlYzMuc3F1YXJlZExlbmd0aH1cbiAqIEBmdW5jdGlvblxuICovXG52ZWMzLnNxckxlbiA9IHZlYzMuc3F1YXJlZExlbmd0aDtcblxuLyoqXG4gKiBOZWdhdGVzIHRoZSBjb21wb25lbnRzIG9mIGEgdmVjM1xuICpcbiAqIEBwYXJhbSB7dmVjM30gb3V0IHRoZSByZWNlaXZpbmcgdmVjdG9yXG4gKiBAcGFyYW0ge3ZlYzN9IGEgdmVjdG9yIHRvIG5lZ2F0ZVxuICogQHJldHVybnMge3ZlYzN9IG91dFxuICovXG52ZWMzLm5lZ2F0ZSA9IGZ1bmN0aW9uKG91dCwgYSkge1xuICAgIG91dFswXSA9IC1hWzBdO1xuICAgIG91dFsxXSA9IC1hWzFdO1xuICAgIG91dFsyXSA9IC1hWzJdO1xuICAgIHJldHVybiBvdXQ7XG59O1xuXG4vKipcbiAqIE5vcm1hbGl6ZSBhIHZlYzNcbiAqXG4gKiBAcGFyYW0ge3ZlYzN9IG91dCB0aGUgcmVjZWl2aW5nIHZlY3RvclxuICogQHBhcmFtIHt2ZWMzfSBhIHZlY3RvciB0byBub3JtYWxpemVcbiAqIEByZXR1cm5zIHt2ZWMzfSBvdXRcbiAqL1xudmVjMy5ub3JtYWxpemUgPSBmdW5jdGlvbihvdXQsIGEpIHtcbiAgICB2YXIgeCA9IGFbMF0sXG4gICAgICAgIHkgPSBhWzFdLFxuICAgICAgICB6ID0gYVsyXTtcbiAgICB2YXIgbGVuID0geCp4ICsgeSp5ICsgeip6O1xuICAgIGlmIChsZW4gPiAwKSB7XG4gICAgICAgIC8vVE9ETzogZXZhbHVhdGUgdXNlIG9mIGdsbV9pbnZzcXJ0IGhlcmU/XG4gICAgICAgIGxlbiA9IDEgLyBNYXRoLnNxcnQobGVuKTtcbiAgICAgICAgb3V0WzBdID0gYVswXSAqIGxlbjtcbiAgICAgICAgb3V0WzFdID0gYVsxXSAqIGxlbjtcbiAgICAgICAgb3V0WzJdID0gYVsyXSAqIGxlbjtcbiAgICB9XG4gICAgcmV0dXJuIG91dDtcbn07XG5cbi8qKlxuICogQ2FsY3VsYXRlcyB0aGUgZG90IHByb2R1Y3Qgb2YgdHdvIHZlYzMnc1xuICpcbiAqIEBwYXJhbSB7dmVjM30gYSB0aGUgZmlyc3Qgb3BlcmFuZFxuICogQHBhcmFtIHt2ZWMzfSBiIHRoZSBzZWNvbmQgb3BlcmFuZFxuICogQHJldHVybnMge051bWJlcn0gZG90IHByb2R1Y3Qgb2YgYSBhbmQgYlxuICovXG52ZWMzLmRvdCA9IGZ1bmN0aW9uIChhLCBiKSB7XG4gICAgcmV0dXJuIGFbMF0gKiBiWzBdICsgYVsxXSAqIGJbMV0gKyBhWzJdICogYlsyXTtcbn07XG5cbi8qKlxuICogQ29tcHV0ZXMgdGhlIGNyb3NzIHByb2R1Y3Qgb2YgdHdvIHZlYzMnc1xuICpcbiAqIEBwYXJhbSB7dmVjM30gb3V0IHRoZSByZWNlaXZpbmcgdmVjdG9yXG4gKiBAcGFyYW0ge3ZlYzN9IGEgdGhlIGZpcnN0IG9wZXJhbmRcbiAqIEBwYXJhbSB7dmVjM30gYiB0aGUgc2Vjb25kIG9wZXJhbmRcbiAqIEByZXR1cm5zIHt2ZWMzfSBvdXRcbiAqL1xudmVjMy5jcm9zcyA9IGZ1bmN0aW9uKG91dCwgYSwgYikge1xuICAgIHZhciBheCA9IGFbMF0sIGF5ID0gYVsxXSwgYXogPSBhWzJdLFxuICAgICAgICBieCA9IGJbMF0sIGJ5ID0gYlsxXSwgYnogPSBiWzJdO1xuXG4gICAgb3V0WzBdID0gYXkgKiBieiAtIGF6ICogYnk7XG4gICAgb3V0WzFdID0gYXogKiBieCAtIGF4ICogYno7XG4gICAgb3V0WzJdID0gYXggKiBieSAtIGF5ICogYng7XG4gICAgcmV0dXJuIG91dDtcbn07XG5cbi8qKlxuICogUGVyZm9ybXMgYSBsaW5lYXIgaW50ZXJwb2xhdGlvbiBiZXR3ZWVuIHR3byB2ZWMzJ3NcbiAqXG4gKiBAcGFyYW0ge3ZlYzN9IG91dCB0aGUgcmVjZWl2aW5nIHZlY3RvclxuICogQHBhcmFtIHt2ZWMzfSBhIHRoZSBmaXJzdCBvcGVyYW5kXG4gKiBAcGFyYW0ge3ZlYzN9IGIgdGhlIHNlY29uZCBvcGVyYW5kXG4gKiBAcGFyYW0ge051bWJlcn0gdCBpbnRlcnBvbGF0aW9uIGFtb3VudCBiZXR3ZWVuIHRoZSB0d28gaW5wdXRzXG4gKiBAcmV0dXJucyB7dmVjM30gb3V0XG4gKi9cbnZlYzMubGVycCA9IGZ1bmN0aW9uIChvdXQsIGEsIGIsIHQpIHtcbiAgICB2YXIgYXggPSBhWzBdLFxuICAgICAgICBheSA9IGFbMV0sXG4gICAgICAgIGF6ID0gYVsyXTtcbiAgICBvdXRbMF0gPSBheCArIHQgKiAoYlswXSAtIGF4KTtcbiAgICBvdXRbMV0gPSBheSArIHQgKiAoYlsxXSAtIGF5KTtcbiAgICBvdXRbMl0gPSBheiArIHQgKiAoYlsyXSAtIGF6KTtcbiAgICByZXR1cm4gb3V0O1xufTtcblxuLyoqXG4gKiBUcmFuc2Zvcm1zIHRoZSB2ZWMzIHdpdGggYSBtYXQ0LlxuICogNHRoIHZlY3RvciBjb21wb25lbnQgaXMgaW1wbGljaXRseSAnMSdcbiAqXG4gKiBAcGFyYW0ge3ZlYzN9IG91dCB0aGUgcmVjZWl2aW5nIHZlY3RvclxuICogQHBhcmFtIHt2ZWMzfSBhIHRoZSB2ZWN0b3IgdG8gdHJhbnNmb3JtXG4gKiBAcGFyYW0ge21hdDR9IG0gbWF0cml4IHRvIHRyYW5zZm9ybSB3aXRoXG4gKiBAcmV0dXJucyB7dmVjM30gb3V0XG4gKi9cbnZlYzMudHJhbnNmb3JtTWF0NCA9IGZ1bmN0aW9uKG91dCwgYSwgbSkge1xuICAgIHZhciB4ID0gYVswXSwgeSA9IGFbMV0sIHogPSBhWzJdO1xuICAgIG91dFswXSA9IG1bMF0gKiB4ICsgbVs0XSAqIHkgKyBtWzhdICogeiArIG1bMTJdO1xuICAgIG91dFsxXSA9IG1bMV0gKiB4ICsgbVs1XSAqIHkgKyBtWzldICogeiArIG1bMTNdO1xuICAgIG91dFsyXSA9IG1bMl0gKiB4ICsgbVs2XSAqIHkgKyBtWzEwXSAqIHogKyBtWzE0XTtcbiAgICByZXR1cm4gb3V0O1xufTtcblxuLyoqXG4gKiBUcmFuc2Zvcm1zIHRoZSB2ZWMzIHdpdGggYSBxdWF0XG4gKlxuICogQHBhcmFtIHt2ZWMzfSBvdXQgdGhlIHJlY2VpdmluZyB2ZWN0b3JcbiAqIEBwYXJhbSB7dmVjM30gYSB0aGUgdmVjdG9yIHRvIHRyYW5zZm9ybVxuICogQHBhcmFtIHtxdWF0fSBxIHF1YXRlcm5pb24gdG8gdHJhbnNmb3JtIHdpdGhcbiAqIEByZXR1cm5zIHt2ZWMzfSBvdXRcbiAqL1xudmVjMy50cmFuc2Zvcm1RdWF0ID0gZnVuY3Rpb24ob3V0LCBhLCBxKSB7XG4gICAgdmFyIHggPSBhWzBdLCB5ID0gYVsxXSwgeiA9IGFbMl0sXG4gICAgICAgIHF4ID0gcVswXSwgcXkgPSBxWzFdLCBxeiA9IHFbMl0sIHF3ID0gcVszXSxcblxuICAgICAgICAvLyBjYWxjdWxhdGUgcXVhdCAqIHZlY1xuICAgICAgICBpeCA9IHF3ICogeCArIHF5ICogeiAtIHF6ICogeSxcbiAgICAgICAgaXkgPSBxdyAqIHkgKyBxeiAqIHggLSBxeCAqIHosXG4gICAgICAgIGl6ID0gcXcgKiB6ICsgcXggKiB5IC0gcXkgKiB4LFxuICAgICAgICBpdyA9IC1xeCAqIHggLSBxeSAqIHkgLSBxeiAqIHo7XG5cbiAgICAvLyBjYWxjdWxhdGUgcmVzdWx0ICogaW52ZXJzZSBxdWF0XG4gICAgb3V0WzBdID0gaXggKiBxdyArIGl3ICogLXF4ICsgaXkgKiAtcXogLSBpeiAqIC1xeTtcbiAgICBvdXRbMV0gPSBpeSAqIHF3ICsgaXcgKiAtcXkgKyBpeiAqIC1xeCAtIGl4ICogLXF6O1xuICAgIG91dFsyXSA9IGl6ICogcXcgKyBpdyAqIC1xeiArIGl4ICogLXF5IC0gaXkgKiAtcXg7XG4gICAgcmV0dXJuIG91dDtcbn07XG5cbi8qKlxuICogUGVyZm9ybSBzb21lIG9wZXJhdGlvbiBvdmVyIGFuIGFycmF5IG9mIHZlYzNzLlxuICpcbiAqIEBwYXJhbSB7QXJyYXl9IGEgdGhlIGFycmF5IG9mIHZlY3RvcnMgdG8gaXRlcmF0ZSBvdmVyXG4gKiBAcGFyYW0ge051bWJlcn0gc3RyaWRlIE51bWJlciBvZiBlbGVtZW50cyBiZXR3ZWVuIHRoZSBzdGFydCBvZiBlYWNoIHZlYzMuIElmIDAgYXNzdW1lcyB0aWdodGx5IHBhY2tlZFxuICogQHBhcmFtIHtOdW1iZXJ9IG9mZnNldCBOdW1iZXIgb2YgZWxlbWVudHMgdG8gc2tpcCBhdCB0aGUgYmVnaW5uaW5nIG9mIHRoZSBhcnJheVxuICogQHBhcmFtIHtOdW1iZXJ9IGNvdW50IE51bWJlciBvZiB2ZWMzcyB0byBpdGVyYXRlIG92ZXIuIElmIDAgaXRlcmF0ZXMgb3ZlciBlbnRpcmUgYXJyYXlcbiAqIEBwYXJhbSB7RnVuY3Rpb259IGZuIEZ1bmN0aW9uIHRvIGNhbGwgZm9yIGVhY2ggdmVjdG9yIGluIHRoZSBhcnJheVxuICogQHBhcmFtIHtPYmplY3R9IFthcmddIGFkZGl0aW9uYWwgYXJndW1lbnQgdG8gcGFzcyB0byBmblxuICogQHJldHVybnMge0FycmF5fSBhXG4gKiBAZnVuY3Rpb25cbiAqL1xudmVjMy5mb3JFYWNoID0gKGZ1bmN0aW9uKCkge1xuICAgIHZhciB2ZWMgPSB2ZWMzLmNyZWF0ZSgpO1xuXG4gICAgcmV0dXJuIGZ1bmN0aW9uKGEsIHN0cmlkZSwgb2Zmc2V0LCBjb3VudCwgZm4sIGFyZykge1xuICAgICAgICB2YXIgaSwgbDtcbiAgICAgICAgaWYoIXN0cmlkZSkge1xuICAgICAgICAgICAgc3RyaWRlID0gMztcbiAgICAgICAgfVxuXG4gICAgICAgIGlmKCFvZmZzZXQpIHtcbiAgICAgICAgICAgIG9mZnNldCA9IDA7XG4gICAgICAgIH1cbiAgICAgICAgXG4gICAgICAgIGlmKGNvdW50KSB7XG4gICAgICAgICAgICBsID0gTWF0aC5taW4oKGNvdW50ICogc3RyaWRlKSArIG9mZnNldCwgYS5sZW5ndGgpO1xuICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgbCA9IGEubGVuZ3RoO1xuICAgICAgICB9XG5cbiAgICAgICAgZm9yKGkgPSBvZmZzZXQ7IGkgPCBsOyBpICs9IHN0cmlkZSkge1xuICAgICAgICAgICAgdmVjWzBdID0gYVtpXTsgdmVjWzFdID0gYVtpKzFdOyB2ZWNbMl0gPSBhW2krMl07XG4gICAgICAgICAgICBmbih2ZWMsIHZlYywgYXJnKTtcbiAgICAgICAgICAgIGFbaV0gPSB2ZWNbMF07IGFbaSsxXSA9IHZlY1sxXTsgYVtpKzJdID0gdmVjWzJdO1xuICAgICAgICB9XG4gICAgICAgIFxuICAgICAgICByZXR1cm4gYTtcbiAgICB9O1xufSkoKTtcblxuLyoqXG4gKiBSZXR1cm5zIGEgc3RyaW5nIHJlcHJlc2VudGF0aW9uIG9mIGEgdmVjdG9yXG4gKlxuICogQHBhcmFtIHt2ZWMzfSB2ZWMgdmVjdG9yIHRvIHJlcHJlc2VudCBhcyBhIHN0cmluZ1xuICogQHJldHVybnMge1N0cmluZ30gc3RyaW5nIHJlcHJlc2VudGF0aW9uIG9mIHRoZSB2ZWN0b3JcbiAqL1xudmVjMy5zdHIgPSBmdW5jdGlvbiAoYSkge1xuICAgIHJldHVybiAndmVjMygnICsgYVswXSArICcsICcgKyBhWzFdICsgJywgJyArIGFbMl0gKyAnKSc7XG59O1xuXG5pZih0eXBlb2YoZXhwb3J0cykgIT09ICd1bmRlZmluZWQnKSB7XG4gICAgZXhwb3J0cy52ZWMzID0gdmVjMztcbn1cbjtcbi8qIENvcHlyaWdodCAoYykgMjAxMywgQnJhbmRvbiBKb25lcywgQ29saW4gTWFjS2VuemllIElWLiBBbGwgcmlnaHRzIHJlc2VydmVkLlxuXG5SZWRpc3RyaWJ1dGlvbiBhbmQgdXNlIGluIHNvdXJjZSBhbmQgYmluYXJ5IGZvcm1zLCB3aXRoIG9yIHdpdGhvdXQgbW9kaWZpY2F0aW9uLFxuYXJlIHBlcm1pdHRlZCBwcm92aWRlZCB0aGF0IHRoZSBmb2xsb3dpbmcgY29uZGl0aW9ucyBhcmUgbWV0OlxuXG4gICogUmVkaXN0cmlidXRpb25zIG9mIHNvdXJjZSBjb2RlIG11c3QgcmV0YWluIHRoZSBhYm92ZSBjb3B5cmlnaHQgbm90aWNlLCB0aGlzXG4gICAgbGlzdCBvZiBjb25kaXRpb25zIGFuZCB0aGUgZm9sbG93aW5nIGRpc2NsYWltZXIuXG4gICogUmVkaXN0cmlidXRpb25zIGluIGJpbmFyeSBmb3JtIG11c3QgcmVwcm9kdWNlIHRoZSBhYm92ZSBjb3B5cmlnaHQgbm90aWNlLFxuICAgIHRoaXMgbGlzdCBvZiBjb25kaXRpb25zIGFuZCB0aGUgZm9sbG93aW5nIGRpc2NsYWltZXIgaW4gdGhlIGRvY3VtZW50YXRpb24gXG4gICAgYW5kL29yIG90aGVyIG1hdGVyaWFscyBwcm92aWRlZCB3aXRoIHRoZSBkaXN0cmlidXRpb24uXG5cblRISVMgU09GVFdBUkUgSVMgUFJPVklERUQgQlkgVEhFIENPUFlSSUdIVCBIT0xERVJTIEFORCBDT05UUklCVVRPUlMgXCJBUyBJU1wiIEFORFxuQU5ZIEVYUFJFU1MgT1IgSU1QTElFRCBXQVJSQU5USUVTLCBJTkNMVURJTkcsIEJVVCBOT1QgTElNSVRFRCBUTywgVEhFIElNUExJRURcbldBUlJBTlRJRVMgT0YgTUVSQ0hBTlRBQklMSVRZIEFORCBGSVRORVNTIEZPUiBBIFBBUlRJQ1VMQVIgUFVSUE9TRSBBUkUgXG5ESVNDTEFJTUVELiBJTiBOTyBFVkVOVCBTSEFMTCBUSEUgQ09QWVJJR0hUIEhPTERFUiBPUiBDT05UUklCVVRPUlMgQkUgTElBQkxFIEZPUlxuQU5ZIERJUkVDVCwgSU5ESVJFQ1QsIElOQ0lERU5UQUwsIFNQRUNJQUwsIEVYRU1QTEFSWSwgT1IgQ09OU0VRVUVOVElBTCBEQU1BR0VTXG4oSU5DTFVESU5HLCBCVVQgTk9UIExJTUlURUQgVE8sIFBST0NVUkVNRU5UIE9GIFNVQlNUSVRVVEUgR09PRFMgT1IgU0VSVklDRVM7XG5MT1NTIE9GIFVTRSwgREFUQSwgT1IgUFJPRklUUzsgT1IgQlVTSU5FU1MgSU5URVJSVVBUSU9OKSBIT1dFVkVSIENBVVNFRCBBTkQgT05cbkFOWSBUSEVPUlkgT0YgTElBQklMSVRZLCBXSEVUSEVSIElOIENPTlRSQUNULCBTVFJJQ1QgTElBQklMSVRZLCBPUiBUT1JUXG4oSU5DTFVESU5HIE5FR0xJR0VOQ0UgT1IgT1RIRVJXSVNFKSBBUklTSU5HIElOIEFOWSBXQVkgT1VUIE9GIFRIRSBVU0UgT0YgVEhJU1xuU09GVFdBUkUsIEVWRU4gSUYgQURWSVNFRCBPRiBUSEUgUE9TU0lCSUxJVFkgT0YgU1VDSCBEQU1BR0UuICovXG5cbi8qKlxuICogQGNsYXNzIDQgRGltZW5zaW9uYWwgVmVjdG9yXG4gKiBAbmFtZSB2ZWM0XG4gKi9cblxudmFyIHZlYzQgPSB7fTtcblxuLyoqXG4gKiBDcmVhdGVzIGEgbmV3LCBlbXB0eSB2ZWM0XG4gKlxuICogQHJldHVybnMge3ZlYzR9IGEgbmV3IDREIHZlY3RvclxuICovXG52ZWM0LmNyZWF0ZSA9IGZ1bmN0aW9uKCkge1xuICAgIHZhciBvdXQgPSBuZXcgR0xNQVRfQVJSQVlfVFlQRSg0KTtcbiAgICBvdXRbMF0gPSAwO1xuICAgIG91dFsxXSA9IDA7XG4gICAgb3V0WzJdID0gMDtcbiAgICBvdXRbM10gPSAwO1xuICAgIHJldHVybiBvdXQ7XG59O1xuXG4vKipcbiAqIENyZWF0ZXMgYSBuZXcgdmVjNCBpbml0aWFsaXplZCB3aXRoIHZhbHVlcyBmcm9tIGFuIGV4aXN0aW5nIHZlY3RvclxuICpcbiAqIEBwYXJhbSB7dmVjNH0gYSB2ZWN0b3IgdG8gY2xvbmVcbiAqIEByZXR1cm5zIHt2ZWM0fSBhIG5ldyA0RCB2ZWN0b3JcbiAqL1xudmVjNC5jbG9uZSA9IGZ1bmN0aW9uKGEpIHtcbiAgICB2YXIgb3V0ID0gbmV3IEdMTUFUX0FSUkFZX1RZUEUoNCk7XG4gICAgb3V0WzBdID0gYVswXTtcbiAgICBvdXRbMV0gPSBhWzFdO1xuICAgIG91dFsyXSA9IGFbMl07XG4gICAgb3V0WzNdID0gYVszXTtcbiAgICByZXR1cm4gb3V0O1xufTtcblxuLyoqXG4gKiBDcmVhdGVzIGEgbmV3IHZlYzQgaW5pdGlhbGl6ZWQgd2l0aCB0aGUgZ2l2ZW4gdmFsdWVzXG4gKlxuICogQHBhcmFtIHtOdW1iZXJ9IHggWCBjb21wb25lbnRcbiAqIEBwYXJhbSB7TnVtYmVyfSB5IFkgY29tcG9uZW50XG4gKiBAcGFyYW0ge051bWJlcn0geiBaIGNvbXBvbmVudFxuICogQHBhcmFtIHtOdW1iZXJ9IHcgVyBjb21wb25lbnRcbiAqIEByZXR1cm5zIHt2ZWM0fSBhIG5ldyA0RCB2ZWN0b3JcbiAqL1xudmVjNC5mcm9tVmFsdWVzID0gZnVuY3Rpb24oeCwgeSwgeiwgdykge1xuICAgIHZhciBvdXQgPSBuZXcgR0xNQVRfQVJSQVlfVFlQRSg0KTtcbiAgICBvdXRbMF0gPSB4O1xuICAgIG91dFsxXSA9IHk7XG4gICAgb3V0WzJdID0gejtcbiAgICBvdXRbM10gPSB3O1xuICAgIHJldHVybiBvdXQ7XG59O1xuXG4vKipcbiAqIENvcHkgdGhlIHZhbHVlcyBmcm9tIG9uZSB2ZWM0IHRvIGFub3RoZXJcbiAqXG4gKiBAcGFyYW0ge3ZlYzR9IG91dCB0aGUgcmVjZWl2aW5nIHZlY3RvclxuICogQHBhcmFtIHt2ZWM0fSBhIHRoZSBzb3VyY2UgdmVjdG9yXG4gKiBAcmV0dXJucyB7dmVjNH0gb3V0XG4gKi9cbnZlYzQuY29weSA9IGZ1bmN0aW9uKG91dCwgYSkge1xuICAgIG91dFswXSA9IGFbMF07XG4gICAgb3V0WzFdID0gYVsxXTtcbiAgICBvdXRbMl0gPSBhWzJdO1xuICAgIG91dFszXSA9IGFbM107XG4gICAgcmV0dXJuIG91dDtcbn07XG5cbi8qKlxuICogU2V0IHRoZSBjb21wb25lbnRzIG9mIGEgdmVjNCB0byB0aGUgZ2l2ZW4gdmFsdWVzXG4gKlxuICogQHBhcmFtIHt2ZWM0fSBvdXQgdGhlIHJlY2VpdmluZyB2ZWN0b3JcbiAqIEBwYXJhbSB7TnVtYmVyfSB4IFggY29tcG9uZW50XG4gKiBAcGFyYW0ge051bWJlcn0geSBZIGNvbXBvbmVudFxuICogQHBhcmFtIHtOdW1iZXJ9IHogWiBjb21wb25lbnRcbiAqIEBwYXJhbSB7TnVtYmVyfSB3IFcgY29tcG9uZW50XG4gKiBAcmV0dXJucyB7dmVjNH0gb3V0XG4gKi9cbnZlYzQuc2V0ID0gZnVuY3Rpb24ob3V0LCB4LCB5LCB6LCB3KSB7XG4gICAgb3V0WzBdID0geDtcbiAgICBvdXRbMV0gPSB5O1xuICAgIG91dFsyXSA9IHo7XG4gICAgb3V0WzNdID0gdztcbiAgICByZXR1cm4gb3V0O1xufTtcblxuLyoqXG4gKiBBZGRzIHR3byB2ZWM0J3NcbiAqXG4gKiBAcGFyYW0ge3ZlYzR9IG91dCB0aGUgcmVjZWl2aW5nIHZlY3RvclxuICogQHBhcmFtIHt2ZWM0fSBhIHRoZSBmaXJzdCBvcGVyYW5kXG4gKiBAcGFyYW0ge3ZlYzR9IGIgdGhlIHNlY29uZCBvcGVyYW5kXG4gKiBAcmV0dXJucyB7dmVjNH0gb3V0XG4gKi9cbnZlYzQuYWRkID0gZnVuY3Rpb24ob3V0LCBhLCBiKSB7XG4gICAgb3V0WzBdID0gYVswXSArIGJbMF07XG4gICAgb3V0WzFdID0gYVsxXSArIGJbMV07XG4gICAgb3V0WzJdID0gYVsyXSArIGJbMl07XG4gICAgb3V0WzNdID0gYVszXSArIGJbM107XG4gICAgcmV0dXJuIG91dDtcbn07XG5cbi8qKlxuICogU3VidHJhY3RzIHR3byB2ZWM0J3NcbiAqXG4gKiBAcGFyYW0ge3ZlYzR9IG91dCB0aGUgcmVjZWl2aW5nIHZlY3RvclxuICogQHBhcmFtIHt2ZWM0fSBhIHRoZSBmaXJzdCBvcGVyYW5kXG4gKiBAcGFyYW0ge3ZlYzR9IGIgdGhlIHNlY29uZCBvcGVyYW5kXG4gKiBAcmV0dXJucyB7dmVjNH0gb3V0XG4gKi9cbnZlYzQuc3VidHJhY3QgPSBmdW5jdGlvbihvdXQsIGEsIGIpIHtcbiAgICBvdXRbMF0gPSBhWzBdIC0gYlswXTtcbiAgICBvdXRbMV0gPSBhWzFdIC0gYlsxXTtcbiAgICBvdXRbMl0gPSBhWzJdIC0gYlsyXTtcbiAgICBvdXRbM10gPSBhWzNdIC0gYlszXTtcbiAgICByZXR1cm4gb3V0O1xufTtcblxuLyoqXG4gKiBBbGlhcyBmb3Ige0BsaW5rIHZlYzQuc3VidHJhY3R9XG4gKiBAZnVuY3Rpb25cbiAqL1xudmVjNC5zdWIgPSB2ZWM0LnN1YnRyYWN0O1xuXG4vKipcbiAqIE11bHRpcGxpZXMgdHdvIHZlYzQnc1xuICpcbiAqIEBwYXJhbSB7dmVjNH0gb3V0IHRoZSByZWNlaXZpbmcgdmVjdG9yXG4gKiBAcGFyYW0ge3ZlYzR9IGEgdGhlIGZpcnN0IG9wZXJhbmRcbiAqIEBwYXJhbSB7dmVjNH0gYiB0aGUgc2Vjb25kIG9wZXJhbmRcbiAqIEByZXR1cm5zIHt2ZWM0fSBvdXRcbiAqL1xudmVjNC5tdWx0aXBseSA9IGZ1bmN0aW9uKG91dCwgYSwgYikge1xuICAgIG91dFswXSA9IGFbMF0gKiBiWzBdO1xuICAgIG91dFsxXSA9IGFbMV0gKiBiWzFdO1xuICAgIG91dFsyXSA9IGFbMl0gKiBiWzJdO1xuICAgIG91dFszXSA9IGFbM10gKiBiWzNdO1xuICAgIHJldHVybiBvdXQ7XG59O1xuXG4vKipcbiAqIEFsaWFzIGZvciB7QGxpbmsgdmVjNC5tdWx0aXBseX1cbiAqIEBmdW5jdGlvblxuICovXG52ZWM0Lm11bCA9IHZlYzQubXVsdGlwbHk7XG5cbi8qKlxuICogRGl2aWRlcyB0d28gdmVjNCdzXG4gKlxuICogQHBhcmFtIHt2ZWM0fSBvdXQgdGhlIHJlY2VpdmluZyB2ZWN0b3JcbiAqIEBwYXJhbSB7dmVjNH0gYSB0aGUgZmlyc3Qgb3BlcmFuZFxuICogQHBhcmFtIHt2ZWM0fSBiIHRoZSBzZWNvbmQgb3BlcmFuZFxuICogQHJldHVybnMge3ZlYzR9IG91dFxuICovXG52ZWM0LmRpdmlkZSA9IGZ1bmN0aW9uKG91dCwgYSwgYikge1xuICAgIG91dFswXSA9IGFbMF0gLyBiWzBdO1xuICAgIG91dFsxXSA9IGFbMV0gLyBiWzFdO1xuICAgIG91dFsyXSA9IGFbMl0gLyBiWzJdO1xuICAgIG91dFszXSA9IGFbM10gLyBiWzNdO1xuICAgIHJldHVybiBvdXQ7XG59O1xuXG4vKipcbiAqIEFsaWFzIGZvciB7QGxpbmsgdmVjNC5kaXZpZGV9XG4gKiBAZnVuY3Rpb25cbiAqL1xudmVjNC5kaXYgPSB2ZWM0LmRpdmlkZTtcblxuLyoqXG4gKiBSZXR1cm5zIHRoZSBtaW5pbXVtIG9mIHR3byB2ZWM0J3NcbiAqXG4gKiBAcGFyYW0ge3ZlYzR9IG91dCB0aGUgcmVjZWl2aW5nIHZlY3RvclxuICogQHBhcmFtIHt2ZWM0fSBhIHRoZSBmaXJzdCBvcGVyYW5kXG4gKiBAcGFyYW0ge3ZlYzR9IGIgdGhlIHNlY29uZCBvcGVyYW5kXG4gKiBAcmV0dXJucyB7dmVjNH0gb3V0XG4gKi9cbnZlYzQubWluID0gZnVuY3Rpb24ob3V0LCBhLCBiKSB7XG4gICAgb3V0WzBdID0gTWF0aC5taW4oYVswXSwgYlswXSk7XG4gICAgb3V0WzFdID0gTWF0aC5taW4oYVsxXSwgYlsxXSk7XG4gICAgb3V0WzJdID0gTWF0aC5taW4oYVsyXSwgYlsyXSk7XG4gICAgb3V0WzNdID0gTWF0aC5taW4oYVszXSwgYlszXSk7XG4gICAgcmV0dXJuIG91dDtcbn07XG5cbi8qKlxuICogUmV0dXJucyB0aGUgbWF4aW11bSBvZiB0d28gdmVjNCdzXG4gKlxuICogQHBhcmFtIHt2ZWM0fSBvdXQgdGhlIHJlY2VpdmluZyB2ZWN0b3JcbiAqIEBwYXJhbSB7dmVjNH0gYSB0aGUgZmlyc3Qgb3BlcmFuZFxuICogQHBhcmFtIHt2ZWM0fSBiIHRoZSBzZWNvbmQgb3BlcmFuZFxuICogQHJldHVybnMge3ZlYzR9IG91dFxuICovXG52ZWM0Lm1heCA9IGZ1bmN0aW9uKG91dCwgYSwgYikge1xuICAgIG91dFswXSA9IE1hdGgubWF4KGFbMF0sIGJbMF0pO1xuICAgIG91dFsxXSA9IE1hdGgubWF4KGFbMV0sIGJbMV0pO1xuICAgIG91dFsyXSA9IE1hdGgubWF4KGFbMl0sIGJbMl0pO1xuICAgIG91dFszXSA9IE1hdGgubWF4KGFbM10sIGJbM10pO1xuICAgIHJldHVybiBvdXQ7XG59O1xuXG4vKipcbiAqIFNjYWxlcyBhIHZlYzQgYnkgYSBzY2FsYXIgbnVtYmVyXG4gKlxuICogQHBhcmFtIHt2ZWM0fSBvdXQgdGhlIHJlY2VpdmluZyB2ZWN0b3JcbiAqIEBwYXJhbSB7dmVjNH0gYSB0aGUgdmVjdG9yIHRvIHNjYWxlXG4gKiBAcGFyYW0ge051bWJlcn0gYiBhbW91bnQgdG8gc2NhbGUgdGhlIHZlY3RvciBieVxuICogQHJldHVybnMge3ZlYzR9IG91dFxuICovXG52ZWM0LnNjYWxlID0gZnVuY3Rpb24ob3V0LCBhLCBiKSB7XG4gICAgb3V0WzBdID0gYVswXSAqIGI7XG4gICAgb3V0WzFdID0gYVsxXSAqIGI7XG4gICAgb3V0WzJdID0gYVsyXSAqIGI7XG4gICAgb3V0WzNdID0gYVszXSAqIGI7XG4gICAgcmV0dXJuIG91dDtcbn07XG5cbi8qKlxuICogQ2FsY3VsYXRlcyB0aGUgZXVjbGlkaWFuIGRpc3RhbmNlIGJldHdlZW4gdHdvIHZlYzQnc1xuICpcbiAqIEBwYXJhbSB7dmVjNH0gYSB0aGUgZmlyc3Qgb3BlcmFuZFxuICogQHBhcmFtIHt2ZWM0fSBiIHRoZSBzZWNvbmQgb3BlcmFuZFxuICogQHJldHVybnMge051bWJlcn0gZGlzdGFuY2UgYmV0d2VlbiBhIGFuZCBiXG4gKi9cbnZlYzQuZGlzdGFuY2UgPSBmdW5jdGlvbihhLCBiKSB7XG4gICAgdmFyIHggPSBiWzBdIC0gYVswXSxcbiAgICAgICAgeSA9IGJbMV0gLSBhWzFdLFxuICAgICAgICB6ID0gYlsyXSAtIGFbMl0sXG4gICAgICAgIHcgPSBiWzNdIC0gYVszXTtcbiAgICByZXR1cm4gTWF0aC5zcXJ0KHgqeCArIHkqeSArIHoqeiArIHcqdyk7XG59O1xuXG4vKipcbiAqIEFsaWFzIGZvciB7QGxpbmsgdmVjNC5kaXN0YW5jZX1cbiAqIEBmdW5jdGlvblxuICovXG52ZWM0LmRpc3QgPSB2ZWM0LmRpc3RhbmNlO1xuXG4vKipcbiAqIENhbGN1bGF0ZXMgdGhlIHNxdWFyZWQgZXVjbGlkaWFuIGRpc3RhbmNlIGJldHdlZW4gdHdvIHZlYzQnc1xuICpcbiAqIEBwYXJhbSB7dmVjNH0gYSB0aGUgZmlyc3Qgb3BlcmFuZFxuICogQHBhcmFtIHt2ZWM0fSBiIHRoZSBzZWNvbmQgb3BlcmFuZFxuICogQHJldHVybnMge051bWJlcn0gc3F1YXJlZCBkaXN0YW5jZSBiZXR3ZWVuIGEgYW5kIGJcbiAqL1xudmVjNC5zcXVhcmVkRGlzdGFuY2UgPSBmdW5jdGlvbihhLCBiKSB7XG4gICAgdmFyIHggPSBiWzBdIC0gYVswXSxcbiAgICAgICAgeSA9IGJbMV0gLSBhWzFdLFxuICAgICAgICB6ID0gYlsyXSAtIGFbMl0sXG4gICAgICAgIHcgPSBiWzNdIC0gYVszXTtcbiAgICByZXR1cm4geCp4ICsgeSp5ICsgeip6ICsgdyp3O1xufTtcblxuLyoqXG4gKiBBbGlhcyBmb3Ige0BsaW5rIHZlYzQuc3F1YXJlZERpc3RhbmNlfVxuICogQGZ1bmN0aW9uXG4gKi9cbnZlYzQuc3FyRGlzdCA9IHZlYzQuc3F1YXJlZERpc3RhbmNlO1xuXG4vKipcbiAqIENhbGN1bGF0ZXMgdGhlIGxlbmd0aCBvZiBhIHZlYzRcbiAqXG4gKiBAcGFyYW0ge3ZlYzR9IGEgdmVjdG9yIHRvIGNhbGN1bGF0ZSBsZW5ndGggb2ZcbiAqIEByZXR1cm5zIHtOdW1iZXJ9IGxlbmd0aCBvZiBhXG4gKi9cbnZlYzQubGVuZ3RoID0gZnVuY3Rpb24gKGEpIHtcbiAgICB2YXIgeCA9IGFbMF0sXG4gICAgICAgIHkgPSBhWzFdLFxuICAgICAgICB6ID0gYVsyXSxcbiAgICAgICAgdyA9IGFbM107XG4gICAgcmV0dXJuIE1hdGguc3FydCh4KnggKyB5KnkgKyB6KnogKyB3KncpO1xufTtcblxuLyoqXG4gKiBBbGlhcyBmb3Ige0BsaW5rIHZlYzQubGVuZ3RofVxuICogQGZ1bmN0aW9uXG4gKi9cbnZlYzQubGVuID0gdmVjNC5sZW5ndGg7XG5cbi8qKlxuICogQ2FsY3VsYXRlcyB0aGUgc3F1YXJlZCBsZW5ndGggb2YgYSB2ZWM0XG4gKlxuICogQHBhcmFtIHt2ZWM0fSBhIHZlY3RvciB0byBjYWxjdWxhdGUgc3F1YXJlZCBsZW5ndGggb2ZcbiAqIEByZXR1cm5zIHtOdW1iZXJ9IHNxdWFyZWQgbGVuZ3RoIG9mIGFcbiAqL1xudmVjNC5zcXVhcmVkTGVuZ3RoID0gZnVuY3Rpb24gKGEpIHtcbiAgICB2YXIgeCA9IGFbMF0sXG4gICAgICAgIHkgPSBhWzFdLFxuICAgICAgICB6ID0gYVsyXSxcbiAgICAgICAgdyA9IGFbM107XG4gICAgcmV0dXJuIHgqeCArIHkqeSArIHoqeiArIHcqdztcbn07XG5cbi8qKlxuICogQWxpYXMgZm9yIHtAbGluayB2ZWM0LnNxdWFyZWRMZW5ndGh9XG4gKiBAZnVuY3Rpb25cbiAqL1xudmVjNC5zcXJMZW4gPSB2ZWM0LnNxdWFyZWRMZW5ndGg7XG5cbi8qKlxuICogTmVnYXRlcyB0aGUgY29tcG9uZW50cyBvZiBhIHZlYzRcbiAqXG4gKiBAcGFyYW0ge3ZlYzR9IG91dCB0aGUgcmVjZWl2aW5nIHZlY3RvclxuICogQHBhcmFtIHt2ZWM0fSBhIHZlY3RvciB0byBuZWdhdGVcbiAqIEByZXR1cm5zIHt2ZWM0fSBvdXRcbiAqL1xudmVjNC5uZWdhdGUgPSBmdW5jdGlvbihvdXQsIGEpIHtcbiAgICBvdXRbMF0gPSAtYVswXTtcbiAgICBvdXRbMV0gPSAtYVsxXTtcbiAgICBvdXRbMl0gPSAtYVsyXTtcbiAgICBvdXRbM10gPSAtYVszXTtcbiAgICByZXR1cm4gb3V0O1xufTtcblxuLyoqXG4gKiBOb3JtYWxpemUgYSB2ZWM0XG4gKlxuICogQHBhcmFtIHt2ZWM0fSBvdXQgdGhlIHJlY2VpdmluZyB2ZWN0b3JcbiAqIEBwYXJhbSB7dmVjNH0gYSB2ZWN0b3IgdG8gbm9ybWFsaXplXG4gKiBAcmV0dXJucyB7dmVjNH0gb3V0XG4gKi9cbnZlYzQubm9ybWFsaXplID0gZnVuY3Rpb24ob3V0LCBhKSB7XG4gICAgdmFyIHggPSBhWzBdLFxuICAgICAgICB5ID0gYVsxXSxcbiAgICAgICAgeiA9IGFbMl0sXG4gICAgICAgIHcgPSBhWzNdO1xuICAgIHZhciBsZW4gPSB4KnggKyB5KnkgKyB6KnogKyB3Knc7XG4gICAgaWYgKGxlbiA+IDApIHtcbiAgICAgICAgbGVuID0gMSAvIE1hdGguc3FydChsZW4pO1xuICAgICAgICBvdXRbMF0gPSBhWzBdICogbGVuO1xuICAgICAgICBvdXRbMV0gPSBhWzFdICogbGVuO1xuICAgICAgICBvdXRbMl0gPSBhWzJdICogbGVuO1xuICAgICAgICBvdXRbM10gPSBhWzNdICogbGVuO1xuICAgIH1cbiAgICByZXR1cm4gb3V0O1xufTtcblxuLyoqXG4gKiBDYWxjdWxhdGVzIHRoZSBkb3QgcHJvZHVjdCBvZiB0d28gdmVjNCdzXG4gKlxuICogQHBhcmFtIHt2ZWM0fSBhIHRoZSBmaXJzdCBvcGVyYW5kXG4gKiBAcGFyYW0ge3ZlYzR9IGIgdGhlIHNlY29uZCBvcGVyYW5kXG4gKiBAcmV0dXJucyB7TnVtYmVyfSBkb3QgcHJvZHVjdCBvZiBhIGFuZCBiXG4gKi9cbnZlYzQuZG90ID0gZnVuY3Rpb24gKGEsIGIpIHtcbiAgICByZXR1cm4gYVswXSAqIGJbMF0gKyBhWzFdICogYlsxXSArIGFbMl0gKiBiWzJdICsgYVszXSAqIGJbM107XG59O1xuXG4vKipcbiAqIFBlcmZvcm1zIGEgbGluZWFyIGludGVycG9sYXRpb24gYmV0d2VlbiB0d28gdmVjNCdzXG4gKlxuICogQHBhcmFtIHt2ZWM0fSBvdXQgdGhlIHJlY2VpdmluZyB2ZWN0b3JcbiAqIEBwYXJhbSB7dmVjNH0gYSB0aGUgZmlyc3Qgb3BlcmFuZFxuICogQHBhcmFtIHt2ZWM0fSBiIHRoZSBzZWNvbmQgb3BlcmFuZFxuICogQHBhcmFtIHtOdW1iZXJ9IHQgaW50ZXJwb2xhdGlvbiBhbW91bnQgYmV0d2VlbiB0aGUgdHdvIGlucHV0c1xuICogQHJldHVybnMge3ZlYzR9IG91dFxuICovXG52ZWM0LmxlcnAgPSBmdW5jdGlvbiAob3V0LCBhLCBiLCB0KSB7XG4gICAgdmFyIGF4ID0gYVswXSxcbiAgICAgICAgYXkgPSBhWzFdLFxuICAgICAgICBheiA9IGFbMl0sXG4gICAgICAgIGF3ID0gYVszXTtcbiAgICBvdXRbMF0gPSBheCArIHQgKiAoYlswXSAtIGF4KTtcbiAgICBvdXRbMV0gPSBheSArIHQgKiAoYlsxXSAtIGF5KTtcbiAgICBvdXRbMl0gPSBheiArIHQgKiAoYlsyXSAtIGF6KTtcbiAgICBvdXRbM10gPSBhdyArIHQgKiAoYlszXSAtIGF3KTtcbiAgICByZXR1cm4gb3V0O1xufTtcblxuLyoqXG4gKiBUcmFuc2Zvcm1zIHRoZSB2ZWM0IHdpdGggYSBtYXQ0LlxuICpcbiAqIEBwYXJhbSB7dmVjNH0gb3V0IHRoZSByZWNlaXZpbmcgdmVjdG9yXG4gKiBAcGFyYW0ge3ZlYzR9IGEgdGhlIHZlY3RvciB0byB0cmFuc2Zvcm1cbiAqIEBwYXJhbSB7bWF0NH0gbSBtYXRyaXggdG8gdHJhbnNmb3JtIHdpdGhcbiAqIEByZXR1cm5zIHt2ZWM0fSBvdXRcbiAqL1xudmVjNC50cmFuc2Zvcm1NYXQ0ID0gZnVuY3Rpb24ob3V0LCBhLCBtKSB7XG4gICAgdmFyIHggPSBhWzBdLCB5ID0gYVsxXSwgeiA9IGFbMl0sIHcgPSBhWzNdO1xuICAgIG91dFswXSA9IG1bMF0gKiB4ICsgbVs0XSAqIHkgKyBtWzhdICogeiArIG1bMTJdICogdztcbiAgICBvdXRbMV0gPSBtWzFdICogeCArIG1bNV0gKiB5ICsgbVs5XSAqIHogKyBtWzEzXSAqIHc7XG4gICAgb3V0WzJdID0gbVsyXSAqIHggKyBtWzZdICogeSArIG1bMTBdICogeiArIG1bMTRdICogdztcbiAgICBvdXRbM10gPSBtWzNdICogeCArIG1bN10gKiB5ICsgbVsxMV0gKiB6ICsgbVsxNV0gKiB3O1xuICAgIHJldHVybiBvdXQ7XG59O1xuXG4vKipcbiAqIFRyYW5zZm9ybXMgdGhlIHZlYzQgd2l0aCBhIHF1YXRcbiAqXG4gKiBAcGFyYW0ge3ZlYzR9IG91dCB0aGUgcmVjZWl2aW5nIHZlY3RvclxuICogQHBhcmFtIHt2ZWM0fSBhIHRoZSB2ZWN0b3IgdG8gdHJhbnNmb3JtXG4gKiBAcGFyYW0ge3F1YXR9IHEgcXVhdGVybmlvbiB0byB0cmFuc2Zvcm0gd2l0aFxuICogQHJldHVybnMge3ZlYzR9IG91dFxuICovXG52ZWM0LnRyYW5zZm9ybVF1YXQgPSBmdW5jdGlvbihvdXQsIGEsIHEpIHtcbiAgICB2YXIgeCA9IGFbMF0sIHkgPSBhWzFdLCB6ID0gYVsyXSxcbiAgICAgICAgcXggPSBxWzBdLCBxeSA9IHFbMV0sIHF6ID0gcVsyXSwgcXcgPSBxWzNdLFxuXG4gICAgICAgIC8vIGNhbGN1bGF0ZSBxdWF0ICogdmVjXG4gICAgICAgIGl4ID0gcXcgKiB4ICsgcXkgKiB6IC0gcXogKiB5LFxuICAgICAgICBpeSA9IHF3ICogeSArIHF6ICogeCAtIHF4ICogeixcbiAgICAgICAgaXogPSBxdyAqIHogKyBxeCAqIHkgLSBxeSAqIHgsXG4gICAgICAgIGl3ID0gLXF4ICogeCAtIHF5ICogeSAtIHF6ICogejtcblxuICAgIC8vIGNhbGN1bGF0ZSByZXN1bHQgKiBpbnZlcnNlIHF1YXRcbiAgICBvdXRbMF0gPSBpeCAqIHF3ICsgaXcgKiAtcXggKyBpeSAqIC1xeiAtIGl6ICogLXF5O1xuICAgIG91dFsxXSA9IGl5ICogcXcgKyBpdyAqIC1xeSArIGl6ICogLXF4IC0gaXggKiAtcXo7XG4gICAgb3V0WzJdID0gaXogKiBxdyArIGl3ICogLXF6ICsgaXggKiAtcXkgLSBpeSAqIC1xeDtcbiAgICByZXR1cm4gb3V0O1xufTtcblxuLyoqXG4gKiBQZXJmb3JtIHNvbWUgb3BlcmF0aW9uIG92ZXIgYW4gYXJyYXkgb2YgdmVjNHMuXG4gKlxuICogQHBhcmFtIHtBcnJheX0gYSB0aGUgYXJyYXkgb2YgdmVjdG9ycyB0byBpdGVyYXRlIG92ZXJcbiAqIEBwYXJhbSB7TnVtYmVyfSBzdHJpZGUgTnVtYmVyIG9mIGVsZW1lbnRzIGJldHdlZW4gdGhlIHN0YXJ0IG9mIGVhY2ggdmVjNC4gSWYgMCBhc3N1bWVzIHRpZ2h0bHkgcGFja2VkXG4gKiBAcGFyYW0ge051bWJlcn0gb2Zmc2V0IE51bWJlciBvZiBlbGVtZW50cyB0byBza2lwIGF0IHRoZSBiZWdpbm5pbmcgb2YgdGhlIGFycmF5XG4gKiBAcGFyYW0ge051bWJlcn0gY291bnQgTnVtYmVyIG9mIHZlYzJzIHRvIGl0ZXJhdGUgb3Zlci4gSWYgMCBpdGVyYXRlcyBvdmVyIGVudGlyZSBhcnJheVxuICogQHBhcmFtIHtGdW5jdGlvbn0gZm4gRnVuY3Rpb24gdG8gY2FsbCBmb3IgZWFjaCB2ZWN0b3IgaW4gdGhlIGFycmF5XG4gKiBAcGFyYW0ge09iamVjdH0gW2FyZ10gYWRkaXRpb25hbCBhcmd1bWVudCB0byBwYXNzIHRvIGZuXG4gKiBAcmV0dXJucyB7QXJyYXl9IGFcbiAqIEBmdW5jdGlvblxuICovXG52ZWM0LmZvckVhY2ggPSAoZnVuY3Rpb24oKSB7XG4gICAgdmFyIHZlYyA9IHZlYzQuY3JlYXRlKCk7XG5cbiAgICByZXR1cm4gZnVuY3Rpb24oYSwgc3RyaWRlLCBvZmZzZXQsIGNvdW50LCBmbiwgYXJnKSB7XG4gICAgICAgIHZhciBpLCBsO1xuICAgICAgICBpZighc3RyaWRlKSB7XG4gICAgICAgICAgICBzdHJpZGUgPSA0O1xuICAgICAgICB9XG5cbiAgICAgICAgaWYoIW9mZnNldCkge1xuICAgICAgICAgICAgb2Zmc2V0ID0gMDtcbiAgICAgICAgfVxuICAgICAgICBcbiAgICAgICAgaWYoY291bnQpIHtcbiAgICAgICAgICAgIGwgPSBNYXRoLm1pbigoY291bnQgKiBzdHJpZGUpICsgb2Zmc2V0LCBhLmxlbmd0aCk7XG4gICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICBsID0gYS5sZW5ndGg7XG4gICAgICAgIH1cblxuICAgICAgICBmb3IoaSA9IG9mZnNldDsgaSA8IGw7IGkgKz0gc3RyaWRlKSB7XG4gICAgICAgICAgICB2ZWNbMF0gPSBhW2ldOyB2ZWNbMV0gPSBhW2krMV07IHZlY1syXSA9IGFbaSsyXTsgdmVjWzNdID0gYVtpKzNdO1xuICAgICAgICAgICAgZm4odmVjLCB2ZWMsIGFyZyk7XG4gICAgICAgICAgICBhW2ldID0gdmVjWzBdOyBhW2krMV0gPSB2ZWNbMV07IGFbaSsyXSA9IHZlY1syXTsgYVtpKzNdID0gdmVjWzNdO1xuICAgICAgICB9XG4gICAgICAgIFxuICAgICAgICByZXR1cm4gYTtcbiAgICB9O1xufSkoKTtcblxuLyoqXG4gKiBSZXR1cm5zIGEgc3RyaW5nIHJlcHJlc2VudGF0aW9uIG9mIGEgdmVjdG9yXG4gKlxuICogQHBhcmFtIHt2ZWM0fSB2ZWMgdmVjdG9yIHRvIHJlcHJlc2VudCBhcyBhIHN0cmluZ1xuICogQHJldHVybnMge1N0cmluZ30gc3RyaW5nIHJlcHJlc2VudGF0aW9uIG9mIHRoZSB2ZWN0b3JcbiAqL1xudmVjNC5zdHIgPSBmdW5jdGlvbiAoYSkge1xuICAgIHJldHVybiAndmVjNCgnICsgYVswXSArICcsICcgKyBhWzFdICsgJywgJyArIGFbMl0gKyAnLCAnICsgYVszXSArICcpJztcbn07XG5cbmlmKHR5cGVvZihleHBvcnRzKSAhPT0gJ3VuZGVmaW5lZCcpIHtcbiAgICBleHBvcnRzLnZlYzQgPSB2ZWM0O1xufVxuO1xuLyogQ29weXJpZ2h0IChjKSAyMDEzLCBCcmFuZG9uIEpvbmVzLCBDb2xpbiBNYWNLZW56aWUgSVYuIEFsbCByaWdodHMgcmVzZXJ2ZWQuXG5cblJlZGlzdHJpYnV0aW9uIGFuZCB1c2UgaW4gc291cmNlIGFuZCBiaW5hcnkgZm9ybXMsIHdpdGggb3Igd2l0aG91dCBtb2RpZmljYXRpb24sXG5hcmUgcGVybWl0dGVkIHByb3ZpZGVkIHRoYXQgdGhlIGZvbGxvd2luZyBjb25kaXRpb25zIGFyZSBtZXQ6XG5cbiAgKiBSZWRpc3RyaWJ1dGlvbnMgb2Ygc291cmNlIGNvZGUgbXVzdCByZXRhaW4gdGhlIGFib3ZlIGNvcHlyaWdodCBub3RpY2UsIHRoaXNcbiAgICBsaXN0IG9mIGNvbmRpdGlvbnMgYW5kIHRoZSBmb2xsb3dpbmcgZGlzY2xhaW1lci5cbiAgKiBSZWRpc3RyaWJ1dGlvbnMgaW4gYmluYXJ5IGZvcm0gbXVzdCByZXByb2R1Y2UgdGhlIGFib3ZlIGNvcHlyaWdodCBub3RpY2UsXG4gICAgdGhpcyBsaXN0IG9mIGNvbmRpdGlvbnMgYW5kIHRoZSBmb2xsb3dpbmcgZGlzY2xhaW1lciBpbiB0aGUgZG9jdW1lbnRhdGlvbiBcbiAgICBhbmQvb3Igb3RoZXIgbWF0ZXJpYWxzIHByb3ZpZGVkIHdpdGggdGhlIGRpc3RyaWJ1dGlvbi5cblxuVEhJUyBTT0ZUV0FSRSBJUyBQUk9WSURFRCBCWSBUSEUgQ09QWVJJR0hUIEhPTERFUlMgQU5EIENPTlRSSUJVVE9SUyBcIkFTIElTXCIgQU5EXG5BTlkgRVhQUkVTUyBPUiBJTVBMSUVEIFdBUlJBTlRJRVMsIElOQ0xVRElORywgQlVUIE5PVCBMSU1JVEVEIFRPLCBUSEUgSU1QTElFRFxuV0FSUkFOVElFUyBPRiBNRVJDSEFOVEFCSUxJVFkgQU5EIEZJVE5FU1MgRk9SIEEgUEFSVElDVUxBUiBQVVJQT1NFIEFSRSBcbkRJU0NMQUlNRUQuIElOIE5PIEVWRU5UIFNIQUxMIFRIRSBDT1BZUklHSFQgSE9MREVSIE9SIENPTlRSSUJVVE9SUyBCRSBMSUFCTEUgRk9SXG5BTlkgRElSRUNULCBJTkRJUkVDVCwgSU5DSURFTlRBTCwgU1BFQ0lBTCwgRVhFTVBMQVJZLCBPUiBDT05TRVFVRU5USUFMIERBTUFHRVNcbihJTkNMVURJTkcsIEJVVCBOT1QgTElNSVRFRCBUTywgUFJPQ1VSRU1FTlQgT0YgU1VCU1RJVFVURSBHT09EUyBPUiBTRVJWSUNFUztcbkxPU1MgT0YgVVNFLCBEQVRBLCBPUiBQUk9GSVRTOyBPUiBCVVNJTkVTUyBJTlRFUlJVUFRJT04pIEhPV0VWRVIgQ0FVU0VEIEFORCBPTlxuQU5ZIFRIRU9SWSBPRiBMSUFCSUxJVFksIFdIRVRIRVIgSU4gQ09OVFJBQ1QsIFNUUklDVCBMSUFCSUxJVFksIE9SIFRPUlRcbihJTkNMVURJTkcgTkVHTElHRU5DRSBPUiBPVEhFUldJU0UpIEFSSVNJTkcgSU4gQU5ZIFdBWSBPVVQgT0YgVEhFIFVTRSBPRiBUSElTXG5TT0ZUV0FSRSwgRVZFTiBJRiBBRFZJU0VEIE9GIFRIRSBQT1NTSUJJTElUWSBPRiBTVUNIIERBTUFHRS4gKi9cblxuLyoqXG4gKiBAY2xhc3MgMngyIE1hdHJpeFxuICogQG5hbWUgbWF0MlxuICovXG5cbnZhciBtYXQyID0ge307XG5cbnZhciBtYXQySWRlbnRpdHkgPSBuZXcgRmxvYXQzMkFycmF5KFtcbiAgICAxLCAwLFxuICAgIDAsIDFcbl0pO1xuXG4vKipcbiAqIENyZWF0ZXMgYSBuZXcgaWRlbnRpdHkgbWF0MlxuICpcbiAqIEByZXR1cm5zIHttYXQyfSBhIG5ldyAyeDIgbWF0cml4XG4gKi9cbm1hdDIuY3JlYXRlID0gZnVuY3Rpb24oKSB7XG4gICAgdmFyIG91dCA9IG5ldyBHTE1BVF9BUlJBWV9UWVBFKDQpO1xuICAgIG91dFswXSA9IDE7XG4gICAgb3V0WzFdID0gMDtcbiAgICBvdXRbMl0gPSAwO1xuICAgIG91dFszXSA9IDE7XG4gICAgcmV0dXJuIG91dDtcbn07XG5cbi8qKlxuICogQ3JlYXRlcyBhIG5ldyBtYXQyIGluaXRpYWxpemVkIHdpdGggdmFsdWVzIGZyb20gYW4gZXhpc3RpbmcgbWF0cml4XG4gKlxuICogQHBhcmFtIHttYXQyfSBhIG1hdHJpeCB0byBjbG9uZVxuICogQHJldHVybnMge21hdDJ9IGEgbmV3IDJ4MiBtYXRyaXhcbiAqL1xubWF0Mi5jbG9uZSA9IGZ1bmN0aW9uKGEpIHtcbiAgICB2YXIgb3V0ID0gbmV3IEdMTUFUX0FSUkFZX1RZUEUoNCk7XG4gICAgb3V0WzBdID0gYVswXTtcbiAgICBvdXRbMV0gPSBhWzFdO1xuICAgIG91dFsyXSA9IGFbMl07XG4gICAgb3V0WzNdID0gYVszXTtcbiAgICByZXR1cm4gb3V0O1xufTtcblxuLyoqXG4gKiBDb3B5IHRoZSB2YWx1ZXMgZnJvbSBvbmUgbWF0MiB0byBhbm90aGVyXG4gKlxuICogQHBhcmFtIHttYXQyfSBvdXQgdGhlIHJlY2VpdmluZyBtYXRyaXhcbiAqIEBwYXJhbSB7bWF0Mn0gYSB0aGUgc291cmNlIG1hdHJpeFxuICogQHJldHVybnMge21hdDJ9IG91dFxuICovXG5tYXQyLmNvcHkgPSBmdW5jdGlvbihvdXQsIGEpIHtcbiAgICBvdXRbMF0gPSBhWzBdO1xuICAgIG91dFsxXSA9IGFbMV07XG4gICAgb3V0WzJdID0gYVsyXTtcbiAgICBvdXRbM10gPSBhWzNdO1xuICAgIHJldHVybiBvdXQ7XG59O1xuXG4vKipcbiAqIFNldCBhIG1hdDIgdG8gdGhlIGlkZW50aXR5IG1hdHJpeFxuICpcbiAqIEBwYXJhbSB7bWF0Mn0gb3V0IHRoZSByZWNlaXZpbmcgbWF0cml4XG4gKiBAcmV0dXJucyB7bWF0Mn0gb3V0XG4gKi9cbm1hdDIuaWRlbnRpdHkgPSBmdW5jdGlvbihvdXQpIHtcbiAgICBvdXRbMF0gPSAxO1xuICAgIG91dFsxXSA9IDA7XG4gICAgb3V0WzJdID0gMDtcbiAgICBvdXRbM10gPSAxO1xuICAgIHJldHVybiBvdXQ7XG59O1xuXG4vKipcbiAqIFRyYW5zcG9zZSB0aGUgdmFsdWVzIG9mIGEgbWF0MlxuICpcbiAqIEBwYXJhbSB7bWF0Mn0gb3V0IHRoZSByZWNlaXZpbmcgbWF0cml4XG4gKiBAcGFyYW0ge21hdDJ9IGEgdGhlIHNvdXJjZSBtYXRyaXhcbiAqIEByZXR1cm5zIHttYXQyfSBvdXRcbiAqL1xubWF0Mi50cmFuc3Bvc2UgPSBmdW5jdGlvbihvdXQsIGEpIHtcbiAgICAvLyBJZiB3ZSBhcmUgdHJhbnNwb3Npbmcgb3Vyc2VsdmVzIHdlIGNhbiBza2lwIGEgZmV3IHN0ZXBzIGJ1dCBoYXZlIHRvIGNhY2hlIHNvbWUgdmFsdWVzXG4gICAgaWYgKG91dCA9PT0gYSkge1xuICAgICAgICB2YXIgYTEgPSBhWzFdO1xuICAgICAgICBvdXRbMV0gPSBhWzJdO1xuICAgICAgICBvdXRbMl0gPSBhMTtcbiAgICB9IGVsc2Uge1xuICAgICAgICBvdXRbMF0gPSBhWzBdO1xuICAgICAgICBvdXRbMV0gPSBhWzJdO1xuICAgICAgICBvdXRbMl0gPSBhWzFdO1xuICAgICAgICBvdXRbM10gPSBhWzNdO1xuICAgIH1cbiAgICBcbiAgICByZXR1cm4gb3V0O1xufTtcblxuLyoqXG4gKiBJbnZlcnRzIGEgbWF0MlxuICpcbiAqIEBwYXJhbSB7bWF0Mn0gb3V0IHRoZSByZWNlaXZpbmcgbWF0cml4XG4gKiBAcGFyYW0ge21hdDJ9IGEgdGhlIHNvdXJjZSBtYXRyaXhcbiAqIEByZXR1cm5zIHttYXQyfSBvdXRcbiAqL1xubWF0Mi5pbnZlcnQgPSBmdW5jdGlvbihvdXQsIGEpIHtcbiAgICB2YXIgYTAgPSBhWzBdLCBhMSA9IGFbMV0sIGEyID0gYVsyXSwgYTMgPSBhWzNdLFxuXG4gICAgICAgIC8vIENhbGN1bGF0ZSB0aGUgZGV0ZXJtaW5hbnRcbiAgICAgICAgZGV0ID0gYTAgKiBhMyAtIGEyICogYTE7XG5cbiAgICBpZiAoIWRldCkge1xuICAgICAgICByZXR1cm4gbnVsbDtcbiAgICB9XG4gICAgZGV0ID0gMS4wIC8gZGV0O1xuICAgIFxuICAgIG91dFswXSA9ICBhMyAqIGRldDtcbiAgICBvdXRbMV0gPSAtYTEgKiBkZXQ7XG4gICAgb3V0WzJdID0gLWEyICogZGV0O1xuICAgIG91dFszXSA9ICBhMCAqIGRldDtcblxuICAgIHJldHVybiBvdXQ7XG59O1xuXG4vKipcbiAqIENhbGN1bGF0ZXMgdGhlIGFkanVnYXRlIG9mIGEgbWF0MlxuICpcbiAqIEBwYXJhbSB7bWF0Mn0gb3V0IHRoZSByZWNlaXZpbmcgbWF0cml4XG4gKiBAcGFyYW0ge21hdDJ9IGEgdGhlIHNvdXJjZSBtYXRyaXhcbiAqIEByZXR1cm5zIHttYXQyfSBvdXRcbiAqL1xubWF0Mi5hZGpvaW50ID0gZnVuY3Rpb24ob3V0LCBhKSB7XG4gICAgLy8gQ2FjaGluZyB0aGlzIHZhbHVlIGlzIG5lc3NlY2FyeSBpZiBvdXQgPT0gYVxuICAgIHZhciBhMCA9IGFbMF07XG4gICAgb3V0WzBdID0gIGFbM107XG4gICAgb3V0WzFdID0gLWFbMV07XG4gICAgb3V0WzJdID0gLWFbMl07XG4gICAgb3V0WzNdID0gIGEwO1xuXG4gICAgcmV0dXJuIG91dDtcbn07XG5cbi8qKlxuICogQ2FsY3VsYXRlcyB0aGUgZGV0ZXJtaW5hbnQgb2YgYSBtYXQyXG4gKlxuICogQHBhcmFtIHttYXQyfSBhIHRoZSBzb3VyY2UgbWF0cml4XG4gKiBAcmV0dXJucyB7TnVtYmVyfSBkZXRlcm1pbmFudCBvZiBhXG4gKi9cbm1hdDIuZGV0ZXJtaW5hbnQgPSBmdW5jdGlvbiAoYSkge1xuICAgIHJldHVybiBhWzBdICogYVszXSAtIGFbMl0gKiBhWzFdO1xufTtcblxuLyoqXG4gKiBNdWx0aXBsaWVzIHR3byBtYXQyJ3NcbiAqXG4gKiBAcGFyYW0ge21hdDJ9IG91dCB0aGUgcmVjZWl2aW5nIG1hdHJpeFxuICogQHBhcmFtIHttYXQyfSBhIHRoZSBmaXJzdCBvcGVyYW5kXG4gKiBAcGFyYW0ge21hdDJ9IGIgdGhlIHNlY29uZCBvcGVyYW5kXG4gKiBAcmV0dXJucyB7bWF0Mn0gb3V0XG4gKi9cbm1hdDIubXVsdGlwbHkgPSBmdW5jdGlvbiAob3V0LCBhLCBiKSB7XG4gICAgdmFyIGEwID0gYVswXSwgYTEgPSBhWzFdLCBhMiA9IGFbMl0sIGEzID0gYVszXTtcbiAgICB2YXIgYjAgPSBiWzBdLCBiMSA9IGJbMV0sIGIyID0gYlsyXSwgYjMgPSBiWzNdO1xuICAgIG91dFswXSA9IGEwICogYjAgKyBhMSAqIGIyO1xuICAgIG91dFsxXSA9IGEwICogYjEgKyBhMSAqIGIzO1xuICAgIG91dFsyXSA9IGEyICogYjAgKyBhMyAqIGIyO1xuICAgIG91dFszXSA9IGEyICogYjEgKyBhMyAqIGIzO1xuICAgIHJldHVybiBvdXQ7XG59O1xuXG4vKipcbiAqIEFsaWFzIGZvciB7QGxpbmsgbWF0Mi5tdWx0aXBseX1cbiAqIEBmdW5jdGlvblxuICovXG5tYXQyLm11bCA9IG1hdDIubXVsdGlwbHk7XG5cbi8qKlxuICogUm90YXRlcyBhIG1hdDIgYnkgdGhlIGdpdmVuIGFuZ2xlXG4gKlxuICogQHBhcmFtIHttYXQyfSBvdXQgdGhlIHJlY2VpdmluZyBtYXRyaXhcbiAqIEBwYXJhbSB7bWF0Mn0gYSB0aGUgbWF0cml4IHRvIHJvdGF0ZVxuICogQHBhcmFtIHtOdW1iZXJ9IHJhZCB0aGUgYW5nbGUgdG8gcm90YXRlIHRoZSBtYXRyaXggYnlcbiAqIEByZXR1cm5zIHttYXQyfSBvdXRcbiAqL1xubWF0Mi5yb3RhdGUgPSBmdW5jdGlvbiAob3V0LCBhLCByYWQpIHtcbiAgICB2YXIgYTAgPSBhWzBdLCBhMSA9IGFbMV0sIGEyID0gYVsyXSwgYTMgPSBhWzNdLFxuICAgICAgICBzID0gTWF0aC5zaW4ocmFkKSxcbiAgICAgICAgYyA9IE1hdGguY29zKHJhZCk7XG4gICAgb3V0WzBdID0gYTAgKiAgYyArIGExICogcztcbiAgICBvdXRbMV0gPSBhMCAqIC1zICsgYTEgKiBjO1xuICAgIG91dFsyXSA9IGEyICogIGMgKyBhMyAqIHM7XG4gICAgb3V0WzNdID0gYTIgKiAtcyArIGEzICogYztcbiAgICByZXR1cm4gb3V0O1xufTtcblxuLyoqXG4gKiBTY2FsZXMgdGhlIG1hdDIgYnkgdGhlIGRpbWVuc2lvbnMgaW4gdGhlIGdpdmVuIHZlYzJcbiAqXG4gKiBAcGFyYW0ge21hdDJ9IG91dCB0aGUgcmVjZWl2aW5nIG1hdHJpeFxuICogQHBhcmFtIHttYXQyfSBhIHRoZSBtYXRyaXggdG8gcm90YXRlXG4gKiBAcGFyYW0ge3ZlYzJ9IHYgdGhlIHZlYzIgdG8gc2NhbGUgdGhlIG1hdHJpeCBieVxuICogQHJldHVybnMge21hdDJ9IG91dFxuICoqL1xubWF0Mi5zY2FsZSA9IGZ1bmN0aW9uKG91dCwgYSwgdikge1xuICAgIHZhciBhMCA9IGFbMF0sIGExID0gYVsxXSwgYTIgPSBhWzJdLCBhMyA9IGFbM10sXG4gICAgICAgIHYwID0gdlswXSwgdjEgPSB2WzFdO1xuICAgIG91dFswXSA9IGEwICogdjA7XG4gICAgb3V0WzFdID0gYTEgKiB2MTtcbiAgICBvdXRbMl0gPSBhMiAqIHYwO1xuICAgIG91dFszXSA9IGEzICogdjE7XG4gICAgcmV0dXJuIG91dDtcbn07XG5cbi8qKlxuICogUmV0dXJucyBhIHN0cmluZyByZXByZXNlbnRhdGlvbiBvZiBhIG1hdDJcbiAqXG4gKiBAcGFyYW0ge21hdDJ9IG1hdCBtYXRyaXggdG8gcmVwcmVzZW50IGFzIGEgc3RyaW5nXG4gKiBAcmV0dXJucyB7U3RyaW5nfSBzdHJpbmcgcmVwcmVzZW50YXRpb24gb2YgdGhlIG1hdHJpeFxuICovXG5tYXQyLnN0ciA9IGZ1bmN0aW9uIChhKSB7XG4gICAgcmV0dXJuICdtYXQyKCcgKyBhWzBdICsgJywgJyArIGFbMV0gKyAnLCAnICsgYVsyXSArICcsICcgKyBhWzNdICsgJyknO1xufTtcblxuaWYodHlwZW9mKGV4cG9ydHMpICE9PSAndW5kZWZpbmVkJykge1xuICAgIGV4cG9ydHMubWF0MiA9IG1hdDI7XG59XG47XG4vKiBDb3B5cmlnaHQgKGMpIDIwMTMsIEJyYW5kb24gSm9uZXMsIENvbGluIE1hY0tlbnppZSBJVi4gQWxsIHJpZ2h0cyByZXNlcnZlZC5cblxuUmVkaXN0cmlidXRpb24gYW5kIHVzZSBpbiBzb3VyY2UgYW5kIGJpbmFyeSBmb3Jtcywgd2l0aCBvciB3aXRob3V0IG1vZGlmaWNhdGlvbixcbmFyZSBwZXJtaXR0ZWQgcHJvdmlkZWQgdGhhdCB0aGUgZm9sbG93aW5nIGNvbmRpdGlvbnMgYXJlIG1ldDpcblxuICAqIFJlZGlzdHJpYnV0aW9ucyBvZiBzb3VyY2UgY29kZSBtdXN0IHJldGFpbiB0aGUgYWJvdmUgY29weXJpZ2h0IG5vdGljZSwgdGhpc1xuICAgIGxpc3Qgb2YgY29uZGl0aW9ucyBhbmQgdGhlIGZvbGxvd2luZyBkaXNjbGFpbWVyLlxuICAqIFJlZGlzdHJpYnV0aW9ucyBpbiBiaW5hcnkgZm9ybSBtdXN0IHJlcHJvZHVjZSB0aGUgYWJvdmUgY29weXJpZ2h0IG5vdGljZSxcbiAgICB0aGlzIGxpc3Qgb2YgY29uZGl0aW9ucyBhbmQgdGhlIGZvbGxvd2luZyBkaXNjbGFpbWVyIGluIHRoZSBkb2N1bWVudGF0aW9uIFxuICAgIGFuZC9vciBvdGhlciBtYXRlcmlhbHMgcHJvdmlkZWQgd2l0aCB0aGUgZGlzdHJpYnV0aW9uLlxuXG5USElTIFNPRlRXQVJFIElTIFBST1ZJREVEIEJZIFRIRSBDT1BZUklHSFQgSE9MREVSUyBBTkQgQ09OVFJJQlVUT1JTIFwiQVMgSVNcIiBBTkRcbkFOWSBFWFBSRVNTIE9SIElNUExJRUQgV0FSUkFOVElFUywgSU5DTFVESU5HLCBCVVQgTk9UIExJTUlURUQgVE8sIFRIRSBJTVBMSUVEXG5XQVJSQU5USUVTIE9GIE1FUkNIQU5UQUJJTElUWSBBTkQgRklUTkVTUyBGT1IgQSBQQVJUSUNVTEFSIFBVUlBPU0UgQVJFIFxuRElTQ0xBSU1FRC4gSU4gTk8gRVZFTlQgU0hBTEwgVEhFIENPUFlSSUdIVCBIT0xERVIgT1IgQ09OVFJJQlVUT1JTIEJFIExJQUJMRSBGT1JcbkFOWSBESVJFQ1QsIElORElSRUNULCBJTkNJREVOVEFMLCBTUEVDSUFMLCBFWEVNUExBUlksIE9SIENPTlNFUVVFTlRJQUwgREFNQUdFU1xuKElOQ0xVRElORywgQlVUIE5PVCBMSU1JVEVEIFRPLCBQUk9DVVJFTUVOVCBPRiBTVUJTVElUVVRFIEdPT0RTIE9SIFNFUlZJQ0VTO1xuTE9TUyBPRiBVU0UsIERBVEEsIE9SIFBST0ZJVFM7IE9SIEJVU0lORVNTIElOVEVSUlVQVElPTikgSE9XRVZFUiBDQVVTRUQgQU5EIE9OXG5BTlkgVEhFT1JZIE9GIExJQUJJTElUWSwgV0hFVEhFUiBJTiBDT05UUkFDVCwgU1RSSUNUIExJQUJJTElUWSwgT1IgVE9SVFxuKElOQ0xVRElORyBORUdMSUdFTkNFIE9SIE9USEVSV0lTRSkgQVJJU0lORyBJTiBBTlkgV0FZIE9VVCBPRiBUSEUgVVNFIE9GIFRISVNcblNPRlRXQVJFLCBFVkVOIElGIEFEVklTRUQgT0YgVEhFIFBPU1NJQklMSVRZIE9GIFNVQ0ggREFNQUdFLiAqL1xuXG4vKipcbiAqIEBjbGFzcyAyeDMgTWF0cml4XG4gKiBAbmFtZSBtYXQyZFxuICogXG4gKiBAZGVzY3JpcHRpb24gXG4gKiBBIG1hdDJkIGNvbnRhaW5zIHNpeCBlbGVtZW50cyBkZWZpbmVkIGFzOlxuICogPHByZT5cbiAqIFthLCBiLFxuICogIGMsIGQsXG4gKiAgdHgsdHldXG4gKiA8L3ByZT5cbiAqIFRoaXMgaXMgYSBzaG9ydCBmb3JtIGZvciB0aGUgM3gzIG1hdHJpeDpcbiAqIDxwcmU+XG4gKiBbYSwgYiwgMFxuICogIGMsIGQsIDBcbiAqICB0eCx0eSwxXVxuICogPC9wcmU+XG4gKiBUaGUgbGFzdCBjb2x1bW4gaXMgaWdub3JlZCBzbyB0aGUgYXJyYXkgaXMgc2hvcnRlciBhbmQgb3BlcmF0aW9ucyBhcmUgZmFzdGVyLlxuICovXG5cbnZhciBtYXQyZCA9IHt9O1xuXG52YXIgbWF0MmRJZGVudGl0eSA9IG5ldyBGbG9hdDMyQXJyYXkoW1xuICAgIDEsIDAsXG4gICAgMCwgMSxcbiAgICAwLCAwXG5dKTtcblxuLyoqXG4gKiBDcmVhdGVzIGEgbmV3IGlkZW50aXR5IG1hdDJkXG4gKlxuICogQHJldHVybnMge21hdDJkfSBhIG5ldyAyeDMgbWF0cml4XG4gKi9cbm1hdDJkLmNyZWF0ZSA9IGZ1bmN0aW9uKCkge1xuICAgIHZhciBvdXQgPSBuZXcgR0xNQVRfQVJSQVlfVFlQRSg2KTtcbiAgICBvdXRbMF0gPSAxO1xuICAgIG91dFsxXSA9IDA7XG4gICAgb3V0WzJdID0gMDtcbiAgICBvdXRbM10gPSAxO1xuICAgIG91dFs0XSA9IDA7XG4gICAgb3V0WzVdID0gMDtcbiAgICByZXR1cm4gb3V0O1xufTtcblxuLyoqXG4gKiBDcmVhdGVzIGEgbmV3IG1hdDJkIGluaXRpYWxpemVkIHdpdGggdmFsdWVzIGZyb20gYW4gZXhpc3RpbmcgbWF0cml4XG4gKlxuICogQHBhcmFtIHttYXQyZH0gYSBtYXRyaXggdG8gY2xvbmVcbiAqIEByZXR1cm5zIHttYXQyZH0gYSBuZXcgMngzIG1hdHJpeFxuICovXG5tYXQyZC5jbG9uZSA9IGZ1bmN0aW9uKGEpIHtcbiAgICB2YXIgb3V0ID0gbmV3IEdMTUFUX0FSUkFZX1RZUEUoNik7XG4gICAgb3V0WzBdID0gYVswXTtcbiAgICBvdXRbMV0gPSBhWzFdO1xuICAgIG91dFsyXSA9IGFbMl07XG4gICAgb3V0WzNdID0gYVszXTtcbiAgICBvdXRbNF0gPSBhWzRdO1xuICAgIG91dFs1XSA9IGFbNV07XG4gICAgcmV0dXJuIG91dDtcbn07XG5cbi8qKlxuICogQ29weSB0aGUgdmFsdWVzIGZyb20gb25lIG1hdDJkIHRvIGFub3RoZXJcbiAqXG4gKiBAcGFyYW0ge21hdDJkfSBvdXQgdGhlIHJlY2VpdmluZyBtYXRyaXhcbiAqIEBwYXJhbSB7bWF0MmR9IGEgdGhlIHNvdXJjZSBtYXRyaXhcbiAqIEByZXR1cm5zIHttYXQyZH0gb3V0XG4gKi9cbm1hdDJkLmNvcHkgPSBmdW5jdGlvbihvdXQsIGEpIHtcbiAgICBvdXRbMF0gPSBhWzBdO1xuICAgIG91dFsxXSA9IGFbMV07XG4gICAgb3V0WzJdID0gYVsyXTtcbiAgICBvdXRbM10gPSBhWzNdO1xuICAgIG91dFs0XSA9IGFbNF07XG4gICAgb3V0WzVdID0gYVs1XTtcbiAgICByZXR1cm4gb3V0O1xufTtcblxuLyoqXG4gKiBTZXQgYSBtYXQyZCB0byB0aGUgaWRlbnRpdHkgbWF0cml4XG4gKlxuICogQHBhcmFtIHttYXQyZH0gb3V0IHRoZSByZWNlaXZpbmcgbWF0cml4XG4gKiBAcmV0dXJucyB7bWF0MmR9IG91dFxuICovXG5tYXQyZC5pZGVudGl0eSA9IGZ1bmN0aW9uKG91dCkge1xuICAgIG91dFswXSA9IDE7XG4gICAgb3V0WzFdID0gMDtcbiAgICBvdXRbMl0gPSAwO1xuICAgIG91dFszXSA9IDE7XG4gICAgb3V0WzRdID0gMDtcbiAgICBvdXRbNV0gPSAwO1xuICAgIHJldHVybiBvdXQ7XG59O1xuXG4vKipcbiAqIEludmVydHMgYSBtYXQyZFxuICpcbiAqIEBwYXJhbSB7bWF0MmR9IG91dCB0aGUgcmVjZWl2aW5nIG1hdHJpeFxuICogQHBhcmFtIHttYXQyZH0gYSB0aGUgc291cmNlIG1hdHJpeFxuICogQHJldHVybnMge21hdDJkfSBvdXRcbiAqL1xubWF0MmQuaW52ZXJ0ID0gZnVuY3Rpb24ob3V0LCBhKSB7XG4gICAgdmFyIGFhID0gYVswXSwgYWIgPSBhWzFdLCBhYyA9IGFbMl0sIGFkID0gYVszXSxcbiAgICAgICAgYXR4ID0gYVs0XSwgYXR5ID0gYVs1XTtcblxuICAgIHZhciBkZXQgPSBhYSAqIGFkIC0gYWIgKiBhYztcbiAgICBpZighZGV0KXtcbiAgICAgICAgcmV0dXJuIG51bGw7XG4gICAgfVxuICAgIGRldCA9IDEuMCAvIGRldDtcblxuICAgIG91dFswXSA9IGFkICogZGV0O1xuICAgIG91dFsxXSA9IC1hYiAqIGRldDtcbiAgICBvdXRbMl0gPSAtYWMgKiBkZXQ7XG4gICAgb3V0WzNdID0gYWEgKiBkZXQ7XG4gICAgb3V0WzRdID0gKGFjICogYXR5IC0gYWQgKiBhdHgpICogZGV0O1xuICAgIG91dFs1XSA9IChhYiAqIGF0eCAtIGFhICogYXR5KSAqIGRldDtcbiAgICByZXR1cm4gb3V0O1xufTtcblxuLyoqXG4gKiBDYWxjdWxhdGVzIHRoZSBkZXRlcm1pbmFudCBvZiBhIG1hdDJkXG4gKlxuICogQHBhcmFtIHttYXQyZH0gYSB0aGUgc291cmNlIG1hdHJpeFxuICogQHJldHVybnMge051bWJlcn0gZGV0ZXJtaW5hbnQgb2YgYVxuICovXG5tYXQyZC5kZXRlcm1pbmFudCA9IGZ1bmN0aW9uIChhKSB7XG4gICAgcmV0dXJuIGFbMF0gKiBhWzNdIC0gYVsxXSAqIGFbMl07XG59O1xuXG4vKipcbiAqIE11bHRpcGxpZXMgdHdvIG1hdDJkJ3NcbiAqXG4gKiBAcGFyYW0ge21hdDJkfSBvdXQgdGhlIHJlY2VpdmluZyBtYXRyaXhcbiAqIEBwYXJhbSB7bWF0MmR9IGEgdGhlIGZpcnN0IG9wZXJhbmRcbiAqIEBwYXJhbSB7bWF0MmR9IGIgdGhlIHNlY29uZCBvcGVyYW5kXG4gKiBAcmV0dXJucyB7bWF0MmR9IG91dFxuICovXG5tYXQyZC5tdWx0aXBseSA9IGZ1bmN0aW9uIChvdXQsIGEsIGIpIHtcbiAgICB2YXIgYWEgPSBhWzBdLCBhYiA9IGFbMV0sIGFjID0gYVsyXSwgYWQgPSBhWzNdLFxuICAgICAgICBhdHggPSBhWzRdLCBhdHkgPSBhWzVdLFxuICAgICAgICBiYSA9IGJbMF0sIGJiID0gYlsxXSwgYmMgPSBiWzJdLCBiZCA9IGJbM10sXG4gICAgICAgIGJ0eCA9IGJbNF0sIGJ0eSA9IGJbNV07XG5cbiAgICBvdXRbMF0gPSBhYSpiYSArIGFiKmJjO1xuICAgIG91dFsxXSA9IGFhKmJiICsgYWIqYmQ7XG4gICAgb3V0WzJdID0gYWMqYmEgKyBhZCpiYztcbiAgICBvdXRbM10gPSBhYypiYiArIGFkKmJkO1xuICAgIG91dFs0XSA9IGJhKmF0eCArIGJjKmF0eSArIGJ0eDtcbiAgICBvdXRbNV0gPSBiYiphdHggKyBiZCphdHkgKyBidHk7XG4gICAgcmV0dXJuIG91dDtcbn07XG5cbi8qKlxuICogQWxpYXMgZm9yIHtAbGluayBtYXQyZC5tdWx0aXBseX1cbiAqIEBmdW5jdGlvblxuICovXG5tYXQyZC5tdWwgPSBtYXQyZC5tdWx0aXBseTtcblxuXG4vKipcbiAqIFJvdGF0ZXMgYSBtYXQyZCBieSB0aGUgZ2l2ZW4gYW5nbGVcbiAqXG4gKiBAcGFyYW0ge21hdDJkfSBvdXQgdGhlIHJlY2VpdmluZyBtYXRyaXhcbiAqIEBwYXJhbSB7bWF0MmR9IGEgdGhlIG1hdHJpeCB0byByb3RhdGVcbiAqIEBwYXJhbSB7TnVtYmVyfSByYWQgdGhlIGFuZ2xlIHRvIHJvdGF0ZSB0aGUgbWF0cml4IGJ5XG4gKiBAcmV0dXJucyB7bWF0MmR9IG91dFxuICovXG5tYXQyZC5yb3RhdGUgPSBmdW5jdGlvbiAob3V0LCBhLCByYWQpIHtcbiAgICB2YXIgYWEgPSBhWzBdLFxuICAgICAgICBhYiA9IGFbMV0sXG4gICAgICAgIGFjID0gYVsyXSxcbiAgICAgICAgYWQgPSBhWzNdLFxuICAgICAgICBhdHggPSBhWzRdLFxuICAgICAgICBhdHkgPSBhWzVdLFxuICAgICAgICBzdCA9IE1hdGguc2luKHJhZCksXG4gICAgICAgIGN0ID0gTWF0aC5jb3MocmFkKTtcblxuICAgIG91dFswXSA9IGFhKmN0ICsgYWIqc3Q7XG4gICAgb3V0WzFdID0gLWFhKnN0ICsgYWIqY3Q7XG4gICAgb3V0WzJdID0gYWMqY3QgKyBhZCpzdDtcbiAgICBvdXRbM10gPSAtYWMqc3QgKyBjdCphZDtcbiAgICBvdXRbNF0gPSBjdCphdHggKyBzdCphdHk7XG4gICAgb3V0WzVdID0gY3QqYXR5IC0gc3QqYXR4O1xuICAgIHJldHVybiBvdXQ7XG59O1xuXG4vKipcbiAqIFNjYWxlcyB0aGUgbWF0MmQgYnkgdGhlIGRpbWVuc2lvbnMgaW4gdGhlIGdpdmVuIHZlYzJcbiAqXG4gKiBAcGFyYW0ge21hdDJkfSBvdXQgdGhlIHJlY2VpdmluZyBtYXRyaXhcbiAqIEBwYXJhbSB7bWF0MmR9IGEgdGhlIG1hdHJpeCB0byB0cmFuc2xhdGVcbiAqIEBwYXJhbSB7bWF0MmR9IHYgdGhlIHZlYzIgdG8gc2NhbGUgdGhlIG1hdHJpeCBieVxuICogQHJldHVybnMge21hdDJkfSBvdXRcbiAqKi9cbm1hdDJkLnNjYWxlID0gZnVuY3Rpb24ob3V0LCBhLCB2KSB7XG4gICAgdmFyIHZ4ID0gdlswXSwgdnkgPSB2WzFdO1xuICAgIG91dFswXSA9IGFbMF0gKiB2eDtcbiAgICBvdXRbMV0gPSBhWzFdICogdnk7XG4gICAgb3V0WzJdID0gYVsyXSAqIHZ4O1xuICAgIG91dFszXSA9IGFbM10gKiB2eTtcbiAgICBvdXRbNF0gPSBhWzRdICogdng7XG4gICAgb3V0WzVdID0gYVs1XSAqIHZ5O1xuICAgIHJldHVybiBvdXQ7XG59O1xuXG4vKipcbiAqIFRyYW5zbGF0ZXMgdGhlIG1hdDJkIGJ5IHRoZSBkaW1lbnNpb25zIGluIHRoZSBnaXZlbiB2ZWMyXG4gKlxuICogQHBhcmFtIHttYXQyZH0gb3V0IHRoZSByZWNlaXZpbmcgbWF0cml4XG4gKiBAcGFyYW0ge21hdDJkfSBhIHRoZSBtYXRyaXggdG8gdHJhbnNsYXRlXG4gKiBAcGFyYW0ge21hdDJkfSB2IHRoZSB2ZWMyIHRvIHRyYW5zbGF0ZSB0aGUgbWF0cml4IGJ5XG4gKiBAcmV0dXJucyB7bWF0MmR9IG91dFxuICoqL1xubWF0MmQudHJhbnNsYXRlID0gZnVuY3Rpb24ob3V0LCBhLCB2KSB7XG4gICAgb3V0WzBdID0gYVswXTtcbiAgICBvdXRbMV0gPSBhWzFdO1xuICAgIG91dFsyXSA9IGFbMl07XG4gICAgb3V0WzNdID0gYVszXTtcbiAgICBvdXRbNF0gPSBhWzRdICsgdlswXTtcbiAgICBvdXRbNV0gPSBhWzVdICsgdlsxXTtcbiAgICByZXR1cm4gb3V0O1xufTtcblxuLyoqXG4gKiBSZXR1cm5zIGEgc3RyaW5nIHJlcHJlc2VudGF0aW9uIG9mIGEgbWF0MmRcbiAqXG4gKiBAcGFyYW0ge21hdDJkfSBhIG1hdHJpeCB0byByZXByZXNlbnQgYXMgYSBzdHJpbmdcbiAqIEByZXR1cm5zIHtTdHJpbmd9IHN0cmluZyByZXByZXNlbnRhdGlvbiBvZiB0aGUgbWF0cml4XG4gKi9cbm1hdDJkLnN0ciA9IGZ1bmN0aW9uIChhKSB7XG4gICAgcmV0dXJuICdtYXQyZCgnICsgYVswXSArICcsICcgKyBhWzFdICsgJywgJyArIGFbMl0gKyAnLCAnICsgXG4gICAgICAgICAgICAgICAgICAgIGFbM10gKyAnLCAnICsgYVs0XSArICcsICcgKyBhWzVdICsgJyknO1xufTtcblxuaWYodHlwZW9mKGV4cG9ydHMpICE9PSAndW5kZWZpbmVkJykge1xuICAgIGV4cG9ydHMubWF0MmQgPSBtYXQyZDtcbn1cbjtcbi8qIENvcHlyaWdodCAoYykgMjAxMywgQnJhbmRvbiBKb25lcywgQ29saW4gTWFjS2VuemllIElWLiBBbGwgcmlnaHRzIHJlc2VydmVkLlxuXG5SZWRpc3RyaWJ1dGlvbiBhbmQgdXNlIGluIHNvdXJjZSBhbmQgYmluYXJ5IGZvcm1zLCB3aXRoIG9yIHdpdGhvdXQgbW9kaWZpY2F0aW9uLFxuYXJlIHBlcm1pdHRlZCBwcm92aWRlZCB0aGF0IHRoZSBmb2xsb3dpbmcgY29uZGl0aW9ucyBhcmUgbWV0OlxuXG4gICogUmVkaXN0cmlidXRpb25zIG9mIHNvdXJjZSBjb2RlIG11c3QgcmV0YWluIHRoZSBhYm92ZSBjb3B5cmlnaHQgbm90aWNlLCB0aGlzXG4gICAgbGlzdCBvZiBjb25kaXRpb25zIGFuZCB0aGUgZm9sbG93aW5nIGRpc2NsYWltZXIuXG4gICogUmVkaXN0cmlidXRpb25zIGluIGJpbmFyeSBmb3JtIG11c3QgcmVwcm9kdWNlIHRoZSBhYm92ZSBjb3B5cmlnaHQgbm90aWNlLFxuICAgIHRoaXMgbGlzdCBvZiBjb25kaXRpb25zIGFuZCB0aGUgZm9sbG93aW5nIGRpc2NsYWltZXIgaW4gdGhlIGRvY3VtZW50YXRpb24gXG4gICAgYW5kL29yIG90aGVyIG1hdGVyaWFscyBwcm92aWRlZCB3aXRoIHRoZSBkaXN0cmlidXRpb24uXG5cblRISVMgU09GVFdBUkUgSVMgUFJPVklERUQgQlkgVEhFIENPUFlSSUdIVCBIT0xERVJTIEFORCBDT05UUklCVVRPUlMgXCJBUyBJU1wiIEFORFxuQU5ZIEVYUFJFU1MgT1IgSU1QTElFRCBXQVJSQU5USUVTLCBJTkNMVURJTkcsIEJVVCBOT1QgTElNSVRFRCBUTywgVEhFIElNUExJRURcbldBUlJBTlRJRVMgT0YgTUVSQ0hBTlRBQklMSVRZIEFORCBGSVRORVNTIEZPUiBBIFBBUlRJQ1VMQVIgUFVSUE9TRSBBUkUgXG5ESVNDTEFJTUVELiBJTiBOTyBFVkVOVCBTSEFMTCBUSEUgQ09QWVJJR0hUIEhPTERFUiBPUiBDT05UUklCVVRPUlMgQkUgTElBQkxFIEZPUlxuQU5ZIERJUkVDVCwgSU5ESVJFQ1QsIElOQ0lERU5UQUwsIFNQRUNJQUwsIEVYRU1QTEFSWSwgT1IgQ09OU0VRVUVOVElBTCBEQU1BR0VTXG4oSU5DTFVESU5HLCBCVVQgTk9UIExJTUlURUQgVE8sIFBST0NVUkVNRU5UIE9GIFNVQlNUSVRVVEUgR09PRFMgT1IgU0VSVklDRVM7XG5MT1NTIE9GIFVTRSwgREFUQSwgT1IgUFJPRklUUzsgT1IgQlVTSU5FU1MgSU5URVJSVVBUSU9OKSBIT1dFVkVSIENBVVNFRCBBTkQgT05cbkFOWSBUSEVPUlkgT0YgTElBQklMSVRZLCBXSEVUSEVSIElOIENPTlRSQUNULCBTVFJJQ1QgTElBQklMSVRZLCBPUiBUT1JUXG4oSU5DTFVESU5HIE5FR0xJR0VOQ0UgT1IgT1RIRVJXSVNFKSBBUklTSU5HIElOIEFOWSBXQVkgT1VUIE9GIFRIRSBVU0UgT0YgVEhJU1xuU09GVFdBUkUsIEVWRU4gSUYgQURWSVNFRCBPRiBUSEUgUE9TU0lCSUxJVFkgT0YgU1VDSCBEQU1BR0UuICovXG5cbi8qKlxuICogQGNsYXNzIDN4MyBNYXRyaXhcbiAqIEBuYW1lIG1hdDNcbiAqL1xuXG52YXIgbWF0MyA9IHt9O1xuXG52YXIgbWF0M0lkZW50aXR5ID0gbmV3IEZsb2F0MzJBcnJheShbXG4gICAgMSwgMCwgMCxcbiAgICAwLCAxLCAwLFxuICAgIDAsIDAsIDFcbl0pO1xuXG4vKipcbiAqIENyZWF0ZXMgYSBuZXcgaWRlbnRpdHkgbWF0M1xuICpcbiAqIEByZXR1cm5zIHttYXQzfSBhIG5ldyAzeDMgbWF0cml4XG4gKi9cbm1hdDMuY3JlYXRlID0gZnVuY3Rpb24oKSB7XG4gICAgdmFyIG91dCA9IG5ldyBHTE1BVF9BUlJBWV9UWVBFKDkpO1xuICAgIG91dFswXSA9IDE7XG4gICAgb3V0WzFdID0gMDtcbiAgICBvdXRbMl0gPSAwO1xuICAgIG91dFszXSA9IDA7XG4gICAgb3V0WzRdID0gMTtcbiAgICBvdXRbNV0gPSAwO1xuICAgIG91dFs2XSA9IDA7XG4gICAgb3V0WzddID0gMDtcbiAgICBvdXRbOF0gPSAxO1xuICAgIHJldHVybiBvdXQ7XG59O1xuXG4vKipcbiAqIENyZWF0ZXMgYSBuZXcgbWF0MyBpbml0aWFsaXplZCB3aXRoIHZhbHVlcyBmcm9tIGFuIGV4aXN0aW5nIG1hdHJpeFxuICpcbiAqIEBwYXJhbSB7bWF0M30gYSBtYXRyaXggdG8gY2xvbmVcbiAqIEByZXR1cm5zIHttYXQzfSBhIG5ldyAzeDMgbWF0cml4XG4gKi9cbm1hdDMuY2xvbmUgPSBmdW5jdGlvbihhKSB7XG4gICAgdmFyIG91dCA9IG5ldyBHTE1BVF9BUlJBWV9UWVBFKDkpO1xuICAgIG91dFswXSA9IGFbMF07XG4gICAgb3V0WzFdID0gYVsxXTtcbiAgICBvdXRbMl0gPSBhWzJdO1xuICAgIG91dFszXSA9IGFbM107XG4gICAgb3V0WzRdID0gYVs0XTtcbiAgICBvdXRbNV0gPSBhWzVdO1xuICAgIG91dFs2XSA9IGFbNl07XG4gICAgb3V0WzddID0gYVs3XTtcbiAgICBvdXRbOF0gPSBhWzhdO1xuICAgIHJldHVybiBvdXQ7XG59O1xuXG4vKipcbiAqIENvcHkgdGhlIHZhbHVlcyBmcm9tIG9uZSBtYXQzIHRvIGFub3RoZXJcbiAqXG4gKiBAcGFyYW0ge21hdDN9IG91dCB0aGUgcmVjZWl2aW5nIG1hdHJpeFxuICogQHBhcmFtIHttYXQzfSBhIHRoZSBzb3VyY2UgbWF0cml4XG4gKiBAcmV0dXJucyB7bWF0M30gb3V0XG4gKi9cbm1hdDMuY29weSA9IGZ1bmN0aW9uKG91dCwgYSkge1xuICAgIG91dFswXSA9IGFbMF07XG4gICAgb3V0WzFdID0gYVsxXTtcbiAgICBvdXRbMl0gPSBhWzJdO1xuICAgIG91dFszXSA9IGFbM107XG4gICAgb3V0WzRdID0gYVs0XTtcbiAgICBvdXRbNV0gPSBhWzVdO1xuICAgIG91dFs2XSA9IGFbNl07XG4gICAgb3V0WzddID0gYVs3XTtcbiAgICBvdXRbOF0gPSBhWzhdO1xuICAgIHJldHVybiBvdXQ7XG59O1xuXG4vKipcbiAqIFNldCBhIG1hdDMgdG8gdGhlIGlkZW50aXR5IG1hdHJpeFxuICpcbiAqIEBwYXJhbSB7bWF0M30gb3V0IHRoZSByZWNlaXZpbmcgbWF0cml4XG4gKiBAcmV0dXJucyB7bWF0M30gb3V0XG4gKi9cbm1hdDMuaWRlbnRpdHkgPSBmdW5jdGlvbihvdXQpIHtcbiAgICBvdXRbMF0gPSAxO1xuICAgIG91dFsxXSA9IDA7XG4gICAgb3V0WzJdID0gMDtcbiAgICBvdXRbM10gPSAwO1xuICAgIG91dFs0XSA9IDE7XG4gICAgb3V0WzVdID0gMDtcbiAgICBvdXRbNl0gPSAwO1xuICAgIG91dFs3XSA9IDA7XG4gICAgb3V0WzhdID0gMTtcbiAgICByZXR1cm4gb3V0O1xufTtcblxuLyoqXG4gKiBUcmFuc3Bvc2UgdGhlIHZhbHVlcyBvZiBhIG1hdDNcbiAqXG4gKiBAcGFyYW0ge21hdDN9IG91dCB0aGUgcmVjZWl2aW5nIG1hdHJpeFxuICogQHBhcmFtIHttYXQzfSBhIHRoZSBzb3VyY2UgbWF0cml4XG4gKiBAcmV0dXJucyB7bWF0M30gb3V0XG4gKi9cbm1hdDMudHJhbnNwb3NlID0gZnVuY3Rpb24ob3V0LCBhKSB7XG4gICAgLy8gSWYgd2UgYXJlIHRyYW5zcG9zaW5nIG91cnNlbHZlcyB3ZSBjYW4gc2tpcCBhIGZldyBzdGVwcyBidXQgaGF2ZSB0byBjYWNoZSBzb21lIHZhbHVlc1xuICAgIGlmIChvdXQgPT09IGEpIHtcbiAgICAgICAgdmFyIGEwMSA9IGFbMV0sIGEwMiA9IGFbMl0sIGExMiA9IGFbNV07XG4gICAgICAgIG91dFsxXSA9IGFbM107XG4gICAgICAgIG91dFsyXSA9IGFbNl07XG4gICAgICAgIG91dFszXSA9IGEwMTtcbiAgICAgICAgb3V0WzVdID0gYVs3XTtcbiAgICAgICAgb3V0WzZdID0gYTAyO1xuICAgICAgICBvdXRbN10gPSBhMTI7XG4gICAgfSBlbHNlIHtcbiAgICAgICAgb3V0WzBdID0gYVswXTtcbiAgICAgICAgb3V0WzFdID0gYVszXTtcbiAgICAgICAgb3V0WzJdID0gYVs2XTtcbiAgICAgICAgb3V0WzNdID0gYVsxXTtcbiAgICAgICAgb3V0WzRdID0gYVs0XTtcbiAgICAgICAgb3V0WzVdID0gYVs3XTtcbiAgICAgICAgb3V0WzZdID0gYVsyXTtcbiAgICAgICAgb3V0WzddID0gYVs1XTtcbiAgICAgICAgb3V0WzhdID0gYVs4XTtcbiAgICB9XG4gICAgXG4gICAgcmV0dXJuIG91dDtcbn07XG5cbi8qKlxuICogSW52ZXJ0cyBhIG1hdDNcbiAqXG4gKiBAcGFyYW0ge21hdDN9IG91dCB0aGUgcmVjZWl2aW5nIG1hdHJpeFxuICogQHBhcmFtIHttYXQzfSBhIHRoZSBzb3VyY2UgbWF0cml4XG4gKiBAcmV0dXJucyB7bWF0M30gb3V0XG4gKi9cbm1hdDMuaW52ZXJ0ID0gZnVuY3Rpb24ob3V0LCBhKSB7XG4gICAgdmFyIGEwMCA9IGFbMF0sIGEwMSA9IGFbMV0sIGEwMiA9IGFbMl0sXG4gICAgICAgIGExMCA9IGFbM10sIGExMSA9IGFbNF0sIGExMiA9IGFbNV0sXG4gICAgICAgIGEyMCA9IGFbNl0sIGEyMSA9IGFbN10sIGEyMiA9IGFbOF0sXG5cbiAgICAgICAgYjAxID0gYTIyICogYTExIC0gYTEyICogYTIxLFxuICAgICAgICBiMTEgPSAtYTIyICogYTEwICsgYTEyICogYTIwLFxuICAgICAgICBiMjEgPSBhMjEgKiBhMTAgLSBhMTEgKiBhMjAsXG5cbiAgICAgICAgLy8gQ2FsY3VsYXRlIHRoZSBkZXRlcm1pbmFudFxuICAgICAgICBkZXQgPSBhMDAgKiBiMDEgKyBhMDEgKiBiMTEgKyBhMDIgKiBiMjE7XG5cbiAgICBpZiAoIWRldCkgeyBcbiAgICAgICAgcmV0dXJuIG51bGw7IFxuICAgIH1cbiAgICBkZXQgPSAxLjAgLyBkZXQ7XG5cbiAgICBvdXRbMF0gPSBiMDEgKiBkZXQ7XG4gICAgb3V0WzFdID0gKC1hMjIgKiBhMDEgKyBhMDIgKiBhMjEpICogZGV0O1xuICAgIG91dFsyXSA9IChhMTIgKiBhMDEgLSBhMDIgKiBhMTEpICogZGV0O1xuICAgIG91dFszXSA9IGIxMSAqIGRldDtcbiAgICBvdXRbNF0gPSAoYTIyICogYTAwIC0gYTAyICogYTIwKSAqIGRldDtcbiAgICBvdXRbNV0gPSAoLWExMiAqIGEwMCArIGEwMiAqIGExMCkgKiBkZXQ7XG4gICAgb3V0WzZdID0gYjIxICogZGV0O1xuICAgIG91dFs3XSA9ICgtYTIxICogYTAwICsgYTAxICogYTIwKSAqIGRldDtcbiAgICBvdXRbOF0gPSAoYTExICogYTAwIC0gYTAxICogYTEwKSAqIGRldDtcbiAgICByZXR1cm4gb3V0O1xufTtcblxuLyoqXG4gKiBDYWxjdWxhdGVzIHRoZSBhZGp1Z2F0ZSBvZiBhIG1hdDNcbiAqXG4gKiBAcGFyYW0ge21hdDN9IG91dCB0aGUgcmVjZWl2aW5nIG1hdHJpeFxuICogQHBhcmFtIHttYXQzfSBhIHRoZSBzb3VyY2UgbWF0cml4XG4gKiBAcmV0dXJucyB7bWF0M30gb3V0XG4gKi9cbm1hdDMuYWRqb2ludCA9IGZ1bmN0aW9uKG91dCwgYSkge1xuICAgIHZhciBhMDAgPSBhWzBdLCBhMDEgPSBhWzFdLCBhMDIgPSBhWzJdLFxuICAgICAgICBhMTAgPSBhWzNdLCBhMTEgPSBhWzRdLCBhMTIgPSBhWzVdLFxuICAgICAgICBhMjAgPSBhWzZdLCBhMjEgPSBhWzddLCBhMjIgPSBhWzhdO1xuXG4gICAgb3V0WzBdID0gKGExMSAqIGEyMiAtIGExMiAqIGEyMSk7XG4gICAgb3V0WzFdID0gKGEwMiAqIGEyMSAtIGEwMSAqIGEyMik7XG4gICAgb3V0WzJdID0gKGEwMSAqIGExMiAtIGEwMiAqIGExMSk7XG4gICAgb3V0WzNdID0gKGExMiAqIGEyMCAtIGExMCAqIGEyMik7XG4gICAgb3V0WzRdID0gKGEwMCAqIGEyMiAtIGEwMiAqIGEyMCk7XG4gICAgb3V0WzVdID0gKGEwMiAqIGExMCAtIGEwMCAqIGExMik7XG4gICAgb3V0WzZdID0gKGExMCAqIGEyMSAtIGExMSAqIGEyMCk7XG4gICAgb3V0WzddID0gKGEwMSAqIGEyMCAtIGEwMCAqIGEyMSk7XG4gICAgb3V0WzhdID0gKGEwMCAqIGExMSAtIGEwMSAqIGExMCk7XG4gICAgcmV0dXJuIG91dDtcbn07XG5cbi8qKlxuICogQ2FsY3VsYXRlcyB0aGUgZGV0ZXJtaW5hbnQgb2YgYSBtYXQzXG4gKlxuICogQHBhcmFtIHttYXQzfSBhIHRoZSBzb3VyY2UgbWF0cml4XG4gKiBAcmV0dXJucyB7TnVtYmVyfSBkZXRlcm1pbmFudCBvZiBhXG4gKi9cbm1hdDMuZGV0ZXJtaW5hbnQgPSBmdW5jdGlvbiAoYSkge1xuICAgIHZhciBhMDAgPSBhWzBdLCBhMDEgPSBhWzFdLCBhMDIgPSBhWzJdLFxuICAgICAgICBhMTAgPSBhWzNdLCBhMTEgPSBhWzRdLCBhMTIgPSBhWzVdLFxuICAgICAgICBhMjAgPSBhWzZdLCBhMjEgPSBhWzddLCBhMjIgPSBhWzhdO1xuXG4gICAgcmV0dXJuIGEwMCAqIChhMjIgKiBhMTEgLSBhMTIgKiBhMjEpICsgYTAxICogKC1hMjIgKiBhMTAgKyBhMTIgKiBhMjApICsgYTAyICogKGEyMSAqIGExMCAtIGExMSAqIGEyMCk7XG59O1xuXG4vKipcbiAqIE11bHRpcGxpZXMgdHdvIG1hdDMnc1xuICpcbiAqIEBwYXJhbSB7bWF0M30gb3V0IHRoZSByZWNlaXZpbmcgbWF0cml4XG4gKiBAcGFyYW0ge21hdDN9IGEgdGhlIGZpcnN0IG9wZXJhbmRcbiAqIEBwYXJhbSB7bWF0M30gYiB0aGUgc2Vjb25kIG9wZXJhbmRcbiAqIEByZXR1cm5zIHttYXQzfSBvdXRcbiAqL1xubWF0My5tdWx0aXBseSA9IGZ1bmN0aW9uIChvdXQsIGEsIGIpIHtcbiAgICB2YXIgYTAwID0gYVswXSwgYTAxID0gYVsxXSwgYTAyID0gYVsyXSxcbiAgICAgICAgYTEwID0gYVszXSwgYTExID0gYVs0XSwgYTEyID0gYVs1XSxcbiAgICAgICAgYTIwID0gYVs2XSwgYTIxID0gYVs3XSwgYTIyID0gYVs4XSxcblxuICAgICAgICBiMDAgPSBiWzBdLCBiMDEgPSBiWzFdLCBiMDIgPSBiWzJdLFxuICAgICAgICBiMTAgPSBiWzNdLCBiMTEgPSBiWzRdLCBiMTIgPSBiWzVdLFxuICAgICAgICBiMjAgPSBiWzZdLCBiMjEgPSBiWzddLCBiMjIgPSBiWzhdO1xuXG4gICAgb3V0WzBdID0gYjAwICogYTAwICsgYjAxICogYTEwICsgYjAyICogYTIwO1xuICAgIG91dFsxXSA9IGIwMCAqIGEwMSArIGIwMSAqIGExMSArIGIwMiAqIGEyMTtcbiAgICBvdXRbMl0gPSBiMDAgKiBhMDIgKyBiMDEgKiBhMTIgKyBiMDIgKiBhMjI7XG5cbiAgICBvdXRbM10gPSBiMTAgKiBhMDAgKyBiMTEgKiBhMTAgKyBiMTIgKiBhMjA7XG4gICAgb3V0WzRdID0gYjEwICogYTAxICsgYjExICogYTExICsgYjEyICogYTIxO1xuICAgIG91dFs1XSA9IGIxMCAqIGEwMiArIGIxMSAqIGExMiArIGIxMiAqIGEyMjtcblxuICAgIG91dFs2XSA9IGIyMCAqIGEwMCArIGIyMSAqIGExMCArIGIyMiAqIGEyMDtcbiAgICBvdXRbN10gPSBiMjAgKiBhMDEgKyBiMjEgKiBhMTEgKyBiMjIgKiBhMjE7XG4gICAgb3V0WzhdID0gYjIwICogYTAyICsgYjIxICogYTEyICsgYjIyICogYTIyO1xuICAgIHJldHVybiBvdXQ7XG59O1xuXG4vKipcbiAqIEFsaWFzIGZvciB7QGxpbmsgbWF0My5tdWx0aXBseX1cbiAqIEBmdW5jdGlvblxuICovXG5tYXQzLm11bCA9IG1hdDMubXVsdGlwbHk7XG5cbi8qKlxuICogVHJhbnNsYXRlIGEgbWF0MyBieSB0aGUgZ2l2ZW4gdmVjdG9yXG4gKlxuICogQHBhcmFtIHttYXQzfSBvdXQgdGhlIHJlY2VpdmluZyBtYXRyaXhcbiAqIEBwYXJhbSB7bWF0M30gYSB0aGUgbWF0cml4IHRvIHRyYW5zbGF0ZVxuICogQHBhcmFtIHt2ZWMyfSB2IHZlY3RvciB0byB0cmFuc2xhdGUgYnlcbiAqIEByZXR1cm5zIHttYXQzfSBvdXRcbiAqL1xubWF0My50cmFuc2xhdGUgPSBmdW5jdGlvbihvdXQsIGEsIHYpIHtcbiAgICB2YXIgYTAwID0gYVswXSwgYTAxID0gYVsxXSwgYTAyID0gYVsyXSxcbiAgICAgICAgYTEwID0gYVszXSwgYTExID0gYVs0XSwgYTEyID0gYVs1XSxcbiAgICAgICAgYTIwID0gYVs2XSwgYTIxID0gYVs3XSwgYTIyID0gYVs4XSxcbiAgICAgICAgeCA9IHZbMF0sIHkgPSB2WzFdO1xuXG4gICAgb3V0WzBdID0gYTAwO1xuICAgIG91dFsxXSA9IGEwMTtcbiAgICBvdXRbMl0gPSBhMDI7XG5cbiAgICBvdXRbM10gPSBhMTA7XG4gICAgb3V0WzRdID0gYTExO1xuICAgIG91dFs1XSA9IGExMjtcblxuICAgIG91dFs2XSA9IHggKiBhMDAgKyB5ICogYTEwICsgYTIwO1xuICAgIG91dFs3XSA9IHggKiBhMDEgKyB5ICogYTExICsgYTIxO1xuICAgIG91dFs4XSA9IHggKiBhMDIgKyB5ICogYTEyICsgYTIyO1xuICAgIHJldHVybiBvdXQ7XG59O1xuXG4vKipcbiAqIFJvdGF0ZXMgYSBtYXQzIGJ5IHRoZSBnaXZlbiBhbmdsZVxuICpcbiAqIEBwYXJhbSB7bWF0M30gb3V0IHRoZSByZWNlaXZpbmcgbWF0cml4XG4gKiBAcGFyYW0ge21hdDN9IGEgdGhlIG1hdHJpeCB0byByb3RhdGVcbiAqIEBwYXJhbSB7TnVtYmVyfSByYWQgdGhlIGFuZ2xlIHRvIHJvdGF0ZSB0aGUgbWF0cml4IGJ5XG4gKiBAcmV0dXJucyB7bWF0M30gb3V0XG4gKi9cbm1hdDMucm90YXRlID0gZnVuY3Rpb24gKG91dCwgYSwgcmFkKSB7XG4gICAgdmFyIGEwMCA9IGFbMF0sIGEwMSA9IGFbMV0sIGEwMiA9IGFbMl0sXG4gICAgICAgIGExMCA9IGFbM10sIGExMSA9IGFbNF0sIGExMiA9IGFbNV0sXG4gICAgICAgIGEyMCA9IGFbNl0sIGEyMSA9IGFbN10sIGEyMiA9IGFbOF0sXG5cbiAgICAgICAgcyA9IE1hdGguc2luKHJhZCksXG4gICAgICAgIGMgPSBNYXRoLmNvcyhyYWQpO1xuXG4gICAgb3V0WzBdID0gYyAqIGEwMCArIHMgKiBhMTA7XG4gICAgb3V0WzFdID0gYyAqIGEwMSArIHMgKiBhMTE7XG4gICAgb3V0WzJdID0gYyAqIGEwMiArIHMgKiBhMTI7XG5cbiAgICBvdXRbM10gPSBjICogYTEwIC0gcyAqIGEwMDtcbiAgICBvdXRbNF0gPSBjICogYTExIC0gcyAqIGEwMTtcbiAgICBvdXRbNV0gPSBjICogYTEyIC0gcyAqIGEwMjtcblxuICAgIG91dFs2XSA9IGEyMDtcbiAgICBvdXRbN10gPSBhMjE7XG4gICAgb3V0WzhdID0gYTIyO1xuICAgIHJldHVybiBvdXQ7XG59O1xuXG4vKipcbiAqIFNjYWxlcyB0aGUgbWF0MyBieSB0aGUgZGltZW5zaW9ucyBpbiB0aGUgZ2l2ZW4gdmVjMlxuICpcbiAqIEBwYXJhbSB7bWF0M30gb3V0IHRoZSByZWNlaXZpbmcgbWF0cml4XG4gKiBAcGFyYW0ge21hdDN9IGEgdGhlIG1hdHJpeCB0byByb3RhdGVcbiAqIEBwYXJhbSB7dmVjMn0gdiB0aGUgdmVjMiB0byBzY2FsZSB0aGUgbWF0cml4IGJ5XG4gKiBAcmV0dXJucyB7bWF0M30gb3V0XG4gKiovXG5tYXQzLnNjYWxlID0gZnVuY3Rpb24ob3V0LCBhLCB2KSB7XG4gICAgdmFyIHggPSB2WzBdLCB5ID0gdlsyXTtcblxuICAgIG91dFswXSA9IHggKiBhWzBdO1xuICAgIG91dFsxXSA9IHggKiBhWzFdO1xuICAgIG91dFsyXSA9IHggKiBhWzJdO1xuXG4gICAgb3V0WzNdID0geSAqIGFbM107XG4gICAgb3V0WzRdID0geSAqIGFbNF07XG4gICAgb3V0WzVdID0geSAqIGFbNV07XG5cbiAgICBvdXRbNl0gPSBhWzZdO1xuICAgIG91dFs3XSA9IGFbN107XG4gICAgb3V0WzhdID0gYVs4XTtcbiAgICByZXR1cm4gb3V0O1xufTtcblxuLyoqXG4gKiBDb3BpZXMgdGhlIHZhbHVlcyBmcm9tIGEgbWF0MmQgaW50byBhIG1hdDNcbiAqXG4gKiBAcGFyYW0ge21hdDN9IG91dCB0aGUgcmVjZWl2aW5nIG1hdHJpeFxuICogQHBhcmFtIHttYXQzfSBhIHRoZSBtYXRyaXggdG8gcm90YXRlXG4gKiBAcGFyYW0ge3ZlYzJ9IHYgdGhlIHZlYzIgdG8gc2NhbGUgdGhlIG1hdHJpeCBieVxuICogQHJldHVybnMge21hdDN9IG91dFxuICoqL1xubWF0My5mcm9tTWF0MmQgPSBmdW5jdGlvbihvdXQsIGEpIHtcbiAgICBvdXRbMF0gPSBhWzBdO1xuICAgIG91dFsxXSA9IGFbMV07XG4gICAgb3V0WzJdID0gMDtcblxuICAgIG91dFszXSA9IGFbMl07XG4gICAgb3V0WzRdID0gYVszXTtcbiAgICBvdXRbNV0gPSAwO1xuXG4gICAgb3V0WzZdID0gYVs0XTtcbiAgICBvdXRbN10gPSBhWzVdO1xuICAgIG91dFs4XSA9IDE7XG4gICAgcmV0dXJuIG91dDtcbn07XG5cbi8qKlxuKiBDYWxjdWxhdGVzIGEgM3gzIG1hdHJpeCBmcm9tIHRoZSBnaXZlbiBxdWF0ZXJuaW9uXG4qXG4qIEBwYXJhbSB7bWF0M30gb3V0IG1hdDMgcmVjZWl2aW5nIG9wZXJhdGlvbiByZXN1bHRcbiogQHBhcmFtIHtxdWF0fSBxIFF1YXRlcm5pb24gdG8gY3JlYXRlIG1hdHJpeCBmcm9tXG4qXG4qIEByZXR1cm5zIHttYXQzfSBvdXRcbiovXG5tYXQzLmZyb21RdWF0ID0gZnVuY3Rpb24gKG91dCwgcSkge1xuICAgIHZhciB4ID0gcVswXSwgeSA9IHFbMV0sIHogPSBxWzJdLCB3ID0gcVszXSxcbiAgICAgICAgeDIgPSB4ICsgeCxcbiAgICAgICAgeTIgPSB5ICsgeSxcbiAgICAgICAgejIgPSB6ICsgeixcblxuICAgICAgICB4eCA9IHggKiB4MixcbiAgICAgICAgeHkgPSB4ICogeTIsXG4gICAgICAgIHh6ID0geCAqIHoyLFxuICAgICAgICB5eSA9IHkgKiB5MixcbiAgICAgICAgeXogPSB5ICogejIsXG4gICAgICAgIHp6ID0geiAqIHoyLFxuICAgICAgICB3eCA9IHcgKiB4MixcbiAgICAgICAgd3kgPSB3ICogeTIsXG4gICAgICAgIHd6ID0gdyAqIHoyO1xuXG4gICAgb3V0WzBdID0gMSAtICh5eSArIHp6KTtcbiAgICBvdXRbMV0gPSB4eSArIHd6O1xuICAgIG91dFsyXSA9IHh6IC0gd3k7XG5cbiAgICBvdXRbM10gPSB4eSAtIHd6O1xuICAgIG91dFs0XSA9IDEgLSAoeHggKyB6eik7XG4gICAgb3V0WzVdID0geXogKyB3eDtcblxuICAgIG91dFs2XSA9IHh6ICsgd3k7XG4gICAgb3V0WzddID0geXogLSB3eDtcbiAgICBvdXRbOF0gPSAxIC0gKHh4ICsgeXkpO1xuXG4gICAgcmV0dXJuIG91dDtcbn07XG5cbi8qKlxuICogUmV0dXJucyBhIHN0cmluZyByZXByZXNlbnRhdGlvbiBvZiBhIG1hdDNcbiAqXG4gKiBAcGFyYW0ge21hdDN9IG1hdCBtYXRyaXggdG8gcmVwcmVzZW50IGFzIGEgc3RyaW5nXG4gKiBAcmV0dXJucyB7U3RyaW5nfSBzdHJpbmcgcmVwcmVzZW50YXRpb24gb2YgdGhlIG1hdHJpeFxuICovXG5tYXQzLnN0ciA9IGZ1bmN0aW9uIChhKSB7XG4gICAgcmV0dXJuICdtYXQzKCcgKyBhWzBdICsgJywgJyArIGFbMV0gKyAnLCAnICsgYVsyXSArICcsICcgKyBcbiAgICAgICAgICAgICAgICAgICAgYVszXSArICcsICcgKyBhWzRdICsgJywgJyArIGFbNV0gKyAnLCAnICsgXG4gICAgICAgICAgICAgICAgICAgIGFbNl0gKyAnLCAnICsgYVs3XSArICcsICcgKyBhWzhdICsgJyknO1xufTtcblxuaWYodHlwZW9mKGV4cG9ydHMpICE9PSAndW5kZWZpbmVkJykge1xuICAgIGV4cG9ydHMubWF0MyA9IG1hdDM7XG59XG47XG4vKiBDb3B5cmlnaHQgKGMpIDIwMTMsIEJyYW5kb24gSm9uZXMsIENvbGluIE1hY0tlbnppZSBJVi4gQWxsIHJpZ2h0cyByZXNlcnZlZC5cblxuUmVkaXN0cmlidXRpb24gYW5kIHVzZSBpbiBzb3VyY2UgYW5kIGJpbmFyeSBmb3Jtcywgd2l0aCBvciB3aXRob3V0IG1vZGlmaWNhdGlvbixcbmFyZSBwZXJtaXR0ZWQgcHJvdmlkZWQgdGhhdCB0aGUgZm9sbG93aW5nIGNvbmRpdGlvbnMgYXJlIG1ldDpcblxuICAqIFJlZGlzdHJpYnV0aW9ucyBvZiBzb3VyY2UgY29kZSBtdXN0IHJldGFpbiB0aGUgYWJvdmUgY29weXJpZ2h0IG5vdGljZSwgdGhpc1xuICAgIGxpc3Qgb2YgY29uZGl0aW9ucyBhbmQgdGhlIGZvbGxvd2luZyBkaXNjbGFpbWVyLlxuICAqIFJlZGlzdHJpYnV0aW9ucyBpbiBiaW5hcnkgZm9ybSBtdXN0IHJlcHJvZHVjZSB0aGUgYWJvdmUgY29weXJpZ2h0IG5vdGljZSxcbiAgICB0aGlzIGxpc3Qgb2YgY29uZGl0aW9ucyBhbmQgdGhlIGZvbGxvd2luZyBkaXNjbGFpbWVyIGluIHRoZSBkb2N1bWVudGF0aW9uIFxuICAgIGFuZC9vciBvdGhlciBtYXRlcmlhbHMgcHJvdmlkZWQgd2l0aCB0aGUgZGlzdHJpYnV0aW9uLlxuXG5USElTIFNPRlRXQVJFIElTIFBST1ZJREVEIEJZIFRIRSBDT1BZUklHSFQgSE9MREVSUyBBTkQgQ09OVFJJQlVUT1JTIFwiQVMgSVNcIiBBTkRcbkFOWSBFWFBSRVNTIE9SIElNUExJRUQgV0FSUkFOVElFUywgSU5DTFVESU5HLCBCVVQgTk9UIExJTUlURUQgVE8sIFRIRSBJTVBMSUVEXG5XQVJSQU5USUVTIE9GIE1FUkNIQU5UQUJJTElUWSBBTkQgRklUTkVTUyBGT1IgQSBQQVJUSUNVTEFSIFBVUlBPU0UgQVJFIFxuRElTQ0xBSU1FRC4gSU4gTk8gRVZFTlQgU0hBTEwgVEhFIENPUFlSSUdIVCBIT0xERVIgT1IgQ09OVFJJQlVUT1JTIEJFIExJQUJMRSBGT1JcbkFOWSBESVJFQ1QsIElORElSRUNULCBJTkNJREVOVEFMLCBTUEVDSUFMLCBFWEVNUExBUlksIE9SIENPTlNFUVVFTlRJQUwgREFNQUdFU1xuKElOQ0xVRElORywgQlVUIE5PVCBMSU1JVEVEIFRPLCBQUk9DVVJFTUVOVCBPRiBTVUJTVElUVVRFIEdPT0RTIE9SIFNFUlZJQ0VTO1xuTE9TUyBPRiBVU0UsIERBVEEsIE9SIFBST0ZJVFM7IE9SIEJVU0lORVNTIElOVEVSUlVQVElPTikgSE9XRVZFUiBDQVVTRUQgQU5EIE9OXG5BTlkgVEhFT1JZIE9GIExJQUJJTElUWSwgV0hFVEhFUiBJTiBDT05UUkFDVCwgU1RSSUNUIExJQUJJTElUWSwgT1IgVE9SVFxuKElOQ0xVRElORyBORUdMSUdFTkNFIE9SIE9USEVSV0lTRSkgQVJJU0lORyBJTiBBTlkgV0FZIE9VVCBPRiBUSEUgVVNFIE9GIFRISVNcblNPRlRXQVJFLCBFVkVOIElGIEFEVklTRUQgT0YgVEhFIFBPU1NJQklMSVRZIE9GIFNVQ0ggREFNQUdFLiAqL1xuXG4vKipcbiAqIEBjbGFzcyA0eDQgTWF0cml4XG4gKiBAbmFtZSBtYXQ0XG4gKi9cblxudmFyIG1hdDQgPSB7fTtcblxudmFyIG1hdDRJZGVudGl0eSA9IG5ldyBGbG9hdDMyQXJyYXkoW1xuICAgIDEsIDAsIDAsIDAsXG4gICAgMCwgMSwgMCwgMCxcbiAgICAwLCAwLCAxLCAwLFxuICAgIDAsIDAsIDAsIDFcbl0pO1xuXG4vKipcbiAqIENyZWF0ZXMgYSBuZXcgaWRlbnRpdHkgbWF0NFxuICpcbiAqIEByZXR1cm5zIHttYXQ0fSBhIG5ldyA0eDQgbWF0cml4XG4gKi9cbm1hdDQuY3JlYXRlID0gZnVuY3Rpb24oKSB7XG4gICAgdmFyIG91dCA9IG5ldyBHTE1BVF9BUlJBWV9UWVBFKDE2KTtcbiAgICBvdXRbMF0gPSAxO1xuICAgIG91dFsxXSA9IDA7XG4gICAgb3V0WzJdID0gMDtcbiAgICBvdXRbM10gPSAwO1xuICAgIG91dFs0XSA9IDA7XG4gICAgb3V0WzVdID0gMTtcbiAgICBvdXRbNl0gPSAwO1xuICAgIG91dFs3XSA9IDA7XG4gICAgb3V0WzhdID0gMDtcbiAgICBvdXRbOV0gPSAwO1xuICAgIG91dFsxMF0gPSAxO1xuICAgIG91dFsxMV0gPSAwO1xuICAgIG91dFsxMl0gPSAwO1xuICAgIG91dFsxM10gPSAwO1xuICAgIG91dFsxNF0gPSAwO1xuICAgIG91dFsxNV0gPSAxO1xuICAgIHJldHVybiBvdXQ7XG59O1xuXG4vKipcbiAqIENyZWF0ZXMgYSBuZXcgbWF0NCBpbml0aWFsaXplZCB3aXRoIHZhbHVlcyBmcm9tIGFuIGV4aXN0aW5nIG1hdHJpeFxuICpcbiAqIEBwYXJhbSB7bWF0NH0gYSBtYXRyaXggdG8gY2xvbmVcbiAqIEByZXR1cm5zIHttYXQ0fSBhIG5ldyA0eDQgbWF0cml4XG4gKi9cbm1hdDQuY2xvbmUgPSBmdW5jdGlvbihhKSB7XG4gICAgdmFyIG91dCA9IG5ldyBHTE1BVF9BUlJBWV9UWVBFKDE2KTtcbiAgICBvdXRbMF0gPSBhWzBdO1xuICAgIG91dFsxXSA9IGFbMV07XG4gICAgb3V0WzJdID0gYVsyXTtcbiAgICBvdXRbM10gPSBhWzNdO1xuICAgIG91dFs0XSA9IGFbNF07XG4gICAgb3V0WzVdID0gYVs1XTtcbiAgICBvdXRbNl0gPSBhWzZdO1xuICAgIG91dFs3XSA9IGFbN107XG4gICAgb3V0WzhdID0gYVs4XTtcbiAgICBvdXRbOV0gPSBhWzldO1xuICAgIG91dFsxMF0gPSBhWzEwXTtcbiAgICBvdXRbMTFdID0gYVsxMV07XG4gICAgb3V0WzEyXSA9IGFbMTJdO1xuICAgIG91dFsxM10gPSBhWzEzXTtcbiAgICBvdXRbMTRdID0gYVsxNF07XG4gICAgb3V0WzE1XSA9IGFbMTVdO1xuICAgIHJldHVybiBvdXQ7XG59O1xuXG4vKipcbiAqIENvcHkgdGhlIHZhbHVlcyBmcm9tIG9uZSBtYXQ0IHRvIGFub3RoZXJcbiAqXG4gKiBAcGFyYW0ge21hdDR9IG91dCB0aGUgcmVjZWl2aW5nIG1hdHJpeFxuICogQHBhcmFtIHttYXQ0fSBhIHRoZSBzb3VyY2UgbWF0cml4XG4gKiBAcmV0dXJucyB7bWF0NH0gb3V0XG4gKi9cbm1hdDQuY29weSA9IGZ1bmN0aW9uKG91dCwgYSkge1xuICAgIG91dFswXSA9IGFbMF07XG4gICAgb3V0WzFdID0gYVsxXTtcbiAgICBvdXRbMl0gPSBhWzJdO1xuICAgIG91dFszXSA9IGFbM107XG4gICAgb3V0WzRdID0gYVs0XTtcbiAgICBvdXRbNV0gPSBhWzVdO1xuICAgIG91dFs2XSA9IGFbNl07XG4gICAgb3V0WzddID0gYVs3XTtcbiAgICBvdXRbOF0gPSBhWzhdO1xuICAgIG91dFs5XSA9IGFbOV07XG4gICAgb3V0WzEwXSA9IGFbMTBdO1xuICAgIG91dFsxMV0gPSBhWzExXTtcbiAgICBvdXRbMTJdID0gYVsxMl07XG4gICAgb3V0WzEzXSA9IGFbMTNdO1xuICAgIG91dFsxNF0gPSBhWzE0XTtcbiAgICBvdXRbMTVdID0gYVsxNV07XG4gICAgcmV0dXJuIG91dDtcbn07XG5cbi8qKlxuICogU2V0IGEgbWF0NCB0byB0aGUgaWRlbnRpdHkgbWF0cml4XG4gKlxuICogQHBhcmFtIHttYXQ0fSBvdXQgdGhlIHJlY2VpdmluZyBtYXRyaXhcbiAqIEByZXR1cm5zIHttYXQ0fSBvdXRcbiAqL1xubWF0NC5pZGVudGl0eSA9IGZ1bmN0aW9uKG91dCkge1xuICAgIG91dFswXSA9IDE7XG4gICAgb3V0WzFdID0gMDtcbiAgICBvdXRbMl0gPSAwO1xuICAgIG91dFszXSA9IDA7XG4gICAgb3V0WzRdID0gMDtcbiAgICBvdXRbNV0gPSAxO1xuICAgIG91dFs2XSA9IDA7XG4gICAgb3V0WzddID0gMDtcbiAgICBvdXRbOF0gPSAwO1xuICAgIG91dFs5XSA9IDA7XG4gICAgb3V0WzEwXSA9IDE7XG4gICAgb3V0WzExXSA9IDA7XG4gICAgb3V0WzEyXSA9IDA7XG4gICAgb3V0WzEzXSA9IDA7XG4gICAgb3V0WzE0XSA9IDA7XG4gICAgb3V0WzE1XSA9IDE7XG4gICAgcmV0dXJuIG91dDtcbn07XG5cbi8qKlxuICogVHJhbnNwb3NlIHRoZSB2YWx1ZXMgb2YgYSBtYXQ0XG4gKlxuICogQHBhcmFtIHttYXQ0fSBvdXQgdGhlIHJlY2VpdmluZyBtYXRyaXhcbiAqIEBwYXJhbSB7bWF0NH0gYSB0aGUgc291cmNlIG1hdHJpeFxuICogQHJldHVybnMge21hdDR9IG91dFxuICovXG5tYXQ0LnRyYW5zcG9zZSA9IGZ1bmN0aW9uKG91dCwgYSkge1xuICAgIC8vIElmIHdlIGFyZSB0cmFuc3Bvc2luZyBvdXJzZWx2ZXMgd2UgY2FuIHNraXAgYSBmZXcgc3RlcHMgYnV0IGhhdmUgdG8gY2FjaGUgc29tZSB2YWx1ZXNcbiAgICBpZiAob3V0ID09PSBhKSB7XG4gICAgICAgIHZhciBhMDEgPSBhWzFdLCBhMDIgPSBhWzJdLCBhMDMgPSBhWzNdLFxuICAgICAgICAgICAgYTEyID0gYVs2XSwgYTEzID0gYVs3XSxcbiAgICAgICAgICAgIGEyMyA9IGFbMTFdO1xuXG4gICAgICAgIG91dFsxXSA9IGFbNF07XG4gICAgICAgIG91dFsyXSA9IGFbOF07XG4gICAgICAgIG91dFszXSA9IGFbMTJdO1xuICAgICAgICBvdXRbNF0gPSBhMDE7XG4gICAgICAgIG91dFs2XSA9IGFbOV07XG4gICAgICAgIG91dFs3XSA9IGFbMTNdO1xuICAgICAgICBvdXRbOF0gPSBhMDI7XG4gICAgICAgIG91dFs5XSA9IGExMjtcbiAgICAgICAgb3V0WzExXSA9IGFbMTRdO1xuICAgICAgICBvdXRbMTJdID0gYTAzO1xuICAgICAgICBvdXRbMTNdID0gYTEzO1xuICAgICAgICBvdXRbMTRdID0gYTIzO1xuICAgIH0gZWxzZSB7XG4gICAgICAgIG91dFswXSA9IGFbMF07XG4gICAgICAgIG91dFsxXSA9IGFbNF07XG4gICAgICAgIG91dFsyXSA9IGFbOF07XG4gICAgICAgIG91dFszXSA9IGFbMTJdO1xuICAgICAgICBvdXRbNF0gPSBhWzFdO1xuICAgICAgICBvdXRbNV0gPSBhWzVdO1xuICAgICAgICBvdXRbNl0gPSBhWzldO1xuICAgICAgICBvdXRbN10gPSBhWzEzXTtcbiAgICAgICAgb3V0WzhdID0gYVsyXTtcbiAgICAgICAgb3V0WzldID0gYVs2XTtcbiAgICAgICAgb3V0WzEwXSA9IGFbMTBdO1xuICAgICAgICBvdXRbMTFdID0gYVsxNF07XG4gICAgICAgIG91dFsxMl0gPSBhWzNdO1xuICAgICAgICBvdXRbMTNdID0gYVs3XTtcbiAgICAgICAgb3V0WzE0XSA9IGFbMTFdO1xuICAgICAgICBvdXRbMTVdID0gYVsxNV07XG4gICAgfVxuICAgIFxuICAgIHJldHVybiBvdXQ7XG59O1xuXG4vKipcbiAqIEludmVydHMgYSBtYXQ0XG4gKlxuICogQHBhcmFtIHttYXQ0fSBvdXQgdGhlIHJlY2VpdmluZyBtYXRyaXhcbiAqIEBwYXJhbSB7bWF0NH0gYSB0aGUgc291cmNlIG1hdHJpeFxuICogQHJldHVybnMge21hdDR9IG91dFxuICovXG5tYXQ0LmludmVydCA9IGZ1bmN0aW9uKG91dCwgYSkge1xuICAgIHZhciBhMDAgPSBhWzBdLCBhMDEgPSBhWzFdLCBhMDIgPSBhWzJdLCBhMDMgPSBhWzNdLFxuICAgICAgICBhMTAgPSBhWzRdLCBhMTEgPSBhWzVdLCBhMTIgPSBhWzZdLCBhMTMgPSBhWzddLFxuICAgICAgICBhMjAgPSBhWzhdLCBhMjEgPSBhWzldLCBhMjIgPSBhWzEwXSwgYTIzID0gYVsxMV0sXG4gICAgICAgIGEzMCA9IGFbMTJdLCBhMzEgPSBhWzEzXSwgYTMyID0gYVsxNF0sIGEzMyA9IGFbMTVdLFxuXG4gICAgICAgIGIwMCA9IGEwMCAqIGExMSAtIGEwMSAqIGExMCxcbiAgICAgICAgYjAxID0gYTAwICogYTEyIC0gYTAyICogYTEwLFxuICAgICAgICBiMDIgPSBhMDAgKiBhMTMgLSBhMDMgKiBhMTAsXG4gICAgICAgIGIwMyA9IGEwMSAqIGExMiAtIGEwMiAqIGExMSxcbiAgICAgICAgYjA0ID0gYTAxICogYTEzIC0gYTAzICogYTExLFxuICAgICAgICBiMDUgPSBhMDIgKiBhMTMgLSBhMDMgKiBhMTIsXG4gICAgICAgIGIwNiA9IGEyMCAqIGEzMSAtIGEyMSAqIGEzMCxcbiAgICAgICAgYjA3ID0gYTIwICogYTMyIC0gYTIyICogYTMwLFxuICAgICAgICBiMDggPSBhMjAgKiBhMzMgLSBhMjMgKiBhMzAsXG4gICAgICAgIGIwOSA9IGEyMSAqIGEzMiAtIGEyMiAqIGEzMSxcbiAgICAgICAgYjEwID0gYTIxICogYTMzIC0gYTIzICogYTMxLFxuICAgICAgICBiMTEgPSBhMjIgKiBhMzMgLSBhMjMgKiBhMzIsXG5cbiAgICAgICAgLy8gQ2FsY3VsYXRlIHRoZSBkZXRlcm1pbmFudFxuICAgICAgICBkZXQgPSBiMDAgKiBiMTEgLSBiMDEgKiBiMTAgKyBiMDIgKiBiMDkgKyBiMDMgKiBiMDggLSBiMDQgKiBiMDcgKyBiMDUgKiBiMDY7XG5cbiAgICBpZiAoIWRldCkgeyBcbiAgICAgICAgcmV0dXJuIG51bGw7IFxuICAgIH1cbiAgICBkZXQgPSAxLjAgLyBkZXQ7XG5cbiAgICBvdXRbMF0gPSAoYTExICogYjExIC0gYTEyICogYjEwICsgYTEzICogYjA5KSAqIGRldDtcbiAgICBvdXRbMV0gPSAoYTAyICogYjEwIC0gYTAxICogYjExIC0gYTAzICogYjA5KSAqIGRldDtcbiAgICBvdXRbMl0gPSAoYTMxICogYjA1IC0gYTMyICogYjA0ICsgYTMzICogYjAzKSAqIGRldDtcbiAgICBvdXRbM10gPSAoYTIyICogYjA0IC0gYTIxICogYjA1IC0gYTIzICogYjAzKSAqIGRldDtcbiAgICBvdXRbNF0gPSAoYTEyICogYjA4IC0gYTEwICogYjExIC0gYTEzICogYjA3KSAqIGRldDtcbiAgICBvdXRbNV0gPSAoYTAwICogYjExIC0gYTAyICogYjA4ICsgYTAzICogYjA3KSAqIGRldDtcbiAgICBvdXRbNl0gPSAoYTMyICogYjAyIC0gYTMwICogYjA1IC0gYTMzICogYjAxKSAqIGRldDtcbiAgICBvdXRbN10gPSAoYTIwICogYjA1IC0gYTIyICogYjAyICsgYTIzICogYjAxKSAqIGRldDtcbiAgICBvdXRbOF0gPSAoYTEwICogYjEwIC0gYTExICogYjA4ICsgYTEzICogYjA2KSAqIGRldDtcbiAgICBvdXRbOV0gPSAoYTAxICogYjA4IC0gYTAwICogYjEwIC0gYTAzICogYjA2KSAqIGRldDtcbiAgICBvdXRbMTBdID0gKGEzMCAqIGIwNCAtIGEzMSAqIGIwMiArIGEzMyAqIGIwMCkgKiBkZXQ7XG4gICAgb3V0WzExXSA9IChhMjEgKiBiMDIgLSBhMjAgKiBiMDQgLSBhMjMgKiBiMDApICogZGV0O1xuICAgIG91dFsxMl0gPSAoYTExICogYjA3IC0gYTEwICogYjA5IC0gYTEyICogYjA2KSAqIGRldDtcbiAgICBvdXRbMTNdID0gKGEwMCAqIGIwOSAtIGEwMSAqIGIwNyArIGEwMiAqIGIwNikgKiBkZXQ7XG4gICAgb3V0WzE0XSA9IChhMzEgKiBiMDEgLSBhMzAgKiBiMDMgLSBhMzIgKiBiMDApICogZGV0O1xuICAgIG91dFsxNV0gPSAoYTIwICogYjAzIC0gYTIxICogYjAxICsgYTIyICogYjAwKSAqIGRldDtcblxuICAgIHJldHVybiBvdXQ7XG59O1xuXG4vKipcbiAqIENhbGN1bGF0ZXMgdGhlIGFkanVnYXRlIG9mIGEgbWF0NFxuICpcbiAqIEBwYXJhbSB7bWF0NH0gb3V0IHRoZSByZWNlaXZpbmcgbWF0cml4XG4gKiBAcGFyYW0ge21hdDR9IGEgdGhlIHNvdXJjZSBtYXRyaXhcbiAqIEByZXR1cm5zIHttYXQ0fSBvdXRcbiAqL1xubWF0NC5hZGpvaW50ID0gZnVuY3Rpb24ob3V0LCBhKSB7XG4gICAgdmFyIGEwMCA9IGFbMF0sIGEwMSA9IGFbMV0sIGEwMiA9IGFbMl0sIGEwMyA9IGFbM10sXG4gICAgICAgIGExMCA9IGFbNF0sIGExMSA9IGFbNV0sIGExMiA9IGFbNl0sIGExMyA9IGFbN10sXG4gICAgICAgIGEyMCA9IGFbOF0sIGEyMSA9IGFbOV0sIGEyMiA9IGFbMTBdLCBhMjMgPSBhWzExXSxcbiAgICAgICAgYTMwID0gYVsxMl0sIGEzMSA9IGFbMTNdLCBhMzIgPSBhWzE0XSwgYTMzID0gYVsxNV07XG5cbiAgICBvdXRbMF0gID0gIChhMTEgKiAoYTIyICogYTMzIC0gYTIzICogYTMyKSAtIGEyMSAqIChhMTIgKiBhMzMgLSBhMTMgKiBhMzIpICsgYTMxICogKGExMiAqIGEyMyAtIGExMyAqIGEyMikpO1xuICAgIG91dFsxXSAgPSAtKGEwMSAqIChhMjIgKiBhMzMgLSBhMjMgKiBhMzIpIC0gYTIxICogKGEwMiAqIGEzMyAtIGEwMyAqIGEzMikgKyBhMzEgKiAoYTAyICogYTIzIC0gYTAzICogYTIyKSk7XG4gICAgb3V0WzJdICA9ICAoYTAxICogKGExMiAqIGEzMyAtIGExMyAqIGEzMikgLSBhMTEgKiAoYTAyICogYTMzIC0gYTAzICogYTMyKSArIGEzMSAqIChhMDIgKiBhMTMgLSBhMDMgKiBhMTIpKTtcbiAgICBvdXRbM10gID0gLShhMDEgKiAoYTEyICogYTIzIC0gYTEzICogYTIyKSAtIGExMSAqIChhMDIgKiBhMjMgLSBhMDMgKiBhMjIpICsgYTIxICogKGEwMiAqIGExMyAtIGEwMyAqIGExMikpO1xuICAgIG91dFs0XSAgPSAtKGExMCAqIChhMjIgKiBhMzMgLSBhMjMgKiBhMzIpIC0gYTIwICogKGExMiAqIGEzMyAtIGExMyAqIGEzMikgKyBhMzAgKiAoYTEyICogYTIzIC0gYTEzICogYTIyKSk7XG4gICAgb3V0WzVdICA9ICAoYTAwICogKGEyMiAqIGEzMyAtIGEyMyAqIGEzMikgLSBhMjAgKiAoYTAyICogYTMzIC0gYTAzICogYTMyKSArIGEzMCAqIChhMDIgKiBhMjMgLSBhMDMgKiBhMjIpKTtcbiAgICBvdXRbNl0gID0gLShhMDAgKiAoYTEyICogYTMzIC0gYTEzICogYTMyKSAtIGExMCAqIChhMDIgKiBhMzMgLSBhMDMgKiBhMzIpICsgYTMwICogKGEwMiAqIGExMyAtIGEwMyAqIGExMikpO1xuICAgIG91dFs3XSAgPSAgKGEwMCAqIChhMTIgKiBhMjMgLSBhMTMgKiBhMjIpIC0gYTEwICogKGEwMiAqIGEyMyAtIGEwMyAqIGEyMikgKyBhMjAgKiAoYTAyICogYTEzIC0gYTAzICogYTEyKSk7XG4gICAgb3V0WzhdICA9ICAoYTEwICogKGEyMSAqIGEzMyAtIGEyMyAqIGEzMSkgLSBhMjAgKiAoYTExICogYTMzIC0gYTEzICogYTMxKSArIGEzMCAqIChhMTEgKiBhMjMgLSBhMTMgKiBhMjEpKTtcbiAgICBvdXRbOV0gID0gLShhMDAgKiAoYTIxICogYTMzIC0gYTIzICogYTMxKSAtIGEyMCAqIChhMDEgKiBhMzMgLSBhMDMgKiBhMzEpICsgYTMwICogKGEwMSAqIGEyMyAtIGEwMyAqIGEyMSkpO1xuICAgIG91dFsxMF0gPSAgKGEwMCAqIChhMTEgKiBhMzMgLSBhMTMgKiBhMzEpIC0gYTEwICogKGEwMSAqIGEzMyAtIGEwMyAqIGEzMSkgKyBhMzAgKiAoYTAxICogYTEzIC0gYTAzICogYTExKSk7XG4gICAgb3V0WzExXSA9IC0oYTAwICogKGExMSAqIGEyMyAtIGExMyAqIGEyMSkgLSBhMTAgKiAoYTAxICogYTIzIC0gYTAzICogYTIxKSArIGEyMCAqIChhMDEgKiBhMTMgLSBhMDMgKiBhMTEpKTtcbiAgICBvdXRbMTJdID0gLShhMTAgKiAoYTIxICogYTMyIC0gYTIyICogYTMxKSAtIGEyMCAqIChhMTEgKiBhMzIgLSBhMTIgKiBhMzEpICsgYTMwICogKGExMSAqIGEyMiAtIGExMiAqIGEyMSkpO1xuICAgIG91dFsxM10gPSAgKGEwMCAqIChhMjEgKiBhMzIgLSBhMjIgKiBhMzEpIC0gYTIwICogKGEwMSAqIGEzMiAtIGEwMiAqIGEzMSkgKyBhMzAgKiAoYTAxICogYTIyIC0gYTAyICogYTIxKSk7XG4gICAgb3V0WzE0XSA9IC0oYTAwICogKGExMSAqIGEzMiAtIGExMiAqIGEzMSkgLSBhMTAgKiAoYTAxICogYTMyIC0gYTAyICogYTMxKSArIGEzMCAqIChhMDEgKiBhMTIgLSBhMDIgKiBhMTEpKTtcbiAgICBvdXRbMTVdID0gIChhMDAgKiAoYTExICogYTIyIC0gYTEyICogYTIxKSAtIGExMCAqIChhMDEgKiBhMjIgLSBhMDIgKiBhMjEpICsgYTIwICogKGEwMSAqIGExMiAtIGEwMiAqIGExMSkpO1xuICAgIHJldHVybiBvdXQ7XG59O1xuXG4vKipcbiAqIENhbGN1bGF0ZXMgdGhlIGRldGVybWluYW50IG9mIGEgbWF0NFxuICpcbiAqIEBwYXJhbSB7bWF0NH0gYSB0aGUgc291cmNlIG1hdHJpeFxuICogQHJldHVybnMge051bWJlcn0gZGV0ZXJtaW5hbnQgb2YgYVxuICovXG5tYXQ0LmRldGVybWluYW50ID0gZnVuY3Rpb24gKGEpIHtcbiAgICB2YXIgYTAwID0gYVswXSwgYTAxID0gYVsxXSwgYTAyID0gYVsyXSwgYTAzID0gYVszXSxcbiAgICAgICAgYTEwID0gYVs0XSwgYTExID0gYVs1XSwgYTEyID0gYVs2XSwgYTEzID0gYVs3XSxcbiAgICAgICAgYTIwID0gYVs4XSwgYTIxID0gYVs5XSwgYTIyID0gYVsxMF0sIGEyMyA9IGFbMTFdLFxuICAgICAgICBhMzAgPSBhWzEyXSwgYTMxID0gYVsxM10sIGEzMiA9IGFbMTRdLCBhMzMgPSBhWzE1XSxcblxuICAgICAgICBiMDAgPSBhMDAgKiBhMTEgLSBhMDEgKiBhMTAsXG4gICAgICAgIGIwMSA9IGEwMCAqIGExMiAtIGEwMiAqIGExMCxcbiAgICAgICAgYjAyID0gYTAwICogYTEzIC0gYTAzICogYTEwLFxuICAgICAgICBiMDMgPSBhMDEgKiBhMTIgLSBhMDIgKiBhMTEsXG4gICAgICAgIGIwNCA9IGEwMSAqIGExMyAtIGEwMyAqIGExMSxcbiAgICAgICAgYjA1ID0gYTAyICogYTEzIC0gYTAzICogYTEyLFxuICAgICAgICBiMDYgPSBhMjAgKiBhMzEgLSBhMjEgKiBhMzAsXG4gICAgICAgIGIwNyA9IGEyMCAqIGEzMiAtIGEyMiAqIGEzMCxcbiAgICAgICAgYjA4ID0gYTIwICogYTMzIC0gYTIzICogYTMwLFxuICAgICAgICBiMDkgPSBhMjEgKiBhMzIgLSBhMjIgKiBhMzEsXG4gICAgICAgIGIxMCA9IGEyMSAqIGEzMyAtIGEyMyAqIGEzMSxcbiAgICAgICAgYjExID0gYTIyICogYTMzIC0gYTIzICogYTMyO1xuXG4gICAgLy8gQ2FsY3VsYXRlIHRoZSBkZXRlcm1pbmFudFxuICAgIHJldHVybiBiMDAgKiBiMTEgLSBiMDEgKiBiMTAgKyBiMDIgKiBiMDkgKyBiMDMgKiBiMDggLSBiMDQgKiBiMDcgKyBiMDUgKiBiMDY7XG59O1xuXG4vKipcbiAqIE11bHRpcGxpZXMgdHdvIG1hdDQnc1xuICpcbiAqIEBwYXJhbSB7bWF0NH0gb3V0IHRoZSByZWNlaXZpbmcgbWF0cml4XG4gKiBAcGFyYW0ge21hdDR9IGEgdGhlIGZpcnN0IG9wZXJhbmRcbiAqIEBwYXJhbSB7bWF0NH0gYiB0aGUgc2Vjb25kIG9wZXJhbmRcbiAqIEByZXR1cm5zIHttYXQ0fSBvdXRcbiAqL1xubWF0NC5tdWx0aXBseSA9IGZ1bmN0aW9uIChvdXQsIGEsIGIpIHtcbiAgICB2YXIgYTAwID0gYVswXSwgYTAxID0gYVsxXSwgYTAyID0gYVsyXSwgYTAzID0gYVszXSxcbiAgICAgICAgYTEwID0gYVs0XSwgYTExID0gYVs1XSwgYTEyID0gYVs2XSwgYTEzID0gYVs3XSxcbiAgICAgICAgYTIwID0gYVs4XSwgYTIxID0gYVs5XSwgYTIyID0gYVsxMF0sIGEyMyA9IGFbMTFdLFxuICAgICAgICBhMzAgPSBhWzEyXSwgYTMxID0gYVsxM10sIGEzMiA9IGFbMTRdLCBhMzMgPSBhWzE1XTtcblxuICAgIC8vIENhY2hlIG9ubHkgdGhlIGN1cnJlbnQgbGluZSBvZiB0aGUgc2Vjb25kIG1hdHJpeFxuICAgIHZhciBiMCAgPSBiWzBdLCBiMSA9IGJbMV0sIGIyID0gYlsyXSwgYjMgPSBiWzNdOyAgXG4gICAgb3V0WzBdID0gYjAqYTAwICsgYjEqYTEwICsgYjIqYTIwICsgYjMqYTMwO1xuICAgIG91dFsxXSA9IGIwKmEwMSArIGIxKmExMSArIGIyKmEyMSArIGIzKmEzMTtcbiAgICBvdXRbMl0gPSBiMCphMDIgKyBiMSphMTIgKyBiMiphMjIgKyBiMyphMzI7XG4gICAgb3V0WzNdID0gYjAqYTAzICsgYjEqYTEzICsgYjIqYTIzICsgYjMqYTMzO1xuXG4gICAgYjAgPSBiWzRdOyBiMSA9IGJbNV07IGIyID0gYls2XTsgYjMgPSBiWzddO1xuICAgIG91dFs0XSA9IGIwKmEwMCArIGIxKmExMCArIGIyKmEyMCArIGIzKmEzMDtcbiAgICBvdXRbNV0gPSBiMCphMDEgKyBiMSphMTEgKyBiMiphMjEgKyBiMyphMzE7XG4gICAgb3V0WzZdID0gYjAqYTAyICsgYjEqYTEyICsgYjIqYTIyICsgYjMqYTMyO1xuICAgIG91dFs3XSA9IGIwKmEwMyArIGIxKmExMyArIGIyKmEyMyArIGIzKmEzMztcblxuICAgIGIwID0gYls4XTsgYjEgPSBiWzldOyBiMiA9IGJbMTBdOyBiMyA9IGJbMTFdO1xuICAgIG91dFs4XSA9IGIwKmEwMCArIGIxKmExMCArIGIyKmEyMCArIGIzKmEzMDtcbiAgICBvdXRbOV0gPSBiMCphMDEgKyBiMSphMTEgKyBiMiphMjEgKyBiMyphMzE7XG4gICAgb3V0WzEwXSA9IGIwKmEwMiArIGIxKmExMiArIGIyKmEyMiArIGIzKmEzMjtcbiAgICBvdXRbMTFdID0gYjAqYTAzICsgYjEqYTEzICsgYjIqYTIzICsgYjMqYTMzO1xuXG4gICAgYjAgPSBiWzEyXTsgYjEgPSBiWzEzXTsgYjIgPSBiWzE0XTsgYjMgPSBiWzE1XTtcbiAgICBvdXRbMTJdID0gYjAqYTAwICsgYjEqYTEwICsgYjIqYTIwICsgYjMqYTMwO1xuICAgIG91dFsxM10gPSBiMCphMDEgKyBiMSphMTEgKyBiMiphMjEgKyBiMyphMzE7XG4gICAgb3V0WzE0XSA9IGIwKmEwMiArIGIxKmExMiArIGIyKmEyMiArIGIzKmEzMjtcbiAgICBvdXRbMTVdID0gYjAqYTAzICsgYjEqYTEzICsgYjIqYTIzICsgYjMqYTMzO1xuICAgIHJldHVybiBvdXQ7XG59O1xuXG4vKipcbiAqIEFsaWFzIGZvciB7QGxpbmsgbWF0NC5tdWx0aXBseX1cbiAqIEBmdW5jdGlvblxuICovXG5tYXQ0Lm11bCA9IG1hdDQubXVsdGlwbHk7XG5cbi8qKlxuICogVHJhbnNsYXRlIGEgbWF0NCBieSB0aGUgZ2l2ZW4gdmVjdG9yXG4gKlxuICogQHBhcmFtIHttYXQ0fSBvdXQgdGhlIHJlY2VpdmluZyBtYXRyaXhcbiAqIEBwYXJhbSB7bWF0NH0gYSB0aGUgbWF0cml4IHRvIHRyYW5zbGF0ZVxuICogQHBhcmFtIHt2ZWMzfSB2IHZlY3RvciB0byB0cmFuc2xhdGUgYnlcbiAqIEByZXR1cm5zIHttYXQ0fSBvdXRcbiAqL1xubWF0NC50cmFuc2xhdGUgPSBmdW5jdGlvbiAob3V0LCBhLCB2KSB7XG4gICAgdmFyIHggPSB2WzBdLCB5ID0gdlsxXSwgeiA9IHZbMl0sXG4gICAgICAgIGEwMCwgYTAxLCBhMDIsIGEwMyxcbiAgICAgICAgYTEwLCBhMTEsIGExMiwgYTEzLFxuICAgICAgICBhMjAsIGEyMSwgYTIyLCBhMjM7XG5cbiAgICBpZiAoYSA9PT0gb3V0KSB7XG4gICAgICAgIG91dFsxMl0gPSBhWzBdICogeCArIGFbNF0gKiB5ICsgYVs4XSAqIHogKyBhWzEyXTtcbiAgICAgICAgb3V0WzEzXSA9IGFbMV0gKiB4ICsgYVs1XSAqIHkgKyBhWzldICogeiArIGFbMTNdO1xuICAgICAgICBvdXRbMTRdID0gYVsyXSAqIHggKyBhWzZdICogeSArIGFbMTBdICogeiArIGFbMTRdO1xuICAgICAgICBvdXRbMTVdID0gYVszXSAqIHggKyBhWzddICogeSArIGFbMTFdICogeiArIGFbMTVdO1xuICAgIH0gZWxzZSB7XG4gICAgICAgIGEwMCA9IGFbMF07IGEwMSA9IGFbMV07IGEwMiA9IGFbMl07IGEwMyA9IGFbM107XG4gICAgICAgIGExMCA9IGFbNF07IGExMSA9IGFbNV07IGExMiA9IGFbNl07IGExMyA9IGFbN107XG4gICAgICAgIGEyMCA9IGFbOF07IGEyMSA9IGFbOV07IGEyMiA9IGFbMTBdOyBhMjMgPSBhWzExXTtcblxuICAgICAgICBvdXRbMF0gPSBhMDA7IG91dFsxXSA9IGEwMTsgb3V0WzJdID0gYTAyOyBvdXRbM10gPSBhMDM7XG4gICAgICAgIG91dFs0XSA9IGExMDsgb3V0WzVdID0gYTExOyBvdXRbNl0gPSBhMTI7IG91dFs3XSA9IGExMztcbiAgICAgICAgb3V0WzhdID0gYTIwOyBvdXRbOV0gPSBhMjE7IG91dFsxMF0gPSBhMjI7IG91dFsxMV0gPSBhMjM7XG5cbiAgICAgICAgb3V0WzEyXSA9IGEwMCAqIHggKyBhMTAgKiB5ICsgYTIwICogeiArIGFbMTJdO1xuICAgICAgICBvdXRbMTNdID0gYTAxICogeCArIGExMSAqIHkgKyBhMjEgKiB6ICsgYVsxM107XG4gICAgICAgIG91dFsxNF0gPSBhMDIgKiB4ICsgYTEyICogeSArIGEyMiAqIHogKyBhWzE0XTtcbiAgICAgICAgb3V0WzE1XSA9IGEwMyAqIHggKyBhMTMgKiB5ICsgYTIzICogeiArIGFbMTVdO1xuICAgIH1cblxuICAgIHJldHVybiBvdXQ7XG59O1xuXG4vKipcbiAqIFNjYWxlcyB0aGUgbWF0NCBieSB0aGUgZGltZW5zaW9ucyBpbiB0aGUgZ2l2ZW4gdmVjM1xuICpcbiAqIEBwYXJhbSB7bWF0NH0gb3V0IHRoZSByZWNlaXZpbmcgbWF0cml4XG4gKiBAcGFyYW0ge21hdDR9IGEgdGhlIG1hdHJpeCB0byBzY2FsZVxuICogQHBhcmFtIHt2ZWMzfSB2IHRoZSB2ZWMzIHRvIHNjYWxlIHRoZSBtYXRyaXggYnlcbiAqIEByZXR1cm5zIHttYXQ0fSBvdXRcbiAqKi9cbm1hdDQuc2NhbGUgPSBmdW5jdGlvbihvdXQsIGEsIHYpIHtcbiAgICB2YXIgeCA9IHZbMF0sIHkgPSB2WzFdLCB6ID0gdlsyXTtcblxuICAgIG91dFswXSA9IGFbMF0gKiB4O1xuICAgIG91dFsxXSA9IGFbMV0gKiB4O1xuICAgIG91dFsyXSA9IGFbMl0gKiB4O1xuICAgIG91dFszXSA9IGFbM10gKiB4O1xuICAgIG91dFs0XSA9IGFbNF0gKiB5O1xuICAgIG91dFs1XSA9IGFbNV0gKiB5O1xuICAgIG91dFs2XSA9IGFbNl0gKiB5O1xuICAgIG91dFs3XSA9IGFbN10gKiB5O1xuICAgIG91dFs4XSA9IGFbOF0gKiB6O1xuICAgIG91dFs5XSA9IGFbOV0gKiB6O1xuICAgIG91dFsxMF0gPSBhWzEwXSAqIHo7XG4gICAgb3V0WzExXSA9IGFbMTFdICogejtcbiAgICBvdXRbMTJdID0gYVsxMl07XG4gICAgb3V0WzEzXSA9IGFbMTNdO1xuICAgIG91dFsxNF0gPSBhWzE0XTtcbiAgICBvdXRbMTVdID0gYVsxNV07XG4gICAgcmV0dXJuIG91dDtcbn07XG5cbi8qKlxuICogUm90YXRlcyBhIG1hdDQgYnkgdGhlIGdpdmVuIGFuZ2xlXG4gKlxuICogQHBhcmFtIHttYXQ0fSBvdXQgdGhlIHJlY2VpdmluZyBtYXRyaXhcbiAqIEBwYXJhbSB7bWF0NH0gYSB0aGUgbWF0cml4IHRvIHJvdGF0ZVxuICogQHBhcmFtIHtOdW1iZXJ9IHJhZCB0aGUgYW5nbGUgdG8gcm90YXRlIHRoZSBtYXRyaXggYnlcbiAqIEBwYXJhbSB7dmVjM30gYXhpcyB0aGUgYXhpcyB0byByb3RhdGUgYXJvdW5kXG4gKiBAcmV0dXJucyB7bWF0NH0gb3V0XG4gKi9cbm1hdDQucm90YXRlID0gZnVuY3Rpb24gKG91dCwgYSwgcmFkLCBheGlzKSB7XG4gICAgdmFyIHggPSBheGlzWzBdLCB5ID0gYXhpc1sxXSwgeiA9IGF4aXNbMl0sXG4gICAgICAgIGxlbiA9IE1hdGguc3FydCh4ICogeCArIHkgKiB5ICsgeiAqIHopLFxuICAgICAgICBzLCBjLCB0LFxuICAgICAgICBhMDAsIGEwMSwgYTAyLCBhMDMsXG4gICAgICAgIGExMCwgYTExLCBhMTIsIGExMyxcbiAgICAgICAgYTIwLCBhMjEsIGEyMiwgYTIzLFxuICAgICAgICBiMDAsIGIwMSwgYjAyLFxuICAgICAgICBiMTAsIGIxMSwgYjEyLFxuICAgICAgICBiMjAsIGIyMSwgYjIyO1xuXG4gICAgaWYgKE1hdGguYWJzKGxlbikgPCBHTE1BVF9FUFNJTE9OKSB7IHJldHVybiBudWxsOyB9XG4gICAgXG4gICAgbGVuID0gMSAvIGxlbjtcbiAgICB4ICo9IGxlbjtcbiAgICB5ICo9IGxlbjtcbiAgICB6ICo9IGxlbjtcblxuICAgIHMgPSBNYXRoLnNpbihyYWQpO1xuICAgIGMgPSBNYXRoLmNvcyhyYWQpO1xuICAgIHQgPSAxIC0gYztcblxuICAgIGEwMCA9IGFbMF07IGEwMSA9IGFbMV07IGEwMiA9IGFbMl07IGEwMyA9IGFbM107XG4gICAgYTEwID0gYVs0XTsgYTExID0gYVs1XTsgYTEyID0gYVs2XTsgYTEzID0gYVs3XTtcbiAgICBhMjAgPSBhWzhdOyBhMjEgPSBhWzldOyBhMjIgPSBhWzEwXTsgYTIzID0gYVsxMV07XG5cbiAgICAvLyBDb25zdHJ1Y3QgdGhlIGVsZW1lbnRzIG9mIHRoZSByb3RhdGlvbiBtYXRyaXhcbiAgICBiMDAgPSB4ICogeCAqIHQgKyBjOyBiMDEgPSB5ICogeCAqIHQgKyB6ICogczsgYjAyID0geiAqIHggKiB0IC0geSAqIHM7XG4gICAgYjEwID0geCAqIHkgKiB0IC0geiAqIHM7IGIxMSA9IHkgKiB5ICogdCArIGM7IGIxMiA9IHogKiB5ICogdCArIHggKiBzO1xuICAgIGIyMCA9IHggKiB6ICogdCArIHkgKiBzOyBiMjEgPSB5ICogeiAqIHQgLSB4ICogczsgYjIyID0geiAqIHogKiB0ICsgYztcblxuICAgIC8vIFBlcmZvcm0gcm90YXRpb24tc3BlY2lmaWMgbWF0cml4IG11bHRpcGxpY2F0aW9uXG4gICAgb3V0WzBdID0gYTAwICogYjAwICsgYTEwICogYjAxICsgYTIwICogYjAyO1xuICAgIG91dFsxXSA9IGEwMSAqIGIwMCArIGExMSAqIGIwMSArIGEyMSAqIGIwMjtcbiAgICBvdXRbMl0gPSBhMDIgKiBiMDAgKyBhMTIgKiBiMDEgKyBhMjIgKiBiMDI7XG4gICAgb3V0WzNdID0gYTAzICogYjAwICsgYTEzICogYjAxICsgYTIzICogYjAyO1xuICAgIG91dFs0XSA9IGEwMCAqIGIxMCArIGExMCAqIGIxMSArIGEyMCAqIGIxMjtcbiAgICBvdXRbNV0gPSBhMDEgKiBiMTAgKyBhMTEgKiBiMTEgKyBhMjEgKiBiMTI7XG4gICAgb3V0WzZdID0gYTAyICogYjEwICsgYTEyICogYjExICsgYTIyICogYjEyO1xuICAgIG91dFs3XSA9IGEwMyAqIGIxMCArIGExMyAqIGIxMSArIGEyMyAqIGIxMjtcbiAgICBvdXRbOF0gPSBhMDAgKiBiMjAgKyBhMTAgKiBiMjEgKyBhMjAgKiBiMjI7XG4gICAgb3V0WzldID0gYTAxICogYjIwICsgYTExICogYjIxICsgYTIxICogYjIyO1xuICAgIG91dFsxMF0gPSBhMDIgKiBiMjAgKyBhMTIgKiBiMjEgKyBhMjIgKiBiMjI7XG4gICAgb3V0WzExXSA9IGEwMyAqIGIyMCArIGExMyAqIGIyMSArIGEyMyAqIGIyMjtcblxuICAgIGlmIChhICE9PSBvdXQpIHsgLy8gSWYgdGhlIHNvdXJjZSBhbmQgZGVzdGluYXRpb24gZGlmZmVyLCBjb3B5IHRoZSB1bmNoYW5nZWQgbGFzdCByb3dcbiAgICAgICAgb3V0WzEyXSA9IGFbMTJdO1xuICAgICAgICBvdXRbMTNdID0gYVsxM107XG4gICAgICAgIG91dFsxNF0gPSBhWzE0XTtcbiAgICAgICAgb3V0WzE1XSA9IGFbMTVdO1xuICAgIH1cbiAgICByZXR1cm4gb3V0O1xufTtcblxuLyoqXG4gKiBSb3RhdGVzIGEgbWF0cml4IGJ5IHRoZSBnaXZlbiBhbmdsZSBhcm91bmQgdGhlIFggYXhpc1xuICpcbiAqIEBwYXJhbSB7bWF0NH0gb3V0IHRoZSByZWNlaXZpbmcgbWF0cml4XG4gKiBAcGFyYW0ge21hdDR9IGEgdGhlIG1hdHJpeCB0byByb3RhdGVcbiAqIEBwYXJhbSB7TnVtYmVyfSByYWQgdGhlIGFuZ2xlIHRvIHJvdGF0ZSB0aGUgbWF0cml4IGJ5XG4gKiBAcmV0dXJucyB7bWF0NH0gb3V0XG4gKi9cbm1hdDQucm90YXRlWCA9IGZ1bmN0aW9uIChvdXQsIGEsIHJhZCkge1xuICAgIHZhciBzID0gTWF0aC5zaW4ocmFkKSxcbiAgICAgICAgYyA9IE1hdGguY29zKHJhZCksXG4gICAgICAgIGExMCA9IGFbNF0sXG4gICAgICAgIGExMSA9IGFbNV0sXG4gICAgICAgIGExMiA9IGFbNl0sXG4gICAgICAgIGExMyA9IGFbN10sXG4gICAgICAgIGEyMCA9IGFbOF0sXG4gICAgICAgIGEyMSA9IGFbOV0sXG4gICAgICAgIGEyMiA9IGFbMTBdLFxuICAgICAgICBhMjMgPSBhWzExXTtcblxuICAgIGlmIChhICE9PSBvdXQpIHsgLy8gSWYgdGhlIHNvdXJjZSBhbmQgZGVzdGluYXRpb24gZGlmZmVyLCBjb3B5IHRoZSB1bmNoYW5nZWQgcm93c1xuICAgICAgICBvdXRbMF0gID0gYVswXTtcbiAgICAgICAgb3V0WzFdICA9IGFbMV07XG4gICAgICAgIG91dFsyXSAgPSBhWzJdO1xuICAgICAgICBvdXRbM10gID0gYVszXTtcbiAgICAgICAgb3V0WzEyXSA9IGFbMTJdO1xuICAgICAgICBvdXRbMTNdID0gYVsxM107XG4gICAgICAgIG91dFsxNF0gPSBhWzE0XTtcbiAgICAgICAgb3V0WzE1XSA9IGFbMTVdO1xuICAgIH1cblxuICAgIC8vIFBlcmZvcm0gYXhpcy1zcGVjaWZpYyBtYXRyaXggbXVsdGlwbGljYXRpb25cbiAgICBvdXRbNF0gPSBhMTAgKiBjICsgYTIwICogcztcbiAgICBvdXRbNV0gPSBhMTEgKiBjICsgYTIxICogcztcbiAgICBvdXRbNl0gPSBhMTIgKiBjICsgYTIyICogcztcbiAgICBvdXRbN10gPSBhMTMgKiBjICsgYTIzICogcztcbiAgICBvdXRbOF0gPSBhMjAgKiBjIC0gYTEwICogcztcbiAgICBvdXRbOV0gPSBhMjEgKiBjIC0gYTExICogcztcbiAgICBvdXRbMTBdID0gYTIyICogYyAtIGExMiAqIHM7XG4gICAgb3V0WzExXSA9IGEyMyAqIGMgLSBhMTMgKiBzO1xuICAgIHJldHVybiBvdXQ7XG59O1xuXG4vKipcbiAqIFJvdGF0ZXMgYSBtYXRyaXggYnkgdGhlIGdpdmVuIGFuZ2xlIGFyb3VuZCB0aGUgWSBheGlzXG4gKlxuICogQHBhcmFtIHttYXQ0fSBvdXQgdGhlIHJlY2VpdmluZyBtYXRyaXhcbiAqIEBwYXJhbSB7bWF0NH0gYSB0aGUgbWF0cml4IHRvIHJvdGF0ZVxuICogQHBhcmFtIHtOdW1iZXJ9IHJhZCB0aGUgYW5nbGUgdG8gcm90YXRlIHRoZSBtYXRyaXggYnlcbiAqIEByZXR1cm5zIHttYXQ0fSBvdXRcbiAqL1xubWF0NC5yb3RhdGVZID0gZnVuY3Rpb24gKG91dCwgYSwgcmFkKSB7XG4gICAgdmFyIHMgPSBNYXRoLnNpbihyYWQpLFxuICAgICAgICBjID0gTWF0aC5jb3MocmFkKSxcbiAgICAgICAgYTAwID0gYVswXSxcbiAgICAgICAgYTAxID0gYVsxXSxcbiAgICAgICAgYTAyID0gYVsyXSxcbiAgICAgICAgYTAzID0gYVszXSxcbiAgICAgICAgYTIwID0gYVs4XSxcbiAgICAgICAgYTIxID0gYVs5XSxcbiAgICAgICAgYTIyID0gYVsxMF0sXG4gICAgICAgIGEyMyA9IGFbMTFdO1xuXG4gICAgaWYgKGEgIT09IG91dCkgeyAvLyBJZiB0aGUgc291cmNlIGFuZCBkZXN0aW5hdGlvbiBkaWZmZXIsIGNvcHkgdGhlIHVuY2hhbmdlZCByb3dzXG4gICAgICAgIG91dFs0XSAgPSBhWzRdO1xuICAgICAgICBvdXRbNV0gID0gYVs1XTtcbiAgICAgICAgb3V0WzZdICA9IGFbNl07XG4gICAgICAgIG91dFs3XSAgPSBhWzddO1xuICAgICAgICBvdXRbMTJdID0gYVsxMl07XG4gICAgICAgIG91dFsxM10gPSBhWzEzXTtcbiAgICAgICAgb3V0WzE0XSA9IGFbMTRdO1xuICAgICAgICBvdXRbMTVdID0gYVsxNV07XG4gICAgfVxuXG4gICAgLy8gUGVyZm9ybSBheGlzLXNwZWNpZmljIG1hdHJpeCBtdWx0aXBsaWNhdGlvblxuICAgIG91dFswXSA9IGEwMCAqIGMgLSBhMjAgKiBzO1xuICAgIG91dFsxXSA9IGEwMSAqIGMgLSBhMjEgKiBzO1xuICAgIG91dFsyXSA9IGEwMiAqIGMgLSBhMjIgKiBzO1xuICAgIG91dFszXSA9IGEwMyAqIGMgLSBhMjMgKiBzO1xuICAgIG91dFs4XSA9IGEwMCAqIHMgKyBhMjAgKiBjO1xuICAgIG91dFs5XSA9IGEwMSAqIHMgKyBhMjEgKiBjO1xuICAgIG91dFsxMF0gPSBhMDIgKiBzICsgYTIyICogYztcbiAgICBvdXRbMTFdID0gYTAzICogcyArIGEyMyAqIGM7XG4gICAgcmV0dXJuIG91dDtcbn07XG5cbi8qKlxuICogUm90YXRlcyBhIG1hdHJpeCBieSB0aGUgZ2l2ZW4gYW5nbGUgYXJvdW5kIHRoZSBaIGF4aXNcbiAqXG4gKiBAcGFyYW0ge21hdDR9IG91dCB0aGUgcmVjZWl2aW5nIG1hdHJpeFxuICogQHBhcmFtIHttYXQ0fSBhIHRoZSBtYXRyaXggdG8gcm90YXRlXG4gKiBAcGFyYW0ge051bWJlcn0gcmFkIHRoZSBhbmdsZSB0byByb3RhdGUgdGhlIG1hdHJpeCBieVxuICogQHJldHVybnMge21hdDR9IG91dFxuICovXG5tYXQ0LnJvdGF0ZVogPSBmdW5jdGlvbiAob3V0LCBhLCByYWQpIHtcbiAgICB2YXIgcyA9IE1hdGguc2luKHJhZCksXG4gICAgICAgIGMgPSBNYXRoLmNvcyhyYWQpLFxuICAgICAgICBhMDAgPSBhWzBdLFxuICAgICAgICBhMDEgPSBhWzFdLFxuICAgICAgICBhMDIgPSBhWzJdLFxuICAgICAgICBhMDMgPSBhWzNdLFxuICAgICAgICBhMTAgPSBhWzRdLFxuICAgICAgICBhMTEgPSBhWzVdLFxuICAgICAgICBhMTIgPSBhWzZdLFxuICAgICAgICBhMTMgPSBhWzddO1xuXG4gICAgaWYgKGEgIT09IG91dCkgeyAvLyBJZiB0aGUgc291cmNlIGFuZCBkZXN0aW5hdGlvbiBkaWZmZXIsIGNvcHkgdGhlIHVuY2hhbmdlZCBsYXN0IHJvd1xuICAgICAgICBvdXRbOF0gID0gYVs4XTtcbiAgICAgICAgb3V0WzldICA9IGFbOV07XG4gICAgICAgIG91dFsxMF0gPSBhWzEwXTtcbiAgICAgICAgb3V0WzExXSA9IGFbMTFdO1xuICAgICAgICBvdXRbMTJdID0gYVsxMl07XG4gICAgICAgIG91dFsxM10gPSBhWzEzXTtcbiAgICAgICAgb3V0WzE0XSA9IGFbMTRdO1xuICAgICAgICBvdXRbMTVdID0gYVsxNV07XG4gICAgfVxuXG4gICAgLy8gUGVyZm9ybSBheGlzLXNwZWNpZmljIG1hdHJpeCBtdWx0aXBsaWNhdGlvblxuICAgIG91dFswXSA9IGEwMCAqIGMgKyBhMTAgKiBzO1xuICAgIG91dFsxXSA9IGEwMSAqIGMgKyBhMTEgKiBzO1xuICAgIG91dFsyXSA9IGEwMiAqIGMgKyBhMTIgKiBzO1xuICAgIG91dFszXSA9IGEwMyAqIGMgKyBhMTMgKiBzO1xuICAgIG91dFs0XSA9IGExMCAqIGMgLSBhMDAgKiBzO1xuICAgIG91dFs1XSA9IGExMSAqIGMgLSBhMDEgKiBzO1xuICAgIG91dFs2XSA9IGExMiAqIGMgLSBhMDIgKiBzO1xuICAgIG91dFs3XSA9IGExMyAqIGMgLSBhMDMgKiBzO1xuICAgIHJldHVybiBvdXQ7XG59O1xuXG4vKipcbiAqIENyZWF0ZXMgYSBtYXRyaXggZnJvbSBhIHF1YXRlcm5pb24gcm90YXRpb24gYW5kIHZlY3RvciB0cmFuc2xhdGlvblxuICogVGhpcyBpcyBlcXVpdmFsZW50IHRvIChidXQgbXVjaCBmYXN0ZXIgdGhhbik6XG4gKlxuICogICAgIG1hdDQuaWRlbnRpdHkoZGVzdCk7XG4gKiAgICAgbWF0NC50cmFuc2xhdGUoZGVzdCwgdmVjKTtcbiAqICAgICB2YXIgcXVhdE1hdCA9IG1hdDQuY3JlYXRlKCk7XG4gKiAgICAgcXVhdDQudG9NYXQ0KHF1YXQsIHF1YXRNYXQpO1xuICogICAgIG1hdDQubXVsdGlwbHkoZGVzdCwgcXVhdE1hdCk7XG4gKlxuICogQHBhcmFtIHttYXQ0fSBvdXQgbWF0NCByZWNlaXZpbmcgb3BlcmF0aW9uIHJlc3VsdFxuICogQHBhcmFtIHtxdWF0NH0gcSBSb3RhdGlvbiBxdWF0ZXJuaW9uXG4gKiBAcGFyYW0ge3ZlYzN9IHYgVHJhbnNsYXRpb24gdmVjdG9yXG4gKiBAcmV0dXJucyB7bWF0NH0gb3V0XG4gKi9cbm1hdDQuZnJvbVJvdGF0aW9uVHJhbnNsYXRpb24gPSBmdW5jdGlvbiAob3V0LCBxLCB2KSB7XG4gICAgLy8gUXVhdGVybmlvbiBtYXRoXG4gICAgdmFyIHggPSBxWzBdLCB5ID0gcVsxXSwgeiA9IHFbMl0sIHcgPSBxWzNdLFxuICAgICAgICB4MiA9IHggKyB4LFxuICAgICAgICB5MiA9IHkgKyB5LFxuICAgICAgICB6MiA9IHogKyB6LFxuXG4gICAgICAgIHh4ID0geCAqIHgyLFxuICAgICAgICB4eSA9IHggKiB5MixcbiAgICAgICAgeHogPSB4ICogejIsXG4gICAgICAgIHl5ID0geSAqIHkyLFxuICAgICAgICB5eiA9IHkgKiB6MixcbiAgICAgICAgenogPSB6ICogejIsXG4gICAgICAgIHd4ID0gdyAqIHgyLFxuICAgICAgICB3eSA9IHcgKiB5MixcbiAgICAgICAgd3ogPSB3ICogejI7XG5cbiAgICBvdXRbMF0gPSAxIC0gKHl5ICsgenopO1xuICAgIG91dFsxXSA9IHh5ICsgd3o7XG4gICAgb3V0WzJdID0geHogLSB3eTtcbiAgICBvdXRbM10gPSAwO1xuICAgIG91dFs0XSA9IHh5IC0gd3o7XG4gICAgb3V0WzVdID0gMSAtICh4eCArIHp6KTtcbiAgICBvdXRbNl0gPSB5eiArIHd4O1xuICAgIG91dFs3XSA9IDA7XG4gICAgb3V0WzhdID0geHogKyB3eTtcbiAgICBvdXRbOV0gPSB5eiAtIHd4O1xuICAgIG91dFsxMF0gPSAxIC0gKHh4ICsgeXkpO1xuICAgIG91dFsxMV0gPSAwO1xuICAgIG91dFsxMl0gPSB2WzBdO1xuICAgIG91dFsxM10gPSB2WzFdO1xuICAgIG91dFsxNF0gPSB2WzJdO1xuICAgIG91dFsxNV0gPSAxO1xuICAgIFxuICAgIHJldHVybiBvdXQ7XG59O1xuXG4vKipcbiogQ2FsY3VsYXRlcyBhIDR4NCBtYXRyaXggZnJvbSB0aGUgZ2l2ZW4gcXVhdGVybmlvblxuKlxuKiBAcGFyYW0ge21hdDR9IG91dCBtYXQ0IHJlY2VpdmluZyBvcGVyYXRpb24gcmVzdWx0XG4qIEBwYXJhbSB7cXVhdH0gcSBRdWF0ZXJuaW9uIHRvIGNyZWF0ZSBtYXRyaXggZnJvbVxuKlxuKiBAcmV0dXJucyB7bWF0NH0gb3V0XG4qL1xubWF0NC5mcm9tUXVhdCA9IGZ1bmN0aW9uIChvdXQsIHEpIHtcbiAgICB2YXIgeCA9IHFbMF0sIHkgPSBxWzFdLCB6ID0gcVsyXSwgdyA9IHFbM10sXG4gICAgICAgIHgyID0geCArIHgsXG4gICAgICAgIHkyID0geSArIHksXG4gICAgICAgIHoyID0geiArIHosXG5cbiAgICAgICAgeHggPSB4ICogeDIsXG4gICAgICAgIHh5ID0geCAqIHkyLFxuICAgICAgICB4eiA9IHggKiB6MixcbiAgICAgICAgeXkgPSB5ICogeTIsXG4gICAgICAgIHl6ID0geSAqIHoyLFxuICAgICAgICB6eiA9IHogKiB6MixcbiAgICAgICAgd3ggPSB3ICogeDIsXG4gICAgICAgIHd5ID0gdyAqIHkyLFxuICAgICAgICB3eiA9IHcgKiB6MjtcblxuICAgIG91dFswXSA9IDEgLSAoeXkgKyB6eik7XG4gICAgb3V0WzFdID0geHkgKyB3ejtcbiAgICBvdXRbMl0gPSB4eiAtIHd5O1xuICAgIG91dFszXSA9IDA7XG5cbiAgICBvdXRbNF0gPSB4eSAtIHd6O1xuICAgIG91dFs1XSA9IDEgLSAoeHggKyB6eik7XG4gICAgb3V0WzZdID0geXogKyB3eDtcbiAgICBvdXRbN10gPSAwO1xuXG4gICAgb3V0WzhdID0geHogKyB3eTtcbiAgICBvdXRbOV0gPSB5eiAtIHd4O1xuICAgIG91dFsxMF0gPSAxIC0gKHh4ICsgeXkpO1xuICAgIG91dFsxMV0gPSAwO1xuXG4gICAgb3V0WzEyXSA9IDA7XG4gICAgb3V0WzEzXSA9IDA7XG4gICAgb3V0WzE0XSA9IDA7XG4gICAgb3V0WzE1XSA9IDE7XG5cbiAgICByZXR1cm4gb3V0O1xufTtcblxuLyoqXG4gKiBHZW5lcmF0ZXMgYSBmcnVzdHVtIG1hdHJpeCB3aXRoIHRoZSBnaXZlbiBib3VuZHNcbiAqXG4gKiBAcGFyYW0ge21hdDR9IG91dCBtYXQ0IGZydXN0dW0gbWF0cml4IHdpbGwgYmUgd3JpdHRlbiBpbnRvXG4gKiBAcGFyYW0ge051bWJlcn0gbGVmdCBMZWZ0IGJvdW5kIG9mIHRoZSBmcnVzdHVtXG4gKiBAcGFyYW0ge051bWJlcn0gcmlnaHQgUmlnaHQgYm91bmQgb2YgdGhlIGZydXN0dW1cbiAqIEBwYXJhbSB7TnVtYmVyfSBib3R0b20gQm90dG9tIGJvdW5kIG9mIHRoZSBmcnVzdHVtXG4gKiBAcGFyYW0ge051bWJlcn0gdG9wIFRvcCBib3VuZCBvZiB0aGUgZnJ1c3R1bVxuICogQHBhcmFtIHtOdW1iZXJ9IG5lYXIgTmVhciBib3VuZCBvZiB0aGUgZnJ1c3R1bVxuICogQHBhcmFtIHtOdW1iZXJ9IGZhciBGYXIgYm91bmQgb2YgdGhlIGZydXN0dW1cbiAqIEByZXR1cm5zIHttYXQ0fSBvdXRcbiAqL1xubWF0NC5mcnVzdHVtID0gZnVuY3Rpb24gKG91dCwgbGVmdCwgcmlnaHQsIGJvdHRvbSwgdG9wLCBuZWFyLCBmYXIpIHtcbiAgICB2YXIgcmwgPSAxIC8gKHJpZ2h0IC0gbGVmdCksXG4gICAgICAgIHRiID0gMSAvICh0b3AgLSBib3R0b20pLFxuICAgICAgICBuZiA9IDEgLyAobmVhciAtIGZhcik7XG4gICAgb3V0WzBdID0gKG5lYXIgKiAyKSAqIHJsO1xuICAgIG91dFsxXSA9IDA7XG4gICAgb3V0WzJdID0gMDtcbiAgICBvdXRbM10gPSAwO1xuICAgIG91dFs0XSA9IDA7XG4gICAgb3V0WzVdID0gKG5lYXIgKiAyKSAqIHRiO1xuICAgIG91dFs2XSA9IDA7XG4gICAgb3V0WzddID0gMDtcbiAgICBvdXRbOF0gPSAocmlnaHQgKyBsZWZ0KSAqIHJsO1xuICAgIG91dFs5XSA9ICh0b3AgKyBib3R0b20pICogdGI7XG4gICAgb3V0WzEwXSA9IChmYXIgKyBuZWFyKSAqIG5mO1xuICAgIG91dFsxMV0gPSAtMTtcbiAgICBvdXRbMTJdID0gMDtcbiAgICBvdXRbMTNdID0gMDtcbiAgICBvdXRbMTRdID0gKGZhciAqIG5lYXIgKiAyKSAqIG5mO1xuICAgIG91dFsxNV0gPSAwO1xuICAgIHJldHVybiBvdXQ7XG59O1xuXG4vKipcbiAqIEdlbmVyYXRlcyBhIHBlcnNwZWN0aXZlIHByb2plY3Rpb24gbWF0cml4IHdpdGggdGhlIGdpdmVuIGJvdW5kc1xuICpcbiAqIEBwYXJhbSB7bWF0NH0gb3V0IG1hdDQgZnJ1c3R1bSBtYXRyaXggd2lsbCBiZSB3cml0dGVuIGludG9cbiAqIEBwYXJhbSB7bnVtYmVyfSBmb3Z5IFZlcnRpY2FsIGZpZWxkIG9mIHZpZXcgaW4gcmFkaWFuc1xuICogQHBhcmFtIHtudW1iZXJ9IGFzcGVjdCBBc3BlY3QgcmF0aW8uIHR5cGljYWxseSB2aWV3cG9ydCB3aWR0aC9oZWlnaHRcbiAqIEBwYXJhbSB7bnVtYmVyfSBuZWFyIE5lYXIgYm91bmQgb2YgdGhlIGZydXN0dW1cbiAqIEBwYXJhbSB7bnVtYmVyfSBmYXIgRmFyIGJvdW5kIG9mIHRoZSBmcnVzdHVtXG4gKiBAcmV0dXJucyB7bWF0NH0gb3V0XG4gKi9cbm1hdDQucGVyc3BlY3RpdmUgPSBmdW5jdGlvbiAob3V0LCBmb3Z5LCBhc3BlY3QsIG5lYXIsIGZhcikge1xuICAgIHZhciBmID0gMS4wIC8gTWF0aC50YW4oZm92eSAvIDIpLFxuICAgICAgICBuZiA9IDEgLyAobmVhciAtIGZhcik7XG4gICAgb3V0WzBdID0gZiAvIGFzcGVjdDtcbiAgICBvdXRbMV0gPSAwO1xuICAgIG91dFsyXSA9IDA7XG4gICAgb3V0WzNdID0gMDtcbiAgICBvdXRbNF0gPSAwO1xuICAgIG91dFs1XSA9IGY7XG4gICAgb3V0WzZdID0gMDtcbiAgICBvdXRbN10gPSAwO1xuICAgIG91dFs4XSA9IDA7XG4gICAgb3V0WzldID0gMDtcbiAgICBvdXRbMTBdID0gKGZhciArIG5lYXIpICogbmY7XG4gICAgb3V0WzExXSA9IC0xO1xuICAgIG91dFsxMl0gPSAwO1xuICAgIG91dFsxM10gPSAwO1xuICAgIG91dFsxNF0gPSAoMiAqIGZhciAqIG5lYXIpICogbmY7XG4gICAgb3V0WzE1XSA9IDA7XG4gICAgcmV0dXJuIG91dDtcbn07XG5cbi8qKlxuICogR2VuZXJhdGVzIGEgb3J0aG9nb25hbCBwcm9qZWN0aW9uIG1hdHJpeCB3aXRoIHRoZSBnaXZlbiBib3VuZHNcbiAqXG4gKiBAcGFyYW0ge21hdDR9IG91dCBtYXQ0IGZydXN0dW0gbWF0cml4IHdpbGwgYmUgd3JpdHRlbiBpbnRvXG4gKiBAcGFyYW0ge251bWJlcn0gbGVmdCBMZWZ0IGJvdW5kIG9mIHRoZSBmcnVzdHVtXG4gKiBAcGFyYW0ge251bWJlcn0gcmlnaHQgUmlnaHQgYm91bmQgb2YgdGhlIGZydXN0dW1cbiAqIEBwYXJhbSB7bnVtYmVyfSBib3R0b20gQm90dG9tIGJvdW5kIG9mIHRoZSBmcnVzdHVtXG4gKiBAcGFyYW0ge251bWJlcn0gdG9wIFRvcCBib3VuZCBvZiB0aGUgZnJ1c3R1bVxuICogQHBhcmFtIHtudW1iZXJ9IG5lYXIgTmVhciBib3VuZCBvZiB0aGUgZnJ1c3R1bVxuICogQHBhcmFtIHtudW1iZXJ9IGZhciBGYXIgYm91bmQgb2YgdGhlIGZydXN0dW1cbiAqIEByZXR1cm5zIHttYXQ0fSBvdXRcbiAqL1xubWF0NC5vcnRobyA9IGZ1bmN0aW9uIChvdXQsIGxlZnQsIHJpZ2h0LCBib3R0b20sIHRvcCwgbmVhciwgZmFyKSB7XG4gICAgdmFyIGxyID0gMSAvIChsZWZ0IC0gcmlnaHQpLFxuICAgICAgICBidCA9IDEgLyAoYm90dG9tIC0gdG9wKSxcbiAgICAgICAgbmYgPSAxIC8gKG5lYXIgLSBmYXIpO1xuICAgIG91dFswXSA9IC0yICogbHI7XG4gICAgb3V0WzFdID0gMDtcbiAgICBvdXRbMl0gPSAwO1xuICAgIG91dFszXSA9IDA7XG4gICAgb3V0WzRdID0gMDtcbiAgICBvdXRbNV0gPSAtMiAqIGJ0O1xuICAgIG91dFs2XSA9IDA7XG4gICAgb3V0WzddID0gMDtcbiAgICBvdXRbOF0gPSAwO1xuICAgIG91dFs5XSA9IDA7XG4gICAgb3V0WzEwXSA9IDIgKiBuZjtcbiAgICBvdXRbMTFdID0gMDtcbiAgICBvdXRbMTJdID0gKGxlZnQgKyByaWdodCkgKiBscjtcbiAgICBvdXRbMTNdID0gKHRvcCArIGJvdHRvbSkgKiBidDtcbiAgICBvdXRbMTRdID0gKGZhciArIG5lYXIpICogbmY7XG4gICAgb3V0WzE1XSA9IDE7XG4gICAgcmV0dXJuIG91dDtcbn07XG5cbi8qKlxuICogR2VuZXJhdGVzIGEgbG9vay1hdCBtYXRyaXggd2l0aCB0aGUgZ2l2ZW4gZXllIHBvc2l0aW9uLCBmb2NhbCBwb2ludCwgYW5kIHVwIGF4aXNcbiAqXG4gKiBAcGFyYW0ge21hdDR9IG91dCBtYXQ0IGZydXN0dW0gbWF0cml4IHdpbGwgYmUgd3JpdHRlbiBpbnRvXG4gKiBAcGFyYW0ge3ZlYzN9IGV5ZSBQb3NpdGlvbiBvZiB0aGUgdmlld2VyXG4gKiBAcGFyYW0ge3ZlYzN9IGNlbnRlciBQb2ludCB0aGUgdmlld2VyIGlzIGxvb2tpbmcgYXRcbiAqIEBwYXJhbSB7dmVjM30gdXAgdmVjMyBwb2ludGluZyB1cFxuICogQHJldHVybnMge21hdDR9IG91dFxuICovXG5tYXQ0Lmxvb2tBdCA9IGZ1bmN0aW9uIChvdXQsIGV5ZSwgY2VudGVyLCB1cCkge1xuICAgIHZhciB4MCwgeDEsIHgyLCB5MCwgeTEsIHkyLCB6MCwgejEsIHoyLCBsZW4sXG4gICAgICAgIGV5ZXggPSBleWVbMF0sXG4gICAgICAgIGV5ZXkgPSBleWVbMV0sXG4gICAgICAgIGV5ZXogPSBleWVbMl0sXG4gICAgICAgIHVweCA9IHVwWzBdLFxuICAgICAgICB1cHkgPSB1cFsxXSxcbiAgICAgICAgdXB6ID0gdXBbMl0sXG4gICAgICAgIGNlbnRlcnggPSBjZW50ZXJbMF0sXG4gICAgICAgIGNlbnRlcnkgPSBjZW50ZXJbMV0sXG4gICAgICAgIGNlbnRlcnogPSBjZW50ZXJbMl07XG5cbiAgICBpZiAoTWF0aC5hYnMoZXlleCAtIGNlbnRlcngpIDwgR0xNQVRfRVBTSUxPTiAmJlxuICAgICAgICBNYXRoLmFicyhleWV5IC0gY2VudGVyeSkgPCBHTE1BVF9FUFNJTE9OICYmXG4gICAgICAgIE1hdGguYWJzKGV5ZXogLSBjZW50ZXJ6KSA8IEdMTUFUX0VQU0lMT04pIHtcbiAgICAgICAgcmV0dXJuIG1hdDQuaWRlbnRpdHkob3V0KTtcbiAgICB9XG5cbiAgICB6MCA9IGV5ZXggLSBjZW50ZXJ4O1xuICAgIHoxID0gZXlleSAtIGNlbnRlcnk7XG4gICAgejIgPSBleWV6IC0gY2VudGVyejtcblxuICAgIGxlbiA9IDEgLyBNYXRoLnNxcnQoejAgKiB6MCArIHoxICogejEgKyB6MiAqIHoyKTtcbiAgICB6MCAqPSBsZW47XG4gICAgejEgKj0gbGVuO1xuICAgIHoyICo9IGxlbjtcblxuICAgIHgwID0gdXB5ICogejIgLSB1cHogKiB6MTtcbiAgICB4MSA9IHVweiAqIHowIC0gdXB4ICogejI7XG4gICAgeDIgPSB1cHggKiB6MSAtIHVweSAqIHowO1xuICAgIGxlbiA9IE1hdGguc3FydCh4MCAqIHgwICsgeDEgKiB4MSArIHgyICogeDIpO1xuICAgIGlmICghbGVuKSB7XG4gICAgICAgIHgwID0gMDtcbiAgICAgICAgeDEgPSAwO1xuICAgICAgICB4MiA9IDA7XG4gICAgfSBlbHNlIHtcbiAgICAgICAgbGVuID0gMSAvIGxlbjtcbiAgICAgICAgeDAgKj0gbGVuO1xuICAgICAgICB4MSAqPSBsZW47XG4gICAgICAgIHgyICo9IGxlbjtcbiAgICB9XG5cbiAgICB5MCA9IHoxICogeDIgLSB6MiAqIHgxO1xuICAgIHkxID0gejIgKiB4MCAtIHowICogeDI7XG4gICAgeTIgPSB6MCAqIHgxIC0gejEgKiB4MDtcblxuICAgIGxlbiA9IE1hdGguc3FydCh5MCAqIHkwICsgeTEgKiB5MSArIHkyICogeTIpO1xuICAgIGlmICghbGVuKSB7XG4gICAgICAgIHkwID0gMDtcbiAgICAgICAgeTEgPSAwO1xuICAgICAgICB5MiA9IDA7XG4gICAgfSBlbHNlIHtcbiAgICAgICAgbGVuID0gMSAvIGxlbjtcbiAgICAgICAgeTAgKj0gbGVuO1xuICAgICAgICB5MSAqPSBsZW47XG4gICAgICAgIHkyICo9IGxlbjtcbiAgICB9XG5cbiAgICBvdXRbMF0gPSB4MDtcbiAgICBvdXRbMV0gPSB5MDtcbiAgICBvdXRbMl0gPSB6MDtcbiAgICBvdXRbM10gPSAwO1xuICAgIG91dFs0XSA9IHgxO1xuICAgIG91dFs1XSA9IHkxO1xuICAgIG91dFs2XSA9IHoxO1xuICAgIG91dFs3XSA9IDA7XG4gICAgb3V0WzhdID0geDI7XG4gICAgb3V0WzldID0geTI7XG4gICAgb3V0WzEwXSA9IHoyO1xuICAgIG91dFsxMV0gPSAwO1xuICAgIG91dFsxMl0gPSAtKHgwICogZXlleCArIHgxICogZXlleSArIHgyICogZXlleik7XG4gICAgb3V0WzEzXSA9IC0oeTAgKiBleWV4ICsgeTEgKiBleWV5ICsgeTIgKiBleWV6KTtcbiAgICBvdXRbMTRdID0gLSh6MCAqIGV5ZXggKyB6MSAqIGV5ZXkgKyB6MiAqIGV5ZXopO1xuICAgIG91dFsxNV0gPSAxO1xuXG4gICAgcmV0dXJuIG91dDtcbn07XG5cbi8qKlxuICogUmV0dXJucyBhIHN0cmluZyByZXByZXNlbnRhdGlvbiBvZiBhIG1hdDRcbiAqXG4gKiBAcGFyYW0ge21hdDR9IG1hdCBtYXRyaXggdG8gcmVwcmVzZW50IGFzIGEgc3RyaW5nXG4gKiBAcmV0dXJucyB7U3RyaW5nfSBzdHJpbmcgcmVwcmVzZW50YXRpb24gb2YgdGhlIG1hdHJpeFxuICovXG5tYXQ0LnN0ciA9IGZ1bmN0aW9uIChhKSB7XG4gICAgcmV0dXJuICdtYXQ0KCcgKyBhWzBdICsgJywgJyArIGFbMV0gKyAnLCAnICsgYVsyXSArICcsICcgKyBhWzNdICsgJywgJyArXG4gICAgICAgICAgICAgICAgICAgIGFbNF0gKyAnLCAnICsgYVs1XSArICcsICcgKyBhWzZdICsgJywgJyArIGFbN10gKyAnLCAnICtcbiAgICAgICAgICAgICAgICAgICAgYVs4XSArICcsICcgKyBhWzldICsgJywgJyArIGFbMTBdICsgJywgJyArIGFbMTFdICsgJywgJyArIFxuICAgICAgICAgICAgICAgICAgICBhWzEyXSArICcsICcgKyBhWzEzXSArICcsICcgKyBhWzE0XSArICcsICcgKyBhWzE1XSArICcpJztcbn07XG5cbmlmKHR5cGVvZihleHBvcnRzKSAhPT0gJ3VuZGVmaW5lZCcpIHtcbiAgICBleHBvcnRzLm1hdDQgPSBtYXQ0O1xufVxuO1xuLyogQ29weXJpZ2h0IChjKSAyMDEzLCBCcmFuZG9uIEpvbmVzLCBDb2xpbiBNYWNLZW56aWUgSVYuIEFsbCByaWdodHMgcmVzZXJ2ZWQuXG5cblJlZGlzdHJpYnV0aW9uIGFuZCB1c2UgaW4gc291cmNlIGFuZCBiaW5hcnkgZm9ybXMsIHdpdGggb3Igd2l0aG91dCBtb2RpZmljYXRpb24sXG5hcmUgcGVybWl0dGVkIHByb3ZpZGVkIHRoYXQgdGhlIGZvbGxvd2luZyBjb25kaXRpb25zIGFyZSBtZXQ6XG5cbiAgKiBSZWRpc3RyaWJ1dGlvbnMgb2Ygc291cmNlIGNvZGUgbXVzdCByZXRhaW4gdGhlIGFib3ZlIGNvcHlyaWdodCBub3RpY2UsIHRoaXNcbiAgICBsaXN0IG9mIGNvbmRpdGlvbnMgYW5kIHRoZSBmb2xsb3dpbmcgZGlzY2xhaW1lci5cbiAgKiBSZWRpc3RyaWJ1dGlvbnMgaW4gYmluYXJ5IGZvcm0gbXVzdCByZXByb2R1Y2UgdGhlIGFib3ZlIGNvcHlyaWdodCBub3RpY2UsXG4gICAgdGhpcyBsaXN0IG9mIGNvbmRpdGlvbnMgYW5kIHRoZSBmb2xsb3dpbmcgZGlzY2xhaW1lciBpbiB0aGUgZG9jdW1lbnRhdGlvbiBcbiAgICBhbmQvb3Igb3RoZXIgbWF0ZXJpYWxzIHByb3ZpZGVkIHdpdGggdGhlIGRpc3RyaWJ1dGlvbi5cblxuVEhJUyBTT0ZUV0FSRSBJUyBQUk9WSURFRCBCWSBUSEUgQ09QWVJJR0hUIEhPTERFUlMgQU5EIENPTlRSSUJVVE9SUyBcIkFTIElTXCIgQU5EXG5BTlkgRVhQUkVTUyBPUiBJTVBMSUVEIFdBUlJBTlRJRVMsIElOQ0xVRElORywgQlVUIE5PVCBMSU1JVEVEIFRPLCBUSEUgSU1QTElFRFxuV0FSUkFOVElFUyBPRiBNRVJDSEFOVEFCSUxJVFkgQU5EIEZJVE5FU1MgRk9SIEEgUEFSVElDVUxBUiBQVVJQT1NFIEFSRSBcbkRJU0NMQUlNRUQuIElOIE5PIEVWRU5UIFNIQUxMIFRIRSBDT1BZUklHSFQgSE9MREVSIE9SIENPTlRSSUJVVE9SUyBCRSBMSUFCTEUgRk9SXG5BTlkgRElSRUNULCBJTkRJUkVDVCwgSU5DSURFTlRBTCwgU1BFQ0lBTCwgRVhFTVBMQVJZLCBPUiBDT05TRVFVRU5USUFMIERBTUFHRVNcbihJTkNMVURJTkcsIEJVVCBOT1QgTElNSVRFRCBUTywgUFJPQ1VSRU1FTlQgT0YgU1VCU1RJVFVURSBHT09EUyBPUiBTRVJWSUNFUztcbkxPU1MgT0YgVVNFLCBEQVRBLCBPUiBQUk9GSVRTOyBPUiBCVVNJTkVTUyBJTlRFUlJVUFRJT04pIEhPV0VWRVIgQ0FVU0VEIEFORCBPTlxuQU5ZIFRIRU9SWSBPRiBMSUFCSUxJVFksIFdIRVRIRVIgSU4gQ09OVFJBQ1QsIFNUUklDVCBMSUFCSUxJVFksIE9SIFRPUlRcbihJTkNMVURJTkcgTkVHTElHRU5DRSBPUiBPVEhFUldJU0UpIEFSSVNJTkcgSU4gQU5ZIFdBWSBPVVQgT0YgVEhFIFVTRSBPRiBUSElTXG5TT0ZUV0FSRSwgRVZFTiBJRiBBRFZJU0VEIE9GIFRIRSBQT1NTSUJJTElUWSBPRiBTVUNIIERBTUFHRS4gKi9cblxuLyoqXG4gKiBAY2xhc3MgUXVhdGVybmlvblxuICogQG5hbWUgcXVhdFxuICovXG5cbnZhciBxdWF0ID0ge307XG5cbnZhciBxdWF0SWRlbnRpdHkgPSBuZXcgRmxvYXQzMkFycmF5KFswLCAwLCAwLCAxXSk7XG5cbi8qKlxuICogQ3JlYXRlcyBhIG5ldyBpZGVudGl0eSBxdWF0XG4gKlxuICogQHJldHVybnMge3F1YXR9IGEgbmV3IHF1YXRlcm5pb25cbiAqL1xucXVhdC5jcmVhdGUgPSBmdW5jdGlvbigpIHtcbiAgICB2YXIgb3V0ID0gbmV3IEdMTUFUX0FSUkFZX1RZUEUoNCk7XG4gICAgb3V0WzBdID0gMDtcbiAgICBvdXRbMV0gPSAwO1xuICAgIG91dFsyXSA9IDA7XG4gICAgb3V0WzNdID0gMTtcbiAgICByZXR1cm4gb3V0O1xufTtcblxuLyoqXG4gKiBDcmVhdGVzIGEgbmV3IHF1YXQgaW5pdGlhbGl6ZWQgd2l0aCB2YWx1ZXMgZnJvbSBhbiBleGlzdGluZyBxdWF0ZXJuaW9uXG4gKlxuICogQHBhcmFtIHtxdWF0fSBhIHF1YXRlcm5pb24gdG8gY2xvbmVcbiAqIEByZXR1cm5zIHtxdWF0fSBhIG5ldyBxdWF0ZXJuaW9uXG4gKiBAZnVuY3Rpb25cbiAqL1xucXVhdC5jbG9uZSA9IHZlYzQuY2xvbmU7XG5cbi8qKlxuICogQ3JlYXRlcyBhIG5ldyBxdWF0IGluaXRpYWxpemVkIHdpdGggdGhlIGdpdmVuIHZhbHVlc1xuICpcbiAqIEBwYXJhbSB7TnVtYmVyfSB4IFggY29tcG9uZW50XG4gKiBAcGFyYW0ge051bWJlcn0geSBZIGNvbXBvbmVudFxuICogQHBhcmFtIHtOdW1iZXJ9IHogWiBjb21wb25lbnRcbiAqIEBwYXJhbSB7TnVtYmVyfSB3IFcgY29tcG9uZW50XG4gKiBAcmV0dXJucyB7cXVhdH0gYSBuZXcgcXVhdGVybmlvblxuICogQGZ1bmN0aW9uXG4gKi9cbnF1YXQuZnJvbVZhbHVlcyA9IHZlYzQuZnJvbVZhbHVlcztcblxuLyoqXG4gKiBDb3B5IHRoZSB2YWx1ZXMgZnJvbSBvbmUgcXVhdCB0byBhbm90aGVyXG4gKlxuICogQHBhcmFtIHtxdWF0fSBvdXQgdGhlIHJlY2VpdmluZyBxdWF0ZXJuaW9uXG4gKiBAcGFyYW0ge3F1YXR9IGEgdGhlIHNvdXJjZSBxdWF0ZXJuaW9uXG4gKiBAcmV0dXJucyB7cXVhdH0gb3V0XG4gKiBAZnVuY3Rpb25cbiAqL1xucXVhdC5jb3B5ID0gdmVjNC5jb3B5O1xuXG4vKipcbiAqIFNldCB0aGUgY29tcG9uZW50cyBvZiBhIHF1YXQgdG8gdGhlIGdpdmVuIHZhbHVlc1xuICpcbiAqIEBwYXJhbSB7cXVhdH0gb3V0IHRoZSByZWNlaXZpbmcgcXVhdGVybmlvblxuICogQHBhcmFtIHtOdW1iZXJ9IHggWCBjb21wb25lbnRcbiAqIEBwYXJhbSB7TnVtYmVyfSB5IFkgY29tcG9uZW50XG4gKiBAcGFyYW0ge051bWJlcn0geiBaIGNvbXBvbmVudFxuICogQHBhcmFtIHtOdW1iZXJ9IHcgVyBjb21wb25lbnRcbiAqIEByZXR1cm5zIHtxdWF0fSBvdXRcbiAqIEBmdW5jdGlvblxuICovXG5xdWF0LnNldCA9IHZlYzQuc2V0O1xuXG4vKipcbiAqIFNldCBhIHF1YXQgdG8gdGhlIGlkZW50aXR5IHF1YXRlcm5pb25cbiAqXG4gKiBAcGFyYW0ge3F1YXR9IG91dCB0aGUgcmVjZWl2aW5nIHF1YXRlcm5pb25cbiAqIEByZXR1cm5zIHtxdWF0fSBvdXRcbiAqL1xucXVhdC5pZGVudGl0eSA9IGZ1bmN0aW9uKG91dCkge1xuICAgIG91dFswXSA9IDA7XG4gICAgb3V0WzFdID0gMDtcbiAgICBvdXRbMl0gPSAwO1xuICAgIG91dFszXSA9IDE7XG4gICAgcmV0dXJuIG91dDtcbn07XG5cbi8qKlxuICogU2V0cyBhIHF1YXQgZnJvbSB0aGUgZ2l2ZW4gYW5nbGUgYW5kIHJvdGF0aW9uIGF4aXMsXG4gKiB0aGVuIHJldHVybnMgaXQuXG4gKlxuICogQHBhcmFtIHtxdWF0fSBvdXQgdGhlIHJlY2VpdmluZyBxdWF0ZXJuaW9uXG4gKiBAcGFyYW0ge3ZlYzN9IGF4aXMgdGhlIGF4aXMgYXJvdW5kIHdoaWNoIHRvIHJvdGF0ZVxuICogQHBhcmFtIHtOdW1iZXJ9IHJhZCB0aGUgYW5nbGUgaW4gcmFkaWFuc1xuICogQHJldHVybnMge3F1YXR9IG91dFxuICoqL1xucXVhdC5zZXRBeGlzQW5nbGUgPSBmdW5jdGlvbihvdXQsIGF4aXMsIHJhZCkge1xuICAgIHJhZCA9IHJhZCAqIDAuNTtcbiAgICB2YXIgcyA9IE1hdGguc2luKHJhZCk7XG4gICAgb3V0WzBdID0gcyAqIGF4aXNbMF07XG4gICAgb3V0WzFdID0gcyAqIGF4aXNbMV07XG4gICAgb3V0WzJdID0gcyAqIGF4aXNbMl07XG4gICAgb3V0WzNdID0gTWF0aC5jb3MocmFkKTtcbiAgICByZXR1cm4gb3V0O1xufTtcblxuLyoqXG4gKiBBZGRzIHR3byBxdWF0J3NcbiAqXG4gKiBAcGFyYW0ge3F1YXR9IG91dCB0aGUgcmVjZWl2aW5nIHF1YXRlcm5pb25cbiAqIEBwYXJhbSB7cXVhdH0gYSB0aGUgZmlyc3Qgb3BlcmFuZFxuICogQHBhcmFtIHtxdWF0fSBiIHRoZSBzZWNvbmQgb3BlcmFuZFxuICogQHJldHVybnMge3F1YXR9IG91dFxuICogQGZ1bmN0aW9uXG4gKi9cbnF1YXQuYWRkID0gdmVjNC5hZGQ7XG5cbi8qKlxuICogTXVsdGlwbGllcyB0d28gcXVhdCdzXG4gKlxuICogQHBhcmFtIHtxdWF0fSBvdXQgdGhlIHJlY2VpdmluZyBxdWF0ZXJuaW9uXG4gKiBAcGFyYW0ge3F1YXR9IGEgdGhlIGZpcnN0IG9wZXJhbmRcbiAqIEBwYXJhbSB7cXVhdH0gYiB0aGUgc2Vjb25kIG9wZXJhbmRcbiAqIEByZXR1cm5zIHtxdWF0fSBvdXRcbiAqL1xucXVhdC5tdWx0aXBseSA9IGZ1bmN0aW9uKG91dCwgYSwgYikge1xuICAgIHZhciBheCA9IGFbMF0sIGF5ID0gYVsxXSwgYXogPSBhWzJdLCBhdyA9IGFbM10sXG4gICAgICAgIGJ4ID0gYlswXSwgYnkgPSBiWzFdLCBieiA9IGJbMl0sIGJ3ID0gYlszXTtcblxuICAgIG91dFswXSA9IGF4ICogYncgKyBhdyAqIGJ4ICsgYXkgKiBieiAtIGF6ICogYnk7XG4gICAgb3V0WzFdID0gYXkgKiBidyArIGF3ICogYnkgKyBheiAqIGJ4IC0gYXggKiBiejtcbiAgICBvdXRbMl0gPSBheiAqIGJ3ICsgYXcgKiBieiArIGF4ICogYnkgLSBheSAqIGJ4O1xuICAgIG91dFszXSA9IGF3ICogYncgLSBheCAqIGJ4IC0gYXkgKiBieSAtIGF6ICogYno7XG4gICAgcmV0dXJuIG91dDtcbn07XG5cbi8qKlxuICogQWxpYXMgZm9yIHtAbGluayBxdWF0Lm11bHRpcGx5fVxuICogQGZ1bmN0aW9uXG4gKi9cbnF1YXQubXVsID0gcXVhdC5tdWx0aXBseTtcblxuLyoqXG4gKiBTY2FsZXMgYSBxdWF0IGJ5IGEgc2NhbGFyIG51bWJlclxuICpcbiAqIEBwYXJhbSB7cXVhdH0gb3V0IHRoZSByZWNlaXZpbmcgdmVjdG9yXG4gKiBAcGFyYW0ge3F1YXR9IGEgdGhlIHZlY3RvciB0byBzY2FsZVxuICogQHBhcmFtIHtOdW1iZXJ9IGIgYW1vdW50IHRvIHNjYWxlIHRoZSB2ZWN0b3IgYnlcbiAqIEByZXR1cm5zIHtxdWF0fSBvdXRcbiAqIEBmdW5jdGlvblxuICovXG5xdWF0LnNjYWxlID0gdmVjNC5zY2FsZTtcblxuLyoqXG4gKiBSb3RhdGVzIGEgcXVhdGVybmlvbiBieSB0aGUgZ2l2ZW4gYW5nbGUgYXJvdW5kIHRoZSBYIGF4aXNcbiAqXG4gKiBAcGFyYW0ge3F1YXR9IG91dCBxdWF0IHJlY2VpdmluZyBvcGVyYXRpb24gcmVzdWx0XG4gKiBAcGFyYW0ge3F1YXR9IGEgcXVhdCB0byByb3RhdGVcbiAqIEBwYXJhbSB7bnVtYmVyfSByYWQgYW5nbGUgKGluIHJhZGlhbnMpIHRvIHJvdGF0ZVxuICogQHJldHVybnMge3F1YXR9IG91dFxuICovXG5xdWF0LnJvdGF0ZVggPSBmdW5jdGlvbiAob3V0LCBhLCByYWQpIHtcbiAgICByYWQgKj0gMC41OyBcblxuICAgIHZhciBheCA9IGFbMF0sIGF5ID0gYVsxXSwgYXogPSBhWzJdLCBhdyA9IGFbM10sXG4gICAgICAgIGJ4ID0gTWF0aC5zaW4ocmFkKSwgYncgPSBNYXRoLmNvcyhyYWQpO1xuXG4gICAgb3V0WzBdID0gYXggKiBidyArIGF3ICogYng7XG4gICAgb3V0WzFdID0gYXkgKiBidyArIGF6ICogYng7XG4gICAgb3V0WzJdID0gYXogKiBidyAtIGF5ICogYng7XG4gICAgb3V0WzNdID0gYXcgKiBidyAtIGF4ICogYng7XG4gICAgcmV0dXJuIG91dDtcbn07XG5cbi8qKlxuICogUm90YXRlcyBhIHF1YXRlcm5pb24gYnkgdGhlIGdpdmVuIGFuZ2xlIGFyb3VuZCB0aGUgWSBheGlzXG4gKlxuICogQHBhcmFtIHtxdWF0fSBvdXQgcXVhdCByZWNlaXZpbmcgb3BlcmF0aW9uIHJlc3VsdFxuICogQHBhcmFtIHtxdWF0fSBhIHF1YXQgdG8gcm90YXRlXG4gKiBAcGFyYW0ge251bWJlcn0gcmFkIGFuZ2xlIChpbiByYWRpYW5zKSB0byByb3RhdGVcbiAqIEByZXR1cm5zIHtxdWF0fSBvdXRcbiAqL1xucXVhdC5yb3RhdGVZID0gZnVuY3Rpb24gKG91dCwgYSwgcmFkKSB7XG4gICAgcmFkICo9IDAuNTsgXG5cbiAgICB2YXIgYXggPSBhWzBdLCBheSA9IGFbMV0sIGF6ID0gYVsyXSwgYXcgPSBhWzNdLFxuICAgICAgICBieSA9IE1hdGguc2luKHJhZCksIGJ3ID0gTWF0aC5jb3MocmFkKTtcblxuICAgIG91dFswXSA9IGF4ICogYncgLSBheiAqIGJ5O1xuICAgIG91dFsxXSA9IGF5ICogYncgKyBhdyAqIGJ5O1xuICAgIG91dFsyXSA9IGF6ICogYncgKyBheCAqIGJ5O1xuICAgIG91dFszXSA9IGF3ICogYncgLSBheSAqIGJ5O1xuICAgIHJldHVybiBvdXQ7XG59O1xuXG4vKipcbiAqIFJvdGF0ZXMgYSBxdWF0ZXJuaW9uIGJ5IHRoZSBnaXZlbiBhbmdsZSBhcm91bmQgdGhlIFogYXhpc1xuICpcbiAqIEBwYXJhbSB7cXVhdH0gb3V0IHF1YXQgcmVjZWl2aW5nIG9wZXJhdGlvbiByZXN1bHRcbiAqIEBwYXJhbSB7cXVhdH0gYSBxdWF0IHRvIHJvdGF0ZVxuICogQHBhcmFtIHtudW1iZXJ9IHJhZCBhbmdsZSAoaW4gcmFkaWFucykgdG8gcm90YXRlXG4gKiBAcmV0dXJucyB7cXVhdH0gb3V0XG4gKi9cbnF1YXQucm90YXRlWiA9IGZ1bmN0aW9uIChvdXQsIGEsIHJhZCkge1xuICAgIHJhZCAqPSAwLjU7IFxuXG4gICAgdmFyIGF4ID0gYVswXSwgYXkgPSBhWzFdLCBheiA9IGFbMl0sIGF3ID0gYVszXSxcbiAgICAgICAgYnogPSBNYXRoLnNpbihyYWQpLCBidyA9IE1hdGguY29zKHJhZCk7XG5cbiAgICBvdXRbMF0gPSBheCAqIGJ3ICsgYXkgKiBiejtcbiAgICBvdXRbMV0gPSBheSAqIGJ3IC0gYXggKiBiejtcbiAgICBvdXRbMl0gPSBheiAqIGJ3ICsgYXcgKiBiejtcbiAgICBvdXRbM10gPSBhdyAqIGJ3IC0gYXogKiBiejtcbiAgICByZXR1cm4gb3V0O1xufTtcblxuLyoqXG4gKiBDYWxjdWxhdGVzIHRoZSBXIGNvbXBvbmVudCBvZiBhIHF1YXQgZnJvbSB0aGUgWCwgWSwgYW5kIFogY29tcG9uZW50cy5cbiAqIEFzc3VtZXMgdGhhdCBxdWF0ZXJuaW9uIGlzIDEgdW5pdCBpbiBsZW5ndGguXG4gKiBBbnkgZXhpc3RpbmcgVyBjb21wb25lbnQgd2lsbCBiZSBpZ25vcmVkLlxuICpcbiAqIEBwYXJhbSB7cXVhdH0gb3V0IHRoZSByZWNlaXZpbmcgcXVhdGVybmlvblxuICogQHBhcmFtIHtxdWF0fSBhIHF1YXQgdG8gY2FsY3VsYXRlIFcgY29tcG9uZW50IG9mXG4gKiBAcmV0dXJucyB7cXVhdH0gb3V0XG4gKi9cbnF1YXQuY2FsY3VsYXRlVyA9IGZ1bmN0aW9uIChvdXQsIGEpIHtcbiAgICB2YXIgeCA9IGFbMF0sIHkgPSBhWzFdLCB6ID0gYVsyXTtcblxuICAgIG91dFswXSA9IHg7XG4gICAgb3V0WzFdID0geTtcbiAgICBvdXRbMl0gPSB6O1xuICAgIG91dFszXSA9IC1NYXRoLnNxcnQoTWF0aC5hYnMoMS4wIC0geCAqIHggLSB5ICogeSAtIHogKiB6KSk7XG4gICAgcmV0dXJuIG91dDtcbn07XG5cbi8qKlxuICogQ2FsY3VsYXRlcyB0aGUgZG90IHByb2R1Y3Qgb2YgdHdvIHF1YXQnc1xuICpcbiAqIEBwYXJhbSB7cXVhdH0gYSB0aGUgZmlyc3Qgb3BlcmFuZFxuICogQHBhcmFtIHtxdWF0fSBiIHRoZSBzZWNvbmQgb3BlcmFuZFxuICogQHJldHVybnMge051bWJlcn0gZG90IHByb2R1Y3Qgb2YgYSBhbmQgYlxuICogQGZ1bmN0aW9uXG4gKi9cbnF1YXQuZG90ID0gdmVjNC5kb3Q7XG5cbi8qKlxuICogUGVyZm9ybXMgYSBsaW5lYXIgaW50ZXJwb2xhdGlvbiBiZXR3ZWVuIHR3byBxdWF0J3NcbiAqXG4gKiBAcGFyYW0ge3F1YXR9IG91dCB0aGUgcmVjZWl2aW5nIHF1YXRlcm5pb25cbiAqIEBwYXJhbSB7cXVhdH0gYSB0aGUgZmlyc3Qgb3BlcmFuZFxuICogQHBhcmFtIHtxdWF0fSBiIHRoZSBzZWNvbmQgb3BlcmFuZFxuICogQHBhcmFtIHtOdW1iZXJ9IHQgaW50ZXJwb2xhdGlvbiBhbW91bnQgYmV0d2VlbiB0aGUgdHdvIGlucHV0c1xuICogQHJldHVybnMge3F1YXR9IG91dFxuICogQGZ1bmN0aW9uXG4gKi9cbnF1YXQubGVycCA9IHZlYzQubGVycDtcblxuLyoqXG4gKiBQZXJmb3JtcyBhIHNwaGVyaWNhbCBsaW5lYXIgaW50ZXJwb2xhdGlvbiBiZXR3ZWVuIHR3byBxdWF0XG4gKlxuICogQHBhcmFtIHtxdWF0fSBvdXQgdGhlIHJlY2VpdmluZyBxdWF0ZXJuaW9uXG4gKiBAcGFyYW0ge3F1YXR9IGEgdGhlIGZpcnN0IG9wZXJhbmRcbiAqIEBwYXJhbSB7cXVhdH0gYiB0aGUgc2Vjb25kIG9wZXJhbmRcbiAqIEBwYXJhbSB7TnVtYmVyfSB0IGludGVycG9sYXRpb24gYW1vdW50IGJldHdlZW4gdGhlIHR3byBpbnB1dHNcbiAqIEByZXR1cm5zIHtxdWF0fSBvdXRcbiAqL1xucXVhdC5zbGVycCA9IGZ1bmN0aW9uIChvdXQsIGEsIGIsIHQpIHtcbiAgICB2YXIgYXggPSBhWzBdLCBheSA9IGFbMV0sIGF6ID0gYVsyXSwgYXcgPSBhWzNdLFxuICAgICAgICBieCA9IGJbMF0sIGJ5ID0gYlsxXSwgYnogPSBiWzJdLCBidyA9IGJbM107XG5cbiAgICB2YXIgY29zSGFsZlRoZXRhID0gYXggKiBieCArIGF5ICogYnkgKyBheiAqIGJ6ICsgYXcgKiBidyxcbiAgICAgICAgaGFsZlRoZXRhLFxuICAgICAgICBzaW5IYWxmVGhldGEsXG4gICAgICAgIHJhdGlvQSxcbiAgICAgICAgcmF0aW9CO1xuXG4gICAgaWYgKE1hdGguYWJzKGNvc0hhbGZUaGV0YSkgPj0gMS4wKSB7XG4gICAgICAgIGlmIChvdXQgIT09IGEpIHtcbiAgICAgICAgICAgIG91dFswXSA9IGF4O1xuICAgICAgICAgICAgb3V0WzFdID0gYXk7XG4gICAgICAgICAgICBvdXRbMl0gPSBhejtcbiAgICAgICAgICAgIG91dFszXSA9IGF3O1xuICAgICAgICB9XG4gICAgICAgIHJldHVybiBvdXQ7XG4gICAgfVxuXG4gICAgaGFsZlRoZXRhID0gTWF0aC5hY29zKGNvc0hhbGZUaGV0YSk7XG4gICAgc2luSGFsZlRoZXRhID0gTWF0aC5zcXJ0KDEuMCAtIGNvc0hhbGZUaGV0YSAqIGNvc0hhbGZUaGV0YSk7XG5cbiAgICBpZiAoTWF0aC5hYnMoc2luSGFsZlRoZXRhKSA8IDAuMDAxKSB7XG4gICAgICAgIG91dFswXSA9IChheCAqIDAuNSArIGJ4ICogMC41KTtcbiAgICAgICAgb3V0WzFdID0gKGF5ICogMC41ICsgYnkgKiAwLjUpO1xuICAgICAgICBvdXRbMl0gPSAoYXogKiAwLjUgKyBieiAqIDAuNSk7XG4gICAgICAgIG91dFszXSA9IChhdyAqIDAuNSArIGJ3ICogMC41KTtcbiAgICAgICAgcmV0dXJuIG91dDtcbiAgICB9XG5cbiAgICByYXRpb0EgPSBNYXRoLnNpbigoMSAtIHQpICogaGFsZlRoZXRhKSAvIHNpbkhhbGZUaGV0YTtcbiAgICByYXRpb0IgPSBNYXRoLnNpbih0ICogaGFsZlRoZXRhKSAvIHNpbkhhbGZUaGV0YTtcblxuICAgIG91dFswXSA9IChheCAqIHJhdGlvQSArIGJ4ICogcmF0aW9CKTtcbiAgICBvdXRbMV0gPSAoYXkgKiByYXRpb0EgKyBieSAqIHJhdGlvQik7XG4gICAgb3V0WzJdID0gKGF6ICogcmF0aW9BICsgYnogKiByYXRpb0IpO1xuICAgIG91dFszXSA9IChhdyAqIHJhdGlvQSArIGJ3ICogcmF0aW9CKTtcblxuICAgIHJldHVybiBvdXQ7XG59O1xuXG4vKipcbiAqIENhbGN1bGF0ZXMgdGhlIGludmVyc2Ugb2YgYSBxdWF0XG4gKlxuICogQHBhcmFtIHtxdWF0fSBvdXQgdGhlIHJlY2VpdmluZyBxdWF0ZXJuaW9uXG4gKiBAcGFyYW0ge3F1YXR9IGEgcXVhdCB0byBjYWxjdWxhdGUgaW52ZXJzZSBvZlxuICogQHJldHVybnMge3F1YXR9IG91dFxuICovXG5xdWF0LmludmVydCA9IGZ1bmN0aW9uKG91dCwgYSkge1xuICAgIHZhciBhMCA9IGFbMF0sIGExID0gYVsxXSwgYTIgPSBhWzJdLCBhMyA9IGFbM10sXG4gICAgICAgIGRvdCA9IGEwKmEwICsgYTEqYTEgKyBhMiphMiArIGEzKmEzLFxuICAgICAgICBpbnZEb3QgPSBkb3QgPyAxLjAvZG90IDogMDtcbiAgICBcbiAgICAvLyBUT0RPOiBXb3VsZCBiZSBmYXN0ZXIgdG8gcmV0dXJuIFswLDAsMCwwXSBpbW1lZGlhdGVseSBpZiBkb3QgPT0gMFxuXG4gICAgb3V0WzBdID0gLWEwKmludkRvdDtcbiAgICBvdXRbMV0gPSAtYTEqaW52RG90O1xuICAgIG91dFsyXSA9IC1hMippbnZEb3Q7XG4gICAgb3V0WzNdID0gYTMqaW52RG90O1xuICAgIHJldHVybiBvdXQ7XG59O1xuXG4vKipcbiAqIENhbGN1bGF0ZXMgdGhlIGNvbmp1Z2F0ZSBvZiBhIHF1YXRcbiAqIElmIHRoZSBxdWF0ZXJuaW9uIGlzIG5vcm1hbGl6ZWQsIHRoaXMgZnVuY3Rpb24gaXMgZmFzdGVyIHRoYW4gcXVhdC5pbnZlcnNlIGFuZCBwcm9kdWNlcyB0aGUgc2FtZSByZXN1bHQuXG4gKlxuICogQHBhcmFtIHtxdWF0fSBvdXQgdGhlIHJlY2VpdmluZyBxdWF0ZXJuaW9uXG4gKiBAcGFyYW0ge3F1YXR9IGEgcXVhdCB0byBjYWxjdWxhdGUgY29uanVnYXRlIG9mXG4gKiBAcmV0dXJucyB7cXVhdH0gb3V0XG4gKi9cbnF1YXQuY29uanVnYXRlID0gZnVuY3Rpb24gKG91dCwgYSkge1xuICAgIG91dFswXSA9IC1hWzBdO1xuICAgIG91dFsxXSA9IC1hWzFdO1xuICAgIG91dFsyXSA9IC1hWzJdO1xuICAgIG91dFszXSA9IGFbM107XG4gICAgcmV0dXJuIG91dDtcbn07XG5cbi8qKlxuICogQ2FsY3VsYXRlcyB0aGUgbGVuZ3RoIG9mIGEgcXVhdFxuICpcbiAqIEBwYXJhbSB7cXVhdH0gYSB2ZWN0b3IgdG8gY2FsY3VsYXRlIGxlbmd0aCBvZlxuICogQHJldHVybnMge051bWJlcn0gbGVuZ3RoIG9mIGFcbiAqIEBmdW5jdGlvblxuICovXG5xdWF0Lmxlbmd0aCA9IHZlYzQubGVuZ3RoO1xuXG4vKipcbiAqIEFsaWFzIGZvciB7QGxpbmsgcXVhdC5sZW5ndGh9XG4gKiBAZnVuY3Rpb25cbiAqL1xucXVhdC5sZW4gPSBxdWF0Lmxlbmd0aDtcblxuLyoqXG4gKiBDYWxjdWxhdGVzIHRoZSBzcXVhcmVkIGxlbmd0aCBvZiBhIHF1YXRcbiAqXG4gKiBAcGFyYW0ge3F1YXR9IGEgdmVjdG9yIHRvIGNhbGN1bGF0ZSBzcXVhcmVkIGxlbmd0aCBvZlxuICogQHJldHVybnMge051bWJlcn0gc3F1YXJlZCBsZW5ndGggb2YgYVxuICogQGZ1bmN0aW9uXG4gKi9cbnF1YXQuc3F1YXJlZExlbmd0aCA9IHZlYzQuc3F1YXJlZExlbmd0aDtcblxuLyoqXG4gKiBBbGlhcyBmb3Ige0BsaW5rIHF1YXQuc3F1YXJlZExlbmd0aH1cbiAqIEBmdW5jdGlvblxuICovXG5xdWF0LnNxckxlbiA9IHF1YXQuc3F1YXJlZExlbmd0aDtcblxuLyoqXG4gKiBOb3JtYWxpemUgYSBxdWF0XG4gKlxuICogQHBhcmFtIHtxdWF0fSBvdXQgdGhlIHJlY2VpdmluZyBxdWF0ZXJuaW9uXG4gKiBAcGFyYW0ge3F1YXR9IGEgcXVhdGVybmlvbiB0byBub3JtYWxpemVcbiAqIEByZXR1cm5zIHtxdWF0fSBvdXRcbiAqIEBmdW5jdGlvblxuICovXG5xdWF0Lm5vcm1hbGl6ZSA9IHZlYzQubm9ybWFsaXplO1xuXG4vKipcbiAqIENyZWF0ZXMgYSBxdWF0ZXJuaW9uIGZyb20gdGhlIGdpdmVuIDN4MyByb3RhdGlvbiBtYXRyaXguXG4gKlxuICogQHBhcmFtIHtxdWF0fSBvdXQgdGhlIHJlY2VpdmluZyBxdWF0ZXJuaW9uXG4gKiBAcGFyYW0ge21hdDN9IG0gcm90YXRpb24gbWF0cml4XG4gKiBAcmV0dXJucyB7cXVhdH0gb3V0XG4gKiBAZnVuY3Rpb25cbiAqL1xucXVhdC5mcm9tTWF0MyA9IChmdW5jdGlvbigpIHtcbiAgICB2YXIgc19pTmV4dCA9IFsxLDIsMF07XG4gICAgcmV0dXJuIGZ1bmN0aW9uKG91dCwgbSkge1xuICAgICAgICAvLyBBbGdvcml0aG0gaW4gS2VuIFNob2VtYWtlJ3MgYXJ0aWNsZSBpbiAxOTg3IFNJR0dSQVBIIGNvdXJzZSBub3Rlc1xuICAgICAgICAvLyBhcnRpY2xlIFwiUXVhdGVybmlvbiBDYWxjdWx1cyBhbmQgRmFzdCBBbmltYXRpb25cIi5cbiAgICAgICAgdmFyIGZUcmFjZSA9IG1bMF0gKyBtWzRdICsgbVs4XTtcbiAgICAgICAgdmFyIGZSb290O1xuXG4gICAgICAgIGlmICggZlRyYWNlID4gMC4wICkge1xuICAgICAgICAgICAgLy8gfHd8ID4gMS8yLCBtYXkgYXMgd2VsbCBjaG9vc2UgdyA+IDEvMlxuICAgICAgICAgICAgZlJvb3QgPSBNYXRoLnNxcnQoZlRyYWNlICsgMS4wKTsgIC8vIDJ3XG4gICAgICAgICAgICBvdXRbM10gPSAwLjUgKiBmUm9vdDtcbiAgICAgICAgICAgIGZSb290ID0gMC41L2ZSb290OyAgLy8gMS8oNHcpXG4gICAgICAgICAgICBvdXRbMF0gPSAobVs3XS1tWzVdKSpmUm9vdDtcbiAgICAgICAgICAgIG91dFsxXSA9IChtWzJdLW1bNl0pKmZSb290O1xuICAgICAgICAgICAgb3V0WzJdID0gKG1bM10tbVsxXSkqZlJvb3Q7XG4gICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICAvLyB8d3wgPD0gMS8yXG4gICAgICAgICAgICB2YXIgaSA9IDA7XG4gICAgICAgICAgICBpZiAoIG1bNF0gPiBtWzBdIClcbiAgICAgICAgICAgICAgaSA9IDE7XG4gICAgICAgICAgICBpZiAoIG1bOF0gPiBtW2kqMytpXSApXG4gICAgICAgICAgICAgIGkgPSAyO1xuICAgICAgICAgICAgdmFyIGogPSBzX2lOZXh0W2ldO1xuICAgICAgICAgICAgdmFyIGsgPSBzX2lOZXh0W2pdO1xuICAgICAgICAgICAgXG4gICAgICAgICAgICBmUm9vdCA9IE1hdGguc3FydChtW2kqMytpXS1tW2oqMytqXS1tW2sqMytrXSArIDEuMCk7XG4gICAgICAgICAgICBvdXRbaV0gPSAwLjUgKiBmUm9vdDtcbiAgICAgICAgICAgIGZSb290ID0gMC41IC8gZlJvb3Q7XG4gICAgICAgICAgICBvdXRbM10gPSAobVtrKjMral0gLSBtW2oqMytrXSkgKiBmUm9vdDtcbiAgICAgICAgICAgIG91dFtqXSA9IChtW2oqMytpXSArIG1baSozK2pdKSAqIGZSb290O1xuICAgICAgICAgICAgb3V0W2tdID0gKG1bayozK2ldICsgbVtpKjMra10pICogZlJvb3Q7XG4gICAgICAgIH1cbiAgICAgICAgXG4gICAgICAgIHJldHVybiBvdXQ7XG4gICAgfTtcbn0pKCk7XG5cbi8qKlxuICogUmV0dXJucyBhIHN0cmluZyByZXByZXNlbnRhdGlvbiBvZiBhIHF1YXRlbmlvblxuICpcbiAqIEBwYXJhbSB7cXVhdH0gdmVjIHZlY3RvciB0byByZXByZXNlbnQgYXMgYSBzdHJpbmdcbiAqIEByZXR1cm5zIHtTdHJpbmd9IHN0cmluZyByZXByZXNlbnRhdGlvbiBvZiB0aGUgdmVjdG9yXG4gKi9cbnF1YXQuc3RyID0gZnVuY3Rpb24gKGEpIHtcbiAgICByZXR1cm4gJ3F1YXQoJyArIGFbMF0gKyAnLCAnICsgYVsxXSArICcsICcgKyBhWzJdICsgJywgJyArIGFbM10gKyAnKSc7XG59O1xuXG5pZih0eXBlb2YoZXhwb3J0cykgIT09ICd1bmRlZmluZWQnKSB7XG4gICAgZXhwb3J0cy5xdWF0ID0gcXVhdDtcbn1cbjtcblxuXG5cblxuXG5cblxuXG5cblxuXG5cblxuICB9KShzaGltLmV4cG9ydHMpO1xufSkoKTtcbiIsIihmdW5jdGlvbigpIHtcbiAgdmFyIHNsaWNlID0gW10uc2xpY2U7XG5cbiAgZnVuY3Rpb24gcXVldWUocGFyYWxsZWxpc20pIHtcbiAgICB2YXIgcSxcbiAgICAgICAgdGFza3MgPSBbXSxcbiAgICAgICAgc3RhcnRlZCA9IDAsIC8vIG51bWJlciBvZiB0YXNrcyB0aGF0IGhhdmUgYmVlbiBzdGFydGVkIChhbmQgcGVyaGFwcyBmaW5pc2hlZClcbiAgICAgICAgYWN0aXZlID0gMCwgLy8gbnVtYmVyIG9mIHRhc2tzIGN1cnJlbnRseSBiZWluZyBleGVjdXRlZCAoc3RhcnRlZCBidXQgbm90IGZpbmlzaGVkKVxuICAgICAgICByZW1haW5pbmcgPSAwLCAvLyBudW1iZXIgb2YgdGFza3Mgbm90IHlldCBmaW5pc2hlZFxuICAgICAgICBwb3BwaW5nLCAvLyBpbnNpZGUgYSBzeW5jaHJvbm91cyB0YXNrIGNhbGxiYWNrP1xuICAgICAgICBlcnJvciA9IG51bGwsXG4gICAgICAgIGF3YWl0ID0gbm9vcCxcbiAgICAgICAgYWxsO1xuXG4gICAgaWYgKCFwYXJhbGxlbGlzbSkgcGFyYWxsZWxpc20gPSBJbmZpbml0eTtcblxuICAgIGZ1bmN0aW9uIHBvcCgpIHtcbiAgICAgIHdoaWxlIChwb3BwaW5nID0gc3RhcnRlZCA8IHRhc2tzLmxlbmd0aCAmJiBhY3RpdmUgPCBwYXJhbGxlbGlzbSkge1xuICAgICAgICB2YXIgaSA9IHN0YXJ0ZWQrKyxcbiAgICAgICAgICAgIHQgPSB0YXNrc1tpXSxcbiAgICAgICAgICAgIGEgPSBzbGljZS5jYWxsKHQsIDEpO1xuICAgICAgICBhLnB1c2goY2FsbGJhY2soaSkpO1xuICAgICAgICArK2FjdGl2ZTtcbiAgICAgICAgdFswXS5hcHBseShudWxsLCBhKTtcbiAgICAgIH1cbiAgICB9XG5cbiAgICBmdW5jdGlvbiBjYWxsYmFjayhpKSB7XG4gICAgICByZXR1cm4gZnVuY3Rpb24oZSwgcikge1xuICAgICAgICAtLWFjdGl2ZTtcbiAgICAgICAgaWYgKGVycm9yICE9IG51bGwpIHJldHVybjtcbiAgICAgICAgaWYgKGUgIT0gbnVsbCkge1xuICAgICAgICAgIGVycm9yID0gZTsgLy8gaWdub3JlIG5ldyB0YXNrcyBhbmQgc3F1ZWxjaCBhY3RpdmUgY2FsbGJhY2tzXG4gICAgICAgICAgc3RhcnRlZCA9IHJlbWFpbmluZyA9IE5hTjsgLy8gc3RvcCBxdWV1ZWQgdGFza3MgZnJvbSBzdGFydGluZ1xuICAgICAgICAgIG5vdGlmeSgpO1xuICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgIHRhc2tzW2ldID0gcjtcbiAgICAgICAgICBpZiAoLS1yZW1haW5pbmcpIHBvcHBpbmcgfHwgcG9wKCk7XG4gICAgICAgICAgZWxzZSBub3RpZnkoKTtcbiAgICAgICAgfVxuICAgICAgfTtcbiAgICB9XG5cbiAgICBmdW5jdGlvbiBub3RpZnkoKSB7XG4gICAgICBpZiAoZXJyb3IgIT0gbnVsbCkgYXdhaXQoZXJyb3IpO1xuICAgICAgZWxzZSBpZiAoYWxsKSBhd2FpdChlcnJvciwgdGFza3MpO1xuICAgICAgZWxzZSBhd2FpdC5hcHBseShudWxsLCBbZXJyb3JdLmNvbmNhdCh0YXNrcykpO1xuICAgIH1cblxuICAgIHJldHVybiBxID0ge1xuICAgICAgZGVmZXI6IGZ1bmN0aW9uKCkge1xuICAgICAgICBpZiAoIWVycm9yKSB7XG4gICAgICAgICAgdGFza3MucHVzaChhcmd1bWVudHMpO1xuICAgICAgICAgICsrcmVtYWluaW5nO1xuICAgICAgICAgIHBvcCgpO1xuICAgICAgICB9XG4gICAgICAgIHJldHVybiBxO1xuICAgICAgfSxcbiAgICAgIGF3YWl0OiBmdW5jdGlvbihmKSB7XG4gICAgICAgIGF3YWl0ID0gZjtcbiAgICAgICAgYWxsID0gZmFsc2U7XG4gICAgICAgIGlmICghcmVtYWluaW5nKSBub3RpZnkoKTtcbiAgICAgICAgcmV0dXJuIHE7XG4gICAgICB9LFxuICAgICAgYXdhaXRBbGw6IGZ1bmN0aW9uKGYpIHtcbiAgICAgICAgYXdhaXQgPSBmO1xuICAgICAgICBhbGwgPSB0cnVlO1xuICAgICAgICBpZiAoIXJlbWFpbmluZykgbm90aWZ5KCk7XG4gICAgICAgIHJldHVybiBxO1xuICAgICAgfVxuICAgIH07XG4gIH1cblxuICBmdW5jdGlvbiBub29wKCkge31cblxuICBxdWV1ZS52ZXJzaW9uID0gXCIxLjAuN1wiO1xuICBpZiAodHlwZW9mIGRlZmluZSA9PT0gXCJmdW5jdGlvblwiICYmIGRlZmluZS5hbWQpIGRlZmluZShmdW5jdGlvbigpIHsgcmV0dXJuIHF1ZXVlOyB9KTtcbiAgZWxzZSBpZiAodHlwZW9mIG1vZHVsZSA9PT0gXCJvYmplY3RcIiAmJiBtb2R1bGUuZXhwb3J0cykgbW9kdWxlLmV4cG9ydHMgPSBxdWV1ZTtcbiAgZWxzZSB0aGlzLnF1ZXVlID0gcXVldWU7XG59KSgpO1xuIiwiaW1wb3J0IHtHZW99IGZyb20gJy4vZ2VvJztcbmltcG9ydCBHTFByb2dyYW0gZnJvbSAnLi9nbC9nbF9wcm9ncmFtJztcblxuaW1wb3J0IHttYXQ0LCB2ZWMzfSBmcm9tICdnbC1tYXRyaXgnO1xuXG4vLyBOb3RlOiBXZSB3YW50IHNvbWV0aGluZyBtb3JlIGxpa2UgYW4gaW50ZXJmYWNlIGhlcmUuIFN1Y2ggYSB0aGluIGJhc2UgY2xhc3MgbWF5IG5vdCBiZSB3b3J0aCBpdCwgYnV0IGRvZXMgcHJvdmlkZSBzb21lIG5vdGF0aW9uYWwgY2xhcml0eSBhbnl3YXkuXG5leHBvcnQgZGVmYXVsdCBjbGFzcyBDYW1lcmEge1xuXG4gICAgY29uc3RydWN0b3Ioc2NlbmUpIHtcbiAgICAgICAgdGhpcy5zY2VuZSA9IHNjZW5lO1xuICAgIH1cblxuICAgIC8vIENyZWF0ZSBhIGNhbWVyYSBieSB0eXBlIG5hbWUsIGZhY3Rvcnktc3R5bGVcbiAgICBzdGF0aWMgY3JlYXRlKHNjZW5lLCBjb25maWcpIHtcbiAgICAgICAgc3dpdGNoIChjb25maWcudHlwZSkge1xuICAgICAgICAgICAgY2FzZSAnaXNvbWV0cmljJzpcbiAgICAgICAgICAgICAgICByZXR1cm4gbmV3IElzb21ldHJpY0NhbWVyYShzY2VuZSwgY29uZmlnKTtcbiAgICAgICAgICAgIGNhc2UgJ3BlcnNwZWN0aXZlJzpcbiAgICAgICAgICAgICAgICByZXR1cm4gbmV3IFBlcnNwZWN0aXZlQ2FtZXJhKHNjZW5lLCBjb25maWcpO1xuICAgICAgICAgICAgY2FzZSAnZmxhdCc6XG4gICAgICAgICAgICBkZWZhdWx0OlxuICAgICAgICAgICAgICAgIHJldHVybiBuZXcgRmxhdENhbWVyYShzY2VuZSwgY29uZmlnKTtcbiAgICAgICAgfVxuICAgIH1cblxuICAgIC8vIFVwZGF0ZSBtZXRob2QgY2FsbGVkIG9uY2UgcGVyIGZyYW1lXG4gICAgdXBkYXRlKCkge1xuICAgIH1cblxuICAgIC8vIENhbGxlZCBvbmNlIHBlciBmcmFtZSBwZXIgcHJvZ3JhbSAoZS5nLiBmb3IgbWFpbiByZW5kZXIgcGFzcywgdGhlbiBmb3IgZWFjIGFkZGl0aW9uYWwgcGFzcyBmb3IgZmVhdHVyZSBzZWxlY3Rpb24sIGV0Yy4pXG4gICAgc2V0dXBQcm9ncmFtKGdsX3Byb2dyYW0pIHtcbiAgICB9XG5cbn1cblxuZXhwb3J0IGNsYXNzIFBlcnNwZWN0aXZlQ2FtZXJhIGV4dGVuZHMgQ2FtZXJhIHtcblxuICAgIGNvbnN0cnVjdG9yKHNjZW5lLCBvcHRpb25zID0ge30pIHtcbiAgICAgICAgc3VwZXIoc2NlbmUpO1xuICAgICAgICB0aGlzLmZvY2FsX2xlbmd0aCA9IDIuNTtcbiAgICAgICAgdGhpcy5wZXJzcGVjdGl2ZV9tYXQgPSBtYXQ0LmNyZWF0ZSgpO1xuXG4gICAgICAgIEdMUHJvZ3JhbS5yZW1vdmVUcmFuc2Zvcm0oJ2NhbWVyYScpO1xuICAgICAgICBHTFByb2dyYW0uYWRkVHJhbnNmb3JtKFxuICAgICAgICAgICAgJ2NhbWVyYScsXG5cbiAgICAgICAgICAgICd1bmlmb3JtIG1hdDQgdV9wZXJzcGVjdGl2ZTsnLFxuXG4gICAgICAgICAgICAndm9pZCBjYW1lcmFQcm9qZWN0aW9uIChpbm91dCB2ZWM0IHBvc2l0aW9uKSB7IFxcblxcXG4gICAgICAgICAgICAgICAgcG9zaXRpb24gPSB1X3BlcnNwZWN0aXZlICogcG9zaXRpb247IFxcblxcXG4gICAgICAgICAgICB9J1xuICAgICAgICApO1xuICAgIH1cblxuICAgIHVwZGF0ZSgpIHtcbiAgICAgICAgLy8gSGVpZ2h0IG9mIHRoZSB2aWV3cG9ydCBpbiBtZXRlcnMgYXQgY3VycmVudCB6b29tXG4gICAgICAgIHZhciBtZXRlcl96b29tX3kgPSB0aGlzLnNjZW5lLmNzc19zaXplLmhlaWdodCAqIEdlby5tZXRlcnNQZXJQaXhlbCh0aGlzLnNjZW5lLnpvb20pO1xuXG4gICAgICAgIC8vIERpc3RhbmNlIHRoYXQgY2FtZXJhIHNob3VsZCBiZSBmcm9tIGdyb3VuZCBzdWNoIHRoYXQgaXQgZml0cyB0aGUgZmllbGQgb2YgdmlldyBleHBlY3RlZFxuICAgICAgICAvLyBmb3IgYSBjb252ZW50aW9uYWwgd2ViIG1lcmNhdG9yIG1hcCBhdCB0aGUgY3VycmVudCB6b29tIGxldmVsIGFuZCBjYW1lcmEgZm9jYWwgbGVuZ3RoXG4gICAgICAgIHZhciBjYW1lcmFfaGVpZ2h0ID0gbWV0ZXJfem9vbV95IC8gMiAqIHRoaXMuZm9jYWxfbGVuZ3RoO1xuXG4gICAgICAgIC8vIFBlcnNwZWN0aXZlIG1hdHJpeCBwYXJhbXNcbiAgICAgICAgLy8gQWRqdXNtZW50IG9mIGZvY2FsIGxlbmd0aCAoYXJjdGFuZ2VudCkgaXMgYmVjYXVzZSBwZXJzcGVjdGl2ZSBtYXRyaXggYnVpbGRlciBleHBlY3RzIGZpZWxkLW9mLXZpZXcgaW4gcmFkaWFucywgYnV0IHdlIGFyZVxuICAgICAgICAvLyBwYXNzaW5nIHRoZSBmaW5hbCB2YWx1ZSBleHBlY3RlZCB0byBiZSBpbiB0aGUgcGVyc3BlY3RpdmUgbWF0cml4LCBzbyB3ZSBuZWVkIHRvIHJldmVyc2UtY2FsY3VsYXRlIHRoZSBvcmlnaW5hbCBGT1YgaGVyZS5cbiAgICAgICAgdmFyIGZvdiA9IE1hdGguYXRhbigxIC8gdGhpcy5mb2NhbF9sZW5ndGgpICogMjtcbiAgICAgICAgdmFyIGFzcGVjdCA9IHRoaXMuc2NlbmUudmlld19hc3BlY3Q7XG4gICAgICAgIHZhciB6bmVhciA9IDE7ICAgICAgICAgICAgICAgICAgICAgICAgICAgLy8gemVybyBjbGlwcGluZyBwbGFuZSBjYXVzZSBhcnRpZmFjdHMsIGxvb2tzIGxpa2UgeiBwcmVjaXNpb24gaXNzdWVzIChUT0RPOiB3aHk/KVxuICAgICAgICB2YXIgemZhciA9IChjYW1lcmFfaGVpZ2h0ICsgem5lYXIpICogNTsgIC8vIHB1dCBnZW9tZXRyeSBpbiBuZWFyIDIwJSBvZiBjbGlwcGluZyBwbGFuZSwgdG8gdGFrZSBhZHZhbnRhZ2Ugb2YgaGlnaGVyLXByZWNpc2lvbiBkZXB0aCByYW5nZSAoVE9ETzogY2FsY3VsYXRlIHRoZSBkZXB0aCBuZWVkZWQgdG8gcGxhY2UgZ2VvbWV0cnkgYXQgej0wIGluIG5vcm1hbGl6ZWQgZGV2aWNlIGNvb3Jkcz8pXG5cbiAgICAgICAgbWF0NC5wZXJzcGVjdGl2ZSh0aGlzLnBlcnNwZWN0aXZlX21hdCwgZm92LCBhc3BlY3QsIHpuZWFyLCB6ZmFyKTtcblxuICAgICAgICAvLyBUcmFuc2xhdGUgZ2VvbWV0cnkgaW50byB0aGUgZGlzdGFuY2Ugc28gdGhhdCBjYW1lcmEgaXMgYXBwcm9wcmlhdGUgbGV2ZWwgYWJvdmUgZ3JvdW5kXG4gICAgICAgIG1hdDQudHJhbnNsYXRlKHRoaXMucGVyc3BlY3RpdmVfbWF0LCB0aGlzLnBlcnNwZWN0aXZlX21hdCwgdmVjMy5mcm9tVmFsdWVzKDAsIDAsIC1jYW1lcmFfaGVpZ2h0KSk7XG4gICAgfVxuXG4gICAgc2V0dXBQcm9ncmFtKGdsX3Byb2dyYW0pIHtcbiAgICAgICAgZ2xfcHJvZ3JhbS51bmlmb3JtKCdNYXRyaXg0ZnYnLCAndV9wZXJzcGVjdGl2ZScsIGZhbHNlLCB0aGlzLnBlcnNwZWN0aXZlX21hdCk7XG4gICAgfVxuXG59XG5cbi8vIElzb21ldHJpYy1zdHlsZSBwcm9qZWN0aW9uXG5leHBvcnQgY2xhc3MgSXNvbWV0cmljQ2FtZXJhIGV4dGVuZHMgQ2FtZXJhIHtcblxuICAgIGNvbnN0cnVjdG9yKHNjZW5lLCBvcHRpb25zID0ge30pIHtcbiAgICAgICAgc3VwZXIoc2NlbmUpO1xuICAgICAgICB0aGlzLm1ldGVyX3ZpZXdfbWF0ID0gbWF0NC5jcmVhdGUoKTtcblxuICAgICAgICBHTFByb2dyYW0ucmVtb3ZlVHJhbnNmb3JtKCdjYW1lcmEnKTtcbiAgICAgICAgR0xQcm9ncmFtLmFkZFRyYW5zZm9ybShcbiAgICAgICAgICAgICdjYW1lcmEnLFxuXG4gICAgICAgICAgICAndW5pZm9ybSBtYXQ0IHVfbWV0ZXJfdmlldzsnLFxuXG4gICAgICAgICAgICAndmVjMiBpc29tZXRyaWNfYXhpcyA9IHZlYzIoMC4sIDEuKTsnLFxuICAgICAgICAgICAgJ2Zsb2F0IGlzb21ldHJpY19zY2FsZSA9IDEuOycsXG5cbiAgICAgICAgICAgICd2b2lkIGNhbWVyYVByb2plY3Rpb24gKGlub3V0IHZlYzQgcG9zaXRpb24pIHsgXFxuXFxcbiAgICAgICAgICAgICAgICBwb3NpdGlvbiA9IHVfbWV0ZXJfdmlldyAqIHBvc2l0aW9uOyBcXG5cXFxuICAgICAgICAgICAgICAgIHBvc2l0aW9uLnh5ICs9IHBvc2l0aW9uLnogKiBpc29tZXRyaWNfYXhpcyAqIGlzb21ldHJpY19zY2FsZSAvIDEuOyBcXG5cXFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgXFxuXFxcbiAgICAgICAgICAgICAgICAvLyBSZXZlcnNlIHogZm9yIGRlcHRoIGJ1ZmZlciBzbyB1cCBpcyBuZWdhdGl2ZSwgXFxuXFxcbiAgICAgICAgICAgICAgICAvLyBhbmQgc2NhbGUgZG93biB2YWx1ZXMgc28gb2JqZWN0cyBoaWdoZXIgdGhhbiBvbmUgc2NyZWVuIGhlaWdodCB3aWxsIG5vdCBnZXQgY2xpcHBlZCBcXG5cXFxuICAgICAgICAgICAgICAgIHBvc2l0aW9uLnogPSAtcG9zaXRpb24ueiAvIDEwMC4gKyAxLjsgXFxuXFxcbiAgICAgICAgICAgIH0nXG4gICAgICAgICk7XG4gICAgfVxuXG4gICAgdXBkYXRlKCkge1xuICAgICAgICAvLyBDb252ZXJ0IG1lcmNhdG9yIG1ldGVycyB0byBzY3JlZW4gc3BhY2VcbiAgICAgICAgbWF0NC5pZGVudGl0eSh0aGlzLm1ldGVyX3ZpZXdfbWF0KTtcbiAgICAgICAgbWF0NC5zY2FsZSh0aGlzLm1ldGVyX3ZpZXdfbWF0LCB0aGlzLm1ldGVyX3ZpZXdfbWF0LCB2ZWMzLmZyb21WYWx1ZXMoMSAvIHRoaXMuc2NlbmUubWV0ZXJfem9vbS54LCAxIC8gdGhpcy5zY2VuZS5tZXRlcl96b29tLnksIDEgLyB0aGlzLnNjZW5lLm1ldGVyX3pvb20ueSkpO1xuICAgIH1cblxuICAgIHNldHVwUHJvZ3JhbShnbF9wcm9ncmFtKSB7XG4gICAgICAgIGdsX3Byb2dyYW0udW5pZm9ybSgnTWF0cml4NGZ2JywgJ3VfbWV0ZXJfdmlldycsIGZhbHNlLCB0aGlzLm1ldGVyX3ZpZXdfbWF0KTtcbiAgICB9XG5cbn1cblxuLy8gRmxhdCBwcm9qZWN0aW9uIChlLmcuIGp1c3QgdG9wLWRvd24sIG5vIHBlcnNwZWN0aXZlKVxuZXhwb3J0IGNsYXNzIEZsYXRDYW1lcmEgZXh0ZW5kcyBDYW1lcmEge1xuXG4gICAgY29uc3RydWN0b3Ioc2NlbmUsIG9wdGlvbnMgPSB7fSkge1xuICAgICAgICBzdXBlcihzY2VuZSk7XG4gICAgICAgIHRoaXMubWV0ZXJfdmlld19tYXQgPSBtYXQ0LmNyZWF0ZSgpO1xuXG4gICAgICAgIEdMUHJvZ3JhbS5yZW1vdmVUcmFuc2Zvcm0oJ2NhbWVyYScpO1xuICAgICAgICBHTFByb2dyYW0uYWRkVHJhbnNmb3JtKFxuICAgICAgICAgICAgJ2NhbWVyYScsXG5cbiAgICAgICAgICAgICd1bmlmb3JtIG1hdDQgdV9tZXRlcl92aWV3OycsXG5cbiAgICAgICAgICAgICd2b2lkIGNhbWVyYVByb2plY3Rpb24gKGlub3V0IHZlYzQgcG9zaXRpb24pIHsgXFxuXFxcbiAgICAgICAgICAgICAgICBwb3NpdGlvbiA9IHVfbWV0ZXJfdmlldyAqIHBvc2l0aW9uOyBcXG5cXFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIFxcblxcXG4gICAgICAgICAgICAgICAgLy8gUmV2ZXJzZSB6IGZvciBkZXB0aCBidWZmZXIgc28gdXAgaXMgbmVnYXRpdmUsIFxcblxcXG4gICAgICAgICAgICAgICAgLy8gYW5kIHNjYWxlIGRvd24gdmFsdWVzIHNvIG9iamVjdHMgaGlnaGVyIHRoYW4gb25lIHNjcmVlbiBoZWlnaHQgd2lsbCBub3QgZ2V0IGNsaXBwZWQgXFxuXFxcbiAgICAgICAgICAgICAgICBwb3NpdGlvbi56ID0gLXBvc2l0aW9uLnogLyAxMDAuICsgMS47IFxcblxcXG4gICAgICAgICAgICB9J1xuICAgICAgICApO1xuICAgIH1cblxuICAgIHVwZGF0ZSgpIHtcbiAgICAgICAgLy8gQ29udmVydCBtZXJjYXRvciBtZXRlcnMgdG8gc2NyZWVuIHNwYWNlXG4gICAgICAgIG1hdDQuaWRlbnRpdHkodGhpcy5tZXRlcl92aWV3X21hdCk7XG4gICAgICAgIG1hdDQuc2NhbGUodGhpcy5tZXRlcl92aWV3X21hdCwgdGhpcy5tZXRlcl92aWV3X21hdCwgdmVjMy5mcm9tVmFsdWVzKDEgLyB0aGlzLnNjZW5lLm1ldGVyX3pvb20ueCwgMSAvIHRoaXMuc2NlbmUubWV0ZXJfem9vbS55LCAxIC8gdGhpcy5zY2VuZS5tZXRlcl96b29tLnkpKTtcbiAgICB9XG5cbiAgICBzZXR1cFByb2dyYW0oZ2xfcHJvZ3JhbSkge1xuICAgICAgICBnbF9wcm9ncmFtLnVuaWZvcm0oJ01hdHJpeDRmdicsICd1X21ldGVyX3ZpZXcnLCBmYWxzZSwgdGhpcy5tZXRlcl92aWV3X21hdCk7XG4gICAgfVxuXG59XG4iLCIvLyBNaXNjZWxsYW5lb3VzIGdlbyBmdW5jdGlvbnNcbmltcG9ydCBQb2ludCBmcm9tICcuL3BvaW50JztcblxuZXhwb3J0IHZhciBHZW8gPSB7fTtcblxuLy8gUHJvamVjdGlvbiBjb25zdGFudHNcbkdlby50aWxlX3NpemUgPSAyNTY7XG5HZW8uaGFsZl9jaXJjdW1mZXJlbmNlX21ldGVycyA9IDIwMDM3NTA4LjM0Mjc4OTI0NDtcbkdlby5tYXBfb3JpZ2luX21ldGVycyA9IFBvaW50KC1HZW8uaGFsZl9jaXJjdW1mZXJlbmNlX21ldGVycywgR2VvLmhhbGZfY2lyY3VtZmVyZW5jZV9tZXRlcnMpO1xuR2VvLm1pbl96b29tX21ldGVyc19wZXJfcGl4ZWwgPSBHZW8uaGFsZl9jaXJjdW1mZXJlbmNlX21ldGVycyAqIDIgLyBHZW8udGlsZV9zaXplOyAvLyBtaW4gem9vbSBkcmF3cyB3b3JsZCBhcyAyIHRpbGVzIHdpZGVcbkdlby5tZXRlcnNfcGVyX3BpeGVsID0gW107XG5HZW8ubWF4X3pvb20gPSAyMDtcbmZvciAodmFyIHo9MDsgeiA8PSBHZW8ubWF4X3pvb207IHorKykge1xuICAgIEdlby5tZXRlcnNfcGVyX3BpeGVsW3pdID0gR2VvLm1pbl96b29tX21ldGVyc19wZXJfcGl4ZWwgLyBNYXRoLnBvdygyLCB6KTtcbn1cblxuR2VvLm1ldGVyc1BlclBpeGVsID0gZnVuY3Rpb24gKHpvb20pIHtcbiAgICByZXR1cm4gR2VvLm1pbl96b29tX21ldGVyc19wZXJfcGl4ZWwgLyBNYXRoLnBvdygyLCB6b29tKTtcbn1cblxuLy8gQ29udmVyc2lvbiBmdW5jdGlvbnMgYmFzZWQgb24gYW4gZGVmaW5lZCB0aWxlIHNjYWxlXG5HZW8udW5pdHNfcGVyX21ldGVyID0gW107XG5HZW8uc2V0VGlsZVNjYWxlID0gZnVuY3Rpb24oc2NhbGUpXG57XG4gICAgR2VvLnRpbGVfc2NhbGUgPSBzY2FsZTtcbiAgICBHZW8udW5pdHNfcGVyX3BpeGVsID0gR2VvLnRpbGVfc2NhbGUgLyBHZW8udGlsZV9zaXplO1xuXG4gICAgZm9yICh2YXIgej0wOyB6IDw9IEdlby5tYXhfem9vbTsgeisrKSB7XG4gICAgICAgIEdlby51bml0c19wZXJfbWV0ZXJbel0gPSBHZW8udGlsZV9zY2FsZSAvIChHZW8udGlsZV9zaXplICogR2VvLm1ldGVyc19wZXJfcGl4ZWxbel0pO1xuICAgIH1cbn07XG5cbi8vIENvbnZlcnQgdGlsZSBsb2NhdGlvbiB0byBtZXJjYXRvciBtZXRlcnMgLSBtdWx0aXBseSBieSBwaXhlbHMgcGVyIHRpbGUsIHRoZW4gYnkgbWV0ZXJzIHBlciBwaXhlbCwgYWRqdXN0IGZvciBtYXAgb3JpZ2luXG5HZW8ubWV0ZXJzRm9yVGlsZSA9IGZ1bmN0aW9uICh0aWxlKVxue1xuICAgIHJldHVybiBQb2ludChcbiAgICAgICAgKHRpbGUueCAqIEdlby50aWxlX3NpemUgKiBHZW8ubWV0ZXJzX3Blcl9waXhlbFt0aWxlLnpdKSArIEdlby5tYXBfb3JpZ2luX21ldGVycy54LFxuICAgICAgICAoKHRpbGUueSAqIEdlby50aWxlX3NpemUgKiBHZW8ubWV0ZXJzX3Blcl9waXhlbFt0aWxlLnpdKSAqIC0xKSArIEdlby5tYXBfb3JpZ2luX21ldGVycy55XG4gICAgKTtcbn07XG5cbi8vIENvbnZlcnQgbWVyY2F0b3IgbWV0ZXJzIHRvIGxhdC1sbmdcbkdlby5tZXRlcnNUb0xhdExuZyA9IGZ1bmN0aW9uIChtZXRlcnMpXG57XG4gICAgdmFyIGMgPSBQb2ludC5jb3B5KG1ldGVycyk7XG5cbiAgICBjLnggLz0gR2VvLmhhbGZfY2lyY3VtZmVyZW5jZV9tZXRlcnM7XG4gICAgYy55IC89IEdlby5oYWxmX2NpcmN1bWZlcmVuY2VfbWV0ZXJzO1xuXG4gICAgYy55ID0gKDIgKiBNYXRoLmF0YW4oTWF0aC5leHAoYy55ICogTWF0aC5QSSkpIC0gKE1hdGguUEkgLyAyKSkgLyBNYXRoLlBJO1xuXG4gICAgYy54ICo9IDE4MDtcbiAgICBjLnkgKj0gMTgwO1xuXG4gICAgcmV0dXJuIGM7XG59O1xuXG4vLyBDb252ZXJ0IGxhdC1sbmcgdG8gbWVyY2F0b3IgbWV0ZXJzXG5HZW8ubGF0TG5nVG9NZXRlcnMgPSBmdW5jdGlvbihsYXRsbmcpXG57XG4gICAgdmFyIGMgPSBQb2ludC5jb3B5KGxhdGxuZyk7XG5cbiAgICAvLyBMYXRpdHVkZVxuICAgIGMueSA9IE1hdGgubG9nKE1hdGgudGFuKChjLnkgKyA5MCkgKiBNYXRoLlBJIC8gMzYwKSkgLyAoTWF0aC5QSSAvIDE4MCk7XG4gICAgYy55ID0gYy55ICogR2VvLmhhbGZfY2lyY3VtZmVyZW5jZV9tZXRlcnMgLyAxODA7XG5cbiAgICAvLyBMb25naXR1ZGVcbiAgICBjLnggPSBjLnggKiBHZW8uaGFsZl9jaXJjdW1mZXJlbmNlX21ldGVycyAvIDE4MDtcblxuICAgIHJldHVybiBjO1xufTtcblxuLy8gUnVuIGEgdHJhbnNmb3JtIGZ1bmN0aW9uIG9uIGVhY2ggY29vb3JkaW5hdGUgaW4gYSBHZW9KU09OIGdlb21ldHJ5XG5HZW8udHJhbnNmb3JtR2VvbWV0cnkgPSBmdW5jdGlvbiAoZ2VvbWV0cnksIHRyYW5zZm9ybSlcbntcbiAgICBpZiAoZ2VvbWV0cnkudHlwZSA9PSAnUG9pbnQnKSB7XG4gICAgICAgIHJldHVybiB0cmFuc2Zvcm0oZ2VvbWV0cnkuY29vcmRpbmF0ZXMpO1xuICAgIH1cbiAgICBlbHNlIGlmIChnZW9tZXRyeS50eXBlID09ICdMaW5lU3RyaW5nJyB8fCBnZW9tZXRyeS50eXBlID09ICdNdWx0aVBvaW50Jykge1xuICAgICAgICByZXR1cm4gZ2VvbWV0cnkuY29vcmRpbmF0ZXMubWFwKHRyYW5zZm9ybSk7XG4gICAgfVxuICAgIGVsc2UgaWYgKGdlb21ldHJ5LnR5cGUgPT0gJ1BvbHlnb24nIHx8IGdlb21ldHJ5LnR5cGUgPT0gJ011bHRpTGluZVN0cmluZycpIHtcbiAgICAgICAgcmV0dXJuIGdlb21ldHJ5LmNvb3JkaW5hdGVzLm1hcChmdW5jdGlvbiAoY29vcmRpbmF0ZXMpIHtcbiAgICAgICAgICAgIHJldHVybiBjb29yZGluYXRlcy5tYXAodHJhbnNmb3JtKTtcbiAgICAgICAgfSk7XG4gICAgfVxuICAgIGVsc2UgaWYgKGdlb21ldHJ5LnR5cGUgPT0gJ011bHRpUG9seWdvbicpIHtcbiAgICAgICAgcmV0dXJuIGdlb21ldHJ5LmNvb3JkaW5hdGVzLm1hcChmdW5jdGlvbiAocG9seWdvbikge1xuICAgICAgICAgICAgcmV0dXJuIHBvbHlnb24ubWFwKGZ1bmN0aW9uIChjb29yZGluYXRlcykge1xuICAgICAgICAgICAgICAgIHJldHVybiBjb29yZGluYXRlcy5tYXAodHJhbnNmb3JtKTtcbiAgICAgICAgICAgIH0pO1xuICAgICAgICB9KTtcbiAgICB9XG4gICAgLy8gVE9ETzogc3VwcG9ydCBHZW9tZXRyeUNvbGxlY3Rpb25cbiAgICByZXR1cm4ge307XG59O1xuXG5HZW8uYm94SW50ZXJzZWN0ID0gZnVuY3Rpb24gKGIxLCBiMilcbntcbiAgICByZXR1cm4gIShcbiAgICAgICAgYjIuc3cueCA+IGIxLm5lLnggfHxcbiAgICAgICAgYjIubmUueCA8IGIxLnN3LnggfHxcbiAgICAgICAgYjIuc3cueSA+IGIxLm5lLnkgfHxcbiAgICAgICAgYjIubmUueSA8IGIxLnN3LnlcbiAgICApO1xufTtcblxuLy8gU3BsaXQgdGhlIGxpbmVzIG9mIGEgZmVhdHVyZSB3aGVyZXZlciB0d28gcG9pbnRzIGFyZSBmYXJ0aGVyIGFwYXJ0IHRoYW4gYSBnaXZlbiB0b2xlcmFuY2Vcbkdlby5zcGxpdEZlYXR1cmVMaW5lcyAgPSBmdW5jdGlvbiAoZmVhdHVyZSwgdG9sZXJhbmNlKSB7XG4gICAgdmFyIHRvbGVyYW5jZSA9IHRvbGVyYW5jZSB8fCAwLjAwMTtcbiAgICB2YXIgdG9sZXJhbmNlX3NxID0gdG9sZXJhbmNlICogdG9sZXJhbmNlO1xuICAgIHZhciBnZW9tID0gZmVhdHVyZS5nZW9tZXRyeTtcbiAgICB2YXIgbGluZXM7XG5cbiAgICBpZiAoZ2VvbS50eXBlID09ICdNdWx0aUxpbmVTdHJpbmcnKSB7XG4gICAgICAgIGxpbmVzID0gZ2VvbS5jb29yZGluYXRlcztcbiAgICB9XG4gICAgZWxzZSBpZiAoZ2VvbS50eXBlID09J0xpbmVTdHJpbmcnKSB7XG4gICAgICAgIGxpbmVzID0gW2dlb20uY29vcmRpbmF0ZXNdO1xuICAgIH1cbiAgICBlbHNlIHtcbiAgICAgICAgcmV0dXJuIGZlYXR1cmU7XG4gICAgfVxuXG4gICAgdmFyIHNwbGl0X2xpbmVzID0gW107XG5cbiAgICBmb3IgKHZhciBzPTA7IHMgPCBsaW5lcy5sZW5ndGg7IHMrKykge1xuICAgICAgICB2YXIgc2VnID0gbGluZXNbc107XG4gICAgICAgIHZhciBzcGxpdF9zZWcgPSBbXTtcbiAgICAgICAgdmFyIGxhc3RfY29vcmQgPSBudWxsO1xuICAgICAgICB2YXIga2VlcDtcblxuICAgICAgICBmb3IgKHZhciBjPTA7IGMgPCBzZWcubGVuZ3RoOyBjKyspIHtcbiAgICAgICAgICAgIHZhciBjb29yZCA9IHNlZ1tjXTtcbiAgICAgICAgICAgIGtlZXAgPSB0cnVlO1xuXG4gICAgICAgICAgICBpZiAobGFzdF9jb29yZCAhPSBudWxsKSB7XG4gICAgICAgICAgICAgICAgdmFyIGRpc3QgPSAoY29vcmRbMF0gLSBsYXN0X2Nvb3JkWzBdKSAqIChjb29yZFswXSAtIGxhc3RfY29vcmRbMF0pICsgKGNvb3JkWzFdIC0gbGFzdF9jb29yZFsxXSkgKiAoY29vcmRbMV0gLSBsYXN0X2Nvb3JkWzFdKTtcbiAgICAgICAgICAgICAgICBpZiAoZGlzdCA+IHRvbGVyYW5jZV9zcSkge1xuICAgICAgICAgICAgICAgICAgICAvLyBjb25zb2xlLmxvZyhcInNwbGl0IGxpbmVzIGF0IChcIiArIGNvb3JkWzBdICsgXCIsIFwiICsgY29vcmRbMV0gKyBcIiksIFwiICsgTWF0aC5zcXJ0KGRpc3QpICsgXCIgYXBhcnRcIik7XG4gICAgICAgICAgICAgICAgICAgIGtlZXAgPSBmYWxzZTtcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICB9XG5cbiAgICAgICAgICAgIGlmIChrZWVwID09IGZhbHNlKSB7XG4gICAgICAgICAgICAgICAgc3BsaXRfbGluZXMucHVzaChzcGxpdF9zZWcpO1xuICAgICAgICAgICAgICAgIHNwbGl0X3NlZyA9IFtdO1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgc3BsaXRfc2VnLnB1c2goY29vcmQpO1xuXG4gICAgICAgICAgICBsYXN0X2Nvb3JkID0gY29vcmQ7XG4gICAgICAgIH1cblxuICAgICAgICBzcGxpdF9saW5lcy5wdXNoKHNwbGl0X3NlZyk7XG4gICAgICAgIHNwbGl0X3NlZyA9IFtdO1xuICAgIH1cblxuICAgIGlmIChzcGxpdF9saW5lcy5sZW5ndGggPT0gMSkge1xuICAgICAgICBnZW9tLnR5cGUgPSAnTGluZVN0cmluZyc7XG4gICAgICAgIGdlb20uY29vcmRpbmF0ZXMgPSBzcGxpdF9saW5lc1swXTtcbiAgICB9XG4gICAgZWxzZSB7XG4gICAgICAgIGdlb20udHlwZSA9ICdNdWx0aUxpbmVTdHJpbmcnO1xuICAgICAgICBnZW9tLmNvb3JkaW5hdGVzID0gc3BsaXRfbGluZXM7XG4gICAgfVxuXG4gICAgcmV0dXJuIGZlYXR1cmU7XG59O1xuIiwiLy8gV2ViR0wgbWFuYWdlbWVudCBhbmQgcmVuZGVyaW5nIGZ1bmN0aW9uc1xuXG5leHBvcnQgdmFyIEdMID0ge307XG5cbi8vIFNldHVwIGEgV2ViR0wgY29udGV4dFxuLy8gSWYgbm8gY2FudmFzIGVsZW1lbnQgaXMgcHJvdmlkZWQsIG9uZSBpcyBjcmVhdGVkIGFuZCBhZGRlZCB0byB0aGUgZG9jdW1lbnQgYm9keVxuR0wuZ2V0Q29udGV4dCA9IGZ1bmN0aW9uIGdldENvbnRleHQgKGNhbnZhcylcbntcblxuICAgIHZhciBmdWxsc2NyZWVuID0gZmFsc2U7XG4gICAgaWYgKGNhbnZhcyA9PSBudWxsKSB7XG4gICAgICAgIGNhbnZhcyA9IGRvY3VtZW50LmNyZWF0ZUVsZW1lbnQoJ2NhbnZhcycpO1xuICAgICAgICBjYW52YXMuc3R5bGUucG9zaXRpb24gPSAnYWJzb2x1dGUnO1xuICAgICAgICBjYW52YXMuc3R5bGUudG9wID0gMDtcbiAgICAgICAgY2FudmFzLnN0eWxlLmxlZnQgPSAwO1xuICAgICAgICBjYW52YXMuc3R5bGUuekluZGV4ID0gLTE7XG4gICAgICAgIGRvY3VtZW50LmJvZHkuYXBwZW5kQ2hpbGQoY2FudmFzKTtcbiAgICAgICAgZnVsbHNjcmVlbiA9IHRydWU7XG4gICAgfVxuXG4gICAgdmFyIGdsID0gY2FudmFzLmdldENvbnRleHQoJ2V4cGVyaW1lbnRhbC13ZWJnbCcpO1xuICAgIGlmICghZ2wpIHtcbiAgICAgICAgYWxlcnQoXCJDb3VsZG4ndCBjcmVhdGUgV2ViR0wgY29udGV4dC4gWW91ciBicm93c2VyIHByb2JhYmx5IGRvZXNuJ3Qgc3VwcG9ydCBXZWJHTCBvciBpdCdzIHR1cm5lZCBvZmY/XCIpO1xuICAgICAgICB0aHJvdyBcIkNvdWxkbid0IGNyZWF0ZSBXZWJHTCBjb250ZXh0XCI7XG4gICAgfVxuXG4gICAgR0wucmVzaXplQ2FudmFzKGdsLCB3aW5kb3cuaW5uZXJXaWR0aCwgd2luZG93LmlubmVySGVpZ2h0KTtcbiAgICBpZiAoZnVsbHNjcmVlbiA9PSB0cnVlKSB7XG4gICAgICAgIHdpbmRvdy5hZGRFdmVudExpc3RlbmVyKCdyZXNpemUnLCBmdW5jdGlvbiAoKSB7XG4gICAgICAgICAgICBHTC5yZXNpemVDYW52YXMoZ2wsIHdpbmRvdy5pbm5lcldpZHRoLCB3aW5kb3cuaW5uZXJIZWlnaHQpO1xuICAgICAgICB9KTtcbiAgICB9XG5cbiAgICAvLyBHTFZlcnRleEFycmF5T2JqZWN0LmluaXQoZ2wpOyAvLyBUT0RPOiB0aGlzIHBhdHRlcm4gZG9lc24ndCBzdXBwb3J0IG11bHRpcGxlIGFjdGl2ZSBHTCBjb250ZXh0cywgc2hvdWxkIHRoYXQgZXZlbiBiZSBzdXBwb3J0ZWQ/XG5cbiAgICByZXR1cm4gZ2w7XG59O1xuXG5HTC5yZXNpemVDYW52YXMgPSBmdW5jdGlvbiAoZ2wsIHdpZHRoLCBoZWlnaHQpXG57XG4gICAgdmFyIGRldmljZV9waXhlbF9yYXRpbyA9IHdpbmRvdy5kZXZpY2VQaXhlbFJhdGlvIHx8IDE7XG4gICAgZ2wuY2FudmFzLnN0eWxlLndpZHRoID0gd2lkdGggKyAncHgnO1xuICAgIGdsLmNhbnZhcy5zdHlsZS5oZWlnaHQgPSBoZWlnaHQgKyAncHgnO1xuICAgIGdsLmNhbnZhcy53aWR0aCA9IE1hdGgucm91bmQoZ2wuY2FudmFzLnN0eWxlLndpZHRoICogZGV2aWNlX3BpeGVsX3JhdGlvKTtcbiAgICBnbC5jYW52YXMuaGVpZ2h0ID0gTWF0aC5yb3VuZChnbC5jYW52YXMuc3R5bGUud2lkdGggKiBkZXZpY2VfcGl4ZWxfcmF0aW8pO1xuICAgIGdsLnZpZXdwb3J0KDAsIDAsIGdsLmNhbnZhcy53aWR0aCwgZ2wuY2FudmFzLmhlaWdodCk7XG59O1xuXG4vLyBDb21waWxlICYgbGluayBhIFdlYkdMIHByb2dyYW0gZnJvbSBwcm92aWRlZCB2ZXJ0ZXggYW5kIGZyYWdtZW50IHNoYWRlciBzb3VyY2VzXG4vLyB1cGRhdGUgYSBwcm9ncmFtIGlmIG9uZSBpcyBwYXNzZWQgaW4uIENyZWF0ZSBvbmUgaWYgbm90LiBBbGVydCBhbmQgZG9uJ3QgdXBkYXRlIGFueXRoaW5nIGlmIHRoZSBzaGFkZXJzIGRvbid0IGNvbXBpbGUuXG5HTC51cGRhdGVQcm9ncmFtID0gZnVuY3Rpb24gR0x1cGRhdGVQcm9ncmFtIChnbCwgcHJvZ3JhbSwgdmVydGV4X3NoYWRlcl9zb3VyY2UsIGZyYWdtZW50X3NoYWRlcl9zb3VyY2UpXG57XG4gICAgdHJ5IHtcbiAgICAgICAgdmFyIHZlcnRleF9zaGFkZXIgPSBHTC5jcmVhdGVTaGFkZXIoZ2wsIHZlcnRleF9zaGFkZXJfc291cmNlLCBnbC5WRVJURVhfU0hBREVSKTtcbiAgICAgICAgdmFyIGZyYWdtZW50X3NoYWRlciA9IEdMLmNyZWF0ZVNoYWRlcihnbCwgJyNpZmRlZiBHTF9FU1xcbnByZWNpc2lvbiBoaWdocCBmbG9hdDtcXG4jZW5kaWZcXG5cXG4nICsgZnJhZ21lbnRfc2hhZGVyX3NvdXJjZSwgZ2wuRlJBR01FTlRfU0hBREVSKTtcbiAgICB9XG4gICAgY2F0Y2goZXJyKSB7XG4gICAgICAgIC8vIGFsZXJ0KGVycik7XG4gICAgICAgIGNvbnNvbGUubG9nKGVycik7XG4gICAgICAgIHJldHVybiBwcm9ncmFtO1xuICAgIH1cblxuICAgIGdsLnVzZVByb2dyYW0obnVsbCk7XG4gICAgaWYgKHByb2dyYW0gIT0gbnVsbCkge1xuICAgICAgICB2YXIgb2xkX3NoYWRlcnMgPSBnbC5nZXRBdHRhY2hlZFNoYWRlcnMocHJvZ3JhbSk7XG4gICAgICAgIGZvcih2YXIgaSA9IDA7IGkgPCBvbGRfc2hhZGVycy5sZW5ndGg7IGkrKykge1xuICAgICAgICAgICAgZ2wuZGV0YWNoU2hhZGVyKHByb2dyYW0sIG9sZF9zaGFkZXJzW2ldKTtcbiAgICAgICAgfVxuICAgIH0gZWxzZSB7XG4gICAgICAgIHByb2dyYW0gPSBnbC5jcmVhdGVQcm9ncmFtKCk7XG4gICAgfVxuXG4gICAgaWYgKHZlcnRleF9zaGFkZXIgPT0gbnVsbCB8fCBmcmFnbWVudF9zaGFkZXIgPT0gbnVsbCkge1xuICAgICAgICByZXR1cm4gcHJvZ3JhbTtcbiAgICB9XG5cbiAgICBnbC5hdHRhY2hTaGFkZXIocHJvZ3JhbSwgdmVydGV4X3NoYWRlcik7XG4gICAgZ2wuYXR0YWNoU2hhZGVyKHByb2dyYW0sIGZyYWdtZW50X3NoYWRlcik7XG5cbiAgICBnbC5kZWxldGVTaGFkZXIodmVydGV4X3NoYWRlcik7XG4gICAgZ2wuZGVsZXRlU2hhZGVyKGZyYWdtZW50X3NoYWRlcik7XG5cbiAgICBnbC5saW5rUHJvZ3JhbShwcm9ncmFtKTtcblxuICAgIGlmICghZ2wuZ2V0UHJvZ3JhbVBhcmFtZXRlcihwcm9ncmFtLCBnbC5MSU5LX1NUQVRVUykpIHtcbiAgICAgICAgdmFyIHByb2dyYW1fZXJyb3IgPVxuICAgICAgICAgICAgXCJXZWJHTCBwcm9ncmFtIGVycm9yOlxcblwiICtcbiAgICAgICAgICAgIFwiVkFMSURBVEVfU1RBVFVTOiBcIiArIGdsLmdldFByb2dyYW1QYXJhbWV0ZXIocHJvZ3JhbSwgZ2wuVkFMSURBVEVfU1RBVFVTKSArIFwiXFxuXCIgK1xuICAgICAgICAgICAgXCJFUlJPUjogXCIgKyBnbC5nZXRFcnJvcigpICsgXCJcXG5cXG5cIiArXG4gICAgICAgICAgICBcIi0tLSBWZXJ0ZXggU2hhZGVyIC0tLVxcblwiICsgdmVydGV4X3NoYWRlcl9zb3VyY2UgKyBcIlxcblxcblwiICtcbiAgICAgICAgICAgIFwiLS0tIEZyYWdtZW50IFNoYWRlciAtLS1cXG5cIiArIGZyYWdtZW50X3NoYWRlcl9zb3VyY2U7XG4gICAgICAgIGNvbnNvbGUubG9nKHByb2dyYW1fZXJyb3IpO1xuICAgICAgICB0aHJvdyBwcm9ncmFtX2Vycm9yO1xuICAgIH1cblxuICAgIHJldHVybiBwcm9ncmFtO1xufTtcblxuLy8gQ29tcGlsZSBhIHZlcnRleCBvciBmcmFnbWVudCBzaGFkZXIgZnJvbSBwcm92aWRlZCBzb3VyY2VcbkdMLmNyZWF0ZVNoYWRlciA9IGZ1bmN0aW9uIEdMY3JlYXRlU2hhZGVyIChnbCwgc291cmNlLCB0eXBlKVxue1xuICAgIHZhciBzaGFkZXIgPSBnbC5jcmVhdGVTaGFkZXIodHlwZSk7XG5cbiAgICBnbC5zaGFkZXJTb3VyY2Uoc2hhZGVyLCBzb3VyY2UpO1xuICAgIGdsLmNvbXBpbGVTaGFkZXIoc2hhZGVyKTtcblxuICAgIGlmICghZ2wuZ2V0U2hhZGVyUGFyYW1ldGVyKHNoYWRlciwgZ2wuQ09NUElMRV9TVEFUVVMpKSB7XG4gICAgICAgIHZhciBzaGFkZXJfZXJyb3IgPVxuICAgICAgICAgICAgXCJXZWJHTCBzaGFkZXIgZXJyb3I6XFxuXCIgK1xuICAgICAgICAgICAgKHR5cGUgPT0gZ2wuVkVSVEVYX1NIQURFUiA/IFwiVkVSVEVYXCIgOiBcIkZSQUdNRU5UXCIpICsgXCIgU0hBREVSOlxcblwiICtcbiAgICAgICAgICAgIGdsLmdldFNoYWRlckluZm9Mb2coc2hhZGVyKTtcbiAgICAgICAgdGhyb3cgc2hhZGVyX2Vycm9yO1xuICAgIH1cblxuICAgIHJldHVybiBzaGFkZXI7XG59O1xuXG4vLyBUcmlhbmd1bGF0aW9uIHVzaW5nIGxpYnRlc3MuanMgcG9ydCBvZiBnbHVUZXNzZWxhdG9yXG4vLyBodHRwczovL2dpdGh1Yi5jb20vYnJlbmRhbmtlbm55L2xpYnRlc3MuanNcbnRyeSB7XG4gICAgR0wudGVzc2VsYXRvciA9IChmdW5jdGlvbiBpbml0VGVzc2VsYXRvcigpIHtcbiAgICAgICAgdmFyIHRlc3NlbGF0b3IgPSBuZXcgbGlidGVzcy5HbHVUZXNzZWxhdG9yKCk7XG5cbiAgICAgICAgLy8gQ2FsbGVkIGZvciBlYWNoIHZlcnRleCBvZiB0ZXNzZWxhdG9yIG91dHB1dFxuICAgICAgICBmdW5jdGlvbiB2ZXJ0ZXhDYWxsYmFjayhkYXRhLCBwb2x5VmVydEFycmF5KSB7XG4gICAgICAgICAgICBpZiAodGVzc2VsYXRvci56ICE9IG51bGwpIHtcbiAgICAgICAgICAgICAgICBwb2x5VmVydEFycmF5LnB1c2goW2RhdGFbMF0sIGRhdGFbMV0sIHRlc3NlbGF0b3Iuel0pO1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgZWxzZSB7XG4gICAgICAgICAgICAgICAgcG9seVZlcnRBcnJheS5wdXNoKFtkYXRhWzBdLCBkYXRhWzFdXSk7XG4gICAgICAgICAgICB9XG4gICAgICAgIH1cblxuICAgICAgICAvLyBDYWxsZWQgd2hlbiBzZWdtZW50cyBpbnRlcnNlY3QgYW5kIG11c3QgYmUgc3BsaXRcbiAgICAgICAgZnVuY3Rpb24gY29tYmluZUNhbGxiYWNrKGNvb3JkcywgZGF0YSwgd2VpZ2h0KSB7XG4gICAgICAgICAgICByZXR1cm4gY29vcmRzO1xuICAgICAgICB9XG5cbiAgICAgICAgLy8gQ2FsbGVkIHdoZW4gYSB2ZXJ0ZXggc3RhcnRzIG9yIHN0b3BzIGEgYm91bmRhcnkgZWRnZSBvZiBhIHBvbHlnb25cbiAgICAgICAgZnVuY3Rpb24gZWRnZUNhbGxiYWNrKGZsYWcpIHtcbiAgICAgICAgICAgIC8vIE5vLW9wIGNhbGxiYWNrIHRvIGZvcmNlIHNpbXBsZSB0cmlhbmdsZSBwcmltaXRpdmVzIChubyB0cmlhbmdsZSBzdHJpcHMgb3IgZmFucykuXG4gICAgICAgICAgICAvLyBTZWU6IGh0dHA6Ly93d3cuZ2xwcm9ncmFtbWluZy5jb20vcmVkL2NoYXB0ZXIxMS5odG1sXG4gICAgICAgICAgICAvLyBcIlNpbmNlIGVkZ2UgZmxhZ3MgbWFrZSBubyBzZW5zZSBpbiBhIHRyaWFuZ2xlIGZhbiBvciB0cmlhbmdsZSBzdHJpcCwgaWYgdGhlcmUgaXMgYSBjYWxsYmFja1xuICAgICAgICAgICAgLy8gYXNzb2NpYXRlZCB3aXRoIEdMVV9URVNTX0VER0VfRkxBRyB0aGF0IGVuYWJsZXMgZWRnZSBmbGFncywgdGhlIEdMVV9URVNTX0JFR0lOIGNhbGxiYWNrIGlzXG4gICAgICAgICAgICAvLyBjYWxsZWQgb25seSB3aXRoIEdMX1RSSUFOR0xFUy5cIlxuICAgICAgICAgICAgLy8gY29uc29sZS5sb2coJ0dMLnRlc3NlbGF0b3I6IGVkZ2UgZmxhZzogJyArIGZsYWcpO1xuICAgICAgICB9XG5cbiAgICAgICAgdGVzc2VsYXRvci5nbHVUZXNzQ2FsbGJhY2sobGlidGVzcy5nbHVFbnVtLkdMVV9URVNTX1ZFUlRFWF9EQVRBLCB2ZXJ0ZXhDYWxsYmFjayk7XG4gICAgICAgIHRlc3NlbGF0b3IuZ2x1VGVzc0NhbGxiYWNrKGxpYnRlc3MuZ2x1RW51bS5HTFVfVEVTU19DT01CSU5FLCBjb21iaW5lQ2FsbGJhY2spO1xuICAgICAgICB0ZXNzZWxhdG9yLmdsdVRlc3NDYWxsYmFjayhsaWJ0ZXNzLmdsdUVudW0uR0xVX1RFU1NfRURHRV9GTEFHLCBlZGdlQ2FsbGJhY2spO1xuXG4gICAgICAgIC8vIEJyZW5kYW4gS2Vubnk6XG4gICAgICAgIC8vIGxpYnRlc3Mgd2lsbCB0YWtlIDNkIHZlcnRzIGFuZCBmbGF0dGVuIHRvIGEgcGxhbmUgZm9yIHRlc3NlbGF0aW9uXG4gICAgICAgIC8vIHNpbmNlIG9ubHkgZG9pbmcgMmQgdGVzc2VsYXRpb24gaGVyZSwgcHJvdmlkZSB6PTEgbm9ybWFsIHRvIHNraXBcbiAgICAgICAgLy8gaXRlcmF0aW5nIG92ZXIgdmVydHMgb25seSB0byBnZXQgdGhlIHNhbWUgYW5zd2VyLlxuICAgICAgICAvLyBjb21tZW50IG91dCB0byB0ZXN0IG5vcm1hbC1nZW5lcmF0aW9uIGNvZGVcbiAgICAgICAgdGVzc2VsYXRvci5nbHVUZXNzTm9ybWFsKDAsIDAsIDEpO1xuXG4gICAgICAgIHJldHVybiB0ZXNzZWxhdG9yO1xuICAgIH0pKCk7XG5cbiAgICBHTC50cmlhbmd1bGF0ZVBvbHlnb24gPSBmdW5jdGlvbiBHTFRyaWFuZ3VsYXRlIChjb250b3VycywgeilcbiAgICB7XG4gICAgICAgIHZhciB0cmlhbmdsZVZlcnRzID0gW107XG4gICAgICAgIEdMLnRlc3NlbGF0b3IueiA9IHo7XG4gICAgICAgIEdMLnRlc3NlbGF0b3IuZ2x1VGVzc0JlZ2luUG9seWdvbih0cmlhbmdsZVZlcnRzKTtcblxuICAgICAgICBmb3IgKHZhciBpID0gMDsgaSA8IGNvbnRvdXJzLmxlbmd0aDsgaSsrKSB7XG4gICAgICAgICAgICBHTC50ZXNzZWxhdG9yLmdsdVRlc3NCZWdpbkNvbnRvdXIoKTtcbiAgICAgICAgICAgIHZhciBjb250b3VyID0gY29udG91cnNbaV07XG4gICAgICAgICAgICBmb3IgKHZhciBqID0gMDsgaiA8IGNvbnRvdXIubGVuZ3RoOyBqICsrKSB7XG4gICAgICAgICAgICAgICAgdmFyIGNvb3JkcyA9IFtjb250b3VyW2pdWzBdLCBjb250b3VyW2pdWzFdLCAwXTtcbiAgICAgICAgICAgICAgICBHTC50ZXNzZWxhdG9yLmdsdVRlc3NWZXJ0ZXgoY29vcmRzLCBjb29yZHMpO1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgR0wudGVzc2VsYXRvci5nbHVUZXNzRW5kQ29udG91cigpO1xuICAgICAgICB9XG5cbiAgICAgICAgR0wudGVzc2VsYXRvci5nbHVUZXNzRW5kUG9seWdvbigpO1xuICAgICAgICByZXR1cm4gdHJpYW5nbGVWZXJ0cztcbiAgICB9O1xufVxuY2F0Y2ggKGUpIHtcbiAgICAvLyBjb25zb2xlLmxvZyhcImxpYnRlc3Mgbm90IGRlZmluZWQhXCIpO1xuICAgIC8vIHNraXAgaWYgbGlidGVzcyBub3QgZGVmaW5lZFxufVxuXG4vLyBBZGQgdmVydGljZXMgdG8gYW4gYXJyYXkgKGRlc3RpbmVkIHRvIGJlIHVzZWQgYXMgYSBHTCBidWZmZXIpLCAnc3RyaXBpbmcnIGVhY2ggdmVydGV4IHdpdGggY29uc3RhbnQgZGF0YVxuLy8gUGVyLXZlcnRleCBhdHRyaWJ1dGVzIG11c3QgYmUgcHJlLXBhY2tlZCBpbnRvIHRoZSB2ZXJ0aWNlcyBhcnJheVxuLy8gVXNlZCBmb3IgYWRkaW5nIHZhbHVlcyB0aGF0IGFyZSBvZnRlbiBjb25zdGFudCBwZXIgZ2VvbWV0cnkgb3IgcG9seWdvbiwgbGlrZSBjb2xvcnMsIG5vcm1hbHMgKGZvciBwb2x5cyBzaXR0aW5nIGZsYXQgb24gbWFwKSwgbGF5ZXIgYW5kIG1hdGVyaWFsIGluZm8sIGV0Yy5cbkdMLmFkZFZlcnRpY2VzID0gZnVuY3Rpb24gKHZlcnRpY2VzLCB2ZXJ0ZXhfY29uc3RhbnRzLCB2ZXJ0ZXhfZGF0YSlcbntcbiAgICBpZiAodmVydGljZXMgPT0gbnVsbCkge1xuICAgICAgICByZXR1cm4gdmVydGV4X2RhdGE7XG4gICAgfVxuICAgIHZlcnRleF9jb25zdGFudHMgPSB2ZXJ0ZXhfY29uc3RhbnRzIHx8IFtdO1xuXG4gICAgZm9yICh2YXIgdj0wLCB2bGVuID0gdmVydGljZXMubGVuZ3RoOyB2IDwgdmxlbjsgdisrKSB7XG4gICAgICAgIHZlcnRleF9kYXRhLnB1c2guYXBwbHkodmVydGV4X2RhdGEsIHZlcnRpY2VzW3ZdKTtcbiAgICAgICAgdmVydGV4X2RhdGEucHVzaC5hcHBseSh2ZXJ0ZXhfZGF0YSwgdmVydGV4X2NvbnN0YW50cyk7XG4gICAgfVxuXG4gICAgcmV0dXJuIHZlcnRleF9kYXRhO1xufTtcblxuLy8gQWRkIHZlcnRpY2VzIHRvIGFuIGFycmF5LCAnc3RyaXBpbmcnIGVhY2ggdmVydGV4IHdpdGggY29uc3RhbnQgZGF0YVxuLy8gTXVsdGlwbGUsIHVuLXBhY2tlZCBhdHRyaWJ1dGUgYXJyYXlzIGNhbiBiZSBwcm92aWRlZFxuR0wuYWRkVmVydGljZXNNdWx0aXBsZUF0dHJpYnV0ZXMgPSBmdW5jdGlvbiAoZHluYW1pY3MsIGNvbnN0YW50cywgdmVydGV4X2RhdGEpXG57XG4gICAgdmFyIGRsZW4gPSBkeW5hbWljcy5sZW5ndGg7XG4gICAgdmFyIHZsZW4gPSBkeW5hbWljc1swXS5sZW5ndGg7XG4gICAgY29uc3RhbnRzID0gY29uc3RhbnRzIHx8IFtdO1xuXG4gICAgZm9yICh2YXIgdj0wOyB2IDwgdmxlbjsgdisrKSB7XG4gICAgICAgIGZvciAodmFyIGQ9MDsgZCA8IGRsZW47IGQrKykge1xuICAgICAgICAgICAgdmVydGV4X2RhdGEucHVzaC5hcHBseSh2ZXJ0ZXhfZGF0YSwgZHluYW1pY3NbZF1bdl0pO1xuICAgICAgICB9XG4gICAgICAgIHZlcnRleF9kYXRhLnB1c2guYXBwbHkodmVydGV4X2RhdGEsIGNvbnN0YW50cyk7XG4gICAgfVxuXG4gICAgcmV0dXJuIHZlcnRleF9kYXRhO1xufTtcblxuLy8gQWRkIHZlcnRpY2VzIHRvIGFuIGFycmF5LCB3aXRoIGEgdmFyaWFibGUgbGF5b3V0IChib3RoIHBlci12ZXJ0ZXggZHluYW1pYyBhbmQgY29uc3RhbnQgYXR0cmlicylcbi8vIEdMLmFkZFZlcnRpY2VzQnlBdHRyaWJ1dGVMYXlvdXQgPSBmdW5jdGlvbiAoYXR0cmlicywgdmVydGV4X2RhdGEpXG4vLyB7XG4vLyAgICAgdmFyIG1heF9sZW5ndGggPSAwO1xuLy8gICAgIGZvciAodmFyIGE9MDsgYSA8IGF0dHJpYnMubGVuZ3RoOyBhKyspIHtcbi8vICAgICAgICAgLy8gY29uc29sZS5sb2coYXR0cmlic1thXS5uYW1lKTtcbi8vICAgICAgICAgLy8gY29uc29sZS5sb2coXCJhIFwiICsgdHlwZW9mIGF0dHJpYnNbYV0uZGF0YSk7XG4vLyAgICAgICAgIGlmICh0eXBlb2YgYXR0cmlic1thXS5kYXRhID09ICdvYmplY3QnKSB7XG4vLyAgICAgICAgICAgICAvLyBjb25zb2xlLmxvZyhcImFbMF0gXCIgKyB0eXBlb2YgYXR0cmlic1thXS5kYXRhWzBdKTtcbi8vICAgICAgICAgICAgIC8vIFBlci12ZXJ0ZXggbGlzdCAtIGFycmF5IG9mIGFycmF5XG4vLyAgICAgICAgICAgICBpZiAodHlwZW9mIGF0dHJpYnNbYV0uZGF0YVswXSA9PSAnb2JqZWN0Jykge1xuLy8gICAgICAgICAgICAgICAgIGF0dHJpYnNbYV0uY3Vyc29yID0gMDtcbi8vICAgICAgICAgICAgICAgICBpZiAoYXR0cmlic1thXS5kYXRhLmxlbmd0aCA+IG1heF9sZW5ndGgpIHtcbi8vICAgICAgICAgICAgICAgICAgICAgbWF4X2xlbmd0aCA9IGF0dHJpYnNbYV0uZGF0YS5sZW5ndGg7XG4vLyAgICAgICAgICAgICAgICAgfVxuLy8gICAgICAgICAgICAgfVxuLy8gICAgICAgICAgICAgLy8gU3RhdGljIGFycmF5IGZvciBhbGwgdmVydGljZXNcbi8vICAgICAgICAgICAgIGVsc2Uge1xuLy8gICAgICAgICAgICAgICAgIGF0dHJpYnNbYV0ubmV4dF92ZXJ0ZXggPSBhdHRyaWJzW2FdLmRhdGE7XG4vLyAgICAgICAgICAgICB9XG4vLyAgICAgICAgIH1cbi8vICAgICAgICAgZWxzZSB7XG4vLyAgICAgICAgICAgICAvLyBTdGF0aWMgc2luZ2xlIHZhbHVlIGZvciBhbGwgdmVydGljZXMsIGNvbnZlcnQgdG8gYXJyYXlcbi8vICAgICAgICAgICAgIGF0dHJpYnNbYV0ubmV4dF92ZXJ0ZXggPSBbYXR0cmlic1thXS5kYXRhXTtcbi8vICAgICAgICAgfVxuLy8gICAgIH1cblxuLy8gICAgIGZvciAodmFyIHY9MDsgdiA8IG1heF9sZW5ndGg7IHYrKykge1xuLy8gICAgICAgICBmb3IgKHZhciBhPTA7IGEgPCBhdHRyaWJzLmxlbmd0aDsgYSsrKSB7XG4vLyAgICAgICAgICAgICBpZiAoYXR0cmlic1thXS5jdXJzb3IgIT0gbnVsbCkge1xuLy8gICAgICAgICAgICAgICAgIC8vIE5leHQgdmFsdWUgaW4gbGlzdFxuLy8gICAgICAgICAgICAgICAgIGF0dHJpYnNbYV0ubmV4dF92ZXJ0ZXggPSBhdHRyaWJzW2FdLmRhdGFbYXR0cmlic1thXS5jdXJzb3JdO1xuXG4vLyAgICAgICAgICAgICAgICAgLy8gVE9ETzogcmVwZWF0cyBpZiBvbmUgbGlzdCBpcyBzaG9ydGVyIHRoYW4gb3RoZXJzIC0gZGVzaXJlZCBiZWhhdmlvciwgb3IgZW5mb3JjZSBzYW1lIGxlbmd0aD9cbi8vICAgICAgICAgICAgICAgICBpZiAoYXR0cmlic1thXS5jdXJzb3IgPCBhdHRyaWJzW2FdLmRhdGEubGVuZ3RoKSB7XG4vLyAgICAgICAgICAgICAgICAgICAgIGF0dHJpYnNbYV0uY3Vyc29yKys7XG4vLyAgICAgICAgICAgICAgICAgfVxuLy8gICAgICAgICAgICAgfVxuLy8gICAgICAgICAgICAgdmVydGV4X2RhdGEucHVzaC5hcHBseSh2ZXJ0ZXhfZGF0YSwgYXR0cmlic1thXS5uZXh0X3ZlcnRleCk7XG4vLyAgICAgICAgIH1cbi8vICAgICB9XG4vLyAgICAgcmV0dXJuIHZlcnRleF9kYXRhO1xuLy8gfTtcbiIsImltcG9ydCBQb2ludCBmcm9tICcuLi9wb2ludCc7XG5pbXBvcnQge1ZlY3Rvcn0gZnJvbSAnLi4vdmVjdG9yJztcbmltcG9ydCB7R0x9IGZyb20gJy4vZ2wnO1xuXG5leHBvcnQgdmFyIEdMQnVpbGRlcnMgPSB7fTtcblxuR0xCdWlsZGVycy5kZWJ1ZyA9IGZhbHNlO1xuXG4vLyBUZXNzZWxhdGUgYSBmbGF0IDJEIHBvbHlnb24gd2l0aCBmaXhlZCBoZWlnaHQgYW5kIGFkZCB0byBHTCB2ZXJ0ZXggYnVmZmVyXG5HTEJ1aWxkZXJzLmJ1aWxkUG9seWdvbnMgPSBmdW5jdGlvbiBHTEJ1aWxkZXJzQnVpbGRQb2x5Z29ucyAocG9seWdvbnMsIHosIHZlcnRleF9kYXRhLCBvcHRpb25zKVxue1xuICAgIG9wdGlvbnMgPSBvcHRpb25zIHx8IHt9O1xuXG4gICAgdmFyIHZlcnRleF9jb25zdGFudHMgPSBbXTtcbiAgICBpZiAoeiAhPSBudWxsKSB7XG4gICAgICAgIHZlcnRleF9jb25zdGFudHMucHVzaCh6KTsgLy8gcHJvdmlkZWQgelxuICAgIH1cbiAgICBpZiAob3B0aW9ucy5ub3JtYWxzKSB7XG4gICAgICAgIHZlcnRleF9jb25zdGFudHMucHVzaCgwLCAwLCAxKTsgLy8gdXB3YXJkcy1mYWNpbmcgbm9ybWFsXG4gICAgfVxuICAgIGlmIChvcHRpb25zLnZlcnRleF9jb25zdGFudHMpIHtcbiAgICAgICAgdmVydGV4X2NvbnN0YW50cy5wdXNoLmFwcGx5KHZlcnRleF9jb25zdGFudHMsIG9wdGlvbnMudmVydGV4X2NvbnN0YW50cyk7XG4gICAgfVxuICAgIGlmICh2ZXJ0ZXhfY29uc3RhbnRzLmxlbmd0aCA9PSAwKSB7XG4gICAgICAgIHZlcnRleF9jb25zdGFudHMgPSBudWxsO1xuICAgIH1cblxuICAgIHZhciBudW1fcG9seWdvbnMgPSBwb2x5Z29ucy5sZW5ndGg7XG4gICAgZm9yICh2YXIgcD0wOyBwIDwgbnVtX3BvbHlnb25zOyBwKyspIHtcbiAgICAgICAgdmFyIHZlcnRpY2VzID0gR0wudHJpYW5ndWxhdGVQb2x5Z29uKHBvbHlnb25zW3BdKTtcbiAgICAgICAgR0wuYWRkVmVydGljZXModmVydGljZXMsIHZlcnRleF9jb25zdGFudHMsIHZlcnRleF9kYXRhKTtcbiAgICB9XG5cbiAgICByZXR1cm4gdmVydGV4X2RhdGE7XG59O1xuXG4vLyBDYWxsYmFjay1iYXNlIGJ1aWxkZXIgKGZvciBmdXR1cmUgZXhwbG9yYXRpb24pXG4vLyBUZXNzZWxhdGUgYSBmbGF0IDJEIHBvbHlnb24gd2l0aCBmaXhlZCBoZWlnaHQgYW5kIGFkZCB0byBHTCB2ZXJ0ZXggYnVmZmVyXG4vLyBHTEJ1aWxkZXJzLmJ1aWxkUG9seWdvbnMyID0gZnVuY3Rpb24gR0xCdWlsZGVyc0J1aWxkUG9seWdvbjIgKHBvbHlnb25zLCB6LCBhZGRHZW9tZXRyeSwgb3B0aW9ucylcbi8vIHtcbi8vICAgICBvcHRpb25zID0gb3B0aW9ucyB8fCB7fTtcblxuLy8gICAgIHZhciBudW1fcG9seWdvbnMgPSBwb2x5Z29ucy5sZW5ndGg7XG4vLyAgICAgZm9yICh2YXIgcD0wOyBwIDwgbnVtX3BvbHlnb25zOyBwKyspIHtcbi8vICAgICAgICAgdmFyIHZlcnRpY2VzID0ge1xuLy8gICAgICAgICAgICAgcG9zaXRpb25zOiBHTC50cmlhbmd1bGF0ZVBvbHlnb24ocG9seWdvbnNbcF0sIHopLFxuLy8gICAgICAgICAgICAgbm9ybWFsczogKG9wdGlvbnMubm9ybWFscyA/IFswLCAwLCAxXSA6IG51bGwpXG4vLyAgICAgICAgIH07XG5cbi8vICAgICAgICAgYWRkR2VvbWV0cnkodmVydGljZXMpO1xuLy8gICAgIH1cbi8vIH07XG5cbi8vIFRlc3NlbGF0ZSBhbmQgZXh0cnVkZSBhIGZsYXQgMkQgcG9seWdvbiBpbnRvIGEgc2ltcGxlIDNEIG1vZGVsIHdpdGggZml4ZWQgaGVpZ2h0IGFuZCBhZGQgdG8gR0wgdmVydGV4IGJ1ZmZlclxuR0xCdWlsZGVycy5idWlsZEV4dHJ1ZGVkUG9seWdvbnMgPSBmdW5jdGlvbiBHTEJ1aWxkZXJzQnVpbGRFeHRydWRlZFBvbHlnb24gKHBvbHlnb25zLCB6LCBoZWlnaHQsIG1pbl9oZWlnaHQsIHZlcnRleF9kYXRhLCBvcHRpb25zKVxue1xuICAgIG9wdGlvbnMgPSBvcHRpb25zIHx8IHt9O1xuICAgIHZhciBtaW5feiA9IHogKyAobWluX2hlaWdodCB8fCAwKTtcbiAgICB2YXIgbWF4X3ogPSB6ICsgaGVpZ2h0O1xuXG4gICAgLy8gVG9wXG4gICAgR0xCdWlsZGVycy5idWlsZFBvbHlnb25zKHBvbHlnb25zLCBtYXhfeiwgdmVydGV4X2RhdGEsIHsgbm9ybWFsczogdHJ1ZSwgdmVydGV4X2NvbnN0YW50czogb3B0aW9ucy52ZXJ0ZXhfY29uc3RhbnRzIH0pO1xuICAgIC8vIHZhciB0b3BfdmVydGV4X2NvbnN0YW50cyA9IFswLCAwLCAxXTtcbiAgICAvLyBpZiAob3B0aW9ucy52ZXJ0ZXhfY29uc3RhbnRzICE9IG51bGwpIHtcbiAgICAvLyAgICAgdG9wX3ZlcnRleF9jb25zdGFudHMucHVzaC5hcHBseSh0b3BfdmVydGV4X2NvbnN0YW50cywgb3B0aW9ucy52ZXJ0ZXhfY29uc3RhbnRzKTtcbiAgICAvLyB9XG4gICAgLy8gR0xCdWlsZGVycy5idWlsZFBvbHlnb25zMihcbiAgICAvLyAgICAgcG9seWdvbnMsXG4gICAgLy8gICAgIG1heF96LFxuICAgIC8vICAgICBmdW5jdGlvbiAodmVydGljZXMpIHtcbiAgICAvLyAgICAgICAgIEdMLmFkZFZlcnRpY2VzKHZlcnRpY2VzLnBvc2l0aW9ucywgdG9wX3ZlcnRleF9jb25zdGFudHMsIHZlcnRleF9kYXRhKTtcbiAgICAvLyAgICAgfVxuICAgIC8vICk7XG5cbiAgICAvLyBXYWxsc1xuICAgIHZhciB3YWxsX3ZlcnRleF9jb25zdGFudHMgPSBbbnVsbCwgbnVsbCwgbnVsbF07IC8vIG5vcm1hbHMgd2lsbCBiZSBjYWxjdWxhdGVkIGJlbG93XG4gICAgaWYgKG9wdGlvbnMudmVydGV4X2NvbnN0YW50cykge1xuICAgICAgICB3YWxsX3ZlcnRleF9jb25zdGFudHMucHVzaC5hcHBseSh3YWxsX3ZlcnRleF9jb25zdGFudHMsIG9wdGlvbnMudmVydGV4X2NvbnN0YW50cyk7XG4gICAgfVxuXG4gICAgdmFyIG51bV9wb2x5Z29ucyA9IHBvbHlnb25zLmxlbmd0aDtcbiAgICBmb3IgKHZhciBwPTA7IHAgPCBudW1fcG9seWdvbnM7IHArKykge1xuICAgICAgICB2YXIgcG9seWdvbiA9IHBvbHlnb25zW3BdO1xuXG4gICAgICAgIGZvciAodmFyIHE9MDsgcSA8IHBvbHlnb24ubGVuZ3RoOyBxKyspIHtcbiAgICAgICAgICAgIHZhciBjb250b3VyID0gcG9seWdvbltxXTtcblxuICAgICAgICAgICAgZm9yICh2YXIgdz0wOyB3IDwgY29udG91ci5sZW5ndGggLSAxOyB3KyspIHtcbiAgICAgICAgICAgICAgICB2YXIgd2FsbF92ZXJ0aWNlcyA9IFtdO1xuXG4gICAgICAgICAgICAgICAgLy8gVHdvIHRyaWFuZ2xlcyBmb3IgdGhlIHF1YWQgZm9ybWVkIGJ5IGVhY2ggdmVydGV4IHBhaXIsIGdvaW5nIGZyb20gYm90dG9tIHRvIHRvcCBoZWlnaHRcbiAgICAgICAgICAgICAgICB3YWxsX3ZlcnRpY2VzLnB1c2goXG4gICAgICAgICAgICAgICAgICAgIC8vIFRyaWFuZ2xlXG4gICAgICAgICAgICAgICAgICAgIFtjb250b3VyW3crMV1bMF0sIGNvbnRvdXJbdysxXVsxXSwgbWF4X3pdLFxuICAgICAgICAgICAgICAgICAgICBbY29udG91clt3KzFdWzBdLCBjb250b3VyW3crMV1bMV0sIG1pbl96XSxcbiAgICAgICAgICAgICAgICAgICAgW2NvbnRvdXJbd11bMF0sIGNvbnRvdXJbd11bMV0sIG1pbl96XSxcbiAgICAgICAgICAgICAgICAgICAgLy8gVHJpYW5nbGVcbiAgICAgICAgICAgICAgICAgICAgW2NvbnRvdXJbd11bMF0sIGNvbnRvdXJbd11bMV0sIG1pbl96XSxcbiAgICAgICAgICAgICAgICAgICAgW2NvbnRvdXJbd11bMF0sIGNvbnRvdXJbd11bMV0sIG1heF96XSxcbiAgICAgICAgICAgICAgICAgICAgW2NvbnRvdXJbdysxXVswXSwgY29udG91clt3KzFdWzFdLCBtYXhfel1cbiAgICAgICAgICAgICAgICApO1xuXG4gICAgICAgICAgICAgICAgLy8gQ2FsYyB0aGUgbm9ybWFsIG9mIHRoZSB3YWxsIGZyb20gdXAgdmVjdG9yIGFuZCBvbmUgc2VnbWVudCBvZiB0aGUgd2FsbCB0cmlhbmdsZXNcbiAgICAgICAgICAgICAgICB2YXIgbm9ybWFsID0gVmVjdG9yLmNyb3NzKFxuICAgICAgICAgICAgICAgICAgICBbMCwgMCwgMV0sXG4gICAgICAgICAgICAgICAgICAgIFZlY3Rvci5ub3JtYWxpemUoW2NvbnRvdXJbdysxXVswXSAtIGNvbnRvdXJbd11bMF0sIGNvbnRvdXJbdysxXVsxXSAtIGNvbnRvdXJbd11bMV0sIDBdKVxuICAgICAgICAgICAgICAgICk7XG5cbiAgICAgICAgICAgICAgICB3YWxsX3ZlcnRleF9jb25zdGFudHNbMF0gPSBub3JtYWxbMF07XG4gICAgICAgICAgICAgICAgd2FsbF92ZXJ0ZXhfY29uc3RhbnRzWzFdID0gbm9ybWFsWzFdO1xuICAgICAgICAgICAgICAgIHdhbGxfdmVydGV4X2NvbnN0YW50c1syXSA9IG5vcm1hbFsyXTtcblxuICAgICAgICAgICAgICAgIEdMLmFkZFZlcnRpY2VzKHdhbGxfdmVydGljZXMsIHdhbGxfdmVydGV4X2NvbnN0YW50cywgdmVydGV4X2RhdGEpO1xuICAgICAgICAgICAgfVxuICAgICAgICB9XG4gICAgfVxuXG4gICAgcmV0dXJuIHZlcnRleF9kYXRhO1xufTtcblxuLy8gQnVpbGQgdGVzc2VsbGF0ZWQgdHJpYW5nbGVzIGZvciBhIHBvbHlsaW5lXG4vLyBCYXNpY2FsbHkgZm9sbG93aW5nIHRoZSBtZXRob2QgZGVzY3JpYmVkIGhlcmUgZm9yIG1pdGVyIGpvaW50czpcbi8vIGh0dHA6Ly9hcnRncmFtbWVyLmJsb2dzcG90LmNvLnVrLzIwMTEvMDcvZHJhd2luZy1wb2x5bGluZXMtYnktdGVzc2VsbGF0aW9uLmh0bWxcbkdMQnVpbGRlcnMuYnVpbGRQb2x5bGluZXMgPSBmdW5jdGlvbiBHTEJ1aWxkZXJzQnVpbGRQb2x5bGluZXMgKGxpbmVzLCB6LCB3aWR0aCwgdmVydGV4X2RhdGEsIG9wdGlvbnMpXG57XG4gICAgb3B0aW9ucyA9IG9wdGlvbnMgfHwge307XG4gICAgb3B0aW9ucy5jbG9zZWRfcG9seWdvbiA9IG9wdGlvbnMuY2xvc2VkX3BvbHlnb24gfHwgZmFsc2U7XG4gICAgb3B0aW9ucy5yZW1vdmVfdGlsZV9lZGdlcyA9IG9wdGlvbnMucmVtb3ZlX3RpbGVfZWRnZXMgfHwgZmFsc2U7XG5cbiAgICB2YXIgdmVydGV4X2NvbnN0YW50cyA9IFt6LCAwLCAwLCAxXTsgLy8gcHJvdmlkZWQgeiwgYW5kIHVwd2FyZHMtZmFjaW5nIG5vcm1hbFxuICAgIGlmIChvcHRpb25zLnZlcnRleF9jb25zdGFudHMpIHtcbiAgICAgICAgdmVydGV4X2NvbnN0YW50cy5wdXNoLmFwcGx5KHZlcnRleF9jb25zdGFudHMsIG9wdGlvbnMudmVydGV4X2NvbnN0YW50cyk7XG4gICAgfVxuXG4gICAgLy8gTGluZSBjZW50ZXIgLSBkZWJ1Z2dpbmdcbiAgICBpZiAoR0xCdWlsZGVycy5kZWJ1ZyAmJiBvcHRpb25zLnZlcnRleF9saW5lcykge1xuICAgICAgICB2YXIgbnVtX2xpbmVzID0gbGluZXMubGVuZ3RoO1xuICAgICAgICBmb3IgKHZhciBsbj0wOyBsbiA8IG51bV9saW5lczsgbG4rKykge1xuICAgICAgICAgICAgdmFyIGxpbmUgPSBsaW5lc1tsbl07XG5cbiAgICAgICAgICAgIGZvciAodmFyIHA9MDsgcCA8IGxpbmUubGVuZ3RoIC0gMTsgcCsrKSB7XG4gICAgICAgICAgICAgICAgLy8gUG9pbnQgQSB0byBCXG4gICAgICAgICAgICAgICAgdmFyIHBhID0gbGluZVtwXTtcbiAgICAgICAgICAgICAgICB2YXIgcGIgPSBsaW5lW3ArMV07XG5cbiAgICAgICAgICAgICAgICBvcHRpb25zLnZlcnRleF9saW5lcy5wdXNoKFxuICAgICAgICAgICAgICAgICAgICBwYVswXSwgcGFbMV0sIHogKyAwLjAwMSwgMCwgMCwgMSwgMS4wLCAwLCAwLFxuICAgICAgICAgICAgICAgICAgICBwYlswXSwgcGJbMV0sIHogKyAwLjAwMSwgMCwgMCwgMSwgMS4wLCAwLCAwXG4gICAgICAgICAgICAgICAgKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgfTtcbiAgICB9XG5cbiAgICAvLyBCdWlsZCB0cmlhbmdsZXNcbiAgICB2YXIgdmVydGljZXMgPSBbXTtcbiAgICB2YXIgbnVtX2xpbmVzID0gbGluZXMubGVuZ3RoO1xuICAgIGZvciAodmFyIGxuPTA7IGxuIDwgbnVtX2xpbmVzOyBsbisrKSB7XG4gICAgICAgIHZhciBsaW5lID0gbGluZXNbbG5dO1xuICAgICAgICAvLyBNdWx0aXBsZSBsaW5lIHNlZ21lbnRzXG4gICAgICAgIGlmIChsaW5lLmxlbmd0aCA+IDIpIHtcbiAgICAgICAgICAgIC8vIEJ1aWxkIGFuY2hvcnMgZm9yIGxpbmUgc2VnbWVudHM6XG4gICAgICAgICAgICAvLyBhbmNob3JzIGFyZSAzIHBvaW50cywgZWFjaCBjb25uZWN0aW5nIDIgbGluZSBzZWdtZW50cyB0aGF0IHNoYXJlIGEgam9pbnQgKHN0YXJ0IHBvaW50LCBqb2ludCBwb2ludCwgZW5kIHBvaW50KVxuXG4gICAgICAgICAgICB2YXIgYW5jaG9ycyA9IFtdO1xuXG4gICAgICAgICAgICBpZiAobGluZS5sZW5ndGggPiAzKSB7XG4gICAgICAgICAgICAgICAgLy8gRmluZCBtaWRwb2ludHMgb2YgZWFjaCBsaW5lIHNlZ21lbnRcbiAgICAgICAgICAgICAgICAvLyBGb3IgY2xvc2VkIHBvbHlnb25zLCBjYWxjdWxhdGUgYWxsIG1pZHBvaW50cyBzaW5jZSBzZWdtZW50cyB3aWxsIHdyYXAgYXJvdW5kIHRvIGZpcnN0IG1pZHBvaW50XG4gICAgICAgICAgICAgICAgdmFyIG1pZCA9IFtdO1xuICAgICAgICAgICAgICAgIHZhciBwLCBwbWF4O1xuICAgICAgICAgICAgICAgIGlmIChvcHRpb25zLmNsb3NlZF9wb2x5Z29uID09IHRydWUpIHtcbiAgICAgICAgICAgICAgICAgICAgcCA9IDA7IC8vIHN0YXJ0IG9uIGZpcnN0IHBvaW50XG4gICAgICAgICAgICAgICAgICAgIHBtYXggPSBsaW5lLmxlbmd0aCAtIDE7XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgIC8vIEZvciBvcGVuIHBvbHlnb25zLCBza2lwIGZpcnN0IG1pZHBvaW50IGFuZCB1c2UgbGluZSBzdGFydCBpbnN0ZWFkXG4gICAgICAgICAgICAgICAgZWxzZSB7XG4gICAgICAgICAgICAgICAgICAgIHAgPSAxOyAvLyBzdGFydCBvbiBzZWNvbmQgcG9pbnRcbiAgICAgICAgICAgICAgICAgICAgcG1heCA9IGxpbmUubGVuZ3RoIC0gMjtcbiAgICAgICAgICAgICAgICAgICAgbWlkLnB1c2gobGluZVswXSk7IC8vIHVzZSBsaW5lIHN0YXJ0IGluc3RlYWQgb2YgZmlyc3QgbWlkcG9pbnRcbiAgICAgICAgICAgICAgICB9XG5cbiAgICAgICAgICAgICAgICAvLyBDYWxjIG1pZHBvaW50c1xuICAgICAgICAgICAgICAgIGZvciAoOyBwIDwgcG1heDsgcCsrKSB7XG4gICAgICAgICAgICAgICAgICAgIHZhciBwYSA9IGxpbmVbcF07XG4gICAgICAgICAgICAgICAgICAgIHZhciBwYiA9IGxpbmVbcCsxXTtcbiAgICAgICAgICAgICAgICAgICAgbWlkLnB1c2goWyhwYVswXSArIHBiWzBdKSAvIDIsIChwYVsxXSArIHBiWzFdKSAvIDJdKTtcbiAgICAgICAgICAgICAgICB9XG5cbiAgICAgICAgICAgICAgICAvLyBTYW1lIGNsb3NlZC9vcGVuIHBvbHlnb24gbG9naWMgYXMgYWJvdmU6IGtlZXAgbGFzdCBtaWRwb2ludCBmb3IgY2xvc2VkLCBza2lwIGZvciBvcGVuXG4gICAgICAgICAgICAgICAgdmFyIG1tYXg7XG4gICAgICAgICAgICAgICAgaWYgKG9wdGlvbnMuY2xvc2VkX3BvbHlnb24gPT0gdHJ1ZSkge1xuICAgICAgICAgICAgICAgICAgICBtbWF4ID0gbWlkLmxlbmd0aDtcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgZWxzZSB7XG4gICAgICAgICAgICAgICAgICAgIG1pZC5wdXNoKGxpbmVbbGluZS5sZW5ndGgtMV0pOyAvLyB1c2UgbGluZSBlbmQgaW5zdGVhZCBvZiBsYXN0IG1pZHBvaW50XG4gICAgICAgICAgICAgICAgICAgIG1tYXggPSBtaWQubGVuZ3RoIC0gMTtcbiAgICAgICAgICAgICAgICB9XG5cbiAgICAgICAgICAgICAgICAvLyBNYWtlIGFuY2hvcnMgYnkgY29ubmVjdGluZyBtaWRwb2ludHMgdG8gbGluZSBqb2ludHNcbiAgICAgICAgICAgICAgICBmb3IgKHA9MDsgcCA8IG1tYXg7IHArKykgIHtcbiAgICAgICAgICAgICAgICAgICAgYW5jaG9ycy5wdXNoKFttaWRbcF0sIGxpbmVbKHArMSkgJSBsaW5lLmxlbmd0aF0sIG1pZFsocCsxKSAlIG1pZC5sZW5ndGhdXSk7XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgfVxuICAgICAgICAgICAgZWxzZSB7XG4gICAgICAgICAgICAgICAgLy8gRGVnZW5lcmF0ZSBjYXNlLCBhIDMtcG9pbnQgbGluZSBpcyBqdXN0IGEgc2luZ2xlIGFuY2hvclxuICAgICAgICAgICAgICAgIGFuY2hvcnMgPSBbW2xpbmVbMF0sIGxpbmVbMV0sIGxpbmVbMl1dXTtcbiAgICAgICAgICAgIH1cblxuICAgICAgICAgICAgZm9yICh2YXIgcD0wOyBwIDwgYW5jaG9ycy5sZW5ndGg7IHArKykge1xuICAgICAgICAgICAgICAgIGlmICghb3B0aW9ucy5yZW1vdmVfdGlsZV9lZGdlcykge1xuICAgICAgICAgICAgICAgICAgICBidWlsZEFuY2hvcihhbmNob3JzW3BdWzBdLCBhbmNob3JzW3BdWzFdLCBhbmNob3JzW3BdWzJdKTtcbiAgICAgICAgICAgICAgICAgICAgLy8gYnVpbGRTZWdtZW50KGFuY2hvcnNbcF1bMF0sIGFuY2hvcnNbcF1bMV0pOyAvLyB1c2UgdGhlc2UgdG8gZHJhdyBleHRydWRlZCBzZWdtZW50cyB3L28gam9pbiwgZm9yIGRlYnVnZ2luZ1xuICAgICAgICAgICAgICAgICAgICAvLyBidWlsZFNlZ21lbnQoYW5jaG9yc1twXVsxXSwgYW5jaG9yc1twXVsyXSk7XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgIGVsc2Uge1xuICAgICAgICAgICAgICAgICAgICB2YXIgZWRnZTEgPSBHTEJ1aWxkZXJzLmlzT25UaWxlRWRnZShhbmNob3JzW3BdWzBdLCBhbmNob3JzW3BdWzFdKTtcbiAgICAgICAgICAgICAgICAgICAgdmFyIGVkZ2UyID0gR0xCdWlsZGVycy5pc09uVGlsZUVkZ2UoYW5jaG9yc1twXVsxXSwgYW5jaG9yc1twXVsyXSk7XG4gICAgICAgICAgICAgICAgICAgIGlmICghZWRnZTEgJiYgIWVkZ2UyKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICBidWlsZEFuY2hvcihhbmNob3JzW3BdWzBdLCBhbmNob3JzW3BdWzFdLCBhbmNob3JzW3BdWzJdKTtcbiAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgICAgICBlbHNlIGlmICghZWRnZTEpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgIGJ1aWxkU2VnbWVudChhbmNob3JzW3BdWzBdLCBhbmNob3JzW3BdWzFdKTtcbiAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgICAgICBlbHNlIGlmICghZWRnZTIpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgIGJ1aWxkU2VnbWVudChhbmNob3JzW3BdWzFdLCBhbmNob3JzW3BdWzJdKTtcbiAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgIH1cbiAgICAgICAgfVxuICAgICAgICAvLyBTaW5nbGUgMi1wb2ludCBzZWdtZW50XG4gICAgICAgIGVsc2UgaWYgKGxpbmUubGVuZ3RoID09IDIpIHtcbiAgICAgICAgICAgIGJ1aWxkU2VnbWVudChsaW5lWzBdLCBsaW5lWzFdKTsgLy8gVE9ETzogcmVwbGFjZSBidWlsZFNlZ21lbnQgd2l0aCBhIGRlZ2VuZXJhdGUgZm9ybSBvZiBidWlsZEFuY2hvcj8gYnVpbGRTZWdtZW50IGlzIHN0aWxsIHVzZWZ1bCBmb3IgZGVidWdnaW5nXG4gICAgICAgIH1cbiAgICB9O1xuXG4gICAgR0wuYWRkVmVydGljZXModmVydGljZXMsIHZlcnRleF9jb25zdGFudHMsIHZlcnRleF9kYXRhKTtcblxuICAgIC8vIEJ1aWxkIHRyaWFuZ2xlcyBmb3IgYSBzaW5nbGUgbGluZSBzZWdtZW50LCBleHRydWRlZCBieSB0aGUgcHJvdmlkZWQgd2lkdGhcbiAgICBmdW5jdGlvbiBidWlsZFNlZ21lbnQgKHBhLCBwYikge1xuICAgICAgICB2YXIgc2xvcGUgPSBWZWN0b3Iubm9ybWFsaXplKFsocGJbMV0gLSBwYVsxXSkgKiAtMSwgcGJbMF0gLSBwYVswXV0pO1xuXG4gICAgICAgIHZhciBwYV9vdXRlciA9IFtwYVswXSArIHNsb3BlWzBdICogd2lkdGgvMiwgcGFbMV0gKyBzbG9wZVsxXSAqIHdpZHRoLzJdO1xuICAgICAgICB2YXIgcGFfaW5uZXIgPSBbcGFbMF0gLSBzbG9wZVswXSAqIHdpZHRoLzIsIHBhWzFdIC0gc2xvcGVbMV0gKiB3aWR0aC8yXTtcblxuICAgICAgICB2YXIgcGJfb3V0ZXIgPSBbcGJbMF0gKyBzbG9wZVswXSAqIHdpZHRoLzIsIHBiWzFdICsgc2xvcGVbMV0gKiB3aWR0aC8yXTtcbiAgICAgICAgdmFyIHBiX2lubmVyID0gW3BiWzBdIC0gc2xvcGVbMF0gKiB3aWR0aC8yLCBwYlsxXSAtIHNsb3BlWzFdICogd2lkdGgvMl07XG5cbiAgICAgICAgdmVydGljZXMucHVzaChcbiAgICAgICAgICAgIHBiX2lubmVyLCBwYl9vdXRlciwgcGFfaW5uZXIsXG4gICAgICAgICAgICBwYV9pbm5lciwgcGJfb3V0ZXIsIHBhX291dGVyXG4gICAgICAgICk7XG4gICAgfVxuXG4gICAgLy8gQnVpbGQgdHJpYW5nbGVzIGZvciBhIDMtcG9pbnQgJ2FuY2hvcicgc2hhcGUsIGNvbnNpc3Rpbmcgb2YgdHdvIGxpbmUgc2VnbWVudHMgd2l0aCBhIGpvaW50XG4gICAgLy8gVE9ETzogbW92ZSB0aGVzZSBmdW5jdGlvbnMgb3V0IG9mIGNsb3N1cmVzP1xuICAgIGZ1bmN0aW9uIGJ1aWxkQW5jaG9yIChwYSwgam9pbnQsIHBiKSB7XG4gICAgICAgIC8vIElubmVyIGFuZCBvdXRlciBsaW5lIHNlZ21lbnRzIGZvciBbcGEsIGpvaW50XSBhbmQgW2pvaW50LCBwYl1cbiAgICAgICAgdmFyIHBhX3Nsb3BlID0gVmVjdG9yLm5vcm1hbGl6ZShbKGpvaW50WzFdIC0gcGFbMV0pICogLTEsIGpvaW50WzBdIC0gcGFbMF1dKTtcbiAgICAgICAgdmFyIHBhX291dGVyID0gW1xuICAgICAgICAgICAgW3BhWzBdICsgcGFfc2xvcGVbMF0gKiB3aWR0aC8yLCBwYVsxXSArIHBhX3Nsb3BlWzFdICogd2lkdGgvMl0sXG4gICAgICAgICAgICBbam9pbnRbMF0gKyBwYV9zbG9wZVswXSAqIHdpZHRoLzIsIGpvaW50WzFdICsgcGFfc2xvcGVbMV0gKiB3aWR0aC8yXVxuICAgICAgICBdO1xuICAgICAgICB2YXIgcGFfaW5uZXIgPSBbXG4gICAgICAgICAgICBbcGFbMF0gLSBwYV9zbG9wZVswXSAqIHdpZHRoLzIsIHBhWzFdIC0gcGFfc2xvcGVbMV0gKiB3aWR0aC8yXSxcbiAgICAgICAgICAgIFtqb2ludFswXSAtIHBhX3Nsb3BlWzBdICogd2lkdGgvMiwgam9pbnRbMV0gLSBwYV9zbG9wZVsxXSAqIHdpZHRoLzJdXG4gICAgICAgIF07XG5cbiAgICAgICAgdmFyIHBiX3Nsb3BlID0gVmVjdG9yLm5vcm1hbGl6ZShbKHBiWzFdIC0gam9pbnRbMV0pICogLTEsIHBiWzBdIC0gam9pbnRbMF1dKTtcbiAgICAgICAgdmFyIHBiX291dGVyID0gW1xuICAgICAgICAgICAgW2pvaW50WzBdICsgcGJfc2xvcGVbMF0gKiB3aWR0aC8yLCBqb2ludFsxXSArIHBiX3Nsb3BlWzFdICogd2lkdGgvMl0sXG4gICAgICAgICAgICBbcGJbMF0gKyBwYl9zbG9wZVswXSAqIHdpZHRoLzIsIHBiWzFdICsgcGJfc2xvcGVbMV0gKiB3aWR0aC8yXVxuICAgICAgICBdO1xuICAgICAgICB2YXIgcGJfaW5uZXIgPSBbXG4gICAgICAgICAgICBbam9pbnRbMF0gLSBwYl9zbG9wZVswXSAqIHdpZHRoLzIsIGpvaW50WzFdIC0gcGJfc2xvcGVbMV0gKiB3aWR0aC8yXSxcbiAgICAgICAgICAgIFtwYlswXSAtIHBiX3Nsb3BlWzBdICogd2lkdGgvMiwgcGJbMV0gLSBwYl9zbG9wZVsxXSAqIHdpZHRoLzJdXG4gICAgICAgIF07XG5cbiAgICAgICAgLy8gTWl0ZXIgam9pbiAtIHNvbHZlIGZvciB0aGUgaW50ZXJzZWN0aW9uIGJldHdlZW4gdGhlIHR3byBvdXRlciBsaW5lIHNlZ21lbnRzXG4gICAgICAgIHZhciBpbnRlcnNlY3Rpb24gPSBWZWN0b3IubGluZUludGVyc2VjdGlvbihwYV9vdXRlclswXSwgcGFfb3V0ZXJbMV0sIHBiX291dGVyWzBdLCBwYl9vdXRlclsxXSk7XG4gICAgICAgIHZhciBsaW5lX2RlYnVnID0gbnVsbDtcbiAgICAgICAgaWYgKGludGVyc2VjdGlvbiAhPSBudWxsKSB7XG4gICAgICAgICAgICB2YXIgaW50ZXJzZWN0X291dGVyID0gaW50ZXJzZWN0aW9uO1xuXG4gICAgICAgICAgICAvLyBDYXAgdGhlIGludGVyc2VjdGlvbiBwb2ludCB0byBhIHJlYXNvbmFibGUgZGlzdGFuY2UgKGFzIGpvaW4gYW5nbGUgYmVjb21lcyBzaGFycGVyLCBtaXRlciBqb2ludCBkaXN0YW5jZSB3b3VsZCBhcHByb2FjaCBpbmZpbml0eSlcbiAgICAgICAgICAgIHZhciBsZW5fc3EgPSBWZWN0b3IubGVuZ3RoU3EoW2ludGVyc2VjdF9vdXRlclswXSAtIGpvaW50WzBdLCBpbnRlcnNlY3Rfb3V0ZXJbMV0gLSBqb2ludFsxXV0pO1xuICAgICAgICAgICAgdmFyIG1pdGVyX2xlbl9tYXggPSAzOyAvLyBtdWx0aXBsaWVyIG9uIGxpbmUgd2lkdGggZm9yIG1heCBkaXN0YW5jZSBtaXRlciBqb2luIGNhbiBiZSBmcm9tIGpvaW50XG4gICAgICAgICAgICBpZiAobGVuX3NxID4gKHdpZHRoICogd2lkdGggKiBtaXRlcl9sZW5fbWF4ICogbWl0ZXJfbGVuX21heCkpIHtcbiAgICAgICAgICAgICAgICBsaW5lX2RlYnVnID0gJ2Rpc3RhbmNlJztcbiAgICAgICAgICAgICAgICBpbnRlcnNlY3Rfb3V0ZXIgPSBWZWN0b3Iubm9ybWFsaXplKFtpbnRlcnNlY3Rfb3V0ZXJbMF0gLSBqb2ludFswXSwgaW50ZXJzZWN0X291dGVyWzFdIC0gam9pbnRbMV1dKTtcbiAgICAgICAgICAgICAgICBpbnRlcnNlY3Rfb3V0ZXIgPSBbXG4gICAgICAgICAgICAgICAgICAgIGpvaW50WzBdICsgaW50ZXJzZWN0X291dGVyWzBdICogbWl0ZXJfbGVuX21heCxcbiAgICAgICAgICAgICAgICAgICAgam9pbnRbMV0gKyBpbnRlcnNlY3Rfb3V0ZXJbMV0gKiBtaXRlcl9sZW5fbWF4XG4gICAgICAgICAgICAgICAgXVxuICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICB2YXIgaW50ZXJzZWN0X2lubmVyID0gW1xuICAgICAgICAgICAgICAgIChqb2ludFswXSAtIGludGVyc2VjdF9vdXRlclswXSkgKyBqb2ludFswXSxcbiAgICAgICAgICAgICAgICAoam9pbnRbMV0gLSBpbnRlcnNlY3Rfb3V0ZXJbMV0pICsgam9pbnRbMV1cbiAgICAgICAgICAgIF07XG5cbiAgICAgICAgICAgIHZlcnRpY2VzLnB1c2goXG4gICAgICAgICAgICAgICAgaW50ZXJzZWN0X2lubmVyLCBpbnRlcnNlY3Rfb3V0ZXIsIHBhX2lubmVyWzBdLFxuICAgICAgICAgICAgICAgIHBhX2lubmVyWzBdLCBpbnRlcnNlY3Rfb3V0ZXIsIHBhX291dGVyWzBdLFxuXG4gICAgICAgICAgICAgICAgcGJfaW5uZXJbMV0sIHBiX291dGVyWzFdLCBpbnRlcnNlY3RfaW5uZXIsXG4gICAgICAgICAgICAgICAgaW50ZXJzZWN0X2lubmVyLCBwYl9vdXRlclsxXSwgaW50ZXJzZWN0X291dGVyXG4gICAgICAgICAgICApO1xuICAgICAgICB9XG4gICAgICAgIGVsc2Uge1xuICAgICAgICAgICAgLy8gTGluZSBzZWdtZW50cyBhcmUgcGFyYWxsZWwsIHVzZSB0aGUgZmlyc3Qgb3V0ZXIgbGluZSBzZWdtZW50IGFzIGpvaW4gaW5zdGVhZFxuICAgICAgICAgICAgbGluZV9kZWJ1ZyA9ICdwYXJhbGxlbCc7XG4gICAgICAgICAgICBwYV9pbm5lclsxXSA9IHBiX2lubmVyWzBdO1xuICAgICAgICAgICAgcGFfb3V0ZXJbMV0gPSBwYl9vdXRlclswXTtcblxuICAgICAgICAgICAgdmVydGljZXMucHVzaChcbiAgICAgICAgICAgICAgICBwYV9pbm5lclsxXSwgcGFfb3V0ZXJbMV0sIHBhX2lubmVyWzBdLFxuICAgICAgICAgICAgICAgIHBhX2lubmVyWzBdLCBwYV9vdXRlclsxXSwgcGFfb3V0ZXJbMF0sXG5cbiAgICAgICAgICAgICAgICBwYl9pbm5lclsxXSwgcGJfb3V0ZXJbMV0sIHBiX2lubmVyWzBdLFxuICAgICAgICAgICAgICAgIHBiX2lubmVyWzBdLCBwYl9vdXRlclsxXSwgcGJfb3V0ZXJbMF1cbiAgICAgICAgICAgICk7XG4gICAgICAgIH1cblxuICAgICAgICAvLyBFeHRydWRlZCBpbm5lci9vdXRlciBlZGdlcyAtIGRlYnVnZ2luZ1xuICAgICAgICBpZiAoR0xCdWlsZGVycy5kZWJ1ZyAmJiBvcHRpb25zLnZlcnRleF9saW5lcykge1xuICAgICAgICAgICAgb3B0aW9ucy52ZXJ0ZXhfbGluZXMucHVzaChcbiAgICAgICAgICAgICAgICBwYV9pbm5lclswXVswXSwgcGFfaW5uZXJbMF1bMV0sIHogKyAwLjAwMSwgMCwgMCwgMSwgMCwgMS4wLCAwLFxuICAgICAgICAgICAgICAgIHBhX2lubmVyWzFdWzBdLCBwYV9pbm5lclsxXVsxXSwgeiArIDAuMDAxLCAwLCAwLCAxLCAwLCAxLjAsIDAsXG5cbiAgICAgICAgICAgICAgICBwYl9pbm5lclswXVswXSwgcGJfaW5uZXJbMF1bMV0sIHogKyAwLjAwMSwgMCwgMCwgMSwgMCwgMS4wLCAwLFxuICAgICAgICAgICAgICAgIHBiX2lubmVyWzFdWzBdLCBwYl9pbm5lclsxXVsxXSwgeiArIDAuMDAxLCAwLCAwLCAxLCAwLCAxLjAsIDAsXG5cbiAgICAgICAgICAgICAgICBwYV9vdXRlclswXVswXSwgcGFfb3V0ZXJbMF1bMV0sIHogKyAwLjAwMSwgMCwgMCwgMSwgMCwgMS4wLCAwLFxuICAgICAgICAgICAgICAgIHBhX291dGVyWzFdWzBdLCBwYV9vdXRlclsxXVsxXSwgeiArIDAuMDAxLCAwLCAwLCAxLCAwLCAxLjAsIDAsXG5cbiAgICAgICAgICAgICAgICBwYl9vdXRlclswXVswXSwgcGJfb3V0ZXJbMF1bMV0sIHogKyAwLjAwMSwgMCwgMCwgMSwgMCwgMS4wLCAwLFxuICAgICAgICAgICAgICAgIHBiX291dGVyWzFdWzBdLCBwYl9vdXRlclsxXVsxXSwgeiArIDAuMDAxLCAwLCAwLCAxLCAwLCAxLjAsIDAsXG5cbiAgICAgICAgICAgICAgICBwYV9pbm5lclswXVswXSwgcGFfaW5uZXJbMF1bMV0sIHogKyAwLjAwMSwgMCwgMCwgMSwgMCwgMS4wLCAwLFxuICAgICAgICAgICAgICAgIHBhX291dGVyWzBdWzBdLCBwYV9vdXRlclswXVsxXSwgeiArIDAuMDAxLCAwLCAwLCAxLCAwLCAxLjAsIDAsXG5cbiAgICAgICAgICAgICAgICBwYV9pbm5lclsxXVswXSwgcGFfaW5uZXJbMV1bMV0sIHogKyAwLjAwMSwgMCwgMCwgMSwgMCwgMS4wLCAwLFxuICAgICAgICAgICAgICAgIHBhX291dGVyWzFdWzBdLCBwYV9vdXRlclsxXVsxXSwgeiArIDAuMDAxLCAwLCAwLCAxLCAwLCAxLjAsIDAsXG5cbiAgICAgICAgICAgICAgICBwYl9pbm5lclswXVswXSwgcGJfaW5uZXJbMF1bMV0sIHogKyAwLjAwMSwgMCwgMCwgMSwgMCwgMS4wLCAwLFxuICAgICAgICAgICAgICAgIHBiX291dGVyWzBdWzBdLCBwYl9vdXRlclswXVsxXSwgeiArIDAuMDAxLCAwLCAwLCAxLCAwLCAxLjAsIDAsXG5cbiAgICAgICAgICAgICAgICBwYl9pbm5lclsxXVswXSwgcGJfaW5uZXJbMV1bMV0sIHogKyAwLjAwMSwgMCwgMCwgMSwgMCwgMS4wLCAwLFxuICAgICAgICAgICAgICAgIHBiX291dGVyWzFdWzBdLCBwYl9vdXRlclsxXVsxXSwgeiArIDAuMDAxLCAwLCAwLCAxLCAwLCAxLjAsIDBcbiAgICAgICAgICAgICk7XG4gICAgICAgIH1cblxuICAgICAgICBpZiAoR0xCdWlsZGVycy5kZWJ1ZyAmJiBsaW5lX2RlYnVnICYmIG9wdGlvbnMudmVydGV4X2xpbmVzKSB7XG4gICAgICAgICAgICB2YXIgZGNvbG9yO1xuICAgICAgICAgICAgaWYgKGxpbmVfZGVidWcgPT0gJ3BhcmFsbGVsJykge1xuICAgICAgICAgICAgICAgIC8vIGNvbnNvbGUubG9nKFwiISEhIGxpbmVzIGFyZSBwYXJhbGxlbCAhISFcIik7XG4gICAgICAgICAgICAgICAgZGNvbG9yID0gWzAsIDEsIDBdO1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgZWxzZSBpZiAobGluZV9kZWJ1ZyA9PSAnZGlzdGFuY2UnKSB7XG4gICAgICAgICAgICAgICAgLy8gY29uc29sZS5sb2coXCIhISEgbWl0ZXIgaW50ZXJzZWN0aW9uIHBvaW50IGV4Y2VlZGVkIGFsbG93ZWQgZGlzdGFuY2UgZnJvbSBqb2ludCAhISFcIik7XG4gICAgICAgICAgICAgICAgZGNvbG9yID0gWzEsIDAsIDBdO1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgLy8gY29uc29sZS5sb2coJ09TTSBpZDogJyArIGZlYXR1cmUuaWQpOyAvLyBUT0RPOiBpZiB0aGlzIGZ1bmN0aW9uIGlzIG1vdmVkIG91dCBvZiBhIGNsb3N1cmUsIHRoaXMgZmVhdHVyZSBkZWJ1ZyBpbmZvIHdvbid0IGJlIGF2YWlsYWJsZVxuICAgICAgICAgICAgLy8gY29uc29sZS5sb2coW3BhLCBqb2ludCwgcGJdKTtcbiAgICAgICAgICAgIC8vIGNvbnNvbGUubG9nKGZlYXR1cmUpO1xuICAgICAgICAgICAgb3B0aW9ucy52ZXJ0ZXhfbGluZXMucHVzaChcbiAgICAgICAgICAgICAgICBwYVswXSwgcGFbMV0sIHogKyAwLjAwMixcbiAgICAgICAgICAgICAgICAwLCAwLCAxLCBkY29sb3JbMF0sIGRjb2xvclsxXSwgZGNvbG9yWzJdLFxuICAgICAgICAgICAgICAgIGpvaW50WzBdLCBqb2ludFsxXSwgeiArIDAuMDAyLFxuICAgICAgICAgICAgICAgIDAsIDAsIDEsIGRjb2xvclswXSwgZGNvbG9yWzFdLCBkY29sb3JbMl0sXG4gICAgICAgICAgICAgICAgam9pbnRbMF0sIGpvaW50WzFdLCB6ICsgMC4wMDIsXG4gICAgICAgICAgICAgICAgMCwgMCwgMSwgZGNvbG9yWzBdLCBkY29sb3JbMV0sIGRjb2xvclsyXSxcbiAgICAgICAgICAgICAgICBwYlswXSwgcGJbMV0sIHogKyAwLjAwMixcbiAgICAgICAgICAgICAgICAwLCAwLCAxLCBkY29sb3JbMF0sIGRjb2xvclsxXSwgZGNvbG9yWzJdXG4gICAgICAgICAgICApO1xuXG4gICAgICAgICAgICB2YXIgbnVtX2xpbmVzID0gbGluZXMubGVuZ3RoO1xuICAgICAgICAgICAgZm9yICh2YXIgbG49MDsgbG4gPCBudW1fbGluZXM7IGxuKyspIHtcbiAgICAgICAgICAgICAgICB2YXIgbGluZTIgPSBsaW5lc1tsbl07XG5cbiAgICAgICAgICAgICAgICBmb3IgKHZhciBwPTA7IHAgPCBsaW5lMi5sZW5ndGggLSAxOyBwKyspIHtcbiAgICAgICAgICAgICAgICAgICAgLy8gUG9pbnQgQSB0byBCXG4gICAgICAgICAgICAgICAgICAgIHZhciBwYSA9IGxpbmUyW3BdO1xuICAgICAgICAgICAgICAgICAgICB2YXIgcGIgPSBsaW5lMltwKzFdO1xuXG4gICAgICAgICAgICAgICAgICAgIG9wdGlvbnMudmVydGV4X2xpbmVzLnB1c2goXG4gICAgICAgICAgICAgICAgICAgICAgICBwYVswXSwgcGFbMV0sIHogKyAwLjAwMDUsXG4gICAgICAgICAgICAgICAgICAgICAgICAwLCAwLCAxLCAwLCAwLCAxLjAsXG4gICAgICAgICAgICAgICAgICAgICAgICBwYlswXSwgcGJbMV0sIHogKyAwLjAwMDUsXG4gICAgICAgICAgICAgICAgICAgICAgICAwLCAwLCAxLCAwLCAwLCAxLjBcbiAgICAgICAgICAgICAgICAgICAgKTtcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICB9O1xuICAgICAgICB9XG4gICAgfVxuXG4gICAgcmV0dXJuIHZlcnRleF9kYXRhO1xufTtcblxuLy8gQnVpbGQgYSBxdWFkIGNlbnRlcmVkIG9uIGEgcG9pbnRcbi8vIFogY29vcmQsIG5vcm1hbHMsIGFuZCB0ZXhjb29yZHMgYXJlIG9wdGlvbmFsXG4vLyBMYXlvdXQgb3JkZXIgaXM6XG4vLyAgIHBvc2l0aW9uICgyIG9yIDMgY29tcG9uZW50cylcbi8vICAgdGV4Y29vcmQgKG9wdGlvbmFsLCAyIGNvbXBvbmVudHMpXG4vLyAgIG5vcm1hbCAob3B0aW9uYWwsIDMgY29tcG9uZW50cylcbi8vICAgY29uc3RhbnRzIChvcHRpb25hbClcbkdMQnVpbGRlcnMuYnVpbGRRdWFkc0ZvclBvaW50cyA9IGZ1bmN0aW9uIChwb2ludHMsIHdpZHRoLCBoZWlnaHQsIHosIHZlcnRleF9kYXRhLCBvcHRpb25zKVxue1xuICAgIHZhciBvcHRpb25zID0gb3B0aW9ucyB8fCB7fTtcblxuICAgIHZhciB2ZXJ0ZXhfY29uc3RhbnRzID0gW107XG4gICAgaWYgKG9wdGlvbnMubm9ybWFscykge1xuICAgICAgICB2ZXJ0ZXhfY29uc3RhbnRzLnB1c2goMCwgMCwgMSk7IC8vIHVwd2FyZHMtZmFjaW5nIG5vcm1hbFxuICAgIH1cbiAgICBpZiAob3B0aW9ucy52ZXJ0ZXhfY29uc3RhbnRzKSB7XG4gICAgICAgIHZlcnRleF9jb25zdGFudHMucHVzaC5hcHBseSh2ZXJ0ZXhfY29uc3RhbnRzLCBvcHRpb25zLnZlcnRleF9jb25zdGFudHMpO1xuICAgIH1cbiAgICBpZiAodmVydGV4X2NvbnN0YW50cy5sZW5ndGggPT0gMCkge1xuICAgICAgICB2ZXJ0ZXhfY29uc3RhbnRzID0gbnVsbDtcbiAgICB9XG5cbiAgICB2YXIgbnVtX3BvaW50cyA9IHBvaW50cy5sZW5ndGg7XG4gICAgZm9yICh2YXIgcD0wOyBwIDwgbnVtX3BvaW50czsgcCsrKSB7XG4gICAgICAgIHZhciBwb2ludCA9IHBvaW50c1twXTtcblxuICAgICAgICB2YXIgcG9zaXRpb25zID0gW1xuICAgICAgICAgICAgW3BvaW50WzBdIC0gd2lkdGgvMiwgcG9pbnRbMV0gLSBoZWlnaHQvMl0sXG4gICAgICAgICAgICBbcG9pbnRbMF0gKyB3aWR0aC8yLCBwb2ludFsxXSAtIGhlaWdodC8yXSxcbiAgICAgICAgICAgIFtwb2ludFswXSArIHdpZHRoLzIsIHBvaW50WzFdICsgaGVpZ2h0LzJdLFxuXG4gICAgICAgICAgICBbcG9pbnRbMF0gLSB3aWR0aC8yLCBwb2ludFsxXSAtIGhlaWdodC8yXSxcbiAgICAgICAgICAgIFtwb2ludFswXSArIHdpZHRoLzIsIHBvaW50WzFdICsgaGVpZ2h0LzJdLFxuICAgICAgICAgICAgW3BvaW50WzBdIC0gd2lkdGgvMiwgcG9pbnRbMV0gKyBoZWlnaHQvMl0sXG4gICAgICAgIF07XG5cbiAgICAgICAgLy8gQWRkIHByb3ZpZGVkIHpcbiAgICAgICAgaWYgKHogIT0gbnVsbCkge1xuICAgICAgICAgICAgcG9zaXRpb25zWzBdWzJdID0gejtcbiAgICAgICAgICAgIHBvc2l0aW9uc1sxXVsyXSA9IHo7XG4gICAgICAgICAgICBwb3NpdGlvbnNbMl1bMl0gPSB6O1xuICAgICAgICAgICAgcG9zaXRpb25zWzNdWzJdID0gejtcbiAgICAgICAgICAgIHBvc2l0aW9uc1s0XVsyXSA9IHo7XG4gICAgICAgICAgICBwb3NpdGlvbnNbNV1bMl0gPSB6O1xuICAgICAgICB9XG5cbiAgICAgICAgaWYgKG9wdGlvbnMudGV4Y29vcmRzID09IHRydWUpIHtcbiAgICAgICAgICAgIHZhciB0ZXhjb29yZHMgPSBbXG4gICAgICAgICAgICAgICAgWy0xLCAtMV0sXG4gICAgICAgICAgICAgICAgWzEsIC0xXSxcbiAgICAgICAgICAgICAgICBbMSwgMV0sXG5cbiAgICAgICAgICAgICAgICBbLTEsIC0xXSxcbiAgICAgICAgICAgICAgICBbMSwgMV0sXG4gICAgICAgICAgICAgICAgWy0xLCAxXVxuICAgICAgICAgICAgXTtcblxuICAgICAgICAgICAgR0wuYWRkVmVydGljZXNNdWx0aXBsZUF0dHJpYnV0ZXMoW3Bvc2l0aW9ucywgdGV4Y29vcmRzXSwgdmVydGV4X2NvbnN0YW50cywgdmVydGV4X2RhdGEpO1xuICAgICAgICB9XG4gICAgICAgIGVsc2Uge1xuICAgICAgICAgICAgR0wuYWRkVmVydGljZXMocG9zaXRpb25zLCB2ZXJ0ZXhfY29uc3RhbnRzLCB2ZXJ0ZXhfZGF0YSk7XG4gICAgICAgIH1cbiAgICB9XG5cbiAgICByZXR1cm4gdmVydGV4X2RhdGE7XG59O1xuXG4vLyBDYWxsYmFjay1iYXNlIGJ1aWxkZXIgKGZvciBmdXR1cmUgZXhwbG9yYXRpb24pXG4vLyBHTEJ1aWxkZXJzLmJ1aWxkUXVhZHNGb3JQb2ludHMyID0gZnVuY3Rpb24gR0xCdWlsZGVyc0J1aWxkUXVhZHNGb3JQb2ludHMgKHBvaW50cywgd2lkdGgsIGhlaWdodCwgYWRkR2VvbWV0cnksIG9wdGlvbnMpXG4vLyB7XG4vLyAgICAgdmFyIG9wdGlvbnMgPSBvcHRpb25zIHx8IHt9O1xuXG4vLyAgICAgdmFyIG51bV9wb2ludHMgPSBwb2ludHMubGVuZ3RoO1xuLy8gICAgIGZvciAodmFyIHA9MDsgcCA8IG51bV9wb2ludHM7IHArKykge1xuLy8gICAgICAgICB2YXIgcG9pbnQgPSBwb2ludHNbcF07XG5cbi8vICAgICAgICAgdmFyIHBvc2l0aW9ucyA9IFtcbi8vICAgICAgICAgICAgIFtwb2ludFswXSAtIHdpZHRoLzIsIHBvaW50WzFdIC0gaGVpZ2h0LzJdLFxuLy8gICAgICAgICAgICAgW3BvaW50WzBdICsgd2lkdGgvMiwgcG9pbnRbMV0gLSBoZWlnaHQvMl0sXG4vLyAgICAgICAgICAgICBbcG9pbnRbMF0gKyB3aWR0aC8yLCBwb2ludFsxXSArIGhlaWdodC8yXSxcblxuLy8gICAgICAgICAgICAgW3BvaW50WzBdIC0gd2lkdGgvMiwgcG9pbnRbMV0gLSBoZWlnaHQvMl0sXG4vLyAgICAgICAgICAgICBbcG9pbnRbMF0gKyB3aWR0aC8yLCBwb2ludFsxXSArIGhlaWdodC8yXSxcbi8vICAgICAgICAgICAgIFtwb2ludFswXSAtIHdpZHRoLzIsIHBvaW50WzFdICsgaGVpZ2h0LzJdLFxuLy8gICAgICAgICBdO1xuXG4vLyAgICAgICAgIGlmIChvcHRpb25zLnRleGNvb3JkcyA9PSB0cnVlKSB7XG4vLyAgICAgICAgICAgICB2YXIgdGV4Y29vcmRzID0gW1xuLy8gICAgICAgICAgICAgICAgIFstMSwgLTFdLFxuLy8gICAgICAgICAgICAgICAgIFsxLCAtMV0sXG4vLyAgICAgICAgICAgICAgICAgWzEsIDFdLFxuXG4vLyAgICAgICAgICAgICAgICAgWy0xLCAtMV0sXG4vLyAgICAgICAgICAgICAgICAgWzEsIDFdLFxuLy8gICAgICAgICAgICAgICAgIFstMSwgMV1cbi8vICAgICAgICAgICAgIF07XG4vLyAgICAgICAgIH1cblxuLy8gICAgICAgICB2YXIgdmVydGljZXMgPSB7XG4vLyAgICAgICAgICAgICBwb3NpdGlvbnM6IHBvc2l0aW9ucyxcbi8vICAgICAgICAgICAgIG5vcm1hbHM6IChvcHRpb25zLm5vcm1hbHMgPyBbMCwgMCwgMV0gOiBudWxsKSxcbi8vICAgICAgICAgICAgIHRleGNvb3JkczogKG9wdGlvbnMudGV4Y29vcmRzICYmIHRleGNvb3Jkcylcbi8vICAgICAgICAgfTtcbi8vICAgICAgICAgYWRkR2VvbWV0cnkodmVydGljZXMpO1xuLy8gICAgIH1cbi8vIH07XG5cbi8vIEJ1aWxkIG5hdGl2ZSBHTCBsaW5lcyBmb3IgYSBwb2x5bGluZVxuR0xCdWlsZGVycy5idWlsZExpbmVzID0gZnVuY3Rpb24gR0xCdWlsZGVyc0J1aWxkTGluZXMgKGxpbmVzLCBmZWF0dXJlLCBsYXllciwgc3R5bGUsIHRpbGUsIHosIHZlcnRleF9kYXRhLCBvcHRpb25zKVxue1xuICAgIG9wdGlvbnMgPSBvcHRpb25zIHx8IHt9O1xuXG4gICAgdmFyIGNvbG9yID0gc3R5bGUuY29sb3I7XG4gICAgdmFyIHdpZHRoID0gc3R5bGUud2lkdGg7XG5cbiAgICB2YXIgbnVtX2xpbmVzID0gbGluZXMubGVuZ3RoO1xuICAgIGZvciAodmFyIGxuPTA7IGxuIDwgbnVtX2xpbmVzOyBsbisrKSB7XG4gICAgICAgIHZhciBsaW5lID0gbGluZXNbbG5dO1xuXG4gICAgICAgIGZvciAodmFyIHA9MDsgcCA8IGxpbmUubGVuZ3RoIC0gMTsgcCsrKSB7XG4gICAgICAgICAgICAvLyBQb2ludCBBIHRvIEJcbiAgICAgICAgICAgIHZhciBwYSA9IGxpbmVbcF07XG4gICAgICAgICAgICB2YXIgcGIgPSBsaW5lW3ArMV07XG5cbiAgICAgICAgICAgIHZlcnRleF9kYXRhLnB1c2goXG4gICAgICAgICAgICAgICAgLy8gUG9pbnQgQVxuICAgICAgICAgICAgICAgIHBhWzBdLCBwYVsxXSwgeixcbiAgICAgICAgICAgICAgICAwLCAwLCAxLCAvLyBmbGF0IHN1cmZhY2VzIHBvaW50IHN0cmFpZ2h0IHVwXG4gICAgICAgICAgICAgICAgY29sb3JbMF0sIGNvbG9yWzFdLCBjb2xvclsyXSxcbiAgICAgICAgICAgICAgICAvLyBQb2ludCBCXG4gICAgICAgICAgICAgICAgcGJbMF0sIHBiWzFdLCB6LFxuICAgICAgICAgICAgICAgIDAsIDAsIDEsIC8vIGZsYXQgc3VyZmFjZXMgcG9pbnQgc3RyYWlnaHQgdXBcbiAgICAgICAgICAgICAgICBjb2xvclswXSwgY29sb3JbMV0sIGNvbG9yWzJdXG4gICAgICAgICAgICApO1xuICAgICAgICB9XG4gICAgfTtcblxuICAgIHJldHVybiB2ZXJ0ZXhfZGF0YTtcbn07XG5cbi8qIFV0aWxpdHkgZnVuY3Rpb25zICovXG5cbi8vIFRlc3RzIGlmIGEgbGluZSBzZWdtZW50IChmcm9tIHBvaW50IEEgdG8gQikgaXMgbmVhcmx5IGNvaW5jaWRlbnQgd2l0aCB0aGUgZWRnZSBvZiBhIHRpbGVcbkdMQnVpbGRlcnMuaXNPblRpbGVFZGdlID0gZnVuY3Rpb24gKHBhLCBwYiwgb3B0aW9ucylcbntcbiAgICBvcHRpb25zID0gb3B0aW9ucyB8fCB7fTtcblxuICAgIHZhciB0b2xlcmFuY2VfZnVuY3Rpb24gPSBvcHRpb25zLnRvbGVyYW5jZV9mdW5jdGlvbiB8fCBHTEJ1aWxkZXJzLnZhbHVlc1dpdGhpblRvbGVyYW5jZTtcbiAgICB2YXIgdG9sZXJhbmNlID0gb3B0aW9ucy50b2xlcmFuY2UgfHwgMTsgLy8gdHdlYWsgdGhpcyBhZGp1c3QgaWYgY2F0Y2hpbmcgdG9vIGZldy9tYW55IGxpbmUgc2VnbWVudHMgbmVhciB0aWxlIGVkZ2VzXG4gICAgdmFyIHRpbGVfbWluID0gR0xCdWlsZGVycy50aWxlX2JvdW5kc1swXTtcbiAgICB2YXIgdGlsZV9tYXggPSBHTEJ1aWxkZXJzLnRpbGVfYm91bmRzWzFdO1xuICAgIHZhciBlZGdlID0gbnVsbDtcblxuICAgIGlmICh0b2xlcmFuY2VfZnVuY3Rpb24ocGFbMF0sIHRpbGVfbWluLngsIHRvbGVyYW5jZSkgJiYgdG9sZXJhbmNlX2Z1bmN0aW9uKHBiWzBdLCB0aWxlX21pbi54LCB0b2xlcmFuY2UpKSB7XG4gICAgICAgIGVkZ2UgPSAnbGVmdCc7XG4gICAgfVxuICAgIGVsc2UgaWYgKHRvbGVyYW5jZV9mdW5jdGlvbihwYVswXSwgdGlsZV9tYXgueCwgdG9sZXJhbmNlKSAmJiB0b2xlcmFuY2VfZnVuY3Rpb24ocGJbMF0sIHRpbGVfbWF4LngsIHRvbGVyYW5jZSkpIHtcbiAgICAgICAgZWRnZSA9ICdyaWdodCc7XG4gICAgfVxuICAgIGVsc2UgaWYgKHRvbGVyYW5jZV9mdW5jdGlvbihwYVsxXSwgdGlsZV9taW4ueSwgdG9sZXJhbmNlKSAmJiB0b2xlcmFuY2VfZnVuY3Rpb24ocGJbMV0sIHRpbGVfbWluLnksIHRvbGVyYW5jZSkpIHtcbiAgICAgICAgZWRnZSA9ICd0b3AnO1xuICAgIH1cbiAgICBlbHNlIGlmICh0b2xlcmFuY2VfZnVuY3Rpb24ocGFbMV0sIHRpbGVfbWF4LnksIHRvbGVyYW5jZSkgJiYgdG9sZXJhbmNlX2Z1bmN0aW9uKHBiWzFdLCB0aWxlX21heC55LCB0b2xlcmFuY2UpKSB7XG4gICAgICAgIGVkZ2UgPSAnYm90dG9tJztcbiAgICB9XG4gICAgcmV0dXJuIGVkZ2U7XG59O1xuXG5HTEJ1aWxkZXJzLnNldFRpbGVTY2FsZSA9IGZ1bmN0aW9uIChzY2FsZSlcbntcbiAgICBHTEJ1aWxkZXJzLnRpbGVfYm91bmRzID0gW1xuICAgICAgICBQb2ludCgwLCAwKSxcbiAgICAgICAgUG9pbnQoc2NhbGUsIC1zY2FsZSkgLy8gVE9ETzogY29ycmVjdCBmb3IgZmxpcHBlZCB5LWF4aXM/XG4gICAgXTtcbn07XG5cbkdMQnVpbGRlcnMudmFsdWVzV2l0aGluVG9sZXJhbmNlID0gZnVuY3Rpb24gKGEsIGIsIHRvbGVyYW5jZSlcbntcbiAgICB0b2xlcmFuY2UgPSB0b2xlcmFuY2UgfHwgMTtcbiAgICByZXR1cm4gKE1hdGguYWJzKGEgLSBiKSA8IHRvbGVyYW5jZSk7XG59O1xuXG4vLyBCdWlsZCBhIHppZ3phZyBsaW5lIHBhdHRlcm4gZm9yIHRlc3Rpbmcgam9pbnMgYW5kIGNhcHNcbkdMQnVpbGRlcnMuYnVpbGRaaWd6YWdMaW5lVGVzdFBhdHRlcm4gPSBmdW5jdGlvbiAoKVxue1xuICAgIHZhciBtaW4gPSBQb2ludCgwLCAwKTsgLy8gdGlsZS5taW47XG4gICAgdmFyIG1heCA9IFBvaW50KDQwOTYsIDQwOTYpOyAvLyB0aWxlLm1heDtcbiAgICB2YXIgZyA9IHtcbiAgICAgICAgaWQ6IDEyMyxcbiAgICAgICAgZ2VvbWV0cnk6IHtcbiAgICAgICAgICAgIHR5cGU6ICdMaW5lU3RyaW5nJyxcbiAgICAgICAgICAgIGNvb3JkaW5hdGVzOiBbXG4gICAgICAgICAgICAgICAgW21pbi54ICogMC43NSArIG1heC54ICogMC4yNSwgbWluLnkgKiAwLjc1ICsgbWF4LnkgKiAwLjI1XSxcbiAgICAgICAgICAgICAgICBbbWluLnggKiAwLjc1ICsgbWF4LnggKiAwLjI1LCBtaW4ueSAqIDAuNSArIG1heC55ICogMC41XSxcbiAgICAgICAgICAgICAgICBbbWluLnggKiAwLjI1ICsgbWF4LnggKiAwLjc1LCBtaW4ueSAqIDAuNzUgKyBtYXgueSAqIDAuMjVdLFxuICAgICAgICAgICAgICAgIFttaW4ueCAqIDAuMjUgKyBtYXgueCAqIDAuNzUsIG1pbi55ICogMC4yNSArIG1heC55ICogMC43NV0sXG4gICAgICAgICAgICAgICAgW21pbi54ICogMC40ICsgbWF4LnggKiAwLjYsIG1pbi55ICogMC41ICsgbWF4LnkgKiAwLjVdLFxuICAgICAgICAgICAgICAgIFttaW4ueCAqIDAuNSArIG1heC54ICogMC41LCBtaW4ueSAqIDAuMjUgKyBtYXgueSAqIDAuNzVdLFxuICAgICAgICAgICAgICAgIFttaW4ueCAqIDAuNzUgKyBtYXgueCAqIDAuMjUsIG1pbi55ICogMC4yNSArIG1heC55ICogMC43NV0sXG4gICAgICAgICAgICAgICAgW21pbi54ICogMC43NSArIG1heC54ICogMC4yNSwgbWluLnkgKiAwLjQgKyBtYXgueSAqIDAuNl1cbiAgICAgICAgICAgIF1cbiAgICAgICAgfSxcbiAgICAgICAgcHJvcGVydGllczoge1xuICAgICAgICAgICAga2luZDogJ2RlYnVnJ1xuICAgICAgICB9XG4gICAgfTtcbiAgICAvLyBjb25zb2xlLmxvZyhnLmdlb21ldHJ5LmNvb3JkaW5hdGVzKTtcbiAgICByZXR1cm4gZztcbn07XG4iLCIvKioqIE1hbmFnZSByZW5kZXJpbmcgZm9yIHByaW1pdGl2ZXMgKioqL1xuaW1wb3J0IHtHTH0gZnJvbSAnLi9nbCc7XG5pbXBvcnQgR0xWZXJ0ZXhMYXlvdXQgZnJvbSAnLi9nbF92ZXJ0ZXhfbGF5b3V0JztcbmltcG9ydCBHTFByb2dyYW0gZnJvbSAnLi9nbF9wcm9ncmFtJztcblxuLy8gQSBzaW5nbGUgbWVzaC9WQk8sIGRlc2NyaWJlZCBieSBhIHZlcnRleCBsYXlvdXQsIHRoYXQgY2FuIGJlIGRyYXduIHdpdGggb25lIG9yIG1vcmUgcHJvZ3JhbXNcbmV4cG9ydCBkZWZhdWx0IGZ1bmN0aW9uIEdMR2VvbWV0cnkgKGdsLCB2ZXJ0ZXhfZGF0YSwgdmVydGV4X2xheW91dCwgb3B0aW9ucylcbntcbiAgICBvcHRpb25zID0gb3B0aW9ucyB8fCB7fTtcblxuICAgIHRoaXMuZ2wgPSBnbDtcbiAgICB0aGlzLnZlcnRleF9kYXRhID0gdmVydGV4X2RhdGE7IC8vIEZsb2F0MzJBcnJheVxuICAgIHRoaXMudmVydGV4X2xheW91dCA9IHZlcnRleF9sYXlvdXQ7XG4gICAgdGhpcy5idWZmZXIgPSB0aGlzLmdsLmNyZWF0ZUJ1ZmZlcigpO1xuICAgIHRoaXMuZHJhd19tb2RlID0gb3B0aW9ucy5kcmF3X21vZGUgfHwgdGhpcy5nbC5UUklBTkdMRVM7XG4gICAgdGhpcy5kYXRhX3VzYWdlID0gb3B0aW9ucy5kYXRhX3VzYWdlIHx8IHRoaXMuZ2wuU1RBVElDX0RSQVc7XG4gICAgdGhpcy52ZXJ0aWNlc19wZXJfZ2VvbWV0cnkgPSAzOyAvLyBUT0RPOiBzdXBwb3J0IGxpbmVzLCBzdHJpcCwgZmFuLCBldGMuXG5cbiAgICB0aGlzLnZlcnRleF9jb3VudCA9IHRoaXMudmVydGV4X2RhdGEuYnl0ZUxlbmd0aCAvIHRoaXMudmVydGV4X2xheW91dC5zdHJpZGU7XG4gICAgdGhpcy5nZW9tZXRyeV9jb3VudCA9IHRoaXMudmVydGV4X2NvdW50IC8gdGhpcy52ZXJ0aWNlc19wZXJfZ2VvbWV0cnk7XG5cbiAgICAvLyBUT0RPOiBkaXNhYmxpbmcgVkFPcyBmb3Igbm93IGJlY2F1c2Ugd2UgbmVlZCB0byBzdXBwb3J0IGRpZmZlcmVudCB2ZXJ0ZXggbGF5b3V0ICsgcHJvZ3JhbSBjb21iaW5hdGlvbnMsXG4gICAgLy8gd2hlcmUgbm90IGFsbCBwcm9ncmFtcyB3aWxsIHJlY29nbml6ZSBhbGwgYXR0cmlidXRlcyAoZS5nLiBmZWF0dXJlIHNlbGVjdGlvbiBzaGFkZXJzIGluY2x1ZGUgZXh0cmEgYXR0cmliKS5cbiAgICAvLyBUbyBzdXBwb3J0IFZBT3MgaGVyZSwgd291bGQgbmVlZCB0byBzdXBwb3J0IG11bHRpcGxlIHBlciBnZW9tZXRyeSwga2V5ZWQgYnkgR0wgcHJvZ3JhbT9cbiAgICAvLyB0aGlzLnZhbyA9IEdMVmVydGV4QXJyYXlPYmplY3QuY3JlYXRlKGZ1bmN0aW9uKCkge1xuICAgIC8vICAgICB0aGlzLmdsLmJpbmRCdWZmZXIodGhpcy5nbC5BUlJBWV9CVUZGRVIsIHRoaXMuYnVmZmVyKTtcbiAgICAvLyAgICAgdGhpcy5zZXR1cCgpO1xuICAgIC8vIH0uYmluZCh0aGlzKSk7XG5cbiAgICB0aGlzLmdsLmJpbmRCdWZmZXIodGhpcy5nbC5BUlJBWV9CVUZGRVIsIHRoaXMuYnVmZmVyKTtcbiAgICB0aGlzLmdsLmJ1ZmZlckRhdGEodGhpcy5nbC5BUlJBWV9CVUZGRVIsIHRoaXMudmVydGV4X2RhdGEsIHRoaXMuZGF0YV91c2FnZSk7XG59XG5cbi8vIFJlbmRlciwgYnkgZGVmYXVsdCB3aXRoIGN1cnJlbnRseSBib3VuZCBwcm9ncmFtLCBvciBvdGhlcndpc2Ugd2l0aCBvcHRpb25hbGx5IHByb3ZpZGVkIG9uZVxuR0xHZW9tZXRyeS5wcm90b3R5cGUucmVuZGVyID0gZnVuY3Rpb24gKG9wdGlvbnMpXG57XG4gICAgb3B0aW9ucyA9IG9wdGlvbnMgfHwge307XG5cbiAgICAvLyBHTFZlcnRleEFycmF5T2JqZWN0LmJpbmQodGhpcy52YW8pO1xuXG4gICAgaWYgKHR5cGVvZiB0aGlzLl9yZW5kZXJfc2V0dXAgPT0gJ2Z1bmN0aW9uJykge1xuICAgICAgICB0aGlzLl9yZW5kZXJfc2V0dXAoKTtcbiAgICB9XG5cbiAgICB2YXIgZ2xfcHJvZ3JhbSA9IG9wdGlvbnMuZ2xfcHJvZ3JhbSB8fCBHTFByb2dyYW0uY3VycmVudDtcbiAgICBnbF9wcm9ncmFtLnVzZSgpO1xuXG4gICAgdGhpcy5nbC5iaW5kQnVmZmVyKHRoaXMuZ2wuQVJSQVlfQlVGRkVSLCB0aGlzLmJ1ZmZlcik7XG4gICAgdGhpcy52ZXJ0ZXhfbGF5b3V0LmVuYWJsZSh0aGlzLmdsLCBnbF9wcm9ncmFtKTtcblxuICAgIC8vIFRPRE86IHN1cHBvcnQgZWxlbWVudCBhcnJheSBtb2RlXG4gICAgdGhpcy5nbC5kcmF3QXJyYXlzKHRoaXMuZHJhd19tb2RlLCAwLCB0aGlzLnZlcnRleF9jb3VudCk7XG4gICAgLy8gR0xWZXJ0ZXhBcnJheU9iamVjdC5iaW5kKG51bGwpO1xufTtcblxuR0xHZW9tZXRyeS5wcm90b3R5cGUuZGVzdHJveSA9IGZ1bmN0aW9uICgpXG57XG4gICAgY29uc29sZS5sb2coXCJHTEdlb21ldHJ5LmRlc3Ryb3k6IGRlbGV0ZSBidWZmZXIgb2Ygc2l6ZSBcIiArIHRoaXMudmVydGV4X2RhdGEuYnl0ZUxlbmd0aCk7XG4gICAgdGhpcy5nbC5kZWxldGVCdWZmZXIodGhpcy5idWZmZXIpO1xuICAgIGRlbGV0ZSB0aGlzLnZlcnRleF9kYXRhO1xufTtcbiIsIi8vIFJlbmRlcmluZyBtb2Rlc1xuaW1wb3J0IHtHTH0gZnJvbSAnLi9nbCc7XG5pbXBvcnQgR0xWZXJ0ZXhMYXlvdXQgZnJvbSAnLi9nbF92ZXJ0ZXhfbGF5b3V0JztcbmltcG9ydCB7R0xCdWlsZGVyc30gZnJvbSAnLi9nbF9idWlsZGVycyc7XG5pbXBvcnQgR0xQcm9ncmFtIGZyb20gJy4vZ2xfcHJvZ3JhbSc7XG5pbXBvcnQgR0xHZW9tZXRyeSBmcm9tICcuL2dsX2dlb20nO1xuXG52YXIgc2hhZGVyX3NvdXJjZXMgPSByZXF1aXJlKCcuL2dsX3NoYWRlcnMnKTsgLy8gYnVpbHQtaW4gc2hhZGVyc1xuXG5pbXBvcnQgKiBhcyBRdWV1ZSBmcm9tICdxdWV1ZS1hc3luYyc7XG5cbmV4cG9ydCB2YXIgTW9kZXMgPSB7fTtcbmV4cG9ydCB2YXIgTW9kZU1hbmFnZXIgPSB7fTtcblxuXG4vLyBCYXNlXG5cbnZhciBSZW5kZXJNb2RlID0ge1xuICAgIGluaXQ6IGZ1bmN0aW9uIChnbCkge1xuICAgICAgICB0aGlzLmdsID0gZ2w7XG4gICAgICAgIHRoaXMubWFrZUdMUHJvZ3JhbSgpO1xuXG4gICAgICAgIGlmICh0eXBlb2YgdGhpcy5faW5pdCA9PSAnZnVuY3Rpb24nKSB7XG4gICAgICAgICAgICB0aGlzLl9pbml0KCk7XG4gICAgICAgIH1cbiAgICB9LFxuICAgIHJlZnJlc2g6IGZ1bmN0aW9uICgpIHsgLy8gVE9ETzogc2hvdWxkIHRoaXMgYmUgYXN5bmMvbm9uLWJsb2NraW5nP1xuICAgICAgICB0aGlzLm1ha2VHTFByb2dyYW0oKTtcbiAgICB9LFxuICAgIGRlZmluZXM6IHt9LFxuICAgIHNlbGVjdGlvbjogZmFsc2UsXG4gICAgYnVpbGRQb2x5Z29uczogZnVuY3Rpb24oKXt9LCAvLyBidWlsZCBmdW5jdGlvbnMgYXJlIG5vLW9wcyB1bnRpbCBvdmVycmlkZW5cbiAgICBidWlsZExpbmVzOiBmdW5jdGlvbigpe30sXG4gICAgYnVpbGRQb2ludHM6IGZ1bmN0aW9uKCl7fSxcbiAgICBtYWtlR0xHZW9tZXRyeTogZnVuY3Rpb24gKHZlcnRleF9kYXRhKSB7XG4gICAgICAgIHJldHVybiBuZXcgR0xHZW9tZXRyeSh0aGlzLmdsLCB2ZXJ0ZXhfZGF0YSwgdGhpcy52ZXJ0ZXhfbGF5b3V0KTtcbiAgICB9XG59O1xuXG5SZW5kZXJNb2RlLm1ha2VHTFByb2dyYW0gPSBmdW5jdGlvbiAoKVxue1xuICAgIC8vIGNvbnNvbGUubG9nKHRoaXMubmFtZSArIFwiOiBcIiArIFwic3RhcnQgYnVpbGRpbmdcIik7XG4gICAgdmFyIHF1ZXVlID0gUXVldWUoKTtcblxuICAgIC8vIEJ1aWxkIGRlZmluZXMgJiBmb3Igc2VsZWN0aW9uIChuZWVkIHRvIGNyZWF0ZSBhIG5ldyBvYmplY3Qgc2luY2UgdGhlIGZpcnN0IGlzIHN0b3JlZCBhcyBhIHJlZmVyZW5jZSBieSB0aGUgcHJvZ3JhbSlcbiAgICB2YXIgZGVmaW5lcyA9IHRoaXMuYnVpbGREZWZpbmVMaXN0KCk7XG4gICAgaWYgKHRoaXMuc2VsZWN0aW9uKSB7XG4gICAgICAgIHZhciBzZWxlY3Rpb25fZGVmaW5lcyA9IE9iamVjdC5jcmVhdGUoZGVmaW5lcyk7XG4gICAgICAgIHNlbGVjdGlvbl9kZWZpbmVzWydGRUFUVVJFX1NFTEVDVElPTiddID0gdHJ1ZTtcbiAgICB9XG5cbiAgICAvLyBHZXQgYW55IGN1c3RvbSBjb2RlIHRyYW5zZm9ybXNcbiAgICB2YXIgdHJhbnNmb3JtcyA9ICh0aGlzLnNoYWRlcnMgJiYgdGhpcy5zaGFkZXJzLnRyYW5zZm9ybXMpO1xuXG4gICAgLy8gQ3JlYXRlIHNoYWRlcnMgLSBwcm9ncmFtcyBtYXkgcG9pbnQgdG8gaW5oZXJpdGVkIHBhcmVudCBwcm9wZXJ0aWVzLCBidXQgc2hvdWxkIGJlIHJlcGxhY2VkIGJ5IHN1YmNsYXNzIHZlcnNpb25cbiAgICB2YXIgcHJvZ3JhbSA9ICh0aGlzLmhhc093blByb3BlcnR5KCdnbF9wcm9ncmFtJykgJiYgdGhpcy5nbF9wcm9ncmFtKTtcbiAgICB2YXIgc2VsZWN0aW9uX3Byb2dyYW0gPSAodGhpcy5oYXNPd25Qcm9wZXJ0eSgnc2VsZWN0aW9uX2dsX3Byb2dyYW0nKSAmJiB0aGlzLnNlbGVjdGlvbl9nbF9wcm9ncmFtKTtcblxuICAgIHF1ZXVlLmRlZmVyKGNvbXBsZXRlID0+IHtcbiAgICAgICAgaWYgKCFwcm9ncmFtKSB7XG4gICAgICAgICAgICAvLyBjb25zb2xlLmxvZyh0aGlzLm5hbWUgKyBcIjogXCIgKyBcImluc3RhbnRpYXRlXCIpO1xuICAgICAgICAgICAgcHJvZ3JhbSA9IG5ldyBHTFByb2dyYW0oXG4gICAgICAgICAgICAgICAgdGhpcy5nbCxcbiAgICAgICAgICAgICAgICBzaGFkZXJfc291cmNlc1t0aGlzLnZlcnRleF9zaGFkZXJfa2V5XSxcbiAgICAgICAgICAgICAgICBzaGFkZXJfc291cmNlc1t0aGlzLmZyYWdtZW50X3NoYWRlcl9rZXldLFxuICAgICAgICAgICAgICAgIHtcbiAgICAgICAgICAgICAgICAgICAgZGVmaW5lczogZGVmaW5lcyxcbiAgICAgICAgICAgICAgICAgICAgdHJhbnNmb3JtczogdHJhbnNmb3JtcyxcbiAgICAgICAgICAgICAgICAgICAgbmFtZTogdGhpcy5uYW1lLFxuICAgICAgICAgICAgICAgICAgICBjYWxsYmFjazogY29tcGxldGVcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICApO1xuICAgICAgICB9XG4gICAgICAgIGVsc2Uge1xuICAgICAgICAgICAgLy8gY29uc29sZS5sb2codGhpcy5uYW1lICsgXCI6IFwiICsgXCJyZS1jb21waWxlXCIpO1xuICAgICAgICAgICAgcHJvZ3JhbS5kZWZpbmVzID0gZGVmaW5lcztcbiAgICAgICAgICAgIHByb2dyYW0udHJhbnNmb3JtcyA9IHRyYW5zZm9ybXM7XG4gICAgICAgICAgICBwcm9ncmFtLmNvbXBpbGUoY29tcGxldGUpO1xuICAgICAgICB9XG4gICAgfSk7XG5cbiAgICBpZiAodGhpcy5zZWxlY3Rpb24pIHtcbiAgICAgICAgcXVldWUuZGVmZXIoY29tcGxldGUgPT4ge1xuICAgICAgICAgICAgaWYgKCFzZWxlY3Rpb25fcHJvZ3JhbSkge1xuICAgICAgICAgICAgICAgIC8vIGNvbnNvbGUubG9nKHRoaXMubmFtZSArIFwiOiBcIiArIFwic2VsZWN0aW9uIGluc3RhbnRpYXRlXCIpO1xuICAgICAgICAgICAgICAgIHNlbGVjdGlvbl9wcm9ncmFtID0gbmV3IEdMUHJvZ3JhbShcbiAgICAgICAgICAgICAgICAgICAgdGhpcy5nbCxcbiAgICAgICAgICAgICAgICAgICAgc2hhZGVyX3NvdXJjZXNbdGhpcy52ZXJ0ZXhfc2hhZGVyX2tleV0sXG4gICAgICAgICAgICAgICAgICAgIHNoYWRlcl9zb3VyY2VzWydzZWxlY3Rpb25fZnJhZ21lbnQnXSxcbiAgICAgICAgICAgICAgICAgICAge1xuICAgICAgICAgICAgICAgICAgICAgICAgZGVmaW5lczogc2VsZWN0aW9uX2RlZmluZXMsXG4gICAgICAgICAgICAgICAgICAgICAgICB0cmFuc2Zvcm1zOiB0cmFuc2Zvcm1zLFxuICAgICAgICAgICAgICAgICAgICAgICAgbmFtZTogKHRoaXMubmFtZSArICcgKHNlbGVjdGlvbiknKSxcbiAgICAgICAgICAgICAgICAgICAgICAgIGNhbGxiYWNrOiBjb21wbGV0ZVxuICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIGVsc2Uge1xuICAgICAgICAgICAgICAgIC8vIGNvbnNvbGUubG9nKHRoaXMubmFtZSArIFwiOiBcIiArIFwic2VsZWN0aW9uIHJlLWNvbXBpbGVcIik7XG4gICAgICAgICAgICAgICAgc2VsZWN0aW9uX3Byb2dyYW0uZGVmaW5lcyA9IHNlbGVjdGlvbl9kZWZpbmVzO1xuICAgICAgICAgICAgICAgIHNlbGVjdGlvbl9wcm9ncmFtLnRyYW5zZm9ybXMgPSB0cmFuc2Zvcm1zO1xuICAgICAgICAgICAgICAgIHNlbGVjdGlvbl9wcm9ncmFtLmNvbXBpbGUoY29tcGxldGUpO1xuICAgICAgICAgICAgfVxuICAgICAgICB9KTtcbiAgICB9XG5cbiAgICAvLyBXYWl0IGZvciBwcm9ncmFtKHMpIHRvIGNvbXBpbGUgYmVmb3JlIHJlcGxhY2luZyB0aGVtXG4gICAgLy8gVE9ETzogc2hvdWxkIHRoaXMgZW50aXJlIG1ldGhvZCBvZmZlciBhIGNhbGxiYWNrIGZvciB3aGVuIGNvbXBpbGF0aW9uIGNvbXBsZXRlcz9cbiAgICBxdWV1ZS5hd2FpdCgoKSA9PiB7XG4gICAgICAgaWYgKHByb2dyYW0pIHtcbiAgICAgICAgICAgdGhpcy5nbF9wcm9ncmFtID0gcHJvZ3JhbTtcbiAgICAgICB9XG5cbiAgICAgICBpZiAoc2VsZWN0aW9uX3Byb2dyYW0pIHtcbiAgICAgICAgICAgdGhpcy5zZWxlY3Rpb25fZ2xfcHJvZ3JhbSA9IHNlbGVjdGlvbl9wcm9ncmFtO1xuICAgICAgIH1cblxuICAgICAgIC8vIGNvbnNvbGUubG9nKHRoaXMubmFtZSArIFwiOiBcIiArIFwiZmluaXNoZWQgYnVpbGRpbmdcIik7XG4gICAgfSk7XG59XG5cbi8vIFRPRE86IGNvdWxkIHByb2JhYmx5IGNvbWJpbmUgYW5kIGdlbmVyYWxpemUgdGhpcyB3aXRoIHNpbWlsYXIgbWV0aG9kIGluIEdMUHJvZ3JhbVxuLy8gKGxpc3Qgb2YgZGVmaW5lIG9iamVjdHMgdGhhdCBpbmhlcml0IGZyb20gZWFjaCBvdGhlcilcblJlbmRlck1vZGUuYnVpbGREZWZpbmVMaXN0ID0gZnVuY3Rpb24gKClcbntcbiAgICAvLyBBZGQgYW55IGN1c3RvbSBkZWZpbmVzIHRvIGJ1aWx0LWluIG1vZGUgZGVmaW5lc1xuICAgIHZhciBkZWZpbmVzID0ge307IC8vIGNyZWF0ZSBhIG5ldyBvYmplY3QgdG8gYXZvaWQgbXV0YXRpbmcgYSBwcm90b3R5cGUgdmFsdWUgdGhhdCBtYXkgYmUgc2hhcmVkIHdpdGggb3RoZXIgbW9kZXNcbiAgICBpZiAodGhpcy5kZWZpbmVzICE9IG51bGwpIHtcbiAgICAgICAgZm9yICh2YXIgZCBpbiB0aGlzLmRlZmluZXMpIHtcbiAgICAgICAgICAgIGRlZmluZXNbZF0gPSB0aGlzLmRlZmluZXNbZF07XG4gICAgICAgIH1cbiAgICB9XG4gICAgaWYgKHRoaXMuc2hhZGVycyAhPSBudWxsICYmIHRoaXMuc2hhZGVycy5kZWZpbmVzICE9IG51bGwpIHtcbiAgICAgICAgZm9yICh2YXIgZCBpbiB0aGlzLnNoYWRlcnMuZGVmaW5lcykge1xuICAgICAgICAgICAgZGVmaW5lc1tkXSA9IHRoaXMuc2hhZGVycy5kZWZpbmVzW2RdO1xuICAgICAgICB9XG4gICAgfVxuICAgIHJldHVybiBkZWZpbmVzO1xufTtcblxuLy8gU2V0IG1vZGUgdW5pZm9ybXMgb24gY3VycmVudGx5IGJvdW5kIHByb2dyYW1cblJlbmRlck1vZGUuc2V0VW5pZm9ybXMgPSBmdW5jdGlvbiAoKVxue1xuICAgIHZhciBnbF9wcm9ncmFtID0gR0xQcm9ncmFtLmN1cnJlbnQ7XG4gICAgaWYgKGdsX3Byb2dyYW0gIT0gbnVsbCAmJiB0aGlzLnNoYWRlcnMgIT0gbnVsbCAmJiB0aGlzLnNoYWRlcnMudW5pZm9ybXMgIT0gbnVsbCkge1xuICAgICAgICBnbF9wcm9ncmFtLnNldFVuaWZvcm1zKHRoaXMuc2hhZGVycy51bmlmb3Jtcyk7XG4gICAgfVxufTtcblxuUmVuZGVyTW9kZS51cGRhdGUgPSBmdW5jdGlvbiAoKVxue1xuICAgIC8vIE1vZGUtc3BlY2lmaWMgYW5pbWF0aW9uXG4gICAgaWYgKHR5cGVvZiB0aGlzLmFuaW1hdGlvbiA9PSAnZnVuY3Rpb24nKSB7XG4gICAgICAgIHRoaXMuYW5pbWF0aW9uKCk7XG4gICAgfVxufTtcblxuLy8gVXBkYXRlIGJ1aWx0LWluIG1vZGUgb3IgY3JlYXRlIGEgbmV3IG9uZVxuTW9kZU1hbmFnZXIuY29uZmlndXJlTW9kZSA9IGZ1bmN0aW9uIChuYW1lLCBzZXR0aW5ncylcbntcbiAgICBNb2Rlc1tuYW1lXSA9IE1vZGVzW25hbWVdIHx8IE9iamVjdC5jcmVhdGUoTW9kZXNbc2V0dGluZ3MuZXh0ZW5kc10gfHwgUmVuZGVyTW9kZSk7XG4gICAgaWYgKE1vZGVzW3NldHRpbmdzLmV4dGVuZHNdKSB7XG4gICAgICAgIE1vZGVzW25hbWVdLnBhcmVudCA9IE1vZGVzW3NldHRpbmdzLmV4dGVuZHNdOyAvLyBleHBsaWNpdCAnc3VwZXInIGNsYXNzIGFjY2Vzc1xuICAgIH1cblxuICAgIGZvciAodmFyIHMgaW4gc2V0dGluZ3MpIHtcbiAgICAgICAgTW9kZXNbbmFtZV1bc10gPSBzZXR0aW5nc1tzXTtcbiAgICB9XG5cbiAgICBNb2Rlc1tuYW1lXS5uYW1lID0gbmFtZTtcbiAgICByZXR1cm4gTW9kZXNbbmFtZV07XG59O1xuXG5cbi8vIEJ1aWx0LWluIHJlbmRlcmluZyBtb2Rlc1xuXG4vKioqIFBsYWluIHBvbHlnb25zICoqKi9cblxuTW9kZXMucG9seWdvbnMgPSBPYmplY3QuY3JlYXRlKFJlbmRlck1vZGUpO1xuTW9kZXMucG9seWdvbnMubmFtZSA9ICdwb2x5Z29ucyc7XG5cbk1vZGVzLnBvbHlnb25zLnZlcnRleF9zaGFkZXJfa2V5ID0gJ3BvbHlnb25fdmVydGV4Jztcbk1vZGVzLnBvbHlnb25zLmZyYWdtZW50X3NoYWRlcl9rZXkgPSAncG9seWdvbl9mcmFnbWVudCc7XG5cbk1vZGVzLnBvbHlnb25zLmRlZmluZXMgPSB7XG4gICAgJ1dPUkxEX1BPU0lUSU9OX1dSQVAnOiAxMDAwMDAgLy8gZGVmYXVsdCB3b3JsZCBjb29yZHMgdG8gd3JhcCBldmVyeSAxMDAsMDAwIG1ldGVycywgY2FuIHR1cm4gb2ZmIGJ5IHNldHRpbmcgdGhpcyB0byAnZmFsc2UnXG59O1xuXG5Nb2Rlcy5wb2x5Z29ucy5zZWxlY3Rpb24gPSB0cnVlO1xuXG5Nb2Rlcy5wb2x5Z29ucy5faW5pdCA9IGZ1bmN0aW9uICgpIHtcbiAgICB0aGlzLnZlcnRleF9sYXlvdXQgPSBuZXcgR0xWZXJ0ZXhMYXlvdXQodGhpcy5nbCwgW1xuICAgICAgICB7IG5hbWU6ICdhX3Bvc2l0aW9uJywgc2l6ZTogMywgdHlwZTogdGhpcy5nbC5GTE9BVCwgbm9ybWFsaXplZDogZmFsc2UgfSxcbiAgICAgICAgeyBuYW1lOiAnYV9ub3JtYWwnLCBzaXplOiAzLCB0eXBlOiB0aGlzLmdsLkZMT0FULCBub3JtYWxpemVkOiBmYWxzZSB9LFxuICAgICAgICB7IG5hbWU6ICdhX2NvbG9yJywgc2l6ZTogMywgdHlwZTogdGhpcy5nbC5GTE9BVCwgbm9ybWFsaXplZDogZmFsc2UgfSxcbiAgICAgICAgeyBuYW1lOiAnYV9zZWxlY3Rpb25fY29sb3InLCBzaXplOiA0LCB0eXBlOiB0aGlzLmdsLkZMT0FULCBub3JtYWxpemVkOiBmYWxzZSB9LFxuICAgICAgICB7IG5hbWU6ICdhX2xheWVyJywgc2l6ZTogMSwgdHlwZTogdGhpcy5nbC5GTE9BVCwgbm9ybWFsaXplZDogZmFsc2UgfVxuICAgIF0pO1xufTtcblxuTW9kZXMucG9seWdvbnMuYnVpbGRQb2x5Z29ucyA9IGZ1bmN0aW9uIChwb2x5Z29ucywgc3R5bGUsIHZlcnRleF9kYXRhKVxue1xuICAgIC8vIENvbG9yIGFuZCBsYXllciBudW1iZXIgYXJlIGN1cnJlbnRseSBjb25zdGFudCBhY3Jvc3MgdmVydGljZXNcbiAgICB2YXIgdmVydGV4X2NvbnN0YW50cyA9IFtcbiAgICAgICAgc3R5bGUuY29sb3JbMF0sIHN0eWxlLmNvbG9yWzFdLCBzdHlsZS5jb2xvclsyXSxcbiAgICAgICAgc3R5bGUuc2VsZWN0aW9uLmNvbG9yWzBdLCBzdHlsZS5zZWxlY3Rpb24uY29sb3JbMV0sIHN0eWxlLnNlbGVjdGlvbi5jb2xvclsyXSwgc3R5bGUuc2VsZWN0aW9uLmNvbG9yWzNdLFxuICAgICAgICBzdHlsZS5sYXllcl9udW1cbiAgICBdO1xuXG4gICAgLy8gT3V0bGluZXMgaGF2ZSBhIHNsaWdodGx5IGRpZmZlcmVudCBzZXQgb2YgY29uc3RhbnRzLCBiZWNhdXNlIHRoZSBsYXllciBudW1iZXIgaXMgbW9kaWZpZWRcbiAgICBpZiAoc3R5bGUub3V0bGluZS5jb2xvcikge1xuICAgICAgICB2YXIgb3V0bGluZV92ZXJ0ZXhfY29uc3RhbnRzID0gW1xuICAgICAgICAgICAgc3R5bGUub3V0bGluZS5jb2xvclswXSwgc3R5bGUub3V0bGluZS5jb2xvclsxXSwgc3R5bGUub3V0bGluZS5jb2xvclsyXSxcbiAgICAgICAgICAgIHN0eWxlLnNlbGVjdGlvbi5jb2xvclswXSwgc3R5bGUuc2VsZWN0aW9uLmNvbG9yWzFdLCBzdHlsZS5zZWxlY3Rpb24uY29sb3JbMl0sIHN0eWxlLnNlbGVjdGlvbi5jb2xvclszXSxcbiAgICAgICAgICAgIHN0eWxlLmxheWVyX251bSAtIDAuNSAvLyBvdXRsaW5lcyBzaXQgYmV0d2VlbiBsYXllcnMsIHVuZGVybmVhdGggY3VycmVudCBsYXllciBidXQgYWJvdmUgdGhlIG9uZSBiZWxvd1xuICAgICAgICBdO1xuICAgIH1cblxuICAgIC8vIEV4dHJ1ZGVkIHBvbHlnb25zIChlLmcuIDNEIGJ1aWxkaW5ncylcbiAgICBpZiAoc3R5bGUuZXh0cnVkZSAmJiBzdHlsZS5oZWlnaHQpIHtcbiAgICAgICAgR0xCdWlsZGVycy5idWlsZEV4dHJ1ZGVkUG9seWdvbnMoXG4gICAgICAgICAgICBwb2x5Z29ucyxcbiAgICAgICAgICAgIHN0eWxlLnosXG4gICAgICAgICAgICBzdHlsZS5oZWlnaHQsXG4gICAgICAgICAgICBzdHlsZS5taW5faGVpZ2h0LFxuICAgICAgICAgICAgdmVydGV4X2RhdGEsXG4gICAgICAgICAgICB7XG4gICAgICAgICAgICAgICAgdmVydGV4X2NvbnN0YW50czogdmVydGV4X2NvbnN0YW50c1xuICAgICAgICAgICAgfVxuICAgICAgICApO1xuICAgIH1cbiAgICAvLyBSZWd1bGFyIHBvbHlnb25zXG4gICAgZWxzZSB7XG4gICAgICAgIEdMQnVpbGRlcnMuYnVpbGRQb2x5Z29ucyhcbiAgICAgICAgICAgIHBvbHlnb25zLFxuICAgICAgICAgICAgc3R5bGUueixcbiAgICAgICAgICAgIHZlcnRleF9kYXRhLFxuICAgICAgICAgICAge1xuICAgICAgICAgICAgICAgIG5vcm1hbHM6IHRydWUsXG4gICAgICAgICAgICAgICAgdmVydGV4X2NvbnN0YW50czogdmVydGV4X2NvbnN0YW50c1xuICAgICAgICAgICAgfVxuICAgICAgICApO1xuXG4gICAgICAgIC8vIENhbGxiYWNrLWJhc2UgYnVpbGRlciAoZm9yIGZ1dHVyZSBleHBsb3JhdGlvbilcbiAgICAgICAgLy8gdmFyIG5vcm1hbF92ZXJ0ZXhfY29uc3RhbnRzID0gWzAsIDAsIDFdLmNvbmNhdCh2ZXJ0ZXhfY29uc3RhbnRzKTtcbiAgICAgICAgLy8gR0xCdWlsZGVycy5idWlsZFBvbHlnb25zMihcbiAgICAgICAgLy8gICAgIHBvbHlnb25zLFxuICAgICAgICAvLyAgICAgeixcbiAgICAgICAgLy8gICAgIGZ1bmN0aW9uICh2ZXJ0aWNlcykge1xuICAgICAgICAvLyAgICAgICAgIC8vIHZhciB2cyA9IHZlcnRpY2VzLnBvc2l0aW9ucztcbiAgICAgICAgLy8gICAgICAgICAvLyBmb3IgKHZhciB2IGluIHZzKSB7XG4gICAgICAgIC8vICAgICAgICAgLy8gICAgIC8vIHZhciBiYyA9IFsodiAlIDMpID8gMCA6IDEsICgodiArIDEpICUgMykgPyAwIDogMSwgKCh2ICsgMikgJSAzKSA/IDAgOiAxXTtcbiAgICAgICAgLy8gICAgICAgICAvLyAgICAgLy8gdmFyIGJjID0gW2NlbnRyb2lkLngsIGNlbnRyb2lkLnksIDBdO1xuICAgICAgICAvLyAgICAgICAgIC8vICAgICAvLyB2c1t2XSA9IHZlcnRpY2VzLnBvc2l0aW9uc1t2XS5jb25jYXQoeiwgMCwgMCwgMSwgYmMpO1xuXG4gICAgICAgIC8vICAgICAgICAgLy8gICAgIC8vIHZzW3ZdID0gdmVydGljZXMucG9zaXRpb25zW3ZdLmNvbmNhdCh6LCAwLCAwLCAxKTtcbiAgICAgICAgLy8gICAgICAgICAvLyAgICAgdnNbdl0gPSB2ZXJ0aWNlcy5wb3NpdGlvbnNbdl0uY29uY2F0KDAsIDAsIDEpO1xuICAgICAgICAvLyAgICAgICAgIC8vIH1cblxuICAgICAgICAvLyAgICAgICAgIEdMLmFkZFZlcnRpY2VzKHZlcnRpY2VzLnBvc2l0aW9ucywgbm9ybWFsX3ZlcnRleF9jb25zdGFudHMsIHZlcnRleF9kYXRhKTtcblxuICAgICAgICAvLyAgICAgICAgIC8vIEdMLmFkZFZlcnRpY2VzQnlBdHRyaWJ1dGVMYXlvdXQoXG4gICAgICAgIC8vICAgICAgICAgLy8gICAgIFtcbiAgICAgICAgLy8gICAgICAgICAvLyAgICAgICAgIHsgbmFtZTogJ2FfcG9zaXRpb24nLCBkYXRhOiB2ZXJ0aWNlcy5wb3NpdGlvbnMgfSxcbiAgICAgICAgLy8gICAgICAgICAvLyAgICAgICAgIHsgbmFtZTogJ2Ffbm9ybWFsJywgZGF0YTogWzAsIDAsIDFdIH0sXG4gICAgICAgIC8vICAgICAgICAgLy8gICAgICAgICB7IG5hbWU6ICdhX2NvbG9yJywgZGF0YTogW3N0eWxlLmNvbG9yWzBdLCBzdHlsZS5jb2xvclsxXSwgc3R5bGUuY29sb3JbMl1dIH0sXG4gICAgICAgIC8vICAgICAgICAgLy8gICAgICAgICB7IG5hbWU6ICdhX2xheWVyJywgZGF0YTogc3R5bGUubGF5ZXJfbnVtIH1cbiAgICAgICAgLy8gICAgICAgICAvLyAgICAgXSxcbiAgICAgICAgLy8gICAgICAgICAvLyAgICAgdmVydGV4X2RhdGFcbiAgICAgICAgLy8gICAgICAgICAvLyApO1xuXG4gICAgICAgIC8vICAgICAgICAgLy8gR0wuYWRkVmVydGljZXNNdWx0aXBsZUF0dHJpYnV0ZXMoW3ZlcnRpY2VzLnBvc2l0aW9uc10sIG5vcm1hbF92ZXJ0ZXhfY29uc3RhbnRzLCB2ZXJ0ZXhfZGF0YSk7XG4gICAgICAgIC8vICAgICB9XG4gICAgICAgIC8vICk7XG4gICAgfVxuXG4gICAgLy8gUG9seWdvbiBvdXRsaW5lc1xuICAgIGlmIChzdHlsZS5vdXRsaW5lLmNvbG9yICYmIHN0eWxlLm91dGxpbmUud2lkdGgpIHtcbiAgICAgICAgZm9yICh2YXIgbXBjPTA7IG1wYyA8IHBvbHlnb25zLmxlbmd0aDsgbXBjKyspIHtcbiAgICAgICAgICAgIEdMQnVpbGRlcnMuYnVpbGRQb2x5bGluZXMoXG4gICAgICAgICAgICAgICAgcG9seWdvbnNbbXBjXSxcbiAgICAgICAgICAgICAgICBzdHlsZS56LFxuICAgICAgICAgICAgICAgIHN0eWxlLm91dGxpbmUud2lkdGgsXG4gICAgICAgICAgICAgICAgdmVydGV4X2RhdGEsXG4gICAgICAgICAgICAgICAge1xuICAgICAgICAgICAgICAgICAgICBjbG9zZWRfcG9seWdvbjogdHJ1ZSxcbiAgICAgICAgICAgICAgICAgICAgcmVtb3ZlX3RpbGVfZWRnZXM6IHRydWUsXG4gICAgICAgICAgICAgICAgICAgIHZlcnRleF9jb25zdGFudHM6IG91dGxpbmVfdmVydGV4X2NvbnN0YW50c1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICk7XG4gICAgICAgIH1cbiAgICB9XG59O1xuXG5Nb2Rlcy5wb2x5Z29ucy5idWlsZExpbmVzID0gZnVuY3Rpb24gKGxpbmVzLCBzdHlsZSwgdmVydGV4X2RhdGEpXG57XG4gICAgLy8gVE9PRDogcmVkdWNlIHJlZHVuZGFuY3kgb2YgY29uc3RhbnQgY2FsYyBiZXR3ZWVuIGJ1aWxkZXJzXG4gICAgLy8gQ29sb3IgYW5kIGxheWVyIG51bWJlciBhcmUgY3VycmVudGx5IGNvbnN0YW50IGFjcm9zcyB2ZXJ0aWNlc1xuICAgIHZhciB2ZXJ0ZXhfY29uc3RhbnRzID0gW1xuICAgICAgICBzdHlsZS5jb2xvclswXSwgc3R5bGUuY29sb3JbMV0sIHN0eWxlLmNvbG9yWzJdLFxuICAgICAgICBzdHlsZS5zZWxlY3Rpb24uY29sb3JbMF0sIHN0eWxlLnNlbGVjdGlvbi5jb2xvclsxXSwgc3R5bGUuc2VsZWN0aW9uLmNvbG9yWzJdLCBzdHlsZS5zZWxlY3Rpb24uY29sb3JbM10sXG4gICAgICAgIHN0eWxlLmxheWVyX251bVxuICAgIF07XG5cbiAgICAvLyBPdXRsaW5lcyBoYXZlIGEgc2xpZ2h0bHkgZGlmZmVyZW50IHNldCBvZiBjb25zdGFudHMsIGJlY2F1c2UgdGhlIGxheWVyIG51bWJlciBpcyBtb2RpZmllZFxuICAgIGlmIChzdHlsZS5vdXRsaW5lLmNvbG9yKSB7XG4gICAgICAgIHZhciBvdXRsaW5lX3ZlcnRleF9jb25zdGFudHMgPSBbXG4gICAgICAgICAgICBzdHlsZS5vdXRsaW5lLmNvbG9yWzBdLCBzdHlsZS5vdXRsaW5lLmNvbG9yWzFdLCBzdHlsZS5vdXRsaW5lLmNvbG9yWzJdLFxuICAgICAgICAgICAgc3R5bGUuc2VsZWN0aW9uLmNvbG9yWzBdLCBzdHlsZS5zZWxlY3Rpb24uY29sb3JbMV0sIHN0eWxlLnNlbGVjdGlvbi5jb2xvclsyXSwgc3R5bGUuc2VsZWN0aW9uLmNvbG9yWzNdLFxuICAgICAgICAgICAgc3R5bGUubGF5ZXJfbnVtIC0gMC41IC8vIG91dGxpbmVzIHNpdCBiZXR3ZWVuIGxheWVycywgdW5kZXJuZWF0aCBjdXJyZW50IGxheWVyIGJ1dCBhYm92ZSB0aGUgb25lIGJlbG93XG4gICAgICAgIF07XG4gICAgfVxuXG4gICAgLy8gTWFpbiBsaW5lc1xuICAgIEdMQnVpbGRlcnMuYnVpbGRQb2x5bGluZXMoXG4gICAgICAgIGxpbmVzLFxuICAgICAgICBzdHlsZS56LFxuICAgICAgICBzdHlsZS53aWR0aCxcbiAgICAgICAgdmVydGV4X2RhdGEsXG4gICAgICAgIHtcbiAgICAgICAgICAgIHZlcnRleF9jb25zdGFudHM6IHZlcnRleF9jb25zdGFudHNcbiAgICAgICAgfVxuICAgICk7XG5cbiAgICAvLyBMaW5lIG91dGxpbmVzXG4gICAgaWYgKHN0eWxlLm91dGxpbmUuY29sb3IgJiYgc3R5bGUub3V0bGluZS53aWR0aCkge1xuICAgICAgICBHTEJ1aWxkZXJzLmJ1aWxkUG9seWxpbmVzKFxuICAgICAgICAgICAgbGluZXMsXG4gICAgICAgICAgICBzdHlsZS56LFxuICAgICAgICAgICAgc3R5bGUud2lkdGggKyAyICogc3R5bGUub3V0bGluZS53aWR0aCxcbiAgICAgICAgICAgIHZlcnRleF9kYXRhLFxuICAgICAgICAgICAge1xuICAgICAgICAgICAgICAgIHZlcnRleF9jb25zdGFudHM6IG91dGxpbmVfdmVydGV4X2NvbnN0YW50c1xuICAgICAgICAgICAgfVxuICAgICAgICApO1xuICAgIH1cbn07XG5cbk1vZGVzLnBvbHlnb25zLmJ1aWxkUG9pbnRzID0gZnVuY3Rpb24gKHBvaW50cywgc3R5bGUsIHZlcnRleF9kYXRhKVxue1xuICAgIC8vIFRPT0Q6IHJlZHVjZSByZWR1bmRhbmN5IG9mIGNvbnN0YW50IGNhbGMgYmV0d2VlbiBidWlsZGVyc1xuICAgIC8vIENvbG9yIGFuZCBsYXllciBudW1iZXIgYXJlIGN1cnJlbnRseSBjb25zdGFudCBhY3Jvc3MgdmVydGljZXNcbiAgICB2YXIgdmVydGV4X2NvbnN0YW50cyA9IFtcbiAgICAgICAgc3R5bGUuY29sb3JbMF0sIHN0eWxlLmNvbG9yWzFdLCBzdHlsZS5jb2xvclsyXSxcbiAgICAgICAgc3R5bGUuc2VsZWN0aW9uLmNvbG9yWzBdLCBzdHlsZS5zZWxlY3Rpb24uY29sb3JbMV0sIHN0eWxlLnNlbGVjdGlvbi5jb2xvclsyXSwgc3R5bGUuc2VsZWN0aW9uLmNvbG9yWzNdLFxuICAgICAgICBzdHlsZS5sYXllcl9udW1cbiAgICBdO1xuXG4gICAgR0xCdWlsZGVycy5idWlsZFF1YWRzRm9yUG9pbnRzKFxuICAgICAgICBwb2ludHMsXG4gICAgICAgIHN0eWxlLnNpemUgKiAyLFxuICAgICAgICBzdHlsZS5zaXplICogMixcbiAgICAgICAgc3R5bGUueixcbiAgICAgICAgdmVydGV4X2RhdGEsXG4gICAgICAgIHtcbiAgICAgICAgICAgIG5vcm1hbHM6IHRydWUsXG4gICAgICAgICAgICB0ZXhjb29yZHM6IGZhbHNlLFxuICAgICAgICAgICAgdmVydGV4X2NvbnN0YW50czogdmVydGV4X2NvbnN0YW50c1xuICAgICAgICB9XG4gICAgKTtcbn07XG5cblxuLyoqKiBQb2ludHMgdy9zaW1wbGUgZGlzdGFuY2UgZmllbGQgcmVuZGVyaW5nICoqKi9cblxuTW9kZXMucG9pbnRzID0gT2JqZWN0LmNyZWF0ZShSZW5kZXJNb2RlKTtcbk1vZGVzLnBvaW50cy5uYW1lID0gJ3BvaW50cyc7XG5cbk1vZGVzLnBvaW50cy52ZXJ0ZXhfc2hhZGVyX2tleSA9ICdwb2ludF92ZXJ0ZXgnO1xuTW9kZXMucG9pbnRzLmZyYWdtZW50X3NoYWRlcl9rZXkgPSAncG9pbnRfZnJhZ21lbnQnO1xuXG5Nb2Rlcy5wb2ludHMuZGVmaW5lcyA9IHtcbiAgICAnRUZGRUNUX1NDUkVFTl9DT0xPUic6IHRydWVcbn07XG5cbk1vZGVzLnBvaW50cy5zZWxlY3Rpb24gPSB0cnVlO1xuXG5Nb2Rlcy5wb2ludHMuX2luaXQgPSBmdW5jdGlvbiAoKSB7XG4gICAgdGhpcy52ZXJ0ZXhfbGF5b3V0ID0gbmV3IEdMVmVydGV4TGF5b3V0KHRoaXMuZ2wsIFtcbiAgICAgICAgeyBuYW1lOiAnYV9wb3NpdGlvbicsIHNpemU6IDMsIHR5cGU6IHRoaXMuZ2wuRkxPQVQsIG5vcm1hbGl6ZWQ6IGZhbHNlIH0sXG4gICAgICAgIHsgbmFtZTogJ2FfdGV4Y29vcmQnLCBzaXplOiAyLCB0eXBlOiB0aGlzLmdsLkZMT0FULCBub3JtYWxpemVkOiBmYWxzZSB9LFxuICAgICAgICB7IG5hbWU6ICdhX2NvbG9yJywgc2l6ZTogMywgdHlwZTogdGhpcy5nbC5GTE9BVCwgbm9ybWFsaXplZDogZmFsc2UgfSxcbiAgICAgICAgeyBuYW1lOiAnYV9zZWxlY3Rpb25fY29sb3InLCBzaXplOiA0LCB0eXBlOiB0aGlzLmdsLkZMT0FULCBub3JtYWxpemVkOiBmYWxzZSB9LFxuICAgICAgICB7IG5hbWU6ICdhX2xheWVyJywgc2l6ZTogMSwgdHlwZTogdGhpcy5nbC5GTE9BVCwgbm9ybWFsaXplZDogZmFsc2UgfVxuICAgIF0pO1xufTtcblxuTW9kZXMucG9pbnRzLmJ1aWxkUG9pbnRzID0gZnVuY3Rpb24gKHBvaW50cywgc3R5bGUsIHZlcnRleF9kYXRhKVxue1xuICAgIC8vIFRPT0Q6IHJlZHVjZSByZWR1bmRhbmN5IG9mIGNvbnN0YW50IGNhbGMgYmV0d2VlbiBidWlsZGVyc1xuICAgIC8vIENvbG9yIGFuZCBsYXllciBudW1iZXIgYXJlIGN1cnJlbnRseSBjb25zdGFudCBhY3Jvc3MgdmVydGljZXNcbiAgICB2YXIgdmVydGV4X2NvbnN0YW50cyA9IFtcbiAgICAgICAgc3R5bGUuY29sb3JbMF0sIHN0eWxlLmNvbG9yWzFdLCBzdHlsZS5jb2xvclsyXSxcbiAgICAgICAgc3R5bGUuc2VsZWN0aW9uLmNvbG9yWzBdLCBzdHlsZS5zZWxlY3Rpb24uY29sb3JbMV0sIHN0eWxlLnNlbGVjdGlvbi5jb2xvclsyXSwgc3R5bGUuc2VsZWN0aW9uLmNvbG9yWzNdLFxuICAgICAgICBzdHlsZS5sYXllcl9udW1cbiAgICBdO1xuXG4gICAgR0xCdWlsZGVycy5idWlsZFF1YWRzRm9yUG9pbnRzKFxuICAgICAgICBwb2ludHMsXG4gICAgICAgIHN0eWxlLnNpemUgKiAyLFxuICAgICAgICBzdHlsZS5zaXplICogMixcbiAgICAgICAgc3R5bGUueixcbiAgICAgICAgdmVydGV4X2RhdGEsXG4gICAgICAgIHtcbiAgICAgICAgICAgIG5vcm1hbHM6IGZhbHNlLFxuICAgICAgICAgICAgdGV4Y29vcmRzOiB0cnVlLFxuICAgICAgICAgICAgdmVydGV4X2NvbnN0YW50czogdmVydGV4X2NvbnN0YW50c1xuICAgICAgICB9XG4gICAgKTtcbn07XG4iLCIvLyBUaGluIEdMIHByb2dyYW0gd3JhcHAgdG8gY2FjaGUgdW5pZm9ybSBsb2NhdGlvbnMvdmFsdWVzLCBkbyBjb21waWxlLXRpbWUgcHJlLXByb2Nlc3Npbmdcbi8vIChpbmplY3RpbmcgI2RlZmluZXMgYW5kICNwcmFnbWEgdHJhbnNmb3JtcyBpbnRvIHNoYWRlcnMpLCBldGMuXG5pbXBvcnQgKiBhcyBVdGlscyBmcm9tICcuLi91dGlscyc7XG5pbXBvcnQge0dMfSBmcm9tICcuL2dsJztcbmltcG9ydCBHTFRleHR1cmUgZnJvbSAnLi9nbF90ZXh0dXJlJztcbmltcG9ydCAqIGFzIFF1ZXVlIGZyb20gJ3F1ZXVlLWFzeW5jJztcblxuR0xQcm9ncmFtLmlkID0gMDsgLy8gYXNzaWduIGVhY2ggcHJvZ3JhbSBhIHVuaXF1ZSBpZFxuR0xQcm9ncmFtLnByb2dyYW1zID0ge307IC8vIHByb2dyYW1zLCBieSBpZFxuXG5leHBvcnQgZGVmYXVsdCBmdW5jdGlvbiBHTFByb2dyYW0gKGdsLCB2ZXJ0ZXhfc2hhZGVyLCBmcmFnbWVudF9zaGFkZXIsIG9wdGlvbnMpXG57XG4gICAgb3B0aW9ucyA9IG9wdGlvbnMgfHwge307XG5cbiAgICB0aGlzLmdsID0gZ2w7XG4gICAgdGhpcy5wcm9ncmFtID0gbnVsbDtcbiAgICB0aGlzLmNvbXBpbGVkID0gZmFsc2U7XG4gICAgdGhpcy5kZWZpbmVzID0gb3B0aW9ucy5kZWZpbmVzIHx8IHt9OyAvLyBrZXkvdmFsdWVzIGluc2VydGVkIGFzICNkZWZpbmVzIGludG8gc2hhZGVycyBhdCBjb21waWxlLXRpbWVcbiAgICB0aGlzLnRyYW5zZm9ybXMgPSBvcHRpb25zLnRyYW5zZm9ybXMgfHwge307IC8vIGtleS92YWx1ZXMgZm9yIFVSTHMgb2YgYmxvY2tzIHRoYXQgY2FuIGJlIGluamVjdGVkIGludG8gc2hhZGVycyBhdCBjb21waWxlLXRpbWVcbiAgICB0aGlzLnVuaWZvcm1zID0ge307IC8vIHByb2dyYW0gbG9jYXRpb25zIG9mIHVuaWZvcm1zLCBzZXQvdXBkYXRlZCBhdCBjb21waWxlLXRpbWVcbiAgICB0aGlzLmF0dHJpYnMgPSB7fTsgLy8gcHJvZ3JhbSBsb2NhdGlvbnMgb2YgdmVydGV4IGF0dHJpYnV0ZXNcblxuICAgIHRoaXMudmVydGV4X3NoYWRlciA9IHZlcnRleF9zaGFkZXI7XG4gICAgdGhpcy5mcmFnbWVudF9zaGFkZXIgPSBmcmFnbWVudF9zaGFkZXI7XG5cbiAgICB0aGlzLmlkID0gR0xQcm9ncmFtLmlkKys7XG4gICAgR0xQcm9ncmFtLnByb2dyYW1zW3RoaXMuaWRdID0gdGhpcztcbiAgICB0aGlzLm5hbWUgPSBvcHRpb25zLm5hbWU7IC8vIGNhbiBwcm92aWRlIGEgcHJvZ3JhbSBuYW1lICh1c2VmdWwgZm9yIGRlYnVnZ2luZylcblxuICAgIHRoaXMuY29tcGlsZShvcHRpb25zLmNhbGxiYWNrKTtcbn07XG5cbi8vIFVzZSBwcm9ncmFtIHdyYXBwZXIgd2l0aCBzaW1wbGUgc3RhdGUgY2FjaGVcbkdMUHJvZ3JhbS5wcm90b3R5cGUudXNlID0gZnVuY3Rpb24gKClcbntcbiAgICBpZiAoIXRoaXMuY29tcGlsZWQpIHtcbiAgICAgICAgcmV0dXJuO1xuICAgIH1cblxuICAgIGlmIChHTFByb2dyYW0uY3VycmVudCAhPSB0aGlzKSB7XG4gICAgICAgIHRoaXMuZ2wudXNlUHJvZ3JhbSh0aGlzLnByb2dyYW0pO1xuICAgIH1cbiAgICBHTFByb2dyYW0uY3VycmVudCA9IHRoaXM7XG59O1xuR0xQcm9ncmFtLmN1cnJlbnQgPSBudWxsO1xuXG4vLyBHbG9iYWwgY29uZmlnIGFwcGxpZWQgdG8gYWxsIHByb2dyYW1zIChkdXBsaWNhdGUgcHJvcGVydGllcyBmb3IgYSBzcGVjaWZpYyBwcm9ncmFtIHdpbGwgdGFrZSBwcmVjZWRlbmNlKVxuR0xQcm9ncmFtLmRlZmluZXMgPSB7fTtcbkdMUHJvZ3JhbS50cmFuc2Zvcm1zID0ge307XG5cbkdMUHJvZ3JhbS5hZGRUcmFuc2Zvcm0gPSBmdW5jdGlvbiAoa2V5LCAuLi50cmFuc2Zvcm1zKSB7XG4gICAgR0xQcm9ncmFtLnRyYW5zZm9ybXNba2V5XSA9IEdMUHJvZ3JhbS50cmFuc2Zvcm1zW2tleV0gfHwgW107XG4gICAgR0xQcm9ncmFtLnRyYW5zZm9ybXNba2V5XS5wdXNoKC4uLnRyYW5zZm9ybXMpO1xufTtcblxuLy8gUmVtb3ZlIGFsbCBnbG9iYWwgc2hhZGVyIHRyYW5zZm9ybXMgZm9yIGEgZ2l2ZW4ga2V5XG5HTFByb2dyYW0ucmVtb3ZlVHJhbnNmb3JtID0gZnVuY3Rpb24gKGtleSkge1xuICAgIEdMUHJvZ3JhbS50cmFuc2Zvcm1zW2tleV0gPSBbXTtcbn07XG5cbkdMUHJvZ3JhbS5wcm90b3R5cGUuY29tcGlsZSA9IGZ1bmN0aW9uIChjYWxsYmFjaylcbntcbiAgICB2YXIgcXVldWUgPSBRdWV1ZSgpO1xuXG4gICAgLy8gQ29weSBzb3VyY2VzIGZyb20gcHJlLW1vZGlmaWVkIHRlbXBsYXRlXG4gICAgdGhpcy5jb21wdXRlZF92ZXJ0ZXhfc2hhZGVyID0gdGhpcy52ZXJ0ZXhfc2hhZGVyO1xuICAgIHRoaXMuY29tcHV0ZWRfZnJhZ21lbnRfc2hhZGVyID0gdGhpcy5mcmFnbWVudF9zaGFkZXI7XG5cbiAgICAvLyBNYWtlIGxpc3Qgb2YgZGVmaW5lcyB0byBiZSBpbmplY3RlZCBsYXRlclxuICAgIHZhciBkZWZpbmVzID0gdGhpcy5idWlsZERlZmluZUxpc3QoKTtcblxuICAgIC8vIEluamVjdCB1c2VyLWRlZmluZWQgdHJhbnNmb3JtcyAoYXJiaXRyYXJ5IGNvZGUgcG9pbnRzIG1hdGNoaW5nIG5hbWVkICNwcmFnbWFzKVxuICAgIC8vIFJlcGxhY2UgYWNjb3JkaW5nIHRvIHRoaXMgcGF0dGVybjpcbiAgICAvLyAjcHJhZ21hIHRhbmdyYW06IFtrZXldXG4gICAgLy8gZS5nLiAjcHJhZ21hIHRhbmdyYW06IGdsb2JhbHNcblxuICAgIC8vIFRPRE86IGZsYWcgdG8gYXZvaWQgcmUtcmV0cmlldmluZyB0cmFuc2Zvcm0gVVJMcyBvdmVyIG5ldHdvcmsgd2hlbiByZWJ1aWxkaW5nP1xuICAgIC8vIFRPRE86IHN1cHBvcnQgZ2xzbGlmeSAjcHJhZ21hIGV4cG9ydCBuYW1lcyBmb3IgYmV0dGVyIGNvbXBhdGliaWxpdHk/IChlLmcuIHJlbmFtZSBtYWluKCkgZnVuY3Rpb25zKVxuICAgIC8vIFRPRE86IGF1dG8taW5zZXJ0IHVuaWZvcm1zIHJlZmVyZW5jZWQgaW4gbW9kZSBkZWZpbml0aW9uLCBidXQgbm90IGluIHNoYWRlciBiYXNlIG9yIHRyYW5zZm9ybXM/IChwcm9ibGVtOiBkb24ndCBoYXZlIGFjY2VzcyB0byB1bmlmb3JtIGxpc3QvdHlwZSBoZXJlKVxuXG4gICAgLy8gR2F0aGVyIGFsbCB0cmFuc2Zvcm0gY29kZSBzbmlwcGV0cyAoY2FuIGJlIGVpdGhlciBpbmxpbmUgaW4gdGhlIHN0eWxlIGZpbGUsIG9yIG92ZXIgdGhlIG5ldHdvcmsgdmlhIFVSTClcbiAgICAvLyBUaGlzIGlzIGFuIGFzeW5jIHByb2Nlc3MsIHNpbmNlIGNvZGUgbWF5IGJlIHJldHJpZXZlZCByZW1vdGVseVxuICAgIHZhciB0cmFuc2Zvcm1zID0gdGhpcy5idWlsZFNoYWRlclRyYW5zZm9ybUxpc3QoKTtcbiAgICB2YXIgbG9hZGVkX3RyYW5zZm9ybXMgPSB7fTsgLy8gbWFzdGVyIGxpc3Qgb2YgdHJhbnNmb3Jtcywgd2l0aCBhbiBvcmRlcmVkIGxpc3QgZm9yIGVhY2ggKHNpbmNlIHdlIHdhbnQgdG8gZ3VhcmFudGVlIG9yZGVyIG9mIHRyYW5zZm9ybXMpXG4gICAgdmFyIHJlZ2V4cDtcblxuICAgIGZvciAodmFyIGtleSBpbiB0cmFuc2Zvcm1zKSB7XG4gICAgICAgIHZhciB0cmFuc2Zvcm0gPSB0cmFuc2Zvcm1zW2tleV07XG4gICAgICAgIGlmICh0cmFuc2Zvcm0gPT0gbnVsbCkge1xuICAgICAgICAgICAgY29udGludWU7XG4gICAgICAgIH1cblxuICAgICAgICAvLyBFYWNoIGNvZGUgcG9pbnQgY2FuIGJlIGEgc2luZ2xlIGl0ZW0gKHN0cmluZyBvciBoYXNoIG9iamVjdCkgb3IgYSBsaXN0IChhcnJheSBvYmplY3Qgd2l0aCBub24temVybyBsZW5ndGgpXG4gICAgICAgIGlmICghKHR5cGVvZiB0cmFuc2Zvcm0gPT09ICdvYmplY3QnICYmIHRyYW5zZm9ybS5sZW5ndGggPj0gMCkpIHtcbiAgICAgICAgICAgIHRyYW5zZm9ybSA9IFt0cmFuc2Zvcm1dO1xuICAgICAgICB9XG5cbiAgICAgICAgLy8gRmlyc3QgZmluZCBjb2RlIHJlcGxhY2UgcG9pbnRzIGluIHNoYWRlcnNcbiAgICAgICAgdmFyIHJlZ2V4cCA9IG5ldyBSZWdFeHAoJ15cXFxccyojcHJhZ21hXFxcXHMrdGFuZ3JhbTpcXFxccysnICsga2V5ICsgJ1xcXFxzKiQnLCAnbScpO1xuICAgICAgICB2YXIgaW5qZWN0X3ZlcnRleCA9IHRoaXMuY29tcHV0ZWRfdmVydGV4X3NoYWRlci5tYXRjaChyZWdleHApO1xuICAgICAgICB2YXIgaW5qZWN0X2ZyYWdtZW50ID0gdGhpcy5jb21wdXRlZF9mcmFnbWVudF9zaGFkZXIubWF0Y2gocmVnZXhwKTtcblxuICAgICAgICAvLyBBdm9pZCBuZXR3b3JrIHJlcXVlc3QgaWYgbm90aGluZyB0byByZXBsYWNlXG4gICAgICAgIGlmIChpbmplY3RfdmVydGV4ID09IG51bGwgJiYgaW5qZWN0X2ZyYWdtZW50ID09IG51bGwpIHtcbiAgICAgICAgICAgIGNvbnRpbnVlO1xuICAgICAgICB9XG5cbiAgICAgICAgLy8gQ29sbGVjdCBhbGwgdHJhbnNmb3JtcyBmb3IgdGhpcyB0eXBlXG4gICAgICAgIGxvYWRlZF90cmFuc2Zvcm1zW2tleV0gPSB7fTtcbiAgICAgICAgbG9hZGVkX3RyYW5zZm9ybXNba2V5XS5yZWdleHAgPSBuZXcgUmVnRXhwKHJlZ2V4cCk7IC8vIHNhdmUgcmVnZXhwIHNvIHdlIGNhbiBpbmplY3QgbGF0ZXIgd2l0aG91dCBoYXZpbmcgdG8gcmVjcmVhdGUgaXRcbiAgICAgICAgbG9hZGVkX3RyYW5zZm9ybXNba2V5XS5pbmplY3RfdmVydGV4ID0gKGluamVjdF92ZXJ0ZXggIT0gbnVsbCk7IC8vIHNhdmUgcmVnZXhwIGNvZGUgcG9pbnQgbWF0Y2hlcyBzbyB3ZSBkb24ndCBoYXZlIHRvIGRvIHRoZW0gYWdhaW5cbiAgICAgICAgbG9hZGVkX3RyYW5zZm9ybXNba2V5XS5pbmplY3RfZnJhZ21lbnQgPSAoaW5qZWN0X2ZyYWdtZW50ICE9IG51bGwpO1xuICAgICAgICBsb2FkZWRfdHJhbnNmb3Jtc1trZXldLmxpc3QgPSBbXTtcblxuICAgICAgICAvLyBHZXQgdGhlIGNvZGUgKHBvc3NpYmx5IG92ZXIgdGhlIG5ldHdvcmssIHNvIG5lZWRzIHRvIGJlIGFzeW5jKVxuICAgICAgICBmb3IgKHZhciB1PTA7IHUgPCB0cmFuc2Zvcm0ubGVuZ3RoOyB1KyspIHtcbiAgICAgICAgICAgIHF1ZXVlLmRlZmVyKEdMUHJvZ3JhbS5sb2FkVHJhbnNmb3JtLCBsb2FkZWRfdHJhbnNmb3JtcywgdHJhbnNmb3JtW3VdLCBrZXksIHUpO1xuICAgICAgICB9XG5cbiAgICAgICAgLy8gQWRkIGEgI2RlZmluZSBmb3IgdGhpcyBpbmplY3Rpb24gcG9pbnRcbiAgICAgICAgZGVmaW5lc1snVEFOR1JBTV9UUkFOU0ZPUk1fJyArIGtleS5yZXBsYWNlKCcgJywgJ18nKS50b1VwcGVyQ2FzZSgpXSA9IHRydWU7XG4gICAgfVxuXG4gICAgLy8gV2hlbiBhbGwgdHJhbnNmb3JtIGNvZGUgc25pcHBldHMgYXJlIGNvbGxlY3RlZCwgY29tYmluZSBhbmQgaW5qZWN0IHRoZW1cbiAgICBxdWV1ZS5hd2FpdChlcnJvciA9PiB7XG4gICAgICAgIGlmIChlcnJvcikge1xuICAgICAgICAgICAgY29uc29sZS5sb2coXCJlcnJvciBsb2FkaW5nIHRyYW5zZm9ybXM6IFwiICsgZXJyb3IpO1xuICAgICAgICAgICAgcmV0dXJuO1xuICAgICAgICB9XG5cbiAgICAgICAgLy8gRG8gdGhlIGNvZGUgaW5qZWN0aW9uIHdpdGggdGhlIGNvbGxlY3RlZCBzb3VyY2VzXG4gICAgICAgIGZvciAodmFyIHQgaW4gbG9hZGVkX3RyYW5zZm9ybXMpIHtcbiAgICAgICAgICAgIC8vIENvbmNhdGVuYXRlXG4gICAgICAgICAgICB2YXIgY29tYmluZWRfc291cmNlID0gXCJcIjtcbiAgICAgICAgICAgIGZvciAodmFyIHM9MDsgcyA8IGxvYWRlZF90cmFuc2Zvcm1zW3RdLmxpc3QubGVuZ3RoOyBzKyspIHtcbiAgICAgICAgICAgICAgICBjb21iaW5lZF9zb3VyY2UgKz0gbG9hZGVkX3RyYW5zZm9ybXNbdF0ubGlzdFtzXSArICdcXG4nO1xuICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICAvLyBJbmplY3RcbiAgICAgICAgICAgIGlmIChsb2FkZWRfdHJhbnNmb3Jtc1t0XS5pbmplY3RfdmVydGV4ICE9IG51bGwpIHtcbiAgICAgICAgICAgICAgICB0aGlzLmNvbXB1dGVkX3ZlcnRleF9zaGFkZXIgPSB0aGlzLmNvbXB1dGVkX3ZlcnRleF9zaGFkZXIucmVwbGFjZShsb2FkZWRfdHJhbnNmb3Jtc1t0XS5yZWdleHAsIGNvbWJpbmVkX3NvdXJjZSk7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICBpZiAobG9hZGVkX3RyYW5zZm9ybXNbdF0uaW5qZWN0X2ZyYWdtZW50ICE9IG51bGwpIHtcbiAgICAgICAgICAgICAgICB0aGlzLmNvbXB1dGVkX2ZyYWdtZW50X3NoYWRlciA9IHRoaXMuY29tcHV0ZWRfZnJhZ21lbnRfc2hhZGVyLnJlcGxhY2UobG9hZGVkX3RyYW5zZm9ybXNbdF0ucmVnZXhwLCBjb21iaW5lZF9zb3VyY2UpO1xuICAgICAgICAgICAgfVxuICAgICAgICB9XG5cbiAgICAgICAgLy8gQ2xlYW4tdXAgYW55ICNwcmFnbWFzIHRoYXQgd2VyZW4ndCByZXBsYWNlZCAodG8gcHJldmVudCBjb21waWxlciB3YXJuaW5ncylcbiAgICAgICAgdmFyIHJlZ2V4cCA9IG5ldyBSZWdFeHAoJ15cXFxccyojcHJhZ21hXFxcXHMrdGFuZ3JhbTpcXFxccytcXFxcdytcXFxccyokJywgJ2dtJyk7XG4gICAgICAgIHRoaXMuY29tcHV0ZWRfdmVydGV4X3NoYWRlciA9IHRoaXMuY29tcHV0ZWRfdmVydGV4X3NoYWRlci5yZXBsYWNlKHJlZ2V4cCwgJycpO1xuICAgICAgICB0aGlzLmNvbXB1dGVkX2ZyYWdtZW50X3NoYWRlciA9IHRoaXMuY29tcHV0ZWRfZnJhZ21lbnRfc2hhZGVyLnJlcGxhY2UocmVnZXhwLCAnJyk7XG5cbiAgICAgICAgLy8gQnVpbGQgJiBpbmplY3QgZGVmaW5lc1xuICAgICAgICAvLyBUaGlzIGlzIGRvbmUgKmFmdGVyKiBjb2RlIGluamVjdGlvbiBzbyB0aGF0IHdlIGNhbiBhZGQgZGVmaW5lcyBmb3Igd2hpY2ggY29kZSBwb2ludHMgd2VyZSBpbmplY3RlZFxuICAgICAgICB2YXIgZGVmaW5lX3N0ciA9IEdMUHJvZ3JhbS5idWlsZERlZmluZVN0cmluZyhkZWZpbmVzKTtcbiAgICAgICAgdGhpcy5jb21wdXRlZF92ZXJ0ZXhfc2hhZGVyID0gZGVmaW5lX3N0ciArIHRoaXMuY29tcHV0ZWRfdmVydGV4X3NoYWRlcjtcbiAgICAgICAgdGhpcy5jb21wdXRlZF9mcmFnbWVudF9zaGFkZXIgPSBkZWZpbmVfc3RyICsgdGhpcy5jb21wdXRlZF9mcmFnbWVudF9zaGFkZXI7XG5cbiAgICAgICAgLy8gSW5jbHVkZSBwcm9ncmFtIGluZm8gdXNlZnVsIGZvciBkZWJ1Z2dpbmdcbiAgICAgICAgdmFyIGluZm8gPSAodGhpcy5uYW1lID8gKHRoaXMubmFtZSArICcgLyBpZCAnICsgdGhpcy5pZCkgOiAoJ2lkICcgKyB0aGlzLmlkKSk7XG4gICAgICAgIHRoaXMuY29tcHV0ZWRfdmVydGV4X3NoYWRlciA9ICcvLyBQcm9ncmFtOiAnICsgaW5mbyArICdcXG4nICsgdGhpcy5jb21wdXRlZF92ZXJ0ZXhfc2hhZGVyO1xuICAgICAgICB0aGlzLmNvbXB1dGVkX2ZyYWdtZW50X3NoYWRlciA9ICcvLyBQcm9ncmFtOiAnICsgaW5mbyArICdcXG4nICsgdGhpcy5jb21wdXRlZF9mcmFnbWVudF9zaGFkZXI7XG5cbiAgICAgICAgLy8gQ29tcGlsZSAmIHNldCB1bmlmb3JtcyB0byBjYWNoZWQgdmFsdWVzXG4gICAgICAgIHRyeSB7XG4gICAgICAgICAgICB0aGlzLnByb2dyYW0gPSBHTC51cGRhdGVQcm9ncmFtKHRoaXMuZ2wsIHRoaXMucHJvZ3JhbSwgdGhpcy5jb21wdXRlZF92ZXJ0ZXhfc2hhZGVyLCB0aGlzLmNvbXB1dGVkX2ZyYWdtZW50X3NoYWRlcik7XG4gICAgICAgICAgICAvLyB0aGlzLnByb2dyYW0gPSBHTC51cGRhdGVQcm9ncmFtKHRoaXMuZ2wsIG51bGwsIHRoaXMuY29tcHV0ZWRfdmVydGV4X3NoYWRlciwgdGhpcy5jb21wdXRlZF9mcmFnbWVudF9zaGFkZXIpO1xuICAgICAgICAgICAgdGhpcy5jb21waWxlZCA9IHRydWU7XG4gICAgICAgIH1cbiAgICAgICAgY2F0Y2ggKGUpIHtcbiAgICAgICAgICAgIHRoaXMucHJvZ3JhbSA9IG51bGw7XG4gICAgICAgICAgICB0aGlzLmNvbXBpbGVkID0gZmFsc2U7XG4gICAgICAgIH1cblxuICAgICAgICB0aGlzLnVzZSgpO1xuICAgICAgICB0aGlzLnJlZnJlc2hVbmlmb3JtcygpO1xuICAgICAgICB0aGlzLnJlZnJlc2hBdHRyaWJ1dGVzKCk7XG5cbiAgICAgICAgLy8gTm90aWZ5IGNhbGxlclxuICAgICAgICBpZiAodHlwZW9mIGNhbGxiYWNrID09ICdmdW5jdGlvbicpIHtcbiAgICAgICAgICAgIGNhbGxiYWNrKCk7XG4gICAgICAgIH1cbiAgICB9KTtcbn07XG5cbi8vIFJldHJpZXZlIGEgc2luZ2xlIHRyYW5zZm9ybSwgZm9yIGEgZ2l2ZW4gaW5qZWN0aW9uIHBvaW50LCBhdCBhIGNlcnRhaW4gaW5kZXggKHRvIHByZXNlcnZlIG9yaWdpbmFsIG9yZGVyKVxuLy8gQ2FuIGJlIGFzeW5jLCBjYWxscyAnY29tcGxldGUnIGNhbGxiYWNrIHdoZW4gZG9uZVxuR0xQcm9ncmFtLmxvYWRUcmFuc2Zvcm0gPSBmdW5jdGlvbiAodHJhbnNmb3JtcywgYmxvY2ssIGtleSwgaW5kZXgsIGNvbXBsZXRlKSB7XG4gICAgLy8gQ2FuIGJlIGFuIGlubGluZSBibG9jayBvZiBHTFNMLCBvciBhIFVSTCB0byByZXRyaWV2ZSBHTFNMIGJsb2NrIGZyb21cbiAgICB2YXIgdHlwZSwgdmFsdWUsIHNvdXJjZTtcblxuICAgIC8vIElubGluZSBjb2RlXG4gICAgaWYgKHR5cGVvZiBibG9jayA9PSAnc3RyaW5nJykge1xuICAgICAgICB0cmFuc2Zvcm1zW2tleV0ubGlzdFtpbmRleF0gPSBibG9jaztcbiAgICAgICAgY29tcGxldGUoKTtcbiAgICB9XG4gICAgLy8gUmVtb3RlIGNvZGVcbiAgICBlbHNlIGlmICh0eXBlb2YgYmxvY2sgPT0gJ29iamVjdCcgJiYgYmxvY2sudXJsKSB7XG4gICAgICAgIHZhciByZXEgPSBuZXcgWE1MSHR0cFJlcXVlc3QoKTtcblxuICAgICAgICByZXEub25sb2FkID0gZnVuY3Rpb24gKCkge1xuICAgICAgICAgICAgc291cmNlID0gcmVxLnJlc3BvbnNlO1xuICAgICAgICAgICAgdHJhbnNmb3Jtc1trZXldLmxpc3RbaW5kZXhdID0gc291cmNlO1xuICAgICAgICAgICAgY29tcGxldGUoKTtcbiAgICAgICAgfTtcbiAgICAgICAgcmVxLm9wZW4oJ0dFVCcsIFV0aWxzLnVybEZvclBhdGgoYmxvY2sudXJsKSArICc/JyArICgrbmV3IERhdGUoKSksIHRydWUgLyogYXN5bmMgZmxhZyAqLyk7XG4gICAgICAgIHJlcS5yZXNwb25zZVR5cGUgPSAndGV4dCc7XG4gICAgICAgIHJlcS5zZW5kKCk7XG4gICAgfVxufTtcblxuLy8gTWFrZSBsaXN0IG9mIGRlZmluZXMgKGdsb2JhbCwgdGhlbiBwcm9ncmFtLXNwZWNpZmljKVxuR0xQcm9ncmFtLnByb3RvdHlwZS5idWlsZERlZmluZUxpc3QgPSBmdW5jdGlvbiAoKSB7XG4gICAgdmFyIGQsIGRlZmluZXMgPSB7fTtcbiAgICBmb3IgKGQgaW4gR0xQcm9ncmFtLmRlZmluZXMpIHtcbiAgICAgICAgZGVmaW5lc1tkXSA9IEdMUHJvZ3JhbS5kZWZpbmVzW2RdO1xuICAgIH1cbiAgICBmb3IgKGQgaW4gdGhpcy5kZWZpbmVzKSB7XG4gICAgICAgIGRlZmluZXNbZF0gPSB0aGlzLmRlZmluZXNbZF07XG4gICAgfVxuICAgIHJldHVybiBkZWZpbmVzO1xufTtcblxuLy8gTWFrZSBsaXN0IG9mIHNoYWRlciB0cmFuc2Zvcm1zIChnbG9iYWwsIHRoZW4gcHJvZ3JhbS1zcGVjaWZpYylcbkdMUHJvZ3JhbS5wcm90b3R5cGUuYnVpbGRTaGFkZXJUcmFuc2Zvcm1MaXN0ID0gZnVuY3Rpb24gKCkge1xuICAgIHZhciBkLCB0cmFuc2Zvcm1zID0ge307XG4gICAgZm9yIChkIGluIEdMUHJvZ3JhbS50cmFuc2Zvcm1zKSB7XG4gICAgICAgIHRyYW5zZm9ybXNbZF0gPSBbXTtcblxuICAgICAgICBpZiAodHlwZW9mIEdMUHJvZ3JhbS50cmFuc2Zvcm1zW2RdID09PSAnb2JqZWN0JyAmJiBHTFByb2dyYW0udHJhbnNmb3Jtc1tkXS5sZW5ndGggPj0gMCkge1xuICAgICAgICAgICAgdHJhbnNmb3Jtc1tkXS5wdXNoKC4uLkdMUHJvZ3JhbS50cmFuc2Zvcm1zW2RdKTtcbiAgICAgICAgfVxuICAgICAgICBlbHNlIHtcbiAgICAgICAgICAgIHRyYW5zZm9ybXNbZF0gPSBbR0xQcm9ncmFtLnRyYW5zZm9ybXNbZF1dO1xuICAgICAgICB9XG4gICAgfVxuICAgIGZvciAoZCBpbiB0aGlzLnRyYW5zZm9ybXMpIHtcbiAgICAgICAgdHJhbnNmb3Jtc1tkXSA9IHRyYW5zZm9ybXNbZF0gfHwgW107XG5cbiAgICAgICAgaWYgKHR5cGVvZiB0aGlzLnRyYW5zZm9ybXNbZF0gPT09ICdvYmplY3QnICYmIHRoaXMudHJhbnNmb3Jtc1tkXS5sZW5ndGggPj0gMCkge1xuICAgICAgICAgICAgdHJhbnNmb3Jtc1tkXS5wdXNoKC4uLnRoaXMudHJhbnNmb3Jtc1tkXSk7XG4gICAgICAgIH1cbiAgICAgICAgZWxzZSB7XG4gICAgICAgICAgICB0cmFuc2Zvcm1zW2RdLnB1c2godGhpcy50cmFuc2Zvcm1zW2RdKTtcbiAgICAgICAgfVxuICAgIH1cbiAgICByZXR1cm4gdHJhbnNmb3Jtcztcbn07XG5cbi8vIFR1cm4gI2RlZmluZXMgaW50byBhIGNvbWJpbmVkIHN0cmluZ1xuR0xQcm9ncmFtLmJ1aWxkRGVmaW5lU3RyaW5nID0gZnVuY3Rpb24gKGRlZmluZXMpIHtcbiAgICB2YXIgZGVmaW5lX3N0ciA9IFwiXCI7XG4gICAgZm9yICh2YXIgZCBpbiBkZWZpbmVzKSB7XG4gICAgICAgIGlmIChkZWZpbmVzW2RdID09IGZhbHNlKSB7XG4gICAgICAgICAgICBjb250aW51ZTtcbiAgICAgICAgfVxuICAgICAgICBlbHNlIGlmICh0eXBlb2YgZGVmaW5lc1tkXSA9PSAnYm9vbGVhbicgJiYgZGVmaW5lc1tkXSA9PSB0cnVlKSB7IC8vIGJvb2xlYW5zIGFyZSBzaW1wbGUgZGVmaW5lcyB3aXRoIG5vIHZhbHVlXG4gICAgICAgICAgICBkZWZpbmVfc3RyICs9IFwiI2RlZmluZSBcIiArIGQgKyBcIlxcblwiO1xuICAgICAgICB9XG4gICAgICAgIGVsc2UgaWYgKHR5cGVvZiBkZWZpbmVzW2RdID09ICdudW1iZXInICYmIE1hdGguZmxvb3IoZGVmaW5lc1tkXSkgPT0gZGVmaW5lc1tkXSkgeyAvLyBpbnQgdG8gZmxvYXQgY29udmVyc2lvbiB0byBzYXRpc2Z5IEdMU0wgZmxvYXRzXG4gICAgICAgICAgICBkZWZpbmVfc3RyICs9IFwiI2RlZmluZSBcIiArIGQgKyBcIiBcIiArIGRlZmluZXNbZF0udG9GaXhlZCgxKSArIFwiXFxuXCI7XG4gICAgICAgIH1cbiAgICAgICAgZWxzZSB7IC8vIGFueSBvdGhlciBmbG9hdCBvciBzdHJpbmcgdmFsdWVcbiAgICAgICAgICAgIGRlZmluZV9zdHIgKz0gXCIjZGVmaW5lIFwiICsgZCArIFwiIFwiICsgZGVmaW5lc1tkXSArIFwiXFxuXCI7XG4gICAgICAgIH1cbiAgICB9XG4gICAgcmV0dXJuIGRlZmluZV9zdHI7XG59O1xuXG4vLyBTZXQgdW5pZm9ybXMgZnJvbSBhIEpTIG9iamVjdCwgd2l0aCBpbmZlcnJlZCB0eXBlc1xuR0xQcm9ncmFtLnByb3RvdHlwZS5zZXRVbmlmb3JtcyA9IGZ1bmN0aW9uICh1bmlmb3JtcylcbntcbiAgICAvLyBUT0RPOiBvbmx5IHVwZGF0ZSB1bmlmb3JtcyB3aGVuIGNoYW5nZWRcbiAgICB2YXIgdGV4dHVyZV91bml0ID0gMDtcblxuICAgIGZvciAodmFyIHUgaW4gdW5pZm9ybXMpIHtcbiAgICAgICAgdmFyIHVuaWZvcm0gPSB1bmlmb3Jtc1t1XTtcblxuICAgICAgICAvLyBTaW5nbGUgZmxvYXRcbiAgICAgICAgaWYgKHR5cGVvZiB1bmlmb3JtID09ICdudW1iZXInKSB7XG4gICAgICAgICAgICB0aGlzLnVuaWZvcm0oJzFmJywgdSwgdW5pZm9ybSk7XG4gICAgICAgIH1cbiAgICAgICAgLy8gTXVsdGlwbGUgZmxvYXRzIC0gdmVjdG9yIG9yIGFycmF5XG4gICAgICAgIGVsc2UgaWYgKHR5cGVvZiB1bmlmb3JtID09ICdvYmplY3QnKSB7XG4gICAgICAgICAgICAvLyBmbG9hdCB2ZWN0b3JzICh2ZWMyLCB2ZWMzLCB2ZWM0KVxuICAgICAgICAgICAgaWYgKHVuaWZvcm0ubGVuZ3RoID49IDIgJiYgdW5pZm9ybS5sZW5ndGggPD0gNCkge1xuICAgICAgICAgICAgICAgIHRoaXMudW5pZm9ybSh1bmlmb3JtLmxlbmd0aCArICdmdicsIHUsIHVuaWZvcm0pO1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgLy8gZmxvYXQgYXJyYXlcbiAgICAgICAgICAgIGVsc2UgaWYgKHVuaWZvcm0ubGVuZ3RoID4gNCkge1xuICAgICAgICAgICAgICAgIHRoaXMudW5pZm9ybSgnMWZ2JywgdSArICdbMF0nLCB1bmlmb3JtKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIC8vIFRPRE86IGFzc3VtZSBtYXRyaXggZm9yICh0eXBlb2YgPT0gRmxvYXQzMkFycmF5ICYmIGxlbmd0aCA9PSAxNik/XG4gICAgICAgIH1cbiAgICAgICAgLy8gQm9vbGVhblxuICAgICAgICBlbHNlIGlmICh0eXBlb2YgdW5pZm9ybSA9PSAnYm9vbGVhbicpIHtcbiAgICAgICAgICAgIHRoaXMudW5pZm9ybSgnMWknLCB1LCB1bmlmb3JtKTtcbiAgICAgICAgfVxuICAgICAgICAvLyBUZXh0dXJlXG4gICAgICAgIGVsc2UgaWYgKHR5cGVvZiB1bmlmb3JtID09ICdzdHJpbmcnKSB7XG4gICAgICAgICAgICB2YXIgdGV4dHVyZSA9IEdMVGV4dHVyZS50ZXh0dXJlc1t1bmlmb3JtXTtcbiAgICAgICAgICAgIGlmICh0ZXh0dXJlID09IG51bGwpIHtcbiAgICAgICAgICAgICAgICB0ZXh0dXJlID0gbmV3IEdMVGV4dHVyZSh0aGlzLmdsLCB1bmlmb3JtKTtcbiAgICAgICAgICAgICAgICB0ZXh0dXJlLmxvYWQodW5pZm9ybSk7XG4gICAgICAgICAgICB9XG5cbiAgICAgICAgICAgIHRleHR1cmUuYmluZCh0ZXh0dXJlX3VuaXQpO1xuICAgICAgICAgICAgdGhpcy51bmlmb3JtKCcxaScsIHUsIHRleHR1cmVfdW5pdCk7XG4gICAgICAgICAgICB0ZXh0dXJlX3VuaXQrKztcbiAgICAgICAgfVxuICAgICAgICAvLyBUT0RPOiBzdXBwb3J0IG90aGVyIG5vbi1mbG9hdCB0eXBlcz8gKGludCwgZXRjLilcbiAgICB9XG59O1xuXG4vLyBleDogcHJvZ3JhbS51bmlmb3JtKCczZicsICdwb3NpdGlvbicsIHgsIHksIHopO1xuLy8gVE9ETzogb25seSB1cGRhdGUgdW5pZm9ybXMgd2hlbiBjaGFuZ2VkXG5HTFByb2dyYW0ucHJvdG90eXBlLnVuaWZvcm0gPSBmdW5jdGlvbiAobWV0aG9kLCBuYW1lKSAvLyBtZXRob2QtYXBwcm9wcmlhdGUgYXJndW1lbnRzIGZvbGxvd1xue1xuICAgIGlmICghdGhpcy5jb21waWxlZCkge1xuICAgICAgICByZXR1cm47XG4gICAgfVxuXG4gICAgdmFyIHVuaWZvcm0gPSAodGhpcy51bmlmb3Jtc1tuYW1lXSA9IHRoaXMudW5pZm9ybXNbbmFtZV0gfHwge30pO1xuICAgIHVuaWZvcm0ubmFtZSA9IG5hbWU7XG4gICAgdW5pZm9ybS5sb2NhdGlvbiA9IHVuaWZvcm0ubG9jYXRpb24gfHwgdGhpcy5nbC5nZXRVbmlmb3JtTG9jYXRpb24odGhpcy5wcm9ncmFtLCBuYW1lKTtcbiAgICB1bmlmb3JtLm1ldGhvZCA9ICd1bmlmb3JtJyArIG1ldGhvZDtcbiAgICB1bmlmb3JtLnZhbHVlcyA9IEFycmF5LnByb3RvdHlwZS5zbGljZS5jYWxsKGFyZ3VtZW50cywgMik7XG4gICAgdGhpcy51cGRhdGVVbmlmb3JtKG5hbWUpO1xufTtcblxuLy8gU2V0IGEgc2luZ2xlIHVuaWZvcm1cbkdMUHJvZ3JhbS5wcm90b3R5cGUudXBkYXRlVW5pZm9ybSA9IGZ1bmN0aW9uIChuYW1lKVxue1xuICAgIGlmICghdGhpcy5jb21waWxlZCkge1xuICAgICAgICByZXR1cm47XG4gICAgfVxuXG4gICAgdmFyIHVuaWZvcm0gPSB0aGlzLnVuaWZvcm1zW25hbWVdO1xuICAgIGlmICh1bmlmb3JtID09IG51bGwgfHwgdW5pZm9ybS5sb2NhdGlvbiA9PSBudWxsKSB7XG4gICAgICAgIHJldHVybjtcbiAgICB9XG5cbiAgICB0aGlzLnVzZSgpO1xuICAgIHRoaXMuZ2xbdW5pZm9ybS5tZXRob2RdLmFwcGx5KHRoaXMuZ2wsIFt1bmlmb3JtLmxvY2F0aW9uXS5jb25jYXQodW5pZm9ybS52YWx1ZXMpKTsgLy8gY2FsbCBhcHByb3ByaWF0ZSBHTCB1bmlmb3JtIG1ldGhvZCBhbmQgcGFzcyB0aHJvdWdoIGFyZ3VtZW50c1xufTtcblxuLy8gUmVmcmVzaCB1bmlmb3JtIGxvY2F0aW9ucyBhbmQgc2V0IHRvIGxhc3QgY2FjaGVkIHZhbHVlc1xuR0xQcm9ncmFtLnByb3RvdHlwZS5yZWZyZXNoVW5pZm9ybXMgPSBmdW5jdGlvbiAoKVxue1xuICAgIGlmICghdGhpcy5jb21waWxlZCkge1xuICAgICAgICByZXR1cm47XG4gICAgfVxuXG4gICAgZm9yICh2YXIgdSBpbiB0aGlzLnVuaWZvcm1zKSB7XG4gICAgICAgIHRoaXMudW5pZm9ybXNbdV0ubG9jYXRpb24gPSB0aGlzLmdsLmdldFVuaWZvcm1Mb2NhdGlvbih0aGlzLnByb2dyYW0sIHUpO1xuICAgICAgICB0aGlzLnVwZGF0ZVVuaWZvcm0odSk7XG4gICAgfVxufTtcblxuR0xQcm9ncmFtLnByb3RvdHlwZS5yZWZyZXNoQXR0cmlidXRlcyA9IGZ1bmN0aW9uICgpXG57XG4gICAgLy8gdmFyIGxlbiA9IHRoaXMuZ2wuZ2V0UHJvZ3JhbVBhcmFtZXRlcih0aGlzLnByb2dyYW0sIHRoaXMuZ2wuQUNUSVZFX0FUVFJJQlVURVMpO1xuICAgIC8vIGZvciAodmFyIGk9MDsgaSA8IGxlbjsgaSsrKSB7XG4gICAgLy8gICAgIHZhciBhID0gdGhpcy5nbC5nZXRBY3RpdmVBdHRyaWIodGhpcy5wcm9ncmFtLCBpKTtcbiAgICAvLyAgICAgY29uc29sZS5sb2coYSk7XG4gICAgLy8gfVxuICAgIHRoaXMuYXR0cmlicyA9IHt9O1xufTtcblxuLy8gR2V0IHRoZSBsb2NhdGlvbiBvZiBhIHZlcnRleCBhdHRyaWJ1dGVcbkdMUHJvZ3JhbS5wcm90b3R5cGUuYXR0cmlidXRlID0gZnVuY3Rpb24gKG5hbWUpXG57XG4gICAgaWYgKCF0aGlzLmNvbXBpbGVkKSB7XG4gICAgICAgIHJldHVybjtcbiAgICB9XG5cbiAgICB2YXIgYXR0cmliID0gKHRoaXMuYXR0cmlic1tuYW1lXSA9IHRoaXMuYXR0cmlic1tuYW1lXSB8fCB7fSk7XG4gICAgaWYgKGF0dHJpYi5sb2NhdGlvbiAhPSBudWxsKSB7XG4gICAgICAgIHJldHVybiBhdHRyaWI7XG4gICAgfVxuXG4gICAgYXR0cmliLm5hbWUgPSBuYW1lO1xuICAgIGF0dHJpYi5sb2NhdGlvbiA9IHRoaXMuZ2wuZ2V0QXR0cmliTG9jYXRpb24odGhpcy5wcm9ncmFtLCBuYW1lKTtcblxuICAgIC8vIHZhciBpbmZvID0gdGhpcy5nbC5nZXRBY3RpdmVBdHRyaWIodGhpcy5wcm9ncmFtLCBhdHRyaWIubG9jYXRpb24pO1xuICAgIC8vIGF0dHJpYi50eXBlID0gaW5mby50eXBlO1xuICAgIC8vIGF0dHJpYi5zaXplID0gaW5mby5zaXplO1xuXG4gICAgcmV0dXJuIGF0dHJpYjtcbn07XG4iLCIvLyBHZW5lcmF0ZWQgZnJvbSBHTFNMIGZpbGVzLCBkb24ndCBlZGl0IVxudmFyIHNoYWRlcl9zb3VyY2VzID0ge307XG5cbnNoYWRlcl9zb3VyY2VzWydwb2ludF9mcmFnbWVudCddID1cblwiXFxuXCIgK1xuXCIjZGVmaW5lIEdMU0xJRlkgMVxcblwiICtcblwiXFxuXCIgK1xuXCJ1bmlmb3JtIHZlYzIgdV9yZXNvbHV0aW9uO1xcblwiICtcblwidmFyeWluZyB2ZWMzIHZfY29sb3I7XFxuXCIgK1xuXCJ2YXJ5aW5nIHZlYzIgdl90ZXhjb29yZDtcXG5cIiArXG5cInZvaWQgbWFpbih2b2lkKSB7XFxuXCIgK1xuXCIgIHZlYzMgY29sb3IgPSB2X2NvbG9yO1xcblwiICtcblwiICB2ZWMzIGxpZ2h0aW5nID0gdmVjMygxLik7XFxuXCIgK1xuXCIgIGZsb2F0IGxlbiA9IGxlbmd0aCh2X3RleGNvb3JkKTtcXG5cIiArXG5cIiAgaWYobGVuID4gMS4pIHtcXG5cIiArXG5cIiAgICBkaXNjYXJkO1xcblwiICtcblwiICB9XFxuXCIgK1xuXCIgIGNvbG9yICo9ICgxLiAtIHNtb290aHN0ZXAoLjI1LCAxLiwgbGVuKSkgKyAwLjU7XFxuXCIgK1xuXCIgICNwcmFnbWEgdGFuZ3JhbTogZnJhZ21lbnRcXG5cIiArXG5cIiAgZ2xfRnJhZ0NvbG9yID0gdmVjNChjb2xvciwgMS4pO1xcblwiICtcblwifVxcblwiICtcblwiXCI7XG5cbnNoYWRlcl9zb3VyY2VzWydwb2ludF92ZXJ0ZXgnXSA9XG5cIlxcblwiICtcblwiI2RlZmluZSBHTFNMSUZZIDFcXG5cIiArXG5cIlxcblwiICtcblwidW5pZm9ybSBtYXQ0IHVfdGlsZV92aWV3O1xcblwiICtcblwidW5pZm9ybSBmbG9hdCB1X251bV9sYXllcnM7XFxuXCIgK1xuXCJhdHRyaWJ1dGUgdmVjMyBhX3Bvc2l0aW9uO1xcblwiICtcblwiYXR0cmlidXRlIHZlYzIgYV90ZXhjb29yZDtcXG5cIiArXG5cImF0dHJpYnV0ZSB2ZWMzIGFfY29sb3I7XFxuXCIgK1xuXCJhdHRyaWJ1dGUgZmxvYXQgYV9sYXllcjtcXG5cIiArXG5cInZhcnlpbmcgdmVjMyB2X2NvbG9yO1xcblwiICtcblwidmFyeWluZyB2ZWMyIHZfdGV4Y29vcmQ7XFxuXCIgK1xuXCIjaWYgZGVmaW5lZChGRUFUVVJFX1NFTEVDVElPTilcXG5cIiArXG5cIlxcblwiICtcblwiYXR0cmlidXRlIHZlYzQgYV9zZWxlY3Rpb25fY29sb3I7XFxuXCIgK1xuXCJ2YXJ5aW5nIHZlYzQgdl9zZWxlY3Rpb25fY29sb3I7XFxuXCIgK1xuXCIjZW5kaWZcXG5cIiArXG5cIlxcblwiICtcblwiZmxvYXQgYV94X2NhbGN1bGF0ZVooZmxvYXQgeiwgZmxvYXQgbGF5ZXIsIGNvbnN0IGZsb2F0IG51bV9sYXllcnMsIGNvbnN0IGZsb2F0IHpfbGF5ZXJfc2NhbGUpIHtcXG5cIiArXG5cIiAgZmxvYXQgel9sYXllcl9yYW5nZSA9IChudW1fbGF5ZXJzICsgMS4pICogel9sYXllcl9zY2FsZTtcXG5cIiArXG5cIiAgZmxvYXQgel9sYXllciA9IChsYXllciArIDEuKSAqIHpfbGF5ZXJfc2NhbGU7XFxuXCIgK1xuXCIgIHogPSB6X2xheWVyICsgY2xhbXAoeiwgMC4sIHpfbGF5ZXJfc2NhbGUpO1xcblwiICtcblwiICB6ID0gKHpfbGF5ZXJfcmFuZ2UgLSB6KSAvIHpfbGF5ZXJfcmFuZ2U7XFxuXCIgK1xuXCIgIHJldHVybiB6O1xcblwiICtcblwifVxcblwiICtcblwiI3ByYWdtYSB0YW5ncmFtOiBnbG9iYWxzXFxuXCIgK1xuXCJcXG5cIiArXG5cIiNwcmFnbWEgdGFuZ3JhbTogY2FtZXJhXFxuXCIgK1xuXCJcXG5cIiArXG5cInZvaWQgbWFpbigpIHtcXG5cIiArXG5cIiAgXFxuXCIgK1xuXCIgICNpZiBkZWZpbmVkKEZFQVRVUkVfU0VMRUNUSU9OKVxcblwiICtcblwiICBpZihhX3NlbGVjdGlvbl9jb2xvci54eXogPT0gdmVjMygwLikpIHtcXG5cIiArXG5cIiAgICBnbF9Qb3NpdGlvbiA9IHZlYzQoMC4sIDAuLCAwLiwgMS4pO1xcblwiICtcblwiICAgIHJldHVybjtcXG5cIiArXG5cIiAgfVxcblwiICtcblwiICB2X3NlbGVjdGlvbl9jb2xvciA9IGFfc2VsZWN0aW9uX2NvbG9yO1xcblwiICtcblwiICAjZW5kaWZcXG5cIiArXG5cIiAgdmVjNCBwb3NpdGlvbiA9IHVfdGlsZV92aWV3ICogdmVjNChhX3Bvc2l0aW9uLCAxLik7XFxuXCIgK1xuXCIgICNwcmFnbWEgdGFuZ3JhbTogdmVydGV4XFxuXCIgK1xuXCIgIHZfY29sb3IgPSBhX2NvbG9yO1xcblwiICtcblwiICB2X3RleGNvb3JkID0gYV90ZXhjb29yZDtcXG5cIiArXG5cIiAgY2FtZXJhUHJvamVjdGlvbihwb3NpdGlvbik7XFxuXCIgK1xuXCIgIHBvc2l0aW9uLnogLT0gKGFfbGF5ZXIgKyAxLikgKiAuMDAxO1xcblwiICtcblwiICBnbF9Qb3NpdGlvbiA9IHBvc2l0aW9uO1xcblwiICtcblwifVxcblwiICtcblwiXCI7XG5cbnNoYWRlcl9zb3VyY2VzWydwb2x5Z29uX2ZyYWdtZW50J10gPVxuXCJcXG5cIiArXG5cIiNkZWZpbmUgR0xTTElGWSAxXFxuXCIgK1xuXCJcXG5cIiArXG5cInVuaWZvcm0gdmVjMiB1X3Jlc29sdXRpb247XFxuXCIgK1xuXCJ1bmlmb3JtIHZlYzIgdV9hc3BlY3Q7XFxuXCIgK1xuXCJ1bmlmb3JtIGZsb2F0IHVfbWV0ZXJzX3Blcl9waXhlbDtcXG5cIiArXG5cInVuaWZvcm0gZmxvYXQgdV90aW1lO1xcblwiICtcblwidW5pZm9ybSBmbG9hdCB1X21hcF96b29tO1xcblwiICtcblwidW5pZm9ybSB2ZWMyIHVfbWFwX2NlbnRlcjtcXG5cIiArXG5cInVuaWZvcm0gdmVjMiB1X3RpbGVfb3JpZ2luO1xcblwiICtcblwidW5pZm9ybSBmbG9hdCB1X3Rlc3Q7XFxuXCIgK1xuXCJ1bmlmb3JtIGZsb2F0IHVfdGVzdDI7XFxuXCIgK1xuXCJ2YXJ5aW5nIHZlYzMgdl9jb2xvcjtcXG5cIiArXG5cInZhcnlpbmcgdmVjNCB2X3dvcmxkX3Bvc2l0aW9uO1xcblwiICtcblwiI2lmIGRlZmluZWQoV09STERfUE9TSVRJT05fV1JBUClcXG5cIiArXG5cIlxcblwiICtcblwidmVjMiB3b3JsZF9wb3NpdGlvbl9hbmNob3IgPSB2ZWMyKGZsb29yKHVfdGlsZV9vcmlnaW4gLyBXT1JMRF9QT1NJVElPTl9XUkFQKSAqIFdPUkxEX1BPU0lUSU9OX1dSQVApO1xcblwiICtcblwidmVjNCBhYnNvbHV0ZVdvcmxkUG9zaXRpb24oKSB7XFxuXCIgK1xuXCIgIHJldHVybiB2ZWM0KHZfd29ybGRfcG9zaXRpb24ueHkgKyB3b3JsZF9wb3NpdGlvbl9hbmNob3IsIHZfd29ybGRfcG9zaXRpb24ueiwgdl93b3JsZF9wb3NpdGlvbi53KTtcXG5cIiArXG5cIn1cXG5cIiArXG5cIiNlbHNlXFxuXCIgK1xuXCJcXG5cIiArXG5cInZlYzQgYWJzb2x1dGVXb3JsZFBvc2l0aW9uKCkge1xcblwiICtcblwiICByZXR1cm4gdl93b3JsZF9wb3NpdGlvbjtcXG5cIiArXG5cIn1cXG5cIiArXG5cIiNlbmRpZlxcblwiICtcblwiXFxuXCIgK1xuXCIjaWYgZGVmaW5lZChMSUdIVElOR19FTlZJUk9OTUVOVClcXG5cIiArXG5cIlxcblwiICtcblwidW5pZm9ybSBzYW1wbGVyMkQgdV9lbnZfbWFwO1xcblwiICtcblwiI2VuZGlmXFxuXCIgK1xuXCJcXG5cIiArXG5cIiNpZiAhZGVmaW5lZChMSUdIVElOR19WRVJURVgpXFxuXCIgK1xuXCJcXG5cIiArXG5cInZhcnlpbmcgdmVjNCB2X3Bvc2l0aW9uO1xcblwiICtcblwidmFyeWluZyB2ZWMzIHZfbm9ybWFsO1xcblwiICtcblwiI2Vsc2VcXG5cIiArXG5cIlxcblwiICtcblwidmFyeWluZyB2ZWMzIHZfbGlnaHRpbmc7XFxuXCIgK1xuXCIjZW5kaWZcXG5cIiArXG5cIlxcblwiICtcblwiY29uc3QgZmxvYXQgbGlnaHRfYW1iaWVudCA9IDAuNTtcXG5cIiArXG5cInZlYzMgYl94X3BvaW50TGlnaHQodmVjNCBwb3NpdGlvbiwgdmVjMyBub3JtYWwsIHZlYzMgY29sb3IsIHZlYzQgbGlnaHRfcG9zLCBmbG9hdCBsaWdodF9hbWJpZW50LCBjb25zdCBib29sIGJhY2tsaWdodCkge1xcblwiICtcblwiICB2ZWMzIGxpZ2h0X2RpciA9IG5vcm1hbGl6ZShwb3NpdGlvbi54eXogLSBsaWdodF9wb3MueHl6KTtcXG5cIiArXG5cIiAgY29sb3IgKj0gYWJzKG1heChmbG9hdChiYWNrbGlnaHQpICogLTEuLCBkb3Qobm9ybWFsLCBsaWdodF9kaXIgKiAtMS4wKSkpICsgbGlnaHRfYW1iaWVudDtcXG5cIiArXG5cIiAgcmV0dXJuIGNvbG9yO1xcblwiICtcblwifVxcblwiICtcblwidmVjMyBjX3hfc3BlY3VsYXJMaWdodCh2ZWM0IHBvc2l0aW9uLCB2ZWMzIG5vcm1hbCwgdmVjMyBjb2xvciwgdmVjNCBsaWdodF9wb3MsIGZsb2F0IGxpZ2h0X2FtYmllbnQsIGNvbnN0IGJvb2wgYmFja2xpZ2h0KSB7XFxuXCIgK1xuXCIgIHZlYzMgbGlnaHRfZGlyID0gbm9ybWFsaXplKHBvc2l0aW9uLnh5eiAtIGxpZ2h0X3Bvcy54eXopO1xcblwiICtcblwiICB2ZWMzIHZpZXdfcG9zID0gdmVjMygwLiwgMC4sIDUwMC4pO1xcblwiICtcblwiICB2ZWMzIHZpZXdfZGlyID0gbm9ybWFsaXplKHBvc2l0aW9uLnh5eiAtIHZpZXdfcG9zLnh5eik7XFxuXCIgK1xuXCIgIHZlYzMgc3BlY3VsYXJSZWZsZWN0aW9uO1xcblwiICtcblwiICBpZihkb3Qobm9ybWFsLCAtbGlnaHRfZGlyKSA8IDAuMCkge1xcblwiICtcblwiICAgIHNwZWN1bGFyUmVmbGVjdGlvbiA9IHZlYzMoMC4wLCAwLjAsIDAuMCk7XFxuXCIgK1xuXCIgIH0gZWxzZSB7XFxuXCIgK1xuXCIgICAgZmxvYXQgYXR0ZW51YXRpb24gPSAxLjA7XFxuXCIgK1xuXCIgICAgZmxvYXQgbGlnaHRTcGVjdWxhclRlcm0gPSAxLjA7XFxuXCIgK1xuXCIgICAgZmxvYXQgbWF0ZXJpYWxTcGVjdWxhclRlcm0gPSAxMC4wO1xcblwiICtcblwiICAgIGZsb2F0IG1hdGVyaWFsU2hpbmluZXNzVGVybSA9IDEwLjA7XFxuXCIgK1xuXCIgICAgc3BlY3VsYXJSZWZsZWN0aW9uID0gYXR0ZW51YXRpb24gKiB2ZWMzKGxpZ2h0U3BlY3VsYXJUZXJtKSAqIHZlYzMobWF0ZXJpYWxTcGVjdWxhclRlcm0pICogcG93KG1heCgwLjAsIGRvdChyZWZsZWN0KC1saWdodF9kaXIsIG5vcm1hbCksIHZpZXdfZGlyKSksIG1hdGVyaWFsU2hpbmluZXNzVGVybSk7XFxuXCIgK1xuXCIgIH1cXG5cIiArXG5cIiAgZmxvYXQgZGlmZnVzZSA9IGFicyhtYXgoZmxvYXQoYmFja2xpZ2h0KSAqIC0xLiwgZG90KG5vcm1hbCwgbGlnaHRfZGlyICogLTEuMCkpKTtcXG5cIiArXG5cIiAgY29sb3IgKj0gZGlmZnVzZSArIHNwZWN1bGFyUmVmbGVjdGlvbiArIGxpZ2h0X2FtYmllbnQ7XFxuXCIgK1xuXCIgIHJldHVybiBjb2xvcjtcXG5cIiArXG5cIn1cXG5cIiArXG5cInZlYzMgZF94X2RpcmVjdGlvbmFsTGlnaHQodmVjMyBub3JtYWwsIHZlYzMgY29sb3IsIHZlYzMgbGlnaHRfZGlyLCBmbG9hdCBsaWdodF9hbWJpZW50KSB7XFxuXCIgK1xuXCIgIGxpZ2h0X2RpciA9IG5vcm1hbGl6ZShsaWdodF9kaXIpO1xcblwiICtcblwiICBjb2xvciAqPSBkb3Qobm9ybWFsLCBsaWdodF9kaXIgKiAtMS4wKSArIGxpZ2h0X2FtYmllbnQ7XFxuXCIgK1xuXCIgIHJldHVybiBjb2xvcjtcXG5cIiArXG5cIn1cXG5cIiArXG5cInZlYzMgYV94X2xpZ2h0aW5nKHZlYzQgcG9zaXRpb24sIHZlYzMgbm9ybWFsLCB2ZWMzIGNvbG9yLCB2ZWM0IGxpZ2h0X3BvcywgdmVjNCBuaWdodF9saWdodF9wb3MsIHZlYzMgbGlnaHRfZGlyLCBmbG9hdCBsaWdodF9hbWJpZW50KSB7XFxuXCIgK1xuXCIgIFxcblwiICtcblwiICAjaWYgZGVmaW5lZChMSUdIVElOR19QT0lOVClcXG5cIiArXG5cIiAgY29sb3IgPSBiX3hfcG9pbnRMaWdodChwb3NpdGlvbiwgbm9ybWFsLCBjb2xvciwgbGlnaHRfcG9zLCBsaWdodF9hbWJpZW50LCB0cnVlKTtcXG5cIiArXG5cIiAgI2VsaWYgZGVmaW5lZChMSUdIVElOR19QT0lOVF9TUEVDVUxBUilcXG5cIiArXG5cIiAgY29sb3IgPSBjX3hfc3BlY3VsYXJMaWdodChwb3NpdGlvbiwgbm9ybWFsLCBjb2xvciwgbGlnaHRfcG9zLCBsaWdodF9hbWJpZW50LCB0cnVlKTtcXG5cIiArXG5cIiAgI2VsaWYgZGVmaW5lZChMSUdIVElOR19OSUdIVClcXG5cIiArXG5cIiAgY29sb3IgPSBiX3hfcG9pbnRMaWdodChwb3NpdGlvbiwgbm9ybWFsLCBjb2xvciwgbmlnaHRfbGlnaHRfcG9zLCAwLiwgZmFsc2UpO1xcblwiICtcblwiICAjZWxpZiBkZWZpbmVkKExJR0hUSU5HX0RJUkVDVElPTilcXG5cIiArXG5cIiAgY29sb3IgPSBkX3hfZGlyZWN0aW9uYWxMaWdodChub3JtYWwsIGNvbG9yLCBsaWdodF9kaXIsIGxpZ2h0X2FtYmllbnQpO1xcblwiICtcblwiICAjZWxzZVxcblwiICtcblwiICBjb2xvciA9IGNvbG9yO1xcblwiICtcblwiICAjZW5kaWZcXG5cIiArXG5cIiAgcmV0dXJuIGNvbG9yO1xcblwiICtcblwifVxcblwiICtcblwidmVjNCBlX3hfc3BoZXJpY2FsRW52aXJvbm1lbnRNYXAodmVjMyB2aWV3X3BvcywgdmVjMyBwb3NpdGlvbiwgdmVjMyBub3JtYWwsIHNhbXBsZXIyRCBlbnZtYXApIHtcXG5cIiArXG5cIiAgdmVjMyBleWUgPSBub3JtYWxpemUocG9zaXRpb24ueHl6IC0gdmlld19wb3MueHl6KTtcXG5cIiArXG5cIiAgaWYoZXllLnogPiAwLjAxKSB7XFxuXCIgK1xuXCIgICAgZXllLnogPSAwLjAxO1xcblwiICtcblwiICB9XFxuXCIgK1xuXCIgIHZlYzMgciA9IHJlZmxlY3QoZXllLCBub3JtYWwpO1xcblwiICtcblwiICBmbG9hdCBtID0gMi4gKiBzcXJ0KHBvdyhyLngsIDIuKSArIHBvdyhyLnksIDIuKSArIHBvdyhyLnogKyAxLiwgMi4pKTtcXG5cIiArXG5cIiAgdmVjMiB1diA9IHIueHkgLyBtICsgLjU7XFxuXCIgK1xuXCIgIHJldHVybiB0ZXh0dXJlMkQoZW52bWFwLCB1dik7XFxuXCIgK1xuXCJ9XFxuXCIgK1xuXCIjcHJhZ21hIHRhbmdyYW06IGdsb2JhbHNcXG5cIiArXG5cIlxcblwiICtcblwidm9pZCBtYWluKHZvaWQpIHtcXG5cIiArXG5cIiAgdmVjMyBjb2xvciA9IHZfY29sb3I7XFxuXCIgK1xuXCIgICNpZiBkZWZpbmVkKExJR0hUSU5HX0VOVklST05NRU5UKVxcblwiICtcblwiICB2ZWMzIHZpZXdfcG9zID0gdmVjMygwLiwgMC4sIDEwMC4gKiB1X21ldGVyc19wZXJfcGl4ZWwpO1xcblwiICtcblwiICBjb2xvciA9IGVfeF9zcGhlcmljYWxFbnZpcm9ubWVudE1hcCh2aWV3X3Bvcywgdl9wb3NpdGlvbi54eXosIHZfbm9ybWFsLCB1X2Vudl9tYXApLnJnYjtcXG5cIiArXG5cIiAgI2VuZGlmXFxuXCIgK1xuXCIgIFxcblwiICtcblwiICAjaWYgIWRlZmluZWQoTElHSFRJTkdfVkVSVEVYKSAvLyBkZWZhdWx0IHRvIHBlci1waXhlbCBsaWdodGluZ1xcblwiICtcblwiICB2ZWMzIGxpZ2h0aW5nID0gYV94X2xpZ2h0aW5nKHZfcG9zaXRpb24sIHZfbm9ybWFsLCB2ZWMzKDEuKSwgdmVjNCgwLiwgMC4sIDE1MC4gKiB1X21ldGVyc19wZXJfcGl4ZWwsIDEuKSwgdmVjNCgwLiwgMC4sIDUwLiAqIHVfbWV0ZXJzX3Blcl9waXhlbCwgMS4pLCB2ZWMzKDAuMiwgMC43LCAtMC41KSwgbGlnaHRfYW1iaWVudCk7XFxuXCIgK1xuXCIgICNlbHNlXFxuXCIgK1xuXCIgIHZlYzMgbGlnaHRpbmcgPSB2X2xpZ2h0aW5nO1xcblwiICtcblwiICAjZW5kaWZcXG5cIiArXG5cIiAgdmVjMyBjb2xvcl9wcmVsaWdodCA9IGNvbG9yO1xcblwiICtcblwiICBjb2xvciAqPSBsaWdodGluZztcXG5cIiArXG5cIiAgI3ByYWdtYSB0YW5ncmFtOiBmcmFnbWVudFxcblwiICtcblwiICBnbF9GcmFnQ29sb3IgPSB2ZWM0KGNvbG9yLCAxLjApO1xcblwiICtcblwifVxcblwiICtcblwiXCI7XG5cbnNoYWRlcl9zb3VyY2VzWydwb2x5Z29uX3ZlcnRleCddID1cblwiXFxuXCIgK1xuXCIjZGVmaW5lIEdMU0xJRlkgMVxcblwiICtcblwiXFxuXCIgK1xuXCJ1bmlmb3JtIHZlYzIgdV9yZXNvbHV0aW9uO1xcblwiICtcblwidW5pZm9ybSB2ZWMyIHVfYXNwZWN0O1xcblwiICtcblwidW5pZm9ybSBmbG9hdCB1X3RpbWU7XFxuXCIgK1xuXCJ1bmlmb3JtIGZsb2F0IHVfbWFwX3pvb207XFxuXCIgK1xuXCJ1bmlmb3JtIHZlYzIgdV9tYXBfY2VudGVyO1xcblwiICtcblwidW5pZm9ybSB2ZWMyIHVfdGlsZV9vcmlnaW47XFxuXCIgK1xuXCJ1bmlmb3JtIG1hdDQgdV90aWxlX3dvcmxkO1xcblwiICtcblwidW5pZm9ybSBtYXQ0IHVfdGlsZV92aWV3O1xcblwiICtcblwidW5pZm9ybSBmbG9hdCB1X21ldGVyc19wZXJfcGl4ZWw7XFxuXCIgK1xuXCJ1bmlmb3JtIGZsb2F0IHVfbnVtX2xheWVycztcXG5cIiArXG5cImF0dHJpYnV0ZSB2ZWMzIGFfcG9zaXRpb247XFxuXCIgK1xuXCJhdHRyaWJ1dGUgdmVjMyBhX25vcm1hbDtcXG5cIiArXG5cImF0dHJpYnV0ZSB2ZWMzIGFfY29sb3I7XFxuXCIgK1xuXCJhdHRyaWJ1dGUgZmxvYXQgYV9sYXllcjtcXG5cIiArXG5cInZhcnlpbmcgdmVjNCB2X3dvcmxkX3Bvc2l0aW9uO1xcblwiICtcblwidmFyeWluZyB2ZWMzIHZfY29sb3I7XFxuXCIgK1xuXCIjaWYgZGVmaW5lZChXT1JMRF9QT1NJVElPTl9XUkFQKVxcblwiICtcblwiXFxuXCIgK1xuXCJ2ZWMyIHdvcmxkX3Bvc2l0aW9uX2FuY2hvciA9IHZlYzIoZmxvb3IodV90aWxlX29yaWdpbiAvIFdPUkxEX1BPU0lUSU9OX1dSQVApICogV09STERfUE9TSVRJT05fV1JBUCk7XFxuXCIgK1xuXCJ2ZWM0IGFic29sdXRlV29ybGRQb3NpdGlvbigpIHtcXG5cIiArXG5cIiAgcmV0dXJuIHZlYzQodl93b3JsZF9wb3NpdGlvbi54eSArIHdvcmxkX3Bvc2l0aW9uX2FuY2hvciwgdl93b3JsZF9wb3NpdGlvbi56LCB2X3dvcmxkX3Bvc2l0aW9uLncpO1xcblwiICtcblwifVxcblwiICtcblwiI2Vsc2VcXG5cIiArXG5cIlxcblwiICtcblwidmVjNCBhYnNvbHV0ZVdvcmxkUG9zaXRpb24oKSB7XFxuXCIgK1xuXCIgIHJldHVybiB2X3dvcmxkX3Bvc2l0aW9uO1xcblwiICtcblwifVxcblwiICtcblwiI2VuZGlmXFxuXCIgK1xuXCJcXG5cIiArXG5cIiNpZiBkZWZpbmVkKEZFQVRVUkVfU0VMRUNUSU9OKVxcblwiICtcblwiXFxuXCIgK1xuXCJhdHRyaWJ1dGUgdmVjNCBhX3NlbGVjdGlvbl9jb2xvcjtcXG5cIiArXG5cInZhcnlpbmcgdmVjNCB2X3NlbGVjdGlvbl9jb2xvcjtcXG5cIiArXG5cIiNlbmRpZlxcblwiICtcblwiXFxuXCIgK1xuXCIjaWYgIWRlZmluZWQoTElHSFRJTkdfVkVSVEVYKVxcblwiICtcblwiXFxuXCIgK1xuXCJ2YXJ5aW5nIHZlYzQgdl9wb3NpdGlvbjtcXG5cIiArXG5cInZhcnlpbmcgdmVjMyB2X25vcm1hbDtcXG5cIiArXG5cIiNlbHNlXFxuXCIgK1xuXCJcXG5cIiArXG5cInZhcnlpbmcgdmVjMyB2X2xpZ2h0aW5nO1xcblwiICtcblwiI2VuZGlmXFxuXCIgK1xuXCJcXG5cIiArXG5cImNvbnN0IGZsb2F0IGxpZ2h0X2FtYmllbnQgPSAwLjU7XFxuXCIgK1xuXCJmbG9hdCBhX3hfY2FsY3VsYXRlWihmbG9hdCB6LCBmbG9hdCBsYXllciwgY29uc3QgZmxvYXQgbnVtX2xheWVycywgY29uc3QgZmxvYXQgel9sYXllcl9zY2FsZSkge1xcblwiICtcblwiICBmbG9hdCB6X2xheWVyX3JhbmdlID0gKG51bV9sYXllcnMgKyAxLikgKiB6X2xheWVyX3NjYWxlO1xcblwiICtcblwiICBmbG9hdCB6X2xheWVyID0gKGxheWVyICsgMS4pICogel9sYXllcl9zY2FsZTtcXG5cIiArXG5cIiAgeiA9IHpfbGF5ZXIgKyBjbGFtcCh6LCAwLiwgel9sYXllcl9zY2FsZSk7XFxuXCIgK1xuXCIgIHogPSAoel9sYXllcl9yYW5nZSAtIHopIC8gel9sYXllcl9yYW5nZTtcXG5cIiArXG5cIiAgcmV0dXJuIHo7XFxuXCIgK1xuXCJ9XFxuXCIgK1xuXCJ2ZWMzIGNfeF9wb2ludExpZ2h0KHZlYzQgcG9zaXRpb24sIHZlYzMgbm9ybWFsLCB2ZWMzIGNvbG9yLCB2ZWM0IGxpZ2h0X3BvcywgZmxvYXQgbGlnaHRfYW1iaWVudCwgY29uc3QgYm9vbCBiYWNrbGlnaHQpIHtcXG5cIiArXG5cIiAgdmVjMyBsaWdodF9kaXIgPSBub3JtYWxpemUocG9zaXRpb24ueHl6IC0gbGlnaHRfcG9zLnh5eik7XFxuXCIgK1xuXCIgIGNvbG9yICo9IGFicyhtYXgoZmxvYXQoYmFja2xpZ2h0KSAqIC0xLiwgZG90KG5vcm1hbCwgbGlnaHRfZGlyICogLTEuMCkpKSArIGxpZ2h0X2FtYmllbnQ7XFxuXCIgK1xuXCIgIHJldHVybiBjb2xvcjtcXG5cIiArXG5cIn1cXG5cIiArXG5cInZlYzMgZF94X3NwZWN1bGFyTGlnaHQodmVjNCBwb3NpdGlvbiwgdmVjMyBub3JtYWwsIHZlYzMgY29sb3IsIHZlYzQgbGlnaHRfcG9zLCBmbG9hdCBsaWdodF9hbWJpZW50LCBjb25zdCBib29sIGJhY2tsaWdodCkge1xcblwiICtcblwiICB2ZWMzIGxpZ2h0X2RpciA9IG5vcm1hbGl6ZShwb3NpdGlvbi54eXogLSBsaWdodF9wb3MueHl6KTtcXG5cIiArXG5cIiAgdmVjMyB2aWV3X3BvcyA9IHZlYzMoMC4sIDAuLCA1MDAuKTtcXG5cIiArXG5cIiAgdmVjMyB2aWV3X2RpciA9IG5vcm1hbGl6ZShwb3NpdGlvbi54eXogLSB2aWV3X3Bvcy54eXopO1xcblwiICtcblwiICB2ZWMzIHNwZWN1bGFyUmVmbGVjdGlvbjtcXG5cIiArXG5cIiAgaWYoZG90KG5vcm1hbCwgLWxpZ2h0X2RpcikgPCAwLjApIHtcXG5cIiArXG5cIiAgICBzcGVjdWxhclJlZmxlY3Rpb24gPSB2ZWMzKDAuMCwgMC4wLCAwLjApO1xcblwiICtcblwiICB9IGVsc2Uge1xcblwiICtcblwiICAgIGZsb2F0IGF0dGVudWF0aW9uID0gMS4wO1xcblwiICtcblwiICAgIGZsb2F0IGxpZ2h0U3BlY3VsYXJUZXJtID0gMS4wO1xcblwiICtcblwiICAgIGZsb2F0IG1hdGVyaWFsU3BlY3VsYXJUZXJtID0gMTAuMDtcXG5cIiArXG5cIiAgICBmbG9hdCBtYXRlcmlhbFNoaW5pbmVzc1Rlcm0gPSAxMC4wO1xcblwiICtcblwiICAgIHNwZWN1bGFyUmVmbGVjdGlvbiA9IGF0dGVudWF0aW9uICogdmVjMyhsaWdodFNwZWN1bGFyVGVybSkgKiB2ZWMzKG1hdGVyaWFsU3BlY3VsYXJUZXJtKSAqIHBvdyhtYXgoMC4wLCBkb3QocmVmbGVjdCgtbGlnaHRfZGlyLCBub3JtYWwpLCB2aWV3X2RpcikpLCBtYXRlcmlhbFNoaW5pbmVzc1Rlcm0pO1xcblwiICtcblwiICB9XFxuXCIgK1xuXCIgIGZsb2F0IGRpZmZ1c2UgPSBhYnMobWF4KGZsb2F0KGJhY2tsaWdodCkgKiAtMS4sIGRvdChub3JtYWwsIGxpZ2h0X2RpciAqIC0xLjApKSk7XFxuXCIgK1xuXCIgIGNvbG9yICo9IGRpZmZ1c2UgKyBzcGVjdWxhclJlZmxlY3Rpb24gKyBsaWdodF9hbWJpZW50O1xcblwiICtcblwiICByZXR1cm4gY29sb3I7XFxuXCIgK1xuXCJ9XFxuXCIgK1xuXCJ2ZWMzIGVfeF9kaXJlY3Rpb25hbExpZ2h0KHZlYzMgbm9ybWFsLCB2ZWMzIGNvbG9yLCB2ZWMzIGxpZ2h0X2RpciwgZmxvYXQgbGlnaHRfYW1iaWVudCkge1xcblwiICtcblwiICBsaWdodF9kaXIgPSBub3JtYWxpemUobGlnaHRfZGlyKTtcXG5cIiArXG5cIiAgY29sb3IgKj0gZG90KG5vcm1hbCwgbGlnaHRfZGlyICogLTEuMCkgKyBsaWdodF9hbWJpZW50O1xcblwiICtcblwiICByZXR1cm4gY29sb3I7XFxuXCIgK1xuXCJ9XFxuXCIgK1xuXCJ2ZWMzIGJfeF9saWdodGluZyh2ZWM0IHBvc2l0aW9uLCB2ZWMzIG5vcm1hbCwgdmVjMyBjb2xvciwgdmVjNCBsaWdodF9wb3MsIHZlYzQgbmlnaHRfbGlnaHRfcG9zLCB2ZWMzIGxpZ2h0X2RpciwgZmxvYXQgbGlnaHRfYW1iaWVudCkge1xcblwiICtcblwiICBcXG5cIiArXG5cIiAgI2lmIGRlZmluZWQoTElHSFRJTkdfUE9JTlQpXFxuXCIgK1xuXCIgIGNvbG9yID0gY194X3BvaW50TGlnaHQocG9zaXRpb24sIG5vcm1hbCwgY29sb3IsIGxpZ2h0X3BvcywgbGlnaHRfYW1iaWVudCwgdHJ1ZSk7XFxuXCIgK1xuXCIgICNlbGlmIGRlZmluZWQoTElHSFRJTkdfUE9JTlRfU1BFQ1VMQVIpXFxuXCIgK1xuXCIgIGNvbG9yID0gZF94X3NwZWN1bGFyTGlnaHQocG9zaXRpb24sIG5vcm1hbCwgY29sb3IsIGxpZ2h0X3BvcywgbGlnaHRfYW1iaWVudCwgdHJ1ZSk7XFxuXCIgK1xuXCIgICNlbGlmIGRlZmluZWQoTElHSFRJTkdfTklHSFQpXFxuXCIgK1xuXCIgIGNvbG9yID0gY194X3BvaW50TGlnaHQocG9zaXRpb24sIG5vcm1hbCwgY29sb3IsIG5pZ2h0X2xpZ2h0X3BvcywgMC4sIGZhbHNlKTtcXG5cIiArXG5cIiAgI2VsaWYgZGVmaW5lZChMSUdIVElOR19ESVJFQ1RJT04pXFxuXCIgK1xuXCIgIGNvbG9yID0gZV94X2RpcmVjdGlvbmFsTGlnaHQobm9ybWFsLCBjb2xvciwgbGlnaHRfZGlyLCBsaWdodF9hbWJpZW50KTtcXG5cIiArXG5cIiAgI2Vsc2VcXG5cIiArXG5cIiAgY29sb3IgPSBjb2xvcjtcXG5cIiArXG5cIiAgI2VuZGlmXFxuXCIgK1xuXCIgIHJldHVybiBjb2xvcjtcXG5cIiArXG5cIn1cXG5cIiArXG5cIiNwcmFnbWEgdGFuZ3JhbTogZ2xvYmFsc1xcblwiICtcblwiXFxuXCIgK1xuXCIjcHJhZ21hIHRhbmdyYW06IGNhbWVyYVxcblwiICtcblwiXFxuXCIgK1xuXCJ2b2lkIG1haW4oKSB7XFxuXCIgK1xuXCIgIFxcblwiICtcblwiICAjaWYgZGVmaW5lZChGRUFUVVJFX1NFTEVDVElPTilcXG5cIiArXG5cIiAgaWYoYV9zZWxlY3Rpb25fY29sb3IueHl6ID09IHZlYzMoMC4pKSB7XFxuXCIgK1xuXCIgICAgZ2xfUG9zaXRpb24gPSB2ZWM0KDAuLCAwLiwgMC4sIDEuKTtcXG5cIiArXG5cIiAgICByZXR1cm47XFxuXCIgK1xuXCIgIH1cXG5cIiArXG5cIiAgdl9zZWxlY3Rpb25fY29sb3IgPSBhX3NlbGVjdGlvbl9jb2xvcjtcXG5cIiArXG5cIiAgI2VuZGlmXFxuXCIgK1xuXCIgIHZlYzQgcG9zaXRpb24gPSB1X3RpbGVfdmlldyAqIHZlYzQoYV9wb3NpdGlvbiwgMS4pO1xcblwiICtcblwiICB2X3dvcmxkX3Bvc2l0aW9uID0gdV90aWxlX3dvcmxkICogdmVjNChhX3Bvc2l0aW9uLCAxLik7XFxuXCIgK1xuXCIgICNpZiBkZWZpbmVkKFdPUkxEX1BPU0lUSU9OX1dSQVApXFxuXCIgK1xuXCIgIHZfd29ybGRfcG9zaXRpb24ueHkgLT0gd29ybGRfcG9zaXRpb25fYW5jaG9yO1xcblwiICtcblwiICAjZW5kaWZcXG5cIiArXG5cIiAgXFxuXCIgK1xuXCIgICNwcmFnbWEgdGFuZ3JhbTogdmVydGV4XFxuXCIgK1xuXCIgIFxcblwiICtcblwiICAjaWYgZGVmaW5lZChMSUdIVElOR19WRVJURVgpXFxuXCIgK1xuXCIgIHZfY29sb3IgPSBhX2NvbG9yO1xcblwiICtcblwiICB2X2xpZ2h0aW5nID0gYl94X2xpZ2h0aW5nKHBvc2l0aW9uLCBhX25vcm1hbCwgdmVjMygxLiksIHZlYzQoMC4sIDAuLCAxNTAuICogdV9tZXRlcnNfcGVyX3BpeGVsLCAxLiksIHZlYzQoMC4sIDAuLCA1MC4gKiB1X21ldGVyc19wZXJfcGl4ZWwsIDEuKSwgdmVjMygwLjIsIDAuNywgLTAuNSksIGxpZ2h0X2FtYmllbnQpO1xcblwiICtcblwiICAjZWxzZVxcblwiICtcblwiICB2X3Bvc2l0aW9uID0gcG9zaXRpb247XFxuXCIgK1xuXCIgIHZfbm9ybWFsID0gYV9ub3JtYWw7XFxuXCIgK1xuXCIgIHZfY29sb3IgPSBhX2NvbG9yO1xcblwiICtcblwiICAjZW5kaWZcXG5cIiArXG5cIiAgY2FtZXJhUHJvamVjdGlvbihwb3NpdGlvbik7XFxuXCIgK1xuXCIgIHBvc2l0aW9uLnogLT0gKGFfbGF5ZXIgKyAxLikgKiAuMDAxO1xcblwiICtcblwiICBnbF9Qb3NpdGlvbiA9IHBvc2l0aW9uO1xcblwiICtcblwifVxcblwiICtcblwiXCI7XG5cbnNoYWRlcl9zb3VyY2VzWydzZWxlY3Rpb25fZnJhZ21lbnQnXSA9XG5cIlxcblwiICtcblwiI2RlZmluZSBHTFNMSUZZIDFcXG5cIiArXG5cIlxcblwiICtcblwiI2lmIGRlZmluZWQoRkVBVFVSRV9TRUxFQ1RJT04pXFxuXCIgK1xuXCJcXG5cIiArXG5cInZhcnlpbmcgdmVjNCB2X3NlbGVjdGlvbl9jb2xvcjtcXG5cIiArXG5cIiNlbmRpZlxcblwiICtcblwiXFxuXCIgK1xuXCJ2b2lkIG1haW4odm9pZCkge1xcblwiICtcblwiICBcXG5cIiArXG5cIiAgI2lmIGRlZmluZWQoRkVBVFVSRV9TRUxFQ1RJT04pXFxuXCIgK1xuXCIgIGdsX0ZyYWdDb2xvciA9IHZfc2VsZWN0aW9uX2NvbG9yO1xcblwiICtcblwiICAjZWxzZVxcblwiICtcblwiICBnbF9GcmFnQ29sb3IgPSB2ZWM0KDAuLCAwLiwgMC4sIDEuKTtcXG5cIiArXG5cIiAgI2VuZGlmXFxuXCIgK1xuXCIgIFxcblwiICtcblwifVxcblwiICtcblwiXCI7XG5cbnNoYWRlcl9zb3VyY2VzWydzaW1wbGVfcG9seWdvbl9mcmFnbWVudCddID1cblwiXFxuXCIgK1xuXCIjZGVmaW5lIEdMU0xJRlkgMVxcblwiICtcblwiXFxuXCIgK1xuXCJ1bmlmb3JtIGZsb2F0IHVfbWV0ZXJzX3Blcl9waXhlbDtcXG5cIiArXG5cInZhcnlpbmcgdmVjMyB2X2NvbG9yO1xcblwiICtcblwiI2lmICFkZWZpbmVkKExJR0hUSU5HX1ZFUlRFWClcXG5cIiArXG5cIlxcblwiICtcblwidmFyeWluZyB2ZWM0IHZfcG9zaXRpb247XFxuXCIgK1xuXCJ2YXJ5aW5nIHZlYzMgdl9ub3JtYWw7XFxuXCIgK1xuXCIjZW5kaWZcXG5cIiArXG5cIlxcblwiICtcblwidmVjMyBhX3hfcG9pbnRMaWdodCh2ZWM0IHBvc2l0aW9uLCB2ZWMzIG5vcm1hbCwgdmVjMyBjb2xvciwgdmVjNCBsaWdodF9wb3MsIGZsb2F0IGxpZ2h0X2FtYmllbnQsIGNvbnN0IGJvb2wgYmFja2xpZ2h0KSB7XFxuXCIgK1xuXCIgIHZlYzMgbGlnaHRfZGlyID0gbm9ybWFsaXplKHBvc2l0aW9uLnh5eiAtIGxpZ2h0X3Bvcy54eXopO1xcblwiICtcblwiICBjb2xvciAqPSBhYnMobWF4KGZsb2F0KGJhY2tsaWdodCkgKiAtMS4sIGRvdChub3JtYWwsIGxpZ2h0X2RpciAqIC0xLjApKSkgKyBsaWdodF9hbWJpZW50O1xcblwiICtcblwiICByZXR1cm4gY29sb3I7XFxuXCIgK1xuXCJ9XFxuXCIgK1xuXCIjcHJhZ21hIHRhbmdyYW06IGdsb2JhbHNcXG5cIiArXG5cIlxcblwiICtcblwidm9pZCBtYWluKHZvaWQpIHtcXG5cIiArXG5cIiAgdmVjMyBjb2xvcjtcXG5cIiArXG5cIiAgI2lmICFkZWZpbmVkKExJR0hUSU5HX1ZFUlRFWCkgLy8gZGVmYXVsdCB0byBwZXItcGl4ZWwgbGlnaHRpbmdcXG5cIiArXG5cIiAgdmVjNCBsaWdodF9wb3MgPSB2ZWM0KDAuLCAwLiwgMTUwLiAqIHVfbWV0ZXJzX3Blcl9waXhlbCwgMS4pO1xcblwiICtcblwiICBjb25zdCBmbG9hdCBsaWdodF9hbWJpZW50ID0gMC41O1xcblwiICtcblwiICBjb25zdCBib29sIGJhY2tsaXQgPSB0cnVlO1xcblwiICtcblwiICBjb2xvciA9IGFfeF9wb2ludExpZ2h0KHZfcG9zaXRpb24sIHZfbm9ybWFsLCB2X2NvbG9yLCBsaWdodF9wb3MsIGxpZ2h0X2FtYmllbnQsIGJhY2tsaXQpO1xcblwiICtcblwiICAjZWxzZVxcblwiICtcblwiICBjb2xvciA9IHZfY29sb3I7XFxuXCIgK1xuXCIgICNlbmRpZlxcblwiICtcblwiICBcXG5cIiArXG5cIiAgI3ByYWdtYSB0YW5ncmFtOiBmcmFnbWVudFxcblwiICtcblwiICBnbF9GcmFnQ29sb3IgPSB2ZWM0KGNvbG9yLCAxLjApO1xcblwiICtcblwifVxcblwiICtcblwiXCI7XG5cbnNoYWRlcl9zb3VyY2VzWydzaW1wbGVfcG9seWdvbl92ZXJ0ZXgnXSA9XG5cIlxcblwiICtcblwiI2RlZmluZSBHTFNMSUZZIDFcXG5cIiArXG5cIlxcblwiICtcblwidW5pZm9ybSB2ZWMyIHVfYXNwZWN0O1xcblwiICtcblwidW5pZm9ybSBtYXQ0IHVfdGlsZV92aWV3O1xcblwiICtcblwidW5pZm9ybSBtYXQ0IHVfbWV0ZXJfdmlldztcXG5cIiArXG5cInVuaWZvcm0gZmxvYXQgdV9tZXRlcnNfcGVyX3BpeGVsO1xcblwiICtcblwidW5pZm9ybSBmbG9hdCB1X251bV9sYXllcnM7XFxuXCIgK1xuXCJhdHRyaWJ1dGUgdmVjMyBhX3Bvc2l0aW9uO1xcblwiICtcblwiYXR0cmlidXRlIHZlYzMgYV9ub3JtYWw7XFxuXCIgK1xuXCJhdHRyaWJ1dGUgdmVjMyBhX2NvbG9yO1xcblwiICtcblwiYXR0cmlidXRlIGZsb2F0IGFfbGF5ZXI7XFxuXCIgK1xuXCJ2YXJ5aW5nIHZlYzMgdl9jb2xvcjtcXG5cIiArXG5cIiNpZiAhZGVmaW5lZChMSUdIVElOR19WRVJURVgpXFxuXCIgK1xuXCJcXG5cIiArXG5cInZhcnlpbmcgdmVjNCB2X3Bvc2l0aW9uO1xcblwiICtcblwidmFyeWluZyB2ZWMzIHZfbm9ybWFsO1xcblwiICtcblwiI2VuZGlmXFxuXCIgK1xuXCJcXG5cIiArXG5cInZlYzQgYV94X3BlcnNwZWN0aXZlKHZlYzQgcG9zaXRpb24sIGNvbnN0IHZlYzIgcGVyc3BlY3RpdmVfb2Zmc2V0LCBjb25zdCB2ZWMyIHBlcnNwZWN0aXZlX2ZhY3Rvcikge1xcblwiICtcblwiICBwb3NpdGlvbi54eSArPSBwb3NpdGlvbi56ICogcGVyc3BlY3RpdmVfZmFjdG9yICogKHBvc2l0aW9uLnh5IC0gcGVyc3BlY3RpdmVfb2Zmc2V0KTtcXG5cIiArXG5cIiAgcmV0dXJuIHBvc2l0aW9uO1xcblwiICtcblwifVxcblwiICtcblwidmVjNCBiX3hfaXNvbWV0cmljKHZlYzQgcG9zaXRpb24sIGNvbnN0IHZlYzIgYXhpcywgY29uc3QgZmxvYXQgbXVsdGlwbGllcikge1xcblwiICtcblwiICBwb3NpdGlvbi54eSArPSBwb3NpdGlvbi56ICogYXhpcyAqIG11bHRpcGxpZXIgLyB1X2FzcGVjdDtcXG5cIiArXG5cIiAgcmV0dXJuIHBvc2l0aW9uO1xcblwiICtcblwifVxcblwiICtcblwiZmxvYXQgY194X2NhbGN1bGF0ZVooZmxvYXQgeiwgZmxvYXQgbGF5ZXIsIGNvbnN0IGZsb2F0IG51bV9sYXllcnMsIGNvbnN0IGZsb2F0IHpfbGF5ZXJfc2NhbGUpIHtcXG5cIiArXG5cIiAgZmxvYXQgel9sYXllcl9yYW5nZSA9IChudW1fbGF5ZXJzICsgMS4pICogel9sYXllcl9zY2FsZTtcXG5cIiArXG5cIiAgZmxvYXQgel9sYXllciA9IChsYXllciArIDEuKSAqIHpfbGF5ZXJfc2NhbGU7XFxuXCIgK1xuXCIgIHogPSB6X2xheWVyICsgY2xhbXAoeiwgMC4sIHpfbGF5ZXJfc2NhbGUpO1xcblwiICtcblwiICB6ID0gKHpfbGF5ZXJfcmFuZ2UgLSB6KSAvIHpfbGF5ZXJfcmFuZ2U7XFxuXCIgK1xuXCIgIHJldHVybiB6O1xcblwiICtcblwifVxcblwiICtcblwidmVjMyBkX3hfcG9pbnRMaWdodCh2ZWM0IHBvc2l0aW9uLCB2ZWMzIG5vcm1hbCwgdmVjMyBjb2xvciwgdmVjNCBsaWdodF9wb3MsIGZsb2F0IGxpZ2h0X2FtYmllbnQsIGNvbnN0IGJvb2wgYmFja2xpZ2h0KSB7XFxuXCIgK1xuXCIgIHZlYzMgbGlnaHRfZGlyID0gbm9ybWFsaXplKHBvc2l0aW9uLnh5eiAtIGxpZ2h0X3Bvcy54eXopO1xcblwiICtcblwiICBjb2xvciAqPSBhYnMobWF4KGZsb2F0KGJhY2tsaWdodCkgKiAtMS4sIGRvdChub3JtYWwsIGxpZ2h0X2RpciAqIC0xLjApKSkgKyBsaWdodF9hbWJpZW50O1xcblwiICtcblwiICByZXR1cm4gY29sb3I7XFxuXCIgK1xuXCJ9XFxuXCIgK1xuXCIjcHJhZ21hIHRhbmdyYW06IGdsb2JhbHNcXG5cIiArXG5cIlxcblwiICtcblwidm9pZCBtYWluKCkge1xcblwiICtcblwiICB2ZWM0IHBvc2l0aW9uID0gdV90aWxlX3ZpZXcgKiB2ZWM0KGFfcG9zaXRpb24sIDEuKTtcXG5cIiArXG5cIiAgI3ByYWdtYSB0YW5ncmFtOiB2ZXJ0ZXhcXG5cIiArXG5cIiAgXFxuXCIgK1xuXCIgICNpZiBkZWZpbmVkKExJR0hUSU5HX1ZFUlRFWClcXG5cIiArXG5cIiAgdmVjNCBsaWdodF9wb3MgPSB2ZWM0KDAuLCAwLiwgMTUwLiAqIHVfbWV0ZXJzX3Blcl9waXhlbCwgMS4pO1xcblwiICtcblwiICBjb25zdCBmbG9hdCBsaWdodF9hbWJpZW50ID0gMC41O1xcblwiICtcblwiICBjb25zdCBib29sIGJhY2tsaXQgPSB0cnVlO1xcblwiICtcblwiICB2X2NvbG9yID0gZF94X3BvaW50TGlnaHQocG9zaXRpb24sIGFfbm9ybWFsLCBhX2NvbG9yLCBsaWdodF9wb3MsIGxpZ2h0X2FtYmllbnQsIGJhY2tsaXQpO1xcblwiICtcblwiICAjZWxzZVxcblwiICtcblwiICB2X3Bvc2l0aW9uID0gcG9zaXRpb247XFxuXCIgK1xuXCIgIHZfbm9ybWFsID0gYV9ub3JtYWw7XFxuXCIgK1xuXCIgIHZfY29sb3IgPSBhX2NvbG9yO1xcblwiICtcblwiICAjZW5kaWZcXG5cIiArXG5cIiAgcG9zaXRpb24gPSB1X21ldGVyX3ZpZXcgKiBwb3NpdGlvbjtcXG5cIiArXG5cIiAgI2lmIGRlZmluZWQoUFJPSkVDVElPTl9QRVJTUEVDVElWRSlcXG5cIiArXG5cIiAgcG9zaXRpb24gPSBhX3hfcGVyc3BlY3RpdmUocG9zaXRpb24sIHZlYzIoLTAuMjUsIC0wLjI1KSwgdmVjMigwLjYsIDAuNikpO1xcblwiICtcblwiICAjZWxpZiBkZWZpbmVkKFBST0pFQ1RJT05fSVNPTUVUUklDKVxcblwiICtcblwiICBwb3NpdGlvbiA9IGJfeF9pc29tZXRyaWMocG9zaXRpb24sIHZlYzIoMC4sIDEuKSwgMS4pO1xcblwiICtcblwiICAjZW5kaWZcXG5cIiArXG5cIiAgcG9zaXRpb24ueiA9IGNfeF9jYWxjdWxhdGVaKHBvc2l0aW9uLnosIGFfbGF5ZXIsIHVfbnVtX2xheWVycywgNDA5Ni4pO1xcblwiICtcblwiICBnbF9Qb3NpdGlvbiA9IHBvc2l0aW9uO1xcblwiICtcblwifVxcblwiICtcblwiXCI7XG5cbm1vZHVsZS5leHBvcnRzID0gc2hhZGVyX3NvdXJjZXM7IFxuXG4iLCIvLyBUZXh0dXJlIG1hbmFnZW1lbnRcbmltcG9ydCAqIGFzIFV0aWxzIGZyb20gJy4uL3V0aWxzJztcbmltcG9ydCB7R0x9IGZyb20gJy4vZ2wnO1xuXG5cbi8vIEdsb2JhbCBzZXQgb2YgdGV4dHVyZXMsIGJ5IG5hbWVcbkdMVGV4dHVyZS50ZXh0dXJlcyA9IHt9O1xuXG4vLyBHTCB0ZXh0dXJlIHdyYXBwZXIgb2JqZWN0IGZvciBrZWVwaW5nIHRyYWNrIG9mIGEgZ2xvYmFsIHNldCBvZiB0ZXh0dXJlcywga2V5ZWQgYnkgYW4gYXJiaXRyYXJ5IG5hbWVcbmV4cG9ydCBkZWZhdWx0IGZ1bmN0aW9uIEdMVGV4dHVyZSAoZ2wsIG5hbWUsIG9wdGlvbnMpIHtcbiAgICBvcHRpb25zID0gb3B0aW9ucyB8fCB7fTtcbiAgICB0aGlzLmdsID0gZ2w7XG4gICAgdGhpcy50ZXh0dXJlID0gZ2wuY3JlYXRlVGV4dHVyZSgpO1xuICAgIHRoaXMuYmluZCgwKTtcbiAgICB0aGlzLmltYWdlID0gbnVsbDtcblxuICAgIC8vIERlZmF1bHQgdG8gYSAxLXBpeGVsIGJsYWNrIHRleHR1cmUgc28gd2UgY2FuIHNhZmVseSByZW5kZXIgd2hpbGUgd2Ugd2FpdCBmb3IgYW4gaW1hZ2UgdG8gbG9hZFxuICAgIC8vIFNlZTogaHR0cDovL3N0YWNrb3ZlcmZsb3cuY29tL3F1ZXN0aW9ucy8xOTcyMjI0Ny93ZWJnbC13YWl0LWZvci10ZXh0dXJlLXRvLWxvYWRcbiAgICB0aGlzLnNldERhdGEoMSwgMSwgbmV3IFVpbnQ4QXJyYXkoWzAsIDAsIDAsIDI1NV0pLCB7IGZpbHRlcmluZzogJ25lYXJlc3QnIH0pO1xuXG4gICAgLy8gVE9ETzogYmV0dGVyIHN1cHBvcnQgZm9yIG5vbi1VUkwgc291cmNlczogY2FudmFzL3ZpZGVvIGVsZW1lbnRzLCByYXcgcGl4ZWwgYnVmZmVyc1xuXG4gICAgdGhpcy5uYW1lID0gbmFtZTtcbiAgICBHTFRleHR1cmUudGV4dHVyZXNbdGhpcy5uYW1lXSA9IHRoaXM7XG59O1xuXG5HTFRleHR1cmUucHJvdG90eXBlLmJpbmQgPSBmdW5jdGlvbiAodW5pdCkge1xuICAgIHRoaXMuZ2wuYWN0aXZlVGV4dHVyZSh0aGlzLmdsLlRFWFRVUkUwICsgdW5pdCk7XG4gICAgdGhpcy5nbC5iaW5kVGV4dHVyZSh0aGlzLmdsLlRFWFRVUkVfMkQsIHRoaXMudGV4dHVyZSk7XG59O1xuXG4vLyBMb2FkcyBhIHRleHR1cmUgZnJvbSBhIFVSTFxuR0xUZXh0dXJlLnByb3RvdHlwZS5sb2FkID0gZnVuY3Rpb24gKHVybCwgb3B0aW9ucykge1xuICAgIG9wdGlvbnMgPSBvcHRpb25zIHx8IHt9O1xuICAgIHRoaXMuaW1hZ2UgPSBuZXcgSW1hZ2UoKTtcbiAgICB0aGlzLmltYWdlLm9ubG9hZCA9ICgpID0+IHtcbiAgICAgICAgdGhpcy53aWR0aCA9IHRoaXMuaW1hZ2Uud2lkdGg7XG4gICAgICAgIHRoaXMuaGVpZ2h0ID0gdGhpcy5pbWFnZS5oZWlnaHQ7XG4gICAgICAgIHRoaXMuZGF0YSA9IG51bGw7IC8vIG11dHVhbGx5IGV4Y2x1c2l2ZSB3aXRoIGRpcmVjdCBkYXRhIGJ1ZmZlciB0ZXh0dXJlc1xuICAgICAgICB0aGlzLnVwZGF0ZShvcHRpb25zKTtcbiAgICAgICAgdGhpcy5zZXRUZXh0dXJlRmlsdGVyaW5nKG9wdGlvbnMpO1xuICAgIH07XG4gICAgdGhpcy5pbWFnZS5zcmMgPSB1cmw7XG59O1xuXG4vLyBTZXRzIHRleHR1cmUgdG8gYSByYXcgaW1hZ2UgYnVmZmVyXG5HTFRleHR1cmUucHJvdG90eXBlLnNldERhdGEgPSBmdW5jdGlvbiAod2lkdGgsIGhlaWdodCwgZGF0YSwgb3B0aW9ucykge1xuICAgIHRoaXMud2lkdGggPSB3aWR0aDtcbiAgICB0aGlzLmhlaWdodCA9IGhlaWdodDtcbiAgICB0aGlzLmRhdGEgPSBkYXRhO1xuICAgIHRoaXMuaW1hZ2UgPSBudWxsOyAvLyBtdXR1YWxseSBleGNsdXNpdmUgd2l0aCBpbWFnZSBlbGVtZW50LWJhc2VkIHRleHR1cmVzXG5cbiAgICB0aGlzLnVwZGF0ZShvcHRpb25zKTtcbiAgICB0aGlzLnNldFRleHR1cmVGaWx0ZXJpbmcob3B0aW9ucyk7XG59O1xuXG4vLyBVcGxvYWRzIGN1cnJlbnQgaW1hZ2Ugb3IgYnVmZmVyIHRvIHRoZSBHUFUgKGNhbiBiZSB1c2VkIHRvIHVwZGF0ZSBhbmltYXRlZCB0ZXh0dXJlcyBvbiB0aGUgZmx5KVxuR0xUZXh0dXJlLnByb3RvdHlwZS51cGRhdGUgPSBmdW5jdGlvbiAob3B0aW9ucykge1xuICAgIG9wdGlvbnMgPSBvcHRpb25zIHx8IHt9O1xuXG4gICAgdGhpcy5iaW5kKDApO1xuICAgIHRoaXMuZ2wucGl4ZWxTdG9yZWkodGhpcy5nbC5VTlBBQ0tfRkxJUF9ZX1dFQkdMLCAob3B0aW9ucy5VTlBBQ0tfRkxJUF9ZX1dFQkdMID09PSBmYWxzZSA/IGZhbHNlIDogdHJ1ZSkpO1xuXG4gICAgLy8gSW1hZ2UgZWxlbWVudFxuICAgIGlmICh0aGlzLmltYWdlICYmIHRoaXMuaW1hZ2UuY29tcGxldGUpIHtcbiAgICAgICAgdGhpcy5nbC50ZXhJbWFnZTJEKHRoaXMuZ2wuVEVYVFVSRV8yRCwgMCwgdGhpcy5nbC5SR0JBLCB0aGlzLmdsLlJHQkEsIHRoaXMuZ2wuVU5TSUdORURfQllURSwgdGhpcy5pbWFnZSk7XG4gICAgfVxuICAgIC8vIFJhdyBpbWFnZSBidWZmZXJcbiAgICBlbHNlIGlmICh0aGlzLndpZHRoICYmIHRoaXMuaGVpZ2h0KSB7IC8vIE5PVEU6IHRoaXMuZGF0YSBjYW4gYmUgbnVsbCwgdG8gemVybyBvdXQgdGV4dHVyZVxuICAgICAgICB0aGlzLmdsLnRleEltYWdlMkQodGhpcy5nbC5URVhUVVJFXzJELCAwLCB0aGlzLmdsLlJHQkEsIHRoaXMud2lkdGgsIHRoaXMuaGVpZ2h0LCAwLCB0aGlzLmdsLlJHQkEsIHRoaXMuZ2wuVU5TSUdORURfQllURSwgdGhpcy5kYXRhKTtcbiAgICB9XG59O1xuXG4vLyBEZXRlcm1pbmVzIGFwcHJvcHJpYXRlIGZpbHRlcmluZyBtb2RlXG4vLyBBc3N1bWVzIHRleHR1cmUgdG8gYmUgb3BlcmF0ZWQgb24gaXMgYWxyZWFkeSBib3VuZFxuR0xUZXh0dXJlLnByb3RvdHlwZS5zZXRUZXh0dXJlRmlsdGVyaW5nID0gZnVuY3Rpb24gKG9wdGlvbnMpIHtcbiAgICBvcHRpb25zID0gb3B0aW9ucyB8fCB7fTtcbiAgICBvcHRpb25zLmZpbHRlcmluZyA9IG9wdGlvbnMuZmlsdGVyaW5nIHx8ICdtaXBtYXAnOyAvLyBkZWZhdWx0IHRvIG1pcG1hcHMgZm9yIHBvd2VyLW9mLTIgdGV4dHVyZXNcbiAgICB2YXIgZ2wgPSB0aGlzLmdsO1xuXG4gICAgLy8gRm9yIHBvd2VyLW9mLTIgdGV4dHVyZXMsIHRoZSBmb2xsb3dpbmcgcHJlc2V0cyBhcmUgYXZhaWxhYmxlOlxuICAgIC8vIG1pcG1hcDogbGluZWFyIGJsZW5kIGZyb20gbmVhcmVzdCBtaXBcbiAgICAvLyBsaW5lYXI6IGxpbmVhciBibGVuZCBmcm9tIG9yaWdpbmFsIGltYWdlIChubyBtaXBzKVxuICAgIC8vIG5lYXJlc3Q6IG5lYXJlc3QgcGl4ZWwgZnJvbSBvcmlnaW5hbCBpbWFnZSAobm8gbWlwcywgJ2Jsb2NreScgbG9vaylcbiAgICBpZiAoVXRpbHMuaXNQb3dlck9mMih0aGlzLndpZHRoKSAmJiBVdGlscy5pc1Bvd2VyT2YyKHRoaXMuaGVpZ2h0KSkge1xuICAgICAgICB0aGlzLnBvd2VyX29mXzIgPSB0cnVlO1xuICAgICAgICBnbC50ZXhQYXJhbWV0ZXJpKGdsLlRFWFRVUkVfMkQsIGdsLlRFWFRVUkVfV1JBUF9TLCBvcHRpb25zLlRFWFRVUkVfV1JBUF9TIHx8IGdsLkNMQU1QX1RPX0VER0UpO1xuICAgICAgICBnbC50ZXhQYXJhbWV0ZXJpKGdsLlRFWFRVUkVfMkQsIGdsLlRFWFRVUkVfV1JBUF9ULCBvcHRpb25zLlRFWFRVUkVfV1JBUF9UIHx8IGdsLkNMQU1QX1RPX0VER0UpO1xuXG4gICAgICAgIGlmIChvcHRpb25zLmZpbHRlcmluZyA9PSAnbWlwbWFwJykge1xuICAgICAgICAgICAgLy8gY29uc29sZS5sb2coXCJwb3dlci1vZi0yIE1JUE1BUFwiKTtcbiAgICAgICAgICAgIHRoaXMuZmlsdGVyaW5nID0gJ21pcG1hcCc7XG4gICAgICAgICAgICBnbC50ZXhQYXJhbWV0ZXJpKGdsLlRFWFRVUkVfMkQsIGdsLlRFWFRVUkVfTUlOX0ZJTFRFUiwgZ2wuTElORUFSX01JUE1BUF9ORUFSRVNUKTsgLy8gVE9ETzogdXNlIHRyaWxpbmVhciBmaWx0ZXJpbmcgYnkgZGVmdWFsdCBpbnN0ZWFkP1xuICAgICAgICAgICAgZ2wudGV4UGFyYW1ldGVyaShnbC5URVhUVVJFXzJELCBnbC5URVhUVVJFX01BR19GSUxURVIsIGdsLkxJTkVBUik7XG4gICAgICAgICAgICBnbC5nZW5lcmF0ZU1pcG1hcChnbC5URVhUVVJFXzJEKTtcbiAgICAgICAgfVxuICAgICAgICBlbHNlIGlmIChvcHRpb25zLmZpbHRlcmluZyA9PSAnbGluZWFyJykge1xuICAgICAgICAgICAgLy8gY29uc29sZS5sb2coXCJwb3dlci1vZi0yIExJTkVBUlwiKTtcbiAgICAgICAgICAgIHRoaXMuZmlsdGVyaW5nID0gJ2xpbmVhcic7XG4gICAgICAgICAgICBnbC50ZXhQYXJhbWV0ZXJpKGdsLlRFWFRVUkVfMkQsIGdsLlRFWFRVUkVfTUlOX0ZJTFRFUiwgZ2wuTElORUFSKTtcbiAgICAgICAgICAgIGdsLnRleFBhcmFtZXRlcmkoZ2wuVEVYVFVSRV8yRCwgZ2wuVEVYVFVSRV9NQUdfRklMVEVSLCBnbC5MSU5FQVIpO1xuICAgICAgICB9XG4gICAgICAgIGVsc2UgaWYgKG9wdGlvbnMuZmlsdGVyaW5nID09ICduZWFyZXN0Jykge1xuICAgICAgICAgICAgLy8gY29uc29sZS5sb2coXCJwb3dlci1vZi0yIE5FQVJFU1RcIik7XG4gICAgICAgICAgICB0aGlzLmZpbHRlcmluZyA9ICduZWFyZXN0JztcbiAgICAgICAgICAgIGdsLnRleFBhcmFtZXRlcmkoZ2wuVEVYVFVSRV8yRCwgZ2wuVEVYVFVSRV9NSU5fRklMVEVSLCBnbC5ORUFSRVNUKTtcbiAgICAgICAgICAgIGdsLnRleFBhcmFtZXRlcmkoZ2wuVEVYVFVSRV8yRCwgZ2wuVEVYVFVSRV9NQUdfRklMVEVSLCBnbC5ORUFSRVNUKTtcbiAgICAgICAgfVxuICAgIH1cbiAgICBlbHNlIHtcbiAgICAgICAgLy8gV2ViR0wgaGFzIHN0cmljdCByZXF1aXJlbWVudHMgb24gbm9uLXBvd2VyLW9mLTIgdGV4dHVyZXM6XG4gICAgICAgIC8vIE5vIG1pcG1hcHMgYW5kIG11c3QgY2xhbXAgdG8gZWRnZVxuICAgICAgICB0aGlzLnBvd2VyX29mXzIgPSBmYWxzZTtcbiAgICAgICAgZ2wudGV4UGFyYW1ldGVyaShnbC5URVhUVVJFXzJELCBnbC5URVhUVVJFX1dSQVBfUywgZ2wuQ0xBTVBfVE9fRURHRSk7XG4gICAgICAgIGdsLnRleFBhcmFtZXRlcmkoZ2wuVEVYVFVSRV8yRCwgZ2wuVEVYVFVSRV9XUkFQX1QsIGdsLkNMQU1QX1RPX0VER0UpO1xuXG4gICAgICAgIGlmIChvcHRpb25zLmZpbHRlcmluZyA9PSAnbmVhcmVzdCcpIHtcbiAgICAgICAgICAgIC8vIGNvbnNvbGUubG9nKFwicG93ZXItb2YtMiBORUFSRVNUXCIpO1xuICAgICAgICAgICAgdGhpcy5maWx0ZXJpbmcgPSAnbmVhcmVzdCc7XG4gICAgICAgICAgICBnbC50ZXhQYXJhbWV0ZXJpKGdsLlRFWFRVUkVfMkQsIGdsLlRFWFRVUkVfTUlOX0ZJTFRFUiwgZ2wuTkVBUkVTVCk7XG4gICAgICAgICAgICBnbC50ZXhQYXJhbWV0ZXJpKGdsLlRFWFRVUkVfMkQsIGdsLlRFWFRVUkVfTUFHX0ZJTFRFUiwgZ2wuTkVBUkVTVCk7XG4gICAgICAgIH1cbiAgICAgICAgZWxzZSB7IC8vIGRlZmF1bHQgdG8gbGluZWFyIGZvciBub24tcG93ZXItb2YtMiB0ZXh0dXJlc1xuICAgICAgICAgICAgLy8gY29uc29sZS5sb2coXCJwb3dlci1vZi0yIExJTkVBUlwiKTtcbiAgICAgICAgICAgIHRoaXMuZmlsdGVyaW5nID0gJ2xpbmVhcic7XG4gICAgICAgICAgICBnbC50ZXhQYXJhbWV0ZXJpKGdsLlRFWFRVUkVfMkQsIGdsLlRFWFRVUkVfTUlOX0ZJTFRFUiwgZ2wuTElORUFSKTtcbiAgICAgICAgICAgIGdsLnRleFBhcmFtZXRlcmkoZ2wuVEVYVFVSRV8yRCwgZ2wuVEVYVFVSRV9NQUdfRklMVEVSLCBnbC5MSU5FQVIpO1xuICAgICAgICB9XG4gICAgfVxufTtcbiIsIi8vIERlc2NyaWJlcyBhIHZlcnRleCBsYXlvdXQgdGhhdCBjYW4gYmUgdXNlZCB3aXRoIG1hbnkgZGlmZmVyZW50IEdMIHByb2dyYW1zLlxuLy8gSWYgYSBnaXZlbiBwcm9ncmFtIGRvZXNuJ3QgaW5jbHVkZSBhbGwgYXR0cmlidXRlcywgaXQgY2FuIHN0aWxsIHVzZSB0aGUgdmVydGV4IGxheW91dFxuLy8gdG8gcmVhZCB0aG9zZSBhdHRyaWJzIHRoYXQgaXQgZG9lcyByZWNvZ25pemUsIHVzaW5nIHRoZSBhdHRyaWIgb2Zmc2V0cyB0byBza2lwIG90aGVycy5cbi8vIEF0dHJpYnMgYXJlIGFuIGFycmF5LCBpbiBsYXlvdXQgb3JkZXIsIG9mOiBuYW1lLCBzaXplLCB0eXBlLCBub3JtYWxpemVkXG4vLyBleDogeyBuYW1lOiAncG9zaXRpb24nLCBzaXplOiAzLCB0eXBlOiBnbC5GTE9BVCwgbm9ybWFsaXplZDogZmFsc2UgfVxuZXhwb3J0IGRlZmF1bHQgZnVuY3Rpb24gR0xWZXJ0ZXhMYXlvdXQgKGdsLCBhdHRyaWJzKSB7XG4gICAgdGhpcy5hdHRyaWJzID0gYXR0cmlicztcblxuICAgIC8vIENhbGMgdmVydGV4IHN0cmlkZVxuICAgIHRoaXMuc3RyaWRlID0gMDtcbiAgICBmb3IgKHZhciBhPTA7IGEgPCB0aGlzLmF0dHJpYnMubGVuZ3RoOyBhKyspIHtcbiAgICAgICAgdmFyIGF0dHJpYiA9IHRoaXMuYXR0cmlic1thXTtcblxuICAgICAgICBhdHRyaWIuYnl0ZV9zaXplID0gYXR0cmliLnNpemU7XG5cbiAgICAgICAgc3dpdGNoIChhdHRyaWIudHlwZSkge1xuICAgICAgICAgICAgY2FzZSBnbC5GTE9BVDpcbiAgICAgICAgICAgIGNhc2UgZ2wuSU5UOlxuICAgICAgICAgICAgY2FzZSBnbC5VTlNJR05FRF9JTlQ6XG4gICAgICAgICAgICAgICAgYXR0cmliLmJ5dGVfc2l6ZSAqPSA0O1xuICAgICAgICAgICAgICAgIGJyZWFrO1xuICAgICAgICAgICAgY2FzZSBnbC5TSE9SVDpcbiAgICAgICAgICAgIGNhc2UgZ2wuVU5TSUdORURfU0hPUlQ6XG4gICAgICAgICAgICAgICAgYXR0cmliLmJ5dGVfc2l6ZSAqPSAyO1xuICAgICAgICAgICAgICAgIGJyZWFrO1xuICAgICAgICB9XG5cbiAgICAgICAgYXR0cmliLm9mZnNldCA9IHRoaXMuc3RyaWRlO1xuICAgICAgICB0aGlzLnN0cmlkZSArPSBhdHRyaWIuYnl0ZV9zaXplO1xuICAgIH1cbn1cblxuLy8gVHJhY2sgY3VycmVudGx5IGVuYWJsZWQgYXR0cmlicywgYnkgdGhlIHByb2dyYW0gdGhleSBhcmUgYm91bmQgdG9cbkdMVmVydGV4TGF5b3V0LmVuYWJsZWRfYXR0cmlicyA9IHt9O1xuXG4vLyBTZXR1cCBhIHZlcnRleCBsYXlvdXQgZm9yIGEgc3BlY2lmaWMgR0wgcHJvZ3JhbVxuLy8gQXNzdW1lcyB0aGF0IHRoZSBkZXNpcmVkIHZlcnRleCBidWZmZXIgKFZCTykgaXMgYWxyZWFkeSBib3VuZFxuR0xWZXJ0ZXhMYXlvdXQucHJvdG90eXBlLmVuYWJsZSA9IGZ1bmN0aW9uIChnbCwgZ2xfcHJvZ3JhbSlcbntcbiAgICAvLyBFbmFibGUgYWxsIGF0dHJpYnV0ZXMgZm9yIHRoaXMgbGF5b3V0XG4gICAgZm9yICh2YXIgYT0wOyBhIDwgdGhpcy5hdHRyaWJzLmxlbmd0aDsgYSsrKSB7XG4gICAgICAgIHZhciBhdHRyaWIgPSB0aGlzLmF0dHJpYnNbYV07XG4gICAgICAgIHZhciBsb2NhdGlvbiA9IGdsX3Byb2dyYW0uYXR0cmlidXRlKGF0dHJpYi5uYW1lKS5sb2NhdGlvbjtcblxuICAgICAgICBpZiAobG9jYXRpb24gIT0gLTEpIHtcbiAgICAgICAgICAgIGdsLmVuYWJsZVZlcnRleEF0dHJpYkFycmF5KGxvY2F0aW9uKTtcbiAgICAgICAgICAgIGdsLnZlcnRleEF0dHJpYlBvaW50ZXIobG9jYXRpb24sIGF0dHJpYi5zaXplLCBhdHRyaWIudHlwZSwgYXR0cmliLm5vcm1hbGl6ZWQsIHRoaXMuc3RyaWRlLCBhdHRyaWIub2Zmc2V0KTtcbiAgICAgICAgICAgIEdMVmVydGV4TGF5b3V0LmVuYWJsZWRfYXR0cmlic1tsb2NhdGlvbl0gPSBnbF9wcm9ncmFtO1xuICAgICAgICB9XG4gICAgfVxuXG4gICAgLy8gRGlzYWJsZSBhbnkgcHJldmlvdXNseSBib3VuZCBhdHRyaWJ1dGVzIHRoYXQgYXJlbid0IGZvciB0aGlzIGxheW91dFxuICAgIHZhciB1bnVzdWVkX2F0dHJpYnMgPSBbXTtcbiAgICBmb3IgKGxvY2F0aW9uIGluIEdMVmVydGV4TGF5b3V0LmVuYWJsZWRfYXR0cmlicykge1xuICAgICAgICBpZiAoR0xWZXJ0ZXhMYXlvdXQuZW5hYmxlZF9hdHRyaWJzW2xvY2F0aW9uXSAhPSBnbF9wcm9ncmFtKSB7XG4gICAgICAgICAgICBnbC5kaXNhYmxlVmVydGV4QXR0cmliQXJyYXkobG9jYXRpb24pO1xuICAgICAgICAgICAgdW51c3VlZF9hdHRyaWJzLnB1c2gobG9jYXRpb24pO1xuICAgICAgICB9XG4gICAgfVxuXG4gICAgLy8gTWFyayBhdHRyaWJzIGFzIHVudXNlZFxuICAgIGZvciAobG9jYXRpb24gaW4gdW51c3VlZF9hdHRyaWJzKSB7XG4gICAgICAgIGRlbGV0ZSBHTFZlcnRleExheW91dC5lbmFibGVkX2F0dHJpYnNbbG9jYXRpb25dO1xuICAgIH1cbn07XG4iLCJpbXBvcnQgU2NlbmUgZnJvbSAnLi9zY2VuZSc7XG5cbmV4cG9ydCB2YXIgTGVhZmxldExheWVyID0gTC5HcmlkTGF5ZXIuZXh0ZW5kKHtcblxuICAgIGluaXRpYWxpemU6IGZ1bmN0aW9uIChvcHRpb25zKSB7XG4gICAgICAgIEwuc2V0T3B0aW9ucyh0aGlzLCBvcHRpb25zKTtcbiAgICAgICAgdGhpcy5zY2VuZSA9IG5ldyBTY2VuZShcbiAgICAgICAgICAgIHRoaXMub3B0aW9ucy52ZWN0b3JUaWxlU291cmNlLFxuICAgICAgICAgICAgdGhpcy5vcHRpb25zLnZlY3RvckxheWVycyxcbiAgICAgICAgICAgIHRoaXMub3B0aW9ucy52ZWN0b3JTdHlsZXMsXG4gICAgICAgICAgICB7IG51bV93b3JrZXJzOiB0aGlzLm9wdGlvbnMubnVtV29ya2VycyB9XG4gICAgICAgICk7XG5cbiAgICAgICAgdGhpcy5zY2VuZS5kZWJ1ZyA9IHRoaXMub3B0aW9ucy5kZWJ1ZztcbiAgICAgICAgdGhpcy5zY2VuZS5jb250aW51b3VzX2FuaW1hdGlvbiA9IGZhbHNlOyAvLyBzZXQgdG8gdHJ1ZSBmb3IgYW5pbWF0aW5vcywgZXRjLiAoZXZlbnR1YWxseSB3aWxsIGJlIGF1dG9tYXRlZClcbiAgICB9LFxuXG4gICAgLy8gRmluaXNoIGluaXRpYWxpemluZyBzY2VuZSBhbmQgc2V0dXAgZXZlbnRzIHdoZW4gbGF5ZXIgaXMgYWRkZWQgdG8gbWFwXG4gICAgb25BZGQ6IGZ1bmN0aW9uIChtYXApIHtcblxuICAgICAgICB0aGlzLm9uKCd0aWxldW5sb2FkJywgKGV2ZW50KSA9PiB7XG4gICAgICAgICAgICB2YXIgdGlsZSA9IGV2ZW50LnRpbGU7XG4gICAgICAgICAgICB2YXIga2V5ID0gdGlsZS5nZXRBdHRyaWJ1dGUoJ2RhdGEtdGlsZS1rZXknKTtcbiAgICAgICAgICAgIHRoaXMuc2NlbmUucmVtb3ZlVGlsZShrZXkpO1xuICAgICAgICB9KTtcblxuICAgICAgICB0aGlzLl9tYXAub24oJ3Jlc2l6ZScsICgpID0+IHtcbiAgICAgICAgICAgIHZhciBzaXplID0gdGhpcy5fbWFwLmdldFNpemUoKTtcbiAgICAgICAgICAgIHRoaXMuc2NlbmUucmVzaXplTWFwKHNpemUueCwgc2l6ZS55KTtcbiAgICAgICAgICAgIHRoaXMudXBkYXRlQm91bmRzKCk7XG4gICAgICAgIH0pO1xuXG4gICAgICAgIHRoaXMuX21hcC5vbignbW92ZScsICAoKSA9PiB7XG4gICAgICAgICAgICB2YXIgY2VudGVyID0gdGhpcy5fbWFwLmdldENlbnRlcigpO1xuICAgICAgICAgICAgdGhpcy5zY2VuZS5zZXRDZW50ZXIoY2VudGVyLmxuZywgY2VudGVyLmxhdCk7XG4gICAgICAgICAgICB0aGlzLnVwZGF0ZUJvdW5kcygpO1xuICAgICAgICB9KTtcblxuICAgICAgICB0aGlzLl9tYXAub24oJ3pvb21zdGFydCcsICgpID0+IHtcbiAgICAgICAgICAgIGNvbnNvbGUubG9nKFwibWFwLnpvb21zdGFydCBcIiArIHRoaXMuX21hcC5nZXRab29tKCkpO1xuICAgICAgICAgICAgdGhpcy5zY2VuZS5zdGFydFpvb20oKTtcbiAgICAgICAgfSk7XG5cbiAgICAgICAgdGhpcy5fbWFwLm9uKCd6b29tZW5kJywgICgpID0+IHtcbiAgICAgICAgICAgIGNvbnNvbGUubG9nKFwibWFwLnpvb21lbmQgXCIgKyB0aGlzLl9tYXAuZ2V0Wm9vbSgpKTtcbiAgICAgICAgICAgIHRoaXMuc2NlbmUuc2V0Wm9vbSh0aGlzLl9tYXAuZ2V0Wm9vbSgpKTtcbiAgICAgICAgICAgIHRoaXMudXBkYXRlQm91bmRzKCk7XG4gICAgICAgIH0pO1xuXG4gICAgICAgIHRoaXMuX21hcC5vbignZHJhZ3N0YXJ0JywgICgpID0+IHtcbiAgICAgICAgICAgIHRoaXMuc2NlbmUucGFubmluZyA9IHRydWU7XG4gICAgICAgIH0pO1xuXG4gICAgICAgIHRoaXMuX21hcC5vbignZHJhZ2VuZCcsICgpID0+IHtcbiAgICAgICAgICAgIHRoaXMuc2NlbmUucGFubmluZyA9IGZhbHNlO1xuICAgICAgICB9KTtcblxuICAgICAgICAvLyBDYW52YXMgZWxlbWVudCB3aWxsIGJlIGluc2VydGVkIGFmdGVyIG1hcCBjb250YWluZXIgKGxlYWZsZXQgdHJhbnNmb3JtcyBzaG91bGRuJ3QgYmUgYXBwbGllZCB0byB0aGUgR0wgY2FudmFzKVxuICAgICAgICAvLyBUT0RPOiBmaW5kIGEgYmV0dGVyIHdheSB0byBkZWFsIHdpdGggdGhpcz8gcmlnaHQgbm93IEdMIG1hcCBvbmx5IHJlbmRlcnMgY29ycmVjdGx5IGFzIHRoZSBib3R0b20gbGF5ZXJcbiAgICAgICAgdGhpcy5zY2VuZS5jb250YWluZXIgPSB0aGlzLl9tYXAuZ2V0Q29udGFpbmVyKCk7XG5cbiAgICAgICAgdmFyIGNlbnRlciA9IHRoaXMuX21hcC5nZXRDZW50ZXIoKTtcbiAgICAgICAgdGhpcy5zY2VuZS5zZXRDZW50ZXIoY2VudGVyLmxuZywgY2VudGVyLmxhdCk7XG4gICAgICAgIGNvbnNvbGUubG9nKFwiem9vbTogXCIgKyB0aGlzLl9tYXAuZ2V0Wm9vbSgpKTtcbiAgICAgICAgdGhpcy5zY2VuZS5zZXRab29tKHRoaXMuX21hcC5nZXRab29tKCkpO1xuICAgICAgICB0aGlzLnVwZGF0ZUJvdW5kcygpO1xuXG4gICAgICAgIEwuR3JpZExheWVyLnByb3RvdHlwZS5vbkFkZC5hcHBseSh0aGlzLCBhcmd1bWVudHMpO1xuXG4gICAgICAgIC8vIFVzZSBsZWFmbGV0J3MgZXhpc3RpbmcgZXZlbnQgc3lzdGVtIGFzIHRoZSBjYWxsYmFjayBtZWNoYW5pc21cbiAgICAgICAgdGhpcy5zY2VuZS5pbml0KCgpID0+IHtcbiAgICAgICAgICAgIHRoaXMuZmlyZSgnaW5pdCcpO1xuICAgICAgICB9KTtcbiAgICB9LFxuXG4gICAgb25SZW1vdmU6IGZ1bmN0aW9uIChtYXApIHtcbiAgICAgICAgTC5HcmlkTGF5ZXIucHJvdG90eXBlLm9uUmVtb3ZlLmFwcGx5KHRoaXMsIGFyZ3VtZW50cyk7XG4gICAgICAgIC8vIFRPRE86IHJlbW92ZSBldmVudCBoYW5kbGVycywgZGVzdHJveSBtYXBcbiAgICB9LFxuXG4gICAgY3JlYXRlVGlsZTogZnVuY3Rpb24gKGNvb3JkcywgZG9uZSkge1xuICAgICAgICB2YXIgZGl2ID0gZG9jdW1lbnQuY3JlYXRlRWxlbWVudCgnZGl2Jyk7XG4gICAgICAgIHRoaXMuc2NlbmUubG9hZFRpbGUoY29vcmRzLCBkaXYsIGRvbmUpO1xuICAgICAgICByZXR1cm4gZGl2O1xuICAgIH0sXG5cbiAgICB1cGRhdGVCb3VuZHM6IGZ1bmN0aW9uICgpIHtcbiAgICAgICAgdmFyIGJvdW5kcyA9IHRoaXMuX21hcC5nZXRCb3VuZHMoKTtcbiAgICAgICAgdGhpcy5zY2VuZS5zZXRCb3VuZHMoYm91bmRzLmdldFNvdXRoV2VzdCgpLCBib3VuZHMuZ2V0Tm9ydGhFYXN0KCkpO1xuICAgIH0sXG5cbiAgICByZW5kZXI6IGZ1bmN0aW9uICgpIHtcbiAgICAgICAgdGhpcy5zY2VuZS5yZW5kZXIoKTtcbiAgICB9XG5cbn0pO1xuXG5leHBvcnQgZnVuY3Rpb24gbGVhZmxldExheWVyKG9wdGlvbnMpIHtcbiAgICByZXR1cm4gbmV3IExlYWZsZXRMYXllcihvcHRpb25zKTtcbn1cbiIsIi8vIE1vZHVsZXMgYW5kIGRlcGVuZGVuY2llcyB0byBleHBvc2UgaW4gdGhlIHB1YmxpYyBUYW5ncmFtIG1vZHVsZVxuXG4vLyBUaGUgbGVhZmxldCBsYXllciBwbHVnaW4gaXMgY3VycmVudGx5IHRoZSBwcmltYXJ5IG1lYW5zIG9mIHVzaW5nIHRoZSBsaWJyYXJ5XG5cbmltcG9ydCB7TGVhZmxldExheWVyLCBsZWFmbGV0TGF5ZXJ9IGZyb20gJy4vbGVhZmxldF9sYXllcic7XG5pbXBvcnQge0dMfSBmcm9tICcuL2dsL2dsJztcbi8vIEdMIGZ1bmN0aW9ucyBpbmNsdWRlZCBmb3IgZWFzaWVyIGRlYnVnZ2luZyAvIGRpcmVjdCBhY2Nlc3MgdG8gc2V0dGluZyBnbG9iYWwgZGVmaW5lcywgcmVsb2FkaW5nIHByb2dyYW1zLCBldGMuXG5cbkdMLlByb2dyYW0gPSByZXF1aXJlKCcuL2dsL2dsX3Byb2dyYW0uanMnKS5kZWZhdWx0O1xuR0wuVGV4dHVyZSA9IHJlcXVpcmUoJy4vZ2wvZ2xfdGV4dHVyZS5qcycpO1xuXG5tb2R1bGUuZXhwb3J0cyA9IHtcbiAgICBMZWFmbGV0TGF5ZXI6IExlYWZsZXRMYXllcixcbiAgICBsZWFmbGV0TGF5ZXI6IGxlYWZsZXRMYXllcixcbiAgICBHTDogR0xcbn07XG5cbiIsIlxuZXhwb3J0IGRlZmF1bHQgY2xhc3MgUG9pbnQge1xuICAgIGNvbnN0cnVjdG9yKHgsIHkpIHtcbiAgICAgICAgaWYgKCEgKHRoaXMgaW5zdGFuY2VvZiBQb2ludCkpIHtcbiAgICAgICAgICAgIHJldHVybiBuZXcgUG9pbnQoeCwgeSk7XG4gICAgICAgIH1cbiAgICAgICAgdGhpcy54ID0geDtcbiAgICAgICAgdGhpcy55ID0geTtcbiAgICB9XG5cbiAgICBzdGF0aWMgY29weShvdGhlcikge1xuICAgICAgICBpZiAob3RoZXIgPT0gbnVsbCkge1xuICAgICAgICAgICAgcmV0dXJuIG51bGw7XG4gICAgICAgIH1cbiAgICAgICAgcmV0dXJuIG5ldyBQb2ludChvdGhlci54LCBvdGhlci55KTtcbiAgICB9XG59XG4iLCJpbXBvcnQgUG9pbnQgZnJvbSAnLi9wb2ludCc7XG5pbXBvcnQge0dlb30gZnJvbSAnLi9nZW8nO1xuaW1wb3J0ICogYXMgVXRpbHMgZnJvbSAnLi91dGlscyc7XG5pbXBvcnQge1N0eWxlfSBmcm9tICcuL3N0eWxlJztcbmltcG9ydCAqIGFzIFF1ZXVlIGZyb20gJ3F1ZXVlLWFzeW5jJztcbmltcG9ydCB7R0x9IGZyb20gJy4vZ2wvZ2wnO1xuaW1wb3J0IHtHTEJ1aWxkZXJzfSBmcm9tICcuL2dsL2dsX2J1aWxkZXJzJztcbmltcG9ydCBHTFByb2dyYW0gZnJvbSAnLi9nbC9nbF9wcm9ncmFtJztcbmltcG9ydCBHTFRleHR1cmUgZnJvbSAnLi9nbC9nbF90ZXh0dXJlJztcbmltcG9ydCB7TW9kZU1hbmFnZXJ9IGZyb20gJy4vZ2wvZ2xfbW9kZXMnO1xuaW1wb3J0IENhbWVyYSBmcm9tICcuL2NhbWVyYSc7XG5cbmltcG9ydCB7bWF0NCwgdmVjM30gZnJvbSAnZ2wtbWF0cml4JztcblxuLy8gU2V0dXAgdGhhdCBoYXBwZW5zIG9uIG1haW4gdGhyZWFkIG9ubHkgKHNraXAgaW4gd2ViIHdvcmtlcilcbnZhciB5YW1sO1xuVXRpbHMucnVuSWZJbk1haW5UaHJlYWQoZnVuY3Rpb24oKSB7XG4gICAgdHJ5IHtcbiAgICAgICAgeWFtbCA9IHJlcXVpcmUoJ2pzLXlhbWwnKTtcbiAgICB9XG4gICAgY2F0Y2ggKGUpIHtcbiAgICAgICAgY29uc29sZS5sb2coXCJubyBZQU1MIHN1cHBvcnQsIGpzLXlhbWwgbW9kdWxlIG5vdCBmb3VuZFwiKTtcbiAgICB9XG5cbiAgICBmaW5kQmFzZUxpYnJhcnlVUkwoKTtcbn0pO1xuXG4vLyBHbG9iYWwgc2V0dXBcblNjZW5lLnRpbGVfc2NhbGUgPSA0MDk2OyAvLyBjb29yZGluYXRlcyBhcmUgbG9jYWxseSBzY2FsZWQgdG8gdGhlIHJhbmdlIFswLCB0aWxlX3NjYWxlXVxuR2VvLnNldFRpbGVTY2FsZShTY2VuZS50aWxlX3NjYWxlKTtcbkdMQnVpbGRlcnMuc2V0VGlsZVNjYWxlKFNjZW5lLnRpbGVfc2NhbGUpO1xuR0xQcm9ncmFtLmRlZmluZXMuVElMRV9TQ0FMRSA9IFNjZW5lLnRpbGVfc2NhbGU7XG5TY2VuZS5kZWJ1ZyA9IGZhbHNlO1xuXG4vLyBMYXllcnMgJiBzdHlsZXM6IHBhc3MgYW4gb2JqZWN0IGRpcmVjdGx5LCBvciBhIFVSTCBhcyBzdHJpbmcgdG8gbG9hZCByZW1vdGVseVxuLy8gVE9ETywgY29udmVydCB0aGlzIHRvIHRoZSBjbGFzcyBzeXRuYXggb25jZSB3ZSBnZXQgdGhlIHJ1bnRpbWVcbi8vIHdvcmtpbmcsIElXXG5leHBvcnQgZGVmYXVsdCBmdW5jdGlvbiBTY2VuZSh0aWxlX3NvdXJjZSwgbGF5ZXJzLCBzdHlsZXMsIG9wdGlvbnMpIHtcbiAgICB2YXIgb3B0aW9ucyA9IG9wdGlvbnMgfHwge307XG4gICAgdGhpcy5pbml0aWFsaXplZCA9IGZhbHNlO1xuXG4gICAgdGhpcy50aWxlX3NvdXJjZSA9IHRpbGVfc291cmNlO1xuICAgIHRoaXMudGlsZXMgPSB7fTtcbiAgICB0aGlzLnF1ZXVlZF90aWxlcyA9IFtdO1xuICAgIHRoaXMubnVtX3dvcmtlcnMgPSBvcHRpb25zLm51bV93b3JrZXJzIHx8IDE7XG4gICAgdGhpcy5hbGxvd19jcm9zc19kb21haW5fd29ya2VycyA9IChvcHRpb25zLmFsbG93X2Nyb3NzX2RvbWFpbl93b3JrZXJzID09PSBmYWxzZSA/IGZhbHNlIDogdHJ1ZSk7XG5cbiAgICB0aGlzLmxheWVycyA9IGxheWVycztcbiAgICB0aGlzLnN0eWxlcyA9IHN0eWxlcztcblxuICAgIHRoaXMuZGlydHkgPSB0cnVlOyAvLyByZXF1ZXN0IGEgcmVkcmF3XG4gICAgdGhpcy5hbmltYXRlZCA9IGZhbHNlOyAvLyByZXF1ZXN0IHJlZHJhdyBldmVyeSBmcmFtZVxuXG4gICAgdGhpcy5mcmFtZSA9IDA7XG4gICAgdGhpcy56b29tID0gbnVsbDtcbiAgICB0aGlzLmNlbnRlciA9IG51bGw7XG4gICAgdGhpcy5kZXZpY2VfcGl4ZWxfcmF0aW8gPSB3aW5kb3cuZGV2aWNlUGl4ZWxSYXRpbyB8fCAxO1xuXG4gICAgdGhpcy56b29taW5nID0gZmFsc2U7XG4gICAgdGhpcy5wYW5uaW5nID0gZmFsc2U7XG5cbiAgICB0aGlzLmNvbnRhaW5lciA9IG9wdGlvbnMuY29udGFpbmVyO1xuXG4gICAgdGhpcy5yZXNldFRpbWUoKTtcbn1cblxuU2NlbmUucHJvdG90eXBlLmluaXQgPSBmdW5jdGlvbiAoY2FsbGJhY2spIHtcbiAgICBpZiAodGhpcy5pbml0aWFsaXplZCkge1xuICAgICAgICByZXR1cm47XG4gICAgfVxuXG4gICAgLy8gTG9hZCBzY2VuZSBkZWZpbml0aW9uIChsYXllcnMsIHN0eWxlcywgZXRjLiksIHRoZW4gY3JlYXRlIG1vZGVzICYgd29ya2Vyc1xuICAgIHRoaXMubG9hZFNjZW5lKCgpID0+IHtcbiAgICAgICAgdmFyIHF1ZXVlID0gUXVldWUoKTtcblxuICAgICAgICAvLyBDcmVhdGUgcmVuZGVyaW5nIG1vZGVzXG4gICAgICAgIHF1ZXVlLmRlZmVyKGNvbXBsZXRlID0+IHtcbiAgICAgICAgICAgIHRoaXMubW9kZXMgPSBTY2VuZS5jcmVhdGVNb2Rlcyh0aGlzLnN0eWxlcyk7XG4gICAgICAgICAgICB0aGlzLnVwZGF0ZUFjdGl2ZU1vZGVzKCk7XG4gICAgICAgICAgICBjb21wbGV0ZSgpO1xuICAgICAgICB9KTtcblxuICAgICAgICAvLyBDcmVhdGUgd2ViIHdvcmtlcnNcbiAgICAgICAgcXVldWUuZGVmZXIoY29tcGxldGUgPT4ge1xuICAgICAgICAgICAgdGhpcy5jcmVhdGVXb3JrZXJzKGNvbXBsZXRlKTtcbiAgICAgICAgfSk7XG5cbiAgICAgICAgLy8gVGhlbiBjcmVhdGUgR0wgY29udGV4dFxuICAgICAgICBxdWV1ZS5hd2FpdCgoKSA9PiB7XG4gICAgICAgICAgICAvLyBDcmVhdGUgY2FudmFzICYgR0xcbiAgICAgICAgICAgIHRoaXMuY29udGFpbmVyID0gdGhpcy5jb250YWluZXIgfHwgZG9jdW1lbnQuYm9keTtcbiAgICAgICAgICAgIHRoaXMuY2FudmFzID0gZG9jdW1lbnQuY3JlYXRlRWxlbWVudCgnY2FudmFzJyk7XG4gICAgICAgICAgICB0aGlzLmNhbnZhcy5zdHlsZS5wb3NpdGlvbiA9ICdhYnNvbHV0ZSc7XG4gICAgICAgICAgICB0aGlzLmNhbnZhcy5zdHlsZS50b3AgPSAwO1xuICAgICAgICAgICAgdGhpcy5jYW52YXMuc3R5bGUubGVmdCA9IDA7XG4gICAgICAgICAgICB0aGlzLmNhbnZhcy5zdHlsZS56SW5kZXggPSAtMTtcbiAgICAgICAgICAgIHRoaXMuY29udGFpbmVyLmFwcGVuZENoaWxkKHRoaXMuY2FudmFzKTtcblxuICAgICAgICAgICAgdGhpcy5nbCA9IEdMLmdldENvbnRleHQodGhpcy5jYW52YXMpO1xuICAgICAgICAgICAgdGhpcy5yZXNpemVNYXAodGhpcy5jb250YWluZXIuY2xpZW50V2lkdGgsIHRoaXMuY29udGFpbmVyLmNsaWVudEhlaWdodCk7XG5cbiAgICAgICAgICAgIHRoaXMuY3JlYXRlQ2FtZXJhKCk7XG4gICAgICAgICAgICB0aGlzLmluaXRNb2RlcygpOyAvLyBUT0RPOiByZW1vdmUgZ2wgY29udGV4dCBzdGF0ZSBmcm9tIG1vZGVzLCBhbmQgbW92ZSBpbml0IHRvIGNyZWF0ZSBzdGVwIGFib3ZlP1xuICAgICAgICAgICAgdGhpcy5pbml0U2VsZWN0aW9uQnVmZmVyKCk7XG5cbiAgICAgICAgICAgIC8vIHRoaXMuem9vbV9zdGVwID0gMC4wMjsgLy8gZm9yIGZyYWN0aW9uYWwgem9vbSB1c2VyIGFkanVzdG1lbnRcbiAgICAgICAgICAgIHRoaXMubGFzdF9yZW5kZXJfY291bnQgPSBudWxsO1xuICAgICAgICAgICAgdGhpcy5pbml0SW5wdXRIYW5kbGVycygpO1xuXG4gICAgICAgICAgICB0aGlzLmluaXRpYWxpemVkID0gdHJ1ZTtcblxuICAgICAgICAgICAgaWYgKHR5cGVvZiBjYWxsYmFjayA9PSAnZnVuY3Rpb24nKSB7XG4gICAgICAgICAgICAgICAgY2FsbGJhY2soKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgfSk7XG4gICAgfSk7XG59O1xuXG5TY2VuZS5wcm90b3R5cGUuaW5pdE1vZGVzID0gZnVuY3Rpb24gKCkge1xuICAgIC8vIEluaXQgR0wgY29udGV4dCBmb3IgbW9kZXMgKGNvbXBpbGVzIHByb2dyYW1zLCBldGMuKVxuICAgIGZvciAodmFyIG0gaW4gdGhpcy5tb2Rlcykge1xuICAgICAgICB0aGlzLm1vZGVzW21dLmluaXQodGhpcy5nbCk7XG4gICAgfVxufTtcblxuU2NlbmUucHJvdG90eXBlLmluaXRTZWxlY3Rpb25CdWZmZXIgPSBmdW5jdGlvbiAoKSB7XG4gICAgLy8gU2VsZWN0aW9uIHN0YXRlIHRyYWNraW5nXG4gICAgdGhpcy5waXhlbCA9IG5ldyBVaW50OEFycmF5KDQpO1xuICAgIHRoaXMucGl4ZWwzMiA9IG5ldyBGbG9hdDMyQXJyYXkodGhpcy5waXhlbC5idWZmZXIpO1xuICAgIHRoaXMuc2VsZWN0aW9uX3BvaW50ID0gUG9pbnQoMCwgMCk7XG4gICAgdGhpcy5zZWxlY3RlZF9mZWF0dXJlID0gbnVsbDtcbiAgICB0aGlzLnNlbGVjdGlvbl9jYWxsYmFjayA9IG51bGw7XG4gICAgdGhpcy5zZWxlY3Rpb25fY2FsbGJhY2tfdGltZXIgPSBudWxsO1xuICAgIHRoaXMuc2VsZWN0aW9uX2ZyYW1lX2RlbGF5ID0gNTsgLy8gZGVsYXkgZnJvbSBzZWxlY3Rpb24gcmVuZGVyIHRvIGZyYW1lYnVmZmVyIHNhbXBsZSwgdG8gYXZvaWQgQ1BVL0dQVSBzeW5jIGxvY2tcbiAgICB0aGlzLnVwZGF0ZV9zZWxlY3Rpb24gPSBmYWxzZTtcblxuICAgIC8vIEZyYW1lIGJ1ZmZlciBmb3Igc2VsZWN0aW9uXG4gICAgLy8gVE9ETzogaW5pdGlhdGUgbGF6aWx5IGluIGNhc2Ugd2UgZG9uJ3QgbmVlZCB0byBkbyBhbnkgc2VsZWN0aW9uXG4gICAgdGhpcy5mYm8gPSB0aGlzLmdsLmNyZWF0ZUZyYW1lYnVmZmVyKCk7XG4gICAgdGhpcy5nbC5iaW5kRnJhbWVidWZmZXIodGhpcy5nbC5GUkFNRUJVRkZFUiwgdGhpcy5mYm8pO1xuICAgIHRoaXMuZmJvX3NpemUgPSB7IHdpZHRoOiAyNTYsIGhlaWdodDogMjU2IH07IC8vIFRPRE86IG1ha2UgY29uZmlndXJhYmxlIC8gYWRhcHRpdmUgYmFzZWQgb24gY2FudmFzIHNpemVcbiAgICB0aGlzLmZib19zaXplLmFzcGVjdCA9IHRoaXMuZmJvX3NpemUud2lkdGggLyB0aGlzLmZib19zaXplLmhlaWdodDtcbiAgICB0aGlzLmdsLnZpZXdwb3J0KDAsIDAsIHRoaXMuZmJvX3NpemUud2lkdGgsIHRoaXMuZmJvX3NpemUuaGVpZ2h0KTtcblxuICAgIC8vIFRleHR1cmUgZm9yIHRoZSBGQk8gY29sb3IgYXR0YWNobWVudFxuICAgIHRoaXMuZmJvX3RleHR1cmUgPSBuZXcgR0xUZXh0dXJlKHRoaXMuZ2wsICdzZWxlY3Rpb25fZmJvJyk7XG4gICAgdGhpcy5mYm9fdGV4dHVyZS5zZXREYXRhKHRoaXMuZmJvX3NpemUud2lkdGgsIHRoaXMuZmJvX3NpemUuaGVpZ2h0LCBudWxsLCB7IGZpbHRlcmluZzogJ25lYXJlc3QnIH0pO1xuICAgIHRoaXMuZ2wuZnJhbWVidWZmZXJUZXh0dXJlMkQodGhpcy5nbC5GUkFNRUJVRkZFUiwgdGhpcy5nbC5DT0xPUl9BVFRBQ0hNRU5UMCwgdGhpcy5nbC5URVhUVVJFXzJELCB0aGlzLmZib190ZXh0dXJlLnRleHR1cmUsIDApO1xuXG4gICAgLy8gUmVuZGVyYnVmZmVyIGZvciB0aGUgRkJPIGRlcHRoIGF0dGFjaG1lbnRcbiAgICB0aGlzLmZib19kZXB0aF9yYiA9IHRoaXMuZ2wuY3JlYXRlUmVuZGVyYnVmZmVyKCk7XG4gICAgdGhpcy5nbC5iaW5kUmVuZGVyYnVmZmVyKHRoaXMuZ2wuUkVOREVSQlVGRkVSLCB0aGlzLmZib19kZXB0aF9yYik7XG4gICAgdGhpcy5nbC5yZW5kZXJidWZmZXJTdG9yYWdlKHRoaXMuZ2wuUkVOREVSQlVGRkVSLCB0aGlzLmdsLkRFUFRIX0NPTVBPTkVOVDE2LCB0aGlzLmZib19zaXplLndpZHRoLCB0aGlzLmZib19zaXplLmhlaWdodCk7XG4gICAgdGhpcy5nbC5mcmFtZWJ1ZmZlclJlbmRlcmJ1ZmZlcih0aGlzLmdsLkZSQU1FQlVGRkVSLCB0aGlzLmdsLkRFUFRIX0FUVEFDSE1FTlQsIHRoaXMuZ2wuUkVOREVSQlVGRkVSLCB0aGlzLmZib19kZXB0aF9yYik7XG5cbiAgICB0aGlzLmdsLmJpbmRGcmFtZWJ1ZmZlcih0aGlzLmdsLkZSQU1FQlVGRkVSLCBudWxsKTtcbiAgICB0aGlzLmdsLnZpZXdwb3J0KDAsIDAsIHRoaXMuY2FudmFzLndpZHRoLCB0aGlzLmNhbnZhcy5oZWlnaHQpO1xufTtcblxuLy8gV2ViIHdvcmtlcnMgaGFuZGxlIGhlYXZ5IGR1dHkgdGlsZSBjb25zdHJ1Y3Rpb246IG5ldHdvcmtpbmcsIGdlb21ldHJ5IHByb2Nlc3NpbmcsIGV0Yy5cblNjZW5lLnByb3RvdHlwZS5jcmVhdGVXb3JrZXJzID0gZnVuY3Rpb24gKGNhbGxiYWNrKSB7XG4gICAgdmFyIHF1ZXVlID0gUXVldWUoKTtcbiAgICB2YXIgd29ya2VyX3VybCA9IFNjZW5lLmxpYnJhcnlfYmFzZV91cmwgKyAndGFuZ3JhbS13b3JrZXIuZGVidWcuanMnICsgJz8nICsgKCtuZXcgRGF0ZSgpKTtcblxuICAgIC8vIExvYWQgJiBpbnN0YW50aWF0ZSB3b3JrZXJzXG4gICAgcXVldWUuZGVmZXIoY29tcGxldGUgPT4ge1xuICAgICAgICAvLyBMb2NhbCBvYmplY3QgVVJMcyBzdXBwb3J0ZWQ/XG4gICAgICAgIHZhciBjcmVhdGVPYmplY3RVUkwgPSAod2luZG93LlVSTCAmJiB3aW5kb3cuVVJMLmNyZWF0ZU9iamVjdFVSTCkgfHwgKHdpbmRvdy53ZWJraXRVUkwgJiYgd2luZG93LndlYmtpdFVSTC5jcmVhdGVPYmplY3RVUkwpO1xuICAgICAgICBpZiAoY3JlYXRlT2JqZWN0VVJMICYmIHRoaXMuYWxsb3dfY3Jvc3NfZG9tYWluX3dvcmtlcnMpIHtcbiAgICAgICAgICAgIC8vIFRvIGFsbG93IHdvcmtlcnMgdG8gYmUgbG9hZGVkIGNyb3NzLWRvbWFpbiwgZmlyc3QgbG9hZCB3b3JrZXIgc291cmNlIHZpYSBYSFIsIHRoZW4gY3JlYXRlIGEgbG9jYWwgVVJMIHZpYSBhIGJsb2JcbiAgICAgICAgICAgIHZhciByZXEgPSBuZXcgWE1MSHR0cFJlcXVlc3QoKTtcbiAgICAgICAgICAgIHJlcS5vbmxvYWQgPSAoKSA9PiB7XG4gICAgICAgICAgICAgICAgdmFyIHdvcmtlcl9sb2NhbF91cmwgPSBjcmVhdGVPYmplY3RVUkwobmV3IEJsb2IoW3JlcS5yZXNwb25zZV0sIHsgdHlwZTogJ2FwcGxpY2F0aW9uL2phdmFzY3JpcHQnIH0pKTtcbiAgICAgICAgICAgICAgICB0aGlzLm1ha2VXb3JrZXJzKHdvcmtlcl9sb2NhbF91cmwpO1xuICAgICAgICAgICAgICAgIGNvbXBsZXRlKCk7XG4gICAgICAgICAgICB9O1xuICAgICAgICAgICAgcmVxLm9wZW4oJ0dFVCcsIHdvcmtlcl91cmwsIHRydWUgLyogYXN5bmMgZmxhZyAqLyk7XG4gICAgICAgICAgICByZXEucmVzcG9uc2VUeXBlID0gJ3RleHQnO1xuICAgICAgICAgICAgcmVxLnNlbmQoKTtcbiAgICAgICAgfVxuICAgICAgICAvLyBUcmFkaXRpb25hbCBsb2FkIGZyb20gcmVtb3RlIFVSTFxuICAgICAgICBlbHNlIHtcbiAgICAgICAgICAgIGNvbnNvbGUubG9nKHRoaXMpO1xuICAgICAgICAgICAgdGhpcy5tYWtlV29ya2Vycyh3b3JrZXJfdXJsKTtcbiAgICAgICAgICAgIGNvbXBsZXRlKCk7XG4gICAgICAgIH1cbiAgICB9KTtcblxuICAgIC8vIEluaXQgd29ya2Vyc1xuICAgIHF1ZXVlLmF3YWl0KCgpID0+IHtcbiAgICAgICAgdGhpcy53b3JrZXJzLmZvckVhY2god29ya2VyID0+IHtcbiAgICAgICAgICAgIHdvcmtlci5hZGRFdmVudExpc3RlbmVyKCdtZXNzYWdlJywgdGhpcy53b3JrZXJCdWlsZFRpbGVDb21wbGV0ZWQuYmluZCh0aGlzKSk7XG4gICAgICAgICAgICB3b3JrZXIuYWRkRXZlbnRMaXN0ZW5lcignbWVzc2FnZScsIHRoaXMud29ya2VyR2V0RmVhdHVyZVNlbGVjdGlvbi5iaW5kKHRoaXMpKTtcbiAgICAgICAgICAgIHdvcmtlci5hZGRFdmVudExpc3RlbmVyKCdtZXNzYWdlJywgdGhpcy53b3JrZXJMb2dNZXNzYWdlLmJpbmQodGhpcykpO1xuICAgICAgICB9KTtcblxuICAgICAgICB0aGlzLm5leHRfd29ya2VyID0gMDtcbiAgICAgICAgdGhpcy5zZWxlY3Rpb25fbWFwX3dvcmtlcl9zaXplID0ge307XG5cbiAgICAgICAgaWYgKHR5cGVvZiBjYWxsYmFjayA9PSAnZnVuY3Rpb24nKSB7XG4gICAgICAgICAgICBjYWxsYmFjaygpO1xuICAgICAgICB9XG4gICAgfSk7XG59O1xuXG4vLyBJbnN0YW50aWF0ZSB3b3JrZXJzIGZyb20gVVJMXG5TY2VuZS5wcm90b3R5cGUubWFrZVdvcmtlcnMgPSBmdW5jdGlvbiAodXJsKSB7XG4gICAgdGhpcy53b3JrZXJzID0gW107XG4gICAgZm9yICh2YXIgdz0wOyB3IDwgdGhpcy5udW1fd29ya2VyczsgdysrKSB7XG4gICAgICAgIHRoaXMud29ya2Vycy5wdXNoKG5ldyBXb3JrZXIodXJsKSk7XG4gICAgICAgIHRoaXMud29ya2Vyc1t3XS5wb3N0TWVzc2FnZSh7XG4gICAgICAgICAgICB0eXBlOiAnaW5pdCcsXG4gICAgICAgICAgICB3b3JrZXJfaWQ6IHcsXG4gICAgICAgICAgICBudW1fd29ya2VyczogdGhpcy5udW1fd29ya2Vyc1xuICAgICAgICB9KVxuICAgIH1cbn07XG5cbi8vIFBvc3QgYSBtZXNzYWdlIGFib3V0IGEgdGlsZSB0byB0aGUgbmV4dCB3b3JrZXIgKHJvdW5kIHJvYmJpbilcblNjZW5lLnByb3RvdHlwZS53b3JrZXJQb3N0TWVzc2FnZUZvclRpbGUgPSBmdW5jdGlvbiAodGlsZSwgbWVzc2FnZSkge1xuICAgIGlmICh0aWxlLndvcmtlciA9PSBudWxsKSB7XG4gICAgICAgIHRpbGUud29ya2VyID0gdGhpcy5uZXh0X3dvcmtlcjtcbiAgICAgICAgdGhpcy5uZXh0X3dvcmtlciA9ICh0aWxlLndvcmtlciArIDEpICUgdGhpcy53b3JrZXJzLmxlbmd0aDtcbiAgICB9XG4gICAgdGhpcy53b3JrZXJzW3RpbGUud29ya2VyXS5wb3N0TWVzc2FnZShtZXNzYWdlKTtcbn07XG5cblNjZW5lLnByb3RvdHlwZS5zZXRDZW50ZXIgPSBmdW5jdGlvbiAobG5nLCBsYXQpIHtcbiAgICB0aGlzLmNlbnRlciA9IHsgbG5nOiBsbmcsIGxhdDogbGF0IH07XG4gICAgdGhpcy5kaXJ0eSA9IHRydWU7XG59O1xuXG5TY2VuZS5wcm90b3R5cGUuc3RhcnRab29tID0gZnVuY3Rpb24gKCkge1xuICAgIHRoaXMubGFzdF96b29tID0gdGhpcy56b29tO1xuICAgIHRoaXMuem9vbWluZyA9IHRydWU7XG59O1xuXG5TY2VuZS5wcm90b3R5cGUucHJlc2VydmVfdGlsZXNfd2l0aGluX3pvb20gPSAyO1xuU2NlbmUucHJvdG90eXBlLnNldFpvb20gPSBmdW5jdGlvbiAoem9vbSkge1xuICAgIC8vIFNjaGVkdWxlIEdMIHRpbGVzIGZvciByZW1vdmFsIG9uIHpvb21cbiAgICB2YXIgYmVsb3cgPSB6b29tO1xuICAgIHZhciBhYm92ZSA9IHpvb207XG4gICAgaWYgKHRoaXMubGFzdF96b29tICE9IG51bGwpIHtcbiAgICAgICAgY29uc29sZS5sb2coXCJzY2VuZS5sYXN0X3pvb206IFwiICsgdGhpcy5sYXN0X3pvb20pO1xuICAgICAgICBpZiAoTWF0aC5hYnMoem9vbSAtIHRoaXMubGFzdF96b29tKSA8PSB0aGlzLnByZXNlcnZlX3RpbGVzX3dpdGhpbl96b29tKSB7XG4gICAgICAgICAgICBpZiAoem9vbSA+IHRoaXMubGFzdF96b29tKSB7XG4gICAgICAgICAgICAgICAgYmVsb3cgPSB6b29tIC0gdGhpcy5wcmVzZXJ2ZV90aWxlc193aXRoaW5fem9vbTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIGVsc2Uge1xuICAgICAgICAgICAgICAgIGFib3ZlID0gem9vbSArIHRoaXMucHJlc2VydmVfdGlsZXNfd2l0aGluX3pvb207XG4gICAgICAgICAgICB9XG4gICAgICAgIH1cbiAgICB9XG5cbiAgICB0aGlzLmxhc3Rfem9vbSA9IHRoaXMuem9vbTtcbiAgICB0aGlzLnpvb20gPSB6b29tO1xuICAgIHRoaXMuY2FwcGVkX3pvb20gPSBNYXRoLm1pbih+fnRoaXMuem9vbSwgdGhpcy50aWxlX3NvdXJjZS5tYXhfem9vbSB8fCB+fnRoaXMuem9vbSk7XG4gICAgdGhpcy56b29taW5nID0gZmFsc2U7XG4gICAgdGhpcy51cGRhdGVNZXRlclZpZXcoKTtcblxuICAgIHRoaXMucmVtb3ZlVGlsZXNPdXRzaWRlWm9vbVJhbmdlKGJlbG93LCBhYm92ZSk7XG4gICAgdGhpcy5kaXJ0eSA9IHRydWU7XG59O1xuXG5TY2VuZS5wcm90b3R5cGUudXBkYXRlTWV0ZXJWaWV3ID0gZnVuY3Rpb24gKCkge1xuICAgIHRoaXMubWV0ZXJzX3Blcl9waXhlbCA9IEdlby5tZXRlcnNQZXJQaXhlbCh0aGlzLnpvb20pO1xuXG4gICAgLy8gU2l6ZSBvZiB0aGUgaGFsZi12aWV3cG9ydCBpbiBtZXRlcnMgYXQgY3VycmVudCB6b29tXG4gICAgaWYgKHRoaXMuY3NzX3NpemUgIT09IHVuZGVmaW5lZCkgeyAvLyBUT0RPOiByZXBsYWNlIHRoaXMgY2hlY2s/XG4gICAgICAgIHRoaXMubWV0ZXJfem9vbSA9IHtcbiAgICAgICAgICAgIHg6IHRoaXMuY3NzX3NpemUud2lkdGggLyAyICogdGhpcy5tZXRlcnNfcGVyX3BpeGVsLFxuICAgICAgICAgICAgeTogdGhpcy5jc3Nfc2l6ZS5oZWlnaHQgLyAyICogdGhpcy5tZXRlcnNfcGVyX3BpeGVsXG4gICAgICAgIH07XG4gICAgfVxufTtcblxuU2NlbmUucHJvdG90eXBlLnJlbW92ZVRpbGVzT3V0c2lkZVpvb21SYW5nZSA9IGZ1bmN0aW9uIChiZWxvdywgYWJvdmUpIHtcbiAgICBiZWxvdyA9IE1hdGgubWluKGJlbG93LCB0aGlzLnRpbGVfc291cmNlLm1heF96b29tIHx8IGJlbG93KTtcbiAgICBhYm92ZSA9IE1hdGgubWluKGFib3ZlLCB0aGlzLnRpbGVfc291cmNlLm1heF96b29tIHx8IGFib3ZlKTtcblxuICAgIGNvbnNvbGUubG9nKFwicmVtb3ZlVGlsZXNPdXRzaWRlWm9vbVJhbmdlIFtcIiArIGJlbG93ICsgXCIsIFwiICsgYWJvdmUgKyBcIl0pXCIpO1xuICAgIHZhciByZW1vdmVfdGlsZXMgPSBbXTtcbiAgICBmb3IgKHZhciB0IGluIHRoaXMudGlsZXMpIHtcbiAgICAgICAgdmFyIHRpbGUgPSB0aGlzLnRpbGVzW3RdO1xuICAgICAgICBpZiAodGlsZS5jb29yZHMueiA8IGJlbG93IHx8IHRpbGUuY29vcmRzLnogPiBhYm92ZSkge1xuICAgICAgICAgICAgcmVtb3ZlX3RpbGVzLnB1c2godCk7XG4gICAgICAgIH1cbiAgICB9XG4gICAgZm9yICh2YXIgcj0wOyByIDwgcmVtb3ZlX3RpbGVzLmxlbmd0aDsgcisrKSB7XG4gICAgICAgIHZhciBrZXkgPSByZW1vdmVfdGlsZXNbcl07XG4gICAgICAgIGNvbnNvbGUubG9nKFwicmVtb3ZlZCBcIiArIGtleSArIFwiIChvdXRzaWRlIHJhbmdlIFtcIiArIGJlbG93ICsgXCIsIFwiICsgYWJvdmUgKyBcIl0pXCIpO1xuICAgICAgICB0aGlzLnJlbW92ZVRpbGUoa2V5KTtcbiAgICB9XG59O1xuXG5TY2VuZS5wcm90b3R5cGUuc2V0Qm91bmRzID0gZnVuY3Rpb24gKHN3LCBuZSkge1xuICAgIHRoaXMuYm91bmRzID0ge1xuICAgICAgICBzdzogeyBsbmc6IHN3LmxuZywgbGF0OiBzdy5sYXQgfSxcbiAgICAgICAgbmU6IHsgbG5nOiBuZS5sbmcsIGxhdDogbmUubGF0IH1cbiAgICB9O1xuXG4gICAgdmFyIGJ1ZmZlciA9IDIwMCAqIHRoaXMubWV0ZXJzX3Blcl9waXhlbDsgLy8gcGl4ZWxzIC0+IG1ldGVyc1xuICAgIHRoaXMuYnVmZmVyZWRfbWV0ZXJfYm91bmRzID0ge1xuICAgICAgICBzdzogR2VvLmxhdExuZ1RvTWV0ZXJzKFBvaW50KHRoaXMuYm91bmRzLnN3LmxuZywgdGhpcy5ib3VuZHMuc3cubGF0KSksXG4gICAgICAgIG5lOiBHZW8ubGF0TG5nVG9NZXRlcnMoUG9pbnQodGhpcy5ib3VuZHMubmUubG5nLCB0aGlzLmJvdW5kcy5uZS5sYXQpKVxuICAgIH07XG4gICAgdGhpcy5idWZmZXJlZF9tZXRlcl9ib3VuZHMuc3cueCAtPSBidWZmZXI7XG4gICAgdGhpcy5idWZmZXJlZF9tZXRlcl9ib3VuZHMuc3cueSAtPSBidWZmZXI7XG4gICAgdGhpcy5idWZmZXJlZF9tZXRlcl9ib3VuZHMubmUueCArPSBidWZmZXI7XG4gICAgdGhpcy5idWZmZXJlZF9tZXRlcl9ib3VuZHMubmUueSArPSBidWZmZXI7XG5cbiAgICB0aGlzLmNlbnRlcl9tZXRlcnMgPSBQb2ludChcbiAgICAgICAgKHRoaXMuYnVmZmVyZWRfbWV0ZXJfYm91bmRzLnN3LnggKyB0aGlzLmJ1ZmZlcmVkX21ldGVyX2JvdW5kcy5uZS54KSAvIDIsXG4gICAgICAgICh0aGlzLmJ1ZmZlcmVkX21ldGVyX2JvdW5kcy5zdy55ICsgdGhpcy5idWZmZXJlZF9tZXRlcl9ib3VuZHMubmUueSkgLyAyXG4gICAgKTtcblxuICAgIC8vIGNvbnNvbGUubG9nKFwic2V0IHNjZW5lIGJvdW5kcyB0byBcIiArIEpTT04uc3RyaW5naWZ5KHRoaXMuYm91bmRzKSk7XG5cbiAgICAvLyBNYXJrIHRpbGVzIGFzIHZpc2libGUvaW52aXNpYmxlXG4gICAgZm9yICh2YXIgdCBpbiB0aGlzLnRpbGVzKSB7XG4gICAgICAgIHRoaXMudXBkYXRlVmlzaWJpbGl0eUZvclRpbGUodGhpcy50aWxlc1t0XSk7XG4gICAgfVxuXG4gICAgdGhpcy5kaXJ0eSA9IHRydWU7XG59O1xuXG5TY2VuZS5wcm90b3R5cGUuaXNUaWxlSW5ab29tID0gZnVuY3Rpb24gKHRpbGUpIHtcbiAgICByZXR1cm4gKE1hdGgubWluKHRpbGUuY29vcmRzLnosIHRoaXMudGlsZV9zb3VyY2UubWF4X3pvb20gfHwgdGlsZS5jb29yZHMueikgPT0gdGhpcy5jYXBwZWRfem9vbSk7XG59O1xuXG4vLyBVcGRhdGUgdmlzaWJpbGl0eSBhbmQgcmV0dXJuIHRydWUgaWYgY2hhbmdlZFxuU2NlbmUucHJvdG90eXBlLnVwZGF0ZVZpc2liaWxpdHlGb3JUaWxlID0gZnVuY3Rpb24gKHRpbGUpIHtcbiAgICB2YXIgdmlzaWJsZSA9IHRpbGUudmlzaWJsZTtcbiAgICB0aWxlLnZpc2libGUgPSB0aGlzLmlzVGlsZUluWm9vbSh0aWxlKSAmJiBHZW8uYm94SW50ZXJzZWN0KHRpbGUuYm91bmRzLCB0aGlzLmJ1ZmZlcmVkX21ldGVyX2JvdW5kcyk7XG4gICAgdGlsZS5jZW50ZXJfZGlzdCA9IE1hdGguYWJzKHRoaXMuY2VudGVyX21ldGVycy54IC0gdGlsZS5taW4ueCkgKyBNYXRoLmFicyh0aGlzLmNlbnRlcl9tZXRlcnMueSAtIHRpbGUubWluLnkpO1xuICAgIHJldHVybiAodmlzaWJsZSAhPSB0aWxlLnZpc2libGUpO1xufTtcblxuU2NlbmUucHJvdG90eXBlLnJlc2l6ZU1hcCA9IGZ1bmN0aW9uICh3aWR0aCwgaGVpZ2h0KSB7XG4gICAgdGhpcy5kaXJ0eSA9IHRydWU7XG5cbiAgICB0aGlzLmNzc19zaXplID0geyB3aWR0aDogd2lkdGgsIGhlaWdodDogaGVpZ2h0IH07XG4gICAgdGhpcy5kZXZpY2Vfc2l6ZSA9IHsgd2lkdGg6IE1hdGgucm91bmQodGhpcy5jc3Nfc2l6ZS53aWR0aCAqIHRoaXMuZGV2aWNlX3BpeGVsX3JhdGlvKSwgaGVpZ2h0OiBNYXRoLnJvdW5kKHRoaXMuY3NzX3NpemUuaGVpZ2h0ICogdGhpcy5kZXZpY2VfcGl4ZWxfcmF0aW8pIH07XG4gICAgdGhpcy52aWV3X2FzcGVjdCA9IHRoaXMuY3NzX3NpemUud2lkdGggLyB0aGlzLmNzc19zaXplLmhlaWdodDtcbiAgICB0aGlzLnVwZGF0ZU1ldGVyVmlldygpO1xuXG4gICAgdGhpcy5jYW52YXMuc3R5bGUud2lkdGggPSB0aGlzLmNzc19zaXplLndpZHRoICsgJ3B4JztcbiAgICB0aGlzLmNhbnZhcy5zdHlsZS5oZWlnaHQgPSB0aGlzLmNzc19zaXplLmhlaWdodCArICdweCc7XG4gICAgdGhpcy5jYW52YXMud2lkdGggPSB0aGlzLmRldmljZV9zaXplLndpZHRoO1xuICAgIHRoaXMuY2FudmFzLmhlaWdodCA9IHRoaXMuZGV2aWNlX3NpemUuaGVpZ2h0O1xuXG4gICAgdGhpcy5nbC5iaW5kRnJhbWVidWZmZXIodGhpcy5nbC5GUkFNRUJVRkZFUiwgbnVsbCk7XG4gICAgdGhpcy5nbC52aWV3cG9ydCgwLCAwLCB0aGlzLmNhbnZhcy53aWR0aCwgdGhpcy5jYW52YXMuaGVpZ2h0KTtcbn07XG5cblNjZW5lLnByb3RvdHlwZS5yZXF1ZXN0UmVkcmF3ID0gZnVuY3Rpb24gKCkge1xuICAgIHRoaXMuZGlydHkgPSB0cnVlO1xufTtcblxuLy8gRGV0ZXJtaW5lIGEgWiB2YWx1ZSB0aGF0IHdpbGwgc3RhY2sgZmVhdHVyZXMgaW4gYSBcInBhaW50ZXIncyBhbGdvcml0aG1cIiBzdHlsZSwgZmlyc3QgYnkgbGF5ZXIsIHRoZW4gYnkgZHJhdyBvcmRlciB3aXRoaW4gbGF5ZXJcbi8vIEZlYXR1cmVzIGFyZSBhc3N1bWVkIHRvIGJlIGFscmVhZHkgc29ydGVkIGluIGRlc2lyZWQgZHJhdyBvcmRlciBieSB0aGUgbGF5ZXIgcHJlLXByb2Nlc3NvclxuU2NlbmUuY2FsY3VsYXRlWiA9IGZ1bmN0aW9uIChsYXllciwgdGlsZSwgbGF5ZXJfb2Zmc2V0LCBmZWF0dXJlX29mZnNldCkge1xuICAgIC8vIHZhciBsYXllcl9vZmZzZXQgPSBsYXllcl9vZmZzZXQgfHwgMDtcbiAgICAvLyB2YXIgZmVhdHVyZV9vZmZzZXQgPSBmZWF0dXJlX29mZnNldCB8fCAwO1xuICAgIHZhciB6ID0gMDsgLy8gVE9ETzogbWFkZSB0aGlzIGEgbm8tb3AgdW50aWwgcmV2aXNpdGluZyB3aGVyZSBpdCBzaG91bGQgbGl2ZSAtIG9uZS10aW1lIGNhbGMgaGVyZSwgaW4gdmVydGV4IGxheW91dC9zaGFkZXIsIGV0Yy5cbiAgICByZXR1cm4gejtcbn07XG5cblNjZW5lLnByb3RvdHlwZS5yZW5kZXIgPSBmdW5jdGlvbiAoKSB7XG4gICAgdGhpcy5sb2FkUXVldWVkVGlsZXMoKTtcblxuICAgIC8vIFJlbmRlciBvbiBkZW1hbmRcbiAgICBpZiAodGhpcy5kaXJ0eSA9PSBmYWxzZSB8fCB0aGlzLmluaXRpYWxpemVkID09IGZhbHNlKSB7XG4gICAgICAgIHJldHVybiBmYWxzZTtcbiAgICB9XG4gICAgdGhpcy5kaXJ0eSA9IGZhbHNlOyAvLyBzdWJjbGFzc2VzIGNhbiBzZXQgdGhpcyBiYWNrIHRvIHRydWUgd2hlbiBhbmltYXRpb24gaXMgbmVlZGVkXG5cbiAgICB0aGlzLnJlbmRlckdMKCk7XG5cbiAgICAvLyBSZWRyYXcgZXZlcnkgZnJhbWUgaWYgYW5pbWF0aW5nXG4gICAgaWYgKHRoaXMuYW5pbWF0ZWQgPT0gdHJ1ZSkge1xuICAgICAgICB0aGlzLmRpcnR5ID0gdHJ1ZTtcbiAgICB9XG5cbiAgICB0aGlzLmZyYW1lKys7XG5cbiAgICAvLyBjb25zb2xlLmxvZyhcInJlbmRlciBtYXBcIik7XG4gICAgcmV0dXJuIHRydWU7XG59O1xuXG5TY2VuZS5wcm90b3R5cGUucmVzZXRGcmFtZSA9IGZ1bmN0aW9uICgpIHtcbiAgICBpZiAoIXRoaXMuaW5pdGlhbGl6ZWQpIHtcbiAgICAgICAgcmV0dXJuO1xuICAgIH1cblxuICAgIC8vIFJlc2V0IGZyYW1lIHN0YXRlXG4gICAgdmFyIGdsID0gdGhpcy5nbDtcbiAgICBnbC5jbGVhckNvbG9yKDAuMCwgMC4wLCAwLjAsIDEuMCk7XG4gICAgZ2wuY2xlYXIoZ2wuQ09MT1JfQlVGRkVSX0JJVCB8IGdsLkRFUFRIX0JVRkZFUl9CSVQpO1xuXG4gICAgLy8gVE9ETzogdW5uZWNlc3NhcnkgcmVwZWF0P1xuICAgIGdsLmVuYWJsZShnbC5ERVBUSF9URVNUKTtcbiAgICBnbC5kZXB0aEZ1bmMoZ2wuTEVTUyk7XG4gICAgZ2wuZW5hYmxlKGdsLkNVTExfRkFDRSk7XG4gICAgZ2wuY3VsbEZhY2UoZ2wuQkFDSyk7XG4gICAgLy8gZ2wuZW5hYmxlKGdsLkJMRU5EKTtcbiAgICAvLyBnbC5ibGVuZEZ1bmMoZ2wuU1JDX0FMUEhBLCBnbC5PTkVfTUlOVVNfU1JDX0FMUEhBKTtcbn07XG5cblNjZW5lLnByb3RvdHlwZS5yZW5kZXJHTCA9IGZ1bmN0aW9uICgpIHtcbiAgICB2YXIgZ2wgPSB0aGlzLmdsO1xuXG4gICAgdGhpcy5pbnB1dCgpO1xuICAgIHRoaXMucmVzZXRGcmFtZSgpO1xuXG4gICAgLy8gTWFwIHRyYW5zZm9ybXNcbiAgICB2YXIgY2VudGVyID0gR2VvLmxhdExuZ1RvTWV0ZXJzKFBvaW50KHRoaXMuY2VudGVyLmxuZywgdGhpcy5jZW50ZXIubGF0KSk7XG5cbiAgICAvLyBNb2RlbC12aWV3IG1hdHJpY2VzXG4gICAgdmFyIHRpbGVfdmlld19tYXQgPSBtYXQ0LmNyZWF0ZSgpO1xuICAgIHZhciB0aWxlX3dvcmxkX21hdCA9IG1hdDQuY3JlYXRlKCk7XG5cbiAgICAvLyBVcGRhdGUgY2FtZXJhXG4gICAgdGhpcy5jYW1lcmEudXBkYXRlKCk7XG5cbiAgICAvLyBSZW5kZXJhYmxlIHRpbGUgbGlzdFxuICAgIHZhciByZW5kZXJhYmxlX3RpbGVzID0gW107XG4gICAgZm9yICh2YXIgdCBpbiB0aGlzLnRpbGVzKSB7XG4gICAgICAgIHZhciB0aWxlID0gdGhpcy50aWxlc1t0XTtcbiAgICAgICAgaWYgKHRpbGUubG9hZGVkID09IHRydWUgJiYgdGlsZS52aXNpYmxlID09IHRydWUpIHtcbiAgICAgICAgICAgIHJlbmRlcmFibGVfdGlsZXMucHVzaCh0aWxlKTtcbiAgICAgICAgfVxuICAgIH1cbiAgICB0aGlzLnJlbmRlcmFibGVfdGlsZXNfY291bnQgPSByZW5kZXJhYmxlX3RpbGVzLmxlbmd0aDtcblxuICAgIC8vIFJlbmRlciBtYWluIHBhc3MgLSB0aWxlcyBncm91cGVkIGJ5IHJlbmRlcmluZyBtb2RlIChHTCBwcm9ncmFtKVxuICAgIHZhciByZW5kZXJfY291bnQgPSAwO1xuICAgIGZvciAodmFyIG1vZGUgaW4gdGhpcy5tb2Rlcykge1xuICAgICAgICAvLyBQZXItZnJhbWUgbW9kZSB1cGRhdGVzL2FuaW1hdGlvbnNcbiAgICAgICAgLy8gQ2FsbGVkIGV2ZW4gaWYgdGhlIG1vZGUgaXNuJ3QgcmVuZGVyZWQgYnkgYW55IGN1cnJlbnQgdGlsZXMsIHNvIHRpbWUtYmFzZWQgYW5pbWF0aW9ucywgZXRjLiBjb250aW51ZVxuICAgICAgICB0aGlzLm1vZGVzW21vZGVdLnVwZGF0ZSgpO1xuXG4gICAgICAgIHZhciBnbF9wcm9ncmFtID0gdGhpcy5tb2Rlc1ttb2RlXS5nbF9wcm9ncmFtO1xuICAgICAgICBpZiAoZ2xfcHJvZ3JhbSA9PSBudWxsIHx8IGdsX3Byb2dyYW0uY29tcGlsZWQgPT0gZmFsc2UpIHtcbiAgICAgICAgICAgIGNvbnRpbnVlO1xuICAgICAgICB9XG5cbiAgICAgICAgdmFyIGZpcnN0X2Zvcl9tb2RlID0gdHJ1ZTtcblxuICAgICAgICAvLyBSZW5kZXIgdGlsZSBHTCBnZW9tZXRyaWVzXG4gICAgICAgIGZvciAodmFyIHQgaW4gcmVuZGVyYWJsZV90aWxlcykge1xuICAgICAgICAgICAgdmFyIHRpbGUgPSByZW5kZXJhYmxlX3RpbGVzW3RdO1xuXG4gICAgICAgICAgICBpZiAodGlsZS5nbF9nZW9tZXRyeVttb2RlXSAhPSBudWxsKSB7XG4gICAgICAgICAgICAgICAgLy8gU2V0dXAgbW9kZSBpZiBlbmNvdW50ZXJpbmcgZm9yIGZpcnN0IHRpbWUgdGhpcyBmcmFtZVxuICAgICAgICAgICAgICAgIC8vIChsYXp5IGluaXQsIG5vdCBhbGwgbW9kZXMgd2lsbCBiZSB1c2VkIGluIGFsbCBzY3JlZW4gdmlld3M7IHNvbWUgbW9kZXMgbWlnaHQgYmUgZGVmaW5lZCBidXQgbmV2ZXIgdXNlZClcbiAgICAgICAgICAgICAgICBpZiAoZmlyc3RfZm9yX21vZGUgPT0gdHJ1ZSkge1xuICAgICAgICAgICAgICAgICAgICBmaXJzdF9mb3JfbW9kZSA9IGZhbHNlO1xuXG4gICAgICAgICAgICAgICAgICAgIGdsX3Byb2dyYW0udXNlKCk7XG4gICAgICAgICAgICAgICAgICAgIHRoaXMubW9kZXNbbW9kZV0uc2V0VW5pZm9ybXMoKTtcblxuICAgICAgICAgICAgICAgICAgICAvLyBUT0RPOiBkb24ndCBzZXQgdW5pZm9ybXMgd2hlbiB0aGV5IGhhdmVuJ3QgY2hhbmdlZFxuICAgICAgICAgICAgICAgICAgICBnbF9wcm9ncmFtLnVuaWZvcm0oJzJmJywgJ3VfcmVzb2x1dGlvbicsIHRoaXMuZGV2aWNlX3NpemUud2lkdGgsIHRoaXMuZGV2aWNlX3NpemUuaGVpZ2h0KTtcbiAgICAgICAgICAgICAgICAgICAgZ2xfcHJvZ3JhbS51bmlmb3JtKCcyZicsICd1X2FzcGVjdCcsIHRoaXMudmlld19hc3BlY3QsIDEuMCk7XG4gICAgICAgICAgICAgICAgICAgIGdsX3Byb2dyYW0udW5pZm9ybSgnMWYnLCAndV90aW1lJywgKCgrbmV3IERhdGUoKSkgLSB0aGlzLnN0YXJ0X3RpbWUpIC8gMTAwMCk7XG4gICAgICAgICAgICAgICAgICAgIGdsX3Byb2dyYW0udW5pZm9ybSgnMWYnLCAndV9tYXBfem9vbScsIHRoaXMuem9vbSk7IC8vIE1hdGguZmxvb3IodGhpcy56b29tKSArIChNYXRoLmxvZygodGhpcy56b29tICUgMSkgKyAxKSAvIE1hdGguTE4yIC8vIHNjYWxlIGZyYWN0aW9uYWwgem9vbSBieSBsb2dcbiAgICAgICAgICAgICAgICAgICAgZ2xfcHJvZ3JhbS51bmlmb3JtKCcyZicsICd1X21hcF9jZW50ZXInLCBjZW50ZXIueCwgY2VudGVyLnkpO1xuICAgICAgICAgICAgICAgICAgICBnbF9wcm9ncmFtLnVuaWZvcm0oJzFmJywgJ3VfbnVtX2xheWVycycsIHRoaXMubGF5ZXJzLmxlbmd0aCk7XG4gICAgICAgICAgICAgICAgICAgIGdsX3Byb2dyYW0udW5pZm9ybSgnMWYnLCAndV9tZXRlcnNfcGVyX3BpeGVsJywgdGhpcy5tZXRlcnNfcGVyX3BpeGVsKTtcblxuICAgICAgICAgICAgICAgICAgICB0aGlzLmNhbWVyYS5zZXR1cFByb2dyYW0oZ2xfcHJvZ3JhbSk7XG4gICAgICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICAgICAgLy8gVE9ETzogY2FsYyB0aGVzZSBvbmNlIHBlciB0aWxlIChjdXJyZW50bHkgYmVpbmcgbmVlZGxlc3NseSByZS1jYWxjdWxhdGVkIHBlci10aWxlLXBlci1tb2RlKVxuXG4gICAgICAgICAgICAgICAgLy8gVGlsZSBvcmlnaW5cbiAgICAgICAgICAgICAgICBnbF9wcm9ncmFtLnVuaWZvcm0oJzJmJywgJ3VfdGlsZV9vcmlnaW4nLCB0aWxlLm1pbi54LCB0aWxlLm1pbi55KTtcblxuICAgICAgICAgICAgICAgIC8vIFRpbGUgdmlldyBtYXRyaXggLSB0cmFuc2Zvcm0gdGlsZSBzcGFjZSBpbnRvIHZpZXcgc3BhY2UgKG1ldGVycywgcmVsYXRpdmUgdG8gY2FtZXJhKVxuICAgICAgICAgICAgICAgIG1hdDQuaWRlbnRpdHkodGlsZV92aWV3X21hdCk7XG4gICAgICAgICAgICAgICAgbWF0NC50cmFuc2xhdGUodGlsZV92aWV3X21hdCwgdGlsZV92aWV3X21hdCwgdmVjMy5mcm9tVmFsdWVzKHRpbGUubWluLnggLSBjZW50ZXIueCwgdGlsZS5taW4ueSAtIGNlbnRlci55LCAwKSk7IC8vIGFkanVzdCBmb3IgdGlsZSBvcmlnaW4gJiBtYXAgY2VudGVyXG4gICAgICAgICAgICAgICAgbWF0NC5zY2FsZSh0aWxlX3ZpZXdfbWF0LCB0aWxlX3ZpZXdfbWF0LCB2ZWMzLmZyb21WYWx1ZXModGlsZS5zcGFuLnggLyBTY2VuZS50aWxlX3NjYWxlLCAtMSAqIHRpbGUuc3Bhbi55IC8gU2NlbmUudGlsZV9zY2FsZSwgMSkpOyAvLyBzY2FsZSB0aWxlIGxvY2FsIGNvb3JkcyB0byBtZXRlcnNcbiAgICAgICAgICAgICAgICBnbF9wcm9ncmFtLnVuaWZvcm0oJ01hdHJpeDRmdicsICd1X3RpbGVfdmlldycsIGZhbHNlLCB0aWxlX3ZpZXdfbWF0KTtcblxuICAgICAgICAgICAgICAgIC8vIFRpbGUgd29ybGQgbWF0cml4IC0gdHJhbnNmb3JtIHRpbGUgc3BhY2UgaW50byB3b3JsZCBzcGFjZSAobWV0ZXJzLCBhYnNvbHV0ZSBtZXJjYXRvciBwb3NpdGlvbilcbiAgICAgICAgICAgICAgICBtYXQ0LmlkZW50aXR5KHRpbGVfd29ybGRfbWF0KTtcbiAgICAgICAgICAgICAgICBtYXQ0LnRyYW5zbGF0ZSh0aWxlX3dvcmxkX21hdCwgdGlsZV93b3JsZF9tYXQsIHZlYzMuZnJvbVZhbHVlcyh0aWxlLm1pbi54LCB0aWxlLm1pbi55LCAwKSk7XG4gICAgICAgICAgICAgICAgbWF0NC5zY2FsZSh0aWxlX3dvcmxkX21hdCwgdGlsZV93b3JsZF9tYXQsIHZlYzMuZnJvbVZhbHVlcyh0aWxlLnNwYW4ueCAvIFNjZW5lLnRpbGVfc2NhbGUsIC0xICogdGlsZS5zcGFuLnkgLyBTY2VuZS50aWxlX3NjYWxlLCAxKSk7IC8vIHNjYWxlIHRpbGUgbG9jYWwgY29vcmRzIHRvIG1ldGVyc1xuICAgICAgICAgICAgICAgIGdsX3Byb2dyYW0udW5pZm9ybSgnTWF0cml4NGZ2JywgJ3VfdGlsZV93b3JsZCcsIGZhbHNlLCB0aWxlX3dvcmxkX21hdCk7XG5cbiAgICAgICAgICAgICAgICAvLyBSZW5kZXIgdGlsZVxuICAgICAgICAgICAgICAgIHRpbGUuZ2xfZ2VvbWV0cnlbbW9kZV0ucmVuZGVyKCk7XG4gICAgICAgICAgICAgICAgcmVuZGVyX2NvdW50ICs9IHRpbGUuZ2xfZ2VvbWV0cnlbbW9kZV0uZ2VvbWV0cnlfY291bnQ7XG4gICAgICAgICAgICB9XG4gICAgICAgIH1cbiAgICB9XG5cbiAgICAvLyBSZW5kZXIgc2VsZWN0aW9uIHBhc3MgKGlmIG5lZWRlZClcbiAgICAvLyBTbGlnaHQgdmFyaWF0aW9ucyBvbiByZW5kZXIgcGFzcyBjb2RlIGFib3ZlIC0gbW9zdGx5IGJlY2F1c2Ugd2UncmUgcmV1c2luZyB1bmlmb3JtcyBmcm9tIHRoZSBtYWluXG4gICAgLy8gbW9kZSBwcm9ncmFtLCBmb3IgdGhlIHNlbGVjdGlvbiBwcm9ncmFtXG4gICAgLy8gVE9ETzogcmVkdWNlIGR1cGxpY2F0ZWQgY29kZSB3L21haW4gcmVuZGVyIHBhc3MgYWJvdmVcbiAgICBpZiAodGhpcy51cGRhdGVfc2VsZWN0aW9uKSB7XG4gICAgICAgIHRoaXMudXBkYXRlX3NlbGVjdGlvbiA9IGZhbHNlOyAvLyByZXNldCBzZWxlY3Rpb24gY2hlY2tcblxuICAgICAgICAvLyBUT0RPOiBxdWV1ZSBjYWxsYmFjayB0aWxsIHBhbm5pbmcgaXMgb3Zlcj8gY29vcmRzIHdoZXJlIHNlbGVjdGlvbiB3YXMgcmVxdWVzdGVkIGFyZSBvdXQgb2YgZGF0ZVxuICAgICAgICBpZiAodGhpcy5wYW5uaW5nKSB7XG4gICAgICAgICAgICByZXR1cm47XG4gICAgICAgIH1cblxuICAgICAgICAvLyBTd2l0Y2ggdG8gRkJPXG4gICAgICAgIGdsLmJpbmRGcmFtZWJ1ZmZlcihnbC5GUkFNRUJVRkZFUiwgdGhpcy5mYm8pO1xuICAgICAgICBnbC52aWV3cG9ydCgwLCAwLCB0aGlzLmZib19zaXplLndpZHRoLCB0aGlzLmZib19zaXplLmhlaWdodCk7XG4gICAgICAgIHRoaXMucmVzZXRGcmFtZSgpO1xuXG4gICAgICAgIGZvciAobW9kZSBpbiB0aGlzLm1vZGVzKSB7XG4gICAgICAgICAgICBnbF9wcm9ncmFtID0gdGhpcy5tb2Rlc1ttb2RlXS5zZWxlY3Rpb25fZ2xfcHJvZ3JhbTtcbiAgICAgICAgICAgIGlmIChnbF9wcm9ncmFtID09IG51bGwgfHwgZ2xfcHJvZ3JhbS5jb21waWxlZCA9PSBmYWxzZSkge1xuICAgICAgICAgICAgICAgIGNvbnRpbnVlO1xuICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICBmaXJzdF9mb3JfbW9kZSA9IHRydWU7XG5cbiAgICAgICAgICAgIC8vIFJlbmRlciB0aWxlIEdMIGdlb21ldHJpZXNcbiAgICAgICAgICAgIGZvciAodCBpbiByZW5kZXJhYmxlX3RpbGVzKSB7XG4gICAgICAgICAgICAgICAgdGlsZSA9IHJlbmRlcmFibGVfdGlsZXNbdF07XG5cbiAgICAgICAgICAgICAgICBpZiAodGlsZS5nbF9nZW9tZXRyeVttb2RlXSAhPSBudWxsKSB7XG4gICAgICAgICAgICAgICAgICAgIC8vIFNldHVwIG1vZGUgaWYgZW5jb3VudGVyaW5nIGZvciBmaXJzdCB0aW1lIHRoaXMgZnJhbWVcbiAgICAgICAgICAgICAgICAgICAgaWYgKGZpcnN0X2Zvcl9tb2RlID09IHRydWUpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgIGZpcnN0X2Zvcl9tb2RlID0gZmFsc2U7XG5cbiAgICAgICAgICAgICAgICAgICAgICAgIGdsX3Byb2dyYW0udXNlKCk7XG4gICAgICAgICAgICAgICAgICAgICAgICB0aGlzLm1vZGVzW21vZGVdLnNldFVuaWZvcm1zKCk7XG5cbiAgICAgICAgICAgICAgICAgICAgICAgIGdsX3Byb2dyYW0udW5pZm9ybSgnMmYnLCAndV9yZXNvbHV0aW9uJywgdGhpcy5mYm9fc2l6ZS53aWR0aCwgdGhpcy5mYm9fc2l6ZS5oZWlnaHQpO1xuICAgICAgICAgICAgICAgICAgICAgICAgZ2xfcHJvZ3JhbS51bmlmb3JtKCcyZicsICd1X2FzcGVjdCcsIHRoaXMuZmJvX3NpemUuYXNwZWN0LCAxLjApO1xuICAgICAgICAgICAgICAgICAgICAgICAgZ2xfcHJvZ3JhbS51bmlmb3JtKCcxZicsICd1X3RpbWUnLCAoKCtuZXcgRGF0ZSgpKSAtIHRoaXMuc3RhcnRfdGltZSkgLyAxMDAwKTtcbiAgICAgICAgICAgICAgICAgICAgICAgIGdsX3Byb2dyYW0udW5pZm9ybSgnMWYnLCAndV9tYXBfem9vbScsIHRoaXMuem9vbSk7XG4gICAgICAgICAgICAgICAgICAgICAgICBnbF9wcm9ncmFtLnVuaWZvcm0oJzJmJywgJ3VfbWFwX2NlbnRlcicsIGNlbnRlci54LCBjZW50ZXIueSk7XG4gICAgICAgICAgICAgICAgICAgICAgICBnbF9wcm9ncmFtLnVuaWZvcm0oJzFmJywgJ3VfbnVtX2xheWVycycsIHRoaXMubGF5ZXJzLmxlbmd0aCk7XG4gICAgICAgICAgICAgICAgICAgICAgICBnbF9wcm9ncmFtLnVuaWZvcm0oJzFmJywgJ3VfbWV0ZXJzX3Blcl9waXhlbCcsIHRoaXMubWV0ZXJzX3Blcl9waXhlbCk7XG5cbiAgICAgICAgICAgICAgICAgICAgICAgIHRoaXMuY2FtZXJhLnNldHVwUHJvZ3JhbShnbF9wcm9ncmFtKTtcbiAgICAgICAgICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICAgICAgICAgIC8vIFRpbGUgb3JpZ2luXG4gICAgICAgICAgICAgICAgICAgIGdsX3Byb2dyYW0udW5pZm9ybSgnMmYnLCAndV90aWxlX29yaWdpbicsIHRpbGUubWluLngsIHRpbGUubWluLnkpO1xuXG4gICAgICAgICAgICAgICAgICAgIC8vIFRpbGUgdmlldyBtYXRyaXggLSB0cmFuc2Zvcm0gdGlsZSBzcGFjZSBpbnRvIHZpZXcgc3BhY2UgKG1ldGVycywgcmVsYXRpdmUgdG8gY2FtZXJhKVxuICAgICAgICAgICAgICAgICAgICBtYXQ0LmlkZW50aXR5KHRpbGVfdmlld19tYXQpO1xuICAgICAgICAgICAgICAgICAgICBtYXQ0LnRyYW5zbGF0ZSh0aWxlX3ZpZXdfbWF0LCB0aWxlX3ZpZXdfbWF0LCB2ZWMzLmZyb21WYWx1ZXModGlsZS5taW4ueCAtIGNlbnRlci54LCB0aWxlLm1pbi55IC0gY2VudGVyLnksIDApKTsgLy8gYWRqdXN0IGZvciB0aWxlIG9yaWdpbiAmIG1hcCBjZW50ZXJcbiAgICAgICAgICAgICAgICAgICAgbWF0NC5zY2FsZSh0aWxlX3ZpZXdfbWF0LCB0aWxlX3ZpZXdfbWF0LCB2ZWMzLmZyb21WYWx1ZXModGlsZS5zcGFuLnggLyBTY2VuZS50aWxlX3NjYWxlLCAtMSAqIHRpbGUuc3Bhbi55IC8gU2NlbmUudGlsZV9zY2FsZSwgMSkpOyAvLyBzY2FsZSB0aWxlIGxvY2FsIGNvb3JkcyB0byBtZXRlcnNcbiAgICAgICAgICAgICAgICAgICAgZ2xfcHJvZ3JhbS51bmlmb3JtKCdNYXRyaXg0ZnYnLCAndV90aWxlX3ZpZXcnLCBmYWxzZSwgdGlsZV92aWV3X21hdCk7XG5cbiAgICAgICAgICAgICAgICAgICAgLy8gVGlsZSB3b3JsZCBtYXRyaXggLSB0cmFuc2Zvcm0gdGlsZSBzcGFjZSBpbnRvIHdvcmxkIHNwYWNlIChtZXRlcnMsIGFic29sdXRlIG1lcmNhdG9yIHBvc2l0aW9uKVxuICAgICAgICAgICAgICAgICAgICBtYXQ0LmlkZW50aXR5KHRpbGVfd29ybGRfbWF0KTtcbiAgICAgICAgICAgICAgICAgICAgbWF0NC50cmFuc2xhdGUodGlsZV93b3JsZF9tYXQsIHRpbGVfd29ybGRfbWF0LCB2ZWMzLmZyb21WYWx1ZXModGlsZS5taW4ueCwgdGlsZS5taW4ueSwgMCkpO1xuICAgICAgICAgICAgICAgICAgICBtYXQ0LnNjYWxlKHRpbGVfd29ybGRfbWF0LCB0aWxlX3dvcmxkX21hdCwgdmVjMy5mcm9tVmFsdWVzKHRpbGUuc3Bhbi54IC8gU2NlbmUudGlsZV9zY2FsZSwgLTEgKiB0aWxlLnNwYW4ueSAvIFNjZW5lLnRpbGVfc2NhbGUsIDEpKTsgLy8gc2NhbGUgdGlsZSBsb2NhbCBjb29yZHMgdG8gbWV0ZXJzXG4gICAgICAgICAgICAgICAgICAgIGdsX3Byb2dyYW0udW5pZm9ybSgnTWF0cml4NGZ2JywgJ3VfdGlsZV93b3JsZCcsIGZhbHNlLCB0aWxlX3dvcmxkX21hdCk7XG5cbiAgICAgICAgICAgICAgICAgICAgLy8gUmVuZGVyIHRpbGVcbiAgICAgICAgICAgICAgICAgICAgdGlsZS5nbF9nZW9tZXRyeVttb2RlXS5yZW5kZXIoKTtcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICB9XG4gICAgICAgIH1cblxuICAgICAgICAvLyBEZWxheSByZWFkaW5nIHRoZSBwaXhlbCByZXN1bHQgZnJvbSB0aGUgc2VsZWN0aW9uIGJ1ZmZlciB0byBhdm9pZCBDUFUvR1BVIHN5bmMgbG9jay5cbiAgICAgICAgLy8gQ2FsbGluZyByZWFkUGl4ZWxzIHN5bmNocm9ub3VzbHkgY2F1c2VkIGEgbWFzc2l2ZSBwZXJmb3JtYW5jZSBoaXQsIHByZXN1bWFibHkgc2luY2UgaXRcbiAgICAgICAgLy8gZm9yY2VkIHRoaXMgZnVuY3Rpb24gdG8gd2FpdCBmb3IgdGhlIEdQVSB0byBmaW5pc2ggcmVuZGVyaW5nIGFuZCByZXRyaWV2ZSB0aGUgdGV4dHVyZSBjb250ZW50cy5cbiAgICAgICAgaWYgKHRoaXMuc2VsZWN0aW9uX2NhbGxiYWNrX3RpbWVyICE9IG51bGwpIHtcbiAgICAgICAgICAgIGNsZWFyVGltZW91dCh0aGlzLnNlbGVjdGlvbl9jYWxsYmFja190aW1lcik7XG4gICAgICAgIH1cbiAgICAgICAgdGhpcy5zZWxlY3Rpb25fY2FsbGJhY2tfdGltZXIgPSBzZXRUaW1lb3V0KFxuICAgICAgICAgICAgdGhpcy5yZWFkU2VsZWN0aW9uQnVmZmVyLmJpbmQodGhpcyksXG4gICAgICAgICAgICB0aGlzLnNlbGVjdGlvbl9mcmFtZV9kZWxheVxuICAgICAgICApO1xuXG4gICAgICAgIC8vIFJlc2V0IHRvIHNjcmVlbiBidWZmZXJcbiAgICAgICAgZ2wuYmluZEZyYW1lYnVmZmVyKGdsLkZSQU1FQlVGRkVSLCBudWxsKTtcbiAgICAgICAgZ2wudmlld3BvcnQoMCwgMCwgdGhpcy5jYW52YXMud2lkdGgsIHRoaXMuY2FudmFzLmhlaWdodCk7XG4gICAgfVxuXG4gICAgaWYgKHJlbmRlcl9jb3VudCAhPSB0aGlzLmxhc3RfcmVuZGVyX2NvdW50KSB7XG4gICAgICAgIGNvbnNvbGUubG9nKFwicmVuZGVyZWQgXCIgKyByZW5kZXJfY291bnQgKyBcIiBwcmltaXRpdmVzXCIpO1xuICAgIH1cbiAgICB0aGlzLmxhc3RfcmVuZGVyX2NvdW50ID0gcmVuZGVyX2NvdW50O1xuXG4gICAgcmV0dXJuIHRydWU7XG59O1xuXG4vLyBSZXF1ZXN0IGZlYXR1cmUgc2VsZWN0aW9uXG4vLyBSdW5zIGFzeW5jaHJvbm91c2x5LCBzY2hlZHVsZXMgc2VsZWN0aW9uIGJ1ZmZlciB0byBiZSB1cGRhdGVkXG5TY2VuZS5wcm90b3R5cGUuZ2V0RmVhdHVyZUF0ID0gZnVuY3Rpb24gKHBpeGVsLCBjYWxsYmFjaykge1xuICAgIGlmICghdGhpcy5pbml0aWFsaXplZCkge1xuICAgICAgICByZXR1cm47XG4gICAgfVxuXG4gICAgLy8gVE9ETzogcXVldWUgY2FsbGJhY2tzIHdoaWxlIHN0aWxsIHBlcmZvcm1pbmcgb25seSBvbmUgc2VsZWN0aW9uIHJlbmRlciBwYXNzIHdpdGhpbiBYIHRpbWUgaW50ZXJ2YWw/XG4gICAgaWYgKHRoaXMudXBkYXRlX3NlbGVjdGlvbiA9PSB0cnVlKSB7XG4gICAgICAgIHJldHVybjtcbiAgICB9XG5cbiAgICB0aGlzLnNlbGVjdGlvbl9wb2ludCA9IFBvaW50KFxuICAgICAgICBwaXhlbC54ICogdGhpcy5kZXZpY2VfcGl4ZWxfcmF0aW8sXG4gICAgICAgIHRoaXMuZGV2aWNlX3NpemUuaGVpZ2h0IC0gKHBpeGVsLnkgKiB0aGlzLmRldmljZV9waXhlbF9yYXRpbylcbiAgICApO1xuICAgIHRoaXMuc2VsZWN0aW9uX2NhbGxiYWNrID0gY2FsbGJhY2s7XG4gICAgdGhpcy51cGRhdGVfc2VsZWN0aW9uID0gdHJ1ZTtcbiAgICB0aGlzLmRpcnR5ID0gdHJ1ZTtcbn07XG5cblNjZW5lLnByb3RvdHlwZS5yZWFkU2VsZWN0aW9uQnVmZmVyID0gZnVuY3Rpb24gKCkge1xuICAgIHZhciBnbCA9IHRoaXMuZ2w7XG5cbiAgICBnbC5iaW5kRnJhbWVidWZmZXIoZ2wuRlJBTUVCVUZGRVIsIHRoaXMuZmJvKTtcblxuICAgIC8vIENoZWNrIHNlbGVjdGlvbiBtYXAgYWdhaW5zdCBGQk9cbiAgICBnbC5yZWFkUGl4ZWxzKFxuICAgICAgICBNYXRoLmZsb29yKHRoaXMuc2VsZWN0aW9uX3BvaW50LnggKiB0aGlzLmZib19zaXplLndpZHRoIC8gdGhpcy5kZXZpY2Vfc2l6ZS53aWR0aCksXG4gICAgICAgIE1hdGguZmxvb3IodGhpcy5zZWxlY3Rpb25fcG9pbnQueSAqIHRoaXMuZmJvX3NpemUuaGVpZ2h0IC8gdGhpcy5kZXZpY2Vfc2l6ZS5oZWlnaHQpLFxuICAgICAgICAxLCAxLCBnbC5SR0JBLCBnbC5VTlNJR05FRF9CWVRFLCB0aGlzLnBpeGVsKTtcbiAgICB2YXIgZmVhdHVyZV9rZXkgPSAodGhpcy5waXhlbFswXSArICh0aGlzLnBpeGVsWzFdIDw8IDgpICsgKHRoaXMucGl4ZWxbMl0gPDwgMTYpICsgKHRoaXMucGl4ZWxbM10gPDwgMjQpKSA+Pj4gMDtcblxuICAgIC8vIGNvbnNvbGUubG9nKFxuICAgIC8vICAgICBNYXRoLmZsb29yKHRoaXMuc2VsZWN0aW9uX3BvaW50LnggKiB0aGlzLmZib19zaXplLndpZHRoIC8gdGhpcy5kZXZpY2Vfc2l6ZS53aWR0aCkgKyBcIiwgXCIgK1xuICAgIC8vICAgICBNYXRoLmZsb29yKHRoaXMuc2VsZWN0aW9uX3BvaW50LnkgKiB0aGlzLmZib19zaXplLmhlaWdodCAvIHRoaXMuZGV2aWNlX3NpemUuaGVpZ2h0KSArIFwiOiAoXCIgK1xuICAgIC8vICAgICB0aGlzLnBpeGVsWzBdICsgXCIsIFwiICsgdGhpcy5waXhlbFsxXSArIFwiLCBcIiArIHRoaXMucGl4ZWxbMl0gKyBcIiwgXCIgKyB0aGlzLnBpeGVsWzNdICsgXCIpXCIpO1xuXG4gICAgLy8gSWYgZmVhdHVyZSBmb3VuZCwgYXNrIGFwcHJvcHJpYXRlIHdlYiB3b3JrZXIgdG8gbG9va3VwIGZlYXR1cmVcbiAgICB2YXIgd29ya2VyX2lkID0gdGhpcy5waXhlbFszXTtcbiAgICBpZiAod29ya2VyX2lkICE9IDI1NSkgeyAvLyAyNTUgaW5kaWNhdGVzIGFuIGVtcHR5IHNlbGVjdGlvbiBidWZmZXIgcGl4ZWxcbiAgICAgICAgLy8gY29uc29sZS5sb2coXCJ3b3JrZXJfaWQ6IFwiICsgd29ya2VyX2lkKTtcbiAgICAgICAgaWYgKHRoaXMud29ya2Vyc1t3b3JrZXJfaWRdICE9IG51bGwpIHtcbiAgICAgICAgICAgIC8vIGNvbnNvbGUubG9nKFwicG9zdCBtZXNzYWdlXCIpO1xuICAgICAgICAgICAgdGhpcy53b3JrZXJzW3dvcmtlcl9pZF0ucG9zdE1lc3NhZ2Uoe1xuICAgICAgICAgICAgICAgIHR5cGU6ICdnZXRGZWF0dXJlU2VsZWN0aW9uJyxcbiAgICAgICAgICAgICAgICBrZXk6IGZlYXR1cmVfa2V5XG4gICAgICAgICAgICB9KTtcbiAgICAgICAgfVxuICAgIH1cbiAgICAvLyBObyBmZWF0dXJlIGZvdW5kLCBidXQgc3RpbGwgbmVlZCB0byBub3RpZnkgdmlhIGNhbGxiYWNrXG4gICAgZWxzZSB7XG4gICAgICAgIHRoaXMud29ya2VyR2V0RmVhdHVyZVNlbGVjdGlvbih7IGRhdGE6IHsgdHlwZTogJ2dldEZlYXR1cmVTZWxlY3Rpb24nLCBmZWF0dXJlOiBudWxsIH0gfSk7XG4gICAgfVxuXG4gICAgZ2wuYmluZEZyYW1lYnVmZmVyKGdsLkZSQU1FQlVGRkVSLCBudWxsKTtcbn07XG5cbi8vIENhbGxlZCBvbiBtYWluIHRocmVhZCB3aGVuIGEgd2ViIHdvcmtlciBmaW5kcyBhIGZlYXR1cmUgaW4gdGhlIHNlbGVjdGlvbiBidWZmZXJcblNjZW5lLnByb3RvdHlwZS53b3JrZXJHZXRGZWF0dXJlU2VsZWN0aW9uID0gZnVuY3Rpb24gKGV2ZW50KSB7XG4gICAgaWYgKGV2ZW50LmRhdGEudHlwZSAhPSAnZ2V0RmVhdHVyZVNlbGVjdGlvbicpIHtcbiAgICAgICAgcmV0dXJuO1xuICAgIH1cblxuICAgIHZhciBmZWF0dXJlID0gZXZlbnQuZGF0YS5mZWF0dXJlO1xuICAgIHZhciBjaGFuZ2VkID0gZmFsc2U7XG4gICAgaWYgKChmZWF0dXJlICE9IG51bGwgJiYgdGhpcy5zZWxlY3RlZF9mZWF0dXJlID09IG51bGwpIHx8XG4gICAgICAgIChmZWF0dXJlID09IG51bGwgJiYgdGhpcy5zZWxlY3RlZF9mZWF0dXJlICE9IG51bGwpIHx8XG4gICAgICAgIChmZWF0dXJlICE9IG51bGwgJiYgdGhpcy5zZWxlY3RlZF9mZWF0dXJlICE9IG51bGwgJiYgZmVhdHVyZS5pZCAhPSB0aGlzLnNlbGVjdGVkX2ZlYXR1cmUuaWQpKSB7XG4gICAgICAgIGNoYW5nZWQgPSB0cnVlO1xuICAgIH1cblxuICAgIHRoaXMuc2VsZWN0ZWRfZmVhdHVyZSA9IGZlYXR1cmU7XG5cbiAgICBpZiAodHlwZW9mIHRoaXMuc2VsZWN0aW9uX2NhbGxiYWNrID09ICdmdW5jdGlvbicpIHtcbiAgICAgICAgdGhpcy5zZWxlY3Rpb25fY2FsbGJhY2soeyBmZWF0dXJlOiB0aGlzLnNlbGVjdGVkX2ZlYXR1cmUsIGNoYW5nZWQ6IGNoYW5nZWQgfSk7XG4gICAgfVxufTtcblxuLy8gUXVldWUgYSB0aWxlIGZvciBsb2FkXG5TY2VuZS5wcm90b3R5cGUubG9hZFRpbGUgPSBmdW5jdGlvbiAoY29vcmRzLCBkaXYsIGNhbGxiYWNrKSB7XG4gICAgdGhpcy5xdWV1ZWRfdGlsZXNbdGhpcy5xdWV1ZWRfdGlsZXMubGVuZ3RoXSA9IGFyZ3VtZW50cztcbn07XG5cbi8vIExvYWQgYWxsIHF1ZXVlZCB0aWxlc1xuU2NlbmUucHJvdG90eXBlLmxvYWRRdWV1ZWRUaWxlcyA9IGZ1bmN0aW9uICgpIHtcbiAgICBpZiAoIXRoaXMuaW5pdGlhbGl6ZWQpIHtcbiAgICAgICAgcmV0dXJuO1xuICAgIH1cblxuICAgIGlmICh0aGlzLnF1ZXVlZF90aWxlcy5sZW5ndGggPT0gMCkge1xuICAgICAgICByZXR1cm47XG4gICAgfVxuXG4gICAgZm9yICh2YXIgdD0wOyB0IDwgdGhpcy5xdWV1ZWRfdGlsZXMubGVuZ3RoOyB0KyspIHtcbiAgICAgICAgdGhpcy5fbG9hZFRpbGUuYXBwbHkodGhpcywgdGhpcy5xdWV1ZWRfdGlsZXNbdF0pO1xuICAgIH1cblxuICAgIHRoaXMucXVldWVkX3RpbGVzID0gW107XG59O1xuXG4vLyBMb2FkIGEgc2luZ2xlIHRpbGVcblNjZW5lLnByb3RvdHlwZS5fbG9hZFRpbGUgPSBmdW5jdGlvbiAoY29vcmRzLCBkaXYsIGNhbGxiYWNrKSB7XG4gICAgLy8gT3Zlcnpvb20/XG4gICAgaWYgKGNvb3Jkcy56ID4gdGhpcy50aWxlX3NvdXJjZS5tYXhfem9vbSkge1xuICAgICAgICB2YXIgemdhcCA9IGNvb3Jkcy56IC0gdGhpcy50aWxlX3NvdXJjZS5tYXhfem9vbTtcbiAgICAgICAgLy8gdmFyIG9yaWdpbmFsX3RpbGUgPSBbY29vcmRzLngsIGNvb3Jkcy55LCBjb29yZHMuel0uam9pbignLycpO1xuICAgICAgICBjb29yZHMueCA9IH5+KGNvb3Jkcy54IC8gTWF0aC5wb3coMiwgemdhcCkpO1xuICAgICAgICBjb29yZHMueSA9IH5+KGNvb3Jkcy55IC8gTWF0aC5wb3coMiwgemdhcCkpO1xuICAgICAgICBjb29yZHMuZGlzcGxheV96ID0gY29vcmRzLno7IC8vIHogd2l0aG91dCBvdmVyem9vbVxuICAgICAgICBjb29yZHMueiAtPSB6Z2FwO1xuICAgICAgICAvLyBjb25zb2xlLmxvZyhcImFkanVzdGVkIGZvciBvdmVyem9vbSwgdGlsZSBcIiArIG9yaWdpbmFsX3RpbGUgKyBcIiAtPiBcIiArIFtjb29yZHMueCwgY29vcmRzLnksIGNvb3Jkcy56XS5qb2luKCcvJykpO1xuICAgIH1cblxuICAgIHRoaXMudHJhY2tUaWxlU2V0TG9hZFN0YXJ0KCk7XG5cbiAgICB2YXIga2V5ID0gW2Nvb3Jkcy54LCBjb29yZHMueSwgY29vcmRzLnpdLmpvaW4oJy8nKTtcblxuICAgIC8vIEFscmVhZHkgbG9hZGluZy9sb2FkZWQ/XG4gICAgaWYgKHRoaXMudGlsZXNba2V5XSkge1xuICAgICAgICAvLyBpZiAodGhpcy50aWxlc1trZXldLmxvYWRlZCA9PSB0cnVlKSB7XG4gICAgICAgIC8vICAgICBjb25zb2xlLmxvZyhcInVzZSBsb2FkZWQgdGlsZSBcIiArIGtleSArIFwiIGZyb20gY2FjaGVcIik7XG4gICAgICAgIC8vIH1cbiAgICAgICAgLy8gaWYgKHRoaXMudGlsZXNba2V5XS5sb2FkaW5nID09IHRydWUpIHtcbiAgICAgICAgLy8gICAgIGNvbnNvbGUubG9nKFwiYWxyZWFkeSBsb2FkaW5nIHRpbGUgXCIgKyBrZXkgKyBcIiwgc2tpcFwiKTtcbiAgICAgICAgLy8gfVxuXG4gICAgICAgIGlmIChjYWxsYmFjaykge1xuICAgICAgICAgICAgY2FsbGJhY2sobnVsbCwgZGl2KTtcbiAgICAgICAgfVxuICAgICAgICByZXR1cm47XG4gICAgfVxuXG4gICAgdmFyIHRpbGUgPSB0aGlzLnRpbGVzW2tleV0gPSB7fTtcbiAgICB0aWxlLmtleSA9IGtleTtcbiAgICB0aWxlLmNvb3JkcyA9IGNvb3JkcztcbiAgICB0aWxlLm1pbiA9IEdlby5tZXRlcnNGb3JUaWxlKHRpbGUuY29vcmRzKTtcbiAgICB0aWxlLm1heCA9IEdlby5tZXRlcnNGb3JUaWxlKHsgeDogdGlsZS5jb29yZHMueCArIDEsIHk6IHRpbGUuY29vcmRzLnkgKyAxLCB6OiB0aWxlLmNvb3Jkcy56IH0pO1xuICAgIHRpbGUuc3BhbiA9IHsgeDogKHRpbGUubWF4LnggLSB0aWxlLm1pbi54KSwgeTogKHRpbGUubWF4LnkgLSB0aWxlLm1pbi55KSB9O1xuICAgIHRpbGUuYm91bmRzID0geyBzdzogeyB4OiB0aWxlLm1pbi54LCB5OiB0aWxlLm1heC55IH0sIG5lOiB7IHg6IHRpbGUubWF4LngsIHk6IHRpbGUubWluLnkgfSB9O1xuICAgIHRpbGUuZGVidWcgPSB7fTtcbiAgICB0aWxlLmxvYWRpbmcgPSB0cnVlO1xuICAgIHRpbGUubG9hZGVkID0gZmFsc2U7XG5cbiAgICB0aGlzLmJ1aWxkVGlsZSh0aWxlLmtleSk7XG4gICAgdGhpcy51cGRhdGVUaWxlRWxlbWVudCh0aWxlLCBkaXYpO1xuICAgIHRoaXMudXBkYXRlVmlzaWJpbGl0eUZvclRpbGUodGlsZSk7XG5cbiAgICBpZiAoY2FsbGJhY2spIHtcbiAgICAgICAgY2FsbGJhY2sobnVsbCwgZGl2KTtcbiAgICB9XG59O1xuXG4vLyBSZWJ1aWxkIGFsbCB0aWxlc1xuLy8gVE9ETzogYWxzbyByZWJ1aWxkIG1vZGVzPyAoZGV0ZWN0IGlmIGNoYW5nZWQpXG5TY2VuZS5wcm90b3R5cGUucmVidWlsZFRpbGVzID0gZnVuY3Rpb24gKCkge1xuICAgIGlmICghdGhpcy5pbml0aWFsaXplZCkge1xuICAgICAgICByZXR1cm47XG4gICAgfVxuXG4gICAgLy8gVXBkYXRlIGxheWVycyAmIHN0eWxlc1xuICAgIHRoaXMubGF5ZXJzX3NlcmlhbGl6ZWQgPSBVdGlscy5zZXJpYWxpemVXaXRoRnVuY3Rpb25zKHRoaXMubGF5ZXJzKTtcbiAgICB0aGlzLnN0eWxlc19zZXJpYWxpemVkID0gVXRpbHMuc2VyaWFsaXplV2l0aEZ1bmN0aW9ucyh0aGlzLnN0eWxlcyk7XG4gICAgdGhpcy5zZWxlY3Rpb25fbWFwID0ge307XG5cbiAgICAvLyBUZWxsIHdvcmtlcnMgd2UncmUgYWJvdXQgdG8gcmVidWlsZCAoc28gdGhleSBjYW4gcmVmcmVzaCBzdHlsZXMsIGV0Yy4pXG4gICAgdGhpcy53b3JrZXJzLmZvckVhY2god29ya2VyID0+IHtcbiAgICAgICAgd29ya2VyLnBvc3RNZXNzYWdlKHtcbiAgICAgICAgICAgIHR5cGU6ICdwcmVwYXJlRm9yUmVidWlsZCcsXG4gICAgICAgICAgICBsYXllcnM6IHRoaXMubGF5ZXJzX3NlcmlhbGl6ZWQsXG4gICAgICAgICAgICBzdHlsZXM6IHRoaXMuc3R5bGVzX3NlcmlhbGl6ZWRcbiAgICAgICAgfSk7XG4gICAgfSk7XG5cbiAgICAvLyBSZWJ1aWxkIHZpc2libGUgdGlsZXMgZmlyc3QsIGZyb20gY2VudGVyIG91dFxuICAgIC8vIGNvbnNvbGUubG9nKFwiZmluZCB2aXNpYmxlXCIpO1xuICAgIHZhciB2aXNpYmxlID0gW10sIGludmlzaWJsZSA9IFtdO1xuICAgIGZvciAodmFyIHQgaW4gdGhpcy50aWxlcykge1xuICAgICAgICBpZiAodGhpcy50aWxlc1t0XS52aXNpYmxlID09IHRydWUpIHtcbiAgICAgICAgICAgIHZpc2libGUucHVzaCh0KTtcbiAgICAgICAgfVxuICAgICAgICBlbHNlIHtcbiAgICAgICAgICAgIGludmlzaWJsZS5wdXNoKHQpO1xuICAgICAgICB9XG4gICAgfVxuXG4gICAgLy8gY29uc29sZS5sb2coXCJzb3J0IHZpc2libGUgZGlzdGFuY2VcIik7XG4gICAgdmlzaWJsZS5zb3J0KChhLCBiKSA9PiB7XG4gICAgICAgIC8vIHZhciBhZCA9IE1hdGguYWJzKHRoaXMuY2VudGVyX21ldGVycy54IC0gdGhpcy50aWxlc1tiXS5taW4ueCkgKyBNYXRoLmFicyh0aGlzLmNlbnRlcl9tZXRlcnMueSAtIHRoaXMudGlsZXNbYl0ubWluLnkpO1xuICAgICAgICAvLyB2YXIgYmQgPSBNYXRoLmFicyh0aGlzLmNlbnRlcl9tZXRlcnMueCAtIHRoaXMudGlsZXNbYV0ubWluLngpICsgTWF0aC5hYnModGhpcy5jZW50ZXJfbWV0ZXJzLnkgLSB0aGlzLnRpbGVzW2FdLm1pbi55KTtcbiAgICAgICAgdmFyIGFkID0gdGhpcy50aWxlc1thXS5jZW50ZXJfZGlzdDtcbiAgICAgICAgdmFyIGJkID0gdGhpcy50aWxlc1tiXS5jZW50ZXJfZGlzdDtcbiAgICAgICAgcmV0dXJuIChiZCA+IGFkID8gLTEgOiAoYmQgPT0gYWQgPyAwIDogMSkpO1xuICAgIH0pO1xuXG4gICAgLy8gY29uc29sZS5sb2coXCJidWlsZCB2aXNpYmxlXCIpO1xuICAgIGZvciAodmFyIHQgaW4gdmlzaWJsZSkge1xuICAgICAgICB0aGlzLmJ1aWxkVGlsZSh2aXNpYmxlW3RdKTtcbiAgICB9XG5cbiAgICAvLyBjb25zb2xlLmxvZyhcImJ1aWxkIGludmlzaWJsZVwiKTtcbiAgICBmb3IgKHZhciB0IGluIGludmlzaWJsZSkge1xuICAgICAgICAvLyBLZWVwIHRpbGVzIGluIGN1cnJlbnQgem9vbSBidXQgb3V0IG9mIHZpc2libGUgcmFuZ2UsIGJ1dCByZWJ1aWxkIGFzIGxvd2VyIHByaW9yaXR5XG4gICAgICAgIGlmICh0aGlzLmlzVGlsZUluWm9vbSh0aGlzLnRpbGVzW2ludmlzaWJsZVt0XV0pID09IHRydWUpIHtcbiAgICAgICAgICAgIHRoaXMuYnVpbGRUaWxlKGludmlzaWJsZVt0XSk7XG4gICAgICAgIH1cbiAgICAgICAgLy8gRHJvcCB0aWxlcyBvdXRzaWRlIGN1cnJlbnQgem9vbVxuICAgICAgICBlbHNlIHtcbiAgICAgICAgICAgIHRoaXMucmVtb3ZlVGlsZShpbnZpc2libGVbdF0pO1xuICAgICAgICB9XG4gICAgfVxuXG4gICAgdGhpcy51cGRhdGVBY3RpdmVNb2RlcygpO1xuICAgIHRoaXMucmVzZXRUaW1lKCk7XG59O1xuXG5TY2VuZS5wcm90b3R5cGUuYnVpbGRUaWxlID0gZnVuY3Rpb24oa2V5KSB7XG4gICAgdmFyIHRpbGUgPSB0aGlzLnRpbGVzW2tleV07XG5cbiAgICB0aGlzLndvcmtlclBvc3RNZXNzYWdlRm9yVGlsZSh0aWxlLCB7XG4gICAgICAgIHR5cGU6ICdidWlsZFRpbGUnLFxuICAgICAgICB0aWxlOiB7XG4gICAgICAgICAgICBrZXk6IHRpbGUua2V5LFxuICAgICAgICAgICAgY29vcmRzOiB0aWxlLmNvb3JkcywgLy8gdXNlZCBieSBzdHlsZSBoZWxwZXJzXG4gICAgICAgICAgICBtaW46IHRpbGUubWluLCAvLyB1c2VkIGJ5IFRpbGVTb3VyY2UgdG8gc2NhbGUgdGlsZSB0byBsb2NhbCBleHRlbnRzXG4gICAgICAgICAgICBtYXg6IHRpbGUubWF4LCAvLyB1c2VkIGJ5IFRpbGVTb3VyY2UgdG8gc2NhbGUgdGlsZSB0byBsb2NhbCBleHRlbnRzXG4gICAgICAgICAgICBkZWJ1ZzogdGlsZS5kZWJ1Z1xuICAgICAgICB9LFxuICAgICAgICB0aWxlX3NvdXJjZTogdGhpcy50aWxlX3NvdXJjZSxcbiAgICAgICAgbGF5ZXJzOiB0aGlzLmxheWVyc19zZXJpYWxpemVkLFxuICAgICAgICBzdHlsZXM6IHRoaXMuc3R5bGVzX3NlcmlhbGl6ZWRcbiAgICB9KTtcbn07XG5cbi8vIFByb2Nlc3MgZ2VvbWV0cnkgZm9yIHRpbGUgLSBjYWxsZWQgYnkgd2ViIHdvcmtlclxuLy8gUmV0dXJucyBhIHNldCBvZiB0aWxlIGtleXMgdGhhdCBzaG91bGQgYmUgc2VudCB0byB0aGUgbWFpbiB0aHJlYWQgKHNvIHRoYXQgd2UgY2FuIG1pbmltaXplIGRhdGEgZXhjaGFuZ2UgYmV0d2VlbiB3b3JrZXIgYW5kIG1haW4gdGhyZWFkKVxuU2NlbmUuYWRkVGlsZSA9IGZ1bmN0aW9uICh0aWxlLCBsYXllcnMsIHN0eWxlcywgbW9kZXMpIHtcbiAgICB2YXIgbGF5ZXIsIHN0eWxlLCBmZWF0dXJlLCB6LCBtb2RlO1xuICAgIHZhciB2ZXJ0ZXhfZGF0YSA9IHt9O1xuXG4gICAgLy8gSm9pbiBsaW5lIHRlc3QgcGF0dGVyblxuICAgIC8vIGlmIChTY2VuZS5kZWJ1Zykge1xuICAgIC8vICAgICB0aWxlLmxheWVyc1sncm9hZHMnXS5mZWF0dXJlcy5wdXNoKFNjZW5lLmJ1aWxkWmlnemFnTGluZVRlc3RQYXR0ZXJuKCkpO1xuICAgIC8vIH1cblxuICAgIC8vIEJ1aWxkIHJhdyBnZW9tZXRyeSBhcnJheXNcbiAgICAvLyBSZW5kZXIgbGF5ZXJzLCBhbmQgZmVhdHVyZXMgd2l0aGluIGVhY2ggbGF5ZXIsIGluIHJldmVyc2Ugb3JkZXIgLSBha2EgdG9wIHRvIGJvdHRvbVxuICAgIHRpbGUuZGVidWcuZmVhdHVyZXMgPSAwO1xuICAgIGZvciAodmFyIGxheWVyX251bSA9IGxheWVycy5sZW5ndGgtMTsgbGF5ZXJfbnVtID49IDA7IGxheWVyX251bS0tKSB7XG4gICAgICAgIGxheWVyID0gbGF5ZXJzW2xheWVyX251bV07XG5cbiAgICAgICAgLy8gU2tpcCBsYXllcnMgd2l0aCBubyBzdHlsZXMgZGVmaW5lZCwgb3IgbGF5ZXJzIHNldCB0byBub3QgYmUgdmlzaWJsZVxuICAgICAgICBpZiAoc3R5bGVzLmxheWVyc1tsYXllci5uYW1lXSA9PSBudWxsIHx8IHN0eWxlcy5sYXllcnNbbGF5ZXIubmFtZV0udmlzaWJsZSA9PSBmYWxzZSkge1xuICAgICAgICAgICAgY29udGludWU7XG4gICAgICAgIH1cblxuICAgICAgICBpZiAodGlsZS5sYXllcnNbbGF5ZXIubmFtZV0gIT0gbnVsbCkge1xuICAgICAgICAgICAgdmFyIG51bV9mZWF0dXJlcyA9IHRpbGUubGF5ZXJzW2xheWVyLm5hbWVdLmZlYXR1cmVzLmxlbmd0aDtcblxuICAgICAgICAgICAgZm9yICh2YXIgZiA9IG51bV9mZWF0dXJlcy0xOyBmID49IDA7IGYtLSkge1xuICAgICAgICAgICAgICAgIGZlYXR1cmUgPSB0aWxlLmxheWVyc1tsYXllci5uYW1lXS5mZWF0dXJlc1tmXTtcbiAgICAgICAgICAgICAgICBzdHlsZSA9IFN0eWxlLnBhcnNlU3R5bGVGb3JGZWF0dXJlKGZlYXR1cmUsIGxheWVyLm5hbWUsIHN0eWxlcy5sYXllcnNbbGF5ZXIubmFtZV0sIHRpbGUpO1xuXG4gICAgICAgICAgICAgICAgLy8gU2tpcCBmZWF0dXJlP1xuICAgICAgICAgICAgICAgIGlmIChzdHlsZSA9PSBudWxsKSB7XG4gICAgICAgICAgICAgICAgICAgIGNvbnRpbnVlO1xuICAgICAgICAgICAgICAgIH1cblxuICAgICAgICAgICAgICAgIHN0eWxlLmxheWVyX251bSA9IGxheWVyX251bTtcbiAgICAgICAgICAgICAgICBzdHlsZS56ID0gU2NlbmUuY2FsY3VsYXRlWihsYXllciwgdGlsZSkgKyBzdHlsZS56O1xuXG4gICAgICAgICAgICAgICAgdmFyIHBvaW50cyA9IG51bGwsXG4gICAgICAgICAgICAgICAgICAgIGxpbmVzID0gbnVsbCxcbiAgICAgICAgICAgICAgICAgICAgcG9seWdvbnMgPSBudWxsO1xuXG4gICAgICAgICAgICAgICAgaWYgKGZlYXR1cmUuZ2VvbWV0cnkudHlwZSA9PSAnUG9seWdvbicpIHtcbiAgICAgICAgICAgICAgICAgICAgcG9seWdvbnMgPSBbZmVhdHVyZS5nZW9tZXRyeS5jb29yZGluYXRlc107XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgIGVsc2UgaWYgKGZlYXR1cmUuZ2VvbWV0cnkudHlwZSA9PSAnTXVsdGlQb2x5Z29uJykge1xuICAgICAgICAgICAgICAgICAgICBwb2x5Z29ucyA9IGZlYXR1cmUuZ2VvbWV0cnkuY29vcmRpbmF0ZXM7XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgIGVsc2UgaWYgKGZlYXR1cmUuZ2VvbWV0cnkudHlwZSA9PSAnTGluZVN0cmluZycpIHtcbiAgICAgICAgICAgICAgICAgICAgbGluZXMgPSBbZmVhdHVyZS5nZW9tZXRyeS5jb29yZGluYXRlc107XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgIGVsc2UgaWYgKGZlYXR1cmUuZ2VvbWV0cnkudHlwZSA9PSAnTXVsdGlMaW5lU3RyaW5nJykge1xuICAgICAgICAgICAgICAgICAgICBsaW5lcyA9IGZlYXR1cmUuZ2VvbWV0cnkuY29vcmRpbmF0ZXM7XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgIGVsc2UgaWYgKGZlYXR1cmUuZ2VvbWV0cnkudHlwZSA9PSAnUG9pbnQnKSB7XG4gICAgICAgICAgICAgICAgICAgIHBvaW50cyA9IFtmZWF0dXJlLmdlb21ldHJ5LmNvb3JkaW5hdGVzXTtcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgZWxzZSBpZiAoZmVhdHVyZS5nZW9tZXRyeS50eXBlID09ICdNdWx0aVBvaW50Jykge1xuICAgICAgICAgICAgICAgICAgICBwb2ludHMgPSBmZWF0dXJlLmdlb21ldHJ5LmNvb3JkaW5hdGVzO1xuICAgICAgICAgICAgICAgIH1cblxuICAgICAgICAgICAgICAgIC8vIEZpcnN0IGZlYXR1cmUgaW4gdGhpcyByZW5kZXIgbW9kZT9cbiAgICAgICAgICAgICAgICBtb2RlID0gc3R5bGUubW9kZS5uYW1lO1xuICAgICAgICAgICAgICAgIGlmICh2ZXJ0ZXhfZGF0YVttb2RlXSA9PSBudWxsKSB7XG4gICAgICAgICAgICAgICAgICAgIHZlcnRleF9kYXRhW21vZGVdID0gW107XG4gICAgICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICAgICAgaWYgKHBvbHlnb25zICE9IG51bGwpIHtcbiAgICAgICAgICAgICAgICAgICAgbW9kZXNbbW9kZV0uYnVpbGRQb2x5Z29ucyhwb2x5Z29ucywgc3R5bGUsIHZlcnRleF9kYXRhW21vZGVdKTtcbiAgICAgICAgICAgICAgICB9XG5cbiAgICAgICAgICAgICAgICBpZiAobGluZXMgIT0gbnVsbCkge1xuICAgICAgICAgICAgICAgICAgICBtb2Rlc1ttb2RlXS5idWlsZExpbmVzKGxpbmVzLCBzdHlsZSwgdmVydGV4X2RhdGFbbW9kZV0pO1xuICAgICAgICAgICAgICAgIH1cblxuICAgICAgICAgICAgICAgIGlmIChwb2ludHMgIT0gbnVsbCkge1xuICAgICAgICAgICAgICAgICAgICBtb2Rlc1ttb2RlXS5idWlsZFBvaW50cyhwb2ludHMsIHN0eWxlLCB2ZXJ0ZXhfZGF0YVttb2RlXSk7XG4gICAgICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICAgICAgdGlsZS5kZWJ1Zy5mZWF0dXJlcysrO1xuICAgICAgICAgICAgfVxuICAgICAgICB9XG4gICAgfVxuXG4gICAgdGlsZS52ZXJ0ZXhfZGF0YSA9IHt9O1xuICAgIGZvciAodmFyIHMgaW4gdmVydGV4X2RhdGEpIHtcbiAgICAgICAgdGlsZS52ZXJ0ZXhfZGF0YVtzXSA9IG5ldyBGbG9hdDMyQXJyYXkodmVydGV4X2RhdGFbc10pO1xuICAgIH1cblxuICAgIHJldHVybiB7XG4gICAgICAgIHZlcnRleF9kYXRhOiB0cnVlXG4gICAgfTtcbn07XG5cbi8vIENhbGxlZCBvbiBtYWluIHRocmVhZCB3aGVuIGEgd2ViIHdvcmtlciBjb21wbGV0ZXMgcHJvY2Vzc2luZyBmb3IgYSBzaW5nbGUgdGlsZSAoaW5pdGlhbCBsb2FkLCBvciByZWJ1aWxkKVxuU2NlbmUucHJvdG90eXBlLndvcmtlckJ1aWxkVGlsZUNvbXBsZXRlZCA9IGZ1bmN0aW9uIChldmVudCkge1xuICAgIGlmIChldmVudC5kYXRhLnR5cGUgIT0gJ2J1aWxkVGlsZUNvbXBsZXRlZCcpIHtcbiAgICAgICAgcmV0dXJuO1xuICAgIH1cblxuICAgIC8vIFRyYWNrIHNlbGVjdGlvbiBtYXAgc2l6ZSAoZm9yIHN0YXRzL2RlYnVnKSAtIHVwZGF0ZSBwZXIgd29ya2VyIGFuZCBzdW0gYWNyb3NzIHdvcmtlcnNcbiAgICB0aGlzLnNlbGVjdGlvbl9tYXBfd29ya2VyX3NpemVbZXZlbnQuZGF0YS53b3JrZXJfaWRdID0gZXZlbnQuZGF0YS5zZWxlY3Rpb25fbWFwX3NpemU7XG4gICAgdGhpcy5zZWxlY3Rpb25fbWFwX3NpemUgPSAwO1xuICAgIE9iamVjdFxuICAgICAgICAua2V5cyh0aGlzLnNlbGVjdGlvbl9tYXBfd29ya2VyX3NpemUpXG4gICAgICAgIC5mb3JFYWNoKHdvcmtlciA9PiB7XG4gICAgICAgICAgICB0aGlzLnNlbGVjdGlvbl9tYXBfc2l6ZSArPSB0aGlzLnNlbGVjdGlvbl9tYXBfd29ya2VyX3NpemVbd29ya2VyXTtcbiAgICAgICAgfSk7XG4gICAgY29uc29sZS5sb2coXCJzZWxlY3Rpb24gbWFwOiBcIiArIHRoaXMuc2VsZWN0aW9uX21hcF9zaXplICsgXCIgZmVhdHVyZXNcIik7XG5cbiAgICB2YXIgdGlsZSA9IGV2ZW50LmRhdGEudGlsZTtcblxuICAgIC8vIFJlbW92ZWQgdGhpcyB0aWxlIGR1cmluZyBsb2FkP1xuICAgIGlmICh0aGlzLnRpbGVzW3RpbGUua2V5XSA9PSBudWxsKSB7XG4gICAgICAgIGNvbnNvbGUubG9nKFwiZGlzY2FyZGVkIHRpbGUgXCIgKyB0aWxlLmtleSArIFwiIGluIFNjZW5lLnRpbGVXb3JrZXJDb21wbGV0ZWQgYmVjYXVzZSBwcmV2aW91c2x5IHJlbW92ZWRcIik7XG4gICAgICAgIHJldHVybjtcbiAgICB9XG5cbiAgICAvLyBVcGRhdGUgdGlsZSB3aXRoIHByb3BlcnRpZXMgZnJvbSB3b3JrZXJcbiAgICB0aWxlID0gdGhpcy5tZXJnZVRpbGUodGlsZS5rZXksIHRpbGUpO1xuXG4gICAgdGhpcy5idWlsZEdMR2VvbWV0cnkodGlsZSk7XG5cbiAgICB0aGlzLmRpcnR5ID0gdHJ1ZTtcbiAgICB0aGlzLnRyYWNrVGlsZVNldExvYWRFbmQoKTtcbiAgICB0aGlzLnByaW50RGVidWdGb3JUaWxlKHRpbGUpO1xufTtcblxuLy8gQ2FsbGVkIG9uIG1haW4gdGhyZWFkIHdoZW4gYSB3ZWIgd29ya2VyIGNvbXBsZXRlcyBwcm9jZXNzaW5nIGZvciBhIHNpbmdsZSB0aWxlXG5TY2VuZS5wcm90b3R5cGUuYnVpbGRHTEdlb21ldHJ5ID0gZnVuY3Rpb24gKHRpbGUpIHtcbiAgICB2YXIgdmVydGV4X2RhdGEgPSB0aWxlLnZlcnRleF9kYXRhO1xuXG4gICAgLy8gQ2xlYW51cCBleGlzdGluZyBHTCBnZW9tZXRyeSBvYmplY3RzXG4gICAgdGhpcy5mcmVlVGlsZVJlc291cmNlcyh0aWxlKTtcbiAgICB0aWxlLmdsX2dlb21ldHJ5ID0ge307XG5cbiAgICAvLyBDcmVhdGUgR0wgZ2VvbWV0cnkgb2JqZWN0c1xuICAgIGZvciAodmFyIHMgaW4gdmVydGV4X2RhdGEpIHtcbiAgICAgICAgdGlsZS5nbF9nZW9tZXRyeVtzXSA9IHRoaXMubW9kZXNbc10ubWFrZUdMR2VvbWV0cnkodmVydGV4X2RhdGFbc10pO1xuICAgIH1cblxuICAgIHRpbGUuZGVidWcuZ2VvbWV0cmllcyA9IDA7XG4gICAgdGlsZS5kZWJ1Zy5idWZmZXJfc2l6ZSA9IDA7XG4gICAgZm9yICh2YXIgcCBpbiB0aWxlLmdsX2dlb21ldHJ5KSB7XG4gICAgICAgIHRpbGUuZGVidWcuZ2VvbWV0cmllcyArPSB0aWxlLmdsX2dlb21ldHJ5W3BdLmdlb21ldHJ5X2NvdW50O1xuICAgICAgICB0aWxlLmRlYnVnLmJ1ZmZlcl9zaXplICs9IHRpbGUuZ2xfZ2VvbWV0cnlbcF0udmVydGV4X2RhdGEuYnl0ZUxlbmd0aDtcbiAgICB9XG4gICAgdGlsZS5kZWJ1Zy5nZW9tX3JhdGlvID0gKHRpbGUuZGVidWcuZ2VvbWV0cmllcyAvIHRpbGUuZGVidWcuZmVhdHVyZXMpLnRvRml4ZWQoMSk7XG5cbiAgICBkZWxldGUgdGlsZS52ZXJ0ZXhfZGF0YTsgLy8gVE9ETzogbWlnaHQgd2FudCB0byBwcmVzZXJ2ZSB0aGlzIGZvciByZWJ1aWxkaW5nIGdlb21ldHJpZXMgd2hlbiBzdHlsZXMvZXRjLiBjaGFuZ2U/XG59O1xuXG5TY2VuZS5wcm90b3R5cGUucmVtb3ZlVGlsZSA9IGZ1bmN0aW9uIChrZXkpXG57XG4gICAgaWYgKCF0aGlzLmluaXRpYWxpemVkKSB7XG4gICAgICAgIHJldHVybjtcbiAgICB9XG5cbiAgICBjb25zb2xlLmxvZyhcInRpbGUgdW5sb2FkIGZvciBcIiArIGtleSk7XG5cbiAgICBpZiAodGhpcy56b29taW5nID09IHRydWUpIHtcbiAgICAgICAgcmV0dXJuOyAvLyBzaG9ydCBjaXJjdWl0IHRpbGUgcmVtb3ZhbCwgd2lsbCBzd2VlcCBvdXQgdGlsZXMgYnkgem9vbSBsZXZlbCB3aGVuIHpvb20gZW5kc1xuICAgIH1cblxuICAgIHZhciB0aWxlID0gdGhpcy50aWxlc1trZXldO1xuXG4gICAgaWYgKHRpbGUgIT0gbnVsbCkge1xuICAgICAgICB0aGlzLmZyZWVUaWxlUmVzb3VyY2VzKHRpbGUpO1xuXG4gICAgICAgIC8vIFdlYiB3b3JrZXIgd2lsbCBjYW5jZWwgWEhSIHJlcXVlc3RzXG4gICAgICAgIHRoaXMud29ya2VyUG9zdE1lc3NhZ2VGb3JUaWxlKHRpbGUsIHtcbiAgICAgICAgICAgIHR5cGU6ICdyZW1vdmVUaWxlJyxcbiAgICAgICAgICAgIGtleTogdGlsZS5rZXlcbiAgICAgICAgfSk7XG4gICAgfVxuXG4gICAgZGVsZXRlIHRoaXMudGlsZXNba2V5XTtcbiAgICB0aGlzLmRpcnR5ID0gdHJ1ZTtcbn07XG5cbi8vIEZyZWUgYW55IEdMIC8gb3duZWQgcmVzb3VyY2VzXG5TY2VuZS5wcm90b3R5cGUuZnJlZVRpbGVSZXNvdXJjZXMgPSBmdW5jdGlvbiAodGlsZSlcbntcbiAgICBpZiAodGlsZSAhPSBudWxsICYmIHRpbGUuZ2xfZ2VvbWV0cnkgIT0gbnVsbCkge1xuICAgICAgICBmb3IgKHZhciBwIGluIHRpbGUuZ2xfZ2VvbWV0cnkpIHtcbiAgICAgICAgICAgIHRpbGUuZ2xfZ2VvbWV0cnlbcF0uZGVzdHJveSgpO1xuICAgICAgICB9XG4gICAgICAgIHRpbGUuZ2xfZ2VvbWV0cnkgPSBudWxsO1xuICAgIH1cbn07XG5cbi8vIEF0dGFjaGVzIHRyYWNraW5nIGFuZCBkZWJ1ZyBpbnRvIHRvIHRoZSBwcm92aWRlZCB0aWxlIERPTSBlbGVtZW50XG5TY2VuZS5wcm90b3R5cGUudXBkYXRlVGlsZUVsZW1lbnQgPSBmdW5jdGlvbiAodGlsZSwgZGl2KSB7XG4gICAgLy8gRGVidWcgaW5mb1xuICAgIGRpdi5zZXRBdHRyaWJ1dGUoJ2RhdGEtdGlsZS1rZXknLCB0aWxlLmtleSk7XG4gICAgZGl2LnN0eWxlLndpZHRoID0gJzI1NnB4JztcbiAgICBkaXYuc3R5bGUuaGVpZ2h0ID0gJzI1NnB4JztcblxuICAgIGlmICh0aGlzLmRlYnVnKSB7XG4gICAgICAgIHZhciBkZWJ1Z19vdmVybGF5ID0gZG9jdW1lbnQuY3JlYXRlRWxlbWVudCgnZGl2Jyk7XG4gICAgICAgIGRlYnVnX292ZXJsYXkudGV4dENvbnRlbnQgPSB0aWxlLmtleTtcbiAgICAgICAgZGVidWdfb3ZlcmxheS5zdHlsZS5wb3NpdGlvbiA9ICdhYnNvbHV0ZSc7XG4gICAgICAgIGRlYnVnX292ZXJsYXkuc3R5bGUubGVmdCA9IDA7XG4gICAgICAgIGRlYnVnX292ZXJsYXkuc3R5bGUudG9wID0gMDtcbiAgICAgICAgZGVidWdfb3ZlcmxheS5zdHlsZS5jb2xvciA9ICd3aGl0ZSc7XG4gICAgICAgIGRlYnVnX292ZXJsYXkuc3R5bGUuZm9udFNpemUgPSAnMTZweCc7XG4gICAgICAgIC8vIGRlYnVnX292ZXJsYXkuc3R5bGUudGV4dE91dGxpbmUgPSAnMXB4ICMwMDAwMDAnO1xuICAgICAgICBkaXYuYXBwZW5kQ2hpbGQoZGVidWdfb3ZlcmxheSk7XG5cbiAgICAgICAgZGl2LnN0eWxlLmJvcmRlclN0eWxlID0gJ3NvbGlkJztcbiAgICAgICAgZGl2LnN0eWxlLmJvcmRlckNvbG9yID0gJ3doaXRlJztcbiAgICAgICAgZGl2LnN0eWxlLmJvcmRlcldpZHRoID0gJzFweCc7XG4gICAgfVxufTtcblxuLy8gTWVyZ2UgcHJvcGVydGllcyBmcm9tIGEgcHJvdmlkZWQgdGlsZSBvYmplY3QgaW50byB0aGUgbWFpbiB0aWxlIHN0b3JlLiBTaGFsbG93IG1lcmdlIChqdXN0IGNvcGllcyB0b3AtbGV2ZWwgcHJvcGVydGllcykhXG4vLyBVc2VkIGZvciBzZWxlY3RpdmVseSB1cGRhdGluZyBwcm9wZXJ0aWVzIG9mIHRpbGVzIHBhc3NlZCBiZXR3ZWVuIG1haW4gdGhyZWFkIGFuZCB3b3JrZXJcbi8vIChzbyB3ZSBkb24ndCBoYXZlIHRvIHBhc3MgdGhlIHdob2xlIHRpbGUsIGluY2x1ZGluZyBzb21lIHByb3BlcnRpZXMgd2hpY2ggY2Fubm90IGJlIGNsb25lZCBmb3IgYSB3b3JrZXIpLlxuU2NlbmUucHJvdG90eXBlLm1lcmdlVGlsZSA9IGZ1bmN0aW9uIChrZXksIHNvdXJjZV90aWxlKSB7XG4gICAgdmFyIHRpbGUgPSB0aGlzLnRpbGVzW2tleV07XG5cbiAgICBpZiAodGlsZSA9PSBudWxsKSB7XG4gICAgICAgIHRoaXMudGlsZXNba2V5XSA9IHNvdXJjZV90aWxlO1xuICAgICAgICByZXR1cm4gdGhpcy50aWxlc1trZXldO1xuICAgIH1cblxuICAgIGZvciAodmFyIHAgaW4gc291cmNlX3RpbGUpIHtcbiAgICAgICAgLy8gY29uc29sZS5sb2coXCJtZXJnaW5nIFwiICsgcCArIFwiOiBcIiArIHNvdXJjZV90aWxlW3BdKTtcbiAgICAgICAgdGlsZVtwXSA9IHNvdXJjZV90aWxlW3BdO1xuICAgIH1cblxuICAgIHJldHVybiB0aWxlO1xufTtcblxuLy8gTG9hZCAob3IgcmVsb2FkKSB0aGUgc2NlbmUgY29uZmlnXG5TY2VuZS5wcm90b3R5cGUubG9hZFNjZW5lID0gZnVuY3Rpb24gKGNhbGxiYWNrKSB7XG4gICAgdmFyIHF1ZXVlID0gUXVldWUoKTtcblxuICAgIC8vIElmIHRoaXMgaXMgdGhlIGZpcnN0IHRpbWUgd2UncmUgbG9hZGluZyB0aGUgc2NlbmUsIGNvcHkgYW55IFVSTHNcbiAgICBpZiAoIXRoaXMubGF5ZXJfc291cmNlICYmIHR5cGVvZih0aGlzLmxheWVycykgPT0gJ3N0cmluZycpIHtcbiAgICAgICAgdGhpcy5sYXllcl9zb3VyY2UgPSBVdGlscy51cmxGb3JQYXRoKHRoaXMubGF5ZXJzKTtcbiAgICB9XG5cbiAgICBpZiAoIXRoaXMuc3R5bGVfc291cmNlICYmIHR5cGVvZih0aGlzLnN0eWxlcykgPT0gJ3N0cmluZycpIHtcbiAgICAgICAgdGhpcy5zdHlsZV9zb3VyY2UgPSBVdGlscy51cmxGb3JQYXRoKHRoaXMuc3R5bGVzKTtcbiAgICB9XG5cbiAgICAvLyBMYXllciBieSBVUkxcbiAgICBpZiAodGhpcy5sYXllcl9zb3VyY2UpIHtcbiAgICAgICAgcXVldWUuZGVmZXIoY29tcGxldGUgPT4ge1xuICAgICAgICAgICAgU2NlbmUubG9hZExheWVycyhcbiAgICAgICAgICAgICAgICB0aGlzLmxheWVyX3NvdXJjZSxcbiAgICAgICAgICAgICAgICBsYXllcnMgPT4ge1xuICAgICAgICAgICAgICAgICAgICB0aGlzLmxheWVycyA9IGxheWVycztcbiAgICAgICAgICAgICAgICAgICAgdGhpcy5sYXllcnNfc2VyaWFsaXplZCA9IFV0aWxzLnNlcmlhbGl6ZVdpdGhGdW5jdGlvbnModGhpcy5sYXllcnMpO1xuICAgICAgICAgICAgICAgICAgICBjb21wbGV0ZSgpO1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICk7XG4gICAgICAgIH0pO1xuICAgIH1cblxuICAgIC8vIFN0eWxlIGJ5IFVSTFxuICAgIGlmICh0aGlzLnN0eWxlX3NvdXJjZSkge1xuICAgICAgICBxdWV1ZS5kZWZlcihjb21wbGV0ZSA9PiB7XG4gICAgICAgICAgICBTY2VuZS5sb2FkU3R5bGVzKFxuICAgICAgICAgICAgICAgIHRoaXMuc3R5bGVfc291cmNlLFxuICAgICAgICAgICAgICAgIHN0eWxlcyA9PiB7XG4gICAgICAgICAgICAgICAgICAgIHRoaXMuc3R5bGVzID0gc3R5bGVzO1xuICAgICAgICAgICAgICAgICAgICB0aGlzLnN0eWxlc19zZXJpYWxpemVkID0gVXRpbHMuc2VyaWFsaXplV2l0aEZ1bmN0aW9ucyh0aGlzLnN0eWxlcyk7XG4gICAgICAgICAgICAgICAgICAgIGNvbXBsZXRlKCk7XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgKTtcbiAgICAgICAgfSk7XG4gICAgfVxuICAgIC8vIFN0eWxlIG9iamVjdFxuICAgIGVsc2Uge1xuICAgICAgICB0aGlzLnN0eWxlcyA9IFNjZW5lLnBvc3RQcm9jZXNzU3R5bGVzKHRoaXMuc3R5bGVzKTtcbiAgICB9XG5cbiAgICAvLyBFdmVyeXRoaW5nIGlzIGxvYWRlZFxuICAgIHF1ZXVlLmF3YWl0KGZ1bmN0aW9uKCkge1xuICAgICAgICBpZiAodHlwZW9mIGNhbGxiYWNrID09ICdmdW5jdGlvbicpIHtcbiAgICAgICAgICAgIGNhbGxiYWNrKCk7XG4gICAgICAgIH1cbiAgICB9KTtcbn07XG5cbi8vIFJlbG9hZCBzY2VuZSBjb25maWcgYW5kIHJlYnVpbGQgdGlsZXNcblNjZW5lLnByb3RvdHlwZS5yZWxvYWRTY2VuZSA9IGZ1bmN0aW9uICgpIHtcbiAgICBpZiAoIXRoaXMuaW5pdGlhbGl6ZWQpIHtcbiAgICAgICAgcmV0dXJuO1xuICAgIH1cblxuICAgIHRoaXMubG9hZFNjZW5lKCgpID0+IHtcbiAgICAgICAgdGhpcy5yZWZyZXNoQ2FtZXJhKCk7XG4gICAgICAgIHRoaXMucmVidWlsZFRpbGVzKCk7XG4gICAgfSk7XG59O1xuXG4vLyBDYWxsZWQgKGN1cnJlbnRseSBtYW51YWxseSkgYWZ0ZXIgbW9kZXMgYXJlIHVwZGF0ZWQgaW4gc3R5bGVzaGVldFxuU2NlbmUucHJvdG90eXBlLnJlZnJlc2hNb2RlcyA9IGZ1bmN0aW9uICgpIHtcbiAgICBpZiAoIXRoaXMuaW5pdGlhbGl6ZWQpIHtcbiAgICAgICAgcmV0dXJuO1xuICAgIH1cblxuICAgIHRoaXMubW9kZXMgPSBTY2VuZS5yZWZyZXNoTW9kZXModGhpcy5tb2RlcywgdGhpcy5zdHlsZXMpO1xufTtcblxuU2NlbmUucHJvdG90eXBlLnVwZGF0ZUFjdGl2ZU1vZGVzID0gZnVuY3Rpb24gKCkge1xuICAgIC8vIE1ha2UgYSBzZXQgb2YgY3VycmVudGx5IGFjdGl2ZSBtb2RlcyAodXNlZCBpbiBhIGxheWVyKVxuICAgIHRoaXMuYWN0aXZlX21vZGVzID0ge307XG4gICAgdmFyIGFuaW1hdGVkID0gZmFsc2U7IC8vIGlzIGFueSBhY3RpdmUgbW9kZSBhbmltYXRlZD9cbiAgICBmb3IgKHZhciBsIGluIHRoaXMuc3R5bGVzLmxheWVycykge1xuICAgICAgICB2YXIgbW9kZSA9IHRoaXMuc3R5bGVzLmxheWVyc1tsXS5tb2RlLm5hbWU7XG4gICAgICAgIGlmICh0aGlzLnN0eWxlcy5sYXllcnNbbF0udmlzaWJsZSAhPT0gZmFsc2UpIHtcbiAgICAgICAgICAgIHRoaXMuYWN0aXZlX21vZGVzW21vZGVdID0gdHJ1ZTtcblxuICAgICAgICAgICAgLy8gQ2hlY2sgaWYgdGhpcyBtb2RlIGlzIGFuaW1hdGVkXG4gICAgICAgICAgICBpZiAoYW5pbWF0ZWQgPT0gZmFsc2UgJiYgdGhpcy5tb2Rlc1ttb2RlXS5hbmltYXRlZCA9PSB0cnVlKSB7XG4gICAgICAgICAgICAgICAgYW5pbWF0ZWQgPSB0cnVlO1xuICAgICAgICAgICAgfVxuICAgICAgICB9XG4gICAgfVxuICAgIHRoaXMuYW5pbWF0ZWQgPSBhbmltYXRlZDtcbn07XG5cbi8vIENyZWF0ZSBjYW1lcmFcblNjZW5lLnByb3RvdHlwZS5jcmVhdGVDYW1lcmEgPSBmdW5jdGlvbiAoKSB7XG4gICAgdGhpcy5jYW1lcmEgPSBDYW1lcmEuY3JlYXRlKHRoaXMsIHRoaXMuc3R5bGVzLmNhbWVyYSk7XG59O1xuXG4vLyBSZXBsYWNlIGNhbWVyYVxuU2NlbmUucHJvdG90eXBlLnJlZnJlc2hDYW1lcmEgPSBmdW5jdGlvbiAoKSB7XG4gICAgdGhpcy5jcmVhdGVDYW1lcmEoKTtcbiAgICB0aGlzLnJlZnJlc2hNb2RlcygpO1xufTtcblxuLy8gUmVzZXQgaW50ZXJuYWwgY2xvY2ssIG1vc3RseSB1c2VmdWwgZm9yIGNvbnNpc3RlbnQgZXhwZXJpZW5jZSB3aGVuIGNoYW5naW5nIG1vZGVzL2RlYnVnZ2luZ1xuU2NlbmUucHJvdG90eXBlLnJlc2V0VGltZSA9IGZ1bmN0aW9uICgpIHtcbiAgICB0aGlzLnN0YXJ0X3RpbWUgPSArbmV3IERhdGUoKTtcbn07XG5cbi8vIFVzZXIgaW5wdXRcbi8vIFRPRE86IHJlc3RvcmUgZnJhY3Rpb25hbCB6b29tIHN1cHBvcnQgb25jZSBsZWFmbGV0IGFuaW1hdGlvbiByZWZhY3RvciBwdWxsIHJlcXVlc3QgaXMgbWVyZ2VkXG5cblNjZW5lLnByb3RvdHlwZS5pbml0SW5wdXRIYW5kbGVycyA9IGZ1bmN0aW9uICgpIHtcbiAgICAvLyB0aGlzLmtleSA9IG51bGw7XG5cbiAgICAvLyBkb2N1bWVudC5hZGRFdmVudExpc3RlbmVyKCdrZXlkb3duJywgZnVuY3Rpb24gKGV2ZW50KSB7XG4gICAgLy8gICAgIGlmIChldmVudC5rZXlDb2RlID09IDM3KSB7XG4gICAgLy8gICAgICAgICB0aGlzLmtleSA9ICdsZWZ0JztcbiAgICAvLyAgICAgfVxuICAgIC8vICAgICBlbHNlIGlmIChldmVudC5rZXlDb2RlID09IDM5KSB7XG4gICAgLy8gICAgICAgICB0aGlzLmtleSA9ICdyaWdodCc7XG4gICAgLy8gICAgIH1cbiAgICAvLyAgICAgZWxzZSBpZiAoZXZlbnQua2V5Q29kZSA9PSAzOCkge1xuICAgIC8vICAgICAgICAgdGhpcy5rZXkgPSAndXAnO1xuICAgIC8vICAgICB9XG4gICAgLy8gICAgIGVsc2UgaWYgKGV2ZW50LmtleUNvZGUgPT0gNDApIHtcbiAgICAvLyAgICAgICAgIHRoaXMua2V5ID0gJ2Rvd24nO1xuICAgIC8vICAgICB9XG4gICAgLy8gICAgIGVsc2UgaWYgKGV2ZW50LmtleUNvZGUgPT0gODMpIHsgLy8gc1xuICAgIC8vICAgICAgICAgY29uc29sZS5sb2coXCJyZWxvYWRpbmcgc2hhZGVyc1wiKTtcbiAgICAvLyAgICAgICAgIGZvciAodmFyIG1vZGUgaW4gdGhpcy5tb2Rlcykge1xuICAgIC8vICAgICAgICAgICAgIHRoaXMubW9kZXNbbW9kZV0uZ2xfcHJvZ3JhbS5jb21waWxlKCk7XG4gICAgLy8gICAgICAgICB9XG4gICAgLy8gICAgICAgICB0aGlzLmRpcnR5ID0gdHJ1ZTtcbiAgICAvLyAgICAgfVxuICAgIC8vIH0uYmluZCh0aGlzKSk7XG5cbiAgICAvLyBkb2N1bWVudC5hZGRFdmVudExpc3RlbmVyKCdrZXl1cCcsIGZ1bmN0aW9uIChldmVudCkge1xuICAgIC8vICAgICB0aGlzLmtleSA9IG51bGw7XG4gICAgLy8gfS5iaW5kKHRoaXMpKTtcbn07XG5cblNjZW5lLnByb3RvdHlwZS5pbnB1dCA9IGZ1bmN0aW9uICgpIHtcbiAgICAvLyAvLyBGcmFjdGlvbmFsIHpvb20gc2NhbGluZ1xuICAgIC8vIGlmICh0aGlzLmtleSA9PSAndXAnKSB7XG4gICAgLy8gICAgIHRoaXMuc2V0Wm9vbSh0aGlzLnpvb20gKyB0aGlzLnpvb21fc3RlcCk7XG4gICAgLy8gfVxuICAgIC8vIGVsc2UgaWYgKHRoaXMua2V5ID09ICdkb3duJykge1xuICAgIC8vICAgICB0aGlzLnNldFpvb20odGhpcy56b29tIC0gdGhpcy56b29tX3N0ZXApO1xuICAgIC8vIH1cbn07XG5cblxuLy8gU3RhdHMvZGVidWcvcHJvZmlsaW5nIG1ldGhvZHNcblxuLy8gUHJvZmlsaW5nIG1ldGhvZHMgdXNlZCB0byB0cmFjayB3aGVuIHNldHMgb2YgdGlsZXMgc3RhcnQvc3RvcCBsb2FkaW5nIHRvZ2V0aGVyXG4vLyBlLmcuIGluaXRpYWwgcGFnZSBsb2FkIGlzIG9uZSBzZXQgb2YgdGlsZXMsIG5ldyBzZXRzIG9mIHRpbGUgbG9hZHMgYXJlIHRoZW4gaW5pdGlhdGVkIGJ5IGEgbWFwIHBhbiBvciB6b29tXG5TY2VuZS5wcm90b3R5cGUudHJhY2tUaWxlU2V0TG9hZFN0YXJ0ID0gZnVuY3Rpb24gKCkge1xuICAgIC8vIFN0YXJ0IHRyYWNraW5nIG5ldyB0aWxlIHNldCBpZiBubyBvdGhlciB0aWxlcyBhbHJlYWR5IGxvYWRpbmdcbiAgICBpZiAodGhpcy50aWxlX3NldF9sb2FkaW5nID09IG51bGwpIHtcbiAgICAgICAgdGhpcy50aWxlX3NldF9sb2FkaW5nID0gK25ldyBEYXRlKCk7XG4gICAgICAgIGNvbnNvbGUubG9nKFwidGlsZSBzZXQgbG9hZCBTVEFSVFwiKTtcbiAgICB9XG59O1xuXG5TY2VuZS5wcm90b3R5cGUudHJhY2tUaWxlU2V0TG9hZEVuZCA9IGZ1bmN0aW9uICgpIHtcbiAgICAvLyBObyBtb3JlIHRpbGVzIGFjdGl2ZWx5IGxvYWRpbmc/XG4gICAgaWYgKHRoaXMudGlsZV9zZXRfbG9hZGluZyAhPSBudWxsKSB7XG4gICAgICAgIHZhciBlbmRfdGlsZV9zZXQgPSB0cnVlO1xuICAgICAgICBmb3IgKHZhciB0IGluIHRoaXMudGlsZXMpIHtcbiAgICAgICAgICAgIGlmICh0aGlzLnRpbGVzW3RdLmxvYWRpbmcgPT0gdHJ1ZSkge1xuICAgICAgICAgICAgICAgIGVuZF90aWxlX3NldCA9IGZhbHNlO1xuICAgICAgICAgICAgICAgIGJyZWFrO1xuICAgICAgICAgICAgfVxuICAgICAgICB9XG5cbiAgICAgICAgaWYgKGVuZF90aWxlX3NldCA9PSB0cnVlKSB7XG4gICAgICAgICAgICB0aGlzLmxhc3RfdGlsZV9zZXRfbG9hZCA9ICgrbmV3IERhdGUoKSkgLSB0aGlzLnRpbGVfc2V0X2xvYWRpbmc7XG4gICAgICAgICAgICB0aGlzLnRpbGVfc2V0X2xvYWRpbmcgPSBudWxsO1xuICAgICAgICAgICAgY29uc29sZS5sb2coXCJ0aWxlIHNldCBsb2FkIEZJTklTSEVEIGluOiBcIiArIHRoaXMubGFzdF90aWxlX3NldF9sb2FkKTtcbiAgICAgICAgfVxuICAgIH1cbn07XG5cblNjZW5lLnByb3RvdHlwZS5wcmludERlYnVnRm9yVGlsZSA9IGZ1bmN0aW9uICh0aWxlKSB7XG4gICAgY29uc29sZS5sb2coXG4gICAgICAgIFwiZGVidWcgZm9yIFwiICsgdGlsZS5rZXkgKyAnOiBbICcgK1xuICAgICAgICBPYmplY3Qua2V5cyh0aWxlLmRlYnVnKS5tYXAoZnVuY3Rpb24gKHQpIHsgcmV0dXJuIHQgKyAnOiAnICsgdGlsZS5kZWJ1Z1t0XTsgfSkuam9pbignLCAnKSArICcgXSdcbiAgICApO1xufTtcblxuLy8gUmVjb21waWxlIGFsbCBzaGFkZXJzXG5TY2VuZS5wcm90b3R5cGUuY29tcGlsZVNoYWRlcnMgPSBmdW5jdGlvbiAoKSB7XG4gICAgZm9yICh2YXIgbSBpbiB0aGlzLm1vZGVzKSB7XG4gICAgICAgIHRoaXMubW9kZXNbbV0uZ2xfcHJvZ3JhbS5jb21waWxlKCk7XG4gICAgfVxufTtcblxuLy8gU3VtIG9mIGEgZGVidWcgcHJvcGVydHkgYWNyb3NzIHRpbGVzXG5TY2VuZS5wcm90b3R5cGUuZ2V0RGVidWdTdW0gPSBmdW5jdGlvbiAocHJvcCwgZmlsdGVyKSB7XG4gICAgdmFyIHN1bSA9IDA7XG4gICAgZm9yICh2YXIgdCBpbiB0aGlzLnRpbGVzKSB7XG4gICAgICAgIGlmICh0aGlzLnRpbGVzW3RdLmRlYnVnW3Byb3BdICE9IG51bGwgJiYgKHR5cGVvZiBmaWx0ZXIgIT0gJ2Z1bmN0aW9uJyB8fCBmaWx0ZXIodGhpcy50aWxlc1t0XSkgPT0gdHJ1ZSkpIHtcbiAgICAgICAgICAgIHN1bSArPSB0aGlzLnRpbGVzW3RdLmRlYnVnW3Byb3BdO1xuICAgICAgICB9XG4gICAgfVxuICAgIHJldHVybiBzdW07XG59O1xuXG4vLyBBdmVyYWdlIG9mIGEgZGVidWcgcHJvcGVydHkgYWNyb3NzIHRpbGVzXG5TY2VuZS5wcm90b3R5cGUuZ2V0RGVidWdBdmVyYWdlID0gZnVuY3Rpb24gKHByb3AsIGZpbHRlcikge1xuICAgIHJldHVybiB0aGlzLmdldERlYnVnU3VtKHByb3AsIGZpbHRlcikgLyBPYmplY3Qua2V5cyh0aGlzLnRpbGVzKS5sZW5ndGg7XG59O1xuXG4vLyBMb2cgbWVzc2FnZXMgcGFzcyB0aHJvdWdoIGZyb20gd2ViIHdvcmtlcnNcblNjZW5lLnByb3RvdHlwZS53b3JrZXJMb2dNZXNzYWdlID0gZnVuY3Rpb24gKGV2ZW50KSB7XG4gICAgaWYgKGV2ZW50LmRhdGEudHlwZSAhPSAnbG9nJykge1xuICAgICAgICByZXR1cm47XG4gICAgfVxuXG4gICAgY29uc29sZS5sb2coXCJ3b3JrZXIgXCIgKyBldmVudC5kYXRhLndvcmtlcl9pZCArIFwiOiBcIiArIGV2ZW50LmRhdGEubXNnKTtcbn07XG5cblxuLyoqKiBDbGFzcyBtZXRob2RzIChzdGF0ZWxlc3MpICoqKi9cblxuU2NlbmUubG9hZExheWVycyA9IGZ1bmN0aW9uICh1cmwsIGNhbGxiYWNrKSB7XG4gICAgdmFyIGxheWVycztcbiAgICB2YXIgcmVxID0gbmV3IFhNTEh0dHBSZXF1ZXN0KCk7XG4gICAgcmVxLm9ubG9hZCA9IGZ1bmN0aW9uICgpIHtcbiAgICAgICAgZXZhbCgnbGF5ZXJzID0gJyArIHJlcS5yZXNwb25zZSk7IC8vIFRPRE86IHNlY3VyaXR5IVxuXG4gICAgICAgIGlmICh0eXBlb2YgY2FsbGJhY2sgPT0gJ2Z1bmN0aW9uJykge1xuICAgICAgICAgICAgY2FsbGJhY2sobGF5ZXJzKTtcbiAgICAgICAgfVxuICAgIH07XG4gICAgcmVxLm9wZW4oJ0dFVCcsIHVybCArICc/JyArICgrbmV3IERhdGUoKSksIHRydWUgLyogYXN5bmMgZmxhZyAqLyk7XG4gICAgcmVxLnJlc3BvbnNlVHlwZSA9ICd0ZXh0JztcbiAgICByZXEuc2VuZCgpO1xufTtcblxuU2NlbmUubG9hZFN0eWxlcyA9IGZ1bmN0aW9uICh1cmwsIGNhbGxiYWNrKSB7XG4gICAgdmFyIHN0eWxlcztcbiAgICB2YXIgcmVxID0gbmV3IFhNTEh0dHBSZXF1ZXN0KCk7XG5cbiAgICByZXEub25sb2FkID0gZnVuY3Rpb24gKCkge1xuICAgICAgICBzdHlsZXMgPSByZXEucmVzcG9uc2U7XG5cbiAgICAgICAgLy8gVHJ5IEpTT04gZmlyc3QsIHRoZW4gWUFNTCAoaWYgYXZhaWxhYmxlKVxuICAgICAgICB0cnkge1xuICAgICAgICAgICAgZXZhbCgnc3R5bGVzID0gJyArIHJlcS5yZXNwb25zZSk7XG4gICAgICAgIH1cbiAgICAgICAgY2F0Y2ggKGUpIHtcbiAgICAgICAgICAgIHRyeSB7XG4gICAgICAgICAgICAgICAgc3R5bGVzID0geWFtbC5zYWZlTG9hZChyZXEucmVzcG9uc2UpO1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgY2F0Y2ggKGUpIHtcbiAgICAgICAgICAgICAgICBjb25zb2xlLmxvZyhcImZhaWxlZCB0byBwYXJzZSBzdHlsZXMhXCIpO1xuICAgICAgICAgICAgICAgIGNvbnNvbGUubG9nKHN0eWxlcyk7XG4gICAgICAgICAgICAgICAgc3R5bGVzID0gbnVsbDtcbiAgICAgICAgICAgIH1cbiAgICAgICAgfVxuXG4gICAgICAgIC8vIEZpbmQgZ2VuZXJpYyBmdW5jdGlvbnMgJiBzdHlsZSBtYWNyb3NcbiAgICAgICAgVXRpbHMuc3RyaW5nc1RvRnVuY3Rpb25zKHN0eWxlcyk7XG4gICAgICAgIFN0eWxlLmV4cGFuZE1hY3JvcyhzdHlsZXMpO1xuICAgICAgICBTY2VuZS5wb3N0UHJvY2Vzc1N0eWxlcyhzdHlsZXMpO1xuXG4gICAgICAgIGlmICh0eXBlb2YgY2FsbGJhY2sgPT0gJ2Z1bmN0aW9uJykge1xuICAgICAgICAgICAgY2FsbGJhY2soc3R5bGVzKTtcbiAgICAgICAgfVxuICAgIH1cblxuICAgIHJlcS5vcGVuKCdHRVQnLCB1cmwgKyAnPycgKyAoK25ldyBEYXRlKCkpLCB0cnVlIC8qIGFzeW5jIGZsYWcgKi8pO1xuICAgIHJlcS5yZXNwb25zZVR5cGUgPSAndGV4dCc7XG4gICAgcmVxLnNlbmQoKTtcbn07XG5cbi8vIE5vcm1hbGl6ZSBzb21lIHN0eWxlIHNldHRpbmdzIHRoYXQgbWF5IG5vdCBoYXZlIGJlZW4gZXhwbGljaXRseSBzcGVjaWZpZWQgaW4gdGhlIHN0eWxlc2hlZXRcblNjZW5lLnBvc3RQcm9jZXNzU3R5bGVzID0gZnVuY3Rpb24gKHN0eWxlcykge1xuICAgIC8vIFBvc3QtcHJvY2VzcyBzdHlsZXNcbiAgICBmb3IgKHZhciBtIGluIHN0eWxlcy5sYXllcnMpIHtcbiAgICAgICAgaWYgKHN0eWxlcy5sYXllcnNbbV0udmlzaWJsZSAhPT0gZmFsc2UpIHtcbiAgICAgICAgICAgIHN0eWxlcy5sYXllcnNbbV0udmlzaWJsZSA9IHRydWU7XG4gICAgICAgIH1cblxuICAgICAgICBpZiAoKHN0eWxlcy5sYXllcnNbbV0ubW9kZSAmJiBzdHlsZXMubGF5ZXJzW21dLm1vZGUubmFtZSkgPT0gbnVsbCkge1xuICAgICAgICAgICAgc3R5bGVzLmxheWVyc1ttXS5tb2RlID0ge307XG4gICAgICAgICAgICBmb3IgKHZhciBwIGluIFN0eWxlLmRlZmF1bHRzLm1vZGUpIHtcbiAgICAgICAgICAgICAgICBzdHlsZXMubGF5ZXJzW21dLm1vZGVbcF0gPSBTdHlsZS5kZWZhdWx0cy5tb2RlW3BdO1xuICAgICAgICAgICAgfVxuICAgICAgICB9XG4gICAgfVxuXG4gICAgc3R5bGVzLmNhbWVyYSA9IHN0eWxlcy5jYW1lcmEgfHwge307IC8vIGVuc3VyZSBjYW1lcmEgb2JqZWN0XG5cbiAgICByZXR1cm4gc3R5bGVzO1xufTtcblxuLy8gUHJvY2Vzc2VzIHRoZSB0aWxlIHJlc3BvbnNlIHRvIGNyZWF0ZSBsYXllcnMgYXMgZGVmaW5lZCBieSB0aGUgc2NlbmVcbi8vIENhbiBpbmNsdWRlIHBvc3QtcHJvY2Vzc2luZyB0byBwYXJ0aWFsbHkgZmlsdGVyIG9yIHJlLWFycmFuZ2UgZGF0YSwgZS5nLiBvbmx5IGluY2x1ZGluZyBQT0lzIHRoYXQgaGF2ZSBuYW1lc1xuU2NlbmUucHJvY2Vzc0xheWVyc0ZvclRpbGUgPSBmdW5jdGlvbiAobGF5ZXJzLCB0aWxlKSB7XG4gICAgdmFyIHRpbGVfbGF5ZXJzID0ge307XG4gICAgZm9yICh2YXIgdD0wOyB0IDwgbGF5ZXJzLmxlbmd0aDsgdCsrKSB7XG4gICAgICAgIGxheWVyc1t0XS5udW1iZXIgPSB0O1xuXG4gICAgICAgIGlmIChsYXllcnNbdF0gIT0gbnVsbCkge1xuICAgICAgICAgICAgLy8gSnVzdCBwYXNzIHRocm91Z2ggZGF0YSB1bnRvdWNoZWQgaWYgbm8gZGF0YSB0cmFuc2Zvcm0gZnVuY3Rpb24gZGVmaW5lZFxuICAgICAgICAgICAgaWYgKGxheWVyc1t0XS5kYXRhID09IG51bGwpIHtcbiAgICAgICAgICAgICAgICB0aWxlX2xheWVyc1tsYXllcnNbdF0ubmFtZV0gPSB0aWxlLmxheWVyc1tsYXllcnNbdF0ubmFtZV07XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICAvLyBQYXNzIHRocm91Z2ggZGF0YSBidXQgd2l0aCBkaWZmZXJlbnQgbGF5ZXIgbmFtZSBpbiB0aWxlIHNvdXJjZSBkYXRhXG4gICAgICAgICAgICBlbHNlIGlmICh0eXBlb2YgbGF5ZXJzW3RdLmRhdGEgPT0gJ3N0cmluZycpIHtcbiAgICAgICAgICAgICAgICB0aWxlX2xheWVyc1tsYXllcnNbdF0ubmFtZV0gPSB0aWxlLmxheWVyc1tsYXllcnNbdF0uZGF0YV07XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICAvLyBBcHBseSB0aGUgdHJhbnNmb3JtIGZ1bmN0aW9uIGZvciBwb3N0LXByb2Nlc3NpbmdcbiAgICAgICAgICAgIGVsc2UgaWYgKHR5cGVvZiBsYXllcnNbdF0uZGF0YSA9PSAnZnVuY3Rpb24nKSB7XG4gICAgICAgICAgICAgICAgdGlsZV9sYXllcnNbbGF5ZXJzW3RdLm5hbWVdID0gbGF5ZXJzW3RdLmRhdGEodGlsZS5sYXllcnMpO1xuICAgICAgICAgICAgfVxuICAgICAgICB9XG5cbiAgICAgICAgLy8gSGFuZGxlIGNhc2VzIHdoZXJlIG5vIGRhdGEgd2FzIGZvdW5kIGluIHRpbGUgb3IgcmV0dXJuZWQgYnkgcG9zdC1wcm9jZXNzb3JcbiAgICAgICAgdGlsZV9sYXllcnNbbGF5ZXJzW3RdLm5hbWVdID0gdGlsZV9sYXllcnNbbGF5ZXJzW3RdLm5hbWVdIHx8IHsgdHlwZTogJ0ZlYXR1cmVDb2xsZWN0aW9uJywgZmVhdHVyZXM6IFtdIH07XG4gICAgfVxuICAgIHRpbGUubGF5ZXJzID0gdGlsZV9sYXllcnM7XG4gICAgcmV0dXJuIHRpbGVfbGF5ZXJzO1xufTtcblxuLy8gQ2FsbGVkIG9uY2Ugb24gaW5zdGFudGlhdGlvblxuU2NlbmUuY3JlYXRlTW9kZXMgPSBmdW5jdGlvbiAoc3R5bGVzKSB7XG4gICAgdmFyIG1vZGVzID0ge307XG5cbiAgICAvLyBCdWlsdC1pbiBtb2Rlc1xuICAgIHZhciBidWlsdF9pbnMgPSByZXF1aXJlKCcuL2dsL2dsX21vZGVzJykuTW9kZXM7XG4gICAgZm9yICh2YXIgbSBpbiBidWlsdF9pbnMpIHtcbiAgICAgICAgbW9kZXNbbV0gPSBidWlsdF9pbnNbbV07XG4gICAgfVxuXG4gICAgLy8gU3R5bGVzaGVldCBtb2Rlc1xuICAgIGZvciAodmFyIG0gaW4gc3R5bGVzLm1vZGVzKSB7XG4gICAgICAgIC8vIGlmIChtICE9ICdhbGwnKSB7XG4gICAgICAgICAgICBtb2Rlc1ttXSA9IE1vZGVNYW5hZ2VyLmNvbmZpZ3VyZU1vZGUobSwgc3R5bGVzLm1vZGVzW21dKTtcbiAgICAgICAgLy8gfVxuICAgIH1cblxuICAgIHJldHVybiBtb2Rlcztcbn07XG5cblNjZW5lLnJlZnJlc2hNb2RlcyA9IGZ1bmN0aW9uIChtb2Rlcywgc3R5bGVzKSB7XG4gICAgLy8gQ29weSBzdHlsZXNoZWV0IG1vZGVzXG4gICAgLy8gVE9ETzogaXMgdGhpcyB0aGUgYmVzdCB3YXkgdG8gY29weSBzdHlsZXNoZWV0IGNoYW5nZXMgdG8gbW9kZSBpbnN0YW5jZXM/XG4gICAgZm9yICh2YXIgbSBpbiBzdHlsZXMubW9kZXMpIHtcbiAgICAgICAgLy8gaWYgKG0gIT0gJ2FsbCcpIHtcbiAgICAgICAgICAgIG1vZGVzW21dID0gTW9kZU1hbmFnZXIuY29uZmlndXJlTW9kZShtLCBzdHlsZXMubW9kZXNbbV0pO1xuICAgICAgICAvLyB9XG4gICAgfVxuXG4gICAgLy8gUmVmcmVzaCBhbGwgbW9kZXNcbiAgICBmb3IgKG0gaW4gbW9kZXMpIHtcbiAgICAgICAgbW9kZXNbbV0ucmVmcmVzaCgpO1xuICAgIH1cblxuICAgIHJldHVybiBtb2Rlcztcbn07XG5cblxuLy8gUHJpdmF0ZS9pbnRlcm5hbFxuXG4vLyBHZXQgYmFzZSBVUkwgZnJvbSB3aGljaCB0aGUgbGlicmFyeSB3YXMgbG9hZGVkXG4vLyBVc2VkIHRvIGxvYWQgYWRkaXRpb25hbCByZXNvdXJjZXMgbGlrZSBzaGFkZXJzLCB0ZXh0dXJlcywgZXRjLiBpbiBjYXNlcyB3aGVyZSBsaWJyYXJ5IHdhcyBsb2FkZWQgZnJvbSBhIHJlbGF0aXZlIHBhdGhcbmZ1bmN0aW9uIGZpbmRCYXNlTGlicmFyeVVSTCAoKSB7XG4gICAgU2NlbmUubGlicmFyeV9iYXNlX3VybCA9ICcnO1xuICAgIHZhciBzY3JpcHRzID0gZG9jdW1lbnQuZ2V0RWxlbWVudHNCeVRhZ05hbWUoJ3NjcmlwdCcpOyAvLyBkb2N1bWVudC5xdWVyeVNlbGVjdG9yQWxsKCdzY3JpcHRbc3JjKj1cIi5qc1wiXScpO1xuICAgIGZvciAodmFyIHM9MDsgcyA8IHNjcmlwdHMubGVuZ3RoOyBzKyspIHtcbiAgICAgICAgdmFyIG1hdGNoID0gc2NyaXB0c1tzXS5zcmMuaW5kZXhPZigndGFuZ3JhbS5kZWJ1Zy5qcycpO1xuICAgICAgICBpZiAobWF0Y2ggPT0gLTEpIHtcbiAgICAgICAgICAgIG1hdGNoID0gc2NyaXB0c1tzXS5zcmMuaW5kZXhPZigndGFuZ3JhbS5taW4uanMnKTtcbiAgICAgICAgfVxuICAgICAgICBpZiAobWF0Y2ggPj0gMCkge1xuICAgICAgICAgICAgU2NlbmUubGlicmFyeV9iYXNlX3VybCA9IHNjcmlwdHNbc10uc3JjLnN1YnN0cigwLCBtYXRjaCk7XG4gICAgICAgICAgICBicmVhaztcbiAgICAgICAgfVxuICAgIH1cbn07XG4iLCIvKioqIFN0eWxlIGhlbHBlcnMgKioqL1xuaW1wb3J0IHtHZW99IGZyb20gJy4vZ2VvJztcblxuZXhwb3J0IHZhciBTdHlsZSA9IHt9O1xuXG4vLyBTdHlsZSBoZWxwZXJzXG5cblN0eWxlLmNvbG9yID0ge1xuICAgIHBzZXVkb1JhbmRvbUdyYXlzY2FsZTogZnVuY3Rpb24gKGYpIHsgdmFyIGMgPSBNYXRoLm1heCgocGFyc2VJbnQoZi5pZCwgMTYpICUgMTAwKSAvIDEwMCwgMC40KTsgcmV0dXJuIFswLjcgKiBjLCAwLjcgKiBjLCAwLjcgKiBjXTsgfSwgLy8gcHNldWRvLXJhbmRvbSBncmF5c2NhbGUgYnkgZ2VvbWV0cnkgaWRcbiAgICBwc2V1ZG9SYW5kb21Db2xvcjogZnVuY3Rpb24gKGYpIHsgcmV0dXJuIFswLjcgKiAocGFyc2VJbnQoZi5pZCwgMTYpIC8gMTAwICUgMSksIDAuNyAqIChwYXJzZUludChmLmlkLCAxNikgLyAxMDAwMCAlIDEpLCAwLjcgKiAocGFyc2VJbnQoZi5pZCwgMTYpIC8gMTAwMDAwMCAlIDEpXTsgfSwgLy8gcHNldWRvLXJhbmRvbSBjb2xvciBieSBnZW9tZXRyeSBpZFxuICAgIHJhbmRvbUNvbG9yOiBmdW5jdGlvbiAoZikgeyByZXR1cm4gWzAuNyAqIE1hdGgucmFuZG9tKCksIDAuNyAqIE1hdGgucmFuZG9tKCksIDAuNyAqIE1hdGgucmFuZG9tKCldOyB9IC8vIHJhbmRvbSBjb2xvclxufTtcblxuLy8gUmV0dXJucyBhIGZ1bmN0aW9uICh0aGF0IGNhbiBiZSB1c2VkIGFzIGEgZHluYW1pYyBzdHlsZSkgdGhhdCBjb252ZXJ0cyBwaXhlbHMgdG8gbWV0ZXJzIGZvciB0aGUgY3VycmVudCB6b29tIGxldmVsLlxuLy8gVGhlIHByb3ZpZGVkIHBpeGVsIHZhbHVlICgncCcpIGNhbiBpdHNlbGYgYmUgYSBmdW5jdGlvbiwgaW4gd2hpY2ggY2FzZSBpdCBpcyB3cmFwcGVkIGJ5IHRoaXMgb25lLlxuU3R5bGUucGl4ZWxzID0gZnVuY3Rpb24gKHAsIHopIHtcbiAgICB2YXIgZjtcbiAgICBldmFsKCdmID0gZnVuY3Rpb24oZiwgdCwgaCkgeyByZXR1cm4gJyArICh0eXBlb2YgcCA9PSAnZnVuY3Rpb24nID8gJygnICsgKHAudG9TdHJpbmcoKSArICcoZiwgdCwgaCkpJykgOiBwKSArICcgKiBoLkdlby5tZXRlcnNfcGVyX3BpeGVsW2guem9vbV07IH0nKTtcbiAgICByZXR1cm4gZjtcbn07XG5cbi8vIENyZWF0ZSBhIHVuaXF1ZSAzMi1iaXQgY29sb3IgdG8gaWRlbnRpZnkgYSBmZWF0dXJlXG4vLyBXb3JrZXJzIGluZGVwZW5kZW50bHkgY3JlYXRlL21vZGlmeSBzZWxlY3Rpb24gY29sb3JzIGluIHRoZWlyIG93biB0aHJlYWRzLCBidXQgd2UgYWxzb1xuLy8gbmVlZCB0aGUgbWFpbiB0aHJlYWQgdG8ga25vdyB3aGVyZSBlYWNoIGZlYXR1cmUgY29sb3Igb3JpZ2luYXRlZC4gVG8gYWNjb21wbGlzaCB0aGlzLFxuLy8gd2UgcGFydGl0aW9uIHRoZSBtYXAgYnkgc2V0dGluZyB0aGUgNHRoIGNvbXBvbmVudCAoYWxwaGEgY2hhbm5lbCkgdG8gdGhlIHdvcmtlcidzIGlkLlxuU3R5bGUuc2VsZWN0aW9uX21hcCA9IHt9OyAvLyB0aGlzIHdpbGwgYmUgdW5pcXVlIHBlciBtb2R1bGUgaW5zdGFuY2UgKHNvIHVuaXF1ZSBwZXIgd29ya2VyKVxuU3R5bGUuc2VsZWN0aW9uX21hcF9jdXJyZW50ID0gMTsgLy8gc3RhcnQgYXQgMSBzaW5jZSAxIHdpbGwgYmUgZGl2aWRlZCBieSB0aGlzXG5TdHlsZS5zZWxlY3Rpb25fbWFwX3ByZWZpeCA9IDA7IC8vIHNldCBieSB3b3JrZXIgdG8gd29ya2VyIGlkICNcblN0eWxlLmdlbmVyYXRlU2VsZWN0aW9uID0gZnVuY3Rpb24gKGNvbG9yX21hcClcbntcbiAgICAvLyAzMi1iaXQgY29sb3Iga2V5XG4gICAgU3R5bGUuc2VsZWN0aW9uX21hcF9jdXJyZW50Kys7XG4gICAgdmFyIGlyID0gU3R5bGUuc2VsZWN0aW9uX21hcF9jdXJyZW50ICYgMjU1O1xuICAgIHZhciBpZyA9IChTdHlsZS5zZWxlY3Rpb25fbWFwX2N1cnJlbnQgPj4gOCkgJiAyNTU7XG4gICAgdmFyIGliID0gKFN0eWxlLnNlbGVjdGlvbl9tYXBfY3VycmVudCA+PiAxNikgJiAyNTU7XG4gICAgdmFyIGlhID0gU3R5bGUuc2VsZWN0aW9uX21hcF9wcmVmaXg7XG4gICAgdmFyIHIgPSBpciAvIDI1NTtcbiAgICB2YXIgZyA9IGlnIC8gMjU1O1xuICAgIHZhciBiID0gaWIgLyAyNTU7XG4gICAgdmFyIGEgPSBpYSAvIDI1NTtcbiAgICB2YXIga2V5ID0gKGlyICsgKGlnIDw8IDgpICsgKGliIDw8IDE2KSArIChpYSA8PCAyNCkpID4+PiAwOyAvLyBuZWVkIHVuc2lnbmVkIHJpZ2h0IHNoaWZ0IHRvIGNvbnZlcnQgdG8gcG9zaXRpdmUgI1xuXG4gICAgY29sb3JfbWFwW2tleV0gPSB7XG4gICAgICAgIGNvbG9yOiBbciwgZywgYiwgYV0sXG4gICAgfTtcblxuICAgIHJldHVybiBjb2xvcl9tYXBba2V5XTtcbn07XG5cblN0eWxlLnJlc2V0U2VsZWN0aW9uTWFwID0gZnVuY3Rpb24gKClcbntcbiAgICBTdHlsZS5zZWxlY3Rpb25fbWFwID0ge307XG4gICAgU3R5bGUuc2VsZWN0aW9uX21hcF9jdXJyZW50ID0gMTtcbn07XG5cbi8vIEZpbmQgYW5kIGV4cGFuZCBzdHlsZSBtYWNyb3NcblN0eWxlLm1hY3JvcyA9IFtcbiAgICAnU3R5bGUuY29sb3IucHNldWRvUmFuZG9tQ29sb3InLFxuICAgICdTdHlsZS5waXhlbHMnXG5dO1xuXG5TdHlsZS5leHBhbmRNYWNyb3MgPSBmdW5jdGlvbiBleHBhbmRNYWNyb3MgKG9iaikge1xuICAgIGZvciAodmFyIHAgaW4gb2JqKSB7XG4gICAgICAgIHZhciB2YWwgPSBvYmpbcF07XG5cbiAgICAgICAgLy8gTG9vcCB0aHJvdWdoIG9iamVjdCBwcm9wZXJ0aWVzXG4gICAgICAgIGlmICh0eXBlb2YgdmFsID09ICdvYmplY3QnKSB7XG4gICAgICAgICAgICBvYmpbcF0gPSBleHBhbmRNYWNyb3ModmFsKTtcbiAgICAgICAgfVxuICAgICAgICAvLyBDb252ZXJ0IHN0cmluZ3MgYmFjayBpbnRvIGZ1bmN0aW9uc1xuICAgICAgICBlbHNlIGlmICh0eXBlb2YgdmFsID09ICdzdHJpbmcnKSB7XG4gICAgICAgICAgICBmb3IgKHZhciBtIGluIFN0eWxlLm1hY3Jvcykge1xuICAgICAgICAgICAgICAgIGlmICh2YWwubWF0Y2goU3R5bGUubWFjcm9zW21dKSkge1xuICAgICAgICAgICAgICAgICAgICB2YXIgZjtcbiAgICAgICAgICAgICAgICAgICAgdHJ5IHtcbiAgICAgICAgICAgICAgICAgICAgICAgIGV2YWwoJ2YgPSAnICsgdmFsKTtcbiAgICAgICAgICAgICAgICAgICAgICAgIG9ialtwXSA9IGY7XG4gICAgICAgICAgICAgICAgICAgICAgICBicmVhaztcbiAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgICAgICBjYXRjaCAoZSkge1xuICAgICAgICAgICAgICAgICAgICAgICAgLy8gZmFsbC1iYWNrIHRvIG9yaWdpbmFsIHZhbHVlIGlmIHBhcnNpbmcgZmFpbGVkXG4gICAgICAgICAgICAgICAgICAgICAgICBvYmpbcF0gPSB2YWw7XG4gICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICB9XG4gICAgICAgIH1cbiAgICB9XG5cbiAgICByZXR1cm4gb2JqO1xufTtcblxuXG4vLyBTdHlsZSBkZWZhdWx0c1xuXG4vLyBEZXRlcm1pbmUgZmluYWwgc3R5bGUgcHJvcGVydGllcyAoY29sb3IsIHdpZHRoLCBldGMuKVxuU3R5bGUuZGVmYXVsdHMgPSB7XG4gICAgY29sb3I6IFsxLjAsIDAsIDBdLFxuICAgIHdpZHRoOiAxLFxuICAgIHNpemU6IDEsXG4gICAgZXh0cnVkZTogZmFsc2UsXG4gICAgaGVpZ2h0OiAyMCxcbiAgICBtaW5faGVpZ2h0OiAwLFxuICAgIG91dGxpbmU6IHtcbiAgICAgICAgLy8gY29sb3I6IFsxLjAsIDAsIDBdLFxuICAgICAgICAvLyB3aWR0aDogMSxcbiAgICAgICAgLy8gZGFzaDogbnVsbFxuICAgIH0sXG4gICAgc2VsZWN0aW9uOiB7XG4gICAgICAgIGFjdGl2ZTogZmFsc2UsXG4gICAgICAgIGNvbG9yOiBbMCwgMCwgMCwgMV1cbiAgICB9LFxuICAgIG1vZGU6IHtcbiAgICAgICAgbmFtZTogJ3BvbHlnb25zJ1xuICAgIH1cbn07XG5cbi8vIFN0eWxlIHBhcnNpbmdcblxuLy8gSGVscGVyIGZ1bmN0aW9ucyBwYXNzZWQgdG8gZHluYW1pYyBzdHlsZSBmdW5jdGlvbnNcblN0eWxlLmhlbHBlcnMgPSB7XG4gICAgU3R5bGU6IFN0eWxlLFxuICAgIEdlbzogR2VvXG59O1xuXG5TdHlsZS5wYXJzZVN0eWxlRm9yRmVhdHVyZSA9IGZ1bmN0aW9uIChmZWF0dXJlLCBsYXllcl9uYW1lLCBsYXllcl9zdHlsZSwgdGlsZSlcbntcbiAgICB2YXIgbGF5ZXJfc3R5bGUgPSBsYXllcl9zdHlsZSB8fCB7fTtcbiAgICB2YXIgc3R5bGUgPSB7fTtcblxuICAgIFN0eWxlLmhlbHBlcnMuem9vbSA9IHRpbGUuY29vcmRzLno7XG5cbiAgICAvLyBUZXN0IHdoZXRoZXIgZmVhdHVyZXMgc2hvdWxkIGJlIHJlbmRlcmVkIGF0IGFsbFxuICAgIGlmICh0eXBlb2YgbGF5ZXJfc3R5bGUuZmlsdGVyID09ICdmdW5jdGlvbicpIHtcbiAgICAgICAgaWYgKGxheWVyX3N0eWxlLmZpbHRlcihmZWF0dXJlLCB0aWxlLCBTdHlsZS5oZWxwZXJzKSA9PSBmYWxzZSkge1xuICAgICAgICAgICAgcmV0dXJuIG51bGw7XG4gICAgICAgIH1cbiAgICB9XG5cbiAgICAvLyBQYXJzZSBzdHlsZXNcbiAgICBzdHlsZS5jb2xvciA9IChsYXllcl9zdHlsZS5jb2xvciAmJiAobGF5ZXJfc3R5bGUuY29sb3JbZmVhdHVyZS5wcm9wZXJ0aWVzLmtpbmRdIHx8IGxheWVyX3N0eWxlLmNvbG9yLmRlZmF1bHQpKSB8fCBTdHlsZS5kZWZhdWx0cy5jb2xvcjtcbiAgICBpZiAodHlwZW9mIHN0eWxlLmNvbG9yID09ICdmdW5jdGlvbicpIHtcbiAgICAgICAgc3R5bGUuY29sb3IgPSBzdHlsZS5jb2xvcihmZWF0dXJlLCB0aWxlLCBTdHlsZS5oZWxwZXJzKTtcbiAgICB9XG5cbiAgICBzdHlsZS53aWR0aCA9IChsYXllcl9zdHlsZS53aWR0aCAmJiAobGF5ZXJfc3R5bGUud2lkdGhbZmVhdHVyZS5wcm9wZXJ0aWVzLmtpbmRdIHx8IGxheWVyX3N0eWxlLndpZHRoLmRlZmF1bHQpKSB8fCBTdHlsZS5kZWZhdWx0cy53aWR0aDtcbiAgICBpZiAodHlwZW9mIHN0eWxlLndpZHRoID09ICdmdW5jdGlvbicpIHtcbiAgICAgICAgc3R5bGUud2lkdGggPSBzdHlsZS53aWR0aChmZWF0dXJlLCB0aWxlLCBTdHlsZS5oZWxwZXJzKTtcbiAgICB9XG4gICAgc3R5bGUud2lkdGggKj0gR2VvLnVuaXRzX3Blcl9tZXRlclt0aWxlLmNvb3Jkcy56XTtcblxuICAgIHN0eWxlLnNpemUgPSAobGF5ZXJfc3R5bGUuc2l6ZSAmJiAobGF5ZXJfc3R5bGUuc2l6ZVtmZWF0dXJlLnByb3BlcnRpZXMua2luZF0gfHwgbGF5ZXJfc3R5bGUuc2l6ZS5kZWZhdWx0KSkgfHwgU3R5bGUuZGVmYXVsdHMuc2l6ZTtcbiAgICBpZiAodHlwZW9mIHN0eWxlLnNpemUgPT0gJ2Z1bmN0aW9uJykge1xuICAgICAgICBzdHlsZS5zaXplID0gc3R5bGUuc2l6ZShmZWF0dXJlLCB0aWxlLCBTdHlsZS5oZWxwZXJzKTtcbiAgICB9XG4gICAgc3R5bGUuc2l6ZSAqPSBHZW8udW5pdHNfcGVyX21ldGVyW3RpbGUuY29vcmRzLnpdO1xuXG4gICAgc3R5bGUuZXh0cnVkZSA9IChsYXllcl9zdHlsZS5leHRydWRlICYmIChsYXllcl9zdHlsZS5leHRydWRlW2ZlYXR1cmUucHJvcGVydGllcy5raW5kXSB8fCBsYXllcl9zdHlsZS5leHRydWRlLmRlZmF1bHQpKSB8fCBTdHlsZS5kZWZhdWx0cy5leHRydWRlO1xuICAgIGlmICh0eXBlb2Ygc3R5bGUuZXh0cnVkZSA9PSAnZnVuY3Rpb24nKSB7XG4gICAgICAgIC8vIHJldHVybmluZyBhIGJvb2xlYW4gd2lsbCBleHRydWRlIHdpdGggdGhlIGZlYXR1cmUncyBoZWlnaHQsIGEgbnVtYmVyIHdpbGwgb3ZlcnJpZGUgdGhlIGZlYXR1cmUgaGVpZ2h0IChzZWUgYmVsb3cpXG4gICAgICAgIHN0eWxlLmV4dHJ1ZGUgPSBzdHlsZS5leHRydWRlKGZlYXR1cmUsIHRpbGUsIFN0eWxlLmhlbHBlcnMpO1xuICAgIH1cblxuICAgIHN0eWxlLmhlaWdodCA9IChmZWF0dXJlLnByb3BlcnRpZXMgJiYgZmVhdHVyZS5wcm9wZXJ0aWVzLmhlaWdodCkgfHwgU3R5bGUuZGVmYXVsdHMuaGVpZ2h0O1xuICAgIHN0eWxlLm1pbl9oZWlnaHQgPSAoZmVhdHVyZS5wcm9wZXJ0aWVzICYmIGZlYXR1cmUucHJvcGVydGllcy5taW5faGVpZ2h0KSB8fCBTdHlsZS5kZWZhdWx0cy5taW5faGVpZ2h0O1xuXG4gICAgLy8gaGVpZ2h0IGRlZmF1bHRzIHRvIGZlYXR1cmUgaGVpZ2h0LCBidXQgZXh0cnVkZSBzdHlsZSBjYW4gZHluYW1pY2FsbHkgYWRqdXN0IGhlaWdodCBieSByZXR1cm5pbmcgYSBudW1iZXIgb3IgYXJyYXkgKGluc3RlYWQgb2YgYSBib29sZWFuKVxuICAgIGlmIChzdHlsZS5leHRydWRlKSB7XG4gICAgICAgIGlmICh0eXBlb2Ygc3R5bGUuZXh0cnVkZSA9PSAnbnVtYmVyJykge1xuICAgICAgICAgICAgc3R5bGUuaGVpZ2h0ID0gc3R5bGUuZXh0cnVkZTtcbiAgICAgICAgfVxuICAgICAgICBlbHNlIGlmICh0eXBlb2Ygc3R5bGUuZXh0cnVkZSA9PSAnb2JqZWN0JyAmJiBzdHlsZS5leHRydWRlLmxlbmd0aCA+PSAyKSB7XG4gICAgICAgICAgICBzdHlsZS5taW5faGVpZ2h0ID0gc3R5bGUuZXh0cnVkZVswXTtcbiAgICAgICAgICAgIHN0eWxlLmhlaWdodCA9IHN0eWxlLmV4dHJ1ZGVbMV07XG4gICAgICAgIH1cbiAgICB9XG5cbiAgICBzdHlsZS56ID0gKGxheWVyX3N0eWxlLnogJiYgKGxheWVyX3N0eWxlLnpbZmVhdHVyZS5wcm9wZXJ0aWVzLmtpbmRdIHx8IGxheWVyX3N0eWxlLnouZGVmYXVsdCkpIHx8IFN0eWxlLmRlZmF1bHRzLnogfHwgMDtcbiAgICBpZiAodHlwZW9mIHN0eWxlLnogPT0gJ2Z1bmN0aW9uJykge1xuICAgICAgICBzdHlsZS56ID0gc3R5bGUueihmZWF0dXJlLCB0aWxlLCBTdHlsZS5oZWxwZXJzKTtcbiAgICB9XG5cbiAgICBzdHlsZS5vdXRsaW5lID0ge307XG4gICAgbGF5ZXJfc3R5bGUub3V0bGluZSA9IGxheWVyX3N0eWxlLm91dGxpbmUgfHwge307XG4gICAgc3R5bGUub3V0bGluZS5jb2xvciA9IChsYXllcl9zdHlsZS5vdXRsaW5lLmNvbG9yICYmIChsYXllcl9zdHlsZS5vdXRsaW5lLmNvbG9yW2ZlYXR1cmUucHJvcGVydGllcy5raW5kXSB8fCBsYXllcl9zdHlsZS5vdXRsaW5lLmNvbG9yLmRlZmF1bHQpKSB8fCBTdHlsZS5kZWZhdWx0cy5vdXRsaW5lLmNvbG9yO1xuICAgIGlmICh0eXBlb2Ygc3R5bGUub3V0bGluZS5jb2xvciA9PSAnZnVuY3Rpb24nKSB7XG4gICAgICAgIHN0eWxlLm91dGxpbmUuY29sb3IgPSBzdHlsZS5vdXRsaW5lLmNvbG9yKGZlYXR1cmUsIHRpbGUsIFN0eWxlLmhlbHBlcnMpO1xuICAgIH1cblxuICAgIHN0eWxlLm91dGxpbmUud2lkdGggPSAobGF5ZXJfc3R5bGUub3V0bGluZS53aWR0aCAmJiAobGF5ZXJfc3R5bGUub3V0bGluZS53aWR0aFtmZWF0dXJlLnByb3BlcnRpZXMua2luZF0gfHwgbGF5ZXJfc3R5bGUub3V0bGluZS53aWR0aC5kZWZhdWx0KSkgfHwgU3R5bGUuZGVmYXVsdHMub3V0bGluZS53aWR0aDtcbiAgICBpZiAodHlwZW9mIHN0eWxlLm91dGxpbmUud2lkdGggPT0gJ2Z1bmN0aW9uJykge1xuICAgICAgICBzdHlsZS5vdXRsaW5lLndpZHRoID0gc3R5bGUub3V0bGluZS53aWR0aChmZWF0dXJlLCB0aWxlLCBTdHlsZS5oZWxwZXJzKTtcbiAgICB9XG4gICAgc3R5bGUub3V0bGluZS53aWR0aCAqPSBHZW8udW5pdHNfcGVyX21ldGVyW3RpbGUuY29vcmRzLnpdO1xuXG4gICAgc3R5bGUub3V0bGluZS5kYXNoID0gKGxheWVyX3N0eWxlLm91dGxpbmUuZGFzaCAmJiAobGF5ZXJfc3R5bGUub3V0bGluZS5kYXNoW2ZlYXR1cmUucHJvcGVydGllcy5raW5kXSB8fCBsYXllcl9zdHlsZS5vdXRsaW5lLmRhc2guZGVmYXVsdCkpIHx8IFN0eWxlLmRlZmF1bHRzLm91dGxpbmUuZGFzaDtcbiAgICBpZiAodHlwZW9mIHN0eWxlLm91dGxpbmUuZGFzaCA9PSAnZnVuY3Rpb24nKSB7XG4gICAgICAgIHN0eWxlLm91dGxpbmUuZGFzaCA9IHN0eWxlLm91dGxpbmUuZGFzaChmZWF0dXJlLCB0aWxlLCBTdHlsZS5oZWxwZXJzKTtcbiAgICB9XG5cbiAgICAvLyBJbnRlcmFjdGl2aXR5IChzZWxlY3Rpb24gbWFwKVxuICAgIHZhciBpbnRlcmFjdGl2ZSA9IGZhbHNlO1xuICAgIGlmICh0eXBlb2YgbGF5ZXJfc3R5bGUuaW50ZXJhY3RpdmUgPT0gJ2Z1bmN0aW9uJykge1xuICAgICAgICBpbnRlcmFjdGl2ZSA9IGxheWVyX3N0eWxlLmludGVyYWN0aXZlKGZlYXR1cmUsIHRpbGUsIFN0eWxlLmhlbHBlcnMpO1xuICAgIH1cbiAgICBlbHNlIHtcbiAgICAgICAgaW50ZXJhY3RpdmUgPSBsYXllcl9zdHlsZS5pbnRlcmFjdGl2ZTtcbiAgICB9XG5cbiAgICBpZiAoaW50ZXJhY3RpdmUgPT0gdHJ1ZSkge1xuICAgICAgICB2YXIgc2VsZWN0b3IgPSBTdHlsZS5nZW5lcmF0ZVNlbGVjdGlvbihTdHlsZS5zZWxlY3Rpb25fbWFwKTtcblxuICAgICAgICBzZWxlY3Rvci5mZWF0dXJlID0ge1xuICAgICAgICAgICAgaWQ6IGZlYXR1cmUuaWQsXG4gICAgICAgICAgICBwcm9wZXJ0aWVzOiBmZWF0dXJlLnByb3BlcnRpZXNcbiAgICAgICAgfTtcbiAgICAgICAgc2VsZWN0b3IuZmVhdHVyZS5wcm9wZXJ0aWVzLmxheWVyID0gbGF5ZXJfbmFtZTsgLy8gYWRkIGxheWVyIG5hbWUgdG8gcHJvcGVydGllc1xuXG4gICAgICAgIHN0eWxlLnNlbGVjdGlvbiA9IHtcbiAgICAgICAgICAgIGFjdGl2ZTogdHJ1ZSxcbiAgICAgICAgICAgIGNvbG9yOiBzZWxlY3Rvci5jb2xvclxuICAgICAgICB9O1xuICAgIH1cbiAgICBlbHNlIHtcbiAgICAgICAgc3R5bGUuc2VsZWN0aW9uID0gU3R5bGUuZGVmYXVsdHMuc2VsZWN0aW9uO1xuICAgIH1cblxuICAgIGlmIChsYXllcl9zdHlsZS5tb2RlICE9IG51bGwgJiYgbGF5ZXJfc3R5bGUubW9kZS5uYW1lICE9IG51bGwpIHtcbiAgICAgICAgc3R5bGUubW9kZSA9IHt9O1xuICAgICAgICBmb3IgKHZhciBtIGluIGxheWVyX3N0eWxlLm1vZGUpIHtcbiAgICAgICAgICAgIHN0eWxlLm1vZGVbbV0gPSBsYXllcl9zdHlsZS5tb2RlW21dO1xuICAgICAgICB9XG4gICAgfVxuICAgIGVsc2Uge1xuICAgICAgICBzdHlsZS5tb2RlID0gU3R5bGUuZGVmYXVsdHMubW9kZTtcbiAgICB9XG5cbiAgICByZXR1cm4gc3R5bGU7XG59O1xuXG4iLCIvLyBNaXNjZWxsYW5lb3VzIHV0aWxpdGllc1xuXG4vLyBTaW1wbGlzdGljIGRldGVjdGlvbiBvZiByZWxhdGl2ZSBwYXRocywgYXBwZW5kIGJhc2UgaWYgbmVjZXNzYXJ5XG5leHBvcnQgZnVuY3Rpb24gdXJsRm9yUGF0aChwYXRoKSB7XG4gICAgaWYgKHBhdGggPT0gbnVsbCB8fCBwYXRoID09ICcnKSB7XG4gICAgICAgIHJldHVybiBudWxsO1xuICAgIH1cblxuICAgIC8vIENhbiBleHBhbmQgYSBzaW5nbGUgcGF0aCwgb3IgYW4gYXJyYXkgb2YgcGF0aHNcbiAgICBpZiAodHlwZW9mIHBhdGggPT0gJ29iamVjdCcgJiYgcGF0aC5sZW5ndGggPiAwKSB7XG4gICAgICAgIC8vIEFycmF5IG9mIHBhdGhzXG4gICAgICAgIGZvciAodmFyIHAgaW4gcGF0aCkge1xuICAgICAgICAgICAgdmFyIHByb3RvY29sID0gcGF0aFtwXS50b0xvd2VyQ2FzZSgpLnN1YnN0cigwLCA0KTtcbiAgICAgICAgICAgIGlmICghKHByb3RvY29sID09ICdodHRwJyB8fCBwcm90b2NvbCA9PSAnZmlsZScpKSB7XG4gICAgICAgICAgICAgICAgcGF0aFtwXSA9IHdpbmRvdy5sb2NhdGlvbi5vcmlnaW4gKyB3aW5kb3cubG9jYXRpb24ucGF0aG5hbWUgKyBwYXRoW3BdO1xuICAgICAgICAgICAgfVxuICAgICAgICB9XG4gICAgfVxuICAgIGVsc2Uge1xuICAgICAgICAvLyBTaW5nbGUgcGF0aFxuICAgICAgICB2YXIgcHJvdG9jb2wgPSBwYXRoLnRvTG93ZXJDYXNlKCkuc3Vic3RyKDAsIDQpO1xuICAgICAgICBpZiAoIShwcm90b2NvbCA9PSAnaHR0cCcgfHwgcHJvdG9jb2wgPT0gJ2ZpbGUnKSkge1xuICAgICAgICAgICAgcGF0aCA9IHdpbmRvdy5sb2NhdGlvbi5vcmlnaW4gKyB3aW5kb3cubG9jYXRpb24ucGF0aG5hbWUgKyBwYXRoO1xuICAgICAgICB9XG4gICAgfVxuICAgIHJldHVybiBwYXRoO1xufTtcblxuLy8gU3RyaW5naWZ5IGFuIG9iamVjdCBpbnRvIEpTT04sIGJ1dCBjb252ZXJ0IGZ1bmN0aW9ucyB0byBzdHJpbmdzXG5leHBvcnQgZnVuY3Rpb24gc2VyaWFsaXplV2l0aEZ1bmN0aW9ucyhvYmopIHtcbiAgICB2YXIgc2VyaWFsaXplZCA9IEpTT04uc3RyaW5naWZ5KG9iaiwgZnVuY3Rpb24oaywgdikge1xuICAgICAgICAvLyBDb252ZXJ0IGZ1bmN0aW9ucyB0byBzdHJpbmdzXG4gICAgICAgIGlmICh0eXBlb2YgdiA9PSAnZnVuY3Rpb24nKSB7XG4gICAgICAgICAgICByZXR1cm4gdi50b1N0cmluZygpO1xuICAgICAgICB9XG4gICAgICAgIHJldHVybiB2O1xuICAgIH0pO1xuXG4gICAgcmV0dXJuIHNlcmlhbGl6ZWQ7XG59O1xuXG4vLyBQYXJzZSBhIEpTT04gc3RyaW5nLCBidXQgY29udmVydCBmdW5jdGlvbi1saWtlIHN0cmluZ3MgYmFjayBpbnRvIGZ1bmN0aW9uc1xuZXhwb3J0IGZ1bmN0aW9uIGRlc2VyaWFsaXplV2l0aEZ1bmN0aW9ucyhzZXJpYWxpemVkKSB7XG4gICAgdmFyIG9iaiA9IEpTT04ucGFyc2Uoc2VyaWFsaXplZCk7XG4gICAgb2JqID0gc3RyaW5nc1RvRnVuY3Rpb25zKG9iaik7XG5cbiAgICByZXR1cm4gb2JqO1xufTtcblxuLy8gUmVjdXJzaXZlbHkgcGFyc2UgYW4gb2JqZWN0LCBhdHRlbXB0aW5nIHRvIGNvbnZlcnQgc3RyaW5nIHByb3BlcnRpZXMgdGhhdCBsb29rIGxpa2UgZnVuY3Rpb25zIGJhY2sgaW50byBmdW5jdGlvbnNcbmV4cG9ydCBmdW5jdGlvbiBzdHJpbmdzVG9GdW5jdGlvbnMob2JqKSB7XG4gICAgZm9yICh2YXIgcCBpbiBvYmopIHtcbiAgICAgICAgdmFyIHZhbCA9IG9ialtwXTtcblxuICAgICAgICAvLyBMb29wIHRocm91Z2ggb2JqZWN0IHByb3BlcnRpZXNcbiAgICAgICAgaWYgKHR5cGVvZiB2YWwgPT0gJ29iamVjdCcpIHtcbiAgICAgICAgICAgIG9ialtwXSA9IHN0cmluZ3NUb0Z1bmN0aW9ucyh2YWwpO1xuICAgICAgICB9XG4gICAgICAgIC8vIENvbnZlcnQgc3RyaW5ncyBiYWNrIGludG8gZnVuY3Rpb25zXG4gICAgICAgIGVsc2UgaWYgKHR5cGVvZiB2YWwgPT0gJ3N0cmluZycgJiYgdmFsLm1hdGNoKC9eZnVuY3Rpb24uKlxcKC4qXFwpLykgIT0gbnVsbCkge1xuICAgICAgICAgICAgdmFyIGY7XG4gICAgICAgICAgICB0cnkge1xuICAgICAgICAgICAgICAgIGV2YWwoJ2YgPSAnICsgdmFsKTtcbiAgICAgICAgICAgICAgICBvYmpbcF0gPSBmO1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgY2F0Y2ggKGUpIHtcbiAgICAgICAgICAgICAgICAvLyBmYWxsLWJhY2sgdG8gb3JpZ2luYWwgdmFsdWUgaWYgcGFyc2luZyBmYWlsZWRcbiAgICAgICAgICAgICAgICBvYmpbcF0gPSB2YWw7XG4gICAgICAgICAgICB9XG4gICAgICAgIH1cbiAgICB9XG5cbiAgICByZXR1cm4gb2JqO1xufTtcblxuLy8gUnVuIGEgYmxvY2sgaWYgb24gdGhlIG1haW4gdGhyZWFkIChub3QgaW4gYSB3ZWIgd29ya2VyKSwgd2l0aCBvcHRpb25hbCBlcnJvciAod2ViIHdvcmtlcikgYmxvY2tcbmV4cG9ydCBmdW5jdGlvbiBydW5JZkluTWFpblRocmVhZChibG9jaywgZXJyKSB7XG4gICAgdHJ5IHtcbiAgICAgICAgaWYgKHdpbmRvdy5kb2N1bWVudCAhPT0gdW5kZWZpbmVkKSB7XG4gICAgICAgICAgICBibG9jaygpO1xuICAgICAgICB9XG4gICAgfVxuICAgIGNhdGNoIChlKSB7XG4gICAgICAgIGlmICh0eXBlb2YgZXJyID09ICdmdW5jdGlvbicpIHtcbiAgICAgICAgICAgIGVycigpO1xuICAgICAgICB9XG4gICAgfVxufVxuXG4vLyBVc2VkIGZvciBkaWZmZXJlbnRpYXRpbmcgYmV0d2VlbiBwb3dlci1vZi0yIGFuZCBub24tcG93ZXItb2YtMiB0ZXh0dXJlc1xuLy8gVmlhOiBodHRwOi8vc3RhY2tvdmVyZmxvdy5jb20vcXVlc3Rpb25zLzE5NzIyMjQ3L3dlYmdsLXdhaXQtZm9yLXRleHR1cmUtdG8tbG9hZFxuZXhwb3J0IGZ1bmN0aW9uIGlzUG93ZXJPZjIodmFsdWUpIHtcbiAgICByZXR1cm4gKHZhbHVlICYgKHZhbHVlIC0gMSkpID09IDA7XG59XG4iLCIvKioqIFZlY3RvciBmdW5jdGlvbnMgLSB2ZWN0b3JzIHByb3ZpZGVkIGFzIFt4LCB5LCB6XSBhcnJheXMgKioqL1xuXG5leHBvcnQgdmFyIFZlY3RvciA9IHt9O1xuXG4vLyBWZWN0b3IgbGVuZ3RoIHNxdWFyZWRcblZlY3Rvci5sZW5ndGhTcSA9IGZ1bmN0aW9uICh2KVxue1xuICAgIGlmICh2Lmxlbmd0aCA9PSAyKSB7XG4gICAgICAgIHJldHVybiAodlswXSp2WzBdICsgdlsxXSp2WzFdKTtcbiAgICB9XG4gICAgZWxzZSB7XG4gICAgICAgIHJldHVybiAodlswXSp2WzBdICsgdlsxXSp2WzFdICsgdlsyXSp2WzJdKTtcbiAgICB9XG59O1xuXG4vLyBWZWN0b3IgbGVuZ3RoXG5WZWN0b3IubGVuZ3RoID0gZnVuY3Rpb24gKHYpXG57XG4gICAgcmV0dXJuIE1hdGguc3FydChWZWN0b3IubGVuZ3RoU3EodikpO1xufTtcblxuLy8gTm9ybWFsaXplIGEgdmVjdG9yXG5WZWN0b3Iubm9ybWFsaXplID0gZnVuY3Rpb24gKHYpXG57XG4gICAgdmFyIGQ7XG4gICAgaWYgKHYubGVuZ3RoID09IDIpIHtcbiAgICAgICAgZCA9IHZbMF0qdlswXSArIHZbMV0qdlsxXTtcbiAgICAgICAgZCA9IE1hdGguc3FydChkKTtcblxuICAgICAgICBpZiAoZCAhPSAwKSB7XG4gICAgICAgICAgICByZXR1cm4gW3ZbMF0gLyBkLCB2WzFdIC8gZF07XG4gICAgICAgIH1cbiAgICAgICAgcmV0dXJuIFswLCAwXTtcbiAgICB9XG4gICAgZWxzZSB7XG4gICAgICAgIHZhciBkID0gdlswXSp2WzBdICsgdlsxXSp2WzFdICsgdlsyXSp2WzJdO1xuICAgICAgICBkID0gTWF0aC5zcXJ0KGQpO1xuXG4gICAgICAgIGlmIChkICE9IDApIHtcbiAgICAgICAgICAgIHJldHVybiBbdlswXSAvIGQsIHZbMV0gLyBkLCB2WzJdIC8gZF07XG4gICAgICAgIH1cbiAgICAgICAgcmV0dXJuIFswLCAwLCAwXTtcbiAgICB9XG59O1xuXG4vLyBDcm9zcyBwcm9kdWN0IG9mIHR3byB2ZWN0b3JzXG5WZWN0b3IuY3Jvc3MgID0gZnVuY3Rpb24gKHYxLCB2MilcbntcbiAgICByZXR1cm4gW1xuICAgICAgICAodjFbMV0gKiB2MlsyXSkgLSAodjFbMl0gKiB2MlsxXSksXG4gICAgICAgICh2MVsyXSAqIHYyWzBdKSAtICh2MVswXSAqIHYyWzJdKSxcbiAgICAgICAgKHYxWzBdICogdjJbMV0pIC0gKHYxWzFdICogdjJbMF0pXG4gICAgXTtcbn07XG5cbi8vIEZpbmQgdGhlIGludGVyc2VjdGlvbiBvZiB0d28gbGluZXMgc3BlY2lmaWVkIGFzIHNlZ21lbnRzIGZyb20gcG9pbnRzIChwMSwgcDIpIGFuZCAocDMsIHA0KVxuLy8gaHR0cDovL2VuLndpa2lwZWRpYS5vcmcvd2lraS9MaW5lLWxpbmVfaW50ZXJzZWN0aW9uXG4vLyBodHRwOi8vZW4ud2lraXBlZGlhLm9yZy93aWtpL0NyYW1lcidzX3J1bGVcblZlY3Rvci5saW5lSW50ZXJzZWN0aW9uID0gZnVuY3Rpb24gKHAxLCBwMiwgcDMsIHA0LCBwYXJhbGxlbF90b2xlcmFuY2UpXG57XG4gICAgdmFyIHBhcmFsbGVsX3RvbGVyYW5jZSA9IHBhcmFsbGVsX3RvbGVyYW5jZSB8fCAwLjAxO1xuXG4gICAgLy8gYTEqeCArIGIxKnkgPSBjMSBmb3IgbGluZSAoeDEsIHkxKSB0byAoeDIsIHkyKVxuICAgIC8vIGEyKnggKyBiMip5ID0gYzIgZm9yIGxpbmUgKHgzLCB5MykgdG8gKHg0LCB5NClcbiAgICB2YXIgYTEgPSBwMVsxXSAtIHAyWzFdOyAvLyB5MSAtIHkyXG4gICAgdmFyIGIxID0gcDFbMF0gLSBwMlswXTsgLy8geDEgLSB4MlxuICAgIHZhciBhMiA9IHAzWzFdIC0gcDRbMV07IC8vIHkzIC0geTRcbiAgICB2YXIgYjIgPSBwM1swXSAtIHA0WzBdOyAvLyB4MyAtIHg0XG4gICAgdmFyIGMxID0gKHAxWzBdICogcDJbMV0pIC0gKHAxWzFdICogcDJbMF0pOyAvLyB4MSp5MiAtIHkxKngyXG4gICAgdmFyIGMyID0gKHAzWzBdICogcDRbMV0pIC0gKHAzWzFdICogcDRbMF0pOyAvLyB4Myp5NCAtIHkzKng0XG4gICAgdmFyIGRlbm9tID0gKGIxICogYTIpIC0gKGExICogYjIpO1xuXG4gICAgaWYgKE1hdGguYWJzKGRlbm9tKSA+IHBhcmFsbGVsX3RvbGVyYW5jZSkge1xuICAgICAgICByZXR1cm4gW1xuICAgICAgICAgICAgKChjMSAqIGIyKSAtIChiMSAqIGMyKSkgLyBkZW5vbSxcbiAgICAgICAgICAgICgoYzEgKiBhMikgLSAoYTEgKiBjMikpIC8gZGVub21cbiAgICAgICAgXTtcbiAgICB9XG4gICAgcmV0dXJuIG51bGw7IC8vIHJldHVybiBudWxsIGlmIGxpbmVzIGFyZSAoY2xvc2UgdG8pIHBhcmFsbGVsXG59O1xuIl19
(14)
});
