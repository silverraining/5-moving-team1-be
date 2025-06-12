import axios from 'axios';

/**
 * Discord Webhook 알림 전송 함수
 */
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
  const stack = error instanceof Error ? maskStackTrace(error.stack) : '';

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
/**
 * 스택트레이스를 최대 5줄까지 가져오고, 절대경로 마스킹 처리
 */
function maskStackTrace(stack?: string): string {
  if (!stack) return '';

  // 현재 작업 디렉토리를 정규화
  const projectRoot = process.cwd().replace(/\\/g, '/');

  return stack
    .split('\n')
    .slice(0, 5)
    .map((line) => {
      const normalizedLine = line.replace(/\\/g, '/');
      return normalizedLine.replace(projectRoot, '[app-root]');
    })
    .join('\n');
}
