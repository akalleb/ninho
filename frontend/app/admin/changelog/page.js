'use client';

import withAdminLayoutNext from '../../../src/layout/withAdminLayoutNext';
import ChangeLog from '../../../src/container/pages/ChangeLog';

// Direct import - no lazy loading for maximum performance
function ChangelogPage() {
  return <ChangeLog />;
}

export default withAdminLayoutNext(ChangelogPage);

