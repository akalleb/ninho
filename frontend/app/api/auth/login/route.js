import { NextResponse } from 'next/server';
import api from '../../../../src/config/api/axios';

export async function POST(request) {
  try {
    const body = await request.json();
    const { email, password } = body;

    if (!email || !password) {
      return NextResponse.json(
        { error: 'Informe e-mail e senha' },
        { status: 400 },
      );
    }

    const response = await api.post('/auth/login', { email, password });
    const user = response.data;

    return NextResponse.json({
      success: true,
      user,
    });
  } catch (error) {
    console.error('Login API error:', error);
    return NextResponse.json(
      { error: 'Erro ao autenticar. Tente novamente.' },
      { status: 500 },
    );
  }
}
