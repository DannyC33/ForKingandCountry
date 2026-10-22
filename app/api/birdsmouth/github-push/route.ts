import { NextResponse } from 'next/server';

const FILE_PATH = 'app/birdsmouth-brewery/orders/page.tsx';

export async function POST(request: Request) {
  const token = process.env.GITHUB_TOKEN;
  const owner = process.env.GITHUB_OWNER;
  const repo  = process.env.GITHUB_REPO;

  if (!token || !owner || !repo) {
    return NextResponse.json({ error: 'GitHub credentials not configured (GITHUB_TOKEN, GITHUB_OWNER, GITHUB_REPO)' }, { status: 500 });
  }

  const { content, commitMessage } = await request.json();
  if (!content) return NextResponse.json({ error: 'content required' }, { status: 400 });

  const headers = {
    Authorization: `Bearer ${token}`,
    Accept: 'application/vnd.github+json',
    'X-GitHub-Api-Version': '2022-11-28',
    'Content-Type': 'application/json',
  };

  // Get current file SHA
  const getRes = await fetch(`https://api.github.com/repos/${owner}/${repo}/contents/${FILE_PATH}`, { headers });
  if (!getRes.ok) return NextResponse.json({ error: `Could not fetch current file: ${await getRes.text()}` }, { status: 500 });
  const { sha } = await getRes.json();

  // Push updated file
  const encoded = Buffer.from(content, 'utf-8').toString('base64');
  const putRes = await fetch(`https://api.github.com/repos/${owner}/${repo}/contents/${FILE_PATH}`, {
    method: 'PUT',
    headers,
    body: JSON.stringify({ message: commitMessage ?? 'Admin: update vendor ordering portal', content: encoded, sha }),
  });

  if (!putRes.ok) return NextResponse.json({ error: `Push failed: ${await putRes.text()}` }, { status: 500 });
  const result = await putRes.json();
  return NextResponse.json({ success: true, commit: result.commit?.sha });
}
