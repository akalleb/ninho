import React, { useState, useEffect } from 'react';
import { Row, Col, Form, Input, Select, DatePicker, Button, App, Upload, InputNumber } from 'antd';
import FeatherIcon from 'feather-icons-react';
import { Main } from '../../styled';
import { Cards } from '../../../components/cards/frame/cards-frame';
import api from '../../../config/api/axios';
import { useRouter, useSearchParams } from 'next/navigation';
import dayjs from 'dayjs';

const { Option } = Select;
const { TextArea } = Input;

function AddResourceSource() {
  const [form] = Form.useForm();
  const router = useRouter();
  const searchParams = useSearchParams();
  const sourceId = searchParams.get('id');
  const isEditMode = !!sourceId;
  const [loading, setLoading] = useState(false);
  const { notification } = App.useApp();
  
  const [sourceType, setSourceType] = useState(null);
  const [fileList, setFileList] = useState([]);

  useEffect(() => {
    const loadSource = async () => {
      if (!sourceId) return;
      try {
        const { data } = await api.get(`/resource-sources/${sourceId}`);
        
        form.setFieldsValue({
          ...data,
          term_start: data.term_start ? dayjs(data.term_start) : null,
          term_end: data.term_end ? dayjs(data.term_end) : null,
        });
        setSourceType(data.type);
        if (data.document_url) {
            setFileList([{
                uid: '-1',
                name: 'Documento Anexado',
                status: 'done',
                url: data.document_url,
            }]);
        }
      } catch (error) {
        notification.error({
          message: 'Erro ao carregar fonte',
          description: error.response?.data?.detail || error.message,
        });
      }
    };
    loadSource();
  }, [sourceId]);

  const handleSubmit = async (values) => {
    setLoading(true);
    try {
      const formattedValues = {
        ...values,
        term_start: values.term_start ? values.term_start.format('YYYY-MM-DD') : null,
        term_end: values.term_end ? values.term_end.format('YYYY-MM-DD') : null,
      };

      let response;
      if (isEditMode) {
        response = await api.put(`/resource-sources/${sourceId}`, formattedValues);
      } else {
        response = await api.post('/resource-sources/', formattedValues);
      }
      
      const currentId = isEditMode ? sourceId : response.data.id;

      // Handle File Upload
      if (fileList.length > 0 && fileList[0].originFileObj) {
        const formData = new FormData();
        formData.append('file', fileList[0].originFileObj);
        await api.post(`/resource-sources/${currentId}/document`, formData, {
            headers: { 'Content-Type': 'multipart/form-data' }
        });
      }
      
      notification.success({
        message: 'Sucesso',
        description: isEditMode
          ? 'Fonte atualizada com sucesso!'
          : 'Fonte cadastrada com sucesso!',
      });
      
      router.push('/admin/resource-sources');
    } catch (error) {
      notification.error({
        message: 'Erro no Cadastro',
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

  return (
    <>
      <Main>
        <Row gutter={25}>
          <Col xs={24}>
            <Cards 
                title={isEditMode ? "Editar Fonte de Recurso" : "Nova Fonte de Recurso"}
                extra={
                    <div style={{ display: 'flex', gap: '10px' }}>
                      <Button onClick={() => router.push('/admin/resource-sources')}>
                        Cancelar
                      </Button>
                      <Button type="primary" onClick={() => form.submit()} loading={loading}>
                        Salvar Fonte
                      </Button>
                    </div>
                }
            >
              <Form
                form={form}
                layout="vertical"
                onFinish={handleSubmit}
                onValuesChange={(changedValues) => {
                    if (changedValues.type) setSourceType(changedValues.type);
                }}
              >
                <Row gutter={25}>
                  <Col xs={24} md={12}>
                    <Form.Item name="name" label="Nome da Fonte" rules={[{ required: true, message: 'Obrigatório' }]}>
                      <Input placeholder="Ex: Emenda Deputado X" />
                    </Form.Item>
                  </Col>
                  <Col xs={24} md={12}>
                    <Form.Item name="type" label="Tipo de Fonte" rules={[{ required: true, message: 'Obrigatório' }]}>
                      <Select placeholder="Selecione o tipo">
                        <Option value="emenda">Emenda Parlamentar</Option>
                        <Option value="doacao">Doação</Option>
                        <Option value="convenio">Convênio</Option>
                        <Option value="evento">Evento</Option>
                        <Option value="crowdfunding">Crowdfunding</Option>
                      </Select>
                    </Form.Item>
                  </Col>

                  {/* Condicionais */}
                  {sourceType === 'emenda' && (
                    <Col xs={24} md={12}>
                      <Form.Item name="amendment_number" label="Número da Emenda">
                        <Input />
                      </Form.Item>
                    </Col>
                  )}

                  {(sourceType === 'doacao' || sourceType === 'convenio') && (
                    <Col xs={24} md={12}>
                      <Form.Item name="donor_institution" label="Instituição Doadora/Parceira">
                        <Input />
                      </Form.Item>
                    </Col>
                  )}

                  {sourceType === 'convenio' && (
                    <>
                        <Col xs={24} md={6}>
                        <Form.Item name="term_start" label="Início da Vigência">
                            <DatePicker format="DD/MM/YYYY" style={{ width: '100%' }} />
                        </Form.Item>
                        </Col>
                        <Col xs={24} md={6}>
                        <Form.Item name="term_end" label="Fim da Vigência">
                            <DatePicker format="DD/MM/YYYY" style={{ width: '100%' }} />
                        </Form.Item>
                        </Col>
                    </>
                  )}

                  <Col xs={24} md={12}>
                    <Form.Item name="total_value_estimated" label="Valor Total Estimado (R$)">
                        <InputNumber
                            style={{ width: '100%' }}
                            formatter={(value) => `R$ ${value}`.replace(/\B(?=(\d{3})+(?!\d))/g, '.')}
                            parser={(value) => value.replace(/R\$\s?|(\.*)/g, '').replace(',', '.')}
                        />
                    </Form.Item>
                  </Col>

                  <Col xs={24} md={12}>
                    <Form.Item name="status" label="Status" initialValue="active">
                      <Select>
                        <Option value="active">Ativo</Option>
                        <Option value="in_progress">Em Vigência</Option>
                        <Option value="inactive">Inativo</Option>
                      </Select>
                    </Form.Item>
                  </Col>

                  <Col xs={24}>
                    <Form.Item name="description" label="Descrição Detalhada">
                      <TextArea rows={4} />
                    </Form.Item>
                  </Col>

                  <Col xs={24}>
                    <Form.Item label="Anexar Documento (PDF/Imagem)">
                        <Upload {...uploadProps} maxCount={1}>
                            <Button icon={<FeatherIcon icon="upload" size={14} />}>Selecionar Arquivo</Button>
                        </Upload>
                    </Form.Item>
                  </Col>

                  <Col xs={24} style={{ textAlign: 'right', marginTop: 16 }}>
                    <Button style={{ marginRight: 8 }} onClick={() => router.push('/admin/resource-sources')}>
                      Cancelar
                    </Button>
                    <Button type="primary" htmlType="submit" loading={loading}>
                      Salvar
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

export default AddResourceSource;
