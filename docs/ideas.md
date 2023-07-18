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

---

# Configuration

The configuration of NFM should likely be stored within the `package.json` under the `nfm` key.

The `nfm` key should contain the following properties:

* `installed`: Lists all installed functions
* `useHttp`: If for whatever reason someone has issues with certs, or proxies, they can set this to always use HTTP instead

---

Alright slight deviation:

We have decided to disallow all dependencies, all dependency functions, everything.

So why are we still supporting installing full directories??

Maybe this should simply be download the file from a URL. During the install step the user assigns the name.

Within the file itself, the author can add a license, and beyond that it's just code. Then we don't need loads of folders, it's just files. And the file itself takes the name of the installed item's name.

Additionally, just having regular URLs means anybody can publish functions, isn't restricted to GitHub or anything, and furthermore no lock file. No fancy config


---

## Plans

Alright, so the standard CLI install uninstall is done. There's a few things I'd like to add if possible:

* nfm pack: A tool that can package up someones repo into it's own function. Likely taking the `LICENSE.md` or `license` from a `package.json` as well as the authors name, and any other relevant details from the `package.json` and adding those as a comment to the top of the `js` of their function. And saving that as a standalone file. Possibly even supporting minification of their file, or resolving local imports to combine several files. As a way to easily let function authors ship the best code possible, while respecting licenses as needed.
* nfm search: A way to search all available functions. Sharing a common topic on GitHub is a rather simple start, but due to the simplicity and way files are shared it seems extremily likely that mono repos will become common, and as such a single repo may have trouble exposing the full functionality. One option to this is a simple static site, likely on GitHub pages, with client side search, where authors submit manifest files containing details of their package. This way there's no infrustructure to manage to do this, but still allows exploring of all possible packages. It'd be great if possible to share this behavior on the CLI, but that may only be possible by downloading the manifest files themselves, which would be a drain on storage, so may not be done at all.
* Support both CommonJS and ESM for the `index` `NfuncM` module installed to users libraries.

## Problems to Solve

Versioning:

Obviously the original intent is that breaking changes never occur. And it could be argued that breaking changes can only occur as a brand new function, that any individual function should never cause breaking changes. Where even the function could remain the same, but use versioning as a parameter to cause different behavior.

Alternatively tags could be relied apon, but if a specific tag of a file is downloaded, via GitHub for example, none breaking changes would never be picked up. So it seems best to suggest that breaking changes should never occur, and can only be opted into. With the simplicity of functions, creating a new function as `emailRegexChecker_v1()` doesn't seem unrealistic, even if a little backwards.

---

## Function Development Best Practices

### Scope:
Functions are intended to be bite sized peices of code. The scope should be small, and purpose should be succenct. Take the following examples of applications to see what is intended to be used as a function rather than an NPM module:

* A package that manages temporary files and folders, and their lifecycle: This should likely be an NPM module. It's complex, with a broad purpose, and likely will need many interfaces and methods to be useful. Modules do have an important place for tasks like this.
* A snippet of code that uses Regex, or a list of known temporary folder locations across platforms that can check a given path and return a boolean on if this is a temporary path or not: This could be a function. It's straightforward, with likely a single interface needed to preform as much as it needs to. This does not have to rely on any external dependencies, and could likely be accomplished within a few lines of code.

### Dependencies:
Any developers coming from NPM world may frequently rely on a plethory of dependencies to accomplish goals. But due to how the scope is intended to be of functions, it shouldn't be likely that many, if any, dependencies are needed. If many dependencies are needed to accomplish your ambisious goals, your code may be better suited as an NPM module.

If your code does still fit the scope of a function, but must use some sort of dependency, there is purposefully no supported way to manage or install it yourself. You must rely on clearly communicating this needed dependency via documentation to any users of your function. While this may seem limiting, this is purposefully disallowed to ensure functions remain small, simple, and singular purpose driven.

### Breaking Changes:
Due to the nature of how functions are intended to be consumed, you may have noticed there's no easy way to support versioning of your function. This is intentional. Functions aren't intended to be packages that see huge changes over time, and break (even if for a good purpose) end users code. Since a function is intended to be small and simple, there hopefully won't be many instances of necessary breakage, and the vast majority of corrections to provide the most complete answer via your function can hopefully be acheived without any breaking changes.

But if breaking changes are required, your function should do one of the following:

1. Support both versions, either exporting both under different names within the same function, or accepting some parameter to indicate the function to be used. This can be done to maintain the popularity of a given function, while not breaking anyones code. Plus for those who do want the newer feature set, will already have the right function installed to do so.
2. The old function could be sunset, not receiving any new advancements while the new function is created as a brand new function. Possibly even sharing the same name. But ensuring the old function continues to be installable, and usable.
