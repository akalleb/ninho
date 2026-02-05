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

const WalletDetails = dynamic(
  () => import('../../../../src/container/ninho/wallets/details/WalletDetails'),
  {
    ssr: false,
    loading: () => <Loading />,
  }
);

function WalletDetailsPage() {
  const params = useParams();
  const { id } = params;

  return <WalletDetails walletId={id} />;
}

export default withAdminLayout(WalletDetailsPage);