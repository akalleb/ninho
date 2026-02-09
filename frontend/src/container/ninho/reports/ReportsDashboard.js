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

const { TabPane } = Tabs;

function ReportsDashboard() {
  const [activeTab, setActiveTab] = useState('clinical');
  const [filters, setFilters] = useState({});

  const handleFilterChange = (newFilters) => {
    setFilters(newFilters);
  };

  const handleExportPdf = () => {
    window.print();
  };

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
        <Card bordered={false} style={{ marginBottom: 25 }}>
            <Filters onFilterChange={handleFilterChange} />
        </Card>
        
        <Row gutter={25}>
          <Col xs={24}>
            <Card bordered={false}>
              <Tabs activeKey={activeTab} onChange={setActiveTab}>
                <TabPane tab="Produção Clínica" key="clinical">
                   <BiCharts filters={filters} />
                   <PerformanceMatrix filters={filters} />
                </TabPane>
                <TabPane tab="Socioeconômico" key="social">
                   <Demographics filters={filters} />
                </TabPane>
                <TabPane tab="Financeiro" key="financial">
                   <FinancialReport filters={filters} />
                </TabPane>
                <TabPane tab="Exportação SUS" key="export">
                   <SusExport filters={filters} />
                </TabPane>
              </Tabs>
            </Card>
          </Col>
        </Row>
      </Main>
    </>
  );
}

export default ReportsDashboard;
