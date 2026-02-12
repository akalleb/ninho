import React, { useState, useEffect } from 'react';
import { Form, Input, Button, App, Card } from 'antd';
import { useDispatch, useSelector } from 'react-redux';
import { useRouter, useSearchParams } from 'next/navigation';
import { AuthWrapper } from './style';
import { login } from '../../../../redux/authentication/actionCreator';
import { supabase } from '../../../../config/supabase';
import { Checkbox } from '../../../../components/checkbox/checkbox';
import Heading from '../../../../components/heading/heading';
import { getBasePath } from '../../../../utility/getBasePath';
import api from '../../../../config/api/axios';

function SignIn() {
  const dispatch = useDispatch();
  const router = useRouter();
  const searchParams = useSearchParams();
  const isLoggedIn = useSelector((state) => state.auth.login);
  const isLoading = useSelector((state) => state.auth.loading);
  const [form] = Form.useForm();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [state, setState] = useState({
    checked: null,
  });
  const { message } = App.useApp();
  const basePath = getBasePath();

  const authUser =
    typeof isLoggedIn === 'object' && isLoggedIn ? isLoggedIn : null;

  useEffect(() => {
    if (!isLoggedIn) return;

    if (authUser && authUser.role === 'health') {
      return;
    }

    const callbackUrl =
      searchParams.get('callbackUrl') || '/admin/dashboard';
    router.push(callbackUrl);
  }, [isLoggedIn, authUser, router, searchParams]);

  const handleSubmit = async (values) => {
    setIsSubmitting(true);
    try {
      const callbackUrl = searchParams.get('callbackUrl') || '/admin/dashboard';

      // Supabase Login
      const { data, error } = await supabase.auth.signInWithPassword({
        email: values.username || values.email,
        password: values.password,
      });

      if (error) {
        message.error(error.message === 'Invalid login credentials' ? 'E-mail ou senha inválidos' : error.message);
        setIsSubmitting(false);
        return;
      }

      if (data.session) {
        const token = data.session.access_token;
        const user = data.user;

        if (typeof window !== 'undefined') {
          localStorage.setItem('access_token', token);
        }

        let professional = null;
        try {
          const profResponse = await api.get('/professionals/', {
            params: {
              email: user.email,
              limit: 1,
            },
          });
          if (Array.isArray(profResponse.data) && profResponse.data.length > 0) {
            professional = profResponse.data[0];
          }
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

        if (finalRole === 'health') {
          const cuidadosPath = basePath ? `${basePath}/cuidados` : '/cuidados';
          router.push(cuidadosPath);
          return;
        }

        let targetPath = callbackUrl;
        try {
          const urlObj = new URL(callbackUrl, window.location.origin);
          targetPath = urlObj.pathname + urlObj.search;
        } catch (e) {
          targetPath = callbackUrl;
        }

        router.push(targetPath);
      } else {
        message.error('Erro inesperado ao entrar');
        setIsSubmitting(false);
      }
    } catch (error) {
      console.error('Sign-in exception:', error);
      message.error('Erro ao conectar. Tente novamente.');
      setIsSubmitting(false);
    }
  };

  const onChange = (checked) => {
    setState({ ...state, checked });
  };

  return (
    <AuthWrapper>
      <div className="auth-contents" style={{ 
        maxWidth: '420px', 
        margin: '0 auto',
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'center',
        minHeight: '100vh' 
      }}>
        <Card bordered={false} style={{ boxShadow: '0 4px 20px rgba(0,0,0,0.05)', borderRadius: '12px', padding: '20px' }}>
          <Form 
            name="login" 
            form={form} 
            onFinish={handleSubmit} 
            layout="vertical"
          >
            <div style={{ textAlign: 'center', marginBottom: 30 }}>
               <Heading as="h3" style={{ marginBottom: '8px' }}>
                 Acesse o <span className="color-secondary">Sistema Ninho</span>
               </Heading>
               <p style={{ color: '#888', margin: 0 }}>Gestão Integrada de Saúde e Assistência</p>
            </div>
            
            <Form.Item
              name="username"
              rules={[
                { required: true, message: 'Por favor, insira seu e-mail!' },
                { type: 'email', message: 'Por favor, insira um e-mail válido!' }
              ]}
              label="E-mail"
            >
              <Input size="large" type="email" placeholder="nome@exemplo.com" />
            </Form.Item>
            <Form.Item 
              name="password" 
              rules={[{ required: true, message: 'Por favor, insira sua senha!' }]}
              label="Senha"
            >
              <Input.Password size="large" placeholder="Sua senha" />
            </Form.Item>
            
            <div className="auth-form-action" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
              <Checkbox onChange={onChange} checked={state.checked}>
                Manter conectado
              </Checkbox>
            </div>
            
            <Form.Item>
              <Button 
                className="btn-signin" 
                htmlType="submit" 
                type="primary" 
                size="large"
                block
                loading={isSubmitting || isLoading}
                style={{ height: '48px', fontSize: '16px', fontWeight: 500 }}
              >
                {isSubmitting || isLoading ? 'Entrando...' : 'Entrar'}
              </Button>
            </Form.Item>
          </Form>
        </Card>
      </div>
    </AuthWrapper>
  );
}

export default SignIn;
