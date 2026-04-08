'use client';

import withAdminLayout from '../../../src/layout/withAdminLayout';
import Project from '../../../src/container/project/Project';

function ProjectsPage() {
  return <Project />;
}

export default withAdminLayout(ProjectsPage);

