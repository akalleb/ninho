import React, { useState } from 'react';
import { Row, Col, Rate } from 'antd';
import FeatherIcon from 'feather-icons-react';
import Styled from 'styled-components';
import { Button } from '../../components/buttons/buttons';
import { PageHeader } from '../../components/page-headers/page-headers';
import { Main } from '../styled';
import { Cards } from '../../components/cards/frame/cards-frame';
import { ShareButtonPageHeader } from '../../components/buttons/share-button/share-button';
import { ExportButtonPageHeader } from '../../components/buttons/export-button/export-button';
import { CalendarButtonPageHeader } from '../../components/buttons/calendar-button/calendar-button';

const RateWrapper = Styled.div`
  .ant-rate {
    font-size: 20px;
    color: ${({ theme }) => theme['warning-color']};
  }
  
  .ant-rate-star-full .anticon,
  .ant-rate-star-half .anticon {
    color: ${({ theme }) => theme['warning-color']};
  }
  
  .ant-rate-star-zero .anticon {
    color: ${({ theme }) => theme['border-color-deep']};
  }
  
  .ant-rate-content {
    display: flex;
    align-items: center;
    gap: 10px;
    font-size: 14px;
  }
  
  .ant-rate-text {
    font-size: 14px;
    color: ${({ theme }) => theme['gray-color']};
    margin-left: 10px;
  }
`;

function Rating() {
  const desc = ['terrible', 'bad', 'normal', 'good', 'wonderful'];
  const [state, setState] = useState({
    value: 3,
  });

  const handleChange = value => {
    setState({ value });
  };

  const { value } = state;
  return (
    <>
      <PageHeader
        title="Rating"
        buttons={[
          <div key="1" className="page-header-actions">
            <CalendarButtonPageHeader />
            <ExportButtonPageHeader />
            <ShareButtonPageHeader />
            <Button size="small" type="primary">
              <FeatherIcon icon="plus" size={14} />
              Add New
            </Button>
          </div>,
        ]}
      />
      <Main>
        <Row gutter={25}>
          <Col sm={12} xs={24}>
            <Cards title="Basic" caption="The simplest use of Rate">
              <RateWrapper>
                <Rate />
              </RateWrapper>
            </Cards>
            <Cards title="Half Star">
              <RateWrapper>
                <Rate allowHalf defaultValue={2.5} />
              </RateWrapper>
            </Cards>
            <Cards title="Rater">
              <RateWrapper>
                <span className="ant-rate-content">
                  <Rate tooltips={desc} onChange={handleChange} value={value} />
                  {value ? <span>{`${value} Star`}</span> : ''}
                </span>
              </RateWrapper>
            </Cards>
          </Col>
          <Col sm={12} xs={24}>
            <Cards title="Clear Star">
              <RateWrapper>
                <Rate disabled defaultValue={2} />
              </RateWrapper>
            </Cards>
            <Cards title="Clear Star">
              <RateWrapper>
                <Rate defaultValue={3} />
                <span className="ant-rate-text">allowClear: true</span>
                <br />
                <Rate allowClear={false} defaultValue={3} className="mt-10" />
                <span className="ant-rate-text">allowClear: false</span>
              </RateWrapper>
            </Cards>
          </Col>
        </Row>
      </Main>
    </>
  );
}

export default Rating;
