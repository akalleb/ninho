'use client';

import React, { useEffect } from 'react';
import { Radio, Table } from 'antd';
import { useDispatch, useSelector } from 'react-redux';
import { CardGroup } from '../../style';
import { Cards } from '../../../../components/cards/frame/cards-frame';
import { socialTrafficGetData, socialTrafficFilterData } from '../../../../redux/chartContent/actionCreator';

function SocialTrafficMetrics() {
  const dispatch = useDispatch();
  const { socialTrafficState } = useSelector(state => {
    return {
      socialTrafficState: state.chartContent.socialTrafficData,
      soIsLoading: state.chartContent.soLoading,
    };
  });

  useEffect(() => {
    if (socialTrafficGetData) {
      dispatch(socialTrafficGetData());
    }
  }, [dispatch]);

  const moreContent = (
    <>
      <a href="#">
        <span>2 years</span>
      </a>
      <a href="#">
        <span>3 years</span>
      </a>
      <a href="#">
        <span>4 years</span>
      </a>
    </>
  );

  const trafficTableColumns = [
    {
      dataIndex: 'network',
      key: 'network',
    },
    {
      title: 'Acquisition',
      dataIndex: 'users',
      key: 'users',
    },
    {
      dataIndex: 'newUsers',
      key: 'newUsers',
    },
    {
      dataIndex: 'sessions',
      key: 'sessions',
    },
    {
      title: 'Behavior',
      dataIndex: 'bounceRate',
      key: 'bounceRate',
    },
    {
      dataIndex: 'pages',
      key: 'pages',
    },
    {
      dataIndex: 'avg',
      key: 'avg',
    },
  ];

  const { facebook, twitter, youtube, linkdin, pinterest, google } = socialTrafficState !== null && socialTrafficState;

  const trafficTableData =
    socialTrafficState !== null
      ? [
          {
            key: '1',
            network: <span className="traffic-title">Social Network</span>,
            users: <span className="traffic-title">Users</span>,
            newUsers: <span className="traffic-title">New Users</span>,
            sessions: <span className="traffic-title">Sessions</span>,
            bounceRate: <span className="traffic-title">Bounce Rate</span>,
            pages: <span className="traffic-title">Pages / Session</span>,
            avg: <span className="traffic-title">Avg. Session Duration</span>,
          },
          {
            key: '2',
            network: (
              <span className="social-name cursor-pointer">
                Facebook
              </span>
            ),
            users: facebook.users,
            newUsers: facebook.newUsers,
            sessions: facebook.session,
            bounceRate: facebook.bounceRate,
            pages: facebook.pagesSession,
            avg: facebook.avg,
          },
          {
            key: '3',
            network: (
              <span className="social-name cursor-pointer">
                Twitter
              </span>
            ),
            users: twitter.users,
            newUsers: twitter.newUsers,
            sessions: twitter.session,
            bounceRate: twitter.bounceRate,
            pages: twitter.pagesSession,
            avg: twitter.avg,
          },
          {
            key: '4',
            network: (
              <span className="social-name cursor-pointer">
                Linkdin
              </span>
            ),
            users: linkdin.users,
            newUsers: linkdin.newUsers,
            sessions: linkdin.session,
            bounceRate: linkdin.bounceRate,
            pages: linkdin.pagesSession,
            avg: linkdin.avg,
          },
          {
            key: '5',
            network: (
              <span className="social-name cursor-pointer">
                Youtube
              </span>
            ),
            users: youtube.users,
            newUsers: youtube.newUsers,
            sessions: youtube.session,
            bounceRate: youtube.bounceRate,
            pages: youtube.pagesSession,
            avg: youtube.avg,
          },
          {
            key: '6',
            network: (
              <span className="social-name cursor-pointer">
                Pinterest
              </span>
            ),
            users: pinterest.users,
            newUsers: pinterest.newUsers,
            sessions: pinterest.session,
            bounceRate: pinterest.bounceRate,
            pages: pinterest.pagesSession,
            avg: pinterest.avg,
          },
          {
            key: '7',
            network: (
              <span className="social-name cursor-pointer">
                Google+
              </span>
            ),
            users: google.users,
            newUsers: google.newUsers,
            sessions: google.session,
            bounceRate: google.bounceRate,
            pages: google.pagesSession,
            avg: google.avg,
          },
        ]
      : [];

  const socialTraffic = e => {
    dispatch(socialTrafficFilterData(e.target.value));
  };

  return (
    <CardGroup>
      <div className="full-width-table">
        <Cards
          isbutton={
            <div className="card-radio">
              <Radio.Group onChange={socialTraffic} defaultValue="today">
                <Radio.Button value="today">Today</Radio.Button>
                <Radio.Button value="week">Week</Radio.Button>
                <Radio.Button value="month">Month</Radio.Button>
                <Radio.Button value="year">Year</Radio.Button>
              </Radio.Group>
            </div>
          }
          title="Social Traffic Metrics"
          size="large"
          more={moreContent}
        >
          <div className="traffic-table table-responsive">
            <Table columns={trafficTableColumns} dataSource={trafficTableData} pagination={false} />
          </div>
        </Cards>
      </div>
    </CardGroup>
  );
}

export default SocialTrafficMetrics;
