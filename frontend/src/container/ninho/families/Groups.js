'use client';
import React, { useState, useEffect } from 'react';
import { Row, Col, Table, Button, Input, Modal, Form, App, Tag, Cards, Skeleton, Select, Popconfirm } from 'antd';
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
  
  const [selectedGroup, setSelectedGroup] = useState(null);
  const [members, setMembers] = useState([]);
  const [membersLoading, setMembersLoading] = useState(false);
  const [isMembersModalOpen, setIsMembersModalOpen] = useState(false);
  
  const [allFamilies, setAllFamilies] = useState([]);
  const [isAddingMember, setIsAddingMember] = useState(false);

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

  const fetchAllFamilies = async () => {
    try {
      const { data } = await api.get('/families/?limit=2000');
      setAllFamilies(data);
    } catch (error) {
      console.error('Erro ao carregar famílias para busca', error);
    }
  };

  const fetchMembers = async (group) => {
    setSelectedGroup(group);
    setIsMembersModalOpen(true);
    setMembersLoading(true);
    try {
      const { data } = await api.get(`/families/groups/${group.id}/families`);
      setMembers(data);
    } catch (error) {
      notification.error({ message: 'Erro ao carregar integrantes', description: error.message });
    } finally {
      setMembersLoading(false);
    }
  };

  const handleDeleteGroup = async (groupId) => {
    try {
      await api.delete(`/families/groups/${groupId}`);
      notification.success({ message: 'Grupo excluído com sucesso' });
      fetchGroups();
    } catch (error) {
      notification.error({ message: 'Erro ao excluir grupo', description: error.message });
    }
  };

  const handleAddMember = async (familyId) => {
    if (!selectedGroup) return;
    setIsAddingMember(true);
    try {
      await api.post(`/families/groups/${selectedGroup.id}/families/${familyId}`);
      notification.success({ message: 'Família adicionada com sucesso' });
      fetchMembers(selectedGroup); // Refresh list
    } catch (error) {
      notification.error({ message: 'Erro ao adicionar família', description: error.message });
    } finally {
      setIsAddingMember(false);
    }
  };

  const handleRemoveMember = async (familyId) => {
    if (!selectedGroup) return;
    try {
      await api.delete(`/families/groups/${selectedGroup.id}/families/${familyId}`);
      notification.success({ message: 'Família removida com sucesso' });
      fetchMembers(selectedGroup); // Refresh list
    } catch (error) {
      notification.error({ message: 'Erro ao remover família', description: error.message });
    }
  };

  useEffect(() => {
    fetchGroups();
    fetchAllFamilies();
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
    {
      title: 'Ações',
      key: 'actions',
      render: (_, record) => (
        <div style={{ display: 'flex', gap: 10 }}>
          <Button size="small" onClick={() => fetchMembers(record)}>
            <FeatherIcon icon="users" size={14} style={{ marginRight: 5 }} /> Ver Integrantes
          </Button>
          <Popconfirm title="Excluir este grupo definitivamente?" onConfirm={() => handleDeleteGroup(record.id)}>
              <Button size="small" type="primary" danger icon={<FeatherIcon icon="trash-2" size={14} />} />
          </Popconfirm>
        </div>
      )
    }
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
          title={`Integrantes do Grupo: ${selectedGroup?.name}`}
          open={isMembersModalOpen}
          onCancel={() => setIsMembersModalOpen(false)}
          footer={[<Button key="close" onClick={() => setIsMembersModalOpen(false)}>Fechar</Button>]}
          width={800}
        >
          <div style={{ marginBottom: 20 }}>
              <h4>Adicionar Nova Família ao Grupo</h4>
              <Select
                showSearch
                style={{ width: '100%' }}
                placeholder="Pesquise pelo nome do responsável ou CPF"
                optionFilterProp="children"
                onChange={handleAddMember}
                loading={isAddingMember}
                filterOption={(input, option) =>
                    (option?.label ?? '').toLowerCase().includes(input.toLowerCase())
                }
                options={allFamilies.map(f => ({
                    value: f.id,
                    label: `${f.name_responsible} (${f.cpf})`
                }))}
              />
          </div>

          <hr style={{ border: '0.5px solid #eee', marginBottom: 20 }} />

          {membersLoading ? <Skeleton active /> : (
            <Table
              dataSource={members}
              rowKey="id"
              columns={[
                { title: 'Nome do Responsável', dataIndex: 'name_responsible', key: 'name' },
                { title: 'Bairro', dataIndex: 'neighborhood', key: 'neighborhood' },
                {
                    title: 'Ação',
                    key: 'action',
                    render: (_, record) => (
                        <Popconfirm title="Remover este integrante do grupo?" onConfirm={() => handleRemoveMember(record.id)}>
                            <Button type="link" danger icon={<FeatherIcon icon="user-minus" size={14} />} />
                        </Popconfirm>
                    )
                }
              ]}
              pagination={{ pageSize: 5 }}
            />
          )}
        </Modal>

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
