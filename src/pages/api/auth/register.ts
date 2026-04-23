import type { APIRoute } from 'astro';
import { CONST_ENDPOINT_USUARIOS } from '../../../services/constats';

// TODO: Confirmar los sub-paths del endpoint con el usuario
// Actualmente asume: POST /api/usuario/register → crea el usuario
const API_URL = import.meta.env.API_URL;

export const POST: APIRoute = async ({ request }) => {
  try {
    const { name, email, password } = await request.json();

    if (!name || !email || !password) {
      return Response.json(
        { message: 'Todos los campos son requeridos.' },
        { status: 400 }
      );
    }

    const res = await fetch(`${API_URL}/${CONST_ENDPOINT_USUARIOS}/register`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name, email, password }),
    });

    const data = await res.json();

    if (!res.ok) {
      return Response.json(
        { message: data.message ?? 'No se pudo crear la cuenta.' },
        { status: res.status }
      );
    }

    return Response.json({ success: true }, { status: 201 });
  } catch {
    return Response.json(
      { message: 'Error interno del servidor.' },
      { status: 500 }
    );
  }
};
