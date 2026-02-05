'use client';

import withAdminLayoutNext from '../../../src/layout/withAdminLayoutNext';
import Testimonials from '../../../src/container/pages/Testimonials';

// Direct import - no lazy loading for maximum performance
function TestimonialsPage() {
  return <Testimonials />;
}

export default withAdminLayoutNext(TestimonialsPage);

