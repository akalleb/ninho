'use client';

import React, { useState, useMemo, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { Row, Col, Radio, Spin } from 'antd';
import { usePathname } from 'next/navigation';
import { NextNavLink } from '../../../components/utilities/NextLink';
import FeatherIcon from 'feather-icons-react';
import { PageHeader } from '../../../components/page-headers/page-headers';
import { Main } from '../../styled';
import { AutoComplete } from '../../../components/autoComplete/autoComplete';
import { TopToolBox } from '../Style';
import { sorting } from '../../../redux/product/actionCreator';
import { Button } from '../../../components/buttons/buttons';
import { ShareButtonPageHeader } from '../../../components/buttons/share-button/share-button';
import { ExportButtonPageHeader } from '../../../components/buttons/export-button/export-button';
import { CalendarButtonPageHeader } from '../../../components/buttons/calendar-button/calendar-button';
import { Cards } from '../../../components/cards/frame/cards-frame';

// Direct imports - no lazy loading needed since route already uses dynamic()
// This eliminates double lazy loading and improves performance
import Filters from './overview/Filters';
import Grid from './overview/Grid';
import List from './overview/List';

function Product() {
  const dispatch = useDispatch();
  const pathname = usePathname();
  const searchData = useSelector(state => state.headerSearchData);
  const [windowWidth, setWindowWidth] = useState(
    typeof window !== 'undefined' ? window.innerWidth : 1920
  );

  const [state, setState] = useState({
    notData: searchData,
    active: 'active',
  });

  const { notData } = state;

  useEffect(() => {
    const handleResize = () => {
      setWindowWidth(window.innerWidth);
    };
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  const currentView = useMemo(() => {
    if (!pathname) return 'grid';
    const path = pathname.toLowerCase();
    if (path.includes('/list')) return 'list';
    return 'grid'; // default to grid
  }, [pathname]);

  const handleSearch = searchText => {
    const data = searchData.filter(item => item.title.toUpperCase().startsWith(searchText.toUpperCase()));
    setState({
      ...state,
      notData: data,
    });
  };

  const onSorting = e => {
    dispatch(sorting(e.target.value));
  };

  return (
    <>
      <PageHeader
        ghost
        title="Shop"
        buttons={[
          <div key="1" className="page-header-actions">
            <CalendarButtonPageHeader key="1" />
            <ExportButtonPageHeader key="2" />
            <ShareButtonPageHeader key="3" />
            <Button size="small" key="4" type="primary">
              <FeatherIcon icon="plus" size={14} />
              Add New
            </Button>
          </div>,
        ]}
      />
      <Main>
        <Row gutter={30}>
          <Col className="product-sidebar-col" xxl={5} xl={7} lg={7} md={10} xs={24}>
            <Filters />
          </Col>
          <Col className="product-content-col" xxl={19} lg={17} md={14} xs={24}>
            <TopToolBox>
              <Row gutter={0}>
                <Col xxl={7} lg={12} xs={24}>
                  <AutoComplete
                    onSearch={handleSearch}
                    dataSource={notData}
                    placeholder="Search"
                    width="100%"
                    patterns
                  />
                </Col>
                <Col xxl={7} lg={12} xs={24}>
                  <p className="search-result">Showing 1–8 of 86 results</p>
                </Col>
                <Col xxl={10} xs={24}>
                  <div className="product-list-action d-flex justify-content-between align-items-center">
                    <div className="product-list-action__tab">
                      <span className="toolbox-menu-title"> Status:</span>
                      <Radio.Group onChange={onSorting} defaultValue="rate">
                        <Radio.Button value="rate">Top Rated</Radio.Button>
                        <Radio.Button value="popular">Popular</Radio.Button>
                        <Radio.Button value="time">Newest</Radio.Button>
                        <Radio.Button value="price">Price</Radio.Button>
                      </Radio.Group>
                    </div>
                    {(windowWidth <= 991 && windowWidth >= 768) ||
                      (windowWidth > 575 && (
                        <div className="product-list-action__viewmode">
                          <NextNavLink to="/admin/ecommerce/products/grid" className={currentView === 'grid' ? 'active' : ''}>
                            <FeatherIcon icon="grid" size={16} />
                          </NextNavLink>
                          <NextNavLink to="/admin/ecommerce/products/list" className={currentView === 'list' ? 'active' : ''}>
                            <FeatherIcon icon="list" size={16} />
                          </NextNavLink>
                        </div>
                      ))}
                  </div>
                </Col>
              </Row>
            </TopToolBox>

            {currentView === 'list' ? <List /> : <Grid />}
          </Col>
        </Row>
      </Main>
    </>
  );
}

export default Product;
