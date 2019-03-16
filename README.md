# @polkadot/schnorrkel-js

A fork of [@parity/schnorrkel-js](https://github.com/paritytech/schnorrkel-js) that allows proper operation against all the environments that the `@polkadot/api` supports. Changes from the base repo -

- WASM initialisation is done async, via Promise (this allows for clear operation in webpack environments without additional workers)
- TextDecoder is polyfilled by using the version from `@polkadot/util` (consistent support, even on mobile)
- WASM outputs are optimised via `wasm-opt` from the [binaryen](https://github.com/WebAssembly/binaryen) project
- Output bundle is wrapped with camelCase names (not including the `__***` internal functions)
- Full named functions and parameter TypeScript definitions
- Requires for crypto is wrapped, removing "on-demand-require" warnings in webpack environment
- WASM output is done via a base-64 encoded string, supporting both Node.js and browser environments
- Extensive code cleanups and addition of functions required for all sr25519 operations
- Extended tests to cover Rust, wasm (via Node) and wasm (via jest), remove (here unused) www interfaces
- Attempt at asm.js support (not active, commented in build.sh)

## development

1. Build can be done via `./build.sh`
2. Tests can be done via `./test.sh`
