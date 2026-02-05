'use client';

import withAdminLayout from '../../../../../src/layout/withAdminLayout';
import Myprofile from '../../../../../src/container/profile/myProfile/Index';

// Direct import - no lazy loading for maximum performance
function ProfileRoutesPage() {
  return <Myprofile />;
}

export default withAdminLayout(ProfileRoutesPage);
