'use client';

import React, { useState, useMemo } from 'react';
import { Row, Col, Badge, Skeleton } from 'antd';
import { useSelector, shallowEqual } from 'react-redux';
import { usePathname, useParams } from 'next/navigation';
import { NextNavLink } from '../../components/utilities/NextLink';
import FeatherIcon from 'feather-icons-react';
import { Scrollbars } from 'react-custom-scrollbars';
import { UL, Content, ChatSidebar } from './style';
import PrivetChat from './overview/PrivetChat';
import GroupChat from './overview/GroupChat';
import AllContacts from './overview/AllContacts';
import { AutoComplete } from '../../components/autoComplete/autoComplete';
import { Main } from '../styled';
import { Button } from '../../components/buttons/buttons';
import { Cards } from '../../components/cards/frame/cards-frame';
import { PageHeader } from '../../components/page-headers/page-headers';

import { ShareButtonPageHeader } from '../../components/buttons/share-button/share-button';
import { ExportButtonPageHeader } from '../../components/buttons/export-button/export-button';
import { CalendarButtonPageHeader } from '../../components/buttons/calendar-button/calendar-button';

// Direct imports - no lazy loading needed since route already uses dynamic()
import SingleChat from './overview/singleChat';
import SingleGroup from './overview/SingleGroupChat';

function ChatApp() {
  const pathname = usePathname();
  const params = useParams();

  const { rtl, searchData } = useSelector(state => {
    return {
      rtl: state.ChangeLayoutMode.rtlData,
      searchData: state.headerSearchData,
    };
  }, shallowEqual);
  const left = !rtl ? 'left' : 'right';
  const [state, setState] = useState({
    search: searchData,
    me: 'woadud@gmail.com',
  });
  
  const chatPath = '/admin/main/chat';

  const { notData } = state;

  // Determine current sidebar view from pathname
  const sidebarView = useMemo(() => {
    if (!pathname) return 'private';
    const path = pathname.toLowerCase();
    if (path.includes('/group')) return 'group';
    if (path.includes('/all')) return 'all';
    return 'private'; // default
  }, [pathname]);

  // Determine current chat type from pathname
  const chatType = useMemo(() => {
    if (!pathname) return null;
    const path = pathname.toLowerCase();
    if (path.includes('/private/')) return 'private';
    if (path.includes('/group/')) return 'group';
    if (path.includes('/all/')) return 'all';
    return null;
  }, [pathname]);

  const patternSearch = searchText => {
    const data = searchData.filter(item => item.title.toUpperCase().startsWith(searchText.toUpperCase()));
    setState({
      ...state,
      search: data,
    });
  };

  const renderView = ({ style, ...reset }) => {
    const customStyle = {
      marginRight: 'auto',
      [rtl ? 'left' : 'right']: '2px',
      [rtl ? 'marginLeft' : 'marginRight']: '-19px',
    };
    return <div {...reset} style={{ ...style, ...customStyle }} />;
  };

  const renderThumbVertical = ({ style, ...reset }) => {
    const thumbStyle = {
      borderRadius: 6,
      backgroundColor: '#F1F2F6',
      [left]: '2px',
    };
    return <div style={{ ...style, ...thumbStyle }} {...reset} />;
  };

  const renderTrackVertical = () => {
    const thumbStyle = {
      position: 'absolute',
      width: '6px',
      transition: 'opacity 200ms ease 0s',
      opacity: 0,
      [rtl ? 'left' : 'right']: '6px',
      bottom: '2px',
      top: '2px',
      borderRadius: '3px',
    };
    return <div style={thumbStyle} />;
  };

  const renderThumbHorizontal = ({ style, ...reset }) => {
    const thumbStyle = {
      borderRadius: 6,
      backgroundColor: '#F1F2F6',
    };
    return <div style={{ ...style, ...thumbStyle }} {...reset} />;
  };

  return (
    <>
      <PageHeader
        ghost
        title="Chat"
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
        <Row gutter={30}>
          <Col xxl={7} lg={10} xs={24}>
            <ChatSidebar>
              <Cards headless>
                <div className="chatbox-search">
                  <AutoComplete onSearch={patternSearch} dataSource={notData} width="100%" patterns />
                </div>
                <nav>
                  <UL>
                    <li>
                      <NextNavLink to={`${chatPath}/private/rofiq@gmail.com`} className={sidebarView === 'private' ? "active" : ""}>
                        Private Chat
                      </NextNavLink>
                    </li>
                    <li>
                      <NextNavLink to={`${chatPath}/group/1`} className={sidebarView === 'group' ? "active" : ""}>
                        Group Chat
                        <Badge className="badge-error" count={3} />
                      </NextNavLink>
                    </li>
                    <li>
                      <NextNavLink to={`${chatPath}/all/rofiq@gmail.com`} className={sidebarView === 'all' ? "active" : ""}>
                        All Contacts
                      </NextNavLink>
                    </li>
                  </UL>
                </nav>
                <Content>
                  <Scrollbars
                    className="custom-scrollbar"
                    autoHide
                    autoHideTimeout={500}
                    autoHideDuration={200}
                    renderThumbHorizontal={renderThumbHorizontal}
                    renderThumbVertical={renderThumbVertical}
                    renderView={renderView}
                    renderTrackVertical={renderTrackVertical}
                  >
                    {sidebarView === 'group' && <GroupChat />}
                    {sidebarView === 'all' && <AllContacts />}
                    {sidebarView === 'private' && <PrivetChat />}
                  </Scrollbars>
                </Content>
              </Cards>
            </ChatSidebar>
          </Col>
          <Col xxl={17} lg={14} xs={24}>
            {chatType === 'group' && <SingleGroup />}
            {(chatType === 'private' || chatType === 'all' || !chatType) && <SingleChat />}
          </Col>
        </Row>
      </Main>
    </>
  );
}

export default ChatApp;
