'use client';

import { useParams } from 'next/navigation';
import dynamic from 'next/dynamic';
import { Spin } from 'antd';
import withAdminLayoutNext from '../../../../src/layout/withAdminLayoutNext';

const GalleryLoading = () => (
  <div className="p-50 text-center d-flex align-items-center justify-content-center min-h-400">
    <Spin />
  </div>
);

const Gallery = dynamic(() => import('../../../../src/container/pages/Gallery'), {
  ssr: false,
  loading: () => <GalleryLoading />,
});

const GalleryTwo = dynamic(() => import('../../../../src/container/pages/GalleryTwo'), {
  ssr: false,
  loading: () => <GalleryLoading />,
});

function GalleryRoutesPage() {
  const params = useParams();
  const slug = params?.slug?.[0] || 'one';

  const Component = slug === 'two' ? GalleryTwo : Gallery;

  return <Component />;
}

export default withAdminLayoutNext(GalleryRoutesPage);

