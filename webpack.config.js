// webpack.config.js extension example
const webextensionToolbox = require('webextension-toolbox/dist/webpack.config.js');

module.exports = (env, argv) => {
  const config = webextensionToolbox(env, argv);

  // TypeScriptサポートを追加
  config.module.rules.push({
    test: /\.tsx?$/,
    use: 'ts-loader',
    exclude: /node_modules/,
  });

  // 解決する拡張子にTypeScriptを追加
  config.resolve.extensions.push('.ts', '.tsx');

  return config;
};