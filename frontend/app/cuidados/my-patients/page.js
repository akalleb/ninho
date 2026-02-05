'use client';
import React, { useState, useEffect } from 'react';
import { Row, Col, Card, List, Button, Tag, message } from 'antd';
import FeatherIcon from 'feather-icons-react';
import { useSelector } from 'react-redux';
import { useRouter } from 'next/navigation';
import { PageHeader } from '../../../src/components/page-headers/page-headers';
import { Main } from '../../../src/container/styled';
import api from '../../../src/config/api/axios';
import withAdminLayoutNext from '../../../src/layout/withAdminLayoutNext';
import dayjs from 'dayjs';

function MyPatientsPage() {
    const { id: professionalId } = useSelector(state => state.auth.login || {});
    const [attendances, setAttendances] = useState([]);
    const [loading, setLoading] = useState(true);
    const router = useRouter();

    const fetchDailyList = async () => {
        try {
            const response = await api.get('/attendances/my-day', {
                params: { professional_id: professionalId }
            });
            setAttendances(response.data);
        } catch (error) {
            message.error('Erro ao carregar lista.');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        if (professionalId) fetchDailyList();
    }, [professionalId]);

    const handleStart = async (id) => {
        try {
            await api.put(`/attendances/${id}/start?professional_id=${professionalId}`);
            message.success('Atendimento iniciado!');
            router.push(`/cuidados/attendance/${id}`);
        } catch (error) {
            message.error('Erro ao iniciar atendimento.');
        }
    };

    const handleOpen = (id) => {
        router.push(`/cuidados/attendance/${id}`);
    };

    return (
        <>
            <PageHeader ghost title="Meus Pacientes (Hoje)" />
            <Main>
                <Row gutter={25}>
                    <Col xs={24}>
                        <Card border={false}>
                            <List
                                loading={loading}
                                itemLayout="horizontal"
                                dataSource={attendances}
                                renderItem={item => (
                                    <List.Item
                                        actions={[
                                            item.status === 'em_espera' || item.status === 'agendado' ? (
                                                <Button type="primary" onClick={() => handleStart(item.id)}>
                                                    Iniciar Atendimento
                                                </Button>
                                            ) : (
                                                <Button onClick={() => handleOpen(item.id)}>
                                                    Abrir Prontuário
                                                </Button>
                                            )
                                        ]}
                                    >
                                        <List.Item.Meta
                                            title={item.child?.name || 'Desconhecido'}
                                            description={
                                                <>
                                                    <div>Horário: {item.scheduled_time ? dayjs(item.scheduled_time).format('HH:mm') : 'Ordem de Chegada'}</div>
                                                    <div>Status: <Tag>{item.status}</Tag></div>
                                                </>
                                            }
                                        />
                                    </List.Item>
                                )}
                            />
                        </Card>
                    </Col>
                </Row>
            </Main>
        </>
    );
}

export default withAdminLayoutNext(MyPatientsPage);
