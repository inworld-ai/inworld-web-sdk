# How to add a new workspace (i.e., npm package) to Inworld AI Web SDK?

1. Create a folder inside the `packages` directory, for example, `sample-package`.
1. Create a `package.json` file in the `sample-package` folder with the name attribute set to `@inworld/sample-package`. Don't forget to add the following commands:
 - `build`,
 - `test`,
 - `release:pack`,
 - `release:publish`,
 - `release:bump`,
 - `lint:lint`,
 - `lint:check`,
 - `prettier:check`,
 - `prettier:format`.
1. Create a `CHANGELOG.md` file following the [Keep a Changelog](https://keepachangelog.com) format.
1. Create a `release-it.json` file, and refer to the configuration options provided on [GitHub](https://github.com/release-it/release-it).
1. Create a `.npmignore` file and specify the list of files that should not be published to npm.
1. Add `@inworld/sample-package` to GitHub Actions and templates.
