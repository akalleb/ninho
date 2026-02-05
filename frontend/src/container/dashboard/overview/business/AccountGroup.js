'use client';

import React, { useState, useEffect } from 'react';
import "../../../../config/chart"; // Import Chart.js registration
import { Col } from 'antd';
import FeatherIcon from 'feather-icons-react';
import { Cards } from '../../../../components/cards/frame/cards-frame';
import { ChartjsLineChart } from '../../../../components/charts/chartjs';
import { getCustomTooltipConfig } from '../../../../components/utilities/utilities';

function AccountGroup() {
  const [windowWidth, setWindowWidth] = useState(1024);

  useEffect(() => {
    // Set initial width
    if (typeof window !== 'undefined') {
      setWindowWidth(window.innerWidth);
      
      // Handle window resize
      const handleResize = () => {
        setWindowWidth(window.innerWidth);
      };
      
      window.addEventListener('resize', handleResize);
      return () => window.removeEventListener('resize', handleResize);
    }
  }, []);

  const chartHeight = windowWidth <= 575 ? 230 : 100;
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

  return (
    <>
      <Col lg={12} md={12} sm={24} xs={24}>
        <div className="account-card">
          <Cards title="Account Receivable" more={moreContent}>
            <ChartjsLineChart
              labels={['Current', '1-30', '30-60', '60-90', '91+']}
              datasets={[
                {
                  label: 'Account Receivable',
                  data: [105, 145, 95, 149, 90],
                  borderColor: '#FA8B0C',
                  borderWidth: 3,
                  fill: false,
                  tension: 0.4,
                  pointBackgroundColor: '#FA8B0C',
                  pointBorderColor: '#fff',
                  pointHoverBorderColor: '#fff',
                  pointBorderWidth: 2,
                  pointHoverBorderWidth: 3,
                  pointHoverRadius: 5,
                  z: 5,
                },
              ]}
              height={chartHeight}
              options={{
                plugins: {
                  legend: {
                    display: false,
                  },
                  tooltip: getCustomTooltipConfig(),
                },
                elements: {
                  point: {
                    radius: 5,
                    z: 5,
                  },
                },
                scales: {
                  y: {
                    border: {
                      display: false,
                    },
                    grid: {
                      color: '#e5e9f2',
                      borderDash: [3, 3],
                      lineWidth: 1,
                    },
                    ticks: {
                      beginAtZero: true,
                      font: {
                        size: 13,
                      },
                      color: '#182b49',
                      max: 200,
                      stepSize: 50,
                      padding: 10,
                      callback(label) {
                        return `${label}k`;
                      },
                    },
                  },
                  x: {
                    border: {
                      display: false,
                    },
                    grid: {
                      display: true,
                      lineWidth: 2,
                      color: 'transparent',
                    },
                  },
                },
              }}
            />
          </Cards>
        </div>
      </Col>
      <Col lg={12} md={12} sm={24} xs={24}>
        <div className="account-card">
          <Cards title="Account Payable" more={moreContent}>
            <ChartjsLineChart
              labels={['Current', '1-30', '30-60', '60-90', '91+']}
              datasets={[
                {
                  label: 'Account Payable',
                  data: [80, 160, 105, 140, 107],
                  borderColor: '#2C99FF',
                  borderWidth: 3,
                  fill: false,
                  tension: 0.4,
                  pointBackgroundColor: '#2C99FF',
                  pointBorderColor: '#fff',
                  pointHoverBorderColor: '#fff',
                  pointBorderWidth: 2,
                  pointHoverBorderWidth: 3,
                  pointHoverRadius: 5,
                  z: 5,
                },
              ]}
              height={chartHeight}
              options={{
                plugins: {
                  legend: {
                    display: false,
                  },
                  tooltip: getCustomTooltipConfig(),
                },
                elements: {
                  point: {
                    radius: 5,
                    z: 5,
                  },
                },
                scales: {
                  y: {
                    border: {
                      display: false,
                    },
                    grid: {
                      color: '#e5e9f2',
                      borderDash: [3, 3],
                      lineWidth: 1,
                    },
                    ticks: {
                      beginAtZero: true,
                      font: {
                        size: 13,
                      },
                      color: '#182b49',
                      max: 200,
                      stepSize: 50,
                      padding: 10,
                      callback(label) {
                        return `${label}k`;
                      },
                    },
                  },
                  x: {
                    border: {
                      display: false,
                    },
                    grid: {
                      display: true,
                      lineWidth: 2,
                      color: 'transparent',
                    },
                  },
                },
              }}
            />
          </Cards>
        </div>
      </Col>
    </>
  );
}

export default AccountGroup;
