import React, { useState } from 'react';
import { NextNavLink } from '../../../../components/utilities/NextLink';
import { Form, Input, Button, App } from 'antd';
import { AuthWrapper } from './style';
import Heading from '../../../../components/heading/heading';
import { supabase } from '../../../../config/supabase';

function ForgotPassword() {
  const [state, setState] = useState({
    values: null,
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { message } = App.useApp();

  const handleSubmit = async (values) => {
    setState({ ...state, values });
    setIsSubmitting(true);
    try {
      const siteUrl =
        process.env.NEXT_PUBLIC_SITE_URL ||
        (typeof window !== 'undefined' ? window.location.origin : '');

      const { error } = await supabase.auth.resetPasswordForEmail(values.email, {
        redirectTo: `${siteUrl}/auth/resetPassword`,
      });

      if (error) {
        message.error(error.message || 'Não foi possível enviar o e-mail de redefinição.');
        return;
      }

      message.success('Se este e-mail existir, enviaremos instruções de redefinição.');
    } catch (e) {
      message.error('Erro ao conectar. Tente novamente.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <AuthWrapper>
      <div className="auth-contents">
        <Form name="forgotPass" onFinish={handleSubmit} layout="vertical">
          <Heading as="h3">Forgot Password?</Heading>
          <p className="forgot-text">
            Enter the email address you used when you joined and we’ll send you instructions to reset your password.
          </p>
          <Form.Item
            label="Email Address"
            name="email"
            rules={[{ required: true, message: 'Please input your email!', type: 'email' }]}
          >
            <Input placeholder="name@example.com" />
          </Form.Item>
          <Form.Item>
            <Button className="btn-reset" htmlType="submit" type="primary" size="large" loading={isSubmitting}>
              Send Reset Instructions
            </Button>
          </Form.Item>
          <p className="return-text">
            Return to <NextNavLink to="/auth">Sign In</NextNavLink>
          </p>
        </Form>
      </div>
    </AuthWrapper>
  );
}

export default ForgotPassword;
