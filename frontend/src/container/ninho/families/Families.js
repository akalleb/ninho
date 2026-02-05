'use client';
import React, { useState, useEffect } from 'react';
import { Row, Col, Table, Button, Input, Select, Tag, Modal, App, Card, Tooltip } from 'antd';
import FeatherIcon from 'feather-icons-react';
import { useRouter } from 'next/navigation';
import { PageHeader } from '../../../components/page-headers/page-headers';
import { Main } from '../../styled';
import api from '../../../config/api/axios';
import { Cards } from '../../../components/cards/frame/cards-frame';

const { Option } = Select;

function Families() {
  const [families, setFamilies] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filters, setFilters] = useState({
      search: '',
      neighborhood: undefined,
      vulnerability: undefined
  });
  
  const router = useRouter();
  const { notification } = App.useApp();

  const fetchFamilies = async () => {
    setLoading(true);
    try {
      const params = {};
      if (filters.search) params.search = filters.search;
      if (filters.neighborhood) params.neighborhood = filters.neighborhood;
      if (filters.vulnerability) params.vulnerability = filters.vulnerability;
      
      const { data } = await api.get('/families/', { params });
      setFamilies(data);
    } catch (error) {
      notification.error({
        message: 'Erro ao carregar famílias',
        description: error.message,
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchFamilies();
  }, [filters]);

  const handleDelete = (id) => {
    Modal.confirm({
      title: 'Excluir Família',
      content: 'Tem certeza que deseja excluir este cadastro? Esta ação é irreversível.',
      okText: 'Sim, Excluir',
      okType: 'danger',
      onOk: async () => {
        try {
          await api.delete(`/families/${id}`);
          notification.success({ message: 'Família excluída com sucesso' });
          fetchFamilies();
        } catch (error) {
          notification.error({ message: 'Erro ao excluir' });
        }
      }
    });
  };

  const columns = [
    {
      title: 'Responsável',
      dataIndex: 'name_responsible',
      key: 'name_responsible',
      render: (text, record) => (
          <div>
              <div style={{ fontWeight: 600 }}>{text}</div>
              <small style={{ color: '#888' }}>CPF: {record.cpf}</small>
          </div>
      )
    },
    {
      title: 'Bairro',
      dataIndex: 'neighborhood',
      key: 'neighborhood',
    },
    {
      title: 'Vulnerabilidade',
      dataIndex: 'vulnerability_status',
      key: 'vulnerability_status',
      render: (status) => {
          const map = {
              'desemprego': { color: 'red', label: 'Desemprego' },
              'baixa_renda': { color: 'orange', label: 'Baixa Renda' },
              'inseguranca_alimentar': { color: 'volcano', label: 'Inseg. Alimentar' },
              'outros': { color: 'blue', label: 'Outros' }
          };
          const item = map[status] || { color: 'default', label: status };
          return <Tag color={item.color}>{item.label}</Tag>;
      }
    },
    {
        title: 'Renda Per Capita',
        key: 'per_capita',
        render: (_, record) => {
            const perCapita = record.per_capita_income || 0;
            const isLowIncome = perCapita < 218; // Example threshold for Bolsa Família approx
            return (
                <div>
                    R$ {perCapita.toFixed(2)}
                    {isLowIncome && (
                        <Tooltip title="Possível Baixa Renda (Critério Federal)">
                             <FeatherIcon icon="alert-circle" size={14} style={{ marginLeft: 5, color: '#faad14' }} />
                        </Tooltip>
                    )}
                </div>
            );
        }
    },
    {
      title: 'Ações',
      key: 'actions',
      render: (_, record) => (
        <div style={{ display: 'flex', gap: 10 }}>
          <Button 
            size="small" 
            type="primary" 
            ghost 
            icon={<FeatherIcon icon="edit" size={14} />} 
            onClick={() => router.push(`/admin/families/edit?id=${record.id}`)}
          />
          <Button 
            size="small" 
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
        title="Cadastro Único de Famílias"
        buttons={[
          <Button key="1" type="primary" onClick={() => router.push('/admin/families/add')}>
            <FeatherIcon icon="plus" size={14} /> Nova Família
          </Button>,
        ]}
      />
      <Main>
        <Card>
            <Row gutter={25} style={{ marginBottom: 25 }}>
                <Col xs={24} md={8}>
                    <Input 
                        placeholder="Buscar por nome ou CPF..." 
                        prefix={<FeatherIcon icon="search" size={14} />}
                        onChange={(e) => setFilters({ ...filters, search: e.target.value })}
                    />
                </Col>
                <Col xs={24} md={6}>
                    <Select 
                        style={{ width: '100%' }} 
                        placeholder="Filtrar por Bairro"
                        allowClear
                        onChange={(val) => setFilters({ ...filters, neighborhood: val })}
                    >
                        {/* Ideally fetch unique neighborhoods from DB or constants */}
                        <Option value="Centro">Centro</Option>
                        <Option value="Zona Rural">Zona Rural</Option>
                        {/* Add more dynamically later */}
                    </Select>
                </Col>
                <Col xs={24} md={6}>
                    <Select 
                        style={{ width: '100%' }} 
                        placeholder="Vulnerabilidade"
                        allowClear
                        onChange={(val) => setFilters({ ...filters, vulnerability: val })}
                    >
                        <Option value="desemprego">Desemprego</Option>
                        <Option value="baixa_renda">Baixa Renda</Option>
                        <Option value="inseguranca_alimentar">Insegurança Alimentar</Option>
                    </Select>
                </Col>
            </Row>
            
            <Table 
                dataSource={families} 
                columns={columns} 
                rowKey="id" 
                loading={loading}
                pagination={{ pageSize: 10 }}
            />
        </Card>
      </Main>
    </>
  );
}

export default Families;