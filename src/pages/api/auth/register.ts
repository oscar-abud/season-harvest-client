import type { APIRoute } from 'astro';
import { CONST_ENDPOINT_CLIENTES_REGISTER } from '@/services/constats';

const API_URL = import.meta.env.API_URL;
// const API_URL = 'http://localhost:8080';

export const POST: APIRoute = async ({ request, cookies }) => {
  try {
    const { name, lastname, email, password, birthdate, phone } = await request.json();

    if (!name || !lastname || !email || !password || !birthdate) {
      return Response.json(
        { message: 'Nombre, apellido, correo, contraseña y fecha de nacimiento son requeridos.' },
        { status: 400 }
      );
    }

    const body: Record<string, unknown> = { name, lastname, email, password, birthdate };
    if (phone) body.phone = Number(phone);

    const res = await fetch(`${API_URL}/${CONST_ENDPOINT_CLIENTES_REGISTER}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body),
    });

    const data = await res.json();

    if (!res.ok) {
      return Response.json(
        { message: data.message ?? 'No se pudo crear la cuenta.' },
        { status: res.status }
      );
    }

    // El backend devuelve token en el registro → auto-login
    cookies.set('auth_token', data.token, {
      path: '/',
      httpOnly: true,
      secure: import.meta.env.PROD,
      sameSite: 'lax',
      maxAge: 60 * 60 * 24 * 7,
    });

    return Response.json({ success: true, redirect: '/clientes', user: data.user }, { status: 201 });
  } catch {
    return Response.json(
      { message: 'Error interno del servidor.' },
      { status: 500 }
    );
  }
};
