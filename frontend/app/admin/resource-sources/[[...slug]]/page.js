'use client';

import { useParams } from 'next/navigation';
import dynamic from 'next/dynamic';
import { Spin } from 'antd';
import withAdminLayout from '../../../../src/layout/withAdminLayout';

const Loading = () => (
  <div className="p-50 text-center d-flex align-items-center justify-content-center min-h-400">
    <Spin />
  </div>
);

const ResourceSourceDataTable = dynamic(
  () => import('../../../../src/container/ninho/resource-sources/ResourceSourceDataTable'),
  {
    ssr: false,
    loading: () => <Loading />,
  }
);

const AddResourceSource = dynamic(
  () => import('../../../../src/container/ninho/resource-sources/AddResourceSource'),
  {
    ssr: false,
    loading: () => <Loading />,
  }
);

function ResourceSourcesPage() {
  const params = useParams();
  const slug = params?.slug || [];
  const firstSlug = Array.isArray(slug) ? slug[0] || '' : slug || '';

  let Component = null;

  if (firstSlug === 'add' || firstSlug === 'edit') {
    Component = AddResourceSource;
  } else {
    Component = ResourceSourceDataTable;
  }

  return <Component />;
}

export default withAdminLayout(ResourceSourcesPage);