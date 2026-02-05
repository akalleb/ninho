import React from 'react';
import { Row, Col, Result, Button, Typography } from 'antd';
import FeatherIcon from 'feather-icons-react';
import { NextNavLink } from '../../components/utilities/NextLink';
import Styled from 'styled-components';
import { CloseCircleOutlined } from '@ant-design/icons';
import { PageHeader } from '../../components/page-headers/page-headers';
import { Main } from '../styled';
import { Cards } from '../../components/cards/frame/cards-frame';
import { ShareButtonPageHeader } from '../../components/buttons/share-button/share-button';
import { ExportButtonPageHeader } from '../../components/buttons/export-button/export-button';
import { CalendarButtonPageHeader } from '../../components/buttons/calendar-button/calendar-button';

const { Paragraph, Text } = Typography;

const ResultWrapper = Styled.div`
  .ant-result-extra {
    margin-top: 20px;
    
    button {
      height: 38px;
      padding: 0 20px;
      font-size: 14px;
      min-width: 100px;
      
      &:not(:last-child) {
        margin-right: 8px;
      }
    }
  }
`;
function Results() {
  return (
    <>
      <PageHeader
        title="Results"
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
          <Col md={12} xs={24}>
            <Cards title="Success" caption="The simplest use of Results">
              <ResultWrapper>
                <Result
                  status="success"
                  title="Successfully Purchased Cloud Server ECS!"
                  subTitle="Order number: 2017182818828182881 Cloud server configuration takes 1-5 minutes, please wait."
                  className="p-0"
                  extra={[
                    <Button type="primary" key="console">
                      Go Console
                    </Button>,
                    <Button key="buy">Buy Again</Button>,
                  ]}
                />
              </ResultWrapper>
            </Cards>
            <Cards title="Warning" caption="The simplest use of Results">
              <ResultWrapper>
                <Result
                  status="warning"
                  title="There are some problems with your operation."
                  className="p-0"
                  extra={
                    <Button type="primary" key="console">
                      Go Console
                    </Button>
                  }
                />
              </ResultWrapper>
            </Cards>
            <Cards title="404" caption="The simplest use of Results">
              <ResultWrapper>
                <Result
                  status="404"
                  title="404"
                  subTitle="Sorry, the page you visited does not exist."
                  className="p-0"
                  extra={<Button type="primary">Back Home</Button>}
                />
              </ResultWrapper>
            </Cards>
            <Cards title="Error" caption="The simplest use of Results">
              <ResultWrapper>
                <Result
                  status="error"
                  title="Submission Failed"
                  subTitle="Please check and modify the following information before resubmitting."
                  className="p-0"
                  extra={[
                    <Button type="primary" key="console">
                      Go Console
                    </Button>,
                    <Button key="buy">Buy Again</Button>,
                  ]}
                >
                  <div className="desc">
                    <Paragraph>
                      <Text
                        strong
                        className="font-size-16"
                      >
                        The content you submitted has the following error:
                      </Text>
                    </Paragraph>
                    <Paragraph>
                      <CloseCircleOutlined className="text-red" /> Your account has been frozen
                      <a href="#">Thaw immediately &gt;</a>
                    </Paragraph>
                    <Paragraph>
                      <CloseCircleOutlined className="text-red" /> Your account is not yet eligible to apply{' '}
                      <a href="#">Apply Unlock &gt;</a>
                    </Paragraph>
                  </div>
                </Result>
              </ResultWrapper>
            </Cards>
          </Col>
          <Col md={12} xs={24}>
            <Cards title="Info" caption="The simplest use of Results">
              <ResultWrapper>
                <Result
                  title="Your operation has been executed"
                  className="p-0"
                  extra={
                    <Button type="primary" key="console">
                      Go Console
                    </Button>
                  }
                />
              </ResultWrapper>
            </Cards>
            <Cards title="403" caption="The simplest use of Results">
              <ResultWrapper>
                <Result
                  status="403"
                  title="403"
                  subTitle="Sorry, you are not authorized to access this page."
                  className="p-0"
                  extra={<Button type="primary">Back Home</Button>}
                />
              </ResultWrapper>
            </Cards>
            <Cards title="500" caption="The simplest use of Results">
              <ResultWrapper>
                <Result
                  status="500"
                  title="500"
                  subTitle="Sorry, the server is wrong."
                  className="p-0"
                  extra={<Button type="primary">Back Home</Button>}
                />
              </ResultWrapper>
            </Cards>
          </Col>
        </Row>
      </Main>
    </>
  );
}

export default Results;
