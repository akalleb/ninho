'use client';

import React, { useState, useEffect } from 'react';
import "../../../../config/chart"; // Import Chart.js registration
import { Row, Col, Spin } from 'antd';
import FeatherIcon from 'feather-icons-react';
import { useDispatch, useSelector } from 'react-redux';
import { ExList, IncomeExpenseWrapper } from '../../style';
import { Cards } from '../../../../components/cards/frame/cards-frame';
import Heading from '../../../../components/heading/heading';
import { ChartjsBarChartTransparent } from '../../../../components/charts/chartjs';
import { getCustomTooltipConfig } from '../../../../components/utilities/utilities';
import { incomeGetData, incomeFilterData } from '../../../../redux/chartContent/actionCreator';

function IncomeAndExpenses() {
  const dispatch = useDispatch();
  const { incomeState, isIcLoading } = useSelector(state => {
    return {
      incomeState: state.chartContent.incomeData,
      isIcLoading: state.chartContent.icLoading,
    };
  });
  const [state, setState] = useState({
    incomeFlowActive: 'year',
  });

  useEffect(() => {
    if (incomeGetData) {
      dispatch(incomeGetData());
    }
  }, [dispatch]);

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

  const handleActiveChangeIncome = value => {
    setState({
      ...state,
      incomeFlowActive: value,
    });
    dispatch(incomeFilterData(value));
  };

  const incomeDataset = incomeState !== null && [
    {
      data: incomeState.total[1],
      backgroundColor: '#5F63F250',
      hoverBackgroundColor: '#5F63F2',
      label: 'Total Income',
      barPercentage: 0.6,
    },
    {
      data: incomeState.sale[1],
      backgroundColor: '#FF69A550',
      hoverBackgroundColor: '#FF69A5',
      label: 'Cost of goods sold',
      barPercentage: 0.6,
    },
    {
      data: incomeState.expense[1],
      backgroundColor: '#FA8B0C40',
      hoverBackgroundColor: '#FA8B0C',
      label: 'Total expenses',
      barPercentage: 0.6,
    },
    {
      data: incomeState.profit[1],
      backgroundColor: '#20C99740',
      hoverBackgroundColor: '#20C997',
      label: 'Net profit',
      barPercentage: 0.6,
    },
  ];
  return (
    <IncomeExpenseWrapper>
      {incomeState !== null && (
        <Cards
          isbutton={
            <div className="card-nav">
              <ul>
                <li className={state.incomeFlowActive === 'week' ? 'active' : 'regular'}>
                  <span onClick={() => handleActiveChangeIncome('week')} className="cursor-pointer">
                    Week
                  </span>
                </li>
                <li className={state.incomeFlowActive === 'month' ? 'active' : 'regular'}>
                  <span onClick={() => handleActiveChangeIncome('month')} className="cursor-pointer">
                    Month
                  </span>
                </li>
                <li className={state.incomeFlowActive === 'year' ? 'active' : 'regular'}>
                  <span onClick={() => handleActiveChangeIncome('year')} className="cursor-pointer">
                    Year
                  </span>
                </li>
              </ul>
            </div>
          }
          title={
            <div>
              Income And Expenses <span>Nov 23, 2019 - Nov 29, 2019</span>
            </div>
          }
          size="large"
          more={moreContent}
        >
          {isIcLoading ? (
            <div className="sd-spin">
              <Spin />
            </div>
          ) : (
            <Row gutter="25">
              <Col xxl={6} sm={24}>
                <ExList>
                  <div>
                    <p>Total income</p>
                    <Heading as="h1">
                      <span>${incomeState.total[0]}</span>
                      <sub>
                        <span>
                          <FeatherIcon icon="arrow-up" /> 37%
                        </span>
                        Since last month
                      </sub>
                    </Heading>
                  </div>
                  <div>
                    <p>Total expenses</p>
                    <Heading as="h1">
                      <span>${incomeState.sale[0]}</span>
                      <sub className="growth-downward">
                        <span>
                          <FeatherIcon icon="arrow-down" /> 25%
                        </span>
                        Since last month
                      </sub>
                    </Heading>
                  </div>
                  <div>
                    <p>Cost of goods sold</p>
                    <Heading as="h1">
                      <span>${incomeState.expense[0]}</span>
                      <sub>
                        <span>
                          <FeatherIcon icon="arrow-up" /> 25%
                        </span>
                        Since last month
                      </sub>
                    </Heading>
                  </div>
                  <div>
                    <p>Net profit</p>
                    <Heading as="h1">
                      <span>${incomeState.profit[0]}</span>
                      <sub>
                        <span>
                          <FeatherIcon icon="arrow-up" /> 25%
                        </span>
                        Since last month
                      </sub>
                    </Heading>
                  </div>
                </ExList>
              </Col>
              <Col xxl={18} xs={24}>
                <ChartjsBarChartTransparent
                  labels={incomeState.labels}
                  datasets={incomeDataset}
                  height={88}
                  options={{
                    maintainAspectRatio: true,
                    responsive: true,
                    plugins: {
                      legend: {
                        display: false,
                        position: 'bottom',
                        labels: {
                          boxWidth: 6,
                          display: true,
                          usePointStyle: true,
                        },
                        align: 'start',
                      },
                      tooltip: getCustomTooltipConfig(),
                    },
                    layout: {
                      padding: {
                        left: '0',
                        right: 0,
                        top: 0,
                        bottom: '0',
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
                          max: Math.max(...incomeState.sale[1]),
                          stepSize: Math.max(...incomeState.sale[1]) / 5,
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
                          beginAtZero: true,
                          font: {
                            size: 13,
                          },
                          color: '#182b49',
                        },
                      },
                    },
                  }}
                />
                <ul className="chart-dataIndicator">
                  {incomeDataset &&
                    incomeDataset.map((item, index) => {
                      return (
                        <li key={index + 1} className="d-inline-flex align-items-center">
                          <span
                            className="w-10px"
                            style={{
                              height: '10px',
                              display: 'flex',
                              backgroundColor: item.hoverBackgroundColor,
                              borderRadius: '50%',
                              margin: '0px 5px',
                            }}
                          />
                          {item.label}
                        </li>
                      );
                    })}
                </ul>
              </Col>
            </Row>
          )}
        </Cards>
      )}
    </IncomeExpenseWrapper>
  );
}

export default IncomeAndExpenses;
