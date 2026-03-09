'use client';

import withAdminLayout from '../../../../../src/layout/withAdminLayout';
import Chat from '../../../../../src/container/chat/ChatApp';

function ChatRoutesPage() {
  return <Chat />;
}

export default withAdminLayout(ChatRoutesPage);
