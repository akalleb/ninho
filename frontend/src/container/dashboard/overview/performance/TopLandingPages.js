'use client';
import React, { useState, useEffect } from 'react';
import { Table } from 'antd';
import FeatherIcon from 'feather-icons-react';
import { useDispatch, useSelector } from 'react-redux';
import { LadingPages } from '../../style';
import { Cards } from '../../../../components/cards/frame/cards-frame';

import { landingPageFilterData, landingPageGetData } from '../../../../redux/chartContent/actionCreator';

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

const landingColumns = [
  {
    title: 'Landing Pages',
    dataIndex: 'pages',
    key: 'pages',
  },
  {
    title: 'Sessions',
    dataIndex: 'sessions',
    key: 'sessions',
  },
  {
    title: 'Bounce Rate',
    dataIndex: 'rate',
    key: 'rate',
  },
  {
    title: 'CTR',
    dataIndex: 'ctr',
    key: 'ctr',
  },
  {
    title: 'Goal Conv. Rate',
    dataIndex: 'percentage',
    key: 'percentage',
  },
];

function TopLandingPages() {
  const dispatch = useDispatch();
  const { landingState } = useSelector(state => {
    return {
      landingState: state.chartContent.landingPageData,
      lpIsLoading: state.chartContent.lpLoading,
    };
  });

  const [state, setState] = useState({
    landing: 'year',
  });

  useEffect(() => {
    if (landingPageGetData) {
      dispatch(landingPageGetData());
    }
  }, [dispatch]);

  const landingData = landingState !== null && [
    {
      key: '1',
      pages: (
        <span className="page-title cursor-pointer">
          Homepage
        </span>
      ),
      sessions: landingState.direct.sessions,
      rate: `${landingState.direct.rate}%`,
      ctr: landingState.direct.goals,
      percentage: `${landingState.direct.percent}%`,
    },
    {
      key: '2',
      pages: (
        <span className="page-title cursor-pointer">
          Our Service
        </span>
      ),
      sessions: landingState.email.sessions,
      rate: `${landingState.email.rate}%`,
      ctr: landingState.email.goals,
      percentage: `${landingState.email.percent}%`,
    },
    {
      key: '3',
      pages: (
        <span className="page-title cursor-pointer">
          List of Products
        </span>
      ),
      sessions: landingState.search.sessions,
      rate: `${landingState.search.rate}%`,
      ctr: landingState.search.goals,
      percentage: `${landingState.search.percent}%`,
    },
    {
      key: '4',
      pages: (
        <span className="page-title cursor-pointer">
          Contact us
        </span>
      ),
      sessions: landingState.media.sessions,
      rate: `${landingState.media.rate}%`,
      ctr: landingState.media.goals,
      percentage: `${landingState.media.percent}%`,
    },
    {
      key: '5',
      pages: (
        <span className="page-title cursor-pointer">
          Products
        </span>
      ),
      sessions: landingState.other.sessions,
      rate: `${landingState.other.rate}%`,
      ctr: landingState.other.goals,
      percentage: `${landingState.other.percent}%`,
    },
  ];

  const handleActiveChangeLanding = value => {
    setState({
      ...state,
      landing: value,
    });
    dispatch(landingPageFilterData(value));
  };

  return (
    <div className="full-width-table">
      <Cards
        isbutton={
          <div className="card-nav">
            <ul>
              <li className={state.landing === 'week' ? 'active' : 'deactivate'}>
                <span onClick={() => handleActiveChangeLanding('week')} className="cursor-pointer">
                  Week
                </span>
              </li>
              <li className={state.landing === 'month' ? 'active' : 'deactivate'}>
                <span onClick={() => handleActiveChangeLanding('month')} className="cursor-pointer">
                  Month
                </span>
              </li>
              <li className={state.landing === 'year' ? 'active' : 'deactivate'}>
                <span onClick={() => handleActiveChangeLanding('year')} className="cursor-pointer">
                  Year
                </span>
              </li>
            </ul>
          </div>
        }
        title="Top Landing Pages"
        size="large"
        more={moreContent}
      >
        <LadingPages>
          <div className="table-bordered table-responsive">
            <Table columns={landingColumns} dataSource={landingData} pagination={false} />
          </div>
        </LadingPages>
      </Cards>
    </div>
  );
}

export default TopLandingPages;
