import React, { useState } from 'react';
import { Row, Col, Calendar, Badge } from 'antd';
import FeatherIcon from 'feather-icons-react';
import moment from 'moment';
import { PageHeader } from '../../components/page-headers/page-headers';
import { Main, CalendarWrapper } from '../styled';
import { Cards } from '../../components/cards/frame/cards-frame';
import { Button } from '../../components/buttons/buttons';
import { ShareButtonPageHeader } from '../../components/buttons/share-button/share-button';
import { ExportButtonPageHeader } from '../../components/buttons/export-button/export-button';
import { CalendarButtonPageHeader } from '../../components/buttons/calendar-button/calendar-button';

function Calendars() {
  const [state, setState] = useState({
    value: moment('2017-01-25'),
    selectedValue: moment('2017-01-25'),
  });

  const onPanelChange = (value) => {
    setState(prevState => ({ ...prevState, value }));
  };

  const getListData = (value) => {
    let listData;
    switch (value.date()) {
      case 8:
        listData = [
          { type: 'warning', content: 'This is warning event.' },
          { type: 'success', content: 'This is usual event.' },
        ];
        break;
      case 10:
        listData = [
          { type: 'warning', content: 'This is warning event.' },
          { type: 'success', content: 'This is usual event.' },
          { type: 'error', content: 'This is error event.' },
        ];
        break;
      case 15:
        listData = [
          { type: 'warning', content: 'This is warning event' },
          { type: 'success', content: 'This is very long usual event。。....' },
          { type: 'error', content: 'This is error event 1.' },
          { type: 'error', content: 'This is error event 2.' },
          { type: 'error', content: 'This is error event 3.' },
          { type: 'error', content: 'This is error event 4.' },
        ];
        break;
      default:
    }
    return listData || [];
  };

  const cellRender = (value, info) => {
    if (info.type === 'date') {
      const listData = getListData(value);
      return (
        <ul className="events">
          {listData.map((item) => (
            <li key={item.content}>
              <Badge status={item.type} text={item.content} />
            </li>
          ))}
        </ul>
      );
    }
    if (info.type === 'month') {
      const num = value.month() === 8 ? 1394 : null;
      return num ? (
        <div className="notes-month">
          <section>{num}</section>
          <span>Backlog number</span>
        </div>
      ) : null;
    }
    return info.originNode;
  };

  return (
    <>
      <PageHeader
        title="Calendar"
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
          <Col md={24}>
            <Cards title="Basic">
              <CalendarWrapper>
                <Calendar onPanelChange={onPanelChange} />
              </CalendarWrapper>
            </Cards>
          </Col>
          <Col md={24}>
            <Cards title="Notice Calendar">
              <CalendarWrapper>
                <Calendar cellRender={cellRender} />
              </CalendarWrapper>
            </Cards>
          </Col>
        </Row>
      </Main>
    </>
  );
}

export default Calendars;
