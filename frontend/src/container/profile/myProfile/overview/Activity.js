'use client';

import React from 'react';
import { Row, Col, Skeleton } from 'antd';
import { Cards } from '../../../../components/cards/frame/cards-frame';

// Direct imports - no lazy loading needed
import RightAside from './RightAside';
import ActivityContent from './ActivityContent';

function Activity() {
  return (
    <Row gutter={25}>
      <Col md={16} xs={24}>
        <ActivityContent />
      </Col>
      <Col md={8}>
        <RightAside />
      </Col>
    </Row>
  );
}

export default Activity;
