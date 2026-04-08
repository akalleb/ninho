import React from 'react';
import FeatherIcon from 'feather-icons-react';
import { ActivityContents } from './style';
import { Cards } from '../../../../components/cards/frame/cards-frame';
import { Dropdown } from '../../../../components/dropdown/dropdown';
import chatAuthorT1Img from '../../../../static/img/chat-author/t1.jpg';
import chatAuthorT2Img from '../../../../static/img/chat-author/t2.jpg';
import chatAuthorT3Img from '../../../../static/img/chat-author/t3.jpg';
import chatAuthorT4Img from '../../../../static/img/chat-author/t4.jpg';
import chatAuthorT5Img from '../../../../static/img/chat-author/t5.png';
import chatAuthorT6Img from '../../../../static/img/chat-author/t6.png';
import chatAuthorT7Img from '../../../../static/img/chat-author/t7.png';
import chatAuthorT8Img from '../../../../static/img/chat-author/t8.png';

function ActivityContent() {
  return (
    <ActivityContents>
      <Cards headless>
        <ul className="activity-list">
          <li className="activity-list__single">
            <span className="activity-icon primary">
              <FeatherIcon icon="inbox" size={14} />
            </span>
            <div className="activity-content">
              <div className="activity-info">
                <img src={chatAuthorT1Img} alt="" />
                <p>
                  <span className="inline-text color-primary">James</span> Send you a message{' '}
                  <span className="hour">5 hours ago</span>
                </p>
              </div>
              <span className="activity-more cursor-pointer d-inline-block">
                <Dropdown
                  action={['click']}
                  content={
                    <>
                      <a href="#" className="cursor-pointer d-flex align-items-center">
                        <span>Hide</span>
                      </a>
                      <a href="#" className="cursor-pointer d-flex align-items-center">
                        <span>Delete</span>
                      </a>
                    </>
                  }
                >
                  <FeatherIcon icon="more-horizontal" />
                </Dropdown>
              </span>
            </div>
          </li>
          <li className="activity-list__single">
            <span className="activity-icon secondary">
              <FeatherIcon icon="upload" size={14} />
            </span>
            <div className="activity-content">
              <div className="activity-info">
                <img src={chatAuthorT2Img} alt="" />
                <p>
                  <span className="inline-text color-primary">Adam </span>upload website template for sale{' '}
                  <span className="hour">5 hours ago</span>
                </p>
              </div>
              <span className="activity-more cursor-pointer d-inline-block">
                <Dropdown
                  action={['click']}
                  content={
                    <>
                      <a href="#" className="cursor-pointer d-flex align-items-center">
                        <span>Hide</span>
                      </a>
                      <a href="#" className="cursor-pointer d-flex align-items-center">
                        <span>Delete</span>
                      </a>
                    </>
                  }
                >
                  <FeatherIcon icon="more-horizontal" />
                </Dropdown>
              </span>
            </div>
          </li>
          <li className="activity-list__single">
            <span className="activity-icon success">
              <FeatherIcon icon="log-out" size={14} />
            </span>
            <div className="activity-content">
              <div className="activity-info">
                <img src={chatAuthorT3Img} alt="" />
                <p>
                  <span className="inline-text color-primary">Mumtahin</span> has registered{' '}
                  <span className="hour">5 hours ago</span>
                </p>
              </div>
              <span className="activity-more cursor-pointer d-inline-block">
                <Dropdown
                  action={['click']}
                  content={
                    <>
                      <a href="#" className="cursor-pointer d-flex align-items-center">
                        <span>Hide</span>
                      </a>
                      <a href="#" className="cursor-pointer d-flex align-items-center">
                        <span>Delete</span>
                      </a>
                    </>
                  }
                >
                  <FeatherIcon icon="more-horizontal" />
                </Dropdown>
              </span>
            </div>
          </li>
          <li className="activity-list__single">
            <span className="activity-icon info">
              <FeatherIcon icon="at-sign" size={14} />
            </span>
            <div className="activity-content">
              <div className="activity-info">
                <img src={chatAuthorT4Img} alt="" />
                <p>
                  <span className="inline-text color-primary">James</span> Send you a message{' '}
                  <span className="hour">5 hours ago</span>
                </p>
              </div>
              <span className="activity-more cursor-pointer d-inline-block">
                <Dropdown
                  action={['click']}
                  content={
                    <>
                      <a href="#" className="cursor-pointer d-flex align-items-center">
                        <span>Hide</span>
                      </a>
                      <a href="#" className="cursor-pointer d-flex align-items-center">
                        <span>Delete</span>
                      </a>
                    </>
                  }
                >
                  <FeatherIcon icon="more-horizontal" />
                </Dropdown>
              </span>
            </div>
          </li>
          <li className="activity-list__single">
            <span className="activity-icon danger">
              <FeatherIcon icon="heart" size={14} />
            </span>
            <div className="activity-content">
              <div className="activity-info">
                <img src={chatAuthorT5Img} alt="" />
                <p>
                  <span className="inline-text color-primary">Adam</span> upload website template for sale{' '}
                  <span className="hour">5 hours ago</span>
                </p>
              </div>
              <span className="activity-more cursor-pointer d-inline-block">
                <Dropdown
                  action={['click']}
                  content={
                    <>
                      <a href="#" className="cursor-pointer d-flex align-items-center">
                        <span>Hide</span>
                      </a>
                      <a href="#" className="cursor-pointer d-flex align-items-center">
                        <span>Delete</span>
                      </a>
                    </>
                  }
                >
                  <FeatherIcon icon="more-horizontal" />
                </Dropdown>
              </span>
            </div>
          </li>
          <li className="activity-list__single">
            <span className="activity-icon warning">
              <FeatherIcon icon="message-square" size={14} />
            </span>
            <div className="activity-content">
              <div className="activity-info">
                <img src={chatAuthorT1Img} alt="" />
                <p>
                  <span className="inline-text color-primary">Mumtahin</span> has registered{' '}
                  <span className="hour">5 hours ago</span>
                </p>
              </div>
              <span className="activity-more cursor-pointer d-inline-block">
                <Dropdown
                  action={['click']}
                  content={
                    <>
                      <a href="#" className="cursor-pointer d-flex align-items-center">
                        <span>Hide</span>
                      </a>
                      <a href="#" className="cursor-pointer d-flex align-items-center">
                        <span>Delete</span>
                      </a>
                    </>
                  }
                >
                  <FeatherIcon icon="more-horizontal" />
                </Dropdown>
              </span>
            </div>
          </li>
          <li className="activity-list__single">
            <span className="activity-icon info">
              <FeatherIcon icon="at-sign" size={14} />
            </span>
            <div className="activity-content">
              <div className="activity-info">
                <img src={chatAuthorT6Img} alt="" />
                <p>
                  <span className="inline-text color-primary">James</span> Send you a message{' '}
                  <span className="hour">5 hours ago</span>
                </p>
              </div>
              <span className="activity-more cursor-pointer d-inline-block">
                <Dropdown
                  action={['click']}
                  content={
                    <>
                      <a href="#" className="cursor-pointer d-flex align-items-center">
                        <span>Hide</span>
                      </a>
                      <a href="#" className="cursor-pointer d-flex align-items-center">
                        <span>Delete</span>
                      </a>
                    </>
                  }
                >
                  <FeatherIcon icon="more-horizontal" />
                </Dropdown>
              </span>
            </div>
          </li>
          <li className="activity-list__single">
            <span className="activity-icon warning">
              <FeatherIcon icon="heart" size={14} />
            </span>
            <div className="activity-content">
              <div className="activity-info">
                <img src={chatAuthorT7Img} alt="" />
                <p>
                  <span className="inline-text color-primary">Mumtahin</span> has registered{' '}
                  <span className="hour">5 hours ago</span>
                </p>
              </div>
              <span className="activity-more cursor-pointer d-inline-block">
                <Dropdown
                  action={['click']}
                  content={
                    <>
                      <a href="#" className="cursor-pointer d-flex align-items-center">
                        <span>Hide</span>
                      </a>
                      <a href="#" className="cursor-pointer d-flex align-items-center">
                        <span>Delete</span>
                      </a>
                    </>
                  }
                >
                  <FeatherIcon icon="more-horizontal" />
                </Dropdown>
              </span>
            </div>
          </li>
          <li className="activity-list__single">
            <span className="activity-icon danger">
              <FeatherIcon icon="message-square" size={14} />
            </span>
            <div className="activity-content">
              <div className="activity-info">
                <img src={chatAuthorT8Img} alt="" />
                <p>
                  <span className="inline-text color-primary">Adam</span> upload website template for sale{' '}
                  <span className="hour">5 hours ago</span>
                </p>
              </div>
              <span className="activity-more cursor-pointer d-inline-block">
                <Dropdown
                  action={['click']}
                  content={
                    <>
                      <a href="#" className="cursor-pointer d-flex align-items-center">
                        <span>Hide</span>
                      </a>
                      <a href="#" className="cursor-pointer d-flex align-items-center">
                        <span>Delete</span>
                      </a>
                    </>
                  }
                >
                  <FeatherIcon icon="more-horizontal" />
                </Dropdown>
              </span>
            </div>
          </li>
          <li className="activity-list__single">
            <span className="activity-icon primary">
              <FeatherIcon icon="heart" size={14} />
            </span>
            <div className="activity-content">
              <div className="activity-info">
                <img src={chatAuthorT1Img} alt="" />
                <p>
                  <span className="inline-text color-primary">James</span> Send you a message{' '}
                  <span className="hour">5 hours ago</span>
                </p>
              </div>
              <span className="activity-more cursor-pointer d-inline-block">
                <Dropdown
                  action={['click']}
                  content={
                    <>
                      <a href="#" className="cursor-pointer d-flex align-items-center">
                        <span>Hide</span>
                      </a>
                      <a href="#" className="cursor-pointer d-flex align-items-center">
                        <span>Delete</span>
                      </a>
                    </>
                  }
                >
                  <FeatherIcon icon="more-horizontal" />
                </Dropdown>
              </span>
            </div>
          </li>
        </ul>
      </Cards>
    </ActivityContents>
  );
}

export default ActivityContent;
