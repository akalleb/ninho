'use client';
import React, { useState, useEffect } from 'react';
import { Row, Col, Card, Tag, Button, Timeline, Statistic, Modal, Form, Input, Select, DatePicker, message, List, Avatar, Empty, Upload } from 'antd';
import { useSelector } from 'react-redux';
import FeatherIcon from 'feather-icons-react';
import { useRouter, useSearchParams } from 'next/navigation';
import { PageHeader } from '../../../components/page-headers/page-headers';
import { Main } from '../../styled';
import api from '../../../config/api/axios';
import dayjs from 'dayjs';

const { TextArea } = Input;
const { Option } = Select;

function ChildDashboard({ params }) {
  // Since this is a client component wrapper in nextjs app dir, we might get params from props or use hook
  // But standard pattern here: we will use a prop passed from page.js or use useParams if needed.
  // Assuming page.js passes childId.
  const childId = params?.id; 
  
  const [child, setChild] = useState(null);
  const [evolutions, setEvolutions] = useState([]);
  const [medications, setMedications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [professionalMap, setProfessionalMap] = useState({});
  
  // Modal States
  const [isEvoModalOpen, setIsEvoModalOpen] = useState(false);
  const [isMedModalOpen, setIsMedModalOpen] = useState(false);
  const [formEvo] = Form.useForm();
  const [formMed] = Form.useForm();

  const router = useRouter();

  const authState = useSelector((state) => state.auth.login);
  const authUser = typeof authState === 'object' && authState ? authState : null;

  const fetchData = async () => {
      setLoading(true);
      try {
          const [childRes, evoRes, medRes] = await Promise.all([
              api.get(`/children/${childId}`),
              api.get(`/children/${childId}/evolutions`),
              api.get(`/children/${childId}/medications`)
          ]);
          setChild(childRes.data);
          setEvolutions(evoRes.data);
          setMedications(medRes.data);
      } catch (error) {
          message.error("Erro ao carregar prontuário.");
      } finally {
          setLoading(false);
      }
  };

  useEffect(() => {
      if (childId) fetchData();
  }, [childId]);

  useEffect(() => {
      const fetchProfessionals = async () => {
          const ids = Array.from(
              new Set(
                  evolutions
                      .map((e) => e.professional_id)
                      .filter((id) => id && !professionalMap[id])
              )
          );
          if (!ids.length) return;
          try {
              const results = await Promise.all(
                  ids.map((id) =>
                      api
                          .get(`/professionals/${id}`)
                          .then((res) => [id, res.data])
                          .catch(() => null)
                  )
              );
              const newMap = {};
              results.forEach((entry) => {
                  if (entry && entry[1]) {
                      const [id, prof] = entry;
                      newMap[id] = prof;
                  }
              });
              if (Object.keys(newMap).length) {
                  setProfessionalMap((prev) => ({ ...prev, ...newMap }));
              }
          } catch (error) {
          }
      };
      if (evolutions && evolutions.length) {
          fetchProfessionals();
      }
  }, [evolutions, professionalMap]);

  const handleAddEvolution = async () => {
      try {
          const values = await formEvo.validateFields();
          const professionalId =
              authUser && authUser.id && authUser.role === 'health' ? authUser.id : null;
          await api.post(`/children/${childId}/evolutions`, {
              ...values,
              child_id: parseInt(childId, 10),
              professional_id: professionalId
          });
          message.success("Evolução registrada!");
          setIsEvoModalOpen(false);
          formEvo.resetFields();
          fetchData(); // Refresh timeline
      } catch (e) {
          console.error('Erro ao registrar evolução', e?.response?.data || e);
          message.error("Erro ao registrar evolução.");
      }
  };

  const handleAddMedication = async () => {
      try {
          const values = await formMed.validateFields();
          await api.post(`/children/${childId}/medications`, {
              ...values,
              child_id: parseInt(childId)
          });
          message.success("Medicação adicionada!");
          setIsMedModalOpen(false);
          formMed.resetFields();
          fetchData(); 
      } catch (e) {
           // Error
      }
  };

  if (loading) return <div style={{ padding: 24 }}>Carregando prontuário...</div>;
  if (!child) return <div style={{ padding: 24 }}>Criança não encontrada.</div>;

  let assistanceNeeds = [];
  if (typeof child.assistance_needs === 'string') {
    try {
      const parsed = JSON.parse(child.assistance_needs);
      assistanceNeeds = Array.isArray(parsed) ? parsed : [];
    } catch {
      assistanceNeeds = child.assistance_needs ? [child.assistance_needs] : [];
    }
  }

  const getUploadProps = (docType) => ({
    name: 'file',
    action: `${api.defaults.baseURL}/children/${childId}/docs?doc_type=${docType}`,
    onChange(info) {
      if (info.file.status === 'done') {
        message.success(`${info.file.name} enviado com sucesso`);
        fetchData();
      } else if (info.file.status === 'error') {
        message.error(`${info.file.name} falha no envio`);
      }
    },
    showUploadList: true,
  });

  return (
    <>
      <PageHeader
        ghost
        title={`Prontuário: ${child.name}`}
        subTitle={`Idade: ${dayjs().diff(dayjs(child.birth_date), 'year')} anos | Diagnóstico: ${child.diagnosis || 'Não inf.'}`}
        buttons={[
          <Button key="evo" type="primary" onClick={() => setIsEvoModalOpen(true)}>
            <FeatherIcon icon="file-plus" size={14} /> Registrar Evolução
          </Button>,
          <Button key="edit" onClick={() => router.push(`/admin/children/edit?id=${childId}`)}>
            Editar Dados
          </Button>
        ]}
      />
      <Main>
        <Row gutter={25}>
            {/* Left Column: Summary & Meds */}
            <Col xs={24} md={8}>
                <Card title="Resumo Clínico">
                    <p><strong>Responsável:</strong> {child.guardian_name || '-'}</p>
                    <p><strong>Sexo:</strong> {child.gender || '-'}</p>
                    <p>
                      <strong>Nível de Suporte:</strong>{' '}
                      {child.severity_level ? (
                        <Tag color={child.severity_level === 'grave' ? 'red' : child.severity_level === 'media' ? 'orange' : 'green'}>
                          {child.severity_level}
                        </Tag>
                      ) : (
                        '-'
                      )}
                    </p>
                    <p>
                      <strong>Diagnóstico fechado:</strong>{' '}
                      {child.is_diagnosis_closed ? 'Sim' : 'Em investigação'}
                    </p>
                    <p><strong>Tipo Sanguíneo:</strong> {child.blood_type || '-'}</p>
                    <p>
                      <strong>Peso atual:</strong>{' '}
                      {child.weight != null ? `${child.weight} kg` : '-'}
                    </p>
                    <p>
                      <strong>Altura:</strong>{' '}
                      {child.height != null ? `${child.height} cm` : '-'}
                    </p>
                    <p>
                      <strong>Perímetro Cefálico:</strong>{' '}
                      {child.cephalic_perimeter != null ? `${child.cephalic_perimeter} cm` : '-'}
                    </p>
                    <p><strong>Alergias:</strong> {child.allergies || 'Nenhuma relatada'}</p>
                    <p><strong>Histórico Gestacional:</strong> {child.gestational_history || '-'}</p>
                    <p><strong>Emergência:</strong> {child.emergency_contact || '-'}</p>
                    <p>
                      <strong>Necessidades específicas:</strong>{' '}
                      {assistanceNeeds.length ? assistanceNeeds.join(', ') : 'Não informado'}
                    </p>
                    <p>
                      <strong>Acesso a tratamento/terapia:</strong>{' '}
                      {child.has_access_treatment ? 'Sim' : 'Não'}
                      {!child.has_access_treatment && child.difficulty_reason ? ` - ${child.difficulty_reason}` : ''}
                    </p>
                </Card>

                <Card 
                    title="Medicação Ativa" 
                    style={{ marginTop: 25 }}
                    extra={<Button size="small" onClick={() => setIsMedModalOpen(true)}>+</Button>}
                >
                    <List
                        itemLayout="horizontal"
                        dataSource={medications}
                        locale={{ emptyText: 'Nenhuma medicação registrada' }}
                        renderItem={item => (
                            <List.Item>
                                <List.Item.Meta
                                    avatar={<Avatar style={{ backgroundColor: '#87d068' }} icon={<FeatherIcon icon="activity" size={12} />} />}
                                    title={item.med_name}
                                    description={`${item.dosage || ''} - ${item.schedule || ''}`}
                                />
                                <Tag>{item.status}</Tag>
                            </List.Item>
                        )}
                    />
                </Card>

                <Card title="Documentos da Criança" style={{ marginTop: 25 }}>
                  <Row gutter={16}>
                    <Col span={24}>
                      <p>
                        <strong>Laudo médico:</strong>{' '}
                        {child.report_url ? (
                          <a href={child.report_url} target="_blank" rel="noreferrer">
                            Ver arquivo
                          </a>
                        ) : (
                          'Não anexado'
                        )}
                      </p>
                      <Upload {...getUploadProps('report')}>
                        <Button size="small" icon={<FeatherIcon icon="upload" size={14} />}>
                          Enviar Laudo
                        </Button>
                      </Upload>
                    </Col>
                    <Col span={24} style={{ marginTop: 16 }}>
                      <p>
                        <strong>Documento da criança (RG/CPF):</strong>{' '}
                        {child.child_id_url ? (
                          <a href={child.child_id_url} target="_blank" rel="noreferrer">
                            Ver arquivo
                          </a>
                        ) : (
                          'Não anexado'
                        )}
                      </p>
                      <Upload {...getUploadProps('child_id')}>
                        <Button size="small" icon={<FeatherIcon icon="upload" size={14} />}>
                          Enviar Documento
                        </Button>
                      </Upload>
                    </Col>
                    <Col span={24} style={{ marginTop: 16 }}>
                      <p>
                        <strong>Cartão de vacinação:</strong>{' '}
                        {child.vaccination_card_url ? (
                          <a href={child.vaccination_card_url} target="_blank" rel="noreferrer">
                            Ver arquivo
                          </a>
                        ) : (
                          'Não anexado'
                        )}
                      </p>
                      <Upload {...getUploadProps('vaccination')}>
                        <Button size="small" icon={<FeatherIcon icon="upload" size={14} />}>
                          Enviar Cartão
                        </Button>
                      </Upload>
                    </Col>
                    <Col span={24} style={{ marginTop: 16 }}>
                      <p>
                        <strong>Histórico escolar:</strong>{' '}
                        {child.school_history_url ? (
                          <a href={child.school_history_url} target="_blank" rel="noreferrer">
                            Ver arquivo
                          </a>
                        ) : (
                          'Não anexado'
                        )}
                      </p>
                      <Upload {...getUploadProps('school')}>
                        <Button size="small" icon={<FeatherIcon icon="upload" size={14} />}>
                          Enviar Histórico
                        </Button>
                      </Upload>
                    </Col>
                  </Row>
                </Card>
            </Col>

            {/* Right Column: Timeline */}
            <Col xs={24} md={16}>
                <Card title="Linha do Tempo Multidisciplinar">
                    {evolutions.length === 0 ? (
                        <Empty description="Nenhuma evolução registrada ainda" />
                    ) : (
                        <Timeline mode="left">
                            {evolutions.map(evo => {
                                const prof = evo.professional_id ? professionalMap[evo.professional_id] : null;
                                return (
                                    <Timeline.Item 
                                        key={evo.id} 
                                        label={dayjs(evo.date_service).format('DD/MM/YYYY HH:mm')}
                                        color="blue"
                                    >
                                        <p><strong>{evo.service_type}</strong></p>
                                        {prof && (
                                          <p>
                                            <small>
                                              Profissional: {prof.name}
                                              {prof.registry_number ? ` (${prof.registry_number})` : ''}
                                            </small>
                                          </p>
                                        )}
                                        <p>{evo.evolution_report}</p>
                                        {evo.protocol_scores && (
                                          <p>
                                            <small>Escalas / Avaliação: {evo.protocol_scores}</small>
                                          </p>
                                        )}
                                        {evo.intermittences && (
                                          <p style={{ color: 'red' }}>
                                            <small>Intercorrência: {evo.intermittences}</small>
                                          </p>
                                        )}
                                    </Timeline.Item>
                                );
                            })}
                        </Timeline>
                    )}
                </Card>
            </Col>
        </Row>

        {/* Modal: Add Evolution */}
        <Modal 
            title="Registrar Evolução" 
            open={isEvoModalOpen} 
            onOk={handleAddEvolution} 
            onCancel={() => setIsEvoModalOpen(false)}
        >
            <Form form={formEvo} layout="vertical">
                <Form.Item name="service_type" label="Especialidade" rules={[{ required: true }]}>
                    <Select>
                        <Option value="Fisioterapia">Fisioterapia</Option>
                        <Option value="Psicologia">Psicologia</Option>
                        <Option value="Fonoaudiologia">Fonoaudiologia</Option>
                        <Option value="Terapia Ocupacional">Terapia Ocupacional</Option>
                        <Option value="Pedagogia">Pedagogia</Option>
                        <Option value="Médico">Médico</Option>
                    </Select>
                </Form.Item>
                <Form.Item name="evolution_report" label="Relato da Evolução" rules={[{ required: true }]}>
                    <TextArea rows={4} />
                </Form.Item>
                <Form.Item name="protocol_scores" label="Escalas / Avaliação (Opcional)">
                    <TextArea rows={2} />
                </Form.Item>
                <Form.Item name="intermittences" label="Intercorrências (Opcional)">
                    <TextArea rows={2} />
                </Form.Item>
            </Form>
        </Modal>

        {/* Modal: Add Medication */}
        <Modal 
            title="Adicionar Medicação" 
            open={isMedModalOpen} 
            onOk={handleAddMedication} 
            onCancel={() => setIsMedModalOpen(false)}
        >
            <Form form={formMed} layout="vertical">
                <Form.Item name="med_name" label="Nome do Medicamento" rules={[{ required: true }]}>
                    <Input />
                </Form.Item>
                <Form.Item name="dosage" label="Dosagem">
                    <Input placeholder="Ex: 5ml" />
                </Form.Item>
                <Form.Item name="schedule" label="Horários">
                    <Input placeholder="Ex: 8h, 16h, 22h" />
                </Form.Item>
                <Form.Item name="status" label="Status">
                    <Select defaultValue="continuo">
                        <Option value="continuo">Contínuo</Option>
                        <Option value="sos">SOS (Se necessário)</Option>
                        <Option value="interrompido">Interrompido</Option>
                    </Select>
                </Form.Item>
            </Form>
        </Modal>
      </Main>
    </>
  );
}

export default ChildDashboard;
