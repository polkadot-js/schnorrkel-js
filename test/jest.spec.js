require('@polkadot/util-crypto/schnorrkel/test-polyfill');

const { beforeAll, tests } = require('./all.js');

describe('wasm-schnorrkel', () => {
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
