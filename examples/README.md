# Chat example

This folder contains server to **generate token** using API key and **chat** react application.

## Requirements
- Node 16 is recommended for **generate token** application.

## Installation

### Setup variables in .env file for generate token application

|Name|Description|Details|
|--:|--:|--:|
|INWORLD_KEY|Inworld application key|Get key from [integrations page](https://studio.inworld.ai)|
|INWORLD_SECRET|Inworld application secret|Get secret from [integrations page](https://studio.inworld.ai)|

### Setup value in environment for chat application

Specify REACT_APP_INWORLD_CHARACTER and REACT_APP_INWORLD_SCENE (or fill corresponding fields on application web form after start)

### Install dependencies for both applications

```sh
yarn install
```

### Start applications

```sh
yarn start
```
