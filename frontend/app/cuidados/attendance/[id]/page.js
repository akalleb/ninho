'use client';
import React, { useState, useEffect } from 'react';
import { Row, Col, Card, Form, Input, Button, Descriptions, Divider, List, Tag, Timeline, Avatar, Upload, Modal, Select, Tooltip, App } from 'antd';
import { Main } from '../../../../src/container/styled';
import { Cards } from '../../../../src/components/cards/frame/cards-frame';
import api from '../../../../src/config/api/axios';
import withAdminLayoutNext from '../../../../src/layout/withAdminLayoutNext';
import { useRouter } from 'next/navigation';
import { useSelector } from 'react-redux';
import dayjs from 'dayjs';

const { TextArea } = Input;
const { Option } = Select;

function AttendancePage({ params }) {
    const { id } = params;
    const [attendance, setAttendance] = useState(null);
    const [child, setChild] = useState(null);
    const [evolutions, setEvolutions] = useState([]);
    const [medications, setMedications] = useState([]);
    const [professionalMap, setProfessionalMap] = useState({});
    const [loading, setLoading] = useState(true);
    const [form] = Form.useForm();
    const [medForm] = Form.useForm();
    const [isMedModalOpen, setIsMedModalOpen] = useState(false);
    const [editingMedication, setEditingMedication] = useState(null);
    const router = useRouter();
    const { message } = App.useApp();

    const authState = useSelector((state) => state.auth.login);
    const authUser = typeof authState === 'object' && authState ? authState : null;

    useEffect(() => {
        if (id) {
            fetchData();
        }
    }, [id]);

    useEffect(() => {
        if (child) {
            form.setFieldsValue({
                weight: child.weight != null ? child.weight : null,
                height: child.height != null ? child.height : null,
                cephalic_perimeter:
                    child.cephalic_perimeter != null ? child.cephalic_perimeter : null
            });
        }
    }, [child, form]);

    const fetchData = async () => {
        try {
            const attendanceRes = await api.get(`/attendances/${id}`);
            setAttendance(attendanceRes.data);

            if (attendanceRes.data.child_id) {
                const childId = attendanceRes.data.child_id;
                const [childRes, evoRes, medRes] = await Promise.all([
                    api.get(`/children/${childId}`),
                    api.get(`/children/${childId}/evolutions`),
                    api.get(`/children/${childId}/medications`)
                ]);
                setChild(childRes.data);
                setEvolutions(evoRes.data);
                setMedications(medRes.data);
            }
        } catch (error) {
            console.error(error);
            message.error('Erro ao carregar atendimento.');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        const fetchProfessionals = async () => {
            const ids = Array.from(
                new Set(
                    evolutions
                        .map((e) => e.professional_id)
                        .filter((pid) => pid && !professionalMap[pid])
                )
            );
            if (!ids.length) return;
            try {
                const results = await Promise.all(
                    ids.map((pid) =>
                        api
                            .get(`/professionals/${pid}`)
                            .then((res) => [pid, res.data])
                            .catch(() => null)
                    )
                );
                const newMap = {};
                results.forEach((entry) => {
                    if (entry && entry[1]) {
                        const [pid, prof] = entry;
                        newMap[pid] = prof;
                    }
                });
                if (Object.keys(newMap).length) {
                    setProfessionalMap((prev) => ({ ...prev, ...newMap }));
                }
            } catch (error) {
                console.error(error);
            }
        };
        if (evolutions && evolutions.length) {
            fetchProfessionals();
        }
    }, [evolutions, professionalMap]);

    const openAddMedicationModal = () => {
        if (!child) {
            message.warning('Selecione um paciente para adicionar medicação.');
            return;
        }
        setEditingMedication(null);
        medForm.resetFields();
        setIsMedModalOpen(true);
    };

    const openEditMedicationModal = (med) => {
        setEditingMedication(med);
        medForm.setFieldsValue({
            med_name: med.med_name,
            dosage: med.dosage,
            schedule: med.schedule,
            frequency: med.frequency,
            status: med.status || 'continuo'
        });
        setIsMedModalOpen(true);
    };

    const handleSaveMedication = async () => {
        if (!child) return;
        try {
            const values = await medForm.validateFields();
            const professionalId =
                authUser && authUser.professional_id && authUser.role === 'health' ? authUser.professional_id : null;

            if (editingMedication) {
                await api.put(`/medications/${editingMedication.id}`, values);
                message.success('Medicação atualizada!');
            } else {
                await api.post(`/children/${child.id}/medications`, {
                    ...values,
                    child_id: child.id
                });
                message.success('Medicação adicionada!');
            }

            const medParts = [];
            if (values.med_name) medParts.push(values.med_name);
            if (values.dosage) medParts.push(`Dosagem: ${values.dosage}`);
            if (values.schedule) medParts.push(`Horários: ${values.schedule}`);
            if (values.frequency) medParts.push(`Frequência: ${values.frequency}`);
            if (values.status) {
                const statusLabel =
                    values.status === 'continuo'
                        ? 'Contínuo'
                        : values.status === 'sos'
                        ? 'SOS'
                        : values.status === 'interrompido'
                        ? 'Interrompido'
                        : values.status;
                medParts.push(`Status: ${statusLabel}`);
            }
            const actionLabel = editingMedication ? 'Medicação atualizada' : 'Medicação adicionada';
            const evolutionReport = medParts.length
                ? `${actionLabel}: ${medParts.join(' | ')}`
                : actionLabel;

            await api.post(`/children/${child.id}/evolutions`, {
                child_id: child.id,
                professional_id: professionalId,
                attendance_id: parseInt(id, 10),
                service_type: 'Medicação',
                evolution_report: evolutionReport,
                intermittences: null,
                protocol_scores: null
            });

            setIsMedModalOpen(false);
            medForm.resetFields();
            const medRes = await api.get(`/children/${child.id}/medications`);
            setMedications(medRes.data);
        } catch (error) {
            if (error?.errorFields) {
                return;
            }
            console.error(error);
            message.error('Erro ao salvar medicação.');
        }
    };

    const getUploadProps = (docType) => ({
        name: 'file',
        action: `${api.defaults.baseURL}/children/${child?.id}/docs?doc_type=${docType}`,
        onChange(info) {
            if (info.file.status === 'done') {
                message.success(`${info.file.name} enviado com sucesso`);
                if (child?.id) {
                    api.get(`/children/${child.id}`).then((res) => setChild(res.data));
                }
            } else if (info.file.status === 'error') {
                message.error(`${info.file.name} falha no envio`);
            }
        },
        showUploadList: true
    });

    const handleFinish = async (values) => {
        if (!child) return;
        try {
            const professionalId =
                authUser && authUser.professional_id && authUser.role === 'health' ? authUser.professional_id : null;

            let protocolScores = values.protocol_scores || '';
            const biometricsParts = [];
            if (values.weight != null) biometricsParts.push(`Peso: ${values.weight} kg`);
            if (values.height != null) biometricsParts.push(`Altura: ${values.height} cm`);
            if (values.cephalic_perimeter != null)
                biometricsParts.push(`PC: ${values.cephalic_perimeter} cm`);
            if (biometricsParts.length) {
                const biometricsText = `Biometria atual - ${biometricsParts.join(' | ')}`;
                protocolScores = protocolScores
                    ? `${protocolScores}\n${biometricsText}`
                    : biometricsText;
            }

            await api.post(`/children/${child.id}/evolutions`, {
                child_id: child.id,
                professional_id: professionalId,
                attendance_id: parseInt(id, 10),
                service_type: values.service_type,
                evolution_report: values.evolution_report,
                intermittences: values.intermittences,
                protocol_scores: protocolScores
            });

            if (biometricsParts.length) {
                const updatedChild = {
                    ...child,
                    weight: values.weight != null ? values.weight : child.weight,
                    height: values.height != null ? values.height : child.height,
                    cephalic_perimeter:
                        values.cephalic_perimeter != null
                            ? values.cephalic_perimeter
                            : child.cephalic_perimeter
                };
                await api.put(`/children/${child.id}`, updatedChild);
            }

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

    const assistanceNeedsText = (() => {
        if (!child?.assistance_needs) return '-';
        if (typeof child.assistance_needs === 'string') {
            try {
                const parsed = JSON.parse(child.assistance_needs);
                if (Array.isArray(parsed) && parsed.length) {
                    return parsed.join(', ');
                }
            } catch {
                return child.assistance_needs;
            }
            return child.assistance_needs;
        }
        return '-';
    })();

    return (
        <>
            <Main>
                <Cards
                    title={`Atendimento: ${child?.name || '...'}`}
                    extra={
                        <Button key="1" onClick={() => router.back()}>
                            Voltar
                        </Button>
                    }
                >
                    <Row gutter={25}>
                        <Col xs={24} md={8}>
                            <Cards title="Prontuário Clínico" headless={false}>
                                <Descriptions column={1} layout="vertical">
                                    <Descriptions.Item label="Diagnóstico">
                                        {child?.diagnosis || '-'}
                                    </Descriptions.Item>
                                    <Descriptions.Item label="Diagnóstico fechado">
                                        {child?.is_diagnosis_closed ? 'Sim' : 'Em investigação'}
                                    </Descriptions.Item>
                                    <Descriptions.Item label="Tipo Sanguíneo">
                                        {child?.blood_type || '-'}
                                    </Descriptions.Item>
                                    <Descriptions.Item label="Alergias">
                                        {child?.allergies || '-'}
                                    </Descriptions.Item>
                                    <Descriptions.Item label="Histórico Gestacional">
                                        {child?.gestational_history || '-'}
                                    </Descriptions.Item>
                                    <Descriptions.Item label="Peso atual">
                                        {child?.weight != null ? `${child.weight} kg` : '-'}
                                    </Descriptions.Item>
                                    <Descriptions.Item label="Altura">
                                        {child?.height != null ? `${child.height} cm` : '-'}
                                    </Descriptions.Item>
                                    <Descriptions.Item label="Perímetro Cefálico">
                                        {child?.cephalic_perimeter != null
                                            ? `${child.cephalic_perimeter} cm`
                                            : '-'}
                                    </Descriptions.Item>
                                    <Descriptions.Item label="Contato de Emergência">
                                        {child?.emergency_contact || '-'}
                                    </Descriptions.Item>
                                    <Descriptions.Item label="Necessidades específicas">
                                        {assistanceNeedsText}
                                    </Descriptions.Item>
                                </Descriptions>
                            </Cards>

                            <Cards
                                title="Medicação Ativa"
                                style={{ marginTop: 25 }}
                                headless={false}
                                extra={
                                    child && (
                                        <Button size="small" type="primary" onClick={openAddMedicationModal}>
                                            Adicionar medicação
                                        </Button>
                                    )
                                }
                            >
                                <List
                                    itemLayout="horizontal"
                                    dataSource={medications}
                                    locale={{
                                        emptyText: child ? (
                                            <div style={{ textAlign: 'center' }}>
                                                <p style={{ marginBottom: 8 }}>
                                                    Nenhuma medicação registrada para esta criança.
                                                </p>
                                                <Button
                                                    size="small"
                                                    type="primary"
                                                    onClick={openAddMedicationModal}
                                                >
                                                    Adicionar medicação
                                                </Button>
                                            </div>
                                        ) : (
                                            'Nenhuma medicação registrada'
                                        ),
                                    }}
                                    renderItem={(item) => (
                                        <List.Item
                                            actions={[
                                                <Button
                                                    key="edit"
                                                    size="small"
                                                    type="link"
                                                    onClick={() => openEditMedicationModal(item)}
                                                >
                                                    Editar
                                                </Button>
                                            ]}
                                        >
                                            <List.Item.Meta
                                                avatar={
                                                    <Avatar
                                                        style={{ backgroundColor: '#87d068' }}
                                                        children={item.med_name
                                                            ?.substring(0, 1)
                                                            .toUpperCase()}
                                                    />
                                                }
                                                title={item.med_name}
                                                description={`${item.dosage || ''} ${
                                                    item.schedule ? `- ${item.schedule}` : ''
                                                } ${item.frequency ? `(${item.frequency})` : ''}`}
                                            />
                                            <Tag>{item.status}</Tag>
                                        </List.Item>
                                    )}
                                />
                            </Cards>

                            {child && (
                                <Cards title="Arquivos de Prontuário" style={{ marginTop: 25 }} headless={false}>
                                    <Row gutter={16}>
                                        <Col span={24}>
                                            <p>
                                                <strong>Laudo médico:</strong>{' '}
                                                {child.report_url ? (
                                                    <a
                                                        href={child.report_url}
                                                        target="_blank"
                                                        rel="noreferrer"
                                                    >
                                                        Ver arquivo
                                                    </a>
                                                ) : (
                                                    'Não anexado'
                                                )}
                                            </p>
                                            <Upload {...getUploadProps('report')}>
                                                <Button size="small">Enviar Laudo</Button>
                                            </Upload>
                                        </Col>
                                        <Col span={24} style={{ marginTop: 16 }}>
                                            <p>
                                                <strong>Documento da criança (RG/CPF):</strong>{' '}
                                                {child.child_id_url ? (
                                                    <a
                                                        href={child.child_id_url}
                                                        target="_blank"
                                                        rel="noreferrer"
                                                    >
                                                        Ver arquivo
                                                    </a>
                                                ) : (
                                                    'Não anexado'
                                                )}
                                            </p>
                                            <Upload {...getUploadProps('child_id')}>
                                                <Button size="small">Enviar Documento</Button>
                                            </Upload>
                                        </Col>
                                        <Col span={24} style={{ marginTop: 16 }}>
                                            <p>
                                                <strong>Cartão de vacinação:</strong>{' '}
                                                {child.vaccination_card_url ? (
                                                    <a
                                                        href={child.vaccination_card_url}
                                                        target="_blank"
                                                        rel="noreferrer"
                                                    >
                                                        Ver arquivo
                                                    </a>
                                                ) : (
                                                    'Não anexado'
                                                )}
                                            </p>
                                            <Upload {...getUploadProps('vaccination')}>
                                                <Button size="small">Enviar Cartão</Button>
                                            </Upload>
                                        </Col>
                                        <Col span={24} style={{ marginTop: 16 }}>
                                            <p>
                                                <strong>Histórico escolar:</strong>{' '}
                                                {child.school_history_url ? (
                                                    <a
                                                        href={child.school_history_url}
                                                        target="_blank"
                                                        rel="noreferrer"
                                                    >
                                                        Ver arquivo
                                                    </a>
                                                ) : (
                                                    'Não anexado'
                                                )}
                                            </p>
                                            <Upload {...getUploadProps('school')}>
                                                <Button size="small">Enviar Histórico</Button>
                                            </Upload>
                                        </Col>
                                    </Row>
                                </Cards>
                            )}
                        </Col>
                        <Col xs={24} md={16}>
                            <Cards title="Linha do Tempo Multidisciplinar" headless={false}>
                                {evolutions.length === 0 ? (
                                    <p>Nenhuma evolução registrada ainda.</p>
                                ) : (
                                    <Timeline mode="left">
                                        {evolutions.map((evo) => {
                                            const prof = evo.professional_id
                                                ? professionalMap[evo.professional_id]
                                                : null;
                                            return (
                                                <Timeline.Item
                                                    key={evo.id}
                                                    label={dayjs(evo.date_service).format(
                                                        'DD/MM/YYYY HH:mm'
                                                    )}
                                                    color="blue"
                                                >
                                                    <p>
                                                        <strong>{evo.service_type}</strong>
                                                    </p>
                                                    {prof && (
                                                        <p>
                                                            <small>
                                                                Profissional: {prof.name}
                                                                {prof.registry_number
                                                                    ? ` (${prof.registry_number})`
                                                                    : ''}
                                                            </small>
                                                        </p>
                                                    )}
                                                    <p>{evo.evolution_report}</p>
                                                    {evo.protocol_scores && (
                                                        <p>
                                                            <small>
                                                                Escalas / Avaliação:{' '}
                                                                {evo.protocol_scores}
                                                            </small>
                                                        </p>
                                                    )}
                                                    {evo.intermittences && (
                                                        <p style={{ color: 'red' }}>
                                                            <small>
                                                                Intercorrência: {evo.intermittences}
                                                            </small>
                                                        </p>
                                                    )}
                                                </Timeline.Item>
                                            );
                                        })}
                                    </Timeline>
                                )}
                            </Cards>

                            <Cards
                                title="Registrar Evolução deste Atendimento"
                                style={{ marginTop: 24 }}
                                headless={false}
                            >
                                <Form form={form} layout="vertical" onFinish={handleFinish}>
                                    <Form.Item
                                        name="service_type"
                                        label="Tipo de atendimento"
                                        rules={[{ required: true, message: 'Obrigatório' }]}
                                    >
                                        <Select placeholder="Selecione o tipo de atendimento">
                                            <Option value="Fisioterapia">Fisioterapia</Option>
                                            <Option value="Psicologia">Psicologia</Option>
                                            <Option value="Fonoaudiologia">Fonoaudiologia</Option>
                                            <Option value="Terapia Ocupacional">
                                                Terapia Ocupacional
                                            </Option>
                                            <Option value="Pedagogia">Pedagogia</Option>
                                            <Option value="Médico">Médico</Option>
                                        </Select>
                                    </Form.Item>
                                    <Form.Item name="weight" label="Peso atual (kg)">
                                        <Input type="number" />
                                    </Form.Item>
                                    <Form.Item name="height" label="Altura atual (cm)">
                                        <Input type="number" />
                                    </Form.Item>
                                    <Form.Item
                                        name="cephalic_perimeter"
                                        label="Perímetro Cefálico (cm)"
                                    >
                                        <Input type="number" />
                                    </Form.Item>
                                    <Form.Item
                                        name="protocol_scores"
                                        label={
                                            <span>
                                                Escalas / Avaliação do Desenvolvimento{' '}
                                                <Tooltip title="Registre aqui resultados de escalas padronizadas (ex: Denver II, ABAS, Vineland) e outras avaliações quantitativas do desenvolvimento.">
                                                    <span
                                                        style={{
                                                            cursor: 'help',
                                                            borderBottom: '1px dotted #999',
                                                            display: 'inline-block',
                                                            width: 16,
                                                            textAlign: 'center'
                                                        }}
                                                    >
                                                        ?
                                                    </span>
                                                </Tooltip>
                                            </span>
                                        }
                                    >
                                        <TextArea rows={3} />
                                    </Form.Item>
                                    <Form.Item
                                        name="evolution_report"
                                        label="Relato de Evolução"
                                        rules={[{ required: true, message: 'Obrigatório' }]}
                                    >
                                        <TextArea
                                            rows={6}
                                            placeholder="Descreva a evolução do paciente..."
                                        />
                                    </Form.Item>
                                    <Form.Item name="intermittences" label="Intercorrências">
                                        <TextArea rows={2} />
                                    </Form.Item>
                                    <Form.Item name="notes" label="Observações Administrativas">
                                        <Input />
                                    </Form.Item>
                                    <Divider />
                                    <Button type="primary" htmlType="submit" size="large">
                                        Finalizar Atendimento
                                    </Button>
                                </Form>
                            </Cards>
                        </Col>
                    </Row>
                    <Modal
                        title={editingMedication ? 'Editar medicação' : 'Adicionar medicação'}
                        open={isMedModalOpen}
                        onOk={handleSaveMedication}
                        onCancel={() => setIsMedModalOpen(false)}
                        destroyOnClose
                    >
                        <Form form={medForm} layout="vertical">
                            <Form.Item
                                name="med_name"
                                label="Nome do Medicamento"
                                rules={[{ required: true, message: 'Obrigatório' }]}
                            >
                                <Input />
                            </Form.Item>
                            <Form.Item name="dosage" label="Dosagem">
                                <Input placeholder="Ex: 5ml" />
                            </Form.Item>
                            <Form.Item name="schedule" label="Horários">
                                <Input placeholder="Ex: 8h, 16h, 22h" />
                            </Form.Item>
                            <Form.Item name="frequency" label="Frequência">
                                <Input placeholder="Ex: 1x ao dia" />
                            </Form.Item>
                            <Form.Item name="status" label="Status" initialValue="continuo">
                                <Select>
                                    <Option value="continuo">Contínuo</Option>
                                    <Option value="sos">SOS (Se necessário)</Option>
                                    <Option value="interrompido">Interrompido</Option>
                                </Select>
                            </Form.Item>
                        </Form>
                    </Modal>
                </Cards>
            </Main>
        </>
    );
}

export default withAdminLayoutNext(AttendancePage);
