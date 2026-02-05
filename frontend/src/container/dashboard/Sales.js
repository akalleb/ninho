'use client';

import React from 'react';
import { Row, Col, Skeleton } from 'antd';
import FeatherIcon from 'feather-icons-react';
import { CardBarChart2, OverviewSalesCard } from './style';
import { PageHeader } from '../../components/page-headers/page-headers';
import { Cards } from '../../components/cards/frame/cards-frame';
import { Button } from '../../components/buttons/buttons';
import { Main } from '../styled';
import { ShareButtonPageHeader } from '../../components/buttons/share-button/share-button';
import { ExportButtonPageHeader } from '../../components/buttons/export-button/export-button';
import { CalendarButtonPageHeader } from '../../components/buttons/calendar-button/calendar-button';
import { getImageUrl } from '../../utility/getImageUrl';

// Direct imports - no lazy loading needed since route already uses dynamic()
import AverageSalesRevenue from './overview/sales/AverageSalesRevenue';
import SalesGrowth from './overview/sales/SalesGrowth';
import SalesTarget from './overview/sales/SalesTarget';
import TopSellingProduct from './overview/sales/TopSellingProduct';
import TopCountriesRevenue from './overview/sales/TopCountriesRevenue';
import RecentOrder from './overview/sales/RecentOrder';

function Sales() {
  return (
    <>
      <PageHeader
        className="header-boxed"
        ghost
        title="Sales Dashboard"
        buttons={[
          <div key="1" className="page-header-actions">
            <CalendarButtonPageHeader />
            <ExportButtonPageHeader />
            <ShareButtonPageHeader />
            <Button size="small" type="primary">
              <FeatherIcon icon="plus" size={14} />
              Add New
            </Button>
          </div>,
        ]}
      />
      <Main className="grid-boxed">
        <Row gutter={25}>
          <Col lg={8} xs={24}>
            <Cards headless>
              <OverviewSalesCard>
                <div className="icon-box box-secondary">
                  <img src={getImageUrl('static/img/icon/New Customer.svg')} alt="" />
                </div>
                <div className="card-chunk">
                  <CardBarChart2>
                    <h2>7,461</h2>
                    <span>New Customer</span>
                    <p>
                      <span className="growth-upward">
                        <FeatherIcon icon="arrow-up" /> 25%
                      </span>
                      <span>Since last week</span>
                    </p>
                  </CardBarChart2>
                </div>
              </OverviewSalesCard>
            </Cards>

            <Cards headless>
              <OverviewSalesCard>
                <div className="icon-box box-primary">
                  <img src={getImageUrl('static/img/icon/SalesRevenue.svg')} alt="" />
                </div>
                <div className="card-chunk">
                  <CardBarChart2>
                    <h2>$28,947</h2>
                    <span>Sales Revenue</span>
                    <p>
                      <span className="growth-downward">
                        <FeatherIcon icon="arrow-down" /> 25%
                      </span>
                      <span>Since last week</span>
                    </p>
                  </CardBarChart2>
                </div>
              </OverviewSalesCard>
            </Cards>

            <Cards headless>
              <OverviewSalesCard>
                <div className="icon-box box-success">
                  <img src={getImageUrl('static/img/icon/Profit.svg')} alt="" />
                </div>
                <div className="card-chunk">
                  <CardBarChart2>
                    <h2>$3,241</h2>
                    <span>Profit</span>
                    <p>
                      <span className="growth-upward">
                        <FeatherIcon icon="arrow-up" /> 25%
                      </span>
                      <span>Since last week</span>
                    </p>
                  </CardBarChart2>
                </div>
              </OverviewSalesCard>
            </Cards>
          </Col>
          <Col lg={16} xs={24}>
            <AverageSalesRevenue />
          </Col>
          <Col lg={8} xs={24}>
            <SalesTarget />
          </Col>
          <Col lg={8} md={12} xs={24}>
            <SalesGrowth />
          </Col>
          <Col lg={8} md={12} xs={24}>
            <TopCountriesRevenue />
          </Col>
          <Col md={12} xs={24}>
            <TopSellingProduct />
          </Col>
          <Col md={12} xs={24}>
            <RecentOrder />
          </Col>
        </Row>
      </Main>
    </>
  );
}

export default Sales;
