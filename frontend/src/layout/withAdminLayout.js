/* eslint-disable no-shadow */
import React, { Component, useEffect, useMemo, useState } from 'react';
import Image from 'next/image';
import { Layout, Button, Row, Col, Spin, Card, Statistic, Progress, Alert } from 'antd';
import FeatherIcon from 'feather-icons-react';
import FontAwesome from 'react-fontawesome';
import { NextNavLink, NextLink } from '../components/utilities/NextLink';
import { ThemeProvider } from 'styled-components';
import { connect } from 'react-redux';
import propTypes from 'prop-types';
import { Div, SmallScreenAuthInfo, SmallScreenSearch, TopMenuSearch } from './style';
import { changeRtlMode, changeLayoutMode, changeMenuMode } from '../redux/themeLayout/actionCreator';
import { darkTheme } from '../config/theme/themeVariables';
import { getImageUrl } from '../utility/getImageUrl';
import { canAccessPath, hasPageAccess } from '../utility/accessControl';
import api from '../config/api/axios';

// Eager load layout components - they're needed on every page anyway
// This eliminates lazy loading delays on every route change
import MenueItems from './MenueItems';
import TopMenu from './TopMenu';
import HeaderSearch from '../components/header-search/header-search';
import AuthInfo from '../components/utilities/auth-info/info';

// Note: Images are now loaded via getImageUrl utility for Next.js compatibility

const { Header, Footer, Sider, Content } = Layout;
// const { darkMode } = config;

function AccessFallbackDashboard({ authUser }) {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [stats, setStats] = useState({
    families: null,
    children: null,
    queue: null,
    wallets: null,
    notifications: null,
  });

  const canFamilies = hasPageAccess(authUser, 'families');
  const canChildren = hasPageAccess(authUser, 'children_admin') || hasPageAccess(authUser, 'my_patients');
  const canQueue = hasPageAccess(authUser, 'queue_admin') || hasPageAccess(authUser, 'queue_health');
  const canWallets = hasPageAccess(authUser, 'wallets');
  const canNotifications = hasPageAccess(authUser, 'notifications');

  useEffect(() => {
    let isMounted = true;

    const toCount = (data) => {
      if (Array.isArray(data)) return data.length;
      if (typeof data === 'number') return data;
      if (typeof data?.count === 'number') return data.count;
      if (typeof data?.total === 'number') return data.total;
      if (Array.isArray(data?.items)) return data.items.length;
      return 0;
    };

    const load = async () => {
      setLoading(true);
      setError('');
      try {
        const requests = [];
        if (canFamilies) requests.push(['families', api.get('/families/count')]);
        if (canChildren) requests.push(['children', api.get('/children/count')]);
        if (canQueue) requests.push(['queue', api.get('/queue/')]);
        if (canWallets) requests.push(['wallets', api.get('/wallets/')]);
        if (canNotifications && authUser?.professional_id) {
          requests.push([
            'notifications',
            api.get(`/notifications/?active_only=true&target=admin&professional_id=${authUser.professional_id}`),
          ]);
        }

        const settled = await Promise.allSettled(requests.map(([, p]) => p));
        if (!isMounted) return;
        const next = { families: null, children: null, queue: null, wallets: null, notifications: null };
        settled.forEach((res, idx) => {
          const key = requests[idx][0];
          if (res.status === 'fulfilled') {
            next[key] = toCount(res.value?.data);
          } else {
            next[key] = null;
          }
        });
        setStats(next);
      } catch (e) {
        if (isMounted) setError('Não foi possível carregar indicadores resumidos.');
      } finally {
        if (isMounted) setLoading(false);
      }
    };

    load();
    return () => {
      isMounted = false;
    };
  }, [
    canFamilies,
    canChildren,
    canQueue,
    canWallets,
    canNotifications,
    authUser?.professional_id,
  ]);

  const indicators = useMemo(
    () => [
      { key: 'families', title: 'Famílias', value: stats.families, enabled: canFamilies, color: '#5F63F2' },
      { key: 'children', title: 'Crianças', value: stats.children, enabled: canChildren, color: '#20C997' },
      { key: 'queue', title: 'Fila', value: stats.queue, enabled: canQueue, color: '#FA8B0C' },
      { key: 'wallets', title: 'Carteiras', value: stats.wallets, enabled: canWallets, color: '#722ED1' },
      {
        key: 'notifications',
        title: 'Notificações',
        value: stats.notifications,
        enabled: canNotifications,
        color: '#FF4D4F',
      },
    ].filter((item) => item.enabled),
    [stats, canFamilies, canChildren, canQueue, canWallets, canNotifications],
  );

  const maxValue = Math.max(1, ...indicators.map((i) => (typeof i.value === 'number' ? i.value : 0)));

  const filledIndicators = indicators.filter((item) => typeof item.value === 'number');
  const totalIndicators = indicators.length || 1;
  const averageValue =
    filledIndicators.length > 0
      ? Math.round(
          filledIndicators.reduce((acc, item) => acc + (item.value || 0), 0) / filledIndicators.length,
        )
      : 0;

  return (
    <div style={{ padding: '24px' }}>
      {error ? <Alert type="warning" showIcon message={error} style={{ marginBottom: 16 }} /> : null}

      <Row gutter={16} style={{ marginBottom: 8 }}>
        <Col xs={24} md={12} lg={8} style={{ marginBottom: 16 }}>
          <Card variant="borderless">
            <Statistic title="Módulos Acessíveis" value={filledIndicators.length} suffix={`/ ${totalIndicators}`} />
            <Progress
              style={{ marginTop: 12 }}
              percent={Math.round((filledIndicators.length / totalIndicators) * 100)}
              strokeColor="#1677ff"
              showInfo={false}
            />
          </Card>
        </Col>
        <Col xs={24} md={12} lg={8} style={{ marginBottom: 16 }}>
          <Card variant="borderless">
            <Statistic title="Média de Registros" value={loading ? '...' : averageValue} />
            <Progress
              style={{ marginTop: 12 }}
              percent={Math.min(100, averageValue)}
              strokeColor="#722ED1"
              showInfo={false}
            />
          </Card>
        </Col>
      </Row>

      <Row gutter={16}>
        {indicators.map((item) => (
          <Col key={item.key} xs={24} md={12} lg={8} style={{ marginBottom: 16 }}>
            <Card variant="borderless">
              <Statistic
                title={item.title}
                value={typeof item.value === 'number' ? item.value : loading ? '...' : 0}
                valueStyle={{ color: item.color }}
              />
              <Progress
                style={{ marginTop: 12 }}
                percent={typeof item.value === 'number' ? Math.round((item.value / maxValue) * 100) : 0}
                strokeColor={item.color}
                showInfo={false}
              />
            </Card>
          </Col>
        ))}
      </Row>
    </div>
  );
}

const ThemeLayout = (WrappedComponent) => {
 
  class LayoutComponent extends Component {
    constructor(props) {
      super(props);
      this.state = {
        collapsed: false,
        hide: true,
        searchHide: true,
        customizerAction: false,
        activeSearch: false,
        windowWidth: typeof window !== 'undefined' ? window.innerWidth : 1920, // Default to desktop width for SSR
        isClient: false,
      };
      this.updateDimensions = this.updateDimensions.bind(this);
    }

    componentDidMount() {
      // Set initial window width for client-side
      this.setState({ windowWidth: window.innerWidth, isClient: true });
      window.addEventListener('resize', this.updateDimensions);
      this.updateDimensions();
    }

    componentWillUnmount() {
      window.removeEventListener('resize', this.updateDimensions);
    }

    updateDimensions() {
      const windowWidth = window.innerWidth;
      this.setState({
        collapsed: windowWidth <= 1200 && true,
        windowWidth,
      });
    }

    render() {
      const { collapsed, hide, searchHide, customizerAction, activeSearch, windowWidth, isClient } = this.state;
      const { ChangeLayoutMode, rtl, changeRtl, changeLayout, topMenu, changeMenuMode, authLogin } = this.props;

      const left = !rtl ? 'left' : 'right';
      const darkMode = ChangeLayoutMode;
      const authUser =
        isClient && typeof authLogin === 'object' && authLogin ? authLogin : null;
      const userRole = authUser?.role || null;
      const logoHref = userRole === 'health' ? '/cuidados' : '/admin';
      const currentPath = isClient && typeof window !== 'undefined' ? window.location.pathname : '';
      const blockedByAccess = !!authUser && !!currentPath && !canAccessPath(authUser, currentPath);
      
      // Get logo URLs from public folder with base path support using utility function
      const logoDarkUrl = getImageUrl('static/img/Logo_Dark.svg');
      const logoWhiteUrl = getImageUrl('static/img/Logo_white.png');
      
      // Get menu icon URLs from public folder
      const iconLeftUrl = getImageUrl('static/img/icon/left.svg');
      const iconRightUrl = getImageUrl('static/img/icon/right.svg');
      
      const toggleCollapsed = () => {
        // Toggle sidebar collapse on all screen sizes
        this.setState((prevState) => ({
          collapsed: !prevState.collapsed,
        }));
      };

      const toggleCollapsedMobile = () => {
        // Toggle sidebar collapse on mobile screens
        if (windowWidth <= 990) {
          this.setState((prevState) => ({
            collapsed: !prevState.collapsed,
          }));
        }
      };

      const onShowHide = () => {
        this.setState({
          hide: !hide,
          searchHide: true,
        });
      };

      const showCustomizer = () => {
        this.setState({
          customizerAction: !customizerAction,
        });
      };

      const toggleSearch = () => {
        this.setState({
          activeSearch: !activeSearch,
        });
      };

      const handleSearchHide = (e) => {
        e.preventDefault();
        this.setState({
          searchHide: !searchHide,
          hide: true,
        });
      };

      const footerStyle = {
        padding: '20px 30px 18px',
        color: 'rgba(0, 0, 0, 0.65)',
        fontSize: '14px',
        background: 'rgba(255, 255, 255, .90)',
        width: '100%',
        boxShadow: '0 -5px 10px rgba(146,153,184, 0.05)',
      };

      const SideBarStyle = {
        margin: '63px 0 0 0',
        padding: '15px 15px 55px 15px',
        overflowY: 'auto',
        height: '100vh',
        position: 'fixed',
        [left]: 0,
        zIndex: 998,
      };

      const onRtlChange = () => {
        if (typeof window !== 'undefined') {
          const html = document.querySelector('html');
          if (html) {
            html.setAttribute('dir', 'rtl');
          }
        }
        changeRtl(true);
      };

      const onLtrChange = () => {
        if (typeof window !== 'undefined') {
          const html = document.querySelector('html');
          if (html) {
            html.setAttribute('dir', 'ltr');
          }
        }
        changeRtl(false);
      };

      const modeChangeDark = () => {
        changeLayout(true);
      };

      const modeChangeLight = () => {
        changeLayout(false);
      };

      const modeChangeTopNav = () => {
        changeMenuMode(true);
      };

      const modeChangeSideNav = () => {
        changeMenuMode(false);
      };

      const onEventChange = {
        onRtlChange,
        onLtrChange,
        modeChangeDark,
        modeChangeLight,
        modeChangeTopNav,
        modeChangeSideNav,
      };

      // Create theme object with topMenu and rtl for styled components
      const layoutTheme = {
        ...darkTheme,
        topMenu,
        rtl,
      };

      return (
        <ThemeProvider theme={layoutTheme}>
          <Div darkMode={darkMode}>
            <Layout className="layout">
            <Header
              style={{
                position: 'fixed',
                width: '100%',
                top: 0,
                [!rtl ? 'left' : 'right']: 0,
              }}
            >
              <Row>
                <Col lg={!topMenu ? 4 : 3} sm={6} xs={12} className="align-center-v navbar-brand">
                  {!topMenu || windowWidth <= 991 ? (
                    <Button type="link" onClick={toggleCollapsed}>
                      <Image src={collapsed ? iconRightUrl : iconLeftUrl} alt="menu" width={16} height={16} />
                    </Button>
                  ) : null}
                  <NextLink
                    className={topMenu && windowWidth > 991 ? 'striking-logo top-menu' : 'striking-logo'}
                    href={logoHref}
                    activeClassName=""
                  >
                    <Image
                      src={!darkMode ? logoDarkUrl : logoWhiteUrl}
                      alt="StrikingDash Logo"
                      width={120}
                      height={34}
                      onError={(e) => {
                        e.target.style.display = 'none';
                      }}
                      priority={true}
                    />
                  </NextLink>
                </Col>

                <Col lg={!topMenu ? 14 : 15} md={8} sm={0} xs={0}>
                  {topMenu && windowWidth > 991 ? (
                    <TopMenu />
                  ) : (
                    <HeaderSearch rtl={rtl} darkMode={darkMode} />
                  )}
                </Col>

                <Col lg={6} md={10} sm={0} xs={0}>
                  {topMenu && windowWidth > 991 ? (
                    <TopMenuSearch>
                      <div className="top-right-wrap d-flex">
                        <AuthInfo />
                      </div>
                    </TopMenuSearch>
                  ) : (
                    <AuthInfo />
                  )}
                </Col>

                <Col md={0} sm={18} xs={12}>
                  <div className="mobile-action">
                    <NextLink className="btn-search" onClick={handleSearchHide} href="#">
                      {searchHide ? <FeatherIcon icon="search" /> : <FeatherIcon icon="x" />}
                    </NextLink>
                    <NextLink className="btn-auth" onClick={onShowHide} href="#">
                      <FeatherIcon icon="more-vertical" />
                    </NextLink>
                  </div>
                </Col>
              </Row>
            </Header>
            <div className="header-more">
              <Row>
                <Col md={0} sm={24} xs={24}>
                  <div className="small-screen-headerRight">
                    <SmallScreenSearch hide={searchHide} darkMode={darkMode}>
                      <HeaderSearch rtl={rtl} />
                    </SmallScreenSearch>
                    <SmallScreenAuthInfo hide={hide} darkMode={darkMode}>
                      <AuthInfo rtl={rtl} />
                    </SmallScreenAuthInfo>
                  </div>
                </Col>
              </Row>
            </div>
            <Layout>
              {!topMenu || windowWidth <= 991 ? (
                <ThemeProvider theme={darkTheme}>
                  <Sider width={280} style={SideBarStyle} collapsed={collapsed} theme={!darkMode ? 'light' : 'dark'}>
                    <div className="custom-scrollbar">
                      <p className="sidebar-nav-title">MAIN MENU</p>
                      <MenueItems
                        topMenu={topMenu}
                        rtl={rtl}
                        toggleCollapsed={toggleCollapsedMobile}
                        darkMode={darkMode}
                        events={onEventChange}
                      />
                    </div>
                  </Sider>
                </ThemeProvider>
              ) : null}
              <Layout className="atbd-main-layout">
                <Content>
                 
                  {blockedByAccess ? (
                    <AccessFallbackDashboard authUser={authUser} />
                  ) : (
                    <WrappedComponent {...this.props} />
                  )}
                  <Footer className="admin-footer" style={footerStyle}>
                    <Row>
                      <Col md={12} xs={24}>
                        <span className="admin-footer__copyright">2026 © PluckStudio</span>
                      </Col>
                      <Col md={12} xs={24}>
                        <div className="admin-footer__links">
                          <NextNavLink href="#">Sobre</NextNavLink>
                          <NextNavLink href="#">Contato</NextNavLink>
                        </div>
                      </Col>
                    </Row>
                  </Footer>
                </Content>
              </Layout>
            </Layout>
          </Layout>
          <div className={`${customizerAction ? 'customizer-wrapper show' : 'customizer-wrapper'}`} />
          <span className={`${customizerAction ? 'overlay-dark show' : 'overlay-dark'}`} aria-hidden="true" />
          </Div>
        </ThemeProvider>
      );
    }
  }

  const mapStateToProps = (state) => {
    return {
      ChangeLayoutMode: state.ChangeLayoutMode.data,
      rtl: state.ChangeLayoutMode.rtlData,
      topMenu: state.ChangeLayoutMode.topMenu,
      authLogin: state.auth && state.auth.login ? state.auth.login : null,
    };
  };

  const mapStateToDispatch = (dispatch) => {
    return {
      changeRtl: (rtl) => dispatch(changeRtlMode(rtl)),
      changeLayout: (show) => dispatch(changeLayoutMode(show)),
      changeMenuMode: (show) => dispatch(changeMenuMode(show)),
    };
  };

  LayoutComponent.propTypes = {
    ChangeLayoutMode: propTypes.bool,
    rtl: propTypes.bool,
    topMenu: propTypes.bool,
    changeRtl: propTypes.func,
    changeLayout: propTypes.func,
    changeMenuMode: propTypes.func,
    authLogin: propTypes.oneOfType([propTypes.object, propTypes.bool]),
  };

  const ConnectedLayout = connect(mapStateToProps, mapStateToDispatch)(LayoutComponent);
  return ConnectedLayout;
};

// Export the base layout HOC
export { ThemeLayout as withAdminLayoutBase };

// Default export wraps with Router for Next.js compatibility
const withAdminLayoutDefault = (WrappedComponent) => {
  const WrappedWithLayout = ThemeLayout(WrappedComponent);
  
  // Return a component that checks if we need Router wrapper
  return function AdminLayoutWithOptionalRouter(props) {
    // If MemoryRouter is already imported, try to wrap
    // This will be handled at the page level for Next.js
    return <WrappedWithLayout {...props} />;
  };
};

export default ThemeLayout;
