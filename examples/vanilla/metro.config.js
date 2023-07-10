const path = require('path');
const { getDefaultConfig, mergeConfig } = require('@react-native/metro-config');

/**
 * Metro configuration
 * https://facebook.github.io/metro/docs/configuration
 */
const config = {
  watchFolders: [path.resolve(__dirname, '../../')],
};

module.exports = mergeConfig(getDefaultConfig(__dirname), config);
