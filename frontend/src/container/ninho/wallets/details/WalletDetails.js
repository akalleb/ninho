import React, { useMemo, useState } from 'react';
import { Row, Col, Card, Statistic, Button, Tabs, Table, Tag, Modal, Form, Input, Select, DatePicker, InputNumber, App, Skeleton, Popconfirm, Spin, Switch } from 'antd';
import FeatherIcon from 'feather-icons-react';
import { PageHeader } from '../../../../components/page-headers/page-headers';
import { Main } from '../../../styled';
import { useRouter } from 'next/navigation';
import dayjs from 'dayjs';
import useWalletDashboard from './hooks/useWalletDashboard';
import useWalletPayroll from './hooks/useWalletPayroll';
import useWalletFinancialActions from './hooks/useWalletFinancialActions';
import useWalletStatementData from './hooks/useWalletStatementData';
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
  const router = useRouter();
  const { notification } = App.useApp();
  const [activeTabKey, setActiveTabKey] = useState('extrato');
  const {
    walletData,
    setWalletData,
    stats,
    transactions,
    wallets,
    loading,
    refreshDashboard,
  } = useWalletDashboard({ walletId, notification });
  const {
    payrollMonth,
    setPayrollMonth,
    payrollLoading,
    savingFixedStaff,
    generatingFixedPayment,
    exportingPendingPdf,
    monthKey,
    payrollRows,
    fixedStaffRows,
    roleLabel,
    updateFixedRule,
    saveFixedStaffRules,
    createFixedPaymentForMonth,
    handlePayAttendanceMany,
    handleConfirmFixedStaffPayment,
    handleExportPendingFixedPaymentsPDF,
  } = useWalletPayroll({
    walletId,
    walletData,
    setWalletData,
    transactions,
    notification,
    refreshDashboard,
  });
  const {
    isExpenseModalOpen,
    setIsExpenseModalOpen,
    expenseLoading,
    form,
    isTransferModalOpen,
    setIsTransferModalOpen,
    transferLoading,
    transferForm,
    handleExpenseSubmit,
    handleTransferSubmit,
    handleUpdateWallet,
  } = useWalletFinancialActions({ walletId, notification, refreshDashboard });

  const { statementTransactions, chartData } = useWalletStatementData({ transactions });

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
                  <div style={{ fontWeight: 'bold' }}>
                    {record.type === 'credit'
                      ? 'Receita'
                      : record.document_ref?.startsWith('payroll:health:')
                        ? `Pagamento Profissional de Saúde: ${(record.destination || '').replace(' (Prof. Saúde)', '')}`
                        : `Pagamento: ${record.destination}`}
                  </div>
                  <div style={{ fontSize: '12px', color: '#888' }}>
                    {text || (record.type === 'credit' ? 'Entrada de Recurso' : 'Saída Diversa')}
                  </div>
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
      },
  ];

  const payrollColumns = [
    {
      title: 'Profissional',
      dataIndex: 'professional_name',
      key: 'professional_name',
      render: (text, record) => (
        <div>
          <div style={{ fontWeight: 600 }}>{text}</div>
          <div style={{ fontSize: 12, color: '#888' }}>
            {record.count} atendimento(s) pendente(s) no mês
          </div>
        </div>
      ),
    },
    {
      title: 'Total a pagar',
      dataIndex: 'total_amount',
      key: 'total_amount',
      render: (value) => (
        <span style={{ color: '#cf1322', fontWeight: 'bold' }}>
          R$ {(value || 0).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
        </span>
      ),
    },
    {
      title: 'Ações',
      key: 'actions',
      render: (_, record) => {
        const expenseIds = record.expenses.map((x) => x.expense.id);
        if (!expenseIds.length) return null;
        return (
          <Popconfirm
            title="Confirmar todos os pagamentos deste profissional?"
            okText="Confirmar"
            cancelText="Não"
            onConfirm={() => handlePayAttendanceMany(expenseIds)}
          >
            <Button size="small" type="primary" danger loading={payrollLoading}>
              Pagar tudo
            </Button>
          </Popconfirm>
        );
      },
    },
  ];

  const fixedStaffColumns = [
    {
      title: 'Colaborador',
      key: 'professional',
      render: (_, row) => (
        <div>
          <div style={{ fontWeight: 600 }}>{row.professional.name}</div>
          <div style={{ fontSize: 12, color: '#888' }}>{roleLabel(row.professional.role)}</div>
        </div>
      ),
    },
    {
      title: 'Valor mensal',
      key: 'amount',
      width: 200,
      render: (_, row) => (
        <InputNumber
          style={{ width: '100%' }}
          value={Number(row.rule.amount) || 0}
          min={0}
          formatter={(value) => `R$ ${value}`.replace(/\B(?=(\d{3})+(?!\d))/g, '.')}
          parser={(value) => value.replace(/R\$\s?|(\.*)/g, '').replace(',', '.')}
          onChange={(v) => updateFixedRule(row.professional.id, { amount: Number(v) || 0 })}
        />
      ),
    },
    {
      title: 'Recorrente',
      key: 'recurring',
      width: 140,
      render: (_, row) => (
        <Switch
          checked={row.rule.recurring !== false}
          onChange={(checked) => updateFixedRule(row.professional.id, { recurring: !!checked })}
        />
      ),
    },
    {
      title: 'Mês',
      key: 'month',
      width: 110,
      render: () => monthKey,
    },
    {
      title: 'Status',
      key: 'status',
      width: 140,
      render: (_, row) => {
        if (!row.payment) return <Tag>Não gerado</Tag>;
        const status = row.payment.status || '—';
        const color =
          status === 'pago'
            ? 'success'
            : status === 'pendente' || status === 'agendado'
            ? 'warning'
            : 'default';
        return <Tag color={color}>{String(status).toUpperCase()}</Tag>;
      },
    },
    {
      title: 'Ações',
      key: 'actions',
      width: 210,
      render: (_, row) => {
        const hasPayment = !!row.payment;
        const canConfirm =
          !!row.payment && (row.payment.status === 'pendente' || row.payment.status === 'agendado');
        return (
          <div style={{ display: 'flex', gap: 8 }}>
            <Popconfirm
              title="Gerar pagamento do mês como pendente?"
              okText="Gerar"
              cancelText="Cancelar"
              onConfirm={() => createFixedPaymentForMonth(row.professional)}
              disabled={hasPayment || generatingFixedPayment}
            >
              <Button size="small" type="primary" danger disabled={hasPayment || generatingFixedPayment}>
                Gerar
              </Button>
            </Popconfirm>
            <Popconfirm
              title="Confirmar este pagamento?"
              okText="Confirmar"
              cancelText="Não"
              onConfirm={() => handleConfirmFixedStaffPayment(row.payment.id)}
              disabled={!canConfirm || generatingFixedPayment}
            >
              <Button size="small" type="default" disabled={!canConfirm || generatingFixedPayment}>
                Confirmar
              </Button>
            </Popconfirm>
          </div>
        );
      },
    },
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
          <Col xs={24} md={6}>
             <Card styles={{ body: { padding: '20px' } }}>
                <Statistic 
                    title="A Pagar (Pendente)" 
                    value={stats.pending_expenses || 0} 
                    precision={2} 
                    prefix="R$" 
                    valueStyle={{ color: '#cf1322' }}
                />
            </Card>
          </Col>

          {/* Main Content Tabs */}
          <Col xs={24} style={{ marginTop: 25 }}>
            <Card styles={{ body: { padding: '20px' } }}>
                <Tabs 
                    activeKey={activeTabKey}
                    onChange={setActiveTabKey}
                    items={[
                        {
                            key: 'extrato',
                            label: 'Extrato Inteligente',
                            children: (
                                <Table 
                                    dataSource={statementTransactions} 
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
                                            data={chartData} 
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
                            key: 'folha',
                            label: 'Folha de pagamento',
                            children: (
                                <div style={{ padding: 20 }}>
                                    <Row gutter={16} style={{ marginBottom: 16 }}>
                                        <Col xs={24} md={8}>
                                            <DatePicker
                                                picker="month"
                                                value={payrollMonth}
                                                onChange={(v) => setPayrollMonth(v || dayjs())}
                                                style={{ width: '100%' }}
                                            />
                                        </Col>
                                        <Col xs={24} md={16} style={{ display: 'flex', alignItems: 'center' }}>
                                            <div style={{ color: '#888' }}>
                                                Pagamentos pendentes por atendimento (confirme para efetivar).
                                            </div>
                                        </Col>
                                    </Row>
                                    <Card
                                      title="Equipe fixa (Gestor / Operacional)"
                                      variant="borderless"
                                      style={{ marginBottom: 16 }}
                                      extra={
                                        <div style={{ display: 'flex', gap: 8 }}>
                                          <Button onClick={handleExportPendingFixedPaymentsPDF} loading={exportingPendingPdf}>
                                            Exportar pendentes (PDF)
                                          </Button>
                                          <Button type="primary" onClick={saveFixedStaffRules} loading={savingFixedStaff}>
                                            Salvar regras
                                          </Button>
                                        </div>
                                      }
                                    >
                                      <Table
                                        dataSource={fixedStaffRows}
                                        columns={fixedStaffColumns}
                                        pagination={{ pageSize: 8 }}
                                      />
                                    </Card>
                                    {payrollLoading ? (
                                        <div style={{ display: 'flex', justifyContent: 'center', padding: 24 }}>
                                            <Spin />
                                        </div>
                                    ) : (
                                        <Table
                                            dataSource={payrollRows}
                                            columns={payrollColumns}
                                            pagination={{ pageSize: 8 }}
                                            expandable={{
                                              expandedRowRender: (record) => (
                                                <Table
                                                  dataSource={record.expenses.map((x) => ({
                                                    key: String(x.expense.id),
                                                    expense: x.expense,
                                                    attendance: x.attendance,
                                                  }))}
                                                  pagination={false}
                                                  columns={[
                                                    {
                                                      title: 'Criança',
                                                      key: 'child',
                                                      render: (_, row) => row.attendance?.child?.name || '—',
                                                    },
                                                    {
                                                      title: 'Atendimento',
                                                      key: 'attendance',
                                                      render: (_, row) => `#${row.expense.attendance_id}`,
                                                    },
                                                    {
                                                      title: 'Valor',
                                                      key: 'amount',
                                                      render: (_, row) => (
                                                        <span style={{ color: '#cf1322', fontWeight: 600 }}>
                                                          R$ {(row.expense.amount || 0).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                                                        </span>
                                                      ),
                                                    },
                                                    {
                                                      title: 'Status',
                                                      key: 'status',
                                                      render: () => <Tag color="warning">PENDENTE</Tag>,
                                                    },
                                                  ]}
                                                />
                                              ),
                                            }}
                                        />
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
