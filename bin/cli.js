#!/usr/bin/env node

const nfm = require("../src/index.js");

async function main(params) {
  console.log(params);

  if (typeof nfm[params[0]] === "function") {
    // The user has called for an actually function
    let command = params.pop();

    let statusCode = nfm[command](params);
    process.exit(statusCode);

  } else {
    console.log(`Unsupported option: '${params[0]}'!`);
    console.log(nfm.helpText);
    process.exit(1);
  }

}

main(process.argv.slice(2));
