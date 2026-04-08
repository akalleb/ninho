import React from 'react';
import PropTypes from 'prop-types';
import { Col, Row } from 'antd';
import { UserCard } from '../style';
import Heading from '../../../components/heading/heading';
import { Cards } from '../../../components/cards/frame/cards-frame';
import { getImageUrl } from '../../../utility/getImageUrl';

function UserCards({ user, hideImage, hideStats }) {
  const { name, designation, img } = user;

  return (
    <UserCard>
      <div className="card user-card">
        <Cards headless>
          {!hideImage && (
            <figure>
              <div style={{ position: 'relative' }}>
                <img
                  src={getImageUrl(img)}
                  alt=""
                  onError={(e) => {
                    e.target.onerror = null;
                    e.target.src = getImageUrl('static/img/users/1.png');
                  }}
                />
              </div>
            </figure>
          )}
          <figcaption>
            <div className="card__content">
              <Heading className="card__name" as="h6">
                <span className="cursor-pointer">{name}</span>
              </Heading>
              <p className="card__designation">{designation}</p>
            </div>

            {!hideStats && (
              <div className="card__info">
                <Row gutter={15}>
                  <Col xs={8}>
                    <div className="info-single">
                      <Heading className="info-single__title" as="h2">
                        $72,572
                      </Heading>
                      <p>Total Revenue</p>
                    </div>
                  </Col>
                  <Col xs={8}>
                    <div className="info-single">
                      <Heading className="info-single__title" as="h2">
                        3,257
                      </Heading>
                      <p>Orders</p>
                    </div>
                  </Col>
                  <Col xs={8}>
                    <div className="info-single">
                      <Heading className="info-single__title" as="h2">
                        74
                      </Heading>
                      <p>Products</p>
                    </div>
                  </Col>
                </Row>
              </div>
            )}
          </figcaption>
        </Cards>
      </div>
    </UserCard>
  );
}

UserCards.propTypes = {
  user: PropTypes.object,
  hideImage: PropTypes.bool,
  hideStats: PropTypes.bool,
};

export default UserCards;
