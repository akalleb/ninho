'use client';

import { useParams } from 'next/navigation';
import withAdminLayout from '../../../../src/layout/withAdminLayout';

// Direct imports - no lazy loading for maximum performance
import NotFound from '../../../../src/container/pages/404';
import Support from '../../../../src/container/pages/support';
import Maintenance from '../../../../src/container/pages/Maintenance';
import Pricing from '../../../../src/container/pages/PricingTable';
import Faq from '../../../../src/container/pages/Faq';
import Search from '../../../../src/container/pages/SearchResult';
import ComingSoon from '../../../../src/container/pages/ComingSoon';
import BlankPage from '../../../../src/container/pages/BlankPage';
import Wizards from '../../../../src/container/pages/wizards/Wizards';
import Settings from '../../../../src/container/profile/settings/Settings';
import KnowledgeBase from '../../../../src/container/pages/knowledgeBase/Index';
import AllArticle from '../../../../src/container/pages/knowledgeBase/AllArticle';
import KnowledgeSingle from '../../../../src/container/pages/knowledgeBase/SingleKnowledge';
import ChangeLog from '../../../../src/container/pages/ChangeLog';

function PagesRoutesPage() {
  const params = useParams();
  const slug = params?.slug?.[0] || '';

  let Component = null;

  if (slug === '404') {
    Component = NotFound;
  } else if (slug === 'support') {
    Component = Support;
  } else if (slug === 'maintenance') {
    Component = Maintenance;
  } else if (slug === 'Pricing' || slug === 'pricing') {
    Component = Pricing;
  } else if (slug === 'faq') {
    Component = Faq;
  } else if (slug === 'search') {
    Component = Search;
  } else if (slug === 'starter') {
    Component = BlankPage;
  } else if (slug === 'comingSoon') {
    Component = ComingSoon;
  } else if (slug === 'changelog') {
    Component = ChangeLog;
  } else if (slug === 'all-articles') {
    Component = AllArticle;
  } else if (slug?.startsWith('knowledgebaseSingle')) {
    Component = KnowledgeSingle;
  } else if (slug === 'wizards' || slug?.startsWith('wizards')) {
    Component = Wizards;
  } else if (slug === 'settings' || slug?.startsWith('settings')) {
    Component = Settings;
  } else if (slug === 'knowledgeBase' || slug?.startsWith('knowledgeBase')) {
    Component = KnowledgeBase;
  }

  if (!Component) {
    return <div>Page not found</div>;
  }

  // Direct render - no dynamic loading, all components loaded immediately
  return <Component />;
}

export default withAdminLayout(PagesRoutesPage);

