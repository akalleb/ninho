'use client';

import { useParams } from 'next/navigation';
import dynamic from 'next/dynamic';
import { Spin } from 'antd';
import withAdminLayoutNext from '../../../../src/layout/withAdminLayoutNext';

const AppLoading = () => (
  <div className="p-50 text-center d-flex align-items-center justify-content-center min-h-400">
    <Spin />
  </div>
);

const Kanban = dynamic(() => import('../../../../src/container/kanban/Index'), {
  ssr: false,
  loading: () => <AppLoading />,
});

const ToDo = dynamic(() => import('../../../../src/container/toDo/ToDo'), {
  ssr: false,
  loading: () => <AppLoading />,
});

function AppRoutesPage() {
  const params = useParams();
  const slug = params?.slug?.[0] || '';

  let Component = null;

  // Calendar routes are handled by /app/admin/app/calendar/[[...slug]]/page.js
  // Note routes are handled by /app/admin/app/note/[[...slug]]/page.js
  // Task routes are handled by /app/admin/app/task/[[...slug]]/page.js
  // Don't handle calendar, note, or task routes here - let the more specific routes handle them
  if (slug === 'kanban') {
    Component = Kanban;
  } else if (slug === 'to-do') {
    Component = ToDo;
  }

  if (!Component) {
    return <div>Page not found</div>;
  }

  return <Component />;
}

export default withAdminLayoutNext(AppRoutesPage);

