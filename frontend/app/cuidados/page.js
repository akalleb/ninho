'use client';

import React, { useState, useEffect } from 'react';
import { Row, Col, Card, Typography, Spin, Alert, List, Tag, Calendar, Badge, Statistic, Empty } from 'antd';
import { 
  CheckCircleOutlined, 
  ClockCircleOutlined, 
  CalendarOutlined, 
  UserOutlined 
} from '@ant-design/icons';
import { PageHeader } from '../../src/components/page-headers/page-headers';
import { Main } from '../../src/container/styled';
import { Cards } from '../../src/components/cards/frame/cards-frame';
import api from '../../src/config/api/axios';
import { useSelector } from 'react-redux';
import withAdminLayoutNext from '../../src/layout/withAdminLayoutNext';

const { Title, Text } = Typography;

function CareDashboard() {
  const [stats, setStats] = useState({
    todayAppointments: 0,
    completedMonth: 0,
    avgTime: '0 min',
    attendanceRate: 0,
  });
  
  const [queuePreview, setQueuePreview] = useState([]);
  const [recentActivity, setRecentActivity] = useState([]);
  const [loading, setLoading] = useState(true);

  // Auth Info
  const { professional_id: professionalId, name: professionalName } = useSelector(state => state.auth.login || {});

  useEffect(() => {
    if (!professionalId) return;

    const fetchDashboardData = async () => {
      setLoading(true);
      try {
        const results = await Promise.allSettled([
          // 1. Stats Today (Agendados + Em Espera hoje)
          api.get(`/attendances/my-day?professional_id=${professionalId}`),
          
          // 2. Stats Month (Completed) - Mocking calculation or fetch specific endpoint
          // For simplicity, let's fetch finished attendances for this pro
          api.get(`/professionals/${professionalId}/dashboard`),
          
          // 3. Queue & Activity
          api.get(`/attendances/?status=agendado&sort=scheduled_time&limit=3&professional_id=${professionalId}`),
          api.get(`/evolutions/?professional_id=${professionalId}&limit=5&sort=created_at_desc`),
        ]);

        // Process Stats
        const todayApps = results[0].status === 'fulfilled' ? results[0].value.data.length : 0;
        const dashboardData = results[1].status === 'fulfilled' ? results[1].value.data : {};
        
        setStats({
          todayAppointments: todayApps,
          completedMonth: dashboardData.overview?.month || 0,
          avgTime: `${dashboardData.overview?.avg_time_minutes || 0} min`,
          attendanceRate: 95, // Mocked for now
        });

        // Process Queue
        if (results[2].status === 'fulfilled') {
          setQueuePreview(results[2].value.data.slice(0, 3));
        }

        // Process Recent Activity
        if (results[3].status === 'fulfilled') {
          setRecentActivity(results[3].value.data);
        }

      } catch (error) {
        console.error("Erro ao carregar dashboard", error);
      } finally {
        setLoading(false);
      }
    };

    fetchDashboardData();
  }, [professionalId]);

  return (
    <>
      <PageHeader ghost title="Painel de Cuidados" />
      <Main>
        {loading ? (
            <div style={{ display: 'flex', justifyContent: 'center', padding: 50 }}><Spin size="large" /></div>
        ) : (
            <>
                {/* Linha 1: Boas Vindas */}
                <Row gutter={25}>
                    <Col xs={24} style={{ display: 'flex' }}>
                         <Card variant="borderless" style={{ width: '100%', marginBottom: 25, display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
                            <Title level={3}>Olá, {professionalName?.split(' ')[0] || 'Especialista'}!</Title>
                            <Text type="secondary">Você tem <Text strong>{stats.todayAppointments}</Text> atendimentos programados para hoje.</Text>
                            <div style={{ marginTop: 20, display: 'flex', gap: 15, flexWrap: 'wrap' }}>
                                <Tag icon={<ClockCircleOutlined />} color="blue">Tempo Médio: {stats.avgTime}</Tag>
                                <Tag icon={<CheckCircleOutlined />} color="green">Realizados Mês: {stats.completedMonth}</Tag>
                            </div>
                         </Card>
                    </Col>
                </Row>

                {/* Linha 2: Cards de Estatísticas Rápidas */}
                <Row gutter={25}>
                    <Col xs={24} sm={12} md={6}>
                        <Cards headless>
                            <Statistic title="Hoje" value={stats.todayAppointments} prefix={<CalendarOutlined />} valueStyle={{ color: '#5F63F2' }} />
                        </Cards>
                    </Col>
                    <Col xs={24} sm={12} md={6}>
                        <Cards headless>
                            <Statistic title="Mês" value={stats.completedMonth} prefix={<CheckCircleOutlined />} valueStyle={{ color: '#20C997' }} />
                        </Cards>
                    </Col>
                    <Col xs={24} sm={12} md={6}>
                        <Cards headless>
                            <Statistic title="T. Médio" value={stats.avgTime} prefix={<ClockCircleOutlined />} valueStyle={{ color: '#FA8B0C' }} />
                        </Cards>
                    </Col>
                    <Col xs={24} sm={12} md={6}>
                        <Cards headless>
                            <Statistic title="Presença" value={`${stats.attendanceRate}%`} prefix={<UserOutlined />} valueStyle={{ color: '#2C99FF' }} />
                        </Cards>
                    </Col>
                </Row>

                {/* Linha 3: Próximos da Fila e Atividades Recentes */}
                <Row gutter={25} style={{ marginTop: 25 }}>
                    <Col xs={24} lg={12}>
                        <Card title="Próximos Atendimentos" variant="borderless" style={{ height: '100%' }}>
                            {queuePreview?.length > 0 ? (
                                <List
                                    itemLayout="horizontal"
                                    dataSource={queuePreview}
                                    renderItem={item => (
                                        <List.Item>
                                            <List.Item.Meta
                                                avatar={<UserOutlined style={{ fontSize: 24, color: '#5F63F2' }} />}
                                                title={item.child?.name || 'Criança'}
                                                description={
                                                    <div style={{ display: 'flex', gap: 10 }}>
                                                        <Tag>{new Date(item.scheduled_time).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}</Tag>
                                                        <Tag color={item.status === 'em_espera' ? 'orange' : 'blue'}>{item.status.replace('_', ' ')}</Tag>
                                                    </div>
                                                }
                                            />
                                        </List.Item>
                                    )}
                                />
                            ) : <Empty description="Nenhum agendamento próximo" />}
                        </Card>
                    </Col>
                    <Col xs={24} lg={12}>
                        <Card title="Atividades Recentes (Evoluções)" variant="borderless" style={{ height: '100%' }}>
                             {recentActivity?.length > 0 ? (
                                <List
                                    itemLayout="horizontal"
                                    dataSource={recentActivity}
                                    renderItem={item => (
                                        <List.Item>
                                            <List.Item.Meta
                                                title={item.service_type}
                                                description={
                                                    <>
                                                        <Text type="secondary" style={{ fontSize: 12 }}>{new Date(item.date_service).toLocaleDateString()}</Text>
                                                        <br/>
                                                        <Text style={{ fontSize: 13 }} ellipsis>{item.evolution_report}</Text>
                                                    </>
                                                }
                                            />
                                        </List.Item>
                                    )}
                                />
                             ) : <Empty description="Nenhuma atividade recente" />}
                        </Card>
                    </Col>
                </Row>
            </>
        )}
      </Main>
    </>
  );
}

export default withAdminLayoutNext(CareDashboard);
