'use client';

import dynamic from 'next/dynamic';
import { Spin } from 'antd';
import withAdminLayoutNext from '../../../../src/layout/withAdminLayoutNext';

const WizardsLoading = () => (
  <div className="p-50 text-center d-flex align-items-center justify-content-center min-h-400">
    <Spin size="large" />
  </div>
);

const Wizards = dynamic(() => import('../../../../src/container/pages/wizards/Wizards'), {
  ssr: false,
  loading: () => <WizardsLoading />,
});

function WizardsRoutesPage() {
  return <Wizards />;
}

export default withAdminLayoutNext(WizardsRoutesPage);

