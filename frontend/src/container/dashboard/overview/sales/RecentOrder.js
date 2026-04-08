'use client';

import React, { useState, useEffect } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { Table } from 'antd';
import { topSaleGetData, topSaleFilterData } from '../../../../redux/chartContent/actionCreator';
import { Cards } from '../../../../components/cards/frame/cards-frame';

function RecentOrder() {
  const dispatch = useDispatch();
  const { topSaleState } = useSelector(state => {
    return {
      topSaleState: state.chartContent.topSaleData,
    };
  });
  const [state, setState] = useState({
    products: 'year',
  });
  useEffect(() => {
    if (topSaleGetData) {
      dispatch(topSaleGetData());
    }
  }, [dispatch]);

  const handleActiveChangeProducts = value => {
    setState({
      ...state,
      products: value,
    });
    dispatch(topSaleFilterData(value));
  };

  const sellingData = [];
  if (topSaleState !== null) {
    topSaleState.map(value => {
      const { key, name, price, sold, revenue } = value;
      return sellingData.push({
        key,
        name,
        price,
        sold,
        revenue,
      });
    });
  }

  const moreContent = (
    <>
      <a href="#">
        <span>2 years</span>
      </a>
      <a href="#">
        <span>3 years</span>
      </a>
      <a href="#">
        <span>4 years</span>
      </a>
    </>
  );

  const sellingColumns = [
    {
      title: 'Product Name',
      dataIndex: 'name',
      key: 'name',
    },
    {
      title: 'Price',
      dataIndex: 'price',
      key: 'price',
    },
    {
      title: 'Sold',
      dataIndex: 'sold',
      key: 'sold',
    },
    {
      title: 'Revenue',
      dataIndex: 'revenue',
      key: 'revenue',
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
        title="Recent Orders"
        size="large"
        bodypadding="0px"
        more={moreContent}
      >
        <div className="table-bordered top-seller-table table-responsive">
          <Table columns={sellingColumns} dataSource={sellingData} pagination={false} />
        </div>
      </Cards>
    </div>
  );
}

export default RecentOrder;
