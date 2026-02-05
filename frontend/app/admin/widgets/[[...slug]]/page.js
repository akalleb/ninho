'use client';

import { useParams } from 'next/navigation';
import withAdminLayoutNext from '../../../../src/layout/withAdminLayoutNext';

// Direct imports - no lazy loading for maximum performance
import Charts from '../../../../src/container/widgets/Charts';
import Carts from '../../../../src/container/widgets/Cards';
import Mixed from '../../../../src/container/widgets/Mix';

function WidgetsRoutesPage() {
  const params = useParams();
  const slug = params?.slug?.[0] || '';

  let Component = null;

  if (slug === 'chart') {
    Component = Charts;
  } else if (slug === 'card') {
    Component = Carts;
  } else if (slug === 'mixed') {
    Component = Mixed;
  }

  if (!Component) {
    return <div>Page not found</div>;
  }

  // Direct render - no dynamic loading, all components loaded immediately
  return <Component />;
}

export default withAdminLayoutNext(WidgetsRoutesPage);

