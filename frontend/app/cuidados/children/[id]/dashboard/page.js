'use client';

import dynamic from 'next/dynamic';
import { Spin } from 'antd';
import withAdminLayoutNext from '../../../../../src/layout/withAdminLayoutNext';

const Loading = () => (
  <div className="p-50 text-center d-flex align-items-center justify-content-center min-h-400">
    <Spin />
  </div>
);

const ChildDashboard = dynamic(
  () => import('../../../../../src/container/ninho/children/ChildDashboard'),
  {
    ssr: false,
    loading: () => <Loading />,
  }
);

function ChildDashboardCarePage({ params }) {
  return <ChildDashboard params={params} />;
}

export default withAdminLayoutNext(ChildDashboardCarePage);

