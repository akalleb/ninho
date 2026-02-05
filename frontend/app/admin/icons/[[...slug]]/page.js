'use client';

import { useParams } from 'next/navigation';
import withAdminLayoutNext from '../../../../src/layout/withAdminLayoutNext';

// Direct imports - no lazy loading for maximum performance
import Feathers from '../../../../src/container/icons/FeatherIcons';
import Fa from '../../../../src/container/icons/FaIcons';
import AntdIcons from '../../../../src/container/icons/AntdIcons';

function IconsRoutesPage() {
  const params = useParams();
  const slug = params?.slug?.[0] || '';

  let Component = null;

  if (slug === 'feathers') {
    Component = Feathers;
  } else if (slug === 'font-awesome') {
    Component = Fa;
  } else if (slug === 'antd') {
    Component = AntdIcons;
  }

  if (!Component) {
    return <div>Page not found</div>;
  }

  // Direct render - no dynamic loading, all components loaded immediately
  return <Component />;
}

export default withAdminLayoutNext(IconsRoutesPage);

