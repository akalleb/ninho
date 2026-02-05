'use client';

import React, { useMemo } from 'react';
import { Row, Col, Skeleton } from 'antd';
import FeatherIcon from 'feather-icons-react';
import { usePathname } from 'next/navigation';
import { NextNavLink } from '../../../components/utilities/NextLink';
import { SettingWrapper } from './overview/style';
import { PageHeader } from '../../../components/page-headers/page-headers';
import { Main } from '../../styled';
import { Cards } from '../../../components/cards/frame/cards-frame';
import { Button } from '../../../components/buttons/buttons';
import { ShareButtonPageHeader } from '../../../components/buttons/share-button/share-button';
import { ExportButtonPageHeader } from '../../../components/buttons/export-button/export-button';
import { CalendarButtonPageHeader } from '../../../components/buttons/calendar-button/calendar-button';

// Direct imports - no lazy loading needed since route already uses dynamic()
import UserCards from '../../pages/overview/UserCard';
import CoverSection from '../overview/CoverSection';
import UserBio from './overview/UserBio';
import dynamic from 'next/dynamic';

// Components using Redux need SSR disabled
// No loading state to prevent extra render cycles
const Overview = dynamic(() => import('./overview/Overview'), { 
  ssr: false 
});

const Timeline = dynamic(() => import('./overview/Timeline'), { 
  ssr: false 
});

const Activity = dynamic(() => import('./overview/Activity'), { 
  ssr: false 
});

function MyProfile() {
  const pathname = usePathname();

  // Determine current view from pathname
  const currentView = useMemo(() => {
    if (!pathname) return 'overview';
    const path = pathname.toLowerCase();
    if (path.includes('/timeline')) return 'timeline';
    if (path.includes('/activity')) return 'activity';
    return 'overview'; // default
  }, [pathname]);

  return (
    <>
      <PageHeader
        ghost
        title="My Profile"
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
          <Col xxl={6} lg={8} md={10} xs={24}>
            <UserCards
              user={{ name: 'Duran Clyton', designation: 'UI/UX Designer', img: 'static/img/users/1.png' }}
            />
            <UserBio />
          </Col>
          <Col xxl={18} lg={16} md={14} xs={24}>
            <SettingWrapper>
              <div className="coverWrapper">
                <CoverSection />
                <nav className="profileTab-menu">
                  <ul>
                    <li>
                      <NextNavLink to="/admin/profile/myProfile/overview">Overview</NextNavLink>
                    </li>
                    <li>
                      <NextNavLink to="/admin/profile/myProfile/timeline">Timeline</NextNavLink>
                    </li>
                    <li>
                      <NextNavLink to="/admin/profile/myProfile/activity">Activity</NextNavLink>
                    </li>
                  </ul>
                </nav>
              </div>
              {currentView === 'timeline' && <Timeline />}
              {currentView === 'activity' && <Activity />}
              {currentView === 'overview' && <Overview />}
            </SettingWrapper>
          </Col>
        </Row>
      </Main>
    </>
  );
}

MyProfile.propTypes = {
  // match: propTypes.object,
};

export default MyProfile;
