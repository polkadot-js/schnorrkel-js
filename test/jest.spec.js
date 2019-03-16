// @ts-check
require('../pkg/crypto-polyfill');

const { beforeAll, tests } = require('./all.js');

describe('schnorrkel-js', () => {
  beforeEach(async () => {
    await beforeAll();
  });

  Object.keys(tests).forEach((name) => {
    const test = tests[name];

    it(name, async () => {
      await test();
    });
  });
});
