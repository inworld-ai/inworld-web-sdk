# Inworld AI Web SDK | Three.js Module - Innequin React Example

This Innequin React Example project for the Inworld AI Web SDK | Three.js Module demostrates using the Typescript based Innequin SDK to load a model into a React project.

This project is designed to be a developer demonstration for:

- Loading Assets
- Inworld Client Management
- Changing Textures/Assets
- 3D Environment Configuration

Note: Example source assets for the models, animations and *textures ( *Innequin Only ), are downloaded using `yarn run install:assets` as apart of the install process.

![Innequin](./imgs/innequin.png 'Innequin')

<br/>

## Table of Contents

- [Requirements](#req)
- [Setup](#setup)
  - [Male vs Female Quinn](#setup-gender)
- [Running](#run)
- [Building](#build)
- [Environment Variables](#env)
- [Innequin Asset Loading Process](#loading-innequin)

<br/>

## Requirements <a id="req" name="req"></a>

- GitHub
- Node.js v18+
- Yarn
- Inworld Web SDK [generate_token](https://github.com/inworld-ai/inworld-web-sdk/tree/main/examples/generate_token) authenication example project

<br/>

## Setup <a id="setup" name="setup"></a>

- Run `yarn install` at the command line to install the dependancies.
- Run `yarn run install:assets` to install the 3D assets. If you wish to manually download them you can find them [here](https://storage.googleapis.com/innequin-assets/innequin/innequin-assets-v6.zip).
- Copy the sample environment file `.env-sample` to `.env` located at the root of this project `cp .env-sample .env`.
- Open the `.env` file in a text editor and fill in the Inworld Character and Scene ID fields located on your [Inworld Studio](https://studio.inworld.ai/) account. Details on all the fields is located in the [Environment Variables](#env) section.
- Install and run the Inworld [generate_token](https://github.com/inworld-ai/inworld-web-sdk/tree/main/examples/generate_token) example project from the Inworld Web SDK

#### Male vs Female Quinn <a id="setup-gender" name="setup-gender"></a>

Quinn currently supports male and female genders with different models. There are two example configurations located with the asset library. To set them open the `.env` file and change the `VITE_INNEQUIN_CONFIG_URI` global variable to either `/assets/v6/config_male.json` for male or `/assets/v6/config_female.json` for female.

<br/>

## Running <a id="run" name="run"></a>

- Make sure the Inworld [generate_token](https://github.com/inworld-ai/inworld-web-sdk/tree/main/examples/generate_token) is running in a separate console window.
- Run `yarn start` to start in development mode.

<br/>

## Building <a id="build" name="build"></a>

- Run `yarn build` to create a production build.

<br/>

## Environment Variables <a id="env" name="env"></a>

The following are the list of Environment Variables this project supports:

| Name                            | Type   | Description                                                                                                                                      | Requirement                                 |
| ------------------------------- | ------ | ------------------------------------------------------------------------------------------------------------------------------------------------ | ------------------------------------------- |
| VITE_INWORLD_CHARACTER_ID       | String | The Inworld Character ID can be found on Inworld Studio.                                                                                         | Required                                    |
| VITE_INWORLD_SCENE_ID           | String | The Inworld Scene ID can be found on Inworld Studio.                                                                                             | Required                                    |
| VITE_INWORLD_GENERATE_TOKEN_URI | String | The URL to the generate token server.                                                                                                            | Required, Default: `http://localhost:4000/` |
| VITE_INNEQUIN_BASE_URI          | String | The prefix/base URI for every asset file loaded.                                                                                                 | Required                                    |
| VITE_INNEQUIN_CONFIG_URI        | String | The complete URI to the `config.json` file. Here is a sample config [config.json](https://storage.googleapis.com/innequin-assets/v6/config.json) | Required                                    |
| VITE_DRACO_COMPRESSION_URI      | String | The URI to the folder containing the Draco Compression.                                                                                          | Required, Default: `/draco-gltf/`           |
| VITE_DEBUG                      | String | String based boolean to determine if debug information should be outputed.                                                                       | Optional, Default: `false`                  |

## Innequin Asset Loading Process <a id="loading-innequin" name="loading-innequin"></a>

The following diagram explains the loading process of the configuration file and assets for Innequin.

![Innequin](./imgs/innequin-loading-flow.png 'Innequin')

<br/>
