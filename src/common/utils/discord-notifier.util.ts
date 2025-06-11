import axios from 'axios';

export async function sendDiscordAlert(
  error: unknown,
  context = 'Unknown context',
): Promise<void> {
  const webhookUrl = process.env.DISCORD_WEBHOOK_URL;
  if (!webhookUrl) {
    console.warn('❌ DISCORD_WEBHOOK_URL is not defined');
    return;
  }

  const safe = (val: unknown) => (val ? String(val) : '(unknown)');
  const message = error instanceof Error ? error.message : safe(error);
  const stack =
    error instanceof Error
      ? error.stack?.split('\n').slice(0, 5).join('\n')
      : '';

  const content = `🚨 **Server Error Alert**
**Context**: ${context}
**Message**: \`\`\`${message}\`\`\`
**Stack**: 
\`\`\`${stack}\`\`\``;

  try {
    await axios.post(webhookUrl, { content });
    console.log('👾 Discord Webhook 전송 성공');
  } catch (err) {
    console.error('❌ Discord Webhook 전송 실패:', err);
  }
}
