'use client';

import React, { useState, useLayoutEffect, useMemo } from 'react';
import { Row, Col, Form, Input, Select, Spin } from 'antd';
import { useSelector, useDispatch } from 'react-redux';
import FeatherIcon from 'feather-icons-react';
import { usePathname } from 'next/navigation';
import { NextNavLink } from '../../components/utilities/NextLink';
import { NoteNav, NoteWrapper, Bullet } from './style';
import { BasicFormWrapper, Main } from '../styled';
import { Button } from '../../components/buttons/buttons';
import { Cards } from '../../components/cards/frame/cards-frame';
import { PageHeader } from '../../components/page-headers/page-headers';
import { Modal } from '../../components/modals/antd-modals';
import { ShareButtonPageHeader } from '../../components/buttons/share-button/share-button';
import { ExportButtonPageHeader } from '../../components/buttons/export-button/export-button';
import { CalendarButtonPageHeader } from '../../components/buttons/calendar-button/calendar-button';
import { noteAddData } from '../../redux/note/actionCreator';
import { getImageUrl } from '../../utility/getImageUrl';

// Direct imports - no lazy loading needed since route already uses dynamic()
import All from './overview/all';
import Favorite from './overview/favorite';
import Personal from './overview/personal';
import Work from './overview/work';
import Social from './overview/social';
import Important from './overview/important';

const { Option } = Select;
function Note() {
  const pathname = usePathname();
  const { noteData } = useSelector((state) => {
    return {
      noteData: state.Note.data,
    };
  });
  const dispatch = useDispatch();
  const [form] = Form.useForm();
  const [state, setState] = useState({
    visible: false,
    modalType: 'primary',
    checked: [],
    responsive: 0,
    collapsed: false,
  });

  const { responsive, collapsed } = state;

  // Determine current view from pathname
  const currentView = useMemo(() => {
    if (!pathname) return 'all';
    const path = pathname.toLowerCase();
    if (path.includes('/favorite') || path.includes('/favourites')) return 'favorite';
    if (path.includes('/personal')) return 'personal';
    if (path.includes('/work')) return 'work';
    if (path.includes('/social')) return 'social';
    if (path.includes('/important')) return 'important';
    return 'all'; // default
  }, [pathname]);

  useLayoutEffect(() => {
    function updateSize() {
      const width = window.innerWidth;
      setState({ responsive: width });
    }
    window.addEventListener('resize', updateSize);
    updateSize();
    return () => window.removeEventListener('resize', updateSize);
  }, []);

  const showModal = () => {
    setState({
      ...state,
      visible: true,
    });
  };

  const onCancel = () => {
    setState({
      ...state,
      visible: false,
    });
  };

  const handleOk = (values) => {
    onCancel();
    const arrayData = [];
    noteData.map((data) => {
      return arrayData.push(data.key);
    });
    const max = Math.max(...arrayData);
    dispatch(
      noteAddData([
        ...noteData,
        {
          ...values,
          key: max + 1,
          time: new Date().getTime(),
          stared: false,
        },
      ]),
    );
    form.resetFields();
  };

  const handleCancel = () => {
    onCancel();
  };

  const toggleCollapsed = () => {
    setState({
      ...state,
      collapsed: !collapsed,
    });
  };

  const collapseSidebar = () => {
    setState({
      ...state,
      collapsed: false,
    });
  };

  return (
    <>
      <PageHeader
        ghost
        title="Note"
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
        <NoteWrapper>
          <Row className="justify-content-center" gutter={25}>
            <Col className="trigger-col" xxl={5} xl={7} lg={9} xs={24}>
              {responsive <= 991 && (
                <Button type="link" className="mail-sidebar-trigger mt-0" onClick={toggleCollapsed}>
                  <FeatherIcon icon={collapsed ? 'align-left' : 'align-right'} />
                </Button>
              )}
              {responsive > 991 ? (
                <div className="sidebar-card">
                  <Cards headless>
                    <div className="note-sidebar-top">
                      <Button onClick={showModal} shape="round" type="primary" size="default" block>
                        <FeatherIcon icon="plus" size={18} /> Add Notes
                      </Button>
                    </div>

                    <div className="note-sidebar-bottom">
                      <NoteNav>
                        <ul>
                          <li>
                            <NextNavLink to="/admin/app/note/all">
                              <FeatherIcon icon="edit" size={18} />
                              <span className="nav-text">
                                <span>All</span>
                              </span>
                            </NextNavLink>
                          </li>
                          <li>
                            <NextNavLink to="/admin/app/note/favorite">
                              <FeatherIcon icon="star" size={18} />
                              <span className="nav-text">
                                <span>Favorites</span>
                              </span>
                            </NextNavLink>
                          </li>
                        </ul>
                        <div className="nav-labels">
                          <p>
                            <img src={getImageUrl('static/img/icon/label.png')} alt="icon" /> Labels
                          </p>
                          <ul>
                            <li>
                              <NextNavLink to="/admin/app/note/personal">
                                <Bullet className="personal" /> Personal
                              </NextNavLink>
                            </li>
                            <li>
                              <NextNavLink to="/admin/app/note/work">
                                <Bullet className="work" /> Work
                              </NextNavLink>
                            </li>
                            <li>
                              <NextNavLink to="/admin/app/note/social">
                                <Bullet className="social" /> Social
                              </NextNavLink>
                            </li>
                            <li>
                              <NextNavLink to="/admin/app/note/important">
                                <Bullet className="important" /> Important
                              </NextNavLink>
                            </li>
                          </ul>
                        </div>
                      </NoteNav>
                    </div>
                  </Cards>
                </div>
              ) : (
                <div className={collapsed ? 'sidebar-card note-sideabr show' : 'sidebar-card note-sideabr hide'}>
                  <Cards headless>
                    <Button
                      type="link"
                      className="mail-sidebar-trigger trigger-close"
                      className="mt-0"
                      onClick={toggleCollapsed}
                    >
                      <FeatherIcon icon="x" />
                    </Button>
                    <div className="note-sidebar-top">
                      <Button onClick={showModal} shape="round" type="primary" size="default" block>
                        <FeatherIcon icon="plus" size={18} /> Add Notes
                      </Button>
                    </div>

                    <div className="note-sidebar-bottom">
                      <NoteNav>
                        <ul>
                          <li>
                            <NextNavLink to="/admin/app/note/all" onClick={collapseSidebar}>
                              <FeatherIcon icon="edit" size={18} />
                              <span className="nav-text">
                                <span>All</span>
                              </span>
                            </NextNavLink>
                          </li>
                          <li>
                            <NextNavLink to="/admin/app/note/favorite" onClick={collapseSidebar}>
                              <FeatherIcon icon="star" size={18} />
                              <span className="nav-text">
                                <span>Favorites</span>
                              </span>
                            </NextNavLink>
                          </li>
                        </ul>
                        <div className="nav-labels">
                          <p>
                            <img src={getImageUrl('static/img/icon/label.png')} alt="icon" /> Labels
                          </p>
                          <ul>
                            <li>
                              <NextNavLink to="/admin/app/note/personal" onClick={collapseSidebar}>
                                <Bullet className="personal" /> Personal
                              </NextNavLink>
                            </li>
                            <li>
                              <NextNavLink to="/admin/app/note/work" onClick={collapseSidebar}>
                                <Bullet className="work" /> Work
                              </NextNavLink>
                            </li>
                            <li>
                              <NextNavLink to="/admin/app/note/social" onClick={collapseSidebar}>
                                <Bullet className="social" /> Social
                              </NextNavLink>
                            </li>
                            <li>
                              <NextNavLink to="/admin/app/note/important" onClick={collapseSidebar}>
                                <Bullet className="important" /> Important
                              </NextNavLink>
                            </li>
                          </ul>
                        </div>
                      </NoteNav>
                    </div>
                  </Cards>
                </div>
              )}
            </Col>
            <Col xxl={19} xl={17} lg={15} xs={24}>
              {currentView === 'favorite' && <Favorite />}
              {currentView === 'personal' && <Personal />}
              {currentView === 'work' && <Work />}
              {currentView === 'social' && <Social />}
              {currentView === 'important' && <Important />}
              {currentView === 'all' && <All />}
            </Col>
          </Row>
        </NoteWrapper>
        <Modal type={state.modalType} title={null} visible={state.visible} footer={null} onCancel={handleCancel}>
          <div className="project-modal">
            <BasicFormWrapper>
              <Form form={form} name="createProject" onFinish={handleOk}>
                <Form.Item
                  rules={[{ required: true, message: 'Please input your note title!' }]}
                  name="title"
                  label="Title"
                >
                  <Input placeholder="Note Title" />
                </Form.Item>

                <Form.Item
                  rules={[{ required: true, message: 'Please input your note description!' }]}
                  name="description"
                  label="Description"
                >
                  <Input.TextArea rows={4} placeholder="Note Description" />
                </Form.Item>
                <Form.Item name="label" initialValue="personal" label="Note Label">
                  <Select className="w-100">
                    <Option value="personal">Personal</Option>
                    <Option value="work">Work</Option>
                    <Option value="social">Social</Option>
                    <Option value="important">Important</Option>
                  </Select>
                </Form.Item>
                <Button htmlType="submit" size="default" type="primary" key="submit">
                  Add New Note
                </Button>
              </Form>
            </BasicFormWrapper>
          </div>
        </Modal>
      </Main>
    </>
  );
}

Note.propTypes = {
  // match: PropTypes.shape(PropTypes.object),
};
export default Note;
