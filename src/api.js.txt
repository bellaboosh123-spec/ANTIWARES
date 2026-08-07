import express from 'express';
import { getScript } from './services/supabase.js';
import 'dotenv/config';

const app = express();
app.use(express.json());

app.get('/api/public/s/:id', async (req, res) => {
  const { id } = req.params;
  const userAgent = req.headers['user-agent'] || '';

  // Block non-Roblox
  if (!userAgent.includes('Roblox')) {
    return res.status(404).send('-- script not found\n');
  }

  try {
    const script = await getScript(id);
    res.set('Cache-Control', 'no-store');
    res.send(script);
  } catch {
    res.status(404).send('-- script not found\n');
  }
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`API running on port ${PORT}`);
});