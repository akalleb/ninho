'use client';

import withAdminLayoutNext from '../../../src/layout/withAdminLayoutNext';
import FormElements from '../../../src/container/forms/FormElements';

// Direct import - no lazy loading for maximum performance
function FormElementsPage() {
  return <FormElements />;
}

export default withAdminLayoutNext(FormElementsPage);

