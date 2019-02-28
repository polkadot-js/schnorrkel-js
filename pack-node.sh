#!/usr/bin/env node

const fs = require('fs');
const buffer = fs.readFileSync('./pkg/schnorrkel_js_opt.wasm');

fs.writeFileSync('./pkg/schnorrkel_js_wasm.js', `
module.exports = Buffer.from('${buffer.toString('base64')}', 'base64');
`);
