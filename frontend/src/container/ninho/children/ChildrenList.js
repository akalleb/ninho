'use client';
import React, { useState, useEffect } from 'react';
import { Row, Col, Table, Button, Input, Select, Tag, Modal, App, Skeleton, Statistic, Card } from 'antd';
import FeatherIcon from 'feather-icons-react';
import { useRouter } from 'next/navigation';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
  ArcElement
} from 'chart.js';
import { Bar, Doughnut } from 'react-chartjs-2';
import { PageHeader } from '../../../components/page-headers/page-headers';
import { Main } from '../../styled';
import { Cards } from '../../../components/cards/frame/cards-frame';
import api from '../../../config/api/axios';

ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
  ArcElement
);

const { Option } = Select;

function ChildrenList() {
  const [children, setChildren] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filters, setFilters] = useState({ search: '' });
  const [stats, setStats] = useState({
    total: 0,
    severity: { leve: 0, media: 0, grave: 0, undefined: 0 },
    ageGroups: { '0-3': 0, '4-6': 0, '7-12': 0, '13+': 0 }
  });

  const router = useRouter();
  const { notification } = App.useApp();

  const calculateAge = (birthDate) => {
    if (!birthDate) return null;
    const diff = Date.now() - new Date(birthDate).getTime();
    return Math.floor(diff / (1000 * 60 * 60 * 24 * 365.25));
  };

  const processStats = (data) => {
    const newStats = {
      total: data.length,
      severity: { leve: 0, media: 0, grave: 0, undefined: 0 },
      ageGroups: { '0-3': 0, '4-6': 0, '7-12': 0, '13+': 0 }
    };

    data.forEach(child => {
      // Severity
      const sev = child.severity_level || 'undefined';
      if (newStats.severity[sev] !== undefined) {
        newStats.severity[sev]++;
      } else {
        newStats.severity.undefined++;
      }

      // Age
      const age = calculateAge(child.birth_date);
      if (age !== null) {
        if (age <= 3) newStats.ageGroups['0-3']++;
        else if (age <= 6) newStats.ageGroups['4-6']++;
        else if (age <= 12) newStats.ageGroups['7-12']++;
        else newStats.ageGroups['13+']++;
      }
    });

    setStats(newStats);
  };

  const fetchChildren = async (params = filters) => {
    setLoading(true);
    try {
      const { data } = await api.get('/children/', { params });
      setChildren(data);
      processStats(data);
    } catch (error) {
      console.log('Erro ao carregar lista de crianças', {
        message: error.message,
        responseData: error.response?.data,
        status: error.response?.status,
        headers: error.response?.headers,
        config: error.config,
      });
      notification.error({
        message: 'Erro ao carregar lista de crianças',
        description: error?.response?.data?.detail || 'Tente novamente mais tarde.',
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchChildren(filters);
  }, []);

  const severityChartData = {
    labels: ['Leve', 'Moderado', 'Grave'],
    datasets: [
      {
        data: [stats.severity.leve, stats.severity.media, stats.severity.grave],
        backgroundColor: [
          'rgba(75, 192, 192, 0.6)',
          'rgba(255, 206, 86, 0.6)',
          'rgba(255, 99, 132, 0.6)',
        ],
        borderWidth: 1,
      },
    ],
  };

  const ageChartData = {
    labels: ['0-3 anos', '4-6 anos', '7-12 anos', '13+ anos'],
    datasets: [
      {
        label: 'Crianças por Faixa Etária',
        data: [
          stats.ageGroups['0-3'], 
          stats.ageGroups['4-6'], 
          stats.ageGroups['7-12'], 
          stats.ageGroups['13+']
        ],
        backgroundColor: 'rgba(54, 162, 235, 0.6)',
      },
    ],
  };

  const columns = [
    {
      title: 'Nome',
      dataIndex: 'name',
      key: 'name',
      render: (text, record) => (
          <div style={{ cursor: 'pointer', color: '#1890ff' }} onClick={() => router.push(`/admin/children/${record.id}/dashboard`)}>
              <span style={{ fontWeight: 600 }}>{text}</span>
              <br />
              <small style={{ color: '#888' }}>ID: {record.id}</small>
          </div>
      )
    },
    {
        title: 'Diagnóstico',
        dataIndex: 'diagnosis',
        key: 'diagnosis',
        render: (text) => text || <Tag>Não informado</Tag>
    },
    {
        title: 'Nível',
        dataIndex: 'severity_level',
        key: 'severity_level',
        render: (text) => {
            const colors = { leve: 'green', media: 'orange', grave: 'red' };
            const labels = { leve: 'LEVE', media: 'MÉDIO', grave: 'GRAVE' };
            return text ? <Tag color={colors[text] || 'default'}>{labels[text] || text.toUpperCase()}</Tag> : <Tag>Não informado</Tag>;
        }
    },
    {
        title: 'Responsável',
        dataIndex: 'guardian_name',
        key: 'guardian_name'
    },
    {
      title: 'Ações',
      key: 'actions',
      render: (_, record) => (
        <div style={{ display: 'flex', gap: 10 }}>
           <Button 
            size="small" 
            type="primary"
            title="Prontuário / Dashboard"
            icon={<FeatherIcon icon="activity" size={14} />} 
            onClick={() => router.push(`/admin/children/${record.id}/dashboard`)}
          />
          <Button 
            size="small" 
            type="primary" 
            icon={<FeatherIcon icon="edit" size={14} />} 
            onClick={() => router.push(`/admin/children/edit?id=${record.id}`)}
          />
        </div>
      ),
    },
  ];

  return (
    <>
      <PageHeader
        ghost
        title="Prontuário das Crianças"
        buttons={[
          <Button key="1" type="primary" onClick={() => router.push('/admin/children/add')}>
            <FeatherIcon icon="plus" size={14} /> Novo Cadastro
          </Button>,
        ]}
      />
      <Main>
        <Row gutter={25} style={{ marginBottom: 25 }}>
          <Col md={6} xs={24}>
            <Cards headless>
              <div style={{ padding: '20px', textAlign: 'center' }}>
                <Statistic title="Total de Crianças" value={stats.total} valueStyle={{ fontSize: 36, fontWeight: 'bold', color: '#5F63F2' }} />
              </div>
            </Cards>
          </Col>
          <Col md={6} xs={24}>
            <Cards headless>
               <div style={{ padding: '20px', textAlign: 'center' }}>
                  <Statistic title="Casos Graves" value={stats.severity.grave} valueStyle={{ fontSize: 36, fontWeight: 'bold', color: '#cf1322' }} />
               </div>
            </Cards>
          </Col>
          <Col md={6} xs={24}>
            <Cards headless title="Distribuição por Nível">
              <div style={{ height: 150, display: 'flex', justifyContent: 'center' }}>
                <Doughnut 
                  data={severityChartData} 
                  options={{ maintainAspectRatio: false, plugins: { legend: { display: false } } }} 
                />
              </div>
            </Cards>
          </Col>
          <Col md={6} xs={24}>
            <Cards headless title="Faixa Etária">
              <div style={{ height: 150 }}>
                <Bar 
                  data={ageChartData} 
                  options={{ 
                    maintainAspectRatio: false, 
                    indexAxis: 'y',
                    plugins: { legend: { display: false } },
                    scales: { x: { display: false }, y: { grid: { display: false } } }
                  }} 
                />
              </div>
            </Cards>
          </Col>
        </Row>

        <Cards>
            <Row gutter={25} style={{ marginBottom: 25 }}>
                <Col xs={24} md={12}>
                    <Input 
                        placeholder="Buscar por nome..." 
                        prefix={<FeatherIcon icon="search" size={14} />}
                        onChange={(e) => {
                          const value = e.target.value;
                          const newFilters = { ...filters, search: value };
                          setFilters(newFilters);
                          fetchChildren(newFilters);
                        }}
                    />
                </Col>
            </Row>
            
            {loading ? (
                <Skeleton active />
            ) : (
                <Table 
                    dataSource={children} 
                    columns={columns} 
                    rowKey="id" 
                    pagination={{ pageSize: 10, showSizeChanger: true }}
                />
            )}
        </Cards>
      </Main>
    </>
  );
}

export default ChildrenList;
