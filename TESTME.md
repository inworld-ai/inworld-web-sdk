# Inworld AI Web SDK Testing Guide

This guide provides instructions for testing the Inworld AI Web SDK.

## Running Unit Tests

To run unit tests for all packages, use the following command:

```sh
yarn test
```

Currently, this command only runs tests for `@inworld/web-core`, but future versions may include additional packages.

## Manual Testing

Note that this repository uses Yarn 2.

### Linking Packages Manually

If you're testing unpublished changes to the Inworld package, you can manually link `@inworld/web-core` by following these steps:

1. In the root directory of the package, run:

```sh
~/inworld-web-sdk $ yarn install && yarn build
```

2. In your application directory (e.g., `inworld-web-sdk/examples/chat`), link the `@inworld/web-core` package with:

```sh
~/inworld-web-sdk/examples/chat $ yarn link ../../packages/web-core
```

For more details on linking, consult the `yarn link` documentation:

```sh
yarn link --help
```

#### Compatibility with Yarn 1.x

If your application uses Yarn 1.x, link the package with:

```sh
yarn link @inworld/web-core
```

### Using an Archive for Testing

Manual linking works well for development but may not cover all scenarios. For more comprehensive testing, create a compressed archive with the following command:

```sh
~/inworld-web-sdk/web-core $ yarn pack --filename inworld-web-core-test.tgz
```

After creating the archive, add it to your application with:

```sh
~/inworld-web-sdk/examples/chat $ yarn add ../../packages/web-core/inworld-web-core-test.tgz
```
