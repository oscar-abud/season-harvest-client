import { CONST_ENDPOINT_CLIENTES } from '@/services/constats';
import type { APIRoute } from 'astro';

const API_URL = import.meta.env.API_URL;
// const API_URL = 'http://localhost:8080';

export const DELETE: APIRoute = async ({ request, cookies }) => {
  const token = cookies.get('auth_token')?.value;
  if (!token) {
    return Response.json({ message: 'No autorizado.' }, { status: 401 });
  }

  try {
    const { id } = await request.json();

    const res = await fetch(`${API_URL}/${CONST_ENDPOINT_CLIENTES}/${id}`, {
      method: 'DELETE',
      headers: { 'Authorization': `Bearer ${token}` },
    });

    const data = await res.json();

    if (res.ok) {
      cookies.delete('auth_token', { path: '/' });
    }

    return Response.json(data, { status: res.status });
  } catch {
    return Response.json({ message: 'Error interno del servidor.' }, { status: 500 });
  }
};
