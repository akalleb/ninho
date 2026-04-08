'use client';

import React from 'react';
import { Row, Col, Skeleton } from 'antd';
import FeatherIcon from 'feather-icons-react';
import { PageHeader } from '../../components/page-headers/page-headers';
import { Cards } from '../../components/cards/frame/cards-frame';
import { Main } from '../styled';
import { Button } from '../../components/buttons/buttons';
import { ShareButtonPageHeader } from '../../components/buttons/share-button/share-button';
import { ExportButtonPageHeader } from '../../components/buttons/export-button/export-button';
import { CalendarButtonPageHeader } from '../../components/buttons/calendar-button/calendar-button';

// Direct imports - no lazy loading needed since route already uses dynamic()
import CardGroup from './overview/business/CardGroup';
import CashFlow from './overview/business/CashFlow';
import IncomeAndExpenses from './overview/business/IncomeAndExpenses';
import AccountGroup from './overview/business/AccountGroup';

function Business() {
  return (
    <>
      <PageHeader
        ghost
        title="Finance Dashboard"
        buttons={[
          <div key="1" className="page-header-actions">
            <CalendarButtonPageHeader />
            <ExportButtonPageHeader />
            <ShareButtonPageHeader />
            <Button size="small" type="primary">
              <FeatherIcon icon="plus" size={14} />
              Add New
            </Button>
          </div>,
        ]}
      />
      <Main>
        <Row gutter={25}>
          <Col xxl={12} xs={24}>
            <CardGroup />
          </Col>
          <Col xxl={12} xs={24}>
            <CashFlow />
          </Col>
          <Col md={24}>
            <IncomeAndExpenses />
          </Col>
          <AccountGroup />
        </Row>
      </Main>
    </>
  );
}

export default Business;
