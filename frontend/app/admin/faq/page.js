'use client';

import withAdminLayoutNext from '../../../src/layout/withAdminLayoutNext';
import Faq from '../../../src/container/pages/Faq';

// Direct import - no lazy loading for maximum performance
function FaqPage() {
  return <Faq />;
}

export default withAdminLayoutNext(FaqPage);

