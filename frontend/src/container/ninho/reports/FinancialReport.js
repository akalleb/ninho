import React, { useState, useEffect } from 'react';
import { Table, Card, Progress, Spin } from 'antd';
import api from '../../../config/api/axios';

const columns = [
    {
        title: 'Carteira / Fonte',
        dataIndex: 'wallet_name',
        key: 'wallet_name',
    },
    {
        title: 'Tipo',
        dataIndex: 'source_type',
        key: 'source_type',
    },
    {
        title: 'Receitas (Entradas)',
        dataIndex: 'total_revenues',
        key: 'total_revenues',
        render: (text) => <span style={{ color: '#20C997' }}>R$ {text.toFixed(2)}</span>,
    },
    {
        title: 'Despesas (Saídas)',
        dataIndex: 'total_expenses',
        key: 'total_expenses',
        render: (text) => <span style={{ color: '#FF4D4F' }}>R$ {text.toFixed(2)}</span>,
    },
    {
        title: 'Saldo Atual',
        dataIndex: 'balance',
        key: 'balance',
        render: (text) => <b>R$ {text.toFixed(2)}</b>,
    },
    {
        title: 'Utilização do Recurso',
        key: 'usage',
        width: 200,
        render: (_, record) => {
            const percent = record.total_revenues > 0 
                ? (record.total_expenses / record.total_revenues) * 100 
                : 0;
            return <Progress percent={Math.min(percent, 100).toFixed(1)} size="small" status={percent > 90 ? 'exception' : 'active'} strokeColor={percent > 90 ? '#FF4D4F' : '#5F63F2'} />;
        }
    }
];

function FinancialReport({ filters }) {
    const [data, setData] = useState([]);
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        setLoading(true);
        const params = {};
        if (filters.start_date) params.start_date = filters.start_date;
        if (filters.end_date) params.end_date = filters.end_date;

        api.get('/reports/bi/financial', { params })
            .then(res => {
                const tableData = res.data.map((item, index) => ({
                    key: index,
                    ...item
                }));
                setData(tableData);
            })
            .catch(err => console.error("Erro ao carregar financeiro", err))
            .finally(() => setLoading(false));
    }, [filters]);

    return (
        <Card title="Visão Financeira por Fonte de Recurso" variant="borderless">
            {loading ? <div style={{ textAlign: 'center', padding: 20 }}><Spin /></div> : (
                <Table columns={columns} dataSource={data} pagination={false} />
            )}
        </Card>
    );
}

export default FinancialReport;
