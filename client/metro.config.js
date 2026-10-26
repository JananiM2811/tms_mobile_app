const { getDefaultConfig } = require('expo/metro-config');
const path = require('path');

const config = getDefaultConfig(__dirname);

config.resolver.extraNodeModules = {
  ...config.resolver.extraNodeModules,
  'react-icons/fi': path.resolve(__dirname, 'src/components/Icons.js'),
  'react-icons': path.resolve(__dirname, 'src/components/Icons.js'),
};

module.exports = config;
