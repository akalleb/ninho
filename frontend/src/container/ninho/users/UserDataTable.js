import React, { useState, useEffect } from 'react';
import { Row, Col, Table, Button, Modal, App } from 'antd';
import FeatherIcon from 'feather-icons-react';
import { useRouter } from 'next/navigation';
import { PageHeader } from '../../../components/page-headers/page-headers';
import { Main } from '../../styled';
import { Cards } from '../../../components/cards/frame/cards-frame';
import api from '../../../config/api/axios';

function UserDataTable() {
  const [professionals, setProfessionals] = useState([]);
  const [loading, setLoading] = useState(true);
  const [viewingProfessional, setViewingProfessional] = useState(null);
  const router = useRouter();
  const { notification } = App.useApp();

  const fetchProfessionals = async () => {
    setLoading(true);
    try {
      const response = await api.get('/professionals/');
      setProfessionals(response.data);
    } catch (error) {
      notification.error({
        message: 'Erro ao carregar colaboradores',
        description: error.message,
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProfessionals();
  }, []);

  const handleView = (record) => {
    setViewingProfessional(record);
  };

  const handleEdit = (id) => {
    router.push(`/admin/dashboard/users/add-user?id=${id}`);
  };

  const handleDelete = async (id) => {
    Modal.confirm({
      title: 'Tem certeza que deseja excluir este colaborador?',
      content: 'Esta ação não pode ser desfeita.',
      okText: 'Sim, Excluir',
      okType: 'danger',
      cancelText: 'Cancelar',
      onOk: async () => {
        try {
          await api.delete(`/professionals/${id}`);
          notification.success({
            message: 'Colaborador excluído com sucesso',
          });
          fetchProfessionals();
        } catch (error) {
          notification.error({
            message: 'Erro ao excluir colaborador',
            description: error.message,
          });
        }
      },
    });
  };

  const handleToggleStatus = async (record) => {
    const newStatus = record.status === 'active' ? 'inactive' : 'active';
    try {
      await api.put(`/professionals/${record.id}/status`, { status: newStatus });
      setProfessionals((prev) =>
        prev.map((item) =>
          item.id === record.id ? { ...item, status: newStatus } : item,
        ),
      );
      notification.success({
        message: 'Status atualizado',
      });
    } catch (error) {
      notification.error({
        message: 'Erro ao atualizar status',
        description: error.message,
      });
    }
  };

  const columns = [
    {
      title: 'Nome',
      dataIndex: 'name',
      key: 'name',
    },
    {
      title: 'E-mail',
      dataIndex: 'email',
      key: 'email',
    },
    {
      title: 'Vínculo',
      dataIndex: 'employment_type',
      key: 'employment_type',
      render: (type) => (type === 'effective' ? 'Efetivo' : 'Voluntário'),
    },
    {
      title: 'Função',
      dataIndex: 'role',
      key: 'role',
      render: (role) => {
        let label = role;
        if (role === 'admin') {
            label = 'Gestor';
        } else if (role === 'operational') {
            label = 'Operacional';
        } else if (role === 'health') {
            label = 'Saúde';
        }
        return label;
      },
    },
    {
      title: 'Status',
      dataIndex: 'status',
      key: 'status',
      render: (status, record) => (
        <Button
          size="small"
          type={status === 'active' ? 'primary' : 'default'}
          onClick={() => handleToggleStatus(record)}
        >
          {status === 'active' ? 'Ativo' : 'Inativo'}
        </Button>
      ),
    },
    {
      title: 'Ações',
      key: 'action',
      render: (_, record) => (
        <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
          <Button 
            size="small" 
            type="default"
            icon={<FeatherIcon icon="eye" size={14} />}
            onClick={() => handleView(record)}
          />
          <Button 
            size="small" 
            type="primary" 
            icon={<FeatherIcon icon="edit" size={14} />}
            onClick={() => handleEdit(record.id)}
          />
          <Button 
            size="small" 
            type="primary"
            danger 
            icon={<FeatherIcon icon="trash-2" size={14} />}
            onClick={() => handleDelete(record.id)}
          />
        </div>
      ),
    },
  ];

  return (
    <>
      <PageHeader
        ghost
        title="Lista de Colaboradores"
        buttons={[
          <Button key="1" type="primary" size="small" onClick={() => router.push('/admin/dashboard/users/add-user')}>
            <FeatherIcon icon="plus" size={14} /> Adicionar Novo Colaborador
          </Button>,
        ]}
      />
      <Main>
        <Row gutter={25}>
          <Col xs={24}>
            <Cards headless>
              <Table
                className="table-responsive"
                pagination={{ pageSize: 10 }}
                locale={{ emptyText: 'Nenhum colaborador cadastrado' }}
                dataSource={professionals}
                columns={columns}
                loading={loading}
                rowKey="id"
              />
              <Modal
                open={!!viewingProfessional}
                title="Detalhes do Colaborador"
                footer={[
                  <Button key="close" onClick={() => setViewingProfessional(null)}>
                    Fechar
                  </Button>,
                ]}
                onCancel={() => setViewingProfessional(null)}
              >
                {viewingProfessional && (
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr', rowGap: 8 }}>
                    <div>
                      <strong>Nome:</strong> {viewingProfessional.name}
                    </div>
                    <div>
                      <strong>E-mail:</strong> {viewingProfessional.email}
                    </div>
                    <div>
                      <strong>CPF:</strong> {viewingProfessional.cpf}
                    </div>
                    <div>
                      <strong>RG:</strong> {viewingProfessional.rg || '-'}
                    </div>
                    <div>
                      <strong>Vínculo:</strong>{' '}
                      {viewingProfessional.employment_type === 'effective' ? 'Efetivo' : 'Voluntário'}
                    </div>
                    <div>
                      <strong>Perfil de Acesso:</strong>{' '}
                      {viewingProfessional.role === 'admin'
                        ? 'Gestor'
                        : viewingProfessional.role === 'operational'
                        ? 'Operacional'
                        : 'Profissional de Saúde'}
                    </div>
                    <div>
                      <strong>Função:</strong> {viewingProfessional.function_role || '-'}
                    </div>
                    <div>
                      <strong>Endereço:</strong> {viewingProfessional.address || '-'}
                    </div>
                    <div>
                      <strong>Dados Bancários:</strong> {viewingProfessional.bank_data || '-'}
                    </div>
                    <div>
                      <strong>CBO:</strong> {viewingProfessional.cbo || '-'}
                    </div>
                    <div>
                      <strong>Conselho de Classe:</strong> {viewingProfessional.registry_number || '-'}
                    </div>
                  </div>
                )}
              </Modal>
            </Cards>
          </Col>
        </Row>
      </Main>
    </>
  );
}

export default UserDataTable;
