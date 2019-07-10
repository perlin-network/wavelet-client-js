(function (global, factory) {
	typeof exports === 'object' && typeof module !== 'undefined' ? module.exports = factory() :
	typeof define === 'function' && define.amd ? define(factory) :
	(global = global || self, global['wavelet-client'] = factory());
}(this, function () { 'use strict';

	function createCommonjsModule(fn, module) {
		return module = { exports: {} }, fn(module, module.exports), module.exports;
	}

	var _global = createCommonjsModule(function (module) {
	// https://github.com/zloirock/core-js/issues/86#issuecomment-115759028
	var global = module.exports = typeof window != 'undefined' && window.Math == Math
	  ? window : typeof self != 'undefined' && self.Math == Math ? self
	  // eslint-disable-next-line no-new-func
	  : Function('return this')();
	if (typeof __g == 'number') __g = global; // eslint-disable-line no-undef
	});

	var _core = createCommonjsModule(function (module) {
	var core = module.exports = { version: '2.6.9' };
	if (typeof __e == 'number') __e = core; // eslint-disable-line no-undef
	});
	var _core_1 = _core.version;

	var _isObject = function (it) {
	  return typeof it === 'object' ? it !== null : typeof it === 'function';
	};

	var _anObject = function (it) {
	  if (!_isObject(it)) throw TypeError(it + ' is not an object!');
	  return it;
	};

	var _fails = function (exec) {
	  try {
	    return !!exec();
	  } catch (e) {
	    return true;
	  }
	};

	// Thank's IE8 for his funny defineProperty
	var _descriptors = !_fails(function () {
	  return Object.defineProperty({}, 'a', { get: function () { return 7; } }).a != 7;
	});

	var document$1 = _global.document;
	// typeof document.createElement is 'object' in old IE
	var is = _isObject(document$1) && _isObject(document$1.createElement);
	var _domCreate = function (it) {
	  return is ? document$1.createElement(it) : {};
	};

	var _ie8DomDefine = !_descriptors && !_fails(function () {
	  return Object.defineProperty(_domCreate('div'), 'a', { get: function () { return 7; } }).a != 7;
	});

	// 7.1.1 ToPrimitive(input [, PreferredType])

	// instead of the ES6 spec version, we didn't implement @@toPrimitive case
	// and the second argument - flag - preferred type is a string
	var _toPrimitive = function (it, S) {
	  if (!_isObject(it)) return it;
	  var fn, val;
	  if (S && typeof (fn = it.toString) == 'function' && !_isObject(val = fn.call(it))) return val;
	  if (typeof (fn = it.valueOf) == 'function' && !_isObject(val = fn.call(it))) return val;
	  if (!S && typeof (fn = it.toString) == 'function' && !_isObject(val = fn.call(it))) return val;
	  throw TypeError("Can't convert object to primitive value");
	};

	var dP = Object.defineProperty;

	var f = _descriptors ? Object.defineProperty : function defineProperty(O, P, Attributes) {
	  _anObject(O);
	  P = _toPrimitive(P, true);
	  _anObject(Attributes);
	  if (_ie8DomDefine) try {
	    return dP(O, P, Attributes);
	  } catch (e) { /* empty */ }
	  if ('get' in Attributes || 'set' in Attributes) throw TypeError('Accessors not supported!');
	  if ('value' in Attributes) O[P] = Attributes.value;
	  return O;
	};

	var _objectDp = {
		f: f
	};

	var _propertyDesc = function (bitmap, value) {
	  return {
	    enumerable: !(bitmap & 1),
	    configurable: !(bitmap & 2),
	    writable: !(bitmap & 4),
	    value: value
	  };
	};

	var _hide = _descriptors ? function (object, key, value) {
	  return _objectDp.f(object, key, _propertyDesc(1, value));
	} : function (object, key, value) {
	  object[key] = value;
	  return object;
	};

	var hasOwnProperty = {}.hasOwnProperty;
	var _has = function (it, key) {
	  return hasOwnProperty.call(it, key);
	};

	var id = 0;
	var px = Math.random();
	var _uid = function (key) {
	  return 'Symbol('.concat(key === undefined ? '' : key, ')_', (++id + px).toString(36));
	};

	var _library = false;

	var _shared = createCommonjsModule(function (module) {
	var SHARED = '__core-js_shared__';
	var store = _global[SHARED] || (_global[SHARED] = {});

	(module.exports = function (key, value) {
	  return store[key] || (store[key] = value !== undefined ? value : {});
	})('versions', []).push({
	  version: _core.version,
	  mode:  'global',
	  copyright: '© 2019 Denis Pushkarev (zloirock.ru)'
	});
	});

	var _functionToString = _shared('native-function-to-string', Function.toString);

	var _redefine = createCommonjsModule(function (module) {
	var SRC = _uid('src');

	var TO_STRING = 'toString';
	var TPL = ('' + _functionToString).split(TO_STRING);

	_core.inspectSource = function (it) {
	  return _functionToString.call(it);
	};

	(module.exports = function (O, key, val, safe) {
	  var isFunction = typeof val == 'function';
	  if (isFunction) _has(val, 'name') || _hide(val, 'name', key);
	  if (O[key] === val) return;
	  if (isFunction) _has(val, SRC) || _hide(val, SRC, O[key] ? '' + O[key] : TPL.join(String(key)));
	  if (O === _global) {
	    O[key] = val;
	  } else if (!safe) {
	    delete O[key];
	    _hide(O, key, val);
	  } else if (O[key]) {
	    O[key] = val;
	  } else {
	    _hide(O, key, val);
	  }
	// add fake Function#toString for correct work wrapped methods / constructors with methods like LoDash isNative
	})(Function.prototype, TO_STRING, function toString() {
	  return typeof this == 'function' && this[SRC] || _functionToString.call(this);
	});
	});

	var _aFunction = function (it) {
	  if (typeof it != 'function') throw TypeError(it + ' is not a function!');
	  return it;
	};

	// optional / simple context binding

	var _ctx = function (fn, that, length) {
	  _aFunction(fn);
	  if (that === undefined) return fn;
	  switch (length) {
	    case 1: return function (a) {
	      return fn.call(that, a);
	    };
	    case 2: return function (a, b) {
	      return fn.call(that, a, b);
	    };
	    case 3: return function (a, b, c) {
	      return fn.call(that, a, b, c);
	    };
	  }
	  return function (/* ...args */) {
	    return fn.apply(that, arguments);
	  };
	};

	var PROTOTYPE = 'prototype';

	var $export = function (type, name, source) {
	  var IS_FORCED = type & $export.F;
	  var IS_GLOBAL = type & $export.G;
	  var IS_STATIC = type & $export.S;
	  var IS_PROTO = type & $export.P;
	  var IS_BIND = type & $export.B;
	  var target = IS_GLOBAL ? _global : IS_STATIC ? _global[name] || (_global[name] = {}) : (_global[name] || {})[PROTOTYPE];
	  var exports = IS_GLOBAL ? _core : _core[name] || (_core[name] = {});
	  var expProto = exports[PROTOTYPE] || (exports[PROTOTYPE] = {});
	  var key, own, out, exp;
	  if (IS_GLOBAL) source = name;
	  for (key in source) {
	    // contains in native
	    own = !IS_FORCED && target && target[key] !== undefined;
	    // export native or passed
	    out = (own ? target : source)[key];
	    // bind timers to global for call from export context
	    exp = IS_BIND && own ? _ctx(out, _global) : IS_PROTO && typeof out == 'function' ? _ctx(Function.call, out) : out;
	    // extend global
	    if (target) _redefine(target, key, out, type & $export.U);
	    // export
	    if (exports[key] != out) _hide(exports, key, exp);
	    if (IS_PROTO && expProto[key] != out) expProto[key] = out;
	  }
	};
	_global.core = _core;
	// type bitmap
	$export.F = 1;   // forced
	$export.G = 2;   // global
	$export.S = 4;   // static
	$export.P = 8;   // proto
	$export.B = 16;  // bind
	$export.W = 32;  // wrap
	$export.U = 64;  // safe
	$export.R = 128; // real proto method for `library`
	var _export = $export;

	var toString = {}.toString;

	var _cof = function (it) {
	  return toString.call(it).slice(8, -1);
	};

	// 7.2.2 IsArray(argument)

	var _isArray = Array.isArray || function isArray(arg) {
	  return _cof(arg) == 'Array';
	};

	// 22.1.2.2 / 15.4.3.2 Array.isArray(arg)


	_export(_export.S, 'Array', { isArray: _isArray });

	// 21.2.5.3 get RegExp.prototype.flags

	var _flags = function () {
	  var that = _anObject(this);
	  var result = '';
	  if (that.global) result += 'g';
	  if (that.ignoreCase) result += 'i';
	  if (that.multiline) result += 'm';
	  if (that.unicode) result += 'u';
	  if (that.sticky) result += 'y';
	  return result;
	};

	// 21.2.5.3 get RegExp.prototype.flags()
	if (_descriptors && /./g.flags != 'g') _objectDp.f(RegExp.prototype, 'flags', {
	  configurable: true,
	  get: _flags
	});

	var TO_STRING = 'toString';
	var $toString = /./[TO_STRING];

	var define = function (fn) {
	  _redefine(RegExp.prototype, TO_STRING, fn, true);
	};

	// 21.2.5.14 RegExp.prototype.toString()
	if (_fails(function () { return $toString.call({ source: 'a', flags: 'b' }) != '/a/b'; })) {
	  define(function toString() {
	    var R = _anObject(this);
	    return '/'.concat(R.source, '/',
	      'flags' in R ? R.flags : !_descriptors && R instanceof RegExp ? _flags.call(R) : undefined);
	  });
	// FF44- RegExp#toString has a wrong name
	} else if ($toString.name != TO_STRING) {
	  define(function toString() {
	    return $toString.call(this);
	  });
	}

	var DateProto = Date.prototype;
	var INVALID_DATE = 'Invalid Date';
	var TO_STRING$1 = 'toString';
	var $toString$1 = DateProto[TO_STRING$1];
	var getTime = DateProto.getTime;
	if (new Date(NaN) + '' != INVALID_DATE) {
	  _redefine(DateProto, TO_STRING$1, function toString() {
	    var value = getTime.call(this);
	    // eslint-disable-next-line no-self-compare
	    return value === value ? $toString$1.call(this) : INVALID_DATE;
	  });
	}

	var _wks = createCommonjsModule(function (module) {
	var store = _shared('wks');

	var Symbol = _global.Symbol;
	var USE_SYMBOL = typeof Symbol == 'function';

	var $exports = module.exports = function (name) {
	  return store[name] || (store[name] =
	    USE_SYMBOL && Symbol[name] || (USE_SYMBOL ? Symbol : _uid)('Symbol.' + name));
	};

	$exports.store = store;
	});

	// getting tag from 19.1.3.6 Object.prototype.toString()

	var TAG = _wks('toStringTag');
	// ES3 wrong here
	var ARG = _cof(function () { return arguments; }()) == 'Arguments';

	// fallback for IE11 Script Access Denied error
	var tryGet = function (it, key) {
	  try {
	    return it[key];
	  } catch (e) { /* empty */ }
	};

	var _classof = function (it) {
	  var O, T, B;
	  return it === undefined ? 'Undefined' : it === null ? 'Null'
	    // @@toStringTag case
	    : typeof (T = tryGet(O = Object(it), TAG)) == 'string' ? T
	    // builtinTag case
	    : ARG ? _cof(O)
	    // ES3 arguments fallback
	    : (B = _cof(O)) == 'Object' && typeof O.callee == 'function' ? 'Arguments' : B;
	};

	var _anInstance = function (it, Constructor, name, forbiddenField) {
	  if (!(it instanceof Constructor) || (forbiddenField !== undefined && forbiddenField in it)) {
	    throw TypeError(name + ': incorrect invocation!');
	  } return it;
	};

	// call something on iterator step with safe closing on error

	var _iterCall = function (iterator, fn, value, entries) {
	  try {
	    return entries ? fn(_anObject(value)[0], value[1]) : fn(value);
	  // 7.4.6 IteratorClose(iterator, completion)
	  } catch (e) {
	    var ret = iterator['return'];
	    if (ret !== undefined) _anObject(ret.call(iterator));
	    throw e;
	  }
	};

	var _iterators = {};

	// check on default Array iterator

	var ITERATOR = _wks('iterator');
	var ArrayProto = Array.prototype;

	var _isArrayIter = function (it) {
	  return it !== undefined && (_iterators.Array === it || ArrayProto[ITERATOR] === it);
	};

	// 7.1.4 ToInteger
	var ceil = Math.ceil;
	var floor = Math.floor;
	var _toInteger = function (it) {
	  return isNaN(it = +it) ? 0 : (it > 0 ? floor : ceil)(it);
	};

	// 7.1.15 ToLength

	var min = Math.min;
	var _toLength = function (it) {
	  return it > 0 ? min(_toInteger(it), 0x1fffffffffffff) : 0; // pow(2, 53) - 1 == 9007199254740991
	};

	var ITERATOR$1 = _wks('iterator');

	var core_getIteratorMethod = _core.getIteratorMethod = function (it) {
	  if (it != undefined) return it[ITERATOR$1]
	    || it['@@iterator']
	    || _iterators[_classof(it)];
	};

	var _forOf = createCommonjsModule(function (module) {
	var BREAK = {};
	var RETURN = {};
	var exports = module.exports = function (iterable, entries, fn, that, ITERATOR) {
	  var iterFn = ITERATOR ? function () { return iterable; } : core_getIteratorMethod(iterable);
	  var f = _ctx(fn, that, entries ? 2 : 1);
	  var index = 0;
	  var length, step, iterator, result;
	  if (typeof iterFn != 'function') throw TypeError(iterable + ' is not iterable!');
	  // fast case for arrays with default iterator
	  if (_isArrayIter(iterFn)) for (length = _toLength(iterable.length); length > index; index++) {
	    result = entries ? f(_anObject(step = iterable[index])[0], step[1]) : f(iterable[index]);
	    if (result === BREAK || result === RETURN) return result;
	  } else for (iterator = iterFn.call(iterable); !(step = iterator.next()).done;) {
	    result = _iterCall(iterator, f, step.value, entries);
	    if (result === BREAK || result === RETURN) return result;
	  }
	};
	exports.BREAK = BREAK;
	exports.RETURN = RETURN;
	});

	// 7.3.20 SpeciesConstructor(O, defaultConstructor)


	var SPECIES = _wks('species');
	var _speciesConstructor = function (O, D) {
	  var C = _anObject(O).constructor;
	  var S;
	  return C === undefined || (S = _anObject(C)[SPECIES]) == undefined ? D : _aFunction(S);
	};

	// fast apply, http://jsperf.lnkit.com/fast-apply/5
	var _invoke = function (fn, args, that) {
	  var un = that === undefined;
	  switch (args.length) {
	    case 0: return un ? fn()
	                      : fn.call(that);
	    case 1: return un ? fn(args[0])
	                      : fn.call(that, args[0]);
	    case 2: return un ? fn(args[0], args[1])
	                      : fn.call(that, args[0], args[1]);
	    case 3: return un ? fn(args[0], args[1], args[2])
	                      : fn.call(that, args[0], args[1], args[2]);
	    case 4: return un ? fn(args[0], args[1], args[2], args[3])
	                      : fn.call(that, args[0], args[1], args[2], args[3]);
	  } return fn.apply(that, args);
	};

	var document$2 = _global.document;
	var _html = document$2 && document$2.documentElement;

	var process = _global.process;
	var setTask = _global.setImmediate;
	var clearTask = _global.clearImmediate;
	var MessageChannel = _global.MessageChannel;
	var Dispatch = _global.Dispatch;
	var counter = 0;
	var queue = {};
	var ONREADYSTATECHANGE = 'onreadystatechange';
	var defer, channel, port;
	var run = function () {
	  var id = +this;
	  // eslint-disable-next-line no-prototype-builtins
	  if (queue.hasOwnProperty(id)) {
	    var fn = queue[id];
	    delete queue[id];
	    fn();
	  }
	};
	var listener = function (event) {
	  run.call(event.data);
	};
	// Node.js 0.9+ & IE10+ has setImmediate, otherwise:
	if (!setTask || !clearTask) {
	  setTask = function setImmediate(fn) {
	    var args = [];
	    var i = 1;
	    while (arguments.length > i) args.push(arguments[i++]);
	    queue[++counter] = function () {
	      // eslint-disable-next-line no-new-func
	      _invoke(typeof fn == 'function' ? fn : Function(fn), args);
	    };
	    defer(counter);
	    return counter;
	  };
	  clearTask = function clearImmediate(id) {
	    delete queue[id];
	  };
	  // Node.js 0.8-
	  if (_cof(process) == 'process') {
	    defer = function (id) {
	      process.nextTick(_ctx(run, id, 1));
	    };
	  // Sphere (JS game engine) Dispatch API
	  } else if (Dispatch && Dispatch.now) {
	    defer = function (id) {
	      Dispatch.now(_ctx(run, id, 1));
	    };
	  // Browsers with MessageChannel, includes WebWorkers
	  } else if (MessageChannel) {
	    channel = new MessageChannel();
	    port = channel.port2;
	    channel.port1.onmessage = listener;
	    defer = _ctx(port.postMessage, port, 1);
	  // Browsers with postMessage, skip WebWorkers
	  // IE8 has postMessage, but it's sync & typeof its postMessage is 'object'
	  } else if (_global.addEventListener && typeof postMessage == 'function' && !_global.importScripts) {
	    defer = function (id) {
	      _global.postMessage(id + '', '*');
	    };
	    _global.addEventListener('message', listener, false);
	  // IE8-
	  } else if (ONREADYSTATECHANGE in _domCreate('script')) {
	    defer = function (id) {
	      _html.appendChild(_domCreate('script'))[ONREADYSTATECHANGE] = function () {
	        _html.removeChild(this);
	        run.call(id);
	      };
	    };
	  // Rest old browsers
	  } else {
	    defer = function (id) {
	      setTimeout(_ctx(run, id, 1), 0);
	    };
	  }
	}
	var _task = {
	  set: setTask,
	  clear: clearTask
	};

	var macrotask = _task.set;
	var Observer = _global.MutationObserver || _global.WebKitMutationObserver;
	var process$1 = _global.process;
	var Promise$1 = _global.Promise;
	var isNode = _cof(process$1) == 'process';

	var _microtask = function () {
	  var head, last, notify;

	  var flush = function () {
	    var parent, fn;
	    if (isNode && (parent = process$1.domain)) parent.exit();
	    while (head) {
	      fn = head.fn;
	      head = head.next;
	      try {
	        fn();
	      } catch (e) {
	        if (head) notify();
	        else last = undefined;
	        throw e;
	      }
	    } last = undefined;
	    if (parent) parent.enter();
	  };

	  // Node.js
	  if (isNode) {
	    notify = function () {
	      process$1.nextTick(flush);
	    };
	  // browsers with MutationObserver, except iOS Safari - https://github.com/zloirock/core-js/issues/339
	  } else if (Observer && !(_global.navigator && _global.navigator.standalone)) {
	    var toggle = true;
	    var node = document.createTextNode('');
	    new Observer(flush).observe(node, { characterData: true }); // eslint-disable-line no-new
	    notify = function () {
	      node.data = toggle = !toggle;
	    };
	  // environments with maybe non-completely correct, but existent Promise
	  } else if (Promise$1 && Promise$1.resolve) {
	    // Promise.resolve without an argument throws an error in LG WebOS 2
	    var promise = Promise$1.resolve(undefined);
	    notify = function () {
	      promise.then(flush);
	    };
	  // for other environments - macrotask based on:
	  // - setImmediate
	  // - MessageChannel
	  // - window.postMessag
	  // - onreadystatechange
	  // - setTimeout
	  } else {
	    notify = function () {
	      // strange IE + webpack dev server bug - use .call(global)
	      macrotask.call(_global, flush);
	    };
	  }

	  return function (fn) {
	    var task = { fn: fn, next: undefined };
	    if (last) last.next = task;
	    if (!head) {
	      head = task;
	      notify();
	    } last = task;
	  };
	};

	// 25.4.1.5 NewPromiseCapability(C)


	function PromiseCapability(C) {
	  var resolve, reject;
	  this.promise = new C(function ($$resolve, $$reject) {
	    if (resolve !== undefined || reject !== undefined) throw TypeError('Bad Promise constructor');
	    resolve = $$resolve;
	    reject = $$reject;
	  });
	  this.resolve = _aFunction(resolve);
	  this.reject = _aFunction(reject);
	}

	var f$1 = function (C) {
	  return new PromiseCapability(C);
	};

	var _newPromiseCapability = {
		f: f$1
	};

	var _perform = function (exec) {
	  try {
	    return { e: false, v: exec() };
	  } catch (e) {
	    return { e: true, v: e };
	  }
	};

	var navigator = _global.navigator;

	var _userAgent = navigator && navigator.userAgent || '';

	var _promiseResolve = function (C, x) {
	  _anObject(C);
	  if (_isObject(x) && x.constructor === C) return x;
	  var promiseCapability = _newPromiseCapability.f(C);
	  var resolve = promiseCapability.resolve;
	  resolve(x);
	  return promiseCapability.promise;
	};

	var _redefineAll = function (target, src, safe) {
	  for (var key in src) _redefine(target, key, src[key], safe);
	  return target;
	};

	var def = _objectDp.f;

	var TAG$1 = _wks('toStringTag');

	var _setToStringTag = function (it, tag, stat) {
	  if (it && !_has(it = stat ? it : it.prototype, TAG$1)) def(it, TAG$1, { configurable: true, value: tag });
	};

	var SPECIES$1 = _wks('species');

	var _setSpecies = function (KEY) {
	  var C = _global[KEY];
	  if (_descriptors && C && !C[SPECIES$1]) _objectDp.f(C, SPECIES$1, {
	    configurable: true,
	    get: function () { return this; }
	  });
	};

	var ITERATOR$2 = _wks('iterator');
	var SAFE_CLOSING = false;

	try {
	  var riter = [7][ITERATOR$2]();
	  riter['return'] = function () { SAFE_CLOSING = true; };
	  // eslint-disable-next-line no-throw-literal
	  Array.from(riter, function () { throw 2; });
	} catch (e) { /* empty */ }

	var _iterDetect = function (exec, skipClosing) {
	  if (!skipClosing && !SAFE_CLOSING) return false;
	  var safe = false;
	  try {
	    var arr = [7];
	    var iter = arr[ITERATOR$2]();
	    iter.next = function () { return { done: safe = true }; };
	    arr[ITERATOR$2] = function () { return iter; };
	    exec(arr);
	  } catch (e) { /* empty */ }
	  return safe;
	};

	var task = _task.set;
	var microtask = _microtask();




	var PROMISE = 'Promise';
	var TypeError$1 = _global.TypeError;
	var process$2 = _global.process;
	var versions = process$2 && process$2.versions;
	var v8 = versions && versions.v8 || '';
	var $Promise = _global[PROMISE];
	var isNode$1 = _classof(process$2) == 'process';
	var empty = function () { /* empty */ };
	var Internal, newGenericPromiseCapability, OwnPromiseCapability, Wrapper;
	var newPromiseCapability = newGenericPromiseCapability = _newPromiseCapability.f;

	var USE_NATIVE = !!function () {
	  try {
	    // correct subclassing with @@species support
	    var promise = $Promise.resolve(1);
	    var FakePromise = (promise.constructor = {})[_wks('species')] = function (exec) {
	      exec(empty, empty);
	    };
	    // unhandled rejections tracking support, NodeJS Promise without it fails @@species test
	    return (isNode$1 || typeof PromiseRejectionEvent == 'function')
	      && promise.then(empty) instanceof FakePromise
	      // v8 6.6 (Node 10 and Chrome 66) have a bug with resolving custom thenables
	      // https://bugs.chromium.org/p/chromium/issues/detail?id=830565
	      // we can't detect it synchronously, so just check versions
	      && v8.indexOf('6.6') !== 0
	      && _userAgent.indexOf('Chrome/66') === -1;
	  } catch (e) { /* empty */ }
	}();

	// helpers
	var isThenable = function (it) {
	  var then;
	  return _isObject(it) && typeof (then = it.then) == 'function' ? then : false;
	};
	var notify = function (promise, isReject) {
	  if (promise._n) return;
	  promise._n = true;
	  var chain = promise._c;
	  microtask(function () {
	    var value = promise._v;
	    var ok = promise._s == 1;
	    var i = 0;
	    var run = function (reaction) {
	      var handler = ok ? reaction.ok : reaction.fail;
	      var resolve = reaction.resolve;
	      var reject = reaction.reject;
	      var domain = reaction.domain;
	      var result, then, exited;
	      try {
	        if (handler) {
	          if (!ok) {
	            if (promise._h == 2) onHandleUnhandled(promise);
	            promise._h = 1;
	          }
	          if (handler === true) result = value;
	          else {
	            if (domain) domain.enter();
	            result = handler(value); // may throw
	            if (domain) {
	              domain.exit();
	              exited = true;
	            }
	          }
	          if (result === reaction.promise) {
	            reject(TypeError$1('Promise-chain cycle'));
	          } else if (then = isThenable(result)) {
	            then.call(result, resolve, reject);
	          } else resolve(result);
	        } else reject(value);
	      } catch (e) {
	        if (domain && !exited) domain.exit();
	        reject(e);
	      }
	    };
	    while (chain.length > i) run(chain[i++]); // variable length - can't use forEach
	    promise._c = [];
	    promise._n = false;
	    if (isReject && !promise._h) onUnhandled(promise);
	  });
	};
	var onUnhandled = function (promise) {
	  task.call(_global, function () {
	    var value = promise._v;
	    var unhandled = isUnhandled(promise);
	    var result, handler, console;
	    if (unhandled) {
	      result = _perform(function () {
	        if (isNode$1) {
	          process$2.emit('unhandledRejection', value, promise);
	        } else if (handler = _global.onunhandledrejection) {
	          handler({ promise: promise, reason: value });
	        } else if ((console = _global.console) && console.error) {
	          console.error('Unhandled promise rejection', value);
	        }
	      });
	      // Browsers should not trigger `rejectionHandled` event if it was handled here, NodeJS - should
	      promise._h = isNode$1 || isUnhandled(promise) ? 2 : 1;
	    } promise._a = undefined;
	    if (unhandled && result.e) throw result.v;
	  });
	};
	var isUnhandled = function (promise) {
	  return promise._h !== 1 && (promise._a || promise._c).length === 0;
	};
	var onHandleUnhandled = function (promise) {
	  task.call(_global, function () {
	    var handler;
	    if (isNode$1) {
	      process$2.emit('rejectionHandled', promise);
	    } else if (handler = _global.onrejectionhandled) {
	      handler({ promise: promise, reason: promise._v });
	    }
	  });
	};
	var $reject = function (value) {
	  var promise = this;
	  if (promise._d) return;
	  promise._d = true;
	  promise = promise._w || promise; // unwrap
	  promise._v = value;
	  promise._s = 2;
	  if (!promise._a) promise._a = promise._c.slice();
	  notify(promise, true);
	};
	var $resolve = function (value) {
	  var promise = this;
	  var then;
	  if (promise._d) return;
	  promise._d = true;
	  promise = promise._w || promise; // unwrap
	  try {
	    if (promise === value) throw TypeError$1("Promise can't be resolved itself");
	    if (then = isThenable(value)) {
	      microtask(function () {
	        var wrapper = { _w: promise, _d: false }; // wrap
	        try {
	          then.call(value, _ctx($resolve, wrapper, 1), _ctx($reject, wrapper, 1));
	        } catch (e) {
	          $reject.call(wrapper, e);
	        }
	      });
	    } else {
	      promise._v = value;
	      promise._s = 1;
	      notify(promise, false);
	    }
	  } catch (e) {
	    $reject.call({ _w: promise, _d: false }, e); // wrap
	  }
	};

	// constructor polyfill
	if (!USE_NATIVE) {
	  // 25.4.3.1 Promise(executor)
	  $Promise = function Promise(executor) {
	    _anInstance(this, $Promise, PROMISE, '_h');
	    _aFunction(executor);
	    Internal.call(this);
	    try {
	      executor(_ctx($resolve, this, 1), _ctx($reject, this, 1));
	    } catch (err) {
	      $reject.call(this, err);
	    }
	  };
	  // eslint-disable-next-line no-unused-vars
	  Internal = function Promise(executor) {
	    this._c = [];             // <- awaiting reactions
	    this._a = undefined;      // <- checked in isUnhandled reactions
	    this._s = 0;              // <- state
	    this._d = false;          // <- done
	    this._v = undefined;      // <- value
	    this._h = 0;              // <- rejection state, 0 - default, 1 - handled, 2 - unhandled
	    this._n = false;          // <- notify
	  };
	  Internal.prototype = _redefineAll($Promise.prototype, {
	    // 25.4.5.3 Promise.prototype.then(onFulfilled, onRejected)
	    then: function then(onFulfilled, onRejected) {
	      var reaction = newPromiseCapability(_speciesConstructor(this, $Promise));
	      reaction.ok = typeof onFulfilled == 'function' ? onFulfilled : true;
	      reaction.fail = typeof onRejected == 'function' && onRejected;
	      reaction.domain = isNode$1 ? process$2.domain : undefined;
	      this._c.push(reaction);
	      if (this._a) this._a.push(reaction);
	      if (this._s) notify(this, false);
	      return reaction.promise;
	    },
	    // 25.4.5.1 Promise.prototype.catch(onRejected)
	    'catch': function (onRejected) {
	      return this.then(undefined, onRejected);
	    }
	  });
	  OwnPromiseCapability = function () {
	    var promise = new Internal();
	    this.promise = promise;
	    this.resolve = _ctx($resolve, promise, 1);
	    this.reject = _ctx($reject, promise, 1);
	  };
	  _newPromiseCapability.f = newPromiseCapability = function (C) {
	    return C === $Promise || C === Wrapper
	      ? new OwnPromiseCapability(C)
	      : newGenericPromiseCapability(C);
	  };
	}

	_export(_export.G + _export.W + _export.F * !USE_NATIVE, { Promise: $Promise });
	_setToStringTag($Promise, PROMISE);
	_setSpecies(PROMISE);
	Wrapper = _core[PROMISE];

	// statics
	_export(_export.S + _export.F * !USE_NATIVE, PROMISE, {
	  // 25.4.4.5 Promise.reject(r)
	  reject: function reject(r) {
	    var capability = newPromiseCapability(this);
	    var $$reject = capability.reject;
	    $$reject(r);
	    return capability.promise;
	  }
	});
	_export(_export.S + _export.F * ( !USE_NATIVE), PROMISE, {
	  // 25.4.4.6 Promise.resolve(x)
	  resolve: function resolve(x) {
	    return _promiseResolve( this, x);
	  }
	});
	_export(_export.S + _export.F * !(USE_NATIVE && _iterDetect(function (iter) {
	  $Promise.all(iter)['catch'](empty);
	})), PROMISE, {
	  // 25.4.4.1 Promise.all(iterable)
	  all: function all(iterable) {
	    var C = this;
	    var capability = newPromiseCapability(C);
	    var resolve = capability.resolve;
	    var reject = capability.reject;
	    var result = _perform(function () {
	      var values = [];
	      var index = 0;
	      var remaining = 1;
	      _forOf(iterable, false, function (promise) {
	        var $index = index++;
	        var alreadyCalled = false;
	        values.push(undefined);
	        remaining++;
	        C.resolve(promise).then(function (value) {
	          if (alreadyCalled) return;
	          alreadyCalled = true;
	          values[$index] = value;
	          --remaining || resolve(values);
	        }, reject);
	      });
	      --remaining || resolve(values);
	    });
	    if (result.e) reject(result.v);
	    return capability.promise;
	  },
	  // 25.4.4.4 Promise.race(iterable)
	  race: function race(iterable) {
	    var C = this;
	    var capability = newPromiseCapability(C);
	    var reject = capability.reject;
	    var result = _perform(function () {
	      _forOf(iterable, false, function (promise) {
	        C.resolve(promise).then(capability.resolve, reject);
	      });
	    });
	    if (result.e) reject(result.v);
	    return capability.promise;
	  }
	});

	// 22.1.3.31 Array.prototype[@@unscopables]
	var UNSCOPABLES = _wks('unscopables');
	var ArrayProto$1 = Array.prototype;
	if (ArrayProto$1[UNSCOPABLES] == undefined) _hide(ArrayProto$1, UNSCOPABLES, {});
	var _addToUnscopables = function (key) {
	  ArrayProto$1[UNSCOPABLES][key] = true;
	};

	var _iterStep = function (done, value) {
	  return { value: value, done: !!done };
	};

	// fallback for non-array-like ES3 and non-enumerable old V8 strings

	// eslint-disable-next-line no-prototype-builtins
	var _iobject = Object('z').propertyIsEnumerable(0) ? Object : function (it) {
	  return _cof(it) == 'String' ? it.split('') : Object(it);
	};

	// 7.2.1 RequireObjectCoercible(argument)
	var _defined = function (it) {
	  if (it == undefined) throw TypeError("Can't call method on  " + it);
	  return it;
	};

	// to indexed object, toObject with fallback for non-array-like ES3 strings


	var _toIobject = function (it) {
	  return _iobject(_defined(it));
	};

	var max = Math.max;
	var min$1 = Math.min;
	var _toAbsoluteIndex = function (index, length) {
	  index = _toInteger(index);
	  return index < 0 ? max(index + length, 0) : min$1(index, length);
	};

	// false -> Array#indexOf
	// true  -> Array#includes



	var _arrayIncludes = function (IS_INCLUDES) {
	  return function ($this, el, fromIndex) {
	    var O = _toIobject($this);
	    var length = _toLength(O.length);
	    var index = _toAbsoluteIndex(fromIndex, length);
	    var value;
	    // Array#includes uses SameValueZero equality algorithm
	    // eslint-disable-next-line no-self-compare
	    if (IS_INCLUDES && el != el) while (length > index) {
	      value = O[index++];
	      // eslint-disable-next-line no-self-compare
	      if (value != value) return true;
	    // Array#indexOf ignores holes, Array#includes - not
	    } else for (;length > index; index++) if (IS_INCLUDES || index in O) {
	      if (O[index] === el) return IS_INCLUDES || index || 0;
	    } return !IS_INCLUDES && -1;
	  };
	};

	var shared = _shared('keys');

	var _sharedKey = function (key) {
	  return shared[key] || (shared[key] = _uid(key));
	};

	var arrayIndexOf = _arrayIncludes(false);
	var IE_PROTO = _sharedKey('IE_PROTO');

	var _objectKeysInternal = function (object, names) {
	  var O = _toIobject(object);
	  var i = 0;
	  var result = [];
	  var key;
	  for (key in O) if (key != IE_PROTO) _has(O, key) && result.push(key);
	  // Don't enum bug & hidden keys
	  while (names.length > i) if (_has(O, key = names[i++])) {
	    ~arrayIndexOf(result, key) || result.push(key);
	  }
	  return result;
	};

	// IE 8- don't enum bug keys
	var _enumBugKeys = (
	  'constructor,hasOwnProperty,isPrototypeOf,propertyIsEnumerable,toLocaleString,toString,valueOf'
	).split(',');

	// 19.1.2.14 / 15.2.3.14 Object.keys(O)



	var _objectKeys = Object.keys || function keys(O) {
	  return _objectKeysInternal(O, _enumBugKeys);
	};

	var _objectDps = _descriptors ? Object.defineProperties : function defineProperties(O, Properties) {
	  _anObject(O);
	  var keys = _objectKeys(Properties);
	  var length = keys.length;
	  var i = 0;
	  var P;
	  while (length > i) _objectDp.f(O, P = keys[i++], Properties[P]);
	  return O;
	};

	// 19.1.2.2 / 15.2.3.5 Object.create(O [, Properties])



	var IE_PROTO$1 = _sharedKey('IE_PROTO');
	var Empty = function () { /* empty */ };
	var PROTOTYPE$1 = 'prototype';

	// Create object with fake `null` prototype: use iframe Object with cleared prototype
	var createDict = function () {
	  // Thrash, waste and sodomy: IE GC bug
	  var iframe = _domCreate('iframe');
	  var i = _enumBugKeys.length;
	  var lt = '<';
	  var gt = '>';
	  var iframeDocument;
	  iframe.style.display = 'none';
	  _html.appendChild(iframe);
	  iframe.src = 'javascript:'; // eslint-disable-line no-script-url
	  // createDict = iframe.contentWindow.Object;
	  // html.removeChild(iframe);
	  iframeDocument = iframe.contentWindow.document;
	  iframeDocument.open();
	  iframeDocument.write(lt + 'script' + gt + 'document.F=Object' + lt + '/script' + gt);
	  iframeDocument.close();
	  createDict = iframeDocument.F;
	  while (i--) delete createDict[PROTOTYPE$1][_enumBugKeys[i]];
	  return createDict();
	};

	var _objectCreate = Object.create || function create(O, Properties) {
	  var result;
	  if (O !== null) {
	    Empty[PROTOTYPE$1] = _anObject(O);
	    result = new Empty();
	    Empty[PROTOTYPE$1] = null;
	    // add "__proto__" for Object.getPrototypeOf polyfill
	    result[IE_PROTO$1] = O;
	  } else result = createDict();
	  return Properties === undefined ? result : _objectDps(result, Properties);
	};

	var IteratorPrototype = {};

	// 25.1.2.1.1 %IteratorPrototype%[@@iterator]()
	_hide(IteratorPrototype, _wks('iterator'), function () { return this; });

	var _iterCreate = function (Constructor, NAME, next) {
	  Constructor.prototype = _objectCreate(IteratorPrototype, { next: _propertyDesc(1, next) });
	  _setToStringTag(Constructor, NAME + ' Iterator');
	};

	// 7.1.13 ToObject(argument)

	var _toObject = function (it) {
	  return Object(_defined(it));
	};

	// 19.1.2.9 / 15.2.3.2 Object.getPrototypeOf(O)


	var IE_PROTO$2 = _sharedKey('IE_PROTO');
	var ObjectProto = Object.prototype;

	var _objectGpo = Object.getPrototypeOf || function (O) {
	  O = _toObject(O);
	  if (_has(O, IE_PROTO$2)) return O[IE_PROTO$2];
	  if (typeof O.constructor == 'function' && O instanceof O.constructor) {
	    return O.constructor.prototype;
	  } return O instanceof Object ? ObjectProto : null;
	};

	var ITERATOR$3 = _wks('iterator');
	var BUGGY = !([].keys && 'next' in [].keys()); // Safari has buggy iterators w/o `next`
	var FF_ITERATOR = '@@iterator';
	var KEYS = 'keys';
	var VALUES = 'values';

	var returnThis = function () { return this; };

	var _iterDefine = function (Base, NAME, Constructor, next, DEFAULT, IS_SET, FORCED) {
	  _iterCreate(Constructor, NAME, next);
	  var getMethod = function (kind) {
	    if (!BUGGY && kind in proto) return proto[kind];
	    switch (kind) {
	      case KEYS: return function keys() { return new Constructor(this, kind); };
	      case VALUES: return function values() { return new Constructor(this, kind); };
	    } return function entries() { return new Constructor(this, kind); };
	  };
	  var TAG = NAME + ' Iterator';
	  var DEF_VALUES = DEFAULT == VALUES;
	  var VALUES_BUG = false;
	  var proto = Base.prototype;
	  var $native = proto[ITERATOR$3] || proto[FF_ITERATOR] || DEFAULT && proto[DEFAULT];
	  var $default = $native || getMethod(DEFAULT);
	  var $entries = DEFAULT ? !DEF_VALUES ? $default : getMethod('entries') : undefined;
	  var $anyNative = NAME == 'Array' ? proto.entries || $native : $native;
	  var methods, key, IteratorPrototype;
	  // Fix native
	  if ($anyNative) {
	    IteratorPrototype = _objectGpo($anyNative.call(new Base()));
	    if (IteratorPrototype !== Object.prototype && IteratorPrototype.next) {
	      // Set @@toStringTag to native iterators
	      _setToStringTag(IteratorPrototype, TAG, true);
	      // fix for some old engines
	      if ( typeof IteratorPrototype[ITERATOR$3] != 'function') _hide(IteratorPrototype, ITERATOR$3, returnThis);
	    }
	  }
	  // fix Array#{values, @@iterator}.name in V8 / FF
	  if (DEF_VALUES && $native && $native.name !== VALUES) {
	    VALUES_BUG = true;
	    $default = function values() { return $native.call(this); };
	  }
	  // Define iterator
	  if ( (BUGGY || VALUES_BUG || !proto[ITERATOR$3])) {
	    _hide(proto, ITERATOR$3, $default);
	  }
	  // Plug for library
	  _iterators[NAME] = $default;
	  _iterators[TAG] = returnThis;
	  if (DEFAULT) {
	    methods = {
	      values: DEF_VALUES ? $default : getMethod(VALUES),
	      keys: IS_SET ? $default : getMethod(KEYS),
	      entries: $entries
	    };
	    if (FORCED) for (key in methods) {
	      if (!(key in proto)) _redefine(proto, key, methods[key]);
	    } else _export(_export.P + _export.F * (BUGGY || VALUES_BUG), NAME, methods);
	  }
	  return methods;
	};

	// 22.1.3.4 Array.prototype.entries()
	// 22.1.3.13 Array.prototype.keys()
	// 22.1.3.29 Array.prototype.values()
	// 22.1.3.30 Array.prototype[@@iterator]()
	var es6_array_iterator = _iterDefine(Array, 'Array', function (iterated, kind) {
	  this._t = _toIobject(iterated); // target
	  this._i = 0;                   // next index
	  this._k = kind;                // kind
	// 22.1.5.2.1 %ArrayIteratorPrototype%.next()
	}, function () {
	  var O = this._t;
	  var kind = this._k;
	  var index = this._i++;
	  if (!O || index >= O.length) {
	    this._t = undefined;
	    return _iterStep(1);
	  }
	  if (kind == 'keys') return _iterStep(0, index);
	  if (kind == 'values') return _iterStep(0, O[index]);
	  return _iterStep(0, [index, O[index]]);
	}, 'values');

	// argumentsList[@@iterator] is %ArrayProto_values% (9.4.4.6, 9.4.4.7)
	_iterators.Arguments = _iterators.Array;

	_addToUnscopables('keys');
	_addToUnscopables('values');
	_addToUnscopables('entries');

	var ITERATOR$4 = _wks('iterator');
	var TO_STRING_TAG = _wks('toStringTag');
	var ArrayValues = _iterators.Array;

	var DOMIterables = {
	  CSSRuleList: true, // TODO: Not spec compliant, should be false.
	  CSSStyleDeclaration: false,
	  CSSValueList: false,
	  ClientRectList: false,
	  DOMRectList: false,
	  DOMStringList: false,
	  DOMTokenList: true,
	  DataTransferItemList: false,
	  FileList: false,
	  HTMLAllCollection: false,
	  HTMLCollection: false,
	  HTMLFormElement: false,
	  HTMLSelectElement: false,
	  MediaList: true, // TODO: Not spec compliant, should be false.
	  MimeTypeArray: false,
	  NamedNodeMap: false,
	  NodeList: true,
	  PaintRequestList: false,
	  Plugin: false,
	  PluginArray: false,
	  SVGLengthList: false,
	  SVGNumberList: false,
	  SVGPathSegList: false,
	  SVGPointList: false,
	  SVGStringList: false,
	  SVGTransformList: false,
	  SourceBufferList: false,
	  StyleSheetList: true, // TODO: Not spec compliant, should be false.
	  TextTrackCueList: false,
	  TextTrackList: false,
	  TouchList: false
	};

	for (var collections = _objectKeys(DOMIterables), i = 0; i < collections.length; i++) {
	  var NAME = collections[i];
	  var explicit = DOMIterables[NAME];
	  var Collection = _global[NAME];
	  var proto = Collection && Collection.prototype;
	  var key;
	  if (proto) {
	    if (!proto[ITERATOR$4]) _hide(proto, ITERATOR$4, ArrayValues);
	    if (!proto[TO_STRING_TAG]) _hide(proto, TO_STRING_TAG, NAME);
	    _iterators[NAME] = ArrayValues;
	    if (explicit) for (key in es6_array_iterator) if (!proto[key]) _redefine(proto, key, es6_array_iterator[key], true);
	  }
	}

	// 19.1.3.6 Object.prototype.toString()

	var test = {};
	test[_wks('toStringTag')] = 'z';
	if (test + '' != '[object z]') {
	  _redefine(Object.prototype, 'toString', function toString() {
	    return '[object ' + _classof(this) + ']';
	  }, true);
	}

	// true  -> String#at
	// false -> String#codePointAt
	var _stringAt = function (TO_STRING) {
	  return function (that, pos) {
	    var s = String(_defined(that));
	    var i = _toInteger(pos);
	    var l = s.length;
	    var a, b;
	    if (i < 0 || i >= l) return TO_STRING ? '' : undefined;
	    a = s.charCodeAt(i);
	    return a < 0xd800 || a > 0xdbff || i + 1 === l || (b = s.charCodeAt(i + 1)) < 0xdc00 || b > 0xdfff
	      ? TO_STRING ? s.charAt(i) : a
	      : TO_STRING ? s.slice(i, i + 2) : (a - 0xd800 << 10) + (b - 0xdc00) + 0x10000;
	  };
	};

	var $at = _stringAt(true);

	// 21.1.3.27 String.prototype[@@iterator]()
	_iterDefine(String, 'String', function (iterated) {
	  this._t = String(iterated); // target
	  this._i = 0;                // next index
	// 21.1.5.2.1 %StringIteratorPrototype%.next()
	}, function () {
	  var O = this._t;
	  var index = this._i;
	  var point;
	  if (index >= O.length) return { value: undefined, done: true };
	  point = $at(O, index);
	  this._i += point.length;
	  return { value: point, done: false };
	});

	function asyncGeneratorStep(gen, resolve, reject, _next, _throw, key, arg) {
	  try {
	    var info = gen[key](arg);
	    var value = info.value;
	  } catch (error) {
	    reject(error);
	    return;
	  }

	  if (info.done) {
	    resolve(value);
	  } else {
	    Promise.resolve(value).then(_next, _throw);
	  }
	}

	function _asyncToGenerator(fn) {
	  return function () {
	    var self = this,
	        args = arguments;
	    return new Promise(function (resolve, reject) {
	      var gen = fn.apply(self, args);

	      function _next(value) {
	        asyncGeneratorStep(gen, resolve, reject, _next, _throw, "next", value);
	      }

	      function _throw(err) {
	        asyncGeneratorStep(gen, resolve, reject, _next, _throw, "throw", err);
	      }

	      _next(undefined);
	    });
	  };
	}

	function _classCallCheck(instance, Constructor) {
	  if (!(instance instanceof Constructor)) {
	    throw new TypeError("Cannot call a class as a function");
	  }
	}

	function _defineProperties(target, props) {
	  for (var i = 0; i < props.length; i++) {
	    var descriptor = props[i];
	    descriptor.enumerable = descriptor.enumerable || false;
	    descriptor.configurable = true;
	    if ("value" in descriptor) descriptor.writable = true;
	    Object.defineProperty(target, descriptor.key, descriptor);
	  }
	}

	function _createClass(Constructor, protoProps, staticProps) {
	  if (protoProps) _defineProperties(Constructor.prototype, protoProps);
	  if (staticProps) _defineProperties(Constructor, staticProps);
	  return Constructor;
	}

	function _defineProperty(obj, key, value) {
	  if (key in obj) {
	    Object.defineProperty(obj, key, {
	      value: value,
	      enumerable: true,
	      configurable: true,
	      writable: true
	    });
	  } else {
	    obj[key] = value;
	  }

	  return obj;
	}

	function _objectSpread2(target) {
	  for (var i = 1; i < arguments.length; i++) {
	    if (i % 2) {
	      var source = arguments[i] != null ? arguments[i] : {};
	      var ownKeys = Object.keys(source);

	      if (typeof Object.getOwnPropertySymbols === 'function') {
	        ownKeys = ownKeys.concat(Object.getOwnPropertySymbols(source).filter(function (sym) {
	          return Object.getOwnPropertyDescriptor(source, sym).enumerable;
	        }));
	      }

	      ownKeys.forEach(function (key) {
	        _defineProperty(target, key, source[key]);
	      });
	    } else {
	      Object.defineProperties(target, Object.getOwnPropertyDescriptors(arguments[i]));
	    }
	  }

	  return target;
	}

	var at = _stringAt(true);

	 // `AdvanceStringIndex` abstract operation
	// https://tc39.github.io/ecma262/#sec-advancestringindex
	var _advanceStringIndex = function (S, index, unicode) {
	  return index + (unicode ? at(S, index).length : 1);
	};

	var builtinExec = RegExp.prototype.exec;

	 // `RegExpExec` abstract operation
	// https://tc39.github.io/ecma262/#sec-regexpexec
	var _regexpExecAbstract = function (R, S) {
	  var exec = R.exec;
	  if (typeof exec === 'function') {
	    var result = exec.call(R, S);
	    if (typeof result !== 'object') {
	      throw new TypeError('RegExp exec method returned something other than an Object or null');
	    }
	    return result;
	  }
	  if (_classof(R) !== 'RegExp') {
	    throw new TypeError('RegExp#exec called on incompatible receiver');
	  }
	  return builtinExec.call(R, S);
	};

	var nativeExec = RegExp.prototype.exec;
	// This always refers to the native implementation, because the
	// String#replace polyfill uses ./fix-regexp-well-known-symbol-logic.js,
	// which loads this file before patching the method.
	var nativeReplace = String.prototype.replace;

	var patchedExec = nativeExec;

	var LAST_INDEX = 'lastIndex';

	var UPDATES_LAST_INDEX_WRONG = (function () {
	  var re1 = /a/,
	      re2 = /b*/g;
	  nativeExec.call(re1, 'a');
	  nativeExec.call(re2, 'a');
	  return re1[LAST_INDEX] !== 0 || re2[LAST_INDEX] !== 0;
	})();

	// nonparticipating capturing group, copied from es5-shim's String#split patch.
	var NPCG_INCLUDED = /()??/.exec('')[1] !== undefined;

	var PATCH = UPDATES_LAST_INDEX_WRONG || NPCG_INCLUDED;

	if (PATCH) {
	  patchedExec = function exec(str) {
	    var re = this;
	    var lastIndex, reCopy, match, i;

	    if (NPCG_INCLUDED) {
	      reCopy = new RegExp('^' + re.source + '$(?!\\s)', _flags.call(re));
	    }
	    if (UPDATES_LAST_INDEX_WRONG) lastIndex = re[LAST_INDEX];

	    match = nativeExec.call(re, str);

	    if (UPDATES_LAST_INDEX_WRONG && match) {
	      re[LAST_INDEX] = re.global ? match.index + match[0].length : lastIndex;
	    }
	    if (NPCG_INCLUDED && match && match.length > 1) {
	      // Fix browsers whose `exec` methods don't consistently return `undefined`
	      // for NPCG, like IE8. NOTE: This doesn' work for /(.?)?/
	      // eslint-disable-next-line no-loop-func
	      nativeReplace.call(match[0], reCopy, function () {
	        for (i = 1; i < arguments.length - 2; i++) {
	          if (arguments[i] === undefined) match[i] = undefined;
	        }
	      });
	    }

	    return match;
	  };
	}

	var _regexpExec = patchedExec;

	_export({
	  target: 'RegExp',
	  proto: true,
	  forced: _regexpExec !== /./.exec
	}, {
	  exec: _regexpExec
	});

	var SPECIES$2 = _wks('species');

	var REPLACE_SUPPORTS_NAMED_GROUPS = !_fails(function () {
	  // #replace needs built-in support for named groups.
	  // #match works fine because it just return the exec results, even if it has
	  // a "grops" property.
	  var re = /./;
	  re.exec = function () {
	    var result = [];
	    result.groups = { a: '7' };
	    return result;
	  };
	  return ''.replace(re, '$<a>') !== '7';
	});

	var SPLIT_WORKS_WITH_OVERWRITTEN_EXEC = (function () {
	  // Chrome 51 has a buggy "split" implementation when RegExp#exec !== nativeExec
	  var re = /(?:)/;
	  var originalExec = re.exec;
	  re.exec = function () { return originalExec.apply(this, arguments); };
	  var result = 'ab'.split(re);
	  return result.length === 2 && result[0] === 'a' && result[1] === 'b';
	})();

	var _fixReWks = function (KEY, length, exec) {
	  var SYMBOL = _wks(KEY);

	  var DELEGATES_TO_SYMBOL = !_fails(function () {
	    // String methods call symbol-named RegEp methods
	    var O = {};
	    O[SYMBOL] = function () { return 7; };
	    return ''[KEY](O) != 7;
	  });

	  var DELEGATES_TO_EXEC = DELEGATES_TO_SYMBOL ? !_fails(function () {
	    // Symbol-named RegExp methods call .exec
	    var execCalled = false;
	    var re = /a/;
	    re.exec = function () { execCalled = true; return null; };
	    if (KEY === 'split') {
	      // RegExp[@@split] doesn't call the regex's exec method, but first creates
	      // a new one. We need to return the patched regex when creating the new one.
	      re.constructor = {};
	      re.constructor[SPECIES$2] = function () { return re; };
	    }
	    re[SYMBOL]('');
	    return !execCalled;
	  }) : undefined;

	  if (
	    !DELEGATES_TO_SYMBOL ||
	    !DELEGATES_TO_EXEC ||
	    (KEY === 'replace' && !REPLACE_SUPPORTS_NAMED_GROUPS) ||
	    (KEY === 'split' && !SPLIT_WORKS_WITH_OVERWRITTEN_EXEC)
	  ) {
	    var nativeRegExpMethod = /./[SYMBOL];
	    var fns = exec(
	      _defined,
	      SYMBOL,
	      ''[KEY],
	      function maybeCallNative(nativeMethod, regexp, str, arg2, forceStringMethod) {
	        if (regexp.exec === _regexpExec) {
	          if (DELEGATES_TO_SYMBOL && !forceStringMethod) {
	            // The native String method already delegates to @@method (this
	            // polyfilled function), leasing to infinite recursion.
	            // We avoid it by directly calling the native @@method method.
	            return { done: true, value: nativeRegExpMethod.call(regexp, str, arg2) };
	          }
	          return { done: true, value: nativeMethod.call(str, regexp, arg2) };
	        }
	        return { done: false };
	      }
	    );
	    var strfn = fns[0];
	    var rxfn = fns[1];

	    _redefine(String.prototype, KEY, strfn);
	    _hide(RegExp.prototype, SYMBOL, length == 2
	      // 21.2.5.8 RegExp.prototype[@@replace](string, replaceValue)
	      // 21.2.5.11 RegExp.prototype[@@split](string, limit)
	      ? function (string, arg) { return rxfn.call(string, this, arg); }
	      // 21.2.5.6 RegExp.prototype[@@match](string)
	      // 21.2.5.9 RegExp.prototype[@@search](string)
	      : function (string) { return rxfn.call(string, this); }
	    );
	  }
	};

	// @@match logic
	_fixReWks('match', 1, function (defined, MATCH, $match, maybeCallNative) {
	  return [
	    // `String.prototype.match` method
	    // https://tc39.github.io/ecma262/#sec-string.prototype.match
	    function match(regexp) {
	      var O = defined(this);
	      var fn = regexp == undefined ? undefined : regexp[MATCH];
	      return fn !== undefined ? fn.call(regexp, O) : new RegExp(regexp)[MATCH](String(O));
	    },
	    // `RegExp.prototype[@@match]` method
	    // https://tc39.github.io/ecma262/#sec-regexp.prototype-@@match
	    function (regexp) {
	      var res = maybeCallNative($match, regexp, this);
	      if (res.done) return res.value;
	      var rx = _anObject(regexp);
	      var S = String(this);
	      if (!rx.global) return _regexpExecAbstract(rx, S);
	      var fullUnicode = rx.unicode;
	      rx.lastIndex = 0;
	      var A = [];
	      var n = 0;
	      var result;
	      while ((result = _regexpExecAbstract(rx, S)) !== null) {
	        var matchStr = String(result[0]);
	        A[n] = matchStr;
	        if (matchStr === '') rx.lastIndex = _advanceStringIndex(S, _toLength(rx.lastIndex), fullUnicode);
	        n++;
	      }
	      return n === 0 ? null : A;
	    }
	  ];
	});

	var SPECIES$3 = _wks('species');

	var _arraySpeciesConstructor = function (original) {
	  var C;
	  if (_isArray(original)) {
	    C = original.constructor;
	    // cross-realm fallback
	    if (typeof C == 'function' && (C === Array || _isArray(C.prototype))) C = undefined;
	    if (_isObject(C)) {
	      C = C[SPECIES$3];
	      if (C === null) C = undefined;
	    }
	  } return C === undefined ? Array : C;
	};

	// 9.4.2.3 ArraySpeciesCreate(originalArray, length)


	var _arraySpeciesCreate = function (original, length) {
	  return new (_arraySpeciesConstructor(original))(length);
	};

	// 0 -> Array#forEach
	// 1 -> Array#map
	// 2 -> Array#filter
	// 3 -> Array#some
	// 4 -> Array#every
	// 5 -> Array#find
	// 6 -> Array#findIndex





	var _arrayMethods = function (TYPE, $create) {
	  var IS_MAP = TYPE == 1;
	  var IS_FILTER = TYPE == 2;
	  var IS_SOME = TYPE == 3;
	  var IS_EVERY = TYPE == 4;
	  var IS_FIND_INDEX = TYPE == 6;
	  var NO_HOLES = TYPE == 5 || IS_FIND_INDEX;
	  var create = $create || _arraySpeciesCreate;
	  return function ($this, callbackfn, that) {
	    var O = _toObject($this);
	    var self = _iobject(O);
	    var f = _ctx(callbackfn, that, 3);
	    var length = _toLength(self.length);
	    var index = 0;
	    var result = IS_MAP ? create($this, length) : IS_FILTER ? create($this, 0) : undefined;
	    var val, res;
	    for (;length > index; index++) if (NO_HOLES || index in self) {
	      val = self[index];
	      res = f(val, index, O);
	      if (TYPE) {
	        if (IS_MAP) result[index] = res;   // map
	        else if (res) switch (TYPE) {
	          case 3: return true;             // some
	          case 5: return val;              // find
	          case 6: return index;            // findIndex
	          case 2: result.push(val);        // filter
	        } else if (IS_EVERY) return false; // every
	      }
	    }
	    return IS_FIND_INDEX ? -1 : IS_SOME || IS_EVERY ? IS_EVERY : result;
	  };
	};

	var _strictMethod = function (method, arg) {
	  return !!method && _fails(function () {
	    // eslint-disable-next-line no-useless-call
	    arg ? method.call(null, function () { /* empty */ }, 1) : method.call(null);
	  });
	};

	var $map = _arrayMethods(1);

	_export(_export.P + _export.F * !_strictMethod([].map, true), 'Array', {
	  // 22.1.3.15 / 15.4.4.19 Array.prototype.map(callbackfn [, thisArg])
	  map: function map(callbackfn /* , thisArg */) {
	    return $map(this, callbackfn, arguments[1]);
	  }
	});

	var $forEach = _arrayMethods(0);
	var STRICT = _strictMethod([].forEach, true);

	_export(_export.P + _export.F * !STRICT, 'Array', {
	  // 22.1.3.10 / 15.4.4.18 Array.prototype.forEach(callbackfn [, thisArg])
	  forEach: function forEach(callbackfn /* , thisArg */) {
	    return $forEach(this, callbackfn, arguments[1]);
	  }
	});

	var runtime = createCommonjsModule(function (module) {
	  /**
	   * Copyright (c) 2014, Facebook, Inc.
	   * All rights reserved.
	   *
	   * This source code is licensed under the BSD-style license found in the
	   * https://raw.github.com/facebook/regenerator/master/LICENSE file. An
	   * additional grant of patent rights can be found in the PATENTS file in
	   * the same directory.
	   */
	  !function (global) {

	    var Op = Object.prototype;
	    var hasOwn = Op.hasOwnProperty;
	    var undefined$1; // More compressible than void 0.

	    var $Symbol = typeof Symbol === "function" ? Symbol : {};
	    var iteratorSymbol = $Symbol.iterator || "@@iterator";
	    var asyncIteratorSymbol = $Symbol.asyncIterator || "@@asyncIterator";
	    var toStringTagSymbol = $Symbol.toStringTag || "@@toStringTag";
	    var runtime = global.regeneratorRuntime;

	    if (runtime) {
	      {
	        // If regeneratorRuntime is defined globally and we're in a module,
	        // make the exports object identical to regeneratorRuntime.
	        module.exports = runtime;
	      } // Don't bother evaluating the rest of this file if the runtime was
	      // already defined globally.


	      return;
	    } // Define the runtime globally (as expected by generated code) as either
	    // module.exports (if we're in a module) or a new, empty object.


	    runtime = global.regeneratorRuntime =  module.exports ;

	    function wrap(innerFn, outerFn, self, tryLocsList) {
	      // If outerFn provided and outerFn.prototype is a Generator, then outerFn.prototype instanceof Generator.
	      var protoGenerator = outerFn && outerFn.prototype instanceof Generator ? outerFn : Generator;
	      var generator = Object.create(protoGenerator.prototype);
	      var context = new Context(tryLocsList || []); // The ._invoke method unifies the implementations of the .next,
	      // .throw, and .return methods.

	      generator._invoke = makeInvokeMethod(innerFn, self, context);
	      return generator;
	    }

	    runtime.wrap = wrap; // Try/catch helper to minimize deoptimizations. Returns a completion
	    // record like context.tryEntries[i].completion. This interface could
	    // have been (and was previously) designed to take a closure to be
	    // invoked without arguments, but in all the cases we care about we
	    // already have an existing method we want to call, so there's no need
	    // to create a new function object. We can even get away with assuming
	    // the method takes exactly one argument, since that happens to be true
	    // in every case, so we don't have to touch the arguments object. The
	    // only additional allocation required is the completion record, which
	    // has a stable shape and so hopefully should be cheap to allocate.

	    function tryCatch(fn, obj, arg) {
	      try {
	        return {
	          type: "normal",
	          arg: fn.call(obj, arg)
	        };
	      } catch (err) {
	        return {
	          type: "throw",
	          arg: err
	        };
	      }
	    }

	    var GenStateSuspendedStart = "suspendedStart";
	    var GenStateSuspendedYield = "suspendedYield";
	    var GenStateExecuting = "executing";
	    var GenStateCompleted = "completed"; // Returning this object from the innerFn has the same effect as
	    // breaking out of the dispatch switch statement.

	    var ContinueSentinel = {}; // Dummy constructor functions that we use as the .constructor and
	    // .constructor.prototype properties for functions that return Generator
	    // objects. For full spec compliance, you may wish to configure your
	    // minifier not to mangle the names of these two functions.

	    function Generator() {}

	    function GeneratorFunction() {}

	    function GeneratorFunctionPrototype() {} // This is a polyfill for %IteratorPrototype% for environments that
	    // don't natively support it.


	    var IteratorPrototype = {};

	    IteratorPrototype[iteratorSymbol] = function () {
	      return this;
	    };

	    var getProto = Object.getPrototypeOf;
	    var NativeIteratorPrototype = getProto && getProto(getProto(values([])));

	    if (NativeIteratorPrototype && NativeIteratorPrototype !== Op && hasOwn.call(NativeIteratorPrototype, iteratorSymbol)) {
	      // This environment has a native %IteratorPrototype%; use it instead
	      // of the polyfill.
	      IteratorPrototype = NativeIteratorPrototype;
	    }

	    var Gp = GeneratorFunctionPrototype.prototype = Generator.prototype = Object.create(IteratorPrototype);
	    GeneratorFunction.prototype = Gp.constructor = GeneratorFunctionPrototype;
	    GeneratorFunctionPrototype.constructor = GeneratorFunction;
	    GeneratorFunctionPrototype[toStringTagSymbol] = GeneratorFunction.displayName = "GeneratorFunction"; // Helper for defining the .next, .throw, and .return methods of the
	    // Iterator interface in terms of a single ._invoke method.

	    function defineIteratorMethods(prototype) {
	      ["next", "throw", "return"].forEach(function (method) {
	        prototype[method] = function (arg) {
	          return this._invoke(method, arg);
	        };
	      });
	    }

	    runtime.isGeneratorFunction = function (genFun) {
	      var ctor = typeof genFun === "function" && genFun.constructor;
	      return ctor ? ctor === GeneratorFunction || // For the native GeneratorFunction constructor, the best we can
	      // do is to check its .name property.
	      (ctor.displayName || ctor.name) === "GeneratorFunction" : false;
	    };

	    runtime.mark = function (genFun) {
	      if (Object.setPrototypeOf) {
	        Object.setPrototypeOf(genFun, GeneratorFunctionPrototype);
	      } else {
	        genFun.__proto__ = GeneratorFunctionPrototype;

	        if (!(toStringTagSymbol in genFun)) {
	          genFun[toStringTagSymbol] = "GeneratorFunction";
	        }
	      }

	      genFun.prototype = Object.create(Gp);
	      return genFun;
	    }; // Within the body of any async function, `await x` is transformed to
	    // `yield regeneratorRuntime.awrap(x)`, so that the runtime can test
	    // `hasOwn.call(value, "__await")` to determine if the yielded value is
	    // meant to be awaited.


	    runtime.awrap = function (arg) {
	      return {
	        __await: arg
	      };
	    };

	    function AsyncIterator(generator) {
	      function invoke(method, arg, resolve, reject) {
	        var record = tryCatch(generator[method], generator, arg);

	        if (record.type === "throw") {
	          reject(record.arg);
	        } else {
	          var result = record.arg;
	          var value = result.value;

	          if (value && typeof value === "object" && hasOwn.call(value, "__await")) {
	            return Promise.resolve(value.__await).then(function (value) {
	              invoke("next", value, resolve, reject);
	            }, function (err) {
	              invoke("throw", err, resolve, reject);
	            });
	          }

	          return Promise.resolve(value).then(function (unwrapped) {
	            // When a yielded Promise is resolved, its final value becomes
	            // the .value of the Promise<{value,done}> result for the
	            // current iteration. If the Promise is rejected, however, the
	            // result for this iteration will be rejected with the same
	            // reason. Note that rejections of yielded Promises are not
	            // thrown back into the generator function, as is the case
	            // when an awaited Promise is rejected. This difference in
	            // behavior between yield and await is important, because it
	            // allows the consumer to decide what to do with the yielded
	            // rejection (swallow it and continue, manually .throw it back
	            // into the generator, abandon iteration, whatever). With
	            // await, by contrast, there is no opportunity to examine the
	            // rejection reason outside the generator function, so the
	            // only option is to throw it from the await expression, and
	            // let the generator function handle the exception.
	            result.value = unwrapped;
	            resolve(result);
	          }, reject);
	        }
	      }

	      var previousPromise;

	      function enqueue(method, arg) {
	        function callInvokeWithMethodAndArg() {
	          return new Promise(function (resolve, reject) {
	            invoke(method, arg, resolve, reject);
	          });
	        }

	        return previousPromise = // If enqueue has been called before, then we want to wait until
	        // all previous Promises have been resolved before calling invoke,
	        // so that results are always delivered in the correct order. If
	        // enqueue has not been called before, then it is important to
	        // call invoke immediately, without waiting on a callback to fire,
	        // so that the async generator function has the opportunity to do
	        // any necessary setup in a predictable way. This predictability
	        // is why the Promise constructor synchronously invokes its
	        // executor callback, and why async functions synchronously
	        // execute code before the first await. Since we implement simple
	        // async functions in terms of async generators, it is especially
	        // important to get this right, even though it requires care.
	        previousPromise ? previousPromise.then(callInvokeWithMethodAndArg, // Avoid propagating failures to Promises returned by later
	        // invocations of the iterator.
	        callInvokeWithMethodAndArg) : callInvokeWithMethodAndArg();
	      } // Define the unified helper method that is used to implement .next,
	      // .throw, and .return (see defineIteratorMethods).


	      this._invoke = enqueue;
	    }

	    defineIteratorMethods(AsyncIterator.prototype);

	    AsyncIterator.prototype[asyncIteratorSymbol] = function () {
	      return this;
	    };

	    runtime.AsyncIterator = AsyncIterator; // Note that simple async functions are implemented on top of
	    // AsyncIterator objects; they just return a Promise for the value of
	    // the final result produced by the iterator.

	    runtime.async = function (innerFn, outerFn, self, tryLocsList) {
	      var iter = new AsyncIterator(wrap(innerFn, outerFn, self, tryLocsList));
	      return runtime.isGeneratorFunction(outerFn) ? iter // If outerFn is a generator, return the full iterator.
	      : iter.next().then(function (result) {
	        return result.done ? result.value : iter.next();
	      });
	    };

	    function makeInvokeMethod(innerFn, self, context) {
	      var state = GenStateSuspendedStart;
	      return function invoke(method, arg) {
	        if (state === GenStateExecuting) {
	          throw new Error("Generator is already running");
	        }

	        if (state === GenStateCompleted) {
	          if (method === "throw") {
	            throw arg;
	          } // Be forgiving, per 25.3.3.3.3 of the spec:
	          // https://people.mozilla.org/~jorendorff/es6-draft.html#sec-generatorresume


	          return doneResult();
	        }

	        context.method = method;
	        context.arg = arg;

	        while (true) {
	          var delegate = context.delegate;

	          if (delegate) {
	            var delegateResult = maybeInvokeDelegate(delegate, context);

	            if (delegateResult) {
	              if (delegateResult === ContinueSentinel) continue;
	              return delegateResult;
	            }
	          }

	          if (context.method === "next") {
	            // Setting context._sent for legacy support of Babel's
	            // function.sent implementation.
	            context.sent = context._sent = context.arg;
	          } else if (context.method === "throw") {
	            if (state === GenStateSuspendedStart) {
	              state = GenStateCompleted;
	              throw context.arg;
	            }

	            context.dispatchException(context.arg);
	          } else if (context.method === "return") {
	            context.abrupt("return", context.arg);
	          }

	          state = GenStateExecuting;
	          var record = tryCatch(innerFn, self, context);

	          if (record.type === "normal") {
	            // If an exception is thrown from innerFn, we leave state ===
	            // GenStateExecuting and loop back for another invocation.
	            state = context.done ? GenStateCompleted : GenStateSuspendedYield;

	            if (record.arg === ContinueSentinel) {
	              continue;
	            }

	            return {
	              value: record.arg,
	              done: context.done
	            };
	          } else if (record.type === "throw") {
	            state = GenStateCompleted; // Dispatch the exception by looping back around to the
	            // context.dispatchException(context.arg) call above.

	            context.method = "throw";
	            context.arg = record.arg;
	          }
	        }
	      };
	    } // Call delegate.iterator[context.method](context.arg) and handle the
	    // result, either by returning a { value, done } result from the
	    // delegate iterator, or by modifying context.method and context.arg,
	    // setting context.delegate to null, and returning the ContinueSentinel.


	    function maybeInvokeDelegate(delegate, context) {
	      var method = delegate.iterator[context.method];

	      if (method === undefined$1) {
	        // A .throw or .return when the delegate iterator has no .throw
	        // method always terminates the yield* loop.
	        context.delegate = null;

	        if (context.method === "throw") {
	          if (delegate.iterator.return) {
	            // If the delegate iterator has a return method, give it a
	            // chance to clean up.
	            context.method = "return";
	            context.arg = undefined$1;
	            maybeInvokeDelegate(delegate, context);

	            if (context.method === "throw") {
	              // If maybeInvokeDelegate(context) changed context.method from
	              // "return" to "throw", let that override the TypeError below.
	              return ContinueSentinel;
	            }
	          }

	          context.method = "throw";
	          context.arg = new TypeError("The iterator does not provide a 'throw' method");
	        }

	        return ContinueSentinel;
	      }

	      var record = tryCatch(method, delegate.iterator, context.arg);

	      if (record.type === "throw") {
	        context.method = "throw";
	        context.arg = record.arg;
	        context.delegate = null;
	        return ContinueSentinel;
	      }

	      var info = record.arg;

	      if (!info) {
	        context.method = "throw";
	        context.arg = new TypeError("iterator result is not an object");
	        context.delegate = null;
	        return ContinueSentinel;
	      }

	      if (info.done) {
	        // Assign the result of the finished delegate to the temporary
	        // variable specified by delegate.resultName (see delegateYield).
	        context[delegate.resultName] = info.value; // Resume execution at the desired location (see delegateYield).

	        context.next = delegate.nextLoc; // If context.method was "throw" but the delegate handled the
	        // exception, let the outer generator proceed normally. If
	        // context.method was "next", forget context.arg since it has been
	        // "consumed" by the delegate iterator. If context.method was
	        // "return", allow the original .return call to continue in the
	        // outer generator.

	        if (context.method !== "return") {
	          context.method = "next";
	          context.arg = undefined$1;
	        }
	      } else {
	        // Re-yield the result returned by the delegate method.
	        return info;
	      } // The delegate iterator is finished, so forget it and continue with
	      // the outer generator.


	      context.delegate = null;
	      return ContinueSentinel;
	    } // Define Generator.prototype.{next,throw,return} in terms of the
	    // unified ._invoke helper method.


	    defineIteratorMethods(Gp);
	    Gp[toStringTagSymbol] = "Generator"; // A Generator should always return itself as the iterator object when the
	    // @@iterator function is called on it. Some browsers' implementations of the
	    // iterator prototype chain incorrectly implement this, causing the Generator
	    // object to not be returned from this call. This ensures that doesn't happen.
	    // See https://github.com/facebook/regenerator/issues/274 for more details.

	    Gp[iteratorSymbol] = function () {
	      return this;
	    };

	    Gp.toString = function () {
	      return "[object Generator]";
	    };

	    function pushTryEntry(locs) {
	      var entry = {
	        tryLoc: locs[0]
	      };

	      if (1 in locs) {
	        entry.catchLoc = locs[1];
	      }

	      if (2 in locs) {
	        entry.finallyLoc = locs[2];
	        entry.afterLoc = locs[3];
	      }

	      this.tryEntries.push(entry);
	    }

	    function resetTryEntry(entry) {
	      var record = entry.completion || {};
	      record.type = "normal";
	      delete record.arg;
	      entry.completion = record;
	    }

	    function Context(tryLocsList) {
	      // The root entry object (effectively a try statement without a catch
	      // or a finally block) gives us a place to store values thrown from
	      // locations where there is no enclosing try statement.
	      this.tryEntries = [{
	        tryLoc: "root"
	      }];
	      tryLocsList.forEach(pushTryEntry, this);
	      this.reset(true);
	    }

	    runtime.keys = function (object) {
	      var keys = [];

	      for (var key in object) {
	        keys.push(key);
	      }

	      keys.reverse(); // Rather than returning an object with a next method, we keep
	      // things simple and return the next function itself.

	      return function next() {
	        while (keys.length) {
	          var key = keys.pop();

	          if (key in object) {
	            next.value = key;
	            next.done = false;
	            return next;
	          }
	        } // To avoid creating an additional object, we just hang the .value
	        // and .done properties off the next function object itself. This
	        // also ensures that the minifier will not anonymize the function.


	        next.done = true;
	        return next;
	      };
	    };

	    function values(iterable) {
	      if (iterable) {
	        var iteratorMethod = iterable[iteratorSymbol];

	        if (iteratorMethod) {
	          return iteratorMethod.call(iterable);
	        }

	        if (typeof iterable.next === "function") {
	          return iterable;
	        }

	        if (!isNaN(iterable.length)) {
	          var i = -1,
	              next = function next() {
	            while (++i < iterable.length) {
	              if (hasOwn.call(iterable, i)) {
	                next.value = iterable[i];
	                next.done = false;
	                return next;
	              }
	            }

	            next.value = undefined$1;
	            next.done = true;
	            return next;
	          };

	          return next.next = next;
	        }
	      } // Return an iterator with no values.


	      return {
	        next: doneResult
	      };
	    }

	    runtime.values = values;

	    function doneResult() {
	      return {
	        value: undefined$1,
	        done: true
	      };
	    }

	    Context.prototype = {
	      constructor: Context,
	      reset: function (skipTempReset) {
	        this.prev = 0;
	        this.next = 0; // Resetting context._sent for legacy support of Babel's
	        // function.sent implementation.

	        this.sent = this._sent = undefined$1;
	        this.done = false;
	        this.delegate = null;
	        this.method = "next";
	        this.arg = undefined$1;
	        this.tryEntries.forEach(resetTryEntry);

	        if (!skipTempReset) {
	          for (var name in this) {
	            // Not sure about the optimal order of these conditions:
	            if (name.charAt(0) === "t" && hasOwn.call(this, name) && !isNaN(+name.slice(1))) {
	              this[name] = undefined$1;
	            }
	          }
	        }
	      },
	      stop: function () {
	        this.done = true;
	        var rootEntry = this.tryEntries[0];
	        var rootRecord = rootEntry.completion;

	        if (rootRecord.type === "throw") {
	          throw rootRecord.arg;
	        }

	        return this.rval;
	      },
	      dispatchException: function (exception) {
	        if (this.done) {
	          throw exception;
	        }

	        var context = this;

	        function handle(loc, caught) {
	          record.type = "throw";
	          record.arg = exception;
	          context.next = loc;

	          if (caught) {
	            // If the dispatched exception was caught by a catch block,
	            // then let that catch block handle the exception normally.
	            context.method = "next";
	            context.arg = undefined$1;
	          }

	          return !!caught;
	        }

	        for (var i = this.tryEntries.length - 1; i >= 0; --i) {
	          var entry = this.tryEntries[i];
	          var record = entry.completion;

	          if (entry.tryLoc === "root") {
	            // Exception thrown outside of any try block that could handle
	            // it, so set the completion value of the entire function to
	            // throw the exception.
	            return handle("end");
	          }

	          if (entry.tryLoc <= this.prev) {
	            var hasCatch = hasOwn.call(entry, "catchLoc");
	            var hasFinally = hasOwn.call(entry, "finallyLoc");

	            if (hasCatch && hasFinally) {
	              if (this.prev < entry.catchLoc) {
	                return handle(entry.catchLoc, true);
	              } else if (this.prev < entry.finallyLoc) {
	                return handle(entry.finallyLoc);
	              }
	            } else if (hasCatch) {
	              if (this.prev < entry.catchLoc) {
	                return handle(entry.catchLoc, true);
	              }
	            } else if (hasFinally) {
	              if (this.prev < entry.finallyLoc) {
	                return handle(entry.finallyLoc);
	              }
	            } else {
	              throw new Error("try statement without catch or finally");
	            }
	          }
	        }
	      },
	      abrupt: function (type, arg) {
	        for (var i = this.tryEntries.length - 1; i >= 0; --i) {
	          var entry = this.tryEntries[i];

	          if (entry.tryLoc <= this.prev && hasOwn.call(entry, "finallyLoc") && this.prev < entry.finallyLoc) {
	            var finallyEntry = entry;
	            break;
	          }
	        }

	        if (finallyEntry && (type === "break" || type === "continue") && finallyEntry.tryLoc <= arg && arg <= finallyEntry.finallyLoc) {
	          // Ignore the finally entry if control is not jumping to a
	          // location outside the try/catch block.
	          finallyEntry = null;
	        }

	        var record = finallyEntry ? finallyEntry.completion : {};
	        record.type = type;
	        record.arg = arg;

	        if (finallyEntry) {
	          this.method = "next";
	          this.next = finallyEntry.finallyLoc;
	          return ContinueSentinel;
	        }

	        return this.complete(record);
	      },
	      complete: function (record, afterLoc) {
	        if (record.type === "throw") {
	          throw record.arg;
	        }

	        if (record.type === "break" || record.type === "continue") {
	          this.next = record.arg;
	        } else if (record.type === "return") {
	          this.rval = this.arg = record.arg;
	          this.method = "return";
	          this.next = "end";
	        } else if (record.type === "normal" && afterLoc) {
	          this.next = afterLoc;
	        }

	        return ContinueSentinel;
	      },
	      finish: function (finallyLoc) {
	        for (var i = this.tryEntries.length - 1; i >= 0; --i) {
	          var entry = this.tryEntries[i];

	          if (entry.finallyLoc === finallyLoc) {
	            this.complete(entry.completion, entry.afterLoc);
	            resetTryEntry(entry);
	            return ContinueSentinel;
	          }
	        }
	      },
	      "catch": function (tryLoc) {
	        for (var i = this.tryEntries.length - 1; i >= 0; --i) {
	          var entry = this.tryEntries[i];

	          if (entry.tryLoc === tryLoc) {
	            var record = entry.completion;

	            if (record.type === "throw") {
	              var thrown = record.arg;
	              resetTryEntry(entry);
	            }

	            return thrown;
	          }
	        } // The context.catch method must only be called with a location
	        // argument that corresponds to a known catch block.


	        throw new Error("illegal catch attempt");
	      },
	      delegateYield: function (iterable, resultName, nextLoc) {
	        this.delegate = {
	          iterator: values(iterable),
	          resultName: resultName,
	          nextLoc: nextLoc
	        };

	        if (this.method === "next") {
	          // Deliberately forget the last sent value so that we don't
	          // accidentally pass it on to the delegate.
	          this.arg = undefined$1;
	        }

	        return ContinueSentinel;
	      }
	    };
	  }( // In sloppy mode, unbound `this` refers to the global object, fallback to
	  // Function constructor if we're in global strict mode. That is sadly a form
	  // of indirect eval which violates Content Security Policy.
	  function () {
	    return this;
	  }() || Function("return this")());
	});

	var TYPED = _uid('typed_array');
	var VIEW = _uid('view');
	var ABV = !!(_global.ArrayBuffer && _global.DataView);
	var CONSTR = ABV;
	var i$1 = 0;
	var l = 9;
	var Typed;

	var TypedArrayConstructors = (
	  'Int8Array,Uint8Array,Uint8ClampedArray,Int16Array,Uint16Array,Int32Array,Uint32Array,Float32Array,Float64Array'
	).split(',');

	while (i$1 < l) {
	  if (Typed = _global[TypedArrayConstructors[i$1++]]) {
	    _hide(Typed.prototype, TYPED, true);
	    _hide(Typed.prototype, VIEW, true);
	  } else CONSTR = false;
	}

	var _typed = {
	  ABV: ABV,
	  CONSTR: CONSTR,
	  TYPED: TYPED,
	  VIEW: VIEW
	};

	// https://tc39.github.io/ecma262/#sec-toindex


	var _toIndex = function (it) {
	  if (it === undefined) return 0;
	  var number = _toInteger(it);
	  var length = _toLength(number);
	  if (number !== length) throw RangeError('Wrong length!');
	  return length;
	};

	// 19.1.2.7 / 15.2.3.4 Object.getOwnPropertyNames(O)

	var hiddenKeys = _enumBugKeys.concat('length', 'prototype');

	var f$2 = Object.getOwnPropertyNames || function getOwnPropertyNames(O) {
	  return _objectKeysInternal(O, hiddenKeys);
	};

	var _objectGopn = {
		f: f$2
	};

	var _arrayFill = function fill(value /* , start = 0, end = @length */) {
	  var O = _toObject(this);
	  var length = _toLength(O.length);
	  var aLen = arguments.length;
	  var index = _toAbsoluteIndex(aLen > 1 ? arguments[1] : undefined, length);
	  var end = aLen > 2 ? arguments[2] : undefined;
	  var endPos = end === undefined ? length : _toAbsoluteIndex(end, length);
	  while (endPos > index) O[index++] = value;
	  return O;
	};

	var _typedBuffer = createCommonjsModule(function (module, exports) {











	var gOPN = _objectGopn.f;
	var dP = _objectDp.f;


	var ARRAY_BUFFER = 'ArrayBuffer';
	var DATA_VIEW = 'DataView';
	var PROTOTYPE = 'prototype';
	var WRONG_LENGTH = 'Wrong length!';
	var WRONG_INDEX = 'Wrong index!';
	var $ArrayBuffer = _global[ARRAY_BUFFER];
	var $DataView = _global[DATA_VIEW];
	var Math = _global.Math;
	var RangeError = _global.RangeError;
	// eslint-disable-next-line no-shadow-restricted-names
	var Infinity = _global.Infinity;
	var BaseBuffer = $ArrayBuffer;
	var abs = Math.abs;
	var pow = Math.pow;
	var floor = Math.floor;
	var log = Math.log;
	var LN2 = Math.LN2;
	var BUFFER = 'buffer';
	var BYTE_LENGTH = 'byteLength';
	var BYTE_OFFSET = 'byteOffset';
	var $BUFFER = _descriptors ? '_b' : BUFFER;
	var $LENGTH = _descriptors ? '_l' : BYTE_LENGTH;
	var $OFFSET = _descriptors ? '_o' : BYTE_OFFSET;

	// IEEE754 conversions based on https://github.com/feross/ieee754
	function packIEEE754(value, mLen, nBytes) {
	  var buffer = new Array(nBytes);
	  var eLen = nBytes * 8 - mLen - 1;
	  var eMax = (1 << eLen) - 1;
	  var eBias = eMax >> 1;
	  var rt = mLen === 23 ? pow(2, -24) - pow(2, -77) : 0;
	  var i = 0;
	  var s = value < 0 || value === 0 && 1 / value < 0 ? 1 : 0;
	  var e, m, c;
	  value = abs(value);
	  // eslint-disable-next-line no-self-compare
	  if (value != value || value === Infinity) {
	    // eslint-disable-next-line no-self-compare
	    m = value != value ? 1 : 0;
	    e = eMax;
	  } else {
	    e = floor(log(value) / LN2);
	    if (value * (c = pow(2, -e)) < 1) {
	      e--;
	      c *= 2;
	    }
	    if (e + eBias >= 1) {
	      value += rt / c;
	    } else {
	      value += rt * pow(2, 1 - eBias);
	    }
	    if (value * c >= 2) {
	      e++;
	      c /= 2;
	    }
	    if (e + eBias >= eMax) {
	      m = 0;
	      e = eMax;
	    } else if (e + eBias >= 1) {
	      m = (value * c - 1) * pow(2, mLen);
	      e = e + eBias;
	    } else {
	      m = value * pow(2, eBias - 1) * pow(2, mLen);
	      e = 0;
	    }
	  }
	  for (; mLen >= 8; buffer[i++] = m & 255, m /= 256, mLen -= 8);
	  e = e << mLen | m;
	  eLen += mLen;
	  for (; eLen > 0; buffer[i++] = e & 255, e /= 256, eLen -= 8);
	  buffer[--i] |= s * 128;
	  return buffer;
	}
	function unpackIEEE754(buffer, mLen, nBytes) {
	  var eLen = nBytes * 8 - mLen - 1;
	  var eMax = (1 << eLen) - 1;
	  var eBias = eMax >> 1;
	  var nBits = eLen - 7;
	  var i = nBytes - 1;
	  var s = buffer[i--];
	  var e = s & 127;
	  var m;
	  s >>= 7;
	  for (; nBits > 0; e = e * 256 + buffer[i], i--, nBits -= 8);
	  m = e & (1 << -nBits) - 1;
	  e >>= -nBits;
	  nBits += mLen;
	  for (; nBits > 0; m = m * 256 + buffer[i], i--, nBits -= 8);
	  if (e === 0) {
	    e = 1 - eBias;
	  } else if (e === eMax) {
	    return m ? NaN : s ? -Infinity : Infinity;
	  } else {
	    m = m + pow(2, mLen);
	    e = e - eBias;
	  } return (s ? -1 : 1) * m * pow(2, e - mLen);
	}

	function unpackI32(bytes) {
	  return bytes[3] << 24 | bytes[2] << 16 | bytes[1] << 8 | bytes[0];
	}
	function packI8(it) {
	  return [it & 0xff];
	}
	function packI16(it) {
	  return [it & 0xff, it >> 8 & 0xff];
	}
	function packI32(it) {
	  return [it & 0xff, it >> 8 & 0xff, it >> 16 & 0xff, it >> 24 & 0xff];
	}
	function packF64(it) {
	  return packIEEE754(it, 52, 8);
	}
	function packF32(it) {
	  return packIEEE754(it, 23, 4);
	}

	function addGetter(C, key, internal) {
	  dP(C[PROTOTYPE], key, { get: function () { return this[internal]; } });
	}

	function get(view, bytes, index, isLittleEndian) {
	  var numIndex = +index;
	  var intIndex = _toIndex(numIndex);
	  if (intIndex + bytes > view[$LENGTH]) throw RangeError(WRONG_INDEX);
	  var store = view[$BUFFER]._b;
	  var start = intIndex + view[$OFFSET];
	  var pack = store.slice(start, start + bytes);
	  return isLittleEndian ? pack : pack.reverse();
	}
	function set(view, bytes, index, conversion, value, isLittleEndian) {
	  var numIndex = +index;
	  var intIndex = _toIndex(numIndex);
	  if (intIndex + bytes > view[$LENGTH]) throw RangeError(WRONG_INDEX);
	  var store = view[$BUFFER]._b;
	  var start = intIndex + view[$OFFSET];
	  var pack = conversion(+value);
	  for (var i = 0; i < bytes; i++) store[start + i] = pack[isLittleEndian ? i : bytes - i - 1];
	}

	if (!_typed.ABV) {
	  $ArrayBuffer = function ArrayBuffer(length) {
	    _anInstance(this, $ArrayBuffer, ARRAY_BUFFER);
	    var byteLength = _toIndex(length);
	    this._b = _arrayFill.call(new Array(byteLength), 0);
	    this[$LENGTH] = byteLength;
	  };

	  $DataView = function DataView(buffer, byteOffset, byteLength) {
	    _anInstance(this, $DataView, DATA_VIEW);
	    _anInstance(buffer, $ArrayBuffer, DATA_VIEW);
	    var bufferLength = buffer[$LENGTH];
	    var offset = _toInteger(byteOffset);
	    if (offset < 0 || offset > bufferLength) throw RangeError('Wrong offset!');
	    byteLength = byteLength === undefined ? bufferLength - offset : _toLength(byteLength);
	    if (offset + byteLength > bufferLength) throw RangeError(WRONG_LENGTH);
	    this[$BUFFER] = buffer;
	    this[$OFFSET] = offset;
	    this[$LENGTH] = byteLength;
	  };

	  if (_descriptors) {
	    addGetter($ArrayBuffer, BYTE_LENGTH, '_l');
	    addGetter($DataView, BUFFER, '_b');
	    addGetter($DataView, BYTE_LENGTH, '_l');
	    addGetter($DataView, BYTE_OFFSET, '_o');
	  }

	  _redefineAll($DataView[PROTOTYPE], {
	    getInt8: function getInt8(byteOffset) {
	      return get(this, 1, byteOffset)[0] << 24 >> 24;
	    },
	    getUint8: function getUint8(byteOffset) {
	      return get(this, 1, byteOffset)[0];
	    },
	    getInt16: function getInt16(byteOffset /* , littleEndian */) {
	      var bytes = get(this, 2, byteOffset, arguments[1]);
	      return (bytes[1] << 8 | bytes[0]) << 16 >> 16;
	    },
	    getUint16: function getUint16(byteOffset /* , littleEndian */) {
	      var bytes = get(this, 2, byteOffset, arguments[1]);
	      return bytes[1] << 8 | bytes[0];
	    },
	    getInt32: function getInt32(byteOffset /* , littleEndian */) {
	      return unpackI32(get(this, 4, byteOffset, arguments[1]));
	    },
	    getUint32: function getUint32(byteOffset /* , littleEndian */) {
	      return unpackI32(get(this, 4, byteOffset, arguments[1])) >>> 0;
	    },
	    getFloat32: function getFloat32(byteOffset /* , littleEndian */) {
	      return unpackIEEE754(get(this, 4, byteOffset, arguments[1]), 23, 4);
	    },
	    getFloat64: function getFloat64(byteOffset /* , littleEndian */) {
	      return unpackIEEE754(get(this, 8, byteOffset, arguments[1]), 52, 8);
	    },
	    setInt8: function setInt8(byteOffset, value) {
	      set(this, 1, byteOffset, packI8, value);
	    },
	    setUint8: function setUint8(byteOffset, value) {
	      set(this, 1, byteOffset, packI8, value);
	    },
	    setInt16: function setInt16(byteOffset, value /* , littleEndian */) {
	      set(this, 2, byteOffset, packI16, value, arguments[2]);
	    },
	    setUint16: function setUint16(byteOffset, value /* , littleEndian */) {
	      set(this, 2, byteOffset, packI16, value, arguments[2]);
	    },
	    setInt32: function setInt32(byteOffset, value /* , littleEndian */) {
	      set(this, 4, byteOffset, packI32, value, arguments[2]);
	    },
	    setUint32: function setUint32(byteOffset, value /* , littleEndian */) {
	      set(this, 4, byteOffset, packI32, value, arguments[2]);
	    },
	    setFloat32: function setFloat32(byteOffset, value /* , littleEndian */) {
	      set(this, 4, byteOffset, packF32, value, arguments[2]);
	    },
	    setFloat64: function setFloat64(byteOffset, value /* , littleEndian */) {
	      set(this, 8, byteOffset, packF64, value, arguments[2]);
	    }
	  });
	} else {
	  if (!_fails(function () {
	    $ArrayBuffer(1);
	  }) || !_fails(function () {
	    new $ArrayBuffer(-1); // eslint-disable-line no-new
	  }) || _fails(function () {
	    new $ArrayBuffer(); // eslint-disable-line no-new
	    new $ArrayBuffer(1.5); // eslint-disable-line no-new
	    new $ArrayBuffer(NaN); // eslint-disable-line no-new
	    return $ArrayBuffer.name != ARRAY_BUFFER;
	  })) {
	    $ArrayBuffer = function ArrayBuffer(length) {
	      _anInstance(this, $ArrayBuffer);
	      return new BaseBuffer(_toIndex(length));
	    };
	    var ArrayBufferProto = $ArrayBuffer[PROTOTYPE] = BaseBuffer[PROTOTYPE];
	    for (var keys = gOPN(BaseBuffer), j = 0, key; keys.length > j;) {
	      if (!((key = keys[j++]) in $ArrayBuffer)) _hide($ArrayBuffer, key, BaseBuffer[key]);
	    }
	    ArrayBufferProto.constructor = $ArrayBuffer;
	  }
	  // iOS Safari 7.x bug
	  var view = new $DataView(new $ArrayBuffer(2));
	  var $setInt8 = $DataView[PROTOTYPE].setInt8;
	  view.setInt8(0, 2147483648);
	  view.setInt8(1, 2147483649);
	  if (view.getInt8(0) || !view.getInt8(1)) _redefineAll($DataView[PROTOTYPE], {
	    setInt8: function setInt8(byteOffset, value) {
	      $setInt8.call(this, byteOffset, value << 24 >> 24);
	    },
	    setUint8: function setUint8(byteOffset, value) {
	      $setInt8.call(this, byteOffset, value << 24 >> 24);
	    }
	  }, true);
	}
	_setToStringTag($ArrayBuffer, ARRAY_BUFFER);
	_setToStringTag($DataView, DATA_VIEW);
	_hide($DataView[PROTOTYPE], _typed.VIEW, true);
	exports[ARRAY_BUFFER] = $ArrayBuffer;
	exports[DATA_VIEW] = $DataView;
	});

	_export(_export.G + _export.W + _export.F * !_typed.ABV, {
	  DataView: _typedBuffer.DataView
	});

	var _arrayCopyWithin = [].copyWithin || function copyWithin(target /* = 0 */, start /* = 0, end = @length */) {
	  var O = _toObject(this);
	  var len = _toLength(O.length);
	  var to = _toAbsoluteIndex(target, len);
	  var from = _toAbsoluteIndex(start, len);
	  var end = arguments.length > 2 ? arguments[2] : undefined;
	  var count = Math.min((end === undefined ? len : _toAbsoluteIndex(end, len)) - from, len - to);
	  var inc = 1;
	  if (from < to && to < from + count) {
	    inc = -1;
	    from += count - 1;
	    to += count - 1;
	  }
	  while (count-- > 0) {
	    if (from in O) O[to] = O[from];
	    else delete O[to];
	    to += inc;
	    from += inc;
	  } return O;
	};

	var f$3 = {}.propertyIsEnumerable;

	var _objectPie = {
		f: f$3
	};

	var gOPD = Object.getOwnPropertyDescriptor;

	var f$4 = _descriptors ? gOPD : function getOwnPropertyDescriptor(O, P) {
	  O = _toIobject(O);
	  P = _toPrimitive(P, true);
	  if (_ie8DomDefine) try {
	    return gOPD(O, P);
	  } catch (e) { /* empty */ }
	  if (_has(O, P)) return _propertyDesc(!_objectPie.f.call(O, P), O[P]);
	};

	var _objectGopd = {
		f: f$4
	};

	var _typedArray = createCommonjsModule(function (module) {
	if (_descriptors) {
	  var LIBRARY = _library;
	  var global = _global;
	  var fails = _fails;
	  var $export = _export;
	  var $typed = _typed;
	  var $buffer = _typedBuffer;
	  var ctx = _ctx;
	  var anInstance = _anInstance;
	  var propertyDesc = _propertyDesc;
	  var hide = _hide;
	  var redefineAll = _redefineAll;
	  var toInteger = _toInteger;
	  var toLength = _toLength;
	  var toIndex = _toIndex;
	  var toAbsoluteIndex = _toAbsoluteIndex;
	  var toPrimitive = _toPrimitive;
	  var has = _has;
	  var classof = _classof;
	  var isObject = _isObject;
	  var toObject = _toObject;
	  var isArrayIter = _isArrayIter;
	  var create = _objectCreate;
	  var getPrototypeOf = _objectGpo;
	  var gOPN = _objectGopn.f;
	  var getIterFn = core_getIteratorMethod;
	  var uid = _uid;
	  var wks = _wks;
	  var createArrayMethod = _arrayMethods;
	  var createArrayIncludes = _arrayIncludes;
	  var speciesConstructor = _speciesConstructor;
	  var ArrayIterators = es6_array_iterator;
	  var Iterators = _iterators;
	  var $iterDetect = _iterDetect;
	  var setSpecies = _setSpecies;
	  var arrayFill = _arrayFill;
	  var arrayCopyWithin = _arrayCopyWithin;
	  var $DP = _objectDp;
	  var $GOPD = _objectGopd;
	  var dP = $DP.f;
	  var gOPD = $GOPD.f;
	  var RangeError = global.RangeError;
	  var TypeError = global.TypeError;
	  var Uint8Array = global.Uint8Array;
	  var ARRAY_BUFFER = 'ArrayBuffer';
	  var SHARED_BUFFER = 'Shared' + ARRAY_BUFFER;
	  var BYTES_PER_ELEMENT = 'BYTES_PER_ELEMENT';
	  var PROTOTYPE = 'prototype';
	  var ArrayProto = Array[PROTOTYPE];
	  var $ArrayBuffer = $buffer.ArrayBuffer;
	  var $DataView = $buffer.DataView;
	  var arrayForEach = createArrayMethod(0);
	  var arrayFilter = createArrayMethod(2);
	  var arraySome = createArrayMethod(3);
	  var arrayEvery = createArrayMethod(4);
	  var arrayFind = createArrayMethod(5);
	  var arrayFindIndex = createArrayMethod(6);
	  var arrayIncludes = createArrayIncludes(true);
	  var arrayIndexOf = createArrayIncludes(false);
	  var arrayValues = ArrayIterators.values;
	  var arrayKeys = ArrayIterators.keys;
	  var arrayEntries = ArrayIterators.entries;
	  var arrayLastIndexOf = ArrayProto.lastIndexOf;
	  var arrayReduce = ArrayProto.reduce;
	  var arrayReduceRight = ArrayProto.reduceRight;
	  var arrayJoin = ArrayProto.join;
	  var arraySort = ArrayProto.sort;
	  var arraySlice = ArrayProto.slice;
	  var arrayToString = ArrayProto.toString;
	  var arrayToLocaleString = ArrayProto.toLocaleString;
	  var ITERATOR = wks('iterator');
	  var TAG = wks('toStringTag');
	  var TYPED_CONSTRUCTOR = uid('typed_constructor');
	  var DEF_CONSTRUCTOR = uid('def_constructor');
	  var ALL_CONSTRUCTORS = $typed.CONSTR;
	  var TYPED_ARRAY = $typed.TYPED;
	  var VIEW = $typed.VIEW;
	  var WRONG_LENGTH = 'Wrong length!';

	  var $map = createArrayMethod(1, function (O, length) {
	    return allocate(speciesConstructor(O, O[DEF_CONSTRUCTOR]), length);
	  });

	  var LITTLE_ENDIAN = fails(function () {
	    // eslint-disable-next-line no-undef
	    return new Uint8Array(new Uint16Array([1]).buffer)[0] === 1;
	  });

	  var FORCED_SET = !!Uint8Array && !!Uint8Array[PROTOTYPE].set && fails(function () {
	    new Uint8Array(1).set({});
	  });

	  var toOffset = function (it, BYTES) {
	    var offset = toInteger(it);
	    if (offset < 0 || offset % BYTES) throw RangeError('Wrong offset!');
	    return offset;
	  };

	  var validate = function (it) {
	    if (isObject(it) && TYPED_ARRAY in it) return it;
	    throw TypeError(it + ' is not a typed array!');
	  };

	  var allocate = function (C, length) {
	    if (!(isObject(C) && TYPED_CONSTRUCTOR in C)) {
	      throw TypeError('It is not a typed array constructor!');
	    } return new C(length);
	  };

	  var speciesFromList = function (O, list) {
	    return fromList(speciesConstructor(O, O[DEF_CONSTRUCTOR]), list);
	  };

	  var fromList = function (C, list) {
	    var index = 0;
	    var length = list.length;
	    var result = allocate(C, length);
	    while (length > index) result[index] = list[index++];
	    return result;
	  };

	  var addGetter = function (it, key, internal) {
	    dP(it, key, { get: function () { return this._d[internal]; } });
	  };

	  var $from = function from(source /* , mapfn, thisArg */) {
	    var O = toObject(source);
	    var aLen = arguments.length;
	    var mapfn = aLen > 1 ? arguments[1] : undefined;
	    var mapping = mapfn !== undefined;
	    var iterFn = getIterFn(O);
	    var i, length, values, result, step, iterator;
	    if (iterFn != undefined && !isArrayIter(iterFn)) {
	      for (iterator = iterFn.call(O), values = [], i = 0; !(step = iterator.next()).done; i++) {
	        values.push(step.value);
	      } O = values;
	    }
	    if (mapping && aLen > 2) mapfn = ctx(mapfn, arguments[2], 2);
	    for (i = 0, length = toLength(O.length), result = allocate(this, length); length > i; i++) {
	      result[i] = mapping ? mapfn(O[i], i) : O[i];
	    }
	    return result;
	  };

	  var $of = function of(/* ...items */) {
	    var index = 0;
	    var length = arguments.length;
	    var result = allocate(this, length);
	    while (length > index) result[index] = arguments[index++];
	    return result;
	  };

	  // iOS Safari 6.x fails here
	  var TO_LOCALE_BUG = !!Uint8Array && fails(function () { arrayToLocaleString.call(new Uint8Array(1)); });

	  var $toLocaleString = function toLocaleString() {
	    return arrayToLocaleString.apply(TO_LOCALE_BUG ? arraySlice.call(validate(this)) : validate(this), arguments);
	  };

	  var proto = {
	    copyWithin: function copyWithin(target, start /* , end */) {
	      return arrayCopyWithin.call(validate(this), target, start, arguments.length > 2 ? arguments[2] : undefined);
	    },
	    every: function every(callbackfn /* , thisArg */) {
	      return arrayEvery(validate(this), callbackfn, arguments.length > 1 ? arguments[1] : undefined);
	    },
	    fill: function fill(value /* , start, end */) { // eslint-disable-line no-unused-vars
	      return arrayFill.apply(validate(this), arguments);
	    },
	    filter: function filter(callbackfn /* , thisArg */) {
	      return speciesFromList(this, arrayFilter(validate(this), callbackfn,
	        arguments.length > 1 ? arguments[1] : undefined));
	    },
	    find: function find(predicate /* , thisArg */) {
	      return arrayFind(validate(this), predicate, arguments.length > 1 ? arguments[1] : undefined);
	    },
	    findIndex: function findIndex(predicate /* , thisArg */) {
	      return arrayFindIndex(validate(this), predicate, arguments.length > 1 ? arguments[1] : undefined);
	    },
	    forEach: function forEach(callbackfn /* , thisArg */) {
	      arrayForEach(validate(this), callbackfn, arguments.length > 1 ? arguments[1] : undefined);
	    },
	    indexOf: function indexOf(searchElement /* , fromIndex */) {
	      return arrayIndexOf(validate(this), searchElement, arguments.length > 1 ? arguments[1] : undefined);
	    },
	    includes: function includes(searchElement /* , fromIndex */) {
	      return arrayIncludes(validate(this), searchElement, arguments.length > 1 ? arguments[1] : undefined);
	    },
	    join: function join(separator) { // eslint-disable-line no-unused-vars
	      return arrayJoin.apply(validate(this), arguments);
	    },
	    lastIndexOf: function lastIndexOf(searchElement /* , fromIndex */) { // eslint-disable-line no-unused-vars
	      return arrayLastIndexOf.apply(validate(this), arguments);
	    },
	    map: function map(mapfn /* , thisArg */) {
	      return $map(validate(this), mapfn, arguments.length > 1 ? arguments[1] : undefined);
	    },
	    reduce: function reduce(callbackfn /* , initialValue */) { // eslint-disable-line no-unused-vars
	      return arrayReduce.apply(validate(this), arguments);
	    },
	    reduceRight: function reduceRight(callbackfn /* , initialValue */) { // eslint-disable-line no-unused-vars
	      return arrayReduceRight.apply(validate(this), arguments);
	    },
	    reverse: function reverse() {
	      var that = this;
	      var length = validate(that).length;
	      var middle = Math.floor(length / 2);
	      var index = 0;
	      var value;
	      while (index < middle) {
	        value = that[index];
	        that[index++] = that[--length];
	        that[length] = value;
	      } return that;
	    },
	    some: function some(callbackfn /* , thisArg */) {
	      return arraySome(validate(this), callbackfn, arguments.length > 1 ? arguments[1] : undefined);
	    },
	    sort: function sort(comparefn) {
	      return arraySort.call(validate(this), comparefn);
	    },
	    subarray: function subarray(begin, end) {
	      var O = validate(this);
	      var length = O.length;
	      var $begin = toAbsoluteIndex(begin, length);
	      return new (speciesConstructor(O, O[DEF_CONSTRUCTOR]))(
	        O.buffer,
	        O.byteOffset + $begin * O.BYTES_PER_ELEMENT,
	        toLength((end === undefined ? length : toAbsoluteIndex(end, length)) - $begin)
	      );
	    }
	  };

	  var $slice = function slice(start, end) {
	    return speciesFromList(this, arraySlice.call(validate(this), start, end));
	  };

	  var $set = function set(arrayLike /* , offset */) {
	    validate(this);
	    var offset = toOffset(arguments[1], 1);
	    var length = this.length;
	    var src = toObject(arrayLike);
	    var len = toLength(src.length);
	    var index = 0;
	    if (len + offset > length) throw RangeError(WRONG_LENGTH);
	    while (index < len) this[offset + index] = src[index++];
	  };

	  var $iterators = {
	    entries: function entries() {
	      return arrayEntries.call(validate(this));
	    },
	    keys: function keys() {
	      return arrayKeys.call(validate(this));
	    },
	    values: function values() {
	      return arrayValues.call(validate(this));
	    }
	  };

	  var isTAIndex = function (target, key) {
	    return isObject(target)
	      && target[TYPED_ARRAY]
	      && typeof key != 'symbol'
	      && key in target
	      && String(+key) == String(key);
	  };
	  var $getDesc = function getOwnPropertyDescriptor(target, key) {
	    return isTAIndex(target, key = toPrimitive(key, true))
	      ? propertyDesc(2, target[key])
	      : gOPD(target, key);
	  };
	  var $setDesc = function defineProperty(target, key, desc) {
	    if (isTAIndex(target, key = toPrimitive(key, true))
	      && isObject(desc)
	      && has(desc, 'value')
	      && !has(desc, 'get')
	      && !has(desc, 'set')
	      // TODO: add validation descriptor w/o calling accessors
	      && !desc.configurable
	      && (!has(desc, 'writable') || desc.writable)
	      && (!has(desc, 'enumerable') || desc.enumerable)
	    ) {
	      target[key] = desc.value;
	      return target;
	    } return dP(target, key, desc);
	  };

	  if (!ALL_CONSTRUCTORS) {
	    $GOPD.f = $getDesc;
	    $DP.f = $setDesc;
	  }

	  $export($export.S + $export.F * !ALL_CONSTRUCTORS, 'Object', {
	    getOwnPropertyDescriptor: $getDesc,
	    defineProperty: $setDesc
	  });

	  if (fails(function () { arrayToString.call({}); })) {
	    arrayToString = arrayToLocaleString = function toString() {
	      return arrayJoin.call(this);
	    };
	  }

	  var $TypedArrayPrototype$ = redefineAll({}, proto);
	  redefineAll($TypedArrayPrototype$, $iterators);
	  hide($TypedArrayPrototype$, ITERATOR, $iterators.values);
	  redefineAll($TypedArrayPrototype$, {
	    slice: $slice,
	    set: $set,
	    constructor: function () { /* noop */ },
	    toString: arrayToString,
	    toLocaleString: $toLocaleString
	  });
	  addGetter($TypedArrayPrototype$, 'buffer', 'b');
	  addGetter($TypedArrayPrototype$, 'byteOffset', 'o');
	  addGetter($TypedArrayPrototype$, 'byteLength', 'l');
	  addGetter($TypedArrayPrototype$, 'length', 'e');
	  dP($TypedArrayPrototype$, TAG, {
	    get: function () { return this[TYPED_ARRAY]; }
	  });

	  // eslint-disable-next-line max-statements
	  module.exports = function (KEY, BYTES, wrapper, CLAMPED) {
	    CLAMPED = !!CLAMPED;
	    var NAME = KEY + (CLAMPED ? 'Clamped' : '') + 'Array';
	    var GETTER = 'get' + KEY;
	    var SETTER = 'set' + KEY;
	    var TypedArray = global[NAME];
	    var Base = TypedArray || {};
	    var TAC = TypedArray && getPrototypeOf(TypedArray);
	    var FORCED = !TypedArray || !$typed.ABV;
	    var O = {};
	    var TypedArrayPrototype = TypedArray && TypedArray[PROTOTYPE];
	    var getter = function (that, index) {
	      var data = that._d;
	      return data.v[GETTER](index * BYTES + data.o, LITTLE_ENDIAN);
	    };
	    var setter = function (that, index, value) {
	      var data = that._d;
	      if (CLAMPED) value = (value = Math.round(value)) < 0 ? 0 : value > 0xff ? 0xff : value & 0xff;
	      data.v[SETTER](index * BYTES + data.o, value, LITTLE_ENDIAN);
	    };
	    var addElement = function (that, index) {
	      dP(that, index, {
	        get: function () {
	          return getter(this, index);
	        },
	        set: function (value) {
	          return setter(this, index, value);
	        },
	        enumerable: true
	      });
	    };
	    if (FORCED) {
	      TypedArray = wrapper(function (that, data, $offset, $length) {
	        anInstance(that, TypedArray, NAME, '_d');
	        var index = 0;
	        var offset = 0;
	        var buffer, byteLength, length, klass;
	        if (!isObject(data)) {
	          length = toIndex(data);
	          byteLength = length * BYTES;
	          buffer = new $ArrayBuffer(byteLength);
	        } else if (data instanceof $ArrayBuffer || (klass = classof(data)) == ARRAY_BUFFER || klass == SHARED_BUFFER) {
	          buffer = data;
	          offset = toOffset($offset, BYTES);
	          var $len = data.byteLength;
	          if ($length === undefined) {
	            if ($len % BYTES) throw RangeError(WRONG_LENGTH);
	            byteLength = $len - offset;
	            if (byteLength < 0) throw RangeError(WRONG_LENGTH);
	          } else {
	            byteLength = toLength($length) * BYTES;
	            if (byteLength + offset > $len) throw RangeError(WRONG_LENGTH);
	          }
	          length = byteLength / BYTES;
	        } else if (TYPED_ARRAY in data) {
	          return fromList(TypedArray, data);
	        } else {
	          return $from.call(TypedArray, data);
	        }
	        hide(that, '_d', {
	          b: buffer,
	          o: offset,
	          l: byteLength,
	          e: length,
	          v: new $DataView(buffer)
	        });
	        while (index < length) addElement(that, index++);
	      });
	      TypedArrayPrototype = TypedArray[PROTOTYPE] = create($TypedArrayPrototype$);
	      hide(TypedArrayPrototype, 'constructor', TypedArray);
	    } else if (!fails(function () {
	      TypedArray(1);
	    }) || !fails(function () {
	      new TypedArray(-1); // eslint-disable-line no-new
	    }) || !$iterDetect(function (iter) {
	      new TypedArray(); // eslint-disable-line no-new
	      new TypedArray(null); // eslint-disable-line no-new
	      new TypedArray(1.5); // eslint-disable-line no-new
	      new TypedArray(iter); // eslint-disable-line no-new
	    }, true)) {
	      TypedArray = wrapper(function (that, data, $offset, $length) {
	        anInstance(that, TypedArray, NAME);
	        var klass;
	        // `ws` module bug, temporarily remove validation length for Uint8Array
	        // https://github.com/websockets/ws/pull/645
	        if (!isObject(data)) return new Base(toIndex(data));
	        if (data instanceof $ArrayBuffer || (klass = classof(data)) == ARRAY_BUFFER || klass == SHARED_BUFFER) {
	          return $length !== undefined
	            ? new Base(data, toOffset($offset, BYTES), $length)
	            : $offset !== undefined
	              ? new Base(data, toOffset($offset, BYTES))
	              : new Base(data);
	        }
	        if (TYPED_ARRAY in data) return fromList(TypedArray, data);
	        return $from.call(TypedArray, data);
	      });
	      arrayForEach(TAC !== Function.prototype ? gOPN(Base).concat(gOPN(TAC)) : gOPN(Base), function (key) {
	        if (!(key in TypedArray)) hide(TypedArray, key, Base[key]);
	      });
	      TypedArray[PROTOTYPE] = TypedArrayPrototype;
	      if (!LIBRARY) TypedArrayPrototype.constructor = TypedArray;
	    }
	    var $nativeIterator = TypedArrayPrototype[ITERATOR];
	    var CORRECT_ITER_NAME = !!$nativeIterator
	      && ($nativeIterator.name == 'values' || $nativeIterator.name == undefined);
	    var $iterator = $iterators.values;
	    hide(TypedArray, TYPED_CONSTRUCTOR, true);
	    hide(TypedArrayPrototype, TYPED_ARRAY, NAME);
	    hide(TypedArrayPrototype, VIEW, true);
	    hide(TypedArrayPrototype, DEF_CONSTRUCTOR, TypedArray);

	    if (CLAMPED ? new TypedArray(1)[TAG] != NAME : !(TAG in TypedArrayPrototype)) {
	      dP(TypedArrayPrototype, TAG, {
	        get: function () { return NAME; }
	      });
	    }

	    O[NAME] = TypedArray;

	    $export($export.G + $export.W + $export.F * (TypedArray != Base), O);

	    $export($export.S, NAME, {
	      BYTES_PER_ELEMENT: BYTES
	    });

	    $export($export.S + $export.F * fails(function () { Base.of.call(TypedArray, 1); }), NAME, {
	      from: $from,
	      of: $of
	    });

	    if (!(BYTES_PER_ELEMENT in TypedArrayPrototype)) hide(TypedArrayPrototype, BYTES_PER_ELEMENT, BYTES);

	    $export($export.P, NAME, proto);

	    setSpecies(NAME);

	    $export($export.P + $export.F * FORCED_SET, NAME, { set: $set });

	    $export($export.P + $export.F * !CORRECT_ITER_NAME, NAME, $iterators);

	    if (!LIBRARY && TypedArrayPrototype.toString != arrayToString) TypedArrayPrototype.toString = arrayToString;

	    $export($export.P + $export.F * fails(function () {
	      new TypedArray(1).slice();
	    }), NAME, { slice: $slice });

	    $export($export.P + $export.F * (fails(function () {
	      return [1, 2].toLocaleString() != new TypedArray([1, 2]).toLocaleString();
	    }) || !fails(function () {
	      TypedArrayPrototype.toLocaleString.call([1, 2]);
	    })), NAME, { toLocaleString: $toLocaleString });

	    Iterators[NAME] = CORRECT_ITER_NAME ? $nativeIterator : $iterator;
	    if (!LIBRARY && !CORRECT_ITER_NAME) hide(TypedArrayPrototype, ITERATOR, $iterator);
	  };
	} else module.exports = function () { /* empty */ };
	});

	_typedArray('Uint8', 1, function (init) {
	  return function Uint8Array(data, byteOffset, length) {
	    return init(this, data, byteOffset, length);
	  };
	});

	var axios = require("axios");

	var atob = require("atob");

	var nacl = require("tweetnacl");

	var url = require("url");

	var WebSocket = require("websocket");

	var WebSocketClient = WebSocket.w3cwebsocket;
	var TAG_NOP = 0;
	var TAG_TRANSFER = 1;
	var TAG_CONTRACT = 2;
	var TAG_STAKE = 3;
	var TAG_BATCH = 4;

	var JSBI = require('jsbi');

	var BigInt = JSBI.BigInt;
	/**
	 * Converts a string to a Buffer.
	 *
	 * @param {string} str
	 * @returns {ArrayBuffer}
	 */

	var str2ab = function str2ab(str) {
	  var buf = new ArrayBuffer(str.length);
	  var view = new Uint8Array(buf);

	  for (var i = 0, len = str.length; i < len; i++) {
	    view[i] = str.charCodeAt(i);
	  }

	  return buf;
	};

	DataView.prototype._setBigUint64 = DataView.prototype.setBigUint64;

	DataView.prototype.setBigUint64 = function (byteOffset, value, littleEndian) {
	  if (typeof value === 'bigint' && typeof this._setBigUint64 !== 'undefined') {
	    this._setBigUint64(byteOffset, value, littleEndian);
	  } else if (value.constructor === JSBI && typeof value.sign === 'bigint' && typeof this._setBigUint64 !== 'undefined') {
	    this._setBigUint64(byteOffset, value.sign, littleEndian);
	  } else if (value.constructor === JSBI || value.constructor && typeof value.constructor.BigInt === 'function') {
	    var lowWord = value[0],
	        highWord = value.length >= 2 ? value[1] : 0;
	    this.setUint32(littleEndian ? byteOffset : byteOffset + 4, lowWord, littleEndian);
	    this.setUint32(littleEndian ? byteOffset + 4 : byteOffset, highWord, littleEndian);
	  } else {
	    throw TypeError('Value needs to be BigInt or JSBI');
	  }
	};

	DataView.prototype._getBigUint64 = DataView.prototype.getBigUint64;

	DataView.prototype.getBigUint64 = function (byteOffset, littleEndian) {
	  if (typeof this._setBigUint64 !== 'undefined' && useNativeBigIntsIfAvailable) {
	    return BigInt(this._getBigUint64(byteOffset, littleEndian));
	  } else {
	    var lowWord = this.getUint32(littleEndian ? byteOffset : byteOffset + 4, littleEndian);
	    var highWord = this.getUint32(littleEndian ? byteOffset + 4 : byteOffset, littleEndian);
	    var result = new JSBI(2, false);

	    result.__setDigit(0, lowWord);

	    result.__setDigit(1, highWord);

	    return result;
	  }
	};

	if (!global.TextDecoder) {
	  global.TextDecoder = require("util").TextDecoder;
	}

	if (!ArrayBuffer.transfer) {
	  // Polyfill just in-case.

	  /**
	   * The static ArrayBuffer.transfer() method returns a new ArrayBuffer whose contents have
	   * been taken from the oldBuffer's data and then is either truncated or zero-extended by
	   * newByteLength. If newByteLength is undefined, the byteLength of the oldBuffer is used.
	   *
	   * This operation leaves oldBuffer in a detached state.
	   *
	   * @param {Uint8Array} oldBuffer
	   * @param {number} newByteLength
	   * @returns {ArrayBufferLike}
	   */
	  ArrayBuffer.transfer = function (oldBuffer, newByteLength) {
	    if (!(oldBuffer instanceof ArrayBuffer)) throw new TypeError('Source must be an instance of ArrayBuffer');
	    if (newByteLength <= oldBuffer.byteLength) return oldBuffer.slice(0, newByteLength);
	    var destView = new Uint8Array(new ArrayBuffer(newByteLength));
	    destView.set(new Uint8Array(oldBuffer));
	    return destView.buffer;
	  };
	}

	var PayloadBuilder =
	/*#__PURE__*/
	function () {
	  /**
	   * A payload builder made for easier handling of binary serialization of
	   * data for Wavelet to ingest.
	   */
	  function PayloadBuilder() {
	    _classCallCheck(this, PayloadBuilder);

	    this.buf = new ArrayBuffer(0);
	    this.view = new DataView(this.buf);
	    this.offset = 0;
	  }
	  /**
	   * Resizes the underlying buffer should it not be large enough to handle
	   * some chunk of data to be appended to buffer.
	   *
	   * @param {number} size Size of data to be appended to the buffer.
	   */


	  _createClass(PayloadBuilder, [{
	    key: "resizeIfNeeded",
	    value: function resizeIfNeeded(size) {
	      if (this.offset + size > this.buf.byteLength) {
	        this.buf = ArrayBuffer.transfer(this.buf, this.offset + size);
	        this.view = new DataView(this.buf);
	      }
	    }
	    /**
	     * Write a single byte to the payload buffer.
	     *
	     * @param {number} n A single byte.
	     */

	  }, {
	    key: "writeByte",
	    value: function writeByte(n) {
	      this.resizeIfNeeded(1);
	      this.view.setUint8(this.offset, n);
	      this.offset += 1;
	    }
	    /**
	     * Write an signed little-endian 16-bit integer to the payload buffer.
	     *
	     * @param {number} n
	     */

	  }, {
	    key: "writeInt16",
	    value: function writeInt16(n) {
	      this.resizeIfNeeded(2);
	      this.view.setInt16(this.offset, n, true);
	      this.offset += 2;
	    }
	    /**
	     * Write an signed little-endian 32-bit integer to the payload buffer.
	     *
	     * @param {number} n
	     */

	  }, {
	    key: "writeInt32",
	    value: function writeInt32(n) {
	      this.resizeIfNeeded(4);
	      this.view.setInt32(this.offset, n, true);
	      this.offset += 4;
	    }
	    /**
	     * Write a signed little-endian 64-bit integer to the payload buffer.
	     *
	     * @param {bigint} n
	     */

	  }, {
	    key: "writeInt64",
	    value: function writeInt64(n) {
	      this.resizeIfNeeded(8);
	      this.view.setBigInt64(this.offset, n, true);
	      this.offset += 8;
	    }
	    /**
	     * Write an unsigned little-endian 16-bit integer to the payload buffer.
	     *
	     * @param {number} n
	     */

	  }, {
	    key: "writeUint16",
	    value: function writeUint16(n) {
	      this.resizeIfNeeded(2);
	      this.view.setUint16(this.offset, n, true);
	      this.offset += 2;
	    }
	    /**
	     * Write an unsigned little-endian 32-bit integer to the payload buffer.
	     *
	     * @param {number} n
	     */

	  }, {
	    key: "writeUint32",
	    value: function writeUint32(n) {
	      this.resizeIfNeeded(4);
	      this.view.setUint32(this.offset, n, true);
	      this.offset += 4;
	    }
	    /**
	     * Write an unsigned little-endian 64-bit integer to the payload buffer.
	     *
	     * @param {bigint} n
	     */

	  }, {
	    key: "writeUint64",
	    value: function writeUint64(n) {
	      this.resizeIfNeeded(8);
	      this.view.setBigUint64(this.offset, n, true);
	      this.offset += 8;
	    }
	    /**
	     * Write a series of bytes to the payload buffer.
	     *
	     * @param {ArrayBufferLike} buf
	     */

	  }, {
	    key: "writeBytes",
	    value: function writeBytes(buf) {
	      this.resizeIfNeeded(buf.byteLength);
	      new Uint8Array(this.buf, this.offset, buf.byteLength).set(buf);
	      this.offset += buf.byteLength;
	    }
	    /**
	     * Returns the raw bytes of the payload buffer.
	     *
	     * @returns {Uint8Array}
	     */

	  }, {
	    key: "getBytes",
	    value: function getBytes() {
	      return new Uint8Array(this.buf.slice(0, this.offset));
	    }
	  }]);

	  return PayloadBuilder;
	}();

	var Contract =
	/*#__PURE__*/
	function () {
	  /**
	   * A Wavelet smart contract execution simulator.
	   *
	   * @param {Wavelet} client Client instance which is connected to a single Wavelet node.
	   * @param {string} contract_id Hex-encoded ID of a smart contract.
	   */
	  function Contract(client, contract_id) {
	    _classCallCheck(this, Contract);

	    this.client = client;
	    this.contract_id = contract_id;
	    this.contract_payload = {
	      round_idx: BigInt(0),
	      round_id: "0000000000000000000000000000000000000000000000000000000000000000",
	      transaction_id: "0000000000000000000000000000000000000000000000000000000000000000",
	      sender_id: "0000000000000000000000000000000000000000000000000000000000000000",
	      amount: BigInt(0),
	      params: new Uint8Array(new ArrayBuffer(0))
	    };
	    this.decoder = new TextDecoder();
	    this.result = null;
	    this.logs = [];
	    this.rebuildContractPayload();
	  }
	  /**
	   * Sets the consensus round index for all future simulated smart contract calls.
	   *
	   * @param {bigint} round_idx Consensus round index.
	   */


	  _createClass(Contract, [{
	    key: "setRoundIndex",
	    value: function setRoundIndex(round_idx) {
	      this.contract_payload.round_idx = round_idx;
	    }
	    /**
	     * Sets the consensus round ID for all future simulated smart contract calls.
	     *
	     * @param {string} round_id A 64-letter hex-encoded consensus round ID.
	     */

	  }, {
	    key: "setRoundID",
	    value: function setRoundID(round_id) {
	      if (round_id.length !== 64) throw new Error("round id must be 64 letters and hex-encoded");
	      this.contract_payload.round_id = round_id;
	    }
	    /**
	     * Sets the ID of the transaction used to make all future simulated smart contract calls.
	     *
	     * @param {string} transaction_id A 64-letter ex-encoded transaction ID.
	     */

	  }, {
	    key: "setTransactionID",
	    value: function setTransactionID(transaction_id) {
	      if (transaction_id.length !== 64) throw new Error("transaction id must be 64 letters and hex-encoded");
	      this.contract_payload.transaction_id = transaction_id;
	    }
	    /**
	     * Sets the sender ID for all future simulated smart contract calls.
	     *
	     * @param {string} sender_id A 64-letter hex-encoded sender wallet address ID.
	     */

	  }, {
	    key: "setSenderID",
	    value: function setSenderID(sender_id) {
	      if (sender_id.length !== 64) throw new Error("sender id must be 64 letters and hex-encoded");
	      this.contract_payload.sender_id = sender_id;
	    }
	    /**
	     * Simulates a call to the smart contract. init() must be called to initialize the WebAssembly VM
	     * before calls may be performed against this specified smart contract.
	     *
	     * @param {string} func_name Name of the smart contract function to call.
	     * @param {bigint} amount_to_send Amount of PERLs to send simultaneously to the smart contract
	     *  while calling a function.
	     * @param {...{type: ('int16'|'int32'|'int64'|'uint16'|'uint32'|'uint64'|'byte'|'raw'|'bytes'|'string'), value: number|string|ArrayBuffer|Uint8Array}} func_params Variadic list of arguments.
	     * @returns {{result: string|undefined, logs: Array<string>}}
	     */

	  }, {
	    key: "test",
	    value: function test(func_name, amount_to_send) {
	      if (this.vm === undefined) throw new Error("init() needs to be called before calling test()");
	      func_name = "_contract_" + func_name;

	      if (!(func_name in this.vm.instance.exports)) {
	        throw new Error("could not find function in smart contract");
	      }

	      for (var _len = arguments.length, func_params = new Array(_len > 2 ? _len - 2 : 0), _key = 2; _key < _len; _key++) {
	        func_params[_key - 2] = arguments[_key];
	      }

	      this.contract_payload.params = this.parseFunctionParams.apply(this, func_params);
	      this.contract_payload.amount = amount_to_send;
	      this.rebuildContractPayload(); // Clone the current browser VM's memory.

	      var copy = ArrayBuffer.transfer(this.vm.instance.exports.memory.buffer, this.vm.instance.exports.memory.buffer.byteLength); // Call the function.

	      this.vm.instance.exports[func_name](); // Collect simulated execution results.

	      var res = {
	        result: this.result,
	        logs: this.logs
	      }; // Reset the browser VM.

	      new Uint8Array(this.vm.instance.exports.memory.buffer, 0, copy.byteLength).set(copy); // Reset all func_params and results and logs.

	      this.contract_payload.params = new Uint8Array(new ArrayBuffer(0));
	      this.result = null;
	      this.logs = [];
	      return res;
	    }
	    /**
	     * Performs an official call to a specified smart contract function with a provided gas limit, and a variadic list
	     * of arguments under a provided Wavelet wallet instance.
	     *
	     * @param wallet Wavelet wallet.
	     * @param func_name Name of the smart contract function to call.
	     * @param amount_to_send Amount of PERLs to send simultaneously to the smart contract while
	     * calling a function.
	     * @param gas_limit Gas limit to expend for invoking a smart contract function.
	     * @param {...{type: ('int16'|'int32'|'int64'|'uint16'|'uint32'|'uint64'|'byte'|'raw'|'bytes'|'string'), value: number|string|ArrayBuffer|Uint8Array}} func_params Variadic list of arguments.
	     * @returns {Promise<Object>} Response from the Wavelet node.
	     */

	  }, {
	    key: "call",
	    value: function () {
	      var _call = _asyncToGenerator(
	      /*#__PURE__*/
	      regeneratorRuntime.mark(function _callee(wallet, func_name, amount_to_send, gas_limit) {
	        var _len2,
	            func_params,
	            _key2,
	            _args = arguments;

	        return regeneratorRuntime.wrap(function _callee$(_context) {
	          while (1) {
	            switch (_context.prev = _context.next) {
	              case 0:
	                for (_len2 = _args.length, func_params = new Array(_len2 > 4 ? _len2 - 4 : 0), _key2 = 4; _key2 < _len2; _key2++) {
	                  func_params[_key2 - 4] = _args[_key2];
	                }

	                _context.next = 3;
	                return this.client.transfer(wallet, this.contract_id, amount_to_send, gas_limit, func_name, this.parseFunctionParams.apply(this, func_params));

	              case 3:
	                return _context.abrupt("return", _context.sent);

	              case 4:
	              case "end":
	                return _context.stop();
	            }
	          }
	        }, _callee, this);
	      }));

	      function call(_x, _x2, _x3, _x4) {
	        return _call.apply(this, arguments);
	      }

	      return call;
	    }()
	    /**
	     * Parses smart contract function parameters as a variadic list of arguments, and translates
	     * them into an array of bytes suitable for passing on to a single smart contract invocation call.
	     *
	     * @param {...{type: ('int16'|'int32'|'int64'|'uint16'|'uint32'|'uint64'|'byte'|'raw'|'bytes'|'string'), value: number|string|ArrayBuffer|Uint8Array}} params Variadic list of arguments.
	     * @returns {Uint8Array} Parameters serialized into bytes.
	     */

	  }, {
	    key: "parseFunctionParams",
	    value: function parseFunctionParams() {
	      var builder = new PayloadBuilder();

	      for (var _len3 = arguments.length, params = new Array(_len3), _key3 = 0; _key3 < _len3; _key3++) {
	        params[_key3] = arguments[_key3];
	      }

	      params.forEach(function (param) {
	        switch (param.type) {
	          case "int16":
	            builder.writeInt16(param.value);
	            break;

	          case "int32":
	            builder.writeInt32(param.value);
	            break;

	          case "int64":
	            builder.writeInt64(param.value);

	          case "uint16":
	            builder.writeUint16(param.value);
	            break;

	          case "uint32":
	            builder.writeUint32(param.value);
	            break;

	          case "uint64":
	            builder.writeUint64(param.value);
	            break;

	          case "byte":
	            builder.writeByte(param.value);
	            break;

	          case "raw":
	            if (typeof param.value === "string") {
	              // Assume that it is hex-encoded.
	              param.value = new Uint8Array(param.value.match(/[\da-f]{2}/gi).map(function (h) {
	                return parseInt(h, 16);
	              }));
	            }

	            builder.writeBytes(param.value);
	            break;

	          case "bytes":
	            if (typeof param.value === "string") {
	              // Assume that it is hex-encoded.
	              param.value = new Uint8Array(param.value.match(/[\da-f]{2}/gi).map(function (h) {
	                return parseInt(h, 16);
	              }));
	            }

	            builder.writeUint32(param.value.byteLength);
	            builder.writeBytes(param.value);
	            break;

	          case "string":
	            builder.writeBytes(Buffer.from(param.value, 'utf8'));
	            builder.writeByte(0);
	            break;
	        }
	      });
	      return builder.getBytes();
	    }
	    /**
	     * Based on updates to simulation settings for this smart contract, re-build the
	     * smart contracts payload.
	     */

	  }, {
	    key: "rebuildContractPayload",
	    value: function rebuildContractPayload() {
	      var builder = new PayloadBuilder();
	      builder.writeUint64(this.contract_payload.round_idx);
	      builder.writeBytes(Buffer.from(this.contract_payload.round_id, "hex"));
	      builder.writeBytes(Buffer.from(this.contract_payload.transaction_id, "hex"));
	      builder.writeBytes(Buffer.from(this.contract_payload.sender_id, "hex"));
	      builder.writeUint64(this.contract_payload.amount);
	      builder.writeBytes(this.contract_payload.params);
	      this.contract_payload_buf = builder.getBytes();
	    }
	    /**
	     * Fetches and re-loads the memory of the backing WebAssembly VM for this smart contract; optionally
	     * growing the number of memory pages associated to the VM should there be not enough memory to hold
	     * any new updates to the smart contracts memory. init() must be called before this function may be
	     * called.
	     *
	     * @returns {Promise<void>}
	     */

	  }, {
	    key: "fetchAndPopulateMemoryPages",
	    value: function () {
	      var _fetchAndPopulateMemoryPages = _asyncToGenerator(
	      /*#__PURE__*/
	      regeneratorRuntime.mark(function _callee2() {
	        var account, loaded_memory, num_mem_pages, num_loaded_mem_pages;
	        return regeneratorRuntime.wrap(function _callee2$(_context2) {
	          while (1) {
	            switch (_context2.prev = _context2.next) {
	              case 0:
	                if (!(this.vm === undefined)) {
	                  _context2.next = 2;
	                  break;
	                }

	                throw new Error("init() needs to be called before calling fetchAndPopulateMemoryPages()");

	              case 2:
	                _context2.next = 4;
	                return this.client.getAccount(this.contract_id);

	              case 4:
	                account = _context2.sent;
	                _context2.next = 7;
	                return this.client.getMemoryPages(account.public_key, account.num_mem_pages);

	              case 7:
	                loaded_memory = _context2.sent;
	                num_mem_pages = this.vm.instance.exports.memory.buffer.byteLength / 65536;
	                num_loaded_mem_pages = loaded_memory.byteLength / 65536;

	                if (num_mem_pages < num_loaded_mem_pages) {
	                  this.vm.instance.exports.memory.grow(num_loaded_mem_pages - num_mem_pages);
	                }

	                new Uint8Array(this.vm.instance.exports.memory.buffer, 0, loaded_memory.byteLength).set(loaded_memory);

	              case 12:
	              case "end":
	                return _context2.stop();
	            }
	          }
	        }, _callee2, this);
	      }));

	      function fetchAndPopulateMemoryPages() {
	        return _fetchAndPopulateMemoryPages.apply(this, arguments);
	      }

	      return fetchAndPopulateMemoryPages;
	    }()
	    /**
	     * Downloads smart contract code from the Wavelet node if available, and initializes
	     * a WebAssembly VM to simulate function calls against the contract.
	     *
	     * @returns {Promise<void>}
	     */

	  }, {
	    key: "init",
	    value: function () {
	      var _init = _asyncToGenerator(
	      /*#__PURE__*/
	      regeneratorRuntime.mark(function _callee3() {
	        var _this = this;

	        var imports;
	        return regeneratorRuntime.wrap(function _callee3$(_context3) {
	          while (1) {
	            switch (_context3.prev = _context3.next) {
	              case 0:
	                _context3.next = 2;
	                return this.client.getCode(this.contract_id);

	              case 2:
	                this.code = _context3.sent;
	                imports = {
	                  env: {
	                    abort: function abort() {},
	                    _send_transaction: function _send_transaction(tag, payload_ptr, payload_len) {
	                      var payload_view = new Uint8Array(_this.vm.instance.exports.memory.buffer, payload_ptr, payload_len);

	                      var payload = _this.decoder.decode(payload_view);

	                      console.log("Sent transaction with tag ".concat(tag, " and payload ").concat(params, "."));
	                    },
	                    _payload_len: function _payload_len() {
	                      return _this.contract_payload_buf.byteLength;
	                    },
	                    _payload: function _payload(payload_ptr) {
	                      var view = new Uint8Array(_this.vm.instance.exports.memory.buffer, payload_ptr, _this.contract_payload_buf.byteLength);
	                      view.set(_this.contract_payload_buf);
	                    },
	                    _result: function _result(ptr, len) {
	                      _this.result = _this.decoder.decode(new Uint8Array(_this.vm.instance.exports.memory.buffer, ptr, len));
	                    },
	                    _log: function _log(ptr, len) {
	                      var view = new Uint8Array(_this.vm.instance.exports.memory.buffer, ptr, len);

	                      _this.logs.push(_this.decoder.decode(view));
	                    },
	                    _verify_ed25519: function _verify_ed25519() {},
	                    _hash_blake2b_256: function _hash_blake2b_256() {},
	                    _hash_sha256: function _hash_sha256() {},
	                    _hash_sha512: function _hash_sha512() {}
	                  }
	                };
	                _context3.next = 6;
	                return WebAssembly.instantiate(this.code, imports);

	              case 6:
	                this.vm = _context3.sent;
	                _context3.next = 9;
	                return this.fetchAndPopulateMemoryPages();

	              case 9:
	              case "end":
	                return _context3.stop();
	            }
	          }
	        }, _callee3, this);
	      }));

	      function init() {
	        return _init.apply(this, arguments);
	      }

	      return init;
	    }()
	  }]);

	  return Contract;
	}();

	var Wavelet =
	/*#__PURE__*/
	function () {
	  /**
	   * A client for interacting with the HTTP API of a Wavelet node.
	   *
	   * @param {string} host Address to the HTTP API of a Wavelet node.
	   * @param {Object=} opts Default options to be passed for making any HTTP request calls using this client instance (optional).
	   */
	  function Wavelet(host) {
	    var opts = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : {};

	    _classCallCheck(this, Wavelet);

	    this.host = host;
	    this.opts = _objectSpread2({}, opts, {
	      transformRequest: [function (data, headers) {
	        headers.common = {};
	        return data;
	      }]
	    });
	  }
	  /**
	   * Query for information about the node you are connected to.
	   *
	   * @param {Object=} opts Options to be passed on for making the specified HTTP request call (optional).
	   * @returns {Promise<Object>}
	   */


	  _createClass(Wavelet, [{
	    key: "getNodeInfo",
	    value: function () {
	      var _getNodeInfo = _asyncToGenerator(
	      /*#__PURE__*/
	      regeneratorRuntime.mark(function _callee4(opts) {
	        return regeneratorRuntime.wrap(function _callee4$(_context4) {
	          while (1) {
	            switch (_context4.prev = _context4.next) {
	              case 0:
	                _context4.next = 2;
	                return axios.get("".concat(this.host, "/ledger"), _objectSpread2({}, this.opts, {}, opts));

	              case 2:
	                return _context4.abrupt("return", _context4.sent.data);

	              case 3:
	              case "end":
	                return _context4.stop();
	            }
	          }
	        }, _callee4, this);
	      }));

	      function getNodeInfo(_x5) {
	        return _getNodeInfo.apply(this, arguments);
	      }

	      return getNodeInfo;
	    }()
	    /**
	     * Query for details of a transaction.
	     *
	     * @param {string} id Hex-encoded transaction ID.
	     * @param {Object=} opts Options to be passed on for making the specified HTTP request call (optional).
	     * @returns {Promise<Object>}
	     */

	  }, {
	    key: "getTransaction",
	    value: function () {
	      var _getTransaction = _asyncToGenerator(
	      /*#__PURE__*/
	      regeneratorRuntime.mark(function _callee5(id) {
	        var opts,
	            _args5 = arguments;
	        return regeneratorRuntime.wrap(function _callee5$(_context5) {
	          while (1) {
	            switch (_context5.prev = _context5.next) {
	              case 0:
	                opts = _args5.length > 1 && _args5[1] !== undefined ? _args5[1] : {};
	                _context5.next = 3;
	                return axios.get("".concat(this.host, "/tx/").concat(id), _objectSpread2({}, this.opts, {}, opts));

	              case 3:
	                return _context5.abrupt("return", _context5.sent.data);

	              case 4:
	              case "end":
	                return _context5.stop();
	            }
	          }
	        }, _callee5, this);
	      }));

	      function getTransaction(_x6) {
	        return _getTransaction.apply(this, arguments);
	      }

	      return getTransaction;
	    }()
	    /**
	     * Query for details of an account; whether it be a smart contract or a user.
	     *
	     * @param {string} id Hex-encoded account/smart contract address.
	     * @param {Object=} opts Options to be passed on for making the specified HTTP request call (optional).
	     * @returns {Promise<{public_key: string, nonce: bigint, balance: bigint, stake: bigint, reward: bigint, is_contract: boolean, num_mem_pages: bigint}>}
	     */

	  }, {
	    key: "getAccount",
	    value: function () {
	      var _getAccount = _asyncToGenerator(
	      /*#__PURE__*/
	      regeneratorRuntime.mark(function _callee6(id) {
	        var opts,
	            _args6 = arguments;
	        return regeneratorRuntime.wrap(function _callee6$(_context6) {
	          while (1) {
	            switch (_context6.prev = _context6.next) {
	              case 0:
	                opts = _args6.length > 1 && _args6[1] !== undefined ? _args6[1] : {};
	                _context6.next = 3;
	                return axios.get("".concat(this.host, "/accounts/").concat(id), _objectSpread2({}, this.opts, {}, opts));

	              case 3:
	                return _context6.abrupt("return", _context6.sent.data);

	              case 4:
	              case "end":
	                return _context6.stop();
	            }
	          }
	        }, _callee6, this);
	      }));

	      function getAccount(_x7) {
	        return _getAccount.apply(this, arguments);
	      }

	      return getAccount;
	    }()
	    /**
	     * Query for the raw WebAssembly code of a smart contract.
	     *
	     * @param string} id Hex-encoded ID of the smart contract.
	     * @param {Object=} opts  Options to be passed on for making the specified HTTP request call (optional).
	     * @returns {Promise<Uint8Array>}
	     */

	  }, {
	    key: "getCode",
	    value: function () {
	      var _getCode = _asyncToGenerator(
	      /*#__PURE__*/
	      regeneratorRuntime.mark(function _callee7(id) {
	        var opts,
	            _args7 = arguments;
	        return regeneratorRuntime.wrap(function _callee7$(_context7) {
	          while (1) {
	            switch (_context7.prev = _context7.next) {
	              case 0:
	                opts = _args7.length > 1 && _args7[1] !== undefined ? _args7[1] : {};
	                _context7.t0 = Uint8Array;
	                _context7.next = 4;
	                return axios.get("".concat(this.host, "/contract/").concat(id), _objectSpread2({}, this.opts, {}, opts, {
	                  responseType: 'arraybuffer',
	                  responseEncoding: 'binary'
	                }));

	              case 4:
	                _context7.t1 = _context7.sent.data;
	                return _context7.abrupt("return", new _context7.t0(_context7.t1));

	              case 6:
	              case "end":
	                return _context7.stop();
	            }
	          }
	        }, _callee7, this);
	      }));

	      function getCode(_x8) {
	        return _getCode.apply(this, arguments);
	      }

	      return getCode;
	    }()
	    /**
	     * Query for the amalgamated WebAssembly VM memory of a given smart contract.
	     *
	     * @param {string} id Hex-encoded ID of the smart contract.
	     * @param {number} num_mem_pages Number of memory pages the smart contract has.
	     * @param {Object=} opts  Options to be passed on for making the specified HTTP request call (optional).
	     * @returns {Promise<Uint8Array>} The memory of the given smart contract, which may be used to
	     *  initialize a WebAssembly VM with (either on browser/desktop).
	     */

	  }, {
	    key: "getMemoryPages",
	    value: function () {
	      var _getMemoryPages = _asyncToGenerator(
	      /*#__PURE__*/
	      regeneratorRuntime.mark(function _callee9(id, num_mem_pages) {
	        var _this2 = this;

	        var opts,
	            memory,
	            reqs,
	            _loop,
	            idx,
	            _args9 = arguments;

	        return regeneratorRuntime.wrap(function _callee9$(_context9) {
	          while (1) {
	            switch (_context9.prev = _context9.next) {
	              case 0:
	                opts = _args9.length > 2 && _args9[2] !== undefined ? _args9[2] : {};

	                if (!(num_mem_pages === 0)) {
	                  _context9.next = 3;
	                  break;
	                }

	                throw new Error("num pages cannot be zero");

	              case 3:
	                memory = new Uint8Array(new ArrayBuffer(65536 * num_mem_pages));
	                reqs = [];

	                _loop = function _loop(idx) {
	                  reqs.push(_asyncToGenerator(
	                  /*#__PURE__*/
	                  regeneratorRuntime.mark(function _callee8() {
	                    var res, page;
	                    return regeneratorRuntime.wrap(function _callee8$(_context8) {
	                      while (1) {
	                        switch (_context8.prev = _context8.next) {
	                          case 0:
	                            _context8.prev = 0;
	                            _context8.next = 3;
	                            return axios.get("".concat(_this2.host, "/contract/").concat(id, "/page/").concat(idx), _objectSpread2({}, _this2.opts, {}, opts, {
	                              responseType: 'arraybuffer',
	                              responseEncoding: 'binary'
	                            }));

	                          case 3:
	                            res = _context8.sent;

	                            if (res.status === 200) {
	                              page = new Uint8Array(res.data);
	                              memory.set(page, 65536 * idx);
	                            }

	                            _context8.next = 9;
	                            break;

	                          case 7:
	                            _context8.prev = 7;
	                            _context8.t0 = _context8["catch"](0);

	                          case 9:
	                          case "end":
	                            return _context8.stop();
	                        }
	                      }
	                    }, _callee8, null, [[0, 7]]);
	                  }))());
	                };

	                for (idx = 0; idx < num_mem_pages; idx++) {
	                  _loop(idx);
	                }

	                _context9.next = 9;
	                return Promise.all(reqs);

	              case 9:
	                return _context9.abrupt("return", memory);

	              case 10:
	              case "end":
	                return _context9.stop();
	            }
	          }
	        }, _callee9);
	      }));

	      function getMemoryPages(_x9, _x10) {
	        return _getMemoryPages.apply(this, arguments);
	      }

	      return getMemoryPages;
	    }()
	    /**
	     * Transfer some amount of PERLs to a recipient, or invoke a function on
	     * a smart contract should the recipient specified be a smart contract.
	     *
	     * @param {nacl.SignKeyPair} wallet
	     * @param {string} recipient Hex-encoded recipient/smart contract address.
	     * @param {bigint} amount Amount of PERLs to send.
	     * @param {bigint=} gas_limit Gas limit to expend for invoking a smart contract function (optional).
	     * @param {string=} func_name Name of the function to invoke on a smart contract (optional).
	     * @param {Uint8Array=} func_payload Binary-serialized parameters to be used to invoke a smart contract function (optional).
	     * @param {Object=} opts Options to be passed on for making the specified HTTP request call (optional).
	     * @returns {Promise<Object>}
	     */

	  }, {
	    key: "transfer",
	    value: function () {
	      var _transfer = _asyncToGenerator(
	      /*#__PURE__*/
	      regeneratorRuntime.mark(function _callee10(wallet, recipient, amount) {
	        var gas_limit,
	            func_name,
	            func_payload,
	            opts,
	            builder,
	            func_name_buf,
	            func_payload_buf,
	            _args10 = arguments;
	        return regeneratorRuntime.wrap(function _callee10$(_context10) {
	          while (1) {
	            switch (_context10.prev = _context10.next) {
	              case 0:
	                gas_limit = _args10.length > 3 && _args10[3] !== undefined ? _args10[3] : 0;
	                func_name = _args10.length > 4 && _args10[4] !== undefined ? _args10[4] : "";
	                func_payload = _args10.length > 5 && _args10[5] !== undefined ? _args10[5] : new Uint8Array(new ArrayBuffer(0));
	                opts = _args10.length > 6 && _args10[6] !== undefined ? _args10[6] : {};
	                builder = new PayloadBuilder();
	                builder.writeBytes(Buffer.from(recipient, "hex"));
	                builder.writeUint64(amount);

	                if (JSBI.GT(gas_limit, BigInt(0)) || func_name.length > 0 || func_payload.length > 0) {
	                  if (func_name.length === 0) {
	                    // Default to 'on_money_received' if no func name is specified.
	                    func_name = "on_money_received";
	                  }

	                  func_name_buf = Buffer.from(func_name, 'utf8');
	                  func_payload_buf = new Uint8Array(func_payload);
	                  builder.writeUint64(gas_limit);
	                  builder.writeUint32(func_name_buf.byteLength);
	                  builder.writeBytes(func_name_buf);
	                  builder.writeUint32(func_payload_buf.byteLength);
	                  builder.writeBytes(func_payload_buf);
	                }

	                _context10.next = 10;
	                return this.sendTransaction(wallet, TAG_TRANSFER, builder.getBytes(), opts);

	              case 10:
	                return _context10.abrupt("return", _context10.sent);

	              case 11:
	              case "end":
	                return _context10.stop();
	            }
	          }
	        }, _callee10, this);
	      }));

	      function transfer(_x11, _x12, _x13) {
	        return _transfer.apply(this, arguments);
	      }

	      return transfer;
	    }()
	    /**
	     * Stake some amount of PERLs which is deducted from your wallets balance.
	     *
	     * @param {nacl.SignKeyPair} wallet Wavelet wallet.
	     * @param {bigint} amount Amount of PERLs to stake.
	     * @param {Object=} opts Options to be passed on for making the specified HTTP request call (optional).
	     * @returns {Promise<*>}
	     */

	  }, {
	    key: "placeStake",
	    value: function () {
	      var _placeStake = _asyncToGenerator(
	      /*#__PURE__*/
	      regeneratorRuntime.mark(function _callee11(wallet, amount) {
	        var opts,
	            builder,
	            _args11 = arguments;
	        return regeneratorRuntime.wrap(function _callee11$(_context11) {
	          while (1) {
	            switch (_context11.prev = _context11.next) {
	              case 0:
	                opts = _args11.length > 2 && _args11[2] !== undefined ? _args11[2] : {};
	                builder = new PayloadBuilder();
	                builder.writeByte(1);
	                builder.writeUint64(amount);
	                _context11.next = 6;
	                return this.sendTransaction(wallet, TAG_STAKE, builder.getBytes(), opts);

	              case 6:
	                return _context11.abrupt("return", _context11.sent);

	              case 7:
	              case "end":
	                return _context11.stop();
	            }
	          }
	        }, _callee11, this);
	      }));

	      function placeStake(_x14, _x15) {
	        return _placeStake.apply(this, arguments);
	      }

	      return placeStake;
	    }()
	    /**
	     * Withdraw stake, which is immediately converted into PERLS into your balance.
	     *
	     * @param {nacl.SignKeyPair} wallet Wavelet wallet.
	     * @param {bigint} amount Amount of PERLs to withdraw from your stake.
	     * @param {Object=} opts Options to be passed on for making the specified HTTP request call (optional).
	     * @returns {Promise<*>}
	     */

	  }, {
	    key: "withdrawStake",
	    value: function () {
	      var _withdrawStake = _asyncToGenerator(
	      /*#__PURE__*/
	      regeneratorRuntime.mark(function _callee12(wallet, amount) {
	        var opts,
	            builder,
	            _args12 = arguments;
	        return regeneratorRuntime.wrap(function _callee12$(_context12) {
	          while (1) {
	            switch (_context12.prev = _context12.next) {
	              case 0:
	                opts = _args12.length > 2 && _args12[2] !== undefined ? _args12[2] : {};
	                builder = new PayloadBuilder();
	                builder.writeByte(0);
	                builder.writeUint64(amount);
	                _context12.next = 6;
	                return this.sendTransaction(wallet, TAG_STAKE, builder.getBytes(), opts);

	              case 6:
	                return _context12.abrupt("return", _context12.sent);

	              case 7:
	              case "end":
	                return _context12.stop();
	            }
	          }
	        }, _callee12, this);
	      }));

	      function withdrawStake(_x16, _x17) {
	        return _withdrawStake.apply(this, arguments);
	      }

	      return withdrawStake;
	    }()
	    /**
	     * Request a withdrawal of reward; which after some number of consensus
	     * rounds will then convert into PERLs into your balance.
	     *
	     * @param {nacl.SignKeyPair} wallet Wavelet wallet.
	     * @param {bigint} amount Amount of PERLs to request to withdraw from your rewards.
	     * @param {Object=} opts Options to be passed on for making the specified HTTP request call (optional).
	     * @returns {Promise<*>}
	     */

	  }, {
	    key: "withdrawReward",
	    value: function () {
	      var _withdrawReward = _asyncToGenerator(
	      /*#__PURE__*/
	      regeneratorRuntime.mark(function _callee13(wallet, amount) {
	        var opts,
	            builder,
	            _args13 = arguments;
	        return regeneratorRuntime.wrap(function _callee13$(_context13) {
	          while (1) {
	            switch (_context13.prev = _context13.next) {
	              case 0:
	                opts = _args13.length > 2 && _args13[2] !== undefined ? _args13[2] : {};
	                builder = new PayloadBuilder();
	                builder.writeByte(2);
	                builder.writeUint64(amount);
	                _context13.next = 6;
	                return this.sendTransaction(wallet, TAG_STAKE, builder.getBytes(), opts);

	              case 6:
	                return _context13.abrupt("return", _context13.sent);

	              case 7:
	              case "end":
	                return _context13.stop();
	            }
	          }
	        }, _callee13, this);
	      }));

	      function withdrawReward(_x18, _x19) {
	        return _withdrawReward.apply(this, arguments);
	      }

	      return withdrawReward;
	    }()
	    /**
	     * Deploy a smart contract with a specified gas limit and set of parameters.
	     *
	     * @param {nacl.SignKeyPair} wallet Wavelet wallet.
	     * @param {Uint8Array} code Binary of your smart contracts WebAssembly code.
	     * @param {bigint} gas_limit Gas limit to expend for creating your smart contract, and invoking its init() function.
	     * @param {Object=} params Parameters to be used for invoking your smart contracts init() function.
	     * @param {Object=} opts Options to be passed on for making the specified HTTP request call (optional).
	     * @returns {Promise<*>}
	     */

	  }, {
	    key: "deployContract",
	    value: function () {
	      var _deployContract = _asyncToGenerator(
	      /*#__PURE__*/
	      regeneratorRuntime.mark(function _callee14(wallet, code, gas_limit) {
	        var params,
	            opts,
	            builder,
	            _args14 = arguments;
	        return regeneratorRuntime.wrap(function _callee14$(_context14) {
	          while (1) {
	            switch (_context14.prev = _context14.next) {
	              case 0:
	                params = _args14.length > 3 && _args14[3] !== undefined ? _args14[3] : [];
	                opts = _args14.length > 4 && _args14[4] !== undefined ? _args14[4] : {};
	                code = new Uint8Array(code);
	                params = new Uint8Array(params);
	                builder = new PayloadBuilder();
	                builder.writeUint64(gas_limit);
	                builder.writeUint32(params.byteLength);
	                builder.writeBytes(params);
	                builder.writeBytes(code);
	                _context14.next = 11;
	                return this.sendTransaction(wallet, TAG_CONTRACT, builder.getBytes(), opts);

	              case 11:
	                return _context14.abrupt("return", _context14.sent);

	              case 12:
	              case "end":
	                return _context14.stop();
	            }
	          }
	        }, _callee14, this);
	      }));

	      function deployContract(_x20, _x21, _x22) {
	        return _deployContract.apply(this, arguments);
	      }

	      return deployContract;
	    }()
	    /**
	     * Send a transaction on behalf of a specified wallet with a designated
	     * tag and payload.
	     *
	     * @param {nacl.SignKeyPair} wallet Wavelet wallet.
	     * @param {number} tag Tag of the transaction.
	     * @param {Uint8Array} payload Binary payload of the transaction.
	     * @param {Object=} opts Options to be passed on for making the specified HTTP request call (optional).
	     * @returns {Promise<*>}
	     */

	  }, {
	    key: "sendTransaction",
	    value: function () {
	      var _sendTransaction = _asyncToGenerator(
	      /*#__PURE__*/
	      regeneratorRuntime.mark(function _callee15(wallet, tag, payload) {
	        var opts,
	            payload_hex,
	            builder,
	            signature,
	            sender,
	            req,
	            _args15 = arguments;
	        return regeneratorRuntime.wrap(function _callee15$(_context15) {
	          while (1) {
	            switch (_context15.prev = _context15.next) {
	              case 0:
	                opts = _args15.length > 3 && _args15[3] !== undefined ? _args15[3] : {};
	                payload_hex = Buffer.from(payload).toString("hex");
	                builder = new PayloadBuilder();
	                builder.writeUint64(BigInt(0));
	                builder.writeByte(tag);
	                builder.writeBytes(payload);
	                signature = Buffer.from(nacl.sign.detached(builder.getBytes(), wallet.secretKey)).toString("hex");
	                sender = Buffer.from(wallet.publicKey).toString("hex");
	                req = {
	                  sender: sender,
	                  tag: tag,
	                  payload: payload_hex,
	                  signature: signature
	                };
	                _context15.next = 11;
	                return axios.post("".concat(this.host, "/tx/send"), JSON.stringify(req), _objectSpread2({}, this.opts, {}, opts));

	              case 11:
	                return _context15.abrupt("return", _context15.sent.data);

	              case 12:
	              case "end":
	                return _context15.stop();
	            }
	          }
	        }, _callee15, this);
	      }));

	      function sendTransaction(_x23, _x24, _x25) {
	        return _sendTransaction.apply(this, arguments);
	      }

	      return sendTransaction;
	    }()
	    /**
	     * Poll for updates to accounts.
	     *
	     * @param callbacks
	     * @param {{id: string|undefined}} opts
	     * @returns {Promise<WebSocketClient>} Websocket client.
	     */

	  }, {
	    key: "pollAccounts",
	    value: function () {
	      var _pollAccounts = _asyncToGenerator(
	      /*#__PURE__*/
	      regeneratorRuntime.mark(function _callee16() {
	        var callbacks,
	            opts,
	            params,
	            _args16 = arguments;
	        return regeneratorRuntime.wrap(function _callee16$(_context16) {
	          while (1) {
	            switch (_context16.prev = _context16.next) {
	              case 0:
	                callbacks = _args16.length > 0 && _args16[0] !== undefined ? _args16[0] : {};
	                opts = _args16.length > 1 && _args16[1] !== undefined ? _args16[1] : {};
	                params = {};
	                if (opts && opts.id && typeof opts.id === "string" && opts.id.length === 64) params.id = opts.id;
	                _context16.next = 6;
	                return this.pollWebsocket('/poll/accounts', params, function (data) {
	                  if (callbacks && callbacks.onAccountUpdated) {
	                    if (!Array.isArray(data)) {
	                      data = [data];
	                    }

	                    data.forEach(function (item) {
	                      return callbacks.onAccountUpdated(item);
	                    });
	                  }
	                });

	              case 6:
	                return _context16.abrupt("return", _context16.sent);

	              case 7:
	              case "end":
	                return _context16.stop();
	            }
	          }
	        }, _callee16, this);
	      }));

	      function pollAccounts() {
	        return _pollAccounts.apply(this, arguments);
	      }

	      return pollAccounts;
	    }()
	    /**
	     * Poll for updates to either all transactions in the ledger, or transactions made by a certain sender, or
	     * transactions made by a certain creator, or transactions with a specific tag, or just a single transaction.
	     *
	     * @param callbacks
	     * @param {{id: string|undefined, tag: number|undefined, sender: string|undefined, creator: string|undefined}} opts
	     * @returns {Promise<WebSocketClient>} Websocket client.
	     */

	  }, {
	    key: "pollTransactions",
	    value: function () {
	      var _pollTransactions = _asyncToGenerator(
	      /*#__PURE__*/
	      regeneratorRuntime.mark(function _callee17() {
	        var callbacks,
	            opts,
	            params,
	            _args17 = arguments;
	        return regeneratorRuntime.wrap(function _callee17$(_context17) {
	          while (1) {
	            switch (_context17.prev = _context17.next) {
	              case 0:
	                callbacks = _args17.length > 0 && _args17[0] !== undefined ? _args17[0] : {};
	                opts = _args17.length > 1 && _args17[1] !== undefined ? _args17[1] : {};
	                params = {};
	                if (opts && opts.id && typeof opts.id === "string" && opts.id.length === 64) params.id = opts.id;
	                if (opts && opts.tag && typeof opts.tag === "number") params.tag = opts.tag;
	                if (opts && opts.sender && typeof opts.sender === "string" && opts.sender.length === 64) params.sender = opts.sender;
	                if (opts && opts.creator && typeof opts.creator === "string" && opts.creator.length === 64) params.creator = opts.creator;
	                _context17.next = 9;
	                return this.pollWebsocket('/poll/tx', params, function (data) {
	                  if (!Array.isArray(data)) {
	                    data = [data];
	                  }

	                  data.forEach(function (item) {
	                    switch (item.event) {
	                      case "rejected":
	                        if (callbacks && callbacks.onTransactionRejected) {
	                          callbacks.onTransactionRejected(item);
	                        }

	                        break;

	                      case "applied":
	                        if (callbacks && callbacks.onTransactionApplied) {
	                          callbacks.onTransactionApplied(item);
	                        }

	                        break;
	                    }
	                  });
	                });

	              case 9:
	                return _context17.abrupt("return", _context17.sent);

	              case 10:
	              case "end":
	                return _context17.stop();
	            }
	          }
	        }, _callee17, this);
	      }));

	      function pollTransactions() {
	        return _pollTransactions.apply(this, arguments);
	      }

	      return pollTransactions;
	    }()
	    /**
	     * Poll for finality of consensus rounds, or the pruning of consensus rounds.
	     *
	     * @param callbacks
	     * @returns {Promise<WebSocketClient>} Websocket client.
	     */

	  }, {
	    key: "pollConsensus",
	    value: function () {
	      var _pollConsensus = _asyncToGenerator(
	      /*#__PURE__*/
	      regeneratorRuntime.mark(function _callee18() {
	        var callbacks,
	            _args18 = arguments;
	        return regeneratorRuntime.wrap(function _callee18$(_context18) {
	          while (1) {
	            switch (_context18.prev = _context18.next) {
	              case 0:
	                callbacks = _args18.length > 0 && _args18[0] !== undefined ? _args18[0] : {};
	                _context18.next = 3;
	                return this.pollWebsocket('/poll/consensus', {}, function (data) {
	                  switch (data.event) {
	                    case "round_end":
	                      if (callbacks && callbacks.onRoundEnded) {
	                        callbacks.onRoundEnded(data);
	                      }

	                      break;

	                    case "prune":
	                      if (callbacks && callbacks.onRoundPruned) {
	                        callbacks.onRoundPruned(data);
	                      }

	                      break;
	                  }
	                });

	              case 3:
	                return _context18.abrupt("return", _context18.sent);

	              case 4:
	              case "end":
	                return _context18.stop();
	            }
	          }
	        }, _callee18, this);
	      }));

	      function pollConsensus() {
	        return _pollConsensus.apply(this, arguments);
	      }

	      return pollConsensus;
	    }()
	    /**
	     * A generic setup function for listening for websocket events from a Wavelet node.
	     *
	     * @param {string} endpoint Websocket endpoint.
	     * @param {Object=} params Query parameters to connect to the endpoint with.
	     * @param {Object=} callback Callback function for each new event from the websocket.
	     * @returns {Promise<WebSocketClient>} Websocket client.
	     */

	  }, {
	    key: "pollWebsocket",
	    value: function pollWebsocket(endpoint) {
	      var params = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : {};
	      var callback = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : {};
	      var info = url.parse(this.host);
	      info.protocol = info.protocol === "https:" ? "wss:" : "ws:";
	      info.pathname = endpoint;
	      info.query = params;
	      return new Promise(function (resolve, reject) {
	        var client = new WebSocketClient(url.format(info));

	        client.onopen = function () {
	          resolve(client);
	        };

	        client.onerror = function () {
	          reject(new Error("Failed to connect to ".concat(url.format(info), ".")));
	        };

	        client.onmessage = function (msg) {
	          if (typeof msg.data !== 'string') return;
	          if (callback) callback(JSON.parse(msg.data));
	        };
	      });
	    }
	    /**
	     * Randomly generate a new Wavelet wallet.
	     *
	     * @returns {nacl.SignKeyPair}
	     */

	  }], [{
	    key: "generateNewWallet",
	    value: function generateNewWallet() {
	      return nacl.sign.keyPair();
	    }
	    /**
	     * Load a Wavelet wallet given a hex-encoded private key.
	     *
	     * @param {string} private_key_hex Hex-encoded private key.
	     * @returns {nacl.SignKeyPair} Wavelet wallet.
	     */

	  }, {
	    key: "loadWalletFromPrivateKey",
	    value: function loadWalletFromPrivateKey(private_key_hex) {
	      return nacl.sign.keyPair.fromSecretKey(Buffer.from(private_key_hex, "hex"));
	    }
	    /**
	     * Parse a transactions payload content into JSON.
	     *
	     * @param {(TAG_NOP|TAG_TRANSFER|TAG_CONTRACT|TAG_STAKE|TAG_BATCH)} tag Tag of a transaction.
	     * @param {string} payload Binary-serialized payload of a transaction.
	     * @returns {{amount: bigint, recipient: string}|{}|Array|{amount: bigint}} Decoded payload of a transaction.
	     */

	  }, {
	    key: "parseTransaction",
	    value: function parseTransaction(tag, payload) {
	      switch (tag) {
	        case TAG_NOP:
	          {
	            return {};
	          }

	        case TAG_TRANSFER:
	          {
	            var buf = str2ab(atob(payload));

	            if (buf.byteLength < 32 + 8) {
	              throw new Error("transfer: payload does not contain recipient id or amount");
	            }

	            var view = new DataView(buf);
	            var recipient = Buffer.from(new Uint8Array(buf, 0, 32)).toString('hex');
	            var amount = view.getBigUint64(32, true);
	            var tx = {
	              recipient: recipient,
	              amount: amount
	            };

	            if (buf.byteLength > 32 + 8) {
	              tx.gasLimit = view.getBigUint64(32 + 8, true);
	              var funcNameLen = view.getUint32(32 + 8 + 8, true);
	              tx.funcName = Buffer.from(new Uint8Array(buf, 32 + 8 + 8 + 4, funcNameLen)).toString("utf8");
	              var funcPayloadLen = view.getUint32(32 + 8 + 8 + 4 + funcNameLen, true);
	              tx.payload = Buffer.from(new Uint8Array(buf, 32 + 8 + 8 + 4 + funcNameLen + 4, funcPayloadLen));
	            }

	            return tx;
	          }

	        case TAG_CONTRACT:
	          {
	            var _buf = str2ab(atob(payload));

	            if (_buf.byteLength < 12) {
	              throw new Error("contract: payload is malformed");
	            }

	            var _view = new DataView(_buf);

	            var _tx = {};
	            _tx.gasLimit = _view.getBigUint64(0, true);

	            var payloadLen = _view.getUint32(8, true);

	            _tx.payload = Buffer.from(new Uint8Array(_buf, 8 + 4, payloadLen));
	            _tx.code = Buffer.from(new Uint8Array(_buf, 8 + 4 + payloadLen));
	            return _tx;
	          }

	        case TAG_STAKE:
	          {
	            var _buf2 = str2ab(atob(payload));

	            if (_buf2.byteLength !== 9) {
	              throw new Error("stake: payload must be exactly 9 bytes");
	            }

	            var _view2 = new DataView(_buf2);

	            var opcode = _view2.getUint8(0);

	            if (opcode < 0 || opcode > 2) {
	              throw new Error("stake: opcode must be between 0 to 2");
	            }

	            var _amount = _view2.getBigUint64(1, true);

	            var _tx2 = {
	              amount: _amount
	            };

	            switch (opcode) {
	              case 0:
	                _tx2.op = "withdraw_stake";
	                break;

	              case 1:
	                _tx2.op = "place_stake";
	                break;

	              case 2:
	                _tx2.op = "withdraw_reward";
	                break;
	            }

	            return _tx2;
	          }

	        case TAG_BATCH:
	          {
	            var _buf3 = str2ab(atob(payload));

	            var _view3 = new DataView(_buf3);

	            var len = _view3.getUint8(0);

	            var transactions = [];

	            for (var i = 0, offset = 1; i < len; i++) {
	              var _tag = _view3.getUint8(offset);

	              offset += 1;

	              var _payloadLen = _view3.getUint32(offset, true);

	              offset += 4;

	              var _payload2 = Buffer.from(new Uint8Array(_buf3, offset, _payloadLen));

	              offset += _payloadLen;
	              transactions.push(this.parseTransaction(_tag, _payload2));
	            }

	            return transactions;
	          }

	        default:
	          throw new Error("unknown tag type: ".concat(tag));
	      }
	    }
	  }]);

	  return Wavelet;
	}();

	var main = {
	  Wavelet: Wavelet,
	  Contract: Contract,
	  TAG_NOP: TAG_NOP,
	  TAG_TRANSFER: TAG_TRANSFER,
	  TAG_CONTRACT: TAG_CONTRACT,
	  TAG_STAKE: TAG_STAKE,
	  TAG_BATCH: TAG_BATCH
	};

	return main;

}));
