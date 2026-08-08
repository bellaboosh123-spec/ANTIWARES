import express from 'express';
import 'dotenv/config';
import { getScript } from './services/supabase.js';

const app = express();
app.use(express.json());

app.get('/test', (req, res) => {
  res.send('API is working!');
});

app.get('/api/public/s/:id', async (req, res) => {
  const { id } = req.params;

  try {
    const script = await getScript(id);
    res.set('Cache-Control', 'no-store');
    res.send(script);
  } catch {
    res.status(404).send('-- script not found\n');
  }
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`API running on port ${PORT}`));