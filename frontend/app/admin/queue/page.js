'use client';
import React, { useState, useEffect } from 'react';
import { Row, Col, Card, Table, Button, Modal, Form, Select, DatePicker, Tag, Input, Popconfirm, Tooltip, App, Alert } from 'antd';
import FeatherIcon from 'feather-icons-react';
import { PageHeader } from '../../../src/components/page-headers/page-headers';
import { Main } from '../../../src/container/styled';
import api from '../../../src/config/api/axios';
import withAdminLayoutNext from '../../../src/layout/withAdminLayoutNext';
import dayjs from 'dayjs';

const { Option } = Select;

function QueuePage() {
    // State
    const [queue, setQueue] = useState([]);
    const [children, setChildren] = useState([]);
    const [professionals, setProfessionals] = useState([]);
    const [wallets, setWallets] = useState([]);
    
    // Modal State
    const [isModalVisible, setIsModalVisible] = useState(false);
    const [editingItem, setEditingItem] = useState(null);
    const [form] = Form.useForm();
    const [loading, setLoading] = useState(false);
    const { message } = App.useApp();

    // Fetch Data
    const fetchData = async () => {
        setLoading(true);
        try {
            const [qRes, cRes, pRes, wRes] = await Promise.all([
                api.get('/queue/'),
                api.get('/children/'),
                api.get('/professionals/basic'),
                api.get('/wallets/')
            ]);
            setQueue(qRes.data);
            setChildren(cRes.data);
            setProfessionals(pRes.data);
            setWallets(wRes.data);
        } catch (error) {
            message.error('Erro ao carregar dados.');
            console.error(error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchData();
    }, []);

    // Handle Open Modal
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

    // Handle Submit
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

    // Handle Delete
    const handleDelete = async (id) => {
        try {
            await api.delete(`/attendances/${id}`);
            message.success('Agendamento removido.');
            fetchData();
        } catch (error) {
            message.error('Erro ao remover.');
        }
    };

    // Table Columns
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
                        <Card variant="borderless">
                            <Table 
                                dataSource={queue} 
                                columns={columns} 
                                rowKey="id" 
                                loading={loading}
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
                        <Select
                            showSearch
                            allowClear
                            placeholder="Buscar criança por nome"
                            optionFilterProp="label"
                            filterOption={(input, option) =>
                                String(option?.label || '')
                                    .toLowerCase()
                                    .includes(String(input || '').toLowerCase())
                            }
                            options={children.map((c) => ({
                                value: c.id,
                                label: c.name || `Criança #${c.id}`,
                            }))}
                        />
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
