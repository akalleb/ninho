import React, { useState, useEffect } from 'react';
import { Form, Input, Button, App, Card } from 'antd';
import { useDispatch, useSelector } from 'react-redux';
import { useRouter, useSearchParams } from 'next/navigation';
import { AuthWrapper } from './style';
import { login } from '../../../../redux/authentication/actionCreator';
import { Checkbox } from '../../../../components/checkbox/checkbox';
import Heading from '../../../../components/heading/heading';
import { getBasePath } from '../../../../utility/getBasePath';

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

      const response = await fetch('/api/auth/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          email: values.username || values.email,
          password: values.password,
        }),
      });

      const data = await response.json();

      if (!response.ok || data.error) {
        message.error(data.error || 'E-mail ou senha inválidos');
        setIsSubmitting(false);
        return;
      }

      if (data.success && data.user) {
        await dispatch(login(data.user));

        const user = data.user;

        if (user.role === 'health') {
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
      <div className="auth-contents" style={{ maxWidth: '420px', margin: '0 auto' }}>
        <Form 
          name="login" 
          form={form} 
          onFinish={handleSubmit} 
          layout="vertical"
        >
          <div style={{ textAlign: 'center', marginBottom: 30 }}>
             <Heading as="h3">
               Acesse o <span className="color-secondary">Sistema Ninho</span>
             </Heading>
             <p style={{ color: '#888' }}>Gestão Integrada de Saúde e Assistência</p>
          </div>
          
          <Form.Item
            name="username"
            rules={[
              { required: true, message: 'Por favor insira seu email!' },
              { type: 'email', message: 'Por favor insira um email válido!' }
            ]}
            label="Endereço de Email"
          >
            <Input size="large" type="email" placeholder="nome@exemplo.com" />
          </Form.Item>
          <Form.Item 
            name="password" 
            rules={[{ required: true, message: 'Por favor insira sua senha!' }]}
            label="Senha"
          >
            <Input.Password size="large" placeholder="Sua senha" />
          </Form.Item>
          
          <div className="auth-form-action">
            <Checkbox onChange={onChange} checked={state.checked}>
              Manter conectado
            </Checkbox>
            {/* <NextNavLink className="forgot-pass-link" to="/auth/forgotPassword">
              Esqueceu a senha?
            </NextNavLink> */}
          </div>
          
          <Form.Item style={{ marginTop: 20 }}>
            <Button 
              className="btn-signin" 
              htmlType="submit" 
              type="primary" 
              size="large"
              block
              loading={isSubmitting || isLoading}
            >
              {isSubmitting || isLoading ? 'Entrando...' : 'Entrar'}
            </Button>
          </Form.Item>
        </Form>
      </div>
    </AuthWrapper>
  );
}

export default SignIn;
