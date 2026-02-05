import React from 'react';
import PropTypes from 'prop-types';
import { Progress } from 'antd';
import FeatherIcon from 'feather-icons-react';
import { UserCard } from '../style';
import Heading from '../../../components/heading/heading';
import { Cards } from '../../../components/cards/frame/cards-frame';
import { Dropdown } from '../../../components/dropdown/dropdown';
import { getImageUrl } from '../../../utility/getImageUrl';

function UserCardGroup({ user }) {
  const { title, company, img, icon, content } = user;
  return (
    <UserCard>
      <div className="card user-card theme-grid-3">
        <Cards headless>
          <div className="card__top">
            <div className="user-card__img">
              <img src={getImageUrl(icon)} alt="" />
            </div>
            <div className="user-card__info">
              <Heading className="card__name" as="h6">
                <span className="name-text cursor-pointer">
                  {title}
                </span>
                <p className="card__designation">{company}</p>
              </Heading>
              <Dropdown
                content={
                  <>
                    <a href="#" className="cursor-pointer d-block">View</a>
                    <a href="#" className="cursor-pointer d-block">Edit</a>
                    <a href="#" className="cursor-pointer d-block">Leave</a>
                    <a href="#" className="cursor-pointer d-block">Delete</a>
                  </>
                }
              >
                <span className="action-more cursor-pointer d-inline-block">
                  <FeatherIcon icon="more-horizontal" />
                </span>
              </Dropdown>
            </div>
          </div>
          <div className="card__content">
            <p>{content}</p>
            <div className="image-group">
              {img.map((item, key) => {
                return <img key={key + 1} src={getImageUrl(item)} alt="" />;
              })}
            </div>
          </div>
          <div className="card__info">
            <p className="info-line">
              <span>Current project</span>
              <span>Project Completed</span>
            </p>
            <h2 className="info-line">
              <span>Plugin Development</span>
              <span className="success bg-none-important">
                45
              </span>
            </h2>
            <div className="project-progress">
              <Progress
                percent={70}
                size={[null, 5]}
                status="active"
                showInfo={false}
                className="progress-dt progress-primary"
              />
              <div className="progress-percentage">
                <span>70%</span>
              </div>
            </div>
            <p className="completed-count">12 / 15 tasks completed</p>
          </div>
        </Cards>
      </div>
    </UserCard>
  );
}

UserCardGroup.propTypes = {
  user: PropTypes.object,
};

export default UserCardGroup;
