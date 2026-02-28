export { default } from 'next-auth/middleware';

export const config = {
  matcher: ['/dashboard/:path*', '/api/students/:path*', '/api/modules/:path*', '/api/stats/:path*', '/api/filieres/:path*', '/api/attendance/:path*'],
};
