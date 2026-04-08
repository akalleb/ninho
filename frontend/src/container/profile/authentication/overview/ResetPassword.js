import React, { useEffect, useState } from 'react';
import { App, Form, Input, Button, Card } from 'antd';
import { useRouter, useSearchParams } from 'next/navigation';
import Heading from '../../../../components/heading/heading';
import { AuthWrapper } from './style';
import { supabase } from '../../../../config/supabase';

function ResetPassword() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { message } = App.useApp();
  const [form] = Form.useForm();
  const [isReady, setIsReady] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    const init = async () => {
      try {
        const code = searchParams.get('code');
        if (code) {
          const { error } = await supabase.auth.exchangeCodeForSession(code);
          if (error) {
            message.error('Link inválido ou expirado. Solicite um novo e-mail.');
            setIsReady(false);
            return;
          }
          setIsReady(true);
          return;
        }

        if (typeof window !== 'undefined' && window.location.hash) {
          const hash = window.location.hash.replace(/^#/, '');
          const params = new URLSearchParams(hash);
          const access_token = params.get('access_token');
          const refresh_token = params.get('refresh_token');
          if (access_token && refresh_token) {
            const { error } = await supabase.auth.setSession({
              access_token,
              refresh_token,
            });
            if (error) {
              message.error('Link inválido ou expirado. Solicite um novo e-mail.');
              setIsReady(false);
              return;
            }
            setIsReady(true);
            return;
          }
        }

        const { data } = await supabase.auth.getSession();
        if (data?.session) {
          setIsReady(true);
          return;
        }

        setIsReady(false);
      } catch (e) {
        setIsReady(false);
      }
    };
    init();
  }, [message, searchParams]);

  const handleSubmit = async (values) => {
    setIsSubmitting(true);
    try {
      const { error } = await supabase.auth.updateUser({ password: values.password });
      if (error) {
        message.error(error.message || 'Não foi possível alterar a senha.');
        return;
      }
      message.success('Senha atualizada com sucesso. Faça login novamente.');
      await supabase.auth.signOut();
      router.replace('/auth');
    } catch (e) {
      message.error('Erro ao conectar. Tente novamente.');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!isReady) {
    return (
      <AuthWrapper>
        <div className="auth-contents" style={{ maxWidth: 420, margin: '0 auto' }}>
          <Card variant="borderless" style={{ padding: 20 }}>
            <Heading as="h3" style={{ marginBottom: 8 }}>
              Redefinir senha
            </Heading>
            <p style={{ marginBottom: 0 }}>
              Link inválido ou expirado. Volte e solicite um novo e-mail de redefinição.
            </p>
          </Card>
        </div>
      </AuthWrapper>
    );
  }

  return (
    <AuthWrapper>
      <div className="auth-contents" style={{ maxWidth: 420, margin: '0 auto' }}>
        <Card variant="borderless" style={{ padding: 20 }}>
          <Heading as="h3" style={{ marginBottom: 20 }}>
            Redefinir senha
          </Heading>
          <Form form={form} layout="vertical" onFinish={handleSubmit}>
            <Form.Item
              label="Nova senha"
              name="password"
              rules={[
                { required: true, message: 'Informe a nova senha.' },
                { min: 8, message: 'Use uma senha com pelo menos 8 caracteres.' },
              ]}
            >
              <Input.Password placeholder="Nova senha" />
            </Form.Item>
            <Form.Item
              label="Confirmar nova senha"
              name="confirm_password"
              dependencies={['password']}
              rules={[
                { required: true, message: 'Confirme a nova senha.' },
                ({ getFieldValue }) => ({
                  validator(_, value) {
                    if (!value || getFieldValue('password') === value) {
                      return Promise.resolve();
                    }
                    return Promise.reject(new Error('As senhas não coincidem.'));
                  },
                }),
              ]}
            >
              <Input.Password placeholder="Confirmar nova senha" />
            </Form.Item>
            <Button type="primary" htmlType="submit" block loading={isSubmitting}>
              Atualizar senha
            </Button>
          </Form>
        </Card>
      </div>
    </AuthWrapper>
  );
}

export default ResetPassword;

