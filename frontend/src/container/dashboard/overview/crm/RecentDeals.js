'use client';
import React, { useState, useEffect } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { Table } from 'antd';
import { RecentDealsWrapper } from '../../style';
import { recentDealGetData, recentDealFilterData } from '../../../../redux/chartContent/actionCreator';
import { Cards } from '../../../../components/cards/frame/cards-frame';
import { getImageUrl } from '../../../../utility/getImageUrl';

function RecentDeals() {
  const dispatch = useDispatch();
  const { recentDealState } = useSelector(state => {
    return {
      recentDealState: state.chartContent.recentDealData,
    };
  });
  const [state, setState] = useState({
    products: 'year',
  });
  useEffect(() => {
    if (recentDealGetData) {
      dispatch(recentDealGetData());
    }
  }, [dispatch]);

  const handleActiveChangeProducts = value => {
    setState({
      ...state,
      products: value,
    });
    dispatch(recentDealFilterData(value));
  };

  const sellingData = [];
  if (recentDealState !== null) {
    recentDealState.map(value => {
      const { key, name, date, price, img } = value;
      
      return sellingData.push({
        key,
        name: (
          <div className="dealing-author">
            <img src={getImageUrl(img)} alt="" />
            <div className="dealing-author-info">
              <h4>{name}</h4>
              <p>{date}</p>
            </div>
          </div>
        ),
        amount: <span className="deal-amount">{price}</span>,
      });
    });
  }

  const sellingColumns = [
    {
      title: '',
      dataIndex: 'name',
      key: 'name',
    },
    {
      title: '',
      dataIndex: 'amount',
      key: 'amount',
    },
  ];

  return (
    <div className="full-width-table">
      <Cards
        isbutton={
          <div className="card-nav">
            <ul>
              <li className={state.products === 'today' ? 'active' : 'deactivate'}>
                <span onClick={() => handleActiveChangeProducts('today')} className="cursor-pointer">
                  Today
                </span>
              </li>
              <li className={state.products === 'week' ? 'active' : 'deactivate'}>
                <span onClick={() => handleActiveChangeProducts('week')} className="cursor-pointer">
                  Week
                </span>
              </li>
              <li className={state.products === 'month' ? 'active' : 'deactivate'}>
                <span onClick={() => handleActiveChangeProducts('month')} className="cursor-pointer">
                  Month
                </span>
              </li>
              <li className={state.products === 'year' ? 'active' : 'deactivate'}>
                <span onClick={() => handleActiveChangeProducts('year')} className="cursor-pointer">
                  Year
                </span>
              </li>
            </ul>
          </div>
        }
        title="Recent Deals"
        size="large"
        bodypadding="0px"
      >
        <RecentDealsWrapper>
          <div className="table-bordered recent-deals-table table-responsive">
            <Table columns={sellingColumns} dataSource={sellingData} pagination={false} showHeader={false} />
          </div>
        </RecentDealsWrapper>
      </Cards>
    </div>
  );
}

export default RecentDeals;
