export default function(context) {
  const ESM = (process.env.ESM !== 'false'); // default to ESM on
  const cache = context.cache(() => ESM);
  const targets = ESM ?
    { esmodules: true } :
    { browsers: ['ie >= 11'] };

  return {
    presets: [
      [
        '@babel/preset-env', {
          targets,
          bugfixes: true,
          // debug: true, // uncomment for debugging build issues
          exclude: [
            // we don't want these because we're using fast-async instead
            'transform-async-to-generator',
            'transform-regenerator',
            'proposal-async-generator-functions'
          ]
        }
      ],
    ],
    plugins: [
      '@babel/plugin-transform-runtime',
      ESM ? false : ['module:fast-async', {
        spec: true // spec setting sticks to pure promises
      },]
    ].filter(x => x)
  };
}
