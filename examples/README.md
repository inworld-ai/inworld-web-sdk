# Chat example

This folder contains server to **generate token** using API key and **chat** react application.

## Requirements

- Node 16 is recommended for **generate token** application.

## Installation

### Setup variables in .env file for generate token application

|           Name |                Description |                                                          Details |
| -------------: | -------------------------: | ---------------------------------------------------------------: |
|    INWORLD_KEY |    Inworld application key |      Get key from [integrations page](https://studio.inworld.ai) |
| INWORLD_SECRET | Inworld application secret |   Get secret from [integrations page](https://studio.inworld.ai) |
|  INWORLD_SCENE |      The Inworld Scene ID. | Get scene id from [integrations page](https://studio.inworld.ai) |

### Setup value in environment for chat application

Specify VITE_INWORLD_CHARACTER and VITE_INWORLD_SCENE (or fill corresponding fields on application web form after start)

Additionally, you can cpecify VITE_CONNECTION_HOSTNAME and CONNECTION_SSL for Web SDK testing purpuses

### Install dependencies for both applications

```sh
yarn install
```

### Start applications

```sh
yarn start
```
