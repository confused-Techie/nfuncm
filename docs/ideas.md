# Installation

To install, the CLI should of course be used, such as `nfm add FUNCTION-NAME`

# How it works

Essentially, usage of this module should mean that to use any function that's being required is done like so:

## Adding and using a function

`nfm add emailRegex`

Then within a package in your root directory

`const { emailRegex } = require("./nfm")`

And that's it.

---

The way this should work, is that as a post install step NFM reads it's configuration and adds a folder `nfm` to the root of the repo, as configured, within this folder it will place several files:

* `index.js`: The Index file can then be injected the code needed to expose all of it's other files from all installed functions. This way they can be imported.
* `...`: The only other files added would be the actual content of each function, where it must be only a single file that contains the entire function which is then exposed via the index file.

This whole folder should likely be ignored in any ignore files, so that it doesn't take up additional space.

The actual NFM dependency will include it's post install script that causes this installation and addition of packages.

If for any reason a package itself needs a dependency, it can either be disallowed, or manually added into the users `package.json` and emit a warning they need to run install again, until it's discovered that the dependency has already been added.

NFM will likely need it's own `nfm-resolutions.json` file, to keep track of all installed functions. This format should be as simple as possible.

---

# Questions

There's a few concerns here about how certain things should work:

* Should functions be able to require other functions? Logic says yes, but implementation may be difficult
* Should functions be able to have dependencies from NPM that they need? I almost want to say no, but logic says it should be possible.
* Should functions be able to have more than one file? Logic says yes, but implementation says no


---

Possible implementations for the above questions:

- Each function lives in their own folder. That is the whole repo is cloned into it's own folder to include as many files as needed
- The `main` value of the `package.json` is used to instruct the `require` statement of `nfm`s `index.js` to require from the folder
- Any dependencies found within the `package.json` are appended to the top level `package.json`
- If a function depends on any other functions those are hoisted to the top level folder. Exposing them. Then the package itself will still have it's own `nfm` folder with an `index.js` that instead requires up rather than down.

This does seem a lot like reinventing what NPM already does via `node_modules`. But while this is supported it could be largely frowned on as it defeats the whole purpose.

Otherwise, some research can be done to determine, if functions within functions and with dependencies should outright just not be supported. Since really the whole point of this is simplicity.
