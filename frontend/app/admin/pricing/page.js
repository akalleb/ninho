'use client';

import withAdminLayoutNext from '../../../src/layout/withAdminLayoutNext';
import Pricing from '../../../src/container/pages/PricingTable';

// Direct import - no lazy loading for maximum performance
function PricingPage() {
  return <Pricing />;
}

export default withAdminLayoutNext(PricingPage);

