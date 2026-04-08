import React from 'react';
import FeatherIcon from 'feather-icons-react';
import PropTypes from 'prop-types';
import { UserCard } from '../style';
import Heading from '../../../components/heading/heading';
import { Cards } from '../../../components/cards/frame/cards-frame';
import { Button } from '../../../components/buttons/buttons';
import { getImageUrl } from '../../../utility/getImageUrl';

function UserCardStyle({ user }) {
  const { name, designation, img, cover } = user;
  return (
    <UserCard cover={cover}>
      <div className="card user-card theme-grid-2">
        <Cards headless>
          <figure>
            <div className="user-card__img">
              <img src={getImageUrl(img)} alt="" />
            </div>

            <figcaption>
              <div
                className="user-card__bg"
                className="h-150px"
                style={{
                  background: `url(${getImageUrl(cover)})`,
                }}
              />
              <div className="card__bottom">
                <div className="card__content">
                  <Heading className="card__name" as="h6">
                    <span className="cursor-pointer">{name}</span>
                  </Heading>
                  <p className="card__designation">{designation}</p>
                </div>

                <div className="card__actions">
                  <Button size="default" type="white">
                    <FeatherIcon icon="message-square" size={14} />
                    Chat
                  </Button>
                  <Button size="default" type="white">
                    View Profile
                  </Button>
                </div>
              </div>
            </figcaption>
          </figure>
        </Cards>
      </div>
    </UserCard>
  );
}

UserCardStyle.propTypes = {
  user: PropTypes.object,
};

export default UserCardStyle;
