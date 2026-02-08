'use client';

import React from 'react';
import dynamic from 'next/dynamic';
import { Spin } from 'antd';
import withAdminLayout from '../../../src/layout/withAdminLayout';

const UserDataTable = dynamic(
  () => import('../../../src/container/ninho/users/UserDataTable'),
  {
    loading: () => (
      <div className="spin">
        <span className="ant-spin-dot spin-dot">
          <i className="spin-dot-item" />
          <i className="spin-dot-item" />
          <i className="spin-dot-item" />
          <i className="spin-dot-item" />
        </span>
      </div>
    ),
  },
);

function DataTablePage() {
  return <UserDataTable />;
}

export default withAdminLayout(DataTablePage);
