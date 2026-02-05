'use client';

import React from 'react';
import { Row, Col, Card } from 'antd';
import { PageHeader } from '../../src/components/page-headers/page-headers';
import { CalendarButtonPageHeader } from '../../src/components/buttons/calendar-button/calendar-button';
import { Main } from '../../src/container/styled';
import withAdminLayoutNext from '../../src/layout/withAdminLayoutNext';

function CuidadosStartPage() {
  return (
    <>
      <PageHeader
        ghost
        title="Área de Cuidados"
        subTitle="Ambiente inicial para profissionais de saúde. Em breve você terá aqui seus atalhos, agenda e atendimentos."
        buttons={[
          <div key="1" className="page-header-actions">
            <CalendarButtonPageHeader />
          </div>,
        ]}
      />
      <Main>
        <Row gutter={25}>
          <Col xs={24} lg={12}>
            <Card title="Bem-vindo à Área de Cuidados">
              <p>
                Aqui você poderá acessar suas filas de espera, agenda, prontuários e outras
                funcionalidades específicas para profissionais de saúde.
              </p>
            </Card>
          </Col>
        </Row>
      </Main>
    </>
  );
}

export default withAdminLayoutNext(CuidadosStartPage);
