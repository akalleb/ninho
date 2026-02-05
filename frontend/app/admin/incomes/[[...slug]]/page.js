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

const IncomeDataTable = dynamic(
  () => import('../../../../src/container/ninho/incomes/IncomeDataTable'),
  {
    ssr: false,
    loading: () => <Loading />,
  }
);

const AddIncome = dynamic(
  () => import('../../../../src/container/ninho/incomes/AddIncome'),
  {
    ssr: false,
    loading: () => <Loading />,
  }
);

function IncomesPage() {
  const params = useParams();
  const slug = params?.slug || [];
  const firstSlug = Array.isArray(slug) ? slug[0] || '' : slug || '';

  let Component = null;

  if (firstSlug === 'add') {
    Component = AddIncome;
  } else {
    Component = IncomeDataTable;
  }

  return <Component />;
}

export default withAdminLayout(IncomesPage);