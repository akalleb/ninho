'use client';

import { useEffect, useState } from 'react';
import { useRouter, usePathname, useParams } from 'next/navigation';
import dynamic from 'next/dynamic';
import { getBasePath } from '../../../src/utility/getBasePath';
import withAdminLayoutNext from '../../../src/layout/withAdminLayoutNext';

// Direct import - no lazy loading for maximum performance
import NotFound from '../../../src/container/pages/404';
import { Spin } from 'antd';

const DashboardLoading = () => (
  <div className="p-50 text-center d-flex align-items-center justify-content-center h-100vh min-h-600">
    <Spin />
  </div>
);

const UserDataTable = dynamic(
  () => import('../../../src/container/ninho/users/UserDataTable'),
  {
    ssr: false,
    loading: () => <DashboardLoading />,
  },
);

const AddUser = dynamic(
  () => import('../../../src/container/ninho/users/AddUser'),
  {
    ssr: false,
    loading: () => <DashboardLoading />,
  },
);

/**
 * Catch-all route for /admin that handles:
 * 1. Base /admin route - redirects to /admin/dashboard
 * 2. Dashboard sub-routes (business, eco, performance, crm, sales) - redirects to /admin/dashboard/{route}
 * Other routes like /admin/pages, /admin/ecommerce should be handled by their specific route handlers.
 * If no match, shows 404 page.
 */
function AdminCatchAll() {
  const router = useRouter();
  const pathname = usePathname();
  const params = useParams();
  const basePath = getBasePath();
  const [shouldShowNotFound, setShouldShowNotFound] = useState(false);
  const [hasRedirected, setHasRedirected] = useState(false);

  useEffect(() => {
    const slugParam = params?.slug;
    const slugArray = Array.isArray(slugParam) ? slugParam : [];

    if (slugArray[0] === 'users') {
      return;
    }
    
    // Get clean path without basePath
    const cleanPath = basePath && pathname.startsWith(basePath) 
      ? pathname.replace(basePath, '') 
      : pathname;
    const adminPath = cleanPath.replace('/admin', '') || '/';
    
    // Dashboard sub-routes that should redirect to /admin/dashboard/{route}
    const dashboardSubRoutes = ['business', 'eco', 'performance', 'crm', 'sales', 'social'];
    
    // Check if we're at a dashboard sub-route (e.g., /admin/business)
    if (slugArray.length === 1 && dashboardSubRoutes.includes(slugArray[0])) {
      router.replace(`/admin/dashboard/${slugArray[0]}`);
      setHasRedirected(true);
      return;
    }
    
    // Handle base /admin route (no slug or empty slug)
    if (!slugParam || (Array.isArray(slugParam) && slugParam.length === 0)) {
      if (adminPath === '/' || adminPath === '') {
        router.replace('/admin/dashboard');
        setHasRedirected(true);
        return;
      }
    }
    
    // If no redirect conditions matched, show 404 after a brief delay
    // This allows other route handlers to potentially match first
    const timer = setTimeout(() => {
      if (!hasRedirected) {
        setShouldShowNotFound(true);
      }
    }, 150);
    
    return () => clearTimeout(timer);
  }, [pathname, router, basePath, params, hasRedirected]);

  const slugParam = params?.slug;
  const slugArray = Array.isArray(slugParam) ? slugParam : [];

  if (slugArray[0] === 'users') {
    const subSlug = slugArray[1] || 'dataTable';

    if (subSlug === 'add-user') {
      return <AddUser />;
    }

    return <UserDataTable />;
  }

  if (shouldShowNotFound) {
    return <NotFound />;
  }

  // Return loading/redirecting state while checking
  return (
    <div className="d-flex align-items-center justify-content-center h-100vh bg-gray-light min-h-600"><Spin /></div>
  );
}

export default withAdminLayoutNext(AdminCatchAll);
