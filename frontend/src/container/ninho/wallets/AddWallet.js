import React, { useState, useEffect } from 'react';
import { Row, Col, Form, Input, Select, Button, Card, App, Switch, InputNumber, Tooltip } from 'antd';
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

  useEffect(() => {
    const loadWallet = async () => {
      if (!walletId) return;
      try {
        const { data } = await api.get(`/wallets/${walletId}`);
        form.setFieldsValue(data);
      } catch (error) {
        notification.error({
          message: 'Erro ao carregar carteira',
          description: error.response?.data?.detail || error.message,
        });
      }
    };
    loadWallet();
  }, [walletId]);

  const handleSubmit = async (values) => {
    setLoading(true);
    try {
      if (isEditMode) {
        await api.put(`/wallets/${walletId}`, values);
      } else {
        await api.post('/wallets/', values);
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
                initialValues={{ is_restricted: false, balance: 0 }}
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
