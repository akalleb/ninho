'use client';
import dynamic from 'next/dynamic';
import { Spin } from 'antd';
import withAdminLayout from '../../../../src/layout/withAdminLayout';

const Loading = () => (
  <div className="p-50 text-center d-flex align-items-center justify-content-center min-h-400">
    <Spin />
  </div>
);

const AddChild = dynamic(
  () => import('../../../../src/container/ninho/children/AddChild'),
  {
    ssr: false,
    loading: () => <Loading />,
  }
);

function AddChildPage() {
  return <AddChild />;
}

export default withAdminLayout(AddChildPage);