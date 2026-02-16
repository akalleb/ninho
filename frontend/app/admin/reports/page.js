'use client';

import React from 'react';
import dynamic from 'next/dynamic';
import { Spin, Alert } from 'antd';
import withAdminLayoutNext from '../../../src/layout/withAdminLayoutNext';

const ReportsDashboard = dynamic(() => import('../../../src/container/ninho/reports/ReportsDashboard'), {
  ssr: false,
  loading: () => <div className="p-50 text-center"><Spin /></div>,
});

class ReportsErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { error: null };
  }

  static getDerivedStateFromError(error) {
    return { error };
  }

  render() {
    const { error } = this.state;
    if (error) {
      return (
        <div style={{ padding: 24 }}>
          <Alert
            type="error"
            showIcon
            message="Erro ao carregar Relatórios"
            description={
              <pre style={{ margin: 0, whiteSpace: 'pre-wrap' }}>
                {error?.stack || String(error)}
              </pre>
            }
          />
        </div>
      );
    }
    return this.props.children;
  }
}

function ReportsPage() {
  return (
    <ReportsErrorBoundary>
      <ReportsDashboard />
    </ReportsErrorBoundary>
  );
}

export default withAdminLayoutNext(ReportsPage);
