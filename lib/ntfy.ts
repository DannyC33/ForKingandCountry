export async function sendNtfy(title: string, body: string, tags?: string[]) {
  const topic = process.env.NTFY_TOPIC;
  if (!topic) return;

  await fetch(`https://ntfy.sh/${topic}`, {
    method: 'POST',
    headers: {
      'Title':    title,
      'Priority': 'high',
      'Tags':     (tags ?? ['bell']).join(','),
      'Content-Type': 'text/plain',
    },
    body,
  });
}
