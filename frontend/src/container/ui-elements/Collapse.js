import React, { useState } from 'react';
import { Row, Col, Collapse } from 'antd';
import FeatherIcon from 'feather-icons-react';
import { RightOutlined } from '@ant-design/icons';
import { PageHeader } from '../../components/page-headers/page-headers';
import { Main } from '../styled';
import { Cards } from '../../components/cards/frame/cards-frame';
import { Button } from '../../components/buttons/buttons';
import { ShareButtonPageHeader } from '../../components/buttons/share-button/share-button';
import { ExportButtonPageHeader } from '../../components/buttons/export-button/export-button';
import { CalendarButtonPageHeader } from '../../components/buttons/calendar-button/calendar-button';

function Collapses() {
  const [state, setstate] = useState({
    key: 0,
  });
  const callback = (key) => {
    setstate({ ...state, key });
  };

  const customPanelStyle = {
    background: '#F8F9FB',
    borderRadius: 3,
    marginBottom: 20,
    border: 0,
    overflow: 'hidden',
  };

  const dogText = 'A dog is a type of domesticated animal. Known for its loyalty and faithfulness, it can be found as a welcome guest in many households across the world.';

  return (
    <>
      <PageHeader
        title="Collapse"
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
          <Col md={12}>
            <Cards title="Basic">
              <Collapse 
                defaultActiveKey={['1']} 
                onChange={callback}
                items={[
                  {
                    key: '1',
                    label: 'This is panel header 1',
                    children: <p>{dogText}</p>,
                  },
                  {
                    key: '2',
                    label: 'This is panel header 2',
                    children: <p>{dogText}</p>,
                  },
                  {
                    key: '3',
                    label: 'This is panel header 3',
                    collapsible: 'disabled',
                    children: <p>{dogText}</p>,
                  },
                ]}
              />
            </Cards>
            <Cards title="Nested Panel">
              <Collapse 
                onChange={callback}
                items={[
                  {
                    key: '1',
                    label: 'This is panel header 1',
                    children: (
                      <Collapse 
                        defaultActiveKey="1"
                        items={[
                          {
                            key: '1',
                            label: 'This is panel nest panel',
                            children: <p>{dogText}</p>,
                          },
                        ]}
                      />
                    ),
                  },
                  {
                    key: '2',
                    label: 'This is panel header 2',
                    children: <p>{dogText}</p>,
                  },
                  {
                    key: '3',
                    label: 'This is panel header 3',
                    children: <p>{dogText}</p>,
                  },
                ]}
              />
            </Cards>
            <Cards title="No arrow">
              <Collapse 
                defaultActiveKey={['1']} 
                onChange={callback}
                items={[
                  {
                    key: '1',
                    label: 'This is panel header 1',
                    children: <p>{dogText}</p>,
                  },
                  {
                    key: '2',
                    label: 'This is panel header 2',
                    showArrow: false,
                    children: <p>{dogText}</p>,
                  },
                ]}
              />
            </Cards>
          </Col>
          <Col md={12}>
            <Cards title="Accordion">
              <Collapse 
                defaultActiveKey={['1']} 
                accordion
                items={[
                  {
                    key: '1',
                    label: 'This is panel header 1',
                    children: <p>{dogText}</p>,
                  },
                  {
                    key: '2',
                    label: 'This is panel header 2',
                    children: <p>{dogText}</p>,
                  },
                  {
                    key: '3',
                    label: 'This is panel header 3',
                    children: <p>{dogText}</p>,
                  },
                ]}
              />
            </Cards>
            <Cards title="Borderless">
              <Collapse 
                defaultActiveKey={['1']} 
                bordered={false}
                items={[
                  {
                    key: '1',
                    label: 'This is panel header 1',
                    children: <p className="pl-24">{dogText}</p>,
                  },
                  {
                    key: '2',
                    label: 'This is panel header 2',
                    children: <p className="pl-24">{dogText}</p>,
                  },
                  {
                    key: '3',
                    label: 'This is panel header 3',
                    children: <p className="pl-24">{dogText}</p>,
                  },
                ]}
              />
            </Cards>
            <Cards title="Custom Panel">
              <Collapse
                bordered={false}
                defaultActiveKey={['1']}
                expandIcon={({ isActive }) => <RightOutlined rotate={isActive ? 90 : 0} />}
                items={[
                  {
                    key: '1',
                    label: 'This is panel header 1',
                    children: <p>{dogText}</p>,
                    style: customPanelStyle,
                  },
                  {
                    key: '2',
                    label: 'This is panel header 2',
                    children: <p>{dogText}</p>,
                    style: customPanelStyle,
                  },
                  {
                    key: '3',
                    label: 'This is panel header 3',
                    children: <p>{dogText}</p>,
                    style: customPanelStyle,
                  },
                ]}
              />
            </Cards>
          </Col>
        </Row>
      </Main>
    </>
  );
}

export default Collapses;
