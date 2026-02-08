'use client';
import React, { useState, useEffect } from 'react';
import { Row, Col, Form, Input, Select, Button, DatePicker, InputNumber, Switch, Upload, message, App, Card } from 'antd';
import FeatherIcon from 'feather-icons-react';
import { useRouter, useSearchParams } from 'next/navigation';
import { Main } from '../../styled';
import { Cards } from '../../../components/cards/frame/cards-frame';
import api from '../../../config/api/axios';
import dayjs from 'dayjs';

const { Option } = Select;
const { TextArea } = Input;

function AddChild() {
  const [form] = Form.useForm();
  const router = useRouter();
  const searchParams = useSearchParams();
  const childId = searchParams.get('id');
  const isEditMode = !!childId;
  const { notification } = App.useApp();
  const [loading, setLoading] = useState(false);
  const [families, setFamilies] = useState([]);
  const hasMedicalReport = Form.useWatch('has_medical_report', form);
  
  // Fetch Families for Autocomplete
  useEffect(() => {
      const fetchFamilies = async () => {
          try {
              const { data } = await api.get('/families/');
              setFamilies(data.map(f => ({ 
                  value: f.id, 
                  label: `${f.name_responsible} (CPF: ${f.cpf})`, 
                  data: f 
              })));
          } catch (e) {
              console.error(e);
          }
      };
      fetchFamilies();
      
      if (childId) {
          loadChild(childId);
      }
  }, [childId]);

  const loadChild = async (id) => {
      try {
          const { data } = await api.get(`/children/${id}`);
          if (data.birth_date) data.birth_date = dayjs(data.birth_date);

          let assistanceNeeds = [];
          if (typeof data.assistance_needs === 'string') {
            try {
              const parsed = JSON.parse(data.assistance_needs);
              assistanceNeeds = Array.isArray(parsed) ? parsed : [];
            } catch {
              assistanceNeeds = data.assistance_needs ? [data.assistance_needs] : [];
            }
          }

          form.setFieldsValue({
            ...data,
            assistance_needs: assistanceNeeds,
          });
      } catch (error) {
          notification.error({ message: 'Erro ao carregar dados' });
      }
  };
  
  const handleFamilySelect = (value, option) => {
      const family = option.data;
      form.setFieldsValue({
          guardian_name: family.name_responsible,
          emergency_contact: family.phone
      });
  };

  const handleSave = async () => {
      setLoading(true);
      try {
          const values = form.getFieldsValue();
          const assistanceNeeds = Array.isArray(values.assistance_needs)
            ? values.assistance_needs
            : (values.assistance_needs ? [values.assistance_needs] : []);

          const payload = {
            ...values,
            birth_date: values.birth_date ? values.birth_date.format('YYYY-MM-DD') : null,
            gender: values.gender || null,
            blood_type: values.blood_type || null,
            weight: values.weight ?? null,
            height: values.height ?? null,
            cephalic_perimeter: values.cephalic_perimeter ?? null,
            emergency_contact: values.emergency_contact || null,
            diagnosis: values.diagnosis || null,
            is_diagnosis_closed: values.is_diagnosis_closed ?? false,
            severity_level: values.severity_level || null,
            assistance_needs: assistanceNeeds.length ? JSON.stringify(assistanceNeeds) : null,
            allergies: values.allergies || null,
            gestational_history: values.gestational_history || null,
            current_school: values.current_school || null,
            current_year: values.current_year || null,
            service_shift: values.service_shift || null,
            difficulty_reason: values.difficulty_reason || null,
            notes: values.notes || null,
            family_id: values.family_id || null,
          };

          if (isEditMode) {
              await api.put(`/children/${childId}`, payload);
              notification.success({ message: 'Criança atualizada com sucesso' });
          } else {
              const { data } = await api.post('/children/', payload);
              notification.success({ message: 'Criança cadastrada com sucesso' });
              router.push(`/admin/children/${data.id}/dashboard`); // Redirect to Dashboard
              return;
          }
          router.push('/admin/children');
      } catch (error) {
           const errorMessage = error.response?.data?.detail 
            ? (typeof error.response.data.detail === 'string' ? error.response.data.detail : JSON.stringify(error.response.data.detail))
            : error.message;

          notification.error({ message: 'Erro ao salvar', description: errorMessage });
      } finally {
          setLoading(false);
      }
  };

  return (
    <>
      <Main>
        <Cards
            title={isEditMode ? 'Editar Criança' : 'Nova Criança'}
            isbutton={
                <div style={{ display: 'flex', gap: 10 }}>
                    <Button key="back" onClick={() => router.push('/admin/children')}>Cancelar</Button>
                    <Button key="save" type="primary" onClick={handleSave} loading={loading}>Salvar</Button>
                </div>
            }
        >
            <Form form={form} layout="vertical">
                <Row gutter={25}>
                    <Col xs={24} md={12}>
                        <Form.Item name="name" label="Nome Completo" rules={[{ required: true }]}>
                            <Input />
                        </Form.Item>
                    </Col>
                    <Col xs={24} md={12}>
                        <Form.Item name="family_id" label="Vincular Família (Busque pelo Responsável)">
                            <Select 
                                showSearch 
                                placeholder="Digite o nome do responsável..."
                                optionFilterProp="label"
                                options={families}
                                onSelect={handleFamilySelect}
                                allowClear
                            />
                        </Form.Item>
                    </Col>
                    <Col xs={24} md={8}>
                        <Form.Item name="birth_date" label="Data de Nascimento" rules={[{ required: true }]}>
                            <DatePicker format="DD/MM/YYYY" style={{ width: '100%' }} />
                        </Form.Item>
                    </Col>
                    <Col xs={24} md={4}>
                        <Form.Item name="gender" label="Sexo">
                            <Select allowClear>
                                <Option value="feminino">Feminino</Option>
                                <Option value="masculino">Masculino</Option>
                            </Select>
                        </Form.Item>
                    </Col>
                    <Col xs={24} md={8}>
                        <Form.Item name="guardian_name" label="Nome do Responsável (Guardião)">
                            <Input />
                        </Form.Item>
                    </Col>
                    <Col xs={24} md={8}>
                        <Form.Item name="emergency_contact" label="Contato de Emergência">
                            <Input />
                        </Form.Item>
                    </Col>
                </Row>
                
                <Cards title="Dados Clínicos" headless={false} style={{ marginTop: 20 }}>
                    <Row gutter={25}>
                        <Col xs={24} md={8}>
                            <Form.Item
                              shouldUpdate={(prev, cur) =>
                                prev.is_diagnosis_closed !== cur.is_diagnosis_closed
                              }
                              noStyle
                            >
                              {({ getFieldValue }) => (
                                <Form.Item
                                  name="diagnosis"
                                  label="Diagnóstico (CID)"
                                  rules={
                                    getFieldValue('is_diagnosis_closed')
                                      ? [{ required: true, message: 'Informe o CID quando o diagnóstico estiver fechado' }]
                                      : []
                                  }
                                >
                                  <Input
                                    placeholder="Ex: F84.0"
                                    disabled={!getFieldValue('is_diagnosis_closed')}
                                  />
                                </Form.Item>
                              )}
                            </Form.Item>
                            <Form.Item
                              name="is_diagnosis_closed"
                              label="Diagnóstico fechado?"
                              valuePropName="checked"
                            >
                                <Switch checkedChildren="Sim" unCheckedChildren="Em investigação" />
                            </Form.Item>
                        </Col>
                        <Col xs={24} md={8}>
                            <Form.Item name="severity_level" label="Nível de Suporte">
                                <Select>
                                    <Option value="leve">Leve (Nível 1)</Option>
                                    <Option value="media">Moderado (Nível 2)</Option>
                                    <Option value="grave">Grave (Nível 3)</Option>
                                </Select>
                            </Form.Item>
                        </Col>
                        <Col xs={24} md={8}>
                            <Form.Item name="blood_type" label="Tipo Sanguíneo">
                                <Select>
                                    <Option value="A+">A+</Option>
                                    <Option value="A-">A-</Option>
                                    <Option value="B+">B+</Option>
                                    <Option value="B-">B-</Option>
                                    <Option value="AB+">AB+</Option>
                                    <Option value="AB-">AB-</Option>
                                    <Option value="O+">O+</Option>
                                    <Option value="O-">O-</Option>
                                </Select>
                            </Form.Item>
                        </Col>
                        <Col xs={24} md={8}>
                            <Form.Item name="weight" label="Peso (kg)">
                                <InputNumber min={0} style={{ width: '100%' }} />
                            </Form.Item>
                        </Col>
                        <Col xs={24} md={8}>
                            <Form.Item name="height" label="Altura (cm)">
                                <InputNumber min={0} style={{ width: '100%' }} />
                            </Form.Item>
                        </Col>
                        <Col xs={24} md={8}>
                            <Form.Item name="cephalic_perimeter" label="Perímetro Cefálico (cm)">
                                <InputNumber min={0} style={{ width: '100%' }} />
                            </Form.Item>
                        </Col>
                        <Col xs={24}>
                            <Form.Item name="allergies" label="Alergias / Restrições">
                                <TextArea rows={2} />
                            </Form.Item>
                        </Col>
                        <Col xs={24}>
                            <Form.Item name="gestational_history" label="Histórico Gestacional / Anamnese Resumida">
                                <TextArea rows={3} />
                            </Form.Item>
                        </Col>
                        <Col xs={24}>
                            <Form.Item name="assistance_needs" label="Necessidades Específicas de Assistência">
                                <Select
                                  mode="multiple"
                                  allowClear
                                  placeholder="Selecione as necessidades"
                                >
                                  <Option value="acesso_educacao">Acesso à educação</Option>
                                  <Option value="tratamento_medico">Tratamento médico</Option>
                                  <Option value="terapias">Terapias</Option>
                                  <Option value="alimentacao_especifica">Alimentação específica</Option>
                                  <Option value="acessibilidade">Acessibilidade</Option>
                                  <Option value="outros">Outros</Option>
                                </Select>
                            </Form.Item>
                        </Col>
                        <Col xs={24} md={6}>
                            <Form.Item
                              name="has_medical_report"
                              label="Possui Laudo Médico?"
                              valuePropName="checked"
                            >
                                <Switch checkedChildren="Sim" unCheckedChildren="Não" />
                            </Form.Item>
                        </Col>
                        {hasMedicalReport && (
                          <Col xs={24} md={12}>
                            {isEditMode && childId ? (
                              <Form.Item label="Laudo Médico (upload)">
                                <Upload
                                  name="file"
                                  action={`${api.defaults.baseURL}/children/${childId}/docs?doc_type=report`}
                                  showUploadList
                                  onChange={(info) => {
                                    if (info.file.status === 'done') {
                                      message.success(`${info.file.name} enviado com sucesso`);
                                    } else if (info.file.status === 'error') {
                                      message.error(`${info.file.name} falha no envio`);
                                    }
                                  }}
                                >
                                  <Button icon={<FeatherIcon icon="upload" size={14} />}>
                                    Enviar Laudo
                                  </Button>
                                </Upload>
                              </Form.Item>
                            ) : (
                              <p>
                                Após salvar o cadastro, o upload do laudo ficará disponível na tela de
                                prontuário da criança.
                              </p>
                            )}
                          </Col>
                        )}
                    </Row>
                </Cards>

                <Cards title="Educação" headless={false} style={{ marginTop: 20 }}>
                     <Row gutter={25}>
                        <Col xs={24} md={12}>
                            <Form.Item name="current_school" label="Escola Atual">
                                <Input />
                            </Form.Item>
                        </Col>
                        <Col xs={24} md={6}>
                            <Form.Item name="current_year" label="Série / Ano">
                                <Input />
                            </Form.Item>
                        </Col>
                        <Col xs={24} md={6}>
                            <Form.Item name="service_shift" label="Turno">
                                <Select>
                                    <Option value="matutino">Matutino</Option>
                                    <Option value="vespertino">Vespertino</Option>
                                    <Option value="integral">Integral</Option>
                                </Select>
                            </Form.Item>
                        </Col>
                        <Col xs={24} md={6}>
                            <Form.Item name="has_access_treatment" label="Tem acesso a tratamento/escola?" valuePropName="checked">
                                <Switch checkedChildren="Sim" unCheckedChildren="Não" defaultChecked />
                            </Form.Item>
                        </Col>
                        <Col xs={24} md={12}>
                             <Form.Item name="difficulty_reason" label="Motivo da Dificuldade (se não tiver acesso)">
                                <Input />
                            </Form.Item>
                        </Col>
                     </Row>
                </Cards>
            </Form>
        </Cards>
      </Main>
    </>
  );
}

export default AddChild;
