'use client';
import React, { useState, useEffect } from 'react';
import { Row, Col, Card, Table, Button, Modal, Form, Select, DatePicker, Tag, Input, Popconfirm, Tooltip, App } from 'antd';
import FeatherIcon from 'feather-icons-react';
import { PageHeader } from '../../../src/components/page-headers/page-headers';
import { Main } from '../../../src/container/styled';
import api from '../../../src/config/api/axios';
import withAdminLayoutNext from '../../../src/layout/withAdminLayoutNext';
import dayjs from 'dayjs';

const { Option } = Select;

function QueuePage() {
    const [queue, setQueue] = useState([]);
    const [children, setChildren] = useState([]);
    const [professionals, setProfessionals] = useState([]);
    const [wallets, setWallets] = useState([]);
    const [referrals, setReferrals] = useState([]);
    const [isModalVisible, setIsModalVisible] = useState(false);
    const [editingItem, setEditingItem] = useState(null);
    const [form] = Form.useForm();
    const [loading, setLoading] = useState(false);
    const [loadingReferrals, setLoadingReferrals] = useState(false);
    const { message } = App.useApp();

    const fetchData = async () => {
        setLoading(true);
        setLoadingReferrals(true);
        try {
            const [qRes, cRes, pRes, wRes, rRes] = await Promise.all([
                api.get('/queue/'),
                api.get('/children/'),
                api.get('/professionals/basic'),
                api.get('/wallets/'),
                api.get('/health-referrals/')
            ]);
            setQueue(qRes.data);
            setChildren(cRes.data);
            setProfessionals(pRes.data);
            setWallets(wRes.data);
            setReferrals(rRes.data);
        } catch (error) {
            message.error('Erro ao carregar dados.');
            console.error(error);
        } finally {
            setLoading(false);
            setLoadingReferrals(false);
        }
    };

    useEffect(() => {
        fetchData();
    }, []);

    const handleOpenModal = (item = null) => {
        setEditingItem(item);
        if (item) {
            form.setFieldsValue({
                child_id: item.child_id,
                professional_id: item.professional_id,
                wallet_id: item.wallet_id,
                scheduled_time: item.scheduled_time ? dayjs(item.scheduled_time) : null,
                notes: item.notes,
                status: item.status
            });
        } else {
            form.resetFields();
        }
        setIsModalVisible(true);
    };

    const handleOk = async () => {
        try {
            const values = await form.validateFields();
            const payload = {
                child_id: values.child_id,
                professional_id: values.professional_id,
                wallet_id: values.wallet_id,
                scheduled_time: values.scheduled_time ? values.scheduled_time.toISOString() : null,
                notes: values.notes,
                status: values.status || 'agendado'
            };
            
            if (editingItem) {
                await api.put(`/attendances/${editingItem.id}`, payload);
                message.success('Agendamento atualizado com sucesso!');
            } else {
                await api.post('/attendances/', payload);
                if (values.weight || values.height) {
                    const childRes = await api.get(`/children/${values.child_id}`);
                    const child = childRes.data;
                    const updatedChild = {
                        ...child,
                        weight: values.weight != null ? values.weight : child.weight,
                        height: values.height != null ? values.height : child.height
                    };
                    await api.put(`/children/${values.child_id}`, updatedChild);
                }
                message.success('Agendamento realizado com sucesso!');
            }
            
            setIsModalVisible(false);
            setEditingItem(null);
            form.resetFields();
            fetchData(); 
        } catch (error) {
            console.error(error);
            message.error('Erro ao salvar.');
        }
    };

    const handleDelete = async (id) => {
        try {
            await api.delete(`/attendances/${id}`);
            message.success('Agendamento removido.');
            fetchData();
        } catch (error) {
            message.error('Erro ao remover.');
        }
    };

    const columns = [
        {
            title: 'Criança',
            dataIndex: 'child',
            key: 'child',
            render: (child) => <span style={{ fontWeight: 600 }}>{child?.name || 'N/A'}</span>,
        },
        {
            title: 'Profissional',
            dataIndex: 'professional',
            key: 'professional',
            render: (prof) => prof?.name || 'A definir',
        },
        {
            title: 'Status',
            dataIndex: 'status',
            key: 'status',
            render: (status) => {
                let color = 'default';
                let text = status;
                if (status === 'agendado') { color = 'blue'; text = 'Agendado'; }
                if (status === 'em_espera') { color = 'gold'; text = 'Em Espera'; }
                if (status === 'em_atendimento') { color = 'green'; text = 'Em Atendimento'; }
                if (status === 'finalizado') { color = 'default'; text = 'Finalizado'; }
                return <Tag color={color}>{text}</Tag>;
            }
        },
        {
            title: 'Horário',
            dataIndex: 'scheduled_time',
            key: 'time',
            render: (time, record) => {
                if (time) return dayjs(time).format('DD/MM/YYYY HH:mm');
                if (record.check_in_time) return `Check-in: ${dayjs(record.check_in_time).format('HH:mm')}`;
                return '-';
            }
        },
        {
            title: 'Carteira',
            dataIndex: 'wallet',
            key: 'wallet',
            render: (wallet) => wallet?.name || '-',
        },
        {
            title: 'Ações',
            key: 'actions',
            render: (_, record) => (
                <div style={{ display: 'flex', gap: '8px' }}>
                    <Tooltip title="Editar">
                        <Button 
                            size="small" 
                            type="primary" 
                            shape="circle" 
                            icon={<FeatherIcon icon="edit-2" size={14} />} 
                            onClick={() => handleOpenModal(record)}
                        />
                    </Tooltip>
                    <Popconfirm
                        title="Tem certeza que deseja excluir?"
                        onConfirm={() => handleDelete(record.id)}
                        okText="Sim"
                        cancelText="Não"
                    >
                        <Tooltip title="Excluir">
                            <Button 
                                size="small" 
                                type="primary"
                                danger
                                shape="circle" 
                                icon={<FeatherIcon icon="trash-2" size={14} />} 
                            />
                        </Tooltip>
                    </Popconfirm>
                </div>
            )
        }
    ];

    const referralColumns = [
        {
            title: 'Criança',
            dataIndex: 'child_id',
            key: 'child',
            render: (childId) => {
                const child = children.find(c => c.id === childId);
                return <span style={{ fontWeight: 600 }}>{child ? child.name : 'N/A'}</span>;
            },
        },
        {
            title: 'Especialidade',
            dataIndex: 'specialty',
            key: 'specialty',
        },
        {
            title: 'Profissional indicado',
            dataIndex: 'professional_name',
            key: 'professional_name',
            render: (text) => text || '-',
        },
        {
            title: 'Data do encaminhamento',
            dataIndex: 'referral_date',
            key: 'referral_date',
            render: (date) => (date ? dayjs(date).format('DD/MM/YYYY') : '-'),
        },
        {
            title: 'Prioridade',
            dataIndex: 'priority',
            key: 'priority',
            render: (priority) => {
                let color = 'default';
                let text = 'Média';
                if (priority === 'low') {
                    color = 'blue';
                    text = 'Baixa';
                } else if (priority === 'medium') {
                    color = 'gold';
                    text = 'Média';
                } else if (priority === 'high') {
                    color = 'red';
                    text = 'Alta';
                }
                return <Tag color={color}>{text}</Tag>;
            },
        },
        {
            title: 'Status',
            dataIndex: 'status',
            key: 'status',
            render: (status) => {
                let color = 'orange';
                let text = 'Pendente';
                if (status === 'scheduled') {
                    color = 'blue';
                    text = 'Agendado';
                } else if (status === 'completed') {
                    color = 'green';
                    text = 'Concluído';
                } else if (status === 'canceled') {
                    color = 'red';
                    text = 'Cancelado';
                }
                return <Tag color={color}>{text}</Tag>;
            },
        },
        {
            title: 'Ações',
            key: 'actions',
            render: (_, record) => (
                <div style={{ display: 'flex', gap: '8px' }}>
                    <Select
                        size="small"
                        value={record.status}
                        style={{ width: 130 }}
                        onChange={(value) => handleReferralStatusChange(record.id, value)}
                    >
                        <Option value="pending">Pendente</Option>
                        <Option value="scheduled">Agendado</Option>
                        <Option value="completed">Concluído</Option>
                        <Option value="canceled">Cancelado</Option>
                    </Select>
                </div>
            ),
        },
    ];

    const handleReferralStatusChange = async (id, status) => {
        try {
            await api.put(`/health-referrals/${id}`, { status });
            message.success('Status do encaminhamento atualizado.');
            fetchData();
        } catch (error) {
            message.error('Erro ao atualizar status do encaminhamento.');
        }
    };

    return (
        <>
            <PageHeader
                ghost
                title="Fila de Atendimento e Agenda"
                buttons={[
                    <Button key="1" type="primary" onClick={() => handleOpenModal(null)}>
                        <FeatherIcon icon="plus" size={14} /> Novo Agendamento
                    </Button>,
                ]}
            />
            <Main>
                <Row gutter={25}>
                    <Col xs={24}>
                        <Card variant="borderless" title="Fila e Agendamentos">
                            <Table 
                                dataSource={queue} 
                                columns={columns} 
                                rowKey="id" 
                                loading={loading}
                            />
                        </Card>
                    </Col>
                </Row>
                <Row gutter={25} style={{ marginTop: 25 }}>
                    <Col xs={24}>
                        <Card variant="borderless" title="Encaminhamentos de Saúde">
                            <Table
                                dataSource={referrals}
                                columns={referralColumns}
                                rowKey="id"
                                loading={loadingReferrals}
                            />
                        </Card>
                    </Col>
                </Row>
            </Main>

            <Modal
                title={editingItem ? "Editar Agendamento" : "Novo Agendamento"}
                open={isModalVisible}
                onOk={handleOk}
                onCancel={() => setIsModalVisible(false)}
            >
                <Form form={form} layout="vertical">
                    <Form.Item name="child_id" label="Criança" rules={[{ required: true, message: 'Selecione uma criança' }]}>
                        <Select showSearch optionFilterProp="children" filterOption={(input, option) =>
                            option.children.toLowerCase().indexOf(input.toLowerCase()) >= 0
                        }>
                            {children.map(c => (
                                <Option key={c.id} value={c.id}>{c.name}</Option>
                            ))}
                        </Select>
                    </Form.Item>
                    <Form.Item name="professional_id" label="Profissional">
                        <Select allowClear>
                            {professionals
                                .filter(p => p.role === 'health')
                                .map(p => (
                                    <Option key={p.id} value={p.id}>{p.name}</Option>
                                ))}
                        </Select>
                    </Form.Item>
                    <Form.Item name="wallet_id" label="Carteira / Recurso">
                        <Select allowClear>
                            {wallets.map(w => (
                                <Option key={w.id} value={w.id}>{w.name}</Option>
                            ))}
                        </Select>
                    </Form.Item>
                    
                    <Form.Item name="scheduled_time" label="Data e Hora (Deixe vazio para fila de espera imediata)">
                        <DatePicker showTime format="DD/MM/YYYY HH:mm" style={{ width: '100%' }} />
                    </Form.Item>
                    {!editingItem && (
                        <>
                            <Form.Item name="weight" label="Peso atual (kg)">
                                <Input type="number" />
                            </Form.Item>
                            <Form.Item name="height" label="Altura atual (cm)">
                                <Input type="number" />
                            </Form.Item>
                        </>
                    )}
                    {editingItem && (
                         <Form.Item name="status" label="Status">
                            <Select>
                                <Option value="agendado">Agendado</Option>
                                <Option value="em_espera">Em Espera</Option>
                                <Option value="em_atendimento">Em Atendimento</Option>
                                <Option value="finalizado">Finalizado</Option>
                                <Option value="falta">Falta</Option>
                            </Select>
                        </Form.Item>
                    )}
                    <Form.Item name="notes" label="Observações">
                        <Input.TextArea />
                    </Form.Item>
                </Form>
            </Modal>
        </>
    );
}

export default withAdminLayoutNext(QueuePage);
