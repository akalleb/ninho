'use client';

import withAdminLayoutNext from '../../../src/layout/withAdminLayoutNext';
import Banners from '../../../src/container/pages/Banners';

// Direct import - no lazy loading for maximum performance
function BannersPage() {
  return <Banners />;
}

export default withAdminLayoutNext(BannersPage);

