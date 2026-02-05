'use client';

import React, { useState, useLayoutEffect } from 'react';
import { Row, Col, Spin } from 'antd';
import { useParams } from 'next/navigation';
import FeatherIcon from 'feather-icons-react';
import EmailNavbar from './overview/Navbar';
import ComposeMail from './overview/Compose';
import { EmailWrapper, MailSideBar } from './overview/style';
import { PageHeader } from '../../components/page-headers/page-headers';
import { Cards } from '../../components/cards/frame/cards-frame';
import { Main } from '../styled';
import { Button } from '../../components/buttons/buttons';
import { ShareButtonPageHeader } from '../../components/buttons/share-button/share-button';
import { ExportButtonPageHeader } from '../../components/buttons/export-button/export-button';
import { CalendarButtonPageHeader } from '../../components/buttons/calendar-button/calendar-button';

// Direct imports - no lazy loading needed since route already uses dynamic()
import Inbox from './overview/Inbox';
import Sent from './overview/Sent';
import Draft from './overview/Draft';
import Starred from './overview/Starred';
import Trash from './overview/Trash';
import Spam from './overview/Spam';
import MailDetailView from './overview/MailDetailView';

const Email = () => {
  const params = useParams();
  const [isMailEditorOpen, setMailEditorStatus] = useState(false);
  // Initialize with window width if available (client-side), otherwise default to desktop width
  const [state, setState] = useState({
    responsive: typeof window !== 'undefined' ? window.innerWidth : 1200,
    collapsed: false,
  });
  const { responsive, collapsed } = state;

  useLayoutEffect(() => {
    function updateSize() {
      if (typeof window !== 'undefined') {
        const width = window.innerWidth;
        setState(prevState => ({ ...prevState, responsive: width }));
      }
    }
    if (typeof window !== 'undefined') {
      window.addEventListener('resize', updateSize);
      updateSize();
      return () => window.removeEventListener('resize', updateSize);
    }
  }, []);

  const toggleCollapsed = () => {
    setState(prevState => ({
      ...prevState,
      collapsed: !prevState.collapsed,
    }));
  };

  const toggleMailComposer = () => {
    setMailEditorStatus(!isMailEditorOpen);
  };

  const closeMailComposr = () => {
    setMailEditorStatus(false);
  };

  const pathName = '/admin/email/';

  // Get slug from params (route uses [[...slug]] pattern)
  const slug = params?.slug || [];
  const firstSlug = Array.isArray(slug) ? slug[0] : slug || 'inbox';
  const secondSlug = Array.isArray(slug) ? slug[1] : null;

  // Render component based on slug parameter
  const renderEmailContent = () => {
    // Check if viewing single email (second slug is the id, e.g., /admin/email/inbox/123)
    if (secondSlug || (firstSlug && firstSlug.match(/^\d+$/))) {
      return <MailDetailView />;
    }
    
    // Otherwise render based on first slug
    switch (firstSlug) {
      case 'sent':
        return <Sent />;
      case 'drafts':
      case 'draft':
        return <Draft />;
      case 'starred':
        return <Starred />;
      case 'spam':
        return <Spam />;
      case 'trash':
        return <Trash />;
      case 'inbox':
      default:
        return <Inbox />;
    }
  };

  return (
    <>
      <PageHeader
        ghost
        title={secondSlug || (firstSlug && firstSlug.match(/^\d+$/)) ? 'Email Details' : (firstSlug || 'inbox')}
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
      {isMailEditorOpen && <ComposeMail close={closeMailComposr} />}

      <Main>
        <EmailWrapper>
          <Row className="justify-content-center" gutter={25}>
            <Col className="trigger-col" xxl={5} xl={7} lg={8} xs={24}>
              {responsive <= 991 && (
                <Button type="link" className="mail-sidebar-trigger mt-0" onClick={toggleCollapsed}>
                  <FeatherIcon icon={collapsed ? 'align-left' : 'align-right'} />
                </Button>
              )}

              {responsive > 991 ? (
                <div className="mail-sideabr">
                  <Cards headless>
                    <div className="mail-sidebar-top">
                      <Button onClick={toggleMailComposer} shape="round" type="primary" size="default" block>
                        <FeatherIcon icon="plus" size={18} /> Compose
                      </Button>
                    </div>

                    <div className="mail-sidebar-bottom">
                      <EmailNavbar path={pathName} />
                    </div>
                  </Cards>
                </div>
              ) : (
                <MailSideBar className={collapsed ? 'mail-sideabr show' : 'mail-sideabr hide'}>
                  <Cards headless>
                    <Button
                      type="link"
                      className="mail-sidebar-trigger trigger-close"
                      className="mt-0"
                      onClick={toggleCollapsed}
                    >
                      <FeatherIcon icon="x" />
                    </Button>
                    <div className="mail-sidebar-top">
                      <Button onClick={toggleMailComposer} shape="round" type="primary" size="default" block>
                        + Compose
                      </Button>
                    </div>

                    <div className="mail-sidebar-bottom">
                      <EmailNavbar path={pathName} toggleCollapsed={toggleCollapsed} />
                    </div>
                  </Cards>
                </MailSideBar>
              )}
            </Col>

            <Col xxl={19} xl={17} lg={16}>
              {renderEmailContent()}
            </Col>
          </Row>
        </EmailWrapper>
      </Main>
    </>
  );
};

export default Email;
