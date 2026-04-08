import React, { useState, useEffect } from 'react';
import { Row, Col, Table, Button, Modal, App, Select, Tag, Popconfirm, Skeleton, Statistic, Input } from 'antd';
import FeatherIcon from 'feather-icons-react';
import { useRouter } from 'next/navigation';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
  ArcElement
} from 'chart.js';
import { Bar, Pie } from 'react-chartjs-2';
import { PageHeader } from '../../../components/page-headers/page-headers';
import { Main } from '../../styled';
import { Cards } from '../../../components/cards/frame/cards-frame';
import api from '../../../config/api/axios';

ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
  ArcElement
);

const { Option } = Select;

function ResourceSourceDataTable() {
  const [sources, setSources] = useState([]);
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({
    totalValue: 0,
    totalUsed: 0,
    byType: {}
  });

  const router = useRouter();
  const { notification } = App.useApp();
  
  // Filters
  const [filterType, setFilterType] = useState(null);
  const [filterStatus, setFilterStatus] = useState(null);

  const processStats = (data) => {
    let totalVal = 0;
    let totalUsed = 0;
    const byType = {};

    data.forEach(source => {
      totalVal += (source.total_value_estimated || 0);
      totalUsed += (source.balance_used || 0);
      
      const type = source.type || 'outros';
      byType[type] = (byType[type] || 0) + 1;
    });

    setStats({
      totalValue: totalVal,
      totalUsed: totalUsed,
      byType
    });
  };

  const fetchSources = async () => {
    setLoading(true);
    try {
      const params = {};
      if (filterType) params.type = filterType;
      if (filterStatus) params.status = filterStatus;
      
      const response = await api.get('/resource-sources/', { params });
      setSources(response.data);
      processStats(response.data);
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

  const typeChartData = {
    labels: Object.keys(stats.byType).map(t => t.toUpperCase()),
    datasets: [{
      data: Object.values(stats.byType),
      backgroundColor: ['#5F63F2', '#FF69A5', '#20C997', '#FA8B0C', '#2C99FF'],
    }]
  };

  const handleEdit = (id) => {
    router.push(`/admin/resource-sources/edit?id=${id}`);
  };

  const showUsageDetails = async (source) => {
    try {
      const { data } = await api.get('/expenses/', { params: { source_id: source.id } });
      const linkedExpenses = data || [];
      const usedFromExpenses = linkedExpenses.reduce((sum, e) => sum + (e.amount || 0), 0);
      const totalValue = source.total_value_estimated || 0;
      const usedFromSource = source.balance_used || 0;
      const availableFromSource = totalValue - usedFromSource;
      const diff = usedFromSource - usedFromExpenses;

      Modal.info({
        title: `Detalhamento de Uso: ${source.name}`,
        width: 600,
        content: (
          <div>
            <div style={{ marginBottom: 15 }}>
              <p>
                <strong>Valor Total:</strong>{' '}
                R$ {totalValue.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
              </p>
              <p>
                <strong>Utilizado (Fonte):</strong>{' '}
                R$ {usedFromSource.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
              </p>
              <p>
                <strong>Utilizado (Despesas vinculadas):</strong>{' '}
                R$ {usedFromExpenses.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
              </p>
              <p>
                <strong>Diferença:</strong>{' '}
                R$ {diff.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
              </p>
              <p>
                <strong>Disponível (Fonte):</strong>{' '}
                R$ {availableFromSource.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
              </p>
            </div>
            <Table
              dataSource={linkedExpenses}
              rowKey="id"
              size="small"
              pagination={{ pageSize: 5 }}
              columns={[
                {
                  title: 'Data',
                  dataIndex: 'paid_at',
                  render: (d) =>
                    d ? new Date(d).toLocaleDateString('pt-BR') : '-',
                },
                { title: 'Descrição', dataIndex: 'description' },
                {
                  title: 'Valor',
                  dataIndex: 'amount',
                  render: (v) =>
                    `R$ ${v.toLocaleString('pt-BR', {
                      minimumFractionDigits: 2,
                    })}`,
                },
              ]}
            />
          </div>
        ),
      });
    } catch (error) {
      notification.error({ message: 'Erro ao buscar detalhes de uso' });
    }
  };

  const handleDelete = async (id) => {
    try {
      await api.delete(`/resource-sources/${id}`);
      notification.success({
        message: 'Fonte excluída com sucesso',
      });
      fetchSources();
    } catch (error) {
      notification.error({
        message: 'Erro ao excluir fonte',
        description: error.response?.data?.detail || error.message,
      });
    }
  };

  const [deleteModal, setDeleteModal] = useState({
    visible: false,
    resource: null,
    confirmName: ''
  });

  const handleDeleteClick = (resource) => {
    setDeleteModal({
      visible: true,
      resource,
      confirmName: ''
    });
  };

  const handleConfirmDelete = async () => {
    const { resource, confirmName } = deleteModal;
    
    if (confirmName !== resource.name) {
      notification.error({ message: 'Nome incorreto para confirmação.' });
      return;
    }

    try {
      await api.delete(`/resource-sources/${resource.id}?force=true`);
      notification.success({
        message: 'Fonte e registros vinculados excluídos com sucesso',
      });
      setDeleteModal({ visible: false, resource: null, confirmName: '' });
      fetchSources();
    } catch (error) {
      notification.error({
        message: 'Erro ao excluir fonte',
        description: error.response?.data?.detail || error.message,
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
      render: (value, record) => (
        <div style={{ cursor: 'pointer', color: '#1890ff' }} onClick={() => showUsageDetails(record)}>
           {value ? `R$ ${value.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}` : 'R$ 0,00'}
           <FeatherIcon icon="info" size={12} style={{ marginLeft: 5 }} />
        </div>
      )
    },
    {
      title: 'Status',
      dataIndex: 'status',
      key: 'status',
      render: (status) => {
        let text = status;
        let backgroundColor = '#f5f5f5';
        let color = '#595959';
        let borderColor = 'transparent';

        if (status === 'active') {
          text = 'Ativo';
          backgroundColor = '#f6ffed';
          color = '#135200';
          borderColor = '#b7eb8f';
        }
        if (status === 'inactive') {
          text = 'Inativo';
          backgroundColor = '#fff1f0';
          color = '#a8071a';
          borderColor = '#ffa39e';
        }
        if (status === 'in_progress') {
          text = 'Em Vigência';
          backgroundColor = '#fff7e6';
          color = '#ad4e00';
          borderColor = '#ffd591';
        }

        return (
          <Tag
            style={{
              minWidth: 90,
              textAlign: 'center',
              fontSize: 13,
              fontWeight: 600,
              padding: '2px 12px',
              borderRadius: 14,
              backgroundColor,
              color,
              border: `1px solid ${borderColor}`,
            }}
          >
            {text}
          </Tag>
        );
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
            onClick={() => handleDeleteClick(record)}
          />
        </div>
      ),
    },
  ];

  return (
    <>
      <Modal
        title={<span style={{ color: 'red', fontWeight: 'bold' }}>EXCLUSÃO DE FONTE DE RECURSO</span>}
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
            disabled={deleteModal.confirmName !== deleteModal.resource?.name}
            onClick={handleConfirmDelete}
          >
            Entendo as consequências, excluir esta fonte
          </Button>,
        ]}
      >
        <div style={{ backgroundColor: '#fff1f0', padding: 15, borderRadius: 4, border: '1px solid #ffa39e', marginBottom: 20 }}>
           <p style={{ fontWeight: 'bold', color: '#cf1322' }}>Atenção: Esta ação é irreversível!</p>
           <p>Isso excluirá permanentemente a fonte <strong>{deleteModal.resource?.name}</strong>, além de:</p>
           <ul>
             <li>Todas as <strong>Receitas</strong> vinculadas a ela.</li>
             <li>O vínculo com todas as <strong>Despesas</strong> (o registro financeiro da despesa será mantido).</li>
           </ul>
        </div>
        <p>Por favor, digite <strong>{deleteModal.resource?.name}</strong> para confirmar.</p>
        <Input 
            value={deleteModal.confirmName}
            onChange={(e) => setDeleteModal({ ...deleteModal, confirmName: e.target.value })}
            placeholder="Digite o nome da fonte"
            style={{ marginTop: 10 }}
        />
      </Modal>

      <PageHeader
        ghost
        title="Gestão de Fontes de Recursos"
        buttons={[
          <Button key="1" type="primary" onClick={() => router.push('/admin/resource-sources/add')}>
            <FeatherIcon icon="plus" size={14} /> Nova Fonte
          </Button>,
        ]}
      />
      <Main>
        <Row gutter={25} style={{ marginBottom: 25 }}>
          <Col md={8} xs={24}>
            <Cards headless>
              <div style={{ padding: '20px', textAlign: 'center' }}>
                <Statistic 
                  title="Valor Total Estimado" 
                  value={stats.totalValue} 
                  precision={2}
                  prefix="R$ "
                  valueStyle={{ fontSize: 24, fontWeight: 'bold', color: '#20C997' }} 
                />
              </div>
            </Cards>
          </Col>
          <Col md={8} xs={24}>
            <Cards headless>
               <div style={{ padding: '20px', textAlign: 'center' }}>
                  <Statistic 
                    title="Total Utilizado" 
                    value={stats.totalUsed} 
                    precision={2} 
                    prefix="R$ "
                    valueStyle={{ fontSize: 24, fontWeight: 'bold', color: '#FF69A5' }} 
                  />
               </div>
            </Cards>
          </Col>
          <Col md={8} xs={24}>
            <Cards headless title="Distribuição por Tipo">
              <div style={{ height: 150, display: 'flex', justifyContent: 'center' }}>
                <Pie 
                  data={typeChartData} 
                  options={{ maintainAspectRatio: false, plugins: { legend: { position: 'right' } } }} 
                />
              </div>
            </Cards>
          </Col>
        </Row>

        <Row gutter={25}>
          <Col xs={24}>
            <Cards>
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
              {loading ? (
                <Skeleton active />
              ) : (
                <Table
                  className="table-responsive"
                  pagination={{ pageSize: 10 }}
                  locale={{ emptyText: 'Nenhuma fonte cadastrada' }}
                  dataSource={sources}
                  columns={columns}
                  rowKey="id"
                />
              )}
            </Cards>
          </Col>
        </Row>
      </Main>
    </>
  );
}

export default ResourceSourceDataTable;
