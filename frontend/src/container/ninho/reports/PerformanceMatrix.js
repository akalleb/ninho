import React, { useState, useEffect } from 'react';
import { Row, Col, Card, Statistic, Spin } from 'antd';
import { CheckCircleOutlined, CloseCircleOutlined, ClockCircleOutlined, CalendarOutlined } from '@ant-design/icons';
import api from '../../../config/api/axios';

function PerformanceMatrix({ filters }) {
    const [stats, setStats] = useState({
        scheduled: 0,
        finished: 0,
        no_show: 0,
        waiting: 0
    });
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        setLoading(true);
        const params = {};
        if (filters.start_date) params.start_date = filters.start_date;
        if (filters.end_date) params.end_date = filters.end_date;

        api.get('/reports/bi/performance', { params })
            .then(res => setStats(res.data))
            .catch(err => console.error("Erro ao carregar performance", err))
            .finally(() => setLoading(false));
    }, [filters]);

    return (
        <Row gutter={25}>
            <Col xs={24} md={6}>
                <Card bordered={false}>
                    {loading ? <Spin /> : (
                        <Statistic 
                            title="Agendados" 
                            value={stats.scheduled} 
                            prefix={<CalendarOutlined />} 
                            valueStyle={{ color: '#5F63F2' }} 
                        />
                    )}
                </Card>
            </Col>
            <Col xs={24} md={6}>
                 <Card bordered={false}>
                    {loading ? <Spin /> : (
                        <Statistic 
                            title="Finalizados" 
                            value={stats.finished} 
                            valueStyle={{ color: '#20C997' }} 
                            prefix={<CheckCircleOutlined />}
                        />
                    )}
                </Card>
            </Col>
             <Col xs={24} md={6}>
                 <Card bordered={false}>
                    {loading ? <Spin /> : (
                        <Statistic 
                            title="Faltas (No-Show)" 
                            value={stats.no_show} 
                            valueStyle={{ color: '#FF4D4F' }} 
                            prefix={<CloseCircleOutlined />} 
                        />
                    )}
                </Card>
            </Col>
             <Col xs={24} md={6}>
                 <Card bordered={false}>
                    {loading ? <Spin /> : (
                        <Statistic 
                            title="Em Espera" 
                            value={stats.waiting} 
                            valueStyle={{ color: '#FA8B0C' }} 
                            prefix={<ClockCircleOutlined />}
                        />
                    )}
                </Card>
            </Col>
        </Row>
    )
}

export default PerformanceMatrix;
