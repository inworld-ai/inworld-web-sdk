# How to add a new workspace (i.e., npm package) to Inworld AI Web SDK?

1. Create a folder inside the `packages` directory, for example, `sample-package`.
2. Create a `package.json` file in the `sample-package` folder with the name attribute set to `@inworld/sample-package`. Don't forget to add the `build`, `release`, `release:publish`, and `release:bump` commands.
3. Create a `CHANGELOG.md` file following the [Keep a Changelog](https://keepachangelog.com) format.
4. Create a `release-it.json` file, and refer to the configuration options provided on [GitHub](https://github.com/release-it/release-it).
5. Create a `.npmignore` file and specify the list of files that should not be published to npm.
6. If you add a test script, don't forget to include `sample-package` in the root test command:
```json
  {
    "scripts": {
      "test": "yarn workspace @inworld/web-core test && yarn workspace @inworld/sample-package test"
    }
  }
```
7. Add `@inworld/sample-package` to GitHub Actions and templates.
