import { Col, Row } from 'antd';
import "../../../../config/chart"; // Import Chart.js registration
import React from 'react';
import FeatherIcon from 'feather-icons-react';
import { SalesGrowthWrap } from '../../style';
import { Cards } from '../../../../components/cards/frame/cards-frame';
import { ChartjsBarChartTransparent } from '../../../../components/charts/chartjs';
import { getCustomTooltipConfig } from '../../../../components/utilities/utilities';

const moreContent = (
  <>
    <a href="#">
      <FeatherIcon size={16} icon="printer" />
      <span>Printer</span>
    </a>
    <a href="#">
      <FeatherIcon size={16} icon="book-open" />
      <span>PDF</span>
    </a>
    <a href="#">
      <FeatherIcon size={16} icon="file-text" />
      <span>Google Sheets</span>
    </a>
    <a href="#">
      <FeatherIcon size={16} icon="x" />
      <span>Excel (XLSX)</span>
    </a>
    <a href="#">
      <FeatherIcon size={16} icon="file" />
      <span>CSV</span>
    </a>
  </>
);

const chartOptions = {
  responsive: true,
  maintainAspectRatio: true,
  plugins: {
    legend: {
      display: false,
      labels: {
        display: false,
      },
    },
    tooltip: getCustomTooltipConfig(),
  },
  scales: {
    y: {
      stacked: true,
      border: {
        display: false,
      },
      grid: {
        display: false,
      },
      ticks: {
        display: false,
      },
    },
    x: {
      stacked: true,
      border: {
        display: false,
      },
      grid: {
        display: false,
      },
      ticks: {
        display: true,
      },
    },
  },
};

const SalesGrowth = () => {
  return (
    <SalesGrowthWrap>
      <Cards more={moreContent} title="Monthly Sales Growth">
        <Row>
          <Col xs={24}>
            <div className="growth-list d-flex justify-content-between">
              <div className="growth-list__item">
                <h2>70%</h2>
                <p>Progress</p>
              </div>
              <div className="growth-list__item">
                <h2>20%</h2>
                <p>Target</p>
              </div>
            </div>
            <div className="growth-chart-wrap">
              <ChartjsBarChartTransparent
                labels={['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec']}
                datasets={[
                  {
                    data: [20, 60, 50, 45, 50, 60, 70, 60, 65, 75, 70, 80],
                    backgroundColor: '#5F63F250',
                    hoverBackgroundColor: '#5F63F2',
                    maxBarThickness: 10,
                    barThickness: 12,
                    label: 'Orders',
                    barPercentage: 1,
                  },
                ]}
                options={chartOptions}
                height={180}
              />
            </div>
          </Col>
        </Row>
      </Cards>
    </SalesGrowthWrap>
  );
};

export default SalesGrowth;
