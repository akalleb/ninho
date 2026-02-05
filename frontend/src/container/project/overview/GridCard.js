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
  const { id, title, status, content, percentage } = value;
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
                  <span className="cursor-pointer">Total Income</span>
                  <span className="cursor-pointer">Total Expense</span>
                  <span className="cursor-pointer">Total Tax</span>
                  <span className="cursor-pointer">Net Profit</span>
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
              <span>Start Date</span>
              <strong>26 Dec 2019</strong>
            </div>
            <div>
              <span>Deadline</span>
              <strong>18 Mar 2020</strong>
            </div>
          </div>
          <div className="project-progress">
            <Progress
              percent={status === 'complete' ? 100 : percentage}
              size={[null, 5]}
              status="primary"
              className="progress-primary"
              showInfo
            />
            <p>12/15 Task Completed</p>
          </div>
        </div>
        <div className="project-bottom">
          <div className="project-assignees">
            <p>Assigned To</p>
            <ul>
              <li>
                <img src={getImageUrl('static/img/users/1.png')} alt="" />
              </li>
              <li>
                <img src={getImageUrl('static/img/users/2.png')} alt="" />
              </li>
              <li>
                <img src={getImageUrl('static/img/users/3.png')} alt="" />
              </li>
              <li>
                <img src={getImageUrl('static/img/users/4.png')} alt="" />
              </li>
              <li>
                <img src={getImageUrl('static/img/users/5.png')} alt="" />
              </li>
              <li>
                <img src={getImageUrl('static/img/users/6.png')} alt="" />
              </li>
              <li>
                <img src={getImageUrl('static/img/users/7.png')} alt="" />
              </li>
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
