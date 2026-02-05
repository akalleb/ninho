import React from 'react';
import { Row, Col, Timeline } from 'antd';
import FeatherIcon from 'feather-icons-react';
import { ClockCircleOutlined } from '@ant-design/icons';
import { TimeLinePointerIconWrap, TimelineNormalWrap, TimelineBoxWrap } from './ui-elements-styled';
import { PageHeader } from '../../components/page-headers/page-headers';
import { Main } from '../styled';
import { Cards } from '../../components/cards/frame/cards-frame';
import { Button } from '../../components/buttons/buttons';
import { ShareButtonPageHeader } from '../../components/buttons/share-button/share-button';
import { ExportButtonPageHeader } from '../../components/buttons/export-button/export-button';
import { CalendarButtonPageHeader } from '../../components/buttons/calendar-button/calendar-button';
import {
  SwRocket,
  SwShieldCheck,
  SwPenTool,
  SwNotification,
  SwUsers,
  SwLayers,
  SwPicture,
  SwClock,
  SwEllipse,
} from '../../components/utilities/icons';

function Timelines() {
  return (
    <>
      <PageHeader
        title="Timelines"
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
          <Col lg={12} xs={24}>
            <Cards title="Basic" caption="The simplest use of Timelines">
              <TimeLinePointerIconWrap>
                <Timeline
                  items={[
                    {
                      className: 'primary',
                      dot: <SwRocket size={20} color="#5F63F2" />,
                      children: (
                        <>
                          <h3>02:30 PM</h3>
                          <p>Lorem Ipsum is simply dummy text of the printing and typesetting industry.</p>
                          <span className="tags">HTML,CSS,VueJS</span>
                        </>
                      ),
                    },
                    {
                      className: 'info',
                      dot: <SwShieldCheck size={20} color="#2C99FF" />,
                      children: (
                        <>
                          <h3>02:30 PM</h3>
                          <p>Lorem Ipsum is simply dummy text of the printing and typesetting industry.</p>
                          <span className="tags">HTML,CSS,VueJS</span>
                        </>
                      ),
                    },
                    {
                      className: 'warning',
                      dot: <SwPenTool size={24} color="#fa8b0c" />,
                      children: (
                        <>
                          <h3>02:30 PM</h3>
                          <p>Lorem Ipsum is simply dummy text of the printing and typesetting industry.</p>
                          <span className="tags">HTML,CSS,VueJS</span>
                        </>
                      ),
                    },
                    {
                      className: 'pink',
                      dot: <SwNotification size={17} color="#FF69A5" />,
                      children: (
                        <>
                          <h3>02:30 PM</h3>
                          <p>Lorem Ipsum is simply dummy text of the printing and typesetting industry.</p>
                          <span className="tags">HTML,CSS,VueJS</span>
                        </>
                      ),
                    },
                    {
                      className: 'success',
                      dot: <SwUsers size={21} color="#20c997" />,
                      children: (
                        <>
                          <h3>02:30 PM</h3>
                          <p>Lorem Ipsum is simply dummy text of the printing and typesetting industry.</p>
                          <span className="tags">HTML,CSS,VueJS</span>
                        </>
                      ),
                    },
                    {
                      className: 'danger',
                      dot: <SwLayers size={21} color="#ff4d4f" />,
                      children: (
                        <>
                          <h3>02:30 PM</h3>
                          <p>Lorem Ipsum is simply dummy text of the printing and typesetting industry.</p>
                          <span className="tags">HTML,CSS,VueJS</span>
                        </>
                      ),
                    },
                    {
                      className: 'primary',
                      dot: <SwPicture size={21} color="#5f63f2" />,
                      children: (
                        <>
                          <h3>02:30 PM</h3>
                          <p>Lorem Ipsum is simply dummy text of the printing and typesetting industry.</p>
                          <span className="tags">HTML,CSS,VueJS</span>
                        </>
                      ),
                    },
                    {
                      className: 'pink',
                      dot: <SwClock size={21} color="#ff69a5" />,
                      children: (
                        <>
                          <h3>02:30 PM</h3>
                          <p>Lorem Ipsum is simply dummy text of the printing and typesetting industry.</p>
                          <span className="tags">HTML,CSS,VueJS</span>
                        </>
                      ),
                    },
                  ]}
                />
              </TimeLinePointerIconWrap>
            </Cards>
            <Cards title="Basic" caption="The simplest use of Timelines">
              <TimelineNormalWrap>
                <Timeline
                  items={[
                    { children: 'Create a services site 2015-09-01' },
                    { children: 'Solve initial network problems 2015-09-01' },
                    { children: 'Technical testing 2015-09-01' },
                    { children: 'Network problems being solved 2015-09-01' },
                  ]}
                />
              </TimelineNormalWrap>
            </Cards>
            <TimelineNormalWrap>
              <Cards title="Alternate" caption="The simplest use of Timelines">
                <Timeline
                  mode="alternate"
                  items={[
                    { children: 'Create a services site 2015-09-01' },
                    { color: 'green', children: 'Solve initial network problems 2015-09-01' },
                    {
                      dot: <ClockCircleOutlined className="font-size-16" />,
                      children: 'Sed ut perspiciatis unde omnis iste natus error sit voluptatem accusantium doloremque laudantium, totam rem aperiam, eaque ipsa quae ab illo inventore veritatis et quasi architecto beatae vitae dicta sunt explicabo.',
                    },
                    { color: 'red', children: 'Network problems being solved 2015-09-01' },
                    { children: 'Create a services site 2015-09-01' },
                    {
                      dot: <ClockCircleOutlined className="font-size-16" />,
                      children: 'Technical testing 2015-09-01',
                    },
                  ]}
                />
              </Cards>
            </TimelineNormalWrap>
            <TimelineNormalWrap>
              <Cards title="Custom" caption="The simplest use of Timelines">
                <Timeline
                  items={[
                    { children: 'Create a services site 2015-09-01' },
                    { children: 'Solve initial network problems 2015-09-01' },
                    {
                      dot: <ClockCircleOutlined className="font-size-16" />,
                      color: 'red',
                      children: 'Technical testing 2015-09-01',
                    },
                    { children: 'Network problems being solved 2015-09-01' },
                  ]}
                />
              </Cards>
            </TimelineNormalWrap>
          </Col>
          <Col lg={12} xs={24}>
            <TimelineNormalWrap>
              <Cards title="Timeline 1" caption="The simplest use of Timelines">
                <Timeline
                  items={[
                    {
                      className: 'active',
                      dot: <SwEllipse size={10} color="#ADB4D2" />,
                      children: (
                        <div className="timeline-content-inner align-center-v justify-content-between">
                          <div className="timeline-content-text">
                            <p>Contrary to popular belief, Lorem Ipsum is not simply random text.</p>
                          </div>
                          <span className="timeline-content-time">6:00 am</span>
                        </div>
                      ),
                    },
                    {
                      dot: <SwEllipse size={10} color="#5F63F2" />,
                      children: (
                        <div className="timeline-content-inner align-center-v justify-content-between">
                          <div className="timeline-content-text">
                            <p>Contrary to popular belief, Lorem Ipsum is not simply random text.</p>
                          </div>
                          <span className="timeline-content-time">1 hrs</span>
                        </div>
                      ),
                    },
                    {
                      dot: <SwEllipse size={10} color="#2C99FF" />,
                      children: (
                        <div className="timeline-content-inner align-center-v justify-content-between">
                          <div className="timeline-content-text">
                            <p>Contrary to popular belief, Lorem Ipsum is not simply random text.</p>
                          </div>
                          <span className="timeline-content-time">2 days</span>
                        </div>
                      ),
                    },
                    {
                      dot: <SwEllipse size={10} color="#20C997" />,
                      children: (
                        <div className="timeline-content-inner align-center-v justify-content-between">
                          <div className="timeline-content-text">
                            <p>Contrary to popular belief, Lorem Ipsum is not simply random text.</p>
                          </div>
                          <span className="timeline-content-time">3 weeks</span>
                        </div>
                      ),
                    },
                    {
                      dot: <SwEllipse size={10} color="#FA8B0C" />,
                      children: (
                        <div className="timeline-content-inner align-center-v justify-content-between">
                          <div className="timeline-content-text">
                            <p>Contrary to popular belief, Lorem Ipsum is not simply random text.</p>
                          </div>
                          <span className="timeline-content-time">2 months</span>
                        </div>
                      ),
                    },
                  ]}
                />
              </Cards>
            </TimelineNormalWrap>

            <TimelineBoxWrap>
              <Cards title="Timeline 2" caption="The simplest use of Timelines">
                <Timeline
                  mode="alternate"
                  items={[
                    {
                      dot: <SwEllipse size={10} color="#ADB4D2" />,
                      children: (
                        <>
                          <h2>10:00 AM</h2>
                          <div className="content-box">
                            <p>
                              Lorem Ipsum is simply dummy text of theprintng and typesetting industry. Lorem Ipsum has been
                              the industry`s standard dummy text ever since the,
                            </p>
                          </div>
                        </>
                      ),
                    },
                    {
                      dot: <SwEllipse size={10} color="#5F63F2" />,
                      children: (
                        <>
                          <h2>10:00 AM</h2>
                          <div className="content-box">
                            <p>
                              Lorem Ipsum is simply dummy text of theprintng and typesetting industry. Lorem Ipsum has been
                              the industry`s standard dummy text ever since the,
                            </p>
                          </div>
                        </>
                      ),
                    },
                    {
                      dot: <SwEllipse size={10} color="#2C99FF" />,
                      children: (
                        <>
                          <h2>10:00 AM</h2>
                          <div className="content-box">
                            <p>
                              Lorem Ipsum is simply dummy text of theprintng and typesetting industry. Lorem Ipsum has been
                              the industry`s standard dummy text ever since the,
                            </p>
                          </div>
                        </>
                      ),
                    },
                    {
                      dot: <SwEllipse size={10} color="#20C997" />,
                      children: (
                        <>
                          <h2>10:00 AM</h2>
                          <div className="content-box">
                            <p>
                              Lorem Ipsum is simply dummy text of theprintng and typesetting industry. Lorem Ipsum has been
                              the industry`s standard dummy text ever since the,
                            </p>
                          </div>
                        </>
                      ),
                    },
                    {
                      dot: <SwEllipse size={10} color="#FA8B0C" />,
                      children: (
                        <>
                          <h2>10:00 AM</h2>
                          <div className="content-box">
                            <p>
                              Lorem Ipsum is simply dummy text of theprintng and typesetting industry. Lorem Ipsum has been
                              the industry`s standard dummy text ever since the,
                            </p>
                          </div>
                        </>
                      ),
                    },
                  ]}
                />
              </Cards>
            </TimelineBoxWrap>
            <TimelineNormalWrap>
              <Cards title="Color" caption="The simplest use of Timelines">
                <Timeline
                  items={[
                    { color: 'green', children: 'Create a services site 2015-09-01' },
                    { color: 'green', children: 'Create a services site 2015-09-01' },
                    {
                      color: 'red',
                      children: (
                        <>
                          <p>Solve initial network problems 1</p>
                          <p>Solve initial network problems 2</p>
                          <p>Solve initial network problems 3 2015-09-01</p>
                        </>
                      ),
                    },
                    {
                      children: (
                        <>
                          <p>Technical testing 1</p>
                          <p>Technical testing 2</p>
                          <p>Technical testing 3 2015-09-01</p>
                        </>
                      ),
                    },
                    {
                      color: 'gray',
                      children: (
                        <>
                          <p>Technical testing 1</p>
                          <p>Technical testing 2</p>
                          <p>Technical testing 3 2015-09-01</p>
                        </>
                      ),
                    },
                    {
                      color: 'gray',
                      children: (
                        <>
                          <p>Technical testing 1</p>
                          <p>Technical testing 2</p>
                          <p>Technical testing 3 2015-09-01</p>
                        </>
                      ),
                    },
                  ]}
                />
              </Cards>
            </TimelineNormalWrap>

            <TimelineNormalWrap>
              <Cards title="Right alternate" caption="The simplest use of Timelines">
                <Timeline
                  mode="right"
                  items={[
                    { children: 'Create a services site 2015-09-01' },
                    { children: 'Solve initial network problems 2015-09-01' },
                    {
                      dot: <ClockCircleOutlined className="font-size-16" />,
                      color: 'red',
                      children: 'Technical testing 2015-09-01',
                    },
                    { children: 'Network problems being solved 2015-09-01' },
                  ]}
                />
              </Cards>
            </TimelineNormalWrap>
          </Col>
        </Row>
      </Main>
    </>
  );
}

export default Timelines;
