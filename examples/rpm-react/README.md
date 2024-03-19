# Inworld AI Web SDK | Three.js Module - Ready Player Me React Example

This Ready Player Me React Example project for the Inworld AI Web SDK | Three.js Module demostrates using the Typescript based Ready Player Me SDK to load a Ready Player Me model into a React project and animate it using Mixamo animations. We have some advice on best practices in using files both from Ready Player Me and Mixamo [below](#recommendations-rpm).

This project is designed to be a developer demonstration for:

- Loading Assets
- Inworld Client Management
- 3D Environment Configuration

Note: Example source assets for the models, animations are downloaded using `yarn run install:assets` as apart of the install process.

![Ready Player Me](./imgs/rpm.png 'RPM')

<br/>

## Table of Contents

- [Requirements](#req)
- [Setup](#setup)
- [Running](#run)
- [Building](#build)
- [Environment Variables](#env)
- [RPM Asset Loading Process](#loading-rpm)
- [Ready Player Me Recommendations - Model](#recommendations-rpm)
- [Mixamo Recommendations - Animations](#recommendations-mixamo)
- [Important Note About Animations](#recommendations-animations)

<br/>

## Requirements <a id="req" name="req"></a>

- GitHub
- Node.js v18+
- Yarn
- Inworld Web SDK [generate_token](https://github.com/inworld-ai/inworld-web-sdk/tree/main/examples/generate_token) authenication example project
- Ready Player Me account (optional)
- Adobe Mixamo account (optional)

<br/>

## Setup <a id="setup" name="setup"></a>

- Run `yarn install` at the command line to install the dependancies.
- Run `yarn run install:assets` to install the 3D assets. If you wish to manually download them you can find them [here](https://storage.googleapis.com/innequin-assets/rpm/rpm-assets-v3.zip).
- Copy the sample environment file `.env-sample` to `.env` located at the root of this project `cp .env-sample .env`.
- Open the `.env` file in a text editor and fill in the Inworld Character and Scene ID fields located on your [Inworld Studio](https://studio.inworld.ai/) account. Details on all the fields is located in the [Environment Variables](#env) section.
- Install and run the Inworld [generate_token](https://github.com/inworld-ai/inworld-web-sdk/tree/main/examples/generate_token) example project from the Inworld Web SDK - Web-Core package.

Example asset folder structure:

```
/public/assets/v3/  - The base folder for all following Ready Player Me assets.
    animations/     - The animation files in GLB animation files.
    models/         - The mesh model files in GLB format.
    config.json     - The file that defines the model and animation files to be loaded.
```

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

| Name                            | Type   | Description                                                                                                                                           | Requirement                                 |
| ------------------------------- | ------ | ----------------------------------------------------------------------------------------------------------------------------------------------------- | ------------------------------------------- |
| VITE_INWORLD_CHARACTER_ID       | String | The Inworld Character ID can be found on Inworld Studio.                                                                                              | Required                                    |
| VITE_INWORLD_SCENE_ID           | String | The Inworld Scene ID can be found on Inworld Studio.                                                                                                  | Required                                    |
| VITE_INWORLD_GENERATE_TOKEN_URI | String | The URL to the generate token server.                                                                                                                 | Required, Default: `http://localhost:4000/` |
| VITE_RPM_BASE_URI               | String | The prefix/base URI for every asset file loaded.                                                                                                      | Required                                    |
| VITE_RPM_CONFIG_URI             | String | The complete URI to the `config.json` file. Here is a sample config [config.json](https://storage.googleapis.com/innequin-assets//rpm/v3/config.json) | Required                                    |
| VITE_DRACO_COMPRESSION_URI      | String | The URI to the folder containing the Draco Compression.                                                                                               | Required, Default: `/draco-gltf/`           |
| VITE_DEBUG                      | String | String based boolean to determine if debug information should be outputed.                                                                            | Optional, Default: `false`                  |

<br/>

## Ready Player Me Asset Loading Process <a id="loading-rpm" name="loading-rpm"></a>

The following diagram explains the loading process of the configuration file and assets for RPM.

![RPM](./imgs/rpm-loading-flow.png 'RPM')

<br/>

## Ready Player Me Recommendations <a id="recommendations-rpm" name="recommendations-rpm"></a>

A Ready Player Me model by default does not come with the blend shapes needed to support Vismeme and other facial animations. In order to add them you will need to append the model download URL you recieve from the Ready Player Me website with the following `?morphTargets=ARKit,Oculus Visemes`.

Example:

https://models.readyplayer.me/65ca3211555ef713271e81dd.glb?morphTargets=ARKit,Oculus Visemes

<br/>

## Mixamo Recommendations <a id="recommendations-mixamo" name="recommendations-mixamo"></a>

It order to export Mixamo animations you need to upload the Ready Player Me model to configure the rig. By default Ready Player Me models are exported as GLB format and require conversion to FBX before they can be uploaded. In order to do that you'll need to use 3D creation software and we recommend Blender. In Blender this is simply done by importing the RPM .glb file and then exporting as FBX however there are some settings recommended for the FBX export.

Here are the recommended Blender FBX model export settings:

![model-settings](./imgs/rpm-settings.png 'RPM')

<br/>

Once you've uploaded the RPM model you can then download Mixamo animations to be used in this application. When you download an animation use `Without Skin` and `uniform` keyframe reduction.

![mixamo-download](./imgs/rpm-mixamo-download.png 'mixamo-download')

<br/>

## Important Note About Animations <a id="recommendations-animations" name="recommendations-animations"></a>

Animations for this project are listed in the `config.json` file located in the `assets/` folder. In order to add an animation to the system you need to edit the animation file so the Animation track name and the Amature container both match the name of the animation you set in the `config.json` file.

Here is an example of both the animation name defined in the `config.json` file as well as it being set in Blender. They both say `Neutral_Idle`.

![animation-rename](./imgs/rpm-animation-rename.png 'animation-rename')

Once you have done that then export the file as a GLB with these recommended settings:

![animation-settings](./imgs/rpm-settings-animation.png 'animation-settings')

<br/>
