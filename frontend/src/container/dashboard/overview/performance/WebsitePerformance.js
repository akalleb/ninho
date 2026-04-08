'use client';
import React, { useState, useEffect } from 'react';
import "../../../../config/chart"; // Import Chart.js registration
import { Spin } from 'antd';
import FeatherIcon from 'feather-icons-react';
import { useDispatch, useSelector } from 'react-redux';
import { PerformanceChartWrapper, Pstates } from '../../style';
import { Cards } from '../../../../components/cards/frame/cards-frame';
import Heading from '../../../../components/heading/heading';
import { ChartjsAreaChart } from '../../../../components/charts/chartjs';
import { chartLinearGradient } from '../../../../components/utilities/utilities';
import { performanceFilterData, performanceGetData, setIsLoading } from '../../../../redux/chartContent/actionCreator';

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

function WebsitePerformance() {
  const dispatch = useDispatch();
  const { performanceState, preIsLoading } = useSelector(state => {
    return {
      performanceState: state.chartContent.performanceData,
      preIsLoading: state.chartContent.perLoading,
    };
  });

  const [state, setState] = useState({
    performance: 'year',
    performanceTab: 'users',
  });

  const { performance, performanceTab } = state;

  useEffect(() => {
    if (performanceGetData) {
      dispatch(performanceGetData());
    }
  }, [dispatch]);

  const handleActiveChangePerformance = value => {
    setState({
      ...state,
      performance: value,
    });
    dispatch(performanceFilterData(value));
  };

  const onPerformanceTab = value => {
    setState({
      ...state,
      performanceTab: value,
    });
    return dispatch(setIsLoading());
  };

  const performanceDatasets = performanceState !== null && [
    {
      data: performanceState[performanceTab][1],
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
    },
    {
      data: performanceState[performanceTab][2],
      borderColor: '#C6D0DC',
      borderWidth: 2,
      fill: false,
      tension: 0.4,
      backgroundColor: '#00173750',
      label: 'Previous period',
      borderDash: [3, 3],
      pointRadius: '0',
      hoverRadius: '0',
    },
  ];

  return (
    <PerformanceChartWrapper>
      {performanceState !== null && (
        <Cards
          isbutton={
            <div className="card-nav">
              <ul>
                <li className={performance === 'week' ? 'active' : 'deactivate'}>
                  <span onClick={() => handleActiveChangePerformance('week')} className="cursor-pointer">
                    Week
                  </span>
                </li>
                <li className={performance === 'month' ? 'active' : 'deactivate'}>
                  <span onClick={() => handleActiveChangePerformance('month')} className="cursor-pointer">
                    Month
                  </span>
                </li>
                <li className={performance === 'year' ? 'active' : 'deactivate'}>
                  <span onClick={() => handleActiveChangePerformance('year')} className="cursor-pointer">
                    Year
                  </span>
                </li>
              </ul>
            </div>
          }
          more={moreContent}
          title="Website Performance"
          size="large"
        >
          <Pstates>
            <div
              onClick={() => onPerformanceTab('users')}
              className={`growth-upward ${performanceTab === 'users' && 'active'}`}
              role="button"
              onKeyPress={() => {}}
              tabIndex="0"
            >
              <p>Users</p>
              <Heading as="h1">
                {performanceState.users[0]}
                <sub>
                  <span>
                    <FeatherIcon icon="arrow-up" size={14} /> 25%
                  </span>
                </sub>
              </Heading>
            </div>
            <div
              onClick={() => onPerformanceTab('sessions')}
              className={`growth-upward ${performanceTab === 'sessions' && 'active'}`}
              role="button"
              onKeyPress={() => {}}
              tabIndex="0"
            >
              <p>Sessions</p>
              <Heading as="h1">
                {performanceState.sessions[0]}
                <sub>
                  <span>
                    <FeatherIcon icon="arrow-up" size={14} /> 47%
                  </span>
                </sub>
              </Heading>
            </div>
            <div
              onClick={() => onPerformanceTab('bounce')}
              className={`growth-downward ${performanceTab === 'bounce' && 'active'}`}
              role="button"
              onKeyPress={() => {}}
              tabIndex="0"
            >
              <p>Bounce Rate</p>
              <Heading as="h1">
                {performanceState.bounce[0]}
                <sub>
                  <span>
                    <FeatherIcon icon="arrow-down" size={14} /> 28%
                  </span>
                </sub>
              </Heading>
            </div>
            <div
              onClick={() => onPerformanceTab('duration')}
              className={`growth-upward ${performanceTab === 'duration' && 'active'}`}
              role="button"
              onKeyPress={() => {}}
              tabIndex="0"
            >
              <p>Session Duration</p>
              <Heading as="h1">
                {performanceState.duration[0]}
                <sub>
                  <span>
                    <FeatherIcon icon="arrow-up" size={14} /> 13%
                  </span>
                </sub>
              </Heading>
            </div>
          </Pstates>
          {preIsLoading ? (
            <div className="sd-spin">
              <Spin />
            </div>
          ) : (
            <div className="performance-lineChart">
              <ChartjsAreaChart
                id="performance"
                labels={performanceState.labels}
                datasets={performanceDatasets}
                options={{
                  maintainAspectRatio: true,
                  elements: {
                    z: 9999,
                  },
                  legend: {
                    display: false,
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
                        max: 80,
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
                height={window.innerWidth <= 575 ? 200 : 86}
              />
              <ul>
                {performanceDatasets &&
                  performanceDatasets.map((item, index) => {
                    return (
                      <li key={index + 1} className="custom-label">
                        <span
                          style={{
                            backgroundColor: item.borderColor,
                          }}
                        />
                        {item.label}
                      </li>
                    );
                  })}
              </ul>
            </div>
          )}
        </Cards>
      )}
    </PerformanceChartWrapper>
  );
}

export default WebsitePerformance;
