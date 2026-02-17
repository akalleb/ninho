import React, { useState, useEffect } from 'react';
import { Row, Col, Table, Progress, Pagination, Tag } from 'antd';
import { useSelector } from 'react-redux';
import { NextLink } from '../../../components/utilities/NextLink';
import FeatherIcon from 'feather-icons-react';
import Heading from '../../../components/heading/heading';
import { Cards } from '../../../components/cards/frame/cards-frame';
import { ProjectPagination, ProjectListTitle, ProjectListAssignees, ProjectList } from '../style';
import { Dropdown } from '../../../components/dropdown/dropdown';
import { getImageUrl } from '../../../utility/getImageUrl';

function ProjectLists() {
  const project = useSelector((state) => state.projects.data);
  const [state, setState] = useState({
    projects: project,
    current: 0,
    pageSize: 0,
  });
  const { projects } = state;

  useEffect(() => {
    if (project) {
      setState({
        projects: project,
      });
    }
  }, [project]);

  const onShowSizeChange = (current, pageSize) => {
    setState({ ...state, current, pageSize });
  };

  const onHandleChange = (current, pageSize) => {
    // You can create pagination in here
    setState({ ...state, current, pageSize });
  };

  const dataSource = [];

  if (projects.length)
    projects.map((value) => {
      const { id, title, status, category, percentage, start_date, end_date, participants, total_tasks, completed_tasks } = value;

      const startLabel = start_date ? new Date(start_date).toLocaleDateString() : null;
      const endLabel = end_date ? new Date(end_date).toLocaleDateString() : null;

      const effectivePercentage =
        typeof percentage === 'number'
          ? percentage
          : typeof value.progress === 'number'
          ? value.progress
          : 0;

      const participantsList = Array.isArray(participants) ? participants : [];
      const totalTasks = typeof total_tasks === 'number' ? total_tasks : null;
      const completedTasks = typeof completed_tasks === 'number' ? completed_tasks : null;
      return dataSource.push({
        key: id,
        project: (
          <ProjectListTitle>
            <Heading as="h4">
              <NextLink href={`/admin/project/projectDetails/${id}`}>{title}</NextLink>
            </Heading>

            <p>{category}</p>
          </ProjectListTitle>
        ),
        startDate: <span className="date-started">{startLabel || '-'}</span>,
        deadline: <span className="date-finished">{endLabel || '-'}</span>,
        assigned: (
          <ProjectListAssignees>
            <ul>
              {participantsList.length
                ? participantsList.map((p, index) => (
                    <li key={`${p.name}-${index}`}>
                      <span className="user-initial">
                        {p.name
                          .split(' ')
                          .map((part) => part.charAt(0).toUpperCase())
                          .slice(0, 2)
                          .join('')}
                      </span>
                    </li>
                  ))
                : (
                  <li className="no-participants">Nenhum participante</li>
                )}
            </ul>
          </ProjectListAssignees>
        ),
        status: <Tag className={status}>{status}</Tag>,
        completion: (
          <div className="project-list-progress">
            <Progress
              percent={status === 'complete' ? 100 : effectivePercentage}
              size={[null, 5]}
              className="progress-primary"
              showInfo
            />
            <p>
              {completedTasks != null && totalTasks != null
                ? `${completedTasks}/${totalTasks} tarefas concluídas`
                : 'Dados de tarefas indisponíveis'}
            </p>
          </div>
        ),
        action: (
          <Dropdown
            className="wide-dropdwon"
            content={
              <>
                <span className="cursor-pointer">Ver</span>
                <span className="cursor-pointer">Editar</span>
                <span className="cursor-pointer">Excluir</span>
              </>
            }
          >
            <span className="cursor-pointer">
              <FeatherIcon icon="more-horizontal" size={18} />
            </span>
          </Dropdown>
        ),
      });
    });

  const columns = [
    {
      title: 'Projeto',
      dataIndex: 'project',
      key: 'project',
    },
    {
      title: 'Data de início',
      dataIndex: 'startDate',
      key: 'startDate',
    },
    {
      title: 'Prazo',
      dataIndex: 'deadline',
      key: 'deadline',
    },
    {
      title: 'Atribuído a',
      dataIndex: 'assigned',
      key: 'assigned',
    },
    {
      title: 'Status',
      dataIndex: 'status',
      key: 'status',
    },
    {
      title: 'Conclusão',
      dataIndex: 'completion',
      key: 'completion',
    },

    {
      title: '',
      dataIndex: 'action',
      key: 'action',
    },
  ];

  return (
    <Row gutter={25}>
      <Col xs={24}>
        <Cards headless>
          <ProjectList>
            <div className="table-responsive">
              <Table pagination={false} dataSource={dataSource} columns={columns} />
            </div>
          </ProjectList>
        </Cards>
      </Col>
      <Col xs={24} className="pb-30">
        <ProjectPagination>
          {projects.length ? (
            <Pagination
              onChange={onHandleChange}
              showSizeChanger
              onShowSizeChange={onShowSizeChange}
              pageSize={10}
              defaultCurrent={1}
              total={projects.length}
            />
          ) : null}
        </ProjectPagination>
      </Col>
    </Row>
  );
}

export default ProjectLists;
