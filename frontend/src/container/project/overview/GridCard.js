import React from 'react';
import { Progress, Tag } from 'antd';
import FeatherIcon from 'feather-icons-react';
import { NextLink } from '../../../components/utilities/NextLink';
import PropTypes from 'prop-types';
import { Cards } from '../../../components/cards/frame/cards-frame';
import { Dropdown } from '../../../components/dropdown/dropdown';
import { textRefactor } from '../../../components/utilities/utilities';
import { ProjectCard } from '../style';
import { getImageUrl } from '../../../utility/getImageUrl';

function GridCard({ value }) {
  const { id, title, status, content, percentage, start_date, end_date, participants, total_tasks, completed_tasks } = value;

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
  return (
    <ProjectCard>
      <Cards headless>
        <div className="project-top">
          <div className="project-title">
            <h1>
              <NextLink href={`/admin/project/projectDetails/${id}`}>{title}</NextLink>
              <Tag className={status}>{status}</Tag>
            </h1>
            <Dropdown
              content={
                <>
                  <span className="cursor-pointer">Receita total</span>
                  <span className="cursor-pointer">Despesas totais</span>
                  <span className="cursor-pointer">Impostos totais</span>
                  <span className="cursor-pointer">Lucro líquido</span>
                </>
              }
            >
              <span className="cursor-pointer">
                <FeatherIcon icon="more-horizontal" size={18} />
              </span>
            </Dropdown>
          </div>
          <p className="project-desc">{textRefactor(content, 13)}</p>
          <div className="project-timing">
            <div>
              <span>Data de início</span>
              <strong>{startLabel || '-'}</strong>
            </div>
            <div>
              <span>Prazo</span>
              <strong>{endLabel || '-'}</strong>
            </div>
          </div>
          <div className="project-progress">
            <Progress
              percent={status === 'complete' ? 100 : effectivePercentage}
              size={[null, 5]}
              status="primary"
              className="progress-primary"
              showInfo
            />
            <p>
              {completedTasks != null && totalTasks != null
                ? `${completedTasks}/${totalTasks} tarefas concluídas`
                : 'Dados de tarefas indisponíveis'}
            </p>
          </div>
        </div>
        <div className="project-bottom">
          <div className="project-assignees">
            <p>Atribuído a</p>
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
          </div>
        </div>
      </Cards>
    </ProjectCard>
  );
}

GridCard.propTypes = {
  value: PropTypes.object,
};

export default GridCard;
