import React, { useState } from 'react';
import { Row, Col, Button, Card, Alert } from 'antd';
import { PageHeader } from '../../components/page-headers/page-headers';
import { CalendarButtonPageHeader } from '../../components/buttons/calendar-button/calendar-button';
import { Main } from '../styled';
import api from '../../config/api/axios';

function NinhoPlayground() {
  const [apiStatus, setApiStatus] = useState(null);
  const [loading, setLoading] = useState(false);

  const testConnection = async () => {
    setLoading(true);
    setApiStatus(null);
    try {
      const response = await api.get('/');
      console.log('API Response:', response.data);
      setApiStatus({ type: 'success', message: 'Conexão com API estabelecida!', description: JSON.stringify(response.data) });
    } catch (error) {
      console.error('API Error:', error);
      setApiStatus({ type: 'error', message: 'Falha na conexão', description: error.message });
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <PageHeader
        ghost
        title="Sistema Ninho - PluckStudio"
        buttons={[
          <div key="1" className="page-header-actions">
            <CalendarButtonPageHeader />
          </div>,
        ]}
      />
      <Main>
        <Row gutter={25}>
          <Col xs={24}>
            <Card title="Playground de Testes">
              <div style={{ textAlign: 'center', padding: '20px' }}>
                <Button type="primary" size="large" onClick={testConnection} loading={loading}>
                  Testar Conexão com API
                </Button>
                
                {apiStatus && (
                  <div style={{ marginTop: '20px', textAlign: 'left' }}>
                    <Alert
                      message={apiStatus.message}
                      description={apiStatus.description}
                      type={apiStatus.type}
                      showIcon
                    />
                  </div>
                )}
              </div>
            </Card>
          </Col>
        </Row>
      </Main>
    </>
  );
}

export default NinhoPlayground;
