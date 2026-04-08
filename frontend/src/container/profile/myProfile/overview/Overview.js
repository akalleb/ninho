'use client';

import React, { useState, useEffect } from 'react';
import { Row, Col, Spin } from 'antd';
import FeatherIcon from 'feather-icons-react';
import { Cards } from '../../../../components/cards/frame/cards-frame';
import { EChartCard } from '../../../dashboard/style';
import api from '../../../../config/api/axios';
import dayjs from 'dayjs';

function Overview() {
  const [stats, setStats] = useState({ total: 0, avgTime: 0 });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchStats() {
      try {
        const { data } = await api.get('/attendances/');
        // Assuming data is an array of attendances
        const total = Array.isArray(data) ? data.length : 0;
        
        // Calculate average time if start/end times are available
        // This is a simple approximation based on available data
        let totalMinutes = 0;
        let count = 0;
        
        if (Array.isArray(data)) {
            data.forEach(att => {
                if (att.created_at && att.finished_at) {
                    const start = dayjs(att.created_at);
                    const end = dayjs(att.finished_at);
                    const diff = end.diff(start, 'minute');
                    if (diff > 0) {
                        totalMinutes += diff;
                        count++;
                    }
                }
            });
        }
        
        const avgTime = count > 0 ? Math.round(totalMinutes / count) : 0;

        setStats({ total, avgTime });
      } catch (e) {
        console.error(e);
      } finally {
        setLoading(false);
      }
    }
    fetchStats();
  }, []);

  return (
    <Row gutter={25}>
      <Col xs={24} md={12}>
        <Cards headless>
          <EChartCard>
            <div className="card-chunk">
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                  <div>
                      <h1 style={{ marginBottom: 0 }}>{loading ? <Spin size="small" /> : stats.total}</h1>
                      <span style={{ fontSize: 14, color: '#868EAE' }}>Total de Atendimentos</span>
                  </div>
                  <div style={{ 
                      width: 48, 
                      height: 48, 
                      borderRadius: 12, 
                      background: 'rgba(95, 99, 242, 0.1)', 
                      display: 'flex', 
                      alignItems: 'center', 
                      justifyContent: 'center',
                      color: '#5F63F2'
                  }}>
                    <FeatherIcon icon="users" size={24} />
                  </div>
              </div>
            </div>
          </EChartCard>
        </Cards>
      </Col>
      <Col xs={24} md={12}>
        <Cards headless>
          <EChartCard>
            <div className="card-chunk">
               <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                  <div>
                      <h1 style={{ marginBottom: 0 }}>{loading ? <Spin size="small" /> : `${stats.avgTime} min`}</h1>
                      <span style={{ fontSize: 14, color: '#868EAE' }}>Tempo Médio de Atendimento</span>
                  </div>
                  <div style={{ 
                      width: 48, 
                      height: 48, 
                      borderRadius: 12, 
                      background: 'rgba(32, 201, 151, 0.1)', 
                      display: 'flex', 
                      alignItems: 'center', 
                      justifyContent: 'center',
                      color: '#20C997'
                  }}>
                    <FeatherIcon icon="clock" size={24} />
                  </div>
              </div>
            </div>
          </EChartCard>
        </Cards>
      </Col>
    </Row>
  );
}

export default Overview;
