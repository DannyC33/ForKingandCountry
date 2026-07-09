import { createServerClient, type CookieOptions } from '@supabase/ssr';
import { NextResponse, type NextRequest } from 'next/server';

export async function middleware(request: NextRequest) {
  const host = request.headers.get('host') ?? '';
  const { pathname } = request.nextUrl;

  // ── Leonardo Motel subdomain routing ───────────────────────────────────────
  const isLeonardoSubdomain =
    host.startsWith('leonardomotel.') ||
    host === 'leonardomotel.localhost:3000';

  if (isLeonardoSubdomain) {
    // Static assets and API routes pass through unchanged
    if (
      pathname.startsWith('/api/') ||
      pathname.startsWith('/_next/') ||
      pathname === '/favicon.ico'
    ) {
      return NextResponse.next();
    }

    // Protect /admin/dashboard — must have valid leo_admin cookie
    if (pathname.startsWith('/admin/dashboard')) {
      const token = request.cookies.get('leo_admin')?.value;
      if (!token || token !== process.env.LEONARDO_ADMIN_PASSWORD) {
        return NextResponse.redirect(new URL('/admin', request.url));
      }
    }

    // Rewrite all other page requests to /leonardo-motel prefix
    const rewriteTarget = new URL(
      `/leonardo-motel${pathname === '/' ? '' : pathname}`,
      request.url
    );
    return NextResponse.rewrite(rewriteTarget);
  }

  // ── Main Servus site — existing Supabase auth ─────────────────────────────
  let supabaseResponse = NextResponse.next({ request });

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll();
        },
        setAll(cookiesToSet: Array<{ name: string; value: string; options: CookieOptions }>) {
          cookiesToSet.forEach(({ name, value }) => request.cookies.set(name, value));
          supabaseResponse = NextResponse.next({ request });
          cookiesToSet.forEach(({ name, value, options }) =>
            supabaseResponse.cookies.set(name, value, options)
          );
        },
      },
    }
  );

  const {
    data: { user },
  } = await supabase.auth.getUser();

  const isDashboard = pathname.startsWith('/dashboard');
  const isLogin = pathname === '/login';

  if (isDashboard && !user) {
    const url = request.nextUrl.clone();
    url.pathname = '/login';
    url.searchParams.set('redirectTo', pathname);
    return NextResponse.redirect(url);
  }

  if (isLogin && user) {
    const url = request.nextUrl.clone();
    url.pathname = '/dashboard';
    return NextResponse.redirect(url);
  }

  return supabaseResponse;
}

export const config = {
  matcher: ['/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)'],
};
