import React from 'react';
import { Row, Col, Breadcrumb, Alert } from 'antd';
import FeatherIcon from 'feather-icons-react';
import { usePathname } from 'next/navigation';
import { NextNavLink, NextLink } from '../../components/utilities/NextLink';
import { HomeOutlined } from '@ant-design/icons';
import { BreadcrumbWrapperStyle } from './ui-elements-styled';
import { PageHeader } from '../../components/page-headers/page-headers';
import { Main } from '../styled';
import { Cards } from '../../components/cards/frame/cards-frame';
import { Button } from '../../components/buttons/buttons';
import { ShareButtonPageHeader } from '../../components/buttons/share-button/share-button';
import { ExportButtonPageHeader } from '../../components/buttons/export-button/export-button';
import { CalendarButtonPageHeader } from '../../components/buttons/calendar-button/calendar-button';

const menuItems = [
  {
    key: 'general',
    label: (
      <a target="_blank" rel="noopener noreferrer" href="http://www.alipay.com/">
        General
      </a>
    ),
  },
  {
    key: 'layout',
    label: (
      <a target="_blank" rel="noopener noreferrer" href="http://www.taobao.com/">
        Layout
      </a>
    ),
  },
  {
    key: 'navigation',
    label: (
      <a target="_blank" rel="noopener noreferrer" href="http://www.tmall.com/">
        Navigation
      </a>
    ),
  },
];

const Home = () => {
  const pathname = usePathname();
  const breadcrumbNameMap = {
    '/apps': 'Application List',
    '/apps/1': 'Application1',
    '/apps/2': 'Application2',
    '/apps/1/detail': 'Detail',
    '/apps/2/detail': 'Detail',
  };

  const pathSnippets = pathname ? pathname.split('/').filter((i) => i) : [];
  const extraBreadcrumbItems = pathSnippets.map((_, index) => {
    const url = `/${pathSnippets.slice(0, index + 1).join('/')}`;
    return {
      key: url,
      title: <NextLink href={url}>{breadcrumbNameMap[url]}</NextLink>,
    };
  });

  function Apps() {
    return (
      <ul className="app-list">
        <li>
          <NextLink href="#" prefetch={false}>Application1</NextLink>：<NextLink href="#" prefetch={false}>Detail</NextLink>
        </li>
        <li>
          <NextLink href="#" prefetch={false}>Application2</NextLink>：<NextLink href="#" prefetch={false}>Detail</NextLink>
        </li>
      </ul>
    );
  }

  const breadcrumbItems = [
    {
      key: 'home',
      title: <NextLink href="/">Home</NextLink>,
    },
  ].concat(extraBreadcrumbItems);

  const isAppsPage = pathname?.includes('/apps');

  return (
    <div className="demo">
      <div className="demo-nav">
        <NextLink href="/">Home</NextLink>
        <NextLink href="#" prefetch={false}>Application List</NextLink>
      </div>
      {isAppsPage ? <Apps /> : <span>Home Page</span>}
      <Alert className="my-16" style={{ background: '#5F63F215' }} message="Click the navigation above to switch:" />
      <Breadcrumb items={breadcrumbItems} />
    </div>
  );
};

function Breadcrumbs() {
  return (
    <>
      <PageHeader
        title="Breadcrumb"
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
      <Main>
        <Row gutter={25}>
          <Col md={12} sm={24} xs={24}>
            <Cards title="Basic">
              <BreadcrumbWrapperStyle>
                <Breadcrumb
                  items={[
                    { title: 'Home' },
                    { title: <NextNavLink to="#">Application Center</NextNavLink> },
                    { title: <NextNavLink to="#">Application List</NextNavLink> },
                    { title: 'An Application' },
                  ]}
                />
              </BreadcrumbWrapperStyle>
            </Cards>
            <Cards title="Other Router Integration">
              <BreadcrumbWrapperStyle>
                <Home />
              </BreadcrumbWrapperStyle>
            </Cards>
            <Cards title="Bread crumbs with drop down menu">
              <BreadcrumbWrapperStyle>
                <Breadcrumb
                  items={[
                    { title: <NextNavLink to="#">Design</NextNavLink> },
                    { title: <NextNavLink to="#">Component</NextNavLink> },
                    {
                      title: <NextNavLink to="#"><span>General</span></NextNavLink>,
                      menu: { items: menuItems },
                    },
                    { title: 'Button' },
                  ]}
                />
              </BreadcrumbWrapperStyle>
            </Cards>
          </Col>
          <Col md={12} sm={24} xs={24}>
            <Cards title="With Icon">
              <BreadcrumbWrapperStyle>
                <Breadcrumb
                  items={[
                    { title: <HomeOutlined /> },
                    { title: <NextNavLink to="#">Application Center</NextNavLink> },
                    { title: <NextNavLink to="#"><span>Application List</span></NextNavLink> },
                    { title: 'An Application' },
                  ]}
                />
              </BreadcrumbWrapperStyle>
            </Cards>

            <Cards title="Configuring the Separator">
              <BreadcrumbWrapperStyle>
                <Breadcrumb
                  separator=">"
                  items={[
                    { title: 'Home' },
                    { title: <NextNavLink to="#">Application Center</NextNavLink> },
                    { title: <NextNavLink to="#">Application List</NextNavLink> },
                    { title: 'An Application' },
                  ]}
                />
              </BreadcrumbWrapperStyle>
            </Cards>

            <Cards title="Configuring the Separator">
              <BreadcrumbWrapperStyle>
                <Breadcrumb
                  separator=""
                  items={[
                    { title: 'Location' },
                    { type: 'separator', separator: ':' },
                    { title: <NextNavLink to="#">Application Center</NextNavLink> },
                    { type: 'separator' },
                    { title: <NextNavLink to="#">Application List</NextNavLink> },
                    { type: 'separator' },
                    { title: 'An Application' },
                  ]}
                />
              </BreadcrumbWrapperStyle>
            </Cards>
          </Col>
        </Row>
      </Main>
    </>
  );
}

export default Breadcrumbs;
