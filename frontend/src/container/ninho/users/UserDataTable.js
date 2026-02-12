import React, { useState, useEffect } from 'react';
import { Row, Col, Table, Button, Modal, App, Drawer, Descriptions, Tag, Avatar, Divider } from 'antd';
import FeatherIcon from 'feather-icons-react';
import { useRouter } from 'next/navigation';
import { PageHeader } from '../../../components/page-headers/page-headers';
import { Main } from '../../styled';
import { Cards } from '../../../components/cards/frame/cards-frame';
import api from '../../../config/api/axios';
import { UserOutlined } from '@ant-design/icons';
import moment from 'moment';

function UserDataTable() {
  const [professionals, setProfessionals] = useState([]);
  const [loading, setLoading] = useState(true);
  const [viewingProfessional, setViewingProfessional] = useState(null);
  const router = useRouter();
  const { notification, modal } = App.useApp();
  const apiBaseUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';

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
    modal.confirm({
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
            description: error.response?.data?.detail || error.message,
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
      render: (text, record) => (
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
              <Avatar
                src={record.avatar_url ? `${apiBaseUrl}${record.avatar_url}` : undefined}
                icon={<UserOutlined />}
              />
              <span>{text}</span>
          </div>
      )
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
      render: (type) => {
        if (!type) {
          return (
            <Tag
              style={{
                fontSize: 12,
                fontWeight: 500,
                borderRadius: 14,
                padding: '2px 10px',
                backgroundColor: '#fafafa',
                color: '#8c8c8c',
                border: '1px dashed #d9d9d9',
              }}
            >
              Não informado
            </Tag>
          );
        }

        const isEffective = type === 'effective';
        const backgroundColor = isEffective ? '#e6f4ff' : '#f6ffed';
        const color = isEffective ? '#0958d9' : '#237804';
        const borderColor = isEffective ? '#91caff' : '#b7eb8f';
        const label = isEffective ? 'Efetivo' : 'Voluntário';

        return (
          <Tag
            style={{
              minWidth: 100,
              textAlign: 'center',
              fontSize: 12,
              fontWeight: 600,
              padding: '2px 10px',
              borderRadius: 14,
              backgroundColor,
              color,
              border: `1px solid ${borderColor}`,
            }}
          >
            {label}
          </Tag>
        );
      },
    },
    {
      title: 'Função',
      dataIndex: 'role',
      key: 'role',
      render: (role) => {
        if (!role) {
          return (
            <Tag
              style={{
                fontSize: 12,
                fontWeight: 500,
                borderRadius: 14,
                padding: '2px 10px',
                backgroundColor: '#fafafa',
                color: '#8c8c8c',
                border: '1px dashed #d9d9d9',
              }}
            >
              Não informado
            </Tag>
          );
        }

        let label = role;
        let backgroundColor = '#f5f5f5';
        let color = '#595959';
        let borderColor = '#d9d9d9';

        if (role === 'admin') {
          label = 'Gestor';
          backgroundColor = '#f9f0ff';
          color = '#531dab';
          borderColor = '#d3adf7';
        } else if (role === 'operational') {
          label = 'Operacional';
          backgroundColor = '#e6fffb';
          color = '#006d75';
          borderColor = '#87e8de';
        } else if (role === 'health') {
          label = 'Saúde';
          backgroundColor = '#fff0f6';
          color = '#c41d7f';
          borderColor = '#ffadd2';
        }

        return (
          <Tag
            style={{
              minWidth: 110,
              textAlign: 'center',
              fontSize: 12,
              fontWeight: 600,
              padding: '2px 10px',
              borderRadius: 14,
              backgroundColor,
              color,
              border: `1px solid ${borderColor}`,
            }}
          >
            {label}
          </Tag>
        );
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
          ghost={status !== 'active'}
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
          <Button key="2" type="default" size="small" onClick={() => router.push('/admin/notifications')}>
             <FeatherIcon icon="bell" size={14} /> Gerenciar Notificações
          </Button>,
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
              
              <Drawer
                width={640}
                placement="right"
                closable={true}
                onClose={() => setViewingProfessional(null)}
                open={!!viewingProfessional}
                title={
                    <div style={{ display: 'flex', alignItems: 'center', gap: 15 }}>
                        <Avatar size={64} src={viewingProfessional?.avatar_url} icon={<UserOutlined />} />
                        <div>
                            <h3 style={{ margin: 0 }}>{viewingProfessional?.name}</h3>
                            <span style={{ color: '#888' }}>{viewingProfessional?.email}</span>
                        </div>
                    </div>
                }
              >
                {viewingProfessional && (
                  <>
                    <Descriptions title="Informações Pessoais" column={1} bordered size="small">
                        <Descriptions.Item label="CPF">{viewingProfessional.cpf}</Descriptions.Item>
                        <Descriptions.Item label="RG">{viewingProfessional.rg || '-'}</Descriptions.Item>
                        <Descriptions.Item label="Data de Nascimento">
                            {viewingProfessional.birth_date ? moment(viewingProfessional.birth_date).format('DD/MM/YYYY') : '-'}
                        </Descriptions.Item>
                    </Descriptions>

                    <Divider />

                    <Descriptions title="Dados Profissionais" column={1} bordered size="small">
                         <Descriptions.Item label="Cargo / Função">{viewingProfessional.function_role || '-'}</Descriptions.Item>
                         <Descriptions.Item label="Perfil de Acesso">
                            {viewingProfessional.role === 'admin' ? 'Gestor' : viewingProfessional.role === 'operational' ? 'Operacional' : 'Profissional de Saúde'}
                         </Descriptions.Item>
                         <Descriptions.Item label="Tipo de Vínculo">
                             {viewingProfessional.employment_type === 'effective' ? 'Efetivo' : 'Voluntário'}
                         </Descriptions.Item>
                         <Descriptions.Item label="Data de Admissão">
                             {viewingProfessional.admission_date ? moment(viewingProfessional.admission_date).format('DD/MM/YYYY') : '-'}
                         </Descriptions.Item>
                         <Descriptions.Item label="Validade do Contrato">
                             {viewingProfessional.contract_validity ? moment(viewingProfessional.contract_validity).format('DD/MM/YYYY') : 'Indeterminado'}
                         </Descriptions.Item>
                         {viewingProfessional.role === 'health' && (
                             <>
                                <Descriptions.Item label="Especialidade">{viewingProfessional.specialty || '-'}</Descriptions.Item>
                                <Descriptions.Item label="Registro Profissional">{viewingProfessional.registry_number || '-'}</Descriptions.Item>
                                <Descriptions.Item label="CBO">{viewingProfessional.cbo || '-'}</Descriptions.Item>
                                <Descriptions.Item label="CNS">{viewingProfessional.cns || '-'}</Descriptions.Item>
                             </>
                         )}
                    </Descriptions>

                    <Divider />

                    <Descriptions title="Contato e Endereço" column={1} bordered size="small">
                        <Descriptions.Item label="Telefone">{viewingProfessional.phone || '-'}</Descriptions.Item>
                        <Descriptions.Item label="Endereço">{viewingProfessional.address || '-'}</Descriptions.Item>
                        <Descriptions.Item label="Site / Portfolio">{viewingProfessional.website || '-'}</Descriptions.Item>
                    </Descriptions>
                    
                    <Divider />

                    <Descriptions title="Dados Bancários" column={1} bordered size="small">
                        <Descriptions.Item label="Banco / Pix">
                            <pre style={{ margin: 0, fontFamily: 'inherit' }}>{viewingProfessional.bank_data || '-'}</pre>
                        </Descriptions.Item>
                    </Descriptions>

                    {viewingProfessional.bio && (
                        <>
                            <Divider />
                            <h3>Bio / Observações</h3>
                            <p>{viewingProfessional.bio}</p>
                        </>
                    )}
                  </>
                )}
              </Drawer>
            </Cards>
          </Col>
        </Row>
      </Main>
    </>
  );
}

export default UserDataTable;
