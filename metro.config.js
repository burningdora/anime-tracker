const { getDefaultConfig } = require('expo/metro-config');

const config = getDefaultConfig(__dirname);

// expo-sqlite на web использует wasm-файл, Metro должен считать его ассетом.
config.resolver.assetExts.push('wasm');

// SharedArrayBuffer для web-версии SQLite требует COOP/COEP-заголовков.
config.server.enhanceMiddleware = middleware => (req, res, next) => {
  res.setHeader('Cross-Origin-Embedder-Policy', 'credentialless');
  res.setHeader('Cross-Origin-Opener-Policy', 'same-origin');
  return middleware(req, res, next);
};

module.exports = config;
