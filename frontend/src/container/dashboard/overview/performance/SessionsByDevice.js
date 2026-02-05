'use client';
import React, { useState, useEffect } from 'react';
import "../../../../config/chart"; // Import Chart.js registration
import { Spin } from 'antd';

import { useDispatch, useSelector } from 'react-redux';
import { SessionChartWrapper, SessionState } from '../../style';
import { Cards } from '../../../../components/cards/frame/cards-frame';
import { ChartjsDonutChart } from '../../../../components/charts/chartjs';

import { deviceFilterData, deviceGetData } from '../../../../redux/chartContent/actionCreator';

function SessionsByDevice() {
  const dispatch = useDispatch();
  const { deviceState, dvIsLoading } = useSelector(state => {
    return {
      deviceState: state.chartContent.deviceData,
      dvIsLoading: state.chartContent.dvLoading,
    };
  });

  const [state, setState] = useState({
    device: 'year',
  });

  useEffect(() => {
    if (deviceGetData) {
      dispatch(deviceGetData());
    }
  }, [dispatch]);

  const handleActiveChangeDevice = value => {
    setState({
      ...state,
      device: value,
    });
    dispatch(deviceFilterData(value));
  };

  return (
    <SessionChartWrapper>
      {deviceState !== null && (
        <Cards
          isbutton={
            <div className="card-nav">
              <ul>
                <li className={state.device === 'week' ? 'active' : 'deactivate'}>
                  <span onClick={() => handleActiveChangeDevice('week')} className="cursor-pointer">
                    Week
                  </span>
                </li>
                <li className={state.device === 'month' ? 'active' : 'deactivate'}>
                  <span onClick={() => handleActiveChangeDevice('month')} className="cursor-pointer">
                    Month
                  </span>
                </li>
                <li className={state.device === 'year' ? 'active' : 'deactivate'}>
                  <span onClick={() => handleActiveChangeDevice('year')} className="cursor-pointer">
                    Year
                  </span>
                </li>
              </ul>
            </div>
          }
          title="Sessions By Device"
          size="large"
        >
          {dvIsLoading ? (
            <div className="sd-spin">
              <Spin />
            </div>
          ) : (
            <div className="session-chart-inner">
              <ChartjsDonutChart
                labels={['Desktop', 'Mobiles', 'Tablets']}
                height={300}
                datasets={[
                  {
                    data: deviceState,
                    backgroundColor: ['#20C997', '#5F63F2', '#FA8B0C'],
                    total: deviceState.reduce((a, b) => a + b, 0).toLocaleString(),
                  },
                ]}
              />

              <SessionState className="session-wrap d-flex justify-content-center">
                <div className="session-single">
                  <div className="chart-label">
                    <span className="label-dot dot-success" />
                    Desktop
                  </div>
                  <span>{deviceState[0]}</span>
                  <sub>24%</sub>
                </div>
                <div className="session-single">
                  <div className="chart-label">
                    <span className="label-dot dot-info" />
                    Mobile
                  </div>
                  <span>{deviceState[1]}</span>
                  <sub>36%</sub>
                </div>
                <div className="session-single">
                  <div className="chart-label">
                    <span className="label-dot dot-warning" />
                    Tablets
                  </div>
                  <span>{deviceState[2]}</span>
                  <sub>40%</sub>
                </div>
              </SessionState>
            </div>
          )}
        </Cards>
      )}
    </SessionChartWrapper>
  );
}

export default SessionsByDevice;
