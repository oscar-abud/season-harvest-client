import type { APIRoute } from 'astro';

export const GET: APIRoute = ({ cookies }) => {
  cookies.delete('auth_token', { path: '/' });
  return Response.redirect(new URL('/', import.meta.env.SITE ?? 'http://localhost:4321'), 302);
};
