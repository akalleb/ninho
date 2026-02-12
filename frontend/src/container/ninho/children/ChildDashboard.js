'use client';
import React, { useState, useEffect } from 'react';
import { Row, Col, Card, Tag, Button, Timeline, Statistic, Modal, Form, Input, Select, DatePicker, message, List, Avatar, Empty, Upload, Descriptions } from 'antd';
import { useSelector } from 'react-redux';
import FeatherIcon from 'feather-icons-react';
import { useRouter, useSearchParams } from 'next/navigation';
import dynamic from 'next/dynamic';
import { Main } from '../../styled';
import { Cards } from '../../../components/cards/frame/cards-frame';
import api from '../../../config/api/axios';
import dayjs from 'dayjs';

const Chart = dynamic(() => import('react-apexcharts'), { ssr: false });

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

  const formatTagText = (text) => {
    if (!text) return '-';
    // Mapeamento manual para termos conhecidos para garantir acentuação correta
    const termMap = {
      'tratamento_medico': 'Tratamento Médico',
      'alimentacao_especifica': 'Alimentação Específica',
      'acompanhamento_escolar': 'Acompanhamento Escolar',
      'transporte': 'Transporte',
      'medicacao': 'Medicação',
      'fisioterapia': 'Fisioterapia',
      'fonoaudiologia': 'Fonoaudiologia',
      'terapia_ocupacional': 'Terapia Ocupacional',
      'psicologia': 'Psicologia'
    };
    
    if (termMap[text]) return termMap[text];

    // Fallback: remove underscore e capitaliza
    return text
        .split('_')
        .map(word => word.charAt(0).toUpperCase() + word.slice(1))
        .join(' ');
  };

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
              authUser && authUser.professional_id && authUser.role === 'health' ? authUser.professional_id : null;

          let protocolScores = values.protocol_scores || '';
          const biometricsParts = [];
          if (values.weight != null) biometricsParts.push(`Peso: ${values.weight} kg`);
          if (values.height != null) biometricsParts.push(`Altura: ${values.height} cm`);
          if (values.cephalic_perimeter != null) biometricsParts.push(`PC: ${values.cephalic_perimeter} cm`);
          
          if (biometricsParts.length) {
              const biometricsText = `Biometria atual - ${biometricsParts.join(' | ')}`;
              protocolScores = protocolScores ? `${protocolScores}\n${biometricsText}` : biometricsText;
          }

          // Adicionar medicação ao campo protocol_scores ou evolution_report se preenchido
          if (values.new_medication) {
              const medText = `Prescrição: ${values.new_medication}`;
              protocolScores = protocolScores ? `${protocolScores}\n${medText}` : medText;
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
              authUser && authUser.professional_id && authUser.role === 'health' ? authUser.professional_id : null;

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

          // Removendo a criação automática de evolução separada para medicação
          // O registro deve ser feito dentro da evolução médica se desejado.
          /*
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
          */

          setIsMedModalOpen(false);
          formMed.resetFields();
          fetchData(); 
      } catch (e) {
      }
  };

  // Extract biometric data for charts
  const biometricData = React.useMemo(() => {
    const data = [];
    const sortedEvos = [...evolutions].sort((a, b) => new Date(a.date_service) - new Date(b.date_service));

    sortedEvos.forEach(evo => {
        const scores = evo.protocol_scores || '';
        const weightMatch = scores.match(/Peso: (\d+(\.\d+)?) kg/);
        const heightMatch = scores.match(/Altura: (\d+(\.\d+)?) cm/);

        if (weightMatch) {
            const weight = parseFloat(weightMatch[1]);
            let height = null;
            let imc = null;

            if (heightMatch) {
                height = parseFloat(heightMatch[1]);
                if (height > 0) {
                    const heightM = height / 100;
                    imc = parseFloat((weight / (heightM * heightM)).toFixed(2));
                }
            }

            data.push({
                date: dayjs(evo.date_service).format('DD/MM/YYYY'),
                weight,
                height,
                imc
            });
        }
    });
    return data;
  }, [evolutions]);

  const chartOptions = {
    chart: {
      id: 'biometrics-chart',
      toolbar: { show: false },
      zoom: { enabled: false }
    },
    stroke: {
      curve: 'smooth',
      width: 3
    },
    colors: ['#5F63F2', '#FA8B0C'],
    xaxis: {
      categories: biometricData.map(d => d.date),
      labels: {
          style: { colors: '#8C90A4', fontSize: '12px' }
      }
    },
    yaxis: [
      {
        title: { text: 'Peso (kg)', style: { color: '#5F63F2' } },
        labels: { style: { colors: '#5F63F2' } }
      },
      {
        opposite: true,
        title: { text: 'IMC', style: { color: '#FA8B0C' } },
        labels: { style: { colors: '#FA8B0C' } }
      }
    ],
    dataLabels: { enabled: true },
    legend: { position: 'top' },
    tooltip: {
        shared: true,
        intersect: false,
    }
  };

  const chartSeries = [
    {
      name: 'Peso (kg)',
      data: biometricData.map(d => d.weight)
    },
    {
      name: 'IMC',
      data: biometricData.map(d => d.imc)
    }
  ];

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

  const getFileUrl = (url) => {
    if (!url) return null;
    if (url.startsWith('http')) return url;
    // Remove duplicate slash if present
    const cleanUrl = url.startsWith('/') ? url : `/${url}`;
    return `${api.defaults.baseURL}${cleanUrl}`.replace('/api/v1', '');
  };

  const renderFileLink = (url) => {
    const fullUrl = getFileUrl(url);
    if (!fullUrl) return 'Não anexado';
    
    return (
      <a href={fullUrl} target="_blank" rel="noreferrer">
        Ver arquivo
      </a>
    );
  };

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
                    <Cards title="Resumo Clínico" headless={false} bodyStyle={{ padding: '12px 24px' }}>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                            {/* Bloco Principal: Diagnóstico e Suporte */}
                            <div style={{ background: '#f8f9fb', padding: '12px', borderRadius: '8px', border: '1px solid #e3e6ef' }}>
                                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
                                    <span style={{ fontSize: '12px', color: '#8c8c8c', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Diagnóstico</span>
                                    {child.is_diagnosis_closed ? 
                                        <Tag color="success" style={{ margin: 0 }}>Fechado</Tag> : 
                                        <Tag color="warning" style={{ margin: 0 }}>Em investigação</Tag>
                                    }
                                </div>
                                <div style={{ fontSize: '15px', fontWeight: 600, color: '#272b41', marginBottom: '8px' }}>
                                    {child.diagnosis || 'Não informado'}
                                </div>
                                <div>
                                    {child.severity_level ? (() => {
                                        let text = '';
                                        let color = 'default';
                                        if (child.severity_level === 'leve') { text = 'Leve (Nível 1)'; color = 'green'; }
                                        if (child.severity_level === 'media') { text = 'Moderado (Nível 2)'; color = 'gold'; }
                                        if (child.severity_level === 'grave') { text = 'Grave (Nível 3)'; color = 'red'; }
                                        return <Tag color={color} style={{ width: '100%', textAlign: 'center', margin: 0 }}>{text}</Tag>;
                                    })() : <Tag style={{ width: '100%', textAlign: 'center', margin: 0 }}>Nível não informado</Tag>}
                                </div>
                            </div>

                            {/* Bloco de Dados Vitais (Grid 2x2) */}
                            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                                <div style={{ borderBottom: '1px solid #f0f0f0', paddingBottom: '8px' }}>
                                    <div style={{ fontSize: '11px', color: '#8c8c8c' }}>Peso</div>
                                    <div style={{ fontSize: '14px', fontWeight: 500 }}>{child.weight != null ? `${child.weight} kg` : '-'}</div>
                                </div>
                                <div style={{ borderBottom: '1px solid #f0f0f0', paddingBottom: '8px' }}>
                                    <div style={{ fontSize: '11px', color: '#8c8c8c' }}>Altura</div>
                                    <div style={{ fontSize: '14px', fontWeight: 500 }}>{child.height != null ? `${child.height} cm` : '-'}</div>
                                </div>
                                <div style={{ borderBottom: '1px solid #f0f0f0', paddingBottom: '8px' }}>
                                    <div style={{ fontSize: '11px', color: '#8c8c8c' }}>Perímetro Cef.</div>
                                    <div style={{ fontSize: '14px', fontWeight: 500 }}>{child.cephalic_perimeter != null ? `${child.cephalic_perimeter} cm` : '-'}</div>
                                </div>
                                <div style={{ borderBottom: '1px solid #f0f0f0', paddingBottom: '8px' }}>
                                    <div style={{ fontSize: '11px', color: '#8c8c8c' }}>Tipo Sang.</div>
                                    <div style={{ fontSize: '14px', fontWeight: 500 }}>{child.blood_type || '-'}</div>
                                </div>
                            </div>

                            {/* Lista de Informações Gerais */}
                            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                                <div>
                                    <div style={{ fontSize: '11px', color: '#8c8c8c', marginBottom: '2px' }}>Responsável</div>
                                    <div style={{ fontSize: '13px', color: '#272b41' }}>{child.guardian_name || '-'}</div>
                                </div>
                                <div>
                                    <div style={{ fontSize: '11px', color: '#8c8c8c', marginBottom: '2px' }}>Sexo</div>
                                    <div style={{ fontSize: '13px', color: '#272b41' }}>{child.gender || '-'}</div>
                                </div>
                                <div>
                                    <div style={{ fontSize: '11px', color: '#8c8c8c', marginBottom: '2px' }}>Emergência</div>
                                    <div style={{ fontSize: '13px', color: '#272b41' }}>{child.emergency_contact || '-'}</div>
                                </div>
                                <div>
                                    <div style={{ fontSize: '11px', color: '#8c8c8c', marginBottom: '2px' }}>Alergias</div>
                                    <div style={{ fontSize: '13px', color: '#272b41' }}>{child.allergies || '-'}</div>
                                </div>
                                <div>
                                    <div style={{ fontSize: '11px', color: '#8c8c8c', marginBottom: '2px' }}>Histórico Gestacional</div>
                                    <div style={{ fontSize: '13px', color: '#272b41' }}>{child.gestational_history || '-'}</div>
                                </div>
                            </div>

                            {/* Tags de Necessidades */}
                            <div>
                                <div style={{ fontSize: '11px', color: '#8c8c8c', marginBottom: '6px' }}>Necessidades Específicas</div>
                                {assistanceNeeds.length ? (
                                    <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px' }}>
                                        {assistanceNeeds.map((need, idx) => (
                                            <Tag key={idx} color="blue" style={{ margin: 0 }}>{formatTagText(need)}</Tag>
                                        ))}
                                    </div>
                                ) : <span style={{ fontSize: '13px' }}>-</span>}
                            </div>

                            {/* Acesso a Terapia */}
                            <div style={{ background: child.has_access_treatment ? '#f6ffed' : '#fff1f0', padding: '10px', borderRadius: '6px', border: `1px solid ${child.has_access_treatment ? '#b7eb8f' : '#ffa39e'}` }}>
                                <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                                    <span style={{ fontSize: '12px', fontWeight: 600, color: child.has_access_treatment ? '#135200' : '#a8071a' }}>
                                        Acesso a Terapia:
                                    </span>
                                    <span style={{ fontSize: '12px', color: child.has_access_treatment ? '#135200' : '#a8071a' }}>
                                        {child.has_access_treatment ? 'Sim' : 'Não'}
                                    </span>
                                </div>
                                {!child.has_access_treatment && child.difficulty_reason && (
                                    <div style={{ fontSize: '11px', color: '#cf1322', marginTop: '4px' }}>
                                        Obs: {child.difficulty_reason}
                                    </div>
                                )}
                            </div>
                        </div>
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
                            {renderFileLink(child.report_url)}
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
                            {renderFileLink(child.child_id_url)}
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
                            {renderFileLink(child.vaccination_card_url)}
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
                            {renderFileLink(child.school_history_url)}
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
                    {/* Charts Section */}
                    {biometricData.length > 0 && (
                        <div style={{ marginBottom: 25 }}>
                            <Cards title="Evolução de Peso e IMC" headless={false} bodyStyle={{ padding: '20px' }}>
                                <Chart
                                    options={chartOptions}
                                    series={chartSeries}
                                    type="line"
                                    height={300}
                                />
                            </Cards>
                        </div>
                    )}

                    <Cards title="Linha do Tempo Multidisciplinar" headless={false}>
                        {evolutions.length === 0 ? (
                            <Empty description="Nenhuma evolução registrada ainda" />
                        ) : (
                            <Timeline
                                mode="left"
                                items={evolutions.map(evo => {
                                    const prof = evo.professional_id ? professionalMap[evo.professional_id] : null;
                                    return {
                                        color: 'blue',
                                        children: (
                                            <div style={{ paddingBottom: 10 }}>
                                                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 4 }}>
                                                    <span style={{ fontSize: '12px', color: '#8c8c8c' }}>
                                                        {dayjs(evo.date_service).format('DD/MM/YYYY HH:mm')}
                                                    </span>
                                                    <strong style={{ fontSize: 15, color: '#5F63F2' }}>{evo.service_type}</strong>
                                                </div>
                                                
                                                {prof && (
                                                    <div style={{ fontSize: 12, color: '#666', marginBottom: 6 }}>
                                                        <FeatherIcon icon="user" size={12} style={{ marginRight: 4, verticalAlign: 'text-bottom' }} />
                                                        {prof.name} {prof.registry_number ? `(${prof.registry_number})` : ''}
                                                    </div>
                                                )}

                                                <div style={{ 
                                                    background: '#f8f9fb', 
                                                    padding: '10px', 
                                                    borderRadius: '6px', 
                                                    border: '1px solid #e3e6ef',
                                                    fontSize: 14,
                                                    lineHeight: 1.6
                                                }}>
                                                    {evo.evolution_report}
                                                </div>

                                                {evo.protocol_scores && (
                                                    <div style={{ marginTop: 8, fontSize: 13 }}>
                                                        <Tag color="purple">Escalas / Avaliação</Tag>
                                                        <span style={{ color: '#666' }}>{evo.protocol_scores}</span>
                                                    </div>
                                                )}
                                                
                                                {evo.intermittences && (
                                                    <div style={{ marginTop: 8 }}>
                                                        <Tag color="red" style={{ marginRight: 0 }}>Intercorrência</Tag>
                                                        <span style={{ color: '#cf1322', marginLeft: 8 }}>{evo.intermittences}</span>
                                                    </div>
                                                )}
                                            </div>
                                        ),
                                    };
                                })}
                            />
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
                    <Form.Item name="new_medication" label="Prescrição de Medicação (Opcional)">
                         <TextArea 
                            rows={2} 
                            placeholder="Descreva a medicação prescrita neste atendimento, se houver." 
                         />
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
