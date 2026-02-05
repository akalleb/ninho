'use client';

import React from 'react';
import { Row, Col, Skeleton } from 'antd';
import Styled from 'styled-components';
import { PageHeader } from '../../components/page-headers/page-headers';
import { Cards } from '../../components/cards/frame/cards-frame';
import { Main } from '../styled';
import {
  ChartjsBarChart,
  ChartjsHorizontalChart,
  ChartjsStackedChart,
  ChartjsLineChart,
  ChartjsAreaChart,
  ChartjsBarChartTransparent,
  ChartjsDonutChart,
  ChartjsPieChart,
} from '../../components/charts/chartjs';
import '../../config/chart'; // Import Chart.js registration

const ChartSkeleton = () => (
  <div className="py-20">
    <Skeleton active paragraph={{ rows: 4 }} />
  </div>
);

const CircularChartWrapper = Styled.div`
  canvas {
    max-width: 100%;
    height: auto !important;
    max-height: 300px;
    margin: 0 auto;
    display: block;
  }
`;

function ChartJs() {
  return (
    <>
      <PageHeader title="Chart Js" />
      <Main>
        <Row gutter={25}>
          <Col md={12} xs={24}>
            <Cards title="Bar Chart" size="large">
              
                <ChartjsBarChart className="foo mb-20" />
              
            </Cards>

            <Cards title="Stacked Chart" size="large">
              
                <ChartjsStackedChart />
              
            </Cards>

            <Cards title="Area Chart" size="large">
              
                <ChartjsAreaChart />
              
            </Cards>

            <Cards title="Donut Chart" size="large">
              
                <CircularChartWrapper>
                  <ChartjsDonutChart />
                </CircularChartWrapper>
              
            </Cards>
          </Col>
          <Col md={12} xs={24}>
            <Cards title="Horizontal Chart" size="large">
              
                <ChartjsHorizontalChart />
              
            </Cards>

            <Cards title="Line Chart" size="large">
              
                <ChartjsLineChart />
              
            </Cards>

            <Cards title="Transparent Chart" size="large">
              
                <ChartjsBarChartTransparent />
              
            </Cards>

            <Cards title="Pie Chart" size="large">
              
                <CircularChartWrapper>
                  <ChartjsPieChart />
                </CircularChartWrapper>
              
            </Cards>
          </Col>
        </Row>
      </Main>
    </>
  );
}

export default ChartJs;
