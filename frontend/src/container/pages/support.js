import React from 'react';
import { Row, Col, Collapse } from 'antd';
import FeatherIcon from 'feather-icons-react';
import { NextNavLink } from '../../components/utilities/NextLink';
import { SupportTopWrap, SupportContentWrap, FaqWrapper } from './style';
import { PageHeader } from '../../components/page-headers/page-headers';
import { Cards } from '../../components/cards/frame/cards-frame';
import { Main } from '../styled';
import { Button } from '../../components/buttons/buttons';
import Heading from '../../components/heading/heading';
import { ShareButtonPageHeader } from '../../components/buttons/share-button/share-button';
import { ExportButtonPageHeader } from '../../components/buttons/export-button/export-button';
import { CalendarButtonPageHeader } from '../../components/buttons/calendar-button/calendar-button';
import { getImageUrl } from '../../utility/getImageUrl';

const customPanelStyle = {
  background: '#ffffff',
  borderRadius: 5,
  marginBottom: 5,
  border: '1px solid #F1F2F6',
};

const defaultText = `Many support queries and technical questions will already be answered in supporting documentation such as FAQ's and comments from previous buyers. Anim pariatur cliche reprehenderit, enim eiusmod high life accusamus terry richardson ad squid. 3 wolf moon officia aute, non cupidatat skateboard dolor brunch. Food truck quinoa nesciunt laborum eiusmod. Brunch 3 wolf moon tempor, sunt aliqua put a bird on it squid single-origin coffee nulla assumenda shoreditch et.`;

const panelContent = (
  <>
    <p>{defaultText}</p>
    <Heading as="h4">Was this article helpful?</Heading>
    <div className="panel-actions">
      <Button outlined type="success">
        <FeatherIcon size={14} icon="smile" />
        Yes
      </Button>
      <Button outlined type="warning">
        <FeatherIcon size={14} icon="frown" />
        No
      </Button>
    </div>
  </>
);

const faqItems = [
  {
    key: '1',
    label: 'How long does it take to download updates?',
    children: panelContent,
    style: customPanelStyle,
  },
  {
    key: '2',
    label: 'How to use SCSS variables to build custom color?',
    children: panelContent,
    style: customPanelStyle,
  },
  {
    key: '3',
    label: 'How long does it take to download updates?',
    children: panelContent,
    style: customPanelStyle,
  },
  {
    key: '4',
    label: 'What is the flex layout?',
    children: panelContent,
    style: customPanelStyle,
  },
  {
    key: '5',
    label: 'How long does it take to download updates?',
    children: panelContent,
    style: customPanelStyle,
  },
  {
    key: '6',
    label: 'Where to buy this UI dashboard?',
    children: panelContent,
    style: customPanelStyle,
  },
  {
    key: '7',
    label: 'How long does it take to download updates?',
    children: (
      <>
        <p>{defaultText}</p>
        <Heading as="h4">Was this article helpful?</Heading>
        <div className="panel-actions">
          <Button outlined type="success">
            Yes
          </Button>
          <Button outlined type="warning">
            <FeatherIcon size={14} icon="frown" />
            No
          </Button>
        </div>
      </>
    ),
    style: customPanelStyle,
  },
];

function Support() {
  return (
    <>
      <PageHeader
        title="Support Center"
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
          <Col xs={24}>
            <SupportTopWrap>
              <div className="sDash-support-container">
                <Row align="middle">
                  <Col lg={16} sm={14} xs={24}>
                    <div className="sDash_support-content">
                      <h2 className="sDash_support-content__title">Hello, We are here to help</h2>
                      <p>Lorem ipsum dolor sit amet, consetetur sadipscing elitr, sed diam nonumy</p>
                      <Button className="btn-ticket" size="large" type="primary" raised>
                        Create Support Ticket
                      </Button>
                    </div>
                  </Col>

                  <Col lg={8} sm={10} xs={24}>
                    <div className="sDash_support-img">
                      <img src={getImageUrl('static/img/Group 9786.png')} alt="" />
                    </div>
                  </Col>
                </Row>
              </div>
            </SupportTopWrap>
            <SupportContentWrap>
              <div className="sDash-support-container">
                <div className="sDash-support-links">
                  <Row gutter={30}>
                    <Col lg={8} xs={24}>
                      <div className="sDash-support-link-item">
                        <div className="sDash-support-link-item__icon primary">
                          <img src={getImageUrl('static/img/icon/idea.svg')} alt="" />
                        </div>
                        <h4 className="sDash-support-link-item__title">Knowledgebase</h4>
                        <div className="sDash-support-link-item__content">
                          <p>Lorem ipsum dolor sit amet consetetur</p>
                          <NextNavLink to="/admin/pages/knowledgebase/plugins" className="btn-link">
                            Learn More
                          </NextNavLink>
                        </div>
                      </div>
                    </Col>
                    <Col lg={8} xs={24}>
                      <div className="sDash-support-link-item">
                        <div className="sDash-support-link-item__icon info">
                          <img src={getImageUrl('static/img/icon/chat.svg')} alt="" />
                        </div>
                        <h4 className="sDash-support-link-item__title">FAQ</h4>
                        <div className="sDash-support-link-item__content">
                          <p>Lorem ipsum dolor sit amet consetetur</p>
                          <NextNavLink to="/admin/pages/faq" className="btn-link">
                            Learn More
                          </NextNavLink>
                        </div>
                      </div>
                    </Col>
                    <Col lg={8} xs={24}>
                      <div className="sDash-support-link-item">
                        <div className="sDash-support-link-item__icon success">
                          <img src={getImageUrl('static/img/icon/documentation.svg')} alt="" />
                        </div>
                        <h4 className="sDash-support-link-item__title">Documentation</h4>
                        <div className="sDash-support-link-item__content">
                          <p>Lorem ipsum dolor sit amet consetetur</p>
                          <NextNavLink to="/admin/pages/documentation" className="btn-link">
                            Learn More
                          </NextNavLink>
                        </div>
                      </div>
                    </Col>
                  </Row>
                </div>
                <div className="sDash_faq-block">
                  <Cards headless title="Frequently Asked Questions">
                    <FaqWrapper>
                      <Collapse
                        defaultActiveKey={['1']}
                        expandIcon={({ isActive }) => <FeatherIcon icon={isActive ? 'minus' : 'plus'} size={14} />}
                        items={faqItems}
                      />
                    </FaqWrapper>
                  </Cards>
                </div>
              </div>
            </SupportContentWrap>
          </Col>
        </Row>
      </Main>
    </>
  );
}

export default Support;
