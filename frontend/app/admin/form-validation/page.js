'use client';

import withAdminLayoutNext from '../../../src/layout/withAdminLayoutNext';
import FormValidation from '../../../src/container/forms/FormValidation';

// Direct import - no lazy loading for maximum performance
function FormValidationPage() {
  return <FormValidation />;
}

export default withAdminLayoutNext(FormValidationPage);

