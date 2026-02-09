'use client';
import React, { useState, useEffect } from 'react';
import { Row, Col, Card, Tag, Button, Timeline, Statistic, Modal, Form, Input, Select, DatePicker, message, List, Avatar, Empty, Upload, Descriptions } from 'antd';
import { useSelector } from 'react-redux';
import FeatherIcon from 'feather-icons-react';
import { useRouter, useSearchParams } from 'next/navigation';
import { Main } from '../../styled';
import { Cards } from '../../../components/cards/frame/cards-frame';
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
  const [editingMedication, setEditingMedication] = useState(null);
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

          let protocolScores = values.protocol_scores || '';
          const biometricsParts = [];
          if (values.weight != null) biometricsParts.push(`Peso: ${values.weight} kg`);
          if (values.height != null) biometricsParts.push(`Altura: ${values.height} cm`);
          if (values.cephalic_perimeter != null) biometricsParts.push(`PC: ${values.cephalic_perimeter} cm`);
          if (biometricsParts.length) {
              const biometricsText = `Biometria atual - ${biometricsParts.join(' | ')}`;
              protocolScores = protocolScores ? `${protocolScores}\n${biometricsText}` : biometricsText;
          }

          await api.post(`/children/${childId}/evolutions`, {
              service_type: values.service_type,
              evolution_report: values.evolution_report,
              intermittences: values.intermittences,
              protocol_scores: protocolScores,
              child_id: parseInt(childId, 10),
              professional_id: professionalId
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
              await api.put(`/children/${childId}`, updatedChild);
          }

          message.success("Evolução registrada!");
          setIsEvoModalOpen(false);
          formEvo.resetFields();
          fetchData(); 
      } catch (e) {
          console.error('Erro ao registrar evolução', e?.response?.data || e);
          message.error("Erro ao registrar evolução.");
      }
  };

  const openAddMedicationModal = () => {
      setEditingMedication(null);
      formMed.resetFields();
      setIsMedModalOpen(true);
  };

  const openEditMedicationModal = (med) => {
      setEditingMedication(med);
      formMed.setFieldsValue({
          med_name: med.med_name,
          dosage: med.dosage,
          schedule: med.schedule,
          frequency: med.frequency,
          status: med.status || 'continuo',
      });
      setIsMedModalOpen(true);
  };

  const handleSaveMedication = async () => {
      try {
          const values = await formMed.validateFields();
          const professionalId =
              authUser && authUser.id && authUser.role === 'health' ? authUser.id : null;

          if (editingMedication) {
              await api.put(`/medications/${editingMedication.id}`, values);
              message.success("Medicação atualizada!");
          } else {
              await api.post(`/children/${childId}/medications`, {
                  ...values,
                  child_id: parseInt(childId, 10),
              });
              message.success("Medicação adicionada!");
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

          await api.post(`/children/${childId}/evolutions`, {
              service_type: 'Medicação',
              evolution_report: evolutionReport,
              intermittences: null,
              protocol_scores: null,
              child_id: parseInt(childId, 10),
              professional_id: professionalId
          });

          setIsMedModalOpen(false);
          formMed.resetFields();
          fetchData(); 
      } catch (e) {
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
      <Main>
        <Cards
            title={`Prontuário: ${child.name}`}
            // subTitle={`Idade: ${dayjs().diff(dayjs(child.birth_date), 'year')} anos | Diagnóstico: ${child.diagnosis || 'Não inf.'}`}
            extra={
                <div style={{ display: 'flex', gap: 10 }}>
                    <Button key="evo" type="primary" onClick={() => setIsEvoModalOpen(true)}>
                        <FeatherIcon icon="file-plus" size={14} /> Registrar Evolução
                    </Button>
                    <Button key="edit" onClick={() => router.push(`/admin/children/edit?id=${childId}`)}>
                        Editar Dados
                    </Button>
                </div>
            }
        >
            <Row gutter={25}>
                {/* Left Column: Summary & Meds */}
                <Col xs={24} md={8}>
                    <Cards title="Resumo Clínico" headless={false}>
                        <Descriptions column={1} layout="vertical">
                            <Descriptions.Item label="Responsável">{child.guardian_name || '-'}</Descriptions.Item>
                            <Descriptions.Item label="Sexo">{child.gender || '-'}</Descriptions.Item>
                            <Descriptions.Item label="Nível de Suporte">
                                {child.severity_level ? (() => {
                                    let text = '';
                                    let backgroundColor = '#f5f5f5';
                                    let color = '#595959';
                                    let borderColor = 'transparent';

                                    if (child.severity_level === 'leve') {
                                        text = 'Leve (Nível 1)';
                                        backgroundColor = '#f6ffed';
                                        color = '#135200';
                                        borderColor = '#b7eb8f';
                                    }
                                    if (child.severity_level === 'media') {
                                        text = 'Moderado (Nível 2)';
                                        backgroundColor = '#fff7e6';
                                        color = '#ad4e00';
                                        borderColor = '#ffd591';
                                    }
                                    if (child.severity_level === 'grave') {
                                        text = 'Grave (Nível 3)';
                                        backgroundColor = '#fff1f0';
                                        color = '#a8071a';
                                        borderColor = '#ffa39e';
                                    }

                                    return (
                                      <Tag
                                        style={{
                                          minWidth: 140,
                                          textAlign: 'center',
                                          fontSize: 12,
                                          fontWeight: 600,
                                          padding: '2px 12px',
                                          borderRadius: 14,
                                          backgroundColor,
                                          color,
                                          border: `1px solid ${borderColor}`,
                                        }}
                                      >
                                        {text}
                                      </Tag>
                                    );
                                })() : '-'}
                            </Descriptions.Item>
                            <Descriptions.Item label="Diagnóstico fechado">{child.is_diagnosis_closed ? 'Sim' : 'Em investigação'}</Descriptions.Item>
                            <Descriptions.Item label="Tipo Sanguíneo">{child.blood_type || '-'}</Descriptions.Item>
                            <Descriptions.Item label="Peso atual">{child.weight != null ? `${child.weight} kg` : '-'}</Descriptions.Item>
                            <Descriptions.Item label="Altura">{child.height != null ? `${child.height} cm` : '-'}</Descriptions.Item>
                            <Descriptions.Item label="Perímetro Cefálico">{child.cephalic_perimeter != null ? `${child.cephalic_perimeter} cm` : '-'}</Descriptions.Item>
                            <Descriptions.Item label="Alergias">{child.allergies || 'Nenhuma relatada'}</Descriptions.Item>
                            <Descriptions.Item label="Histórico Gestacional">
                                {child.gestational_history ? (
                                  <span style={{ fontSize: 13, fontWeight: 600 }}>
                                    {child.gestational_history}
                                  </span>
                                ) : '-'}
                            </Descriptions.Item>
                            <Descriptions.Item label="Emergência">{child.emergency_contact || '-'}</Descriptions.Item>
                            <Descriptions.Item label="Necessidades específicas">{assistanceNeeds.length ? assistanceNeeds.join(', ') : 'Não informado'}</Descriptions.Item>
                            <Descriptions.Item label="Acesso a tratamento/terapia">
                                {child.has_access_treatment ? 'Sim' : 'Não'}
                                {!child.has_access_treatment && child.difficulty_reason ? ` - ${child.difficulty_reason}` : ''}
                            </Descriptions.Item>
                        </Descriptions>
                    </Cards>

                    <Cards 
                        title="Medicação Ativa" 
                        style={{ marginTop: 25 }}
                        headless={false}
                        extra={
                          <Button size="small" type="primary" onClick={openAddMedicationModal}>
                            Adicionar medicação
                          </Button>
                        }
                    >
                        <List
                            itemLayout="horizontal"
                            dataSource={medications}
                            locale={{ emptyText: 'Nenhuma medicação registrada' }}
                            renderItem={item => (
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
                                        avatar={<Avatar style={{ backgroundColor: '#87d068' }} icon={<FeatherIcon icon="activity" size={12} />} />}
                                        title={item.med_name}
                                        description={`${item.dosage || ''} ${item.schedule ? `- ${item.schedule}` : ''} ${item.frequency ? `(${item.frequency})` : ''}`}
                                    />
                                    <Tag>{item.status}</Tag>
                                </List.Item>
                            )}
                        />
                    </Cards>

                    <Cards title="Documentos da Criança" style={{ marginTop: 25 }} headless={false}>
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
                    </Cards>
                </Col>

                {/* Right Column: Timeline */}
                <Col xs={24} md={16}>
                    <Cards title="Linha do Tempo Multidisciplinar" headless={false}>
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
                    </Cards>
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
                    <Form.Item name="weight" label="Peso atual (kg)">
                        <Input type="number" />
                    </Form.Item>
                    <Form.Item name="height" label="Altura atual (cm)">
                        <Input type="number" />
                    </Form.Item>
                    <Form.Item name="cephalic_perimeter" label="Perímetro Cefálico (cm)">
                        <Input type="number" />
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

            {/* Modal: Add/Edit Medication */}
            <Modal 
                title={editingMedication ? "Editar Medicação" : "Adicionar Medicação"} 
                open={isMedModalOpen} 
                onOk={handleSaveMedication} 
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

export default ChildDashboard;
