# Inworld AI Web SDK Testing Documentation

This document provides information on the testing procedures for the Inworld AI Web SDK.

## Running Unit Tests

Execute the following command to run unit tests:

```sh
yarn test
```

## Performing Manual Tests

If you need to use changes that have not been published to npm, you can manually link the Inworld package. Follow these steps:

1. Navigate to the `inworld-web-sdk` directory:
   
```sh
~/inworld-web-sdk $ yarn install && yarn build && yarn link
```

2. Next, go to your application directory (e.g., `inworld-web-sdk/examples/chat`) and link the `@inworld/web-sdk` package:

```sh
~/inworld-web-sdk/examples/chat $ yarn link @inworld/web-sdk
```

Manual linking is a useful approach for testing your application during development. However, it may not always work or cover all testing scenarios. For final tests, it's recommended to create a compressed gzip archive using the pack command:

```sh
~/inworld-web-sdk $ yarn install && yarn build && yarn pack --filename inworld-web-sdk-test.tgz
```

After creating the archive, you can add it to your application using:

```sh
~/inworld-web-sdk/examples/chat $ yarn add ../../inworld-web-sdk-test.tgz
```
