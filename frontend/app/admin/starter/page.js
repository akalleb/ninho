'use client';

import withAdminLayoutNext from '../../../src/layout/withAdminLayoutNext';
import BlankPage from '../../../src/container/pages/BlankPage';

// Direct import - no lazy loading for maximum performance
function StarterPage() {
  return <BlankPage />;
}

export default withAdminLayoutNext(StarterPage);

