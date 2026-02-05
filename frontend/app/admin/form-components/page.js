'use client';

import dynamic from 'next/dynamic';
import { Spin } from 'antd';
import withAdminLayoutNext from '../../../src/layout/withAdminLayoutNext';

// Loading component to maintain layout structure
const FormLoading = () => (
  <div className="p-50 text-center">
    <Spin />
  </div>
);

// Disable SSR for FormComponents page due to react-rte dependency
const FormComponents = dynamic(() => import('../../../src/container/forms/FormComponents'), {
  ssr: false,
  loading: () => <FormLoading />,
});

function FormComponentsPage() {
  return <FormComponents />;
}

export default withAdminLayoutNext(FormComponentsPage);

