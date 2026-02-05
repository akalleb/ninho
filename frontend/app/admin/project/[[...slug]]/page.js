'use client';

import { useParams } from 'next/navigation';
import withAdminLayout from '../../../../src/layout/withAdminLayout';

// Direct imports - no lazy loading for maximum performance
import Project from '../../../../src/container/project/Project';
import ProjectDetails from '../../../../src/container/project/ProjectDetails';
import ProjectCreate from '../../../../src/container/project/ProjectCreate';

function ProjectRoutesPage() {
  const params = useParams();
  const slug = params?.slug || [];
  const firstSlug = Array.isArray(slug) ? slug[0] || '' : slug || '';

  let Component = null;

  if (firstSlug === 'view') {
    Component = Project;
  } else if (firstSlug === 'create') {
    Component = ProjectCreate;
  } else if (firstSlug === 'projectDetails' || firstSlug?.toLowerCase() === 'projectdetails') {
    // projectDetails route with ID, e.g., /admin/project/projectDetails/1
    Component = ProjectDetails;
  }

  if (!Component) {
    return <div>Page not found</div>;
  }

  // Direct render - no dynamic loading, all components loaded immediately
  return <Component />;
}

export default withAdminLayout(ProjectRoutesPage);
