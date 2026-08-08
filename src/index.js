import { Client, GatewayIntentBits, REST, Routes } from 'discord.js';
import 'dotenv/config';
import { data as generateData, execute as generateExecute } from './commands/generate.js';
import express from 'express';
import { getScript } from './services/supabase.js';

// --- API (runs on port 3000) ---
const app = express();
app.use(express.json());

app.get('/test', (req, res) => {
  res.send('API is working!');
});

app.get('/api/public/s/:id', async (req, res) => {
  const { id } = req.params;
  const userAgent = req.headers['user-agent'] || '';
  console.log('User-Agent received:', userAgent);

  // Temporarily remove User-Agent check for testing
  // if (!userAgent.includes('Roblox')) {
  //   return res.status(404).send('-- script not found\n');
  // }

  try {
    const script = await getScript(id);
    res.set('Cache-Control', 'no-store');
    res.send(script);
  } catch {
    res.status(404).send('-- script not found\n');
  }
});

const API_PORT = 3000;
app.listen(API_PORT, () => console.log(`API running on port ${API_PORT}`));

// --- BOT (runs on port 3001, but doesn't need a port) ---
const client = new Client({
  intents: [GatewayIntentBits.Guilds, GatewayIntentBits.MessageContent],
});

client.once('ready', () => {
  console.log(`Logged in as ${client.user.tag}`);
});

client.on('interactionCreate', async (interaction) => {
  if (!interaction.isChatInputCommand()) return;

  if (interaction.commandName === 'generate') {
    await generateExecute(interaction);
  }
});

const rest = new REST({ version: '10' }).setToken(process.env.DISCORD_TOKEN);
try {
  await rest.put(Routes.applicationCommands(process.env.DISCORD_CLIENT_ID), {
    body: [generateData],
  });
  console.log('Slash command registered!');
} catch (error) {
  console.error('Error registering slash command:', error);
}

client.login(process.env.DISCORD_TOKEN);