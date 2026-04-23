import type { APIRoute } from 'astro';
import { CONST_ENDPOINT_CLIENTES_LOGIN } from '@/services/constats';

// TODO: Confirmar los sub-paths del endpoint con el usuario
// Actualmente asume: POST /api/usuario/login → devuelve { token: string }
// const API_URL = import.meta.env.API_URL;
const API_URL = 'http://localhost:8080';

export const POST: APIRoute = async ({ request, cookies }) => {
  try {
    const { email, password } = await request.json();

    if (!email || !password) {
      return Response.json(
        { message: 'Correo y contraseña son requeridos.' },
        { status: 400 }
      );
    }

    const res = await fetch(`${API_URL}/${CONST_ENDPOINT_CLIENTES_LOGIN}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password }),
    });

    const data = await res.json();

    if (!res.ok) {
      return Response.json(
        { message: data.message ?? 'Credenciales inválidas.' },
        { status: res.status }
      );
    }

    cookies.set('auth_token', data.token, {
      path: '/',
      httpOnly: true,
      secure: import.meta.env.PROD,
      sameSite: 'lax',
      maxAge: 60 * 60 * 24 * 7, // 7 días
    });

    return Response.json({ success: true, redirect: '/clientes' });
  } catch {
    return Response.json(
      { message: 'Error interno del servidor.' },
      { status: 500 }
    );
  }
};
