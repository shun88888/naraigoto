// Polyfills for React Native environment

// Force override Reflect.construct only when the native implementation is missing.
const reflect = global.Reflect || (global.Reflect = {});

const hasNativeReflectConstruct = (() => {
  if (typeof reflect.construct === 'undefined') return false;
  if (reflect.construct.sham) return false;
  if (typeof Proxy === 'function') return true;
  try {
    Boolean.prototype.valueOf.call(reflect.construct(Boolean, [], function() {}));
    return true;
  } catch (err) {
    return false;
  }
})();

if (!hasNativeReflectConstruct) {
  const setPrototypeOf = require('./polyfills/setPrototypeOf');
  const constructPolyfill = function(target, argumentsList, newTarget) {
    const args = argumentsList || [];
    if (typeof Reflect !== 'undefined' && Reflect.construct) {
      return Reflect.construct(target, args, newTarget || target);
    }
    const a = [null];
    a.push.apply(a, args);
    const Bound = Function.bind.apply(target, a);
    const instance = new Bound();
    const ctor = newTarget || target;
    if (ctor && ctor.prototype) {
      if (setPrototypeOf) {
        setPrototypeOf(instance, ctor.prototype);
      } else {
        instance.__proto__ = ctor.prototype; // eslint-disable-line no-proto
      }
    }
    return instance;
  };

  reflect.construct = constructPolyfill;

  // Define configurable property descriptor
  Object.defineProperty(reflect, 'construct', {
    value: constructPolyfill,
    writable: true,
    configurable: true,
    enumerable: false
  });
}

// Fix for Object.setPrototypeOf
if (!Object.setPrototypeOf) {
  Object.setPrototypeOf = function(obj, proto) {
    obj.__proto__ = proto;
    return obj;
  };
}

// Fix for Symbol if missing
if (typeof Symbol === 'undefined') {
  require('es6-symbol/implement');
}

// Fix for Promise if missing
if (typeof Promise === 'undefined') {
  global.Promise = require('es6-promise').Promise;
}

// Fix for Array methods
if (!Array.prototype.includes) {
  Array.prototype.includes = function(searchElement, fromIndex) {
    return this.indexOf(searchElement, fromIndex) !== -1;
  };
}

// Fix for Object.assign
if (!Object.assign) {
  Object.assign = function(target) {
    for (var i = 1; i < arguments.length; i++) {
      var source = arguments[i];
      for (var key in source) {
        if (Object.prototype.hasOwnProperty.call(source, key)) {
          target[key] = source[key];
        }
      }
    }
    return target;
  };
}
