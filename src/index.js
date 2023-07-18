const fs = require("node:fs");
const path = require("node:path");
const http = require("node:http");
const https = require("node:https");

const localPackageJSON = require("../package.json");

const helpText = `
NFM: Node Function Manager
Allows installation of individual functions to access in JavaScript applications.

Usage: nfm <command>

nfm install               Install all functions into your project
nfm install <foo> <url>   Add the function <foo> to your project with the URL <url>
nfm uninstall <foo>       Remove the function <foo> from your project
nfm help                  Display this help message
`;

async function install(opts) {
  let cwd = process.cwd();

  let config = findConfigDetails();

  if (opts.length > 0) {
    // There are items the user is asking us to install
    let installStatus = await installFunc(opts, config);

    if (installStatus !== 0) {
      // Something went wrong, return early
      return installStatus;
    }

    // It installed successfully, lets generate our NFM file and add the func to the package.json
    let addToPackStatus = await addToPack(opts, config);

    if (addToPackStatus !== 0) {
      return addToPackStatus;
    }

    return await generateNFM(config);
  } else {
    // The user is asking for a full install
    if (!config.config.hasOwnProperty("installed")) {
      // There is no lock file, nor anything in the configuration `installed` section, so nothing to do
      console.log("Nothing to do...");
      return 0;
    } else {
      // The user asked for a full install, and there is something to do
      let installStatus =  await installFull(config);

      if (installStatus !== 0) {
        // something went wrong, return early
        return installStatus;
      }

      // Installation was a success, lets generate our NFM file
      return await generateNFM(config);
    }
  }
}

async function installFunc(opts, config) {
  // Alright when a user installs, the first argument is the name they choose to assign to a function
  // And the second is the URL
  if (opts.length < 2) {
    console.log("Missing either the name of the function or the URL to install!");
    return 1;
  }

  let funcName = opts[0];
  let funcURL = opts[1];

  try {
    console.log(`Installing ${funcName}...`);

    const res = await downloadFuncFile(funcURL, config);


    if (res.status !== 200) {
      console.log(`Request to ${funcURL} failed with ${res.status}!`);
      console.log(res);
      return 1;
    }
    // We have successfully retreived the file, lets save it

    if (!fs.existsSync(path.join(config.cwd, config.installLoc, "nfm"))) {
      fs.mkdirSync(path.join(config.cwd, config.installLoc, "nfm"));
    }

    fs.writeFileSync(path.join(config.cwd, config.installLoc, "nfm", `${funcName}.js`), res.text);

    return 0;
  } catch(err) {
    console.log(`Encountered an error installing: ${funcName}!`);

    if (err.status === 404) {
      console.log(`Unable to find: ${funcURL}`);
    } else {
      console.log(err);
    }
    return 1;
  }

}

async function downloadFuncFile(url, config) {
  let protoToUse;

  if (config?.config?.nfm?.useHttp) {
    protoToUse = "http:";
  } else {
    if (url.charAt(4) === "s") {
      protoToUse = "https:";
    } else {
      protoToUse = "http:";
    }
  }
  const proto = protoToUse === "https:" ? https : http;

  const options = {
    method: "GET",
    protocol: protoToUse,
    headers: {
      "User-Agent": `nfm-${localPackageJSON.version}`
    }
  };

  return new Promise((resolve, reject) => {
    let data = "";

    const req = proto.request(url, options, (res) => {
      res.setEncoding("utf8");
      res.on("data", (chunk) => {
        data += chunk;
      });
      res.on("end", () => {
        // No more data in response
        resolve({
          text: data,
          status: res.statusCode
        });
      });
    });

    req.on("error", (e) => {
      reject(e);
    });

    req.end();
  });
}

async function installFull(config) {
  // Lets loop through all items in the file and install
  for (let func in config.config.installed) {
    let installStatus = await installFunc(
      [ func, config.config.installed[func] ], // We manually make an array, to pass here
      config
    );

    if (installStatus !== 0) {
      // Something failed, return early
      return installStatus;
    }

    console.log(`Installed: ${func} successfully!`);
  }

  return 0;
}

async function addToPack(opts, config) {
  let funcName = opts[0];
  let funcURL = opts[1];

  try {

    let file = JSON.parse(fs.readFileSync(path.join(config.cwd, "package.json")));

    if (!file.hasOwnProperty("nfm")) {
      file.nfm = {};
    }

    if (!file.nfm.hasOwnProperty("installed")) {
      file.nfm.installed = {};
    }

    file.nfm.installed[funcName] = funcURL;

    fs.writeFileSync(path.join(config.cwd, "package.json"), JSON.stringify(file, null, 2));

    return 0;
  } catch(err) {
    console.log("Unable to write new func to 'package.json'... continuing anyway.");
    console.log(err);
    return 0;
  }
}

async function generateNFM(config) {
  // Since this runs after any install steps, lets make sure to get a fresh package.json
  try {
    let pack = JSON.parse(fs.readFileSync(path.join(config.cwd, "package.json")));

    let installed = pack.nfm.installed;

    let fileToWrite = "// Automatically generated by NFM\n\nmodule.exports = {\n";

    for (let func in installed) {
      fileToWrite += `  "${func}": require("./${func}.js"),\n`;
    }

    fileToWrite += "};";

    fs.writeFileSync(path.join(config.cwd, config.installLoc, "nfm", "index.js"), fileToWrite);

    return 0;
  } catch(err) {
    console.log("Encountered error while generating the NFM file!");
    console.log(err);
    return 1;
  }

}

async function uninstall(opts) {
  if (opts.length < 1) {
    console.log("Missing required func to uninstall!");
    return 1;
  }

  let config = findConfigDetails();

  try {

    let pack = JSON.parse(fs.readFileSync(path.join(config.cwd, "./package.json")));

    if (pack.hasOwnProperty("nfm") && pack.nfm.hasOwnProperty("installed") && pack.nfm.installed.hasOwnProperty(opts[0])) {

      delete pack.nfm.installed[opts[0]];

      fs.writeFileSync(path.join(config.cwd, "./package.json"), JSON.stringify(pack, null, 2));

      // We have successfully removed it from the package.json, but now we need to delete the file, and retrigger the generate
      fs.rmSync(path.join(config.installLoc, "nfm", `${opts[0]}.js`));

      let generateStatus = await generateNFM(config);

      if (generateStatus !== 0) {
        return generateStatus;
      }

      return 0;
    } else {
      console.log(`Are you sure '${opts[0]}' is installed?`);
      return 1;
    }
  } catch(err) {
    console.log("Encountered an error uninstalling!");
    console.log(err);
    return 1;
  }
}

function help() {
  console.log(helpText);
  return 0;
}

/**
 * This returns all configuration details that are relevant.
 *  - config: The configuration as taken from the package.json if available
 *  - main: The main location in the `package.json`. Otherwise an empty string
 *  - installLoc: Where to install our functions. Uses the directory of the `main` entry
 *          in the `package.json` if available. Uses the CWD otherwise
 *  - cwd: The current working directory
 */
function findConfigDetails() {
  let cwd = process.cwd();

  let nfmConfig = {};
  let mainFile = "";

  try {
    let pack = JSON.parse(fs.readFileSync(path.join(cwd, "./package.json")));

    if (pack.hasOwnProperty("nfm")) {
      nfmConfig = pack.nfm;
    }

    if (pack.hasOwnProperty("main")) {
      mainFile = pack.main;
    }

    return {
      config: nfmConfig,
      main: mainFile,
      cwd: cwd,
      installLoc: path.parse(mainFile).dir
    };
  } catch(err) {
    return {
      config: {},
      mainFile: "",
      cwd: cwd,
      installLoc: cwd
    };
  }
}

module.exports = {
  install,
  uninstall,
  help,
  helpText
};
