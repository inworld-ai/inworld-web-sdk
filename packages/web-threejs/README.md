# Inworld AI Web SDK | Three.js Module

The **Inworld AI Web SDK | Three.js Module** is a Typescript based module for the [Inworld Web SDK](https://github.com/inworld-ai/inworld-web-sdk) designed to allow you to easily integrate Inworld supported 3D characters into your React, Typescript and Javascript based projects. The goal is to simplify the process of loading and adding a Three.js avatar to your web 3D project.

Currently the module supports Inworld's Innequin and Ready Player Me avatar characters.

The source assets for the model, animations and *textures ( *Innequin Only ), are downloaded separately in the instructions below.

<br/>

**Innequin:**

[![Innequin](./imgs/innequin.png 'Innequin')](https://github.com/inworld-ai/inworld-web-sdk/tree/main/examples/innequin-react)

**Ready Player Me:**

[![RPM](./imgs/rpm.png 'RPM')](https://github.com/inworld-ai/inworld-web-sdk/tree/main/examples/rpm-react)

<br/>

## Table of Contents

- [Installing the Module](#installing)
  - [Innequin Specific Setup](#installing-innequin)
  - [RPM Specific Setup](#installing-rpm)
- [Asset Loading Process](#loading)
  - [Innequin](#loading-innequin)
  - [RPM](#loading-rpm)
- [Example Projects](#examples)
  - [Innequin React](https://github.com/inworld-ai/inworld-web-sdk/tree/main/examples/innequin-react)
  - [RPM React](https://github.com/inworld-ai/inworld-web-sdk/tree/main/examples/rpm-react)

<br/>

## Installing the Module <a id="installing" name="installing"></a>

- NPM version `npm install @inworld/inworld-web-sdk`

- Yarn version `yarn add @inworld/inworld-web-sdk`

- Include the library `import { Innequin } from "@inworld/inworld-web-sdk";`

<br/>

## Innequin Specific Setup <a id="installing-innequin" name="installing-innequin"></a>

Innequin requires you to host the assets files, consisting of JSON configuration, 3D model, animations and textures. Here are links to download the asset files.

- [innequin-assets-v5.zip](https://storage.googleapis.com/innequin-assets/v5/innequin-assets-v5.zip) - Contains all Innequin asset files and config.json.
- [config.json](https://storage.googleapis.com/innequin-assets/v5/config.json) - The default Innequin configuration file.

The files can be hosted locally by downloading the [innequin-assets-v5.zip](https://storage.googleapis.com/innequin-assets/v5/innequin-assets-v5.zip) file and extract it's contents into a folder accessable by a running webserver. For example the assets for the [Innequin React Example]('/examples/innequin-react/') we recommend placing them in the `/public/assets/v5/` folder within that example.

Note: If you wish to change the recommended location of the assets for our [Innequin example project](https://github.com/inworld-ai/inworld-web-sdk/tree/main/examples/innequin-react), you will need to update the environment variables `REACT_APP_INNEQUIN_BASE_URI` and `REACT_APP_INNEQUIN_CONFIG_URI` located in the `.env` file you create during the setup of the examples.

Example asset folder structure:

```
/public/assets/v5/  - The base folder for all following Innequin assets.
    images/         - The background images used in our Studio Avatar Creator.
    models/         - The animation and mesh model files in GLB format.
    textures/       - The textures used for the mesh and facial animations.
    config.json     - The file that defines the settings for a Innequin avatar.
```

<br/>

## RPM Specific Setup <a id="installing-rpm" name="installing-rpm"></a>

RPM requires you to host the assets files, consisting of JSON configuration, 3D model and animations. Here are links to download the asset files.

- [rpm-assets-v1.zip](https://storage.googleapis.com/innequin-assets/rpm/v1/rpm-assets-v1.zip) - Contains all RPM asset files and config.json.
- [config.json](https://storage.googleapis.com/innequin-assets/rpm/v1/config.json) - The default RPM configuration file.

The files can be hosted locally by downloading the [rpm-assets-v1.zip](https://storage.googleapis.com/innequin-assets/rpm/v1/rpm-assets-v1.zip) file and extract it's contents into a folder accessable by a running webserver. For example the assets for the [RPM React Example]('/examples/rpm-react/') we recommend placing them in the `/public/assets/v1/` folder within that example.

Note: If you wish to change the recommended location of the assets for our [Ready Player Me Example Project](https://github.com/inworld-ai/inworld-web-sdk/tree/main/examples/rpm-react), you will need to update the environment variables `REACT_APP_RPM_BASE_URI` and `REACT_APP_RPM_CONFIG_URI` located in the `.env` file you create during the setup of the examples.

Example asset folder structure:

```
/public/assets/v1/  - The base folder for all following Ready Player Me assets.
    animations/     - The Three.js based JSON animation files.
    models/         - The animation and mesh model files in GLB format.
    config.json     - The file that defines the settings for a Innequin avatar.
```

<br>

## Innequin Asset Loading Process <a id="loading-innequin" name="loading-innequin"></a>

The following diagram explains the loading process of the configuration file and assets for Innequin.

![Innequin](./imgs/innequin-loading-flow.png 'Innequin')

<br/>

## Ready Player Me Asset Loading Process <a id="loading-rpm" name="loading-rpm"></a>

The following diagram explains the loading process of the configuration file and assets for RPM.

![RPM](./imgs/rpm-loading-flow.png 'RPM')

<br/>
