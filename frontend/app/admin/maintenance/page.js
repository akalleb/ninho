'use client';

import withAdminLayoutNext from '../../../src/layout/withAdminLayoutNext';
import Maintenance from '../../../src/container/pages/Maintenance';

// Direct import - no lazy loading for maximum performance
function MaintenancePage() {
  return <Maintenance />;
}

export default withAdminLayoutNext(MaintenancePage);

