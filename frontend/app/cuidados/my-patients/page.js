'use client';
import React, { useState, useEffect } from 'react';
import { Row, Col, Card, List, Button, Tag, App, Typography } from 'antd';
import FeatherIcon from 'feather-icons-react';
import { useSelector } from 'react-redux';
import { useRouter } from 'next/navigation';
import { PageHeader } from '../../../src/components/page-headers/page-headers';
import { Main } from '../../../src/container/styled';
import api from '../../../src/config/api/axios';
import withAdminLayoutNext from '../../../src/layout/withAdminLayoutNext';
import dayjs from 'dayjs';

function MyPatientsPage() {
    const { professional_id: professionalId } = useSelector(state => state.auth.login || {});
    const [attendances, setAttendances] = useState([]);
    const [loadingToday, setLoadingToday] = useState(true);
    const [loadingAllPatients, setLoadingAllPatients] = useState(false);
    const [allPatients, setAllPatients] = useState([]);
    const router = useRouter();
    // const { message } = App.useApp(); // Removendo uso do hook message aqui para evitar erro de contexto fora do App wrapper se houver
    
    // Fallback simples para message se o App context não estiver disponível
    const showMessage = (type, text) => {
        // console.log(type, text);
    };

    const fetchDailyList = async () => {
        try {
            const response = await api.get('/attendances/my-day', {
                params: { professional_id: professionalId }
            });
            setAttendances(response.data);
        } catch (error) {
            console.error('Erro ao carregar lista.', error);
        } finally {
            setLoadingToday(false);
        }
    };

    const fetchAllPatients = async () => {
        try {
            setLoadingAllPatients(true);
            const response = await api.get('/evolutions/', {
                params: { professional_id: professionalId, limit: 500, sort: 'created_at_desc' },
            });

            const map = new Map();
            if (response.data && Array.isArray(response.data)) {
                response.data.forEach((evo) => {
                    const child = evo.child;
                    if (child && !map.has(child.id)) {
                        map.set(child.id, {
                            id: child.id,
                            name: child.name,
                            diagnosis: child.diagnosis,
                            severity_level: child.severity_level,
                        });
                    }
                });
            }

            setAllPatients(Array.from(map.values()));
        } catch (error) {
            console.error('Erro ao carregar lista de pacientes.', error);
        } finally {
            setLoadingAllPatients(false);
        }
    };

    useEffect(() => {
        if (professionalId) {
            fetchDailyList();
            fetchAllPatients();
        }
    }, [professionalId]);

    const handleStart = async (id) => {
        try {
            await api.put(`/attendances/${id}/start?professional_id=${professionalId}`);
            // message.success('Atendimento iniciado!'); // Removendo toast para evitar erro
            router.push(`/cuidados/attendance/${id}`);
        } catch (error) {
            console.error('Erro ao iniciar atendimento.', error);
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
                        <Card variant="borderless">
                            <List
                                loading={loadingToday}
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
                <Row gutter={25} style={{ marginTop: 25 }}>
                    <Col xs={24}>
                        <Card
                            variant="borderless"
                            title="Pacientes que eu atendo"
                            extra={
                                <Typography.Text type="secondary">
                                    Total: {allPatients.length}
                                </Typography.Text>
                            }
                        >
                            <List
                                loading={loadingAllPatients}
                                itemLayout="horizontal"
                                dataSource={allPatients}
                                renderItem={item => (
                                    <List.Item>
                                        <List.Item.Meta
                                            title={item.name}
                                            description={
                                                <>
                                                    <div>
                                                        Diagnóstico:{' '}
                                                        {item.diagnosis || 'Não informado'}
                                                    </div>
                                                    <div>
                                                        Gravidade:{' '}
                                                        <Tag>
                                                            {item.severity_level || 'Não classificado'}
                                                        </Tag>
                                                    </div>
                                                </>
                                            }
                                        />
                                        <Button onClick={() => router.push(`/cuidados/children/${item.id}/dashboard`)}>
                                            Ver evoluções
                                        </Button>
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
