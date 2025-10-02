var setPrototypeOf = require('./setPrototypeOf');

function hasNativeReflectConstruct() {
  if (typeof Reflect === 'undefined' || !Reflect.construct) return false;
  if (Reflect.construct.sham) return false;
  if (typeof Proxy === 'function') return true;
  try {
    Boolean.prototype.valueOf.call(Reflect.construct(Boolean, [], function() {}));
    return true;
  } catch (err) {
    return false;
  }
}

var _construct = function(Parent, args, Class) {
  if (hasNativeReflectConstruct()) {
    _construct = function(Parent, args, Class) {
      if (Class) {
        return Reflect.construct(Parent, args || [], Class);
      }
      return Reflect.construct(Parent, args || []);
    };
  } else {
    _construct = function(Parent, args, Class) {
      var a = [null];
      a.push.apply(a, args || []);
      var Constructor = Function.bind.apply(Parent, a);
      var instance = new Constructor();
      if (Class) {
        if (setPrototypeOf) {
          setPrototypeOf(instance, Class.prototype);
        } else if (Class && Class.prototype) {
          instance.__proto__ = Class.prototype; // eslint-disable-line no-proto
        }
      }
      return instance;
    };
  }
  return _construct(Parent, args, Class);
};

module.exports = function(target, argumentsList, newTarget) {
  return _construct(target, argumentsList, newTarget);
};

module.exports.__esModule = true;
module.exports.default = module.exports;
