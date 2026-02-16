import React, { useEffect, useState } from 'react';
import { App, Spin } from 'antd';
import { useRouter, useSearchParams } from 'next/navigation';
import { useDispatch } from 'react-redux';
import { supabase } from '../../../../config/supabase';
import api from '../../../../config/api/axios';
import { login } from '../../../../redux/authentication/actionCreator';
import { AuthWrapper } from './style';
import { NextNavLink } from '../../../../components/utilities/NextLink';
import Cookies from 'js-cookie';

function AuthCallback() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const dispatch = useDispatch();
  const { message } = App.useApp();
  const [status, setStatus] = useState('loading');

  useEffect(() => {
    const run = async () => {
      try {
        const code = searchParams.get('code');
        if (code) {
          const { error } = await supabase.auth.exchangeCodeForSession(code);
          if (error) {
            message.error('Link inválido ou expirado. Solicite um novo e-mail.');
            setStatus('error');
            return;
          }
        }

        const { data } = await supabase.auth.getUser();
        const user = data?.user;
        if (!user) {
          message.error('Não foi possível concluir a autenticação.');
          setStatus('error');
          return;
        }

        let professional = null;
        try {
          const profResponse = await api.get('/professionals/me');
          professional = profResponse.data;
        } catch (e) {
        }

        const roleFromBackend = professional?.role;
        const roleFromMetadata = user.user_metadata?.role;
        const finalRole = roleFromBackend || roleFromMetadata || 'health';

        const authUser = {
          id: user.id,
          supabase_id: user.id,
          professional_id: professional ? professional.id : null,
          name: professional?.name || user.user_metadata?.name || user.email,
          email: user.email,
          role: finalRole,
          status: professional?.status || 'active',
          avatar_url: professional?.avatar_url || null,
          cover_url: professional?.cover_url || null,
        };

        await dispatch(login(authUser));

        const sessionInfo = await supabase.auth.getSession();
        const accessToken = sessionInfo.data?.session?.access_token;
        if (accessToken) {
          Cookies.set('access_token', accessToken);
        }

        if (finalRole === 'health') {
          router.replace('/cuidados');
        } else {
          router.replace('/admin/dashboard');
        }
      } catch (e) {
        message.error('Erro ao concluir o login. Tente novamente.');
        setStatus('error');
      }
    };
    run();
  }, [dispatch, message, router, searchParams]);

  if (status === 'error') {
    return (
      <AuthWrapper>
        <div className="auth-contents" style={{ textAlign: 'center' }}>
          <p style={{ marginBottom: 8 }}>Não foi possível concluir a autenticação.</p>
          <NextNavLink to="/auth">Voltar ao login</NextNavLink>
        </div>
      </AuthWrapper>
    );
  }

  return (
    <AuthWrapper>
      <div className="auth-contents" style={{ textAlign: 'center' }}>
        <Spin />
        <p style={{ marginTop: 12, marginBottom: 0 }}>Concluindo autenticação…</p>
      </div>
    </AuthWrapper>
  );
}

export default AuthCallback;
