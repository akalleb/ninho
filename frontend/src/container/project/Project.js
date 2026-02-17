'use client';

import React, { useState, useMemo, useEffect } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { Row, Col, Spin, Select } from 'antd';
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
  const searchData = useSelector((state) => state.headerSearchData);
  const projectsState = useSelector((state) => state.projects);
  const [state, setState] = useState({
    notData: searchData,
    visible: false,
    categoryActive: 'all',
  });

  const { notData, visible } = state;

  useEffect(() => {
    dispatch(filterProjectByStatus('all'));
  }, [dispatch]);

  // Determine current view from pathname
  const currentView = useMemo(() => {
    if (!pathname) return 'grid';
    const path = pathname.toLowerCase();
    if (path.includes('/list')) return 'list';
    return 'grid'; // default
  }, [pathname]);
  const handleSearch = (searchText) => {
    const data = searchData.filter((item) => item.title.toUpperCase().startsWith(searchText.toUpperCase()));
    setState({
      ...state,
      notData: data,
    });
  };

  const onSorting = (selectedItems) => {
    dispatch(sortingProjectByCategory(selectedItems));
  };

  const onChangeCategory = (value) => {
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
          title="Projetos"
          subTitle={
            <>
              {projectsState?.data?.length || 0} projetos
            </>
          }
          buttons={[
            <Button onClick={showModal} key="1" type="primary" size="default">
              <FeatherIcon icon="plus" size={16} /> Criar projeto
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
                          Todos
                        </span>
                      </li>
                      <li className={state.categoryActive === 'progress' ? 'active' : 'deactivate'}>
                        <span 
                          onClick={() => onChangeCategory('progress')} 
                          className="cursor-pointer d-inline-block"
                        >
                          Em andamento
                        </span>
                      </li>
                      <li className={state.categoryActive === 'complete' ? 'active' : 'deactivate'}>
                        <span 
                          onClick={() => onChangeCategory('complete')} 
                          className="cursor-pointer d-inline-block"
                        >
                          Concluídos
                        </span>
                      </li>
                      <li className={state.categoryActive === 'late' ? 'active' : 'deactivate'}>
                        <span 
                          onClick={() => onChangeCategory('late')} 
                          className="cursor-pointer d-inline-block"
                        >
                          Atrasados
                        </span>
                      </li>
                      <li className={state.categoryActive === 'early' ? 'active' : 'deactivate'}>
                        <span 
                          onClick={() => onChangeCategory('early')} 
                          className="cursor-pointer d-inline-block"
                        >
                          Adiantados
                        </span>
                      </li>
                    </ul>
                  </nav>
                </div>
                <div className="project-sort-search">
                  <AutoComplete onSearch={handleSearch} dataSource={notData} placeholder="Buscar projetos" patterns />
                </div>
                <div className="project-sort-group">
                  <div className="sort-group">
                    <span>Ordenar por:</span>
                    <Select onChange={onSorting} defaultValue="category">
                      <Select.Option value="category">Categoria do projeto</Select.Option>
                      <Select.Option value="rate">Mais bem avaliados</Select.Option>
                      <Select.Option value="popular">Mais populares</Select.Option>
                      <Select.Option value="time">Mais recentes</Select.Option>
                      <Select.Option value="price">Preço</Select.Option>
                    </Select>
                    <div className="layout-style">
                      <NextNavLink to="/admin/project/view/grid" className={currentView === 'grid' ? 'active' : ''}>
                        <FeatherIcon icon="grid" size={16} />
                      </NextNavLink>
                      <NextNavLink to="/admin/project/view/list" className={currentView === 'list' ? 'active' : ''}>
                        <FeatherIcon icon="list" size={16} />
                      </NextNavLink>
                    </div>
                  </div>
                </div>
              </div>
            </ProjectSorting>
            <div>{currentView === 'list' ? <List /> : <Grid />}</div>
          </Col>
        </Row>
        <CreateProject onCancel={onCancel} visible={visible} />
      </Main>
    </>
  );
}

export default Project;
