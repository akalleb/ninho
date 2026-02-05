import React, { useState } from 'react';
import { Row, Col, Progress, Button, Space, Flex } from 'antd';
import FeatherIcon from 'feather-icons-react';
import Styled from 'styled-components';
import { useSelector } from 'react-redux';
import { MinusOutlined, PlusOutlined } from '@ant-design/icons';
import { PageHeader } from '../../components/page-headers/page-headers';
import { Main } from '../styled';
import { Cards } from '../../components/cards/frame/cards-frame';
import { ShareButtonPageHeader } from '../../components/buttons/share-button/share-button';
import { ExportButtonPageHeader } from '../../components/buttons/export-button/export-button';
import { CalendarButtonPageHeader } from '../../components/buttons/calendar-button/calendar-button';

const ButtonGroup = Space.Compact;

const ProgressWrapper = Styled.div`
  .ant-progress-line {
    margin-bottom: 0;
  }
  
  .ant-progress-text {
    font-size: 14px;
    color: ${({ theme }) => theme['gray-color']};
  }
  
  .ant-progress-circle .ant-progress-text {
    font-size: 18px;
    font-weight: 500;
  }
  
  .ant-space-compact {
    margin-top: 15px;
  }
`;

function ProgressBar() {
  const rtl = useSelector((state) => state.ChangeLayoutMode.rtlData);
  const [state, setState] = useState({
    percent: 0,
  });

  const increase = () => {
    let percent = state.percent + 10;
    if (percent > 100) {
      percent = 100;
    }
    setState({ percent });
  };

  const decline = () => {
    let percent = state.percent - 10;
    if (percent < 0) {
      percent = 0;
    }
    setState({ percent });
  };

  return (
    <>
      <PageHeader
        ghost
        title="Progress Bar"
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
          <Col lg={12} md={12} xs={24}>
            <Cards title="Basic" caption="The simplest use of Progress bar">
            <Flex gap="small" vertical>
                <Progress percent={30}   />
                <Progress percent={50} status="active"  />
                <Progress percent={70} status="exception"   />
                <Progress percent={100}   />
                <Progress percent={50}  />
              </Flex>
            </Cards>
            <Cards title="Mini size Circular progress bar" caption="The simplest use of Progress bar">
              <ProgressWrapper>
                <Progress
                  type="circle"
                  percent={30}
                  
                  className="ml-15"
                />
                <Progress
                  type="circle"
                  percent={70}
                  
                  status="exception"
                  className="ml-15"
                />
                <Progress type="circle" percent={100}  />
              </ProgressWrapper>
            </Cards>
            <Cards title="Dashboard" caption="The simplest use of Progress bar">
              <ProgressWrapper>
                <Progress type="dashboard" percent={70} />
              </ProgressWrapper>
            </Cards>
            <Cards title="Square linecaps" caption="The simplest use of Progress bar">
              <ProgressWrapper>
                <Progress strokeLinecap="square" percent={75} style={{ marginBottom: '15px' }} />
                <Progress
                  strokeLinecap="square"
                  type="circle"
                  percent={75}
                  className="ml-15"
                />
                <Progress strokeLinecap="square" type="dashboard" percent={75} />
              </ProgressWrapper>
            </Cards>
          </Col>
          <Col lg={12} md={12} xs={24}>
            <Cards title="Circular progress bar" caption="The simplest use of Progress bar">
              <ProgressWrapper>
                <Progress type="circle" percent={75} style={{ [!rtl ? 'marginRight' : 'marginLeft']: '15px' }} />
                <Progress
                  type="circle"
                  percent={70}
                  status="exception"
                  className="ml-15"
                />
                <Progress type="circle" percent={100} />
              </ProgressWrapper>
            </Cards>
            <Cards title="Mini size progress bar" caption="The simplest use of Progress bar">
              <ProgressWrapper>
                <Progress size="small" percent={30} className="mb-15" />
                <Progress size="small" percent={70} status="exception" className="mb-15" />
                <Progress size="small" percent={100} />
              </ProgressWrapper>
            </Cards>
            <Cards title="Square linecaps" caption="The simplest use of Progress bar">
              <ProgressWrapper>
                <Progress strokeLinecap="square" percent={75} style={{ marginBottom: '15px' }} />
                <Progress
                  strokeLinecap="square"
                  type="circle"
                  percent={75}
                  className="ml-15"
                />
                <Progress strokeLinecap="square" type="dashboard" percent={75} />
              </ProgressWrapper>
            </Cards>
            <Cards title="Dynamic" caption="The simplest use of Progress bar">
              <ProgressWrapper>
                <Progress percent={state.percent} />
                <ButtonGroup>
                  <Button onClick={decline} icon={<MinusOutlined />} />
                  <Button onClick={increase} icon={<PlusOutlined />} />
                </ButtonGroup>
              </ProgressWrapper>
            </Cards>
            <Cards title="Custom Text" caption="The simplest use of Progress bar">
              <ProgressWrapper>
                <Progress
                  type="circle"
                  percent={75}
                  format={(percent) => `${percent} Days`}
                  className="ml-15"
                />
                <Progress type="circle" percent={100} format={() => 'Done'} />
              </ProgressWrapper>
            </Cards>
            <Cards title="Custom line gradient" caption="The simplest use of Progress bar">
              <ProgressWrapper>
                <Progress
                  strokeColor={{
                    '0%': '#2C99FF',
                    '100%': '#20C997',
                  }}
                  percent={99.9}
                  className="mb-15"
                />
                <Progress
                  strokeColor={{
                    from: '#2C99FF',
                    to: '#20C997',
                  }}
                  percent={99.9}
                  status="active"
                  className="mb-15"
                />
                <Progress
                  type="circle"
                  strokeColor={{
                    '0%': '#2C99FF',
                    '100%': '#20C997',
                  }}
                  percent={90}
                  className="ml-15"
                />
                <Progress
                  type="circle"
                  strokeColor={{
                    '0%': '#2C99FF',
                    '100%': '#20C997',
                  }}
                  percent={100}
                />
              </ProgressWrapper>
            </Cards>
          </Col>
        </Row>
      </Main>
    </>
  );
}

export default ProgressBar;
