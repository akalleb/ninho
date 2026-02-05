'use client';

import withAdminLayoutNext from '../../../src/layout/withAdminLayoutNext';
import Support from '../../../src/container/pages/support';

// Direct import - no lazy loading for maximum performance
function SupportPage() {
  return <Support />;
}

export default withAdminLayoutNext(SupportPage);

