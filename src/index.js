
const helpText = `
NFM: Node Function Manager
Allows installation of individual functions to access in JavaScript applications.

Usage: nfm <command>

nfm install           Install all functions into your project
nfm install <foo>     Add the function <foo> to your project
nfm uninstall <foo>   Remove the function <foo> from your project
nfm help              Display this help message
`;

async function install(opts) {
  console.log("installing!");
}

async function uninstall(opts) {
  console.log("uninstalling!");
}

function help() {
  console.log(helpText);
  return 0;
}

module.exports = {
  install,
  uninstall,
  help,
  helpText
};
