module.exports = function(context) {
  const es5 = (process.env.ES5 === 'true');
  const cache = context.cache(() => es5);
  const targets = es5 ?
    { browsers: ['last 2 versions', 'ie >= 11', 'safari >= 7'] } :
    { esmodules: true };

  return {
    presets: [
      [
        '@babel/preset-env', {
          targets,
          loose: true,
          debug: true,
          useBuiltIns: es5 ? 'usage' : false
        }
      ],
    ]
  };
};
