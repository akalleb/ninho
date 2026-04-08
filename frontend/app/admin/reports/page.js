'use client';

import React from 'react';
import dynamic from 'next/dynamic';
import { Spin } from 'antd';
import withAdminLayoutNext from '../../../src/layout/withAdminLayoutNext';

const ReportsDashboard = dynamic(() => import('../../../src/container/ninho/reports/ReportsDashboard'), {
  ssr: false,
  loading: () => <div className="p-50 text-center"><Spin /></div>,
});

function ReportsPage() {
  return <ReportsDashboard />;
}

export default withAdminLayoutNext(ReportsPage);
