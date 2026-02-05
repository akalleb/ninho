'use client';

import dynamic from 'next/dynamic';
import { Spin } from 'antd';
import withAdminLayoutNext from '../../../src/layout/withAdminLayoutNext';

// Loading component to maintain layout structure
const EditorLoading = () => (
  <div className="p-50 text-center">
    <Spin />
  </div>
);

// Disable SSR for Editor page due to react-rte dependency
const Editors = dynamic(() => import('../../../src/container/pages/Editor'), {
  ssr: false,
  loading: () => <EditorLoading />,
});

function EditorPage() {
  return <Editors />;
}

export default withAdminLayoutNext(EditorPage);

