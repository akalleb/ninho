import React from 'react';
import { Row, Col } from 'antd';
import FeatherIcon from 'feather-icons-react';
import { DropdownStyle } from './ui-elements-styled';
import { PageHeader } from '../../components/page-headers/page-headers';
import { Main } from '../styled';
import { Cards } from '../../components/cards/frame/cards-frame';
import { Button } from '../../components/buttons/buttons';
import { Popover } from '../../components/popup/popup';
import { ShareButtonPageHeader } from '../../components/buttons/share-button/share-button';
import { ExportButtonPageHeader } from '../../components/buttons/export-button/export-button';
import { CalendarButtonPageHeader } from '../../components/buttons/calendar-button/calendar-button';

function Popovers() {
  const popoverContent = (
    <div>
      <p>Content</p>
      <p>Content</p>
    </div>
  );

  const titleContent = 'Title';

  return (
    <DropdownStyle>
      <PageHeader
        ghost
        title="Popovers"
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
          <Col md={12} sm={12} xs={24}>
            <Cards title="Basic Popover" caption="The simplest use of Popover">
              <Popover content={popoverContent} title={titleContent} placement="bottomLeft">
                <a href="#" className="cursor-pointer">hover me </a>
              </Popover>
            </Cards>
            <Cards title="Event menu " caption="The simplest use of Popover">
              <Popover content={popoverContent} title={titleContent} action="hover" placement="bottomLeft">
                <Button type="primary">hover</Button>
              </Popover>
              <Popover content={popoverContent} title={titleContent} action="click" placement="bottom">
                <Button type="primary">click</Button>
              </Popover>
              <Popover content={popoverContent} title={titleContent} action="contextMenu" placement="bottomRight">
                <Button type="primary">context</Button>
              </Popover>
            </Cards>
          </Col>
          <Col md={12} sm={12} xs={24}>
            <Cards title="Placement" caption="The simplest use of Popover">
              <Popover content={popoverContent} title={titleContent} placement="bottomLeft">
                <Button type="primary">bottomLeft</Button>
              </Popover>
              <Popover content={popoverContent} title={titleContent} placement="bottom">
                <Button type="primary">bottomCenter</Button>
              </Popover>
              <Popover content={popoverContent} title={titleContent} placement="bottomRight">
                <Button type="primary">bottomRight</Button>
              </Popover>
              <br />
              <Popover content={popoverContent} title={titleContent} placement="topLeft">
                <Button type="primary">topLeft</Button>
              </Popover>
              <Popover content={popoverContent} title={titleContent} placement="top">
                <Button type="primary">topCenter</Button>
              </Popover>
              <Popover content={popoverContent} title={titleContent} placement="topRight">
                <Button type="primary">topRight</Button>
              </Popover>
            </Cards>
          </Col>
        </Row>
      </Main>
    </DropdownStyle>
  );
}

export default Popovers;
