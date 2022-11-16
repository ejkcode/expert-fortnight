const devData = require('../data/development-data/index.js');
const seed = require('./seed.js');
const db = require('../connections.js');

const runSeed = () => {
  return seed(devData).then(() => db.end());
};

runSeed();
