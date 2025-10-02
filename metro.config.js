const { getDefaultConfig } = require('expo/metro-config');
const path = require('path');

const config = getDefaultConfig(__dirname);

// Fix for reflect construct issues and runtime errors
config.transformer.minifierConfig = {
  ecma: 8,
  keep_fnames: true,
  mangle: {
    keep_fnames: true,
  },
};

// Add resolver configuration
config.resolver.alias = {
  ...config.resolver.alias,
  'react-native-web': 'react-native-web',
  // Override babel runtime with safe polyfills
  '@babel/runtime/helpers/construct': path.resolve(__dirname, 'polyfills/construct.js'),
  '@babel/runtime/helpers/wrapNativeSuper': path.resolve(__dirname, 'polyfills/wrapNativeSuper.js'),
};

// Fix platform extensions
config.resolver.platforms = ['ios', 'android', 'native', 'web'];

module.exports = config;





