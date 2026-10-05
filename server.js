import dotenv from 'dotenv';
import express from 'express';
import dotenv from 'dotenv';
import express from 'express';
import { handleOptimize } from './api/optimize.js';

dotenv.config({ path: '.env.local' });
dotenv.config();

const app = express();
const port = Number(process.env.API_PORT || 3001);
app.use(express.json({ limit: '2mb' }));

app.post('/api/optimize', handleOptimize);

app.listen(port, '0.0.0.0', () => {
  console.log(`Resume API listening on http://localhost:${port}`);
});
