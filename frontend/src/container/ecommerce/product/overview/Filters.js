'use client';

import React, { useState } from 'react';
import FeatherIcon from 'feather-icons-react';
import { Rate } from 'antd';
import { useDispatch } from 'react-redux';
import { Cards } from '../../../../components/cards/frame/cards-frame';
import Heading from '../../../../components/heading/heading';
import { Slider } from '../../../../components/slider/slider';
import { CheckboxGroup } from '../../../../components/checkbox/checkbox';
import { Sidebar, SidebarSingle } from '../../Style';
import {
  filterByPriceRange,
  filterByRating,
  filterByBrand,
  filterByCategory,
} from '../../../../redux/product/actionCreator';

function Filters() {
  const [state, setState] = useState({
    min: 0,
    max: 1500,
  });
  const dispatch = useDispatch();

  const { min, max } = state;
  const onChange = value => {
    setState({
      ...state,
      min: value[0],
      max: value[1],
    });
    dispatch(filterByPriceRange(value));
  };
  const onChangeRating = checkValue => {
    dispatch(filterByRating([checkValue]));
  };
  const onChangeBrand = checkValue => {
    dispatch(filterByBrand([checkValue]));
  };
  const options = [
    {
      label: (
        <>
          <span className="rating-left">
            <Rate allowHalf defaultValue={5} disabled />
          </span>
          <span className="rating-right">25</span>
        </>
      ),
      value: 5,
    },
    {
      label: (
        <>
          <span className="rating-left">
            <Rate allowHalf defaultValue={4} disabled />
            and up
          </span>
          <span className="rating-right">25</span>
        </>
      ),
      value: 4,
    },
    {
      label: (
        <>
          <span className="rating-left">
            <Rate allowHalf defaultValue={3} disabled />
            and up
          </span>
          <span className="rating-right">25</span>
        </>
      ),
      value: 3,
    },
    {
      label: (
        <>
          <span className="rating-left">
            <Rate allowHalf defaultValue={2} disabled />
            and up
          </span>
          <span className="rating-right">25</span>
        </>
      ),
      value: 2,
    },
    {
      label: (
        <>
          <span className="rating-left">
            <Rate allowHalf defaultValue={1} disabled />
            and up
          </span>
          <span className="rating-right">25</span>
        </>
      ),
      value: 1,
    },
  ];

  const optionsBrand = [
    {
      label: (
        <>
          Cup <span className="brand-count">25</span>
        </>
      ),
      value: 'cup',
    },
    {
      label: (
        <>
          Plate <span className="brand-count">25</span>
        </>
      ),
      value: 'plate',
    },
    {
      label: (
        <>
          Chair <span className="brand-count">25</span>
        </>
      ),
      value: 'chair',
    },
    {
      label: (
        <>
          Juice <span className="brand-count">25</span>
        </>
      ),
      value: 'juice',
    },
  ];

  const onChangeCategory = value => {
    dispatch(filterByCategory(value));
  };

  return (
    <Sidebar>
      <Cards
        title={
          <span>
            <FeatherIcon icon="sliders" size={14} />
            Filters
          </span>
        }
      >
        <SidebarSingle className="mb-32">
          <Heading as="h5">Price Range</Heading>
          <Slider max={1500} onChange={onChange} range defaultValues={[min, max]} />
          <p className="price-range-text">
            ${min} - ${max}
          </p>
        </SidebarSingle>
        <SidebarSingle className="mb-32">
          <Heading as="h5">Category</Heading>

          <nav>
            <ul className="atbd-category-list">
              <li>
                <span onClick={() => onChangeCategory('all')} className="cursor-pointer d-block">
                  <span>All</span>
                  <span className="category-count">25</span>
                </span>
              </li>
              <li>
                <span onClick={() => onChangeCategory('accessories')} className="cursor-pointer d-block">
                  <span>Accessories</span>
                  <span className="category-count">25</span>
                </span>
              </li>
              <li>
                <span onClick={() => onChangeCategory('appliance')} className="cursor-pointer d-block">
                  <span>Appliances</span>
                  <span className="category-count">25</span>
                </span>
              </li>
              <li>
                <span onClick={() => onChangeCategory('bags')} className="cursor-pointer d-block">
                  <span>Bags</span>
                  <span className="category-count">25</span>
                </span>
              </li>
              <li>
                <span onClick={() => onChangeCategory('electronic')} className="cursor-pointer d-block">
                  <span>Electronic</span>
                  <span className="category-count">25</span>
                </span>
              </li>
              <li>
                <span onClick={() => onChangeCategory('entertainment')} className="cursor-pointer d-block">
                  <span>Entertainment</span>
                  <span className="category-count">25</span>
                </span>
              </li>
              <li>
                <span onClick={() => onChangeCategory('induction')} className="cursor-pointer d-block">
                  <span>Induction</span>
                  <span className="category-count">25</span>
                </span>
              </li>
              <li>
                <span onClick={() => onChangeCategory('mobile')} className="cursor-pointer d-block">
                  <span>Mobile Phone</span>
                  <span className="category-count">25</span>
                </span>
              </li>
            </ul>
          </nav>
          <div className="sidebar-single__action">
            <span className="btn-seeMore cursor-pointer">
              See more
            </span>
          </div>
        </SidebarSingle>

        <SidebarSingle className="mb-32">
          <Heading as="h5">Brands</Heading>
          <CheckboxGroup options={optionsBrand} onChange={onChangeBrand} />

          <div className="sidebar-single__action">
            <span className="btn-seeMore cursor-pointer">
              See more
            </span>
          </div>
        </SidebarSingle>

        <SidebarSingle>
          <Heading as="h5">Ratings</Heading>
          <CheckboxGroup className="ratings-list" options={options} onChange={onChangeRating} />
        </SidebarSingle>
      </Cards>
    </Sidebar>
  );
}

export default Filters;
