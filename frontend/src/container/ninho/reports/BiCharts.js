'use client';

import React, { useState, useEffect } from 'react';
import dynamic from 'next/dynamic';
import { Row, Col, Card, Spin } from 'antd';
import api from '../../../config/api/axios';

const Chart = dynamic(() => import('react-apexcharts'), { ssr: false });

function BiCharts({ filters }) {
  const [barSeries, setBarSeries] = useState([]);
  const [barCategories, setBarCategories] = useState([]);
  const [lineSeries, setLineSeries] = useState([]);
  const [lineCategories, setLineCategories] = useState([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    setLoading(true);
    const params = {};
    if (filters.start_date) params.start_date = filters.start_date;
    if (filters.end_date) params.end_date = filters.end_date;

    Promise.all([
      api.get('/reports/bi/productivity', { params: { ...params, group_by: 'professional' } }),
      api.get('/reports/bi/evolution', { params }),
    ])
      .then(([resProd, resEvo]) => {
        const prodList = Array.isArray(resProd.data) ? resProd.data : [];
        const evoList = Array.isArray(resEvo.data) ? resEvo.data : [];

        const categories = prodList.map((item) => item.group);
        const values = prodList.map((item) => item.count);

        setBarCategories(categories);
        setBarSeries([
          {
            name: 'Atendimentos',
            data: values,
          },
        ]);

        const evoCategories = evoList.map((item) => item.name);
        const agendados = evoList.map((item) => item.agendados);
        const realizados = evoList.map((item) => item.realizados);

        setLineCategories(evoCategories);
        setLineSeries([
          {
            name: 'Agendados',
            data: agendados,
          },
          {
            name: 'Realizados',
            data: realizados,
          },
        ]);
      })
      .catch((err) => console.error('Erro ao carregar dados de BI', err))
      .finally(() => setLoading(false));
  }, [filters]);

  return (
    <div style={{ marginBottom: 25 }}>
      <Row gutter={25}>
        <Col xs={24} md={12}>
          <Card title="Produtividade por Profissional" variant="borderless">
            {loading ? (
              <div style={{ textAlign: 'center', padding: 50 }}>
                <Spin />
              </div>
            ) : (
              <Chart
                type="bar"
                height={300}
                series={barSeries}
                options={{
                  chart: {
                    toolbar: { show: false },
                  },
                  xaxis: {
                    categories: barCategories,
                  },
                  dataLabels: { enabled: false },
                  grid: { strokeDashArray: 3 },
                  colors: ['#5F63F2'],
                }}
              />
            )}
          </Card>
        </Col>
        <Col xs={24} md={12}>
          <Card title="Evolução de Atendimentos" variant="borderless">
            {loading ? (
              <div style={{ textAlign: 'center', padding: 50 }}>
                <Spin />
              </div>
            ) : (
              <Chart
                type="line"
                height={300}
                series={lineSeries}
                options={{
                  chart: {
                    toolbar: { show: false },
                  },
                  xaxis: {
                    categories: lineCategories,
                  },
                  dataLabels: { enabled: false },
                  grid: { strokeDashArray: 3 },
                  colors: ['#FA8B0C', '#20C997'],
                }}
              />
            )}
          </Card>
        </Col>
      </Row>
    </div>
  );
}

export default BiCharts;
