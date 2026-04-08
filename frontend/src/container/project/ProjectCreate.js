'use client';

import React, { useState, useMemo } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { Row, Col, Select } from 'antd';
import { usePathname } from 'next/navigation';
import { NextNavLink } from '../../components/utilities/NextLink';
import FeatherIcon from 'feather-icons-react';
import CreateProject from './overview/CreateProject';
import { ProjectHeader, ProjectSorting } from './style';
import { AutoComplete } from '../../components/autoComplete/autoComplete';
import { Button } from '../../components/buttons/buttons';
import { filterProjectByStatus, sortingProjectByCategory } from '../../redux/project/actionCreator';
import { Main } from '../styled';
import { PageHeader } from '../../components/page-headers/page-headers';

// Direct imports - no lazy loading needed since route already uses dynamic()
import Grid from './overview/Grid';
import List from './overview/List';

function Project() {
  const dispatch = useDispatch();
  const pathname = usePathname();
  const searchData = useSelector(state => state.headerSearchData);
  const [state, setState] = useState({
    notData: searchData,
    visible: true,
    categoryActive: 'all',
  });

  const { notData, visible } = state;

  // Determine current view from pathname
  const currentView = useMemo(() => {
    if (!pathname) return 'grid';
    const path = pathname.toLowerCase();
    if (path.includes('/list')) return 'list';
    return 'grid'; // default
  }, [pathname]);
  const handleSearch = searchText => {
    const data = searchData.filter(item => item.title.toUpperCase().startsWith(searchText.toUpperCase()));
    setState({
      ...state,
      notData: data,
    });
  };

  const onSorting = selectedItems => {
    dispatch(sortingProjectByCategory(selectedItems));
  };

  const onChangeCategory = value => {
    setState({
      ...state,
      categoryActive: value,
    });
    dispatch(filterProjectByStatus(value));
  };

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

  return (
    <>
      <ProjectHeader>
        <PageHeader
          ghost
          title="Projects"
          subTitle={<>12 Running Projects</>}
          buttons={[
            <Button onClick={showModal} key="1" type="primary" size="default">
              <FeatherIcon icon="plus" size={16} /> Create Projects
            </Button>,
          ]}
        />
      </ProjectHeader>
      <Main>
        <Row gutter={25}>
          <Col xs={24}>
            <ProjectSorting>
              <div className="project-sort-bar">
                <div className="project-sort-nav">
                  <nav>
                    <ul>
                      <li className={state.categoryActive === 'all' ? 'active' : 'deactivate'}>
                        <span 
                          onClick={() => onChangeCategory('all')} 
                          className="cursor-pointer d-inline-block"
                        >
                          All
                        </span>
                      </li>
                      <li className={state.categoryActive === 'progress' ? 'active' : 'deactivate'}>
                        <span 
                          onClick={() => onChangeCategory('progress')} 
                          className="cursor-pointer d-inline-block"
                        >
                          In Progress
                        </span>
                      </li>
                      <li className={state.categoryActive === 'complete' ? 'active' : 'deactivate'}>
                        <span 
                          onClick={() => onChangeCategory('complete')} 
                          className="cursor-pointer d-inline-block"
                        >
                          Complete
                        </span>
                      </li>
                      <li className={state.categoryActive === 'late' ? 'active' : 'deactivate'}>
                        <span 
                          onClick={() => onChangeCategory('late')} 
                          className="cursor-pointer d-inline-block"
                        >
                          Late
                        </span>
                      </li>
                      <li className={state.categoryActive === 'early' ? 'active' : 'deactivate'}>
                        <span 
                          onClick={() => onChangeCategory('early')} 
                          className="cursor-pointer d-inline-block"
                        >
                          Early
                        </span>
                      </li>
                    </ul>
                  </nav>
                </div>
                <div className="project-sort-search">
                  <AutoComplete onSearch={handleSearch} dataSource={notData} placeholder="Search projects" patterns />
                </div>
                <div className="project-sort-group">
                  <div className="sort-group">
                    <span>Sort By:</span>
                    <Select onChange={onSorting} defaultValue="category">
                      <Select.Option value="category">Project Category</Select.Option>
                      <Select.Option value="rate">Top Rated</Select.Option>
                      <Select.Option value="popular">Popular</Select.Option>
                      <Select.Option value="time">Newest</Select.Option>
                      <Select.Option value="price">Price</Select.Option>
                    </Select>
                    <div className="layout-style">
                      <NextNavLink to="/admin/project/create/grid" className={currentView === 'grid' ? 'active' : ''}>
                        <FeatherIcon icon="grid" size={16} />
                      </NextNavLink>
                      <NextNavLink to="/admin/project/create/list" className={currentView === 'list' ? 'active' : ''}>
                        <FeatherIcon icon="list" size={16} />
                      </NextNavLink>
                    </div>
                  </div>
                </div>
              </div>
            </ProjectSorting>
            <div>
              {currentView === 'list' ? <List /> : <Grid />}
            </div>
          </Col>
        </Row>
        <CreateProject onCancel={onCancel} visible={visible} />
      </Main>
    </>
  );
}

export default Project;
