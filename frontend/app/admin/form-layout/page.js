'use client';

import withAdminLayoutNext from '../../../src/layout/withAdminLayoutNext';
import FormLayouts from '../../../src/container/forms/FormLayout';

// Direct import - no lazy loading for maximum performance
function FormLayoutPage() {
  return <FormLayouts />;
}

export default withAdminLayoutNext(FormLayoutPage);

