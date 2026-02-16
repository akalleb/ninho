import React, { useState, useEffect } from 'react';
import { Row, Col, Card, Spin } from 'antd';
import { PieChart, Pie, Cell, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import api from '../../../config/api/axios';

const COLORS = ['#5F63F2', '#20C997', '#FA8B0C', '#FF4D4F'];

function Demographics({ filters }) {
    const [dataDiagnosis, setDataDiagnosis] = useState([]);
    const [dataAge, setDataAge] = useState([]);
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        setLoading(true);
        const params = {}; // Filters can be added here if backend supports

        Promise.all([
            api.get('/reports/bi/demographics', { params: { type: 'diagnosis' } }),
            api.get('/reports/bi/demographics', { params: { type: 'age' } })
        ]).then(([resDiag, resAge]) => {
            const diagList = Array.isArray(resDiag.data) ? resDiag.data : [];
            const ageList = Array.isArray(resAge.data) ? resAge.data : [];
            setDataDiagnosis(diagList.map(d => ({ name: d.category, value: d.count })));
            setDataAge(ageList.map(d => ({ name: d.category, value: d.count })));
        }).catch(err => console.error("Erro ao carregar demografia", err))
          .finally(() => setLoading(false));

    }, [filters]);

    return (
        <Row gutter={25}>
             <Col xs={24} md={12}>
                <Card title="Distribuição por Diagnóstico (CID)" variant="borderless">
                    {loading ? <div style={{ textAlign: 'center', padding: 50 }}><Spin /></div> : (
                        <ResponsiveContainer width="100%" height={300}>
                            <PieChart>
                                <Pie
                                    data={dataDiagnosis}
                                    cx="50%"
                                    cy="50%"
                                    labelLine={false}
                                    outerRadius={100}
                                    fill="#8884d8"
                                    dataKey="value"
                                >
                                    {dataDiagnosis.map((entry, index) => (
                                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                                    ))}
                                </Pie>
                                <Tooltip />
                                <Legend />
                            </PieChart>
                        </ResponsiveContainer>
                    )}
                </Card>
             </Col>
             <Col xs={24} md={12}>
                <Card title="Faixa Etária" variant="borderless">
                    {loading ? <div style={{ textAlign: 'center', padding: 50 }}><Spin /></div> : (
                        <ResponsiveContainer width="100%" height={300}>
                            <PieChart>
                                <Pie
                                    data={dataAge}
                                    cx="50%"
                                    cy="50%"
                                    innerRadius={60}
                                    outerRadius={100}
                                    fill="#8884d8"
                                    paddingAngle={5}
                                    dataKey="value"
                                >
                                    {dataAge.map((entry, index) => (
                                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                                    ))}
                                </Pie>
                                <Tooltip />
                                <Legend />
                            </PieChart>
                        </ResponsiveContainer>
                    )}
                </Card>
             </Col>
             <Col xs={24}>
                 <Card title="Mapa de Calor (Geolocalização)" variant="borderless" style={{ marginTop: 25 }}>
                     <div style={{ height: 400, background: '#f0f2f5', display: 'flex', alignItems: 'center', justifyContent: 'center', flexDirection: 'column' }}>
                         <h3>Mapa de Distribuição de Famílias</h3>
                         <p>Visualização geográfica por bairro (Angicos/RN)</p>
                         <p style={{ color: '#999', fontSize: 12 }}>(Integração de mapa requer chave de API Google Maps ou Leaflet configurado)</p>
                     </div>
                 </Card>
             </Col>
        </Row>
    )
}

export default Demographics;
