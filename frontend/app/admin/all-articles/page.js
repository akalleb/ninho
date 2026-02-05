'use client';

import withAdminLayoutNext from '../../../src/layout/withAdminLayoutNext';
import AllArticle from '../../../src/container/pages/knowledgeBase/AllArticle';

// Direct import - no lazy loading for maximum performance
function AllArticlesPage() {
  return <AllArticle />;
}

export default withAdminLayoutNext(AllArticlesPage);

