'use client';

import withAdminLayoutNext from '../../../src/layout/withAdminLayoutNext';
import ComingSoon from '../../../src/container/pages/ComingSoon';

// Direct import - no lazy loading for maximum performance
function ComingSoonPage() {
  return <ComingSoon />;
}

export default withAdminLayoutNext(ComingSoonPage);

