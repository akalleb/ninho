'use client';

import Task from '../../../../../src/container/task/Index';
import withAdminLayoutNext from '../../../../../src/layout/withAdminLayoutNext';

// Direct import - no lazy loading for maximum performance
function TaskRoutesPage() {
  return <Task />;
}

export default withAdminLayoutNext(TaskRoutesPage);
