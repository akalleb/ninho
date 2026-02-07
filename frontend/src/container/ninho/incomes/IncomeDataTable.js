import React, { useState, useEffect } from 'react';
import { Row, Col, Table, Button, App, Select, DatePicker, Tag, Modal, Form, Input, Upload, Tooltip, Badge, Tabs, Skeleton } from 'antd';
import FeatherIcon from 'feather-icons-react';
import { useRouter } from 'next/navigation';
import { PageHeader } from '../../../components/page-headers/page-headers';
import { Main } from '../../styled';
import { Cards } from '../../../components/cards/frame/cards-frame';
import api from '../../../config/api/axios';
import dayjs from 'dayjs';

const { Option } = Select;
const { RangePicker } = DatePicker;
const { TextArea } = Input;

function IncomeDataTable() {
  const [incomes, setIncomes] = useState([]);
  const [sources, setSources] = useState([]);
  const [wallets, setWallets] = useState([]);
  const [loading, setLoading] = useState(true);
  const router = useRouter();
  const { notification } = App.useApp();
  
  // Filters
  const [filterSource, setFilterSource] = useState(null);
  const [filterWallet, setFilterWallet] = useState(null);
  const [dateRange, setDateRange] = useState(null);
  const [activeTab, setActiveTab] = useState('all');

  // Reconciliation Modal
  const [isReconcileModalOpen, setIsReconcileModalOpen] = useState(false);
  const [currentReconcileId, setCurrentReconcileId] = useState(null);
  const [reconcileForm] = Form.useForm();

  const fetchFilters = async () => {
    try {
        const [sourcesRes, walletsRes] = await Promise.all([
            api.get('/resource-sources/'),
            api.get('/wallets/')
        ]);
        setSources(sourcesRes.data);
        setWallets(walletsRes.data);
    } catch (error) {
        console.error('Error fetching filters', error);
    }
  };

  const fetchIncomes = async () => {
    setLoading(true);
    try {
      const params = {};
      if (filterSource) params.source_id = filterSource;
      if (filterWallet) params.wallet_id = filterWallet;
      if (dateRange && dateRange[0] && dateRange[1]) {
          params.start_date = dateRange[0].format('YYYY-MM-DD');
          params.end_date = dateRange[1].format('YYYY-MM-DD');
      }
      
      const response = await api.get('/revenues/', { params });
      
      // Enrich data with names since API returns IDs
      let enrichedData = response.data.map(item => {
          const source = sources.find(s => s.id === item.source_id);
          const wallet = wallets.find(w => w.id === item.wallet_id);
          return {
              ...item,
              source_name: source ? source.name : `ID: ${item.source_id}`,
              wallet_name: wallet ? wallet.name : `ID: ${item.wallet_id}`,
          };
      });

      // Client-side filtering for Sphere (could be server-side too)
      if (activeTab !== 'all') {
          enrichedData = enrichedData.filter(item => item.origin_sphere === activeTab);
      }

      setIncomes(enrichedData);
    } catch (error) {
      notification.error({
        message: 'Erro ao carregar receitas',
        description: error.message,
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchFilters();
  }, []);

  useEffect(() => {
    if (sources.length > 0 && wallets.length > 0) {
        fetchIncomes();
    } else if (sources.length === 0 && wallets.length === 0) {
        // First load attempt
        fetchIncomes(); 
    }
  }, [filterSource, filterWallet, dateRange, sources, wallets, activeTab]);

  const handleReconcile = (record) => {
      setCurrentReconcileId(record.id);
      reconcileForm.resetFields();
      reconcileForm.setFieldsValue({
          reconciliation_date: dayjs(),
          status: 'conciliado'
      });
      setIsReconcileModalOpen(true);
  };

  const submitReconciliation = async (values) => {
      try {
          const formattedValues = {
              status: values.status,
              reconciliation_date: values.reconciliation_date.format('YYYY-MM-DD'),
              is_reconciled: values.status === 'conciliado',
              observations: values.observations
          };
          
          await api.put(`/revenues/${currentReconcileId}`, formattedValues);
          
          notification.success({ message: 'Receita conciliada com sucesso' });
          setIsReconcileModalOpen(false);
          fetchIncomes();
      } catch (error) {
          notification.error({ message: 'Erro ao conciliar', description: error.message });
      }
  };

  const columns = [
    {
      title: 'Data',
      dataIndex: 'received_at',
      key: 'received_at',
      render: (date) => dayjs(date).format('DD/MM/YYYY')
    },
    {
      title: 'Fonte de Recurso',
      dataIndex: 'source_name',
      key: 'source_name',
    },
    {
      title: 'Carteira',
      dataIndex: 'wallet_name',
      key: 'wallet_name',
    },
    {
      title: 'Valor',
      dataIndex: 'amount',
      key: 'amount',
      render: (value) => <span style={{ color: '#3f8600', fontWeight: 600 }}>R$ {value.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</span>
    },
    {
      title: 'Status',
      dataIndex: 'status',
      key: 'status',
      render: (status, record) => {
          let color = 'default';
          if (status === 'recebido') color = 'processing';
          if (status === 'conciliado') color = 'success';
          if (status === 'pendente') color = 'warning';
          if (status === 'cancelado') color = 'error';
          
          // Alert logic: Pending for > 30 days
          const isOverdue = status === 'pendente' && dayjs().diff(dayjs(record.received_at), 'day') > 30;

          return (
              <Badge dot={isOverdue} offset={[5, 0]}>
                  <Tag color={color}>{status ? status.toUpperCase() : 'PENDENTE'}</Tag>
              </Badge>
          );
      }
    },
    {
        title: 'Ações',
        key: 'action',
        render: (_, record) => (
            <div style={{ display: 'flex', gap: 5 }}>
                {record.status !== 'conciliado' && (
                    <Tooltip title="Conciliar">
                        <Button 
                            size="small" 
                            shape="circle" 
                            type="primary" 
                            icon={<FeatherIcon icon="check" size={14} />} 
                            onClick={() => handleReconcile(record)}
                        />
                    </Tooltip>
                )}
                {record.receipt_url && (
                    <Tooltip title="Ver Comprovante">
                        <a href={record.receipt_url} target="_blank" rel="noopener noreferrer">
                            <Button size="small" shape="circle" icon={<FeatherIcon icon="file-text" size={14} />} />
                        </a>
                    </Tooltip>
                )}
            </div>
        )
    }
  ];

  return (
    <>
      <PageHeader
        ghost
        title="Entradas de Receita"
        buttons={[
          <Button key="1" type="primary" onClick={() => router.push('/admin/incomes/add')}>
            <FeatherIcon icon="plus" size={14} /> Nova Receita
          </Button>,
        ]}
      />
      <Main>
        <Row gutter={25}>
          <Col xs={24}>
            <Cards>
              <Tabs 
                defaultActiveKey="all" 
                onChange={setActiveTab}
                items={[
                    { label: 'Todas', key: 'all' },
                    { label: 'Federais', key: 'federal' },
                    { label: 'Estaduais', key: 'estadual' },
                    { label: 'Municipais', key: 'municipal' },
                    { label: 'Privadas', key: 'privado' },
                ]}
              />
              <div style={{ marginBottom: 20, display: 'flex', gap: 15, flexWrap: 'wrap' }}>
                <RangePicker 
                    format="DD/MM/YYYY"
                    onChange={setDateRange}
                    placeholder={['Data Inicial', 'Data Final']}
                    style={{ width: 250 }}
                />
                <Select 
                    placeholder="Filtrar por Fonte" 
                    style={{ width: 200 }} 
                    allowClear 
                    onChange={setFilterSource}
                    loading={sources.length === 0}
                >
                    {sources.map(s => <Option key={s.id} value={s.id}>{s.name}</Option>)}
                </Select>
                <Select 
                    placeholder="Filtrar por Carteira" 
                    style={{ width: 200 }} 
                    allowClear 
                    onChange={setFilterWallet}
                    loading={wallets.length === 0}
                >
                    {wallets.map(w => <Option key={w.id} value={w.id}>{w.name}</Option>)}
                </Select>
              </div>
              {loading ? (
                <Skeleton active />
              ) : (
                <Table
                    className="table-responsive"
                    pagination={{ pageSize: 10 }}
                    locale={{ emptyText: 'Nenhuma receita registrada' }}
                    dataSource={incomes}
                    columns={columns}
                    rowKey="id"
                />
              )}
            </Cards>
          </Col>
        </Row>

        <Modal
            title="Conciliação Bancária"
            open={isReconcileModalOpen}
            onCancel={() => setIsReconcileModalOpen(false)}
            onOk={() => reconcileForm.submit()}
        >
            <Form form={reconcileForm} layout="vertical" onFinish={submitReconciliation}>
                <Form.Item name="status" label="Status da Receita" initialValue="conciliado">
                    <Select>
                        <Option value="recebido">Recebido (Ainda não conferido)</Option>
                        <Option value="conciliado">Conciliado (Conferido)</Option>
                    </Select>
                </Form.Item>
                <Form.Item>
                    <Button
                        type="link"
                        size="small"
                        icon={<FeatherIcon icon="help-circle" size={14} />}
                        onClick={() =>
                            Modal.info({
                                title: "Como funciona o Status da Receita?",
                                content: (
                                    <div>
                                        <p><strong>Recebido (Ainda não conferido):</strong> o valor já entrou na conta ou há comprovante, mas ainda não foi conferido com o extrato bancário oficial.</p>
                                        <p><strong>Conciliado (Conferido):</strong> além de recebido, o valor já foi conferido e bate com o extrato do banco, estando definitivamente validado.</p>
                                    </div>
                                ),
                            })
                        }
                    >
                        Entenda os status
                    </Button>
                </Form.Item>
                <Form.Item name="reconciliation_date" label="Data da Conciliação" rules={[{ required: true }]}>
                    <DatePicker format="DD/MM/YYYY" style={{ width: '100%' }} />
                </Form.Item>
                <Form.Item name="observations" label="Observações / Notas">
                    <TextArea rows={3} placeholder="Ex: Conferido no extrato do dia X" />
                </Form.Item>
            </Form>
        </Modal>
      </Main>
    </>
  );
}

export default IncomeDataTable;
