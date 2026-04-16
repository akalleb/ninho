'use client';

import React, { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';
import { useSelector } from 'react-redux';
import dynamic from 'next/dynamic';
import { Spin, Row, Col, Card, Button, Statistic } from 'antd';
import withAdminLayoutNext from '../../../../src/layout/withAdminLayoutNext';
import { Main } from '../../../../src/container/styled';
import FeatherIcon from 'feather-icons-react';
import api from '../../../../src/config/api/axios';
import dayjs from 'dayjs';

const Chart = dynamic(() => import('react-apexcharts'), { ssr: false });

const DashboardLoading = () => (
  <div className="p-50 text-center d-flex align-items-center justify-content-center h-100vh min-h-600">
    <Spin />
  </div>
);

const DashboardOverview = dynamic(() => import('../../../../src/container/dashboard/DashboardOverview'), { 
  ssr: false,
  loading: () => <DashboardLoading />,
});

const UserDataTable = dynamic(() => import('../../../../src/container/ninho/users/UserDataTable'), {
  ssr: false,
  loading: () => <DashboardLoading />,
});

const AddUser = dynamic(() => import('../../../../src/container/ninho/users/AddUser'), {
  ssr: false,
  loading: () => <DashboardLoading />,
});

function OperationalDashboard() {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchStats();
  }, []);

  const fetchStats = async () => {
    try {
      const response = await api.get('/admin/dashboard/stats');
      setStats(response.data);
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) return <DashboardLoading />;

  // Chart Configs
  const attendanceChartOptions = {
    chart: { id: 'attendances-month', toolbar: { show: false } },
    xaxis: { 
        categories: stats?.charts?.attendances_month?.map(d => dayjs(d.month, 'YYYY-MM').format('MMM/YY')) || [],
        labels: { style: { colors: '#8C90A4', fontSize: '12px' } }
    },
    colors: ['#5F63F2'],
    dataLabels: { enabled: false },
    grid: { borderColor: '#F1F2F6' },
    tooltip: { theme: 'dark' }
  };

  const attendanceSeries = [{
    name: 'Atendimentos',
    data: stats?.charts?.attendances_month?.map(d => d.count) || []
  }];

  const severityChartOptions = {
    labels: stats?.charts?.children_severity?.map(d => d.label) || [],
    colors: ['#20C997', '#FA8B0C', '#FF4D4F', '#5F63F2'],
    legend: { position: 'bottom' },
    dataLabels: { enabled: true }
  };
  const severitySeries = stats?.charts?.children_severity?.map(d => d.value) || [];

  const vulnerabilityChartOptions = {
    labels: stats?.charts?.families_vulnerability?.map(d => d.label) || [],
    colors: ['#5F63F2', '#FF69A5', '#FA8B0C', '#20C997'],
    legend: { position: 'bottom' },
    dataLabels: { enabled: true }
  };
  const vulnerabilitySeries = stats?.charts?.families_vulnerability?.map(d => d.value) || [];

  return (
    <Main>
      {/* Stats Cards */}
      <Row gutter={25} style={{ marginBottom: 25 }}>
        <Col xs={24} md={6}>
            <div className="profile-overview-card">
                <Card variant="borderless" bodyStyle={{ padding: '20px 24px 20px 24px' }}>
                    <Statistic 
                        title="Total de Famílias" 
                        value={stats?.counts?.families || 0} 
                        prefix={<FeatherIcon icon="home" size={20} />} 
                        valueStyle={{ color: '#5F63F2', fontWeight: 600 }}
                    />
                </Card>
            </div>
        </Col>
        <Col xs={24} md={6}>
            <div className="profile-overview-card">
                <Card variant="borderless" bodyStyle={{ padding: '20px 24px 20px 24px' }}>
                    <Statistic 
                        title="Crianças Cadastradas" 
                        value={stats?.counts?.children || 0} 
                        prefix={<FeatherIcon icon="users" size={20} />} 
                        valueStyle={{ color: '#20C997', fontWeight: 600 }}
                    />
                </Card>
            </div>
        </Col>
        <Col xs={24} md={6}>
            <div className="profile-overview-card">
                <Card variant="borderless" bodyStyle={{ padding: '20px 24px 20px 24px' }}>
                    <Statistic 
                        title="Crianças Atendidas" 
                        value={stats?.counts?.attended_children || 0} 
                        prefix={<FeatherIcon icon="user-check" size={20} />} 
                        valueStyle={{ color: '#FA8B0C', fontWeight: 600 }}
                    />
                </Card>
            </div>
        </Col>
        <Col xs={24} md={6}>
            <div className="profile-overview-card">
                <Card variant="borderless" bodyStyle={{ padding: '20px 24px 20px 24px' }}>
                    <Statistic 
                        title="Total Atendimentos" 
                        value={stats?.counts?.total_attendances || 0} 
                        prefix={<FeatherIcon icon="activity" size={20} />} 
                        valueStyle={{ color: '#FF4D4F', fontWeight: 600 }}
                    />
                </Card>
            </div>
        </Col>
      </Row>

      {/* Charts Row */}
      <Row gutter={25} style={{ marginBottom: 25 }}>
        <Col xs={24} lg={12}>
            <Card title="Evolução de Atendimentos (6 Meses)" variant="borderless">
                <Chart options={attendanceChartOptions} series={attendanceSeries} type="bar" height={300} />
            </Card>
        </Col>
        <Col xs={24} lg={6}>
            <Card title="Crianças por Nível de Suporte" variant="borderless">
                <Chart options={severityChartOptions} series={severitySeries} type="donut" height={300} />
            </Card>
        </Col>
        <Col xs={24} lg={6}>
            <Card title="Famílias por Vulnerabilidade" variant="borderless">
                <Chart options={vulnerabilityChartOptions} series={vulnerabilitySeries} type="pie" height={300} />
            </Card>
        </Col>
      </Row>

      <Row gutter={25} style={{ marginBottom: 25 }}>
        <Col xs={24} md={12}>
          <Card
            variant="borderless"
            title="Atendimento e crianças"
            extra={null}
          >
            <p style={{ marginBottom: 12 }}>
              Acesso rápido às rotinas ligadas ao atendimento das crianças.
            </p>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 12 }}>
              <Button
                type="primary"
                icon={<FeatherIcon icon="users" size={16} />}
                href="/admin/children"
              >
                Prontuário das Crianças
              </Button>
              <Button
                icon={<FeatherIcon icon="list" size={16} />}
                href="/admin/queue"
              >
                Fila de Atendimentos
              </Button>
            </div>
          </Card>
        </Col>
        <Col xs={24} md={12}>
          <Card
            variant="borderless"
            title="Comunicação e equipe"
            extra={null}
          >
            <p style={{ marginBottom: 12 }}>
              Funcionalidades ligadas à equipe e notificações internas.
            </p>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 12 }}>
              <Button
                icon={<FeatherIcon icon="bell" size={16} />}
                href="/admin/notifications"
              >
                Notificações
              </Button>
              <Button
                icon={<FeatherIcon icon="user-check" size={16} />}
                href="/admin/collaborators"
              >
                Colaboradores
              </Button>
            </div>
          </Card>
        </Col>
      </Row>
    </Main>
  );
}

function DashboardRoutesPage() {
  const params = useParams();
  const slug = params?.slug?.[0] || '';
  const subSlug = params?.slug?.[1] || '';
  const authUser = useSelector((state) =>
    typeof state.auth.login === 'object' && state.auth.login ? state.auth.login : null,
  );

  if (slug === 'users') {
    if (subSlug === 'dataTable' || subSlug === 'collaborators') {
      return <UserDataTable />;
    }
    if (subSlug === 'add-user') {
      return <AddUser />;
    }
    return <UserDataTable />;
  }

  if (authUser && authUser.role === 'operational') {
    return <OperationalDashboard />;
  }

  return <DashboardOverview />;
}

export default withAdminLayoutNext(DashboardRoutesPage);
