'use client';

import React from 'react';
import { Row, Col, Skeleton } from 'antd';
import FeatherIcon from 'feather-icons-react';
import { PageHeader } from '../../components/page-headers/page-headers';
import { Cards } from '../../components/cards/frame/cards-frame';
import { Button } from '../../components/buttons/buttons';
import { Main } from '../styled';
import { ShareButtonPageHeader } from '../../components/buttons/share-button/share-button';
import { ExportButtonPageHeader } from '../../components/buttons/export-button/export-button';
import { CalendarButtonPageHeader } from '../../components/buttons/calendar-button/calendar-button';

// Direct imports - no lazy loading needed since route already uses dynamic()
import SocialMediaOverview from './overview/index/SocialMediaOverview';
import FacebookOverview from './overview/index/FacebookOverview';
import YoutubeSubscribers from './overview/index/YoutubeSubscribers';
import TwitterOverview from './overview/index/TwitterOverview';
import InstagramOverview from './overview/index/InstagramOverview';
import LinkedinKeyMetrics from './overview/index/LinkedinKeyMetrics';
import SocialTrafficMetrics from './overview/index/SocialTrafficMetrics';

function Dashboard() {
  return (
    <>
      <PageHeader
        ghost
        title="Social Media Dashboard"
        buttons={[
          <div key="6" className="page-header-actions">
            <CalendarButtonPageHeader key="1" />
            <ExportButtonPageHeader key="2" />
            <ShareButtonPageHeader key="3" />
            <Button size="small" key="4" type="primary">
              <FeatherIcon icon="plus" size={14} />
              Add New
            </Button>
          </div>,
        ]}
      />
      <Main>        
        <Row justify="center" gutter={25}>
          <Col xxl={8} lg={24} xs={24}>
            <SocialMediaOverview />
          </Col>

          <Col xxl={16} xs={24}>
            <FacebookOverview />
          </Col>

          <Col xxl={8} xs={24}>
            <YoutubeSubscribers />
          </Col>
          <Col xxl={8} md={8} xs={24}>
            <TwitterOverview />
          </Col>
          <Col xxl={8} md={8} xs={24}>
            <InstagramOverview />
          </Col>
          <Col xxl={8} md={8} xs={24}>
            <LinkedinKeyMetrics />
          </Col>
          <Col xxl={16} xs={24}>
            <SocialTrafficMetrics />
          </Col>
        </Row>
      </Main>
    </>
  );
}

export default Dashboard;
