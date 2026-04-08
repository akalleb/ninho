'use client';

import React, { useEffect, useMemo } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { Row, Col, Progress, Spin, App } from 'antd';
import FeatherIcon from 'feather-icons-react';
import { useParams, usePathname, useRouter } from 'next/navigation';
import { NextNavLink } from '../../components/utilities/NextLink';
import { ProjectDetailsWrapper, TaskLists } from './style';
import FileListCard from './overview/FileListCard';
import { PageHeader } from '../../components/page-headers/page-headers';
import { Main } from '../styled';
import Heading from '../../components/heading/heading';
import { Cards } from '../../components/cards/frame/cards-frame';
import { Button } from '../../components/buttons/buttons';
import { filterSinglePage, deleteProject } from '../../redux/project/actionCreator';
import { getImageUrl } from '../../utility/getImageUrl';
import api from '../../config/api/axios';
import normalizeApiError from '../../utils/errors/normalizeApiError';

// Direct imports - no lazy loading needed since route already uses dynamic()
import TaskList from './overview/TaskList';
import Activities from './overview/Activities';

function ProjectDetails() {
  const params = useParams();
  const pathname = usePathname();
  const dispatch = useDispatch();
  const router = useRouter();
  const { notification } = App.useApp();
  const projectState = useSelector((state) => state.project) || {};

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
      if (!Number.isNaN(id)) {
        dispatch(filterSinglePage(id));
      }
    }
  }, [projectId, dispatch]);

  const project = Array.isArray(projectState?.data) ? projectState.data : [];
  const isProjectLoading = Boolean(projectState?.loading);
  const projectError = projectState?.error;

  // Safety check: don't render until project data is loaded
  if (isProjectLoading) {
    return (
      <ProjectDetailsWrapper>
        <PageHeader ghost title="Detalhes do projeto" />
        <Main>
          <Cards headless>
            <Spin />
          </Cards>
        </Main>
      </ProjectDetailsWrapper>
    );
  }

  if (projectError) {
    return (
      <ProjectDetailsWrapper>
        <PageHeader ghost title="Detalhes do projeto" />
        <Main>
          <Cards headless>
            <div style={{ padding: 20, textAlign: 'center' }}>
              <FeatherIcon icon="alert-circle" size={48} color="#ff4d4f" />
              <h3>Erro ao carregar projeto</h3>
              <p>Não foi possível carregar os detalhes do projeto. Verifique se o ID é válido.</p>
            </div>
          </Cards>
        </Main>
      </ProjectDetailsWrapper>
    );
  }

  if (project.length === 0 || !project[0]) {
    return (
      <ProjectDetailsWrapper>
        <PageHeader ghost title="Detalhes do projeto" />
        <Main>
          <Cards headless>
            <div style={{ padding: 20, textAlign: 'center' }}>
              <FeatherIcon icon="inbox" size={48} />
              <h3>Projeto não encontrado</h3>
              <p>O projeto solicitado não existe ou foi removido.</p>
            </div>
          </Cards>
        </Main>
      </ProjectDetailsWrapper>
    );
  }

  const current = project[0] || {};

  const {
    title = '',
    content = '',
    description = '',
    progress,
    total_tasks,
    completed_tasks,
    budget,
    spendings,
    hours_spent,
    start_date,
    end_date,
    owner,
    participants,
  } = current;

  const effectiveDescription = description || content || '';
  const rawProgress =
    typeof progress === 'number'
      ? progress
      : typeof current.percentage === 'number'
      ? current.percentage
      : 0;

  const effectiveProgress = Math.max(0, Math.min(100, Number.isFinite(rawProgress) ? rawProgress : 0));

  const totalTasks = typeof total_tasks === 'number' ? total_tasks : null;
  const completedTasks = typeof completed_tasks === 'number' ? completed_tasks : null;
  const projectSpendings = typeof spendings === 'number' ? spendings : null;
  const projectHours = typeof hours_spent === 'number' ? hours_spent : null;

  const startLabel = start_date ? new Date(start_date).toLocaleDateString() : null;
  const endLabel = end_date ? new Date(end_date).toLocaleDateString() : null;

  const ownerLabel = owner || '-';

  const participantsList = Array.isArray(participants) ? participants : [];

  const handleDelete = async () => {
    const numericId = current?.id ? Number(current.id) : Number(projectId);
    if (!numericId || Number.isNaN(numericId)) {
      return;
    }
    if (typeof window !== 'undefined') {
      const confirmed = window.confirm('Tem certeza que deseja excluir este projeto?');
      if (!confirmed) {
        return;
      }
    }
    try {
      await dispatch(deleteProject(numericId));
      notification.success({
        message: 'Projeto excluído com sucesso',
      });
      router.push('/admin/project/view/grid');
    } catch (error) {
      const status = error?.response?.status;
      let description = normalizeApiError(error, 'Erro ao excluir projeto (detalhes indisponíveis)');
      if (status === 405) {
        description = 'A API ainda não permite excluir projetos. Esta funcionalidade será implementada no backend.';
      }
      notification.error({
        message: 'Erro ao excluir projeto',
        description,
      });
    }
  };

  const handleNotImplemented = (featureLabel) => {
    notification.info({
      message: 'Funcionalidade em breve',
      description: `A ação "${featureLabel}" ainda não está disponível.`,
    });
  };

  return (
    <ProjectDetailsWrapper>
      <PageHeader
        ghost
        title={
          <div key="1" className="project-header">
            <Heading as="h2">{title}</Heading>
            <Button
              type="primary"
              size="small"
              onClick={() => router.push(`/admin/project/kanban/${projectId}`)}
            >
              <FeatherIcon icon="layout" size="14" /> Abrir quadro Kanban
            </Button>
            <Button
              type="default"
              size="small"
              onClick={() => {
                if (currentView !== 'tasklist') {
                  router.push(`/admin/project/projectDetails/${projectId}/tasklist?newTask=1`);
                } else if (typeof window !== 'undefined') {
                  window.dispatchEvent(new Event('openProjectNewTaskModal'));
                }
              }}
            >
              <FeatherIcon icon="plus" size="14" /> Adicionar tarefa
            </Button>
              <Button
              className="btn-markComplete"
              outlined
              type="white"
              size="small"
              onClick={async () => {
                const numericId = current?.id ? Number(current.id) : Number(projectId);
                if (!numericId || Number.isNaN(numericId)) {
                  return;
                }
                if (effectiveProgress < 100) {
                  notification.warning({
                    message: 'Progresso incompleto',
                    description: 'Conclua todas as tarefas para marcar o projeto como concluído.',
                  });
                  return;
                }
                try {
                  await api.put(`/projects/${numericId}`, {
                    status: 'complete',
                  });
                  notification.success({
                    message: 'Projeto marcado como concluído',
                  });
                  await dispatch(filterSinglePage(numericId));
                  router.refresh?.();
                } catch (error) {
                  const detail =
                    error.response?.data?.detail ||
                    error.response?.data?.error ||
                    error.message;
                  notification.error({
                    message: 'Erro ao marcar projeto como concluído',
                    description: detail,
                  });
                }
              }}
            >
              <FeatherIcon icon="check" size="14" /> Marcar como concluído
            </Button>
          </div>
        }
        buttons={[
          <div key="1" className="project-action">
            <span
              key={1}
              className="project-edit cursor-pointer"
              onClick={() => handleNotImplemented('Editar projeto')}
            >
              <FeatherIcon icon="edit-3" size={14} />
              Editar
            </span>
            <span key={2} className="project-remove cursor-pointer" onClick={handleDelete}>
              <FeatherIcon icon="trash-2" size={14} />
              Remover
            </span>
          </div>,
        ]}
      />
      <Main>
        <Row gutter={25}>
          <Col xxl={6} xl={8} xs={24}>
            <div className="project-progress">
              <h3>Progresso</h3>
              <Progress percent={effectiveProgress} size={[null, 5]} status="active" />
            </div>
            <Cards headless>
              <div className="state-single">
                <div className="color-primary">
                  <span className="cursor-pointer">
                    <FeatherIcon icon="list" size={25} />
                  </span>
                </div>
                <div>
                  <Heading as="h5">{totalTasks != null ? totalTasks : '-'}</Heading>
                  <p>Total de tarefas</p>
                </div>
              </div>
              <div className="state-single">
                <div className="color-secondary">
                  <span className="cursor-pointer">
                    <FeatherIcon icon="pie-chart" size={25} />
                  </span>
                </div>
                <div>
                  <Heading as="h5">{completedTasks != null ? completedTasks : '-'}</Heading>
                  <p>Tarefas concluídas</p>
                </div>
              </div>
              <div className="state-single">
                <div className="color-success">
                  <span className="cursor-pointer">
                    <FeatherIcon icon="layout" size={25} />
                  </span>
                </div>
                <div>
                  <Heading as="h5">
                    {projectSpendings != null ? `$${projectSpendings.toLocaleString()}` : '-'}
                  </Heading>
                  <p>Gastos</p>
                </div>
              </div>
              <div className="state-single">
                <div className="color-warning">
                  <span className="cursor-pointer">
                    <FeatherIcon icon="clock" size={25} />
                  </span>
                </div>
                <div>
                  <Heading as="h5">{projectHours != null ? projectHours : '-'}</Heading>
                  <p>Horas investidas</p>
                </div>
              </div>
            </Cards>
          </Col>
          <Col xxl={12} xl={16} xs={24}>
            <div className="about-project-wrapper">
              <Cards  title="Sobre o projeto">
                <div className="about-content">
                  <p>{effectiveDescription}</p>
                </div>
                <div className="about-project">
                  <div>
                    <span>Responsável pelo projeto</span>
                    <p>{ownerLabel}</p>
                  </div>
                  <div>
                    <span>Orçamento</span>
                    <p>{budget ? `$${budget.toLocaleString()}` : '-'}</p>
                  </div>
                  <div>
                    <span>Data de início</span>
                    <p className="color-primary">{startLabel || '-'}</p>
                  </div>
                  <div>
                    <span>Prazo</span>
                    <p className="color-danger">{endLabel || '-'}</p>
                  </div>
                </div>
              </Cards>
            </div>
          </Col>
          <Col xxl={6} lg={9} xs={24}>
            <div className="project-users-wrapper">
              <Cards
                title="Usuários"
                isbutton={
                  <Button
                    className="btn-addUser"
                    outlined
                    type="white"
                    size="small"
                    onClick={() => handleNotImplemented('Adicionar usuários')}
                  >
                    <FeatherIcon icon="user-plus" size={14} /> Adicionar usuários
                  </Button>
                }
              >
                <div className="project-users">
                  {participantsList.length
                    ? participantsList.map((p, index) => (
                        <div key={`${p.name}-${index}`} className="porject-user-single">
                          <div>
                            <img src={getImageUrl('static/img/users/1.png')} alt="" />
                          </div>
                          <div>
                            <Heading as="h5">{p.name}</Heading>
                            <p>{p.role || 'Participante'}</p>
                          </div>
                        </div>
                      ))
                    : (
                      <div className="porject-user-single">
                        <div>
                          <Heading as="h5">Nenhum participante</Heading>
                        </div>
                      </div>
                    )}
                </div>
              </Cards>
            </div>
          </Col>
          <Col xxl={16} lg={15} xs={24}>
            <TaskLists>
              <Cards
                title={
                  <nav>
                    <NextNavLink to={`/admin/project/projectDetails/${projectId}/tasklist`}>Tarefas</NextNavLink>
                    &nbsp; &nbsp;
                    <NextNavLink to={`/admin/project/projectDetails/${projectId}/activities`}>Atividades</NextNavLink>
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
