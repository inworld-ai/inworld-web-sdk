# Inworld AI Web SDK Testing Documentation

This document provides information on the testing procedures for the Inworld AI Web SDK.

## Running Unit Tests for all packages

Execute the following command to run unit tests for all packages:

```sh
yarn test
```

Execute the following command to run unit tests for one specific package:

```sh
yarn workspace @inworld/web-core test
```

## Performing Manual Tests

If you need to use changes that have not been published to npm, you can manually link the Inworld package. For example, follow these steps for `@inworld/web-core`:

1. Run in the root directory:
   
```sh
~/inworld-web-sdk $ yarn install && yarn build
```

2. Next, go to your application directory (e.g., `inworld-web-sdk/examples/chat`) and link the `@inworld/web-core` package:

```sh
~/inworld-web-sdk/examples/chat $ yarn link ~/inworld-web-sdk/packages/web-core
```

Manual linking is a useful approach for testing your application during development. However, it may not always work or cover all testing scenarios. For final tests, it's recommended to create a compressed gzip archive using the pack command:

```sh
~/inworld-web-sdk/web-core $ yarn pack --filename inworld-web-core-test.tgz
```

After creating the archive, you can add it to your application using:

```sh
~/inworld-web-sdk/examples/chat $ yarn add ../../packages/web-core/inworld-web-core-test.tgz
```
