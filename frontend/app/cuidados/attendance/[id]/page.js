'use client';
import React, { useState, useEffect } from 'react';
import { Row, Col, Card, Form, Input, Button, Descriptions, Divider, message } from 'antd';
import { PageHeader } from '../../../../src/components/page-headers/page-headers';
import { Main } from '../../../../src/container/styled';
import api from '../../../../src/config/api/axios';
import withAdminLayoutNext from '../../../../src/layout/withAdminLayoutNext';
import { useRouter } from 'next/navigation';

function AttendancePage({ params }) {
    const { id } = params;
    const [attendance, setAttendance] = useState(null);
    const [child, setChild] = useState(null);
    const [loading, setLoading] = useState(true);
    const [form] = Form.useForm();
    const router = useRouter();

    useEffect(() => {
        if (id) fetchData();
    }, [id]);

    const fetchData = async () => {
        try {
            const res = await api.get(`/attendances/${id}`);
            setAttendance(res.data);
            
            if (res.data.child_id) {
                 const childRes = await api.get(`/children/${res.data.child_id}`);
                 setChild(childRes.data);
            }
        } catch (error) {
            console.error(error);
            message.error('Erro ao carregar atendimento.');
        } finally {
            setLoading(false);
        }
    };

    const handleFinish = async (values) => {
        try {
            // 1. Create Evolution
            await api.post(`/children/${child.id}/evolutions`, {
                child_id: child.id,
                service_type: "Atendimento Clínico", 
                evolution_report: values.evolution_report,
                intermittences: values.intermittences,
                attendance_id: parseInt(id)
            });
            
            // 2. Finish Attendance
            await api.put(`/attendances/${id}/finish?notes=${values.notes || ''}`);
            
            message.success('Atendimento finalizado!');
            router.push('/cuidados/my-patients');
        } catch (error) {
            console.error(error);
            message.error('Erro ao finalizar.');
        }
    };

    if (loading) return <Main>Carregando...</Main>;
    if (!attendance) return <Main>Atendimento não encontrado.</Main>;

    return (
        <>
             <PageHeader
                ghost
                title={`Atendimento: ${child?.name || '...'}`}
                buttons={[
                    <Button key="1" onClick={() => router.back()}>Voltar</Button>
                ]}
            />
            <Main>
                <Row gutter={25}>
                    <Col xs={24} md={8}>
                        <Card title="Prontuário / Dados Clínicos">
                            <Descriptions column={1} layout="vertical">
                                <Descriptions.Item label="Diagnóstico">{child?.diagnosis || '-'}</Descriptions.Item>
                                <Descriptions.Item label="Alergias">{child?.allergies || '-'}</Descriptions.Item>
                                <Descriptions.Item label="Histórico Gestacional">{child?.gestational_history || '-'}</Descriptions.Item>
                                <Descriptions.Item label="Necessidades">{child?.assistance_needs || '-'}</Descriptions.Item>
                            </Descriptions>
                        </Card>
                    </Col>
                    <Col xs={24} md={16}>
                        <Card title="Registro de Evolução">
                            <Form form={form} layout="vertical" onFinish={handleFinish}>
                                <Form.Item name="evolution_report" label="Relato de Evolução" rules={[{ required: true, message: 'Obrigatório' }]}>
                                    <Input.TextArea rows={6} placeholder="Descreva a evolução do paciente..." />
                                </Form.Item>
                                <Form.Item name="intermittences" label="Intercorrências">
                                    <Input.TextArea rows={2} />
                                </Form.Item>
                                <Form.Item name="notes" label="Observações Administrativas">
                                    <Input />
                                </Form.Item>
                                <Divider />
                                <Button type="primary" htmlType="submit" size="large">
                                    Finalizar Atendimento
                                </Button>
                            </Form>
                        </Card>
                    </Col>
                </Row>
            </Main>
        </>
    );
}

export default withAdminLayoutNext(AttendancePage);
