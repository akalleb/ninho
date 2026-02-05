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

function ProfessionalDashboard() {
    const { id: professionalId, name } = useSelector(state => state.auth.login || {});
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

    if (loading) return <Main><Spin /></Main>;
    if (!data) return <Main>Erro ao carregar dados.</Main>;

    return (
        <>
            <PageHeader
                ghost
                title={`Olá, ${name}`}
                subTitle="Visão Geral de Produção"
            />
            <Main>
                <Row gutter={25}>
                    <Col xs={24} md={6}>
                        <Card bordered={false}>
                            <Statistic title="Atendimentos Hoje" value={data.overview.today} prefix={<FeatherIcon icon="calendar" />} />
                        </Card>
                    </Col>
                    <Col xs={24} md={6}>
                        <Card bordered={false}>
                            <Statistic title="Atendimentos Mês" value={data.overview.month} prefix={<FeatherIcon icon="bar-chart-2" />} />
                        </Card>
                    </Col>
                    <Col xs={24} md={6}>
                        <Card bordered={false}>
                            <Statistic title="Atendimentos Ano" value={data.overview.year} prefix={<FeatherIcon icon="trending-up" />} />
                        </Card>
                    </Col>
                    <Col xs={24} md={6}>
                        <Card bordered={false}>
                            <Statistic title="Tempo Médio (min)" value={data.overview.avg_time_minutes} prefix={<FeatherIcon icon="clock" />} />
                        </Card>
                    </Col>
                </Row>
                
                <Row gutter={25} style={{ marginTop: 25 }}>
                    <Col xs={24} lg={12}>
                        <Card title="Linha do Tempo de Atividades" bordered={false}>
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
                     <Col xs={24} lg={12}>
                        <Card title="Métricas de Desempenho" bordered={false}>
                             <div style={{ textAlign: 'center', padding: 20, color: '#999' }}>
                                 Gráficos em desenvolvimento...
                             </div>
                        </Card>
                    </Col>
                </Row>
            </Main>
        </>
    );
}

export default withAdminLayoutNext(ProfessionalDashboard);
