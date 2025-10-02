module.exports = function _setPrototypeOf(obj, proto) {
  if (Object.setPrototypeOf) {
    return Object.setPrototypeOf(obj, proto);
  } else if (obj.__proto__) {
    obj.__proto__ = proto;
    return obj;
  } else {
    // Fallback - copy properties from proto to obj
    for (var key in proto) {
      if (proto.hasOwnProperty(key)) {
        obj[key] = proto[key];
      }
    }
    return obj;
  }
};

module.exports.__esModule = true;
module.exports.default = module.exports;