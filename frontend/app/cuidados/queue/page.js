'use client';
import React, { useState, useEffect } from 'react';
import { Row, Col, Card, Table, Button, Modal, Form, Select, DatePicker, Tag, Input, App } from 'antd';
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
    const [isModalVisible, setIsModalVisible] = useState(false);
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

    // Handle Submit
    const handleOk = async () => {
        try {
            const values = await form.validateFields();
            const payload = {
                child_id: values.child_id,
                professional_id: values.professional_id,
                wallet_id: values.wallet_id,
                scheduled_time: values.scheduled_time ? values.scheduled_time.toISOString() : null,
                notes: values.notes
            };
            
            await api.post('/attendances/', payload);
            message.success('Agendamento realizado com sucesso!');
            setIsModalVisible(false);
            form.resetFields();
            fetchData(); // Refresh
        } catch (error) {
            console.error(error);
            message.error('Erro ao agendar.');
        }
    };

    // Table Columns
    const columns = [
        {
            title: 'Criança',
            dataIndex: 'child',
            key: 'child',
            render: (child) => child?.name || 'N/A',
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
                if (status === 'em_espera') { color = 'orange'; text = 'Em Espera'; }
                if (status === 'em_atendimento') { color = 'green'; text = 'Em Atendimento'; }
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
    ];

    return (
        <>
            <PageHeader
                ghost
                title="Fila de Atendimento e Agenda"
                buttons={[
                    <Button key="1" type="primary" onClick={() => setIsModalVisible(true)}>
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
                title="Novo Agendamento"
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
                    <Form.Item name="notes" label="Observações">
                        <Input.TextArea />
                    </Form.Item>
                </Form>
            </Modal>
        </>
    );
}

export default withAdminLayoutNext(QueuePage);
