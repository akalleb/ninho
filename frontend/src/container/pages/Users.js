'use client';

import React, { useState, useMemo } from 'react';
import { useSelector } from 'react-redux';
import { Row, Col, Pagination, Skeleton } from 'antd';
import FeatherIcon from 'feather-icons-react';
import { usePathname } from 'next/navigation';
import { NextNavLink, NextLink } from '../../components/utilities/NextLink';
import { UsercardWrapper, UserCarrdTop } from './style';
import { PageHeader } from '../../components/page-headers/page-headers';
import { Main, CardToolbox } from '../styled';
import { AutoComplete } from '../../components/autoComplete/autoComplete';
import { Button } from '../../components/buttons/buttons';
import { Cards } from '../../components/cards/frame/cards-frame';

// Direct imports - no lazy loading needed since route already uses dynamic()
import User from './overview/UserCard';
import UserCardStyle from './overview/UserCardStyle';
import UserCardList from './overview/UserCardList';
import UserCardGroup from './overview/UserCardGroup';

function Users() {
  const pathname = usePathname();
  const { searchData, users, userGroup } = useSelector((state) => {
    return {
      searchData: state.headerSearchData,
      users: state.users,
      userGroup: state.userGroup,
    };
  });


  const [state, setState] = useState({
    notData: searchData,
    current: 0,
    pageSize: 0,
    page: 0,
  });

  const { notData } = state;

  // Determine current view from pathname
  const currentView = useMemo(() => {
    if (!pathname) return 'grid';
    const path = pathname.toLowerCase();
    if (path.includes('/list')) return 'list';
    if (path.includes('/grid-style')) return 'grid-style';
    if (path.includes('/grid-group')) return 'grid-group';
    return 'grid'; // default
  }, [pathname]);

  const handleSearch = (searchText) => {
    const data = searchData.filter((item) => item.title.toUpperCase().startsWith(searchText.toUpperCase()));
    setState({
      ...state,
      notData: data,
    });
  };

  const onShowSizeChange = (current, pageSize) => {
    setState({ ...state, current, pageSize });
  };

  const onChange = (page) => {
    setState({ ...state, page });
  };

  return (
    <>
      <CardToolbox>
        <UserCarrdTop>
          <PageHeader
            ghost
            title="Users Card"
            subTitle={
              <>
                <span className="title-counter">274 Users </span>
                <AutoComplete
                  onSearch={handleSearch}
                  dataSource={notData}
                  placeholder="Search by Name"
                  width="100%"
                  patterns
                />
              </>
            }
            buttons={[
              <Button className="btn-add_new" size="default" type="primary" key="1">
                <NextLink href="/admin/users/add-user">
                  <FeatherIcon icon="plus" size={14} /> Add New User
                </NextLink>
              </Button>,
              <NextNavLink className="action-btn" key="2" to="/admin/users/grid">
                <FeatherIcon icon="grid" size={14} />
              </NextNavLink>,
              <NextNavLink className="action-btn" key="3" to="/admin/users/list">
                <FeatherIcon icon="list" size={14} />
              </NextNavLink>,
              <NextNavLink className="action-btn" key="4" to="/admin/users/grid-style">
                <FeatherIcon icon="maximize" size={14} />
              </NextNavLink>,
              <NextNavLink className="action-btn" key="5" to="/admin/users/grid-group">
                <FeatherIcon icon="users" size={14} />
              </NextNavLink>,
            ]}
          />
        </UserCarrdTop>
      </CardToolbox>
      <Main>
        <UsercardWrapper>
          <Row gutter={25}>
            {currentView === 'list' && (
              <>
                {users.map((user) => {
                  const { id } = user;
                  return (
                    <Col key={id} xxl={12} xl={12} sm={24} xs={24}>
                      <UserCardList user={user} />
                    </Col>
                  );
                })}
              </>
            )}
            {currentView === 'grid-group' && (
              <>
                {userGroup.map((user) => {
                  const { id } = user;
                  return (
                    <Col key={id} xxl={8} md={12} sm={24} xs={24}>
                      <UserCardGroup user={user} />
                    </Col>
                  );
                })}
              </>
            )}
            {currentView === 'grid-style' && (
              <>
                {users.map((user) => {
                  const { id } = user;
                  return (
                    <Col key={id} xxl={6} xl={8} sm={12} xs={24}>
                      <UserCardStyle user={user} />
                    </Col>
                  );
                })}
              </>
            )}
            {(currentView === 'grid' || !currentView) && (
              <>
                {users.map((user) => {
                  const { id } = user;
                  return (
                    <Col key={id} xxl={6} xl={8} sm={12} xs={24}>
                      <User user={user} />
                    </Col>
                  );
                })}
              </>
            )}

            <Col xs={24}>
              <div className="user-card-pagination">
                <Pagination
                  onChange={onChange}
                  showSizeChanger
                  onShowSizeChange={onShowSizeChange}
                  defaultCurrent={6}
                  total={500}
                />
              </div>
            </Col>
          </Row>
        </UsercardWrapper>
      </Main>
    </>
  );
}

export default Users;
