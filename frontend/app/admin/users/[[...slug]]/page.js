'use client';

import { useParams } from 'next/navigation';
import dynamic from 'next/dynamic';
import { Spin } from 'antd';
import withAdminLayout from '../../../../src/layout/withAdminLayout';

// Components using Redux need SSR disabled
const UsersLoading = () => (
  <div className="p-50 text-center d-flex align-items-center justify-content-center min-h-400">
    <Spin />
  </div>
);

const Users = dynamic(() => import('../../../../src/container/pages/Users'), { 
  ssr: false,
  loading: () => <UsersLoading />
});

const AddUser = dynamic(() => import('../../../../src/container/ninho/users/AddUser'), { 
  ssr: false,
  loading: () => <UsersLoading />
});

const DataTable = dynamic(() => import('../../../../src/container/ninho/users/UserDataTable'), { 
  ssr: false,
  loading: () => <UsersLoading />
});

const Team = dynamic(() => import('../../../../src/container/pages/Team'), { 
  ssr: false,
  loading: () => <UsersLoading />
});

function UsersRoutesPage() {
  const params = useParams();
  const slug = params?.slug || [];
  const firstSlug = Array.isArray(slug) ? slug[0] || '' : slug || '';

  let Component = null;

  if (firstSlug === 'add-user') {
    Component = AddUser;
  } else if (firstSlug === 'dataTable' || firstSlug === 'collaborators') {
    Component = DataTable;
  } else if (firstSlug === 'team') {
    Component = Team;
  } else {
    Component = Users; // Default to Users component (grid/list/grid-style/grid-group)
  }

  return <Component />;
}

export default withAdminLayout(UsersRoutesPage);
