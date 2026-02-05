/* eslint-disable jsx-a11y/control-has-associated-label */
'use client';

import React, { useState, useLayoutEffect, useMemo } from 'react';
import { usePathname } from 'next/navigation';
import { NextNavLink } from '../../components/utilities/NextLink';
import { useSelector, useDispatch } from 'react-redux';
import { Row, Col, Spin, Input, Form, Modal } from 'antd';
import FeatherIcon from 'feather-icons-react';
import { FixedSidebar, SidebarWrap } from './style';
import { Main, BasicFormWrapper } from '../styled';
import { PageHeader } from '../../components/page-headers/page-headers';
import { Button } from '../../components/buttons/buttons';
import { ShareButtonPageHeader } from '../../components/buttons/share-button/share-button';
import { ExportButtonPageHeader } from '../../components/buttons/export-button/export-button';
import { CalendarButtonPageHeader } from '../../components/buttons/calendar-button/calendar-button';
import { taskAddData } from '../../redux/task/actionCreator';

// Direct imports - no lazy loading needed since route already uses dynamic()
import All from './overview/all';
import Favourites from './overview/favourites';
import Completed from './overview/completed';

function Task() {
  const pathname = usePathname();
  const [form] = Form.useForm();
  const dispatch = useDispatch();
  const { taskData } = useSelector((state) => {
    return {
      taskData: state.Task.data,
    };
  });
  const [state, setState] = useState({
    responsive: 0,
    collapsed: false,
    visible: false,
    modalType: 'primary',
  });

  // Determine current view from pathname
  const currentView = useMemo(() => {
    if (!pathname) return 'all';
    const path = pathname.toLowerCase();
    if (path.includes('/favourites') || path.includes('/favorites')) return 'favourites';
    if (path.includes('/completed')) return 'completed';
    return 'all'; // default
  }, [pathname]);

  const showModal = () => {
    setState({
      ...state,
      visible: true,
      collapsed: false,
    });
  };

  const handleCancel = () => {
    setState({
      ...state,
      visible: false,
    });
  };

  const handleAddTask = (values) => {
    handleCancel();
    const arrayData = [];
    taskData.map((data) => {
      return arrayData.push(data.id);
    });
    const max = Math.max(...arrayData);
    dispatch(
      taskAddData([
        ...taskData,
        {
          ...values,
          id: max + 1,
          favourite: false,
          completed: false,
        },
      ]),
    );
  };
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
        title="Task"
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
          <Col xl={5} lg={6} md={7} xs={24}>
            {responsive > 767 ? (
              <>
                <SidebarWrap className="mb-30">
                  <div className="sDash_taskApp-sidebar">
                    <Button className="sDash_btn-add" size="large" type="primary" raised onClick={showModal}>
                      <FeatherIcon icon="plus" size={16} />
                      Add Task
                    </Button>
                    <ul className="sDash_taskApp-sidebar__nav">
                      <li className="sDash_taskApp-sidebar__nav--item">
                        <NextNavLink className="sDash_taskApp-sidebar__nav--link" to="/admin/app/task/all">
                          <span className="nav-item-icon">
                            <FeatherIcon icon="edit" size={16} />
                          </span>
                          <span className="nav-item-text">All</span>
                        </NextNavLink>
                      </li>
                      <li className="sDash_taskApp-sidebar__nav--item">
                        <NextNavLink className="sDash_taskApp-sidebar__nav--link" to="/admin/app/task/favourites">
                          <span className="nav-item-icon">
                            <FeatherIcon icon="star" size={16} />
                          </span>
                          <span className="nav-item-text">Favourite</span>
                        </NextNavLink>
                      </li>
                      <li className="sDash_taskApp-sidebar__nav--item">
                        <NextNavLink className="sDash_taskApp-sidebar__nav--link" to="/admin/app/task/completed">
                          <span className="nav-item-icon">
                            <FeatherIcon icon="check" size={16} />
                          </span>
                          <span className="nav-item-text">Completed</span>
                        </NextNavLink>
                      </li>
                    </ul>
                  </div>
                </SidebarWrap>
                <Modal
                  title="Add Task"
                  className="sDash_addTask-modal"
                  type={state.modalType}
                  visible={state.visible}
                  footer={null}
                  onCancel={handleCancel}
                >
                  <div className="sDash_addTask-modal-inner">
                    <BasicFormWrapper>
                      <Form form={form} name="add-task" onFinish={handleAddTask}>
                        <Form.Item rules={[{ required: true, message: 'Please add a Title' }]} name="title">
                          <Input placeholder="Title" />
                        </Form.Item>

                        <Form.Item name="description">
                          <Input.TextArea rows={4} placeholder="Add Description" />
                        </Form.Item>
                        <div className="sDash-modal-actions">
                          <Button size="small" type="white" key="cancel" outlined onClick={handleCancel}>
                            Cancel
                          </Button>
                          <Button htmlType="submit" size="small" type="primary" key="submit">
                            Add Task
                          </Button>
                        </div>
                      </Form>
                    </BasicFormWrapper>
                  </div>
                </Modal>
              </>
            ) : (
              <FixedSidebar className={collapsed ? 'show' : 'hide'}>
                <span type="link" className="trigger-close cursor-pointer" onClick={toggleCollapsed}>
                  <FeatherIcon icon="x" />
                </span>
                <SidebarWrap className="mb-30">
                  <div className="sDash_taskApp-sidebar">
                    <Button className="sDash_btn-add" size="large" type="primary" raised onClick={showModal}>
                      <FeatherIcon icon="plus" size={16} />
                      Add Task
                    </Button>
                    <ul className="sDash_taskApp-sidebar__nav">
                      <li className="sDash_taskApp-sidebar__nav--item">
                        <NextNavLink className="sDash_taskApp-sidebar__nav--link" to="/admin/app/task/all">
                          <span className="nav-item-icon">
                            <FeatherIcon icon="edit" size={16} />
                          </span>
                          <span className="nav-item-text">All</span>
                        </NextNavLink>
                      </li>
                      <li className="sDash_taskApp-sidebar__nav--item">
                        <NextNavLink className="sDash_taskApp-sidebar__nav--link" to="/admin/app/task/favourites">
                          <span className="nav-item-icon">
                            <FeatherIcon icon="star" size={16} />
                          </span>
                          <span className="nav-item-text">Favourite</span>
                        </NextNavLink>
                      </li>
                      <li className="sDash_taskApp-sidebar__nav--item">
                        <NextNavLink className="sDash_taskApp-sidebar__nav--link" to="/admin/app/task/completed">
                          <span className="nav-item-icon">
                            <FeatherIcon icon="check" size={16} />
                          </span>
                          <span className="nav-item-text">Completed</span>
                        </NextNavLink>
                      </li>
                    </ul>
                  </div>
                </SidebarWrap>
                <Modal
                  title="Add Task"
                  className="sDash_addTask-modal"
                  type={state.modalType}
                  visible={state.visible}
                  footer={null}
                  onCancel={handleCancel}
                >
                  <div className="sDash_addTask-modal-inner">
                    <BasicFormWrapper>
                      <Form form={form} name="add-task" onFinish={handleAddTask}>
                        <Form.Item rules={[{ required: true, message: 'Please add a Title' }]} name="title">
                          <Input placeholder="Title" />
                        </Form.Item>

                        <Form.Item name="description">
                          <Input.TextArea rows={4} placeholder="Add Description" />
                        </Form.Item>
                        <div className="sDash-modal-actions">
                          <Button size="small" type="white" key="cancel" outlined onClick={handleCancel}>
                            Cancel
                          </Button>
                          <Button htmlType="submit" size="small" type="primary" key="submit">
                            Add Task
                          </Button>
                        </div>
                      </Form>
                    </BasicFormWrapper>
                  </div>
                </Modal>
              </FixedSidebar>
            )}
          </Col>
          <Col xl={19} lg={18} md={17} xs={24}>
            {responsive <= 767 && (
              <div className="sidebar-trier-wrap text-center mb-30">
                <Button type="link" className="sidebar-trigger mt-0" onClick={toggleCollapsed}>
                  <FeatherIcon icon={collapsed ? 'align-left' : 'align-right'} />
                </Button>
              </div>
            )}
            {currentView === 'favourites' && <Favourites />}
            {currentView === 'completed' && <Completed />}
            {currentView === 'all' && <All />}
          </Col>
        </Row>
        <span
          onKeyPress={() => {}}
          role="button"
          tabIndex="0"
          className={collapsed ? 'overlay-dark show' : 'overlay-dark'}
          onClick={toggleCollapsed}
        />
      </Main>
    </>
  );
}

export default Task;
