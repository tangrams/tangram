module.exports = function(context) {
  const ESM = (process.env.ESM !== 'false'); // default to ESM on
  const cache = context.cache(() => ESM);
  const targets = ESM ?
    { esmodules: true } :
    { browsers: ['last 2 versions', 'ie >= 11', 'safari >= 7'] };

  return {
    presets: [
      [
        '@babel/preset-env', {
          targets,
          loose: true,
          debug: true,
          useBuiltIns: ESM ? false : 'usage'
        }
      ],
    ]
  };
};
