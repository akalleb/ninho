'use client';

import React, { useState, useEffect } from 'react';
import { Row, Col, Card, Table, Button, Modal, Form, Input, Select, DatePicker, Switch, Tag, App, Popconfirm } from 'antd';
import { PlusOutlined, DeleteOutlined } from '@ant-design/icons';
import { PageHeader } from '../../../src/components/page-headers/page-headers';
import { Main } from '../../../src/container/styled';
import api from '../../../src/config/api/axios';
import { useSelector } from 'react-redux';
import withAdminLayout from '../../../src/layout/withAdminLayout';

const { Option } = Select;
const { TextArea } = Input;

function NotificationsPage() {
  const [notifications, setNotifications] = useState([]);
  const [professionals, setProfessionals] = useState([]); // List for Select
  const [loading, setLoading] = useState(true);
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [form] = Form.useForm();
  const { message } = App.useApp();
  
  // Auth info for "created_by" if needed
  const { professional_id: professionalId } = useSelector(state => state.auth.login || {});
  const targetAudience = Form.useWatch('target_audience', form);

  const fetchNotifications = async () => {
    setLoading(true);
    try {
      const response = await api.get('/notifications/');
      setNotifications(response.data);
    } catch (error) {
      console.error(error);
      message.error('Erro ao carregar notificações');
    } finally {
      setLoading(false);
    }
  };
  
  const fetchProfessionals = async () => {
    try {
        const response = await api.get('/professionals/');
        setProfessionals(response.data);
    } catch (error) {
        console.error("Erro ao carregar profissionais", error);
    }
  };

  useEffect(() => {
    fetchNotifications();
    fetchProfessionals();
  }, []);

  const handleCreate = async (values) => {
    try {
      const payload = {
        ...values,
        expires_at: values.expires_at ? values.expires_at.toISOString() : null,
        created_by_id: professionalId
      };
      
      await api.post('/notifications/', payload);
      message.success('Notificação criada com sucesso!');
      setIsModalVisible(false);
      form.resetFields();
      fetchNotifications();
    } catch (error) {
      console.error(error);
      message.error('Erro ao criar notificação');
    }
  };

  const handleDelete = async (id) => {
    try {
      await api.delete(`/notifications/${id}`);
      message.success('Notificação removida');
      fetchNotifications();
    } catch (error) {
      message.error('Erro ao remover notificação');
    }
  };
  
  const handleToggleActive = async (id, currentState) => {
      try {
          await api.put(`/notifications/${id}?active=${!currentState}`);
          // Optimistic update
          setNotifications(prev => prev.map(n => n.id === id ? { ...n, is_active: !currentState } : n));
          message.success(`Notificação ${!currentState ? 'ativada' : 'desativada'}`);
      } catch (error) {
          message.error('Erro ao atualizar status');
          fetchNotifications(); // Revert on error
      }
  };

  const columns = [
    {
      title: 'Título',
      dataIndex: 'title',
      key: 'title',
    },
    {
      title: 'Mensagem',
      dataIndex: 'message',
      key: 'message',
      ellipsis: true,
    },
    {
      title: 'Tipo',
      dataIndex: 'type',
      key: 'type',
      render: (type) => {
        let color = 'blue';
        if (type === 'warning') color = 'orange';
        if (type === 'error') color = 'red';
        if (type === 'success') color = 'green';
        return <Tag color={color}>{type ? type.toUpperCase() : 'INFO'}</Tag>;
      }
    },
    {
      title: 'Público',
      dataIndex: 'target_audience',
      key: 'target_audience',
      render: (target, record) => {
          if (target === 'individual') {
              const prof = professionals.find(p => p.id === record.target_professional_id);
              return <Tag color="purple">INDIVIDUAL: {prof ? prof.name : record.target_professional_id}</Tag>;
          }
          return <Tag>{target === 'all' ? 'TODOS' : (target ? target.toUpperCase() : 'TODOS')}</Tag>;
      }
    },
    {
        title: 'Validade',
        dataIndex: 'expires_at',
        key: 'expires_at',
        render: (date) => date ? new Date(date).toLocaleDateString() : 'Indefinido'
    },
    {
      title: 'Ativo',
      dataIndex: 'is_active',
      key: 'is_active',
      render: (active, record) => (
          <Switch checked={active} onChange={() => handleToggleActive(record.id, active)} />
      )
    },
    {
      title: 'Ações',
      key: 'action',
      render: (_, record) => (
        <Popconfirm title="Tem certeza que deseja excluir?" onConfirm={() => handleDelete(record.id)}>
          <Button danger icon={<DeleteOutlined />} size="small" type="text" />
        </Popconfirm>
      ),
    },
  ];

  return (
    <>
      <PageHeader
        ghost
        title="Gerenciamento de Notificações"
        buttons={[
          <Button key="1" type="primary" icon={<PlusOutlined />} onClick={() => setIsModalVisible(true)}>
            Nova Notificação
          </Button>,
        ]}
      />
      <Main>
        <Row gutter={25}>
          <Col xs={24}>
            <Card variant="borderless">
              <Table
                pagination={{
                  defaultPageSize: 10,
                  showSizeChanger: true,
                  pageSizeOptions: ['10', '20', '50']
                }}
                dataSource={notifications}
                columns={columns}
                rowKey="id"
                loading={loading}
              />
            </Card>
          </Col>
        </Row>
      </Main>

      <Modal
        title="Nova Notificação"
        open={isModalVisible}
        onCancel={() => setIsModalVisible(false)}
        onOk={() => form.submit()}
      >
        <Form form={form} layout="vertical" onFinish={handleCreate} initialValues={{ type: 'info', target_audience: 'all', is_active: true }}>
          <Form.Item name="title" label="Título" rules={[{ required: true, message: 'Por favor insira um título' }]}>
            <Input placeholder="Ex: Reunião Geral" />
          </Form.Item>
          
          <Form.Item name="message" label="Mensagem" rules={[{ required: true, message: 'Por favor insira uma mensagem' }]}>
            <TextArea rows={4} placeholder="Ex: A reunião acontecerá na sala 2..." />
          </Form.Item>
          
          <Row gutter={16}>
              <Col span={12}>
                  <Form.Item name="type" label="Tipo">
                    <Select>
                      <Option value="info">Informação (Azul)</Option>
                      <Option value="warning">Aviso (Laranja)</Option>
                      <Option value="error">Urgente (Vermelho)</Option>
                      <Option value="success">Sucesso (Verde)</Option>
                    </Select>
                  </Form.Item>
              </Col>
              <Col span={12}>
                  <Form.Item name="target_audience" label="Público Alvo">
                    <Select>
                      <Option value="all">Todos</Option>
                      <Option value="health">Profissionais de Saúde</Option>
                      <Option value="admin">Administrativo</Option>
                      <Option value="individual">Usuário Específico</Option>
                    </Select>
                  </Form.Item>
              </Col>
          </Row>

          {targetAudience === 'individual' && (
              <Form.Item 
                  name="target_professional_id" 
                  label="Selecione o Usuário" 
                  rules={[{ required: true, message: 'Selecione um usuário' }]}
              >
                  <Select 
                      showSearch 
                      placeholder="Busque pelo nome..."
                      optionFilterProp="children"
                      filterOption={(input, option) => (option?.children ?? '').toLowerCase().includes(input.toLowerCase())}
                  >
                      {professionals.map(p => (
                          <Option key={p.id} value={p.id}>{p.name} - {p.role}</Option>
                      ))}
                  </Select>
              </Form.Item>
          )}
          
          <Form.Item name="expires_at" label="Expira em (Opcional)">
            <DatePicker style={{ width: '100%' }} format="DD/MM/YYYY" />
          </Form.Item>
          
          <Form.Item name="is_active" valuePropName="checked" label="Status Inicial">
            <Switch checkedChildren="Ativo" unCheckedChildren="Inativo" />
          </Form.Item>
        </Form>
      </Modal>
    </>
  );
}

export default withAdminLayout(NotificationsPage);
