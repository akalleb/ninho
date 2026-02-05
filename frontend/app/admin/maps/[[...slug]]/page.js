'use client';

import { useParams } from 'next/navigation';
import dynamic from 'next/dynamic';
import { Spin } from 'antd';
import withAdminLayoutNext from '../../../../src/layout/withAdminLayoutNext';

const MapsLoading = () => (
  <div className="p-50 text-center d-flex align-items-center justify-content-center min-h-400">
    <Spin />
  </div>
);

const GoogleMaps = dynamic(() => import('../../../../src/container/maps/GoogleMaps'), {
  ssr: false,
  loading: () => <MapsLoading />,
});

const Osm = dynamic(() => import('../../../../src/container/maps/Leaflet'), {
  ssr: false,
  loading: () => <MapsLoading />,
});

const Vector = dynamic(() => import('../../../../src/container/maps/Vector'), {
  ssr: false,
  loading: () => <MapsLoading />,
});

function MapsRoutesPage() {
  const params = useParams();
  const slug = params?.slug?.[0] || '';

  let Component = null;

  // Normalize slug to lowercase for comparison
  const normalizedSlug = slug.toLowerCase();

  if (normalizedSlug === 'google') {
    Component = GoogleMaps;
  } else if (normalizedSlug === 'leaflet') {
    Component = Osm;
  } else if (normalizedSlug === 'vector') {
    Component = Vector;
  }

  if (!Component) {
    return <div>Page not found</div>;
  }

  return <Component />;
}

export default withAdminLayoutNext(MapsRoutesPage);

