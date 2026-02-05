'use client';

import React from 'react';
import { useRouter } from 'next/navigation';
import { getImageUrl } from '../src/utility/getImageUrl';
import { getBasePath } from '../src/utility/getBasePath';

export default function NotFoundPage() {
  const router = useRouter();
  const basePath = getBasePath();

  const handleReturnHome = (e) => {
    e?.preventDefault();
    const homePath = basePath ? `${basePath}/admin` : '/admin';
    router.push(homePath);
  };

  const imageUrl = getImageUrl('static/img/pages/404.svg');

  return (
    <div
      className="d-flex align-items-center justify-content-center flex-direction-column w-100 min-h-100vh text-center bg-gray-light p-20 position-fixed inset-0 z-index-9999 box-sizing-border-box"
    >
      {imageUrl && (
        <img
          src={imageUrl}
          alt="404"
          className="mb-100 max-w-400 w-100 d-block"
        />
      )}
      <h3 className="font-size-60 font-weight-600 mb-35 text-gray-medium m-0">
        404
      </h3>
      <p className="font-size-18 font-weight-500 mb-26 text-gray-dark">
        Sorry! the page you are looking for doesn&apos;t exist.
      </p>
      <button
        onClick={handleReturnHome}
        className="h-44 px-20 bg-primary text-white border-none border-radius-4 font-size-14 font-weight-500 cursor-pointer"
      >
        Return Home
      </button>
    </div>
  );
}
