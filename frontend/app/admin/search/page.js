'use client';

import withAdminLayoutNext from '../../../src/layout/withAdminLayoutNext';
import SearchResult from '../../../src/container/pages/SearchResult';

// Direct import - no lazy loading for maximum performance
function SearchPage() {
  return <SearchResult />;
}

export default withAdminLayoutNext(SearchPage);

