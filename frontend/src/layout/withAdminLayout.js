/* eslint-disable no-shadow */
import React, { Component } from 'react';
import { Layout, Button, Row, Col, Spin } from 'antd';
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

// Eager load layout components - they're needed on every page anyway
// This eliminates lazy loading delays on every route change
import MenueItems from './MenueItems';
import TopMenu from './TopMenu';
import HeaderSearch from '../components/header-search/header-search';
import AuthInfo from '../components/utilities/auth-info/info';

// Note: Images are now loaded via getImageUrl utility for Next.js compatibility

const { Header, Footer, Sider, Content } = Layout;
// const { darkMode } = config;

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
                      <img src={collapsed ? iconRightUrl : iconLeftUrl} alt="menu" />
                    </Button>
                  ) : null}
                  <NextLink
                    className={topMenu && windowWidth > 991 ? 'striking-logo top-menu' : 'striking-logo'}
                    href={logoHref}
                    activeClassName=""
                  >
                    <img
                      src={!darkMode ? logoDarkUrl : logoWhiteUrl}
                      alt="StrikingDash Logo"
                      onError={(e) => {
                        // Fallback if image doesn't load
                        e.target.style.display = 'none';
                      }}
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
                 
                  <WrappedComponent {...this.props} />
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
