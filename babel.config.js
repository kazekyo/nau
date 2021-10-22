module.exports = function (api) {
  api.cache(true);
  return {
    presets: ['@babel/env', '@babel/typescript'],
    plugins: ['@babel/proposal-class-properties', '@babel/proposal-object-rest-spread'],
  };
};
