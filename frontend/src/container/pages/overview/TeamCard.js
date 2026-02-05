import React from 'react';
import FeatherIcon from 'feather-icons-react';
import FontAwesome from 'react-fontawesome';
import PropTypes from 'prop-types';
import { UserCard } from '../style';
import Heading from '../../../components/heading/heading';
import { Cards } from '../../../components/cards/frame/cards-frame';
import { Dropdown } from '../../../components/dropdown/dropdown';
import { getImageUrl } from '../../../utility/getImageUrl';

function TeamCard({ user, actions }) {
  const { name, designation, img } = user;

  return (
    <UserCard>
      <div className="card team-card">
        <Cards headless>
          <figure>
            <img src={getImageUrl(img)} alt="" />
            <figcaption>
              <div className="edit">
                <Dropdown content={actions} action={['click']} className="wide-dropdwon">
                  <span className="card__more_actions cursor-pointer">
                    <FeatherIcon icon="more-horizontal" size={16} />
                  </span>
                </Dropdown>
              </div>
              <Heading className="card__name" as="h6">
                <span className="cursor-pointer">{name}</span>
              </Heading>
              <span className="card__designation">{designation}</span>
              <div className="card__social">
                <a href="#" className="btn-icon facebook cursor-pointer">
                  <FontAwesome name="facebook" />
                </a>
                <a href="#" className="btn-icon twitter cursor-pointer">
                  <FontAwesome name="twitter" />
                </a>
                <a href="#" className="btn-icon dribble cursor-pointer">
                  <FontAwesome name="dribbble" />
                </a>
                <a href="#" className="btn-icon instagram cursor-pointer">
                  <FontAwesome name="instagram" />
                </a>
              </div>
            </figcaption>
          </figure>
        </Cards>
      </div>
    </UserCard>
  );
}

TeamCard.propTypes = {
  user: PropTypes.object,
  actions: PropTypes.node,
};

export default TeamCard;
