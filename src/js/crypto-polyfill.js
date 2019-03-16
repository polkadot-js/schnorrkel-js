// @ts-check
if (!global.crypto || !global.crypto.getRandomValues) {
  const crypto = require('crypto');

  Object.defineProperty(global.self, 'crypto', {
    value: {
      getRandomValues: (arr) => crypto.randomBytes(arr.length)
    }
  });
}
