const decompress = require('decompress');
const fs = require('fs');
const path = require('path');
const nodeUrl = require('url');
const { writeFile } = require('fs/promises');
/**
 * This process checks if the 3D asset files have been downloaded and if not downloads and installs them.
 * The process is version controlled based on the version in the version.json file.
 *
 * @returns {Promise<void>} Promise of the main process
 */
async function run() {
  const ASSETS_VERSION = 'v6';
  const ASSETS_VERSION_FILENAME = 'version.json';
  const ASSETS_FILE_PATH = './public/assets/';
  const ASSETS_VERSION_FILE_PATH = path.join(
    ASSETS_FILE_PATH,
    ASSETS_VERSION_FILENAME,
  );
  const ASSETS_VERSION_FILE_SOURCE_PATH = path.join(
    ASSETS_FILE_PATH,
    ASSETS_VERSION,
    ASSETS_VERSION_FILENAME,
  );
  const ASSETS_VERSION_FOLDER_PATH = path.join(
    ASSETS_FILE_PATH,
    ASSETS_VERSION,
  );
  const ASSETS_ZIP_FILENAME = `innequin-assets-${ASSETS_VERSION}.zip`;
  const ASSETS_ZIP_FILE_PATH = path.join(ASSETS_FILE_PATH, ASSETS_ZIP_FILENAME);
  const ASSETS_ZIP_HOST =
    'https://storage.googleapis.com/innequin-assets/innequin/';
  const ASSETS_ZIP_URL = new nodeUrl.URL(
    ASSETS_ZIP_FILENAME,
    ASSETS_ZIP_HOST,
  ).toString();
  try {
    console.log(
      'Running Inworld Web Three.js - Innequin Example Assets Installer. Asset Library:',
      ASSETS_VERSION,
    );
    let pass = false;

    const assetsFolderExists = fs.existsSync(ASSETS_FILE_PATH);
    if (!assetsFolderExists) {
      fs.mkdirSync(ASSETS_FILE_PATH, { recursive: true });
    }
    const versionFileExists = fs.existsSync(ASSETS_VERSION_FILE_PATH);
    if (versionFileExists) {
      const fileData = JSON.parse(
        fs.readFileSync(ASSETS_VERSION_FILE_PATH, 'utf8'),
      );
      if (fileData.version === ASSETS_VERSION) pass = true;
    }
    if (pass) {
      console.log('Asset Library:', ASSETS_VERSION, 'Already Installed');
    } else {
      console.log('Downloading Asset Library:', ASSETS_VERSION);
      const response = await fetch(ASSETS_ZIP_URL);
      const buffer = Buffer.from(await response.arrayBuffer());
      await writeFile(ASSETS_ZIP_FILE_PATH, buffer);
      if (fs.existsSync(ASSETS_VERSION_FOLDER_PATH)) {
        fs.rmSync(ASSETS_VERSION_FOLDER_PATH, { recursive: true, force: true });
      }
      fs.mkdirSync(ASSETS_VERSION_FOLDER_PATH, { recursive: true });
      decompress(ASSETS_ZIP_FILE_PATH, ASSETS_VERSION_FOLDER_PATH).then(() => {
        fs.copyFileSync(
          ASSETS_VERSION_FILE_SOURCE_PATH,
          ASSETS_VERSION_FILE_PATH,
        );
        console.log('Asset Library:', ASSETS_VERSION, 'Installed');
      });
    }
  } catch (e) {
    console.error(e);
  }
}

run();
