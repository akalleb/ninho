'use client';

import React, { useEffect, useState } from 'react';
import { usePathname, useRouter } from 'next/navigation';
import { useSelector } from 'react-redux';
import RouteLoader from '../../src/components/route-loader/RouteLoader';
import { getBasePath } from '../../src/utility/getBasePath';

/**
 * Shared Admin Layout for all /admin routes
 *
 * Includes RouteLoader for visual feedback during navigation.
 * Also enforces that users with role "health" cannot access /admin.
 */
export default function AdminLayout({ children }) {
  const pathname = usePathname();
  const router = useRouter();
  const basePath = getBasePath();
  const authState = useSelector((state) => state.auth.login);
  const authUser = typeof authState === 'object' && authState ? authState : null;
  const [status, setStatus] = useState('checking'); // 'checking' | 'allowed' | 'deniedHealth';

  useEffect(() => {
    // Enquanto não sabemos o usuário (hidratação), mostramos loader
    if (!authUser) {
      setStatus('checking');
      return;
    }

    // Se usuário é profissional de saúde, bloqueia conteúdo do /admin
    if (authUser.role === 'health') {
      setStatus('deniedHealth');
      return;
    }

    // Demais roles têm acesso
    setStatus('allowed');
  }, [authUser, basePath, pathname]);

  useEffect(() => {
    if (status === 'deniedHealth') {
      const menuPath = basePath ? `${basePath}/cuidados` : '/cuidados';
      const timer = setTimeout(() => {
        router.replace(menuPath);
      }, 2000);

      return () => {
        clearTimeout(timer);
      };
    }
    return undefined;
  }, [status, router, basePath]);

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
