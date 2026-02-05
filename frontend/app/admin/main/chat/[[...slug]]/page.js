'use client';

import withAdminLayout from '../../../../../src/layout/withAdminLayout';
import Chat from '../../../../../src/container/chat/ChatApp';

// Direct import - no lazy loading for maximum performance
function ChatRoutesPage() {
  return <Chat />;
}

export default withAdminLayout(ChatRoutesPage);
