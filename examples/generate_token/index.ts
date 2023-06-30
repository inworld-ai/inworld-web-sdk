import 'dotenv/config';

import { InworldClient } from '@inworld/nodejs-sdk';
import fs from 'fs'
import cors from 'cors';
import express from 'express';
import { exit } from 'process';

const SSL_KEY_FOLDER='./keys'

// Env variable configuration error checking
try {

  if (!fs.existsSync('.env')) {
    throw new Error('.env file not found. Did you copy the .env_sample file to .env?');
  }
  
  if (!process.env.INWORLD_KEY) {
    throw new Error('INWORLD_KEY env variable is required');
  }
  
  if (!process.env.INWORLD_SECRET) {
    throw new Error('INWORLD_SECRET env variable is required');
  }
  
  if (!process.env.PORT) {
    throw new Error('PORT env variable is required');
  }
  
  if (!process.env.USE_SSL && (process.env.USE_SSL === 'true' || process.env.USE_SSL === 'false')) {
    throw new Error('USE_SSL env variable must be either true or false');
  }
    
  if (process.env.USE_SSL === 'true') {
    
    if (!process.env.SSL_KEY_NAME) {
      throw new Error('SSL_KEY_NAME env variable is required when USE_SSL is true');
    }
    
    if (!process.env.SSL_CERT_NAME) {
      throw new Error('SSL_CERT_NAME env variable is required when USE_SSL is true');
    }

  }

} catch (e) {
  console.error('Error:', e.message);
  exit(); // Terminate the application if it isn't setup right
}

const PORT = process.env.PORT;
const USE_SSL = process.env.USE_SSL === 'true' ? true : false;


const client = new InworldClient().setApiKey({
  key: process.env.INWORLD_KEY!,
  secret: process.env.INWORLD_SECRET!,
});

const app = express();

app.use(cors());

app.get('/', async (_, res) => {
  const token = await client.generateSessionToken();

  res.setHeader('Content-Type', 'application/json');
  res.end(JSON.stringify(token));
});

app.listen(PORT, () => {
  console.log(`Listening to port ${PORT}`);
});
