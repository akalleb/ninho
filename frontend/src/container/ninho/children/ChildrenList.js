'use client';
import React, { useState, useEffect } from 'react';
import { Row, Col, Table, Button, Input, Select, Tag, Modal, App, Card } from 'antd';
import FeatherIcon from 'feather-icons-react';
import { useRouter } from 'next/navigation';
import { PageHeader } from '../../../components/page-headers/page-headers';
import { Main } from '../../styled';
import api from '../../../config/api/axios';

const { Option } = Select;

function ChildrenList() {
  const [children, setChildren] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filters, setFilters] = useState({ search: '' });
  const router = useRouter();
  const { notification } = App.useApp();

  const fetchChildren = async (params = filters) => {
    setLoading(true);
    try {
      const { data } = await api.get('/children/', { params });
      setChildren(data);
    } catch (error) {
      console.log('Erro ao carregar lista de crianças', {
        message: error.message,
        responseData: error.response?.data,
        status: error.response?.status,
        headers: error.response?.headers,
        config: error.config,
      });
      notification.error({
        message: 'Erro ao carregar lista de crianças',
        description: error?.response?.data?.detail || 'Tente novamente mais tarde.',
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchChildren(filters);
  }, []);

  const columns = [
    {
      title: 'Nome',
      dataIndex: 'name',
      key: 'name',
      render: (text, record) => (
          <div style={{ cursor: 'pointer', color: '#1890ff' }} onClick={() => router.push(`/admin/children/${record.id}/dashboard`)}>
              <span style={{ fontWeight: 600 }}>{text}</span>
              <br />
              <small style={{ color: '#888' }}>ID: {record.id}</small>
          </div>
      )
    },
    {
        title: 'Diagnóstico',
        dataIndex: 'diagnosis',
        key: 'diagnosis',
        render: (text) => text || <span style={{ color: '#ccc' }}>Não informado</span>
    },
    {
        title: 'Nível',
        dataIndex: 'severity_level',
        key: 'severity_level',
        render: (text) => {
            const colors = { leve: 'green', media: 'orange', grave: 'red' };
            return text ? <Tag color={colors[text] || 'default'}>{text.toUpperCase()}</Tag> : '-';
        }
    },
    {
        title: 'Responsável',
        dataIndex: 'guardian_name',
        key: 'guardian_name'
    },
    {
      title: 'Ações',
      key: 'actions',
      render: (_, record) => (
        <div style={{ display: 'flex', gap: 10 }}>
           <Button 
            size="small" 
            title="Prontuário / Dashboard"
            icon={<FeatherIcon icon="activity" size={14} />} 
            onClick={() => router.push(`/admin/children/${record.id}/dashboard`)}
          />
          <Button 
            size="small" 
            type="primary" 
            ghost 
            icon={<FeatherIcon icon="edit" size={14} />} 
            onClick={() => router.push(`/admin/children/edit?id=${record.id}`)}
          />
        </div>
      ),
    },
  ];

  return (
    <>
      <PageHeader
        ghost
        title="Prontuário das Crianças"
        buttons={[
          <Button key="1" type="primary" onClick={() => router.push('/admin/children/add')}>
            <FeatherIcon icon="plus" size={14} /> Nova Criança
          </Button>,
        ]}
      />
      <Main>
        <Card>
            <Row gutter={25} style={{ marginBottom: 25 }}>
                <Col xs={24} md={12}>
                    <Input 
                        placeholder="Buscar por nome..." 
                        prefix={<FeatherIcon icon="search" size={14} />}
                        onChange={(e) => {
                          const value = e.target.value;
                          const newFilters = { ...filters, search: value };
                          setFilters(newFilters);
                          fetchChildren(newFilters);
                        }}
                    />
                </Col>
            </Row>
            
            <Table 
                dataSource={children} 
                columns={columns} 
                rowKey="id" 
                loading={loading}
            />
        </Card>
      </Main>
    </>
  );
}

export default ChildrenList;
