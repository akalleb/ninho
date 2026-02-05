'use client';

import React from 'react';
import { Row, Col, Skeleton } from 'antd';
import Styled from 'styled-components';
import Chart from 'react-apexcharts';
import { PageHeader } from '../../components/page-headers/page-headers';
import { Cards } from '../../components/cards/frame/cards-frame';
import { Main } from '../styled';

const ChartSkeleton = () => (
  <div className="py-20">
    <Skeleton active paragraph={{ rows: 4 }} />
  </div>
);

const CircularChartWrapper = Styled.div`
  .apexcharts-canvas {
    margin: 0 auto;
  }
`;

function ApexCharts() {
  // Line Chart Configuration
  const lineChartOptions = {
    chart: {
      type: 'line',
      toolbar: {
        show: false,
      },
    },
    stroke: {
      curve: 'smooth',
      width: 3,
    },
    colors: ['#5F63F2', '#20C997', '#FA8B0C'],
    xaxis: {
      categories: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep'],
    },
    dataLabels: {
      enabled: false,
    },
  };

  const lineChartSeries = [
    {
      name: 'Series 1',
      data: [30, 40, 35, 50, 49, 60, 70, 91, 125],
    },
    {
      name: 'Series 2',
      data: [20, 30, 25, 40, 39, 50, 60, 81, 115],
    },
  ];

  // Area Chart Configuration
  const areaChartOptions = {
    chart: {
      type: 'area',
      toolbar: {
        show: false,
      },
    },
    dataLabels: {
      enabled: false,
    },
    stroke: {
      curve: 'smooth',
      width: 2,
    },
    fill: {
      type: 'gradient',
      gradient: {
        shadeIntensity: 1,
        opacityFrom: 0.7,
        opacityTo: 0.3,
      },
    },
    colors: ['#5F63F2', '#20C997'],
    xaxis: {
      categories: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep'],
    },
  };

  const areaChartSeries = [
    {
      name: 'Series 1',
      data: [31, 40, 28, 51, 42, 109, 100, 91, 125],
    },
    {
      name: 'Series 2',
      data: [11, 32, 45, 32, 34, 52, 41, 71, 95],
    },
  ];

  // Bar Chart Configuration
  const barChartOptions = {
    chart: {
      type: 'bar',
      toolbar: {
        show: false,
      },
    },
    plotOptions: {
      bar: {
        horizontal: false,
        columnWidth: '55%',
        borderRadius: 4,
      },
    },
    dataLabels: {
      enabled: false,
    },
    colors: ['#5F63F2', '#20C997', '#FA8B0C'],
    xaxis: {
      categories: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep'],
    },
  };

  const barChartSeries = [
    {
      name: 'Net Profit',
      data: [44, 55, 57, 56, 61, 58, 63, 60, 66],
    },
    {
      name: 'Revenue',
      data: [76, 85, 101, 98, 87, 105, 91, 114, 94],
    },
  ];

  // Horizontal Bar Chart Configuration
  const horizontalBarOptions = {
    chart: {
      type: 'bar',
      toolbar: {
        show: false,
      },
    },
    plotOptions: {
      bar: {
        horizontal: true,
        borderRadius: 4,
      },
    },
    dataLabels: {
      enabled: false,
    },
    colors: ['#5F63F2'],
    xaxis: {
      categories: ['Category A', 'Category B', 'Category C', 'Category D', 'Category E'],
    },
  };

  const horizontalBarSeries = [
    {
      name: 'Series 1',
      data: [44, 55, 41, 67, 22],
    },
  ];

  // Donut Chart Configuration
  const donutChartOptions = {
    chart: {
      type: 'donut',
    },
    labels: ['Team A', 'Team B', 'Team C', 'Team D'],
    colors: ['#5F63F2', '#20C997', '#FA8B0C', '#FF4D4F'],
    legend: {
      position: 'bottom',
    },
    dataLabels: {
      enabled: true,
    },
  };

  const donutChartSeries = [44, 55, 41, 17];

  // Pie Chart Configuration
  const pieChartOptions = {
    chart: {
      type: 'pie',
    },
    labels: ['Product A', 'Product B', 'Product C', 'Product D'],
    colors: ['#5F63F2', '#20C997', '#FA8B0C', '#FF4D4F'],
    legend: {
      position: 'bottom',
    },
  };

  const pieChartSeries = [25, 35, 20, 20];

  // Radial Bar Chart Configuration
  const radialBarOptions = {
    chart: {
      type: 'radialBar',
    },
    plotOptions: {
      radialBar: {
        hollow: {
          size: '70%',
        },
        dataLabels: {
          name: {
            fontSize: '16px',
          },
          value: {
            fontSize: '22px',
          },
        },
      },
    },
    colors: ['#5F63F2'],
    labels: ['Progress'],
  };

  const radialBarSeries = [70];

  // Mixed Chart Configuration
  const mixedChartOptions = {
    chart: {
      type: 'line',
      toolbar: {
        show: false,
      },
    },
    stroke: {
      width: [0, 2, 3],
      curve: 'smooth',
    },
    plotOptions: {
      bar: {
        columnWidth: '50%',
        borderRadius: 4,
      },
    },
    colors: ['#5F63F2', '#20C997', '#FA8B0C'],
    xaxis: {
      categories: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep'],
    },
    dataLabels: {
      enabled: false,
    },
  };

  const mixedChartSeries = [
    {
      name: 'Column',
      type: 'column',
      data: [23, 11, 22, 27, 13, 22, 37, 21, 44],
    },
    {
      name: 'Area',
      type: 'area',
      data: [44, 55, 41, 67, 22, 43, 21, 41, 56],
    },
    {
      name: 'Line',
      type: 'line',
      data: [30, 25, 36, 30, 45, 35, 64, 52, 59],
    },
  ];

  return (
    <>
      <PageHeader title="ApexCharts" />
      <Main>
        <Row gutter={25}>
          <Col md={12} xs={24}>
            <Cards title="Line Chart" size="large">
              
                <Chart options={lineChartOptions} series={lineChartSeries} type="line" height={300} />
              
            </Cards>

            <Cards title="Bar Chart" size="large">
              
                <Chart options={barChartOptions} series={barChartSeries} type="bar" height={300} />
              
            </Cards>

            <Cards title="Area Chart" size="large">
              
                <Chart options={areaChartOptions} series={areaChartSeries} type="area" height={300} />
              
            </Cards>

            <Cards title="Donut Chart" size="large">
              
                <CircularChartWrapper>
                  <Chart options={donutChartOptions} series={donutChartSeries} type="donut" height={350} />
                </CircularChartWrapper>
              
            </Cards>
          </Col>
          <Col md={12} xs={24}>
            <Cards title="Horizontal Bar Chart" size="large">
              
                <Chart options={horizontalBarOptions} series={horizontalBarSeries} type="bar" height={300} />
              
            </Cards>

            <Cards title="Pie Chart" size="large">
              
                <CircularChartWrapper>
                  <Chart options={pieChartOptions} series={pieChartSeries} type="pie" height={350} />
                </CircularChartWrapper>
              
            </Cards>

            <Cards title="Radial Bar" size="large">
              
                <CircularChartWrapper>
                  <Chart options={radialBarOptions} series={radialBarSeries} type="radialBar" height={350} />
                </CircularChartWrapper>
              
            </Cards>

            <Cards title="Mixed Chart" size="large">
              
                <Chart options={mixedChartOptions} series={mixedChartSeries} type="line" height={300} />
              
            </Cards>
          </Col>
        </Row>
      </Main>
    </>
  );
}

export default ApexCharts;

