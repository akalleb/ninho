'use client';
import React, { useState, useEffect } from 'react';
import { Row, Col, Card, List, Button, Tag, App, Typography, Tabs, Alert, Tooltip } from 'antd';
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
    const [queueToday, setQueueToday] = useState([]);
    const [loadingToday, setLoadingToday] = useState(true);
    const [loadingQueue, setLoadingQueue] = useState(true);
    const [loadingAllPatients, setLoadingAllPatients] = useState(false);
    const [allPatients, setAllPatients] = useState([]);
    const router = useRouter();
    const { message } = App.useApp();

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

    const fetchQueueToday = async () => {
        try {
            const response = await api.get('/queue/');
            setQueueToday(Array.isArray(response.data) ? response.data : []);
        } catch (error) {
            console.error('Erro ao carregar fila.', error);
        } finally {
            setLoadingQueue(false);
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
            fetchQueueToday();
        } else {
            setLoadingToday(false);
            setLoadingAllPatients(false);
            setLoadingQueue(false);
        }
    }, [professionalId]);

    const handleStart = async (id) => {
        try {
            await api.put(`/attendances/${id}/start?professional_id=${professionalId}`);
            message.success('Atendimento iniciado!');
            router.push(`/cuidados/attendance/${id}`);
        } catch (error) {
            console.error('Erro ao iniciar atendimento.', error);
            message.error('Erro ao iniciar atendimento.');
        }
    };

    const handleOpen = (id) => {
        router.push(`/cuidados/attendance/${id}`);
    };

    const statusLabel = (status) => {
        if (status === 'agendado') return { color: 'blue', text: 'Agendado' };
        if (status === 'em_espera') return { color: 'gold', text: 'Em espera' };
        if (status === 'em_atendimento') return { color: 'green', text: 'Em atendimento' };
        if (status === 'finalizado') return { color: 'default', text: 'Finalizado' };
        if (status === 'falta') return { color: 'red', text: 'Falta' };
        return { color: 'default', text: status || '-' };
    };

    const renderAttendanceActions = (item) => {
        if (item.status === 'em_espera' || item.status === 'agendado') {
            return (
                <Button type="primary" onClick={() => handleStart(item.id)}>
                    Iniciar
                </Button>
            );
        }
        if (item.status === 'em_atendimento') {
            return (
                <Button type="primary" onClick={() => handleOpen(item.id)}>
                    Continuar
                </Button>
            );
        }
        return (
            <Button onClick={() => handleOpen(item.id)}>
                Ver prontuário
            </Button>
        );
    };

    const renderQueueActions = (item) => {
        if (!professionalId) return null;

        if (item.professional_id && item.professional_id !== professionalId) {
            return (
                <Tooltip title="Este atendimento está atribuído a outro profissional.">
                    <Button disabled>Indisponível</Button>
                </Tooltip>
            );
        }

        if (item.status === 'em_espera' || item.status === 'agendado') {
            const label = item.professional_id ? 'Iniciar' : 'Assumir e iniciar';
            return (
                <Button type="primary" onClick={() => handleStart(item.id)}>
                    {label}
                </Button>
            );
        }

        if (item.professional_id === professionalId) {
            return (
                <Button type="primary" onClick={() => handleOpen(item.id)}>
                    Abrir
                </Button>
            );
        }

        return (
            <Tooltip title="Somente o profissional atribuído pode abrir este atendimento.">
                <Button disabled>Indisponível</Button>
            </Tooltip>
        );
    };

    return (
        <>
            <PageHeader ghost title="Atendimentos e Pacientes" />
            <Main>
                {!professionalId ? (
                    <Alert
                        type="warning"
                        showIcon
                        message="Seu usuário não está vinculado a um profissional"
                        description="Para ver atendimentos do dia, é necessário que seu login tenha professional_id."
                        style={{ marginBottom: 16 }}
                    />
                ) : null}

                <Row gutter={25}>
                    <Col xs={24}>
                        <Card variant="borderless">
                            <Tabs
                                defaultActiveKey="today"
                                items={[
                                    {
                                        key: 'today',
                                        label: 'Atribuídos a mim (Hoje)',
                                        children: (
                                            <>
                                                {professionalId && !loadingToday && attendances.length === 0 ? (
                                                    <Alert
                                                        type="info"
                                                        showIcon
                                                        message="Nenhum atendimento atribuído a você hoje"
                                                        description="Se existem pacientes na fila do admin, eles precisam estar com o Profissional selecionado, ou você pode puxar pela aba “Fila geral (Hoje)”."
                                                        style={{ marginBottom: 12 }}
                                                    />
                                                ) : null}
                                                <List
                                                    loading={loadingToday}
                                                    itemLayout="horizontal"
                                                    dataSource={attendances}
                                                    renderItem={(item) => {
                                                        const status = statusLabel(item.status);
                                                        return (
                                                            <List.Item actions={[renderAttendanceActions(item)]}>
                                                                <List.Item.Meta
                                                                    title={item.child?.name || 'Desconhecido'}
                                                                    description={
                                                                        <>
                                                                            <div>
                                                                                Horário:{' '}
                                                                                {item.scheduled_time
                                                                                    ? dayjs(item.scheduled_time).format('HH:mm')
                                                                                    : 'Ordem de chegada'}
                                                                            </div>
                                                                            <div>
                                                                                Status:{' '}
                                                                                <Tag color={status.color}>{status.text}</Tag>
                                                                                {item.wallet?.name ? (
                                                                                    <Tag style={{ marginLeft: 8 }}>{item.wallet.name}</Tag>
                                                                                ) : null}
                                                                            </div>
                                                                        </>
                                                                    }
                                                                />
                                                            </List.Item>
                                                        );
                                                    }}
                                                />
                                            </>
                                        ),
                                    },
                                    {
                                        key: 'queue',
                                        label: 'Fila geral (Hoje)',
                                        children: (
                                            <List
                                                loading={loadingQueue}
                                                itemLayout="horizontal"
                                                dataSource={queueToday}
                                                renderItem={(item) => {
                                                    const status = statusLabel(item.status);
                                                    const assigned =
                                                        item.professional_id === professionalId
                                                            ? 'Atribuído a você'
                                                            : item.professional?.name
                                                              ? `Atribuído: ${item.professional.name}`
                                                              : 'Sem profissional';

                                                    return (
                                                        <List.Item actions={[renderQueueActions(item)]}>
                                                            <List.Item.Meta
                                                                title={item.child?.name || 'Desconhecido'}
                                                                description={
                                                                    <>
                                                                        <div>
                                                                            Horário:{' '}
                                                                            {item.scheduled_time
                                                                                ? dayjs(item.scheduled_time).format('HH:mm')
                                                                                : item.check_in_time
                                                                                  ? `Check-in ${dayjs(item.check_in_time).format('HH:mm')}`
                                                                                  : 'Ordem de chegada'}
                                                                        </div>
                                                                        <div>
                                                                            Status:{' '}
                                                                            <Tag color={status.color}>{status.text}</Tag>
                                                                            <Tag style={{ marginLeft: 8 }}>{assigned}</Tag>
                                                                            {item.wallet?.name ? (
                                                                                <Tag style={{ marginLeft: 8 }}>{item.wallet.name}</Tag>
                                                                            ) : null}
                                                                        </div>
                                                                    </>
                                                                }
                                                            />
                                                        </List.Item>
                                                    );
                                                }}
                                            />
                                        ),
                                    },
                                    {
                                        key: 'history',
                                        label: `Histórico (${allPatients.length})`,
                                        children: (
                                            <List
                                                loading={loadingAllPatients}
                                                itemLayout="horizontal"
                                                dataSource={allPatients}
                                                renderItem={(item) => (
                                                    <List.Item>
                                                        <List.Item.Meta
                                                            title={item.name}
                                                            description={
                                                                <>
                                                                    <div>Diagnóstico: {item.diagnosis || 'Não informado'}</div>
                                                                    <div>
                                                                        Gravidade:{' '}
                                                                        <Tag>{item.severity_level || 'Não classificado'}</Tag>
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
                                        ),
                                    },
                                ]}
                            />
                        </Card>
                    </Col>
                </Row>
            </Main>
        </>
    );
}

export default withAdminLayoutNext(MyPatientsPage);
