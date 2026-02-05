'use client';

import { useParams } from 'next/navigation';
import withAdminLayoutNext from '../../../../src/layout/withAdminLayoutNext';

// Direct imports - no lazy loading for maximum performance
import KnowledgeBase from '../../../../src/container/pages/knowledgeBase/Index';
import AllArticle from '../../../../src/container/pages/knowledgeBase/AllArticle';
import KnowledgeSingle from '../../../../src/container/pages/knowledgeBase/SingleKnowledge';

function KnowledgebaseRoutesPage() {
  const params = useParams();
  const slug = params?.slug?.[0] || '';

  let Component = KnowledgeBase;

  if (slug === 'all-articles') {
    Component = AllArticle;
  } else if (slug?.startsWith('knowledgebaseSingle')) {
    Component = KnowledgeSingle;
  }

  // Direct render - no dynamic loading, all components loaded immediately
  return <Component />;
}

export default withAdminLayoutNext(KnowledgebaseRoutesPage);

