import { NextRequest, NextResponse } from 'next/server';

export async function POST(req: NextRequest) {
  const { username, password } = await req.json();
  const adminUser = process.env.SERVUS_ADMIN_USERNAME;
  const adminPass = process.env.SERVUS_ADMIN_PASSWORD;

  if (!adminUser || !adminPass) {
    return NextResponse.json({ error: 'Admin not configured' }, { status: 500 });
  }

  if (!username || !password || username !== adminUser || password !== adminPass) {
    return NextResponse.json({ error: 'Invalid credentials' }, { status: 401 });
  }

  const res = NextResponse.json({ success: true });
  res.cookies.set('servus_admin', adminPass, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'strict',
    maxAge: 60 * 60 * 24 * 7,
    path: '/',
  });
  return res;
}

export async function DELETE() {
  const res = NextResponse.json({ success: true });
  res.cookies.set('servus_admin', '', { maxAge: 0, path: '/' });
  return res;
}
