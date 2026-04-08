'use client';

import React, { useMemo } from 'react';
import { Row, Col, Spin } from 'antd';
import { usePathname } from 'next/navigation';
import { NextNavLink } from '../../components/utilities/NextLink';
import FeatherIcon from 'feather-icons-react';
import { AddUser } from './style';
import { PageHeader } from '../../components/page-headers/page-headers';
import { Cards } from '../../components/cards/frame/cards-frame';
import { Main } from '../styled';

// Direct imports - no lazy loading needed since route already uses dynamic()
import Info from './overview/info';
import Work from './overview/work';
import Social from './overview/Social';

function AddNew() {
  const pathname = usePathname();

  // Determine current view from pathname
  const currentView = useMemo(() => {
    if (!pathname) return 'info';
    const path = pathname.toLowerCase();
    if (path.includes('/work')) return 'work';
    if (path.includes('/social')) return 'social';
    return 'info'; // default
  }, [pathname]);

  return (
    <>
      <PageHeader ghost title="Add User" />
      <Main>
        <Row gutter={15}>
          <Col xs={24}>
            <AddUser>
              <Cards
                title={
                  <div className="card-nav">
                    <ul>
                      <li>
                        <NextNavLink to="/admin/users/add-user/info">
                          <FeatherIcon icon="user" size={14} />
                          Personal Info
                        </NextNavLink>
                      </li>
                      <li>
                        <NextNavLink to="/admin/users/add-user/work">
                          <FeatherIcon icon="briefcase" size={14} />
                          Work Info
                        </NextNavLink>
                      </li>
                      <li>
                        <NextNavLink to="/admin/users/add-user/social">
                          <FeatherIcon icon="share-2" size={14} />
                          Social
                        </NextNavLink>
                      </li>
                    </ul>
                  </div>
                }
              >
                {currentView === 'work' && <Work />}
                {currentView === 'social' && <Social />}
                {currentView === 'info' && <Info />}
              </Cards>
            </AddUser>
          </Col>
        </Row>
      </Main>
    </>
  );
}

export default AddNew;
