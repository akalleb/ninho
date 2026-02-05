'use client';

import { useParams } from 'next/navigation';
import dynamic from 'next/dynamic';
import { Spin } from 'antd';
import withAdminLayoutNext from '../../../../src/layout/withAdminLayoutNext';

// Loading component to maintain layout structure
const DashboardLoading = () => (
  <div className="p-50 text-center d-flex align-items-center justify-content-center h-100vh min-h-600">
    <Spin />
  </div>
);

// Ninho Components
const NinhoPlayground = dynamic(() => import('../../../../src/container/ninho/Playground'), { 
  ssr: false,
  loading: () => <DashboardLoading />,
});

// User Management Components
const UserDataTable = dynamic(() => import('../../../../src/container/ninho/users/UserDataTable'), {
  ssr: false,
  loading: () => <DashboardLoading />,
});

const AddUser = dynamic(() => import('../../../../src/container/ninho/users/AddUser'), {
  ssr: false,
  loading: () => <DashboardLoading />,
});

function DashboardRoutesPage() {
  const params = useParams();
  const slug = params?.slug?.[0] || '';
  const subSlug = params?.slug?.[1] || '';

  // Routing Logic
  if (slug === 'users') {
    if (subSlug === 'dataTable') {
        return <UserDataTable />;
    }
    if (subSlug === 'add-user') {
        return <AddUser />;
    }
    // Default to dataTable if just /users is accessed (though menu links to /users/dataTable)
    return <UserDataTable />;
  }

  // Default route
  return <NinhoPlayground />;
}

export default withAdminLayoutNext(DashboardRoutesPage);
