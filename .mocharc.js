module.exports = {
  diff: true,
  require: ['ts-node/register', 'source-map-support/register'],
  extension: ['ts', 'js'],
  package: './package.json',
  reporter: 'spec',
  slow: 75,
  timeout: 5000,
  recursive: true,
  ui: 'bdd'
};

// --recursive
// test/