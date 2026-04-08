'use client';

import withAdminLayout from '../../../../src/layout/withAdminLayout';
import Project from '../../../../src/container/project/Project';
import ProjectCreate from '../../../../src/container/project/ProjectCreate';
import ProjectDetails from '../../../../src/container/project/ProjectDetails';
import { useParams } from 'next/navigation';

function ProjectRoutesPage() {
  const params = useParams();
  const slug = Array.isArray(params?.slug) ? params.slug : [];
  const section = slug[0] || 'view';

  if (section === 'create') {
    return <ProjectCreate />;
  }

  if (section === 'projectDetails') {
    return <ProjectDetails />;
  }

  return <Project />;
}

export default withAdminLayout(ProjectRoutesPage);
