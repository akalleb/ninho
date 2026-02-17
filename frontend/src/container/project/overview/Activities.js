import React from 'react';
import FeatherIcon from 'feather-icons-react';
import { Col, Row } from 'antd';
import Heading from '../../../components/heading/heading';
import { ActivitiesWrapper } from '../style';
import { getImageUrl } from '../../../utility/getImageUrl';

function Activities() {
  return (
    <ActivitiesWrapper>
      <div className="activity-block">
        <Row gutter={15}>
          <Col xxl={3} lg={5} md={4} sm={5} xs={24}>
            <div className="activity-dateMeta">
              <Heading as="h4">-</Heading>
              <span className="activity-month">Sem atividades</span>
            </div>
          </Col>
          <Col xxl={21} lg={19} md={20} sm={19} xs={24}>
            <div className="activity-single d-flex">
              <div className="activity-single__content">
                <Heading className="activity-title" as="h5">
                  Nenhuma atividade registrada para este projeto.
                </Heading>
              </div>
            </div>
          </Col>
        </Row>
      </div>
    </ActivitiesWrapper>
  );
}

export default Activities;
