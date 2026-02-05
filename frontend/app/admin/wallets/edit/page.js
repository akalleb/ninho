'use client';
import dynamic from 'next/dynamic';
import { Spin } from 'antd';
import withAdminLayout from '../../../../src/layout/withAdminLayout';

const Loading = () => (
  <div className="p-50 text-center d-flex align-items-center justify-content-center min-h-400">
    <Spin />
  </div>
);

const AddWallet = dynamic(
  () => import('../../../../src/container/ninho/wallets/AddWallet'),
  {
    ssr: false,
    loading: () => <Loading />,
  }
);

function EditWalletPage() {
  return <AddWallet />;
}

export default withAdminLayout(EditWalletPage);