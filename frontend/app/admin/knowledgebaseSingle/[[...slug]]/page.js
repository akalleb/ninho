'use client';

import { useParams } from 'next/navigation';
import withAdminLayoutNext from '../../../../src/layout/withAdminLayoutNext';

// Direct imports - no lazy loading for maximum performance
import KnowledgeSingle from '../../../../src/container/pages/knowledgeBase/SingleKnowledge';

function KnowledgebaseSingleRoutesPage() {
  // This route handles /admin/knowledgebaseSingle/{id} paths
  // The slug parameter will contain the ID (e.g., ['1'] for /admin/knowledgebaseSingle/1)
  return <KnowledgeSingle />;
}

export default withAdminLayoutNext(KnowledgebaseSingleRoutesPage);

