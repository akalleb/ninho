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
        render: (text) => {
            const value = Number(text);
            return <span style={{ color: '#20C997' }}>R$ {(Number.isFinite(value) ? value : 0).toFixed(2)}</span>;
        },
    },
    {
        title: 'Despesas (Saídas)',
        dataIndex: 'total_expenses',
        key: 'total_expenses',
        render: (text) => {
            const value = Number(text);
            return <span style={{ color: '#FF4D4F' }}>R$ {(Number.isFinite(value) ? value : 0).toFixed(2)}</span>;
        },
    },
    {
        title: 'Saldo Atual',
        dataIndex: 'balance',
        key: 'balance',
        render: (text) => {
            const value = Number(text);
            return <b>R$ {(Number.isFinite(value) ? value : 0).toFixed(2)}</b>;
        },
    },
    {
        title: 'Utilização do Recurso',
        key: 'usage',
        width: 200,
        render: (_, record) => {
            const revenues = Number(record.total_revenues);
            const expenses = Number(record.total_expenses);
            const percent = Number.isFinite(revenues) && revenues > 0 && Number.isFinite(expenses)
                ? (expenses / revenues) * 100
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
                const list = Array.isArray(res.data) ? res.data : [];
                const tableData = list.map((item, index) => ({
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
