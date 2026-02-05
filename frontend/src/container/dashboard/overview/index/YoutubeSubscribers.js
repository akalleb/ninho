'use client';

import React, { useState, useEffect } from 'react';
import "../../../../config/chart"; // Import Chart.js registration
import { Spin } from 'antd';
import FeatherIcon from 'feather-icons-react';
import { useDispatch, useSelector } from 'react-redux';
import { CardBarChart } from '../../style';
import { Cards } from '../../../../components/cards/frame/cards-frame';
import Heading from '../../../../components/heading/heading';
import { ChartjsBarChartTransparent } from '../../../../components/charts/chartjs';
import { getCustomTooltipConfig } from '../../../../components/utilities/utilities';

import { youtubeSubscribeFilterData, youtubeSubscribeGetData } from '../../../../redux/chartContent/actionCreator';

function YoutubeSubscribers() {
  const dispatch = useDispatch();
  const { youtubeSubscribeState, yuIsLoading } = useSelector(state => {
    return {
      youtubeSubscribeState: state.chartContent.youtubeSubscribeData,
      yuIsLoading: state.chartContent.yuLoading,
    };
  });

  const [state, setState] = useState({
    youtubeSubscribeTabActive: 'year',
  });

  useEffect(() => {
    if (youtubeSubscribeGetData) {
      dispatch(youtubeSubscribeGetData());
    }
  }, [dispatch]);

  const youtubeSubscribeDatasets = youtubeSubscribeState !== null && [
    {
      data: youtubeSubscribeState.gained,
      backgroundColor: '#5F63F280',
      hoverBackgroundColor: '#5F63F2',
      label: 'Gained',
      maxBarThickness: 10,
      barThickness: 12,
    },
    {
      data: youtubeSubscribeState.lost,
      backgroundColor: '#FF4D4F80',
      hoverBackgroundColor: '#FF4D4F',
      label: 'Lost',
      maxBarThickness: 10,
      barThickness: 12,
    },
  ];

  const handleActiveChangeYoutube = value => {
    setState({
      ...state,
      youtubeSubscribeTabActive: value,
    });
    dispatch(youtubeSubscribeFilterData(value));
  };

  return (    
      youtubeSubscribeState !== null && (
        <Cards
          isbutton={
            <div className="card-nav">
              <ul>
                <li className={state.youtubeSubscribeTabActive === 'week' ? 'active' : 'deactivate'}>
                  <span onClick={() => handleActiveChangeYoutube('week')} className="cursor-pointer">
                    Week
                  </span>
                </li>
                <li className={state.youtubeSubscribeTabActive === 'month' ? 'active' : 'deactivate'}>
                  <span onClick={() => handleActiveChangeYoutube('month')} className="cursor-pointer">
                    Month
                  </span>
                </li>
                <li className={state.youtubeSubscribeTabActive === 'year' ? 'active' : 'deactivate'}>
                  <span onClick={() => handleActiveChangeYoutube('year')} className="cursor-pointer">
                    Year
                  </span>
                </li>
              </ul>
            </div>
          }
          title="Youtube Subscribers"
          size="large"
        >
          {yuIsLoading ? (
            <div className="sd-spin">
              <Spin />
            </div>
          ) : (
            <CardBarChart>
              <div
                className="d-flex"
                style={{
                  alignItems: 'center',
                  justifyContent: 'space-between',
                }}
              >
                <div className="card-bar-top">
                  <p>Subscribers</p>
                  <Heading as="h3">
                    {youtubeSubscribeState.Subscribe}
                    <sub>
                      <FeatherIcon icon="arrow-up" size={14} />
                      {youtubeSubscribeState.percent}%
                    </sub>
                  </Heading>
                </div>
                <ul>
                  {youtubeSubscribeDatasets &&
                    youtubeSubscribeDatasets.map((item, key) => {
                      return (
                        <li key={key + 1} className="custom-label">
                          <span
                            style={{
                              backgroundColor: item.hoverBackgroundColor,
                            }}
                          />
                          {item.label}
                        </li>
                      );
                    })}
                </ul>
              </div>

              <ChartjsBarChartTransparent
                labels={youtubeSubscribeState.labels}
                datasets={youtubeSubscribeDatasets}
                options={{
                  maintainAspectRatio: true,
                  responsive: true,
                  layout: {
                    padding: {
                      top: 20,
                    },
                  },
                  plugins: {
                    legend: {
                      display: false,
                    },
                  },
                  
                  legend: {
                    display: false,
                    position: 'top',
                    align: 'end',
                    labels: {
                      boxWidth: 6,
                      display: true,
                      usePointStyle: true,
                    },
                  },
                  tooltip: getCustomTooltipConfig(),
                  scales: {
                    y: {
                      display: true,
                      beginAtZero: true,
                      min: 0,
                      grid: {
                        display: true,
                        color: '#e5e9f2',
                        borderDash: [3, 3],
                        lineWidth: .5,
                      },
                      border: {
                        display: false,
                      },
                      ticks: {
                        font: {
                          size: 12,
                        },
                        color: '#182b49',
                        padding: 10,
                      },
                    },
                    x: {
                      border: {
                        display: false,
                      },
                      grid: {
                        display: false,
                        
                      },
                      ticks: {
                        font: {
                          size: 12,
                        },
                        color: '#182b49',
                        padding: 10,
                      },
                    },
                  },
                }}
              />
            </CardBarChart>
          )}
        </Cards>
      )    
  );
}

export default YoutubeSubscribers;
