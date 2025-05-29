import { NextRequest, NextResponse } from 'next/server';

export async function middleware(request: NextRequest) {
  const pathname = request.nextUrl.pathname;

  // Aplica apenas para rotas protegidas
  const isProtectedRoute = pathname.startsWith('/admin') || pathname.startsWith('/afiliado');
  if (!isProtectedRoute) return NextResponse.next();

  const sessionId = request.cookies.get('session-id')?.value;

  if (!sessionId) {
    return NextResponse.redirect(new URL('/login', request.url));
  }

  try {
    const res = await fetch(`${process.env.NEXT_PUBLIC_API_BASE_URL}/validate-session`, {
      headers: { 'Session-Id': sessionId },
    });

    const result = await res.json();

    if (!res.ok || !result.valid) {
      // Sessão inválida → redireciona
      const response = NextResponse.redirect(new URL('/login', request.url));
      response.cookies.delete('session-id');
      return response;
    }

    return NextResponse.next();
  } catch (err) {
    console.log(err)
    return NextResponse.redirect(new URL('/login', request.url));
  }
}

export const config = {
  matcher: ['/admin/:path*', '/afiliado/:path*'],
};