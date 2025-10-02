var construct = require('./construct');
var setPrototypeOf = require('./setPrototypeOf');

module.exports = function _wrapNativeSuper(Class) {
  var _cache = typeof Map === "function" ? new Map() : undefined;

  function Wrapper() {
    return construct(Class, arguments, this.constructor);
  }

  Wrapper.prototype = Object.create(Class.prototype, {
    constructor: {
      value: Wrapper,
      enumerable: false,
      writable: true,
      configurable: true
    }
  });

  return setPrototypeOf ? setPrototypeOf(Wrapper, Class) : Wrapper;
};

module.exports.__esModule = true;
module.exports.default = module.exports;