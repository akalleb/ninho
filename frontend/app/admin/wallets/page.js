'use client';
import dynamic from 'next/dynamic';
import { Spin } from 'antd';
import withAdminLayout from '../../../src/layout/withAdminLayout';

const Loading = () => (
  <div className="p-50 text-center d-flex align-items-center justify-content-center min-h-400">
    <Spin />
  </div>
);

const Wallets = dynamic(
  () => import('../../../src/container/ninho/wallets/Wallets'),
  {
    ssr: false,
    loading: () => <Loading />,
  }
);

function WalletsPage() {
  return <Wallets />;
}

export default withAdminLayout(WalletsPage);