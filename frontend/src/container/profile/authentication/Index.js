import React from 'react';
import { Row, Col } from 'antd';
import { Aside, Content } from './overview/style';
import Heading from '../../../components/heading/heading';
import { getImageUrl } from '../../../utility/getImageUrl';

const AuthLayout = (WraperContent) => {
  return function () {
    return (
      <Row>
        <Col xxl={12} xl={12} lg={12} md={8} xs={24}>
          <Aside>
            <img src={getImageUrl('static/img/auth/topShape.png')} alt="" className="topShape" />
            <img src={getImageUrl('static/img/auth/bottomShape.png')} alt="" className="bottomShape" />
            <Content>
              <img className="logo-image" src={getImageUrl('static/img/Logo_Dark.svg')} alt="" />
              <img
                className="auth-content-figure"
                src={getImageUrl('static/img/auth/Illustration.png')}
                alt=""
              />
            </Content>
          </Aside>
        </Col>

        <Col xxl={12} xl={12} lg={12} md={16} xs={24}>
          <WraperContent />
        </Col>
      </Row>
    );
  };
};

export default AuthLayout;
