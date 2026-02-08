import React from 'react';
import { Row, Col, Collapse } from 'antd';
import FeatherIcon from 'feather-icons-react';
import { NextLink } from '../../components/utilities/NextLink';
import { Badge, FaqCategoryBox, FaqSupportBox, FaqWrapper } from './style';
import { PageHeader } from '../../components/page-headers/page-headers';
import { Main } from '../styled';
import { Cards } from '../../components/cards/frame/cards-frame';
import Heading from '../../components/heading/heading';
import { Button } from '../../components/buttons/buttons';
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

const panelContent = (text) => (
  <>
    <p>{text}</p>
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

const defaultText = `Many support queries and technical questions will already be answered in supporting documentation such as FAQ's and comments from previous buyers. Anim pariatur cliche reprehenderit, enim eiusmod high life accusamus terry richardson ad squid. 3 wolf moon officia aute, non cupidatat skateboard dolor brunch. Food truck quinoa nesciunt laborum eiusmod. Brunch 3 wolf moon tempor, sunt aliqua put a bird on it squid single-origin coffee nulla assumenda shoreditch et.`;

const faqItems = [
  {
    key: '1',
    label: 'How long does it take to download updates?',
    children: panelContent(defaultText),
    style: customPanelStyle,
  },
  {
    key: '2',
    label: 'How to use SCSS variables to build custom color?',
    children: panelContent(defaultText),
    style: customPanelStyle,
  },
  {
    key: '3',
    label: 'How long does it take to download updates?',
    children: panelContent(defaultText),
    style: customPanelStyle,
  },
  {
    key: '4',
    label: 'What is the flex layout?',
    children: panelContent(defaultText),
    style: customPanelStyle,
  },
  {
    key: '5',
    label: 'How long does it take to download updates?',
    children: panelContent(defaultText),
    style: customPanelStyle,
  },
  {
    key: '6',
    label: 'Where to buy this UI dashboard?',
    children: panelContent(defaultText),
    style: customPanelStyle,
  },
  {
    key: '7',
    label: 'How long does it take to download updates?',
    children: panelContent(defaultText),
    style: customPanelStyle,
  },
];

function Faq() {
  const handleChange = (e) => {
    e.preventDefault();
    e.target.closest('ul').querySelector('a.active').classList.remove('active');
    e.target.classList.add('active');
  };

  return (
    <>
      <PageHeader
        ghost
        title="Frequently Asked Questions"
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
          <Col xxl={6} lg={8} md={10} sm={11}>
            <Row>
              <Col xs={24}>
                <FaqCategoryBox>
                  <Cards headless>
                    <Badge className="faq-badge" type="light">
                      Browse by Topic
                    </Badge>
                    <ul>
                      <li>
                        <NextLink className="active primary" onClick={handleChange} href="#">
                          Using Applications
                        </NextLink>
                      </li>
                      <li>
                        <NextLink className="secondary" onClick={handleChange} href="#">
                          UI Elements
                        </NextLink>
                      </li>
                      <li>
                        <NextLink className="success" onClick={handleChange} href="#">
                          Components
                        </NextLink>
                      </li>
                      <li>
                        <NextLink className="warning" onClick={handleChange} href="#">
                          Build Process
                        </NextLink>
                      </li>
                      <li>
                        <NextLink className="info" onClick={handleChange} href="#">
                          Support Policy
                        </NextLink>
                      </li>
                      <li>
                        <NextLink className="danger" onClick={handleChange} href="#">
                          Accounts & Billing
                        </NextLink>
                      </li>
                    </ul>
                  </Cards>
                </FaqCategoryBox>
              </Col>

              <Col xs={24}>
                <FaqSupportBox>
                  <Cards headless>
                    <figure>
                      <img src={getImageUrl('static/img/pages/support.svg')} alt="" />
                    </figure>
                    <figcaption>
                      <Heading as="h5">Not finding the help you need?</Heading>
                      <Button size="default" type="primary">
                        Contact Support
                      </Button>
                    </figcaption>
                  </Cards>
                </FaqSupportBox>
              </Col>
            </Row>
          </Col>

          <Col xxl={18} lg={16} md={14} sm={13}>
            <FaqWrapper>
              <Cards headless title="Using Applications">
                <Collapse
                  defaultActiveKey={['1']}
                  expandIcon={({ isActive }) => <FeatherIcon icon={isActive ? 'minus' : 'plus'} size={14} />}
                  items={faqItems}
                />
              </Cards>
            </FaqWrapper>
          </Col>
        </Row>
      </Main>
    </>
  );
}

export default Faq;
