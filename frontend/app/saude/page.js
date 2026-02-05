'use client';

import React, { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { getBasePath } from '../../src/utility/getBasePath';

export default function SaudeRedirectPage() {
  const router = useRouter();
  const basePath = getBasePath();

  useEffect(() => {
    const cuidadosPath = basePath ? `${basePath}/cuidados` : '/cuidados';
    router.replace(cuidadosPath);
  }, [router, basePath]);

  return null;
}

