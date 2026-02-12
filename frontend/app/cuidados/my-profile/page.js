'use client';

import React, { useState, useEffect } from 'react';
import { Row, Col, Card, Statistic, Timeline, Spin } from 'antd';
import FeatherIcon from 'feather-icons-react';
import { useSelector } from 'react-redux';
import { PageHeader } from '../../../src/components/page-headers/page-headers';
import { Main } from '../../../src/container/styled';
import api from '../../../src/config/api/axios';
import withAdminLayoutNext from '../../../src/layout/withAdminLayoutNext';
import dayjs from 'dayjs';
import dynamic from 'next/dynamic';
import UserBio from '../../../src/container/profile/myProfile/overview/UserBio';
import UserCards from '../../../src/container/pages/overview/UserCard';
import { SettingWrapper } from '../../../src/container/profile/myProfile/overview/style';
import CoverSection from '../../../src/container/profile/overview/CoverSection';

const Chart = dynamic(() => import('react-apexcharts'), { ssr: false });

function ProfessionalDashboard() {
    const { professional_id: professionalId, name, role, email, avatar_url, cover_url } = useSelector(state => state.auth.login || {});
    const [data, setData] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        if (professionalId) {
            fetchDashboard();
        }
    }, [professionalId]);

    const fetchDashboard = async () => {
        try {
            const response = await api.get(`/professional/${professionalId}/dashboard`);
            setData(response.data);
        } catch (error) {
            console.error(error);
        } finally {
            setLoading(false);
        }
    };

    if (loading) return (
        <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh' }}>
            <Spin size="large" />
        </div>
    );
    
    if (!data) return <Main>Erro ao carregar dados.</Main>;

    const user = {
        name: name,
        designation: role === 'admin' ? 'Administrador' : 'Profissional de Saúde',
        img: avatar_url || 'static/img/users/1.png',
        cover: cover_url || 'static/img/profile/cover-img.png'
    };

    // Prepare Chart Data
    const monthlyStats = data.charts?.monthly || [];
    const statusStats = data.charts?.status || [];

    const barChartOptions = {
        chart: {
            id: 'monthly-performance',
            toolbar: { show: false }
        },
        plotOptions: {
            bar: {
                borderRadius: 4,
                horizontal: false,
                columnWidth: '55%',
            }
        },
        dataLabels: { enabled: false },
        xaxis: {
            categories: monthlyStats.map(item => dayjs(item.month, 'YYYY-MM').format('MMM/YY')),
            labels: { style: { colors: '#8C90A4', fontSize: '12px' } }
        },
        colors: ['#5F63F2'],
        grid: { borderColor: '#F1F2F6' }
    };

    const barChartSeries = [{
        name: 'Atendimentos',
        data: monthlyStats.map(item => item.count)
    }];

    const pieChartOptions = {
        labels: statusStats.map(item => item.status === 'finalizado' ? 'Finalizado' : item.status === 'agendado' ? 'Agendado' : item.status === 'em_espera' ? 'Em espera' : item.status),
        colors: ['#20C997', '#5F63F2', '#FA8B0C', '#FF4D4F'],
        legend: { position: 'bottom' },
        dataLabels: { enabled: true }
    };

    const pieChartSeries = statusStats.map(item => item.count);

    return (
        <>
            <PageHeader
                ghost
                title="Meu Perfil"
            />
            <Main>
                <Row gutter={25}>
                    <Col xxl={6} lg={8} md={10} xs={24}>
                        <UserCards user={user} hideStats={true} />
                        <UserBio />
                    </Col>
                    <Col xxl={18} lg={16} md={14} xs={24}>
                        <SettingWrapper>
                            <Row gutter={25}>
                                <Col xs={24} md={8}>
                                    <div className="profile-overview-card">
                                        <Card variant="borderless">
                                            <Statistic 
                                                title="Atendimentos Hoje" 
                                                value={data.overview.today} 
                                                prefix={<FeatherIcon icon="calendar" size={20} />} 
                                                valueStyle={{ color: '#5F63F2' }}
                                            />
                                        </Card>
                                    </div>
                                </Col>
                                <Col xs={24} md={8}>
                                    <div className="profile-overview-card">
                                        <Card variant="borderless">
                                            <Statistic 
                                                title="Atendimentos Mês" 
                                                value={data.overview.month} 
                                                prefix={<FeatherIcon icon="bar-chart-2" size={20} />} 
                                                valueStyle={{ color: '#20C997' }}
                                            />
                                        </Card>
                                    </div>
                                </Col>
                                <Col xs={24} md={8}>
                                    <div className="profile-overview-card">
                                        <Card variant="borderless">
                                            <Statistic 
                                                title="Tempo Médio (min)" 
                                                value={data.overview.avg_time_minutes} 
                                                prefix={<FeatherIcon icon="clock" size={20} />} 
                                                valueStyle={{ color: '#FA8B0C' }}
                                            />
                                        </Card>
                                    </div>
                                </Col>
                            </Row>

                            <Row gutter={25} style={{ marginTop: 25 }}>
                                <Col xs={24} lg={24}>
                                    <Card title="Desempenho Mensal (Últimos 6 meses)" variant="borderless">
                                        {monthlyStats.length > 0 ? (
                                            <Chart 
                                                options={barChartOptions} 
                                                series={barChartSeries} 
                                                type="bar" 
                                                height={300} 
                                            />
                                        ) : (
                                            <div style={{ textAlign: 'center', padding: 20, color: '#999' }}>Sem dados suficientes</div>
                                        )}
                                    </Card>
                                </Col>
                            </Row>

                            <Row gutter={25} style={{ marginTop: 25 }}>
                                <Col xs={24}>
                                    <Card title="Linha do Tempo de Atividades Recentes" variant="borderless">
                                        <Timeline 
                                            items={data.timeline.map(item => ({
                                                color: 'green',
                                                children: (
                                                    <>
                                                        <p><strong>{item.child_name}</strong> - {dayjs(item.date).format('DD/MM/YYYY HH:mm')}</p>
                                                        <p>Duração: {item.duration}</p>
                                                        <p style={{ color: '#888' }}>{item.notes}</p>
                                                    </>
                                                )
                                            }))}
                                        />
                                    </Card>
                                </Col>
                            </Row>
                        </SettingWrapper>
                    </Col>
                </Row>
            </Main>
        </>
    );
}

export default withAdminLayoutNext(ProfessionalDashboard);
