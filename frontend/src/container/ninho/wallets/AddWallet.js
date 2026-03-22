import React, { useState, useEffect, useMemo } from 'react';
import { Row, Col, Form, Input, Select, Button, Card, App, Switch, InputNumber, Tooltip, Space, Divider } from 'antd';
import { QuestionCircleOutlined } from '@ant-design/icons';
import { Main } from '../../styled';
import api from '../../../config/api/axios';
import { useRouter, useSearchParams } from 'next/navigation';
import { Cards } from '../../../components/cards/frame/cards-frame';

const { Option } = Select;
const { TextArea } = Input;

function AddWallet() {
  const [form] = Form.useForm();
  const router = useRouter();
  const searchParams = useSearchParams();
  const walletId = searchParams.get('id');
  const isEditMode = !!walletId;
  const [loading, setLoading] = useState(false);
  const { notification } = App.useApp();
  const [professionals, setProfessionals] = useState([]);

  useEffect(() => {
    const loadWallet = async () => {
      if (!walletId) return;
      try {
        const { data } = await api.get(`/wallets/${walletId}`);
        form.setFieldsValue({
          ...data,
          auto_charge_service_type_rate_list: data.auto_charge_service_type_rates
            ? Object.entries(data.auto_charge_service_type_rates).map(([service_type, amount]) => ({
                service_type,
                amount,
              }))
            : [],
          auto_charge_professional_rate_list: data.auto_charge_professional_rates
            ? Object.entries(data.auto_charge_professional_rates).map(([professional_id, amount]) => ({
                professional_id,
                amount,
              }))
            : [],
        });
      } catch (error) {
        notification.error({
          message: 'Erro ao carregar carteira',
          description: error.response?.data?.detail || error.message,
        });
      }
    };
    loadWallet();
  }, [walletId]);

  useEffect(() => {
    api
      .get('/professionals/basic')
      .then((res) => setProfessionals(Array.isArray(res.data) ? res.data : []))
      .catch(() => setProfessionals([]));
  }, []);

  const healthProfessionals = useMemo(
    () => professionals.filter((p) => p && p.role === 'health'),
    [professionals],
  );

  const appendDescriptionToken = (token) => {
    const current = form.getFieldValue('auto_charge_expense_description') || '';
    const next = current ? `${current} ${token}` : token;
    form.setFieldsValue({ auto_charge_expense_description: next });
  };

  const handleSubmit = async (values) => {
    setLoading(true);
    try {
      const payload = { ...values };
      const enabled = !!payload.auto_charge_enabled;
      if (!enabled) {
        payload.auto_charge_mode = null;
        payload.auto_charge_flat_amount = null;
        payload.auto_charge_service_type_rates = null;
        payload.auto_charge_professional_rates = null;
        payload.auto_charge_expense_destination = null;
        payload.auto_charge_expense_description = null;
        payload.auto_charge_expense_category_id = null;
      } else {
        const rateListToDict = (list, keyField) => {
          if (!Array.isArray(list)) return null;
          const entries = list
            .filter((row) => row && row[keyField] && row.amount != null)
            .map((row) => [String(row[keyField]), Number(row.amount)]);
          if (!entries.length) return null;
          return Object.fromEntries(entries);
        };

        payload.auto_charge_service_type_rates = rateListToDict(
          payload.auto_charge_service_type_rate_list,
          'service_type',
        );
        payload.auto_charge_professional_rates = rateListToDict(
          payload.auto_charge_professional_rate_list,
          'professional_id',
        );
      }

      delete payload.auto_charge_service_type_rate_list;
      delete payload.auto_charge_professional_rate_list;

      if (isEditMode) {
        await api.put(`/wallets/${walletId}`, payload);
      } else {
        await api.post('/wallets/', payload);
      }
      
      notification.success({
        message: 'Sucesso',
        description: isEditMode
          ? 'Carteira atualizada com sucesso!'
          : 'Carteira criada com sucesso!',
      });
      
      router.push('/admin/wallets');
    } catch (error) {
      notification.error({
        message: 'Erro ao salvar',
        description: error.response?.data?.detail || 'Não foi possível salvar os dados.',
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <Main>
        <Row gutter={25}>
          <Col xs={24}>
            <Cards 
                title={isEditMode ? `Editar Carteira` : "Nova Carteira"}
                extra={
                    <div style={{ display: 'flex', gap: '10px' }}>
                      <Button onClick={() => router.push('/admin/wallets')}>
                        Cancelar
                      </Button>
                      <Button type="primary" onClick={() => form.submit()} loading={loading}>
                        {isEditMode ? 'Salvar Alterações' : 'Criar Carteira'}
                      </Button>
                    </div>
                }
            >
              <Form
                form={form}
                layout="vertical"
                onFinish={handleSubmit}
                initialValues={{
                  is_restricted: false,
                  balance: 0,
                  auto_charge_enabled: false,
                  auto_charge_mode: 'flat_per_attendance',
                  auto_charge_flat_amount: 0,
                  auto_charge_service_type_rate_list: [],
                  auto_charge_professional_rate_list: [],
                }}
              >
                <Form.Item name="name" label="Nome da Carteira" rules={[{ required: true, message: 'Obrigatório' }]}>
                  <Input placeholder="Ex: Fundo Municipal de Saúde" />
                </Form.Item>

                <Form.Item name="category" label="Categoria" rules={[{ required: true, message: 'Obrigatório' }]}>
                  <Select placeholder="Selecione a categoria">
                    <Option value="educacao">Educação</Option>
                    <Option value="saude">Saúde</Option>
                    <Option value="assistencia_social">Assistência Social</Option>
                    <Option value="infraestrutura">Infraestrutura</Option>
                    <Option value="livre">Livre</Option>
                  </Select>
                </Form.Item>

                <Form.Item name="account_number" label="Número da Conta Bancária">
                    <Input placeholder="Conta" />
                </Form.Item>

                <Row gutter={15}>
                    <Col span={8}>
                        <Form.Item name="bank_name" label="Nome do Banco">
                            <Input placeholder="Ex: Banco do Brasil" />
                        </Form.Item>
                    </Col>
                    <Col span={8}>
                        <Form.Item name="agency" label="Agência">
                            <Input placeholder="Ex: 0001-9" />
                        </Form.Item>
                    </Col>
                    <Col span={8}>
                        <Form.Item name="pix_key" label="Chave PIX">
                            <Input placeholder="CPF, CNPJ ou Aleatória" />
                        </Form.Item>
                    </Col>
                </Row>

                <Row gutter={15}>
                    <Col span={12}>
                        <Form.Item
                          name="is_restricted"
                          label={
                            <span>
                              Recurso Carimbado?{' '}
                              <Tooltip
                                title="Recursos que só podem ser usados em finalidades específicas, como emendas, convênios ou fundos vinculados."
                              >
                                <QuestionCircleOutlined style={{ marginLeft: 4 }} />
                              </Tooltip>
                            </span>
                          }
                          valuePropName="checked"
                        >
                          <Switch checkedChildren="Sim" unCheckedChildren="Não" />
                        </Form.Item>
                    </Col>
                </Row>

                <Form.Item name="description" label="Descrição / Finalidade">
                  <TextArea rows={4} />
                </Form.Item>

                <Divider style={{ marginTop: 8, marginBottom: 8 }} />

                <Card variant="borderless" style={{ marginBottom: 16 }}>
                  <Row gutter={15} align="middle">
                    <Col xs={24} md={12}>
                      <Form.Item
                        name="auto_charge_enabled"
                        label={
                          <span>
                            Cobrança automática por atendimento{' '}
                            <Tooltip title="Quando um atendimento vinculado a esta carteira for finalizado, o sistema pode lançar uma despesa automaticamente nesta carteira.">
                              <QuestionCircleOutlined style={{ marginLeft: 4 }} />
                            </Tooltip>
                          </span>
                        }
                        valuePropName="checked"
                      >
                        <Switch checkedChildren="Ativa" unCheckedChildren="Desligada" />
                      </Form.Item>
                    </Col>
                  </Row>

                  <Form.Item
                    noStyle
                    shouldUpdate={(prev, cur) =>
                      prev.auto_charge_enabled !== cur.auto_charge_enabled ||
                      prev.auto_charge_mode !== cur.auto_charge_mode
                    }
                  >
                    {({ getFieldValue }) => {
                      const enabled = !!getFieldValue('auto_charge_enabled');
                      const mode = getFieldValue('auto_charge_mode');
                      if (!enabled) return null;

                      return (
                        <>
                          <Row gutter={15}>
                            <Col xs={24} md={12}>
                              <Form.Item
                                name="auto_charge_mode"
                                label="Regra de cálculo"
                                rules={[{ required: true, message: 'Obrigatório' }]}
                              >
                                <Select>
                                  <Option value="flat_per_attendance">Valor fixo por atendimento</Option>
                                  <Option value="service_type">Por tipo de atendimento</Option>
                                  <Option value="professional">Por profissional</Option>
                                </Select>
                              </Form.Item>
                            </Col>
                            <Col xs={24} md={12}>
                              <Form.Item
                                name="auto_charge_flat_amount"
                                label="Valor padrão (fallback)"
                                rules={[{ required: true, message: 'Obrigatório' }]}
                              >
                                <InputNumber min={0} step={1} style={{ width: '100%' }} addonBefore="R$" />
                              </Form.Item>
                            </Col>
                          </Row>

                          {mode === 'service_type' ? (
                            <Form.List name="auto_charge_service_type_rate_list">
                              {(fields, { add, remove }) => (
                                <>
                                  <Row gutter={15} align="middle">
                                    <Col xs={24}>
                                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                        <div style={{ fontWeight: 600 }}>Valores por tipo de atendimento</div>
                                        <Button onClick={() => add()} size="small">
                                          Adicionar
                                        </Button>
                                      </div>
                                    </Col>
                                  </Row>
                                  <div style={{ marginTop: 8 }}>
                                    {fields.map((field) => (
                                      <Row key={field.key} gutter={10} style={{ marginBottom: 8 }}>
                                        <Col xs={24} md={12}>
                                          <Form.Item
                                            {...field}
                                            name={[field.name, 'service_type']}
                                            rules={[{ required: true, message: 'Obrigatório' }]}
                                          >
                                            <Select placeholder="Tipo">
                                              <Option value="Fisioterapia">Fisioterapia</Option>
                                              <Option value="Psicologia">Psicologia</Option>
                                              <Option value="Fonoaudiologia">Fonoaudiologia</Option>
                                              <Option value="Terapia Ocupacional">Terapia Ocupacional</Option>
                                              <Option value="Pedagogia">Pedagogia</Option>
                                              <Option value="Médico">Médico</Option>
                                            </Select>
                                          </Form.Item>
                                        </Col>
                                        <Col xs={24} md={10}>
                                          <Form.Item
                                            {...field}
                                            name={[field.name, 'amount']}
                                            rules={[{ required: true, message: 'Obrigatório' }]}
                                          >
                                            <InputNumber min={0} step={1} style={{ width: '100%' }} addonBefore="R$" />
                                          </Form.Item>
                                        </Col>
                                        <Col xs={24} md={2} style={{ display: 'flex', alignItems: 'center' }}>
                                          <Button danger onClick={() => remove(field.name)} size="small">
                                            Remover
                                          </Button>
                                        </Col>
                                      </Row>
                                    ))}
                                  </div>
                                </>
                              )}
                            </Form.List>
                          ) : null}

                          {mode === 'professional' ? (
                            <Form.List name="auto_charge_professional_rate_list">
                              {(fields, { add, remove }) => (
                                <>
                                  <Row gutter={15} align="middle">
                                    <Col xs={24}>
                                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                        <div style={{ fontWeight: 600 }}>Valores por profissional</div>
                                        <Button onClick={() => add()} size="small">
                                          Adicionar
                                        </Button>
                                      </div>
                                    </Col>
                                  </Row>
                                  <div style={{ marginTop: 8 }}>
                                    {fields.map((field) => (
                                      <Row key={field.key} gutter={10} style={{ marginBottom: 8 }}>
                                        <Col xs={24} md={12}>
                                          <Form.Item
                                            {...field}
                                            name={[field.name, 'professional_id']}
                                            rules={[{ required: true, message: 'Obrigatório' }]}
                                          >
                                            <Select placeholder="Profissional" showSearch optionFilterProp="children">
                                              {healthProfessionals.map((p) => (
                                                <Option key={p.id} value={String(p.id)}>
                                                  {p.name}
                                                </Option>
                                              ))}
                                            </Select>
                                          </Form.Item>
                                        </Col>
                                        <Col xs={24} md={10}>
                                          <Form.Item
                                            {...field}
                                            name={[field.name, 'amount']}
                                            rules={[{ required: true, message: 'Obrigatório' }]}
                                          >
                                            <InputNumber min={0} step={1} style={{ width: '100%' }} addonBefore="R$" />
                                          </Form.Item>
                                        </Col>
                                        <Col xs={24} md={2} style={{ display: 'flex', alignItems: 'center' }}>
                                          <Button danger onClick={() => remove(field.name)} size="small">
                                            Remover
                                          </Button>
                                        </Col>
                                      </Row>
                                    ))}
                                  </div>
                                </>
                              )}
                            </Form.List>
                          ) : null}

                          <Row gutter={15} style={{ marginTop: 8 }}>
                            <Col xs={24} md={8}>
                              <Form.Item name="auto_charge_expense_destination" label="Favorecido (Destino)">
                                <Input placeholder="Ex: Atendimento" />
                              </Form.Item>
                            </Col>
                            <Col xs={24} md={8}>
                              <Form.Item
                                name="auto_charge_expense_category_id"
                                label={
                                  <span>
                                    Categoria (plano de contas){' '}
                                    <Tooltip title="Opcional. Use se você já organiza despesas por categoria/conta contábil. Se não souber, deixe em branco.">
                                      <QuestionCircleOutlined style={{ marginLeft: 4 }} />
                                    </Tooltip>
                                  </span>
                                }
                              >
                                <InputNumber min={1} step={1} style={{ width: '100%' }} placeholder="Ex: 101" />
                              </Form.Item>
                            </Col>
                            <Col xs={24} md={8}>
                              <Form.Item
                                name="auto_charge_expense_description"
                                label={
                                  <span>
                                    Descrição automática{' '}
                                    <Tooltip title="Este texto é um modelo. Os campos entre { } são preenchidos automaticamente no momento da finalização do atendimento.">
                                      <QuestionCircleOutlined style={{ marginLeft: 4 }} />
                                    </Tooltip>
                                  </span>
                                }
                              >
                                <Input placeholder="Ex: Atendimento #{attendance_id} - {child_name}" />
                              </Form.Item>
                              <div style={{ marginTop: -6, marginBottom: 8 }}>
                                <div style={{ color: '#8c8c8c', fontSize: 12, marginBottom: 6 }}>
                                  Toque para inserir campos automáticos:
                                </div>
                                <Space size={6} wrap>
                                  <Button size="small" onClick={() => appendDescriptionToken('{attendance_id}')}>
                                    Atendimento
                                  </Button>
                                  <Button size="small" onClick={() => appendDescriptionToken('{child_name}')}>
                                    Criança
                                  </Button>
                                  <Button size="small" onClick={() => appendDescriptionToken('{professional_name}')}>
                                    Profissional
                                  </Button>
                                  <Button size="small" onClick={() => appendDescriptionToken('{wallet_name}')}>
                                    Carteira
                                  </Button>
                                </Space>
                              </div>
                              <Form.Item noStyle shouldUpdate={(p, c) => p.auto_charge_expense_description !== c.auto_charge_expense_description}>
                                {({ getFieldValue }) => {
                                  const templateText = getFieldValue('auto_charge_expense_description') || '';
                                  if (!templateText) return null;
                                  const preview = templateText
                                    .replaceAll('{attendance_id}', '123')
                                    .replaceAll('{child_name}', 'João da Silva')
                                    .replaceAll('{professional_name}', 'Dra. Maria')
                                    .replaceAll('{wallet_name}', 'Fundo Saúde');
                                  return (
                                    <div style={{ marginTop: -4, color: '#8c8c8c', fontSize: 12 }}>
                                      Exemplo: {preview}
                                    </div>
                                  );
                                }}
                              </Form.Item>
                            </Col>
                          </Row>
                        </>
                      );
                    }}
                  </Form.Item>
                </Card>

                <Row justify="end" style={{ marginTop: 16 }}>
                  <Col>
                    <Button style={{ marginRight: 8 }} onClick={() => router.push('/admin/wallets')}>
                      Cancelar
                    </Button>
                    <Button type="primary" htmlType="submit" loading={loading}>
                      {isEditMode ? 'Salvar Alterações' : 'Criar Carteira'}
                    </Button>
                  </Col>
                </Row>
              </Form>
            </Cards>
          </Col>
        </Row>
      </Main>
    </>
  );
}

export default AddWallet;
