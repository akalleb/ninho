'use client';

import React, { useState } from 'react';
import { useSelector } from 'react-redux';
import { Row, Col, Pagination, Skeleton } from 'antd';
import FeatherIcon from 'feather-icons-react';
import { NextLink } from '../../components/utilities/NextLink';
import { UsercardWrapper } from './style';
import { PageHeader } from '../../components/page-headers/page-headers';
import { Main, CardToolbox } from '../styled';
import { AutoComplete } from '../../components/autoComplete/autoComplete';
import { Button } from '../../components/buttons/buttons';
import { Cards } from '../../components/cards/frame/cards-frame';

// Direct import - no lazy loading needed since route already uses dynamic()
import User from './overview/UserCard';
function Users() {
  const { searchData, users } = useSelector((state) => {
    return {
      searchData: state.headerSearchData,
      users: state.users,
    };
  });

  const [state, setState] = useState({
    notData: searchData,
    current: 0,
    pageSize: 0,
    page: 0,
  });

  const { notData } = state;

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
              <NextLink to="/admin/users/add-user/info">
                <FeatherIcon icon="plus" size={14} /> Add New User
              </NextLink>
            </Button>,
          ]}
        />
      </CardToolbox>
      <Main>
        <UsercardWrapper>
          <Row gutter={25}>
            {users.map((user) => {
              const { id } = user;
              return (
                <Col key={id} xxl={6} xl={8} sm={12} xs={24}>
                  <User user={user} />
                </Col>
              );
            })}
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
