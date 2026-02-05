/* eslint-disable jsx-a11y/control-has-associated-label */
import React, { useState, useLayoutEffect } from 'react';
import { NextLink } from '../../../components/utilities/NextLink';
import FeatherIcon from 'feather-icons-react';
import SingleKnowledgeDetails from './overview/SingleKnowledge/SingleKnowledgeDetails';
import GeneralKnowledgeTop from './overview/GeneralKnowledgeTop';
import { KnowledgebaseArticleWrap, SingleKnowledgeContent, SidebarNavWrap } from './style';
import { PageHeader } from '../../../components/page-headers/page-headers';
import { Button } from '../../../components/buttons/buttons';
import { Main } from '../../styled';
import { ShareButtonPageHeader } from '../../../components/buttons/share-button/share-button';
import { ExportButtonPageHeader } from '../../../components/buttons/export-button/export-button';
import { CalendarButtonPageHeader } from '../../../components/buttons/calendar-button/calendar-button';

function SingleKnowledge() {
  const [state, setState] = useState({
    responsive: 0,
    collapsed: false,
  });
  const [open, setOpen] = useState('menu1');
  const { responsive, collapsed } = state;

  useLayoutEffect(() => {
    function updateSize() {
      const width = window.innerWidth;
      setState({ responsive: width });
    }
    window.addEventListener('resize', updateSize);
    updateSize();
    return () => window.removeEventListener('resize', updateSize);
  }, []);

  const toggleCollapsed = () => {
    setState({
      ...state,
      collapsed: !collapsed,
    });
  };

  return (
    <>
      <PageHeader
        title="All Article"
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
        <GeneralKnowledgeTop />
        <KnowledgebaseArticleWrap>
          <div className="knowledgebase-article-container">
            <div className="sDash_paginaion">
              <ul>
                <li>
                  <NextLink className="active" to="/admin/pages/knowledgeBase/plugins">
                    Doc Home
                  </NextLink>
                </li>
                <li>
                  <span className="active cursor-pointer">
                    Switch between accounts
                  </span>
                </li>
                <li>
                  <span className="active cursor-pointer">
                    Introduction to Plugin
                  </span>
                </li>
                <li>
                  <span>Plugins</span>
                </li>
              </ul>
              {responsive <= 991 && (
                <Button type="primary" className="knowledge-sidebar-trigger" onClick={toggleCollapsed}>
                  <FeatherIcon icon={collapsed ? 'align-left' : 'align-right'} />
                </Button>
              )}
            </div>
            <SingleKnowledgeContent>
              {responsive > 991 ? (
                <SidebarNavWrap>
                  <div className="knowledge-sidebar">
                    <h4 className="knowledge-sidebar__title">Plugins</h4>
                    <ul>
                      <li>
                        <a href="#" onClick={() => setOpen('menu1')} className={`${open === 'menu1' ? 'active' : ''} cursor-pointer`}>
                          <FeatherIcon icon={open === 'menu1' ? 'chevron-down' : 'chevron-up'} size={14} />{' '}
                          <span className="menu-text">Introduction to Plugin</span>
                        </a>
                        <ul className={open === 'menu1' ? 'submenu show' : 'submenu'}>
                          <li>
                            <a href="#" className="active cursor-pointer">
                              Switch between accounts
                            </a>
                          </li>
                          <li>
                            <a href="#" className="cursor-pointer">Installing vendor marketplace lorem vendor marketplace </a>
                          </li>
                          <li>
                            <a href="#" className="cursor-pointer">Stop getting emails from lorem</a>
                          </li>
                          <li>
                            <a href="#" className="cursor-pointer">Threads to organize discussions</a>
                          </li>
                          <li>
                            <a href="#" className="cursor-pointer">Understand your actions in lorem</a>
                          </li>
                        </ul>
                      </li>
                      <li>
                        <a href="#" onClick={() => setOpen('menu2')} className={`${open === 'menu2' ? 'active' : ''} cursor-pointer`}>
                          <FeatherIcon icon={open === 'menu1' ? 'chevron-down' : 'chevron-up'} size={14} />{' '}
                          <span className="menu-text">Productivity tools for your Plugin admin & change password</span>
                        </a>
                        <ul className={open === 'menu2' ? 'submenu show' : 'submenu'}>
                          <li>
                            <a href="#" className="cursor-pointer">Switch between accounts</a>
                          </li>
                          <li>
                            <a href="#" className="cursor-pointer">Installing vendor marketplace lorem vendor marketplace </a>
                          </li>
                          <li>
                            <a href="#" className="cursor-pointer">Stop getting emails from lorem</a>
                          </li>
                          <li>
                            <a href="#" className="cursor-pointer">Threads to organize discussions</a>
                          </li>
                          <li>
                            <a href="#" className="cursor-pointer">Understand your actions in lorem</a>
                          </li>
                        </ul>
                      </li>
                      <li>
                        <a href="#" onClick={() => setOpen('menu3')} className={`${open === 'menu3' ? 'active' : ''} cursor-pointer`}>
                          <FeatherIcon icon={open === 'menu1' ? 'chevron-down' : 'chevron-up'} size={14} />{' '}
                          <span className="menu-text">Download, install, and upgrade</span>
                        </a>
                        <ul className={open === 'menu3' ? 'submenu show' : 'submenu'}>
                          <li>
                            <a href="#" className="cursor-pointer">Switch between accounts</a>
                          </li>
                          <li>
                            <a href="#" className="cursor-pointer">Installing vendor marketplace lorem vendor marketplace </a>
                          </li>
                          <li>
                            <a href="#" className="cursor-pointer">Stop getting emails from lorem</a>
                          </li>
                          <li>
                            <a href="#" className="cursor-pointer">Threads to organize discussions</a>
                          </li>
                        </ul>
                      </li>
                      <li>
                        <a href="#" onClick={() => setOpen('menu4')} className={`${open === 'menu4' ? 'active' : ''} cursor-pointer`}>
                          <FeatherIcon icon={open === 'menu1' ? 'chevron-down' : 'chevron-up'} size={14} />{' '}
                          <span className="menu-text">Explore plans & features</span>
                        </a>
                        <ul className={open === 'menu4' ? 'submenu show' : 'submenu'}>
                          <li>
                            <a href="#" className="cursor-pointer">Switch between accounts</a>
                          </li>
                          <li>
                            <a href="#" className="cursor-pointer">Installing vendor marketplace lorem vendor marketplace </a>
                          </li>
                          <li>
                            <a href="#" className="cursor-pointer">Stop getting emails from lorem</a>
                          </li>
                          <li>
                            <a href="#" className="cursor-pointer">Threads to organize discussions</a>
                          </li>
                        </ul>
                      </li>
                      <li>
                        <a href="#" onClick={() => setOpen('menu5')} className={`${open === 'menu5' ? 'active' : ''} cursor-pointer`}>
                          <FeatherIcon icon={open === 'menu1' ? 'chevron-down' : 'chevron-up'} size={14} />{' '}
                          <span className="menu-text">Explore plans & features</span>
                        </a>
                        <ul className={open === 'menu5' ? 'submenu show' : 'submenu'}>
                          <li>
                            <a href="#" className="cursor-pointer">Switch between accounts</a>
                          </li>
                          <li>
                            <a href="#" className="cursor-pointer">Installing vendor marketplace lorem vendor marketplace </a>
                          </li>
                          <li>
                            <a href="#" className="cursor-pointer">Stop getting emails from lorem</a>
                          </li>
                          <li>
                            <a href="#" className="cursor-pointer">Threads to organize discussions</a>
                          </li>
                        </ul>
                      </li>
                      <li>
                        <a href="#" onClick={() => setOpen('menu6')} className={`${open === 'menu6' ? 'active' : ''} cursor-pointer`}>
                          <FeatherIcon icon={open === 'menu1' ? 'chevron-down' : 'chevron-up'} size={14} />{' '}
                          <span className="menu-text">Profile Settings</span>
                        </a>
                        <ul className={open === 'menu6' ? 'submenu show' : 'submenu'}>
                          <li>
                            <a href="#" className="cursor-pointer">Switch between accounts</a>
                          </li>
                          <li>
                            <a href="#" className="cursor-pointer">Installing vendor marketplace lorem vendor marketplace </a>
                          </li>
                          <li>
                            <a href="#" className="cursor-pointer">Stop getting emails from lorem</a>
                          </li>
                          <li>
                            <a href="#" className="cursor-pointer">Threads to organize discussions</a>
                          </li>
                        </ul>
                      </li>
                      <li>
                        <a href="#" onClick={() => setOpen('menu7')} className={`${open === 'menu7' ? 'active' : ''} cursor-pointer`}>
                          <FeatherIcon icon={open === 'menu1' ? 'chevron-down' : 'chevron-up'} size={14} />{' '}
                          <span className="menu-text">Listings Management</span>
                        </a>
                        <ul className={open === 'menu7' ? 'submenu show' : 'submenu'}>
                          <li>
                            <a href="#" className="cursor-pointer">Switch between accounts</a>
                          </li>
                          <li>
                            <a href="#" className="cursor-pointer">Installing vendor marketplace lorem vendor marketplace </a>
                          </li>
                          <li>
                            <a href="#" className="cursor-pointer">Stop getting emails from lorem</a>
                          </li>
                          <li>
                            <a href="#" className="cursor-pointer">Threads to organize discussions</a>
                          </li>
                        </ul>
                      </li>
                      <li>
                        <a href="#" onClick={() => setOpen('menu8')} className={`${open === 'menu8' ? 'active' : ''} cursor-pointer`}>
                          <FeatherIcon icon={open === 'menu1' ? 'chevron-down' : 'chevron-up'} size={14} />{' '}
                          <span className="menu-text">Miscellaneous</span>
                        </a>
                        <ul className={open === 'menu8' ? 'submenu show' : 'submenu'}>
                          <li>
                            <a href="#" className="cursor-pointer">Switch between accounts</a>
                          </li>
                          <li>
                            <a href="#" className="cursor-pointer">Installing vendor marketplace lorem vendor marketplace </a>
                          </li>
                          <li>
                            <a href="#" className="cursor-pointer">Stop getting emails from lorem</a>
                          </li>
                          <li>
                            <a href="#" className="cursor-pointer">Threads to organize discussions</a>
                          </li>
                        </ul>
                      </li>
                    </ul>
                  </div>
                </SidebarNavWrap>
              ) : (
                <div className={collapsed ? 'knowledge-sidebar-wrap show' : 'knowledge-sidebar-wrap hide'}>
                  <SidebarNavWrap>
                    <div className="knowledge-sidebar">
                      <h4 className="knowledge-sidebar__title">
                        Plugins
                        <Button type="link" className="trigger-close" onClick={toggleCollapsed}>
                          <FeatherIcon icon="x" />
                        </Button>
                      </h4>
                      <ul>
                        <li>
                          <a href="#" onClick={() => setOpen('menu1')} className={`${open === 'menu1' ? 'active' : ''} cursor-pointer`}>
                            <FeatherIcon icon={open === 'menu1' ? 'chevron-down' : 'chevron-up'} size={14} />{' '}
                            <span className="menu-text">Introduction to Plugin</span>
                          </a>
                          <ul className={open === 'menu1' ? 'submenu show' : 'submenu'}>
                            <li>
                              <a href="#" className="active cursor-pointer">
                                Switch between accounts
                              </a>
                            </li>
                            <li>
                              <a href="#" className="cursor-pointer">Installing vendor marketplace lorem vendor marketplace </a>
                            </li>
                            <li>
                              <a href="#" className="cursor-pointer">Stop getting emails from lorem</a>
                            </li>
                            <li>
                              <a href="#" className="cursor-pointer">Threads to organize discussions</a>
                            </li>
                            <li>
                              <a href="#" className="cursor-pointer">Understand your actions in lorem</a>
                            </li>
                          </ul>
                        </li>
                        <li>
                          <a href="#" onClick={() => setOpen('menu2')} className={`${open === 'menu2' ? 'active' : ''} cursor-pointer`}>
                            <FeatherIcon icon={open === 'menu1' ? 'chevron-down' : 'chevron-up'} size={14} />{' '}
                            <span className="menu-text">
                              Productivity tools for your Plugin admin & change password
                            </span>
                          </a>
                          <ul className={open === 'menu2' ? 'submenu show' : 'submenu'}>
                            <li>
                              <a href="#" className="cursor-pointer">Switch between accounts</a>
                            </li>
                            <li>
                              <a href="#" className="cursor-pointer">Installing vendor marketplace lorem vendor marketplace </a>
                            </li>
                            <li>
                              <a href="#" className="cursor-pointer">Stop getting emails from lorem</a>
                            </li>
                            <li>
                              <a href="#" className="cursor-pointer">Threads to organize discussions</a>
                            </li>
                            <li>
                              <a href="#" className="cursor-pointer">Understand your actions in lorem</a>
                            </li>
                          </ul>
                        </li>
                        <li>
                          <a href="#" onClick={() => setOpen('menu3')} className={`${open === 'menu3' ? 'active' : ''} cursor-pointer`}>
                            <FeatherIcon icon={open === 'menu1' ? 'chevron-down' : 'chevron-up'} size={14} />{' '}
                            <span className="menu-text">Download, install, and upgrade</span>
                          </a>
                          <ul className={open === 'menu3' ? 'submenu show' : 'submenu'}>
                            <li>
                              <a href="#" className="cursor-pointer">Switch between accounts</a>
                            </li>
                            <li>
                              <a href="#" className="cursor-pointer">Installing vendor marketplace lorem vendor marketplace </a>
                            </li>
                            <li>
                              <a href="#" className="cursor-pointer">Stop getting emails from lorem</a>
                            </li>
                            <li>
                              <a href="#" className="cursor-pointer">Threads to organize discussions</a>
                            </li>
                          </ul>
                        </li>
                        <li>
                          <a href="#" onClick={() => setOpen('menu4')} className={`${open === 'menu4' ? 'active' : ''} cursor-pointer`}>
                            <FeatherIcon icon={open === 'menu1' ? 'chevron-down' : 'chevron-up'} size={14} />{' '}
                            <span className="menu-text">Explore plans & features</span>
                          </a>
                          <ul className={open === 'menu4' ? 'submenu show' : 'submenu'}>
                            <li>
                              <a href="#" className="cursor-pointer">Switch between accounts</a>
                            </li>
                            <li>
                              <a href="#" className="cursor-pointer">Installing vendor marketplace lorem vendor marketplace </a>
                            </li>
                            <li>
                              <a href="#" className="cursor-pointer">Stop getting emails from lorem</a>
                            </li>
                            <li>
                              <a href="#" className="cursor-pointer">Threads to organize discussions</a>
                            </li>
                          </ul>
                        </li>
                        <li>
                          <a href="#" onClick={() => setOpen('menu5')} className={`${open === 'menu5' ? 'active' : ''} cursor-pointer`}>
                            <FeatherIcon icon={open === 'menu1' ? 'chevron-down' : 'chevron-up'} size={14} />{' '}
                            <span className="menu-text">Explore plans & features</span>
                          </a>
                          <ul className={open === 'menu5' ? 'submenu show' : 'submenu'}>
                            <li>
                              <a href="#" className="cursor-pointer">Switch between accounts</a>
                            </li>
                            <li>
                              <a href="#" className="cursor-pointer">Installing vendor marketplace lorem vendor marketplace </a>
                            </li>
                            <li>
                              <a href="#" className="cursor-pointer">Stop getting emails from lorem</a>
                            </li>
                            <li>
                              <a href="#" className="cursor-pointer">Threads to organize discussions</a>
                            </li>
                          </ul>
                        </li>
                        <li>
                          <a href="#" onClick={() => setOpen('menu6')} className={`${open === 'menu6' ? 'active' : ''} cursor-pointer`}>
                            <FeatherIcon icon={open === 'menu1' ? 'chevron-down' : 'chevron-up'} size={14} />{' '}
                            <span className="menu-text">Profile Settings</span>
                          </a>
                          <ul className={open === 'menu6' ? 'submenu show' : 'submenu'}>
                            <li>
                              <a href="#" className="cursor-pointer">Switch between accounts</a>
                            </li>
                            <li>
                              <a href="#" className="cursor-pointer">Installing vendor marketplace lorem vendor marketplace </a>
                            </li>
                            <li>
                              <a href="#" className="cursor-pointer">Stop getting emails from lorem</a>
                            </li>
                            <li>
                              <a href="#" className="cursor-pointer">Threads to organize discussions</a>
                            </li>
                          </ul>
                        </li>
                        <li>
                          <a href="#" onClick={() => setOpen('menu7')} className={`${open === 'menu7' ? 'active' : ''} cursor-pointer`}>
                            <FeatherIcon icon={open === 'menu1' ? 'chevron-down' : 'chevron-up'} size={14} />{' '}
                            <span className="menu-text">Listings Management</span>
                          </a>
                          <ul className={open === 'menu7' ? 'submenu show' : 'submenu'}>
                            <li>
                              <a href="#" className="cursor-pointer">Switch between accounts</a>
                            </li>
                            <li>
                              <a href="#" className="cursor-pointer">Installing vendor marketplace lorem vendor marketplace </a>
                            </li>
                            <li>
                              <a href="#" className="cursor-pointer">Stop getting emails from lorem</a>
                            </li>
                            <li>
                              <a href="#" className="cursor-pointer">Threads to organize discussions</a>
                            </li>
                          </ul>
                        </li>
                        <li>
                          <a href="#" onClick={() => setOpen('menu8')} className={`${open === 'menu8' ? 'active' : ''} cursor-pointer`}>
                            <FeatherIcon icon={open === 'menu1' ? 'chevron-down' : 'chevron-up'} size={14} />{' '}
                            <span className="menu-text">Miscellaneous</span>
                          </a>
                          <ul className={open === 'menu8' ? 'submenu show' : 'submenu'}>
                            <li>
                              <a href="#" className="cursor-pointer">Switch between accounts</a>
                            </li>
                            <li>
                              <a href="#" className="cursor-pointer">Installing vendor marketplace lorem vendor marketplace </a>
                            </li>
                            <li>
                              <a href="#" className="cursor-pointer">Stop getting emails from lorem</a>
                            </li>
                            <li>
                              <a href="#" className="cursor-pointer">Threads to organize discussions</a>
                            </li>
                          </ul>
                        </li>
                      </ul>
                    </div>
                  </SidebarNavWrap>
                </div>
              )}

              <SingleKnowledgeDetails />
            </SingleKnowledgeContent>
          </div>
          <span
            role="button"
            tabIndex="0"
            onKeyPress={() => {}}
            className={collapsed ? 'sidebar-shade show' : 'sidebar-shade'}
            onClick={toggleCollapsed}
          />
        </KnowledgebaseArticleWrap>
      </Main>
    </>
  );
}

export default SingleKnowledge;
