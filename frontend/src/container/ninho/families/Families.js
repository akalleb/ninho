'use client';
import React, { useState, useEffect } from 'react';
import { Row, Col, Table, Button, Input, Select, Tag, App, Tooltip, Skeleton, Popconfirm, Statistic, Modal, Descriptions } from 'antd';
import FeatherIcon from 'feather-icons-react';
import { useRouter } from 'next/navigation';
import { CSVLink } from 'react-csv';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip as ChartTooltip,
  Legend,
  ArcElement
} from 'chart.js';
import { Bar, Pie } from 'react-chartjs-2';
import { PageHeader } from '../../../components/page-headers/page-headers';
import { Main } from '../../styled';
import api from '../../../config/api/axios';
import { Cards } from '../../../components/cards/frame/cards-frame';

ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  ChartTooltip,
  Legend,
  ArcElement
);

const { Option } = Select;

function Families() {
  const [families, setFamilies] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filters, setFilters] = useState({
      search: '',
      neighborhood: undefined,
      vulnerability: undefined
  });
  const [stats, setStats] = useState({
    total: 0,
    vulnerability: {},
    avgIncome: 0
  });
  const [selectedFamily, setSelectedFamily] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  
  const router = useRouter();
  const { notification } = App.useApp();

  const processStats = (data) => {
    const newStats = {
      total: data.length,
      vulnerability: {},
      avgIncome: 0
    };
    
    let totalIncome = 0;
    
    data.forEach(fam => {
       const vul = fam.vulnerability_status || 'Não Informado';
       newStats.vulnerability[vul] = (newStats.vulnerability[vul] || 0) + 1;
       totalIncome += (fam.monthly_income || 0);
    });
    
    newStats.avgIncome = data.length ? totalIncome / data.length : 0;
    setStats(newStats);
  };

  const fetchFamilies = async () => {
    setLoading(true);
    try {
      const params = {};
      if (filters.search) params.search = filters.search;
      if (filters.neighborhood) params.neighborhood = filters.neighborhood;
      if (filters.vulnerability) params.vulnerability = filters.vulnerability;
      
      const { data } = await api.get('/families/', { params });
      setFamilies(data);
      processStats(data);
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

  const handleRowClick = (record) => {
     setSelectedFamily(record);
     setIsModalOpen(true);
  };

  const vulnerabilityChartData = {
    labels: Object.keys(stats.vulnerability),
    datasets: [{
      data: Object.values(stats.vulnerability),
      backgroundColor: ['#FF6384', '#36A2EB', '#FFCE56', '#4BC0C0', '#9966FF'],
    }]
  };

  const [deleteModal, setDeleteModal] = useState({
    visible: false,
    family: null,
    confirmName: ''
  });

  const handleDeleteClick = (e, family) => {
    e.stopPropagation(); // Evita abrir o modal de detalhes ao clicar em excluir
    setDeleteModal({
      visible: true,
      family,
      confirmName: ''
    });
  };

  const handleConfirmDelete = async () => {
    const { family, confirmName } = deleteModal;
    
    if (confirmName !== family.name_responsible) {
      notification.error({ message: 'Nome incorreto para confirmação.' });
      return;
    }

    try {
      await api.delete(`/families/${family.id}?force=true`);
      notification.success({ message: 'Família e dependentes excluídos com sucesso' });
      setDeleteModal({ visible: false, family: null, confirmName: '' });
      fetchFamilies();
    } catch (error) {
      notification.error({ 
        message: 'Erro ao excluir',
        description: error.response?.data?.detail || error.message
      });
    }
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
          let label = 'Não Informado';
          let backgroundColor = '#f5f5f5';
          let color = '#595959';
          let borderColor = 'transparent';

          if (status === 'desemprego') {
            label = 'Desemprego';
            backgroundColor = '#fff1f0';
            color = '#a8071a';
            borderColor = '#ffa39e';
          }
          if (status === 'baixa_renda') {
            label = 'Baixa Renda';
            backgroundColor = '#fff7e6';
            color = '#ad4e00';
            borderColor = '#ffd591';
          }
          if (status === 'inseguranca_alimentar') {
            label = 'Inseg. Alimentar';
            backgroundColor = '#fff0f6';
            color = '#c41d7f';
            borderColor = '#ffadd2';
          }
          if (status === 'outros') {
            label = 'Outros';
            backgroundColor = '#e6f4ff';
            color = '#0958d9';
            borderColor = '#91caff';
          }

          return (
            <Tag
              style={{
                minWidth: 120,
                textAlign: 'center',
                fontSize: 12,
                fontWeight: 600,
                padding: '2px 12px',
                borderRadius: 14,
                backgroundColor,
                color,
                border: `1px solid ${borderColor}`,
              }}
            >
              {label}
            </Tag>
          );
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
                    <span style={{ fontWeight: 600 }}>R$ {perCapita.toFixed(2)}</span>
                    <Tooltip title="Cálculo: Renda Familiar Total / (1 + Nº Dependentes). Se < R$ 218,00 indica possível Baixa Renda.">
                         <FeatherIcon icon="help-circle" size={14} style={{ marginLeft: 5, color: '#888', cursor: 'pointer' }} />
                    </Tooltip>
                    {isLowIncome && (
                        <Tooltip title="Atenção: Valor abaixo do critério federal de baixa renda (R$ 218,00)">
                             <FeatherIcon icon="alert-triangle" size={14} style={{ marginLeft: 5, color: '#faad14' }} />
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
            icon={<FeatherIcon icon="edit" size={14} />} 
            onClick={(e) => {
              e.stopPropagation();
              router.push(`/admin/families/edit?id=${record.id}`);
            }}
          />
          <Button 
            size="small" 
            type="primary"
            danger 
            icon={<FeatherIcon icon="trash-2" size={14} />} 
            onClick={(e) => handleDeleteClick(e, record)}
          />
        </div>
      ),
    },
  ];

  const csvHeaders = [
    { label: "Nome Responsável", key: "name_responsible" },
    { label: "CPF", key: "cpf" },
    { label: "NIS", key: "nis_responsible" },
    { label: "Telefone", key: "phone" },
    { label: "Endereço", key: "address_full" },
    { label: "Bairro", key: "neighborhood" },
    { label: "Cidade", key: "city" },
    { label: "Renda Mensal", key: "monthly_income" },
    { label: "Dependentes", key: "dependents_count" },
    { label: "Renda Per Capita", key: "per_capita_income" },
    { label: "Vulnerabilidade", key: "vulnerability_status" },
    { label: "Condições Moradia", key: "housing_conditions" }
  ];

  return (
    <>
      <Modal
        title={<span style={{ color: 'red', fontWeight: 'bold' }}>EXCLUSÃO DE FAMÍLIA</span>}
        open={deleteModal.visible}
        onCancel={() => setDeleteModal({ ...deleteModal, visible: false })}
        footer={[
          <Button key="back" onClick={() => setDeleteModal({ ...deleteModal, visible: false })}>
            Cancelar
          </Button>,
          <Button 
            key="submit" 
            type="primary" 
            danger 
            disabled={deleteModal.confirmName !== deleteModal.family?.name_responsible}
            onClick={handleConfirmDelete}
          >
            Entendo as consequências, excluir
          </Button>,
        ]}
      >
        <div style={{ backgroundColor: '#fff1f0', padding: 15, borderRadius: 4, border: '1px solid #ffa39e', marginBottom: 20 }}>
           <p style={{ fontWeight: 'bold', color: '#cf1322' }}>Atenção: Esta ação é irreversível!</p>
           <p>Isso excluirá permanentemente a família de <strong>{deleteModal.family?.name_responsible}</strong>.</p>
           <p>Todos os registros vinculados (<strong>Crianças, Atendimentos, Evoluções, Medicações</strong>) também serão apagados.</p>
        </div>
        <p>Por favor, digite <strong>{deleteModal.family?.name_responsible}</strong> para confirmar.</p>
        <Input 
            value={deleteModal.confirmName}
            onChange={(e) => setDeleteModal({ ...deleteModal, confirmName: e.target.value })}
            placeholder="Digite o nome do responsável"
            style={{ marginTop: 10 }}
        />
      </Modal>

      <PageHeader
        ghost
        title="Cadastro Único de Famílias"
        buttons={[
          <CSVLink
            key="csv-export"
            data={families}
            headers={csvHeaders}
            filename={`familias_ninho_${new Date().toISOString().split('T')[0]}.csv`}
          >
            <Button type="default" key="2" style={{ marginRight: 10 }}>
                <FeatherIcon icon="download" size={14} /> Exportar CSV
            </Button>
          </CSVLink>,
          <Button key="1" type="primary" onClick={() => router.push('/admin/families/add')}>
            <FeatherIcon icon="plus" size={14} /> Nova Família
          </Button>,
        ]}
      />
      <Main>
        <Row gutter={25} style={{ marginBottom: 25 }}>
          <Col md={8} xs={24}>
            <Cards headless>
              <div style={{ padding: '20px', textAlign: 'center' }}>
                <Statistic title="Total de Famílias" value={stats.total} valueStyle={{ fontSize: 36, fontWeight: 'bold', color: '#5F63F2' }} />
              </div>
            </Cards>
          </Col>
          <Col md={8} xs={24}>
            <Cards headless>
               <div style={{ padding: '20px', textAlign: 'center' }}>
                  <Statistic 
                    title="Renda Média Mensal" 
                    value={stats.avgIncome} 
                    precision={2} 
                    prefix="R$ "
                    valueStyle={{ fontSize: 36, fontWeight: 'bold', color: '#20C997' }} 
                  />
               </div>
            </Cards>
          </Col>
          <Col md={8} xs={24}>
            <Cards headless title="Vulnerabilidade">
              <div style={{ height: 150, display: 'flex', justifyContent: 'center' }}>
                <Pie 
                  data={vulnerabilityChartData} 
                  options={{ maintainAspectRatio: false, plugins: { legend: { position: 'right' } } }} 
                />
              </div>
            </Cards>
          </Col>
        </Row>

        <Cards>
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
            
            {loading ? (
                <Skeleton active />
            ) : (
                <Table 
                    dataSource={families} 
                    columns={columns} 
                    rowKey="id" 
                    pagination={{ pageSize: 10 }}
                    onRow={(record) => ({
                      onClick: () => handleRowClick(record),
                      style: { cursor: 'pointer' }
                    })}
                />
            )}
        </Cards>

        <Modal
          title="Detalhes da Família"
          open={isModalOpen}
          onCancel={() => setIsModalOpen(false)}
          footer={[
            <Button key="close" onClick={() => setIsModalOpen(false)}>Fechar</Button>,
            <Button key="edit" type="primary" onClick={() => router.push(`/admin/families/edit?id=${selectedFamily?.id}`)}>
              Editar
            </Button>
          ]}
          width={800}
        >
          {selectedFamily && (
            <Descriptions bordered column={{ xxl: 2, xl: 2, lg: 2, md: 1, sm: 1, xs: 1 }}>
              <Descriptions.Item label="Responsável">{selectedFamily.name_responsible}</Descriptions.Item>
              <Descriptions.Item label="CPF">{selectedFamily.cpf}</Descriptions.Item>
              <Descriptions.Item label="NIS">{selectedFamily.nis_responsible || '-'}</Descriptions.Item>
              <Descriptions.Item label="Telefone">{selectedFamily.phone || '-'}</Descriptions.Item>
              <Descriptions.Item label="Endereço" span={2}>
                {selectedFamily.address_full}, {selectedFamily.neighborhood} - {selectedFamily.city}
              </Descriptions.Item>
              <Descriptions.Item label="Renda Mensal">R$ {selectedFamily.monthly_income?.toFixed(2)}</Descriptions.Item>
              <Descriptions.Item label="Dependentes">{selectedFamily.dependents_count}</Descriptions.Item>
              <Descriptions.Item label="Renda Per Capita">R$ {selectedFamily.per_capita_income?.toFixed(2)}</Descriptions.Item>
              <Descriptions.Item label="Vulnerabilidade">
                <Tag color="blue">{selectedFamily.vulnerability_status}</Tag>
              </Descriptions.Item>
              <Descriptions.Item label="Observações" span={2}>
                {selectedFamily.family_observations || 'Sem observações'}
              </Descriptions.Item>
            </Descriptions>
          )}
        </Modal>
      </Main>
    </>
  );
}

export default Families;
