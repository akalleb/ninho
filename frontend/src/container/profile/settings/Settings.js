'use client';

import React, { useMemo } from 'react';
import { Row, Col } from 'antd';
import { usePathname } from 'next/navigation';
import { SettingWrapper } from './overview/style';
import { PageHeader } from '../../../components/page-headers/page-headers';
import { Main } from '../../styled';

// Direct imports - no lazy loading needed since route already uses dynamic()
import Profile from './overview/Profile';
import Account from './overview/Account';
import Password from './overview/Passwoard';
import AuthorBox from './overview/ProfileAuthorBox';
import CoverSection from '../overview/CoverSection';

function Settings() {
  const pathname = usePathname();

  // Determine current view from pathname
  const currentView = useMemo(() => {
    if (!pathname) return 'profile';
    const path = pathname.toLowerCase();
    if (path.includes('/account')) return 'account';
    if (path.includes('/password')) return 'password';
    return 'profile'; // default
  }, [pathname]);

  return (
    <>
      <PageHeader
        ghost
        title="Configurações de Perfil"
      />

      <Main>
        <Row gutter={25}>
          <Col xxl={6} lg={8} md={10} xs={24}>
            <AuthorBox />
          </Col>
          <Col xxl={18} lg={16} md={14} xs={24}>
            <SettingWrapper>
              <CoverSection />
              {currentView === 'account' && <Account />}
              {currentView === 'password' && <Password />}
              {currentView === 'profile' && <Profile />}
            </SettingWrapper>
          </Col>
        </Row>
      </Main>
    </>
  );
}

export default Settings;
