import React, { useState, useEffect } from 'react';
import { Row, Col, Card, Spin } from 'antd';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, LineChart, Line } from 'recharts';
import api from '../../../config/api/axios';

function BiCharts({ filters }) {
  const [data, setData] = useState([]);
  const [lineData, setLineData] = useState([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    setLoading(true);
    const params = {};
    if (filters.start_date) params.start_date = filters.start_date;
    if (filters.end_date) params.end_date = filters.end_date;
    
    Promise.all([
        // Group By Professional (Default)
        api.get('/reports/bi/productivity', { params: { ...params, group_by: 'professional' } }),
        // Evolution
        api.get('/reports/bi/evolution', { params })
    ])
      .then(([resProd, resEvo]) => {
        const prodList = Array.isArray(resProd.data) ? resProd.data : [];
        const evoList = Array.isArray(resEvo.data) ? resEvo.data : [];
        const chartData = prodList.map(item => ({
            name: item.group,
            atendimentos: item.count
        }));
        setData(chartData);
        setLineData(evoList);
      })
      .catch(err => console.error("Erro ao carregar dados de BI", err))
      .finally(() => setLoading(false));

  }, [filters]);

  return (
    <div style={{ marginBottom: 25 }}>
      <Row gutter={25}>
        <Col xs={24} md={12}>
            <Card title="Produtividade por Profissional" variant="borderless">
                {loading ? <div style={{ textAlign: 'center', padding: 50 }}><Spin /></div> : (
                    <ResponsiveContainer width="100%" height={300}>
                        <BarChart data={data}>
                            <CartesianGrid strokeDasharray="3 3" />
                            <XAxis dataKey="name" />
                            <YAxis />
                            <Tooltip />
                            <Legend />
                            <Bar dataKey="atendimentos" fill="#5F63F2" name="Atendimentos" />
                        </BarChart>
                    </ResponsiveContainer>
                )}
            </Card>
        </Col>
         <Col xs={24} md={12}>
            <Card title="Evolução de Atendimentos" variant="borderless">
                {loading ? <div style={{ textAlign: 'center', padding: 50 }}><Spin /></div> : (
                 <ResponsiveContainer width="100%" height={300}>
                    <LineChart data={lineData}>
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis dataKey="name" />
                        <YAxis />
                        <Tooltip />
                        <Legend />
                        <Line type="monotone" dataKey="agendados" stroke="#FA8B0C" name="Agendados" />
                        <Line type="monotone" dataKey="realizados" stroke="#20C997" name="Realizados" />
                    </LineChart>
                </ResponsiveContainer>
                )}
            </Card>
        </Col>
      </Row>
    </div>
  );
}

export default BiCharts;
