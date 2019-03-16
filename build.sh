#!/usr/bin/env bash

# install wasm-pack as required
if ! [ -x "$(command -v wasm-pack)" ]; then
  echo "*** Installing wasm-pack"
  curl https://rustwasm.github.io/wasm-pack/installer/init.sh -sSf | sh
fi

# install binaryen as required
if [ ! -d "binaryen" ]; then
  echo "*** Installing binaryen"
  git clone --recursive https://github.com/WebAssembly/binaryen.git
  rm -rf binaryen/test
fi

# build wasm2js as required
# if [ ! -f "binaryen/bin/wasm2js" ]; then
#   echo "*** Building wasm2js"
#   cd binaryen
#   cmake .
#   make wasm2js
#   cd ..
# fi

# build wasm-opt as required
if [ ! -f "binaryen/bin/wasm-opt" ]; then
  echo "*** Building wasm-opt"
  cd binaryen
  cmake .
  make wasm-opt
  cd ..
fi

# install deps
echo "*** Installing JS dependencies"
yarn

# cleanup old
echo "*** Claning old builds"
rm -rf ./pkg

# build new via nightly & wasm-pack
echo "*** Building WASM output"
rustup run nightly wasm-pack build --release --scope polkadot --target nodejs

# optimise
echo "*** Optimising WASM output"
binaryen/bin/wasm-opt pkg/schnorrkel_js_bg.wasm -Os -o pkg/schnorrkel_js_opt.wasm

# build asmjs version from the input (optimised) WASM
# echo "*** Building asm.js version"
# binaryen/bin/wasm2js --no-validation --output pkg/schnorrkel_js_temp.js pkg/schnorrkel_js_opt.wasm

# convert wasm to base64 structure
echo "*** Packing WASM into base64"
./pack-node.sh

# copy our package interfaces
echo "*** Copying package sources"
cp src/js/* pkg/

# shortcuts for files
echo "*** Adjusting output"
BGJ=pkg/schnorrkel_js_bg.js
SRC=pkg/schnorrkel_js.js
DEF=pkg/schnorrkel_js.d.ts
TMP=pkg/schnorrkel_js_temp.js
ASM=pkg/schnorrkel_js_asm.js
PKG=pkg/package.json

# update the files (new addition)
# excluded: "schnorrkel_js_asm\.js",
sed -i -e 's/schnorrkel_js_bg\.wasm/schnorrkel_js_wasm\.js", "index\.js", "index\.d\.ts", "crypto-polyfill\.js/g' $PKG
sed -i -e 's/"main": "schnorrkel_js\.js"/"main": "index\.js"/g' $PKG
sed -i -e 's/"types": "schnorrkel_js\.d\.ts"/"types": "index\.d\.ts"/g' $PKG

# cleanup asm
# sed -i -e 's/import {/\/\/ import {/g' $TMP
# sed -i -e 's/function asmFunc/var schnorrkel = require('\''\.\/schnorrkel_js'\''); function asmFunc/g' $TMP
# sed -i -e 's/export const /module\.exports\./g' $TMP
# sed -i -e 's/{abort.*},memasmFunc/schnorrkel, memasmFunc/g' $TMP

# we do not want the __ imports (used by WASM) to clutter up
sed -i -e 's/var wasm;/const crypto = require('\''crypto'\''); let wasm; const requires = { crypto };/g' $SRC

# this creates issues in both the browser and RN (@polkadot/util has a polyfill)
sed -i -e 's/const TextDecoder = require('\''util'\'')\.TextDecoder;/const { u8aToString } = require('\''@polkadot\/util'\'');/g' $SRC

# TextDecoder is not available on RN, so use the @polkadot/util replacement (with polyfill)
sed -i -e 's/let cachedTextDecoder = new /\/\/ let cachedTextDecoder = new /g' $SRC
sed -i -e 's/cachedTextDecoder\.decode/u8aToString/g' $SRC

# we are swapping to a async interface for webpack support (wasm limits)
sed -i -e 's/wasm = require/\/\/ wasm = require/g' $SRC

# pull the requires from the imports and the `requires` object
sed -i -e 's/return addHeapObject(require(varg0));/return addHeapObject(requires[varg0]);/g' $SRC
# sed -i -e 's/return addHeapObject(require(varg0));/throw new Error(`Invalid require from WASM for ${varg0}`);/g' $SRC

# construct our promise and add ready helpers
echo "
module.exports.abort = function () { throw new Error('abort'); };

const createPromise = require('./schnorrkel_js_bg');
const wasmPromise = createPromise().catch(() => null);

module.exports.isReady = function () { return !!wasm; }
module.exports.waitReady = function () { return wasmPromise.then(() => !!wasm); }

wasmPromise.then((_wasm) => { wasm = _wasm });
" >> $SRC

# add extra methods to type definitions
echo "
export function isReady(): boolean;
export function waitReady(): Promise<boolean>;
" >> $DEF

# create the init promise handler
echo "
const asm = null; // require('./schnorrkel_js_asm');
const bytes = require('./schnorrkel_js_wasm');
const schnorrkel = require('./schnorrkel_js');

module.exports = async function createExportPromise () {
  const imports = {
    './schnorrkel_js': schnorrkel
  };

  if (!WebAssembly) {
    return asm;
  }

  try {
    const { instance } = await WebAssembly.instantiate(bytes, imports);

    return instance.exports;
  } catch (error) {
    return asm;
  }
}
" > $BGJ

# cleanup in-place sed files
echo "*** Cleaning up in-place edits"
rm -rf pkg/*-e

# pass through uglify to make the actual output smaller
# echo "*** Optimising asm.js output"
# yarn run uglifyjs $TMP --compress --mangle --timings --output $ASM
# mv $TMP $ASM
