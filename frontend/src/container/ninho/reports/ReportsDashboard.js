'use client';

import React, { useState } from 'react';
import { Row, Col, Tabs, Card, Button } from 'antd';
import { PageHeader } from '../../../components/page-headers/page-headers';
import { Main } from '../../styled';
import { DownloadOutlined } from '@ant-design/icons';
import BiCharts from './BiCharts';
import PerformanceMatrix from './PerformanceMatrix';
import Demographics from './Demographics';
import FinancialReport from './FinancialReport';
import SusExport from './SusExport';
import Filters from './Filters';

function ReportsDashboard() {
  const [activeTab, setActiveTab] = useState('clinical');
  const [filters, setFilters] = useState({});

  const handleFilterChange = (newFilters) => {
    setFilters(newFilters);
  };

  const handleExportPdf = () => {
    window.print();
  };

  const tabItems = [
    {
      key: 'clinical',
      label: 'Produção Clínica',
      children: (
        <>
          <BiCharts filters={filters} />
          <PerformanceMatrix filters={filters} />
        </>
      ),
    },
    {
      key: 'social',
      label: 'Socioeconômico',
      children: <Demographics filters={filters} />,
    },
    {
      key: 'financial',
      label: 'Financeiro',
      children: <FinancialReport filters={filters} />,
    },
    {
      key: 'export',
      label: 'Exportação SUS',
      children: <SusExport filters={filters} />,
    },
  ];

  return (
    <>
      <PageHeader
        ghost
        title="Relatórios Gerenciais e Exportação SUS"
        buttons={[
          <div key="1" className="page-header-actions">
            <Button size="small" type="primary" icon={<DownloadOutlined />} onClick={handleExportPdf}>
              Exportar Painel (PDF)
            </Button>
          </div>,
        ]}
      />
      <Main>
        <Card variant="borderless" style={{ marginBottom: 25 }}>
          <Filters onFilterChange={handleFilterChange} />
        </Card>

        <Row gutter={25}>
          <Col xs={24}>
            <Card variant="borderless">
              <Tabs activeKey={activeTab} onChange={setActiveTab} items={tabItems} />
            </Card>
          </Col>
        </Row>
      </Main>
    </>
  );
}

export default ReportsDashboard;
