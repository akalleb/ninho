'use client';

import { useParams } from 'next/navigation';
import withAdminLayoutNext from '../../../../src/layout/withAdminLayoutNext';

// Direct imports - no lazy loading for maximum performance
import Basic from '../../../../src/container/table/Table';
import DataTable from '../../../../src/container/table/DataTable';

function TablesRoutesPage() {
  const params = useParams();
  const slug = params?.slug?.[0] || '';

  let Component = null;

  if (slug === 'basic') {
    Component = Basic;
  } else if (slug === 'dataTable') {
    Component = DataTable;
  }

  if (!Component) {
    return <div>Page not found</div>;
  }

  // Direct render - no dynamic loading, all components loaded immediately
  return <Component />;
}

export default withAdminLayoutNext(TablesRoutesPage);

