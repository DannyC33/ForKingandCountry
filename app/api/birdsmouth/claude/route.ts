import { NextResponse } from 'next/server';
import fs from 'fs';
import path from 'path';

export async function POST(request: Request) {
  const apiKey = process.env.ANTHROPIC_API_KEY;
  if (!apiKey) return NextResponse.json({ error: 'ANTHROPIC_API_KEY not configured' }, { status: 500 });

  const { prompt } = await request.json();
  if (!prompt) return NextResponse.json({ error: 'prompt required' }, { status: 400 });

  let currentCode = '';
  try {
    currentCode = fs.readFileSync(
      path.join(process.cwd(), 'app', 'birdsmouth-brewery', 'orders', 'page.tsx'),
      'utf-8'
    );
  } catch {
    currentCode = '(could not read current file)';
  }

  const systemPrompt = `You are a code assistant for the Birdsmouth Brewery vendor ordering portal built with Next.js 15, TypeScript, Tailwind CSS, and Supabase.

When asked to make a UI or logic change, respond with:
1. A brief plain-English explanation of what you changed (2-3 sentences).
2. Then the separator: ---CODE---
3. Then the COMPLETE updated TypeScript/React file content for app/birdsmouth-brewery/orders/page.tsx — no markdown fences, no truncation, the full file.

Current file content:
\`\`\`tsx
${currentCode}
\`\`\``;

  const res = await fetch('https://api.anthropic.com/v1/messages', {
    method: 'POST',
    headers: {
      'x-api-key': apiKey,
      'anthropic-version': '2023-06-01',
      'content-type': 'application/json',
    },
    body: JSON.stringify({
      model: 'claude-opus-4-5',
      max_tokens: 16000,
      system: systemPrompt,
      messages: [{ role: 'user', content: prompt }],
    }),
  });

  if (!res.ok) {
    const err = await res.text();
    return NextResponse.json({ error: err }, { status: res.status });
  }

  const data = await res.json();
  const raw: string = data.content?.[0]?.text ?? '';

  const sepIdx = raw.indexOf('---CODE---');
  const explanation = sepIdx > -1 ? raw.slice(0, sepIdx).trim() : raw;
  const code        = sepIdx > -1 ? raw.slice(sepIdx + 10).trim() : '';

  return NextResponse.json({ explanation, code });
}
