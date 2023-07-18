#!/usr/bin/env node

const nfm = require("../src/index.js");

async function main(params) {

  if (typeof nfm[params[0]] === "function") {
    // The user has called for an actually function
    let command = params.shift();

    let statusCode = await nfm[command](params);
    process.exit(statusCode);

  } else {
    console.log(`Unsupported option: '${params[0]}'!`);
    console.log(nfm.helpText);
    process.exit(1);
  }

}

(async () => {
  await main(process.argv.slice(2));
})();
