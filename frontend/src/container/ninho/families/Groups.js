'use client';
import React, { useState, useEffect } from 'react';
import { Row, Col, Table, Button, Input, Modal, Form, App, Tag, Cards, Skeleton } from 'antd';
import FeatherIcon from 'feather-icons-react';
import { PageHeader } from '../../../components/page-headers/page-headers';
import { Main } from '../../styled';
import api from '../../../config/api/axios';

function Groups() {
  const [groups, setGroups] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [form] = Form.useForm();
  
  const { notification } = App.useApp();

  const fetchGroups = async () => {
    setLoading(true);
    try {
      const { data } = await api.get('/families/groups');
      setGroups(data);
    } catch (error) {
      notification.error({ message: 'Erro ao carregar grupos', description: error.message });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchGroups();
  }, []);

  const handleCreateGroup = async (values) => {
    setIsSubmitting(true);
    try {
      await api.post('/families/groups', values);
      notification.success({ message: 'Grupo criado com sucesso' });
      setIsModalOpen(false);
      form.resetFields();
      fetchGroups();
    } catch (error) {
      notification.error({ message: 'Erro ao criar grupo', description: error.message });
    } finally {
      setIsSubmitting(false);
    }
  };

  const columns = [
    { title: 'Nome do Grupo', dataIndex: 'name', key: 'name', render: (text) => <strong>{text}</strong> },
    { title: 'Categoria', dataIndex: 'category', key: 'category', render: (cat) => <Tag color="blue">{cat || 'Geral'}</Tag> },
    { title: 'Descrição', dataIndex: 'description', key: 'description' },
    { title: 'Criado em', dataIndex: 'created_at', key: 'created_at', render: (date) => new Date(date).toLocaleDateString() },
  ];

  return (
    <>
      <PageHeader
        title="Gestão de Grupos de Famílias"
        buttons={[
          <Button key="1" type="primary" onClick={() => setIsModalOpen(true)}>
            <FeatherIcon icon="plus" size={14} /> Novo Grupo
          </Button>,
        ]}
      />
      <Main>
        <Row gutter={25}>
          <Col md={24}>
            <div style={{ backgroundColor: '#fff', padding: '25px', borderRadius: '10px' }}>
              {loading ? <Skeleton active /> : (
                <Table 
                  dataSource={groups} 
                  columns={columns} 
                  rowKey="id" 
                  pagination={{ pageSize: 10 }}
                />
              )}
            </div>
          </Col>
        </Row>

        <Modal
          title="Criar Novo Grupo"
          open={isModalOpen}
          onCancel={() => setIsModalOpen(false)}
          footer={null}
        >
          <Form form={form} layout="vertical" onFinish={handleCreateGroup}>
            <Form.Item name="name" label="Nome do Grupo" rules={[{ required: true, message: 'Por favor, insira o nome' }]}>
              <Input placeholder="Ex: Bairro Centro, Gestantes, etc." />
            </Form.Item>
            <Form.Item name="category" label="Categoria (Opcional)">
              <Input placeholder="Ex: Localização, Programa Social, Evento" />
            </Form.Item>
            <Form.Item name="description" label="Descrição">
              <Input.TextArea rows={4} placeholder="Para que serve este grupo?" />
            </Form.Item>
            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 10 }}>
              <Button onClick={() => setIsModalOpen(false)}>Cancelar</Button>
              <Button type="primary" htmlType="submit" loading={isSubmitting}>Criar Grupo</Button>
            </div>
          </Form>
        </Modal>
      </Main>
    </>
  );
}

export default Groups;
