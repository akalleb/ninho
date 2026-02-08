import React, { useState, useEffect } from 'react';
import { Row, Col, Card, Statistic, Table, DatePicker, Button, message, Typography, Empty } from 'antd';
import { 
  ReloadOutlined, 
  UserOutlined, 
  TeamOutlined, 
  CheckCircleOutlined, 
  WalletOutlined 
} from '@ant-design/icons';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  Title,
  Tooltip,
  Legend,
  ArcElement,
} from 'chart.js';
import { Line, Doughnut, Bar } from 'react-chartjs-2';
import api from '../../config/api/axios';
// Importação do componente de Notificações
import NotificationBox from '../../components/utilities/auth-info/notification';

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  Title,
  Tooltip,
  Legend,
  ArcElement
);

const { RangePicker } = DatePicker;
// AntTitle removido pois foi substituído pelas notificações
const { Title: AntTitle } = Typography; 

const DashboardOverview = () => {
  const [loading, setLoading] = useState(true);
  const [metrics, setMetrics] = useState({
    childrenCount: 0,
    familiesCount: 0,
    attendancesCount: 0,
    totalBalance: 0
  });
  const [graphs, setGraphs] = useState({
    severity: { labels: [], data: [] },
    services: { labels: [], data: [] },
    evolution: { labels: [], data: [] }
  });
  const [incomes, setIncomes] = useState([]);
  const [dateRange, setDateRange] = useState([null, null]);

  const fetchData = async () => {
    setLoading(true);
    try {
      // 1. Métricas e Cards (Paralelo)
      const [childReq, famReq, walletReq] = await Promise.all([
        api.get('/children/count'),
        api.get('/families/count'),
        api.get('/wallets/'),
      ]);

      const totalBalance = walletReq.data.reduce((acc, curr) => acc + (curr.balance || 0), 0);

      // Datas para Filtros
      const now = new Date();
      // Default: Mês atual para o card de atendimentos
      const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
      const endOfMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0);
      
      let filterStart = startOfMonth.toISOString().split('T')[0];
      let filterEnd = endOfMonth.toISOString().split('T')[0];
      let isFiltered = false;

      if (dateRange[0] && dateRange[1]) {
        // AntD DatePicker returns Dayjs objects which have .format()
        filterStart = dateRange[0].format('YYYY-MM-DD');
        filterEnd = dateRange[1].format('YYYY-MM-DD');
        isFiltered = true;
      }

      // Chamada para o Card (Sempre respeita o filtro ou default mês atual)
      const attCardReq = await api.get(`/attendances/?status=finalizado&start_date=${filterStart}&end_date=${filterEnd}`);
      const attendancesCount = attCardReq.data.length;

      setMetrics({
        childrenCount: childReq.data.count,
        familiesCount: famReq.data.count,
        attendancesCount,
        totalBalance
      });

      // 2. Gráficos
      
      // Evolução (Line Chart)
      // Se tiver filtro, usa o filtro. Se não, últimos 12 meses.
      let evoStart = new Date();
      evoStart.setMonth(evoStart.getMonth() - 11);
      evoStart.setDate(1);
      let evoStartStr = evoStart.toISOString().split('T')[0];
      let evoEndStr = endOfMonth.toISOString().split('T')[0];

      if (isFiltered) {
        evoStartStr = filterStart;
        evoEndStr = filterEnd;
      }

      const attGraphReq = await api.get(`/attendances/?status=finalizado&start_date=${evoStartStr}&end_date=${evoEndStr}`);
      const evolutionData = processEvolutionData(attGraphReq.data);

      // Severidade (Pie)
      const sevReq = await api.get('/children/summary_by_severity_level');
      
      // Serviços (Bar)
      const servReq = await api.get('/evolutions/summary_by_service_type?months=3');

      setGraphs({
        severity: processSimpleData(sevReq.data, 'severity'),
        services: processSimpleData(servReq.data, 'service'),
        evolution: evolutionData
      });

      // 3. Tabela de Receitas
      const incReq = await api.get('/incomes/?limit=5&order_by=date_desc');
      setIncomes(incReq.data);

    } catch (error) {
      console.error("Erro ao carregar dados", error);
      message.error("Não foi possível carregar os dados do dashboard.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, [dateRange]);

  // Processadores de Dados
  const processSimpleData = (data, labelKey) => {
    const labels = data.map(item => item[labelKey] || 'Não Informado');
    const values = data.map(item => item.count);
    return { labels, data: values };
  };

  const processEvolutionData = (data) => {
    const grouped = {};
    data.forEach(item => {
        const dateStr = item.end_time || item.scheduled_time;
        if (!dateStr) return;
        const d = new Date(dateStr);
        const key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`;
        grouped[key] = (grouped[key] || 0) + 1;
    });

    const sortedKeys = Object.keys(grouped).sort();
    
    const labels = sortedKeys.map(key => {
        const [year, month] = key.split('-');
        const dateObj = new Date(parseInt(year), parseInt(month) - 1, 1);
        return dateObj.toLocaleDateString('pt-BR', { month: 'short', year: 'numeric' });
    });
    
    const values = sortedKeys.map(key => grouped[key]);
    
    return { labels, data: values };
  };

  const lineOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: { position: 'top' },
      title: { display: true, text: 'Evolução de Atendimentos Finalizados' },
    },
  };

  const pieOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
        legend: { position: 'right' },
    }
  };

  const barOptions = {
    responsive: true,
    maintainAspectRatio: false,
    indexAxis: 'y',
    plugins: {
        legend: { display: false },
        title: { display: true, text: 'Atendimentos por Tipo de Serviço (3 meses)' }
    }
  };

  const columns = [
    {
        title: 'Data',
        dataIndex: 'received_at',
        key: 'received_at',
        render: (text) => text ? new Date(text).toLocaleDateString('pt-BR') : '-'
    },
    {
        title: 'Descrição',
        dataIndex: 'description',
        key: 'description',
    },
    {
        title: 'Valor',
        dataIndex: 'amount',
        key: 'amount',
        render: (val) => `R$ ${parseFloat(val).toFixed(2).replace('.', ',')}`
    },
    {
        title: 'Status',
        dataIndex: 'status',
        key: 'status',
        render: (status) => (
            <span style={{ 
                color: status === 'recebido' || status === 'conciliado' ? 'green' : 'orange',
                fontWeight: 'bold',
                textTransform: 'capitalize'
            }}>
                {status}
            </span>
        )
    }
  ];

  return (
    <div style={{ padding: '25px' }}>
      {/* Header Atualizado: Visão Geral substituído por Notificações */}
      <Row gutter={25} justify="space-between" align="middle" style={{ marginBottom: 25 }}>
        <Col>
            {/* Título removido e substituído pelo componente de Notificações */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                <NotificationBox />
            </div>
        </Col>
        <Col>
            <div style={{ display: 'flex', gap: '10px' }}>
                <RangePicker 
                    onChange={(dates) => setDateRange(dates)} 
                    format="DD/MM/YYYY"
                    placeholder={['Início', 'Fim']}
                />
                <Button 
                    type="primary" 
                    icon={<ReloadOutlined />} 
                    onClick={fetchData}
                    loading={loading}
                >
                    Atualizar
                </Button>
            </div>
        </Col>
      </Row>

      {/* Cards de Destaque */}
      <Row gutter={25}>
        <Col xs={24} sm={12} md={6}>
            <Card variant="borderless" loading={loading}>
                <Statistic 
                    title="Crianças Cadastradas" 
                    value={metrics.childrenCount} 
                    prefix={<UserOutlined style={{ color: '#5F63F2' }} />}
                    valueStyle={{ color: '#5F63F2' }}
                />
            </Card>
        </Col>
        <Col xs={24} sm={12} md={6}>
            <Card variant="borderless" loading={loading}>
                <Statistic 
                    title="Famílias Atendidas" 
                    value={metrics.familiesCount} 
                    prefix={<TeamOutlined style={{ color: '#20C997' }} />}
                    valueStyle={{ color: '#20C997' }}
                />
            </Card>
        </Col>
        <Col xs={24} sm={12} md={6}>
            <Card variant="borderless" loading={loading}>
                <Statistic 
                    title="Atendimentos (Período)" 
                    value={metrics.attendancesCount} 
                    prefix={<CheckCircleOutlined style={{ color: '#FA8B0C' }} />}
                    valueStyle={{ color: '#FA8B0C' }}
                />
            </Card>
        </Col>
        <Col xs={24} sm={12} md={6}>
            <Card variant="borderless" loading={loading}>
                <Statistic 
                    title="Saldo de Recursos" 
                    value={metrics.totalBalance} 
                    precision={2}
                    prefix={<WalletOutlined style={{ color: '#FF69A5' }} />}
                    suffix="R$"
                    valueStyle={{ color: '#FF69A5' }}
                />
            </Card>
        </Col>
      </Row>

      {/* Gráficos Linha 1 */}
      <Row gutter={25} style={{ marginTop: 25 }}>
        <Col xs={24}>
            <Card variant="borderless" loading={loading} title="Evolução de Atendimentos">
                {graphs.evolution.data.length > 0 ? (
                    <div style={{ height: '300px', width: '100%' }}>
                        <Line options={lineOptions} data={{
                            labels: graphs.evolution.labels,
                            datasets: [{
                                label: 'Atendimentos Finalizados',
                                data: graphs.evolution.data,
                                borderColor: 'rgb(53, 162, 235)',
                                backgroundColor: 'rgba(53, 162, 235, 0.5)',
                                tension: 0.3,
                                fill: true
                            }]
                        }} />
                    </div>
                ) : <Empty description="Sem dados para o período" />}
            </Card>
        </Col>
      </Row>

      {/* Gráficos Linha 2 */}
      <Row gutter={25} style={{ marginTop: 25 }}>
        <Col xs={24} md={12}>
            <Card variant="borderless" loading={loading} title="Nível de Suporte (Crianças)">
                {graphs.severity.data.length > 0 ? (
                    <div style={{ height: '300px', display: 'flex', justifyContent: 'center' }}>
                        <Doughnut options={pieOptions} data={{
                            labels: graphs.severity.labels,
                            datasets: [{
                                data: graphs.severity.data,
                                backgroundColor: [
                                    'rgba(75, 192, 192, 0.6)',
                                    'rgba(255, 206, 86, 0.6)',
                                    'rgba(255, 99, 132, 0.6)',
                                    'rgba(153, 102, 255, 0.6)',
                                ],
                                borderWidth: 1,
                            }]
                        }} />
                    </div>
                ) : <Empty description="Sem dados" />}
            </Card>
        </Col>
        <Col xs={24} md={12}>
            <Card variant="borderless" loading={loading} title="Atendimentos por Especialidade">
                {graphs.services.data.length > 0 ? (
                    <div style={{ height: '300px' }}>
                        <Bar options={barOptions} data={{
                            labels: graphs.services.labels,
                            datasets: [{
                                label: 'Evoluções',
                                data: graphs.services.data,
                                backgroundColor: 'rgba(32, 201, 151, 0.6)',
                            }]
                        }} />
                    </div>
                ) : <Empty description="Sem dados" />}
            </Card>
        </Col>
      </Row>

      {/* Tabela de Receitas */}
      <Row gutter={25} style={{ marginTop: 25 }}>
        <Col xs={24}>
            <Card variant="borderless" loading={loading} title="Últimas Entradas de Receita">
                <Table 
                    dataSource={incomes} 
                    columns={columns} 
                    rowKey="id" 
                    pagination={false} 
                    size="small"
                />
            </Card>
        </Col>
      </Row>
    </div>
  );
};

export default DashboardOverview;
