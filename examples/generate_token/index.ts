import 'dotenv/config';

import { InworldClient } from '@inworld/nodejs-sdk';
import cors from 'cors';
import express from 'express';

const PORT = 4000;

if (!process.env.INWORLD_KEY) {
  throw new Error('INWORLD_KEY env variable is required');
}

if (!process.env.INWORLD_SECRET) {
  throw new Error('INWORLD_SECRET env variable is required');
}

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
