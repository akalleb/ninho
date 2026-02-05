import React, { useState, useEffect } from 'react';
import { Row, Col, Table, Button, Modal, App, Select, Tag } from 'antd';
import FeatherIcon from 'feather-icons-react';
import { useRouter } from 'next/navigation';
import { PageHeader } from '../../../components/page-headers/page-headers';
import { Main } from '../../styled';
import { Cards } from '../../../components/cards/frame/cards-frame';
import api from '../../../config/api/axios';

const { Option } = Select;

function ResourceSourceDataTable() {
  const [sources, setSources] = useState([]);
  const [loading, setLoading] = useState(true);
  const router = useRouter();
  const { notification } = App.useApp();
  
  // Filters
  const [filterType, setFilterType] = useState(null);
  const [filterStatus, setFilterStatus] = useState(null);

  const fetchSources = async () => {
    setLoading(true);
    try {
      const params = {};
      if (filterType) params.type = filterType;
      if (filterStatus) params.status = filterStatus;
      
      const response = await api.get('/resource-sources/', { params });
      setSources(response.data);
    } catch (error) {
      notification.error({
        message: 'Erro ao carregar fontes de recursos',
        description: error.message,
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSources();
  }, [filterType, filterStatus]);

  const handleEdit = (id) => {
    router.push(`/admin/resource-sources/edit?id=${id}`);
  };

  const handleDelete = async (id) => {
    Modal.confirm({
      title: 'Tem certeza que deseja excluir esta fonte?',
      content: 'Esta ação não pode ser desfeita.',
      okText: 'Sim, Excluir',
      okType: 'danger',
      cancelText: 'Cancelar',
      onOk: async () => {
        try {
          await api.delete(`/resource-sources/${id}`);
          notification.success({
            message: 'Fonte excluída com sucesso',
          });
          fetchSources();
        } catch (error) {
          notification.error({
            message: 'Erro ao excluir fonte',
            description: error.message,
          });
        }
      },
    });
  };

  const columns = [
    {
      title: 'Nome',
      dataIndex: 'name',
      key: 'name',
    },
    {
      title: 'Tipo',
      dataIndex: 'type',
      key: 'type',
      render: (type) => {
        const types = {
          emenda: 'Emenda',
          doacao: 'Doação',
          convenio: 'Convênio',
          evento: 'Evento',
          crowdfunding: 'Crowdfunding'
        };
        return types[type] || type;
      }
    },
    {
      title: 'Valor Total',
      dataIndex: 'total_value_estimated',
      key: 'total_value_estimated',
      render: (value) => value ? `R$ ${value.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}` : '-'
    },
    {
      title: 'Saldo Utilizado',
      dataIndex: 'balance_used',
      key: 'balance_used',
      render: (value) => value ? `R$ ${value.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}` : 'R$ 0,00'
    },
    {
      title: 'Status',
      dataIndex: 'status',
      key: 'status',
      render: (status) => {
        let color = 'default';
        let text = status;
        if (status === 'active') { color = 'success'; text = 'Ativo'; }
        if (status === 'inactive') { color = 'error'; text = 'Inativo'; }
        if (status === 'in_progress') { color = 'processing'; text = 'Em Vigência'; }
        
        return <Tag color={color}>{text}</Tag>;
      }
    },
    {
      title: 'Documento',
      dataIndex: 'document_url',
      key: 'document_url',
      render: (url) => url ? <a href={url} target="_blank" rel="noopener noreferrer"><FeatherIcon icon="file-text" size={14}/> Ver</a> : '-'
    },
    {
      title: 'Ações',
      key: 'action',
      render: (_, record) => (
        <div style={{ display: 'flex', gap: '8px' }}>
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
        title="Gestão de Fontes de Recursos"
        buttons={[
          <Button key="1" type="primary" size="small" onClick={() => router.push('/admin/resource-sources/add')}>
            <FeatherIcon icon="plus" size={14} /> Nova Fonte
          </Button>,
        ]}
      />
      <Main>
        <Row gutter={25}>
          <Col xs={24}>
            <Cards headless>
              <div style={{ marginBottom: 20, display: 'flex', gap: 15 }}>
                <Select 
                    placeholder="Filtrar por Tipo" 
                    style={{ width: 200 }} 
                    allowClear 
                    onChange={setFilterType}
                >
                    <Option value="emenda">Emenda</Option>
                    <Option value="doacao">Doação</Option>
                    <Option value="convenio">Convênio</Option>
                    <Option value="evento">Evento</Option>
                    <Option value="crowdfunding">Crowdfunding</Option>
                </Select>
                <Select 
                    placeholder="Filtrar por Status" 
                    style={{ width: 200 }} 
                    allowClear 
                    onChange={setFilterStatus}
                >
                    <Option value="active">Ativo</Option>
                    <Option value="in_progress">Em Vigência</Option>
                    <Option value="inactive">Inativo</Option>
                </Select>
              </div>
              <Table
                className="table-responsive"
                pagination={{ pageSize: 10 }}
                locale={{ emptyText: 'Nenhuma fonte cadastrada' }}
                dataSource={sources}
                columns={columns}
                loading={loading}
                rowKey="id"
              />
            </Cards>
          </Col>
        </Row>
      </Main>
    </>
  );
}

export default ResourceSourceDataTable;