import React, { useState } from 'react';
import { FacebookOutlined, TwitterOutlined } from '@ant-design/icons';
import { Form, Input, Button, App } from 'antd';
import { AuthWrapper } from './style';
import { Checkbox } from '../../../../components/checkbox/checkbox';
import Heading from '../../../../components/heading/heading';
import { getImageUrl } from '../../../../utility/getImageUrl';
import { NextNavLink } from '../../../../components/utilities/NextLink';
import { supabase } from '../../../../config/supabase';

function SignUp() {
  const [state, setState] = useState({
    values: null,
    checked: null,
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { message } = App.useApp();
  const [form] = Form.useForm();

  const handleSubmit = async (values) => {
    setState({ ...state, values });
    setIsSubmitting(true);
    try {
      if (!state.checked) {
        message.error('Você precisa aceitar os termos para criar uma conta.');
        return;
      }

      const siteUrl =
        process.env.NEXT_PUBLIC_SITE_URL ||
        (typeof window !== 'undefined' ? window.location.origin : '');

      const { error } = await supabase.auth.signUp({
        email: values.email,
        password: values.password,
        options: {
          emailRedirectTo: `${siteUrl}/auth/callback`,
          data: {
            name: values.name,
            role: 'health',
          },
        },
      });

      if (error) {
        message.error(error.message || 'Não foi possível criar sua conta.');
        return;
      }

      message.success(
        'Conta criada! Enviamos um e-mail de confirmação. Verifique sua caixa de entrada e spam.'
      );
      form.resetFields();
    } catch (e) {
      message.error('Erro ao conectar. Tente novamente.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const onChange = (checked) => {
    setState({ ...state, checked });
  };

  return (
    <AuthWrapper>
      <p className="auth-notice">
        Already have an account? <NextNavLink to="/auth">Sign In</NextNavLink>
      </p>
      <div className="auth-contents">
        <Form form={form} name="register" onFinish={handleSubmit} layout="vertical">
          <Heading as="h3">
            Sign Up to <span className="color-secondary">Admin</span>
          </Heading>
          <Form.Item label="Name" name="name" rules={[{ required: true, message: 'Please input your Full name!' }]}>
            <Input placeholder="Full name" />
          </Form.Item>
          <Form.Item
            name="email"
            label="Email Address"
            rules={[{ required: true, message: 'Please input your email!', type: 'email' }]}
          >
            <Input placeholder="name@example.com" />
          </Form.Item>
          <Form.Item
            label="Password"
            name="password"
            rules={[
              { required: true, message: 'Please input your password!' },
              { min: 8, message: 'Use uma senha com pelo menos 8 caracteres.' },
            ]}
          >
            <Input.Password placeholder="Password" />
          </Form.Item>
          <Form.Item
            label="Confirm Password"
            name="confirm_password"
            dependencies={['password']}
            rules={[
              { required: true, message: 'Confirme sua senha.' },
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
            <Input.Password placeholder="Confirm Password" />
          </Form.Item>
          <div className="auth-form-action">
            <Checkbox onChange={onChange} checked={state.checked}>
              Creating an account means you’re okay with our Terms of Service and Privacy Policy
            </Checkbox>
          </div>
          <Form.Item>
            <Button className="btn-create" htmlType="submit" type="primary" size="large" loading={isSubmitting}>
              Create Account
            </Button>
          </Form.Item>
          <p className="form-divider">
            <span>Or</span>
          </p>
          <ul className="social-login signin-social">
            <li>
              <a className="google-signup" href="/">
                <img src={getImageUrl('static/img/google.png')} alt="" />
                <span>Sign up with Google</span>
              </a>
            </li>
            <li>
              <a className="facebook-sign" href="/">
                <FacebookOutlined />
              </a>
            </li>
            <li>
              <a className="twitter-sign" href="/">
                <TwitterOutlined />
              </a>
            </li>
          </ul>
        </Form>
      </div>
    </AuthWrapper>
  );
}

export default SignUp;
