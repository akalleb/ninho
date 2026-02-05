'use client';

import React, { useEffect, useMemo } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { Row, Col, Progress, Spin } from 'antd';
import FeatherIcon from 'feather-icons-react';
import { useParams, usePathname } from 'next/navigation';
import { NextNavLink } from '../../components/utilities/NextLink';
import { ProjectDetailsWrapper, TaskLists } from './style';
import FileListCard from './overview/FileListCard';
import { PageHeader } from '../../components/page-headers/page-headers';
import { Main } from '../styled';
import Heading from '../../components/heading/heading';
import { Cards } from '../../components/cards/frame/cards-frame';
import { Button } from '../../components/buttons/buttons';
import { filterSinglePage } from '../../redux/project/actionCreator';
import { getImageUrl } from '../../utility/getImageUrl';

// Direct imports - no lazy loading needed since route already uses dynamic()
import TaskList from './overview/TaskList';
import Activities from './overview/Activities';

function ProjectDetails() {
  const params = useParams();
  const pathname = usePathname();
  const dispatch = useDispatch();
  const project = useSelector((state) => state.project.data);

  // Get project ID from params
  // Route structure: /admin/project/projectDetails/1
  // So params.slug would be ['projectDetails', '1']
  const slug = params?.slug || [];
  const projectId = Array.isArray(slug) && slug.length > 1 ? slug[1] : (params?.id || slug[0] || '');

  // Determine current view from pathname
  const currentView = useMemo(() => {
    if (!pathname) return 'tasklist';
    const path = pathname.toLowerCase();
    if (path.includes('/activities')) return 'activities';
    return 'tasklist'; // default
  }, [pathname]);

  useEffect(() => {
    if (dispatch && projectId) {
      const id = parseInt(projectId, 10);
      if (!isNaN(id)) {
        dispatch(filterSinglePage(id));
      }
    }
  }, [projectId, dispatch]);

  // Safety check: don't render until project data is loaded
  if (!project || !Array.isArray(project) || project.length === 0 || !project[0]) {
    return (
      <ProjectDetailsWrapper>
        <PageHeader ghost title="Project Details" />
        <Main>
          <Cards headless>
            <Spin />
          </Cards>
        </Main>
      </ProjectDetailsWrapper>
    );
  }

  const { title = '', content = '' } = project[0] || {};

  return (
    <ProjectDetailsWrapper>
      <PageHeader
        ghost
        title={
          <div key="1" className="project-header">
            <Heading as="h2">{title}</Heading>
            <Button type="primary" size="small">
              <FeatherIcon icon="plus" size="14" /> Add Task
            </Button>
            <Button className="btn-markComplete" outlined type="white" size="small">
              <FeatherIcon icon="check" size="14" /> Mark as Complete
            </Button>
          </div>
        }
        buttons={[
          <div key="1" className="project-action">
            <span key={1} className="project-edit cursor-pointer">
              <FeatherIcon icon="edit-3" size={14} />
              Edit
            </span>
            <span key={2} className="project-remove cursor-pointer">
              <FeatherIcon icon="trash-2" size={14} />
              Remove
            </span>
          </div>,
        ]}
      />
      <Main>
        <Row gutter={25}>
          <Col xxl={6} xl={8} xs={24}>
            <div className="project-progress">
              <h3>Progress</h3>
              <Progress percent={65} size={[null, 5]} status="active" />
            </div>
            <Cards headless>
              <div className="state-single">
                <div className="color-primary">
                  <span className="cursor-pointer">
                    <FeatherIcon icon="list" size={25} />
                  </span>
                </div>
                <div>
                  <Heading as="h5">47</Heading>
                  <p>Total Task</p>
                </div>
              </div>
              <div className="state-single">
                <div className="color-secondary">
                  <span className="cursor-pointer">
                    <FeatherIcon icon="pie-chart" size={25} />
                  </span>
                </div>
                <div>
                  <Heading as="h5">34</Heading>
                  <p>Task Completed</p>
                </div>
              </div>
              <div className="state-single">
                <div className="color-success">
                  <span className="cursor-pointer">
                    <FeatherIcon icon="layout" size={25} />
                  </span>
                </div>
                <div>
                  <Heading as="h5">$27,500</Heading>
                  <p>Spendings</p>
                </div>
              </div>
              <div className="state-single">
                <div className="color-warning">
                  <span className="cursor-pointer">
                    <FeatherIcon icon="clock" size={25} />
                  </span>
                </div>
                <div>
                  <Heading as="h5">250</Heading>
                  <p>Hours Spent</p>
                </div>
              </div>
            </Cards>
          </Col>
          <Col xxl={12} xl={16} xs={24}>
            <div className="about-project-wrapper">
              <Cards  title="About Project">
                <div className="about-content">
                  <p>{content}</p>
                </div>
                <div className="about-project">
                  <div>
                    <span>Project Owner</span>
                    <p>Peter Jackson</p>
                  </div>
                  <div>
                    <span>Budget</span>
                    <p>$56,700</p>
                  </div>
                  <div>
                    <span>Start Date</span>
                    <p className="color-primary">28 Dec 2019</p>
                  </div>
                  <div>
                    <span>Deadline</span>
                    <p className="color-danger">18 Mar 2020</p>
                  </div>
                </div>
              </Cards>
            </div>
          </Col>
          <Col xxl={6} lg={9} xs={24}>
            <div className="project-users-wrapper">
              <Cards
                title="Users"
                isbutton={
                  <Button className="btn-addUser" outlined type="white" size="small">
                    <FeatherIcon icon="user-plus" size={14} /> Add Users
                  </Button>
                }
              >
                <div className="project-users">
                  <div className="porject-user-single">
                    <div>
                      <img src={getImageUrl('static/img/users/1.png')} alt="" />
                    </div>
                    <div>
                      <Heading as="h5">Meyri Carles</Heading>
                      <p>Web Developer</p>
                    </div>
                  </div>
                  <div className="porject-user-single">
                    <div>
                      <img src={getImageUrl('static/img/users/3.png')} alt="" />
                    </div>
                    <div>
                      <Heading as="h5">Tuhin Molla</Heading>
                      <p>Project Manager</p>
                    </div>
                  </div>
                  <div className="porject-user-single">
                    <div>
                      <img src={getImageUrl('static/img/users/9.jpg')} alt="" />
                    </div>
                    <div>
                      <Heading as="h5">Billal Hossain</Heading>
                      <p>App Developer</p>
                    </div>
                  </div>
                  <div className="porject-user-single">
                    <div>
                      <img src={getImageUrl('static/img/users/4.png')} alt="" />
                    </div>
                    <div>
                      <Heading as="h5">Khalid Hasan</Heading>
                      <p>App Developer</p>
                    </div>
                  </div>
                  <div className="porject-user-single">
                    <div>
                      <img src={getImageUrl('static/img/users/5.png')} alt="" />
                    </div>
                    <div>
                      <Heading as="h5">Meyri Carles</Heading>
                      <p>Ui Designer</p>
                    </div>
                  </div>
                </div>
              </Cards>
            </div>
          </Col>
          <Col xxl={16} lg={15} xs={24}>
            <TaskLists>
              <Cards
                title={
                  <nav>
                    <NextNavLink to={`/admin/project/projectDetails/${projectId}/tasklist`}>Task List</NextNavLink>
                    &nbsp; &nbsp;
                    <NextNavLink to={`/admin/project/projectDetails/${projectId}/activities`}>Activities</NextNavLink>
                  </nav>
                }
              >
                {currentView === 'activities' ? <Activities /> : <TaskList />}
              </Cards>
            </TaskLists>
          </Col>
          <Col xxl={8} xs={24}>
            <FileListCard />
          </Col>
        </Row>
      </Main>
    </ProjectDetailsWrapper>
  );
}

export default ProjectDetails;
