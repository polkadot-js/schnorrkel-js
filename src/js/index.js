// @ts-check
const stubbed = require('./schnorrkel_js');

module.exports.hardDeriveKeypair = stubbed.hard_derive_keypair;
module.exports.hardDeriveSeed = stubbed.hard_derive_seed;
module.exports.hardDeriveSecret = stubbed.hard_derive_secret;
module.exports.isReady = stubbed.isReady;
module.exports.keypairFromSeed = stubbed.keypair_from_seed;
module.exports.secretFromSeed = stubbed.secret_from_seed;
module.exports.sign = stubbed.sign;
module.exports.softDeriveKeypair = stubbed.soft_derive_keypair;
module.exports.softDerivePublic = stubbed.soft_derive_public;
module.exports.softDeriveSecret = stubbed.soft_derive_secret;
module.exports.verify = stubbed.verify;
module.exports.waitReady = stubbed.waitReady;
