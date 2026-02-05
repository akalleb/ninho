'use client';

import { useParams } from 'next/navigation';
import withAdminLayoutNext from '../../../../src/layout/withAdminLayoutNext';

// Direct imports - no lazy loading for maximum performance
import Import from '../../../../src/container/importExport/Import';
import Export from '../../../../src/container/importExport/Export';

function ImportExportRoutesPage() {
  const params = useParams();
  const slug = params?.slug?.[0] || '';

  let Component = null;

  if (slug === 'import') {
    Component = Import;
  } else if (slug === 'export') {
    Component = Export;
  }

  if (!Component) {
    return <div>Page not found</div>;
  }

  // Direct render - no dynamic loading, all components loaded immediately
  return <Component />;
}

export default withAdminLayoutNext(ImportExportRoutesPage);

