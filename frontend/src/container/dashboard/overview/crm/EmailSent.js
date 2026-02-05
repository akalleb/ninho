'use client';
import React, { useState, useEffect } from 'react';
import "../../../../config/chart"; // Import Chart.js registration
import { useSelector, useDispatch } from 'react-redux';
import { Spin } from 'antd';
import { SentEmailWrapper } from '../../style';
import { ChartjsDonut } from '../../../../components/charts/chartjs';
import { deviceGetData, deviceFilterData } from '../../../../redux/chartContent/actionCreator';
import { Cards } from '../../../../components/cards/frame/cards-frame';
import { getImageUrl } from '../../../../utility/getImageUrl';

function EmailSent() {
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

  const labels = ['Total Sent', 'Opened', 'Not Opened'];
  const icons = ['Sent', 'Opened', 'NotOpen'];
  const types = ['success', 'primary', 'warning'];
  // Map icon names to image paths
  const iconImages = {
    Sent: getImageUrl('static/img/icon/Sent.svg'),
    Opened: getImageUrl('static/img/icon/Opened.svg'),
    NotOpen: getImageUrl('static/img/icon/NotOpen.svg'),
  };
  const datasets = [
    {
      data: deviceState,
      backgroundColor: ['#20C997', '#5F63F2', '#FA8B0C'],
    },
  ];

  const options = {
    plugins: {
      legend: {
        display: false,
      },
    },
  };

  return (
    <SentEmailWrapper>
      {deviceState !== null && (
        <Cards
          isbutton={
            <div className="card-nav">
              <ul>
                <li className={state.device === 'today' ? 'active' : 'deactivate'}>
                  <span onClick={() => handleActiveChangeDevice('today')} className="cursor-pointer">
                    Today
                  </span>
                </li>
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
          title="Email Sent"
          size="large"
        >
          {dvIsLoading ? (
            <div className="sd-spin">
              <Spin />
            </div>
          ) : (
            <div className="sent-emial-chart">
              <ChartjsDonut options={options} labels={datasets} datasets={datasets} height={180} />

              <div className="sent-emial-data">
                {datasets.map((item, key) => {
                  const { data } = item;
                  return (
                    <div className="sent-emial-box align-center-v" key={key + 1}>
                      {data.map((value, index) => {
                        const iconSrc = iconImages[icons[index]];
                        return (
                          <div className="sent-emial-item" key={value}>
                            <div className={`sent-emial-icon icon-${types[index]}`}>
                              {iconSrc && <img src={iconSrc} alt={labels[index] || ''} />}
                            </div>
                            <div className="sent-emial-content">
                              <h4>
                                <strong>{value}</strong>
                              </h4>
                              <p>{labels[index]}</p>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  );
                })}
              </div>
            </div>
          )}
        </Cards>
      )}
    </SentEmailWrapper>
  );
}

export default EmailSent;
