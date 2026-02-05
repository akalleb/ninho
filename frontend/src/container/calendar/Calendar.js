'use client';

import React, { useState, useMemo } from 'react';
import { Row, Col, Skeleton } from 'antd';
import FeatherIcon from 'feather-icons-react';
import CalenDar from 'react-calendar';
import { usePathname } from 'next/navigation';
import { useSelector, useDispatch } from 'react-redux';
import { Aside, CalendarWrapper } from './Style';
import { ShareButtonPageHeader } from '../../components/buttons/share-button/share-button';
import { ExportButtonPageHeader } from '../../components/buttons/export-button/export-button';
import { CalendarButtonPageHeader } from '../../components/buttons/calendar-button/calendar-button';
import { Main } from '../styled';
import { Button } from '../../components/buttons/buttons';
import { Cards } from '../../components/cards/frame/cards-frame';
import { PageHeader } from '../../components/page-headers/page-headers';
import 'react-calendar/dist/Calendar.css';
import { eventVisible } from '../../redux/calendar/actionCreator';

// Direct imports - no lazy loading needed since route already uses dynamic()
import YearCalendar from './overview/Year';
import MonthCalendar from './overview/Month';
import WeekCalendar from './overview/Week';
import DayCalendar from './overview/Day';
import TodayCalendar from './overview/Today';
import ScheduleCalendar from './overview/Schedule';

function Calendars() {
  const dispatch = useDispatch();
  const pathname = usePathname();
  const { events, isVisible } = useSelector(state => {
    return {
      events: state.Calender.events,
      isVisible: state.Calender.eventVisible,
    };
  });

  const [state, setState] = useState({
    date: new Date(),
    visible: false,
  });

  const onChange = date => setState({ date });

  const onHandleVisible = () => {
    dispatch(eventVisible(!isVisible));
  };

  // Determine current calendar view from pathname
  const currentView = useMemo(() => {
    if (!pathname) return 'month';
    const path = pathname.toLowerCase();
    if (path.includes('/year')) return 'year';
    if (path.includes('/week')) return 'week';
    if (path.includes('/day')) return 'day';
    if (path.includes('/today')) return 'today';
    if (path.includes('/schedule')) return 'schedule';
    return 'month'; // default
  }, [pathname]);

  return (
    <>
      <PageHeader
        ghost
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
        <CalendarWrapper>
          <Row gutter={25}>
            <Col xxl={6} xl={9} xs={24}>
              <Aside>
                <Button onClick={onHandleVisible} className="btn-create" size="large" type="secondary">
                  <FeatherIcon icon="plus" size={14} /> Create New Event
                </Button>
                <div className="calendar-display">
                  <CalenDar next2Label={null} prev2Label={null} onChange={onChange} value={state.date} />
                </div>
                <br />
                <Cards headless>
                  <h3 className="listHeader">
                    My Calendars
                    <span onClick={onHandleVisible} className="add-label cursor-pointer">
                      <FeatherIcon icon="plus" size={14} />
                    </span>
                  </h3>
                  <ul className="event-list">
                    {events.map(event => {
                      const { id, title, label } = event;
                      return (
                        <li key={id}>
                          <span className="cursor-pointer">
                            <span className={`bullet ${label}`} />
                            {title}
                          </span>
                        </li>
                      );
                    })}
                  </ul>
                </Cards>
              </Aside>
            </Col>
            <Col xxl={18} xl={15} xs={24}>
              {currentView === 'year' && <YearCalendar />}
              {currentView === 'month' && <MonthCalendar />}
              {currentView === 'week' && <WeekCalendar />}
              {currentView === 'day' && <DayCalendar />}
              {currentView === 'today' && <TodayCalendar />}
              {currentView === 'schedule' && <ScheduleCalendar />}
            </Col>
          </Row>
        </CalendarWrapper>
      </Main>
    </>
  );
}

export default Calendars;
