import { Client, GatewayIntentBits, REST, Routes } from 'discord.js';
import 'dotenv/config';
import { data as generateData, execute as generateExecute } from './commands/generate.js';
import express from 'express';
import { getScript } from './services/supabase.js';

// --- START API ---
const app = express();
app.use(express.json());

app.get('/api/public/s/:id', async (req, res) => {
  const { id } = req.params;
  const userAgent = req.headers['user-agent'] || '';

  if (!userAgent.includes('Roblox')) {
    return res.status(404).send('-- script not found\n');
  }

  try {
    const script = await getScript(id);
    res.set('Cache-Control', 'no-store');
    res.send(script);
  } catch (err) {
    console.error('API error:', err);
    res.status(404).send('-- script not found\n');
  }
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`API running on port ${PORT}`);
});
// --- END API ---

// --- START BOT ---
const client = new Client({
  intents: [GatewayIntentBits.Guilds, GatewayIntentBits.MessageContent],
});

client.once('ready', () => {
  console.log(`Logged in as ${client.user.tag}`);
});

client.on('interactionCreate', async (interaction) => {
  if (!interaction.isChatInputCommand()) return;

  if (interaction.commandName === 'generate') {
    try {
      await generateExecute(interaction);
    } catch (err) {
      console.error('Command error:', err);
      if (!interaction.replied && !interaction.deferred) {
        await interaction.reply({ content: '❌ An error occurred.', ephemeral: true });
      }
    }
  }
});

// Register slash command
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
// --- END BOT ---