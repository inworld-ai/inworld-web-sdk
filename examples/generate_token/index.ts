import 'dotenv/config';

import { InworldClient } from '@inworld/nodejs-sdk';
import cors from 'cors';
import express from 'express';
import fs from 'fs';
import https from 'https';
import { exit } from 'process';

const SSL_KEY_FOLDER = './keys/';

// Env variable configuration error checking
try {
  if (!process.env.NOENV && !fs.existsSync('.env')) {
    throw new Error(
      '.env file not found. Did you copy the .env_sample file to .env?',
    );
  }
  if (!process.env.INWORLD_KEY) {
    throw new Error(
      "INWORLD_KEY env variable is required. This is you're Inworld interation API Key",
    );
  }
  if (!process.env.INWORLD_SECRET) {
    throw new Error(
      "INWORLD_SECRET env variable is required. This is you're Inworld interation API Secret",
    );
  }
  if (!process.env.INWORLD_SCENE) {
    throw new Error(
      'INWORLD_SCENE env variable is required. This is your machine readable scene id for integration',
    );
  }
  if (process.env.USE_SSL) {
    if (process.env.USE_SSL !== 'true' && process.env.USE_SSL !== 'false') {
      throw new Error('USE_SSL env variable must be either true or false');
    }
    if (process.env.USE_SSL === 'true') {
      if (!process.env.SSL_KEY_NAME) {
        throw new Error(
          'SSL_KEY_NAME env variable is required when USE_SSL is true',
        );
      }
      if (!fs.existsSync(SSL_KEY_FOLDER + process.env.SSL_KEY_NAME)) {
        throw new Error('SSL key file not found.');
      }
      if (!process.env.SSL_CERT_NAME) {
        throw new Error(
          'SSL_CERT_NAME env variable is required when USE_SSL is true',
        );
      }
      if (!fs.existsSync(SSL_KEY_FOLDER + process.env.SSL_CERT_NAME)) {
        throw new Error('SSL certificate file not found.');
      }
    }
  }
} catch (e) {
  console.error('Error:', e.message);
  exit(); // Terminate the application if it isn't setup right
}

const PORT = process.env.PORT || 4000;
const USE_SSL = process.env.USE_SSL === 'true' ? true : false;

const client = new InworldClient()
  .setApiKey({
    key: process.env.INWORLD_KEY!,
    secret: process.env.INWORLD_SECRET!,
  })
  .setScene(process.env.INWORLD_SCENE!);

const app = express();

app.use(cors());

app.get('/', async (_, res) => {
  console.log('Generating session key for:', process.env.INWORLD_SCENE);
  const token = await client.generateSessionToken();

  res.setHeader('Content-Type', 'application/json');
  res.end(JSON.stringify(token));
});

if (USE_SSL) {
  const privateKey = fs.readFileSync(SSL_KEY_FOLDER + process.env.SSL_KEY_NAME);
  const certificate = fs.readFileSync(
    SSL_KEY_FOLDER + process.env.SSL_CERT_NAME,
  );
  https
    .createServer(
      {
        key: privateKey,
        cert: certificate,
      },
      app,
    )
    .listen(PORT, () => {
      console.log(`Listening to port ${PORT}`);
    });
} else {
  app.listen(PORT, () => {
    console.log(`Listening to port ${PORT}`);
  });
}
