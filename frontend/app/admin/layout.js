'use client';

import React, { useEffect, useState } from 'react';
import { usePathname, useRouter } from 'next/navigation';
import { useSelector } from 'react-redux';
import RouteLoader from '../../src/components/route-loader/RouteLoader';

/**
 * Shared Admin Layout for all /admin routes
 *
 * Includes RouteLoader for visual feedback during navigation.
 * Also enforces that users with role "health" cannot access /admin.
 */
export default function AdminLayout({ children }) {
  const pathname = usePathname();
  const router = useRouter();
  const authState = useSelector((state) => state.auth.login);
  const authUser = typeof authState === 'object' && authState ? authState : null;
  const [localUser, setLocalUser] = useState(null);
  const [status, setStatus] = useState('checking'); // 'checking' | 'allowed' | 'deniedHealth';

  useEffect(() => {
    if (typeof window === 'undefined') return;
    try {
      const storedUser = localStorage.getItem('authUser');
      if (storedUser) {
        const parsedUser = JSON.parse(storedUser);
        if (parsedUser && typeof parsedUser === 'object') {
          setLocalUser(parsedUser);
          return;
        }
      }
    } catch (e) {
    }
    setLocalUser(null);
  }, [pathname]);

  useEffect(() => {
    const effectiveUser = localUser || authUser;

    // Enquanto não sabemos o usuário (hidratação), mostramos loader
    if (!effectiveUser) {
      setStatus('checking');
      return;
    }

    // Se usuário é profissional de saúde, bloqueia conteúdo do /admin
    if (effectiveUser.role === 'health') {
      setStatus('deniedHealth');
    } else {
      setStatus('allowed');
    }
  }, [authUser, localUser, pathname]);

  useEffect(() => {
    if (status === 'deniedHealth') {
      const timer = setTimeout(() => {
        router.replace('/cuidados');
      }, 2000);

      return () => {
        clearTimeout(timer);
      };
    }
    return undefined;
  }, [status, router]);

  if (status === 'checking') {
    return <RouteLoader />;
  }

  if (status === 'deniedHealth') {
    return (
      <>
        <RouteLoader />
        <div
          style={{
            minHeight: '100vh',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            padding: '24px',
          }}
        >
          <div style={{ maxWidth: 480, textAlign: 'center' }}>
            <h2 style={{ marginBottom: 12 }}>Acesso não autorizado</h2>
            <p style={{ marginBottom: 0 }}>
              Sua função é <strong>Profissional de Saúde</strong>. Esta área é exclusiva para usuários administrativos.
            </p>
          </div>
        </div>
      </>
    );
  }

  return (
    <>
      <RouteLoader />
      {children}
    </>
  );
}
