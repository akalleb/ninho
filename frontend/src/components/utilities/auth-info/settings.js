import React from 'react';
import FeatherIcon from 'feather-icons-react';
import { Row, Col } from 'antd';
import { SettingDropdwon } from './auth-info-style';
import { Popover } from '../../popup/popup';
import Heading from '../../heading/heading';
import documentIcon from '../../../static/img/icon/014-document.png';
import colorPaletteIcon from '../../../static/img/icon/015-color-palette.png';
import homeIcon from '../../../static/img/icon/010-home.png';
import videoCameraIcon from '../../../static/img/icon/017-video-camera.png';
import document1Icon from '../../../static/img/icon/013-document-1.png';
import microphoneIcon from '../../../static/img/icon/007-microphone-1.png';

function Settings() {
  const content = (
    <SettingDropdwon>
      <div className="setting-dropdwon">
        <Row gutter="10">
          <Col sm={12}>
            <figure className="setting-dropdwon__single d-flex">
              <img src={documentIcon} alt="" />
              <figcaption>
                <Heading as="h5">All Features</Heading>
                <p>Introducing Increment subscriptions </p>
              </figcaption>
            </figure>
          </Col>
          <Col sm={12}>
            <figure className="setting-dropdwon__single d-flex">
              <img src={colorPaletteIcon} alt="" />
              <figcaption>
                <Heading as="h5">Themes</Heading>
                <p>Third party themes that are compatible </p>
              </figcaption>
            </figure>
          </Col>
          <Col sm={12}>
            <figure className="setting-dropdwon__single d-flex">
              <img src={homeIcon} alt="" />
              <figcaption>
                <Heading as="h5">Payments</Heading>
                <p>We handle billions of dollars </p>
              </figcaption>
            </figure>
          </Col>
          <Col sm={12}>
            <figure className="setting-dropdwon__single d-flex">
              <img src={videoCameraIcon} alt="" />
              <figcaption>
                <Heading as="h5">Design Mockups</Heading>
                <p>Share planning visuals with clients </p>
              </figcaption>
            </figure>
          </Col>
          <Col sm={12}>
            <figure className="setting-dropdwon__single d-flex">
              <img src={document1Icon} alt="" />
              <figcaption>
                <Heading as="h5">Content Planner</Heading>
                <p>Centralize content gathering and editing</p>
              </figcaption>
            </figure>
          </Col>
          <Col sm={12}>
            <figure className="setting-dropdwon__single d-flex">
              <img src={microphoneIcon} alt="" />
              <figcaption>
                <Heading as="h5">Diagram Maker</Heading>
                <p>Plan user flows & test scenarios</p>
              </figcaption>
            </figure>
          </Col>
        </Row>
      </div>
    </SettingDropdwon>
  );

  return (
    <div className="settings">
      <Popover placement="bottomRight" content={content} action="click">
        <span className="head-example" style={{ cursor: 'pointer', display: 'inline-block' }}>
          <FeatherIcon icon="settings" size={20} />
        </span>
      </Popover>
    </div>
  );
}

export default Settings;
