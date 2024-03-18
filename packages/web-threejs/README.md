# Inworld AI Web SDK | Three.js Module

The **Inworld AI Web SDK | Three.js Module** is a Node.js/Typescript based module for the [Inworld Web SDK](https://github.com/inworld-ai/inworld-web-sdk) designed to simplify the process of loading and adding an Inworld supported 3D avatar to your Three.js project. Currently the module supports Inworld's mascot Innequin and Ready Player Me avatar characters.

Note: Example source assets for the models, animations and *textures ( *Innequin Only ), are downloaded automatically as explained in the instructions below.

We recommend you review our React based [Example Projects](#examples) for both [Innequin](https://github.com/inworld-ai/inworld-web-sdk/tree/main/examples/innequin-react) and [Ready Player Me](https://github.com/inworld-ai/inworld-web-sdk/tree/main/examples/rpm-react), as demostrations of how to integrate the avatars into your own projects.
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
- [Example Projects](#examples)<a id="examples" name="examples"></a>
  - [Innequin React](https://github.com/inworld-ai/inworld-web-sdk/tree/main/examples/innequin-react)
  - [RPM React](https://github.com/inworld-ai/inworld-web-sdk/tree/main/examples/rpm-react)

<br/>

## Installing the Module <a id="installing" name="installing"></a>

The following are NPM and Yarn command line

- NPM version `npm install @inworld/web-threejs`

- Yarn version `yarn add @inworld/web-threejs`

<br/>

## Innequin Specific Setup <a id="installing-innequin" name="installing-innequin"></a>

This project requires you to host the assets files, consisting of JSON configuration, 3D model, animations and textures. These assets are automatically downloaded and installed as apart of the `yarn install` process in the `postinstall` phase. These assets are version controlled via the `version.json`.

Here is the link to manually download the source files.

- [innequin-assets-v5.zip](https://storage.googleapis.com/innequin-assets/innequin/innequin-assets-v5.zip) - Contains all Innequin asset files and config.json.

The files can be hosted locally by downloading the file and extract it's contents into a folder accessable by a running webserver. For example the assets for the [Innequin React Example]('/examples/innequin-react/') we recommend placing them in the `/public/assets/v5/` folder within that example. The `version.json` file contained within the assets zip should be installed to the root at `/public/assets/`.

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

This project requires you to host the assets files, consisting of JSON configuration, 3D model, animations and textures. These assets are automatically downloaded and installed as apart of the `yarn install` process in the `postinstall` phase. These assets are version controlled via the `version.json`.

Here is the link to manually download the source files.

- [rpm-assets-v3.zip](https://storage.googleapis.com/innequin-assets/rpm/rpm-assets-v3.zip) - Contains all RPM asset files and config.json.

The files can be hosted locally by downloading the file and extract it's contents into a folder accessable by a running webserver. For example the assets for the [RPM React Example]('/examples/rpm-react/') we recommend placing them in the `/public/assets/v3/` folder within that example. The `version.json` file contained within the assets zip should be installed to the root at `/public/assets/`.

Note: If you wish to change the recommended location of the assets for our [Ready Player Me Example Project](https://github.com/inworld-ai/inworld-web-sdk/tree/main/examples/rpm-react), you will need to update the environment variables `REACT_APP_RPM_BASE_URI` and `REACT_APP_RPM_CONFIG_URI` located in the `.env` file you create during the setup of the examples.

Example asset folder structure:

```
/public/assets/v3/  - The base folder for all following Ready Player Me assets.
    animations/     - The Three.js based JSON animation files.
    models/         - The animation and mesh model files in GLB format.
    config.json     - The file that defines the settings for a Innequin avatar.
```

<br>

## Innequin Asset Loading Process <a id="loading-innequin" name="loading-innequin"></a>

The following diagram explains the loading process of both the configuration file and 3D asset files for a Innequin avatar.

![Innequin](./imgs/innequin-loading-flow.png 'Innequin')

<br/>

## Ready Player Me Asset Loading Process <a id="loading-rpm" name="loading-rpm"></a>

The following diagram explains the loading process of both the configuration file and 3D asset files for a Ready Player Me avatar.

![RPM](./imgs/rpm-loading-flow.png 'RPM')

<br/>

# Ready Player Me Character Rreation <a id="rpm-creation" name="rpm-creation"></a>

https://models.readyplayer.me/65ca3211555ef713271e81dd.glb
