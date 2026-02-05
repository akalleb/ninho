import React, { useState, useEffect } from 'react';
import { Row, Col, Form, Input, Select, DatePicker, Button, Card, App } from 'antd';
import { PageHeader } from '../../../components/page-headers/page-headers';
import { Main } from '../../styled';
import api from '../../../config/api/axios';
import { useRouter, useSearchParams } from 'next/navigation';

const { Option } = Select;

function AddUser() {
  const [form] = Form.useForm();
  const router = useRouter();
  const searchParams = useSearchParams();
  const professionalId = searchParams.get('id');
  const isEditMode = !!professionalId;
  const [loading, setLoading] = useState(false);
  const { notification } = App.useApp();
  
  // Estados para controlar a exibição condicional de campos
  const [employmentType, setEmploymentType] = useState('effective');
  const [userRole, setUserRole] = useState('health');

  useEffect(() => {
    const loadProfessional = async () => {
      if (!professionalId) return;
      try {
        const { data } = await api.get(`/professionals/${professionalId}`);
        form.setFieldsValue({
          name: data.name,
          email: data.email,
          cpf: data.cpf,
          rg: data.rg,
          employment_type: data.employment_type || 'effective',
          role: data.role || 'health',
          function_role: data.function_role,
          bank_data: data.bank_data,
          address: data.address,
          cbo: data.cbo,
          registry_number: data.registry_number,
        });
        setEmploymentType(data.employment_type || 'effective');
        setUserRole(data.role || 'health');
      } catch (error) {
        notification.error({
          message: 'Erro ao carregar colaborador',
          description: error.response?.data?.detail || error.message,
        });
      }
    };
    loadProfessional();
  }, [professionalId]);

  const handleSubmit = async (values) => {
    setLoading(true);
    try {
      // Formatação de datas para o padrão ISO (YYYY-MM-DD) esperado pelo PostgreSQL/Supabase
      const { confirm_password, ...restValues } = values;

      const formattedValues = {
        ...restValues,
        birth_date: values.birth_date ? values.birth_date.format('YYYY-MM-DD') : null,
        admission_date: values.admission_date ? values.admission_date.format('YYYY-MM-DD') : null,
        contract_validity: values.contract_validity ? values.contract_validity.format('YYYY-MM-DD') : null,
        volunteer_start_date: values.volunteer_start_date ? values.volunteer_start_date.format('YYYY-MM-DD') : null,
      };

      if (isEditMode) {
        await api.put(`/professionals/${professionalId}`, formattedValues);
      } else {
        await api.post('/professionals/', formattedValues);
      }
      
      notification.success({
        message: 'Sucesso',
        description: isEditMode
          ? 'Colaborador atualizado com sucesso!'
          : 'Colaborador cadastrado com sucesso!',
      });
      
      router.push('/admin/dashboard/users/dataTable');
    } catch (error) {
      notification.error({
        message: 'Erro no Cadastro',
        description: error.response?.data?.detail || 'Não foi possível salvar os dados. Verifique a conexão.',
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <PageHeader ghost title="Adicionar Novo Colaborador" />
      <Main>
        <Row gutter={25}>
          <Col xs={24}>
            <Card title="Formulário de Cadastro - PluckStudio">
              <Form
                form={form}
                layout="vertical"
                onFinish={handleSubmit}
                initialValues={{
                  employment_type: 'effective',
                  role: 'health',
                }}
                onValuesChange={(changedValues) => {
                    if (changedValues.employment_type) setEmploymentType(changedValues.employment_type);
                    if (changedValues.role) setUserRole(changedValues.role);
                }}
              >
                <Row gutter={25}>
                  {/* CONFIGURAÇÃO DE PERFIL */}
                  <Col xs={24} md={12}>
                    <Form.Item name="employment_type" label="Tipo de Vínculo" rules={[{ required: true }]}>
                      <Select>
                        <Option value="effective">Efetivo (CLT/PJ)</Option>
                        <Option value="volunteer">Voluntário</Option>
                      </Select>
                    </Form.Item>
                  </Col>
                  <Col xs={24} md={12}>
                    <Form.Item name="role" label="Nível de Acesso no Sistema" rules={[{ required: true }]}>
                      <Select>
                        <Option value="admin">Gestor (Acesso Total)</Option>
                        <Option value="operational">Operacional (Almoxarifado/Social)</Option>
                        <Option value="health">Profissional de Saúde (Prontuários)</Option>
                      </Select>
                    </Form.Item>
                  </Col>

                  {/* DADOS IDENTIFICAÇÃO (Comuns) */}
                  <Col xs={24} md={12}>
                    <Form.Item name="name" label="Nome Completo" rules={[{ required: true, message: 'Campo obrigatório' }]}>
                      <Input placeholder="Nome completo do colaborador" />
                    </Form.Item>
                  </Col>
                  <Col xs={24} md={6}>
                    <Form.Item
                      name="password"
                      label={isEditMode ? "Nova Senha (opcional)" : "Senha de Acesso"}
                      rules={
                        isEditMode
                          ? []
                          : [{ required: true, message: 'Senha é obrigatória' }]
                      }
                    >
                      <Input.Password placeholder="Defina uma senha segura" />
                    </Form.Item>
                  </Col>
                  <Col xs={24} md={6}>
                    <Form.Item
                      name="confirm_password"
                      label={isEditMode ? "Confirmar Nova Senha" : "Confirmar Senha"}
                      dependencies={['password']}
                      rules={[
                        ({ getFieldValue }) => ({
                          validator(_, value) {
                            const pwd = getFieldValue('password');
                            if (!pwd && !value) {
                              return Promise.resolve();
                            }
                            if (pwd && value !== pwd) {
                              return Promise.reject(new Error('As senhas não coincidem'));
                            }
                            return Promise.resolve();
                          },
                        }),
                      ]}
                    >
                      <Input.Password placeholder="Repita a senha" />
                    </Form.Item>
                  </Col>
                  <Col xs={24} md={12}>
                    <Form.Item name="email" label="E-mail" rules={[{ required: true, type: 'email', message: 'E-mail válido é obrigatório' }]}>
                      <Input placeholder="email@exemplo.com" />
                    </Form.Item>
                  </Col>
                  <Col xs={24} md={8}>
                    <Form.Item name="cpf" label="CPF" rules={[{ required: true, message: 'Obrigatório' }]}>
                      <Input placeholder="000.000.000-00" />
                    </Form.Item>
                  </Col>
                  <Col xs={24} md={8}>
                    <Form.Item name="rg" label="RG" rules={[{ required: true, message: 'Obrigatório' }]}>
                      <Input />
                    </Form.Item>
                  </Col>
                  <Col xs={24} md={8}>
                    <Form.Item name="birth_date" label="Data de Nascimento" rules={[{ required: true, message: 'Obrigatório' }]}>
                      <DatePicker style={{ width: '100%' }} format="DD/MM/YYYY" placeholder="Selecionar data" />
                    </Form.Item>
                  </Col>

                  {/* CAMPOS DINÂMICOS: EFETIVOS */}
                  {employmentType === 'effective' && (
                    <>
                      <Col xs={24} md={8}>
                        <Form.Item name="admission_date" label="Data de Admissão" rules={[{ required: true, message: 'Obrigatório' }]}>
                          <DatePicker style={{ width: '100%' }} format="DD/MM/YYYY" />
                        </Form.Item>
                      </Col>
                      <Col xs={24} md={8}>
                        <Form.Item name="contract_validity" label="Vigência do Contrato">
                          <DatePicker style={{ width: '100%' }} format="DD/MM/YYYY" />
                        </Form.Item>
                      </Col>
                      <Col xs={24} md={8}>
                        <Form.Item name="function_role" label="Função" rules={[{ required: true, message: 'Obrigatório' }]}>
                          <Input />
                        </Form.Item>
                      </Col>
                      <Col xs={24} md={12}>
                        <Form.Item name="bank_data" label="Dados Bancários (Banco, Agência, Conta, PIX)">
                          <Input.TextArea rows={2} />
                        </Form.Item>
                      </Col>
                      <Col xs={24} md={12}>
                        <Form.Item name="address" label="Endereço Residencial">
                          <Input.TextArea rows={2} />
                        </Form.Item>
                      </Col>
                    </>
                  )}

                  {/* CAMPOS DINÂMICOS: VOLUNTÁRIOS */}
                  {employmentType === 'volunteer' && (
                    <>
                      <Col xs={24} md={12}>
                        <Form.Item name="volunteer_start_date" label="Data de Início do Voluntariado" rules={[{ required: true, message: 'Obrigatório' }]}>
                          <DatePicker style={{ width: '100%' }} format="DD/MM/YYYY" />
                        </Form.Item>
                      </Col>
                      <Col xs={24} md={12}>
                        <Form.Item name="function_role" label="Função Voluntária">
                          <Input placeholder="Ex: Monitor de Oficinas" />
                        </Form.Item>
                      </Col>
                    </>
                  )}

                  {/* CAMPOS DINÂMICOS: SAÚDE (Adicionais) */}
                  {userRole === 'health' && (
                    <>
                      <Col xs={24}>
                        <hr style={{ border: '0', borderTop: '1px solid #f0f0f0', margin: '20px 0' }} />
                        <h4 style={{ marginBottom: '20px' }}>Informações de Registro Profissional</h4>
                      </Col>
                      <Col xs={24} md={12}>
                        <Form.Item name="cbo" label="CBO (Classificação Brasileira de Ocupação)" rules={[{ required: true, message: 'Obrigatório para saúde' }]}>
                          <Input placeholder="Consulte o código CBO da função" />
                        </Form.Item>
                      </Col>
                      <Col xs={24} md={12}>
                        <Form.Item name="registry_number" label="Número do Conselho de Classe (CRM/CRP/CREFITO)" rules={[{ required: true, message: 'Obrigatório para saúde' }]}>
                          <Input />
                        </Form.Item>
                      </Col>
                    </>
                  )}

                  <Col xs={24}>
                    <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px', marginTop: '30px' }}>
                      <Button onClick={() => router.push('/admin/dashboard/users/dataTable')}>
                        Cancelar
                      </Button>
                      <Button type="primary" htmlType="submit" loading={loading} size="large">
                        Salvar no Ninho
                      </Button>
                    </div>
                  </Col>
                </Row>
              </Form>
            </Card>
          </Col>
        </Row>
      </Main>
    </>
  );
}

export default AddUser;
