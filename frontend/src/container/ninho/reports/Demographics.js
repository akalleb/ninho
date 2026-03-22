'use client';

import React, { useState, useEffect } from 'react';
// import { PieChart, Pie, Cell, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { Row, Col, Card, Spin } from 'antd';
import api from '../../../config/api/axios';

const COLORS = ['#5F63F2', '#20C997', '#FA8B0C', '#FF4D4F'];

function Demographics({ filters }) {
    const [dataDiagnosis, setDataDiagnosis] = useState([]);
    const [dataAge, setDataAge] = useState([]);
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        setLoading(true);
        const params = {}; 

        Promise.all([
            api.get('/reports/bi/demographics', { params: { type: 'diagnosis' } }),
            api.get('/reports/bi/demographics', { params: { type: 'age' } })
        ]).then(([resDiag, resAge]) => {
            const diagList = resDiag?.data && Array.isArray(resDiag.data) ? resDiag.data : [];
            const ageList = resAge?.data && Array.isArray(resAge.data) ? resAge.data : [];
            setDataDiagnosis(diagList.map(d => ({ name: d.category || 'Outros', value: d.count || 0 })));
            setDataAge(ageList.map(d => ({ name: d.category || 'Outros', value: d.count || 0 })));
        }).catch(err => {
            console.error("Erro ao carregar demografia", err);
            setDataDiagnosis([]);
            setDataAge([]);
        })
          .finally(() => setLoading(false));

    }, [filters]);

    return (
        <Row gutter={25}>
             <Col xs={24} md={12}>
                <Card title="Distribuição por Diagnóstico (CID)" variant="borderless">
                    {loading ? <div style={{ textAlign: 'center', padding: 50 }}><Spin /></div> : (
                        <div>Chart removed for testing</div>
                    )}
                </Card>
             </Col>
             <Col xs={24} md={12}>
                <Card title="Faixa Etária" variant="borderless">
                    {loading ? <div style={{ textAlign: 'center', padding: 50 }}><Spin /></div> : (
                        <div>Chart removed for testing</div>
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
