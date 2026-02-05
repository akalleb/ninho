'use client';
import React, { useState, useEffect } from 'react';
import "../../../../config/chart"; // Import Chart.js registration
import { useSelector, useDispatch } from 'react-redux';
import FeatherIcon from 'feather-icons-react';
import { Spin } from 'antd';
import PropTypes from 'prop-types';
import { RevenueWrapper } from '../../style';
import { ChartjsAreaChart } from '../../../../components/charts/chartjs';
import { chartLinearGradient, getCustomTooltipConfig } from '../../../../components/utilities/utilities';
import { performanceFilterData, performanceGetData } from '../../../../redux/chartContent/actionCreator';
import { Cards } from '../../../../components/cards/frame/cards-frame';

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
function TotalRevenue({ title = 'Total Revenue' }) {
  const dispatch = useDispatch();
  const { performanceState, preIsLoading } = useSelector(state => {
    return {
      performanceState: state.chartContent.performanceData,
      preIsLoading: state.chartContent.perLoading,
    };
  });

  const [state, setState] = useState({
    revenue: 'year',
  });

  useEffect(() => {
    if (performanceGetData) {
      dispatch(performanceGetData());
    }
  }, [dispatch]);

  const handleActiveChangeRevenue = value => {
    setState({
      ...state,
      revenue: value,
    });
    return dispatch(performanceFilterData(value));
  };

  const performanceDatasets = performanceState !== null && [
    {
      data: performanceState.users[1],
      borderColor: '#5F63F2',
      borderWidth: 4,
      fill: true,
      tension: 0.4,
      backgroundColor: () =>
        chartLinearGradient(document.getElementById('performance'), 300, {
          start: '#5F63F230',
          end: '#ffffff05',
        }),
      label: 'Current period',
      pointStyle: 'circle',
      pointRadius: '0',
      hoverRadius: '9',
      pointBorderColor: '#fff',
      pointBackgroundColor: '#5F63F2',
      hoverBorderWidth: 5,
      amount: '$7,596',
      amountClass: 'current-amount',
    },
    {
      data: performanceState.users[2],
      borderColor: '#C6D0DC',
      borderWidth: 2,
      fill: false,
      tension: 0.4,
      backgroundColor: '#00173750',
      label: 'Previous period',
      borderDash: [3, 3],
      pointRadius: '0',
      hoverRadius: '0',
      amount: '$3,258',
      amountClass: 'prev-amount',
    },
  ];

  return (
    <RevenueWrapper>
      {performanceState !== null && (
        <Cards
          isbutton={
            <div className="card-nav">
              <ul>
                <li className={state.revenue === 'week' ? 'active' : 'deactivate'}>
                  <span onClick={() => handleActiveChangeRevenue('week')} className="cursor-pointer">
                    Week
                  </span>
                </li>
                <li className={state.revenue === 'month' ? 'active' : 'deactivate'}>
                  <span onClick={() => handleActiveChangeRevenue('month')} className="cursor-pointer">
                    Month
                  </span>
                </li>
                <li className={state.revenue === 'year' ? 'active' : 'deactivate'}>
                  <span onClick={() => handleActiveChangeRevenue('year')} className="cursor-pointer">
                    Year
                  </span>
                </li>
              </ul>
            </div>
          }
          more={moreContent}
          title={title}
          size="large"
        >
          {preIsLoading ? (
            <div className="sd-spin">
              <Spin />
            </div>
          ) : (
            <div className="performance-lineChart">
              <ul>
                {performanceDatasets &&
                  performanceDatasets.map((item, key) => {
                    return (
                      <li key={key + 1} className="custom-label">
                        <strong className={item.amountClass}>{item.amount}</strong>
                        <div>
                          <span
                            style={{
                              backgroundColor: item.borderColor,
                            }}
                          />
                          {item.label}
                        </div>
                      </li>
                    );
                  })}
              </ul>

              <ChartjsAreaChart
                id="performance"
                labels={performanceState.labels}
                datasets={performanceDatasets}
                options={{
                  maintainAspectRatio: true,
                  elements: {
                    z: 9999,
                  },
                  plugins: {
                    legend: {
                      display: false,
                      position: 'bottom',
                      align: 'start',
                      labels: {
                        boxWidth: 6,
                        display: false,
                        usePointStyle: true,
                      },
                    },
                    tooltip: getCustomTooltipConfig(),
                  },
                  hover: {
                    mode: 'index',
                    intersect: false,
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
                        suggestedMin: 50,
                        suggestedMax: 80,
                        stepSize: 20,
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
                      ticks: {
                        padding: 10,
                      },
                    },
                  },
                }}
                height={window.innerWidth <= 575 ? 200 : 82}
              />
            </div>
          )}
        </Cards>
      )}
    </RevenueWrapper>
  );
}

TotalRevenue.propTypes = {
  title: PropTypes.string,
};

export default TotalRevenue;
