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
import DailyOverview from './overview/performance/DailyOverview';
import WebsitePerformance from './overview/performance/WebsitePerformance';
import TrafficChannel from './overview/performance/TrafficChannel';
import SessionsByDevice from './overview/performance/SessionsByDevice';
import TopLandingPages from './overview/performance/TopLandingPages';
import SessionsbyRegion from './overview/performance/SessionsbyRegion';

function Performance() {
  return (
    <>
      <PageHeader
        ghost
        title="Website Performance Dashboard"
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
        <Row justify="center" gutter={25}>
          <Col xxl={8} xl={10} lg={12} xs={24}>
            <DailyOverview />
          </Col>
          <Col xxl={16} xl={14} lg={12} xs={24}>
            <WebsitePerformance />
          </Col>
          <Col xxl={16} xs={24}>
            <TrafficChannel />
          </Col>
          <Col xxl={8} xl={8} md={12} xs={24}>
            <SessionsByDevice />
          </Col>
          <Col xxl={12} xl={16} md={12} xs={24}>
            <TopLandingPages />
          </Col>
          <Col xxl={12} xs={24}>
            <SessionsbyRegion />
          </Col>
        </Row>
      </Main>
    </>
  );
}

export default Performance;
