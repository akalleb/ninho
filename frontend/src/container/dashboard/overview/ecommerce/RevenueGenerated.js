'use client';
/* eslint-disable camelcase */
import "../../../../config/chart"; // Import Chart.js registration
import React, { useState, useEffect } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import FeatherIcon from 'feather-icons-react';
import { Table } from 'antd';
import { RevenueTableWrapper } from '../../style';
import { ChartjsLineChart } from '../../../../components/charts/chartjs';
import { getCustomTooltipConfig } from '../../../../components/utilities/utilities';
import { generatedFilterData, generatedGetData } from '../../../../redux/chartContent/actionCreator';
import { Cards } from '../../../../components/cards/frame/cards-frame';

function RevenueGenerated() {
  const dispatch = useDispatch();
  const { generatedState } = useSelector(state => {
    return {
      generatedState: state.chartContent.generatedData,
    };
  });
  const [state, setState] = useState({
    generated: 'year',
  });
  useEffect(() => {
    if (generatedGetData) {
      dispatch(generatedGetData());
    }
  }, [dispatch]);

  const handleActiveChangeGenerated = value => {
    setState({
      ...state,
      generated: value,
    });
    dispatch(generatedFilterData(value));
  };

  const revenueColumns = [
    {
      title: 'Name of Source',
      dataIndex: 'name',
      key: 'name',
    },
    {
      title: 'Visitors',
      dataIndex: 'visitors',
      key: 'visitors',
    },
    {
      title: 'Page View',
      dataIndex: 'page_View',
      key: 'page_View',
    },
    {
      title: 'Revenue',
      dataIndex: 'revenue',
      key: 'revenue',
    },
    {
      title: 'Trend',
      dataIndex: 'trend',
      key: 'trend',
      width: 120,
    },
  ];

  const revenueData = [];
  if (generatedState !== null)
    generatedState.map(value => {
      const { key, name, visitors, page_View, revenue, trend } = value;

      return revenueData.push({
        key,
        name,
        visitors,
        page_View,
        revenue,
        trend: (
          <ChartjsLineChart
            labels={['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun']}
            datasets={[
              {
                data: trend.data,
                borderColor: trend.borderColor,
                borderWidth: 2,
                fill: false,
                tension: 0.4,
              },
            ]}
            height={30}
            width={120}
            options={{
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
                  barPercentage: 1,
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
              },
              elements: {
                point: {
                  radius: 0,
                },
              },
            }}
          />
        ),
      });
    });

  return (
    <RevenueTableWrapper>
      <div className="full-width-table">
        <Cards
          isbutton={
            <div className="card-nav">
              <ul>
                <li className={state.generated === 'week' ? 'active' : 'deactivate'}>
                  <span onClick={() => handleActiveChangeGenerated('week')} className="cursor-pointer">
                    Week
                  </span>
                </li>
                <li className={state.generated === 'month' ? 'active' : 'deactivate'}>
                  <span onClick={() => handleActiveChangeGenerated('month')} className="cursor-pointer">
                    Month
                  </span>
                </li>
                <li className={state.generated === 'year' ? 'active' : 'deactivate'}>
                  <span onClick={() => handleActiveChangeGenerated('year')} className="cursor-pointer">
                    Year
                  </span>
                </li>
              </ul>
            </div>
          }
          more={
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
          }
          title="Source Of Revenue Generated"
          size="large"
        >
          <div className="table-bordered revenue-table table-responsive">
            <Table columns={revenueColumns} dataSource={revenueData} pagination={false} />
          </div>
        </Cards>
      </div>
    </RevenueTableWrapper>
  );
}

export default RevenueGenerated;
