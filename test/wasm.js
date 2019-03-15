// @ts-check

const { beforeAll, runAll } = require('./all');

(async () => {
  await beforeAll();
  await runAll();
})();
