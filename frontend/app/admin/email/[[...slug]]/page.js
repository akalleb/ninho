'use client';

import dynamic from 'next/dynamic';
import { Spin } from 'antd';
import withAdminLayoutNext from '../../../../src/layout/withAdminLayoutNext';

// Loading component to maintain layout structure
const EmailLoading = () => (
  <div className="p-50 text-center">
    <Spin size="large" />
  </div>
);

// Disable SSR for Email page due to react-rte dependency in MailComposer
const Inbox = dynamic(() => import('../../../../src/container/email/Email'), {
  ssr: false,
  loading: () => <EmailLoading />,
});

function EmailRoutesPage() {
  return <Inbox />;
}

export default withAdminLayoutNext(EmailRoutesPage);

