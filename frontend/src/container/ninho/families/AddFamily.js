'use client';
import React, { useState, useEffect } from 'react';
import { Row, Col, Form, Input, Select, Button, Steps, DatePicker, InputNumber, Switch, Upload, message, App, Card, Divider } from 'antd';
import FeatherIcon from 'feather-icons-react';
import { useRouter, useSearchParams } from 'next/navigation';
import { PageHeader } from '../../../components/page-headers/page-headers';
import { Main } from '../../styled';
import api from '../../../config/api/axios';
import dayjs from 'dayjs';

const { Step } = Steps;
const { Option } = Select;
const { TextArea } = Input;

function AddFamily() {
  const [current, setCurrent] = useState(0);
  const [form] = Form.useForm();
  const router = useRouter();
  const searchParams = useSearchParams();
  const familyId = searchParams.get('id');
  const isEditMode = !!familyId;
  const { notification } = App.useApp();
  const [loading, setLoading] = useState(false);
  const [savedFamilyId, setSavedFamilyId] = useState(null); // To store ID after partial save

  // State for Documents Step
  const [fileList, setFileList] = useState({}); 

  useEffect(() => {
    if (familyId) {
        setSavedFamilyId(familyId);
        loadFamily(familyId);
    }
  }, [familyId]);

  const loadFamily = async (id) => {
      try {
          const { data } = await api.get(`/families/${id}`);
          // Format dates
          if (data.birth_date) data.birth_date = dayjs(data.birth_date);
          form.setFieldsValue(data);
      } catch (error) {
          notification.error({ message: 'Erro ao carregar dados' });
      }
  };

  const steps = [
    {
      title: 'Responsável',
      content: 'responsible',
    },
    {
      title: 'Localização',
      content: 'location',
    },
    {
      title: 'Socioeconômico',
      content: 'socio',
    },
    {
      title: 'Documentos',
      content: 'docs',
    },
  ];

  const next = async () => {
    try {
        // Validate current step fields
        // For simplicity, we might validate all or specific fields. 
        // Let's validate strictly based on current step logic if needed, 
        // or just validate all required fields that are visible.
        await form.validateFields();
        
        // If moving from Step 3 (index 2) to 4 (index 3), SAVE the family first if not saved
        if (current === 2 && !savedFamilyId) {
            await handleSave(); // This sets savedFamilyId
        } else if (current === 2 && savedFamilyId) {
             await handleSave(); // Update
        }
        
        setCurrent(current + 1);
    } catch (error) {
        console.error("Validation Failed:", error);
    }
  };

  const prev = () => {
    setCurrent(current - 1);
  };

  const handleSave = async () => {
      setLoading(true);
      try {
          const values = form.getFieldsValue(true); // true to get all values, even hidden ones from other steps
          // Format payload
          const payload = {
              ...values,
              birth_date: values.birth_date ? values.birth_date.format('YYYY-MM-DD') : null,
              rg: values.rg || null,
              nis_responsible: values.nis_responsible || null,
              phone: values.phone || null,
              email: values.email || null,
              city: values.city || null,
              state: values.state || null,
              zip_code: values.zip_code || null,
              reference_point: values.reference_point || null,
              latitude: values.latitude || null,
              longitude: values.longitude || null,
              composition_familiar: values.composition_familiar || null,
              housing_conditions: values.housing_conditions || null
          };

          let response;
          try {
              if (savedFamilyId || isEditMode) {
                  const id = savedFamilyId || familyId;
                  response = await api.put(`/families/${id}`, payload);
                  notification.success({ message: 'Dados atualizados com sucesso' });
              } else {
                  response = await api.post('/families/', payload);
                  setSavedFamilyId(response.data.id);
                  notification.success({ message: 'Família cadastrada com sucesso! Prossiga para os documentos.' });
              }
              return response.data;
          } catch (error) {
              const errorMessage = error.response?.data?.detail 
                ? (typeof error.response.data.detail === 'string' ? error.response.data.detail : JSON.stringify(error.response.data.detail))
                : error.message;

              notification.error({ 
                  message: 'Erro ao salvar', 
                  description: errorMessage
              });
              throw error; 
          } finally {
              setLoading(false);
          }
      } catch (error) {
          console.error(error);
      }
  };

  const handleCepBlur = async (e) => {
      const cep = e.target.value.replace(/\D/g, '');
      if (cep.length === 8) {
          try {
              const res = await fetch(`https://viacep.com.br/ws/${cep}/json/`);
              const data = await res.json();
              if (!data.erro) {
                  form.setFieldsValue({
                      address_full: `${data.logradouro}, `,
                      neighborhood: data.bairro,
                      city: data.localidade,
                      state: data.uf,
                      zip_code: cep
                  });
              }
          } catch (err) {
              // ignore
          }
      }
  };

  // Upload Props Generator
  const getUploadProps = (docType) => ({
      name: 'file',
      action: `${api.defaults.baseURL}/families/${savedFamilyId || familyId}/docs?doc_type=${docType}`,
      headers: {
          // Add auth headers if needed
      },
      onChange(info) {
          if (info.file.status === 'done') {
              message.success(`${info.file.name} enviado com sucesso`);
          } else if (info.file.status === 'error') {
              message.error(`${info.file.name} falha no envio`);
          }
      },
      showUploadList: true,
  });
  
  const openMap = () => {
      const lat = form.getFieldValue('latitude');
      const lng = form.getFieldValue('longitude');
      if (lat && lng) {
          window.open(`https://www.google.com/maps/search/?api=1&query=${lat},${lng}`, '_blank');
      } else {
          message.warning("Coordenadas não preenchidas");
      }
  };

  // --- Step Content Renderers ---
  const renderStepContent = () => {
      switch (steps[current].content) {
          case 'responsible':
              return (
                  <Row gutter={25}>
                      <Col xs={24} md={12}>
                          <Form.Item name="name_responsible" label="Nome do Responsável" rules={[{ required: true }]}>
                              <Input />
                          </Form.Item>
                      </Col>
                      <Col xs={24} md={6}>
                          <Form.Item name="cpf" label="CPF" rules={[{ required: true }]}>
                              <Input placeholder="000.000.000-00" />
                          </Form.Item>
                      </Col>
                      <Col xs={24} md={6}>
                          <Form.Item name="rg" label="RG">
                              <Input />
                          </Form.Item>
                      </Col>
                      <Col xs={24} md={6}>
                          <Form.Item name="nis_responsible" label="NIS">
                              <Input />
                          </Form.Item>
                      </Col>
                      <Col xs={24} md={6}>
                          <Form.Item name="birth_date" label="Data de Nascimento">
                              <DatePicker format="DD/MM/YYYY" style={{ width: '100%' }} />
                          </Form.Item>
                      </Col>
                      <Col xs={24} md={6}>
                          <Form.Item name="gender" label="Sexo">
                              <Select>
                                  <Option value="feminino">Feminino</Option>
                                  <Option value="masculino">Masculino</Option>
                                  <Option value="outro">Outro</Option>
                              </Select>
                          </Form.Item>
                      </Col>
                      <Col xs={24} md={6}>
                          <Form.Item name="nationality" label="Nacionalidade" initialValue="Brasileira">
                              <Input />
                          </Form.Item>
                      </Col>
                      <Col xs={24} md={6}>
                          <Form.Item name="phone" label="Telefone / Celular">
                              <Input />
                          </Form.Item>
                      </Col>
                      <Col xs={24} md={6}>
                          <Form.Item name="is_whatsapp" label="É WhatsApp?" valuePropName="checked">
                              <Switch />
                          </Form.Item>
                      </Col>
                      <Col xs={24} md={12}>
                          <Form.Item name="email" label="Email">
                              <Input type="email" />
                          </Form.Item>
                      </Col>
                  </Row>
              );
          case 'location':
              return (
                  <Row gutter={25}>
                      <Col xs={24} md={6}>
                          <Form.Item name="zip_code" label="CEP">
                              <Input onBlur={handleCepBlur} placeholder="00000-000" />
                          </Form.Item>
                      </Col>
                      <Col xs={24} md={18}>
                          <Form.Item name="address_full" label="Endereço Completo" rules={[{ required: true }]}>
                              <Input />
                          </Form.Item>
                      </Col>
                      <Col xs={24} md={8}>
                          <Form.Item name="neighborhood" label="Bairro" rules={[{ required: true }]}>
                              <Input />
                          </Form.Item>
                      </Col>
                      <Col xs={24} md={8}>
                          <Form.Item name="city" label="Cidade">
                              <Input />
                          </Form.Item>
                      </Col>
                      <Col xs={24} md={8}>
                          <Form.Item name="state" label="Estado">
                              <Input />
                          </Form.Item>
                      </Col>
                      <Col xs={24} md={24}>
                          <Form.Item name="reference_point" label="Ponto de Referência">
                              <Input />
                          </Form.Item>
                      </Col>
                      <Divider orientation="left">Geolocalização</Divider>
                      <Col xs={24} md={8}>
                          <Form.Item name="latitude" label="Latitude">
                              <InputNumber style={{ width: '100%' }} />
                          </Form.Item>
                      </Col>
                      <Col xs={24} md={8}>
                          <Form.Item name="longitude" label="Longitude">
                              <InputNumber style={{ width: '100%' }} />
                          </Form.Item>
                      </Col>
                      <Col xs={24} md={8} style={{ display: 'flex', alignItems: 'center' }}>
                          <Button onClick={openMap} icon={<FeatherIcon icon="map-pin" size={14} />}>
                              Ver no Mapa
                          </Button>
                      </Col>
                  </Row>
              );
          case 'socio':
              return (
                  <Row gutter={25}>
                      <Col xs={24} md={8}>
                          <Form.Item name="monthly_income" label="Renda Mensal Familiar (R$)">
                              <InputNumber 
                                  style={{ width: '100%' }} 
                                  formatter={value => `R$ ${value}`.replace(/\B(?=(\d{3})+(?!\d))/g, '.')}
                                  parser={value => value.replace(/R\$\s?|(\.*)/g, '').replace(',', '.')}
                              />
                          </Form.Item>
                      </Col>
                      <Col xs={24} md={8}>
                          <Form.Item name="dependents_count" label="Nº de Dependentes">
                              <InputNumber style={{ width: '100%' }} min={0} />
                          </Form.Item>
                      </Col>
                      <Col xs={24} md={8}>
                          <Form.Item name="vulnerability_status" label="Situação de Vulnerabilidade">
                              <Select>
                                  <Option value="desemprego">Desemprego</Option>
                                  <Option value="baixa_renda">Baixa Renda</Option>
                                  <Option value="inseguranca_alimentar">Insegurança Alimentar</Option>
                                  <Option value="outros">Outros</Option>
                              </Select>
                          </Form.Item>
                      </Col>
                      <Col xs={24} md={8}>
                          <Form.Item name="assistance_status" label="Status da Assistência" initialValue="active">
                              <Select>
                                  <Option value="active">Ativo</Option>
                                  <Option value="inactive">Inativo</Option>
                                  <Option value="suspended">Suspenso</Option>
                              </Select>
                          </Form.Item>
                      </Col>
                      <Col xs={24}>
                          <Form.Item name="composition_familiar" label="Composição Familiar (Detalhes)">
                              <TextArea rows={4} placeholder="Liste os nomes e idades dos membros da família..." />
                          </Form.Item>
                      </Col>
                      <Col xs={24}>
                          <Form.Item name="housing_conditions" label="Condições de Moradia">
                              <TextArea rows={2} placeholder="Própria, alugada, cedida, precária..." />
                          </Form.Item>
                      </Col>
                  </Row>
              );
          case 'docs':
              const id = savedFamilyId || familyId;
              if (!id) return <p>Salve a família primeiro para anexar documentos.</p>;
              
              return (
                  <Row gutter={25}>
                      <Col xs={24} md={12}>
                          <Card type="inner" title="Comprovante de Residência">
                              <Upload {...getUploadProps('residence')}>
                                  <Button icon={<FeatherIcon icon="upload" size={14} />}>Upload</Button>
                              </Upload>
                          </Card>
                      </Col>
                      <Col xs={24} md={12}>
                          <Card type="inner" title="Comprovante de Renda">
                              <Upload {...getUploadProps('income')}>
                                  <Button icon={<FeatherIcon icon="upload" size={14} />}>Upload</Button>
                              </Upload>
                          </Card>
                      </Col>
                      <Col xs={24} md={12} style={{ marginTop: 20 }}>
                          <Card type="inner" title="Cartão de Vacinação">
                              <Upload {...getUploadProps('vaccination')}>
                                  <Button icon={<FeatherIcon icon="upload" size={14} />}>Upload</Button>
                              </Upload>
                          </Card>
                      </Col>
                      <Col xs={24} md={12} style={{ marginTop: 20 }}>
                          <Card type="inner" title="Outros Documentos">
                              <Upload {...getUploadProps('others')}>
                                  <Button icon={<FeatherIcon icon="upload" size={14} />}>Upload</Button>
                              </Upload>
                          </Card>
                      </Col>
                  </Row>
              );
          default:
              return null;
      }
  };

  return (
    <>
      <PageHeader
        ghost
        title={isEditMode ? 'Editar Família' : 'Nova Família'}
        buttons={[
            <Button key="list" onClick={() => router.push('/admin/families')}>Voltar para Lista</Button>
        ]}
      />
      <Main>
        <Card>
            <Steps current={current} onChange={setCurrent}>
                {steps.map(item => (
                    <Step key={item.title} title={item.title} />
                ))}
            </Steps>
            
            <Form 
                form={form} 
                layout="vertical" 
                style={{ marginTop: 40 }}
                initialValues={{ monthly_income: 0, dependents_count: 0 }}
            >
                {renderStepContent()}
            </Form>

            <div style={{ marginTop: 24, display: 'flex', justifyContent: 'flex-end', gap: 10 }}>
                {current > 0 && (
                    <Button style={{ margin: '0 8px' }} onClick={prev}>
                        Anterior
                    </Button>
                )}
                {current < steps.length - 1 && (
                    <Button type="primary" onClick={next}>
                        {current === 2 ? 'Salvar e Avançar para Documentos' : 'Próximo'}
                    </Button>
                )}
                {current === steps.length - 1 && (
                    <Button type="primary" onClick={() => router.push('/admin/families')}>
                        Concluir Cadastro
                    </Button>
                )}
            </div>
        </Card>
      </Main>
    </>
  );
}

export default AddFamily;