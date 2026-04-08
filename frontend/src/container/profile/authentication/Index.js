import React from 'react';
import Image from 'next/image';
import { Row, Col } from 'antd';
import { Aside, Content } from './overview/style';
import { getImageUrl } from '../../../utility/getImageUrl';

const AuthLayout = (WraperContent) => {
  return function () {
    return (
      <Row>
        <Col xxl={8} xl={9} lg={12} md={8} xs={24}>
          <Aside style={{ minHeight: '100vh', position: 'relative', overflow: 'hidden' }}>
            <div className="auth-side-content">
              <Image
                src={getImageUrl('static/img/auth/topShape.png')}
                alt=""
                className="topShape"
                width={400}
                height={220}
                style={{ position: 'absolute', top: 0, right: 0, width: 400, height: 'auto' }}
              />
              <Image
                src={getImageUrl('static/img/auth/bottomShape.png')}
                alt=""
                className="bottomShape"
                width={420}
                height={220}
                style={{ position: 'absolute', bottom: 0, left: 0, width: 420, height: 'auto' }}
              />
              <Content style={{ minHeight: '100vh', position: 'relative', zIndex: 10 }}>
                <Image
                  className="w-150px"
                  src={getImageUrl('static/img/Logo_Dark.svg')}
                  alt=""
                  width={150}
                  height={48}
                  style={{ width: 150, height: 'auto', marginBottom: 24 }}
                  priority={true}
                />
                <Image
                  className="auth-content-figure"
                  src={getImageUrl('static/img/auth/Illustration.png')}
                  alt=""
                  width={520}
                  height={420}
                  style={{ maxWidth: '100%', height: 'auto' }}
                />
              </Content>
            </div>
          </Aside>
        </Col>

        <Col xxl={16} xl={15} lg={12} md={16} xs={24}>
          <WraperContent />
        </Col>
      </Row>
    );
  };
};

export default AuthLayout;
