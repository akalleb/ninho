'use client';

import React, { useEffect } from 'react';
import { useRouter } from 'next/navigation';

export default function SaudeRedirectPage() {
  const router = useRouter();

  useEffect(() => {
    router.replace('/cuidados');
  }, [router]);

  return null;
}
