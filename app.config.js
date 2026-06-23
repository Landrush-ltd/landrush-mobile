// Dynamic config — reads secrets from .env so they are never committed to git.
// app.json is still the base; this file merges/overrides specific fields.
const base = require('./app.json');

module.exports = ({ config }) => ({
  ...config,
  ...base.expo,
  ios: {
    ...base.expo.ios,
    config: {
      googleMapsApiKey: process.env.GOOGLE_MAPS_IOS_API_KEY || '',
    },
  },
  android: {
    ...base.expo.android,
    config: {
      googleMaps: {
        apiKey: process.env.GOOGLE_MAPS_ANDROID_API_KEY || '',
      },
    },
  },
  plugins: [
    ...base.expo.plugins,
    'expo-apple-authentication',
  ],
});
