import React, { useState, useEffect } from 'react';
import { Row, Col, Form, Input, Select, DatePicker, Button, App, Upload, InputNumber } from 'antd';
import FeatherIcon from 'feather-icons-react';
import { Main } from '../../styled';
import { Cards } from '../../../components/cards/frame/cards-frame';
import api from '../../../config/api/axios';
import { useRouter } from 'next/navigation';

const { Option } = Select;
const { TextArea } = Input;

function AddIncome() {
  const [form] = Form.useForm();
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const { notification } = App.useApp();
  
  const [sources, setSources] = useState([]);
  const [wallets, setWallets] = useState([]);
  const [fileList, setFileList] = useState([]);
  const [selectedWallet, setSelectedWallet] = useState(null);

  useEffect(() => {
    const fetchData = async () => {
        try {
            const [sourcesRes, walletsRes] = await Promise.all([
                api.get('/resource-sources/', { params: { status: 'active' } }),
                api.get('/wallets/')
            ]);
            setSources(sourcesRes.data);
            setWallets(walletsRes.data);
        } catch (error) {
            notification.error({ message: 'Erro ao carregar dados auxiliares' });
        }
    };
    fetchData();
  }, []);

  const handleSubmit = async (values) => {
    setLoading(true);
    try {
      const formattedValues = {
        ...values,
        received_at: values.received_at ? values.received_at.format('YYYY-MM-DD') : null,
      };

      const response = await api.post('/revenues/', formattedValues);
      
      // Handle Receipt Upload
      if (fileList.length > 0 && fileList[0].originFileObj) {
        const formData = new FormData();
        formData.append('file', fileList[0].originFileObj);
        await api.post(`/revenues/${response.data.id}/receipt`, formData, {
            headers: { 'Content-Type': 'multipart/form-data' }
        });
      }
      
      notification.success({
        message: 'Receita Registrada',
        description: 'O valor foi adicionado ao saldo da carteira.',
      });
      
      router.push('/admin/incomes');
    } catch (error) {
      notification.error({
        message: 'Erro no Registro',
        description: error.response?.data?.detail || 'Não foi possível salvar os dados.',
      });
    } finally {
      setLoading(false);
    }
  };

  const uploadProps = {
    onRemove: (file) => {
      setFileList((prev) => {
        const index = prev.indexOf(file);
        const newFileList = prev.slice();
        newFileList.splice(index, 1);
        return newFileList;
      });
    },
    beforeUpload: (file) => {
      setFileList([file]);
      return false;
    },
    fileList,
  };

  // Filter sources based on wallet restriction
  const filteredSources = sources.filter(source => {
      if (!selectedWallet) return true;
      if (!selectedWallet.is_restricted) return true;
      // If restricted, allow if linked to wallet OR if no specific link (assuming compatibility for now)
      // Ideally should be strict, but per implementation logic:
      return !source.wallet_id || source.wallet_id === selectedWallet.id;
  });

  return (
    <>
      <Main>
        <Row gutter={25} justify="center">
          <Col xs={24} md={20} lg={18} xl={16}>
            <Cards 
                title="Nova Receita (Entrada)"
                extra={
                    <div style={{ display: 'flex', gap: '10px' }}>
                      <Button onClick={() => router.push('/admin/incomes')}>
                        Cancelar
                      </Button>
                      <Button type="primary" onClick={() => form.submit()} loading={loading}>
                        Confirmar Entrada
                      </Button>
                    </div>
                }
            >
              <Form
                form={form}
                layout="vertical"
                onFinish={handleSubmit}
              >
                <div style={{ marginBottom: 16, fontWeight: 600, fontSize: 15 }}>
                  Dados da Receita
                </div>
                <Row gutter={25}>
                  <Col xs={24} md={12}>
                    <Form.Item name="wallet_id" label="Carteira de Destino" rules={[{ required: true, message: 'Obrigatório' }]}>
                      <Select 
                        placeholder="Selecione a carteira"
                        onChange={(val) => setSelectedWallet(wallets.find(w => w.id === val))}
                      >
                        {wallets.map(w => (
                            <Option key={w.id} value={w.id}>
                                {w.name} {w.is_restricted ? '(Restrita)' : ''}
                            </Option>
                        ))}
                      </Select>
                    </Form.Item>
                  </Col>
                  <Col xs={24} md={12}>
                    <Form.Item name="source_id" label="Fonte de Recurso" rules={[{ required: true, message: 'Obrigatório' }]}>
                      <Select placeholder="Selecione a fonte" disabled={!selectedWallet}>
                        {filteredSources.map(s => <Option key={s.id} value={s.id}>{s.name}</Option>)}
                      </Select>
                    </Form.Item>
                  </Col>

                  <Col xs={24} md={12}>
                    <Form.Item name="amount" label="Valor Recebido (R$)" rules={[{ required: true, message: 'Obrigatório' }]}>
                        <InputNumber
                            style={{ width: '100%' }}
                            formatter={(value) => `R$ ${value}`.replace(/\B(?=(\d{3})+(?!\d))/g, '.')}
                            parser={(value) => value.replace(/R\$\s?|(\.*)/g, '').replace(',', '.')}
                        />
                    </Form.Item>
                  </Col>

                  <Col xs={24} md={12}>
                    <Form.Item name="received_at" label="Data do Recebimento" rules={[{ required: true, message: 'Obrigatório' }]}>
                      <DatePicker format="DD/MM/YYYY" style={{ width: '100%' }} />
                    </Form.Item>
                  </Col>

                  <Col xs={24} md={12}>
                    <Form.Item name="origin_sphere" label="Esfera de Origem" initialValue="privado" rules={[{ required: true }]}>
                      <Select>
                        <Option value="federal">Federal</Option>
                        <Option value="estadual">Estadual</Option>
                        <Option value="municipal">Municipal</Option>
                        <Option value="privado">Privado</Option>
                      </Select>
                    </Form.Item>
                  </Col>

                  <Col xs={24} md={12}>
                    <Form.Item name="tracking_code" label="Código de Rastreio / Empenho (Opcional)">
                        <Input placeholder="Ex: SIAFI 2024NE000123" />
                    </Form.Item>
                  </Col>

                  <Col xs={24} md={12}>
                    <Form.Item name="status" label="Status Inicial" initialValue="pendente">
                      <Select>
                        <Option value="pendente">Pendente (Previsto)</Option>
                        <Option value="recebido">Recebido (Em conta)</Option>
                        <Option value="conciliado">Conciliado (Conferido)</Option>
                      </Select>
                    </Form.Item>
                  </Col>

                  <Col xs={24} md={12}>
                    <Form.Item name="payment_method" label="Forma de Pagamento" rules={[{ required: true, message: 'Obrigatório' }]}>
                      <Select>
                        <Option value="transferencia">Transferência Bancária</Option>
                        <Option value="pix">Pix</Option>
                        <Option value="boleto">Boleto</Option>
                        <Option value="deposito">Depósito</Option>
                        <Option value="cheque">Cheque</Option>
                      </Select>
                    </Form.Item>
                  </Col>
                </Row>

                <div style={{ margin: '24px 0 16px', fontWeight: 600, fontSize: 15 }}>
                  Documentos e Observações
                </div>
                <Row gutter={25}>
                  <Col xs={24}>
                    <Form.Item label="Documentos de Rastreio (Notas, Ofícios, Extratos)">
                        <Upload {...uploadProps} maxCount={5} multiple>
                            <Button icon={<FeatherIcon icon="upload" size={14} />}>Anexar Documentos</Button>
                        </Upload>
                    </Form.Item>
                  </Col>

                  <Col xs={24}>
                    <Form.Item name="description" label="Descrição / Observações">
                      <TextArea rows={3} />
                    </Form.Item>
                  </Col>
                </Row>
                <Row justify="end" style={{ marginTop: 16 }}>
                  <Col>
                    <Button style={{ marginRight: 8 }} onClick={() => router.push('/admin/incomes')}>
                      Cancelar
                    </Button>
                    <Button type="primary" htmlType="submit" loading={loading}>
                      Confirmar Entrada
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

export default AddIncome;
