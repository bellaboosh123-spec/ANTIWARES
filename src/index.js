import { Client, GatewayIntentBits, REST, Routes } from 'discord.js';
import 'dotenv/config';
import { data as generateData, execute as generateExecute } from './commands/generate.js';
import express from 'express';
import { getScript } from './services/supabase.js';

// --- API ---
const app = express();
app.use(express.json());

app.get('/test', (req, res) => {
  res.send('API is working!');
});

app.get('/api/public/s/:id', async (req, res) => {
  const { id } = req.params;
  const userAgent = req.headers['user-agent'] || '';
  console.log('User-Agent received:', userAgent);

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
app.listen(PORT, () => console.log(`API running on port ${PORT}`));

// --- BOT ---
const client = new Client({
  intents: [GatewayIntentBits.Guilds, GatewayIntentBits.MessageContent],
});

client.once('ready', () => {
  console.log(`Logged in as ${client.user.tag}`);
});

const ALLOWED_CHANNEL_ID = '1527371466914533458'; // Replace with your channel ID

client.on('interactionCreate', async (interaction) => {
  if (!interaction.isChatInputCommand()) return;

  // Check if the command is in the allowed channel
  if (interaction.channelId !== ALLOWED_CHANNEL_ID) {
    return interaction.reply({
      content: '❌ This command can only be used in the designated channel.',
      ephemeral: true
    });
  }

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