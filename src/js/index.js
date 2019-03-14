// @ts-check
const stubbed = require('./schnorrkel_js');

module.exports.derivePublicSimple = stubbed.derive_public_simple;
module.exports.isReady = stubbed.isReady;
module.exports.keypairFromSeed = stubbed.keypair_from_seed;
// module.exports.secretFromSeed = stubbed.secret_from_seed;
module.exports.sign = stubbed.sign;
module.exports.verify = stubbed.verify;
module.exports.waitReady = stubbed.waitReady;
