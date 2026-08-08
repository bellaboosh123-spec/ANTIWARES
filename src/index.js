import { Client, GatewayIntentBits, REST, Routes } from 'discord.js';
import 'dotenv/config';
import { data as generateData, execute as generateExecute } from './commands/generate.js';

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