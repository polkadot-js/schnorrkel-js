// @ts-check
const crypto = require('crypto');
const { assert, hexToU8a, stringToU8a, u8aToHex } = require('@polkadot/util');
const schnorrkel = require('../pkg/index');

function extractKeys (pair) {
  const pk = pair.slice(64);
  const sk = pair.slice(0, 64);

  return [pair, pk, sk];
}

function randomPair () {
  const seed = crypto.randomBytes(32);
  const pair = schnorrkel.keypair_from_seed(seed);

  assert(pair.length === 96, 'ERROR: Invalid pair created');

  return extractKeys(pair);
}

async function beforeAll () {
  return schnorrkel.waitReady();
}

async function pairFromSeed () {
  console.time('pairFromSeed');
  console.log();

  const SEED = stringToU8a('12345678901234567890123456789012');
  const PAIR = hexToU8a(
    '0x' +
    // private
    'f0106660c3dda23f16daa9ac5b811b963077f5bc0af89f85804f0de8e424f050' +
    'f98d66f39442506ff947fd911f18c7a7a5da639a63e8d3b4e233f74143d951c1' +
    // public
    '741c08a06f41c596608f6774259bd9043304adfa5d3eea62760bd9be97634d63'
  );

  const pair = schnorrkel.keypair_from_seed(SEED);

  console.error('pairFromSeed');
  console.log('\t', u8aToHex(pair.slice(0, 64)));
  console.log('\t', u8aToHex(pair.slice(64)));

  assert(u8aToHex(pair) === u8aToHex(PAIR), 'ERROR: pairFromSeed() does not match');

  console.timeEnd('pairFromSeed');
}

async function verifyExisting () {
  console.time('verifyExisting');
  console.log();

  const PK = hexToU8a('0x741c08a06f41c596608f6774259bd9043304adfa5d3eea62760bd9be97634d63');
  const MESSAGE = stringToU8a('this is a message');
  const SIGNATURE = hexToU8a(
    '0x' +
    '162657aac408f204381e7c491cc67c61c454c169f22841f7d949c4b63c79c83e' +
    '35c8d79dfca6c9f1778d5a91391bad7753edfb714518b2be58f33322712fe20a'
  );

  const isValid = schnorrkel.verify(SIGNATURE, MESSAGE, PK);

  console.error('verifyExisting');
  console.log('\t', isValid);

  assert(isValid, 'ERROR: Unable to verify signature');

  console.timeEnd('verifyExisting');
}

async function signAndVerify () {
  console.time('signAndVerify');
  console.log();

  const MESSAGE = stringToU8a('this is a message');

  const [, pk, sk] = randomPair();
  const signature = schnorrkel.sign(pk, sk, MESSAGE);
  const isValid = schnorrkel.verify(signature, MESSAGE, pk);

  console.error('signAndVerify');
  console.log('\t', u8aToHex(signature));
  console.log('\t', isValid);

  assert(isValid, 'ERROR: Unable to verify signature');

  console.timeEnd('signAndVerify');
}

async function benchmark () {
  console.time('benchmark');
  console.log();

  const MESSAGE = stringToU8a('this is a message');

  for (let i = 0; i < 256; i++) {
    const [, pk, sk] = randomPair();

    const signature = schnorrkel.sign(pk, sk, MESSAGE);
    const isValid = schnorrkel.verify(signature, MESSAGE, pk);

    assert(isValid, 'ERROR: Unable to verify signature');
  }

  console.timeEnd('benchmark');
}

(async () => {
  await beforeAll();
  await pairFromSeed();
  await verifyExisting();
  await signAndVerify();
  await benchmark();
})().catch(console.log).finally(() => process.exit());
