'use client';

import withAdminLayout from '../../../../src/layout/withAdminLayout';
import Settings from '../../../../src/container/profile/settings/Settings';

// Direct import - no lazy loading for maximum performance
function SettingsRoutesPage() {
  return <Settings />;
}

export default withAdminLayout(SettingsRoutesPage);
