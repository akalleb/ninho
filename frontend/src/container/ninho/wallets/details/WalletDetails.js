import React, { useState, useEffect } from 'react';
import { Row, Col, Card, Statistic, Button, Tabs, Table, Tag, Modal, Form, Input, Select, DatePicker, InputNumber, App, Timeline, Skeleton } from 'antd';
import FeatherIcon from 'feather-icons-react';
import { PageHeader } from '../../../../components/page-headers/page-headers';
import { Main } from '../../../styled';
import api from '../../../../config/api/axios';
import { useRouter } from 'next/navigation';
import dayjs from 'dayjs';
import {
    Chart as ChartJS,
    CategoryScale,
    LinearScale,
    PointElement,
    LineElement,
    Title,
    Tooltip as ChartTooltip,
    Legend,
    Filler
} from 'chart.js';
import { Line } from 'react-chartjs-2';

ChartJS.register(
    CategoryScale,
    LinearScale,
    PointElement,
    LineElement,
    Title,
    ChartTooltip,
    Legend,
    Filler
);

const { Option } = Select;
const { TextArea } = Input;

function WalletDetails({ walletId }) {
  const [walletData, setWalletData] = useState(null);
  const [stats, setStats] = useState(null);
  const [transactions, setTransactions] = useState([]);
  const [wallets, setWallets] = useState([]); // For Transfer
  const [loading, setLoading] = useState(true);
  
  // Expense Modal State
  const [isExpenseModalOpen, setIsExpenseModalOpen] = useState(false);
  const [expenseLoading, setExpenseLoading] = useState(false);
  const [form] = Form.useForm();
  
  // Transfer Modal State
  const [isTransferModalOpen, setIsTransferModalOpen] = useState(false);
  const [transferLoading, setTransferLoading] = useState(false);
  const [transferForm] = Form.useForm();
  
  const router = useRouter();
  const { notification } = App.useApp();

  const fetchDashboard = async () => {
    // Prevent fetching if walletId is invalid or 'add' (which might be passed by routing mistake or during creation)
    if (!walletId || walletId === 'add') {
        setLoading(false);
        return;
    }

    setLoading(true);
    try {
        const [res, walletsRes] = await Promise.all([
            api.get(`/wallets/${walletId}/dashboard`),
            api.get('/wallets/')
        ]);
        
        setWalletData(res.data.wallet);
        setStats(res.data.stats);
        setWallets(walletsRes.data.filter(w => w.id !== parseInt(walletId)));
        
        // Fetch Transactions (Combined Revenues and Expenses)
        const [revRes, expRes] = await Promise.all([
            api.get('/revenues/', { params: { wallet_id: walletId } }),
            api.get('/expenses/', { params: { wallet_id: walletId } })
        ]);
        
        const revenues = revRes.data.map(r => ({ ...r, type: 'credit', date: r.received_at }));
        const expenses = expRes.data.map(e => ({ ...e, type: 'debit', date: e.paid_at }));
        
        const combined = [...revenues, ...expenses].sort((a, b) => new Date(b.date) - new Date(a.date));
        
        // Ensure unique keys for transactions table
        const transactionsWithKeys = combined.map((item, index) => ({
            ...item,
            uniqueKey: `${item.type}-${item.id}-${index}`
        }));
        
        setTransactions(transactionsWithKeys);
        
    } catch (error) {
        notification.error({ message: 'Erro ao carregar dados da carteira' });
    } finally {
        setLoading(false);
    }
  };

  useEffect(() => {
    if (walletId) fetchDashboard();
  }, [walletId]);

  const handleExpenseSubmit = async (values) => {
      setExpenseLoading(true);
      try {
          const payload = {
              ...values,
              wallet_id: walletId,
              paid_at: values.paid_at.format('YYYY-MM-DD'),
              amount: parseFloat(values.amount)
          };
          
          await api.post('/expenses/', payload);
          
          notification.success({ message: 'Saída registrada com sucesso!' });
          setIsExpenseModalOpen(false);
          form.resetFields();
          fetchDashboard(); // Refresh data
      } catch (error) {
          notification.error({ 
              message: 'Erro ao registrar saída', 
              description: error.response?.data?.detail || error.message 
          });
      } finally {
          setExpenseLoading(false);
      }
  };
  
  const handleTransferSubmit = async (values) => {
      setTransferLoading(true);
      try {
          const payload = {
              source_wallet_id: parseInt(walletId),
              target_wallet_id: values.target_wallet_id,
              amount: parseFloat(values.amount),
              transfer_date: values.transfer_date.format('YYYY-MM-DD'),
              description: values.description
          };
          
          await api.post('/wallets/transfer', payload);
          
          notification.success({ message: 'Transferência realizada com sucesso!' });
          setIsTransferModalOpen(false);
          transferForm.resetFields();
          fetchDashboard();
      } catch (error) {
          notification.error({ 
              message: 'Erro na transferência', 
              description: error.response?.data?.detail || error.message 
          });
      } finally {
          setTransferLoading(false);
      }
  };

  const handleUpdateWallet = async (values) => {
      try {
          await api.put(`/wallets/${walletId}`, values);
          notification.success({ message: 'Carteira atualizada com sucesso' });
          fetchDashboard(); // Refresh info
      } catch (error) {
          notification.error({ message: 'Erro ao atualizar', description: error.message });
      }
  };
  
  // --- Chart Data Preparation ---
  const prepareChartData = () => {
      // Sort transactions by date ascending
      const sorted = [...transactions].sort((a, b) => new Date(a.date) - new Date(b.date));
      
      // Calculate daily running balance
      // Note: This is an approximation starting from 0 or we need initial balance.
      // Since we don't have historical snapshots, we can try to reconstruct from current balance backwards or just show movement flow.
      // Better: Show Cumulative Flow or just daily In vs Out.
      // Let's show "Evolução do Saldo (Estimado)" assuming starting from 0 for simplicity or just daily activity.
      // Let's do Daily Activity (Income vs Expense) which is safer without snapshots.
      
      // Group by date
      const grouped = {};
      sorted.forEach(t => {
          const date = dayjs(t.date).format('DD/MM');
          if (!grouped[date]) grouped[date] = { income: 0, expense: 0 };
          if (t.type === 'credit' && (t.status === 'recebido' || t.status === 'conciliado')) {
              grouped[date].income += t.amount;
          } else if (t.type === 'debit' && t.status === 'pago') {
              grouped[date].expense += t.amount;
          }
      });
      
      const labels = Object.keys(grouped);
      const incomeData = labels.map(l => grouped[l].income);
      const expenseData = labels.map(l => grouped[l].expense);
      
      return {
          labels,
          datasets: [
              {
                  label: 'Entradas',
                  data: incomeData,
                  borderColor: '#3f8600',
                  backgroundColor: 'rgba(63, 134, 0, 0.2)',
                  tension: 0.4,
                  fill: true
              },
              {
                  label: 'Saídas',
                  data: expenseData,
                  borderColor: '#cf1322',
                  backgroundColor: 'rgba(207, 19, 34, 0.2)',
                  tension: 0.4,
                  fill: true
              }
          ]
      };
  };

  if (loading) {
      return (
          <>
            <PageHeader ghost title={<Skeleton.Input style={{ width: 200 }} active />} />
            <Main>
                <Row gutter={25}>
                    {[1,2,3,4].map(i => (
                        <Col key={i} xs={24} md={6}>
                            <Card styles={{ body: { padding: '20px' } }}><Skeleton active paragraph={{ rows: 1 }} /></Card>
                        </Col>
                    ))}
                    <Col xs={24} style={{ marginTop: 25 }}>
                        <Card styles={{ body: { padding: '20px' } }}><Skeleton active /></Card>
                    </Col>
                </Row>
            </Main>
          </>
      );
  }
  
  if (!walletData) return <div>Carteira não encontrada</div>;

  const columns = [
      {
          title: 'Data',
          dataIndex: 'date',
          key: 'date',
          render: (date) => dayjs(date).format('DD/MM/YYYY')
      },
      {
          title: 'Descrição',
          dataIndex: 'description',
          key: 'description',
          render: (text, record) => (
              <div>
                  <div style={{ fontWeight: 'bold' }}>{record.type === 'credit' ? 'Receita' : `Pagamento: ${record.destination}`}</div>
                  <div style={{ fontSize: '12px', color: '#888' }}>{text || (record.type === 'credit' ? 'Entrada de Recurso' : 'Saída Diversa')}</div>
              </div>
          )
      },
      {
          title: 'Tipo',
          dataIndex: 'type',
          key: 'type',
          render: (type) => (
              <Tag color={type === 'credit' ? 'green' : 'red'}>
                  {type === 'credit' ? 'Entrada (C)' : 'Saída (D)'}
              </Tag>
          )
      },
      {
          title: 'Valor',
          dataIndex: 'amount',
          key: 'amount',
          render: (value, record) => (
              <span style={{ color: record.type === 'credit' ? '#3f8600' : '#cf1322', fontWeight: 'bold' }}>
                  {record.type === 'debit' ? '- ' : '+ '}
                  R$ {value.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
              </span>
          )
      },
      {
          title: 'Status',
          dataIndex: 'status',
          key: 'status',
          render: (status, record) => {
              const statusMap = {
                  'recebido': { color: 'success', text: 'Recebido', icon: 'check-circle' },
                  'pago': { color: 'success', text: 'Pago', icon: 'check-circle' },
                  'conciliado': { color: 'purple', text: 'Conciliado', icon: 'check-square' },
                  'pendente': { color: 'warning', text: 'Pendente', icon: 'clock' },
                  'agendado': { color: 'processing', text: 'Agendado', icon: 'calendar' },
                  'cancelado': { color: 'error', text: 'Cancelado', icon: 'x-circle' }
              };
              
              const current = statusMap[status] || { color: 'default', text: status, icon: 'info' };
              
              return (
                  <Tag icon={<FeatherIcon icon={current.icon} size={12} />} color={current.color}>
                      {current.text.toUpperCase()}
                  </Tag>
              );
          }
      }
  ];

  return (
    <>
      <PageHeader
        ghost
        title={walletData.name}
        subTitle={`${walletData.bank_name || 'Banco'} | Ag: ${walletData.agency || '---'} | CC: ${walletData.account_number || '---'} | ${walletData.category.toUpperCase()}`}
        buttons={[
          <Button key="1" type="primary" onClick={() => setIsExpenseModalOpen(true)} danger>
            <FeatherIcon icon="minus-circle" size={14} /> Nova Saída / Pagamento
          </Button>,
          <Button key="2" onClick={() => setIsTransferModalOpen(true)}>
            <FeatherIcon icon="repeat" size={14} /> Transferência
          </Button>
        ]}
      />
      <Main>
        <Row gutter={25}>
          {/* Header Stats */}
          <Col xs={24} md={6}>
            <Card styles={{ body: { padding: '20px' } }}>
                <Statistic 
                    title="Saldo Disponível" 
                    value={stats.current_balance} 
                    precision={2} 
                    prefix="R$" 
                    valueStyle={{ color: '#3f8600' }}
                />
            </Card>
          </Col>
          <Col xs={24} md={6}>
            <Card styles={{ body: { padding: '20px' } }}>
                <Statistic 
                    title="Entradas (Mês)" 
                    value={stats.incomes_month} 
                    precision={2} 
                    prefix="R$" 
                    valueStyle={{ color: '#2db7f5' }}
                />
            </Card>
          </Col>
          <Col xs={24} md={6}>
            <Card styles={{ body: { padding: '20px' } }}>
                <Statistic 
                    title="Saídas (Mês)" 
                    value={stats.expenses_month} 
                    precision={2} 
                    prefix="R$" 
                    valueStyle={{ color: '#cf1322' }}
                />
            </Card>
          </Col>
          <Col xs={24} md={6}>
             <Card styles={{ body: { padding: '20px' } }}>
                <Statistic 
                    title="A Receber (Pendente)" 
                    value={stats.pending_incomes} 
                    precision={2} 
                    prefix="R$" 
                    valueStyle={{ color: '#faad14' }}
                />
            </Card>
          </Col>

          {/* Main Content Tabs */}
          <Col xs={24} style={{ marginTop: 25 }}>
            <Card styles={{ body: { padding: '20px' } }}>
                <Tabs 
                    defaultActiveKey="extrato"
                    items={[
                        {
                            key: 'extrato',
                            label: 'Extrato Inteligente',
                            children: (
                                <Table 
                                    dataSource={transactions} 
                                    columns={columns} 
                                    rowKey="uniqueKey"
                                    pagination={{ pageSize: 10 }}
                                />
                            )
                        },
                        {
                            key: 'relatorios',
                            label: 'Relatórios',
                            children: (
                                <div style={{ padding: 20 }}>
                                    <h3 style={{ marginBottom: 20 }}>Fluxo de Entradas e Saídas (Diário)</h3>
                                    {transactions.length > 0 ? (
                                        <Line 
                                            data={prepareChartData()} 
                                            options={{
                                                responsive: true,
                                                plugins: {
                                                    legend: { position: 'top' },
                                                    title: { display: false }
                                                }
                                            }} 
                                        />
                                    ) : (
                                        <p style={{ textAlign: 'center', color: '#999' }}>Sem dados para exibir gráfico</p>
                                    )}
                                </div>
                            )
                        },
                        {
                            key: 'config',
                            label: 'Configurações',
                            children: (
                                <div style={{ maxWidth: 800 }}>
                                    <Form layout="vertical" initialValues={walletData} onFinish={handleUpdateWallet}>
                                        <Row gutter={25}>
                                            <Col xs={24} md={12}>
                                                <Form.Item name="name" label="Nome da Carteira" rules={[{ required: true }]}>
                                                    <Input />
                                                </Form.Item>
                                            </Col>
                                            <Col xs={24} md={12}>
                                                <Form.Item name="category" label="Categoria">
                                                    <Select>
                                                        <Option value="educacao">Educação</Option>
                                                        <Option value="saude">Saúde</Option>
                                                        <Option value="assistencia_social">Assistência Social</Option>
                                                        <Option value="infraestrutura">Infraestrutura</Option>
                                                        <Option value="livre">Livre</Option>
                                                    </Select>
                                                </Form.Item>
                                            </Col>
                                            <Col xs={24} md={8}>
                                                <Form.Item name="bank_name" label="Nome do Banco">
                                                    <Input placeholder="Ex: Banco do Brasil" />
                                                </Form.Item>
                                            </Col>
                                            <Col xs={24} md={8}>
                                                <Form.Item name="agency" label="Agência">
                                                    <Input placeholder="Ex: 0001-9" />
                                                </Form.Item>
                                            </Col>
                                            <Col xs={24} md={8}>
                                                <Form.Item name="account_number" label="Conta Corrente">
                                                    <Input placeholder="Ex: 12345-6" />
                                                </Form.Item>
                                            </Col>
                                            <Col xs={24} md={12}>
                                                <Form.Item name="pix_key" label="Chave PIX">
                                                    <Input placeholder="CPF, CNPJ, Email ou Aleatória" />
                                                </Form.Item>
                                            </Col>
                                            <Col xs={24} md={12}>
                                                <Form.Item name="is_restricted" label="Restrição (Recurso Carimbado)">
                                                    <Select>
                                                        <Option value={true}>Sim (Restrito)</Option>
                                                        <Option value={false}>Não (Livre)</Option>
                                                    </Select>
                                                </Form.Item>
                                            </Col>
                                            <Col xs={24}>
                                                <Form.Item name="description" label="Descrição / Finalidade">
                                                    <TextArea rows={3} />
                                                </Form.Item>
                                            </Col>
                                            <Col xs={24}>
                                                <Button type="primary" htmlType="submit">
                                                    Salvar Alterações
                                                </Button>
                                            </Col>
                                        </Row>
                                    </Form>
                                </div>
                            )
                        }
                    ]}
                />
            </Card>
          </Col>
        </Row>

        {/* Expense Modal */}
        <Modal
            title="Registrar Saída / Pagamento"
            open={isExpenseModalOpen}
            onCancel={() => setIsExpenseModalOpen(false)}
            footer={null}
        >
            <Form layout="vertical" form={form} onFinish={handleExpenseSubmit}>
                <Form.Item name="destination" label="Favorecido (Quem recebe?)" rules={[{ required: true }]}>
                    <Input placeholder="CNPJ, CPF ou Nome do Fornecedor" />
                </Form.Item>
                
                <Row gutter={16}>
                    <Col span={12}>
                        <Form.Item name="amount" label="Valor (R$)" rules={[{ required: true }]}>
                             <InputNumber
                                style={{ width: '100%' }}
                                formatter={(value) => `R$ ${value}`.replace(/\B(?=(\d{3})+(?!\d))/g, '.')}
                                parser={(value) => value.replace(/R\$\s?|(\.*)/g, '').replace(',', '.')}
                            />
                        </Form.Item>
                    </Col>
                    <Col span={12}>
                        <Form.Item name="paid_at" label="Data do Pagamento" rules={[{ required: true }]}>
                            <DatePicker format="DD/MM/YYYY" style={{ width: '100%' }} />
                        </Form.Item>
                    </Col>
                </Row>

                <Form.Item name="document_ref" label="Nº Nota Fiscal / Recibo">
                    <Input />
                </Form.Item>

                <Form.Item name="status" label="Status" initialValue="pago">
                    <Select>
                        <Option value="pago">Pago (Deduzir do Saldo)</Option>
                        <Option value="agendado">Agendado (Futuro)</Option>
                    </Select>
                </Form.Item>

                <Form.Item name="description" label="Descrição / Motivo">
                    <TextArea rows={3} />
                </Form.Item>

                <Button type="primary" htmlType="submit" loading={expenseLoading} block danger>
                    Confirmar Saída
                </Button>
            </Form>
        </Modal>

        {/* Transfer Modal */}
        <Modal
            title="Transferência entre Carteiras"
            open={isTransferModalOpen}
            onCancel={() => setIsTransferModalOpen(false)}
            footer={null}
        >
            <Form layout="vertical" form={transferForm} onFinish={handleTransferSubmit}>
                <Form.Item name="target_wallet_id" label="Carteira de Destino" rules={[{ required: true, message: 'Selecione o destino' }]}>
                    <Select placeholder="Selecione a carteira">
                        {wallets.map(w => (
                            <Option key={w.id} value={w.id}>{w.name} (Saldo: R$ {w.balance.toFixed(2)})</Option>
                        ))}
                    </Select>
                </Form.Item>

                <Form.Item name="amount" label="Valor da Transferência (R$)" rules={[{ required: true }]}>
                    <InputNumber
                        style={{ width: '100%' }}
                        formatter={(value) => `R$ ${value}`.replace(/\B(?=(\d{3})+(?!\d))/g, '.')}
                        parser={(value) => value.replace(/R\$\s?|(\.*)/g, '').replace(',', '.')}
                        max={stats?.current_balance}
                    />
                </Form.Item>

                <Form.Item name="transfer_date" label="Data da Transferência" initialValue={dayjs()} rules={[{ required: true }]}>
                    <DatePicker format="DD/MM/YYYY" style={{ width: '100%' }} />
                </Form.Item>

                <Form.Item name="description" label="Motivo / Descrição">
                    <TextArea rows={2} placeholder="Ex: Ajuste de caixa, Repasse de recursos..." />
                </Form.Item>
                
                <div style={{ background: '#fffbe6', padding: 10, borderRadius: 4, marginBottom: 20, border: '1px solid #ffe58f' }}>
                    <small>Nota: Esta ação criará uma <b>Saída</b> nesta carteira e uma <b>Entrada</b> na carteira de destino.</small>
                </div>

                <Button type="primary" htmlType="submit" loading={transferLoading} block>
                    Confirmar Transferência
                </Button>
            </Form>
        </Modal>

      </Main>
    </>
  );
}

export default WalletDetails;