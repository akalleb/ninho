import React, { useState, useEffect } from 'react';
import { Form, Input, Button, App } from 'antd';
import { useDispatch, useSelector } from 'react-redux';
// eslint-disable-next-line import/no-extraneous-dependencies
import { FacebookOutlined, TwitterOutlined } from '@ant-design/icons';
import { useRouter, useSearchParams } from 'next/navigation';
import { AuthWrapper } from './style';
import { login } from '../../../../redux/authentication/actionCreator';
import { Checkbox } from '../../../../components/checkbox/checkbox';
import Heading from '../../../../components/heading/heading';
import { getImageUrl } from '../../../../utility/getImageUrl';
import { getBasePath } from '../../../../utility/getBasePath';
import { NextNavLink, NextLink } from '../../../../components/utilities/NextLink';

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

  // Redirect if already authenticated (check Redux state or localStorage)
  useEffect(() => {
    if (!isLoggedIn) return;

    // Se já está logado como Profissional de Saúde, não redireciona automaticamente
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
      // Get callbackUrl from URL params or default to dashboard
      const callbackUrl = searchParams.get('callbackUrl') || '/admin/dashboard';

      // Call login API directly (client-side authentication)
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

      // Check for errors
      if (!response.ok || data.error) {
        message.error(data.error || 'Invalid email or password');
        setIsSubmitting(false);
        return;
      }

      // Check if login was successful
      if (data.success && data.user) {
        // Store user data in Redux and localStorage
        await dispatch(login(data.user));

        // Decide pós-login com base na role
        const user = data.user;

        // Profissional de Saúde: vai para área /cuidados (não entra no /admin)
        if (user.role === 'health') {
          const cuidadosPath = basePath ? `${basePath}/cuidados` : '/cuidados';
          router.push(cuidadosPath);
          return;
        }

        // Demais roles: respeita callbackUrl ou vai para /admin/dashboard
        let targetPath = callbackUrl;
        try {
          const urlObj = new URL(callbackUrl, window.location.origin);
          targetPath = urlObj.pathname + urlObj.search;
        } catch (e) {
          targetPath = callbackUrl;
        }

        router.push(targetPath);
      } else {
        console.error('Unexpected login response:', data);
        message.error('An unexpected error occurred during sign in');
        setIsSubmitting(false);
      }
    } catch (error) {
      console.error('Sign-in exception:', error);
      message.error('An error occurred during sign in. Please try again.');
      setIsSubmitting(false);
    }
  };

  const onChange = (checked) => {
    setState({ ...state, checked });
  };

  return (
    <AuthWrapper>
      <p className="auth-notice">
        Don&rsquo;t have an account? <NextNavLink to="/auth/register">Sign up now</NextNavLink>
      </p>
      <div className="auth-contents">
        <Form 
          name="login" 
          form={form} 
          onFinish={handleSubmit} 
          layout="vertical"
          onFinishFailed={(errorInfo) => {
            console.error('Form validation failed:', errorInfo);
          }}
        >
          <Heading as="h3">
            Sign in to <span className="color-secondary">Admin</span>
          </Heading>
          <Form.Item
            name="username"
            rules={[
              { required: true, message: 'Please input your email!' },
              { type: 'email', message: 'Please enter a valid email!' }
            ]}
            initialValue="admin@example.com"
            label="Email Address"
          >
            <Input type="email" placeholder="name@example.com" />
          </Form.Item>
          <Form.Item 
            name="password" 
            rules={[{ required: true, message: 'Please input your password!' }]}
            initialValue="123456" 
            label="Password"
          >
            <Input.Password placeholder="Password" />
          </Form.Item>
          <div className="auth-form-action">
            <Checkbox onChange={onChange} checked={state.checked}>
              Keep me logged in
            </Checkbox>
            <NextNavLink className="forgot-pass-link" to="/auth/forgotPassword">
              Forgot password?
            </NextNavLink>
          </div>
          <Form.Item>
            <Button 
              className="btn-signin" 
              htmlType="submit" 
              type="primary" 
              size="large"
              loading={isSubmitting || isLoading}
            >
              {isSubmitting || isLoading ? 'Signing in...' : 'Sign In'}
            </Button>
          </Form.Item>
          <p className="form-divider">
            <span>Or</span>
          </p>
          <ul className="social-login">
            <li>
              <NextLink className="google-signup" href="#">
                <img src={getImageUrl('static/img/google.png')} alt="" />
                <span>Sign in with Google</span>
              </NextLink>
            </li>
            <li>
              <NextLink className="facebook-sign" href="#">
                <FacebookOutlined />
              </NextLink>
            </li>
            <li>
              <NextLink className="twitter-sign" href="#">
                <TwitterOutlined />
              </NextLink>
            </li>
          </ul>
        </Form>
      </div>
    </AuthWrapper>
  );
}

export default SignIn;
